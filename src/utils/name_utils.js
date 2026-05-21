const { createLogger } = require('./logger.js');

var log = createLogger('NameUtils');

/**
 * 类型前缀 → 中文标签映射
 * 用于 UI 显示 [子系统]engine、[连接点]wheel 等格式
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
 * 从完整键提取短名（namespace 后的部分）
 * "subsystem.machine_max.engine" → "engine"
 * "connector.machine_max.front_wheel" → "front_wheel"
 */
function extractShortName(fullKey, ns) {
    if (!fullKey || typeof fullKey !== 'string') return fullKey || '';
    ns = ns || 'machine_max';
    var prefix = '.' + ns + '.';
    var idx = fullKey.indexOf(prefix);
    if (idx >= 0) {
        return fullKey.substring(idx + prefix.length);
    }
    return fullKey;
}

/**
 * 构建完整键
 * "subsystem", "engine", "machine_max" → "subsystem.machine_max.engine"
 */
function buildFullKey(type, shortName, ns) {
    if (!shortName) return '';
    ns = ns || 'machine_max';
    if (type) {
        return type + '.' + ns + '.' + shortName;
    }
    return shortName;
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
        /* 连接点 */
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
        /* 子系统 */
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
    module.exports = { extractType, extractShortName, buildFullKey, displayLabel, getTargetOptions, TYPE_LABELS, TYPE_PREFIXES };
}
