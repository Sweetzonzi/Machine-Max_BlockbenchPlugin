/**
 * 碰撞箱属性面板子组件
 * 选中标记为 hit_box 的 Group 时在属性面板中显示
 */
Vue.component('mm-hit-box-panel', {
    template: typeof TEMPLATE_HIT_BOX_PANEL !== 'undefined' ? TEMPLATE_HIT_BOX_PANEL : '<p>碰撞箱面板加载中...</p>',
    props: {
        config: { type: Object, required: true },
        elementName: { type: String, default: '' },
        parentSubPartKey: { type: String, default: '' },
        materialDefs: { type: Object, default: function() { return {}; } },
        parentSubsystems: { type: Object, default: function() { return {}; } },
    },
    data: function () {
        return {
            overwriteExpanded: false,
        };
    },
    computed: {
        badgeColor: function () { return '#D94A4A'; },
        badgeLabel: function () { return '碰撞箱'; },
        /**
         * 所属子零件内的子系统列表，用于关联子系统下拉选择
         * 格式: { subsystemKey: subsystemKey }，供 v-for 遍历
         */
        subsystemOptions: function () {
            var options = { '': '（无）' };
            for (var key in this.parentSubsystems) {
                if (this.parentSubsystems.hasOwnProperty(key)) {
                    options[key] = key;
                }
            }
            return options;
        },
        cubeCount: function () {
            if (!this._parentGroup || !this._parentGroup.children) return 0;
            return this._parentGroup.children.filter(function(c) { return c instanceof Cube; }).length;
        },
        cubeDimensions: function () {
            var group = this._parentGroup;
            if (!group || !group.children) return null;
            var cubes = group.children.filter(function(c) { return c instanceof Cube; });
            if (cubes.length === 0) return null;
            var min = [Infinity, Infinity, Infinity];
            var max = [-Infinity, -Infinity, -Infinity];
            for (var i = 0; i < cubes.length; i++) {
                var c = cubes[i];
                for (var a = 0; a < 3; a++) {
                    if (c.from[a] < min[a]) min[a] = c.from[a];
                    if (c.to[a] > max[a]) max[a] = c.to[a];
                }
            }
            var size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
            return size[0].toFixed(2) + ' × ' + size[1].toFixed(2) + ' × ' + size[2].toFixed(2);
        },
        cubePosition: function () {
            var group = this._parentGroup;
            if (!group) return null;
            var pos = group.origin || [0, 0, 0];
            return '(' + pos[0].toFixed(2) + ', ' + pos[1].toFixed(2) + ', ' + pos[2].toFixed(2) + ')';
        },
        _parentGroup: function () {
            var el = this.$parent && this.$parent.selectedElement;
            if (!el) return null;
            if (el instanceof Group) return el;
            return el.parent instanceof Group ? el.parent : null;
        },
    },
    methods: {
        onFieldChange: function (field, value) {
            this.$emit('field-change', field, value);
        },
        onOverwriteChange: function (field, value) {
            this.$emit('overwrite-change', field, value);
        },
        overwriteVal: function (field) {
            return this.config.overwrite ? this.config.overwrite[field] : undefined;
        },
        /**
         * 导航到归属子零件：点击归属标签时选中对应的子零件 Group，切换回子零件属性面板
         */
        navigateToSubPart: function () {
            this.$emit('navigate-to-sub-part', this.parentSubPartKey);
        },
    },
});

module.exports = {};
