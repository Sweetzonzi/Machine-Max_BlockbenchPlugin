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
        it('returns object with $schema_version === 3', function () {
            var blank = config.createBlankConfig();
            expect(blank.$schema_version).toBe(3);
        });

        it('contains all top-level fields', function () {
            var blank = config.createBlankConfig();
            expect(blank.namespace).toBe('machine_max');
            expect(blank.modelFile).toBe('');
            expect(typeof blank.parts).toBe('object');
            expect(typeof blank.projectiles).toBe('object');
            expect(typeof blank.connector_defs).toBe('object');
            expect(typeof blank.subsystem_defs).toBe('object');
            expect(typeof blank.material_defs).toBe('object');
            expect(typeof blank.packMeta).toBe('object');
            expect(typeof blank._uiState).toBe('object');
        });

        it('packMeta has correct default structure', function () {
            var blank = config.createBlankConfig();
            expect(blank.packMeta.id).toBe('');
            expect(blank.packMeta.version).toBe('1.0');
            expect(blank.packMeta.name).toBe('');
            expect(blank.packMeta.author).toBe('');
            expect(blank.packMeta.description).toBe('');
            expect(Array.isArray(blank.packMeta.dependencies)).toBe(true);
            expect(blank.packMeta.enable_auto_pack).toBe(false);
        });

        it('_uiState has correct default structure', function () {
            var blank = config.createBlankConfig();
            expect(blank._uiState.activeMode).toBe('part');
            expect(blank._uiState.activePartId).toBe('');
            expect(blank._uiState.activeVariantName).toBe('');
        });

        it('material_defs contains preset materials', function () {
            var blank = config.createBlankConfig();
            expect(blank.material_defs['machine_max:structural_steel']).toBeDefined();
            expect(blank.material_defs['machine_max:rha']).toBeDefined();
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

    describe('createConnectorDef', function () {
        it('returns object with all CONNECTOR_DEF_DEFAULTS fields', function () {
            var def = config.createConnectorDef('test_connector');
            expect(def.type).toBe('Simple');
            expect(def.direction).toBe('yp');
            expect(def.integrity).toBe(20.0);
            expect(def.damage_reduction).toBe(2.0);
            expect(def.damage_multiplier).toBe(1.5);
            expect(def.damage_absorption).toBe(0.2);
            expect(def.collide_between).toBe(false);
            expect(Array.isArray(def.required_tags)).toBe(true);
            expect(Array.isArray(def.accepted_tags)).toBe(true);
            expect(Array.isArray(def.rejected_tags)).toBe(true);
            expect(Array.isArray(def.joints)).toBe(true);
        });
    });

    describe('createSubsystemDef', function () {
        it('returns object with all SUBSYSTEM_DEF_DEFAULTS fields', function () {
            var def = config.createSubsystemDef('test_subsystem');
            expect(def.type).toBe('machine_max:basic');
            expect(def.basic_durability).toBe(20.0);
            expect(def.pass_damage).toBe(true);
            expect(def.limit_damage).toBe(false);
            expect(def.hidden).toBe(false);
            expect(def.destroy_sound_event).toBeNull();
            expect(def.activate_sound_event).toBeNull();
            expect(def.deactivate_sound_event).toBeNull();
        });
    });

    describe('createMaterialDef', function () {
        it('returns object with all MATERIAL_DEF_DEFAULTS fields', function () {
            var def = config.createMaterialDef('test_material');
            expect(def.friction).toBe(0.5);
            expect(def.restitution).toBe(0.3);
            expect(def.density).toBe(1.0);
            expect(def.armor_thickness).toBe(1.0);
            expect(def.armor_toughness).toBe(0.0);
            expect(def.hit_sound).toBeNull();
            expect(def.break_sound).toBeNull();
            expect(def.particle).toBeNull();
        });
    });

    describe('createHitBoxConfig', function () {
        it('returns object with all HIT_BOX_DEFAULTS fields', function () {
            var hb = config.createHitBoxConfig();
            expect(hb.id).toBe('part');
            expect(hb.type).toBe('box');
            expect(hb.material).toBe('machine_max:default');
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

        it('modifying returned connector def does not affect defaults', function () {
            var d1 = config.createConnectorDef('c1');
            d1.type = 'Complex';
            d1.joints.push({ bone: 'test' });

            var d2 = config.createConnectorDef('c2');
            expect(d2.type).toBe('Simple');
            expect(d2.joints.length).toBe(0);
        });
    });
});

// ─── ensureDefaults ──────────────────────────────────────────────────────────

describe('ensureDefaults', function () {
    it('fills missing top-level fields with defaults', function () {
        var result = config.ensureDefaults({ namespace: 'custom_ns' });
        expect(result.namespace).toBe('custom_ns');
        expect(result.$schema_version).toBe(3);
        expect(typeof result.parts).toBe('object');
        expect(typeof result.projectiles).toBe('object');
        expect(typeof result.connector_defs).toBe('object');
        expect(typeof result.subsystem_defs).toBe('object');
        expect(typeof result.material_defs).toBe('object');
        expect(typeof result.packMeta).toBe('object');
        expect(typeof result._uiState).toBe('object');
    });

    it('returns blank config when input is null', function () {
        var result = config.ensureDefaults(null);
        expect(result.$schema_version).toBe(3);
        expect(result.namespace).toBe('machine_max');
    });

    it('returns blank config when input is undefined', function () {
        var result = config.ensureDefaults(undefined);
        expect(result.$schema_version).toBe(3);
    });

    it('preserves existing data while filling missing fields', function () {
        var input = {
            namespace: 'my_ns',
            modelFile: 'my_model.bbmodel',
            parts: { my_part: {} },
        };
        var result = config.ensureDefaults(input);
        expect(result.namespace).toBe('my_ns');
        expect(result.modelFile).toBe('my_model.bbmodel');
        expect(result.parts.my_part).toBeDefined();
        // Missing fields filled
        expect(result.$schema_version).toBe(3);
        expect(typeof result.projectiles).toBe('object');
        expect(typeof result._uiState).toBe('object');
    });

    it('fills empty material_defs with presets', function () {
        var result = config.ensureDefaults({ material_defs: {} });
        expect(result.material_defs['machine_max:structural_steel']).toBeDefined();
    });
});

// ─── migrateIfNeeded ─────────────────────────────────────────────────────────

describe('migrateIfNeeded', function () {
    it('v3 config passes through unchanged', function () {
        var input = helpers.createMinimalConfig();
        var result = config.migrateIfNeeded(input);
        expect(result.$schema_version).toBe(3);
        expect(result.namespace).toBe('test_namespace');
        expect(result.modelFile).toBe('test_model.bbmodel');
    });

    it('v1 config (no $schema_version) gets upgraded to v3', function () {
        var input = helpers.createV1Config();
        expect(input.$schema_version).toBeUndefined();

        var result = config.migrateIfNeeded(input);
        expect(result.$schema_version).toBe(3);
        // Original data preserved
        expect(result.namespace).toBe('legacy_namespace');
        expect(result.modelFile).toBe('legacy_model.bbmodel');
        expect(result.packMeta.id).toBe('legacy:pack');
    });

    it('handles null input', function () {
        var result = config.migrateIfNeeded(null);
        expect(result.$schema_version).toBe(3);
        expect(result.namespace).toBe('machine_max');
    });

    it('handles undefined input', function () {
        var result = config.migrateIfNeeded(undefined);
        expect(result.$schema_version).toBe(3);
    });

    it('v1 config gets default fields added after migration', function () {
        var input = helpers.createV1Config();
        delete input.projectiles;
        delete input.connector_defs;
        delete input.subsystem_defs;
        delete input.material_defs;

        var result = config.migrateIfNeeded(input);
        expect(result.$schema_version).toBe(3);
        expect(typeof result.projectiles).toBe('object');
        expect(typeof result.connector_defs).toBe('object');
        expect(typeof result.subsystem_defs).toBe('object');
        expect(typeof result.material_defs).toBe('object');
    });
});
