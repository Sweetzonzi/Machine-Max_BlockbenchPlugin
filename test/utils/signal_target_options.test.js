'use strict';

const { describe, test, expect } = require('bun:test');
const { buildSignalTargetOptions } = require('../../src/utils/signal_target_options.js');

describe('utils/signal_target_options', () => {
    test('固定输出 local / global，并追加连接点、子系统、交互区', () => {
        const options = buildSignalTargetOptions({
            connectors: { 'connector.machine_max.hatch': {} },
            subsystems: { 'subsystem.machine_max.engine': {} },
            interact_boxes: { 'interact.machine_max.door': {} },
        }, 'machine_max');

        expect(options.slice(0, 2)).toEqual([
            { value: 'local', label: 'local' },
            { value: 'global', label: 'global' },
        ]);
        const values = options.map((o) => o.value);
        expect(values).toContain('connector.machine_max.hatch');
        expect(values).toContain('subsystem.machine_max.engine');
        expect(values).toContain('interact.machine_max.door');
    });

    test('空子零件仍返回两个哨兵，且不再输出 subpart / vehicle', () => {
        const options = buildSignalTargetOptions(null, 'machine_max');
        expect(options).toEqual([
            { value: 'local', label: 'local' },
            { value: 'global', label: 'global' },
        ]);
    });

    test('跨 map 重名只保留一条', () => {
        const options = buildSignalTargetOptions({
            connectors: { shared: {} },
            interact_boxes: { shared: {} },
        }, 'machine_max');
        expect(options.filter((o) => o.value === 'shared')).toHaveLength(1);
    });
});
