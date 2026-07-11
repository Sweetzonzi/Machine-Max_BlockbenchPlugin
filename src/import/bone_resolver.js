/**
 * bone_resolver.js — 骨骼名反查器
 *
 * 遍历导入的 PartConfig，将所有骨骼名字段反查当前模型的 Group.all：
 *   - 匹配成功 → 创建 element_markers 条目（UUID 为 key）
 *   - 匹配失败 → 收集到 _unresolved_bones 数组，供 Vue 面板红色警告
 *
 * 涉及的字段：
 *   SubPart:       start_bone（骨骼名）
 *   HitBox:        键名（导出时已由 part_generator._resolveUUIDKeys 转为骨骼名）
 *   InteractBox:   bone 字段（骨骼名）
 *
 * _unresolved_bones 是瞬态字段，PartCodec.encode 时自动剥离，不写入导出 JSON。
 */

'use strict';

const { createLogger } = require('../utils/logger.js');
const { setMarker } = require('../core/element_markers.js');

/** 模块日志 */
var log = createLogger('BoneResolver');

/**
 * 通过名称在 Group.all 中查找骨骼
 * @param {Array<Object>} allGroups - Group.all 数组
 * @param {string} name - 骨骼名称
 * @returns {Object|null} 匹配的 Group 对象，或 null
 */
function findGroupByName(allGroups, name) {
    if (!name || !allGroups) return null;
    for (var i = 0; i < allGroups.length; i++) {
        if (allGroups[i].name === name) return allGroups[i];
    }
    return null;
}

/**
 * 解析导入的 PartConfig 中所有骨骼引用，反查大纲树建立 element_markers
 *
 * setMarker 需要通过 projectConfig.parts[partId] 定位零件，
 * 因此调用前须确保零件已写入 config.parts。
 *
 * @param {Object} projectConfig - 完整的项目配置（含 parts 字典）
 * @param {string} partId - 零件 ID
 * @returns {Object} 修改后的 partConfig（含 _unresolved_bones 数组）
 */
