'use strict';

// generators/lang_generator 用例
//
// 回归：子零件 / 连接点 / 交互区 / 子系统的 key 是翻译键，命名空间由创作者选择，
// 可以引用模组自带的共享词条（如 sub_part.machine_max.*）而不是本包命名空间。
// 生成 lang 时必须按完整 key 原样输出，且 "main" 在任何命名空间下都不生成词条。

const { describe, test, expect } = require('bun:test');

const { generateAllLangs } = require('../../src/generators/lang_generator.js');

/**
 * 构造一个最小零件树
 *
 * @param {string} ns - config.namespace
 * @param {Object<string, Object>} subParts - variant.sub_parts
 * @returns {Object} projectConfig
 */
function makeConfig(ns, subParts) {
    return {
        namespace: ns,
        parts: {
            hull: { variants: { default: { sub_parts: subParts } } },
        },
    };
}

describe('generators/lang_generator', () => {
    test('跨命名空间的 key 原样生成为翻译键', () => {
        var langs = generateAllLangs(makeConfig('m1a2_sep', {
            'sub_part.machine_max.main': { mass: 1 },
            'sub_part.machine_max.turret': {
                mass: 1,
                interact_boxes: { 'interact.machine_max.seat': {} },
                connectors: { 'connector.2s38.wheel': {} },
                subsystems: { 'subsystem.machine_max.engine': {} },
            },
        }));

        expect(langs.en_us['m1a2_sep.hull']).toBe('Hull');
        expect(langs.en_us['sub_part.machine_max.turret']).toBe('Turret');
        expect(langs.en_us['interact.machine_max.seat']).toBe('Seat');
        expect(langs.en_us['connector.2s38.wheel']).toBe('Wheel');
        expect(langs.en_us['subsystem.machine_max.engine']).toBe('Engine');
    });

    test('"main" 在任何命名空间下都不生成词条', function () {
        var langs = generateAllLangs(makeConfig('m1a2_sep', {
            'sub_part.machine_max.main': { mass: 1 },
            'sub_part.m1a2_sep.main': { mass: 1 },
            'sub_part.m1a2_sep.turret': { mass: 1 },
        }));

        expect(langs.en_us['sub_part.machine_max.main']).toBeUndefined();
        expect(langs.en_us['sub_part.m1a2_sep.main']).toBeUndefined();
        expect(langs.en_us['sub_part.m1a2_sep.turret']).toBe('Turret');
    });

    test('内置包已提供译名的 mm 共享词条不写进本包 lang', function () {
        var langs = generateAllLangs(makeConfig('k17', {
            'sub_part.machine_max.main': { mass: 1 },
            'sub_part.machine_max.turret': {
                mass: 1,
                connectors: {
                    'connector.machine_max.hull_left_road_wheel_01': {},
                    'connector.machine_max.k17_only_mount': {},
                },
                subsystems: { 'subsystem.machine_max.engine': {}, 'subsystem.machine_max.engine_2': {} },
                interact_boxes: { 'interact.machine_max.door': {} },
            },
        }), {
            builtinLang: {
                zh_cn: {
                    'connector.machine_max.hull_left_road_wheel_01': '左第 1 负重轮轮毂',
                    'subsystem.machine_max.engine': '引擎',
                },
                en_us: {
                    'connector.machine_max.hull_left_road_wheel_01': 'Left Road Wheel 1 Hub',
                    'subsystem.machine_max.engine': 'Engine',
                },
            },
        });

        // 内置包有译名 → 跳过，避免用 _toDisplayName 盖掉内置译文
        expect(langs.en_us['connector.machine_max.hull_left_road_wheel_01']).toBeUndefined();
        expect(langs.zh_cn['subsystem.machine_max.engine']).toBeUndefined();
        // 作者自造的 mm 名字（内置包没有）仍要写，否则没有译名
        expect(langs.en_us['connector.machine_max.k17_only_mount']).toBe('K17 Only Mount');
        expect(langs.en_us['subsystem.machine_max.engine_2']).toBe('Engine 2');
        // 本包命名空间的键照旧写
        expect(langs.en_us['interact.machine_max.door']).toBe('Door');
    });

    test('只有一侧语言提供时仍写出：缺语种的词条不算共享译名', function () {
        var langs = generateAllLangs(makeConfig('k17', {
            'sub_part.machine_max.main': {
                mass: 1,
                connectors: { 'connector.machine_max.partial': {} },
            },
        }), {
            builtinLang: { zh_cn: { 'connector.machine_max.partial': '只有中文' } },
        });
        expect(langs.zh_cn['connector.machine_max.partial']).toBe('Partial');
        expect(langs.en_us['connector.machine_max.partial']).toBe('Partial');
    });
});
