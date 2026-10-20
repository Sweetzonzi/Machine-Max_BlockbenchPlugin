var { getConfig, saveConfig } = require('../utils/persistence.js');
var { showToast } = require('../utils/notify.js');
var { createLogger } = require('../utils/logger.js');
var { refreshOutlinerIcons } = require('./icons.js');

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

            // 打开 Blockbench 原生"检验"清单（含插件 mm_validation + 定位按钮）
            // validate() 异步（40ms 去抖）重跑 mm_validation.run()；稍后打开弹窗保证读到最新结果
            if (typeof Validator === 'undefined') {
                showToast('当前环境不支持 Blockbench 校验清单', 'warning');
                return;
            }
            Validator.validate();
            setTimeout(function () { Validator.openDialog(); }, 60);
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
            // 对话框与撤销边界都在共享实现里（ui/dialogs/part_dialogs.js → core/operations.js）
            require('../ui/dialogs/part_dialogs.js').showNewPartDialog(cfg, function () {
                refreshOutlinerIcons();
            });
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
            require('../ui/dialogs/part_dialogs.js').showProjectSettingsDialog(config, function () {
                saveConfig();
            });
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
