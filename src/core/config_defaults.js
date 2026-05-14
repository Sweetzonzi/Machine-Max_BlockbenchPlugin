const CONFIG_VERSION = 3;

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

const CONNECTOR_DEF_DEFAULTS = {
    type: 'Simple',
    direction: 'yp',
    integrity: 20.0,
    damage_reduction: 2.0,
    damage_multiplier: 1.5,
    damage_absorption: 0.2,
    collide_between: false,
    required_tags: [],
    accepted_tags: [],
    rejected_tags: [],
    joints: [],
};

const SUBSYSTEM_DEF_DEFAULTS = {
    type: 'machine_max:basic',
    basic_durability: 20.0,
    pass_damage: true,
    limit_damage: false,
    hidden: false,
    destroy_sound_event: null,
    activate_sound_event: null,
    deactivate_sound_event: null,
};

const MATERIAL_DEF_DEFAULTS = {
    friction: 0.5,
    restitution: 0.3,
    density: 1.0,
    armor_thickness: 1.0,
    armor_toughness: 0.0,
    hit_sound: null,
    break_sound: null,
    particle: null,
};

const PROJECTILE_DEFAULTS = {
    type: 'point',
    mass: 1.0,
    gravity_factor: 1.0,
    drag_factor: 0,
    radius: 0.05,
    base_velocity: 100.0,
    base_penetration: 10.0,
    base_damage: 10.0,
    base_accuracy_mil: 5.0,
    penetration_velocity_coefficient: 1.0,
    damage_velocity_coefficient: 1.0,
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG_VERSION,
        PART_DEFAULTS,
        VARIANT_DEFAULTS,
        SUB_PART_DEFAULTS,
        CONNECTOR_DEF_DEFAULTS,
        SUBSYSTEM_DEF_DEFAULTS,
        MATERIAL_DEF_DEFAULTS,
        PROJECTILE_DEFAULTS,
    };
}
