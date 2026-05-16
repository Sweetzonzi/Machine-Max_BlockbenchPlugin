const { createLogger } = require('../utils/logger.js');
const { getConfig, saveConfig } = require('../utils/persistence.js');
const { showToast } = require('../utils/notify.js');
const { runValidation } = require('../mode.js');

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
                _showExportDialog();
            },
        },

        '_',

        {
            name: '内容包设置',
            icon: 'settings',
            id: 'mm_menu_pack_settings',
            click: function () {
                log.info('MachineMax 菜单: 点击内容包设置');
                _showPackSettingsDialog();
            },
        },

        '_',

        {
            name: '创建/管理材料类型',
            icon: 'Texture',
            id: 'mm_menu_materials',
            click: function () {
                _showPlaceholder('材料类型管理',
                    '在此处可以创建自定义材料（Material），为零件赋予不同的物理属性。\n\n' +
                    '每个材料定义包含：\n' +
                    '  • friction — 摩擦系数\n' +
                    '  • restitution — 弹性恢复\n' +
                    '  • density — 密度\n' +
                    '  • armor_thickness / armor_toughness — 装甲参数\n\n' +
                    '此功能将在后续版本中提供。');
            },
        },
        {
            name: '管理子系统型号',
            icon: 'precision_manufacturing',
            id: 'mm_menu_subsystems',
            click: function () {
                _showPlaceholder('子系统型号管理',
                    '在此处可以创建并管理子系统型号（Subsystem），定义引擎、变速箱、座椅等\n' +
                    '功能模块的静态参数。\n\n' +
                    '支持的子系统类型包括：\n' +
                    '  engine, motor, gearbox, seat, wheel_driver,\n' +
                    '  car_controller, lighting, item_storage 等\n\n' +
                    '此功能将在后续版本中提供。');
            },
        },
        {
            name: '管理连接点定义',
            icon: 'link',
            id: 'mm_menu_connectors',
            click: function () {
                _showPlaceholder('连接点定义管理',
                    '在此处可以创建并管理连接点（Connector）静态定义，\n' +
                    '决定零件之间的连接规则。\n\n' +
                    '每个连接点定义包含：\n' +
                    '  • type — 连接类型（Simple/Fixed/Rotational/…）\n' +
                    '  • direction — 连接方向\n' +
                    '  • required_tags / accepted_tags / rejected_tags — 标签过滤\n' +
                    '  • joints — 关节配置\n\n' +
                    '此功能将在后续版本中提供。');
            },
        },
    ], {
        name: 'MachineMax',
        icon: 'precision_manufacturing',
        condition: { modes: ['machine_max_part'] },
    });

    MenuBar.addMenu(_machineMaxMenu, 'tools');

    log.info('MachineMax 菜单已注册（位于 Tools 之后）');
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
 * 获取默认导出目录（优先 packMeta 缓存 → .bbmodel 同级）
 * @param {Object} pm - config.packMeta
 * @returns {string}
 */
