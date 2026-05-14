const {
    CONFIG_VERSION,
    PART_DEFAULTS,
    VARIANT_DEFAULTS,
    SUB_PART_DEFAULTS,
    CONNECTOR_DEF_DEFAULTS,
    SUBSYSTEM_DEF_DEFAULTS,
    MATERIAL_DEF_DEFAULTS,
    PROJECTILE_DEFAULTS,
} = require('./config_defaults.js');

const MIGRATIONS = {
    2: function (v1config) {
        const v3 = v1config.project || v1config;
        v3.$schema_version = 3;
        v3.projectiles = v3.projectiles || {};
        v3.connector_defs = v3.connector_defs || {};
        v3.subsystem_defs = v3.subsystem_defs || {};
        v3.material_defs = v3.material_defs || {};
        return v3;
    },
};

/**
 * 创建空白的项目配置，包含默认值
 */
function createBlankConfig() {
    return {
        $schema_version: CONFIG_VERSION,
        namespace: 'machine_max',
        modelFile: '',
        parts: {},
        projectiles: {},
        connector_defs: {},
        subsystem_defs: {},
        material_defs: {},
        _uiState: {
            activeMode: 'part',
            activePartId: '',
            activeVariantName: '',
        },
    };
}

/**
 * 创建新的零件配置，使用默认值填充
 */
function createPartConfig(partId, initialVariantName) {
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
    return JSON.parse(JSON.stringify(VARIANT_DEFAULTS));
}

/**
 * 创建新的子零件配置，使用默认值填充
 */
function createSubPartConfig() {
    return JSON.parse(JSON.stringify(SUB_PART_DEFAULTS));
}

/**
 * 创建新的连接点静态定义
 */
function createConnectorDef(defId) {
    const def = JSON.parse(JSON.stringify(CONNECTOR_DEF_DEFAULTS));
    return def;
}

/**
 * 创建新的子系统静态定义
 */
function createSubsystemDef(defId) {
    const def = JSON.parse(JSON.stringify(SUBSYSTEM_DEF_DEFAULTS));
    return def;
}

/**
 * 创建新的材料定义
 */
function createMaterialDef(defId) {
    return JSON.parse(JSON.stringify(MATERIAL_DEF_DEFAULTS));
}

/**
 * 深度合并配置，确保缺少的字段用默认值填充
 * @param {Object} config - 要修复的配置
 * @returns {Object} 修复后的配置
 */
function ensureDefaults(config) {
    if (!config || typeof config !== 'object') {
        return createBlankConfig();
    }

    const result = Object.assign({}, createBlankConfig(), config);

    if (!result.parts) result.parts = {};
    if (!result.projectiles) result.projectiles = {};
    if (!result.connector_defs) result.connector_defs = {};
    if (!result.subsystem_defs) result.subsystem_defs = {};
    if (!result.material_defs) result.material_defs = {};
    if (!result._uiState) {
        result._uiState = { activeMode: 'part', activePartId: '', activeVariantName: '' };
    }

    return result;
}

/**
 * 检查配置版本，如果需要则进行迁移
 */
function migrateIfNeeded(config) {
    if (!config || !config.$schema_version) {
        return ensureDefaults(config);
    }

    const version = config.$schema_version;
    if (version === CONFIG_VERSION) {
        return ensureDefaults(config);
    }

    let migrated = JSON.parse(JSON.stringify(config));
    for (let v = version; v < CONFIG_VERSION; v++) {
        if (MIGRATIONS[v]) {
            migrated = MIGRATIONS[v](migrated);
        }
    }
    return ensureDefaults(migrated);
}

/**
 * 从完整的 MMProjectConfig 中获取当前编辑的零件
 */
function getActivePart(config) {
    if (!config || !config.parts) return null;
    const partId = config._uiState?.activePartId;
    if (!partId) return null;
    return config.parts[partId] || null;
}

/**
 * 从完整的 MMProjectConfig 中获取当前编辑的变体
 */
function getActiveVariant(config) {
    const part = getActivePart(config);
    if (!part) return null;
    const variantName = config._uiState?.activeVariantName;
    if (!variantName) return null;
    return part.variants[variantName] || null;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG_VERSION,
        createBlankConfig,
        createPartConfig,
        createVariantConfig,
        createSubPartConfig,
        createConnectorDef,
        createSubsystemDef,
        createMaterialDef,
        ensureDefaults,
        migrateIfNeeded,
        getActivePart,
        getActiveVariant,
    };
}
