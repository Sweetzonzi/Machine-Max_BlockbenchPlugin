'use strict';

// services/pack 链式依赖解析用例
//
// 回归：内容包 meta.dependencies 默认带 "machine_max:builtin hard"（导出时自动补），
// 链式解析曾把同级目录 Machine-Max_Builtin 当作间接依赖写进 dependencyPaths，
// 导致内置定义被重复读取、来源标成 dependency。

const fs = require('fs');
const os = require('os');
const path = require('path');
const { describe, test, expect, afterAll } = require('bun:test');

const packService = require('../../src/services/pack.js');

const TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'mm-pack-svc-'));

/**
 * 创建只含 meta.json 的临时内容包
 * @param {string} dirName
 * @param {Object} meta
 * @returns {string}
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

describe('services/pack 链式依赖解析', () => {
    test('跳过内置包 machine_max:builtin，只解析真实间接依赖', function () {
        var parent = path.join(TMP_ROOT, 'chain');
        fs.mkdirSync(parent, { recursive: true });

        var direct = makePack('chain/direct_pack', {
            id: 'machine_max:direct',
            version: '1.0',
            dependencies: [
                { id: 'machine_max:builtin', type: 'hard' },
                { id: 'machine_max:other', type: 'hard' },
            ],
        });
        makePack('chain/builtin_pack', { id: 'machine_max:builtin', version: '1.0' });
        var other = makePack('chain/other_pack', { id: 'machine_max:other', version: '1.0' });

        var resolved = packService.resolveChainDependencies(
            [{ path: direct, type: 'hard' }],
            parent
        );

        expect(resolved.direct.length).toBe(1);
        expect(resolved.indirect.length).toBe(1);
        expect(resolved.indirect[0].path).toBe(other);
        expect(resolved.indirect[0].isIndirect).toBe(true);
    });

    test('findPackInSiblings 不会返回内置包路径', function () {
        var parent = path.join(TMP_ROOT, 'find');
        fs.mkdirSync(parent, { recursive: true });
        makePack('find/builtin_pack', { id: 'machine_max:builtin', version: '1.0' });

        expect(packService.findPackInSiblings(parent, 'machine_max:builtin')).toBeNull();
        expect(packService.isBuiltinPackPath(path.join(parent, 'builtin_pack'))).toBe(true);
        expect(packService.filterBuiltinDeps([path.join(parent, 'builtin_pack')])).toEqual([]);
    });
});

describe('services/pack 按 meta.dependencies 解析本地依赖（打开已有内容包）', () => {
    test('解析直接依赖 + 一层间接依赖，跳过内置包，未找到的进 unresolved', function () {
        var parent = path.join(TMP_ROOT, 'declared');
        fs.mkdirSync(parent, { recursive: true });

        var app = makePack('declared/app', {
            id: 'machine_max:app',
            version: '1.0',
            dependencies: [
                { id: 'machine_max:builtin', type: 'hard' },
                { id: 'machine_max:base', type: 'hard' },
                { id: 'machine_max:missing', type: 'soft' },
            ],
        });
        var base = makePack('declared/base', {
            id: 'machine_max:base',
            version: '1.0',
            dependencies: [{ id: 'machine_max:util', type: 'hard' }],
        });
        var util = makePack('declared/util', { id: 'machine_max:util', version: '1.0' });
        // 同级目录里放了内置包，也不应被当成依赖
        makePack('declared/builtin_dir', { id: 'machine_max:builtin', version: '1.0' });

        var meta = packService.readPackMeta(app);
        var r = packService.resolveDeclaredDependencies(meta.dependencies, parent, {
            selfId: meta.id,
            selfPath: app,
        });

        expect(r.direct.map(function (d) { return d.path; })).toEqual([base]);
        expect(r.indirect.map(function (d) { return d.path; })).toEqual([util]);
        expect(r.unresolved.map(function (u) { return u.id; })).toEqual(['machine_max:missing']);
        expect(r.paths).toEqual([base, util]);
        // 内置包不计入声明数：base + missing
        expect(r.declaredCount).toBe(2);
    });

    test('全部解析成功时 unresolved 为空', function () {
        var parent = path.join(TMP_ROOT, 'declared_ok');
        fs.mkdirSync(parent, { recursive: true });

        var app = makePack('declared_ok/app', {
            id: 'machine_max:app2',
            version: '1.0',
            dependencies: [{ id: 'machine_max:dep2', type: 'hard' }],
        });
        var dep = makePack('declared_ok/dep2', { id: 'machine_max:dep2', version: '1.0' });

        var r = packService.resolveDeclaredDependencies(
            packService.readPackMeta(app).dependencies,
            parent,
            { selfId: 'machine_max:app2', selfPath: app }
        );

        expect(r.direct.map(function (d) { return d.path; })).toEqual([dep]);
        expect(r.unresolved).toEqual([]);
        expect(r.paths).toEqual([dep]);
    });

    test('字符串形式的依赖 id 同样可解析', function () {
        var parent = path.join(TMP_ROOT, 'declared_str');
        fs.mkdirSync(parent, { recursive: true });
        var dep = makePack('declared_str/dep3', { id: 'machine_max:dep3', version: '1.0' });

        var r = packService.resolveDeclaredDependencies(['machine_max:dep3'], parent, {});

        expect(r.direct.map(function (d) { return d.path; })).toEqual([dep]);
        expect(r.direct[0].type).toBe('hard');
    });

    test('自引用不解析、不报未找到', function () {
        var parent = path.join(TMP_ROOT, 'declared_self');
        fs.mkdirSync(parent, { recursive: true });
        var self = makePack('declared_self/selfpack', {
            id: 'machine_max:self',
            version: '1.0',
            dependencies: [{ id: 'machine_max:self', type: 'hard' }],
        });

        var r = packService.resolveDeclaredDependencies(
            packService.readPackMeta(self).dependencies,
            parent,
            { selfId: 'machine_max:self', selfPath: self }
        );

        expect(r.direct).toEqual([]);
        expect(r.unresolved).toEqual([]);
        expect(r.paths).toEqual([]);
    });

    test('异常入参返回空结果，不抛错', function () {
        expect(packService.resolveDeclaredDependencies(null, TMP_ROOT, {}).paths).toEqual([]);
        expect(packService.resolveDeclaredDependencies([{ id: 'x' }], '', {}).paths).toEqual([]);
    });
});
