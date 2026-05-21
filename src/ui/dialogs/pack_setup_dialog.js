/**
 * pack_setup_dialog.js — 内容包设置向导对话框
 *
 * 提供创建新内容包、打开已有内容包、管理依赖包的对话框函数。
 * 使用 Blockbench 原生 Dialog API 或自定义 DOM 对话框。
 *
 * 导出函数:
 *   showPackSetupDialog(config, onSave) — 向导主入口，选择操作后跳转子对话框
 *   showCreatePackDialog(config, onSave) — 创建新内容包（含依赖配置）
 *   showOpenPackDialog(config, onSave) — 打开已有内容包
 *   showManageDependenciesDialog(config, onSave) — 管理依赖包
 */

const fs = require('fs');
const path = require('path');
const content_pack = require('../../core/content_pack.js');
const persistence = require('../../utils/persistence.js');
const { showToast } = require('../../utils/notify.js');
const { createLogger } = require('../../utils/logger.js');

/** 模块日志 */
var log = createLogger('PackSetup');

// =============================================================================
// 常量
// =============================================================================

/** 依赖类型列表（Spark-Core DependencyType） */
var DEP_TYPES = ['hard', 'soft', 'override', 'conflict'];

/** 依赖类型中文标签 */
var DEP_TYPE_LABELS = {
    hard: '硬依赖 (必需)',
    soft: '软依赖 (可选)',
    override: '覆盖 (替换)',
    conflict: '冲突 (不兼容)',
};

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
// 链式依赖解析
// =============================================================================

/**
 * 在父目录下搜索具有指定 ID 的内容包
 *
 * 遍历 parentDir 的直接子目录和 .zip 文件，读取 meta.json 检查 id 匹配。
 *
 * @param {string} parentDir - 搜索的父目录
 * @param {string} packId - 要查找的内容包 ID（如 machine_max:core）
 * @returns {string|null} 找到的目录或 ZIP 文件路径，或 null
 */
function _findPackInSiblings(parentDir, packId) {
    if (!packId || !parentDir || !fs.existsSync(parentDir)) return null;

    var entries, i, fullPath, stat, meta;
    try {
        entries = fs.readdirSync(parentDir);
    } catch (e) {
        return null;
    }

    for (i = 0; i < entries.length; i++) {
        fullPath = path.join(parentDir, entries[i]);
        try {
            stat = fs.statSync(fullPath);
        } catch (e) {
            continue;
        }

        // 目录形式
        if (stat.isDirectory()) {
            meta = content_pack.readPackMeta(fullPath);
            if (meta && meta.id === packId) {
                return fullPath;
            }
        }

        // ZIP 文件形式
        if (stat.isFile() && fullPath.toLowerCase().endsWith('.zip')) {
            meta = content_pack.readPackMeta(fullPath);
            if (meta && meta.id === packId) {
                return fullPath;
            }
        }
    }
    return null;
}

/**
 * 解析直接依赖的链式（间接）依赖
 *
 * 对每个直接依赖路径：
 *   1. 读取其 meta.json 中的 dependencies 字段
 *   2. 在父目录（所有直接依赖的公共父目录）下搜索匹配的包
 *   3. 只搜索一层（被找到的间接依赖不再递归解析其自身依赖）
 *
 * @param {Array<{path: string, type: string}>} directDeps - 直接依赖列表
 * @param {string} parentDir - 搜索的父目录
 * @returns {{direct: Array, indirect: Array<{path: string, type: string, isIndirect: boolean}>}}
 */
