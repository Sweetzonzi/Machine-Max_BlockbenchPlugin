'use strict';

const { describe, test, expect } = require('bun:test');
const generated = require('../../src/doc/field_specs.generated.js');
const allow = require('../../src/doc/schema_codec_allowlist.js');
const { PartCodec } = require('../../src/codec/codecs/part_codec.js');
const { VariantCodec } = require('../../src/codec/codecs/variant_codec.js');
const { SubPartCodec } = require('../../src/codec/codecs/sub_part_codec.js');
const { HitBoxCodec } = require('../../src/codec/codecs/hit_box_codec.js');
const { InteractBoxCodec } = require('../../src/codec/codecs/interact_box_codec.js');
const { ConnectorCodec } = require('../../src/codec/codecs/connector_codec.js');
const { SubsystemDispatchCodec } = require('../../src/codec/codecs/subsystem_codec.js');
const ssTypes = require('../../src/core/subsystem_types.js');

const CODECS = {
    part: PartCodec,
    variant: VariantCodec,
    sub_part: SubPartCodec,
    hit_box: HitBoxCodec,
    interact_box: InteractBoxCodec,
    connector: ConnectorCodec,
};

function codecFields(kind, codec) {
    return Object.keys(codec.schema).filter((field) => {
        if (kind === 'part' && field === 'element_markers') return false;
        return (generated.CONTAINERS[kind] || []).indexOf(field) < 0;
    });
}

function schemaFields(kind) {
    return Object.keys(generated.SPECS[kind].fields);
}

function allowedMissing(kind, type, field) {
    return allow.missing_fields.some((e) => e.kind === kind
        && e.field === field
        && (!e.type || e.type === type));
}

function allowedExtra(kind, type, field) {
    return allow.extra_fields.some((e) => e.kind === kind
        && e.field === field
        && (!e.type || e.type === type));
}

