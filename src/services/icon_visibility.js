// 文件: src/services/icon_visibility.js
// 用途: 由 start_bone / end_bones / auto_end_bones 计算可见 Group UUID 集
// 所属模块: MachineMax Blockbench 插件
//
// 纯函数：输入 plain node（{uuid,name,parentUuid}），不 require Blockbench / fs。
// 语义对齐 Java SubPartAttr.filterBones：
//   - start_bone 为空 = 整棵模型
//   - end = end_bones ∪ auto_end_bones
//   - end 骨骼自身及子树都排除
//   - 多个 sub_part 的可见集取并集，再补祖先

'use strict';

function asString(value) {
    return String(value == null ? '' : value);
}

function unique(list) {
    var out = [];
    var seen = {};
    (list || []).forEach(function (item) {
        var key = asString(item);
        if (!key || seen[key]) return;
        seen[key] = true;
        out.push(key);
    });
    return out;
}

function buildIndex(nodes) {
    var byUuid = {};
    var byName = {};
    var children = {};
    (nodes || []).forEach(function (node) {
        if (!node || !node.uuid) return;
        var uuid = asString(node.uuid);
        byUuid[uuid] = node;
        var name = asString(node.name);
        if (!byName[name]) byName[name] = [];
        byName[name].push(node);
        var parent = asString(node.parentUuid);
        if (parent) {
            if (!children[parent]) children[parent] = [];
            children[parent].push(uuid);
        }
    });
    return { byUuid: byUuid, byName: byName, children: children };
}

function collectSubtree(rootUuid, children, out) {
    var stack = [asString(rootUuid)];
    var seen = {};
    while (stack.length) {
        var uuid = stack.pop();
        if (!uuid || seen[uuid]) continue;
        seen[uuid] = true;
        if (out) out[uuid] = true;
        var list = children[uuid] || [];
        for (var i = 0; i < list.length; i++) stack.push(list[i]);
    }
    return seen;
}

function collectAncestors(uuid, byUuid, out) {
    var current = asString(uuid);
    var guard = 0;
    while (current && byUuid[current] && guard < 100000) {
        var parent = asString(byUuid[current].parentUuid);
        if (!parent || !byUuid[parent]) break;
        out[parent] = true;
        current = parent;
        guard++;
    }
}

function warning(code, message, extra) {
    return Object.assign({ code: code, message: message }, extra || {});
}

/**
 * @param {Array<{uuid:string,name:string,parentUuid:string}>} nodes
 * @param {Array<{start_bone?:string,end_bones?:string[],auto_end_bones?:string[]}>} subParts
 * @param {{strictStartBone?:boolean}} [options]
 * @returns {{
 *   visible: string[],
 *   warnings: Array,
 *   errors: Array,
 *   unresolvedStart: string[],
 *   unresolvedEnd: string[],
 *   duplicateStart: string[],
 *   fallback: boolean
 * }}
 */
