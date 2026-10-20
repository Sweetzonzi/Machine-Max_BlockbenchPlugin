// 文件: src/ops/element.js
// 用途: 元素标记、重命名、删除与 addInstance（docs/13 §6.1 / §6.3）
// 所属模块: MachineMax Blockbench 插件

'use strict';

var {
    createHitBoxConfig,
    createInteractBoxConfig,
    createConnectorInstanceConfig,
    createSubPartConfig,
} = require('../core/config.js');
var { generateDefaultName, ensureUniqueName } = require('../core/naming.js');
var em = require('../core/element_markers.js');
var { runConfigEdit } = require('../core/undo.js');
var doc = require('../doc/index.js');
var shared = require('./shared.js');

function ownerFor(config, partId, variantName, element) {
    var marker = em.getMarker(config, partId, variantName, element.uuid);
    var searchEl = (marker && marker.type === 'sub_part') ? (element.parent || null) : element;
    var owner = em.detectOwnerSubPart(config, partId, variantName, searchEl);
    return owner ? owner.spKey : null;
}

function ensureSubPart(variant, spKey) {
    if (!variant.sub_parts) shared.setProp(variant, 'sub_parts', {});
    if (!variant.sub_parts[spKey]) {
        shared.setProp(variant.sub_parts, spKey, createSubPartConfig());
    }
    return variant.sub_parts[spKey];
}

function markHitBox(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    var element = options.element;
    var variant = shared.variantOf(config, options.partId, options.variantName);
    if (!variant) return shared.fail('当前变体不存在');
    if (!element || !element.uuid) return shared.fail('未选中任何元素');

    var spKey = options.spKey || ownerFor(config, options.partId, options.variantName, element);
    var mp = shared.markersPort();

    runConfigEdit('标记为碰撞箱', function () {
        if (spKey) {
            var sp = ensureSubPart(variant, spKey);
            if (!sp.hit_boxes) shared.setProp(sp, 'hit_boxes', {});
            if (!sp.hit_boxes[element.uuid]) {
                shared.setProp(sp.hit_boxes, element.uuid, createHitBoxConfig());
            }
        }
        mp.set(config, options.partId, options.variantName, element.uuid, 'hit_box', spKey);
        if (mp.recalc) mp.recalc(config, options.partId, options.variantName);
    }, { coalesce: false });

    return shared.ok({
        spKey: spKey,
        changed: true,
        warning: spKey ? null : ('碰撞箱 "' + (element.name || '') + '" 无归属子零件（不受防护计算影响）'),
    });
}

function markInteractBox(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    var element = options.element;
    var variant = shared.variantOf(config, options.partId, options.variantName);
    if (!variant) return shared.fail('当前变体不存在');
    if (!element || !element.uuid) return shared.fail('未选中任何元素');

    var spKey = options.spKey || ownerFor(config, options.partId, options.variantName, element);
    var ns = shared.namespaceOf(config);
    var ibName = String(options.key || '').trim();
    if (!ibName) {
        var baseName = generateDefaultName('interact_box', { namespace: ns, boneName: element.name });
        ibName = ensureUniqueName('interact_box', variant, spKey, baseName);
    }
    var keyError = shared.validateKey('interact_boxes', ibName, config,
        ['parts', options.partId, 'variants', options.variantName, 'sub_parts', spKey,
            'interact_boxes', ibName]);
    if (keyError) return shared.fail(keyError.hint, [keyError]);

    var mp = shared.markersPort();
    runConfigEdit('标记为交互区', function () {
        if (spKey) {
            var sp = ensureSubPart(variant, spKey);
            if (!sp.interact_boxes) shared.setProp(sp, 'interact_boxes', {});
            if (!sp.interact_boxes[ibName]) {
                var ibConfig = createInteractBoxConfig();
                ibConfig.bone = element.name;
                ibConfig._uuid = element.uuid;
                shared.setProp(sp.interact_boxes, ibName, ibConfig);
            }
        }
        mp.set(config, options.partId, options.variantName, element.uuid, 'interact_box', spKey);
        if (mp.recalc) mp.recalc(config, options.partId, options.variantName);
    }, { coalesce: false });

    return shared.ok({
        spKey: spKey,
        name: ibName,
        changed: true,
        warning: spKey ? null : ('交互区 "' + (element.name || '') + '" 无归属子零件'),
    });
}

