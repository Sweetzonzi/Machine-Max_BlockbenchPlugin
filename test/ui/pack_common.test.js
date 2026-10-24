'use strict';

// 内容包对话框公共工具：applyPackPath / dependencyPathsFor / buildUnresolvedMessage
//
// applyPackPath 是「打开已有内容包」与「项目管理 → 内容包路径」两条入口的共同实现：
// 校验 meta.json → 按 meta.dependencies 在内容包父目录解析依赖 → 一次写入 config。
//
// 这里不装 Undo 假实现：runConfigEdit 在没有 Undo 时直接执行变更，正好只验证写入结果
// （撤销记录粒度由 test/ops/ops.test.js 的 setContentPack 用例锁定）。

const fs = require('fs');
const os = require('os');
const path = require('path');
const { describe, test, expect, afterAll } = require('bun:test');

const common = require('../../src/ui/dialogs/pack_common.js');
const helpers = require('../helpers.js');

const TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'mm-pack-common-'));

/**
 * 创建只含 meta.json 的临时内容包
 * @param {string} dirName - 相对 TMP_ROOT 的目录名
 * @param {Object} meta - meta.json 内容
 * @returns {string} 绝对路径
 */
function makePack(dirName, meta) {
    var dir = path.join(TMP_ROOT, dirName);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta), 'utf-8');
    return dir;
}

afterAll(function () {
    try {
        fs.rmSync(TMP_ROOT, { recursive: true, force: true });
    } catch (e) {
        // 忽略临时目录清理失败
    }
});

describe('pack_common.buildUnresolvedMessage', () => {
    test('列出全部 id 与搜索目录', function () {
        var msg = common.buildUnresolvedMessage(
            [{ id: 'machine_max:civilian' }, { id: 'machine_max:soviet_basic_kit' }],
            'D:/packs'
        );

        expect(msg).toContain('有 2 个依赖');
        expect(msg).toContain('machine_max:civilian、machine_max:soviet_basic_kit');
        expect(msg).toContain('D:/packs');
        expect(msg).toContain('管理依赖包');
    });

    test('超过 5 个时截断并补总数', function () {
        var unresolved = [];
        for (var i = 0; i < 7; i++) unresolved.push({ id: 'machine_max:dep' + i });

        var msg = common.buildUnresolvedMessage(unresolved, 'D:/packs');

        expect(msg).toContain('有 7 个依赖');
        expect(msg).toContain('machine_max:dep4');
        expect(msg).not.toContain('machine_max:dep5');
        expect(msg).toContain('等 7 个');
    });
});

describe('pack_common.dependencyPathsFor', () => {
    test('没声明依赖 → 清空（返回空数组）', function () {
        expect(common.dependencyPathsFor({ declaredCount: 0, paths: [] })).toEqual([]);
    });

    test('解析到依赖 → 用解析结果替换', function () {
        expect(common.dependencyPathsFor({ declaredCount: 2, paths: ['A', 'B'] }))
            .toEqual(['A', 'B']);
    });

    test('声明了但一条都没解析到 → undefined（保留原依赖）', function () {
        expect(common.dependencyPathsFor({ declaredCount: 1, paths: [] })).toBeUndefined();
    });
});

describe('pack_common.applyPackPath', () => {
    test('有效包：写入路径 / meta / namespace，并替换依赖（跳过内置包）', function () {
        var parent = path.join(TMP_ROOT, 'apply');
        fs.mkdirSync(parent, { recursive: true });
        var dep = makePack('apply/base', { id: 'machine_max:base', version: '1.0' });
        var app = makePack('apply/app', {
            id: 'machine_max:app',
            version: '1.0',
            dependencies: [
                { id: 'machine_max:builtin', type: 'hard' },
                { id: 'machine_max:base', type: 'hard' },
            ],
        });
        makePack('apply/builtin_dir', { id: 'machine_max:builtin', version: '1.0' });

        var cfg = helpers.createConfig({ contentPackPath: 'D:/old', dependencyPaths: ['D:/packs/old'] });
        var applied = common.applyPackPath(cfg, app, { strict: true });

        expect(applied.ok).toBe(true);
        expect(applied.valid).toBe(true);
        expect(cfg.contentPackPath).toBe(app);
        expect(cfg.packMeta.id).toBe('machine_max:app');
        expect(cfg.namespace).toBe('machine_max');
        expect(cfg.dependencyPaths).toEqual([dep]);
        expect(applied.resolution.declaredCount).toBe(1);
    });

    test('包没声明依赖 → 清掉上一个包残留的依赖路径', function () {
        var parent = path.join(TMP_ROOT, 'apply_empty');
        fs.mkdirSync(parent, { recursive: true });
        var plain = makePack('apply_empty/plain', {
            id: 'machine_max:plain',
            version: '1.0',
            dependencies: [{ id: 'machine_max:builtin', type: 'hard' }],
        });

        var cfg = helpers.createConfig({ dependencyPaths: ['D:/packs/stale'] });
        var applied = common.applyPackPath(cfg, plain, { strict: true });

        expect(applied.valid).toBe(true);
        expect(applied.dependencyPaths).toEqual([]);
        expect(cfg.dependencyPaths).toEqual([]);
    });

    test('声明了但同级找不到 → 保留原依赖并给出 unresolved', function () {
        var parent = path.join(TMP_ROOT, 'apply_missing');
        fs.mkdirSync(parent, { recursive: true });
        var app = makePack('apply_missing/app', {
            id: 'machine_max:app_missing',
            version: '1.0',
            dependencies: [{ id: 'machine_max:absent', type: 'hard' }],
        });

        var cfg = helpers.createConfig({ dependencyPaths: ['D:/packs/manual'] });
        var applied = common.applyPackPath(cfg, app, { strict: true });

        expect(applied.dependencyPaths).toBeUndefined();
        expect(cfg.dependencyPaths).toEqual(['D:/packs/manual']);
        expect(applied.resolution.unresolved.map(function (u) { return u.id; }))
            .toEqual(['machine_max:absent']);
        expect(common.buildUnresolvedMessage(applied.resolution.unresolved, applied.parentDir))
            .toContain('machine_max:absent');
    });

    test('strict：路径无效时拒绝，配置保持不变', function () {
        var cfg = helpers.createConfig({
            contentPackPath: 'D:/old',
            dependencyPaths: ['D:/packs/keep'],
        });
        var applied = common.applyPackPath(cfg, path.join(TMP_ROOT, 'nope'), { strict: true });

        expect(applied.ok).toBe(false);
        expect(applied.valid).toBe(false);
        expect(cfg.contentPackPath).toBe('D:/old');
        expect(cfg.dependencyPaths).toEqual(['D:/packs/keep']);
    });

    test('非 strict：路径无效也照写，但不动依赖', function () {
        var missing = path.join(TMP_ROOT, 'typed_by_hand');
        var cfg = helpers.createConfig({ dependencyPaths: ['D:/packs/keep'] });
        var applied = common.applyPackPath(cfg, missing, { strict: false });

        expect(applied.ok).toBe(true);
        expect(applied.valid).toBe(false);
        expect(cfg.contentPackPath).toBe(missing);
        expect(cfg.dependencyPaths).toEqual(['D:/packs/keep']);
    });

    test('空路径：只清 contentPackPath', function () {
        var cfg = helpers.createConfig({ contentPackPath: 'D:/old' });
        var applied = common.applyPackPath(cfg, '   ', { strict: true });

        expect(applied.ok).toBe(true);
        expect(applied.valid).toBe(false);
        expect(cfg.contentPackPath).toBe('');
    });
});
