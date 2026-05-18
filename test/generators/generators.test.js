/**
 * 核心逻辑单元测试：生成器
 *
 * 覆盖 src/generators/ 下所有 6 个生成器模块。
 * 生成器是纯数据转换函数，无副作用，适合直接测试输出结构。
 */

// Load mock layer first
require('../mocks/blockbench.js');

// Now require source modules
var partGen = require('../../src/generators/part_generator.js');
var connGen = require('../../src/generators/connector_generator.js');
var subGen = require('../../src/generators/subsystem_generator.js');
var matGen = require('../../src/generators/material_generator.js');
var langGen = require('../../src/generators/lang_generator.js');
var metaGen = require('../../src/generators/meta_generator.js');
var helpers = require('../helpers.js');
var path = require('path');
var fs = require('fs');

// ─── Part Generator ───────────────────────────────────────────────────────────

describe('Part Generator', function () {

    describe('generatePartJSON', function () {

        it('flattens single "default" variant (no nesting)', function () {
            var part = helpers.createSamplePart();
            var result = partGen.generatePartJSON('test_part', part, 'test_ns');

            // Top-level fields from part config
            expect(result.icon).toBe('minecraft:iron_ingot');
            expect(result.vehicle_durability_rate).toBe(0.8);
            expect(result.vehicle_damage_rate).toBe(1.0);
            expect(result.vehicle_damage_rate_destroyed).toBe(0.1);
            expect(result.functional_threshold).toBe(0.3);
            expect(result.share_durability).toBe(true);
            expect(result.max_stack_size).toBe(1);

            // Variant fields are at top level (flattened)
            expect(result.variants.model).toBe('test_model.geo.json');
            expect(result.variants.textures).toBe('test_textures.png');
            // tags is empty array → omitted
            expect(result.variants.tags).toBeUndefined();
            // sub_parts is empty → omitted
            expect(result.variants.sub_parts).toBeUndefined();
        });

        it('produces nested variants for multiple variants', function () {
            var part = helpers.createSamplePart();
            part.variants['summer'] = {
                model: 'summer.geo.json',
                textures: 'summer_textures.png',
                animations: null,
                tags: ['seasonal'],
                sub_parts: {},
            };
            var result = partGen.generatePartJSON('test_part', part, 'test_ns');

            // With multiple variants, output.variants is an object keyed by variant name
            expect(result.variants.default).toBeDefined();
            expect(result.variants.summer).toBeDefined();

            // Each variant has its own fields
            expect(result.variants.default.model).toBe('test_model.geo.json');
            expect(result.variants.summer.model).toBe('summer.geo.json');
            expect(result.variants.summer.tags).toEqual(['seasonal']);
        });

        it('omits null/undefined top-level fields', function () {
            var part = helpers.createSamplePart();
            part.icon = undefined;
            part.share_durability = null;
            var result = partGen.generatePartJSON('test_part', part, 'test_ns');

            expect(result.icon).toBeUndefined();
            expect(result.share_durability).toBeUndefined();
            // Other fields still present
            expect(result.vehicle_durability_rate).toBe(0.8);
        });
    });

    describe('generateAllParts', function () {

        it('iterates all parts in project config', function () {
            var config = helpers.createMinimalConfig();
            config.parts['part_a'] = helpers.createSamplePart();
            config.parts['part_b'] = helpers.createSamplePart();

            var result = partGen.generateAllParts(config);

            expect(Object.keys(result).length).toBe(2);
            expect(result.part_a).toBeDefined();
            expect(result.part_b).toBeDefined();
            expect(result.part_a.icon).toBe('minecraft:iron_ingot');
        });

        it('returns empty object when no parts', function () {
            var config = helpers.createMinimalConfig();
            var result = partGen.generateAllParts(config);
            expect(Object.keys(result).length).toBe(0);
        });
    });
});

// ─── Connector Generator ──────────────────────────────────────────────────────

describe('Connector Generator', function () {

    describe('copyConnectorDefs', function () {

        it('从内容包目录复制连接点定义到导出目录（扁平模式）', function () {
            var tmpDir = helpers.createTempDir();
            try {
                var ns = 'machine_max';
                var srcDir = path.join(tmpDir, ns, 'connectors');
                var targetDir = path.join(tmpDir, 'export', ns, 'connectors');
                fs.mkdirSync(srcDir, { recursive: true });

                fs.writeFileSync(path.join(srcDir, 'simple.json'), JSON.stringify({ type: 'Simple', direction: 'yp' }));
                fs.writeFileSync(path.join(srcDir, 'complex.json'), JSON.stringify({ type: 'Complex', direction: 'xn' }));

                var count = connGen.copyConnectorDefs(tmpDir, ns, targetDir, true);

                expect(count).toBe(2);
                expect(fs.existsSync(path.join(targetDir, 'simple.json'))).toBe(true);
                expect(fs.existsSync(path.join(targetDir, 'complex.json'))).toBe(true);
                expect(JSON.parse(fs.readFileSync(path.join(targetDir, 'simple.json'), 'utf8')).type).toBe('Simple');
            } finally {
                helpers.cleanupTempDir(tmpDir);
            }
        });

        it('源目录不存在时返回 0，不抛错', function () {
            var count = connGen.copyConnectorDefs('/nonexistent/path', 'ns', '/target', true);
            expect(count).toBe(0);
        });

        it('扁平模式下连接点位于目标目录根，不分入子目录', function () {
            var tmpDir = helpers.createTempDir();
            try {
                var ns = 'machine_max';
                var srcDir = path.join(tmpDir, ns, 'connectors');
                var targetDir = path.join(tmpDir, 'export', ns, 'connectors');
                fs.mkdirSync(srcDir, { recursive: true });
                fs.writeFileSync(path.join(srcDir, 'simple.json'), JSON.stringify({ type: 'Simple' }));

                connGen.copyConnectorDefs(tmpDir, ns, targetDir, true);

                expect(fs.existsSync(path.join(targetDir, 'simple.json'))).toBe(true);
            } finally {
                helpers.cleanupTempDir(tmpDir);
            }
        });
    });
});

