const { createLogger } = require('../utils/logger.js');
const { createSubPartConfig } = require('./config.js');

/** 模块日志 */
var log = createLogger('Markers');

const MARKER_TYPES = {
    sub_part: { label: '子零件', icon: 'fa-cube', color: '#4A90D9' },
    hit_box: { label: '碰撞箱', icon: 'fa-shield', color: '#D94A4A' },
    connector: { label: '连接点', icon: 'fa-plug', color: '#3AA83A' },
    seat: { label: '座位', icon: 'fa-chair', color: '#D9C94A' },
    lighting: { label: '灯光', icon: 'fa-lightbulb', color: '#D97E4A' },
    subsystem_locator: { label: '子系统', icon: 'fa-cog', color: '#9B4AD9' },
};

const MARKER_TYPE_LIST = Object.keys(MARKER_TYPES);

function getMarkerInfo(type) {
    return MARKER_TYPES[type] || null;
}

function getIconClass(type) {
    const info = getMarkerInfo(type);
    return info ? info.icon : '';
}

function getColor(type) {
    const info = getMarkerInfo(type);
    return info ? info.color : '#888888';
}

function getMarkerTypesForElement(element) {
    if (element instanceof Locator) {
        return ['connector', 'seat', 'lighting', 'subsystem_locator'];
    } else if (element instanceof Group) {
        return ['sub_part', 'hit_box'];
    }
    return [];
}

function getOrCreatePartConfig(projectConfig, partId) {
    if (!projectConfig.parts[partId]) {
        log.debug('getOrCreatePartConfig: 零件不存在', { partId: partId });
        return null;
    }
    return projectConfig.parts[partId];
}

/**
 * 沿父级链向上查找元素所属的子零件标记
 * @param {Object} projectConfig - 完整的 MMProjectConfig
 * @param {string} partId
 * @param {string} variantName
 * @param {Object} element - Blockbench 元素（Group/Locator/Cube 等，必须有 .parent 链）
 * @returns { { spKey: string, spName: string } | null } - 所属子零件 key 和骨骼名称
 */
function detectOwnerSubPart(projectConfig, partId, variantName, element) {
    var markers = getMarkersForVariant(projectConfig, partId, variantName);
    var el = element;
    while (el) {
        if (el instanceof Group) {
            var marker = markers[el.uuid];
            if (marker && marker.type === 'sub_part') {
                return {
                    spKey: marker.config_ref || el.name,
                    spName: el.name,
                };
            }
        }
        el = el.parent;
    }
    return null;
}

function setMarker(projectConfig, partId, variantName, uuid, type, configRef) {
    const part = getOrCreatePartConfig(projectConfig, partId);
    if (!part) {
        log.warn('setMarker: 零件不存在', { partId: partId, uuid: uuid, type: type });
        return false;
    }

    if (!part.element_markers) {
        part.element_markers = {};
    }
    if (!part.element_markers[variantName]) {
        part.element_markers[variantName] = {};
    }

    // 标记为子零件时自动在 variant.sub_parts 中创建配置对象
    if (type === 'sub_part' && configRef) {
        const variant = part.variants && part.variants[variantName];
        if (variant) {
            const spKey = configRef;
            if (!variant.sub_parts) {
                variant.sub_parts = {};
            }
            if (!variant.sub_parts[spKey]) {
                const spConfig = createSubPartConfig();
                spConfig.start_bone = configRef;
                variant.sub_parts[spKey] = spConfig;
                log.debug('setMarker: 已创建子零件配置', { partId, variant: variantName, key: spKey });
            }
            configRef = spKey;
        }
    }

    part.element_markers[variantName][uuid] = {
        type: type,
        config_ref: configRef || null,
    };
    // 碰撞箱标记：config_ref 存储所属子零件 key（由调用方传入），
    // hit_boxes 中的配置条目由调用方在标记前创建（以 boneName 为 key）

    // 标记子零件后重新计算所有子零件的 auto_end_bones
    if (type === 'sub_part') {
        recalcAutoEndBones(projectConfig, partId, variantName);
    }

    log.debug('setMarker: 标记已设置', { partId: partId, variant: variantName, uuid: uuid, type: type });
    return true;
}

