/**
 * conflict_dialog.js — 导入冲突处理对话框
 *
 * 一次导入只询问一次：用户的选择对**整批**生效（docs/15 §4.5）。
 * 取消（右上角 X / Cancel）表示放弃整批，不再退化成"跳过冲突文件"。
 *
 * 使用 Blockbench 原生 Dialog API。
 */

'use strict';

const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('ConflictDialog');

/** 摘要里的 id 预览：≤2 个全部列出，更多则"a、b 等 N 个"。 */
function previewIds(ids) {
    if (ids.length <= 2) return ids.join('、');
    return ids.slice(0, 2).join('、') + ' 等 ' + ids.length + ' 个';
}

/**
 * 显示导入冲突对话框。
 *
 * @param {Object} options
 * @param {string} [options.typeLabel] - 定义类型的中文标签，默认 '定义'
 * @param {string[]} [options.conflictIds] - 与现有数据冲突的 id 列表
 * @param {boolean} [options.isBatch] - 是否用批量文案（多文件 / 多冲突）
 * @param {function} onResolve - 回调，参数为整批动作：
 *   'overwrite' - 覆盖已有数据（批内副本仍改名）
 *   'skip'      - 只跳过冲突文件，其余照常导入
 *   'rename'    - 冲突文件全部自动改名
 *   'cancel'    - 放弃整批，不写任何东西
 */
function showConflictDialog(options, onResolve) {
    options = options || {};
    var typeLabel = options.typeLabel || '定义';
    var ids = Array.isArray(options.conflictIds) ? options.conflictIds.slice() : [];
    if (!ids.length && options.defId) ids = [String(options.defId)];
    if (!ids.length) ids = ['未知'];
    var isBatch = options.isBatch === true || ids.length > 1;

    var selectOptions;
    if (isBatch) {
        selectOptions = {
            overwrite: '全部覆盖已有' + typeLabel + '（替换当前数据）',
            skip: '跳过冲突项（其余文件照常导入）',
            rename: '全部自动重命名（依次追加 _1、_2…，跳过本批其它文件及内容包里已占用的名称）',
        };
    } else {
        selectOptions = {
            overwrite: '覆盖已有' + typeLabel + '（替换当前数据）',
            skip: '跳过（保留已有' + typeLabel + '）',
            rename: '重命名导入（自动追加 _1 后缀）',
        };
    }

    log.info('showConflictDialog: 显示冲突对话框', {
        typeLabel: typeLabel,
        conflictIds: ids,
        isBatch: isBatch,
    });

    var question = isBatch
        ? typeLabel + ' <b>' + previewIds(ids) + '</b> 已存在，请选择对整批的处理方式：'
        : typeLabel + ' <b>' + ids[0] + '</b> 已存在，请选择处理方式：';

    new Dialog({
        id: 'mm_import_conflict',
        title: isBatch ? '批量导入冲突（' + ids.length + ' 个' + typeLabel + '已存在）' : '导入冲突',
        width: 480,
        lines: [question],
        form: {
            action: {
                type: 'select',
                label: '操作',
                options: selectOptions,
                value: 'overwrite',
            },
        },
        onConfirm: function (formData) {
            var action = formData.action;
            log.info('showConflictDialog: 用户选择', { action: action });
            onResolve(action);
        },
        onCancel: function () {
            log.info('showConflictDialog: 用户取消（放弃整批）');
            onResolve('cancel');
        },
    }).show();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { showConflictDialog };
}