// ─── Subsystem Generator ──────────────────────────────────────────────────────

describe('Subsystem Generator', function () {

    describe('getTypeSpecificFields', function () {

        it('engine 类型返回引擎特有字段', function () {
            var fields = subGen.getTypeSpecificFields('machine_max:engine');
            expect(fields.indexOf('max_power')).toBeGreaterThan(-1);
            expect(fields.indexOf('max_torque')).toBeGreaterThan(-1);
            expect(fields.indexOf('cylinder_count')).toBeGreaterThan(-1);
        });

        it('basic 类型返回空数组', function () {
            var fields = subGen.getTypeSpecificFields('machine_max:basic');
            expect(fields).toEqual([]);
        });

        it('未知类型返回空数组', function () {
            var fields = subGen.getTypeSpecificFields('unknown:type');
            expect(fields).toEqual([]);
        });
    });

    describe('copySubsystemDefs', function () {

        it('从内容包目录复制子系统定义到导出目录', function () {
            var tmpDir = helpers.createTempDir();
            try {
                var ns = 'machine_max';
                var srcDir = path.join(tmpDir, ns, 'subsystems');
                var targetDir = path.join(tmpDir, 'export', ns, 'subsystems');
                fs.mkdirSync(srcDir, { recursive: true });

                fs.writeFileSync(path.join(srcDir, 'engine_v8.json'), JSON.stringify({ type: 'machine_max:engine', max_power: 200 }));
                fs.writeFileSync(path.join(srcDir, 'seat_basic.json'), JSON.stringify({ type: 'machine_max:seat' }));

                var count = subGen.copySubsystemDefs(tmpDir, ns, targetDir, true);

                expect(count).toBe(2);
                expect(fs.existsSync(path.join(targetDir, 'engine_v8.json'))).toBe(true);
                expect(fs.existsSync(path.join(targetDir, 'seat_basic.json'))).toBe(true);
                expect(JSON.parse(fs.readFileSync(path.join(targetDir, 'engine_v8.json'), 'utf8')).type).toBe('machine_max:engine');
            } finally {
                helpers.cleanupTempDir(tmpDir);
            }
        });

        it('源目录不存在时返回 0，不抛错', function () {
            var count = subGen.copySubsystemDefs('/nonexistent/path', 'ns', '/target', true);
            expect(count).toBe(0);
        });
    });
});

// ─── Material Generator ───────────────────────────────────────────────────────

describe('Material Generator', function () {

    describe('copyMaterialDefs', function () {

        it('从内容包目录复制材料定义到导出目录', function () {
            var tmpDir = helpers.createTempDir();
            try {
                var ns = 'machine_max';
                var srcDir = path.join(tmpDir, ns, 'materials');
                var targetDir = path.join(tmpDir, 'export', ns, 'materials');
                fs.mkdirSync(srcDir, { recursive: true });

                fs.writeFileSync(path.join(srcDir, 'steel.json'), JSON.stringify({ friction: 0.8, restitution: 0.2 }));
                fs.writeFileSync(path.join(srcDir, 'rubber.json'), JSON.stringify({ friction: 0.9, restitution: 0.5 }));

                var count = matGen.copyMaterialDefs(tmpDir, ns, targetDir);

                expect(count).toBe(2);
                expect(fs.existsSync(path.join(targetDir, 'steel.json'))).toBe(true);
                expect(fs.existsSync(path.join(targetDir, 'rubber.json'))).toBe(true);
                expect(JSON.parse(fs.readFileSync(path.join(targetDir, 'steel.json'), 'utf8')).friction).toBe(0.8);
            } finally {
                helpers.cleanupTempDir(tmpDir);
            }
        });

        it('源目录不存在时返回 0，不抛错', function () {
            var count = matGen.copyMaterialDefs('/nonexistent/path', 'ns', '/target');
            expect(count).toBe(0);
        });
    });
});

// ─── Lang Generator ───────────────────────────────────────────────────────────

