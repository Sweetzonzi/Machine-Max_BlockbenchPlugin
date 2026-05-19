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
    shape:          Codec.STRING.field(),          // 碰撞箱形状（必填）
    material:       Codec.STRING.default('iron'),
    thickness:      Codec.FLOAT.default(1.0),
    condition:      Codec.STRING.default(''),
    mass_override:  Codec.FLOAT.default(-1.0),    // -1 表示未覆写
    overwrite:      Codec.BOOL.default(false),     // 是否覆写上级
    pos:            Codec.FLOAT.list(3).default([0, 0, 0]),
});

module.exports = { HitBoxCodec };
