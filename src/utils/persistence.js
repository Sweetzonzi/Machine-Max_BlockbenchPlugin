const PROPERTY_NAME = 'machine_max_plugin';
const { CONFIG_VERSION } = require('../core/constants.js');
const { migrateIfNeeded, createBlankConfig } = require('../core/config.js');
const { cleanGhostMarkers, migrateConnectorMarkerRefs, repairMarkerConfigs } = require('../core/element_markers.js');
const content_pack = require('../core/content_pack.js');
const { createLogger } = require('./logger.js');
const docProjection = require('../doc/projection.js');
const docLoad = require('../doc/load.js');

/** 模块日志 */
var log = createLogger('Persistence');

/**
 * 读盘用的零件解码器：坏条目原样保留、其余照常填默认值。
 *
 * 工程文件是信任边界外的输入（作者手改、旧版本插件写、第三方工具生成），
 * 一处类型不对不该让整个工程打不开；非法值由校验报、由导出闸门拦。
 *
 * @param {*} part
 * @param {string} partId
 * @returns {*}
 */
function _decodePartForLoad(part, partId) {
    var result = docLoad.decodePart(part, { partId: partId });
    if (result.issues && result.issues.length > 0) {
        log.warn('loadConfig: 零件 "' + partId + '" 有 ' + result.issues.length
            + ' 处结构非法，已原样保留（校验会报出具体字段）', result.issues);
    }
    return result.node;
}

/** 迁移 + 补默认值，解码走数据宽容的加载链路 */
function _migrateForLoad(rawConfig) {
    return migrateIfNeeded(rawConfig, { decodePart: _decodePartForLoad });
}

/**
 * 纠正配置里与内容包目录不符的命名空间（原地修改）
 *
 * 内容包的命名空间由包内一级目录决定，与 meta.id 无关；一个包可以没有
 * `machine_max/` 目录，而用 `m1a2_sep/` 之类与包名同名的目录。旧工程可能存着
 * 按 id 前缀推出来的值，会导致新建零件、生成语言键与导出都写进错误目录。
 *
 * 判定很窄：**只有**当前值不在包内命名空间列表里（空串 / 旧 id 前缀 / 目录已删）
 * 才改成主命名空间；作者手选的非主命名空间（在列表里）一律不动。
 * 包内读不到任何内容目录时也不动——那多半是还没建内容，猜出来的值只会更糟。
 *
 * @param {Object} config - 项目配置
 * @returns {boolean} 是否发生了修改
 */
