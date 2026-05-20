const { createLogger } = require('../utils/logger.js');
const { PartCodec } = require('../codec/codecs/part_codec.js');

/** 模块日志 */
var log = createLogger('GenPart');

/**
 * parts/*.json 生成器 — 将 MMProjectConfig.parts 中的零件配置导出为 MachineMax 格式的 JSON 文件
 */

function generatePartJSON(partConfig) {
    return PartCodec.encode(partConfig);
}

/**
 * 遍历零件配置，将所有 hit_boxes 和 interact_boxes 的 UUID 键解析为骨骼名
 * UUID 用于编辑模式下稳定追踪，导出时需转为 Group.name
 * @param {Object} partConfig - 零件配置（会修改原对象）
 * @returns {Object} 修改后的 partConfig
 */
function _resolveAllUUIDKeys(partConfig) {
    if (!partConfig || !partConfig.variants) return partConfig;
    for (var vKey in partConfig.variants) {
        var sub_parts = partConfig.variants[vKey].sub_parts;
        if (!sub_parts) continue;
        for (var spKey in sub_parts) {
            var sp = sub_parts[spKey];
            if (!sp) continue;
            if (sp.hit_boxes && typeof sp.hit_boxes === 'object') {
                sp.hit_boxes = _resolveUUIDKeys(sp.hit_boxes);
            }
            if (sp.interact_boxes && typeof sp.interact_boxes === 'object') {
                sp.interact_boxes = _resolveUUIDKeys(sp.interact_boxes);
            }
        }
    }
    return partConfig;
}

function generateAllParts(projectConfig) {
    const parts = projectConfig.parts || {};
    const result = {};

    for (const [partId, partConfig] of Object.entries(parts)) {
        // 深拷贝后解析 UUID 为骨骼名，避免修改实时配置
        var resolved = _resolveAllUUIDKeys(JSON.parse(JSON.stringify(partConfig)));
        result[partId] = generatePartJSON(resolved);
    }

    log.info('generateAllParts: 已生成 ' + Object.keys(result).length + ' 个零件');
    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generatePartJSON, generateAllParts };
}
