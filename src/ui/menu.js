const { createLogger } = require('../utils/logger.js');
const { getConfig, saveConfig, addDependencyPath } = require('../utils/persistence.js');
const { showToast } = require('../utils/notify.js');
const { runValidation } = require('../mode.js');
const content_pack = require('../core/content_pack.js');
const fileWriter = require('../utils/file_writer.js');
const path = require('path');

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
                        _showExportDialog();
                    } else {
                        showToast('请先设置有效的内容包', 'warning');
                    }
                });
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
                    saveConfig();
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
                    _showPackSettingsDialog();
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

        '_',

        {
            name: '创建/管理材料类型',
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
            name: '管理子系统型号',
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
            name: '管理连接点定义',
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
        saveConfig();
        // 向导保存后再次检查
        if (updatedConfig.contentPackPath) {
            var checkResult = content_pack.openContentPack(updatedConfig.contentPackPath);
            if (typeof onResult === 'function') onResult(checkResult.valid, updatedConfig);
        } else {
            if (typeof onResult === 'function') onResult(false, updatedConfig);
        }
    });
}

/**
 * 获取默认导出目录（优先 packMeta 缓存 → .bbmodel 同级）
 * @param {Object} pm - config.packMeta
 * @returns {string}
 */
function _getDefaultExportDir(pm) {
    var path = require('path');
    var cached = pm && pm.exportDir;
    if (cached) return cached;
    // 优先使用内容包目录的上级目录作为默认导出位置
    var config = getConfig();
    if (config && config.contentPackPath) {
        return path.dirname(config.contentPackPath);
    }
    var bbmodelPath = Project && Project.file_path ? Project.file_path : '';
    if (bbmodelPath) {
        return path.join(path.dirname(bbmodelPath), 'machine_max_content_pack');
    }
    return '';
}

/**
 * 显示内容包设置对话框（编辑 meta.json 元数据和导出目录）
 * 填写的内容保存到 config.packMeta。
 *
 * 对话框中提供"默认导出目录"字段，附带浏览按钮，
 * 点击浏览按钮才弹出系统原生文件夹选择器。
 */
