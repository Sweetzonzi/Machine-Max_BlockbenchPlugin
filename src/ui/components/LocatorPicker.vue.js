/**
 * LocatorPicker.vue.js — 定位器（Locator）选择组件（共享）
 *
 * 统一子系统面板与连接点面板的 locator 选取交互为"输入框 + datalist 提示 + 自由文本"：
 *   - 输入框带 datalist 提示（options 范围内的候选）
 *   - 不拦截自由文本输入（支持搜索/引用越界 locator）
 *   - 输入值不在 options 中时以红/黄视觉标记（未找到/无效），但不阻止保存
 *   - 输入过程（@input）仅做本地预览（红/黄标记实时），失焦/回车（@change）才 emit 提交，
 *     避免每敲一个字符都触发父组件持久化/迁移逻辑（如连接点 locator 变更迁移）
 *
 * 使用方式:
 *   <locator-picker :options="allLocatorNames" :value="locator" @change="onLocatorChange" />
 */

Vue.component('locator-picker', {
    template:
        '<div class="mm-field">' +
            '<input type="text" class="mm-input" :value="localValue" ' +
                '@input="onPreview($event.target.value)" @change="onCommit($event.target.value)" ' +
                ':list="listId" placeholder="搜索并选择定位器…" :class="inputClass" />' +
            '<datalist :id="listId">' +
                '<option v-for="(name, idx) in options" :key="idx" :value="name" />' +
            '</datalist>' +
            '<span v-if="isMissing && localValue" class="mm-locator-warn">' +
                '⚠ 未找到定位器（自由文本，将原样保存）' +
            '</span>' +
        '</div>',
    props: {
        /** 可选定位器名称列表 */
        options: { type: Array, default: function () { return []; } },
        /** 当前值（自由文本，可不在 options 中） */
        value: { type: String, default: '' },
    },
    data: function () {
        return {
            /** 本地编辑值：输入过程实时更新，失焦时提交给父组件 */
            localValue: this.value || '',
        };
    },
    watch: {
        /** 外部值变化（如切换到其他元素）时同步本地值 */
        value: function (newVal) {
            if (newVal !== this.localValue) {
                this.localValue = newVal || '';
            }
        },
    },
    computed: {
        listId: function () {
            return 'mm-loc-picker-' + this._uid;
        },
        /** 输入值是否不在可选范围内 */
        isMissing: function () {
            var v = this.localValue;
            if (!v) return false;
            return this.options.indexOf(v) === -1;
        },
        /** 输入框视觉标记：未找到标红 */
        inputClass: function () {
            return this.isMissing ? 'mm-locator-invalid' : '';
        },
    },
    methods: {
        /** 输入预览：仅更新本地值（驱动红/黄标记），不触发父组件提交 */
        onPreview: function (val) {
            this.localValue = val;
        },
        /** 失焦/回车提交：同步本地值并 emit 变更 */
        onCommit: function (val) {
            this.localValue = val;
            this.$emit('change', val);
        },
    },
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
