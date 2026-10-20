// 文件: src/ops/variant.js
// 用途: 变体级业务动作（docs/13 §6.1）
// 所属模块: MachineMax Blockbench 插件

'use strict';

var { createVariantConfig } = require('../core/config.js');
var { runConfigEdit } = require('../core/undo.js');
var shared = require('./shared.js');

function createVariant(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用，请先打开项目');

    var partId = options.partId;
    var variantName = String(options.variantName || '').trim();
    var model = options.model || '';
    var part = shared.partOf(config, partId);
    if (!part) return shared.fail('当前零件不存在');
    if (!variantName) return shared.fail('变体名不能为空');
    var keyError = shared.validateKey('variants', variantName, config,
        ['parts', partId, 'variants', variantName]);
    if (keyError) return shared.fail(keyError.hint, [keyError]);
    if (!part.variants) part.variants = {};
    if (part.variants[variantName]) return shared.fail('变体 "' + variantName + '" 已存在');

    var defaultTexture = options.texture !== undefined
        ? options.texture
        : ('machine_max:textures/part/' + partId + '/' + partId + '.png');

    runConfigEdit('新建变体', function () {
        var variant = createVariantConfig();
        shared.setProp(part.variants, variantName, variant);
        if (model) variant.model = model;
        if (defaultTexture) variant.textures = { 'default': defaultTexture };
        shared.setUiState(config, { activeVariantName: variantName });
    }, { coalesce: false });

    return shared.ok({ variantName: variantName, changed: true });
}

function deleteVariant(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    var partId = options.partId;
    var variantName = options.variantName;
    var part = shared.partOf(config, partId);
    if (!part) return shared.fail('当前零件不存在');
    if (!variantName || !part.variants || !part.variants[variantName]) {
        return shared.fail('变体 "' + variantName + '" 不存在');
    }

    var remaining = [];
    var active = '';
    runConfigEdit('删除变体', function () {
        var mp = shared.markersPort();
        if (mp.clearScope) {
            mp.clearScope(config, {
                scope: 'variant',
                partId: partId,
                variantName: variantName,
            });
        }
        shared.delProp(part.variants, variantName);
        remaining = Object.keys(part.variants);
        active = remaining.length > 0 ? remaining[0] : '';
        shared.setUiState(config, { activeVariantName: active });
    }, { coalesce: false });

    return shared.ok({ remaining: remaining, activeVariantName: active, changed: true });
}

function importVariant(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用，请先打开项目');

    var partId = options.partId;
    var variantName = String(options.variantName || '').trim();
    var part = shared.partOf(config, partId);
    if (!part) return shared.fail('当前零件不存在');
    if (!variantName) return shared.fail('缺少变体名');
    var keyError = shared.validateKey('variants', variantName, config,
        ['parts', partId, 'variants', variantName]);
    if (keyError) return shared.fail(keyError.hint, [keyError]);

    var existing = part.variants && part.variants[variantName];
    var ctx = {
        kind: 'variant',
        mode: options.mode || (existing ? 'replace' : 'create'),
        oldKey: options.oldKey,
        namespace: shared.namespaceOf(config),
        partId: partId,
        variantName: variantName,
        parentPath: ['parts', partId, 'variants', variantName],
        existing: existing,
    };

    var result = shared.applyProjection(config,
        ['parts', partId, 'variants', variantName], options.definition || {}, ctx, {
            label: '导入变体 ' + variantName,
            data: { partId: partId, variantName: variantName },
        });
    if (result.ok) shared.setUiState(config, { activeVariantName: variantName });
    return result;
}

function setVariantTags(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    var variant = shared.variantOf(config, options.partId, options.variantName);
    if (!variant) return shared.fail('当前变体不存在');

    var tags = Array.isArray(options.tags) ? options.tags.slice() : [];
    return require('./field.js').setField(config, {
        path: ['parts', options.partId, 'variants', options.variantName, 'tags'],
        value: tags,
        label: '编辑变体标签',
        source: options.source || 'ui',
    });
}

module.exports = {
    createVariant: createVariant,
    deleteVariant: deleteVariant,
    importVariant: importVariant,
    setVariantTags: setVariantTags,
};
