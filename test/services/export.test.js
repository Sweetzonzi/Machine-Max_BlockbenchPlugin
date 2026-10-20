'use strict';

// 导出闸门测试（docs/13 §4.3 / §10 P3 / §11 #20 / #21）

const { describe, test, expect } = require('bun:test');
const helpers = require('../helpers.js');
const { canExport, assertSafePartIds, dedupeIssues, toProblem } = require('../../src/services/export.js');
const { collectIssues } = require('../../src/services/validate.js');

const HB_UUID = '11111111-1111-1111-1111-111111111111';

function hitBox(cfg) {
    return cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'].hit_boxes[HB_UUID];
}

function baseConfig() {
    return helpers.createConfig({ parts: { hull: helpers.createPart({ element_markers: {} }) } });
}

describe('services/export.toProblem', () => {
    test('固定层级映射到同一 Problem.path 形状', () => {
        const p = toProblem({
            path: ['parts', 'hull', 'variants', 'default', 'sub_parts',
                'sub_part.machine_max.main', 'subsystems', 'subsystem.machine_max.engine',
                'definition'],
            code: 'missing_required',
            expected: 'string',
            got: '',
            hint: '必填字段不能为空',
        }, baseConfig());

        expect(p.severity).toBe('error');
        expect(p.path.scope).toBe('subsystem');
        expect(p.path.partId).toBe('hull');
        expect(p.path.variantName).toBe('default');
        expect(p.path.subPartKey).toBe('sub_part.machine_max.main');
        expect(p.path.itemKey).toBe('subsystem.machine_max.engine');
        expect(p.path.field).toBe('definition');
        expect(p.path.elementUuid).toBeUndefined();
    });

    test('子零件字段与碰撞箱字段', () => {
        const mass = toProblem({
            path: ['parts', 'hull', 'variants', 'default', 'sub_parts',
                'sub_part.machine_max.main', 'mass'],
            code: 'out_of_range',
        }, baseConfig());
        expect(mass.path.scope).toBe('subpart');
        expect(mass.path.field).toBe('mass');

        const hb = toProblem({
            path: ['parts', 'hull', 'variants', 'default', 'sub_parts',
                'sub_part.machine_max.main', 'hit_boxes', '11111111-1111-1111-1111-111111111111',
                'type'],
            code: 'invalid_enum',
        }, baseConfig());
        expect(hb.path.scope).toBe('hit_box');
        expect(hb.path.itemKey).toBe('11111111-1111-1111-1111-111111111111');
        expect(hb.path.elementUuid).toBe('11111111-1111-1111-1111-111111111111');
        expect(hb.path.field).toBe('type');
    });
});

describe('services/export.dedupeIssues', () => {
    test('collectIssues 优先；同字段只留一条；不同字段各自保留', () => {
        const primary = [{
            severity: 'error', code: 'definition_required',
            path: { scope: 'subsystem', partId: 'hull', variantName: 'default', subPartKey: 'sp', itemKey: 'ss', field: 'definition' },
        }, {
            severity: 'error', code: 'dangling_signal_target',
            path: { scope: 'subsystem', partId: 'hull', variantName: 'default', subPartKey: 'sp', itemKey: 'ss', field: 'speed_outputs' },
        }];
        const schema = [{
            severity: 'error', code: 'missing_required',
            path: { scope: 'subsystem', partId: 'hull', variantName: 'default', subPartKey: 'sp', itemKey: 'ss', field: 'definition' },
        }, {
            severity: 'error', code: 'type_mismatch',
            path: { scope: 'subsystem', partId: 'hull', variantName: 'default', subPartKey: 'sp', itemKey: 'ss', field: 'locator' },
        }];

        const merged = dedupeIssues(primary, schema);
        expect(merged.length).toBe(3);
        expect(merged[0].code).toBe('definition_required');
        expect(merged[2].code).toBe('type_mismatch');
    });
});

