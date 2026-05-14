/**
 * connectors/*.json 生成器 — 将 connector_defs 导出为连接点静态定义文件
 */

function generateConnectorJSON(defId, def) {
    const output = {};

    if (def.type) output.type = def.type;
    if (def.direction) output.direction = def.direction;

    if (def.integrity !== 20.0) output.integrity = def.integrity;
    if (def.damage_reduction !== 2.0) output.damage_reduction = def.damage_reduction;
    if (def.damage_multiplier !== 1.5) output.damage_multiplier = def.damage_multiplier;
    if (def.damage_absorption !== 0.2) output.damage_absorption = def.damage_absorption;
    if (def.collide_between) output.collide_between = true;

    if (def.required_tags && def.required_tags.length > 0) output.required_tags = def.required_tags;
    if (def.accepted_tags && def.accepted_tags.length > 0) output.accepted_tags = def.accepted_tags;
    if (def.rejected_tags && def.rejected_tags.length > 0) output.rejected_tags = def.rejected_tags;
    if (def.joints && def.joints.length > 0) output.joints = def.joints;

    return output;
}

function generateAllConnectors(projectConfig) {
    const defs = projectConfig.connector_defs || {};
    const result = {};
    for (const [defId, def] of Object.entries(defs)) {
        result[defId] = generateConnectorJSON(defId, def);
    }
    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateConnectorJSON, generateAllConnectors };
}
