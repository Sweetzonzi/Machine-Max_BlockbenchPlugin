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
//
// 解析作用域分两档（docs/13 §5.4）：第 5-7 行的信号目标是**整个 Part**（同变体全部子零件），
// 其余引用只在所属子零件内解析 —— 与上游 `ISignalSender#setTargetFromNames`（Part 域）
// 和 `findOwnSubsystem`（子零件域）的分工一致。
// 纯函数层，不 require Blockbench / Vue；骨骼查询走 ports。

'use strict';

var ports = require('./ports.js');

var SENTINELS = ['local', 'global'];

/**
 * 名字表：容器字段 → 名字类别。
 * 三类名字（子系统 / 连接点 / 交互区）共用一套命名空间，Part 内唯一。
 */
var TARGET_CONTAINERS = {
    subsystems: 'subsystem',
    connectors: 'connector',
    interact_boxes: 'interact_box',
};

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
        owner: {},
    };
    Object.keys(TARGET_CONTAINERS).forEach(function (map) {
        var entries = subPart && subPart[map];
        if (!isObject(entries)) return;
        var kind = TARGET_CONTAINERS[map];
        Object.keys(entries).forEach(function (key) {
            if (targets.owner[key]) return; // 重名由 duplicate_name 报；这里只保留一条
            targets[kind][key] = true;
            targets.owner[key] = '';
        });
    });
    return targets;
}

/**
 * 把同一变体的全部子零件摊平成一张名字表。
 *
 * 信号目标（`signal_targets` 系列）的作用域是整个 Part —— 上游
 * `ISignalSender#setTargetFromNames` 建首跳表时一趟遍历 `subParts`，把子系统与连接点
 * 聚合成 Part 级名字表，所以跨子零件的具名目标可达；名字在 Part 内唯一
 * （`VariantAttr#validateUniqueNames` 与插件 `_collectNameConflicts` 都按变体判重）。
 *
 * 其它配置引用（`power_output` / `power_outputs` 的 key / `power_target` /
 * `hit_boxes[*].subsystem`）不在这一域内：模组侧用 `findOwnSubsystem`
 * （`MechPowerPort`、`HitBox`、`TransmissionSubsystem` 等）只在所属子零件里查。
 *
 * `owner` 记录每个名字的声明子零件（先声明者胜），供 UI 标注跨子零件候选。
 *
 * @param {object} subParts - { spKey: subPart }
 * @returns {{subsystem:object, connector:object, interact_box:object, owner:object}}
 */
function partTargetsOf(subParts) {
    var targets = {
        subsystem: {},
        connector: {},
        interact_box: {},
        owner: {},
    };
    if (!isObject(subParts)) return targets;
    Object.keys(subParts).forEach(function (spKey) {
        var sp = subParts[spKey];
        if (!isObject(sp)) return;
        var own = targetsOf(sp);
        Object.keys(TARGET_CONTAINERS).forEach(function (map) {
            var kind = TARGET_CONTAINERS[map];
            Object.keys(own[kind]).forEach(function (name) {
                if (targets.owner[name]) return;
                targets[kind][name] = true;
                targets.owner[name] = spKey;
            });
        });
    });
    return targets;
}

/**
 * 非信号引用的判定：只看同一子零件的条目表，按引用类别限定目标种类。
 *
 * 上游各条解析路径能认的只有：
 * - `power_target` / `power_output` / `power_outputs` 的 key → `MechPowerPort` 的
 *   `findOwnSubsystem` 或 `connectors.get`（子系统或连接点）
 * - `hit_boxes[*].subsystem` → `HitBox` 只接子系统
 * - `subsystems[*].connector` → 只接连接点
 *
 * 交互区哪一条都不认（它只发不收），所以这里不再把它算作命中；`local`/`global`
 * 仍放行（存量容忍，新内容不该用）。
 */
function nonSignalTargetExists(targets, kind, target) {
    if (SENTINELS.indexOf(target) >= 0) return true;
    if (kind === 'hit_box_subsystem') return !!targets.subsystem[target];
    if (kind === 'connector') return !!targets.connector[target];
    return !!(targets.subsystem[target] || targets.connector[target]);
}

/**
 * 具名信号目标的判定（Part 域）。
 *
 * @returns {'resolved'|'interact_box'|'dangling'}
 *   `resolved`   子系统 / 连接点 / local / global
 *   `interact_box` 命中交互区 —— 交互区只发不收（`InteractBox implements ISignalSender`），
 *                 上游解析时记 ERROR 日志并丢弃这一跳，所以它不是合法接收者
 *   `dangling`   整个 Part 内都没有这个名字
 */
