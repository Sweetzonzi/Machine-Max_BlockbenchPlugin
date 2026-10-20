'use strict';

// 回归：Blockbench 5.0.7 移除了 MenuBar.addMenu。旧代码直接调用它会抛
// TypeError，中断 plugin onload，导致阶段 4a 的 MCP 工具注册永远不执行。
// 这里锁定「没有 addMenu 时仍能注册菜单并重建菜单栏」的行为。

const { test, expect } = require('bun:test');

function installMenuStubs(order) {
    var calls = { update: 0, addMenu: [] };

    class BarMenu {
        constructor(id, structure, options) {
            this.id = id;
            this.structure = structure;
            this.options = options || {};
            this.children = [];
            this.deleted = false;
            MenuBar.menus[id] = this;
        }
        delete() {
            this.deleted = true;
            delete MenuBar.menus[this.id];
        }
    }

    global.BarMenu = BarMenu;
    global.MenuBar = {
        menus: {},
        update: function () {
            calls.update += 1;
        },
        addMenu: function (menu, target) {
            calls.addMenu.push({ id: menu.id, target: target });
            MenuBar.menus[menu.id] = menu;
        },
    };

    order.forEach(function (id) {
        MenuBar.menus[id] = { id: id, conditionMet: function () { return true; } };
    });

    return calls;
}

function loadMenuModule() {
    delete require.cache[require.resolve('../../src/ui/menu.js')];
    return require('../../src/ui/menu.js');
}

test('menu 注册：没有 MenuBar.addMenu 时不抛错，并插到 tools 之后', function () {
    var calls = installMenuStubs(['file', 'edit', 'tools', 'view', 'help']);
    delete global.MenuBar.addMenu;
    var menu = loadMenuModule();

    expect(function () {
        menu.registerMachineMaxMenu();
    }).not.toThrow();

    expect(MenuBar.menus.machine_max).toBeDefined();
    expect(MenuBar.menus.machine_max.id).toBe('machine_max');
    expect(Object.keys(MenuBar.menus)).toEqual(['file', 'edit', 'tools', 'machine_max', 'view', 'help']);
    expect(calls.update).toBe(1);

    menu.unregisterMachineMaxMenu();
    expect(MenuBar.menus.machine_max).toBeUndefined();

    delete global.BarMenu;
    delete global.MenuBar;
});

test('menu 注册：旧版 MenuBar.addMenu 存在时仍走原路径', function () {
    var calls = installMenuStubs(['file', 'tools', 'view']);
    var menu = loadMenuModule();

    menu.registerMachineMaxMenu();

    expect(calls.addMenu).toEqual([{ id: 'machine_max', target: 'tools' }]);
    expect(calls.update).toBe(0);

    menu.unregisterMachineMaxMenu();

    delete global.BarMenu;
    delete global.MenuBar;
});
