// 文件: src/doc/shapes.js
// 用途: doc 层的显式形状 codec（docs/13 §5.3.1 第 4 步）
// 所属模块: MachineMax Blockbench 插件
//
// 不使用 `Codec.either` 解码 variants / sub_parts：
// either.decode 会按 key 里有没有 `.` / `:` 猜简写，{chassis:{...}} 会被
// SubPartCodec 全默认解码吞成 {default:{...}}。这里显式用 Codec.map。
// either 只保留在 `out('export')` 的 variants / textures 编码上。

'use strict';

var Codec = require('../codec/Codec.js').Codec;
var HitBoxCodec = require('../codec/codecs/hit_box_codec.js').HitBoxCodec;
var InteractBoxCodec = require('../codec/codecs/interact_box_codec.js').InteractBoxCodec;
var ConnectorCodec = require('../codec/codecs/connector_codec.js').ConnectorCodec;
var HydroCodec = require('../codec/codecs/hydrodynamic_codec.js').HydroCodec;
var SubsystemDispatchCodec = require('../codec/codecs/subsystem_codec.js').SubsystemDispatchCodec;

// ── 内部树形状（decode 用；容器始终是 map）──────────────────────

var SubPartShape = Codec.record({
    start_bone:         Codec.STRING.default(''),
    end_bones:          Codec.STRING.list().default([]),
    durability:         Codec.FLOAT.default(20.0),
    mass:               Codec.FLOAT.default(25.0),
    mass_center:        Codec.STRING.default('mass_center'),
    projected_area:     Codec.FLOAT.list(3).default([-1, -1, -1]),
    block_collision:    Codec.ENUM(['true', 'false', 'ground']).default('true'),
    collision_height:   Codec.FLOAT.default(-1.0),
    climb_assist:       Codec.BOOL.default(false),
    hydro_priority:     Codec.INT.default(0),
    hit_boxes:          Codec.map(Codec.STRING, HitBoxCodec).default({}),
    interact_boxes:     Codec.map(Codec.STRING, InteractBoxCodec).default({}),
    connectors:         Codec.map(Codec.STRING, ConnectorCodec).default({}),
    subsystems:         Codec.map(Codec.STRING, SubsystemDispatchCodec).default({}),
    hydrodynamics:      Codec.map(Codec.STRING, HydroCodec).default({}),
});

// textures 在 decode 前已由 normalizeShorthand 从 string 转成 {default:string}，
// 所以这里可以安全地只用 map。
var VariantShape = Codec.record({
    model:      Codec.STRING.field(),
    textures:   Codec.map(Codec.STRING, Codec.STRING).default({ default: '' }),
    animations: Codec.STRING.default(''),
    tags:       Codec.STRING.list().default([]),
    sub_parts:  Codec.map(Codec.STRING, SubPartShape).default({}),
});

var PartShape = Codec.record({
    icon:                           Codec.STRING.default(''),
    vehicle_durability_rate:        Codec.FLOAT.default(0.8),
    vehicle_damage_rate:            Codec.FLOAT.default(1.0),
    vehicle_damage_rate_destroyed:  Codec.FLOAT.default(0.1),
    functional_threshold:           Codec.FLOAT.default(0.3),
    share_durability:               Codec.BOOL.default(true),
    max_stack_size:                 Codec.INT.default(1),
    variants:                       Codec.map(Codec.STRING, VariantShape).default({}),
});

var SubsystemShape = SubsystemDispatchCodec;

// ── 导出形状（encode 用；variants / textures 可折叠）────────────

var VariantExportShape = Codec.record({
    model:      Codec.STRING.field(),
    textures:   Codec.either(Codec.STRING, Codec.map(Codec.STRING, Codec.STRING)).default(''),
    animations: Codec.STRING.default(''),
    tags:       Codec.STRING.list().default([]),
    // sub_parts 永不折叠：schema 的单子零件简写没有 key，会丢 sub_part.<ns>.* 身份
    sub_parts:  Codec.map(Codec.STRING, SubPartShape).default({}),
});

var PartExportShape = Codec.record({
    icon:                           Codec.STRING.default(''),
    vehicle_durability_rate:        Codec.FLOAT.default(0.8),
    vehicle_damage_rate:            Codec.FLOAT.default(1.0),
    vehicle_damage_rate_destroyed:  Codec.FLOAT.default(0.1),
    functional_threshold:           Codec.FLOAT.default(0.3),
    share_durability:               Codec.BOOL.default(true),
    max_stack_size:                 Codec.INT.default(1),
    variants:                       Codec.either(VariantExportShape,
        Codec.map(Codec.STRING, VariantExportShape)).default({}),
});

var SHAPES = {
    part: PartShape,
    variant: VariantShape,
    sub_part: SubPartShape,
    hit_box: HitBoxCodec,
    interact_box: InteractBoxCodec,
    connector: ConnectorCodec,
    subsystem: SubsystemShape,
};

var EXPORT_SHAPES = {
    part: PartExportShape,
    variant: VariantExportShape,
    sub_part: SubPartShape,
    hit_box: HitBoxCodec,
    interact_box: InteractBoxCodec,
    connector: ConnectorCodec,
    subsystem: SubsystemShape,
};

function getShape(kind) {
    return SHAPES[kind] || null;
}

function getExportShape(kind) {
    return EXPORT_SHAPES[kind] || null;
}

function classifyCodecError(message) {
    if (/Unknown dispatch type/.test(message)) return 'unknown_type';
    if (/Missing required field/.test(message)) return 'missing_required';
    if (/Expected array of length/.test(message)) return 'type_mismatch';
    if (/Expected (string|number|integer|boolean|array|object)/.test(message)) return 'type_mismatch';
    if (/Invalid enum value/.test(message)) return 'invalid_enum';
    return 'type_mismatch';
}

/**
 * 严格解码：把 codec 抛出的错误映射成 errors[]，带回 path。
 *
 * @param {string} kind
 * @param {object} raw
 * @param {object} [ctx] - { path }
 * @returns {{ok:boolean, node?:object, errors:Array}}
 */
function decodeStrict(kind, raw, ctx) {
    ctx = ctx || {};
    var path = Array.isArray(ctx.path) ? ctx.path.slice() : [];
    var shape = getShape(kind);
    if (!shape) {
        return {
            ok: false,
            errors: [{
                path: path,
                code: 'unknown_type',
                expected: '已知 kind',
                got: kind,
                hint: '未知的配置节点类型',
            }],
        };
    }
    try {
        return { ok: true, node: shape.decode(raw), errors: [] };
    } catch (e) {
        var message = e && e.message ? e.message : String(e);
        return {
            ok: false,
            errors: [{
                path: path,
                code: classifyCodecError(message),
                expected: kind,
                got: message,
                hint: '配置结构无法解码',
            }],
        };
    }
}

function encode(kind, node) {
    var shape = getExportShape(kind);
    if (!shape) throw new Error('Unknown export shape: ' + kind);
    return shape.encode(node);
}

module.exports = {
    PartShape: PartShape,
    VariantShape: VariantShape,
    SubPartShape: SubPartShape,
    SubsystemShape: SubsystemShape,
    PartExportShape: PartExportShape,
    VariantExportShape: VariantExportShape,
    getShape: getShape,
    getExportShape: getExportShape,
    decodeStrict: decodeStrict,
    encode: encode,
};
