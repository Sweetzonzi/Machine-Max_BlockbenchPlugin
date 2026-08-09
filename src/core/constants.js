// src/core/constants.js
// 应用级常量
'use strict';

/** 当前配置版本号 */
const CONFIG_VERSION = 4;

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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG_VERSION, SIGNAL_CHANNEL_HINTS };
}
