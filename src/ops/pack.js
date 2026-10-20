// 文件: src/ops/pack.js
// 用途: 内容包路径 / 元数据 / 依赖（docs/13 §6.1）
// 所属模块: MachineMax Blockbench 插件

'use strict';

var { runConfigEdit } = require('../core/undo.js');
var shared = require('./shared.js');

function setContentPack(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用，请先打开项目');

    var path = options.path || '';
    var namespace = options.namespace || '';
    var meta = options.meta || {};
    var label = options.label || '切换内容包';

    if (namespace) {
        var keys = require('../doc/keys.js');
        if (!keys.isValidNamespace(namespace)) {
            return shared.fail('namespace 非法', [shared.makeError(['namespace'],
                'invalid_format', '^[a-z0-9_.-]+$', namespace,
                'namespace 只允许小写 ASCII 字母、数字、`_`、`.`、`-`')]);
        }
    }

    runConfigEdit(label, function () {
        config.contentPackPath = path;
        config.namespace = namespace;
        config.packMeta = meta;
    }, { coalesce: false });

    return shared.ok({ changed: true });
}

function setContentPackPath(config, path) {
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用，请先打开项目');
    runConfigEdit('修改内容包路径', function () {
        config.contentPackPath = path || '';
    }, { coalesce: false });
    return shared.ok({ changed: true });
}

function updatePackMeta(config, patch) {
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用，请先打开项目');
    patch = patch || {};

    runConfigEdit('修改内容包信息', function () {
        if (!config.packMeta || typeof config.packMeta !== 'object') {
            config.packMeta = {};
        }
        Object.keys(patch).forEach(function (key) {
            shared.setProp(config.packMeta, key, patch[key]);
        });
    }, { coalesce: false });

    return shared.ok({ changed: true });
}

function updateDependencyPaths(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用，请先打开项目');

    var add = options.add || [];
    var remove = options.remove || [];
    var replace = options.replace;
    var changed = false;
    var paths = [];

    runConfigEdit('编辑依赖包', function () {
        if (Array.isArray(replace)) {
            config.dependencyPaths = replace.slice();
            changed = true;
        } else {
            if (!Array.isArray(config.dependencyPaths)) config.dependencyPaths = [];
            var i;
            for (i = 0; i < remove.length; i++) {
                var idx = config.dependencyPaths.indexOf(remove[i]);
                if (idx !== -1) {
                    config.dependencyPaths.splice(idx, 1);
                    changed = true;
                }
            }
            for (i = 0; i < add.length; i++) {
                if (add[i] && config.dependencyPaths.indexOf(add[i]) === -1) {
                    config.dependencyPaths.push(add[i]);
                    changed = true;
                }
            }
        }
        paths = config.dependencyPaths.slice();
    }, { coalesce: false });

    return shared.ok({ changed: changed, dependencyPaths: paths });
}

module.exports = {
    setContentPack: setContentPack,
    setContentPackPath: setContentPackPath,
    updatePackMeta: updatePackMeta,
    updateDependencyPaths: updateDependencyPaths,
};
