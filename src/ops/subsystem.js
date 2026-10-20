// 文件: src/ops/subsystem.js
// 用途: 子系统实例业务动作（docs/13 §6.1）
// 所属模块: MachineMax Blockbench 插件

'use strict';

var { createSubPartConfig } = require('../core/config.js');
var ssTypes = require('../core/subsystem_types.js');
var { runConfigEdit } = require('../core/undo.js');
var doc = require('../doc/index.js');
var shared = require('./shared.js');

function createSubsystem(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用，请先打开项目');

    var partId = options.partId;
    var variantName = options.variantName;
    var spKey = options.spKey;
    var typeId = options.typeId;
    var instanceName = String(options.instanceName || '').trim();

    var variant = shared.variantOf(config, partId, variantName);
    if (!variant) return shared.fail('当前变体不存在');
    if (!spKey) return shared.fail('缺少子零件');
    if (!typeId) return shared.fail('请选择子系统类型');
    if (!instanceName) return shared.fail('子系统名称不能为空');
    if (!ssTypes.getTypeMeta(typeId)) return shared.fail('无效的子系统类型: ' + typeId);

    var keyError = shared.validateKey('subsystems', instanceName, config,
        ['parts', partId, 'variants', variantName, 'sub_parts', spKey, 'subsystems', instanceName]);
    if (keyError) return shared.fail(keyError.hint, [keyError]);

    var sp = shared.subPartOf(config, partId, variantName, spKey);
    if (sp && sp.subsystems && sp.subsystems[instanceName]) {
        return shared.fail('子系统 "' + instanceName + '" 已存在');
    }

    var defaults = ssTypes.getTypeDefaults(typeId) || {};
    runConfigEdit('添加子系统', function () {
        if (!variant.sub_parts) shared.setProp(variant, 'sub_parts', {});
        if (!variant.sub_parts[spKey]) {
            var spConfig = createSubPartConfig();
            spConfig.start_bone = spKey;
            shared.setProp(variant.sub_parts, spKey, spConfig);
        }
        var target = variant.sub_parts[spKey];
        if (!target.subsystems) shared.setProp(target, 'subsystems', {});
        var ssConfig = { type: typeId, definition: '' };
        Object.keys(defaults).forEach(function (key) {
            ssConfig[key] = shared.clone(defaults[key]);
        });
        shared.setProp(target.subsystems, instanceName, ssConfig);
    }, { coalesce: false });

    return shared.ok({ instanceName: instanceName, changed: true });
}

function deleteSubsystem(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用');
    var path = ['parts', options.partId, 'variants', options.variantName,
        'sub_parts', options.spKey, 'subsystems', options.ssKey];
    var removed = null;
    runConfigEdit('删除子系统', function () {
        removed = doc.remove(config, path, {});
        if (!removed.ok) {
            var e = new Error('remove failed');
            e._opResult = shared.fromDoc(removed, '删除子系统失败');
            throw e;
        }
    }, { coalesce: false });

    return shared.ok({
        changed: true,
        cleaned_references: removed ? (removed.cleaned_references || []) : [],
    });
}

function importSubsystem(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用，请先打开项目');

    var partId = options.partId;
    var variantName = options.variantName;
    var spKey = options.spKey;
    var instanceName = String(options.instanceName || options.ssKey || '').trim();
    var variant = shared.variantOf(config, partId, variantName);
    if (!variant) return shared.fail('当前变体不存在');
    if (!instanceName) return shared.fail('缺少子系统名称');

    var keyError = shared.validateKey('subsystems', instanceName, config,
        ['parts', partId, 'variants', variantName, 'sub_parts', spKey, 'subsystems', instanceName]);
    if (keyError) return shared.fail(keyError.hint, [keyError]);

    var sp = shared.subPartOf(config, partId, variantName, spKey);
    if (!sp) return shared.fail('子零件 "' + spKey + '" 不存在');
    if (!sp.subsystems) shared.setProp(sp, 'subsystems', {});
    var existing = sp.subsystems && sp.subsystems[instanceName];
    var oldKey = String(options.oldKey || '').trim();
    var oldExisting = oldKey ? (sp.subsystems && sp.subsystems[oldKey]) : undefined;
    var modeResult = shared.resolveImportMode(options, {
        existing: existing,
        oldExisting: oldExisting,
        oldKey: oldKey,
        newKey: instanceName,
        path: ['parts', partId, 'variants', variantName, 'sub_parts', spKey,
            'subsystems', instanceName],
    });
    if (!modeResult.ok) return modeResult;

    var effectiveExisting = modeResult.mode === 'rename' ? oldExisting : existing;
    var ctx = {
        kind: 'subsystem',
        mode: modeResult.mode,
        oldKey: oldKey || undefined,
        namespace: shared.namespaceOf(config),
        partId: partId,
        variantName: variantName,
        subPartKey: spKey,
        parentPath: ['parts', partId, 'variants', variantName, 'sub_parts', spKey,
            'subsystems', instanceName],
        existing: effectiveExisting,
    };

    var result = shared.applyProjection(config, ctx.parentPath, options.definition || {}, ctx, {
        label: '导入子系统 ' + instanceName,
        data: { partId: partId, variantName: variantName, subPartKey: spKey, instanceName: instanceName },
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

function renameSubsystem(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    var partId = options.partId;
    var variantName = options.variantName;
    var spKey = options.spKey;
    var oldKey = options.oldKey || options.ssKey;
    var newKey = String(options.newKey || '').trim();
    var sp = shared.subPartOf(config, partId, variantName, spKey);
    if (!sp || !sp.subsystems || !sp.subsystems[oldKey]) {
        return shared.fail('子系统 "' + oldKey + '" 不存在');
    }
    if (!newKey || oldKey === newKey) return shared.ok({ changed: false, key: oldKey });

    var keyError = shared.validateKey('subsystems', newKey, config,
        ['parts', partId, 'variants', variantName, 'sub_parts', spKey, 'subsystems', newKey]);
    if (keyError) return shared.fail(keyError.hint, [keyError]);
    if (sp.subsystems[newKey]) return shared.fail('子系统 "' + newKey + '" 已存在');

    var renamed = null;
    runConfigEdit('重命名子系统', function () {
        renamed = doc.refs.renameRefs(config, {
            kind: 'subsystem',
            oldKey: oldKey,
            newKey: newKey,
        });
        var node = sp.subsystems[oldKey];
        shared.delProp(sp.subsystems, oldKey);
        shared.setProp(sp.subsystems, newKey, node);
    }, { coalesce: false });

    return shared.ok({
        key: newKey,
        changed: true,
        renamed: renamed ? renamed.renamed : [],
        cleaned_references: renamed ? renamed.renamed : [],
    });
}

module.exports = {
    createSubsystem: createSubsystem,
    deleteSubsystem: deleteSubsystem,
    importSubsystem: importSubsystem,
    renameSubsystem: renameSubsystem,
};