function _showPackSettingsDialog() {
    var config = getConfig();
    if (!config) {
        showToast('请先打开项目', 'warning');
        return;
    }

    var pm = config.packMeta || {};
    var ns = config.namespace || 'machine_max';

    log.debug('_showPackSettingsDialog: 打开设置对话框', {
        packMetaExists: !!config.packMeta,
        pmType: typeof pm,
        pmKeys: Object.keys(pm),
        nameType: typeof pm.name,
        name: pm.name,
        authorType: typeof pm.author,
        author: pm.author,
        descType: typeof pm.description,
        description: pm.description,
        contentPackPath: config.contentPackPath,
        fallbackName: config.contentPackPath ? path.basename(config.contentPackPath) : '(无路径)',
    });
    var defaultPackId = pm.id || ns + ':' + (Project ? (Project.name || 'content_pack') : 'content_pack');
    var defaultExportDir = pm.exportDir || _getDefaultExportDir(pm);

    try {
        new Dialog({
            title: 'MachineMax 内容包设置',
            width: 520,
            form: {
                packId: {
                    type: 'text',
                    label: '包 ID（ResourceLocation）',
                    value: defaultPackId,
                    description: '格式为 namespace:pack_name，如 machine_max:wine_fox_parts。仅限小写字母、数字、_ - . / :',
                },
                packVersion: {
                    type: 'text',
                    label: '版本号',
                    value: pm.version || '1.0',
                    description: '遵循 SemVer 格式，如 1.0.0',
                },
                packName: {
                    type: 'text',
                    label: '显示名称',
                    value: pm.name || (config.contentPackPath ? path.basename(config.contentPackPath) : ''),
                    description: '内容包的显示名称（存储在配置中，不会写入 meta.json）',
                },
                packAuthor: {
                    type: 'text',
                    label: '作者',
                    value: pm.author || '',
                    description: '内容包作者名',
                },
                packDescription: {
                    type: 'textarea',
                    label: '描述',
                    value: pm.description || '',
                    height: 90,
                    description: '内容包描述信息',
                },
                exportDir: {
                    type: 'folder',
                    label: '默认导出目录',
                    value: defaultExportDir,
                    description: '点击右侧浏览按钮选择内容包默认导出目录',
                },
                enableAutoPack: {
                    type: 'checkbox',
                    label: '启用自动打包',
                    value: pm.enable_auto_pack !== false,
                    description: '仅 Mod 开发需要考虑此选项。若启用，Spark-Core 将在启动时自动从 Mod 资源中打包 .zip。一般内容包作者保持关闭即可。',
                },
                flatExport: {
                    type: 'checkbox',
                    label: '扁平化导出',
                    value: pm.flat_export !== false,
                    description: '若启用，零件/子系统/连接点将扁平存放；关闭则按模型名分入子文件夹',
                },
                manageDeps: {
                    type: 'checkbox',
                    label: '保存后管理依赖包',
                    value: false,
                    description: '保存元数据后立即进入依赖管理界面，可添加/移除本地路径依赖及链式解析。',
                },
            },
            onConfirm: function (formData) {
                if (!config.packMeta) config.packMeta = {};
                var packMeta = config.packMeta;
                packMeta.id = formData.packId || defaultPackId;
                packMeta.version = formData.packVersion || '1.0';
                packMeta.name = formData.packName || '';
                packMeta.author = formData.packAuthor || '';
                packMeta.description = formData.packDescription || '';
                packMeta.exportDir = formData.exportDir || defaultExportDir;
                packMeta.enable_auto_pack = !!formData.enableAutoPack;
                packMeta.flat_export = !!formData.flatExport;

                saveConfig();
                this.hide();

                if (formData.manageDeps) {
                    // 从已有 dependencyPaths 构建依赖列表，以路径为标识
                    var existing = (config.dependencyPaths || []).map(function (p) {
                        return { path: p, type: 'hard' };
                    });
                    var pdir = config.contentPackPath ? require('path').dirname(config.contentPackPath) : '';
                    var pd = require('./dialogs/pack_setup_dialog.js');
                    pd.showDependencyPathEditor(existing, pdir, function (resolved) {
                        // 完全重建 dependencyPaths
                        config.dependencyPaths = [];
                        var directDeps = resolved.direct || [];
                        var indirectDeps = resolved.indirect || [];
                        for (var d = 0; d < directDeps.length; d++) {
                            addDependencyPath(config, directDeps[d].path);
                        }
                        for (var k = 0; k < indirectDeps.length; k++) {
                            addDependencyPath(config, indirectDeps[k].path);
                        }
                        saveConfig();
                        showToast('内容包设置已保存，依赖已更新', 'positive');
                    });
                } else {
                    showToast('内容包设置已保存', 'positive');
                }

                log.info('内容包设置已更新', {
                    packId: packMeta.id,
                    version: packMeta.version,
                    name: packMeta.name,
                    exportDir: packMeta.exportDir,
                });
            },
        }).show();
    } catch (e) {
        log.error('内容包设置 Dialog 失败', e);
        showToast('无法打开设置对话框: ' + (e.message || e), 'error');
    }
}

/**
 * 显示导出对话框 — 含完整元数据字段和依赖管理
 *
 * 对话框中提供"导出目录"字段，附带浏览按钮，
 * 点击浏览按钮才弹出系统原生文件夹选择器。
 */