function _resolveChainDependencies(directDeps, parentDir) {
    var indirect = [];
    var processed = {};
    var i, j, dep, depMeta, depDeps, depDep, depId, found;

    // 标记直接依赖路径为已处理，避免被当作间接依赖重复添加
    for (i = 0; i < directDeps.length; i++) {
        if (directDeps[i].path) {
            processed[directDeps[i].path] = true;
        }
    }

    for (i = 0; i < directDeps.length; i++) {
        dep = directDeps[i];
        if (!dep.path) continue;

        depMeta = content_pack.readPackMeta(dep.path);
        if (!depMeta || !depMeta.dependencies || !depMeta.dependencies.length) continue;

        depDeps = depMeta.dependencies;
        for (j = 0; j < depDeps.length; j++) {
            depDep = depDeps[j];
            depId = depDep.id || depDep;

            // 在公共父目录下搜索
            found = _findPackInSiblings(parentDir, depId);
            if (found && !processed[found]) {
                processed[found] = true;
                indirect.push({
                    path: found,
                    type: depDep.type || 'hard',
                    isIndirect: true,
                });
                log.info('链式解析: 发现间接依赖 "' + depId + '" → ' + found);
            }
        }
    }

    return {
        direct: directDeps,
        indirect: indirect,
    };
}

// =============================================================================
// 依赖路径编辑器（Blockbench Dialog 重建方案）
// =============================================================================

/**
 * 显示依赖路径编辑器 —— 每次选择一个目录、一个类型，循环重建
 *
 * 使用 Blockbench 原生 Dialog 的 `type: 'folder'`（Electron dialog.showOpenDialog），
 * 比 webkitdirectory 更可靠。选择完毕并取消"继续添加"后，自动链式解析。
 * 已有依赖列表中的直接依赖可通过下拉菜单移除。
 *
 * @param {Array<{path: string, type: string, isIndirect?: boolean}>} existingDeps - 已有依赖
 * @param {string} contextParentDir - 用于链式解析的父目录
 * @param {Object} [options] - 可选配置
 * @param {boolean} [options.defaultKeepAdding=true] - "继续添加"复选框默认值
 * @param {Function} onComplete - 完成回调 (result: {direct: Array, indirect: Array})
 */
