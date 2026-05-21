/**
 * subsystem_manager.js — 子系统定义 CRUD 管理器
 *
 * 为子系统定义提供内容包级 CRUD 操作接口：
 *   - 列出所有可用子系统定义（合并内置包 + 依赖包 + 当前包）
 *   - 创建/更新/删除当前内容包中的子系统定义
 *   - 查询子系统类型列表和类型特有字段
 *
 * 设计原则:
 *   - 写操作仅影响当前内容包（config.contentPackPath）
 *   - 读操作使用 content_pack_manager 的合并视图
 *   - 来源为 'builtin' 或 'dependency:N' 的定义不可编辑
 *   - 不导入 config.js 或 persistence.js
 *
 * 依赖:
 *   - content_pack.js（磁盘 I/O：writeDef / deleteDef / openContentPack）
 *   - content_pack_manager.js（合并视图 + 可编辑性判断 + 缓存失效）
 *   - subsystem_generator.js（子系统类型枚举 + 类型特有字段定义）
 */

const content_pack = require('../core/content_pack.js');
const content_pack_manager = require('../core/content_pack_manager.js');
const { getTypeSpecificFields } = require('../generators/subsystem_generator.js');
const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('SubsystemManager');

/** 快捷 hasOwnProperty 调用 */
var hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

/** 子系统定义类型常量 */
var DEF_TYPE = 'subsystems';

/**
 * 获取当前内容包的信息（路径 + namespace）
 * @param {Object} config - 项目配置对象，需包含 contentPackPath 字段
 * @returns {{packDir: string, namespace: string, error: string|null}}
 */
function getCurrentPackInfo(config) {
    var packDir, openResult;

    if (!config || !config.contentPackPath || typeof config.contentPackPath !== 'string' || config.contentPackPath.trim() === '') {
        return { packDir: '', namespace: '', error: '未设置当前内容包路径' };
    }

    packDir = config.contentPackPath;
    openResult = content_pack.openContentPack(packDir);
    if (!openResult.valid) {
        return { packDir: packDir, namespace: '', error: '当前内容包无效: ' + openResult.error };
    }

    return { packDir: packDir, namespace: openResult.namespace, error: null };
}

// =============================================================================
// 公开 API
// =============================================================================

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

    log.info('listSubsystems: 共 ' + result.length + ' 个子系统定义');
    if (result.length > 0) {
        log.info('listSubsystems: 详情', result.map(function (r) { return r.id + '=' + r.source; }));
    } else {
        log.warn('listSubsystems: 未找到任何子系统定义，defs keys=' + Object.keys(defs).join(',') + ', sources keys=' + Object.keys(sources).join(','));
    }
    return result;
}

/**
 * 在当前内容包中创建新的子系统定义
 *
 * 写入 {contentPackPath}/{namespace}/subsystems/{id}.json，
 * 创建成功后将自动使 content_pack_manager 缓存失效。
 *
 * @param {Object|null} config - 项目配置对象，需包含 contentPackPath
 * @param {string} id - 子系统定义 ID（文件名，不含扩展名）
 * @param {Object} data - 子系统定义数据（完整的 subsystem JSON 对象）
 * @returns {{success: boolean, error: string|null}} 操作结果
 */
function createSubsystem(config, id, data) {
    var packInfo, ns, lookupId, q;

    if (!id || typeof id !== 'string') {
        return { success: false, error: '子系统 ID 无效' };
    }

    packInfo = getCurrentPackInfo(config);
    if (packInfo.error) {
        return { success: false, error: packInfo.error };
    }

    // 归一化：用户输入的裸 ID 转为完整 resource location
    ns = packInfo.namespace;
    lookupId = id.indexOf(':') >= 0 ? id : ns + ':' + id;

    // 冲突检测
    try {
        q = content_pack_manager.resolveDefSource(config, DEF_TYPE, lookupId);
        if (q === 'current') {
            return { success: false, error: '子系统定义 "' + lookupId + '" 已存在，请使用更新操作' };
        }
        if (q && q.indexOf('dependency:') === 0) {
            return { success: false, error: '不能覆盖依赖包中的子系统定义 "' + lookupId + '"' };
        }
    } catch (e) {
        log.warn('createSubsystem: resolveDefSource 异常，跳过冲突检测', e);
    }

    try {
        content_pack.writeDef(packInfo.packDir, packInfo.namespace, DEF_TYPE, id, data);
        content_pack_manager.invalidateCache();
        log.info('createSubsystem: 已创建子系统定义 ' + lookupId);
        return { success: true, error: null };
    } catch (e) {
        log.error('createSubsystem: 写入失败', e);
        return { success: false, error: e.message };
    }
}

