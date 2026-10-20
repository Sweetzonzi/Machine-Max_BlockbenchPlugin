/**
 * drag_import.js — 拖拽导入入口
 *
 * 在 plugin.js onload 时注册全局拖拽事件监听，拦截用户拖入的 .json 文件，
 * 尝试解析为 MachineMax 零件定义并导入到当前项目的 config.parts 中。
 *
 * 仅在「零件定义」模式（machine_max_part）下响应拖拽。
 * 支持单文件和多文件批量拖入。
 *
 * 导入管线: 文件读取 → JSON 解析 → PartCodec.decode → 冲突检测 → 骨骼反查 → 写入配置
 */

'use strict';

var fs = require('fs');
var path = require('path');

const { createLogger } = require('../utils/logger.js');
const { showToast } = require('../utils/notify.js');
const { getConfig, saveConfig } = require('../utils/persistence.js');
const { PartCodec } = require('../codec/codecs/part_codec.js');
const { resolveBoneReferences } = require('./bone_resolver.js');
const { showConflictDialog } = require('./conflict_dialog.js');
const keys = require('../doc/keys.js');
const undo = require('../core/undo.js');

/** 模块日志 */
var log = createLogger('DragImport');

/** 模式 ID，用于判断是否在零件定义模式 */
var MODE_ID = 'machine_max_part';

/** 拖拽事件监听器引用（供 unregister 清理） */
var _dragoverHandler = null;
var _dropHandler = null;

// =============================================================================
// 内部工具函数
// =============================================================================

/**
 * 剥离 JSON 中的 // 单行注释并解析
 * @param {string} content - 原始文件内容
 * @returns {Object} 解析后的 JSON 对象
 * @throws {Error} JSON 格式错误时抛出
 */
function parseJSONWithComments(content) {
    // 去除 UTF-8 BOM
    if (content && content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }

    var lines = content.split('\n');
    var result = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var inString = false;
        var commentStart = -1;
        for (var j = 0; j < line.length; j++) {
            var ch = line[j];
            if (ch === '"' && (j === 0 || line[j - 1] !== '\\')) {
                inString = !inString;
            }
            if (!inString && ch === '/' && j + 1 < line.length && line[j + 1] === '/') {
                commentStart = j;
                break;
            }
        }
        if (commentStart >= 0) {
            line = line.substring(0, commentStart);
        }
        result.push(line);
    }
    return JSON.parse(result.join('\n'));
}

/**
 * 根据文件名生成唯一的零件 ID（冲突时追加数字后缀）
 * @param {string} baseId - 基础 ID
 * @param {Object} existingParts - 当前已存在的 parts 字典
 * @returns {string} 不冲突的唯一 ID
 */
function generateUniqueId(baseId, existingParts) {
    if (!existingParts || !existingParts[baseId]) {
        return baseId;
    }
    var counter = 1;
    var candidate;
    do {
        candidate = baseId + '_' + counter;
        counter++;
    } while (existingParts[candidate]);
    return candidate;
}

/**
 * 将单个 .json 文件内容导入为零件定义
 *
 * @param {string} filePath - 文件完整路径
 * @param {string} fileName - 文件名（含 .json 后缀）
 * @param {string} rawContent - 文件原始内容
 * @param {string} [batchAction] - 批量导入时的预设操作
 *   ('overwrite_all' | 'skip_all')，单文件导入时为 null
 * @returns {{ imported: boolean, partId: string, action: string, unresolvedCount: number }}
 */
