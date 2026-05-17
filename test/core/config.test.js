/**
 * 核心逻辑单元测试：config 工厂 + 迁移
 *
 * 覆盖 src/core/config.js 中的工厂函数和迁移逻辑。
 */

// Load mock layer first (sets globalThis.Blockbench, Project, etc.)
require('../mocks/blockbench.js');

// Now require source modules
var config = require('../../src/core/config.js');
var defaults = require('../../src/core/config_defaults.js');
var helpers = require('../helpers.js');

// ─── Config Factory ──────────────────────────────────────────────────────────

describe('Config Factory', function () {

    describe('createBlankConfig', function () {
        it('returns object with $schema_version === 4', function () {
            var blank = config.createBlankConfig();
            expect(blank.$schema_version).toBe(4);
        });

        it('contains all top-level fields', function () {
            var blank = config.createBlankConfig();
            expect(blank.modelFile).toBe('');
            expect(typeof blank.parts).toBe('object');
            expect(blank.contentPackPath).toBe('');
            expect(Array.isArray(blank.dependencyPaths)).toBe(true);
            expect(typeof blank._uiState).toBe('object');
        });

        it('_uiState has correct default structure', function () {
            var blank = config.createBlankConfig();
            expect(blank._uiState.activeMode).toBe('part');
            expect(blank._uiState.activePartId).toBe('');
            expect(blank._uiState.activeVariantName).toBe('');
        });

        it('does not contain legacy fields (namespace, packMeta, defs)', function () {
            var blank = config.createBlankConfig();
            expect(blank.namespace).toBeUndefined();
            expect(blank.packMeta).toBeUndefined();
            expect(blank.connector_defs).toBeUndefined();
            expect(blank.subsystem_defs).toBeUndefined();
            expect(blank.material_defs).toBeUndefined();
            expect(blank.projectiles).toBeUndefined();
        });
    });

    describe('createPartConfig', function () {
        it('returns object with all PART_DEFAULTS fields', function () {
            var part = config.createPartConfig('test_part');
            expect(part.icon).toBe('');
            expect(part.vehicle_durability_rate).toBe(0.8);
            expect(part.vehicle_damage_rate).toBe(1.0);
            expect(part.vehicle_damage_rate_destroyed).toBe(0.1);
            expect(part.functional_threshold).toBe(0.3);
            expect(part.share_durability).toBe(true);
            expect(part.max_stack_size).toBe(1);
            expect(typeof part.variants).toBe('object');
            expect(typeof part.element_markers).toBe('object');
        });

        it('creates default variant when initialVariantName provided', function () {
            var part = config.createPartConfig('test_part', 'default');
            expect(part.variants['default']).toBeDefined();
            expect(part.variants['default'].model).toBe('');
            expect(part.variants['default'].textures).toBe('');
            expect(part.variants['default'].animations).toBeNull();
            expect(Array.isArray(part.variants['default'].tags)).toBe(true);
            expect(typeof part.variants['default'].sub_parts).toBe('object');
        });

        it('has no variants when initialVariantName not provided', function () {
            var part = config.createPartConfig('test_part');
            expect(Object.keys(part.variants).length).toBe(0);
        });

        it('element_markers is initialized as empty object', function () {
            var part = config.createPartConfig('test_part');
            expect(Object.keys(part.element_markers).length).toBe(0);
        });
    });

    describe('createVariantConfig', function () {
        it('returns object with all VARIANT_DEFAULTS fields', function () {
            var variant = config.createVariantConfig();
            expect(variant.model).toBe('');
            expect(variant.textures).toBe('');
            expect(variant.animations).toBeNull();
            expect(Array.isArray(variant.tags)).toBe(true);
            expect(variant.tags.length).toBe(0);
            expect(typeof variant.sub_parts).toBe('object');
        });
    });

    describe('createSubPartConfig', function () {
        it('returns object with all SUB_PART_DEFAULTS fields', function () {
            var sp = config.createSubPartConfig();
            expect(sp.start_bone).toBe('');
            expect(Array.isArray(sp.end_bones)).toBe(true);
            expect(sp.end_bones.length).toBe(0);
            expect(Array.isArray(sp.auto_end_bones)).toBe(true);
            expect(sp.durability).toBe(20.0);
            expect(sp.mass).toBe(25.0);
            expect(sp.mass_center).toBe('mass_center');
            expect(sp.projected_area).toEqual([0, 0, 0]);
            expect(sp.block_collision).toBe('true');
            expect(sp.collision_height).toBe(-1.0);
            expect(sp.climb_assist).toBe(false);
            expect(sp.hydro_priority).toBe(0);
            expect(typeof sp.hit_boxes).toBe('object');
            expect(typeof sp.interact_boxes).toBe('object');
            expect(typeof sp.connectors).toBe('object');
            expect(typeof sp.subsystems).toBe('object');
            expect(sp.hydrodynamics).toBeNull();
        });
    });

    describe('createHitBoxConfig', function () {
        it('returns object with all HIT_BOX_DEFAULTS fields', function () {
            var hb = config.createHitBoxConfig();
            expect(hb.id).toBe('part');
            expect(hb.type).toBe('box');
            expect(hb.material).toBe('');
            expect(hb.thickness).toBe(1.0);
            expect(hb.condition).toBe('true');
        });
    });

    describe('deep clone independence', function () {
        it('modifying returned part config does not affect defaults', function () {
            var part = config.createPartConfig('test_part', 'default');
            part.icon = 'changed';
            part.vehicle_durability_rate = 999;
            part.variants['default'].model = 'changed_model';

            var part2 = config.createPartConfig('test_part2', 'default');
            expect(part2.icon).toBe('');
            expect(part2.vehicle_durability_rate).toBe(0.8);
            expect(part2.variants['default'].model).toBe('');
        });

        it('modifying returned variant config does not affect defaults', function () {
            var v1 = config.createVariantConfig();
            v1.model = 'custom_model';
            v1.tags.push('custom_tag');

            var v2 = config.createVariantConfig();
            expect(v2.model).toBe('');
            expect(v2.tags.length).toBe(0);
        });

        it('modifying returned sub part config does not affect defaults', function () {
            var sp1 = config.createSubPartConfig();
            sp1.start_bone = 'custom_bone';
            sp1.end_bones.push('bone_1');

            var sp2 = config.createSubPartConfig();
            expect(sp2.start_bone).toBe('');
            expect(sp2.end_bones.length).toBe(0);
        });

        it('modifying returned hit box config does not affect defaults', function () {
            var hb1 = config.createHitBoxConfig();
            hb1.material = 'custom:mat';
            hb1.thickness = 5.0;

            var hb2 = config.createHitBoxConfig();
            expect(hb2.material).toBe('');
            expect(hb2.thickness).toBe(1.0);
        });
    });
});

