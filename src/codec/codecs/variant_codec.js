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
    // textures: either(单值字符串, 完整 map{名称→路径})
    // — 单值时编码为裸字符串，解码时包装为 {default: 值}
    // — 多值时编码为完整 map，解码时保持 map
    // — 默认值 '' 表示未设置，encode 时跳过字段 → Java 端 fallback 到 missingno
    textures:   Codec.either(Codec.STRING, Codec.map(Codec.STRING, Codec.STRING)).default(''),
    // animations: 单个资源路径字符串（对应 Java ResourceLocation）
    // — 默认值 '' 表示未设置，encode 时跳过字段 → Java 端 fallback 到 machine_max:empty
    animations: Codec.STRING.default(''),
    tags:       Codec.STRING.list().default([]),
    sub_parts:  Codec.either(SubPartCodec, Codec.map(Codec.STRING, SubPartCodec)).default({}),
});

module.exports = { VariantCodec };
