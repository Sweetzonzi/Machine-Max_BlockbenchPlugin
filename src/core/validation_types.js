/**
 * validation_types.js — 校验问题模型 + 聚合纯函数（单一真源的数据层）
 *
 * 本模块只定义数据类型与纯逻辑，不引用 Vue / Blockbench 全局，
 * 因此可被 UI（App.vue.js / SubPartPanel）、mode（validation_check.js）、
 * 导出（export_dialog.js）共同引入，保证三处对同一份 Problem 声明共用。
 *
 * Problem 结构（见 docs/10-校验与错误提示重构实现计划.md §5.1）：
 * {
 *   severity: 'error' | 'warning',  // 视觉分级（error 红 / warning 琥珀），均不阻断导出
 *   code: string,                   // 稳定标识，供面板精确样式 / 测试断言
 *   message: string,                // 面向用户的中文提示
 *   path: {
 *     scope: 'part'|'variant'|'subpart'|'subsystem'|'connector'|'hit_box'|'interact_box',
 *     partId, variantName, subPartKey?, itemKey?, elementUuid?,
 *   },
 *   nav?: () => void,               // 一键定位；由消费点（全局导航单例）注入，本模块不生成
 * }
 */

/** severity 常量 */
var SEVERITY_ERROR = 'error';
var SEVERITY_WARNING = 'warning';

/**
 * `code` 稳定标识约定（表见 docs/10-校验与错误提示重构实现计划.md §5.1）
 * 供面板精确样式 / 测试断言，不随文案变动。
 */
var CODES = {
    SUBSYSTEM_REQUIRED_FIELD: 'subsystem_required_field', // 子系统 required 字段缺失（含 ''/null/undefined）
    DEFINITION_REQUIRED: 'definition_required',           // 子系统/连接点的 definition 未配置（空串）
    DEFINITION_REF_MISSING: 'definition_ref_missing',     // definition 引用的型号定义不存在（引用断裂）
    ORPHAN_ELEMENT: 'orphan_element',                     // 连接点/碰撞箱/交互区游离（无归属 subpart）
    GHOST_MARKER: 'ghost_marker',                         // 幽灵标记（UUID 对应元素已删除）
    MISSING_REQUIRED: 'missing_required',                 // 其余零件/变体/子零件级必填项（占位）
    DUPLICATE_NAME: 'duplicate_name',                     // 连接点/子系统/交互区名在单变体内重复（Part 级按名寻址歧义）
    RESERVED_NAME: 'reserved_name',                       // 使用了信号保留地址（local/global 等）
    DANGLING_SIGNAL_TARGET: 'dangling_signal_target',     // 信号/功率目标指向不存在的节点（含 power_outputs 的 key）
    MATERIAL_REQUIRED: 'material_required',               // 碰撞箱 material 未配置（空串/null/undefined）
    MATERIAL_REF_MISSING: 'material_ref_missing',         // 碰撞箱 material 引用的材质不存在（machine_max:default 为内置兜底，不查表）
};

/** scope → byItem 桶名映射（仅对"可归属到某个 subpart 条目"的 scope 有意义） */
var SCOPE_ITEM_BUCKET = {
    subsystem: 'subsystems',
    connector: 'connectors',
    hit_box: 'hitBoxes',
    interact_box: 'interactBoxes',
};

/**
 * 判定 `isEmptyVal`：空串 / null / undefined 均视为"缺失/未配置"。
 * 用于修复旧逻辑只认 null|undefined 而漏掉空串 `''` 的 bug。
 * @param {*} val
 * @returns {boolean}
 */
function isMissingValue(val) {
    return val === '' || val === null || val === undefined;
}

/**
 * 聚合纯函数：将 `collectIssues(config)` 产出的 Problem[] 按层级 path 分组。
 *
 * 结果用纯对象承载（兼容 Vue 2 模板 `v-for` 与响应式，避免 Map）。
 *
 * 注意：本函数不感知当前零件/变体。调用方（App.vue.js）应先按当前
 * activePartId + activeVariantName 过滤 problems，再调用本函数，确保
 * bySubPart 以 subPartKey 为键时不跨变体/零件碰撞。
 *
 * @param {Array} problems - Problem[] 数组
 * @returns {{ bySubPart: Object, byItem: Object, byPartVariant: Array }}
 *   bySubPart     { [subPartKey]: Problem[] } — 该 subpart 及其任意后代的全部问题（itemKey 深浅不论）
 *   byItem        { subsystems|connectors|hitBoxes|interactBoxes: { [itemKey]: Problem[] } }
 *                 — 匹配到对应 scope && itemKey 的问题（仅限有归属 subpart 的条目）
 *   byPartVariant Problem[]                  — 零件级/变体级问题 + 游离连接点/碰撞箱/交互区（无 subPartKey）
 */
function aggregate(problems) {
    var bySubPart = {};
    var byItem = { subsystems: {}, connectors: {}, hitBoxes: {}, interactBoxes: {} };
    var byPartVariant = [];

    if (!Array.isArray(problems)) {
        return { bySubPart: bySubPart, byItem: byItem, byPartVariant: byPartVariant };
    }

    for (var i = 0; i < problems.length; i++) {
        var p = problems[i];
        var pi = p && p.path;
        if (!pi) continue;

        // 有 subPartKey → 冒泡到 bySubPart（上层可见底层问题）
        if (pi.subPartKey) {
            if (!bySubPart[pi.subPartKey]) bySubPart[pi.subPartKey] = [];
            bySubPart[pi.subPartKey].push(p);

            // 有 itemKey → 归入 byItem 对应桶（SubPart 面板行级红框）
            if (pi.itemKey) {
                var bucket = SCOPE_ITEM_BUCKET[pi.scope];
                if (bucket && byItem[bucket]) {
                    if (!byItem[bucket][pi.itemKey]) byItem[bucket][pi.itemKey] = [];
                    byItem[bucket][pi.itemKey].push(p);
                }
            }
        } else {
            // 无 subPartKey → 零件/变体级问题 + 游离元素 → byPartVariant
            byPartVariant.push(p);
        }
    }

    return { bySubPart: bySubPart, byItem: byItem, byPartVariant: byPartVariant };
}

/**
 * 根据范围数组计算每条 problem 的级别：error > warning > none。
 * 供面板判定行级 class 与计数。
 * @param {Array} issues - Problem[]
 * @returns {'error'|'warning'|'none'}
 */
function resolveIssueLevel(issues) {
    if (!issues || !Array.isArray(issues) || issues.length === 0) return 'none';
    var hasError = false;
    for (var i = 0; i < issues.length; i++) {
        if (issues[i] && issues[i].severity === SEVERITY_ERROR) return SEVERITY_ERROR;
        if (issues[i] && issues[i].severity === SEVERITY_WARNING) hasError = true;
    }
    return hasError ? SEVERITY_WARNING : 'none';
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SEVERITY_ERROR: SEVERITY_ERROR,
        SEVERITY_WARNING: SEVERITY_WARNING,
        CODES: CODES,
        SCOPE_ITEM_BUCKET: SCOPE_ITEM_BUCKET,
        isMissingValue: isMissingValue,
        aggregate: aggregate,
        resolveIssueLevel: resolveIssueLevel,
    };
}
