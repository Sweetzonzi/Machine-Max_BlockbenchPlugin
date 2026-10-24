// 文件: src/codec/codecs/subsystem_codec.js
// 用途: 19 种正式子系统类型的独立 codec + SubsystemDispatchCodec（按 type 字段路由）
// 所属模块: MachineMax Blockbench 插件
//
// 字段定义与 src/core/subsystem_types.js 中 dynamicFields 一一对应。
// 每个子系统 codec 只定义该类型的特有字段（不含 type 判别器字段）。
//
// 参考: docs/08-序列化反序列化-Codec体系重构.md

const { Codec } = require('../Codec.js');

// ==================== 第一批（7 种）====================

/**
 * EngineCodec — 发动机
 * 字段: definition, power_output, speed_outputs
 */
const EngineCodec = Codec.record({
    definition:     Codec.STRING.field(),
    power_output:   Codec.STRING.field(),
    speed_outputs:  Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
});

/**
 * WheelDriverCodec — 轮胎驱动器
 * 字段: definition, connector, roll_speed_outputs, steering_angle_outputs
 */
const WheelDriverCodec = Codec.record({
    definition:             Codec.STRING.field(),
    connector:              Codec.STRING.field(),
    roll_speed_outputs:     Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    steering_angle_outputs: Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
});

/**
 * SeatCodec — 座位
 * 字段: definition, locator, control_group_preset, passenger_num_outputs,
 *       camera_discovery_targets, dismount_locators,
 *       first_hud_layout, third_hud_layout, allow_use_items
 *
 * dismount_locators 为有序的下车定位器名称列表（列表顺序即优先级），
 * 空列表表示该座位未声明下车点。
 *
 * 最后三个字段是安装级覆盖（上游 optional 无默认值）：缺省表示沿用型号定义
 * 的 views.first_hud_layout / views.third_hud_layout / allow_use_items。
 * 字符串用 '' 表示省略；allow_use_items 必须三态（null=省略），否则型号定义
 * 为 true 时无法用 false 覆盖。
 */
const SeatCodec = Codec.record({
    definition:               Codec.STRING.field(),
    locator:                  Codec.STRING.default(''),
    control_group_preset:     Codec.STRING.default(''),
    passenger_num_outputs:    Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    camera_discovery_targets: Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    dismount_locators:        Codec.STRING.list().default([]),
    first_hud_layout:         Codec.STRING.default(''),
    third_hud_layout:         Codec.STRING.default(''),
    allow_use_items:          Codec.BOOL.nullable(),
});

/**
 * GearboxCodec — 变速箱
 * 字段: definition, power_output, gear_outputs
 */
const GearboxCodec = Codec.record({
    definition:     Codec.STRING.field(),
    power_output:   Codec.STRING.field(),
    gear_outputs:   Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
});

/**
 * CarControllerCodec — 车辆控制器
 * 字段: definition, control_outputs, speed_outputs, throttle_outputs, steering_outputs, brake_outputs, handbrake_outputs
 */
const CarControllerCodec = Codec.record({
    definition:        Codec.STRING.field(),
    control_outputs:   Codec.map(Codec.STRING, Codec.STRING.list(), { emitEmpty: true }).default({}),
    speed_outputs:     Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    throttle_outputs:  Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    steering_outputs:  Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    brake_outputs:     Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    handbrake_outputs: Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
});

/**
 * MotorCodec — 电动机
 * 字段: definition, power_output, speed_outputs
 */
const MotorCodec = Codec.record({
    definition:     Codec.STRING.field(),
    power_output:   Codec.STRING.field(),
    speed_outputs:  Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
});

/**
 * BasicCodec — 基础（无额外面板）
 * 字段: definition
 */
const BasicCodec = Codec.record({
    definition: Codec.STRING.field(),
});

// ==================== 第二批（4 种）====================

/**
 * ItemStorageCodec — 物品存储
 * 字段: definition
 */
const ItemStorageCodec = Codec.record({
    definition: Codec.STRING.field(),
});

/**
 * LightingCodec — 灯光
 * 字段: definition, locator
 */
const LightingCodec = Codec.record({
    definition: Codec.STRING.field(),
    locator:    Codec.STRING.default(''),
});

/**
 * MotorbikeControllerCodec — 摩托车控制器
 * 字段: definition, control_outputs, speed_outputs, throttle_outputs, steering_outputs, brake_outputs, handbrake_outputs
 */
const MotorbikeControllerCodec = Codec.record({
    definition:        Codec.STRING.field(),
    control_outputs:   Codec.map(Codec.STRING, Codec.STRING.list(), { emitEmpty: true }).default({}),
    speed_outputs:     Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    throttle_outputs:  Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    steering_outputs:  Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    brake_outputs:     Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    handbrake_outputs: Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
});

/**
 * TransmissionCodec — 分动箱
 * 字段: definition, power_outputs
 */
