// 文件: src/doc/address.js
// 用途: 配置文档路径解析与读写（docs/13 §5.1 / §5.5）
// 所属模块: MachineMax Blockbench 插件
//
// 主形式是段数组，字符串形式是 JSON Pointer（RFC 6901）。
// 解析按位置，不按名字：只看当前节点类型决定下一段是字段、map key 还是数组下标。
// 纯函数层；不执行副作用，不开撤销，不发事件。

'use strict';

var fieldSpecs = require('./field_specs.js');
var keys = require('./keys.js');
var ports = require('./ports.js');

var MAX_PATH_SEGMENTS = 512;

// ── 错误信封 ────────────────────────────────────────────────────

function error(path, code, expected, got, hint) {
    return {
        path: Array.isArray(path) ? path.slice() : [],
        code: code,
        expected: expected,
        got: got,
        hint: hint || '',
    };
}

function fail(path, code, expected, got, hint) {
    return { ok: false, errors: [error(path, code, expected, got, hint)] };
}

function own(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

// ── 路径解析 ────────────────────────────────────────────────────

function decodePointerSegment(seg) {
    // 先 ~1 后 ~0，避免 `~01` 被解成 `~1`
    return seg.replace(/~1/g, '/').replace(/~0/g, '~');
}

function encodePointerSegment(seg) {
    return String(seg).replace(/~/g, '~0').replace(/\//g, '~1');
}

/**
 * 解析段数组或 JSON Pointer。
 * @returns {{ok:boolean, segments?:string[], pointer?:string, wildcard?:number, errors?:Array}}
 */
function parsePath(path) {
    var segments;

    if (path === undefined || path === null || path === '') {
        return { ok: true, segments: [], pointer: '' };
    }

    if (typeof path === 'string') {
        if (path.charAt(0) !== '/') {
            return fail([], 'invalid_format', 'JSON Pointer（以 / 开头）', path,
                '字符串路径必须是 JSON Pointer；段数组请直接传数组');
        }
        var raw = path.slice(1).split('/');
        segments = [];
        for (var i = 0; i < raw.length; i++) {
            if (/~(?![01])/.test(raw[i])) {
                return fail([], 'invalid_format', '合法 JSON Pointer 转义', raw[i],
                    '`~` 只能出现在 `~0` / `~1` 中');
            }
            segments.push(decodePointerSegment(raw[i]));
        }
    } else if (Array.isArray(path)) {
        segments = path.map(function (s) { return String(s); });
    } else {
        return fail([], 'invalid_format', 'string[] | JSON Pointer', typeof path,
            '路径必须是段数组或 JSON Pointer');
    }

    if (segments.length > MAX_PATH_SEGMENTS) {
        return fail(segments, 'invalid_format', '<= ' + MAX_PATH_SEGMENTS + ' 段',
            segments.length, '路径过深');
    }

    var wildcard = -1;
    for (var j = 0; j < segments.length; j++) {
        var seg = segments[j];
        if (seg === '..') {
            return fail(segments, 'invalid_format', '不含 `..` 的路径', seg,
                '路径没有相对语法；需要相对定位时请由调用方传 base');
        }
        if (seg === '*') {
            if (wildcard >= 0) {
                return fail(segments, 'invalid_format', '至多一个 `*`', seg,
                    '通配符 `*` 是整段 token，至多一个');
            }
            wildcard = j;
        } else if (seg.indexOf('*') >= 0) {
            return fail(segments, 'invalid_format', '`*` 必须是整段 token', seg,
                '`*` 不能作为字面 key 的一部分');
        }
    }

    return {
        ok: true,
        segments: segments,
        pointer: '/' + segments.map(encodePointerSegment).join('/'),
        wildcard: wildcard,
    };
}

function toPointer(segments) {
    return '/' + (segments || []).map(encodePointerSegment).join('/');
}

// ── 节点状态 ────────────────────────────────────────────────────

function state(kind, node, extra) {
    var s = { kind: kind, node: node, value: node };
    if (extra) {
        Object.keys(extra).forEach(function (k) { s[k] = extra[k]; });
    }
    return s;
}

function isScalarSpec(spec) {
    return !spec || (spec.type !== 'array' && spec.type !== 'tuple' && spec.type !== 'object');
}

function stateForSpec(spec, node) {
    if (!spec) return state('value', node);
    if (Array.isArray(spec.oneOf)) {
        // textures: string | object；按当前值选择分支
        if (node && typeof node === 'object' && !Array.isArray(node)) {
            for (var i = 0; i < spec.oneOf.length; i++) {
                if (spec.oneOf[i].type === 'object') return state('object', node, { spec: spec.oneOf[i] });
            }
        }
        return state('value', node);
    }
    if (spec.type === 'array' || spec.type === 'tuple') {
        return state('array', node, { spec: spec });
    }
    if (spec.type === 'object') {
        return state('object', node, { spec: spec });
    }
    return state('value', node);
}

function stateForContainer(field, node, ownerKind) {
    return state('map', node || {}, {
        map: field,
        ownerKind: ownerKind || null,
        childKind: fieldSpecs.getContainerChildKind(field),
    });
}

function mapValueSpec(field, fieldSpec) {
    if (!fieldSpec) return null;
    if (field === 'textures' && Array.isArray(fieldSpec.oneOf)) {
        for (var i = 0; i < fieldSpec.oneOf.length; i++) {
            if (fieldSpec.oneOf[i].type === 'object') return fieldSpec.oneOf[i].additionalProperties;
        }
        return { type: 'string' };
    }
    if (fieldSpec.additionalProperties && typeof fieldSpec.additionalProperties === 'object') {
        return fieldSpec.additionalProperties;
    }
    return null;
}

function stateForValueMap(field, node, fieldSpec, ownerKind) {
    return state('map', node || {}, {
        map: field,
        ownerKind: ownerKind || null,
        childKind: 'value',
        valueSpec: mapValueSpec(field, fieldSpec),
        fieldSpec: fieldSpec,
    });
}

function stateForMapChild(s, entry) {
    if (s.childKind && s.childKind !== 'value') {
        return nodeState(s.childKind, entry, s.childKind === 'subsystem' ? entry && entry.type : null);
    }
    return stateForSpec(s.valueSpec, entry);
}

function nodeState(kind, node, typeId) {
    return state(kind, node, { typeId: typeId || (kind === 'subsystem' ? node && node.type : null) });
}

function valueOfState(s) {
    return s ? s.node : undefined;
}

// ── 字段解析 ────────────────────────────────────────────────────

function rootFieldInfo(field) {
    if (fieldSpecs.isInternalField('config', field)) {
        return { error: fail([field], 'unknown_field', '可寻址的配置根字段', field,
            '`' + field + '` 属于内部树，不参与路径寻址') };
    }
    var spec = fieldSpecs.getRootField(field);
    if (!spec) {
        return { error: fail([field], 'unknown_field', '已知配置根字段', field,
            '`' + field + '` 不在配置根字段白名单内') };
    }
    return { spec: spec, container: spec.container === 'map' ? spec.map : null };
}

function recordFieldInfo(s, field) {
    var kind = s.kind;
    if (kind === 'config') return rootFieldInfo(field);

    if (fieldSpecs.isInternalField(kind, field)) {
        return { error: fail([field], 'unknown_field', '可寻址字段', field,
            '`' + field + '` 属于内部树，不参与路径寻址') };
    }

    if (fieldSpecs.isContainer(kind, field)) {
        return { container: field };
    }

    var typeId = kind === 'subsystem' ? (s.typeId || (s.node && s.node.type)) : null;
    var spec = fieldSpecs.getFieldSpec(kind, field, typeId);

    if (!spec && kind === 'subsystem' && field === 'type') {
        spec = { type: 'string' };
    }
    if (!spec) {
        if (kind === 'subsystem' && !fieldSpecs.hasSubsystemType(typeId)) {
            return { error: fail([field], 'unknown_type', '已知 subsystem 类型', typeId,
                '未知的子系统类型，只能访问 type') };
        }
        return { error: fail([field], 'unknown_field', 'schema 字段', field,
            '`' + field + '` 不在 ' + kind + ' 的字段白名单内') };
    }

    if (fieldSpecs.isMapField(kind, field)) {
        return { spec: spec, mapField: field };
    }
    return { spec: spec };
}

function objectFieldInfo(s, field) {
    var spec = s.spec || {};
    if (spec.properties && own(spec.properties, field)) {
        return { spec: spec.properties[field] };
    }
    if (spec.additionalProperties && typeof spec.additionalProperties === 'object') {
        return { spec: spec.additionalProperties };
    }
    return { error: fail([field], 'unknown_field', 'schema 对象字段', field,
        '该对象不允许额外字段') };
}

function enterField(s, field) {
    var info;
    if (s.kind === 'object') {
        info = objectFieldInfo(s, field);
    } else {
        info = recordFieldInfo(s, field);
    }
    if (info.error) return info;

    var node = s.node && typeof s.node === 'object' ? s.node[field] : undefined;

    if (info.container) {
        return { state: stateForContainer(info.container, node, s.kind), exists: node !== undefined && node !== null };
    }
    if (info.mapField) {
        // overwrite 是对象字段，但按 map 语义可寻址字段名
        if (info.mapField === 'overwrite') {
            return { state: state('object', node || {}, { spec: info.spec }), exists: node !== undefined && node !== null };
        }
        return { state: stateForValueMap(info.mapField, node, info.spec, s.kind), exists: node !== undefined && node !== null };
    }
    return { state: stateForSpec(info.spec, node), exists: node !== undefined && node !== null };
}

// ── 遍历 ────────────────────────────────────────────────────────

function enterSegment(s, seg, opts) {
    opts = opts || {};

    if (s.kind === 'map') {
        var entries = s.node;
        if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
            return { error: fail([seg], 'type_mismatch', 'object map', typeof entries) };
        }
        var actualKey = seg;
        if (s.map === 'hit_boxes' && !own(entries, actualKey)) {
            // 双形 key：先按 UUID，再按骨骼名
            var byName = ports.get().bones.findByName(seg);
            if (byName && byName.uuid && own(entries, byName.uuid)) actualKey = byName.uuid;
        }
        if (!own(entries, actualKey)) {
            if (opts.write) {
                // 写入路径的中间段若 key 非法，优先报 invalid_format（而不是 not_found）
                var keyCheck = keys.validateMapKey(s.map, seg, {
                    namespace: opts.namespace,
                });
                if (!keyCheck.ok) {
                    return {
                        error: fail([seg], keyCheck.code, keyCheck.expected, keyCheck.got,
                            keyCheck.hint),
                    };
                }
            }
            return { error: fail([seg], 'not_found', '已存在的 map key', seg, '路径的中间段不存在') };
        }
        return { state: stateForMapChild(s, entries[actualKey]), existed: true, key: actualKey };
    }

    if (s.kind === 'array') {
        if (!/^\d+$/.test(seg)) {
            return { error: fail([seg], 'not_found', '数组下标', seg) };
        }
        var idx = parseInt(seg, 10);
        var arr = s.node;
        if (!Array.isArray(arr) || idx < 0 || idx >= arr.length) {
            return { error: fail([seg], 'not_found', '数组下标', seg, '下标越界') };
        }
        return { state: stateForSpec(s.spec && s.spec.items ? s.spec.items : null, arr[idx]), existed: true };
    }

    if (s.kind === 'object' || fieldSpecs.isKnownKind(s.kind) || s.kind === 'config') {
        var entered = enterField(s, seg);
        if (entered.error) {
            entered.error.errors[0].path = [seg].concat(entered.error.errors[0].path || []);
            return entered;
        }
        if (!entered.exists && opts.createParents && entered.state
            && (entered.state.kind === 'map' || entered.state.kind === 'object')) {
            s.node[seg] = entered.state.node = entered.state.kind === 'map' ? {} : {};
            entered.exists = true;
        }
        return { state: entered.state, existed: entered.exists };
    }

    return { error: fail([seg], 'not_found', '可继续遍历的节点', s.kind) };
}

function resolveFrom(start, segments) {
    var current = start;
    for (var i = 0; i < segments.length; i++) {
        var entered = enterSegment(current, segments[i], {});
        if (entered.error) {
            entered.error.errors[0].path = segments.slice(0, i + 1);
            return entered.error;
        }
        current = entered.state;
    }
    return { state: current };
}

function resolveParent(config, segments, opts) {
    if (segments.length === 0) {
        return { state: state('config', config), parent: null, last: null };
    }
    var current = state('config', config);
    for (var i = 0; i < segments.length - 1; i++) {
        var entered = enterSegment(current, segments[i], opts || {});
        if (entered.error) {
            entered.error.errors[0].path = segments.slice(0, i + 1);
            return entered.error;
        }
        current = entered.state;
    }
    return { state: current, parent: current, last: segments[segments.length - 1] };
}

// ── 读取 ────────────────────────────────────────────────────────

function read(config, path, opts) {
    opts = opts || {};
    var parsed = parsePath(path);
    if (!parsed.ok) return parsed;

    var segments = parsed.segments;
    if (parsed.wildcard >= 0) {
        return readWildcard(config, segments, parsed.wildcard);
    }

    var resolved = resolveFrom(state('config', config), segments);
    if (!resolved.state) return resolved;
    return {
        ok: true,
        kind: resolved.state.kind,
        value: valueOfState(resolved.state),
        path: segments.concat(),
    };
}

function readWildcard(config, segments, wildcardIndex) {
    var prefix = segments.slice(0, wildcardIndex);
    var rest = segments.slice(wildcardIndex + 1);
    var resolved = resolveFrom(state('config', config), prefix);
    if (!resolved.state) return resolved;

    var mapState = resolved.state;
    if (mapState.kind !== 'map') {
        return fail(segments, 'invalid_format', 'map 层', mapState.kind,
            '`*` 只能出现在 map 层；数组层没有 key 语义');
    }

    var entries = mapState.node || {};
    var result = {};
    var entryKeys = Object.keys(entries);
    for (var i = 0; i < entryKeys.length; i++) {
        var key = entryKeys[i];
        var child = stateForMapChild(mapState, entries[key]);
        var childResolved = resolveFrom(child, rest);
        if (childResolved.state) {
            result[key] = valueOfState(childResolved.state);
        }
    }
    return { ok: true, kind: 'map', value: result, wildcard: true, path: segments.concat() };
}

// ── 写入 ────────────────────────────────────────────────────────

function validateWriteKey(map, key, namespace) {
    var result = keys.validateMapKey(map, key, { namespace: namespace });
    if (!result.ok) {
        return error([key], result.code, result.expected, result.got, result.hint);
    }
    return null;
}

function resolveHitBoxWriteKey(key) {
    var bones = ports.get().bones;
    if (bones.findByUuid(key)) return key;
    var el = bones.findByName(key);
    if (el && el.uuid) return el.uuid;
    return null;
}

function write(config, path, value, opts) {
    opts = opts || {};
    var parsed = parsePath(path);
    if (!parsed.ok) return parsed;
    if (parsed.wildcard >= 0) {
        return fail(parsed.segments, 'invalid_format', '不含 `*` 的写入路径', '*',
            '通配符只用于读取');
    }

    var segments = parsed.segments;
    if (segments.length === 0) {
        return fail([], 'invalid_format', '非根路径', '根', '不能整树替换，请使用 apply');
    }

    var resolved = resolveParent(config, segments, {
        createParents: !!opts.createParents,
        write: true,
        namespace: (config && config.namespace) || 'machine_max',
    });
    if (!resolved.state) return resolved;

    var parent = resolved.state;
    var key = resolved.last;
    var namespace = (config && config.namespace) || 'machine_max';
    var before;
    var created = false;
    var mapKey = key;

    if (parent.kind === 'map') {
        var entries = parent.node;
        if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
            return fail(segments, 'type_mismatch', 'object map', typeof entries);
        }
        var keyError = validateWriteKey(parent.map, key, namespace);
        if (keyError) {
            keyError.path = segments.slice(0, -1).concat(key);
            return { ok: false, errors: [keyError] };
        }
        if (!own(entries, key)) {
            if (parent.map === 'hit_boxes') {
                var uuid = resolveHitBoxWriteKey(key);
                if (!uuid) {
                    return fail(segments, 'not_found', '已存在的骨骼 UUID', key,
                        '写入新的 hit_boxes 条目需先创建骨骼，或显式传 UUID');
                }
                mapKey = uuid;
            }
            if (opts.allowMissingLeaf === false) {
                return fail(segments, 'not_found', '已存在的 map key', key,
                    'allowMissingLeaf=false 时不创建新 key');
            }
            created = true;
            before = undefined;
        } else {
            before = entries[mapKey];
        }
        entries[mapKey] = value;
        return {
            ok: true,
            path: segments.slice(0, -1).concat(mapKey),
            kind: parent.childKind || 'value',
            before: before,
            after: value,
            created: created,
            sideEffect: fieldSpecs.getSideEffect(parent.ownerKind || '', parent.map),
        };
    }

    if (parent.kind === 'array') {
        if (!/^\d+$/.test(key)) {
            return fail(segments, 'not_found', '数组下标', key);
        }
        var idx = parseInt(key, 10);
        if (!Array.isArray(parent.node) || idx < 0 || idx >= parent.node.length) {
            return fail(segments, 'not_found', '数组下标', key, '下标越界');
        }
        before = parent.node[idx];
        parent.node[idx] = value;
        return { ok: true, path: segments, kind: 'value', before: before, after: value };
    }

    if (parent.kind === 'object') {
        var objectInfo = objectFieldInfo(parent, key);
        if (objectInfo.error) {
            objectInfo.error.errors[0].path = segments;
            return objectInfo.error;
        }
        if (!own(parent.node, key)) {
            if (!opts.allowMissingLeaf) {
                return fail(segments, 'unknown_field', '已存在的对象字段', key,
                    '对象字段白名单不可绕过；新建字段需 allowMissingLeaf');
            }
            // 白名单已确认 key 合法，允许 setField 惰性补对象字段（如 overwrite.physics.*）
            parent.node[key] = undefined;
        }
        before = parent.node[key];
        parent.node[key] = value;
        return { ok: true, path: segments, kind: 'value', before: before, after: value };
    }

    if (parent.kind === 'config' || fieldSpecs.isKnownKind(parent.kind)) {
        if (!parent.node || typeof parent.node !== 'object' || Array.isArray(parent.node)) {
            return fail(segments, 'type_mismatch', 'object', typeof parent.node);
        }
        var info = parent.kind === 'config' ? rootFieldInfo(key) : recordFieldInfo(parent, key);
        if (info.error) {
            info.error.errors[0].path = segments;
            return info.error;
        }
        if (!own(parent.node, key)) {
            return fail(segments, 'unknown_field', '已存在的字段', key,
                '写操作不自动创建 record 字段；请使用 insert / apply');
        }
        before = parent.node[key];
        parent.node[key] = value;
        return {
            ok: true,
            path: segments,
            kind: info.spec ? info.spec.type || 'value' : 'value',
            before: before,
            after: value,
            sideEffect: fieldSpecs.getSideEffect(parent.kind, key),
        };
    }

    return fail(segments, 'not_found', '可写入的父节点', parent.kind);
}

