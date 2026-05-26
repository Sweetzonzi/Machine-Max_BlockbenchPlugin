/**
 * 连接点属性面板子组件
 * 选中标记为 connector 的 Locator 时在属性面板中显示
 *
 * 名称（字典 key）与定位器（locator 字段）分离：
 * - 名称即翻译键格式的 key（如 connector.machine_max.left_front_wheel）
 * - 定位器为独立的绑定字段
 *
 * 扩展功能：信号目标、信号转译、机械能输出、内部连接点、属性覆写
 */
var nameUtils = require('../utils/name_utils.js');

Vue.component('mm-connector-panel', {
    template: typeof TEMPLATE_CONNECTOR_PANEL !== 'undefined' ? TEMPLATE_CONNECTOR_PANEL : '<p>连接点面板加载中...</p>',
    props: {
        config: { type: Object, required: true },
        elementName: { type: String, default: '' },
        connectorName: { type: String, default: '' },
        namespace: { type: String, default: 'machine_max' },
        parentSubPartKey: { type: String, default: '' },
        connectorDefs: { type: Object, default: function() { return {}; } },
        allLocatorNames: { type: Array, default: function() { return []; } },
        /** 当前子零件内的子系统映射，用于 power_target 下拉选择 */
        subsystemKeys: { type: Object, default: function() { return {}; } },
        /** 信号目标补全列表（子系统名 + 连接点名 + 'subpart' + 'vehicle'） */
        signalTargetHints: { type: Array, default: function() { return []; } },
    },
    data: function () {
        return {
            editingName: nameUtils.extractShortName(this.connectorName, this.namespace),
            editingLocator: this.config.locator || this.elementName || '',
        };
    },
    watch: {
        connectorName: function (val) {
            var short = nameUtils.extractShortName(val, this.namespace);
            if (short !== this.editingName) {
                this.editingName = short;
            }
        },
        'config.locator': function (val) {
            if (val !== this.editingLocator) {
                this.editingLocator = val;
            }
        },
    },
    computed: {
        namePrefix: function () {
            return 'connector.' + this.namespace + '.';
        },
        locatorListId: function () {
            return 'mm-connector-loc-list-' + this._uid;
        },
        hasDefinition: function () {
            return !!(this.config && this.config.definition);
        },
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
         * 信号转译条目映射
         */
        translationEntries: function () {
            return (this.config && this.config.signal_translations) || {};
        },
        translationCount: function () {
            return Object.keys(this.translationEntries).length;
        },
        /**
         * 属性覆写条目映射
         */
        overwriteEntries: function () {
            return (this.config && this.config.overwrite) || {};
        },
        overwriteCount: function () {
            return Object.keys(this.overwriteEntries).length;
        },
        /**
         * 常用频道名补全列表
         */
        channelHints: function () {
            return [
                'move_input', 'regular_input', 'engine_control', 'wheel_control',
                'steering', 'throttle', 'brake', 'handbrake',
                'engine_speed', 'wheel_speed', 'vehicle_speed',
                'gear', 'clutch', 'parking_brake', 'power',
                'interact_left_front_door', 'interact_right_front_door',
                'interact_left_back_door', 'interact_right_back_door',
                'interact_hood', 'interact_trunk',
                'interact_left_front', 'interact_right_front',
                'interact_left_back', 'interact_right_back',
            ];
        },
    },
    methods: {
        displayLabel: function (fullKey) {
            return nameUtils.displayLabel(fullKey, 'zh', 'machine_max');
        },
        onNameChange: function (value) {
            var oldKey = this.connectorName;
            var newKey = nameUtils.buildFullKey('connector', value, this.namespace);
            if (newKey !== oldKey) {
                this.$emit('name-change', oldKey, newKey);
            }
        },
        onNameBlur: function (event) {
            event.target.style.border = '1px solid transparent';
            event.target.style.background = 'transparent';
        },
        onLocatorChange: function (value) {
            if (value !== (this.config.locator || this.elementName)) {
                this.$emit('locator-change', this.elementName, value);
            }
        },
        /**
         * 通用字段变更处理
         */
        onFieldChange: function (field, value) {
            this.$emit('field-change', field, value);
        },
        onDefinitionChange: function (value) {
            this.$emit('field-change', 'definition', value);
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
            var entries = this.signalTargetEntries;
            var newChan = 'new_channel';
            var idx = 1;
            while (entries[newChan]) {
                newChan = 'new_channel_' + idx;
                idx++;
            }
            this.$set(entries, newChan, []);
            this.emitSignalTargets(entries);
        },
        /**
         * 删除信号频道
         */
        removeSignalTargetChannel: function (channel) {
            var entries = this.signalTargetEntries;
            this.$delete(entries, channel);
            this.emitSignalTargets(entries);
        },
        /**
         * 重命名信号频道
         */
        onSignalTargetChannelChange: function (oldChannel, newChannel) {
            if (!newChannel || oldChannel === newChannel) return;
            var entries = this.signalTargetEntries;
            var targets = entries[oldChannel];
            if (targets === undefined) return;
            this.$delete(entries, oldChannel);
            this.$set(entries, newChannel, targets);
            this.emitSignalTargets(entries);
        },
        /**
         * 为指定频道添加信号目标项
         */
        addSignalTargetItem: function (channel) {
            var entries = this.signalTargetEntries;
            if (!entries[channel]) {
                this.$set(entries, channel, []);
            }
            entries[channel].push('');
            this.emitSignalTargets(entries);
        },
        /**
         * 删除信号频道的指定目标项
         */
        removeSignalTargetItem: function (channel, index) {
            var entries = this.signalTargetEntries;
            if (entries[channel]) {
                entries[channel].splice(index, 1);
                this.emitSignalTargets(entries);
            }
        },
        /**
         * 更新信号频道的指定目标值
         */
        updateSignalTargetItem: function (channel, index, value) {
            var entries = this.signalTargetEntries;
            if (entries[channel]) {
                this.$set(entries[channel], index, value);
                this.emitSignalTargets(entries);
            }
        },
        /**
         * 触发 signal_targets 字段变更事件
         */
        emitSignalTargets: function (entries) {
            // 深拷贝确保 Vue 响应式检测到变更
            this.$emit('field-change', 'signal_targets', JSON.parse(JSON.stringify(entries)));
        },

        // ===== 信号转译编辑 =====
        /**
         * 添加新的转译规则
         */
        addTranslation: function () {
            var entries = this.translationEntries;
            var newSrc = 'new_source';
            var idx = 1;
            while (entries[newSrc]) {
                newSrc = 'new_source_' + idx;
                idx++;
            }
            this.$set(entries, newSrc, 'new_target');
            this.emitTranslations(entries);
        },
        /**
         * 删除转译规则
         */
        removeTranslation: function (sourceChan) {
            var entries = this.translationEntries;
            this.$delete(entries, sourceChan);
            this.emitTranslations(entries);
        },
        /**
         * 修改转译规则的源频道名（重命名 key）
         */
        onTranslationSourceChange: function (oldSource, newSource) {
            if (!newSource || oldSource === newSource) return;
            var entries = this.translationEntries;
            var target = entries[oldSource];
            if (target === undefined) return;
            this.$delete(entries, oldSource);
            this.$set(entries, newSource, target);
            this.emitTranslations(entries);
        },
        /**
         * 修改转译规则的目标频道值
         */
        onTranslationTargetChange: function (sourceChan, newTarget) {
            var entries = this.translationEntries;
            if (entries[sourceChan] !== undefined) {
                this.$set(entries, sourceChan, newTarget);
                this.emitTranslations(entries);
            }
        },
        /**
         * 触发 signal_translations 字段变更事件
         */
        emitTranslations: function (entries) {
            this.$emit('field-change', 'signal_translations', JSON.parse(JSON.stringify(entries)));
        },

        // ===== 属性覆写编辑 =====
        /**
         * 添加新的覆写字段
         */
        addOverwriteField: function () {
            var entries = this.overwriteEntries;
            var newField = 'new_field';
            var idx = 1;
            while (entries[newField] !== undefined) {
                newField = 'new_field_' + idx;
                idx++;
            }
            this.$set(entries, newField, '');
            this.emitOverwrite(entries);
        },
        /**
         * 删除覆写字段
         */
        removeOverwriteField: function (field) {
            var entries = this.overwriteEntries;
            this.$delete(entries, field);
            this.emitOverwrite(entries);
        },
        /**
         * 修改覆写字段名（重命名 key）
         */
        onOverwriteFieldChange: function (oldField, newField, currentVal) {
            if (!newField || oldField === newField) return;
            var entries = this.overwriteEntries;
            var val = entries[oldField];
            if (val === undefined) return;
            this.$delete(entries, oldField);
            this.$set(entries, newField, val);
            this.emitOverwrite(entries);
        },
        /**
         * 修改覆写字段的值
         */
        onOverwriteValueChange: function (field, value) {
            var entries = this.overwriteEntries;
            if (entries[field] !== undefined) {
                this.$set(entries, field, value);
                this.emitOverwrite(entries);
            }
        },
        /**
         * 触发 overwrite 字段变更事件
         */
        emitOverwrite: function (entries) {
            this.$emit('field-change', 'overwrite', JSON.parse(JSON.stringify(entries)));
        },
    },
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
