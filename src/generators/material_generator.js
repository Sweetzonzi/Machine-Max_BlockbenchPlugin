const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('GenMaterial');

/**
 * materials/*.json 生成器 — 将 material_defs 导出为材料定义文件
 */

function generateMaterialJSON(defId, def) {
    const output = {};

    if (def.friction !== 0.5) output.friction = def.friction;
    if (def.restitution !== 0.3) output.restitution = def.restitution;
    if (def.density !== 1.0) output.density = def.density;
    if (def.armor_thickness !== 1.0) output.armor_thickness = def.armor_thickness;
    if (def.armor_toughness !== 0.0) output.armor_toughness = def.armor_toughness;
    if (def.hit_sound) output.hit_sound = def.hit_sound;
    if (def.break_sound) output.break_sound = def.break_sound;
    if (def.particle) output.particle = def.particle;

    return output;
}

function generateAllMaterials(projectConfig) {
    const defs = projectConfig.material_defs || {};
    const result = {};
    for (const [defId, def] of Object.entries(defs)) {
        result[defId] = generateMaterialJSON(defId, def);
    }
    log.info('generateAllMaterials: 已生成 ' + Object.keys(result).length + ' 个材料定义');
    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateMaterialJSON, generateAllMaterials };
}
