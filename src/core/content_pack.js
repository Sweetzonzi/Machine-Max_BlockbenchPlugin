/**
 * content_pack.js — 内容包目录 I/O 模块
 *
 * 负责内容包定义在磁盘上的读写操作，是所有内容包重构工作的基础设施层。
 * 封装了 meta.json 管理、定义文件（materials/connectors/subsystems/control_groups/projectiles）的
 * CRUD 操作、目录结构校验和创建等功能。支持的类型: materials, connectors, subsystems, control_groups, projectiles。
 *
 * 设计原则:
 * - 每次调用从磁盘读取最新数据，不缓存
 * - 写操作使用 ensureDir 自动创建目录
 * - 读操作递归扫描子目录以兼容旧包结构
 * - 所有 I/O 操作用 try-catch 包裹
 */

const fs = require('fs');
const path = require('path');
const { createLogger } = require('../utils/logger.js');
const { BUILTIN_PACK_ID } = require('./constants.js');
const {
    ensureDir,
    writeJSONFile,
    readJSONFile,
    fileExists,
    stripJsonComments,
} = require('../utils/file_writer.js');
const zip_reader = require('./zip_reader.js');

/** 模块日志 */
var log = createLogger('ContentPack');

/** 项目根目录（从 src/core/ 向上两级） */
const ROOT = path.join(__dirname, '..', '..');
const SCHEMAS_DIR = path.join(ROOT, 'schemas');

/**
 * 内容命名空间下会出现的一级子目录名。
 *
 * 用于判断包内的某个一级目录是不是命名空间：Spark-Core 的规则是「文件路径的
 * 第一段即命名空间」，一个包可以有多个命名空间（与原版资源包 / 数据包一致），
 * 命名空间名与包 id 无关。因此只能看目录里有没有内容子目录，不能拿 id 推。
 */
const CONTENT_DIR_NAMES = {
    materials: true,
    connectors: true,
    subsystems: true,
    control_groups: true,
    projectiles: true,
    parts: true,
    models: true,
    animations: true,
    particles: true,
    textures: true,
    documents: true,
    lang: true,
    huds: true,
    hud_layouts: true,
    fittings: true,
    templates: true,
    assemblies: true,
    blueprints: true,
    recipe: true,
    sounds: true,
    fmod: true,
    tooltips: true,
    font: true,
};

/**
 * 合法命名空间：小写 ASCII 字母、数字、`_`、`-`（进 resource location，不含点）。
 *
 * core 层不能 require `doc/keys.js`（会反转 core → doc 的分层），所以这里保留
 * 一份字符集判据；`doc/keys.isValidNamespace` 与它同源，测试里两边对齐。
 */
const NAMESPACE_RE = /^[a-z0-9_-]+$/;

/**
 * 判断命名空间名是否合法。
 * @param {*} ns
 * @returns {boolean}
 */
function isValidNamespace(ns) {
    return typeof ns === 'string' && NAMESPACE_RE.test(ns);
}

/**
 * 由包 id 推断创建新包时的默认导出命名空间。
 *
 * 顺序：冒号后的后缀（`k17:my_pack` → `my_pack`）→ 冒号前的前缀 → 空串。
 * 只返回合法名字；不合法就当没有候选，由调用方报错。
 *
 * @param {string} packId - meta.id
 * @returns {string} 合法命名空间或 ''
 */
function defaultExportNamespace(packId) {
    var str = packId || '';
    var i = str.indexOf(':');
    var suffix = i >= 0 ? str.substring(i + 1) : '';
    if (isValidNamespace(suffix)) return suffix;
    var prefix = resolveNamespace(str);
    return isValidNamespace(prefix) ? prefix : '';
}

/**
 * 解析本次导出要写入的命名空间目录。
 *
 * 顺序：`config.namespace`（合法时）→ 包内已有目录按 `meta.id` 选主命名空间
 * （`pickPrimaryNamespace`）→ `machine_max`。返回的目录就是
 * `{导出目录}/{包文件夹}/{ns}/` 里的那一段，导出对话框会显示出来。
 *
 * @param {string} packPath - 当前内容包目录
 * @param {string} configured - config.namespace
 * @returns {string} 命名空间
 */
