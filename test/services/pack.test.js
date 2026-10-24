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