function classifySignalTarget(partTargets, target) {
    if (SENTINELS.indexOf(target) >= 0) return 'resolved';
    if (!isObject(partTargets)) return 'dangling';
    if (partTargets.subsystem[target] || partTargets.connector[target]) return 'resolved';
    if (partTargets.interact_box[target]) return 'interact_box';
    return 'dangling';
}

/** 从配置取某个变体（不存在时返回 null）。 */
function variantOf(config, partId, variantName) {
    var part = config && config.parts && config.parts[partId];
    var variant = part && part.variants && part.variants[variantName];
    return isObject(variant) ? variant : null;
}

/**
 * 从配置路径取同一变体的子零件表，供整件投影把「同 Part」的视图交给 `projection.in`。
 * 路径形如 `parts/<id>/variants/<v>[/sub_parts/<sp>…]`；取不到变体时返回 null。
 *
 * @param {object} config
 * @param {string[]} segments
 * @returns {object|null} { spKey: subPart }
 */
function siblingSubParts(config, segments) {
    if (!Array.isArray(segments)) return null;
    if (segments[0] !== 'parts' || segments[2] !== 'variants') return null;
    var variant = variantOf(config, segments[1], segments[3]);
    return variant && isObject(variant.sub_parts) ? variant.sub_parts : null;
}

function isPlaceholder(value) {
    return value === null || value === undefined || value === '';
}

/**
 * 不是信号表的对象字段。
 *
 * `isSignalMap` 按形状识别信号表（对象且每个值都是数组），这会误伤
 * `connector.overwrite = { required_tags: [...] }`：它的值也是字符串数组，
 * 但 `required_tags` 是标签、不是节点 key。误判的代价是把标签当成引用——
 * 删除/重命名一个同名条目会顺手改掉 `overwrite` 里的标签，所以按字段名排除。
 */
var NON_SIGNAL_FIELDS = {
    overwrite: true,
    textures: true,
    hit_boxes: true,
    connectors: true,
    subsystems: true,
    interact_boxes: true,
    power_outputs: true,
    dismount_locators: true,
    // 信号表本身不是「频道 → 目标数组」，但同名字段先排除，避免将来形状变化误判
    signal_translations: true,
};

/**
 * 子系统 / 连接点 / 交互区的信号输出字段并不都叫 `signal_targets`：
 * 引擎是 `speed_outputs`、变速箱是 `gear_outputs`、分动箱是 `power_outputs`
 * （值不是数组，单独处理）。这里按形状识别：对象且每个值都是数组（空对象也算）。
 */
function isSignalMap(value) {
    if (!isObject(value)) return false;
    var entries = Object.keys(value);
    for (var i = 0; i < entries.length; i++) {
        if (!Array.isArray(value[entries[i]])) return false;
    }
    return true;
}

function eachSignalMap(node, fn) {
    if (!isObject(node)) return;
    Object.keys(node).forEach(function (field) {
        if (NON_SIGNAL_FIELDS[field]) return;
        if (isSignalMap(node[field])) fn(node[field], field);
    });
}

