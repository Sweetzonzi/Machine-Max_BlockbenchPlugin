// 文件: src/services/export.js
// 用途: 导出闸门 canExport + partId 出口断言（docs/13 §4.3 / §8）
// 所属模块: MachineMax Blockbench 插件
//
// 过渡期（P3）：collectIssues 仍在 mode/validation.js；P4 下沉到 core/validation.js。
// services 层可以 require fs、async、不参与撤销、不暴露给 MCP。

'use strict';

var { collectIssues } = require('../mode/validation.js');
var { validateTree } = require('../doc/validate.js');
var keys = require('../doc/keys.js');
var { createLogger } = require('../utils/logger.js');

var log = createLogger('ExportService');

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
 * 导出闸门：业务完整性（collectIssues）+ schema 值/required（validateTree）。
 *
 * @param {Object} config
 * @returns {{ok:boolean, errors:Array, warnings:Array, issues:Array}}
 */
function canExport(config) {
    if (!config || typeof config !== 'object') {
        return {
            ok: false,
            errors: [{
                severity: 'error', code: 'config_unavailable',
                message: '配置不可用', path: { scope: 'config', partId: '', variantName: '', field: '' },
            }],
            warnings: [],
            issues: [],
        };
    }

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
    var issues = dedupeIssues(primary, schema);
    var errors = issues.filter(function (p) { return p.severity === 'error'; });
    var warnings = issues.filter(function (p) { return p.severity !== 'error'; });
    return { ok: errors.length === 0, errors: errors, warnings: warnings, issues: issues };
}

/**
 * 导出管线写盘前的最后一道断言（docs/13 §4.3 / §11 #20）。
 * 必须在任何 mkdir/writeFile 之前调用，保证坏 partId 不产生半个包。
 */
function assertSafePartIds(config) {
    var bad = Object.keys((config && config.parts) || {}).filter(function (partId) {
        return !keys.isSafePartId(partId);
    });
    if (bad.length > 0) {
        var err = new Error('存在不安全的零件 ID，已阻止导出: ' + bad.join(', '));
        err.code = 'unsafe_part_id';
        err.partIds = bad;
        log.error(err.message);
        throw err;
    }
    return true;
}

module.exports = {
    canExport: canExport,
    assertSafePartIds: assertSafePartIds,
    dedupeIssues: dedupeIssues,
    toProblem: toProblem,
    _issueKey: issueKey,
};
