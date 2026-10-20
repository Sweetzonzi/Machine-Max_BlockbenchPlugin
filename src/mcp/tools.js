// 文件: src/mcp/tools.js
// 用途: MCP 工具实现（docs/12 §5）
// 所属模块: MachineMax Blockbench 插件
//
// 这一层只做「协议适配」：参数归一化、active 上下文补全、结果裁剪。
// 寻址 / 字段校验 / 引用清理 / 撤销边界全部由 doc + ops 提供。

'use strict';

var persistence = require('../utils/persistence.js');
var ops = require('../ops/index.js');
var doc = require('../doc/index.js');
var ports = require('../doc/ports.js');
var em = require('../core/element_markers.js');
var defs = require('../core/content_pack_manager.js');
var params = require('./params.js');
var { collectIssues } = require('../services/validate.js');
var { canExport } = require('../services/export.js');
var result = require('./result.js');

var DEF_TYPE = params.DEF_TYPE;

var ROOT_FIELDS = {
    parts: true,
    namespace: true,
    modelFile: true,
    contentPackPath: true,
    dependencyPaths: true,
    packMeta: true,
    $schema_version: true,
    _uiState: true,
};

var CONTAINER_KIND = {
    parts: 'part',
    variants: 'variant',
    sub_parts: 'sub_part',
    hit_boxes: 'hit_box',
    interact_boxes: 'interact_box',
    connectors: 'connector',
    subsystems: 'subsystem',
};

/** 最近一次 validate / 编辑后的全量问题，供 only_introduced 使用。 */
var lastIssues = [];

function resetState() {
    lastIssues = [];
}

function isObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function configOrError() {
    var config = persistence.getConfig();
    if (!config) {
        return { error: result.error('没有打开的工程或配置不可用', [{
            path: [], code: 'no_project', expected: '已打开的 Project', got: null,
            hint: '先在 Blockbench 打开工程并进入「零件定义」模式',
        }]) };
    }
    return { config: config };
}

function activeOf(config) {
    var ui = (config && config._uiState) || {};
    return {
        part: ui.activePartId || '',
        variant: ui.activeVariantName || '',
    };
}

function resolvePath(config, input) {
    var parsed = doc.address.parsePath(input);
    if (!parsed.ok) return parsed;

    var segments = parsed.segments;
    if (segments.length === 0) return { ok: true, segments: segments };
    if (ROOT_FIELDS[segments[0]]) return { ok: true, segments: segments };

    var active = activeOf(config);
    if (!active.part || !active.variant) {
        return {
            ok: false,
            errors: [{
                path: segments, code: 'no_project', expected: 'active part/variant',
                got: active.part + '/' + active.variant,
                hint: '相对路径需要 _uiState 里有活动零件与变体；可先调用 set_active',
            }],
        };
    }
    return {
        ok: true,
        segments: ['parts', active.part, 'variants', active.variant].concat(segments),
    };
}

