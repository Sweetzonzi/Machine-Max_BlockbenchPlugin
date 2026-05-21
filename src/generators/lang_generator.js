const { createLogger } = require('../utils/logger.js');
var nameUtils = require('../utils/name_utils.js');

var log = createLogger('GenLang');

/**
 * 将下划线分隔的标识符转为首字母大写的英文显示名
 * "engine" → "Engine"
 * "ae86_chassis" → "Ae86 Chassis"
 */
function _toDisplayName(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}

/**
 * lang/*.json 生成器
 *
 * 遍历 config.parts 树，为以下 5 类用户指定的标识名生成翻译键。
 * 零件定义 JSON 中的 map key 已经是完整键格式
 * （如 "sub_part.machine_max.main"、"interact.machine_max.seat"），
 * 因此直接用作翻译键，不再拼接前缀。
 *
 * 1. 零件 ID:         {ns}.{partId}
 * 2. 子零件名:        sub_part.{ns}.{key}  （跳过 "main"）
 * 3. 交互区名:        interact.{ns}.{key}
 * 4. 连接点名:        connector.{ns}.{key}
 * 5. 子系统名:        subsystem.{ns}.{key}
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

        /* 1. 零件 ID 翻译键: {ns}.{partId} */
        var partKey = ns + '.' + partId;
        enLang[partKey] = _toDisplayName(partId);
        zhLang[partKey] = _toDisplayName(partId);

        var variants = partConfig.variants || {};
        var variantMap;
        if (typeof variants.model === 'string') {
            variantMap = { _default: variants };
        } else {
            variantMap = variants;
        }

        for (var variantName in variantMap) {
            if (!variantMap.hasOwnProperty(variantName)) continue;
            var variant = variantMap[variantName];

            var subParts = variant.sub_parts || {};
            var subPartMap;
            if (typeof subParts.durability === 'number') {
                subPartMap = { _single: subParts };
            } else {
                subPartMap = subParts;
            }

            for (var subPartKey in subPartMap) {
                if (!subPartMap.hasOwnProperty(subPartKey)) continue;
                var subPart = subPartMap[subPartKey];
                if (!subPart || typeof subPart !== 'object') continue;

                /* 2. 子零件名: map key 已是完整键，直接使用（跳过 "main"） */
                if (subPartKey !== '_single' && subPartKey !== 'sub_part.' + ns + '.main') {
                    var spShortName = nameUtils.extractShortName(subPartKey, ns);
                    enLang[subPartKey] = _toDisplayName(spShortName);
                    zhLang[subPartKey] = _toDisplayName(spShortName);
                }

                /* 3. 交互区名: map key 已是完整键 */
                var interactBoxes = subPart.interact_boxes || {};
                for (var interactKey in interactBoxes) {
                    if (!interactBoxes.hasOwnProperty(interactKey)) continue;
                    var ibShortName = nameUtils.extractShortName(interactKey, ns);
                    enLang[interactKey] = _toDisplayName(ibShortName);
                    zhLang[interactKey] = _toDisplayName(ibShortName);
                }

                /* 4. 连接点名: map key 已是完整键 */
                var connectors = subPart.connectors || {};
                for (var connectorKey in connectors) {
                    if (!connectors.hasOwnProperty(connectorKey)) continue;
                    var connShortName = nameUtils.extractShortName(connectorKey, ns);
                    enLang[connectorKey] = _toDisplayName(connShortName);
                    zhLang[connectorKey] = _toDisplayName(connShortName);
                }

                /* 5. 子系统名: map key 已是完整键 */
                var subsystems = subPart.subsystems || {};
                for (var subsystemKey in subsystems) {
                    if (!subsystems.hasOwnProperty(subsystemKey)) continue;
                    var ssShortName = nameUtils.extractShortName(subsystemKey, ns);
                    enLang[subsystemKey] = _toDisplayName(ssShortName);
                    zhLang[subsystemKey] = _toDisplayName(ssShortName);
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
