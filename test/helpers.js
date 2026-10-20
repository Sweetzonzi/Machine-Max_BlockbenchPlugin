'use strict';

// 测试夹具：构造一个最小但覆盖全部容器的内部配置树。
// 注意：这些对象模拟「decode 之后」的内部树，hit_boxes 的 key 是 UUID。

function deepClone(v) {
    return JSON.parse(JSON.stringify(v));
}

function createVariant(overrides) {
    var variant = {
        model: 'machine_max:model/hull',
        textures: { default: 'machine_max:textures/hull' },
        animations: '',
        tags: [],
        sub_parts: {
            'sub_part.machine_max.main': createSubPart(),
        },
    };
    return Object.assign(variant, overrides || {});
}

function createSubPart(overrides) {
    var sp = {
        start_bone: 'hull',
        end_bones: [],
        durability: 20,
        mass: 25,
        mass_center: '',
        projected_area: [-1, -1, -1],
        block_collision: 'true',
        collision_height: -1,
        climb_assist: false,
        hydro_priority: 0,
        hit_boxes: {
            '11111111-1111-1111-1111-111111111111': {
                id: 'part',
                type: 'box',
                material: 'machine_max:default',
                thickness: 1,
                condition: 'true',
                subsystem: '',
                overwrite: null,
            },
        },
        interact_boxes: {
            'interact.machine_max.door': {
                bone: 'hull',
                interact_mode: 'fast',
                condition: 'NOR',
                signal_targets: { door: ['local'] },
                _uuid: '11111111-1111-1111-1111-111111111111',
            },
        },
        connectors: {
            'connector.machine_max.hatch': {
                locator: 'hatch',
                definition: 'machine_max:hatch',
                signal_targets: {},
                signal_translations: {},
                power_target: '',
                internal: false,
                overwrite: null,
                _marker_uuid: '22222222-2222-2222-2222-222222222222',
            },
        },
        subsystems: {
            'subsystem.machine_max.engine': {
                type: 'machine_max:engine',
                definition: 'machine_max:engine',
                power_output: 'connector.machine_max.hatch',
                speed_outputs: {},
            },
        },
        hydrodynamics: {
            '': { scale: 1 },
        },
    };
    return Object.assign(sp, overrides || {});
}

function createPart(overrides) {
    var part = {
        icon: '',
        vehicle_durability_rate: 0.8,
        vehicle_damage_rate: 1,
        vehicle_damage_rate_destroyed: 0.1,
        functional_threshold: 0.3,
        share_durability: true,
        max_stack_size: 1,
        variants: {
            default: createVariant(),
        },
        element_markers: {
            default: {
                '11111111-1111-1111-1111-111111111111': {
                    type: 'sub_part',
                    config_ref: 'sub_part.machine_max.main',
                },
                '33333333-3333-3333-3333-333333333333': {
                    type: 'hit_box',
                    config_ref: 'sub_part.machine_max.main',
                },
                '22222222-2222-2222-2222-222222222222': {
                    type: 'connector',
                    config_ref: 'connector.machine_max.hatch',
                },
                '44444444-4444-4444-4444-444444444444': {
                    type: 'interact_box',
                    config_ref: 'interact.machine_max.door',
                },
            },
        },
    };
    return Object.assign(part, overrides || {});
}

function createConfig(overrides) {
    var config = {
        $schema_version: 4,
        namespace: 'machine_max',
        modelFile: '',
        parts: {
            hull: createPart(),
        },
        _uiState: {
            activeMode: 'part',
            activePartId: 'hull',
            activeVariantName: 'default',
        },
    };
    return Object.assign(config, overrides || {});
}

function makeBones(list) {
    return {
        findByName: function (name) {
            return list.filter(function (b) { return b.name === name; })[0] || null;
        },
        findByUuid: function (uuid) {
            return list.filter(function (b) { return b.uuid === uuid; })[0] || null;
        },
        findNameByUuid: function (uuid) {
            var b = list.filter(function (x) { return x.uuid === uuid; })[0];
            return b ? b.name : null;
        },
        listAll: function () { return list.slice(); },
    };
}

module.exports = {
    deepClone: deepClone,
    createVariant: createVariant,
    createSubPart: createSubPart,
    createPart: createPart,
    createConfig: createConfig,
    makeBones: makeBones,
};