function pointerOf(segments) {
    return '/' + segments.map(function (s) {
        return String(s).replace(/~/g, '~0').replace(/\//g, '~1');
    }).join('/');
}

function issueKey(p) {
    return JSON.stringify([
        p && p.severity, p && p.code, p && p.message,
        p && p.path ? [
            p.path.scope, p.path.partId, p.path.variantName,
            p.path.subPartKey, p.path.itemKey, p.path.field,
        ] : null,
    ]);
}

function diffIssues(after, before) {
    var seen = {};
    (before || []).forEach(function (p) { seen[issueKey(p)] = true; });
    return (after || []).filter(function (p) { return !seen[issueKey(p)]; });
}

function safeIssues(config) {
    try {
        return collectIssues(config) || [];
    } catch (e) {
        return [];
    }
}

function mapIssue(p) {
    return {
        severity: p.severity,
        code: p.code,
        message: p.message,
        path: p.path,
    };
}

/** 进入编辑前记录基线；编辑后统一追加 introduced_issues。 */
function beginEdit(config) {
    return safeIssues(config);
}

function finishEdit(config, opResult, beforeIssues) {
    var after = safeIssues(config);
    lastIssues = after;
    if (opResult && opResult.ok) {
        opResult.introduced_issues = diffIssues(after, beforeIssues);
    }
    return opResult;
}

// ── definition 投影 ─────────────────────────────────────────────

function kindAt(segments) {
    var n = segments.length;
    if (n === 0) return null;
    if (n >= 2 && CONTAINER_KIND[segments[n - 2]]) return CONTAINER_KIND[segments[n - 2]];
    if (CONTAINER_KIND[segments[n - 1]]) return CONTAINER_KIND[segments[n - 1]];
    return null;
}

function isContainer(segments) {
    var n = segments.length;
    return n > 0 && !!CONTAINER_KIND[segments[n - 1]];
}

function projectNode(node, kind) {
    if (!kind || !isObject(node)) return { value: node, unresolved: [] };
    var out = doc.projection.projectOut(node, { kind: kind }, { for: 'read' });
    return {
        value: out && out.definition !== undefined ? out.definition : node,
        unresolved: (out && out.unresolved) || [],
    };
}

function projectValue(value, segments) {
    var kind = kindAt(segments);
    if (!kind) return { value: value, unresolved: [] };

    if (isContainer(segments) && isObject(value)) {
        var mapped = {};
        var unresolved = [];
        Object.keys(value).forEach(function (key) {
            var projected = projectNode(value[key], kind);
            mapped[key] = projected.value;
            unresolved = unresolved.concat(projected.unresolved);
        });
        return { value: mapped, unresolved: unresolved };
    }

    return projectNode(value, kind);
}

// ── 工具实现 ────────────────────────────────────────────────────

function getContext() {
    var got = configOrError();
    if (got.error) return got.error;
    var config = got.config;
    var active = activeOf(config);
    var part = config.parts && config.parts[active.part];
    var variants = part && part.variants ? Object.keys(part.variants) : [];

    var selected = [];
    if (typeof Outliner !== 'undefined' && Outliner && Array.isArray(Outliner.selected)) {
        selected = Outliner.selected;
    }
    var selection = selected.map(function (el) {
        var marker = null;
        try {
            marker = em.getMarker(config, active.part, active.variant, el.uuid);
        } catch (e) {
            marker = null;
        }
        return { uuid: el.uuid, name: el.name, marker: marker };
    });

    return {
        ok: true,
        project: true,
        active: active,
        parts: Object.keys(config.parts || {}),
        variants: variants,
        selection: selection,
    };
}

function readNode(args) {
    var got = configOrError();
    if (got.error) return got.error;
    var config = got.config;
    var path = resolvePath(config, args.path);
    if (!path.ok) return result.error('路径无效', path.errors || []);

    var read = doc.read(config, path.segments);
    if (!read.ok) return result.error('读取失败', read.errors || []);

    var value = read.value;
    var unresolved = [];
    if (args.as === 'definition') {
        var projected = projectValue(value, path.segments);
        value = projected.value;
        unresolved = projected.unresolved;
    }

    return {
        ok: true,
        path: path.segments,
        kind: read.kind,
        value: value,
        unresolved_bones: unresolved,
    };
}

function validate(args) {
    var got = configOrError();
    if (got.error) return got.error;
    var config = got.config;

    var can;
    try {
        can = canExport(config);
    } catch (e) {
        return result.error('校验失败: ' + (e && e.message ? e.message : e));
    }

    var all = can.issues || [];
    var out = args.only_introduced ? diffIssues(all, lastIssues) : all;
    lastIssues = all;

    return {
        ok: true,
        count: out.length,
        issues: out.map(mapIssue),
        export_ok: !!can.ok,
        errors: (can.errors || []).length,
        warnings: (can.warnings || []).length,
    };
}

function setNode(args) {
    var got = configOrError();
    if (got.error) return got.error;
    var config = got.config;
    var path = resolvePath(config, args.path);
    if (!path.ok) return result.error('路径无效', path.errors || []);

    var before = beginEdit(config);
    var r = ops.setField(config, {
        path: path.segments,
        value: args.value,
        source: 'mcp',
        persist: false,
        strict: true,
        coalesce: false,
        label: 'MCP 修改 ' + pointerOf(path.segments),
    });
    finishEdit(config, r, before);
    return result.from(r, { path: (r && r.path) || path.segments });
}

function removeNode(args) {
    var got = configOrError();
    if (got.error) return got.error;
    var config = got.config;
    var path = resolvePath(config, args.path);
    if (!path.ok) return result.error('路径无效', path.errors || []);

    var segments = path.segments.slice();
    if (segments.length >= 2 && segments[segments.length - 2] === 'hit_boxes') {
        var key = segments[segments.length - 1];
        var bone = ports.get().bones.findByName(key);
        if (bone && bone.uuid) segments[segments.length - 1] = bone.uuid;
    }

    var before = beginEdit(config);
    var r = ops.removeNode(config, {
        path: segments,
        cascade: args.cascade,
        source: 'mcp',
        persist: false,
        strict: true,
    });
    finishEdit(config, r, before);
    return result.from(r, { path: segments });
}

function findHitBoxSubPart(variant, uuid) {
    if (!variant || !isObject(variant.sub_parts)) return null;
    var keys = Object.keys(variant.sub_parts);
    for (var i = 0; i < keys.length; i++) {
        var sp = variant.sub_parts[keys[i]];
        if (sp && isObject(sp.hit_boxes) && sp.hit_boxes[uuid]) return keys[i];
    }
    return null;
}

function findInteractBoxKey(variant, uuid, elementName) {
    if (!variant || !isObject(variant.sub_parts)) return null;
    var spKeys = Object.keys(variant.sub_parts);
    for (var i = 0; i < spKeys.length; i++) {
        var sp = variant.sub_parts[spKeys[i]];
        if (!sp || !isObject(sp.interact_boxes)) continue;
        var keys = Object.keys(sp.interact_boxes);
        for (var j = 0; j < keys.length; j++) {
            var ib = sp.interact_boxes[keys[j]];
            if (ib && (ib._uuid === uuid || (!ib._uuid && ib.bone === elementName))) return keys[j];
        }
    }
    return null;
}

function findConnectorKey(variant, uuid, elementName) {
    if (!variant || !isObject(variant.sub_parts)) return null;
    var spKeys = Object.keys(variant.sub_parts);
    for (var i = 0; i < spKeys.length; i++) {
        var sp = variant.sub_parts[spKeys[i]];
        if (!sp || !isObject(sp.connectors)) continue;
        var keys = Object.keys(sp.connectors);
        for (var j = 0; j < keys.length; j++) {
            var conn = sp.connectors[keys[j]];
            if (conn && (conn._marker_uuid === uuid
                || (!conn._marker_uuid && conn.locator === elementName))) return keys[j];
        }
    }
    return null;
}

function bindMarker(args) {
    var got = configOrError();
    if (got.error) return got.error;
    var config = got.config;
    var active = activeOf(config);
    var variant = config.parts && config.parts[active.part]
        && config.parts[active.part].variants
        && config.parts[active.part].variants[active.variant];
    if (!variant) return result.error('当前变体不存在，请先 set_active');

    var element = ports.get().bones.findByUuid(args.uuid);
    if (!element) {
        return result.error('模型元素 "' + args.uuid + '" 不存在', [{
            path: [], code: 'not_found', expected: 'Group / Locator UUID',
            got: args.uuid, hint: '先创建模型元素，或传正确的 uuid',
        }]);
    }

    var configRef = args.config_ref;
    if (!configRef) {
        if (args.type === 'hit_box') configRef = findHitBoxSubPart(variant, args.uuid);
        else if (args.type === 'interact_box') configRef = findInteractBoxKey(variant, args.uuid, element.name);
        else if (args.type === 'connector') configRef = findConnectorKey(variant, args.uuid, element.name);
    }
    if (!configRef) {
        var hint = args.type === 'sub_part'
            ? 'sub_part 必须传 config_ref（子零件 key）'
            : '先 add_instance 创建配置条目，再 bind_marker';
        return result.error('无法推导 config_ref', [{
            path: [], code: 'not_found', expected: args.type + ' 配置条目',
            got: args.uuid, hint: hint,
        }]);
    }

    var before = beginEdit(config);
    var r = ops.bindMarker(config, {
        partId: active.part,
        variantName: active.variant,
        uuid: args.uuid,
        type: args.type,
        configRef: configRef,
        source: 'mcp',
        persist: false,
        strict: true,
    });
    finishEdit(config, r, before);
    return result.from(r, { uuid: args.uuid, type: args.type, config_ref: configRef });
}

function setActive(args) {
    var got = configOrError();
    if (got.error) return got.error;
    var config = got.config;

    var r = ops.setActive(config, {
        partId: args.part,
        variantName: args.variant,
        source: 'mcp',
    });
    return result.from(r, { active: activeOf(config) });
}

function importPart(args) {
    var got = configOrError();
    if (got.error) return got.error;
    var config = got.config;
    var definition = args.definition === undefined ? {} : args.definition;
    if (!isObject(definition)) {
        return result.error('definition 必须是对象', [{
            path: ['parts', args.part_id], code: 'type_mismatch',
            expected: 'object', got: typeof definition,
        }]);
    }

    var before = beginEdit(config);
    var r = ops.importPart(config, {
        partId: args.part_id,
        definition: definition,
        mode: args.mode,
        oldKey: args.old_key,
        source: 'mcp',
        persist: false,
        strict: true,
    });
    finishEdit(config, r, before);
    return result.from(r, { part_id: args.part_id, action: r && r.action });
}

function importVariant(args) {
    var got = configOrError();
    if (got.error) return got.error;
    var config = got.config;
    var active = activeOf(config);
    var partId = args.parent_part || active.part;
    if (!partId) return result.error('缺少 parent_part，且当前没有活动零件');

    var before = beginEdit(config);
    var r = ops.importVariant(config, {
        partId: partId,
        variantName: args.variant,
        definition: args.definition,
        mode: args.mode,
        oldKey: args.old_key,
        source: 'mcp',
        persist: false,
        strict: true,
    });
    finishEdit(config, r, before);
    return result.from(r, {
        parent_part: partId,
        variant: args.variant,
        action: r && r.action,
    });
}

function importSubPart(args) {
    var got = configOrError();
    if (got.error) return got.error;
    var config = got.config;
    var active = activeOf(config);
    if (!active.part) return result.error('当前没有活动零件，请先 set_active');

    var variantName = args.parent_variant || active.variant;
    var before = beginEdit(config);
    var r = ops.importSubPart(config, {
        partId: active.part,
        variantName: variantName,
        spKey: args.key,
        definition: args.definition === undefined ? {} : args.definition,
        mode: args.mode,
        oldKey: args.old_key,
        source: 'mcp',
        persist: false,
        strict: true,
    });
    finishEdit(config, r, before);
    return result.from(r, {
        key: args.key,
        parent_variant: variantName,
        action: r && r.action,
    });
}

function importSubsystem(args) {
    var got = configOrError();
    if (got.error) return got.error;
    var config = got.config;
    var active = activeOf(config);
    if (!active.part) return result.error('当前没有活动零件，请先 set_active');

    var before = beginEdit(config);
    var r = ops.importSubsystem(config, {
        partId: active.part,
        variantName: active.variant,
        spKey: args.parent_sub_part,
        instanceName: args.key,
        definition: args.definition,
        mode: args.mode,
        oldKey: args.old_key,
        source: 'mcp',
        persist: false,
        strict: true,
    });
    finishEdit(config, r, before);
    return result.from(r, {
        key: args.key,
        parent_sub_part: args.parent_sub_part,
        action: r && r.action,
    });
}

function addInstance(args) {
    var got = configOrError();
    if (got.error) return got.error;
    var config = got.config;
    var parent = resolvePath(config, args.parent_path);
    if (!parent.ok) return result.error('父路径无效', parent.errors || []);

    var definition = args.definition === undefined ? {} : args.definition;
    if (!isObject(definition)) {
        return result.error('definition 必须是对象', [{
            path: parent.segments, code: 'type_mismatch',
            expected: 'object', got: typeof definition,
        }]);
    }
    if (args.kind === 'hit_box' && !args.key) {
        return result.error('hit_box 必须给 key（骨骼名）', [{
            path: parent.segments, code: 'missing_required',
            expected: 'key', got: '', hint: 'key 是模型里的骨骼名',
        }]);
    }
    if (args.kind === 'interact_box' && !definition.bone) {
        return result.error('interact_box 的 definition 必须给 bone', [{
            path: parent.segments, code: 'missing_required',
            expected: 'definition.bone', got: '',
        }]);
    }
    if (args.kind === 'connector' && !definition.locator) {
        return result.error('connector 的 definition 必须给 locator', [{
            path: parent.segments, code: 'missing_required',
            expected: 'definition.locator', got: '',
        }]);
    }

    var before = beginEdit(config);
    var r = ops.addInstance(config, parent.segments, args.kind, args.key, definition, {
        source: 'mcp',
        persist: false,
        strict: true,
    });
    finishEdit(config, r, before);
    return result.from(r, {
        path: (r && r.path) || parent.segments.concat([args.key || '']),
        key: r && r.key,
    });
}

// ── 内容包定义目录 ──────────────────────────────────────────────

function summarizeDef(type, def) {
    var out = {};
    if (!isObject(def)) return out;

    Object.keys(def).forEach(function (key) {
        if (key === '$schema') return;
        var value = def[key];
        if (value === null || typeof value === 'object') return;
        out[key] = value;
    });

    if (type === 'materials') {
        if (isObject(def.armor)) {
            out.armor = {
                rha: def.armor.rha,
                dmg_resist: def.armor.dmg_resist,
                dmg_mult: def.armor.dmg_mult,
                angle_effect: def.armor.angle_effect,
            };
        }
        if (isObject(def.physics)) {
            out.physics = {
                friction: def.physics.friction,
                rolling_friction: def.physics.rolling_friction,
                restitution: def.physics.restitution,
            };
        }
    }
    if (type === 'control_groups' && isObject(def.base_group)) {
        out.name = def.base_group.name;
        out.control_mode = def.base_group.control_mode;
    }

    out.field_count = Object.keys(def).filter(function (key) {
        return key !== '$schema';
    }).length;
    return out;
}

function sourceMatches(source, filter) {
    if (!filter) return true;
    if (filter === 'dependency') return String(source).indexOf('dependency:') === 0;
    return source === filter;
}

function listDefs(args) {
    var got = configOrError();
    if (got.error) return got.error;
    var config = got.config;
    var type = args && args.type;
    if (DEF_TYPE.indexOf(type) === -1) {
        return result.error('未知定义类型: ' + type, [{
            path: [], code: 'invalid_format', expected: DEF_TYPE.join(' / '),
            got: type, hint: 'type 必须是 materials / connectors / subsystems / control_groups / projectiles',
        }]);
    }

    var merged;
    try {
        merged = defs.loadMergedDefs(config, type);
    } catch (e) {
        return result.error('读取定义目录失败: ' + (e && e.message ? e.message : e));
    }

    var all = merged && merged.defs ? merged.defs : {};
    var sources = (merged && merged.sources) || {};
    var needle = args && typeof args.search === 'string' ? args.search.trim().toLowerCase() : '';
    var filter = args && args.source;
    var limit = args && args.limit ? args.limit : 100;
    if (limit > 500) limit = 500;

    var rows = Object.keys(all).sort(function (a, b) {
        return a.localeCompare(b);
    }).map(function (id) {
        var def = all[id];
        var source = sources[id] || 'unknown';
        var summary = summarizeDef(type, def);
        return {
            id: id,
            source: source,
            editable: source === 'current',
            name: (isObject(def) && (def.name || def.id)) || id,
            summary: summary,
        };
    }).filter(function (row) {
        if (!sourceMatches(row.source, filter)) return false;
        if (!needle) return true;
        return (row.id + ' ' + row.name + ' ' + (row.summary.type || '')).toLowerCase().indexOf(needle) !== -1;
    });

    var total = rows.length;
    var page = rows.slice(0, limit);
    return {
        ok: true,
        type: type,
        total: total,
        count: page.length,
        truncated: total > page.length,
        defs: page,
    };
}

function readDef(args) {
    var got = configOrError();
    if (got.error) return got.error;
    var config = got.config;
    var type = args && args.type;
    var id = args && args.id;
    if (DEF_TYPE.indexOf(type) === -1) {
        return result.error('未知定义类型: ' + type, [{
            path: [], code: 'invalid_format', expected: DEF_TYPE.join(' / '),
            got: type, hint: 'type 必须是 materials / connectors / subsystems / control_groups / projectiles',
        }]);
    }
    if (!id || typeof id !== 'string') {
        return result.error('缺少定义 id', [{
            path: [], code: 'missing_required', expected: '机器可读的完整 id',
            got: id, hint: '先用 list_defs 查看可用 id，例如 machine_max:structural_steel',
        }]);
    }

    var merged;
    try {
        merged = defs.loadMergedDefs(config, type);
    } catch (e) {
        return result.error('读取定义失败: ' + (e && e.message ? e.message : e));
    }

    var all = merged && merged.defs ? merged.defs : {};
    var key = id;
    if (!Object.prototype.hasOwnProperty.call(all, key)
        && config.namespace
        && Object.prototype.hasOwnProperty.call(all, config.namespace + ':' + key)) {
        key = config.namespace + ':' + key;
    }
    if (!Object.prototype.hasOwnProperty.call(all, key)) {
        return result.error('定义不存在: ' + type + ':' + id, [{
            path: [], code: 'not_found', expected: '已合并的内置 / 依赖 / 当前包定义',
            got: id, hint: '先调用 list_defs(type="' + type + '") 查看可用 id',
        }]);
    }

    var source = (merged.sources && merged.sources[key]) || 'unknown';
    return {
        ok: true,
        type: type,
        id: key,
        source: source,
        editable: source === 'current',
        definition: all[key],
    };
}

var TOOLS = [
    {
        name: 'get_context',
        description: 'Read the MachineMax project context: active part/variant, part ids, variants, and selection.',
        run: getContext,
    },
    {
        name: 'read_node',
        description: 'Read a config node by segment array or JSON Pointer. Relative paths are resolved against the active part/variant. as="definition" projects UUIDs to bone names and strips internal fields; it keeps sub_parts as a map.',
        run: readNode,
    },
    {
        name: 'list_defs',
        description: 'List available content-pack definitions (materials / connectors / subsystems / control_groups / projectiles) merged from builtin, dependency, and current packs. Returns id, source, editable, and a compact summary; use read_def for full JSON.',
        run: listDefs,
    },
    {
        name: 'read_def',
        description: 'Read one merged content-pack definition by namespaced id (e.g. machine_max:structural_steel). Returns source, editable, and the full definition JSON. Use list_defs first to discover ids.',
        run: readDef,
    },
    {
        name: 'validate',
        description: 'Run the export gate (business validation + schema required/enum/range) and return structured issues. only_introduced=true diffs against the previous tool result.',
        run: validate,
    },
    {
        name: 'set_node',
        description: 'Write one field or map entry through ops.setField. Strict types (no implicit coercion), path addressing, side effects, and native undo. Does not save the project.',
        run: setNode,
    },
    {
        name: 'remove_node',
        description: 'Delete a config node and clean references that point to it (markers, signal targets, power links). cascade=false keeps references.',
        run: removeNode,
    },
    {
        name: 'bind_marker',
        description: 'Bind a model element (Group/Locator) to sub_part / hit_box / interact_box / connector. hit_box/interact_box/connector config_ref is derived from context when omitted.',
        run: bindMarker,
    },
    {
        name: 'set_active',
        description: 'Switch the active part/variant context. This is view state, not an undoable project edit.',
        run: setActive,
    },
    {
        name: 'import_part',
        description: 'Replace a whole part definition (mode=create/replace/rename). Omitted fields reset to defaults; read_node(as="definition") first for a lossless edit.',
        run: importPart,
    },
    {
        name: 'import_variant',
        description: 'Replace a whole variant definition. Omitted fields reset to defaults; replaces its whole sub_parts subtree.',
        run: importVariant,
    },
    {
        name: 'import_sub_part',
        description: 'Replace a whole sub_part definition. The key must be canonical: sub_part.<namespace>.<name>. Omitted fields reset to defaults.',
        run: importSubPart,
    },
    {
        name: 'import_subsystem',
        description: 'Replace a whole subsystem definition under parent_sub_part. The key must be the full translation key; type must be machine_max:<type>.',
        run: importSubsystem,
    },
    {
        name: 'add_instance',
        description: 'Create one small instance (hit_box / interact_box / connector) under a sub_part. Requires an existing Group/Locator; config_ref is bound automatically.',
        run: addInstance,
    },
];

var BY_NAME = {};
TOOLS.forEach(function (tool) { BY_NAME[tool.name] = tool; });

function all() {
    return TOOLS.slice();
}

function get(name) {
    return BY_NAME[name] || null;
}

/**
 * 执行一个工具并返回 MCP 结构化结果。
 * 失败不抛异常；未知工具返回 not_found。
 */
function execute(name, args, mcp) {
    var tool = get(name);
    if (!tool) {
        return result.wrap(mcp, result.error('未知工具: ' + name, [{
            path: [], code: 'not_found', expected: '已注册的工具', got: name,
        }]));
    }
    try {
        var payload = tool.run(args || {}, mcp);
        return result.wrap(mcp, payload);
    } catch (e) {
        if (e && e.code) {
            return result.wrap(mcp, result.error(e.message, [{
                path: [], code: e.code, expected: '可执行的编辑', got: '',
                hint: e.message,
            }]));
        }
        return result.wrap(mcp, result.error('工具执行失败: ' + (e && e.message ? e.message : e)));
    }
}

module.exports = {
    all: all,
    get: get,
    execute: execute,
    resetState: resetState,
    _internals: {
        resolvePath: resolvePath,
        projectValue: projectValue,
        diffIssues: diffIssues,
    },
};
