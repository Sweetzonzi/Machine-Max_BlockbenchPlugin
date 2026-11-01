// 文件: src/services/cube_uv.js
// 用途: 清空方块六面 UV，让碰撞几何在游戏内不可见（导出为 "uv": {}）
// 所属模块: MachineMax Blockbench 插件
//
// 碰撞箱骨骼里的方块只承担碰撞形状，不应该被渲染。判定依据是导出 JSON 的
// `"uv": {}`：Blockbench 的 Bedrock 导出在六个面都没有贴图时才会写成空 UV，
// 所以必须逐面把 `texture` 置 null 并保留 `uv = [0,0,0,0]`——只清一个面或只改
// `cube.uv_offset` 都不够。
//
// 这里不碰配置：撤销走 Blockbench 原生 `uv_only` 记录，与 UV 面板的
// "Remove face" 同一条路径（js/uv/uv.js UVEditor.clear）。改完必须调
// `cube.preview_controller.updateFaces(cube)` 重建网格，否则视口仍显示旧贴图。

'use strict';

var { createLogger } = require('../utils/logger.js');

var log = createLogger('CubeUV');

/** 方块六面在导出与 `Canvas.face_order` 中使用的键 */
var FACE_KEYS = ['north', 'east', 'south', 'west', 'up', 'down'];

function globalCubes() {
    return (typeof Cube !== 'undefined' && Cube && Array.isArray(Cube.all)) ? Cube.all.slice() : [];
}

function selectedCubes() {
    if (typeof Cube !== 'undefined' && Cube && Array.isArray(Cube.selected) && Cube.selected.length) {
        return Cube.selected.slice();
    }
    if (typeof Outliner !== 'undefined' && Outliner && Array.isArray(Outliner.selected)) {
        return Outliner.selected.filter(function (el) {
            return el && el.faces && typeof el.faces === 'object';
        });
    }
    return [];
}

/** 组里没有自己的 faces，命中箱的方块挂在组的子级上，所以选择组时要递归收集。 */
function collectCubes(elements, out) {
    (elements || []).forEach(function (el) {
        if (!el) return;
        if (el.faces && typeof el.faces === 'object') {
            out.push(el);
            return;
        }
        if (Array.isArray(el.children)) collectCubes(el.children, out);
    });
    return out;
}

function uniqueCubes(list) {
    var seen = {};
    var out = [];
    list.forEach(function (cube) {
        if (!cube || seen[cube.uuid]) return;
        seen[cube.uuid] = true;
        out.push(cube);
    });
    return out;
}

/**
 * 把 uuid / 名称解析成方块列表。
 *
 * 方块默认都叫 `cube`，名称通常不唯一：命中名称多于一个时按歧义报错，要求改用 uuid。
 *
 * @param {string[]} [ids] uuid 或唯一名称；省略时取当前选择（含所选组的子方块）
 * @returns {{ok:true, cubes:Object[], source:string}|{ok:false, error:string, errors:Object[]}}
 */
function resolveCubes(ids) {
    var wanted = (ids || []).filter(function (id) {
        return typeof id === 'string' && id.trim() !== '';
    });

    if (!wanted.length) {
        var fromSelection = uniqueCubes(collectCubes(selectedCubes(), []));
        if (!fromSelection.length) {
            return {
                ok: false,
                error: '没有指定方块，当前选择里也没有方块',
                errors: [makeError([], 'not_found', '方块 uuid、唯一方块名或已选中的组', '', '先在视口里选中命中箱组，或显式传 cubes')],
            };
        }
        return { ok: true, cubes: fromSelection, source: 'selection' };
    }

    var all = globalCubes();
    var cubes = [];
    var errors = [];
    wanted.forEach(function (id) {
        var byUuid = all.filter(function (c) { return c.uuid === id; });
        if (byUuid.length === 1) {
            cubes.push(byUuid[0]);
            return;
        }
        var byName = all.filter(function (c) { return c.name === id; });
        if (byName.length === 1) {
            cubes.push(byName[0]);
            return;
        }
        if (byName.length > 1) {
            errors.push(makeError([], 'ambiguous_name', '唯一的方块名或 uuid', id,
                '同名方块有 ' + byName.length + ' 个，改用 uuid：' + byName.slice(0, 5).map(function (c) { return c.uuid; }).join(', ')));
            return;
        }
        errors.push(makeError([], 'not_found', '已存在的方块', id, '传方块 uuid，或先选中它再省略 cubes'));
    });

    if (errors.length) return { ok: false, error: '有方块找不到', errors: errors };
    return { ok: true, cubes: uniqueCubes(cubes), source: 'ids' };
}

