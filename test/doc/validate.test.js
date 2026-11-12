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

    test('交付规格的必填子块与空配弹', () => {
        const emptyBelt = {
            type: 'machine_max:regen_ammo_rack',
            definition: 'machine_max:30mm_2a42_regen_ammo_rack',
            belt_definition: { pattern: [], length: 150 },
        };
        // pattern 的 minItems 与 length 的 minimum 编辑期就拦
        const relaxed = validate.validateValues(emptyBelt, {
            kind: 'subsystem',
            typeId: 'machine_max:regen_ammo_rack',
            path: [],
            completeness: false,
        });
        expect(relaxed.errors.some((e) => e.path.join('.') === 'belt_definition.pattern')).toBe(true);

        // length 缺失只在完整性模式（导出闸门）报，编辑期的空占位不算错
        const degraded = {
            type: 'machine_max:regen_ammo_rack',
            definition: 'machine_max:30mm_2a42_regen_ammo_rack',
            belt_definition: {},
        };
        const edit = validate.validateValues(degraded, {
            kind: 'subsystem',
            typeId: 'machine_max:regen_ammo_rack',
            path: [],
            completeness: false,
        });
        expect(edit.errors).toEqual([]);

        const strict = validate.validateValues(degraded, {
            kind: 'subsystem',
            typeId: 'machine_max:regen_ammo_rack',
            path: [],
            completeness: true,
        });
        const missing = strict.errors.filter((e) => e.code === 'missing_required');
        expect(missing.map((e) => e.path.join('.')).sort())
            .toEqual(['belt_definition.length', 'belt_definition.pattern']);
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

    test('validateTree 跳过内部字段，不因未知字段报错', () => {
        const config = helpers.createConfig();
        const sp = config.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.subsystems = {
            'subsystem.machine_max.rack': {
                type: 'machine_max:regen_ammo_rack',
                definition: 'machine_max:30mm_2a42_regen_ammo_rack',
                belt_definition: {
                    pattern: [{ ammo: 'machine_max:30mm_3ubr6_ap', count: 1 }],
                    length: 150,
                },
                ammo_discovery_inputs: ['ammo_30mm'],
            },
        };
        const errors = validate.validateTree(config, { completeness: true });
        expect(errors.some((e) => e.path.indexOf('_uiState') >= 0)).toBe(false);
        expect(errors.some((e) => e.code === 'unknown_field'
            && e.path.join('.').indexOf('belt_definition') >= 0)).toBe(false);
    });

    test('validateTree 同时跑 key 与值校验', () => {
        const config = helpers.createConfig();
        const sp = config.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.subsystems = {
            'subsystem.machine_max.loader': {
                type: 'machine_max:ammo_loader',
                definition: 'machine_max:30mm_2a90_ammo_loader',
                ammo_discovery_targets: { 'ammo 30mm': ['subsystem.machine_max.rack'] },
            },
        };
        const errors = validate.validateTree(config, { completeness: true });
        expect(errors.some((e) => e.code === 'invalid_format'
            && e.path.join('/') === 'parts/hull/variants/default/sub_parts/sub_part.machine_max.main/subsystems/subsystem.machine_max.loader/ammo_discovery_targets/ammo 30mm'))
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

    test('容器不是对象报 type_mismatch（加载会原样保留它，闸门必须看见）', () => {
        const config = helpers.createConfig();
        const sp = config.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.hit_boxes = ['junk'];
        const errors = validate.validateTree(config, { completeness: true });
        const hit = errors.filter((e) => e.code === 'type_mismatch'
            && e.path[e.path.length - 1] === 'hit_boxes');
        expect(hit).toHaveLength(1);
        expect(hit[0].got).toBe('array');
    });
});
