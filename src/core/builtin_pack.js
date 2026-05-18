/**
 * builtin_pack.js — 内置 MachineMax 官方内容包运行时提供器
 *
 * 读取构建时 esbuild define 注入的全局常量（__BUILTIN_PACK_META__、__BUILTIN_MATERIALS__ 等），
 * 在模块加载时规范化后通过 getBuiltinPack() 返回冻结的只读对象。
 * 若构建常量未定义（如测试环境），则优雅降级为空对象。
 *
 * 【重要】esbuild define 注入机制：
 *   build.js 中 JSON.stringify(materials) → esbuild 做源代码文本替换 →
 *   运行时 __BUILTIN_MATERIALS__ 就是 JS 对象字面量，不是 JSON 字符串！
 *   因此绝不能对它们调用 JSON.parse()，否则会得到 "[object Object]" is not valid JSON 错误。
 *
 * 数据规范化说明：
 *   构建脚本 normalizeDefFiles 产出的格式已为：
 *     { "file": { key: "value" } }
 *   但为兼容旧构建产物，normalizeDefs 仍会对尚未规范化的数据进行处理：
 *     { "subdir/file.json": "{\"key\":\"value\"}" } → { "file": { key: "value" } }
 *   即：(1) 去除键名的 .json 扩展名和子目录前缀 (2) 尝试将字符串值 JSON.parse 为对象
 */

const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('BuiltinPack');

// ──────────────────────────────────────────────
// 数据规范化
// ──────────────────────────────────────────────

/**
 * 剥离 JSON 内容中的 // 单行注释（支持 inline 和独立行注释）。
 *
 * 通过跟踪双引号的奇偶性来判断 // 是否出现在字符串字面量内部，
 * 避免误删 URL（如 "http://example.com"）中的 //。
 *
 * @param {string} content - 包含 // 注释的类 JSON 文本
 * @returns {string} 剥离注释后的纯 JSON 文本
 */
function stripJsonComments(content) {
    var lines, result, li, line, inString, i, ch, commentStart, stripped;

    if (typeof content !== 'string') return content;

    lines = content.split('\n');
    result = [];

    for (li = 0; li < lines.length; li++) {
        line = lines[li];
        inString = false;
        commentStart = -1;

        for (i = 0; i < line.length; i++) {
            ch = line[i];
            if (ch === '"' && (i === 0 || line[i - 1] !== '\\')) {
                inString = !inString;
            } else if (ch === '/' && line[i + 1] === '/' && !inString) {
                commentStart = i;
                break;
            }
        }

        if (commentStart >= 0) {
            stripped = line.substring(0, commentStart);
            if (stripped.trim().length > 0) {
                result.push(stripped);
            }
        } else {
            result.push(line);
        }
    }

    return result.join('\n');
}

/**
 * 规范化定义数据，使其与 content_pack.readAllDefs() 格式一致
 *
 * 兼容两种输入格式：
 *   - 新格式（build.js normalizeDefFiles 产物）：{ "file": { key: value } }
 *   - 旧格式（未规范化的 collectJSONFiles 产物）：{ "subdir/file.json": "{\"key\":\"value\"}" }
 *
 * 对上执行三种规范化，对新格式（值已是对象）仅做键名规范化：
 *   1. 去除键名的 .json 扩展名
 *   2. 去除键名中的子目录前缀（仅保留 basename）
 *   3. 若值为 JSON 字符串则剥离注释后解析为 JS 对象
 *
 * @param {Object<string, string|Object>} rawDefs - 原始定义映射
 * @returns {Object<string, Object>} 规范化后的定义映射 { defId: defData }
 */
