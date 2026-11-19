// src/core/constants.js
// 应用级常量
'use strict';

/** 当前配置版本号 */
const CONFIG_VERSION = 4;

/**
 * 内置基础内容包 ID
 *
 * 该包由构建脚本注入（__BUILTIN_*__），运行时始终可用，不属于本地路径依赖。
 * 链式依赖解析与合并读取都必须跳过它，否则内置定义会被重复读取并标记为
 * `dependency:N`（来源徽标错误），甚至覆盖插件内置的快照。
 */
const BUILTIN_PACK_ID = 'machine_max:builtin';

/**
 * 常用信号频道名补全列表（唯一真源）
 *
 * 收敛 SubsystemPanel / ConnectorPanel / InteractBoxPanel 三处重复的 channelHints
 * （取三处并集）。信号目标编辑器与频道输入框的 datalist 提示均引用本常量。
 */
const SIGNAL_CHANNEL_HINTS = [
    // 运动 / 常规控制
    'move_input', 'regular_input', 'engine_control', 'wheel_control',
    'steering', 'throttle', 'brake', 'handbrake',
    // 转速 / 速度 / 挡位
    'engine_speed', 'wheel_speed', 'vehicle_speed',
    'gear', 'clutch', 'parking_brake', 'power',
    // 车门 / 引擎盖 / 后备箱
    'interact_left_front_door', 'interact_right_front_door',
    'interact_left_back_door', 'interact_right_back_door',
    'interact_hood', 'interact_trunk',
    'interact_left_front', 'interact_right_front',
    'interact_left_back', 'interact_right_back',
    // 交互区 / 自定义
    'interact', 'interact_seat', 'trunk_interact', 'lever_pull',
    'button_press', 'door_interact', 'switch_toggle', 'interact_custom',
];

/**
 * 弹药供弹服务频道补全列表
 *
 * 供弹发现用的频道只表达服务类别（按口径命名），不承载业务信号，因此与
 * SIGNAL_CHANNEL_HINTS 分开维护：弹药架与自动装弹机的「供弹服务频道」
 * 输入框引用本常量。清单取自第一方内容包在用的频道。
 */
const AMMO_SERVICE_CHANNEL_HINTS = [
    'ammo_7_62mm', 'ammo_7_92mm', 'ammo_12_7mm',
    'ammo_30mm', 'ammo_50mm', 'ammo_57mm',
    'ammo_100mm', 'ammo_120mm', 'ammo_125mm',
    'ammo_atgm',
];

/**
 * 视点发现频道补全列表
 *
 * `camera_discovery_targets`（座位 / 武器控制器）的频道是**视点自己声明的
 * discovery_inputs**：上游 `resolveViewpoints` 按频道名查终端，视点没声明该频道
 * 就发现不到。清单取自第一方内容包在用的频道（builtin 的 sight / camera 定义）。
 * `camera_sight` 是视点未声明时的默认接受频道，写进发现表等于全车所有视点，
 * 上游因此禁止，这里也不列。
 */
const CAMERA_DISCOVERY_CHANNEL_HINTS = [
    'gunner_sight', 'commander_sight', 'targeting_pod_sight',
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG_VERSION,
        BUILTIN_PACK_ID,
        SIGNAL_CHANNEL_HINTS,
        AMMO_SERVICE_CHANNEL_HINTS,
        CAMERA_DISCOVERY_CHANNEL_HINTS,
    };
}
