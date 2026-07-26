var { createLogger } = require('../utils/logger.js');
var { getMarkersForVariant, detectOwnerSubPart } = require('../core/element_markers.js');

var log = createLogger('Validation');

/**
 * 校验单个变体中是否存在游离标记（标记了但无归属子零件）
 * 同时检测幽灵标记（UUID 对应的 Blockbench 元素已不存在）
 * @param {Object} config - MM 项目配置
 * @param {string} partId - 零件 ID
 * @param {string} vName - 变体名
 * @param {Array} errors - 错误列表（就地追加）
 */
function checkOrphanedMarkers(config, partId, vName, errors) {
    // 构建当前模型中所有有效元素的 UUID 集合
    var validUUIDs = {};
    var allGroups = (typeof Group !== 'undefined' && Group.all) ? Group.all : [];
    var allLocators = (typeof Locator !== 'undefined' && Locator.all) ? Locator.all : [];
    for (var gi = 0; gi < allGroups.length; gi++) {
        validUUIDs[allGroups[gi].uuid] = true;
    }
    for (var li = 0; li < allLocators.length; li++) {
        validUUIDs[allLocators[li].uuid] = true;
    }

    var markers = getMarkersForVariant(config, partId, vName);
    for (var uuid in markers) {
        var marker = markers[uuid];

        // 检测幽灵标记：UUID 对应的元素已不存在于模型中
        if (!validUUIDs[uuid]) {
            var typeLabel = (marker.type === 'sub_part') ? '子零件' :
                            (marker.type === 'hit_box') ? '碰撞箱' :
                            (marker.type === 'connector') ? '连接点' :
                            (marker.type === 'interact_box') ? '交互区' : marker.type;
            errors.push(
                '零件 "' + partId + '"/' + vName + ' 中存在幽灵' + typeLabel + '标记（UUID: ' + uuid +
                '），对应的模型元素已被删除。建议保存后重新打开项目以自动清理。'
            );
            continue; // 元素不存在，跳过后续的游离检测
        }

        if (marker.type === 'hit_box') {
            var group = allGroups.find(function (g) { return g.uuid === uuid; });
            if (group) {
                var owner = detectOwnerSubPart(config, partId, vName, group);
                if (!owner) {
                    errors.push('零件 "' + partId + '"/' + vName + ' 中碰撞箱 "' + group.name + '" 为游离状态（无归属子零件，不会被防护计算处理）');
                }
            }
        } else if (marker.type === 'connector') {
            var loc = allLocators.find(function (l) { return l.uuid === uuid; });
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
 * 通过 subsystem_types.js 的 dynamicFields 注册表，数据驱动校验每个子系统实例的必填字段
 *
 * 对每个子系统中 required: true 的字段，检查其值是否为 null 或 undefined。
 * 空字符串 ''、空数组 [] 等被视为"用户明确留空"，不触发告警。
 * 新增子系统类型或字段只需修改 subsystem_types.js，无需改动本函数。
 */
function checkSubsystemRequiredFields(config, errors) {
    var ssTypes = require('../core/subsystem_types.js');
    var parts = config.parts || {};

    for (const [partId, part] of Object.entries(parts)) {
        var variants = part.variants || {};
        for (const [vName, variant] of Object.entries(variants)) {
            var subParts = variant.sub_parts || {};
            for (const [spName, sp] of Object.entries(subParts)) {
                var subsystems = sp.subsystems || {};
                for (const [ssName, ss] of Object.entries(subsystems)) {
                    var typeMeta = ssTypes.getTypeMeta(ss.type);
                    if (!typeMeta) continue;
                    var fields = typeMeta.dynamicFields;
                    for (var fi = 0; fi < fields.length; fi++) {
                        var f = fields[fi];
                        if (f.required) {
                            var val = ss[f.field];
                            if (val === null || val === undefined) {
                                errors.push(
                                    '子系统 "' + ssName + '" 在零件 "' + partId + '"/' + vName +
                                    ' 子零件 "' + spName + '" 中：' + f.label + '（' + f.field + '）' +
                                    '为必填字段但未配置'
                                );
                            }
                        }
                    }
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

    // 校验子系统必填字段（数据驱动）
    checkSubsystemRequiredFields(config, errors);

    return errors;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runValidation };
}
