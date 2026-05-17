var { createLogger } = require('../utils/logger.js');
var { getMarkersForVariant, detectOwnerSubPart } = require('../core/element_markers.js');

var log = createLogger('Validation');

/**
 * 校验单个变体中是否存在游离标记（标记了但无归属子零件）
 * @param {Object} config - MM 项目配置
 * @param {string} partId - 零件 ID
 * @param {string} vName - 变体名
 * @param {Array} errors - 错误列表（就地追加）
 */
function checkOrphanedMarkers(config, partId, vName, errors) {
    var markers = getMarkersForVariant(config, partId, vName);
    for (var uuid in markers) {
        var marker = markers[uuid];
        if (marker.type === 'hit_box') {
            var group = typeof Group !== 'undefined' ? Group.all.find(function (g) { return g.uuid === uuid; }) : null;
            if (group) {
                var owner = detectOwnerSubPart(config, partId, vName, group);
                if (!owner) {
                    errors.push('零件 "' + partId + '"/' + vName + ' 中碰撞箱 "' + group.name + '" 为游离状态（无归属子零件，不会被防护计算处理）');
                }
            }
        } else if (marker.type === 'connector') {
            var loc = typeof Locator !== 'undefined' ? Locator.all.find(function (l) { return l.uuid === uuid; }) : null;
            if (loc) {
                var owner = detectOwnerSubPart(config, partId, vName, loc);
                if (!owner) {
                    errors.push('零件 "' + partId + '"/' + vName + ' 中连接点 "' + loc.name + '" 为游离状态（无归属子零件，将不会计入导出）');
                }
            }
        }
    }
}

/**
 * 运行基础校验
 */
function runValidation(config) {
    const errors = [];
    const parts = config.parts || {};

    if (Object.keys(parts).length === 0) {
        errors.push('未定义任何零件');
        return errors;
    }

    for (const [partId, part] of Object.entries(parts)) {
        const variants = part.variants || {};
        if (Object.keys(variants).length === 0) {
            errors.push(`零件 "${partId}"：没有定义变体`);
            continue;
        }

        for (const [vName, variant] of Object.entries(variants)) {
            if (!variant.model) {
                errors.push(`零件 "${partId}" 变体 "${vName}"：未设置模型引用`);
            }
            const subParts = variant.sub_parts || {};
            if (Object.keys(subParts).length === 0) {
                errors.push(`零件 "${partId}" 变体 "${vName}"：未定义子零件`);
            }
            for (const [spName, sp] of Object.entries(subParts)) {
                if (Object.keys(sp.hit_boxes || {}).length === 0) {
                    errors.push(`零件 "${partId}"/${vName} 子零件 "${spName}"：碰撞箱为空`);
                }
                if ((sp.mass || 0) <= 0) {
                    errors.push(`零件 "${partId}"/${vName} 子零件 "${spName}"：质量必须大于 0`);
                }
            }

            // 校验游离标记
            checkOrphanedMarkers(config, partId, vName, errors);
        }
    }

    return errors;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runValidation };
}
