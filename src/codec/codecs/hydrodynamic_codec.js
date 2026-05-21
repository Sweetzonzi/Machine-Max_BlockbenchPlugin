// 文件: src/codec/codecs/hydrodynamic_codec.js
// 用途: HydrodynamicAttr 的 Codec 定义 — 内联 14 字段，与 Java HydrodynamicAttr.CODEC 完全对齐
// 所属模块: MachineMax Blockbench 插件
//
// Java 参考: HydrodynamicAttr.CODEC (RecordCodecBuilder)
//   14 个字段，均为内联结构（非引用式）。
//   坐标约定（流体动力计算点本地坐标系）：
//     y+ ：升力法线方向
//     z- ：来流方向（前向）

'use strict';

const { Codec } = require('../Codec.js');

/**
 * AdvancedAeroAttr 的子 codec — 高级气动参数
 * 对应 Java AdvancedAeroAttr.CODEC
 */
const AdvancedAeroCodec = Codec.record({
    lift_slope:  Codec.FLOAT.default(6.28),
    alpha0:      Codec.FLOAT.default(0),
    alpha_stall: Codec.FLOAT.default(0.52),
    cd0:         Codec.FLOAT.default(0.02),
    k_induced:   Codec.FLOAT.default(0.05),
});

/**
 * HydroCodec — HydrodynamicAttr 的序列化/反序列化 Codec
 *
 * 对应 Java HydrodynamicAttr.CODEC（RecordCodecBuilder），14 个内联字段：
 *
 *   通用参数:
 *     scale                — 缩放系数
 *     effective_range      — 有效计算范围
 *     transonic_amplifier  — 跨音速放大系数
 *
 *   6 方向阻力系数（各 2 阶）:
 *     front_drag / back_drag / left_drag / right_drag / up_drag / down_drag
 *
 *   简易升力系数（非高级模式）:
 *     x_lift / y_lift / z_lift
 *
 *   高级气动:
 *     advanced            — 是否启用高级气动
 *     advanced_aero       — 高级气动参数（AdvancedAeroAttr）
 *
 * encode 行为:
 *   - 所有字段有默认值，encode 时等于默认值则跳过（整体为默认值时整个 hydrodynamics 条目跳过）
 *   - 固定长度数组(FLOAT.list(2))会校验长度为 2
 *
 * decode 行为:
 *   - 缺失字段填充默认值
 *   - 未知字段保留（宽松模式）
 */
const HydroCodec = Codec.record({
    scale:               Codec.FLOAT.default(1),
    effective_range:     Codec.FLOAT.default(1),
    transonic_amplifier: Codec.FLOAT.default(5),

    front_drag: Codec.FLOAT.list(2).default([0.0, 1.0]),
    back_drag:  Codec.FLOAT.list(2).default([0.0, 1.0]),
    left_drag:  Codec.FLOAT.list(2).default([0.0, 1.0]),
    right_drag: Codec.FLOAT.list(2).default([0.0, 1.0]),
    up_drag:    Codec.FLOAT.list(2).default([0.0, 1.0]),
    down_drag:  Codec.FLOAT.list(2).default([0.0, 1.0]),

    x_lift: Codec.FLOAT.default(0),
    y_lift: Codec.FLOAT.default(0),
    z_lift: Codec.FLOAT.default(0),

    advanced:      Codec.BOOL.default(false),
    advanced_aero: AdvancedAeroCodec.default({
        lift_slope: 6.28, alpha0: 0, alpha_stall: 0.52,
        cd0: 0.02, k_induced: 0.05,
    }),
});

module.exports = { HydroCodec, AdvancedAeroCodec };
