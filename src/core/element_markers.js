const { createLogger } = require('../utils/logger.js');
const { createSubPartConfig } = require('./config.js');

/**
 * Vue 2 响应式说明
 * =================
 * 本模块直接操作 config 对象的属性增删（obj.prop = val、delete obj.prop）,
 * 这些操作在 Vue 2 中理论上是非响应式的，不会自动触发 UI 刷新。
 *
 * 然而在实际调用链路中，所有标记操作完成后调用方（mode.js / App.vue.js）
 * 会立即调用 saveConfig() + refreshOutlinerIcons() 强制更新 UI，
 * 因此实践中不会出现"UI 冻结"的问题。
 *
 * 本模块属于 core/ 层，不应依赖 Vue，因此保留直接赋值模式。
 * 如需在 Vue 组件外部使用，请确保调用链中包含 saveConfig + refreshOutlinerIcons。
 */

/** 模块日志 */
var log = createLogger('Markers');

const MARKER_TYPES = {
    sub_part: { label: '子零件', icon: 'fa-cube', color: '#4A90D9' },
    hit_box: { label: '碰撞箱', icon: 'fa-shield', color: '#D94A4A' },
    connector: { label: '连接点', icon: 'fa-plug', color: '#3AA83A' },
    interact_box: { label: '交互区', icon: 'fa-hand-pointer', color: '#D9A441' },
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
        return ['connector'];
    } else if (element instanceof Group) {
        return ['sub_part', 'hit_box', 'interact_box'];
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

// 注：本函数对 config.parts[partId].element_markers 使用了直接属性赋值
// （line 83-84: part.element_markers = {} / ...variantName = {}）
// Vue 2 中这些是"非响应式"的，但调用方(mode.js)会在之后调用 saveConfig() + refreshOutlinerIcons()
// 因此 UI 可以正常刷新。详见文件顶部注释。
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

    // 覆盖标记前，先清理旧标记类型的副作用（防止类型变更后残留）
    var oldMarker = part.element_markers[variantName][uuid];
    if (oldMarker && oldMarker.type !== type) {
        log.debug('setMarker: 检测到标记类型变更，清理旧标记副作用', {
            partId, variant: variantName, uuid, oldType: oldMarker.type, newType: type,
            oldConfigRef: oldMarker.config_ref,
        });
        if (oldMarker.type === 'hit_box' && oldMarker.config_ref) {
            var oldVariant = part.variants && part.variants[variantName];
            if (oldVariant && oldVariant.sub_parts && oldVariant.sub_parts[oldMarker.config_ref]) {
                var oldSp = oldVariant.sub_parts[oldMarker.config_ref];
                if (oldSp.hit_boxes) {
                    if (oldSp.hit_boxes[uuid] !== undefined) {
                        delete oldSp.hit_boxes[uuid];
                        log.debug('setMarker: 覆盖旧 hit_box 标记，已清理 hit_boxes 条目', {
                            partId, variant: variantName, spKey: oldMarker.config_ref, uuid: uuid,
                        });
                    }
                }
            }
        } else if (oldMarker.type === 'interact_box') {
            // 按 _uuid 清理旧条目
            var oldVariantIb = part.variants && part.variants[variantName];
            if (oldVariantIb && oldVariantIb.sub_parts) {
                for (var skIb in oldVariantIb.sub_parts) {
                    var spIb = oldVariantIb.sub_parts[skIb];
                    if (spIb && spIb.interact_boxes) {
                        for (var ibKey in spIb.interact_boxes) {
                            if (spIb.interact_boxes[ibKey]._uuid === uuid) {
                                delete spIb.interact_boxes[ibKey];
                                log.debug('setMarker: 覆盖旧 interact_box 标记，已清理 interact_boxes 条目', {
                                    partId, variant: variantName, spKey: skIb, ibKey: ibKey,
                                });
                            }
                        }
                    }
                }
            }
        } else if (oldMarker.type === 'connector') {
            // 旧标记为连接点但没有清理连接的 connectors 条目的逻辑（已知问题）
            log.warn('setMarker: 覆盖旧 connector 标记，但未清理 connectors 条目', {
                partId, variant: variantName, uuid, oldConfigRef: oldMarker.config_ref,
            });
        } else if (oldMarker.type === 'sub_part' && oldMarker.config_ref) {
            var oldVariant2 = part.variants && part.variants[variantName];
            if (oldVariant2 && oldVariant2.sub_parts && oldVariant2.sub_parts[oldMarker.config_ref]) {
                delete oldVariant2.sub_parts[oldMarker.config_ref];
                log.debug('setMarker: 覆盖旧 sub_part 标记，已清理 sub_parts 条目', {
                    partId, variant: variantName, spKey: oldMarker.config_ref,
                });
                // 删除子零件后重算 auto_end_bones，确保上级子零件的自动排除列表更新
                recalcAutoEndBones(projectConfig, partId, variantName);
            }
        }
    }

    // 标记为子零件时自动在 variant.sub_parts 中创建配置对象
    // configRef 为翻译键格式（如 sub_part.machine_max.main）
    if (type === 'sub_part' && configRef) {
        const variant = part.variants && part.variants[variantName];
        if (variant) {
            const spKey = configRef;
            if (!variant.sub_parts) {
                variant.sub_parts = {};
            }
            if (!variant.sub_parts[spKey]) {
                // 从 Group UUID 查找实际骨骼名用于 start_bone
                var groupEl = (typeof Group !== 'undefined') ? Group.all.find(function(g) { return g.uuid === uuid; }) : null;
                const spConfig = createSubPartConfig();
                spConfig.start_bone = groupEl ? groupEl.name : configRef;
                variant.sub_parts[spKey] = spConfig;
                log.debug('setMarker: 已创建子零件配置', { partId, variant: variantName, key: spKey, start_bone: spConfig.start_bone });
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

// 注：本函数使用 delete 操作符（lines 143, 154, 160, 164）删除对象属性，
// Vue 2 无法拦截 delete 操作，但调用方随后会调用 saveConfig() 保存配置
// 并通过 refreshOutlinerIcons() 触发 UI 重绘。详见文件顶部注释。
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
    log.debug('clearMarker: 开始清除标记', {
        partId, variant: variantName, uuid, markerType: marker ? marker.type : 'N/A',
        configRef: marker ? marker.config_ref : 'N/A',
    });

    // 清理碰撞箱标记对应的 sub_part.hit_boxes 条目
    // hit_boxes 的 key 现在是 UUID，直接通过 uuid 删除
    if (marker && marker.type === 'hit_box' && marker.config_ref) {
        var variant = part.variants && part.variants[variantName];
        if (variant && variant.sub_parts && variant.sub_parts[marker.config_ref]) {
            var sp = variant.sub_parts[marker.config_ref];
            var hitBoxesBefore = sp.hit_boxes ? Object.keys(sp.hit_boxes) : [];
            if (sp.hit_boxes) {
                var found = sp.hit_boxes[uuid] !== undefined;
                delete sp.hit_boxes[uuid];
                log.debug('clearMarker: 碰撞箱条目清理', {
                    partId, variant: variantName, spKey: marker.config_ref, uuid,
                    wasFound: found,
                    hitBoxesBefore: hitBoxesBefore,
                    hitBoxesAfter: Object.keys(sp.hit_boxes),
                    stillHasKey: sp.hit_boxes[uuid] !== undefined,
                });
            }
        } else {
            log.debug('clearMarker: 碰撞箱所属子零件不存在，跳过', {
                partId, variant: variantName, spKey: marker.config_ref,
                variantExists: !!variant,
                subPartsExists: variant ? !!variant.sub_parts : false,
                spExists: variant && variant.sub_parts ? !!variant.sub_parts[marker.config_ref] : false,
            });
        }
    }

    // 清理交互区标记对应的 sub_part.interact_boxes 条目
    if (marker && marker.type === 'interact_box') {
        var variantIb = part.variants && part.variants[variantName];
        var foundIb = false;
        if (variantIb && variantIb.sub_parts) {
            for (var skIb in variantIb.sub_parts) {
                var spIb = variantIb.sub_parts[skIb];
                if (spIb && spIb.interact_boxes) {
                    for (var ibKey in spIb.interact_boxes) {
                        if (spIb.interact_boxes[ibKey]._uuid === uuid) {
                            delete spIb.interact_boxes[ibKey];
                            foundIb = true;
                            log.debug('clearMarker: 交互区条目清理', {
                                partId, variant: variantName, spKey: skIb,
                                ibKey: ibKey, uuid: uuid,
                            });
                            break;
                        }
                    }
                }
                if (foundIb) break;
            }
        }
        if (!foundIb) {
            log.debug('clearMarker: 交互区未找到匹配条目', {
                partId, variant: variantName, uuid,
            });
        }
    }

    // 清理连接点标记对应的 sub_part.connectors 条目
    if (marker && marker.type === 'connector') {
        var variant = part.variants && part.variants[variantName];
        var foundAnyMatch = false;
        if (variant && variant.sub_parts) {
            var el = (typeof Locator !== 'undefined' && Locator.all) ? Locator.all.find(function(l) { return l.uuid === uuid; }) : null;
            log.debug('clearMarker: 连接点 Locator 查找结果', {
                uuid, locatorFound: !!el, locatorName: el ? el.name : null,
                subPartCount: Object.keys(variant.sub_parts).length,
                subPartKeys: Object.keys(variant.sub_parts),
            });
            if (el) {
                // 遍历所有子零件，通过 locator 字段匹配连接点条目
                for (var sk in variant.sub_parts) {
                    if (variant.sub_parts[sk].connectors) {
                        var connKeysBefore = Object.keys(variant.sub_parts[sk].connectors);
                        // 连接点 key 现在是翻译键格式，通过 locator 字段匹配
                        for (var connKey in variant.sub_parts[sk].connectors) {
                            var conn = variant.sub_parts[sk].connectors[connKey];
                            if (conn.locator === el.name) {
                                delete variant.sub_parts[sk].connectors[connKey];
                                foundAnyMatch = true;
                                log.debug('clearMarker: 连接点条目清理', {
                                    partId, variant: variantName, spKey: sk, connKey: connKey,
                                    locator: el.name,
                                    connKeysBefore: connKeysBefore,
                                    connKeysAfter: Object.keys(variant.sub_parts[sk].connectors),
                                });
                                break;
                            }
                        }
                        // 如果没有匹配到，记录每个条目的 locator 以便调试
                        if (!foundAnyMatch) {
                            var connEntries = {};
                            for (var ck in variant.sub_parts[sk].connectors) {
                                connEntries[ck] = variant.sub_parts[sk].connectors[ck].locator;
                            }
                            log.debug('clearMarker: 连接点未匹配到任何条目（子零件 ' + sk + '）', {
                                targetLocator: el.name,
                                existingConnectorLocators: connEntries,
                            });
                        }
                    }
                }
            }
        }
        if (!foundAnyMatch) {
            log.warn('clearMarker: 连接点标记清除但未找到匹配的子零件连接点条目', {
                partId, variant: variantName, uuid, locatorName: el ? el.name : 'unknown',
            });
        }
    }

    // 清理子零件标记对应的 sub_parts 条目及其 auto_end_bones
    if (marker && marker.type === 'sub_part' && marker.config_ref) {
        var spKey = marker.config_ref;
        var variant = part.variants && part.variants[variantName];
        if (variant && variant.sub_parts) {
            delete variant.sub_parts[spKey];
            log.debug('clearMarker: 已清理 sub_parts 条目', { partId, variant: variantName, spKey: spKey });
            // 先删除标记，再重算 auto_end_bones。
            // 避免已删除的子零件标记仍被 recalcAutoEndBones 收集到，
            // 重新被加入父级子零件的自动排除列表。
            delete part.element_markers[variantName][uuid];
            recalcAutoEndBones(projectConfig, partId, variantName);
            // 标记已被提前删除，跳过行尾的统一删除（置 null 防双重删除）
            marker = null;
        }
    }

    if (marker) {
        delete part.element_markers[variantName][uuid];
    }
    log.debug('clearMarker: 标记已从 element_markers 字典删除', {
        partId: partId, variant: variantName, uuid,
        remainingMarkers: Object.keys(part.element_markers[variantName] || {}),
    });

    if (Object.keys(part.element_markers[variantName]).length === 0) {
        delete part.element_markers[variantName];
        log.debug('clearMarker: 变体标记字典已清空', { partId: partId, variant: variantName });
    }

    // 输出最终状态摘要：记录当前 variant.sub_parts 下所有子零件的 hit_boxes 和 connectors 状态
    var variant = part.variants && part.variants[variantName];
    if (variant && variant.sub_parts) {
        var stateSummary = {};
        for (var spKey in variant.sub_parts) {
            var sp = variant.sub_parts[spKey];
            stateSummary[spKey] = {
                hitBoxKeys: sp.hit_boxes ? Object.keys(sp.hit_boxes) : [],
                interactBoxKeys: sp.interact_boxes ? Object.keys(sp.interact_boxes) : [],
                connectorKeys: sp.connectors ? Object.keys(sp.connectors) : [],
            };
        }
        log.debug('clearMarker: 清理后 sub_parts 状态摘要', {
            partId: partId, variant: variantName, subParts: stateSummary,
        });
    }

    return true;
}

/**
 * 根据当前所有子零件标记，重新计算各个子零件的 auto_end_bones
 * 子零件 B 是子零件 A 的后代 → B 的起点骨骼名（B 所属 Group 的名称）自动加入 A 的 auto_end_bones。
 * 注意：auto_end_bones 列表存的是"骨骼名"，而非子零件的 config_ref（翻译键）。
 */
// 注：本函数使用直接赋值修改 variant.sub_parts[key].auto_end_bones（line 196），
// 以及在循环中对 auto_end_bones 数组使用 push（line 210）。
// push 在 Vue 2 中是响应式的，但直接赋值需要调用方后续触发 saveConfig。
// 详见文件顶部注释。
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
                // auto_end_bones 里存的是"骨骼名"，需取子零件起点骨骼（Group）的名称，
                // 而不是 config_ref（子零件翻译键，如 sub_part.machine_max.main）。
                name: grp.name,
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

// 注：本函数使用 delete 操作符（line 244）和直接赋值（line 247: part.element_markers = {}），
// Vue 2 无法拦截这些操作，但调用方随后会触发 UI 刷新。详见文件顶部注释。
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

/**
 * 按清理策略删除标记条目（docs/13 §5.3.1、§7.1）。
 *
 * 只删 element_markers 条目，不触发 clearMarker 的下游配置清理，也不重算
 * auto_end_bones —— 旧子树会被整件写入替换，提前清配置只会制造中间态。
 *
 * @param {Object} projectConfig
 * @param {Object} cleanup - { scope:'part'|'variant'|'sub_part', partId, variantName?, config_refs?, uuids? }
 * @returns {{removed: number}}
 */
function clearMarkerScope(projectConfig, cleanup) {
    var removed = 0;
    if (!projectConfig || !cleanup || !cleanup.partId) return { removed: 0 };
    var part = projectConfig.parts && projectConfig.parts[cleanup.partId];
    if (!part || !part.element_markers) return { removed: 0 };

    if (cleanup.scope === 'part') {
        removed = Object.keys(part.element_markers).reduce(function (n, variantName) {
            return n + Object.keys(part.element_markers[variantName] || {}).length;
        }, 0);
        part.element_markers = {};
        return { removed: removed };
    }

    var markers = part.element_markers[cleanup.variantName];
    if (!markers) return { removed: 0 };

    if (cleanup.scope === 'variant') {
        removed = Object.keys(markers).length;
        delete part.element_markers[cleanup.variantName];
        return { removed: removed };
    }

    if (cleanup.scope === 'sub_part') {
        var refs = cleanup.config_refs || [];
        var uuids = cleanup.uuids || [];
        Object.keys(markers).forEach(function (uuid) {
            var marker = markers[uuid];
            var hit = uuids.indexOf(uuid) >= 0
                || (marker && refs.indexOf(marker.config_ref) >= 0);
            if (!hit) return;
            delete markers[uuid];
            removed++;
        });
    }
    return { removed: removed };
}

/**
 * 把 connector marker 的 config_ref 从 definition 迁移为连接点 key（docs/13 §15.2.1）。
 *
 * 定序匹配：已是 key → `_marker_uuid` 精确匹配 → Locator 名全局唯一 →
 * 祖先子零件内唯一。definition 不参与匹配；无法唯一命中时保留
 * `legacy_config_ref`、`config_ref:null` 并记 warning，不猜、不删 marker。
 * 幂等：已迁移的 marker 原样保留。
 *
 * @param {Object} projectConfig
 * @returns {{migrated:number, warnings:Array, entries:Array}}
 */
function migrateConnectorMarkerRefs(projectConfig) {
    var migrated = 0;
    var warnings = [];
    var entries = [];
    if (!projectConfig || !projectConfig.parts) return { migrated: 0, warnings: warnings, entries: entries };

    Object.keys(projectConfig.parts).forEach(function (partId) {
        var part = projectConfig.parts[partId];
        if (!part || !part.element_markers || !part.variants) return;

        Object.keys(part.element_markers).forEach(function (variantName) {
            var markers = part.element_markers[variantName];
            var variant = part.variants[variantName];
            if (!markers || !variant) return;

            // 收集本变体全部 connector 条目
            var connectors = [];
            var subParts = variant.sub_parts || {};
            Object.keys(subParts).forEach(function (spKey) {
                var map = (subParts[spKey] && subParts[spKey].connectors) || {};
                Object.keys(map).forEach(function (ck) {
                    connectors.push({ spKey: spKey, key: ck, conn: map[ck] });
                });
            });
            var keys = connectors.map(function (c) { return c.key; });

            Object.keys(markers).forEach(function (uuid) {
                var marker = markers[uuid];
                if (!marker || marker.type !== 'connector') return;

                // 1) 已经是 key
                if (typeof marker.config_ref === 'string' && keys.indexOf(marker.config_ref) >= 0) {
                    return;
                }

                var legacy = marker.config_ref;
                var match = null;
                var hadCandidate = false;

                // 2) _marker_uuid 精确匹配
                var byUuid = connectors.filter(function (c) {
                    return c.conn && c.conn._marker_uuid === uuid;
                });
                if (byUuid.length > 0) hadCandidate = true;
                if (byUuid.length === 1) match = byUuid[0];

                // 3) Locator 名全局唯一
                if (!match) {
                    var locator = null;
                    if (typeof Locator !== 'undefined' && Locator.all) {
                        locator = Locator.all.find(function (l) { return l.uuid === uuid; }) || null;
                    }
                    var locName = locator ? locator.name : null;
                    if (locName) {
                        var byName = connectors.filter(function (c) {
                            return c.conn && c.conn.locator === locName;
                        });
                        if (byName.length > 0) hadCandidate = true;
                        if (byName.length === 1) {
                            match = byName[0];
                        } else if (byName.length > 1) {
                            // 4) 所属子零件内唯一
                            var owner = locator
                                ? detectOwnerSubPart(projectConfig, partId, variantName, locator)
                                : null;
                            if (owner) {
                                var byOwner = byName.filter(function (c) { return c.spKey === owner.spKey; });
                                if (byOwner.length === 1) match = byOwner[0];
                            }
                        }
                    }
                }

                if (!match) {
                    marker.legacy_config_ref = legacy;
                    marker.config_ref = null;
                    var reason = hadCandidate ? 'ambiguous_connector' : 'connector_not_found';
                    entries.push({
                        partId: partId,
                        variantName: variantName,
                        uuid: uuid,
                        reason: reason,
                        legacy_config_ref: legacy,
                    });
                    warnings.push({
                        code: 'unresolved_config_ref',
                        path: ['parts', partId, 'element_markers', variantName, uuid],
                        expected: '连接点 key',
                        got: legacy,
                        hint: '无法唯一匹配连接点，已保留 legacy_config_ref',
                    });
                    return;
                }

                marker.config_ref = match.key;
                if (match.conn && !match.conn._marker_uuid) match.conn._marker_uuid = uuid;
                migrated++;
            });
        });
    });

    if (entries.length > 0) {
        if (!projectConfig._lastMigration || typeof projectConfig._lastMigration !== 'object') {
            projectConfig._lastMigration = {};
        }
        projectConfig._lastMigration.marker_refs = entries;
    } else if (projectConfig._lastMigration && projectConfig._lastMigration.marker_refs) {
        delete projectConfig._lastMigration.marker_refs;
    }

    return { migrated: migrated, warnings: warnings, entries: entries };
}

/**
 * 判断字符串是否像 Blockbench UUID（格式：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx）
 * 用于区分旧格式数据中的骨骼名 key 和 UUID key
 * @param {string} str
 * @returns {boolean}
 */
function _looksLikeUUID(str) {
    if (typeof str !== 'string' || str.length < 32) return false;
    // UUID 特征：含连字符，长度在 32-40 之间（标准 UUID 36 字符）
    return str.indexOf('-') >= 0 && str.length >= 32 && str.length <= 40;
}

/**
 * 清理幽灵标记：遍历所有 element_markers，删除那些 UUID 对应的 Blockbench 元素
 * （Group/Locator）已不存在的条目，并清理其关联的下游配置。
 *
 * 使用场景：加载已保存的 .bbmodel 后，用户可能已在 Blockbench 中删除了某些骨骼或定位器，
 * 但 element_markers 字典中仍保留了对应的标记条目，形成无法通过 UI 删除的"幽灵条目"。
 * 在 loadConfig 时调用此函数可自动清理这些无效条目。
 *
 * @param {Object} projectConfig - MM 项目配置
 * @returns {{ cleanedCount: number, details: Array }} 清理统计信息
 */
function cleanGhostMarkers(projectConfig) {
    if (!projectConfig || !projectConfig.parts) {
        log.debug('cleanGhostMarkers: 无零件配置，跳过');
        return { cleanedCount: 0, details: [] };
    }

    // 构建当前模型中所有有效元素的 UUID 集合
    var validUUIDs = {};
    var allGroups = (typeof Group !== 'undefined' && Group.all) ? Group.all : [];
    var allLocators = (typeof Locator !== 'undefined' && Locator.all) ? Locator.all : [];

    for (var gi = 0; gi < allGroups.length; gi++) {
        validUUIDs[allGroups[gi].uuid] = true;
    }
    for (var li = 0; li < allLocators.length; li++) {
        validUUIDs[allLocators[li].uuid] = true;
    }

    log.debug('cleanGhostMarkers: 模型统计', {
        totalGroups: allGroups.length,
        totalLocators: allLocators.length,
        totalParts: Object.keys(projectConfig.parts).length,
    });

    var cleanedCount = 0;
    var details = [];

    var partIds = Object.keys(projectConfig.parts);
    for (var pi = 0; pi < partIds.length; pi++) {
        var partId = partIds[pi];
        var part = projectConfig.parts[partId];
        if (!part.element_markers) {
            log.debug('cleanGhostMarkers: 零件无 element_markers', { partId: partId });
            continue;
        }

        var variantNames = Object.keys(part.element_markers);
        log.debug('cleanGhostMarkers: 零件标记概况', {
            partId: partId,
            variantCount: variantNames.length,
        });

        for (var vi = 0; vi < variantNames.length; vi++) {
            var variantName = variantNames[vi];
            var markers = part.element_markers[variantName];
            var markerCount = Object.keys(markers).length;
            var ghostUUIDs = [];

            // 收集本变体中所有幽灵标记的 UUID
            for (var uuid in markers) {
                if (!validUUIDs[uuid]) {
                    ghostUUIDs.push({ uuid: uuid, marker: markers[uuid] });
                }
            }

            if (ghostUUIDs.length === 0 && markerCount > 0) {
                log.debug('cleanGhostMarkers: 变体标记全部有效', {
                    partId: partId, variant: variantName, markerCount: markerCount,
                });
            }

            // 对每个幽灵标记执行清理
            for (var gi2 = 0; gi2 < ghostUUIDs.length; gi2++) {
                var ghost = ghostUUIDs[gi2];
                var marker = ghost.marker;

                log.warn('cleanGhostMarkers: 发现幽灵标记', {
                    partId: partId,
                    variant: variantName,
                    uuid: ghost.uuid,
                    type: marker.type,
                    configRef: marker.config_ref,
                });

                // 第一轮：清理关联的下游配置（复用 clearMarker 的下游清理逻辑）
                _cleanMarkerDownstream(projectConfig, partId, variantName, ghost.uuid, marker);

                // 删除标记条目
                delete markers[ghost.uuid];

                cleanedCount++;
                details.push({
                    partId: partId,
                    variant: variantName,
                    uuid: ghost.uuid,
                    type: marker.type,
                    configRef: marker.config_ref,
                });
            }

            // 若变体的标记字典已空，删除变体条目
            if (ghostUUIDs.length > 0 && Object.keys(markers).length === 0) {
                delete part.element_markers[variantName];
                log.debug('cleanGhostMarkers: 变体标记字典已清空', { partId: partId, variant: variantName });
            }
        }
    }

    if (cleanedCount > 0) {
        log.info('cleanGhostMarkers: 清理完成，共移除 ' + cleanedCount + ' 个幽灵标记', { details: details });
    } else {
        log.debug('cleanGhostMarkers: 未发现幽灵标记');
    }

    return { cleanedCount: cleanedCount, details: details };
}

/**
 * 内部函数：清理幽灵标记关联的下游配置
 * 与 clearMarker 中的下游清理逻辑保持一致，但不操作 element_markers 本身
 *
 * @param {Object} projectConfig
 * @param {string} partId
 * @param {string} variantName
 * @param {string} uuid - 幽灵标记的 UUID
 * @param {Object} marker - 标记信息 { type, config_ref }
 */
function _cleanMarkerDownstream(projectConfig, partId, variantName, uuid, marker) {
    var part = projectConfig.parts[partId];
    if (!part || !part.variants) return;
    var variant = part.variants[variantName];
    if (!variant || !variant.sub_parts) return;

    if (marker.type === 'sub_part' && marker.config_ref) {
        // 清理子零件配置及其下的碰撞箱、交互区、连接点
        if (variant.sub_parts[marker.config_ref]) {
            delete variant.sub_parts[marker.config_ref];
            log.debug('cleanGhostMarkers: 已清理幽灵子零件配置', {
                partId: partId, variant: variantName, spKey: marker.config_ref,
            });
            // 清理后重算 auto_end_bones
            recalcAutoEndBones(projectConfig, partId, variantName);
        }
    } else if (marker.type === 'hit_box' && marker.config_ref) {
        // 清理碰撞箱条目（key 为 UUID）
        var sp = variant.sub_parts[marker.config_ref];
        if (sp && sp.hit_boxes && sp.hit_boxes[uuid] !== undefined) {
            delete sp.hit_boxes[uuid];
            log.debug('cleanGhostMarkers: 已清理幽灵碰撞箱条目', {
                partId: partId, variant: variantName, spKey: marker.config_ref, uuid: uuid,
            });
        }
    } else if (marker.type === 'interact_box') {
        // 按 _uuid 字段清理交互区条目
        for (var sk in variant.sub_parts) {
            var spIb = variant.sub_parts[sk];
            if (spIb && spIb.interact_boxes) {
                for (var ibKey in spIb.interact_boxes) {
                    if (spIb.interact_boxes[ibKey]._uuid === uuid) {
                        delete spIb.interact_boxes[ibKey];
                        log.debug('cleanGhostMarkers: 已清理幽灵交互区条目', {
                            partId: partId, variant: variantName, spKey: sk, ibKey: ibKey, uuid: uuid,
                        });
                    }
                }
            }
        }
    } else if (marker.type === 'connector') {
        // 连接点：由于元素已不存在，无法通过 locator 名称匹配，
        // 只能遍历所有子零件的 connectors，通过 uuid 历史信息尝试匹配。
        // 如果无法匹配则保留（需用户手动清理），记录警告。
        var foundConn = false;
        for (var sk in variant.sub_parts) {
            var spConn = variant.sub_parts[sk];
            if (spConn && spConn.connectors) {
                for (var ck in spConn.connectors) {
                    var conn = spConn.connectors[ck];
                    // 连接点条目可能通过 _marker_uuid 字段关联（如果存在）
                    // 也可能只能通过 locator 名称匹配（但元素已删除无法获取名称）
                    if (conn._marker_uuid === uuid) {
                        delete spConn.connectors[ck];
                        foundConn = true;
                        log.debug('cleanGhostMarkers: 已清理幽灵连接点条目', {
                            partId: partId, variant: variantName, spKey: sk, connKey: ck, uuid: uuid,
                        });
                        break;
                    }
                }
            }
            if (foundConn) break;
        }
        if (!foundConn) {
            log.warn('cleanGhostMarkers: 无法匹配幽灵连接点的下游条目（缺少 _marker_uuid 字段）', {
                partId: partId, variant: variantName, uuid: uuid,
            });
        }
    }
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
        clearMarkerScope,
        getMarkersForVariant,
        detectOwnerSubPart,
        recalcAutoEndBones,
        cleanGhostMarkers,
        migrateConnectorMarkerRefs,
    };
}
