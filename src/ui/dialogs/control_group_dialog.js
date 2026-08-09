/**
 * control_group_dialog.js — 控制组预设查看对话框（只读）
 *
 * 展示"有哪些控制组预设可用"（ID / 来源徽标 / 只读标记 / 统计条）。
 * 无详情渲染、无 JSON 预览——内容包 JSON 由作者直接编辑。
 *
 * 导出函数:
 *   showControlGroupManagerDialog(config) — 打开控制组预设查看对话框
 */

const { createLogger } = require('../../utils/logger.js');
const { showToast } = require('../../utils/notify.js');
const control_group_manager = require('../../managers/control_group_manager.js');
const { showDefinitionViewer } = require('../components/definition_viewer.js');

/** 模块日志 */
var log = createLogger('ControlGroupDialog');

/**
 * 显示控制组预设查看对话框（只读）
 *
 * @param {Object} config - 项目配置对象
 */
function showControlGroupManagerDialog(config) {
    if (!config || typeof config !== 'object') {
        showToast('配置不可用，请先打开项目', 'warning');
        return;
    }

    try {
        var presets = control_group_manager.listControlGroups(config);
        showDefinitionViewer({
            title: '查看控制组预设',
            items: presets,
            hint: '控制组预设定义文件位于内容包 control_groups/ 目录下，可直接编辑 JSON 文件。',
        });
    } catch (e) {
        log.error('showControlGroupManagerDialog 失败', e);
        showToast('无法打开控制组预设查看器: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showControlGroupManagerDialog,
    };
}
