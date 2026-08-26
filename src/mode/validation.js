/**
 * validation.js — 唯一校验实现 collectIssues(config) → Problem[]
 *
 * 单一真源：所有消费点（原生清单 validation_check / 面板 App.vue.js / 导出对话框）
 * 都调用本函数的同一份实现，消除"面板一套、原生清单一套"的二次散乱。
 *
 * 依赖 Blockbench 全局 Group / Locator / Project（仅运行时可用），属"只读、不修改全局"。
 */
var { createLogger } = require('../utils/logger.js');
var { getMarkersForVariant, detectOwnerSubPart } = require('../core/element_markers.js');
var ssTypes = require('../core/subsystem_types.js');
var cp = require('../core/content_pack_manager.js');
var { CODES, isMissingValue } = require('../core/validation_types.js');

var log = createLogger('Validation');

/** 标记类型 → 问题 scope */
function _scopeForMarkerType(type) {
    if (type === 'sub_part') return 'subpart';
    return type; // hit_box | connector | interact_box
}

/** 构造 Problem 对象（结构见 validation_types.js） */
function _makeProblem(severity, code, message, path) {
    return { severity: severity, code: code, message: message, path: path };
}

/** 构造 path，仅填充有值的可选字段以免污染聚合 */
function _mkPath(scope, partId, variantName, subPartKey, itemKey, elementUuid) {
    var path = { scope: scope, partId: partId, variantName: variantName };
    if (subPartKey) path.subPartKey = subPartKey;
    if (itemKey) path.itemKey = itemKey;
    if (elementUuid) path.elementUuid = elementUuid;
    return path;
}

/** 按子系统类型过滤可用型号定义（与 subsystem_panel.html 的 filteredSubsystemDefs 一致） */
function _filterDefsByType(defs, typeId) {
    var result = {};
    if (!defs || !typeId) return result;
    for (var id in defs) {
        if (defs.hasOwnProperty(id) && defs[id] && defs[id].type === typeId) {
            result[id] = defs[id];
        }
    }
    return result;
}

/**
 * 检测游离标记 + 幽灵标记（已补齐 interact_box 游离检测）
 * 结果直接 push 进 problems。
 *
 * 游离元素（无归属 subpart）无 subPartKey → 聚合时落 byPartVariant。
 * @param {Object} config
 * @param {string} partId
 * @param {string} vName
 * @param {Array} problems
 */
function _collectMarkerIssues(config, partId, vName, problems) {
    // 构建当前模型中所有有效元素的 UUID 集合
    var validUUIDs = {};
    var allGroups = (typeof Group !== 'undefined' && Group.all) ? Group.all : [];
    var allLocators = (typeof Locator !== 'undefined' && Locator.all) ? Locator.all : [];
    for (var gi = 0; gi < allGroups.length; gi++) validUUIDs[allGroups[gi].uuid] = true;
    for (var li = 0; li < allLocators.length; li++) validUUIDs[allLocators[li].uuid] = true;

    var markers = getMarkersForVariant(config, partId, vName);
    for (var uuid in markers) {
        var marker = markers[uuid];

        // 幽灵标记：UUID 对应的元素已不存在于模型中
        if (!validUUIDs[uuid]) {
            var typeLabel = (marker.type === 'sub_part') ? '子零件' :
                            (marker.type === 'hit_box') ? '碰撞箱' :
                            (marker.type === 'connector') ? '连接点' :
                            (marker.type === 'interact_box') ? '交互区' : marker.type;
            problems.push(_makeProblem(
                'error', CODES.GHOST_MARKER,
                '零件 "' + partId + '"/' + vName + ' 中存在幽灵' + typeLabel + '标记（UUID: ' + uuid +
                '），对应的模型元素已被删除。建议保存后重新打开项目以自动清理。',
                _mkPath(_scopeForMarkerType(marker.type), partId, vName, null, null, uuid)
            ));
            continue; // 元素不存在，跳过后续的游离检测
        }

        if (marker.type === 'hit_box') {
            var group = allGroups.find(function (g) { return g.uuid === uuid; });
            if (group) {
                var owner = detectOwnerSubPart(config, partId, vName, group);
                if (!owner) {
                    problems.push(_makeProblem(
                        'warning', CODES.ORPHAN_ELEMENT,
                        '零件 "' + partId + '"/' + vName + ' 中碰撞箱 "' + group.name + '" 为游离状态（无归属子零件，不会被防护计算处理）',
                        _mkPath('hit_box', partId, vName, null, null, uuid)
                    ));
                }
            }
        } else if (marker.type === 'connector') {
            var loc = allLocators.find(function (l) { return l.uuid === uuid; });
            if (loc) {
                var owner = detectOwnerSubPart(config, partId, vName, loc);
                if (!owner) {
                    problems.push(_makeProblem(
                        'warning', CODES.ORPHAN_ELEMENT,
                        '零件 "' + partId + '"/' + vName + ' 中连接点 "' + loc.name + '" 为游离状态（无归属子零件，将不会计入导出）',
                        _mkPath('connector', partId, vName, null, null, uuid)
                    ));
                }
            }
        } else if (marker.type === 'interact_box') {
            var ibGroup = allGroups.find(function (g) { return g.uuid === uuid; });
            if (ibGroup) {
                var owner = detectOwnerSubPart(config, partId, vName, ibGroup);
                if (!owner) {
                    problems.push(_makeProblem(
                        'warning', CODES.ORPHAN_ELEMENT,
                        '零件 "' + partId + '"/' + vName + ' 中交互区 "' + ibGroup.name + '" 为游离状态（无归属子零件，不会被交互处理）',
                        _mkPath('interact_box', partId, vName, null, null, uuid)
                    ));
                }
            }
        }
    }
}

