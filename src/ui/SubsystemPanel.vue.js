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
 * text_input, json_textarea, control_group_selector, projectile_belt_editor.
 */
var ssTypes = require('../core/subsystem_types.js');
var nameUtils = require('../utils/name_utils.js');
var { SIGNAL_CHANNEL_HINTS } = require('../core/constants.js');
var { createLogger } = require('../utils/logger.js');
var fieldIssues = require('./components/field_issues.js');

var log = createLogger('SubsystemPanel');

/** 弹链编辑器占位键前缀（模块常量，非 methods 属性） */
var PLACEHOLDER_PREFIX = '__new_p_';
/** 弹链编辑器 do-while 最大迭代次数，防止无限循环卡死 */
var MAX_PLACEHOLDER_ITERATIONS = 1000;

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
            /** 弹链占位键自增计数器（注意：不能以 _ 开头，Vue 2 会剥离） */
            projectilePlaceholderCounter: 0,
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
        /** 常用频道名补全列表（统一来自 constants.js 唯一真源） */
        channelHints: function () {
            return SIGNAL_CHANNEL_HINTS;
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

        // ─── 弹链编辑器（projectile_belt_editor，Map<projectileId, count>） ─

        /**
         * 获取弹链条目（用于 v-for 显示和修改操作）：对象 { projectileId: count }
         * 键按插入序排列，onProjectileIdChange 通过原地重建保证位置不变（所见即所得）。
         */
        getProjectileEntries: function (field) {
            var val = this.config[field];
            if (val && typeof val === 'object' && !Array.isArray(val)) return val;
            return {};
        },
        /**
         * 获取所有投射物选项，已用于其他行的选项会被标记 disabled（当前行除外）。
         * 占位键（__new_p_*）不计入"已使用"，不阻塞真实弹种的选择。
         * @param {string} field - 字段名
         * @param {string} currentId - 当前行 projectileId
         * @returns {{value: string, label: string, disabled: boolean}[]}
         */
        getProjectileOptions: function (field, currentId) {
            var all = this.projectileTypes;
            var result = [];
            if (!all || typeof all !== 'object') return result;
            var entries = this.getProjectileEntries(field);
            // 过滤掉占位键（__new_p_*），占位条目不应阻塞真实弹种的选择
            var usedIds = Object.keys(entries).filter(function (k) {
                return k.indexOf(PLACEHOLDER_PREFIX) !== 0;
            });
            for (var id in all) {
                if (!all.hasOwnProperty(id)) continue;
                var isUsed = usedIds.indexOf(id) !== -1;
                var isCurrent = id === currentId;
                result.push({
                    value: id,
                    label: id,
                    disabled: isUsed && !isCurrent,
                });
            }
            return result;
        },
        /**
         * 添加一个空弹链占位条目。使用自增占位键 __new_p_N 确保可无限添加，
         * 与 power_outputs_map 的 new_target_N 模式一致。
         * 含 do-while 迭代上限（MAX_PLACEHOLDER_ITERATIONS）防止无限循环卡死。
         */
        addProjectileEntry: function (field) {
            log.debug('[addProjectileEntry] 开始，field=' + field);
            var entries = this.getProjectileEntries(field);
            var counter = this.projectilePlaceholderCounter;
            log.debug('[addProjectileEntry] 当前占位计数器=' + counter + ', 已有条目=' + Object.keys(entries).join(','));

            var newKey;
            var watchdog = 0;
            do {
                newKey = PLACEHOLDER_PREFIX + (counter++);
                watchdog++;
                if (watchdog > MAX_PLACEHOLDER_ITERATIONS) {
                    log.error('[addProjectileEntry] 超出最大迭代次数！counter=' + counter + ', newKey=' + newKey + ', entries=' + JSON.stringify(Object.keys(entries)));
                    return;
                }
            } while (entries.hasOwnProperty(newKey));

            log.debug('[addProjectileEntry] 生成新占位键=' + newKey + ', counter=' + counter + ', 迭代次数=' + watchdog);
            this.projectilePlaceholderCounter = counter;
            var next = Object.assign({}, entries);
            next[newKey] = 1;
            this.onFieldChange(field, next);
            log.debug('[addProjectileEntry] 完成');
        },
        removeProjectileEntry: function (field, projectileId) {
            log.debug('[removeProjectileEntry] field=' + field + ', id=' + projectileId);
            var entries = Object.assign({}, this.getProjectileEntries(field));
            delete entries[projectileId];
            this.onFieldChange(field, entries);
        },
        /**
         * 弹链条目切换投射物。
         * 通过按原始键序重建对象实现"原位替换"——选择第 N 个条目，新弹种仍然在第 N 位，
         * 而非被排到对象末尾（所见即所得）。
         * - 占位键 → 真实ID：原位替换
         * - 真实ID → ""（取消选择）：原位替换为占位键
         * - 真实ID → 另一真实ID：若目标ID已存在则合并数量（保留已存在条目的位置），否则原位替换
         * - 占位键 → ""：无操作
         */
        onProjectileIdChange: function (field, oldId, newId) {
            log.debug('[onProjectileIdChange] field=' + field + ', oldId=' + oldId + ', newId=' + newId);
            if (oldId === newId) return;
            var entries = this.getProjectileEntries(field);
            var count = entries[oldId];
            if (count === undefined) return;

            if (!newId) {
                // 取消选择：原位替换为占位键
                if (oldId.indexOf(PLACEHOLDER_PREFIX) === 0) return;
                newId = PLACEHOLDER_PREFIX + (this.projectilePlaceholderCounter++);
                log.debug('[onProjectileIdChange] 取消选择，原位替换为占位键=' + newId);
            } else if (entries.hasOwnProperty(newId)) {
                // 合并到已存在的同ID条目（保留已存在条目的位置）
                log.debug('[onProjectileIdChange] 合并数量：' + entries[newId] + ' + ' + count);
                var merged = Object.assign({}, entries);
                merged[newId] = entries[newId] + count;
                delete merged[oldId];
                this.onFieldChange(field, merged);
                return;
            }

            // 按原始键序重建对象，oldId 的位置替换为 newId
            var rebuilt = {};
            var allKeys = Object.keys(entries);
            for (var i = 0; i < allKeys.length; i++) {
                var k = allKeys[i];
                if (k === oldId) {
                    rebuilt[newId] = count;
                } else {
                    rebuilt[k] = entries[k];
                }
            }
            this.onFieldChange(field, rebuilt);
        },
        onProjectileCountChange: function (field, projectileId, count) {
            var entries = Object.assign({}, this.getProjectileEntries(field));
            if (entries[projectileId] === undefined) return;
            entries[projectileId] = count;
            this.onFieldChange(field, entries);
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
