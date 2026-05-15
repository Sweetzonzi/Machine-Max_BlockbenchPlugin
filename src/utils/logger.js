/**
 * 统一日志工具模块 — 为插件提供标准化的 Debug / Info / Warn / Error 日志
 *
 * 日志格式: [MM Logger] [级别] [模块名] 消息
 * Debug 日志仅在 DEBUG_ENABLED=true 时输出，避免生产环境噪音
 * Error 日志包含完整调用栈，便于定位问题
 */

/** 全局 Debug 开关 — 设为 false 可在生产构建中关闭所有 Debug 日志 */
const DEBUG_ENABLED = true;

/** 日志级别枚举 */
const LEVELS = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
};

/** 级别 → 控制台方法映射 */
const CONSOLE_METHODS = {
    [LEVELS.DEBUG]: 'log',
    [LEVELS.INFO]: 'log',
    [LEVELS.WARN]: 'warn',
    [LEVELS.ERROR]: 'error',
};

/**
 * 生成格式化的日志前缀
 */
function formatPrefix(level, module) {
    var prefix = '[MM]';
    if (module) prefix += '[' + module + ']';
    prefix += '[' + level + ']';
    return prefix;
}

/**
 * 核心日志方法
 * @param {string} level - 日志级别
 * @param {string} module - 模块名称
 * @param {string} message - 日志消息
 * @param {*} [extra] - 附加数据（可选）
 */
function log(level, module, message, extra) {
    var prefix = formatPrefix(level, module);
    var method = CONSOLE_METHODS[level] || 'log';

    if (extra !== undefined) {
        console[method](prefix, message, extra);
    } else {
        console[method](prefix, message);
    }
}

/**
 * 输出 Debug 日志（仅在 DEBUG_ENABLED 时生效）
 * @param {string} module - 模块名称
 * @param {string} message - 调试消息
 * @param {*} [extra] - 附加数据（可选）
 */
function debug(module, message, extra) {
    if (!DEBUG_ENABLED) return;
    log(LEVELS.DEBUG, module, message, extra);
}

/**
 * 输出 Info 日志
 * @param {string} module - 模块名称
 * @param {string} message - 信息消息
 * @param {*} [extra] - 附加数据（可选）
 */
function info(module, message, extra) {
    log(LEVELS.INFO, module, message, extra);
}

/**
 * 输出 Warn 日志
 * @param {string} module - 模块名称
 * @param {string} message - 警告消息
 * @param {*} [extra] - 附加数据（可选）
 */
function warn(module, message, extra) {
    log(LEVELS.WARN, module, message, extra);
}

/**
 * 输出 Error 日志（含调用栈）
 * @param {string} module - 模块名称
 * @param {string} message - 错误描述
 * @param {Error|*} [error] - 错误对象（可选），若提供则输出 stack
 */
function error(module, message, error) {
    var prefix = formatPrefix(LEVELS.ERROR, module);
    console.error(prefix, message);
    if (error) {
        if (error instanceof Error) {
            console.error(prefix, 'Stack:', error.stack);
        } else {
            console.error(prefix, 'Detail:', error);
        }
    }
}

/**
 * 创建一个带固定模块名的日志代理，方便模块内重复使用
 * @param {string} moduleName - 模块名称
 * @returns {{debug: Function, info: Function, warn: Function, error: Function}}
 *
 * 用法:
 *   var log = createLogger('Config');
 *   log.info('配置已加载');
 *   log.debug('配置详情', config);
 *   log.error('加载失败', err);
 */
function createLogger(moduleName) {
    return {
        debug: function (message, extra) { debug(moduleName, message, extra); },
        info: function (message, extra) { info(moduleName, message, extra); },
        warn: function (message, extra) { warn(moduleName, message, extra); },
        error: function (message, err) { error(moduleName, message, err); },
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEBUG_ENABLED,
        debug,
        info,
        warn,
        error,
        createLogger,
    };
}