const TransmissionCodec = Codec.record({
    definition:     Codec.STRING.field(),
    power_outputs:  Codec.map(Codec.STRING, Codec.FLOAT, { emitEmpty: true }).default({}),   // 频道→减速比（数值）
});


// ==================== 第三批（6 种）====================

/**
 * CameraCodec — 摄像机
 * 字段: definition, locator, aim_output_targets
 */
const CameraCodec = Codec.record({
    definition: Codec.STRING.field(),
    locator:    Codec.STRING.default(''),
});

/**
 * TurretDriverCodec — 炮塔
 * 字段: definition, connector, rotation_outputs
 */
const TurretDriverCodec = Codec.record({
    definition:        Codec.STRING.field(),
    connector:         Codec.STRING.field(),
    rotation_outputs:  Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
});

/**
 * WeaponControllerCodec — 武器控制器
 * 字段: definition, control_outputs, first_hud_layout, third_hud_layout, scope_hud_layout
 */
const WeaponControllerCodec = Codec.record({
    definition:        Codec.STRING.field(),
    control_outputs:   Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    first_hud_layout:  Codec.STRING.default('machine_max:empty'),
    third_hud_layout:  Codec.STRING.default('machine_max:empty'),
    scope_hud_layout:  Codec.STRING.default('machine_max:empty'),
});

/**
 * LauncherCodec — 发射器
 * 字段: definition, locator, fire_animation, ammo_outputs
 */
const LauncherCodec = Codec.record({
    definition:      Codec.STRING.field(),
    locator:         Codec.STRING.field(),
    fire_animation:  Codec.STRING.default('fire'),
    ammo_outputs:    Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
});

/**
 * SightCodec — 瞄准镜
 * 字段: definition, locator
 */
const SightCodec = Codec.record({
    definition: Codec.STRING.field(),
    locator:    Codec.STRING.default(''),
});

/**
 * RegenLoaderCodec — 再生装弹机
 * 字段: definition, projectile_types, belt_label, discovery_outputs
 */
const RegenLoaderCodec = Codec.record({
    definition:        Codec.STRING.field(),
    projectile_types:  Codec.map(Codec.STRING, Codec.INT, { emitEmpty: true }).default({}),
    belt_label:        Codec.STRING.default(''),
    discovery_outputs: Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
});

/**
 * TrackControllerCodec — 履带控制器
 * 字段: definition, control_outputs, speed_outputs
 */
const TrackControllerCodec = Codec.record({
    definition:       Codec.STRING.field(),
    control_outputs:  Codec.map(Codec.STRING, Codec.STRING.list(), { emitEmpty: true }).default({}),
    speed_outputs:    Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
});

/**
 * TrackDriveCodec — 履带驱动
 * 字段: definition, connector, speed_outputs, force_outputs
 */
const TrackDriveCodec = Codec.record({
    definition:     Codec.STRING.field(),
    connector:      Codec.STRING.field(),
    speed_outputs:  Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    force_outputs:  Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
});

// ==================== Dispatch Codec ====================

/**
 * SubsystemDispatchCodec — 按 type 字段路由到各子系统 codec
 *
 * encode: 读取 obj.type → 路由到子 codec → 输出 { type, ...fields }
 * decode: 读取 raw.type → 路由到子 codec → 输出完整对象（含 type）
 */
const SubsystemDispatchCodec = Codec.dispatch('type', {
    'machine_max:engine':               EngineCodec,
    'machine_max:motor':                MotorCodec,
    'machine_max:gearbox':              GearboxCodec,
    'machine_max:transmission':         TransmissionCodec,
    'machine_max:car_controller':       CarControllerCodec,
    'machine_max:motorbike_controller': MotorbikeControllerCodec,
    'machine_max:wheel_driver':         WheelDriverCodec,
    'machine_max:seat':                 SeatCodec,
    'machine_max:lighting':             LightingCodec,
    'machine_max:item_storage':         ItemStorageCodec,
    'machine_max:basic':                BasicCodec,
    'machine_max:camera':               CameraCodec,
    'machine_max:turret_driver':        TurretDriverCodec,
    'machine_max:weapon_controller':    WeaponControllerCodec,
    'machine_max:launcher':             LauncherCodec,
    'machine_max:sight':                SightCodec,
    'machine_max:regen_loader':         RegenLoaderCodec,
    'machine_max:track_controller':     TrackControllerCodec,
    'machine_max:track_drive':          TrackDriveCodec,
});

// ==================== 导出 ====================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SubsystemDispatchCodec,
        EngineCodec,
        WheelDriverCodec,
        SeatCodec,
        GearboxCodec,
        CarControllerCodec,
        MotorCodec,
        BasicCodec,
        ItemStorageCodec,
        LightingCodec,
        MotorbikeControllerCodec,
        TransmissionCodec,
        CameraCodec,
        TurretDriverCodec,
        WeaponControllerCodec,
        LauncherCodec,
        SightCodec,
        RegenLoaderCodec,
        TrackControllerCodec,
        TrackDriveCodec,
    };
}
