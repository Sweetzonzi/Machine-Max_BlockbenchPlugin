/**
 * 子系统实例属性面板子组件
 * 在子零件面板中点击子系统条目时（虚拟选择）显示
 *
 * 由 subsystem_types.js 的 dynamicFields 注册表驱动渲染，
 * 新增子系统类型只需在注册表中添加 dynamicFields 条目，
 * 无需修改本文件或模板。
 *
 * 支持编辑器类型：definition_selector, locator_selector, locator_list, connector_selector,
 * enum_selector, power_target, power_outputs_map, signal_targets,
 * text_input, json_textarea, control_group_selector,
 * channel_list, belt_definition_editor.
 */
var ssTypes = require('../core/subsystem_types.js');
var nameUtils = require('../utils/name_utils.js');
var { SIGNAL_CHANNEL_HINTS, AMMO_SERVICE_CHANNEL_HINTS } = require('../core/constants.js');
var { createLogger } = require('../utils/logger.js');
var fieldIssues = require('./components/field_issues.js');

var log = createLogger('SubsystemPanel');

/**
 * 组件选项。methods 定义完后先包撤销（wrapMethodMap），再注册到 Vue：
 * Vue.extend 会复制方法表，注册之后再包不会生效。
 */
var MM_SUBSYSTEM_PANEL_OPTIONS = {
    template: typeof TEMPLATE_SUBSYSTEM_PANEL !== 'undefined' ? TEMPLATE_SUBSYSTEM_PANEL : '<p>子系统面板加载中...</p>',
    mixins: [fieldIssues.mixin],
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
        projectileTypes: { type: Object, default: function () { return {}; } },
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
            if (meta) return meta.displayName;
            var retired = ssTypes.getRetiredTypeInfo(this.typeId);
            return retired ? retired.displayName : '未知';
        },
        /** 类型不在注册表里（已退役或未知）：面板显示说明而不是字段表 */
        typeMissing: function () {
            return !!this.typeId && !this.typeMeta;
        },
        /** 已退役类型的说明，未知类型返回 null */
        retiredTypeInfo: function () {
            if (this.typeMeta) return null;
            return ssTypes.getRetiredTypeInfo(this.typeId);
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
        /** 常用频道名补全列表（统一来自 constants.js 唯一真源） */
        channelHints: function () {
            return SIGNAL_CHANNEL_HINTS;
        },
        /** 供弹服务频道补全列表（弹药架 / 自动装弹机共用） */
        ammoChannelHints: function () {
            return AMMO_SERVICE_CHANNEL_HINTS;
        },
        /** 可用投射物 ID 列表，供配弹下拉与新增配弹的初值使用 */
        projectileIds: function () {
            var all = this.projectileTypes;
            if (!all || typeof all !== 'object') return [];
            return Object.keys(all);
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

        // ─── 下车定位器列表编辑器（locator_list，string[]） ─────────────────
        /**
         * 读取指定字段的定位器列表（容错：非数组一律视为空列表）
         * @param {string} field - 字段名（如 dismount_locators）
         * @returns {string[]}
         */
        getLocatorListEntries: function (field) {
            var val = this.config[field];
            return Array.isArray(val) ? val : [];
        },
        /**
         * 追加一项：取第一个尚未被本列表使用的候选定位器作为初值。
         * 新项直接带名称而非空串——空名在下车流程里是非法声明，会在加载期抛异常。
         * 候选定位器已被本列表用尽时不新增条目。
         * @param {string} field - 字段名
         */
        addLocatorListEntry: function (field) {
            var next = this.getLocatorListEntries(field).slice();
            var used = {};
            var i;
            for (i = 0; i < next.length; i++) used[next[i]] = true;
            for (i = 0; i < this.ownedLocatorNames.length; i++) {
                var candidate = this.ownedLocatorNames[i];
                if (!used[candidate]) {
                    next.push(candidate);
                    this.onFieldChange(field, next);
                    return;
                }
            }
            log.debug('[addLocatorListEntry] 没有可用的候选定位器，未新增条目，field=' + field);
        },
        /**
         * 删除列表中的第 index 项
         * @param {string} field - 字段名
         * @param {number} index - 行下标
         */
        removeLocatorListEntry: function (field, index) {
            var next = this.getLocatorListEntries(field).slice();
            next.splice(index, 1);
            this.onFieldChange(field, next);
        },
        /**
         * 改写列表中的第 index 项；改成空名视为删除该行
         * @param {string} field - 字段名
         * @param {number} index - 行下标
         * @param {string} value - 新的定位器名
         */
        onLocatorListChange: function (field, index, value) {
            var next = this.getLocatorListEntries(field).slice();
            if (!value) next.splice(index, 1);
            else next[index] = value;
            this.onFieldChange(field, next);
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
         * 信号目标变更回调：由 mm-signal-target-editor 组件 emit，
         * 深拷贝后写入对应字段（保持 Vue 2 响应式）
         * @param {string} sigField - 信号字段名（如 control_outputs）
         * @param {Object} entries - 变更后的 { channel: [target, ...] } 映射
         */
        onSignalTargetsChange: function (sigField, entries) {
            this.onFieldChange(sigField, JSON.parse(JSON.stringify(entries)));
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
            var entries = Object.assign({}, this.getPowerOutputEntries(field));
            var newName = 'new_target';
            var idx = 1;
            while (entries[newName] !== undefined) {
                newName = 'new_target_' + idx;
                idx++;
            }
            entries[newName] = 1.0;
            this.onFieldChange(field, entries);
        },
        removePowerOutput: function (field, targetName) {
            var entries = Object.assign({}, this.getPowerOutputEntries(field));
            delete entries[targetName];
            this.onFieldChange(field, entries);
        },
        onPowerOutputTargetChange: function (field, oldName, newName) {
            if (!newName || oldName === newName) return;
            var entries = Object.assign({}, this.getPowerOutputEntries(field));
            var ratio = entries[oldName];
            if (ratio === undefined) return;
            delete entries[oldName];
            entries[newName] = ratio;
            this.onFieldChange(field, entries);
        },
        onPowerOutputRatioChange: function (field, targetName, ratio) {
            var entries = Object.assign({}, this.getPowerOutputEntries(field));
            if (entries[targetName] === undefined) return;
            entries[targetName] = ratio;
            this.onFieldChange(field, entries);
        },

        // ─── 服务频道列表编辑器（channel_list，string[]） ─────────────────

        /**
         * 读取供弹服务频道列表（容错：非数组一律视为空列表）
         * @param {string} field - 字段名（如 ammo_discovery_inputs）
         * @returns {string[]}
         */
        getChannelListEntries: function (field) {
            var val = this.config[field];
            return Array.isArray(val) ? val : [];
        },
        /** 追加一条空频道；改成空串即删除该行 */
        addChannelListEntry: function (field) {
            var next = this.getChannelListEntries(field).slice();
            next.push('');
            this.onFieldChange(field, next);
        },
        removeChannelListEntry: function (field, index) {
            var next = this.getChannelListEntries(field).slice();
            next.splice(index, 1);
            this.onFieldChange(field, next);
        },
        onChannelListChange: function (field, index, value) {
            var next = this.getChannelListEntries(field).slice();
            if (!value) next.splice(index, 1);
            else next[index] = value;
            this.onFieldChange(field, next);
        },

        // ─── 频道数值映射编辑器（channel_number_map，Map<string, number>） ──

        /** 读取"频道 → 系数"映射（容错：非对象一律视为空） */
        getChannelNumberEntries: function (field) {
            var val = this.config[field];
            return (val && typeof val === 'object' && !Array.isArray(val)) ? val : {};
        },
        /** 追加一条默认倍率的频道；键重名时自动加后缀 */
        addChannelNumberEntry: function (field) {
            var entries = Object.assign({}, this.getChannelNumberEntries(field));
            var name = 'crew.reload.loader';
            var idx = 1;
            while (entries[name] !== undefined) {
                name = 'crew.reload.loader_' + idx;
                idx++;
            }
            entries[name] = 1.0;
            this.onFieldChange(field, entries);
        },
        removeChannelNumberEntry: function (field, channel) {
            var entries = Object.assign({}, this.getChannelNumberEntries(field));
            delete entries[channel];
            this.onFieldChange(field, entries);
        },
        /** 改键名：保留原倍率；与既有键重名时放弃这次改名 */
        onChannelNumberChannelChange: function (field, oldName, newName) {
            var entries = Object.assign({}, this.getChannelNumberEntries(field));
            if (!newName || oldName === newName || entries[oldName] === undefined) return;
            if (entries[newName] !== undefined) return;
            var value = entries[oldName];
            delete entries[oldName];
            entries[newName] = value;
            this.onFieldChange(field, entries);
        },
        /** 改倍率：上游只接受有限正数，非法输入直接丢弃 */
        onChannelNumberValueChange: function (field, channel, value) {
            var entries = Object.assign({}, this.getChannelNumberEntries(field));
            if (entries[channel] === undefined) return;
            if (!isFinite(value) || value <= 0) return;
            entries[channel] = value;
            this.onFieldChange(field, entries);
        },

        // ─── 交付规格编辑器（belt_definition_editor） ─────────────────────
        //
        // 规格是逐实例的弹链模板：pattern 有序（取弹位置按书写顺序展开）、length 是一份
        // 的发数、recharge 可选。container_id 与 recharge 的空值用 null 表达省略
        // （对应 Java 侧 Optional），写回时统一经过 setBelt。

        /**
         * 读取交付规格并补齐可编辑所需的默认形状
         * @param {string} field - 字段名（belt_definition）
         * @returns {Object} { label?, container_id?, pattern: Array, length: number, recharge?: Object }
         */
        getBeltDefinition: function (field) {
            var val = this.config[field];
            var belt = (val && typeof val === 'object' && !Array.isArray(val)) ? val : {};
            var out = Object.assign({}, belt);
            out.pattern = Array.isArray(belt.pattern) ? belt.pattern : [];
            out.length = (typeof belt.length === 'number') ? belt.length : 1;
            out.recharge = (belt.recharge && typeof belt.recharge === 'object') ? belt.recharge : null;
            out.container_id = (typeof belt.container_id === 'string' && belt.container_id) ? belt.container_id : null;
            return out;
        },
        /**
         * 写入交付规格：在现有值上打补丁，整对象交给 ops.setField
         * @param {string} field - 字段名
         * @param {Object} patch - 要覆盖的键
         */
        setBeltDefinition: function (field, patch) {
            var next = Object.assign(this.getBeltDefinition(field), patch);
            this.onFieldChange(field, next);
        },
        onBeltTextChange: function (field, key, value) {
            var patch = {};
            patch[key] = (key === 'container_id' && !value) ? null : value;
            this.setBeltDefinition(field, patch);
        },
        onBeltLengthChange: function (field, value) {
            this.setBeltDefinition(field, { length: Math.max(1, Math.floor(value) || 1) });
        },
        onBeltPatternAmmoChange: function (field, index, ammo) {
            var pattern = this.getBeltDefinition(field).pattern.slice();
            if (!pattern[index]) return;
            pattern[index] = Object.assign({}, pattern[index], { ammo: ammo });
            this.setBeltDefinition(field, { pattern: pattern });
        },
        onBeltPatternCountChange: function (field, index, count) {
            var pattern = this.getBeltDefinition(field).pattern.slice();
            if (!pattern[index]) return;
            pattern[index] = Object.assign({}, pattern[index], {
                count: Math.max(1, Math.floor(count) || 1),
            });
            this.setBeltDefinition(field, { pattern: pattern });
        },
        /**
         * 追加一条配弹：初值取第一个尚未被本规格使用的投射物（都用过则取第一个），
         * 因此新增的行永远带着合法弹种，不必在导出前清理空行。
         */
        addBeltPatternEntry: function (field) {
            var ids = this.projectileIds;
            if (ids.length === 0) return;
            var pattern = this.getBeltDefinition(field).pattern.slice();
            var used = {};
            var i;
            for (i = 0; i < pattern.length; i++) {
                if (pattern[i] && pattern[i].ammo) used[pattern[i].ammo] = true;
            }
            var pick = ids[0];
            for (i = 0; i < ids.length; i++) {
                if (!used[ids[i]]) {
                    pick = ids[i];
                    break;
                }
            }
            pattern.push({ ammo: pick, count: 1 });
            this.setBeltDefinition(field, { pattern: pattern });
        },
        removeBeltPatternEntry: function (field, index) {
            var pattern = this.getBeltDefinition(field).pattern.slice();
            pattern.splice(index, 1);
            this.setBeltDefinition(field, { pattern: pattern });
        },
        /** 启用/停用自身回充：启用时给一份默认值，停用时写回 null（省略） */
        switchBeltRecharge: function (field, enabled) {
            this.setBeltDefinition(field, {
                recharge: enabled
                    ? { regen_per_minute: 0, regen_delay: 0, energy_cost_per_round: 0 }
                    : null,
            });
        },
        onBeltRechargeChange: function (field, key, value) {
            var recharge = Object.assign({
                regen_per_minute: 0,
                regen_delay: 0,
                energy_cost_per_round: 0,
            }, this.getBeltDefinition(field).recharge);
            recharge[key] = Math.max(0, value) || 0;
            this.setBeltDefinition(field, { recharge: recharge });
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
};

// 所有写配置的入口都通过 field-change 上抛给 App → ops.setField，
// 本组件不再直接改 this.config，因此不需要 wrapMethodMap。

Vue.component('mm-subsystem-panel', MM_SUBSYSTEM_PANEL_OPTIONS);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
