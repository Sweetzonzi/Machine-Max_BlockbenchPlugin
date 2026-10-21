'use strict';

const { describe, test, expect } = require('bun:test');
const vis = require('../../src/services/icon_visibility.js');

const NODES = [
    { uuid: 'root', name: 'Root', parentUuid: null },
    { uuid: 'hull', name: 'Hull', parentUuid: 'root' },
    { uuid: 'wheel1', name: 'Wheel_1', parentUuid: 'hull' },
    { uuid: 'wheel2', name: 'Wheel_2', parentUuid: 'hull' },
    { uuid: 'turret', name: 'Turret', parentUuid: 'root' },
    { uuid: 'gun', name: 'Gun', parentUuid: 'turret' },
];

function sorted(list) {
    return list.slice().sort();
}

describe('icon_visibility.buildVisibility', () => {
    test('start 子树 + 祖先，其余隐藏', () => {
        const r = vis.buildVisibility(NODES, [{ start_bone: 'Hull' }]);
        expect(sorted(r.visible)).toEqual(['hull', 'root', 'wheel1', 'wheel2']);
        expect(r.errors).toEqual([]);
    });

    test('end 自身及子树排除，祖先保留', () => {
        const r = vis.buildVisibility(NODES, [{ start_bone: 'Hull', end_bones: ['Wheel_1'] }]);
        expect(sorted(r.visible)).toEqual(['hull', 'root', 'wheel2']);
    });

    test('end = end_bones ∪ auto_end_bones', () => {
        const r = vis.buildVisibility(NODES, [{
            start_bone: 'Hull',
            end_bones: [],
            auto_end_bones: ['Wheel_1', 'Wheel_2'],
        }]);
        expect(sorted(r.visible)).toEqual(['hull', 'root']);
    });

    test('空 start_bone = 整棵模型 − end 子树', () => {
        const r = vis.buildVisibility(NODES, [{
            start_bone: '',
            end_bones: ['Turret'],
        }]);
        expect(sorted(r.visible)).toEqual(['hull', 'root', 'wheel1', 'wheel2']);
        expect(r.fallback).toBe(true);
    });

    test('多个 sub_part 取并集，end 排除后可被另一个 sub_part 重新加入', () => {
        const r = vis.buildVisibility(NODES, [
            { start_bone: 'Hull', end_bones: ['Turret'] },
            { start_bone: 'Turret' },
        ]);
        expect(sorted(r.visible)).toEqual(['gun', 'hull', 'root', 'turret', 'wheel1', 'wheel2']);
    });

    test('start_bone 不存在 → error，不静默整机', () => {
        const r = vis.buildVisibility(NODES, [{ start_bone: 'missing' }]);
        expect(r.errors[0].code).toBe('start_bone_not_found');
        expect(r.visible).toEqual([]);
    });

    test('start_bone 重名 → warning，默认取第一个', () => {
        const nodes = NODES.concat([{ uuid: 'hull2', name: 'Hull', parentUuid: 'root' }]);
        const r = vis.buildVisibility(nodes, [{ start_bone: 'Hull' }]);
        expect(r.warnings.some(w => w.code === 'duplicate_start_bone')).toBe(true);
        expect(r.visible).toContain('hull');
    });

    test('无 sub_parts → 整棵模型 fallback', () => {
        const r = vis.buildVisibility(NODES, []);
        expect(r.visible.length).toBe(NODES.length);
        expect(r.fallback).toBe(true);
    });
});
