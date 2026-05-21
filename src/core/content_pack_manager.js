/**
 * content_pack_manager.js — 多内容包加载/合并/优先级解析模块
 *
 * 将内置包、依赖包、当前内容包的定义按优先级合并，提供统一的查询接口。
 * 优先级（低→高）：内置包 → 依赖包（数组越靠后优先级越高）→ 当前内容包。
 *
 * 设计原则:
 * - 只读合并层：不写入磁盘，仅合并读取
 * - 外部模块调用的错误均被捕获，优雅降级
 * - 简单缓存策略：按 type 缓存合并结果，调用方通过 invalidateCache() 主动失效
 * - 不依赖 config.js / persistence.js，config 由调用方传入
 */

const content_pack = require('./content_pack.js');
const builtin_pack = require('./builtin_pack.js');
const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('ContentPackManager');

/** hasOwnProperty 快捷调用，避免触发生物检查规则 */
var hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

// =============================================================================
// 缓存
// =============================================================================

/** 按类型缓存合并结果，格式: { [type]: { defs: {...}, sources: {...} } | null } */
var _cache = {
    materials: null,
    connectors: null,
    subsystems: null,
};

// =============================================================================
// 公开 API
// =============================================================================

/**
 * 按优先级链加载并合并所有内容包中指定类型的定义
 *
 * 优先级（低→高）：
 *   1. 内置包（builtin_pack.getBuiltinPack()）
 *   2. 依赖包（config.dependencyPaths，数组越靠后优先级越高）
 *   3. 当前内容包（config.contentPackPath）
 *
 * @param {Object|null} config - 项目配置对象，需包含 dependencyPaths (string[]) 和
 *   contentPackPath (string) 字段。为 null/undefined 时返回空结果。
 * @param {'materials'|'connectors'|'subsystems'} type - 定义类型
 * @returns {{defs: Object<string,Object>, sources: Object<string,string>}}
 *   defs: 合并后的定义映射 { defId: defData }
 *   sources: 每个定义的来源标记 'builtin'|'dependency:0'|'dependency:1'|...|'current'
 */
function loadMergedDefs(config, type) {
    // 所有 var 声明集中在函数顶部（符合 noInnerDeclarations 规则）
    var emptyResult;
    var defs;
    var sources;
    var builtin;
    var builtinDefs;
    var bKey;
    var depPaths;
    var i;
    var depPath;
    var openResult;
    var depDefs;
    var depKey;
    var currentPath;
    var curOpenResult;
    var curDefs;
    var curKey;
    var result;
    var defCount;

    // 缓存命中
    if (_cache[type]) {
        log.debug('loadMergedDefs: 缓存命中 ' + type);
        return _cache[type];
    }

    // config 为空 → 返回空结果
    if (!config) {
        log.warn('loadMergedDefs: config 为空，返回空结果');
        emptyResult = { defs: {}, sources: {} };
        _cache[type] = emptyResult;
        return emptyResult;
    }

    defs = {};
    sources = {};

    log.debug('loadMergedDefs: 开始合并 ' + type, {
        contentPackPath: config.contentPackPath,
        dependencyPaths: config.dependencyPaths,
    });

    // ── 第 1 层：内置包（优先级最低）──────────────────────────────────
    try {
        builtin = builtin_pack.getBuiltinPack();
        builtinDefs = builtin[type] || {};
        for (bKey in builtinDefs) {
            if (hasOwn(builtinDefs, bKey)) {
                // 内置包键为裸文件名（如"structural_steel"），加上 namespace 前缀
                var namespacedKey = builtin.namespace + ':' + bKey;
                defs[namespacedKey] = builtinDefs[bKey];
                sources[namespacedKey] = 'builtin';
                log.debug('loadMergedDefs: 内置包添加 ' + namespacedKey + ' (source=builtin)');
            }
        }
        log.info('loadMergedDefs: 内置包 ' + type + ' 加载完成，共 ' + Object.keys(builtinDefs).length + ' 个定义，namespace=' + builtin.namespace);
    } catch (e) {
        log.warn('loadMergedDefs: 内置包读取失败，作为空包处理', e);
    }

    // ── 第 2 层：依赖包 ──────────────────────────────────────────────
    depPaths = config.dependencyPaths;
    if (depPaths && Array.isArray(depPaths) && depPaths.length > 0) {
        for (i = 0; i < depPaths.length; i++) {
            depPath = depPaths[i];

            // 跳过空路径
            if (!depPath || typeof depPath !== 'string' || depPath.trim() === '') {
                log.warn('loadMergedDefs: 依赖包路径为空，跳过 index=' + i);
                continue;
            }

            try {
                openResult = content_pack.openContentPack(depPath);
                if (!openResult.valid) {
                    log.warn('loadMergedDefs: 依赖包无效，跳过: ' + depPath, openResult.error);
                    continue;
                }

                log.info('loadMergedDefs: 依赖包打开成功', {
                    path: depPath,
                    namespace: openResult.namespace,
                    metaId: openResult.meta ? openResult.meta.id : null,
                });

                depDefs = content_pack.readAllDefs(depPath, openResult.namespace, type);
                for (depKey in depDefs) {
                    if (hasOwn(depDefs, depKey)) {
                        var namespacedDepKey = openResult.namespace + ':' + depKey;
                        // 检查是否已被更早的层定义（内置包或更早的依赖包）
                        var prevSource = sources[namespacedDepKey];
                        defs[namespacedDepKey] = depDefs[depKey];
                        sources[namespacedDepKey] = 'dependency:' + i;
                        log.info('loadMergedDefs: 依赖包添加 ' + namespacedDepKey + ' (source=dependency:' + i + ', 覆盖前=' + (prevSource || '无') + ')');
                    }
                }
                log.info('loadMergedDefs: 依赖包 ' + depPath + ' ' + type + ' 加载完成，共 ' + Object.keys(depDefs).length + ' 个定义');
            } catch (e) {
                log.warn('loadMergedDefs: 依赖包加载失败，跳过: ' + depPath, e);
            }
        }
    }

    // ── 第 3 层：当前内容包（优先级最高）───────────────────────────────
    currentPath = config.contentPackPath;
    if (currentPath && typeof currentPath === 'string' && currentPath.trim() !== '') {
        try {
            curOpenResult = content_pack.openContentPack(currentPath);
            if (!curOpenResult.valid) {
                log.error('loadMergedDefs: 当前内容包无效: ' + currentPath, curOpenResult.error);
                log.debug('loadMergedDefs: openContentPack 结果', {
                    namespace: curOpenResult.namespace,
                    meta: curOpenResult.meta,
                    error: curOpenResult.error,
                });
            } else {
                log.info('loadMergedDefs: 当前包打开成功', {
                    path: currentPath,
                    namespace: curOpenResult.namespace,
                    metaId: curOpenResult.meta ? curOpenResult.meta.id : null,
                });
                curDefs = content_pack.readAllDefs(currentPath, curOpenResult.namespace, type);
                for (curKey in curDefs) {
                    if (hasOwn(curDefs, curKey)) {
                        var namespacedCurKey = curOpenResult.namespace + ':' + curKey;
                        var prevSource = sources[namespacedCurKey];
                        defs[namespacedCurKey] = curDefs[curKey];
                        sources[namespacedCurKey] = 'current';
                        log.info('loadMergedDefs: 当前包添加 ' + namespacedCurKey + ' (source=current, 覆盖前=' + (prevSource || '无') + ')');
                    }
                }
                log.info('loadMergedDefs: 当前包 ' + currentPath + ' ' + type + ' 加载完成，共 ' + Object.keys(curDefs).length + ' 个定义');
            }
        } catch (e) {
            log.error('loadMergedDefs: 当前内容包加载失败: ' + currentPath, e);
        }
    }

    // ── 组装结果并缓存 ──────────────────────────────────────────────
    result = { defs: defs, sources: sources };
    _cache[type] = result;

    defCount = Object.keys(defs).length;
    log.info('loadMergedDefs: ' + type + ' 合并完成，共 ' + defCount + ' 个定义');
    log.debug('loadMergedDefs: 最终 sources', sources);

    return result;
}

