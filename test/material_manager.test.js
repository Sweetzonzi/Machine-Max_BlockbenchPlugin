/**
 * material_manager.test.js — material_manager.js 单元测试
 *
 * 测试材料定义资源管理器的所有 5 个公开函数：
 * listMaterials, createMaterial, updateMaterial, deleteMaterial, getDefaultMaterialId
 *
 * 使用 bun test 框架: describe / test / expect
 * 遵循 TDD 原则：仅基于 material_manager.js 的公开 API 编写测试
 */

var path = require('path');
var fs = require('fs');
var cp = require('../src/core/content_pack.js');
var manager = require('../src/core/content_pack_manager.js');
var mm = require('../src/managers/material_manager.js');
var { createMinimalConfig, createTempDir, cleanupTempDir } = require('./helpers.js');

describe('MaterialManager', function () {

    // 每个测试前清除缓存，避免测试间相互影响
    beforeEach(function () {
        manager.invalidateCache();
    });

    // =========================================================================
    // listMaterials 测试
    // =========================================================================

    describe('listMaterials', function () {
        test('#1 returns empty array when no pack path', function () {
            var config = createMinimalConfig();
            var materials = mm.listMaterials(config);
            expect(Array.isArray(materials)).toBe(true);
            expect(materials.length).toBe(0);
        });

        test('#2 includes materials from current pack', function () {
            var tmpDir = createTempDir('mm-mm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });
                config.contentPackPath = tmpDir;

                cp.writeDef(tmpDir, 'test', 'materials', 'structural_steel', {
                    friction: [0.5, 0.5, 0.5],
                    restitution: 0.3,
                });

                var materials = mm.listMaterials(config);
                expect(materials.length).toBe(1);
                expect(materials[0].id).toBe('structural_steel');
                expect(materials[0].data.friction[0]).toBe(0.5);
                expect(materials[0].source).toBe('current');
                expect(materials[0].editable).toBe(true);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#3 marks dependency materials as not editable', function () {
            var depDir = createTempDir('mm-mm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(depDir, { id: 'dep:pack', version: '1.0', name: 'D', author: 'A', description: '' });
                config.dependencyPaths = [depDir];

                cp.writeDef(depDir, 'dep', 'materials', 'dep_mat', {
                    friction: [0.2, 0.2, 0.2],
                });

                var materials = mm.listMaterials(config);
                expect(materials.length).toBe(1);
                expect(materials[0].id).toBe('dep_mat');
                expect(materials[0].source).toBe('dependency:0');
                expect(materials[0].editable).toBe(false);
            } finally {
                cleanupTempDir(depDir);
            }
        });
    });

    // =========================================================================
    // createMaterial 测试
    // =========================================================================

    describe('createMaterial', function () {
        test('#4 writes material to current pack directory', function () {
            var tmpDir = createTempDir('mm-mm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });
                config.contentPackPath = tmpDir;

                mm.createMaterial(config, 'my_new_mat', {
                    friction: [0.6, 0.6, 0.6],
                    restitution: 0.4,
                });

                // 验证文件已写入
                var filePath = path.join(tmpDir, 'test', 'materials', 'my_new_mat.json');
                expect(fs.existsSync(filePath)).toBe(true);

                // 验证可通过 listMaterials 读取
                var materials = mm.listMaterials(config);
                var mat = materials.find(function (m) { return m.id === 'my_new_mat'; });
                expect(mat).toBeDefined();
                expect(mat.data.friction[0]).toBe(0.6);
                expect(mat.data.restitution).toBe(0.4);
                expect(mat.source).toBe('current');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#5 throws when no contentPackPath', function () {
            var config = createMinimalConfig();
            expect(function () {
                mm.createMaterial(config, 'orphan_mat', { friction: [0.1, 0.1, 0.1] });
            }).toThrow('当前没有关联的内容包，无法创建材料');
        });

        test('#6 throws when material already exists in current pack', function () {
            var tmpDir = createTempDir('mm-mm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });
                config.contentPackPath = tmpDir;

                cp.writeDef(tmpDir, 'test', 'materials', 'existing_mat', {
                    friction: [0.3, 0.3, 0.3],
                });

                expect(function () {
                    mm.createMaterial(config, 'existing_mat', { friction: [0.5, 0.5, 0.5] });
                }).toThrow('材料 "existing_mat" 已存在，请使用更新操作');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#7 throws when material exists in dependency pack', function () {
            var depDir = createTempDir('mm-mm-');
            var curDir = createTempDir('mm-mm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(depDir, { id: 'dep:pack', version: '1.0', name: 'D', author: 'A', description: '' });
                cp.createContentPack(curDir, { id: 'cur:pack', version: '1.0', name: 'C', author: 'A', description: '' });
                config.dependencyPaths = [depDir];
                config.contentPackPath = curDir;

                cp.writeDef(depDir, 'dep', 'materials', 'dep_mat', {
                    friction: [0.2, 0.2, 0.2],
                });

                expect(function () {
                    mm.createMaterial(config, 'dep_mat', { friction: [0.5, 0.5, 0.5] });
                }).toThrow('不能覆盖依赖包中的材料 "dep_mat"');
            } finally {
                cleanupTempDir(depDir);
                cleanupTempDir(curDir);
            }
        });
    });

    // =========================================================================
    // updateMaterial 测试
    // =========================================================================

    describe('updateMaterial', function () {
        test('#8 updates existing material in current pack', function () {
            var tmpDir = createTempDir('mm-mm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });
                config.contentPackPath = tmpDir;

                cp.writeDef(tmpDir, 'test', 'materials', 'my_mat', {
                    friction: [0.3, 0.3, 0.3],
                    restitution: 0.2,
                });

                mm.updateMaterial(config, 'my_mat', {
                    friction: [0.9, 0.9, 0.9],
                    restitution: 0.8,
                });

                var materials = mm.listMaterials(config);
                var mat = materials.find(function (m) { return m.id === 'my_mat'; });
                expect(mat.data.friction[0]).toBe(0.9);
                expect(mat.data.restitution).toBe(0.8);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#9 throws for dependency material', function () {
            var depDir = createTempDir('mm-mm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(depDir, { id: 'dep:pack', version: '1.0', name: 'D', author: 'A', description: '' });
                config.dependencyPaths = [depDir];

                cp.writeDef(depDir, 'dep', 'materials', 'dep_mat', {
                    friction: [0.2, 0.2, 0.2],
                });

                expect(function () {
                    mm.updateMaterial(config, 'dep_mat', { friction: [0.5, 0.5, 0.5] });
                }).toThrow('不能修改内置或依赖包的材料 "dep_mat"');
            } finally {
                cleanupTempDir(depDir);
            }
        });
    });

    // =========================================================================
    // deleteMaterial 测试
    // =========================================================================

    describe('deleteMaterial', function () {
        test('#10 removes material from current pack', function () {
            var tmpDir = createTempDir('mm-mm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });
                config.contentPackPath = tmpDir;

                cp.writeDef(tmpDir, 'test', 'materials', 'to_delete', {
                    friction: [0.4, 0.4, 0.4],
                });

                expect(mm.listMaterials(config).length).toBe(1);

                mm.deleteMaterial(config, 'to_delete');

                expect(mm.listMaterials(config).length).toBe(0);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#11 throws for dependency material', function () {
            var depDir = createTempDir('mm-mm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(depDir, { id: 'dep:pack', version: '1.0', name: 'D', author: 'A', description: '' });
                config.dependencyPaths = [depDir];

                cp.writeDef(depDir, 'dep', 'materials', 'dep_mat', {
                    friction: [0.2, 0.2, 0.2],
                });

                expect(function () {
                    mm.deleteMaterial(config, 'dep_mat');
                }).toThrow('不能删除内置或依赖包的材料 "dep_mat"');
            } finally {
                cleanupTempDir(depDir);
            }
        });
    });

    // =========================================================================
    // getDefaultMaterialId 测试
    // =========================================================================

    describe('getDefaultMaterialId', function () {
        test('#12 returns first material id', function () {
            var tmpDir = createTempDir('mm-mm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });
                config.contentPackPath = tmpDir;

                cp.writeDef(tmpDir, 'test', 'materials', 'alpha_mat', { friction: [0.1, 0.1, 0.1] });
                cp.writeDef(tmpDir, 'test', 'materials', 'beta_mat', { friction: [0.2, 0.2, 0.2] });

                var defaultId = mm.getDefaultMaterialId(config);
                expect(defaultId).toBeTruthy();
                expect(typeof defaultId).toBe('string');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#13 returns null when no materials', function () {
            var config = createMinimalConfig();
            var defaultId = mm.getDefaultMaterialId(config);
            expect(defaultId).toBe(null);
        });
    });
});
