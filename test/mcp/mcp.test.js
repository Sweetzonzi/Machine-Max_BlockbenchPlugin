'use strict';

// MCP 工具层验收（docs/12 §11.3 的核心子集 + 注册生命周期）

const { describe, test, expect, beforeEach, afterEach } = require('bun:test');
const ports = require('../../src/doc/ports.js');
const em = require('../../src/core/element_markers.js');
const undo = require('../../src/core/undo.js');
const helpers = require('../helpers.js');
const doc = require('../../src/doc/index.js');
const defManager = require('../../src/core/content_pack_manager.js');
const mcpIndex = require('../../src/mcp/index.js');
const mcpTools = require('../../src/mcp/tools.js');

const BONES = [
    { name: 'hull', uuid: '11111111-1111-1111-1111-111111111111' },
    { name: 'turret', uuid: '55555555-5555-5555-5555-555555555555' },
    { name: 'hatch', uuid: '22222222-2222-2222-2222-222222222222' },
    { name: 'door', uuid: '44444444-4444-4444-4444-444444444444' },
    { name: 'wheel', uuid: '66666666-6666-6666-6666-666666666666' },
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

function installGlobals(config) {
    installFakeUndo(config);
    function FakeGroup() {}
    FakeGroup.all = BONES;
    function FakeLocator() {}
    FakeLocator.all = [];
    global.Group = FakeGroup;
    global.Locator = FakeLocator;
    global.Blockbench = { dispatchEvent: function () {} };
    global.Outliner = {
        selected: [{ uuid: BONES[0].uuid, name: BONES[0].name }],
    };
}

function clearGlobals() {
    delete global.Project;
    delete global.Undo;
    delete global.Group;
    delete global.Locator;
    delete global.Blockbench;
    delete global.Outliner;
    delete globalThis.MCP_QUEUE;
    delete globalThis.MCP;
}

function run(name, args) {
    return mcpTools.execute(name, args, null);
}

function spKey() {
    return 'sub_part.machine_max.main';
}

beforeEach(function () {
    installPorts();
});

afterEach(function () {
    mcpTools.resetState();
    mcpIndex.unregisterMcpTools();
    clearGlobals();
    ports.reset();
});

describe('MCP 只读工具', () => {
    test('get_context 返回 active / parts / variants / selection', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('get_context', {});
        expect(r.ok).toBe(true);
        expect(r.active).toEqual({ part: 'hull', variant: 'default' });
        expect(r.parts).toEqual(['hull']);
        expect(r.variants).toEqual(['default']);
        expect(r.selection[0].uuid).toBe(BONES[0].uuid);
        expect(r.selection[0].marker.type).toBe('sub_part');
    });

    test('read_node 支持相对路径与 JSON Pointer', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('read_node', {
            path: ['sub_parts', spKey(), 'mass'],
        });
        expect(r.ok).toBe(true);
        expect(r.value).toBe(25);

        const p = run('read_node', {
            path: '/parts/hull/variants/default/sub_parts/' + spKey() + '/mass',
        });
        expect(p.ok).toBe(true);
        expect(p.value).toBe(25);
    });

    test('read_node definition 投影 hit_boxes UUID→骨骼名并剥内部字段', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('read_node', {
            path: ['sub_parts', spKey()],
            as: 'definition',
        });
        expect(r.ok).toBe(true);
        expect(r.value.hit_boxes.hull).toBeTruthy();
        expect(r.value.hit_boxes['11111111-1111-1111-1111-111111111111']).toBeUndefined();
        expect(r.value.interact_boxes['interact.machine_max.door']._uuid).toBeUndefined();
    });

    test('read_node 读 sub_parts map 时逐项投影且保留 key', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('read_node', { path: ['sub_parts'], as: 'definition' });
        expect(r.ok).toBe(true);
        expect(Object.keys(r.value)).toEqual([spKey()]);
        expect(r.value[spKey()].hit_boxes.hull).toBeTruthy();
    });

    test('validate 返回结构化问题与 export_ok', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('validate', {});
        expect(r.ok).toBe(true);
        expect(typeof r.count).toBe('number');
        expect(Array.isArray(r.issues)).toBe(true);
        expect(typeof r.export_ok).toBe('boolean');
    });
});

