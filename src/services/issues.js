// 文件: src/services/issues.js
// 用途: 问题清单的单一真源 —— 面板、Blockbench 原生校验、导出闸门共用同一份结果
// 所属模块: MachineMax Blockbench 插件
//
// 为什么单独一层：问题来自两处，缺一不可。
//   - services/validate.js 的 collectIssues：业务完整性（型号是否存在、名称冲突、
//     信号目标断裂、未知/已退役类型、结构不是对象……）
//   - doc/validate.js 的 validateTree：schema 值与 key（类型、枚举、范围、必填、
//     容器形状）
// 导出闸门原先自己拼这两层，面板与原生校验只看第一层，于是「值类型不对」这类问题
// 在界面上看不到、只有导出时才蹦出来。现在统一从这里取。
//
// 导出闸门额外加一步编码试跑（probeEncodable）：闸门放行的数据必须真的能编码成
// 导出 JSON，否则写盘写到一半才抛错，留下半个内容包。

'use strict';

var { collectIssues } = require('./validate.js');
var { validateTree } = require('../doc/validate.js');
var keys = require('../doc/keys.js');
var { PartCodec } = require('../codec/codecs/part_codec.js');

/** 容器字段 → 条目 scope（与 collectIssues 的 path.scope 同一套词） */
var ITEM_CONTAINERS = {
    hit_boxes: 'hit_box',
    interact_boxes: 'interact_box',
    connectors: 'connector',
    subsystems: 'subsystem',
};

/**
 * 把 validateTree 的段数组转成与 collectIssues 相同的 Problem 形状。
 * 固定层级：parts/<id>/variants/<v>/sub_parts/<sp>/{container}/<item>/<field...>
 *
 * @param {Object} error - { path, code, expected, got, hint }
 * @param {Object} config
 * @returns {Object} Problem
 */
function toProblem(error, config) {
    var segs = (error && error.path) || [];
    var path = { scope: 'config', partId: '', variantName: '' };

    if (segs[0] === 'parts' && segs.length >= 2) {
        path.scope = 'part';
        path.partId = segs[1];
    }
    if (segs[2] === 'variants' && segs.length >= 4) {
        path.scope = 'variant';
        path.variantName = segs[3];
    }

    var leafStart = 4;
    if (segs[4] === 'sub_parts' && segs.length >= 6) {
        path.scope = 'subpart';
        path.subPartKey = segs[5];
        leafStart = 6;
    }

    var container = segs[leafStart];
    if (container && ITEM_CONTAINERS[container] && segs.length > leafStart + 1) {
        path.scope = ITEM_CONTAINERS[container];
        path.itemKey = segs[leafStart + 1];
        path.field = segs.slice(leafStart + 2).join('.');
        if (path.scope === 'hit_box') {
            path.elementUuid = path.itemKey;
        } else if (path.scope === 'interact_box' && config) {
            path.elementUuid = _findInteractBoxUuid(config, path);
        }
    } else {
        path.field = segs.slice(leafStart).join('.');
    }

    var detail = error.hint || error.expected || '';
    if (typeof detail === 'object') detail = JSON.stringify(detail);
    var message = error.code + (detail ? '：' + detail : '');
    if (error.got !== undefined && error.got !== null && typeof error.got !== 'object') {
        message += '（当前值: ' + String(error.got) + '）';
    }

    return {
        severity: 'error',
        code: error.code,
        message: message,
        path: path,
    };
}

function _findInteractBoxUuid(config, path) {
    var variant = config && config.parts && config.parts[path.partId]
        && config.parts[path.partId].variants
        && config.parts[path.partId].variants[path.variantName];
    var sp = variant && variant.sub_parts && variant.sub_parts[path.subPartKey];
    var entry = sp && sp.interact_boxes && sp.interact_boxes[path.itemKey];
    return (entry && entry._uuid) || '';
}

/** 去重键：同一字段的同一个问题只留一条 */
function issueKey(p) {
    var path = (p && p.path) || {};
    return [
        path.scope || '',
        path.partId || '',
        path.variantName || '',
        path.subPartKey || '',
        path.itemKey || '',
        path.field || '',
    ].join('|');
}

/**
 * 去重：collectIssues 优先，validateTree 只补空缺；同一字段只留一条。
 * 不同字段（definition / locator）即使路径相同也各自保留。
 */
function dedupeIssues(primary, schema) {
    var out = [];
    var seen = {};
    (primary || []).forEach(function (p) {
        out.push(p);
        seen[issueKey(p)] = true;
    });
    (schema || []).forEach(function (p) {
        var key = issueKey(p);
        if (!seen[key]) {
            seen[key] = true;
            out.push(p);
        }
    });
    return out;
}

/**
 * 业务问题 + schema 值问题（合并去重）。面板徽章、原生校验清单用它。
 *
 * @param {Object} config
 * @returns {Array} Problem[]
 */
function collectAllIssues(config) {
    if (!config || typeof config !== 'object') return [];

    var primary = collectIssues(config);

    // partId 路径安全也属于导出前必须拦下的业务错误
    Object.keys(config.parts || {}).forEach(function (partId) {
        if (!keys.isSafePartId(partId)) {
            primary.push({
                severity: 'error',
                code: 'unsafe_part_id',
                message: '零件 ID "' + partId + '" 不安全（不能作为导出路径段）',
                path: { scope: 'part', partId: partId, variantName: '', field: '' },
            });
        }
    });

    var schema = validateTree(config, { completeness: true }).map(function (e) {
        return toProblem(e, config);
    });
    return dedupeIssues(primary, schema);
}

/**
 * 编码试跑：导出闸门放行的数据必须真的能编码成导出 JSON。
 *
 * 有些问题 schema 值校验看不出（例如内部树里 codec 要求更严的形状），
 * 直接让 `executeExport` 写到一半抛错会留下半个内容包，所以在这里先试一遍。
 * 已经有 error 的零件跳过：那件本来就要先修，重复报错只会盖住真正的原因。
 *
 * @param {Object} config
 * @param {Array} existingIssues - 已有问题（用于跳过）
 * @returns {Array} Problem[]
 */
function probeEncodable(config, existingIssues) {
    var out = [];
    var parts = (config && config.parts) || {};
    var reported = existingIssues || [];

    Object.keys(parts).forEach(function (partId) {
        var hasError = reported.some(function (p) {
            return p && p.severity === 'error' && p.path && p.path.partId === partId;
        });
        if (hasError) return;

        try {
            PartCodec.encode(JSON.parse(JSON.stringify(parts[partId])));
        } catch (e) {
            out.push({
                severity: 'error',
                code: 'encode_failed',
                message: '零件 "' + partId + '" 的数据无法编码成导出 JSON：'
                    + (e && e.message ? e.message : String(e)),
                path: { scope: 'part', partId: partId, variantName: '', field: '' },
            });
        }
    });
    return out;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toProblem: toProblem,
        dedupeIssues: dedupeIssues,
        issueKey: issueKey,
        collectAllIssues: collectAllIssues,
        probeEncodable: probeEncodable,
    };
}
