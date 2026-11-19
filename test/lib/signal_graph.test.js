'use strict';

const { describe, test, expect } = require('bun:test');
const { extractSignalGraph } = require('../../src/lib/signal_graph.js');

describe('lib/signal_graph 哨兵节点', () => {
    test('local / global 创建 special 节点，旧 subpart 创建 unresolved 节点', () => {
        const variant = {
            sub_parts: {
                sp: {
                    subsystems: {
                        'subsystem.machine_max.engine': {
                            type: 'machine_max:engine',
                            speed_outputs: {
                                engine_speed: ['local', 'global', 'subpart'],
                            },
                        },
                    },
                },
            },
        };

        const graph = extractSignalGraph(variant);
        const byId = {};
        for (const node of graph.nodes) byId[node.id] = node;

        expect(byId.local.type).toBe('special');
        expect(byId.global.type).toBe('special');
        expect(byId.subpart.type).toBe('unresolved');
    });

    test('发现表（*_discovery_targets）画成 discovery 边，与命令输出分开', () => {
        const variant = {
            sub_parts: {
                sp: {
                    subsystems: {
                        'subsystem.machine_max.wc': {
                            type: 'machine_max:weapon_controller',
                            control_outputs: { weapon_control: ['subsystem.machine_max.driver'] },
                            camera_discovery_targets: { gunner_sight: ['subsystem.machine_max.sight'] },
                        },
                        'subsystem.machine_max.driver': { type: 'machine_max:turret_driver' },
                        'subsystem.machine_max.sight': { type: 'machine_max:sight' },
                    },
                },
            },
        };

        const graph = extractSignalGraph(variant);
        const byChannel = {};
        for (const edge of graph.edges) byChannel[edge.channel] = edge;

        expect(byChannel.weapon_control.type).toBe('control');
        expect(byChannel.gunner_sight.type).toBe('discovery');
        expect(byChannel.gunner_sight.to).toBe('subsystem.machine_max.sight');
    });
});
