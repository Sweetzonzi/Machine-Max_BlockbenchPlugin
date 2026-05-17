/**
 * pack_setup_dialog.js — 内容包设置向导对话框
 *
 * 提供创建新内容包、打开已有内容包、管理依赖包的对话框函数。
 * 使用 Blockbench 原生 Dialog API，不依赖 Vue。
 *
 * 导出函数:
 *   showPackSetupDialog(config, onSave) — 向导主入口，选择操作后跳转子对话框
 *   showCreatePackDialog(config, onSave) — 创建新内容包
 *   showOpenPackDialog(config, onSave) — 打开已有内容包
 *   showManageDependenciesDialog(config, onSave) — 管理依赖包
 */

const path = require('path');
const content_pack = require('../../core/content_pack.js');
const persistence = require('../../utils/persistence.js');
const { showToast } = require('../../utils/notify.js');
const { createLogger } = require('../../utils/logger.js');

/** 模块日志 */
var log = createLogger('PackSetup');

// =============================================================================
// 内部工具
// =============================================================================

/**
 * 检查 config 对象是否有效
 * @param {Object} config - MM 项目配置
 * @returns {boolean} 有效返回 true
 */
function _isConfigValid(config) {
    return config && typeof config === 'object';
}

/**
 * 将字符串转为安全的文件夹名
 * 替换空格和非法字符为下划线，限制长度 64
 * @param {string} name - 原始名称
 * @returns {string} 安全文件夹名
 */
