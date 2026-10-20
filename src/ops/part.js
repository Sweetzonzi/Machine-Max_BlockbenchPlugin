// 文件: src/ops/part.js
// 用途: 零件级业务动作（docs/13 §6.1）
// 所属模块: MachineMax Blockbench 插件

'use strict';

var {
    createPartConfig,
} = require('../core/config.js');
var { runConfigEdit } = require('../core/undo.js');
var shared = require('./shared.js');

function createPart(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用，请先打开项目');

    var partId = String(options.partId || '').trim();
    var variantName = String(options.variantName || '').trim() || 'default';
    var model = options.model || '';

    if (!partId) return shared.fail('零件 ID 不能为空');
    var keyError = shared.validateKey('parts', partId, config, ['parts', partId]);
    if (keyError) return shared.fail(keyError.hint, [keyError]);
    var variantError = shared.validateKey('variants', variantName, config,
        ['parts', partId, 'variants', variantName]);
    if (variantError) return shared.fail(variantError.hint, [variantError]);

    if (!config.parts) config.parts = {};
    if (config.parts[partId]) return shared.fail('零件 "' + partId + '" 已存在');

    runConfigEdit('新建零件', function () {
        shared.setProp(config.parts, partId, createPartConfig(partId, variantName));
        if (model) config.parts[partId].variants[variantName].model = model;
        shared.setUiState(config, { activePartId: partId, activeVariantName: variantName });
    }, { coalesce: false });

    return shared.ok({ partId: partId, variantName: variantName, changed: true });
}

function deletePart(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    if (!config || !config.parts) return shared.fail('配置不可用');
    var partId = options.partId;
    if (!partId || !config.parts[partId]) return shared.fail('零件 "' + partId + '" 不存在');

    var remaining = [];
    var state = null;
    runConfigEdit('删除零件', function () {
        var mp = shared.markersPort();
        if (mp.clearScope) mp.clearScope(config, { scope: 'part', partId: partId });
        shared.delProp(config.parts, partId);
        remaining = Object.keys(config.parts);
        if (remaining.length > 0) {
            var firstPart = config.parts[remaining[0]];
            var variants = Object.keys((firstPart && firstPart.variants) || {});
            state = shared.setUiState(config, {
                activePartId: remaining[0],
                activeVariantName: variants.length > 0 ? variants[0] : 'default',
            });
        } else {
            state = shared.setUiState(config, { activePartId: '', activeVariantName: '' });
        }
    }, { coalesce: false });

    return shared.ok({
        remaining: remaining,
        activePartId: state.activePartId,
        activeVariantName: state.activeVariantName,
        changed: true,
    });
}

function importPart(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用，请先打开项目');

    var partId = String(options.partId || '').trim();
    if (!partId) return shared.fail('缺少 partId');
    if (!config.parts) config.parts = {};
    var keyError = shared.validateKey('parts', partId, config, ['parts', partId]);
    if (keyError) return shared.fail(keyError.hint, [keyError]);

    var existing = config.parts && config.parts[partId];
    var oldKey = String(options.oldKey || '').trim();
    var oldExisting = oldKey ? (config.parts && config.parts[oldKey]) : undefined;
    var modeResult = shared.resolveImportMode(options, {
        existing: existing,
        oldExisting: oldExisting,
        oldKey: oldKey,
        newKey: partId,
        path: ['parts', partId],
    });
    if (!modeResult.ok) return modeResult;

    var effectiveExisting = modeResult.mode === 'rename' ? oldExisting : existing;
    var definition = options.definition || {};
    if (definition && typeof definition !== 'object') {
        return shared.fail('definition 必须是对象');
    }

    var ctx = {
        kind: 'part',
        mode: modeResult.mode,
        oldKey: oldKey || undefined,
        namespace: shared.namespaceOf(config),
        partId: partId,
        parentPath: ['parts', partId],
        existing: effectiveExisting,
    };

    var result = shared.applyProjection(config, ['parts', partId], definition, ctx, {
        label: '导入零件 ' + partId,
        data: { partId: partId },
        source: options.source || 'import',
        persist: options.persist,
        strict: options.strict,
    });
    if (result.ok) {
        shared.setUiState(config, { activePartId: partId });
        result.action = modeResult.mode === 'rename' ? 'renamed'
            : (effectiveExisting === undefined ? 'created' : 'replaced');
    }
    return result;
}

module.exports = {
    createPart: createPart,
    deletePart: deletePart,
    importPart: importPart,
};
