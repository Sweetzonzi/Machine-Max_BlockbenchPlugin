'use strict';

// ops 层验收测试（docs/13 §11 #7 / #18 / #19 / #20 / #22、§10 P2）
// 使用真实 element_markers 作为 markers 端口，骨骼用 test/helpers 的 fake。

const { describe, test, expect, beforeEach, afterEach } = require('bun:test');
const ports = require('../../src/doc/ports.js');
const em = require('../../src/core/element_markers.js');
const undo = require('../../src/core/undo.js');
const helpers = require('../helpers.js');
const ops = require('../../src/ops/index.js');
const { collectIssues } = require('../../src/services/validate.js');

const BONES = [
    { name: 'hull', uuid: '11111111-1111-1111-1111-111111111111' },
    { name: 'turret', uuid: '55555555-5555-5555-5555-555555555555' },
    { name: 'hatch', uuid: '22222222-2222-2222-2222-222222222222' },
    { name: 'door', uuid: '44444444-4444-4444-4444-444444444444' },
];

function installPorts() {
    ports.reset();
    ports.install({
        bones: helpers.makeBones(BONES),
        markers: {
            set: em.setMarker,
            clear: em.clearMarker,
            clearScope: em.clearMarkerScope,
            recalc: em.recalcAutoEndBones,
        },
    });
}

function installFakeUndo(config) {
    global.Project = { uuid: 'test-project', saved: true, machine_max_plugin: config };
    var pending = null;
    global.Undo = {
        history: [],
        index: 0,
        current_save: null,
        initEdit: function () {
            pending = undo._internals.createSnapshot();
            this.current_save = pending;
        },
        finishEdit: function (label) {
            var post = undo._internals.createSnapshot();
            this.history.push({
                type: 'edit',
                action: label,
                before: { __mm_config__: pending },
                post: { __mm_config__: post },
                time: Date.now(),
            });
            this.index = this.history.length;
            pending = null;
            this.current_save = null;
        },
        cancelEdit: function () {
            pending = null;
            this.current_save = null;
        },
    };
}

function clearGlobals() {
    delete global.Project;
    delete global.Undo;
}

beforeEach(function () {
    installPorts();
});

afterEach(function () {
    clearGlobals();
    ports.reset();
});

