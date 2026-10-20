// 文件: src/ops/sub_part.js
// 用途: 子零件级业务动作（docs/13 §6.1 / §5.1.3.1）
// 所属模块: MachineMax Blockbench 插件

'use strict';

var { generateDefaultName } = require('../core/naming.js');
var { createSubPartConfig } = require('../core/config.js');
var { runConfigEdit } = require('../core/undo.js');
var doc = require('../doc/index.js');
var shared = require('./shared.js');

function ensureSubPartName(config, variant, namespace) {
    var base = generateDefaultName('sub_part', { namespace: namespace });
    var keys = Object.keys((variant && variant.sub_parts) || {});
    if (keys.indexOf(base) < 0) return base;
    var n = 2;
    while (n < 10000) {
        var candidate = base + '_' + n;
        if (keys.indexOf(candidate) < 0) return candidate;
        n++;
    }
    return base;
}

function markSubPart(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    var variant = shared.variantOf(config, options.partId, options.variantName);
    if (!variant) return shared.fail('当前变体不存在');
    var element = options.element;
    if (!element || !element.uuid) return shared.fail('未选中任何元素');

    var ns = shared.namespaceOf(config);
    var spKey = String(options.spKey || '').trim();
    if (!spKey) spKey = ensureSubPartName(config, variant, ns);
    var keyError = shared.validateKey('sub_parts', spKey, config,
        ['parts', options.partId, 'variants', options.variantName, 'sub_parts', spKey]);
    if (keyError) return shared.fail(keyError.hint, [keyError]);

    var mp = shared.markersPort();
    var created = false;
    runConfigEdit('标记为子零件', function () {
        if (!variant.sub_parts) shared.setProp(variant, 'sub_parts', {});
        if (!variant.sub_parts[spKey]) {
            var sp = createSubPartConfig();
            sp.start_bone = element.name || '';
            shared.setProp(variant.sub_parts, spKey, sp);
            created = true;
        } else if (!variant.sub_parts[spKey].start_bone) {
            // 旧条目缺 start_bone 时补上标记骨骼名，不覆盖已有绑定
            shared.setProp(variant.sub_parts[spKey], 'start_bone', element.name || '');
        }
        mp.set(config, options.partId, options.variantName, element.uuid, 'sub_part', spKey);
        if (mp.recalc) mp.recalc(config, options.partId, options.variantName);
    }, { coalesce: false });

    return shared.ok({ spKey: spKey, changed: true, created: created });
}

function importSubPart(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用，请先打开项目');

    var partId = options.partId;
    var variantName = options.variantName;
    var spKey = String(options.spKey || options.subPartKey || '').trim();
    var variant = shared.variantOf(config, partId, variantName);
    if (!variant) return shared.fail('当前变体不存在');
    if (!spKey) return shared.fail('缺少子零件 key');
    if (!variant.sub_parts) shared.setProp(variant, 'sub_parts', {});

    var keyError = shared.validateKey('sub_parts', spKey, config,
        ['parts', partId, 'variants', variantName, 'sub_parts', spKey]);
    if (keyError) return shared.fail(keyError.hint, [keyError]);

    var existing = variant.sub_parts && variant.sub_parts[spKey];
    var oldKey = String(options.oldKey || '').trim();
    var oldExisting = oldKey ? (variant.sub_parts && variant.sub_parts[oldKey]) : undefined;
    var modeResult = shared.resolveImportMode(options, {
        existing: existing,
        oldExisting: oldExisting,
        oldKey: oldKey,
        newKey: spKey,
        path: ['parts', partId, 'variants', variantName, 'sub_parts', spKey],
    });
    if (!modeResult.ok) return modeResult;

    var effectiveExisting = modeResult.mode === 'rename' ? oldExisting : existing;
    var ctx = {
        kind: 'sub_part',
        mode: modeResult.mode,
        oldKey: oldKey || undefined,
        namespace: shared.namespaceOf(config),
        partId: partId,
        variantName: variantName,
        subPartKey: spKey,
        parentPath: ['parts', partId, 'variants', variantName, 'sub_parts', spKey],
        existing: effectiveExisting,
    };

    var result = shared.applyProjection(config,
        ['parts', partId, 'variants', variantName, 'sub_parts', spKey],
        options.definition || {}, ctx, {
            label: '导入子零件 ' + spKey,
            data: { partId: partId, variantName: variantName, subPartKey: spKey },
            source: options.source || 'import',
            persist: options.persist,
            strict: options.strict,
        });
    if (result.ok) {
        result.action = modeResult.mode === 'rename' ? 'renamed'
            : (effectiveExisting === undefined ? 'created' : 'replaced');
    }
    return result;
}

function renameSubPart(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    var partId = options.partId;
    var variantName = options.variantName;
    var oldKey = options.oldKey || options.spKey;
    var newKey = String(options.newKey || '').trim();
    var variant = shared.variantOf(config, partId, variantName);
    if (!variant) return shared.fail('当前变体不存在');
    if (!oldKey || !variant.sub_parts || !variant.sub_parts[oldKey]) {
        return shared.fail('子零件 "' + oldKey + '" 不存在');
    }
    if (!newKey || oldKey === newKey) return shared.ok({ changed: false, key: oldKey });

    var keyError = shared.validateKey('sub_parts', newKey, config,
        ['parts', partId, 'variants', variantName, 'sub_parts', newKey]);
    if (keyError) return shared.fail(keyError.hint, [keyError]);
    if (variant.sub_parts[newKey]) return shared.fail('子零件 "' + newKey + '" 已存在');

    var renamed = null;
    runConfigEdit('重命名子零件', function () {
        renamed = doc.refs.renameRefs(config, {
            kind: 'sub_part',
            oldKey: oldKey,
            newKey: newKey,
        });
        var node = variant.sub_parts[oldKey];
        shared.delProp(variant.sub_parts, oldKey);
        shared.setProp(variant.sub_parts, newKey, node);
        var mp = shared.markersPort();
        if (mp.recalc) mp.recalc(config, partId, variantName);
    }, { coalesce: false });

    return shared.ok({
        key: newKey,
        changed: true,
        renamed: renamed ? renamed.renamed : [],
        cleaned_references: renamed ? renamed.renamed : [],
    });
}

module.exports = {
    markSubPart: markSubPart,
    importSubPart: importSubPart,
    renameSubPart: renameSubPart,
};