function markConnector(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    var element = options.element;
    var variant = shared.variantOf(config, options.partId, options.variantName);
    if (!variant) return shared.fail('当前变体不存在');
    if (!element || !element.uuid) return shared.fail('未选中任何元素');

    var spKey = options.spKey || ownerFor(config, options.partId, options.variantName, element);
    var locName = element.name || '';
    var ns = shared.namespaceOf(config);
    var connName = String(options.key || '').trim();
    if (!connName) {
        var baseName = generateDefaultName('connector', { namespace: ns, boneName: locName });
        connName = ensureUniqueName('connector', variant, spKey, baseName);
    }
    var keyError = shared.validateKey('connectors', connName, config,
        ['parts', options.partId, 'variants', options.variantName, 'sub_parts', spKey,
            'connectors', connName]);
    if (keyError) return shared.fail(keyError.hint, [keyError]);

    var mp = shared.markersPort();
    runConfigEdit('标记为连接点', function () {
        if (spKey) {
            var sp = ensureSubPart(variant, spKey);
            if (!sp.connectors) shared.setProp(sp, 'connectors', {});
            if (!sp.connectors[connName]) {
                var connConfig = createConnectorInstanceConfig();
                connConfig.locator = locName;
                connConfig._marker_uuid = element.uuid;
                shared.setProp(sp.connectors, connName, connConfig);
            }
        }
        // P2 起 marker.config_ref 统一指向连接点 key（docs/13 §5.4 第 4 行）
        mp.set(config, options.partId, options.variantName, element.uuid, 'connector', connName);
        if (mp.recalc) mp.recalc(config, options.partId, options.variantName);
    }, { coalesce: false });

    return shared.ok({
        spKey: spKey,
        name: connName,
        changed: true,
        warning: spKey ? null : ('连接点 "' + (element.name || '') + '" 无归属子零件'),
    });
}

function renameElementKey(config, options, container, scope, label) {
    options = options || {};
    config = shared.configOrNull(config);
    var partId = options.partId;
    var variantName = options.variantName;
    var spKey = options.spKey;
    var oldKey = options.oldKey || options.key;
    var newKey = String(options.newKey || '').trim();
    var sp = shared.subPartOf(config, partId, variantName, spKey);
    var map = sp && sp[container];
    if (!map || !map[oldKey]) return shared.fail(scope + ' "' + oldKey + '" 不存在');
    if (!newKey || oldKey === newKey) return shared.ok({ changed: false, key: oldKey });

    var mapName = scope === 'connector' ? 'connectors'
        : (scope === 'interact_box' ? 'interact_boxes' : 'subsystems');
    var keyError = shared.validateKey(mapName, newKey, config,
        ['parts', partId, 'variants', variantName, 'sub_parts', spKey, mapName, newKey]);
    if (keyError) return shared.fail(keyError.hint, [keyError]);
    if (map[newKey]) return shared.fail(scope + ' "' + newKey + '" 已存在');

    var renamed = null;
    var mp = shared.markersPort();
    runConfigEdit(label, function () {
        renamed = doc.refs.renameRefs(config, { kind: scope, oldKey: oldKey, newKey: newKey });
        var node = map[oldKey];
        shared.delProp(map, oldKey);
        shared.setProp(map, newKey, node);
        if (mp.recalc) mp.recalc(config, partId, variantName);
    }, { coalesce: false });

    return shared.ok({
        key: newKey,
        changed: true,
        renamed: renamed ? renamed.renamed : [],
        cleaned_references: renamed ? renamed.renamed : [],
    });
}

function renameConnector(config, options) {
    return renameElementKey(config, options, 'connectors', 'connector', '重命名连接点');
}

function renameInteractBox(config, options) {
    return renameElementKey(config, options, 'interact_boxes', 'interact_box', '重命名交互区');
}

function clearElementMarker(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    if (!config || !config.parts) return shared.fail('配置不可用');
    if (!options.uuid) return shared.fail('未选中任何元素');

    runConfigEdit('清除 MachineMax 标记', function () {
        shared.markersPort().clear(config, options.partId, options.variantName, options.uuid);
    }, { coalesce: false });

    return shared.ok({ changed: true });
}