function importSingleFile(filePath, fileName, rawContent, batchAction) {
    // 1. 解析 JSON
    var json;
    try {
        json = parseJSONWithComments(rawContent);
    } catch (e) {
        log.warn('importSingleFile: JSON 解析失败', { fileName: fileName, error: e.message });
        showToast('文件 ' + fileName + ' 不是有效的 JSON', 'error');
        return { imported: false, partId: null, action: 'error', unresolvedCount: 0 };
    }

    // 2. PartCodec.decode 解码（填充默认值、处理 Either 简写）
    var partConfig;
    try {
        partConfig = PartCodec.decode(json);
    } catch (e) {
        log.warn('importSingleFile: PartCodec.decode 失败', { fileName: fileName, error: e.message });
        showToast('文件 ' + fileName + ' 无法识别为零件定义', 'error');
        return { imported: false, partId: null, action: 'error', unresolvedCount: 0 };
    }

    // 3. 提取零件 ID（文件名去 .json 后缀）
    var partId = fileName.replace(/\.json$/i, '');

    // 3.5 路径安全（docs/13 §5.1.3 / §11 #20）：非法 partId 不写任何文件
    if (!keys.isSafePartId(partId)) {
        log.warn('importSingleFile: partId 不合法，拒绝导入', { partId: partId });
        showToast('零件 ID "' + partId + '" 不合法：只允许小写字母/数字/._-，且不能是 . / .. / '
            + 'Windows 设备名', 'error');
        return { imported: false, partId: partId, action: 'invalid_format', unresolvedCount: 0 };
    }

    log.info('importSingleFile: 解析成功', {
        fileName: fileName,
        partId: partId,
        variantCount: partConfig.variants ? Object.keys(partConfig.variants).length : 0,
    });

    // 4. 获取当前配置，检查冲突
    var config = getConfig();
    if (!config) {
        showToast('请先打开项目', 'warning');
        return { imported: false, partId: partId, action: 'no_project', unresolvedCount: 0 };
    }

    if (!config.parts) {
        config.parts = {};
    }

    var existingParts = config.parts;
    var isConflict = !!existingParts[partId];

    if (isConflict && !batchAction) {
        // 有冲突且非批量模式 → 异步弹出对话框
        log.info('importSingleFile: 零件 ID 冲突，等待用户选择', { partId: partId });
        showConflictDialog(
            { typeLabel: '零件', defId: partId, isBatch: false },
            function (action) {
                _applyImport(partId, partConfig, config, action, fileName);
            }
        );
        // 异步处理，返回 pending 状态
        return { imported: true, partId: partId, action: 'pending', unresolvedCount: 0 };
    }

    // 无冲突或批量模式已预设操作
    var action = 'overwrite';
    if (isConflict && batchAction) {
        action = batchAction;
        if (action === 'skip_all') {
            log.info('importSingleFile: 批量跳过', { partId: partId });
            return { imported: false, partId: partId, action: 'skip', unresolvedCount: 0 };
        }
    }
    if (isConflict && action === 'overwrite_all') {
        action = 'overwrite';
    }

    return _applyImport(partId, partConfig, config, action, fileName);
}

/**
 * 实际执行导入写入操作
 *
 * @param {string} partId - 零件 ID
 * @param {Object} partConfig - 解码后的零件配置
 * @param {Object} config - 当前项目配置（会被修改）
 * @param {string} action - 操作类型: 'overwrite' | 'skip' | 'rename'
 * @param {string} fileName - 原始文件名（用于日志）
 * @returns {{ imported: boolean, partId: string, action: string, unresolvedCount: number }}
 */
