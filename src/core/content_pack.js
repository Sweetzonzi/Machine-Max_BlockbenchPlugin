/**
 * content_pack.js — 内容包目录 I/O 模块
 *
 * 负责内容包定义在磁盘上的读写操作，是所有内容包重构工作的基础设施层。
 * 封装了 meta.json 管理、定义文件（materials/connectors/subsystems）的
 * CRUD 操作、目录结构校验和创建等功能。
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
const {
    ensureDir,
    writeJSONFile,
    readJSONFile,
    fileExists,
    deleteFile,
} = require('../utils/file_writer.js');

/** 模块日志 */
var log = createLogger('ContentPack');

/** 项目根目录（从 src/core/ 向上两级） */
const ROOT = path.join(__dirname, '..', '..');
const SCHEMAS_DIR = path.join(ROOT, 'schemas');

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
    if (!fs.existsSync(dir)) return results;

    try {
        entries = fs.readdirSync(dir);
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
            fs.writeFileSync(destPath, fs.readFileSync(srcPath));
            log.debug('copyDirRecursive: 已复制 ' + srcPath + ' → ' + destPath);
        }
    }
}

// =============================================================================
// 公开 API
// =============================================================================

/**
 * 从内容包 ID 中提取 namespace（冒号前的部分）
 * "my_pack:vehicles" → "my_pack"
 * "simple_name" → "simple_name"
 * "" → ""
 *
 * @param {string} packId - 内容包 ID，如 "machine_max:official"
 * @returns {string} namespace
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
 * 返回解析后的对象，读取失败则返回 null 并记录警告日志
 *
 * @param {string} dirPath - 内容包根目录
 * @returns {Object|null} meta 对象或 null
 */
