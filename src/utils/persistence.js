const PROPERTY_NAME = 'machine_max_plugin';
const { CONFIG_VERSION } = require('../core/constants.js');
const { migrateIfNeeded, createBlankConfig } = require('../core/config.js');
const { createLogger } = require('./logger.js');

/** 模块日志 */
var log = createLogger('Persistence');

/**
 * 在插件 onload 时调用。注册 Property 到 ModelProject，
 * Blockbench 自动将 Project[PROPERTY_NAME] 纳入 .bbmodel 的保存/加载循环。
 *
 * 注意：new Property() 会将 Project[PROPERTY_NAME] 设为 default 值，
 * 可能覆盖已由 BB 恢复的保存数据。应在注册前保留已有数据。
 */
function registerProperty() {
    if (ModelProject.properties[PROPERTY_NAME]) {
        log.debug('registerProperty: Property 已注册，跳过');
        return;
    }

    // 备份可能已由 BB 恢复的数据（项目先打开后加载插件场景）
    var existingData = (Project && Project !== 0) ? Project[PROPERTY_NAME] : null;
    var hasExisting = existingData && typeof existingData === 'object' && Object.keys(existingData).length > 0;

    new Property(ModelProject, 'object', PROPERTY_NAME, {
        default: {},
        exposed: false,
    });

    // 还原备份数据，避免被 default: {} 覆盖
    if (hasExisting) {
        Project[PROPERTY_NAME] = existingData;
        log.info('registerProperty: 已还原已有配置（' + Object.keys(existingData).length + ' 个键）');
    } else {
        log.info('registerProperty: Property 已注册（无已有配置）');
    }
}

/**
 * 获取 .bbmodel 文件路径（来自 Project）
 */
function getBBModelPath() {
    if (!Project || Project === 0 || !Project.file_path) {
        log.debug('getBBModelPath: 无 .bbmodel 路径');
        return null;
    }
    log.debug('getBBModelPath: ' + Project.file_path);
    return Project.file_path;
}

/**
 * 从已恢复的 Project.machine_max_plugin 加载配置
 * 主方案：BB Property 已自动恢复到内存
 * 备选：独立 .mm_project.json 文件保底
 */
function loadConfig() {
    if (!Project || Project === 0) {
        log.warn('loadConfig: 尚未打开项目，返回空白配置');
        return createBlankConfig();
    }

    const propData = Project[PROPERTY_NAME];

    if (propData && propData.$schema_version) {
        log.info('从 Property 加载配置，版本: ' + propData.$schema_version);
        var migrated = migrateIfNeeded(propData);
        Project[PROPERTY_NAME] = migrated;
        log.debug('loadConfig: 从 Property 加载完成', {
            packMetaType: typeof migrated.packMeta,
            packMetaKeys: migrated.packMeta ? Object.keys(migrated.packMeta) : [],
            name: migrated.packMeta ? migrated.packMeta.name : null,
            author: migrated.packMeta ? migrated.packMeta.author : null,
            description: migrated.packMeta ? migrated.packMeta.description : null,
        });
        return migrated;
    }

    // 备用方案1：Property 数据存在但无版本号 — 尝试 ensureDefaults 修复
    if (propData && typeof propData === 'object' && Object.keys(propData).length > 0) {
        log.info('从 Property 加载配置（无版本号，尝试修复），键: ' + Object.keys(propData).join(','));
        var repaired = migrateIfNeeded(propData);
        Project[PROPERTY_NAME] = repaired;
        return repaired;
    }

    // 备用方案2：独立 .mm_project.json 文件
    const bbmodelPath = getBBModelPath();
    if (bbmodelPath) {
        const standalonePath = bbmodelPath.replace(/\.bbmodel$/i, '.mm_project.json');
        try {
            const fs = require('fs');
            if (fs.existsSync(standalonePath)) {
                const raw = JSON.parse(fs.readFileSync(standalonePath, 'utf-8'));
                const config = raw.config || raw;
                log.info('从独立文件加载配置: ' + standalonePath);
                Project[PROPERTY_NAME] = migrateIfNeeded(config);
                return Project[PROPERTY_NAME];
            }
        } catch (e) {
            log.error('备选配置读取失败', e);
        }
    }

    log.info('创建空白配置');
    const blank = createBlankConfig();
    Project[PROPERTY_NAME] = blank;
    return blank;
}

