'use strict';

const { describe, test, expect } = require('bun:test');
const ip = require('../../src/services/icon_paths.js');

const NS = 'machine_max';

describe('icon_paths.resolveTarget', () => {
    test('空 icon 使用 partId 前缀目录', () => {
        expect(ip.defaultPartTarget({ namespace: NS, partId: '2s38_hull' }))
            .toBe('machine_max:textures/icon/2s38/2s38_hull.png');
        expect(ip.defaultPartTarget({ namespace: NS, partId: '2s38_hull', folder: 'vehicles' }))
            .toBe('machine_max:textures/icon/vehicles/2s38_hull.png');
    });

    test('已有本包 icon 沿用原路径', () => {
        const r = ip.resolveTarget({
            namespace: NS,
            kind: 'part',
            partId: '2s38_hull',
            icon: 'machine_max:textures/icon/custom/hull.png',
        });
        expect(r.ok).toBe(true);
        expect(r.target).toBe('machine_max:textures/icon/custom/hull.png');
        expect(r.iconState).toBe('in_pack');
    });

    test('外部 namespace / 非 icon 路径走默认路径', () => {
        const byExternal = ip.resolveTarget({
            namespace: NS, kind: 'part', partId: 'hull',
            icon: 'othermod:textures/icon/x.png',
        });
        expect(byExternal.ok).toBe(true);
        expect(byExternal.target).toBe('machine_max:textures/icon/hull/hull.png');
        expect(byExternal.iconState).toBe('external');

        const byNonIcon = ip.resolveTarget({
            namespace: NS, kind: 'part', partId: 'hull',
            icon: 'machine_max:textures/part/hull.png',
        });
        expect(byNonIcon.iconState).toBe('external');
    });

    test('本包 icon 中的 .. 被判为 invalid，不生成路径', () => {
        const r = ip.resolveTarget({
            namespace: NS, kind: 'part', partId: 'hull',
            icon: 'machine_max:textures/icon/../evil.png',
        });
        expect(r.ok).toBe(false);
        expect(r.iconState).toBe('invalid');
    });

    test('装配体与零件路径碰撞时改 _assembly', () => {
        const r = ip.resolveTarget({
            namespace: NS, kind: 'assembly', name: 'mtlb',
            reservedPaths: ['machine_max:textures/icon/mtlb/mtlb.png'],
        });
        expect(r.ok).toBe(true);
        expect(r.target).toBe('machine_max:textures/icon/mtlb/mtlb_assembly.png');
        expect(r.collision).toBe(true);
    });

    test('装配体名/目录 sanitize 为小写资源路径', () => {
        expect(ip.defaultAssemblyTarget({ namespace: NS, name: '2S38 Vehicles' }))
            .toBe('machine_max:textures/icon/2s38/2s38_vehicles.png');
        expect(ip.defaultAssemblyTarget({ namespace: NS, name: 'sdkfz234_2' }))
            .toBe('machine_max:textures/icon/sdkfz234/sdkfz234_2.png');
    });
});

describe('icon_paths.planIcon', () => {
    test('空 icon + 目标不存在 → created/write/set', () => {
        const r = ip.planIcon({
            kind: 'part', namespace: NS, icon: '',
            target: 'machine_max:textures/icon/2s38/2s38_hull.png',
            targetExists: false, overwrite: false,
        });
        expect(r.status).toBe('created');
        expect(r.fileAction).toBe('write');
        expect(r.fieldAction).toBe('set');
        expect(r.fieldChanged).toBe(true);
    });

    test('空 icon + 目标已存在 + 不覆盖 → linked，不写盘但设字段', () => {
        const r = ip.planIcon({
            kind: 'part', namespace: NS, icon: '',
            target: 'machine_max:textures/icon/2s38/2s38_hull.png',
            targetExists: true, overwrite: false,
        });
        expect(r.status).toBe('linked');
        expect(r.fileAction).toBe('none');
        expect(r.fieldAction).toBe('set');
        expect(r.fieldChanged).toBe(true);
    });

    test('空 icon + 目标已存在 + 覆盖 → created，重写文件', () => {
        const r = ip.planIcon({
            kind: 'part', namespace: NS, icon: '',
            target: 'machine_max:textures/icon/2s38/2s38_hull.png',
            targetExists: true, overwrite: true,
        });
        expect(r.status).toBe('created');
        expect(r.fileAction).toBe('write');
        expect(r.fieldChanged).toBe(true);
    });

    test('本包已有路径 + 不覆盖 → skipped，不改字段', () => {
        const r = ip.planIcon({
            kind: 'part', namespace: NS,
            icon: 'machine_max:textures/icon/2s38/2s38_hull.png',
            target: 'machine_max:textures/icon/2s38/2s38_hull.png',
            targetExists: true, overwrite: false,
        });
        expect(r.status).toBe('skipped');
        expect(r.fileAction).toBe('skip');
        expect(r.fieldChanged).toBe(false);
    });

    test('外部引用默认只写文件不改字段 → unrewritten', () => {
        const r = ip.planIcon({
            kind: 'part', namespace: NS,
            icon: 'minecraft:missingno',
            target: 'machine_max:textures/icon/hull/hull.png',
            targetExists: false, overwrite: false, rewriteExternalIcon: false,
        });
        expect(r.status).toBe('unrewritten');
        expect(r.fileAction).toBe('write');
        expect(r.fieldChanged).toBe(false);
    });

    test('外部引用 + 改写 + 目标已存在 + 不覆盖 → linked 并改字段', () => {
        const r = ip.planIcon({
            kind: 'part', namespace: NS,
            icon: 'minecraft:missingno',
            target: 'machine_max:textures/icon/hull/hull.png',
            targetExists: true, overwrite: false, rewriteExternalIcon: true,
        });
        expect(r.status).toBe('linked');
        expect(r.fileAction).toBe('none');
        expect(r.fieldChanged).toBe(true);
    });

    test('装配体：目标已存在不覆盖 → skipped；否则 created/overwritten', () => {
        expect(ip.planIcon({
            kind: 'assembly', namespace: NS, target: 'machine_max:textures/icon/k17/k17.png',
            targetExists: true, overwrite: false,
        }).status).toBe('skipped');
        expect(ip.planIcon({
            kind: 'assembly', namespace: NS, target: 'machine_max:textures/icon/k17/k17.png',
            targetExists: false, overwrite: false,
        }).status).toBe('created');
        expect(ip.planIcon({
            kind: 'assembly', namespace: NS, target: 'machine_max:textures/icon/k17/k17.png',
            targetExists: true, overwrite: true,
        }).status).toBe('overwritten');
    });
});