function readPackMeta(dirPath) {
    var metaPath = path.join(dirPath, 'meta.json');
    var meta = readJSONFile(metaPath);
    if (meta === null) {
        log.warn('readPackMeta: 读取失败或文件不存在 ' + metaPath);
    } else {
        log.debug('readPackMeta: 已读取 ' + metaPath);
    }
    return meta;
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
 * 在指定目录下创建 namespace 子目录（materials/、connectors/、subsystems/），
 * 写入 meta.json，并从项目的 schemas/ 目录复制 Schema 文件到 {ns}/docs/。
 *
 * @param {string} dirPath - 内容包根目录（必须不存在 meta.json）
 * @param {Object} meta - 元数据对象（必须包含 id 字段，id 格式为 "namespace:packname"）
 * @returns {{success: boolean, namespace: string, error: string|null}} 操作结果
 */
function createContentPack(dirPath, meta) {
    var metaPath, namespace, nsDir, docsDir;

    try {
        // 防止意外覆盖已有内容包
        metaPath = path.join(dirPath, 'meta.json');
        if (fileExists(metaPath)) {
            throw new Error('目录已包含 meta.json，为防止覆盖请使用其他目录: ' + dirPath);
        }

        // 解析 namespace
        namespace = resolveNamespace(meta.id || '');
        if (!namespace) {
            return { success: false, namespace: '', error: 'meta.id 为空或无法解析 namespace' };
        }

        // 创建目录结构
        ensureDir(dirPath);
        nsDir = path.join(dirPath, namespace);
        ensureDir(path.join(nsDir, 'materials'));
        ensureDir(path.join(nsDir, 'connectors'));
        ensureDir(path.join(nsDir, 'subsystems'));

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
 * 验证 meta.json 可读且 id 有效，并检查必要的子目录（materials/、connectors/、subsystems/）存在。
 *
 * @param {string} dirPath - 内容包根目录
 * @returns {{valid: boolean, meta: Object|null, namespace: string, error: string|null}} 校验结果
 */
function openContentPack(dirPath) {
    var meta, namespace, requiredDirs, i;

    try {
        meta = readPackMeta(dirPath);
        if (meta === null) {
            return { valid: false, meta: null, namespace: '', error: 'meta.json 读取失败或不存在' };
        }

        if (!meta.id) {
            return { valid: false, meta: meta, namespace: '', error: 'meta.id 为空' };
        }

        namespace = resolveNamespace(meta.id);
        if (!namespace) {
            return { valid: false, meta: meta, namespace: '', error: '无法从 meta.id 解析 namespace' };
        }

        // 验证必要子目录存在
        requiredDirs = [
            path.join(dirPath, namespace, 'materials'),
            path.join(dirPath, namespace, 'connectors'),
            path.join(dirPath, namespace, 'subsystems'),
        ];

        for (i = 0; i < requiredDirs.length; i++) {
            if (!fs.existsSync(requiredDirs[i])) {
                return {
                    valid: false,
                    meta: meta,
                    namespace: namespace,
                    error: '缺少必要目录: ' + requiredDirs[i],
                };
            }
        }

        log.info('openContentPack: 内容包验证通过', { path: dirPath, namespace: namespace });
        return { valid: true, meta: meta, namespace: namespace, error: null };
    } catch (e) {
        log.error('openContentPack: 打开失败 ' + dirPath, e);
        return { valid: false, meta: null, namespace: '', error: e.message };
    }
}

/**
 * 读取指定类型的所有定义文件
 *
 * 递归扫描 {packDir}/{namespace}/{type}/ 目录及所有子目录，
 * 解析每个 .json 文件，以文件名（不含扩展名）为 key 返回。
 * JSON 解析失败的文件被跳过并记录警告。
 *
 * @param {string} packDir - 内容包根目录
 * @param {string} namespace - 命名空间
 * @param {'materials'|'connectors'|'subsystems'} type - 定义类型
 * @returns {Object<string, Object>} { [defId]: parsedData }，目录不存在时返回 {}
 */
function readAllDefs(packDir, namespace, type) {
    var typeDir = path.join(packDir, namespace, type);
    var files, result, i, raw;

    if (!fs.existsSync(typeDir)) {
        log.debug('readAllDefs: 目录不存在 ' + typeDir);
        return {};
    }

    files = walkDefFiles(typeDir, '.json');
    result = {};

    for (i = 0; i < files.length; i++) {
        try {
            raw = fs.readFileSync(files[i].filePath, 'utf-8');
            result[files[i].id] = JSON.parse(raw);
            log.debug('readAllDefs: 已读取 ' + files[i].filePath);
        } catch (e) {
            log.warn('readAllDefs: JSON 解析失败，跳过 ' + files[i].filePath, e);
        }
    }

    log.info('readAllDefs: 完成', { type: type, count: Object.keys(result).length });
    return result;
}

/**
 * 写入一个定义文件
 *
 * 文件将写入 {packDir}/{namespace}/{type}/{defId}.json，自动创建必要目录。
 *
 * @param {string} packDir - 内容包根目录
 * @param {string} namespace - 命名空间
 * @param {'materials'|'connectors'|'subsystems'} type - 定义类型
 * @param {string} defId - 定义 ID（文件名，不含扩展名）
 * @param {Object} data - 要写入的数据
 */
function writeDef(packDir, namespace, type, defId, data) {
    var defDir = path.join(packDir, namespace, type);
    var filename = defId + '.json';
    writeJSONFile(defDir, filename, data);
    log.debug('writeDef: 已写入 ' + path.join(defDir, filename));
}

/**
 * 删除一个定义文件
 *
 * @param {string} packDir - 内容包根目录
 * @param {string} namespace - 命名空间
 * @param {'materials'|'connectors'|'subsystems'} type - 定义类型
 * @param {string} defId - 定义 ID（文件名，不含扩展名）
 */
function deleteDef(packDir, namespace, type, defId) {
    var filePath = path.join(packDir, namespace, type, defId + '.json');
    deleteFile(filePath);
    log.debug('deleteDef: ' + filePath);
}

/**
 * 递归列出指定类型的所有定义 ID
 *
 * @param {string} packDir - 内容包根目录
 * @param {string} namespace - 命名空间
 * @param {'materials'|'connectors'|'subsystems'} type - 定义类型
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
 * @param {'materials'|'connectors'|'subsystems'} type - 定义类型
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
        resolveNamespace,
        readPackMeta,
        writePackMeta,
        createContentPack,
        openContentPack,
        readAllDefs,
        writeDef,
        deleteDef,
        listDefIds,
        defExists,
    };
}