function bindMarker(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    var variant = shared.variantOf(config, options.partId, options.variantName);
    if (!variant) return shared.fail('当前变体不存在');
    if (!options.uuid) return shared.fail('缺少 uuid');
    var type = options.type;
    if (['sub_part', 'hit_box', 'interact_box', 'connector'].indexOf(type) < 0) {
        return shared.fail('无效的标记类型: ' + type);
    }

    var configRef = options.configRef;
    if (type === 'sub_part') {
        if (!configRef || !variant.sub_parts || !variant.sub_parts[configRef]) {
            return shared.fail('子零件 "' + configRef + '" 不存在');
        }
    } else if (type === 'connector' || type === 'interact_box') {
        var mapName = type === 'connector' ? 'connectors' : 'interact_boxes';
        var found = false;
        Object.keys(variant.sub_parts || {}).forEach(function (spKey) {
            var map = variant.sub_parts[spKey] && variant.sub_parts[spKey][mapName];
            if (map && configRef && map[configRef]) found = true;
        });
        if (!found) return shared.fail(type + ' "' + configRef + '" 不存在');
    } else if (type === 'hit_box' && configRef) {
        var sp = variant.sub_parts && variant.sub_parts[configRef];
        if (!sp || !sp.hit_boxes || !sp.hit_boxes[options.uuid]) {
            return shared.fail('碰撞箱条目 "' + configRef + '" 不存在');
        }
    }

    var mp = shared.markersPort();
    runConfigEdit('绑定标记', function () {
        mp.set(config, options.partId, options.variantName, options.uuid, type, configRef);
        if (mp.recalc) mp.recalc(config, options.partId, options.variantName);
    }, { coalesce: false });

    return shared.ok({ changed: true });
}

function removeNode(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用');
    var parsed = doc.address.parsePath(options.path);
    if (!parsed.ok) return shared.fromDoc(parsed, '路径无效');
    var segments = parsed.segments;
    if (segments.length < 2) return shared.fail('不能删除根节点');

    var kindMap = {
        parts: 'part',
        variants: 'variant',
        sub_parts: 'sub_part',
        hit_boxes: 'hit_box',
        interact_boxes: 'interact_box',
        connectors: 'connector',
        subsystems: 'subsystem',
    };
    var mapName = segments[segments.length - 2];
    var kind = kindMap[mapName];
    if (!kind) return shared.fail('该路径不是可删除的配置节点');
    var key = segments[segments.length - 1];

    var removed = null;
    var mp = shared.markersPort();
    runConfigEdit('删除 ' + kind, function () {
        if (kind === 'part') {
            if (mp.clearScope) mp.clearScope(config, { scope: 'part', partId: key });
        } else if (kind === 'variant') {
            if (mp.clearScope) {
                mp.clearScope(config, {
                    scope: 'variant',
                    partId: segments[1],
                    variantName: key,
                });
            }
        } else if (kind === 'hit_box') {
            if (mp.clear) mp.clear(config, segments[1], segments[3], key);
        }
        removed = doc.remove(config, segments, {});
        if (!removed.ok) {
            var e = new Error('remove failed');
            e._opResult = shared.fromDoc(removed, '删除节点失败');
            throw e;
        }
    }, { coalesce: false });

    return shared.ok({
        changed: true,
        cleaned_references: removed ? (removed.cleaned_references || []) : [],
        data: { kind: kind, key: key },
    });
}

