const PROPERTY_NAME = 'machine_max_plugin';
const CONFIG_VERSION = 3;
const { migrateIfNeeded, createBlankConfig } = require('../core/config.js');

/**
 * 在插件 onload 时调用。注册 Property 到 ModelProject，
 * Blockbench 自动将 Project[PROPERTY_NAME] 纳入 .bbmodel 的保存/加载循环。
 */
function registerProperty() {
    if (ModelProject.properties[PROPERTY_NAME]) {
        console.log('[MM Plugin]  Property 已注册，跳过');
        return;
    }
    new Property(ModelProject, 'object', PROPERTY_NAME, {
        default: {},
        exposed: false,
    });
    console.log('[MM Plugin]  Property machine_max_plugin 已注册');
}

/**
 * 获取 .bbmodel 文件路径（来自 Project）
 */
function getBBModelPath() {
    if (Project && Project.file_path) {
        return Project.file_path;
    }
    return null;
}

/**
 * 从已恢复的 Project.machine_max_plugin 加载配置
 * 主方案：BB Property 已自动恢复到内存
 * 备选：独立 .mm_project.json 文件保底
 */
function loadConfig() {
    const propData = Project[PROPERTY_NAME];

    if (propData && propData.$schema_version) {
        console.log('[MM Plugin]  从 Property 加载配置，版本:', propData.$schema_version);
        return migrateIfNeeded(propData);
    }

    const bbmodelPath = getBBModelPath();
    if (bbmodelPath) {
        const standalonePath = bbmodelPath.replace(/\.bbmodel$/i, '.mm_project.json');
        try {
            const fs = require('fs');
            if (fs.existsSync(standalonePath)) {
                const raw = JSON.parse(fs.readFileSync(standalonePath, 'utf-8'));
                const config = raw.config || raw;
                console.log('[MM Plugin]  从独立文件加载配置');
                Project[PROPERTY_NAME] = migrateIfNeeded(config);
                return Project[PROPERTY_NAME];
            }
        } catch (e) {
            console.warn('[MM Plugin]  备选配置读取失败:', e.message);
        }
    }

    console.log('[MM Plugin]  创建空白配置');
    const blank = createBlankConfig();
    Project[PROPERTY_NAME] = blank;
    return blank;
}

/**
 * 保存配置到 Property（自动纳入 Ctrl+S）并写独立文件备份
 */
function saveConfig() {
    const config = Project[PROPERTY_NAME];
    if (!config) return;

    const bbmodelPath = getBBModelPath();
    if (!bbmodelPath) {
        console.warn('[MM Plugin]  未找到 .bbmodel 路径，跳过独立备份');
        return;
    }

    const standalonePath = bbmodelPath.replace(/\.bbmodel$/i, '.mm_project.json');
    try {
        const fs = require('fs');
        const path = require('path');
        fs.writeFileSync(
            standalonePath,
            JSON.stringify({
                $schema_version: CONFIG_VERSION,
                bbmodel: path.basename(bbmodelPath),
                timestamp: Date.now(),
                config: config,
            }, null, 2),
            'utf-8'
        );
    } catch (e) {
        console.warn('[MM Plugin]  备选配置写入失败:', e.message);
    }

    console.log('[MM Plugin]  配置已保存');
}

/**
 * 获取当前项目的 MM 配置
 */
function getConfig() {
    return Project[PROPERTY_NAME] || null;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PROPERTY_NAME,
        registerProperty,
        loadConfig,
        saveConfig,
        getConfig,
    };
}