describe('ops.setField', () => {
    test('合法值写入并返回 before/after；非法枚举不写入', () => {
        const cfg = helpers.createConfig();
        const path = ['parts', 'hull', 'variants', 'default', 'sub_parts',
            'sub_part.machine_max.main', 'mass'];

        const ok = ops.setField(cfg, { path: path, value: 30 });
        expect(ok.ok).toBe(true);
        expect(ok.before).toBe(25);
        expect(ok.after).toBe(30);

        const bad = ops.setField(cfg, {
            path: ['parts', 'hull', 'variants', 'default', 'sub_parts',
                'sub_part.machine_max.main', 'hit_boxes',
                '11111111-1111-1111-1111-111111111111', 'type'],
            value: 'banana',
        });
        expect(bad.ok).toBe(false);
        expect(bad.errors[0].code).toBe('invalid_enum');
        expect(cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main']
            .hit_boxes['11111111-1111-1111-1111-111111111111'].type).toBe('box');
    });

    test('start_bone 变更迁移 sub_part 标记，hit_box marker 保留归属', () => {
        const cfg = helpers.createConfig();
        const result = ops.setField(cfg, {
            path: ['parts', 'hull', 'variants', 'default', 'sub_parts',
                'sub_part.machine_max.main', 'start_bone'],
            value: 'turret',
        });
        expect(result.ok).toBe(true);

        const markers = cfg.parts.hull.element_markers.default;
        expect(markers['55555555-5555-5555-5555-555555555555']).toEqual({
            type: 'sub_part',
            config_ref: 'sub_part.machine_max.main',
        });
        expect(markers['11111111-1111-1111-1111-111111111111']).toBeUndefined();
        // hit_box marker（3333…）仍指向同一个子零件 key
        expect(markers['33333333-3333-3333-3333-333333333333'].config_ref)
            .toBe('sub_part.machine_max.main');
    });

    test('overwrite 对象缺失时惰性创建', () => {
        const cfg = helpers.createConfig();
        const hb = cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main']
            .hit_boxes['11111111-1111-1111-1111-111111111111'];
        hb.overwrite = null;
        const result = ops.setField(cfg, {
            path: ['parts', 'hull', 'variants', 'default', 'sub_parts',
                'sub_part.machine_max.main', 'hit_boxes',
                '11111111-1111-1111-1111-111111111111', 'overwrite', 'physics', 'slip_adaptation'],
            value: 0.5,
        });
        expect(result.ok).toBe(true);
        expect(hb.overwrite.physics.slip_adaptation).toBe(0.5);
    });

    test('coalesce 默认关闭：三次 setField = 三条撤销记录', () => {
        const cfg = helpers.createConfig();
        installFakeUndo(cfg);
        for (let i = 1; i <= 3; i++) {
            const r = ops.setField(cfg, {
                path: ['parts', 'hull', 'variants', 'default', 'sub_parts',
                    'sub_part.machine_max.main', 'mass'],
                value: 25 + i,
                source: 'mcp',
            });
            expect(r.ok).toBe(true);
        }
        expect(Undo.history).toHaveLength(3);
    });

    test('runConfigEdit 派发 mm_config_changed 单一出口（P3）', () => {
        const cfg = helpers.createConfig();
        installFakeUndo(cfg);
        const events = [];
        global.Blockbench = {
            dispatchEvent: function (name, payload) {
                events.push({ name: name, payload: payload });
            },
        };
        try {
            const r = ops.setField(cfg, {
                path: ['parts', 'hull', 'variants', 'default', 'sub_parts',
                    'sub_part.machine_max.main', 'mass'],
                value: 42,
                source: 'ui',
            });
            expect(r.ok).toBe(true);
        } finally {
            delete global.Blockbench;
        }
        const changed = events.filter(function (e) { return e.name === 'mm_config_changed'; });
        expect(changed).toHaveLength(1);
        expect(changed[0].payload.source).toBe('ui');
        expect(changed[0].payload.persist).toBe(true);
        expect(changed[0].payload.label).toContain('mass');
    });
});

