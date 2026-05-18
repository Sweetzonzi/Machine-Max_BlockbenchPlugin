const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('GenPart');

/**
 * parts/*.json 生成器 — 将 MMProjectConfig.parts 中的零件配置导出为 MachineMax 格式的 JSON 文件
 */

function generatePartJSON(partId, partConfig, namespace) {
    const ns = namespace || 'machine_max';
    const output = {};

    const topFields = [
        'icon', 'vehicle_durability_rate', 'vehicle_damage_rate',
        'vehicle_damage_rate_destroyed', 'functional_threshold',
        'share_durability', 'max_stack_size',
    ];

    for (const field of topFields) {
        if (partConfig[field] !== undefined && partConfig[field] !== null) {
            output[field] = partConfig[field];
        }
    }

    const variants = partConfig.variants || {};
    const variantKeys = Object.keys(variants);

    if (variantKeys.length === 1 && variantKeys[0] === 'default') {
        output.variants = buildVariantOutput(variants['default'], ns);
    } else if (variantKeys.length > 0) {
        output.variants = {};
        for (const [vName, variant] of Object.entries(variants)) {
            output.variants[vName] = buildVariantOutput(variant, ns);
        }
    }

    log.debug('generatePartJSON: 零件 ' + partId + ' 生成完成');
    return output;
}

function buildVariantOutput(variant, ns) {
    const out = {};

    if (variant.model) out.model = variant.model;
    if (variant.textures) out.textures = variant.textures;
    if (variant.animations) out.animations = variant.animations;
    if (variant.tags && variant.tags.length > 0) out.tags = variant.tags;

    const subParts = variant.sub_parts || {};
    const spKeys = Object.keys(subParts);

    if (spKeys.length === 1 && spKeys[0] === 'sub_part.machine_max.main') {
        out.sub_parts = buildSubPartOutput(subParts['sub_part.machine_max.main']);
    } else if (spKeys.length > 0) {
        out.sub_parts = {};
        for (const [spName, sp] of Object.entries(subParts)) {
            out.sub_parts[spName] = buildSubPartOutput(sp);
        }
    }

    return out;
}

function buildSubPartOutput(sp) {
    const out = {};

    if (sp.start_bone) out.start_bone = sp.start_bone;
    if (sp.end_bones && sp.end_bones.length > 0) out.end_bones = sp.end_bones;
    if (sp.durability !== 20.0) out.durability = sp.durability;
    if (sp.mass !== 25.0) out.mass = sp.mass;
    if (sp.mass_center && sp.mass_center !== 'mass_center') out.mass_center = sp.mass_center;
    if (sp.projected_area && !sp.projected_area.every(v => v === 0)) out.projected_area = sp.projected_area;
    if (sp.block_collision && sp.block_collision !== 'true') out.block_collision = sp.block_collision;
    if (sp.collision_height !== -1.0) out.collision_height = sp.collision_height;
    if (sp.climb_assist) out.climb_assist = true;
    if (sp.hydro_priority !== 0) out.hydro_priority = sp.hydro_priority;

    // 导出碰撞箱时将 UUID key 解析为骨骼名（游戏运行时使用骨骼名作为 key）
    if (sp.hit_boxes && Object.keys(sp.hit_boxes).length > 0) out.hit_boxes = _resolveUUIDKeys(sp.hit_boxes);
    if (sp.interact_boxes && Object.keys(sp.interact_boxes).length > 0) out.interact_boxes = _resolveUUIDKeys(sp.interact_boxes);
    if (sp.connectors && Object.keys(sp.connectors).length > 0) out.connectors = _cleanConnectors(sp.connectors);
    if (sp.subsystems && Object.keys(sp.subsystems).length > 0) out.subsystems = _cleanSubsystems(sp.subsystems);
    if (sp.hydrodynamics) out.hydrodynamics = sp.hydrodynamics;

    return out;
}

