/**
 * material_manager.js — 材料定义资源管理器
 *
 * 提供材料（materials）定义的标准 CRUD 操作，确保：
 * - 写入始终针对当前内容包（config.contentPackPath）
 * - 不能修改内置包或依赖包中的只读材料
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

/**
 * 创建新的材料定义（写入当前内容包）
 *
 * 在写入前进行冲突检测：
 * - 若 ID 已在当前包中存在（source === 'current'），应使用 updateMaterial
 * - 若 ID 在依赖包中存在（source 以 'dependency:' 开头），不可覆盖依赖包定义
 * - 若 ID 仅在内置包中存在（source === 'builtin'），允许覆盖（写入当前包）
 * - 若 ID 不存在（source === null），正常创建
 *
 * @param {Object} config - 项目配置对象（必须包含 contentPackPath）
 * @param {string} id - 材料定义 ID
 * @param {Object} data - 材料定义数据
 * @throws {Error} 未关联内容包、ID 冲突或写入失败
 */
function createMaterial(config, id, data) {
    if (!config || !config.contentPackPath) {
        throw new Error('当前没有关联的内容包，无法创建材料');
    }

    // 获取当前包 namespace，用于 ID 归一化
    var meta = content_pack.readPackMeta(config.contentPackPath);
    if (!meta) {
        throw new Error('无法读取内容包 meta.json: ' + config.contentPackPath);
    }
    var ns = content_pack.resolveNamespace(meta.id);
    if (!ns) {
        throw new Error('无法从 meta.id 解析 namespace: ' + meta.id);
    }

    // 归一化：用户输入的裸 ID（如 "steel"）转为完整 resource location（如 "machine_max:steel"）
    var lookupId = id.indexOf(':') >= 0 ? id : ns + ':' + id;

    // 冲突检测
    var source = content_pack_manager.resolveDefSource(config, 'materials', lookupId);

    if (source === 'current') {
        throw new Error('材料 "' + lookupId + '" 已存在，请使用更新操作');
    }
    if (source && source.indexOf('dependency:') === 0) {
        throw new Error('不能覆盖依赖包中的材料 "' + lookupId + '"');
    }

    content_pack.writeDef(config.contentPackPath, ns, 'materials', id, data);
    content_pack_manager.invalidateCache();
    log.info('createMaterial: 已创建材料 "' + lookupId + '"');
}

/**
 * 更新已有的材料定义（仅限当前内容包中的材料）
 *
 * 通过 isDefEditable 检查确保只能修改 source === 'current' 的定义。
 * 内置包和依赖包中的材料为只读，不可更新。
 *
 * @param {Object} config - 项目配置对象
 * @param {string} id - 材料定义 ID
 * @param {Object} data - 新的材料定义数据
 * @throws {Error} 材料不可编辑或写入失败
 */
function updateMaterial(config, id, data) {
    if (!content_pack_manager.isDefEditable(config, 'materials', id)) {
        throw new Error('不能修改内置或依赖包的材料 "' + id + '"');
    }

    // 获取当前包 namespace
    var meta = content_pack.readPackMeta(config.contentPackPath);
    if (!meta) {
        throw new Error('无法读取内容包 meta.json: ' + config.contentPackPath);
    }
    var ns = content_pack.resolveNamespace(meta.id);
    if (!ns) {
        throw new Error('无法从 meta.id 解析 namespace: ' + meta.id);
    }

    content_pack.writeDef(config.contentPackPath, ns, 'materials', id, data);
    content_pack_manager.invalidateCache();
    log.info('updateMaterial: 已更新材料 "' + id + '"');
}

/**
 * 删除材料定义（仅限当前内容包中的材料）
 *
 * 通过 isDefEditable 检查确保只能删除 source === 'current' 的定义。
 * 内置包和依赖包中的材料为只读，不可删除。
 *
 * @param {Object} config - 项目配置对象
 * @param {string} id - 要删除的材料定义 ID
 * @throws {Error} 材料不可删除或操作失败
 */
function deleteMaterial(config, id) {
    if (!content_pack_manager.isDefEditable(config, 'materials', id)) {
        throw new Error('不能删除内置或依赖包的材料 "' + id + '"');
    }

    // 获取当前包 namespace
    var meta = content_pack.readPackMeta(config.contentPackPath);
    if (!meta) {
        throw new Error('无法读取内容包 meta.json: ' + config.contentPackPath);
    }
    var ns = content_pack.resolveNamespace(meta.id);
    if (!ns) {
        throw new Error('无法从 meta.id 解析 namespace: ' + meta.id);
    }

    content_pack.deleteDef(config.contentPackPath, ns, 'materials', id);
    content_pack_manager.invalidateCache();
    log.info('deleteMaterial: 已删除材料 "' + id + '"');
}

/**
 * 获取默认材料 ID（可用材料列表中的第一个）
 *
 * 用于面板中初始化默认选择（如 HitBox 面板首次渲染时的默认材料）。
 *
 * @param {Object|null} config - 项目配置对象
 * @returns {string|null} 第一个材料定义的 ID，无可用材料时返回 null
 */
function getDefaultMaterialId(config) {
    return content_pack_manager.getFirstDefId(config, 'materials');
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        listMaterials,
        createMaterial,
        updateMaterial,
        deleteMaterial,
        getDefaultMaterialId,
    };
}
