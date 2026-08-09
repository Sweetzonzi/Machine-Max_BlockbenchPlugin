/**
 * pack_common.js — 内容包对话框公共工具（从 pack_setup_dialog.js 拆出）
 */

/**
 * 依赖类型列表（Spark-Core DependencyType）
 */
var DEP_TYPES = ['hard', 'soft', 'override', 'conflict'];

/**
 * 依赖类型中文标签
 */
var DEP_TYPE_LABELS = {
    hard: '硬依赖 (必需)',
    soft: '软依赖 (可选)',
    override: '覆盖 (替换)',
    conflict: '冲突 (不兼容)',
};

/**
 * 检查 config 对象是否有效
 * @param {Object} config - MM 项目配置
 * @returns {boolean} 有效返回 true
 */
function isConfigValid(config) {
    return config && typeof config === 'object';
}

/**
 * 将字符串转为安全的文件夹名
 * 替换空格和非法字符为下划线，限制长度 64
 * @param {string} name - 原始名称
 * @returns {string} 安全文件夹名
 */
function sanitizeFolderName(name) {
    if (!name) return '';
    return String(name).replace(/[<>:"/\\|?*\s]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').substring(0, 64);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEP_TYPES,
        DEP_TYPE_LABELS,
        isConfigValid,
        sanitizeFolderName,
    };
}
