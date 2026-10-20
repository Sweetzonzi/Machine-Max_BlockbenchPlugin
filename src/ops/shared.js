// 文件: src/ops/shared.js
// 用途: ops 层共用工具（OpResult 信封、路径/端口、整件写入）
// 所属模块: MachineMax Blockbench 插件
//
// 约定（docs/13 §6.2 / §12）：
//   - 第一参数永远是完整配置对象；
//   - 返回 OpResult，失败不抛异常；
//   - 内部统一 runConfigEdit，结构性动作 coalesce:false；
//   - 不落盘、不 toast、不刷新；只改配置。

'use strict';

var doc = require('../doc/index.js');
var keys = require('../doc/keys.js');
var ports = require('../doc/ports.js');
var { runConfigEdit } = require('../core/undo.js');
var { createLogger } = require('../utils/logger.js');

var log = createLogger('Ops');

function own(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function clone(v) {
    if (v === null || typeof v !== 'object') return v;
    return JSON.parse(JSON.stringify(v));
}

function makeError(path, code, expected, got, hint) {
    return {
        path: Array.isArray(path) ? path.slice() : [],
        code: code,
        expected: expected,
        got: got,
        hint: hint || '',
    };
}

function ok(data) {
    return Object.assign({ ok: true }, data || {});
}

function fail(error, errors, extra) {
    var result = Object.assign({ ok: false, error: error, errors: errors || [] }, extra || {});
    log.warn('操作失败：' + error);
    return result;
}

function fromDoc(result, fallback) {
    var errors = (result && result.errors) || [];
    var first = errors[0];
    return fail(first ? (first.hint || first.code) : (fallback || '配置操作失败'), errors);
}

function configOrNull(config) {
    return (config && typeof config === 'object') ? config : null;
}

function namespaceOf(config) {
    return (config && typeof config.namespace === 'string' && config.namespace) || 'machine_max';
}

function partOf(config, partId) {
    return config && config.parts && partId ? (config.parts[partId] || null) : null;
}

function variantOf(config, partId, variantName) {
    var part = partOf(config, partId);
    return part && part.variants && variantName ? (part.variants[variantName] || null) : null;
}

function subPartOf(config, partId, variantName, spKey) {
    var variant = variantOf(config, partId, variantName);
    return variant && variant.sub_parts && spKey ? (variant.sub_parts[spKey] || null) : null;
}

function setUiState(config, patch) {
    if (!config._uiState || typeof config._uiState !== 'object') {
        config._uiState = { activeMode: 'part', activePartId: '', activeVariantName: '' };
    }
    Object.keys(patch || {}).forEach(function (key) {
        config._uiState[key] = patch[key];
    });
    return config._uiState;
}

/** 走 reactivity 端口写入新增 key（Vue 2 需要 Vue.set）。 */
function setProp(obj, key, value) {
    var r = ports.get().reactivity;
    if (r && typeof r.set === 'function') return r.set(obj, key, value);
    obj[key] = value;
    return value;
}

/** 走 reactivity 端口删除 key。 */
function delProp(obj, key) {
    var r = ports.get().reactivity;
    if (r && typeof r.del === 'function') return r.del(obj, key);
    delete obj[key];
}

function validateKey(map, key, config, path) {
    var result = keys.validateMapKey(map, key, { namespace: namespaceOf(config) });
    if (result.ok) return null;
    return makeError(path || [map, key], result.code, result.expected, result.got, result.hint);
}

function markersPort() {
    var m = ports.get().markers;
    if (m && m.set && m.clear && m.clearScope) return m;
    return require('../core/element_markers.js');
}

function bonesPort() {
    return ports.get().bones;
}

/** 把 doc 错误转成 OpResult，并保留 path。 */
function finishProjection(projected, data) {
    if (!projected || !projected.ok) {
        return fail(
            (projected && projected.errors && projected.errors[0]
                && (projected.errors[0].hint || projected.errors[0].code)) || '整件写入失败',
            (projected && projected.errors) || [],
            {
                reset_fields: (projected && projected.reset_fields) || [],
                unresolved: (projected && projected.unresolved) || { config_refs: [], bones: [] },
                warnings: (projected && projected.warnings) || [],
            }
        );
    }
    return ok(Object.assign({
        path: projected.path,
        data: data || {},
        changed: true,
        reset_fields: projected.reset_fields || [],
        unresolved: projected.unresolved,
        unresolved_bones: (projected.unresolved && projected.unresolved.bones) || [],
        warnings: projected.warnings || [],
    }, projected.before !== undefined ? { before: projected.before, after: projected.after } : {}));
}

/** 把 projection.in 的结果落到配置树（整件通道）。 */
function applyProjection(config, path, definition, ctx, options) {
    options = options || {};
    var projected = doc.projection.projectIn(definition, ctx);
    if (!projected.ok) return finishProjection(projected, options.data);

    var result;
    try {
        result = runConfigEdit(options.label || '导入配置', function () {
            var mp = markersPort();
            if (projected.markerCleanup && mp.clearScope) {
                mp.clearScope(config, projected.markerCleanup);
            }

            var written = doc.write(config, path, projected.node, { allowMissingLeaf: true });
            if (!written.ok) {
                var e = new Error('write failed');
                e._opResult = fromDoc(written, '写入配置失败');
                throw e;
            }

            (projected.markerPlan || []).forEach(function (entry) {
                mp.set(config, entry.partId, entry.variantName, entry.uuid,
                    entry.type, entry.config_ref);
            });

            if (mp.recalc && ctx.kind !== 'subsystem') {
                if (ctx.kind === 'part' && projected.node.variants) {
                    Object.keys(projected.node.variants).forEach(function (vName) {
                        mp.recalc(config, ctx.partId, vName);
                    });
                } else if (ctx.kind === 'variant' || ctx.kind === 'sub_part') {
                    mp.recalc(config, ctx.partId, ctx.variantName);
                }
            }

            return { written: written };
        }, {
            strict: !!options.strict,
            coalesce: false,
            source: options.source || 'import',
        });
    } catch (e) {
        if (e && e._opResult) return e._opResult;
        log.error('applyProjection: 写入失败', e);
        return fail(e && e.message ? e.message : '写入配置失败', []);
    }

    var written = result && result.written;
    return ok({
        path: written ? written.path : (projected.path || path),
        data: options.data || {},
        changed: true,
        reset_fields: projected.reset_fields || [],
        unresolved: projected.unresolved,
        unresolved_bones: (projected.unresolved && projected.unresolved.bones) || [],
        warnings: projected.warnings || [],
        before: written ? written.before : undefined,
        after: written ? written.after : undefined,
    });
}

/**
 * 由 doc 返回的段数组判断节点 kind。
 * @returns {{kind:string, node:object, nodePath:string[], field:string}}
 */
function locateRecord(config, segments) {
    var node = config;
    var kind = 'config';
    var nodePath = [];
    var i = 0;
    var containers = {
        parts: 'part',
        variants: 'variant',
        sub_parts: 'sub_part',
        hit_boxes: 'hit_box',
        interact_boxes: 'interact_box',
        connectors: 'connector',
        subsystems: 'subsystem',
    };

    while (i < segments.length) {
        var seg = segments[i];
        if (node && typeof node === 'object' && !Array.isArray(node)
            && own(containers, seg) && i + 1 < segments.length
            && node[seg] && typeof node[seg] === 'object') {
            node = node[seg][segments[i + 1]];
            nodePath = nodePath.concat([seg, segments[i + 1]]);
            kind = containers[seg];
            i += 2;
            continue;
        }
        break;
    }

    return {
        kind: kind,
        node: node,
        nodePath: nodePath,
        field: segments[i],
        rest: segments.slice(i),
    };
}

/** 写入前惰性补 required-object 分组（overwrite / textures）。 */
function ensureParentObjects(config, segments) {
    for (var i = 0; i < segments.length - 1; i++) {
        var seg = segments[i];
        if (seg !== 'overwrite' && seg !== 'textures') continue;
        var ownerPath = segments.slice(0, i);
        var owner = config;
        for (var j = 0; j < ownerPath.length; j++) {
            owner = owner && owner[ownerPath[j]];
        }
        if (!owner || typeof owner !== 'object' || Array.isArray(owner)) continue;
        if (owner[seg] === null || typeof owner[seg] !== 'object' || Array.isArray(owner[seg])) {
            owner[seg] = {};
        }
        var cursor = owner[seg];
        for (var k = i + 1; k < segments.length - 1; k++) {
            var key = segments[k];
            if (cursor[key] === null || typeof cursor[key] !== 'object' || Array.isArray(cursor[key])) {
                cursor[key] = {};
            }
            cursor = cursor[key];
        }
    }
}

/** 校验写路径所在记录的值；只返回写路径前缀下的错误。 */
function validateWrite(config, segments, value) {
    var located = locateRecord(config, segments);
    if (!located.node || typeof located.node !== 'object') return [];
    var candidate = clone(located.node);
    var rest = located.rest;
    if (rest.length === 0) return [];

    ensureParentObjects(candidate, rest);
    var cursor = candidate;
    for (var i = 0; i < rest.length - 1; i++) {
        cursor = cursor && cursor[rest[i]];
    }
    if (!cursor || typeof cursor !== 'object') return [];
    if (Array.isArray(cursor) && /^\d+$/.test(rest[rest.length - 1])) {
        cursor[parseInt(rest[rest.length - 1], 10)] = clone(value);
    } else {
        cursor[rest[rest.length - 1]] = clone(value);
    }

    var typeId = located.kind === 'subsystem' ? candidate.type : undefined;
    var result = doc.validate.validateValues(candidate, {
        kind: located.kind,
        typeId: typeId,
        path: located.nodePath,
        completeness: false,
    });
    if (result.ok) return [];
    var prefix = segments;
    return result.errors.filter(function (e) {
        var p = e.path || [];
        for (var j = 0; j < prefix.length && j < p.length; j++) {
            if (String(prefix[j]) !== String(p[j])) return false;
        }
        return true;
    });
}

module.exports = {
    ok: ok,
    fail: fail,
    fromDoc: fromDoc,
    clone: clone,
    own: own,
    makeError: makeError,
    configOrNull: configOrNull,
    namespaceOf: namespaceOf,
    partOf: partOf,
    variantOf: variantOf,
    subPartOf: subPartOf,
    setUiState: setUiState,
    setProp: setProp,
    delProp: delProp,
    validateKey: validateKey,
    markersPort: markersPort,
    bonesPort: bonesPort,
    applyProjection: applyProjection,
    finishProjection: finishProjection,
    locateRecord: locateRecord,
    validateWrite: validateWrite,
    ensureParentObjects: ensureParentObjects,
};
