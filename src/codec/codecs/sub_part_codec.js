// 文件: src/codec/codecs/sub_part_codec.js
// 用途: SubPart 配置的 Codec 定义 — 15 字段（14 常规 + 1 nullable），与 Java SubPart.CODEC 对齐
// 所属模块: MachineMax Blockbench 插件
//
// 瞬态字段:
//   - auto_end_bones: 运行时计算字段，不在 schema 中（encode 自动剥离）
//   - _uuid: Java 侧瞬态字段，不在 schema 中（encode 自动剥离）
//
// 数据链: SubPartCodec → VariantCodec.sub_parts (Either) → PartCodec.variants (Either)

'use strict';

const { Codec } = require('../Codec.js');
const { HitBoxCodec } = require('./hit_box_codec.js');
const { InteractBoxCodec } = require('./interact_box_codec.js');
const { ConnectorCodec } = require('./connector_codec.js');
const { SubsystemDispatchCodec } = require('./subsystem_codec.js');
const { HydroCodec } = require('./hydrodynamic_codec.js');

/**
 * SubPartCodec — 子零件配置的序列化/反序列化 Codec
 *
 * 15 个 schema 字段对应 Java SubPart.CODEC（RecordCodecBuilder）:
 *
 *   骨骼范围:
 *     start_bone         — 起始骨骼名
 *     end_bones          — 终止骨骼列表
 *
 *   物理属性:
 *     durability         — 耐久度
 *     mass               — 质量
 *     mass_center        — 质心骨骼名
 *     projected_area     — 投影面积 [x, y, z]
 *     block_collision    — 方块碰撞模式（true/false/ground）
 *     collision_height   — 碰撞高度（-1 表示自动计算）
 *     climb_assist       — 攀爬辅助
 *     hydro_priority     — 流体优先级
 *
 *   子对象映射（Map<String, Codec>）:
 *     hit_boxes          — 碰撞箱
 *     interact_boxes     — 交互区
 *     connectors         — 连接点
 *     subsystems         — 子系统（dispatch 路由）
 *
 *   可选子对象:
 *     hydrodynamics      — 流体定义（nullable: null/undefined 表示未配置）
 *
 * encode 行为:
 *   - auto_end_bones 和 _uuid 不在 schema 中 → 自动剥离
 *   - 所有字段按默认值规则跳过（值等于默认值 → 不输出）
 *   - hydrodynamics === null → 跳过
 *
 * decode 行为:
 *   - 空对象输入 → 返回全默认值 SubPartConfig
 *   - 未知字段保留（宽松模式）
 */
const SubPartCodec = Codec.record({
    // ── 骨骼范围 ──
    start_bone:         Codec.STRING.default(''),
    end_bones:          Codec.STRING.list().default([]),

    // ── 物理属性 ──
    durability:         Codec.FLOAT.default(20.0),
    mass:               Codec.FLOAT.default(25.0),
    mass_center:        Codec.STRING.default('mass_center'),
    projected_area:     Codec.FLOAT.list(3).default([0, 0, 0]),
    block_collision:    Codec.ENUM(['true', 'false', 'ground']).default('true'),
    collision_height:   Codec.FLOAT.default(-1.0),
    climb_assist:       Codec.BOOL.default(false),
    hydro_priority:     Codec.INT.default(0),

    // ── 子对象映射 ──
    hit_boxes:          Codec.map(Codec.STRING, HitBoxCodec).default({}),
    interact_boxes:     Codec.map(Codec.STRING, InteractBoxCodec).default({}),
    connectors:         Codec.map(Codec.STRING, ConnectorCodec).default({}),
    subsystems:         Codec.map(Codec.STRING, SubsystemDispatchCodec).default({}),

    // ── 可选子对象 ──
    // nullable() 语义: null → encode 跳过, decode 缺失 → null
    hydrodynamics:      Codec.map(Codec.STRING, HydroCodec).nullable(),
});

module.exports = { SubPartCodec };
