// 文件: src/services/import_plan.js
// 用途: 批量导入的纯策略层 — 解析结果 → 导入计划 → 冲突决议（docs/15 §4.2）
// 所属模块: MachineMax Blockbench 插件
//
// 零副作用：不读盘、不写配置、不弹框、不 toast、不打日志。
// I/O（读文件 / 归一化失败）在 import/drag_import.js 的 normalizeInputs；
// 写配置与撤销边界在 drag_import.js 的 applyPlan。
//
// 依赖：lib/json_text.js（纯文本）、doc/keys.js（key 规范）、codec（PartCodec.decode）。

'use strict';

var jsonText = require('../lib/json_text.js');
var keys = require('../doc/keys.js');
var PartCodec = require('../codec/codecs/part_codec.js').PartCodec;

var JSON_SUFFIX_RE = /\.json$/i;

/** 取路径的最后一段（`/` 与 `\` 都算分隔符）；无路径返回 ''。 */
function basenameOf(filePath) {
    if (!filePath) return '';
    var s = String(filePath);
    var slash = Math.max(s.lastIndexOf('/'), s.lastIndexOf('\\'));
    return slash >= 0 ? s.slice(slash + 1) : s;
}

/** `variants` 必须是非空普通对象（数组不算，原型上的东西不算）。 */
function hasVariants(partConfig) {
    var variants = partConfig && partConfig.variants;
    if (!variants || typeof variants !== 'object' || Array.isArray(variants)) return false;
    return Object.keys(variants).length > 0;
}

/**
 * 把归一化后的输入解析成导入计划。只读 `existingParts`，不修改任何入参。
 *
 * 失败归属：I/O 相关的 `read_failed` / `empty_content` 通常由 `normalizeInputs` 产出；
 * 本函数只对"取不到文件名 / content 不是字符串 / 内容为空"做防御性兜底，其余判定：
 * `bad_json`（注释剥离后仍不是合法 JSON）、`bad_part`（不是零件定义 / 零变体）、
 * `bad_part_id`（文件名不是安全的 partId）。
 *
 * @param {Array<{name?: string, content?: string, path?: string}>} inputs
 * @param {Object<string, any>} existingParts - `config.parts`（只读）
 * @returns {{
 *   entries: Array<{
 *     fileName: string, partId: string, partConfig: Object,
 *     state: 'new'|'existing'|'duplicate',
 *     leaderIndex: number|null
 *   }>,
 *   failures: Array<{fileName: string, reason: string, detail?: string}>,
 *   existingIds: string[],
 *   duplicateIds: string[],
 *   takenIds: string[]
 * }}
 */
function planImports(inputs, existingParts) {
    var parts = existingParts || {};
    var entries = [];
    var failures = [];
    var existingIds = [];
    var duplicateIds = [];
    var existingSeen = new Set();
    // partId → 第一个同 id 条目在 entries 中的下标；用 Map 避免 `constructor` 命中原型
    var leaderOf = new Map();

    var list = Array.isArray(inputs) ? inputs : [];
    for (var i = 0; i < list.length; i++) {
        var input = list[i] || {};
        var fileName = input.name ? String(input.name) : basenameOf(input.path);
        if (!fileName) {
            failures.push({ fileName: '', reason: 'read_failed', detail: '缺少文件名与路径' });
            continue;
        }
        if (typeof input.content !== 'string') {
            failures.push({ fileName: fileName, reason: 'read_failed', detail: '内容不是字符串' });
            continue;
        }
        if (input.content.trim() === '') {
            failures.push({ fileName: fileName, reason: 'empty_content' });
            continue;
        }

        var raw;
        try {
            raw = jsonText.parseJSONWithComments(input.content);
        } catch (err) {
            failures.push({
                fileName: fileName,
                reason: 'bad_json',
                detail: err && err.message ? err.message : String(err),
            });
            continue;
        }

        var partConfig;
        try {
            partConfig = PartCodec.decode(raw);
        } catch (err) {
            failures.push({
                fileName: fileName,
                reason: 'bad_part',
                detail: err && err.message ? err.message : String(err),
            });
            continue;
        }
        if (!hasVariants(partConfig)) {
            failures.push({ fileName: fileName, reason: 'bad_part', detail: '没有定义变体' });
            continue;
        }

        var partId = fileName.replace(JSON_SUFFIX_RE, '');
        if (!keys.isSafePartId(partId)) {
            failures.push({ fileName: fileName, reason: 'bad_part_id', detail: partId });
            continue;
        }

        var state;
        var leaderIndex = null;
        var hasLeader = leaderOf.has(partId);
        if (hasLeader) {
            // 同批更早的条目已有该 id：不论配置里是否也有，都按 leader 的结果处理
            state = 'duplicate';
            leaderIndex = leaderOf.get(partId);
            if (duplicateIds.indexOf(partId) < 0) duplicateIds.push(partId);
        } else if (Object.prototype.hasOwnProperty.call(parts, partId)) {
            state = 'existing';
            if (!existingSeen.has(partId)) {
                existingSeen.add(partId);
                existingIds.push(partId);
            }
        } else {
            state = 'new';
        }
        if (!hasLeader) leaderOf.set(partId, entries.length);

        entries.push({
            fileName: fileName,
            partId: partId,
            partConfig: partConfig,
            state: state,
            leaderIndex: leaderIndex,
        });
    }

    return {
        entries: entries,
        failures: failures,
        existingIds: existingIds,
        duplicateIds: duplicateIds,
        takenIds: Object.keys(parts),
    };
}