describe('services/export.canExport', () => {
    test('definition 为空时只保留一条 required 错误（§11 #21）', () => {
        const cfg = baseConfig();
        const sp = cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.subsystems['subsystem.machine_max.engine'].definition = '';

        const gate = canExport(cfg);
        expect(gate.ok).toBe(false);
        const defs = gate.issues.filter(function (p) {
            return p.path && p.path.itemKey === 'subsystem.machine_max.engine'
                && p.path.field === 'definition';
        });
        expect(defs.length).toBe(1);
        expect(defs[0].code).toBe('definition_required');
    });

    test('projectile_types:{} 被 minProperties 拦截', () => {
        const cfg = baseConfig();
        const sp = cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.subsystems = {
            'subsystem.machine_max.loader': {
                type: 'machine_max:regen_loader',
                definition: 'machine_max:regen_loader',
                projectile_types: {},
            },
        };

        const gate = canExport(cfg);
        const hit = gate.issues.filter(function (p) {
            return p.path && p.path.field === 'projectile_types';
        });
        expect(hit.length).toBeGreaterThan(0);
        expect(hit[0].code).toBe('missing_required');
    });

    test('不安全 partId 被闸门拦下', () => {
        const cfg = baseConfig();
        cfg.parts['..'] = helpers.createPart({ element_markers: {} });
        const gate = canExport(cfg);
        expect(gate.ok).toBe(false);
        expect(gate.errors.some(function (p) { return p.code === 'unsafe_part_id'; })).toBe(true);
    });

    test('碰撞箱材质为空/不存在时被拦，machine_max:default 放行', () => {
        const empty = baseConfig();
        hitBox(empty).material = '';
        const emptyIssues = collectIssues(empty).filter(function (p) {
            return p.code === 'material_required';
        });
        expect(emptyIssues).toHaveLength(1);
        expect(emptyIssues[0].path.scope).toBe('hit_box');
        expect(emptyIssues[0].path.itemKey).toBe(HB_UUID);
        expect(emptyIssues[0].path.field).toBe('material');
        expect(canExport(empty).ok).toBe(false);

        const unknown = baseConfig();
        hitBox(unknown).material = 'machine_max:not_a_material';
        const unknownIssues = collectIssues(unknown).filter(function (p) {
            return p.code === 'material_ref_missing';
        });
        expect(unknownIssues).toHaveLength(1);
        expect(unknownIssues[0].path.field).toBe('material');
        expect(canExport(unknown).ok).toBe(false);

        const fallback = baseConfig();
        hitBox(fallback).material = 'machine_max:default';
        const materialIssues = collectIssues(fallback).filter(function (p) {
            return p.code === 'material_required' || p.code === 'material_ref_missing';
        });
        expect(materialIssues).toHaveLength(0);
    });

    test('hit_boxes key 不是骨骼 UUID 时校验拦截', () => {
        const cfg = baseConfig();
        const sp = cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        const hb = hitBox(cfg);
        sp.hit_boxes = { hull: hb };

        global.Group = { all: [{ uuid: HB_UUID, name: 'hull' }] };
        global.Locator = { all: [] };
        try {
            const issues = collectIssues(cfg).filter(function (p) {
                return p.code === 'hit_box_key_not_uuid';
            });
            expect(issues).toHaveLength(1);
            expect(issues[0].path.scope).toBe('hit_box');
            expect(issues[0].path.itemKey).toBe('hull');
        } finally {
            delete global.Group;
            delete global.Locator;
        }
    });
});

describe('services/export.assertSafePartIds', () => {
    test('在任何写盘前抛错', () => {
        const cfg = baseConfig();
        cfg.parts['..'] = helpers.createPart({ element_markers: {} });
        expect(function () { assertSafePartIds(cfg); }).toThrow();
        expect(function () { assertSafePartIds(baseConfig()); }).not.toThrow();
    });
});
