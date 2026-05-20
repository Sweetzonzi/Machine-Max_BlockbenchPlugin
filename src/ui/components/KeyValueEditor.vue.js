/**
 * 键值对编辑器组件 — 可复用的映射编辑 UI
 *
 * 用于 textures、signal_targets、signal_translations 等键值对字段的增删改。
 * entries 为普通对象 { key: value }，组件通过 $emit 通知变更。
 */
Vue.component('key-value-editor', {
    props: {
        entries: { type: Object, default: function () { return {}; } },
        keyLabel: { type: String, default: '键' },
        valueLabel: { type: String, default: '值' },
        keyPlaceholder: { type: String, default: '' },
        valuePlaceholder: { type: String, default: '' },
        keyHints: { type: Array, default: function () { return []; } },
        valueHints: { type: Array, default: function () { return []; } },
    },
    data: function () {
        return {
            newKey: '',
            newValue: '',
        };
    },
    computed: {
        entryList: function () {
            var entries = this.entries || {};
            var list = [];
            for (var k in entries) {
                if (Object.prototype.hasOwnProperty.call(entries, k)) {
                    list.push({ key: k, value: entries[k] });
                }
            }
            return list;
        },
    },
    template:
        '<div class="mm-kv-editor">' +
            '<div class="mm-kv-row" v-for="(entry, i) in entryList" :key="entry.key">' +
                '<input type="text" :value="entry.key" @input="onKeyInput(i, $event)" class="mm-input mm-kv-key" :placeholder="keyPlaceholder" />' +
                '<input type="text" :value="entry.value" @input="onValueInput(i, $event)" class="mm-input mm-kv-value" :placeholder="valuePlaceholder" />' +
                '<button type="button" class="mm-btn mm-btn-sm mm-btn-danger" @click="onRemove(i)" title="移除此条目">×</button>' +
            '</div>' +
            '<div class="mm-kv-row mm-kv-add">' +
                '<input type="text" v-model="newKey" @keyup.enter="onAdd" class="mm-input mm-kv-key" :placeholder="keyPlaceholder" />' +
                '<input type="text" v-model="newValue" @keyup.enter="onAdd" class="mm-input mm-kv-value" :placeholder="valuePlaceholder" />' +
                '<button type="button" class="mm-btn mm-btn-sm" @click="onAdd" title="添加条目">+</button>' +
            '</div>' +
        '</div>',
    methods: {
        onKeyInput: function (i, event) {
            var entry = this.entryList[i];
            var oldKey = entry.key;
            var newKey = event.target.value;
            this.$emit('update-key', { oldKey: oldKey, newKey: newKey });
        },
        onValueInput: function (i, event) {
            var key = this.entryList[i].key;
            this.$emit('update-value', { key: key, newValue: event.target.value });
        },
        onRemove: function (i) {
            var key = this.entryList[i].key;
            this.$emit('remove', { key: key });
        },
        onAdd: function () {
            if (!this.newKey.trim()) return;
            this.$emit('add', { key: this.newKey.trim(), value: this.newValue.trim() });
            this.newKey = '';
            this.newValue = '';
        },
    },
});

module.exports = {};
