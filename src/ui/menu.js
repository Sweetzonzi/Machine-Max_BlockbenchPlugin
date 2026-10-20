const { createLogger } = require('../utils/logger.js');
const { getConfig, scheduleSave } = require('../utils/persistence.js');
const { showToast } = require('../utils/notify.js');
const content_pack = require('../core/content_pack.js');

/** 模块日志 */
var log = createLogger('Menu');

/** 已注册的 BarMenu 实例引用，供 onunload 清理 */
var _machineMaxMenu = null;

/**
 * 在 Blockbench 菜单栏注册 MachineMax 顶层菜单
 * 位置在 Tools 之后、View 之前。
 */
function registerMachineMaxMenu() {
    if (_machineMaxMenu) {
        log.debug('registerMachineMaxMenu: 菜单已存在，跳过');
        return _machineMaxMenu;
    }

    if (MenuBar && MenuBar.menus && MenuBar.menus['machine_max']) {
        _machineMaxMenu = MenuBar.menus['machine_max'];
        log.debug('registerMachineMaxMenu: 从 MenuBar.menus 恢复引用（热重载）');
        return _machineMaxMenu;
    }

    _machineMaxMenu = new BarMenu('machine_max', [
        {
            name: '导出内容包',
            icon: 'fa-file-export',
            id: 'mm_menu_export',
            click: function () {
                log.info('MachineMax 菜单: 点击导出内容包');
                var config = getConfig();
                if (!config) {
                    showToast('请先打开项目', 'warning');
                    return;
                }
                _ensurePackValid(config, function (valid) {
                    if (valid) {
                        require('./export/export_dialog.js').showExportDialog();
                    } else {
                        showToast('请先设置有效的内容包', 'warning');
                    }
                });
            },
        },

        '_',

        {
            name: '导入零件 JSON…',
            icon: 'fa-file-import',
            id: 'mm_menu_import_part',
            click: function () {
                log.info('MachineMax 菜单: 点击导入零件 JSON');
                var config = getConfig();
                if (!config) {
                    showToast('请先打开项目', 'warning');
                    return;
                }
                // 使用 Electron 原生文件选择器
                var remote;
                try {
                    remote = require('electron').remote;
                } catch (e) {
                    remote = null;
                }
                if (remote && remote.dialog) {
                    remote.dialog.showOpenDialog({
                        title: '选择零件定义 JSON 文件',
                        filters: [{ name: 'JSON 文件', extensions: ['json'] }],
                        properties: ['openFile', 'multiSelections'],
                    }).then(function (result) {
                        if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
                            log.debug('菜单导入: 用户取消选择');
                            return;
                        }
                        var dragImport = require('../import/drag_import.js');
                        for (var i = 0; i < result.filePaths.length; i++) {
                            dragImport.importPartFromPath(result.filePaths[i]);
                        }
                    }).catch(function (err) {
                        log.error('菜单导入: 文件选择失败', err);
                        showToast('文件选择失败', 'error');
                    });
                } else {
                    // 回退：使用 Blockbench 的 import 机制
                    Blockbench.import({
                        extensions: ['json'],
                        type: 'JSON 文件',
                        read_mode: 'text',
                    }, function (files) {
                        if (!files || files.length === 0) return;
                        var dragImport = require('../import/drag_import.js');
                        for (var i = 0; i < files.length; i++) {
                            var filePath = files[i].path || files[i].name;
                            if (filePath) {
                                dragImport.importPartFromPath(filePath);
                            }
                        }
                    });
                }
            },
        },

        '_',

        {
            name: '新建并切换至内容包',
            icon: 'fa-plus-circle',
            id: 'mm_menu_new_pack',
            click: function () {
                log.info('MachineMax 菜单: 点击新建并切换至内容包');
                var config = getConfig();
                if (!config) {
                    showToast('请先打开项目', 'warning');
                    return;
                }
                var pd = require('./dialogs/pack_setup_dialog.js');
                pd.showCreatePackDialog(config, function (updatedConfig) {
                    // showCreatePackDialog 内部已 saveConfig + toast，此处仅做外部需要的额外操作
                });
            },
        },
        {
            name: '切换至已有内容包',
            icon: 'fa-folder-open',
            id: 'mm_menu_open_pack',
            click: function () {
                log.info('MachineMax 菜单: 点击切换至已有内容包');
                var config = getConfig();
                if (!config) {
                    showToast('请先打开项目', 'warning');
                    return;
                }
                var pd = require('./dialogs/pack_setup_dialog.js');
                pd.showOpenPackDialog(config, function (updatedConfig) {
                    scheduleSave();
                    showToast('已切换至内容包', 'positive');
                });
            },
        },
        {
            name: '编辑内容包信息',
            icon: 'fa-edit',
            id: 'mm_menu_edit_meta',
            click: function () {
                log.info('MachineMax 菜单: 点击编辑内容包信息');
                var config = getConfig();
                if (!config) {
                    showToast('请先打开项目', 'warning');
                    return;
                }
                _ensurePackValid(config, function () {
                    require('./export/export_dialog.js').showPackSettingsDialog();
                });
            },
        },

        '_',

        {
            name: '查看控制组预设',
            icon: 'gamepad',
            id: 'mm_menu_control_groups',
            click: function () {
                var config = getConfig();
                if (!config) {
                    showToast('请先打开项目', 'warning');
                    return;
                }
                require('./dialogs/control_group_dialog.js').showControlGroupManagerDialog(config);
            },
        },
        {
            name: '查看投射物定义',
            icon: 'fa-bullseye',
            id: 'mm_menu_projectiles',
            click: function () {
                var config = getConfig();
                if (!config) {
                    showToast('请先打开项目', 'warning');
                    return;
                }
                require('./dialogs/projectile_dialog.js').showProjectileManagerDialog(config);
            },
        },

        '_',

        {
            name: '查看材料定义',
            icon: 'Texture',
            id: 'mm_menu_materials',
            click: function () {
                var config = getConfig();
                if (!config) {
                    showToast('请先打开项目', 'warning');
                    return;
                }
                require('./dialogs/material_dialog.js').showMaterialManagerDialog(config);
            },
        },
        {
            name: '查看子系统型号',
            icon: 'precision_manufacturing',
            id: 'mm_menu_subsystems',
            click: function () {
                var config = getConfig();
                if (!config) {
                    showToast('请先打开项目', 'warning');
                    return;
                }
                require('./dialogs/subsystem_dialog.js').showSubsystemManagerDialog(config);
            },
        },
        {
            name: '查看连接点定义',
            icon: 'link',
            id: 'mm_menu_connectors',
            click: function () {
                var config = getConfig();
                if (!config) {
                    showToast('请先打开项目', 'warning');
                    return;
                }
                require('./dialogs/connector_dialog.js').showConnectorManagerDialog(config);
            },
        },
    ], {
        name: 'MachineMax',
        icon: 'precision_manufacturing',
    });

    MenuBar.addMenu(_machineMaxMenu, 'tools');

    log.info('MachineMax 常驻菜单已注册（位于 Tools 之后，模式无关）');
    return _machineMaxMenu;
}

