'use strict';

// 工程加载的宽容解码（doc/load.js）。
//
// 契约：结构非法的工程必须还能打开 —— 好条目照常拿到默认值，坏条目原样保留，
// 非法值交给校验报、由导出闸门拦。这里固定的是「保留什么、剥离什么、报告什么」，
// 不是某个具体字段的默认值。

const { describe, test, expect } = require('bun:test');
const helpers = require('../helpers.js');
const docLoad = require('../../src/doc/load.js');
const { PartLoadCodec } = require('../../src/codec/codecs/part_codec.js');

const SP = 'sub_part.machine_max.main';
const HB_UUID = '11111111-1111-1111-1111-111111111111';
const BAD_UUID = '55555555-5555-5555-5555-555555555555';

function part() {
    return helpers.createPart({ element_markers: {} });
}

function load(raw) {
    return docLoad.decodePart(raw, { partId: 'hull' });
}

function subPartOf(node) {
    return node.variants.default.sub_parts[SP];
}

describe('doc/load 宽容解码', () => {
    test('合法数据与严格加载等价', () => {
        const raw = part();
        const result = load(raw);
        expect(result.issues).toEqual([]);
        expect(result.node).toEqual(PartLoadCodec.decode(JSON.parse(JSON.stringify(raw))));
    });

    test('单变体简写不被当成变体名遍历，结果与严格加载一致', () => {
        const raw = {
            variants: {
                model: 'machine_max:model/hull',
                sub_parts: { 'sub_part.machine_max.main': { mass: 5 } },
            },
        };
        const result = load(raw);
        expect(result.issues).toEqual([]);
        expect(result.node).toEqual(PartLoadCodec.decode(JSON.parse(JSON.stringify(raw))));
        expect(result.node.variants.default.model).toBe('machine_max:model/hull');
    });

    test('子零件字段类型非法：该子零件整条保留，其它子零件照常补默认值', () => {
        const raw = part();
        raw.variants.default.sub_parts[SP].mass = '25';
        raw.variants.default.sub_parts['sub_part.machine_max.good'] = { mass: 10, hit_boxes: {} };

        const result = load(raw);
        const bad = subPartOf(result.node);
        const good = result.node.variants.default.sub_parts['sub_part.machine_max.good'];

        expect(bad.mass).toBe('25');
        expect(bad).toEqual(raw.variants.default.sub_parts[SP]);
        // 好条目仍然走完 codec：projected_area 拿到默认三元组
        expect(good.projected_area).toEqual([-1, -1, -1]);
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].code).toBe('load_decode_failed');
        expect(result.issues[0].kind).toBe('sub_part');
        expect(result.issues[0].path).toEqual([
            'parts', 'hull', 'variants', 'default', 'sub_parts', SP,
        ]);
    });

    test('坏碰撞箱条目原样保留，好条目照常解出', () => {
        const raw = part();
        raw.variants.default.sub_parts[SP].hit_boxes[BAD_UUID] = {
            id: 'part', type: 'box', material: 'machine_max:default', thickness: 'x',
        };

        const result = load(raw);
        const hitBoxes = subPartOf(result.node).hit_boxes;
        expect(hitBoxes[BAD_UUID].thickness).toBe('x');
        expect(hitBoxes[HB_UUID].lockable).toBe(false);        // HitBoxCodec 的默认值
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].kind).toBe('hit_box');
        expect(result.issues[0].path.slice(-2)).toEqual(['hit_boxes', BAD_UUID]);
    });

    test('容器不是对象：整块原样保留，零件其余字段照常解出', () => {
        const raw = part();
        raw.variants.default.sub_parts[SP].hit_boxes = [];

        const result = load(raw);
        expect(subPartOf(result.node).hit_boxes).toEqual([]);
        expect(subPartOf(result.node).mass).toBe(25);           // 默认值仍在
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].path.slice(-1)).toEqual(['hit_boxes']);
    });

    test('零件本身不是对象：原样返回并报告', () => {
        const result = load(42);
        expect(result.node).toBe(42);
        expect(result.issues[0].kind).toBe('part');
        expect(result.issues[0].path).toEqual(['parts', 'hull']);
    });

    test('已退役的子系统类型不算解码失败（沿用加载实例的保留语义）', () => {
        const raw = part();
        raw.variants.default.sub_parts[SP].subsystems['subsystem.machine_max.old'] = {
            type: 'machine_max:regen_loader',
            definition: 'machine_max:regen_loader/standard',
            projectile_types: {},
        };

        const result = load(raw);
        expect(result.issues).toEqual([]);
        expect(subPartOf(result.node).subsystems['subsystem.machine_max.old'].type)
            .toBe('machine_max:regen_loader');
    });

    test('element_markers 坏掉不影响零件解码', () => {
        const raw = part();
        raw.element_markers = 'oops';

        const result = load(raw);
        expect(result.node.element_markers).toBe('oops');
        expect(subPartOf(result.node).mass).toBe(25);
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].path).toEqual(['parts', 'hull', 'element_markers']);
    });
});