function _sanitizeFolderName(name) {
    if (!name) return '';
    return String(name).replace(/[<>:"/\\|?*\s]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').substring(0, 64);
}

// =============================================================================
// 内容包创建对话框
// =============================================================================

/**
 * 显示"创建新内容包"对话框
 *
 * 用户在对话框中填写包 ID、版本、名称、作者、描述等信息，
 * 选择父目录后自动创建内容包子文件夹及目录结构（meta.json、namespace 子目录），
 * 并将路径设置到 config.contentPackPath。
 *
 * @param {Object} config - MM 项目配置
 * @param {Function} onSave - 保存回调，接收更新后的 config
 */
function showCreatePackDialog(config, onSave) {
    if (!_isConfigValid(config)) {
        showToast('配置不可用，请先打开项目', 'warning');
        return;
    }

    var ns = config.namespace || 'machine_max';
    var defaultPackId = ns + ':' + (Project && Project.name ? Project.name : 'content_pack');

    try {
        new Dialog({
            id: 'mm_create_pack',
            title: '创建新内容包',
            width: 520,
            form: {
                packId: {
                    type: 'text',
                    label: '内容包 ID',
                    value: defaultPackId,
                    description: '格式: namespace:name，如 machine_max:my_pack。仅限小写字母、数字、_ - . / :',
                },
                packVersion: {
                    type: 'text',
                    label: '版本号',
                    value: '1.0',
                    description: '遵循 SemVer 格式，如 1.0.0',
                },
                packName: {
                    type: 'text',
                    label: '显示名称',
                    value: '',
                    description: '内容包的显示名称（支持 Minecraft 文本组件格式）',
                },
                packAuthor: {
                    type: 'text',
                    label: '作者',
                    value: '',
                    description: '内容包作者名',
                },
                packDescription: {
                    type: 'textarea',
                    label: '描述',
                    value: '',
                    height: 80,
                    description: '内容包描述信息',
                },
                packDir: {
                    type: 'folder',
                    label: '创建目录（父目录）',
                    value: '',
                    description: '选择一个父目录，将在其中以显示名称创建内容包子文件夹',
                },
                depNote: {
                    type: 'info',
                    text: '<span style="color:#888;font-size:11px">提示：内容包创建后，可在主菜单中选择"管理依赖包"添加或移除依赖。</span>',
                },
            },
            onConfirm: function (formData) {
                // ---- 字段校验 ----
                if (!formData.packId || !formData.packId.trim()) {
                    showToast('请输入内容包 ID', 'error');
                    return false;
                }
                if (!formData.packDir || !formData.packDir.trim()) {
                    showToast('请选择创建目录', 'error');
                    return false;
                }

                var packId = formData.packId.trim();
                var parentDir = formData.packDir.trim();
                var folderName = _sanitizeFolderName(formData.packName || packId.split(':').pop() || 'content_pack');
                var packDirPath = path.join(parentDir, folderName);

                // ---- 构建 meta ----
                var meta = {
                    id: packId,
                    version: formData.packVersion || '1.0',
                    name: formData.packName || '',
                    author: formData.packAuthor || '',
                    description: formData.packDescription || '',
                };

                // ---- 创建内容包 ----
                var result = content_pack.createContentPack(packDirPath, meta);
                if (!result.success) {
                    showToast('创建失败: ' + (result.error || '未知错误'), 'error');
                    return false;
                }

                // ---- 更新配置 ----
                persistence.setPackPath(config, packDirPath);
                persistence.saveConfig();

                var namespace = result.namespace || '';
                showToast('内容包 ' + namespace + ' 创建成功', 'positive');
                log.info('内容包创建成功', { path: packDirPath, namespace: namespace, id: packId });

                if (typeof onSave === 'function') onSave(config);
                this.hide();
            },
        }).show();
    } catch (e) {
        log.error('showCreatePackDialog 失败', e);
        showToast('无法打开创建对话框: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// 内容包打开对话框
// =============================================================================

/**
 * 显示"打开已有内容包"对话框
 *
 * 用户选择内容包根目录，通过 content_pack.openContentPack 验证
 * meta.json 有效性和目录结构完整性，验证通过后将路径设置到
 * config.contentPackPath。
 *
 * @param {Object} config - MM 项目配置
 * @param {Function} onSave - 保存回调，接收更新后的 config
 */
function showOpenPackDialog(config, onSave) {
    if (!_isConfigValid(config)) {
        showToast('配置不可用，请先打开项目', 'warning');
        return;
    }

    try {
        new Dialog({
            id: 'mm_open_pack',
            title: '打开已有内容包',
            width: 520,
            form: {
                packDir: {
                    type: 'folder',
                    label: '内容包目录',
                    value: '',
                    description: '选择包含 meta.json 的内容包根目录',
                },
                depNote: {
                    type: 'info',
                    text: '<span style="color:#888;font-size:11px">提示：打开内容包后，可在主菜单中选择"管理依赖包"添加或移除依赖。</span>',
                },
            },
            onConfirm: function (formData) {
                if (!formData.packDir || !formData.packDir.trim()) {
                    showToast('请选择内容包目录', 'error');
                    return false;
                }

                var dirPath = formData.packDir.trim();
                var result = content_pack.openContentPack(dirPath);

                if (!result.valid) {
                    showToast('内容包无效: ' + (result.error || '目录中缺少 meta.json 或必要子目录'), 'error');
                    return false;
                }

                // ---- 更新配置 ----
                persistence.setPackPath(config, dirPath);
                persistence.saveConfig();

                var meta = result.meta || {};
                var displayName = meta.name || result.namespace || '';
                showToast('内容包 ' + displayName + ' 已加载', 'positive', 5000);
                log.info('内容包已打开', { path: dirPath, namespace: result.namespace, id: meta.id });

                if (typeof onSave === 'function') onSave(config);
                this.hide();
            },
        }).show();
    } catch (e) {
        log.error('showOpenPackDialog 失败', e);
        showToast('无法打开对话框: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// 依赖包管理对话框
// =============================================================================

/**
 * 显示"管理依赖包"对话框
 *
 * 以只读列表形式展示当前已配置的依赖包路径，
 * 支持通过文件夹选择器添加新依赖，通过文本输入移除已有依赖。
 *
 * @param {Object} config - MM 项目配置
 * @param {Function} onSave - 保存回调，接收更新后的 config
 */
function showManageDependenciesDialog(config, onSave) {
    if (!_isConfigValid(config)) {
        showToast('配置不可用，请先打开项目', 'warning');
        return;
    }

    var deps = config.dependencyPaths || [];
    var depsHtml = '';
    var i;
    if (deps.length === 0) {
        depsHtml = '（暂无依赖包）';
    } else {
        depsHtml = '<ol style="margin:4px 0;padding-left:20px">';
        for (i = 0; i < deps.length; i++) {
            depsHtml += '<li><code>' + deps[i] + '</code></li>';
        }
        depsHtml += '</ol>';
    }

    try {
        new Dialog({
            id: 'mm_manage_deps',
            title: '管理依赖包',
            width: 560,
            form: {
                currentDepsInfo: {
                    type: 'info',
                    text: '<b>当前已添加的依赖包目录：</b>' + depsHtml +
                        '<br><span style="color:#888;font-size:11px">' +
                        '提示：依赖包是当前内容包引用的其他内容包，用于共享零件、子系统等定义。' +
                        '</span>',
                },
                depPathToRemove: {
                    type: 'text',
                    label: '移除依赖包路径',
                    value: '',
                    description: '输入要移除的依赖包完整目录路径，留空表示不移除',
                },
                newDepPath: {
                    type: 'folder',
                    label: '添加新依赖包目录',
                    value: '',
                    description: '选择包含 meta.json 的内容包目录作为依赖',
                },
            },
            onConfirm: function (formData) {
                var changed = false;
                var removePath, addPath, oldLen;

                // ---- 处理移除 ----
                if (formData.depPathToRemove && formData.depPathToRemove.trim()) {
                    removePath = formData.depPathToRemove.trim();
                    oldLen = (config.dependencyPaths || []).length;
                    persistence.removeDependencyPath(config, removePath);
                    if ((config.dependencyPaths || []).length < oldLen) {
                        changed = true;
                        log.info('已移除依赖包: ' + removePath);
                    } else {
                        showToast('未找到匹配的依赖路径: ' + removePath, 'warning');
                        return false;
                    }
                }

                // ---- 处理添加 ----
                if (formData.newDepPath && formData.newDepPath.trim()) {
                    addPath = formData.newDepPath.trim();
                    oldLen = (config.dependencyPaths || []).length;
                    persistence.addDependencyPath(config, addPath);
                    if ((config.dependencyPaths || []).length > oldLen) {
                        changed = true;
                        log.info('已添加依赖包: ' + addPath);
                    } else {
                        showToast('依赖路径已存在: ' + addPath, 'info');
                    }
                }

                if (changed) {
                    persistence.saveConfig();
                    showToast('依赖包已更新', 'positive');
                    if (typeof onSave === 'function') onSave(config);
                } else if (!formData.depPathToRemove || !formData.depPathToRemove.trim()) {
                    // 既未添加也未移除
                    showToast('未做任何更改', 'info');
                }
                this.hide();
            },
        }).show();
    } catch (e) {
        log.error('showManageDependenciesDialog 失败', e);
        showToast('无法打开依赖管理对话框: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// 向导主入口
// =============================================================================

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
    if (!_isConfigValid(config)) {
        showToast('配置不可用，请先打开项目', 'warning');
        return;
    }

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
        }).show();
    } catch (e) {
        log.error('showPackSetupDialog 失败', e);
        showToast('无法打开设置向导: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showPackSetupDialog,
        showCreatePackDialog,
        showOpenPackDialog,
        showManageDependenciesDialog,
    };
}
