/**
 * connector_manager.js — 连接器定义资源管理器
 *
 * 提供连接器（connectors）定义的标准 CRUD 操作，确保：
 * - 写入始终针对当前内容包（config.contentPackPath）
 * - 不能修改内置包或依赖包中的只读连接器
 * - 操作后自动失效合并层缓存
 *
 * 设计原则:
 * - 纯管理器层：不直接操作磁盘，通过 content_pack 和 content_pack_manager 代理
 * - 无 Vue 依赖：仅使用纯 JavaScript 对象
 * - 所有错误通过 throw 抛出，由调用方 UI 层处理
 */

var content_pack = require('../core/content_pack.js');
var content_pack_manager = require('../core/content_pack_manager.js');
var { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('ConnectorManager');

/**
 * 列出所有可用连接器定义（含来源和可编辑性元信息）
 *
 * 从合并后的多包定义中提取连接器列表，每条记录包含定义数据和来源跟踪信息，
 * 供 UI 面板渲染连接器下拉列表时使用。
 *
 * @param {Object|null} config - 项目配置对象
 * @returns {Array<{id: string, data: Object, source: string, editable: boolean}>} 连接器列表
 */
function listConnectors(config) {
    var merged, ids, result, i, id;
    merged = content_pack_manager.loadMergedDefs(config, 'connectors');
    ids = Object.keys(merged.defs);
    result = [];

    for (i = 0; i < ids.length; i++) {
        id = ids[i];
        result.push({
            id: id,
            data: merged.defs[id],
            source: merged.sources[id],
            editable: content_pack_manager.isDefEditable(config, 'connectors', id),
        });
    }

    log.info('listConnectors: 共 ' + result.length + ' 个连接器');
    log.info('listConnectors: 来源分布', result.map(function (r) { return r.id + '=' + r.source; }));
    return result;
}

/**
 * 创建新的连接器定义（写入当前内容包）
 *
 * 在写入前进行冲突检测：
 * - 若 ID 已在当前包中存在（source === 'current'），应使用 updateConnector
 * - 若 ID 在依赖包中存在（source 以 'dependency:' 开头），不可覆盖依赖包定义
 * - 若 ID 仅在内置包中存在（source === 'builtin'），允许覆盖（写入当前包）
 * - 若 ID 不存在（source === null），正常创建
 *
 * @param {Object} config - 项目配置对象（必须包含 contentPackPath）
 * @param {string} id - 连接器定义 ID
 * @param {Object} data - 连接器定义数据
 * @throws {Error} 未关联内容包、ID 冲突或写入失败
 */
function createConnector(config, id, data) {
    var source, meta, ns, lookupId;

    if (!config || !config.contentPackPath) {
        throw new Error('当前没有关联的内容包，无法创建连接器');
    }

    // 获取当前包 namespace，用于 ID 归一化
    meta = content_pack.readPackMeta(config.contentPackPath);
    if (!meta) {
        throw new Error('无法读取内容包 meta.json: ' + config.contentPackPath);
    }
    ns = content_pack.resolveNamespace(meta.id);
    if (!ns) {
        throw new Error('无法从 meta.id 解析 namespace: ' + meta.id);
    }

    // 归一化：用户输入的裸 ID（如 "fixed_front"）转为完整 resource location（如 "machine_max:fixed_front"）
    lookupId = id.indexOf(':') >= 0 ? id : ns + ':' + id;

    // 冲突检测
    source = content_pack_manager.resolveDefSource(config, 'connectors', lookupId);

    if (source === 'current') {
        throw new Error('连接器 "' + lookupId + '" 已存在，请使用更新操作');
    }
    if (source && source.indexOf('dependency:') === 0) {
        throw new Error('不能覆盖依赖包中的连接器 "' + lookupId + '"');
    }

    content_pack.writeDef(config.contentPackPath, ns, 'connectors', id, data);
    content_pack_manager.invalidateCache();
    log.info('createConnector: 已创建连接器 "' + lookupId + '"');
}

/**
 * 更新已有的连接器定义（仅限当前内容包中的连接器）
 *
 * 通过 isDefEditable 检查确保只能修改 source === 'current' 的定义。
 * 内置包和依赖包中的连接器为只读，不可更新。
 *
 * @param {Object} config - 项目配置对象
 * @param {string} id - 连接器定义 ID
 * @param {Object} data - 新的连接器定义数据
 * @throws {Error} 连接器不可编辑或写入失败
 */
function updateConnector(config, id, data) {
    var meta, ns;

    if (!content_pack_manager.isDefEditable(config, 'connectors', id)) {
        throw new Error('不能修改内置或依赖包的连接器 "' + id + '"');
    }

    // 获取当前包 namespace
    meta = content_pack.readPackMeta(config.contentPackPath);
    if (!meta) {
        throw new Error('无法读取内容包 meta.json: ' + config.contentPackPath);
    }
    ns = content_pack.resolveNamespace(meta.id);
    if (!ns) {
        throw new Error('无法从 meta.id 解析 namespace: ' + meta.id);
    }

    content_pack.writeDef(config.contentPackPath, ns, 'connectors', id, data);
    content_pack_manager.invalidateCache();
    log.info('updateConnector: 已更新连接器 "' + id + '"');
}

/**
 * 删除连接器定义（仅限当前内容包中的连接器）
 *
 * 通过 isDefEditable 检查确保只能删除 source === 'current' 的定义。
 * 内置包和依赖包中的连接器为只读，不可删除。
 *
 * @param {Object} config - 项目配置对象
 * @param {string} id - 要删除的连接器定义 ID
 * @throws {Error} 连接器不可删除或操作失败
 */
function deleteConnector(config, id) {
    var meta, ns;

    if (!content_pack_manager.isDefEditable(config, 'connectors', id)) {
        throw new Error('不能删除内置或依赖包的连接器 "' + id + '"');
    }

    // 获取当前包 namespace
    meta = content_pack.readPackMeta(config.contentPackPath);
    if (!meta) {
        throw new Error('无法读取内容包 meta.json: ' + config.contentPackPath);
    }
    ns = content_pack.resolveNamespace(meta.id);
    if (!ns) {
        throw new Error('无法从 meta.id 解析 namespace: ' + meta.id);
    }

    content_pack.deleteDef(config.contentPackPath, ns, 'connectors', id);
    content_pack_manager.invalidateCache();
    log.info('deleteConnector: 已删除连接器 "' + id + '"');
}

/**
 * 获取连接器类型列表
 *
 * Simple: 刚性连接，无关节
 * Advanced: 带关节的连接，支持 joint_attrs 物理参数
 *
 * @returns {string[]} 连接器类型数组
 */
function getConnectorTypes() {
    return ['Simple', 'Advanced'];
}

/**
 * 获取连接器方向列表（6轴方向标识符）
 *
 * xp/yp/zp: 正方向（positive）
 * xn/yn/zn: 负方向（negative）
 *
 * @returns {string[]} 方向标识符数组
 */
function getConnectorDirections() {
    return ['xp', 'yp', 'zp', 'xn', 'yn', 'zn'];
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        listConnectors,
        createConnector,
        updateConnector,
        deleteConnector,
        getConnectorTypes,
        getConnectorDirections,
    };
}