describe('Lang Generator', function () {

    describe('generateLangEntries', function () {

        it('returns correct key format item.machine_max.{partId}', function () {
            var config = helpers.createMinimalConfig();
            config.parts['engine_block'] = helpers.createSamplePart();

            var result = langGen.generateLangEntries(config, 'en_us');

            expect(result['item.machine_max.engine_block']).toBeDefined();
        });

        it('converts part ID to display name (underscores → spaces, capitalize)', function () {
            var config = helpers.createMinimalConfig();
            config.parts['engine_block'] = helpers.createSamplePart();
            config.parts['left_front_wheel'] = helpers.createSamplePart();

            var result = langGen.generateLangEntries(config, 'en_us');

            expect(result['item.machine_max.engine_block']).toBe('Engine Block');
            expect(result['item.machine_max.left_front_wheel']).toBe('Left Front Wheel');
        });

        it('uses machine_max as default namespace when config has no namespace', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();

            var result = langGen.generateLangEntries(config, 'en_us');

            expect(result['item.machine_max.test_part']).toBe('Test Part');
        });
    });

    describe('generateAllLangs', function () {

        it('returns zh_cn and en_us locales', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();

            var result = langGen.generateAllLangs(config);

            expect(result.zh_cn).toBeDefined();
            expect(result.en_us).toBeDefined();
            expect(result.zh_cn['item.machine_max.test_part']).toBe('Test Part');
            expect(result.en_us['item.machine_max.test_part']).toBe('Test Part');
        });
    });
});

// ─── Namespace-Aware Export ────────────────────────────────────────────────────

describe('Namespace-Aware Export', function () {

    var fileWriter = require('../../src/utils/file_writer.js');

    describe('extractResourceLocation', function () {

        it('splits "ns:path" into {ns, path}', function () {
            var loc = fileWriter.extractResourceLocation('mypack:custom', 'machine_max');
            expect(loc.ns).toBe('mypack');
            expect(loc.path).toBe('custom');
        });

        it('uses defaultNs when id has no colon', function () {
            var loc = fileWriter.extractResourceLocation('simple_mat', 'machine_max');
            expect(loc.ns).toBe('machine_max');
            expect(loc.path).toBe('simple_mat');
        });

        it('uses empty string as fallback defaultNs when omitted', function () {
            var loc = fileWriter.extractResourceLocation('no_ns');
            expect(loc.ns).toBe('');
            expect(loc.path).toBe('no_ns');
        });

        it('handles multiple colons (only first splits)', function () {
            var loc = fileWriter.extractResourceLocation('ns:path:extra', 'default');
            expect(loc.ns).toBe('ns');
            expect(loc.path).toBe('path:extra');
        });

        it('builds correct directory for custom namespace material', function () {
            var loc = fileWriter.extractResourceLocation('mypack:custom', 'machine_max');
            var dir = loc.ns + '/materials';
            var filename = loc.path + '.json';
            expect(dir).toBe('mypack/materials');
            expect(filename).toBe('custom.json');
        });
    });

    describe('connector/subsystem directory construction', function () {

        it('builds connector path with namespace', function () {
            var loc = fileWriter.extractResourceLocation('other_ns:conn_a', 'machine_max');
            var dir = loc.ns + '/connectors';
            var filename = loc.path + '.json';
            expect(dir).toBe('other_ns/connectors');
            expect(filename).toBe('conn_a.json');
        });

        it('builds connector path with fallback namespace', function () {
            var loc = fileWriter.extractResourceLocation('simple_conn', 'machine_max');
            var dir = loc.ns + '/connectors';
            var filename = loc.path + '.json';
            expect(dir).toBe('machine_max/connectors');
            expect(filename).toBe('simple_conn.json');
        });

        it('builds subsystem path with namespace', function () {
            var loc = fileWriter.extractResourceLocation('ns3:sub_x', 'machine_max');
            var dir = loc.ns + '/subsystems';
            var filename = loc.path + '.json';
            expect(dir).toBe('ns3/subsystems');
            expect(filename).toBe('sub_x.json');
        });
    });
});

// ─── Meta Generator ───────────────────────────────────────────────────────────

describe('Meta Generator', function () {

    describe('generateMeta', function () {

        it('returns object with id, version, name, author, description from packMeta', function () {
            var config = helpers.createMinimalConfig();
            config.packMeta = {
                id: 'test_namespace:test_pack',
                version: '1.0',
                name: 'Test Pack',
                author: 'Tester',
                description: 'A test content pack',
                dependencies: [],
                enable_auto_pack: false,
            };
            var result = metaGen.generateMeta(config);

            expect(result.id).toBe('test_namespace:test_pack');
            expect(result.version).toBe('1.0');
            expect(result.name).toEqual({ text: 'Test Pack' });
            expect(result.author).toEqual({ text: 'Tester' });
            expect(result.description).toEqual({ text: 'A test content pack' });
        });

        it('handles config with no packMeta gracefully', function () {
            var config = helpers.createMinimalConfig();

            var result = metaGen.generateMeta(config);

            expect(result.id).toBeDefined();
            expect(result.version).toBe('1.0');
            expect(result.name.text).toBeDefined();
            expect(result.author.text).toBe('Anonymous');
            expect(result.description.text).toBe('');
        });
    });
});
