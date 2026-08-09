/**
 * export_pipeline.js — 内容包导出管线（从 menu.js 拆出）
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
 *         docs/schemas/       ← 从构建常量复制
 *
 * 导出函数:
 *   executeExport(config, packMeta, exportDir, packFolderName) — 执行导出
 */

const { createLogger } = require('../../utils/logger.js');
const fileWriter = require('../../utils/file_writer.js');

/** 模块日志 */
var log = createLogger('ExportPipeline');

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
    var fs = require('fs');
    var path = require('path');

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

    /**
     * 从构建时嵌入的 __SCHEMAS__ 常量写入所有 schema 文件到目标目录
     * __SCHEMAS__ 是 { locale/relativePath: fileContent } 映射，键包含 locale 前缀（如 "en_us/schemas/..."），
     * 由 build.js 从内置内容包 docs/ 目录收集（zh_cn/ 和 en_us/ 两份），由本函数直接按原路径写入。
     */
    function _writeSchemasFromConstant(destBaseDir) {
        var schemasRaw = (typeof __SCHEMAS__ !== 'undefined') ? __SCHEMAS__ : null;
        if (!schemasRaw) {
            log.warn('_writeSchemasFromConstant: __SCHEMAS__ 未注入或为空，Schema 文件将不会写入');
            return;
        }
        var schemas = (typeof schemasRaw === 'string') ? JSON.parse(schemasRaw) : schemasRaw;
        var keys = Object.keys(schemas);
        for (var i = 0; i < keys.length; i++) {
            var relPath = keys[i];
            var destPath = path.join(destBaseDir, relPath);
            fileWriter.ensureDir(path.dirname(destPath));
            fs.writeFileSync(destPath, schemas[relPath], 'utf-8');
        }
        log.info('_writeSchemasFromConstant: 已写入 ' + keys.length + ' 个 schema 文件');
    }

    /**
     * 获取当前的 locale，用于决定 $schema 引用到 zh_cn 还是 en_us
     * 简体/繁体中文 → zh_cn，其他 → en_us
     */
    function _getSchemaLocale() {
        var lang = '';
        if (typeof navigator !== 'undefined' && navigator.language) {
            lang = navigator.language;
        } else if (typeof Blockbench !== 'undefined' && Blockbench.locale) {
            lang = Blockbench.locale;
        }
        return (lang.indexOf('zh') === 0) ? 'zh_cn' : 'en_us';
    }

    /**
     * 递归遍历目录，为所有导出 JSON 注入 $schema 引用
     */
    function _injectSchemaReferences(nsDir) {
        var schemaLocale = _getSchemaLocale();
        var schemaMap = {
            parts: 'docs/' + schemaLocale + '/schemas/part_definition_schema.json',
            connectors: 'docs/' + schemaLocale + '/schemas/part/subpart/connector/connector_static_attr.schema.json',
            subsystems: 'docs/' + schemaLocale + '/schemas/subsystem/subsystem_static_attr.schema.json',
            materials: 'docs/' + schemaLocale + '/schemas/base/material_attr.schema.json',
        };
        var recipeSchemaMap = {
            'machine_max:research': 'docs/' + schemaLocale + '/schemas/recipe/research_recipe.schema.json',
            'machine_max:fabricating': 'docs/' + schemaLocale + '/schemas/recipe/fabricating_recipe.schema.json',
            'machine_max:blueprint_research': 'docs/' + schemaLocale + '/schemas/recipe/blueprint_research_recipe.schema.json',
        };
        var dirs = ['parts', 'connectors', 'subsystems', 'materials', 'recipe'];
        for (var d = 0; d < dirs.length; d++) {
            var typeDir = path.join(nsDir, dirs[d]);
            if (!fs.existsSync(typeDir)) continue;
            _walkAndInject(typeDir, nsDir, dirs[d], schemaMap, recipeSchemaMap);
        }
    }

    function _walkAndInject(currentDir, nsDir, typeName, schemaMap, recipeSchemaMap) {
        var entries = fs.readdirSync(currentDir);
        for (var e = 0; e < entries.length; e++) {
            var fullPath = path.join(currentDir, entries[e]);
            var stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                _walkAndInject(fullPath, nsDir, typeName, schemaMap, recipeSchemaMap);
            } else if (entries[e].endsWith('.json')) {
                try {
                    var rawContent = fs.readFileSync(fullPath, 'utf8');
                    var content = JSON.parse(fileWriter.stripJsonComments(rawContent));
                    var schemaRel;
                    if (typeName === 'recipe') {
                        schemaRel = recipeSchemaMap[content.type] || 'docs/schemas/recipe/research_recipe.schema.json';
                    } else {
                        schemaRel = schemaMap[typeName];
                    }
                    if (!schemaRel) continue;
                    var relDir = path.relative(path.dirname(fullPath), nsDir);
                    var schemaPath = path.join(relDir, schemaRel).replace(/\\/g, '/');
                    content['$schema'] = schemaPath;
                    fs.writeFileSync(fullPath, JSON.stringify(content, null, 2), 'utf8');
                } catch (_err) {
                    log.warn('注入 $schema 失败: ' + fullPath, _err);
                }
            }
        }
    }

    // === meta.json ===
    var genMeta = require('../../generators/meta_generator.js');
    var savedPackMeta = config.packMeta;
    config.packMeta = packMeta;
    var meta = genMeta.generateMeta(config);
    config.packMeta = savedPackMeta;
    fileWriter.writeJSONFile(packRoot, 'meta.json', meta);

    // === 创建完整空目录架构 + 复制 schemas ===
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

    // 复制 schemas 到 {namespace}/docs/schemas/（从构建时嵌入的 __SCHEMAS__ 常量）
    _writeSchemasFromConstant(path.join(_nsDir, 'docs'));

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
    var genLang = require('../../generators/lang_generator.js');
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
    var genParts = require('../../generators/part_generator.js');
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
        var genConn = require('../../generators/connector_generator.js');
        var genSub = require('../../generators/subsystem_generator.js');
        var genMat = require('../../generators/material_generator.js');

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

    // === 为所有导出文件注入 $schema 引用 ===
    _injectSchemaReferences(_nsDir);

    log.info('导出完成, 零件=' + stats.parts + ', 连接点=' + stats.connectors + ', 子系统=' + stats.subsystems + ', 材料=' + stats.materials + ', 语言=' + stats.langs);
    return stats;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        executeExport,
    };
}
