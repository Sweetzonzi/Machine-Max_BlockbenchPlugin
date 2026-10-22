/**
 * export_pipeline.js — 内容包导出管线（P4 从 ui/export/export_pipeline.js 迁入）
 *
 * 原 menu.js 的 _executeExport：执行内容包导出并返回统计信息。
 *
 * 目录结构遵循 Spark-Core pack 系统规范:
 *   {exportDir}/
 *     {packFolderName}/
 *       meta.json
 *       {namespace}/
 *         lang/{locale}.json
 *         models/part/{modelName}.geo.json
 *         models/hud/         ← 空目录占位
 *         parts/{partId}.json
 *         recipe/{recipeId}.json
 *         connectors/{connId}.json           （扁平）或 connectors/{model}/{connId}.json（分组）
 *         subsystems/{subId}.json            （扁平）或 subsystems/{model}/{subId}.json（分组）
 *         materials/{matId}.json
 *         textures/hud/       ← 空目录占位
 *         textures/icon/      ← 空目录占位
 *         textures/part/      ← 空目录占位
 *         huds/               ← 空目录占位
 *         animations/hud/     ← 空目录占位
 *         animations/part/    ← 空目录占位
 *         assemblies/         ← 空目录占位
 *         font/               ← 空目录占位
 *         tooltips/           ← 空目录占位
 *         templates/          ← 空目录占位
 *         docs/schemas/       ← 新包铺初始副本；已有 docs 则整批保留
 *
 * 写盘范围：本插件生成的 parts / lang / meta / geo 由生成器重写；recipe、connectors、
 * subsystems、materials、docs 只在目标缺失或 $schema 确实不对时落笔，不做整包重排。
 *
 * 导出函数:
 *   executeExport(config, packMeta, exportDir, packFolderName) — 执行导出
 */

const fs = require('fs');
const path = require('path');
const { createLogger } = require('../utils/logger.js');
const fileWriter = require('../utils/file_writer.js');
const { assertSafePartIds } = require('./safe_part_ids.js');

/** 模块日志 */
var log = createLogger('ExportPipeline');

/**
 * 只改写 JSON 文本里的 $schema 值，其余字节原样保留（注释、行尾、键序、缩进均不动）。
 *
 * 用文本替换而不用 JSON.parse + JSON.stringify 往返，是为了让"导出"不去重写
 * 本插件并不生成的文件（配方、手写的连接点/子系统/材料定义）。那些文件里的
 * `//` 注释与 CRLF 在往返序列化中会丢失。
 *
 * @param {string} raw - 原文件文本
 * @param {string} schemaPath - 期望的 $schema 值
 * @returns {string|null} 改写后的文本；原样返回表示无需改动；null 表示无法安全改写
 */
function setSchemaRef(raw, schemaPath) {
    if (typeof raw !== 'string') return null;
    var EOL = raw.indexOf('\r\n') >= 0 ? '\r\n' : '\n';

    // 已有 $schema 键：只换它的值（保留键名周围的原始空白）
    var valuePattern = /("\$schema"\s*:\s*)"(?:[^"\\]|\\.)*"/;
    if (valuePattern.test(raw)) {
        return raw.replace(valuePattern, function (_match, prefix) {
            return prefix + '"' + schemaPath + '"';
        });
    }

    // 没有 $schema 键：在首个 { 之后插一行，其余字节不动
    var open = raw.indexOf('{');
    if (open < 0) return null;
    var head = raw.slice(0, open + 1);
    var tail = raw.slice(open + 1);
    if (tail.trim().charAt(0) === '}') {
        // 空对象：插入后不留尾逗号
        return head + EOL + '  "$schema": "' + schemaPath + '"' + EOL + tail;
    }
    return head + EOL + '  "$schema": "' + schemaPath + '",' + tail;
}

/**
 * 获取当前的 locale，用于决定 $schema 引用到 zh_cn 还是 en_us
 * 简体/繁体中文 → zh_cn，其他 → en_us
 */
function getSchemaLocale() {
    var lang = '';
    if (typeof navigator !== 'undefined' && navigator.language) {
        lang = navigator.language;
    } else if (typeof Blockbench !== 'undefined' && Blockbench.locale) {
        lang = Blockbench.locale;
    }
    return (lang.indexOf('zh') === 0) ? 'zh_cn' : 'en_us';
}

