'use strict';

const { describe, test, expect } = require('bun:test');
const { normalizeLegacyPlaceholders, migrateIfNeeded, createHitBoxConfig } = require('../../src/core/config.js');
const { HitBoxCodec } = require('../../src/codec/codecs/hit_box_codec.js');
const { PartCodec } = require('../../src/codec/codecs/part_codec.js');

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
                                    'subsystem.machine_max.regen_loader': {
                                        type: 'machine_max:regen_loader',
                                        definition: 'machine_max:regen_loader',
                                        projectile_types: [],
                                        belt_label: null,
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
        expect(sp.subsystems['subsystem.machine_max.regen_loader'].projectile_types).toEqual({});
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

    test('createHitBoxConfig 使用 HitBoxCodec 作为默认值唯一真源', () => {
        const hb = createHitBoxConfig();
        const decoded = HitBoxCodec.decode({ id: 'part', type: 'box' });
        expect(hb).toEqual(decoded);
        expect(hb.material).toBe('machine_max:default');
        expect(hb.type).toBe('box');
        expect(hb.overwrite).toBeNull();
    });
});
