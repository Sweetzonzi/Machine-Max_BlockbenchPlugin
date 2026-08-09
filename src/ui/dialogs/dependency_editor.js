/**
 * dependency_editor.js — 依赖包编辑相关对话框（从 pack_setup_dialog.js 拆出）
 *
 * 包含：
 *   - 链式依赖解析（_findPackInSiblings / _resolveChainDependencies）
 *   - 依赖路径编辑器（showDependencyPathEditor，逐目录循环重建 Dialog）
 *   - 依赖包管理对话框（showManageDependenciesDialog，只读列表 + 添加/移除）
 */

const fs = require('fs');
const path = require('path');
const content_pack = require('../../core/content_pack.js');
const persistence = require('../../utils/persistence.js');
const { showToast } = require('../../utils/notify.js');
const { createLogger } = require('../../utils/logger.js');
const { DEP_TYPE_LABELS } = require('./pack_common.js');

/** 模块日志 */
var log = createLogger('DependencyEditor');

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
function showDependencyPathEditor(existingDeps, contextParentDir, options, onComplete) {
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
            log.error('showDependencyPathEditor 步骤失败', e);
            if (typeof onComplete === 'function') onComplete({ direct: [], indirect: [] });
        }
    }

    _showOneStep();
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
    var { isConfigValid } = require('./pack_common.js');
    if (!isConfigValid(config)) {
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showDependencyPathEditor,
        showManageDependenciesDialog,
        _resolveChainDependencies,
        _findPackInSiblings,
    };
}
