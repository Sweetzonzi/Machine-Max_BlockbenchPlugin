/**
 * operations.js — 配置领域操作层
 *
 * 一个函数 = 一个业务动作（新建零件 / 删除变体 / 标记为碰撞箱 / 切换内容包…），
 * **撤销记录由操作函数自己开**（内部调用 `undo.runConfigEdit`），UI 只负责
 * 收集输入、调用操作、提示结果。这样：
 *
 * - 同一个动作无论从工具栏、面板、右键菜单还是将来的 MCP 工具触发，都自带撤销；
 * - 对话框不再持有撤销边界，不会出现"对话框包了、别的入口没包"的漏网；
 * - 校验（重名 / 空 ID / 类型无效）在进入撤销前完成，失败不产生空记录。
 *
 * 约定：
 * - 返回 `{ ok: true, ... }` 或 `{ ok: false, error: '可读原因' }`，不抛异常；
 * - 只改配置，不做 Toast / 保存 / 图标刷新（这些属于 UI 层）；
 * - 需要 Vue 2 响应式的写入统一走 `vueSet` / `vueDelete`（有 Vue 时用 Vue.set/delete）。
 */

'use strict';

var { runConfigEdit } = require('./undo.js');
var {
    createPartConfig,
    createVariantConfig,
    createSubPartConfig,
    createHitBoxConfig,
    createInteractBoxConfig,
    createConnectorInstanceConfig,
} = require('./config.js');
var { setMarker, clearMarker, clearAllMarkers, getMarker, detectOwnerSubPart } = require('./element_markers.js');
var { generateDefaultName, ensureUniqueName } = require('./naming.js');
var ssTypes = require('./subsystem_types.js');
var { createLogger } = require('../utils/logger.js');

var log = createLogger('Operations');

// =============================================================================
// 内部工具
// =============================================================================

/**
 * 写入配置字段：有 Vue 时用 Vue.set，保证 Vue 2 能观测到新增 key
 * @param {Object} obj
 * @param {string} key
 * @param {*} value
 */
function vueSet(obj, key, value) {
    if (typeof Vue !== 'undefined' && Vue && typeof Vue.set === 'function') {
        return Vue.set(obj, key, value);
    }
    obj[key] = value;
    return value;
}

/**
 * 删除配置字段：有 Vue 时用 Vue.delete
 * @param {Object} obj
 * @param {string} key
 */
function vueDelete(obj, key) {
    if (typeof Vue !== 'undefined' && Vue && typeof Vue.delete === 'function') {
        return Vue.delete(obj, key);
    }
    delete obj[key];
}

function ok(extra) {
    var result = { ok: true };
    if (extra) {
        for (var k in extra) {
            if (Object.prototype.hasOwnProperty.call(extra, k)) result[k] = extra[k];
        }
    }
    return result;
}

function fail(message) {
    log.warn('操作失败：' + message);
    return { ok: false, error: message };
}

/** 取配置对象（未打开工程时返回 null） */
function _configOrNull(config) {
    if (!config || typeof config !== 'object') return null;
    return config;
}

/** 取零件配置 */
function _part(config, partId) {
    if (!config || !config.parts || !partId) return null;
    return config.parts[partId] || null;
}

/** 取变体配置 */
function _variant(config, partId, variantName) {
    var part = _part(config, partId);
    if (!part || !part.variants || !variantName) return null;
    return part.variants[variantName] || null;
}

/** 写 _uiState（不属于工程内容，不进撤销快照） */
function _setUiState(config, patch) {
    if (!config._uiState || typeof config._uiState !== 'object') {
        config._uiState = { activeMode: 'part', activePartId: '', activeVariantName: '' };
    }
    for (var key in patch) {
        if (Object.prototype.hasOwnProperty.call(patch, key)) {
            config._uiState[key] = patch[key];
        }
    }
    return config._uiState;
}

// =============================================================================
// 零件 / 变体
// =============================================================================

/**
 * 新建零件
 *
 * @param {Object} config - 完整项目配置
 * @param {{partId: string, variantName?: string, model?: string}} options
 * @returns {{ok: boolean, partId?: string, variantName?: string, error?: string}}
 */
