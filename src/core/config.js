// 文件: src/core/config.js
// 用途: 配置工厂函数 + 版本迁移引擎 — 使用 Codec 驱动所有默认值
// 所属模块: MachineMax Blockbench 插件
//
// 数据流: constants.js(CONFIG_VERSION) + codec/* → 工厂 → persistence.js / mode/*
// 不依赖 config_defaults.js（子工厂默认值内联以保持旧 schema 兼容）

'use strict';

const { CONFIG_VERSION } = require('./constants.js');
const { PartCodec } = require('../codec/codecs/part_codec.js');
const { VariantCodec } = require('../codec/codecs/variant_codec.js');
const { SubPartCodec } = require('../codec/codecs/sub_part_codec.js');
const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('Config');

// ==================== 版本迁移 ====================

const MIGRATIONS = {
    2: function (v1config) {
        // v1 配置（无 $schema_version）或 v2→v3 迁移
        var v3 = v1config.project || v1config;
        v3.$schema_version = 3;
        v3.projectiles = v3.projectiles || {};
        v3.connector_defs = v3.connector_defs || {};
        v3.subsystem_defs = v3.subsystem_defs || {};
        v3.material_defs = v3.material_defs || {};
        log.info('MIGRATIONS: 配置从 v1→v3 迁移完成');
        return v3;
    },
    3: function (v3config) {
        // 移除旧版共享定义字段，添加内容包路径字段
        delete v3config.connector_defs;
        delete v3config.subsystem_defs;
        delete v3config.material_defs;
        delete v3config.projectiles;
        delete v3config.namespace;
        delete v3config.packMeta;
        v3config.contentPackPath = v3config.contentPackPath || '';
        v3config.dependencyPaths = v3config.dependencyPaths || [];
        v3config.$schema_version = 4;
        log.info('MIGRATIONS: 配置从 v3→v4 迁移完成');
        return v3config;
    },
};

// ==================== 子工厂默认值（内联，保持旧 schema 兼容） ====================
// 注意：HitBox/InteractBox/Connector/Subsystem 的 codec 定义使用新 schema
// （如 HitBoxCodec 的 shape 字段 vs 旧版的 id+type），与现有调用方不兼容。
// 因此这些子工厂的默认值直接内联自 config_defaults.js，避免破坏旧代码。

const HIT_BOX_DEFAULTS = {
    id: 'part',
    type: 'box',
    material: '',
    thickness: 1.0,
    condition: 'true',
};

const INTERACT_BOX_DEFAULTS = {
    bone: '',
    interact_mode: 'fast',
    condition: 'NOR',
    signal_targets: {},
};

/** 子系统实例基础默认值（不含类型专属字段） */
const SUBSYSTEM_INSTANCE_DEFAULTS = {
    type: '',
    definition: '',
};

/** 连接点实例完整默认值（含信号字段） */
const CONNECTOR_INSTANCE_DEFAULTS = {
    locator: '',
    definition: '',
    power_target: '',
    signal_translations: {},
    signal_targets: {},
    internal: false,
    overwrite: {},
};

// ==================== 工厂函数 ====================

/**
 * 创建空白的项目配置（顶层 MMProjectConfig）
 * _uiState 保留手写初始化（不可 codec 化——这些是运行时 UI 状态）
 */
function createBlankConfig() {
    log.debug('createBlankConfig: 创建空白配置，版本=' + CONFIG_VERSION);
    return {
        $schema_version: CONFIG_VERSION,
        modelFile: '',
        parts: {},
        contentPackPath: '',
        dependencyPaths: [],
        _uiState: {
            activeMode: 'part',
            activePartId: '',
            activeVariantName: '',
        },
    };
}

/**
 * 创建新的零件配置，使用 PartCodec.decode 填充字段默认值
 * @param {string} partId - 零件 ID
 * @param {string} [initialVariantName] - 初始变体名（可选）
 * @returns {Object} 填充了默认值的新零件配置
 */
function createPartConfig(partId, initialVariantName) {
    log.debug('createPartConfig: 创建零件配置', { partId: partId, variant: initialVariantName });
    var part = PartCodec.decode({ id: partId });

    if (initialVariantName) {
        part.variants[initialVariantName] = VariantCodec.decode({ model: '' });
    }

    return part;
}

/**
 * 创建新的变体配置，使用 VariantCodec.decode 填充字段默认值
 * @returns {Object} 填充了默认值的新变体配置
 */
function createVariantConfig() {
    log.debug('createVariantConfig: 创建变体配置');
    return VariantCodec.decode({ model: '' });
}

/**
 * 创建新的子零件配置，使用 SubPartCodec.decode 填充字段默认值
 * @returns {Object} 填充了默认值的新子零件配置
 */
function createSubPartConfig() {
    log.debug('createSubPartConfig: 创建子零件配置');
    return SubPartCodec.decode({});
}

/**
 * 创建新的碰撞箱配置（旧 schema，内联默认值）
 */
function createHitBoxConfig() {
    log.debug('createHitBoxConfig: 创建碰撞箱配置');
    return JSON.parse(JSON.stringify(HIT_BOX_DEFAULTS));
}

/**
 * 创建新的交互区配置（旧 schema，内联默认值）
 */
function createInteractBoxConfig() {
    log.debug('createInteractBoxConfig: 创建交互区配置');
    return JSON.parse(JSON.stringify(INTERACT_BOX_DEFAULTS));
}

/**
 * 创建新的子系统实例配置（旧 schema，内联默认值）
 * 类型专属字段的默认值由调用方按 type 从 subsystem_types.js 合并
 */
