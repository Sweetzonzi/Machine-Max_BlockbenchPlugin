/**
 * conflict_dialog.js — 导入冲突处理对话框
 *
 * 当拖入/导入的 JSON 定义 ID 与当前项目中已有数据冲突时，
 * 弹出此对话框让用户选择覆盖、跳过或重命名。
 *
 * 使用 Blockbench 原生 Dialog API。
 */

'use strict';

const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('ConflictDialog');

/**
 * 显示导入冲突对话框
 *
 * @param {Object} options - 对话框选项
 * @param {string} options.typeLabel - 定义类型的中文标签，如 '零件'
 * @param {string} options.defId - 冲突的定义 ID
 * @param {boolean} options.isBatch - 是否为批量导入（多文件拖入时显示"全部"选项）
 * @param {function} onResolve - 回调函数，参数为 action 字符串:
 *   'overwrite' - 覆盖已有数据
 *   'skip'      - 跳过该文件
 *   'rename'    - 自动追加数字后缀重命名
 *   'overwrite_all' - 本次批量导入后续冲突均覆盖
 *   'skip_all'  - 本次批量导入后续冲突均跳过
 */
function showConflictDialog(options, onResolve) {
    var typeLabel = options.typeLabel || '定义';
    var defId = options.defId || '未知';
    var isBatch = options.isBatch || false;

    var selectOptions = {
        overwrite: '覆盖已有' + typeLabel + '（替换当前数据）',
        skip: '跳过（保留已有' + typeLabel + '）',
        rename: '重命名导入（自动追加 _1 后缀）',
    };

    // 批量导入时增加"全部"选项
    if (isBatch) {
        selectOptions.overwrite_all = '全部覆盖（后续冲突不再询问）';
        selectOptions.skip_all = '全部跳过（后续冲突不再询问）';
    }

    log.info('showConflictDialog: 显示冲突对话框', {
        typeLabel: typeLabel,
        defId: defId,
        isBatch: isBatch,
    });

    new Dialog({
        id: 'mm_import_conflict',
        title: '导入冲突',
        width: 480,
        lines: [
            typeLabel + ' <b>' + defId + '</b> 已存在，请选择处理方式：',
        ],
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
            log.info('showConflictDialog: 用户取消（默认跳过）');
            onResolve('skip');
        },
    }).show();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { showConflictDialog };
}