function pickExportNamespace(packPath, configured) {
    var meta;
    var picked;
    if (isValidNamespace(configured)) return configured;
    if (packPath) {
        meta = readPackMeta(packPath);
        picked = pickPrimaryNamespace(listNamespaces(packPath), meta && meta.id);
        if (picked) return picked;
    }
    return 'machine_max';
}


// =============================================================================
// 内部工具函数
// =============================================================================

/**
 * 递归遍历目录，收集所有指定扩展名的文件
 * @param {string} dir - 起始目录路径
 * @param {string} ext - 文件扩展名（含点号，如 '.json'）
 * @returns {Array<{filePath: string, id: string}>} 文件信息数组
 */
function walkDefFiles(dir, ext) {
    var results, entries, i, j, entryName, fullPath, stat, subResults, defId;
    results = [];
    if (!fs.existsSync(dir)) {
        log.warn('walkDefFiles: 目录不存在 ' + dir);
        return results;
    }

    try {
        entries = fs.readdirSync(dir);
        log.info('walkDefFiles: 扫描目录 ' + dir + ' 找到 ' + entries.length + ' 个条目');
        for (i = 0; i < entries.length; i++) {
            entryName = entries[i];
            fullPath = path.join(dir, entryName);
            stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                subResults = walkDefFiles(fullPath, ext);
                for (j = 0; j < subResults.length; j++) {
                    results.push(subResults[j]);
                }
            } else if (path.extname(entryName) === ext) {
                defId = path.basename(entryName, ext);
                results.push({ filePath: fullPath, id: defId });
                log.info('walkDefFiles: 找到文件 id=' + defId + ' path=' + fullPath);
            }
        }
    } catch (e) {
        log.warn('walkDefFiles: 遍历目录失败 ' + dir, e);
    }
    return results;
}

/**
 * 递归复制目录（用于将 schemas/ 复制到内容包的 docs/）
 * @param {string} srcDir - 源目录
 * @param {string} destDir - 目标目录
 */