function createPart(config, options) {
    options = options || {};
    config = _configOrNull(config);
    if (!config) return fail('配置不可用，请先打开项目');

    var partId = String(options.partId || '').trim();
    var variantName = String(options.variantName || '').trim() || 'default';
    var model = options.model || '';

    if (!partId) return fail('零件 ID 不能为空');
    if (!config.parts) config.parts = {};
    if (config.parts[partId]) return fail('零件 "' + partId + '" 已存在');

    runConfigEdit('新建零件', function () {
        vueSet(config.parts, partId, createPartConfig(partId, variantName));
        if (model) {
            vueSet(config.parts[partId].variants[variantName], 'model', model);
        }
        _setUiState(config, { activePartId: partId, activeVariantName: variantName });
    });

    log.info('createPart: 已创建', { partId: partId, variant: variantName });
    return ok({ partId: partId, variantName: variantName });
}

/**
 * 删除零件，并把 _uiState 落到剩余的第一个零件
 *
 * @param {Object} config
 * @param {{partId: string}} options
 * @returns {{ok: boolean, remaining?: string[], activePartId?: string, activeVariantName?: string, error?: string}}
 */
function deletePart(config, options) {
    options = options || {};
    config = _configOrNull(config);
    if (!config || !config.parts) return fail('配置不可用');
    var partId = options.partId;
    if (!partId || !config.parts[partId]) return fail('零件 "' + partId + '" 不存在');

    var remaining = [];
    var state = null;
    runConfigEdit('删除零件', function () {
        vueDelete(config.parts, partId);
        remaining = Object.keys(config.parts);
        if (remaining.length > 0) {
            var firstPart = config.parts[remaining[0]];
            var variants = Object.keys((firstPart && firstPart.variants) || {});
            state = _setUiState(config, {
                activePartId: remaining[0],
                activeVariantName: variants.length > 0 ? variants[0] : 'default',
            });
        } else {
            state = _setUiState(config, { activePartId: '', activeVariantName: '' });
        }
    });

    log.info('deletePart: 已删除', { partId: partId, remaining: remaining });
    return ok({
        remaining: remaining,
        activePartId: state.activePartId,
        activeVariantName: state.activeVariantName,
    });
}

/**
 * 新建变体（自动写入默认涂装路径）
 *
 * @param {Object} config
 * @param {{partId: string, variantName: string, model?: string}} options
 * @returns {{ok: boolean, variantName?: string, error?: string}}
 */
function createVariant(config, options) {
    options = options || {};
    config = _configOrNull(config);
    if (!config) return fail('配置不可用，请先打开项目');

    var partId = options.partId;
    var variantName = String(options.variantName || '').trim();
    var model = options.model || '';
    var part = _part(config, partId);
    if (!part) return fail('当前零件不存在');
    if (!variantName) return fail('变体名不能为空');
    if (!part.variants) part.variants = {};
    if (part.variants[variantName]) return fail('变体 "' + variantName + '" 已存在');

    var defaultTexture = options.texture !== undefined
        ? options.texture
        : ('machine_max:textures/part/' + partId + '/' + partId + '.png');

    runConfigEdit('新建变体', function () {
        var variant = createVariantConfig();
        vueSet(part.variants, variantName, variant);
        if (model) variant.model = model;
        if (defaultTexture) variant.textures = { 'default': defaultTexture };
        _setUiState(config, { activeVariantName: variantName });
    });

    log.info('createVariant: 已创建', { partId: partId, variant: variantName });
    return ok({ variantName: variantName });
}

/**
 * 删除变体（连同该变体的 element_markers）
 *
 * @param {Object} config
 * @param {{partId: string, variantName: string}} options
 * @returns {{ok: boolean, remaining?: string[], activeVariantName?: string, error?: string}}
 */
