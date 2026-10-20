// 文件: src/doc/refs.js
// 用途: 引用矩阵（docs/13 §5.4）— 骨骼引用 / 配置引用 / 清理 / 重命名
// 所属模块: MachineMax Blockbench 插件
//
// 13 行引用全部在这里实现：
//   1-4   marker.config_ref（sub_part / hit_box / interact_box / connector）
//   5-7   signal_targets（subsystems / connectors / interact_boxes）
//   8-9   power_target / power_output
//   10    hit_boxes[*].subsystem
//   11    subsystems[*].connector
//   12    骨骼 / Locator 名
//   13    power_outputs 的 key
//
// `signal_translations` 是频道名 → 频道名，不计入配置引用。
// 纯函数层，不 require Blockbench / Vue；骨骼查询走 ports。

'use strict';

var ports = require('./ports.js');

var SENTINELS = ['local', 'global'];

function own(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function isObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function eachVariant(config, fn) {
    var parts = config && config.parts;
    if (!isObject(parts)) return;
    Object.keys(parts).forEach(function (partId) {
        var part = parts[partId];
        if (!isObject(part) || !isObject(part.variants)) return;
        Object.keys(part.variants).forEach(function (variantName) {
            var variant = part.variants[variantName];
            if (isObject(variant)) fn(partId, variantName, part, variant);
        });
    });
}

function eachSubPart(config, fn) {
    eachVariant(config, function (partId, variantName, part, variant) {
        var subParts = variant.sub_parts;
        if (!isObject(subParts)) return;
        Object.keys(subParts).forEach(function (spKey) {
            var sp = subParts[spKey];
            if (isObject(sp)) fn(partId, variantName, spKey, sp, part, variant);
        });
    });
}

function eachMarker(config, fn) {
    var parts = config && config.parts;
    if (!isObject(parts)) return;
    Object.keys(parts).forEach(function (partId) {
        var part = parts[partId];
        if (!isObject(part) || !isObject(part.element_markers)) return;
        Object.keys(part.element_markers).forEach(function (variantName) {
            var markers = part.element_markers[variantName];
            if (!isObject(markers)) return;
            Object.keys(markers).forEach(function (uuid) {
                if (isObject(markers[uuid])) fn(partId, variantName, uuid, markers[uuid], markers);
            });
        });
    });
}

function targetsOf(subPart) {
    var targets = {
        subsystem: {},
        connector: {},
        interact_box: {},
    };
    ['subsystems', 'connectors', 'interact_boxes'].forEach(function (map) {
        var entries = subPart && subPart[map];
        if (!isObject(entries)) return;
        var kind = map === 'subsystems' ? 'subsystem'
            : (map === 'connectors' ? 'connector' : 'interact_box');
        Object.keys(entries).forEach(function (key) {
            targets[kind][key] = true;
        });
    });
    return targets;
}

function targetExists(targets, target) {
    if (SENTINELS.indexOf(target) >= 0) return true;
    return !!(targets.subsystem[target] || targets.connector[target] || targets.interact_box[target]);
}

function isPlaceholder(value) {
    return value === null || value === undefined || value === '';
}

function addRef(list, path, target, kind) {
    if (isPlaceholder(target)) return;
    list.push({ path: path, target: target, kind: kind });
}

/**
 * 收集一个子零件内的全部配置引用。
 * @returns {{targets:object, refs:Array}}
 */
function collectRefs(subPart, basePath) {
    var refs = [];
    var base = basePath || [];

    var subsystems = isObject(subPart.subsystems) ? subPart.subsystems : {};
    Object.keys(subsystems).forEach(function (sk) {
        var ss = subsystems[sk];
        if (!isObject(ss)) return;
        var p = base.concat(['subsystems', sk]);
        addRef(refs, p.concat(['power_output']), ss.power_output, 'power_output');
        addRef(refs, p.concat(['connector']), ss.connector, 'connector');
        if (isObject(ss.signal_targets)) {
            Object.keys(ss.signal_targets).forEach(function (ch) {
                var list = ss.signal_targets[ch];
                if (!Array.isArray(list)) return;
                for (var i = 0; i < list.length; i++) {
                    addRef(refs, p.concat(['signal_targets', ch, i]), list[i], 'signal_target');
                }
            });
        }
        if (isObject(ss.power_outputs)) {
            Object.keys(ss.power_outputs).forEach(function (target) {
                addRef(refs, p.concat(['power_outputs', target]), target, 'power_output_key');
            });
        }
    });

    var connectors = isObject(subPart.connectors) ? subPart.connectors : {};
    Object.keys(connectors).forEach(function (ck) {
        var conn = connectors[ck];
        if (!isObject(conn)) return;
        var p = base.concat(['connectors', ck]);
        addRef(refs, p.concat(['power_target']), conn.power_target, 'power_target');
        if (isObject(conn.signal_targets)) {
            Object.keys(conn.signal_targets).forEach(function (ch) {
                var list = conn.signal_targets[ch];
                if (!Array.isArray(list)) return;
                for (var i = 0; i < list.length; i++) {
                    addRef(refs, p.concat(['signal_targets', ch, i]), list[i], 'signal_target');
                }
            });
        }
    });

    var interactBoxes = isObject(subPart.interact_boxes) ? subPart.interact_boxes : {};
    Object.keys(interactBoxes).forEach(function (ik) {
        var ib = interactBoxes[ik];
        if (!isObject(ib)) return;
        var p = base.concat(['interact_boxes', ik]);
        if (isObject(ib.signal_targets)) {
            Object.keys(ib.signal_targets).forEach(function (ch) {
                var list = ib.signal_targets[ch];
                if (!Array.isArray(list)) return;
                for (var i = 0; i < list.length; i++) {
                    addRef(refs, p.concat(['signal_targets', ch, i]), list[i], 'signal_target');
                }
            });
        }
    });

    var hitBoxes = isObject(subPart.hit_boxes) ? subPart.hit_boxes : {};
    Object.keys(hitBoxes).forEach(function (hk) {
        var hb = hitBoxes[hk];
        if (!isObject(hb)) return;
        addRef(refs, base.concat(['hit_boxes', hk, 'subsystem']), hb.subsystem, 'hit_box_subsystem');
    });

    return { targets: targetsOf(subPart), refs: refs };
}

/**
 * 解析一个子零件的配置引用。
 *
 * @param {object} config
 * @param {object} scope - { partId, variantName, subPartKey } 或 { subPart, basePath, partId, variantName }
 * @returns {{ok:boolean, resolved:Array, dangling:Array, errors:Array}}
 */
function resolveConfigRefs(config, scope) {
    scope = scope || {};
    var subPart = scope.subPart;
    var basePath = scope.basePath;

    if (!subPart) {
        var part = config && config.parts && config.parts[scope.partId];
        var variant = part && part.variants && part.variants[scope.variantName];
        subPart = variant && variant.sub_parts && variant.sub_parts[scope.subPartKey];
        basePath = ['parts', scope.partId, 'variants', scope.variantName,
            'sub_parts', scope.subPartKey];
    }

    if (!isObject(subPart)) {
        return {
            ok: false,
            resolved: [],
            dangling: [],
            errors: [{
                path: basePath || [],
                code: 'not_found',
                expected: 'sub_part',
                got: undefined,
                hint: '子零件不存在',
            }],
        };
    }

    var collected = collectRefs(subPart, basePath || []);
    var resolved = [];
    var dangling = [];
    collected.refs.forEach(function (ref) {
        if (targetExists(collected.targets, ref.target)) {
            resolved.push(ref);
        } else {
            dangling.push(ref);
        }
    });
    return { ok: dangling.length === 0, resolved: resolved, dangling: dangling, errors: [] };
}

// ── 清理 ────────────────────────────────────────────────────────

function removeSignalTarget(list, target) {
    var removed = 0;
    for (var i = list.length - 1; i >= 0; i--) {
        if (list[i] === target) {
            list.splice(i, 1);
            removed++;
        }
    }
    return removed;
}

/**
 * 删除 / 替换节点后清理指向它的引用。
 *
 * @param {object} config
 * @param {object} removed - { target } 或 { kind, key, partId?, variantName?, subPartKey? }
 * @returns {{ok:boolean, cleaned_references:Array}}
 */
function cleanDangling(config, removed) {
    removed = removed || {};
    var target = removed.target || removed.key;
    var cleaned = [];
    if (!target) return { ok: true, cleaned_references: cleaned };

    eachSubPart(config, function (partId, variantName, spKey, sp) {
        var base = ['parts', partId, 'variants', variantName, 'sub_parts', spKey];

        var subsystems = isObject(sp.subsystems) ? sp.subsystems : {};
        Object.keys(subsystems).forEach(function (sk) {
            var ss = subsystems[sk];
            if (!isObject(ss)) return;
            var p = base.concat(['subsystems', sk]);
            if (ss.power_output === target) {
                ss.power_output = '';
                cleaned.push({ path: p.concat(['power_output']), target: target, kind: 'power_output' });
            }
            if (ss.connector === target) {
                ss.connector = '';
                cleaned.push({ path: p.concat(['connector']), target: target, kind: 'connector' });
            }
            if (isObject(ss.signal_targets)) {
                Object.keys(ss.signal_targets).forEach(function (ch) {
                    if (Array.isArray(ss.signal_targets[ch])
                        && removeSignalTarget(ss.signal_targets[ch], target) > 0) {
                        cleaned.push({
                            path: p.concat(['signal_targets', ch]),
                            target: target,
                            kind: 'signal_target',
                        });
                    }
                });
            }
            if (isObject(ss.power_outputs) && own(ss.power_outputs, target)) {
                delete ss.power_outputs[target];
                cleaned.push({
                    path: p.concat(['power_outputs', target]),
                    target: target,
                    kind: 'power_output_key',
                });
            }
        });

        var connectors = isObject(sp.connectors) ? sp.connectors : {};
        Object.keys(connectors).forEach(function (ck) {
            var conn = connectors[ck];
            if (!isObject(conn)) return;
            var p = base.concat(['connectors', ck]);
            if (conn.power_target === target) {
                conn.power_target = '';
                cleaned.push({ path: p.concat(['power_target']), target: target, kind: 'power_target' });
            }
            if (isObject(conn.signal_targets)) {
                Object.keys(conn.signal_targets).forEach(function (ch) {
                    if (Array.isArray(conn.signal_targets[ch])
                        && removeSignalTarget(conn.signal_targets[ch], target) > 0) {
                        cleaned.push({
                            path: p.concat(['signal_targets', ch]),
                            target: target,
                            kind: 'signal_target',
                        });
                    }
                });
            }
        });

        var interactBoxes = isObject(sp.interact_boxes) ? sp.interact_boxes : {};
        Object.keys(interactBoxes).forEach(function (ik) {
            var ib = interactBoxes[ik];
            if (!isObject(ib) || !isObject(ib.signal_targets)) return;
            var p = base.concat(['interact_boxes', ik]);
            Object.keys(ib.signal_targets).forEach(function (ch) {
                if (Array.isArray(ib.signal_targets[ch])
                    && removeSignalTarget(ib.signal_targets[ch], target) > 0) {
                    cleaned.push({
                        path: p.concat(['signal_targets', ch]),
                        target: target,
                        kind: 'signal_target',
                    });
                }
            });
        });

        var hitBoxes = isObject(sp.hit_boxes) ? sp.hit_boxes : {};
        Object.keys(hitBoxes).forEach(function (hk) {
            var hb = hitBoxes[hk];
            if (isObject(hb) && hb.subsystem === target) {
                hb.subsystem = '';
                cleaned.push({
                    path: base.concat(['hit_boxes', hk, 'subsystem']),
                    target: target,
                    kind: 'hit_box_subsystem',
                });
            }
        });
    });

    // marker.config_ref 清理
    eachMarker(config, function (partId, variantName, uuid, marker, markers) {
        if (marker.config_ref !== target) return;
        var typeMatches = !removed.kind
            || marker.type === removed.kind
            || (removed.kind === 'sub_part'
                && (marker.type === 'sub_part' || marker.type === 'hit_box'));
        if (!typeMatches) return;
        delete markers[uuid];
        cleaned.push({
            path: ['parts', partId, 'element_markers', variantName, uuid],
            target: target,
            kind: 'marker',
        });
    });

    return { ok: true, cleaned_references: cleaned };
}

// ── 重命名 ──────────────────────────────────────────────────────

function renameSignalTargets(obj, oldKey, newKey, path, report) {
    if (!isObject(obj)) return;
    Object.keys(obj).forEach(function (ch) {
        var list = obj[ch];
        if (!Array.isArray(list)) return;
        for (var i = 0; i < list.length; i++) {
            if (list[i] !== oldKey) continue;
            if (list.indexOf(newKey) < 0) {
                list[i] = newKey;
            } else {
                list.splice(i, 1);
                i--;
            }
            report.push({
                path: path.concat(['signal_targets', ch]),
                from: oldKey,
                to: newKey,
                kind: 'signal_target',
            });
        }
    });
}

function renameKey(obj, oldKey, newKey, path, report, kind) {
    if (!isObject(obj) || !own(obj, oldKey) || oldKey === newKey) return;
    var value = obj[oldKey];
    delete obj[oldKey];
    obj[newKey] = value;
    report.push({ path: path, from: oldKey, to: newKey, kind: kind || 'key' });
}

/**
 * 重命名配置节点后改写全部引用（含 4 类 marker）。
 *
 * @param {object} config
 * @param {object} opts - { kind, oldKey, newKey }
 * @returns {{ok:boolean, changed:number, renamed:Array}}
 */
function renameRefs(config, opts) {
    opts = opts || {};
    var oldKey = opts.oldKey;
    var newKey = opts.newKey;
    var report = [];
    if (!oldKey || !newKey || oldKey === newKey) {
        return { ok: true, changed: 0, renamed: report };
    }

    // 1-4. marker.config_ref
    eachMarker(config, function (partId, variantName, uuid, marker) {
        var shouldRename = false;
        if (marker.type === 'sub_part' || marker.type === 'hit_box') {
            shouldRename = marker.config_ref === oldKey;
        } else if (marker.type === 'connector' || marker.type === 'interact_box') {
            shouldRename = marker.config_ref === oldKey;
        }
        if (!shouldRename) return;
        marker.config_ref = newKey;
        report.push({
            path: ['parts', partId, 'element_markers', variantName, uuid, 'config_ref'],
            from: oldKey,
            to: newKey,
            kind: 'marker',
        });
    });

    // 5-13. 配置引用
    eachSubPart(config, function (partId, variantName, spKey, sp) {
        var base = ['parts', partId, 'variants', variantName, 'sub_parts', spKey];

        var subsystems = isObject(sp.subsystems) ? sp.subsystems : {};
        Object.keys(subsystems).forEach(function (sk) {
            var ss = subsystems[sk];
            if (!isObject(ss)) return;
            var p = base.concat(['subsystems', sk]);
            if (ss.power_output === oldKey) {
                ss.power_output = newKey;
                report.push({ path: p.concat(['power_output']), from: oldKey, to: newKey, kind: 'power_output' });
            }
            if (ss.connector === oldKey) {
                ss.connector = newKey;
                report.push({ path: p.concat(['connector']), from: oldKey, to: newKey, kind: 'connector' });
            }
            renameSignalTargets(ss.signal_targets, oldKey, newKey, p, report);
            renameKey(ss.power_outputs, oldKey, newKey, p.concat(['power_outputs']), report,
                'power_output_key');
        });

        var connectors = isObject(sp.connectors) ? sp.connectors : {};
        Object.keys(connectors).forEach(function (ck) {
            var conn = connectors[ck];
            if (!isObject(conn)) return;
            var p = base.concat(['connectors', ck]);
            if (conn.power_target === oldKey) {
                conn.power_target = newKey;
                report.push({ path: p.concat(['power_target']), from: oldKey, to: newKey, kind: 'power_target' });
            }
            renameSignalTargets(conn.signal_targets, oldKey, newKey, p, report);
        });

        var interactBoxes = isObject(sp.interact_boxes) ? sp.interact_boxes : {};
        Object.keys(interactBoxes).forEach(function (ik) {
            var ib = interactBoxes[ik];
            if (!isObject(ib)) return;
            renameSignalTargets(ib.signal_targets, oldKey, newKey,
                base.concat(['interact_boxes', ik]), report);
        });

        var hitBoxes = isObject(sp.hit_boxes) ? sp.hit_boxes : {};
        Object.keys(hitBoxes).forEach(function (hk) {
            var hb = hitBoxes[hk];
            if (isObject(hb) && hb.subsystem === oldKey) {
                hb.subsystem = newKey;
                report.push({
                    path: base.concat(['hit_boxes', hk, 'subsystem']),
                    from: oldKey,
                    to: newKey,
                    kind: 'hit_box_subsystem',
                });
            }
        });
    });

    return { ok: true, changed: report.length, renamed: report };
}

// ── 骨骼引用 ────────────────────────────────────────────────────

/**
 * 解析一个节点上的骨骼 / Locator 引用。
 *
 * @param {string} kind - sub_part | hit_box | interact_box | connector | subsystem
 * @param {object} node
 * @param {object} [portsObj] - 默认使用 doc/ports
 * @returns {{resolved:Array, unresolved:Array}}
 */
function resolveBones(kind, node, portsObj) {
    var p = portsObj || ports.get();
    var bones = p.bones;
    var resolved = [];
    var unresolved = [];

    function byName(name, field, extra) {
        if (isPlaceholder(name)) return;
        var el = bones.findByName(name);
        var entry = { bone: name, field: field };
        if (extra) Object.keys(extra).forEach(function (k) { entry[k] = extra[k]; });
        if (el) {
            entry.uuid = el.uuid;
            resolved.push(entry);
        } else {
            unresolved.push(entry);
        }
    }

    if (kind === 'sub_part') {
        byName(node.start_bone, 'start_bone');
        if (Array.isArray(node.end_bones)) {
            node.end_bones.forEach(function (b) { byName(b, 'end_bones'); });
        }
        byName(node.mass_center, 'mass_center');

        if (isObject(node.hit_boxes)) {
            Object.keys(node.hit_boxes).forEach(function (key) {
                if (isPlaceholder(key)) return;
                var el = bones.findByUuid(key) || bones.findByName(key);
                var entry = { bone: key, field: 'hit_box_key' };
                if (el) {
                    entry.uuid = el.uuid;
                    resolved.push(entry);
                } else {
                    unresolved.push(entry);
                }
            });
        }

        if (isObject(node.interact_boxes)) {
            Object.keys(node.interact_boxes).forEach(function (key) {
                var ib = node.interact_boxes[key];
                if (isObject(ib)) byName(ib.bone, 'interact_box.bone', { key: key });
            });
        }

        if (isObject(node.connectors)) {
            Object.keys(node.connectors).forEach(function (key) {
                var conn = node.connectors[key];
                if (isObject(conn)) byName(conn.locator, 'connector.locator', { key: key });
            });
        }

        if (isObject(node.subsystems)) {
            Object.keys(node.subsystems).forEach(function (key) {
                var ss = node.subsystems[key];
                if (!isObject(ss)) return;
                byName(ss.locator, 'subsystem.locator', { key: key });
                if (Array.isArray(ss.dismount_locators)) {
                    ss.dismount_locators.forEach(function (loc) {
                        byName(loc, 'subsystem.dismount_locators', { key: key });
                    });
                }
            });
        }
    } else if (kind === 'interact_box') {
        byName(node.bone, 'bone');
    } else if (kind === 'connector') {
        byName(node.locator, 'locator');
    } else if (kind === 'subsystem') {
        byName(node.locator, 'locator');
        if (Array.isArray(node.dismount_locators)) {
            node.dismount_locators.forEach(function (loc) { byName(loc, 'dismount_locators'); });
        }
    } else if (kind === 'hit_box') {
        byName(node.bone, 'bone');
    }

    return { resolved: resolved, unresolved: unresolved };
}

module.exports = {
    SENTINELS: SENTINELS,
    collectRefs: collectRefs,
    resolveConfigRefs: resolveConfigRefs,
    cleanDangling: cleanDangling,
    renameRefs: renameRefs,
    resolveBones: resolveBones,
};
