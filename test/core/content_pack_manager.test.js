'use strict';

// core/content_pack_manager 合并视图缓存用例
//
// 回归：缓存曾经只按 type 建键，切换内容包 / 增删依赖后仍返回旧来源的定义，
// 表现为「投射物能加载、材料与子系统不更新」（校验先预热了后三者的缓存）。

const fs = require('fs');
const os = require('os');
const path = require('path');
const { describe, test, expect, beforeEach, afterAll } = require('bun:test');

const cpm = require('../../src/core/content_pack_manager.js');

const TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'mm-cpm-'));

/**
 * 在临时目录下创建一个最小内容包
 * @param {string} dirName - 目录名
 * @param {string} id - meta.id（namespace:name）
 * @param {Object<string, Object<string, Object>>} defs - { type: { defId: data } }
 * @returns {string} 内容包根目录
 */
function makePack(dirName, id, defs) {
    var root = path.join(TMP_ROOT, dirName);
    var namespace = id.split(':')[0];

    fs.mkdirSync(root, { recursive: true });
    fs.writeFileSync(path.join(root, 'meta.json'), JSON.stringify({ id: id, version: '1.0' }), 'utf-8');

    Object.keys(defs).forEach(function (type) {
        var typeDir = path.join(root, namespace, type);
        fs.mkdirSync(typeDir, { recursive: true });
        Object.keys(defs[type]).forEach(function (defId) {
            var defPath = path.join(typeDir, defId + '.json');
            fs.mkdirSync(path.dirname(defPath), { recursive: true });
            fs.writeFileSync(defPath, JSON.stringify(defs[type][defId]), 'utf-8');
        });
    });

    return root;
}

beforeEach(function () {
    cpm.invalidateCache();
});

afterAll(function () {
    try {
        fs.rmSync(TMP_ROOT, { recursive: true, force: true });
    } catch (e) {
        // 忽略临时目录清理失败
    }
});

describe('content_pack_manager 合并视图缓存', function () {
    test('切换 contentPackPath 后不再返回上一个包的定义', function () {
        var packA = makePack('switch_a', 'machine_max:pack_a', {
            materials: { alpha: { rha: 1 } },
        });
        var packB = makePack('switch_b', 'machine_max:pack_b', {
            materials: { beta: { rha: 2 } },
        });

        var configA = { contentPackPath: packA, dependencyPaths: [] };
        expect(Object.keys(cpm.loadMergedDefs(configA, 'materials').defs)).toEqual(['machine_max:alpha']);

        var configB = { contentPackPath: packB, dependencyPaths: [] };
        var mergedB = cpm.loadMergedDefs(configB, 'materials');
        expect(Object.keys(mergedB.defs)).toEqual(['machine_max:beta']);
        expect(mergedB.sources['machine_max:beta']).toBe('current');
    });

    test('切换工程（两个 config 对象）时缓存同样失效', function () {
        var packA = makePack('project_a', 'machine_max:project_a', {
            subsystems: { engine_a: { type: 'machine_max:engine' } },
        });
        var packB = makePack('project_b', 'machine_max:project_b', {
            subsystems: { engine_b: { type: 'machine_max:engine' } },
        });

        var projectA = { contentPackPath: packA, dependencyPaths: [] };
        var projectB = { contentPackPath: packB, dependencyPaths: [] };

        expect(Object.keys(cpm.loadMergedDefs(projectA, 'subsystems').defs)).toEqual(['machine_max:engine_a']);
        expect(Object.keys(cpm.loadMergedDefs(projectB, 'subsystems').defs)).toEqual(['machine_max:engine_b']);
    });

    test('新增依赖包后合并视图包含依赖定义', function () {
        var current = makePack('dep_current', 'machine_max:current', {
            materials: { own: { rha: 1 } },
        });
        var dependency = makePack('dep_pack', 'machine_max:dep_pack', {
            materials: { borrowed: { rha: 3 } },
            subsystems: { 'weapons/nested': { type: 'machine_max:launcher' } },
        });

        var config = { contentPackPath: current, dependencyPaths: [] };
        expect(Object.keys(cpm.loadMergedDefs(config, 'materials').defs)).toEqual(['machine_max:own']);

        // 模拟依赖编辑器原地 push（真实调用点也是直接修改 config）
        config.dependencyPaths.push(dependency);

        var materials = cpm.loadMergedDefs(config, 'materials');
        expect(Object.keys(materials.defs).sort()).toEqual(['machine_max:borrowed', 'machine_max:own']);
        expect(materials.sources['machine_max:borrowed']).toBe('dependency:0');

        // 嵌套子目录的子系统定义也要能读到
        var subsystems = cpm.loadMergedDefs(config, 'subsystems');
        expect(Object.keys(subsystems.defs)).toEqual(['machine_max:nested']);
    });

    test('空 config 缓存的空结果不会污染后续有效配置', function () {
        var pack = makePack('after_null', 'machine_max:after_null', {
            materials: { steel: { rha: 1 } },
        });

        expect(cpm.loadMergedDefs(null, 'materials').defs).toEqual({});

        var config = { contentPackPath: pack, dependencyPaths: [] };
        expect(Object.keys(cpm.loadMergedDefs(config, 'materials').defs)).toEqual(['machine_max:steel']);
    });

    test('dependencyPaths 中指向内置包的路径被忽略（来源仍为 builtin）', function () {
        var current = makePack('builtin_skip_current', 'machine_max:current', {
            materials: { own: { rha: 1 } },
        });
        var builtinLike = makePack('builtin_skip_pack', 'machine_max:builtin', {
            materials: { from_builtin_dir: { rha: 2 } },
        });

        var config = { contentPackPath: current, dependencyPaths: [builtinLike] };
        var merged = cpm.loadMergedDefs(config, 'materials');

        // 内置包目录被跳过：既不重复读取，也不会把来源标成 dependency:0
        expect(Object.keys(merged.defs)).toEqual(['machine_max:own']);
        expect(merged.sources['machine_max:own']).toBe('current');
    });

    test('当前包指向内置包时不会把内置定义标成 current', function () {
        var builtinLike = makePack('builtin_as_current', 'machine_max:builtin', {
            materials: { from_builtin_dir: { rha: 2 } },
        });

        var config = { contentPackPath: builtinLike, dependencyPaths: [] };
        var merged = cpm.loadMergedDefs(config, 'materials');

        // 测试环境里内置包为空；关键是 current 层没有把目录内容当可编辑定义加载
        expect(merged.defs).toEqual({});
    });

    test('invalidateCache 强制重新读取磁盘（同一路径下编辑定义）', function () {
        var pack = makePack('reload', 'machine_max:reload', {
            materials: { steel: { rha: 1 } },
        });
        var config = { contentPackPath: pack, dependencyPaths: [] };

        expect(cpm.loadMergedDefs(config, 'materials').defs['machine_max:steel'].rha).toBe(1);

        fs.writeFileSync(
            path.join(pack, 'machine_max', 'materials', 'steel.json'),
            JSON.stringify({ rha: 9 }),
            'utf-8'
        );

        cpm.invalidateCache();
        expect(cpm.loadMergedDefs(config, 'materials').defs['machine_max:steel'].rha).toBe(9);
    });
});
