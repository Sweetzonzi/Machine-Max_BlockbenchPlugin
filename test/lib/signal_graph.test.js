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
});
