'use strict';

const { describe, test, expect } = require('bun:test');
const fit = require('../../src/services/icon_fit.js');

describe('icon_fit', () => {
    test('正交 fit：span / center / zoom', () => {
        const r = fit.computeFit(
            { min: [-1, -1, -1], max: [1, 1, 1] },
            { right: [1, 0, 0], up: [0, 1, 0], width: 512, height: 512, fill: 0.9 }
        );
        expect(r.spanRight).toBe(2);
        expect(r.spanUp).toBe(2);
        expect(r.center).toEqual([0, 0, 0]);
        expect(r.zoom).toBeCloseTo(5.76, 6);
    });

    test('方向 +Z 的 right/up 轴', () => {
        const b = fit.cameraBasis([0, 0, 1]);
        expect(b.right).toEqual([1, 0, 0]);
        expect(b.up).toEqual([0, 1, 0]);
    });

    test('方向与 up 平行时退化不产生 NaN', () => {
        const b = fit.cameraBasis([0, 1, 0]);
        expect(b.right.some(Number.isNaN)).toBe(false);
        expect(b.up.some(Number.isNaN)).toBe(false);
    });

    test('unionAabb / isEmptyAabb', () => {
        expect(fit.isEmptyAabb(null)).toBe(true);
        expect(fit.isEmptyAabb({ min: [1, 0, 0], max: [0, 0, 0] })).toBe(true);
        expect(fit.unionAabb([
            { min: [0, 0, 0], max: [1, 1, 1] },
            { min: [-1, 0, 0], max: [0, 2, 1] },
        ])).toEqual({ min: [-1, 0, 0], max: [1, 2, 1] });
    });

    test('fill 影响 zoom，非法 fill 回退 0.9', () => {
        const aabb = { min: [-1, -1, -1], max: [1, 1, 1] };
        const a = fit.computeFit(aabb, { right: [1, 0, 0], up: [0, 1, 0], fill: 0.86 });
        const b = fit.computeFit(aabb, { right: [1, 0, 0], up: [0, 1, 0], fill: 0 });
        expect(a.zoom).toBeLessThan(b.zoom);
        expect(b.fill).toBe(0.9);
    });
});
