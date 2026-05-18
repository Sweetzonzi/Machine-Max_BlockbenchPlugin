/**
 * 子系统类型注册表
 *
 * 定义所有子系统类型的元数据：名称、分类、字段列表、默认值、
 * 需要的绑定类型（locator/connector）、信号输出/输入字段。
 *
 * 从 generators/subsystem_generator.js 的 getTypeSpecificFields() 抽离并扩展。
 * generator 改为委托本模块的函数。
 */

/**
 * 子系统类型元数据条目结构：
 * {
 *   id: 'machine_max:engine',           // 类型 ID
 *   displayName: '发动机',               // 中文显示名
 *   category: 'power',                  // 分类：power | control | utility | experimental
 *   fields: [...],                      // 类型专属字段列表
 *   defaults: {...},                    // 类型专属字段默认值
 *   needsLocator: false,                // 是否需要 locator 字段
 *   needsConnector: false,              // 是否需要 connector 字段
 *   signalOutputs: [...],               // 信号输出字段名列表
 *   signalInputs: [],                   // 信号输入字段名列表
 * }
 */

var SUBSYSTEM_TYPES = [
    // ===== power 分类 =====
    {
        id: 'machine_max:engine',
        displayName: '发动机',
        category: 'power',
        fields: ['max_power', 'max_torque', 'idle_rpm', 'idle_torque_ratio', 'peak_torque_rpm', 'red_line_rpm', 'red_line_torque_ratio', 'inertia', 'four_stroke', 'cylinder_count', 'drag_coefficients', 'control_channels', 'sound_map'],
        defaults: {
            max_power: 100.0, max_torque: 200.0, idle_rpm: 800,
            idle_torque_ratio: 0.15, peak_torque_rpm: 3500,
            red_line_rpm: 7000, red_line_torque_ratio: 0.85,
            inertia: 0.3, four_stroke: true, cylinder_count: 4,
        },
        needsLocator: false,
        needsConnector: false,
        signalOutputs: ['power_output', 'speed_outputs'],
        signalInputs: [],
    },
    {
        id: 'machine_max:motor',
        displayName: '电动机',
        category: 'power',
        fields: ['max_power', 'max_torque', 'red_line_rpm', 'inertia'],
        defaults: {
            max_power: 50.0, max_torque: 100.0, red_line_rpm: 8000, inertia: 0.1,
        },
        needsLocator: false,
        needsConnector: false,
        signalOutputs: ['power_output', 'speed_outputs'],
        signalInputs: [],
    },
    {
        id: 'machine_max:battery',
        displayName: '电池',
        category: 'power',
        fields: ['capacity', 'voltage', 'max_discharge', 'max_charge'],
        defaults: {
            capacity: 10000, voltage: 48, max_discharge: 500, max_charge: 500,
        },
        needsLocator: false,
        needsConnector: false,
        signalOutputs: ['power_output'],
        signalInputs: [],
    },
    // ===== control 分类 =====
    {
        id: 'machine_max:car_controller',
        displayName: '车辆控制器',
        category: 'control',
        fields: ['steer_speed', 'steer_return_speed', 'max_steer_angle'],
        defaults: {
            steer_speed: 5.0, steer_return_speed: 10.0, max_steer_angle: 35.0,
        },
        needsLocator: false,
        needsConnector: false,
        signalOutputs: ['control_outputs', 'speed_outputs', 'throttle_outputs', 'brake_outputs', 'steering_outputs', 'handbrake_outputs'],
        signalInputs: [],
    },
    {
        id: 'machine_max:motorbike_controller',
        displayName: '摩托车控制器',
        category: 'control',
        fields: ['lean_angle_max', 'lean_speed'],
        defaults: {
            lean_angle_max: 30.0, lean_speed: 5.0,
        },
        needsLocator: false,
        needsConnector: false,
        signalOutputs: ['control_outputs', 'speed_outputs', 'throttle_outputs', 'brake_outputs', 'steering_outputs'],
        signalInputs: [],
    },
    {
        id: 'machine_max:signal_convert',
        displayName: '信号转换器',
        category: 'control',
        fields: ['mappings'],
        defaults: {},
        needsLocator: false,
        needsConnector: false,
        signalOutputs: [],
        signalInputs: ['control_inputs'],
    },
    {
        id: 'machine_max:motor_controller',
        displayName: '电机控制器',
        category: 'control',
        fields: ['power_distribution', 'speed_control'],
        defaults: {
            power_distribution: 1.0, speed_control: 'rpm',
        },
        needsLocator: false,
        needsConnector: false,
        signalOutputs: ['power_output', 'speed_outputs'],
        signalInputs: ['control_inputs'],
    },
    // ===== utility 分类 =====
    {
        id: 'machine_max:gearbox',
        displayName: '变速箱',
        category: 'utility',
        fields: ['forward_gears', 'reverse_gears', 'shift_time', 'shift_speed'],
        defaults: {
            forward_gears: 6, reverse_gears: 1, shift_time: 0.3, shift_speed: 0.0,
        },
        needsLocator: false,
        needsConnector: false,
        signalOutputs: ['power_output', 'gear_outputs'],
        signalInputs: ['control_inputs'],
    },
    {
        id: 'machine_max:transmission',
        displayName: '分动箱',
        category: 'utility',
        fields: ['efficiency', 'front_split', 'rear_split', 'center_split'],
        defaults: {
            efficiency: 0.95, front_split: 0.5, rear_split: 0.5, center_split: 0.5,
        },
        needsLocator: false,
        needsConnector: false,
        signalOutputs: ['power_outputs'],
        signalInputs: ['control_inputs'],
    },
    {
        id: 'machine_max:wheel_driver',
        displayName: '轮胎驱动器',
        category: 'utility',
        fields: ['friction', 'suspension_stiffness', 'suspension_damping', 'suspension_travel', 'wheel_radius', 'wheel_width'],
        defaults: {
            friction: 1.0, suspension_stiffness: 100.0, suspension_damping: 10.0,
            suspension_travel: 0.2, wheel_radius: 0.35, wheel_width: 0.2,
        },
        needsLocator: false,
        needsConnector: true,
        signalOutputs: [],
        signalInputs: ['control_inputs'],
    },
    {
        id: 'machine_max:seat',
        displayName: '座位',
        category: 'utility',
        fields: ['mount_offset', 'view_offset', 'eye_offset', 'player_scale'],
        defaults: {
            mount_offset: [0, 0, 0], view_offset: [0, 0, 0],
            eye_offset: [0, 0, 0], player_scale: 1.0,
        },
        needsLocator: true,
        needsConnector: false,
        signalOutputs: ['move_outputs', 'regular_outputs', 'aim_outputs', 'passenger_num_outputs'],
        signalInputs: [],
    },
    {
        id: 'machine_max:lighting',
        displayName: '灯光',
        category: 'utility',
        fields: ['radius', 'color', 'intensity', 'falloff', 'flicker', 'shadow'],
        defaults: {
            radius: 10.0, color: '#ffffff', intensity: 1.0, falloff: 1.0, flicker: false, shadow: false,
        },
        needsLocator: false,
        needsConnector: false,
        signalOutputs: [],
        signalInputs: ['control_inputs'],
    },
    {
        id: 'machine_max:item_storage',
        displayName: '物品存储',
        category: 'utility',
        fields: ['rows', 'columns', 'filter'],
        defaults: {
            rows: 3, columns: 9, filter: '',
        },
        needsLocator: false,
        needsConnector: false,
        signalOutputs: [],
        signalInputs: [],
    },
    {
        id: 'machine_max:basic',
        displayName: '基础（无额外面板）',
        category: 'utility',
        fields: [],
        defaults: {},
        needsLocator: false,
        needsConnector: false,
        signalOutputs: [],
        signalInputs: [],
    },
    {
        id: 'machine_max:joint',
        displayName: '关节',
        category: 'utility',
        fields: ['torque', 'speed', 'angle_limit', 'axis'],
        defaults: {
            torque: 100.0, speed: 1.0, angle_limit: 90.0, axis: 'y',
        },
        needsLocator: false,
        needsConnector: true,
        signalOutputs: [],
        signalInputs: ['control_inputs'],
    },
    // ===== experimental 分类 =====
    {
        id: 'machine_max:camera',
        displayName: '摄像头',
        category: 'experimental',
        fields: ['fov', 'clip_near', 'clip_far', 'follow'],
        defaults: {
            fov: 70.0, clip_near: 0.1, clip_far: 100.0, follow: '',
        },
        needsLocator: false,
        needsConnector: false,
        signalOutputs: [],
        signalInputs: [],
    },
    {
        id: 'machine_max:javascript',
        displayName: 'JavaScript 脚本',
        category: 'experimental',
        fields: ['script'],
        defaults: {
            script: '',
        },
        needsLocator: false,
        needsConnector: false,
        signalOutputs: [],
        signalInputs: [],
    },
    {
        id: 'machine_max:turret',
        displayName: '炮塔',
        category: 'experimental',
        fields: ['yaw_speed', 'pitch_speed', 'yaw_limit', 'pitch_limit'],
        defaults: {
            yaw_speed: 30.0, pitch_speed: 20.0, yaw_limit: 180.0, pitch_limit: 45.0,
        },
        needsLocator: true,
        needsConnector: true,
        signalOutputs: [],
        signalInputs: ['control_inputs'],
    },
    {
        id: 'machine_max:fire_controller',
        displayName: '火控系统',
        category: 'experimental',
        fields: ['fire_modes', 'rate_of_fire', 'ammo_types'],
        defaults: {
            fire_modes: ['single'], rate_of_fire: 1.0, ammo_types: [],
        },
        needsLocator: true,
        needsConnector: true,
        signalOutputs: ['fire_outputs'],
        signalInputs: ['control_inputs'],
    },
    {
        id: 'machine_max:launcher',
        displayName: '发射器',
        category: 'experimental',
        fields: ['launch_speed', 'ammo_type', 'reload_time'],
        defaults: {
            launch_speed: 20.0, ammo_type: '', reload_time: 2.0,
        },
        needsLocator: true,
        needsConnector: true,
        signalOutputs: [],
        signalInputs: ['control_inputs'],
    },
];

