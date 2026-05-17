const { createLogger } = require('../utils/logger.js');
const fileWriter = require('../utils/file_writer.js');
const path = require('path');
const fs = require('fs');

var log = createLogger('GenSubsystem');

/**
 * 获取指定子系统类型的特有字段键列表
 *
 * 内部维护类型→字段映射表，作为子系统类型定义的唯一真源。
 * subsystem_manager.getTypeFields() 委托此函数返回。
 *
 * @param {string} type - 子系统类型 ID，格式 "machine_max:xxx"
 * @returns {string[]} 字段键名数组，未知类型返回空数组
 */
function getTypeSpecificFields(type) {
    var fields = {
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

/**
 * 从内容包 subsystems/ 目录复制所有子系统定义到导出目标目录
 *
 * 支持扁平存储和按模型分组存储两种模式。
 *
 * @param {string} packDir - 内容包根目录
 * @param {string} ns - 包 namespace
 * @param {string} targetDir - 导出目标目录（如 {packRoot}/machine_max/subsystems）
 * @param {boolean} flat - 是否扁平化导出
 * @returns {number} 复制的文件数量
 */
function copySubsystemDefs(packDir, ns, targetDir, flat) {
    var count = 0;
    var srcDir = path.join(packDir, ns, 'subsystems');
    if (!fs.existsSync(srcDir)) {
        log.warn('copySubsystemDefs: 源目录不存在 ' + srcDir);
        return 0;
    }
    var files = fs.readdirSync(srcDir);

    function resolveTarget(baseDir, id, isFlat) {
        if (isFlat) return baseDir;
        var seg = id.split('_')[0];
        return (seg && seg.length > 0) ? path.join(baseDir, seg) : baseDir;
    }

    for (var i = 0; i < files.length; i++) {
        var fileName = files[i];
        if (!fileName.endsWith('.json')) continue;
        var srcFile = path.join(srcDir, fileName);
        try {
            var content = JSON.parse(fs.readFileSync(srcFile, 'utf8'));
            var id = fileName.slice(0, -5);
            var loc = fileWriter.extractResourceLocation(id, ns);
            var tDir = resolveTarget(targetDir, loc.path, flat);
            fileWriter.writeJSONFile(tDir, loc.path + '.json', content);
            count++;
        } catch (e) {
            log.warn('复制子系统文件失败: ' + srcFile, e);
        }
    }
    log.info('copySubsystemDefs: 已复制 ' + count + ' 个子系统定义');
    return count;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { copySubsystemDefs, getTypeSpecificFields };
}