/**
 * 把构建时嵌入的 __SCHEMAS__ 常量写入目标 docs 目录——只给还没有 docs 的新内容包铺初始副本。
 *
 * __SCHEMAS__ 是 { locale/relativePath: fileContent } 映射，键包含 locale 前缀（如 "en_us/schemas/..."），
 * 由 build.js 从内置内容包 docs/ 目录收集（zh_cn/ 和 en_us/ 两份）。
 *
 * 目标 docs 一旦已有内容就整批保留：包内的 docs/schemas 是包作者（或 ./gradlew syncSchemas）的副本，
 * 导出不拿插件内置快照去覆盖或增补既有文件。
 *
 * @param {string} destBaseDir - 目标 docs 根目录（{namespace}/docs）
 * @returns {{ written: number, kept: number }} 写入文件数与保留（跳过）文件数
 */
function writeSchemasFromConstant(destBaseDir) {
    var stats = { written: 0, kept: 0 };
    var schemasRaw = (typeof __SCHEMAS__ !== 'undefined') ? __SCHEMAS__ : null;
    if (!schemasRaw) {
        log.warn('writeSchemasFromConstant: __SCHEMAS__ 未注入或为空，Schema 文件将不会写入');
        return stats;
    }
    var schemas = (typeof schemasRaw === 'string') ? JSON.parse(schemasRaw) : schemasRaw;
    var keys = Object.keys(schemas);

    var hasExisting = false;
    try {
        hasExisting = fs.existsSync(destBaseDir) && fs.readdirSync(destBaseDir).length > 0;
    } catch (_e) {
        hasExisting = false;
    }
    if (hasExisting) {
        stats.kept = keys.length;
        log.info('writeSchemasFromConstant: docs 已有内容，跳过写入（内置 ' + stats.kept + ' 个副本保持不写，包内现有文件原样保留）');
        return stats;
    }

    for (var i = 0; i < keys.length; i++) {
        var relPath = keys[i];
        var destPath = path.join(destBaseDir, relPath);
        fileWriter.ensureDir(path.dirname(destPath));
        fs.writeFileSync(destPath, schemas[relPath], 'utf-8');
        stats.written++;
    }
    log.info('writeSchemasFromConstant: 新包，写入 ' + stats.written + ' 个 schema 文件');
    return stats;
}

/**
 * 递归遍历目录，为导出 JSON 注入 $schema 引用。
 *
 * 只改 $schema 那一行的文本，不重新序列化；值已经正确、或配方 type 不在映射表里
 * （未知类型无法判断该指向哪个 schema）时保持文件原样。
 *
 * @param {string} nsDir - {namespace} 目录
 * @returns {{ injected: number, unchanged: number, skipped: number, failed: number }}
 */
function injectSchemaReferences(nsDir) {
    var schemaLocale = getSchemaLocale();
    var schemaMap = {
        parts: 'docs/' + schemaLocale + '/schemas/part_definition_schema.json',
        connectors: 'docs/' + schemaLocale + '/schemas/part/subpart/connector/connector_static_attr.schema.json',
        subsystems: 'docs/' + schemaLocale + '/schemas/subsystem/subsystem_static_attr.schema.json',
        materials: 'docs/' + schemaLocale + '/schemas/base/material_attr.schema.json',
    };
    var recipeSchemaMap = {
        'machine_max:research': 'docs/' + schemaLocale + '/schemas/recipe/research_recipe.schema.json',
        'machine_max:fabricating': 'docs/' + schemaLocale + '/schemas/recipe/fabricating_recipe.schema.json',
        'machine_max:part_fabricating': 'docs/' + schemaLocale + '/schemas/recipe/part_fabricating_recipe.schema.json',
        'machine_max:blueprint_research': 'docs/' + schemaLocale + '/schemas/recipe/blueprint_research_recipe.schema.json',
    };
    var stats = { injected: 0, unchanged: 0, skipped: 0, failed: 0 };
    var dirs = ['parts', 'connectors', 'subsystems', 'materials', 'recipe'];
    for (var d = 0; d < dirs.length; d++) {
        var typeDir = path.join(nsDir, dirs[d]);
        if (!fs.existsSync(typeDir)) continue;
        walkAndInject(typeDir, nsDir, dirs[d], schemaMap, recipeSchemaMap, stats);
    }
    log.info('注入 $schema: 改写 ' + stats.injected + '，已正确 ' + stats.unchanged +
        '，跳过 ' + stats.skipped + '，失败 ' + stats.failed);
    return stats;
}