// ─── ensureDefaults ──────────────────────────────────────────────────────────

describe('ensureDefaults', function () {
    it('fills missing top-level fields with defaults', function () {
        var result = config.ensureDefaults({ contentPackPath: '/custom/path' });
        expect(result.contentPackPath).toBe('/custom/path');
        expect(result.$schema_version).toBe(4);
        expect(typeof result.parts).toBe('object');
        expect(result.modelFile).toBe('');
        expect(Array.isArray(result.dependencyPaths)).toBe(true);
        expect(typeof result._uiState).toBe('object');
    });

    it('returns blank config when input is null', function () {
        var result = config.ensureDefaults(null);
        expect(result.$schema_version).toBe(4);
        expect(result.modelFile).toBe('');
    });

    it('returns blank config when input is undefined', function () {
        var result = config.ensureDefaults(undefined);
        expect(result.$schema_version).toBe(4);
    });

    it('preserves existing data while filling missing fields', function () {
        var input = {
            modelFile: 'my_model.bbmodel',
            contentPackPath: '/my/pack',
            parts: { my_part: {} },
        };
        var result = config.ensureDefaults(input);
        expect(result.modelFile).toBe('my_model.bbmodel');
        expect(result.contentPackPath).toBe('/my/pack');
        expect(result.parts.my_part).toBeDefined();
        // Missing fields filled
        expect(result.$schema_version).toBe(4);
        expect(Array.isArray(result.dependencyPaths)).toBe(true);
        expect(typeof result._uiState).toBe('object');
    });

    it('fills missing _uiState', function () {
        var result = config.ensureDefaults({ $schema_version: 4 });
        expect(result._uiState.activeMode).toBe('part');
    });

    it('fills missing parts', function () {
        var result = config.ensureDefaults({ $schema_version: 4 });
        expect(typeof result.parts).toBe('object');
        expect(Object.keys(result.parts).length).toBe(0);
    });
});