/**
 * 更新当前内容包中的子系统定义
 *
 * 仅当定义来源为 'current'（当前包）时可编辑。
 * 内置包和依赖包中的定义不可修改。
 *
 * @param {Object|null} config - 项目配置对象，需包含 contentPackPath
 * @param {string} id - 子系统定义 ID
 * @param {Object} data - 更新后的子系统定义数据
 * @returns {{success: boolean, error: string|null}} 操作结果
 */
function updateSubsystem(config, id, data) {
    var packInfo;

    if (!id || typeof id !== 'string') {
        return { success: false, error: '子系统 ID 无效' };
    }

    if (!content_pack_manager.isDefEditable(config, DEF_TYPE, id)) {
        log.warn('updateSubsystem: 子系统 ' + id + ' 不可编辑');
        return { success: false, error: '子系统定义 ' + id + ' 不可编辑（来自内置包或依赖包）' };
    }

    packInfo = getCurrentPackInfo(config);
    if (packInfo.error) {
        return { success: false, error: packInfo.error };
    }

    try {
        content_pack.writeDef(packInfo.packDir, packInfo.namespace, DEF_TYPE, id, data);
        content_pack_manager.invalidateCache();
        log.info('updateSubsystem: 已更新子系统定义 ' + id);
        return { success: true, error: null };
    } catch (e) {
        log.error('updateSubsystem: 写入失败', e);
        return { success: false, error: e.message };
    }
}

/**
 * 从当前内容包中删除子系统定义
 *
 * 仅当定义来源为 'current'（当前包）时可删除。
 * 内置包和依赖包中的定义不可删除。
 *
 * @param {Object|null} config - 项目配置对象，需包含 contentPackPath
 * @param {string} id - 子系统定义 ID
 * @returns {{success: boolean, error: string|null}} 操作结果
 */
function deleteSubsystem(config, id) {
    var packInfo;

    if (!id || typeof id !== 'string') {
        return { success: false, error: '子系统 ID 无效' };
    }

    if (!content_pack_manager.isDefEditable(config, DEF_TYPE, id)) {
        log.warn('deleteSubsystem: 子系统 ' + id + ' 不可删除');
        return { success: false, error: '子系统定义 ' + id + ' 不可删除（来自内置包或依赖包）' };
    }

    packInfo = getCurrentPackInfo(config);
    if (packInfo.error) {
        return { success: false, error: packInfo.error };
    }

    try {
        content_pack.deleteDef(packInfo.packDir, packInfo.namespace, DEF_TYPE, id);
        content_pack_manager.invalidateCache();
        log.info('deleteSubsystem: 已删除子系统定义 ' + id);
        return { success: true, error: null };
    } catch (e) {
        log.error('deleteSubsystem: 删除失败', e);
        return { success: false, error: e.message };
    }
}

/**
 * 获取所有子系统类型 ID 列表
 *
 * 以 subsystem_generator.js 的 getTypeSpecificFields() 内部字段表为唯一真源，
 * 返回完整的 "machine_max:*" 类型 ID 数组（共 20 种类型）。
 *
 * @returns {string[]} 子系统类型 ID 数组
 */
function getSubsystemTypes() {
    var types = [
        'machine_max:engine',
        'machine_max:motor',
        'machine_max:gearbox',
        'machine_max:wheel_driver',
        'machine_max:seat',
        'machine_max:car_controller',
        'machine_max:motorbike_controller',
        'machine_max:transmission',
        'machine_max:lighting',
        'machine_max:item_storage',
        'machine_max:motor_controller',
        'machine_max:basic',
        'machine_max:battery',
        'machine_max:joint',
        'machine_max:signal_convert',
        'machine_max:camera',
        'machine_max:javascript',
        'machine_max:turret',
        'machine_max:fire_controller',
        'machine_max:launcher',
    ];

    log.debug('getSubsystemTypes: 共 ' + types.length + ' 种类型');
    return types.slice();
}

/**
 * 获取指定子系统类型的特有字段键列表
 *
 * 委托调用 subsystem_generator.getTypeSpecificFields(type)，
 * 返回该类型在生成 JSON 时需要输出的特有字段名数组。
 * 未知类型返回空数组。
 *
 * @param {string} type - 子系统类型 ID，格式 "machine_max:xxx"
 * @returns {string[]} 字段键名数组
 *
 * 示例:
 *   getTypeFields('machine_max:engine')
 *   → ['definition', 'power_output', 'speed_outputs']
 */
function getTypeFields(type) {
    var fields = getTypeSpecificFields(type);
    log.debug('getTypeFields: 类型 ' + type + ' 有 ' + fields.length + ' 个特有字段');
    return fields;
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        listSubsystems,
        createSubsystem,
        updateSubsystem,
        deleteSubsystem,
        getSubsystemTypes,
        getTypeFields,
    };
}
