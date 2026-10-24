/**
 * drag_import.js — 导入编排（菜单「导入零件 JSON…」与拖拽共用）
 *
 * 管线：文件选择/拖拽 → normalizeInputs（唯一 I/O 点）→ import_plan.planImports（纯策略）
 *      → 一次冲突决议 → import_plan.resolvePlan → 一次 runConfigEdit → flushSave → 一条汇总 toast
 *
 * 设计约束（docs/15 §4.3）：
 *   - 整批只产生一条撤销记录，`runConfigEdit` 内只做同步写入；
 *   - 冲突只询问一次，策略对整批生效；取消 = 整批不写；
 *   - 同一时刻只允许一条导入流程（模块级 `_importing`）；
 *   - 对话框是异步的：回调里重新取 `config` 并**重新规划**，避免用到过期快照。
 */

'use strict';

const { createLogger } = require('../utils/logger.js');
const { showToast } = require('../utils/notify.js');
const { getConfig, flushSave } = require('../utils/persistence.js');
const { resolveBoneReferences } = require('./bone_resolver.js');
const { showConflictDialog } = require('./conflict_dialog.js');
const undo = require('../core/undo.js');
const importService = require('../services/import.js');
const importPlan = require('../services/import_plan.js');
const ops = require('../ops/session.js');

/** 模块日志 */
var log = createLogger('DragImport');

/** 模式 ID，用于判断是否在零件定义模式 */
var MODE_ID = 'machine_max_part';

const JSON_EXT_RE = /\.json$/i;
const WRITABLE_ACTIONS = { create: true, overwrite: true, rename: true };

/** 拖拽事件监听器引用（供 unregister 清理） */
var _dragoverHandler = null;
var _dropHandler = null;

/** 并发 guard：true 表示有一条导入流程尚未结束（含等待冲突决议） */
var _importing = false;

// =============================================================================
// 小工具
// =============================================================================

/** 取路径最后一段；无路径返回 ''。 */
function basenameOf(filePath) {
    if (!filePath) return '';
    var s = String(filePath);
    var slash = Math.max(s.lastIndexOf('/'), s.lastIndexOf('\\'));
    return slash >= 0 ? s.slice(slash + 1) : s;
}

/** 汇总文案里的文件名列表：超过 3 个截断。 */
function listFileNames(failures) {
    var names = [];
    for (var i = 0; i < failures.length; i++) names.push(failures[i].fileName || '(未命名)');
    if (names.length <= 3) return names.join('、');
    return names.slice(0, 3).join('、') + ' 等 ' + names.length + ' 个';
}

/**
 * 一条汇总提示的文案（docs/15 §4.3 文案矩阵）。
 * @param {{written?: number, skipped?: number, failures?: Array, ignored?: number,
 *          unresolved?: number}} info
 * @returns {string}
 */
function summaryText(info) {
    info = info || {};
    var written = info.written || 0;
    var skipped = info.skipped || 0;
    var failures = info.failures || [];
    var ignored = info.ignored || 0;
    var unresolved = info.unresolved || 0;

    if (written === 0 && skipped > 0) {
        var skipNotes = [];
        if (failures.length) skipNotes.push('失败 ' + failures.length + '：' + listFileNames(failures));
        if (ignored) skipNotes.push('忽略 ' + ignored + ' 个非 JSON');
        return '已跳过 ' + skipped + ' 个零件'
            + (skipNotes.length ? '（' + skipNotes.join('；') + '）' : '');
    }

    if (written === 0) {
        if (failures.length) return '无法导入：' + failures.length + ' 个文件解析失败';
        return '未导入任何零件';
    }

    var notes = [];
    if (failures.length) notes.push('失败 ' + failures.length + '：' + listFileNames(failures));
    if (ignored) notes.push('忽略 ' + ignored + ' 个非 JSON');
    if (skipped) notes.push('跳过 ' + skipped);
    if (unresolved) notes.push(unresolved + ' 个骨骼未在大纲树中找到');

    return '已导入 ' + written + ' 个零件' + (notes.length ? '（' + notes.join('；') + '）' : '');
}

