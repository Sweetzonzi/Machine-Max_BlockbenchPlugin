'use strict';

// 内置内容包同步回归：上游 06ba3627 的 58 个子系统定义 / 28 个连接点 / 投射物顶层 schema。
// 只检查 vendored 快照，不依赖构建注入的 __BUILTIN_*__ 常量。

const { describe, test, expect } = require('bun:test');
const fs = require('fs');
const path = require('path');
const { stripJsonComments } = require('../../src/utils/file_writer.js');

const ROOT = path.join(__dirname, '..', '..', 'src', 'builtin', 'builtin', 'machine_max');
const SUB = path.join(ROOT, 'subsystems');

/** 内置定义允许 // 注释，解析前先剥离（与 content_pack.readAllDefs 一致） */
function readJsonc(file) {
    return JSON.parse(stripJsonComments(fs.readFileSync(file, 'utf8')));
}

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

    test('连接点已同步（含通用 X/Y 轴铰链），track_drive 默认控制频道并入 car_control', () => {
        const connectors = fs.readdirSync(path.join(ROOT, 'connectors'))
            .filter((name) => name.endsWith('.json'));
        expect(connectors).toHaveLength(28);

        for (const id of [
            'track_idler_left', 'track_idler_right',
            'track_road_wheel_left', 'track_road_wheel_right',
            'track_sprocket_left', 'track_sprocket_right',
            'hinge_x', 'hinge_y',
        ]) {
            expect(connectors).toContain(id + '.json');
        }

        // 通用铰链：X 轴用于舱盖等，Y 轴用于车门等，均为 Advanced + 单轴 joint_attrs。
        const hingeX = readJsonc(path.join(ROOT, 'connectors', 'hinge_x.json'));
        const hingeY = readJsonc(path.join(ROOT, 'connectors', 'hinge_y.json'));
        expect(hingeX.type).toBe('Advanced');
        expect(hingeY.type).toBe('Advanced');
        expect(Object.keys(hingeX.joint_attrs)).toEqual(['xr']);
        expect(Object.keys(hingeY.joint_attrs)).toEqual(['yr']);

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

    test('投射物顶层 schema 已同步（弹道 / cookoff / warheads）', () => {
        for (const locale of ['en_us', 'zh_cn']) {
            const schema = JSON.parse(fs.readFileSync(
                path.join(ROOT, 'docs', locale, 'schemas', 'projectile', 'projectile.schema.json'),
                'utf8'));
            expect(schema.required).toEqual(['type', 'external', 'terminal']);
            expect(schema.properties.type.const).toBe('ballistic');
            expect(schema.properties.external.required).toEqual(['mass', 'base_velocity']);
            expect(schema.properties.terminal.required)
                .toEqual(['base_penetration', 'base_damage']);
            expect(schema.properties.hit_detection.enum).toEqual(['ray', 'sweep']);
            // 殉爆贡献：根对象（发射药）与 blast 弹头各有一份，按 1 m 参考半径标定。
            expect(Object.keys(schema.$defs.cookoff.properties))
                .toEqual(['penetration', 'damage', 'impulse']);
        }
    });

    test('材质 physics 新增 impact_min_speed，轮胎材质已写入 5.0', () => {
        for (const locale of ['en_us', 'zh_cn']) {
            const schema = JSON.parse(fs.readFileSync(path.join(
                ROOT, 'docs', locale, 'schemas', 'base', 'material_attr.schema.json'), 'utf8'));
            const impact = schema.properties.physics.properties.impact_min_speed;
            expect(impact.minimum).toBe(0);
            expect(impact.default).toBe(2.0);
        }
        for (const id of ['normal_tire', 'off_road_tire', 'drifting_tire', 'racing_tire']) {
            const material = JSON.parse(fs.readFileSync(
                path.join(ROOT, 'materials', id + '.json'), 'utf8'));
            expect(material.physics.impact_min_speed).toBe(5.0);
        }
    });

    test('现代观瞄 HUD 组件已同步，weapon_live 布局已被上游删除', () => {
        expect(fs.existsSync(path.join(ROOT, 'hud_layouts', 'modern_optics.json'))).toBe(true);
        expect(fs.existsSync(path.join(ROOT, 'hud_layouts', 'morden_ground_basic.json'))).toBe(true);
        // 上游用 modern_optics / morden_ground_basic 取代 weapon_live，旧文件不留在快照里。
        expect(fs.existsSync(path.join(ROOT, 'hud_layouts', 'weapon_live.json'))).toBe(false);

        const huds = fs.readdirSync(path.join(ROOT, 'huds'));
        for (const id of ['compass', 'durability', 'reticle', 'sight_name', 'speed']) {
            expect(huds).toContain('modern_optics_' + id + '.json');
        }
        expect(fs.existsSync(path.join(ROOT, 'documents', 'modern_optics', 'reticle.html')))
            .toBe(true);
    });
});
