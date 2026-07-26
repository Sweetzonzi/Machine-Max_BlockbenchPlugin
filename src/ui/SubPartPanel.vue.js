/**
 * 子零件属性面板子组件
 * 选中标记为 sub_part 的 Group 时在属性面板中显示
 *
 * 名称（字典 key）与骨骼（start_bone 字段）分离：
 * - 名称即翻译键格式的 key（如 sub_part.machine_max.main）
 * - 骨骼为独立的绑定字段
 */
var nameUtils = require('../utils/name_utils.js');
var { createLogger } = require('../utils/logger.js');
var log = createLogger('SubPartPanel');

Vue.component('mm-sub-part-panel', {
    template: typeof TEMPLATE_SUB_PART_PANEL !== 'undefined' ? TEMPLATE_SUB_PART_PANEL : '<p>子零件面板加载中...</p>',
    props: {
        config: { type: Object, required: true },
        elementName: { type: String, default: '' },
        spName: { type: String, default: '' },
        namespace: { type: String, default: 'machine_max' },
        badgeColor: { type: String, default: '#4A90D9' },
        badgeLabel: { type: String, default: '子零件' },
        hitBoxes: { type: Object, default: function() { return {}; } },
        interactBoxes: { type: Object, default: function() { return {}; } },
        allBoneNames: { type: Array, default: function() { return []; } },
        allLocatorNames: { type: Array, default: function() { return []; } },
        refreshKey: { type: Number, default: 0 },
    },
    data: function () {
        return {
            newEndBone: '',
            editingName: nameUtils.extractShortName(this.spName, this.namespace),
            editingStartBone: this.config.start_bone,
            editingMassCenter: this.config.mass_center,
        };
    },
    watch: {
        spName: function (val) {
            var short = nameUtils.extractShortName(val, this.namespace);
            if (short !== this.editingName) {
                this.editingName = short;
            }
        },
        'config.start_bone': function (val) {
            if (val !== this.editingStartBone) {
                this.editingStartBone = val;
            }
        },
        'config.mass_center': function (val) {
            if (val !== this.editingMassCenter) {
                this.editingMassCenter = val;
            }
        },
    },
    computed: {
        namePrefix: function () {
            return 'sub_part.' + this.namespace + '.';
        },
        boneListId: function () {
            return 'mm-bone-list-' + this._uid;
        },
        locatorListId: function () {
            return 'mm-locator-list-' + this._uid;
        },
        autoEndBones: function () {
            return this.config.auto_end_bones || [];
        },
        hitBoxCount: function () {
            // 读取 refreshKey 作为版本号：外部因非响应式操作（delete）改变 hitBoxes 时强制重算
            void this.refreshKey;
            return this.hitBoxes ? Object.keys(this.hitBoxes).length : 0;
        },
        interactBoxCount: function () {
            void this.refreshKey;
            return this.interactBoxes ? Object.keys(this.interactBoxes).length : 0;
        },
        connectorCount: function () {
            // 读取 refreshKey 作为版本号：外部因非响应式操作（delete）改变 connectors 时强制重算
            void this.refreshKey;
            return this.config.connectors ? Object.keys(this.config.connectors).length : 0;
        },
        subsystemCount: function () {
            // 读取 refreshKey 作为版本号：外部因非响应式操作（delete）改变 subsystems 时强制重算
            void this.refreshKey;
            return this.config.subsystems ? Object.keys(this.config.subsystems).length : 0;
        },
        subsystemKeys: function () {
            // 读取 refreshKey 作为版本号：外部因非响应式操作改变 subsystems 时强制重算
            void this.refreshKey;
            return this.config.subsystems ? Object.keys(this.config.subsystems) : [];
        },
    },
    methods: {
        onFieldChange: function (field, value) {
            this.$emit('field-change', field, value);
        },
        onNameChange: function (value) {
            var oldKey = this.spName;
            var newKey = nameUtils.buildFullKey('sub_part', value, this.namespace);
            if (newKey !== oldKey) {
                this.$emit('name-change', oldKey, newKey);
            }
        },
        onNameBlur: function (event) {
            // 失去焦点时恢复透明样式
            event.target.style.border = '1px solid transparent';
            event.target.style.background = 'transparent';
        },
        onStartBoneInput: function (value) {
            this.$emit('field-change', 'start_bone', value);
        },
        onAddEndBone: function () {
            if (this.newEndBone && this.newEndBone.trim()) {
                this.$emit('add-end-bone', this.newEndBone.trim());
                this.newEndBone = '';
            }
        },
        resolveHitBoxName: function (hbKey) {
            var el = Group.all.find(function (g) { return g.name === hbKey || g.uuid === hbKey; });
            return el ? el.name : hbKey;
        },
        resolveHitBoxTypeLabel: function (type) {
            var map = { box: '方体', sphere: '球体', cylinder: '圆柱', capsule: '胶囊', wheel: '轮胎' };
            return map[type] || type;
        },
        resolveInteractModeLabel: function (mode) {
            var map = { fast: '快速', accurate: '精确' };
            return map[mode] || mode || '快速';
        },
        resolveInteractBoxName: function (ibKey) {
            return nameUtils.extractShortName(ibKey);
        },
        resolveConnectorName: function (connKey) {
            return nameUtils.extractShortName(connKey);
        },
        /**
         * 解析子系统类型的中文显示名
         */
        resolveSubsystemTypeName: function (ssKey) {
            var ss = this.config.subsystems && this.config.subsystems[ssKey];
            if (!ss || !ss.type) return '未指定类型';
            var ssTypes = require('../core/subsystem_types.js');
            var meta = ssTypes.getTypeMeta(ss.type);
            return meta ? meta.displayName : ss.type;
        },
        resolveSubsystemShortName: function (ssKey) {
            return nameUtils.extractShortName(ssKey);
        },
        resolveSubsystemDefinition: function (ssKey) {
            var ss = this.config.subsystems && this.config.subsystems[ssKey];
            return ss ? (ss.definition || '') : '';
        },
        /**
         * 获取子系统类型的颜色
         */
        resolveSubsystemTypeColor: function (ssKey) {
            var ss = this.config.subsystems && this.config.subsystems[ssKey];
            if (!ss || !ss.type) return '#888';
            var ssTypes = require('../core/subsystem_types.js');
            return ssTypes.getTypeColor(ss.type);
        },
        /**
         * 导航到子系统：点击子系统条目时切换到子系统属性面板（虚拟选择）
         */
        navigateToSubsystem: function (ssKey) {
            this.$emit('navigate-to-subsystem', ssKey);
        },
        /**
         * 添加子系统：弹出类型选择对话框
         */
        addSubsystem: function () {
            this.$emit('add-subsystem');
        },
        /**
         * 删除子系统：确认后删除
         */
        deleteSubsystem: function (ssKey) {
            this.$emit('delete-subsystem', { spKey: this.spName, ssKey: ssKey });
        },
        /**
         * 导航到碰撞箱：点击碰撞箱条目时选中对应的 Group 骨骼，切换到碰撞箱属性面板。
         * 若对应的骨骼已不存在（幽灵条目），则发出清理事件。
         */
        navigateToHitBox: function (hbKey) {
            // 预检：通过 UUID 查找 Group，不存在则为幽灵条目
            var el = Group.all.find(function (g) { return g.uuid === hbKey; });
            if (!el) {
                // 也尝试按名称查找（兼容旧格式）
                el = Group.all.find(function (g) { return g.name === hbKey; });
            }
            if (!el) {
                log.warn('navigateToHitBox: 碰撞箱元素不存在（幽灵条目），触发清理', {
                    spKey: this.spName, hbKey: hbKey,
                });
                this.$emit('clean-ghost-entry', { type: 'hit_box', spKey: this.spName, key: hbKey });
                return;
            }
            this.$emit('navigate-to-hit-box', hbKey);
        },
        /**
         * 导航到交互区：点击交互区条目时选中对应的 Group 骨骼，切换到交互区属性面板。
         * 若对应的骨骼已不存在（幽灵条目），则发出清理事件。
         */
        navigateToInteractBox: function (ibKey) {
            var ib = this.interactBoxes && this.interactBoxes[ibKey];
            var boneName = ib ? ib.bone : '';
            if (boneName) {
                // 预检：通过骨骼名查找 Group
                var el = Group.all.find(function (g) { return g.name === boneName; });
                if (!el) {
                    log.warn('navigateToInteractBox: 交互区骨骼不存在（幽灵条目），触发清理', {
                        spKey: this.spName, ibKey: ibKey, boneName: boneName,
                    });
                    this.$emit('clean-ghost-entry', { type: 'interact_box', spKey: this.spName, key: ibKey });
                    return;
                }
                this.$emit('navigate-to-hit-box', boneName);
            }
        },
        /**
         * 导航到连接点：点击连接点条目时选中对应的 Locator，切换到连接点属性面板。
         * 若对应的定位器已不存在（幽灵条目），则发出清理事件。
         */
        navigateToConnector: function (connKey) {
            var conn = this.config && this.config.connectors && this.config.connectors[connKey];
            var locatorName = conn ? conn.locator : '';
            if (locatorName) {
                // 预检：通过 locator 名称查找 Locator
                var loc = typeof Locator !== 'undefined' ? Locator.all.find(function (l) { return l.name === locatorName; }) : null;
                if (!loc) {
                    log.warn('navigateToConnector: 连接点 Locator 不存在（幽灵条目），触发清理', {
                        spKey: this.spName, connKey: connKey, locatorName: locatorName,
                    });
                    this.$emit('clean-ghost-entry', { type: 'connector', spKey: this.spName, key: connKey });
                    return;
                }
            }
            this.$emit('navigate-to-connector', connKey);
        },
    },
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