function createSubsystemConfig() {
    log.debug('createSubsystemConfig: 创建子系统配置');
    return JSON.parse(JSON.stringify(SUBSYSTEM_INSTANCE_DEFAULTS));
}

/**
 * 创建新的连接点实例配置（含信号字段，旧 schema，内联默认值）
 */
function createConnectorInstanceConfig() {
    log.debug('createConnectorInstanceConfig: 创建连接点实例配置');
    return JSON.parse(JSON.stringify(CONNECTOR_INSTANCE_DEFAULTS));
}

/**
 * 填充配置的缺失默认值：顶层字段用 createBlankConfig 合并，
 * 每个零件用 PartCodec.decode 填充 codec 定义的字段默认值
 *
 * 注意：PartCodec 的 variants 字段使用 either codec（单 variant 简写 vs map 展开），
 * either 的启发式检测会将非空的 variant map 误判为单个 variant 对象。
 * 因此处理时临时移除 variants，decode 完成后恢复。
 *
 * @param {Object} config - 要修复的配置
 * @returns {Object} 修复后的配置
 */
function ensureDefaults(config) {
    if (!config || typeof config !== 'object') {
        log.warn('ensureDefaults: 配置无效，返回空白配置');
        return createBlankConfig();
    }

    // 顶层字段的默认值合并（保持原有行为）
    var result = Object.assign({}, createBlankConfig(), config);

    if (!result.parts) result.parts = {};
    if (!result._uiState) {
        result._uiState = { activeMode: 'part', activePartId: '', activeVariantName: '' };
    }

    // 用 PartCodec.decode 填充每个零件的默认值
    // 临时移除 variants 以避免 either codec 对多 variant map 的启发式误判
    var partKeys, i, pk, part, savedVariants;
    partKeys = Object.keys(result.parts);
    for (i = 0; i < partKeys.length; i++) {
        pk = partKeys[i];
        part = result.parts[pk];
        // 保存原始 variants，避免 either codec 解析多 key map 时崩溃
        savedVariants = part.variants;
        delete part.variants;
        result.parts[pk] = PartCodec.decode(part);
        // 恢复多 variant 的原始 map（单 variant 简写同样安全，PartCodec.decode 已处理）
        if (savedVariants && typeof savedVariants === 'object' && Object.keys(savedVariants).length > 0) {
            result.parts[pk].variants = savedVariants;
        }
    }

    log.debug('ensureDefaults: 完成');
    log.debug('ensureDefaults: packMeta 状态', {
        hasPackMeta: 'packMeta' in result,
        packMetaType: typeof result.packMeta,
        packMetaKeys: result.packMeta ? Object.keys(result.packMeta) : [],
        name: result.packMeta ? result.packMeta.name : null,
        author: result.packMeta ? result.packMeta.author : null,
        description: result.packMeta ? result.packMeta.description : null,
    });
    return result;
}

/**
 * 检查配置版本，如果需要则进行迁移
 * 迁移完成后调用 ensureDefaults 填充新版本字段的默认值
 *
 * @param {Object} config - 原始配置
 * @returns {Object} 迁移并修复后的配置
 */
function migrateIfNeeded(config) {
    if (!config || !config.$schema_version) {
        log.info('migrateIfNeeded: 无版本号，应用默认值');
        return ensureDefaults(config);
    }

    var version = config.$schema_version;
    if (version === CONFIG_VERSION) {
        log.debug('migrateIfNeeded: 配置已是最新版本 v' + version);
        return ensureDefaults(config);
    }

    log.info('migrateIfNeeded: 配置需要迁移', { from: version, to: CONFIG_VERSION });
    var migrated = JSON.parse(JSON.stringify(config));
    var v;
    for (v = version; v < CONFIG_VERSION; v++) {
        if (MIGRATIONS[v]) {
            migrated = MIGRATIONS[v](migrated);
            log.debug('migrateIfNeeded: 迁移步骤 v' + v + ' 完成');
        }
    }
    return ensureDefaults(migrated);
}

/**
 * 从完整的 MMProjectConfig 中获取当前编辑的零件
 * @param {Object} config - MM 项目配置
 * @returns {Object|null} 当前活跃零件配置，不存在时返回 null
 */
function getActivePart(config) {
    if (!config || !config.parts) {
        log.debug('getActivePart: 配置或零件列表为空');
        return null;
    }
    var partId = config._uiState?.activePartId;
    if (!partId) {
        log.debug('getActivePart: 无活跃零件 ID');
        return null;
    }
    var part = config.parts[partId] || null;
    log.debug('getActivePart: ' + (part ? '找到零件 ' + partId : '零件 ' + partId + ' 不存在'));
    return part;
}

/**
 * 从完整的 MMProjectConfig 中获取当前编辑的变体
 * @param {Object} config - MM 项目配置
 * @returns {Object|null} 当前活跃变体配置，不存在时返回 null
 */
function getActiveVariant(config) {
    var part = getActivePart(config);
    if (!part) return null;
    var variantName = config._uiState?.activeVariantName;
    if (!variantName) {
        log.debug('getActiveVariant: 无活跃变体名');
        return null;
    }
    var variant = part.variants[variantName] || null;
    log.debug('getActiveVariant: ' + (variant ? '找到变体 ' + variantName : '变体 ' + variantName + ' 不存在'));
    return variant;
}

// ==================== 导出 ====================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG_VERSION,
        createBlankConfig,
        createPartConfig,
        createVariantConfig,
        createSubPartConfig,
        createHitBoxConfig,
        createInteractBoxConfig,
        createSubsystemConfig,
        createConnectorInstanceConfig,
        ensureDefaults,
        migrateIfNeeded,
        getActivePart,
        getActiveVariant,
    };
}