function _applyImport(partId, partConfig, config, action, fileName) {
    if (action === 'skip') {
        log.info('_applyImport: 跳过', { partId: partId });
        return { imported: false, partId: partId, action: 'skip', unresolvedCount: 0 };
    }

    if (action === 'rename') {
        var newId = generateUniqueId(partId, config.parts);
        log.info('_applyImport: 重命名', { from: partId, to: newId });
        partId = newId;
    }

    // 5. 先写入配置（bone_resolver 中的 setMarker 需要通过 config.parts[partId] 查找零件）
    // 6. 骨骼名反查 → 建立 element_markers + 未解析列表（传入完整 config 而非单独的 partConfig）
    // 两步合并为一条撤销记录：一次 Ctrl+Z 回退整次导入（含批量标记）
    undo.runConfigEdit('导入零件 ' + partId, function () {
        config.parts[partId] = partConfig;
        resolveBoneReferences(config, partId);
    });

    // 7. 持久化
    try {
        saveConfig();
    } catch (e) {
        log.error('_applyImport: saveConfig 失败', e);
    }

    var unresolvedCount = partConfig._unresolved_bones ? partConfig._unresolved_bones.length : 0;

    // 8. 刷新大纲树图标（使新建的标记显示在 Outliner 中）
    try {
        var icons = require('../mode/icons.js');
        icons.refreshOutlinerIcons();
    } catch (e) {
        log.debug('_applyImport: refreshOutlinerIcons 不可用（可能不在零件定义模式）', e.message);
    }

    // 9. 通知用户
    if (unresolvedCount > 0) {
        showToast(
            '已导入零件 "' + partId + '"（' + unresolvedCount + ' 个骨骼未在大纲树中找到）',
            'warning',
            5000
        );
    } else {
        showToast('已导入零件 "' + partId + '"', 'positive');
    }

    log.info('_applyImport: 导入完成', {
        partId: partId,
        unresolvedBones: unresolvedCount,
    });

    return { imported: true, partId: partId, action: 'overwrite', unresolvedCount: unresolvedCount };
}

// =============================================================================
// 批量导入
// =============================================================================

/**
 * 批量导入多个 .json 文件
 *
 * @param {Array<{path: string, name: string, content: string}>} files - 文件信息数组
 */
function importMultipleFiles(files) {
    var config = getConfig();
    if (!config) {
        showToast('请先打开项目', 'warning');
        return;
    }

    var jsonFiles = [];
    for (var i = 0; i < files.length; i++) {
        if (files[i].name.toLowerCase().endsWith('.json')) {
            jsonFiles.push(files[i]);
        }
    }

    if (jsonFiles.length === 0) return;

    log.info('importMultipleFiles: 批量导入 ' + jsonFiles.length + ' 个文件');

    // 先检查哪些有冲突
    var conflictIds = [];
    if (!config.parts) config.parts = {};
    for (var j = 0; j < jsonFiles.length; j++) {
        var pid = jsonFiles[j].name.replace(/\.json$/i, '');
        if (config.parts[pid]) {
            conflictIds.push(pid);
        }
    }

    // 无冲突 → 全部直接导入
    if (conflictIds.length === 0) {
        var imported = 0;
        var unresolvedTotal = 0;
        for (var k = 0; k < jsonFiles.length; k++) {
            var raw;
            try {
                raw = fs.readFileSync(jsonFiles[k].path, 'utf-8');
            } catch (e) {
                log.warn('importMultipleFiles: 读取文件失败', { path: jsonFiles[k].path, error: e.message });
                continue;
            }
            var result = importSingleFile(jsonFiles[k].path, jsonFiles[k].name, raw, null);
            if (result.imported) imported++;
            unresolvedTotal += result.unresolvedCount;
        }
        showToast('已导入 ' + imported + ' 个零件', 'positive');
        return;
    }

    // 有冲突 → 弹出一个对话框统一处理
    var conflictList = conflictIds.join(', ');
    showConflictDialog(
        {
            typeLabel: '零件',
            defId: conflictList + '（共 ' + conflictIds.length + ' 个）',
            isBatch: true,
        },
        function (action) {
            var importedCount = 0;
            var unresolvedTotal = 0;
            for (var m = 0; m < jsonFiles.length; m++) {
                var rawContent;
                try {
                    rawContent = fs.readFileSync(jsonFiles[m].path, 'utf-8');
                } catch (e) {
                    log.warn('importMultipleFiles: 读取文件失败', { path: jsonFiles[m].path, error: e.message });
                    continue;
                }
                var res = importSingleFile(
                    jsonFiles[m].path,
                    jsonFiles[m].name,
                    rawContent,
                    action
                );
                if (res.imported) importedCount++;
                unresolvedTotal += res.unresolvedCount;
            }
            showToast('已导入 ' + importedCount + ' / ' + jsonFiles.length + ' 个零件', 'positive');
        }
    );
}

