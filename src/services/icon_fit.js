// 文件: src/services/icon_fit.js
// 用途: AABB / 相机 right-up 轴 → 正交 zoom、target
// 所属模块: MachineMax Blockbench 插件
//
// 纯函数：只做数组数学，不 require THREE / Blockbench / fs。

'use strict';

function vec(value, fallback) {
    if (!Array.isArray(value) || value.length < 3) return (fallback || [0, 0, 0]).slice();
    return [Number(value[0]) || 0, Number(value[1]) || 0, Number(value[2]) || 0];
}

function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function scale(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}
function length(a) { return Math.sqrt(dot(a, a)); }
function normalize(a) {
    var len = length(a);
    if (!len || !isFinite(len)) return [0, 1, 0];
    return [a[0] / len, a[1] / len, a[2] / len];
}

function normalizeDirection(direction) {
    var raw = vec(direction, [1, 1, 1]);
    if (length(raw) < 1e-8) return [1, 1, 1];
    return normalize(raw);
}

/**
 * 由“相机相对 target 的偏移方向”求屏幕 right / up 轴。
 * right = normalize(cross(worldUp, dir))；up = normalize(cross(right, -dir))。
 * dir 与 worldUp 平行时退化为从 +Z 看。
 */
function cameraBasis(direction) {
    var dir = normalizeDirection(direction);
    var worldUp = [0, 1, 0];
    if (Math.abs(dot(dir, worldUp)) > 0.999) worldUp = [0, 0, 1];
    var right = normalize(cross(worldUp, dir));
    var up = normalize(cross(right, scale(dir, -1)));
    return { direction: dir, right: right, up: up };
}

function aabbCorners(aabb) {
    var min = vec(aabb && aabb.min);
    var max = vec(aabb && aabb.max);
    var out = [];
    for (var i = 0; i < 8; i++) {
        out.push([
            (i & 1) ? max[0] : min[0],
            (i & 2) ? max[1] : min[1],
            (i & 4) ? max[2] : min[2],
        ]);
    }
    return out;
}

function spanAlong(aabb, axis) {
    var axisN = normalize(vec(axis, [1, 0, 0]));
    var corners = aabbCorners(aabb);
    var min = Infinity;
    var max = -Infinity;
    for (var i = 0; i < corners.length; i++) {
        var value = dot(corners[i], axisN);
        if (value < min) min = value;
        if (value > max) max = value;
    }
    return Math.max(max - min, 0);
}

function centerOf(aabb) {
    var min = vec(aabb && aabb.min);
    var max = vec(aabb && aabb.max);
    return [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
}

function isEmptyAabb(aabb) {
    if (!aabb || !Array.isArray(aabb.min) || !Array.isArray(aabb.max)) return true;
    for (var i = 0; i < 3; i++) {
        if (!isFinite(Number(aabb.min[i])) || !isFinite(Number(aabb.max[i]))) return true;
        if (Number(aabb.min[i]) > Number(aabb.max[i])) return true;
    }
    return false;
}

function unionAabb(list) {
    var min = [Infinity, Infinity, Infinity];
    var max = [-Infinity, -Infinity, -Infinity];
    var has = false;
    (list || []).forEach(function (aabb) {
        if (isEmptyAabb(aabb)) return;
        has = true;
        for (var i = 0; i < 3; i++) {
            min[i] = Math.min(min[i], Number(aabb.min[i]));
            max[i] = Math.max(max[i], Number(aabb.max[i]));
        }
    });
    return has ? { min: min, max: max } : null;
}

/**
 * 计算单张图的取景。
 *
 * @param {{min:number[],max:number[]}} aabb
 * @param {{
 *   right?:number[], up?:number[], direction?:number[],
 *   width?:number, height?:number, fill?:number
 * }} [options]
 * @returns {{
 *   center:number[], target:number[], right:number[], up:number[],
 *   spanRight:number, spanUp:number, zoom:number, fill:number
 * }}
 */
function computeFit(aabb, options) {
    options = options || {};
    var basis = (options.right && options.up)
        ? { right: normalize(vec(options.right, [1, 0, 0])), up: normalize(vec(options.up, [0, 1, 0])) }
        : cameraBasis(options.direction || [1, 1, 1]);
    var width = Number(options.width) > 0 ? Number(options.width) : 512;
    var height = Number(options.height) > 0 ? Number(options.height) : 512;
    var fill = Number(options.fill);
    if (!isFinite(fill) || fill <= 0) fill = 0.9;
    fill = Math.max(0.05, Math.min(1.5, fill));

    var spanRight = spanAlong(aabb, basis.right);
    var spanUp = spanAlong(aabb, basis.up);
    var zoom = fill * Math.min(
        width / (40 * Math.max(spanRight, 1e-6)),
        height / (40 * Math.max(spanUp, 1e-6))
    );
    var center = centerOf(aabb);
    return {
        center: center,
        target: center.slice(),
        right: basis.right,
        up: basis.up,
        spanRight: spanRight,
        spanUp: spanUp,
        zoom: zoom,
        fill: fill,
    };
}

module.exports = {
    vec: vec,
    add: add,
    sub: sub,
    scale: scale,
    dot: dot,
    cross: cross,
    length: length,
    normalize: normalize,
    normalizeDirection: normalizeDirection,
    cameraBasis: cameraBasis,
    aabbCorners: aabbCorners,
    spanAlong: spanAlong,
    centerOf: centerOf,
    isEmptyAabb: isEmptyAabb,
    unionAabb: unionAabb,
    computeFit: computeFit,
};