describe('MCP 细粒度编辑', () => {
    test('set_node 写入数值并进入一次撤销记录，返回 before/after', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('set_node', {
            path: ['sub_parts', spKey(), 'mass'],
            value: 40,
        });
        expect(r.ok).toBe(true);
        expect(r.before).toBe(25);
        expect(r.after).toBe(40);
        expect(cfg.parts.hull.variants.default.sub_parts[spKey()].mass).toBe(40);
        expect(Undo.history).toHaveLength(1);
    });

    test('set_node 严格类型：字符串数字返回 type_mismatch 且不写', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('set_node', {
            path: ['sub_parts', spKey(), 'mass'],
            value: 'abc',
        });
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('type_mismatch');
        expect(cfg.parts.hull.variants.default.sub_parts[spKey()].mass).toBe(25);
    });

    test('set_node 拒绝 _uiState 与 element_markers', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const a = run('set_node', { path: ['_uiState', 'activePartId'], value: 'x' });
        expect(a.ok).toBe(false);
        expect(a.errors[0].code).toBe('unknown_field');
        const b = run('set_node', {
            path: ['parts', 'hull', 'element_markers', 'default', 'x'],
            value: {},
        });
        expect(b.ok).toBe(false);
        expect(b.errors[0].code).toBe('unknown_field');
    });

    test('set_node 新建 map 条目仍做值校验', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('set_node', {
            path: ['sub_parts', spKey(), 'hit_boxes', 'turret'],
            value: { type: 'banana' },
        });
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('invalid_enum');
        expect(cfg.parts.hull.variants.default.sub_parts[spKey()]
            .hit_boxes['55555555-5555-5555-5555-555555555555']).toBeUndefined();
    });

    test('set_node 期间 Undo.current_save 已占用 → edit_in_progress', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        Undo.current_save = {};
        const r = run('set_node', {
            path: ['sub_parts', spKey(), 'mass'],
            value: 40,
        });
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('edit_in_progress');
        expect(cfg.parts.hull.variants.default.sub_parts[spKey()].mass).toBe(25);
    });

    test('set_node 事件 persist=false（MCP 不落盘）', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const events = [];
        global.Blockbench = {
            dispatchEvent: function (name, payload) { events.push({ name, payload }); },
        };
        const r = run('set_node', {
            path: ['sub_parts', spKey(), 'mass'],
            value: 41,
        });
        expect(r.ok).toBe(true);
        const changed = events.filter(function (e) { return e.name === 'mm_config_changed'; });
        expect(changed).toHaveLength(1);
        expect(changed[0].payload.source).toBe('mcp');
        expect(changed[0].payload.persist).toBe(false);
    });

    test('remove_node 删除连接点并清理 subsystem.power_output', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('remove_node', {
            path: ['sub_parts', spKey(), 'connectors', 'connector.machine_max.hatch'],
        });
        expect(r.ok).toBe(true);
        expect(r.cleaned_references.length).toBeGreaterThan(0);
        const sp = cfg.parts.hull.variants.default.sub_parts[spKey()];
        expect(sp.connectors['connector.machine_max.hatch']).toBeUndefined();
        expect(sp.subsystems['subsystem.machine_max.engine'].power_output).toBe('');
    });

    test('remove_node 支持 hit_boxes 骨骼名', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('remove_node', {
            path: ['sub_parts', spKey(), 'hit_boxes', 'hull'],
        });
        expect(r.ok).toBe(true);
        const sp = cfg.parts.hull.variants.default.sub_parts[spKey()];
        expect(sp.hit_boxes['11111111-1111-1111-1111-111111111111']).toBeUndefined();
    });

    test('remove_node cascade:false 保留引用', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('remove_node', {
            path: ['sub_parts', spKey(), 'connectors', 'connector.machine_max.hatch'],
            cascade: false,
        });
        expect(r.ok).toBe(true);
        const sp = cfg.parts.hull.variants.default.sub_parts[spKey()];
        expect(sp.subsystems['subsystem.machine_max.engine'].power_output)
            .toBe('connector.machine_max.hatch');
    });

    test('bind_marker 未知 uuid 返回 not_found', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('bind_marker', { uuid: 'not-a-uuid', type: 'sub_part' });
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('not_found');
    });

    test('bind_marker 的 hit_box config_ref 由上下文推导', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('bind_marker', {
            uuid: '11111111-1111-1111-1111-111111111111',
            type: 'hit_box',
        });
        expect(r.ok).toBe(true);
        expect(r.config_ref).toBe(spKey());
        expect(cfg.parts.hull.element_markers.default['11111111-1111-1111-1111-111111111111'])
            .toEqual({ type: 'hit_box', config_ref: spKey() });
    });

    test('set_active 切换上下文且不进撤销栈', () => {
        const cfg = helpers.createConfig();
        cfg.parts.second = helpers.createPart();
        cfg.parts.second.variants.alt = helpers.createVariant();
        installGlobals(cfg);
        const r = run('set_active', { part: 'second', variant: 'alt' });
        expect(r.ok).toBe(true);
        expect(cfg._uiState.activePartId).toBe('second');
        expect(cfg._uiState.activeVariantName).toBe('alt');
        expect(Undo.history).toHaveLength(0);
    });
});

