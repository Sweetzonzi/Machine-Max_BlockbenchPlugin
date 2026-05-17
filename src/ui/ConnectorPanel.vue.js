/**
 * 连接点属性面板子组件
 * 选中标记为 connector 的 Locator 时在属性面板中显示
 * 允许修改关联定位器名称（自动迁移标记），并选择连接点定义 ID
 */
Vue.component('mm-connector-panel', {
    template: typeof TEMPLATE_CONNECTOR_PANEL !== 'undefined' ? TEMPLATE_CONNECTOR_PANEL : '<p>连接点面板加载中...</p>',
    props: {
        config: { type: Object, required: true },
        elementName: { type: String, default: '' },
        parentSubPartKey: { type: String, default: '' },
        connectorDefs: { type: Object, default: function() { return {}; } },
        allLocatorNames: { type: Array, default: function() { return []; } },
    },
    data: function () {
        return {
            editingLocatorName: this.elementName || '',
        };
    },
    watch: {
        elementName: function (val) {
            if (val !== this.editingLocatorName) {
                this.editingLocatorName = val;
            }
        },
    },
    computed: {
        locatorListId: function () {
            return 'mm-connector-loc-list-' + this._uid;
        },
    },
    methods: {
        onDefinitionChange: function (value) {
            this.$emit('field-change', 'definition', value);
        },
        onLocatorInput: function (value) {
            if (value !== this.elementName) {
                this.$emit('locator-change', this.elementName, value);
            }
        },
    },
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
