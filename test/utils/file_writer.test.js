'use strict';

// file_writer.isSameFile：识别「原地导出」（源即目标）。
// 回归点：Blockbench 插件环境没有 Node 的 process 全局，实现不得引用它。

const { describe, test } = require('bun:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const { isSameFile } = require('../../src/utils/file_writer.js');
const fileWriter = require('../../src/utils/file_writer.js');

/** 在没有 process 的 vm 上下文里重新加载 file_writer，模拟 Blockbench 插件沙箱 */
function loadWithoutProcess() {
    const file = require.resolve('../../src/utils/file_writer.js');
    const src = fs.readFileSync(file, 'utf8');
    const sandbox = {
        module: { exports: {} },
        exports: {},
        console: console,
        require: function (id) {
            if (id === 'fs') return fs;
            if (id === 'path') return path;
            if (id === './logger.js') {
                return {
                    createLogger: function () {
                        var noop = function () {};
                        return { debug: noop, info: noop, warn: noop, error: noop };
                    },
                };
            }
            throw new Error('unexpected require: ' + id);
        },
    };
    sandbox.exports = sandbox.module.exports;
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox);
    return sandbox.module.exports;
}

describe('utils/file_writer.isSameFile', () => {
    test('同一绝对路径（Windows 大小写不敏感）', function () {
        assert.strictEqual(isSameFile('D:\\pack\\machine_max\\connectors\\a.json', 'd:/PACK/machine_max/connectors/A.json'), true);
    });

    test('正反斜杠混写视为同一文件', function () {
        assert.strictEqual(isSameFile('D:\\pack\\a.json', 'D:/pack/a.json'), true);
    });

    test('不同文件返回 false', function () {
        assert.strictEqual(isSameFile('D:\\pack\\a.json', 'D:\\pack\\b.json'), false);
        assert.strictEqual(isSameFile('D:\\pack\\a.json', 'D:\\other\\a.json'), false);
    });

    test('相对路径按 cwd 解析后再比较', function () {
        var abs = path.join(process.cwd(), 'pack', 'a.json');
        assert.strictEqual(isSameFile('pack/a.json', abs), true);
    });

    test('空值返回 false', function () {
        assert.strictEqual(isSameFile('', 'D:\\a.json'), false);
        assert.strictEqual(isSameFile(null, 'D:\\a.json'), false);
    });

    test('实现不引用 process 全局（插件沙箱没有该全局）', function () {
        assert.ok(!/\bprocess\b/.test(String(isSameFile)));
    });

    test('没有 process 的沙箱里仍能正常工作', function () {
        const sandboxed = loadWithoutProcess();
        assert.strictEqual(typeof sandboxed.isSameFile, 'function');
        assert.strictEqual(sandboxed.isSameFile('D:\\pack\\a.json', 'd:/pack/a.json'), true);
        assert.strictEqual(sandboxed.isSameFile('D:\\pack\\a.json', 'D:\\pack\\b.json'), false);
    });
});

describe('utils/file_writer.writeJSONFile', () => {
    test('写出的 JSON 以换行结尾（避免 "No newline at end of file" 噪音）', function () {
        const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'mm-fw-'));
        try {
            const file = fileWriter.writeJSONFile(dir, 'meta.json', { a: 1 });
            const text = fs.readFileSync(file, 'utf8');
            assert.ok(text.endsWith('\n'));
            assert.deepStrictEqual(JSON.parse(text), { a: 1 });
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
});
