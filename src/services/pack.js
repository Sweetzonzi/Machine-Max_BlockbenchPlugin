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
var { BUILTIN_PACK_ID } = require('../core/constants.js');
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
 * 判断路径是否指向内置基础内容包（machine_max:builtin）。
 *
 * 内置包由插件构建时注入，不属于本地路径依赖：链式解析、依赖编辑器和合并视图
 * 都应跳过它。
 *
 * @param {string} packPath - 内容包根目录或 ZIP 文件路径
 * @returns {boolean}
 */
function isBuiltinPackPath(packPath) {
    return content_pack.isBuiltinPackPath(packPath);
}

/**
 * 从依赖路径列表中剔除内置包路径（保序，去重由调用方负责）。
 *
 * @param {string[]} deps - 依赖路径列表
 * @returns {string[]} 过滤后的列表
 */
function filterBuiltinDeps(deps) {
    var result = [];
    var i;
    if (!Array.isArray(deps)) return result;
    for (i = 0; i < deps.length; i++) {
        if (typeof deps[i] !== 'string' || !deps[i]) continue;
        if (!isBuiltinPackPath(deps[i])) result.push(deps[i]);
    }
    return result;
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
            if (meta && meta.id === packId && meta.id !== BUILTIN_PACK_ID) {
                return fullPath;
            }
        }

        // ZIP 文件形式
        if (stat.isFile() && fullPath.toLowerCase().endsWith('.zip')) {
            meta = content_pack.readPackMeta(fullPath);
            if (meta && meta.id === packId && meta.id !== BUILTIN_PACK_ID) {
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
 * @returns {{direct: Array, indirect: Array<{path: string, type: string, isIndirect: boolean}>,
 *            unresolved: Array<{id: string, type: string, source: string}>}}
 */
function resolveChainDependencies(directDeps, parentDir) {
    var indirect = [];
    var unresolved = [];
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

            // 内置包由插件构建时注入，运行时始终可用；meta.dependencies 里默认会
            // 写一条 machine_max:builtin（导出时自动补），不能解析成本地路径依赖。
            if (depId === BUILTIN_PACK_ID) {
                log.info('链式解析: 跳过内置包 "' + depId + '"（由插件内置提供，无需本地依赖）');
                continue;
            }

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
            } else if (!found) {
                unresolved.push({
                    id: depId,
                    type: depDep.type || 'hard',
                    source: dep.path,
                });
            }
        }
    }

    return {
        direct: directDeps,
        indirect: indirect,
        unresolved: unresolved,
    };
}

/**
 * 按 meta.dependencies 声明的 id 解析出本地依赖路径。
 *
 * 用于"打开已有内容包"：内容包的 meta.json 只记录依赖 id，不含路径；
 * 这里在内容包父目录下按 id 查找同级目录 / ZIP，再把找到的直接依赖做一层
 * 链式解析（间接依赖）。
 *
 * 内置包 machine_max:builtin 由插件构建时注入，永远跳过；
 * 自引用（meta.id 或解析回包自身）也跳过，避免把自己当依赖。
 *
 * @param {Array<string|{id: string, type?: string}>} declaredDeps - meta.dependencies
 * @param {string} parentDir - 内容包所在父目录（同级搜索范围）
 * @param {Object} [options]
 * @param {string} [options.selfId] - 当前包 id，用于跳过自引用
 * @param {string} [options.selfPath] - 当前包路径，用于跳过解析回自身的目录
 * @returns {{direct: Array<{path: string, type: string}>,
 *            indirect: Array<{path: string, type: string, isIndirect: boolean}>,
 *            unresolved: Array<{id: string, type: string, source: string}>,
 *            paths: string[],
 *            declaredCount: number}}
 *
 * `declaredCount` 是去重后需要本地路径的声明数（不含内置包与自引用），
 * 调用方用它区分「这个包没声明依赖」和「声明了但一条都没解析到」。
 */
function resolveDeclaredDependencies(declaredDeps, parentDir, options) {
    options = options || {};
    var direct = [];
    var unresolved = [];
    var seen = {};
    var chain;
    var paths = [];
    var declaredCount = 0;

    if (!Array.isArray(declaredDeps) || !parentDir) {
        return {
            direct: direct, indirect: [], unresolved: unresolved,
            paths: paths, declaredCount: 0,
        };
    }

    var i, entry, depId, depType, found;
    for (i = 0; i < declaredDeps.length; i++) {
        entry = declaredDeps[i];
        if (!entry) continue;
        depId = typeof entry === 'string' ? entry : (entry.id || '');
        depType = (typeof entry === 'object' && entry.type) || 'hard';
        if (!depId || seen[depId]) continue;
        seen[depId] = true;

        // 内置包由插件构建时注入，不是本地路径依赖
        if (depId === BUILTIN_PACK_ID) continue;
        // 自引用：包声明了自己的 id
        if (options.selfId && depId === options.selfId) continue;

        declaredCount++;

        found = findPackInSiblings(parentDir, depId);
        if (found && options.selfPath &&
            path.resolve(found) === path.resolve(options.selfPath)) {
            found = null;   // 解析回包自身，视为未找到
        }
        if (!found) {
            unresolved.push({ id: depId, type: depType, source: 'direct' });
            continue;
        }
        direct.push({ path: found, type: depType });
    }

    chain = resolveChainDependencies(direct, parentDir);

    for (i = 0; i < direct.length; i++) paths.push(direct[i].path);
    for (i = 0; i < chain.indirect.length; i++) paths.push(chain.indirect[i].path);

    return {
        direct: direct,
        indirect: chain.indirect,
        unresolved: unresolved.concat(chain.unresolved),
        paths: paths,
        declaredCount: declaredCount,
    };
}

module.exports = {
    createPack: createPack,
    openPack: openPack,
    readPackMeta: readPackMeta,
    isBuiltinPackPath: isBuiltinPackPath,
    filterBuiltinDeps: filterBuiltinDeps,
    findPackInSiblings: findPackInSiblings,
    resolveChainDependencies: resolveChainDependencies,
    resolveDeclaredDependencies: resolveDeclaredDependencies,
};