function deleteVariant(config, options) {
    options = options || {};
    config = _configOrNull(config);
    var partId = options.partId;
    var variantName = options.variantName;
    var part = _part(config, partId);
    if (!part) return fail('当前零件不存在');
    if (!variantName || !part.variants || !part.variants[variantName]) {
        return fail('变体 "' + variantName + '" 不存在');
    }

    var remaining = [];
    var active = '';
    runConfigEdit('删除变体', function () {
        clearAllMarkers(config, partId, variantName);
        vueDelete(part.variants, variantName);
        remaining = Object.keys(part.variants);
        active = remaining.length > 0 ? remaining[0] : '';
        _setUiState(config, { activeVariantName: active });
    });

    log.info('deleteVariant: 已删除', { partId: partId, variant: variantName, remaining: remaining });
    return ok({ remaining: remaining, activeVariantName: active });
}

// =============================================================================
// 子系统实例
// =============================================================================

/**
 * 在指定子零件下新建子系统实例
 *
 * @param {Object} config
 * @param {{partId: string, variantName: string, spKey: string, typeId: string, instanceName: string}} options
 * @returns {{ok: boolean, instanceName?: string, error?: string}}
 */
function createSubsystem(config, options) {
    options = options || {};
    config = _configOrNull(config);
    if (!config) return fail('配置不可用，请先打开项目');

    var partId = options.partId;
    var variantName = options.variantName;
    var spKey = options.spKey;
    var typeId = options.typeId;
    var instanceName = String(options.instanceName || '').trim();

    var variant = _variant(config, partId, variantName);
    if (!variant) return fail('当前变体不存在');
    if (!spKey) return fail('缺少子零件');
    if (!typeId) return fail('请选择子系统类型');
    if (!instanceName) return fail('子系统名称不能为空');

    var meta = ssTypes.getTypeMeta(typeId);
    if (!meta) return fail('无效的子系统类型: ' + typeId);

    var sp = variant.sub_parts && variant.sub_parts[spKey];
    if (sp && sp.subsystems && sp.subsystems[instanceName]) {
        return fail('子系统 "' + instanceName + '" 已存在');
    }

    var defaults = ssTypes.getTypeDefaults(typeId) || {};

    runConfigEdit('添加子系统', function () {
        if (!variant.sub_parts) vueSet(variant, 'sub_parts', {});
        if (!variant.sub_parts[spKey]) {
            var spConfig = createSubPartConfig();
            spConfig.start_bone = spKey;
            vueSet(variant.sub_parts, spKey, spConfig);
        }
        var target = variant.sub_parts[spKey];
        if (!target.subsystems) vueSet(target, 'subsystems', {});

        var ssConfig = { type: typeId, definition: '' };
        for (var key in defaults) {
            if (Object.prototype.hasOwnProperty.call(defaults, key)) {
                ssConfig[key] = defaults[key];
            }
        }
        vueSet(target.subsystems, instanceName, ssConfig);
    });

    log.info('createSubsystem: 已创建', { partId: partId, spKey: spKey, instanceName: instanceName, typeId: typeId });
    return ok({ instanceName: instanceName });
}

/**
 * 删除子系统实例
 *
 * @param {Object} config
 * @param {{partId: string, variantName: string, spKey: string, ssKey: string}} options
 * @returns {{ok: boolean, error?: string}}
 */
function deleteSubsystem(config, options) {
    options = options || {};
    config = _configOrNull(config);
    var variant = _variant(config, options.partId, options.variantName);
    var sp = variant && variant.sub_parts ? variant.sub_parts[options.spKey] : null;
    if (!sp || !sp.subsystems || !options.ssKey || !sp.subsystems[options.ssKey]) {
        return fail('子系统 "' + options.ssKey + '" 不存在');
    }

    runConfigEdit('删除子系统', function () {
        vueDelete(sp.subsystems, options.ssKey);
    });

    log.info('deleteSubsystem: 已删除', { spKey: options.spKey, ssKey: options.ssKey });
    return ok();
}

// =============================================================================
// 变体标签
// =============================================================================

/**
 * 覆盖变体的标签列表
 *
 * @param {Object} config
 * @param {{partId: string, variantName: string, tags: string[]}} options
 * @returns {{ok: boolean, error?: string}}
 */
