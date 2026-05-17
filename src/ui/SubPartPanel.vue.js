/**
 * 子零件属性面板子组件
 * 选中标记为 sub_part 的 Group 时在属性面板中显示
 *
 * 从 App.vue.js 提取的独立组件文件。
 * 模板来自 esbuild define: TEMPLATE_SUB_PART_PANEL
 */
Vue.component('mm-sub-part-panel', {
    template: typeof TEMPLATE_SUB_PART_PANEL !== 'undefined' ? TEMPLATE_SUB_PART_PANEL : '<p>子零件面板加载中...</p>',
    props: {
        config: { type: Object, required: true },
        elementName: { type: String, default: '' },
        badgeColor: { type: String, default: '#4A90D9' },
        badgeLabel: { type: String, default: '子零件' },
        hitBoxes: { type: Object, default: function() { return {}; } },
        allBoneNames: { type: Array, default: function() { return []; } },
        allLocatorNames: { type: Array, default: function() { return []; } },
    },
    data: function () {
        return {
            newEndBone: '',
            editingStartBone: this.config.start_bone,
            editingMassCenter: this.config.mass_center,
        };
    },
    watch: {
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
        /**
         * 每个组件实例唯一的 datalist id，避免多实例下 id 冲突
         */
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
            return this.hitBoxes ? Object.keys(this.hitBoxes).length : 0;
        },
        connectorCount: function () {
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
    },
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
