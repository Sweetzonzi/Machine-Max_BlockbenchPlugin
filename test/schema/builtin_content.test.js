'use strict';

// 内置内容包同步回归：上游 8a027167 的 58 个子系统定义 / 26 个连接点 / 观瞄重构。
// 只检查 vendored 快照，不依赖构建注入的 __BUILTIN_*__ 常量。

const { describe, test, expect } = require('bun:test');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..', 'src', 'builtin', 'builtin', 'machine_max');
const SUB = path.join(ROOT, 'subsystems');

function walk(dir) {
    let out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out = out.concat(walk(full));
        else if (entry.name.endsWith('.json')) out.push(full);
    }
    return out;
}

describe('builtin 内容包同步', () => {
    test('58 个子系统定义，含 track_controller / track_drive', () => {
        const files = walk(SUB);
        expect(files).toHaveLength(58);
        expect(fs.existsSync(path.join(SUB, 'track_controller', 'track_controller_standard.json')))
            .toBe(true);
        expect(fs.existsSync(path.join(SUB, 'track_drive', 'track_drive_heavy.json')))
            .toBe(true);
    });

    test('WIP battery / loader 示例已删除，新材质与瞄准镜已同步', () => {
        expect(fs.existsSync(path.join(SUB, 'battery'))).toBe(false);
        expect(fs.existsSync(path.join(SUB, 'loader'))).toBe(false);
        expect(fs.existsSync(path.join(ROOT, 'materials', 'internal_machinery.json'))).toBe(true);
        expect(fs.existsSync(path.join(SUB, 'sight', 'gunner_sight_dual_stb.json'))).toBe(true);
    });

    test('履带连接点已同步，track_drive 默认控制频道并入 car_control', () => {
        const connectors = fs.readdirSync(path.join(ROOT, 'connectors'))
            .filter((name) => name.endsWith('.json'));
        expect(connectors).toHaveLength(26);

        for (const id of [
            'track_idler_left', 'track_idler_right',
            'track_road_wheel_left', 'track_road_wheel_right',
            'track_sprocket_left', 'track_sprocket_right',
        ]) {
            expect(connectors).toContain(id + '.json');
        }

        const driveRaw = fs.readFileSync(
            path.join(SUB, 'track_drive', 'track_drive_heavy.json'), 'utf8');
        expect(driveRaw).toContain('"car_control"');
        expect(driveRaw).not.toContain('"track_control"');
    });

    test('观瞄重构：sight 是固定炮镜、camera 是可转镜头', () => {
        const schemas = path.join(ROOT, 'docs', 'en_us', 'schemas', 'subsystem', 'static');
        const sightSchema = JSON.parse(fs.readFileSync(
            path.join(schemas, 'sight_static_attr.schema.json'), 'utf8'));
        const cameraSchema = JSON.parse(fs.readFileSync(
            path.join(schemas, 'camera_static_attr.schema.json'), 'utf8'));

        // 固定炮镜没有独立观察转轴：行程与跟踪字段整体移除。
        for (const removed of ['min_pitch', 'max_pitch', 'yaw_limit', 'tracking_target_inputs']) {
            expect(sightSchema.properties).not.toHaveProperty(removed);
            expect(cameraSchema.properties).toHaveProperty(removed);
        }
        // 可转镜头新增观察轴角速度。
        expect(cameraSchema.properties.pitch_speed.default).toBe(90);
        expect(cameraSchema.properties.yaw_speed.default).toBe(90);
        // 发现握手默认频道改为 camera_sight。
        expect(sightSchema.properties.discovery_inputs.default).toEqual(['camera_sight']);
        expect(cameraSchema.properties.discovery_inputs.default).toEqual(['camera_sight']);

        const gunner = JSON.parse(fs.readFileSync(
            path.join(SUB, 'sight', 'gunner_sight.json'), 'utf8'));
        expect(gunner.type).toBe('machine_max:sight');
        expect(gunner).not.toHaveProperty('min_pitch');

        // 车长镜是可转设备，定义落在 sight/ 目录但 type 必须是 camera。
        const commander = JSON.parse(fs.readFileSync(
            path.join(SUB, 'sight', 'commander_sight_dual_stb.json'), 'utf8'));
        expect(commander.type).toBe('machine_max:camera');
        expect(commander.pitch_speed).toBe(90);
        expect(commander.yaw_speed).toBe(90);
    });

    test('封闭载具第三人称驾驶座定义已同步', () => {
        expect(fs.existsSync(path.join(SUB, 'seat', 'default_3rd_driver_seat.json'))).toBe(true);
    });
});
