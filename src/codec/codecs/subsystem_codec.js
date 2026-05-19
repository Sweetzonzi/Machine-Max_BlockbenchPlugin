// 文件: src/codec/codecs/subsystem_codec.js
// 用途: 20 种子系统类型的独立 codec + SubsystemDispatchCodec（按 type 字段路由）
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
 * 字段: definition, locator, move_outputs, aim_outputs, regular_outputs, passenger_num_outputs
 */
const SeatCodec = Codec.record({
    definition:           Codec.STRING.field(),
    locator:              Codec.STRING.field(),
    move_outputs:         Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    aim_outputs:          Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    regular_outputs:      Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
    passenger_num_outputs: Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
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
    control_outputs:   Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
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

// ==================== 第二批（7 种）====================

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
    control_outputs:   Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
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
    power_outputs:  Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
});

/**
 * MotorControllerCodec — 电机控制器
 * 字段: definition, power_output, speed_outputs
 */
const MotorControllerCodec = Codec.record({
    definition:     Codec.STRING.field(),
    power_output:   Codec.STRING.field(),
    speed_outputs:  Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
});

/**
 * BatteryCodec — 电池
 * 字段: definition
 */
const BatteryCodec = Codec.record({
    definition: Codec.STRING.field(),
});

/**
 * SignalConvertCodec — 信号转换器
 * 字段: definition
 */
const SignalConvertCodec = Codec.record({
    definition: Codec.STRING.field(),
});

// ==================== 第三批（6 种）====================

/**
 * JointDriverCodec — 关节
 * 字段: definition, locator, rotation_order, axes
 */
const JointDriverCodec = Codec.record({
    definition:     Codec.STRING.field(),
    locator:        Codec.STRING.field(),
    rotation_order: Codec.STRING.default('XYZ'),
    axes:           Codec.record({
        // axes 是一个对象，其内部结构由用户通过 JSON 编辑框定义
        // 这里使用宽松的 record（无 schema 字段）来保留所有键
    }).default({}),
});

/**
 * CameraCodec — 摄像头
 * 字段: definition
 */
const CameraCodec = Codec.record({
    definition: Codec.STRING.field(),
});

/**
 * JavascriptCodec — JavaScript 脚本
 * 字段: definition, script
 */
const JavascriptCodec = Codec.record({
    definition: Codec.STRING.field(),
    script:     Codec.STRING.default(''),
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
 * FireControlCodec — 火控系统
 * 字段: definition, control_outputs
 */
const FireControlCodec = Codec.record({
    definition:      Codec.STRING.field(),
    control_outputs: Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
});

/**
 * LauncherCodec — 发射器
 * 字段: definition, locator, ammo_outputs
 */
const LauncherCodec = Codec.record({
    definition:    Codec.STRING.field(),
    locator:       Codec.STRING.field(),
    ammo_outputs:  Codec.map(Codec.STRING, Codec.STRING.list()).default({}),
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
    'machine_max:battery':              BatteryCodec,
    'machine_max:motor_controller':     MotorControllerCodec,
    'machine_max:car_controller':       CarControllerCodec,
    'machine_max:motorbike_controller': MotorbikeControllerCodec,
    'machine_max:signal_convert':       SignalConvertCodec,
    'machine_max:wheel_driver':         WheelDriverCodec,
    'machine_max:seat':                 SeatCodec,
    'machine_max:lighting':             LightingCodec,
    'machine_max:item_storage':         ItemStorageCodec,
    'machine_max:basic':                BasicCodec,
    'machine_max:joint':                JointDriverCodec,
    'machine_max:camera':               CameraCodec,
    'machine_max:javascript':           JavascriptCodec,
    'machine_max:turret':               TurretDriverCodec,
    'machine_max:fire_controller':      FireControlCodec,
    'machine_max:launcher':             LauncherCodec,
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
        MotorControllerCodec,
        BatteryCodec,
        SignalConvertCodec,
        JointDriverCodec,
        CameraCodec,
        JavascriptCodec,
        TurretDriverCodec,
        FireControlCodec,
        LauncherCodec,
    };
}
