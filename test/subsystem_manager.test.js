/**
 * subsystem_manager.test.js — subsystem_manager.js 单元测试
 *
 * 测试子系统定义管理器的所有 6 个公开函数：
 * listSubsystems, createSubsystem, updateSubsystem,
 * deleteSubsystem, getSubsystemTypes, getTypeFields
 *
 * 使用 bun test 框架: describe / test / expect
 * 遵循 TDD 原则：仅基于 subsystem_manager.js 的公开 API 编写测试
 */

var path = require('path');
var cp = require('../src/core/content_pack.js');
var manager = require('../src/managers/subsystem_manager.js');
var content_pack_manager = require('../src/core/content_pack_manager.js');
var { createMinimalConfig, createTempDir, cleanupTempDir } = require('./helpers.js');

describe('SubsystemManager', function () {

    // 每个测试前清除缓存，避免测试间相互影响
    beforeEach(function () {
        content_pack_manager.invalidateCache();
    });

    // =========================================================================
    // listSubsystems 测试
    // =========================================================================

    describe('listSubsystems', function () {
        test('#1 returns empty array when no pack path', function () {
            var config = createMinimalConfig();
            var result = manager.listSubsystems(config);
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });

        test('#2 returns empty array for null config', function () {
            var result = manager.listSubsystems(null);
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });

        test('#3 includes subsystems from current pack', function () {
            var tmpDir = createTempDir('mm-sub-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0' });
                config.contentPackPath = tmpDir;

                cp.writeDef(tmpDir, 'test', 'subsystems', 'test_engine', {
                    type: 'machine_max:engine',
                    max_power: 100,
                });

                var result = manager.listSubsystems(config);

                expect(result.length).toBe(1);
                expect(result[0].id).toBe('test_engine');
                expect(result[0].data.type).toBe('machine_max:engine');
                expect(result[0].source).toBe('current');
                expect(result[0].editable).toBe(true);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#4 marks dependency subsystems as non-editable', function () {
            var depDir = createTempDir('mm-sub-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(depDir, { id: 'dep:pack', version: '1.0' });
                config.dependencyPaths = [depDir];

                cp.writeDef(depDir, 'dep', 'subsystems', 'dep_engine', {
                    type: 'machine_max:engine',
                    max_power: 50,
                });

                var result = manager.listSubsystems(config);

                expect(result.length).toBe(1);
                expect(result[0].id).toBe('dep_engine');
                expect(result[0].source).toBe('dependency:0');
                expect(result[0].editable).toBe(false);
            } finally {
                cleanupTempDir(depDir);
            }
        });
    });

    // =========================================================================
    // createSubsystem 测试
    // =========================================================================

    describe('createSubsystem', function () {
        test('#5 creates subsystem in current pack', function () {
            var tmpDir = createTempDir('mm-sub-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0' });
                config.contentPackPath = tmpDir;

                var result = manager.createSubsystem(config, 'new_engine', {
                    type: 'machine_max:engine',
                    max_power: 200,
                    max_torque: 300,
                });

                expect(result.success).toBe(true);
                expect(result.error).toBe(null);

                // Verify it was actually written
                var listed = manager.listSubsystems(config);
                expect(listed.some(function (s) { return s.id === 'new_engine'; })).toBe(true);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#6 returns error for invalid ID', function () {
            var result = manager.createSubsystem({}, '', { type: 'machine_max:engine' });
            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });

        test('#7 returns error when no pack path set', function () {
            var config = createMinimalConfig();
            var result = manager.createSubsystem(config, 'orphan_engine', { type: 'machine_max:engine' });
            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });
    });

    // =========================================================================
    // updateSubsystem 测试
    // =========================================================================

    describe('updateSubsystem', function () {
        test('#8 updates existing subsystem in current pack', function () {
            var tmpDir = createTempDir('mm-sub-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0' });
                config.contentPackPath = tmpDir;

                manager.createSubsystem(config, 'updatable_engine', {
                    type: 'machine_max:engine',
                    max_power: 100,
                });

                var result = manager.updateSubsystem(config, 'updatable_engine', {
                    type: 'machine_max:engine',
                    max_power: 999,
                });

                expect(result.success).toBe(true);
                expect(result.error).toBe(null);

                // Verify the update
                var listed = manager.listSubsystems(config);
                var found = listed.filter(function (s) { return s.id === 'updatable_engine'; });
                expect(found.length).toBe(1);
                expect(found[0].data.max_power).toBe(999);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#9 returns error for invalid ID', function () {
            var result = manager.updateSubsystem({}, '', { type: 'machine_max:engine' });
            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });

        test('#10 returns error for non-editable subsystem', function () {
            var depDir = createTempDir('mm-sub-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(depDir, { id: 'dep:pack', version: '1.0' });
                config.dependencyPaths = [depDir];

                cp.writeDef(depDir, 'dep', 'subsystems', 'dep_engine', {
                    type: 'machine_max:engine',
                    max_power: 50,
                });

                var result = manager.updateSubsystem(config, 'dep_engine', {
                    type: 'machine_max:engine',
                    max_power: 999,
                });

                expect(result.success).toBe(false);
                expect(result.error).toMatch(/不可编辑/);
            } finally {
                cleanupTempDir(depDir);
            }
        });
    });

    // =========================================================================
    // deleteSubsystem 测试
    // =========================================================================

    describe('deleteSubsystem', function () {
        test('#11 deletes subsystem from current pack', function () {
            var tmpDir = createTempDir('mm-sub-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0' });
                config.contentPackPath = tmpDir;

                manager.createSubsystem(config, 'delete_me', {
                    type: 'machine_max:engine',
                    max_power: 100,
                });

                var result = manager.deleteSubsystem(config, 'delete_me');

                expect(result.success).toBe(true);
                expect(result.error).toBe(null);

                // Verify it's gone
                var listed = manager.listSubsystems(config);
                expect(listed.some(function (s) { return s.id === 'delete_me'; })).toBe(false);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#12 returns error for invalid ID', function () {
            var result = manager.deleteSubsystem({}, '');
            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });

        test('#13 returns error for non-editable subsystem', function () {
            var depDir = createTempDir('mm-sub-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(depDir, { id: 'dep:pack', version: '1.0' });
                config.dependencyPaths = [depDir];

                cp.writeDef(depDir, 'dep', 'subsystems', 'dep_engine', {
                    type: 'machine_max:engine',
                });

                var result = manager.deleteSubsystem(config, 'dep_engine');

                expect(result.success).toBe(false);
                expect(result.error).toMatch(/不可删除/);
            } finally {
                cleanupTempDir(depDir);
            }
        });
    });

    // =========================================================================
    // getSubsystemTypes 测试
    // =========================================================================

    describe('getSubsystemTypes', function () {
        test('#14 returns array of types', function () {
            var types = manager.getSubsystemTypes();
            expect(Array.isArray(types)).toBe(true);
            expect(types.length).toBeGreaterThan(0);
        });

        test('#15 includes machine_max:engine', function () {
            var types = manager.getSubsystemTypes();
            expect(types.indexOf('machine_max:engine')).not.toBe(-1);
        });

        test('#16 returns a copy (not the internal array)', function () {
            var types1 = manager.getSubsystemTypes();
            var types2 = manager.getSubsystemTypes();
            expect(types1).not.toBe(types2);
            expect(types1).toEqual(types2);
        });
    });

    // =========================================================================
    // getTypeFields 测试
    // =========================================================================

    describe('getTypeFields', function () {
        test('#17 returns array for known type machine_max:engine', function () {
            var fields = manager.getTypeFields('machine_max:engine');
            expect(Array.isArray(fields)).toBe(true);
            expect(fields.length).toBeGreaterThan(0);
            expect(fields.indexOf('max_power')).not.toBe(-1);
            expect(fields.indexOf('max_torque')).not.toBe(-1);
        });

        test('#18 returns empty array for unknown type', function () {
            var fields = manager.getTypeFields('machine_max:nonexistent_type');
            expect(Array.isArray(fields)).toBe(true);
            expect(fields.length).toBe(0);
        });

        test('#19 returns empty array for null type', function () {
            var fields = manager.getTypeFields(null);
            expect(Array.isArray(fields)).toBe(true);
            expect(fields.length).toBe(0);
        });
    });
});