/**
 * 查询指定定义 ID 的来源
 *
 * @param {Object|null} config - 项目配置对象
 * @param {'materials'|'connectors'|'subsystems'} type - 定义类型
 * @param {string} defId - 定义 ID
 * @returns {string|null} 来源标记 ('builtin'|'dependency:N'|'current')，未找到返回 null
 */
function resolveDefSource(config, type, defId) {
    var merged = loadMergedDefs(config, type);
    var source = merged.sources[defId];
    if (source === undefined) {
        log.debug('resolveDefSource: 未找到定义 ' + type + ':' + defId);
        return null;
    }
    log.debug('resolveDefSource: ' + type + ':' + defId + ' -> ' + source);
    return source;
}

/**
 * 判断指定定义是否可由当前用户编辑
 *
 * 只有来源为 'current'（当前内容包）的定义可编辑。
 * 内置包和依赖包的定义为只读。
 *
 * @param {Object|null} config - 项目配置对象
 * @param {'materials'|'connectors'|'subsystems'} type - 定义类型
 * @param {string} defId - 定义 ID
 * @returns {boolean} 是否可编辑
 */
function isDefEditable(config, type, defId) {
    var source = resolveDefSource(config, type, defId);
    return source === 'current';
}

/**
 * 获取指定类型的所有可用定义（仅 defs 映射，不含 sources）
 *
 * @param {Object|null} config - 项目配置对象
 * @param {'materials'|'connectors'|'subsystems'} type - 定义类型
 * @returns {Object<string,Object>} 定义映射 { defId: defData }，无定义时返回 {}
 */
function getAvailableDefsForType(config, type) {
    var merged = loadMergedDefs(config, type);
    return merged.defs;
}

/**
 * 获取指定类型的第一个定义 ID
 *
 * 用于面板中的默认选择（如 HitBox 面板的默认材料）。
 *
 * @param {Object|null} config - 项目配置对象
 * @param {'materials'|'connectors'|'subsystems'} type - 定义类型
 * @returns {string|null} 第一个定义的 ID，无可用定义时返回 null
 */
function getFirstDefId(config, type) {
    var defs = getAvailableDefsForType(config, type);
    var keys = Object.keys(defs);
    if (keys.length === 0) {
        log.debug('getFirstDefId: ' + type + ' 无可用定义');
        return null;
    }
    return keys[0];
}

/**
 * 清除内部缓存，强制下次 loadMergedDefs 从磁盘重新读取
 *
 * 当 config.contentPackPath 或 config.dependencyPaths 发生变化时，
 * 调用方必须调用此方法以确保后续查询使用最新数据。
 */
function invalidateCache() {
    _cache.materials = null;
    _cache.connectors = null;
    _cache.subsystems = null;
    log.debug('invalidateCache: 缓存已清除');
    // 检查调用栈（帮助定位谁触发了缓存失效）
    try {
        throw new Error('invalidateCache 调用栈');
    } catch (e) {
        log.debug('invalidateCache: 调用者', e.stack);
    }
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadMergedDefs,
        resolveDefSource,
        isDefEditable,
        getAvailableDefsForType,
        getFirstDefId,
        invalidateCache,
    };
}
