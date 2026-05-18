/**
 * 连接点属性面板子组件
 * 选中标记为 connector 的 Locator 时在属性面板中显示
 *
 * 名称（字典 key）与定位器（locator 字段）分离：
 * - 名称即翻译键格式的 key（如 connector.machine_max.left_front_wheel）
 * - 定位器为独立的绑定字段
 */
Vue.component('mm-connector-panel', {
    template: typeof TEMPLATE_CONNECTOR_PANEL !== 'undefined' ? TEMPLATE_CONNECTOR_PANEL : '<p>连接点面板加载中...</p>',
    props: {
        config: { type: Object, required: true },
        elementName: { type: String, default: '' },
        connectorName: { type: String, default: '' },
        parentSubPartKey: { type: String, default: '' },
        connectorDefs: { type: Object, default: function() { return {}; } },
        allLocatorNames: { type: Array, default: function() { return []; } },
    },
    data: function () {
        return {
            editingName: this.connectorName || '',
            editingLocator: this.config.locator || this.elementName || '',
        };
    },
    watch: {
        connectorName: function (val) {
            if (val !== this.editingName) {
                this.editingName = val;
            }
        },
        'config.locator': function (val) {
            if (val !== this.editingLocator) {
                this.editingLocator = val;
            }
        },
        elementName: function (val) {
            // 当选中不同的 Locator 时，更新 locator 编辑字段
            if (this.config.locator && val !== this.editingLocator) {
                // 但优先显示 config.locator
            }
        },
    },
    computed: {
        locatorListId: function () {
            return 'mm-connector-loc-list-' + this._uid;
        },
        hasDefinition: function () {
            return !!(this.config && this.config.definition);
        },
    },
    methods: {
        onNameChange: function (value) {
            if (value !== this.connectorName) {
                this.$emit('name-change', this.connectorName, value);
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
        onDefinitionChange: function (value) {
            this.$emit('field-change', 'definition', value);
        },
        /**
         * 导航到归属子零件：点击归属标签时选中对应的子零件 Group，切换回子零件属性面板
         */
        navigateToSubPart: function () {
            this.$emit('navigate-to-sub-part', this.parentSubPartKey);
        },
    },
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