// ─── migrateIfNeeded ─────────────────────────────────────────────────────────

describe('migrateIfNeeded', function () {
    it('v4 config passes through unchanged', function () {
        var input = helpers.createMinimalConfig();
        var result = config.migrateIfNeeded(input);
        expect(result.$schema_version).toBe(4);
        expect(result.modelFile).toBe('test_model.bbmodel');
        expect(result.contentPackPath).toBe('');
    });

    it('v3 config gets upgraded to v4 with legacy fields removed', function () {
        var input = {
            $schema_version: 3,
            namespace: 'legacy_ns',
            modelFile: 'legacy_model.bbmodel',
            parts: {},
            projectiles: {},
            connector_defs: { c1: { type: 'Simple' } },
            subsystem_defs: { s1: { type: 'basic' } },
            material_defs: { m1: { friction: 0.5 } },
            packMeta: { id: 'test:pack', version: '1.0' },
            _uiState: { activeMode: 'part', activePartId: '', activeVariantName: '' },
        };
        var result = config.migrateIfNeeded(input);
        expect(result.$schema_version).toBe(4);
        expect(result.modelFile).toBe('legacy_model.bbmodel');
        // Legacy fields removed
        expect(result.namespace).toBeUndefined();
        expect(result.projectiles).toBeUndefined();
        expect(result.connector_defs).toBeUndefined();
        expect(result.subsystem_defs).toBeUndefined();
        expect(result.material_defs).toBeUndefined();
        expect(result.packMeta).toBeUndefined();
        // New fields added
        expect(result.contentPackPath).toBe('');
        expect(Array.isArray(result.dependencyPaths)).toBe(true);
    });

    it('v1 config (no $schema_version) gets upgraded to v4', function () {
        var input = helpers.createV1Config();
        expect(input.$schema_version).toBeUndefined();

        var result = config.migrateIfNeeded(input);
        expect(result.$schema_version).toBe(4);
        // Original data preserved
        expect(result.modelFile).toBe('legacy_model.bbmodel');
        // New fields added
        expect(result.contentPackPath).toBe('');
        expect(Array.isArray(result.dependencyPaths)).toBe(true);
    });

    it('handles null input', function () {
        var result = config.migrateIfNeeded(null);
        expect(result.$schema_version).toBe(4);
        expect(result.modelFile).toBe('');
    });

    it('handles undefined input', function () {
        var result = config.migrateIfNeeded(undefined);
        expect(result.$schema_version).toBe(4);
    });

    it('v1 config with project wrapper is merged with defaults', function () {
        var input = {
            project: {
                namespace: 'old_ns',
                modelFile: 'old_model.bbmodel',
                parts: {},
            },
        };
        var result = config.migrateIfNeeded(input);
        // ensureDefaults merges input into blank config without unwrapping project
        expect(result.$schema_version).toBe(4);
        // The project wrapper is preserved as-is, but top-level fields are defaults
        expect(result.modelFile).toBe('');
        expect(result.contentPackPath).toBe('');
    });
});
