'use strict';

// 测试用 Blockbench 桩：只提供 doc 层需要的 bones 端口。
// 真实的 Group / Locator 类继承关系不在这里模拟；测试通过 ports.install 注入。

var ports = require('../../src/doc/ports.js');
var helpers = require('../helpers.js');

function installBones(list) {
    ports.reset();
    ports.install({
        bones: helpers.makeBones(list || []),
        markers: {
            set: function () { return true; },
            clear: function () { return true; },
            clearScope: function () { return 0; },
            recalc: function () { return 0; },
        },
    });
    return ports.get();
}

function resetPorts() {
    ports.reset();
}

module.exports = {
    installBones: installBones,
    resetPorts: resetPorts,
};
