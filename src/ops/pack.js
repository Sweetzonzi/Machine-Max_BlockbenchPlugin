// 文件: src/ops/pack.js
// 用途: 内容包路径 / 元数据 / 依赖（docs/13 §6.1）
// 所属模块: MachineMax Blockbench 插件

'use strict';

var { runConfigEdit } = require('../core/undo.js');
var content_pack = require('../core/content_pack.js');
var content_pack_manager = require('../core/content_pack_manager.js');
var shared = require('./shared.js');

/**
 * 丢弃合并视图缓存。
 *
 * 切换内容包 / 修改依赖后必须重读磁盘；即使路径字符串没变（例如作者在外部
 * 编辑了内容包 JSON 后又重新选择同一个目录），也要丢弃旧缓存。
 */
function invalidateDefsCache() {
    content_pack_manager.invalidateCache();
}

/**
 * 从依赖路径中剔除内置包（machine_max:builtin）。
 *
 * 内置包由插件构建时注入，不属于本地路径依赖；旧工程可能因为链式解析把
 * 它的目录写进了 dependencyPaths，这里在每次依赖编辑时顺手清掉。
 *
 * @param {string[]} paths - 依赖路径列表
 * @returns {string[]} 过滤后的列表（保序）
 */
function stripBuiltinDeps(paths) {
    var result = [];
    var i;
    if (!Array.isArray(paths)) return result;
    for (i = 0; i < paths.length; i++) {
        if (typeof paths[i] !== 'string' || !paths[i]) continue;
        if (!content_pack.isBuiltinPackPath(paths[i])) result.push(paths[i]);
    }
    return result;
}

/**
 * 切换内容包（路径 + namespace + meta，可选同时写入依赖路径）
 *
 * `dependencyPaths` 用于"打开已有内容包"：依赖解析结果要和内容包路径落在
 * 同一条撤销记录里，否则 Ctrl+Z 一次会出现「新包 + 旧依赖」的不一致中间态。
 *
 * @param {Object} config - 完整配置对象
 * @param {Object} options
 * @param {string} options.path - 内容包根目录 / ZIP 路径
 * @param {string} [options.namespace] - 命名空间
 * @param {Object} [options.meta] - meta.json 内容
 * @param {string[]} [options.dependencyPaths] - 同时替换依赖路径（内置包会被剔除）
 * @param {string} [options.label] - 撤销记录标签
 * @returns {Object} OpResult
 */
function setContentPack(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用，请先打开项目');

    var path = options.path || '';
    var namespace = options.namespace || '';
    var meta = options.meta || {};
    var label = options.label || '切换内容包';
    var depPaths = options.dependencyPaths;

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
        if (Array.isArray(depPaths)) {
            config.dependencyPaths = stripBuiltinDeps(depPaths);
        }
        invalidateDefsCache();
    }, { coalesce: false });

    return shared.ok({ changed: true });
}

function setContentPackPath(config, path) {
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用，请先打开项目');
    runConfigEdit('修改内容包路径', function () {
        config.contentPackPath = path || '';
        invalidateDefsCache();
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
        var existing;
        var cleaned;
        var i;

        if (Array.isArray(replace)) {
            config.dependencyPaths = stripBuiltinDeps(replace);
            changed = true;
        } else {
            existing = Array.isArray(config.dependencyPaths) ? config.dependencyPaths : [];
            cleaned = stripBuiltinDeps(existing);
            if (cleaned.length !== existing.length) {
                // 旧配置里可能残留内置包路径，依赖编辑时顺手清理
                config.dependencyPaths = cleaned;
                changed = true;
            }
            if (!Array.isArray(config.dependencyPaths)) config.dependencyPaths = [];
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
        invalidateDefsCache();
    }, { coalesce: false });

    return shared.ok({ changed: changed, dependencyPaths: paths });
}

module.exports = {
    setContentPack: setContentPack,
    setContentPackPath: setContentPackPath,
    updatePackMeta: updatePackMeta,
    updateDependencyPaths: updateDependencyPaths,
};
