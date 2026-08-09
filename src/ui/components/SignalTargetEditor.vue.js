/**
 * SignalTargetEditor.vue.js — 信号目标编辑器组件（共享）
 *
 * 收敛 SubsystemPanel / ConnectorPanel / InteractBoxPanel 三处重复的
 * signal_targets 编辑实现：频道增删改、目标增删改、过滤去重逻辑。
 *
 * 使用方式:
 *   <mm-signal-target-editor
 *       :entries="signalTargetEntries"
 *       :target-options="targetOptions"
 *       :channel-hints="channelHints"
 *       @change="onSignalTargetsChange" />
 *
 * 说明:
 *   - entries 为 { channel: [target, ...] } 映射（父组件持有）
 *   - 组件内部操作基于副本，通过 $emit('change', deepCopy) 通知父组件落库，
 *     不直接修改 props（遵循 Vue 2 响应式约定）
 *   - 频道名输入框带 datalist 提示（channelHints），目标下拉排除已选目标
 */

Vue.component('mm-signal-target-editor', {
    template:
        '<div class="mm-signal-editor">' +
            '<div v-for="(targets, channel, ci) in entries" :key="ci" class="mm-signal-card">' +
                '<div class="mm-signal-header">' +
                    '<input type="text" class="mm-input" style="flex:1;font-size:11px" :value="channel" ' +
                        '@change="onChannelChange(channel, $event.target.value)" :list="hintsId" placeholder="频道名" />' +
                    '<button class="mm-btn mm-btn-sm mm-btn-danger-light" @click="removeChannel(channel)" title="删除频道">×</button>' +
                '</div>' +
                '<div v-for="(t, ti) in targets" :key="ti" style="display:flex;gap:4px;align-items:center;margin-left:16px;margin-top:2px">' +
                    '<select class="mm-select" style="flex:1;font-size:11px;min-width:120px" :value="t" ' +
                        '@change="updateTarget(channel, ti, $event.target.value)">' +
                        '<option value="">（选择目标）</option>' +
                        '<option v-for="opt in getFilteredTargets(channel, t)" :key="opt.value" :value="opt.value">{{ opt.label }}</option>' +
                    '</select>' +
                    '<button class="mm-btn mm-btn-sm mm-btn-danger-light" @click="removeTarget(channel, ti)" title="删除目标">×</button>' +
                '</div>' +
                '<button class="mm-btn" style="margin-left:16px;margin-top:2px;font-size:11px" @click="addTarget(channel)">+ 添加目标</button>' +
            '</div>' +
            '<button class="mm-btn" style="font-size:11px" @click="addChannel">+ 添加频道</button>' +
            '<datalist :id="hintsId">' +
                '<option v-for="h in channelHints" :key="h" :value="h" />' +
            '</datalist>' +
        '</div>',
    props: {
        /** 信号目标条目映射 { channel: [target, ...] } */
        entries: { type: Object, default: function () { return {}; } },
        /** 可选目标列表 [{ value, label }] */
        targetOptions: { type: Array, default: function () { return []; } },
        /** 频道名补全提示列表 */
        channelHints: { type: Array, default: function () { return []; } },
    },
    computed: {
        /** datalist 唯一 id（基于组件实例 _uid） */
        hintsId: function () {
            return 'mm-ste-hints-' + this._uid;
        },
    },
    methods: {
        /** 深拷贝当前条目（组件内所有操作基于副本，避免污染 props） */
        _cloneEntries: function () {
            return JSON.parse(JSON.stringify(this.entries || {}));
        },
        /** 提交变更：深拷贝后 emit */
        _emit: function (entries) {
            this.$emit('change', JSON.parse(JSON.stringify(entries)));
        },
        /**
         * 获取指定频道的过滤后目标列表：排除该频道中已选的目标，避免重复选择，
         * 但保留当前项自身，防止 <select> 因无匹配 option 而显示空白
         * @param {string} channel - 频道名
         * @param {string} [currentValue] - 当前项的值，此值不会被过滤
         * @returns {{value: string, label: string}[]} 过滤后的可用目标列表
         */
        getFilteredTargets: function (channel, currentValue) {
            var allTargets = this.targetOptions;
            if (!allTargets || allTargets.length === 0) return [];
            var entries = this.entries || {};
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
        /** 添加新的信号频道（默认名 new_channel / new_channel_N） */
        addChannel: function () {
            var entries = this._cloneEntries();
            var newChan = 'new_channel';
            var idx = 1;
            while (entries[newChan]) {
                newChan = 'new_channel_' + idx;
                idx++;
            }
            entries[newChan] = [];
            this._emit(entries);
        },
        /** 删除信号频道 */
        removeChannel: function (channel) {
            var entries = this._cloneEntries();
            delete entries[channel];
            this._emit(entries);
        },
        /** 重命名信号频道 */
        onChannelChange: function (oldChannel, newChannel) {
            if (!newChannel || oldChannel === newChannel) return;
            var entries = this._cloneEntries();
            var targets = entries[oldChannel];
            if (targets === undefined) return;
            // 冲突检测：目标频道名已存在（且非自身）时拒绝重命名，
            // 防止静默覆盖已有频道的目标数组（数据丢失）
            if (entries.hasOwnProperty(newChannel)) {
                return;
            }
            delete entries[oldChannel];
            entries[newChannel] = targets;
            this._emit(entries);
        },
        /** 为指定频道添加信号目标项 */
        addTarget: function (channel) {
            var entries = this._cloneEntries();
            if (!entries[channel]) {
                entries[channel] = [];
            }
            entries[channel].push('');
            this._emit(entries);
        },
        /** 删除信号频道的指定目标项 */
        removeTarget: function (channel, index) {
            var entries = this._cloneEntries();
            if (entries[channel]) {
                entries[channel].splice(index, 1);
                this._emit(entries);
            }
        },
        /** 更新信号频道的指定目标值 */
        updateTarget: function (channel, index, value) {
            var entries = this._cloneEntries();
            if (entries[channel]) {
                entries[channel][index] = value;
                this._emit(entries);
            }
        },
    },
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
