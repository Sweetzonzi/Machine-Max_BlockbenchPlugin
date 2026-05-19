// 文件: src/codec/codecs/hydrodynamic_codec.js
// 用途: HydrodynamicAttr 的 Codec 定义 — 流体定义与覆写标记
// 所属模块: MachineMax Blockbench 插件

'use strict';

const { Codec } = require('../Codec.js');

/**
 * HydroCodec — HydrodynamicAttr 的序列化/反序列化 Codec
 *
 * 字段:
 *   - definition (string, 必填): 流体定义标识
 *   - overwrite  (boolean, 默认 false): 是否覆写已有流体
 *
 * 在 SubPartCodec 中通过 Codec.map(Codec.STRING, HydroCodec).nullable() 组合使用。
 */
const HydroCodec = Codec.record({
    definition: Codec.STRING.field(),              // 流体定义（必填）
    overwrite:  Codec.BOOL.default(false),         // 是否覆写
});

module.exports = { HydroCodec };
