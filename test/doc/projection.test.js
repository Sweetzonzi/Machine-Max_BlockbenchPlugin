'use strict';

const { describe, test, expect, beforeEach } = require('bun:test');
const projection = require('../../src/doc/projection.js');
const helpers = require('../helpers.js');
const mock = require('../mocks/blockbench.js');

const BONES = [
    { uuid: '11111111-1111-1111-1111-111111111111', name: 'hull' },
    { uuid: '22222222-2222-2222-2222-222222222222', name: 'hatch' },
    { uuid: '33333333-3333-3333-3333-333333333333', name: '底盘骨骼' },
    { uuid: '77777777-7777-7777-7777-777777777777', name: 'con' },
];

function definitionOnly(node, kind) {
    return projection.projectOut(node, { kind: kind || 'part' }, { for: 'read' })
        .definition;
}

beforeEach(() => {
    mock.installBones(BONES);
});

describe('doc/projection.in', () => {
    test('单变体简写按 model 字段判定，变体名 model 不被吞掉', () => {
        const single = {
            namespace: 'machine_max',
            variants: {
                model: 'machine_max:model/hull',
                textures: { default: 'machine_max:textures/hull' },
                tags: [],
                sub_parts: {},
            },
        };
        const wrapped = projection.normalizeShorthand('part', single, {
            namespace: 'machine_max',
        });
        expect(Object.keys(wrapped.variants)).toEqual(['default']);

        const namedModel = {
            namespace: 'machine_max',
            variants: {
                model: {
                    model: 'machine_max:model/hull',
                    textures: { default: 'machine_max:textures/hull' },
                    tags: [],
                    sub_parts: {},
                },
            },
        };
        const map = projection.normalizeShorthand('part', namedModel, {
            namespace: 'machine_max',
        });
        expect(Object.keys(map.variants)).toEqual(['model']);
    });

    test('单子零件简写落到 sub_part.<ns>.main', () => {
        const definition = {
            model: 'machine_max:model/hull',
            textures: { default: 'machine_max:textures/hull' },
            tags: [],
            sub_parts: {
                mass: 12,
                start_bone: 'hull',
            },
        };
        const normalized = projection.normalizeShorthand('variant', definition, {
            namespace: 'machine_max',
        });
        expect(Object.keys(normalized.sub_parts)).toEqual(['sub_part.machine_max.main']);
    });

    test('非规范 key {chassis:{...}} 返回 invalid_format，不被吞成 default', () => {
        const definition = {
            model: 'machine_max:model/hull',
            textures: { default: 'machine_max:textures/hull' },
            tags: [],
            sub_parts: {
                chassis: { mass: 1 },
            },
        };
        const result = projection.projectIn(definition, {
            kind: 'variant',
            namespace: 'machine_max',
            partId: 'hull',
            variantName: 'default',
            mode: 'create',
            parentPath: ['parts', 'hull', 'variants', 'default'],
        });
        expect(result.ok).toBe(false);
        expect(result.errors[0].code).toBe('invalid_format');
    });

    test('textures 字符串归一化为 map', () => {
        const definition = {
            model: 'machine_max:model/hull',
            textures: 'machine_max:textures/hull',
            tags: [],
            sub_parts: {},
        };
        const result = projection.projectIn(definition, {
            kind: 'variant',
            namespace: 'machine_max',
            partId: 'hull',
            variantName: 'default',
            mode: 'create',
        });
        expect(result.ok).toBe(true);
        expect(result.node.textures).toEqual({ default: 'machine_max:textures/hull' });
    });

    test('required 占位 / null / "null" 归一化', () => {
        const definition = {
            type: 'machine_max:engine',
            definition: null,
            power_output: 'null',
            speed_outputs: {},
        };
        const result = projection.projectIn(definition, {
            kind: 'subsystem',
            namespace: 'machine_max',
            partId: 'hull',
            variantName: 'default',
            subPartKey: 'sub_part.machine_max.main',
            mode: 'create',
        });
        expect(result.ok).toBe(true);
        expect(result.node.definition).toBe('');
        expect(result.node.power_output).toBe('');
    });

    test('required map 的 null / [] 归一化与默认值', () => {
        const definition = {
            type: 'machine_max:regen_loader',
            definition: 'machine_max:regen_loader',
            projectile_types: [],
            discovery_outputs: {},
        };
        const result = projection.projectIn(definition, {
            kind: 'subsystem',
            namespace: 'machine_max',
            partId: 'hull',
            variantName: 'default',
            subPartKey: 'sub_part.machine_max.main',
            mode: 'create',
        });
        expect(result.ok).toBe(true);
        expect(result.node.projectile_types).toEqual({});
    });

    test('hit_boxes 骨骼名 → UUID；未解析保留并进 unresolved', () => {
        const definition = helpers.createConfig().parts.hull;
        const sp = definition.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.hit_boxes = {
            hull: sp.hit_boxes['11111111-1111-1111-1111-111111111111'],
            '不存在骨骼': { id: 'part', type: 'box' },
        };
        const result = projection.projectIn(definition, {
            kind: 'part',
            namespace: 'machine_max',
            partId: 'hull',
            mode: 'create',
            parentPath: ['parts', 'hull'],
        });
        expect(result.ok).toBe(true);
        const outSp = result.node.variants.default.sub_parts['sub_part.machine_max.main'];
        expect(outSp.hit_boxes['11111111-1111-1111-1111-111111111111']).toBeDefined();
        expect(outSp.hit_boxes['不存在骨骼']).toBeDefined();
        expect(result.unresolved.bones.some((b) => b.field === 'hit_box_key')).toBe(true);
    });

    test('invalid_enum 在 decode 之后被 validateValues 拒绝', () => {
        const definition = helpers.createConfig().parts.hull;
        const sp = definition.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.hit_boxes['11111111-1111-1111-1111-111111111111'].type = 'banana';
        const result = projection.projectIn(definition, {
            kind: 'part',
            namespace: 'machine_max',
            partId: 'hull',
            mode: 'create',
            parentPath: ['parts', 'hull'],
        });
        expect(result.ok).toBe(false);
        expect(result.errors.some((e) => e.code === 'invalid_enum')).toBe(true);
    });

    test('配置引用断裂返回 unresolved_config_ref', () => {
        const definition = helpers.createConfig().parts.hull;
        const sp = definition.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.subsystems['subsystem.machine_max.engine'].power_output = 'connector.machine_max.missing';
        const result = projection.projectIn(definition, {
            kind: 'part',
            namespace: 'machine_max',
            partId: 'hull',
            mode: 'create',
            parentPath: ['parts', 'hull'],
        });
        expect(result.ok).toBe(false);
        expect(result.errors.some((e) => e.code === 'unresolved_config_ref')).toBe(true);
    });

    test('reset_fields 只算顶层，不递归', () => {
        const existing = helpers.createPart();
        const definition = helpers.createPart();
        delete definition.icon;
        delete definition.variants.default.tags;
        const result = projection.projectIn(definition, {
            kind: 'part',
            namespace: 'machine_max',
            partId: 'hull',
            mode: 'replace',
            parentPath: ['parts', 'hull'],
            existing: existing,
        });
        expect(result.ok).toBe(true);
        expect(result.reset_fields).toEqual(['icon']);
    });

    test('reset_fields 把显式 null 视为已提供（即使归一化删除）', () => {
        const existing = helpers.createVariant({ animations: 'machine_max:run' });
        const definition = {
            model: 'machine_max:model/hull',
            textures: null,
            tags: [],
            sub_parts: {},
        };
        const result = projection.projectIn(definition, {
            kind: 'variant',
            namespace: 'machine_max',
            partId: 'hull',
            variantName: 'default',
            mode: 'replace',
            existing: existing,
            parentPath: ['parts', 'hull', 'variants', 'default'],
        });
        expect(result.ok).toBe(true);
        expect(result.reset_fields).toEqual(['animations']);
    });

    test('markerPlan 覆盖 4 类标记并按优先级去重', () => {
        const definition = helpers.createPart();
        const sp = definition.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.hit_boxes = {
            '底盘骨骼': { id: 'part', type: 'box', overwrite: null },
        };
        sp.interact_boxes['interact.machine_max.door'].bone = 'hatch';
        sp.connectors['connector.machine_max.hatch'].locator = 'con';
        const result = projection.projectIn(definition, {
            kind: 'part',
            namespace: 'machine_max',
            partId: 'hull',
            mode: 'create',
            parentPath: ['parts', 'hull'],
        });
        expect(result.ok).toBe(true);
        const types = result.markerPlan.map((m) => m.type).sort();
        expect(types).toContain('sub_part');
        expect(types).toContain('hit_box');
        expect(types).toContain('interact_box');
        expect(types).toContain('connector');
        expect(result.markerPlan.every((m) => m.partId === 'hull')).toBe(true);
    });

    test('markerCleanup 的 sub_part 级包含旧 config_refs / uuids', () => {
        const existing = helpers.createSubPart();
        const result = projection.projectIn(helpers.createSubPart(), {
            kind: 'sub_part',
            namespace: 'machine_max',
            partId: 'hull',
            variantName: 'default',
            subPartKey: 'sub_part.machine_max.main',
            oldKey: 'sub_part.machine_max.old',
            mode: 'rename',
            existing: existing,
        });
        expect(result.ok).toBe(true);
        expect(result.markerCleanup.scope).toBe('sub_part');
        expect(result.markerCleanup.config_refs).toContain('sub_part.machine_max.old');
        expect(result.markerCleanup.config_refs).toContain('connector.machine_max.hatch');
        expect(result.markerCleanup.uuids).toContain('11111111-1111-1111-1111-111111111111');
        expect(result.markerCleanup.uuids).toContain('22222222-2222-2222-2222-222222222222');
    });
});