// =============================================================================
// 拖拽事件注册 / 注销
// =============================================================================

/** Blockbench addDragHandler 注册的 ID（供 unregister 清理） */
var BB_DRAG_HANDLER_ID = 'machine_max_part_import';
/** Blockbench addDragHandler 返回的 handler 引用（null = 未注册） */
var _bbDragHandler = null;

/**
 * 注册全局拖拽事件监听
 * 在 plugin.js onload 中调用
 *
 * 优先使用 Blockbench.addDragHandler API，
 * 不可用时回退到原生 DOM 事件。
 */
function registerDragImport() {
    // ★ 裸 console.log：不依赖任何模块，100% 可见
    console.log('[MM][DragImport] registerDragImport() 被调用');

    if (_bbDragHandler || _dragoverHandler) {
        log.info('registerDragImport: 拖拽事件已注册，跳过');
        return;
    }

    // 方案A：Blockbench.addDragHandler（签名: id, options, callback）
    //   - condition 自动处理模式过滤，无需手动检查 Modes.id
    //   - callback 接收 FileResult[]，已含 path/name/content
    if (typeof Blockbench !== 'undefined' && typeof Blockbench.addDragHandler === 'function') {
        log.info('registerDragImport: 使用 Blockbench.addDragHandler API');

        _bbDragHandler = Blockbench.addDragHandler(
            BB_DRAG_HANDLER_ID,
            {
                extensions: ['json'],
                condition: { modes: [MODE_ID] },
                readtype: 'text',
            },
            function (files, event) {
                console.log('[MM][DragImport][BBDrag] 回调触发！！！',
                    { fileCount: files ? files.length : 0 });

                if (!files || files.length === 0) return;

                var jsonFiles = [];
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    // FileResult 已含 name, path, content（Blockbench 预读取）
                    log.debug('registerDragImport: [BB-API] 处理文件',
                        { name: file.name, hasPath: !!file.path, hasContent: typeof file.content === 'string' });

                    if (!file.name || !file.name.toLowerCase().endsWith('.json')) continue;

                    var rawContent = typeof file.content === 'string' ? file.content : '';
                    if (!rawContent && file.path) {
                        try {
                            rawContent = fs.readFileSync(file.path, 'utf-8');
                        } catch (e) {
                            log.warn('registerDragImport: 读取文件失败', { path: file.path, error: e.message });
                            continue;
                        }
                    }
                    if (!rawContent) {
                        log.warn('registerDragImport: 无法获取文件内容', { name: file.name });
                        continue;
                    }

                    jsonFiles.push({
                        path: file.path || '',
                        name: file.name,
                        content: rawContent,
                    });
                }

                if (jsonFiles.length === 0) return;

                log.info('registerDragImport: 检测到 ' + jsonFiles.length + ' 个 JSON 文件拖入');

                if (jsonFiles.length === 1) {
                    importSingleFile(jsonFiles[0].path, jsonFiles[0].name, jsonFiles[0].content, null);
                } else {
                    // 批量导入：外层开一次编辑，内层 _applyImport 的编辑作为嵌套并入，
                    // 因此一次 Ctrl+Z 回退整批导入
                    undo.runConfigEdit('批量导入零件', function () {
                        importMultipleFiles(jsonFiles);
                    });
                }
            }
        );

        // 验证注册是否成功：列出 drag_handlers 中的条目
        var allIds = [];
        try {
            if (typeof Filesystem !== 'undefined' && Filesystem.drag_handlers) {
                allIds = Object.keys(Filesystem.drag_handlers);
            }
        } catch (e) {}
        log.info('registerDragImport: 已通过 Blockbench.addDragHandler 注册',
            { ourId: BB_DRAG_HANDLER_ID, allDragHandlerIds: allIds, modeId: MODE_ID });
        return;
    }

    // 方案B：原生 DOM 事件（回退方案）
    log.info('registerDragImport: Blockbench.addDragHandler 不可用，回退到 DOM 事件');

    _dragoverHandler = function (e) {
        console.log('[MM][DragImport][DOM] dragover 触发',
            { modeId: Modes ? Modes.id : 'undefined' });
        if (typeof Modes === 'undefined' || !Modes || Modes.id !== MODE_ID) return;
        e.preventDefault();
        e.stopPropagation();
    };

    _dropHandler = function (e) {
        console.log('[MM][DragImport][DOM] drop 触发！！！',
            { modeId: Modes ? Modes.id : 'undefined', fileCount: e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files.length : 0 });

        if (typeof Modes === 'undefined' || !Modes || Modes.id !== MODE_ID) {
            log.debug('registerDragImport: [DOM] 模式不匹配，忽略', { current: Modes ? Modes.id : 'undefined', expected: MODE_ID });
            return;
        }
        e.preventDefault();
        e.stopPropagation();

        if (!e.dataTransfer || !e.dataTransfer.files || e.dataTransfer.files.length === 0) {
            return;
        }

        var droppedFiles = e.dataTransfer.files;
        var jsonFiles = [];

        for (var j = 0; j < droppedFiles.length; j++) {
            var domFile = droppedFiles[j];
            if (!domFile.name || !domFile.name.toLowerCase().endsWith('.json')) continue;

            var domFilePath = domFile.path;
            if (!domFilePath) {
                log.warn('registerDragImport: 文件路径不可用（可能是 Electron 安全限制）', { name: domFile.name });
                continue;
            }

            var domRawContent;
            try {
                domRawContent = fs.readFileSync(domFilePath, 'utf-8');
            } catch (readErr) {
                log.warn('registerDragImport: 读取文件失败', { path: domFilePath, error: readErr.message });
                continue;
            }

            jsonFiles.push({ path: domFilePath, name: domFile.name, content: domRawContent });
        }

        if (jsonFiles.length === 0) return;

        log.info('registerDragImport: 检测到 ' + jsonFiles.length + ' 个 JSON 文件拖入');

        if (jsonFiles.length === 1) {
            importSingleFile(jsonFiles[0].path, jsonFiles[0].name, jsonFiles[0].content, null);
        } else {
            // 同上：批量导入合并为一条撤销记录
            undo.runConfigEdit('批量导入零件', function () {
                importMultipleFiles(jsonFiles);
            });
        }
    };

    document.addEventListener('dragover', _dragoverHandler);
    document.addEventListener('drop', _dropHandler);
    log.info('registerDragImport: 已通过 DOM 事件注册（仅零件定义模式下响应）');
}

/**
 * 注销全局拖拽事件监听
 * 在 plugin.js onunload 中调用
 */
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

// =============================================================================
// 公开 API（供菜单导入使用）
// =============================================================================

/**
 * 从文件路径导入单个零件 JSON（供菜单「导入零件 JSON…」使用）
 *
 * @param {string} filePath - 文件完整路径
 */
function importPartFromPath(filePath) {
    var fileName = path.basename(filePath);

    if (!fileName.toLowerCase().endsWith('.json')) {
        showToast('请选择 .json 文件', 'warning');
        return;
    }

    var rawContent;
    try {
        rawContent = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
        log.error('importPartFromPath: 读取文件失败', { path: filePath, error: e.message });
        showToast('无法读取文件: ' + fileName, 'error');
        return;
    }

    importSingleFile(filePath, fileName, rawContent, null);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerDragImport,
        unregisterDragImport,
        importPartFromPath,
        importSingleFile,
    };
}
