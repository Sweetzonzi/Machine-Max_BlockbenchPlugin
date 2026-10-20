// 文件: src/ops/field.js
// 用途: 单字段写入 ops.setField（docs/13 §5.2.4 / §5.2.5 / §6.3）
// 所属模块: MachineMax Blockbench 插件
//
// setField 是 UI / MCP / 右键菜单的唯一单字段入口：
//   值校验（completeness:false）→ 一条撤销记录 → 字段级副作用。
// 默认 strict（不做隐式转换）；UI 输入框在调用前自行 parseFloat。

'use strict';

var doc = require('../doc/index.js');
var ssTypes = require('../core/subsystem_types.js');
var { runConfigEdit } = require('../core/undo.js');
var shared = require('./shared.js');

function pointerOf(segments) {
    return '/' + segments.map(function (s) {
        return String(s).replace(/~/g, '~0').replace(/\//g, '~1');
    }).join('/');
}

function moveMarker(config, partId, variantName, fromUuid, toUuid, type, configRef) {
    if (!partId || !variantName || !fromUuid || !toUuid || fromUuid === toUuid) return;
    var mp = shared.markersPort();
    if (mp.clear) mp.clear(config, partId, variantName, fromUuid);
    if (mp.set) mp.set(config, partId, variantName, toUuid, type, configRef);
}

function findUuid(name) {
    if (!name) return null;
    var bones = shared.bonesPort();
    var el = bones.findByName(name);
    return el ? el.uuid : null;
}

/**
 * 字段级副作用（docs/13 §5.2.3）。
 */
function applySideEffect(config, segments, oldValue, newValue) {
    var located = shared.locateRecord(config, segments);
    var kind = located.kind;
    var field = located.field;
    var node = located.node;
    if (!node) return;

    if (kind === 'sub_part' && field === 'start_bone') {
        var marker = null;
        var markerUuid = oldValue ? findUuid(oldValue) : null;
        if (markerUuid) {
            var markers = config.parts[segments[1]].element_markers || {};
            var vm = markers[segments[3]] || {};
            marker = vm[markerUuid] || null;
        }
        moveMarker(config, segments[1], segments[3], markerUuid, findUuid(newValue),
            'sub_part', marker ? marker.config_ref : segments[5]);
        return;
    }

    if (kind === 'interact_box' && field === 'bone') {
        var newUuid = findUuid(newValue);
        node._uuid = newUuid || undefined;
        moveMarker(config, segments[1], segments[3], findUuid(oldValue), newUuid,
            'interact_box', segments[7]);
        return;
    }

    if (kind === 'connector' && field === 'locator') {
        var newLocUuid = findUuid(newValue);
        node._marker_uuid = newLocUuid || undefined;
        moveMarker(config, segments[1], segments[3], findUuid(oldValue), newLocUuid,
            'connector', segments[7]);
        return;
    }

    if (kind === 'subsystem' && field === 'type') {
        var defaults = ssTypes.getTypeDefaults(newValue) || {};
        var allowed = ssTypes.getTypeSpecificFields(newValue) || [];
        Object.keys(node).forEach(function (key) {
            if (key === 'type' || key === 'definition') return;
            if (allowed.indexOf(key) < 0) delete node[key];
        });
        Object.keys(defaults).forEach(function (key) {
            if (!(key in node)) node[key] = shared.clone(defaults[key]);
        });
    }
}

function ensureParentObjects(config, segments) {
    return shared.ensureParentObjects(config, segments);
}

/**
 * 写单个字段 / map 条目。
 *
 * @param {object} config
 * @param {object} options - { path, value, source?, coalesce?, mergeKey?, label?, strict? }
 * @returns {object} OpResult
 */
function setField(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用，请先打开项目');

    var parsed = doc.address.parsePath(options.path);
    if (!parsed.ok) return shared.fromDoc(parsed, '路径无效');
    if (parsed.wildcard >= 0) {
        return shared.fail('写入路径不能包含通配符 *', [shared.makeError(parsed.segments,
            'invalid_format', '不含 * 的写入路径', '*', '通配符只用于读取')]);
    }
    var segments = parsed.segments;
    if (segments.length === 0) return shared.fail('不能整树替换，请使用 import*');

    var current = doc.read(config, options.path);
    var before = current.ok ? current.value : undefined;
    var after = options.value;
    if (current.ok && JSON.stringify(before) === JSON.stringify(after)) {
        return shared.ok({ path: segments, changed: false, before: before, after: after });
    }

    var errors = shared.validateWrite(config, segments, after);
    if (errors.length > 0) {
        return shared.fail(errors[0].hint || ('字段值不合法: ' + (errors[0].code || 'invalid')), errors);
    }

    var label = options.label || ('修改 ' + pointerOf(segments));
    var result;
    try {
        result = runConfigEdit(label, function () {
            ensureParentObjects(config, segments);
            var written = doc.write(config, options.path, after, { allowMissingLeaf: true });
            if (!written.ok) {
                var e = new Error('write failed');
                e._opResult = shared.fromDoc(written, '写入字段失败');
                throw e;
            }
            applySideEffect(config, written.path || segments, before, after);
            return written;
        }, {
            strict: !!options.strict,
            coalesce: options.coalesce === true,
            mergeKey: options.mergeKey || pointerOf(segments),
            source: options.source || 'ui',
        });
    } catch (e) {
        if (e && e._opResult) return e._opResult;
        return shared.fail(e && e.message ? e.message : '写入字段失败', []);
    }

    return shared.ok({
        path: result.path || segments,
        changed: true,
        before: result.before,
        after: result.after,
        data: { sideEffect: result.sideEffect || null },
    });
}

module.exports = { setField: setField, _internals: { applySideEffect: applySideEffect } };
