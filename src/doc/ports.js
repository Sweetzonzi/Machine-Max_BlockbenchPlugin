// 文件: src/doc/ports.js
// 用途: doc 层的外部能力端口（docs/13 §7.1）
// 所属模块: MachineMax Blockbench 插件
//
// doc 不 require Blockbench / Vue；所有外部能力通过本模块注入。
// 默认实现在 Node 测试下是安全的：没有全局 Group / Locator / Blockbench 时返回空。

'use strict';

var STATE = null;

function groupList() {
    return (typeof Group !== 'undefined' && Group && Group.all) ? Group.all : [];
}

function locatorList() {
    return (typeof Locator !== 'undefined' && Locator && Locator.all) ? Locator.all : [];
}

function findIn(list, name) {
    for (var i = 0; i < list.length; i++) {
        if (list[i] && list[i].name === name) return list[i];
    }
    return null;
}

function findByUuidIn(list, uuid) {
    for (var i = 0; i < list.length; i++) {
        if (list[i] && list[i].uuid === uuid) return list[i];
    }
    return null;
}

function createDefaults() {
    return {
        bones: {
            findByName: function (name) {
                return findIn(groupList(), name) || findIn(locatorList(), name);
            },
            findByUuid: function (uuid) {
                return findByUuidIn(groupList(), uuid) || findByUuidIn(locatorList(), uuid);
            },
            findNameByUuid: function (uuid) {
                var el = findByUuidIn(groupList(), uuid) || findByUuidIn(locatorList(), uuid);
                return el ? el.name : null;
            },
            listAll: function () {
                return groupList().concat(locatorList());
            },
        },
        markers: {
            set: null,
            clear: null,
            clearScope: null,
            recalc: null,
        },
        validation: {
            collectIssues: null,
        },
        events: {
            emit: function (name, payload) {
                if (typeof Blockbench !== 'undefined' && Blockbench && typeof Blockbench.dispatchEvent === 'function') {
                    Blockbench.dispatchEvent(name, payload);
                }
            },
        },
        reactivity: {
            set: function (obj, key, value) {
                if (typeof Vue !== 'undefined' && Vue && typeof Vue.set === 'function') {
                    Vue.set(obj, key, value);
                } else {
                    obj[key] = value;
                }
            },
            del: function (obj, key) {
                if (typeof Vue !== 'undefined' && Vue && typeof Vue.delete === 'function') {
                    Vue.delete(obj, key);
                } else {
                    delete obj[key];
                }
            },
        },
    };
}

function get() {
    if (!STATE) STATE = createDefaults();
    return STATE;
}

function assignCategory(name, patch) {
    if (!patch || typeof patch !== 'object') return;
    var current = get()[name];
    Object.keys(patch).forEach(function (key) {
        current[key] = patch[key];
    });
}

/**
 * 逐项覆盖默认端口。只覆盖传入的类别/方法，未传的保持原实现。
 * @param {object} p
 */
function install(p) {
    if (!p || typeof p !== 'object') return get();
    var current = get();
    Object.keys(p).forEach(function (category) {
        if (!current[category]) {
            current[category] = {};
        }
        assignCategory(category, p[category]);
    });
    return current;
}

/** 恢复默认端口（测试隔离用）。 */
function reset() {
    STATE = createDefaults();
    return STATE;
}

module.exports = {
    get: get,
    install: install,
    reset: reset,
};