/**
 * 各子系统类型的动态属性字段映射表
 *
 * 定义依据：Java 端 common/mech/subsystem/attr/dynamic_attr/ 下各 *SubsystemAttr
 * 类的 RecordCodecBuilder 中定义的 JSON 字段名（fieldOf / optionalFieldOf）。
 * 每个子系统实例在 parts/*.json 的 subsystems 中只应包含其类型对应的字段。
 */
var SUBSYSTEM_DYNAMIC_FIELDS = {
    // 基础类型：仅 type + definition
    'machine_max:basic': ['type', 'definition'],
    'machine_max:item_storage': ['type', 'definition'],
    'machine_max:battery': ['type', 'definition'],
    'machine_max:camera': ['type', 'definition'],
    'machine_max:signal_convert': ['type', 'definition'],
    // 动力源（引擎/电机/电机控制器）：definition + power_output + speed_outputs
    'machine_max:engine': ['type', 'definition', 'power_output', 'speed_outputs'],
    'machine_max:motor': ['type', 'definition', 'power_output', 'speed_outputs'],
    'machine_max:motor_controller': ['type', 'definition', 'power_output', 'speed_outputs'],
    // 变速箱：definition + power_output + gear_outputs
    'machine_max:gearbox': ['type', 'definition', 'power_output', 'gear_outputs'],
    // 分动器：definition + power_outputs（Map<String, Float>）
    'machine_max:transmission': ['type', 'definition', 'power_outputs'],
    // 控制器（轿车/摩托）：definition + 多路控制信号输出
    'machine_max:car_controller': [
        'type', 'definition',
        'control_outputs', 'speed_outputs', 'throttle_outputs',
        'steering_outputs', 'brake_outputs', 'handbrake_outputs'
    ],
    'machine_max:motorbike_controller': [
        'type', 'definition',
        'control_outputs', 'speed_outputs', 'throttle_outputs',
        'steering_outputs', 'brake_outputs', 'handbrake_outputs'
    ],
    // 火控系统：definition + control_outputs
    'machine_max:fire_controller': ['type', 'definition', 'control_outputs'],
    // 轮驱动：definition + connector + 滚动/转向信号
    'machine_max:wheel_driver': [
        'type', 'definition', 'connector',
        'roll_speed_outputs', 'steering_angle_outputs'
    ],
    // 炮塔驱动：definition + connector + rotation_outputs
    'machine_max:turret': ['type', 'definition', 'connector', 'rotation_outputs'],
    // 座椅：definition + locator + 多路控制信号
    'machine_max:seat': [
        'type', 'definition', 'locator',
        'move_outputs', 'aim_outputs', 'regular_outputs', 'passenger_num_outputs'
    ],
    // 车灯：definition + locator
    'machine_max:lighting': ['type', 'definition', 'locator'],
    // 关节驱动（JSON 中字段名为 locator，非 connector）：definition + locator + rotation_order + axes
    'machine_max:joint': ['type', 'definition', 'locator', 'rotation_order', 'axes'],
    // 发射器：definition + locator + ammo_outputs
    'machine_max:launcher': ['type', 'definition', 'locator', 'ammo_outputs'],
    // 脚本：definition + script
    'machine_max:javascript': ['type', 'definition', 'script'],
};

/**
 * 清理子系统导出数据：按子系统类型分派字段白名单。
 *
 * MachineMax 数据模型中，每个子系统类型有独立的动态属性 schema，
 * 对应 Java 端 *SubsystemAttr 的 RecordCodecBuilder 定义。
 * 导出时根据 type 字段查表，只保留该类型允许的实例级字段，
 * 防止静态属性（如 max_power、max_torque 等属于 subsystem_defs）混入。
 *
 * @param {Object<string, Object>} subsystems - 子系统映射
 * @returns {Object<string, Object>} 清理后的子系统映射
 */