function setVariantTags(config, options) {
    options = options || {};
    config = _configOrNull(config);
    var variant = _variant(config, options.partId, options.variantName);
    if (!variant) return fail('当前变体不存在');

    var tags = Array.isArray(options.tags) ? options.tags.slice() : [];
    runConfigEdit('编辑变体标签', function () {
        vueSet(variant, 'tags', tags);
    });

    log.info('setVariantTags: 已更新', { partId: options.partId, variant: options.variantName, count: tags.length });
    return ok({ tags: tags });
}

// =============================================================================
// 元素标记（右键菜单）
// =============================================================================

/**
 * 把骨骼标记为子零件（自动生成唯一翻译键名）
 *
 * @param {Object} config
 * @param {{partId: string, variantName: string, element: Object}} options - element 为 Outliner Group
 * @returns {{ok: boolean, spKey?: string, error?: string}}
 */
function markSubPart(config, options) {
    options = options || {};
    config = _configOrNull(config);
    var element = options.element;
    var variant = _variant(config, options.partId, options.variantName);
    if (!variant) return fail('当前变体不存在');
    if (!element || !element.uuid) return fail('未选中任何元素');

    var ns = config.namespace || 'machine_max';
    var baseName = generateDefaultName('sub_part', { namespace: ns });
    var spKey = ensureUniqueName('sub_part', variant, null, baseName);

    runConfigEdit('标记为子零件', function () {
        setMarker(config, options.partId, options.variantName, element.uuid, 'sub_part', spKey);
    });

    log.info('markSubPart: 已标记', { spKey: spKey, uuid: element.uuid });
    return ok({ spKey: spKey });
}

/**
 * 把骨骼标记为碰撞箱（无归属子零件时仍标记，但不受防护计算影响）
 *
 * @param {Object} config
 * @param {{partId: string, variantName: string, element: Object}} options
 * @returns {{ok: boolean, spKey?: string|null, warning?: string, error?: string}}
 */
function markHitBox(config, options) {
    options = options || {};
    config = _configOrNull(config);
    var element = options.element;
    var variant = _variant(config, options.partId, options.variantName);
    if (!variant) return fail('当前变体不存在');
    if (!element || !element.uuid) return fail('未选中任何元素');

    var marker = getMarker(config, options.partId, options.variantName, element.uuid);
    // 若当前骨骼本身就是子零件，从父级开始查找上级子零件，
    // 避免碰撞箱条目创建到即将被删除的子零件配置中而丢失
    var searchEl = (marker && marker.type === 'sub_part') ? (element.parent || null) : element;
    var owner = detectOwnerSubPart(config, options.partId, options.variantName, searchEl);
    var spKey = owner ? owner.spKey : null;

    runConfigEdit('标记为碰撞箱', function () {
        if (spKey) {
            if (!variant.sub_parts) variant.sub_parts = {};
            if (!variant.sub_parts[spKey]) {
                vueSet(variant.sub_parts, spKey, createSubPartConfig());
            }
            var sp = variant.sub_parts[spKey];
            if (!sp.hit_boxes) vueSet(sp, 'hit_boxes', {});
            if (!sp.hit_boxes[element.uuid]) {
                vueSet(sp.hit_boxes, element.uuid, createHitBoxConfig());
            }
        }
        setMarker(config, options.partId, options.variantName, element.uuid, 'hit_box', spKey);
    });

    log.info('markHitBox: 已标记', { spKey: spKey, uuid: element.uuid });
    return ok({
        spKey: spKey,
        warning: spKey ? null : ('碰撞箱 "' + (element.name || '') + '" 无归属子零件（不受防护计算影响）'),
    });
}

/**
 * 把骨骼标记为交互区
 *
 * @param {Object} config
 * @param {{partId: string, variantName: string, element: Object}} options
 * @returns {{ok: boolean, spKey?: string|null, name?: string, warning?: string, error?: string}}
 */
