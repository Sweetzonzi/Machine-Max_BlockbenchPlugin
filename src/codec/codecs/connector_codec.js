// 文件: src/codec/codecs/connector_codec.js
// 用途: ConnectorAttr 的 Codec 定义 — 7 个字段，与 Java ConnectorAttr.CODEC 对齐
// 所属模块: MachineMax Blockbench 插件

'use strict';

const { Codec } = require('../Codec.js');

/**
 * ConnectorAttr 的 Codec 定义
 *
 * 对应 Java ConnectorAttr.CODEC（RecordCodecBuilder），7 个字段：
 *   locator, definition, signal_targets, signal_translations, power_target, internal, overwrite
 *
 * 关键设计决策：
 *   - definition 使用 .default('') 而非 .field()，保持与现有 truthy 检查行为一致
 *     （空字符串 → encode 时跳过，与 _cleanConnectors() 的 if (conn.definition) 行为一致）
 *   - signal_targets / signal_translations 使用 Codec.map(...).default({})，
 *     空对象时 encode 返回 undefined，由 record 跳过
 *   - overwrite 为 BOOL.default(false)，与 hit_box_codec 一致
 */
const ConnectorCodec = Codec.record({
    locator:              Codec.STRING.field(),                                      // 关联 Locator（必填）
    definition:           Codec.STRING.default(''),                                   // 定义引用（空 = 无定义 → 导出跳过）
    signal_targets:       Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    signal_translations:  Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    power_target:         Codec.STRING.default(''),
    internal:             Codec.BOOL.default(false),
    overwrite:            Codec.BOOL.default(false),
});

module.exports = { ConnectorCodec };
