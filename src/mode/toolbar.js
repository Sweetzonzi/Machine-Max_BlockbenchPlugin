var { getConfig, saveConfig } = require('../utils/persistence.js');
var { showToast } = require('../utils/notify.js');
var { createLogger } = require('../utils/logger.js');
var { runValidation } = require('./validation.js');

var log = createLogger('Mode');

/** 记录本插件创建的 Action 实例，用于 onunload 正确清理 */
var _mmActionIds = ['mm_validate', 'mm_export', 'mm_new_part', 'mm_project_settings'];
var _mmActionInstances = [];

/**
 * 为模式添加专属工具栏按钮
 * 使用 BarItems（Blockbench 官方的 BarItem 注册表）检查 Action 是否已存在，
 * 避免插件热重载时重复注册导致 duplicate ID 警告。
 * 创建的 Action 实例存入 _mmActionInstances，供 unregisterActions 正确清理。
 */
function registerToolbarActions() {
    if (BarItems && BarItems['mm_validate']) {
        log.debug('registerToolbarActions: Actions 已注册（BarItems），跳过');
        for (const id of _mmActionIds) {
            if (BarItems[id] && !_mmActionInstances.includes(BarItems[id])) {
                _mmActionInstances.push(BarItems[id]);
            }
        }
        return;
    }

    log.debug('registerToolbarActions: 注册工具栏 Action...');

    _mmActionInstances.push(new Action('mm_validate', {
        text: '校验配置',
        icon: 'fa-check-circle',
        condition: { modes: ['machine_max_part'] },
        click: function () {
            log.debug('工具栏: 点击"校验配置"');
            const config = getConfig();
            if (!config) {
                showToast('没有可校验的配置', 'warning');
                return;
            }

            const errors = runValidation(config);
            if (errors.length === 0) {
                log.info('校验通过，无错误');
                showToast('校验通过', 'positive');
            } else {
                log.warn('校验发现问题', { count: errors.length, details: errors });
                showToast('校验发现 ' + errors.length + ' 个问题', 'warning');
                new Dialog({
                    title: '校验结果',
                    lines: ['发现 ' + errors.length + ' 个问题：', ...errors],
                    form: { close: 'close' },
                    onConfirm: function () { this.hide(); },
                }).show();
            }
        }
    }));

    _mmActionInstances.push(new Action('mm_export', {
        text: '导出内容包',
        icon: 'fa-save',
        condition: { modes: ['machine_max_part'] },
        click: function () {
            log.debug('工具栏: 点击"导出内容包"');
            var config = getConfig();
            if (!config) {
                showToast('没有可导出的配置', 'warning');
                return;
            }
            var menu = require('../ui/menu.js');
            menu.ensurePackValid(config, function (valid) {
                if (valid) {
                    menu.showExportDialog();
                } else {
                    showToast('请先设置有效的内容包', 'warning');
                }
            });
        }
    }));

    _mmActionInstances.push(new Action('mm_new_part', {
        text: '新建零件',
        icon: 'fa-plus',
        condition: { modes: ['machine_max_part'] },
        click: function () {
            log.debug('工具栏: 点击"新建零件"');
            var cfg = getConfig();
            if (!cfg) {
                log.warn('工具栏新建零件: config 为空');
                return;
            }
            log.debug('工具栏新建零件: 当前零件列表', { parts: Object.keys(cfg.parts || {}) });
            try {
                new Dialog({
                    title: '新建零件',
                    form: {
                        partId: { type: 'text', label: '零件 ID', hint: '如 wine_fox_hull' },
                        variantName: { type: 'text', label: '初始变体名', value: 'default' },
                        model: { type: 'text', label: '模型引用', value: 'machine_max:' },
                    },
                    onConfirm: function (formData) {
                        var partId = formData.partId;
                        var variantName = formData.variantName;
                        var model = formData.model;
                        if (!partId) {
                            showToast('零件 ID 不能为空', 'error');
                            return false;
                        }
                        if (cfg.parts[partId]) {
                            showToast('零件 "' + partId + '" 已存在', 'error');
                            return false;
                        }
                        var cfgMod = require('../core/config.js');
                        cfg.parts[partId] = cfgMod.createPartConfig(partId, variantName);
                        if (model) cfg.parts[partId].variants[variantName].model = model;
                        cfg._uiState.activePartId = partId;
                        cfg._uiState.activeVariantName = variantName;
                        log.info('工具栏新建零件成功', { partId: partId, variant: variantName });
                        refreshOutlinerIcons();
                        Blockbench.dispatchEvent('update_selection');
                        showToast('零件 "' + partId + '" 已创建', 'positive');
                        this.hide();
                    }
                }).show();
                log.debug('工具栏新建零件: Dialog 已创建');
            } catch (e) {
                log.error('工具栏新建零件 Dialog 异常', e);
            }
        }
    }));

    _mmActionInstances.push(new Action('mm_project_settings', {
        text: '项目管理',
        icon: 'fa-cog',
        condition: { modes: ['machine_max_part'] },
        click: function () {
            log.debug('工具栏: 点击"项目管理"');
            const config = getConfig();
            if (!config) {
                log.warn('项目管理: config 为空');
                return;
            }

            const partCount = Object.keys(config.parts).length;

            const partList = Object.entries(config.parts).map(function (entry) {
                var id = entry[0];
                var part = entry[1];
                var vCount = Object.keys(part.variants || {}).length;
                var markerCount = part.element_markers ? Object.values(part.element_markers).reduce(function (sum, m) { return sum + Object.keys(m).length; }, 0) : 0;
                return '  ' + id + '  |  变体: ' + vCount + '  |  标记: ' + markerCount;
            }).join('\n');

            log.debug('项目管理: 当前统计', {
                parts: partCount,
            });

            new Dialog({
                title: 'MachineMax 项目管理',
                form: {
                    contentPackPath: { type: 'text', label: '内容包路径', value: config.contentPackPath || '', description: 'MachineMax 内容包的根目录路径' },
                    info: { type: 'display', label: '统计', lines: [
                        '模型: ' + (Project && Project.name || '未命名'),
                        '内容包路径: ' + (config.contentPackPath || '未设置'),
                        '零件数: ' + partCount,
                        partCount > 0 ? '\n零件列表:\n' + partList : '（暂无零件）',
                    ]},
                },
                onConfirm: function (formData) {
                    config.contentPackPath = formData.contentPackPath || '';
                    log.info('项目管理: 内容包路径已更新', { contentPackPath: formData.contentPackPath });
                    saveConfig();
                    this.hide();
                }
            }).show();
        }
    }));

    log.info('registerToolbarActions: 完成，注册了 ' + _mmActionInstances.length + ' 个 Action');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerToolbarActions,
        _mmActionInstances,
        _mmActionIds,
    };
}
