'use strict';

const { describe, test, expect } = require('bun:test');
const keys = require('../../src/doc/keys.js');

describe('doc/keys', () => {
    test('isValidPartId 只做字符集与长度', () => {
        expect(keys.isValidPartId('hull')).toBe(true);
        expect(keys.isValidPartId('a.b.c')).toBe(true);
        expect(keys.isValidPartId('Hull')).toBe(false);
        expect(keys.isValidPartId('底盘')).toBe(false);
        expect(keys.isValidPartId('a'.repeat(129))).toBe(false);
    });

    test('isSafePartId 覆盖路径安全判据', () => {
        const unsafe = ['.', '..', '.hull', 'hull.', 'con', 'con.1', 'lpt9', '.._hull', 'a._b'];
        for (const id of unsafe) {
            expect(keys.isSafePartId(id)).toBe(false);
        }
        expect(keys.isSafePartId('a.b.c')).toBe(true);
        expect(keys.isSafePartId('a..b')).toBe(true);
        expect(keys.isSafePartId('hull_1')).toBe(true);
        expect(keys.isSafePartId('console')).toBe(true);
    });

    test('子零件 key / 翻译键 / 资源地址', () => {
        expect(keys.isValidSubPartKey('sub_part.machine_max.main', 'machine_max')).toBe(true);
        expect(keys.isValidSubPartKey('sub_part.machine_max.a.b', 'machine_max')).toBe(true);
        expect(keys.isValidSubPartKey('sub_part.other.main', 'machine_max')).toBe(false);
        expect(keys.isValidSubPartKey('sub_part.machine_max.main.', 'machine_max')).toBe(false);

        expect(keys.validateMapKey('connectors', 'connector.machine_max.c', {
            namespace: 'machine_max',
        }).ok).toBe(true);
        expect(keys.validateMapKey('connectors', 'connector.other.c', {
            namespace: 'machine_max',
        }).warning).toBe('non_canonical_key');
        expect(keys.validateMapKey('connectors', 'connector.machine_max.连接', {
            namespace: 'machine_max',
        }).code).toBe('invalid_format');

        expect(keys.validateMapKey('projectile_types', 'machine_max:30mm_ap', {}).ok).toBe(true);
        expect(keys.validateMapKey('projectile_types', 'Machine_Max:30mm_ap', {}).code)
            .toBe('invalid_format');
    });

    test('map key 的保留字符与空段', () => {
        expect(keys.validateMapKey('textures', '*', {}).code).toBe('key_reserved');
        expect(keys.validateMapKey('hit_boxes', '', {}).code).toBe('invalid_format');
        expect(keys.validateMapKey('hydrodynamics', '', {}).ok).toBe(true);
        expect(keys.validateMapKey('sub_parts', 'sub_part.machine_max.底盘', {
            namespace: 'machine_max',
        }).code).toBe('invalid_format');
    });

    test('canonicalSubPartKey 的迁移向量（docs/13 §15.1）', () => {
        const ns = 'machine_max';
        const legacyCases = [
            ['.main', 'sub_part.machine_max.legacy_1'],
            ['main.', 'sub_part.machine_max.legacy_2'],
            ['chassis!', 'sub_part.machine_max.legacy_3'],
            ['底盘', 'sub_part.machine_max.legacy_4'],
            ['a'.repeat(129), 'sub_part.machine_max.legacy_5'],
        ];
        const usedNames = [];
        for (const [input, expected] of legacyCases) {
            expect(keys.canonicalSubPartKey(input, ns, [], usedNames)).toBe(expected);
            usedNames.push(expected.slice('sub_part.machine_max.'.length));
        }

        expect(keys.canonicalSubPartKey('default', ns, [], [])).toBe('sub_part.machine_max.main');
        expect(keys.canonicalSubPartKey('main', ns, [], [])).toBe('sub_part.machine_max.main');
        expect(keys.canonicalSubPartKey('sub_part.old.chassis', ns, [], []))
            .toBe('sub_part.machine_max.chassis');
        expect(keys.canonicalSubPartKey('sub_part.machine_max.chassis', ns, [], []))
            .toBe('sub_part.machine_max.chassis');
        expect(keys.canonicalSubPartKey('sub_part.machine_max.default', ns, [], []))
            .toBe('sub_part.machine_max.default');
    });

    test('canonicalSubPartKey 冲突追加后缀', () => {
        const usedKeys = ['sub_part.machine_max.main'];
        const usedNames = ['main'];
        expect(keys.canonicalSubPartKey('main', 'machine_max', usedKeys, usedNames))
            .toBe('sub_part.machine_max.main_2');
    });

    test('validateKeys 覆盖值 map（textures / signal_targets / power_outputs）', () => {
        const node = {
            textures: { '纹理': 'machine_max:textures/x' },
            sub_parts: {},
            signal_targets: { 'bad key': ['local'] },
            signal_translations: { 'ok.channel': 'local' },
            power_outputs: { 'subsystem.machine_max.engine': 1 },
        };
        const result = keys.validateKeys('variant', {
            textures: node.textures,
            sub_parts: node.sub_parts,
        }, { namespace: 'machine_max', path: ['parts', 'hull', 'variants', 'default'] });
        expect(result.errors.some((e) => e.path[e.path.length - 1] === '纹理')).toBe(true);

        const connector = keys.validateKeys('connector', {
            signal_targets: node.signal_targets,
            signal_translations: node.signal_translations,
        }, { namespace: 'machine_max', path: [] });
        expect(connector.errors.some((e) => e.path[e.path.length - 1] === 'bad key')).toBe(true);

        const subsystem = keys.validateKeys('subsystem', {
            type: 'machine_max:transmission',
            power_outputs: node.power_outputs,
        }, { namespace: 'machine_max', path: [] });
        expect(subsystem.ok).toBe(true);
    });

    test('validateKeys 递归覆盖全部 map 层', () => {
        const node = {
            start_bone: 'hull',
            hit_boxes: { '': { type: 'box' }, '底盘骨骼': { type: 'box' } },
            interact_boxes: { 'interact.machine_max.door': {} },
            connectors: { 'connector.machine_max.bad key': {} },
            subsystems: {
                'subsystem.machine_max.regen_loader': {
                    type: 'machine_max:regen_loader',
                    projectile_types: { 'Machine_Max:30mm_ap': 1, __new_p_1: 0 },
                },
            },
            hydrodynamics: { '': { scale: 1 } },
        };
        const result = keys.validateKeys('sub_part', node, {
            namespace: 'machine_max',
            path: ['parts', 'hull'],
        });
        expect(result.ok).toBe(false);
        expect(result.errors.some((e) => e.code === 'invalid_format'
            && e.path[e.path.length - 2] === 'hit_boxes'
            && e.path[e.path.length - 1] === '')).toBe(true);
        expect(result.errors.some((e) => e.path.join('.')
            === 'parts.hull.connectors.connector.machine_max.bad key')).toBe(true);
        expect(result.errors.some((e) => e.path.join('.')
            === 'parts.hull.subsystems.subsystem.machine_max.regen_loader.projectile_types.Machine_Max:30mm_ap'))
            .toBe(true);
        expect(result.errors.some((e) => e.path[e.path.length - 1] === '__new_p_1')).toBe(false);
    });
});
