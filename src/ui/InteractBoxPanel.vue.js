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

Vue.component('mm-interact-box-panel', {
    template: typeof TEMPLATE_INTERACT_BOX_PANEL !== 'undefined' ? TEMPLATE_INTERACT_BOX_PANEL : '<p>交互区面板加载中...</p>',
    props: {
        config: { type: Object, required: true },
        elementName: { type: String, default: '' },
        interactBoxName: { type: String, default: '' },
        namespace: { type: String, default: 'machine_max' },
        parentSubPartKey: { type: String, default: '' },
        /** 当前子零件内的子系统映射，用于信号目标下拉选择 */
        parentSubsystems: { type: Object, default: function() { return {}; } },
        /** 信号目标补全列表（子系统名 + 连接点名 + 'subpart' + 'vehicle'） */
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
         * 常用频道名补全列表
         */
        channelHints: function () {
            return [
                'interact', 'interact_left_front_door', 'interact_right_front_door',
                'interact_left_back_door', 'interact_right_back_door',
                'interact_hood', 'interact_trunk', 'interact_seat',
                'trunk_interact', 'lever_pull', 'button_press',
                'door_interact', 'switch_toggle', 'interact_custom',
            ];
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

        // ===== 信号目标编辑 =====
        /**
         * 获取指定频道的过滤后目标列表：排除该频道中已选的目标，避免重复选择
         * 但保留当前项自身，防止 <select> 因无匹配 option 而显示空白
         * @param {string} channel - 频道名
         * @param {string} [currentValue] - 当前项的值，此值不会被过滤
         * @returns {{value: string, label: string}[]} 过滤后的可用目标列表
         */
        getFilteredTargets: function (channel, currentValue) {
            var allTargets = this.signalTargetHints;
            if (!allTargets || allTargets.length === 0) return [];
            var entries = this.signalTargetEntries;
            var usedTargets = entries[channel];
            if (!usedTargets || usedTargets.length === 0) return allTargets;
            var filtered = [];
            for (var i = 0; i < allTargets.length; i++) {
                var t = allTargets[i];
                if (t.value === currentValue || usedTargets.indexOf(t.value) === -1) {
                    filtered.push(t);
                }
            }
            return filtered;
        },
        /**
         * 添加新的信号频道
         */
        addSignalTargetChannel: function () {
            var entries = JSON.parse(JSON.stringify(this.signalTargetEntries));
            var newChan = 'interact';
            var idx = 1;
            while (entries[newChan]) {
                newChan = 'interact_' + idx;
                idx++;
            }
            entries[newChan] = [];
            this.emitSignalTargets(entries);
        },
        /**
         * 删除信号频道
         */
        removeSignalTargetChannel: function (channel) {
            var entries = JSON.parse(JSON.stringify(this.signalTargetEntries));
            delete entries[channel];
            this.emitSignalTargets(entries);
        },
        /**
         * 重命名信号频道
         */
        onSignalTargetChannelChange: function (oldChannel, newChannel) {
            if (!newChannel || oldChannel === newChannel) return;
            var entries = JSON.parse(JSON.stringify(this.signalTargetEntries));
            var targets = entries[oldChannel];
            if (targets === undefined) return;
            delete entries[oldChannel];
            entries[newChannel] = targets;
            this.emitSignalTargets(entries);
        },
        /**
         * 为指定频道添加信号目标项
         */
        addSignalTargetItem: function (channel) {
            var entries = JSON.parse(JSON.stringify(this.signalTargetEntries));
            if (!entries[channel]) {
                entries[channel] = [];
            }
            entries[channel].push('');
            this.emitSignalTargets(entries);
        },
        /**
         * 删除信号频道的指定目标项
         */
        removeSignalTargetItem: function (channel, index) {
            var entries = JSON.parse(JSON.stringify(this.signalTargetEntries));
            if (entries[channel]) {
                entries[channel].splice(index, 1);
                this.emitSignalTargets(entries);
            }
        },
        /**
         * 更新信号频道的指定目标值
         */
        updateSignalTargetItem: function (channel, index, value) {
            var entries = JSON.parse(JSON.stringify(this.signalTargetEntries));
            if (entries[channel]) {
                entries[channel][index] = value;
                this.emitSignalTargets(entries);
            }
        },
        /**
         * 触发 signal_targets 字段变更事件
         */
        emitSignalTargets: function (entries) {
            this.$emit('field-change', 'signal_targets', JSON.parse(JSON.stringify(entries)));
        },
    },
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
