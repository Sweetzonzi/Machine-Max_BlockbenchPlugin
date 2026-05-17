const {
    CONFIG_VERSION,
    PART_DEFAULTS,
    VARIANT_DEFAULTS,
    SUB_PART_DEFAULTS,
    HIT_BOX_DEFAULTS,
} = require('./config_defaults.js');
const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('Config');

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

/**
 * 创建空白的项目配置，包含默认值
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
 * 创建新的零件配置，使用默认值填充
 * @param {string} partId - 零件 ID
 * @param {string} initialVariantName - 初始变体名
 */
function createPartConfig(partId, initialVariantName) {
    log.debug('createPartConfig: 创建零件配置', { partId: partId, variant: initialVariantName });
    const part = JSON.parse(JSON.stringify(PART_DEFAULTS));
    part.element_markers = {};

    if (initialVariantName) {
        part.variants[initialVariantName] = createVariantConfig();
    }

    return part;
}

/**
 * 创建新的变体配置，使用默认值填充
 */
function createVariantConfig() {
    log.debug('createVariantConfig: 创建变体配置');
    return JSON.parse(JSON.stringify(VARIANT_DEFAULTS));
}

/**
 * 创建新的子零件配置，使用默认值填充
 */
function createSubPartConfig() {
    log.debug('createSubPartConfig: 创建子零件配置');
    return JSON.parse(JSON.stringify(SUB_PART_DEFAULTS));
}

/**
 * 创建新的碰撞箱配置，使用默认值填充
 */
function createHitBoxConfig() {
    log.debug('createHitBoxConfig: 创建碰撞箱配置');
    return JSON.parse(JSON.stringify(HIT_BOX_DEFAULTS));
}

/**
 * 深度合并配置，确保缺少的字段用默认值填充
 * @param {Object} config - 要修复的配置
 * @returns {Object} 修复后的配置
 */
function ensureDefaults(config) {
    if (!config || typeof config !== 'object') {
        log.warn('ensureDefaults: 配置无效，返回空白配置');
        return createBlankConfig();
    }

    const result = Object.assign({}, createBlankConfig(), config);

    if (!result.parts) result.parts = {};
    if (!result._uiState) {
        result._uiState = { activeMode: 'part', activePartId: '', activeVariantName: '' };
    }

    log.debug('ensureDefaults: 完成');
    return result;
}

/**
 * 检查配置版本，如果需要则进行迁移
 */
function migrateIfNeeded(config) {
    if (!config || !config.$schema_version) {
        log.info('migrateIfNeeded: 无版本号，应用默认值');
        return ensureDefaults(config);
    }

    const version = config.$schema_version;
    if (version === CONFIG_VERSION) {
        log.debug('migrateIfNeeded: 配置已是最新版本 v' + version);
        return ensureDefaults(config);
    }

    log.info('migrateIfNeeded: 配置需要迁移', { from: version, to: CONFIG_VERSION });
    let migrated = JSON.parse(JSON.stringify(config));
    for (let v = version; v < CONFIG_VERSION; v++) {
        if (MIGRATIONS[v]) {
            migrated = MIGRATIONS[v](migrated);
            log.debug('migrateIfNeeded: 迁移步骤 v' + v + ' 完成');
        }
    }
    return ensureDefaults(migrated);
}

/**
 * 从完整的 MMProjectConfig 中获取当前编辑的零件
 */
function getActivePart(config) {
    if (!config || !config.parts) {
        log.debug('getActivePart: 配置或零件列表为空');
        return null;
    }
    const partId = config._uiState?.activePartId;
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
 */
function getActiveVariant(config) {
    const part = getActivePart(config);
    if (!part) return null;
    const variantName = config._uiState?.activeVariantName;
    if (!variantName) {
        log.debug('getActiveVariant: 无活跃变体名');
        return null;
    }
    var variant = part.variants[variantName] || null;
    log.debug('getActiveVariant: ' + (variant ? '找到变体 ' + variantName : '变体 ' + variantName + ' 不存在'));
    return variant;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG_VERSION,
        createBlankConfig,
        createPartConfig,
        createVariantConfig,
        createSubPartConfig,
        createHitBoxConfig,
        ensureDefaults,
        migrateIfNeeded,
        getActivePart,
        getActiveVariant,
    };
}
