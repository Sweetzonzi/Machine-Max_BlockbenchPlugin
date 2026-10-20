// 文件: src/services/pack.js
// 用途: 内容包创建/打开/依赖链解析的文件系统用例（docs/13 §8 P4）
// 所属模块: MachineMax Blockbench 插件
//
// services 层可以 require fs；不参与撤销、不暴露给 MCP。
// UI 对话框只负责收集表单与展示结果。

'use strict';

var fs = require('fs');
var path = require('path');
var content_pack = require('../core/content_pack.js');
var { createLogger } = require('../utils/logger.js');

var log = createLogger('PackService');

/** 创建内容包（委托 core/content_pack）。 */
function createPack(dirPath, meta) {
    return content_pack.createContentPack(dirPath, meta);
}

/** 打开/校验内容包（委托 core/content_pack）。 */
function openPack(dirPath) {
    return content_pack.openContentPack(dirPath);
}

/** 读取内容包 meta.json（委托 core/content_pack）。 */
function readPackMeta(packPath) {
    return content_pack.readPackMeta(packPath);
}

/**
 * 在父目录下搜索具有指定 ID 的内容包。
 * 遍历 parentDir 的直接子目录和 .zip 文件，读取 meta.json 检查 id 匹配。
 *
 * @param {string} parentDir - 搜索的父目录
 * @param {string} packId - 要查找的内容包 ID（如 machine_max:core）
 * @returns {string|null} 找到的目录或 ZIP 文件路径，或 null
 */
function findPackInSiblings(parentDir, packId) {
    if (!packId || !parentDir || !fs.existsSync(parentDir)) return null;

    var entries, i, fullPath, stat, meta;
    try {
        entries = fs.readdirSync(parentDir);
    } catch (e) {
        return null;
    }

    for (i = 0; i < entries.length; i++) {
        fullPath = path.join(parentDir, entries[i]);
        try {
            stat = fs.statSync(fullPath);
        } catch (e) {
            continue;
        }

        // 目录形式
        if (stat.isDirectory()) {
            meta = content_pack.readPackMeta(fullPath);
            if (meta && meta.id === packId) {
                return fullPath;
            }
        }

        // ZIP 文件形式
        if (stat.isFile() && fullPath.toLowerCase().endsWith('.zip')) {
            meta = content_pack.readPackMeta(fullPath);
            if (meta && meta.id === packId) {
                return fullPath;
            }
        }
    }
    return null;
}

/**
 * 解析直接依赖的链式（间接）依赖。
 * 只搜索一层；被找到的间接依赖不再递归解析其自身依赖。
 *
 * @param {Array<{path: string, type: string}>} directDeps
 * @param {string} parentDir
 * @returns {{direct: Array, indirect: Array<{path: string, type: string, isIndirect: boolean}>}}
 */
function resolveChainDependencies(directDeps, parentDir) {
    var indirect = [];
    var processed = {};
    var i, j, dep, depMeta, depDeps, depDep, depId, found;

    // 标记直接依赖路径为已处理，避免被当作间接依赖重复添加
    for (i = 0; i < directDeps.length; i++) {
        if (directDeps[i].path) {
            processed[directDeps[i].path] = true;
        }
    }

    for (i = 0; i < directDeps.length; i++) {
        dep = directDeps[i];
        if (!dep.path) continue;

        depMeta = content_pack.readPackMeta(dep.path);
        if (!depMeta || !depMeta.dependencies || !depMeta.dependencies.length) continue;

        depDeps = depMeta.dependencies;
        for (j = 0; j < depDeps.length; j++) {
            depDep = depDeps[j];
            depId = depDep.id || depDep;

            // 在公共父目录下搜索
            found = findPackInSiblings(parentDir, depId);
            if (found && !processed[found]) {
                processed[found] = true;
                indirect.push({
                    path: found,
                    type: depDep.type || 'hard',
                    isIndirect: true,
                });
                log.info('链式解析: 发现间接依赖 "' + depId + '" → ' + found);
            }
        }
    }

    return {
        direct: directDeps,
        indirect: indirect,
    };
}

module.exports = {
    createPack: createPack,
    openPack: openPack,
    readPackMeta: readPackMeta,
    findPackInSiblings: findPackInSiblings,
    resolveChainDependencies: resolveChainDependencies,
};
