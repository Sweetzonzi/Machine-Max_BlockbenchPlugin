// 文件: src/mcp/result.js
// 用途: MCP 工具统一返回信封（docs/12 §5.5 / docs/13 §12）
// 所属模块: MachineMax Blockbench 插件
//
// 工具层只做字段裁剪，不重新解释 OpResult。失败一律 ok:false，不抛异常。

'use strict';

var PASS_FIELDS = [
    'path', 'data', 'changed', 'before', 'after',
    'reset_fields', 'dropped_fields', 'cleaned_references',
    'unresolved_bones', 'warnings', 'action', 'key',
    'part_id', 'variant', 'parent_part', 'parent_variant', 'parent_sub_part',
    'introduced_issues',
];

function copyDefined(target, source, fields) {
    fields.forEach(function (key) {
        if (source && source[key] !== undefined) target[key] = source[key];
    });
    return target;
}

function error(message, errors, extra) {
    return Object.assign({
        ok: false,
        error: message || '操作失败',
        errors: errors || [],
    }, extra || {});
}

/**
 * OpResult → 工具返回。
 *
 * @param {object} r
 * @param {object} [extra]
 * @returns {object}
 */
function from(r, extra) {
    if (!r || typeof r !== 'object') return error('操作没有返回结果');
    if (!r.ok) {
        return copyDefined(Object.assign({
            ok: false,
            error: r.error || '操作失败',
            errors: r.errors || [],
        }, extra || {}), r, PASS_FIELDS);
    }

    var out = { ok: true };
    copyDefined(out, r, PASS_FIELDS);
    if (r.changed === false) out.changed = false;
    return Object.assign(out, extra || {});
}

/**
 * 包装成 MCP 结构化返回；没有 MCP.createJsonResult 时原样返回（Node 测试）。
 */
function wrap(mcp, payload) {
    if (mcp && typeof mcp.createJsonResult === 'function') {
        return mcp.createJsonResult(payload);
    }
    return payload;
}

module.exports = {
    error: error,
    from: from,
    wrap: wrap,
};
