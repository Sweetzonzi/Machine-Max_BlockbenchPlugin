const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('GenLang');

/**
 * 将下划线分隔的标识符转为首字母大写的英文显示名
 * "ae86_chassis" → "Ae86 Chassis"
 */
function _toDisplayName(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}

/**
 * lang/*.json 生成器 — 根据零件定义中的用户指定名称自动生成本地化条目
 *
 * 遍历 config.parts 树，为以下 5 类用户指定的标识名生成翻译键：
 *   1. 零件 ID:         {ns}.{partId}
 *   2. 子零件名:        sub_part.{ns}.{key}       （跳过 "main"）
 *   3. 交互区名:        interact.{ns}.{key}
 *   4. 连接点名:        connector.{ns}.{key}
 *   5. 子系统名:        subsystem.{ns}.{key}
 *
 * 不处理静态属性文件（connector/subsystem static_attr），仅处理零件定义 JSON
 * 中的用户命名。所有键的初始英文名由 _toDisplayName() 自动生成，
 * 最终通过 mergeJSONFile 合并写入，已有手动翻译不受影响。
 */
function generateAllLangs(projectConfig) {
    var result = {};
    var zhLang = {};
    var enLang = {};
    var ns = projectConfig.namespace || 'machine_max';
    var parts = projectConfig.parts || {};

    for (var partId in parts) {
        if (!parts.hasOwnProperty(partId)) continue;
        var partConfig = parts[partId];

        // 1. 零件 ID 翻译键: {ns}.{partId}
        var partKey = ns + '.' + partId;
        var partDisplayName = _toDisplayName(partId);
        enLang[partKey] = partDisplayName;
        zhLang[partKey] = partDisplayName;

        // variants 可能是单变体直接量（Either 简写）或多变体 map
        var variants = partConfig.variants || {};
        var variantMap;
        if (typeof variants.model === 'string') {
            // 单变体简写: 直接是 VariantCodec 对象，包装为 map
            variantMap = { _default: variants };
        } else {
            variantMap = variants;
        }

        for (var variantName in variantMap) {
            if (!variantMap.hasOwnProperty(variantName)) continue;
            var variant = variantMap[variantName];

            // sub_parts 可能是单子零件直接量（Either 简写）或多子零件 map
            var subParts = variant.sub_parts || {};
            var subPartMap;
            if (typeof subParts.durability === 'number') {
                // 单子零件简写: 直接是 SubPartCodec 对象，无命名 key，不生成 sub_part 键
                subPartMap = { _single: subParts };
            } else {
                subPartMap = subParts;
            }

            for (var subPartKey in subPartMap) {
                if (!subPartMap.hasOwnProperty(subPartKey)) continue;
                var subPart = subPartMap[subPartKey];
                if (!subPart || typeof subPart !== 'object') continue;

                // 2. 子零件名翻译键（跳过 "main"）
                if (subPartKey !== '_single' && subPartKey !== 'main') {
                    var spKey = 'sub_part.' + ns + '.' + subPartKey;
                    var spName = _toDisplayName(subPartKey);
                    enLang[spKey] = spName;
                    zhLang[spKey] = spName;
                }

                // 3. 交互区名翻译键: interact.{ns}.{key}
                var interactBoxes = subPart.interact_boxes || {};
                for (var interactKey in interactBoxes) {
                    if (!interactBoxes.hasOwnProperty(interactKey)) continue;
                    var itKey = 'interact.' + ns + '.' + interactKey;
                    var itName = _toDisplayName(interactKey);
                    enLang[itKey] = itName;
                    zhLang[itKey] = itName;
                }

                // 4. 连接点名翻译键: connector.{ns}.{key}
                var connectors = subPart.connectors || {};
                for (var connectorKey in connectors) {
                    if (!connectors.hasOwnProperty(connectorKey)) continue;
                    var connKey = 'connector.' + ns + '.' + connectorKey;
                    var connName = _toDisplayName(connectorKey);
                    enLang[connKey] = connName;
                    zhLang[connKey] = connName;
                }

                // 5. 子系统名翻译键: subsystem.{ns}.{key}
                var subsystems = subPart.subsystems || {};
                for (var subsystemKey in subsystems) {
                    if (!subsystems.hasOwnProperty(subsystemKey)) continue;
                    var ssKey = 'subsystem.' + ns + '.' + subsystemKey;
                    var ssName = _toDisplayName(subsystemKey);
                    enLang[ssKey] = ssName;
                    zhLang[ssKey] = ssName;
                }
            }
        }
    }

    result['zh_cn'] = zhLang;
    result['en_us'] = enLang;

    log.info('generateAllLangs: 已生成本地化，键数=' + Object.keys(zhLang).length);
    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateAllLangs };
}
