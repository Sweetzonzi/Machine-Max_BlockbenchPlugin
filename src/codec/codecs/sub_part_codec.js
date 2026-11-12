// 文件: src/codec/codecs/sub_part_codec.js
// 用途: SubPart 配置的 Codec 定义 — 16 字段（15 常规 + 1 nullable），与 Java SubPart.CODEC 对齐
// 所属模块: MachineMax Blockbench 插件
//
// 瞬态字段:
//   - auto_end_bones: 运行时计算字段，不在 schema 中（encode 自动剥离）
//   - _uuid: Java 侧瞬态字段，不在 schema 中（encode 自动剥离）
//
// 数据链: SubPartCodec → VariantCodec.sub_parts (Either) → PartCodec.variants (Either)
//
// 16 个 schema 字段对应 Java SubPart.CODEC（RecordCodecBuilder）:
//
//   骨骼范围:
//     start_bone         — 起始骨骼名
//     end_bones          — 终止骨骼列表
//
//   物理属性:
//     durability         — 耐久度
//     mass               — 质量
//     mass_center        — 质心骨骼名
//     projected_area     — 投影面积 [x, y, z]
//     block_collision    — 方块碰撞模式（true/false/ground）
//     collision_height   — 碰撞高度（-1 表示自动计算）
//     climb_assist       — 攀爬辅助
//     collide_in_assembly — 是否与同装配体内未直接相连的零件碰撞
//     hydro_priority     — 流体优先级
//
//   子对象映射（Map<String, Codec>）:
//     hit_boxes          — 碰撞箱
//     interact_boxes     — 交互区
//     connectors         — 连接点
//     subsystems         — 子系统（dispatch 路由）
//
//   可选子对象:
//     hydrodynamics      — 流体定义（nullable: null/undefined 表示未配置）
//
// encode 行为:
//   - auto_end_bones 和 _uuid 不在 schema 中 → 自动剥离
//   - 所有字段按默认值规则跳过（值等于默认值 → 不输出）
//   - hydrodynamics === null → 跳过
//
// decode 行为:
//   - 空对象输入 → 返回全默认值 SubPartConfig
//   - 未知字段保留（宽松模式）

'use strict';

const { Codec } = require('../Codec.js');
const { HitBoxCodec } = require('./hit_box_codec.js');
const { InteractBoxCodec } = require('./interact_box_codec.js');
const { ConnectorCodec } = require('./connector_codec.js');
const { SubsystemDispatchCodec, SubsystemLoadCodec } = require('./subsystem_codec.js');
const { HydroCodec } = require('./hydrodynamic_codec.js');

/**
 * 构造子零件 codec，`subsystems` 容器用传入的 dispatch 实例。
 *
 * 两份实现只在子系统容器上不同：严格实例用于导入 / 导出，加载实例把已退役
 * 或未知的子系统类型原样保留，让带历史条目的工程仍能打开（说明见
 * subsystem_codec.js 的 SubsystemLoadCodec）。
 *
 * @param {object} subsystemCodec - 子系统 dispatch codec
 * @returns {object} 子零件 codec
 */
function buildSubPartCodec(subsystemCodec) {
    return Codec.record({
        // ── 骨骼范围 ──
        start_bone:         Codec.STRING.default(''),
        end_bones:          Codec.STRING.list().default([]),

        // ── 物理属性 ──
        durability:         Codec.FLOAT.default(20.0),
        mass:               Codec.FLOAT.default(25.0),
        mass_center:        Codec.STRING.default('mass_center'),
        projected_area:     Codec.FLOAT.list(3).default([-1, -1, -1]),
        block_collision:    Codec.ENUM(['true', 'false', 'ground']).default('true'),
        collision_height:   Codec.FLOAT.default(-1.0),
        climb_assist:       Codec.BOOL.default(false),
        collide_in_assembly: Codec.BOOL.default(false),
        hydro_priority:     Codec.INT.default(0),

        // ── 子对象映射 ──
        hit_boxes:          Codec.map(Codec.STRING, HitBoxCodec).default({}),
        interact_boxes:     Codec.map(Codec.STRING, InteractBoxCodec).default({}),
        connectors:         Codec.map(Codec.STRING, ConnectorCodec).default({}),
        subsystems:         Codec.map(Codec.STRING, subsystemCodec).default({}),

        // ── 可选子对象 ──
        // 默认为空 map（encode 时跳过），与 Java optionalFieldOf("hydrodynamics", Map.of("", DEFAULT)) 语义对齐
        hydrodynamics:      Codec.map(Codec.STRING, HydroCodec).default({}),
    });
}

/** 严格实例：导入 part JSON、导出编码 */
const SubPartCodec = buildSubPartCodec(SubsystemDispatchCodec);

/** 加载实例：读盘时保留已退役 / 未知的子系统类型 */
const SubPartLoadCodec = buildSubPartCodec(SubsystemLoadCodec);

module.exports = { SubPartCodec, SubPartLoadCodec };
