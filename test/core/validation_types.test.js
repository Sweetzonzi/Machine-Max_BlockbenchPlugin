'use strict';

const { describe, test, expect } = require('bun:test');
const {
    matchesField,
    filterFieldIssues,
    resolveIssueLevel,
} = require('../../src/core/validation_types.js');
const helpers = require('../helpers.js');
const { collectIssues } = require('../../src/services/validate.js');

function problem(field, severity) {
    return {
        severity: severity || 'error',
        code: 'test',
        message: field + ' 有问题',
        path: { scope: 'subsystem', partId: 'hull', variantName: 'default', field: field },
    };
}

describe('core/validation_types 字段匹配', () => {
    test('顶层字段精确匹配', () => {
        expect(matchesField(problem('definition'), 'definition')).toBe(true);
        expect(matchesField(problem('definition'), 'power_output')).toBe(false);
    });

    test('嵌套字段归到顶层字段（signal_targets.engine_speed.0）', () => {
        const p = problem('signal_targets.engine_speed.0');
        expect(matchesField(p, 'signal_targets')).toBe(true);
        expect(matchesField(p, 'signal_target')).toBe(false);
    });

    test('空 field / 非字符串不匹配任何字段', () => {
        expect(matchesField(problem(''), 'definition')).toBe(false);
        expect(matchesField({ path: { field: null } }, 'definition')).toBe(false);
        expect(matchesField(null, 'definition')).toBe(false);
    });

    test('filterFieldIssues 只保留命中字段，并保持原顺序', () => {
        const list = [
            problem('definition'),
            problem('signal_targets.engine_speed.0'),
            problem('power_output'),
            problem('signal_targets.brake.1', 'warning'),
        ];
        const picked = filterFieldIssues(list, 'signal_targets');
        expect(picked.length).toBe(2);
        expect(picked[0].path.field).toBe('signal_targets.engine_speed.0');
        expect(picked[1].severity).toBe('warning');
        expect(resolveIssueLevel(picked)).toBe('error');
    });

    test('空列表 / 无字段时安全返回', () => {
        expect(filterFieldIssues(null, 'definition')).toEqual([]);
        expect(filterFieldIssues([problem('definition')], '')).toEqual([]);
    });

    test('collectIssues 的子系统 definition 问题带 field=definition，可被面板命中', () => {
        const cfg = helpers.createConfig();
        cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main']
            .subsystems['subsystem.machine_max.engine'].definition = '';
        global.Group = function Group() {};
        global.Group.all = [
            { uuid: '11111111-1111-1111-1111-111111111111', name: 'hull', parent: null },
            { uuid: '33333333-3333-3333-3333-333333333333', name: 'hitbox', parent: null },
            { uuid: '44444444-4444-4444-4444-444444444444', name: 'door', parent: null },
        ];
        global.Locator = {
            all: [
                { uuid: '22222222-2222-2222-2222-222222222222', name: 'hatch', parent: null },
            ],
        };
        try {
            const issues = collectIssues(cfg);
            const p = issues.find(function (x) {
                return x.code === 'definition_required'
                    && x.path.itemKey === 'subsystem.machine_max.engine';
            });
            expect(p).toBeTruthy();
            expect(p.path.scope).toBe('subsystem');
            expect(p.path.field).toBe('definition');
            expect(filterFieldIssues([p], 'definition')).toEqual([p]);
            expect(filterFieldIssues([p], 'power_output')).toEqual([]);
        } finally {
            delete global.Group;
            delete global.Locator;
        }
    });
});
