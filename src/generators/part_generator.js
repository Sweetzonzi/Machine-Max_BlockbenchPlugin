const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('GenPart');

/**
 * parts/*.json 生成器 — 将 MMProjectConfig.parts 中的零件配置导出为 MachineMax 格式的 JSON 文件
 */

function generatePartJSON(partId, partConfig, namespace) {
    const ns = namespace || 'machine_max';
    const output = {};

    const topFields = [
        'icon', 'vehicle_durability_rate', 'vehicle_damage_rate',
        'vehicle_damage_rate_destroyed', 'functional_threshold',
        'share_durability', 'max_stack_size',
    ];

    for (const field of topFields) {
        if (partConfig[field] !== undefined && partConfig[field] !== null) {
            output[field] = partConfig[field];
        }
    }

    const variants = partConfig.variants || {};
    const variantKeys = Object.keys(variants);

    if (variantKeys.length === 1 && variantKeys[0] === 'default') {
        output.variants = buildVariantOutput(variants['default'], ns);
    } else if (variantKeys.length > 0) {
        output.variants = {};
        for (const [vName, variant] of Object.entries(variants)) {
            output.variants[vName] = buildVariantOutput(variant, ns);
        }
    }

    log.debug('generatePartJSON: 零件 ' + partId + ' 生成完成');
    return output;
}

function buildVariantOutput(variant, ns) {
    const out = {};

    if (variant.model) out.model = variant.model;
    if (variant.textures) out.textures = variant.textures;
    if (variant.animations) out.animations = variant.animations;
    if (variant.tags && variant.tags.length > 0) out.tags = variant.tags;

    const subParts = variant.sub_parts || {};
    const spKeys = Object.keys(subParts);

    if (spKeys.length === 1 && spKeys[0] === 'sub_part.machine_max.main') {
        out.sub_parts = buildSubPartOutput(subParts['sub_part.machine_max.main']);
    } else if (spKeys.length > 0) {
        out.sub_parts = {};
        for (const [spName, sp] of Object.entries(subParts)) {
            out.sub_parts[spName] = buildSubPartOutput(sp);
        }
    }

    return out;
}

function buildSubPartOutput(sp) {
    const out = {};

    if (sp.start_bone) out.start_bone = sp.start_bone;
    if (sp.end_bones && sp.end_bones.length > 0) out.end_bones = sp.end_bones;
    if (sp.durability !== 20.0) out.durability = sp.durability;
    if (sp.mass !== 25.0) out.mass = sp.mass;
    if (sp.mass_center && sp.mass_center !== 'mass_center') out.mass_center = sp.mass_center;
    if (sp.projected_area && !sp.projected_area.every(v => v === 0)) out.projected_area = sp.projected_area;
    if (sp.block_collision && sp.block_collision !== 'true') out.block_collision = sp.block_collision;
    if (sp.collision_height !== -1.0) out.collision_height = sp.collision_height;
    if (sp.climb_assist) out.climb_assist = true;
    if (sp.hydro_priority !== 0) out.hydro_priority = sp.hydro_priority;

    // 导出碰撞箱时将 UUID key 解析为骨骼名（游戏运行时使用骨骼名作为 key）
    if (sp.hit_boxes && Object.keys(sp.hit_boxes).length > 0) out.hit_boxes = _resolveUUIDKeys(sp.hit_boxes);
    if (sp.interact_boxes && Object.keys(sp.interact_boxes).length > 0) out.interact_boxes = _resolveUUIDKeys(sp.interact_boxes);
    if (sp.connectors && Object.keys(sp.connectors).length > 0) out.connectors = sp.connectors;
    if (sp.subsystems && Object.keys(sp.subsystems).length > 0) out.subsystems = sp.subsystems;
    if (sp.hydrodynamics) out.hydrodynamics = sp.hydrodynamics;

    return out;
}

/**
 * 将对象中的 UUID key 解析为 Blueprint 元素的骨骼名（Group.name）
 * 运行时数据使用骨骼名而不是 UUID 作为 hit_boxes/interact_boxes 的键
 * @param {Object<string, *>} obj - UUID 为 key 的对象
 * @returns {Object<string, *>} 骨骼名为 key 的新对象
 */
function _resolveUUIDKeys(obj) {
    var resolved = {};
    for (var key in obj) {
        var boneName = key;
        if (typeof Group !== 'undefined' && Group.all) {
            var group = Group.all.find(function(g) { return g.uuid === key; });
            if (group) boneName = group.name;
        }
        resolved[boneName] = obj[key];
    }
    return resolved;
}

function generateAllParts(projectConfig) {
    const ns = projectConfig.namespace || 'machine_max';
    const parts = projectConfig.parts || {};
    const result = {};

    for (const [partId, partConfig] of Object.entries(parts)) {
        result[partId] = generatePartJSON(partId, partConfig, ns);
    }

    log.info('generateAllParts: 已生成 ' + Object.keys(result).length + ' 个零件');
    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generatePartJSON, generateAllParts };
}
