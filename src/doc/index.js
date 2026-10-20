// 文件: src/doc/index.js
// 用途: 配置文档 API 统一入口（docs/13 §5.5）
// 所属模块: MachineMax Blockbench 插件
//
// `read` / `write` / `insert` / `remove` / `apply` 是原语：
//   - 不开撤销记录
//   - 不发事件
//   - 不碰全局对象
// 副作用由 ops 用 runConfigEdit 包住并执行 markerPlan / markerCleanup。

'use strict';

var address = require('./address.js');
var fieldSpecs = require('./field_specs.js');
var keys = require('./keys.js');
var projection = require('./projection.js');
var refs = require('./refs.js');
var validate = require('./validate.js');
var ports = require('./ports.js');
var shapes = require('./shapes.js');

function pathSegments(path) {
    var parsed = address.parsePath(path);
    if (!parsed.ok) return parsed;
    return { ok: true, segments: parsed.segments };
}

function withBase(path, opts) {
    var base = opts && Array.isArray(opts.base) ? opts.base : [];
    var parsed = pathSegments(path);
    if (!parsed.ok) return parsed;
    return { ok: true, segments: base.concat(parsed.segments) };
}

function read(config, path, opts) {
    opts = opts || {};
    var merged = withBase(path, opts);
    if (!merged.ok) return merged;
    return address.read(config, merged.segments, opts);
}

function write(config, path, value, opts) {
    opts = opts || {};
    var merged = withBase(path, opts);
    if (!merged.ok) return merged;
    return address.write(config, merged.segments, value, opts);
}

function insert(config, path, key, node, opts) {
    opts = opts || {};
    var merged = withBase(path, opts);
    if (!merged.ok) return merged;
    return address.insert(config, merged.segments, key, node, opts);
}

function remove(config, path, opts) {
    opts = opts || {};
    var merged = withBase(path, opts);
    if (!merged.ok) return merged;
    var result = address.remove(config, merged.segments, opts);
    if (!result.ok) return result;

    var key = merged.segments[merged.segments.length - 1];
    var kind = result.kind;
    if (kind === 'sub_part' || kind === 'subsystem' || kind === 'connector' || kind === 'interact_box') {
        var cleaned = refs.cleanDangling(config, {
            kind: kind,
            key: key,
            target: key,
        });
        result.cleaned_references = cleaned.cleaned_references;
    }
    return result;
}

function kindForPath(segments) {
    var n = segments.length;
    if (n >= 2 && segments[n - 2] === 'parts') return 'part';
    if (n >= 2 && segments[n - 2] === 'variants') return 'variant';
    if (n >= 2 && segments[n - 2] === 'sub_parts') return 'sub_part';
    if (n >= 2 && segments[n - 2] === 'subsystems') return 'subsystem';
    return null;
}

/**
 * 整件替换。
 *
 * @param {object} config
 * @param {string[]|string} path - 目标节点路径
 * @param {object} definition - 对外定义
 * @param {object} [opts] - projection.in 的 ctx + { kind }
 * @returns {object} projection.in 的结果（成功时已写入 config）
 */
function apply(config, path, definition, opts) {
    opts = opts || {};
    var merged = withBase(path, opts);
    if (!merged.ok) return merged;

    var segments = merged.segments;
    var kind = opts.kind || kindForPath(segments);
    if (!kind) {
        return {
            ok: false,
            errors: [{
                path: segments,
                code: 'unknown_type',
                expected: 'part | variant | sub_part | subsystem',
                got: segments,
                hint: '无法从路径推断节点类型，请显式传 kind',
            }],
        };
    }

    var existingResult = address.read(config, segments, {});
    var existing = existingResult.ok ? existingResult.value : undefined;

    var ctx = Object.assign({}, opts, {
        kind: kind,
        parentPath: segments,
        existing: existing,
        mode: opts.mode || (existing === undefined ? 'create' : 'replace'),
    });

    var projected = projection.projectIn(definition, ctx);
    if (!projected.ok) return projected;

    var written = address.write(config, segments, projected.node, { allowMissingLeaf: true });
    if (!written.ok) {
        return Object.assign({}, projected, { ok: false, errors: written.errors });
    }

    projected.path = written.path;
    projected.before = written.before;
    projected.after = written.after;
    return projected;
}

module.exports = {
    // 子模块（供 ops / services / MCP 直接使用）
    address: address,
    fieldSpecs: fieldSpecs,
    keys: keys,
    projection: projection,
    refs: refs,
    validate: validate,
    ports: ports,
    shapes: shapes,

    // 原语
    read: read,
    write: write,
    insert: insert,
    remove: remove,
    apply: apply,
};
