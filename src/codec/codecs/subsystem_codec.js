// 文件: src/codec/codecs/subsystem_codec.js
// 用途: 22 种正式子系统类型的独立 codec + SubsystemDispatchCodec（按 type 字段路由）
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
    reload_operator_discovery_inputs: Codec.STRING.list().default([]),
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
 * 字段: definition, locator, fire_animation, ammo_outputs, ammo_discovery_targets,
 *       reload_operator_discovery_targets, reload_operator_time_multipliers
 *
 * ammo_discovery_targets 是发射器自己的上游查询表（频道 → 目标名）：
 * 结构变化时按它只读发现同一装配体内的自动装弹机。
 *
 * reload_operator_* 是人工装填的用人查询：前者把装填人员频道指向座位，
 * 后者给同一批频道标岗位时间倍率（键取前者的频道名，缺省按 1.0）。
 */
const LauncherCodec = Codec.record({
    definition:             Codec.STRING.field(),
    locator:                Codec.STRING.field(),
    fire_animation:         Codec.STRING.default('fire'),
    ammo_outputs:           Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    ammo_discovery_targets: Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    reload_operator_discovery_targets: Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    reload_operator_time_multipliers:  Codec.map(Codec.STRING, Codec.FLOAT).default({}),
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
 * RegenAmmoRackCodec — 再生弹药架
 * 字段: definition, belt_definition, ammo_discovery_inputs
 *
 * belt_definition 是逐实例的交付规格。Java 侧 AmmoBelt 的 container_id 与 recharge
 * 都是 optionalFieldOf 无默认值（Optional → null），因此这两个用 .nullable()：
 * null 表示省略，encode 时跳过。
 */
const BeltPatternEntryCodec = Codec.record({
    ammo:   Codec.STRING.field(),
    count:  Codec.INT.field(),
});

const BeltRechargeCodec = Codec.record({
    regen_per_minute:       Codec.FLOAT.field(),
    regen_delay:            Codec.FLOAT.default(0),
    energy_cost_per_round:  Codec.FLOAT.default(0),
});

const BeltDefinitionCodec = Codec.record({
    container_id:  Codec.STRING.nullable(),
    label:         Codec.STRING.default(''),
    pattern:       BeltPatternEntryCodec.list().field(),
    length:        Codec.INT.field(),
    recharge:      BeltRechargeCodec.nullable(),
});

const RegenAmmoRackCodec = Codec.record({
    definition:             Codec.STRING.field(),
    belt_definition:        BeltDefinitionCodec.field(),
    ammo_discovery_inputs:  Codec.STRING.list().default([]),
});

/**
 * ReactiveArmorCodec — 爆反附加装甲
 * 字段: definition（灵敏度阈值在型号定义的静态属性里，安装级没有别的字段）
 */
const ReactiveArmorCodec = Codec.record({
    definition: Codec.STRING.field(),
});

/**
 * AmmoRackCodec — 物品弹药架
 * 字段: definition（物品往返尚未实现，实例上没有别的字段）
 */
const AmmoRackCodec = Codec.record({
    definition: Codec.STRING.field(),
});

/**
 * AmmoLoaderCodec — 自动装弹机
 * 字段: definition, ammo_discovery_inputs, ammo_discovery_targets,
 *       reload_operator_discovery_targets, reload_operator_time_multipliers
 *
 * reload_operator_* 与发射器同形：机构的人工段按这张查询表找装填人员座位。
 */
const AmmoLoaderCodec = Codec.record({
    definition:             Codec.STRING.field(),
    ammo_discovery_inputs:  Codec.STRING.list().default([]),
    ammo_discovery_targets: Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    reload_operator_discovery_targets: Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    reload_operator_time_multipliers:  Codec.map(Codec.STRING, Codec.FLOAT).default({}),
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

/** 类型判别值 → 子 codec。严格与加载两个实例共用这一张表。 */
const SUBSYSTEM_CODECS = {
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
    'machine_max:regen_ammo_rack':      RegenAmmoRackCodec,
    'machine_max:ammo_rack':            AmmoRackCodec,
    'machine_max:ammo_loader':          AmmoLoaderCodec,
    'machine_max:track_controller':     TrackControllerCodec,
    'machine_max:track_drive':          TrackDriveCodec,
    'machine_max:reactive_armor':       ReactiveArmorCodec,
};

/**
 * SubsystemDispatchCodec — 按 type 字段路由到各子系统 codec（严格）
 *
 * encode: 读取 obj.type → 路由到子 codec → 输出 { type, ...fields }
 * decode: 读取 raw.type → 路由到子 codec → 输出完整对象（含 type）
 *
 * 未知 type 一律报错。导入 part JSON（doc/shapes.js）与导出编码走这个实例：
 * 写出一个模组不认识的类型没有意义，宁可在写入前拒绝。
 */
const SubsystemDispatchCodec = Codec.dispatch('type', SUBSYSTEM_CODECS);

/**
 * SubsystemLoadCodec — 工程加载专用（onUnknown: 'keep'）
 *
 * 工程文件里可能留着上游已退役的类型（例如 machine_max:regen_loader 在
 * 0.6.0 被拆成弹药架与自动装弹机），或由更新版本插件写入的类型。条目原样
 * 保留进内部树：工程照常打开，校验把它报成错误并指出退役后的替代类型，
 * 导出闸门仍然拦下，作者自己决定删掉还是重建。
 *
 * 只用读盘（core/config.js 的 ensureDefaults）。写入链路继续用严格实例。
 */
const SubsystemLoadCodec = Codec.dispatch('type', SUBSYSTEM_CODECS, { onUnknown: 'keep' });

// ==================== 导出 ====================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SubsystemDispatchCodec,
        SubsystemLoadCodec,
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
        RegenAmmoRackCodec,
        AmmoRackCodec,
        AmmoLoaderCodec,
        TrackControllerCodec,
        TrackDriveCodec,
        ReactiveArmorCodec,
    };
}
