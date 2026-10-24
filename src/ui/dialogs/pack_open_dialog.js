/**
 * pack_open_dialog.js — 打开已有内容包对话框（从 pack_setup_dialog.js 拆出）
 */

const path = require('path');
const persistence = require('../../utils/persistence.js');
const { showToast } = require('../../utils/notify.js');
const { createLogger } = require('../../utils/logger.js');
const { isConfigValid, applyPackPath, buildUnresolvedMessage } = require('./pack_common.js');

/** 模块日志 */
var log = createLogger('PackOpen');

/**
 * 显示"打开已有内容包"对话框
 *
 * 用户选择内容包根目录，通过 content_pack.openContentPack 验证
 * meta.json 有效性和目录结构完整性，验证通过后将路径设置到
 * config.contentPackPath。
 *
 * 随后静默解析该包 meta.dependencies 声明的依赖：在内容包父目录下按 id
 * 查找同级目录 / ZIP，把找到的直接依赖和一层间接依赖写入
 * config.dependencyPaths。没能全部解析时弹 warning toast，提示用户到
 * "管理依赖包"里手动选择目录。
 *
 * 校验与写入都在 `pack_common.applyPackPath` 里（strict 模式：无效包不写入）。
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
                        '提示：打开后会按 meta.json 声明的依赖，在内容包同级目录自动查找对应内容包；' +
                        '没找到的依赖会在加载后提示，可在 MachineMax 菜单 → 内容包设置 → 管理依赖包 中手动选择。' +
                        '</span>',
                },
            },
            onConfirm: function (formData) {
                if (!formData.packDir || !formData.packDir.trim()) {
                    showToast('请选择内容包目录', 'error');
                    return false;
                }

                var dirPath = formData.packDir.trim();

                // ---- 校验 + 解析依赖 + 一条撤销记录写入 ----
                var applied = applyPackPath(config, dirPath, { strict: true, label: '打开内容包' });
                if (!applied.ok) {
                    showToast('内容包无效: ' + (applied.error || '目录中缺少 meta.json 或必要子目录'), 'error');
                    return false;
                }

                var meta = applied.meta || {};

                log.debug('showOpenPackDialog: 打开内容包结果', {
                    metaType: typeof meta,
                    metaKeys: Object.keys(meta),
                    authorType: typeof meta.author,
                    descType: typeof meta.description,
                    nameExists: 'name' in meta,
                    metaJSON: JSON.stringify(meta).substring(0, 500),
                    namespace: applied.namespace,
                });

                log.debug('showOpenPackDialog: packMeta 已设置', {
                    packMetaType: typeof config.packMeta,
                    packMetaKeys: Object.keys(config.packMeta),
                    name: config.packMeta.name,
                    author: config.packMeta.author,
                    description: config.packMeta.description,
                    full: JSON.stringify(config.packMeta).substring(0, 500),
                });
                log.info('showOpenPackDialog: 依赖解析结果', {
                    parentDir: applied.parentDir,
                    direct: applied.resolution.direct.length,
                    indirect: applied.resolution.indirect.length,
                    unresolved: applied.resolution.unresolved.map(function (u) { return u.id; }),
                    dependencyPaths: applied.dependencyPaths,
                });

                persistence.scheduleSave();
                var displayName = path.basename(dirPath) || applied.namespace || '';
                var loadedMsg = '内容包 ' + displayName + ' 已加载';
                if (applied.resolution.direct.length > 0 || applied.resolution.indirect.length > 0) {
                    loadedMsg += '，已解析 ' + applied.resolution.direct.length + ' 个直接依赖';
                    if (applied.resolution.indirect.length > 0) {
                        loadedMsg += '、' + applied.resolution.indirect.length + ' 个间接依赖';
                    }
                } else if (applied.dependencyPaths && applied.dependencyPaths.length === 0) {
                    loadedMsg += '，该包未声明依赖，已清空本地依赖路径';
                }
                showToast(loadedMsg, 'positive', 5000);
                // 没全部解析出来时提示手动选择（放在加载成功提示之后，确保可见）
                if (applied.resolution.unresolved.length > 0) {
                    showToast(
                        buildUnresolvedMessage(applied.resolution.unresolved, applied.parentDir),
                        'warning', 12000
                    );
                }
                log.info('内容包已打开', { path: dirPath, namespace: applied.namespace, id: meta.id });

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
