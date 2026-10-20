/**
 * part_dialogs.js — 零件 / 项目管理的共享对话框
 *
 * 工具栏、面板、右键菜单三处都需要"新建零件 / 项目管理"对话框。
 * 这里收敛成一份 UI 定义；业务动作与撤销边界在
 * `core/operations.js`（createPart / setContentPackPath）里，本文件不碰配置。
 */

var ops = require('../../core/operations.js');
var { showToast } = require('../../utils/notify.js');
var { saveConfig } = require('../../utils/persistence.js');
var { createLogger } = require('../../utils/logger.js');
var { refreshOutlinerIcons } = require('../../mode/icons.js');

var log = createLogger('PartDialogs');

/**
 * 新建零件对话框
 *
 * @param {Object} config - MM 项目配置
 * @param {Function} [onCreated] - 创建成功回调 (partId, variantName)
 */
function showNewPartDialog(config, onCreated) {
    try {
        new Dialog({
            title: '新建零件',
            form: {
                partId: { type: 'text', label: '零件 ID', hint: '如 wine_fox_hull' },
                variantName: { type: 'text', label: '初始变体名', value: 'default' },
                model: { type: 'text', label: '模型引用', value: 'machine_max:' },
            },
            onConfirm: function (formData) {
                // 校验 + 写入 + 撤销记录都在操作函数内部
                var result = ops.createPart(config, formData);
                if (!result.ok) {
                    showToast(result.error, 'error');
                    return false;
                }
                log.info('新建零件成功', { partId: result.partId, variant: result.variantName });
                refreshOutlinerIcons();
                Blockbench.dispatchEvent('update_selection');
                showToast('零件 "' + result.partId + '" 已创建', 'positive');
                if (typeof onCreated === 'function') onCreated(result.partId, result.variantName);
                this.hide();
            },
        }).show();
        log.debug('showNewPartDialog: Dialog 已显示');
    } catch (e) {
        log.error('showNewPartDialog: Dialog 异常', e);
        showToast('无法打开新建零件对话框: ' + (e.message || e), 'error');
    }
}

/**
 * 项目管理对话框（当前只改内容包路径）
 *
 * @param {Object} config - MM 项目配置
 * @param {Function} [onSaved] - 保存成功回调
 */
function showProjectSettingsDialog(config, onSaved) {
    var partCount = Object.keys(config.parts || {}).length;
    try {
        new Dialog({
            title: 'MachineMax 项目管理',
            form: {
                contentPackPath: {
                    type: 'text',
                    label: '内容包路径',
                    value: config.contentPackPath || '',
                    description: 'MachineMax 内容包的根目录路径',
                },
                info: {
                    type: 'display',
                    label: '统计',
                    lines: [
                        '模型: ' + (Project && Project.name || '未命名'),
                        '内容包路径: ' + (config.contentPackPath || '未设置'),
                        '零件数: ' + partCount,
                    ],
                },
            },
            onConfirm: function (formData) {
                var result = ops.setContentPackPath(config, formData.contentPackPath);
                if (!result.ok) {
                    showToast(result.error, 'error');
                    return false;
                }
                log.info('项目管理: 内容包路径已更新', { contentPackPath: formData.contentPackPath });
                saveConfig();
                showToast('内容包路径已更新', 'positive');
                if (typeof onSaved === 'function') onSaved(config);
                this.hide();
            },
        }).show();
        log.debug('showProjectSettingsDialog: Dialog 已显示');
    } catch (e) {
        log.error('showProjectSettingsDialog: Dialog 异常', e);
        showToast('无法打开项目管理对话框: ' + (e.message || e), 'error');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showNewPartDialog,
        showProjectSettingsDialog,
    };
}
