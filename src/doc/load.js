// 文件: src/doc/load.js
// 用途: 工程加载用的宽容解码 —— 结构非法时不整件失败
// 所属模块: MachineMax Blockbench 插件
//
// 与 doc/shapes.js 的 decodeStrict 分工不同：
//   - decodeStrict 供写入链路（导入 part JSON / setField）使用，解不出来就拒绝写入
//   - decodePart 供读盘使用：坏条目原样保留，其余条目照常解出并填默认值，
//     工程仍能打开、能进「零件定义」模式；非法值由校验报（doc/validate 的值校验
//     已覆盖容器形状与各字段类型），导出由闸门拦（services/issues 的 collectAllIssues
//     与 services/export 的编码试跑）
//
// 为什么不能"出错就整件保留"：一个坏碰撞箱会让整个零件丢掉全部默认值，作者在面板
// 上看到一片空白，还得先改对才能继续。这里逐层剥离坏条目，坏的那条原样塞回，
// 好条目照常走 codec。
//
// 简写形态（`variants` 里的 `model` 是字符串、`sub_parts` 的 key 不含 . 或 :）
// 整块交给 codec，不逐条剥离 —— 逐条遍历会把单变体简写当成变体名。判定与
// `Codec.either` 的 decode 启发式保持一致，见 codec/Codec.js 的 either()。

'use strict';

var fieldSpecs = require('./field_specs.js');
var { PartLoadCodec } = require('../codec/codecs/part_codec.js');
var { VariantLoadCodec } = require('../codec/codecs/variant_codec.js');
var { SubPartLoadCodec } = require('../codec/codecs/sub_part_codec.js');
var { HitBoxCodec } = require('../codec/codecs/hit_box_codec.js');
var { InteractBoxCodec } = require('../codec/codecs/interact_box_codec.js');
var { ConnectorCodec } = require('../codec/codecs/connector_codec.js');
var { SubsystemLoadCodec } = require('../codec/codecs/subsystem_codec.js');

/** 内部树每个 kind 的解码器（子系统用加载实例：未知类型原样保留） */
var LOAD_CODECS = {
    part: PartLoadCodec,
    variant: VariantLoadCodec,
    sub_part: SubPartLoadCodec,
    hit_box: HitBoxCodec,
    interact_box: InteractBoxCodec,
    connector: ConnectorCodec,
    subsystem: SubsystemLoadCodec,
};

/** 单次加载最多记录的 issue 数（坏数据成片时不要刷爆日志） */
var MAX_ISSUES = 64;

function isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function typeName(v) {
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    return typeof v;
}

function pushIssue(issues, path, kind, message) {
    if (issues.length >= MAX_ISSUES) return;
    issues.push({
        path: path.slice(),
        code: 'load_decode_failed',
        kind: kind,
        message: message,
    });
}

/**
 * 容器是「key → 条目」的 map，还是单实体简写？
 *
 * `variants` 与 `sub_parts` 在 Codec 里是 either：`variants` 的 `model` 是字符串时
 * 按单变体解；`sub_parts` 的 key 都不含 `.` / `:` 时按单个子零件解。这两种形态
 * 整块交给 codec，逐条剥离会把简写拆坏。
 *
 * 其余容器（hit_boxes / interact_boxes / connectors / subsystems）恒为 map。
 */
function isMapContainer(container, value) {
    if (container === 'variants') return typeof value.model !== 'string';
    if (container === 'sub_parts') {
        for (var key in value) {
            if (!hasOwn(value, key)) continue;
            if (key.indexOf('.') >= 0 || key.indexOf(':') >= 0) return true;
        }
        return false;
    }
    return true;
}

/**
 * 递归剥离坏条目。
 *
 * @param {string} kind - 节点 kind
 * @param {*} raw - 原始值
 * @param {string[]} path - 从配置根开始的绝对段路径
 * @param {Array} removed - 出参：被剥掉的条目 { path, raw }
 * @param {Array} issues - 出参：解码问题
 * @returns {{ok: boolean, raw: *}} ok 表示这个节点（剥掉坏子项后）能被 codec 解出
 */