function markInteractBox(config, options) {
    options = options || {};
    config = _configOrNull(config);
    var element = options.element;
    var variant = _variant(config, options.partId, options.variantName);
    if (!variant) return fail('当前变体不存在');
    if (!element || !element.uuid) return fail('未选中任何元素');

    var marker = getMarker(config, options.partId, options.variantName, element.uuid);
    var searchEl = (marker && marker.type === 'sub_part') ? (element.parent || null) : element;
    var owner = detectOwnerSubPart(config, options.partId, options.variantName, searchEl);
    var spKey = owner ? owner.spKey : null;

    var ns = config.namespace || 'machine_max';
    var baseName = generateDefaultName('interact_box', { namespace: ns, boneName: element.name });
    var ibName = ensureUniqueName('interact_box', variant, spKey, baseName);

    runConfigEdit('标记为交互区', function () {
        if (spKey) {
            if (!variant.sub_parts) variant.sub_parts = {};
            if (!variant.sub_parts[spKey]) {
                vueSet(variant.sub_parts, spKey, createSubPartConfig());
            }
            var sp = variant.sub_parts[spKey];
            if (!sp.interact_boxes) vueSet(sp, 'interact_boxes', {});
            if (!sp.interact_boxes[ibName]) {
                var ibConfig = createInteractBoxConfig();
                ibConfig.bone = element.name;
                ibConfig._uuid = element.uuid;
                vueSet(sp.interact_boxes, ibName, ibConfig);
            }
        }
        setMarker(config, options.partId, options.variantName, element.uuid, 'interact_box', spKey);
    });

    log.info('markInteractBox: 已标记', { spKey: spKey, name: ibName, uuid: element.uuid });
    return ok({
        spKey: spKey,
        name: ibName,
        warning: spKey ? null : ('交互区 "' + (element.name || '') + '" 无归属子零件'),
    });
}

/**
 * 把 Locator 标记为连接点
 *
 * @param {Object} config
 * @param {{partId: string, variantName: string, element: Object}} options
 * @returns {{ok: boolean, spKey?: string|null, name?: string, warning?: string, error?: string}}
 */
function markConnector(config, options) {
    options = options || {};
    config = _configOrNull(config);
    var element = options.element;
    var variant = _variant(config, options.partId, options.variantName);
    if (!variant) return fail('当前变体不存在');
    if (!element || !element.uuid) return fail('未选中任何元素');

    var owner = detectOwnerSubPart(config, options.partId, options.variantName, element);
    var spKey = owner ? owner.spKey : null;

    var locName = element.name || '';
    var ns = config.namespace || 'machine_max';
    var baseName = generateDefaultName('connector', { namespace: ns, boneName: locName });
    var connName = ensureUniqueName('connector', variant, spKey, baseName);

    runConfigEdit('标记为连接点', function () {
        if (spKey) {
            if (!variant.sub_parts) variant.sub_parts = {};
            if (!variant.sub_parts[spKey]) {
                vueSet(variant.sub_parts, spKey, createSubPartConfig());
            }
            var sp = variant.sub_parts[spKey];
            if (!sp.connectors) vueSet(sp, 'connectors', {});
            if (!sp.connectors[connName]) {
                var connConfig = createConnectorInstanceConfig();
                connConfig.locator = locName;
                connConfig._marker_uuid = element.uuid;
                vueSet(sp.connectors, connName, connConfig);
            }
        }
        // 连接点的 config_ref 由标记独立维护（不指向定义）
        setMarker(config, options.partId, options.variantName, element.uuid, 'connector', null);
    });

    log.info('markConnector: 已标记', { spKey: spKey, name: connName, locator: locName });
    return ok({
        spKey: spKey,
        name: connName,
        warning: spKey ? null : ('连接点 "' + (element.name || '') + '" 无归属子零件'),
    });
}

/**
 * 清除元素上的 MachineMax 标记，并连带删除对应定义条目
 *
 * @param {Object} config
 * @param {{partId: string, variantName: string, uuid: string}} options
 * @returns {{ok: boolean, error?: string}}
 */
function clearElementMarker(config, options) {
    options = options || {};
    config = _configOrNull(config);
    if (!config || !config.parts) return fail('配置不可用');
    if (!options.uuid) return fail('未选中任何元素');

    runConfigEdit('清除 MachineMax 标记', function () {
        clearMarker(config, options.partId, options.variantName, options.uuid);
    });

    log.info('clearElementMarker: 已清除', { partId: options.partId, uuid: options.uuid });
    return ok();
}

// =============================================================================
// 内容包路径 / 元数据 / 依赖
// =============================================================================

