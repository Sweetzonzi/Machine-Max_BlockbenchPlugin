/**
 * 交互区属性面板子组件
 * 选中标记为 interact_box 的 Group 时在属性面板中显示
 *
 * 名称（字典 key）与骨骼（bone 字段）分离：
 * - 名称即翻译键格式的 key（如 interact.machine_max.left_seat）
 * - 骨骼为独立的绑定字段，指向模型中的 Group
 *
 * 交互区定义玩家可点击的交互区域，点击时发送信号到指定目标。
 * 支持交互模式（fast/accurate）和条件逻辑（AND/OR/NAND/NOR/XOR/XNOR）。
 */
var nameUtils = require('../utils/name_utils.js');
var { SIGNAL_CHANNEL_HINTS } = require('../core/constants.js');
var fieldIssues = require('./components/field_issues.js');

Vue.component('mm-interact-box-panel', {
    template: typeof TEMPLATE_INTERACT_BOX_PANEL !== 'undefined' ? TEMPLATE_INTERACT_BOX_PANEL : '<p>交互区面板加载中...</p>',
    mixins: [fieldIssues.mixin],
    props: {
        config: { type: Object, required: true },
        elementName: { type: String, default: '' },
        interactBoxName: { type: String, default: '' },
        namespace: { type: String, default: 'machine_max' },
        parentSubPartKey: { type: String, default: '' },
        /** 当前子零件内的子系统映射，用于信号目标下拉选择 */
        parentSubsystems: { type: Object, default: function() { return {}; } },
        /** 信号目标补全列表（子系统名 + 连接点名 + 交互区名 + 'local' + 'global'） */
        signalTargetHints: { type: Array, default: function() { return []; } },
        /** 模型中所有骨骼名称列表（用于骨骼选择器） */
        allBoneNames: { type: Array, default: function() { return []; } },
    },
    data: function () {
        return {
            overwriteExpanded: false,
            editingName: nameUtils.extractShortName(this.interactBoxName, this.namespace),
            editingBone: this.config.bone || this.elementName || '',
        };
    },
    watch: {
        interactBoxName: function (val) {
            var short = nameUtils.extractShortName(val, this.namespace);
            if (short !== this.editingName) {
                this.editingName = short;
            }
        },
        'config.bone': function (val) {
            if (val !== this.editingBone) {
                this.editingBone = val;
            }
        },
    },
    computed: {
        namePrefix: function () {
            return 'interact.' + this.namespace + '.';
        },
        boneListId: function () {
            return 'mm-ib-bone-list-' + this._uid;
        },
        badgeColor: function () { return '#D9A441'; },
        badgeLabel: function () { return '交互区'; },
        /**
         * 信号目标条目映射
         */
        signalTargetEntries: function () {
            return (this.config && this.config.signal_targets) || {};
        },
        signalTargetChannelCount: function () {
            return Object.keys(this.signalTargetEntries).length;
        },
        /**
         * 常用频道名补全列表（统一来自 constants.js 唯一真源）
         */
        channelHints: function () {
            return SIGNAL_CHANNEL_HINTS;
        },
    },
    methods: {
        displayLabel: function (fullKey) {
            return nameUtils.displayLabel(fullKey, 'zh', 'machine_max');
        },
        onFieldChange: function (field, value) {
            this.$emit('field-change', field, value);
        },
        onNameChange: function (value) {
            var oldKey = this.interactBoxName;
            var newKey = nameUtils.buildFullKey('interact', value, this.namespace);
            if (newKey !== oldKey) {
                this.$emit('name-change', oldKey, newKey);
            }
        },
        onNameBlur: function (event) {
            event.target.style.border = '1px solid transparent';
            event.target.style.background = 'transparent';
        },
        onBoneChange: function (value) {
            if (value !== (this.config.bone || this.elementName)) {
                this.$emit('bone-change', 'bone', value);
            }
        },
        /**
         * 导航到归属子零件：点击归属标签时选中对应的子零件 Group，切换回子零件属性面板
         */
        navigateToSubPart: function () {
            this.$emit('navigate-to-sub-part', this.parentSubPartKey);
        },

        // ===== 信号目标编辑（共享组件 mm-signal-target-editor） =====
        /**
         * 信号目标变更回调：由共享组件 emit，深拷贝后提交 field-change
         * @param {Object} entries - 变更后的 { channel: [target, ...] } 映射
         */
        onSignalTargetsChange: function (entries) {
            this.$emit('field-change', 'signal_targets', JSON.parse(JSON.stringify(entries)));
        },
    },
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
