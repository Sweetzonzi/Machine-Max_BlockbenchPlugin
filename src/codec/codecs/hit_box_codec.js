// 文件: src/codec/codecs/hit_box_codec.js
// 用途: HitBoxAttr 的 Codec 定义 — 7 个字段，与 Java HitBoxAttr.CODEC 对齐
// 所属模块: MachineMax Blockbench 插件

'use strict';

const { Codec } = require('../Codec.js');

/**
 * HitBoxAttr 的 Codec 定义
 *
 * 对应 Java HitBoxAttr.CODEC（RecordCodecBuilder），7 个字段：
 *   shape, material, thickness, condition, mass_override, overwrite, pos
 *
 * 注意：_uuid 为运行时瞬态字段，不在此 codec 中定义。
 */
const HitBoxCodec = Codec.record({
    id:         Codec.STRING.field(),              // 碰撞形状ID（必填）
    type:       Codec.STRING.field(),              // 碰撞形状类型（必填，box/sphere/cylinder/capsule/wheel）
    material:   Codec.STRING.default('machine_max:default'),
    thickness:  Codec.FLOAT.default(1.0),
    condition:  Codec.STRING.default('true'),
    subsystem:  Codec.STRING.default(''),          // 关联子系统
    // overwrite：透传对象（对应 Java HitBoxAttr.OverwriteAttr — 14 个可选字段）
    // 使用 ANY.nullable() 宽松传递，encode 时 null/undefined/空对象跳过
    overwrite:  Codec.ANY.nullable(),
});

module.exports = { HitBoxCodec };
