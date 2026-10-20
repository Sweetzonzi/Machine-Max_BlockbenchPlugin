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

function scAddSignal(node, channel, target) {
    if (!node.signal_targets) node.signal_targets = {};
    node.signal_targets[channel] = [target];
}
