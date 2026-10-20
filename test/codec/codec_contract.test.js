'use strict';

const { describe, test, expect } = require('bun:test');
const { Codec } = require('../../src/codec/Codec.js');
const { HitBoxCodec } = require('../../src/codec/codecs/hit_box_codec.js');
const { InteractBoxCodec } = require('../../src/codec/codecs/interact_box_codec.js');
const { SubsystemDispatchCodec } = require('../../src/codec/codecs/subsystem_codec.js');
const ssTypes = require('../../src/core/subsystem_types.js');

describe('Codec 占位语义（docs/13 §4.4）', () => {
    test('STRING.encode 只接受 string，不做隐式转换', () => {
        expect(Codec.STRING.encode('hull')).toBe('hull');
        expect(Codec.STRING.encode('')).toBe('');
        expect(() => Codec.STRING.encode(null)).toThrow();
        expect(() => Codec.STRING.encode(1)).toThrow();
        expect(() => Codec.STRING.encode({})).toThrow();
    });

    test('map emitEmpty：空 map 输出 {}，默认 map 仍省略', () => {
        const RequiredMap = Codec.record({
            bone: Codec.STRING.field(),
            signal_targets: Codec.map(Codec.STRING, Codec.STRING.list(), { emitEmpty: true }).default({}),
        });
        expect(RequiredMap.encode({ bone: 'hull', signal_targets: {} }))
            .toEqual({ bone: 'hull', signal_targets: {} });
        expect(RequiredMap.decode({ bone: 'hull' }).signal_targets).toEqual({});

        const OptionalMap = Codec.record({
            bone: Codec.STRING.field(),
            extra: Codec.map(Codec.STRING, Codec.STRING).default({}),
        });
        expect(OptionalMap.encode({ bone: 'hull', extra: {} })).toEqual({ bone: 'hull' });
    });

    test('hit_box.id 使用 schema 默认 ""，空值省略', () => {
        const hitBox = HitBoxCodec.decode({ type: 'box' });
        expect(hitBox.id).toBe('');
        expect(HitBoxCodec.encode({ type: 'box', id: '' })).toEqual({ type: 'box' });
        expect(HitBoxCodec.encode({ type: 'box', id: 'hull' }))
            .toEqual({ id: 'hull', type: 'box' });
    });

    test('required 字符串占位为 ""，required map 空值仍输出', () => {
        expect(InteractBoxCodec.encode({ bone: 'hull', signal_targets: {} }))
            .toEqual({ bone: 'hull', signal_targets: {} });

        const transmission = SubsystemDispatchCodec.encode({
            type: 'machine_max:transmission',
            definition: '',
            power_outputs: {},
        });
        expect(transmission).toEqual({
            type: 'machine_max:transmission',
            definition: '',
            power_outputs: {},
        });

        for (const type of ['machine_max:car_controller', 'machine_max:motorbike_controller']) {
            const encoded = SubsystemDispatchCodec.encode({ type: type, definition: '', control_outputs: {} });
            expect(encoded.control_outputs).toEqual({});
        }

        const regen = SubsystemDispatchCodec.encode({
            type: 'machine_max:regen_loader',
            definition: '',
            projectile_types: {},
            belt_label: '',
            discovery_outputs: {},
        });
        expect(regen.projectile_types).toEqual({});
    });

    test('optional locator 缺失时 decode 为 ""，encode 省略', () => {
        for (const type of ['machine_max:seat', 'machine_max:camera', 'machine_max:sight']) {
            const decoded = SubsystemDispatchCodec.decode({ type: type, definition: 'x' });
            expect(decoded.locator).toBe('');
            expect(SubsystemDispatchCodec.encode(decoded)).not.toHaveProperty('locator');
        }
    });

    test('registry 默认值不再使用 null / []', () => {
        expect(ssTypes.getTypeDefaults('machine_max:engine').power_output).toBe('');
        expect(ssTypes.getTypeDefaults('machine_max:motor').power_output).toBe('');
        expect(ssTypes.getTypeDefaults('machine_max:gearbox').power_output).toBe('');
        expect(ssTypes.getTypeDefaults('machine_max:wheel_driver').connector).toBe('');
        expect(ssTypes.getTypeDefaults('machine_max:turret_driver').connector).toBe('');
        expect(ssTypes.getTypeDefaults('machine_max:seat').locator).toBe('');
        expect(ssTypes.getTypeDefaults('machine_max:joint').locator).toBe('');
        expect(ssTypes.getTypeDefaults('machine_max:launcher').locator).toBe('');
        expect(ssTypes.getTypeDefaults('machine_max:camera').locator).toBe('');
        expect(ssTypes.getTypeDefaults('machine_max:regen_loader').projectile_types).toEqual({});
    });
});
