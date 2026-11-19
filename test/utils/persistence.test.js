'use strict';

// utils/persistence.healNamespace 用例
//
// 回归：内容包 id 改名为 machine_max:m1a2_sep 后，内容目录仍叫 m1a2_sep，
// 旧工程里按 id 前缀推出来的 config.namespace（machine_max）会让新建零件、
// 生成语言键和导出都写进 machine_max/ 目录。加载时按包内实际目录纠正一次。
//
// 只测纯函数；loadConfig 依赖 Blockbench 的 Project 全局，不在单测里跑。

const fs = require('fs');
const os = require('os');
const path = require('path');
const { describe, test, expect, afterAll } = require('bun:test');

const persistence = require('../../src/utils/persistence.js');

const healNamespace = persistence._internals.healNamespace;
const TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'mm-persistence-'));

/**
 * 创建一个带命名空间目录的内容包
 *
 * @param {string} dirName - 包根目录名
 * @param {string} id - meta.id
 * @param {string[]} namespaces - 要创建的命名空间目录（内部建一个 materials/ 空目录）
 * @returns {string} 包根目录
 */
function makePack(dirName, id, namespaces) {
    var root = path.join(TMP_ROOT, dirName);
    fs.mkdirSync(root, { recursive: true });
    fs.writeFileSync(path.join(root, 'meta.json'), JSON.stringify({ id: id }), 'utf-8');
    namespaces.forEach(function (ns) {
        fs.mkdirSync(path.join(root, ns, 'materials'), { recursive: true });
    });
    return root;
}

afterAll(function () {
    try {
        fs.rmSync(TMP_ROOT, { recursive: true, force: true });
    } catch (e) {
        // 忽略临时目录清理失败
    }
});

describe('persistence.healNamespace', function () {
    test('命名空间以包内目录为准：按 id 前缀推出来的旧值被纠正', function () {
        var pack = makePack('m1a2_sep', 'machine_max:m1a2_sep', ['m1a2_sep']);
        var config = { contentPackPath: pack, namespace: 'machine_max' };

        expect(healNamespace(config)).toBe(true);
        expect(config.namespace).toBe('m1a2_sep');
    });

    test('作者手选的非主命名空间不会被改', function () {
        var pack = makePack('multi_ns', 'machine_max:multi_ns', ['machine_max', 'multi_ns']);
        var config = { contentPackPath: pack, namespace: 'machine_max' };

        expect(healNamespace(config)).toBe(false);
        expect(config.namespace).toBe('machine_max');
    });

    test('没有内容包路径 / 路径无效时保留原值', function () {
        var noPath = { namespace: 'machine_max' };
        expect(healNamespace(noPath)).toBe(false);
        expect(noPath.namespace).toBe('machine_max');

        var broken = {
            contentPackPath: path.join(TMP_ROOT, 'not_a_pack'),
            namespace: 'machine_max',
        };
        expect(healNamespace(broken)).toBe(false);
        expect(broken.namespace).toBe('machine_max');
    });

    test('包内没有内容目录时回退到 id 前缀，原值一致则不动', function () {
        var root = path.join(TMP_ROOT, 'empty_shell');
        fs.mkdirSync(root, { recursive: true });
        fs.writeFileSync(path.join(root, 'meta.json'), JSON.stringify({ id: 'machine_max:shell' }), 'utf-8');

        var config = { contentPackPath: root, namespace: 'machine_max' };
        expect(healNamespace(config)).toBe(false);
        expect(config.namespace).toBe('machine_max');
    });
});
