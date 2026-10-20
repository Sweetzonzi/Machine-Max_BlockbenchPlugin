'use strict';

const fs = require('fs');
const path = require('path');
const { describe, test, expect } = require('bun:test');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const generatedPath = path.join(REPO_ROOT, 'src', 'doc', 'field_specs.generated.js');
const { buildManifest, render, DEFAULT_SOURCE } = require('../../scripts/gen-field-specs.js');
const generated = require(generatedPath);

describe('field_specs.generated.js', () => {
    test('生成物与当前 schema 逐字节一致', () => {
        const expected = render(buildManifest(DEFAULT_SOURCE));
        const actual = fs.readFileSync(generatedPath, 'utf8').replace(/\r\n/g, '\n');
        expect(actual).toBe(expected);
    });

    test('覆盖上游 19 种 subsystem 类型', () => {
        expect(Object.keys(generated.SPECS.subsystem).length).toBe(19);
        expect(Object.keys(generated.SPECS.subsystem)).toContain('machine_max:track_controller');
        expect(Object.keys(generated.SPECS.subsystem)).toContain('machine_max:track_drive');
    });

    test('关键字段规格符合 docs/13 §5.2', () => {
        expect(generated.SPECS.sub_part.fields.projected_area).toEqual({
            type: 'tuple',
            tuple: [{ type: 'number' }, { type: 'number' }, { type: 'number' }],
            minItems: 3,
            maxItems: 3,
        });

        const textures = generated.SPECS.variant.fields.textures;
        expect(textures.oneOf).toHaveLength(2);
        expect(textures.oneOf[0].references).toBe('resource');
        expect(textures.oneOf[1].minProperties).toBe(1);
        expect(textures.oneOf[1].additionalProperties.references).toBe('resource');

        expect(generated.SPECS.sub_part.fields.start_bone.references).toBe('bone');
        expect(generated.SPECS.sub_part.fields.end_bones.items.references).toBe('bone');
        expect(generated.SPECS.sub_part.fields.mass_center.references).toBe('locator');
        expect(generated.SPECS.interact_box.fields.bone.references).toBe('bone');
        expect(generated.SPECS.connector.fields.definition.references).toBe('resource');
        expect(generated.SPECS.interact_box.fields.signal_targets
            .additionalProperties.items.references).toBe('signal');
        expect(generated.SPECS.subsystem['machine_max:launcher'].fields.locator.references).toBe('locator');
        expect(generated.SPECS.subsystem['machine_max:engine'].fields.power_output.references).toBe('signal');
    });

    test('overwrite 结构与 nullable 按 schema / 上游 Optional', () => {
        expect(Object.keys(generated.SPECS.hit_box.fields.overwrite.properties)).toEqual([
            'physics', 'armor', 'sounds',
        ]);
        expect(Object.keys(generated.SPECS.hit_box.fields.overwrite.properties.armor.properties))
            .toContain('impact_modifiers');
        expect(Object.keys(generated.SPECS.connector.fields.overwrite.properties)).toHaveLength(12);
        expect(generated.SPECS.connector.fields.overwrite.properties)
            .toHaveProperty('impact_absorption_destroyed');
        expect(generated.SPECS.connector.fields.overwrite.properties.impact_absorption.maximum)
            .toBe(1);
        expect(generated.SPECS.hit_box.fields.overwrite.nullable).toBe(true);
        expect(generated.SPECS.connector.fields.overwrite.nullable).toBe(true);
        expect(generated.SPECS.hit_box.fields.overwrite.additionalProperties).toBe(false);
    });

    test('required map / 必填字段进入规格', () => {
        expect(generated.SPECS.interact_box.required).toEqual(['bone', 'signal_targets']);
        expect(generated.SPECS.interact_box.fields.signal_targets.required).toBe(true);
        expect(generated.SPECS.subsystem['machine_max:regen_loader']
            .fields.projectile_types.minProperties).toBe(1);
        expect(generated.SPECS.subsystem['machine_max:regen_loader'].required)
            .toContain('projectile_types');
        expect(generated.SPECS.subsystem['machine_max:launcher'].required).toEqual([
            'type', 'definition', 'locator',
        ]);
    });

    test('容器与内部字段不进入字段表', () => {
        for (const kind of ['part', 'variant', 'sub_part']) {
            const fields = generated.SPECS[kind].fields;
            for (const container of generated.CONTAINERS[kind] || []) {
                expect(fields[container]).toBeUndefined();
            }
        }
        expect(generated.SPECS.part.fields.element_markers).toBeUndefined();
        expect(generated.SPECS.sub_part.fields.auto_end_bones).toBeUndefined();
        expect(generated.SPECS.subsystem['machine_max:track_controller'].fields.$schema).toBeUndefined();
    });

    test('副作用表覆盖 8 个字段 / 6 条规则', () => {
        expect(Object.keys(generated.SIDE_EFFECTS)).toHaveLength(8);
        expect(new Set(Object.values(generated.SIDE_EFFECTS)).size).toBe(6);
        expect(generated.SPECS.sub_part.fields.start_bone.sideEffect)
            .toBe('migrate_sub_part_marker');
        expect(generated.SPECS.connector.fields.locator.sideEffect)
            .toBe('migrate_connector_marker');
        expect(generated.SPECS.subsystem['machine_max:engine'].fields.type.sideEffect)
            .toBe('rebuild_type_fields');
    });

    test('provenance 记录 67 个 schema 与源 hash', () => {
        expect(generated.PROVENANCE.source_revision).toBe('d8d1df8b+worktree');
        expect(generated.PROVENANCE.source_files).toBe(67);
        expect(generated.PROVENANCE.source_sha256).toMatch(/^[0-9a-f]{64}$/);
        expect(generated.PROVENANCE.source_root)
            .toBe('src/builtin/builtin/machine_max/docs/en_us/schemas');
    });
});
