'use strict';

// services/issues.js —— 问题清单的单一真源。
//
// 契约：面板 / Blockbench 原生校验 / 导出闸门看到的是同一份问题（业务规则 + schema
// 值 + partId 安全）；导出闸门再多一步编码试跑，保证「闸门放行的数据一定能编码」。

const { describe, test, expect } = require('bun:test');
const helpers = require('../helpers.js');
const { collectAllIssues, probeEncodable, dedupeIssues, toProblem } = require('../../src/services/issues.js');
const { canExport } = require('../../src/services/export.js');

const SP = 'sub_part.machine_max.main';

function baseConfig() {
    return helpers.createConfig({ parts: { hull: helpers.createPart({ element_markers: {} }) } });
}

function subPart(cfg) {
    return cfg.parts.hull.variants.default.sub_parts[SP];
}

function findByCode(issues, code) {
    return issues.filter(function (p) { return p.code === code; });
}

describe('services/issues 合并问题清单', () => {
    test('schema 值问题也进清单（原先只有业务问题）', () => {
        const cfg = baseConfig();
        subPart(cfg).mass = '25';

        const issues = collectAllIssues(cfg);
        const hit = findByCode(issues, 'type_mismatch').filter(function (p) {
            return p.path.field === 'mass';
        });
        expect(hit).toHaveLength(1);
        expect(hit[0].path.scope).toBe('subpart');
        expect(hit[0].path.subPartKey).toBe(SP);
    });

    test('容器形状非法报类型错，空容器报缺失（两种原因不互相盖掉）', () => {
        const array = baseConfig();
        subPart(array).hit_boxes = [];
        const arrayHit = collectAllIssues(array).filter(function (p) {
            return p.path.field === 'hit_boxes';
        });
        expect(arrayHit).toHaveLength(1);
        expect(arrayHit[0].code).toBe('type_mismatch');

        const empty = baseConfig();
        subPart(empty).hit_boxes = {};
        const emptyHit = collectAllIssues(empty).filter(function (p) {
            return p.path.field === 'hit_boxes';
        });
        expect(emptyHit).toHaveLength(1);
        expect(emptyHit[0].code).toBe('missing_required');
    });

    test('零件 / 变体 / 子零件不是对象时不抛错，报一条可定位的问题', () => {
        const cfg = baseConfig();
        cfg.parts.hull = { variants: { default: { model: 'm', sub_parts: { [SP]: 7 } } } };
        const issues = collectAllIssues(cfg);
        expect(issues.length).toBeGreaterThan(0);
        expect(issues[0].path.subPartKey).toBe(SP);

        const brokenPart = baseConfig();
        brokenPart.parts.hull = 42;
        expect(function () { collectAllIssues(brokenPart); }).not.toThrow();
    });

    test('unsafe_part_id 与 schema 问题合并后仍只留一条同字段问题', () => {
        const cfg = baseConfig();
        cfg.parts['..'] = helpers.createPart({ element_markers: {} });
        const issues = collectAllIssues(cfg);
        expect(findByCode(issues, 'unsafe_part_id')).toHaveLength(1);
        // 去重后同 key 不重复（这是 dedupeIssues 的既有语义）
        const seen = {};
        issues.forEach(function (p) {
            const key = [p.path.scope, p.path.partId, p.path.variantName,
                p.path.subPartKey, p.path.itemKey, p.path.field].join('|');
            expect(seen[key]).toBeUndefined();
            seen[key] = true;
        });
    });

    test('toProblem / dedupeIssues 仍从 services/export.js 导出（既有入口不变）', () => {
        const exportLib = require('../../src/services/export.js');
        expect(exportLib.toProblem).toBe(toProblem);
        expect(exportLib.dedupeIssues).toBe(dedupeIssues);
        expect(exportLib.collectAllIssues).toBe(collectAllIssues);
    });
});

describe('services/issues 编码试跑', () => {
    /** schema 值校验看不出、但 codec 编码会拒绝的形状 */
    function unencodableConfig() {
        return {
            parts: {
                hull: {
                    variants: {
                        default: {
                            model: 'machine_max:model/hull',
                            sub_parts: {
                                'sub_part.machine_max.main': {
                                    hydrodynamics: { '': { scale: 'oops' } },
                                },
                            },
                        },
                    },
                },
            },
        };
    }

    test('编码会抛错的零件被标成 encode_failed', () => {
        const cfg = unencodableConfig();
        const probe = probeEncodable(cfg, []);
        expect(probe).toHaveLength(1);
        expect(probe[0].code).toBe('encode_failed');
        expect(probe[0].path.partId).toBe('hull');
        expect(probe[0].message).toContain('hull');
    });

    test('闸门同样拦下这种数据（schema 值校验先报，试跑按设计跳过）', () => {
        const gate = canExport(unencodableConfig());
        expect(gate.ok).toBe(false);
        const hit = gate.errors.filter(function (p) {
            return typeof p.path.field === 'string'
                && p.path.field.indexOf('hydrodynamics') === 0;
        });
        expect(hit.length).toBeGreaterThan(0);
    });

    test('该零件已有 error 时跳过试跑（不拿重复报错盖住真正原因）', () => {
        const cfg = unencodableConfig();
        const probe = probeEncodable(cfg, [{
            severity: 'error',
            code: 'type_mismatch',
            message: 'x',
            path: { scope: 'subpart', partId: 'hull', variantName: 'default', field: 'mass' },
        }]);
        expect(probe).toEqual([]);
    });

    test('合法配置的试跑没有输出', () => {
        expect(probeEncodable(baseConfig(), [])).toEqual([]);
    });
});
