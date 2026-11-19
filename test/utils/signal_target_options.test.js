'use strict';

const { describe, test, expect } = require('bun:test');
const { buildSignalTargetOptions, buildPowerTargetOptions } = require('../../src/utils/signal_target_options.js');

describe('utils/signal_target_options', () => {
    test('固定输出 local / global，并追加整个变体的连接点与子系统', () => {
        const options = buildSignalTargetOptions({
            'sub_part.machine_max.main': {
                connectors: { 'connector.machine_max.hatch': {} },
                subsystems: { 'subsystem.machine_max.engine': {} },
            },
            'sub_part.machine_max.gun': {
                connectors: { 'connector.machine_max.ring': {} },
                subsystems: { 'subsystem.machine_max.launcher': {} },
            },
        }, 'machine_max', 'sub_part.machine_max.main');

        expect(options.slice(0, 2)).toEqual([
            { value: 'local', label: 'local' },
            { value: 'global', label: 'global' },
        ]);
        const values = options.map((o) => o.value);
        expect(values).toContain('connector.machine_max.hatch');
        expect(values).toContain('subsystem.machine_max.engine');
        // 跨子零件：同变体的另一个子零件也在候选里
        expect(values).toContain('connector.machine_max.ring');
        expect(values).toContain('subsystem.machine_max.launcher');
    });

    test('空变体仍返回两个哨兵，且不输出 subpart / vehicle', () => {
        expect(buildSignalTargetOptions(null, 'machine_max')).toEqual([
            { value: 'local', label: 'local' },
            { value: 'global', label: 'global' },
        ]);
        expect(buildSignalTargetOptions({}, 'machine_max')).toEqual([
            { value: 'local', label: 'local' },
            { value: 'global', label: 'global' },
        ]);
    });

    test('交互区不进信号目标候选：交互区只发不收', () => {
        const options = buildSignalTargetOptions({
            'sub_part.machine_max.main': {
                interact_boxes: { 'interact.machine_max.door': {} },
            },
        }, 'machine_max');
        expect(options.map((o) => o.value)).not.toContain('interact.machine_max.door');
    });

    test('跨子零件候选的 label 追加子零件短名，同子零件不加', () => {
        const options = buildSignalTargetOptions({
            'sub_part.machine_max.main': {
                subsystems: { 'subsystem.machine_max.engine': {} },
            },
            'sub_part.machine_max.gun': {
                subsystems: { 'subsystem.machine_max.launcher': {} },
            },
        }, 'machine_max', 'sub_part.machine_max.main');

        const engine = options.find((o) => o.value === 'subsystem.machine_max.engine');
        const launcher = options.find((o) => o.value === 'subsystem.machine_max.launcher');
        expect(engine.label).toBe('[子系统]engine');
        expect(launcher.label).toBe('[子系统]launcher · gun');
    });

    test('跨子零件重名只保留一条', () => {
        const options = buildSignalTargetOptions({
            'sub_part.machine_max.main': { connectors: { shared: {} } },
            'sub_part.machine_max.gun': { subsystems: { shared: {} } },
        }, 'machine_max');
        expect(options.filter((o) => o.value === 'shared')).toHaveLength(1);
    });
});

describe('utils/signal_target_options：功率目标只在同子零件', () => {
    test('buildPowerTargetOptions 只给当前子零件的连接点与子系统', () => {
        const subParts = {
            'sub_part.machine_max.main': {
                connectors: { 'connector.machine_max.hatch': {} },
                subsystems: { 'subsystem.machine_max.engine': {} },
            },
            'sub_part.machine_max.gun': {
                connectors: { 'connector.machine_max.ring': {} },
                subsystems: { 'subsystem.machine_max.aux_engine': {} },
            },
        };
        const options = buildPowerTargetOptions(subParts, 'machine_max', 'sub_part.machine_max.main');
        const values = options.map((o) => o.value);
        expect(values).toEqual(['connector.machine_max.hatch', 'subsystem.machine_max.engine']);
        // 没有 local/global 哨兵：功率引用只认真实条目
        expect(values).not.toContain('local');
        expect(values).not.toContain('global');
        expect(values).not.toContain('subsystem.machine_max.aux_engine');
    });

    test('当前子零件不存在时返回空表', () => {
        expect(buildPowerTargetOptions({}, 'machine_max', 'sub_part.machine_max.main')).toEqual([]);
        expect(buildPowerTargetOptions(null, 'machine_max', 'x')).toEqual([]);
    });
});
