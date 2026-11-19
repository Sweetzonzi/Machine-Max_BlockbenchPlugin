'use strict';

const { describe, test, expect, beforeEach } = require('bun:test');
const refs = require('../../src/doc/refs.js');
const helpers = require('../helpers.js');
const mock = require('../mocks/blockbench.js');

const BONES = [
    { uuid: '11111111-1111-1111-1111-111111111111', name: 'hull' },
    { uuid: '22222222-2222-2222-2222-222222222222', name: 'hatch' },
    { uuid: '55555555-5555-5555-5555-555555555555', name: 'wheel' },
];

function spOf(config) {
    return config.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
}

beforeEach(() => {
    mock.installBones(BONES);
});

describe('doc/refs 13 行引用矩阵', () => {
    test('resolveConfigRefs：local/global 放行，part/subpart/vehicle 断裂', () => {
        const config = helpers.createConfig();
        const sp = spOf(config);
        sp.connectors['connector.machine_max.hatch'].signal_targets = {
            ch: ['subsystem.machine_max.engine', 'local', 'global', 'part', 'subpart', 'vehicle'],
        };
        const result = refs.resolveConfigRefs(config, {
            partId: 'hull',
            variantName: 'default',
            subPartKey: 'sub_part.machine_max.main',
        });
        expect(result.ok).toBe(false);
        const targets = result.dangling.map((d) => d.target).sort();
        expect(targets).toEqual(['part', 'subpart', 'vehicle']);
    });

    test('第 5/6/7 行：signal_targets 重命名与清理', () => {
        const config = helpers.createConfig();
        const sp = spOf(config);
        scAddSignal(sp.subsystems['subsystem.machine_max.engine'], 'a', 'subsystem.machine_max.engine');
        scAddSignal(sp.connectors['connector.machine_max.hatch'], 'b', 'subsystem.machine_max.engine');
        scAddSignal(sp.interact_boxes['interact.machine_max.door'], 'c', 'subsystem.machine_max.engine');

        const renamed = refs.renameRefs(config, {
            kind: 'subsystem',
            oldKey: 'subsystem.machine_max.engine',
            newKey: 'subsystem.machine_max.engine_2',
        });
        expect(renamed.changed > 0).toBe(true);
        expect(sp.subsystems['subsystem.machine_max.engine'].signal_targets.a)
            .toEqual(['subsystem.machine_max.engine_2']);
        expect(sp.connectors['connector.machine_max.hatch'].signal_targets.b)
            .toEqual(['subsystem.machine_max.engine_2']);
        expect(sp.interact_boxes['interact.machine_max.door'].signal_targets.c)
            .toEqual(['subsystem.machine_max.engine_2']);

        refs.cleanDangling(config, { target: 'subsystem.machine_max.engine_2' });
        expect(sp.subsystems['subsystem.machine_max.engine'].signal_targets.a).toEqual([]);
        expect(sp.connectors['connector.machine_max.hatch'].signal_targets.b).toEqual([]);
        expect(sp.interact_boxes['interact.machine_max.door'].signal_targets.c).toEqual([]);
    });

    test('overwrite.required_tags 是标签、不是信号表（按形状识别会误伤）', () => {
        const config = helpers.createConfig();
        const sp = spOf(config);
        const conn = sp.connectors['connector.machine_max.hatch'];
        conn.overwrite = { required_tags: ['machine_max:hull'] };

        const result = refs.resolveConfigRefs(config, {
            partId: 'hull',
            variantName: 'default',
            subPartKey: 'sub_part.machine_max.main',
        });
        expect(result.dangling).toEqual([]);

        // 删除 / 重命名同名条目时不能顺手改掉标签
        refs.cleanDangling(config, { target: 'machine_max:hull' });
        expect(conn.overwrite.required_tags).toEqual(['machine_max:hull']);
        refs.renameRefs(config, {
            kind: 'subsystem',
            oldKey: 'machine_max:hull',
            newKey: 'machine_max:hull_2',
        });
        expect(conn.overwrite.required_tags).toEqual(['machine_max:hull']);
    });

    test('第 8/9 行：power_target / power_output', () => {
        const config = helpers.createConfig();
        const sp = spOf(config);
        sp.subsystems['subsystem.machine_max.engine'].power_output = 'subsystem.machine_max.engine';
        sp.connectors['connector.machine_max.hatch'].power_target = 'subsystem.machine_max.engine';

        let result = refs.cleanDangling(config, { target: 'subsystem.machine_max.engine' });
        expect(sp.connectors['connector.machine_max.hatch'].power_target).toBe('');
        expect(sp.subsystems['subsystem.machine_max.engine'].power_output).toBe('');
        expect(result.cleaned_references.some((r) => r.kind === 'power_target')).toBe(true);
        expect(result.cleaned_references.some((r) => r.kind === 'power_output')).toBe(true);
    });

    test('第 10 行：hit_boxes[*].subsystem', () => {
        const config = helpers.createConfig();
        const sp = spOf(config);
        const hbKey = Object.keys(sp.hit_boxes)[0];
        sp.hit_boxes[hbKey].subsystem = 'subsystem.machine_max.engine';
        refs.renameRefs(config, {
            kind: 'subsystem',
            oldKey: 'subsystem.machine_max.engine',
            newKey: 'subsystem.machine_max.engine_2',
        });
        expect(sp.hit_boxes[hbKey].subsystem).toBe('subsystem.machine_max.engine_2');
        refs.cleanDangling(config, { target: 'subsystem.machine_max.engine_2' });
        expect(sp.hit_boxes[hbKey].subsystem).toBe('');
    });

    test('第 11 行：subsystems[*].connector', () => {
        const config = helpers.createConfig();
        const sp = spOf(config);
        sp.subsystems['subsystem.machine_max.wheel_driver'] = {
            type: 'machine_max:wheel_driver',
            definition: 'machine_max:wheel_driver',
            connector: 'connector.machine_max.hatch',
            roll_speed_outputs: {},
            steering_angle_outputs: {},
        };
        refs.renameRefs(config, {
            kind: 'connector',
            oldKey: 'connector.machine_max.hatch',
            newKey: 'connector.machine_max.hatch_2',
        });
        expect(sp.subsystems['subsystem.machine_max.wheel_driver'].connector)
            .toBe('connector.machine_max.hatch_2');
        refs.cleanDangling(config, { target: 'connector.machine_max.hatch_2' });
        expect(sp.subsystems['subsystem.machine_max.wheel_driver'].connector).toBe('');
    });

    test('第 13 行：power_outputs 的 key 当作引用', () => {
        const config = helpers.createConfig();
        const sp = spOf(config);
        sp.subsystems['subsystem.machine_max.transmission'] = {
            type: 'machine_max:transmission',
            definition: 'machine_max:transmission',
            power_outputs: {
                'subsystem.machine_max.engine': 2.5,
                'connector.machine_max.hatch': 1,
            },
        };
        refs.renameRefs(config, {
            kind: 'subsystem',
            oldKey: 'subsystem.machine_max.engine',
            newKey: 'subsystem.machine_max.engine_2',
        });
        const outputs = sp.subsystems['subsystem.machine_max.transmission'].power_outputs;
        expect(outputs['subsystem.machine_max.engine_2']).toBe(2.5);
        expect(outputs['subsystem.machine_max.engine']).toBeUndefined();

        refs.cleanDangling(config, { target: 'subsystem.machine_max.engine_2' });
        expect(outputs['subsystem.machine_max.engine_2']).toBeUndefined();
        expect(outputs['connector.machine_max.hatch']).toBe(1);
    });

    test('第 1/2/3/4 行：4 类 marker.config_ref 重命名', () => {
        const config = helpers.createConfig();
        const markers = config.parts.hull.element_markers.default;

        refs.renameRefs(config, {
            kind: 'sub_part',
            oldKey: 'sub_part.machine_max.main',
            newKey: 'sub_part.machine_max.main_2',
        });
        expect(markers['11111111-1111-1111-1111-111111111111'].config_ref)
            .toBe('sub_part.machine_max.main_2');
        expect(markers['33333333-3333-3333-3333-333333333333'].config_ref)
            .toBe('sub_part.machine_max.main_2');

        refs.renameRefs(config, {
            kind: 'connector',
            oldKey: 'connector.machine_max.hatch',
            newKey: 'connector.machine_max.hatch_2',
        });
        expect(markers['22222222-2222-2222-2222-222222222222'].config_ref)
            .toBe('connector.machine_max.hatch_2');

        refs.renameRefs(config, {
            kind: 'interact_box',
            oldKey: 'interact.machine_max.door',
            newKey: 'interact.machine_max.door_2',
        });
        expect(markers['44444444-4444-4444-4444-444444444444'].config_ref)
            .toBe('interact.machine_max.door_2');
    });

    test('signal_translations 不计入引用，不被清理/重命名', () => {
        const config = helpers.createConfig();
        const sp = spOf(config);
        const conn = sp.connectors['connector.machine_max.hatch'];
        conn.signal_translations = { 'subsystem.machine_max.engine': 'local' };
        refs.cleanDangling(config, { target: 'subsystem.machine_max.engine' });
        refs.renameRefs(config, {
            kind: 'subsystem',
            oldKey: 'subsystem.machine_max.engine',
            newKey: 'subsystem.machine_max.engine_2',
        });
        expect(conn.signal_translations).toEqual({ 'subsystem.machine_max.engine': 'local' });
    });

    test('resolveBones 区分 resolved / unresolved，包含 hit_boxes 双形 key', () => {
        const sp = helpers.createSubPart({
            start_bone: 'hull',
            end_bones: ['missing_end'],
            mass_center: 'hatch',
            hit_boxes: {
                '11111111-1111-1111-1111-111111111111': {},
                'wheel': {},
                '未知': {},
            },
        });
        const result = refs.resolveBones('sub_part', sp);
        expect(result.resolved.some((r) => r.field === 'start_bone')).toBe(true);
        expect(result.unresolved.some((r) => r.bone === 'missing_end')).toBe(true);
        expect(result.unresolved.some((r) => r.bone === '未知')).toBe(true);
        expect(result.resolved.some((r) => r.field === 'hit_box_key' && r.uuid
            === '11111111-1111-1111-1111-111111111111')).toBe(true);
    });
});

