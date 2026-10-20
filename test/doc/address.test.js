'use strict';

const { describe, test, expect, beforeEach } = require('bun:test');
const doc = require('../../src/doc/index.js');
const helpers = require('../helpers.js');
const mock = require('../mocks/blockbench.js');

const BONES = [
    { uuid: '11111111-1111-1111-1111-111111111111', name: 'hull' },
    { uuid: '22222222-2222-2222-2222-222222222222', name: 'hatch' },
    { uuid: '33333333-3333-3333-3333-333333333333', name: '底盘骨骼' },
];

beforeEach(() => {
    mock.installBones(BONES);
});

describe('doc/address §5.1.5 测试向量', () => {
    test('#1 段数组成员路径', () => {
        const config = helpers.createConfig();
        const result = doc.read(config, [
            'parts', 'hull', 'variants', 'default', 'sub_parts',
            'sub_part.machine_max.main', 'mass',
        ]);
        expect(result.ok).toBe(true);
        expect(result.value).toBe(25);
    });

    test('#2 JSON Pointer 路径', () => {
        const config = helpers.createConfig();
        const result = doc.read(config,
            '/parts/hull/variants/default/sub_parts/sub_part.machine_max.main/mass');
        expect(result.ok).toBe(true);
        expect(result.value).toBe(25);
    });

    test('#3 hit_boxes 的中文骨骼名', () => {
        const config = helpers.createConfig();
        const sp = config.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.hit_boxes = { '底盘骨骼': { id: 'part', type: 'box' } };
        const result = doc.read(config, [
            'parts', 'hull', 'variants', 'default', 'sub_parts',
            'sub_part.machine_max.main', 'hit_boxes', '底盘骨骼', 'id',
        ]);
        expect(result.ok).toBe(true);
        expect(result.value).toBe('part');
    });

    test('#4 含点的 partId', () => {
        const config = helpers.createConfig();
        config.parts['a.b.c'] = helpers.createPart();
        const result = doc.read(config, [
            'parts', 'a.b.c', 'variants', 'default', 'sub_parts',
            'sub_part.machine_max.main', 'mass',
        ]);
        expect(result.ok).toBe(true);
        expect(result.value).toBe(25);
    });

    test('#5 中间 map 层通配符', () => {
        const config = helpers.createConfig();
        const result = doc.read(config, [
            'parts', 'hull', 'variants', 'default', 'sub_parts', '*', 'mass',
        ]);
        expect(result.ok).toBe(true);
        expect(result.value).toEqual({ 'sub_part.machine_max.main': 25 });
    });

    test('#6 非规范子零件 key 返回 not_found', () => {
        const config = helpers.createConfig();
        const result = doc.read(config, [
            'parts', 'hull', 'variants', 'default', 'sub_parts', 'chassis',
        ]);
        expect(result.ok).toBe(false);
        expect(result.errors[0].code).toBe('not_found');
    });

    test('#7 _uiState 在配置根但不可寻址', () => {
        const config = helpers.createConfig();
        const result = doc.read(config, ['_uiState', 'activePartId']);
        expect(result.ok).toBe(false);
        expect(result.errors[0].code).toBe('unknown_field');
    });

    test('#8 写 map 末段新 key（allowMissingLeaf）', () => {
        const config = helpers.createConfig();
        const result = doc.write(config, [
            'parts', 'hull', 'variants', 'default', 'sub_parts',
            'sub_part.machine_max.main', 'connectors', 'connector.machine_max.hatch',
            'signal_targets', 'door',
        ], ['local']);
        expect(result.ok).toBe(true);
        expect(config.parts.hull.variants.default.sub_parts['sub_part.machine_max.main']
            .connectors['connector.machine_max.hatch'].signal_targets.door).toEqual(['local']);
    });

    test('#9 父级 connectors 不存在返回 not_found', () => {
        const config = helpers.createConfig();
        const sp = config.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        delete sp.connectors;
        const result = doc.write(config, [
            'parts', 'hull', 'variants', 'default', 'sub_parts',
            'sub_part.machine_max.main', 'connectors', 'connector.machine_max.hatch',
            'signal_targets', 'door',
        ], ['local']);
        expect(result.ok).toBe(false);
        expect(result.errors[0].code).toBe('not_found');
    });

    test('#10 数组层通配符返回 invalid_format', () => {
        const config = helpers.createConfig();
        const result = doc.read(config, [
            'parts', 'hull', 'variants', 'default', 'sub_parts', '*',
            'projected_area', '*',
        ]);
        expect(result.ok).toBe(false);
        expect(result.errors[0].code).toBe('invalid_format');
    });

    test('#11 写入中文/空白子零件 key 返回 invalid_format', () => {
        const config = helpers.createConfig();
        for (const key of ['sub_part.machine_max.底盘', 'sub_part.machine_max.前 底盘']) {
            const result = doc.write(config, [
                'parts', 'hull', 'variants', 'default', 'sub_parts', key, 'mass',
            ], 1);
            expect(result.ok).toBe(false);
            expect(result.errors[0].code).toBe('invalid_format');
        }
    });

    test('#12 createPart 的 partId 规则（keys 层）', () => {
        expect(doc.keys.isSafePartId('底盘')).toBe(false);
        expect(doc.keys.isSafePartId('Hull')).toBe(false);
    });

    test('#13 part 级内部字段不可寻址', () => {
        const config = helpers.createConfig();
        const result = doc.read(config, ['parts', 'hull', 'element_markers']);
        expect(result.ok).toBe(false);
        expect(result.errors[0].code).toBe('unknown_field');
    });

    test('#14 hydrodynamics 的空字符串 key', () => {
        const config = helpers.createConfig();
        const path = [
            'parts', 'hull', 'variants', 'default', 'sub_parts',
            'sub_part.machine_max.main', 'hydrodynamics', '',
        ];
        const read = doc.read(config, path);
        expect(read.ok).toBe(true);
        expect(read.value).toEqual({ scale: 1 });

        const write = doc.write(config, path.concat(['scale']), 2);
        expect(write.ok).toBe(true);
        expect(read.value.scale).toBe(2);
    });

    test('#15 hit_boxes 空字符串 key 写入返回 invalid_format', () => {
        const config = helpers.createConfig();
        const result = doc.write(config, [
            'parts', 'hull', 'variants', 'default', 'sub_parts',
            'sub_part.machine_max.main', 'hit_boxes', '',
        ], { type: 'box' });
        expect(result.ok).toBe(false);
        expect(result.errors[0].code).toBe('invalid_format');
    });

    test('#16 projectile_types 的资源地址 key', () => {
        const config = helpers.createConfig();
        const sp = config.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.subsystems = {
            'subsystem.machine_max.regen_loader': {
                type: 'machine_max:regen_loader',
                definition: 'machine_max:regen_loader',
                projectile_types: { 'machine_max:30mm_ap': 1 },
                discovery_outputs: {},
            },
        };
        const result = doc.read(config, [
            'parts', 'hull', 'variants', 'default', 'sub_parts',
            'sub_part.machine_max.main', 'subsystems',
            'subsystem.machine_max.regen_loader', 'projectile_types', 'machine_max:30mm_ap',
        ]);
        expect(result.ok).toBe(true);
        expect(result.value).toBe(1);
    });

    test('#17 变体名恰好是 model 时不被简写吞掉', () => {
        const config = helpers.createConfig();
        config.parts.hull.variants.model = helpers.createVariant();
        const result = doc.read(config, ['parts', 'hull', 'variants', 'model', 'model']);
        expect(result.ok).toBe(true);
        expect(result.value).toBe('machine_max:model/hull');
    });
});

