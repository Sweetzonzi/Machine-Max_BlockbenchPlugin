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
 *   - mode:           交互模式枚举，默认 'interact'
 *   - condition:      触发条件表达式，默认 ''
 *   - signal_targets: 信号目标映射 { 信号名: [目标骨骼列表] }，默认 {}
 *
 * encode 行为:
 *   - mode === 'interact' 时跳过（默认值）
 *   - condition === '' 时跳过（默认值）
 *   - signal_targets === {} 时跳过（默认值）
 *   - bone 始终输出（必填）
 *
 * decode 行为:
 *   - mode 缺失 → 填充 'interact'
 *   - condition 缺失 → 填充 ''
 *   - signal_targets 缺失 → 填充 {}
 *   - bone 缺失 → 报错
 */
const InteractBoxCodec = Codec.record({
    bone:            Codec.STRING.field(),                                    // 骨骼名（必填）
    interact_mode:   Codec.ENUM(['fast', 'accurate']).default('fast'),
    condition:       Codec.STRING.default('NOR'),
    signal_targets:  Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
});

module.exports = { InteractBoxCodec };
