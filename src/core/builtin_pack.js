/**
 * builtin_pack.js — 内置 MachineMax 官方内容包运行时提供器
 *
 * 读取构建时注入的全局常量（__BUILTIN_PACK_META__、__BUILTIN_MATERIALS__ 等），
 * 在模块加载时一次性解析 JSON 字符串，并通过 getBuiltinPack() 返回冻结的只读对象。
 * 若构建常量未定义，则优雅降级为空对象。
 */

const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('BuiltinPack');

// ──────────────────────────────────────────────
// 模块加载时一次性解析构建常量
// ──────────────────────────────────────────────

/**
 * 安全解析 JSON 字符串常量
 * @param {*} raw - 全局常量值（应为 JSON 字符串）
 * @param {*} fallback - 解析失败时的默认值
 * @returns {Object} 解析后的对象
 */
function safeParse(raw, fallback) {
    if (typeof raw === 'undefined' || raw === null) return fallback;
    try {
        return JSON.parse(raw);
    } catch (e) {
        log.warn('JSON 解析失败，使用默认值', e);
        return fallback;
    }
}

/** 包元数据 */
var builtinMeta = safeParse(
    typeof __BUILTIN_PACK_META__ !== 'undefined' ? __BUILTIN_PACK_META__ : undefined,
    { id: '', version: '0.0' }
);

/** 材料定义映射 { materialId: materialData } */
var builtinMaterials = safeParse(
    typeof __BUILTIN_MATERIALS__ !== 'undefined' ? __BUILTIN_MATERIALS__ : undefined,
    {}
);

/** 连接点定义映射 { connectorId: connectorData } */
var builtinConnectors = safeParse(
    typeof __BUILTIN_CONNECTORS__ !== 'undefined' ? __BUILTIN_CONNECTORS__ : undefined,
    {}
);

/** 子系统定义映射 { subsystemId: subsystemData } */
var builtinSubsystems = safeParse(
    typeof __BUILTIN_SUBSYSTEMS__ !== 'undefined' ? __BUILTIN_SUBSYSTEMS__ : undefined,
    {}
);

/**
 * 从 meta.id 中提取命名空间（冒号前部分）
 * 例如 "machine_max:official" → "machine_max"
 * @param {string} id - 包 ID
 * @returns {string} 命名空间
 */
function extractNamespace(id) {
    if (!id || typeof id !== 'string') return 'machine_max';
    var colonIdx = id.indexOf(':');
    return colonIdx >= 0 ? id.substring(0, colonIdx) : id;
}

/**
 * 获取内置内容包数据
 * @returns {Object} 冻结的包数据对象
 */
function getBuiltinPack() {
    var namespace = extractNamespace(builtinMeta.id);

    var result = {
        meta: builtinMeta,
        namespace: namespace,
        materials: builtinMaterials,
        connectors: builtinConnectors,
        subsystems: builtinSubsystems,
    };

    // 浅冻结以防止意外修改
    Object.freeze(result);

    log.debug('getBuiltinPack: 返回内置包', {
        id: builtinMeta.id,
        namespace: namespace,
        materials: Object.keys(builtinMaterials).length,
        connectors: Object.keys(builtinConnectors).length,
        subsystems: Object.keys(builtinSubsystems).length,
    });

    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getBuiltinPack,
    };
}
