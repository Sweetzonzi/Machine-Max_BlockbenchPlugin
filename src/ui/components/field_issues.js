/**
 * field_issues.js — 属性面板「终端字段」校验标注 mixin
 *
 * 面板只负责渲染；每个面板通过 `issue-list` 接收「当前条目」的 Problem[]，
 * 再用 `fieldClass(field)` 把 collectIssues 的 path.field 落到具体输入控件上。
 *
 * 约定：
 * - 只标红/琥珀，不显示原因文案；问题原因仍由条目行 `title`、原生「检验」清单
 *   与导出对话框展示。
 * - `issue-list` 只包含当前条目（子系统 / 连接点 / 碰撞箱 / 交互区 / 子零件自身字段）
 *   的问题，父组件按 `aggregate().byItem` / `bySubPart` 过滤后传入。
 * - 行级红框仍由面板已有的 `mm-item-error` 负责；本 mixin 只加字段级红框。
 * - 嵌套字段（signal_targets.engine_speed.0）会自动归到 `signal_targets`。
 */
var {
    resolveIssueLevel,
    filterFieldIssues,
} = require('../../core/validation_types.js');

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
    },
};

module.exports = {
    mixin: fieldIssueMixin,
};