// =============================================================================
// 归一化（唯一 I/O 点）
// =============================================================================

/**
 * 把菜单 / 拖拽给的文件描述归一成纯输入，并就地收集 I/O 类失败。
 *
 * - 非 `.json` 只计数（`ignored`），不静默丢文件：汇总文案会写"忽略 N 个非 JSON"；
 * - 缺 `name` 时用 `path` 的 basename 兜底；
 * - `content` 缺失（非字符串）时按 `path` 读盘，读不到记 `read_failed`；
 * - 读到空内容记 `empty_content`。
 *
 * @param {Array<{name?: string, path?: string, content?: string}>} files
 * @returns {{inputs: Array<{name: string, path: string, content: string}>,
 *            ignored: number, failures: Array<{fileName: string, reason: string}>}}
 */
function normalizeInputs(files) {
    var list = Array.isArray(files) ? files : [];
    var inputs = [];
    var failures = [];
    var ignored = 0;

    for (var i = 0; i < list.length; i++) {
        var file = list[i] || {};
        var name = file.name ? String(file.name) : basenameOf(file.path);
        if (!name) {
            failures.push({ fileName: '', reason: 'read_failed' });
            continue;
        }
        if (!JSON_EXT_RE.test(name)) {
            ignored++;
            continue;
        }

        var path = file.path ? String(file.path) : '';
        var content = typeof file.content === 'string' ? file.content : null;
        if (content === null) {
            if (!path) {
                failures.push({ fileName: name, reason: 'read_failed' });
                continue;
            }
            try {
                content = importService.readTextFile(path);
            } catch (err) {
                log.warn('normalizeInputs: 读取文件失败', { path: path, error: err.message });
                failures.push({ fileName: name, reason: 'read_failed' });
                continue;
            }
        }
        if (content.trim() === '') {
            failures.push({ fileName: name, reason: 'empty_content' });
            continue;
        }

        inputs.push({ name: name, path: path, content: content });
    }

    return { inputs: inputs, ignored: ignored, failures: failures };
}

// =============================================================================
// 编排
// =============================================================================

/**
 * 导入一批零件 JSON（菜单与拖拽的唯一入口）。
 *
 * @param {Array<{name?: string, path?: string, content?: string}>} files
 */
function importParts(files) {
    if (_importing) {
        showToast('已有导入流程在进行中，请先完成或取消', 'warning');
        return;
    }
    _importing = true;

    try {
        var config = getConfig();
        if (!config) {
            _importing = false;
            showToast('请先打开项目', 'warning');
            return;
        }

        var norm = normalizeInputs(files);
        if (!norm.inputs.length) {
            // 空选择 / 全被扩展名过滤：静默；只有真失败才提示
            _importing = false;
            if (norm.failures.length) {
                log.warn('importParts: 没有可导入的条目', { failures: norm.failures });
                showToast(summaryText({ failures: norm.failures, ignored: norm.ignored }), 'error', 5000);
            }
            return;
        }

        var plan = importPlan.planImports(norm.inputs, config.parts || {});
        if (!plan.entries.length) {
            _importing = false;
            var allFailures = norm.failures.concat(plan.failures);
            log.warn('importParts: 所有文件都解析失败', { failures: allFailures });
            showToast(summaryText({ failures: allFailures, ignored: norm.ignored }), 'error', 5000);
            return;
        }

        if (plan.existingIds.length) {
            var conflictIds = plan.existingIds;
            log.info('importParts: 等待冲突决议', {
                conflictIds: conflictIds,
                entryCount: plan.entries.length,
            });
            showConflictDialog({
                typeLabel: '零件',
                conflictIds: conflictIds,
                isBatch: plan.entries.length > 1 || conflictIds.length > 1,
                entryCount: plan.entries.length,
            }, function (action) {
                applyPlan(norm.inputs, norm.failures, action, config, norm.ignored);
            });
            return; // guard 由 applyPlan 释放
        }

        applyPlan(norm.inputs, norm.failures, 'overwrite', config, norm.ignored);
    } catch (err) {
        _importing = false;
        throw err;
    }
}