describe('MCP 整件通道', () => {
    test('import_sub_part 拒绝非规范 key', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('import_sub_part', {
            key: 'chassis',
            definition: { start_bone: 'hull' },
        });
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('invalid_format');
    });

    test('import_sub_part 的非法枚举返回 invalid_enum', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('import_sub_part', {
            key: spKey(),
            definition: { start_bone: 'hull', hit_boxes: { hull: { type: 'banana' } } },
        });
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('invalid_enum');
    });

    test('import_part create 新零件，reset_fields 为空', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const definition = {
            variants: {
                default: {
                    model: 'machine_max:model/tank',
                    sub_parts: {
                        [spKey()]: {
                            start_bone: 'hull',
                            mass: 3,
                            hit_boxes: { hull: { type: 'box' } },
                        },
                    },
                },
            },
        };
        const r = run('import_part', { part_id: 'tank', definition: definition, mode: 'create' });
        expect(r.ok).toBe(true);
        expect(r.action).toBe('created');
        expect(r.reset_fields).toEqual([]);
        expect(cfg.parts.tank.variants.default.model).toBe('machine_max:model/tank');
    });

    test('import_part create 重名返回 duplicate_name', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('import_part', {
            part_id: 'hull',
            definition: { variants: {} },
            mode: 'create',
        });
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('duplicate_name');
    });

    test('import_part rename 删除旧 key 并保留新 key', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const definition = {
            variants: {
                default: {
                    model: 'machine_max:model/renamed',
                    sub_parts: {
                        [spKey()]: {
                            start_bone: 'hull',
                            mass: 1,
                            hit_boxes: { hull: { type: 'box' } },
                        },
                    },
                },
            },
        };
        const r = run('import_part', {
            part_id: 'renamed',
            old_key: 'hull',
            mode: 'rename',
            definition: definition,
        });
        expect(r.ok).toBe(true);
        expect(r.action).toBe('renamed');
        expect(cfg.parts.hull).toBeUndefined();
        expect(cfg.parts.renamed).toBeTruthy();
        expect(cfg._uiState.activePartId).toBe('renamed');
    });

    test('import_sub_part rename 改写 marker.config_ref', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const definition = run('read_node', {
            path: ['sub_parts', spKey()],
            as: 'definition',
        }).value;
        const r = run('import_sub_part', {
            key: 'sub_part.machine_max.chassis',
            old_key: spKey(),
            mode: 'rename',
            definition: definition,
        });
        expect(r.ok).toBe(true);
        const variant = cfg.parts.hull.variants.default;
        expect(variant.sub_parts[spKey()]).toBeUndefined();
        expect(variant.sub_parts['sub_part.machine_max.chassis']).toBeTruthy();
        expect(cfg.parts.hull.element_markers.default['11111111-1111-1111-1111-111111111111']
            .config_ref).toBe('sub_part.machine_max.chassis');
    });

    test('import_variant 在指定零件下新建变体', () => {
        const cfg = helpers.createConfig();
        cfg.parts.second = helpers.createPart();
        cfg.parts.second.variants = {};
        installGlobals(cfg);
        const r = run('import_variant', {
            parent_part: 'second',
            variant: 'alt',
            definition: {
                model: 'machine_max:model/alt',
                sub_parts: {
                    [spKey()]: { start_bone: 'hull', mass: 1, hit_boxes: { hull: { type: 'box' } } },
                },
            },
            mode: 'create',
        });
        expect(r.ok).toBe(true);
        expect(cfg.parts.second.variants.alt.model).toBe('machine_max:model/alt');
    });

    test('import_subsystem 未知类型返回 unknown_type', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('import_subsystem', {
            key: 'subsystem.machine_max.battery',
            parent_sub_part: spKey(),
            definition: { type: 'machine_max:battery' },
            mode: 'create',
        });
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('unknown_type');
    });

    test('import_subsystem create 合法占位并返回 reset_fields', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('import_subsystem', {
            key: 'subsystem.machine_max.motor',
            parent_sub_part: spKey(),
            definition: {
                type: 'machine_max:motor',
                definition: 'machine_max:medium_motor',
                power_output: '',
            },
            mode: 'create',
        });
        expect(r.ok).toBe(true);
        expect(r.action).toBe('created');
        const sp = cfg.parts.hull.variants.default.sub_parts[spKey()];
        expect(sp.subsystems['subsystem.machine_max.motor'].type).toBe('machine_max:motor');
    });

    test('add_instance 创建 hit_box 并写 marker', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('add_instance', {
            parent_path: ['sub_parts', spKey()],
            kind: 'hit_box',
            key: 'turret',
            definition: { type: 'box' },
        });
        expect(r.ok).toBe(true);
        expect(r.key).toBe('55555555-5555-5555-5555-555555555555');
        const sp = cfg.parts.hull.variants.default.sub_parts[spKey()];
        expect(sp.hit_boxes['55555555-5555-5555-5555-555555555555']).toBeTruthy();
        expect(cfg.parts.hull.element_markers.default['55555555-5555-5555-5555-555555555555'])
            .toEqual({ type: 'hit_box', config_ref: spKey() });
    });

    test('add_instance 创建 interact_box 并绑定骨骼', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('add_instance', {
            parent_path: ['sub_parts', spKey()],
            kind: 'interact_box',
            key: 'interact.machine_max.rear',
            definition: { bone: 'door' },
        });
        expect(r.ok).toBe(true);
        const sp = cfg.parts.hull.variants.default.sub_parts[spKey()];
        expect(sp.interact_boxes['interact.machine_max.rear'].bone).toBe('door');
        expect(sp.interact_boxes['interact.machine_max.rear']._uuid)
            .toBe('44444444-4444-4444-4444-444444444444');
    });

    test('add_instance 创建 connector 并绑定 locator', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('add_instance', {
            parent_path: ['sub_parts', spKey()],
            kind: 'connector',
            key: 'connector.machine_max.rear',
            definition: { locator: 'wheel', definition: 'machine_max:fixed_back' },
        });
        expect(r.ok).toBe(true);
        const sp = cfg.parts.hull.variants.default.sub_parts[spKey()];
        expect(sp.connectors['connector.machine_max.rear'].locator).toBe('wheel');
    });

    test('add_instance 找不到骨骼返回 not_found', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const r = run('add_instance', {
            parent_path: ['sub_parts', spKey()],
            kind: 'hit_box',
            key: 'missing_bone',
            definition: { type: 'box' },
        });
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('not_found');
    });
});