describe('schema ↔ Codec 差异登记', () => {
    test('类型集合：schema ∪ extra_types = dispatch ∪ missing_types', () => {
        const schemaTypes = Object.keys(generated.SPECS.subsystem).sort();
        const dispatchTypes = Object.keys(SubsystemDispatchCodec.codecs).sort();
        const extra = allow.extra_types.map((e) => e.type).sort();
        const missing = allow.missing_types.map((e) => e.type).sort();

        expect([...new Set(schemaTypes.concat(extra))].sort())
            .toEqual([...new Set(dispatchTypes.concat(missing))].sort());
        expect(allow.missing_types).toEqual([]);
        expect(allow.extra_types).toEqual([]);
    });

    test('字段集合差异只能来自 missing_fields / extra_fields', () => {
        for (const kind of Object.keys(CODECS)) {
            const schema = schemaFields(kind);
            const codec = codecFields(kind, CODECS[kind]);
            const missing = schema.filter((f) => codec.indexOf(f) < 0);
            const extra = codec.filter((f) => schema.indexOf(f) < 0);

            for (const field of missing) {
                expect(allowedMissing(kind, null, field)).toBe(true);
            }
            for (const field of extra) {
                expect(allowedExtra(kind, null, field)).toBe(true);
            }
        }

        const supported = Object.keys(generated.SPECS.subsystem)
            .filter((type) => !allow.missing_types.some((e) => e.type === type))
            .filter((type) => !allow.extra_types.some((e) => e.type === type));

        for (const type of supported) {
            const schema = Object.keys(generated.SPECS.subsystem[type].fields)
                .filter((f) => f !== 'type');
            const codec = Object.keys(SubsystemDispatchCodec.codecs[type].schema)
                .filter((f) => f !== 'type');
            const missing = schema.filter((f) => codec.indexOf(f) < 0);
            const extra = codec.filter((f) => schema.indexOf(f) < 0);

            for (const field of missing) {
                expect(allowedMissing('subsystem', type, field)).toBe(true);
            }
            for (const field of extra) {
                expect(allowedExtra('subsystem', type, field)).toBe(true);
            }
        }
    });

    test('collide_in_assembly 默认 false 且可往返', () => {
        const defaults = SubPartCodec.decode({});
        expect(defaults.collide_in_assembly).toBe(false);

        const encoded = SubPartCodec.encode(Object.assign({}, defaults, {
            collide_in_assembly: true,
        }));
        expect(encoded.collide_in_assembly).toBe(true);
    });

    test('D12 字段已补齐：Codec / registry / 默认值一致', () => {
        // 仅剩 part.type：上游 const regular 的常量判别字段，省略即默认值。
        expect(allow.missing_fields.map((e) => e.kind + '.' + e.field)).toEqual(['part.type']);

        expect(HitBoxCodec.schema.module.defaultValue).toBe('');
        const hitBox = HitBoxCodec.decode({ id: 'part', type: 'box' });
        expect(hitBox.module).toBe('');
        expect(HitBoxCodec.encode(Object.assign({}, hitBox, { module: 'barrel' })).module)
            .toBe('barrel');
        expect(HitBoxCodec.encode(hitBox)).not.toHaveProperty('module');

        const weapon = SubsystemDispatchCodec.decode({
            type: 'machine_max:weapon_controller',
            definition: 'machine_max:basic_weapon_controller',
        });
        expect(weapon.first_hud_layout).toBe('machine_max:empty');
        expect(weapon.third_hud_layout).toBe('machine_max:empty');
        expect(weapon.scope_hud_layout).toBe('machine_max:empty');
        // 上游 e48a275c 工作树：视点发现表与 control_outputs 分开，缺省空表
        expect(weapon.camera_discovery_targets).toEqual({});

        const launcher = SubsystemDispatchCodec.decode({
            type: 'machine_max:launcher',
            definition: 'machine_max:2a42_launcher',
            locator: '2a42_launch_point',
        });
        expect(launcher.fire_animation).toBe('fire');

        const rack = SubsystemDispatchCodec.decode({
            type: 'machine_max:regen_ammo_rack',
            definition: 'machine_max:30mm_2a42_regen_ammo_rack',
            belt_definition: { pattern: [], length: 150 },
        });
        // label 有默认值；container_id / recharge 是 Optional 无默认值 → null
        expect(rack.belt_definition.label).toBe('');
        expect(rack.belt_definition.container_id).toBeNull();
        expect(rack.belt_definition.recharge).toBeNull();

        const registryFields = [
            ['machine_max:launcher', 'fire_animation'],
            ['machine_max:regen_ammo_rack', 'belt_definition'],
            ['machine_max:ammo_loader', 'ammo_discovery_targets'],
            ['machine_max:weapon_controller', 'first_hud_layout'],
            ['machine_max:weapon_controller', 'third_hud_layout'],
            ['machine_max:weapon_controller', 'scope_hud_layout'],
            ['machine_max:weapon_controller', 'camera_discovery_targets'],
        ];
        for (const [type, field] of registryFields) {
            const names = ssTypes.getDynamicFields(type).map((f) => f.field);
            expect(names).toContain(field);
        }
    });

    test('D18：5 个 WIP 类型已从 Codec / registry 删除', () => {
        const removed = [
            'machine_max:battery',
            'machine_max:signal_convert',
            'machine_max:joint',
            'machine_max:javascript',
            'machine_max:motor_controller',
        ];
        expect(allow.extra_types).toEqual([]);
        // 上游 2829863a 把 regen_loader 拆成 regen_ammo_rack / ammo_rack / ammo_loader，
        // 19 - 1 + 3 = 21；ammo_loader 因此重新成为正式类型，不再算 WIP。
        // 上游 b220cde2 起 reactive_armor 正式开放，21 + 1 = 22。
        // 上游 4fcd56e6 起 joint_driver 正式开放，22 + 1 = 23。
        expect(Object.keys(SubsystemDispatchCodec.codecs)).toHaveLength(23);
        expect(ssTypes.getAllTypes()).toHaveLength(23);
        for (const type of removed) {
            expect(SubsystemDispatchCodec.codecs[type]).toBeUndefined();
            expect(ssTypes.getTypeMeta(type)).toBeNull();
            expect(() => SubsystemDispatchCodec.decode({ type: type })).toThrow();
        }
        // 退役的 regen_loader 同理：旧工程里的实例按未知类型处理
        expect(SubsystemDispatchCodec.codecs['machine_max:regen_loader']).toBeUndefined();
        expect(ssTypes.getTypeMeta('machine_max:regen_loader')).toBeNull();
    });

    test('上游 b220cde2 / 0b9561bf：装填人员握手字段（loader_*）与爆反装甲可往返', () => {
        const launcher = SubsystemDispatchCodec.decode({
            type: 'machine_max:launcher',
            definition: 'machine_max:basic_launcher',
            locator: 'muzzle',
            loader_discovery_targets: { 'crew_loader_reload': ['local'] },
            loader_time_multipliers: { 'crew_loader_reload': 1.5 },
        });
        const encoded = SubsystemDispatchCodec.encode(launcher);
        expect(encoded.loader_discovery_targets).toEqual({ 'crew_loader_reload': ['local'] });
        expect(encoded.loader_time_multipliers).toEqual({ 'crew_loader_reload': 1.5 });

        const seat = SubsystemDispatchCodec.encode(SubsystemDispatchCodec.decode({
            type: 'machine_max:seat',
            definition: 'machine_max:default_seat',
            loader_discovery_inputs: ['crew_loader_reload'],
            interact_inputs: ['interact_left_door'],
        }));
        expect(seat.loader_discovery_inputs).toEqual(['crew_loader_reload']);
        expect(seat.interact_inputs).toEqual(['interact_left_door']);

        const armor = SubsystemDispatchCodec.encode(SubsystemDispatchCodec.decode({
            type: 'machine_max:reactive_armor',
            definition: 'm1a2_sep:m1a2_era_cassette',
        }));
        expect(armor).toEqual({
            type: 'machine_max:reactive_armor',
            definition: 'm1a2_sep:m1a2_era_cassette',
        });
    });

    test('上游 e48a275c：weapon_controller.camera_discovery_targets 可往返', () => {
        const decoded = SubsystemDispatchCodec.decode({
            type: 'machine_max:weapon_controller',
            definition: 'machine_max:basic_weapon_controller',
            camera_discovery_targets: { camera_sight: ['subsystem.machine_max.gunner_sight'] },
        });
        expect(decoded.camera_discovery_targets)
            .toEqual({ camera_sight: ['subsystem.machine_max.gunner_sight'] });

        const encoded = SubsystemDispatchCodec.encode(decoded);
        expect(encoded.camera_discovery_targets)
            .toEqual({ camera_sight: ['subsystem.machine_max.gunner_sight'] });

        // 空表等于默认值，导出省略
        const empty = SubsystemDispatchCodec.encode(SubsystemDispatchCodec.decode({
            type: 'machine_max:weapon_controller',
            definition: 'machine_max:basic_weapon_controller',
        }));
        expect(empty).not.toHaveProperty('camera_discovery_targets');
    });

    test('上游 4fcd56e6：joint_driver / gearbox.clutch_outputs / 变体控制器集可往返', () => {
        // 动画关节执行器：安装级只有型号与高级连接点
        const joint = SubsystemDispatchCodec.decode({
            type: 'machine_max:joint_driver',
            definition: 'machine_max:rotation_joint_driver',
            connector: 'connector.machine_max.left_door_hinge',
        });
        const jointEncoded = SubsystemDispatchCodec.encode(joint);
        expect(jointEncoded).toEqual({
            type: 'machine_max:joint_driver',
            definition: 'machine_max:rotation_joint_driver',
            connector: 'connector.machine_max.left_door_hinge',
        });
        expect(ssTypes.getDynamicFields('machine_max:joint_driver').map((f) => f.field))
            .toEqual(['definition', 'connector']);

        // 变速箱离合踏板反馈：缺省空表，非空可往返
        const gearbox = SubsystemDispatchCodec.decode({
            type: 'machine_max:gearbox',
            definition: 'machine_max:light_gearbox',
            power_output: 'connector.machine_max.gearbox_out',
        });
        expect(gearbox.clutch_outputs).toEqual({});
        expect(SubsystemDispatchCodec.encode(gearbox)).not.toHaveProperty('clutch_outputs');

        const withClutch = SubsystemDispatchCodec.decode({
            type: 'machine_max:gearbox',
            definition: 'machine_max:light_gearbox',
            power_output: 'connector.machine_max.gearbox_out',
            clutch_outputs: { clutch: ['local', 'global'] },
        });
        expect(SubsystemDispatchCodec.encode(withClutch).clutch_outputs)
            .toEqual({ clutch: ['local', 'global'] });

        // 变体控制器集：缺省 '' 时导出省略，显式值原样保留
        const plain = VariantCodec.decode({ model: 'machine_max:santana.geo' });
        expect(plain.controllers).toBe('');
        expect(VariantCodec.encode(plain)).not.toHaveProperty('controllers');

        const withControllers = VariantCodec.decode({
            model: 'machine_max:santana.geo',
            controllers: 'machine_max:santana.geo',
        });
        expect(VariantCodec.encode(withControllers).controllers)
            .toBe('machine_max:santana.geo');
    });

    test('上游 4fcd56e6：23 种类型与注册表一一对应', () => {
        expect(Object.keys(SubsystemDispatchCodec.codecs)).toHaveLength(23);
        expect(SubsystemDispatchCodec.codecs['machine_max:joint_driver']).toBeTruthy();
        expect(ssTypes.getTypeMeta('machine_max:joint_driver').displayName)
            .toBe('动画关节执行器');
        expect(ssTypes.needsConnector('machine_max:joint_driver')).toBe(true);
    });

    test('D13：track_controller / track_drive 已补齐', () => {
        expect(allow.missing_types).toEqual([]);
        expect(generated.SPECS.subsystem['machine_max:track_controller']).toBeTruthy();
        expect(generated.SPECS.subsystem['machine_max:track_drive']).toBeTruthy();

        const controller = SubsystemDispatchCodec.decode({
            type: 'machine_max:track_controller',
            definition: 'machine_max:track_controller_standard',
        });
        expect(controller.control_outputs).toEqual({});
        expect(controller.speed_outputs).toEqual({});

        const drive = SubsystemDispatchCodec.decode({
            type: 'machine_max:track_drive',
            definition: 'machine_max:track_drive_heavy',
            connector: 'connector.machine_max.left_sprocket',
        });
        expect(drive.speed_outputs).toEqual({});
        expect(drive.force_outputs).toEqual({});

        expect(ssTypes.getTypeDefaults('machine_max:track_controller').control_outputs)
            .toEqual({ car_control: [] });
        expect(ssTypes.getTypeDefaults('machine_max:track_drive').force_outputs)
            .toEqual({ track_force: ['local', 'global'] });
    });

    test('D19：registry 默认信号目标是 local / global', () => {
        expect(ssTypes.getTypeDefaults('machine_max:engine').speed_outputs)
            .toEqual({ engine_speed: ['global', 'local'] });
        expect(ssTypes.getTypeDefaults('machine_max:gearbox').gear_outputs)
            .toEqual({ gear: ['local', 'global'] });
        expect(ssTypes.getTypeDefaults('machine_max:seat').passenger_num_outputs)
            .toEqual({ passenger_num: ['local', 'global'] });
    });

    test('上游 8a027167：seat 安装级覆盖保留三态并可往返', () => {
        const seat = SubsystemDispatchCodec.decode({
            type: 'machine_max:seat',
            definition: 'machine_max:default_seat',
        });
        // 省略 = 沿用型号定义
        expect(seat.first_hud_layout).toBe('');
        expect(seat.third_hud_layout).toBe('');
        expect(seat.allow_use_items).toBeNull();

        const overridden = SubsystemDispatchCodec.decode({
            type: 'machine_max:seat',
            definition: 'machine_max:default_seat',
            third_hud_layout: 'machine_max:k17_vehicle_hud',
            allow_use_items: false,
        });
        expect(overridden.allow_use_items).toBe(false);
        const encoded = SubsystemDispatchCodec.encode(overridden);
        expect(encoded.third_hud_layout).toBe('machine_max:k17_vehicle_hud');
        expect(encoded.allow_use_items).toBe(false);

        // 未覆盖时导出省略这三个键
        const plain = SubsystemDispatchCodec.encode(seat);
        expect(plain).not.toHaveProperty('first_hud_layout');
        expect(plain).not.toHaveProperty('third_hud_layout');
        expect(plain).not.toHaveProperty('allow_use_items');

        // 工程文件会原样保存内部占位 null；再次读取必须成功。
        expect(() => SubsystemDispatchCodec.decode(JSON.parse(JSON.stringify(seat)))).not.toThrow();
    });

    test('每条 missing_fields 都指向真实缺口，且带 owner', () => {
        for (const entry of allow.missing_fields) {
            expect(entry.owner).toBeTruthy();
            if (entry.kind === 'subsystem') {
                const spec = generated.SPECS.subsystem[entry.type];
                expect(spec).toBeTruthy();
                expect(spec.fields[entry.field]).toBeTruthy();
                expect(SubsystemDispatchCodec.codecs[entry.type].schema[entry.field])
                    .toBeUndefined();
            } else {
                expect(generated.SPECS[entry.kind].fields[entry.field]).toBeTruthy();
                expect(CODECS[entry.kind].schema[entry.field]).toBeUndefined();
            }
        }
    });

    test('constraint_diffs / decode_tolerance 的字段真实存在', () => {
        for (const entry of allow.constraint_diffs) {
            if (entry.kind === 'subsystem') {
                const types = entry.types || [];
                for (const type of types) {
                    expect(generated.SPECS.subsystem[type].fields[entry.field]).toBeTruthy();
                    expect(SubsystemDispatchCodec.codecs[type].schema[entry.field]).toBeTruthy();
                }
                continue;
            }
            const schemaField = generated.SPECS[entry.kind].fields[entry.field]
                || (generated.CONTAINERS[entry.kind] || []).indexOf(entry.field) >= 0;
            expect(schemaField).toBeTruthy();
            const codecField = CODECS[entry.kind].schema[entry.field]
                || (generated.CONTAINERS[entry.kind] || []).indexOf(entry.field) >= 0;
            expect(codecField).toBeTruthy();
        }

        for (const entry of allow.decode_tolerance) {
            expect(generated.SPECS[entry.kind].fields[entry.field]).toBeTruthy();
            expect(CODECS[entry.kind].schema[entry.field]).toBeTruthy();
        }
    });

    test('unknown_fields 是唯一全局例外', () => {
        expect(allow.unknown_fields).toBe('preserve');
    });
});
