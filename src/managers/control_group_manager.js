/**
 * control_group_manager.js — 控制组预设只读管理器
 *
 * 提供控制组预设的查询接口：
 *   - 列出所有可用控制组预设（合并内置包 + 依赖包 + 当前包）
 *
 * 控制组预设当前仅提供只读查看功能，不支持通过 UI 创建/编辑/删除。
 * 内容包作者可直接编辑 control_groups/ 目录下的 JSON 文件来定义预设。
 *
 * 设计原则:
 *   - 读操作使用 content_pack_manager 的合并视图
 *   - 不导入 config.js 或 persistence.js
 *
 * 依赖:
 *   - content_pack_manager.js（合并视图）
 */

const content_pack_manager = require('../core/content_pack_manager.js');
const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('ControlGroupManager');

/** 快捷 hasOwnProperty 调用 */
var hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

/** 定义类型常量 */
var DEF_TYPE = 'control_groups';

/**
 * 列出所有可用的控制组预设（合并内置包 + 依赖包 + 当前包）
 *
 * @param {Object|null} config - 项目配置对象
 * @returns {Array<{id: string, data: Object, source: string, editable: boolean}>}
 *   预设列表，config 为空时返回空数组
 */
function listControlGroups(config) {
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
                editable: false,
            });
        }
    }

    log.info('listControlGroups: 共 ' + result.length + ' 个控制组预设');
    if (result.length > 0) {
        log.info('listControlGroups: 详情', result.map(function (r) { return r.id + '=' + r.source; }));
    }
    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        listControlGroups,
    };
}
