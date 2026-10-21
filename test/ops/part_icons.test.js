'use strict';

const { describe, test, expect, beforeEach, afterEach } = require('bun:test');
const helpers = require('../helpers.js');
const ops = require('../../src/ops/index.js');

function installFakeUndo(config) {
    global.Project = { uuid: 'test-project', saved: true, machine_max_plugin: config };
    global.Undo = {
        history: [],
        index: 0,
        current_save: null,
        initEdit: function () { this.current_save = {}; },
        finishEdit: function (label) {
            this.history.push({ type: 'edit', action: label, time: Date.now() });
            this.index = this.history.length;
            this.current_save = null;
        },
        cancelEdit: function () {
            this.current_save = null;
        },
    };
}

function createTwoPartConfig() {
    const cfg = helpers.createConfig();
    cfg.parts.turret = helpers.createPart({
        icon: '',
        variants: { default: helpers.createVariant() },
    });
    cfg._uiState.activePartId = 'hull';
    return cfg;
}

beforeEach(() => {
    delete global.Project;
    delete global.Undo;
});

afterEach(() => {
    delete global.Project;
    delete global.Undo;
});

describe('ops.setPartIcons', () => {
    test('一次 runConfigEdit 写多个 icon，只产生一条撤销记录', () => {
        const cfg = createTwoPartConfig();
        installFakeUndo(cfg);

        const r = ops.setPartIcons(cfg, {
            icons: {
                hull: 'machine_max:textures/icon/2s38/2s38_hull.png',
                turret: 'machine_max:textures/icon/2s38/2s38_turret.png',
            },
        });

        expect(r.ok).toBe(true);
        expect(r.changed).toBe(true);
        expect(r.updated.sort()).toEqual(['hull', 'turret']);
        expect(cfg.parts.hull.icon).toBe('machine_max:textures/icon/2s38/2s38_hull.png');
        expect(cfg.parts.turret.icon).toBe('machine_max:textures/icon/2s38/2s38_turret.png');
        expect(global.Undo.history.length).toBe(1);
    });

    test('全部已是目标路径 → changed:false，不产生撤销记录', () => {
        const cfg = helpers.createConfig();
        cfg.parts.hull.icon = 'machine_max:textures/icon/2s38/2s38_hull.png';
        installFakeUndo(cfg);

        const r = ops.setPartIcons(cfg, {
            icons: { hull: 'machine_max:textures/icon/2s38/2s38_hull.png' },
        });

        expect(r.ok).toBe(true);
        expect(r.changed).toBe(false);
        expect(global.Undo.history.length).toBe(0);
    });

    test('混入非法路径 → 整批失败，不写半截', () => {
        const cfg = createTwoPartConfig();
        installFakeUndo(cfg);

        const r = ops.setPartIcons(cfg, {
            icons: {
                hull: 'machine_max:textures/icon/2s38/2s38_hull.png',
                turret: 'machine_max:textures/icon/../evil.png',
            },
        });

        expect(r.ok).toBe(false);
        expect(cfg.parts.hull.icon).toBe('');
        expect(cfg.parts.turret.icon).toBe('');
        expect(global.Undo.history.length).toBe(0);
    });

    test('外部 namespace / 不存在 part / 不安全 partId → 拒绝', () => {
        const cfg = createTwoPartConfig();
        installFakeUndo(cfg);

        expect(ops.setPartIcons(cfg, {
            icons: { hull: 'othermod:textures/icon/hull.png' },
        }).ok).toBe(false);

        expect(ops.setPartIcons(cfg, {
            icons: { missing: 'machine_max:textures/icon/missing/missing.png' },
        }).ok).toBe(false);

        expect(ops.setPartIcons(cfg, {
            icons: { '../hull': 'machine_max:textures/icon/hull/hull.png' },
        }).ok).toBe(false);

        expect(global.Undo.history.length).toBe(0);
    });

    test('只改有变化的条目，但仍只有一条撤销记录', () => {
        const cfg = createTwoPartConfig();
        cfg.parts.hull.icon = 'machine_max:textures/icon/2s38/2s38_hull.png';
        installFakeUndo(cfg);

        const r = ops.setPartIcons(cfg, {
            icons: {
                hull: 'machine_max:textures/icon/2s38/2s38_hull.png',
                turret: 'machine_max:textures/icon/2s38/2s38_turret.png',
            },
        });

        expect(r.ok).toBe(true);
        expect(r.updated).toEqual(['turret']);
        expect(global.Undo.history.length).toBe(1);
    });
});
