/**
 * projectile_manager.js — 投射物定义只读管理器
 *
 * 提供投射物定义的查询接口：
 *   - 列出所有可用投射物（合并内置包 + 依赖包 + 当前包）
 *
 * 投射物静态属性当前仅提供只读引用功能，不支持通过 UI 创建/编辑/删除。
 * 内容包作者可直接编辑 projectiles/ 目录下的 JSON 文件来定义投射物。
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
var log = createLogger('ProjectileManager');

/** 快捷 hasOwnProperty 调用 */
var hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

/** 定义类型常量 */
var DEF_TYPE = 'projectiles';

/**
 * 列出所有可用的投射物定义（合并内置包 + 依赖包 + 当前包）
 *
 * @param {Object|null} config - 项目配置对象
 * @returns {Array<{id: string, data: Object, source: string}>}
 *   投射物列表，config 为空时返回空数组
 */
function listProjectiles(config) {
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
            });
        }
    }

    log.info('listProjectiles: 共 ' + result.length + ' 个投射物');
    if (result.length > 0) {
        log.info('listProjectiles: 详情', result.map(function (r) { return r.id + '=' + r.source; }));
    }
    return result;
}

/**
 * 获取所有可用投射物的映射（用于下拉选择器）
 *
 * @param {Object|null} config - 项目配置对象
 * @returns {Object<string, Object>} 投射物定义映射 { projectileId: data }
 */
function getProjectileMap(config) {
    var merged = content_pack_manager.loadMergedDefs(config, DEF_TYPE);
    return merged.defs;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        listProjectiles,
        getProjectileMap,
    };
}
