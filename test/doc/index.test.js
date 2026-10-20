'use strict';

const { describe, test, expect, beforeEach } = require('bun:test');
const doc = require('../../src/doc/index.js');
const helpers = require('../helpers.js');
const mock = require('../mocks/blockbench.js');

const BONES = [
    { uuid: '11111111-1111-1111-1111-111111111111', name: 'hull' },
    { uuid: '22222222-2222-2222-2222-222222222222', name: 'hatch' },
];

beforeEach(() => {
    mock.installBones(BONES);
});

describe('doc 原语', () => {
    test('apply 整件替换 part，返回 reset_fields 与 markerPlan', () => {
        const config = helpers.createConfig();
        const definition = helpers.createConfig().parts.hull;
        delete definition.icon;
        const result = doc.apply(config, ['parts', 'hull'], definition, {
            namespace: 'machine_max',
            partId: 'hull',
            mode: 'replace',
        });
        expect(result.ok).toBe(true);
        expect(result.reset_fields).toEqual(['icon']);
        expect(Array.isArray(result.markerPlan)).toBe(true);
        expect(config.parts.hull.icon).toBe('');
    });

    test('apply 失败时不写配置', () => {
        const config = helpers.createConfig();
        const before = helpers.deepClone(config.parts.hull);
        const definition = helpers.createConfig().parts.hull;
        definition.variants.default.sub_parts['sub_part.machine_max.main']
            .hit_boxes['11111111-1111-1111-1111-111111111111'].type = 'banana';
        const result = doc.apply(config, ['parts', 'hull'], definition, {
            namespace: 'machine_max',
            partId: 'hull',
        });
        expect(result.ok).toBe(false);
        expect(config.parts.hull).toEqual(before);
    });

    test('remove connector 同时清理引用与 marker', () => {
        const config = helpers.createConfig();
        const sp = config.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        const result = doc.remove(config, [
            'parts', 'hull', 'variants', 'default', 'sub_parts',
            'sub_part.machine_max.main', 'connectors', 'connector.machine_max.hatch',
        ]);
        expect(result.ok).toBe(true);
        expect(sp.connectors['connector.machine_max.hatch']).toBeUndefined();
        expect(sp.subsystems['subsystem.machine_max.engine'].power_output).toBe('');
        expect(config.parts.hull.element_markers.default['22222222-2222-2222-2222-222222222222'])
            .toBeUndefined();
    });

    test('write 的 textures 副作用标记为 ensure_object', () => {
        const config = helpers.createConfig();
        const result = doc.write(config, [
            'parts', 'hull', 'variants', 'default', 'textures', 'skin',
        ], 'machine_max:textures/skin', { createParents: true });
        expect(result.ok).toBe(true);
        expect(result.sideEffect).toBe('ensure_object');
        expect(config.parts.hull.variants.default.textures.skin)
            .toBe('machine_max:textures/skin');
    });

    test('write allowMissingLeaf:false 拒绝新 key', () => {
        const result = doc.write(helpers.createConfig(), [
            'parts', 'hull', 'variants', 'default', 'textures', 'skin',
        ], 'x', { allowMissingLeaf: false });
        expect(result.ok).toBe(false);
        expect(result.errors[0].code).toBe('not_found');
    });
});
