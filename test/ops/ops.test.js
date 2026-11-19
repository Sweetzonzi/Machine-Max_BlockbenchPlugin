'use strict';

// ops 层验收测试（docs/13 §11 #7 / #18 / #19 / #20 / #22、§10 P2）
// 使用真实 element_markers 作为 markers 端口，骨骼用 test/helpers 的 fake。

const { describe, test, expect, beforeEach, afterEach, afterAll } = require('bun:test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const ports = require('../../src/doc/ports.js');
const em = require('../../src/core/element_markers.js');
const undo = require('../../src/core/undo.js');
const helpers = require('../helpers.js');
const ops = require('../../src/ops/index.js');
const projection = require('../../src/doc/projection.js');
const { collectIssues } = require('../../src/services/validate.js');

/** 依赖路径用例的临时目录（仅本文件使用） */
const DEPS_TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'mm-ops-deps-'));

/**
 * 创建只含 meta.json 的临时内容包目录
 * @param {string} dirName
 * @param {string} id
 * @returns {string}
 */
function makeTempPack(dirName, id) {
    const dir = path.join(DEPS_TMP_ROOT, dirName);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ id: id, version: '1.0' }), 'utf-8');
    return dir;
}

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

afterAll(function () {
    try {
        fs.rmSync(DEPS_TMP_ROOT, { recursive: true, force: true });
    } catch (e) {
        // 忽略临时目录清理失败
    }
});

