'use strict';

// 内置内容包同步回归：上游 8e9a5263 的 61 个子系统定义 / 28 个连接点 / 投射物顶层 schema。
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
    test('62 个子系统定义，含 track_controller / track_drive / joint_driver / reactive_armor', () => {
        const files = walk(SUB);
        expect(files).toHaveLength(62);
        expect(fs.existsSync(path.join(SUB, 'track_controller', 'track_controller_standard.json')))
            .toBe(true);
        expect(fs.existsSync(path.join(SUB, 'track_drive', 'track_drive_heavy.json')))
            .toBe(true);
        expect(fs.existsSync(path.join(SUB, 'joint_driver', 'rotation_joint_driver.json')))
            .toBe(true);
        expect(fs.existsSync(path.join(SUB, 'reactive_armor', 'reactive_armor_brick.json')))
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
        const sightSchema = readJsonc(path.join(schemas, 'sight_static_attr.schema.json'));
        const cameraSchema = readJsonc(path.join(schemas, 'camera_static_attr.schema.json'));

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

        const gunner = readJsonc(path.join(SUB, 'sight', 'gunner_sight.json'));
        expect(gunner.type).toBe('machine_max:sight');
        expect(gunner).not.toHaveProperty('min_pitch');

        // 车长镜是可转设备，定义落在 sight/ 目录但 type 必须是 camera。
        const commander = readJsonc(path.join(SUB, 'sight', 'commander_sight_dual_stb.json'));
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

    test('FMOD 音效接线：base 三份 sound schema 与 fmod 文档已同步', () => {
        for (const locale of ['en_us', 'zh_cn']) {
            for (const name of ['fmod_sound', 'material_fmod_sound', 'material_sound_override']) {
                expect(fs.existsSync(path.join(
                    ROOT, 'docs', locale, 'schemas', 'base', name + '.schema.json')))
                    .toBe(true);
            }
            // 型号静态属性的 sounds 段现在可以带 fmod 子块
            const engine = JSON.parse(fs.readFileSync(path.join(
                ROOT, 'docs', locale, 'schemas', 'subsystem', 'static', 'engine_static_attr.schema.json'),
            'utf8'));
            expect(engine.properties.sounds.properties.fmod).toBeTruthy();
        }
        expect(fs.existsSync(path.join(ROOT, 'docs', 'zh_cn', 'fmod.md'))).toBe(true);
        expect(fs.existsSync(path.join(ROOT, 'fmod'))).toBe(true);
        // 材质命中音可以覆盖 FMOD bank
        const hitBox = JSON.parse(fs.readFileSync(path.join(
            ROOT, 'docs', 'zh_cn', 'schemas', 'part', 'subpart', 'hit_box', 'hit_box_attr.schema.json'),
        'utf8'));
        expect(JSON.stringify(hitBox.properties.overwrite.properties.sounds))
            .toContain('material_sound_override');
    });

    test('第三人称 HUD 布局与座位定义已同步', () => {
        expect(fs.existsSync(path.join(ROOT, 'documents', 'vehicle_seat_map', 'index.html'))).toBe(true);
        for (const name of ['vehicle_seat_map', 'vehicle_seat_list', 'vehicle_status_heading',
            'vehicle_status_camera', 'vehicle_status_topdown']) {
            expect(fs.existsSync(path.join(ROOT, 'huds', name + '.json'))).toBe(true);
            expect(fs.existsSync(path.join(ROOT, 'hud_layouts', name + '.json'))).toBe(true);
        }
        // 三人称座位统一走状态 HUD 的航向布局；车内座位各用自己的仪表布局
        const thirdLayout = {};
        for (const name of ['default_seat', 'default_passenger_seat', 'default_3rd_seat',
            'default_3rd_driver_seat', 'default_3rd_passenger_seat']) {
            const seat = readJsonc(path.join(SUB, 'seat', name + '.json'));
            expect(seat.type).toBe('machine_max:seat');
            thirdLayout[name] = seat.views.third_hud_layout;
        }
        expect(thirdLayout.default_seat).toBe('machine_max:seat_dashboard_third');
        expect(thirdLayout.default_passenger_seat).toBe('machine_max:vehicle_seat_list');
        for (const name of ['default_3rd_seat', 'default_3rd_driver_seat', 'default_3rd_passenger_seat']) {
            expect(thirdLayout[name]).toBe('machine_max:vehicle_status_heading');
        }
    });

    test('炮塔双机：动力型与手摇型各带自己的 FMOD 轴事件', () => {
        const az = readJsonc(path.join(SUB, 'turret_driver', 'basic_azimuth_driver.json'));
        const el = readJsonc(path.join(SUB, 'turret_driver', 'basic_elevation_driver.json'));
        const manualAz = readJsonc(path.join(SUB, 'turret_driver', 'basic_manual_azimuth_driver.json'));
        const manualEl = readJsonc(path.join(SUB, 'turret_driver', 'basic_manual_elevation_driver.json'));

        expect(az.sounds.fmod.horizontal).toContain('horizontal_hydraulic');
        expect(el.sounds.fmod.vertical).toContain('vertical_hydraulic');
        expect(manualAz.sounds.fmod.horizontal).toContain('horizontal_manual');
        expect(manualEl.sounds.fmod.vertical).toContain('vertical_manual');
        // 手摇型转速远低于动力型（方向机 20 vs 90，高低机 8 vs 30）
        expect(manualAz.yaw.max_speed).toBe(20.0);
        expect(manualEl.pitch.max_speed).toBe(8.0);

        const schema = readJsonc(path.join(
            ROOT, 'docs', 'zh_cn', 'schemas', 'subsystem', 'static',
            'turret_driver_static_attr.schema.json'));
        const sounds = schema.properties.sounds.properties;
        expect(sounds.fmod.required).toEqual(['bank']);
        expect(sounds.fmod.properties.horizontal.pattern).toBe('^event:/.+');
        // 该轴没有 FMOD 事件时按角速度升调播放电机音
        expect(sounds.turn.default.sound_id).toBe('machine_max:subsystem.motor.elec_3000');
    });

    test('交互区门控改成 MoLang 表达式（默认 true，不再是逻辑枚举）', () => {
        for (const locale of ['en_us', 'zh_cn']) {
            const schema = readJsonc(path.join(
                ROOT, 'docs', locale, 'schemas', 'part', 'subpart',
                'interact_box_attr.schema.json'));
            const condition = schema.properties.condition;
            expect(condition.type).toBe('string');
            expect(condition.default).toBe('true');
            expect(condition).not.toHaveProperty('enum');
        }
    });

    test('音效子块去掉 _sounds 后缀，履带 fitting 补 fmod', () => {
        const staticDir = path.join(ROOT, 'docs', 'zh_cn', 'schemas', 'subsystem', 'static');
        const ammoLoader = readJsonc(path.join(staticDir, 'ammo_loader_static_attr.schema.json'));
        const launcher = readJsonc(path.join(staticDir, 'launcher_static_attr.schema.json'));
        const engine = readJsonc(path.join(staticDir, 'engine_static_attr.schema.json'));

        expect(Object.keys(ammoLoader.properties.sounds.properties))
            .toEqual(expect.arrayContaining(['progress', 'human_progress', 'fmod']));
        expect(Object.keys(launcher.properties.sounds.properties))
            .toEqual(expect.arrayContaining(['fire', 'cease_fire', 'shell', 'human_progress']));
        expect(engine.properties.sounds.properties).toHaveProperty('working');
        expect(engine.properties.sounds.properties).not.toHaveProperty('working_sounds');
        // 发射器型号新增炮管耐久权重
        expect(launcher.properties.barrel.properties.durability_weight.default).toBe(1.0);

        const fitting = readJsonc(path.join(ROOT, 'docs', 'zh_cn', 'schemas', 'fitting.schema.json'));
        expect(fitting.properties.fmod.required).toEqual(['bank']);
        const defaultFitting = readJsonc(path.join(ROOT, 'fittings', 'default.json'));
        expect(defaultFitting.fmod.roll).toContain('tracks_muted');
    });

    test('上游 4fcd56e6：变体控制器集 / 变速箱离合反馈 / 动画关节执行器 / 车轮自由滚动', () => {
        for (const locale of ['en_us', 'zh_cn']) {
            const schemas = path.join(ROOT, 'docs', locale, 'schemas');
            // 变体新增 controllers（控制器集），animations 语义改为动画集
            const variant = readJsonc(path.join(schemas, 'part', 'variant_attr.schema.json'));
            expect(variant.properties.controllers).toBeTruthy();
            expect(variant.properties.controllers.description.toLowerCase())
                .toContain('controller');
            // 变速箱新增离合踏板反馈
            const gearbox = readJsonc(path.join(schemas, 'subsystem', 'dynamic',
                'gearbox_dynamic_attr.schema.json'));
            expect(gearbox.properties.clutch_outputs.default).toEqual({});
            // 座位第三人称瞄准俯仰偏置
            const view = readJsonc(path.join(schemas, 'subsystem', 'static', 'view_attr.schema.json'));
            expect(view.properties.third_person_pitch_bias.default).toBe(15);
            // 动画关节执行器的静态轴与动态绑定
            const jointDynamic = readJsonc(path.join(schemas, 'subsystem', 'dynamic',
                'joint_driver_dynamic_attr.schema.json'));
            expect(jointDynamic.properties.connector).toBeTruthy();
            const jointStatic = readJsonc(path.join(schemas, 'subsystem', 'static',
                'joint_driver_static_attr.schema.json'));
            expect(Object.keys(jointStatic.properties.axes.properties))
                .toEqual(['X', 'Y', 'Z', 'XR', 'YR', 'ZR']);
            expect(jointStatic.properties.rotation_order.enum).toContain('ZYX');
        }

        const joint = readJsonc(path.join(SUB, 'joint_driver', 'rotation_joint_driver.json'));
        expect(joint.type).toBe('machine_max:joint_driver');
        expect(joint.axes.YR.max_force).toBe(250);
        // 轮式连接点用「下限高于上限」表达绕 X 轴自由滚动
        const wheel = readJsonc(path.join(ROOT, 'connectors', 'light_left_wheel.json'));
        expect(wheel.joint_attrs.xr).toEqual({ lower_limit: 1, upper_limit: -1 });
    });
});
