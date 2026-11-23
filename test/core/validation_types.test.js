'use strict';

const { describe, test, expect, afterAll } = require('bun:test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
    matchesField,
    filterFieldIssues,
    resolveIssueLevel,
} = require('../../src/core/validation_types.js');
const helpers = require('../helpers.js');
const { collectIssues } = require('../../src/services/validate.js');
const cpm = require('../../src/core/content_pack_manager.js');

function problem(field, severity) {
    return {
        severity: severity || 'error',
        code: 'test',
        message: field + ' 有问题',
        path: { scope: 'subsystem', partId: 'hull', variantName: 'default', field: field },
    };
}

describe('core/validation_types 字段匹配', () => {
    test('顶层字段精确匹配', () => {
        expect(matchesField(problem('definition'), 'definition')).toBe(true);
        expect(matchesField(problem('definition'), 'power_output')).toBe(false);
    });

    test('嵌套字段归到顶层字段（signal_targets.engine_speed.0）', () => {
        const p = problem('signal_targets.engine_speed.0');
        expect(matchesField(p, 'signal_targets')).toBe(true);
        expect(matchesField(p, 'signal_target')).toBe(false);
    });

    test('空 field / 非字符串不匹配任何字段', () => {
        expect(matchesField(problem(''), 'definition')).toBe(false);
        expect(matchesField({ path: { field: null } }, 'definition')).toBe(false);
        expect(matchesField(null, 'definition')).toBe(false);
    });

    test('filterFieldIssues 只保留命中字段，并保持原顺序', () => {
        const list = [
            problem('definition'),
            problem('signal_targets.engine_speed.0'),
            problem('power_output'),
            problem('signal_targets.brake.1', 'warning'),
        ];
        const picked = filterFieldIssues(list, 'signal_targets');
        expect(picked.length).toBe(2);
        expect(picked[0].path.field).toBe('signal_targets.engine_speed.0');
        expect(picked[1].severity).toBe('warning');
        expect(resolveIssueLevel(picked)).toBe('error');
    });

    test('空列表 / 无字段时安全返回', () => {
        expect(filterFieldIssues(null, 'definition')).toEqual([]);
        expect(filterFieldIssues([problem('definition')], '')).toEqual([]);
    });

    test('collectIssues 的子系统 definition 问题带 field=definition，可被面板命中', () => {
        const cfg = helpers.createConfig();
        cfg.parts.hull.variants.default.sub_parts['sub_part.machine_max.main']
            .subsystems['subsystem.machine_max.engine'].definition = '';
        global.Group = function Group() {};
        global.Group.all = [
            { uuid: '11111111-1111-1111-1111-111111111111', name: 'hull', parent: null },
            { uuid: '33333333-3333-3333-3333-333333333333', name: 'hitbox', parent: null },
            { uuid: '44444444-4444-4444-4444-444444444444', name: 'door', parent: null },
        ];
        global.Locator = {
            all: [
                { uuid: '22222222-2222-2222-2222-222222222222', name: 'hatch', parent: null },
            ],
        };
        try {
            const issues = collectIssues(cfg);
            const p = issues.find(function (x) {
                return x.code === 'definition_required'
                    && x.path.itemKey === 'subsystem.machine_max.engine';
            });
            expect(p).toBeTruthy();
            expect(p.path.scope).toBe('subsystem');
            expect(p.path.field).toBe('definition');
            expect(filterFieldIssues([p], 'definition')).toEqual([p]);
            expect(filterFieldIssues([p], 'power_output')).toEqual([]);
        } finally {
            delete global.Group;
            delete global.Locator;
        }
    });
});

