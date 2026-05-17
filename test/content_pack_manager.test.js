/**
 * content_pack_manager.test.js — content_pack_manager.js 单元测试
 *
 * 测试内容包管理器的所有 6 个公开函数：
 * loadMergedDefs, resolveDefSource, isDefEditable,
 * getAvailableDefsForType, getFirstDefId, invalidateCache
 *
 * 使用 bun test 框架: describe / test / expect
 * 遵循 TDD 原则：仅基于 content_pack_manager.js 的公开 API 编写测试
 */

var path = require('path');
var cp = require('../src/core/content_pack.js');
var manager = require('../src/core/content_pack_manager.js');
var { createMinimalConfig, createTempDir, cleanupTempDir } = require('./helpers.js');

describe('ContentPackManager', function () {

    // 每个测试前清除缓存，避免测试间相互影响
    beforeEach(function () {
        manager.invalidateCache();
    });

    // =========================================================================
    // loadMergedDefs 测试
    // =========================================================================

    describe('loadMergedDefs', function () {
        test('#1 returns empty result for null config', function () {
            var result = manager.loadMergedDefs(null, 'materials');
            expect(result).toEqual({ defs: {}, sources: {} });
        });

        test('#2 returns empty result when no packs configured', function () {
            var config = createMinimalConfig();
            var result = manager.loadMergedDefs(config, 'materials');
            expect(result).toEqual({ defs: {}, sources: {} });
        });

        test('#3 includes current pack definitions', function () {
            var tmpDir = createTempDir('mm-cpm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0' });
                config.contentPackPath = tmpDir;

                cp.writeDef(tmpDir, 'test', 'materials', 'my_custom_mat', {
                    friction: [0.3, 0.3, 0.3],
                    restitution: 0.5,
                });

                var result = manager.loadMergedDefs(config, 'materials');

                expect(result.defs.my_custom_mat).toBeDefined();
                expect(result.defs.my_custom_mat.friction[0]).toBe(0.3);
                expect(result.sources.my_custom_mat).toBe('current');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#4 current pack overrides dependency for same ID', function () {
            var depDir = createTempDir('mm-cpm-');
            var curDir = createTempDir('mm-cpm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(depDir, { id: 'dep:pack', version: '1.0' });
                cp.createContentPack(curDir, { id: 'cur:pack', version: '1.0' });
                config.dependencyPaths = [depDir];
                config.contentPackPath = curDir;

                // Dependency defines a material
                cp.writeDef(depDir, 'dep', 'materials', 'shared_mat', {
                    friction: [0.2, 0.2, 0.2],
                    restitution: 0.2,
                });

                // Current overrides it
                cp.writeDef(curDir, 'cur', 'materials', 'shared_mat', {
                    friction: [0.8, 0.8, 0.8],
                    restitution: 0.8,
                });

                var result = manager.loadMergedDefs(config, 'materials');

                expect(result.sources.shared_mat).toBe('current');
                expect(result.defs.shared_mat.friction[0]).toBe(0.8);
            } finally {
                cleanupTempDir(depDir);
                cleanupTempDir(curDir);
            }
        });

        test('#5 dependency pack definitions are included', function () {
            var tmpDir = createTempDir('mm-cpm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'dep:pack', version: '1.0' });
                config.dependencyPaths = [tmpDir];

                cp.writeDef(tmpDir, 'dep', 'materials', 'dep_mat', {
                    friction: [0.1, 0.1, 0.1],
                    restitution: 0.1,
                });

                var result = manager.loadMergedDefs(config, 'materials');

                expect(result.defs.dep_mat).toBeDefined();
                expect(result.sources.dep_mat).toBe('dependency:0');
                expect(result.defs.dep_mat.friction[0]).toBe(0.1);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#6 current pack overrides dependency pack', function () {
            var depDir = createTempDir('mm-cpm-');
            var curDir = createTempDir('mm-cpm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(depDir, { id: 'dep:pack', version: '1.0' });
                cp.createContentPack(curDir, { id: 'cur:pack', version: '1.0' });
                config.dependencyPaths = [depDir];
                config.contentPackPath = curDir;

                cp.writeDef(depDir, 'dep', 'materials', 'shared_mat', {
                    friction: [0.2, 0.2, 0.2],
                    restitution: 0.2,
                });

                cp.writeDef(curDir, 'cur', 'materials', 'shared_mat', {
                    friction: [0.8, 0.8, 0.8],
                    restitution: 0.8,
                });

                var result = manager.loadMergedDefs(config, 'materials');

                expect(result.sources.shared_mat).toBe('current');
                expect(result.defs.shared_mat.friction[0]).toBe(0.8);
            } finally {
                cleanupTempDir(depDir);
                cleanupTempDir(curDir);
            }
        });

        test('#7 multiple dependency packs — later overrides earlier', function () {
            var dep1Dir = createTempDir('mm-cpm-');
            var dep2Dir = createTempDir('mm-cpm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(dep1Dir, { id: 'dep1:pack', version: '1.0' });
                cp.createContentPack(dep2Dir, { id: 'dep2:pack', version: '1.0' });
                config.dependencyPaths = [dep1Dir, dep2Dir];

                cp.writeDef(dep1Dir, 'dep1', 'materials', 'shared_mat', {
                    friction: [0.3, 0.3, 0.3],
                    restitution: 0.3,
                });

                cp.writeDef(dep2Dir, 'dep2', 'materials', 'shared_mat', {
                    friction: [0.7, 0.7, 0.7],
                    restitution: 0.7,
                });

                var result = manager.loadMergedDefs(config, 'materials');

                expect(result.sources.shared_mat).toBe('dependency:1');
                expect(result.defs.shared_mat.friction[0]).toBe(0.7);
            } finally {
                cleanupTempDir(dep1Dir);
                cleanupTempDir(dep2Dir);
            }
        });

        test('#8 invalid dependency path — gracefully skipped', function () {
            var config = createMinimalConfig();
            config.dependencyPaths = ['/nonexistent/path/that/does/not/exist'];

            var result = manager.loadMergedDefs(config, 'materials');
            expect(result.defs).toBeDefined();
            expect(result.sources).toBeDefined();
        });

        test('#9 invalid current pack path — gracefully skipped', function () {
            var config = createMinimalConfig();
            config.contentPackPath = '/nonexistent/path/that/does/not/exist';

            var result = manager.loadMergedDefs(config, 'materials');
            expect(result.defs).toBeDefined();
            expect(result.sources).toBeDefined();
        });
    });

    // =========================================================================
    // resolveDefSource 测试
    // =========================================================================

    describe('resolveDefSource', function () {
        test('#10 returns null for unknown def when no packs', function () {
            var config = createMinimalConfig();
            var source = manager.resolveDefSource(config, 'materials', 'rha');
            expect(source).toBe(null);
        });

        test('#11 returns correct source for current pack def', function () {
            var tmpDir = createTempDir('mm-cpm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0' });
                config.contentPackPath = tmpDir;

                cp.writeDef(tmpDir, 'test', 'materials', 'my_mat', {
                    friction: [0.5, 0.5, 0.5],
                });

                var source = manager.resolveDefSource(config, 'materials', 'my_mat');
                expect(source).toBe('current');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#12 returns null for unknown def', function () {
            var config = createMinimalConfig();
            var source = manager.resolveDefSource(config, 'materials', 'nonexistent_def_xyz');
            expect(source).toBe(null);
        });
    });

    // =========================================================================
    // isDefEditable 测试
    // =========================================================================

    describe('isDefEditable', function () {
        test('#13 returns true for current pack def, false for unknown', function () {
            var tmpDir = createTempDir('mm-cpm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0' });
                config.contentPackPath = tmpDir;

                cp.writeDef(tmpDir, 'test', 'materials', 'editable_mat', {
                    friction: [0.4, 0.4, 0.4],
                });

                expect(manager.isDefEditable(config, 'materials', 'editable_mat')).toBe(true);
                expect(manager.isDefEditable(config, 'materials', 'rha')).toBe(false);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#14 returns false for dependency pack', function () {
            var depDir = createTempDir('mm-cpm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(depDir, { id: 'dep:pack', version: '1.0' });
                config.dependencyPaths = [depDir];

                cp.writeDef(depDir, 'dep', 'materials', 'dep_mat', {
                    friction: [0.2, 0.2, 0.2],
                });

                expect(manager.isDefEditable(config, 'materials', 'dep_mat')).toBe(false);
            } finally {
                cleanupTempDir(depDir);
            }
        });
    });

    // =========================================================================
    // getFirstDefId 测试
    // =========================================================================

    describe('getFirstDefId', function () {
        test('#15 returns first def from merged results', function () {
            var tmpDir = createTempDir('mm-cpm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0' });
                config.contentPackPath = tmpDir;

                cp.writeDef(tmpDir, 'test', 'materials', 'alpha_mat', { friction: [0.1, 0.1, 0.1] });
                cp.writeDef(tmpDir, 'test', 'materials', 'beta_mat', { friction: [0.2, 0.2, 0.2] });

                var firstId = manager.getFirstDefId(config, 'materials');
                expect(firstId).toBeTruthy();
                expect(typeof firstId).toBe('string');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#16 returns null when no defs', function () {
            var config = createMinimalConfig();
            var firstId = manager.getFirstDefId(config, 'materials');
            expect(firstId).toBe(null);
        });
    });

    // =========================================================================
    // getAvailableDefsForType 测试
    // =========================================================================

    describe('getAvailableDefsForType', function () {
        test('#17 returns defs mapping without sources', function () {
            var tmpDir = createTempDir('mm-cpm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0' });
                config.contentPackPath = tmpDir;

                cp.writeDef(tmpDir, 'test', 'materials', 'some_mat', { friction: [0.5, 0.5, 0.5] });

                var defs = manager.getAvailableDefsForType(config, 'materials');
                expect(defs).toBeDefined();
                expect(defs.some_mat).toBeDefined();
                expect(defs.sources).toBeUndefined();
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });

    // =========================================================================
    // invalidateCache 测试
    // =========================================================================

    describe('invalidateCache', function () {
        test('#18 forces re-read from disk', function () {
            var tmpDir = createTempDir('mm-cpm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0' });
                config.contentPackPath = tmpDir;

                var result1 = manager.loadMergedDefs(config, 'materials');
                expect(result1.defs.my_new_mat).toBeUndefined();

                cp.writeDef(tmpDir, 'test', 'materials', 'my_new_mat', {
                    friction: [0.6, 0.6, 0.6],
                });

                var result2 = manager.loadMergedDefs(config, 'materials');
                expect(result2.defs.my_new_mat).toBeUndefined();

                manager.invalidateCache();

                var result3 = manager.loadMergedDefs(config, 'materials');
                expect(result3.defs.my_new_mat).toBeDefined();
                expect(result3.defs.my_new_mat.friction[0]).toBe(0.6);
                expect(result3.sources.my_new_mat).toBe('current');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#19 invalidateCache clears all type caches', function () {
            var tmpDir = createTempDir('mm-cpm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0' });
                config.contentPackPath = tmpDir;

                cp.writeDef(tmpDir, 'test', 'materials', 'mat_a', { friction: [0.1, 0.1, 0.1] });
                cp.writeDef(tmpDir, 'test', 'connectors', 'conn_a', { type: 'test' });
                cp.writeDef(tmpDir, 'test', 'subsystems', 'sub_a', { type: 'test' });

                manager.loadMergedDefs(config, 'materials');
                manager.loadMergedDefs(config, 'connectors');
                manager.loadMergedDefs(config, 'subsystems');

                manager.invalidateCache();

                var result = manager.loadMergedDefs(config, 'materials');
                expect(result.defs.mat_a).toBeDefined();
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });

    // =========================================================================
    // 跨类型一致性测试
    // =========================================================================

    describe('cross-type consistency', function () {
        test('#20 connectors and subsystems types work with loadMergedDefs', function () {
            var tmpDir = createTempDir('mm-cpm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0' });
                config.contentPackPath = tmpDir;

                cp.writeDef(tmpDir, 'test', 'connectors', 'wheel_hub', { type: 'vehicle_wheel_hub' });
                cp.writeDef(tmpDir, 'test', 'subsystems', 'engine', { type: 'engine' });

                var connResult = manager.loadMergedDefs(config, 'connectors');
                expect(connResult.defs.wheel_hub).toBeDefined();
                expect(connResult.sources.wheel_hub).toBe('current');

                var subResult = manager.loadMergedDefs(config, 'subsystems');
                expect(subResult.defs.engine).toBeDefined();
                expect(subResult.sources.engine).toBe('current');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });
});