describe('doc/refs 信号目标作用域 = 整个 Part', () => {
    const GUN = 'sub_part.machine_max.gun';

    /** 给 hull/default 加第二个子零件：连接点 ring + 子系统 aux_engine */
    function withGunSubPart(config) {
        const variant = config.parts.hull.variants.default;
        variant.sub_parts[GUN] = helpers.createSubPart({
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
                    _marker_uuid: '55555555-5555-5555-5555-555555555555',
                },
            },
            subsystems: {
                'subsystem.machine_max.aux_engine': {
                    type: 'machine_max:engine',
                    definition: 'machine_max:engine',
                    power_output: '',
                    speed_outputs: {},
                },
            },
        });
        return variant;
    }

    test('跨子零件的子系统目标命中（不再判断裂）', () => {
        const config = helpers.createConfig();
        withGunSubPart(config);
        const sp = spOf(config);
        sp.subsystems['subsystem.machine_max.engine'].speed_outputs = {
            engine_speed: ['subsystem.machine_max.aux_engine'],
        };

        const result = refs.resolveConfigRefs(config, {
            partId: 'hull',
            variantName: 'default',
            subPartKey: 'sub_part.machine_max.main',
        });
        expect(result.ok).toBe(true);
        expect(result.dangling).toEqual([]);
        expect(result.resolved.some((r) => r.target === 'subsystem.machine_max.aux_engine')).toBe(true);
    });

    test('跨子零件的连接点目标命中（连接点本来就是合法目标）', () => {
        const config = helpers.createConfig();
        withGunSubPart(config);
        const sp = spOf(config);
        sp.connectors['connector.machine_max.hatch'].signal_targets = {
            ch: ['connector.machine_max.ring', 'subsystem.machine_max.aux_engine'],
        };

        const result = refs.resolveConfigRefs(config, {
            partId: 'hull',
            variantName: 'default',
            subPartKey: 'sub_part.machine_max.main',
        });
        expect(result.ok).toBe(true);
        expect(result.dangling).toEqual([]);
        const targets = result.resolved.map((r) => r.target);
        expect(targets).toContain('connector.machine_max.ring');
        expect(targets).toContain('subsystem.machine_max.aux_engine');
    });

    test('目标写成交互区 → invalid（交互区只发不收），不算断裂', () => {
        const config = helpers.createConfig();
        const sp = spOf(config);
        sp.connectors['connector.machine_max.hatch'].signal_targets = {
            ch: ['interact.machine_max.door'],
        };

        const result = refs.resolveConfigRefs(config, {
            partId: 'hull',
            variantName: 'default',
            subPartKey: 'sub_part.machine_max.main',
        });
        expect(result.ok).toBe(true);
        expect(result.dangling).toEqual([]);
        expect(result.invalid).toHaveLength(1);
        expect(result.invalid[0].target).toBe('interact.machine_max.door');
        expect(result.invalid[0].reason).toBe('interact_box_only_sends');
    });

    test('功率 / 碰撞箱 / 子系统连接点引用仍只在同子零件内解析', () => {
        const config = helpers.createConfig();
        withGunSubPart(config);
        const sp = spOf(config);
        sp.subsystems['subsystem.machine_max.engine'].power_output = 'subsystem.machine_max.aux_engine';
        sp.connectors['connector.machine_max.hatch'].power_target = 'connector.machine_max.ring';
        const hbKey = Object.keys(sp.hit_boxes)[0];
        sp.hit_boxes[hbKey].subsystem = 'subsystem.machine_max.aux_engine';

        const result = refs.resolveConfigRefs(config, {
            partId: 'hull',
            variantName: 'default',
            subPartKey: 'sub_part.machine_max.main',
        });
        expect(result.ok).toBe(false);
        expect(result.dangling.map((r) => r.kind).sort()).toEqual([
            'hit_box_subsystem', 'power_output', 'power_target',
        ]);
    });

    test('非信号引用按类别限定目标种类：交互区与错类都不算命中', () => {
        const config = helpers.createConfig();
        const sp = spOf(config);
        sp.connectors['connector.machine_max.hatch'].power_target = 'interact.machine_max.door';
        sp.subsystems['subsystem.machine_max.engine'].connector = 'interact.machine_max.door';
        const hbKey = Object.keys(sp.hit_boxes)[0];
        // 连接点不是子系统：hit_boxes[*].subsystem 只接子系统
        sp.hit_boxes[hbKey].subsystem = 'connector.machine_max.hatch';

        const result = refs.resolveConfigRefs(config, {
            partId: 'hull',
            variantName: 'default',
            subPartKey: 'sub_part.machine_max.main',
        });
        expect(result.ok).toBe(false);
        expect(result.dangling.map((r) => r.kind).sort()).toEqual([
            'connector', 'hit_box_subsystem', 'power_target',
        ]);
    });

    test('partTargetsOf：摊平整个变体，owner 记录声明子零件', () => {
        const config = helpers.createConfig();
        withGunSubPart(config);
        const targets = refs.partTargetsOf(config.parts.hull.variants.default.sub_parts);
        expect(targets.subsystem['subsystem.machine_max.aux_engine']).toBe(true);
        expect(targets.connector['connector.machine_max.ring']).toBe(true);
        expect(targets.owner['subsystem.machine_max.aux_engine']).toBe(GUN);
        expect(targets.owner['subsystem.machine_max.engine']).toBe('sub_part.machine_max.main');
    });

    test('siblingSubParts：从配置路径取同变体子零件表', () => {
        const config = helpers.createConfig();
        withGunSubPart(config);
        const siblings = refs.siblingSubParts(config, [
            'parts', 'hull', 'variants', 'default', 'sub_parts', 'sub_part.machine_max.main',
        ]);
        expect(Object.keys(siblings).sort()).toEqual([GUN, 'sub_part.machine_max.main']);
        expect(refs.siblingSubParts(config, ['parts', 'missing'])).toBeNull();
        expect(refs.siblingSubParts(config, null)).toBeNull();
    });

    test('camera_discovery_targets 也是信号表：跨子零件解析', () => {
        const config = helpers.createConfig();
        withGunSubPart(config);
        const sp = spOf(config);
        sp.subsystems['subsystem.machine_max.wc'] = {
            type: 'machine_max:weapon_controller',
            definition: 'machine_max:basic_weapon_controller',
            control_outputs: {},
            camera_discovery_targets: { camera_sight: ['subsystem.machine_max.aux_engine'] },
            first_hud_layout: 'machine_max:empty',
            third_hud_layout: 'machine_max:empty',
            scope_hud_layout: 'machine_max:empty',
        };

        const result = refs.resolveConfigRefs(config, {
            partId: 'hull',
            variantName: 'default',
            subPartKey: 'sub_part.machine_max.main',
        });
        expect(result.ok).toBe(true);
        expect(result.dangling).toEqual([]);
        expect(result.resolved.some((r) => r.target === 'subsystem.machine_max.aux_engine')).toBe(true);
    });
});

function scAddSignal(node, channel, target) {
    if (!node.signal_targets) node.signal_targets = {};
    node.signal_targets[channel] = [target];
}
