'use strict';

const { describe, test, expect } = require('bun:test');
const naming = require('../../src/core/naming.js');

describe('core/naming', () => {
    test('sub_part 默认名使用 context.namespace', () => {
        expect(naming.generateDefaultName('sub_part', { namespace: 'acme' }))
            .toBe('sub_part.acme.main');
        expect(naming.generateDefaultName('sub_part', {}))
            .toBe('sub_part.machine_max.main');
    });

    test('省略 namespace 时四类实体都默认落到共享词汇 machine_max', () => {
        // 上游车辆包把跨包共享的结构名字（挂点/轴/座位/子系统）放在 machine_max 下，
        // 译名由内置包 lang 提供；调用方不应把 config.namespace 传进来。
        expect(naming.DEFAULT_NAMESPACE).toBe('machine_max');
        expect(naming.generateDefaultName('sub_part'))
            .toBe('sub_part.machine_max.main');
        expect(naming.generateDefaultName('connector', { boneName: 'LeftFrontWheel' }))
            .toBe('connector.machine_max.left_front_wheel');
        expect(naming.generateDefaultName('interact_box', { boneName: 'DoorHandle' }))
            .toBe('interact.machine_max.door_handle');
        expect(naming.generateDefaultName('subsystem', { typeShortName: 'engine' }))
            .toBe('subsystem.machine_max.engine');
    });

    test('保留信号名只有 local / global', () => {
        const variant = { sub_parts: {} };
        for (const name of ['local', 'global']) {
            expect(naming.validateNameUniqueness(variant, 'connector', 'sp', name).valid)
                .toBe(false);
        }
        for (const name of ['subpart', 'vehicle']) {
            expect(naming.validateNameUniqueness(variant, 'connector', 'sp', name).valid)
                .toBe(true);
        }
    });

    test('唯一性作用域是整个变体：跨子零件重名不合法', () => {
        const variant = {
            sub_parts: {
                'sub_part.machine_max.main': {
                    connectors: { 'connector.machine_max.hatch': {} },
                    subsystems: {},
                    interact_boxes: {},
                },
                'sub_part.machine_max.gun': {
                    connectors: {},
                    subsystems: {},
                    interact_boxes: {},
                },
            },
        };
        // 另一个子零件用同名
        expect(naming.validateNameUniqueness(variant, 'connector', 'sub_part.machine_max.gun',
            'connector.machine_max.hatch').valid).toBe(false);
        // 同一个子零件里编辑自身（改名）不算冲突
        expect(naming.validateNameUniqueness(variant, 'connector', 'sub_part.machine_max.main',
            'connector.machine_max.hatch', 'connector.machine_max.hatch').valid).toBe(true);
        // 三类名字共用一套命名空间：把连接点键当子系统键也算重名
        expect(naming.validateNameUniqueness(variant, 'subsystem', 'sub_part.machine_max.gun',
            'connector.machine_max.hatch').valid).toBe(false);
    });

    test('findNamedEntry 返回声明子零件与类别，可排除正在编辑的自身', () => {
        const variant = {
            sub_parts: {
                'sub_part.machine_max.main': {
                    connectors: { 'connector.machine_max.hatch': {} },
                },
                'sub_part.machine_max.gun': {
                    connectors: { 'connector.machine_max.ring': {} },
                },
            },
        };
        expect(naming.findNamedEntry(variant, 'connector.machine_max.ring'))
            .toEqual({
                subPartKey: 'sub_part.machine_max.gun',
                kind: 'connector',
                key: 'connector.machine_max.ring',
            });
        expect(naming.findNamedEntry(variant, 'connector.machine_max.missing'))
            .toBe(null);
        expect(naming.findNamedEntry(variant, 'connector.machine_max.ring', {
            subPartKey: 'sub_part.machine_max.gun',
            excludeKey: 'connector.machine_max.ring',
        })).toBe(null);
    });
});
