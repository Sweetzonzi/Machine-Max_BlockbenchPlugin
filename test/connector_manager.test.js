/**
 * connector_manager.test.js — connector_manager.js 单元测试
 *
 * 测试连接器定义资源管理器的所有 6 个公开函数：
 * listConnectors, createConnector, updateConnector, deleteConnector,
 * getConnectorTypes, getConnectorDirections
 *
 * 使用 bun test 框架: describe / test / expect
 * 遵循 TDD 原则：仅基于 connector_manager.js 的公开 API 编写测试
 */

var path = require('path');
var fs = require('fs');
var cp = require('../src/core/content_pack.js');
var manager = require('../src/core/content_pack_manager.js');
var cm = require('../src/managers/connector_manager.js');
var { createMinimalConfig, createTempDir, cleanupTempDir } = require('./helpers.js');

describe('ConnectorManager', function () {

    // 每个测试前清除缓存，避免测试间相互影响
    beforeEach(function () {
        manager.invalidateCache();
    });

    // =========================================================================
    // listConnectors 测试
    // =========================================================================

    describe('listConnectors', function () {
        test('#1 returns empty array when no pack path', function () {
            var config = createMinimalConfig();
            var connectors = cm.listConnectors(config);
            expect(Array.isArray(connectors)).toBe(true);
            expect(connectors.length).toBe(0);
        });

        test('#2 includes connectors from current pack', function () {
            var tmpDir = createTempDir('mm-cm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });
                config.contentPackPath = tmpDir;

                cp.writeDef(tmpDir, 'test', 'connectors', 'standard_joint', {
                    type: 'Simple',
                    direction: 'xp',
                    position: [0, 0, 0],
                });

                var connectors = cm.listConnectors(config);
                expect(connectors.length).toBe(1);
                expect(connectors[0].id).toBe('standard_joint');
                expect(connectors[0].data.type).toBe('Simple');
                expect(connectors[0].source).toBe('current');
                expect(connectors[0].editable).toBe(true);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#3 marks dependency connectors as not editable', function () {
            var depDir = createTempDir('mm-cm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(depDir, { id: 'dep:pack', version: '1.0', name: 'D', author: 'A', description: '' });
                config.dependencyPaths = [depDir];

                cp.writeDef(depDir, 'dep', 'connectors', 'dep_conn', {
                    type: 'Advanced',
                    direction: 'yp',
                });

                var connectors = cm.listConnectors(config);
                expect(connectors.length).toBe(1);
                expect(connectors[0].id).toBe('dep_conn');
                expect(connectors[0].source).toBe('dependency:0');
                expect(connectors[0].editable).toBe(false);
            } finally {
                cleanupTempDir(depDir);
            }
        });
    });

    // =========================================================================
    // createConnector 测试
    // =========================================================================

    describe('createConnector', function () {
        test('#4 writes connector to current pack directory', function () {
            var tmpDir = createTempDir('mm-cm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });
                config.contentPackPath = tmpDir;

                cm.createConnector(config, 'my_new_conn', {
                    type: 'Simple',
                    direction: 'xn',
                    position: [1, 2, 3],
                });

                // 验证文件已写入
                var filePath = path.join(tmpDir, 'test', 'connectors', 'my_new_conn.json');
                expect(fs.existsSync(filePath)).toBe(true);

                // 验证可通过 listConnectors 读取
                var connectors = cm.listConnectors(config);
                var conn = connectors.find(function (c) { return c.id === 'my_new_conn'; });
                expect(conn).toBeDefined();
                expect(conn.data.type).toBe('Simple');
                expect(conn.data.direction).toBe('xn');
                expect(conn.data.position[0]).toBe(1);
                expect(conn.source).toBe('current');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#5 throws when no contentPackPath', function () {
            var config = createMinimalConfig();
            expect(function () {
                cm.createConnector(config, 'orphan_conn', { type: 'Simple' });
            }).toThrow('当前没有关联的内容包，无法创建连接器');
        });

        test('#6 throws when connector already exists in current pack', function () {
            var tmpDir = createTempDir('mm-cm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });
                config.contentPackPath = tmpDir;

                cp.writeDef(tmpDir, 'test', 'connectors', 'existing_conn', {
                    type: 'Simple',
                    direction: 'zp',
                });

                expect(function () {
                    cm.createConnector(config, 'existing_conn', { type: 'Advanced' });
                }).toThrow('连接器 "existing_conn" 已存在，请使用更新操作');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#7 throws when connector exists in dependency pack', function () {
            var depDir = createTempDir('mm-cm-');
            var curDir = createTempDir('mm-cm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(depDir, { id: 'dep:pack', version: '1.0', name: 'D', author: 'A', description: '' });
                cp.createContentPack(curDir, { id: 'cur:pack', version: '1.0', name: 'C', author: 'A', description: '' });
                config.dependencyPaths = [depDir];
                config.contentPackPath = curDir;

                cp.writeDef(depDir, 'dep', 'connectors', 'dep_conn', {
                    type: 'Advanced',
                    direction: 'yn',
                });

                expect(function () {
                    cm.createConnector(config, 'dep_conn', { type: 'Simple' });
                }).toThrow('不能覆盖依赖包中的连接器 "dep_conn"');
            } finally {
                cleanupTempDir(depDir);
                cleanupTempDir(curDir);
            }
        });
    });

    // =========================================================================
    // updateConnector 测试
    // =========================================================================

    describe('updateConnector', function () {
        test('#8 updates existing connector in current pack', function () {
            var tmpDir = createTempDir('mm-cm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });
                config.contentPackPath = tmpDir;

                cp.writeDef(tmpDir, 'test', 'connectors', 'my_conn', {
                    type: 'Simple',
                    direction: 'xp',
                    position: [0, 0, 0],
                });

                cm.updateConnector(config, 'my_conn', {
                    type: 'Advanced',
                    direction: 'xn',
                    position: [10, 20, 30],
                });

                var connectors = cm.listConnectors(config);
                var conn = connectors.find(function (c) { return c.id === 'my_conn'; });
                expect(conn.data.type).toBe('Advanced');
                expect(conn.data.direction).toBe('xn');
                expect(conn.data.position[0]).toBe(10);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#9 throws for dependency connector', function () {
            var depDir = createTempDir('mm-cm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(depDir, { id: 'dep:pack', version: '1.0', name: 'D', author: 'A', description: '' });
                config.dependencyPaths = [depDir];

                cp.writeDef(depDir, 'dep', 'connectors', 'dep_conn', {
                    type: 'Simple',
                    direction: 'zp',
                });

                expect(function () {
                    cm.updateConnector(config, 'dep_conn', { type: 'Advanced' });
                }).toThrow('不能修改内置或依赖包的连接器 "dep_conn"');
            } finally {
                cleanupTempDir(depDir);
            }
        });
    });

    // =========================================================================
    // deleteConnector 测试
    // =========================================================================

    describe('deleteConnector', function () {
        test('#10 removes connector from current pack', function () {
            var tmpDir = createTempDir('mm-cm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });
                config.contentPackPath = tmpDir;

                cp.writeDef(tmpDir, 'test', 'connectors', 'to_delete', {
                    type: 'Simple',
                    direction: 'xp',
                });

                expect(cm.listConnectors(config).length).toBe(1);

                cm.deleteConnector(config, 'to_delete');

                expect(cm.listConnectors(config).length).toBe(0);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#11 throws for dependency connector', function () {
            var depDir = createTempDir('mm-cm-');
            try {
                var config = createMinimalConfig();
                cp.createContentPack(depDir, { id: 'dep:pack', version: '1.0', name: 'D', author: 'A', description: '' });
                config.dependencyPaths = [depDir];

                cp.writeDef(depDir, 'dep', 'connectors', 'dep_conn', {
                    type: 'Advanced',
                    direction: 'yn',
                });

                expect(function () {
                    cm.deleteConnector(config, 'dep_conn');
                }).toThrow('不能删除内置或依赖包的连接器 "dep_conn"');
            } finally {
                cleanupTempDir(depDir);
            }
        });
    });

    // =========================================================================
    // getConnectorTypes 测试
    // =========================================================================

    describe('getConnectorTypes', function () {
        test('#12 returns Simple and Advanced types', function () {
            var types = cm.getConnectorTypes();
            expect(Array.isArray(types)).toBe(true);
            expect(types.length).toBe(2);
            expect(types).toContain('Simple');
            expect(types).toContain('Advanced');
        });
    });

    // =========================================================================
    // getConnectorDirections 测试
    // =========================================================================

    describe('getConnectorDirections', function () {
        test('#13 returns 6 direction identifiers', function () {
            var directions = cm.getConnectorDirections();
            expect(Array.isArray(directions)).toBe(true);
            expect(directions.length).toBe(6);
            expect(directions).toContain('xp');
            expect(directions).toContain('yp');
            expect(directions).toContain('zp');
            expect(directions).toContain('xn');
            expect(directions).toContain('yn');
            expect(directions).toContain('zn');
        });
    });
});
