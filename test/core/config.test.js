'use strict';

const { describe, test, expect } = require('bun:test');
const { normalizeLegacyPlaceholders, migrateIfNeeded, createHitBoxConfig } = require('../../src/core/config.js');
const { HitBoxCodec } = require('../../src/codec/codecs/hit_box_codec.js');
const { PartCodec } = require('../../src/codec/codecs/part_codec.js');
const { createConfig } = require('../helpers.js');

function legacyConfig() {
    return {
        parts: {
            hull: {
                variants: {
                    default: {
                        model: 'machine_max:model/hull',
                        textures: { default: 'machine_max:textures/hull' },
                        tags: [],
                        sub_parts: {
                            'sub_part.machine_max.main': {
                                start_bone: 'hull',
                                hit_boxes: {
                                    hull: { id: 'part', type: 'box', module: null, subsystem: null },
                                },
                                interact_boxes: {
                                    'interact.machine_max.door': { bone: 'hatch', signal_targets: null },
                                },
                                connectors: {
                                    'connector.machine_max.hatch': {
                                        locator: 'con',
                                        definition: 'null',
                                        power_target: null,
                                        signal_targets: [],
                                    },
                                },
                                subsystems: {
                                    'subsystem.machine_max.engine': {
                                        type: 'machine_max:engine',
                                        definition: null,
                                        power_output: 'null',
                                        speed_outputs: null,
                                    },
                                    'subsystem.machine_max.transmission': {
                                        type: 'machine_max:transmission',
                                        definition: 'machine_max:transmission',
                                        power_outputs: [],
                                    },
                                    'subsystem.machine_max.loader': {
                                        type: 'machine_max:ammo_loader',
                                        definition: 'machine_max:ammo_loader',
                                        ammo_discovery_inputs: null,
                                        ammo_discovery_targets: [],
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    };
}

describe('core/config 旧占位归一化', () => {
    test('required 字符串 / map 归一化，且不修改入参', () => {
        const raw = legacyConfig();
        const before = JSON.parse(JSON.stringify(raw));
        const normalized = normalizeLegacyPlaceholders(raw);

        expect(raw).toEqual(before);
        const sp = normalized.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        expect(sp.hit_boxes.hull.module).toBe('');
        expect(sp.hit_boxes.hull.subsystem).toBe('');
        expect(sp.interact_boxes['interact.machine_max.door'].signal_targets).toEqual({});
        expect(sp.connectors['connector.machine_max.hatch'].definition).toBe('');
        expect(sp.connectors['connector.machine_max.hatch'].power_target).toBe('');
        expect(sp.connectors['connector.machine_max.hatch'].signal_targets).toEqual({});

        const engine = sp.subsystems['subsystem.machine_max.engine'];
        expect(engine.definition).toBe('');
        expect(engine.power_output).toBe('');
        expect(engine.speed_outputs).toEqual({});
        expect(sp.subsystems['subsystem.machine_max.transmission'].power_outputs).toEqual({});
        expect(sp.subsystems['subsystem.machine_max.loader'].ammo_discovery_targets).toEqual({});
    });

    test('migrateIfNeeded 后 PartCodec.encode 不再因旧 null 抛错', () => {
        const migrated = migrateIfNeeded(legacyConfig());
        expect(migrated.parts.hull.variants.default.sub_parts['sub_part.machine_max.main']
            .subsystems['subsystem.machine_max.engine'].definition).toBe('');

        const encoded = PartCodec.encode(migrated.parts.hull);
        const out = encoded.variants.sub_parts
            ? encoded.variants
            : encoded.variants.default;
        const outSp = out.sub_parts['sub_part.machine_max.main'];
        expect(outSp.subsystems['subsystem.machine_max.engine'].definition).toBe('');
        expect(outSp.subsystems['subsystem.machine_max.transmission'].power_outputs).toEqual({});
    });

    test('单变体 / 多变体 map 都遍历到子零件', () => {
        const raw = legacyConfig();
        raw.parts.hull.variants = {
            default: raw.parts.hull.variants.default,
            desert: raw.parts.hull.variants.default,
        };
        const normalized = normalizeLegacyPlaceholders(raw);
        for (const name of ['default', 'desert']) {
            const sp = normalized.parts.hull.variants[name]
                .sub_parts['sub_part.machine_max.main'];
            expect(sp.subsystems['subsystem.machine_max.engine'].definition).toBe('');
        }
    });

    test('ensureDefaults 完整 decode variants：单变体简写 / 变体名恰为 model', () => {
        const shorthand = {
            parts: {
                hull: {
                    variants: {
                        model: 'machine_max:model/hull',
                        sub_parts: {
                            'sub_part.machine_max.main': { mass: 3 },
                        },
                    },
                },
            },
        };
        const migrated = migrateIfNeeded(shorthand);
        const variant = migrated.parts.hull.variants.default;
        expect(variant.model).toBe('machine_max:model/hull');
        // 完整 decode 后子零件默认字段也补齐（P2 前会被整体跳过）
        expect(variant.sub_parts['sub_part.machine_max.main'].start_bone).toBe('');

        const namedModel = {
            parts: {
                hull: {
                    variants: {
                        model: {
                            model: 'machine_max:model/named',
                            sub_parts: {},
                        },
                    },
                },
            },
        };
        const migrated2 = migrateIfNeeded(namedModel);
        expect(migrated2.parts.hull.variants.model).toBeTruthy();
        expect(migrated2.parts.hull.variants.model.model).toBe('machine_max:model/named');
        expect(migrated2.parts.hull.variants.default).toBeUndefined();
    });

    test('退役枚举 block_collision: "ground_hard" 折成 ground + climb_assist', () => {
        const raw = legacyConfig();
        const sp = raw.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.block_collision = 'ground_hard';

        const normalized = normalizeLegacyPlaceholders(raw);
        const outSp = normalized.parts.hull.variants.default
            .sub_parts['sub_part.machine_max.main'];
        expect(outSp.block_collision).toBe('ground');
        expect(outSp.climb_assist).toBe(true);

        // 走完整加载链路（decode 的 ENUM 只认三项，未归一化会抛错）
        const migrated = migrateIfNeeded(raw);
        const loaded = migrated.parts.hull.variants.default
            .sub_parts['sub_part.machine_max.main'];
        expect(loaded.block_collision).toBe('ground');
        expect(loaded.climb_assist).toBe(true);
        expect(PartCodec.encode(migrated.parts.hull)).toBeTruthy();
    });

    test('ground 与 climb_assist 的现有取值不被归一化改动', () => {
        const raw = legacyConfig();
        const sp = raw.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.block_collision = 'ground';
        sp.climb_assist = false;

        const outSp = normalizeLegacyPlaceholders(raw).parts.hull.variants.default
            .sub_parts['sub_part.machine_max.main'];
        expect(outSp.block_collision).toBe('ground');
        expect(outSp.climb_assist).toBe(false);
    });

    test('createHitBoxConfig 使用 HitBoxCodec 作为默认值唯一真源', () => {
        const hb = createHitBoxConfig();
        const decoded = HitBoxCodec.decode({ id: 'part', type: 'box' });
        expect(hb).toEqual(decoded);
        expect(hb.material).toBe('machine_max:default');
        expect(hb.type).toBe('box');
        expect(hb.overwrite).toBeNull();
    });
});

describe('core/config 已退役 / 未知的子系统类型', () => {
    /** 上游 0.6.0 退役的 regen_loader，带着当时的字段 */
    function configWithRetiredSubsystem() {
        const raw = legacyConfig();
        const sp = raw.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.subsystems['subsystem.machine_max.regen_loader'] = {
            type: 'machine_max:regen_loader',
            definition: 'machine_max:regen_loader/standard',
            projectile_types: { 'machine_max:ap': ['machine_max:ap'] },
            discovery_outputs: { ammo: ['local'] },
        };
        return raw;
    }

    test('加载不抛错，条目连同退役字段原样保留', () => {
        const raw = configWithRetiredSubsystem();
        const migrated = migrateIfNeeded(raw);
        const sp = migrated.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        // 保留的是原始对象，未被任何 codec 改写
        expect(sp.subsystems['subsystem.machine_max.regen_loader'])
            .toEqual(raw.parts.hull.variants.default.sub_parts['sub_part.machine_max.main']
                .subsystems['subsystem.machine_max.regen_loader']);
        // 同一子零件里其余条目照常补默认值
        expect(sp.subsystems['subsystem.machine_max.engine'].definition).toBe('');
        expect(sp.start_bone).toBe('hull');
    });

    test('拼写错误 / 更新版本的类型同样保留，不影响其它零件', () => {
        const raw = configWithRetiredSubsystem();
        raw.parts.turret = JSON.parse(JSON.stringify(raw.parts.hull));
        const sp = raw.parts.turret.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.subsystems['subsystem.machine_max.future_thing'] = {
            type: 'machine_max:future_thing',
            definition: 'machine_max:future_thing/x',
            some_new_field: 1,
        };

        const migrated = migrateIfNeeded(raw);
        expect(migrated.parts.turret.variants.default.sub_parts['sub_part.machine_max.main']
            .subsystems['subsystem.machine_max.future_thing'].some_new_field).toBe(1);
        expect(migrated.parts.hull.variants.default.sub_parts['sub_part.machine_max.main']
            .subsystems['subsystem.machine_max.regen_loader'].type).toBe('machine_max:regen_loader');
    });

    test('写入链路仍严格：PartCodec 拒绝未知类型', () => {
        const config = createConfig();
        const sp = config.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.subsystems['subsystem.machine_max.regen_loader'] = {
            type: 'machine_max:regen_loader',
            definition: 'machine_max:regen_loader/standard',
        };
        expect(() => PartCodec.decode(config.parts.hull)).toThrow(/Unknown dispatch type/);
    });
});

describe('core/config 结构非法也不挡加载', () => {
    function brokenConfig() {
        const config = createConfig();
        const sp = config.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.mass = '25';                                        // 应为数字
        sp.hit_boxes = ['junk'];                               // 应为 key → 条目 的对象
        config.parts.turret = createConfig().parts.hull;        // 另一件正常零件
        return config;
    }

    test('默认解码器抛错时保留原始零件，不影响其它零件', () => {
        const config = brokenConfig();
        const decoded = migrateIfNeeded(config);
        const sp = decoded.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        expect(sp.mass).toBe('25');
        expect(sp.hit_boxes).toEqual(['junk']);
        // 正常零件照常补默认值
        expect(decoded.parts.turret.variants.default.sub_parts['sub_part.machine_max.main']
            .projected_area).toEqual([-1, -1, -1]);
    });

    test('传入 decodePart 时走该解码器（persistence 用 doc/load 的宽容解码）', () => {
        const config = brokenConfig();
        const docLoad = require('../../src/doc/load.js');
        const issues = [];
        const decoded = migrateIfNeeded(config, {
            decodePart: function (part, partId) {
                const result = docLoad.decodePart(part, { partId: partId });
                issues.push.apply(issues, result.issues);
                return result.node;
            },
        });
        // 坏的子零件整条保留，坏碰撞箱容器原样保留
        const sp = decoded.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        expect(sp.mass).toBe('25');
        expect(sp.hit_boxes).toEqual(['junk']);
        expect(issues.length).toBeGreaterThanOrEqual(1);
        expect(issues.every(function (i) { return i.code === 'load_decode_failed'; })).toBe(true);
    });

    test('空数组占位仍归一成 {}，非空数组不再被悄悄改写', () => {
        const raw = legacyConfig();
        raw.parts.hull.variants.default.sub_parts['sub_part.machine_max.main']
            .subsystems['subsystem.machine_max.transmission'].power_outputs = [];
        raw.parts.hull.variants.default.sub_parts['sub_part.machine_max.main']
            .connectors['connector.machine_max.hatch'].signal_targets = ['local'];

        const normalized = normalizeLegacyPlaceholders(raw);
        const sp = normalized.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        expect(sp.subsystems['subsystem.machine_max.transmission'].power_outputs).toEqual({});
        expect(sp.connectors['connector.machine_max.hatch'].signal_targets).toEqual(['local']);
    });
});
