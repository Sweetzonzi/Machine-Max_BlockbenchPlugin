// 文件: src/codec/codecs/variant_codec.js
// 用途: Variant 配置的 Codec 定义 — 6 字段 + sub_parts Either 简写
// 所属模块: MachineMax Blockbench 插件
//
// Either 简写语义:
//   单 sub_part → 输出为 VariantSubPart 对象（简写）
//   多 sub_part → 输出为 Map<String, VariantSubPart>（完整形式）
//
// 数据链: SubPartCodec → VariantCodec.sub_parts → PartCodec.variants

'use strict';

const { Codec } = require('../Codec.js');
const { SubPartCodec, SubPartLoadCodec } = require('./sub_part_codec.js');

/**
 * 构造变体 codec，`sub_parts` 用传入的子零件 codec。
 *
 * @param {object} subPartCodec
 * @returns {object} 变体 codec
 */
function buildVariantCodec(subPartCodec) {
    return Codec.record({
        model:      Codec.STRING.field(),
        // textures: either(单值字符串, 完整 map{名称→路径})
        // — 单值时编码为裸字符串，解码时包装为 {default: 值}
        // — 多值时编码为完整 map，解码时保持 map
        // — 默认值 '' 表示未设置，encode 时跳过字段 → Java 端 fallback 到 missingno
        textures:   Codec.either(Codec.STRING, Codec.map(Codec.STRING, Codec.STRING)).default(''),
        // animations: 动画集资源路径（对应 Java ResourceLocation）
        // — 缺省 '' 表示沿用模型同名目录，encode 时跳过字段 → Java 端按 model 推导
        // — 显式 machine_max:empty 表示这一变体没有动画集
        animations: Codec.STRING.default(''),
        // controllers: 控制器集资源路径（对应 Java ResourceLocation）
        // — 同样缺省 '' 时按模型同名目录推导；显式值选中的是整套控制器，不是单个控制器名
        controllers: Codec.STRING.default(''),
        tags:       Codec.STRING.list().default([]),
        sub_parts:  Codec.either(subPartCodec, Codec.map(Codec.STRING, subPartCodec)).default({}),
    });
}

/** 严格实例：导入 part JSON、导出编码 */
const VariantCodec = buildVariantCodec(SubPartCodec);

/** 加载实例：读盘时保留已退役 / 未知的子系统类型 */
const VariantLoadCodec = buildVariantCodec(SubPartLoadCodec);

module.exports = { VariantCodec, VariantLoadCodec };