describe('doc/address 其它边界', () => {
    test('JSON Pointer 转义 ~0 / ~1', () => {
        const config = helpers.createConfig();
        const sp = config.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.hydrodynamics = { 'a/b~c': { scale: 3 } };
        const result = doc.read(config, [
            'parts', 'hull', 'variants', 'default', 'sub_parts',
            'sub_part.machine_max.main', 'hydrodynamics', 'a/b~c', 'scale',
        ]);
        expect(result.ok).toBe(true);
        expect(result.value).toBe(3);
        expect(doc.address.toPointer(['a/b~c'])).toBe('/a~1b~0c');
    });

    test('相对路径 .. 一律 invalid_format', () => {
        const result = doc.read(helpers.createConfig(), ['parts', '..', 'hull']);
        expect(result.ok).toBe(false);
        expect(result.errors[0].code).toBe('invalid_format');
    });

    test('未知 record 字段返回 unknown_field', () => {
        const result = doc.read(helpers.createConfig(), ['parts', 'hull', 'unknown']);
        expect(result.ok).toBe(false);
        expect(result.errors[0].code).toBe('unknown_field');
    });

    test('insert 重复 key 返回 duplicate_name；remove 返回 removed', () => {
        const config = helpers.createConfig();
        const mapPath = ['parts', 'hull', 'variants', 'default', 'sub_parts'];
        expect(doc.insert(config, mapPath, 'sub_part.machine_max.main', {})).toMatchObject({
            ok: false,
            errors: [{ code: 'duplicate_name' }],
        });
        const result = doc.insert(config, mapPath, 'sub_part.machine_max.extra', { mass: 1 });
        expect(result.ok).toBe(true);
        const removed = doc.remove(config, mapPath.concat(['sub_part.machine_max.extra']));
        expect(removed.ok).toBe(true);
        expect(removed.removed).toEqual({ mass: 1 });
    });

    test('base 前缀由 index 原语拼接', () => {
        const config = helpers.createConfig();
        const result = doc.read(config, ['mass'], {
            base: ['parts', 'hull', 'variants', 'default', 'sub_parts',
                'sub_part.machine_max.main'],
        });
        expect(result.ok).toBe(true);
        expect(result.value).toBe(25);
    });

    test('写 record 字段不存在的字段返回 unknown_field', () => {
        const result = doc.write(helpers.createConfig(),
            ['parts', 'hull', 'variants', 'default', 'unknown'], 'x');
        expect(result.ok).toBe(false);
        expect(result.errors[0].code).toBe('unknown_field');
    });
});