/**
 * 保存配置到 Property（自动纳入 Ctrl+S）并写独立文件备份
 */
function saveConfig() {
    if (!Project || Project === 0 || !Project[PROPERTY_NAME]) {
        log.debug('saveConfig: 项目或配置不可用，跳过保存');
        return;
    }
    const config = Project[PROPERTY_NAME];

    const bbmodelPath = getBBModelPath();
    if (!bbmodelPath) {
        log.warn('saveConfig: 未找到 .bbmodel 路径，跳过独立备份');
        return;
    }

    log.debug('saveConfig: 即将保存 packMeta', {
        packMetaType: typeof config.packMeta,
        packMetaExists: !!config.packMeta,
        packMetaKeys: config.packMeta ? Object.keys(config.packMeta) : [],
        name: config.packMeta ? config.packMeta.name : null,
        nameType: config.packMeta ? typeof config.packMeta.name : 'N/A',
        author: config.packMeta ? config.packMeta.author : null,
        authorType: config.packMeta ? typeof config.packMeta.author : 'N/A',
        description: config.packMeta ? config.packMeta.description : null,
        descType: config.packMeta ? typeof config.packMeta.description : 'N/A',
    });

    const standalonePath = bbmodelPath.replace(/\.bbmodel$/i, '.mm_project.json');
    try {
        const fs = require('fs');
        const path = require('path');
        // 侧载文件仅保存 v4 配置子集（不含旧版 *_defs 等废弃字段）
        fs.writeFileSync(
            standalonePath,
            JSON.stringify({
                $schema_version: CONFIG_VERSION,
                bbmodel: path.basename(bbmodelPath),
                timestamp: Date.now(),
                config: {
                    $schema_version: config.$schema_version,
                    parts: config.parts,
                    _uiState: config._uiState,
                    contentPackPath: config.contentPackPath,
                    dependencyPaths: config.dependencyPaths,
                    packMeta: config.packMeta,
                    namespace: config.namespace,
                    modelFile: config.modelFile,
                },
            }, null, 2),
            'utf-8'
        );
        log.debug('saveConfig: 独立备份已写入: ' + standalonePath);
    } catch (e) {
        log.error('saveConfig: 备选配置写入失败', e);
    }

    log.info('配置已保存');
}

/**
 * 设置内容包路径
 * @param {Object} config - MM 项目配置
 * @param {string} packPath - 内容包根目录路径
 * @returns {Object} 修改后的 config
 */
function setPackPath(config, packPath) {
    config.contentPackPath = packPath;
    return config;
}

/**
 * 添加依赖内容包路径（去重）
 * @param {Object} config - MM 项目配置
 * @param {string} depPath - 依赖内容包的根目录路径
 * @returns {Object} 修改后的 config
 */
function addDependencyPath(config, depPath) {
    if (!config.dependencyPaths) config.dependencyPaths = [];
    if (config.dependencyPaths.indexOf(depPath) === -1) {
        config.dependencyPaths.push(depPath);
    }
    return config;
}

/**
 * 移除依赖内容包路径
 * @param {Object} config - MM 项目配置
 * @param {string} depPath - 要移除的依赖路径
 * @returns {Object} 修改后的 config
 */
function removeDependencyPath(config, depPath) {
    if (!config.dependencyPaths) return config;
    var idx = config.dependencyPaths.indexOf(depPath);
    if (idx !== -1) config.dependencyPaths.splice(idx, 1);
    return config;
}

/**
 * 获取当前项目的 MM 配置
 */
function getConfig() {
    if (!Project || Project === 0) {
        log.debug('getConfig: 项目不可用');
        return null;
    }
    var cfg = Project[PROPERTY_NAME] || null;
    log.debug('getConfig: ' + (cfg ? '有配置' : '无配置'));
    return cfg;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PROPERTY_NAME,
        registerProperty,
        loadConfig,
        saveConfig,
        getConfig,
        setPackPath,
        addDependencyPath,
        removeDependencyPath,
    };
}
