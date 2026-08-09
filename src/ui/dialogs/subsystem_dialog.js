/**
 * subsystem_dialog.js — 子系统型号查看对话框（只读）
 *
 * 内容定义本质是内容包 JSON 文件，可由作者直接编辑；本对话框仅提供查看：
 * 展示"有哪些子系统型号可用"（ID / 来源徽标 / 只读标记 / 统计条）。
 * 不提供创建 / 编辑 / 删除，不渲染定义详情。
 *
 * 子系统类型显示名统一来自 subsystem_types.js 的 displayName（如"发动机"），
 * 不再使用硬编码的 _getTypeDisplayName 映射表。
 *
 * 导出函数:
 *   showSubsystemManagerDialog(config) — 打开子系统型号查看对话框
 */

const { createLogger } = require('../../utils/logger.js');
const { showToast } = require('../../utils/notify.js');
const subsystem_manager = require('../../managers/subsystem_manager.js');
const subsystem_types = require('../../core/subsystem_types.js');
const { showDefinitionViewer } = require('../components/definition_viewer.js');

/** 模块日志 */
var log = createLogger('SubsystemDialog');

/**
 * 检查 config 对象是否有效
 * @param {Object} config - MM 项目配置
 * @returns {boolean} 有效返回 true
 */
function _isConfigValid(config) {
    return config && typeof config === 'object';
}

/**
 * 显示子系统型号查看对话框（只读）
 *
 * @param {Object} config - MM 项目配置
 */
function showSubsystemManagerDialog(config) {
    if (!_isConfigValid(config)) {
        showToast('配置不可用，请先打开项目', 'warning');
        return;
    }

    try {
        var subsystems = subsystem_manager.listSubsystems(config);

        // 附加子系统类型显示名（真源：subsystem_types.js）
        var items = subsystems.map(function (s) {
            var meta = subsystem_types.getTypeMeta(s.data && s.data.type);
            return {
                id: s.id,
                data: s.data,
                source: s.source,
                editable: s.editable,
                subLabel: meta ? meta.displayName : String((s.data && s.data.type) || ''),
            };
        });

        showDefinitionViewer({
            title: '查看子系统型号',
            items: items,
            hint: '子系统定义文件位于内容包 subsystems/ 目录下，可直接编辑 JSON 文件。',
        });
    } catch (e) {
        log.error('showSubsystemManagerDialog 失败', e);
        showToast('无法打开子系统型号查看器: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showSubsystemManagerDialog,
    };
}