function makeError(path, code, expected, got, hint) {
    return { path: path, code: code, expected: expected, got: got, hint: hint || '' };
}

function isZeroUv(uv) {
    return Array.isArray(uv) && uv.length === 4
        && uv[0] === 0 && uv[1] === 0 && uv[2] === 0 && uv[3] === 0;
}

/**
 * 清空这些方块的六面 UV。
 *
 * 已经是空 UV 的面会被跳过，因此重复调用是幂等的；`changed` 只反映这次真正改动了几面。
 *
 * @param {Object[]} cubes 方块实例
 * @returns {{ok:boolean, changed:boolean, cleared_faces:number, cubes:Object[], refresh_failed:Object[], error?:string, errors?:Object[]}}
 */
function clearCubeUv(cubes) {
    var list = uniqueCubes((cubes || []).filter(function (c) { return c && c.faces; }));
    if (!list.length) {
        return {
            ok: false,
            error: '没有可清空 UV 的方块',
            errors: [makeError([], 'not_found', '方块实例', '', '先解析出方块，再清空 UV')],
        };
    }

    var undo = (typeof Undo !== 'undefined' && Undo) ? Undo : null;
    if (undo && typeof undo.initEdit === 'function') undo.initEdit({ elements: list, uv_only: true });

    var clearedFaces = 0;
    var refreshFailed = [];
    var perCube = [];

    list.forEach(function (cube) {
        var faces = 0;
        FACE_KEYS.forEach(function (key) {
            var face = cube.faces[key];
            if (!face) return;
            if (face.texture === null && isZeroUv(face.uv)) return;
            face.uv = [0, 0, 0, 0];
            face.texture = null;
            faces++;
        });
        clearedFaces += faces;
        perCube.push({ uuid: cube.uuid, name: cube.name, cleared_faces: faces });

        if (cube.preview_controller && typeof cube.preview_controller.updateFaces === 'function') {
            try {
                // 必须传方块本身：updateFaces(element) 直接从 element 上取 mesh。
                cube.preview_controller.updateFaces(cube);
            } catch (e) {
                refreshFailed.push({ uuid: cube.uuid, name: cube.name, error: e && e.message ? e.message : String(e) });
            }
        }
    });

    if (undo && typeof undo.finishEdit === 'function') undo.finishEdit('清空方块 UV');

    if (typeof Canvas !== 'undefined' && Canvas && typeof Canvas.updateSelectedFaces === 'function') {
        try {
            Canvas.updateSelectedFaces();
        } catch (e) {
            log.debug('updateSelectedFaces 失败（忽略）: ' + (e && e.message));
        }
    }

    if (refreshFailed.length) {
        log.warn('有方块的网格没有刷新：' + refreshFailed.map(function (f) { return f.name || f.uuid; }).join(', '));
    }

    return {
        ok: true,
        changed: clearedFaces > 0,
        cleared_faces: clearedFaces,
        cubes: perCube,
        refresh_failed: refreshFailed,
    };
}

module.exports = {
    clearCubeUv: clearCubeUv,
    resolveCubes: resolveCubes,
    _internals: { collectCubes: collectCubes, isZeroUv: isZeroUv, FACE_KEYS: FACE_KEYS },
};
