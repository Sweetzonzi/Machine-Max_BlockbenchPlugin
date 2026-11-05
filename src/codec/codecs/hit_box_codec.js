// 文件: src/codec/codecs/hit_box_codec.js
// 用途: HitBoxAttr 的 Codec 定义 — 9 个字段，与 Java HitBoxAttr.CODEC 对齐
// 所属模块: MachineMax Blockbench 插件

'use strict';

const { Codec } = require('../Codec.js');

/**
 * HitBoxAttr 的 Codec 定义
 *
 * 对应 Java HitBoxAttr.CODEC（RecordCodecBuilder），9 个字段：
 *   id, type, subsystem, module, material, thickness, condition, lockable, overwrite
 *
 * 注意：_uuid 为运行时瞬态字段，不在此 codec 中定义。
 * overwrite 对应 Java HitBoxAttr.OverwriteAttr — physics / armor / sounds 三组
 * 可选覆写字段，整体为 Optional。
 * lockable 只是"可被选中"的显式准入，上游默认 false；真正的可锁判定还要看关联子系统
 * 是否存活，因此这里只做布尔透传，不参与校验。
 */
const HitBoxCodec = Codec.record({
    id:         Codec.STRING.default(''),          // 碰撞形状ID（schema 可选，默认 ""）
    type:       Codec.STRING.field(),              // 碰撞形状类型（必填，box/sphere/cylinder/capsule/wheel）
    material:   Codec.STRING.default('machine_max:default'),
    thickness:  Codec.FLOAT.default(1.0),
    condition:  Codec.STRING.default('true'),
    lockable:   Codec.BOOL.default(false),         // 是否可作为锁定目标
    subsystem:  Codec.STRING.default(''),          // 关联子系统
    module:     Codec.STRING.default(''),          // 子系统内模块名（空串表示整个子系统）
    // overwrite：透传对象（对应 Java HitBoxAttr.OverwriteAttr — physics/armor/sounds 三组）
    // 使用 ANY.nullable() 宽松传递，encode 时 null/undefined/空对象跳过
    overwrite:  Codec.ANY.nullable(),
});

module.exports = { HitBoxCodec };