function copyDirRecursive(srcDir, destDir) {
    var entries, i, srcPath, destPath, stat;

    if (!fs.existsSync(srcDir)) {
        log.warn('copyDirRecursive: 源目录不存在 ' + srcDir);
        return;
    }

    ensureDir(destDir);

    entries = fs.readdirSync(srcDir);
    for (i = 0; i < entries.length; i++) {
        srcPath = path.join(srcDir, entries[i]);
        destPath = path.join(destDir, entries[i]);
        stat = fs.statSync(srcPath);

        if (stat.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else {
            try {
                fs.writeFileSync(destPath, fs.readFileSync(srcPath));
                log.debug('copyDirRecursive: 已复制 ' + srcPath + ' → ' + destPath);
            } catch (e) {
                log.warn('copyDirRecursive: 复制文件失败 ' + srcPath, e);
            }
        }
    }
}

// =============================================================================
// ZIP 内容包辅助函数
// =============================================================================

/**
 * 判断给定路径是否指向 ZIP 格式的内容包
 * @param {string} p - 文件系统路径
 * @returns {boolean}
 */
function _isZipPath(p) {
    if (!p || typeof p !== 'string') return false;
    return p.toLowerCase().endsWith('.zip');
}

/**
 * 判断目录是否像一个内容命名空间（内部至少有一个内容子目录）
 *
 * @param {string} dirPath - 候选目录
 * @returns {boolean}
 */
function _looksLikeContentDir(dirPath) {
    var entries, i, stat, name;
    try {
        entries = fs.readdirSync(dirPath);
    } catch (e) {
        return false;
    }
    for (i = 0; i < entries.length; i++) {
        name = entries[i];
        if (!CONTENT_DIR_NAMES[name]) continue;
        try {
            stat = fs.statSync(path.join(dirPath, name));
        } catch (e) {
            continue;
        }
        if (stat.isDirectory()) return true;
    }
    return false;
}

/**
 * 列出目录形式内容包的命名空间（包内一级子目录，且内部有内容子目录）
 *
 * @param {string} packDir - 内容包根目录
 * @returns {string[]} 命名空间名（未排序）
 */
function _listDirNamespaces(packDir) {
    var result = [];
    var entries, i, name, fullPath, stat;
    try {
        entries = fs.readdirSync(packDir);
    } catch (e) {
        log.warn('listNamespaces: 无法读取目录 ' + packDir, e);
        return result;
    }
    for (i = 0; i < entries.length; i++) {
        name = entries[i];
        if (name.charAt(0) === '.') continue;
        // 目录名不是合法命名空间（大写、空格、点…）时跳过：它不可能被 `{ns}:path` 引用，
        // 当候选只会让导出 / 主命名空间选择写出非法目录
        if (!isValidNamespace(name)) continue;
        fullPath = path.join(packDir, name);
        try {
            stat = fs.statSync(fullPath);
        } catch (e) {
            continue;
        }
        if (!stat.isDirectory()) continue;
        if (_looksLikeContentDir(fullPath)) result.push(name);
    }
    return result;
}

/**
 * 列出 ZIP 形式内容包的命名空间（条目路径的第一段）
 *
 * 只统计 `{ns}/{内容子目录}/...` 形式的条目，因此根目录的 meta.json、
 * 说明文档等不会被误当命名空间。
 *
 * @param {string} zipPath - ZIP 内容包路径
 * @returns {string[]} 命名空间名（未排序）
 */
function _listZipNamespaces(zipPath) {
    var result = [];
    var seen = {};
    var handle, files, i, parts;
    handle = zip_reader.openZip(zipPath);
    if (!handle) {
        log.warn('listNamespaces: 无法打开 ZIP ' + zipPath);
        return result;
    }
    files = handle.listFiles();
    for (i = 0; i < files.length; i++) {
        parts = files[i].split('/');
        if (parts.length < 3) continue;
        if (!CONTENT_DIR_NAMES[parts[1]]) continue;
        if (!parts[0] || seen[parts[0]]) continue;
        if (!isValidNamespace(parts[0])) continue;
        seen[parts[0]] = true;
        result.push(parts[0]);
    }
    return result;
}

/**
 * 列出内容包实际拥有的命名空间
 *
 * 命名空间由包内目录结构决定，与 meta.id 无关：`machine_max:m1a2_sep` 的包
 * 内容可以放在 `m1a2_sep/` 目录里（本项目就是这样），也可以放 `machine_max/`。
 *
 * @param {string} packPath - 内容包根目录或 ZIP 路径
 * @returns {string[]} 排序后的命名空间名；读不到时返回 []
 */
function listNamespaces(packPath) {
    var result;
    if (!packPath) return [];
    result = _isZipPath(packPath)
        ? _listZipNamespaces(packPath)
        : _listDirNamespaces(packPath);
    result.sort();
    return result;
}

/**
 * 从多个命名空间中选一个「主命名空间」
 *
 * 新建零件、生成语言键、导出都只写一个命名空间目录，所以要有一个确定的默认值。
 * 选择顺序：
 *   1. 与包 id 冒号后的名字同名（machine_max:m1a2_sep → m1a2_sep）
 *   2. 唯一的一个命名空间
 *   3. machine_max（共享定义池）
 *   4. 字典序第一个
 *
 * @param {string[]} namespaces - listNamespaces 的结果
 * @param {string} packId - meta.id
 * @returns {string} 主命名空间，没有候选时返回 ''
 */
function pickPrimaryNamespace(namespaces, packId) {
    var suffix = '';
    var i;
    if (!namespaces || namespaces.length === 0) return '';
    if (packId && typeof packId === 'string') {
        i = packId.indexOf(':');
        if (i >= 0) suffix = packId.substring(i + 1);
    }
    if (suffix && namespaces.indexOf(suffix) >= 0) return suffix;
    if (namespaces.length === 1) return namespaces[0];
    if (namespaces.indexOf('machine_max') >= 0) return 'machine_max';
    return namespaces[0];
}

/**
 * 由包路径与 meta 计算命名空间列表与主命名空间
 *
 * 包内一个内容目录都没有时退回包 id 前缀（旧包 / 只有 meta.json 的空壳），
 * 这样「先填路径、稍后再补内容」的流程仍然可用。
 *
 * @param {string} packPath - 内容包路径
 * @param {Object|null} meta - meta.json
 * @returns {{namespaces: string[], namespace: string}}
 */
function _resolvePackNamespaces(packPath, meta) {
    var namespaces = listNamespaces(packPath);
    var id = meta && typeof meta.id === 'string' ? meta.id : '';
    var fallback = resolveNamespace(id);
    if (namespaces.length === 0 && fallback) {
        log.warn('openContentPack: 包内没有内容目录，回退到 id 前缀命名空间 ' + fallback + '（' + packPath + '）');
        namespaces = [fallback];
    }
    return {
        namespaces: namespaces,
        namespace: pickPrimaryNamespace(namespaces, id),
    };
}

/**
 * 从 ZIP 内容包中递归收集指定类型的所有定义文件
 *
 * 列出 ZIP 中所有文件，筛选路径匹配 {namespace}/{type}/ 前缀且
 * 以 .json 结尾的文件，读取并解析每个 .json 文件。
 *
 * @param {string} zipPath - ZIP 文件的绝对路径
 * @param {string} namespace - 命名空间
 * @param {'materials'|'connectors'|'subsystems'|'control_groups'|'projectiles'} type - 定义类型
 * @returns {Object<string, Object>} { [defId]: parsedData }
 */
function _readZipDefs(zipPath, namespace, type) {
    var handle, allFiles, prefix, i, filePath, contentStr, defId, parsed;
    var result = {};

    handle = zip_reader.openZip(zipPath);
    if (!handle) {
        log.warn('_readZipDefs: 无法打开 ZIP ' + zipPath);
        return result;
    }

    allFiles = handle.listFiles();
    prefix = namespace + '/' + type + '/';

    log.info('_readZipDefs: 开始读取 ' + type + ' ZIP=' + zipPath + ' 前缀=' + prefix + ' 总文件数=' + allFiles.length);

    for (i = 0; i < allFiles.length; i++) {
        filePath = allFiles[i];

        // 筛选：路径以 {ns}/{type}/ 开头且以 .json 结尾
        if (filePath.indexOf(prefix) !== 0) {
            log.debug('_readZipDefs: 跳过（前缀不匹配） ' + filePath);
            continue;
        }
        if (!filePath.endsWith('.json')) {
            log.debug('_readZipDefs: 跳过（非 .json） ' + filePath);
            continue;
        }

        // 提取定义 ID：去掉前缀和扩展名，取文件名部分
        // 例如 "machine_max/materials/steel.json" → "steel"
        // 例如 "machine_max/materials/subdir/alloy.json" → "alloy"
        defId = path.basename(filePath, '.json');
        if (!defId) continue;

        // 读取并解析 JSON
        try {
            contentStr = handle.getContent(filePath);
            if (!contentStr) {
                log.warn('_readZipDefs: 无法读取 ' + filePath);
                continue;
            }
            parsed = JSON.parse(stripJsonComments(contentStr.toString('utf-8')));
            result[defId] = parsed;
            log.debug('_readZipDefs: 已读取 id=' + defId + ' path=' + filePath);
        } catch (e) {
            log.warn('_readZipDefs: JSON 解析失败，跳过 ' + filePath, e);
        }
    }

    log.info('_readZipDefs: ' + type + ' 从 ZIP 读取完成，共 ' + Object.keys(result).length + ' 个定义');
    log.debug('_readZipDefs: ' + type + ' 键列表', Object.keys(result));
    return result;
}

// =============================================================================
// 公开 API
// =============================================================================

/**
 * 从内容包 ID 中取冒号前的部分
 *
 * 注意：这**不是**内容命名空间，只是包 id 的前缀。包 id 与命名空间无关
 * （见 CONTENT_DIR_NAMES 与 listNamespaces），这里只作为「包内没有任何内容
 * 目录」时的兜底，以及创建新包时决定初始目录名。
 *
 * "my_pack:vehicles" → "my_pack"
 * "simple_name" → "simple_name"
 * "" → ""
 *
 * @param {string} packId - 内容包 ID，如 "machine_max:builtin"
 * @returns {string} 包 id 前缀
 */
function resolveNamespace(packId) {
    var str = packId || '';
    var colonIdx = str.indexOf(':');
    if (colonIdx >= 0) {
        return str.substring(0, colonIdx);
    }
    return str;
}

/**
 * 读取内容包的 meta.json
 *
 * 支持目录形式和 ZIP 文件形式的内容包。
 * 读取失败则返回 null 并记录警告日志。
 *
 * @param {string} packPath - 内容包根目录或 ZIP 文件路径
 * @returns {Object|null} meta 对象或 null
 */
function readPackMeta(packPath) {
    var metaPath, meta, raw;

    // ZIP 形式：从压缩包根目录读取 meta.json
    if (_isZipPath(packPath)) {
        raw = zip_reader.readFileContent(packPath, 'meta.json');
        if (!raw) {
            log.warn('readPackMeta: ZIP 中未找到 meta.json: ' + packPath);
            return null;
        }
        try {
            meta = JSON.parse(stripJsonComments(raw.toString('utf-8')));
            log.debug('readPackMeta: 已从 ZIP 读取 meta.json: ' + packPath);
            return meta;
        } catch (e) {
            log.warn('readPackMeta: ZIP 中 meta.json 解析失败: ' + packPath, e);
            return null;
        }
    }

    // 目录形式
    metaPath = path.join(packPath, 'meta.json');
    meta = readJSONFile(metaPath);
    if (meta === null) {
        log.warn('readPackMeta: 读取失败或文件不存在 ' + metaPath);
    } else {
        log.debug('readPackMeta: 已读取 ' + metaPath, {
            rawType: typeof meta,
            keys: Object.keys(meta),
            idType: typeof meta.id,
            authorType: typeof meta.author,
            descType: typeof meta.description,
            id: meta.id,
            author: meta.author,
            description: meta.description,
        });
    }
    return meta;
}

/**
 * 判断路径是否指向内置基础内容包（machine_max:builtin）
 *
 * 内置包由插件构建时注入，不是本地依赖。链式解析 / 依赖编辑 / 合并视图都应
 * 忽略指向它的目录或 ZIP，避免重复读取并把来源标成 dependency。
 *
 * @param {string} packPath - 内容包根目录或 ZIP 文件路径
 * @returns {boolean}
 */
function isBuiltinPackPath(packPath) {
    var meta;
    if (!packPath || typeof packPath !== 'string') return false;
    meta = readPackMeta(packPath);
    return !!(meta && meta.id === BUILTIN_PACK_ID);
}

/**
 * 写入内容包的 meta.json
 * 写入失败时向上抛出异常（数据丢失风险，必须暴露）
 *
 * @param {string} dirPath - 内容包根目录
 * @param {Object} meta - 要写入的元数据对象
 * @throws {Error} 写入失败时抛出
 */
function writePackMeta(dirPath, meta) {
    try {
        writeJSONFile(dirPath, 'meta.json', meta);
        log.debug('writePackMeta: meta.json 已写入 ' + dirPath);
    } catch (e) {
        log.error('writePackMeta: 写入失败 ' + dirPath, e);
        // 数据丢失风险，必须向上抛出
        throw e;
    }
}

/**
 * 创建新的内容包目录结构
 *
 * 在指定目录下创建命名空间子目录（materials/、connectors/、subsystems/、parts/、lang/），
 * 写入 meta.json，并从项目的 schemas/ 目录复制 Schema 文件到 {ns}/docs/。
 *
 * 命名空间目录由 `options.namespace` 指定（创建对话框里的「导出命名空间」），
 * 它和包 id 是两个概念：`k17:my_pack` 的包默认写到 `my_pack/`。省略时按
 * `defaultExportNamespace(meta.id)` 推断（id 后缀 → id 前缀）。名字非法时
 * **在创建任何目录之前**返回错误，不留半个包。
 *
 * 打开已有包时不这样推：以包内实际目录为准（见 listNamespaces），作者可以自行
 * 添加更多命名空间目录，`machine_max:m1a2_sep` + `m1a2_sep/` 这种组合是合法的。
 *
 * @param {string} dirPath - 内容包根目录（必须不存在 meta.json）
 * @param {Object} meta - 元数据对象（必须包含 id 字段，id 格式为 "namespace:packname"）
 * @param {{namespace?: string}} [options]
 * @returns {{success: boolean, namespace: string, error: string|null}} 操作结果
 */
function createContentPack(dirPath, meta, options) {
    var metaPath, namespace, nsDir, docsDir, requested;

    try {
        // 防止意外覆盖已有内容包
        metaPath = path.join(dirPath, 'meta.json');
        if (fileExists(metaPath)) {
            throw new Error('目录已包含 meta.json，为防止覆盖请使用其他目录: ' + dirPath);
        }

        // 解析命名空间：显式传入的优先，且必须是合法名字（在 mkdir 之前校验）
        requested = options && typeof options.namespace === 'string' ? options.namespace : '';
        namespace = requested ? requested : defaultExportNamespace(meta.id || '');
        if (!namespace) {
            return { success: false, namespace: '', error: 'meta.id 为空或无法解析命名空间，请显式指定导出命名空间' };
        }
        if (!isValidNamespace(namespace)) {
            return {
                success: false,
                namespace: '',
                error: '导出命名空间 "' + namespace + '" 不合法：只允许小写字母、数字、下划线或连字符',
            };
        }

        // 创建目录结构
        ensureDir(dirPath);
        nsDir = path.join(dirPath, namespace);
        ensureDir(path.join(nsDir, 'materials'));
        ensureDir(path.join(nsDir, 'connectors'));
        ensureDir(path.join(nsDir, 'subsystems'));
        ensureDir(path.join(nsDir, 'parts'));
        ensureDir(path.join(nsDir, 'lang'));

        // 写入 meta.json
        writePackMeta(dirPath, meta);

        // 复制 schemas 到 {ns}/docs/
        docsDir = path.join(nsDir, 'docs');
        copyDirRecursive(SCHEMAS_DIR, docsDir);
        log.info('createContentPack: 已复制 schemas 到 ' + docsDir);

        log.info('createContentPack: 内容包创建成功', { path: dirPath, namespace: namespace });
        return { success: true, namespace: namespace, error: null };
    } catch (e) {
        log.error('createContentPack: 创建失败', e);
        return { success: false, namespace: '', error: e.message };
    }
}

/**
 * 打开并校验已有的内容包
 *
 * 支持目录形式和 ZIP 文件形式的内容包。
 * 验证 meta.json 可读且 id 有效，只要根目录有 meta.json 即视为合法内容包。
 *
 * 返回的 `namespaces` 是包内实际存在的内容命名空间（可能多个），`namespace`
 * 只是供新建内容使用的默认值。两者都由目录结构决定，不由 meta.id 推导：
 * 包 id 为 `machine_max:m1a2_sep` 而内容放在 `m1a2_sep/` 目录是合法且常见的。
 *
 * @param {string} packPath - 内容包根目录或 ZIP 文件路径
 * @returns {{valid: boolean, meta: Object|null, namespace: string,
 *            namespaces: string[], error: string|null}} 校验结果
 */
function openContentPack(packPath) {
    var meta, resolved;

    // ZIP 形式
    if (_isZipPath(packPath)) {
        try {
            // 校验 meta.json
            meta = readPackMeta(packPath);
            if (meta === null) {
                return { valid: false, meta: null, namespace: '', namespaces: [], error: 'ZIP 中 meta.json 读取失败或不存在' };
            }

            if (!meta.id) {
                return { valid: false, meta: meta, namespace: '', namespaces: [], error: 'meta.id 为空' };
            }

            resolved = _resolvePackNamespaces(packPath, meta);
            if (!resolved.namespace) {
                return { valid: false, meta: meta, namespace: '', namespaces: [], error: 'ZIP 中找不到内容命名空间目录' };
            }

            log.info('openContentPack: ZIP 内容包验证通过', {
                path: packPath,
                namespace: resolved.namespace,
                namespaces: resolved.namespaces,
            });
            return {
                valid: true, meta: meta,
                namespace: resolved.namespace, namespaces: resolved.namespaces,
                error: null,
            };
        } catch (e) {
            log.error('openContentPack: 打开 ZIP 失败 ' + packPath, e);
            return { valid: false, meta: null, namespace: '', namespaces: [], error: e.message };
        }
    }

    // 目录形式
    try {
        meta = readPackMeta(packPath);
        if (meta === null) {
            log.warn('openContentPack: meta.json 读取失败或不存在: ' + packPath);
            return { valid: false, meta: null, namespace: '', namespaces: [], error: 'meta.json 读取失败或不存在' };
        }

        if (!meta.id) {
            log.warn('openContentPack: meta.id 为空，路径=' + packPath);
            return { valid: false, meta: meta, namespace: '', namespaces: [], error: 'meta.id 为空' };
        }

        resolved = _resolvePackNamespaces(packPath, meta);
        if (!resolved.namespace) {
            log.warn('openContentPack: 找不到内容命名空间目录: ' + packPath);
            return { valid: false, meta: meta, namespace: '', namespaces: [], error: '包内找不到内容命名空间目录' };
        }

        log.debug('openContentPack: meta.id=' + meta.id + ' -> namespace=' + resolved.namespace
            + ', namespaces=' + resolved.namespaces.join(','));

        // 只要根目录有 meta.json 即视为合法内容包，不再检查子目录
        log.info('openContentPack: 内容包验证通过', {
            path: packPath,
            namespace: resolved.namespace,
            namespaces: resolved.namespaces,
        });
        return {
            valid: true, meta: meta,
            namespace: resolved.namespace, namespaces: resolved.namespaces,
            error: null,
        };
    } catch (e) {
        log.error('openContentPack: 打开失败 ' + packPath, e);
        return { valid: false, meta: null, namespace: '', namespaces: [], error: e.message };
    }
}

/**
 * 读取指定类型的所有定义文件
 *
 * 支持目录形式和 ZIP 文件形式的内容包。
 * 目录形式：递归扫描 {packDir}/{namespace}/{type}/ 及所有子目录。
 * ZIP 形式：从压缩包中筛选匹配路径前缀的 .json 文件。
 *
 * @param {string} packDir - 内容包根目录或 ZIP 文件路径
 * @param {string} namespace - 命名空间
 * @param {'materials'|'connectors'|'subsystems'|'control_groups'|'projectiles'} type - 定义类型
 * @returns {Object<string, Object>} { [defId]: parsedData }，目录不存在时返回 {}
 */
function readAllDefs(packDir, namespace, type) {
    var typeDir, files, result, i, raw;

    // ZIP 形式
    if (_isZipPath(packDir)) {
        return _readZipDefs(packDir, namespace, type);
    }

    // 目录形式（原有逻辑）
    typeDir = path.join(packDir, namespace, type);

    log.info('readAllDefs: 开始读取 ' + type + ' 目录=' + typeDir + ' (packDir=' + packDir + ', namespace=' + namespace + ')');

    if (!fs.existsSync(typeDir)) {
        log.warn('readAllDefs: 目录不存在 ' + typeDir + ' (类型=' + type + ')');
        return {};
    }

    files = walkDefFiles(typeDir, '.json');
    log.info('readAllDefs: walkDefFiles 找到 ' + files.length + ' 个 ' + type + ' 文件' + (files.length > 0 ? '，列表=' + files.map(function(f){return f.id;}).join(',') : ''));

    result = {};

    for (i = 0; i < files.length; i++) {
        try {
            raw = fs.readFileSync(files[i].filePath, 'utf-8');
            result[files[i].id] = JSON.parse(stripJsonComments(raw));
            log.debug('readAllDefs: 已读取 id=' + files[i].id + ' path=' + files[i].filePath);
        } catch (e) {
            log.warn('readAllDefs: JSON 解析失败，跳过 ' + files[i].filePath, e);
        }
    }

    log.info('readAllDefs: 完成', { type: type, dir: typeDir, count: Object.keys(result).length, ids: Object.keys(result) });
    return result;
}

/**
 * 读取内容包中**所有命名空间**的指定类型定义，键带命名空间前缀
 *
 * 一个包可以有多个命名空间，定义 id 只在命名空间内唯一，所以合并时必须带前缀，
 * 否则两个命名空间里的同名定义会互相覆盖。
 *
 * @param {string} packDir - 内容包根目录或 ZIP 文件路径
 * @param {string[]|string} namespaces - 命名空间列表（或单个）
 * @param {'materials'|'connectors'|'subsystems'|'control_groups'|'projectiles'} type - 定义类型
 * @returns {Object<string, Object>} { "namespace:defId": parsedData }
 */
function readAllDefsByNamespace(packDir, namespaces, type) {
    var list = Array.isArray(namespaces) ? namespaces : (namespaces ? [namespaces] : []);
    var result = {};
    var i, j, ns, defs, ids;
    for (i = 0; i < list.length; i++) {
        ns = list[i];
        if (!ns) continue;
        defs = readAllDefs(packDir, ns, type);
        ids = Object.keys(defs);
        for (j = 0; j < ids.length; j++) {
            result[ns + ':' + ids[j]] = defs[ids[j]];
        }
    }
    return result;
}

/**
 * 递归列出指定类型的所有定义 ID
 *
 * @param {string} packDir - 内容包根目录
 * @param {string} namespace - 命名空间
 * @param {'materials'|'connectors'|'subsystems'|'control_groups'|'projectiles'} type - 定义类型
 * @returns {string[]} 定义 ID 数组，目录不存在时返回 []
 */
function listDefIds(packDir, namespace, type) {
    var typeDir = path.join(packDir, namespace, type);
    var files, ids, i;

    if (!fs.existsSync(typeDir)) {
        log.debug('listDefIds: 目录不存在 ' + typeDir);
        return [];
    }

    files = walkDefFiles(typeDir, '.json');
    ids = [];
    for (i = 0; i < files.length; i++) {
        ids.push(files[i].id);
    }

    log.debug('listDefIds: ' + type + ' 共有 ' + ids.length + ' 个定义');
    return ids;
}

/**
 * 检查指定定义文件是否存在
 *
 * @param {string} packDir - 内容包根目录
 * @param {string} namespace - 命名空间
 * @param {'materials'|'connectors'|'subsystems'|'control_groups'|'projectiles'} type - 定义类型
 * @param {string} defId - 定义 ID
 * @returns {boolean} 文件是否存在
 */
function defExists(packDir, namespace, type, defId) {
    var filePath = path.join(packDir, namespace, type, defId + '.json');
    return fileExists(filePath);
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isValidNamespace,
        defaultExportNamespace,
        pickExportNamespace,
        resolveNamespace,
        listNamespaces,
        pickPrimaryNamespace,
        readPackMeta,
        isBuiltinPackPath,
        writePackMeta,
        createContentPack,
        openContentPack,
        readAllDefs,
        readAllDefsByNamespace,
        listDefIds,
        defExists,
    };
}
