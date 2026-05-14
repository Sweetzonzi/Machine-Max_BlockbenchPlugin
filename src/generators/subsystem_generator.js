/**
 * subsystems/*.json 生成器 — 将 subsystem_defs 导出为子系统静态定义文件
 * 处理 19 种子系统类型及其特有字段
 */

function generateSubsystemJSON(defId, def) {
    const output = {};

    if (def.type) output.type = def.type;

    if (def.basic_durability !== 20.0) output.basic_durability = def.basic_durability;
    if (!def.pass_damage) output.pass_damage = false;
    if (def.limit_damage) output.limit_damage = true;
    if (def.hidden) output.hidden = true;
    if (def.destroy_sound_event) output.destroy_sound_event = def.destroy_sound_event;
    if (def.activate_sound_event) output.activate_sound_event = def.activate_sound_event;
    if (def.deactivate_sound_event) output.deactivate_sound_event = def.deactivate_sound_event;

    const typeSpecificFields = getTypeSpecificFields(def.type);
    for (const field of typeSpecificFields) {
        if (def[field] !== undefined && def[field] !== null) {
            output[field] = def[field];
        }
    }

    return output;
}

function getTypeSpecificFields(type) {
    const fields = {
        'machine_max:engine': ['max_power', 'max_torque', 'idle_rpm', 'idle_torque_ratio', 'peak_torque_rpm', 'red_line_rpm', 'red_line_torque_ratio', 'inertia', 'four_stroke', 'cylinder_count', 'drag_coefficients', 'control_channels', 'sound_map'],
        'machine_max:motor': ['max_power', 'max_torque', 'red_line_rpm', 'inertia'],
        'machine_max:gearbox': ['forward_gears', 'reverse_gears', 'shift_time', 'shift_speed'],
        'machine_max:wheel_driver': ['friction', 'suspension_stiffness', 'suspension_damping', 'suspension_travel', 'wheel_radius', 'wheel_width'],
        'machine_max:seat': ['mount_offset', 'view_offset', 'eye_offset', 'player_scale'],
        'machine_max:car_controller': ['steer_speed', 'steer_return_speed', 'max_steer_angle'],
        'machine_max:motorbike_controller': ['lean_angle_max', 'lean_speed'],
        'machine_max:transmission': ['efficiency', 'front_split', 'rear_split', 'center_split'],
        'machine_max:lighting': ['radius', 'color', 'intensity', 'falloff', 'flicker', 'shadow'],
        'machine_max:item_storage': ['rows', 'columns', 'filter'],
        'machine_max:motor_controller': ['power_distribution', 'speed_control'],
        'machine_max:basic': [],
        'machine_max:battery': ['capacity', 'voltage', 'max_discharge', 'max_charge'],
        'machine_max:joint': ['torque', 'speed', 'angle_limit', 'axis'],
        'machine_max:signal_convert': ['mappings'],
        'machine_max:camera': ['fov', 'clip_near', 'clip_far', 'follow'],
        'machine_max:javascript': ['script'],
        'machine_max:turret': ['yaw_speed', 'pitch_speed', 'yaw_limit', 'pitch_limit'],
        'machine_max:fire_controller': ['fire_modes', 'rate_of_fire', 'ammo_types'],
        'machine_max:launcher': ['launch_speed', 'ammo_type', 'reload_time'],
    };
    return fields[type] || [];
}

function generateAllSubsystems(projectConfig) {
    const defs = projectConfig.subsystem_defs || {};
    const result = {};
    for (const [defId, def] of Object.entries(defs)) {
        result[defId] = generateSubsystemJSON(defId, def);
    }
    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateSubsystemJSON, generateAllSubsystems, getTypeSpecificFields };
}
