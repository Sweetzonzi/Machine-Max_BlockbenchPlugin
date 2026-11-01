'use strict';

// 清空方块 UV 的验收（碰撞几何不可见化）
//
// 判定口径：Blockbench 的 Bedrock 导出只在六个面都没有贴图时写 `"uv": {}`，
// 所以这里断言「六面 texture 均为 null 且 uv 归零」，并确认导出前的网格刷新
// 拿到的是方块本身（updateFaces(element) 内部从 element 取 mesh）。

const { describe, test, expect, beforeEach, afterEach } = require('bun:test');
const cubeUv = require('../../src/services/cube_uv.js');

const FACE_KEYS = ['north', 'east', 'south', 'west', 'up', 'down'];

function makeCube(options) {
    options = options || {};
    const cube = {
        uuid: options.uuid || ('uuid-' + Math.random().toString(36).slice(2, 8)),
        name: options.name || 'cube',
        faces: {},
        refreshed: 0,
        refreshArgs: [],
    };
    FACE_KEYS.forEach((key) => {
        cube.faces[key] = {
            uv: options.uv ? options.uv.slice() : [0, 0, 16, 16],
            texture: options.texture === undefined ? 0 : options.texture,
        };
    });
    cube.preview_controller = {
        updateFaces: function (element) {
            cube.refreshed++;
            cube.refreshArgs.push(element);
            // 真实实现从这里解构 element.mesh；传 undefined 会炸，所以记录参数。
        },
    };
    return cube;
}

function makeGroup(name, children) {
    return { uuid: 'group-' + name, name: name, children: children || [] };
}

let undoLog;

function installGlobals(cubes, selection) {
    undoLog = [];
    global.Cube = { all: cubes, selected: selection || [] };
    global.Outliner = { selected: selection || [] };
    global.Undo = {
        current_save: null,
        initEdit: function (aspects) {
            this.current_save = aspects;
            undoLog.push({ kind: 'init', aspects: aspects });
        },
        finishEdit: function (label) {
            undoLog.push({ kind: 'finish', label: label });
            this.current_save = null;
        },
        cancelEdit: function () {
            undoLog.push({ kind: 'cancel' });
            this.current_save = null;
        },
    };
    global.Canvas = { updateSelectedFaces: function () {} };
}

afterEach(() => {
    delete global.Cube;
    delete global.Outliner;
    delete global.Undo;
    delete global.Canvas;
});

describe('services/cube_uv.resolveCubes', () => {
    test('uuid 精确命中', () => {
        const cube = makeCube({ uuid: 'aaa' });
        installGlobals([cube]);
        const r = cubeUv.resolveCubes(['aaa']);
        expect(r.ok).toBe(true);
        expect(r.cubes.length).toBe(1);
        expect(r.cubes[0].uuid).toBe('aaa');
    });

    test('同名方块按歧义报错，要求给 uuid', () => {
        installGlobals([makeCube({ name: 'cube' }), makeCube({ name: 'cube' })]);
        const r = cubeUv.resolveCubes(['cube']);
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('ambiguous_name');
    });

    test('选择组时收集组里的方块', () => {
        const a = makeCube({ uuid: 'a' });
        const b = makeCube({ uuid: 'b' });
        const group = makeGroup('HitBox', [a, b]);
        installGlobals([a, b], [group]);
        const r = cubeUv.resolveCubes();
        expect(r.ok).toBe(true);
        expect(r.source).toBe('selection');
        expect(r.cubes.map((c) => c.uuid).sort()).toEqual(['a', 'b']);
    });

    test('没有选择也没有 ids 时失败', () => {
        installGlobals([], []);
        const r = cubeUv.resolveCubes([]);
        expect(r.ok).toBe(false);
        expect(r.errors[0].code).toBe('not_found');
    });
});

describe('services/cube_uv.clearCubeUv', () => {
    test('六面 texture 置 null、uv 归零，并用方块本身刷新网格', () => {
        const cube = makeCube({ uuid: 'aaa' });
        installGlobals([cube], [cube]);
        const r = cubeUv.clearCubeUv([cube]);

        expect(r.ok).toBe(true);
        expect(r.changed).toBe(true);
        expect(r.cleared_faces).toBe(6);
        FACE_KEYS.forEach((key) => {
            expect(cube.faces[key].texture).toBe(null);
            expect(cube.faces[key].uv).toEqual([0, 0, 0, 0]);
        });
        expect(cube.refreshed).toBe(1);
        expect(cube.refreshArgs[0]).toBe(cube);
        expect(r.refresh_failed).toEqual([]);
    });

    test('走原生 uv_only 撤销记录，标签可读', () => {
        const cube = makeCube({ uuid: 'aaa' });
        installGlobals([cube], [cube]);
        cubeUv.clearCubeUv([cube]);

        expect(undoLog[0].kind).toBe('init');
        expect(undoLog[0].aspects.elements).toContain(cube);
        expect(undoLog[0].aspects.uv_only).toBe(true);
        expect(undoLog[undoLog.length - 1].kind).toBe('finish');
        expect(undoLog[undoLog.length - 1].label).toBe('清空方块 UV');
    });

    test('重复调用幂等：第二次不再改动面数', () => {
        const cube = makeCube({ uuid: 'aaa' });
        installGlobals([cube], [cube]);
        cubeUv.clearCubeUv([cube]);
        const again = cubeUv.clearCubeUv([cube]);

        expect(again.ok).toBe(true);
        expect(again.changed).toBe(false);
        expect(again.cleared_faces).toBe(0);
    });

    test('网格刷新抛错时记录失败但不中断其它方块', () => {
        const broken = makeCube({ uuid: 'broken' });
        broken.preview_controller.updateFaces = function () { throw new Error('boom'); };
        const good = makeCube({ uuid: 'good' });
        installGlobals([broken, good], [broken, good]);

        const r = cubeUv.clearCubeUv([broken, good]);
        expect(r.ok).toBe(true);
        expect(r.refresh_failed.length).toBe(1);
        expect(r.refresh_failed[0].uuid).toBe('broken');
        expect(good.faces.north.texture).toBe(null);
        expect(good.refreshed).toBe(1);
    });
});