function addInstance(config, parentPath, kind, key, definition) {
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用');
    var parsed = doc.address.parsePath(parentPath);
    if (!parsed.ok) return shared.fromDoc(parsed, '父路径无效');
    var parent = parsed.segments;
    if (parent.length < 2 || parent[parent.length - 2] !== 'sub_parts') {
        return shared.fail('addInstance 的父路径必须是 sub_part 节点');
    }
    var partId = parent[1];
    var variantName = parent[3];
    var spKey = parent[5];
    var variant = shared.variantOf(config, partId, variantName);
    if (!variant) return shared.fail('当前变体不存在');

    var factory = kind === 'hit_box' ? createHitBoxConfig
        : (kind === 'interact_box' ? createInteractBoxConfig
            : (kind === 'connector' ? createConnectorInstanceConfig : null));
    if (!factory) return shared.fail('addInstance 只支持 hit_box / interact_box / connector');

    var base = factory();
    var def = Object.assign({}, definition || {});
    Object.keys(def).forEach(function (k) { base[k] = def[k]; });
    var ctx = {
        kind: kind,
        mode: 'create',
        namespace: shared.namespaceOf(config),
        partId: partId,
        variantName: variantName,
        subPartKey: spKey,
        parentPath: parent.concat([kind === 'connector' ? 'connectors'
            : (kind === 'interact_box' ? 'interact_boxes' : 'hit_boxes')]),
        existing: undefined,
    };
    var projected = doc.projection.projectIn(base, ctx);
    if (!projected.ok) return shared.finishProjection(projected);

    var mp = shared.markersPort();
    var resultKey = key;
    runConfigEdit('添加 ' + kind, function () {
        var sp = ensureSubPart(variant, spKey);
        var container = kind === 'connector' ? 'connectors'
            : (kind === 'interact_box' ? 'interact_boxes' : 'hit_boxes');
        if (!sp[container]) shared.setProp(sp, container, {});

        if (kind === 'hit_box') {
            var bones = shared.bonesPort();
            var el = key ? (bones.findByUuid(key) || bones.findByName(key)) : null;
            if (!el) {
                var e = new Error('element not found');
                e._opResult = shared.fail('未找到骨骼 "' + key + '"', [shared.makeError(
                    parent, 'not_found', '已存在的骨骼', key, '请先建模型元素或改用 bind_marker')]);
                throw e;
            }
            resultKey = el.uuid;
            shared.setProp(sp.hit_boxes, el.uuid, projected.node);
            mp.set(config, partId, variantName, el.uuid, 'hit_box', spKey);
        } else {
            var name = key;
            if (!name) {
                var ns = shared.namespaceOf(config);
                var boneName = projected.node.bone || projected.node.locator || kind;
                var baseName = generateDefaultName(kind, {
                    namespace: ns,
                    boneName: boneName,
                });
                name = ensureUniqueName(kind, variant, spKey, baseName);
            }
            var mapName = container === 'connectors' ? 'connectors' : 'interact_boxes';
            var keyError = shared.validateKey(mapName, name, config,
                parent.concat([container, name]));
            if (keyError) {
                var ke = new Error('invalid key');
                ke._opResult = shared.fail(keyError.hint, [keyError]);
                throw ke;
            }
            if (kind === 'interact_box') {
                var el2 = shared.bonesPort().findByName(key || projected.node.bone);
                if (!el2) {
                    var e2 = new Error('element not found');
                    e2._opResult = shared.fail('未找到骨骼 "' + (key || projected.node.bone) + '"', []);
                    throw e2;
                }
                projected.node.bone = el2.name;
                projected.node._uuid = el2.uuid;
                mp.set(config, partId, variantName, el2.uuid, 'interact_box', name);
            } else {
                var loc = shared.bonesPort().findByName(key || projected.node.locator);
                if (!loc) {
                    var e3 = new Error('element not found');
                    e3._opResult = shared.fail('未找到 Locator "' + (key || projected.node.locator) + '"', []);
                    throw e3;
                }
                projected.node.locator = loc.name;
                projected.node._marker_uuid = loc.uuid;
                mp.set(config, partId, variantName, loc.uuid, 'connector', name);
            }
            resultKey = name;
            shared.setProp(sp[container], name, projected.node);
        }
        if (mp.recalc) mp.recalc(config, partId, variantName);
    }, { coalesce: false });

    return shared.ok({
        key: resultKey,
        changed: true,
        data: { kind: kind, key: resultKey },
    });
}

module.exports = {
    markHitBox: markHitBox,
    markInteractBox: markInteractBox,
    markConnector: markConnector,
    renameConnector: renameConnector,
    renameInteractBox: renameInteractBox,
    clearElementMarker: clearElementMarker,
    bindMarker: bindMarker,
    removeNode: removeNode,
    addInstance: addInstance,
    _internals: { renameElementKey: renameElementKey },
};
