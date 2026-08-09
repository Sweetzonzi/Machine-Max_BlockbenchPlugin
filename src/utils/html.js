/**
 * html.js — HTML 工具函数（共用）
 *
 * 收敛各对话框重复实现的 HTML 转义、来源映射与来源统计逻辑。
 * 原 4 份 _escapeHtml、4 份来源映射（_sourceLabel/_getSourceLabel/内联）统一入口。
 */

// =============================================================================
// 转义
// =============================================================================

/**
 * 转义 HTML 特殊字符，防止 XSS
 * @param {*} str - 任意输入
 * @returns {string} 转义后的 HTML 安全字符串
 */
function escapeHtml(str) {
    if (typeof str !== 'string') return String(str == null ? '' : str);
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// =============================================================================
// 来源映射（内置 / 依赖 / 当前 / 未知）
// =============================================================================

/** 来源标识判定 */
function isBuiltin(source) {
    return source === 'builtin';
}

function isDependency(source) {
    return !!source && source.indexOf('dependency:') === 0;
}

function isCurrent(source) {
    return source === 'current';
}

/**
 * 将来源标识映射为中文显示标签
 * @param {string} source - 来源标识（'builtin' | 'current' | 'dependency:*'）
 * @returns {string} 中文标签
 */
function sourceLabel(source) {
    if (isBuiltin(source)) return '内置';
    if (isDependency(source)) return '依赖';
    if (isCurrent(source)) return '当前';
    return '未知';
}

/**
 * 获取来源对应的徽标 CSS 颜色
 * @param {string} source - 来源标识
 * @returns {string} CSS 颜色值
 */
function sourceColor(source) {
    if (isBuiltin(source)) return '#888';
    if (isDependency(source)) return '#2196F3';
    if (isCurrent(source)) return '#4CAF50';
    return '#888';
}

/**
 * 获取来源对应的 mm- 徽标样式类名
 * @param {string} source - 来源标识
 * @returns {string} CSS 类名
 */
function sourceBadgeClass(source) {
    if (isBuiltin(source)) return 'mm-badge-builtin';
    if (isDependency(source)) return 'mm-badge-dependency';
    if (isCurrent(source)) return 'mm-badge-current';
    return 'mm-badge-unknown';
}

// =============================================================================
// 来源统计
// =============================================================================

/**
 * 统计一组定义项的来源分布
 * @param {Array<{source: string}>} items - 定义列表项
 * @returns {{builtin: number, dependency: number, current: number, unknown: number}}
 */
function sourceStats(items) {
    var stats = { builtin: 0, dependency: 0, current: 0, unknown: 0 };
    if (!items) return stats;
    for (var i = 0; i < items.length; i++) {
        var source = items[i].source;
        if (isBuiltin(source)) stats.builtin++;
        else if (isDependency(source)) stats.dependency++;
        else if (isCurrent(source)) stats.current++;
        else stats.unknown++;
    }
    return stats;
}

/**
 * 构建来源统计条 HTML（内置/依赖/当前 三色圆点计数）
 * @param {Array<{source: string}>} items - 定义列表项
 * @returns {string} HTML 片段
 */
function sourceStatsHtml(items) {
    var stats = sourceStats(items);
    return '<div class="mm-def-stats">'
        + '<span class="mm-def-stat"><span class="mm-dot mm-dot-builtin"></span>内置: ' + stats.builtin + '</span>'
        + '<span class="mm-def-stat"><span class="mm-dot mm-dot-dependency"></span>依赖: ' + stats.dependency + '</span>'
        + '<span class="mm-def-stat"><span class="mm-dot mm-dot-current"></span>当前: ' + stats.current + '</span>'
        + '<span class="mm-def-stat">共 ' + (items ? items.length : 0) + ' 项</span>'
        + '</div>';
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        escapeHtml,
        isBuiltin,
        isDependency,
        isCurrent,
        sourceLabel,
        sourceColor,
        sourceBadgeClass,
        sourceStats,
        sourceStatsHtml,
    };
}