function _showDependencyPathEditor(existingDeps, contextParentDir, options, onComplete) {
    // 参数重载：options 可选
    if (typeof options === 'function') {
        onComplete = options;
        options = {};
    }
    var opts = options || {};
    var defaultKeepAdding = opts.defaultKeepAdding !== false;

    var selected = existingDeps ? existingDeps.slice() : [];
    var stepNum = selected.length + 1;

    function _buildDepListHtml() {
        if (selected.length === 0) return '（暂无依赖）';
        var html = '';
        for (var i = 0; i < selected.length; i++) {
            var d = selected[i];
            html += '<div style="margin:2px 0;padding:4px 8px;background:#333;border-radius:3px;font-size:12px">' +
                (d.isIndirect ? '↳ 间接 ' : '') + '<code>' + d.path + '</code> — ' +
                DEP_TYPE_LABELS[d.type] + '</div>';
        }
        return html;
    }

    /** 构建已有依赖的移除下拉选项（仅直接依赖） */
    function _buildRemoveOptions() {
        var opts = { _none_: '（不移除）' };
        for (var i = 0; i < selected.length; i++) {
            if (selected[i].isIndirect) continue;
            var label = (i + 1) + ': ' + (selected[i].path || '?') + ' [' + selected[i].type + ']';
            // 截断过长的标签
            if (label.length > 60) label = label.substring(0, 57) + '...';
            opts['del_' + i] = label;
        }
        return opts;
    }

    function _showOneStep() {
        try {
            // 动态构建表单（有依赖时可移除）
            var formFields = {
                currentList: {
                    type: 'info',
                    text: '<b>已选择的依赖包：</b><br>' + _buildDepListHtml(),
                },
            };

            var directCount = 0;
            for (var di = 0; di < selected.length; di++) {
                if (!selected[di].isIndirect) directCount++;
            }
            if (directCount > 0) {
                formFields.removeDep = {
                    type: 'select',
                    label: '移除依赖',
                    options: _buildRemoveOptions(),
                    value: '_none_',
                };
            }

            formFields.depDir = {
                type: 'folder',
                label: '选择内容包目录',
                value: '',
                description: '选择一个已存在的 MachineMax 内容包目录或 .zip 文件。只移除而不添加时留空。',
            };
            formFields.depType = {
                type: 'select',
                label: '依赖类型',
                options: {
                    hard: DEP_TYPE_LABELS.hard,
                    soft: DEP_TYPE_LABELS.soft,
                    override: DEP_TYPE_LABELS.override,
                    conflict: DEP_TYPE_LABELS.conflict,
                },
                value: 'hard',
            };
            formFields.keepAdding = {
                type: 'checkbox',
                label: '继续添加更多依赖',
                value: defaultKeepAdding,
            };

            new Dialog({
                id: 'mm_dep_editor_step_' + stepNum,
                title: '配置本地依赖路径 (' + stepNum + ')',
                width: 620,
                form: formFields,
                onConfirm: function (formData) {
                    // 优先处理移除
                    if (formData.removeDep && formData.removeDep !== '_none_') {
                        var idxStr = formData.removeDep.replace('del_', '');
                        var rmIdx = parseInt(idxStr, 10);
                        if (!isNaN(rmIdx) && rmIdx >= 0 && rmIdx < selected.length) {
                            var removedPath = selected[rmIdx].path;
                            selected.splice(rmIdx, 1);
                            log.info('依赖路径编辑器: 已移除 ' + removedPath);
                        }
                        stepNum++;
                        this.hide();
                        _showOneStep();
                        return;
                    }

                    // 处理本次选择的目录
                    if (formData.depDir && formData.depDir.trim()) {
                        var depPath = formData.depDir.trim();
                        var r = content_pack.openContentPack(depPath);
                        if (!r.valid) {
                            showToast('所选目录不是有效内容包: ' + (r.error || '缺少 meta.json'), 'warning');
                            stepNum++;
                            this.hide();
                            _showOneStep();
                            return;
                        }
                        var dup = false;
                        for (var k = 0; k < selected.length; k++) {
                            if (selected[k].path === depPath) { dup = true; break; }
                        }
                        if (dup) {
                            showToast('该内容包已在依赖列表中', 'info');
                            stepNum++;
                            this.hide();
                            _showOneStep();
                            return;
                        }
                        selected.push({ path: depPath, type: formData.depType || 'hard', isIndirect: false });
                    }

                    if (formData.keepAdding) {
                        stepNum++;
                        this.hide();
                        _showOneStep();
                        return;
                    }

                    // 完成 → 链式解析
                    this.hide();
                    var resolved = { direct: selected, indirect: [] };
                    if (selected.length > 0 && contextParentDir) {
                        resolved = _resolveChainDependencies(selected, contextParentDir);
                        for (var j = 0; j < resolved.indirect.length; j++) {
                            selected.push(resolved.indirect[j]);
                        }
                    }
                    if (typeof onComplete === 'function') onComplete(resolved);
                },
                onCancel: function () {
                    this.hide();
                    var resolved = { direct: selected, indirect: [] };
                    if (selected.length > 0 && contextParentDir) {
                        resolved = _resolveChainDependencies(selected, contextParentDir);
                    }
                    if (typeof onComplete === 'function') onComplete(resolved);
                },
            }).show();
        } catch (e) {
            log.error('_showDependencyPathEditor 步骤失败', e);
            if (typeof onComplete === 'function') onComplete({ direct: [], indirect: [] });
        }
    }

    _showOneStep();
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
 * 创建完成后固定弹出依赖路径编辑器，默认类型 hard、"继续添加"关闭。
 * 直接依赖 → config.dependencyPaths + packMeta.dependencies
 * 间接依赖 → 仅 config.dependencyPaths（合并定义，不导出为运行时依赖）
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
                    height: 70,
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
                    text: '<span style="color:#888;font-size:11px">' +
                        '提示：创建完成后将立即进入依赖管理界面。' +
                        '基础定义（通用连接点、子系统模板、材料）已内置，无需额外依赖。' +
                        '如果需要官方车辆零件（如 AE86、Jeep 等车型），可添加 machine_max:official 作为依赖。' +
                        '</span>',
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

                // ---- 构建 meta（不含依赖，依赖在路径编辑器后单独补充） ----
                // 注意：meta.json 中没有 name 字段，包显示名称由文件夹名决定
                var meta = {
                    id: packId,
                    version: formData.packVersion || '1.0',
                    author: formData.packAuthor || '',
                    description: formData.packDescription || '',
                };

                // ---- 创建内容包 ----
                var result = content_pack.createContentPack(packDirPath, meta);
                if (!result.success) {
                    showToast('创建失败: ' + (result.error || '未知错误'), 'error');
                    return false;
                }

                // ---- 更新配置（初步） ----
                persistence.setPackPath(config, packDirPath);
                config.namespace = result.namespace || '';
                config.packMeta = meta;
                persistence.saveConfig();

                var namespace = result.namespace || '';
                var displayName = folderName || packId.split(':').pop() || packId;
                log.info('内容包创建成功', { path: packDirPath, namespace: namespace, id: packId, name: displayName });

                this.hide();

                // ---- 固定弹出依赖路径编辑器（默认 hard，不继续添加） ----
                _showDependencyPathEditor([], parentDir, { defaultKeepAdding: false }, function (resolved) {
                    var directDeps = resolved.direct || [];
                    var indirectDeps = resolved.indirect || [];

                    // 直接依赖：加入 dependencyPaths
                    for (var d = 0; d < directDeps.length; d++) {
                        persistence.addDependencyPath(config, directDeps[d].path);
                    }

                    // 间接依赖：仅加入 dependencyPaths（不加入 packMeta.dependencies）
                    for (var k = 0; k < indirectDeps.length; k++) {
                        persistence.addDependencyPath(config, indirectDeps[k].path);
                    }

                    persistence.saveConfig();

                    var msg = '内容包 ' + displayName + ' 创建成功';
                    if (directDeps.length > 0) {
                        msg += '，已添加 ' + directDeps.length + ' 个直接依赖';
                    }
                    if (indirectDeps.length > 0) {
                        msg += '，解析 ' + indirectDeps.length + ' 个间接依赖';
                    }
                    showToast(msg, 'positive', 5000);

                    if (typeof onSave === 'function') onSave(config);
                });
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
                    description: '选择包含 meta.json 的内容包根目录或 .zip 文件',
                },
                depNote: {
                    type: 'info',
                    text: '<span style="color:#888;font-size:11px">' +
                        '提示：打开内容包后，可在 MachineMax 菜单 → "编辑内容包信息"中修改元数据，' +
                        '或通过菜单项管理本地依赖路径。' +
                        '</span>',
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

                var meta = result.meta || {};

                // ---- 更新配置 ----
                persistence.setPackPath(config, dirPath);
                config.namespace = result.namespace || '';
                config.packMeta = meta;
                persistence.saveConfig();
                var displayName = path.basename(dirPath) || result.namespace || '';
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
                    description: '选择包含 meta.json 的内容包目录或 .zip 文件作为依赖',
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
    if (!_isConfigValid(config)) {
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

/**
 * 公开的依赖路径编辑器入口，供外部模块（menu.js 等）调用
 *
 * @param {Array<{path: string, type: string}>} existingDeps - 已有依赖路径列表
 * @param {string} parentDir - 用于链式解析的父目录
 * @param {Object} [options] - 可选配置
 * @param {boolean} [options.defaultKeepAdding=true] - "继续添加"复选框默认值
 * @param {Function} onComplete - 完成回调 (result: {direct: Array, indirect: Array})
 */
function showDependencyPathEditor(existingDeps, parentDir, options, onComplete) {
    _showDependencyPathEditor(existingDeps, parentDir, options, onComplete);
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
        showDependencyPathEditor,
    };
}