function _showExportDialog() {
    var config = getConfig();
    if (!config) {
        showToast('没有可导出的配置，请先打开项目', 'warning');
        return;
    }

    var parts = config.parts || {};
    var partCount = Object.keys(parts).length;
    if (partCount === 0) {
        showToast('没有定义任何零件，请先新建零件', 'warning');
        return;
    }

    var pm = config.packMeta || {};
    var ns = config.namespace || 'machine_max';

    log.debug('_showExportDialog: 打开导出对话框', {
        packMetaExists: !!config.packMeta,
        pmType: typeof pm,
        pmKeys: Object.keys(pm),
        nameType: typeof pm.name,
        name: pm.name,
        authorType: typeof pm.author,
        author: pm.author,
        descType: typeof pm.description,
        description: pm.description,
        contentPackPath: config.contentPackPath,
        fallbackName: config.contentPackPath ? path.basename(config.contentPackPath) : '(无路径)',
    });
    var defaultPackId = pm.id || ns + ':' + (Project ? (Project.name || 'content_pack') : 'content_pack');
    var defaultExportDir = pm.exportDir || _getDefaultExportDir(pm);

    // 校验配置
    var errors = runValidation(config);
    var errorText = '';
    if (errors.length > 0) {
        errorText = '<br>校验发现 ' + errors.length + ' 个问题:<br>' +
            errors.map(function (e) { return '&nbsp;&nbsp;• ' + e; }).join('<br>');
    }

    // 统计信息
    var statLines = [
        '模型: ' + (Project ? Project.name : '未命名'),
        '内容包路径: ' + (config.contentPackPath || '未设置'),
        '零件: ' + partCount,
    ];

    try {
        new Dialog({
            title: '导出 MachineMax 内容包',
            width: 580,
            form: {
                validationInfo: {
                    type: 'info',
                    text: (errorText || '校验通过，未发现问题。') + '<br><br>' + statLines.join('<br>'),
                },
                exportDir: {
                    type: 'folder',
                    label: '导出目录',
                    value: defaultExportDir,
                    description: '点击右侧浏览按钮选择内容包导出目录',
                },
                packId: {
                    type: 'text',
                    label: '包 ID',
                    value: defaultPackId,
                    description: '格式 namespace:pack_name，导出为 meta.json 的 id 字段',
                },
                packVersion: {
                    type: 'text',
                    label: '版本号',
                    value: pm.version || '1.0',
                },
                packName: {
                    type: 'text',
                    label: '显示名称',
                    value: pm.name || (config.contentPackPath ? path.basename(config.contentPackPath) : ''),
                },
                packAuthor: {
                    type: 'text',
                    label: '作者',
                    value: pm.author || '',
                },
                packDescription: {
                    type: 'textarea',
                    label: '描述',
                    value: pm.description || '',
                    height: 90,
                },
                flatExport: {
                    type: 'checkbox',
                    label: '扁平化导出',
                    value: pm.flat_export !== false,
                    description: '若启用，零件/子系统/连接点将扁平存放；关闭则按模型名分入子文件夹',
                },
                dependencies: {
                    type: 'textarea',
                    label: '依赖（每行一个）',
                    value: (function () {
                        var deps = pm.dependencies || [];
                        var lines = deps.map(function (d) {
                            return (typeof d === 'string' ? d : (d.id + ' ' + (d.type || 'hard')));
                        });
                        // 默认填充基础内置包为 hard 依赖（由 Mod 自动提供）
                        var hasBuiltin = false;
                        for (var di = 0; di < deps.length; di++) {
                            var did = typeof deps[di] === 'string' ? deps[di] : deps[di].id;
                            if (did === 'machine_max:builtin') { hasBuiltin = true; break; }
                        }
                        if (!hasBuiltin && pm.id !== 'machine_max:builtin') {
                            lines.unshift('machine_max:builtin hard');
                        }
                        return lines.join('\n');
                    })(),
                    height: 100,
                    description: '格式：每行 "依赖ID 类型"。类型: hard(必需), soft(可选), override(覆盖), conflict(冲突)\n示例: machine_max:builtin hard',
                },
            },
            onConfirm: function (formData) {
                var exportDir = formData.exportDir || defaultExportDir;
                if (!exportDir) {
                    showToast('请先选择导出目录', 'warning');
                    return;
                }

                var packFolderName = _sanitizeFolderName(formData.packName)
                    || _sanitizeFolderName(pm.name || (config.contentPackPath ? path.basename(config.contentPackPath) : ''))
                    || (Project ? Project.name : 'content_pack');

                var overriddenMeta = {
                    id: formData.packId || defaultPackId,
                    version: formData.packVersion || '1.0',
                    name: formData.packName || pm.name || (config.contentPackPath ? path.basename(config.contentPackPath) : ''),
                    author: formData.packAuthor || pm.author || '',
                    description: formData.packDescription || pm.description || '',
                    enable_auto_pack: pm.enable_auto_pack !== false,
                    exportDir: exportDir,
                    dependencies: _parseDependencyText(formData.dependencies || ''),
                    flat_export: !!formData.flatExport,
                };

                if (!config.packMeta) config.packMeta = {};
                Object.assign(config.packMeta, overriddenMeta);

                try {
                    var stats = _executeExport(config, overriddenMeta, exportDir, packFolderName);
                    saveConfig();
                    showToast(
                        '导出成功！\n零件: ' + stats.parts +
                        ', 连接点: ' + stats.connectors +
                        ', 子系统: ' + stats.subsystems +
                        ', 材料: ' + stats.materials +
                        ', 语言: ' + stats.langs,
                        'positive', 6000
                    );
                    log.info('MachineMax 菜单: 导出完成', stats);
                } catch (e) {
                    log.error('导出失败', e);
                    showToast('导出失败: ' + (e.message || e), 'error', 5000);
                }

                this.hide();
            },
        }).show();
    } catch (e) {
        log.error('导出 Dialog 创建失败', e);
        showToast('无法创建导出对话框: ' + (e.message || e), 'error');
    }
}

