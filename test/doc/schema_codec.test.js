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

    test('D12 字段已补齐：Codec / registry / 默认值一致', () => {
        expect(allow.missing_fields).toEqual([]);

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

        const launcher = SubsystemDispatchCodec.decode({
            type: 'machine_max:launcher',
            definition: 'machine_max:2a42_launcher',
            locator: '2a42_launch_point',
        });
        expect(launcher.fire_animation).toBe('fire');

        const regenLoader = SubsystemDispatchCodec.decode({
            type: 'machine_max:regen_loader',
            definition: 'machine_max:2a42_regen_loader',
            projectile_types: { 'machine_max:30mm_ap': 1 },
        });
        expect(regenLoader.belt_label).toBe('');

        const registryFields = [
            ['machine_max:launcher', 'fire_animation'],
            ['machine_max:regen_loader', 'belt_label'],
            ['machine_max:weapon_controller', 'first_hud_layout'],
            ['machine_max:weapon_controller', 'third_hud_layout'],
            ['machine_max:weapon_controller', 'scope_hud_layout'],
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
            'machine_max:ammo_loader',
        ];
        expect(allow.extra_types).toEqual([]);
        expect(Object.keys(SubsystemDispatchCodec.codecs)).toHaveLength(19);
        expect(ssTypes.getAllTypes()).toHaveLength(19);
        for (const type of removed) {
            expect(SubsystemDispatchCodec.codecs[type]).toBeUndefined();
            expect(ssTypes.getTypeMeta(type)).toBeNull();
            expect(() => SubsystemDispatchCodec.decode({ type: type })).toThrow();
        }
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
            .toEqual({ track_control: [] });
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