// ── 插入 / 删除 ─────────────────────────────────────────────────

function insert(config, path, key, node, opts) {
    opts = opts || {};
    var parsed = parsePath(path);
    if (!parsed.ok) return parsed;
    var resolved = resolveFrom(state('config', config), parsed.segments);
    if (!resolved.state) return resolved;

    var container = resolved.state;
    if (container.kind !== 'map') {
        return fail(parsed.segments.concat([key]), 'invalid_format', 'map 层', container.kind,
            'insert 的父路径必须指向 map');
    }
    var namespace = (config && config.namespace) || 'machine_max';
    var keyError = validateWriteKey(container.map, key, namespace);
    if (keyError) {
        keyError.path = parsed.segments.concat([key]);
        return { ok: false, errors: [keyError] };
    }
    if (own(container.node, key)) {
        return fail(parsed.segments.concat([key]), 'duplicate_name', '不重复的 key', key,
            '该 key 已存在');
    }
    container.node[key] = node;
    return {
        ok: true,
        path: parsed.segments.concat([key]),
        kind: container.childKind || 'value',
        after: node,
        created: true,
    };
}

function remove(config, path, opts) {
    opts = opts || {};
    var parsed = parsePath(path);
    if (!parsed.ok) return parsed;
    if (parsed.wildcard >= 0) {
        return fail(parsed.segments, 'invalid_format', '不含 `*` 的删除路径', '*');
    }
    var segments = parsed.segments;
    if (segments.length === 0) {
        return fail([], 'invalid_format', '非根路径', '根');
    }
    var resolved = resolveParent(config, segments, {});
    if (!resolved.state) return resolved;

    var parent = resolved.state;
    var key = resolved.last;
    var removed;

    if (parent.kind === 'map') {
        if (!own(parent.node, key)) {
            return fail(segments, 'not_found', '已存在的 map key', key);
        }
        removed = parent.node[key];
        delete parent.node[key];
        return {
            ok: true,
            path: segments,
            removed: removed,
            kind: parent.childKind || 'value',
            cleaned_references: [],
        };
    }

    if (parent.kind === 'array') {
        if (!/^\d+$/.test(key)) return fail(segments, 'not_found', '数组下标', key);
        var idx = parseInt(key, 10);
        if (!Array.isArray(parent.node) || idx < 0 || idx >= parent.node.length) {
            return fail(segments, 'not_found', '数组下标', key);
        }
        removed = parent.node.splice(idx, 1)[0];
        return { ok: true, path: segments, removed: removed, kind: 'value', cleaned_references: [] };
    }

    if (parent.kind === 'object') {
        if (!own(parent.node, key)) return fail(segments, 'not_found', '已存在的对象字段', key);
        removed = parent.node[key];
        delete parent.node[key];
        return { ok: true, path: segments, removed: removed, kind: 'value', cleaned_references: [] };
    }

    if (parent.kind === 'config' || fieldSpecs.isKnownKind(parent.kind)) {
        var info = parent.kind === 'config' ? rootFieldInfo(key) : recordFieldInfo(parent, key);
        if (info.error) {
            info.error.errors[0].path = segments;
            return info.error;
        }
        if (!own(parent.node, key)) return fail(segments, 'not_found', '已存在的字段', key);
        removed = parent.node[key];
        delete parent.node[key];
        return {
            ok: true,
            path: segments,
            removed: removed,
            kind: info.spec ? info.spec.type || 'value' : 'value',
            cleaned_references: [],
        };
    }

    return fail(segments, 'not_found', '可删除的节点', parent.kind);
}

module.exports = {
    parsePath: parsePath,
    toPointer: toPointer,
    read: read,
    write: write,
    insert: insert,
    remove: remove,
};
