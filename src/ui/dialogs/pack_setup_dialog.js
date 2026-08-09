/**
 * pack_setup_dialog.js — 内容包设置向导主入口
 *
 * 内容包相关对话框已按职责拆分：
 *   - pack_create_dialog.js   → showCreatePackDialog（创建新内容包）
 *   - pack_open_dialog.js     → showOpenPackDialog（打开已有内容包）
 *   - dependency_editor.js    → showDependencyPathEditor / showManageDependenciesDialog
 *
 * 本文件保留向导主入口 showPackSetupDialog，并转发各拆分模块的导出
 * 以保持对外 API 不变（menu.js / mode.js / App.vue.js / export_dialog.js 无需修改）。
 */

const { showToast } = require('../../utils/notify.js');
const { createLogger } = require('../../utils/logger.js');
const { isConfigValid } = require('./pack_common.js');
const { showCreatePackDialog } = require('./pack_create_dialog.js');
const { showOpenPackDialog } = require('./pack_open_dialog.js');
const { showDependencyPathEditor, showManageDependenciesDialog } = require('./dependency_editor.js');

/** 模块日志 */
var log = createLogger('PackSetup');

// =============================================================================
// 向导主入口
// =============================================================================

/** 向导弹窗防重入标志 */
var _packSetupShowing = false;

/**
 * 显示内容包设置向导主对话框
 *
 * 作为入口对话框，提供三种操作供用户选择：
 * 1. 创建新内容包 — 跳转到 showCreatePackDialog
 * 2. 打开已有内容包 — 跳转到 showOpenPackDialog
 * 3. 管理依赖包 — 跳转到 showManageDependenciesDialog
 *
 * 若 config.contentPackPath 已设置，默认选择"打开已有内容包"；
 * 否则默认选择"创建新内容包"。
 *
 * @param {Object} config - MM 项目配置
 * @param {Function} onSave - 保存回调，接收更新后的 config
 */
function showPackSetupDialog(config, onSave) {
    if (_packSetupShowing) {
        log.debug('showPackSetupDialog: 已有向导窗口打开中，跳过重复调用');
        return;
    }
    if (!isConfigValid(config)) {
        showToast('配置不可用，请先打开项目', 'warning');
        return;
    }

    _packSetupShowing = true;

    try {
        new Dialog({
            id: 'mm_pack_setup',
            title: 'MachineMax 内容包设置向导',
            width: 500,
            form: {
                infoText: {
                    type: 'info',
                    text: '<b>内容包设置向导</b><br><br>' +
                        '内容包是 MachineMax 定义的组织单位，包含零件、子系统、连接点等配置。' +
                        '首次使用请先创建或打开一个内容包。',
                },
                currentPack: {
                    type: 'info',
                    text: config.contentPackPath
                        ? '当前内容包目录：<br><code>' + config.contentPackPath + '</code>'
                        : '当前未设置内容包。',
                },
                action: {
                    type: 'select',
                    label: '选择操作',
                    options: {
                        create: '创建新内容包',
                        open: '打开已有内容包',
                        deps: '管理依赖包',
                    },
                    value: config.contentPackPath ? 'open' : 'create',
                },
            },
            onConfirm: function (formData) {
                _packSetupShowing = false;
                this.hide();
                try {
                    if (formData.action === 'create') {
                        showCreatePackDialog(config, onSave);
                    } else if (formData.action === 'open') {
                        showOpenPackDialog(config, onSave);
                    } else if (formData.action === 'deps') {
                        showManageDependenciesDialog(config, onSave);
                    }
                } catch (e) {
                    log.error('跳转子对话框失败', e);
                    showToast('操作失败: ' + (e.message || e), 'error');
                }
            },
            onCancel: function () {
                _packSetupShowing = false;
                this.hide();
            },
        }).show();
    } catch (e) {
        _packSetupShowing = false;
        log.error('showPackSetupDialog 失败', e);
        showToast('无法打开设置向导: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// CJS 导出（转发拆分模块，保持对外 API 不变）
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showPackSetupDialog,
        showCreatePackDialog,
        showOpenPackDialog,
        showManageDependenciesDialog,
        showDependencyPathEditor,
    };
}