function normalizeDefs(rawDefs) {
    var result, keys, i, key, value, defId, lastSlash, stripped;

    if (!rawDefs || typeof rawDefs !== 'object') return {};

    result = {};
    keys = Object.keys(rawDefs);

    for (i = 0; i < keys.length; i++) {
        key = keys[i];
        value = rawDefs[key];

        // ── 处理键名：去除 .json 扩展名和子目录前缀 ──
        defId = key;
        if (typeof defId === 'string' && defId.endsWith('.json')) {
            defId = defId.slice(0, -5);
        }
        // 去除子目录前缀（取最后一个路径分隔符后的部分）
        lastSlash = defId.lastIndexOf('/');
        if (lastSlash >= 0) {
            defId = defId.substring(lastSlash + 1);
        }

        // ── 处理值：剥离注释后解析 JSON 字符串为对象 ──
        if (typeof value === 'string') {
            try {
                stripped = stripJsonComments(value);
                value = JSON.parse(stripped);
            } catch (e) {
                log.warn('normalizeDefs: JSON 解析失败，保留原值 key=' + key, e);
            }
        }

        result[defId] = value;
    }

    return result;
}

// ──────────────────────────────────────────────
// 模块加载时读取构建常量（esbuild define 注入为 JS 对象字面量）
// ──────────────────────────────────────────────

/**
 * 读取 esbuild define 注入的常量，带类型检查和默认值回退
 *
 * esbuild define 将构建时的 JSON.stringify(someObj) 作为源代码文本注入，
 * 运行时该常量即为 JS 对象字面量。
 * 在测试环境中（无 esbuild define），这些全局变量为 undefined。
 *
 * @param {*} injectedValue - 全局常量值
 * @param {*} fallback - 常量未定义（测试环境）时的默认值
 * @returns {*} 常量值或默认值
 */
function readDefine(injectedValue, fallback) {
    if (typeof injectedValue === 'undefined') {
        return fallback;
    }
    return injectedValue;
}

/** 包元数据 — 构建时通过 esbuild define 注入为 JS 对象字面量 */
var builtinMeta = readDefine(
    typeof __BUILTIN_PACK_META__ !== 'undefined' ? __BUILTIN_PACK_META__ : undefined,
    { id: '', version: '0.0' }
);

/** 材料定义映射 { materialId: materialData } — 经 normalizeDefs 规范化 */
var builtinMaterials = normalizeDefs(
    readDefine(
        typeof __BUILTIN_MATERIALS__ !== 'undefined' ? __BUILTIN_MATERIALS__ : undefined,
        {}
    )
);

/** 连接点定义映射 { connectorId: connectorData } — 经 normalizeDefs 规范化 */
var builtinConnectors = normalizeDefs(
    readDefine(
        typeof __BUILTIN_CONNECTORS__ !== 'undefined' ? __BUILTIN_CONNECTORS__ : undefined,
        {}
    )
);

/** 子系统定义映射 { subsystemId: subsystemData } — 经 normalizeDefs 规范化 */
var builtinSubsystems = normalizeDefs(
    readDefine(
        typeof __BUILTIN_SUBSYSTEMS__ !== 'undefined' ? __BUILTIN_SUBSYSTEMS__ : undefined,
        {}
    )
);

// ──────────────────────────────────────────────
// 公开 API
// ──────────────────────────────────────────────

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
 * @returns {Object} 冻结的包数据对象，包含 meta、namespace、materials、connectors、subsystems
 */
function getBuiltinPack() {
    var namespace = extractNamespace(builtinMeta.id);
    var matCount, connCount, subCount;

    var result = {
        meta: builtinMeta,
        namespace: namespace,
        materials: builtinMaterials,
        connectors: builtinConnectors,
        subsystems: builtinSubsystems,
    };

    // 浅冻结以防止意外修改
    Object.freeze(result);

    matCount = Object.keys(builtinMaterials).length;
    connCount = Object.keys(builtinConnectors).length;
    subCount = Object.keys(builtinSubsystems).length;

    log.info('getBuiltinPack: 内置包加载完成 — '
        + 'materials=' + matCount
        + ' connectors=' + connCount
        + ' subsystems=' + subCount
        + ' namespace=' + namespace
    );

    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getBuiltinPack,
    };
}
