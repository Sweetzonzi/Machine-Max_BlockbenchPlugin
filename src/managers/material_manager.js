/**
 * material_manager.js — 材料定义只读管理器
 *
 * 提供材料（materials）定义的查询接口：
 *   - 列出所有可用材料定义（合并内置包 + 依赖包 + 当前包）
 *
 * 材料定义不再通过 UI 创建/编辑/删除（对话框已降级为只读查看），
 * 内容包作者可直接编辑 materials/ 目录下的 JSON 文件。
 *
 * 设计原则:
 *   - 纯管理器层：不直接操作磁盘，通过 content_pack_manager 代理
 *   - 无 Vue 依赖：仅使用纯 JavaScript 对象
 */

var content_pack_manager = require('../core/content_pack_manager.js');
var { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('MaterialManager');

/**
 * 列出所有可用材料定义（含来源和可编辑性元信息）
 *
 * 从合并后的多包定义中提取材料列表，每条记录包含定义数据和来源跟踪信息，
 * 供 UI 面板（如 HitBoxPanel）渲染材料下拉列表时使用。
 *
 * @param {Object|null} config - 项目配置对象
 * @returns {Array<{id: string, data: Object, source: string, editable: boolean}>} 材料列表
 */
function listMaterials(config) {
    var merged, ids, result, i, id;
    merged = content_pack_manager.loadMergedDefs(config, 'materials');
    ids = Object.keys(merged.defs);
    result = [];

    for (i = 0; i < ids.length; i++) {
        id = ids[i];
        result.push({
            id: id,
            data: merged.defs[id],
            source: merged.sources[id],
            editable: content_pack_manager.isDefEditable(config, 'materials', id),
        });
    }

    log.debug('listMaterials: 共 ' + result.length + ' 个材料');
    return result;
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        listMaterials,
    };
}
