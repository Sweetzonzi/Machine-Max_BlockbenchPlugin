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
 * 将对象中的 UUID key 解析为 Blueprint 元素的骨骼名（Group.name）
 * 运行时数据使用骨骼名而不是 UUID 作为 hit_boxes/interact_boxes 的键
 * @param {Object<string, *>} obj - UUID 为 key 的对象
 * @returns {Object<string, *>} 骨骼名为 key 的新对象
 */
function _resolveUUIDKeys(obj) {
    var resolved = {};
    for (var key in obj) {
        var boneName = key;
        if (typeof Group !== 'undefined' && Group.all) {
            var group = Group.all.find(function(g) { return g.uuid === key; });
            if (group) boneName = group.name;
        }
        resolved[boneName] = obj[key];
    }
    return resolved;
}

function generateAllParts(projectConfig) {
    const parts = projectConfig.parts || {};
    const result = {};

    for (const [partId, partConfig] of Object.entries(parts)) {
        result[partId] = generatePartJSON(partConfig);
    }

    log.info('generateAllParts: 已生成 ' + Object.keys(result).length + ' 个零件');
    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generatePartJSON, generateAllParts };
}