/**
 * 将字符串转换为安全的文件夹名
 * 替换空格和非法字符为下划线，限制长度 64
 * @param {string} name
 * @returns {string}
 */
function _sanitizeFolderName(name) {
    if (!name) return '';
    return name.replace(/[<>:"/\\|?*\s]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').substring(0, 64);
}

/**
 * 解析依赖文本为 SparkPackDependency 数组
 * 输入格式：每行 "id type"，type 可选（默认 hard）
 * @param {string} text
 * @returns {Array<{id: string, type: string}>}
 */
function _parseDependencyText(text) {
    if (!text || !text.trim()) return [];
    var validTypes = ['hard', 'soft', 'override', 'conflict'];
    return text.split('\n')
        .map(function (line) { return line.trim(); })
        .filter(function (line) { return line.length > 0; })
        .map(function (line) {
            var parts = line.split(/\s+/);
            var depId = parts[0];
            var depType = parts[1] || 'hard';
            if (!validTypes.includes(depType)) depType = 'hard';
            return { id: depId, type: depType };
        });
}

/**
 * 显示"尚未实现"功能的提示 Dialog
 * @param {string} title - Dialog 标题
 * @param {string} description - 功能说明文本
 */
function _showPlaceholder(title, description) {
    try {
        new Dialog({
            title: title + '（即将推出）',
            lines: description.split('\n'),
            onConfirm: function () {
                this.hide();
            },
        }).show();
    } catch (e) {
        log.error('_showPlaceholder Dialog 失败', e);
        showToast(title + '：此功能尚未实现', 'info');
    }
}

/**
 * 执行内容包导出，返回统计信息
 *
 * 目录结构遵循 Spark-Core pack 系统规范:
 *   {exportDir}/
 *     {packFolderName}/
 *       meta.json
 *       {namespace}/
 *         lang/{locale}.json
 *         models/part/{modelName}.geo.json
 *         models/hud/         ← 空目录占位
 *         parts/{partId}.json
 *         recipe/{recipeId}.json
 *         connectors/{connId}.json           （扁平）或 connectors/{model}/{connId}.json（分组）
 *         subsystems/{subId}.json            （扁平）或 subsystems/{model}/{subId}.json（分组）
 *         materials/{matId}.json
 *         textures/hud/       ← 空目录占位
 *         textures/icon/      ← 空目录占位
 *         textures/part/      ← 空目录占位
 *         huds/               ← 空目录占位
 *         animations/hud/     ← 空目录占位
 *         animations/part/    ← 空目录占位
 *         assemblies/         ← 空目录占位
 *         font/               ← 空目录占位
 *         tooltips/           ← 空目录占位
 *         templates/          ← 空目录占位
 *         docs/schemas/       ← 从项目 schemas/ 复制
 *
 * @param {Object} config - MMProjectConfig
 * @param {Object} packMeta - 覆盖的包元数据
 * @param {string} exportDir - 用户选择的导出根目录
 * @param {string} packFolderName - 包文件夹名称
 * @returns {{ parts: number, connectors: number, subsystems: number, materials: number, langs: number }}
 */
function _executeExport(config, packMeta, exportDir, packFolderName) {
    var fs = require('fs');
    var path = require('path');

    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    // 包文件夹根（包装层）
    var packRoot = path.join(exportDir, packFolderName);
    if (!fs.existsSync(packRoot)) {
        fs.mkdirSync(packRoot, { recursive: true });
    }

    var ns = config.namespace || 'machine_max';
    var stats = { parts: 0, connectors: 0, subsystems: 0, materials: 0, langs: 0 };
    var isFlat = packMeta.flat_export !== false;

    function _resolveTargetDir(baseDir, id, flat) {
        if (flat) return baseDir;
        var seg = id.split('_')[0];
        return (seg && seg.length > 0) ? path.join(baseDir, seg) : baseDir;
    }

    /**
     * 从构建时嵌入的 __SCHEMAS__ 常量写入所有 schema 文件到目标目录
     * __SCHEMAS__ 是 { locale/relativePath: fileContent } 映射，键包含 locale 前缀（如 "en_us/schemas/..."），
     * 由 build.js 从内置内容包 docs/ 目录收集（zh_cn/ 和 en_us/ 两份），由本函数直接按原路径写入。
     */
    function _writeSchemasFromConstant(destBaseDir) {
        var schemasRaw = (typeof __SCHEMAS__ !== 'undefined') ? __SCHEMAS__ : null;
        if (!schemasRaw) {
            log.warn('_writeSchemasFromConstant: __SCHEMAS__ 未注入或为空，Schema 文件将不会写入');
            return;
        }
        var schemas = (typeof schemasRaw === 'string') ? JSON.parse(schemasRaw) : schemasRaw;
        var keys = Object.keys(schemas);
        for (var i = 0; i < keys.length; i++) {
            var relPath = keys[i];
            var destPath = path.join(destBaseDir, relPath);
            fileWriter.ensureDir(path.dirname(destPath));
            fs.writeFileSync(destPath, schemas[relPath], 'utf-8');
        }
        log.info('_writeSchemasFromConstant: 已写入 ' + keys.length + ' 个 schema 文件');
    }

    /**
     * 获取当前的 locale，用于决定 $schema 引用到 zh_cn 还是 en_us
     * 简体/繁体中文 → zh_cn，其他 → en_us
     */
    function _getSchemaLocale() {
        var lang = '';
        if (typeof navigator !== 'undefined' && navigator.language) {
            lang = navigator.language;
        } else if (typeof Blockbench !== 'undefined' && Blockbench.locale) {
            lang = Blockbench.locale;
        }
        return (lang.indexOf('zh') === 0) ? 'zh_cn' : 'en_us';
    }

    /**
     * 递归遍历目录，为所有导出 JSON 注入 $schema 引用
     */
    function _injectSchemaReferences(nsDir) {
        var schemaLocale = _getSchemaLocale();
        var schemaMap = {
            parts: 'docs/' + schemaLocale + '/schemas/part_definition_schema.json',
            connectors: 'docs/' + schemaLocale + '/schemas/part/subpart/connector/connector_static_attr.schema.json',
            subsystems: 'docs/' + schemaLocale + '/schemas/subsystem/subsystem_static_attr.schema.json',
            materials: 'docs/' + schemaLocale + '/schemas/base/material_attr.schema.json',
        };
        var recipeSchemaMap = {
            'machine_max:research': 'docs/' + schemaLocale + '/schemas/recipe/research_recipe.schema.json',
            'machine_max:fabricating': 'docs/' + schemaLocale + '/schemas/recipe/fabricating_recipe.schema.json',
            'machine_max:blueprint_research': 'docs/' + schemaLocale + '/schemas/recipe/blueprint_research_recipe.schema.json',
        };
        var dirs = ['parts', 'connectors', 'subsystems', 'materials', 'recipe'];
        for (var d = 0; d < dirs.length; d++) {
            var typeDir = path.join(nsDir, dirs[d]);
            if (!fs.existsSync(typeDir)) continue;
            _walkAndInject(typeDir, nsDir, dirs[d], schemaMap, recipeSchemaMap);
        }
    }

    function _walkAndInject(currentDir, nsDir, typeName, schemaMap, recipeSchemaMap) {
        var entries = fs.readdirSync(currentDir);
        for (var e = 0; e < entries.length; e++) {
            var fullPath = path.join(currentDir, entries[e]);
            var stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                _walkAndInject(fullPath, nsDir, typeName, schemaMap, recipeSchemaMap);
            } else if (entries[e].endsWith('.json')) {
                try {
                    var rawContent = fs.readFileSync(fullPath, 'utf8');
                    var content = JSON.parse(fileWriter.stripJsonComments(rawContent));
                    var schemaRel;
                    if (typeName === 'recipe') {
                        schemaRel = recipeSchemaMap[content.type] || 'docs/schemas/recipe/research_recipe.schema.json';
                    } else {
                        schemaRel = schemaMap[typeName];
                    }
                    if (!schemaRel) continue;
                    var relDir = path.relative(path.dirname(fullPath), nsDir);
                    var schemaPath = path.join(relDir, schemaRel).replace(/\\/g, '/');
                    content['$schema'] = schemaPath;
                    fs.writeFileSync(fullPath, JSON.stringify(content, null, 2), 'utf8');
                } catch (_err) {
                    log.warn('注入 $schema 失败: ' + fullPath, _err);
                }
            }
        }
    }

    // === meta.json ===
    var genMeta = require('../generators/meta_generator.js');
    var savedPackMeta = config.packMeta;
    config.packMeta = packMeta;
    var meta = genMeta.generateMeta(config);
    config.packMeta = savedPackMeta;
    fileWriter.writeJSONFile(packRoot, 'meta.json', meta);

    // === 创建完整空目录架构 + 复制 schemas ===
    var _emptyDirs = [
        'textures/hud', 'textures/icon', 'textures/part',
        'models/hud',
        'huds',
        'animations/hud', 'animations/part',
        'assemblies', 'font', 'tooltips', 'templates',
        'docs',
    ];
    var _nsDir = path.join(packRoot, ns);
    for (var _ei = 0; _ei < _emptyDirs.length; _ei++) {
        fileWriter.ensureDir(path.join(_nsDir, _emptyDirs[_ei]));
    }

    // 复制 schemas 到 {namespace}/docs/schemas/（从构建时嵌入的 __SCHEMAS__ 常量）
    _writeSchemasFromConstant(path.join(_nsDir, 'docs'));

    // === {namespace}/models/part/{modelName}.geo.json ===
    try {
        if (typeof Codecs !== 'undefined' && Codecs.bedrock && Project) {
            var modelDir = path.join(packRoot, ns, 'models', 'part');
            var modelName = Project.geometry_name || Project.name || 'model';
            var geoContent = Codecs.bedrock.compile();
            fileWriter.writeTextFile(modelDir, modelName + '.geo.json', geoContent);
            log.info('已导出 Bedrock 几何体模型: ' + modelName + '.geo.json');
        }
    } catch (e) {
        log.warn('无法导出 Bedrock 几何体模型（可能非 Bedrock 格式）', e);
    }

    // === {namespace}/lang/{locale}.json（合并模式：保留已有条目，仅添加缺失键） ===
    var genLang = require('../generators/lang_generator.js');
    var allLangs = genLang.generateAllLangs(config);
    if (allLangs) {
        var langDir = path.join(packRoot, ns, 'lang');
        for (var locale in allLangs) {
            if (allLangs.hasOwnProperty(locale)) {
                fileWriter.mergeJSONFile(langDir, locale + '.json', allLangs[locale]);
                stats.langs++;
            }
        }
    }

    // === {namespace}/parts/{partId}.json ===
    var genParts = require('../generators/part_generator.js');
    var allParts = genParts.generateAllParts(config);
    var partsBaseDir = path.join(packRoot, ns, 'parts');
    for (var partId in allParts) {
        if (allParts.hasOwnProperty(partId)) {
            var partsTargetDir = _resolveTargetDir(partsBaseDir, partId, isFlat);
            fileWriter.writeJSONFile(partsTargetDir, partId + '.json', allParts[partId]);
            stats.parts++;
        }
    }

    // === {namespace}/recipe/（如有） ===
    if (config.recipes && Object.keys(config.recipes).length > 0) {
        var recipeDir = path.join(packRoot, ns, 'recipe');
        for (var recipeId in config.recipes) {
            if (config.recipes.hasOwnProperty(recipeId)) {
                fileWriter.writeJSONFile(recipeDir, recipeId + '.json', config.recipes[recipeId]);
            }
        }
    }

    // === 从内容包目录复制连接点/子系统/材料 ===
    var packDir = config.contentPackPath;
    if (packDir && fs.existsSync(packDir)) {
        var genConn = require('../generators/connector_generator.js');
        var genSub = require('../generators/subsystem_generator.js');
        var genMat = require('../generators/material_generator.js');

        stats.connectors = genConn.copyConnectorDefs(packDir, ns, path.join(packRoot, ns, 'connectors'), isFlat);
        stats.subsystems = genSub.copySubsystemDefs(packDir, ns, path.join(packRoot, ns, 'subsystems'), isFlat);
        stats.materials = genMat.copyMaterialDefs(packDir, ns, path.join(packRoot, ns, 'materials'));

        // 复制依赖包定义（dependency 目录下的所有 .json）
        var depSrcDir = path.join(packDir, 'dependency');
        if (fs.existsSync(depSrcDir)) {
            var depTargetDir = path.join(packRoot, 'dependency');
            fileWriter.ensureDir(depTargetDir);
            var depFiles = fs.readdirSync(depSrcDir);
            var j, depFile, depSrcFile, depContent;
            for (j = 0; j < depFiles.length; j++) {
                depFile = depFiles[j];
                if (depFile.indexOf('.json') !== depFile.length - 5) continue;
                depSrcFile = path.join(depSrcDir, depFile);
                try {
                    depContent = fs.readFileSync(depSrcFile, 'utf8');
                    fs.writeFileSync(path.join(depTargetDir, depFile), depContent, 'utf8');
                } catch (e) {
                    log.warn('复制依赖包定义失败: ' + depSrcFile, e);
                }
            }
        }
    } else {
        log.warn('内容包目录未设置或不存在，跳过连接点/子系统/材料复制: ' + packDir);
    }

    // === 为所有导出文件注入 $schema 引用 ===
    _injectSchemaReferences(_nsDir);

    log.info('导出完成, 零件=' + stats.parts + ', 连接点=' + stats.connectors + ', 子系统=' + stats.subsystems + ', 材料=' + stats.materials + ', 语言=' + stats.langs);
    return stats;
}

function showExportDialog() {
    _showExportDialog();
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