/**
 * 卸载 MachineMax 菜单
 */
function unregisterMachineMaxMenu() {
    if (_machineMaxMenu) {
        try {
            _machineMaxMenu.delete();
            log.info('MachineMax 菜单已注销');
        } catch (e) {
            log.error('注销 MachineMax 菜单失败', e);
        }
        _machineMaxMenu = null;
    }
}

/**
 * 检查内容包路径有效性，若无效则弹出设置向导
 *
 * 向导取消后通过回调告知调用方，不阻断用户继续编辑。
 * 对导出操作：向导取消视为无效，停止导出。
 * 对编辑信息操作：向导取消仍可继续编辑（仅弹窗提示但无 meta 可编辑）。
 *
 * @param {Object} config - MM 项目配置
 * @param {Function} onResult - 回调 (isValid: boolean, config: Object)
 */
function _ensurePackValid(config, onResult) {
    if (!config) {
        if (typeof onResult === 'function') onResult(false, config);
        return;
    }

    // 快速路径：已有有效路径
    if (config.contentPackPath) {
        var result = content_pack.openContentPack(config.contentPackPath);
        if (result.valid) {
            if (typeof onResult === 'function') onResult(true, config);
            return;
        }
        // 路径存在但失效，记录日志后弹向导
        log.warn('内容包路径无效，将弹出向导', { path: config.contentPackPath, error: result.error });
    }

    // 弹出设置向导
    var pd = require('./dialogs/pack_setup_dialog.js');
    pd.showPackSetupDialog(config, function (updatedConfig) {
        scheduleSave();
        // 向导保存后再次检查
        if (updatedConfig.contentPackPath) {
            var checkResult = content_pack.openContentPack(updatedConfig.contentPackPath);
            if (typeof onResult === 'function') onResult(checkResult.valid, updatedConfig);
        } else {
            if (typeof onResult === 'function') onResult(false, updatedConfig);
        }
    });
}

function showExportDialog() {
    require('./export/export_dialog.js').showExportDialog();
}

/**
 * 公开的包有效性检查入口，供 mode.js、toolbar.js 使用
 * @param {Object} config - MM 项目配置
 * @param {Function} onResult - 回调 (isValid: boolean, config: Object)
 */
function ensurePackValid(config, onResult) {
    _ensurePackValid(config, onResult);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerMachineMaxMenu,
        unregisterMachineMaxMenu,
        showExportDialog,
        ensurePackValid,
    };
}