function walkAndInject(currentDir, nsDir, typeName, schemaMap, recipeSchemaMap, stats) {
    var entries = fs.readdirSync(currentDir);
    for (var e = 0; e < entries.length; e++) {
        var fullPath = path.join(currentDir, entries[e]);
        var stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkAndInject(fullPath, nsDir, typeName, schemaMap, recipeSchemaMap, stats);
        } else if (entries[e].endsWith('.json')) {
            try {
                var rawContent = fs.readFileSync(fullPath, 'utf8');
                var schemaRel;
                if (typeName === 'recipe') {
                    // 解析一次只为读 type；文件内容仍按原文改写
                    var content = JSON.parse(fileWriter.stripJsonComments(rawContent));
                    schemaRel = recipeSchemaMap[content.type];
                } else {
                    schemaRel = schemaMap[typeName];
                }
                if (!schemaRel) {
                    // 未知配方 type：不同 schema 之间字段不通用，乱指一个比不指更糟
                    stats.skipped++;
                    log.debug('跳过 $schema 注入（未识别的类型）: ' + fullPath);
                    continue;
                }
                var relDir = path.relative(path.dirname(fullPath), nsDir);
                var schemaPath = path.join(relDir, schemaRel).replace(/\\/g, '/');
                var next = setSchemaRef(rawContent, schemaPath);
                if (next === null) {
                    stats.failed++;
                    log.warn('注入 $schema 失败（无法定位插入点）: ' + fullPath);
                    continue;
                }
                if (next === rawContent) {
                    stats.unchanged++;
                    continue;
                }
                fs.writeFileSync(fullPath, next, 'utf8');
                stats.injected++;
            } catch (_err) {
                stats.failed++;
                log.warn('注入 $schema 失败: ' + fullPath, _err);
            }
        }
    }
}

/**
 * 执行内容包导出，返回统计信息
 *
 * @param {Object} config - MMProjectConfig
 * @param {Object} packMeta - 覆盖的包元数据
 * @param {string} exportDir - 用户选择的导出根目录
 * @param {string} packFolderName - 包文件夹名称
 * @returns {{ parts: number, connectors: number, subsystems: number, materials: number, langs: number }}
 */