function clearMarker(projectConfig, partId, variantName, uuid) {
    const part = getOrCreatePartConfig(projectConfig, partId);
    if (!part || !part.element_markers) {
        log.debug('clearMarker: 零件或无标记', { partId: partId, uuid: uuid });
        return false;
    }
    if (!part.element_markers[variantName]) {
        log.debug('clearMarker: 变体无标记', { variant: variantName, uuid: uuid });
        return false;
    }

    // 删除元素标记前获取标记信息，用于清理下级配置
    var marker = part.element_markers[variantName][uuid];

    // 清理碰撞箱标记对应的 sub_part.hit_boxes 条目
    if (marker && marker.type === 'hit_box' && marker.config_ref) {
        var variant = part.variants && part.variants[variantName];
        if (variant && variant.sub_parts && variant.sub_parts[marker.config_ref]) {
            var sp = variant.sub_parts[marker.config_ref];
            if (sp.hit_boxes) {
                delete sp.hit_boxes[uuid];
                log.debug('clearMarker: 已清理 hit_boxes 条目', { partId, variant: variantName, spKey: marker.config_ref, uuid: uuid });
            }
        }
    }

    // 清理子零件标记对应的 sub_parts 条目及其 auto_end_bones
    if (marker && marker.type === 'sub_part' && marker.config_ref) {
        var spKey = marker.config_ref;
        var variant = part.variants && part.variants[variantName];
        if (variant && variant.sub_parts) {
            delete variant.sub_parts[spKey];
            log.debug('clearMarker: 已清理 sub_parts 条目', { partId, variant: variantName, spKey: spKey });
            recalcAutoEndBones(projectConfig, partId, variantName);
        }
    }

    delete part.element_markers[variantName][uuid];
    log.debug('clearMarker: 标记已清除', { partId: partId, variant: variantName, uuid: uuid });

    if (Object.keys(part.element_markers[variantName]).length === 0) {
        delete part.element_markers[variantName];
    }
    return true;
}

/**
 * 根据当前所有子零件标记，重新计算各个子零件的 auto_end_bones
 * 子零件 B 是子零件 A 的后代 → B 的名称自动加入 A 的 auto_end_bones
 */
function recalcAutoEndBones(projectConfig, partId, variantName) {
    var part = getOrCreatePartConfig(projectConfig, partId);
    if (!part) return;
    var variant = part.variants && part.variants[variantName];
    if (!variant || !variant.sub_parts) return;
    var markers = getMarkersForVariant(projectConfig, partId, variantName);

    // 收集所有标记为 sub_part 的 Group
    var subPartGroups = {};
    var allGroups = typeof Group !== 'undefined' ? Group.all : [];
    for (var i = 0; i < allGroups.length; i++) {
        var grp = allGroups[i];
        var marker = markers[grp.uuid];
        if (marker && marker.type === 'sub_part') {
            subPartGroups[grp.uuid] = {
                group: grp,
                name: marker.config_ref || grp.name,
            };
        }
    }

    // 清空所有子零件的 auto_end_bones
    for (var spKey in variant.sub_parts) {
        variant.sub_parts[spKey].auto_end_bones = [];
    }

    // 对每个子零件，沿父链找到最近的子零件祖先，将本子零件名加入祖先的 auto_end_bones
    for (var uuid in subPartGroups) {
        var grp = subPartGroups[uuid].group;
        var childName = subPartGroups[uuid].name;
        var el = grp.parent;
        while (el) {
            if (el instanceof Group && subPartGroups[el.uuid]) {
                var ancestorMarker = markers[el.uuid];
                var ancestorKey = ancestorMarker ? (ancestorMarker.config_ref || el.name) : el.name;
                if (variant.sub_parts[ancestorKey]) {
                    if (variant.sub_parts[ancestorKey].auto_end_bones.indexOf(childName) === -1) {
                        variant.sub_parts[ancestorKey].auto_end_bones.push(childName);
                        log.debug('recalcAutoEndBones: ' + childName + ' → ' + ancestorKey + '.auto_end_bones');
                    }
                }
                break;
            }
            el = el.parent;
        }
    }

    log.debug('recalcAutoEndBones: 完成', {
        partId: partId,
        variant: variantName,
        subParts: Object.keys(variant.sub_parts).map(function (k) {
            return k + '[' + variant.sub_parts[k].auto_end_bones.join(',') + ']';
        }),
    });
}

function getMarker(projectConfig, partId, variantName, uuid) {
    const part = getOrCreatePartConfig(projectConfig, partId);
    if (!part || !part.element_markers) return null;
    const variantMarkers = part.element_markers[variantName];
    if (!variantMarkers) return null;
    return variantMarkers[uuid] || null;
}

function clearAllMarkers(projectConfig, partId, variantName) {
    const part = getOrCreatePartConfig(projectConfig, partId);
    if (!part || !part.element_markers) {
        log.debug('clearAllMarkers: 无可清除标记');
        return;
    }
    if (variantName) {
        delete part.element_markers[variantName];
        log.debug('clearAllMarkers: 已清除变体所有标记', { partId: partId, variant: variantName });
    } else {
        part.element_markers = {};
        log.debug('clearAllMarkers: 已清除零件所有标记', { partId: partId });
    }
}

function getMarkersForVariant(projectConfig, partId, variantName) {
    const part = getOrCreatePartConfig(projectConfig, partId);
    if (!part || !part.element_markers) return {};
    var markers = part.element_markers[variantName] || {};
    log.debug('getMarkersForVariant: 获取变体标记', {
        partId: partId,
        variant: variantName,
        count: Object.keys(markers).length,
    });
    return markers;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MARKER_TYPES,
        MARKER_TYPE_LIST,
        getMarkerInfo,
        getIconClass,
        getColor,
        getMarkerTypesForElement,
        setMarker,
        clearMarker,
        getMarker,
        clearAllMarkers,
        getMarkersForVariant,
        detectOwnerSubPart,
        recalcAutoEndBones,
    };
}
