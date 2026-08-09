/**
 * connector_dialog.js — 连接点定义查看对话框（只读）
 *
 * 内容定义本质是内容包 JSON 文件，可由作者直接编辑；本对话框仅提供查看：
 * 展示"有哪些连接点定义可用"（ID / 来源徽标 / 只读标记 / 统计条）。
 * 不提供创建 / 编辑 / 删除，不渲染定义详情。
 *
 * 导出函数:
 *   showConnectorManagerDialog(config) — 打开连接点定义查看对话框
 */

const { createLogger } = require('../../utils/logger.js');
const { showToast } = require('../../utils/notify.js');
const connector_manager = require('../../managers/connector_manager.js');
const { showDefinitionViewer } = require('../components/definition_viewer.js');

/** 模块日志 */
var log = createLogger('ConnectorDialog');

/**
 * 检查 config 对象是否有效
 * @param {Object} config - MM 项目配置
 * @returns {boolean} 有效返回 true
 */
function _isConfigValid(config) {
    return config && typeof config === 'object';
}

/**
 * 显示连接点定义查看对话框（只读）
 *
 * @param {Object} config - MM 项目配置
 */
function showConnectorManagerDialog(config) {
    if (!_isConfigValid(config)) {
        showToast('配置不可用，请先打开项目', 'warning');
        return;
    }

    try {
        var connectors = connector_manager.listConnectors(config);
        showDefinitionViewer({
            title: '查看连接点定义',
            items: connectors,
            hint: '连接点定义文件位于内容包 connectors/ 目录下，可直接编辑 JSON 文件。',
        });
    } catch (e) {
        log.error('showConnectorManagerDialog 失败', e);
        showToast('无法打开连接点定义查看器: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showConnectorManagerDialog,
    };
}