describe('MCP 编辑后自检', () => {
    test('introduced_issues 只返回本次引入的问题', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const before = run('validate', {});
        expect(before.ok).toBe(true);
        // 制造一个引用断裂：body 不在 signal_targets 的候选里
        const sp = cfg.parts.hull.variants.default.sub_parts[spKey()];
        sp.subsystems['subsystem.machine_max.engine'].speed_outputs = { engine_speed: ['local'] };
        const r = run('set_node', {
            path: ['sub_parts', spKey(), 'subsystems', 'subsystem.machine_max.engine', 'speed_outputs'],
            value: { engine_speed: ['subsystem.machine_max.missing'] },
        });
        expect(r.ok).toBe(true);
        expect(Array.isArray(r.introduced_issues)).toBe(true);
        expect(r.introduced_issues.some(function (p) {
            return p.code === 'dangling_signal_target';
        })).toBe(true);
    });

    test('validate only_introduced 与上一次结果 diff', () => {
        const cfg = helpers.createConfig();
        installGlobals(cfg);
        const first = run('validate', { only_introduced: true });
        expect(first.ok).toBe(true);
        const second = run('validate', { only_introduced: true });
        expect(second.ok).toBe(true);
        expect(second.count).toBe(0);
    });
});

describe('MCP 定义目录工具', () => {
    var originalLoad;

    function installDefs() {
        originalLoad = defManager.loadMergedDefs;
        defManager.loadMergedDefs = function (config, type) {
            if (type === 'materials') {
                return {
                    defs: {
                        'machine_max:structural_steel': {
                            physics: { friction: [0.45, 0.45, 0.5], rolling_friction: 0.22, restitution: 0.12 },
                            armor: { rha: 0.85, dmg_resist: 1.0, dmg_mult: 0.95, angle_effect: true },
                        },
                        'machine_max:glass': {
                            physics: { friction: [0.6, 0.6, 0.6] },
                            armor: { rha: 0.1 },
                        },
                    },
                    sources: {
                        'machine_max:structural_steel': 'builtin',
                        'machine_max:glass': 'current',
                    },
                };
            }
            if (type === 'subsystems') {
                return {
                    defs: {
                        'machine_max:light_car_engine': {
                            type: 'machine_max:engine',
                            basic_durability: 80,
                            max_power: 80000,
                            max_torque: 175,
                        },
                    },
                    sources: { 'machine_max:light_car_engine': 'dependency:0' },
                };
            }
            return { defs: {}, sources: {} };
        };
    }

    beforeEach(function () {
        installDefs();
        installGlobals(helpers.createConfig());
    });

    afterEach(function () {
        if (originalLoad) defManager.loadMergedDefs = originalLoad;
        originalLoad = null;
    });

    test('list_defs 返回 id / source / editable / 摘要', () => {
        const r = run('list_defs', { type: 'materials' });
        expect(r.ok).toBe(true);
        expect(r.total).toBe(2);
        expect(r.defs.map(function (d) { return d.id; })).toEqual([
            'machine_max:glass',
            'machine_max:structural_steel',
        ]);
        const steel = r.defs.filter(function (d) { return d.id === 'machine_max:structural_steel'; })[0];
        expect(steel.source).toBe('builtin');
        expect(steel.editable).toBe(false);
        expect(steel.summary.armor.rha).toBe(0.85);
        expect(steel.summary.physics.rolling_friction).toBe(0.22);
        const glass = r.defs.filter(function (d) { return d.id === 'machine_max:glass'; })[0];
        expect(glass.editable).toBe(true);
    });

    test('list_defs 支持 search / source / limit', () => {
        expect(run('list_defs', { type: 'materials', search: 'steel' }).total).toBe(1);
        expect(run('list_defs', { type: 'materials', source: 'current' }).total).toBe(1);
        const limited = run('list_defs', { type: 'materials', limit: 1 });
        expect(limited.count).toBe(1);
        expect(limited.truncated).toBe(true);
    });

    test('list_defs 的 subsystem 摘要带型号字段', () => {
        const r = run('list_defs', { type: 'subsystems' });
        expect(r.defs[0].id).toBe('machine_max:light_car_engine');
        expect(r.defs[0].summary.type).toBe('machine_max:engine');
        expect(r.defs[0].summary.max_power).toBe(80000);
        expect(r.defs[0].source).toBe('dependency:0');
    });

    test('read_def 返回完整定义并支持裸 id', () => {
        const r = run('read_def', { type: 'materials', id: 'structural_steel' });
        expect(r.ok).toBe(true);
        expect(r.id).toBe('machine_max:structural_steel');
        expect(r.source).toBe('builtin');
        expect(r.definition.physics.friction[0]).toBe(0.45);
        expect(r.definition.armor.rha).toBe(0.85);
    });

    test('read_def 缺失返回 not_found', () => {
        const r = run('read_def', { type: 'materials', id: 'machine_max:missing' });
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('not_found');
    });

    test('list_defs 未知类型返回 invalid_format', () => {
        const r = run('list_defs', { type: 'unknown' });
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('invalid_format');
    });
});

