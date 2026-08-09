/**
 * definition_viewer.js — 通用只读定义查看器
 *
 * 以统一列表展示"有哪些定义可用"：ID / 来源徽标 / 只读标记 / 顶部统计条。
 * 无详情渲染、无 JSON 预览、无渲染器注册表——内容包 JSON 由作者直接编辑，
 * 查看器不承担内容展示职责。
 *
 * 供 5 个菜单入口共用：材料 / 连接点 / 子系统型号 / 投射物 / 控制组预设。
 *
 * 导出函数:
 *   showDefinitionViewer(options) — 打开定义查看器对话框
 *   options: {
 *     title: string,              // 对话框标题
 *     width?: number,             // 宽度（默认 640）
 *     height?: number,            // 高度（默认 480）
 *     items: Array<{              // 定义列表
 *       id: string,               //   定义 ID
 *       data?: Object,            //   定义原始数据（查看器不渲染）
 *       source: string,           //   来源（builtin | current | dependency:*）
 *       editable: boolean,        //   是否来自当前包（false 时显示只读标记）
 *       subLabel?: string,        //   可选副标签（如子系统类型显示名）
 *     }>,
 *     hint?: string,              // 底部提示文案（默认提示内容包 JSON 可编辑）
 *   }
 */

const { createLogger } = require('../../utils/logger.js');
const { escapeHtml, sourceLabel, sourceBadgeClass, sourceStatsHtml } = require('../../utils/html.js');

/** 模块日志 */
var log = createLogger('DefinitionViewer');

/**
 * 构建定义列表的 HTML 表格
 * @param {Array<{id: string, source: string, editable: boolean, subLabel?: string}>} items - 定义列表
 * @returns {string} HTML 字符串
 */
function _buildListHtml(items) {
    if (!items || items.length === 0) {
        return '<p class="mm-def-empty">（暂无定义）</p>';
    }

    var rows = '';
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var readonlyMark = item.editable
            ? ''
            : '<span class="mm-def-readonly">只读</span>';
        var subLabel = item.subLabel
            ? '<span class="mm-def-sublabel">' + escapeHtml(item.subLabel) + '</span>'
            : '';

        rows += '<tr>'
            + '<td class="mm-def-id-cell"><span class="mm-def-id">' + escapeHtml(item.id) + '</span>' + readonlyMark + '</td>'
            + '<td class="mm-def-source-cell"><span class="mm-badge ' + sourceBadgeClass(item.source) + '">' + sourceLabel(item.source) + '</span></td>'
            + '</tr>';
    }

    return '<div class="mm-def-list">'
        + '<table class="mm-def-table">'
        + '<thead><tr>'
        + '<th class="mm-def-th">定义 ID</th>'
        + '<th class="mm-def-th">来源</th>'
        + '</tr></thead>'
        + '<tbody>' + rows + '</tbody>'
        + '</table>'
        + '</div>';
}

/**
 * 打开通用只读定义查看器对话框
 * @param {Object} options - 见文件头注释
 */
function showDefinitionViewer(options) {
    var opts = options || {};
    var items = opts.items || [];

    var defaultHint = '定义文件位于内容包对应类型目录下（如 materials/、connectors/、subsystems/），可直接编辑 JSON 文件。';
    var hint = opts.hint !== undefined ? opts.hint : defaultHint;

    try {
        new Dialog({
            id: 'mm_definition_viewer',
            title: opts.title || '查看定义',
            width: opts.width || 640,
            height: opts.height || 480,
            lines: [
                sourceStatsHtml(items),
                _buildListHtml(items),
                '<p class="mm-def-hint">' + escapeHtml(hint) + '</p>',
            ],
            onConfirm: function () {
                this.hide();
            },
        }).show();
    } catch (e) {
        log.error('showDefinitionViewer 失败', e);
    }
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showDefinitionViewer,
    };
}
