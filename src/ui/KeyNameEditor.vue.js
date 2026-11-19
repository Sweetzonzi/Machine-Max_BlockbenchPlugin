/**
 * key_name_editor.js — 两段式键名编辑控件
 *
 * 把 `<type>.<namespace>.<name>` 拆成两个输入框：命名空间段与名称段。
 * 命名空间不限定为本包的值——子零件 / 连接点 / 交互区 / 子系统的键同时是翻译键，
 * 既可以引用模组自带的 `machine_max` 共享词条，也可以写本包自己的命名空间。
 *
 * 只做格式校验（命名空间字符集、名称段字符集），跨命名空间是合法状态。
 * 校验通过后向父组件抛 `name-change(oldKey, newKey)`，重命名与引用迁移由 ops 层完成。
 */
var nameUtils = require('../utils/name_utils.js');
var keys = require('../doc/keys.js');
var cpManager = require('../core/content_pack_manager.js');
var { getConfig } = require('../utils/persistence.js');
var { showToast } = require('../utils/notify.js');

Vue.component('mm-key-name-editor', {
    template: typeof TEMPLATE_KEY_NAME_EDITOR !== 'undefined' ? TEMPLATE_KEY_NAME_EDITOR : '<span>键名编辑器加载中...</span>',
    props: {
        /** 键类型前缀：sub_part / connector / interact / subsystem */
        type: { type: String, required: true },
        /** 当前完整键，如 sub_part.machine_max.main */
        keyValue: { type: String, default: '' },
        /** 名称段的占位提示 */
        placeholder: { type: String, default: '' },
    },
    data: function () {
        return {
            editingNamespace: '',
            editingName: '',
        };
    },
    created: function () {
        this.syncFromKey(this.keyValue);
    },
    computed: {
        nsListId: function () {
            return 'mm-key-ns-list-' + this._uid;
        },
        /** 可选命名空间：machine_max（共享词汇）+ 本包 + 各依赖包 */
        namespaceOptions: function () {
            try {
                return cpManager.namespaceCandidates(getConfig());
            } catch (e) {
                return ['machine_max'];
            }
        },
    },
    watch: {
        keyValue: function (val) {
            this.syncFromKey(val);
        },
        namespaceOptions: function (val) {
            // 首次拿到候选表时把命名空间补进空值，避免输入框留空
            if (!this.editingNamespace && val && val.length) {
                this.editingNamespace = val[0];
            }
        },
    },
    methods: {
        syncFromKey: function (key) {
            var parsed = nameUtils.parseKey(key);
            this.editingNamespace = parsed ? parsed.namespace : '';
            this.editingName = parsed ? parsed.name : (key || '');
        },
        onFocus: function (event) {
            event.target.style.border = '1px solid #555';
            event.target.style.background = '#2a2a2a';
        },
        onBlur: function (event) {
            event.target.style.border = '1px solid transparent';
            event.target.style.background = 'transparent';
        },
        commit: function () {
            var ns = String(this.editingNamespace || '').trim();
            var name = String(this.editingName || '').trim();
            if (!keys.isValidNamespace(ns)) {
                showToast('命名空间只能用小写字母、数字、下划线或连字符', 'error');
                this.syncFromKey(this.keyValue);
                return;
            }
            if (!keys.isValidNameSegment(name)) {
                showToast('名称段只允许 ASCII 字母、数字、下划线、点、连字符，且不能以点开头或结尾', 'error');
                this.syncFromKey(this.keyValue);
                return;
            }
            var next = nameUtils.buildKey(this.type, ns, name);
            if (next !== this.keyValue) {
                this.$emit('name-change', this.keyValue, next);
            } else {
                this.syncFromKey(this.keyValue);
            }
        },
    },
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