function sanitizeNode(kind, raw, path, removed, issues) {
    var codec = LOAD_CODECS[kind];
    if (!codec) return { ok: false, raw: raw };
    if (!isPlainObject(raw)) {
        if (raw !== undefined) {
            pushIssue(issues, path, kind, '应为对象，实际是 ' + typeName(raw));
        }
        return { ok: false, raw: raw };
    }

    var clean = Object.assign({}, raw);

    // part 级的编辑器内部字段不在 schema 里：坏掉就整条保留，别拖累零件解码
    if (kind === 'part' && hasOwn(raw, 'element_markers') && !isPlainObject(raw.element_markers)) {
        pushIssue(issues, path.concat(['element_markers']), kind,
            'element_markers 应为对象，实际是 ' + typeName(raw.element_markers));
        delete clean.element_markers;
        removed.push({ path: path.concat(['element_markers']), raw: raw.element_markers });
    }

    var containers = fieldSpecs.getContainers(kind);
    for (var ci = 0; ci < containers.length; ci++) {
        var container = containers[ci];
        var childKind = fieldSpecs.getContainerChildKind(container);
        if (!childKind || !hasOwn(raw, container)) continue;
        var entries = raw[container];

        if (!isPlainObject(entries)) {
            // 容器本身不是对象：整块保留（校验会报类型错），本节点继续用默认值
            pushIssue(issues, path.concat([container]), kind,
                '应为对象（key → 条目），实际是 ' + typeName(entries));
            delete clean[container];
            removed.push({ path: path.concat([container]), raw: entries });
            continue;
        }
        if (!isMapContainer(container, entries)) continue;

        var kept = {};
        for (var key in entries) {
            if (!hasOwn(entries, key)) continue;
            var childPath = path.concat([container, key]);
            var child = sanitizeNode(childKind, entries[key], childPath, removed, issues);
            if (child.ok) {
                kept[key] = child.raw;
            } else {
                // 子节点自己已经记了 issue；这里只负责在原父节点上留着原始数据
                removed.push({ path: childPath, raw: entries[key] });
            }
        }
        clean[container] = kept;
    }

    try {
        codec.decode(clean);
        return { ok: true, raw: clean };
    } catch (e) {
        pushIssue(issues, path, kind, e && e.message ? e.message : String(e));
        return { ok: false, raw: raw };
    }
}

/**
 * 把剥掉的条目原样塞回解码后的树。
 *
 * 中间层缺失时补空对象：解码后的节点理论上都有这些容器，但简写形态会折叠层级，
 * 补一次可避免 attach 中途踩空。
 */
function attachRaw(root, path, baseLength, value) {
    var node = root;
    for (var i = baseLength; i < path.length - 1; i++) {
        if (!isPlainObject(node)) return;
        var seg = path[i];
        if (!isPlainObject(node[seg])) node[seg] = {};
        node = node[seg];
    }
    if (!isPlainObject(node)) return;
    node[path[path.length - 1]] = value;
}

/**
 * 宽容解码单个零件。
 *
 * @param {*} rawPart - 工程里存的零件数据（任意形状）
 * @param {object} [opts] - { partId } 只用于问题路径前缀
 * @returns {{node: *, issues: Array}} node 一定可写回配置（解不出来时就是原始值）
 */
function decodePart(rawPart, opts) {
    opts = opts || {};
    var root = opts.partId ? ['parts', String(opts.partId)] : [];
    var issues = [];
    var removed = [];

    var clean = sanitizeNode('part', rawPart, root, removed, issues);
    if (!clean.ok) return { node: rawPart, issues: issues };

    var node;
    try {
        node = LOAD_CODECS.part.decode(clean.raw);
    } catch (e) {
        pushIssue(issues, root, 'part', e && e.message ? e.message : String(e));
        return { node: rawPart, issues: issues };
    }

    for (var i = 0; i < removed.length; i++) {
        attachRaw(node, removed[i].path, root.length, removed[i].raw);
    }
    return { node: node, issues: issues };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        decodePart: decodePart,
    };
}