describe('ops.setField', () => {
    test('根字段 namespace 只接受合法命名空间', () => {
        // 它是目录名 / resource location 的一部分，写进非法值会让导出落到坏目录
        const cfg = helpers.createConfig();
        for (const bad of ['Bad NS', 'k17.x', '', 42, null]) {
            const r = ops.setField(cfg, { path: ['namespace'], value: bad });
            expect(r.ok).toBe(false);
            expect(r.errors[0].code).toBe('invalid_format');
        }
        expect(cfg.namespace).toBe('machine_max');

        const ok = ops.setField(cfg, { path: ['namespace'], value: 'k17' });
        expect(ok.ok).toBe(true);
        expect(cfg.namespace).toBe('k17');
    });

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

    test('setField 整表写 hit_boxes 时把骨骼名 key 归一化为 UUID', () => {
        const cfg = helpers.createConfig();
        const sp = cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];

        const r = ops.setField(cfg, {
            path: ['parts', 'hull', 'variants', 'default', 'sub_parts',
                'sub_part.machine_max.main', 'hit_boxes'],
            value: { turret: { type: 'box', material: 'machine_max:default' } },
        });

        expect(r.ok).toBe(true);
        expect(sp.hit_boxes['55555555-5555-5555-5555-555555555555']).toEqual({
            type: 'box', material: 'machine_max:default',
        });
        expect(sp.hit_boxes.turret).toBeUndefined();
    });

    test('setField 整表写 hit_boxes 时未知骨骼名拒绝且不写半截', () => {
        const cfg = helpers.createConfig();
        const sp = cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        const before = JSON.stringify(sp.hit_boxes);

        const r = ops.setField(cfg, {
            path: ['parts', 'hull', 'variants', 'default', 'sub_parts',
                'sub_part.machine_max.main', 'hit_boxes'],
            value: { missing_bone: { type: 'box', material: 'machine_max:default' } },
        });

        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('not_found');
        expect(JSON.stringify(sp.hit_boxes)).toBe(before);
    });

    test('repairHitBoxKeys 把存量骨骼名 key 归一化且幂等', () => {
        const cfg = helpers.createConfig();
        const sp = cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.hit_boxes = { hull: sp.hit_boxes['11111111-1111-1111-1111-111111111111'] };

        const first = projection.repairHitBoxKeys(cfg);
        expect(first.repaired).toBe(1);
        expect(sp.hit_boxes['11111111-1111-1111-1111-111111111111']).toBeDefined();
        expect(sp.hit_boxes.hull).toBeUndefined();

        const second = projection.repairHitBoxKeys(cfg);
        expect(second.repaired).toBe(0);
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

describe('新建实体的默认命名空间：共享词汇 machine_max', () => {
    // 上游内容包把跨包共享的结构名字放在 machine_max 下（译名由内置包提供），
    // 新建实体一律先落这个命名空间，与 config.namespace（导出命名空间）无关。
    function configWithExportNs(ns) {
        const cfg = helpers.createConfig();
        cfg.namespace = ns;
        return cfg;
    }

    test('markSubPart 不随导出命名空间生成 sub_part.<ns>.main', () => {
        const cfg = configWithExportNs('k17');
        cfg.parts.hull.variants.default.sub_parts = {};
        const r = ops.markSubPart(cfg, {
            partId: 'hull',
            variantName: 'default',
            element: { uuid: '11111111-1111-1111-1111-111111111111', name: 'hull' },
        });
        expect(r.ok).toBe(true);
        expect(r.spKey).toBe('sub_part.machine_max.main');
        expect(cfg.parts.hull.variants.default.sub_parts['sub_part.k17.main']).toBeUndefined();
    });

    test('markConnector 默认 connector.machine_max.<骨骼名>', () => {
        const cfg = configWithExportNs('k17');
        const sp = cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.connectors = {};
        const r = ops.markConnector(cfg, {
            partId: 'hull',
            variantName: 'default',
            spKey: 'sub_part.machine_max.main',
            element: { uuid: '22222222-2222-2222-2222-222222222222', name: 'Hatch' },
        });
        expect(r.ok).toBe(true);
        expect(r.name).toBe('connector.machine_max.hatch');
        expect(sp.connectors['connector.machine_max.hatch']).toBeTruthy();
    });

    test('markInteractBox 默认 interact.machine_max.<骨骼名>', () => {
        const cfg = configWithExportNs('k17');
        const sp = cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.interact_boxes = {};
        const r = ops.markInteractBox(cfg, {
            partId: 'hull',
            variantName: 'default',
            spKey: 'sub_part.machine_max.main',
            element: { uuid: '44444444-4444-4444-4444-444444444444', name: 'Door' },
        });
        expect(r.ok).toBe(true);
        expect(r.name).toBe('interact.machine_max.door');
        expect(sp.interact_boxes['interact.machine_max.door']).toBeTruthy();
    });

    test('作者显式给的 key 不被默认命名空间改写', () => {
        const cfg = configWithExportNs('k17');
        const r = ops.markConnector(cfg, {
            partId: 'hull',
            variantName: 'default',
            spKey: 'sub_part.machine_max.main',
            key: 'connector.k17.rws_turret',
            element: { uuid: '22222222-2222-2222-2222-222222222222', name: 'RwsTurret' },
        });
        expect(r.ok).toBe(true);
        expect(r.name).toBe('connector.k17.rws_turret');
    });
});

describe('零件内重名（跨子零件，上游解码即整份拒收）', () => {
    const GUN = 'sub_part.machine_max.gun';

    function addSibling(cfg, maps) {
        const variant = cfg.parts.hull.variants.default;
        variant.sub_parts[GUN] = helpers.createSubPart(Object.assign({
            start_bone: 'hatch',
            hit_boxes: {},
            interact_boxes: {},
            connectors: {},
            subsystems: {},
        }, maps || {}));
        return variant.sub_parts[GUN];
    }

    test('renameConnector 撞上别的子零件的同名连接点 → duplicate_name', () => {
        const cfg = helpers.createConfig();
        addSibling(cfg, {
            connectors: {
                'connector.machine_max.ring': {
                    locator: 'hatch', definition: 'machine_max:ring', signal_targets: {},
                    signal_translations: {}, power_target: '', internal: false, overwrite: null,
                },
            },
        });
        const r = ops.renameConnector(cfg, {
            partId: 'hull',
            variantName: 'default',
            spKey: 'sub_part.machine_max.main',
            oldKey: 'connector.machine_max.hatch',
            newKey: 'connector.machine_max.ring',
        });
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('duplicate_name');
        expect(r.error).toContain(GUN);
    });

    test('createSubsystem 撞上别的子零件的同名子系统 → duplicate_name', () => {
        const cfg = helpers.createConfig();
        addSibling(cfg, {
            subsystems: {
                'subsystem.machine_max.aux_engine': {
                    type: 'machine_max:engine', definition: 'machine_max:engine',
                    power_output: '', speed_outputs: {},
                },
            },
        });
        const r = ops.createSubsystem(cfg, {
            partId: 'hull',
            variantName: 'default',
            spKey: 'sub_part.machine_max.main',
            typeId: 'machine_max:engine',
            instanceName: 'subsystem.machine_max.aux_engine',
        });
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('duplicate_name');
    });

    test('importSubsystem 撞上别的子零件的同名子系统 → duplicate_name', () => {
        const cfg = helpers.createConfig();
        addSibling(cfg, {
            subsystems: {
                'subsystem.machine_max.aux_engine': {
                    type: 'machine_max:engine', definition: 'machine_max:engine',
                    power_output: '', speed_outputs: {},
                },
            },
        });
        const r = ops.importSubsystem(cfg, {
            partId: 'hull',
            variantName: 'default',
            spKey: 'sub_part.machine_max.main',
            instanceName: 'subsystem.machine_max.aux_engine',
            definition: {
                type: 'machine_max:engine',
                definition: 'machine_max:engine',
                power_output: '',
                speed_outputs: {},
            },
        });
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('duplicate_name');
    });

    test('markConnector 显式 key 撞上别的子零件 → duplicate_name；同子零件同名是复用', () => {
        const cfg = helpers.createConfig();
        addSibling(cfg, {
            connectors: {
                'connector.machine_max.ring': {
                    locator: 'hatch', definition: 'machine_max:ring', signal_targets: {},
                    signal_translations: {}, power_target: '', internal: false, overwrite: null,
                },
            },
        });
        const clash = ops.markConnector(cfg, {
            partId: 'hull',
            variantName: 'default',
            spKey: 'sub_part.machine_max.main',
            key: 'connector.machine_max.ring',
            element: { uuid: '22222222-2222-2222-2222-222222222222', name: 'Ring' },
        });
        expect(clash.ok).toBe(false);
        expect(clash.errors[0].code).toBe('duplicate_name');

        const reuse = ops.markConnector(cfg, {
            partId: 'hull',
            variantName: 'default',
            spKey: 'sub_part.machine_max.main',
            key: 'connector.machine_max.hatch',
            element: { uuid: '22222222-2222-2222-2222-222222222222', name: 'Hatch' },
        });
        expect(reuse.ok).toBe(true);
        expect(reuse.name).toBe('connector.machine_max.hatch');
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

    test('renameSubPart 支持只改命名空间（跨包引用合法）', () => {
        const cfg = helpers.createConfig();
        const r = ops.renameSubPart(cfg, {
            partId: 'hull',
            variantName: 'default',
            oldKey: 'sub_part.machine_max.main',
            newKey: 'sub_part.m1a2_sep.main',
        });
        expect(r.ok).toBe(true);
        expect(cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'])
            .toBeUndefined();
        expect(cfg.parts.hull.variants.default.sub_parts['sub_part.m1a2_sep.main']).toBeTruthy();
        const markers = cfg.parts.hull.element_markers.default;
        expect(markers['11111111-1111-1111-1111-111111111111'].config_ref)
            .toBe('sub_part.m1a2_sep.main');
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

    test('跨子零件的子系统 / 连接点目标命中，不报错', () => {
        const cfg = helpers.createConfig();
        const variant = cfg.parts.hull.variants.default;
        const sp = variant.sub_parts['sub_part.machine_max.main'];
        variant.sub_parts['sub_part.machine_max.gun'] = helpers.createSubPart({
            start_bone: 'hatch',
            hit_boxes: {},
            interact_boxes: {},
            connectors: {
                'connector.machine_max.ring': {
                    locator: 'hatch',
                    definition: 'machine_max:ring',
                    signal_targets: {},
                    signal_translations: {},
                    power_target: '',
                    internal: false,
                    overwrite: null,
                },
            },
            subsystems: {
                'subsystem.machine_max.launcher': {
                    type: 'machine_max:launcher',
                    definition: 'machine_max:launcher',
                    control_outputs: {},
                },
            },
        });
        sp.subsystems['subsystem.machine_max.engine'].speed_outputs = {
            engine_speed: ['subsystem.machine_max.launcher', 'connector.machine_max.ring'],
        };
        const issues = collectIssues(cfg);
        expect(issues.some(function (p) { return p.code === 'dangling_signal_target'; })).toBe(false);
    });

    test('目标写成交互区 → warning interact_box_as_signal_target', () => {
        const cfg = helpers.createConfig();
        const sp = cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.connectors['connector.machine_max.hatch'].signal_targets = {
            ch: ['interact.machine_max.door'],
        };
        const issues = collectIssues(cfg);
        const found = issues.filter(function (p) {
            return p.code === 'interact_box_as_signal_target';
        });
        expect(found).toHaveLength(1);
        expect(found[0].severity).toBe('warning');
        expect(found[0].message).toContain('交互区只发不收');
        expect(found[0].path.subPartKey).toBe('sub_part.machine_max.main');
    });

    test('跨子零件重名 → duplicate_name（名字在零件内唯一）', () => {
        const cfg = helpers.createConfig();
        const variant = cfg.parts.hull.variants.default;
        variant.sub_parts['sub_part.machine_max.gun'] = helpers.createSubPart({
            start_bone: 'hatch',
            hit_boxes: {},
            interact_boxes: {},
            connectors: {
                'connector.machine_max.hatch': {
                    locator: 'hatch',
                    definition: 'machine_max:hatch',
                    signal_targets: {},
                    signal_translations: {},
                    power_target: '',
                    internal: false,
                    overwrite: null,
                },
            },
            subsystems: {},
        });
        const issues = collectIssues(cfg);
        const found = issues.filter(function (p) { return p.code === 'duplicate_name'; });
        expect(found).toHaveLength(1);
        expect(found[0].severity).toBe('error');
        expect(found[0].message).toContain('重复');
        expect(found[0].message).toContain('connector.machine_max.hatch');
    });
});

describe('ops.updateDependencyPaths：内置包路径', () => {
    test('编辑依赖时剔除 machine_max:builtin 路径', () => {
        const cfg = helpers.createConfig();
        const builtinDir = makeTempPack('builtin_pack', 'machine_max:builtin');
        const normalDir = makeTempPack('normal_pack', 'machine_max:normal');
        cfg.dependencyPaths = [builtinDir];

        installFakeUndo(cfg);
        const result = ops.updateDependencyPaths(cfg, { add: [normalDir] });
        expect(result.ok).toBe(true);
        expect(result.changed).toBe(true);
        expect(cfg.dependencyPaths).toEqual([normalDir]);
    });
});

describe('ops.setContentPack：打开内容包时一并写入依赖', () => {
    test('dependencyPaths 与路径同属一条撤销记录，并剔除内置包', () => {
        const cfg = helpers.createConfig();
        const builtinDir = makeTempPack('open_builtin', 'machine_max:builtin');
        const depDir = makeTempPack('open_dep', 'machine_max:dep');

        installFakeUndo(cfg);
        const result = ops.setContentPack(cfg, {
            path: 'D:/packs/app',
            namespace: 'machine_max',
            meta: { id: 'machine_max:app', version: '1.0' },
            dependencyPaths: [builtinDir, depDir],
            label: '打开内容包',
        });

        expect(result.ok).toBe(true);
        expect(cfg.contentPackPath).toBe('D:/packs/app');
        expect(cfg.dependencyPaths).toEqual([depDir]);
        // 一条记录：Ctrl+Z 不会留下「新包 + 旧依赖」的中间态
        expect(Undo.history.length).toBe(1);
        expect(Undo.history[0].action).toBe('打开内容包');
    });

    test('不传 dependencyPaths 时保留原有依赖', () => {
        const cfg = helpers.createConfig();
        cfg.dependencyPaths = ['D:/packs/existing'];

        installFakeUndo(cfg);
        const result = ops.setContentPack(cfg, {
            path: 'D:/packs/other',
            namespace: 'machine_max',
            meta: { id: 'machine_max:other', version: '1.0' },
        });

        expect(result.ok).toBe(true);
        expect(cfg.dependencyPaths).toEqual(['D:/packs/existing']);
    });
});