/**
 * 把计划 + 整批决议解析成可执行条目（纯函数，不修改 `plan`）。
 *
 * 分配顺序：先给所有 `new` 占位（`finalId = partId`），再按 `entries` 顺序处理
 * `existing` / `duplicate`；`used` 的初值是 `plan.takenIds`（配置里**全部**既有 key），
 * 因此改名结果不会撞上本批之外的零件。
 *
 * @param {ReturnType<typeof planImports>} plan
 * @param {'overwrite'|'skip'|'rename'|'cancel'} action
 * @returns {{entries: Array<Object>, cancelled: boolean}}
 */
function resolvePlan(plan, action) {
    var entries = plan.entries || [];
    var resolved = entries.map(function (e) {
        return {
            fileName: e.fileName,
            partId: e.partId,
            partConfig: e.partConfig,
            state: e.state,
            leaderIndex: e.leaderIndex,
            action: null,
            finalId: null,
        };
    });

    if (action === 'cancel') {
        for (var c = 0; c < resolved.length; c++) resolved[c].action = 'cancel';
        return { entries: resolved, cancelled: true };
    }
    if (action !== 'overwrite' && action !== 'skip' && action !== 'rename') {
        throw new TypeError('resolvePlan: 未知的 action "' + action + '"');
    }

    var used = new Set(plan.takenIds || []);

    // 第一遍：new 条目先占位，避免 existing 改名时抢走本批新增文件的 partId
    for (var i = 0; i < resolved.length; i++) {
        var e = resolved[i];
        if (e.state !== 'new') continue;
        e.action = 'create';
        e.finalId = e.partId;
        used.add(e.finalId);
    }

    // 第二遍：existing / duplicate
    for (var j = 0; j < resolved.length; j++) {
        var cur = resolved[j];
        if (cur.state === 'new') continue;

        if (cur.state === 'duplicate') {
            var leader = resolved[cur.leaderIndex];
            if (!leader || leader.action === null) {
                throw new Error('resolvePlan: duplicate 条目的 leader 尚未决议');
            }
            if (leader.action === 'skip' || leader.action === 'cancel') {
                cur.action = leader.action;
                continue;
            }
            cur.action = 'rename';
            cur.finalId = keys.reservePartId(cur.partId, used);
            used.add(cur.finalId);
            continue;
        }

        if (action === 'overwrite') {
            cur.action = 'overwrite';
            cur.finalId = cur.partId;
        } else if (action === 'skip') {
            cur.action = 'skip';
            cur.finalId = cur.partId;
        } else {
            cur.action = 'rename';
            cur.finalId = keys.reservePartId(cur.partId, used);
            used.add(cur.finalId);
        }
    }

    return { entries: resolved, cancelled: false };
}

module.exports = {
    planImports: planImports,
    resolvePlan: resolvePlan,
};
