/**
 * projectile_dialog.js — 投射物定义查看对话框（只读）
 *
 * 展示"有哪些投射物定义可用"（ID / 来源徽标 / 只读标记 / 统计条）。
 * 无详情渲染、无 JSON 预览——内容包 JSON 由作者直接编辑。
 *
 * 导出函数:
 *   showProjectileManagerDialog(config) — 打开投射物定义查看对话框
 */

const { createLogger } = require('../../utils/logger.js');
const { showToast } = require('../../utils/notify.js');
const projectile_manager = require('../../managers/projectile_manager.js');
const { showDefinitionViewer } = require('../components/definition_viewer.js');

/** 模块日志 */
var log = createLogger('ProjectileDialog');

/**
 * 显示投射物定义查看对话框（只读）
 *
 * @param {Object} config - 项目配置对象
 */
function showProjectileManagerDialog(config) {
    if (!config || typeof config !== 'object') {
        showToast('配置不可用，请先打开项目', 'warning');
        return;
    }

    try {
        var projectiles = projectile_manager.listProjectiles(config);
        showDefinitionViewer({
            title: '查看投射物定义',
            items: projectiles,
            hint: '投射物定义文件位于内容包 projectiles/ 目录下，可直接编辑 JSON 文件。',
        });
    } catch (e) {
        log.error('showProjectileManagerDialog 失败', e);
        showToast('无法打开投射物定义查看器: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showProjectileManagerDialog,
    };
}
