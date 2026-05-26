/**
 * 子系统实例属性面板子组件
 * 在子零件面板中点击子系统条目时（虚拟选择）显示
 *
 * 由 subsystem_types.js 的 dynamicFields 注册表驱动渲染，
 * 新增子系统类型只需在注册表中添加 dynamicFields 条目，
 * 无需修改本文件或模板。
 *
 * 支持编辑器类型：definition_selector, locator_selector, connector_selector,
 * enum_selector, power_target, power_outputs_map, signal_targets,
 * text_input, json_textarea。
 */
var ssTypes = require('../core/subsystem_types.js');
var nameUtils = require('../utils/name_utils.js');
var { createLogger } = require('../utils/logger.js');

var log = createLogger('SubsystemPanel');

Vue.component('mm-subsystem-panel', {
    template: typeof TEMPLATE_SUBSYSTEM_PANEL !== 'undefined' ? TEMPLATE_SUBSYSTEM_PANEL : '<p>子系统面板加载中...</p>',
    props: {
        config: { type: Object, required: true },
        subsystemKey: { type: String, default: '' },
        namespace: { type: String, default: 'machine_max' },
        parentSubPartKey: { type: String, default: '' },
        subsystemDefs: { type: Object, default: function () { return {}; } },
        allLocatorNames: { type: Array, default: function () { return []; } },
        ownedLocatorNames: { type: Array, default: function () { return []; } },
        connectorKeys: { type: Object, default: function () { return {}; } },
        signalTargetOptions: { type: Array, default: function () { return []; } },
        controlGroupPresets: { type: Object, default: function () { return {}; } },
    },
    data: function () {
        return {
            editingName: nameUtils.extractShortName(this.subsystemKey, this.namespace),
        };
    },
    watch: {
        subsystemKey: function (val) {
            var short = nameUtils.extractShortName(val, this.namespace);
            if (short !== this.editingName) {
                this.editingName = short;
            }
        },
    },
    computed: {
        namePrefix: function () {
            return 'subsystem.' + this.namespace + '.';
        },
        typeId: function () {
            return this.config.type || '';
        },
        typeMeta: function () {
            if (!this.typeId) return null;
            return ssTypes.getTypeMeta(this.typeId);
        },
        typeDisplayName: function () {
            var meta = this.typeMeta;
            return meta ? meta.displayName : '未知';
        },
        typeColor: function () {
            return ssTypes.getTypeColor(this.typeId);
        },
        typeShortLabel: function () {
            var meta = this.typeMeta;
            if (!meta) return '?';
            var parts = meta.id.split(':');
            return (parts.length > 1 ? parts[1] : parts[0]).substring(0, 6);
        },
        /** 按当前子系统类型筛选可用的型号定义 */
        filteredSubsystemDefs: function () {
            if (!this.typeId || !this.subsystemDefs) {
                log.debug('filteredSubsystemDefs: typeId=' + this.typeId + ', subsystemDefs=' + (this.subsystemDefs ? Object.keys(this.subsystemDefs).length : 'null'));
                return {};
            }
            var result = {};
            var totalDefs = 0;
            for (var defId in this.subsystemDefs) {
                if (this.subsystemDefs.hasOwnProperty(defId)) {
                    totalDefs++;
                    var def = this.subsystemDefs[defId];
                    if (def && def.type === this.typeId) {
                        result[defId] = def;
                    }
                }
            }
            log.info('filteredSubsystemDefs: typeId=' + this.typeId + ', 总定义=' + totalDefs + ', 匹配结果=' + Object.keys(result).length);
            return result;
        },
        filteredSubsystemDefsCount: function () {
            return Object.keys(this.filteredSubsystemDefs).length;
        },
        /** 所有可用的控制组预设（排除空字符串键） */
        availableControlGroupPresets: function () {
            var result = {};
            if (!this.controlGroupPresets) return result;
            for (var key in this.controlGroupPresets) {
                if (this.controlGroupPresets.hasOwnProperty(key) && key) {
                    result[key] = this.controlGroupPresets[key];
                }
            }
            return result;
        },
        /** 排除 definition 后的动态属性字段列表，用于面板循环渲染 */
        nonDefFields: function () {
            var meta = this.typeMeta;
            if (!meta || !meta.dynamicFields) return [];
            return meta.dynamicFields.filter(function (f) { return f.field !== 'definition'; });
        },
        /** 动态属性区块的标题，包含字段数量提示 */
        dynamicAttrsTitle: function () {
            var count = this.nonDefFields.length;
            return '动态属性 (' + count + ' 项)';
        },
        channelHints: function () {
            return [
                'move_input', 'regular_input', 'engine_control', 'wheel_control',
                'steering', 'throttle', 'brake', 'handbrake',
                'engine_speed', 'wheel_speed', 'vehicle_speed',
                'gear', 'clutch', 'parking_brake',
                'interact_left_front_door', 'interact_right_front_door',
                'interact_left_back_door', 'interact_right_back_door',
                'interact_hood', 'interact_trunk',
                'interact_left_front', 'interact_right_front',
                'interact_left_back', 'interact_right_back',
            ];
        },
    },
    methods: {
        onFieldChange: function (field, value) {
            this.$emit('field-change', this.subsystemKey, field, value);
        },
        onNameChange: function (value) {
            var oldKey = this.subsystemKey;
            var newKey = nameUtils.buildFullKey('subsystem', value, this.namespace);
            if (newKey !== oldKey) {
                this.$emit('name-change', oldKey, newKey);
            }
        },
        onNameBlur: function (event) {
            event.target.style.border = '1px solid transparent';
            event.target.style.background = 'transparent';
        },
        onDelete: function () {
            this.$emit('delete-subsystem', { spKey: this.parentSubPartKey, ssKey: this.subsystemKey });
        },
        navigateToSubPart: function () {
            this.$emit('navigate-to-sub-part', this.parentSubPartKey);
        },

        // ─── 信号频道编辑器（signal_targets） ─────────────────────────────
        getSignalEntries: function (sigField) {
            var val = this.config[sigField];
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                return val;
            }
            return {};
        },
        /**
         * 获取指定频道的过滤后目标列表：排除该频道中已选的目标，避免重复选择
         * 但保留当前项自身，防止 <select> 因无匹配 option 而显示空白
         * @param {string} sigField - 信号字段名（如 control_outputs）
         * @param {string} channel - 频道名
         * @param {string} [currentValue] - 当前项的值，此值不会被过滤
         * @returns {{value: string, label: string}[]} 过滤后的可用目标列表
         */
        getFilteredTargets: function (sigField, channel, currentValue) {
            var allTargets = this.signalTargetOptions;
            if (!allTargets || allTargets.length === 0) return [];
            var entries = this.getSignalEntries(sigField);
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
        addSignalChannel: function (sigField) {
            var entries = this.getSignalEntries(sigField);
            var newChan = 'new_channel';
            var idx = 1;
            while (entries[newChan]) {
                newChan = 'new_channel_' + idx;
                idx++;
            }
            entries[newChan] = [];
            this.$set(this.config, sigField, JSON.parse(JSON.stringify(entries)));
        },
        removeSignalChannel: function (sigField, channel) {
            var entries = this.getSignalEntries(sigField);
            this.$delete(entries, channel);
            this.$set(this.config, sigField, JSON.parse(JSON.stringify(entries)));
        },
        onSignalChannelChange: function (sigField, oldChannel, newChannel) {
            if (!newChannel || oldChannel === newChannel) return;
            var entries = this.getSignalEntries(sigField);
            var targets = entries[oldChannel];
            if (targets === undefined) return;
            this.$delete(entries, oldChannel);
            this.$set(entries, newChannel, targets);
            this.$set(this.config, sigField, JSON.parse(JSON.stringify(entries)));
        },
        addSignalTarget: function (sigField, channel) {
            var entries = this.getSignalEntries(sigField);
            if (!entries[channel]) {
                this.$set(entries, channel, []);
            }
            entries[channel].push('');
            this.$set(this.config, sigField, JSON.parse(JSON.stringify(entries)));
        },
        removeSignalTarget: function (sigField, channel, index) {
            var entries = this.getSignalEntries(sigField);
            if (entries[channel]) {
                entries[channel].splice(index, 1);
                this.$set(this.config, sigField, JSON.parse(JSON.stringify(entries)));
            }
        },
        updateSignalTarget: function (sigField, channel, index, value) {
            var entries = this.getSignalEntries(sigField);
            if (entries[channel]) {
                this.$set(entries[channel], index, value);
                this.$set(this.config, sigField, JSON.parse(JSON.stringify(entries)));
            }
        },

        // ─── 功率输出映射编辑器（power_outputs_map，Map<string, number>） ──
        /**
         * 获取指定 power_outputs_map 中当前条目可用的目标列表：排除其他条目已选的目标
         * @param {string} field - 字段名
         * @param {string} currentTarget - 当前条目的目标名
         * @returns {string[]} 过滤后的可用目标列表
         */
        getFilteredPowerOutputTargets: function (field, currentTarget) {
            var allTargets = this.signalTargetOptions;
            if (!allTargets || allTargets.length === 0) return [];
            var entries = this.getPowerOutputEntries(field);
            var usedTargets = [];
            for (var key in entries) {
                if (entries.hasOwnProperty(key) && key !== currentTarget) {
                    usedTargets.push(key);
                }
            }
            if (usedTargets.length === 0) return allTargets;
            var filtered = [];
            for (var i = 0; i < allTargets.length; i++) {
                var t = allTargets[i];
                if (usedTargets.indexOf(t.value) === -1) {
                    filtered.push(t);
                }
            }
            return filtered;
        },
        getPowerOutputEntries: function (field) {
            var val = this.config[field];
            if (val && typeof val === 'object') return val;
            return {};
        },
        addPowerOutput: function (field) {
            var entries = this.getPowerOutputEntries(field);
            var newName = 'new_target';
            var idx = 1;
            while (entries[newName] !== undefined) {
                newName = 'new_target_' + idx;
                idx++;
            }
            entries[newName] = 1.0;
            this.$set(this.config, field, JSON.parse(JSON.stringify(entries)));
        },
        removePowerOutput: function (field, targetName) {
            var entries = this.getPowerOutputEntries(field);
            this.$delete(entries, targetName);
            this.$set(this.config, field, JSON.parse(JSON.stringify(entries)));
        },
        onPowerOutputTargetChange: function (field, oldName, newName) {
            if (!newName || oldName === newName) return;
            var entries = this.getPowerOutputEntries(field);
            var ratio = entries[oldName];
            if (ratio === undefined) return;
            this.$delete(entries, oldName);
            this.$set(entries, newName, ratio);
            this.$set(this.config, field, JSON.parse(JSON.stringify(entries)));
        },
        onPowerOutputRatioChange: function (field, targetName, ratio) {
            var entries = this.getPowerOutputEntries(field);
            if (entries[targetName] !== undefined) {
                this.$set(entries, targetName, ratio);
                this.$set(this.config, field, JSON.parse(JSON.stringify(entries)));
            }
        },

        // ─── JSON 编辑框（json_textarea） ────────────────────────────────
        formatJsonValue: function (field) {
            var val = this.config[field];
            if (val === undefined || val === null) return '';
            if (typeof val === 'string') return val;
            try {
                return JSON.stringify(val, null, 2);
            } catch (_e) {
                return String(val);
            }
        },
        onJsonChange: function (field, text) {
            if (!text || text.trim() === '') {
                this.onFieldChange(field, {});
                return;
            }
            try {
                var parsed = JSON.parse(text);
                this.onFieldChange(field, parsed);
            } catch (_e) {
                // JSON 解析失败，暂不报错，允许用户继续编辑
            }
        },
    },
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
