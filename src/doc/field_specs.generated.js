'use strict';

/**
 * 本文件由 scripts/gen-field-specs.js 自动生成，不要手工编辑。
 * 数据源：src/builtin/builtin/machine_max/docs/en_us/schemas
 * 上游快照：Machine-Max@7629416b
 * 重新生成：node scripts/gen-field-specs.js
 * 漂移检查：node scripts/gen-field-specs.js --check
 */
const PROVENANCE = {
    "generator": "scripts/gen-field-specs.js",
    "generator_version": 1,
    "source_locale": "en_us",
    "source_root": "src/builtin/builtin/machine_max/docs/en_us/schemas",
    "source_revision": "7629416b",
    "source_files": 67,
    "source_sha256": "1c6aebbc87cc5527812a4fe68d25a22045acfd5dc870534a8e7efdf2e6083228",
    "generated_from": "machine_max builtin JSON Schema"
};

const SPECS = {
    "part": {
        "fields": {
            "icon": {
                "type": "string",
                "references": "resource",
                "description": "Part icon path, used for UI display. If left empty, a purple-black default icon will be used as the icon"
            },
            "vehicle_durability_rate": {
                "type": "number",
                "integer": false,
                "minimum": 0,
                "maximum": 1,
                "description": "Vehicle durability contribution rate, part durability contributes to the total vehicle durability at this ratio. For example, 0.8 means 80% of the part's durability contributes to the vehicle"
            },
            "vehicle_damage_rate": {
                "type": "number",
                "integer": false,
                "minimum": 0,
                "description": "Normal vehicle damage transmission coefficient, when the part takes damage, it transmits to the vehicle at this ratio. For example, 1.0 means 100% damage transmission"
            },
            "vehicle_damage_rate_destroyed": {
                "type": "number",
                "integer": false,
                "minimum": 0,
                "description": "Vehicle damage transmission coefficient after part is destroyed, when the destroyed part takes damage, it transmits to the vehicle at this ratio. Usually set to a lower value to prevent corpse punishment"
            },
            "functional_threshold": {
                "type": "number",
                "integer": false,
                "minimum": 0,
                "maximum": 1,
                "description": "Part functional threshold. Subsystems can work and assembly wireframe mode can auto-close after assembling progress reaches this value."
            },
            "share_durability": {
                "type": "boolean",
                "description": "Whether parts within the component share durability. If true, all sub-parts share the same durability pool; if false, each sub-part has independent durability"
            },
            "max_stack_size": {
                "type": "integer",
                "integer": true,
                "minimum": 1,
                "maximum": 64,
                "description": "Maximum stack size for the part item. Determines how many of this part can be stacked in inventory. Default is 1 (no stacking)"
            }
        },
        "required": []
    },
    "variant": {
        "fields": {
            "tags": {
                "type": "array",
                "items": {
                    "type": "string",
                    "references": "resource"
                },
                "description": "Part tags, used for connector matching (required_tags / acceptable_tags / forbidden_tags of the opposite connector) and functional classification."
            },
            "model": {
                "type": "string",
                "references": "resource",
                "description": "Model path. Leading folders are ignored: machine_max:ae86_chassis.geo matches ae86_chassis.geo.json anywhere under models/ in the content pack.",
                "required": true
            },
            "textures": {
                "oneOf": [
                    {
                        "type": "string",
                        "references": "resource"
                    },
                    {
                        "type": "object",
                        "additionalProperties": {
                            "type": "string",
                            "references": "resource"
                        },
                        "minProperties": 1
                    }
                ],
                "description": "Texture configuration. The part fails to load when the resulting texture map is empty.",
                "sideEffect": "ensure_object"
            },
            "animations": {
                "type": "string",
                "references": "resource",
                "description": "Animation path. Leading folders are ignored: machine_max:ae86 matches every animation json under animations/ in the content pack whose folder is named ae86, and exposes them as available animations of the model."
            }
        },
        "required": [
            "model"
        ]
    },
    "sub_part": {
        "fields": {
            "start_bone": {
                "type": "string",
                "description": "The starting bone name of the sub-part, used to select the set of bones to render and calculate collisions from the model. If empty, all bones of the entire model will be used",
                "references": "bone",
                "sideEffect": "migrate_sub_part_marker"
            },
            "end_bones": {
                "type": "array",
                "items": {
                    "type": "string",
                    "references": "bone"
                },
                "description": "List of ending bone names, bones between the starting and ending bones will be included in the sub-part. Used to exclude unwanted parts"
            },
            "durability": {
                "type": "number",
                "integer": false,
                "minimum": 0,
                "description": "Base health value of the sub-part, when reduced to 0, all subsystems of the sub-part will be paralyzed. Note: Multiple sub-parts can share durability (controlled by share_durability in the part definition)"
            },
            "mass": {
                "type": "number",
                "integer": false,
                "minimum": 0,
                "description": "Sub-part mass (kg), must be greater than 0, used for physics calculations"
            },
            "mass_center": {
                "type": "string",
                "description": "Mass center locator name, used to specify a locator with the same name in the model as the mass center position. If not specified or not found, the geometric center of the collision volume will be used as the mass center.",
                "references": "locator"
            },
            "projected_area": {
                "type": "tuple",
                "tuple": [
                    {
                        "type": "number"
                    },
                    {
                        "type": "number"
                    },
                    {
                        "type": "number"
                    }
                ],
                "minItems": 3,
                "maxItems": 3,
                "description": "Projected area of the sub-part in three axial directions (m²), used to calculate air resistance"
            },
            "block_collision": {
                "type": "string",
                "enum": [
                    "true",
                    "false",
                    "ground"
                ],
                "description": "Terrain collision mode: true (default, collides with all blocks), ground (only collides with ground blocks below the part), false (does not collide with any blocks)"
            },
            "collision_height": {
                "type": "number",
                "integer": false,
                "description": "Collision detection height (m), when encountering obstacles lower than this height, no collision occurs with the obstacle (block collision mode needs to be ground). Default -1.0 means all obstacles collide"
            },
            "climb_assist": {
                "type": "boolean",
                "description": "Climbing assistance, whether to enable climbing assistance function"
            },
            "hydro_priority": {
                "type": "integer",
                "integer": true,
                "description": "Air resistance calculation priority, the higher the value the higher the priority. Parts with higher or equal priority will block parts with lower or equal priority, causing changes in drag coefficients"
            },
            "hydrodynamics": {
                "type": "object",
                "additionalProperties": {
                    "type": "object",
                    "properties": {
                        "scale": {
                            "type": "number",
                            "integer": false,
                            "minimum": 0
                        },
                        "effective_range": {
                            "type": "number",
                            "integer": false,
                            "minimum": 0
                        },
                        "transonic_amplifier": {
                            "type": "number",
                            "integer": false,
                            "minimum": 0
                        },
                        "front_drag": {
                            "type": "array",
                            "items": {
                                "type": "number",
                                "integer": false
                            },
                            "minItems": 2,
                            "maxItems": 2
                        },
                        "back_drag": {
                            "type": "array",
                            "items": {
                                "type": "number",
                                "integer": false
                            },
                            "minItems": 2,
                            "maxItems": 2
                        },
                        "left_drag": {
                            "type": "array",
                            "items": {
                                "type": "number",
                                "integer": false
                            },
                            "minItems": 2,
                            "maxItems": 2
                        },
                        "right_drag": {
                            "type": "array",
                            "items": {
                                "type": "number",
                                "integer": false
                            },
                            "minItems": 2,
                            "maxItems": 2
                        },
                        "up_drag": {
                            "type": "array",
                            "items": {
                                "type": "number",
                                "integer": false
                            },
                            "minItems": 2,
                            "maxItems": 2
                        },
                        "down_drag": {
                            "type": "array",
                            "items": {
                                "type": "number",
                                "integer": false
                            },
                            "minItems": 2,
                            "maxItems": 2
                        },
                        "x_lift": {
                            "type": "number",
                            "integer": false
                        },
                        "y_lift": {
                            "type": "number",
                            "integer": false
                        },
                        "z_lift": {
                            "type": "number",
                            "integer": false
                        },
                        "advanced": {
                            "type": "boolean"
                        },
                        "advanced_aero": {
                            "type": "object",
                            "properties": {
                                "lift_slope": {
                                    "type": "number",
                                    "integer": false
                                },
                                "alpha0": {
                                    "type": "number",
                                    "integer": false
                                },
                                "alpha_stall": {
                                    "type": "number",
                                    "integer": false,
                                    "minimum": 0
                                },
                                "cd0": {
                                    "type": "number",
                                    "integer": false,
                                    "minimum": 0
                                },
                                "k_induced": {
                                    "type": "number",
                                    "integer": false
                                }
                            }
                        }
                    },
                    "additionalProperties": false
                },
                "description": "List of hydrodynamic calculation reference points, key-value pair key name is first searched as bone name, if a matching bone is found, all locators within that bone are used as aerodynamic calculation points; if no matching bone is found, it is searched as locator name. Empty string means calculation based on center of mass position."
            }
        },
        "required": []
    },
    "hit_box": {
        "fields": {
            "id": {
                "type": "string",
                "description": "Hit box id. Hit boxes sharing an id are not hit twice by the same attack."
            },
            "type": {
                "type": "string",
                "enum": [
                    "box",
                    "sphere",
                    "cylinder",
                    "capsule",
                    "wheel"
                ],
                "description": "Collision shape type.\n- box: box generated from the cube pose and half-extents.\n- sphere: sphere using the cube y half-length as radius.\n- cylinder: cylinder generated from the cube pose and half-extents, axis is z.\n- capsule: capsule generated from the cube pose and half-extents, axis is y.\n- wheel: sphere using the cube y half-length as radius and the x size as width; contacts beyond half-width are ignored and the rigid body inertia tensor is adjusted with the cylinder formula. Prefer a single wheel hit box holding a single cube per sub-part.",
                "required": true
            },
            "subsystem": {
                "type": "string",
                "description": "Subsystem name. Damage taken by this hit box is applied to the named subsystem as well.",
                "references": "subsystem"
            },
            "module": {
                "type": "string",
                "description": "Module name inside the subsystem, for example \"barrel\", \"breech\", \"radiator\". An empty string applies to the subsystem as a whole."
            },
            "material": {
                "type": "string",
                "references": "resource",
                "description": "Material registry id, used to obtain friction coefficients, damage reduction, hit sounds and other physical properties."
            },
            "thickness": {
                "type": "number",
                "integer": false,
                "minimum": 0,
                "description": "Armor thickness, unit mm. Reduces damage and controls energy distribution during collisions."
            },
            "condition": {
                "type": "string",
                "description": "Activation condition, a molang expression deciding whether the hit box is active, for example glass losing its hit box once broken or a trailer jack losing it when deployed."
            },
            "overwrite": {
                "type": "object",
                "properties": {
                    "physics": {
                        "type": "object",
                        "properties": {
                            "friction": {
                                "type": "tuple",
                                "tuple": [
                                    {
                                        "type": "number"
                                    },
                                    {
                                        "type": "number"
                                    },
                                    {
                                        "type": "number"
                                    }
                                ],
                                "minItems": 3,
                                "maxItems": 3
                            },
                            "slip_adaptation": {
                                "type": "number",
                                "integer": false,
                                "minimum": 0,
                                "maximum": 1
                            },
                            "slip_curve": {
                                "type": "object",
                                "properties": {
                                    "longitudinal": {
                                        "type": "object",
                                        "properties": {
                                            "peak_slip_ratio": {
                                                "type": "number",
                                                "integer": false,
                                                "minimum": 0
                                            },
                                            "base_scale": {
                                                "type": "number",
                                                "integer": false
                                            },
                                            "peak_scale": {
                                                "type": "number",
                                                "integer": false
                                            },
                                            "kinetic_scale": {
                                                "type": "number",
                                                "integer": false
                                            }
                                        },
                                        "additionalProperties": false
                                    },
                                    "lateral": {
                                        "type": "object",
                                        "properties": {
                                            "peak_angle_deg": {
                                                "type": "number",
                                                "integer": false,
                                                "minimum": 0
                                            },
                                            "kinetic_angle_deg": {
                                                "type": "number",
                                                "integer": false,
                                                "minimum": 0
                                            },
                                            "base_scale": {
                                                "type": "number",
                                                "integer": false
                                            },
                                            "peak_scale": {
                                                "type": "number",
                                                "integer": false
                                            },
                                            "kinetic_scale": {
                                                "type": "number",
                                                "integer": false
                                            }
                                        },
                                        "additionalProperties": false
                                    }
                                },
                                "additionalProperties": false
                            },
                            "rolling_friction": {
                                "type": "number",
                                "integer": false,
                                "minimum": 0
                            },
                            "spinning_friction": {
                                "type": "number",
                                "integer": false,
                                "minimum": 0
                            },
                            "restitution": {
                                "type": "number",
                                "integer": false,
                                "minimum": 0,
                                "maximum": 1
                            },
                            "block_damage_factor": {
                                "type": "number",
                                "integer": false,
                                "minimum": 0
                            }
                        },
                        "additionalProperties": false
                    },
                    "armor": {
                        "type": "object",
                        "properties": {
                            "rha": {
                                "type": "number",
                                "integer": false,
                                "minimum": 0
                            },
                            "angle_effect": {
                                "type": "boolean"
                            },
                            "dmg_resist": {
                                "type": "number",
                                "integer": false,
                                "minimum": 0
                            },
                            "dmg_mult": {
                                "type": "number",
                                "integer": false,
                                "minimum": 0,
                                "maximum": 1
                            },
                            "decay_rha": {
                                "type": "number",
                                "integer": false,
                                "minimum": 0
                            },
                            "decay_dmg_resist": {
                                "type": "number",
                                "integer": false,
                                "minimum": 0
                            },
                            "decay_dmg_mult": {
                                "type": "number",
                                "integer": false,
                                "minimum": 0,
                                "maximum": 1
                            },
                            "decay_power": {
                                "type": "number",
                                "integer": false,
                                "minimum": 0
                            },
                            "unpen_power": {
                                "type": "number",
                                "integer": false,
                                "minimum": 0
                            },
                            "impact_modifiers": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "operation": {
                                            "type": "any",
                                            "recursive": true,
                                            "required": true
                                        },
                                        "value": {
                                            "type": "number",
                                            "integer": false,
                                            "required": true
                                        },
                                        "condition": {
                                            "type": "any",
                                            "recursive": true,
                                            "required": true
                                        }
                                    },
                                    "additionalProperties": false
                                }
                            },
                            "penetration_modifiers": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "operation": {
                                            "type": "any",
                                            "recursive": true,
                                            "required": true
                                        },
                                        "value": {
                                            "type": "number",
                                            "integer": false,
                                            "required": true
                                        },
                                        "condition": {
                                            "type": "any",
                                            "recursive": true,
                                            "required": true
                                        }
                                    },
                                    "additionalProperties": false
                                }
                            },
                            "damage_modifiers": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "operation": {
                                            "type": "any",
                                            "recursive": true,
                                            "required": true
                                        },
                                        "value": {
                                            "type": "number",
                                            "integer": false,
                                            "required": true
                                        },
                                        "condition": {
                                            "type": "any",
                                            "recursive": true,
                                            "required": true
                                        }
                                    },
                                    "additionalProperties": false
                                }
                            }
                        },
                        "additionalProperties": false
                    },
                    "sounds": {
                        "type": "object",
                        "properties": {
                            "hit_un_pen": {
                                "type": "object",
                                "properties": {
                                    "sound_id": {
                                        "type": "string",
                                        "required": true
                                    },
                                    "range": {
                                        "type": "number",
                                        "integer": false,
                                        "minimum": 0
                                    }
                                },
                                "additionalProperties": false
                            },
                            "hit_pen": {
                                "type": "object",
                                "properties": {
                                    "sound_id": {
                                        "type": "string",
                                        "required": true
                                    },
                                    "range": {
                                        "type": "number",
                                        "integer": false,
                                        "minimum": 0
                                    }
                                },
                                "additionalProperties": false
                            }
                        },
                        "additionalProperties": false
                    }
                },
                "additionalProperties": false,
                "description": "Material override applied on top of the referenced material.",
                "sideEffect": "ensure_object",
                "nullable": true
            }
        },
        "required": [
            "type"
        ]
    },
    "interact_box": {
        "fields": {
            "bone": {
                "type": "string",
                "description": "Bone name corresponding to the interaction area, bones in the model will serve as the interaction area.",
                "required": true,
                "references": "bone",
                "sideEffect": "rebind_interact_marker"
            },
            "signal_targets": {
                "type": "object",
                "additionalProperties": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "references": "signal"
                    }
                },
                "description": "Signal transmission targets, key is signal channel, value is target list (subsystem/connection point name/part/global). For example: {\"door_interact\": [\"door_controller\"]}.",
                "required": true
            },
            "interact_mode": {
                "type": "string",
                "enum": [
                    "fast",
                    "accurate"
                ],
                "description": "Interaction mode. fast: quick interaction, only requires player to intersect with the interaction area; accurate: requires player to aim at the interaction area. Between the two, accurate has higher priority than fast."
            },
            "condition": {
                "type": "string",
                "enum": [
                    "AND",
                    "OR",
                    "NAND",
                    "NOR",
                    "XOR",
                    "XNOR"
                ],
                "description": "Conditions for interaction area availability, AND: all input signals are non-zero; OR: any input signal is non-zero; NAND: all input signals are zero; NOR: any input signal is zero; XOR: only one input signal is 1; XNOR: only one input signal is 0."
            }
        },
        "required": [
            "bone",
            "signal_targets"
        ]
    },
    "connector": {
        "fields": {
            "locator": {
                "type": "string",
                "description": "Locator name corresponding to the connection point, will search for Locators with matching names, using their position and orientation as the connection point's position and orientation.",
                "required": true,
                "references": "locator",
                "sideEffect": "migrate_connector_marker"
            },
            "definition": {
                "type": "string",
                "description": "Connection point definition ID, references predefined connection point static attributes. For example: \"machine_max:simple_connector\".",
                "required": true,
                "references": "resource",
                "sideEffect": "sync_marker_config_ref"
            },
            "power_target": {
                "type": "string",
                "description": "Local target (subsystem or connector name) that receives mechanical energy from the opposite side's connector. When set, this connector acts as a mechanical energy transmission channel, forwarding incoming power to the specified local target. For example: \"subsystem.machine_max.engine\".",
                "references": "signal"
            },
            "overwrite": {
                "type": "object",
                "properties": {
                    "type": {
                        "type": "string",
                        "enum": [
                            "Simple",
                            "simple",
                            "advanced",
                            "Advanced"
                        ]
                    },
                    "direction": {
                        "type": "string",
                        "enum": [
                            "xp",
                            "xn",
                            "yp",
                            "yn",
                            "zp",
                            "zn"
                        ]
                    },
                    "integrity": {
                        "type": "number",
                        "integer": false,
                        "minimum": 0
                    },
                    "impact_absorption": {
                        "type": "number",
                        "integer": false,
                        "minimum": 0,
                        "maximum": 1
                    },
                    "impact_absorption_destroyed": {
                        "type": "number",
                        "integer": false,
                        "minimum": 0
                    },
                    "impact_reduction": {
                        "type": "number",
                        "integer": false,
                        "minimum": 0
                    },
                    "impact_multiplier": {
                        "type": "number",
                        "integer": false,
                        "minimum": 0
                    },
                    "collide_between_parts": {
                        "type": "boolean"
                    },
                    "required_tags": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "references": "resource"
                        }
                    },
                    "acceptable_tags": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "references": "resource"
                        }
                    },
                    "forbidden_tags": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "references": "resource"
                        }
                    },
                    "joint_attrs": {
                        "type": "object",
                        "additionalProperties": {
                            "type": "object",
                            "properties": {
                                "lower_limit": {
                                    "type": "number",
                                    "integer": false
                                },
                                "upper_limit": {
                                    "type": "number",
                                    "integer": false
                                },
                                "equilibrium": {
                                    "type": "number",
                                    "integer": false
                                },
                                "stiffness": {
                                    "type": "number",
                                    "integer": false,
                                    "minimum": 0
                                },
                                "damping": {
                                    "type": "number",
                                    "integer": false,
                                    "minimum": 0
                                }
                            },
                            "additionalProperties": false
                        }
                    }
                },
                "additionalProperties": false,
                "description": "Connection point attribute overwrite. Can overwrite static connection point attributes pointed to by definition as needed.",
                "sideEffect": "ensure_object",
                "nullable": true
            },
            "signal_translations": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                },
                "description": "Signal channel translation rules received from the opposite connection point, for example: {\"channel_a\": \"channel_c\"} means translating channel_a signal to channel_c."
            },
            "signal_targets": {
                "type": "object",
                "additionalProperties": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "references": "signal"
                    }
                },
                "description": "Control signal transmission targets of the connection point within this part, key is signal channel, value is target list (subsystem/connection point name/part/global). For example: {\"move_input\": [\"car_controller\", \"engine\"]}."
            },
            "internal": {
                "type": "boolean",
                "description": "Whether this is an internal connector. When true, it is only used for automatic pairing within the same Part and is not exposed for outward assembly."
            }
        },
        "required": [
            "locator",
            "definition"
        ]
    },
    "subsystem": {
        "machine_max:basic": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:basic"
                    ],
                    "description": "Subsystem type, must be 'machine_max:basic'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem model, pointing to the corresponding static attribute definition file.",
                    "required": true,
                    "references": "resource"
                }
            },
            "required": [
                "type",
                "definition"
            ],
            "schema": "subsystem/dynamic/basic_dynamic_attr.schema.json"
        },
        "machine_max:camera": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:camera"
                    ],
                    "description": "Subsystem type, must be 'machine_max:camera'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem model, pointing to the corresponding subsystem static attribute definition file.",
                    "required": true,
                    "references": "resource"
                },
                "locator": {
                    "type": "string",
                    "description": "Camera mount locator name, the bone in the model serves as the camera position.",
                    "references": "locator"
                }
            },
            "required": [
                "type",
                "definition"
            ],
            "schema": "subsystem/dynamic/camera_dynamic_attr.schema.json"
        },
        "machine_max:car_controller": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:car_controller"
                    ],
                    "description": "Subsystem type, must be 'machine_max:car_controller'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem model, pointing to the corresponding subsystem static attribute definition file.",
                    "required": true,
                    "references": "resource"
                },
                "control_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Unified control signal output channel and targets. All controlled subsystems (engine/motor/gearbox/wheel) are discovered and signaled through this channel.",
                    "required": true
                },
                "speed_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Movement speed signal output channel and targets. Optional, by default sends movement speed (m/s) to the vehicle_speed channel of parts and vehicles."
                },
                "throttle_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Throttle signal output channel and targets. Optional, by default sends throttle [0,1] to the throttle channel of parts and vehicles."
                },
                "brake_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Brake signal output channel and targets. Optional, by default sends brake level [0,1] to the brake channel of parts and vehicles."
                },
                "steering_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Steering angle signal output channel and targets. Optional, by default sends steering level [-1,1] to the steering channel of parts and vehicles."
                },
                "handbrake_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Handbrake switch signal output channel and targets. Optional, by default sends handbrake level [0,1] to the handbrake channel of parts and vehicles."
                }
            },
            "required": [
                "type",
                "definition",
                "control_outputs"
            ],
            "schema": "subsystem/dynamic/car_controller_dynamic_attr.schema.json"
        },
        "machine_max:motorbike_controller": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:motorbike_controller"
                    ],
                    "description": "Subsystem type, must be 'machine_max:motorbike_controller'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem model, pointing to the corresponding subsystem static attribute definition file.",
                    "required": true,
                    "references": "resource"
                },
                "control_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Unified control signal output channel and targets. All controlled subsystems (engine/motor/gearbox/wheel) are discovered and signaled through this channel.",
                    "required": true
                },
                "speed_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Movement speed signal output channel and targets. Optional, by default sends movement speed (m/s) to the vehicle_speed channel of parts and vehicles."
                },
                "throttle_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Throttle signal output channel and targets. Optional, by default sends throttle [0,1] to the throttle channel of parts and vehicles."
                },
                "brake_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Brake signal output channel and targets. Optional, by default sends brake level [0,1] to the brake channel of parts and vehicles."
                },
                "steering_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Steering angle signal output channel and targets. Optional, by default sends steering level [-1,1] to the steering channel of parts and vehicles."
                },
                "handbrake_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Handbrake switch signal output channel and targets. Optional, by default sends handbrake level [0,1] to the handbrake channel of parts and vehicles."
                }
            },
            "required": [
                "type",
                "definition",
                "control_outputs"
            ],
            "schema": "subsystem/dynamic/motorbike_controller_dynamic_attr.schema.json"
        },
        "machine_max:engine": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:engine"
                    ],
                    "description": "Subsystem type, must be 'machine_max:engine'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem model, pointing to the corresponding subsystem static attribute definition file.",
                    "required": true,
                    "references": "resource"
                },
                "power_output": {
                    "type": "string",
                    "description": "Power output target, can be any other subsystem name within this part, part connection point name, or 'part', or 'global'.",
                    "required": true,
                    "references": "signal"
                },
                "speed_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Engine speed signal output channel and targets. Optional, by default sends engine speed (rad/s) to the engine_speed channel of parts and vehicles."
                }
            },
            "required": [
                "type",
                "definition",
                "power_output"
            ],
            "schema": "subsystem/dynamic/engine_dynamic_attr.schema.json"
        },
        "machine_max:gearbox": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:gearbox"
                    ],
                    "description": "Subsystem type, must be 'machine_max:gearbox'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem model, pointing to the corresponding subsystem static attribute definition file.",
                    "required": true,
                    "references": "resource"
                },
                "power_output": {
                    "type": "string",
                    "description": "Power output target, subsystem or part interface name.",
                    "required": true,
                    "references": "signal"
                },
                "gear_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Gear name output channel and targets. Optional, by default sends current gear name to the gear channel of parts and vehicles."
                }
            },
            "required": [
                "type",
                "definition",
                "power_output"
            ],
            "schema": "subsystem/dynamic/gearbox_dynamic_attr.schema.json"
        },
        "machine_max:item_storage": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:item_storage"
                    ],
                    "description": "Subsystem type, must be 'machine_max:item_storage'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem model, pointing to the corresponding subsystem static attribute definition file.",
                    "required": true,
                    "references": "resource"
                }
            },
            "required": [
                "type",
                "definition"
            ],
            "schema": "subsystem/dynamic/item_storage_dynamic_attr.schema.json"
        },
        "machine_max:motor": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:motor"
                    ],
                    "description": "Subsystem type, must be 'machine_max:motor'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem model, pointing to the corresponding subsystem static attribute definition file.",
                    "required": true,
                    "references": "resource"
                },
                "power_output": {
                    "type": "string",
                    "description": "Power output target, can be any other subsystem name within this part, part connection point name, or 'part', or 'global'.",
                    "required": true,
                    "references": "signal"
                },
                "speed_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Motor speed signal output channel and targets. Optional, by default sends motor speed (rad/s) to the motor_speed channel of parts and vehicles."
                }
            },
            "required": [
                "type",
                "definition",
                "power_output"
            ],
            "schema": "subsystem/dynamic/motor_dynamic_attr.schema.json"
        },
        "machine_max:seat": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:seat"
                    ],
                    "description": "Subsystem type, must be 'machine_max:seat'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem model, pointing to the corresponding subsystem static attribute definition file.",
                    "required": true,
                    "references": "resource"
                },
                "locator": {
                    "type": "string",
                    "description": "Seat point locator name, bones in the model will serve as seat position. If empty, use the default locator defined by the subsystem.",
                    "references": "locator"
                },
                "control_group_preset": {
                    "type": "string",
                    "description": "Resource location of the control group preset, defining the available control channel mappings for this seat. e.g. machine_max:default_driver.",
                    "references": "resource"
                },
                "passenger_num_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Passenger count signal output channel and targets."
                },
                "camera_discovery_targets": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Camera discovery handshake configuration. Subsystems on these channels will receive handshake signals to discover available cameras on this vehicle. e.g. {\"gunner_optics\": [\"gunner_primary_sight\"]}"
                },
                "dismount_locators": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "references": "locator"
                    },
                    "description": "Ordered list of dismount locator names; the list order is the priority for dismount attempts. Every name must exist in the model locators; an empty list means this seat declares no dismount point."
                }
            },
            "required": [
                "type",
                "definition"
            ],
            "schema": "subsystem/dynamic/seat_dynamic_attr.schema.json"
        },
        "machine_max:sight": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:sight"
                    ],
                    "description": "Subsystem type, must be 'machine_max:sight'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem model, pointing to the corresponding subsystem static attribute definition file.",
                    "required": true,
                    "references": "resource"
                },
                "locator": {
                    "type": "string",
                    "description": "Sight mount locator name, the bone in the model serves as the sight position.",
                    "references": "locator"
                }
            },
            "required": [
                "type",
                "definition"
            ],
            "schema": "subsystem/dynamic/sight_dynamic_attr.schema.json"
        },
        "machine_max:transmission": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:transmission"
                    ],
                    "description": "Subsystem type, must be 'machine_max:transmission'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem model, pointing to the corresponding subsystem static attribute definition file.",
                    "required": true,
                    "references": "resource"
                },
                "power_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "number",
                        "integer": false
                    },
                    "description": "Power output targets and reduction ratios.",
                    "required": true
                }
            },
            "required": [
                "type",
                "definition",
                "power_outputs"
            ],
            "schema": "subsystem/dynamic/transmission_dynamic_attr.schema.json"
        },
        "machine_max:wheel_driver": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:wheel_driver"
                    ],
                    "description": "Subsystem type, must be 'machine_max:wheel_driver'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem model, pointing to the corresponding subsystem static attribute definition file.",
                    "required": true,
                    "references": "resource"
                },
                "connector": {
                    "type": "string",
                    "description": "Name of the controlled connection point.",
                    "required": true,
                    "references": "connector"
                },
                "roll_speed_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Rolling speed signal output channel and targets."
                },
                "steering_angle_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Steering angle signal output channel and targets."
                }
            },
            "required": [
                "type",
                "definition",
                "connector"
            ],
            "schema": "subsystem/dynamic/wheel_driver_dynamic_attr.schema.json"
        },
        "machine_max:lighting": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:lighting"
                    ],
                    "description": "Subsystem type. Must be 'machine_max:lighting'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem definition.",
                    "required": true,
                    "references": "resource"
                },
                "locator": {
                    "type": "string",
                    "description": "Light locator name. Rendering uses this locator's position and rotation.",
                    "required": true,
                    "references": "locator"
                }
            },
            "required": [
                "type",
                "definition",
                "locator"
            ],
            "schema": "subsystem/dynamic/lighting_dynamic_attr.schema.json"
        },
        "machine_max:turret_driver": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:turret_driver"
                    ],
                    "description": "Subsystem type, must be 'machine_max:turret_driver'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem model, pointing to the corresponding subsystem static attribute definition file.",
                    "required": true,
                    "references": "resource"
                },
                "connector": {
                    "type": "string",
                    "description": "Name of the controlled AdvancedConnector. The turret driver controls turret rotation through this connector's New6Dof joint.",
                    "required": true,
                    "references": "connector"
                },
                "rotation_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Current joint angle feedback output channels and targets. Optional, sends current yaw/pitch angles (radians) to specified channels."
                }
            },
            "required": [
                "type",
                "definition",
                "connector"
            ],
            "schema": "subsystem/dynamic/turret_driver_dynamic_attr.schema.json"
        },
        "machine_max:weapon_controller": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:weapon_controller"
                    ],
                    "description": "Subsystem type, must be 'machine_max:weapon_controller'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem model, pointing to the corresponding subsystem static attribute definition file.",
                    "required": true,
                    "references": "resource"
                },
                "control_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Control signal output channels and target lists. The weapon controller sends control signals to turret drivers and launchers through these channels, and uses them for handshake discovery of subordinate subsystems within the same vehicle."
                },
                "first_hud_layout": {
                    "type": "string",
                    "references": "resource",
                    "description": "HUD layout used by the first-person view; machine_max:empty shows no HUD."
                },
                "third_hud_layout": {
                    "type": "string",
                    "references": "resource",
                    "description": "HUD layout used by the third-person view; machine_max:empty shows no HUD."
                },
                "scope_hud_layout": {
                    "type": "string",
                    "references": "resource",
                    "description": "HUD layout used by the scope view; machine_max:empty shows no HUD."
                }
            },
            "required": [
                "type",
                "definition"
            ],
            "schema": "subsystem/dynamic/weapon_controller_dynamic_attr.schema.json"
        },
        "machine_max:launcher": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:launcher"
                    ],
                    "description": "Subsystem type, must be 'machine_max:launcher'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem model, pointing to the corresponding launcher subsystem static attribute definition file.",
                    "required": true,
                    "references": "resource"
                },
                "locator": {
                    "type": "string",
                    "description": "Muzzle locator name. Projectiles are fired from the world transform of this locator.",
                    "required": true,
                    "references": "locator"
                },
                "fire_animation": {
                    "type": "string",
                    "description": "Animation name played on fire, keyed in the part's animation set. Defaults to 'fire'. Same-name animations restart from 0; multiple launchers on the same part must use different names to avoid interrupting each other. A missing animation triggers a single warning and disables the fire animation."
                },
                "ammo_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Remaining ammo feedback output channels and targets. Optional."
                }
            },
            "required": [
                "type",
                "definition",
                "locator"
            ],
            "schema": "subsystem/dynamic/launcher_dynamic_attr.schema.json"
        },
        "machine_max:regen_loader": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:regen_loader"
                    ],
                    "description": "Subsystem type. Must be 'machine_max:regen_loader'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource address of the subsystem model, pointing at the matching regen loader static attribute definition file.",
                    "required": true,
                    "references": "resource"
                },
                "projectile_types": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "integer",
                        "integer": true,
                        "minimum": 1
                    },
                    "minProperties": 1,
                    "description": "Belt composition: keys are projectile resource addresses, values are how many rounds of that type the belt repeats. Each entry is expanded by count into an ordered belt ({\"machine_max:7_62mm_ap\": 3, \"machine_max:7_62mm_tracer\": 1} expands to AP, AP, AP, tracer), and firing consumes it cyclically in that order. Key order is belt order, so the first projectile decides the belt label when belt_label is left empty. The text shown for a projectile in the HUD comes from that projectile's own language key (spelled <namespace>.<path> from the projectile registry key, slashes in the path kept as-is), provided by the lang/<locale>.json of the pack that owns the projectile; when the key is missing the HUD shows the key itself, which surfaces the omission.",
                    "required": true
                },
                "belt_label": {
                    "type": "string",
                    "description": "Belt name shown on the weapon status HUD belt tab. When empty the display text of the belt's first projectile is used; when set, the string is used verbatim without a language file lookup, so one pack definition shows the same name in every language. Set it when the belt holds more than one projectile type or when the automatic value is not accurate enough. It affects the belt name only: the current-round slot still reports the projectile the belt pointer points at, and the field takes no part in ammo pool grouping, so changing it never affects ammo routing or already-loaded vehicles."
                },
                "discovery_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Ammo discovery channels and targets, used by the loader to discover the ammo consumers on the same vehicle. Optional."
                }
            },
            "required": [
                "type",
                "definition",
                "projectile_types"
            ],
            "schema": "subsystem/dynamic/regen_loader_dynamic_attr.schema.json"
        },
        "machine_max:track_controller": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:track_controller"
                    ],
                    "description": "Subsystem type, must be 'machine_max:track_controller'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem model, pointing to the corresponding subsystem static attribute definition file.",
                    "required": true,
                    "references": "resource"
                },
                "control_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Unified control signal output channel and targets. Engines, motors, gearboxes and track drives are discovered through this map.",
                    "required": true
                },
                "speed_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Vehicle forward speed output. Optional; defaults to vehicle_speed on local and global."
                }
            },
            "required": [
                "type",
                "definition",
                "control_outputs"
            ],
            "schema": "subsystem/dynamic/track_controller_dynamic_attr.schema.json"
        },
        "machine_max:track_drive": {
            "fields": {
                "type": {
                    "type": "string",
                    "enum": [
                        "machine_max:track_drive"
                    ],
                    "description": "Subsystem type, must be 'machine_max:track_drive'.",
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "description": "Resource location of the subsystem model, pointing to the corresponding subsystem static attribute definition file.",
                    "required": true,
                    "references": "resource"
                },
                "connector": {
                    "type": "string",
                    "description": "Name of the body-side connector that joins the driven wheel.",
                    "required": true,
                    "references": "connector"
                },
                "speed_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Track linear speed output (m/s, forward positive). Optional."
                },
                "force_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "description": "Track drive force output (N, forward positive). Optional."
                }
            },
            "required": [
                "type",
                "definition",
                "connector"
            ],
            "schema": "subsystem/dynamic/track_drive_dynamic_attr.schema.json"
        }
    }
};

const CONTAINERS = {
    "part": [
        "variants"
    ],
    "variant": [
        "sub_parts"
    ],
    "sub_part": [
        "hit_boxes",
        "interact_boxes",
        "connectors",
        "subsystems"
    ]
};

const SIDE_EFFECTS = {
    "sub_part.start_bone": "migrate_sub_part_marker",
    "interact_box.bone": "rebind_interact_marker",
    "connector.definition": "sync_marker_config_ref",
    "connector.locator": "migrate_connector_marker",
    "hit_box.overwrite": "ensure_object",
    "connector.overwrite": "ensure_object",
    "variant.textures": "ensure_object",
    "subsystem.type": "rebuild_type_fields"
};

module.exports = { PROVENANCE, SPECS, CONTAINERS, SIDE_EFFECTS };
