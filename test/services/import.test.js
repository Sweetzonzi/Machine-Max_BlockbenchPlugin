'use strict';

// services/import 文件解析用例（P4 纯搬移回归）

const { describe, test, expect } = require('bun:test');
const importService = require('../../src/services/import.js');

describe('services/import.parseJSONWithComments', () => {
    test('剥离 // 注释与 BOM，保留字符串里的 //', () => {
        const raw = '\uFEFF{\n  // 注释\n  "url": "machine_max:a//b",\n  "n": 1 // 尾注\n}\n';
        const parsed = importService.parseJSONWithComments(raw);
        expect(parsed.url).toBe('machine_max:a//b');
        expect(parsed.n).toBe(1);
    });

    test('非法 JSON 抛错', () => {
        expect(function () { importService.parseJSONWithComments('{'); }).toThrow();
    });
});
