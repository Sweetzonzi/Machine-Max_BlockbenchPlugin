/**
 * Blockbench 全局对象 Mock 层
 *
 * 为测试环境模拟 Blockbench 提供的全局 API，使 src/ 下的模块可以正常 require。
 * 所有类均使用 ES6 class 语法以支持 instanceof 检查。
 *
 * 用法（在测试文件顶部）:
 *   require('./mocks/blockbench.js');
 */

// ─── Mode ────────────────────────────────────────────────────────────────────
class Mode {
    constructor(id, options) {
        this.id = id;
        this.options = options || {};
        this._isActive = false;
    }
    isActive() { return this._isActive; }
    onActivate() {}
    onDeactivate() {}
    getDefault() { return null; }
    setDefault() {}
    destroy() {}
}

// ─── BarItems ────────────────────────────────────────────────────────────────
class BarItems {
    constructor() {
        this.allActions = [];
        this._items = {};
    }
    add(action) {
        if (!action || !action.id) return;
        this.allActions.push(action);
        this._items[action.id] = action;
    }
    remove(action) {
        if (!action || !action.id) return;
        var idx = this.allActions.indexOf(action);
        if (idx !== -1) this.allActions.splice(idx, 1);
        delete this._items[action.id];
    }
    get(id) {
        return this._items[id] || null;
    }
}

// ─── Dialog ──────────────────────────────────────────────────────────────────
class Dialog {
    constructor(options) {
        this.options = options || {};
        this._isVisible = false;
    }
    show() { this._isVisible = true; }
    hide() { this._isVisible = false; }
    destroy() {}
}

// ─── Blockbench ──────────────────────────────────────────────────────────────
var Blockbench = {
    _listeners: {},
    on: function (event, callback) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
    },
    off: function (event, callback) {
        if (!this._listeners[event]) return;
        var idx = this._listeners[event].indexOf(callback);
        if (idx !== -1) this._listeners[event].splice(idx, 1);
    },
    showToastNotification: function (message, icon) {
        // no-op in test
    },
};

// ─── Group ───────────────────────────────────────────────────────────────────
class Group {
    constructor(name) {
        this.name = name || 'Group';
        this.type = 'group';
        this.children = [];
        this.parent = null;
    }
    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }
    remove() {}
    select() {}
}

// ─── Locator ─────────────────────────────────────────────────────────────────
class Locator {
    constructor(name) {
        this.name = name || 'Locator';
        this.type = 'locator';
        this.parent = null;
    }
    remove() {}
    select() {}
}

// ─── OutlinerElement ─────────────────────────────────────────────────────────
class OutlinerElement {
    constructor() {
        this._selected = false;
    }
    select() {
        this._selected = true;
    }
    deselect() {
        this._selected = false;
    }
}

// ─── Outliner ────────────────────────────────────────────────────────────────
var Outliner = {
    struct: [],
    updateElement: function (el) {},
};

// ─── ModelProject ────────────────────────────────────────────────────────────
class ModelProject {
    constructor() {
        this.name = 'Test Project';
        this.file_path = '';
    }
}
ModelProject.properties = {};

// ─── Project ─────────────────────────────────────────────────────────────────
var Project = {
    file_path: '',
    name: 'Test Project',
};

// ─── Register globals ────────────────────────────────────────────────────────
globalThis.Mode = Mode;
globalThis.BarItems = new BarItems();
globalThis.Dialog = Dialog;
globalThis.Blockbench = Blockbench;
globalThis.Group = Group;
globalThis.Locator = Locator;
globalThis.OutlinerElement = OutlinerElement;
globalThis.Outliner = Outliner;
globalThis.ModelProject = ModelProject;
globalThis.Project = Project;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Mode,
        BarItems,
        Dialog,
        Blockbench,
        Group,
        Locator,
        OutlinerElement,
        Outliner,
        ModelProject,
        Project,
    };
}