/**
 * 按用户决议真正写配置（一次撤销记录 + 一次落盘 + 一条汇总）。
 *
 * @param {Array} inputs - 归一化后的输入
 * @param {Array} normFailures - normalizeInputs 产出的失败
 * @param {string} action - 'overwrite' | 'skip' | 'rename' | 'cancel'
 * @param {Object} entryConfig - 弹框前拿到的 config（用于引用比对）
 * @param {number} ignored - 非 JSON 文件数
 */
function applyPlan(inputs, normFailures, action, entryConfig, ignored) {
    try {
        if (action === 'cancel') {
            log.info('applyPlan: 用户取消导入');
            showToast('已取消导入');
            return;
        }

        // 对话框是异步的：项目可能已被关闭或切换
        var config = getConfig();
        if (!config) {
            showToast('项目已关闭，导入取消', 'warning');
            return;
        }
        if (config !== entryConfig) {
            showToast('项目已切换，导入取消', 'warning');
            return;
        }

        // 用最新 config.parts 重新规划：对话框期间新增的零件也要参与冲突/改名判断
        var plan = importPlan.planImports(inputs, config.parts || {});
        var failures = (normFailures || []).concat(plan.failures);
        var resolved = importPlan.resolvePlan(plan, action);

        var writable = [];
        for (var i = 0; i < resolved.entries.length; i++) {
            var entry = resolved.entries[i];
            if (WRITABLE_ACTIONS[entry.action]) writable.push(entry);
        }

        if (!writable.length) {
            log.info('applyPlan: 全部跳过', { skipped: resolved.entries.length, action: action });
            showToast(summaryText({
                skipped: resolved.entries.length,
                failures: failures,
                ignored: ignored,
            }), 'info', 4000);
            return;
        }

        if (typeof undo.isEditInProgress === 'function' && undo.isEditInProgress()) {
            showToast('编辑器有未完成的操作，请稍后重试', 'warning');
            return;
        }

        var unresolvedTotal = 0;
        try {
            undo.runConfigEdit('导入 ' + writable.length + ' 个零件', function () {
                if (!config.parts) config.parts = {};
                for (var k = 0; k < writable.length; k++) {
                    var item = writable[k];
                    // 先写入，骨骼反查要靠 config.parts[finalId] 找零件
                    config.parts[item.finalId] = item.partConfig;
                    resolveBoneReferences(config, item.finalId);
                    unresolvedTotal += (item.partConfig._unresolved_bones || []).length;
                }
            });
        } catch (err) {
            log.error('applyPlan: 批量导入失败', err);
            showToast('导入失败：' + (err && err.message ? err.message : '未知错误')
                + '（若未自动回滚，请 Ctrl+Z 或重新打开项目）', 'error', 5000);
            return; // 不 refresh / 不 setActive / 不落盘 / 不报成功
        }

        // 活动上下文：仅在当前为空或已失效时切到本批第一个零件（只改 _uiState，不落盘）
        var activeId = config._uiState && config._uiState.activePartId;
        if (!activeId || !config.parts[activeId]) {
            var setResult = ops.setActive(config, { partId: writable[0].finalId, source: 'import' });
            if (setResult && setResult.ok === false) {
                log.debug('applyPlan: 切换活动零件失败', setResult.error);
            }
        }

        flushSave(); // 清掉 mm_config_changed 排的防抖，整批只写一次盘
        try {
            require('../mode/icons.js').refreshOutlinerIcons();
        } catch (e) {
            log.debug('applyPlan: refreshOutlinerIcons 不可用', e && e.message);
        }

        if (failures.length) log.warn('applyPlan: 部分文件未导入', { failures: failures });
        showToast(summaryText({
            written: writable.length,
            skipped: resolved.entries.length - writable.length,
            failures: failures,
            ignored: ignored,
            unresolved: unresolvedTotal,
        }), (failures.length || unresolvedTotal) ? 'warning' : 'positive', 5000);
    } finally {
        _importing = false;
    }
}

// =============================================================================
// 拖拽事件注册 / 注销
// =============================================================================

