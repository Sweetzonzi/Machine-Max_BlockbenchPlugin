// 文件: src/codec/codecs/part_codec.js
// 用途: Part 配置的 Codec 定义 — 9 字段（含 variants Either 简写）
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
const { VariantCodec, VariantLoadCodec } = require('./variant_codec.js');

/**
 * 构造零件 codec，`variants` 用传入的变体 codec。
 *
 * @param {object} variantCodec
 * @returns {object} 零件 codec
 */
function buildPartCodec(variantCodec) {
    return Codec.record({
        // ── 基础 ──
        icon:                         Codec.STRING.default(''),

        // ── 物理 ──
        vehicle_durability_rate:      Codec.FLOAT.default(0.8),
        vehicle_damage_rate:          Codec.FLOAT.default(1.0),
        vehicle_damage_rate_destroyed: Codec.FLOAT.default(0.1),
        functional_threshold:         Codec.FLOAT.default(0.3),

        // ── 行为 ──
        share_durability:             Codec.BOOL.default(true),
        max_stack_size:               Codec.INT.default(1),

        // ── 变体 ──
        variants:                     Codec.either(variantCodec, Codec.map(Codec.STRING, variantCodec)).default({}),

        // ── 编辑器内部状态（encode 时空对象跳过，不影响导出）──
        element_markers:              Codec.record({}).default({}),
    });
}

/**
 * PartCodec — 零件配置的序列化/反序列化 Codec（严格）
 *
 * 9 个字段，与 Java PartType.CODEC 一一对齐，不含 id / namespace 等运行时字段。
 * 零件 ID 由文件名决定，不写入 JSON 体。
 *
 * encode 行为:
 *   - _uiState 等运行时字段不在 schema 中 → 自动剥离
 *   - id、namespace 等编辑器元数据不在 schema 中 → 自动剥离
 *   - 所有字段按默认值规则跳过
 *   - 单 variant 时 Either 展开为简写格式
 *
 * decode 行为:
 *   - 空对象输入 → 返回全默认值 PartConfig
 *   - 未知字段保留（宽松模式）
 *   - 单 variant 简写 → 自动包装为 { default: variant }
 *   - 未知的子系统类型 → 报错（导入 / 导出用这个实例）
 */
const PartCodec = buildPartCodec(VariantCodec);

/**
 * PartLoadCodec — 工程加载专用
 *
 * 与 PartCodec 的唯一差别在子系统容器：已退役或未知的类型原样保留，
 * 使留着历史条目的工程仍能打开。读盘（core/config.js）用它，写入链路用 PartCodec。
 */
const PartLoadCodec = buildPartCodec(VariantLoadCodec);

module.exports = { PartCodec, PartLoadCodec };
