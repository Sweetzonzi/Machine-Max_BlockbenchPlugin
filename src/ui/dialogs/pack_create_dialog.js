/**
 * pack_create_dialog.js — 创建新内容包对话框（从 pack_setup_dialog.js 拆出）
 */

const path = require('path');
const packService = require('../../services/pack.js');
const persistence = require('../../utils/persistence.js');
const { showToast } = require('../../utils/notify.js');
const { createLogger } = require('../../utils/logger.js');
const { isConfigValid, sanitizeFolderName } = require('./pack_common.js');
const { showDependencyPathEditor } = require('./dependency_editor.js');
const ops = require('../../ops/index.js');

/** 模块日志 */
var log = createLogger('PackCreate');

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
    if (!isConfigValid(config)) {
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
                var folderName = sanitizeFolderName(formData.packName || packId.split(':').pop() || 'content_pack');
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
                var result = packService.createPack(packDirPath, meta);
                if (!result.success) {
                    showToast('创建失败: ' + (result.error || '未知错误'), 'error');
                    return false;
                }

                // ---- 更新配置（初步） ----
                // 目录创建是文件系统副作用，不进撤销栈；这里只让配置变更可撤销
                var opResult = ops.setContentPack(config, {
                    path: packDirPath,
                    namespace: result.namespace || '',
                    meta: meta,
                    label: '创建并切换内容包',
                });
                if (!opResult.ok) {
                    showToast(opResult.error, 'error');
                    return false;
                }
                persistence.scheduleSave();

                var namespace = result.namespace || '';
                var displayName = folderName || packId.split(':').pop() || packId;
                log.info('内容包创建成功', { path: packDirPath, namespace: namespace, id: packId, name: displayName });

                this.hide();

                // ---- 固定弹出依赖路径编辑器（默认 hard，不继续添加） ----
                showDependencyPathEditor([], parentDir, { defaultKeepAdding: false }, function (resolved) {
                    var directDeps = resolved.direct || [];
                    var indirectDeps = resolved.indirect || [];
                    var allPaths = [];

                    // 直接依赖 + 间接依赖都写入 dependencyPaths（间接依赖不写入 packMeta.dependencies）
                    for (var d = 0; d < directDeps.length; d++) allPaths.push(directDeps[d].path);
                    for (var k = 0; k < indirectDeps.length; k++) allPaths.push(indirectDeps[k].path);
                    ops.updateDependencyPaths(config, { add: allPaths });

                    persistence.scheduleSave();

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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showCreatePackDialog,
    };
}
