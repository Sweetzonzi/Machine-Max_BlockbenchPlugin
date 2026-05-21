/**
 * name_utils.js — 内容包 ResourceLocation 名称解析工具
 *
 * 提供 ResourceLocation（如 "machine_max:standard_front_wheel"）的
 * 拆分、拼接、显示名生成等操作。
 */

/**
 * 从 resource location 全名中提取短名称（去掉 namespace: 前缀）
 *
 * "machine_max:standard_front_wheel" + "machine_max" → "standard_front_wheel"
 * "standard_front_wheel" + "machine_max" → "standard_front_wheel"（无前缀时原样返回）
 *
 * @param {string} fullKey - resource location 全名
 * @param {string} [namespace] - 命名空间，不传时取冒号前部分
 * @returns {string} 短名称
 */
function extractShortName(fullKey, namespace) {
    if (!fullKey) return '';
    var colonIdx = fullKey.indexOf(':');
    if (colonIdx < 0) return fullKey;
    var ns = namespace || fullKey.substring(0, colonIdx);
    var prefix = ns + ':';
    if (fullKey.indexOf(prefix) === 0) {
        return fullKey.substring(prefix.length);
    }
    return fullKey;
}

/**
 * 生成 resource location 的显示标签
 *
 * 将命名空间前缀替换为中文显示名，短名称中的下划线转为空格，
 * 首字母大写。如：
 * "machine_max:standard_front_wheel" → "machine_max:Standard Front Wheel"
 *
 * @param {string} key - resource location 全名
 * @param {string} locale - 语言代码（仅用于缩略显示，暂未实现国际化）
 * @param {string} ns - 命名空间
 * @returns {string} 显示标签
 */
function displayLabel(key, locale, ns) {
    if (!key) return '';
    var shortName = extractShortName(key, ns);
    var words = shortName.replace(/_/g, ' ').split(' ');
    for (var i = 0; i < words.length; i++) {
        if (words[i].length > 0) {
            words[i] = words[i][0].toUpperCase() + words[i].substring(1);
        }
    }
    return (ns || '').split(':')[0] + ':' + words.join(' ');
}

/**
 * 根据短名称构建完整的 resource location 键名
 *
 * "standard_front_wheel" + "machine_max" → "machine_max:standard_front_wheel"
 *
 * @param {string} type - 类型标识（用于日志/校验，暂未使用）
 * @param {string} shortName - 短名称
 * @param {string} namespace - 命名空间
 * @returns {string} 全名
 */
function buildFullKey(type, shortName, namespace) {
    if (!shortName) return '';
    if (!namespace) return shortName;
    if (shortName.indexOf(':') >= 0) return shortName;
    return namespace + ':' + shortName;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extractShortName,
        displayLabel,
        buildFullKey,
    };
}