function executeExport(config, packMeta, exportDir, packFolderName) {
    // 任何 mkdir / writeFile 之前先拦下不安全 partId（docs/13 §4.3）
    assertSafePartIds(config);

    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    // 包文件夹根（包装层）
    var packRoot = path.join(exportDir, packFolderName);
    if (!fs.existsSync(packRoot)) {
        fs.mkdirSync(packRoot, { recursive: true });
    }

    var ns = config.namespace || 'machine_max';
    var stats = { parts: 0, connectors: 0, subsystems: 0, materials: 0, langs: 0 };
    var isFlat = packMeta.flat_export !== false;

    function _resolveTargetDir(baseDir, id, flat) {
        if (flat) return baseDir;
        var seg = id.split('_')[0];
        return (seg && seg.length > 0) ? path.join(baseDir, seg) : baseDir;
    }

    // === meta.json ===
    var genMeta = require('../generators/meta_generator.js');
    var savedPackMeta = config.packMeta;
    config.packMeta = packMeta;
    var meta = genMeta.generateMeta(config);
    config.packMeta = savedPackMeta;
    fileWriter.writeJSONFile(packRoot, 'meta.json', meta);

    // === 创建完整空目录架构 + 补充缺失 schemas ===
    var _emptyDirs = [
        'textures/hud', 'textures/icon', 'textures/part',
        'models/hud',
        'huds',
        'animations/hud', 'animations/part',
        'assemblies', 'font', 'tooltips', 'templates',
        'docs',
    ];
    var _nsDir = path.join(packRoot, ns);
    for (var _ei = 0; _ei < _emptyDirs.length; _ei++) {
        fileWriter.ensureDir(path.join(_nsDir, _emptyDirs[_ei]));
    }

    // 补充 schemas 到 {namespace}/docs/schemas/（从构建时嵌入的 __SCHEMAS__ 常量，仅补缺）
    writeSchemasFromConstant(path.join(_nsDir, 'docs'));

    // === {namespace}/models/part/{modelName}.geo.json ===
    try {
        if (typeof Codecs !== 'undefined' && Codecs.bedrock && Project) {
            var modelDir = path.join(packRoot, ns, 'models', 'part');
            var modelName = Project.geometry_name || Project.name || 'model';
            var geoContent = Codecs.bedrock.compile();
            fileWriter.writeTextFile(modelDir, modelName + '.geo.json', geoContent);
            log.info('已导出 Bedrock 几何体模型: ' + modelName + '.geo.json');
        }
    } catch (e) {
        log.warn('无法导出 Bedrock 几何体模型（可能非 Bedrock 格式）', e);
    }

    // === {namespace}/lang/{locale}.json（合并模式：保留已有条目，仅添加缺失键） ===
    var genLang = require('../generators/lang_generator.js');
    var allLangs = genLang.generateAllLangs(config);
    if (allLangs) {
        var langDir = path.join(packRoot, ns, 'lang');
        for (var locale in allLangs) {
            if (allLangs.hasOwnProperty(locale)) {
                fileWriter.mergeJSONFile(langDir, locale + '.json', allLangs[locale]);
                stats.langs++;
            }
        }
    }

    // === {namespace}/parts/{partId}.json ===
    var genParts = require('../generators/part_generator.js');
    var allParts = genParts.generateAllParts(config);
    var partsBaseDir = path.join(packRoot, ns, 'parts');
    for (var partId in allParts) {
        if (allParts.hasOwnProperty(partId)) {
            var partsTargetDir = _resolveTargetDir(partsBaseDir, partId, isFlat);
            fileWriter.writeJSONFile(partsTargetDir, partId + '.json', allParts[partId]);
            stats.parts++;
        }
    }

    // === {namespace}/recipe/（如有） ===
    if (config.recipes && Object.keys(config.recipes).length > 0) {
        var recipeDir = path.join(packRoot, ns, 'recipe');
        for (var recipeId in config.recipes) {
            if (config.recipes.hasOwnProperty(recipeId)) {
                fileWriter.writeJSONFile(recipeDir, recipeId + '.json', config.recipes[recipeId]);
            }
        }
    }

    // === 从内容包目录复制连接点/子系统/材料 ===
    var packDir = config.contentPackPath;
    if (packDir && fs.existsSync(packDir)) {
        var genConn = require('../generators/connector_generator.js');
        var genSub = require('../generators/subsystem_generator.js');
        var genMat = require('../generators/material_generator.js');

        stats.connectors = genConn.copyConnectorDefs(packDir, ns, path.join(packRoot, ns, 'connectors'), isFlat);
        stats.subsystems = genSub.copySubsystemDefs(packDir, ns, path.join(packRoot, ns, 'subsystems'), isFlat);
        stats.materials = genMat.copyMaterialDefs(packDir, ns, path.join(packRoot, ns, 'materials'));

        // 复制依赖包定义（dependency 目录下的所有 .json）
        var depSrcDir = path.join(packDir, 'dependency');
        if (fs.existsSync(depSrcDir)) {
            var depTargetDir = path.join(packRoot, 'dependency');
            fileWriter.ensureDir(depTargetDir);
            var depFiles = fs.readdirSync(depSrcDir);
            var j, depFile, depSrcFile, depContent;
            for (j = 0; j < depFiles.length; j++) {
                depFile = depFiles[j];
                if (depFile.indexOf('.json') !== depFile.length - 5) continue;
                depSrcFile = path.join(depSrcDir, depFile);
                try {
                    depContent = fs.readFileSync(depSrcFile, 'utf8');
                    fs.writeFileSync(path.join(depTargetDir, depFile), depContent, 'utf8');
                } catch (e) {
                    log.warn('复制依赖包定义失败: ' + depSrcFile, e);
                }
            }
        }
    } else {
        log.warn('内容包目录未设置或不存在，跳过连接点/子系统/材料复制: ' + packDir);
    }

    // === 为所有导出文件注入 $schema 引用（只改 $schema 行，其余字节不动） ===
    var schemaStats = injectSchemaReferences(_nsDir);

    log.info('导出完成, 零件=' + stats.parts + ', 连接点=' + stats.connectors + ', 子系统=' + stats.subsystems + ', 材料=' + stats.materials +
        ', 语言=' + stats.langs + ', 改写 $schema=' + schemaStats.injected +
        '（已正确 ' + schemaStats.unchanged + '，跳过 ' + schemaStats.skipped + '）');
    return stats;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        executeExport,
        // 以下为可独立测试的写盘单元：只碰传入的目录，不读 Project / config
        setSchemaRef,
        writeSchemasFromConstant,
        injectSchemaReferences,
    };
}
