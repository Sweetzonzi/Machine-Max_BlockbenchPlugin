/**
 * pack_open_dialog.js — 打开已有内容包对话框（从 pack_setup_dialog.js 拆出）
 */

const path = require('path');
const content_pack = require('../../core/content_pack.js');
const persistence = require('../../utils/persistence.js');
const { showToast } = require('../../utils/notify.js');
const { createLogger } = require('../../utils/logger.js');
const { isConfigValid } = require('./pack_common.js');
const ops = require('../../ops/index.js');

/** 模块日志 */
var log = createLogger('PackOpen');

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
    if (!isConfigValid(config)) {
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

                log.debug('showOpenPackDialog: 打开内容包结果', {
                    metaType: typeof meta,
                    metaKeys: Object.keys(meta),
                    authorType: typeof meta.author,
                    descType: typeof meta.description,
                    nameExists: 'name' in meta,
                    metaJSON: JSON.stringify(meta).substring(0, 500),
                    namespace: result.namespace,
                });

                // ---- 更新配置（撤销边界在 ops.setContentPack 内部） ----
                var opResult = ops.setContentPack(config, {
                    path: dirPath,
                    namespace: result.namespace || '',
                    meta: meta,
                });
                if (!opResult.ok) {
                    showToast(opResult.error, 'error');
                    return false;
                }

                log.debug('showOpenPackDialog: packMeta 已设置', {
                    packMetaType: typeof config.packMeta,
                    packMetaKeys: Object.keys(config.packMeta),
                    name: config.packMeta.name,
                    author: config.packMeta.author,
                    description: config.packMeta.description,
                    full: JSON.stringify(config.packMeta).substring(0, 500),
                });
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showOpenPackDialog,
    };
}
