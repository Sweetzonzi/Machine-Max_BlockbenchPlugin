/**
 * name_utils.js — 翻译键格式名称解析工具
 *
 * 处理三类翻译键形式的名称：
 *   完整键:  "subsystem.machine_max.engine"
 *   短名:    "engine"
 *   显示:    "[子系统]engine"
 *
 * 所有键使用点分隔格式（{type}.{ns}.{name}），与零件定义 JSON 中的 map key 一致。
 */

var TYPE_LABELS = {
    sub_part:   { zh: '子零件',   en: 'SubPart' },
    interact:   { zh: '交互区',   en: 'Interact' },
    connector:  { zh: '连接点',   en: 'Connector' },
    subsystem:  { zh: '子系统',   en: 'Subsystem' },
};

var TYPE_PREFIXES = Object.keys(TYPE_LABELS);

/**
 * 从完整键提取类型前缀
 * "subsystem.machine_max.engine" → "subsystem"
 */
function extractType(fullKey) {
    if (!fullKey || typeof fullKey !== 'string') return null;
    for (var i = 0; i < TYPE_PREFIXES.length; i++) {
        if (fullKey.indexOf(TYPE_PREFIXES[i] + '.') === 0) {
            return TYPE_PREFIXES[i];
        }
    }
    return null;
}

/**
 * 把完整键拆成三段：`{ type, namespace, name }`
 * "sub_part.machine_max.main" → { type: 'sub_part', namespace: 'machine_max', name: 'main' }
 * 不是 `<type>.<ns>.<name>` 形态（缺少类型、段为空）时返回 null。
 */
function parseKey(fullKey) {
    if (!fullKey || typeof fullKey !== 'string') return null;
    var type = extractType(fullKey);
    if (!type) return null;
    var rest = fullKey.slice(type.length + 1);
    var dot = rest.indexOf('.');
    if (dot <= 0 || dot === rest.length - 1) return null;
    return { type: type, namespace: rest.slice(0, dot), name: rest.slice(dot + 1) };
}

/**
 * 从完整键提取短名（命名空间后的部分）
 * "subsystem.machine_max.engine" → "engine"
 * "subsystem.2s38.engine"        → "engine"（不依赖传入的工程命名空间）
 * 不是完整键（没有类型前缀）时原样返回。
 */
function extractShortName(fullKey, ns) {
    if (!fullKey || typeof fullKey !== 'string') return fullKey || '';
    var parsed = parseKey(fullKey);
    if (parsed) return parsed.name;
    void ns;
    return fullKey;
}

/**
 * 按三段拼接完整键（不做任何归一化）。
 * "sub_part", "m1a2_sep", "hull" → "sub_part.m1a2_sep.hull"
 */
function buildKey(type, ns, name) {
    if (!type || !ns || !name) return '';
    return type + '.' + ns + '.' + name;
}

/**
 * 生成显示标签
 * "subsystem.machine_max.engine" → "[子系统]engine"
 * 用于下拉菜单、列表项等 UI 展示
 */
function displayLabel(fullKey, locale, ns) {
    if (!fullKey || typeof fullKey !== 'string') return fullKey || '';
    var type = extractType(fullKey);
    var shortName = extractShortName(fullKey, ns);
    if (!type) return shortName;
    var labels = TYPE_LABELS[type];
    var label = labels ? (labels[locale] || labels['zh'] || type) : type;
    return '[' + label + ']' + shortName;
}

/**
 * 从 variant 收集信号目标选项，按类型分组
 * 返回 [{ type, shortName, fullKey, label }]
 */
function getTargetOptions(variant, ns) {
    var options = [];
    ns = ns || 'machine_max';
    if (!variant) return options;
    var subParts = variant.sub_parts || {};
    for (var spKey in subParts) {
        if (!subParts.hasOwnProperty(spKey)) continue;
        var sp = subParts[spKey];
        if (!sp || typeof sp !== 'object') continue;
        var connectors = sp.connectors || {};
        for (var connKey in connectors) {
            if (!connectors.hasOwnProperty(connKey)) continue;
            if (options.some(function(o) { return o.fullKey === connKey; })) continue;
            options.push({
                type: 'connector',
                shortName: extractShortName(connKey, ns),
                fullKey: connKey,
                label: displayLabel(connKey, 'zh', ns),
            });
        }
        var subsystems = sp.subsystems || {};
        for (var ssKey in subsystems) {
            if (!subsystems.hasOwnProperty(ssKey)) continue;
            if (options.some(function(o) { return o.fullKey === ssKey; })) continue;
            options.push({
                type: 'subsystem',
                shortName: extractShortName(ssKey, ns),
                fullKey: ssKey,
                label: displayLabel(ssKey, 'zh', ns),
            });
        }
    }
    return options;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { extractType, parseKey, extractShortName, buildKey, displayLabel, getTargetOptions, TYPE_LABELS, TYPE_PREFIXES };
}
