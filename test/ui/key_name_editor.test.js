'use strict';

// KeyNameEditor（两段式键名编辑控件）用例
//
// 四个属性面板共用同一个控件：`<type>.<namespace>.<name>` 拆成命名空间与名称两段，
// 命名空间由创作者编辑（可引用模组共享词条），提交时只做格式校验并抛
// `name-change(oldKey, newKey)`，真正的迁移由 ops 层完成。
//
// 组件在加载时调用全局 Vue.component，这里用桩捕获选项后直接测 methods。

const fs = require('fs');
const path = require('path');
const { describe, test, expect, afterAll } = require('bun:test');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

const toasts = [];
const notify = require('../../src/utils/notify.js');
const originalShowToast = notify.showToast;
notify.showToast = function (text, type) {
    toasts.push({ text: text, type: type });
};

const originalVue = global.Vue;
let captured = null;
global.Vue = {
    component: function (name, options) {
        captured = { name: name, options: options };
    },
};

require('../../src/ui/KeyNameEditor.vue.js');

global.Vue = originalVue;

afterAll(function () {
    notify.showToast = originalShowToast;
});

const OPTIONS = captured.options;

/**
 * 构造一个只具备 methods 所需字段的假组件实例
 *
 * @param {string} keyValue - 当前完整键
 * @returns {Object} 假实例
 */
function makeVm(keyValue) {
    var vm = {
        type: String(keyValue || '').split('.')[0] || 'sub_part',
        keyValue: keyValue,
        editingNamespace: '',
        editingName: '',
        emitted: [],
        $emit: function (event, oldKey, newKey) {
            vm.emitted.push({ event: event, oldKey: oldKey, newKey: newKey });
        },
    };
    vm.syncFromKey = OPTIONS.methods.syncFromKey.bind(vm);
    vm.commit = OPTIONS.methods.commit.bind(vm);
    vm.syncFromKey(keyValue);
    return vm;
}

describe('ui/KeyNameEditor', () => {
    test('注册为 mm-key-name-editor，并从完整键拆出两段', function () {
        expect(captured.name).toBe('mm-key-name-editor');

        var vm = makeVm('sub_part.m1a2_sep.hull');
        expect(vm.editingNamespace).toBe('m1a2_sep');
        expect(vm.editingName).toBe('hull');

        // 名称段本身可以带点
        var nested = makeVm('subsystem.machine_max.a.b');
        expect(nested.editingNamespace).toBe('machine_max');
        expect(nested.editingName).toBe('a.b');
    });

    test('改命名空间后抛 name-change(oldKey, newKey)', function () {
        var vm = makeVm('sub_part.machine_max.hull');
        vm.editingNamespace = 'm1a2_sep';
        vm.commit();

        expect(vm.emitted).toEqual([{
            event: 'name-change',
            oldKey: 'sub_part.machine_max.hull',
            newKey: 'sub_part.m1a2_sep.hull',
        }]);
    });

    test('非法命名空间 / 名称段被拒绝，并回填当前 key', function () {
        toasts.length = 0;

        var vm = makeVm('sub_part.machine_max.hull');
        vm.editingNamespace = 'Machine Max';
        vm.commit();

        expect(vm.emitted).toEqual([]);
        expect(toasts.length).toBe(1);
        expect(toasts[0].type).toBe('error');
        expect(vm.editingNamespace).toBe('machine_max');

        var vm2 = makeVm('sub_part.machine_max.hull');
        vm2.editingName = '底盘';
        vm2.commit();

        expect(vm2.emitted).toEqual([]);
        expect(vm2.editingName).toBe('hull');
    });

    test('没有改动时不抛事件', function () {
        var vm = makeVm('connector.machine_max.front_wheel');
        vm.commit();
        expect(vm.emitted).toEqual([]);
    });

    test('四个面板模板都改用共用控件，且不残留单段输入框', function () {
        var panels = [
            ['sub_part_panel.html', 'sub_part', 'spName'],
            ['connector_panel.html', 'connector', 'connectorName'],
            ['interact_box_panel.html', 'interact', 'interactBoxName'],
            ['subsystem_panel.html', 'subsystem', 'subsystemKey'],
        ];

        panels.forEach(function (entry) {
            var html = fs.readFileSync(path.join(REPO_ROOT, 'src', 'ui', 'panels', entry[0]), 'utf8');
            expect(html).toContain('<mm-key-name-editor type="' + entry[1] + '"');
            expect(html).toContain(':key-value="' + entry[2] + '"');
            expect(html).not.toContain('namePrefix');
            expect(html).not.toContain('editingName');
        });
    });
});
