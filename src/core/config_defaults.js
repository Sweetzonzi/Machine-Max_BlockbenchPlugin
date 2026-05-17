const CONFIG_VERSION = 4;

const PART_DEFAULTS = {
    icon: '',
    vehicle_durability_rate: 0.8,
    vehicle_damage_rate: 1.0,
    vehicle_damage_rate_destroyed: 0.1,
    functional_threshold: 0.3,
    share_durability: true,
    max_stack_size: 1,
    variants: {},
    element_markers: {},
};

const VARIANT_DEFAULTS = {
    model: '',
    textures: '',
    animations: null,
    tags: [],
    sub_parts: {},
};

const SUB_PART_DEFAULTS = {
    start_bone: '',
    end_bones: [],
    auto_end_bones: [],
    durability: 20.0,
    mass: 25.0,
    mass_center: 'mass_center',
    projected_area: [0, 0, 0],
    block_collision: 'true',
    collision_height: -1.0,
    climb_assist: false,
    hydro_priority: 0,
    hit_boxes: {},
    interact_boxes: {},
    connectors: {},
    subsystems: {},
    hydrodynamics: null,
};

const HIT_BOX_DEFAULTS = {
    id: 'part',
    type: 'box',
    material: '',
    thickness: 1.0,
    condition: 'true',
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG_VERSION,
        PART_DEFAULTS,
        VARIANT_DEFAULTS,
        SUB_PART_DEFAULTS,
        HIT_BOX_DEFAULTS,
    };
}