/** 按 id 索引的类型字典（构建时生成） */
var TYPE_MAP = {};
(function () {
    for (var i = 0; i < SUBSYSTEM_TYPES.length; i++) {
        TYPE_MAP[SUBSYSTEM_TYPES[i].id] = SUBSYSTEM_TYPES[i];
    }
})();

/**
 * 获取指定子系统类型的完整元数据
 * @param {string} typeId - 类型 ID，如 'machine_max:engine'
 * @returns {Object|null} 元数据对象，未知类型返回 null
 */
function getTypeMeta(typeId) {
    return TYPE_MAP[typeId] || null;
}

/**
 * 获取所有子系统类型列表
 * @returns {Object[]} 全部类型条目数组
 */
function getAllTypes() {
    return SUBSYSTEM_TYPES.slice();
}

/**
 * 按分类筛选子系统类型
 * @param {string} category - 分类名：'power' | 'control' | 'utility' | 'experimental'
 * @returns {Object[]} 筛选后的类型条目数组
 */
function getTypesByCategory(category) {
    return SUBSYSTEM_TYPES.filter(function (t) { return t.category === category; });
}

/**
 * 获取指定子系统类型的特有字段列表（兼容旧接口）
 * @param {string} typeId - 类型 ID
 * @returns {string[]} 字段键名数组
 */
function getTypeSpecificFields(typeId) {
    var meta = TYPE_MAP[typeId];
    return meta ? meta.fields.slice() : [];
}

/**
 * 获取指定子系统类型的默认值
 * @param {string} typeId - 类型 ID
 * @returns {Object} 默认值对象（深拷贝）
 */
function getTypeDefaults(typeId) {
    var meta = TYPE_MAP[typeId];
    if (!meta) return {};
    return JSON.parse(JSON.stringify(meta.defaults));
}

/**
 * 获取所有类型按分类组织
 * @returns {Object} { power: [...], control: [...], utility: [...], experimental: [...] }
 */
function getTypesGroupedByCategory() {
    var result = { power: [], control: [], utility: [], experimental: [] };
    for (var i = 0; i < SUBSYSTEM_TYPES.length; i++) {
        var t = SUBSYSTEM_TYPES[i];
        if (result[t.category]) {
            result[t.category].push(t);
        }
    }
    return result;
}

/**
 * 获取类型分类的中文标签
 * @param {string} category
 * @returns {string}
 */
function getCategoryLabel(category) {
    var labels = {
        power: '动力',
        control: