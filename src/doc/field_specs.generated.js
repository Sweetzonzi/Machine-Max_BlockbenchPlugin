'use strict';

/**
 * 本文件由 scripts/gen-field-specs.js 自动生成，不要手工编辑。
 * 数据源：src/builtin/builtin/machine_max/docs/en_us/schemas
 * 上游快照：Machine-Max@a1460ce1
 * 重新生成：node scripts/gen-field-specs.js
 * 漂移检查：node scripts/gen-field-specs.js --check
 */
const PROVENANCE = {
    "generator": "scripts/gen-field-specs.js",
    "generator_version": 1,
    "source_locale": "en_us",
    "source_root": "src/builtin/builtin/machine_max/docs/en_us/schemas",
    "source_revision": "a1460ce1",
    "source_files": 67,
    "source_sha256": "184e3be388c85381ebdfb7e7244b71c2b9d89d291ecc0ce20807808900c0282f",
    "generated_from": "machine_max builtin JSON Schema"
};

const SPECS = {
    "part": {
        "fields": {
            "icon": {
                "type": "string",
                "references": "resource"
            },
            "vehicle_durability_rate": {
                "type": "number",
                "integer": false,
                "minimum": 0,
                "maximum": 1
            },
            "vehicle_damage_rate": {
                "type": "number",
                "integer": false,
                "minimum": 0
            },
            "vehicle_damage_rate_destroyed": {
                "type": "number",
                "integer": false,
                "minimum": 0
            },
            "functional_threshold": {
                "type": "number",
                "integer": false,
                "minimum": 0,
                "maximum": 1
            },
            "share_durability": {
                "type": "boolean"
            },
            "max_stack_size": {
                "type": "integer",
                "integer": true,
                "minimum": 1,
                "maximum": 64
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
                }
            },
            "model": {
                "type": "string",
                "references": "resource",
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
                "sideEffect": "ensure_object"
            },
            "animations": {
                "type": "string",
                "references": "resource"
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
                "references": "bone",
                "sideEffect": "migrate_sub_part_marker"
            },
            "end_bones": {
                "type": "array",
                "items": {
                    "type": "string",
                    "references": "bone"
                }
            },
            "durability": {
                "type": "number",
                "integer": false,
                "minimum": 0
            },
            "mass": {
                "type": "number",
                "integer": false,
                "minimum": 0
            },
            "mass_center": {
                "type": "string",
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
                "maxItems": 3
            },
            "block_collision": {
                "type": "string",
                "enum": [
                    "true",
                    "false",
                    "ground"
                ]
            },
            "collision_height": {
                "type": "number",
                "integer": false
            },
            "climb_assist": {
                "type": "boolean"
            },
            "hydro_priority": {
                "type": "integer",
                "integer": true
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
                }
            }
        },
        "required": []
    },
    "hit_box": {
        "fields": {
            "id": {
                "type": "string"
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
                "required": true
            },
            "subsystem": {
                "type": "string",
                "references": "subsystem"
            },
            "module": {
                "type": "string"
            },
            "material": {
                "type": "string",
                "references": "resource"
            },
            "thickness": {
                "type": "number",
                "integer": false,
                "minimum": 0
            },
            "condition": {
                "type": "string"
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
                "required": true
            },
            "interact_mode": {
                "type": "string",
                "enum": [
                    "fast",
                    "accurate"
                ]
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
                ]
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
                "required": true,
                "references": "locator",
                "sideEffect": "migrate_connector_marker"
            },
            "definition": {
                "type": "string",
                "required": true,
                "references": "resource",
                "sideEffect": "sync_marker_config_ref"
            },
            "power_target": {
                "type": "string",
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
                "sideEffect": "ensure_object",
                "nullable": true
            },
            "signal_translations": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                }
            },
            "signal_targets": {
                "type": "object",
                "additionalProperties": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "references": "signal"
                    }
                }
            },
            "internal": {
                "type": "boolean"
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "required": true,
                    "references": "resource"
                },
                "locator": {
                    "type": "string",
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
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
                    "required": true
                },
                "speed_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "throttle_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "brake_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "steering_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "handbrake_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
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
                    "required": true
                },
                "speed_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "throttle_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "brake_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "steering_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "handbrake_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "required": true,
                    "references": "resource"
                },
                "power_output": {
                    "type": "string",
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
                    }
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "required": true,
                    "references": "resource"
                },
                "power_output": {
                    "type": "string",
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
                    }
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "required": true,
                    "references": "resource"
                },
                "power_output": {
                    "type": "string",
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
                    }
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "required": true,
                    "references": "resource"
                },
                "locator": {
                    "type": "string",
                    "references": "locator"
                },
                "control_group_preset": {
                    "type": "string",
                    "references": "resource"
                },
                "passenger_num_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "camera_discovery_targets": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "dismount_locators": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "references": "locator"
                    }
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "required": true,
                    "references": "resource"
                },
                "locator": {
                    "type": "string",
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "required": true,
                    "references": "resource"
                },
                "power_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "number",
                        "integer": false
                    },
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "required": true,
                    "references": "resource"
                },
                "connector": {
                    "type": "string",
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
                    }
                },
                "steering_angle_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "required": true,
                    "references": "resource"
                },
                "locator": {
                    "type": "string",
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "required": true,
                    "references": "resource"
                },
                "connector": {
                    "type": "string",
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
                    }
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
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
                    }
                },
                "first_hud_layout": {
                    "type": "string",
                    "references": "resource"
                },
                "third_hud_layout": {
                    "type": "string",
                    "references": "resource"
                },
                "scope_hud_layout": {
                    "type": "string",
                    "references": "resource"
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "required": true,
                    "references": "resource"
                },
                "locator": {
                    "type": "string",
                    "required": true,
                    "references": "locator"
                },
                "fire_animation": {
                    "type": "string"
                },
                "ammo_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
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
                    "required": true
                },
                "belt_label": {
                    "type": "string"
                },
                "discovery_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
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
                    "required": true
                },
                "speed_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
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
                    "required": true,
                    "sideEffect": "rebuild_type_fields"
                },
                "definition": {
                    "type": "string",
                    "required": true,
                    "references": "resource"
                },
                "connector": {
                    "type": "string",
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
                    }
                },
                "force_outputs": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
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
