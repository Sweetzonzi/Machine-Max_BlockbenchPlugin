// 文件: src/doc/projection.js
// 用途: 内部树 ↔ 对外定义投影（docs/13 §5.3）
// 所属模块: MachineMax Blockbench 插件
//
// `in(definition, ctx)` 顺序固定：归一化简写 → 归一化未配置占位 → 剥内部字段
// → 校验 key → 严格解码 → 校验值 → 解析骨骼引用 → 校验配置引用
// → 生成 markerPlan / markerCleanup。
// `out(node, ctx, opts)` 反向：深拷贝 → 剥内部字段 → hit_boxes key 反转
// → read 保持 map / export 折叠。
//
// 本模块不写全局对象；markerPlan / markerCleanup 只是策略，由 ops 落地。

'use strict';

var fieldSpecs = require('./field_specs.js');
var keys = require('./keys.js');
var shapes = require('./shapes.js');
var validate = require('./validate.js');
var refs = require('./refs.js');
var ports = require('./ports.js');

var PLACEHOLDER_PREFIX = '__new_p_';

function isObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function own(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function clone(v) {
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(clone);
    var out = {};
    Object.keys(v).forEach(function (k) { out[k] = clone(v[k]); });
    return out;
}

function mergeErrors(base, errors) {
    return (base || []).concat(errors || []);
}

// ── 简写归一化 ──────────────────────────────────────────────────

function looksLikeSubPartShorthand(value) {
    if (!isObject(value)) return false;
    if (typeof value.start_bone === 'string') return true;
    if (typeof value.mass === 'number') return true;
    if (isObject(value.hit_boxes)) {
        var keysList = Object.keys(value.hit_boxes);
        for (var i = 0; i < keysList.length; i++) {
            var hb = value.hit_boxes[keysList[i]];
            if (isObject(hb) && typeof hb.type === 'string') return true;
        }
    }
    return false;
}

function normalizeShorthand(kind, definition, ctx) {
    var node = clone(definition || {});
    var ns = keys.isValidNamespace(ctx && ctx.namespace) ? ctx.namespace : 'machine_max';

    if (kind === 'part') {
        if (isObject(node.variants) && typeof node.variants.model === 'string') {
            node.variants = { default: node.variants };
        }
        if (isObject(node.variants)) {
            Object.keys(node.variants).forEach(function (name) {
                node.variants[name] = normalizeShorthand('variant', node.variants[name], {
                    namespace: ns,
                });
            });
        }
    } else if (kind === 'variant') {
        if (typeof node.textures === 'string') {
            node.textures = { default: node.textures };
        }
        if (isObject(node.sub_parts) && looksLikeSubPartShorthand(node.sub_parts)) {
            var wrapped = {};
            wrapped['sub_part.' + ns + '.main'] = node.sub_parts;
            node.sub_parts = wrapped;
        }
        if (isObject(node.sub_parts)) {
            Object.keys(node.sub_parts).forEach(function (key) {
                node.sub_parts[key] = normalizeShorthand('sub_part', node.sub_parts[key], {
                    namespace: ns,
                });
            });
        }
    }

    return node;
}

// ── 未配置占位归一化 ────────────────────────────────────────────

function isRequiredMapSpec(spec) {
    return !!(spec && spec.required && spec.type === 'object'
        && spec.additionalProperties !== undefined);
}

function normalizeUnset(kind, definition) {
    var node = clone(definition || {});
    var spec = fieldSpecs.getSpec(kind, node.type);
    if (spec) {
        Object.keys(spec.fields).forEach(function (field) {
            if (!own(node, field)) return;
            var fieldSpec = spec.fields[field];
            var value = node[field];

            if (fieldSpec.required && fieldSpec.type === 'string'
                && (value === null || value === 'null')) {
                node[field] = '';
                return;
            }
            if (isRequiredMapSpec(fieldSpec)
                && (value === null || (field === 'projectile_types' && Array.isArray(value)))) {
                node[field] = {};
                return;
            }
            if (value === null && !fieldSpec.nullable) {
                delete node[field];
            }
        });
    }

    // 递归容器
    fieldSpecs.getContainers(kind).forEach(function (container) {
        var childKind = fieldSpecs.getContainerChildKind(container);
        var entries = node[container];
        if (!isObject(entries)) return;
        Object.keys(entries).forEach(function (key) {
            entries[key] = normalizeUnset(childKind, entries[key]);
        });
    });

    return node;
}

// ── 剥内部字段 ──────────────────────────────────────────────────

function stripInternal(kind, definition) {
    var node = clone(definition || {});
    if (!isObject(node)) return node;

    delete node._uiState;
    fieldSpecs.getInternalFields(kind).forEach(function (field) {
        delete node[field];
    });

    fieldSpecs.getContainers(kind).forEach(function (container) {
        var childKind = fieldSpecs.getContainerChildKind(container);
        var entries = node[container];
        if (!isObject(entries)) return;
        Object.keys(entries).forEach(function (key) {
            entries[key] = stripInternal(childKind, entries[key]);
        });
    });

    if (kind === 'subsystem' && isObject(node.projectile_types)) {
        Object.keys(node.projectile_types).forEach(function (key) {
            if (key.indexOf(PLACEHOLDER_PREFIX) === 0) delete node.projectile_types[key];
        });
    }

    return node;
}

// ── 骨骼引用 ────────────────────────────────────────────────────

function resolveHitBoxKeys(kind, node, unresolved, basePath) {
    if (kind === 'sub_part' && isObject(node.hit_boxes)) {
        var bones = ports.get().bones;
        var next = {};
        Object.keys(node.hit_boxes).forEach(function (key) {
            if (bones.findByUuid(key)) {
                next[key] = node.hit_boxes[key];
                return;
            }
            var el = bones.findByName(key);
            if (el && el.uuid) {
                next[el.uuid] = node.hit_boxes[key];
            } else {
                next[key] = node.hit_boxes[key];
                unresolved.push({
                    bone: key,
                    field: 'hit_box_key',
                    subPartKey: null,
                    key: key,
                    path: (basePath || []).concat(['hit_boxes', key]),
                });
            }
        });
        node.hit_boxes = next;
    }

    fieldSpecs.getContainers(kind).forEach(function (container) {
        var childKind = fieldSpecs.getContainerChildKind(container);
        var entries = node[container];
        if (!isObject(entries)) return;
        Object.keys(entries).forEach(function (key) {
            resolveHitBoxKeys(childKind, entries[key], unresolved,
                (basePath || []).concat([container, key]));
        });
    });
}

/**
 * 修复存量配置里用骨骼名当 hit_boxes key 的条目，原位改成 UUID。
 *
 * 只处理能解析到骨骼的名字；解析不到的原样保留并记入 unresolved，交给校验报错。
 * 幂等：已经是 UUID 的 key 不动。
 */
function repairHitBoxKeys(config) {
    var fixed = 0;
    var unresolved = [];
    var bones = ports.get().bones;
    var parts = (config && config.parts) || {};

    Object.keys(parts).forEach(function (partId) {
        var variants = (parts[partId] && parts[partId].variants) || {};
        Object.keys(variants).forEach(function (variantName) {
            var subParts = (variants[variantName] && variants[variantName].sub_parts) || {};
            Object.keys(subParts).forEach(function (spKey) {
                var sp = subParts[spKey];
                if (!isObject(sp) || !isObject(sp.hit_boxes)) return;

                var next = {};
                Object.keys(sp.hit_boxes).forEach(function (key) {
                    var uuid = bones.findByUuid(key) ? key : null;
                    if (!uuid) {
                        var el = bones.findByName(key);
                        if (el && el.uuid) uuid = el.uuid;
                    }
                    if (!uuid) {
                        next[key] = sp.hit_boxes[key];
                        unresolved.push({
                            bone: key,
                            field: 'hit_box_key',
                            path: ['parts', partId, 'variants', variantName,
                                'sub_parts', spKey, 'hit_boxes', key],
                        });
                        return;
                    }
                    if (uuid !== key) fixed += 1;
                    next[uuid] = sp.hit_boxes[key];
                });
                sp.hit_boxes = next;
            });
        });
    });

    return { repaired: fixed, unresolved: unresolved };
}

function resolveElementRefs(kind, node, unresolved, basePath) {
    var bones = ports.get().bones;

    if (kind === 'sub_part' && isObject(node.interact_boxes)) {
        Object.keys(node.interact_boxes).forEach(function (key) {
            var ib = node.interact_boxes[key];
            if (!isObject(ib) || !ib.bone) return;
            var el = bones.findByName(ib.bone);
            if (el && el.uuid) {
                ib._uuid = el.uuid;
            } else {
                unresolved.push({
                    bone: ib.bone,
                    field: 'interact_box.bone',
                    subPartKey: null,
                    key: key,
                    path: (basePath || []).concat(['interact_boxes', key, 'bone']),
                });
            }
        });
    }

    if (kind === 'sub_part' && isObject(node.connectors)) {
        Object.keys(node.connectors).forEach(function (key) {
            var conn = node.connectors[key];
            if (!isObject(conn) || !conn.locator) return;
            var el = bones.findByName(conn.locator);
            if (el && el.uuid) {
                conn._marker_uuid = el.uuid;
            } else {
                unresolved.push({
                    bone: conn.locator,
                    field: 'connector.locator',
                    subPartKey: null,
                    key: key,
                    path: (basePath || []).concat(['connectors', key, 'locator']),
                });
            }
        });
    }

    fieldSpecs.getContainers(kind).forEach(function (container) {
        var childKind = fieldSpecs.getContainerChildKind(container);
        var entries = node[container];
        if (!isObject(entries)) return;
        Object.keys(entries).forEach(function (key) {
            resolveElementRefs(childKind, entries[key], unresolved,
                (basePath || []).concat([container, key]));
        });
    });
}

// ── markerPlan / markerCleanup ──────────────────────────────────

var MARKER_PRECEDENCE = ['sub_part', 'interact_box', 'connector', 'hit_box'];

function addMarker(plan, byKey, entry, warnings) {
    var key = entry.variantName + '|' + entry.uuid;
    if (byKey[key]) {
        var current = byKey[key];
        var currentRank = MARKER_PRECEDENCE.indexOf(current.type);
        var nextRank = MARKER_PRECEDENCE.indexOf(entry.type);
        if (nextRank < currentRank) {
            warnings.push({
                code: 'marker_conflict',
                path: ['parts', entry.partId, 'variants', entry.variantName],
                expected: current.type + ' > ' + entry.type,
                got: entry.uuid,
                hint: '同一 UUID 落在多个标记类型，按 sub_part > interact_box > connector > hit_box 保留',
            });
            byKey[key] = entry;
            plan[plan.indexOf(current)] = entry;
        } else {
            warnings.push({
                code: 'marker_conflict',
                path: ['parts', entry.partId, 'variants', entry.variantName],
                expected: entry.type + ' < ' + current.type,
                got: entry.uuid,
                hint: '同一 UUID 落在多个标记类型，已保留优先级更高的一条',
            });
        }
        return;
    }
    byKey[key] = entry;
    plan.push(entry);
}

function planForSubPart(partId, variantName, spKey, sp, plan, byKey, warnings) {
    var bones = ports.get().bones;
    if (!isObject(sp)) return;

    var start = sp.start_bone ? bones.findByName(sp.start_bone) : null;
    if (start && start.uuid) {
        addMarker(plan, byKey, {
            partId: partId,
            variantName: variantName,
            type: 'sub_part',
            uuid: start.uuid,
            config_ref: spKey,
        }, warnings);
    }

    if (isObject(sp.hit_boxes)) {
        Object.keys(sp.hit_boxes).forEach(function (key) {
            var el = bones.findByUuid(key) || bones.findByName(key);
            if (el && el.uuid) {
                addMarker(plan, byKey, {
                    partId: partId,
                    variantName: variantName,
                    type: 'hit_box',
                    uuid: el.uuid,
                    config_ref: spKey,
                }, warnings);
            }
        });
    }

    if (isObject(sp.interact_boxes)) {
        Object.keys(sp.interact_boxes).forEach(function (key) {
            var ib = sp.interact_boxes[key];
            var el = ib && ib.bone ? bones.findByName(ib.bone) : null;
            if (el && el.uuid) {
                addMarker(plan, byKey, {
                    partId: partId,
                    variantName: variantName,
                    type: 'interact_box',
                    uuid: el.uuid,
                    config_ref: key,
                }, warnings);
            }
        });
    }

    if (isObject(sp.connectors)) {
        Object.keys(sp.connectors).forEach(function (key) {
            var conn = sp.connectors[key];
            var el = conn && conn.locator ? bones.findByName(conn.locator) : null;
            if (el && el.uuid) {
                addMarker(plan, byKey, {
                    partId: partId,
                    variantName: variantName,
                    type: 'connector',
                    uuid: el.uuid,
                    config_ref: key,
                }, warnings);
            }
        });
    }
}

function buildMarkerPlan(kind, node, ctx) {
    var plan = [];
    var byKey = {};
    var warnings = [];
    var partId = ctx.partId || '';
    var variantName = ctx.variantName || '';

    if (kind === 'part' && isObject(node.variants)) {
        Object.keys(node.variants).forEach(function (vName) {
            var variant = node.variants[vName];
            if (!isObject(variant) || !isObject(variant.sub_parts)) return;
            Object.keys(variant.sub_parts).forEach(function (spKey) {
                planForSubPart(partId, vName, spKey, variant.sub_parts[spKey],
                    plan, byKey, warnings);
            });
        });
    } else if (kind === 'variant' && isObject(node.sub_parts)) {
        Object.keys(node.sub_parts).forEach(function (spKey) {
            planForSubPart(partId, variantName, spKey, node.sub_parts[spKey],
                plan, byKey, warnings);
        });
    } else if (kind === 'sub_part') {
        planForSubPart(partId, variantName, ctx.subPartKey || ctx.key || '', node,
            plan, byKey, warnings);
    }

    return { plan: plan, warnings: warnings };
}

function buildMarkerCleanup(kind, ctx) {
    if (!ctx || ctx.mode === 'create') return null;
    var existing = ctx.existing;
    if (!existing) return null;

    if (kind === 'part') {
        return { scope: 'part', partId: ctx.oldKey || ctx.partId };
    }
    if (kind === 'variant') {
        return {
            scope: 'variant',
            partId: ctx.partId,
            variantName: ctx.oldKey || ctx.variantName,
        };
    }
    if (kind === 'sub_part') {
        var oldKey = ctx.oldKey || ctx.subPartKey || ctx.key;
        var configRefs = [];
        var uuids = [];
        if (oldKey) configRefs.push(oldKey);

        if (isObject(existing.interact_boxes)) {
            Object.keys(existing.interact_boxes).forEach(function (key) {
                configRefs.push(key);
                var ib = existing.interact_boxes[key];
                if (isObject(ib) && ib._uuid) uuids.push(ib._uuid);
            });
        }
        if (isObject(existing.connectors)) {
            Object.keys(existing.connectors).forEach(function (key) {
                configRefs.push(key);
                var conn = existing.connectors[key];
                if (isObject(conn) && conn._marker_uuid) uuids.push(conn._marker_uuid);
            });
        }
        if (isObject(existing.hit_boxes)) {
            Object.keys(existing.hit_boxes).forEach(function (key) {
                uuids.push(key);
            });
        }
        return {
            scope: 'sub_part',
            partId: ctx.partId,
            variantName: ctx.variantName,
            subPartKey: oldKey,
            config_refs: configRefs,
            uuids: uuids,
        };
    }
    // importSubsystem：子系统没有 marker
    return null;
}

// ── 配置引用 ────────────────────────────────────────────────────

function collectDanglingConfigRefs(kind, node, ctx, basePath) {
    var dangling = [];
    var prefix = basePath || [];

    function checkSubPart(spKey, sp, path) {
        if (!isObject(sp)) return;
        var collected = refs.collectRefs(sp, path);
        collected.refs.forEach(function (ref) {
            if (!targetsHas(collected.targets, ref.target)) {
                dangling.push(ref);
            }
        });
    }

    function targetsHas(targets, target) {
        if (refs.SENTINELS.indexOf(target) >= 0) return true;
        return !!(targets.subsystem[target] || targets.connector[target] || targets.interact_box[target]);
    }

    if (kind === 'part' && isObject(node.variants)) {
        Object.keys(node.variants).forEach(function (vName) {
            var variant = node.variants[vName];
            if (!isObject(variant) || !isObject(variant.sub_parts)) return;
            Object.keys(variant.sub_parts).forEach(function (spKey) {
                checkSubPart(spKey, variant.sub_parts[spKey],
                    prefix.concat(['variants', vName, 'sub_parts', spKey]));
            });
        });
    } else if (kind === 'variant' && isObject(node.sub_parts)) {
        Object.keys(node.sub_parts).forEach(function (spKey) {
            checkSubPart(spKey, node.sub_parts[spKey],
                prefix.concat(['sub_parts', spKey]));
        });
    } else if (kind === 'sub_part') {
        checkSubPart(ctx.subPartKey || ctx.key || '', node, prefix);
    }

    return dangling;
}

// ── in ──────────────────────────────────────────────────────────

function resetFields(kind, existing, normalized) {
    if (!existing || typeof existing !== 'object') return [];
    return Object.keys(existing).filter(function (key) {
        if (fieldSpecs.isInternalField(kind, key)) return false;
        return !own(normalized, key);
    });
}

function prefixErrors(errors, prefix) {
    if (!Array.isArray(prefix) || prefix.length === 0) return errors;
    return errors.map(function (e) {
        return Object.assign({}, e, { path: prefix.concat(e.path || []) });
    });
}

/**
 * 对外定义 → 内部节点。
 *
 * @param {object} definition
 * @param {object} ctx - { kind, mode, oldKey?, namespace, partId, variantName, subPartKey?, parentPath, existing }
 * @returns {object} { ok, node, reset_fields, unresolved, markerPlan, markerCleanup, errors, warnings }
 */
function projectIn(definition, ctx) {
    ctx = ctx || {};
    var kind = ctx.kind;
    var parentPath = Array.isArray(ctx.parentPath) ? ctx.parentPath : [];
    var errors = [];
    var warnings = [];

    if (!fieldSpecs.isKnownKind(kind)) {
        return {
            ok: false,
            node: null,
            reset_fields: [],
            unresolved: { config_refs: [], bones: [] },
            markerPlan: [],
            markerCleanup: null,
            errors: [{
                path: parentPath,
                code: 'unknown_type',
                expected: '已知 kind',
                got: kind,
                hint: '未知的导入节点类型',
            }],
            warnings: [],
        };
    }

    var normalized = normalizeShorthand(kind, definition, ctx);
    // 显式 null 也算「本次提供了该字段」；归一化删除 optional null 后不能把它算进 reset_fields
    var provided = clone(normalized);
    normalized = normalizeUnset(kind, normalized);
    var reset = resetFields(kind, ctx.existing, provided);

    var stripped = stripInternal(kind, normalized);

    var keyResult = keys.validateKeys(kind, stripped, {
        namespace: ctx.namespace,
        path: parentPath,
    });
    errors = mergeErrors(errors, keyResult.errors);
    warnings = mergeErrors(warnings, keyResult.warnings);
    if (errors.length > 0) {
        return {
            ok: false,
            node: null,
            reset_fields: reset,
            unresolved: { config_refs: [], bones: [] },
            markerPlan: [],
            markerCleanup: buildMarkerCleanup(kind, ctx),
            errors: errors,
            warnings: warnings,
        };
    }

    var decoded = shapes.decodeStrict(kind, stripped, { path: parentPath });
    if (!decoded.ok) {
        errors = mergeErrors(errors, decoded.errors);
        return {
            ok: false,
            node: null,
            reset_fields: reset,
            unresolved: { config_refs: [], bones: [] },
            markerPlan: [],
            markerCleanup: buildMarkerCleanup(kind, ctx),
            errors: errors,
            warnings: warnings,
        };
    }

    var node = decoded.node;
    var valueResult = validate.validateValues(node, {
        kind: kind,
        typeId: kind === 'subsystem' ? node.type : undefined,
        path: parentPath,
        completeness: false,
    });
    errors = mergeErrors(errors, valueResult.errors);

    if (errors.length > 0) {
        return {
            ok: false,
            node: null,
            reset_fields: reset,
            unresolved: { config_refs: [], bones: [] },
            markerPlan: [],
            markerCleanup: buildMarkerCleanup(kind, ctx),
            errors: errors,
            warnings: warnings,
        };
    }

    var unresolvedBones = [];
    resolveHitBoxKeys(kind, node, unresolvedBones, parentPath);
    resolveElementRefs(kind, node, unresolvedBones, parentPath);

    var dangling = collectDanglingConfigRefs(kind, node, ctx, parentPath);
    var unresolvedConfigRefs = dangling.map(function (ref) {
        return {
            target: ref.target,
            kind: ref.kind,
            path: ref.path,
        };
    });
    if (dangling.length > 0) {
        errors = dangling.map(function (ref) {
            return {
                path: ref.path,
                code: 'unresolved_config_ref',
                expected: '同变体内的 subsystem / connector / interact_box key，或 local / global',
                got: ref.target,
                hint: '配置引用断裂，整件写入已拒绝',
            };
        });
    }

    var marker = buildMarkerPlan(kind, node, ctx);
    warnings = warnings.concat(marker.warnings);

    if (errors.length > 0) {
        return {
            ok: false,
            node: null,
            reset_fields: reset,
            unresolved: { config_refs: unresolvedConfigRefs, bones: unresolvedBones },
            markerPlan: [],
            markerCleanup: buildMarkerCleanup(kind, ctx),
            errors: errors,
            warnings: warnings,
        };
    }

    return {
        ok: true,
        node: node,
        reset_fields: reset,
        unresolved: { config_refs: unresolvedConfigRefs, bones: unresolvedBones },
        markerPlan: marker.plan,
        markerCleanup: buildMarkerCleanup(kind, ctx),
        errors: [],
        warnings: warnings,
    };
}

// ── out ─────────────────────────────────────────────────────────

function canonicalizeTextures(kind, node) {
    if (kind === 'variant' && typeof node.textures === 'string') {
        node.textures = { default: node.textures };
    }
    fieldSpecs.getContainers(kind).forEach(function (container) {
        var childKind = fieldSpecs.getContainerChildKind(container);
        var entries = node[container];
        if (!isObject(entries)) return;
        Object.keys(entries).forEach(function (key) {
            canonicalizeTextures(childKind, entries[key]);
        });
    });
}

function reverseHitBoxKeys(kind, node, unresolved, basePath) {
    var bones = ports.get().bones;

    if (kind === 'sub_part' && isObject(node.hit_boxes)) {
        var next = {};
        Object.keys(node.hit_boxes).forEach(function (key) {
            var name = bones.findNameByUuid(key);
            if (name) {
                next[name] = node.hit_boxes[key];
            } else {
                next[key] = node.hit_boxes[key];
                unresolved.push({
                    bone: key,
                    field: 'hit_box_key',
                    path: (basePath || []).concat(['hit_boxes', key]),
                });
            }
        });
        node.hit_boxes = next;
    }

    fieldSpecs.getContainers(kind).forEach(function (container) {
        var childKind = fieldSpecs.getContainerChildKind(container);
        var entries = node[container];
        if (!isObject(entries)) return;
        Object.keys(entries).forEach(function (key) {
            reverseHitBoxKeys(childKind, entries[key], unresolved,
                (basePath || []).concat([container, key]));
        });
    });
}

/**
 * 内部节点 → 对外定义。
 *
 * @param {object} node
 * @param {object} ctx - { kind }
 * @param {object} [opts] - { for: 'read' | 'export' }
 * @returns {{definition:*, unresolved:Array}}
 */
function projectOut(node, ctx, opts) {
    ctx = ctx || {};
    opts = opts || {};
    var kind = ctx.kind || 'part';
    var mode = opts.for || 'read';

    var cloned = clone(node);
    var stripped = stripInternal(kind, cloned);
    canonicalizeTextures(kind, stripped);

    var unresolved = [];
    reverseHitBoxKeys(kind, stripped, unresolved, []);

    if (mode === 'export') {
        try {
            return { definition: shapes.encode(kind, stripped), unresolved: unresolved };
        } catch (e) {
            return {
                definition: null,
                unresolved: unresolved,
                errors: [{
                    path: [],
                    code: 'type_mismatch',
                    expected: kind,
                    got: e && e.message ? e.message : String(e),
                    hint: '导出编码失败',
                }],
            };
        }
    }

    return { definition: stripped, unresolved: unresolved };
}

module.exports = {
    normalizeShorthand: normalizeShorthand,
    normalizeUnset: normalizeUnset,
    stripInternal: stripInternal,
    resetFields: resetFields,
    buildMarkerPlan: buildMarkerPlan,
    buildMarkerCleanup: buildMarkerCleanup,
    resolveHitBoxKeys: resolveHitBoxKeys,
    repairHitBoxKeys: repairHitBoxKeys,
    resolveElementRefs: resolveElementRefs,
    projectIn: projectIn,
    projectOut: projectOut,
    // 兼容 docs/13 的命名
    in: projectIn,
    out: projectOut,
};