describe('collectIssues：已退役 / 未知的子系统类型', () => {
    const SP_KEY = 'sub_part.machine_max.main';

    function configWith(subsystem) {
        const cfg = helpers.createConfig();
        cfg.parts.hull.variants.default.sub_parts[SP_KEY]
            .subsystems['subsystem.machine_max.loader'] = subsystem;
        return cfg;
    }

    function findTypeIssue(issues) {
        return issues.find(function (p) { return p.code === 'subsystem_type_unknown'; });
    }

    test('已退役类型：报错并指出拆分后的两个替代类型', () => {
        const issues = collectIssues(configWith({
            type: 'machine_max:regen_loader',
            definition: 'machine_max:regen_loader/standard',
            projectile_types: {},
            discovery_outputs: {},
        }));
        const p = findTypeIssue(issues);
        expect(p).toBeTruthy();
        expect(p.severity).toBe('error');
        expect(p.message).toContain('machine_max:regen_loader');
        expect(p.message).toContain('已退役');
        expect(p.message).toContain('machine_max:regen_ammo_rack');
        expect(p.message).toContain('machine_max:ammo_loader');
        expect(p.path.scope).toBe('subsystem');
        expect(p.path.itemKey).toBe('subsystem.machine_max.loader');
        expect(p.path.subPartKey).toBe(SP_KEY);
    });

    test('拼写错误 / 更新版本的类型：按未知类型报，不冒充退役说明', () => {
        const p = findTypeIssue(collectIssues(configWith({
            type: 'machine_max:regen_loader_typo',
            definition: '',
        })));
        expect(p).toBeTruthy();
        expect(p.message).toContain('不是本插件支持的子系统类型');
        expect(p.message).not.toContain('已退役');
    });

    test('已登记类型不触发该问题', () => {
        const issues = collectIssues(configWith({
            type: 'machine_max:ammo_loader',
            definition: '',
            ammo_discovery_inputs: [],
            ammo_discovery_targets: {},
        }));
        expect(findTypeIssue(issues)).toBeUndefined();
    });
});

describe('collectIssues：驱动连接点必须是 Advanced', () => {
    const SP_KEY = 'sub_part.machine_max.main';
    const TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'mm-advanced-'));

    /** 建一个只含连接点与关节执行器型号的最小内容包 */
    function makePack() {
        const root = path.join(TMP_ROOT, 'pack');
        const write = (rel, data) => {
            const file = path.join(root, 'machine_max', rel);
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, JSON.stringify(data), 'utf-8');
        };
        fs.mkdirSync(root, { recursive: true });
        fs.writeFileSync(path.join(root, 'meta.json'),
            JSON.stringify({ id: 'machine_max:advanced_test', version: '1.0' }), 'utf-8');
        write('connectors/hinge_simple.json', { type: 'Simple', direction: 'yp' });
        write('connectors/hinge_advanced.json', { type: 'Advanced', direction: 'yp' });
        write('subsystems/joint_driver/rotation.json', {
            type: 'machine_max:joint_driver',
            axes: { YR: { max_force: 250, max_speed: 180 } },
        });
        return root;
    }

    function configWith(connectorDefId) {
        const cfg = helpers.createConfig({ contentPackPath: makePack() });
        const sp = cfg.parts.hull.variants.default.sub_parts[SP_KEY];
        sp.connectors['connector.machine_max.hinge'] = {
            locator: 'hinge',
            definition: connectorDefId,
            signal_targets: {},
            signal_translations: {},
            power_target: '',
            internal: false,
            overwrite: null,
        };
        sp.subsystems['subsystem.machine_max.door_driver'] = {
            type: 'machine_max:joint_driver',
            definition: 'machine_max:rotation',
            connector: 'connector.machine_max.hinge',
        };
        cpm.invalidateCache();
        return cfg;
    }

    function issuesOfCode(cfg) {
        return collectIssues(cfg).filter(function (p) {
            return p.code === 'subsystem_connector_not_advanced';
        });
    }

    test('Simple 连接点报 error，指向 connector 字段', () => {
        const issues = issuesOfCode(configWith('machine_max:hinge_simple'));
        expect(issues).toHaveLength(1);
        expect(issues[0].severity).toBe('error');
        expect(issues[0].message).toContain('hinge_simple');
        expect(issues[0].path.scope).toBe('subsystem');
        expect(issues[0].path.itemKey).toBe('subsystem.machine_max.door_driver');
        expect(issues[0].path.field).toBe('connector');
    });

    test('Advanced 连接点不报', () => {
        expect(issuesOfCode(configWith('machine_max:hinge_advanced'))).toHaveLength(0);
    });

    afterAll(() => {
        try {
            fs.rmSync(TMP_ROOT, { recursive: true, force: true });
        } catch (e) {
            // 忽略临时目录清理失败
        }
    });
});