function _getDefaultExportDir(pm) {
    var path = require('path');
    var cached = pm && pm.exportDir;
    if (cached) return cached;
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
                    value: pm.name || '',
                    description: '内容包的显示名称（支持 Minecraft 文本组件格式）',
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
                    description: '若启用，Spark-Core 将在启动时自动从 Mod 资源中打包 .zip（仅 Mod 内嵌内容包场景）',
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

                saveConfig();
                showToast('内容包设置已保存', 'positive');
                log.info('内容包设置已更新', {
                    packId: packMeta.id,
                    version: packMeta.version,
                    name: packMeta.name,
                    exportDir: packMeta.exportDir,
                });
                this.hide();
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
    var connCount = Object.keys(config.connector_defs || {}).length;
    var subCount = Object.keys(config.subsystem_defs || {}).length;
    var matCount = Object.keys(config.material_defs || {}).length;
    var statLines = [
        '模型: ' + (Project ? Project.name : '未命名'),
        '命名空间: ' + ns,
        '零件: ' + partCount,
        '连接点定义: ' + connCount,
        '子系统型号: ' + subCount,
        '材料定义: ' + matCount,
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
                    value: pm.name || '',
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
                dependencies: {
                    type: 'textarea',
                    label: '依赖（每行一个）',
                    value: (pm.dependencies || []).map(function (d) {
                        return (typeof d === 'string' ? d : (d.id + ' ' + (d.type || 'hard')));
                    }).join('\n'),
                    height: 100,
                    description: '格式：每行 "依赖ID 类型"。类型: hard(必需), soft(可选), override(覆盖), conflict(冲突)\n示例: machine_max:core hard',
                },
            },
            onConfirm: function (formData) {
                var exportDir = formData.exportDir || defaultExportDir;
                if (!exportDir) {
                    showToast('请先选择导出目录', 'warning');
                    return;
                }

                var overriddenMeta = {
                    id: formData.packId || defaultPackId,
                    version: formData.packVersion || '1.0',
                    name: formData.packName || pm.name || '',
                    author: formData.packAuthor || pm.author || '',
                    description: formData.packDescription || pm.description || '',
                    enable_auto_pack: pm.enable_auto_pack !== false,
                    exportDir: exportDir,
                    dependencies: _parseDependencyText(formData.dependencies || ''),
                };

                if (!config.packMeta) config.packMeta = {};
                Object.assign(config.packMeta, overriddenMeta);

                try {
                    var stats = _executeExport(config, overriddenMeta, exportDir);
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
 *     meta.json
 *     {namespace}/
 *       lang/{locale}.json
 *       models/{partId}.json
 *       recipe/{recipeId}.json
 *       textures/...
 *       sounds/...
 *       animations/...
 *
 * @param {Object} config - MMProjectConfig
 * @param {Object} packMeta - 覆盖的包元数据
 * @param {string} exportDir - 导出根目录
 * @returns {{ parts: number, connectors: number, subsystems: number, materials: number, langs: number }}
 */
function _executeExport(config, packMeta, exportDir) {
    var fs = require('fs');
    var path = require('path');

    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    var ns = config.namespace || 'machine_max';
    var stats = { parts: 0, connectors: 0, subsystems: 0, materials: 0, langs: 0 };

    // === meta.json ===
    var genMeta = require('../generators/meta_generator.js');
    var savedPackMeta = config.packMeta;
    config.packMeta = packMeta;
    var meta = genMeta.generateMeta(config);
    config.packMeta = savedPackMeta;
    _ensureWriteJSON(path.join(exportDir, 'meta.json'), meta);

    // === {namespace}/lang/{locale}.json ===
    var genLang = require('../generators/lang_generator.js');
    var allLangs = genLang.generateAllLangs(config);
    if (allLangs) {
        var langDir = path.join(exportDir, ns, 'lang');
        for (var locale in allLangs) {
            if (allLangs.hasOwnProperty(locale)) {
                _ensureWriteJSON(path.join(langDir, locale + '.json'), allLangs[locale]);
                stats.langs++;
            }
        }
    }

    // === {namespace}/models/{partId}.json ===
    var genParts = require('../generators/part_generator.js');
    var allParts = genParts.generateAllParts(config);
    var modelsDir = path.join(exportDir, ns, 'models');
    for (var partId in allParts) {
        if (allParts.hasOwnProperty(partId)) {
            _ensureWriteJSON(path.join(modelsDir, partId + '.json'), allParts[partId]);
            stats.parts++;
        }
    }

    // === {namespace}/recipe/（如有） ===
    if (config.recipes && Object.keys(config.recipes).length > 0) {
        var recipeDir = path.join(exportDir, ns, 'recipe');
        for (var recipeId in config.recipes) {
            if (config.recipes.hasOwnProperty(recipeId)) {
                _ensureWriteJSON(path.join(recipeDir, recipeId + '.json'), config.recipes[recipeId]);
            }
        }
    }

    // === 连接点、子系统、材料（保留以备后用） ===
    var genConnectors = require('../generators/connector_generator.js');
    var allConnectors = genConnectors.generateAllConnectors(config);
    if (allConnectors && Object.keys(allConnectors).length > 0) {
        var connDir = path.join(exportDir, ns, 'connectors');
        for (var connId in allConnectors) {
            if (allConnectors.hasOwnProperty(connId)) {
                _ensureWriteJSON(path.join(connDir, connId + '.json'), allConnectors[connId]);
                stats.connectors++;
            }
        }
    }

    var genSubsystems = require('../generators/subsystem_generator.js');
    var allSubsystems = genSubsystems.generateAllSubsystems(config);
    if (allSubsystems && Object.keys(allSubsystems).length > 0) {
        var subDir = path.join(exportDir, ns, 'subsystems');
        for (var subId in allSubsystems) {
            if (allSubsystems.hasOwnProperty(subId)) {
                _ensureWriteJSON(path.join(subDir, subId + '.json'), allSubsystems[subId]);
                stats.subsystems++;
            }
        }
    }

    var genMaterials = require('../generators/material_generator.js');
    var allMaterials = genMaterials.generateAllMaterials(config);
    if (allMaterials && Object.keys(allMaterials).length > 0) {
        var matDir = path.join(exportDir, ns, 'materials');
        for (var matId in allMaterials) {
            if (allMaterials.hasOwnProperty(matId)) {
                _ensureWriteJSON(path.join(matDir, matId + '.json'), allMaterials[matId]);
                stats.materials++;
            }
        }
    }

    log.info('导出完成, 零件=' + stats.parts + ', 连接点=' + stats.connectors + ', 子系统=' + stats.subsystems + ', 材料=' + stats.materials + ', 语言=' + stats.langs);
    return stats;
}

/**
 * 确保目录存在后写入 JSON 文件
 * @param {string} filePath
 * @param {Object} data
 */
function _ensureWriteJSON(filePath, data) {
    var fs = require('fs');
    var path = require('path');
    var dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerMachineMaxMenu,
        unregisterMachineMaxMenu,
    };
}