function addSignalRefs(list, map, path, field) {
    Object.keys(map).forEach(function (ch) {
        var targets = map[ch];
        if (!Array.isArray(targets)) return;
        for (var i = 0; i < targets.length; i++) {
            addRef(list, path.concat([field, ch, i]), targets[i], 'signal_target');
        }
    });
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
        eachSignalMap(ss, function (map, field) {
            addSignalRefs(refs, map, p, field);
        });
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
        eachSignalMap(conn, function (map, field) {
            addSignalRefs(refs, map, p, field);
        });
    });

    var interactBoxes = isObject(subPart.interact_boxes) ? subPart.interact_boxes : {};
    Object.keys(interactBoxes).forEach(function (ik) {
        var ib = interactBoxes[ik];
        if (!isObject(ib)) return;
        var p = base.concat(['interact_boxes', ik]);
        eachSignalMap(ib, function (map, field) {
            addSignalRefs(refs, map, p, field);
        });
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
 * 作用域按引用类型分开：
 * - `signal_target`（`signal_targets` / `control_outputs` / `speed_outputs` 等信号表）→ 整个 Part：
 *   同变体任一子零件的子系统或连接点都算命中，`local` / `global` 放行；命中交互区记进
 *   `invalid`（交互区只发不收，上游丢弃这一跳）；
 * - 其它引用（`power_output` / `power_outputs` 的 key / `power_target` / `hit_boxes[*].subsystem` /
 *   `subsystems[*].connector`）→ 同子零件。
 *
 * @param {object} config
 * @param {object} scope - { partId, variantName, subPartKey } 或
 *   { subPart, basePath, partId, variantName, partTargets? }
 * @returns {{ok:boolean, resolved:Array, dangling:Array, invalid:Array, errors:Array}}
 */
function resolveConfigRefs(config, scope) {
    scope = scope || {};
    var subPart = scope.subPart;
    var basePath = scope.basePath;
    var variant = null;

    if (!subPart) {
        variant = variantOf(config, scope.partId, scope.variantName);
        subPart = variant && variant.sub_parts && variant.sub_parts[scope.subPartKey];
        basePath = ['parts', scope.partId, 'variants', scope.variantName,
            'sub_parts', scope.subPartKey];
    }

    if (!isObject(subPart)) {
        return {
            ok: false,
            resolved: [],
            dangling: [],
            invalid: [],
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
    var partTargets = scope.partTargets;
    if (!partTargets) {
        if (!variant) variant = variantOf(config, scope.partId, scope.variantName);
        // 没有整件视图时退回本子零件：宁可少判，也不把同子零件能解析的引用判成断裂
        partTargets = (variant && isObject(variant.sub_parts))
            ? partTargetsOf(variant.sub_parts)
            : collected.targets;
    }

    var resolved = [];
    var dangling = [];
    var invalid = [];
    collected.refs.forEach(function (ref) {
        if (ref.kind === 'signal_target') {
            var verdict = classifySignalTarget(partTargets, ref.target);
            if (verdict === 'resolved') resolved.push(ref);
            else if (verdict === 'interact_box') invalid.push(Object.assign({}, ref, { reason: 'interact_box_only_sends' }));
            else dangling.push(ref);
            return;
        }
        if (nonSignalTargetExists(collected.targets, ref.kind, ref.target)) resolved.push(ref);
        else dangling.push(ref);
    });
    return { ok: dangling.length === 0, resolved: resolved, dangling: dangling, invalid: invalid, errors: [] };
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
            eachSignalMap(ss, function (map, field) {
                Object.keys(map).forEach(function (ch) {
                    if (Array.isArray(map[ch])
                        && removeSignalTarget(map[ch], target) > 0) {
                        cleaned.push({
                            path: p.concat([field, ch]),
                            target: target,
                            kind: 'signal_target',
                        });
                    }
                });
            });
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
            eachSignalMap(conn, function (map, field) {
                Object.keys(map).forEach(function (ch) {
                    if (Array.isArray(map[ch])
                        && removeSignalTarget(map[ch], target) > 0) {
                        cleaned.push({
                            path: p.concat([field, ch]),
                            target: target,
                            kind: 'signal_target',
                        });
                    }
                });
            });
        });

        var interactBoxes = isObject(sp.interact_boxes) ? sp.interact_boxes : {};
        Object.keys(interactBoxes).forEach(function (ik) {
            var ib = interactBoxes[ik];
            if (!isObject(ib)) return;
            var p = base.concat(['interact_boxes', ik]);
            eachSignalMap(ib, function (map, field) {
                Object.keys(map).forEach(function (ch) {
                    if (Array.isArray(map[ch])
                        && removeSignalTarget(map[ch], target) > 0) {
                        cleaned.push({
                            path: p.concat([field, ch]),
                            target: target,
                            kind: 'signal_target',
                        });
                    }
                });
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

function renameSignalTargets(obj, oldKey, newKey, path, report, field) {
    if (!isObject(obj)) return;
    var name = field || 'signal_targets';
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
                path: path.concat([name, ch]),
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
            eachSignalMap(ss, function (map, field) {
                renameSignalTargets(map, oldKey, newKey, p, report, field);
            });
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
            eachSignalMap(conn, function (map, field) {
                renameSignalTargets(map, oldKey, newKey, p, report, field);
            });
        });

        var interactBoxes = isObject(sp.interact_boxes) ? sp.interact_boxes : {};
        Object.keys(interactBoxes).forEach(function (ik) {
            var ib = interactBoxes[ik];
            if (!isObject(ib)) return;
            var p = base.concat(['interact_boxes', ik]);
            eachSignalMap(ib, function (map, field) {
                renameSignalTargets(map, oldKey, newKey, p, report, field);
            });
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
    TARGET_CONTAINERS: TARGET_CONTAINERS,
    collectRefs: collectRefs,
    targetsOf: targetsOf,
    partTargetsOf: partTargetsOf,
    classifySignalTarget: classifySignalTarget,
    siblingSubParts: siblingSubParts,
    resolveConfigRefs: resolveConfigRefs,
    cleanDangling: cleanDangling,
    renameRefs: renameRefs,
    resolveBones: resolveBones,
};