function _cleanSubsystems(subsystems) {
    var result = {};
    for (var key in subsystems) {
        var ss = subsystems[key];
        var typeId = ss.type;
        var allowedFields = SUBSYSTEM_DYNAMIC_FIELDS[typeId];

        // 未知类型：回退到通用信号字段启发式过滤
        if (!allowedFields) {
            log.warn('_cleanSubsystems: 未知子系统类型 "' + typeId + '"，使用回退过滤策略');
            allowedFields = _inferDynamicFields(ss);
        }

        var cleaned = {};
        for (var fi = 0; fi < allowedFields.length; fi++) {
            var field = allowedFields[fi];
            var val = ss[field];
            if (val === undefined || val === null) continue;
            // 空对象不导出（如空的信号映射）
            if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) continue;
            // 空字符串不导出
            if (typeof val === 'string' && val === '') continue;
            cleaned[field] = val;
        }

        result[key] = cleaned;
    }
    return result;
}

/**
 * 回退策略：对未知类型使用启发式规则推断动态属性字段。
 * 保留 type、definition、字段名为 *_outputs / *_inputs 或 power_output 的值。
 *
 * @param {Object} ss - 子系统实例
 * @returns {string[]} 推断出的字段名列表
 */
function _inferDynamicFields(ss) {
    var fields = ['type', 'definition'];
    for (var sf in ss) {
        if (sf === 'type' || sf === 'definition') continue;
        if (sf.endsWith('_outputs') || sf.endsWith('_inputs') || sf === 'power_output') {
            fields.push(sf);
        }
    }
    return fields;
}

/**
 * 清理连接点导出数据：移除所有空值/默认值的信号字段，
 * 避免生成无意义的空对象冗余
 * @param {Object<string, Object>} connectors - 连接点映射
 * @returns {Object<string, Object>} 清理后的连接点映射
 */
function _cleanConnectors(connectors) {
    var result = {};
    for (var key in connectors) {
        var conn = connectors[key];
        var cleaned = {};
        // 保留必需字段
        if (conn.locator) cleaned.locator = conn.locator;
        if (conn.definition) cleaned.definition = conn.definition;
        // 信号字段：空对象/空字符串/默认 false 不导出
        if (conn.signal_targets && Object.keys(conn.signal_targets).length > 0) {
            cleaned.signal_targets = conn.signal_targets;
        }
        if (conn.signal_translations && Object.keys(conn.signal_translations).length > 0) {
            cleaned.signal_translations = conn.signal_translations;
        }
        if (conn.power_target) {
            cleaned.power_target = conn.power_target;
        }
        if (conn.internal) {
            cleaned.internal = true;
        }
        if (conn.overwrite && Object.keys(conn.overwrite).length > 0) {
            cleaned.overwrite = conn.overwrite;
        }
        result[key] = cleaned;
    }
    return result;
}

/**
 * 将对象中的 UUID key 解析为 Blueprint 元素的骨骼名（Group.name）
 * 运行时数据使用骨骼名而不是 UUID 作为 hit_boxes/interact_boxes 的键
 * @param {Object<string, *>} obj - UUID 为 key 的对象
 * @returns {Object<string, *>} 骨骼名为 key 的新对象
 */
function _resolveUUIDKeys(obj) {
    var resolved = {};
    for (var key in obj) {
        var boneName = key;
        if (typeof Group !== 'undefined' && Group.all) {
            var group = Group.all.find(function(g) { return g.uuid === key; });
            if (group) boneName = group.name;
        }
        resolved[boneName] = obj[key];
    }
    return resolved;
}

function generateAllParts(projectConfig) {
    const ns = projectConfig.namespace || 'machine_max';
    const parts = projectConfig.parts || {};
    const result = {};

    for (const [partId, partConfig] of Object.entries(parts)) {
        result[partId] = generatePartJSON(partId, partConfig, ns);
    }

    log.info('generateAllParts: 已生成 ' + Object.keys(result).length + ' 个零件');
    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generatePartJSON, generateAllParts };
}
