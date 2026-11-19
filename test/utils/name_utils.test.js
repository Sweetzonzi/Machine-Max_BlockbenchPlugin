'use strict';

const { describe, test, expect } = require('bun:test');
const nameUtils = require('../../src/utils/name_utils.js');

describe('utils/name_utils', () => {
    test('parseKey 拆出类型、命名空间与名称段', () => {
        expect(nameUtils.parseKey('sub_part.machine_max.main')).toEqual({
            type: 'sub_part', namespace: 'machine_max', name: 'main',
        });
        expect(nameUtils.parseKey('connector.k17.left_front_wheel')).toEqual({
            type: 'connector', namespace: 'k17', name: 'left_front_wheel',
        });
        // 名称段本身可以带点
        expect(nameUtils.parseKey('subsystem.machine_max.a.b')).toEqual({
            type: 'subsystem', namespace: 'machine_max', name: 'a.b',
        });
    });

    test('parseKey 对不成形的键返回 null', () => {
        expect(nameUtils.parseKey('')).toBeNull();
        expect(nameUtils.parseKey('main')).toBeNull();
        expect(nameUtils.parseKey('sub_part.main')).toBeNull();
        expect(nameUtils.parseKey('sub_part.machine_max')).toBeNull();
        expect(nameUtils.parseKey('sub_part..main')).toBeNull();
        expect(nameUtils.parseKey('other.machine_max.main')).toBeNull();
    });

    test('extractShortName 不依赖传入的工程命名空间', () => {
        // 跨命名空间的键过去会整串返回，导致输入框把完整键当名称段
        expect(nameUtils.extractShortName('sub_part.machine_max.main', 'k17')).toBe('main');
        expect(nameUtils.extractShortName('connector.machine_max.left_front_wheel', 'm1a2_sep'))
            .toBe('left_front_wheel');
        expect(nameUtils.extractShortName('subsystem.2s38.engine', 'k17')).toBe('engine');
        // 不是完整键时原样返回
        expect(nameUtils.extractShortName('engine', 'k17')).toBe('engine');
    });

    test('buildKey 按三段拼接，不做归一化', () => {
        expect(nameUtils.buildKey('sub_part', 'm1a2_sep', 'hull')).toBe('sub_part.m1a2_sep.hull');
        expect(nameUtils.buildKey('interact', 'machine_max', 'seat')).toBe('interact.machine_max.seat');
        expect(nameUtils.buildKey('connector', '', 'x')).toBe('');
    });
});
