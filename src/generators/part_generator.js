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

/**
 * 遍历零件配置，将所有 hit_boxes 和 interact_boxes 的 UUID 键解析为骨骼名（Group.name）。
 * UUID 用于编辑模式下稳定追踪，导出时需转为可读的骨骼名。
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

/**
 * 清理再生装弹机 projectile_types 中的占位键（__new_p_*），
 * 防止未选择的空条目被序列化到导出 JSON 中。
 * @param {Object} partConfig - 零件配置（会被就地修改）
 */
function _cleanProjectileTypes(partConfig) {
    if (!partConfig || !partConfig.variants) return;
    var PLACEHOLDER_PREFIX = '__new_p_';
    for (var vKey in partConfig.variants) {
        var sub_parts = partConfig.variants[vKey].sub_parts;
        if (!sub_parts) continue;
        for (var spKey in sub_parts) {
            var sp = sub_parts[spKey];
            if (!sp || !sp.subsystems) continue;
            for (var ssKey in sp.subsystems) {
                var ss = sp.subsystems[ssKey];
                if (!ss || ss.type !== 'machine_max:regen_loader') continue;
                var pt = ss.projectile_types;
                if (!pt || typeof pt !== 'object') continue;
                for (var k in pt) {
                    if (pt.hasOwnProperty(k) && k.indexOf(PLACEHOLDER_PREFIX) === 0) {
                        delete pt[k];
                    }
                }
            }
        }
    }
}

function generateAllParts(projectConfig) {
    const parts = projectConfig.parts || {};
    const result = {};

    for (const [partId, partConfig] of Object.entries(parts)) {
        // 深拷贝后解析 UUID 为骨骼名，并清理弹链占位键，避免修改实时配置
        var cloned = JSON.parse(JSON.stringify(partConfig));
        _resolveAllUUIDKeys(cloned);
        _cleanProjectileTypes(cloned);
        result[partId] = generatePartJSON(cloned);
    }

    log.info('generateAllParts: 已生成 ' + Object.keys(result).length + ' 个零件');
    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generatePartJSON, generateAllParts };
}