/** Blockbench addDragHandler 注册的 ID（供 unregister 清理） */
var BB_DRAG_HANDLER_ID = 'machine_max_part_import';
/** Blockbench addDragHandler 返回的 handler 引用（null = 未注册） */
var _bbDragHandler = null;

/**
 * 注册全局拖拽事件监听（plugin.js onload）。
 * 优先 Blockbench.addDragHandler，不可用时回退 DOM 事件。
 */
function registerDragImport() {
    if (_bbDragHandler || _dragoverHandler) {
        log.info('registerDragImport: 拖拽事件已注册，跳过');
        return;
    }

    // 方案A：Blockbench.addDragHandler（condition 自动做模式过滤，callback 收 FileResult[]）
    if (typeof Blockbench !== 'undefined' && typeof Blockbench.addDragHandler === 'function') {
        _bbDragHandler = Blockbench.addDragHandler(
            BB_DRAG_HANDLER_ID,
            {
                extensions: ['json'],
                condition: { modes: [MODE_ID] },
                readtype: 'text',
            },
            function (files) {
                if (!files || files.length === 0) return;
                // FileResult 已含 name/path/content；content 缺失时交给 normalizeInputs 按 path 读盘
                importParts(files.map(function (file) {
                    return {
                        name: file.name || '',
                        path: file.path || '',
                        content: typeof file.content === 'string' ? file.content : undefined,
                    };
                }));
            }
        );
        log.info('registerDragImport: 已通过 Blockbench.addDragHandler 注册', { modeId: MODE_ID });
        return;
    }

    // 方案B：原生 DOM 事件（回退方案）
    log.info('registerDragImport: Blockbench.addDragHandler 不可用，回退到 DOM 事件');

    _dragoverHandler = function (e) {
        if (typeof Modes === 'undefined' || !Modes || Modes.id !== MODE_ID) return;
        e.preventDefault();
        e.stopPropagation();
    };

    _dropHandler = function (e) {
        if (typeof Modes === 'undefined' || !Modes || Modes.id !== MODE_ID) {
            log.debug('registerDragImport: [DOM] 模式不匹配，忽略', {
                current: Modes ? Modes.id : 'undefined',
                expected: MODE_ID,
            });
            return;
        }
        e.preventDefault();
        e.stopPropagation();

        if (!e.dataTransfer || !e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

        var droppedFiles = e.dataTransfer.files;
        var files = [];
        for (var i = 0; i < droppedFiles.length; i++) {
            var domFile = droppedFiles[i];
            if (!domFile.name || !JSON_EXT_RE.test(domFile.name)) continue;
            // Electron ≥32 已不提供 File.path；这里不再自己读盘，统一交给 normalizeInputs 判 read_failed
            files.push({ name: domFile.name, path: domFile.path || '', content: undefined });
        }
        if (files.length === 0) return;

        log.info('registerDragImport: 检测到 ' + files.length + ' 个 JSON 文件拖入');
        importParts(files);
    };

    document.addEventListener('dragover', _dragoverHandler);
    document.addEventListener('drop', _dropHandler);
    log.info('registerDragImport: 已通过 DOM 事件注册（仅零件定义模式下响应）');
}

/** 注销全局拖拽事件监听（plugin.js onunload）。 */
function unregisterDragImport() {
    if (_bbDragHandler) {
        if (typeof Blockbench !== 'undefined' && typeof Blockbench.removeDragHandler === 'function') {
            Blockbench.removeDragHandler(BB_DRAG_HANDLER_ID);
        }
        _bbDragHandler = null;
        log.info('unregisterDragImport: Blockbench.addDragHandler 已注销');
    }
    if (_dragoverHandler) {
        document.removeEventListener('dragover', _dragoverHandler);
        _dragoverHandler = null;
    }
    if (_dropHandler) {
        document.removeEventListener('drop', _dropHandler);
        _dropHandler = null;
    }
    log.info('unregisterDragImport: DOM 事件已注销');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerDragImport: registerDragImport,
        unregisterDragImport: unregisterDragImport,
        importParts: importParts,
    };
}
