/**
 * part_dialogs.js — 零件 / 项目管理的共享对话框
 *
 * 工具栏、面板、右键菜单三处都需要"新建零件 / 项目管理"对话框。
 * 这里收敛成一份 UI 定义；业务动作与撤销边界在
 * `core/operations.js`（createPart / setContentPackPath）里，本文件不碰配置。
 */

var ops = require('../../ops/index.js');
var { showToast } = require('../../utils/notify.js');
var { scheduleSave } = require('../../utils/persistence.js');
var { createLogger } = require('../../utils/logger.js');
var { refreshOutlinerIcons } = require('../../mode/icons.js');
var { applyPackPath, buildUnresolvedMessage } = require('./pack_common.js');

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
 * 保存时会像"打开已有内容包"一样按 meta.json 的 dependencies 在内容包同级
 * 目录自动解析依赖（`pack_common.applyPackPath`，非 strict：路径无效也照写）。
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
                    description: 'MachineMax 内容包的根目录路径；保存时按 meta.json 的依赖在同级目录自动解析',
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
                var newPath = (formData.contentPackPath || '').trim();

                // 校验 + 解析依赖 + 单条撤销记录写入
                var applied = applyPackPath(config, newPath, {
                    strict: false,
                    label: '修改内容包路径',
                });
                if (!applied.ok) {
                    showToast(applied.error || '无法写入内容包路径', 'error');
                    return false;
                }

                log.info('项目管理: 内容包路径已更新', {
                    contentPackPath: newPath,
                    valid: applied.valid,
                    dependencyPaths: applied.dependencyPaths,
                });
                scheduleSave();

                if (!applied.valid) {
                    // 路径无效 / 已清空：只提示，保持"先填路径、再补 meta.json"的旧行为
                    showToast(newPath
                        ? '路径已写入，但该目录还没有有效的 meta.json，内容包当前无效'
                        : '内容包路径已清空', 'warning', 6000);
                    if (typeof onSaved === 'function') onSaved(config);
                    this.hide();
                    return;
                }

                var msg = '内容包已切换';
                if (applied.resolution.direct.length > 0 || applied.resolution.indirect.length > 0) {
                    msg += '，已解析 ' + applied.resolution.direct.length + ' 个直接依赖';
                    if (applied.resolution.indirect.length > 0) {
                        msg += '、' + applied.resolution.indirect.length + ' 个间接依赖';
                    }
                } else if (applied.dependencyPaths && applied.dependencyPaths.length === 0) {
                    msg += '，该包未声明依赖，已清空本地依赖路径';
                }
                showToast(msg, 'positive', 5000);
                if (applied.resolution.unresolved.length > 0) {
                    showToast(
                        buildUnresolvedMessage(applied.resolution.unresolved, applied.parentDir),
                        'warning', 12000
                    );
                }

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