describe('doc/projection.out / round-trip', () => {
    test('read 模式剥内部字段、hit_boxes UUID→骨骼名、保持 map', () => {
        const config = helpers.createConfig();
        const part = config.parts.hull;
        const out = projection.projectOut(part, { kind: 'part' }, { for: 'read' });
        expect(out.definition.element_markers).toBeUndefined();
        expect(out.definition._uiState).toBeUndefined();
        const sp = out.definition.variants.default.sub_parts['sub_part.machine_max.main'];
        expect(sp.hit_boxes.hull).toBeDefined();
        expect(sp.interact_boxes['interact.machine_max.door']._uuid).toBeUndefined();
        expect(sp.connectors['connector.machine_max.hatch']._marker_uuid).toBeUndefined();
        expect(Object.keys(out.definition.variants)).toEqual(['default']);
    });

    test('round-trip：in(out(node)) 结构等价且 reset_fields 为空', () => {
        const config = helpers.createConfig();
        const part = config.parts.hull;
        const sp = part.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.hydrodynamics = {};
        sp.subsystems['subsystem.machine_max.engine'].definition = '';
        sp.subsystems['subsystem.machine_max.engine'].speed_outputs = {};
        sp.interact_boxes['interact.machine_max.door'].signal_targets = {};
        const first = definitionOnly(part);
        const result = projection.projectIn(first, {
            kind: 'part',
            namespace: 'machine_max',
            partId: 'hull',
            variantName: 'default',
            mode: 'replace',
            existing: part,
            parentPath: ['parts', 'hull'],
        });
        expect(result.ok).toBe(true);
        expect(result.reset_fields).toEqual([]);
        const second = definitionOnly(result.node);
        expect(second).toEqual(first);
    });

    test('export 模式折叠单变体 / textures，但 sub_parts 永不折叠', () => {
        const config = helpers.createConfig();
        const menu = config.parts.hull.variants.default.textures;
        expect(menu).toEqual({ default: 'machine_max:textures/hull' });
        const out = projection.projectOut(config.parts.hull, { kind: 'part' }, { for: 'export' });
        expect(Array.isArray(out.definition.variants)).toBe(false);
        expect(out.definition.variants.model).toBe('machine_max:model/hull');
        expect(out.definition.variants.textures).toBe('machine_max:textures/hull');
        expect(Object.keys(out.definition.variants.sub_parts))
            .toEqual(['sub_part.machine_max.main']);
    });

    test('read 模式保留 required 空字符串与空 map', () => {
        const config = helpers.createConfig();
        const sp = config.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.subsystems = {
            'subsystem.machine_max.transmission': {
                type: 'machine_max:transmission',
                definition: '',
                power_outputs: {},
            },
        };
        const out = projection.projectOut(config.parts.hull, { kind: 'part' }, { for: 'read' });
        const sub = out.definition.variants.default.sub_parts['sub_part.machine_max.main']
            .subsystems['subsystem.machine_max.transmission'];
        expect(sub.definition).toBe('');
        expect(sub.power_outputs).toEqual({});
    });

    test('round-trip 覆盖 definition:"" / 空 required map / 未解析骨骼', () => {
        const config = helpers.createConfig();
        const part = config.parts.hull;
        part.variants.default.model = 'machine_max:model/hull';
        const sp = part.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.hydrodynamics = {};
        sp.hit_boxes['11111111-1111-1111-1111-111111111111'].subsystem = '';
        sp.interact_boxes['interact.machine_max.door'].signal_targets = {};
        sp.connectors['connector.machine_max.hatch'].definition = '';
        sp.connectors['connector.machine_max.hatch'].signal_targets = {};
        sp.subsystems = {
            'subsystem.machine_max.engine': {
                type: 'machine_max:engine',
                definition: '',
                power_output: '',
                speed_outputs: {},
            },
            'subsystem.machine_max.transmission': {
                type: 'machine_max:transmission',
                definition: '',
                power_outputs: {},
            },
            'subsystem.machine_max.regen_loader': {
                type: 'machine_max:regen_loader',
                definition: '',
                projectile_types: {},
                belt_label: '',
                discovery_outputs: {},
            },
            'subsystem.machine_max.launcher': {
                type: 'machine_max:launcher',
                definition: '',
                locator: '',
                fire_animation: 'fire',
                ammo_outputs: {},
            },
        };

        const first = definitionOnly(part);
        const result = projection.projectIn(first, {
            kind: 'part',
            namespace: 'machine_max',
            partId: 'hull',
            variantName: 'default',
            mode: 'replace',
            existing: part,
            parentPath: ['parts', 'hull'],
        });
        expect(result.ok).toBe(true);
        expect(result.reset_fields).toEqual([]);
        expect(result.unresolved.bones).toEqual([]);
        expect(definitionOnly(result.node)).toEqual(first);
    });

    test('export 保留 required 空字符串与 required 空 map', () => {
        const config = helpers.createConfig();
        const part = config.parts.hull;
        const sp = part.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.interact_boxes['interact.machine_max.door'].signal_targets = {};
        sp.subsystems = {
            'subsystem.machine_max.basic': {
                type: 'machine_max:basic',
                definition: '',
            },
            'subsystem.machine_max.transmission': {
                type: 'machine_max:transmission',
                definition: '',
                power_outputs: {},
            },
            'subsystem.machine_max.car_controller': {
                type: 'machine_max:car_controller',
                definition: '',
                control_outputs: {},
            },
            'subsystem.machine_max.regen_loader': {
                type: 'machine_max:regen_loader',
                definition: '',
                projectile_types: {},
                belt_label: '',
                discovery_outputs: {},
            },
        };

        const out = projection.projectOut(part, { kind: 'part' }, { for: 'export' });
        expect(out.errors).toBeUndefined();
        const spOut = out.definition.variants.sub_parts['sub_part.machine_max.main'];
        const subsystems = spOut.subsystems;

        expect(spOut.interact_boxes['interact.machine_max.door'].signal_targets).toEqual({});
        expect(subsystems['subsystem.machine_max.basic'].definition).toBe('');
        expect(subsystems['subsystem.machine_max.transmission'].power_outputs).toEqual({});
        expect(subsystems['subsystem.machine_max.car_controller'].control_outputs).toEqual({});
        expect(subsystems['subsystem.machine_max.regen_loader'].projectile_types).toEqual({});
    });

    test('out 不修改内部树', () => {
        const config = helpers.createConfig();
        const before = helpers.deepClone(config.parts.hull);
        projection.projectOut(config.parts.hull, { kind: 'part' }, { for: 'read' });
        expect(config.parts.hull).toEqual(before);
    });
});
