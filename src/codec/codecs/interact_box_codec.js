// 文件: src/codec/codecs/interact_box_codec.js
// 用途: InteractBoxAttr 的 Codec 定义 — 4 个字段的 record codec
// 所属模块: MachineMax Blockbench 插件

'use strict';

const { Codec } = require('../Codec.js');

/**
 * InteractBoxAttr 的 Codec 定义
 *
 * 字段说明:
 *   - bone:           骨骼名（必填字符串）
 *   - interact_mode:  交互模式枚举，默认 'fast'
 *   - condition:      门控表达式（MoLang），默认 'true'
 *   - signal_targets: 交互目标映射 { 频道名: [目标列表] }，schema required
 *
 * encode 行为:
 *   - interact_mode === 'fast' 时跳过（默认值）
 *   - condition === 'true' 时跳过（默认值）
 *   - signal_targets 恒输出（required map），空对象输出 {}
 *   - bone 始终输出（必填）
 *
 * decode 行为:
 *   - interact_mode 缺失 → 填充 'fast'
 *   - condition 缺失 → 填充 'true'
 *   - signal_targets 缺失 → 填充 {}
 *   - bone 缺失 → 报错
 *
 * 上游 8e9a5263 把 condition 从逻辑枚举（AND/OR/NAND/NOR/XOR/XNOR，默认 NOR）
 * 改成 MoLang 表达式（求值 > 0 表示可用，默认 true）；表达式写错不阻止加载，
 * 但该交互区恒不可用。旧枚举值仍按 string 解出来（不在这里折算），由
 * services/validate.js 报 interact_box_condition_legacy_enum 提醒改写。
 */
const InteractBoxCodec = Codec.record({
    bone:            Codec.STRING.field(),                                    // 骨骼名（必填）
    interact_mode:   Codec.ENUM(['fast', 'accurate']).default('fast'),
    condition:       Codec.STRING.default('true'),
    signal_targets:  Codec.map(Codec.STRING, Codec.STRING.list(), { emitEmpty: true }).default({}),
});

module.exports = { InteractBoxCodec };
