// 文件: src/codec/codecs/part_codec.js
// 用途: Part 配置的 Codec 定义 — 12 字段（含 variants Either 简写）
// 所属模块: MachineMax Blockbench 插件
//
// 数据链: SubPartCodec → VariantCodec.sub_parts → PartCodec.variants
//
// Part Either 简写:
//   单 variant → 输出为单个 VariantConfig 对象（简写，省略 variants map 包裹）
//   多 variant → 输出为 Map<String, VariantConfig>（完整形式）
//
// Variant Either 简写（在 VariantCodec 层处理）:
//   单 sub_part → 输出为单个 SubPartConfig 对象
//   多 sub_part → 输出为 Map<String, SubPartConfig>

'use strict';

const { Codec } = require('../Codec.js');
const { VariantCodec } = require('./variant_codec.js');

/**
 * PartCodec — 零件配置的序列化/反序列化 Codec
 *
 * 12 个字段来源于 config_defaults.js PART_DEFAULTS，外加 namespace、id、can_stand_on_top。
 *
 * encode 行为:
 *   - _uiState 等运行时字段不在 schema 中 → 自动剥离
 *   - 所有字段按默认值规则跳过
 *   - 单 variant 时 Either 展开为简写格式
 *
 * decode 行为:
 *   - 空对象输入 → 返回全默认值 PartConfig
 *   - 未知字段保留（宽松模式）
 *   - 单 variant 简写 → 自动包装为 { default: variant }
 */
const PartCodec = Codec.record({
    // ── 标识 ──
    namespace:                    Codec.STRING.default('machine_max'),
    id:                           Codec.STRING.default(''),

    // ── 基础 ──
    icon:                         Codec.STRING.default(''),
    can_stand_on_top:             Codec.BOOL.default(false),

    // ── 物理 ──
    vehicle_durability_rate:      Codec.FLOAT.default(0.8),
    vehicle_damage_rate:          Codec.FLOAT.default(1.0),
    vehicle_damage_rate_destroyed: Codec.FLOAT.default(0.1),
    functional_threshold:         Codec.FLOAT.default(0.3),

    // ── 行为 ──
    share_durability:             Codec.BOOL.default(true),
    max_stack_size:               Codec.INT.default(1),

    // ── 变体 ──
    variants:                     Codec.either(VariantCodec, Codec.map(Codec.STRING, VariantCodec)).default({}),

    // ── 编辑器内部状态 ──
    element_markers:              Codec.record({}).default({}),
});

module.exports = { PartCodec };
