'use strict';

// core/content_pack 命名空间解析用例
//
// 回归：插件曾用 meta.id 冒号前的部分当内容命名空间。包 id 改成
// machine_max:m1a2_sep 之后，内容目录仍叫 m1a2_sep，于是插件去读
// machine_max/ 目录、一个定义都读不到，表现为「打开 M1A2 只加载了内置包
// 与 US kit，本包内容为空」。命名空间应由包内目录结构决定，与包 id 无关。

const fs = require('fs');
const os = require('os');
const path = require('path');
const { describe, test, expect, afterAll } = require('bun:test');

const contentPack = require('../../src/core/content_pack.js');
const cpm = require('../../src/core/content_pack_manager.js');

const TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'mm-content-pack-'));

/**
 * 在临时目录下创建一个内容包
 *
 * @param {string} dirName - 包根目录名
 * @param {string} id - meta.id
 * @param {Object<string, Object<string, Object>>} defs - { namespace: { type: { defId: data } } }
 * @returns {string} 包根目录
 */
function makePack(dirName, id, defs) {
    var root = path.join(TMP_ROOT, dirName);
    fs.mkdirSync(root, { recursive: true });
    fs.writeFileSync(path.join(root, 'meta.json'), JSON.stringify({ id: id, version: '1.0' }), 'utf-8');

    Object.keys(defs).forEach(function (ns) {
        Object.keys(defs[ns]).forEach(function (type) {
            var typeDir = path.join(root, ns, type);
            fs.mkdirSync(typeDir, { recursive: true });
            Object.keys(defs[ns][type]).forEach(function (defId) {
                fs.writeFileSync(
                    path.join(typeDir, defId + '.json'),
                    JSON.stringify(defs[ns][type][defId]),
                    'utf-8'
                );
            });
        });
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

describe('content_pack 命名空间解析', function () {
    test('命名空间取包内目录，不取 meta.id 前缀', function () {
        var root = makePack('m1a2_sep', 'machine_max:m1a2_sep', {
            m1a2_sep: { materials: { us_steel: { rha: 1 } } },
        });

        var opened = contentPack.openContentPack(root);

        expect(opened.valid).toBe(true);
        expect(opened.namespaces).toEqual(['m1a2_sep']);
        expect(opened.namespace).toBe('m1a2_sep');
    });

    test('命名空间目录只含 particles 这类内容子目录也能识别', function () {
        var root = makePack('particles_only', 'machine_max:particles_only', {
            particles_only: { particles: { spark: { texture: 'x' } } },
        });

        var opened = contentPack.openContentPack(root);

        expect(opened.namespaces).toEqual(['particles_only']);
        expect(opened.namespace).toBe('particles_only');
    });

    test('内置包这类「目录名等于 id 前缀」的包仍然正常', function () {
        var root = makePack('builtin_like', 'machine_max:builtin', {
            machine_max: { materials: { structural_steel: { rha: 1 } } },
        });

        var opened = contentPack.openContentPack(root);

        expect(opened.namespaces).toEqual(['machine_max']);
        expect(opened.namespace).toBe('machine_max');
    });

    test('一个包可以有多个命名空间，主命名空间优先取与包名同名的那个', function () {
        var root = makePack('multi_ns', 'machine_max:multi_ns', {
            machine_max: { materials: { shared: { rha: 1 } } },
            multi_ns: { subsystems: { engine: { type: 'machine_max:engine' } } },
        });

        var opened = contentPack.openContentPack(root);

        expect(opened.namespaces.sort()).toEqual(['machine_max', 'multi_ns']);
        expect(opened.namespace).toBe('multi_ns');
    });

    test('包内没有内容目录时回退到 id 前缀（保留先填路径的空壳流程）', function () {
        var root = path.join(TMP_ROOT, 'empty_shell');
        fs.mkdirSync(root, { recursive: true });
        fs.writeFileSync(path.join(root, 'meta.json'), JSON.stringify({ id: 'machine_max:shell' }), 'utf-8');

        var opened = contentPack.openContentPack(root);

        expect(opened.valid).toBe(true);
        expect(opened.namespaces).toEqual(['machine_max']);
    });

    test('readAllDefsByNamespace 给键加上各自命名空间前缀', function () {
        var root = makePack('multi_ns_defs', 'machine_max:multi_ns_defs', {
            machine_max: { materials: { shared: { rha: 1 } } },
            multi_ns_defs: { materials: { own: { rha: 2 } } },
        });

        var defs = contentPack.readAllDefsByNamespace(root, ['machine_max', 'multi_ns_defs'], 'materials');

        expect(Object.keys(defs).sort()).toEqual(['machine_max:shared', 'multi_ns_defs:own']);
        expect(defs['multi_ns_defs:own'].rha).toBe(2);
    });

    test('非法目录名不算命名空间（大写 / 空格 / 点）', function () {
        var root = makePack('bad_ns', 'machine_max:bad_ns', {
            good_ns: { materials: { a: {} } },
        });
        // 目录里有内容子目录，但名字不能当 resource location 用
        for (var bad of ['Bad_Ns', 'bad ns', 'bad.ns']) {
            fs.mkdirSync(path.join(root, bad, 'materials'), { recursive: true });
        }

        expect(contentPack.listNamespaces(root)).toEqual(['good_ns']);
    });
});

describe('content_pack 创建时的导出命名空间', function () {
    test('显式命名空间决定目录树，而不是 id 前缀', function () {
        var dir = path.join(TMP_ROOT, 'created_ns');
        var result = contentPack.createContentPack(dir, { id: 'k17:my_pack', version: '1.0' }, {
            namespace: 'my_ns',
        });

        expect(result.success).toBe(true);
        expect(result.namespace).toBe('my_ns');
        expect(fs.existsSync(path.join(dir, 'my_ns', 'parts'))).toBe(true);
        expect(fs.existsSync(path.join(dir, 'my_ns', 'lang'))).toBe(true);
        expect(fs.existsSync(path.join(dir, 'my_ns', 'subsystems'))).toBe(true);
        expect(fs.existsSync(path.join(dir, 'k17'))).toBe(false);
        expect(contentPack.listNamespaces(dir)).toEqual(['my_ns']);
    });

    test('省略命名空间时取 id 冒号后的后缀', function () {
        var dir = path.join(TMP_ROOT, 'created_default');
        var result = contentPack.createContentPack(dir, { id: 'k17:my_pack', version: '1.0' });

        expect(result.success).toBe(true);
        expect(result.namespace).toBe('my_pack');
    });

    test('非法命名空间在 mkdir 之前拒绝，不留半个包', function () {
        var dir = path.join(TMP_ROOT, 'created_bad');
        var result = contentPack.createContentPack(dir, { id: 'k17:my_pack' }, {
            namespace: 'My Pack',
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('不合法');
        expect(fs.existsSync(dir)).toBe(false);
    });

    test('defaultExportNamespace：后缀优先，其次前缀，非法返回空串', function () {
        expect(contentPack.defaultExportNamespace('k17:my_pack')).toBe('my_pack');
        expect(contentPack.defaultExportNamespace('machine_max')).toBe('machine_max');
        expect(contentPack.defaultExportNamespace('MyPack')).toBe('');
        expect(contentPack.defaultExportNamespace('')).toBe('');
    });

    test('pickExportNamespace：合法配置优先，否则按包内目录选主命名空间', function () {
        var root = makePack('pick_ns', 'machine_max:m1a2_sep', {
            m1a2_sep: { materials: { a: {} } },
        });

        expect(contentPack.pickExportNamespace(root, 'k17')).toBe('k17');
        expect(contentPack.pickExportNamespace(root, 'BAD NS')).toBe('m1a2_sep');
        expect(contentPack.pickExportNamespace(root, '')).toBe('m1a2_sep');
        expect(contentPack.pickExportNamespace('', '')).toBe('machine_max');
    });
});

describe('content_pack_manager 按目录命名空间加载', function () {
    test('当前包的目录名与 id 前缀不同时仍能读到本包定义', function () {
        cpm.invalidateCache();

        var root = makePack('m1a2_current', 'machine_max:m1a2_sep', {
            m1a2_sep: { materials: { us_steel: { rha: 1 } } },
        });

        var merged = cpm.loadMergedDefs({ contentPackPath: root, dependencyPaths: [] }, 'materials');

        expect(Object.keys(merged.defs)).toEqual(['m1a2_sep:us_steel']);
        expect(merged.sources['m1a2_sep:us_steel']).toBe('current');
    });

    test('依赖包同样按自己的目录命名空间加载', function () {
        cpm.invalidateCache();

        var current = makePack('us_kit_current', 'machine_max:us_basic_kit', {
            machine_max: { materials: { own: { rha: 1 } } },
        });
        var dep = makePack('us_kit_dep', 'machine_max:us_basic_kit', {
            machine_max: { materials: { borrowed: { rha: 2 } } },
        });

        var merged = cpm.loadMergedDefs(
            { contentPackPath: current, dependencyPaths: [dep] },
            'materials'
        );

        expect(Object.keys(merged.defs).sort()).toEqual(['machine_max:borrowed', 'machine_max:own']);
        expect(merged.sources['machine_max:borrowed']).toBe('dependency:0');
    });
});
