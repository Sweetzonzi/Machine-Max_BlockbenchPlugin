/**
 * 通知工具 — 封装 Blockbench.showToastNotification
 *
 * Blockbench 的 Toast API 是 showToastNotification(options)，
 * 它使用 options 对象（text, color, expire, icon, click），
 * 而非 showToast(text, type) 这种简化形式。
 *
 * 此模块提供与原来 showToast 类似的简洁接口。
 */
const { createLogger } = require('./logger.js');

/** 模块日志 */
var log = createLogger('Notify');

const TOAST_COLORS = {
    positive: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
};

/**
 * 显示 Toast 通知
 * @param {string} text - 通知文本
 * @param {'positive'|'error'|'warning'|'info'} type - 通知类型
 * @param {number} expire - 自动消失时间（毫秒），默认 3000
 */
function showToast(text, type, expire) {
    const color = TOAST_COLORS[type] || TOAST_COLORS.info;
    try {
        Blockbench.showToastNotification({
            text: String(text),
            color: color,
            expire: expire || 3000,
        });
    } catch (e) {
        log.error('Toast 通知失败', e);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { showToast, TOAST_COLORS };
}
