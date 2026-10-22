'use strict';

// 导出写盘单测：$schema 注入 / schema 副本补充。
// 覆盖的回归点：配方与手写定义不被整包重写（注释、行尾、未知类型均保持原样）。

const { describe, test, afterEach } = require('bun:test');
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
    setSchemaRef,
    injectSchemaReferences,
    writeSchemasFromConstant,
} = require('../../src/services/export_pipeline.js');

// $schema 的 locale 跟随运行环境，测试按同一规则推导，不硬编码 zh_cn / en_us
const LOCALE = ((typeof navigator !== 'undefined' && navigator.language) || '').indexOf('zh') === 0 ? 'zh_cn' : 'en_us';

const tmpDirs = [];
function tmpdir() {
    var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mm-export-pipeline-'));
    tmpDirs.push(dir);
    return dir;
}
afterEach(function () {
    while (tmpDirs.length) {
        fs.rmSync(tmpDirs.pop(), { recursive: true, force: true });
    }
    delete globalThis.__SCHEMAS__;
});

function write(file, text) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text, 'utf8');
}

function read(file) {
    return fs.readFileSync(file, 'utf8');
}

describe('services/export_pipeline.setSchemaRef', () => {
    test('只换 $schema 值，注释与 CRLF 原样保留', function () {
        var raw = '{\r\n  "$schema": "old/path.json",\r\n  "type": "machine_max:part_fabricating", // 零件配方：产物由本文件名决定\r\n  "count": 8 // 注释\r\n}';
        var out = setSchemaRef(raw, 'docs/zh_cn/schemas/recipe/part_fabricating_recipe.schema.json');
        assert.strictEqual(
            out,
            '{\r\n  "$schema": "docs/zh_cn/schemas/recipe/part_fabricating_recipe.schema.json",\r\n  "type": "machine_max:part_fabricating", // 零件配方：产物由本文件名决定\r\n  "count": 8 // 注释\r\n}'
        );
    });

    test('值已经正确时原样返回（调用方据此跳过写盘）', function () {
        var raw = '{\n  "$schema": "docs/x.json",\n  "a": 1\n}\n';
        assert.strictEqual(setSchemaRef(raw, 'docs/x.json'), raw);
    });

    test('缺 $schema 时插到首个 { 之后，其余字节不动', function () {
        var raw = '{\r\n  "type": "machine_max:research"\r\n}';
        var out = setSchemaRef(raw, '../docs/zh_cn/x.json');
        assert.strictEqual(out, '{\r\n  "$schema": "../docs/zh_cn/x.json",\r\n  "type": "machine_max:research"\r\n}');
        assert.ok(out.indexOf('machine_max:research') > 0);
    });

    test('空对象不产生尾逗号', function () {
        assert.strictEqual(setSchemaRef('{}', 'a.json'), '{\n  "$schema": "a.json"\n}');
    });

    test('不是文本时返回 null', function () {
        assert.strictEqual(setSchemaRef(null, 'a.json'), null);
        assert.strictEqual(setSchemaRef('no-json-here', 'a.json'), null);
    });
});

describe('services/export_pipeline.injectSchemaReferences', () => {
    test('零件配方指向 part_fabricating schema，注释一并保留', function () {
        var ns = tmpdir();
        var file = path.join(ns, 'recipe', 'part_fabricating', 'mtlb.json');
        var raw = '{\r\n  "$schema": "../../docs/schemas/recipe/research_recipe.schema.json",\r\n  "type": "machine_max:part_fabricating",\r\n  "ingredients": [] // 保持顺序\r\n}';
        write(file, raw);

        var stats = injectSchemaReferences(ns);

        assert.strictEqual(stats.injected, 1);
        assert.strictEqual(
            read(file),
            '{\r\n  "$schema": "../../docs/' + LOCALE + '/schemas/recipe/part_fabricating_recipe.schema.json",\r\n  "type": "machine_max:part_fabricating",\r\n  "ingredients": [] // 保持顺序\r\n}'
        );
    });

    test('未知配方 type 保持原样，不猜 schema', function () {
        var ns = tmpdir();
        var file = path.join(ns, 'recipe', 'custom', 'thing.json');
        var raw = '{\n  "$schema": "keep-me.json",\n  "type": "machine_max:some_future_type"\n}\n';
        write(file, raw);

        var stats = injectSchemaReferences(ns);

        assert.strictEqual(stats.skipped, 1);
        assert.strictEqual(stats.injected, 0);
        assert.strictEqual(read(file), raw);
    });

    test('$schema 已正确时不重写文件', function () {
        var ns = tmpdir();
        var file = path.join(ns, 'parts', 'hull.json');
        var raw = '{\n  "$schema": "../docs/' + LOCALE + '/schemas/part_definition_schema.json",\n  "icon": "machine_max:textures/icon/hull.png"\n}\n';
        write(file, raw);

        var stats = injectSchemaReferences(ns);

        assert.strictEqual(stats.unchanged, 1);
        assert.strictEqual(stats.injected, 0);
        assert.strictEqual(read(file), raw);
    });

    test('缺 $schema 的连接点定义补上，注释保留', function () {
        var ns = tmpdir();
        var file = path.join(ns, 'connectors', 'joint.json');
        write(file, '{\n  // 手写注释\n  "type": "machine_max:fixed_up"\n}\n');

        var stats = injectSchemaReferences(ns);

        assert.strictEqual(stats.injected, 1);
        assert.strictEqual(
            read(file),
            '{\n  "$schema": "../docs/' + LOCALE + '/schemas/part/subpart/connector/connector_static_attr.schema.json",\n  // 手写注释\n  "type": "machine_max:fixed_up"\n}\n'
        );
    });
});

describe('services/export_pipeline.writeSchemasFromConstant', () => {
    test('docs 已有内容时整批保留，不覆盖也不增补', function () {
        var docs = tmpdir();
        write(path.join(docs, 'zh_cn', 'schemas', 'keep.json'), 'KEEP\n');
        globalThis.__SCHEMAS__ = {
            'zh_cn/schemas/keep.json': 'FROM_BUILTIN',
            'zh_cn/schemas/hud.json': 'NEW',
        };

        var stats = writeSchemasFromConstant(docs);

        assert.deepStrictEqual(stats, { written: 0, kept: 2 });
        assert.strictEqual(read(path.join(docs, 'zh_cn', 'schemas', 'keep.json')), 'KEEP\n');
        assert.strictEqual(fs.existsSync(path.join(docs, 'zh_cn', 'schemas', 'hud.json')), false);
    });

    test('docs 为空（新包）时写入全部副本', function () {
        var docs = tmpdir();
        globalThis.__SCHEMAS__ = {
            'zh_cn/schemas/a.json': 'A',
            'en_us/schemas/a.json': 'A-en',
        };

        var stats = writeSchemasFromConstant(path.join(docs, 'docs'));

        assert.deepStrictEqual(stats, { written: 2, kept: 0 });
        assert.strictEqual(read(path.join(docs, 'docs', 'zh_cn', 'schemas', 'a.json')), 'A');
        assert.strictEqual(read(path.join(docs, 'docs', 'en_us', 'schemas', 'a.json')), 'A-en');
    });

    test('__SCHEMAS__ 缺失时不写盘也不抛', function () {
        var docs = tmpdir();
        delete globalThis.__SCHEMAS__;
        var stats = writeSchemasFromConstant(docs);
        assert.deepStrictEqual(stats, { written: 0, kept: 0 });
        assert.deepStrictEqual(fs.readdirSync(docs), []);
    });
});