/**
 * 唯一校验实现：收集所有问题的结构化 Problem 数组
 * @param {Object} config - MM 项目配置
 * @returns {Array} Problem[]
 */
function collectIssues(config) {
    var problems = [];
    var parts = (config && config.parts) || {};
    var partIds = Object.keys(parts);

    if (partIds.length === 0) {
        problems.push(_makeProblem(
            'error', CODES.MISSING_REQUIRED, '未定义任何零件，无法校验',
            _mkPath('part', '', '')
        ));
        return problems;
    }

    // 预加载合并后的定义（供 definition 引用存在性校验）
    var subsystemDefs = cp.loadMergedDefs(config, 'subsystems').defs || {};
    var connectorDefs = cp.loadMergedDefs(config, 'connectors').defs || {};

    for (var i = 0; i < partIds.length; i++) {
        var partId = partIds[i];
        var part = parts[partId];
        var variants = part.variants || {};
        var variantNames = Object.keys(variants);

        if (variantNames.length === 0) {
            problems.push(_makeProblem(
                'error', CODES.MISSING_REQUIRED, '零件 "' + partId + '"：没有定义变体',
                _mkPath('part', partId, '')
            ));
            continue;
        }

        for (var vi = 0; vi < variantNames.length; vi++) {
            var vName = variantNames[vi];
            var variant = variants[vName];

            if (!variant.model) {
                problems.push(_makeProblem(
                    'error', CODES.MISSING_REQUIRED, '零件 "' + partId + '" 变体 "' + vName + '"：未设置模型引用',
                    _mkPath('variant', partId, vName)
                ));
            }

            var subParts = variant.sub_parts || {};
            var spKeys = Object.keys(subParts);
            if (spKeys.length === 0) {
                problems.push(_makeProblem(
                    'error', CODES.MISSING_REQUIRED, '零件 "' + partId + '" 变体 "' + vName + '"：未定义子零件',
                    _mkPath('variant', partId, vName)
                ));
            }

            for (var si = 0; si < spKeys.length; si++) {
                var spKey = spKeys[si];
                var sp = subParts[spKey];

                if (Object.keys(sp.hit_boxes || {}).length === 0) {
                    problems.push(_makeProblem(
                        'error', CODES.MISSING_REQUIRED,
                        '零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"：碰撞箱为空',
                        _mkPath('subpart', partId, vName, spKey)
                    ));
                }
                if ((sp.mass || 0) <= 0) {
                    problems.push(_makeProblem(
                        'error', CODES.MISSING_REQUIRED,
                        '零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"：质量必须大于 0',
                        _mkPath('subpart', partId, vName, spKey)
                    ));
                }

                // 子系统实例必填字段 + definition 引用存在性
                var subsystems = sp.subsystems || {};
                for (var ssName in subsystems) {
                    var ss = subsystems[ssName];
                    var meta = ssTypes.getTypeMeta(ss.type);

                    // definition 校验（所有子系统类型均必含 definition）
                    if (isMissingValue(ss.definition)) {
                        problems.push(_makeProblem(
                            'error', CODES.DEFINITION_REQUIRED,
                            '子系统 "' + ssName + '" 在零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"：未指定型号定义，将导致该条目的类型在模组侧无法加载',
                            _mkPath('subsystem', partId, vName, spKey, ssName)
                        ));
                    } else {
                        var availableDefs = meta ? _filterDefsByType(subsystemDefs, ss.type) : subsystemDefs;
                        if (!availableDefs[ss.definition]) {
                            problems.push(_makeProblem(
                                'error', CODES.DEFINITION_REF_MISSING,
                                '子系统 "' + ssName + '" 在零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"：型号定义 "' + ss.definition + '" 不存在（引用断裂），将导致该条目的类型在模组侧无法加载',
                                _mkPath('subsystem', partId, vName, spKey, ssName)
                            ));
                        }
                    }

                    // 其余 required 字段（数据驱动，来自 subsystem_types.js）
                    if (meta && meta.dynamicFields) {
                        var fields = meta.dynamicFields;
                        for (var fi = 0; fi < fields.length; fi++) {
                            var f = fields[fi];
                            if (f.field === 'definition') continue;
                            if (f.required && isMissingValue(ss[f.field])) {
                                problems.push(_makeProblem(
                                    'error', CODES.SUBSYSTEM_REQUIRED_FIELD,
                                    '子系统 "' + ssName + '" 在零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"：' + f.label + '（' + f.field + '）为必填字段但未配置',
                                    _mkPath('subsystem', partId, vName, spKey, ssName)
                                ));
                            }
                        }
                    }
                }

                // 连接点实例 definition 校验
                var conns = sp.connectors || {};
                for (var connKey in conns) {
                    var conn = conns[connKey];
                    if (isMissingValue(conn.definition)) {
                        problems.push(_makeProblem(
                            'error', CODES.DEFINITION_REQUIRED,
                            '连接点 "' + connKey + '" 在零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"：未指定型号定义，将导致该连接点类型在模组侧无法加载',
                            _mkPath('connector', partId, vName, spKey, connKey)
                        ));
                    } else if (!connectorDefs[conn.definition]) {
                        problems.push(_makeProblem(
                            'error', CODES.DEFINITION_REF_MISSING,
                            '连接点 "' + connKey + '" 在零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"：型号定义 "' + conn.definition + '" 不存在（引用断裂），将导致该连接点类型在模组侧无法加载',
                            _mkPath('connector', partId, vName, spKey, connKey)
                        ));
                    }
                }
            }

            // 游离标记 / 幽灵标记
            _collectMarkerIssues(config, partId, vName, problems);
        }
    }

    return problems;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { collectIssues: collectIssues };
}
