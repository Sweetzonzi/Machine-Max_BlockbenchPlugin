/**
 * 子系统实例属性面板子组件
 * 在子零件面板中点击子系统条目时（虚拟选择）显示
 *
 * 根据子系统 type 动态渲染：
 * - 归属 + 类型 + 型号定义（按类型筛选）
 * - 可选引用字段（locator/connector，仅特定类型）
 * - 信号输出编辑器（来自 subsystem_types.js 的 signalOutputs）
 *
 * 静态属性（功率、扭矩等）在型号定义中编辑，
 * 本面板只负责动态属性（信号路由、可选引用）。
 */
var ssTypes = require('../core/subsystem_types.js');

Vue.component('mm-subsystem-panel', {
    template: typeof TEMPLATE_SUBSYSTEM_PANEL !== 'undefined' ? TEMPLATE_SUBSYSTEM_PANEL : '<p>子系统面板加载中...</p>',
    props: {
        config: { type: Object, required: true },
        subsystemKey: { type: String, default: '' },
        parentSubPartKey: { type: String, default: '' },
        subsystemDefs: { type: Object, default: function () { return {}; } },
        allLocatorNames: { type: Array, default: function () { return []; } },
        connectorKeys: { type: Object, default: function () { return {}; } },
        signalTargetOptions: { type: Array, default: function () { return []; } },
    },
    data: function () {
        return {
            editingName: this.subsystemKey || '',
        };
    },
    watch: {
        subsystemKey: function (val) {
            if (val !== this.editingName) {
                this.editingName = val;
            }
        },
    },
    computed: {
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
        /**
         * 按当前子系统类型筛选可用的型号定义
         * subsystemDefs 中的每个定义都有 type 字段，匹配则纳入
         */
        filteredSubsystemDefs: function () {
            if (!this.typeId || !this.subsystemDefs) return {};
            var result = {};
            for (var defId in this.subsystemDefs) {
                if (this.subsystemDefs.hasOwnProperty(defId)) {
                    var def = this.subsystemDefs[defId];
                    if (def && def.type === this.typeId) {
                        result[defId] = def;
                    }
                }
            }
            return result;
        },
        filteredSubsystemDefsCount: function () {
            return Object.keys(this.filteredSubsystemDefs).length;
        },
        channelHints: function () {
            return [
                'move_control', 'regular_control', 'engine_control', 'wheel_control',
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
            if (value !== this.subsystemKey) {
                this.$emit('name-change', this.subsystemKey, value);
            }
        },
        onNameBlur: function (event) {
            event.target.style.border = '1px solid transparent';
            event.target.style.background = 'transparent';
        },
        onDelete: function () {
            this.$emit('delete-subsystem', this.subsystemKey);
        },
        navigateToSubPart: function () {
            this.$emit('navigate-to-sub-part', this.parentSubPartKey);
        },

        getSignalLabel: function (sigField) {
            var labels = {
                power_output: '功率输出目标',
                power_outputs: '功率输出分配',
                speed_outputs: '转速信号输出',
                control_outputs: '控制信号输出',
                throttle_outputs: '油门信号输出',
                brake_outputs: '刹车信号输出',
                steering_outputs: '转向信号输出',
                handbrake_outputs: '手刹信号输出',
                gear_outputs: '挡位信号输出',
                move_outputs: '移动信号输出',
                regular_outputs: '常规信号输出',
                aim_outputs: '瞄准信号输出',
                passenger_num_outputs: '乘客数信号输出',
                fire_outputs: '开火信号输出',
            };
            return labels[sigField] || sigField;
        },
        isSingleTargetSignal: function (sigField) {
            return sigField === 'power_output';
        },
        getSignalValue: function (sigField) {
            return this.config[sigField] || '';
        },
        getSignalEntries: function (sigField) {
            var val = this.config[sigField];
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                return val;
            }
            return {};
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
    },
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}