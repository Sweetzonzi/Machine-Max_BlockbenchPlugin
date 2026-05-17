/**
 * 冒烟测试 — 验证测试基础设施正常工作
 *
 * 加载 Blockbench mock 层，然后验证测试夹具函数可用。
 */

var { createMinimalConfig, createSamplePart, createV1Config } = require('./helpers.js');

describe('Smoke Test', function () {
    it('createMinimalConfig returns v3 config', function () {
        var config = createMinimalConfig();
        if (config.$schema_version !== 3) {
            throw new Error('Expected $schema_version to be 3, got ' + config.$schema_version);
        }
    });

    it('createSamplePart returns a part with variants', function () {
        var part = createSamplePart();
        if (!part.variants || !part.variants.default) {
            throw new Error('Expected sample part to have a default variant');
        }
    });

    it('createV1Config returns config without $schema_version', function () {
        var config = createV1Config();
        if (config.$schema_version !== undefined) {
            throw new Error('Expected v1 config to have no $schema_version');
        }
    });
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
