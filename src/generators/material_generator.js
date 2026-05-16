const { createLogger } = require('../utils/logger.js');

var log = createLogger('GenMaterial');

/**
 * 递归地移除对象中的空值字段（undefined、null），
 * 但保留空数组和空对象（在 schema 中有意义）
 */
function stripUndefined(obj) {
    if (obj === null || obj === undefined) return undefined;
    if (Array.isArray(obj)) return obj;
    if (typeof obj !== 'object') return obj;
    var result = {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            var val = stripUndefined(obj[key]);
            if (val !== undefined) {
                result[key] = val;
            }
        }
    }
    return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * materials/*.json 生成器 — 将 material_defs 按完整 schema 导出
 * 直接透传预设中的所有字段，确保与官方包定义一致
 */
function generateMaterialJSON(defId, def) {
    var cleaned = stripUndefined(def);
    return cleaned || {};
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
