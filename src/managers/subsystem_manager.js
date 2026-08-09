/**
 * subsystem_manager.js — 子系统定义只读管理器
 *
 * 提供子系统定义的查询接口：
 *   - 列出所有可用子系统定义（合并内置包 + 依赖包 + 当前包）
 *
 * 子系统定义不再通过 UI 创建/编辑/删除（对话框已降级为只读查看），
 * 内容包作者可直接编辑 subsystems/ 目录下的 JSON 文件。
 * 子系统类型枚举与类型特有字段统一以 subsystem_types.js 为唯一真源。
 *
 * 设计原则:
 *   - 读操作使用 content_pack_manager 的合并视图
 *   - 不导入 config.js 或 persistence.js
 *
 * 依赖:
 *   - content_pack_manager.js（合并视图 + 可编辑性判断）
 */

const content_pack_manager = require('../core/content_pack_manager.js');
const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('SubsystemManager');

/** 快捷 hasOwnProperty 调用 */
var hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

/** 子系统定义类型常量 */
var DEF_TYPE = 'subsystems';

/**
 * 列出所有可用的子系统定义（合并内置包 + 依赖包 + 当前包）
 *
 * @param {Object|null} config - 项目配置对象，需包含 contentPackPath 和 dependencyPaths
 * @returns {Array<{id: string, data: Object, source: string, editable: boolean}>}
 *   子系统定义列表，config 为空时返回空数组
 */
function listSubsystems(config) {
    var merged, defs, sources, result, id;

    merged = content_pack_manager.loadMergedDefs(config, DEF_TYPE);
    defs = merged.defs;
    sources = merged.sources;
    result = [];

    for (id in defs) {
        if (hasOwn(defs, id)) {
            result.push({
                id: id,
                data: defs[id],
                source: sources[id] || 'unknown',
                editable: sources[id] === 'current',
            });
        }
    }

    log.debug('listSubsystems: 共 ' + result.length + ' 个子系统定义');
    return result;
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        listSubsystems,
    };
}