/**
 * 切换内容包：同时写入路径、namespace 与 packMeta
 *
 * @param {Object} config
 * @param {{path: string, namespace?: string, meta?: Object, label?: string}} options
 * @returns {{ok: boolean, error?: string}}
 */
function setContentPack(config, options) {
    options = options || {};
    config = _configOrNull(config);
    if (!config) return fail('配置不可用，请先打开项目');

    var path = options.path || '';
    var namespace = options.namespace || '';
    var meta = options.meta || {};
    var label = options.label || '切换内容包';

    runConfigEdit(label, function () {
        config.contentPackPath = path;
        config.namespace = namespace;
        config.packMeta = meta;
    });

    log.info('setContentPack: 已切换', { path: path, namespace: namespace, hasMeta: !!meta });
    return ok();
}

/**
 * 只改内容包路径（项目管理对话框）
 *
 * @param {Object} config
 * @param {string} path
 * @returns {{ok: boolean, error?: string}}
 */
function setContentPackPath(config, path) {
    config = _configOrNull(config);
    if (!config) return fail('配置不可用，请先打开项目');

    runConfigEdit('修改内容包路径', function () {
        config.contentPackPath = path || '';
    });

    log.info('setContentPackPath: 已更新', { path: path });
    return ok();
}

/**
 * 合并写入 packMeta 字段
 *
 * @param {Object} config
 * @param {Object} patch - 要写入的字段
 * @returns {{ok: boolean, error?: string}}
 */
function updatePackMeta(config, patch) {
    config = _configOrNull(config);
    if (!config) return fail('配置不可用，请先打开项目');
    patch = patch || {};

    runConfigEdit('修改内容包信息', function () {
        if (!config.packMeta || typeof config.packMeta !== 'object') {
            config.packMeta = {};
        }
        for (var key in patch) {
            if (Object.prototype.hasOwnProperty.call(patch, key)) {
                vueSet(config.packMeta, key, patch[key]);
            }
        }
    });

    log.info('updatePackMeta: 已更新', { keys: Object.keys(patch) });
    return ok();
}

/**
 * 依赖路径批量编辑（添加 / 移除 / 整体替换）
 *
 * @param {Object} config
 * @param {{add?: string[], remove?: string[], replace?: string[]}} options
 * @returns {{ok: boolean, changed?: boolean, dependencyPaths?: string[], error?: string}}
 */
function updateDependencyPaths(config, options) {
    options = options || {};
    config = _configOrNull(config);
    if (!config) return fail('配置不可用，请先打开项目');

    var add = options.add || [];
    var remove = options.remove || [];
    var replace = options.replace;
    var changed = false;
    var paths = [];

    runConfigEdit('编辑依赖包', function () {
        if (Array.isArray(replace)) {
            config.dependencyPaths = replace.slice();
            changed = true;
        } else {
            if (!Array.isArray(config.dependencyPaths)) config.dependencyPaths = [];
            var i;
            for (i = 0; i < remove.length; i++) {
                var idx = config.dependencyPaths.indexOf(remove[i]);
                if (idx !== -1) {
                    config.dependencyPaths.splice(idx, 1);
                    changed = true;
                }
            }
            for (i = 0; i < add.length; i++) {
                if (add[i] && config.dependencyPaths.indexOf(add[i]) === -1) {
                    config.dependencyPaths.push(add[i]);
                    changed = true;
                }
            }
        }
        paths = config.dependencyPaths.slice();
    });

    if (!changed) {
        // 没有任何实际变更：runConfigEdit 会因 before==post 自动丢弃空记录
        log.debug('updateDependencyPaths: 无变更');
    }
    return ok({ changed: changed, dependencyPaths: paths });
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createPart,
        deletePart,
        createVariant,
        deleteVariant,
        createSubsystem,
        deleteSubsystem,
        setVariantTags,
        markSubPart,
        markHitBox,
        markInteractBox,
        markConnector,
        clearElementMarker,
        setContentPack,
        setContentPackPath,
        updatePackMeta,
        updateDependencyPaths,
        _internals: { vueSet, vueDelete, _setUiState },
    };
}
