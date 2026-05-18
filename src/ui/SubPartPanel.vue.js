/**
 * 子零件属性面板子组件
 * 选中标记为 sub_part 的 Group 时在属性面板中显示
 *
 * 名称（字典 key）与骨骼（start_bone 字段）分离：
 * - 名称即翻译键格式的 key（如 sub_part.machine_max.main）
 * - 骨骼为独立的绑定字段
 */
Vue.component('mm-sub-part-panel', {
    template: typeof TEMPLATE_SUB_PART_PANEL !== 'undefined' ? TEMPLATE_SUB_PART_PANEL : '<p>子零件面板加载中...</p>',
    props: {
        config: { type: Object, required: true },
        elementName: { type: String, default: '' },
        spName: { type: String, default: '' },
        badgeColor: { type: String, default: '#4A90D9' },
        badgeLabel: { type: String, default: '子零件' },
        hitBoxes: { type: Object, default: function() { return {}; } },
        allBoneNames: { type: Array, default: function() { return []; } },
        allLocatorNames: { type: Array, default: function() { return []; } },
        refreshKey: { type: Number, default: 0 },
    },
    data: function () {
        return {
            newEndBone: '',
            editingName: this.spName || '',
            editingStartBone: this.config.start_bone,
            editingMassCenter: this.config.mass_center,
        };
    },
    watch: {
        spName: function (val) {
            if (val !== this.editingName) {
                this.editingName = val;
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
        connectorCount: function () {
            // 读取 refreshKey 作为版本号：外部因非响应式操作（delete）改变 connectors 时强制重算
            void this.refreshKey;
            return this.config.connectors ? Object.keys(this.config.connectors).length : 0;
        },
        subsystemCount: function () {
            return this.config.subsystems ? Object.keys(this.config.subsystems).length : 0;
        },
    },
    methods: {
        onFieldChange: function (field, value) {
            this.$emit('field-change', field, value);
        },
        onNameChange: function (value) {
            if (value !== this.spName) {
                this.$emit('name-change', this.spName, value);
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
        onProjectedAreaChange: function (axis, value) {
            this.$emit('projected-area-change', axis, value);
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
        resolveConnectorName: function (connKey) {
            // 连接点 key 现在是翻译键格式，直接显示
            return connKey;
        },
        /**
         * 导航到碰撞箱：点击碰撞箱条目时选中对应的 Group 骨骼，切换到碰撞箱属性面板
         */
        navigateToHitBox: function (hbKey) {
            this.$emit('navigate-to-hit-box', hbKey);
        },
        /**
         * 导航到连接点：点击连接点条目时选中对应的 Locator，切换到连接点属性面板
         */
        navigateToConnector: function (connKey) {
            this.$emit('navigate-to-connector', connKey);
        },
    },
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