function buildVisibility(nodes, subParts, options) {
    options = options || {};
    var index = buildIndex(nodes);
    var allUuids = (nodes || []).map(function (node) { return asString(node.uuid); }).filter(Boolean);
    var parts = Array.isArray(subParts) ? subParts : [];
    var warnings = [];
    var errors = [];
    var unresolvedStart = [];
    var unresolvedEnd = [];
    var duplicateStart = [];
    var visible = {};
    var anySubPart = false;
    var allStartEmpty = true;

    if (parts.length === 0) {
        allUuids.forEach(function (uuid) { visible[uuid] = true; });
        warnings.push(warning('no_sub_parts', '变体没有 sub_parts，按整棵模型生成'));
        return finish(visible, allUuids, warnings, errors, unresolvedStart, unresolvedEnd, duplicateStart, true);
    }

    parts.forEach(function (subPart, partIndex) {
        var startName = asString(subPart && subPart.start_bone).trim();
        var endNames = unique([].concat(
            (subPart && subPart.end_bones) || [],
            (subPart && subPart.auto_end_bones) || []
        ));

        if (startName) allStartEmpty = false;

        var excluded = {};
        endNames.forEach(function (endName) {
            var matches = index.byName[endName] || [];
            if (matches.length === 0) {
                unresolvedEnd.push(endName);
                warnings.push(warning('end_bone_not_found',
                    'end_bone "' + endName + '" 不存在，已忽略', { subPartIndex: partIndex, bone: endName }));
                return;
            }
            if (matches.length > 1) {
                warnings.push(warning('duplicate_end_bone',
                    'end_bone "' + endName + '" 有 ' + matches.length + ' 个同名组，全部排除',
                    { subPartIndex: partIndex, bone: endName }));
            }
            matches.forEach(function (match) {
                collectSubtree(match.uuid, index.children, excluded);
            });
        });

        var startSet;
        if (!startName) {
            startSet = {};
            allUuids.forEach(function (uuid) { startSet[uuid] = true; });
        } else {
            var matches = index.byName[startName] || [];
            if (matches.length === 0) {
                unresolvedStart.push(startName);
                errors.push(warning('start_bone_not_found',
                    'start_bone "' + startName + '" 不存在，跳过该 sub_part',
                    { subPartIndex: partIndex, bone: startName }));
                if (options.strictStartBone) return;
                return;
            }
            if (matches.length > 1) {
                duplicateStart.push(startName);
                warnings.push(warning('duplicate_start_bone',
                    'start_bone "' + startName + '" 有 ' + matches.length + ' 个同名组，默认取第一个',
                    { subPartIndex: partIndex, bone: startName }));
                if (options.strictStartBone) {
                    errors.push(warning('ambiguous_start_bone',
                        'start_bone "' + startName + '" 重名，严格模式跳过该 sub_part',
                        { subPartIndex: partIndex, bone: startName }));
                    return;
                }
            }
            startSet = collectSubtree(matches[0].uuid, index.children, null);
        }

        anySubPart = true;
        Object.keys(startSet).forEach(function (uuid) {
            if (!excluded[uuid]) visible[uuid] = true;
        });
    });

    if (!anySubPart) {
        if (allStartEmpty) {
            allUuids.forEach(function (uuid) { visible[uuid] = true; });
            errors.push(warning('no_visible_sub_parts', '所有 start_bone 为空，按整棵模型生成'));
            return finish(visible, allUuids, warnings, errors, unresolvedStart, unresolvedEnd, duplicateStart, true);
        }
        // 所有 start_bone 都解析失败：不要静默生成整机图，返回空可见集让调用方跳过。
        errors.push(warning('no_resolved_start_bones', '所有 start_bone 都无法解析，跳过该图标'));
        return finish(visible, allUuids, warnings, errors, unresolvedStart, unresolvedEnd, duplicateStart, false);
    }

    Object.keys(visible).forEach(function (uuid) {
        collectAncestors(uuid, index.byUuid, visible);
    });

    var result = finish(visible, allUuids, warnings, errors, unresolvedStart, unresolvedEnd, duplicateStart,
        parts.length === 0 || allStartEmpty);
    if (result.visible.length === 0) {
        errors.push(warning('empty_visibility', '可见集为空，可能 start_bone 与 end_bones 互相抵消'));
    }
    return result;
}

function finish(visibleMap, allUuids, warnings, errors, unresolvedStart, unresolvedEnd, duplicateStart, fallback) {
    var visible = [];
    allUuids.forEach(function (uuid) {
        if (visibleMap[uuid]) visible.push(uuid);
    });
    return {
        visible: visible,
        warnings: warnings,
        errors: errors,
        unresolvedStart: unresolvedStart,
        unresolvedEnd: unresolvedEnd,
        duplicateStart: duplicateStart,
        fallback: !!fallback,
    };
}

module.exports = {
    buildVisibility: buildVisibility,
    _internals: {
        buildIndex: buildIndex,
        collectSubtree: collectSubtree,
        collectAncestors: collectAncestors,
    },
};
