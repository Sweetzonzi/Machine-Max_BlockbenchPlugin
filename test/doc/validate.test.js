'use strict';

const { describe, test, expect, beforeEach } = require('bun:test');
const validate = require('../../src/doc/validate.js');
const helpers = require('../helpers.js');
const mock = require('../mocks/blockbench.js');

beforeEach(() => {
    mock.installBones([]);
});

describe('doc/validate', () => {
    test('enum / range / required 的基本错误码', () => {
        const node = helpers.createSubPart({
            mass: -1,
            hit_boxes: {
                u1: { id: 'part', type: 'banana', material: '', thickness: 1, condition: 'true' },
            },
        });
        const result = validate.validateValues(node, {
            kind: 'sub_part',
            path: ['parts', 'hull'],
            completeness: false,
        });
        expect(result.ok).toBe(false);
        expect(result.errors.some((e) => e.code === 'out_of_range')).toBe(true);
        expect(result.errors.some((e) => e.code === 'invalid_enum')).toBe(true);
    });

    test('completeness:false 允许 required 空占位；true 拦截', () => {
        const node = {
            type: 'machine_max:engine',
            definition: '',
            power_output: '',
            speed_outputs: {},
        };
        const relaxed = validate.validateValues(node, {
            kind: 'subsystem',
            typeId: 'machine_max:engine',
            path: [],
            completeness: false,
        });
        expect(relaxed.ok).toBe(true);

        const strict = validate.validateValues(node, {
            kind: 'subsystem',
            typeId: 'machine_max:engine',
            path: [],
            completeness: true,
        });
        expect(strict.ok).toBe(false);
        expect(strict.errors.filter((e) => e.code === 'missing_required').length).toBe(2);
    });

    test('projectile_types 的 minProperties', () => {
        const node = {
            type: 'machine_max:regen_loader',
            definition: 'machine_max:regen_loader',
            projectile_types: {},
            discovery_outputs: {},
        };
        const result = validate.validateValues(node, {
            kind: 'subsystem',
            typeId: 'machine_max:regen_loader',
            path: [],
            completeness: true,
        });
        expect(result.errors.some((e) => e.code === 'missing_required'
            && e.path.join('.') === 'projectile_types')).toBe(true);
    });

    test('overwrite 允许 null；对象结构按 schema 校验', () => {
        const hitBox = {
            id: 'part',
            type: 'box',
            overwrite: null,
        };
        const result = validate.validateValues(hitBox, {
            kind: 'hit_box',
            path: [],
            completeness: false,
        });
        expect(result.ok).toBe(true);

        const bad = {
            id: 'part',
            type: 'box',
            overwrite: { physics: { friction: [1, 2] } },
        };
        const badResult = validate.validateValues(bad, {
            kind: 'hit_box',
            path: [],
            completeness: false,
        });
        expect(badResult.errors.some((e) => e.code === 'type_mismatch')).toBe(true);
    });

    test('validateTree 跳过内部字段与 __new_p_ 占位', () => {
        const config = helpers.createConfig();
        const sp = config.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.subsystems = {
            'subsystem.machine_max.regen_loader': {
                type: 'machine_max:regen_loader',
                definition: 'machine_max:regen_loader',
                projectile_types: { 'machine_max:30mm_ap': 1, __new_p_1: 0 },
                discovery_outputs: {},
            },
        };
        const errors = validate.validateTree(config, { completeness: true });
        expect(errors.some((e) => e.path[e.path.length - 1] === '__new_p_1')).toBe(false);
    });

    test('validateTree 同时跑 key 与值校验', () => {
        const config = helpers.createConfig();
        const sp = config.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.subsystems = {
            'subsystem.machine_max.regen_loader': {
                type: 'machine_max:regen_loader',
                definition: 'machine_max:regen_loader',
                projectile_types: { 'Machine_Max:30mm_ap': 1 },
                discovery_outputs: {},
            },
        };
        const errors = validate.validateTree(config, { completeness: true });
        expect(errors.some((e) => e.code === 'invalid_format'
            && e.path.join('/') === 'parts/hull/variants/default/sub_parts/sub_part.machine_max.main/subsystems/subsystem.machine_max.regen_loader/projectile_types/Machine_Max:30mm_ap'))
            .toBe(true);
    });

    test('未知 subsystem 类型报 unknown_type', () => {
        const result = validate.validateValues({
            type: 'machine_max:nope',
            definition: 'machine_max:nope',
        }, {
            kind: 'subsystem',
            typeId: 'machine_max:nope',
            path: [],
        });
        expect(result.errors[0].code).toBe('unknown_type');
    });
});
