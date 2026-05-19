// 文件: src/codec/codecs/variant_codec.js
// 用途: Variant 配置的 Codec 定义 — 4 字段 + sub_parts Either 简写
// 所属模块: MachineMax Blockbench 插件
//
// Either 简写语义:
//   单 sub_part → 输出为 VariantSubPart 对象（简写）
//   多 sub_part → 输出为 Map<String, VariantSubPart>（完整形式）
//
// 数据链: SubPartCodec → VariantCodec.sub_parts → PartCodec.variants

'use strict';

const { Codec } = require('../Codec.js');
const { SubPartCodec } = require('./sub_part_codec.js');

const VariantCodec = Codec.record({
    model:      Codec.STRING.field(),
    textures:   Codec.STRING.list().default([]),
    animations: Codec.map(Codec.STRING, Codec.STRING).default({}),
    tags:       Codec.STRING.list().default([]),
    sub_parts:  Codec.either(SubPartCodec, Codec.map(Codec.STRING, SubPartCodec)).default({}),
});

module.exports = { VariantCodec };