describe('ops.markSubPart', () => {
    test('标记时同时补建配置条目并绑定 start_bone', () => {        const cfg = helpers.createConfig();
        cfg.parts.hull.variants.default.sub_parts = {};
        const r = ops.markSubPart(cfg, {
            partId: 'hull',
            variantName: 'default',
            element: { uuid: '11111111-1111-1111-1111-111111111111', name: 'hull' },
        });
        expect(r.ok).toBe(true);
        expect(r.created).toBe(true);
        const sp = cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        expect(sp).toBeTruthy();
        expect(sp.start_bone).toBe('hull');
        expect(cfg.parts.hull.element_markers.default['11111111-1111-1111-1111-111111111111'].config_ref)
            .toBe('sub_part.machine_max.main');
    });

    test('已有配置时按显式 spKey 复用，不重复创建', () => {
        const cfg = helpers.createConfig();
        const before = Object.keys(cfg.parts.hull.variants.default.sub_parts).length;
        const r = ops.markSubPart(cfg, {
            partId: 'hull',
            variantName: 'default',
            element: { uuid: '11111111-1111-1111-1111-111111111111', name: 'hull' },
            spKey: 'sub_part.machine_max.main',
        });
        expect(r.ok).toBe(true);
        expect(r.created).toBe(false);
        expect(Object.keys(cfg.parts.hull.variants.default.sub_parts)).toHaveLength(before);
    });

    test('repairMarkerConfigs 在 load 阶段补建缺失条目且幂等', () => {
        const cfg = helpers.createConfig();
        cfg.parts.hull.variants.default.sub_parts = {};
        global.Group = { all: [{ uuid: '11111111-1111-1111-1111-111111111111', name: 'hull', parent: null }] };
        try {
            const first = em.repairMarkerConfigs(cfg);
            expect(first.repaired).toBeGreaterThan(0);
            expect(cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'].start_bone)
                .toBe('hull');
            const second = em.repairMarkerConfigs(cfg);
            expect(second.repaired).toBe(0);
        } finally {
            delete global.Group;
        }
    });
});

describe('ops.import*', () => {
    test('importPart 新建：占位字段 round-trip，reset_fields 为空', () => {
        const cfg = helpers.createConfig();
        const definition = {
            variants: {
                default: {
                    model: 'machine_max:model/new',
                    sub_parts: {
                        'sub_part.machine_max.main': {
                            start_bone: 'turret',
                            mass: 2,
                            hit_boxes: { turret: { type: 'box' } },
                        },
                    },
                },
            },
        };
        const result = ops.importPart(cfg, { partId: 'new_part', definition: definition });
        expect(result.ok).toBe(true);
        expect(result.reset_fields).toEqual([]);
        expect(cfg.parts.new_part.variants.default.model).toBe('machine_max:model/new');
        expect(cfg.parts.new_part.element_markers.default['55555555-5555-5555-5555-555555555555'])
            .toEqual({ type: 'sub_part', config_ref: 'sub_part.machine_max.main' });
    });

    test('importPart 拒绝不安全 partId / 非法 variant', () => {
        const cfg = helpers.createConfig();
        for (const partId of ['.', '..', '.hull', 'con', 'con.1', 'Hull']) {
            const r = ops.importPart(cfg, { partId: partId, definition: { variants: {} } });
            expect(r.ok).toBe(false);
            expect(r.errors[0].code).toBe('invalid_format');
        }
        const r2 = ops.importPart(cfg, {
            partId: 'ok',
            definition: { variants: { '门': { model: 'machine_max:model/x' } } },
        });
        expect(r2.ok).toBe(false);
        expect(r2.errors[0].code).toBe('invalid_format');
    });

    test('importSubPart 传非法枚举返回 invalid_enum', () => {
        const cfg = helpers.createConfig();
        const r = ops.importSubPart(cfg, {
            partId: 'hull',
            variantName: 'default',
            spKey: 'sub_part.machine_max.main',
            definition: {
                start_bone: 'hull',
                hit_boxes: { hull: { type: 'banana' } },
            },
        });
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('invalid_enum');
    });

    test('importSubPart 替换后旧 marker 不残留（骨骼仍在）', () => {
        const cfg = helpers.createConfig();
        const r = ops.importSubPart(cfg, {
            partId: 'hull',
            variantName: 'default',
            spKey: 'sub_part.machine_max.main',
            definition: {
                start_bone: 'hull',
                mass: 10,
                hit_boxes: { hull: { type: 'box' } },
            },
        });
        expect(r.ok).toBe(true);
        const markers = cfg.parts.hull.element_markers.default;
        expect(markers['22222222-2222-2222-2222-222222222222']).toBeUndefined(); // connector
        expect(markers['44444444-4444-4444-4444-444444444444']).toBeUndefined(); // interact_box
        // 同形替换后每个元素仍只有一个 marker（hull 同时是 start_bone/hit_box → 保留 sub_part）
        expect(Object.keys(markers).filter(function (u) {
            return u === '11111111-1111-1111-1111-111111111111';
        })).toHaveLength(1);
    });

    test('reset_fields 只列顶层字段', () => {
        const cfg = helpers.createConfig();
        const definition = {
            variants: {
                default: {
                    model: 'machine_max:model/new',
                    sub_parts: {
                        'sub_part.machine_max.main': {
                            start_bone: 'hull',
                            mass: 2,
                            hit_boxes: { hull: { type: 'box' } },
                        },
                    },
                },
            },
        };
        const r = ops.importPart(cfg, {
            partId: 'hull',
            definition: definition,
            mode: 'replace',
        });
        expect(r.ok).toBe(true);
        expect(r.reset_fields).toContain('icon');
        expect(r.reset_fields.some(function (f) { return f.indexOf('variants.') === 0; }))
            .toBe(false);
    });
});

describe('ops.rename*', () => {
    test('renameSubPart 同时改写 sub_part 与 hit_box marker 的 config_ref', () => {
        const cfg = helpers.createConfig();
        const r = ops.renameSubPart(cfg, {
            partId: 'hull',
            variantName: 'default',
            oldKey: 'sub_part.machine_max.main',
            newKey: 'sub_part.machine_max.chassis',
        });
        expect(r.ok).toBe(true);
        expect(cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.chassis']).toBeTruthy();
        const markers = cfg.parts.hull.element_markers.default;
        expect(markers['11111111-1111-1111-1111-111111111111'].config_ref)
            .toBe('sub_part.machine_max.chassis');
        expect(markers['33333333-3333-3333-3333-333333333333'].config_ref)
            .toBe('sub_part.machine_max.chassis');
    });

    test('renameSubPart 要求规范 key', () => {
        const cfg = helpers.createConfig();
        const r = ops.renameSubPart(cfg, {
            partId: 'hull',
            variantName: 'default',
            oldKey: 'sub_part.machine_max.main',
            newKey: 'chassis',
        });
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('invalid_format');
    });
});

describe('connector marker 迁移（docs/13 §15.2.1）', () => {
    test('两个 connector 共用 definition、不同 Locator，各自迁到自己的 key', () => {
        const cfg = helpers.createConfig();
        const sp = cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.connectors['connector.machine_max.rear_hatch'] = {
            locator: 'turret',
            definition: 'machine_max:hatch',
            signal_targets: {},
            signal_translations: {},
            power_target: '',
            internal: false,
            overwrite: null,
            _marker_uuid: '55555555-5555-5555-5555-555555555555',
        };
        const markers = cfg.parts.hull.element_markers.default;
        markers['22222222-2222-2222-2222-222222222222'].config_ref = 'machine_max:hatch';
        markers['55555555-5555-5555-5555-555555555555'] = {
            type: 'connector',
            config_ref: 'machine_max:hatch',
        };

        const result = em.migrateConnectorMarkerRefs(cfg);
        expect(result.migrated).toBe(2);
        expect(result.warnings).toEqual([]);
        expect(markers['22222222-2222-2222-2222-222222222222'].config_ref)
            .toBe('connector.machine_max.hatch');
        expect(markers['55555555-5555-5555-5555-555555555555'].config_ref)
            .toBe('connector.machine_max.rear_hatch');

        // 幂等
        const again = em.migrateConnectorMarkerRefs(cfg);
        expect(again.migrated).toBe(0);
    });

    test('无法唯一匹配时保留 legacy_config_ref 并告警', () => {
        const cfg = helpers.createConfig();
        const sp = cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.connectors['connector.machine_max.dup'] = {
            locator: 'missing_locator',
            definition: 'machine_max:hatch',
            signal_targets: {},
            signal_translations: {},
            power_target: '',
            internal: false,
            overwrite: null,
        };
        const markers = cfg.parts.hull.element_markers.default;
        markers['99999999-9999-9999-9999-999999999999'] = {
            type: 'connector',
            config_ref: 'machine_max:hatch',
        };
        const result = em.migrateConnectorMarkerRefs(cfg);
        expect(result.warnings[0].code).toBe('unresolved_config_ref');
        expect(markers['99999999-9999-9999-9999-999999999999'].config_ref).toBeNull();
        expect(markers['99999999-9999-9999-9999-999999999999'].legacy_config_ref)
            .toBe('machine_max:hatch');
        expect(cfg._lastMigration.marker_refs[0].reason).toBe('connector_not_found');
    });
});

describe('collectIssues：DANGLING_SIGNAL_TARGET', () => {
    test('指向不存在节点的 signal_target 产生 error', () => {
        const cfg = helpers.createConfig();
        const sp = cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.subsystems['subsystem.machine_max.engine'].speed_outputs = {
            engine_speed: ['subsystem.machine_max.missing'],
        };
        const issues = collectIssues(cfg);
        const found = issues.filter(function (p) { return p.code === 'dangling_signal_target'; });
        expect(found.length).toBeGreaterThan(0);
        expect(found[0].severity).toBe('error');
        expect(found[0].path.subPartKey).toBe('sub_part.machine_max.main');
    });

    test('local / global 与真实 key 不报错', () => {
        const cfg = helpers.createConfig();
        const issues = collectIssues(cfg);
        expect(issues.some(function (p) { return p.code === 'dangling_signal_target'; })).toBe(false);
    });
});
