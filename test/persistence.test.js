/**
 * persistence.test.js — 持久化模块单元测试
 *
 * 覆盖 registerProperty、loadConfig、saveConfig、getConfig、
 * setPackPath、addDependencyPath、removeDependencyPath。
 */

var path = require('path');
var fs = require('fs');
var pers = require('../src/utils/persistence.js');
var { createMinimalConfig, createTempDir, cleanupTempDir } = require('./helpers.js');
require('./mocks/blockbench.js');

describe('Persistence', function () {
    // ─── registerProperty ───────────────────────────────────────────────────

    test('registerProperty adds Property to ModelProject.properties', function () {
        // 清除已有注册
        delete ModelProject.properties[pers.PROPERTY_NAME];
        Project[pers.PROPERTY_NAME] = null;

        pers.registerProperty();

        expect(ModelProject.properties[pers.PROPERTY_NAME]).toBeTruthy();
        expect(ModelProject.properties[pers.PROPERTY_NAME].name).toBe(pers.PROPERTY_NAME);
    });

    test('registerProperty preserves existing data when Project already has config', function () {
        delete ModelProject.properties[pers.PROPERTY_NAME];
        var existingData = { $schema_version: 4, modelFile: 'preserved.bbmodel' };
        Project[pers.PROPERTY_NAME] = existingData;

        pers.registerProperty();

        // Property 构造器会设置 default: {}，但 registerProperty 应还原已有数据
        expect(Project[pers.PROPERTY_NAME]).toBe(existingData);
    });

    // ─── setPackPath ────────────────────────────────────────────────────────

    test('setPackPath updates config.contentPackPath', function () {
        var config = createMinimalConfig();
        pers.setPackPath(config, '/tmp/my_pack');
        expect(config.contentPackPath).toBe('/tmp/my_pack');
    });

    // ─── addDependencyPath ──────────────────────────────────────────────────

    test('addDependencyPath adds unique path', function () {
        var config = createMinimalConfig();
        pers.addDependencyPath(config, '/path/a');
        expect(config.dependencyPaths).toEqual(['/path/a']);
    });

    test('addDependencyPath deduplicates', function () {
        var config = createMinimalConfig();
        config.dependencyPaths = ['/path/a'];
        pers.addDependencyPath(config, '/path/a');
        expect(config.dependencyPaths).toEqual(['/path/a']);
    });

    test('addDependencyPath initializes dependencyPaths if missing', function () {
        var config = createMinimalConfig();
        delete config.dependencyPaths;
        pers.addDependencyPath(config, '/path/b');
        expect(config.dependencyPaths).toEqual(['/path/b']);
    });

    // ─── removeDependencyPath ───────────────────────────────────────────────

    test('removeDependencyPath removes existing path', function () {
        var config = createMinimalConfig();
        config.dependencyPaths = ['/path/a', '/path/b', '/path/c'];
        pers.removeDependencyPath(config, '/path/b');
        expect(config.dependencyPaths).toEqual(['/path/a', '/path/c']);
    });

    test('removeDependencyPath no-ops for non-existent path', function () {
        var config = createMinimalConfig();
        config.dependencyPaths = ['/path/a'];
        pers.removeDependencyPath(config, '/path/nonexistent');
        expect(config.dependencyPaths).toEqual(['/path/a']);
    });

    test('removeDependencyPath no-ops when dependencyPaths is missing', function () {
        var config = createMinimalConfig();
        delete config.dependencyPaths;
        pers.removeDependencyPath(config, '/path/a');
        expect(config.dependencyPaths).toBeUndefined();
    });

    // ─── saveConfig ─────────────────────────────────────────────────────────

    test('saveConfig writes sidecar file without *_defs fields', function () {
        var tmpDir = createTempDir('mm-test-save-');
        var bbmodelPath = path.join(tmpDir, 'my_model.bbmodel');
        var sidecarPath = bbmodelPath.replace(/\.bbmodel$/i, '.mm_project.json');

        try {
            // 模拟项目状态
            Project.file_path = bbmodelPath;
            Project[pers.PROPERTY_NAME] = createMinimalConfig();

            pers.saveConfig();

            // 验证侧载文件存在
            expect(fs.existsSync(sidecarPath)).toBe(true);

            var raw = JSON.parse(fs.readFileSync(sidecarPath, 'utf-8'));
            expect(raw.$schema_version).toBe(4);
            expect(raw.config).toBeTruthy();
            expect(raw.config.$schema_version).toBe(4);
            // 不应包含旧版 *_defs 字段
            expect(raw.config.connector_defs).toBeUndefined();
            expect(raw.config.subsystem_defs).toBeUndefined();
            expect(raw.config.material_defs).toBeUndefined();
        } finally {
            cleanupTempDir(tmpDir);
            Project.file_path = '';
            Project[pers.PROPERTY_NAME] = null;
        }
    });

    // ─── loadConfig ─────────────────────────────────────────────────────────

    test('loadConfig returns blank config when no data exists', function () {
        // 确保 Project 有 file_path 但无配置数据
        Project.file_path = '/tmp/test.bbmodel';
        Project[pers.PROPERTY_NAME] = null;

        var result = pers.loadConfig();

        expect(result).toBeTruthy();
        expect(result.$schema_version).toBe(4);
        expect(result.parts).toEqual({});
    });

    // ─── getConfig ──────────────────────────────────────────────────────────

    test('getConfig returns current config from Project', function () {
        var config = createMinimalConfig();
        Project[pers.PROPERTY_NAME] = config;

        var result = pers.getConfig();

        expect(result).toBe(config);
    });

    test('getConfig returns null when Project is unavailable', function () {
        // 保存原始 Project 引用
        var origProject = globalThis.Project;
        globalThis.Project = 0;

        var result = pers.getConfig();

        expect(result).toBeNull();

        // 恢复
        globalThis.Project = origProject;
    });
});