function resolveBoneReferences(projectConfig, partId) {
    var partConfig = projectConfig.parts[partId];
    if (!partConfig) {
        log.warn('resolveBoneReferences: 零件不存在于 config.parts 中', { partId: partId });
        return null;
    }

    var unresolved = [];
    var allGroups = (typeof Group !== 'undefined') ? Group.all : [];

    // 确保 element_markers 根对象存在
    if (!partConfig.element_markers) {
        partConfig.element_markers = {};
    }

    var variants = partConfig.variants;
    if (!variants || typeof variants !== 'object') {
        log.debug('resolveBoneReferences: 无 variants，跳过');
        partConfig._unresolved_bones = unresolved;
        return partConfig;
    }

    for (var vKey in variants) {
        if (!variants.hasOwnProperty(vKey)) continue;
        var variant = variants[vKey];
        if (!variant || !variant.sub_parts || typeof variant.sub_parts !== 'object') continue;

        // 确保该变体的标记字典存在
        if (!partConfig.element_markers[vKey]) {
            partConfig.element_markers[vKey] = {};
        }

        for (var spKey in variant.sub_parts) {
            if (!variant.sub_parts.hasOwnProperty(spKey)) continue;
            var sp = variant.sub_parts[spKey];
            if (!sp || typeof sp !== 'object') continue;

            // ── 1. 解析 start_bone → 创建 sub_part 标记 ──
            if (sp.start_bone && typeof sp.start_bone === 'string') {
                var startGroup = findGroupByName(allGroups, sp.start_bone);
                if (startGroup) {
                    // setMarker 通过 projectConfig.parts[partId] 定位零件
                    setMarker(projectConfig, partId, vKey, startGroup.uuid, 'sub_part', spKey);
                    log.debug('resolveBoneReferences: start_bone 已解析', {
                        partId: partId, variant: vKey, sub_part: spKey,
                        boneName: sp.start_bone, uuid: startGroup.uuid,
                    });
                } else {
                    unresolved.push({
                        bone: sp.start_bone,
                        field: 'start_bone',
                        sub_part: spKey,
                        variant: vKey,
                    });
                    log.warn('resolveBoneReferences: start_bone 未在大纲树中找到', {
                        partId: partId, variant: vKey, sub_part: spKey,
                        boneName: sp.start_bone,
                    });
                }
            }

            // ── 2. 解析 hit_boxes 键名 → 转换为 UUID key + 创建 hit_box 标记 ──
            // 导入的 JSON 中 hit_boxes 键名是骨骼名（导出时由 _resolveUUIDKeys 转换）
            // 需要反转为 UUID key 以兼容编辑器内部的 UUID 引用机制
            if (sp.hit_boxes && typeof sp.hit_boxes === 'object') {
                var resolvedHitBoxes = {};
                var hitBoxKeys = Object.keys(sp.hit_boxes);

                for (var h = 0; h < hitBoxKeys.length; h++) {
                    var boneName = hitBoxKeys[h];
                    var hbData = sp.hit_boxes[boneName];
                    var hbGroup = findGroupByName(allGroups, boneName);

                    if (hbGroup) {
                        // 用 UUID 作为新 key
                        resolvedHitBoxes[hbGroup.uuid] = hbData;
                        // 创建 hit_box 标记（config_ref 指向所属子零件 key）
                        setMarker(projectConfig, partId, vKey, hbGroup.uuid, 'hit_box', spKey);
                        log.debug('resolveBoneReferences: hit_box 键名已解析', {
                            partId: partId, variant: vKey, sub_part: spKey,
                            boneName: boneName, uuid: hbGroup.uuid,
                        });
                    } else {
                        // 骨骼不存在：保留原始 key（骨骼名），添加未解析记录
                        resolvedHitBoxes[boneName] = hbData;
                        unresolved.push({
                            bone: boneName,
                            field: 'hit_box_key',
                            sub_part: spKey,
                            variant: vKey,
                        });
                        log.warn('resolveBoneReferences: hit_box 骨骼未在大纲树中找到', {
                            partId: partId, variant: vKey, sub_part: spKey,
                            boneName: boneName,
                        });
                    }
                }
                sp.hit_boxes = resolvedHitBoxes;
            }

            // ── 3. 解析 interact_boxes[].bone → 创建 interact_box 标记 ──
            if (sp.interact_boxes && typeof sp.interact_boxes === 'object') {
                for (var ibKey in sp.interact_boxes) {
                    if (!sp.interact_boxes.hasOwnProperty(ibKey)) continue;
                    var ib = sp.interact_boxes[ibKey];
                    if (!ib || !ib.bone) continue;

                    var ibGroup = findGroupByName(allGroups, ib.bone);
                    if (ibGroup) {
                        // 将 _uuid 字段设为实际 UUID
                        ib._uuid = ibGroup.uuid;
                        // 创建 interact_box 标记（config_ref 为 ibKey）
                        setMarker(projectConfig, partId, vKey, ibGroup.uuid, 'interact_box', ibKey);
                        log.debug('resolveBoneReferences: interact_box 骨骼已解析', {
                            partId: partId, variant: vKey, key: ibKey,
                            boneName: ib.bone, uuid: ibGroup.uuid,
                        });
                    } else {
                        unresolved.push({
                            bone: ib.bone,
                            field: 'interact_box.bone',
                            sub_part: spKey,
                            interact_box: ibKey,
                            variant: vKey,
                        });
                        log.warn('resolveBoneReferences: interact_box 骨骼未在大纲树中找到', {
                            partId: partId, variant: vKey, key: ibKey,
                            boneName: ib.bone,
                        });
                    }
                }
            }
        }
    }

    partConfig._unresolved_bones = unresolved;

    if (unresolved.length > 0) {
        log.warn('resolveBoneReferences: 有 ' + unresolved.length + ' 个骨骼引用未解析', {
            unresolved: unresolved,
        });
    } else {
        log.info('resolveBoneReferences: 所有骨骼引用已成功解析');
    }

    return partConfig;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { resolveBoneReferences };
}
