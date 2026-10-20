/**
 * undo.js — 接入 Blockbench 原生撤销栈
 *
 * 让 `Project.machine_max_plugin`（即插件正在制作的内容包定义）的每一次变更
 * 都成为一条 Blockbench 原生撤销记录，与元素 / 贴图 / 动画编辑共用同一个
 * `Undo.history`，因此 Ctrl+Z / Ctrl+Y / 编辑菜单 / 撤销历史面板全部原生可用。
 *
 * 设计要点（详见 docs/11-接入Blockbench原生撤销.md）：
 * - Blockbench 的 UndoSystem.save 只识别固定 aspect 键，不认识插件配置；
 *   官方扩展点是 `create_undo_save` / `load_undo_save` 两个事件。
 * - 用一个自有 aspect 标志 `{ machine_max: true }` 标记"这条记录要连配置一起快照"，
 *   `fromState` 会忽略未知键，插件在 `create_undo_save` 里往 save 上挂
 *   `machine_max_plugin_snapshot`，在 `load_undo_save` 里把它写回运行态。
 * - 快照整块深拷贝（不做字段级 diff），`_uiState` 不进快照（它描述"我正在看什么"，
 *   不是工程内容）。
 * - `Undo` 在 Blockbench 5.0.x / 5.1.x 上是全局访问器（`Blockbench.Project?.undo`），
 *   换工程即换实例，因此每次操作都重新取，不做模块级缓存。
 *
 * 使用方式：
 * ```js
 * const undo = require('../core/undo.js');
 * // 1) 一次性编辑
 * undo.runConfigEdit('新建零件', function () { config.parts[id] = ...; });
 * // 2) 包装既有函数（保留 this / 返回值 / 同步语义）
 * dialog.onConfirm = undo.withUndoEdit('删除零件', originalOnConfirm);
 * // 3) 批量包装组件 methods（在 Vue.component 注册之前调用）
 * undo.wrapMethodMap(componentOptions.methods, { updateField: '修改字段' });
 * ```
 */

var { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('Undo');

/** 配置在 Project 上的 Property 名（与 persistence.js 保持一致） */
var PROPERTY_NAME = 'machine_max_plugin';

/** 自有 aspect 标志：fromState 不认识它，仅作为"本次记录含插件配置"的标记 */
var ASPECT_FLAG = 'machine_max';

/** 挂在 UndoSystem.save 上的快照键 */
var SNAPSHOT_KEY = 'machine_max_plugin_snapshot';

/** 撤销/重做恢复配置后派发的事件（Vue 面板据此重新读取配置） */
var RESTORED_EVENT = 'mm_config_restored';

/** 单条快照体积上限（字节估），超出则拒绝进入撤销栈 */
var MAX_SNAPSHOT_BYTES = 2 * 1024 * 1024;

/** 同类连续编辑的合并窗口（毫秒），避免 @input 每键入一次就压一条记录 */
var COALESCE_WINDOW_MS = 800;

/** 已注册的事件监听清理函数 */
var _listeners = [];

/** 当前是否处于一次 runConfigEdit 之内（嵌套调用并入外层记录） */
var _depth = 0;

/** 是否正在从撤销栈恢复配置（恢复期间禁止再开新编辑） */
var _restoring = false;

/** 上次"未能进入撤销栈"提示的时间，避免刷屏 */
var _lastBlockedNoticeAt = 0;

var hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

// =============================================================================
// 基础工具
// =============================================================================

/**
 * 取当前工程的撤销系统。
 *
 * Blockbench 5.x 把 `Undo` 定义为全局访问器，返回 `Blockbench.Project?.undo`；
 * 工程未打开时为空。切换工程后实例会变，所以调用方不得缓存返回值。
 *
 * @returns {Object|null} UndoSystem 实例或 null
 */
function getUndo() {
    try {
        if (typeof Undo !== 'undefined' && Undo) return Undo;
        if (typeof Blockbench !== 'undefined' && Blockbench && Blockbench.Undo) return Blockbench.Undo;
    } catch (e) {
        log.debug('getUndo: Undo 不可用', e && e.message);
    }
    return null;
}

/**
 * 取当前工程的 MachineMax 配置对象
 * @returns {Object|null}
 */
function getProjectConfig() {
    if (typeof Project === 'undefined' || !Project || Project === 0) return null;
    return Project[PROPERTY_NAME] || null;
}

/**
 * 深拷贝纯数据（配置树天然满足：无函数、无循环引用）。
 * 优先 structuredClone（保留 undefined），降级 JSON 往返。
 * @param {*} value
 * @returns {*}
 */
function deepClone(value) {
    if (value === null || typeof value !== 'object') return value;
    if (typeof structuredClone === 'function') {
        try {
            return structuredClone(value);
        } catch (e) {
            log.debug('deepClone: structuredClone 失败，降级 JSON', e && e.message);
        }
    }
    return JSON.parse(JSON.stringify(value));
}

/**
 * 估算快照体积（字符数，按 UTF-8 上界的保守近似）
 * @param {*} value
 * @returns {number}
 */
function estimateSize(value) {
    try {
        return JSON.stringify(value === undefined ? null : value).length;
    } catch (e) {
        return MAX_SNAPSHOT_BYTES + 1;
    }
}

/**
 * 生成一份撤销快照（深拷贝配置，剔除 _uiState）
 * @returns {{project_uuid: string, config: Object}|null}
 */
function createSnapshot() {
    var cfg = getProjectConfig();
    if (!cfg || typeof cfg !== 'object') return null;

    var copy;
    try {
        copy = deepClone(cfg);
    } catch (e) {
        log.error('createSnapshot: 深拷贝失败，本条记录不含配置快照', e);
        return null;
    }
    if (copy && typeof copy === 'object') {
        delete copy._uiState;
    }
    var uuid = (typeof Project !== 'undefined' && Project && Project.uuid) ? Project.uuid : '';
    return { project_uuid: uuid, config: copy };
}

/**
 * 恢复快照后的 _uiState 归一化：
 * 快照不含 _uiState，恢复后的 parts/variants 可能已不含当前选中项，
 * 此时退化到第一个可用目标；空配置则清空。
 *
 * @param {Object} config - 恢复出来的配置
 * @param {Object|null} uiState - 恢复前的 UI 状态（深拷贝）
 * @returns {Object} 归一化后的 _uiState
 */
function reconcileUiState(config, uiState) {
    var next = (uiState && typeof uiState === 'object') ? uiState : {};
    var parts = (config && config.parts && typeof config.parts === 'object') ? config.parts : {};
    var partIds = Object.keys(parts);

    var activePartId = next.activePartId;
    if (!activePartId || !hasOwn(parts, activePartId)) {
        activePartId = partIds.length > 0 ? partIds[0] : '';
        next.activeVariantName = '';
    }

    var variants = {};
    if (activePartId && parts[activePartId] && parts[activePartId].variants) {
        variants = parts[activePartId].variants;
    }
    var variantNames = Object.keys(variants);
    var activeVariantName = next.activeVariantName;
    if (!activeVariantName || variantNames.indexOf(activeVariantName) === -1) {
        activeVariantName = variantNames.length > 0 ? variantNames[0] : (activePartId ? 'default' : '');
    }

    next.activePartId = activePartId;
    next.activeVariantName = activeVariantName;
    if (!next.activeMode) next.activeMode = 'machine_max_part';
    if (next._pendingSubsystemNav === undefined) next._pendingSubsystemNav = null;
    return next;
}

/**
 * 配置被恢复后统一刷新三处显示：
 *  1. Outliner 图标（由 element_markers 重算，Vue 2 观测不到 element_markers 的直接赋值）
 *  2. Vue 面板（mm_config_restored → loadConfigData + 重算）
 *  3. 原生问题清单（dispatchEvent('update_selection') 会触发 Validator.validate）
 */
function refreshAfterRestore() {
    try {
        require('../mode/icons.js').refreshOutlinerIcons();
    } catch (e) {
        log.warn('refreshAfterRestore: 刷新 Outliner 图标失败', e && e.message);
    }

    // 内容包路径 / 依赖可能被撤销，合并视图缓存必须失效
    try {
        require('./content_pack_manager.js').invalidateCache();
    } catch (e) {
        log.warn('refreshAfterRestore: 清理内容包缓存失败', e && e.message);
    }

    if (typeof Blockbench === 'undefined' || typeof Blockbench.dispatchEvent !== 'function') return;

    try {
        Blockbench.dispatchEvent(RESTORED_EVENT, {});
    } catch (e) {
        log.warn('refreshAfterRestore: 派发 ' + RESTORED_EVENT + ' 失败', e && e.message);
    }
    try {
        Blockbench.dispatchEvent('update_selection');
    } catch (e) {
        log.warn('refreshAfterRestore: 派发 update_selection 失败', e && e.message);
    }
}

// =============================================================================
// 撤销桥：create_undo_save / load_undo_save
// =============================================================================

/**
 * create_undo_save 处理器：给带插件 aspect 标志的 save 挂配置快照。
 * @param {{save: Object, aspects: Object}} data
 */
function onCreateUndoSave(data) {
    if (!data || !data.aspects || !data.aspects[ASPECT_FLAG]) return;
    if (!data.save) return;

    var snapshot = createSnapshot();
    if (!snapshot) return;

    data.save[SNAPSHOT_KEY] = snapshot;
    log.debug('create_undo_save: 已挂配置快照', {
        parts: snapshot.config && snapshot.config.parts ? Object.keys(snapshot.config.parts).length : 0,
        size: estimateSize(snapshot.config),
    });
}

/**
 * 把快照写回运行态。
 *
 * 采用"就地覆盖"而不是替换 `Project[PROPERTY_NAME]`：面板与已打开的对话框都
 * 持有配置对象的引用，整体替换会让它们继续指向旧对象（撤销后在旧对话框点确认
 * 就会写进已脱离的副本）。配置的顶层键是固定集合（parts / packMeta /
 * contentPackPath / dependencyPaths / namespace / modelFile / _uiState），
 * 给已存在的响应式键赋值会走 Vue 的 setter 并把新值 observe，因此就地覆盖同样
 * 能触发界面更新。
 *
 * @param {Object} live - 当前运行态配置对象
 * @param {Object} next - 恢复出来的配置对象
 */
function applySnapshot(live, next) {
    if (typeof Project === 'undefined' || !Project || Project === 0) return;
    if (!live || typeof live !== 'object') {
        Project[PROPERTY_NAME] = next;
        return;
    }

    var key;
    for (key in next) {
        if (hasOwn(next, key)) live[key] = next[key];
    }
    for (key in live) {
        if (hasOwn(live, key) && !hasOwn(next, key)) delete live[key];
    }
    Project[PROPERTY_NAME] = live;
}

/**
 * load_undo_save 处理器：撤销 / 重做 / 远程编辑回放时把快照写回运行态。
 * 没有快照的记录（原生元素编辑、旧记录）直接跳过。
 * @param {{save: Object, reference: Object, mode: string}} data
 */
function onLoadUndoSave(data) {
    if (!data || !data.save) return;
    var snapshot = data.save[SNAPSHOT_KEY];
    if (!snapshot || !snapshot.config) return;

    if (typeof Project === 'undefined' || !Project || Project === 0) return;
    var currentUuid = Project.uuid || '';
    if (snapshot.project_uuid && currentUuid && snapshot.project_uuid !== currentUuid) {
        log.warn('load_undo_save: 快照属于其他工程，跳过', {
            snapshot: snapshot.project_uuid, current: currentUuid,
        });
        return;
    }

    _restoring = true;
    try {
        var live = Project[PROPERTY_NAME];
        var uiState = (live && live._uiState && typeof live._uiState === 'object') ? deepClone(live._uiState) : null;
        var next = deepClone(snapshot.config) || {};
        next._uiState = reconcileUiState(next, uiState);
        applySnapshot(live, next);
        log.debug('load_undo_save: 配置已恢复', {
            parts: (Project[PROPERTY_NAME] && Project[PROPERTY_NAME].parts) ? Object.keys(Project[PROPERTY_NAME].parts).length : 0,
            activePartId: next._uiState.activePartId,
            activeVariantName: next._uiState.activeVariantName,
        });
        refreshAfterRestore();
    } catch (e) {
        log.error('load_undo_save: 恢复配置失败', e);
    } finally {
        _restoring = false;
    }
}

/**
 * 注册撤销桥（幂等，供 plugin.js onload 调用）
 */
function registerUndoBridge() {
    if (_listeners.length > 0) {
        log.debug('registerUndoBridge: 已注册，跳过');
        return;
    }
    if (typeof Blockbench === 'undefined' || typeof Blockbench.on !== 'function') {
        log.warn('registerUndoBridge: Blockbench.on 不可用，跳过');
        return;
    }

    _listeners.push(Blockbench.on('create_undo_save', onCreateUndoSave));
    _listeners.push(Blockbench.on('load_undo_save', onLoadUndoSave));
    log.info('registerUndoBridge: 已接入 Blockbench 原生撤销（aspect=' + ASPECT_FLAG + '）');
}

/**
 * 注销撤销桥（供 plugin.js onunload 调用）
 */
function unregisterUndoBridge() {
    for (var i = 0; i < _listeners.length; i++) {
        try {
            if (typeof _listeners[i] === 'function') _listeners[i]();
        } catch (e) {
            log.warn('unregisterUndoBridge: 清理监听失败', e && e.message);
        }
    }
    _listeners.length = 0;
    _depth = 0;
    log.info('unregisterUndoBridge: 已移除撤销桥监听');
}

// =============================================================================
// 统一编辑入口
// =============================================================================

/**
 * 本次变更是否需要放弃记录（Undo 不可用 / 有未完成原生编辑 / 快照超限）
 *
 * @param {{strict: boolean}} opts
 * @param {string} label
 * @param {Function} mutate
 * @param {string} reason
 * @returns {*}
 */
function _runUnrecorded(opts, label, mutate, reason) {
    if (opts && opts.strict) {
        var err = new Error('“' + label + '”无法进入撤销栈：' + reason);
        log.warn('runConfigEdit: ' + err.message);
        throw err;
    }
    log.warn('runConfigEdit: 未记录撤销（' + reason + '）：' + label);
    var now = Date.now();
    if (now - _lastBlockedNoticeAt > 5000) {
        _lastBlockedNoticeAt = now;
        try {
            require('../utils/notify.js').showToast('该操作已执行，但未能进入撤销栈：' + reason, 'warning');
        } catch (e) {
            log.debug('runConfigEdit: 提示不可用', e && e.message);
        }
    }
    return mutate();
}

/**
 * 合并"同一目标、同一标签、紧邻"的连续编辑。
 *
 * 输入框的 @input 每次键入都会提交一次，若不合并，撤销栈会被单字符记录塞满。
 * 合并条件：上一条记录是同标签的编辑、时间差在窗口内、且上一条的 post 快照
 * 与本次的 before 快照完全一致（说明中间没有其它变更）。合并后只保留最老的
 * before 与最新的 post。
 *
 * @param {Object} undo - UndoSystem 实例
 * @param {string} label - 本次编辑标签
 */
function _coalesceWithPrevious(undo, label, mergeKey) {
    try {
        var history = undo.history;
        if (!Array.isArray(history) || history.length < 2) return;

        var current = history[history.length - 1];
        var previous = history[history.length - 2];
        if (!current || !previous) return;
        if (previous.type !== 'edit' || current.type !== 'edit') return;
        if (previous.action !== label) return;
        if (previous._mmMergeKey !== mergeKey) return;
        if (!(Date.now() - (previous.time || 0) < COALESCE_WINDOW_MS)) return;

        var prevPost = previous.post && previous.post[SNAPSHOT_KEY];
        var curBefore = current.before && current.before[SNAPSHOT_KEY];
        if (!prevPost || !curBefore) return;
        if (estimateSize(prevPost.config) !== estimateSize(curBefore.config)) return;
        if (JSON.stringify(prevPost.config) !== JSON.stringify(curBefore.config)) return;

        previous.post = current.post;
        previous.time = current.time;
        history.pop();
        undo.index = history.length;
        log.debug('_coalesceWithPrevious: 已合并连续编辑 "' + label + '"');
    } catch (e) {
        log.warn('_coalesceWithPrevious: 合并失败（忽略）', e && e.message);
    }
}

/**
 * 丢弃"空记录"：before 与 post 快照完全一致（校验失败提前返回、只改 _uiState 等）。
 *
 * finishEdit 已经压入历史并把 Project.saved 置脏，这里把记录弹掉并还原保存标记，
 * 避免撤销栈里出现"按了 Ctrl+Z 却什么都没变"的空记录。
 *
 * @param {Object} undo
 * @param {boolean} wasSaved - 编辑前的 Project.saved
 * @returns {boolean} 是否丢弃了一条空记录
 */
function _discardEmptyEntry(undo, wasSaved) {
    try {
        var history = undo.history;
        if (!Array.isArray(history) || history.length === 0) return false;
        var entry = history[history.length - 1];
        if (!entry || entry.type !== 'edit') return false;
        var beforeSnap = entry.before && entry.before[SNAPSHOT_KEY];
        var postSnap = entry.post && entry.post[SNAPSHOT_KEY];
        if (!beforeSnap || !postSnap) return false;
        if (JSON.stringify(beforeSnap.config) !== JSON.stringify(postSnap.config)) return false;

        history.pop();
        undo.index = history.length;
        if (typeof Project !== 'undefined' && Project) Project.saved = wasSaved;
        log.debug('_discardEmptyEntry: 已丢弃空记录 "' + (entry.action || '') + '"');
        return true;
    } catch (e) {
        log.warn('_discardEmptyEntry: 判断失败（忽略）', e && e.message);
        return false;
    }
}

/**
 * 执行一次可撤销的配置变更。
 *
 * 约束：
 * - 同步执行；`mutate` 抛错时用 `Undo.cancelEdit(true)` 回滚到编辑前状态再抛出。
 * - 允许嵌套：内层调用并入外层那条记录（一次撤销改多处）。
 * - `options.strict` 为 true 时，无法进入撤销栈（Undo 被占用 / 快照超限）会抛错；
 *   默认（人类 UI 路径）降级为"执行但不记录 + 提示"，避免用户操作直接丢失。
 *
 * @param {string} label - 撤销记录标签（显示在 Blockbench 撤销历史里）
 * @param {Function} mutate - 就地修改配置的回调
 * @param {{strict: boolean}} [options]
 * @returns {*} mutate 的返回值
 */
function runConfigEdit(label, mutate, options) {
    if (typeof mutate !== 'function') {
        throw new TypeError('runConfigEdit: mutate 必须是函数');
    }
    var opts = options || {};
    var text = (typeof label === 'string' && label) ? label : 'MachineMax 编辑';

    // 嵌套：已经在一次编辑里，直接执行，由最外层统一提交
    if (_depth > 0) {
        _depth++;
        try {
            return mutate();
        } finally {
            _depth--;
        }
    }

    var undo = getUndo();

    // 撤销恢复期间 / Undo 不可用 / 无工程：直接执行，不产生记录
    if (_restoring || !undo || typeof undo.initEdit !== 'function' || !getProjectConfig()) {
        return mutate();
    }

    // 原生编辑进行中（拖拽元素、绘制、输入提交）：顶掉它会破坏对方的快照
    if (undo.current_save) {
        return _runUnrecorded(opts, text, mutate, '编辑器有未完成的编辑（拖拽 / 绘制 / 输入提交中），请稍后重试');
    }

    var before = createSnapshot();
    if (before && estimateSize(before.config) > MAX_SNAPSHOT_BYTES) {
        return _runUnrecorded(opts, text, mutate, '配置快照超过 2 MB');
    }

    var aspects = {};
    aspects[ASPECT_FLAG] = true;
    var wasSaved = (typeof Project !== 'undefined' && Project) ? Project.saved : true;

    try {
        undo.initEdit(aspects);
    } catch (e) {
        log.error('runConfigEdit: initEdit 失败，退化为不记录执行', e);
        return mutate();
    }

    _depth = 1;
    var result;
    try {
        result = mutate();
    } catch (e) {
        _depth = 0;
        try {
            // cancelEdit(true)：用 current_save 回滚到编辑前状态（默认 false 只丢弃不回滚）
            undo.cancelEdit(true);
        } catch (rollbackError) {
            log.error('runConfigEdit: 变更失败且回滚失败', rollbackError);
        }
        throw e;
    }
    _depth = 0;

    var discarded = false;
    try {
        undo.finishEdit(text, aspects);
        discarded = _discardEmptyEntry(undo, wasSaved);
        if (!discarded && opts.coalesce === true && opts.mergeKey) {
            var entry = undo.history && undo.history[undo.history.length - 1];
            if (entry) entry._mmMergeKey = opts.mergeKey;
            _coalesceWithPrevious(undo, text, opts.mergeKey);
        }
    } catch (e) {
        log.error('runConfigEdit: finishEdit 失败', e);
    }

    if (!discarded && typeof Blockbench !== 'undefined' && typeof Blockbench.dispatchEvent === 'function') {
        try {
            Blockbench.dispatchEvent('update_selection');
        } catch (e) {
            log.debug('runConfigEdit: 派发 update_selection 失败', e && e.message);
        }
    }

    return result;
}

/**
 * 把既有函数包装成可撤销编辑（保留 this、参数、返回值与同步语义）
 *
 * @param {string|Function} label - 固定标签，或 (…args) => string
 * @param {Function} fn
 * @returns {Function}
 */
function withUndoEdit(label, fn) {
    if (typeof fn !== 'function') return fn;
    return function () {
        var self = this;
        var args = arguments;
        var text = typeof label === 'function' ? label.apply(self, args) : label;
        return runConfigEdit(text, function () {
            return fn.apply(self, args);
        });
    };
}

/**
 * 批量包装组件 methods（必须在 Vue.component 注册之前调用，Vue.extend 会复制方法表）
 *
 * @param {Object} methods - 组件 options.methods
 * @param {Object<string, string|Function>} labels - 方法名 → 标签
 * @returns {Object} 传入的 methods
 */
function wrapMethodMap(methods, labels) {
    if (!methods || !labels) return methods;
    for (var name in labels) {
        if (!hasOwn(labels, name)) continue;
        var original = methods[name];
        if (typeof original !== 'function') {
            log.warn('wrapMethodMap: 方法不存在或不是函数，跳过: ' + name);
            continue;
        }
        methods[name] = withUndoEdit(labels[name], original);
    }
    return methods;
}

/** 是否有未完成的编辑（供调用方做前置提示） */
function isEditInProgress() {
    var undo = getUndo();
    return !!(undo && undo.current_save);
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PROPERTY_NAME,
        ASPECT_FLAG,
        SNAPSHOT_KEY,
        RESTORED_EVENT,
        registerUndoBridge,
        unregisterUndoBridge,
        runConfigEdit,
        withUndoEdit,
        wrapMethodMap,
        refreshAfterRestore,
        isEditInProgress,
        getUndo,
        // 供测试使用
        _internals: {
            createSnapshot,
            deepClone,
            reconcileUiState,
            estimateSize,
            onCreateUndoSave,
            onLoadUndoSave,
        },
    };
}
