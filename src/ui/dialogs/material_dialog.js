/**
 * material_dialog.js — 材料定义查看对话框（只读）
 *
 * 内容定义本质是内容包 JSON 文件，可由作者直接编辑；本对话框仅提供查看：
 * 展示"有哪些材料定义可用"（ID / 来源徽标 / 只读标记 / 统计条）。
 * 不提供创建 / 编辑 / 删除，不渲染定义详情。
 *
 * 导出函数:
 *   showMaterialManagerDialog(config) — 打开材料定义查看对话框
 */

const { createLogger } = require('../../utils/logger.js');
const { showToast } = require('../../utils/notify.js');
const material_manager = require('../../managers/material_manager.js');
const { showDefinitionViewer } = require('../components/definition_viewer.js');

/** 模块日志 */
var log = createLogger('MaterialDialog');

/**
 * 显示材料定义查看对话框（只读）
 *
 * @param {Object} config - 项目配置对象
 */
function showMaterialManagerDialog(config) {
    if (!config || typeof config !== 'object') {
        showToast('配置不可用，请先打开项目', 'warning');
        return;
    }

    try {
        var materials = material_manager.listMaterials(config);
        showDefinitionViewer({
            title: '查看材料定义',
            items: materials,
            hint: '材料定义文件位于内容包 materials/ 目录下，可直接编辑 JSON 文件。',
        });
    } catch (e) {
        log.error('showMaterialManagerDialog 失败', e);
        showToast('无法打开材料定义查看器: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showMaterialManagerDialog,
    };
}