describe('MCP 注册生命周期', () => {
    function schema() {
        var s = { optional: function () { return s; } };
        s.int = function () { return s; };
        s.min = function () { return s; };
        s.max = function () { return s; };
        return {
            object: function () { return s; },
            union: function () { return s; },
            array: function () { return s; },
            string: function () { return s; },
            number: function () { return s; },
            boolean: function () { return s; },
            any: function () { return s; },
            enum: function () { return s; },
            int: function () { return s; },
            min: function () { return s; },
            max: function () { return s; },
        };
    }

    test('setup 注册 14 个带前缀工具，condition 限定模式', () => {
        globalThis.MCP_QUEUE = [];
        const registered = [];
        const unregistered = [];
        const mcp = {
            z: schema(),
            registerTool: function (spec) { registered.push(spec); return function () {}; },
            unregisterTool: function (name) { unregistered.push(name); },
            createJsonResult: function (obj) { return obj; },
        };

        const ok = mcpIndex.registerMcpTools();
        expect(ok).toBe(true);
        expect(globalThis.MCP_QUEUE).toHaveLength(1);
        globalThis.MCP_QUEUE[0].setup(mcp);

        expect(registered).toHaveLength(14);
        expect(registered[0].name).toBe('machine_max_bb_plugin_get_context');
        expect(registered[0].parameters).toBeTruthy();
        expect(registered[0].params).toBeUndefined();
        expect(registered.every(function (s) {
            return s.condition.project === true
                && s.condition.modes[0] === 'machine_max_part';
        })).toBe(true);

        mcpIndex.unregisterMcpTools();
        expect(globalThis.MCP_QUEUE).toHaveLength(0);
        // setup 前先按名字注销同名工具（14），unregister 再注销一次（14）
        expect(unregistered.length).toBe(28);
    });

    test('重复 register 不重复入队', () => {
        globalThis.MCP_QUEUE = [];
        mcpIndex.registerMcpTools();
        mcpIndex.registerMcpTools();
        expect(globalThis.MCP_QUEUE).toHaveLength(1);
        mcpIndex.unregisterMcpTools();
    });

    test('MCP 已先加载时立即注册，不依赖队列再次 drain', () => {
        globalThis.MCP_QUEUE = [];
        const registered = [];
        globalThis.MCP = {
            z: schema(),
            registerTool: function (spec) { registered.push(spec); return function () {}; },
            unregisterTool: function () {},
            createJsonResult: function (obj) { return obj; },
        };

        mcpIndex.registerMcpTools();
        expect(registered).toHaveLength(14);
        expect(registered[0].name).toBe('machine_max_bb_plugin_get_context');

        // 队列条目仍在；MCP 后续 drain 时会幂等重注册
        expect(globalThis.MCP_QUEUE).toHaveLength(1);
        globalThis.MCP_QUEUE[0].setup(globalThis.MCP);
        expect(registered).toHaveLength(28);
        mcpIndex.unregisterMcpTools();
    });

    test('MCP 后加载时由 loaded_plugin 事件补注册', () => {
        globalThis.MCP_QUEUE = [];
        let loadedHandler = null;
        global.Blockbench = {
            on: function (name, fn) {
                if (name === 'loaded_plugin') loadedHandler = fn;
                return function () {};
            },
            dispatchEvent: function () {},
        };
        const registered = [];
        globalThis.MCP = null;
        mcpIndex.registerMcpTools();
        expect(registered).toHaveLength(0);
        expect(typeof loadedHandler).toBe('function');

        globalThis.MCP = {
            z: schema(),
            registerTool: function (spec) { registered.push(spec); return function () {}; },
            unregisterTool: function () {},
            createJsonResult: function (obj) { return obj; },
        };
        loadedHandler({ plugin: { id: 'mcp' } });
        expect(registered).toHaveLength(14);
        mcpIndex.unregisterMcpTools();
    });
});