describe('collectIssues：交互区门控表达式的旧枚举值', () => {
    const SP_KEY = 'sub_part.machine_max.main';
    const IB_KEY = 'interact.machine_max.door';

    function configWithCondition(condition) {
        const cfg = helpers.createConfig();
        const ib = cfg.parts.hull.variants.default.sub_parts[SP_KEY].interact_boxes[IB_KEY];
        ib.condition = condition;
        return cfg;
    }

    function conditionIssues(cfg) {
        return collectIssues(cfg).filter(function (p) {
            return p.code === 'interact_box_condition_legacy_enum';
        });
    }

    test('旧逻辑枚举（NOR 等）报 warning 并指向 condition 字段', () => {
        const issues = conditionIssues(configWithCondition('NOR'));
        expect(issues).toHaveLength(1);
        expect(issues[0].severity).toBe('warning');
        expect(issues[0].message).toContain('NOR');
        expect(issues[0].message).toContain('MoLang');
        expect(issues[0].path.field).toBe('condition');
        expect(issues[0].path.scope).toBe('interact_box');
        expect(issues[0].path.itemKey).toBe(IB_KEY);
        expect(issues[0].path.subPartKey).toBe(SP_KEY);
    });

    test('六个旧枚举字面量都报，不是只认 NOR', () => {
        for (const token of ['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR']) {
            expect(conditionIssues(configWithCondition(token))).toHaveLength(1);
        }
    });

    test('默认 true / 表达式 / 空串都不报（插件不执行 MoLang，不猜对错）', () => {
        for (const condition of ['true', '', "local.subsystem_active('subsystem.machine_max.engine') == 0"]) {
            expect(conditionIssues(configWithCondition(condition))).toHaveLength(0);
        }
    });
});

describe('collectIssues：视点发现表（camera_discovery_targets）', () => {
    const SP_KEY = 'sub_part.machine_max.main';
    const WC_KEY = 'subsystem.machine_max.wc';

    /** 在默认子零件上挂一个武器控制器，发现表由参数给出 */
    function configWithDiscovery(table) {
        const cfg = helpers.createConfig();
        const sp = cfg.parts.hull.variants.default.sub_parts[SP_KEY];
        sp.subsystems[WC_KEY] = {
            type: 'machine_max:weapon_controller',
            definition: 'machine_max:basic_weapon_controller',
            control_outputs: {},
            camera_discovery_targets: table,
            first_hud_layout: 'machine_max:empty',
            third_hud_layout: 'machine_max:empty',
            scope_hud_layout: 'machine_max:empty',
        };
        return cfg;
    }

    function issuesOfCode(cfg, code) {
        return collectIssues(cfg).filter(function (p) { return p.code === code; });
    }

    test('频道写成 camera_sight 报 warning（等于全车所有视点）', () => {
        const issues = issuesOfCode(configWithDiscovery({ camera_sight: ['global'] }),
            'viewpoint_discovery_default_channel');
        expect(issues).toHaveLength(1);
        expect(issues[0].severity).toBe('warning');
        expect(issues[0].path.field).toBe('camera_discovery_targets');
        expect(issues[0].path.itemKey).toBe(WC_KEY);
        expect(issues[0].message).toContain('camera_sight');
    });

    test('具名目标不是 camera / sight 报 warning（发现结果只留视点）', () => {
        const issues = issuesOfCode(
            configWithDiscovery({ gunner_sight: ['subsystem.machine_max.engine'] }),
            'viewpoint_discovery_not_viewpoint');
        expect(issues).toHaveLength(1);
        expect(issues[0].severity).toBe('warning');
        expect(issues[0].message).toContain('machine_max:engine');
    });

    test('正常写法（视点子系统 / local / global）不报', () => {
        const cfg = configWithDiscovery({ gunner_sight: ['subsystem.machine_max.sight', 'global'] });
        const sp = cfg.parts.hull.variants.default.sub_parts[SP_KEY];
        sp.subsystems['subsystem.machine_max.sight'] = {
            type: 'machine_max:sight',
            definition: 'machine_max:gunner_sight',
            locator: '',
        };
        const codes = collectIssues(cfg).map(function (p) { return p.code; });
        expect(codes).not.toContain('viewpoint_discovery_default_channel');
        expect(codes).not.toContain('viewpoint_discovery_not_viewpoint');
    });

    test('目标不存在仍由 dangling_signal_target 报 error，不重复报发现类问题', () => {
        const cfg = configWithDiscovery({ gunner_sight: ['subsystem.machine_max.missing'] });
        const codes = collectIssues(cfg).map(function (p) { return p.code; });
        expect(codes).toContain('dangling_signal_target');
        expect(codes).not.toContain('viewpoint_discovery_not_viewpoint');
    });
});
