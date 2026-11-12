'use strict';

// 模块化子系统的模块清单（subsystem_types.modules）与碰撞箱 module 的校验。
// 上游契约：Java 端各模块化子系统的 defineModules()；碰撞箱按 module 决定伤害落到哪个模块。

const { describe, test, expect, beforeEach } = require('bun:test');
const ssTypes = require('../../src/core/subsystem_types.js');
const helpers = require('../helpers.js');
const mock = require('../mocks/blockbench.js');
const { collectIssues } = require('../../src/services/validate.js');

beforeEach(() => {
    mock.installBones([]);
});

/**
 * 在默认子零件上再挂一个子系统实例，并把默认碰撞箱指向它。
 * @param {string} typeId - 子系统类型 ID
 * @param {string} moduleName - 碰撞箱的 module 取值
 * @param {Object} [extraFields] - 该类型必填的其余动态字段
 */
function configWithHitBox(typeId, moduleName, extraFields) {
    const cfg = helpers.createConfig();
    const sp = cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
    sp.subsystems['subsystem.machine_max.lower'] = Object.assign({
        type: typeId,
        definition: typeId,
    }, extraFields || {});
    const hitBox = sp.hit_boxes['11111111-1111-1111-1111-111111111111'];
    hitBox.subsystem = 'subsystem.machine_max.lower';
    hitBox.module = moduleName;
    return cfg;
}

/** 发射器实例的必填动态字段 */
const LAUNCHER_FIELDS = { locator: 'lower_launch_point' };

/** 取某条 code 的问题列表 */
function issuesOfCode(cfg, code) {
    return collectIssues(cfg).filter((x) => x.code === code);
}

describe('模块化子系统的模块清单', () => {
    test('弹药架与自动装弹机不是模块化类型：耐久不按模块拆分', () => {
        for (const type of ['machine_max:regen_ammo_rack', 'machine_max:ammo_rack', 'machine_max:ammo_loader']) {
            expect(ssTypes.getModules(type)).toEqual([]);
            expect(ssTypes.getModuleNames(type)).toEqual([]);
        }
    });

    test('发射器：炮管/炮闩固定，电容可选', () => {
        const modules = ssTypes.getModules('machine_max:launcher');
        expect(modules.map((m) => m.name)).toEqual(['barrel', 'breech', 'capacitor']);
        expect(modules.find((m) => m.name === 'breech').critical).toBe(true);
        expect(modules.filter((m) => m.critical).length).toBe(1);
        expect(modules.find((m) => m.name === 'capacitor').optional).toBe(true);
        expect(modules.find((m) => m.name === 'barrel').optional).toBe(false);
    });

    test('非模块化类型没有模块清单', () => {
        expect(ssTypes.getModules('machine_max:engine')).toEqual([]);
        expect(ssTypes.getModuleNames('machine_max:engine')).toEqual([]);
        expect(ssTypes.getModules('machine_max:not_a_type')).toEqual([]);
        expect(ssTypes.hasModule('machine_max:launcher', 'barrel')).toBe(true);
        expect(ssTypes.hasModule('machine_max:launcher', 'radiator')).toBe(false);
        expect(ssTypes.hasModule('machine_max:engine', 'barrel')).toBe(false);
    });
});

describe('碰撞箱 module 校验', () => {
    test('命中已声明的模块不报问题', () => {
        const cfg = configWithHitBox('machine_max:launcher', 'breech', LAUNCHER_FIELDS);
        expect(issuesOfCode(cfg, 'hit_box_module_unknown')).toEqual([]);
        expect(issuesOfCode(cfg, 'hit_box_module_without_subsystem')).toEqual([]);
    });

    test('模块名不在该类型的清单里：warning 并列出可用模块', () => {
        const cfg = configWithHitBox('machine_max:launcher', 'radiator', LAUNCHER_FIELDS);
        const issues = issuesOfCode(cfg, 'hit_box_module_unknown');
        expect(issues.length).toBe(1);
        expect(issues[0].severity).toBe('warning');
        expect(issues[0].message).toContain('发射器');
        expect(issues[0].message).toContain('barrel / breech / capacitor');
        expect(issues[0].path.scope).toBe('hit_box');
        expect(issues[0].path.field).toBe('module');
    });

    test('子系统类型没有模块划分：warning 说明模块名会被忽略', () => {
        const cfg = configWithHitBox('machine_max:engine', 'barrel', { power_output: 'engine_control' });
        const issues = issuesOfCode(cfg, 'hit_box_module_unknown');
        expect(issues.length).toBe(1);
        expect(issues[0].message).toContain('没有模块划分');
        expect(issues[0].message).toContain('barrel');
    });

    test('填了模块名却没关联子系统：单独一条 warning', () => {
        const cfg = helpers.createConfig();
        const sp = cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main'];
        sp.hit_boxes['11111111-1111-1111-1111-111111111111'].module = 'magazine';
        const issues = issuesOfCode(cfg, 'hit_box_module_without_subsystem');
        expect(issues.length).toBe(1);
        expect(issues[0].severity).toBe('warning');
        expect(issues[0].path.field).toBe('module');
        expect(issuesOfCode(cfg, 'hit_box_module_unknown')).toEqual([]);
    });

    test('空模块名不产生任何模块相关问题', () => {
        const cfg = helpers.createConfig();
        expect(issuesOfCode(cfg, 'hit_box_module_unknown')).toEqual([]);
        expect(issuesOfCode(cfg, 'hit_box_module_without_subsystem')).toEqual([]);
    });
});
