/**
 * field_issues.js — 属性面板「终端字段」校验标注 mixin
 *
 * 面板只负责渲染；每个面板通过 `issue-list` 接收「当前条目」的 Problem[]，
 * 再用 `fieldClass(field)` / `fieldIssueMessage(field)` / `fieldIssueTitle(field)`
 * 把 collectIssues 的 path.field 落到具体输入控件上。
 *
 * 约定：
 * - `issue-list` 只包含当前条目（子系统 / 连接点 / 碰撞箱 / 交互区 / 子零件自身字段）
 *   的问题，父组件按 `aggregate().byItem` / `bySubPart` 过滤后传入。
 * - 行级红框仍由面板已有的 `mm-item-error` 负责；本 mixin 只加字段级红框。
 * - 嵌套字段（signal_targets.engine_speed.0）会自动归到 `signal_targets`。
 */
var {
    resolveIssueLevel,
    filterFieldIssues,
} = require('../../core/validation_types.js');

/** 取第一条用户可读提示；多条时补一个计数后缀 */
function _messageOf(issues) {
    if (!issues || issues.length === 0) return '';
    var first = issues[0] && issues[0].message;
    if (!first) return '';
    if (issues.length === 1) return first;
    return first + '（另有 ' + (issues.length - 1) + ' 条问题）';
}

/** 把字段问题拼成原生 title 悬浮提示（支持 \n 换行） */
function _titleOf(issues, base) {
    var lines = [];
    if (base) lines.push(base);
    if (issues && issues.length > 0) {
        if (base) lines.push('—— 存在问题 ——');
        for (var i = 0; i < issues.length; i++) {
            var p = issues[i];
            lines.push('[' + (p.severity === 'error' ? '错误' : '警告') + '] ' + p.message);
        }
    }
    return lines.join('\n');
}

var fieldIssueMixin = {
    props: {
        /** 当前条目的全部校验问题（Problem[]） */
        issueList: { type: Array, default: function () { return []; } },
    },
    computed: {
        /** 当前条目总体问题级别（驱动标题徽标） */
        itemIssueLevel: function () {
            return resolveIssueLevel(this.issueList);
        },
        itemIssueCount: function () {
            return (this.issueList || []).length;
        },
    },
    methods: {
        /** 指定字段的问题列表（含嵌套字段） */
        fieldIssues: function (field) {
            return filterFieldIssues(this.issueList, field);
        },
        /** 指定字段的问题级别 */
        fieldLevel: function (field) {
            return resolveIssueLevel(this.fieldIssues(field));
        },
        /** 字段包装元素的 class：mm-field-error / mm-field-warning */
        fieldClass: function (field) {
            var level = this.fieldLevel(field);
            return level === 'none' ? '' : 'mm-field-' + level;
        },
        /** 字段行内提示文案（无问题返回空串） */
        fieldIssueMessage: function (field) {
            return _messageOf(this.fieldIssues(field));
        },
        /** 字段悬浮提示：默认提示 + 问题清单 */
        fieldIssueTitle: function (field, base) {
            return _titleOf(this.fieldIssues(field), base);
        },
    },
};

module.exports = {
    mixin: fieldIssueMixin,
    fieldIssueMessage: function (problems, field) {
        return _messageOf(filterFieldIssues(problems, field));
    },
    fieldIssueTitle: function (problems, field, base) {
        return _titleOf(filterFieldIssues(problems, field), base);
    },
};