function healNamespace(config) {
    var opened, current;
    if (!config || typeof config !== 'object') return false;
    if (!config.contentPackPath || typeof config.contentPackPath !== 'string') return false;

    try {
        opened = content_pack.openContentPack(config.contentPackPath);
    } catch (e) {
        log.warn('healNamespace: 读取内容包命名空间失败，保留原值', e);
        return false;
    }
    if (!opened.valid || !opened.namespaces || opened.namespaces.length === 0) return false;
    // 主命名空间为空或非法时没有可写入的目标，保留原值等作者处理
    if (!content_pack.isValidNamespace(opened.namespace)) return false;

    current = typeof config.namespace === 'string' ? config.namespace : '';
    if (opened.namespaces.indexOf(current) >= 0) return false;

    log.warn('healNamespace: 命名空间 "' + current + '" 不在内容包内（'
        + opened.namespaces.join('、') + '），改为 "' + opened.namespace + '"');
    config.namespace = opened.namespace;
    return true;
}

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

    var result;

    if (propData && propData.$schema_version) {
        log.info('从 Property 加载配置，版本: ' + propData.$schema_version);
        var migrated = _migrateForLoad(propData);
        Project[PROPERTY_NAME] = migrated;
        result = migrated;
        log.debug('loadConfig: 从 Property 加载完成', {
            packMetaType: typeof migrated.packMeta,
            packMetaKeys: migrated.packMeta ? Object.keys(migrated.packMeta) : [],
            name: migrated.packMeta ? migrated.packMeta.name : null,
            author: migrated.packMeta ? migrated.packMeta.author : null,
            description: migrated.packMeta ? migrated.packMeta.description : null,
        });
    } else if (propData && typeof propData === 'object' && Object.keys(propData).length > 0) {
        // 备用方案1：Property 数据存在但无版本号 — 尝试 ensureDefaults 修复
        log.info('从 Property 加载配置（无版本号，尝试修复），键: ' + Object.keys(propData).join(','));
        var repaired = _migrateForLoad(propData);
        Project[PROPERTY_NAME] = repaired;
        result = repaired;
    } else {
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
                    Project[PROPERTY_NAME] = _migrateForLoad(config);
                    result = Project[PROPERTY_NAME];
                }
            } catch (e) {
                log.error('备选配置读取失败', e);
            }
        }

        if (!result) {
            log.info('创建空白配置');
            const blank = createBlankConfig();
            Project[PROPERTY_NAME] = blank;
            result = blank;
        }
    }

    // 内容包的命名空间以包内目录为准（包 id 与命名空间无关）。旧工程里可能存着
    // 按 id 前缀推出来的错误值（例如 machine_max:m1a2_sep 被记成 machine_max），
    // 那会让新建内容与导出都写进错误目录，这里在加载时纠正一次。
    if (healNamespace(result)) {
        saveConfig();
    }

    // 修复存量 hit_boxes 用骨骼名当 key 的条目（幂等；内部树只认 UUID）
    var hitBoxRepair = docProjection.repairHitBoxKeys(result);
    if (hitBoxRepair.repaired > 0) {
        log.info('loadConfig: 已把 ' + hitBoxRepair.repaired + ' 个骨骼名 hit_boxes key 归一化为 UUID');
        saveConfig();
    }
    if (hitBoxRepair.unresolved.length > 0) {
        log.warn('loadConfig: ' + hitBoxRepair.unresolved.length + ' 个 hit_boxes key 无法解析为骨骼，保留待校验');
    }

    // 把 connector marker 的 config_ref 从 definition 迁移为连接点 key（幂等）
    var markerMigration = migrateConnectorMarkerRefs(result);
    if (markerMigration.migrated > 0) {
        log.info('loadConfig: 已迁移 ' + markerMigration.migrated + ' 个 connector marker 的 config_ref');
        saveConfig();
    }

    // 修复旧工程中「有标记但没有配置条目」的情况（渲染期不再补配置）
    var markerRepair = repairMarkerConfigs(result);
    if (markerRepair.repaired > 0) {
        log.info('loadConfig: 已补建 ' + markerRepair.repaired + ' 个缺失配置条目', markerRepair.details);
        saveConfig();
    }

    // 清理幽灵标记：删除 element_markers 中 UUID 对应的 Group/Locator 已不存在的条目
    var ghostResult = cleanGhostMarkers(result);
    if (ghostResult.cleanedCount > 0) {
        log.info('loadConfig: 已清理 ' + ghostResult.cleanedCount + ' 个幽灵标记', ghostResult.details);
        // 保存清理后的配置，防止幽灵标记再次被持久化
        saveConfig();
    }

    return result;
}

/**
 * 防抖保存：连续字段编辑 / 事件总线一次提交只在 300ms 后落盘一次。
 * 显式 Ctrl+S 与导出完成仍走 saveConfig()（同步、立即）。
 */
var _saveTimer = null;
var SAVE_DEBOUNCE_MS = 300;

/**
 * 防抖保存：连续字段编辑 / 事件总线一次提交只在 300ms 后落盘一次。
 * 显式 Ctrl+S 与导出完成仍走 saveConfig()（同步、立即）。
 */
function scheduleSave(delay) {
    if (typeof setTimeout !== 'function') {
        saveConfig();
        return;
    }
    if (_saveTimer) clearTimeout(_saveTimer);
    var wait = typeof delay === 'number' ? delay : SAVE_DEBOUNCE_MS;
    _saveTimer = setTimeout(function () {
        _saveTimer = null;
        saveConfig();
    }, wait);
}

/** 立即执行挂起的防抖保存（卸载 / 模式切换时用）。 */
function flushSave() {
    if (_saveTimer) {
        clearTimeout(_saveTimer);
        _saveTimer = null;
    }
    saveConfig();
}

function cancelScheduledSave() {
    if (_saveTimer) {
        clearTimeout(_saveTimer);
        _saveTimer = null;
    }
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
        scheduleSave,
        flushSave,
        cancelScheduledSave,
        getConfig,
        setPackPath,
        addDependencyPath,
        removeDependencyPath,
        _internals: {
            healNamespace,
        },
    };
}
