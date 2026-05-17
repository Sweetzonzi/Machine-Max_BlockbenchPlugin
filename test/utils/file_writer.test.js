/**
 * 文件名：test/utils/file_writer.test.js
 * 用途：file_writer.js 工具函数单元测试
 * 所属模块：测试
 */
const { extractResourceLocation } = require('../../src/utils/file_writer.js');

describe('extractResourceLocation', function () {

    it('splits namespace and path at the colon', function () {
        var result = extractResourceLocation('machine_max:structural_steel', 'fallback');
        expect(result.ns).toBe('machine_max');
        expect(result.path).toBe('structural_steel');
    });

    it('works with custom namespace', function () {
        var result = extractResourceLocation('mypack:mymaterial', 'fallback');
        expect(result.ns).toBe('mypack');
        expect(result.path).toBe('mymaterial');
    });

    it('only splits at the FIRST colon', function () {
        var result = extractResourceLocation('a:b:c', 'fallback');
        expect(result.ns).toBe('a');
        expect(result.path).toBe('b:c');
    });

    it('uses defaultNs when there is no colon', function () {
        var result = extractResourceLocation('simple_id', 'default_ns');
        expect(result.ns).toBe('default_ns');
        expect(result.path).toBe('simple_id');
    });

    it('handles empty string with defaultNs', function () {
        var result = extractResourceLocation('', 'default_ns');
        expect(result.ns).toBe('default_ns');
        expect(result.path).toBe('');
    });

    it('handles empty namespace before colon', function () {
        var result = extractResourceLocation(':empty_ns', 'default_ns');
        expect(result.ns).toBe('');
        expect(result.path).toBe('empty_ns');
    });

    it('handles empty path after colon', function () {
        var result = extractResourceLocation('ns:', 'default_ns');
        expect(result.ns).toBe('ns');
        expect(result.path).toBe('');
    });
});
