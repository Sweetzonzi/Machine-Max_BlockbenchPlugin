// ============================================================
// MachineMax Blockbench Plugin v0.1.0
// 打包文件 — 由 scripts/build.js 自动生成
// 源文件在 src/ 目录，修改后运行 npm run build 重新生成
// ============================================================

(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // <define:__BUILTIN_CONNECTORS__>
  var define_BUILTIN_CONNECTORS_default;
  var init_define_BUILTIN_CONNECTORS = __esm({
    "<define:__BUILTIN_CONNECTORS__>"() {
      define_BUILTIN_CONNECTORS_default = { ae86at_left_back_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 40, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: ["machine_max:chassis", "machine_max:hull"], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 1, stiffness: 28e3, damping: 1500 }, xr: { lower_limit: 1, upper_limit: -1 }, zr: { lower_limit: 1, upper_limit: 15, equilibrium: 1, stiffness: 5e4, damping: 1e3 } } }, ae86at_left_front_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 40, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: ["machine_max:chassis", "machine_max:hull"], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 1, stiffness: 28e3, damping: 1500 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 4e3, damping: 20 }, zr: { lower_limit: 1, upper_limit: 15, equilibrium: 1, stiffness: 5e4, damping: 1e3 } } }, ae86at_right_back_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 40, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: ["machine_max:chassis", "machine_max:hull"], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 1, stiffness: 28e3, damping: 1500 }, xr: { lower_limit: 1, upper_limit: -1 }, zr: { lower_limit: -15, upper_limit: -1, equilibrium: -1, stiffness: 5e4, damping: 1e3 } } }, ae86at_right_front_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 40, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: ["machine_max:chassis", "machine_max:hull"], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 1, stiffness: 28e3, damping: 1500 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 4e3, damping: 20 }, zr: { lower_limit: -15, upper_limit: -1, equilibrium: -1, stiffness: 5e4, damping: 1e3 } } }, ae86_left_back_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 40, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: [], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 1, equilibrium: -0.15, stiffness: 18e3, damping: 1e3 }, xr: { lower_limit: 1, upper_limit: -1 }, zr: { lower_limit: 1, upper_limit: 15, equilibrium: 1, stiffness: 5e4, damping: 1e3 } } }, ae86_left_front_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 40, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: [], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 1, equilibrium: -0.15, stiffness: 18e3, damping: 1e3 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 4e3, damping: 20 }, zr: { lower_limit: 1, upper_limit: 15, equilibrium: 1, stiffness: 5e4, damping: 1e3 } } }, ae86_right_back_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 40, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: [], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 1, equilibrium: -0.15, stiffness: 18e3, damping: 1e3 }, xr: { lower_limit: 1, upper_limit: -1 }, zr: { lower_limit: -15, upper_limit: -1, equilibrium: -1, stiffness: 5e4, damping: 1e3 } } }, ae86_right_front_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 40, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: [], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 1, equilibrium: -0.15, stiffness: 18e3, damping: 1e3 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 4e3, damping: 20 }, zr: { lower_limit: -15, upper_limit: -1, equilibrium: -1, stiffness: 5e4, damping: 1e3 } } }, dayun_hull_axis: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "yp", integrity: 1500, impact_reduction: 3, impact_multiplier: 0.8, joint_attrs: { xr: { lower_limit: 55, upper_limit: 0, equilibrium: 35, stiffness: 1e4, damping: 500 } } }, dayun_left_steering_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 1500, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: [], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 0.5, equilibrium: -0.2, stiffness: 7e4, damping: 3200 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 6e3, damping: 20 }, zr: { lower_limit: 1, upper_limit: 5, equilibrium: 1, stiffness: 1e5, damping: 2500 } } }, dayun_left_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 1500, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: [], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 0.6, equilibrium: -0.15, stiffness: 12e4, damping: 3500 }, xr: { lower_limit: 1, upper_limit: -1 }, zr: { lower_limit: 1, upper_limit: 8, equilibrium: 1, stiffness: 12e4, damping: 3500 } } }, dayun_right_steering_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 1500, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: [], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 0.5, equilibrium: -0.2, stiffness: 7e4, damping: 3200 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 6e3, damping: 20 }, zr: { lower_limit: -5, upper_limit: -1, equilibrium: -1, stiffness: 1e5, damping: 2500 } } }, dayun_right_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 1500, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: [], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 0.6, equilibrium: -0.15, stiffness: 12e4, damping: 3500 }, xr: { lower_limit: 1, upper_limit: -1 }, zr: { lower_limit: -8, upper_limit: -1, equilibrium: -1, stiffness: 12e4, damping: 3500 } } }, dayun_trailer: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "yp", integrity: 1500, impact_reduction: 3, impact_multiplier: 0.8, joint_attrs: { xr: { lower_limit: -10, upper_limit: 10, damping: 500 }, yr: { lower_limit: -85, upper_limit: 85, damping: 500 }, zr: { lower_limit: -5, upper_limit: 5, stiffness: 1e4, damping: 1e3 } } }, fixed_back: { $schema: "../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Simple", direction: "zp", integrity: 20, impact_absorption: 0.2, impact_reduction: 2, impact_multiplier: 1 }, fixed_down: { $schema: "../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Simple", direction: "yn", integrity: 20, impact_absorption: 0.2, impact_reduction: 2, impact_multiplier: 1 }, fixed_front: { $schema: "../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Simple", direction: "zn", integrity: 20, impact_absorption: 0.2, impact_reduction: 2, impact_multiplier: 1 }, fixed_left: { $schema: "../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Simple", direction: "xn", integrity: 20, impact_absorption: 0.2, impact_reduction: 2, impact_multiplier: 1 }, fixed_right: { $schema: "../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Simple", direction: "xp", integrity: 20, impact_absorption: 0.2, impact_reduction: 2, impact_multiplier: 1 }, fixed_up: { $schema: "../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Simple", direction: "yp", integrity: 20, impact_absorption: 0.2, impact_reduction: 2, impact_multiplier: 1 }, jeep_left_steering_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 100, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:left"], forbidden_tags: ["machine_max:chassis", "machine_max:hull"], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 1, equilibrium: -0.15, stiffness: 55e3, damping: 2500 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 1e3, damping: 20 }, zr: { lower_limit: -1, upper_limit: 5, equilibrium: -1, stiffness: 2e4, damping: 500 } } }, jeep_left_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 100, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: ["machine_max:chassis", "machine_max:hull"], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 1, equilibrium: -0.15, stiffness: 55e3, damping: 2500 }, xr: { lower_limit: 1, upper_limit: -1 }, zr: { lower_limit: -1, upper_limit: 5, equilibrium: -1, stiffness: 2e4, damping: 500 } } }, jeep_right_steering_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 100, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: ["machine_max:chassis", "machine_max:hull"], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 1, equilibrium: -0.15, stiffness: 55e3, damping: 2500 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 1e3, damping: 20 }, zr: { lower_limit: -5, upper_limit: 1, equilibrium: 1, stiffness: 2e4, damping: 500 } } }, jeep_right_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 100, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: ["machine_max:chassis", "machine_max:hull"], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 1, equilibrium: -0.15, stiffness: 55e3, damping: 2500 }, xr: { lower_limit: 1, upper_limit: -1 }, zr: { lower_limit: -5, upper_limit: 1, equilibrium: 1, stiffness: 2e4, damping: 500 } } }, kluo_back_bumper_left: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "zp", required_tags: ["machine_max:back", "machine_max:bumper"], integrity: 30, joint_attrs: { zr: { lower_limit: -30, upper_limit: 30, equilibrium: 0, stiffness: 5e3, damping: 100 } } }, kluo_back_bumper_right: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "zp", required_tags: ["machine_max:back", "machine_max:bumper"], integrity: 30, joint_attrs: { zr: { lower_limit: -30, upper_limit: 30, equilibrium: 0, stiffness: 5e3, damping: 100 } } }, kluo_front_bumper_left: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "zn", required_tags: ["machine_max:front", "machine_max:bumper"], integrity: 30, joint_attrs: { zr: { lower_limit: -30, upper_limit: 30, equilibrium: 0, stiffness: 5e3, damping: 100 } } }, kluo_front_bumper_right: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "zn", required_tags: ["machine_max:front", "machine_max:bumper"], integrity: 30, joint_attrs: { zr: { lower_limit: -30, upper_limit: 30, equilibrium: 0, stiffness: 5e3, damping: 100 } } }, kluo_front_light_left: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "zn", integrity: 10, joint_attrs: { zr: { lower_limit: -30, upper_limit: 30, equilibrium: 0, stiffness: 4e3, damping: 100 } } }, kluo_front_light_right: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "zn", integrity: 10, joint_attrs: { zr: { lower_limit: -30, upper_limit: 30, equilibrium: 0, stiffness: 4e3, damping: 100 } } }, kluo_hood_axis: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", required_tags: ["machine_max:hood"], integrity: 20, joint_attrs: { xr: { lower_limit: -80, upper_limit: 0, equilibrium: -45, stiffness: 1e3, damping: 100 } } }, kluo_left_back_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 30, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1.5, equilibrium: -0.1, stiffness: 12e3, damping: 300 }, xr: { lower_limit: 1, upper_limit: -1 }, zr: { lower_limit: 1, upper_limit: 5, equilibrium: 1, stiffness: 6e3, damping: 85 } } }, kluo_left_door_axis: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", required_tags: ["machine_max:left", "machine_max:door"], integrity: 20, joint_attrs: { yr: { lower_limit: 0, upper_limit: 80, damping: 100 } } }, kluo_left_front_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 30, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1.5, equilibrium: -0.1, stiffness: 12e3, damping: 300 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 1e3, damping: 20 }, zr: { lower_limit: 1, upper_limit: 5, equilibrium: 1, stiffness: 6e3, damping: 85 } } }, kluo_right_back_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 30, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1.5, equilibrium: -0.1, stiffness: 12e3, damping: 300 }, xr: { lower_limit: 1, upper_limit: -1 }, zr: { lower_limit: -5, upper_limit: -1, equilibrium: -1, stiffness: 6e3, damping: 85 } } }, kluo_right_door_axis: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", required_tags: ["machine_max:right", "machine_max:door"], integrity: 20, joint_attrs: { yr: { lower_limit: -80, upper_limit: 0, damping: 100 } } }, kluo_right_front_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 30, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1.5, equilibrium: -0.1, stiffness: 12e3, damping: 300 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 1e3, damping: 20 }, zr: { lower_limit: -5, upper_limit: -1, equilibrium: -1, stiffness: 6e3, damping: 85 } } }, kluo_trunk_door_axis: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", required_tags: ["machine_max:trunk"], integrity: 20, joint_attrs: { xr: { lower_limit: 80, upper_limit: 0, equilibrium: 45, stiffness: 1e3, damping: 100 } } }, mini_ev_left_back_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 40, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1, equilibrium: -0.1, stiffness: 2e4, damping: 1e3 }, xr: { lower_limit: 1, upper_limit: -1 }, zr: { lower_limit: 1, upper_limit: 15, equilibrium: 1, stiffness: 25e3, damping: 1e3 } } }, mini_ev_left_front_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 40, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1, equilibrium: -0.1, stiffness: 2e4, damping: 1e3 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 4e3, damping: 20 }, zr: { lower_limit: 1, upper_limit: 15, equilibrium: 1, stiffness: 25e3, damping: 1e3 } } }, mini_ev_right_back_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 40, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1, equilibrium: -0.1, stiffness: 2e4, damping: 1e3 }, xr: { lower_limit: 1, upper_limit: -1 }, zr: { lower_limit: -15, upper_limit: -1, equilibrium: -1, stiffness: 25e3, damping: 1e3 } } }, mini_ev_right_front_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 40, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1, equilibrium: -0.1, stiffness: 2e4, damping: 1e3 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 4e3, damping: 20 }, zr: { lower_limit: -15, upper_limit: -1, equilibrium: -1, stiffness: 25e3, damping: 1e3 } } }, r700_back_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 30, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1.5, equilibrium: -0.1, stiffness: 15e3, damping: 450 }, xr: { lower_limit: 1, upper_limit: -1 } } }, r700_front_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 30, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1.5, equilibrium: -0.1, stiffness: 15e3, damping: 450 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, damping: 20 } } }, senna_gtr_back_bumper_left: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "zp", required_tags: ["machine_max:back", "machine_max:bumper"], integrity: 30, joint_attrs: { zr: { lower_limit: -30, upper_limit: 30, equilibrium: 0, stiffness: 5e3, damping: 100 } } }, senna_gtr_back_bumper_right: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "zp", required_tags: ["machine_max:back", "machine_max:bumper"], integrity: 30, joint_attrs: { zr: { lower_limit: -30, upper_limit: 30, equilibrium: 0, stiffness: 5e3, damping: 100 } } }, senna_gtr_front_bumper_left: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "zn", required_tags: ["machine_max:front", "machine_max:bumper"], integrity: 30, joint_attrs: { zr: { lower_limit: -30, upper_limit: 30, equilibrium: 0, stiffness: 5e3, damping: 100 } } }, senna_gtr_front_bumper_right: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "zn", required_tags: ["machine_max:front", "machine_max:bumper"], integrity: 30, joint_attrs: { zr: { lower_limit: -30, upper_limit: 30, equilibrium: 0, stiffness: 5e3, damping: 100 } } }, senna_gtr_left_door_axis: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "yp", required_tags: ["machine_max:left", "machine_max:door"], integrity: 20, joint_attrs: { zr: { lower_limit: 0, upper_limit: 80, equilibrium: 80, stiffness: 500, damping: 200 } } }, senna_gtr_left_steering_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 60, required_tags: ["machine_max:left", "machine_max:front"], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 0.5, equilibrium: -0.1, stiffness: 65e3, damping: 1500 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 1e3, damping: 200 } } }, senna_gtr_left_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 60, required_tags: ["machine_max:left", "machine_max:back"], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 0.5, equilibrium: -0.1, stiffness: 65e3, damping: 1500 }, xr: { lower_limit: 1, upper_limit: -1 } } }, senna_gtr_right_door_axis: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "yp", required_tags: ["machine_max:right", "machine_max:door"], integrity: 20, joint_attrs: { zr: { lower_limit: -80, upper_limit: 0, equilibrium: -80, stiffness: 500, damping: 200 } } }, senna_gtr_right_steering_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 60, required_tags: ["machine_max:right", "machine_max:front"], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 0.5, equilibrium: -0.1, stiffness: 65e3, damping: 1500 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 1e3, damping: 200 } } }, senna_gtr_right_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 60, required_tags: ["machine_max:right", "machine_max:back"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 0.5, equilibrium: -0.1, stiffness: 65e3, damping: 1500 }, xr: { lower_limit: 1, upper_limit: -1 } } }, szn_left_back_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 80, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1, equilibrium: -0.1, stiffness: 5e3, damping: 200 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 1e3, damping: 20 }, zr: { lower_limit: 1, upper_limit: 15, equilibrium: 1, stiffness: 15e3, damping: 300 } } }, szn_left_front_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 80, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1, equilibrium: -0.1, stiffness: 5e3, damping: 200 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 1e3, damping: 20 }, zr: { lower_limit: 1, upper_limit: 15, equilibrium: 1, stiffness: 15e3, damping: 300 } } }, szn_right_back_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 80, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1, equilibrium: -0.1, stiffness: 5e3, damping: 200 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 1e3, damping: 20 }, zr: { lower_limit: -15, upper_limit: -1, equilibrium: -1, stiffness: 15e3, damping: 300 } } }, szn_right_front_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 80, impact_reduction: 3, impact_multiplier: 0.8, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1, equilibrium: -0.1, stiffness: 5e3, damping: 200 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 1e3, damping: 20 }, zr: { lower_limit: -15, upper_limit: -1, equilibrium: -1, stiffness: 15e3, damping: 300 } } }, van_back_door_axis_hull: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "yn", required_tags: ["machine_max:trunk"], integrity: 80, joint_attrs: { xr: { lower_limit: 80, upper_limit: 0, equilibrium: 45, stiffness: 1e3, damping: 100 } } }, van_left_back_door_axis_hull: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", required_tags: ["machine_max:left", "machine_max:door"], integrity: 40, joint_attrs: { x: { lower_limit: -0.1, upper_limit: 0, equilibrium: -0.1, stiffness: 1e3, damping: 100 }, z: { lower_limit: 0, upper_limit: 1, equilibrium: 1, stiffness: 1e3, damping: 100 } } }, van_left_back_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 60, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1.5, equilibrium: -0.1, stiffness: 22e3, damping: 500 }, xr: { lower_limit: 1, upper_limit: -1 }, zr: { lower_limit: 1, upper_limit: 5, equilibrium: 1, stiffness: 6e3, damping: 85 } } }, van_left_front_door_axis_hull: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", required_tags: ["machine_max:left", "machine_max:door"], integrity: 40, joint_attrs: { yr: { lower_limit: 0, upper_limit: 80, damping: 100 } } }, van_left_front_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 60, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1.5, equilibrium: -0.1, stiffness: 22e3, damping: 500 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 1e3, damping: 20 }, zr: { lower_limit: 1, upper_limit: 5, equilibrium: 1, stiffness: 6e3, damping: 85 } } }, van_right_back_door_axis_hull: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", required_tags: ["machine_max:right", "machine_max:door"], integrity: 40, joint_attrs: { x: { lower_limit: 0, upper_limit: 0.1, equilibrium: 0.1, stiffness: 1e3, damping: 100 }, z: { lower_limit: 0, upper_limit: 1, equilibrium: 1, stiffness: 1e3, damping: 100 } } }, van_right_back_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 60, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1.5, equilibrium: -0.1, stiffness: 22e3, damping: 500 }, xr: { lower_limit: 1, upper_limit: -1 }, zr: { lower_limit: -5, upper_limit: -1, equilibrium: -1, stiffness: 6e3, damping: 85 } } }, van_right_front_door_axis_hull: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", required_tags: ["machine_max:right", "machine_max:door"], integrity: 40, joint_attrs: { yr: { lower_limit: -80, upper_limit: 0, damping: 100 } } }, van_right_front_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 60, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1.5, equilibrium: -0.1, stiffness: 22e3, damping: 500 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 1e3, damping: 20 }, zr: { lower_limit: -5, upper_limit: -1, equilibrium: -1, stiffness: 6e3, damping: 85 } } }, vn_back_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 40, forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 0.5, equilibrium: -0.1, stiffness: 25e3, damping: 550 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, damping: 20 } } }, vn_front_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 40, forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -0.5, upper_limit: 0.5, equilibrium: 0, stiffness: 25e3, damping: 550 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, damping: 20 } } }, wine_fox_back_bumper_left: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "zp", required_tags: ["machine_max:back", "machine_max:bumper"], integrity: 10, joint_attrs: { zr: { lower_limit: -30, upper_limit: 30, equilibrium: 0, stiffness: 5e3, damping: 100 } } }, wine_fox_back_bumper_right: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "zp", required_tags: ["machine_max:back", "machine_max:bumper"], integrity: 10, joint_attrs: { zr: { lower_limit: -30, upper_limit: 30, equilibrium: 0, stiffness: 5e3, damping: 100 } } }, wine_fox_front_bumper_left: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "zn", required_tags: ["machine_max:front", "machine_max:bumper"], integrity: 10, joint_attrs: { zr: { lower_limit: -30, upper_limit: 30, equilibrium: 0, stiffness: 5e3, damping: 100 } } }, wine_fox_front_bumper_right: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "zn", required_tags: ["machine_max:front", "machine_max:bumper"], integrity: 10, joint_attrs: { zr: { lower_limit: -30, upper_limit: 30, equilibrium: 0, stiffness: 5e3, damping: 100 } } }, wine_fox_front_light_left: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "zn", integrity: 10, joint_attrs: { zr: { lower_limit: -30, upper_limit: 30, equilibrium: 0, stiffness: 4e3, damping: 100 } } }, wine_fox_front_light_right: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "zn", integrity: 10, joint_attrs: { zr: { lower_limit: -30, upper_limit: 30, equilibrium: 0, stiffness: 4e3, damping: 100 } } }, wine_fox_hood_axis: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", required_tags: ["machine_max:hood"], integrity: 20, joint_attrs: { xr: { lower_limit: -80, upper_limit: 0, equilibrium: -45, stiffness: 1e3, damping: 100 } } }, wine_fox_left_back_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 30, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1.5, equilibrium: -0.1, stiffness: 22e3, damping: 500 }, xr: { lower_limit: 1, upper_limit: -1 }, zr: { lower_limit: 1, upper_limit: 5, equilibrium: 1, stiffness: 6e3, damping: 85 } } }, wine_fox_left_door_axis: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", required_tags: ["machine_max:left", "machine_max:door"], integrity: 20, joint_attrs: { yr: { lower_limit: 0, upper_limit: 80, damping: 100 } } }, wine_fox_left_front_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xn", integrity: 30, required_tags: ["machine_max:left"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1.5, equilibrium: -0.1, stiffness: 22e3, damping: 500 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 1e3, damping: 20 }, zr: { lower_limit: 1, upper_limit: 5, equilibrium: 1, stiffness: 6e3, damping: 85 } } }, wine_fox_right_back_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 30, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1.5, equilibrium: -0.1, stiffness: 22e3, damping: 500 }, xr: { lower_limit: 1, upper_limit: -1 }, zr: { lower_limit: -5, upper_limit: -1, equilibrium: -1, stiffness: 6e3, damping: 85 } } }, wine_fox_right_door_axis: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", required_tags: ["machine_max:right", "machine_max:door"], integrity: 20, joint_attrs: { yr: { lower_limit: -80, upper_limit: 0, damping: 100 } } }, wine_fox_right_front_wheel: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", direction: "xp", integrity: 30, required_tags: ["machine_max:right"], acceptable_tags: [], forbidden_tags: ["machine_max:hull", "machine_max:chassis"], joint_attrs: { y: { lower_limit: -1, upper_limit: 1.5, equilibrium: -0.1, stiffness: 22e3, damping: 500 }, xr: { lower_limit: 1, upper_limit: -1 }, yr: { lower_limit: -45, upper_limit: 45, stiffness: 1e3, damping: 20 }, zr: { lower_limit: -5, upper_limit: -1, equilibrium: -1, stiffness: 6e3, damping: 85 } } }, wine_fox_trunk_door_axis: { $schema: "../../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json", type: "Advanced", required_tags: ["machine_max:trunk"], integrity: 20, joint_attrs: { xr: { lower_limit: 80, upper_limit: 0, equilibrium: 45, stiffness: 1e3, damping: 100 } } } };
    }
  });

  // <define:__BUILTIN_MATERIALS__>
  var define_BUILTIN_MATERIALS_default;
  var init_define_BUILTIN_MATERIALS = __esm({
    "<define:__BUILTIN_MATERIALS__>"() {
      define_BUILTIN_MATERIALS_default = { "5083_aluminum_alloy": { $schema: "../docs/zh_cn/schemas/base/material_attr.schema.json", friction: [0.55, 0.55, 0.5], slip_adaptation: 0.6, rolling_friction: 0.02, spinning_friction: 0.5, restitution: 0.4, block_damage_factor: 0.7, angle_effect: true, impact_modifiers: [{ operation: "multiply", value: 0.85, condition: { type: "always" } }], penetration_modifiers: [], damage_modifiers: [{ operation: "add", value: -4, condition: { type: "damage_type", id: "minecraft:fly_into_wall" } }, { operation: "multiply", value: 0.04, condition: { type: "damage_type", id: "minecraft:sweet_berry_bush" } }, { operation: "multiply", value: 0.04, condition: { type: "entity_type", id: "minecraft:slime" } }], un_penetrate_damage_factor: 0, sounds: { hit_un_pen: { sound_id: "machine_max:hit_box.hit.up_pen.metal", range: 64 }, hit_pen: { sound_id: "machine_max:hit_box.hit.pen.metal", range: 64 } } }, "7035_aluminum_alloy": { $schema: "../docs/zh_cn/schemas/base/material_attr.schema.json", friction: [0.55, 0.55, 0.5], slip_adaptation: 0.66, rolling_friction: 0.01, spinning_friction: 0.43, restitution: 0.55, block_damage_factor: 0.7, angle_effect: true, impact_modifiers: [{ operation: "multiply", value: 0.85, condition: { type: "always" } }], penetration_modifiers: [], damage_modifiers: [{ operation: "add", value: -4, condition: { type: "damage_type", id: "minecraft:fly_into_wall" } }, { operation: "multiply", value: 0.04, condition: { type: "damage_type", id: "minecraft:sweet_berry_bush" } }, { operation: "multiply", value: 0.04, condition: { type: "entity_type", id: "minecraft:slime" } }], un_penetrate_damage_factor: 0, sounds: { hit_un_pen: { sound_id: "machine_max:hit_box.hit.up_pen.metal", range: 64 }, hit_pen: { sound_id: "machine_max:hit_box.hit.pen.metal", range: 64 } } }, depleted_uranium_armor: { $schema: "../docs/zh_cn/schemas/base/material_attr.schema.json", friction: [0.55, 0.55, 0.5], slip_adaptation: 0.3, rolling_friction: 0.01, spinning_friction: 0.4, restitution: 0.2, block_damage_factor: 0.7, angle_effect: true, impact_modifiers: [{ operation: "multiply", value: 0.85, condition: { type: "always" } }], penetration_modifiers: [], damage_modifiers: [{ operation: "add", value: -4, condition: { type: "damage_type", id: "minecraft:fly_into_wall" } }, { operation: "multiply", value: 0.04, condition: { type: "damage_type", id: "minecraft:sweet_berry_bush" } }, { operation: "multiply", value: 0.04, condition: { type: "entity_type", id: "minecraft:slime" } }], un_penetrate_damage_factor: 0, sounds: { hit_un_pen: { sound_id: "machine_max:hit_box.hit.up_pen.metal", range: 64 }, hit_pen: { sound_id: "machine_max:hit_box.hit.pen.metal", range: 64 } } }, drifting_tire: { $schema: "../docs/zh_cn/schemas/base/material_attr.schema.json", friction: [1.4, 1.5, 1], slip_adaptation: 0.4, slip_curve: { longitudinal: { peak_slip_ratio: 0.16, peak_scale: 1.2, kinetic_scale: 0.6 }, lateral: { peak_angle_deg: 7, kinetic_angle_deg: 90, peak_scale: 1.3, kinetic_scale: 0.1 } }, rolling_friction: 0.01, spinning_friction: 0.8, restitution: 0.65, block_damage_factor: 0.05, impact_modifiers: [{ operation: "multiply", value: 0.1, condition: { type: "damage_tag", id: "c:is_impact" } }, { operation: "add", value: -2, condition: { type: "damage_tag", id: "c:is_impact" } }], penetration_modifiers: [], damage_modifiers: [{ operation: "multiply", value: 0.1, condition: { type: "damage_tag", id: "c:is_impact" } }, { operation: "add", value: -2, condition: { type: "damage_tag", id: "c:is_impact" } }, { operation: "multiply", value: 0.05, condition: { type: "damage_type", id: "minecraft:sweet_berry_bush" } }, { operation: "multiply", value: 0.05, condition: { type: "entity_type", id: "minecraft:slime" } }, { operation: "multiply", value: 0.1, condition: { type: "entity_type", id: "minecraft:magma_cube" } }] }, glass: { $schema: "../docs/zh_cn/schemas/base/material_attr.schema.json", friction: [0.65, 0.65, 0.5], slip_adaptation: 0.15, rolling_friction: 1e-3, spinning_friction: 0.4, restitution: 0.6, block_damage_factor: 0.6, angle_effect: false, impact_modifiers: [{ operation: "multiply", value: 0.85, condition: { type: "always" } }, { operation: "add", value: -10, condition: { type: "always" } }], penetration_modifiers: [], damage_modifiers: [{ operation: "add", value: -10, condition: { type: "damage_type", id: "minecraft:fly_into_wall" } }, { operation: "multiply", value: 0.03, condition: { type: "damage_type", id: "minecraft:sweet_berry_bush" } }, { operation: "multiply", value: 0.03, condition: { type: "entity_type", id: "minecraft:slime" } }], un_penetrate_damage_factor: 0, sounds: { hit_un_pen: { sound_id: "machine_max:hit_box.hit.up_pen.glass", range: 48 }, hit_pen: { sound_id: "machine_max:hit_box.hit.pen.glass", range: 48 } } }, hardwood: { $schema: "../docs/zh_cn/schemas/base/material_attr.schema.json", friction: [0.65, 0.65, 0.5], slip_adaptation: 0.4, rolling_friction: 0.15, spinning_friction: 0.015, restitution: 0.2, block_damage_factor: 0.6, angle_effect: false, impact_modifiers: [{ operation: "multiply", value: 0.85, condition: { type: "always" } }, { operation: "add", value: -4, condition: { type: "always" } }], penetration_modifiers: [], damage_modifiers: [{ operation: "add", value: -3, condition: { type: "damage_type", id: "minecraft:fly_into_wall" } }, { operation: "multiply", value: 0.03, condition: { type: "damage_type", id: "minecraft:sweet_berry_bush" } }, { operation: "multiply", value: 0.03, condition: { type: "entity_type", id: "minecraft:slime" } }], un_penetrate_damage_factor: 0, sounds: { hit_un_pen: { sound_id: "machine_max:hit_box.hit.up_pen.wood_hard", range: 48 }, hit_pen: { sound_id: "machine_max:hit_box.hit.pen.wood_hard", range: 48 } } }, ice: { $schema: "../docs/zh_cn/schemas/base/material_attr.schema.json", friction: [0.15, 0.15, 0.5], slip_adaptation: 0.05, rolling_friction: 1e-3, spinning_friction: 0.05, restitution: 0.05, block_damage_factor: 0.7, angle_effect: true, impact_modifiers: [{ operation: "multiply", value: 0.85, condition: { type: "always" } }], penetration_modifiers: [], damage_modifiers: [{ operation: "add", value: -4, condition: { type: "damage_type", id: "minecraft:fly_into_wall" } }, { operation: "multiply", value: 0.04, condition: { type: "damage_type", id: "minecraft:sweet_berry_bush" } }, { operation: "multiply", value: 0.04, condition: { type: "entity_type", id: "minecraft:slime" } }], un_penetrate_damage_factor: 0, sounds: { hit_un_pen: { sound_id: "machine_max:hit_box.hit.up_pen.metal", range: 64 }, hit_pen: { sound_id: "machine_max:hit_box.hit.pen.metal", range: 64 } } }, normal_tire: { $schema: "../docs/zh_cn/schemas/base/material_attr.schema.json", friction: [1.4, 1.5, 1], slip_adaptation: 0.4, slip_curve: { longitudinal: { peak_slip_ratio: 0.2, peak_scale: 1.4, kinetic_scale: 0.9 }, lateral: { peak_angle_deg: 12, peak_scale: 1.3, kinetic_scale: 0.8 } }, rolling_friction: 0.01, spinning_friction: 0.8, restitution: 0.65, block_damage_factor: 0.05, impact_modifiers: [{ operation: "multiply", value: 0.1, condition: { type: "damage_tag", id: "c:is_impact" } }, { operation: "add", value: -2, condition: { type: "damage_tag", id: "c:is_impact" } }], penetration_modifiers: [], damage_modifiers: [{ operation: "multiply", value: 0.1, condition: { type: "damage_tag", id: "c:is_impact" } }, { operation: "add", value: -2, condition: { type: "damage_tag", id: "c:is_impact" } }, { operation: "multiply", value: 0.05, condition: { type: "damage_type", id: "minecraft:sweet_berry_bush" } }, { operation: "multiply", value: 0.05, condition: { type: "entity_type", id: "minecraft:slime" } }, { operation: "multiply", value: 0.1, condition: { type: "entity_type", id: "minecraft:magma_cube" } }] }, off_road_tire: { $schema: "../docs/zh_cn/schemas/base/material_attr.schema.json", friction: [1.2, 1.5, 1], slip_adaptation: 0.8, rolling_friction: 0.2, spinning_friction: 0.7, restitution: 0.6, block_damage_factor: 0.05, impact_modifiers: [{ operation: "multiply", value: 0.1, condition: { type: "damage_tag", id: "c:is_impact" } }, { operation: "add", value: -2, condition: { type: "damage_tag", id: "c:is_impact" } }], penetration_modifiers: [], damage_modifiers: [{ operation: "multiply", value: 0.1, condition: { type: "damage_tag", id: "c:is_impact" } }, { operation: "add", value: -2, condition: { type: "damage_tag", id: "c:is_impact" } }, { operation: "multiply", value: 0.05, condition: { type: "damage_type", id: "minecraft:sweet_berry_bush" } }, { operation: "multiply", value: 0.05, condition: { type: "entity_type", id: "minecraft:slime" } }, { operation: "multiply", value: 0.1, condition: { type: "entity_type", id: "minecraft:magma_cube" } }] }, paper: { $schema: "../docs/zh_cn/schemas/base/material_attr.schema.json", friction: [0.55, 0.55, 0.5], slip_adaptation: 0.9, rolling_friction: 0.05, spinning_friction: 0.3, restitution: 0.01, block_damage_factor: 0.7, angle_effect: true, impact_modifiers: [{ operation: "multiply", value: 0.85, condition: { type: "always" } }], penetration_modifiers: [], damage_modifiers: [{ operation: "add", value: -4, condition: { type: "damage_type", id: "minecraft:fly_into_wall" } }, { operation: "multiply", value: 0.04, condition: { type: "damage_type", id: "minecraft:sweet_berry_bush" } }, { operation: "multiply", value: 0.04, condition: { type: "entity_type", id: "minecraft:slime" } }], un_penetrate_damage_factor: 0, sounds: { hit_un_pen: { sound_id: "machine_max:hit_box.hit.up_pen.metal", range: 64 }, hit_pen: { sound_id: "machine_max:hit_box.hit.pen.metal", range: 64 } } }, pvc: { $schema: "../docs/zh_cn/schemas/base/material_attr.schema.json", friction: [0.55, 0.55, 0.5], slip_adaptation: 0.38, rolling_friction: 0.018, spinning_friction: 0.38, restitution: 0.55, block_damage_factor: 0.7, angle_effect: true, impact_modifiers: [{ operation: "multiply", value: 0.85, condition: { type: "always" } }], penetration_modifiers: [], damage_modifiers: [{ operation: "add", value: -4, condition: { type: "damage_type", id: "minecraft:fly_into_wall" } }, { operation: "multiply", value: 0.04, condition: { type: "damage_type", id: "minecraft:sweet_berry_bush" } }, { operation: "multiply", value: 0.04, condition: { type: "entity_type", id: "minecraft:slime" } }], un_penetrate_damage_factor: 0, sounds: { hit_un_pen: { sound_id: "machine_max:hit_box.hit.up_pen.metal", range: 64 }, hit_pen: { sound_id: "machine_max:hit_box.hit.pen.metal", range: 64 } } }, racing_tire: { $schema: "../docs/zh_cn/schemas/base/material_attr.schema.json", friction: [3, 3, 1], slip_adaptation: 0.3, slip_curve: { longitudinal: { peak_slip_ratio: 0.2, peak_scale: 1.4, kinetic_scale: 0.9 }, lateral: { peak_angle_deg: 25, peak_scale: 1.4, kinetic_scale: 0.9 } }, rolling_friction: 0.015, spinning_friction: 1.3, restitution: 0.4, block_damage_factor: 0.05, impact_modifiers: [{ operation: "multiply", value: 0.1, condition: { type: "damage_tag", id: "c:is_impact" } }, { operation: "add", value: -2, condition: { type: "damage_tag", id: "c:is_impact" } }], penetration_modifiers: [], damage_modifiers: [{ operation: "multiply", value: 0.1, condition: { type: "damage_tag", id: "c:is_impact" } }, { operation: "add", value: -2, condition: { type: "damage_tag", id: "c:is_impact" } }, { operation: "multiply", value: 0.05, condition: { type: "damage_type", id: "minecraft:sweet_berry_bush" } }, { operation: "multiply", value: 0.05, condition: { type: "entity_type", id: "minecraft:slime" } }, { operation: "multiply", value: 0.1, condition: { type: "entity_type", id: "minecraft:magma_cube" } }] }, rha: { $schema: "../docs/zh_cn/schemas/base/material_attr.schema.json", friction: [0.35, 0.35, 0.5], slip_adaptation: 0.65, rolling_friction: 0.28, spinning_friction: 0, restitution: 0.07, block_damage_factor: 1.3, angle_effect: true, impact_modifiers: [{ operation: "multiply", value: 0.55, condition: { type: "always" } }], penetration_modifiers: [], damage_modifiers: [{ operation: "add", value: -9, condition: { type: "damage_type", id: "minecraft:fly_into_wall" } }, { operation: "multiply", value: 0.09, condition: { type: "damage_type", id: "minecraft:sweet_berry_bush" } }, { operation: "multiply", value: 0.09, condition: { type: "entity_type", id: "minecraft:slime" } }], un_penetrate_damage_factor: 0, sounds: { hit_un_pen: { sound_id: "machine_max:hit_box.hit.up_pen.metal", range: 64 }, hit_pen: { sound_id: "machine_max:hit_box.hit.pen.metal", range: 64 } } }, softwood: { $schema: "../docs/zh_cn/schemas/base/material_attr.schema.json", friction: [0.7, 0.7, 0.5], slip_adaptation: 0.35, rolling_friction: 0.12, spinning_friction: 0.02, restitution: 0.25, block_damage_factor: 0.4, angle_effect: false, impact_modifiers: [{ operation: "multiply", value: 0.9, condition: { type: "always" } }, { operation: "add", value: -3, condition: { type: "always" } }], penetration_modifiers: [], damage_modifiers: [{ operation: "add", value: -2, condition: { type: "damage_type", id: "minecraft:fly_into_wall" } }, { operation: "multiply", value: 0.02, condition: { type: "damage_type", id: "minecraft:sweet_berry_bush" } }, { operation: "multiply", value: 0.02, condition: { type: "entity_type", id: "minecraft:slime" } }], un_penetrate_damage_factor: 0, sounds: { hit_un_pen: { sound_id: "machine_max:hit_box.hit.up_pen.wood", range: 48 }, hit_pen: { sound_id: "machine_max:hit_box.hit.pen.wood", range: 48 } } }, structural_steel: { $schema: "../docs/zh_cn/schemas/base/material_attr.schema.json", friction: [0.45, 0.45, 0.5], slip_adaptation: 0.55, rolling_friction: 0.22, spinning_friction: 0, restitution: 0.12, block_damage_factor: 1.1, angle_effect: true, impact_modifiers: [{ operation: "multiply", value: 0.7, condition: { type: "always" } }], penetration_modifiers: [{ operation: "multiply", value: 0.5, condition: { type: "not", condition: { type: "damage_tag", id: "minecraft:bypasses_armor" } } }], damage_modifiers: [{ operation: "add", value: -6, condition: { type: "damage_type", id: "minecraft:fly_into_wall" } }, { operation: "multiply", value: 0.06, condition: { type: "damage_type", id: "minecraft:sweet_berry_bush" } }, { operation: "multiply", value: 0.06, condition: { type: "entity_type", id: "minecraft:slime" } }], un_penetrate_damage_factor: 0, sounds: { hit_un_pen: { sound_id: "machine_max:hit_box.hit.up_pen.metal", range: 64 }, hit_pen: { sound_id: "machine_max:hit_box.hit.pen.metal", range: 64 } } } };
    }
  });

  // <define:__BUILTIN_PACK_META__>
  var define_BUILTIN_PACK_META_default;
  var init_define_BUILTIN_PACK_META = __esm({
    "<define:__BUILTIN_PACK_META__>"() {
      define_BUILTIN_PACK_META_default = { id: "machine_max:official", version: "1.0", author: "\u4F5C\u8005", description: "\u63CF\u8FF0\u4FE1\u606F", dependencies: [{ id: "machine_max:builtin", type: "hard" }] };
    }
  });

  // <define:__BUILTIN_SUBSYSTEMS__>
  var define_BUILTIN_SUBSYSTEMS_default;
  var init_define_BUILTIN_SUBSYSTEMS = __esm({
    "<define:__BUILTIN_SUBSYSTEMS__>"() {
      define_BUILTIN_SUBSYSTEMS_default = { ae86_back_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 300, roll: { max_drive_force: 2500, max_brake_force: 1500, max_hand_brake_force: 2500, max_speed: 2500 }, steering: { max_force: 0, max_speed: 0 }, abs_enabled: false, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.469, control_inputs: ["car_control"] }, ae86_car_controller: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:car_controller", basic_durability: 150, manual_gear_shift: false, auto_hand_brake: true, steering_center: [0, 0, 2.4036], min_steering_radius: 4, lateral_acceleration: 40, max_drift_angular_velocity: 9.42, control_inputs: ["move_control"] }, ae86_engine: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:engine", basic_durability: 220, max_power: 96941, max_torque: 186, idle_rpm: 1200, idle_rpm_torque_ratio: 0.333, max_torque_rpm: 5200, red_line_rpm: 7500, red_line_torque_ratio: 0.91, inertia: 20, damping_factors: [2, 0.03, 2e-5], sounds: { on_activate: { sound_id: "machine_max:subsystem.engine.i4_start", range: 64 }, on_deactivate: { sound_id: "machine_max:subsystem.engine.i4_stop", range: 64 }, working_sounds: { "800.0": { sound_id: "machine_max:subsystem.engine.i4_800", range: 64 }, "2000.0": { sound_id: "machine_max:subsystem.engine.i4_2000", range: 64 }, "3000.0": { sound_id: "machine_max:subsystem.engine.i4_3000", range: 64 }, "4000.0": { sound_id: "machine_max:subsystem.engine.i4_4000", range: 64 }, "5000.0": { sound_id: "machine_max:subsystem.engine.i4_5000", range: 64 }, "6000.0": { sound_id: "machine_max:subsystem.engine.i4_6000", range: 64 }, "7000.0": { sound_id: "machine_max:subsystem.engine.i4_7000", range: 64 } } } }, ae86_front_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 300, roll: { max_drive_force: 0, max_brake_force: 1500, max_hand_brake_force: 0, max_speed: 2500 }, steering: { max_force: 4e3, max_speed: 3.14 }, abs_enabled: false, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.469, control_inputs: ["car_control"] }, ae86_gearbox: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:gearbox", basic_durability: 120, final_ratio: 8.5, ratios: [-3.5, 3.2, 2.5, 1.75, 1.4, 1.15], switch_time: 0.1, control_inputs: ["car_control"] }, ae86_transmission: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:transmission", basic_durability: 400, diff_lock: "auto", diff_lock_sensitivity: 1, auto_diff_lock_threshold: 10, diff_lock_inputs: ["diff_lock_control"] }, ae86at_back_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 400, roll: { max_drive_force: 3e3, max_brake_force: 2e3, max_hand_brake_force: 4500, max_speed: 3e3 }, steering: { max_force: 0, max_speed: 0 }, abs_enabled: false, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.8125, control_inputs: ["car_control"] }, ae86at_car_controller: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:car_controller", basic_durability: 200, manual_gear_shift: false, auto_hand_brake: true, steering_center: [0, 0, 2.4036], min_steering_radius: 6, lateral_acceleration: 40, max_drift_angular_velocity: 1, control_inputs: ["move_control"] }, ae86at_engine: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:engine", basic_durability: 270, max_power: 178968, max_torque: 179, idle_rpm: 1200, idle_rpm_torque_ratio: 0.333, max_torque_rpm: 6e3, red_line_rpm: 11e3, red_line_torque_ratio: 0.7, inertia: 18, four_stroke: true, cylinder: 4, damping_factors: [2, 0.03, 2e-5], sounds: { on_activate: { sound_id: "machine_max:subsystem.engine.i4_start", range: 64 }, on_deactivate: { sound_id: "machine_max:subsystem.engine.i4_stop", range: 64 }, working_sounds: { "1000.0": { sound_id: "machine_max:subsystem.engine.i4_1000", range: 64 }, "2000.0": { sound_id: "machine_max:subsystem.engine.i4_2000", range: 64 }, "3000.0": { sound_id: "machine_max:subsystem.engine.i4_3000", range: 64 }, "4000.0": { sound_id: "machine_max:subsystem.engine.i4_4000", range: 64 }, "5000.0": { sound_id: "machine_max:subsystem.engine.i4_5000", range: 64 }, "6000.0": { sound_id: "machine_max:subsystem.engine.i4_6000", range: 64 } } } }, ae86at_front_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 400, roll: { max_drive_force: 3e3, max_brake_force: 2e3, max_hand_brake_force: 0, max_speed: 3e3 }, steering: { max_force: 4e3, max_speed: 3.14 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.8125, control_inputs: ["car_control"] }, ae86at_gearbox: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:gearbox", basic_durability: 270, final_ratio: 24.5, ratios: [-3.5, 3.2, 2.5, 1.75, 1.4, 1.15], switch_time: 0.24, control_inputs: ["car_control"] }, ae86at_transmission: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:transmission", basic_durability: 500, diff_lock: "auto", diff_lock_sensitivity: 0.75, auto_diff_lock_threshold: 15, diff_lock_inputs: ["diff_lock_control"] }, beam_light: { $schema: "../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:lighting", basic_durability: 2, hidden: true, light_type: "beam", range: 16, color: [255, 245, 210], intensity: 0.5, beam_angle: 24 }, container_16x16x32: { $schema: "../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:item_storage", basic_durability: 600, rows: 6, columns: 9 }, container_16x16x8: { $schema: "../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:item_storage", basic_durability: 100, rows: 1, columns: 9 }, container_16x32x32: { $schema: "../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:item_storage", basic_durability: 800, rows: 9, columns: 12 }, dayun_back_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 700, roll: { max_drive_force: 28e3, max_brake_force: 2e4, max_hand_brake_force: 35e3, max_speed: 3540 }, steering: { max_force: 0, max_speed: 0 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.5, control_inputs: ["car_control"], sounds: { brake_on: { sound_id: "machine_max:subsystem.wheel_driver.air_brake_on", range: 16 }, brake_off: { sound_id: "machine_max:subsystem.wheel_driver.air_brake_off", range: 16 } } }, dayun_car_controller: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:car_controller", basic_durability: 700, manual_gear_shift: false, auto_hand_brake: true, steering_center: [0, 0, 0.5], min_steering_radius: 7, lateral_acceleration: 20, max_drift_angular_velocity: 0.8, control_inputs: ["move_control"] }, dayun_engine: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:engine", basic_durability: 700, max_power: 368e3, max_torque: 2500, idle_rpm: 550, idle_rpm_torque_ratio: 0.5, max_torque_rpm: 1200, red_line_rpm: 2200, red_line_torque_ratio: 0.65, inertia: 50, cylinder: 6, damping_factors: [15, 0.1, 1e-4], sounds: { on_activate: { sound_id: "machine_max:subsystem.engine.v8d_start", range: 64 }, on_deactivate: { sound_id: "machine_max:subsystem.engine.v8d_stop", range: 64 }, working_sounds: { "500.0": { sound_id: "machine_max:subsystem.engine.v8d_500", range: 64 }, "1000.0": { sound_id: "machine_max:subsystem.engine.v8d_1000", range: 64 }, "1500.0": { sound_id: "machine_max:subsystem.engine.v8d_1500", range: 64 }, "2000.0": { sound_id: "machine_max:subsystem.engine.v8d_2000", range: 64 } } } }, dayun_front_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 700, roll: { max_drive_force: 0, max_brake_force: 2e4, max_hand_brake_force: 0, max_speed: 3540 }, steering: { max_force: 5e3, max_speed: 1.2 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.5, control_inputs: ["car_control"], sounds: { brake_on: { sound_id: "machine_max:subsystem.wheel_driver.air_brake_on", range: 16 }, brake_off: { sound_id: "machine_max:subsystem.wheel_driver.air_brake_off", range: 16 } } }, dayun_gearbox: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:gearbox", basic_durability: 620, final_ratio: 3.7, ratios: [-12.3, 12.1, 9.41, 7.31, 5.71, 4.46, 3.4, 2.7, 2.11, 1.84, 1.3, 1, 0.78], switch_time: 0.3, control_inputs: ["car_control"] }, dayun_seat: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:seat", block_damage: false, render_passenger: true, passenger_scale: [1, 1, 1], views: { enable_first_person: true, first_person_hud: ["machine_max:example_hud_2"], enable_third_person: true, third_person_hud: ["machine_max:example_hud_2"], follow_vehicle: true, focus_on_center: true, distance_scale: 1.1 }, allow_use_items: true }, dayun_transmission: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:transmission", basic_durability: 800, diff_lock: "auto", diff_lock_sensitivity: 1, auto_diff_lock_threshold: 10, diff_lock_inputs: ["diff_lock_control"] }, default_glass: { $schema: "../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:basic", basic_durability: 2, pass_damage: false, limit_damage: false, sounds: { on_destroyed: { sound_id: "machine_max:subsystem.baisc.glass.break", range: 32 } }, hidden: true }, default_passenger_seat: { $schema: "../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:seat", block_damage: false, render_passenger: true, passenger_scale: [1, 1, 1], views: { enable_first_person: true, enable_third_person: true, follow_vehicle: true, focus_on_center: true, distance_scale: 1.2, min_pitch: -90, max_pitch: 90, yaw_limit: 360 }, allow_use_items: true }, default_seat: { $schema: "../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:seat", block_damage: false, render_passenger: true, passenger_scale: [1, 1, 1], views: { enable_first_person: true, first_person_hud: ["machine_max:example_hud"], enable_third_person: true, third_person_hud: ["machine_max:example_hud"], follow_vehicle: true, focus_on_center: true, distance_scale: 1.2, min_pitch: -70, max_pitch: 45, yaw_limit: 270 }, allow_use_items: true }, default_trunk: { $schema: "../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:item_storage", basic_durability: 100, rows: 6, columns: 9 }, dummy_light: { $schema: "../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:lighting", basic_durability: 2, hidden: true, light_type: "point", range: 0, intensity: 0 }, glove_box: { $schema: "../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:item_storage", basic_durability: 50, rows: 2, columns: 3 }, golden_closestool: { $schema: "../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:seat", block_damage: false, render_passenger: true, passenger_scale: [1, 1, 1], views: { enable_first_person: true, first_person_hud: ["machine_max:example_hud"], enable_third_person: true, third_person_hud: ["machine_max:example_hud"], follow_vehicle: true, focus_on_center: true, distance_scale: 1.1 }, allow_use_items: true }, jeep_back_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 500, roll: { max_drive_force: 8e3, max_brake_force: 5e3, max_hand_brake_force: 3e3, max_speed: 3140 }, steering: { max_force: 0, max_speed: 0 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.672, control_inputs: ["car_control"] }, jeep_car_controller: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:car_controller", basic_durability: 350, manual_gear_shift: false, auto_hand_brake: true, drift_assist: false, steering_center: [0, 0, 2.4036], min_steering_radius: 6.2, lateral_acceleration: 40, max_drift_angular_velocity: 1, control_inputs: ["move_control"] }, jeep_engine: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:engine", basic_durability: 220, max_power: 195e3, max_torque: 400, idle_rpm: 750, idle_rpm_torque_ratio: 0.4, max_torque_rpm: 3e3, red_line_rpm: 6e3, red_line_torque_ratio: 0.6, inertia: 15, cylinder: 6, damping_factors: [3, 0.05, 5e-5] }, jeep_front_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 500, roll: { max_drive_force: 8e3, max_brake_force: 5e3, max_hand_brake_force: 0, max_speed: 3140 }, steering: { max_force: 3500, max_speed: 1.9 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.672, control_inputs: ["car_control"] }, jeep_gearbox: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:gearbox", basic_durability: 220, final_ratio: 10, ratios: [-3.3, 4.71, 3.14, 2.1, 1.6, 1.29, 1.1, 0.88, 0.67], switch_time: 0.2, control_inputs: ["car_control"] }, jeep_transmission: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:transmission", basic_durability: 500, diff_lock: "auto", diff_lock_sensitivity: 0.98, auto_diff_lock_threshold: 5, diff_lock_inputs: ["diff_lock_control"] }, kluo_back_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 100, roll: { max_drive_force: 2500, max_brake_force: 1500, max_hand_brake_force: 2500, max_speed: 3140 }, steering: { max_force: 0, max_speed: 0 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.375, control_inputs: ["car_control"] }, kluo_car_controller: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:car_controller", basic_durability: 50, manual_gear_shift: false, auto_hand_brake: true, steering_center: [0, 0, 1.96], min_steering_radius: 3.5, lateral_acceleration: 40, max_drift_angular_velocity: 1, control_inputs: ["move_control"] }, kluo_front_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 100, roll: { max_drive_force: 500, max_brake_force: 2200, max_hand_brake_force: 0, max_speed: 3140 }, steering: { max_force: 2e3, max_speed: 3.14 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.375, control_inputs: ["car_control"] }, kluo_gearbox: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:gearbox", basic_durability: 100, final_ratio: 8, ratios: [2, 1.3] }, kluo_motor: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:motor", basic_durability: 50, max_power: 5e4, max_torque: 250, inertia: 2, damping_factors: [10, 0.1, 1e-4] }, kluo_transmission: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:transmission", basic_durability: 50, diff_lock: "auto", diff_lock_sensitivity: 0.6, auto_diff_lock_threshold: 12 }, mini_ev_back_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 100, roll: { max_drive_force: 1500, max_brake_force: 400, max_hand_brake_force: 500, max_speed: 3140 }, steering: { max_force: 0, max_speed: 0 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.35, control_inputs: ["car_control"] }, mini_ev_car_controller: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:car_controller", basic_durability: 100, manual_gear_shift: false, auto_hand_brake: true, steering_center: [0, 0, 2.4036], min_steering_radius: 4.2, lateral_acceleration: 40, max_drift_angular_velocity: 1, control_inputs: ["move_control"] }, mini_ev_front_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 100, roll: { max_drive_force: 0, max_brake_force: 800, max_hand_brake_force: 0, max_speed: 3140 }, steering: { max_force: 2e3, max_speed: 3.14 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.35, control_inputs: ["car_control"] }, mini_ev_motor: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:motor", basic_durability: 145, max_power: 2e4, max_torque: 85, inertia: 10, damping_factors: [2, 0.05, 5e-5], sounds: { working_sounds: { "3000.0": { sound_id: "machine_max:subsystem.motor.elec_3000", range: 64 } } } }, mini_ev_transmission: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:transmission", basic_durability: 290, diff_lock: "auto", diff_lock_sensitivity: 0.85, auto_diff_lock_threshold: 10, diff_lock_inputs: ["diff_lock_control"] }, point_light: { $schema: "../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:lighting", basic_durability: 2, hidden: true, light_type: "point", range: 1, color: [255, 235, 180], intensity: 0.55, beam_angle: 24 }, r700_back_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 100, roll: { max_drive_force: 2500, max_brake_force: 300, max_hand_brake_force: 200, max_speed: 3140 }, steering: { max_force: 0, max_speed: 0 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.3, control_inputs: ["car_control"] }, r700_engine: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:engine", basic_durability: 50, max_power: 5900, max_torque: 8.8, idle_rpm: 500, idle_rpm_torque_ratio: 0.5, max_torque_rpm: 5500, red_line_rpm: 9500, red_line_torque_ratio: 0.8, inertia: 20, four_stroke: true, cylinder: 1, damping_factors: [0, 1e-4, 1e-5], sounds: { on_activate: { sound_id: "machine_max:subsystem.engine.i2_start", range: 64 }, on_deactivate: { sound_id: "machine_max:subsystem.engine.i2_stop", range: 64 }, working_sounds: { "800.0": { sound_id: "machine_max:subsystem.engine.i2_800", range: 64 }, "2000.0": { sound_id: "machine_max:subsystem.engine.i2_2000", range: 64 }, "3000.0": { sound_id: "machine_max:subsystem.engine.i2_3000", range: 64 }, "4000.0": { sound_id: "machine_max:subsystem.engine.i2_4000", range: 64 }, "5000.0": { sound_id: "machine_max:subsystem.engine.i2_5000", range: 64 }, "6000.0": { sound_id: "machine_max:subsystem.engine.i2_6000", range: 64 } } } }, r700_front_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 100, roll: { max_drive_force: 0, max_brake_force: 600, max_hand_brake_force: 0, max_speed: 3140 }, steering: { max_force: 500, max_speed: 3.14 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.3, control_inputs: ["car_control"] }, r700_gearbox: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:gearbox", basic_durability: 50, final_ratio: 15, ratios: [-3.5, 3.5, 2.8, 2, 1.4] }, r700_motorbike_controller: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:motorbike_controller", basic_durability: 40, steering_center: [0, -0.6875, 0.85], min_steering_radius: 3.5, lateral_acceleration: 20, max_drift_angular_velocity: 1.8, control_inputs: ["move_control"], max_angle: 35, parking_angle: 5 }, senna_gtr_back_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 100, roll: { max_drive_force: 2500, max_brake_force: 1500, max_hand_brake_force: 700, max_speed: 3140 }, steering: { max_force: 0, max_speed: 0 }, abs_wheel_radius: 0.4531 }, senna_gtr_car_controller: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:car_controller", basic_durability: 50, steering_center: [0, 0, 1.96], min_steering_radius: 4, lateral_acceleration: 60, max_drift_angular_velocity: 1 }, senna_gtr_engine: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:engine", basic_durability: 50, max_power: 615202, max_torque: 800, idle_rpm: 500, idle_rpm_torque_ratio: 0.4, max_torque_rpm: 7200, red_line_rpm: 9e3, red_line_torque_ratio: 0.95, inertia: 20, cylinder: 8, damping_factors: [2, 1e-3, 1e-6], sounds: { on_activate: { sound_id: "machine_max:subsystem.engine.v8_start", range: 64 }, on_deactivate: { sound_id: "machine_max:subsystem.engine.v8_stop", range: 64 }, working_sounds: { "800.0": { sound_id: "machine_max:subsystem.engine.v8_800", range: 64 }, "2000.0": { sound_id: "machine_max:subsystem.engine.v8_2000", range: 64 }, "3000.0": { sound_id: "machine_max:subsystem.engine.v8_3000", range: 64 }, "4000.0": { sound_id: "machine_max:subsystem.engine.v8_4000", range: 64 }, "5000.0": { sound_id: "machine_max:subsystem.engine.v8_5000", range: 64 }, "6000.0": { sound_id: "machine_max:subsystem.engine.v8_6000", range: 64 } } } }, senna_gtr_front_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 100, roll: { max_drive_force: 0, max_brake_force: 1700, max_hand_brake_force: 0, max_speed: 3140 }, steering: { max_force: 4e3, max_speed: 6.28 }, abs_wheel_radius: 0.4218 }, senna_gtr_gearbox: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:gearbox", basic_durability: 50, final_ratio: 10, ratios: [-3.5, 3.5, 2.5, 1.8, 1.4, 1, 0.7, 0.5], switch_time: 0.04 }, senna_gtr_passenger_seat: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:seat", block_damage: false, render_passenger: true, passenger_scale: [0.9, 0.9, 0.9], views: { enable_first_person: true, first_person_offset: [0, -0.08, -0.15], enable_third_person: true, follow_vehicle: true, focus_on_center: true, distance_scale: 1.2, min_pitch: -90, max_pitch: 90, yaw_limit: 360 }, allow_use_items: true }, senna_gtr_seat: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:seat", block_damage: false, render_passenger: true, passenger_scale: [0.9, 0.9, 0.9], views: { enable_first_person: true, first_person_hud: ["machine_max:example_hud"], first_person_offset: [0, -0.08, -0.15], enable_third_person: true, third_person_hud: ["machine_max:example_hud"], follow_vehicle: true, focus_on_center: true, distance_scale: 1.2, min_pitch: -70, max_pitch: 45, yaw_limit: 270 }, allow_use_items: true }, senna_gtr_transmission: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:transmission", basic_durability: 50, auto_diff_lock_threshold: 5, diff_lock_sensitivity: 2 }, szn_back_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 100, roll: { max_drive_force: 1500, max_brake_force: 600, max_hand_brake_force: 2e3, max_speed: 3140 }, steering: { max_force: 2e3, max_speed: 3.14 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.75, control_inputs: ["car_control"] }, szn_front_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 100, roll: { max_drive_force: 1500, max_brake_force: 1200, max_hand_brake_force: 0, max_speed: 3140 }, steering: { max_force: 2e3, max_speed: 3.14 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.75, control_inputs: ["car_control"] }, szn_motor: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:motor", basic_durability: 145, max_power: 1e5, max_torque: 250, inertia: 5, damping_factors: [1, 0.05, 5e-5] }, szn_motorbike_controller: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:motorbike_controller", basic_durability: 100, steering_center: [0, -0.375, 0.117], min_steering_radius: 3, lateral_acceleration: 60, max_angle: 15, parking_angle: 0, max_drift_angular_velocity: 2 }, szn_transmission: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:transmission", basic_durability: 290, auto_diff_lock_threshold: 5 }, van_back_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 100, roll: { max_drive_force: 0, max_brake_force: 500, max_hand_brake_force: 500, max_speed: 600 }, steering: { max_force: 0, max_speed: 0 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.3, control_inputs: ["car_control"] }, van_car_controller: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:car_controller", basic_durability: 80, manual_gear_shift: false, auto_hand_brake: true, steering_center: [0, 0, 1.36], min_steering_radius: 5.5, lateral_acceleration: 20, max_drift_angular_velocity: 1.3, control_inputs: ["move_control"] }, van_engine: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:engine", basic_durability: 50, max_power: 79e3, max_torque: 146, idle_rpm: 800, idle_rpm_torque_ratio: 0.333, max_torque_rpm: 3800, red_line_rpm: 6300, red_line_torque_ratio: 0.8, inertia: 10, damping_factors: [2, 0.03, 2e-5], sounds: { on_activate: { sound_id: "machine_max:subsystem.engine.i4_start", range: 64 }, on_deactivate: { sound_id: "machine_max:subsystem.engine.i4_stop", range: 64 }, working_sounds: { "800.0": { sound_id: "machine_max:subsystem.engine.i4_800", range: 64 }, "2000.0": { sound_id: "machine_max:subsystem.engine.i4_2000", range: 64 }, "3000.0": { sound_id: "machine_max:subsystem.engine.i4_3000", range: 64 }, "4000.0": { sound_id: "machine_max:subsystem.engine.i4_4000", range: 64 }, "5000.0": { sound_id: "machine_max:subsystem.engine.i4_5000", range: 64 }, "6000.0": { sound_id: "machine_max:subsystem.engine.i4_6000", range: 64 } } } }, van_front_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 100, roll: { max_drive_force: 2e3, max_brake_force: 1e3, max_hand_brake_force: 1e3, max_speed: 600 }, steering: { max_force: 1800, max_speed: 1.5 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.3, control_inputs: ["car_control"] }, van_gearbox: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:gearbox", basic_durability: 100, final_ratio: 8, ratios: [-3.58, 3.73, 2.05, 1.32, 1, 0.81] }, van_transmission: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:transmission", basic_durability: 100, diff_lock: "false", diff_lock_sensitivity: 0.85, auto_diff_lock_threshold: 10 }, vn_back_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 100, roll: { max_drive_force: 2500, max_brake_force: 500, max_hand_brake_force: 300, max_speed: 3140 }, steering: { max_force: 1e3, max_speed: 3.14 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.3984, control_inputs: ["car_control"] }, vn_front_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 100, roll: { max_drive_force: 2500, max_brake_force: 800, max_hand_brake_force: 0, max_speed: 3140 }, steering: { max_force: 1e3, max_speed: 3.14 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.3984, control_inputs: ["car_control"] }, vn_motor: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:motor", basic_durability: 150, max_power: 1e5, max_torque: 250, inertia: 5, damping_factors: [1, 0.05, 5e-5] }, vn_motorbike_controller: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:motorbike_controller", basic_durability: 40, steering_center: [0, -0.25, 0], min_steering_radius: 3.5, lateral_acceleration: 20, max_drift_angular_velocity: 2, control_inputs: ["move_control"], max_angle: 75, parking_angle: 0, correction_force_multiplier: 1 }, vn_seat: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:seat", block_damage: false, render_passenger: true, passenger_scale: [1, 1, 1], views: { enable_first_person: true, first_person_hud: ["machine_max:example_hud"], enable_third_person: true, third_person_hud: ["machine_max:example_hud"], follow_vehicle: true, focus_on_center: true, distance_scale: 1.2, min_pitch: -30, max_pitch: 90, yaw_limit: 90 }, allow_use_items: true }, vn_transmission: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:transmission", basic_durability: 250, diff_lock: "auto", diff_lock_sensitivity: 0.85, auto_diff_lock_threshold: 5 }, wine_fox_back_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 100, roll: { max_drive_force: 3500, max_brake_force: 1500, max_hand_brake_force: 3e3, max_speed: 3140 }, steering: { max_force: 0, max_speed: 0 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.375, control_inputs: ["car_control"] }, wine_fox_car_controller: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:car_controller", basic_durability: 50, manual_gear_shift: false, auto_hand_brake: true, steering_center: [0, 0, 1.96], min_steering_radius: 3, lateral_acceleration: 40, max_drift_angular_velocity: 1.2, control_inputs: ["move_control"] }, wine_fox_engine: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:engine", basic_durability: 50, max_power: 77e3, max_torque: 175, idle_rpm: 850, idle_rpm_torque_ratio: 0.3, max_torque_rpm: 2800, red_line_rpm: 5500, red_line_torque_ratio: 0.7, inertia: 12, damping_factors: [1.5, 0.03, 1e-5], sounds: { on_activate: { sound_id: "machine_max:subsystem.engine.i4_start", range: 64 }, on_deactivate: { sound_id: "machine_max:subsystem.engine.i4_stop", range: 64 }, working_sounds: { "800.0": { sound_id: "machine_max:subsystem.engine.i4_800", range: 64 }, "2000.0": { sound_id: "machine_max:subsystem.engine.i4_2000", range: 64 }, "3000.0": { sound_id: "machine_max:subsystem.engine.i4_3000", range: 64 }, "4000.0": { sound_id: "machine_max:subsystem.engine.i4_4000", range: 64 }, "5000.0": { sound_id: "machine_max:subsystem.engine.i4_5000", range: 64 }, "6000.0": { sound_id: "machine_max:subsystem.engine.i4_6000", range: 64 } } } }, wine_fox_front_wheel_driver: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:wheel_driver", basic_durability: 100, roll: { max_drive_force: 0, max_brake_force: 1800, max_hand_brake_force: 0, max_speed: 3140 }, steering: { max_force: 2e3, max_speed: 3.14 }, abs_enabled: true, abs_target_slip_ratio: 0.15, abs_wheel_radius: 0.375, control_inputs: ["car_control"] }, wine_fox_gearbox: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:gearbox", basic_durability: 50, final_ratio: 6, ratios: [-3.8, 3.8, 2.1, 1.32, 0.89] }, wine_fox_transmission: { $schema: "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json", type: "machine_max:transmission", basic_durability: 50, diff_lock: "false", diff_lock_sensitivity: 0.85, auto_diff_lock_threshold: 10 } };
    }
  });

  // <define:__SCHEMAS__>
  var define_SCHEMAS_default;
  var init_define_SCHEMAS = __esm({
    "<define:__SCHEMAS__>"() {
      define_SCHEMAS_default = { "base/axis.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/base/axis.json",\n  "title": "\u8F74\u65B9\u5411",\n  "description": "\u8868\u793A\u4E09\u7EF4\u7A7A\u95F4\u4E2D\u7684\u8F74\u65B9\u5411\uFF0C\u7528\u4E8E\u5B9A\u4E49\u8FDE\u63A5\u70B9\u7684\u6CD5\u7EBF\u65B9\u5411\u3002",\n  "type": "string",\n  "enum": ["xp", "xn", "yp", "yn", "zp", "zn"],\n  "default": "yp",\n  "examples": ["yp", "xn", "zp"],\n  "description_map": {\n    "xp": "\u6B63X\u8F74\u65B9\u5411",\n    "xn": "\u8D1FX\u8F74\u65B9\u5411",\n    "yp": "\u6B63Y\u8F74\u65B9\u5411",\n    "yn": "\u8D1FY\u8F74\u65B9\u5411",\n    "zp": "\u6B63Z\u8F74\u65B9\u5411",\n    "zn": "\u8D1FZ\u8F74\u65B9\u5411"\n  }\n}', "base/material_attr.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/base/material_attr.json",\n  "title": "\u6750\u6599\u5C5E\u6027",\n  "description": "\u5B9A\u4E49\u6750\u6599\u7684\u7269\u7406\u5C5E\u6027\uFF0C\u5305\u62EC\u6469\u64E6\u7CFB\u6570\u3001\u5F39\u6027\u3001\u4F24\u5BB3\u4FEE\u6B63\u548C\u97F3\u6548\u7B49\u3002",\n  "type": "object",\n  "properties": {\n    "$schema": {\n      "type": "string",\n      "description": "JSON Schema\u5F15\u7528\u8DEF\u5F84\uFF0C\u7528\u4E8E\u7F16\u8F91\u5668\u667A\u80FD\u63D0\u793A\u548C\u9A8C\u8BC1",\n      "default": "../docs/zh_cn/schemas/base/material_attr.schema.json"\n    },\n    "friction": {\n      "$ref": "vector_3d.schema.json",\n      "default": [0.5, 0.5, 0.5],\n      "description": "\u6469\u64E6\u7CFB\u6570\u5411\u91CF\uFF0C\u683C\u5F0F\u4E3A[x, y, z]\u3002x\u4E3A\u4FA7\u5411\u6469\u64E6\u7CFB\u6570\uFF0Cy\u4E3A\u524D\u5411\u6469\u64E6\u7CFB\u6570\uFF0Cz\u65E0\u5B9E\u9645\u610F\u4E49\u3002"\n    },\n    "slip_adaptation": {\n      "type": "number",\n      "minimum": 0.0,\n      "maximum": 1.0,\n      "default": 0.5,\n      "description": "\u6ED1\u79FB\u9002\u5E94\u7CFB\u6570\uFF0C\u7528\u4E8E\u8C03\u6574\u5728\u6ED1\u52A8\u65F6\u7684\u6469\u64E6\u884C\u4E3A\u3002"\n    },\n    "slip_curve": {\n      "type": "object",\n      "description": "\u8F6E\u80CE\u6ED1\u79FB\u6469\u64E6\u66F2\u7EBF\u53C2\u6570\u3002\u7528\u4E8E\u63A7\u5236\u7EB5\u5411\u6ED1\u79FB\u7387\u4E0E\u4FA7\u5411\u6ED1\u79FB\u89D2\u53D8\u5316\u65F6\u7684\u6469\u64E6\u7F29\u653E\u3002",\n      "properties": {\n        "longitudinal": {\n          "type": "object",\n          "description": "\u7EB5\u5411\u6ED1\u79FB\u7387\u66F2\u7EBF\u53C2\u6570\u3002",\n          "properties": {\n            "peak_slip_ratio": {\n              "type": "number",\n              "minimum": 0.0,\n              "default": 0.2,\n              "description": "\u5CF0\u503C\u6ED1\u79FB\u7387\uFF08\u65E0\u91CF\u7EB2\uFF09\uFF0C\u8FBE\u5230\u8BE5\u503C\u65F6\u6469\u64E6\u7F29\u653E\u4E3Apeak_scale\u3002"\n            },\n            "base_scale": {\n              "type": "number",\n              "default": 1.0,\n              "description": "\u6ED1\u79FB\u7387\u4E3A0\u65F6\u7684\u6469\u64E6\u7F29\u653E\u3002"\n            },\n            "peak_scale": {\n              "type": "number",\n              "default": 1.4,\n              "description": "\u5CF0\u503C\u6ED1\u79FB\u7387\u5904\u7684\u6469\u64E6\u7F29\u653E\u3002"\n            },\n            "kinetic_scale": {\n              "type": "number",\n              "default": 0.9,\n              "description": "\u9AD8\u6ED1\u79FB\u72B6\u6001\u4E0B\uFF08\u52A8\u6469\u64E6\u6BB5\uFF09\u7684\u6469\u64E6\u7F29\u653E\u3002"\n            }\n          },\n          "additionalProperties": false\n        },\n        "lateral": {\n          "type": "object",\n          "description": "\u4FA7\u5411\u6ED1\u79FB\u89D2\u66F2\u7EBF\u53C2\u6570\uFF08\u89D2\u5EA6\u5355\u4F4D\u4E3A\u5EA6\uFF09\u3002",\n          "properties": {\n            "peak_angle_deg": {\n              "type": "number",\n              "minimum": 0.0,\n              "default": 12.0,\n              "description": "\u5CF0\u503C\u4FA7\u504F\u89D2\uFF08\u5EA6\uFF09\u3002"\n            },\n            "kinetic_angle_deg": {\n              "type": "number",\n              "minimum": 0.0,\n              "default": 90.0,\n              "description": "\u8FDB\u5165\u52A8\u6469\u64E6\u5E73\u53F0\u7684\u4FA7\u504F\u89D2\uFF08\u5EA6\uFF09\u3002"\n            },\n            "base_scale": {\n              "type": "number",\n              "default": 1.0,\n              "description": "\u4FA7\u504F\u89D2\u4E3A0\u5EA6\u65F6\u7684\u6469\u64E6\u7F29\u653E\u3002"\n            },\n            "peak_scale": {\n              "type": "number",\n              "default": 1.2,\n              "description": "\u5CF0\u503C\u4FA7\u504F\u89D2\u5904\u7684\u6469\u64E6\u7F29\u653E\u3002"\n            },\n            "kinetic_scale": {\n              "type": "number",\n              "default": 0.7,\n              "description": "\u9AD8\u4FA7\u504F\u89D2\u72B6\u6001\u4E0B\uFF08\u52A8\u6469\u64E6\u6BB5\uFF09\u7684\u6469\u64E6\u7F29\u653E\u3002"\n            }\n          },\n          "additionalProperties": false\n        }\n      },\n      "additionalProperties": false\n    },\n    "rolling_friction": {\n      "type": "number",\n      "minimum": 0.0,\n      "default": 0.2,\n      "description": "\u6EDA\u52A8\u6469\u64E6\u7CFB\u6570\u3002"\n    },\n    "spinning_friction": {\n      "type": "number",\n      "minimum": 0.0,\n      "default": 0.0,\n      "description": "\u65CB\u8F6C\u6469\u64E6\u7CFB\u6570\u3002"\n    },\n    "restitution": {\n      "type": "number",\n      "minimum": 0.0,\n      "maximum": 1.0,\n      "default": 0.1,\n      "description": "\u6062\u590D\u7CFB\u6570\uFF08\u5F39\u6027\uFF09\uFF0C0\u4E3A\u5B8C\u5168\u975E\u5F39\u6027\u78B0\u649E\uFF0C1\u4E3A\u5B8C\u5168\u5F39\u6027\u78B0\u649E\u3002"\n    },\n    "block_damage_factor": {\n      "type": "number",\n      "minimum": 0.0,\n      "default": 1.0,\n      "description": "\u65B9\u5757\u7834\u574F\u7CFB\u6570\uFF0C0\u4E3A\u65E0\u6CD5\u7834\u574F\u65B9\u5757\uFF0C1\u4E3A\u9020\u6210\u5168\u989D\u4F24\u5BB3\uFF0C\u8C03\u6574\u6B64\u7CFB\u6570\u4EE5\u6539\u53D8\u5BF9\u65B9\u5757\u7684\u7834\u574F\u80FD\u529B\u3002"\n    },\n    "rha": {\n      "type": "number",\n      "minimum": 0.0,\n      "default": 1.0,\n      "description": "\u6750\u6599\u76F8\u5BF9\u8F67\u5236\u5747\u8D28\u88C5\u7532(RHA)\u7684\u6297\u7A7F\u80FD\u529B\u7CFB\u6570\u30020.5\u8868\u793A\u540C\u7B49\u539A\u5EA6\u4E0B\u4EC5\u670950%RHA\u6297\u7A7F\uFF0C1.5\u8868\u793A1.5\u500DRHA\u6297\u7A7F\u3002"\n    },\n    "angle_effect": {\n      "type": "boolean",\n      "default": true,\n      "description": "\u7B49\u6548\u62A4\u7532\u539A\u5EA6\u662F\u5426\u53D7\u5165\u5C04\u89D2\u5EA6\u5F71\u54CD\uFF0C\u82E5\u4E3Afalse\uFF0C\u5219\u8BA1\u7B97\u539A\u5EA6\u65F6\u4E0D\u8003\u8651\u5165\u5C04\u89D2\u5EA6\u3002"\n    },\n    "impact_modifiers": {\n      "$ref": "../part/subpart/hit_box/modifier/damage_modifier.schema.json",\n      "description": "\u51B2\u51FB\u4FEE\u6B63\u5668\uFF0C\u5C06\u53D7\u5230\u7684\u4F24\u5BB3\u6309\u7167\u4E00\u5B9A\u89C4\u5219\u8F6C\u6362\u4E3A\u51B2\u51FB\u6570\u503C\u65BD\u52A0\u5230\u5404\u8FDE\u63A5\u70B9\u3002\u9ED8\u8BA4\u4E3A\u7A7A\u5217\u8868\uFF0C\u9020\u6210\u591A\u5C11\u4F24\u5BB3\u5C31\u5BF9\u8FDE\u63A5\u70B9\u65BD\u52A0\u591A\u5C11\u51B2\u51FB\u3002"\n    },\n    "penetration_modifiers": {\n      "$ref": "../part/subpart/hit_box/modifier/damage_modifier.schema.json",\n      "default": [\n        {\n          "operation": "multiply",\n          "value": 0.5,\n          "condition": {\n            "type": "not",\n            "condition": {\n              "type": "damage_tag",\n              "tag": "machine_max:has_pen_depth"\n            }\n          }\n        }\n      ],\n      "description": "\u7A7F\u6DF1\u4FEE\u6B63\u5668\uFF0C\u6839\u636E\u53D7\u5230\u7684\u4F24\u5BB3\u8C03\u6574\u5176\u7A7F\u6DF1\u3002\u82E5\u4F24\u5BB3\u4E0D\u5E26\u7A7F\u6DF1\u6570\u636E\uFF0C\u5219\u4F20\u5165\u4F24\u5BB3\u503C\uFF0C\u5426\u5219\u4F20\u5165\u7A7F\u6DF1\u3002\u9ED8\u8BA4\u5728\u4F20\u5165\u7684\u4F24\u5BB3\u4E0D\u5305\u542B\u7A7F\u6DF1\u65F6\uFF0C\u4EE5\u4F24\u5BB3\u76840.5\u500D\u4F5C\u4E3A\u7A7F\u6DF1\u3002"\n    },\n    "damage_modifiers": {\n      "$ref": "../part/subpart/hit_box/modifier/damage_modifier.schema.json",\n      "default": [\n        {\n          "operation": "add",\n          "value": -5.0,\n          "condition": {\n            "type": "damage_type",\n            "id": "minecraft:fly_into_wall"\n          }\n        },\n        {\n          "operation": "multiply",\n          "value": 0.05,\n          "condition": {\n            "type": "damage_type",\n            "id": "minecraft:sweet_berry_bush"\n          }\n        },\n        {\n          "operation": "multiply",\n          "value": 0.05,\n          "condition": {\n            "type": "entity_type",\n            "id": "minecraft:slime"\n          }\n        },\n        {\n          "operation": "multiply",\n          "value": 0.1,\n          "condition": {\n            "type": "entity_type",\n            "id": "minecraft:magma_cube"\n          }\n        }\n      ],\n      "description": "\u4F24\u5BB3\u4FEE\u6B63\u5668\uFF0C\u5C06\u53D7\u5230\u7684\u4F24\u5BB3\u6309\u7167\u4E00\u5B9A\u89C4\u5219\u8F6C\u6362\u4E3A\u4F24\u5BB3\u6570\u503C\u3002\u82E5\u4F24\u5BB3\u4E0D\u5E26\u4F24\u5BB3\u6570\u636E\uFF0C\u5219\u4F20\u5165\u4F24\u5BB3\u503C\uFF0C\u5426\u5219\u4F20\u5165\u4F24\u5BB3\u6570\u636E\u3002\u9ED8\u8BA4\u5FFD\u89C65\u4EE5\u4E0B\u7684\u649E\u51FB\u4F24\u5BB3\uFF0C\u5927\u5E45\u51CF\u5F31\u53F2\u83B1\u59C6\u7B49\u6BCF\u5E27\u9020\u6210\u7684\u4F24\u5BB3\u3002"\n    },\n    "un_penetrate_damage_factor": {\n      "type": "number",\n      "minimum": 0.0,\n      "default": 0.0,\n      "description": "\u653B\u51FB\u672A\u80FD\u5B8C\u5168\u51FB\u7A7F\u62A4\u7532\u65F6\u7684\u4F24\u5BB3\u7CFB\u6570\uFF0C\u516C\u5F0F\u4E3A:\u653B\u51FB\u4F24\u5BB3*(\u7A7F\u6DF1/\u7B49\u6548\u62A4\u7532)^un_penetrate_damage_factor\uFF0C\u6B64\u9879\u4E3A0.0\u65F6\u672A\u51FB\u7A7F\u5219\u65E0\u4F24\u5BB3\u3002"\n    },\n    "sounds": {\n      "type": "object",\n      "properties": {\n        "hit_un_pen": {\n          "$ref": "sound_event.schema.json",\n          "description": "\u78B0\u649E\u7BB1\u88AB\u547D\u4E2D\u4F46\u672A\u7A7F\u900F\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",\n          "default": {\n            "sound_id": "machine_max:hit_box.hit.up_pen.metal",\n            "range": 64\n          }\n        },\n        "hit_pen": {\n          "$ref": "sound_event.schema.json",\n          "description": "\u78B0\u649E\u7BB1\u88AB\u547D\u4E2D\u4E14\u7A7F\u900F\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",\n          "default": {\n            "sound_id": "machine_max:hit_box.hit.pen.metal",\n            "range": 64\n          }\n        }\n      },\n      "additionalProperties": false,\n      "description": "\u6750\u6599\u547D\u4E2D\u97F3\u6548\u914D\u7F6E\u3002"\n    }\n  },\n  "additionalProperties": false,\n  "examples": [\n    {},\n    {\n      "friction": [0.8, 0.8, 0.8],\n      "slip_adaptation": 0.3,\n      "slip_curve": {\n        "longitudinal": {\n          "peak_slip_ratio": 0.18,\n          "base_scale": 1.0,\n          "peak_scale": 1.5,\n          "kinetic_scale": 0.85\n        },\n        "lateral": {\n          "peak_angle_deg": 10.0,\n          "kinetic_angle_deg": 75.0,\n          "base_scale": 1.0,\n          "peak_scale": 1.25,\n          "kinetic_scale": 0.65\n        }\n      },\n      "rolling_friction": 0.1,\n      "spinning_friction": 0.01,\n      "restitution": 0.05,\n      "block_damage_factor": 0.5,\n      "rha": 1.2,\n      "angle_effect": false,\n      "impact_modifiers": [\n        {\n          "operation": "multiply",\n          "value": 0.8,\n          "condition": {\n            "type": "always"\n          }\n        }\n      ],\n      "penetration_modifiers": [\n        {\n          "operation": "multiply",\n          "value": 0.3,\n          "condition": {\n            "type": "damage_type",\n            "id": "minecraft:explosion"\n          }\n        }\n      ],\n      "damage_modifiers": [\n        {\n          "operation": "add",\n          "value": -10.0,\n          "condition": {\n            "type": "damage_type",\n            "id": "minecraft:fly_into_wall"\n          }\n        },\n        {\n          "operation": "multiply",\n          "value": 0.02,\n          "condition": {\n            "type": "entity_type",\n            "id": "minecraft:slime"\n          }\n        }\n      ],\n      "un_penetrate_damage_factor": 0.2,\n      "sounds": {\n        "hit_un_pen": {\n          "sound_id": "machine_max:hit_box.hit.up_pen.rubber",\n          "range": 48\n        },\n        "hit_pen": {\n          "sound_id": "machine_max:hit_box.hit.pen.rubber",\n          "range": 48\n        }\n      }\n    }\n  ]\n}', "base/operation.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/base/operation.json",\n  "title": "\u64CD\u4F5C\u7B26",\n  "description": "\u6570\u5B66\u64CD\u4F5C\u7B26\uFF0C\u7528\u4E8E\u4FEE\u6539\u5668\u4E2D\u7684\u6570\u503C\u8FD0\u7B97",\n  "type": "string",\n  "enum": ["add", "multiply"],\n  "default": "add",\n  "examples": ["add", "multiply"]\n}', "base/resource_location.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/base/resource_location.json",
  "title": "\u8D44\u6E90\u4F4D\u7F6E",
  "description": "Minecraft \u8D44\u6E90\u4F4D\u7F6E\u6807\u8BC6\u7B26\uFF0C\u683C\u5F0F\u4E3A '\u547D\u540D\u7A7A\u95F4:\u8DEF\u5F84'",
  "type": "string",
  "pattern": "^[a-z0-9_.-]+:[a-z0-9_./-]+$",
  "examples": [
    "minecraft:fly_into_wall",
    "machine_max:has_pen_depth",
    "machine_max:textures/icon/part_icon.png"
  ],
  "default": "machine_max:empty"
}`, "base/sound_event.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/base/sound_event.json",
  "title": "\u97F3\u6548\u4E8B\u4EF6",
  "description": "Minecraft\u97F3\u6548\u4E8B\u4EF6\u914D\u7F6E\uFF0C\u5305\u542B\u97F3\u6548ID\u548C\u8303\u56F4\u3002",
  "type": "object",
  "properties": {
    "sound_id": {
      "type": "string",
      "pattern": "^[a-z0-9_.-]+:[a-z0-9_./-]+$",
      "description": "\u97F3\u6548\u4E8B\u4EF6\u8D44\u6E90\u4F4D\u7F6E\u6807\u8BC6\u7B26\uFF0C\u683C\u5F0F\u4E3A'\u547D\u540D\u7A7A\u95F4:\u8DEF\u5F84'",
      "default": "machine_max:subsystem.gearbox.clutch_in"
    },
    "range": {
      "type": "number",
      "minimum": 0,
      "description": "\u97F3\u6548\u4E8B\u4EF6\u7684\u56FA\u5B9A\u8303\u56F4\uFF0C\u5355\u4F4D\uFF1A\u65B9\u5757",
      "default": 16
    }
  },
  "required": ["sound_id"],
  "additionalProperties": false,
  "examples": [
    {
      "sound_id": "machine_max:subsystem.gearbox.clutch_in",
      "range": 16
    },
    {
      "sound_id": "minecraft:entity.cow.ambient",
      "range": 8
    }
  ]
}`, "base/vector_3d.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/base/vector_3d.json",\n  "title": "\u4E09\u7EF4\u5411\u91CF",\n  "description": "\u8868\u793A\u4E09\u7EF4\u7A7A\u95F4\u4E2D\u7684\u5411\u91CF",\n  "type": "array",\n  "items": {\n    "type": "number"\n  },\n  "minItems": 3,\n  "maxItems": 3,\n  "default": [0.5, 0.5, 0.5],\n  "examples": [\n    [0.5, 0.5, 0.5],\n    [1.0, 0.0, 0.0]\n  ]\n}', "part/subpart/connector/connector_attr.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/connector/connector_attr.schema.json",\n  "title": "\u8FDE\u63A5\u70B9\u5C5E\u6027",\n  "description": "\u5B9A\u4E49\u90E8\u4EF6\u8FDE\u63A5\u70B9\u7684\u5C5E\u6027\uFF0C\u5305\u62EC\u4F4D\u7F6E\u3001\u5B9A\u4E49ID\u3001\u4FE1\u53F7\u4F20\u8F93\u7B49\u3002\u8FDE\u63A5\u70B9\u7528\u4E8E\u90E8\u4EF6\u4E4B\u95F4\u7684\u7269\u7406\u8FDE\u63A5\u548C\u4FE1\u53F7\u4F20\u9012\u3002\u9759\u6001\u5C5E\u6027\u901A\u8FC7definition\u5B57\u6BB5\u5F15\u7528\u9884\u5B9A\u4E49\u7684\u8FDE\u63A5\u70B9\u7C7B\u578B\u3002",\n  "type": "object",\n  "properties": {\n    "locator": {\n      "type": "string",\n      "description": "\u8FDE\u63A5\u70B9\u5BF9\u5E94\u7684Locator\u540D\u79F0\uFF0C\u4F1A\u5BFB\u627E\u540D\u79F0\u5339\u914D\u7684Locator\uFF0C\u4EE5\u5176\u4F4D\u7F6E\u4E0E\u59FF\u6001\u4F5C\u4E3A\u8FDE\u63A5\u70B9\u7684\u4F4D\u7F6E\u548C\u59FF\u6001\u3002"\n    },\n    "definition": {\n      "type": "string",\n      "description": "\u8FDE\u63A5\u70B9\u5B9A\u4E49ID\uFF0C\u5F15\u7528\u9884\u5B9A\u4E49\u7684\u8FDE\u63A5\u70B9\u9759\u6001\u5C5E\u6027\u3002\u4F8B\u5982\uFF1A\\"machine_max:simple_connector\\"\u3002"\n    },\n    "power_target": {\n      "type": "string",\n      "description": "\u5BF9\u4FA7\u8FDE\u63A5\u5668\u4F20\u5165\u7684\u673A\u68B0\u80FD\u5728\u672C\u96F6\u4EF6\u5185\u7684\u63A5\u6536\u76EE\u6807\uFF08\u5B50\u7CFB\u7EDF\u540D\u6216\u8FDE\u63A5\u70B9\u540D\uFF09\u3002\u8BBE\u7F6E\u540E\u8BE5\u8FDE\u63A5\u70B9\u53EF\u4F5C\u4E3A\u673A\u68B0\u80FD\u4F20\u8F93\u901A\u9053\uFF0C\u5C06\u5BF9\u4FA7\u4F20\u5165\u7684\u673A\u68B0\u80FD\u8F6C\u53D1\u81F3\u672C\u96F6\u4EF6\u5185\u7684\u76EE\u6807\u3002\u4F8B\u5982\uFF1A\\"subsystem.machine_max.engine\\"\u3002"\n    },\n    "overwrite": {\n      "type": "object",\n      "description": "\u8FDE\u63A5\u70B9\u5C5E\u6027\u8986\u5199\u3002\u53EF\u6309\u9700\u8986\u5199definition\u6307\u5411\u7684\u9759\u6001\u8FDE\u63A5\u70B9\u5C5E\u6027\u3002",\n      "properties": {\n        "type": {\n          "type": "string",\n          "enum": ["Simple", "simple", "advanced", "Advanced"],\n          "description": "\u8FDE\u63A5\u70B9\u7C7B\u578B\u8986\u5199\u3002"\n        },\n        "direction": {\n          "$ref": "../../../base/axis.schema.json",\n          "description": "\u8FDE\u63A5\u70B9\u6CD5\u7EBF\u65B9\u5411\u8986\u5199\u3002"\n        },\n        "integrity": {\n          "type": "number",\n          "minimum": 0.0,\n          "description": "\u7ED3\u6784\u5B8C\u6574\u6027\u8986\u5199\u3002"\n        },\n        "impact_absorption": {\n          "type": "number",\n          "minimum": 0.0,\n          "description": "\u51B2\u51FB\u8F6C\u7ED3\u6784\u635F\u8017\u6BD4\u4F8B\u8986\u5199\u3002"\n        },\n        "impact_reduction": {\n          "type": "number",\n          "minimum": 0.0,\n          "description": "\u51B2\u51FB\u51CF\u514D\u503C\u8986\u5199\u3002"\n        },\n        "impact_multiplier": {\n          "type": "number",\n          "minimum": 0.0,\n          "description": "\u51B2\u51FB\u500D\u7387\u8986\u5199\u3002"\n        },\n        "collide_between_parts": {\n          "type": "boolean",\n          "description": "\u662F\u5426\u5141\u8BB8\u90E8\u4EF6\u95F4\u78B0\u649E\u8986\u5199\u3002"\n        },\n        "required_tags": {\n          "type": "array",\n          "items": { "$ref": "../../../base/resource_location.schema.json" },\n          "description": "\u5FC5\u9700\u6807\u7B7E\u8986\u5199\u3002"\n        },\n        "acceptable_tags": {\n          "type": "array",\n          "items": { "$ref": "../../../base/resource_location.schema.json" },\n          "description": "\u53EF\u63A5\u53D7\u6807\u7B7E\u8986\u5199\u3002"\n        },\n        "forbidden_tags": {\n          "type": "array",\n          "items": { "$ref": "../../../base/resource_location.schema.json" },\n          "description": "\u7981\u6B62\u6807\u7B7E\u8986\u5199\u3002"\n        },\n        "joint_attrs": {\n          "type": "object",\n          "additionalProperties": { "$ref": "joint_attr.schema.json" },\n          "description": "\u5173\u8282\u5C5E\u6027\u8986\u5199\u3002"\n        }\n      },\n      "additionalProperties": false\n    },\n    "signal_translations": {\n      "type": "object",\n      "additionalProperties": { "type": "string" },\n      "default": {},\n      "description": "\u4ECE\u5BF9\u4FA7\u8FDE\u63A5\u70B9\u63A5\u6536\u5230\u7684\u4FE1\u53F7\u9891\u9053\u8F6C\u8BD1\u89C4\u5219\uFF0C\u4F8B\u5982\uFF1A{\\"channel_a\\": \\"channel_c\\"}\u8868\u793A\u5C06channel_a\u4FE1\u53F7\u8F6C\u8BD1\u4E3Achannel_c\u3002"\n    },\n    "signal_targets": {\n      "type": "object",\n      "additionalProperties": {\n        "type": "array",\n        "items": { "type": "string" }\n      },\n      "default": {},\n      "description": "\u8FDE\u63A5\u70B9\u5728\u672C\u96F6\u4EF6\u5185\u7684\u63A7\u5236\u4FE1\u53F7\u4F20\u8F93\u76EE\u6807\uFF0C\u952E\u4E3A\u4FE1\u53F7\u9891\u9053\uFF0C\u503C\u4E3A\u76EE\u6807\u5217\u8868\uFF08\u5B50\u7CFB\u7EDF/\u8FDE\u63A5\u70B9\u540D/part/vehicle\uFF09\u3002\u4F8B\u5982\uFF1A{\\"move_control\\": [\\"car_controller\\", \\"engine\\"]}\u3002"\n    },\n    "internal": {\n      "type": "boolean",\n      "default": false,\n      "description": "\u662F\u5426\u4E3A\u90E8\u4EF6\u5185\u90E8\u8FDE\u63A5\u70B9\u3002\u4E3Atrue\u65F6\u4EC5\u7528\u4E8E\u540C\u4E00Part\u5185\u90E8\u81EA\u52A8\u8FDE\u63A5\uFF0C\u4E0D\u53C2\u4E0E\u5BF9\u5916\u62FC\u88C5\u3002"\n    }\n  },\n  "required": ["locator", "definition"],\n  "additionalProperties": false,\n  "examples": [\n    {\n      "locator": "Hull",\n      "definition": "machine_max:simple_connector"\n    },\n    {\n      "locator": "LeftFrontWheel",\n      "definition": "machine_max:advanced_wheel_connector",\n      "overwrite": {\n        "type": "Advanced",\n        "direction": "y+",\n        "integrity": 32.0,\n        "impact_absorption": 0.15,\n        "impact_reduction": 3.0,\n        "impact_multiplier": 0.8,\n        "collide_between_parts": false,\n        "required_tags": ["machine_max:left"],\n        "acceptable_tags": ["machine_max:wheel", "machine_max:suspension"],\n        "forbidden_tags": ["machine_max:broken_only"],\n        "joint_attrs": {\n          "y": {\n            "lower_limit": -0.2,\n            "upper_limit": 0.25,\n            "stiffness": 30000,\n            "damping": 1600\n          },\n          "yr": {\n            "lower_limit": -35.0,\n            "upper_limit": 35.0,\n            "stiffness": 4500,\n            "damping": 24\n          }\n        }\n      },\n      "signal_translations": {\n        "steering": "wheel_control"\n      },\n      "signal_targets": {\n        "wheel_control": ["wheel_driver", "subpart"],\n        "abs_request": ["vehicle"]\n      },\n      "internal": true\n    }\n  ]\n}', "part/subpart/connector/connector_static_attr.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/connector/connector_static_attr.schema.json",\n  "title": "\u8FDE\u63A5\u70B9\u9759\u6001\u5C5E\u6027",\n  "description": "\u5B9A\u4E49\u8FDE\u63A5\u70B9\u7684\u9759\u6001\u5C5E\u6027\uFF0C\u5305\u62EC\u7C7B\u578B\u3001\u65B9\u5411\u3001\u7ED3\u6784\u5B8C\u6574\u6027\u3001\u51B2\u51FB\u5904\u7406\u7B49\u3002\u8FD9\u4E9B\u5C5E\u6027\u901A\u8FC7\u5B9A\u4E49ID\u5F15\u7528\uFF0C\u907F\u514D\u5728\u6BCF\u4E2A\u96F6\u4EF6\u5B9A\u4E49\u4E2D\u91CD\u590D\u5B9A\u4E49\u3002",\n  "type": "object",\n  "properties": {\n    "$schema": {\n      "type": "string",\n      "description": "JSON Schema\u5F15\u7528\u8DEF\u5F84\uFF0C\u7528\u4E8E\u7F16\u8F91\u5668\u667A\u80FD\u63D0\u793A\u548C\u9A8C\u8BC1",\n      "default": "../docs/zh_cn/schemas/part/subpart/connector/connector_static_attr.schema.json"\n    },\n    "type": {\n      "type": "string",\n      "enum": ["Simple", "simple", "advanced", "Advanced"],\n      "description": "\u8FDE\u63A5\u70B9\u7C7B\u578B\u3002Simple\uFF1A\u7B80\u5355\u8FDE\u63A5\u70B9\uFF1BAdvanced\uFF1A\u9AD8\u7EA7\u8FDE\u63A5\u70B9\uFF0C\u652F\u6301\u590D\u6742\u7684\u5173\u8282\u5C5E\u6027\u3002"\n    },\n    "direction": {\n      "$ref": "../../../base/axis.schema.json",\n      "description": "\u8FDE\u63A5\u70B9\u7684\u6CD5\u7EBF\u65B9\u5411\uFF0C\u7528\u4E8E\u786E\u5B9A\u8FDE\u63A5\u70B9\u7684\u8FDE\u63A5\u65B9\u5411\u3002x+\u4E3A\u53F3\uFF0Cy+\u4E3A\u4E0A\uFF0Cz+\u4E3A\u540E\u3002"\n    },\n    "integrity": {\n      "type": "number",\n      "minimum": 0,\n      "default": 20.0,\n      "description": "\u90E8\u4EF6\u57FA\u7840\u7ED3\u6784\u5B8C\u6574\u5EA6\uFF0C\u90E8\u4EF6\u53EF\u627F\u53D7\u4E0D\u9AD8\u4E8E\u6B64\u6570\u503C\u7684\u51B2\u51FB\u529B\u800C\u4E0D\u8131\u843D\uFF0C\u51B2\u51FB\u529B\u6765\u81EA\u4F24\u5BB3\u6216\u5173\u8282\u5E94\u529B\u3002"\n    },\n    "impact_reduction": {\n      "type": "number",\n      "minimum": 0,\n      "default": 2.0,\n      "description": "\u8FDE\u63A5\u70B9\u7684\u51B2\u51FB\u51CF\u514D\u503C\uFF0C\u5728\u8BA1\u7B97\u90E8\u4EF6\u51FB\u843D\u524D\u5E94\u7528\uFF0C\u53EF\u5C06\u51B2\u51FB\u524A\u51CF\u81F30\u4EE5\u5B8C\u5168\u907F\u514D\u5BF9\u7ED3\u6784\u5B8C\u6574\u6027\u7684\u5F71\u54CD\u3002"\n    },\n    "impact_multiplier": {\n      "type": "number",\n      "minimum": 0,\n      "default": 1.5,\n      "description": "\u8FDE\u63A5\u70B9\u7684\u51B2\u51FB\u5438\u6536\u7387\uFF0C\u5728\u8BA1\u7B97\u90E8\u4EF6\u51FB\u843D\u524D\uFF0C\u5E94\u7528\u51B2\u51FB\u51CF\u514D\u540E\u5E94\u7528\uFF0C\u5927\u4E8E1\u5C06\u4F7F\u8FDE\u63A5\u70B9\u66F4\u5BB9\u6613\u65AD\u5F00\u3002"\n    },\n    "impact_absorption": {\n      "type": "number",\n      "minimum": 0,\n      "maximum": 1,\n      "default": 0.2,\n      "description": "\u8FDE\u63A5\u70B9\u53D7\u5230\u51B2\u51FB\u4F46\u672A\u88AB\u51FB\u843D\u65F6\uFF0C\u51B2\u51FB\u8F6C\u4E3A\u7ED3\u6784\u5B8C\u6574\u6027\u635F\u8017\u7684\u6BD4\u4F8B\u3002\u4F8B\u59820.2\u8868\u793A20%\u7684\u51B2\u51FB\u4F1A\u8F6C\u5316\u4E3A\u7ED3\u6784\u5B8C\u6574\u6027\u7684\u635F\u8017\u3002"\n    },\n    "required_tags": {\n      "type": "array",\n      "items": { "$ref": "../../../base/resource_location.schema.json" },\n      "default": [],\n      "description": "\u8FDE\u63A5\u90E8\u4EF6\u5FC5\u987B\u5168\u90E8\u62E5\u6709\u7684\u6807\u7B7E\uFF0C\u7559\u7A7A\u4EE5\u5141\u8BB8\u4EFB\u610F\u6807\u7B7E\u3002\u4F8B\u5982\uFF1A[\\"machine_max:left\\"]\u8868\u793A\u5FC5\u987B\u5305\u542B\u5DE6\u53D8\u4F53\u6807\u7B7E\u3002"\n    },\n    "acceptable_tags": {\n      "type": "array",\n      "items": { "$ref": "../../../base/resource_location.schema.json" },\n      "default": [],\n      "description": "\u8FDE\u63A5\u90E8\u4EF6\u5FC5\u987B\u81F3\u5C11\u62E5\u6709\u5176\u4E2D\u4E00\u4E2A\u7684\u6807\u7B7E\uFF0C\u7559\u7A7A\u4EE5\u5141\u8BB8\u4EFB\u610F\u6807\u7B7E\u3002\u4F8B\u5982\uFF1A[\\"machine_max:door\\", \\"machine_max:hatch\\"]\u8868\u793A\u5FC5\u987B\u5305\u542B\u95E8\u6216\u8231\u53E3\u6807\u7B7E\u4E4B\u4E00\u3002"\n    },\n    "forbidden_tags": {\n      "type": "array",\n      "items": { "$ref": "../../../base/resource_location.schema.json" },\n      "default": [],\n      "description": "\u8FDE\u63A5\u90E8\u4EF6\u4E0D\u53EF\u5305\u542B\u7684\u6807\u7B7E\uFF0C\u7559\u7A7A\u4EE5\u5141\u8BB8\u4EFB\u610F\u6807\u7B7E\u3002\u4F8B\u5982\uFF1A[\\"machine_max:explosive\\"]\u8868\u793A\u4E0D\u80FD\u5305\u542B\u7206\u70B8\u7269\u6807\u7B7E\u3002"\n    },\n    "joint_attrs": {\n      "type": "object",\n      "additionalProperties": { "$ref": "joint_attr.schema.json"},\n      "default": {},\n      "description": "\u5173\u8282\u5C5E\u6027\uFF0C\u76EE\u524D\u4EC5\u5728\u5173\u8282\u7C7B\u578B\u4E3AAdvanced\u65F6\u751F\u6548\u3002\u952E\u4E3Ax\u3001y\u3001z\u3001xr\u3001yr\u3001zr\uFF0C\u5206\u522B\u4EE3\u8868x\u3001y\u3001z\u8F74\u7684\u5E73\u52A8\u548Cx\u3001y\u3001z\u8F74\u7684\u65CB\u8F6C\u3002"\n    },\n    "collide_between_parts": {\n      "type": "boolean",\n      "default": false,\n      "description": "\u8FDE\u63A5\u70B9\u662F\u5426\u5141\u8BB8\u90E8\u4EF6\u95F4\u78B0\u649E\u3002\u901A\u5E38\u8BBE\u7F6E\u4E3Afalse\u4EE5\u907F\u514D\u8FDE\u63A5\u70B9\u4E4B\u95F4\u7684\u7A7F\u900F\u95EE\u9898\u3002"\n    }\n  },\n  "required": ["type"],\n  "additionalProperties": false,\n  "examples": [\n    {\n      "type": "Simple",\n      "description": "\u6700\u7B80\u8FDE\u63A5\u70B9\u793A\u4F8B\uFF0C\u4EC5\u5305\u542B\u5FC5\u9700\u5B57\u6BB5"\n    },\n    {\n      "type": "Advanced",\n      "required_tags": ["machine_max:left"],\n      "impact_absorption": 0.1,\n      "impact_reduction": 3.0,\n      "impact_multiplier": 0.5,\n      "joint_attrs": {\n        "y": {\n          "lower_limit": -0.5,\n          "upper_limit": 1.0,\n          "stiffness": 28000,\n          "damping": 1500\n        },\n        "yr": {\n          "lower_limit": -45.0,\n          "upper_limit": 45.0,\n          "stiffness": 4000,\n          "damping": 20\n        }\n      },\n      "description": "\u5DE6\u524D\u8F6E\u8FDE\u63A5\u70B9\uFF0C\u4EC5\u5141\u8BB8\u5DE6\u53D8\u4F53\uFF0C\u5177\u6709\u5782\u76F4\u7F13\u51B2\u548C\u8F6C\u5411\u80FD\u529B\uFF0C\u51B2\u51FB\u5438\u6536\u7387\u8F83\u4F4E\uFF0C\u51B2\u51FB\u51CF\u514D\u8F83\u9AD8"\n    }\n  ]\n}', "part/subpart/connector/joint_attr.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/joint/joint_attr.schema.json",\n  "title": "\u5173\u8282\u5C5E\u6027",\n  "description": "\u5B9A\u4E49\u5173\u8282\u7684\u7269\u7406\u5C5E\u6027\uFF0C\u5305\u62EC\u9650\u5236\u3001\u521A\u5EA6\u3001\u963B\u5C3C\u7B49\u3002\u6BCF\u4E2A\u5173\u8282\u5C5E\u6027\u5BF9\u5E94\u4E00\u4E2A\u81EA\u7531\u5EA6\uFF08\u5E73\u52A8\u6216\u65CB\u8F6C\uFF09\u3002",\n  "type": "object",\n  "properties": {\n    "lower_limit": {\n      "type": "number",\n      "description": "\u5173\u8282\u4F4D\u7F6E\u4E0B\u9650\uFF0C\u5BF9\u4E8E\u5E73\u52A8\u8F74\u5355\u4F4D\u4E3Am\uFF0C\u5BF9\u4E8E\u65CB\u8F6C\u8F74\u5355\u4F4D\u4E3A\u5EA6\u3002\u5F53\u4E0B\u9650\u9AD8\u4E8E\u4E0A\u9650\u65F6\uFF0C\u6307\u5B9A\u7684\u8F74\u81EA\u7531\u6D3B\u52A8\uFF1B\u4E0B\u9650\u4F4E\u4E8E\u4E0A\u9650\u65F6\uFF0C\u6307\u5B9A\u7684\u8F74\u88AB\u9650\u5B9A\u4E8E\u533A\u95F4\u5185\u6D3B\u52A8\uFF1B\u4E0B\u9650\u7B49\u4E8E\u4E0A\u9650\u65F6\uFF0C\u6307\u5B9A\u7684\u8F74\u88AB\u56FA\u5B9A\u6B7B\u3002"\n    },\n    "upper_limit": {\n      "type": "number",\n      "description": "\u5173\u8282\u4F4D\u7F6E\u4E0A\u9650\uFF0C\u5BF9\u4E8E\u5E73\u52A8\u8F74\u5355\u4F4D\u4E3Am\uFF0C\u5BF9\u4E8E\u65CB\u8F6C\u8F74\u5355\u4F4D\u4E3A\u5EA6\u3002\u5F53\u4E0B\u9650\u9AD8\u4E8E\u4E0A\u9650\u65F6\uFF0C\u6307\u5B9A\u7684\u8F74\u81EA\u7531\u6D3B\u52A8\uFF1B\u4E0B\u9650\u4F4E\u4E8E\u4E0A\u9650\u65F6\uFF0C\u6307\u5B9A\u7684\u8F74\u88AB\u9650\u5B9A\u4E8E\u533A\u95F4\u5185\u6D3B\u52A8\uFF1B\u4E0B\u9650\u7B49\u4E8E\u4E0A\u9650\u65F6\uFF0C\u6307\u5B9A\u7684\u8F74\u88AB\u56FA\u5B9A\u6B7B\u3002"\n    },\n    "equilibrium": {\n      "type": "number",\n      "description": "\u5E73\u8861\u4F4D\u7F6E\uFF0C\u5173\u8282\u5728\u65E0\u5916\u529B\u4F5C\u7528\u65F6\u8D8B\u5411\u7684\u4F4D\u7F6E\u3002"\n    },\n    "stiffness": {\n      "type": "number",\n      "minimum": 0,\n      "description": "\u521A\u5EA6\u7CFB\u6570(N/m\u6216N\xB7m/rad)\uFF0C\u8868\u793A\u5173\u8282\u62B5\u6297\u53D8\u5F62\u7684\u80FD\u529B\u3002"\n    },\n    "damping": {\n      "type": "number",\n      "minimum": 0,\n      "description": "\u963B\u5C3C\u7CFB\u6570(N/(m/s)\u6216N\xB7m/(rad/s))\uFF0C\u8868\u793A\u5173\u8282\u8FD0\u52A8\u65F6\u7684\u80FD\u91CF\u8017\u6563\u3002"\n    }\n  },\n  "additionalProperties": false,\n  "examples": [\n    {\n      "lower_limit": -45.0,\n      "upper_limit": 45.0,\n      "stiffness": 4000,\n      "damping": 20,\n      "description": "\u65CB\u8F6C\u5173\u8282\uFF0C\u9650\u5236\u5728-45\xB0\u523045\xB0\u4E4B\u95F4\uFF0C\u5177\u6709\u4E2D\u7B49\u521A\u5EA6\u548C\u963B\u5C3C"\n    },\n    {\n      "lower_limit": 1.0,\n      "upper_limit": -1.0,\n      "description": "\u81EA\u7531\u6D3B\u52A8\u7684\u5173\u8282\uFF08\u4E0B\u9650\u9AD8\u4E8E\u4E0A\u9650\uFF09"\n    },\n    {\n      "lower_limit": 0.0,\n      "upper_limit": 0.0,\n      "stiffness": 100000,\n      "damping": 1000,\n      "description": "\u56FA\u5B9A\u5173\u8282\uFF08\u4E0A\u4E0B\u9650\u76F8\u540C\uFF09"\n    },\n    {\n      "lower_limit": -0.2,\n      "upper_limit": 0.2,\n      "stiffness": 50000,\n      "damping": 200,\n      "description": "\u7F13\u51B2\u5173\u8282\uFF0C\u5141\u8BB8\u5C0F\u8303\u56F4\u4F4D\u79FB\uFF0C\u7528\u4E8E\u51CF\u9707\u5668"\n    },\n    {\n      "lower_limit": -90.0,\n      "upper_limit": 90.0,\n      "equilibrium": 0.0,\n      "stiffness": 1000,\n      "damping": 50,\n      "description": "\u94F0\u94FE\u5173\u8282\uFF0C\u5141\u8BB8\u5927\u89D2\u5EA6\u65CB\u8F6C\uFF0C\u7528\u4E8E\u95E8\u6216\u8231\u76D6"\n    }\n  ]\n}', "part/subpart/hit_box/hit_box_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/part/subpart/hit_box/hit_box_attr.json",
  "title": "\u78B0\u649E\u7BB1\u5C5E\u6027",
  "description": "\u5B9A\u4E49\u90E8\u4EF6\u78B0\u649E\u7BB1\u7684\u7269\u7406\u5C5E\u6027\u3001\u62A4\u7532\u503C\u548C\u4F24\u5BB3\u4FEE\u6B63\u7CFB\u7EDF\u3002",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "default": "part",
      "description": "\u78B0\u649E\u5F62\u72B6id\uFF0C\u540Cid\u7684\u78B0\u649E\u4F53\u79EF\u4E0D\u4F1A\u88AB\u540C\u4E00\u6B21\u653B\u51FB\u91CD\u590D\u547D\u4E2D\u3002"
    },
    "type": {
      "type": "string",
      "enum": ["box", "sphere", "cylinder", "capsule", "wheel"],
      "description": "\u78B0\u649E\u5F62\u72B6\u7C7B\u578B\u3002\u5404\u7C7B\u578B\u751F\u6548\u65B9\u5F0F\u5982\u4E0B\uFF1A\\n- box\uFF1A\u957F\u65B9\u4F53\u78B0\u649E\u5F62\u72B6\uFF0C\u53D6\u65B9\u5757\u4F4D\u59FF\u548C\u534A\u957F\u751F\u6210\u3002\\n- sphere\uFF1A\u7403\u4F53\u78B0\u649E\u5F62\u72B6\uFF0C\u53D6\u65B9\u5757y\u65B9\u5411\u534A\u957F\u4F5C\u4E3A\u534A\u5F84\u3002\\n- cylinder\uFF1A\u5706\u67F1\u4F53\u78B0\u649E\u5F62\u72B6\uFF0C\u53D6\u65B9\u5757\u4F4D\u59FF\u548C\u534A\u957F\u751F\u6210\uFF0C\u5706\u67F1\u8F74\u5411\u4E3Az\u8F74\u3002\\n- capsule\uFF1A\u80F6\u56CA\u4F53\u78B0\u649E\u5F62\u72B6\uFF0C\u53D6\u65B9\u5757\u4F4D\u59FF\u548C\u534A\u957F\u751F\u6210\uFF0C\u80F6\u56CA\u8F74\u5411\u4E3Ay\u8F74\u3002\\n- wheel\uFF1A\u7279\u6B8A\u7403\u4F53\u78B0\u649E\u5F62\u72B6\uFF0C\u53D6\u65B9\u5757y\u65B9\u5411\u534A\u957F\u4F5C\u4E3A\u534A\u5F84\uFF0Cx\u65B9\u5411\u5C3A\u5BF8\u4F5C\u4E3A\u5BBD\u5EA6\u3002\u78B0\u649E\u65F6\u68C0\u6D4B\u78B0\u649E\u70B9\u7684\u76F8\u5BF9\u4F4D\u7F6E\uFF0C\u82E5x\u503C\u8D85\u51FA\u8F6E\u80CE\u534A\u5BBD\u5219\u5FFD\u7565\u6B64\u6B21\u78B0\u649E\u3002\u6B64\u7C7B\u578B\u78B0\u649E\u4F53\u79EF\u4F1A\u6839\u636E\u65B9\u5757\u5C3A\u5BF8\u4EE5\u5706\u67F1\u4F53\u8F6C\u52A8\u60EF\u91CF\u516C\u5F0F\u8C03\u6574\u6574\u4E2A\u521A\u4F53\u7684\u8F6C\u52A8\u60EF\u91CF\uFF0C\u5EFA\u8BAE\u5355\u4E2Asubpart\u4EC5\u5305\u542B\u4E00\u4E2A\u7C7B\u578B\u4E3Awheel\u7684hitbox\uFF0C\u4E14\u5185\u90E8\u4EC5\u5305\u542B\u4E00\u4E2Acube\u3002"
    },
    "subsystem": {
      "type": "string",
      "default": "",
      "description": "\u5B50\u7CFB\u7EDF\u540D\u79F0\uFF0C\u7528\u4E8E\u5C06\u6B64\u78B0\u649E\u7BB1\u4E0E\u7279\u5B9A\u5B50\u7CFB\u7EDF\u5173\u8054\uFF0C\u5F53\u6B64\u78B0\u649E\u7BB1\u53D7\u5230\u4F24\u5BB3\u65F6\uFF0C\u5173\u8054\u7684\u5B50\u7CFB\u7EDF\u4F1A\u53D7\u5230\u7B49\u91CF\u4F24\u5BB3\u3002"
    },
    "material": {
      "$ref": "../../../base/resource_location.schema.json",
      "default": "machine_max:default",
      "description": "\u6750\u6599\u6CE8\u518Cid\uFF0C\u7528\u4E8E\u83B7\u53D6\u6469\u64E6\u7CFB\u6570\u3001\u51CF\u4F24\u5C5E\u6027\u3001\u97F3\u6548\u7B49\u7269\u7406\u5C5E\u6027\u3002"
    },
    "thickness": {
      "type": "number",
      "minimum": 0.0,
      "default": 1.0,
      "description": "\u62A4\u7532\u539A\u5EA6\uFF0C\u5355\u4F4Dmm\uFF0C\u51CF\u514D\u4F24\u5BB3\u5E76\u63A7\u5236\u78B0\u649E\u65F6\u7684\u80FD\u91CF\u5206\u914D\u60C5\u51B5\u3002"
    },
    "overwrite": {
      "type": "object",
      "description": "\u547D\u4E2D\u7BB1\u6750\u8D28\u5C5E\u6027\u8986\u5199\u3002\u53EF\u6309\u9700\u8986\u5199material\u5F15\u7528\u6750\u8D28\u4E2D\u7684\u4EFB\u610F\u5B57\u6BB5\u3002",
      "properties": {
        "friction": {
          "$ref": "../../../base/vector_3d.schema.json",
          "description": "\u6469\u64E6\u7CFB\u6570\u8986\u5199\u3002"
        },
        "slip_adaptation": {
          "type": "number",
          "minimum": 0.0,
          "description": "\u6ED1\u79FB\u9002\u5E94\u7CFB\u6570\u8986\u5199\u3002"
        },
        "slip_curve": {
          "type": "object",
          "description": "\u6ED1\u79FB\u66F2\u7EBF\u8986\u5199\u3002\u53EF\u53EA\u8986\u5199\u90E8\u5206\u5B57\u6BB5\uFF0C\u5176\u4F59\u7EE7\u627F\u6750\u8D28\u5B9A\u4E49\u3002",
          "properties": {
            "longitudinal": {
              "type": "object",
              "properties": {
                "peak_slip_ratio": {
                  "type": "number",
                  "minimum": 0.0
                },
                "base_scale": {
                  "type": "number"
                },
                "peak_scale": {
                  "type": "number"
                },
                "kinetic_scale": {
                  "type": "number"
                }
              },
              "additionalProperties": false
            },
            "lateral": {
              "type": "object",
              "properties": {
                "peak_angle_deg": {
                  "type": "number",
                  "minimum": 0.0,
                  "description": "\u4FA7\u504F\u89D2\u5CF0\u503C\uFF0C\u5355\u4F4D\uFF1A\u5EA6\u3002"
                },
                "kinetic_angle_deg": {
                  "type": "number",
                  "minimum": 0.0,
                  "description": "\u52A8\u6469\u64E6\u7EC8\u70B9\u4FA7\u504F\u89D2\uFF0C\u5355\u4F4D\uFF1A\u5EA6\u3002"
                },
                "base_scale": {
                  "type": "number"
                },
                "peak_scale": {
                  "type": "number"
                },
                "kinetic_scale": {
                  "type": "number"
                }
              },
              "additionalProperties": false
            }
          },
          "additionalProperties": false
        },
        "rolling_friction": {
          "type": "number",
          "minimum": 0.0,
          "description": "\u6EDA\u52A8\u6469\u64E6\u7CFB\u6570\u8986\u5199\u3002"
        },
        "spinning_friction": {
          "type": "number",
          "minimum": 0.0,
          "description": "\u65CB\u8F6C\u6469\u64E6\u7CFB\u6570\u8986\u5199\u3002"
        },
        "restitution": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 1.0,
          "description": "\u6062\u590D\u7CFB\u6570\u8986\u5199\u3002"
        },
        "block_damage_factor": {
          "type": "number",
          "minimum": 0.0,
          "description": "\u65B9\u5757\u4F24\u5BB3\u7CFB\u6570\u8986\u5199\u3002"
        },
        "rha": {
          "type": "number",
          "minimum": 0.0,
          "description": "\u76F8\u5BF9RHA\u6297\u7A7F\u7CFB\u6570\u8986\u5199\u30021.0\u8868\u793A\u7B49\u6548RHA\uFF0C0.5\u8868\u793A\u540C\u539A\u5EA6\u4E0B\u4EC550%\u6297\u7A7F\uFF0C1.5\u8868\u793A1.5\u500D\u6297\u7A7F\u3002"
        },
        "angle_effect": {
          "type": "boolean",
          "description": "\u89D2\u5EA6\u6548\u5E94\u8986\u5199\u3002"
        },
        "impact_modifiers": {
          "$ref": "modifier/damage_modifier.schema.json",
          "description": "\u51B2\u51FB\u4FEE\u6B63\u8986\u5199\u3002"
        },
        "piercing_modifiers": {
          "$ref": "modifier/damage_modifier.schema.json",
          "description": "\u7A7F\u6DF1\u4FEE\u6B63\u8986\u5199\u3002"
        },
        "damage_modifiers": {
          "$ref": "modifier/damage_modifier.schema.json",
          "description": "\u4F24\u5BB3\u4FEE\u6B63\u8986\u5199\u3002"
        },
        "un_penetrate_damage_factor": {
          "type": "number",
          "minimum": 0.0,
          "description": "\u672A\u51FB\u7A7F\u4F24\u5BB3\u7CFB\u6570\u8986\u5199\u3002"
        },
        "sounds": {
          "type": "object",
          "properties": {
            "hit_un_pen": {
              "$ref": "../../../base/sound_event.schema.json"
            },
            "hit_pen": {
              "$ref": "../../../base/sound_event.schema.json"
            }
          },
          "additionalProperties": false,
          "description": "\u6750\u8D28\u97F3\u6548\u8986\u5199\u3002"
        }
      },
      "additionalProperties": false
    },
    "condition": {
      "type": "string",
      "default": "true",
      "description": "\u751F\u6548\u6761\u4EF6\uFF0C\u4F7F\u7528molang\u8868\u8FBE\u5F0F\u63A7\u5236\u78B0\u649E\u7BB1\u662F\u5426\u751F\u6548\u3002\u53EF\u7528\u4E8E\u5B9E\u73B0\u73BB\u7483\u88AB\u51FB\u788E\u540E\u4E0D\u518D\u6709\u547D\u4E2D\u5224\u5B9A\u3001\u62D6\u8F66\u6491\u811A\u7B49\u529F\u80FD\u3002"
    }
  },
  "required": ["type"],
  "additionalProperties": false,
  "examples": [
    {
      "type": "box"
    },
    {
      "id": "chassis",
      "type": "box",
      "subsystem": "sub_part.machine_max.main",
      "material": "machine_max:heavy_armor",
      "thickness": 10.0,
      "overwrite": {
        "rha": 1.35,
        "angle_effect": true,
        "slip_curve": {
          "lateral": {
            "peak_angle_deg": 9.0
          }
        },
        "impact_modifiers": [
          {
            "operation": "multiply",
            "value": 0.8,
            "condition": {
              "type": "always"
            }
          }
        ],
        "piercing_modifiers": [
          {
            "operation": "multiply",
            "value": 0.9,
            "condition": {
              "type": "always"
            }
          }
        ],
        "damage_modifiers": [
          {
            "operation": "add",
            "value": -1.0,
            "condition": {
              "type": "always"
            }
          }
        ],
        "un_penetrate_damage_factor": 0.15,
        "sounds": {
          "hit_un_pen": {
            "sound_id": "machine_max:hit_box.hit.up_pen.metal",
            "range": 64
          },
          "hit_pen": {
            "sound_id": "machine_max:hit_box.hit.pen.metal",
            "range": 64
          }
        }
      },
      "condition": "!subpart.has_connector('connector.machine_max.chassis_connection')"
    }
  ]
}`, "part/subpart/hit_box/modifier/condition/condition.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/part/subpart/hit_box/modifier/condition/condition.json",\n  "title": "\u6761\u4EF6",\n  "description": "\u7528\u4E8E\u4F24\u5BB3\u4FEE\u6539\u5668\u7684\u6761\u4EF6\u5224\u65AD\u7CFB\u7EDF\u3002\u652F\u6301\u5D4C\u5957\u903B\u8F91\u8FD0\u7B97\u3002",\n  "allOf": [\n    { "$ref": "condition_base.schema.json"}\n  ]\n}', "part/subpart/hit_box/modifier/condition/condition_base.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/part/subpart/hit_box/modifier/condition/condition_base.json",
  "title": "\u6761\u4EF6\u57FA\u7840",
  "description": "\u4F24\u5BB3\u4FEE\u6539\u5668\u7684\u6761\u4EF6\u5224\u65AD\u57FA\u7840\u7ED3\u6784\u3002\u6240\u6709\u6761\u4EF6\u7C7B\u578B\u90FD\u5FC5\u987B\u5305\u542B 'type' \u5B57\u6BB5\u3002",
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": [
        "always",
        "damage_type",
        "damage_tag",
        "entity_type",
        "entity_tag",
        "and",
        "or",
        "not"
      ],
      "description": "\u6761\u4EF6\u7C7B\u578B\u3002always: \u603B\u662F\u6EE1\u8DB3\uFF1Bdamage_type: \u4F24\u5BB3\u7C7B\u578B\u5339\u914D\uFF1Bdamage_tag: \u4F24\u5BB3\u6807\u7B7E\u5339\u914D\uFF1Bentity_type: \u5B9E\u4F53\u7C7B\u578B\u5339\u914D\uFF1Bentity_tag: \u5B9E\u4F53\u6807\u7B7E\u5339\u914D\uFF1Band: \u6240\u6709\u5B50\u6761\u4EF6\u6EE1\u8DB3\uFF1Bor: \u4EFB\u610F\u5B50\u6761\u4EF6\u6EE1\u8DB3\uFF1Bnot: \u4E0D\u6EE1\u8DB3\u5B50\u6761\u4EF6\u3002"
    }
  },
  "required": ["type"],
  "additionalProperties": true,
  "oneOf": [
    { "$ref": "condition_types.schema.json#/definitions/Always"},
    { "$ref": "condition_types.schema.json#/definitions/DamageTypeCondition"},
    { "$ref": "condition_types.schema.json#/definitions/DamageTagCondition"},
    { "$ref": "condition_types.schema.json#/definitions/EntityTypeCondition"},
    { "$ref": "condition_types.schema.json#/definitions/EntityTagCondition"},
    { "$ref": "condition_types.schema.json#/definitions/And"},
    { "$ref": "condition_types.schema.json#/definitions/Or"},
    { "$ref": "condition_types.schema.json#/definitions/Not"}
  ]
}`, "part/subpart/hit_box/modifier/condition/condition_types.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/part/subpart/hit_box/modifier/condition/condition_types.json",
  "title": "\u6761\u4EF6\u7C7B\u578B\u5B9A\u4E49",
  "description": "\u6240\u6709\u5177\u4F53\u6761\u4EF6\u7C7B\u578B\u7684\u5B9A\u4E49",
  "definitions": {
    "Always": {
      "properties": {
        "type": { "const": "always" }
      },
      "required": ["type"],
      "additionalProperties": false,
      "description": "\u603B\u662F\u6EE1\u8DB3\u7684\u6761\u4EF6\uFF0C\u7528\u4E8E\u5168\u5C40\u6027\u4FEE\u6539\u5668\u3002"
    },
    "DamageTypeCondition": {
      "properties": {
        "type": { "const": "damage_type" },
        "id": {
          "$ref": "../../../../../base/resource_location.schema.json",
          "description": "\u4F24\u5BB3\u7C7B\u578B\u7684\u8D44\u6E90\u5730\u5740\uFF0C\u4F8B\u5982\uFF1A'minecraft:fly_into_wall'\u3002"
        }
      },
      "required": ["type", "id"],
      "additionalProperties": false,
      "description": "\u5224\u65AD\u4F24\u5BB3\u662F\u5426\u4E3A\u6307\u5B9A\u7C7B\u578B\u3002"
    },
    "DamageTagCondition": {
      "properties": {
        "type": { "const": "damage_tag" },
        "id": {
          "$ref": "../../../../../base/resource_location.schema.json",
          "description": "\u4F24\u5BB3\u6807\u7B7E\u7684\u8D44\u6E90\u5730\u5740\uFF0C\u4F8B\u5982\uFF1A'machine_max:has_pen_depth'\u3002"
        }
      },
      "required": ["type", "id"],
      "additionalProperties": false,
      "description": "\u5224\u65AD\u4F24\u5BB3\u662F\u5426\u542B\u6709\u6307\u5B9A\u6807\u7B7E\u3002"
    },
    "EntityTypeCondition": {
      "properties": {
        "type": { "const": "entity_type" },
        "id": {
          "$ref": "../../../../../base/resource_location.schema.json",
          "description": "\u5B9E\u4F53\u7C7B\u578B\u7684\u8D44\u6E90\u5730\u5740\uFF0C\u4F8B\u5982\uFF1A'minecraft:slime'\u3002"
        }
      },
      "required": ["type", "id"],
      "additionalProperties": false,
      "description": "\u5224\u65AD\u9020\u6210\u4F24\u5BB3\u7684\u5B9E\u4F53\u662F\u5426\u4E3A\u6307\u5B9A\u7C7B\u578B\u3002"
    },
    "EntityTagCondition": {
      "properties": {
        "type": { "const": "entity_tag" },
        "id": {
          "$ref": "../../../../../base/resource_location.schema.json",
          "description": "\u5B9E\u4F53\u6807\u7B7E\u7684\u8D44\u6E90\u5730\u5740\uFF0C\u4F8B\u5982\uFF1A'minecraft:skeletons'\u3002"
        }
      },
      "required": ["type", "id"],
      "additionalProperties": false,
      "description": "\u5224\u65AD\u9020\u6210\u4F24\u5BB3\u7684\u5B9E\u4F53\u662F\u5426\u542B\u6709\u6307\u5B9A\u6807\u7B7E\u3002"
    },
    "And": {
      "properties": {
        "type": { "const": "and" },
        "conditions": {
          "type": "array",
          "items": { "$ref": "condition.schema.json"},
          "minItems": 1,
          "description": "\u5B50\u6761\u4EF6\u5217\u8868\uFF0C\u6240\u6709\u6761\u4EF6\u5FC5\u987B\u6EE1\u8DB3\u3002"
        }
      },
      "required": ["type", "conditions"],
      "additionalProperties": false,
      "description": "\u903B\u8F91\u4E0E\u6761\u4EF6\uFF0C\u6240\u6709\u5B50\u6761\u4EF6\u90FD\u5FC5\u987B\u6EE1\u8DB3\u3002"
    },
    "Or": {
      "properties": {
        "type": { "const": "or" },
        "conditions": {
          "type": "array",
          "items": { "$ref": "condition.schema.json"},
          "minItems": 1,
          "description": "\u5B50\u6761\u4EF6\u5217\u8868\uFF0C\u4EFB\u610F\u6761\u4EF6\u6EE1\u8DB3\u5373\u53EF\u3002"
        }
      },
      "required": ["type", "conditions"],
      "additionalProperties": false,
      "description": "\u903B\u8F91\u6216\u6761\u4EF6\uFF0C\u81F3\u5C11\u4E00\u4E2A\u5B50\u6761\u4EF6\u6EE1\u8DB3\u5373\u53EF\u3002"
    },
    "Not": {
      "properties": {
        "type": { "const": "not" },
        "condition": {
          "$ref": "condition.schema.json",
          "description": "\u5B50\u6761\u4EF6\uFF0C\u4E0D\u6EE1\u8DB3\u6B64\u6761\u4EF6\u65F6\u8FD4\u56DEtrue\u3002"
        }
      },
      "required": ["type", "condition"],
      "additionalProperties": false,
      "description": "\u903B\u8F91\u975E\u6761\u4EF6\uFF0C\u53CD\u8F6C\u5B50\u6761\u4EF6\u7684\u7ED3\u679C\u3002"
    }
  }
}`, "part/subpart/hit_box/modifier/damage_modifier.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/part/subpart/hit_box/modifier/damage_modifier.json",\n  "title": "\u4F24\u5BB3\u4FEE\u6539\u5668",\n  "description": "\u5305\u542B\u591A\u4E2A\u4FEE\u6539\u5668\u6761\u76EE\u7684\u5217\u8868\uFF0C\u6309\u987A\u5E8F\u5E94\u7528\u3002\u6BCF\u4E2A\u4FEE\u6539\u5668\u6761\u76EE\u6839\u636E\u6761\u4EF6\u51B3\u5B9A\u662F\u5426\u751F\u6548\u3002",\n  "type": "array",\n  "items": {\n    "$ref": "modifier_entry.schema.json"\n  },\n  "default": [],\n  "examples": [\n    [\n      {\n        "operation": "add",\n        "value": -5.0,\n        "condition": {\n          "type": "damage_type",\n          "id": "minecraft:fly_into_wall"\n        }\n      },\n      {\n        "operation": "multiply",\n        "value": 0.05,\n        "condition": {\n          "type": "damage_type",\n          "id": "minecraft:sweet_berry_bush"\n        }\n      }\n    ]\n  ]\n}', "part/subpart/hit_box/modifier/modifier_entry.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/part/subpart/hit_box/modifier/modifier_entry.json",\n  "title": "\u4FEE\u6539\u5668\u6761\u76EE",\n  "description": "\u4F24\u5BB3\u4FEE\u6539\u5668\u7684\u5355\u4E2A\u6761\u76EE\uFF0C\u5305\u542B\u64CD\u4F5C\u7B26\u3001\u6570\u503C\u548C\u751F\u6548\u6761\u4EF6\u3002\u591A\u4E2A\u4FEE\u6539\u5668\u6309\u987A\u5E8F\u5E94\u7528\u3002",\n  "type": "object",\n  "properties": {\n    "operation": {\n      "$ref": "../../../../base/operation.schema.json",\n      "description": "\u64CD\u4F5C\u7C7B\u578B\u3002add\uFF1A\u5C06\u503C\u52A0\u5230\u57FA\u7840\u503C\u4E0A\uFF1Bmultiply\uFF1A\u5C06\u57FA\u7840\u503C\u4E58\u4EE5\u8BE5\u503C\u3002"\n    },\n    "value": {\n      "type": "number",\n      "description": "\u64CD\u4F5C\u7684\u503C\u3002\u5BF9\u4E8Eadd\u64CD\u4F5C\uFF0C\u53EF\u4EE5\u662F\u6B63\u6570\u6216\u8D1F\u6570\uFF08\u5982-5\u8868\u793A\u51CF\u4F24\uFF09\uFF1B\u5BF9\u4E8Emultiply\u64CD\u4F5C\uFF0C\u901A\u5E38\u662F\u6B63\u6570\uFF08\u59820.05\u8868\u793A\u524A\u51CF\u81F35%\uFF09\u3002"\n    },\n    "condition": {\n      "$ref": "condition/condition.schema.json",\n      "description": "\u6761\u4EF6\uFF0C\u5F53\u6761\u4EF6\u6EE1\u8DB3\u65F6\u5E94\u7528\u6B64\u4FEE\u6539\u5668\u3002"\n    }\n  },\n  "required": ["operation", "value", "condition"],\n  "additionalProperties": false,\n  "examples": [\n    {\n      "operation": "add",\n      "value": -5.0,\n      "condition": {\n        "type": "damage_type",\n        "id": "minecraft:fly_into_wall"\n      },\n      "description": "\u5C06\u649E\u51FB\u4F24\u5BB3\u524A\u51CF5\u70B9\uFF08\u4E0D\u5C0F\u4E8E0\uFF09"\n    },\n    {\n      "operation": "multiply",\n      "value": 0.05,\n      "condition": {\n        "type": "entity_type",\n        "id": "minecraft:slime"\n      },\n      "description": "\u5C06\u53F2\u83B1\u59C6\u9020\u6210\u7684\u4F24\u5BB3\u524A\u51CF\u81F35%"\n    }\n  ]\n}', "part/subpart/hydrodynamic_attr.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/subpart/hydrodynamic_attr.schema.json",\n  "title": "\u6D41\u4F53\u52A8\u529B\u5C5E\u6027",\n  "description": "\u5B9A\u4E49\u90E8\u4EF6\u5728\u6D41\u4F53\uFF08\u7A7A\u6C14\u3001\u6C34\uFF09\u4E2D\u7684\u52A8\u529B\u5C5E\u6027\uFF0C\u5305\u62EC\u963B\u529B\u3001\u5347\u529B\u7B49\u3002\u7528\u4E8E\u6A21\u62DF\u7A7A\u6C14\u52A8\u529B\u5B66\u548C\u6C34\u52A8\u529B\u5B66\u6548\u679C\u3002\\n\\n## \u6C14\u52A8\u8BA1\u7B97\u6A21\u578B\\n\\n\u6D41\u4F53\u52A8\u529B\u8BA1\u7B97\u57FA\u4E8E\u4EE5\u4E0B\u7269\u7406\u6A21\u578B\uFF1A\\n\\n### \u9ED8\u8BA4\u6A21\u5F0F\uFF08advanced = false\uFF09\\n- **\u963B\u529B\u8BA1\u7B97**\uFF1A\u5404\u65B9\u5411\u4F7F\u7528\u4E00\u9636\uFF08\u7C98\u6027\uFF09+ \u4E8C\u9636\uFF08\u60EF\u6027\uFF09\u6A21\u578B\\n- **\u5347\u529B\u8BA1\u7B97**\uFF1A\u7B80\u5355\u901F\u5EA6\u5E73\u65B9\u6A21\u578B\uFF08x/y/z_lift\uFF09\\n\\n### \u9AD8\u7EA7\u6C14\u52A8\u6A21\u5F0F\uFF08advanced = true\uFF09\\n- **\u5728\u9AD8\u7EA7\u6C14\u52A8\u7EA6\u5B9A\u65B9\u5411\u4E0A**\uFF1A\u4F7F\u7528\u5347\u529B\u7EBF\u6A21\u578B\u8BA1\u7B97\u5347\u529B\u4E0E\u4E8C\u9636\u963B\u529B\\n- **\u4E00\u9636\u963B\u529B\uFF08\u7C98\u6027\uFF09**\uFF1A\u4ECD\u7136\u4FDD\u7559\u5E76\u53E0\u52A0\\n- **\u975E\u5347\u529B\u65B9\u5411**\uFF1A\u4ECD\u4F7F\u7528\u539F\u6709\u963B\u529B\u6A21\u578B\\n\\n**\u6CE8\u610F\uFF1A\u9AD8\u7EA7\u6C14\u52A8\u6A21\u5F0F\u76EE\u524D\u4ECD\u4E3AWIP\u3002\u5B83\u5DF2\u63A5\u5165\u5B9E\u9645\u53D7\u529B\u8BA1\u7B97\uFF0C\u4F46\u5C1A\u7F3A\u5C11\u5145\u5206\u7684\u5B98\u65B9\u5B9E\u88C5\u4E0E\u957F\u671F\u8C03\u6821\u9A8C\u8BC1\u3002**\\n\\n## \u5750\u6807\u7EA6\u5B9A\\n- **\u6D41\u4F53\u52A8\u529B\u8BA1\u7B97\u70B9\u672C\u5730\u5750\u6807\u7CFB**\uFF1A\\n  - y+ \uFF1A\u5347\u529B\u6CD5\u7EBF\u65B9\u5411\\n  - z- \uFF1A\u6765\u6D41\u65B9\u5411\uFF08\u524D\u5411\uFF09\\n\\n## \u8BE6\u7EC6\u8BA1\u7B97\u6A21\u578B\\n\\n### \u963B\u529B\u8BA1\u7B97\\n- **\u4E00\u9636\u963B\u529B\uFF08\u7C98\u6027\u963B\u529B\uFF09**\uFF1A\u4E0E\u6D41\u4F53\u7C98\u5EA6\u76F8\u5173\uFF0C\u4F7F\u7528\u6E7F\u8868\u9762\u79EF\u8BA1\u7B97\\n  - \u516C\u5F0F\uFF1A`F_viscous = viscosity \xD7 C_d1 \xD7 v \xD7 wettedArea`\\n  - \u9002\u7528\u4E8E\u4F4E\u901F\u6D41\u52A8\uFF0C\u4E0E\u901F\u5EA6\u7EBF\u6027\u76F8\u5173\\n- **\u4E8C\u9636\u963B\u529B\uFF08\u538B\u5DEE\u963B\u529B\uFF09**\uFF1A\u4E0E\u6D41\u4F53\u5BC6\u5EA6\u76F8\u5173\uFF0C\u4F7F\u7528\u6295\u5F71\u9762\u79EF\u8BA1\u7B97\\n  - \u516C\u5F0F\uFF1A`F_pressure = 0.5 \xD7 density \xD7 C_d2 \xD7 v\xB2 \xD7 projectedArea`\\n  - \u9002\u7528\u4E8E\u9AD8\u901F\u6D41\u52A8\uFF0C\u4E0E\u901F\u5EA6\u5E73\u65B9\u76F8\u5173\\n\\n### \u5347\u529B\u8BA1\u7B97\\n- **\u5347\u529B**\uFF1A\u4E0E\u6D41\u4F53\u5BC6\u5EA6\u76F8\u5173\uFF0C\u4F7F\u7528\u6295\u5F71\u9762\u79EF\u8BA1\u7B97\\n  - \u516C\u5F0F\uFF1A`F_lift = 0.5 \xD7 density \xD7 C_L \xD7 v \xD7 projectedArea`\\n  - \u57FA\u4E8E\u5782\u76F4\u4E8E\u6D41\u52A8\u65B9\u5411\u7684\u901F\u5EA6\u5206\u91CF\\n\\n### \u9762\u79EF\u5B9A\u4E49\\n- **\u6295\u5F71\u9762\u79EF**\uFF1A\u5782\u76F4\u4E8E\u6D41\u52A8\u65B9\u5411\u7684\u9762\u79EF\\n- **\u6E7F\u8868\u9762\u79EF**\uFF1A\u4E0E\u6D41\u4F53\u63A5\u89E6\u7684\u603B\u8868\u9762\u79EF\uFF0C\u8FD1\u4F3C\u4E3A\u6295\u5F71\u9762\u79EF\u4E4B\u548C \xD7 2\\n\\n## \u53C2\u6570\u8BF4\u660E\\n\u963B\u529B\u7CFB\u6570\u5217\u8868\u5FC5\u987B\u5305\u542B2\u4E2A\u503C\uFF1A[\u4E00\u9636\u7CFB\u6570, \u4E8C\u9636\u7CFB\u6570]\uFF0C\u5347\u529B\u7CFB\u6570\u4E3A\u5355\u4E2A\u6570\u503C\u3002",\n  "type": "object",\n  "properties": {\n    "scale": {\n      "type": "number",\n      "minimum": 0,\n      "default": 1.0,\n      "description": "\u7F29\u653E\u7CFB\u6570\uFF0C\u7528\u4E8E\u6574\u4F53\u8C03\u6574\u6D41\u4F53\u52A8\u529B\u6548\u679C\u3002"\n    },\n    "effective_range": {\n      "type": "number",\n      "minimum": 0,\n      "default": 1.0,\n      "description": "\u6709\u6548\u8BA1\u7B97\u8303\u56F4\uFF0C\u5355\u4F4D\u4E3Am\uFF0C\u5F53\u5728\u6765\u6D41\u65B9\u5411\u4E0A\u7684\u6B64\u8DDD\u79BB\u5185\u68C0\u6D4B\u5230\u906E\u6321\u65F6\u5C06\u4F1A\u964D\u4F4E\u90E8\u4EF6\u7684\u5B9E\u9645\u7A7A\u6C14\u963B\u529B\u7CFB\u6570\uFF0C\u4EE5\u6A21\u62DF\u5982\u8F66\u58F3\u906E\u6321\u6574\u6D41\u5E26\u6765\u7684\u51CF\u963B\u6548\u679C\u3002"\n    },\n    "transonic_amplifier": {\n      "type": "number",\n      "minimum": 0,\n      "default": 5.0,\n      "description": "\u8DE8\u97F3\u901F\u653E\u5927\u7CFB\u6570\uFF0C\u7528\u4E8E\u6A21\u62DF\u8DE8\u97F3\u901F\u65F6\u7684\u963B\u529B\u53D8\u5316\u3002\u5F53\u901F\u5EA6\u63A5\u8FD1\u97F3\u901F\u65F6\uFF0C\u963B\u529B\u4F1A\u6025\u5267\u589E\u52A0\u3002"\n    },\n    "front_drag": {\n      "type": "array",\n      "items": { "type": "number" },\n      "minItems": 2,\n      "maxItems": 2,\n      "default": [0.1, 1.0],\n      "description": "\u524D\u5411\u963B\u529B\u7CFB\u6570\u5217\u8868\uFF0C\u5FC5\u987B\u5305\u542B\u4E24\u4E2A\u503C\uFF1A[\u4E00\u9636\u7CFB\u6570, \u4E8C\u9636\u7CFB\u6570]\u3002\u4E00\u9636\u7CFB\u6570\u7528\u4E8E\u4F4E\u901F\u7C98\u6027\u963B\u529B\u8BA1\u7B97\uFF0C\u4E8C\u9636\u7CFB\u6570\u7528\u4E8E\u9AD8\u901F\u538B\u5DEE\u963B\u529B\u8BA1\u7B97\u3002"\n    },\n    "back_drag": {\n      "type": "array",\n      "items": { "type": "number" },\n      "minItems": 2,\n      "maxItems": 2,\n      "default": [0.1, 1.0],\n      "description": "\u540E\u5411\u963B\u529B\u7CFB\u6570\u5217\u8868\uFF0C\u5FC5\u987B\u5305\u542B\u4E24\u4E2A\u503C\uFF1A[\u4E00\u9636\u7CFB\u6570, \u4E8C\u9636\u7CFB\u6570]\u3002"\n    },\n    "left_drag": {\n      "type": "array",\n      "items": { "type": "number" },\n      "minItems": 2,\n      "maxItems": 2,\n      "default": [0.1, 1.0],\n      "description": "\u5DE6\u5411\u963B\u529B\u7CFB\u6570\u5217\u8868\uFF0C\u5FC5\u987B\u5305\u542B\u4E24\u4E2A\u503C\uFF1A[\u4E00\u9636\u7CFB\u6570, \u4E8C\u9636\u7CFB\u6570]\u3002"\n    },\n    "right_drag": {\n      "type": "array",\n      "items": { "type": "number" },\n      "minItems": 2,\n      "maxItems": 2,\n      "default": [0.1, 1.0],\n      "description": "\u53F3\u5411\u963B\u529B\u7CFB\u6570\u5217\u8868\uFF0C\u5FC5\u987B\u5305\u542B\u4E24\u4E2A\u503C\uFF1A[\u4E00\u9636\u7CFB\u6570, \u4E8C\u9636\u7CFB\u6570]\u3002"\n    },\n    "up_drag": {\n      "type": "array",\n      "items": { "type": "number" },\n      "minItems": 2,\n      "maxItems": 2,\n      "default": [0.1, 1.0],\n      "description": "\u4E0A\u5411\u963B\u529B\u7CFB\u6570\u5217\u8868\uFF0C\u5FC5\u987B\u5305\u542B\u4E24\u4E2A\u503C\uFF1A[\u4E00\u9636\u7CFB\u6570, \u4E8C\u9636\u7CFB\u6570]\u3002"\n    },\n    "down_drag": {\n      "type": "array",\n      "items": { "type": "number" },\n      "minItems": 2,\n      "maxItems": 2,\n      "default": [0.1, 1.0],\n      "description": "\u4E0B\u5411\u963B\u529B\u7CFB\u6570\u5217\u8868\uFF0C\u5FC5\u987B\u5305\u542B\u4E24\u4E2A\u503C\uFF1A[\u4E00\u9636\u7CFB\u6570, \u4E8C\u9636\u7CFB\u6570]\u3002"\n    },\n    "x_lift": {\n      "type": "number",\n      "default": 0.0,\n      "description": "X\u8F74\u5347\u529B\u7CFB\u6570\u3002\u57FA\u4E8EY-Z\u5E73\u9762\u901F\u5EA6\u5206\u91CF\u8BA1\u7B97\u5347\u529B\uFF0C\u901A\u5E38\u4E3A0\u8868\u793A\u4E0D\u4EA7\u751FX\u8F74\u5347\u529B\u3002"\n    },\n    "y_lift": {\n      "type": "number",\n      "default": 0.0,\n      "description": "Y\u8F74\u5347\u529B\u7CFB\u6570\u3002\u57FA\u4E8EX-Z\u5E73\u9762\u901F\u5EA6\u5206\u91CF\u8BA1\u7B97\u5347\u529B\uFF0C\u901A\u5E38\u4E3A0\u8868\u793A\u4E0D\u4EA7\u751FY\u8F74\u5347\u529B\u3002"\n    },\n    "z_lift": {\n      "type": "number",\n      "default": 0.0,\n      "description": "Z\u8F74\u5347\u529B\u7CFB\u6570\u3002\u57FA\u4E8EX-Y\u5E73\u9762\u901F\u5EA6\u5206\u91CF\u8BA1\u7B97\u5347\u529B\uFF0C\u901A\u5E38\u4E3A0\u8868\u793A\u4E0D\u4EA7\u751FZ\u8F74\u5347\u529B\u3002"\n    },\n    "advanced": {\n      "type": "boolean",\n      "default": false,\n      "description": "\u662F\u5426\u542F\u7528\u9AD8\u7EA7\u6C14\u52A8\u6A21\u5F0F\u3002\u542F\u7528\u540E\u5C06\u5728\u9AD8\u7EA7\u6C14\u52A8\u7EA6\u5B9A\u65B9\u5411\u4E0A\u4F7F\u7528\u5347\u529B\u7EBF\u6A21\u578B\u8BA1\u7B97\u5347\u529B\u4E0E\u4E8C\u9636\u963B\u529B\u3002\u6CE8\u610F\uFF1A\u8BE5\u6A21\u5F0F\u76EE\u524D\u4ECD\u4E3AWIP\uFF0C\u4F46\u5DF2\u63A5\u5165\u5B9E\u9645\u53D7\u529B\u8BA1\u7B97\uFF0C\u5C1A\u7F3A\u5C11\u5145\u5206\u7684\u5B98\u65B9\u5B9E\u88C5\u4E0E\u957F\u671F\u8C03\u6821\u9A8C\u8BC1\u3002"\n    },\n    "advanced_aero": {\n      "type": "object",\n      "properties": {\n        "lift_slope": {\n          "type": "number",\n          "default": 6.28,\n          "description": "\u5347\u529B\u7EBF\u659C\u7387 dCl/d\u03B1\uFF08\u5355\u4F4D\uFF1A1/rad\uFF09\uFF0C\u8584\u7FFC\u7406\u8BBA\u9ED8\u8BA4\u503C\u4E3A2\u03C0"\n        },\n        "alpha0": {\n          "type": "number",\n          "default": 0.0,\n          "description": "\u96F6\u5347\u653B\u89D2\uFF08\u5355\u4F4D\uFF1Arad\uFF09\uFF0C\u6B64\u653B\u89D2\u4E0B\u65E0\u5347\u529B"\n        },\n        "alpha_stall": {\n          "type": "number",\n          "minimum": 0.0,\n          "default": 0.52,\n          "description": "\u5931\u901F\u653B\u89D2\uFF08\u5355\u4F4D\uFF1Arad\uFF0C\u53D6\u6B63\u503C\uFF0C\u5BF9\u79F0\u5931\u901F\uFF09\uFF0C\u7EA630\xB0"\n        },\n        "cd0": {\n          "type": "number",\n          "minimum": 0.0,\n          "default": 0.02,\n          "description": "\u96F6\u5347\u963B\u529B\u7CFB\u6570"\n        },\n        "k_induced": {\n          "type": "number",\n          "default": 0.05,\n          "description": "\u8BF1\u5BFC\u963B\u529B\u7CFB\u6570\uFF08\u2248 1 / (\u03C0 * AR * e)\uFF09"\n        }\n      },\n      "default": {\n        "lift_slope": 6.28,\n        "alpha0": 0.0,\n        "alpha_stall": 0.52,\n        "cd0": 0.02,\n        "k_induced": 0.05\n      },\n      "description": "\u9AD8\u7EA7\u6C14\u52A8\u53C2\u6570\u914D\u7F6E\uFF0C\u4EC5\u5728advanced = true\u65F6\u751F\u6548\u3002\u57FA\u4E8E\u7B80\u5316\u5347\u529B\u7EBF\u7406\u8BBA\uFF1A\u5347\u529B\u7CFB\u6570 Cl = liftSlope * (\u03B1 - alpha0)\uFF0C\u963B\u529B\u7CFB\u6570 Cd = cd0 + kInduced * Cl\xB2\u3002"\n    }\n  },\n  "additionalProperties": false,\n  "examples": [\n    {\n      "scale": 1.0,\n      "effective_range": 5.0,\n      "transonic_amplifier": 5.0,\n      "front_drag": [0.2, 1.5],\n      "back_drag": [0.3, 1.8],\n      "left_drag": [0.15, 1.2],\n      "right_drag": [0.15, 1.2],\n      "up_drag": [0.1, 0.8],\n      "down_drag": [0.1, 0.8],\n      "x_lift": 0.0,\n      "y_lift": 0.0,\n      "z_lift": 0.0,\n      "advanced": false,\n      "description": "\u5178\u578B\u7684\u8F66\u8F86\u7A7A\u6C14\u52A8\u529B\u5B66\u914D\u7F6E\uFF0C\u524D\u5411\u963B\u529B\u8F83\u5927\uFF0C\u4FA7\u5411\u548C\u5782\u76F4\u65B9\u5411\u963B\u529B\u8F83\u5C0F"\n    },\n    {\n      "scale": 1.2,\n      "effective_range": 4.0,\n      "transonic_amplifier": 4.0,\n      "front_drag": [0.15, 0.5],\n      "back_drag": [0.25, 0.8],\n      "left_drag": [0.1, 0.6],\n      "right_drag": [0.1, 0.6],\n      "up_drag": [0.08, 0.4],\n      "down_drag": [0.08, 0.4],\n      "x_lift": 0.0,\n      "y_lift": 0.0,\n      "z_lift": 0.0,\n      "advanced": true,\n      "advanced_aero": {\n        "lift_slope": 5.5,\n        "alpha0": -0.05,\n        "alpha_stall": 0.45,\n        "cd0": 0.015,\n        "k_induced": 0.04\n      },\n      "description": "\u9AD8\u7EA7\u6C14\u52A8\u6A21\u5F0F\u914D\u7F6E\u793A\u4F8B\uFF0C\u4F7F\u7528\u5347\u529B\u7EBF\u7406\u8BBA\u8BA1\u7B97\u5347\u529B\u548C\u963B\u529B\u3002\u6CE8\u610F\uFF1A\u8BE5\u6A21\u5F0F\u76EE\u524D\u4ECD\u4E3AWIP\uFF0C\u4F46\u5DF2\u63A5\u5165\u5B9E\u9645\u53D7\u529B\u8BA1\u7B97\uFF0C\u5C1A\u7F3A\u5C11\u5145\u5206\u7684\u5B98\u65B9\u5B9E\u88C5\u4E0E\u957F\u671F\u8C03\u6821\u9A8C\u8BC1\u3002"\n    }\n  ]\n}', "part/subpart/interact_box_attr.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/part/subpart/interact_box_attr.schema.json",\n  "title": "\u4EA4\u4E92\u7BB1\u5C5E\u6027",\n  "description": "\u5B9A\u4E49\u4EA4\u4E92\u7BB1\u7684\u5C5E\u6027\uFF0C\u7528\u4E8E\u73A9\u5BB6\u4E0E\u90E8\u4EF6\u7684\u4EA4\u4E92\u3002\u4EA4\u4E92\u7BB1\u901A\u5E38\u5BF9\u5E94\u6A21\u578B\u4E2D\u7684\u9AA8\u9ABC\uFF0C\u5F53\u73A9\u5BB6\u70B9\u51FB\u65F6\u89E6\u53D1\u4FE1\u53F7\u3002",\n  "type": "object",\n  "properties": {\n    "bone": {\n      "type": "string",\n      "description": "\u4EA4\u4E92\u533A\u5BF9\u5E94\u7684\u9AA8\u9ABC\u540D\u79F0\uFF0C\u6A21\u578B\u4E2D\u7684\u9AA8\u9ABC\u5C06\u4F5C\u4E3A\u4EA4\u4E92\u533A\u57DF\u3002"\n    },\n    "signal_targets": {\n      "type": "object",\n      "additionalProperties": {\n        "type": "array",\n        "items": { "type": "string" }\n      },\n      "description": "\u4FE1\u53F7\u4F20\u8F93\u76EE\u6807\uFF0C\u952E\u4E3A\u4FE1\u53F7\u9891\u9053\uFF0C\u503C\u4E3A\u76EE\u6807\u5217\u8868\uFF08\u5B50\u7CFB\u7EDF/\u8FDE\u63A5\u70B9\u540D/part/vehicle\uFF09\u3002\u4F8B\u5982\uFF1A{\\"door_interact\\": [\\"door_controller\\"]}\u3002"\n    },\n    "interact_mode": {\n      "type": "string",\n      "enum": ["fast", "accurate"],\n      "default": "fast",\n      "description": "\u4EA4\u4E92\u6A21\u5F0F\u3002fast\uFF1A\u5FEB\u901F\u4EA4\u4E92\uFF0C\u4EC5\u9700\u8981\u73A9\u5BB6\u4E0E\u4EA4\u4E92\u533A\u76F8\u4EA4\uFF1Baccurate\uFF1A\u9700\u8981\u73A9\u5BB6\u7784\u51C6\u4EA4\u4E92\u533A\u3002\u4E8C\u8005\u4E2Daccurate\u4F18\u5148\u7EA7\u9AD8\u4E8Efast\u3002"\n    },\n    "condition": {\n      "type": "string",\n      "enum": ["AND", "OR", "NAND", "NOR", "XOR", "XNOR"],\n      "default": "NOR",\n      "description": "\u4EA4\u4E92\u533A\u53EF\u7528\u7684\u6761\u4EF6\uFF0CAND: \u6240\u6709\u8F93\u5165\u4FE1\u53F7\u90FD\u4E0D\u4E3A0\uFF1BOR: \u4EFB\u610F\u4E00\u4E2A\u8F93\u5165\u4FE1\u53F7\u4E0D\u4E3A0\uFF1BNAND: \u6240\u6709\u8F93\u5165\u4FE1\u53F7\u90FD\u4E3A0\uFF1BNOR: \u4EFB\u610F\u4E00\u4E2A\u8F93\u5165\u4FE1\u53F7\u4E3A0\uFF1BXOR: \u53EA\u6709\u4E00\u4E2A\u8F93\u5165\u4FE1\u53F7\u4E3A1\uFF1BXNOR: \u53EA\u6709\u4E00\u4E2A\u8F93\u5165\u4FE1\u53F7\u4E3A0\u3002"\n    }\n  },\n  "required": ["bone", "signal_targets"],\n  "additionalProperties": false,\n  "examples": [\n    {\n      "bone": "DoorHandle",\n      "signal_targets": {\n        "door_interact": ["door_controller"]\n      },\n      "condition": "NOR",\n      "description": "\u95E8\u628A\u624B\u4EA4\u4E92\u7BB1\uFF0C\u89E6\u53D1\u95E8\u63A7\u5236\u5668"\n    },\n    {\n      "bone": "Lever",\n      "signal_targets": {\n        "lever_pull": ["engine_start", "lights"]\n      },\n      "interact_mode": "toggle",\n      "condition": "OR",\n      "description": "\u63A7\u5236\u6746\u4EA4\u4E92\u7BB1\uFF0C\u5207\u6362\u5F15\u64CE\u548C\u706F\u5149\u72B6\u6001"\n    }\n  ]\n}', "part/subpart/sub_part_attr.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/part/subpart/sub_part_attr.schema.json",\n  "title": "\u5B50\u90E8\u4EF6\u5C5E\u6027",\n  "description": "\u5B9A\u4E49\u8F7D\u5177\u90E8\u4EF6\u4E2D\u7684\u4E00\u4E2A\u5B50\u90E8\u4EF6\uFF08\u6700\u5C0F\u8FD0\u52A8\u5355\u5143\uFF09\u7684\u5C5E\u6027\uFF0C\u5305\u542B\u7269\u7406\u7279\u6027\u3001\u78B0\u649E\u68C0\u6D4B\u3001\u8FDE\u63A5\u70B9\u548C\u5B50\u7CFB\u7EDF\u7B49",\n  "type": "object",\n  "properties": {\n    "start_bone": {\n      "type": "string",\n      "default": "",\n      "description": "\u5B50\u90E8\u4EF6\u7684\u8D77\u59CB\u9AA8\u9ABC\u540D\u79F0\uFF0C\u7528\u4E8E\u4ECE\u6A21\u578B\u4E2D\u9009\u62E9\u8981\u6E32\u67D3\u548C\u8BA1\u7B97\u78B0\u649E\u7684\u9AA8\u9ABC\u96C6\u5408\u3002\u82E5\u4E3A\u7A7A\uFF0C\u5219\u4F7F\u7528\u6574\u4E2A\u6A21\u578B\u7684\u6240\u6709\u9AA8\u9ABC"\n    },\n    "end_bones": {\n      "type": "array",\n      "items": {\n        "type": "string"\n      },\n      "default": [],\n      "description": "\u7ED3\u675F\u9AA8\u9ABC\u540D\u79F0\u5217\u8868\uFF0C\u5728\u8D77\u59CB\u9AA8\u9ABC\u548C\u7ED3\u675F\u9AA8\u9ABC\u4E4B\u95F4\u7684\u9AA8\u9ABC\u5C06\u88AB\u5305\u542B\u5728\u5B50\u90E8\u4EF6\u4E2D\u3002\u7528\u4E8E\u6392\u9664\u4E0D\u9700\u8981\u7684\u90E8\u5206"\n    },\n    "durability": {\n      "type": "number",\n      "minimum": 0,\n      "default": 20.0,\n      "description": "\u5B50\u90E8\u4EF6\u57FA\u7840\u751F\u547D\u503C\uFF0C\u964D\u81F30\u65F6\u8BE5\u5B50\u90E8\u4EF6\u7684\u6240\u6709\u5B50\u7CFB\u7EDF\u4F1A\u762B\u75EA\u3002\u6CE8\u610F\uFF1A\u591A\u4E2A\u5B50\u90E8\u4EF6\u53EF\u5171\u4EAB\u8010\u4E45\u5EA6\uFF08\u7531\u90E8\u4EF6\u5B9A\u4E49\u4E2D\u7684share_durability\u63A7\u5236\uFF09"\n    },\n    "mass": {\n      "type": "number",\n      "minimum": 0,\n      "default": 25.0,\n      "description": "\u5B50\u90E8\u4EF6\u8D28\u91CF(kg)\uFF0C\u5FC5\u987B\u5927\u4E8E0\uFF0C\u7528\u4E8E\u7269\u7406\u8BA1\u7B97"\n    },\n    "mass_center": {\n      "type": "string",\n      "default": "mass_center",\n      "description": "\u8D28\u5FC3\u5B9A\u4F4D\u5668\u540D\u79F0\uFF0C\u7528\u4E8E\u6307\u5B9A\u6A21\u578B\u4E2D\u7684\u540C\u540D\u5B9A\u4F4D\u5668\u4F5C\u4E3A\u8D28\u5FC3\u4F4D\u7F6E\u3002\u82E5\u672A\u6307\u5B9A\u6216\u672A\u627E\u5230\u5B9A\u4F4D\u5668\uFF0C\u5219\u4F1A\u4EE5\u78B0\u649E\u4F53\u79EF\u7684\u51E0\u4F55\u4E2D\u5FC3\u4F5C\u4E3A\u8D28\u5FC3\u3002"\n    },\n    "projected_area": {\n      "$ref": "../../base/vector_3d.schema.json",\n      "default": {"x": 0, "y": 0, "z": 0},\n      "description": "\u5B50\u90E8\u4EF6\u5728\u4E09\u4E2A\u8F74\u5411\u4E0A\u7684\u6295\u5F71\u9762\u79EF(m\xB2)\uFF0C\u7528\u4E8E\u8BA1\u7B97\u7A7A\u6C14\u963B\u529B"\n    },\n    "block_collision": {\n      "type": "string",\n      "enum": ["true", "false", "ground"],\n      "default": "true",\n      "description": "\u5730\u5F62\u78B0\u649E\u6A21\u5F0F\uFF1Atrue\uFF08\u9ED8\u8BA4\uFF0C\u4E0E\u6240\u6709\u65B9\u5757\u78B0\u649E\uFF09\uFF0Cground\uFF08\u4EC5\u4E0E\u90E8\u4EF6\u4E4B\u4E0B\u7684\u5730\u9762\u65B9\u5757\u78B0\u649E\uFF09\uFF0Cfalse\uFF08\u4E0D\u4E0E\u4EFB\u4F55\u65B9\u5757\u78B0\u649E\uFF09"\n    },\n    "collision_height": {\n      "type": "number",\n      "default": -1.0,\n      "description": "\u78B0\u649E\u68C0\u6D4B\u9AD8\u5EA6(m)\uFF0C\u906D\u9047\u7684\u969C\u788D\u5C0F\u4E8E\u6B64\u9AD8\u5EA6\u65F6\u4E0D\u4E0E\u969C\u788D\u53D1\u751F\u78B0\u649E\uFF08\u65B9\u5757\u78B0\u649E\u6A21\u5F0F\u9700\u8981\u4E3Aground\uFF09\u3002\u9ED8\u8BA4-1.0\u8868\u793A\u6240\u6709\u969C\u788D\u5747\u78B0\u649E"\n    },\n    "climb_assist": {\n      "type": "boolean",\n      "default": false,\n      "description": "\u6500\u722C\u8F85\u52A9\uFF0C\u662F\u5426\u542F\u7528\u6500\u722C\u8F85\u52A9\u529F\u80FD"\n    },\n    "hit_boxes": {\n      "type": "object",\n      "additionalProperties": {\n        "$ref": "hit_box/hit_box_attr.schema.json"\n      },\n      "default": {},\n      "minProperties": 1,\n      "description": "\u78B0\u649E\u7BB1\u5B9A\u4E49\uFF0C\u952E\u4E3A\u9AA8\u9ABC\u540D\u79F0\uFF0C\u4F1A\u5BFB\u627E\u540D\u79F0\u5339\u914D\u7684\u9AA8\u9ABC\uFF0C\u5E76\u6839\u636E\u5176\u4E2D\u7684\u65B9\u5757\u521B\u5EFA\u4E0D\u540C\u5F62\u72B6\u7684\u78B0\u649E\u4F53\u3002\u6BCF\u4E2A\u5B50\u90E8\u4EF6\u81F3\u5C11\u9700\u8981\u4E00\u4E2A\u78B0\u649E\u7BB1"\n    },\n    "interact_boxes": {\n      "type": "object",\n      "additionalProperties": {\n        "$ref": "interact_box_attr.schema.json"\n      },\n      "default": {},\n      "description": "\u4EA4\u4E92\u7BB1\u5B9A\u4E49\uFF0C\u952E\u4E3A\u4EA4\u4E92\u7BB1\u540D\u79F0\uFF0C\u503C\u4E3A\u4EA4\u4E92\u7BB1\u5C5E\u6027\u3002\u7528\u4E8E\u5B9A\u4E49\u73A9\u5BB6\u53EF\u4EE5\u4EA4\u4E92\u7684\u533A\u57DF"\n    },\n    "connectors": {\n      "type": "object",\n      "additionalProperties": {\n        "$ref": "connector/connector_attr.schema.json"\n      },\n      "default": {},\n      "description": "\u8FDE\u63A5\u70B9\u5217\u8868\uFF0C\u5B50\u90E8\u4EF6\u7528\u4E8E\u4E0E\u5176\u4ED6\u90E8\u4EF6\u8FDE\u63A5\u7684\u63A5\u53E3\u5B9A\u4E49"\n    },\n    "subsystems": {\n      "type": "object",\n      "additionalProperties": {\n        "$ref": "../../subsystem/subsystem_dynamic_attr.schema.json"\n      },\n      "default": {},\n      "description": "\u5B50\u7CFB\u7EDF\u5B9A\u4E49\uFF0C\u952E\u4E3A\u5B50\u7CFB\u7EDF\u540D\u79F0\uFF0C\u503C\u4E3A\u5B50\u7CFB\u7EDF\u52A8\u6001\u5C5E\u6027\u3002\u5B9A\u4E49\u5B50\u90E8\u4EF6\u4E0E\u8FDE\u63A5\u70B9\u3001\u5176\u4ED6\u5B50\u7CFB\u7EDF\u7684\u4EA4\u4E92\u5173\u7CFB"\n    },\n    "hydro_priority": {\n      "type": "integer",\n      "default": 0,\n      "description": "\u7A7A\u6C14\u963B\u529B\u8BA1\u7B97\u4F18\u5148\u7EA7\uFF0C\u503C\u8D8A\u5927\u4F18\u5148\u7EA7\u8D8A\u9AD8\u3002\u4F18\u5148\u7EA7\u9AD8\u6216\u76F8\u7B49\u7684\u90E8\u4EF6\u4F1A\u906E\u6321\u4F18\u5148\u7EA7\u4F4E\u6216\u76F8\u7B49\u7684\u90E8\u4EF6\uFF0C\u5BFC\u81F4\u963B\u529B\u7CFB\u6570\u53D1\u751F\u53D8\u5316"\n    },\n    "hydrodynamics": {\n      "type": "object",\n      "additionalProperties": {\n        "$ref": "hydrodynamic_attr.schema.json"\n      },\n      "default": {\n        "": {}\n      },\n      "description": "\u6D41\u4F53\u52A8\u529B\u8BA1\u7B97\u5B9A\u4F4D\u70B9\u5217\u8868\uFF0C\u952E\u503C\u5BF9\u7684\u952E\u540D\u4F18\u5148\u4F5C\u4E3A\u9AA8\u9ABC\u540D\u79F0\u67E5\u627E\uFF0C\u82E5\u627E\u5230\u5BF9\u5E94\u9AA8\u9ABC\u5219\u4F7F\u7528\u8BE5\u9AA8\u9ABC\u5185\u7684\u6240\u6709\u5B9A\u4F4D\u5668\u4F5C\u4E3A\u6C14\u52A8\u8BA1\u7B97\u70B9\uFF1B\u82E5\u672A\u627E\u5230\u5BF9\u5E94\u9AA8\u9ABC\uFF0C\u5219\u4F5C\u4E3A\u5B9A\u4F4D\u5668\u540D\u79F0\u67E5\u627E\u3002\u7A7A\u5B57\u7B26\u4E32\u8868\u793A\u4EE5\u8D28\u5FC3\u4F4D\u7F6E\u8BA1\u7B97\u3002\u6BCF\u4E2A\u5B9A\u4F4D\u70B9\u7684\u5C5E\u6027\u5B9A\u4E49\u53C2\u8003hydrodynamic_attr.schema.json\u3002"\n    }\n  },\n  "required": ["hit_boxes"],\n  "examples": [\n    {\n      "hit_boxes": {\n        "mmCollision_Box_Chassis": {\n          "name": "chassis",\n          "type": "box"\n        }\n      },\n      "description": "\u6700\u7B80\u5B50\u90E8\u4EF6\u793A\u4F8B\uFF0C\u4EC5\u5305\u542B\u5FC5\u9700\u7684\u78B0\u649E\u7BB1\u5B9A\u4E49"\n    },\n    {\n      "start_bone": "chassis",\n      "end_bones": ["engine"],\n      "mass_center": "hull_mass_center",\n      "durability": 550.0,\n      "mass": 1200.0,\n      "projected_area": {\n        "x": 1.5,\n        "y": 0.8,\n        "z": 3.2\n      },\n      "block_collision": "ground",\n      "collision_height": 2.5,\n      "climb_assist": true,\n      "hit_boxes": {\n        "mmCollision_Box_Chassis": {\n          "name": "chassis",\n          "type": "box",\n          "block_damage_factor": 1.5,\n          "angle_effect": true,\n          "thickness": 10\n        },\n        "mmCollision_Box_Engine": {\n          "name": "engine",\n          "type": "box",\n          "subsystem": "engine",\n          "block_damage_factor": 0.95,\n          "angle_effect": true,\n          "thickness": 3\n        }\n      },\n      "interact_boxes": {\n        "driver_seat": {\n          "bone_name": "driver_seat",\n          "interact_type": "seat"\n        }\n      },\n      "connectors": {\n        "wheel_front_left": {\n          "locator": "wheel_front_left",\n          "type": "Advanced"\n        },\n        "wheel_front_right": {\n          "locator": "wheel_front_right",\n          "type": "Advanced"\n        }\n      },\n      "subsystems": {\n        "driver_seat": {\n          "type": "machine_max:seat",\n          "definition": "machine_max:default_seat",\n          "locator": "driver_seat_point",\n          "move_outputs": {\n            "move_control": ["car_controller"]\n          },\n          "regular_outputs": {\n            "regular_control": ["car_controller"]\n          },\n          "aim_outputs": {\n            "aim_control": ["car_controller"]\n          }\n        },\n        "passenger_seat": {\n          "type": "machine_max:seat",\n          "definition": "machine_max:default_passenger_seat",\n          "locator": "passenger_seat_point"\n        },\n        "car_controller": {\n          "type": "machine_max:car_controller",\n          "definition": "machine_max:default_car_controller"\n        },\n        "engine": {\n          "type": "machine_max:engine",\n          "definition": "machine_max:default_engine"\n        },\n        "gearbox": {\n          "type": "machine_max:gearbox",\n          "definition": "machine_max:default_gearbox"\n        },\n        "trunk_storage": {\n          "type": "machine_max:item_storage",\n          "definition": "machine_max:default_trunk"\n        },\n        "glove_box": {\n          "type": "machine_max:item_storage",\n          "definition": "machine_max:glove_box"\n        },\n        "left_front_wheel_driver": {\n          "type": "machine_max:wheel_driver",\n          "definition": "machine_max:default_wheel_driver",\n          "connector": "wheel_front_left"\n        },\n        "right_front_wheel_driver": {\n          "type": "machine_max:wheel_driver",\n          "definition": "machine_max:default_wheel_driver",\n          "connector": "wheel_front_right"\n        }\n      },\n      "hydro_priority": 0,\n      "hydrodynamics": {\n        "hull_aero": {\n          "drag_coefficient": 0.3,\n          "lift_coefficient": 0.1\n        }\n      },\n      "description": "\u5B8C\u6574\u5B50\u90E8\u4EF6\u793A\u4F8B\uFF0C\u5305\u542B\u8D28\u5FC3\u5B9A\u4F4D\u5668\u3001\u6D41\u4F53\u52A8\u529B\u3001\u8FDE\u63A5\u70B9\u53CA\u5B8C\u6574\u7684\u5B50\u7CFB\u7EDF\u914D\u7F6E\uFF08\u5EA7\u4F4D\u3001\u50A8\u7269\u3001\u63A7\u5236\u5668\u3001\u53D1\u52A8\u673A\u3001\u53D8\u901F\u7BB1\u7B49\uFF09"\n    }\n  ]\n}', "part/variant_attr.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/part/variant_attr.json",\n  "title": "\u90E8\u4EF6\u53D8\u4F53\u5C5E\u6027",\n  "description": "\u5B9A\u4E49\u8F7D\u5177\u90E8\u4EF6\u7684\u4E00\u4E2A\u53D8\u4F53\uFF08Variant\uFF09\uFF0C\u5305\u542B\u8BE5\u53D8\u4F53\u7684\u5916\u89C2\u3001\u6A21\u578B\u3001\u5B50\u90E8\u4EF6\u7B49\u914D\u7F6E\u3002\u652F\u6301\u591A\u72B6\u6001\uFF08state\uFF09\u6620\u5C04\u3002",\n  "type": "object",\n  "properties": {\n    "tags": {\n      "type": "array",\n      "items": {\n        "$ref": "../base/resource_location.schema.json"\n      },\n      "default": [],\n      "description": "\u90E8\u4EF6\u6807\u7B7E\u5217\u8868\uFF0C\u7528\u4E8E\u8FDE\u63A5\u70B9\u5339\u914D\u548C\u529F\u80FD\u5206\u7C7B"\n    },\n    "model": {\n      "$ref": "../base/resource_location.schema.json",\n      "description": "\u6A21\u578B\u8DEF\u5F84\uFF0C\u65E0\u89C6\u5185\u5C42\u6587\u4EF6\u5939\u67B6\u6784\uFF0C\u4F8B\u5982machine_max:ae86_chassis.geo\u4F1A\u5728\u6240\u6709\u5185\u5BB9\u5305\u7684models/machine_max/part\u7684\u6240\u6709\u5B50\u76EE\u5F55\u4E2D\u4E2D\u5BFB\u627Eae86_chassis.geo.json"\n    },\n    "textures": {\n      "oneOf": [\n        {\n          "$ref": "../base/resource_location.schema.json",\n          "default": "minecraft:missingno",\n          "description": "\u5355\u4E00\u7EB9\u7406\uFF0C\u4F8B\u5982\\"machine_max:textures/part/ae86/ae86_armor.png\\"\u4F1A\u5C06\u5185\u5BB9\u5305\u76F8\u5E94\u8DEF\u5F84\u7684\u56FE\u50CF\u4F5C\u4E3A\u90E8\u4EF6\u7684\\"default\\"\u7EB9\u7406"\n        },\n        {\n          "type": "object",\n          "additionalProperties": {\n            "$ref": "../base/resource_location.schema.json"\n          },\n          "default": {\n            "default": "minecraft:missingno"\n          },\n          "description": "\u540D\u79F0\u5230\u7EB9\u7406\u5217\u8868\u7684\u6620\u5C04\uFF0C\u952E\u4E3A\u7EB9\u7406\u540D\u79F0\uFF0C\u503C\u4E3A\u7EB9\u7406\u8DEF\u5F84\u3002\u4F8B\u5982\uFF1A\\"textures\\": {\\n            \\"example_2\\": \\"machine_max:textures/part/texture_2.png\\"\\n          }\u5219\u4F1A\u5C06\u76F8\u5E94\u8DEF\u5F84\u7684\u56FE\u50CF\u4F5C\u4E3A\u90E8\u4EF6\u7684\\"example_2\\"\u7EB9\u7406\u3002"\n        }\n      ],\n      "default": {},\n      "description": "\u7EB9\u7406\u8DEF\u5F84\u914D\u7F6E\u3002"\n    },\n    "animations": {\n      "$ref": "../base/resource_location.schema.json",\n      "default": {},\n      "description": "\u52A8\u753B\u8DEF\u5F84\uFF0C\u65E0\u89C6\u5185\u5C42\u6587\u4EF6\u5939\u67B6\u6784\uFF0C\u4F8B\u5982machine_max:ae86\u4F1A\u5728\u6240\u6709\u5185\u5BB9\u5305\u7684animations/machine_max/part/ae86\u4E2D\u7684\u6240\u6709\u52A8\u753Bjson\u4F5C\u4E3A\u6A21\u578B\u7684\u53EF\u7528\u52A8\u753B"\n    },\n    "sub_parts": {\n      "oneOf": [\n        {\n          "$ref": "subpart/sub_part_attr.schema.json",\n          "description": "\u5355\u4E00\u96F6\u4EF6\u5B9A\u4E49\uFF0C\u4F7F\u7528\u9ED8\u8BA4\u96F6\u4EF6\u540D\uFF08\\"sub_part.machine_max.main\\"\uFF09"\n        },\n        {\n          "type": "object",\n          "additionalProperties": {\n            "$ref": "subpart/sub_part_attr.schema.json"\n          },\n          "minProperties": 1,\n          "description": "\u591A\u96F6\u4EF6\u5B9A\u4E49\uFF0C\u952E\u4E3A\u96F6\u4EF6\u540D\u79F0\uFF0C\u503C\u4E3A\u96F6\u4EF6\u914D\u7F6E"\n        }\n      ],\n      "description": "\u5B50\u90E8\u4EF6\uFF08\u96F6\u4EF6\uFF09\u5B9A\u4E49\uFF0C\u652F\u6301\u5355\u4E00\u96F6\u4EF6\uFF08\u7B80\u5199\uFF09\u6216\u591A\u4E2A\u96F6\u4EF6\uFF08\u952E\u503C\u5BF9\uFF09\u4E24\u79CD\u5199\u6CD5\u3002\u8FD9\u662F\u90E8\u4EF6\u8FD0\u52A8\u7684\u6700\u5C0F\u5355\u5143\uFF0C\u90E8\u4EF6\u7684\u6BCF\u4E2A\u53EF\u52A8\u90E8\u5206\u90FD\u5E94\u5F53\u662F\u4E00\u4E2A\u5B50\u90E8\u4EF6"\n    }\n  },\n  "additionalProperties": false,\n  "required": ["model", "sub_parts"],\n  "examples": [\n    {\n      "model": "machine_max:ae86_chassis_all_terrain.geo",\n      "textures": [\n        "machine_max:textures/part/ae86_all_terrain_1.png",\n        "machine_max:textures/part/ae86_all_terrain_2.png"\n      ],\n      "animations": "machine_max:ae86",\n      "tags": [],\n      "sub_parts": {\n        "ae86_chassis_all_terrain": {\n          "durability": 550.0,\n          "mass": 1200.0,\n          "hit_boxes": {\n            "mmCollision_Box_Chassis": {\n              "name": "chassis",\n              "type": "box",\n              "thickness": 10\n            }\n          }\n        }\n      }\n    },\n    {\n      "model": {\n        "default": "machine_max:tank_turret_normal.geo",\n        "broken": "machine_max:tank_turret_damaged.geo"\n      },\n      "textures": {\n        "default": [\n          "machine_max:textures/part/tank_turret_1.png",\n          "machine_max:textures/part/tank_turret_2.png"\n        ],\n        "broken": [\n          "machine_max:textures/part/tank_turret_damaged_1.png",\n          "machine_max:textures/part/tank_turret_damaged_2.png"\n        ]\n      },\n      "animations": {\n        "default": "machine_max:tank_turret_rotation",\n        "broken": "machine_max:tank_turret_broken"\n      },\n      "tags": ["machine_max:turret", "machine_max:rotatable"],\n      "sub_parts": {\n        "turret_base": {\n          "durability": 300.0,\n          "mass": 800.0,\n          "hit_boxes": {\n            "mmCollision_Turret": {\n              "name": "turret",\n              "type": "cylinder",\n              "thickness": 50\n            }\n          }\n        }\n      }\n    }\n  ]\n}', "part_definition_schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/part_definition_schema.json",\n  "title": "\u90E8\u4EF6\u5B9A\u4E49",\n  "description": "MachineMax\u8F7D\u5177\u90E8\u4EF6\u7684\u5B8C\u6574\u5B9A\u4E49\u6587\u4EF6\uFF0C\u8FD9\u662F\u521B\u5EFA\u81EA\u5B9A\u4E49\u8F7D\u5177\u90E8\u4EF6\u7684\u9876\u5C42\u914D\u7F6E",\n  "type": "object",\n  "properties": {\n    "$schema": {\n      "type": "string",\n      "description": "JSON Schema\u5F15\u7528\u8DEF\u5F84\uFF0C\u7528\u4E8E\u7F16\u8F91\u5668\u667A\u80FD\u63D0\u793A\u548C\u9A8C\u8BC1",\n      "default": "../../docs/zh_cn/schemas/part_definition_schema.json"\n    },\n    "icon": {\n      "$ref": "base/resource_location.schema.json",\n      "description": "\u90E8\u4EF6\u56FE\u6807\u8DEF\u5F84\uFF0C\u7528\u4E8EUI\u663E\u793A\u3002\u82E5\u7559\u7A7A\u4F1A\u4F7F\u7528\u7D2B\u9ED1\u7F3A\u7701\u56FE\u6807\u4F5C\u4E3A\u56FE\u6807",\n      "default": "minecraft:missingno"\n    },\n    "vehicle_durability_rate": {\n      "type": "number",\n      "minimum": 0,\n      "maximum": 1.0,\n      "default": 0.8,\n      "description": "\u8F7D\u5177\u8010\u4E45\u8D21\u732E\u7CFB\u6570\uFF0C\u90E8\u4EF6\u8010\u4E45\u5EA6\u6309\u6B64\u6BD4\u4F8B\u8D21\u732E\u7ED9\u8F7D\u5177\u603B\u8010\u4E45\u5EA6\u3002\u4F8B\u59820.8\u8868\u793A\u90E8\u4EF6\u768480%\u8010\u4E45\u5EA6\u8D21\u732E\u7ED9\u8F7D\u5177"\n    },\n    "vehicle_damage_rate": {\n      "type": "number",\n      "minimum": 0,\n      "default": 1.0,\n      "description": "\u5E38\u6001\u8F7D\u5177\u4F24\u5BB3\u4F20\u5BFC\u7CFB\u6570\uFF0C\u90E8\u4EF6\u53D7\u5230\u4F24\u5BB3\u65F6\u6309\u6B64\u6BD4\u4F8B\u4F20\u5BFC\u7ED9\u8F7D\u5177\u3002\u4F8B\u59821.0\u8868\u793A100%\u4F24\u5BB3\u4F20\u5BFC"\n    },\n    "vehicle_damage_rate_destroyed": {\n      "type": "number",\n      "minimum": 0,\n      "default": 0.1,\n      "description": "\u90E8\u4EF6\u88AB\u6467\u6BC1\u540E\u7684\u8F7D\u5177\u4F24\u5BB3\u4F20\u5BFC\u7CFB\u6570\uFF0C\u90E8\u4EF6\u88AB\u6467\u6BC1\u540E\u53D7\u5230\u4F24\u5BB3\u65F6\u6309\u6B64\u6BD4\u4F8B\u4F20\u5BFC\u7ED9\u8F7D\u5177\u3002\u901A\u5E38\u8BBE\u7F6E\u8F83\u4F4E\u4EE5\u9632\u6B62\u97AD\u5C38"\n    },\n    "functional_threshold": {\n      "type": "number",\n      "minimum": 0.0,\n      "maximum": 1.0,\n      "default": 0.3,\n      "description": "\u90E8\u4EF6\u529F\u80FD\u9608\u503C\u3002\u5F53\u7EC4\u88C5\u8FDB\u5EA6\u8FBE\u5230\u8BE5\u503C\u540E\uFF0C\u5B50\u7CFB\u7EDF\u53EF\u5DE5\u4F5C\uFF0C\u4E14\u7EBF\u6846\u7EC4\u88C5\u6E32\u67D3\u53EF\u81EA\u52A8\u5173\u95ED\u3002"\n    },\n    "share_durability": {\n      "type": "boolean",\n      "default": true,\n      "description": "\u90E8\u4EF6\u5185\u96F6\u4EF6\u662F\u5426\u5171\u4EAB\u8010\u4E45\u5EA6\u3002\u5982\u679C\u4E3Atrue\uFF0C\u6240\u6709\u5B50\u90E8\u4EF6\u5171\u4EAB\u540C\u4E00\u8010\u4E45\u5EA6\u6C60\uFF1B\u5982\u679C\u4E3Afalse\uFF0C\u6BCF\u4E2A\u5B50\u90E8\u4EF6\u6709\u72EC\u7ACB\u8010\u4E45\u5EA6"\n    },\n    "max_stack_size": {\n      "type": "integer",\n      "minimum": 1,\n      "maximum": 64,\n      "default": 1,\n      "description": "\u90E8\u4EF6\u7269\u54C1\u7684\u6700\u5927\u5806\u53E0\u6570\u91CF\u3002\u51B3\u5B9A\u6B64\u90E8\u4EF6\u5728\u7269\u54C1\u680F\u4E2D\u53EF\u4EE5\u5806\u53E0\u591A\u5C11\u4E2A\u3002\u9ED8\u8BA4\u503C\u4E3A1\uFF08\u4E0D\u53EF\u5806\u53E0\uFF09"\n    },\n    "variants": {\n      "oneOf": [\n        {\n          "$ref": "part/variant_attr.schema.json",\n          "description": "\u5355\u4E00\u53D8\u4F53\u5B9A\u4E49\uFF0C\u4F7F\u7528\u9ED8\u8BA4\u53D8\u4F53\u540D\uFF08\\"default\\"\uFF09"\n        },\n        {\n          "type": "object",\n          "additionalProperties": {\n            "$ref": "part/variant_attr.schema.json"\n          },\n          "minProperties": 1,\n          "description": "\u591A\u53D8\u4F53\u5B9A\u4E49\uFF0C\u952E\u4E3A\u53D8\u4F53\u540D\u79F0\uFF08\u5982\\"red\\"\u3001\\"blue\\"\u3001\\"camouflage\\"\u7B49\uFF09\uFF0C\u503C\u4E3A\u53D8\u4F53\u914D\u7F6E"\n        }\n      ],\n      "description": "\u90E8\u4EF6\u53D8\u4F53\u5217\u8868\uFF0C\u5E38\u7528\u4F5C\u533A\u5206\u5DE6\u53F3\u5BF9\u79F0\u7684\u90E8\u4EF6\u5982\u8F6E\u80CE\u6216\u624B\u81C2\uFF0C\u652F\u6301\u5355\u4E00\u53D8\u4F53\uFF08\u9ED8\u8BA4\uFF09\u6216\u591A\u4E2A\u53D8\u4F53\u914D\u7F6E\u3002\u6BCF\u4E2A\u53D8\u4F53\u53EF\u4EE5\u6709\u4E0D\u540C\u7684\u5916\u89C2\u548C\u7279\u6027"\n    }\n  },\n  "additionalProperties": false,\n  "required": ["variants"],\n  "examples": [\n    {\n      "$schema": "../../docs/zh_cn/schemas/part_definition_schema.json",\n      "icon": "machine_max:textures/icon/ae86_chassis_all_terrain_icon.png",\n      "vehicle_durability_rate": 1.0,\n      "vehicle_damage_rate": 1.0,\n      "vehicle_damage_rate_destroyed": 0.1,\n      "functional_threshold": 0.6,\n      "share_durability": true,\n      "variants": {\n        "models": "machine_max:ae86_chassis_all_terrain.geo",\n        "textures": [\n          "machine_max:textures/part/ae86_all_terrain_1.png",\n          "machine_max:textures/part/ae86_all_terrain_2.png"\n        ],\n        "animations": "machine_max:ae86",\n        "tags": [],\n        "sub_parts": {\n          "ae86_chassis_all_terrain": {\n            "durability": 550.0,\n            "mass": 1200.0,\n            "hit_boxes": {\n              "mmCollision_Box_Chassis": {\n                "name": "chassis",\n                "type": "box",\n                "thickness": 10\n              }\n            }\n          }\n        }\n      }\n    },\n    {\n      "$schema": "../../docs/zh_cn/schemas/part_definition_schema.json",\n      "icon": "machine_max:textures/icon/car_chassis_icon.png",\n      "vehicle_durability_rate": 0.9,\n      "variants": {\n        "red": {\n          "models": "machine_max:car_chassis.geo",\n          "textures": ["machine_max:textures/part/car_chassis_red.png"],\n          "sub_parts": {\n            "chassis": {\n              "durability": 400.0,\n              "mass": 800.0,\n              "hit_boxes": {\n                "collision_box": {\n                  "type": "box",\n                  "thickness": 8\n                }\n              }\n            }\n          }\n        },\n        "blue": {\n          "models": "machine_max:car_chassis.geo",\n          "textures": ["machine_max:textures/part/car_chassis_blue.png"],\n          "sub_parts": {\n            "chassis": {\n              "durability": 400.0,\n              "mass": 800.0,\n              "hit_boxes": {\n                "collision_box": {\n                  "type": "box",\n                  "thickness": 8\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  ]\n}', "recipe/blueprint_research_recipe.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/recipe/blueprint_research_recipe.schema.json",\n  "title": "Machine-Max Blueprint Research Recipe",\n  "description": "Schema for machine_max:blueprint_research recipe.",\n  "type": "object",\n  "properties": {\n    "$schema": { "type": "string" },\n    "type": { "type": "string", "const": "machine_max:blueprint_research" },\n    "research_cost": { "type": "integer", "minimum": 0 },\n    "research_ingredients": {\n      "type": "array",\n      "items": { "$ref": "#/definitions/ingredient_count_pair" },\n      "default": []\n    },\n    "prerequisites": {\n      "type": "array",\n      "items": { "type": "string" },\n      "default": []\n    },\n    "icon": { "$ref": "#/definitions/resource_location" },\n    "description": { "type": "string", "default": "" },\n    "unlock_recipe": { "type": "string" }\n  },\n  "required": ["type", "research_cost", "unlock_recipe"],\n  "additionalProperties": false,\n  "definitions": {\n    "ingredient_selector": {\n      "anyOf": [\n        {\n          "type": "string",\n          "pattern": "^#?[a-z0-9_.-]+:[a-z0-9_./-]+$"\n        },\n        {\n          "type": "object",\n          "properties": {\n            "item": { "type": "string" },\n            "tag": { "type": "string" }\n          },\n          "anyOf": [{ "required": ["item"] }, { "required": ["tag"] }],\n          "additionalProperties": false\n        },\n        {\n          "type": "object",\n          "properties": {\n            "type": { "type": "string" },\n            "neoforge:ingredient_type": { "type": "string" }\n          },\n          "anyOf": [{ "required": ["type"] }, { "required": ["neoforge:ingredient_type"] }],\n          "additionalProperties": true\n        }\n      ]\n    },    "ingredient_count_pair": {\n      "type": "object",\n      "properties": {\n        "ingredient": { "$ref": "#/definitions/ingredient_selector" },\n        "count": { "type": "integer", "minimum": 0 }\n      },\n      "required": ["ingredient", "count"],\n      "additionalProperties": false\n    },\n    "resource_location": {\n      "type": "string",\n      "pattern": "^[a-z0-9_.-]+:[a-z0-9_./-]+$"\n    }\n  }\n}', "recipe/fabricating_recipe.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/recipe/fabricating_recipe.schema.json",\n  "title": "Machine-Max Fabricating Recipe",\n  "description": "Schema for machine_max:fabricating recipe.",\n  "type": "object",\n  "properties": {\n    "$schema": {\n      "type": "string",\n      "description": "JSON Schema reference path for editor validation."\n    },\n    "type": {\n      "type": "string",\n      "const": "machine_max:fabricating"\n    },\n    "ingredients": {\n      "type": "array",\n      "items": {\n        "$ref": "#/definitions/ingredient_count_pair"\n      }\n    },\n    "result": {\n      "$ref": "#/definitions/result_item"\n    },\n    "time": {\n      "type": "integer",\n      "minimum": 1,\n      "default": 100\n    },\n    "description": {\n      "type": "string",\n      "default": ""\n    }\n  },\n  "required": [\n    "type",\n    "ingredients",\n    "result"\n  ],\n  "additionalProperties": false,\n  "definitions": {\n    "ingredient_selector": {\n      "anyOf": [\n        {\n          "type": "string",\n          "pattern": "^#?[a-z0-9_.-]+:[a-z0-9_./-]+$"\n        },\n        {\n          "type": "object",\n          "properties": {\n            "item": { "type": "string" },\n            "tag": { "type": "string" }\n          },\n          "anyOf": [{ "required": ["item"] }, { "required": ["tag"] }],\n          "additionalProperties": false\n        },\n        {\n          "type": "object",\n          "properties": {\n            "type": { "type": "string" },\n            "neoforge:ingredient_type": { "type": "string" }\n          },\n          "anyOf": [{ "required": ["type"] }, { "required": ["neoforge:ingredient_type"] }],\n          "additionalProperties": true\n        }\n      ]\n    },    "ingredient_count_pair": {\n      "type": "object",\n      "properties": {\n        "ingredient": {\n          "$ref": "#/definitions/ingredient_selector"\n        },\n        "count": {\n          "type": "integer",\n          "minimum": 0\n        }\n      },\n      "required": [\n        "ingredient",\n        "count"\n      ],\n      "additionalProperties": false\n    },\n    "result_item": {\n      "type": "object",\n      "properties": {\n        "id": {\n          "type": "string"\n        },\n        "count": {\n          "type": "integer",\n          "minimum": 1,\n          "maximum": 99,\n          "default": 1\n        },\n        "components": {\n          "type": "object"\n        }\n      },\n      "required": [\n        "id"\n      ],\n      "additionalProperties": true\n    }\n  }\n}', "recipe/research_recipe.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/recipe/research_recipe.schema.json",\n  "title": "Machine-Max Research Recipe",\n  "description": "Schema for machine_max:research recipe.",\n  "type": "object",\n  "properties": {\n    "$schema": { "type": "string" },\n    "type": { "type": "string", "const": "machine_max:research" },\n    "research_cost": { "type": "integer", "minimum": 0 },\n    "research_ingredients": {\n      "type": "array",\n      "items": { "$ref": "#/definitions/ingredient_count_pair" },\n      "default": []\n    },\n    "prerequisites": {\n      "type": "array",\n      "items": { "type": "string" },\n      "default": []\n    },\n    "icon": { "$ref": "#/definitions/resource_location" },\n    "description": { "type": "string", "default": "" }\n  },\n  "required": ["type", "research_cost"],\n  "additionalProperties": false,\n  "definitions": {\n    "ingredient_selector": {\n      "anyOf": [\n        {\n          "type": "string",\n          "pattern": "^#?[a-z0-9_.-]+:[a-z0-9_./-]+$"\n        },\n        {\n          "type": "object",\n          "properties": {\n            "item": { "type": "string" },\n            "tag": { "type": "string" }\n          },\n          "anyOf": [{ "required": ["item"] }, { "required": ["tag"] }],\n          "additionalProperties": false\n        },\n        {\n          "type": "object",\n          "properties": {\n            "type": { "type": "string" },\n            "neoforge:ingredient_type": { "type": "string" }\n          },\n          "anyOf": [{ "required": ["type"] }, { "required": ["neoforge:ingredient_type"] }],\n          "additionalProperties": true\n        }\n      ]\n    },    "ingredient_count_pair": {\n      "type": "object",\n      "properties": {\n        "ingredient": { "$ref": "#/definitions/ingredient_selector" },\n        "count": { "type": "integer", "minimum": 0 }\n      },\n      "required": ["ingredient", "count"],\n      "additionalProperties": false\n    },\n    "resource_location": {\n      "type": "string",\n      "pattern": "^[a-z0-9_.-]+:[a-z0-9_./-]+$"\n    }\n  }\n}', "subsystem/base/power_outputs.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/subsystem/base/power_outputs.json",\n  "title": "\u529F\u7387\u8F93\u51FA\u6620\u5C04",\n  "description": "\u529F\u7387\u8F93\u51FA\u76EE\u6807\u53CA\u51CF\u901F\u6BD4\u7684\u6620\u5C04\uFF0C\u7528\u4E8E\u4F20\u52A8\u7CFB\u7EDF\u7B49\u9700\u8981\u5206\u914D\u529F\u7387\u7684\u5B50\u7CFB\u7EDF\u3002",\n  "type": "object",\n  "additionalProperties": {\n    "type": "number",\n    "description": "\u51CF\u901F\u6BD4\u6216\u6743\u91CD\uFF0C\u6B63\u6570\u8868\u793A\u51CF\u901F\uFF0C\u8D1F\u6570\u8868\u793A\u589E\u901F\uFF0C0\u8868\u793A\u56FA\u5B9A\u8FDE\u63A5\u3002"\n  },\n  "default": {},\n  "examples": [\n    {\n      "left_front_wheel_driver": 1.0,\n      "right_front_wheel_driver": 1.0,\n      "left_back_wheel_driver": 1.0,\n      "right_back_wheel_driver": 1.0\n    }\n  ]\n}', "subsystem/base/signal_targets.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/base/signal_targets.json",
  "title": "\u4FE1\u53F7\u76EE\u6807\u6620\u5C04",
  "description": "\u4FE1\u53F7\u9891\u9053\u5230\u76EE\u6807\u5217\u8868\u7684\u6620\u5C04\uFF0C\u7528\u4E8E\u5B9A\u4E49\u5B50\u7CFB\u7EDF\u4E4B\u95F4\u7684\u4FE1\u53F7\u4F20\u8F93\u5173\u7CFB\u3002",
  "type": "object",
  "additionalProperties": {
    "type": "array",
    "items": { "type": "string" },
    "description": "\u76EE\u6807\u540D\u79F0\u5217\u8868\uFF0C\u53EF\u4EE5\u662F\u5B50\u7CFB\u7EDF\u540D\u79F0\u3001\u8FDE\u63A5\u70B9\u540D\u79F0\u3001'part'\u6216'vehicle'\u3002"
  },
  "default": {},
  "examples": [
    {
      "move_control": ["car_controller", "engine"],
      "gear_control": ["gearbox"]
    }
  ]
}`, "subsystem/dynamic/basic_dynamic_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/dynamic/basic_dynamic_attr.json",
  "title": "\u57FA\u7840\u65E0\u529F\u80FD\u5B50\u7CFB\u7EDF\u52A8\u6001\u5C5E\u6027",
  "description": "\u57FA\u7840\u65E0\u529F\u80FD\u5B50\u7CFB\u7EDF\u7684\u52A8\u6001\u5C5E\u6027\uFF0C\u53EA\u9700\u6307\u5B9A\u578B\u53F7\u5373\u53EF\u3002",
  "properties": {
    "type": {
      "type": "string",
      "const": "machine_max:basic",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:basic'\u3002"
    },
    "definition": {
      "type": "string",
      "description": "\u5B50\u7CFB\u7EDF\u578B\u53F7\u7684\u8D44\u6E90\u5730\u5740\uFF0C\u6307\u5411\u5BF9\u5E94\u7684\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027\u5B9A\u4E49\u6587\u4EF6\u3002"
    }
  },
  "required": ["type", "definition"],
  "examples": [
    {
      "type": "machine_max:basic",
      "definition": "machine_max:default_trunk"
    }
  ]
}`, "subsystem/dynamic/car_controller_dynamic_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/dynamic/car_controller_dynamic_attr.json",
  "title": "\u8F66\u8F86\u63A7\u5236\u5668\u5B50\u7CFB\u7EDF\u52A8\u6001\u5C5E\u6027",
  "description": "\u8F66\u8F86\u63A7\u5236\u5668\u7684\u52A8\u6001\u5C5E\u6027\uFF0C\u5B9A\u4E49\u4FE1\u53F7\u8F93\u51FA\u76EE\u6807\u548C\u63A7\u5236\u5173\u7CFB\u3002",
  "properties": {
    "type": {
      "type": "string",
      "const": "machine_max:car_controller",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:car_controller'\u3002"
    },
    "definition": {
      "type": "string",
      "description": "\u5B50\u7CFB\u7EDF\u578B\u53F7\u7684\u8D44\u6E90\u5730\u5740\uFF0C\u6307\u5411\u5BF9\u5E94\u7684\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027\u5B9A\u4E49\u6587\u4EF6\u3002"
    },
    "control_outputs": {
      "$ref": "../base/signal_targets.json",
      "description": "\u7EDF\u4E00\u63A7\u5236\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002\u5F15\u64CE/\u7535\u52A8\u673A/\u53D8\u901F\u7BB1/\u8F66\u8F6E\u7B49\u53D7\u63A7\u5B50\u7CFB\u7EDF\u5747\u901A\u8FC7\u6B64\u901A\u9053\u8FDB\u884C\u63E1\u624B\u548C\u4FE1\u53F7\u4F20\u8F93\u3002"
    },
    "speed_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": { "vehicle_speed": ["subpart", "vehicle"] },
      "description": "\u79FB\u52A8\u901F\u5EA6\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002\u53EF\u9009\uFF0C\u9ED8\u8BA4\u5C06\u79FB\u52A8\u901F\u5EA6(m/s)\u53D1\u81F3\u90E8\u4EF6\u548C\u8F7D\u5177\u7684vehicle_speed\u9891\u9053\u3002"
    },
    "throttle_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": { "throttle": ["subpart", "vehicle"] },
      "description": "\u6CB9\u95E8\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002\u53EF\u9009\uFF0C\u9ED8\u8BA4\u5C06\u6CB9\u95E8[0,1]\u53D1\u81F3\u90E8\u4EF6\u548C\u8F7D\u5177\u7684throttle\u9891\u9053\u3002"
    },
    "brake_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": { "brake": ["subpart", "vehicle"] },
      "description": "\u5236\u52A8\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002\u53EF\u9009\uFF0C\u9ED8\u8BA4\u5C06\u5236\u52A8\u7A0B\u5EA6[0,1]\u53D1\u81F3\u90E8\u4EF6\u548C\u8F7D\u5177\u7684brake\u9891\u9053\u3002"
    },
    "steering_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": { "steering": ["subpart", "vehicle"] },
      "description": "\u8F6C\u5411\u89D2\u5EA6\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002\u53EF\u9009\uFF0C\u9ED8\u8BA4\u5C06\u8F6C\u5411\u7A0B\u5EA6[-1,1]\u53D1\u81F3\u90E8\u4EF6\u548C\u8F7D\u5177\u7684steering\u9891\u9053\u3002"
    },
    "handbrake_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": { "handbrake": ["subpart", "vehicle"] },
      "description": "\u624B\u5239\u5668\u5F00\u5173\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002\u53EF\u9009\uFF0C\u9ED8\u8BA4\u5C06\u624B\u5239\u7A0B\u5EA6[0,1]\u53D1\u81F3\u90E8\u4EF6\u548C\u8F7D\u5177\u7684handbrake\u9891\u9053\u3002"
    }
  },
  "required": ["type", "definition", "control_outputs"],
  "examples": [
    {
      "type": "machine_max:car_controller",
      "definition": "machine_max:ae86at_car_controller",
      "control_outputs": {
        "car_control": [
          "subsystem.machine_max.engine",
          "subsystem.machine_max.left_front_wheel_driver",
          "subsystem.machine_max.right_front_wheel_driver",
          "subsystem.machine_max.left_back_wheel_driver",
          "subsystem.machine_max.right_back_wheel_driver",
          "subsystem.machine_max.gearbox"
        ]
      }
    }
  ]
}`, "subsystem/dynamic/engine_dynamic_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/dynamic/engine_dynamic_attr.json",
  "title": "\u5F15\u64CE\u5B50\u7CFB\u7EDF\u52A8\u6001\u5C5E\u6027",
  "description": "\u5F15\u64CE\u7684\u52A8\u6001\u5C5E\u6027\uFF0C\u5B9A\u4E49\u529F\u7387\u8F93\u51FA\u76EE\u6807\u548C\u8F6C\u901F\u4FE1\u53F7\u8F93\u51FA\u3002",
  "properties": {
    "type": {
      "type": "string",
      "const": "machine_max:engine",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:engine'\u3002"
    },
    "definition": {
      "type": "string",
      "description": "\u5B50\u7CFB\u7EDF\u578B\u53F7\u7684\u8D44\u6E90\u5730\u5740\uFF0C\u6307\u5411\u5BF9\u5E94\u7684\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027\u5B9A\u4E49\u6587\u4EF6\u3002"
    },
    "power_output": {
      "type": "string",
      "description": "\u529F\u7387\u8F93\u51FA\u76EE\u6807\uFF0C\u53EF\u586B\u5199\u4EFB\u610F\u672C\u90E8\u4EF6\u5185\u5176\u4ED6\u5B50\u7CFB\u7EDF\u540D\u79F0\u3001\u90E8\u4EF6\u8FDE\u63A5\u70B9\u540D\u79F0\uFF0C\u6216'part'\uFF0C\u6216'vehicle'\u3002"
    },
    "speed_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": {},
      "description": "\u5F15\u64CE\u8F6C\u901F\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002\u53EF\u9009\uFF0C\u9ED8\u8BA4\u5C06\u5F15\u64CE\u8F6C\u901F(rad/s)\u53D1\u81F3\u90E8\u4EF6\u548C\u8F7D\u5177\u7684engine_speed\u9891\u9053\u3002"
    }
  },
  "required": ["type", "definition", "power_output"],
  "examples": [
    {
      "type": "machine_max:engine",
      "definition": "machine_max:ae86at_engine",
      "power_output": "gearbox",
      "speed_outputs": { "engine_speed": ["part", "vehicle"] }
    }
  ]
}`, "subsystem/dynamic/gearbox_dynamic_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/dynamic/gearbox_dynamic_attr.json",
  "title": "\u53D8\u901F\u7BB1\u5B50\u7CFB\u7EDF\u52A8\u6001\u5C5E\u6027",
  "description": "\u53D8\u901F\u7BB1\u7684\u52A8\u6001\u5C5E\u6027\uFF0C\u5B9A\u4E49\u529F\u7387\u8F93\u51FA\u76EE\u6807\u548C\u6321\u4F4D\u4FE1\u53F7\u8F93\u51FA\u3002",
  "properties": {
    "type": {
      "type": "string",
      "const": "machine_max:gearbox",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:gearbox'\u3002"
    },
    "definition": {
      "type": "string",
      "description": "\u5B50\u7CFB\u7EDF\u578B\u53F7\u7684\u8D44\u6E90\u5730\u5740\uFF0C\u6307\u5411\u5BF9\u5E94\u7684\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027\u5B9A\u4E49\u6587\u4EF6\u3002"
    },
    "power_output": {
      "type": "string",
      "description": "\u529F\u7387\u8F93\u51FA\u76EE\u6807\uFF0C\u5B50\u7CFB\u7EDF\u6216\u90E8\u4EF6\u63A5\u53E3\u540D\u3002"
    },
    "gear_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": { "gear": ["part", "vehicle"] },
      "description": "\u6321\u4F4D\u540D\u79F0\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002\u53EF\u9009\uFF0C\u9ED8\u8BA4\u5C06\u5F53\u524D\u6321\u4F4D\u540D\u79F0\u53D1\u81F3\u90E8\u4EF6\u548C\u8F7D\u5177\u7684gear\u9891\u9053\u3002"
    }
  },
  "required": ["type", "definition", "power_output"],
  "examples": [
    {
      "type": "machine_max:gearbox",
      "definition": "machine_max:ae86at_gearbox",
      "power_output": "transmission",
      "gear_outputs": { "gear": ["part", "vehicle"] }
    }
  ]
}`, "subsystem/dynamic/item_storage_dynamic_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/dynamic/item_storage_dynamic_attr.json",
  "title": "\u7269\u54C1\u5B58\u50A8\u5B50\u7CFB\u7EDF\u52A8\u6001\u5C5E\u6027",
  "description": "\u7269\u54C1\u5B58\u50A8\u5BB9\u5668\u7684\u52A8\u6001\u5C5E\u6027\uFF0C\u53EA\u9700\u6307\u5B9A\u578B\u53F7\u5373\u53EF\u3002",
  "properties": {
    "type": {
      "type": "string",
      "const": "machine_max:item_storage",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:item_storage'\u3002"
    },
    "definition": {
      "type": "string",
      "description": "\u5B50\u7CFB\u7EDF\u578B\u53F7\u7684\u8D44\u6E90\u5730\u5740\uFF0C\u6307\u5411\u5BF9\u5E94\u7684\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027\u5B9A\u4E49\u6587\u4EF6\u3002"
    }
  },
  "required": ["type", "definition"],
  "examples": [
    {
      "type": "machine_max:item_storage",
      "definition": "machine_max:default_trunk"
    }
  ]
}`, "subsystem/dynamic/lighting_dynamic_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/dynamic/lighting_dynamic_attr.json",
  "title": "\u7167\u660E\u5B50\u7CFB\u7EDF\u52A8\u6001\u5C5E\u6027",
  "description": "\u7167\u660E\u5B50\u7CFB\u7EDF\u5B9E\u4F8B\u5C5E\u6027\uFF0C\u6307\u5B9A\u5149\u6E90\u578B\u53F7\u4E0E\u6A21\u578B\u5B9A\u4F4D\u5668\u3002",
  "properties": {
    "type": {
      "type": "string",
      "const": "machine_max:lighting",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:lighting'\u3002"
    },
    "definition": {
      "type": "string",
      "description": "\u5B50\u7CFB\u7EDF\u578B\u53F7\u7684\u8D44\u6E90\u5730\u5740\uFF0C\u6307\u5411\u5BF9\u5E94\u7684\u7167\u660E\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027\u5B9A\u4E49\u6587\u4EF6\u3002"
    },
    "locator": {
      "type": "string",
      "description": "\u5149\u6E90\u5B9A\u4F4D\u5668\u540D\u79F0\u3002\u6E32\u67D3\u65F6\u4F7F\u7528\u8BE5\u5B9A\u4F4D\u5668\u7684\u4F4D\u7F6E\u548C\u671D\u5411\u3002"
    }
  },
  "required": ["type", "definition", "locator"],
  "additionalProperties": false,
  "examples": [
    {
      "type": "machine_max:lighting",
      "definition": "machine_max:headlight_white",
      "locator": "Headlight_L"
    }
  ]
}`, "subsystem/dynamic/motorbike_controller_dynamic_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/dynamic/motorbike_controller_dynamic_attr.json",
  "title": "\u6469\u6258\u8F66\u63A7\u5236\u5668\u5B50\u7CFB\u7EDF\u52A8\u6001\u5C5E\u6027",
  "description": "\u8F66\u8F86\u63A7\u5236\u5668\u7684\u52A8\u6001\u5C5E\u6027\uFF0C\u5B9A\u4E49\u4FE1\u53F7\u8F93\u51FA\u76EE\u6807\u548C\u63A7\u5236\u5173\u7CFB\u3002",
  "properties": {
    "type": {
      "type": "string",
      "const": "machine_max:motorbike_controller",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:motorbike_controller'\u3002"
    },
    "definition": {
      "type": "string",
      "description": "\u5B50\u7CFB\u7EDF\u578B\u53F7\u7684\u8D44\u6E90\u5730\u5740\uFF0C\u6307\u5411\u5BF9\u5E94\u7684\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027\u5B9A\u4E49\u6587\u4EF6\u3002"
    },
    "control_outputs": {
      "$ref": "../base/signal_targets.json",
      "description": "\u7EDF\u4E00\u63A7\u5236\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002\u5F15\u64CE/\u7535\u52A8\u673A/\u53D8\u901F\u7BB1/\u8F66\u8F6E\u7B49\u53D7\u63A7\u5B50\u7CFB\u7EDF\u5747\u901A\u8FC7\u6B64\u901A\u9053\u8FDB\u884C\u63E1\u624B\u548C\u4FE1\u53F7\u4F20\u8F93\u3002"
    },
    "speed_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": { "vehicle_speed": ["subpart", "vehicle"] },
      "description": "\u79FB\u52A8\u901F\u5EA6\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002\u53EF\u9009\uFF0C\u9ED8\u8BA4\u5C06\u79FB\u52A8\u901F\u5EA6(m/s)\u53D1\u81F3\u90E8\u4EF6\u548C\u8F7D\u5177\u7684vehicle_speed\u9891\u9053\u3002"
    },
    "throttle_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": { "throttle": ["subpart", "vehicle"] },
      "description": "\u6CB9\u95E8\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002\u53EF\u9009\uFF0C\u9ED8\u8BA4\u5C06\u6CB9\u95E8[0,1]\u53D1\u81F3\u90E8\u4EF6\u548C\u8F7D\u5177\u7684throttle\u9891\u9053\u3002"
    },
    "brake_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": { "brake": ["subpart", "vehicle"] },
      "description": "\u5236\u52A8\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002\u53EF\u9009\uFF0C\u9ED8\u8BA4\u5C06\u5236\u52A8\u7A0B\u5EA6[0,1]\u53D1\u81F3\u90E8\u4EF6\u548C\u8F7D\u5177\u7684brake\u9891\u9053\u3002"
    },
    "steering_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": { "steering": ["subpart", "vehicle"] },
      "description": "\u8F6C\u5411\u89D2\u5EA6\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002\u53EF\u9009\uFF0C\u9ED8\u8BA4\u5C06\u8F6C\u5411\u7A0B\u5EA6[-1,1]\u53D1\u81F3\u90E8\u4EF6\u548C\u8F7D\u5177\u7684steering\u9891\u9053\u3002"
    },
    "handbrake_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": { "handbrake": ["subpart", "vehicle"] },
      "description": "\u624B\u5239\u5668\u5F00\u5173\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002\u53EF\u9009\uFF0C\u9ED8\u8BA4\u5C06\u624B\u5239\u7A0B\u5EA6[0,1]\u53D1\u81F3\u90E8\u4EF6\u548C\u8F7D\u5177\u7684handbrake\u9891\u9053\u3002"
    }
  },
  "required": ["type", "definition", "control_outputs"],
  "examples": [
    {
      "type": "machine_max:motorbike_controller",
      "definition": "machine_max:r700_motorbike_controller",
      "control_outputs": {
        "car_control": [
          "subsystem.machine_max.engine",
          "subsystem.machine_max.front_wheel_driver",
          "subsystem.machine_max.back_wheel_driver",
          "subsystem.machine_max.gearbox"
        ]
      }
    }
  ]
}`, "subsystem/dynamic/motor_dynamic_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/dynamic/motor_dynamic_attr.json",
  "title": "\u7535\u673A\u5B50\u7CFB\u7EDF\u52A8\u6001\u5C5E\u6027",
  "description": "\u7535\u673A\u7684\u52A8\u6001\u5C5E\u6027\uFF0C\u5B9A\u4E49\u529F\u7387\u8F93\u51FA\u76EE\u6807\u548C\u8F6C\u901F\u4FE1\u53F7\u8F93\u51FA\u3002",
  "properties": {
    "type": {
      "type": "string",
      "const": "machine_max:motor",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:motor'\u3002"
    },
    "definition": {
      "type": "string",
      "description": "\u5B50\u7CFB\u7EDF\u578B\u53F7\u7684\u8D44\u6E90\u5730\u5740\uFF0C\u6307\u5411\u5BF9\u5E94\u7684\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027\u5B9A\u4E49\u6587\u4EF6\u3002"
    },
    "power_output": {
      "type": "string",
      "description": "\u529F\u7387\u8F93\u51FA\u76EE\u6807\uFF0C\u53EF\u586B\u5199\u4EFB\u610F\u672C\u90E8\u4EF6\u5185\u5176\u4ED6\u5B50\u7CFB\u7EDF\u540D\u79F0\u3001\u90E8\u4EF6\u8FDE\u63A5\u70B9\u540D\u79F0\uFF0C\u6216'part'\uFF0C\u6216'vehicle'\u3002"
    },
    "speed_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": {},
      "description": "\u7535\u673A\u8F6C\u901F\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002\u53EF\u9009\uFF0C\u9ED8\u8BA4\u5C06\u7535\u673A\u8F6C\u901F(rad/s)\u53D1\u81F3\u90E8\u4EF6\u548C\u8F7D\u5177\u7684motor_speed\u9891\u9053\u3002"
    }
  },
  "required": ["type", "definition", "power_output"],
  "examples": [
    {
      "type": "machine_max:motor",
      "definition": "machine_max:electric_motor",
      "power_output": "transmission",
      "speed_outputs": { "motor_speed": ["part", "vehicle"] }
    }
  ]
}`, "subsystem/dynamic/seat_dynamic_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/dynamic/seat_dynamic_attr.json",
  "title": "\u5EA7\u6905\u5B50\u7CFB\u7EDF\u52A8\u6001\u5C5E\u6027",
  "description": "\u5EA7\u6905\u7684\u52A8\u6001\u5C5E\u6027\uFF0C\u5B9A\u4E49\u5EA7\u6905\u4F4D\u7F6E\u3001\u4FE1\u53F7\u4F20\u8F93\u76EE\u6807\u7B49\u3002",
  "properties": {
    "type": {
      "type": "string",
      "const": "machine_max:seat",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:seat'\u3002"
    },
    "definition": {
      "type": "string",
      "description": "\u5B50\u7CFB\u7EDF\u578B\u53F7\u7684\u8D44\u6E90\u5730\u5740\uFF0C\u6307\u5411\u5BF9\u5E94\u7684\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027\u5B9A\u4E49\u6587\u4EF6\u3002"
    },
    "locator": {
      "type": "string",
      "default": "",
      "description": "\u5EA7\u6905\u70B9\u5B9A\u4F4D\u5668\u540D\u79F0\uFF0C\u6A21\u578B\u4E2D\u7684\u9AA8\u9ABC\u5C06\u4F5C\u4E3A\u5EA7\u6905\u4F4D\u7F6E\u3002\u82E5\u4E3A\u7A7A\uFF0C\u5219\u4F7F\u7528\u5B50\u7CFB\u7EDF\u5B9A\u4E49\u7684\u9ED8\u8BA4\u5B9A\u4F4D\u5668\u3002"
    },
    "move_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": {},
      "description": "\u79FB\u52A8\u63A7\u5236\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002"
    },
    "aim_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": {},
      "description": "\u89C6\u89D2\u63A7\u5236\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002"
    },
    "regular_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": {},
      "description": "\u5E38\u89C4\u63A7\u5236\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002"
    },
    "passenger_num_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": {},
      "description": "\u4E58\u5BA2\u6570\u91CF\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002"
    }
  },
  "required": ["type", "definition"],
  "examples": [
    {
      "type": "machine_max:seat",
      "definition": "machine_max:driver_seat",
      "locator": "DriverSeat",
      "move_outputs": {
        "move_control": [
          "car_controller",
          "engine",
          "left_front_wheel_driver",
          "right_front_wheel_driver",
          "left_back_wheel_driver",
          "right_back_wheel_driver"
        ]
      },
      "regular_outputs": { "regular_control": ["car_controller"] }
    }
  ]
}`, "subsystem/dynamic/transmission_dynamic_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/dynamic/transmission_dynamic_attr.json",
  "title": "\u4F20\u52A8\u7CFB\u7EDF\u5B50\u7CFB\u7EDF\u52A8\u6001\u5C5E\u6027",
  "description": "\u4F20\u52A8\u7CFB\u7EDF\u7684\u52A8\u6001\u5C5E\u6027\uFF0C\u5C06\u63A5\u6536\u5230\u7684\u529F\u7387\u5206\u914D\u81F3\u5404\u4E2A\u8F93\u51FA\u76EE\u6807\u3002",
  "properties": {
    "type": {
      "type": "string",
      "const": "machine_max:transmission",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:transmission'\u3002"
    },
    "definition": {
      "type": "string",
      "description": "\u5B50\u7CFB\u7EDF\u578B\u53F7\u7684\u8D44\u6E90\u5730\u5740\uFF0C\u6307\u5411\u5BF9\u5E94\u7684\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027\u5B9A\u4E49\u6587\u4EF6\u3002"
    },
    "power_outputs": {
      "$ref": "../base/power_outputs.schema.json",
      "description": "\u52A8\u529B\u8F93\u51FA\u76EE\u6807\u53CA\u51CF\u901F\u6BD4\u3002"
    }
  },
  "required": ["type", "definition", "power_outputs"],
  "examples": [
    {
      "type": "machine_max:transmission",
      "definition": "machine_max:ae86at_transmission",
      "power_outputs": {
        "left_front_wheel_driver": 1.0,
        "right_front_wheel_driver": 1.0,
        "left_back_wheel_driver": 1.0,
        "right_back_wheel_driver": 1.0
      }
    }
  ]
}`, "subsystem/dynamic/wheel_driver_dynamic_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/dynamic/wheel_driver_dynamic_attr.json",
  "title": "\u8F6E\u9A71\u52A8\u5B50\u7CFB\u7EDF\u52A8\u6001\u5C5E\u6027",
  "description": "\u8F6E\u9A71\u52A8\u7684\u52A8\u6001\u5C5E\u6027\uFF0C\u9A71\u52A8\u8FDE\u63A5\u70B9\u4E0A\u7684\u90E8\u4EF6\u6EDA\u52A8\u548C\u8F6C\u5411\u3002",
  "properties": {
    "type": {
      "type": "string",
      "const": "machine_max:wheel_driver",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:wheel_driver'\u3002"
    },
    "definition": {
      "type": "string",
      "description": "\u5B50\u7CFB\u7EDF\u578B\u53F7\u7684\u8D44\u6E90\u5730\u5740\uFF0C\u6307\u5411\u5BF9\u5E94\u7684\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027\u5B9A\u4E49\u6587\u4EF6\u3002"
    },
    "connector": {
      "type": "string",
      "description": "\u63A7\u5236\u7684\u8FDE\u63A5\u70B9\u540D\u79F0\u3002"
    },
    "roll_speed_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": {},
      "description": "\u6EDA\u52A8\u901F\u5EA6\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002"
    },
    "steering_angle_outputs": {
      "$ref": "../base/signal_targets.json",
      "default": {},
      "description": "\u8F6C\u5411\u89D2\u5EA6\u4FE1\u53F7\u8F93\u51FA\u9891\u9053\u53CA\u76EE\u6807\u3002"
    }
  },
  "required": ["type", "definition", "connector"],
  "examples": [
    {
      "type": "machine_max:wheel_driver",
      "definition": "machine_max:ae86at_front_wheel_driver",
      "connector": "left_front_wheel",
      "roll_speed_outputs": { "wheel_speed": ["part", "vehicle"] },
      "steering_angle_outputs": { "steering_angle": ["part", "vehicle"] }
    }
  ]
}`, "subsystem/static/basic_static_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/static/basic_static_attr.json",
  "title": "\u57FA\u7840\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027",
  "description": "\u65E0\u5B9E\u9645\u529F\u80FD\u7684\u57FA\u7840\u5B50\u7CFB\u7EDF\uFF0C\u53EF\u88AB\u5B9E\u4F8B\u5316\uFF0C\u4F5C\u4E3A\u65E0\u529F\u80FD\u4F46\u53EF\u5411\u8F7D\u5177\u4F20\u5BFC\u4F24\u5BB3\u7684\u5B50\u7CFB\u7EDF\uFF0C\u4F8B\u5982\u8F7D\u5177\u7684\u53EF\u7834\u574F\u5F31\u70B9\u3002",
  "properties": {
    "$schema": {
      "type": "string",
      "description": "JSON Schema\u5F15\u7528\u8DEF\u5F84\uFF0C\u7528\u4E8E\u7F16\u8F91\u5668\u667A\u80FD\u63D0\u793A\u548C\u9A8C\u8BC1",
      "default": "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json"
    },
    "type": {
      "type": "string",
      "const": "machine_max:basic",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:basic'\u3002"
    },
    "basic_durability": {
      "type": "number",
      "minimum": 0,
      "default": 20.0,
      "description": "\u5B50\u7CFB\u7EDF\u57FA\u7840\u8010\u4E45\u5EA6\uFF0C\u964D\u81F30\u65F6\u4F1A\u762B\u75EA\uFF0C\u4FEE\u590D\u81F330%\u8010\u4E45\u5EA6\u65F6\u6062\u590D\u529F\u80FD\u3002"
    },
    "pass_damage": {
      "type": "boolean",
      "default": true,
      "description": "\u662F\u5426\u4F20\u9012\u4F24\u5BB3\u81F3\u5B50\u7CFB\u7EDF\u6301\u6709\u8005\u3002\u82E5\u4E3Atrue\uFF0C\u5B50\u7CFB\u7EDF\u53D7\u5230\u7684\u4F24\u5BB3\u4F1A\u4F20\u9012\u7ED9\u96F6\u4EF6\u3002"
    },
    "limit_damage": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9650\u5236\u4F24\u5BB3\u4F20\u9012\u503C\u81F3\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u3002\u4F8B\u598240\u4F24\u5BB3\uFF0C\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u4E3A20\uFF0C\u5219\u53EA\u4F1A\u4F20\u901220\u4F24\u5BB3\u7ED9\u6301\u6709\u8005\u3002"
    },
    "hidden": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9690\u85CF\u5B50\u7CFB\u7EDF\u5728HUD\u7B49\u5904\u7684\u663E\u793A\uFF0C\u5E38\u7528\u4E8E\u7EAF\u7CB9\u63D0\u4F9B\u6A21\u578B\u90E8\u4F4D\u635F\u574F\u5DEE\u5206\u7684\u65E0\u529F\u80FD\u5B50\u7CFB\u7EDF"
    },
    "sounds": {
      "type": "object",
      "properties": {
        "on_destroyed": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6467\u6BC1\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        },
        "on_activate": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6FC0\u6D3B\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        }
      },
      "additionalProperties": false,
      "description": "\u5B50\u7CFB\u7EDF\u57FA\u672C\u97F3\u6548\u914D\u7F6E\u3002"
    }
  },
  "required": ["type"],
  "additionalProperties": false,
  "examples": [
    {
      "type": "machine_max:basic",
      "description": "\u6700\u7B80\u793A\u4F8B - \u4EC5\u5305\u542B\u5FC5\u987B\u5B57\u6BB5"
    },
    {
      "type": "machine_max:basic",
      "basic_durability": 30.0,
      "pass_damage": false,
      "description": "\u9AD8\u7EA7\u793A\u4F8B - \u7981\u7528\u4F24\u5BB3\u4F20\u9012\uFF0C\u53EF\u7528\u4E8E\u8F66\u7A97\u73BB\u7483"
    },
    {
      "type": "machine_max:basic",
      "basic_durability": 50.0,
      "pass_damage": true,
      "limit_damage": true,
      "description": "\u5B8C\u6574\u793A\u4F8B - \u5305\u542B\u6240\u6709\u53EF\u9009\u5B57\u6BB5"
    }
  ]
}`, "subsystem/static/car_controller_static_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/static/car_controller_static_attr.json",
  "title": "\u8F66\u8F86\u63A7\u5236\u5668\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027",
  "description": "\u8F66\u8F86\u63A7\u5236\u7CFB\u7EDF\u7684\u9759\u6001\u5C5E\u6027\uFF0C\u8D1F\u8D23\u5904\u7406\u9A7E\u9A76\u8F93\u5165\u3001\u8F6C\u5411\u63A7\u5236\u7B49\u3002",
  "properties": {
    "$schema": {
      "type": "string",
      "description": "JSON Schema\u5F15\u7528\u8DEF\u5F84\uFF0C\u7528\u4E8E\u7F16\u8F91\u5668\u667A\u80FD\u63D0\u793A\u548C\u9A8C\u8BC1",
      "default": "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json"
    },
    "type": {
      "type": "string",
      "const": "machine_max:car_controller",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:car_controller'\u3002"
    },
    "basic_durability": {
      "type": "number",
      "minimum": 0,
      "default": 20.0,
      "description": "\u5B50\u7CFB\u7EDF\u57FA\u7840\u8010\u4E45\u5EA6\uFF0C\u964D\u81F30\u65F6\u4F1A\u762B\u75EA\uFF0C\u4FEE\u590D\u81F330%\u8010\u4E45\u5EA6\u65F6\u6062\u590D\u529F\u80FD\u3002"
    },
    "pass_damage": {
      "type": "boolean",
      "default": true,
      "description": "\u662F\u5426\u4F20\u9012\u4F24\u5BB3\u81F3\u5B50\u7CFB\u7EDF\u6301\u6709\u8005\u3002\u82E5\u4E3Atrue\uFF0C\u5B50\u7CFB\u7EDF\u53D7\u5230\u7684\u4F24\u5BB3\u4F1A\u4F20\u9012\u7ED9\u96F6\u4EF6\u3002"
    },
    "limit_damage": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9650\u5236\u4F24\u5BB3\u4F20\u9012\u503C\u81F3\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u3002\u4F8B\u598240\u4F24\u5BB3\uFF0C\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u4E3A20\uFF0C\u5219\u53EA\u4F1A\u4F20\u901220\u4F24\u5BB3\u7ED9\u6301\u6709\u8005\u3002"
    },
    "hidden": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9690\u85CF\u5B50\u7CFB\u7EDF\u5728HUD\u7B49\u5904\u7684\u663E\u793A\uFF0C\u5E38\u7528\u4E8E\u7EAF\u7CB9\u63D0\u4F9B\u6A21\u578B\u90E8\u4F4D\u635F\u574F\u5DEE\u5206\u7684\u65E0\u529F\u80FD\u5B50\u7CFB\u7EDF"
    },
    "steering_center": {
      "$ref": "../../base/vector_3d.schema.json",
      "default": [0, 0, 0],
      "description": "\u8F6C\u5411\u4E2D\u5FC3\u4F4D\u7F6E\uFF0C\u76F8\u5BF9\u4E8E\u90E8\u4EF6\u5C40\u90E8\u5750\u6807\u7CFB\u3002"
    },
    "min_steering_radius": {
      "type": "number",
      "minimum": 0,
      "default": 5.0,
      "description": "\u6700\u5C0F\u8F6C\u5411\u534A\u5F84\uFF0C\u5355\u4F4D\u7C73\u3002\u7528\u4E8E\u4F4E\u901F\u65F6\u7684\u8F6C\u5411\u9650\u5236\u3002"
    },
    "lateral_acceleration": {
      "oneOf": [
        {
          "type": "number",
          "minimum": 0,
          "default": 8.0,
          "description": "\u4FA7\u5411\u52A0\u901F\u5EA6\u9650\u5236\uFF0C\u5355\u4F4Dm/s\xB2\u3002\u7528\u4E8E\u6839\u636E\u901F\u5EA6\u5B9E\u65F6\u8BA1\u7B97\u8F6C\u5411\u534A\u5F84\uFF08\u534A\u5F84 = \u901F\u5EA6\xB2 / \u52A0\u901F\u5EA6\uFF09\u3002"
        },
        {
          "type": "object",
          "additionalProperties": {
            "type": "number",
            "minimum": 0
          },
          "description": "\u901F\u5EA6-\u4FA7\u5411\u52A0\u901F\u5EA6\u6620\u5C04\u8868\uFF0C\u952E\u4E3A\u901F\u5EA6\uFF08km/h\uFF09\uFF0C\u503C\u4E3A\u5BF9\u5E94\u7684\u4FA7\u5411\u52A0\u901F\u5EA6\u9650\u5236\uFF08m/s\xB2\uFF09\u3002\u7EBF\u6027\u63D2\u503C\u3002",
          "examples": [
            {
              "0": 8.0,
              "30": 6.0,
              "60": 4.0,
              "100": 3.0
            }
          ]
        }
      ],
      "default": 8.0,
      "description": "\u4FA7\u5411\u52A0\u901F\u5EA6\u9650\u5236\uFF0C\u5355\u4F4Dm/s\xB2\u3002\u7528\u4E8E\u6839\u636E\u901F\u5EA6\u5B9E\u65F6\u8BA1\u7B97\u8F6C\u5411\u534A\u5F84\uFF08\u534A\u5F84 = \u901F\u5EA6\xB2 / \u52A0\u901F\u5EA6\uFF09\u3002"
    },
    "max_drift_angular_velocity": {
      "oneOf": [
        {
          "type": "number",
          "minimum": 0,
          "default": 1.0,
          "description": "\u6700\u5927\u6F02\u79FB\u89D2\u901F\u5EA6\uFF0C\u5355\u4F4Drad/s\u3002\u4F5C\u4E3A\u6F02\u79FB\u65F6PD\u63A7\u5236\u5668\u7684\u76EE\u6807\u503C\u3002"
        },
        {
          "type": "object",
          "additionalProperties": {
            "type": "number",
            "minimum": 0
          },
          "description": "\u901F\u5EA6-\u6700\u5927\u6F02\u79FB\u89D2\u901F\u5EA6\u6620\u5C04\u8868\uFF0C\u952E\u4E3A\u901F\u5EA6\uFF08km/h\uFF09\uFF0C\u503C\u4E3A\u5BF9\u5E94\u7684\u6700\u5927\u6F02\u79FB\u89D2\u901F\u5EA6\uFF08rad/s\uFF09\u3002\u7EBF\u6027\u63D2\u503C\u3002",
          "examples": [
            {
              "0": 0.8,
              "30": 1.0,
              "60": 1.2,
              "100": 1.5
            }
          ]
        }
      ],
      "default": 1.0,
      "description": "\u6700\u5927\u6F02\u79FB\u89D2\u901F\u5EA6\uFF0C\u5355\u4F4Drad/s\u3002\u4F5C\u4E3A\u6F02\u79FB\u65F6PD\u63A7\u5236\u5668\u7684\u76EE\u6807\u503C\u3002"
    },
    "manual_gear_shift": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u542F\u7528\u624B\u52A8\u6362\u6321\u3002\u82E5\u4E3Afalse\uFF0C\u5219\u81EA\u52A8\u6362\u6321\u3002"
    },
    "auto_hand_brake": {
      "type": "boolean",
      "default": true,
      "description": "\u662F\u5426\u81EA\u52A8\u542F\u7528\u624B\u5239\u3002\u5F53\u8F66\u8F86\u9759\u6B62\u4E14\u65E0\u8F93\u5165\u65F6\u81EA\u52A8\u5E94\u7528\u624B\u5239\u3002"
    },
    "drift_assist": {
      "type": "boolean",
      "default": true,
      "description": "\u662F\u5426\u542F\u7528\u6F02\u79FB\u8F85\u52A9\u3002\u5F53\u8F66\u8F86\u8F6C\u5411\u65F6\u81EA\u52A8\u8F85\u52A9\u7EF4\u6301\u6F02\u79FB\u72B6\u6001\u3002"
    },
    "control_inputs": {
      "type": "array",
      "items": { "type": "string" },
      "default": ["move_control"],
      "description": "\u63A7\u5236\u8F93\u5165\u4FE1\u53F7\u952E\u5217\u8868\uFF0C\u4F18\u5148\u7EA7\u4ECE\u9AD8\u5230\u4F4E\u3002"
    },
    "sounds": {
      "type": "object",
      "properties": {
        "on_destroyed": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6467\u6BC1\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        },
        "on_activate": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6FC0\u6D3B\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        },
        "handbrake_on": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u624B\u5239\u5F00\u542F\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:subsystem.car_controller.handbrake_on",
            "range": 16
          }
        },
        "handbrake_off": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u624B\u5239\u5173\u95ED\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:subsystem.car_controller.handbrake_off",
            "range": 16
          }
        }
      },
      "additionalProperties": false,
      "description": "\u624B\u5239\u64CD\u4F5C\u97F3\u6548\u914D\u7F6E\u3002"
    }
  },
  "required": ["type"],
  "additionalProperties": false,
  "examples": [
    {
      "type": "machine_max:car_controller",
      "description": "\u6700\u7B80\u793A\u4F8B - \u4EC5\u5305\u542B\u5FC5\u987B\u5B57\u6BB5"
    },
    {
      "type": "machine_max:car_controller",
      "basic_durability": 50.0,
      "steering_center": [0, 0.5, 0],
      "min_steering_radius": 4.0,
      "lateral_acceleration": 8.0,
      "max_drift_angular_velocity": 2.0,
      "manual_gear_shift": true,
      "auto_hand_brake": true,
      "drift_assist": true,
      "control_inputs": ["move_control", "regular_control"],
      "description": "\u5B8C\u6574\u793A\u4F8B - \u5305\u542B\u6240\u6709\u53EF\u9009\u5B57\u6BB5"
    },
    {
      "type": "machine_max:car_controller",
      "basic_durability": 60.0,
      "steering_center": [0, 0.3, -0.2],
      "min_steering_radius": 3.5,
      "lateral_acceleration": {
        "0": 8.0,
        "30": 6.0,
        "60": 4.0,
        "100": 3.0
      },
      "max_drift_angular_velocity": {
        "0": 1.5,
        "30": 2.0,
        "60": 2.5,
        "100": 3.0
      },
      "manual_gear_shift": false,
      "auto_hand_brake": true,
      "drift_assist": false,
      "control_inputs": ["move_control"],
      "description": "\u9AD8\u7EA7\u793A\u4F8B - \u4F7F\u7528\u6620\u5C04\u8868\u914D\u7F6E\uFF0C\u7981\u7528\u6F02\u79FB\u8F85\u52A9"
    }
  ]
}`, "subsystem/static/engine_static_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/static/engine_static_attr.json",
  "title": "\u5F15\u64CE\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027",
  "description": "\u6D3B\u585E\u5F15\u64CE\u7684\u9759\u6001\u5C5E\u6027\uFF0C\u5305\u62EC\u529F\u7387\u3001\u626D\u77E9\u3001\u8F6C\u901F\u7279\u6027\u7B49\u3002",
  "properties": {
    "$schema": {
      "type": "string",
      "description": "JSON Schema\u5F15\u7528\u8DEF\u5F84\uFF0C\u7528\u4E8E\u7F16\u8F91\u5668\u667A\u80FD\u63D0\u793A\u548C\u9A8C\u8BC1",
      "default": "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json"
    },
    "type": {
      "type": "string",
      "const": "machine_max:engine",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:engine'\u3002"
    },
    "basic_durability": {
      "type": "number",
      "minimum": 0,
      "default": 20.0,
      "description": "\u5B50\u7CFB\u7EDF\u57FA\u7840\u8010\u4E45\u5EA6\uFF0C\u964D\u81F30\u65F6\u4F1A\u762B\u75EA\uFF0C\u4FEE\u590D\u81F330%\u8010\u4E45\u5EA6\u65F6\u6062\u590D\u529F\u80FD\u3002"
    },
    "pass_damage": {
      "type": "boolean",
      "default": true,
      "description": "\u662F\u5426\u4F20\u9012\u4F24\u5BB3\u81F3\u5B50\u7CFB\u7EDF\u6301\u6709\u8005\u3002\u82E5\u4E3Atrue\uFF0C\u5B50\u7CFB\u7EDF\u53D7\u5230\u7684\u4F24\u5BB3\u4F1A\u4F20\u9012\u7ED9\u96F6\u4EF6\u3002"
    },
    "limit_damage": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9650\u5236\u4F24\u5BB3\u4F20\u9012\u503C\u81F3\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u3002\u4F8B\u598240\u4F24\u5BB3\uFF0C\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u4E3A20\uFF0C\u5219\u53EA\u4F1A\u4F20\u901220\u4F24\u5BB3\u7ED9\u6301\u6709\u8005\u3002"
    },
    "hidden": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9690\u85CF\u5B50\u7CFB\u7EDF\u5728HUD\u7B49\u5904\u7684\u663E\u793A\uFF0C\u5E38\u7528\u4E8E\u7EAF\u7CB9\u63D0\u4F9B\u6A21\u578B\u90E8\u4F4D\u635F\u574F\u5DEE\u5206\u7684\u65E0\u529F\u80FD\u5B50\u7CFB\u7EDF"
    },
    "max_power": {
      "type": "number",
      "minimum": 0,
      "description": "\u6700\u5927\u529F\u7387\uFF0C\u5355\u4F4D\u74E6\u7279(W)\u3002"
    },
    "max_torque": {
      "type": "number",
      "minimum": 0,
      "description": "\u6700\u5927\u626D\u77E9\uFF0C\u5355\u4F4D\u725B\u987F\xB7\u7C73(N\xB7m)\u3002"
    },
    "idle_rpm": {
      "type": "number",
      "minimum": 0,
      "default": 500.0,
      "description": "\u6020\u901F\u8F6C\u901F\uFF0C\u5355\u4F4D\u8F6C/\u5206\u949F(RPM)\u3002"
    },
    "idle_rpm_torque_ratio": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "default": 0.333,
      "description": "\u6020\u901F\u65F6\u626D\u77E9\u4E0E\u6700\u5927\u626D\u77E9\u7684\u6BD4\u503C\u3002"
    },
    "max_torque_rpm": {
      "type": "number",
      "minimum": 0,
      "default": 5200.0,
      "description": "\u8FBE\u5230\u6700\u5927\u626D\u77E9\u7684\u8F6C\u901F\uFF0C\u5355\u4F4D\u8F6C/\u5206\u949F(RPM)\u3002"
    },
    "red_line_rpm": {
      "type": "number",
      "minimum": 0,
      "default": 7500.0,
      "description": "\u7EA2\u7EBF\u8F6C\u901F\uFF0C\u8D85\u8FC7\u6B64\u8F6C\u901F\u53EF\u80FD\u5BFC\u81F4\u635F\u574F\uFF0C\u5355\u4F4D\u8F6C/\u5206\u949F(RPM)\u3002"
    },
    "red_line_torque_ratio": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "default": 0.9,
      "description": "\u7EA2\u7EBF\u8F6C\u901F\u65F6\u626D\u77E9\u4E0E\u6700\u5927\u626D\u77E9\u7684\u6BD4\u503C\u3002"
    },
    "inertia": {
      "type": "number",
      "minimum": 0,
      "default": 10.0,
      "description": "\u53D1\u52A8\u673A\u7CFB\u7EDF\u8F6C\u52A8\u60EF\u91CF\uFF0C\u5355\u4F4D\u5343\u514B\xB7\u5E73\u65B9\u7C73(kg\xB7m\xB2)\u3002"
    },
    "four_stroke": {
      "type": "boolean",
      "default": true,
      "description": "\u662F\u5426\u4E3A\u56DB\u51B2\u7A0B\uFF0Cfalse\u5219\u4E3A\u4E8C\u51B2\u7A0B\uFF0C\u5F71\u54CD\u53D1\u52A8\u673A\u97F3\u6548\u3002"
    },
    "cylinder": {
      "type": "integer",
      "minimum": 1,
      "default": 4,
      "description": "\u6C14\u7F38\u6570\uFF0C\u5F71\u54CD\u53D1\u52A8\u673A\u97F3\u6548\u3002"
    },
    "damping_factors": {
      "type": "array",
      "items": { "type": "number" },
      "default": [20.0, 0.1, 0.00005],
      "description": "\u53D1\u52A8\u673A\u5404\u9636\u963B\u529B\u7CFB\u6570\uFF0C\u5206\u522B\u4E3A\u5E38\u6570\u9879\uFF0C\u4E00\u6B21\u9879\uFF0C\u4E8C\u6B21\u9879\uFF0C\u2026\u9012\u589E\uFF0C\u5355\u4F4DN\xB7m/(rad/s)^n\u3002"
    },
    "control_inputs": {
      "type": "array",
      "items": { "type": "string" },
      "default": ["car_control"],
      "description": "\u6CB9\u95E8\u8F93\u5165\u4FE1\u53F7\u952E\u5217\u8868\uFF0C\u4F18\u5148\u7EA7\u4ECE\u9AD8\u5230\u4F4E\u3002"
    },
    "sounds": {
      "type": "object",
      "properties": {
        "on_destroyed": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6467\u6BC1\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        },
        "on_activate": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6FC0\u6D3B\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        },
        "on_deactivate": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u5173\u95ED\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        },
        "working_sounds": {
          "type": "object",
          "description": "\u624B\u52A8\u5DE5\u51B5\u97F3\u6548\u6620\u5C04\uFF0C\u952E\u4E3ARPM\u5B57\u7B26\u4E32\uFF08\u5982\\"800\\"\u3001\\"4500.0\\"\uFF09\uFF0C\u503C\u4E3A\u97F3\u6548\u4E8B\u4EF6\u3002\u4E3A\u7A7A\u65F6\u4F7F\u7528\u81EA\u52A8\u5408\u6210\u3002",
          "patternProperties": {
            "^-?[0-9]+(\\\\.[0-9]+)?$": {
              "$ref": "../../base/sound_event.schema.json"
            }
          },
          "default": {},
          "additionalProperties": false
        }
      },
      "additionalProperties": false,
      "description": "\u5B50\u7CFB\u7EDF\u57FA\u672C\u97F3\u6548\u914D\u7F6E\u3002"
    }
  },
  "required": ["type", "max_power", "max_torque"],
  "additionalProperties": false,
  "examples": [
    {
      "type": "machine_max:engine",
      "basic_durability": 80.0,
      "max_power": 75000.0,
      "max_torque": 130.0,
      "idle_rpm": 800.0,
      "max_torque_rpm": 4500.0,
      "red_line_rpm": 6500.0,
      "inertia": 15.0
    }
  ]
}`, "subsystem/static/gearbox_static_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/static/gearbox_static_attr.json",
  "title": "\u53D8\u901F\u7BB1\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027",
  "description": "\u53D8\u901F\u7BB1\u7684\u9759\u6001\u5C5E\u6027\uFF0C\u5305\u62EC\u51CF\u901F\u6BD4\u3001\u6362\u6321\u65F6\u95F4\u7B49\u3002",
  "properties": {
    "$schema": {
      "type": "string",
      "description": "JSON Schema\u5F15\u7528\u8DEF\u5F84\uFF0C\u7528\u4E8E\u7F16\u8F91\u5668\u667A\u80FD\u63D0\u793A\u548C\u9A8C\u8BC1",
      "default": "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json"
    },
    "type": {
      "type": "string",
      "const": "machine_max:gearbox",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:gearbox'\u3002"
    },
    "basic_durability": {
      "type": "number",
      "minimum": 0,
      "default": 20.0,
      "description": "\u5B50\u7CFB\u7EDF\u57FA\u7840\u8010\u4E45\u5EA6\uFF0C\u964D\u81F30\u65F6\u4F1A\u762B\u75EA\uFF0C\u4FEE\u590D\u81F330%\u8010\u4E45\u5EA6\u65F6\u6062\u590D\u529F\u80FD\u3002"
    },
    "pass_damage": {
      "type": "boolean",
      "default": true,
      "description": "\u662F\u5426\u4F20\u9012\u4F24\u5BB3\u81F3\u5B50\u7CFB\u7EDF\u6301\u6709\u8005\u3002\u82E5\u4E3Atrue\uFF0C\u5B50\u7CFB\u7EDF\u53D7\u5230\u7684\u4F24\u5BB3\u4F1A\u4F20\u9012\u7ED9\u96F6\u4EF6\u3002"
    },
    "limit_damage": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9650\u5236\u4F24\u5BB3\u4F20\u9012\u503C\u81F3\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u3002\u4F8B\u598240\u4F24\u5BB3\uFF0C\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u4E3A20\uFF0C\u5219\u53EA\u4F1A\u4F20\u901220\u4F24\u5BB3\u7ED9\u6301\u6709\u8005\u3002"
    },
    "hidden": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9690\u85CF\u5B50\u7CFB\u7EDF\u5728HUD\u7B49\u5904\u7684\u663E\u793A\uFF0C\u5E38\u7528\u4E8E\u7EAF\u7CB9\u63D0\u4F9B\u6A21\u578B\u90E8\u4F4D\u635F\u574F\u5DEE\u5206\u7684\u65E0\u529F\u80FD\u5B50\u7CFB\u7EDF"
    },
    "final_ratio": {
      "type": "number",
      "default": 10.0,
      "description": "\u6700\u7EC8\u51CF\u901F\u6BD4\uFF0C\u7528\u4E8E\u6574\u4F53\u7F29\u653E\u51CF\u901F\u6BD4\u3002"
    },
    "ratios": {
      "type": "array",
      "items": { "type": "number" },
      "default": [-3.5, 3.5, 2.5, 1.7, 1.4, 1.1],
      "description": "\u51CF\u901F\u6BD4\u5217\u8868\uFF0C\u5347\u5E8F\u6392\u5217\u3002\u8D1F\u6570\u4E3A\u5012\u6321\uFF0C\u6B63\u6570\u4E3A\u524D\u8FDB\u6321\u3002"
    },
    "switch_time": {
      "type": "number",
      "minimum": 0,
      "default": 0.3,
      "description": "\u6362\u6321\u65F6\u95F4\uFF0C\u5355\u4F4D\u79D2\u3002"
    },
    "control_inputs": {
      "type": "array",
      "items": { "type": "string" },
      "default": ["car_control"],
      "description": "\u6362\u6321\u63A7\u5236\u4FE1\u53F7\u952E\u5217\u8868\uFF0C\u6307\u5B9A\u9009\u7528\u7684\u51CF\u901F\u6BD4\u3002"
    },
    "sounds": {
      "type": "object",
      "properties": {
        "on_destroyed": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6467\u6BC1\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        },
        "on_activate": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6FC0\u6D3B\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        },
        "clutch_in": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u79BB\u5408\u8E29\u4E0B\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:subsystem.gearbox.clutch_in",
            "range": 16
          }
        },
        "clutch_out": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u79BB\u5408\u677E\u5F00\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:subsystem.gearbox.clutch_out",
            "range": 16
          }
        },
        "gear_up": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5347\u6321\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:subsystem.gearbox.up.light",
            "range": 16
          }
        },
        "gear_down": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u964D\u6321\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:subsystem.gearbox.down.light",
            "range": 16
          }
        }
      },
      "additionalProperties": false,
      "description": "\u53D8\u901F\u7BB1\u64CD\u4F5C\u97F3\u6548\u914D\u7F6E\u3002"
    }
  },
  "required": ["type"],
  "additionalProperties": false,
  "examples": [
    {
      "type": "machine_max:gearbox",
      "basic_durability": 60.0,
      "final_ratio": 12.0,
      "ratios": [-4.0, 3.8, 2.8, 2.0, 1.5, 1.2, 0.9],
      "switch_time": 0.4
    },
    {
      "type": "machine_max:gearbox",
      "basic_durability": 40.0,
      "final_ratio": 8.0,
      "ratios": [-3.0, 2.5, 1.8, 1.2, 0.8],
      "switch_time": 0.2,
      "sounds": {
        "clutch_in": {
          "sound_id": "minecraft:block.iron_trapdoor.close",
          "range": 8
        },
        "clutch_out": {
          "sound_id": "minecraft:block.iron_trapdoor.open",
          "range": 8
        },
        "gear_up": {
          "sound_id": "minecraft:entity.arrow.hit_player",
          "range": 12
        },
        "gear_down": {
          "sound_id": "minecraft:entity.arrow.hit",
          "range": 12
        }
      }
    }
  ]
}`, "subsystem/static/item_storage_static_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/static/item_storage_static_attr.json",
  "title": "\u7269\u54C1\u5B58\u50A8\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027",
  "description": "\u7269\u54C1\u5B58\u50A8\u5BB9\u5668\u7684\u9759\u6001\u5C5E\u6027\uFF0C\u5305\u62EC\u884C\u6570\u548C\u5217\u6570\u3002",
  "properties": {
    "$schema": {
      "type": "string",
      "description": "JSON Schema\u5F15\u7528\u8DEF\u5F84\uFF0C\u7528\u4E8E\u7F16\u8F91\u5668\u667A\u80FD\u63D0\u793A\u548C\u9A8C\u8BC1",
      "default": "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json"
    },
    "type": {
      "type": "string",
      "const": "machine_max:item_storage",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:item_storage'\u3002"
    },
    "basic_durability": {
      "type": "number",
      "minimum": 0,
      "default": 20.0,
      "description": "\u5B50\u7CFB\u7EDF\u57FA\u7840\u8010\u4E45\u5EA6\uFF0C\u964D\u81F30\u65F6\u4F1A\u762B\u75EA\uFF0C\u4FEE\u590D\u81F330%\u8010\u4E45\u5EA6\u65F6\u6062\u590D\u529F\u80FD\u3002"
    },
    "pass_damage": {
      "type": "boolean",
      "default": true,
      "description": "\u662F\u5426\u4F20\u9012\u4F24\u5BB3\u81F3\u5B50\u7CFB\u7EDF\u6301\u6709\u8005\u3002\u82E5\u4E3Atrue\uFF0C\u5B50\u7CFB\u7EDF\u53D7\u5230\u7684\u4F24\u5BB3\u4F1A\u4F20\u9012\u7ED9\u96F6\u4EF6\u3002"
    },
    "limit_damage": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9650\u5236\u4F24\u5BB3\u4F20\u9012\u503C\u81F3\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u3002\u4F8B\u598240\u4F24\u5BB3\uFF0C\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u4E3A20\uFF0C\u5219\u53EA\u4F1A\u4F20\u901220\u4F24\u5BB3\u7ED9\u6301\u6709\u8005\u3002"
    },
    "hidden": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9690\u85CF\u5B50\u7CFB\u7EDF\u5728HUD\u7B49\u5904\u7684\u663E\u793A\uFF0C\u5E38\u7528\u4E8E\u7EAF\u7CB9\u63D0\u4F9B\u6A21\u578B\u90E8\u4F4D\u635F\u574F\u5DEE\u5206\u7684\u65E0\u529F\u80FD\u5B50\u7CFB\u7EDF"
    },
    "rows": {
      "type": "integer",
      "minimum": 1,
      "default": 3,
      "description": "\u5BB9\u5668\u7684\u7269\u54C1\u69FD\u884C\u6570\u3002"
    },
    "columns": {
      "type": "integer",
      "minimum": 1,
      "default": 9,
      "description": "\u5BB9\u5668\u7684\u7269\u54C1\u69FD\u5217\u6570\u3002"
    },
    "sounds": {
      "type": "object",
      "properties": {
        "on_destroyed": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6467\u6BC1\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        },
        "on_activate": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6FC0\u6D3B\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        }
      },
      "additionalProperties": false,
      "description": "\u5B50\u7CFB\u7EDF\u57FA\u672C\u97F3\u6548\u914D\u7F6E\u3002"
    }
  },
  "required": ["type"],
  "additionalProperties": false,
  "examples": [
    {
      "type": "machine_max:item_storage",
      "basic_durability": 100.0,
      "rows": 6,
      "columns": 9
    }
  ]
}`, "subsystem/static/lighting_static_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/static/lighting_static_attr.json",
  "title": "\u7167\u660E\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027",
  "description": "\u7167\u660E\u5B50\u7CFB\u7EDF\u578B\u53F7\u5C5E\u6027\uFF0C\u7528\u4E8E\u5B9A\u4E49\u5BA2\u6237\u7AEF\u4F53\u79EF\u5149\u6548\u679C\u3002",
  "properties": {
    "$schema": {
      "type": "string",
      "description": "JSON Schema\u5F15\u7528\u8DEF\u5F84\uFF0C\u7528\u4E8E\u7F16\u8F91\u5668\u667A\u80FD\u63D0\u793A\u548C\u9A8C\u8BC1",
      "default": "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json"
    },
    "type": {
      "type": "string",
      "const": "machine_max:lighting",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:lighting'\u3002"
    },
    "basic_durability": {
      "type": "number",
      "minimum": 0,
      "default": 20.0,
      "description": "\u5B50\u7CFB\u7EDF\u57FA\u7840\u8010\u4E45\u5EA6\uFF0C\u964D\u81F30\u65F6\u4F1A\u762B\u75EA\uFF0C\u4FEE\u590D\u81F330%\u8010\u4E45\u5EA6\u65F6\u6062\u590D\u529F\u80FD\u3002"
    },
    "pass_damage": {
      "type": "boolean",
      "default": true,
      "description": "\u662F\u5426\u4F20\u9012\u4F24\u5BB3\u81F3\u5B50\u7CFB\u7EDF\u6301\u6709\u8005\u3002"
    },
    "limit_damage": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9650\u5236\u4F24\u5BB3\u4F20\u9012\u503C\u81F3\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u3002"
    },
    "hidden": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9690\u85CF\u5B50\u7CFB\u7EDF\u5728HUD\u7B49\u5904\u7684\u663E\u793A\u3002"
    },
    "light_type": {
      "type": "string",
      "enum": ["beam", "point"],
      "default": "beam",
      "description": "\u5149\u6E90\u7C7B\u578B\uFF1Abeam\u4E3A\u5B9A\u5411\u5149\u675F\uFF0Cpoint\u4E3A\u70B9\u5149\u6E90\u3002"
    },
    "range": {
      "type": "number",
      "minimum": 0,
      "default": 16,
      "description": "\u4F53\u79EF\u5149\u6E32\u67D3\u8303\u56F4\u3002"
    },
    "color": {
      "type": "array",
      "items": { "type": "integer", "minimum": 0, "maximum": 255 },
      "minItems": 3,
      "maxItems": 3,
      "default": [255, 255, 255],
      "description": "RGB\u989C\u8272\uFF0C\u53D6\u503C\u8303\u56F40-255\u3002"
    },
    "intensity": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "default": 1,
      "description": "\u4F53\u79EF\u5149\u5F3A\u5EA6\u3002"
    },
    "beam_angle": {
      "type": "number",
      "minimum": 0,
      "maximum": 179,
      "default": 24,
      "description": "\u5B9A\u5411\u5149\u675F\u5B8C\u6574\u9525\u89D2\uFF0C\u5355\u4F4D\u4E3A\u5EA6\u3002"
    }
  },
  "required": ["type"],
  "additionalProperties": false,
  "examples": [
    {
      "type": "machine_max:lighting",
      "basic_durability": 20,
      "hidden": true,
      "light_type": "beam",
      "range": 16,
      "color": [255, 245, 210],
      "intensity": 0.75,
      "beam_angle": 24
    }
  ]
}`, "subsystem/static/motorbike_controller_static_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/static/motorbike_controller_static_attr.json",
  "title": "\u6469\u6258\u8F66\u63A7\u5236\u5668\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027",
  "description": "\u6469\u6258\u8F66\u63A7\u5236\u7CFB\u7EDF\u7684\u9759\u6001\u5C5E\u6027\uFF0C\u8D1F\u8D23\u5904\u7406\u9A7E\u9A76\u8F93\u5165\u3001\u8F6C\u5411\u63A7\u5236\u7B49\uFF0C\u5305\u542B\u6469\u6258\u8F66\u7279\u6709\u7684\u503E\u659C\u89D2\u5EA6\u9650\u5236\u3002",
  "properties": {
    "$schema": {
      "type": "string",
      "description": "JSON Schema\u5F15\u7528\u8DEF\u5F84\uFF0C\u7528\u4E8E\u7F16\u8F91\u5668\u667A\u80FD\u63D0\u793A\u548C\u9A8C\u8BC1",
      "default": "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json"
    },
    "type": {
      "type": "string",
      "const": "machine_max:motorbike_controller",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:motorbike_controller'\u3002"
    },
    "basic_durability": {
      "type": "number",
      "minimum": 0,
      "default": 20.0,
      "description": "\u5B50\u7CFB\u7EDF\u57FA\u7840\u8010\u4E45\u5EA6\uFF0C\u964D\u81F30\u65F6\u4F1A\u762B\u75EA\uFF0C\u4FEE\u590D\u81F330%\u8010\u4E45\u5EA6\u65F6\u6062\u590D\u529F\u80FD\u3002"
    },
    "pass_damage": {
      "type": "boolean",
      "default": true,
      "description": "\u662F\u5426\u4F20\u9012\u4F24\u5BB3\u81F3\u5B50\u7CFB\u7EDF\u6301\u6709\u8005\u3002\u82E5\u4E3Atrue\uFF0C\u5B50\u7CFB\u7EDF\u53D7\u5230\u7684\u4F24\u5BB3\u4F1A\u4F20\u9012\u7ED9\u96F6\u4EF6\u3002"
    },
    "limit_damage": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9650\u5236\u4F24\u5BB3\u4F20\u9012\u503C\u81F3\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u3002\u4F8B\u598240\u4F24\u5BB3\uFF0C\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u4E3A20\uFF0C\u5219\u53EA\u4F1A\u4F20\u901220\u4F24\u5BB3\u7ED9\u6301\u6709\u8005\u3002"
    },
    "hidden": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9690\u85CF\u5B50\u7CFB\u7EDF\u5728HUD\u7B49\u5904\u7684\u663E\u793A\uFF0C\u5E38\u7528\u4E8E\u7EAF\u7CB9\u63D0\u4F9B\u6A21\u578B\u90E8\u4F4D\u635F\u574F\u5DEE\u5206\u7684\u65E0\u529F\u80FD\u5B50\u7CFB\u7EDF"
    },
    "steering_center": {
      "$ref": "../../base/vector_3d.schema.json",
      "default": [0, 0, 0],
      "description": "\u8F6C\u5411\u4E2D\u5FC3\u4F4D\u7F6E\uFF0C\u76F8\u5BF9\u4E8E\u90E8\u4EF6\u5C40\u90E8\u5750\u6807\u7CFB\u3002\u6469\u6258\u8F66\u63A7\u5236\u8F85\u52A9\u529B\u7684\u8BA1\u7B97\u4F9D\u8D56\u4E8E\u8F6C\u5411\u4E2D\u5FC3\u5B57\u6BB5\u7684y\u503C\u3002\u5B83\u5E94\u5F53\u586B\u5199\u9884\u8BA1\u7684\u7EC4\u88C5\u597D\u540E\u7684\u8F66\u8F86\u63A5\u5730\u5904\u76F8\u5BF9\u8F66\u63A7\u5B50\u7CFB\u7EDF\u9644\u7740\u521A\u4F53\u8D28\u5FC3\u7684\u8DDD\u79BB\u3002\u4F8B\u5982\uFF0C\u4E00\u4E2A\u8D28\u5FC3\u5728\u539F\u70B9\u5904\u7684\u6469\u6258\u8F66\u67B6\uFF0C\u8FD9\u91CC\u7684y\u5E94\u5F53\u586B\u5199\u8D1F\u503C\u3002"
    },
    "min_steering_radius": {
      "type": "number",
      "minimum": 0,
      "default": 3.0,
      "description": "\u6700\u5C0F\u8F6C\u5411\u534A\u5F84\uFF0C\u5355\u4F4D\u7C73\u3002\u7528\u4E8E\u4F4E\u901F\u548C\u624B\u5239\u65F6\u7684\u8F6C\u5411\u9650\u5236\u3002"
    },
    "lateral_acceleration": {
      "oneOf": [
        {
          "type": "number",
          "minimum": 0,
          "default": 8.0,
          "description": "\u4FA7\u5411\u52A0\u901F\u5EA6\u9650\u5236\uFF0C\u5355\u4F4Dm/s\xB2\u3002\u7528\u4E8E\u6839\u636E\u901F\u5EA6\u5B9E\u65F6\u8BA1\u7B97\u8F6C\u5411\u534A\u5F84\uFF08\u534A\u5F84 = \u901F\u5EA6\xB2 / \u52A0\u901F\u5EA6\uFF09\u3002"
        },
        {
          "type": "object",
          "additionalProperties": {
            "type": "number",
            "minimum": 0
          },
          "description": "\u901F\u5EA6-\u4FA7\u5411\u52A0\u901F\u5EA6\u6620\u5C04\u8868\uFF0C\u952E\u4E3A\u901F\u5EA6(km/h)\uFF0C\u503C\u4E3A\u5BF9\u5E94\u7684\u4FA7\u5411\u52A0\u901F\u5EA6\u9650\u5236(m/s\xB2)\u3002\u652F\u6301\u7EBF\u6027\u63D2\u503C\u3002",
          "examples": [
            {
              "0": 8.0,
              "30": 6.0,
              "60": 4.0,
              "100": 3.0
            }
          ]
        }
      ],
      "default": 8.0,
      "description": "\u4FA7\u5411\u52A0\u901F\u5EA6\u9650\u5236\uFF0C\u5355\u4F4Dm/s\xB2\u3002\u7528\u4E8E\u6839\u636E\u901F\u5EA6\u5B9E\u65F6\u8BA1\u7B97\u8F6C\u5411\u534A\u5F84\uFF08\u534A\u5F84 = \u901F\u5EA6\xB2 / \u52A0\u901F\u5EA6\uFF09\u3002"
    },
    "max_drift_angular_velocity": {
      "oneOf": [
        {
          "type": "number",
          "minimum": 0,
          "default": 1.0,
          "description": "\u6700\u5927\u6F02\u79FB\u89D2\u901F\u5EA6\uFF0C\u5355\u4F4Drad/s\u3002\u4F5C\u4E3A\u6F02\u79FB\u65F6PD\u63A7\u5236\u5668\u7684\u76EE\u6807\u503C\u3002"
        },
        {
          "type": "object",
          "additionalProperties": {
            "type": "number",
            "minimum": 0
          },
          "description": "\u901F\u5EA6-\u6700\u5927\u6F02\u79FB\u89D2\u901F\u5EA6\u6620\u5C04\u8868\uFF0C\u952E\u4E3A\u901F\u5EA6\uFF08km/h\uFF09\uFF0C\u503C\u4E3A\u5BF9\u5E94\u7684\u6700\u5927\u6F02\u79FB\u89D2\u901F\u5EA6\uFF08rad/s\uFF09\u3002\u7EBF\u6027\u63D2\u503C\u3002",
          "examples": [
            {
              "0": 0.8,
              "30": 1.0,
              "60": 1.2,
              "100": 1.5
            }
          ]
        }
      ],
      "default": 1.0,
      "description": "\u6700\u5927\u6F02\u79FB\u89D2\u901F\u5EA6\uFF0C\u5355\u4F4Drad/s\u3002\u4F5C\u4E3A\u6F02\u79FB\u65F6PD\u63A7\u5236\u5668\u7684\u76EE\u6807\u503C\u3002"
    },
    "manual_gear_shift": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u542F\u7528\u624B\u52A8\u6362\u6321\u3002\u82E5\u4E3Afalse\uFF0C\u5219\u81EA\u52A8\u6362\u6321\u3002"
    },
    "auto_hand_brake": {
      "type": "boolean",
      "default": true,
      "description": "\u662F\u5426\u81EA\u52A8\u542F\u7528\u624B\u5239\u3002\u5F53\u8F66\u8F86\u9759\u6B62\u4E14\u65E0\u8F93\u5165\u65F6\u81EA\u52A8\u5E94\u7528\u624B\u5239\u3002"
    },
    "control_inputs": {
      "type": "array",
      "items": { "type": "string" },
      "default": ["move_control"],
      "description": "\u63A7\u5236\u8F93\u5165\u4FE1\u53F7\u952E\u5217\u8868\uFF0C\u4F18\u5148\u7EA7\u4ECE\u9AD8\u5230\u4F4E\u3002"
    },
    "max_angle": {
      "type": "number",
      "minimum": 0,
      "maximum": 90,
      "default": 30.0,
      "description": "\u503E\u659C\u89D2\u8D85\u8FC7\u6B64\u89D2\u5EA6\u89C6\u4F5C\u5931\u53BB\u5E73\u8861\uFF0C\u4E0D\u518D\u4FEE\u6B63\u59FF\u6001\uFF0C\u5355\u4F4D\u4E3A\u5EA6\u3002"
    },
    "parking_angle": {
      "type": "number",
      "minimum": -90,
      "maximum": 90,
      "default": 5.0,
      "description": "\u6469\u6258\u8F66\u9759\u6B62\u505C\u9760\u65F6\u7684\u503E\u659C\u89D2\u5EA6\uFF0C\u53EF\u6B63\u53EF\u8D1F\uFF0C\u5355\u4F4D\u4E3A\u5EA6\u3002\u6B63\u503C\u8868\u793A\u5411\u5DE6\u503E\u659C\uFF0C\u8D1F\u503C\u8868\u793A\u5411\u53F3\u503E\u659C\u3002"
    },
    "correction_force_multiplier": {
      "type": "number",
      "minimum": 0.1,
      "maximum": 10.0,
      "default": 1.0,
      "description": "\u4FEE\u6B63\u529B\u500D\u7387\uFF0C\u7528\u4E8E\u6574\u4F53\u7F29\u653E\u6469\u6258\u8F66\u63A7\u5236\u7CFB\u7EDF\u7684\u5E73\u8861\u8C03\u8282\u529B\u3002"
    },
    "sounds": {
      "type": "object",
      "properties": {
        "on_destroyed": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6467\u6BC1\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        },
        "on_activate": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6FC0\u6D3B\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        }
      },
      "additionalProperties": false,
      "description": "\u5B50\u7CFB\u7EDF\u57FA\u672C\u97F3\u6548\u914D\u7F6E\u3002"
    }
  },
  "required": ["type"],
  "additionalProperties": false,
  "examples": [
    {
      "type": "machine_max:motorbike_controller",
      "basic_durability": 40.0,
      "min_steering_radius": 3.0,
      "lateral_acceleration": 8.0,
      "max_drift_angular_velocity": 2.0,
      "manual_gear_shift": false,
      "control_inputs": ["move_control"],
      "max_angle": 45.0,
      "parking_angle": 5.0,
      "correction_force_multiplier": 1.2
    },
    {
      "type": "machine_max:motorbike_controller",
      "basic_durability": 35.0,
      "min_steering_radius": 3.5,
      "lateral_acceleration": {
        "0": 8.0,
        "30": 6.0,
        "60": 4.0,
        "100": 3.0
      },
      "max_drift_angular_velocity": {
        "0": 1.5,
        "30": 2.0,
        "60": 2.5,
        "100": 3.0
      },
      "manual_gear_shift": true,
      "abs_enabled": true,
      "abs_target_slip_ratio": 0.15,
      "abs_wheel_radius": 0.3,
      "max_angle": 35.0,
      "parking_angle": -3.0,
      "correction_force_multiplier": 0.8
    }
  ]
}`, "subsystem/static/motor_static_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/static/motor_static_attr.json",
  "title": "\u7535\u673A\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027",
  "description": "\u7535\u673A\u7684\u9759\u6001\u5C5E\u6027\uFF0C\u5305\u62EC\u529F\u7387\u3001\u626D\u77E9\u3001\u8F6C\u901F\u7279\u6027\u7B49\u3002",
  "properties": {
    "$schema": {
      "type": "string",
      "description": "JSON Schema\u5F15\u7528\u8DEF\u5F84\uFF0C\u7528\u4E8E\u7F16\u8F91\u5668\u667A\u80FD\u63D0\u793A\u548C\u9A8C\u8BC1",
      "default": "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json"
    },
    "type": {
      "type": "string",
      "const": "machine_max:motor",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:motor'\u3002"
    },
    "basic_durability": {
      "type": "number",
      "minimum": 0,
      "default": 20.0,
      "description": "\u5B50\u7CFB\u7EDF\u57FA\u7840\u8010\u4E45\u5EA6\uFF0C\u964D\u81F30\u65F6\u4F1A\u762B\u75EA\uFF0C\u4FEE\u590D\u81F330%\u8010\u4E45\u5EA6\u65F6\u6062\u590D\u529F\u80FD\u3002"
    },
    "pass_damage": {
      "type": "boolean",
      "default": true,
      "description": "\u662F\u5426\u4F20\u9012\u4F24\u5BB3\u81F3\u5B50\u7CFB\u7EDF\u6301\u6709\u8005\u3002\u82E5\u4E3Atrue\uFF0C\u5B50\u7CFB\u7EDF\u53D7\u5230\u7684\u4F24\u5BB3\u4F1A\u4F20\u9012\u7ED9\u96F6\u4EF6\u3002"
    },
    "limit_damage": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9650\u5236\u4F24\u5BB3\u4F20\u9012\u503C\u81F3\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u3002\u4F8B\u598240\u4F24\u5BB3\uFF0C\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u4E3A20\uFF0C\u5219\u53EA\u4F1A\u4F20\u901220\u4F24\u5BB3\u7ED9\u6301\u6709\u8005\u3002"
    },
    "hidden": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9690\u85CF\u5B50\u7CFB\u7EDF\u5728HUD\u7B49\u5904\u7684\u663E\u793A\uFF0C\u5E38\u7528\u4E8E\u7EAF\u7CB9\u63D0\u4F9B\u6A21\u578B\u90E8\u4F4D\u635F\u574F\u5DEE\u5206\u7684\u65E0\u529F\u80FD\u5B50\u7CFB\u7EDF"
    },
    "particle_locator": {
      "type": "string",
      "default": "",
      "description": "\u7C92\u5B50\u6548\u679C\u5B9A\u4F4D\u5668\u540D\u79F0\uFF0C\u7528\u4E8E\u663E\u793A\u7535\u673A\u5DE5\u4F5C\u65F6\u7684\u7C92\u5B50\u6548\u679C\u3002"
    },
    "max_power": {
      "type": "number",
      "minimum": 0,
      "description": "\u6700\u5927\u529F\u7387\uFF0C\u5355\u4F4D\u74E6\u7279(W)\u3002"
    },
    "max_torque": {
      "type": "number",
      "minimum": 0,
      "default": 100.0,
      "description": "\u6700\u5927\u626D\u77E9\uFF0C\u5355\u4F4D\u725B\u987F\xB7\u7C73(N\xB7m)\u3002"
    },
    "red_line_rpm": {
      "type": "number",
      "minimum": 0,
      "default": 10000.0,
      "description": "\u7EA2\u7EBF\u8F6C\u901F\uFF0C\u5355\u4F4D\u8F6C/\u5206\u949F(RPM)\u3002"
    },
    "red_line_power_ratio": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "default": 0.8,
      "description": "\u7EA2\u7EBF\u8F6C\u901F\u5904\u7684\u529F\u7387\u5360\u5CF0\u503C\u529F\u7387\u7684\u6BD4\u4F8B\uFF080~1\uFF09\u3002\u63A7\u5236\u7535\u673A\u9AD8\u8F6C\u901F\u533A\u7684\u529F\u7387\u8870\u51CF\u7A0B\u5EA6\uFF0C\u503C\u8D8A\u5C0F\u6863\u4F4D\u9009\u62E9\u6548\u76CA\u8D8A\u660E\u663E\uFF0C\u771F\u5B9E\u6C38\u78C1\u540C\u6B65\u7535\u673A\u901A\u5E38\u7EA6 0.7~0.85\u3002"
    },
    "inertia": {
      "type": "number",
      "minimum": 0,
      "default": 10.0,
      "description": "\u7535\u673A\u7CFB\u7EDF\u8F6C\u52A8\u60EF\u91CF\uFF0C\u5355\u4F4D\u5343\u514B\xB7\u5E73\u65B9\u7C73(kg\xB7m\xB2)\u3002"
    },
    "damping_factors": {
      "type": "array",
      "items": { "type": "number" },
      "default": [10.0, 0.1, 0.00005],
      "description": "\u7535\u673A\u7CFB\u7EDF\u5404\u9636\u963B\u529B\u7CFB\u6570\uFF0C\u5206\u522B\u4E3A\u5E38\u6570\u9879\uFF0C\u4E00\u6B21\u9879\uFF0C\u4E8C\u6B21\u9879\uFF0C\u2026\u9012\u589E\uFF0C\u5355\u4F4DN\xB7m/(rad/s)^n\u3002"
    },
    "generator_efficiency": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "default": 0.85,
      "description": "\u53D1\u7535\u6548\u7387\uFF080-1\uFF09\uFF0C\u5F53\u7535\u673A\u4F5C\u4E3A\u53D1\u7535\u673A\u65F6\u7684\u6548\u7387\u3002"
    },
    "control_inputs": {
      "type": "array",
      "items": { "type": "string" },
      "default": ["car_control"],
      "description": "\u6CB9\u95E8\u8F93\u5165\u4FE1\u53F7\u952E\u5217\u8868\uFF0C\u4F18\u5148\u7EA7\u4ECE\u9AD8\u5230\u4F4E\u3002"
    },
    "sounds": {
      "type": "object",
      "properties": {
        "on_destroyed": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6467\u6BC1\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        },
        "on_activate": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6FC0\u6D3B\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        },
        "on_deactivate": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u5173\u95ED\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        },
        "working_sounds": {
          "type": "object",
          "description": "\u624B\u52A8\u5DE5\u51B5\u97F3\u6548\u6620\u5C04\uFF0C\u952E\u4E3ARPM\u5B57\u7B26\u4E32\uFF08\u5982\\"800\\"\u3001\\"4500.0\\"\uFF09\uFF0C\u503C\u4E3A\u97F3\u6548\u4E8B\u4EF6\u3002\u4E3A\u7A7A\u65F6\u4F7F\u7528\u81EA\u52A8\u5408\u6210\u3002",
          "patternProperties": {
            "^-?[0-9]+(\\\\.[0-9]+)?$": {
              "$ref": "../../base/sound_event.schema.json"
            }
          },
          "default": {},
          "additionalProperties": false
        }
      },
      "additionalProperties": false,
      "description": "\u5B50\u7CFB\u7EDF\u57FA\u672C\u97F3\u6548\u914D\u7F6E\u3002"
    }
  },
  "required": ["type", "max_power"],
  "additionalProperties": false,
  "examples": [
    {
      "type": "machine_max:motor",
      "basic_durability": 50.0,
      "max_power": 50000.0,
      "max_torque": 80.0,
      "red_line_rpm": 12000.0,
      "generator_efficiency": 0.9
    }
  ]
}`, "subsystem/static/seat_static_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/static/seat_static_attr.json",
  "title": "\u5EA7\u6905\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027",
  "description": "\u5EA7\u6905\u7684\u9759\u6001\u5C5E\u6027\uFF0C\u5305\u62EC\u4E58\u5BA2\u663E\u793A\u3001\u4F24\u5BB3\u963B\u6321\u3001\u89C6\u89D2\u8BBE\u7F6E\u7B49\u3002",
  "properties": {
    "$schema": {
      "type": "string",
      "description": "JSON Schema\u5F15\u7528\u8DEF\u5F84\uFF0C\u7528\u4E8E\u7F16\u8F91\u5668\u667A\u80FD\u63D0\u793A\u548C\u9A8C\u8BC1",
      "default": "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json"
    },
    "type": {
      "type": "string",
      "const": "machine_max:seat",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:seat'\u3002"
    },
    "basic_durability": {
      "type": "number",
      "minimum": 0,
      "default": 20.0,
      "description": "\u5B50\u7CFB\u7EDF\u57FA\u7840\u8010\u4E45\u5EA6\uFF0C\u964D\u81F30\u65F6\u4F1A\u762B\u75EA\uFF0C\u4FEE\u590D\u81F330%\u8010\u4E45\u5EA6\u65F6\u6062\u590D\u529F\u80FD\u3002"
    },
    "pass_damage": {
      "type": "boolean",
      "default": true,
      "description": "\u662F\u5426\u4F20\u9012\u4F24\u5BB3\u81F3\u5B50\u7CFB\u7EDF\u6301\u6709\u8005\u3002\u82E5\u4E3Atrue\uFF0C\u5B50\u7CFB\u7EDF\u53D7\u5230\u7684\u4F24\u5BB3\u4F1A\u4F20\u9012\u7ED9\u96F6\u4EF6\u3002"
    },
    "limit_damage": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9650\u5236\u4F24\u5BB3\u4F20\u9012\u503C\u81F3\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u3002\u4F8B\u598240\u4F24\u5BB3\uFF0C\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u4E3A20\uFF0C\u5219\u53EA\u4F1A\u4F20\u901220\u4F24\u5BB3\u7ED9\u6301\u6709\u8005\u3002"
    },
    "hidden": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9690\u85CF\u5B50\u7CFB\u7EDF\u5728HUD\u7B49\u5904\u7684\u663E\u793A\uFF0C\u5E38\u7528\u4E8E\u7EAF\u7CB9\u63D0\u4F9B\u6A21\u578B\u90E8\u4F4D\u635F\u574F\u5DEE\u5206\u7684\u65E0\u529F\u80FD\u5B50\u7CFB\u7EDF"
    },
    "block_damage": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u5C06\u4E58\u5BA2\u53D7\u5230\u7684\u4F24\u5BB3\u8F6C\u5AC1\u7ED9\u90E8\u4EF6\u3002\u82E5\u4E3Atrue\uFF0C\u5219\u4E58\u5BA2\u53D7\u5230\u7684\u4F24\u5BB3\u4F1A\u4F20\u9012\u7ED9\u90E8\u4EF6\u3002"
    },
    "render_passenger": {
      "type": "boolean",
      "default": true,
      "description": "\u662F\u5426\u6E32\u67D3\u4E58\u5BA2\u6A21\u578B\u3002"
    },
    "passenger_scale": {
      "$ref": "../../base/vector_3d.schema.json",
      "default": [1, 1, 1],
      "description": "\u4E58\u5BA2\u6A21\u578B\u7684\u7F29\u653E\u6BD4\u4F8B\u3002"
    },
    "views": {
      "$ref": "view_attr.schema.json",
      "default": {
        "enable_first_person": true,
        "first_person_hud": [],
        "first_person_offset": 0.0,
        "enable_third_person": true,
        "third_person_hud": [],
        "third_person_offset": 0.75,
        "follow_vehicle": true,
        "focus_on_center": true,
        "distance_scale": 1.1
      },
      "description": "\u89C6\u89D2\u5C5E\u6027\u8BBE\u7F6E\u3002"
    },
    "view_inputs": {
      "type": "array",
      "items": { "type": "string" },
      "default": [],
      "description": "\u89C6\u89D2\u5207\u6362\u8F93\u5165\u4FE1\u53F7\u952E\u5217\u8868\u3002"
    },
    "allow_use_items": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u5141\u8BB8\u4E58\u5BA2\u4F7F\u7528\u7269\u54C1\uFF08\u5982\u6B66\u5668\u3001\u5DE5\u5177\uFF09\u3002"
    },
    "sounds": {
      "type": "object",
      "properties": {
        "on_destroyed": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6467\u6BC1\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        },
        "on_activate": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6FC0\u6D3B\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        }
      },
      "additionalProperties": false,
      "description": "\u5B50\u7CFB\u7EDF\u57FA\u672C\u97F3\u6548\u914D\u7F6E\u3002"
    }
  },
  "required": ["type"],
  "additionalProperties": false,
  "examples": [
    {
      "type": "machine_max:seat"
    },
    {
      "type": "machine_max:seat",
      "basic_durability": 30.0,
      "block_damage": true,
      "render_passenger": true,
      "views": {
        "enable_first_person": true,
        "first_person_hud": ["machine_max:hud/driver"],
        "first_person_offset": [0.0, 0.2, 0.0],
        "enable_third_person": true,
        "third_person_hud": ["machine_max:hud/vehicle"],
        "third_person_offset": [0.0, 0.8, 0.0],
        "follow_vehicle": true,
        "focus_on_center": false,
        "distance_scale": 1.2,
        "min_pitch": -30,
        "max_pitch": 60,
        "yaw_limit": 120
      },
      "view_inputs": ["view_switch"],
      "allow_use_items": true
    }
  ]
}`, "subsystem/static/transmission_static_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/static/transmission_static_attr.json",
  "title": "\u4F20\u52A8\u7CFB\u7EDF\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027",
  "description": "\u4F20\u52A8\u7CFB\u7EDF\u7684\u9759\u6001\u5C5E\u6027\uFF0C\u8D1F\u8D23\u5C06\u8F93\u5165\u52A8\u529B\u5206\u914D\u81F3\u5404\u4E2A\u8F93\u51FA\u7AEF\u3002",
  "properties": {
    "$schema": {
      "type": "string",
      "description": "JSON Schema\u5F15\u7528\u8DEF\u5F84\uFF0C\u7528\u4E8E\u7F16\u8F91\u5668\u667A\u80FD\u63D0\u793A\u548C\u9A8C\u8BC1",
      "default": "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json"
    },
    "type": {
      "type": "string",
      "const": "machine_max:transmission",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:transmission'\u3002"
    },
    "basic_durability": {
      "type": "number",
      "minimum": 0,
      "default": 20.0,
      "description": "\u5B50\u7CFB\u7EDF\u57FA\u7840\u8010\u4E45\u5EA6\uFF0C\u964D\u81F30\u65F6\u4F1A\u762B\u75EA\uFF0C\u4FEE\u590D\u81F330%\u8010\u4E45\u5EA6\u65F6\u6062\u590D\u529F\u80FD\u3002"
    },
    "pass_damage": {
      "type": "boolean",
      "default": true,
      "description": "\u662F\u5426\u4F20\u9012\u4F24\u5BB3\u81F3\u5B50\u7CFB\u7EDF\u6301\u6709\u8005\u3002\u82E5\u4E3Atrue\uFF0C\u5B50\u7CFB\u7EDF\u53D7\u5230\u7684\u4F24\u5BB3\u4F1A\u4F20\u9012\u7ED9\u96F6\u4EF6\u3002"
    },
    "limit_damage": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9650\u5236\u4F24\u5BB3\u4F20\u9012\u503C\u81F3\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u3002\u4F8B\u598240\u4F24\u5BB3\uFF0C\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u4E3A20\uFF0C\u5219\u53EA\u4F1A\u4F20\u901220\u4F24\u5BB3\u7ED9\u6301\u6709\u8005\u3002"
    },
    "hidden": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u9690\u85CF\u5B50\u7CFB\u7EDF\u5728HUD\u7B49\u5904\u7684\u663E\u793A\uFF0C\u5E38\u7528\u4E8E\u7EAF\u7CB9\u63D0\u4F9B\u6A21\u578B\u90E8\u4F4D\u635F\u574F\u5DEE\u5206\u7684\u65E0\u529F\u80FD\u5B50\u7CFB\u7EDF"
    },
    "diff_lock": {
      "type": "string",
      "enum": ["true", "false", "auto", "manual"],
      "default": "auto",
      "description": "\u5DEE\u901F\u9501\u6A21\u5F0F\u3002true\uFF1A\u59CB\u7EC8\u9501\u5B9A\uFF1Bfalse\uFF1A\u4ECE\u4E0D\u9501\u5B9A\uFF1Bauto\uFF1A\u81EA\u52A8\u9501\u5B9A\uFF1Bmanual\uFF1A\u624B\u52A8\u63A7\u5236\u9501\u5B9A\u3002"
    },
    "diff_lock_sensitivity": {
      "type": "number",
      "minimum": 0,
      "default": 1.0,
      "description": "\u5DEE\u901F\u9501\u7075\u654F\u5EA6\u3002"
    },
    "auto_diff_lock_threshold": {
      "type": "number",
      "minimum": 0,
      "default": 10.0,
      "description": "\u81EA\u52A8\u5DEE\u901F\u9501\u9608\u503C\uFF0C\u5F53\u8F93\u51FA\u7AEF\u8F6C\u901F\u5DEE\u767E\u5206\u6BD4\u8D85\u8FC7\u8BE5\u503C\u4E14diff_lock\u4E3Aauto\u65F6\uFF0C\u81EA\u52A8\u542F\u7528\u5DEE\u901F\u9501\u3002"
    },
    "diff_lock_inputs": {
      "type": "array",
      "items": { "type": "string" },
      "default": ["diff_lock_control"],
      "description": "\u624B\u52A8\u5DEE\u901F\u9501\u63A7\u5236\u4FE1\u53F7\u952E\u5217\u8868\uFF0C\u4F18\u5148\u7EA7\u9012\u51CF\u3002"
    },
    "sounds": {
      "type": "object",
      "properties": {
        "on_destroyed": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6467\u6BC1\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        },
        "on_activate": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6FC0\u6D3B\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        }
      },
      "additionalProperties": false,
      "description": "\u5B50\u7CFB\u7EDF\u57FA\u672C\u97F3\u6548\u914D\u7F6E\u3002"
    }
  },
  "required": ["type"],
  "additionalProperties": false,
  "examples": [
    {
      "type": "machine_max:transmission",
      "basic_durability": 70.0,
      "diff_lock": "auto",
      "auto_diff_lock_threshold": 15.0,
      "diff_lock_sensitivity": 1.5
    }
  ]
}`, "subsystem/static/view_attr.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/subsystem/static/view_attr.json",\n  "title": "\u89C6\u56FE\u5C5E\u6027",\n  "description": "\u5EA7\u6905\u5B50\u7CFB\u7EDF\u7684\u89C6\u56FE\u5C5E\u6027\uFF0C\u5B9A\u4E49\u7B2C\u4E00\u4EBA\u79F0\u548C\u7B2C\u4E09\u4EBA\u79F0\u6444\u50CF\u673A\u8BBE\u7F6E\u3002",\n  "type": "object",\n  "properties": {\n    "enable_first_person": {\n      "type": "boolean",\n      "default": true,\n      "description": "\u662F\u5426\u542F\u7528\u7B2C\u4E00\u4EBA\u79F0\u89C6\u89D2\u3002"\n    },\n    "first_person_hud": {\n      "type": "array",\n      "items": { "$ref": "../../base/resource_location.schema.json" },\n      "default": [],\n      "description": "\u7B2C\u4E00\u4EBA\u79F0\u89C6\u89D2\u7684HUD\u754C\u9762\u8D44\u6E90\u5217\u8868\u3002"\n    },\n    "first_person_offset": {\n      "$ref": "../../base/vector_3d.schema.json",\n      "default": [0.0, 0.0, 0.0],\n      "description": "\u7B2C\u4E00\u4EBA\u79F0\u89C6\u89D2\u7684\u4E09\u7EF4\u504F\u79FB\uFF0C\u4EE5\u5B50\u7CFB\u7EDF\u9644\u7740\u7684\u96F6\u4EF6\u59FF\u6001\u4E3A\u57FA\u51C6\uFF0Cx+\u53F3\uFF0Cy+\u4E0A\uFF0Cz+\u540E\uFF0C\u5355\u4F4D\u7C73\u3002"\n    },\n    "enable_third_person": {\n      "type": "boolean",\n      "default": true,\n      "description": "\u662F\u5426\u542F\u7528\u7B2C\u4E09\u4EBA\u79F0\u89C6\u89D2\u3002"\n    },\n    "third_person_hud": {\n      "type": "array",\n      "items": { "$ref": "../../base/resource_location.schema.json" },\n      "default": [],\n      "description": "\u7B2C\u4E09\u4EBA\u79F0\u89C6\u89D2\u7684HUD\u754C\u9762\u8D44\u6E90\u5217\u8868\u3002"\n    },\n    "third_person_offset": {\n      "$ref": "../../base/vector_3d.schema.json",\n      "default": [0.0, 0.75, 0.0],\n      "description": "\u7B2C\u4E09\u4EBA\u79F0\u89C6\u89D2\u7684\u4E09\u7EF4\u504F\u79FB\uFF0C\u4EE5\u5B50\u7CFB\u7EDF\u9644\u7740\u7684\u96F6\u4EF6\u59FF\u6001\u4E3A\u57FA\u51C6\uFF0Cx+\u53F3\uFF0Cy+\u4E0A\uFF0Cz+\u540E\uFF0C\u5355\u4F4D\u7C73\u3002"\n    },\n    "follow_vehicle": {\n      "type": "boolean",\n      "default": true,\n      "description": "\u6444\u50CF\u673A\u662F\u5426\u8DDF\u968F\u8F66\u8F86\u8FD0\u52A8\u3002"\n    },\n    "focus_on_center": {\n      "type": "boolean",\n      "default": true,\n      "description": "\u662F\u5426\u805A\u7126\u4E8E\u8F66\u8F86\u4E2D\u5FC3\u3002"\n    },\n    "distance_scale": {\n      "type": "number",\n      "minimum": 0,\n      "default": 1.1,\n      "description": "\u6444\u50CF\u673A\u8DDD\u79BB\u7F29\u653E\u7CFB\u6570\u3002"\n    },\n    "min_pitch": {\n      "type": "number",\n      "minimum": -90,\n      "maximum": 90,\n      "default": -70,\n      "description": "\u6700\u5C0F\u4FEF\u4EF0\u89D2\u9650\u5236\uFF08\u5355\u4F4D\uFF1A\u5EA6\uFF09\u3002\u96F6\u5EA6\u5BF9\u5E94\u6C34\u5E73\u65B9\u5411\u3002\u4F8B\u5982\uFF0Cmin_pitch=-30\u8868\u793A\u6700\u591A\u5411\u4E0B\u770B30\u5EA6\u3002"\n    },\n    "max_pitch": {\n      "type": "number",\n      "minimum": -90,\n      "maximum": 90,\n      "default": 45,\n      "description": "\u6700\u5927\u4FEF\u4EF0\u89D2\u9650\u5236\uFF08\u5355\u4F4D\uFF1A\u5EA6\uFF09\u3002\u96F6\u5EA6\u5BF9\u5E94\u6C34\u5E73\u65B9\u5411\u3002\u4F8B\u5982\uFF0Cmax_pitch=60\u8868\u793A\u6700\u591A\u5411\u4E0A\u770B60\u5EA6\u3002"\n    },\n    "yaw_limit": {\n      "type": "number",\n      "minimum": 0,\n      "maximum": 360,\n      "default": 90,\n      "description": "\u504F\u822A\u89D2\u9650\u5236\uFF08\u5355\u4F4D\uFF1A\u5EA6\uFF09\u3002\u6B64\u503C\u8868\u793A\u603B\u89D2\u5EA6\u8303\u56F4\uFF0C\u56E0\u6B64\u5B9E\u9645\u504F\u822A\u89D2\u8303\u56F4\u4E3A[180 - yaw_limit/2, 180 + yaw_limit/2]\u3002\u4F8B\u5982\uFF0Cyaw_limit=90\u8868\u793A\u6C34\u5E73\u65B9\u5411\xB145\u5EA6\u7684\u79FB\u52A8\u8303\u56F4\u3002"\n    }\n  },\n  "additionalProperties": false,\n  "examples": [\n    {\n      "enable_first_person": true,\n      "first_person_hud": ["machine_max:hud/driver"],\n      "first_person_offset": [0.0, 0.3, 0.0],\n      "enable_third_person": true,\n      "distance_scale": 1.2\n    },\n    {\n      "enable_first_person": true,\n      "first_person_offset": [0.0, 0.2, 0.0],\n      "enable_third_person": false,\n      "min_pitch": -30,\n      "max_pitch": 60,\n      "yaw_limit": 120\n    }\n  ]\n}', "subsystem/static/wheel_driver_static_attr.schema.json": `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://machine_max.io/schemas/subsystem/static/wheel_driver_static_attr.json",
  "title": "\u8F6E\u9A71\u52A8\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027",
  "description": "\u8F6E\u9A71\u52A8\u7684\u9759\u6001\u5C5E\u6027\uFF0C\u5305\u62EC\u9A71\u52A8\u529B\u548C\u8F6C\u5411\u7279\u6027\u3002",
  "definitions": {
    "StaticWheelRollingAxisAttr": {
      "type": "object",
      "properties": {
        "$schema": {
          "type": "string",
          "description": "JSON Schema\u5F15\u7528\u8DEF\u5F84\uFF0C\u7528\u4E8E\u7F16\u8F91\u5668\u667A\u80FD\u63D0\u793A\u548C\u9A8C\u8BC1",
          "default": "../../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json"
        },
        "max_drive_force": {
          "type": "number",
          "minimum": 0,
          "default": 10000.0,
          "description": "\u6700\u5927\u9A71\u52A8\u529B\uFF0C\u5355\u4F4D\u725B\u987F(N)\u3002"
        },
        "basic_durability": {
          "type": "number",
          "minimum": 0,
          "default": 20.0,
          "description": "\u5B50\u7CFB\u7EDF\u57FA\u7840\u8010\u4E45\u5EA6\uFF0C\u964D\u81F30\u65F6\u4F1A\u762B\u75EA\uFF0C\u4FEE\u590D\u81F330%\u8010\u4E45\u5EA6\u65F6\u6062\u590D\u529F\u80FD\u3002"
        },
        "pass_damage": {
          "type": "boolean",
          "default": true,
          "description": "\u662F\u5426\u4F20\u9012\u4F24\u5BB3\u81F3\u5B50\u7CFB\u7EDF\u6301\u6709\u8005\u3002\u82E5\u4E3Atrue\uFF0C\u5B50\u7CFB\u7EDF\u53D7\u5230\u7684\u4F24\u5BB3\u4F1A\u4F20\u9012\u7ED9\u96F6\u4EF6\u3002"
        },
        "limit_damage": {
          "type": "boolean",
          "default": false,
          "description": "\u662F\u5426\u9650\u5236\u4F24\u5BB3\u4F20\u9012\u503C\u81F3\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u3002\u4F8B\u598240\u4F24\u5BB3\uFF0C\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6\u4E3A20\uFF0C\u5219\u53EA\u4F1A\u4F20\u901220\u4F24\u5BB3\u7ED9\u6301\u6709\u8005\u3002"
        },
        "hidden": {
          "type": "boolean",
          "default": false,
          "description": "\u662F\u5426\u9690\u85CF\u5B50\u7CFB\u7EDF\u5728HUD\u7B49\u5904\u7684\u663E\u793A\uFF0C\u5E38\u7528\u4E8E\u7EAF\u7CB9\u63D0\u4F9B\u6A21\u578B\u90E8\u4F4D\u635F\u574F\u5DEE\u5206\u7684\u65E0\u529F\u80FD\u5B50\u7CFB\u7EDF"
        },
        "max_brake_force": {
          "type": "number",
          "minimum": 0,
          "default": 3500.0,
          "description": "\u6700\u5927\u5236\u52A8\u529B\uFF0C\u5355\u4F4D\u725B\u987F(N)\u3002"
        },
        "max_hand_brake_force": {
          "type": "number",
          "minimum": 0,
          "default": 0.0,
          "description": "\u6700\u5927\u624B\u5239\u5236\u52A8\u529B\uFF0C\u5355\u4F4D\u725B\u987F(N)\u3002"
        },
        "max_speed": {
          "type": "number",
          "minimum": 0,
          "default": 3140.0,
          "description": "\u6700\u5927\u8F6C\u901F\uFF0C\u5355\u4F4D\u5F27\u5EA6/\u79D2(rad/s)\u3002"
        }
      },
      "additionalProperties": false
    },
    "StaticWheelSteeringAxisAttr": {
      "type": "object",
      "properties": {
        "max_force": {
          "type": "number",
          "minimum": 0,
          "default": 5000.0,
          "description": "\u6700\u5927\u8F6C\u5411\u529B\uFF0C\u5355\u4F4D\u725B\u987F(N)\u3002"
        },
        "max_speed": {
          "type": "number",
          "minimum": 0,
          "default": 3.14,
          "description": "\u6700\u5927\u8F6C\u5411\u901F\u5EA6\uFF0C\u5355\u4F4D\u5F27\u5EA6/\u79D2(rad/s)\u3002"
        }
      },
      "additionalProperties": false
    }
  },
  "properties": {
    "type": {
      "type": "string",
      "const": "machine_max:wheel_driver",
      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u5FC5\u987B\u4E3A'machine_max:wheel_driver'\u3002"
    },
    "control_inputs": {
      "type": "array",
      "items": { "type": "string" },
      "default": ["car_control"],
      "description": "\u63A7\u5236\u8F93\u5165\u4FE1\u53F7\u952E\u5217\u8868\u3002"
    },
    "roll": {
      "$ref": "#/definitions/StaticWheelRollingAxisAttr",
      "default": {
        "max_drive_force": 10000.0,
        "max_brake_force": 1500.0,
        "max_hand_brake_force": 0.0,
        "max_speed": 3140.0
      },
      "description": "\u6EDA\u52A8\u8F74\u5C5E\u6027\u3002"
    },
    "steering": {
      "$ref": "#/definitions/StaticWheelSteeringAxisAttr",
      "default": {
        "max_force": 4000.0,
        "max_speed": 3.14
      },
      "description": "\u8F6C\u5411\u8F74\u5C5E\u6027\u3002"
    },
    "abs_enabled": {
      "type": "boolean",
      "default": false,
      "description": "\u662F\u5426\u542F\u7528\u9632\u62B1\u6B7B\u7CFB\u7EDF(ABS)\u3002"
    },
    "abs_target_slip_ratio": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "default": 0.15,
      "description": "ABS\u76EE\u6807\u6ED1\u79FB\u7387\uFF0C\u901A\u5E38\u8BBE\u7F6E\u57280.1-0.2\u4E4B\u95F4\u3002\u6ED1\u79FB\u7387\u8FC7\u9AD8\u65F6ABS\u4F1A\u51CF\u5C11\u5239\u8F66\u529B\u3002"
    },
    "abs_wheel_radius": {
      "type": "number",
      "minimum": 0.01,
      "default": 0.3,
      "description": "\u8F6E\u80CE\u534A\u5F84\uFF0C\u5355\u4F4D\u7C73\uFF0C\u7528\u4E8E\u8BA1\u7B97\u8F6E\u80CE\u7EBF\u901F\u5EA6\u548C\u6ED1\u79FB\u7387\u3002"
    },
    "sounds": {
      "type": "object",
      "properties": {
        "on_destroyed": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6467\u6BC1\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        },
        "on_activate": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5B50\u7CFB\u7EDF\u88AB\u6FC0\u6D3B\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:empty_sound",
            "range": 16
          }
        },
        "brake_on": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5239\u8F66\u5F00\u542F\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:subsystem.wheel_driver.brake_on",
            "range": 16
          }
        },
        "brake_off": {
          "$ref": "../../base/sound_event.schema.json",
          "description": "\u5239\u8F66\u5173\u95ED\u65F6\u7684\u97F3\u6548\u4E8B\u4EF6\u3002",
          "default": {
            "sound_id": "machine_max:subsystem.wheel_driver.brake_off",
            "range": 16
          }
        }
      },
      "additionalProperties": false,
      "description": "\u5239\u8F66\u64CD\u4F5C\u97F3\u6548\u914D\u7F6E\u3002"
    }
  },
  "required": ["type"],
  "examples": [
    {
      "type": "machine_max:wheel_driver",
      "basic_durability": 40.0,
      "control_inputs": ["car_control"],
      "roll": {
        "max_drive_force": 12000.0,
        "max_brake_force": 4000.0,
        "max_speed": 2800.0
      },
      "steering": {
        "max_force": 3000.0,
        "max_speed": 2.5
      }
    },
    {
      "type": "machine_max:wheel_driver",
      "basic_durability": 35.0,
      "control_inputs": ["car_control"],
      "roll": {
        "max_drive_force": 10000.0,
        "max_brake_force": 3500.0,
        "max_speed": 3000.0
      },
      "steering": {
        "max_force": 2500.0,
        "max_speed": 3.0
      },
      "abs_enabled": true,
      "abs_target_slip_ratio": 0.15,
      "abs_wheel_radius": 0.35
    }
  ]
}`, "subsystem/subsystem_dynamic_attr.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/subsystem/subsystem_dynamic_attr.json",\n  "title": "\u5B50\u7CFB\u7EDF\u52A8\u6001\u5C5E\u6027",\n  "description": "\u5B50\u7CFB\u7EDF\u52A8\u6001\u5C5E\u6027\u7684\u9876\u5C42\u67B6\u6784\uFF0C\u6839\u636E type \u5B57\u6BB5\u5206\u6D3E\u5230\u5177\u4F53\u5B50\u7CFB\u7EDF\u52A8\u6001\u5C5E\u6027\u67B6\u6784\u3002",\n  "type": "object",\n  "properties": {\n    "type": {\n      "type": "string",\n      "enum": [\n        "machine_max:basic",\n        "machine_max:car_controller",\n        "machine_max:motorbike_controller",\n        "machine_max:engine",\n        "machine_max:gearbox",\n        "machine_max:item_storage",\n        "machine_max:motor",\n        "machine_max:motor_controller",\n        "machine_max:seat",\n        "machine_max:transmission",\n        "machine_max:wheel_driver",\n        "machine_max:lighting"\n      ],\n      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u51B3\u5B9A\u4F7F\u7528\u54EA\u4E2A\u5177\u4F53\u7684\u5B50\u7CFB\u7EDF\u67B6\u6784\u3002"\n    }\n  },\n  "additionalProperties": true,\n  "required": [\n    "type"\n  ],\n  "allOf": [\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:car_controller"\n          }\n        }\n      },\n      "then": {\n        "$ref": "dynamic/car_controller_dynamic_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:engine"\n          }\n        }\n      },\n      "then": {\n        "$ref": "dynamic/engine_dynamic_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:gearbox"\n          }\n        }\n      },\n      "then": {\n        "$ref": "dynamic/gearbox_dynamic_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:item_storage"\n          }\n        }\n      },\n      "then": {\n        "$ref": "dynamic/item_storage_dynamic_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:motor"\n          }\n        }\n      },\n      "then": {\n        "$ref": "dynamic/motor_dynamic_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:motor_controller"\n          }\n        }\n      },\n      "then": {\n        "$ref": "dynamic/motorbike_controller_dynamic_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:seat"\n          }\n        }\n      },\n      "then": {\n        "$ref": "dynamic/seat_dynamic_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:transmission"\n          }\n        }\n      },\n      "then": {\n        "$ref": "dynamic/transmission_dynamic_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:wheel_driver"\n          }\n        }\n      },\n      "then": {\n        "$ref": "dynamic/wheel_driver_dynamic_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:lighting"\n          }\n        }\n      },\n      "then": {\n        "$ref": "dynamic/lighting_dynamic_attr.schema.json"\n      }\n    }\n  ],\n  "examples": [\n    {\n      "type": "machine_max:car_controller",\n      "definition": "machine_max:ae86at_car_controller",\n      "control_outputs": {\n        "car_control": [\n          "subsystem.machine_max.engine",\n          "subsystem.machine_max.left_front_wheel_driver",\n          "subsystem.machine_max.right_front_wheel_driver",\n          "subsystem.machine_max.left_back_wheel_driver",\n          "subsystem.machine_max.right_back_wheel_driver",\n          "subsystem.machine_max.gearbox"\n        ]\n      }\n    },\n    {\n      "type": "machine_max:engine",\n      "definition": "machine_max:ae86at_engine",\n      "power_output": "gearbox"\n    }\n  ]\n}', "subsystem/subsystem_static_attr.schema.json": '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "$id": "https://machine_max.io/schemas/subsystem/subsystem_static_attr.json",\n  "title": "\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027",\n  "description": "\u5B50\u7CFB\u7EDF\u9759\u6001\u5C5E\u6027\u7684\u9876\u5C42\u67B6\u6784\uFF0C\u6839\u636E type \u5B57\u6BB5\u5206\u6D3E\u5230\u5177\u4F53\u5B50\u7CFB\u7EDF\u7C7B\u578B\u3002",\n  "type": "object",\n  "properties": {\n    "type": {\n      "type": "string",\n      "enum": [\n        "machine_max:basic",\n        "machine_max:car_controller",\n        "machine_max:motorbike_controller",\n        "machine_max:engine",\n        "machine_max:gearbox",\n        "machine_max:item_storage",\n        "machine_max:motor",\n        "machine_max:motor_controller",\n        "machine_max:seat",\n        "machine_max:transmission",\n        "machine_max:wheel_driver",\n        "machine_max:lighting"\n      ],\n      "description": "\u5B50\u7CFB\u7EDF\u7C7B\u578B\uFF0C\u51B3\u5B9A\u4F7F\u7528\u54EA\u4E2A\u5177\u4F53\u7684\u5B50\u7CFB\u7EDF\u67B6\u6784\u3002"\n    }\n  },\n  "additionalProperties": true,\n  "required": [\n    "type"\n  ],\n  "allOf": [\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:car_controller"\n          }\n        }\n      },\n      "then": {\n        "$ref": "static/car_controller_static_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:motorbike_controller"\n          }\n        }\n      },\n      "then": {\n        "$ref": "static/motorbike_controller_static_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:engine"\n          }\n        }\n      },\n      "then": {\n        "$ref": "static/engine_static_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:gearbox"\n          }\n        }\n      },\n      "then": {\n        "$ref": "static/gearbox_static_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:item_storage"\n          }\n        }\n      },\n      "then": {\n        "$ref": "static/item_storage_static_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:motor"\n          }\n        }\n      },\n      "then": {\n        "$ref": "static/motor_static_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:motor_controller"\n          }\n        }\n      },\n      "then": {\n        "$ref": "static/motorbike_controller_static_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:seat"\n          }\n        }\n      },\n      "then": {\n        "$ref": "static/seat_static_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:transmission"\n          }\n        }\n      },\n      "then": {\n        "$ref": "static/transmission_static_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:wheel_driver"\n          }\n        }\n      },\n      "then": {\n        "$ref": "static/wheel_driver_static_attr.schema.json"\n      }\n    },\n    {\n      "if": {\n        "properties": {\n          "type": {\n            "const": "machine_max:lighting"\n          }\n        }\n      },\n      "then": {\n        "$ref": "static/lighting_static_attr.schema.json"\n      }\n    }\n  ],\n  "examples": [\n    {\n      "$schema": "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json",\n      "type": "machine_max:item_storage",\n      "basic_durability": 100.0,\n      "rows": 6,\n      "columns": 9\n    },\n    {\n      "$schema": "../../docs/zh_cn/schemas/subsystem/subsystem_static_attr.schema.json",\n      "type": "machine_max:engine",\n      "max_power": 75000.0,\n      "max_torque": 130.0,\n      "red_line_rpm": 6500.0\n    }\n  ]\n}', "\u5982\u4F55\u4F7F\u7528JSON\u6A21\u677F.md": '# JSON Schema\u5728Machine-Max\u5185\u5BB9\u5305\u5236\u4F5C\u4E2D\u7684\u5E94\u7528\u6307\u5357\n\n## \u4EC0\u4E48\u662FJSON Schema\uFF1F\n\nJSON Schema\u662F\u4E00\u79CD\u7528\u4E8E\u63CF\u8FF0\u548C\u9A8C\u8BC1JSON\u6587\u6863\u7ED3\u6784\u7684\u89C4\u8303\u3002\u5BF9\u4E8EMachine-Max\u7684\u5185\u5BB9\u5305\u5236\u4F5C\uFF0CJSON Schema\u80FD\u591F\u5E2E\u52A9\u4F60\uFF1A\n\n- **\u9A8C\u8BC1\u914D\u7F6E\u683C\u5F0F**\uFF1A\u786E\u4FDD\u4F60\u7684JSON\u914D\u7F6E\u6587\u4EF6\u683C\u5F0F\u6B63\u786E\n- **\u63D0\u4F9B\u667A\u80FD\u63D0\u793A**\uFF1A\u5728\u652F\u6301\u7684\u7F16\u8F91\u5668\u4E2D\u663E\u793A\u5C5E\u6027\u8BF4\u660E\u548C\u7C7B\u578B\u8981\u6C42\n- **\u51CF\u5C11\u9519\u8BEF**\uFF1A\u63D0\u524D\u53D1\u73B0\u914D\u7F6E\u9519\u8BEF\uFF0C\u907F\u514D\u6E38\u620F\u5185\u95EE\u9898\n\n## \u4E3A\u4EC0\u4E48\u5185\u5BB9\u5305\u5236\u4F5C\u8005\u9700\u8981\u5173\u6CE8JSON Schema\uFF1F\n\n\u5373\u4F7F\u4F60\u6CA1\u6709\u7F16\u7A0B\u7ECF\u9A8C\uFF0CJSON Schema\u4E5F\u80FD\u8BA9\u4F60\u7684\u5185\u5BB9\u5305\u5236\u4F5C\u8FC7\u7A0B\u66F4\u987A\u7545\uFF1A\n\n1. **\u81EA\u52A8\u8865\u5168**\uFF1A\u73B0\u4EE3\u7F16\u8F91\u5668\uFF08\u5982VSCode\uFF09\u53EF\u4EE5\u6839\u636ESchema\u63D0\u4F9B\u5C5E\u6027\u540D\u81EA\u52A8\u8865\u5168\n2. **\u9519\u8BEF\u63D0\u793A**\uFF1A\u5728\u914D\u7F6E\u9519\u8BEF\u65F6\u7ACB\u5373\u63D0\u793A\uFF0C\u800C\u4E0D\u662F\u7B49\u5230\u6E38\u620F\u4E2D\u624D\u53D1\u73B0\u95EE\u9898\n3. **\u5C5E\u6027\u8BF4\u660E**\uFF1A\u67E5\u770B\u6BCF\u4E2A\u914D\u7F6E\u9879\u7684\u5177\u4F53\u542B\u4E49\u548C\u4F7F\u7528\u65B9\u6CD5\n4. **\u7C7B\u578B\u68C0\u67E5**\uFF1A\u786E\u4FDD\u4F60\u8F93\u5165\u7684\u6570\u636E\u7C7B\u578B\u6B63\u786E\uFF08\u6570\u5B57\u3001\u5B57\u7B26\u4E32\u3001\u5E03\u5C14\u503C\u7B49\uFF09\n\n## \u5982\u4F55\u4F7F\u7528JSON Schema\uFF1F\n\n### 1. \u914D\u7F6E\u7F16\u8F91\u5668\u652F\u6301\n\n\u5728\u4F60\u7684JSON\u6587\u4EF6\u9876\u90E8\u6DFB\u52A0`$schema`\u5B57\u6BB5\uFF0C\u6216\u76F4\u63A5\u590D\u5236\u5DF2\u6709\u7684\u793A\u4F8BJSON\uFF0C\u4F8B\u5982\uFF1A\n\n```json\n{\n  "$schema": "../../docs/zh_cn/schemas/part_definition_schema.json",\n  "vehicle_durability_rate": 1.0,\n  "variants": {\n    "default": {\n      "icon": "machine_max:textures/icon/example.png",\n      "models": "machine_max:example.geo"\n    }\n  }\n}\n```\n\u6CE8\u610F\uFF0C\u5728\u8FD9\u91CC`$schema`\u5B57\u6BB5\u7684\u503C\u4E3A\u76F8\u5BF9\u8DEF\u5F84\uFF0C"../"\u8868\u793A\u5F53\u524D\u6587\u4EF6\u7684\u4E0A\u7EA7\u76EE\u5F55\u3002\n\n### 2. \u63A8\u8350\u7F16\u8F91\u5668\n\n- **VSCode**\uFF1A\u539F\u751F\u652F\u6301JSON Schema\n\n### 3. \u5728VSCode\u4E2D\u542F\u7528JSON Schema\u9A8C\u8BC1\n\n **\u63A8\u8350\u76F4\u63A5\u590D\u7528\u5B98\u65B9\u5185\u5BB9\u5305\u7684\u6587\u4EF6\u7ED3\u6784\uFF0C\u5E76\u539F\u6837\u590D\u5236docs\u6587\u4EF6\u5939\u5230\u4F60\u81EA\u5DF1\u7684\u5185\u5BB9\u5305\uFF0C\u518D\u5728\u90E8\u4EF6\u548C\u5B50\u7CFB\u7EDFjson\u6587\u4EF6\u5F00\u5934\u6DFB\u52A0`$schema`\u5F15\u7528\u5373\u53EF\u3002**\n\n## \u5B9E\u9645\u5236\u4F5C\u4E2D\u7684\u5E94\u7528\u793A\u4F8B\n\n### \u6B65\u9AA41\uFF1A\u521B\u5EFA\u65B0\u90E8\u4EF6\n\n1. \u590D\u5236\u73B0\u6709\u7684\u90E8\u4EF6JSON\u6587\u4EF6\u4F5C\u4E3A\u6A21\u677F\n2. \u5728\u6587\u4EF6\u5F00\u5934\u6DFB\u52A0`$schema`\u5F15\u7528\n3. \u6839\u636E\u7F16\u8F91\u5668\u7684\u667A\u80FD\u63D0\u793A\u6DFB\u52A0\u914D\u7F6E\u9879\n\n### \u6B65\u9AA42\uFF1A\u9A8C\u8BC1\u914D\u7F6E\n\n1. \u4FDD\u5B58\u6587\u4EF6\u540E\u67E5\u770B\u7F16\u8F91\u5668\u662F\u5426\u663E\u793A\u9519\u8BEF\n2. \u6839\u636E\u63D0\u793A\u4FEE\u6B63\u914D\u7F6E\u683C\u5F0F\u95EE\u9898\n3. \u6D4B\u8BD5\u5185\u5BB9\u5305\u5728\u6E38\u620F\u4E2D\u662F\u5426\u6B63\u5E38\u5DE5\u4F5C\n\n### \u6B65\u9AA43\uFF1A\u8C03\u8BD5\u95EE\u9898\n\n\u5982\u679C\u5185\u5BB9\u5305\u5728\u6E38\u620F\u4E2D\u4E0D\u5DE5\u4F5C\uFF0C\u68C0\u67E5\uFF1A\n\n1. JSON\u683C\u5F0F\u662F\u5426\u6B63\u786E\uFF08\u4F7F\u7528Schema\u9A8C\u8BC1\uFF09\n2. \u6240\u6709\u5FC5\u9700\u5B57\u6BB5\u662F\u5426\u90FD\u5DF2\u586B\u5199\n3. \u6570\u636E\u7C7B\u578B\u662F\u5426\u5339\u914D\uFF08\u6570\u5B57 vs \u5B57\u7B26\u4E32\u7B49\uFF09\n\n## \u5E38\u89C1\u95EE\u9898\u4E0E\u89E3\u51B3\u65B9\u6848\n\n### Q: \u7F16\u8F91\u5668\u63D0\u793A\u9519\u8BEF\uFF0C\u4F46\u914D\u7F6E\u770B\u8D77\u6765\u662F\u6B63\u786E\u7684\uFF1F\nA: \u68C0\u67E5\uFF1A\n- JSON\u8BED\u6CD5\u662F\u5426\u6B63\u786E\uFF08\u9017\u53F7\u3001\u62EC\u53F7\u662F\u5426\u6709\u7F3A\u6F0F\u7B49\uFF0C\u52A1\u5FC5\u6CE8\u610F\u4E0D\u8981\u4F7F\u7528\u4E2D\u6587\u6807\u70B9\u7B26\u53F7\uFF09\n- \u5B57\u6BB5\u540D\u79F0\u662F\u5426\u62FC\u5199\u6B63\u786E\n- \u6570\u636E\u7C7B\u578B\u662F\u5426\u5339\u914D\uFF08\u5982\u9700\u8981\u6570\u5B57\u4F46\u8F93\u5165\u4E86\u5B57\u7B26\u4E32\uFF09\n\n### Q: \u5982\u4F55\u77E5\u9053\u54EA\u4E9B\u5B57\u6BB5\u662F\u5FC5\u9700\u7684\uFF1F\nA: \u67E5\u770BSchema\u6587\u4EF6\u4E2D\u7684`required`\u5B57\u6BB5\uFF0C\u6216\u8005\u5728\u652F\u6301\u7684\u7F16\u8F91\u5668\u4E2D\u4F1A\u6709\u76F8\u5E94\u63D0\u793A\u3002\n\n### Q: \u8FD9\u4E9B\u5B57\u6BB5\u7684\u4F5C\u7528\u90FD\u662F\u4EC0\u4E48\uFF1F\nA: \u5C06\u9F20\u6807\u653E\u5230\u5B57\u6BB5\u4E0A\uFF0C\u5373\u53EF\u67E5\u770B\u5B57\u6BB5\u7684\u8BF4\u660E\u548C\u7C7B\u578B\u8981\u6C42\u3002\n\n## \u63D0\u9AD8\u6548\u7387\u7684\u6280\u5DE7\n\n1. **\u4F7F\u7528\u6A21\u677F**\uFF1A\u57FA\u4E8E\u73B0\u6709\u5DE5\u4F5C\u6B63\u5E38\u7684\u914D\u7F6E\u521B\u5EFA\u65B0\u914D\u7F6E\n2. **\u9010\u6B65\u6DFB\u52A0**\uFF1A\u5148\u6DFB\u52A0\u57FA\u672C\u914D\u7F6E\uFF0C\u9A8C\u8BC1\u65E0\u8BEF\u540E\u518D\u6DFB\u52A0\u9AD8\u7EA7\u9009\u9879\n3. **\u53C2\u8003\u793A\u4F8B**\uFF1A\u67E5\u770B\u5B98\u65B9\u5305\u4E2D\u7684\u793A\u4F8B\u914D\u7F6E\u6587\u4EF6\n4. **\u5B9E\u65F6\u9A8C\u8BC1**\uFF1A\u5728\u7F16\u8F91\u5668\u4E2D\u5B9E\u65F6\u67E5\u770B\u9A8C\u8BC1\u7ED3\u679C\n\n## \u603B\u7ED3\n\nJSON Schema\u662F\u5185\u5BB9\u5305\u5236\u4F5C\u7684\u5F3A\u5927\u8F85\u52A9\u5DE5\u5177\uFF0C\u5B83\u80FD\u5E2E\u52A9\u4F60\u521B\u5EFA\u683C\u5F0F\u6B63\u786E\u3001\u7ED3\u6784\u5B8C\u6574\u7684\u914D\u7F6E\u6587\u4EF6\u3002\u5373\u4F7F\u6CA1\u6709\u7F16\u7A0B\u7ECF\u9A8C\uFF0C\u4F7F\u7528\u652F\u6301Schema\u7684\u7F16\u8F91\u5668\u4E5F\u80FD\u5927\u5927\u63D0\u9AD8\u5236\u4F5C\u6548\u7387\u548C\u51C6\u786E\u6027\u3002\n\n\u5F00\u59CB\u4F7F\u7528\u65F6\uFF0C\u5EFA\u8BAE\u5148\u4ECE\u7B80\u5355\u7684\u914D\u7F6E\u5F00\u59CB\uFF0C\u9010\u6B65\u719F\u6089Schema\u63D0\u4F9B\u7684\u5404\u79CD\u529F\u80FD\uFF0C\u968F\u7740\u7ECF\u9A8C\u7684\u79EF\u7D2F\uFF0C\u4F60\u4F1A\u53D1\u73B0\u5236\u4F5C\u5185\u5BB9\u5305\u53D8\u5F97\u66F4\u52A0\u7B80\u5355\u548C\u53EF\u9760\u3002' };
    }
  });

  // src/utils/logger.js
  var require_logger = __commonJS({
    "src/utils/logger.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var DEBUG_ENABLED = true ? false : true;
      var LEVELS = {
        DEBUG: "DEBUG",
        INFO: "INFO",
        WARN: "WARN",
        ERROR: "ERROR"
      };
      var CONSOLE_METHODS = {
        [LEVELS.DEBUG]: "log",
        [LEVELS.INFO]: "log",
        [LEVELS.WARN]: "warn",
        [LEVELS.ERROR]: "error"
      };
      function formatPrefix(level, module2) {
        var prefix = "[MM]";
        if (module2) prefix += "[" + module2 + "]";
        prefix += "[" + level + "]";
        return prefix;
      }
      function log2(level, module2, message, extra) {
        var prefix = formatPrefix(level, module2);
        var method = CONSOLE_METHODS[level] || "log";
        if (extra !== void 0) {
          console[method](prefix, message, extra);
        } else {
          console[method](prefix, message);
        }
      }
      function debug(module2, message, extra) {
        if (!DEBUG_ENABLED) return;
        log2(LEVELS.DEBUG, module2, message, extra);
      }
      function info(module2, message, extra) {
        log2(LEVELS.INFO, module2, message, extra);
      }
      function warn(module2, message, extra) {
        log2(LEVELS.WARN, module2, message, extra);
      }
      function error(module2, message, error2) {
        var prefix = formatPrefix(LEVELS.ERROR, module2);
        console.error(prefix, message);
        if (error2) {
          if (error2 instanceof Error) {
            console.error(prefix, "Stack:", error2.stack);
          } else {
            console.error(prefix, "Detail:", error2);
          }
        }
      }
      function createLogger2(moduleName) {
        return {
          debug: function(message, extra) {
            debug(moduleName, message, extra);
          },
          info: function(message, extra) {
            info(moduleName, message, extra);
          },
          warn: function(message, extra) {
            warn(moduleName, message, extra);
          },
          error: function(message, err) {
            error(moduleName, message, err);
          }
        };
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          DEBUG_ENABLED,
          debug,
          info,
          warn,
          error,
          createLogger: createLogger2
        };
      }
    }
  });

  // src/core/config_defaults.js
  var require_config_defaults = __commonJS({
    "src/core/config_defaults.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var CONFIG_VERSION = 4;
      var PART_DEFAULTS = {
        icon: "",
        vehicle_durability_rate: 0.8,
        vehicle_damage_rate: 1,
        vehicle_damage_rate_destroyed: 0.1,
        functional_threshold: 0.3,
        share_durability: true,
        max_stack_size: 1,
        variants: {},
        element_markers: {}
      };
      var VARIANT_DEFAULTS = {
        model: "",
        textures: "",
        animations: null,
        tags: [],
        sub_parts: {}
      };
      var SUB_PART_DEFAULTS = {
        start_bone: "",
        end_bones: [],
        auto_end_bones: [],
        durability: 20,
        mass: 25,
        mass_center: "mass_center",
        projected_area: [0, 0, 0],
        block_collision: "true",
        collision_height: -1,
        climb_assist: false,
        hydro_priority: 0,
        hit_boxes: {},
        interact_boxes: {},
        connectors: {},
        subsystems: {},
        hydrodynamics: null
      };
      var HIT_BOX_DEFAULTS = {
        id: "part",
        type: "box",
        material: "",
        thickness: 1,
        condition: "true"
      };
      var INTERACT_BOX_DEFAULTS = {
        bone: "",
        interact_mode: "fast",
        condition: "NOR",
        signal_targets: {}
      };
      var SUBSYSTEM_INSTANCE_DEFAULTS = {
        type: "",
        definition: ""
      };
      var CONNECTOR_INSTANCE_DEFAULTS = {
        locator: "",
        definition: "",
        power_target: "",
        signal_translations: {},
        signal_targets: {},
        internal: false,
        overwrite: {}
      };
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          CONFIG_VERSION,
          PART_DEFAULTS,
          VARIANT_DEFAULTS,
          SUB_PART_DEFAULTS,
          HIT_BOX_DEFAULTS,
          INTERACT_BOX_DEFAULTS,
          SUBSYSTEM_INSTANCE_DEFAULTS,
          CONNECTOR_INSTANCE_DEFAULTS
        };
      }
    }
  });

  // src/core/config.js
  var require_config = __commonJS({
    "src/core/config.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var {
        CONFIG_VERSION,
        PART_DEFAULTS,
        VARIANT_DEFAULTS,
        SUB_PART_DEFAULTS,
        HIT_BOX_DEFAULTS,
        INTERACT_BOX_DEFAULTS,
        SUBSYSTEM_INSTANCE_DEFAULTS,
        CONNECTOR_INSTANCE_DEFAULTS
      } = require_config_defaults();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("Config");
      var MIGRATIONS = {
        2: function(v1config) {
          var v3 = v1config.project || v1config;
          v3.$schema_version = 3;
          v3.projectiles = v3.projectiles || {};
          v3.connector_defs = v3.connector_defs || {};
          v3.subsystem_defs = v3.subsystem_defs || {};
          v3.material_defs = v3.material_defs || {};
          log2.info("MIGRATIONS: \u914D\u7F6E\u4ECE v1\u2192v3 \u8FC1\u79FB\u5B8C\u6210");
          return v3;
        },
        3: function(v3config) {
          delete v3config.connector_defs;
          delete v3config.subsystem_defs;
          delete v3config.material_defs;
          delete v3config.projectiles;
          delete v3config.namespace;
          delete v3config.packMeta;
          v3config.contentPackPath = v3config.contentPackPath || "";
          v3config.dependencyPaths = v3config.dependencyPaths || [];
          v3config.$schema_version = 4;
          log2.info("MIGRATIONS: \u914D\u7F6E\u4ECE v3\u2192v4 \u8FC1\u79FB\u5B8C\u6210");
          return v3config;
        }
      };
      function createBlankConfig() {
        log2.debug("createBlankConfig: \u521B\u5EFA\u7A7A\u767D\u914D\u7F6E\uFF0C\u7248\u672C=" + CONFIG_VERSION);
        return {
          $schema_version: CONFIG_VERSION,
          modelFile: "",
          parts: {},
          contentPackPath: "",
          dependencyPaths: [],
          _uiState: {
            activeMode: "part",
            activePartId: "",
            activeVariantName: ""
          }
        };
      }
      function createPartConfig(partId, initialVariantName) {
        log2.debug("createPartConfig: \u521B\u5EFA\u96F6\u4EF6\u914D\u7F6E", { partId, variant: initialVariantName });
        const part = JSON.parse(JSON.stringify(PART_DEFAULTS));
        part.element_markers = {};
        if (initialVariantName) {
          part.variants[initialVariantName] = createVariantConfig();
        }
        return part;
      }
      function createVariantConfig() {
        log2.debug("createVariantConfig: \u521B\u5EFA\u53D8\u4F53\u914D\u7F6E");
        return JSON.parse(JSON.stringify(VARIANT_DEFAULTS));
      }
      function createSubPartConfig() {
        log2.debug("createSubPartConfig: \u521B\u5EFA\u5B50\u96F6\u4EF6\u914D\u7F6E");
        return JSON.parse(JSON.stringify(SUB_PART_DEFAULTS));
      }
      function createHitBoxConfig() {
        log2.debug("createHitBoxConfig: \u521B\u5EFA\u78B0\u649E\u7BB1\u914D\u7F6E");
        return JSON.parse(JSON.stringify(HIT_BOX_DEFAULTS));
      }
      function createInteractBoxConfig() {
        log2.debug("createInteractBoxConfig: \u521B\u5EFA\u4EA4\u4E92\u533A\u914D\u7F6E");
        return JSON.parse(JSON.stringify(INTERACT_BOX_DEFAULTS));
      }
      function createSubsystemConfig() {
        log2.debug("createSubsystemConfig: \u521B\u5EFA\u5B50\u7CFB\u7EDF\u914D\u7F6E");
        return JSON.parse(JSON.stringify(SUBSYSTEM_INSTANCE_DEFAULTS));
      }
      function createConnectorInstanceConfig() {
        log2.debug("createConnectorInstanceConfig: \u521B\u5EFA\u8FDE\u63A5\u70B9\u5B9E\u4F8B\u914D\u7F6E");
        return JSON.parse(JSON.stringify(CONNECTOR_INSTANCE_DEFAULTS));
      }
      function ensureDefaults(config) {
        if (!config || typeof config !== "object") {
          log2.warn("ensureDefaults: \u914D\u7F6E\u65E0\u6548\uFF0C\u8FD4\u56DE\u7A7A\u767D\u914D\u7F6E");
          return createBlankConfig();
        }
        const result = Object.assign({}, createBlankConfig(), config);
        if (!result.parts) result.parts = {};
        if (!result._uiState) {
          result._uiState = { activeMode: "part", activePartId: "", activeVariantName: "" };
        }
        log2.debug("ensureDefaults: \u5B8C\u6210");
        return result;
      }
      function migrateIfNeeded(config) {
        if (!config || !config.$schema_version) {
          log2.info("migrateIfNeeded: \u65E0\u7248\u672C\u53F7\uFF0C\u5E94\u7528\u9ED8\u8BA4\u503C");
          return ensureDefaults(config);
        }
        const version = config.$schema_version;
        if (version === CONFIG_VERSION) {
          log2.debug("migrateIfNeeded: \u914D\u7F6E\u5DF2\u662F\u6700\u65B0\u7248\u672C v" + version);
          return ensureDefaults(config);
        }
        log2.info("migrateIfNeeded: \u914D\u7F6E\u9700\u8981\u8FC1\u79FB", { from: version, to: CONFIG_VERSION });
        let migrated = JSON.parse(JSON.stringify(config));
        for (let v = version; v < CONFIG_VERSION; v++) {
          if (MIGRATIONS[v]) {
            migrated = MIGRATIONS[v](migrated);
            log2.debug("migrateIfNeeded: \u8FC1\u79FB\u6B65\u9AA4 v" + v + " \u5B8C\u6210");
          }
        }
        return ensureDefaults(migrated);
      }
      function getActivePart(config) {
        if (!config || !config.parts) {
          log2.debug("getActivePart: \u914D\u7F6E\u6216\u96F6\u4EF6\u5217\u8868\u4E3A\u7A7A");
          return null;
        }
        const partId = config._uiState?.activePartId;
        if (!partId) {
          log2.debug("getActivePart: \u65E0\u6D3B\u8DC3\u96F6\u4EF6 ID");
          return null;
        }
        var part = config.parts[partId] || null;
        log2.debug("getActivePart: " + (part ? "\u627E\u5230\u96F6\u4EF6 " + partId : "\u96F6\u4EF6 " + partId + " \u4E0D\u5B58\u5728"));
        return part;
      }
      function getActiveVariant(config) {
        const part = getActivePart(config);
        if (!part) return null;
        const variantName = config._uiState?.activeVariantName;
        if (!variantName) {
          log2.debug("getActiveVariant: \u65E0\u6D3B\u8DC3\u53D8\u4F53\u540D");
          return null;
        }
        var variant = part.variants[variantName] || null;
        log2.debug("getActiveVariant: " + (variant ? "\u627E\u5230\u53D8\u4F53 " + variantName : "\u53D8\u4F53 " + variantName + " \u4E0D\u5B58\u5728"));
        return variant;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          CONFIG_VERSION,
          createBlankConfig,
          createPartConfig,
          createVariantConfig,
          createSubPartConfig,
          createHitBoxConfig,
          createInteractBoxConfig,
          createSubsystemConfig,
          createConnectorInstanceConfig,
          ensureDefaults,
          migrateIfNeeded,
          getActivePart,
          getActiveVariant
        };
      }
    }
  });

  // src/utils/persistence.js
  var require_persistence = __commonJS({
    "src/utils/persistence.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var PROPERTY_NAME = "machine_max_plugin";
      var config_defaults = require_config_defaults();
      var { migrateIfNeeded, createBlankConfig } = require_config();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("Persistence");
      function registerProperty2() {
        if (ModelProject.properties[PROPERTY_NAME]) {
          log2.debug("registerProperty: Property \u5DF2\u6CE8\u518C\uFF0C\u8DF3\u8FC7");
          return;
        }
        var existingData = Project && Project !== 0 ? Project[PROPERTY_NAME] : null;
        var hasExisting = existingData && typeof existingData === "object" && Object.keys(existingData).length > 0;
        new Property(ModelProject, "object", PROPERTY_NAME, {
          default: {},
          exposed: false
        });
        if (hasExisting) {
          Project[PROPERTY_NAME] = existingData;
          log2.info("registerProperty: \u5DF2\u8FD8\u539F\u5DF2\u6709\u914D\u7F6E\uFF08" + Object.keys(existingData).length + " \u4E2A\u952E\uFF09");
        } else {
          log2.info("registerProperty: Property \u5DF2\u6CE8\u518C\uFF08\u65E0\u5DF2\u6709\u914D\u7F6E\uFF09");
        }
      }
      function getBBModelPath() {
        if (!Project || Project === 0 || !Project.file_path) {
          log2.debug("getBBModelPath: \u65E0 .bbmodel \u8DEF\u5F84");
          return null;
        }
        log2.debug("getBBModelPath: " + Project.file_path);
        return Project.file_path;
      }
      function loadConfig() {
        if (!Project || Project === 0) {
          log2.warn("loadConfig: \u5C1A\u672A\u6253\u5F00\u9879\u76EE\uFF0C\u8FD4\u56DE\u7A7A\u767D\u914D\u7F6E");
          return createBlankConfig();
        }
        const propData = Project[PROPERTY_NAME];
        if (propData && propData.$schema_version) {
          log2.info("\u4ECE Property \u52A0\u8F7D\u914D\u7F6E\uFF0C\u7248\u672C: " + propData.$schema_version);
          var migrated = migrateIfNeeded(propData);
          Project[PROPERTY_NAME] = migrated;
          return migrated;
        }
        if (propData && typeof propData === "object" && Object.keys(propData).length > 0) {
          log2.info("\u4ECE Property \u52A0\u8F7D\u914D\u7F6E\uFF08\u65E0\u7248\u672C\u53F7\uFF0C\u5C1D\u8BD5\u4FEE\u590D\uFF09\uFF0C\u952E: " + Object.keys(propData).join(","));
          var repaired = migrateIfNeeded(propData);
          Project[PROPERTY_NAME] = repaired;
          return repaired;
        }
        const bbmodelPath = getBBModelPath();
        if (bbmodelPath) {
          const standalonePath = bbmodelPath.replace(/\.bbmodel$/i, ".mm_project.json");
          try {
            const fs = __require("fs");
            if (fs.existsSync(standalonePath)) {
              const raw = JSON.parse(fs.readFileSync(standalonePath, "utf-8"));
              const config = raw.config || raw;
              log2.info("\u4ECE\u72EC\u7ACB\u6587\u4EF6\u52A0\u8F7D\u914D\u7F6E: " + standalonePath);
              Project[PROPERTY_NAME] = migrateIfNeeded(config);
              return Project[PROPERTY_NAME];
            }
          } catch (e) {
            log2.error("\u5907\u9009\u914D\u7F6E\u8BFB\u53D6\u5931\u8D25", e);
          }
        }
        log2.info("\u521B\u5EFA\u7A7A\u767D\u914D\u7F6E");
        const blank = createBlankConfig();
        Project[PROPERTY_NAME] = blank;
        return blank;
      }
      function saveConfig() {
        if (!Project || Project === 0 || !Project[PROPERTY_NAME]) {
          log2.debug("saveConfig: \u9879\u76EE\u6216\u914D\u7F6E\u4E0D\u53EF\u7528\uFF0C\u8DF3\u8FC7\u4FDD\u5B58");
          return;
        }
        const config = Project[PROPERTY_NAME];
        const bbmodelPath = getBBModelPath();
        if (!bbmodelPath) {
          log2.warn("saveConfig: \u672A\u627E\u5230 .bbmodel \u8DEF\u5F84\uFF0C\u8DF3\u8FC7\u72EC\u7ACB\u5907\u4EFD");
          return;
        }
        const standalonePath = bbmodelPath.replace(/\.bbmodel$/i, ".mm_project.json");
        try {
          const fs = __require("fs");
          const path = __require("path");
          fs.writeFileSync(
            standalonePath,
            JSON.stringify({
              $schema_version: config_defaults.CONFIG_VERSION,
              bbmodel: path.basename(bbmodelPath),
              timestamp: Date.now(),
              config: {
                $schema_version: config.$schema_version,
                parts: config.parts,
                _uiState: config._uiState,
                contentPackPath: config.contentPackPath,
                dependencyPaths: config.dependencyPaths,
                packMeta: config.packMeta,
                namespace: config.namespace,
                modelFile: config.modelFile
              }
            }, null, 2),
            "utf-8"
          );
          log2.debug("saveConfig: \u72EC\u7ACB\u5907\u4EFD\u5DF2\u5199\u5165: " + standalonePath);
        } catch (e) {
          log2.error("saveConfig: \u5907\u9009\u914D\u7F6E\u5199\u5165\u5931\u8D25", e);
        }
        log2.info("\u914D\u7F6E\u5DF2\u4FDD\u5B58");
      }
      function setPackPath(config, packPath) {
        config.contentPackPath = packPath;
        return config;
      }
      function addDependencyPath(config, depPath) {
        if (!config.dependencyPaths) config.dependencyPaths = [];
        if (config.dependencyPaths.indexOf(depPath) === -1) {
          config.dependencyPaths.push(depPath);
        }
        return config;
      }
      function removeDependencyPath(config, depPath) {
        if (!config.dependencyPaths) return config;
        var idx = config.dependencyPaths.indexOf(depPath);
        if (idx !== -1) config.dependencyPaths.splice(idx, 1);
        return config;
      }
      function getConfig() {
        if (!Project || Project === 0) {
          log2.debug("getConfig: \u9879\u76EE\u4E0D\u53EF\u7528");
          return null;
        }
        var cfg = Project[PROPERTY_NAME] || null;
        log2.debug("getConfig: " + (cfg ? "\u6709\u914D\u7F6E" : "\u65E0\u914D\u7F6E"));
        return cfg;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          PROPERTY_NAME,
          registerProperty: registerProperty2,
          loadConfig,
          saveConfig,
          getConfig,
          setPackPath,
          addDependencyPath,
          removeDependencyPath
        };
      }
    }
  });

  // src/core/element_markers.js
  var require_element_markers = __commonJS({
    "src/core/element_markers.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { createLogger: createLogger2 } = require_logger();
      var { createSubPartConfig } = require_config();
      var log2 = createLogger2("Markers");
      var MARKER_TYPES = {
        sub_part: { label: "\u5B50\u96F6\u4EF6", icon: "fa-cube", color: "#4A90D9" },
        hit_box: { label: "\u78B0\u649E\u7BB1", icon: "fa-shield", color: "#D94A4A" },
        connector: { label: "\u8FDE\u63A5\u70B9", icon: "fa-plug", color: "#3AA83A" },
        interact_box: { label: "\u4EA4\u4E92\u533A", icon: "fa-hand-pointer", color: "#D9A441" }
      };
      var MARKER_TYPE_LIST = Object.keys(MARKER_TYPES);
      function getMarkerInfo(type) {
        return MARKER_TYPES[type] || null;
      }
      function getIconClass(type) {
        const info = getMarkerInfo(type);
        return info ? info.icon : "";
      }
      function getColor(type) {
        const info = getMarkerInfo(type);
        return info ? info.color : "#888888";
      }
      function getMarkerTypesForElement(element) {
        if (element instanceof Locator) {
          return ["connector"];
        } else if (element instanceof Group) {
          return ["sub_part", "hit_box", "interact_box"];
        }
        return [];
      }
      function getOrCreatePartConfig(projectConfig, partId) {
        if (!projectConfig.parts[partId]) {
          log2.debug("getOrCreatePartConfig: \u96F6\u4EF6\u4E0D\u5B58\u5728", { partId });
          return null;
        }
        return projectConfig.parts[partId];
      }
      function detectOwnerSubPart(projectConfig, partId, variantName, element) {
        var markers = getMarkersForVariant(projectConfig, partId, variantName);
        var el = element;
        while (el) {
          if (el instanceof Group) {
            var marker = markers[el.uuid];
            if (marker && marker.type === "sub_part") {
              return {
                spKey: marker.config_ref || el.name,
                spName: el.name
              };
            }
          }
          el = el.parent;
        }
        return null;
      }
      function setMarker(projectConfig, partId, variantName, uuid, type, configRef) {
        const part = getOrCreatePartConfig(projectConfig, partId);
        if (!part) {
          log2.warn("setMarker: \u96F6\u4EF6\u4E0D\u5B58\u5728", { partId, uuid, type });
          return false;
        }
        if (!part.element_markers) {
          part.element_markers = {};
        }
        if (!part.element_markers[variantName]) {
          part.element_markers[variantName] = {};
        }
        var oldMarker = part.element_markers[variantName][uuid];
        if (oldMarker && oldMarker.type !== type) {
          log2.debug("setMarker: \u68C0\u6D4B\u5230\u6807\u8BB0\u7C7B\u578B\u53D8\u66F4\uFF0C\u6E05\u7406\u65E7\u6807\u8BB0\u526F\u4F5C\u7528", {
            partId,
            variant: variantName,
            uuid,
            oldType: oldMarker.type,
            newType: type,
            oldConfigRef: oldMarker.config_ref
          });
          if (oldMarker.type === "hit_box" && oldMarker.config_ref) {
            var oldVariant = part.variants && part.variants[variantName];
            if (oldVariant && oldVariant.sub_parts && oldVariant.sub_parts[oldMarker.config_ref]) {
              var oldSp = oldVariant.sub_parts[oldMarker.config_ref];
              if (oldSp.hit_boxes) {
                if (oldSp.hit_boxes[uuid] !== void 0) {
                  delete oldSp.hit_boxes[uuid];
                  log2.debug("setMarker: \u8986\u76D6\u65E7 hit_box \u6807\u8BB0\uFF0C\u5DF2\u6E05\u7406 hit_boxes \u6761\u76EE", {
                    partId,
                    variant: variantName,
                    spKey: oldMarker.config_ref,
                    uuid
                  });
                }
              }
            }
          } else if (oldMarker.type === "interact_box") {
            var oldVariantIb = part.variants && part.variants[variantName];
            if (oldVariantIb && oldVariantIb.sub_parts) {
              for (var skIb in oldVariantIb.sub_parts) {
                var spIb = oldVariantIb.sub_parts[skIb];
                if (spIb && spIb.interact_boxes) {
                  for (var ibKey in spIb.interact_boxes) {
                    if (spIb.interact_boxes[ibKey]._uuid === uuid) {
                      delete spIb.interact_boxes[ibKey];
                      log2.debug("setMarker: \u8986\u76D6\u65E7 interact_box \u6807\u8BB0\uFF0C\u5DF2\u6E05\u7406 interact_boxes \u6761\u76EE", {
                        partId,
                        variant: variantName,
                        spKey: skIb,
                        ibKey
                      });
                    }
                  }
                }
              }
            }
          } else if (oldMarker.type === "connector") {
            log2.warn("setMarker: \u8986\u76D6\u65E7 connector \u6807\u8BB0\uFF0C\u4F46\u672A\u6E05\u7406 connectors \u6761\u76EE", {
              partId,
              variant: variantName,
              uuid,
              oldConfigRef: oldMarker.config_ref
            });
          } else if (oldMarker.type === "sub_part" && oldMarker.config_ref) {
            var oldVariant2 = part.variants && part.variants[variantName];
            if (oldVariant2 && oldVariant2.sub_parts && oldVariant2.sub_parts[oldMarker.config_ref]) {
              delete oldVariant2.sub_parts[oldMarker.config_ref];
              log2.debug("setMarker: \u8986\u76D6\u65E7 sub_part \u6807\u8BB0\uFF0C\u5DF2\u6E05\u7406 sub_parts \u6761\u76EE", {
                partId,
                variant: variantName,
                spKey: oldMarker.config_ref
              });
              recalcAutoEndBones(projectConfig, partId, variantName);
            }
          }
        }
        if (type === "sub_part" && configRef) {
          const variant = part.variants && part.variants[variantName];
          if (variant) {
            const spKey = configRef;
            if (!variant.sub_parts) {
              variant.sub_parts = {};
            }
            if (!variant.sub_parts[spKey]) {
              var groupEl = typeof Group !== "undefined" ? Group.all.find(function(g) {
                return g.uuid === uuid;
              }) : null;
              const spConfig = createSubPartConfig();
              spConfig.start_bone = groupEl ? groupEl.name : configRef;
              variant.sub_parts[spKey] = spConfig;
              log2.debug("setMarker: \u5DF2\u521B\u5EFA\u5B50\u96F6\u4EF6\u914D\u7F6E", { partId, variant: variantName, key: spKey, start_bone: spConfig.start_bone });
            }
            configRef = spKey;
          }
        }
        part.element_markers[variantName][uuid] = {
          type,
          config_ref: configRef || null
        };
        if (type === "sub_part") {
          recalcAutoEndBones(projectConfig, partId, variantName);
        }
        log2.debug("setMarker: \u6807\u8BB0\u5DF2\u8BBE\u7F6E", { partId, variant: variantName, uuid, type });
        return true;
      }
      function clearMarker(projectConfig, partId, variantName, uuid) {
        const part = getOrCreatePartConfig(projectConfig, partId);
        if (!part || !part.element_markers) {
          log2.debug("clearMarker: \u96F6\u4EF6\u6216\u65E0\u6807\u8BB0", { partId, uuid });
          return false;
        }
        if (!part.element_markers[variantName]) {
          log2.debug("clearMarker: \u53D8\u4F53\u65E0\u6807\u8BB0", { variant: variantName, uuid });
          return false;
        }
        var marker = part.element_markers[variantName][uuid];
        log2.debug("clearMarker: \u5F00\u59CB\u6E05\u9664\u6807\u8BB0", {
          partId,
          variant: variantName,
          uuid,
          markerType: marker ? marker.type : "N/A",
          configRef: marker ? marker.config_ref : "N/A"
        });
        if (marker && marker.type === "hit_box" && marker.config_ref) {
          var variant = part.variants && part.variants[variantName];
          if (variant && variant.sub_parts && variant.sub_parts[marker.config_ref]) {
            var sp = variant.sub_parts[marker.config_ref];
            var hitBoxesBefore = sp.hit_boxes ? Object.keys(sp.hit_boxes) : [];
            if (sp.hit_boxes) {
              var found = sp.hit_boxes[uuid] !== void 0;
              delete sp.hit_boxes[uuid];
              log2.debug("clearMarker: \u78B0\u649E\u7BB1\u6761\u76EE\u6E05\u7406", {
                partId,
                variant: variantName,
                spKey: marker.config_ref,
                uuid,
                wasFound: found,
                hitBoxesBefore,
                hitBoxesAfter: Object.keys(sp.hit_boxes),
                stillHasKey: sp.hit_boxes[uuid] !== void 0
              });
            }
          } else {
            log2.debug("clearMarker: \u78B0\u649E\u7BB1\u6240\u5C5E\u5B50\u96F6\u4EF6\u4E0D\u5B58\u5728\uFF0C\u8DF3\u8FC7", {
              partId,
              variant: variantName,
              spKey: marker.config_ref,
              variantExists: !!variant,
              subPartsExists: variant ? !!variant.sub_parts : false,
              spExists: variant && variant.sub_parts ? !!variant.sub_parts[marker.config_ref] : false
            });
          }
        }
        if (marker && marker.type === "interact_box") {
          var variantIb = part.variants && part.variants[variantName];
          var foundIb = false;
          if (variantIb && variantIb.sub_parts) {
            for (var skIb in variantIb.sub_parts) {
              var spIb = variantIb.sub_parts[skIb];
              if (spIb && spIb.interact_boxes) {
                for (var ibKey in spIb.interact_boxes) {
                  if (spIb.interact_boxes[ibKey]._uuid === uuid) {
                    delete spIb.interact_boxes[ibKey];
                    foundIb = true;
                    log2.debug("clearMarker: \u4EA4\u4E92\u533A\u6761\u76EE\u6E05\u7406", {
                      partId,
                      variant: variantName,
                      spKey: skIb,
                      ibKey,
                      uuid
                    });
                    break;
                  }
                }
              }
              if (foundIb) break;
            }
          }
          if (!foundIb) {
            log2.debug("clearMarker: \u4EA4\u4E92\u533A\u672A\u627E\u5230\u5339\u914D\u6761\u76EE", {
              partId,
              variant: variantName,
              uuid
            });
          }
        }
        if (marker && marker.type === "connector") {
          var variant = part.variants && part.variants[variantName];
          var foundAnyMatch = false;
          if (variant && variant.sub_parts) {
            var el = typeof Locator !== "undefined" && Locator.all ? Locator.all.find(function(l) {
              return l.uuid === uuid;
            }) : null;
            log2.debug("clearMarker: \u8FDE\u63A5\u70B9 Locator \u67E5\u627E\u7ED3\u679C", {
              uuid,
              locatorFound: !!el,
              locatorName: el ? el.name : null,
              subPartCount: Object.keys(variant.sub_parts).length,
              subPartKeys: Object.keys(variant.sub_parts)
            });
            if (el) {
              for (var sk in variant.sub_parts) {
                if (variant.sub_parts[sk].connectors) {
                  var connKeysBefore = Object.keys(variant.sub_parts[sk].connectors);
                  for (var connKey in variant.sub_parts[sk].connectors) {
                    var conn = variant.sub_parts[sk].connectors[connKey];
                    if (conn.locator === el.name) {
                      delete variant.sub_parts[sk].connectors[connKey];
                      foundAnyMatch = true;
                      log2.debug("clearMarker: \u8FDE\u63A5\u70B9\u6761\u76EE\u6E05\u7406", {
                        partId,
                        variant: variantName,
                        spKey: sk,
                        connKey,
                        locator: el.name,
                        connKeysBefore,
                        connKeysAfter: Object.keys(variant.sub_parts[sk].connectors)
                      });
                      break;
                    }
                  }
                  if (!foundAnyMatch) {
                    var connEntries = {};
                    for (var ck in variant.sub_parts[sk].connectors) {
                      connEntries[ck] = variant.sub_parts[sk].connectors[ck].locator;
                    }
                    log2.debug("clearMarker: \u8FDE\u63A5\u70B9\u672A\u5339\u914D\u5230\u4EFB\u4F55\u6761\u76EE\uFF08\u5B50\u96F6\u4EF6 " + sk + "\uFF09", {
                      targetLocator: el.name,
                      existingConnectorLocators: connEntries
                    });
                  }
                }
              }
            }
          }
          if (!foundAnyMatch) {
            log2.warn("clearMarker: \u8FDE\u63A5\u70B9\u6807\u8BB0\u6E05\u9664\u4F46\u672A\u627E\u5230\u5339\u914D\u7684\u5B50\u96F6\u4EF6\u8FDE\u63A5\u70B9\u6761\u76EE", {
              partId,
              variant: variantName,
              uuid,
              locatorName: el ? el.name : "unknown"
            });
          }
        }
        if (marker && marker.type === "sub_part" && marker.config_ref) {
          var spKey = marker.config_ref;
          var variant = part.variants && part.variants[variantName];
          if (variant && variant.sub_parts) {
            delete variant.sub_parts[spKey];
            log2.debug("clearMarker: \u5DF2\u6E05\u7406 sub_parts \u6761\u76EE", { partId, variant: variantName, spKey });
            recalcAutoEndBones(projectConfig, partId, variantName);
          }
        }
        delete part.element_markers[variantName][uuid];
        log2.debug("clearMarker: \u6807\u8BB0\u5DF2\u4ECE element_markers \u5B57\u5178\u5220\u9664", {
          partId,
          variant: variantName,
          uuid,
          remainingMarkers: Object.keys(part.element_markers[variantName] || {})
        });
        if (Object.keys(part.element_markers[variantName]).length === 0) {
          delete part.element_markers[variantName];
          log2.debug("clearMarker: \u53D8\u4F53\u6807\u8BB0\u5B57\u5178\u5DF2\u6E05\u7A7A", { partId, variant: variantName });
        }
        var variant = part.variants && part.variants[variantName];
        if (variant && variant.sub_parts) {
          var stateSummary = {};
          for (var spKey in variant.sub_parts) {
            var sp = variant.sub_parts[spKey];
            stateSummary[spKey] = {
              hitBoxKeys: sp.hit_boxes ? Object.keys(sp.hit_boxes) : [],
              interactBoxKeys: sp.interact_boxes ? Object.keys(sp.interact_boxes) : [],
              connectorKeys: sp.connectors ? Object.keys(sp.connectors) : []
            };
          }
          log2.debug("clearMarker: \u6E05\u7406\u540E sub_parts \u72B6\u6001\u6458\u8981", {
            partId,
            variant: variantName,
            subParts: stateSummary
          });
        }
        return true;
      }
      function recalcAutoEndBones(projectConfig, partId, variantName) {
        var part = getOrCreatePartConfig(projectConfig, partId);
        if (!part) return;
        var variant = part.variants && part.variants[variantName];
        if (!variant || !variant.sub_parts) return;
        var markers = getMarkersForVariant(projectConfig, partId, variantName);
        var subPartGroups = {};
        var allGroups = typeof Group !== "undefined" ? Group.all : [];
        for (var i = 0; i < allGroups.length; i++) {
          var grp = allGroups[i];
          var marker = markers[grp.uuid];
          if (marker && marker.type === "sub_part") {
            subPartGroups[grp.uuid] = {
              group: grp,
              name: marker.config_ref || grp.name
            };
          }
        }
        for (var spKey in variant.sub_parts) {
          variant.sub_parts[spKey].auto_end_bones = [];
        }
        for (var uuid in subPartGroups) {
          var grp = subPartGroups[uuid].group;
          var childName = subPartGroups[uuid].name;
          var el = grp.parent;
          while (el) {
            if (el instanceof Group && subPartGroups[el.uuid]) {
              var ancestorMarker = markers[el.uuid];
              var ancestorKey = ancestorMarker ? ancestorMarker.config_ref || el.name : el.name;
              if (variant.sub_parts[ancestorKey]) {
                if (variant.sub_parts[ancestorKey].auto_end_bones.indexOf(childName) === -1) {
                  variant.sub_parts[ancestorKey].auto_end_bones.push(childName);
                  log2.debug("recalcAutoEndBones: " + childName + " \u2192 " + ancestorKey + ".auto_end_bones");
                }
              }
              break;
            }
            el = el.parent;
          }
        }
        log2.debug("recalcAutoEndBones: \u5B8C\u6210", {
          partId,
          variant: variantName,
          subParts: Object.keys(variant.sub_parts).map(function(k) {
            return k + "[" + variant.sub_parts[k].auto_end_bones.join(",") + "]";
          })
        });
      }
      function getMarker(projectConfig, partId, variantName, uuid) {
        const part = getOrCreatePartConfig(projectConfig, partId);
        if (!part || !part.element_markers) return null;
        const variantMarkers = part.element_markers[variantName];
        if (!variantMarkers) return null;
        return variantMarkers[uuid] || null;
      }
      function clearAllMarkers(projectConfig, partId, variantName) {
        const part = getOrCreatePartConfig(projectConfig, partId);
        if (!part || !part.element_markers) {
          log2.debug("clearAllMarkers: \u65E0\u53EF\u6E05\u9664\u6807\u8BB0");
          return;
        }
        if (variantName) {
          delete part.element_markers[variantName];
          log2.debug("clearAllMarkers: \u5DF2\u6E05\u9664\u53D8\u4F53\u6240\u6709\u6807\u8BB0", { partId, variant: variantName });
        } else {
          part.element_markers = {};
          log2.debug("clearAllMarkers: \u5DF2\u6E05\u9664\u96F6\u4EF6\u6240\u6709\u6807\u8BB0", { partId });
        }
      }
      function getMarkersForVariant(projectConfig, partId, variantName) {
        const part = getOrCreatePartConfig(projectConfig, partId);
        if (!part || !part.element_markers) return {};
        var markers = part.element_markers[variantName] || {};
        log2.debug("getMarkersForVariant: \u83B7\u53D6\u53D8\u4F53\u6807\u8BB0", {
          partId,
          variant: variantName,
          count: Object.keys(markers).length
        });
        return markers;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          MARKER_TYPES,
          MARKER_TYPE_LIST,
          getMarkerInfo,
          getIconClass,
          getColor,
          getMarkerTypesForElement,
          setMarker,
          clearMarker,
          getMarker,
          clearAllMarkers,
          getMarkersForVariant,
          detectOwnerSubPart,
          recalcAutoEndBones
        };
      }
    }
  });

  // src/utils/notify.js
  var require_notify = __commonJS({
    "src/utils/notify.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("Notify");
      var TOAST_COLORS = {
        positive: "#4CAF50",
        error: "#F44336",
        warning: "#FF9800",
        info: "#2196F3"
      };
      function showToast2(text, type, expire) {
        const color = TOAST_COLORS[type] || TOAST_COLORS.info;
        try {
          Blockbench.showToastNotification({
            text: String(text),
            color,
            expire: expire || 3e3
          });
        } catch (e) {
          log2.error("Toast \u901A\u77E5\u5931\u8D25", e);
        }
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = { showToast: showToast2, TOAST_COLORS };
      }
    }
  });

  // src/utils/file_writer.js
  var require_file_writer = __commonJS({
    "src/utils/file_writer.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var fs = __require("fs");
      var path = __require("path");
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("FileWriter");
      function ensureDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
          log2.debug("ensureDir: \u5DF2\u521B\u5EFA\u76EE\u5F55 " + dirPath);
        }
      }
      function writeJSONFile(dir, filename, data) {
        try {
          ensureDir(dir);
          const filePath = path.join(dir, filename);
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
          log2.debug("writeJSONFile: \u5DF2\u5199\u5165 " + filePath);
          return filePath;
        } catch (e) {
          log2.error("writeJSONFile: \u5199\u5165\u5931\u8D25 " + path.join(dir, filename), e);
          throw e;
        }
      }
      function writeTextFile(dir, filename, text) {
        try {
          ensureDir(dir);
          const filePath = path.join(dir, filename);
          fs.writeFileSync(filePath, text, "utf-8");
          log2.debug("writeTextFile: \u5DF2\u5199\u5165 " + filePath);
          return filePath;
        } catch (e) {
          log2.error("writeTextFile: \u5199\u5165\u5931\u8D25 " + path.join(dir, filename), e);
          throw e;
        }
      }
      function readJSONFile(filePath) {
        if (!fs.existsSync(filePath)) {
          log2.debug("readJSONFile: \u6587\u4EF6\u4E0D\u5B58\u5728 " + filePath);
          return null;
        }
        try {
          const raw = fs.readFileSync(filePath, "utf-8");
          const data = JSON.parse(raw);
          log2.debug("readJSONFile: \u5DF2\u8BFB\u53D6 " + filePath);
          return data;
        } catch (e) {
          log2.error("readJSONFile: \u8BFB\u53D6\u5931\u8D25 " + filePath, e);
          return null;
        }
      }
      function fileExists(filePath) {
        var exists = fs.existsSync(filePath);
        log2.debug("fileExists: " + filePath + " \u2192 " + exists);
        return exists;
      }
      function _deletePermanent(filePath) {
        if (process.platform === "win32") {
          try {
            var cp = __require("child_process");
            var psCmd = 'try { [System.IO.File]::Delete("' + filePath.replace(/\\/g, "\\\\") + '") } catch {}';
            cp.spawnSync(
              "powershell.exe",
              [
                "-NoProfile",
                "-NonInteractive",
                "-ExecutionPolicy",
                "Bypass",
                "-Command",
                psCmd
              ],
              { timeout: 1e4 }
            );
            log2.debug("_deletePermanent: File::Delete " + filePath);
            return;
          } catch (_e) {
            log2.debug("_deletePermanent: child_process \u4E0D\u53EF\u7528\uFF0C\u964D\u7EA7\u5230 fs.unlinkSync: " + _e.message);
          }
        } else {
          log2.debug("_deletePermanent: \u975E Windows \u5E73\u53F0\uFF0C\u4F7F\u7528 fs.unlinkSync");
        }
        fs.unlinkSync(filePath);
        log2.debug("_deletePermanent: fs.unlinkSync \u5220\u9664 " + filePath);
      }
      function deleteFile(filePath) {
        if (fs.existsSync(filePath)) {
          _deletePermanent(filePath);
          log2.debug("deleteFile: \u5DF2\u5220\u9664 " + filePath);
        } else {
          log2.debug("deleteFile: \u6587\u4EF6\u4E0D\u5B58\u5728\uFF0C\u8DF3\u8FC7 " + filePath);
        }
      }
      function extractResourceLocation(id, defaultNs) {
        var str = id || "";
        var colonIdx = str.indexOf(":");
        if (colonIdx >= 0) {
          return {
            ns: str.substring(0, colonIdx),
            path: str.substring(colonIdx + 1)
          };
        }
        return { ns: defaultNs || "", path: str };
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = { ensureDir, writeJSONFile, writeTextFile, readJSONFile, fileExists, deleteFile, extractResourceLocation };
      }
    }
  });

  // src/core/zip_reader.js
  var require_zip_reader = __commonJS({
    "src/core/zip_reader.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var fs = __require("fs");
      var zlib = __require("zlib");
      var path = __require("path");
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("ZipReader");
      var SIG_LOCAL_FILE = 67324752;
      var SIG_CENTRAL_DIR = 33639248;
      var SIG_EOCD = 101010256;
      var LOCAL_HEADER_MIN = 30;
      var CENTRAL_DIR_MIN = 46;
      var EOCD_MIN = 22;
      var EOCD_MAX_SEARCH = 65557;
      var METHOD_STORED = 0;
      var METHOD_DEFLATED = 8;
      function readUInt32LE(buf, offset) {
        return buf.readUInt32LE(offset);
      }
      function readUInt16LE(buf, offset) {
        return buf.readUInt16LE(offset);
      }
      function findSignatureFromEnd(buf, signature) {
        var i;
        for (i = buf.length - 4; i >= 0; i--) {
          if (readUInt32LE(buf, i) === signature) {
            return i;
          }
        }
        return -1;
      }
      function normalizeZipPath(p) {
        if (!p) return "";
        return p.replace(/\\/g, "/");
      }
      function _parseEOCD(fd, fileSize) {
        var searchSize, searchBuf, eocdOffset, cdCount, cdSize, cdOffset;
        if (fileSize < EOCD_MIN) {
          log2.warn("_parseEOCD: \u6587\u4EF6\u592A\u5C0F\uFF0C\u4E0D\u662F\u6709\u6548 ZIP");
          return null;
        }
        searchSize = Math.min(EOCD_MAX_SEARCH, fileSize);
        searchBuf = Buffer.alloc(searchSize);
        fs.readSync(fd, searchBuf, 0, searchSize, fileSize - searchSize);
        eocdOffset = findSignatureFromEnd(searchBuf, SIG_EOCD);
        if (eocdOffset < 0) {
          log2.warn("_parseEOCD: \u672A\u627E\u5230 EOCD \u7B7E\u540D");
          return null;
        }
        if (eocdOffset + EOCD_MIN > searchBuf.length) {
          log2.warn("_parseEOCD: EOCD \u6570\u636E\u4E0D\u5B8C\u6574");
          return null;
        }
        cdCount = readUInt16LE(searchBuf, eocdOffset + 10);
        cdSize = readUInt32LE(searchBuf, eocdOffset + 12);
        cdOffset = readUInt32LE(searchBuf, eocdOffset + 16);
        log2.debug("_parseEOCD: \u4E2D\u592E\u76EE\u5F55\u504F\u79FB=" + cdOffset + " \u5927\u5C0F=" + cdSize + " \u6761\u76EE=" + cdCount);
        return { cdOffset, cdSize, cdCount };
      }
      function _parseCentralDirectory(fd, cdOffset, cdSize) {
        var cdBuf, pos, fileIndex, sig, method, compressedSize, uncompressedSize, localOffset;
        var fileNameLen, extraLen, commentLen, fileName;
        cdBuf = Buffer.alloc(cdSize);
        fs.readSync(fd, cdBuf, 0, cdSize, cdOffset);
        fileIndex = {};
        pos = 0;
        while (pos + CENTRAL_DIR_MIN <= cdBuf.length) {
          sig = readUInt32LE(cdBuf, pos);
          if (sig !== SIG_CENTRAL_DIR) {
            break;
          }
          method = readUInt16LE(cdBuf, pos + 10);
          compressedSize = readUInt32LE(cdBuf, pos + 20);
          uncompressedSize = readUInt32LE(cdBuf, pos + 24);
          fileNameLen = readUInt16LE(cdBuf, pos + 28);
          extraLen = readUInt16LE(cdBuf, pos + 30);
          commentLen = readUInt16LE(cdBuf, pos + 32);
          localOffset = readUInt32LE(cdBuf, pos + 42);
          if (pos + CENTRAL_DIR_MIN + fileNameLen > cdBuf.length) break;
          fileName = normalizeZipPath(cdBuf.toString("utf-8", pos + CENTRAL_DIR_MIN, pos + CENTRAL_DIR_MIN + fileNameLen));
          if (fileName.length > 0 && !fileName.endsWith("/")) {
            fileIndex[fileName] = {
              method,
              compressedSize,
              uncompressedSize,
              localOffset
            };
          }
          pos += CENTRAL_DIR_MIN + fileNameLen + extraLen + commentLen;
        }
        log2.debug("_parseCentralDirectory: \u5DF2\u7D22\u5F15 " + Object.keys(fileIndex).length + " \u4E2A\u6587\u4EF6");
        return fileIndex;
      }
      function _readFileData(fd, entry) {
        var headerBuf, fileNameLen, extraLen, dataStart, compressedBuf, result;
        headerBuf = Buffer.alloc(LOCAL_HEADER_MIN);
        fs.readSync(fd, headerBuf, 0, LOCAL_HEADER_MIN, entry.localOffset);
        if (readUInt32LE(headerBuf, 0) !== SIG_LOCAL_FILE) {
          log2.warn("_readFileData: \u672C\u5730\u6587\u4EF6\u5934\u7B7E\u540D\u65E0\u6548\uFF0C\u504F\u79FB=" + entry.localOffset);
          return null;
        }
        fileNameLen = readUInt16LE(headerBuf, 26);
        extraLen = readUInt16LE(headerBuf, 28);
        dataStart = entry.localOffset + LOCAL_HEADER_MIN + fileNameLen + extraLen;
        compressedBuf = Buffer.alloc(entry.compressedSize);
        fs.readSync(fd, compressedBuf, 0, entry.compressedSize, dataStart);
        switch (entry.method) {
          case METHOD_STORED:
            result = compressedBuf;
            break;
          case METHOD_DEFLATED:
            try {
              result = zlib.inflateRawSync(compressedBuf);
            } catch (e) {
              log2.warn("_readFileData: deflate \u89E3\u538B\u5931\u8D25", e);
              return null;
            }
            break;
          default:
            log2.warn("_readFileData: \u4E0D\u652F\u6301\u7684\u538B\u7F29\u65B9\u6CD5 " + entry.method);
            return null;
        }
        return result;
      }
      function openZip(zipPath) {
        var stat, fd, eocd, fileIndex;
        try {
          stat = fs.statSync(zipPath);
          if (!stat.isFile()) {
            log2.warn("openZip: \u4E0D\u662F\u666E\u901A\u6587\u4EF6 " + zipPath);
            return null;
          }
        } catch (e) {
          log2.warn("openZip: \u6587\u4EF6\u4E0D\u5B58\u5728\u6216\u65E0\u6CD5\u8BBF\u95EE " + zipPath, e);
          return null;
        }
        try {
          fd = fs.openSync(zipPath, "r");
        } catch (e) {
          log2.warn("openZip: \u65E0\u6CD5\u6253\u5F00\u6587\u4EF6 " + zipPath, e);
          return null;
        }
        try {
          eocd = _parseEOCD(fd, stat.size);
          if (!eocd) {
            log2.warn("openZip: \u65E0\u6CD5\u89E3\u6790 EOCD\uFF0C\u53EF\u80FD\u4E0D\u662F\u6709\u6548 ZIP \u6587\u4EF6");
            return null;
          }
          fileIndex = _parseCentralDirectory(fd, eocd.cdOffset, eocd.cdSize);
          if (!fileIndex) {
            log2.warn("openZip: \u65E0\u6CD5\u89E3\u6790\u4E2D\u592E\u76EE\u5F55");
            return null;
          }
        } finally {
          try {
            fs.closeSync(fd);
          } catch (e) {
          }
        }
        function getContent(internalPath) {
          var normalized, entry, fd2, data;
          normalized = normalizeZipPath(internalPath);
          entry = fileIndex[normalized];
          if (!entry) {
            log2.debug("getContent: \u6587\u4EF6\u4E0D\u5728 ZIP \u4E2D: " + normalized);
            return null;
          }
          try {
            fd2 = fs.openSync(zipPath, "r");
          } catch (e) {
            log2.warn("getContent: \u65E0\u6CD5\u6253\u5F00 ZIP \u6587\u4EF6\u8FDB\u884C\u8BFB\u53D6", e);
            return null;
          }
          try {
            data = _readFileData(fd2, entry);
            return data;
          } finally {
            try {
              fs.closeSync(fd2);
            } catch (e) {
            }
          }
        }
        function listFiles2() {
          return Object.keys(fileIndex).sort();
        }
        log2.info("openZip: \u6210\u529F\u6253\u5F00 ZIP\uFF0C\u5171 " + Object.keys(fileIndex).length + " \u4E2A\u6587\u4EF6");
        return {
          files: fileIndex,
          getContent,
          listFiles: listFiles2
        };
      }
      function readFileContent(zipPath, internalPath) {
        var handle, content;
        handle = openZip(zipPath);
        if (!handle) return null;
        content = handle.getContent(internalPath);
        return content;
      }
      function listFiles(zipPath) {
        var handle;
        handle = openZip(zipPath);
        if (!handle) return [];
        return handle.listFiles();
      }
      function fileExists(zipPath, internalPath) {
        var handle, normalized;
        handle = openZip(zipPath);
        if (!handle) return false;
        normalized = normalizeZipPath(internalPath);
        return handle.files.hasOwnProperty(normalized);
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          openZip,
          readFileContent,
          listFiles,
          fileExists
        };
      }
    }
  });

  // src/core/content_pack.js
  var require_content_pack = __commonJS({
    "src/core/content_pack.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var fs = __require("fs");
      var path = __require("path");
      var { createLogger: createLogger2 } = require_logger();
      var {
        ensureDir,
        writeJSONFile,
        readJSONFile,
        fileExists,
        deleteFile,
        extractResourceLocation
      } = require_file_writer();
      var zip_reader = require_zip_reader();
      var log2 = createLogger2("ContentPack");
      var ROOT = path.join(__dirname, "..", "..");
      var SCHEMAS_DIR = path.join(ROOT, "schemas");
      function walkDefFiles(dir, ext) {
        var results, entries, i, j, entryName, fullPath, stat, subResults, defId;
        results = [];
        if (!fs.existsSync(dir)) return results;
        try {
          entries = fs.readdirSync(dir);
          for (i = 0; i < entries.length; i++) {
            entryName = entries[i];
            fullPath = path.join(dir, entryName);
            stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              subResults = walkDefFiles(fullPath, ext);
              for (j = 0; j < subResults.length; j++) {
                results.push(subResults[j]);
              }
            } else if (path.extname(entryName) === ext) {
              defId = path.basename(entryName, ext);
              results.push({ filePath: fullPath, id: defId });
            }
          }
        } catch (e) {
          log2.warn("walkDefFiles: \u904D\u5386\u76EE\u5F55\u5931\u8D25 " + dir, e);
        }
        return results;
      }
      function copyDirRecursive(srcDir, destDir) {
        var entries, i, srcPath, destPath, stat;
        if (!fs.existsSync(srcDir)) {
          log2.warn("copyDirRecursive: \u6E90\u76EE\u5F55\u4E0D\u5B58\u5728 " + srcDir);
          return;
        }
        ensureDir(destDir);
        entries = fs.readdirSync(srcDir);
        for (i = 0; i < entries.length; i++) {
          srcPath = path.join(srcDir, entries[i]);
          destPath = path.join(destDir, entries[i]);
          stat = fs.statSync(srcPath);
          if (stat.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
          } else {
            try {
              fs.writeFileSync(destPath, fs.readFileSync(srcPath));
              log2.debug("copyDirRecursive: \u5DF2\u590D\u5236 " + srcPath + " \u2192 " + destPath);
            } catch (e) {
              log2.warn("copyDirRecursive: \u590D\u5236\u6587\u4EF6\u5931\u8D25 " + srcPath, e);
            }
          }
        }
      }
      function _isZipPath(p) {
        if (!p || typeof p !== "string") return false;
        return p.toLowerCase().endsWith(".zip");
      }
      function _readZipDefs(zipPath, namespace, type) {
        var handle, allFiles, prefix, i, filePath, contentStr, defId, parsed;
        var result = {};
        handle = zip_reader.openZip(zipPath);
        if (!handle) {
          log2.warn("_readZipDefs: \u65E0\u6CD5\u6253\u5F00 ZIP " + zipPath);
          return result;
        }
        allFiles = handle.listFiles();
        prefix = namespace + "/" + type + "/";
        for (i = 0; i < allFiles.length; i++) {
          filePath = allFiles[i];
          if (filePath.indexOf(prefix) !== 0) continue;
          if (!filePath.endsWith(".json")) continue;
          defId = path.basename(filePath, ".json");
          if (!defId) continue;
          try {
            contentStr = handle.getContent(filePath);
            if (!contentStr) {
              log2.warn("_readZipDefs: \u65E0\u6CD5\u8BFB\u53D6 " + filePath);
              continue;
            }
            parsed = JSON.parse(contentStr.toString("utf-8"));
            result[defId] = parsed;
            log2.debug("_readZipDefs: \u5DF2\u8BFB\u53D6 " + filePath);
          } catch (e) {
            log2.warn("_readZipDefs: JSON \u89E3\u6790\u5931\u8D25\uFF0C\u8DF3\u8FC7 " + filePath, e);
          }
        }
        log2.info("_readZipDefs: " + type + " \u4ECE ZIP \u8BFB\u53D6\u5B8C\u6210\uFF0C\u5171 " + Object.keys(result).length + " \u4E2A\u5B9A\u4E49");
        return result;
      }
      function resolveNamespace(packId) {
        var str = packId || "";
        var colonIdx = str.indexOf(":");
        if (colonIdx >= 0) {
          return str.substring(0, colonIdx);
        }
        return str;
      }
      function readPackMeta(packPath) {
        var metaPath, meta, raw;
        if (_isZipPath(packPath)) {
          raw = zip_reader.readFileContent(packPath, "meta.json");
          if (!raw) {
            log2.warn("readPackMeta: ZIP \u4E2D\u672A\u627E\u5230 meta.json: " + packPath);
            return null;
          }
          try {
            meta = JSON.parse(raw.toString("utf-8"));
            log2.debug("readPackMeta: \u5DF2\u4ECE ZIP \u8BFB\u53D6 meta.json: " + packPath);
            return meta;
          } catch (e) {
            log2.warn("readPackMeta: ZIP \u4E2D meta.json \u89E3\u6790\u5931\u8D25: " + packPath, e);
            return null;
          }
        }
        metaPath = path.join(packPath, "meta.json");
        meta = readJSONFile(metaPath);
        if (meta === null) {
          log2.warn("readPackMeta: \u8BFB\u53D6\u5931\u8D25\u6216\u6587\u4EF6\u4E0D\u5B58\u5728 " + metaPath);
        } else {
          log2.debug("readPackMeta: \u5DF2\u8BFB\u53D6 " + metaPath);
        }
        return meta;
      }
      function writePackMeta(dirPath, meta) {
        try {
          writeJSONFile(dirPath, "meta.json", meta);
          log2.debug("writePackMeta: meta.json \u5DF2\u5199\u5165 " + dirPath);
        } catch (e) {
          log2.error("writePackMeta: \u5199\u5165\u5931\u8D25 " + dirPath, e);
          throw e;
        }
      }
      function createContentPack(dirPath, meta) {
        var metaPath, namespace, nsDir, docsDir;
        try {
          metaPath = path.join(dirPath, "meta.json");
          if (fileExists(metaPath)) {
            throw new Error("\u76EE\u5F55\u5DF2\u5305\u542B meta.json\uFF0C\u4E3A\u9632\u6B62\u8986\u76D6\u8BF7\u4F7F\u7528\u5176\u4ED6\u76EE\u5F55: " + dirPath);
          }
          namespace = resolveNamespace(meta.id || "");
          if (!namespace) {
            return { success: false, namespace: "", error: "meta.id \u4E3A\u7A7A\u6216\u65E0\u6CD5\u89E3\u6790 namespace" };
          }
          ensureDir(dirPath);
          nsDir = path.join(dirPath, namespace);
          ensureDir(path.join(nsDir, "materials"));
          ensureDir(path.join(nsDir, "connectors"));
          ensureDir(path.join(nsDir, "subsystems"));
          writePackMeta(dirPath, meta);
          docsDir = path.join(nsDir, "docs");
          copyDirRecursive(SCHEMAS_DIR, docsDir);
          log2.info("createContentPack: \u5DF2\u590D\u5236 schemas \u5230 " + docsDir);
          log2.info("createContentPack: \u5185\u5BB9\u5305\u521B\u5EFA\u6210\u529F", { path: dirPath, namespace });
          return { success: true, namespace, error: null };
        } catch (e) {
          log2.error("createContentPack: \u521B\u5EFA\u5931\u8D25", e);
          return { success: false, namespace: "", error: e.message };
        }
      }
      function openContentPack(packPath) {
        var meta, namespace, allFiles, i, hasMat, hasConn, hasSub;
        if (_isZipPath(packPath)) {
          try {
            meta = readPackMeta(packPath);
            if (meta === null) {
              return { valid: false, meta: null, namespace: "", error: "ZIP \u4E2D meta.json \u8BFB\u53D6\u5931\u8D25\u6216\u4E0D\u5B58\u5728" };
            }
            if (!meta.id) {
              return { valid: false, meta, namespace: "", error: "meta.id \u4E3A\u7A7A" };
            }
            namespace = resolveNamespace(meta.id);
            if (!namespace) {
              return { valid: false, meta, namespace: "", error: "\u65E0\u6CD5\u4ECE meta.id \u89E3\u6790 namespace" };
            }
            allFiles = zip_reader.listFiles(packPath);
            hasMat = false;
            hasConn = false;
            hasSub = false;
            for (i = 0; i < allFiles.length; i++) {
              if (allFiles[i].indexOf(namespace + "/materials/") === 0) hasMat = true;
              if (allFiles[i].indexOf(namespace + "/connectors/") === 0) hasConn = true;
              if (allFiles[i].indexOf(namespace + "/subsystems/") === 0) hasSub = true;
            }
            if (!hasMat) {
              return { valid: false, meta, namespace, error: "ZIP \u4E2D\u7F3A\u5C11 materials/ \u76EE\u5F55" };
            }
            if (!hasConn) {
              return { valid: false, meta, namespace, error: "ZIP \u4E2D\u7F3A\u5C11 connectors/ \u76EE\u5F55" };
            }
            if (!hasSub) {
              return { valid: false, meta, namespace, error: "ZIP \u4E2D\u7F3A\u5C11 subsystems/ \u76EE\u5F55" };
            }
            log2.info("openContentPack: ZIP \u5185\u5BB9\u5305\u9A8C\u8BC1\u901A\u8FC7", { path: packPath, namespace });
            return { valid: true, meta, namespace, error: null };
          } catch (e) {
            log2.error("openContentPack: \u6253\u5F00 ZIP \u5931\u8D25 " + packPath, e);
            return { valid: false, meta: null, namespace: "", error: e.message };
          }
        }
        try {
          meta = readPackMeta(packPath);
          if (meta === null) {
            return { valid: false, meta: null, namespace: "", error: "meta.json \u8BFB\u53D6\u5931\u8D25\u6216\u4E0D\u5B58\u5728" };
          }
          if (!meta.id) {
            return { valid: false, meta, namespace: "", error: "meta.id \u4E3A\u7A7A" };
          }
          namespace = resolveNamespace(meta.id);
          if (!namespace) {
            return { valid: false, meta, namespace: "", error: "\u65E0\u6CD5\u4ECE meta.id \u89E3\u6790 namespace" };
          }
          var requiredDirs = [
            path.join(packPath, namespace, "materials"),
            path.join(packPath, namespace, "connectors"),
            path.join(packPath, namespace, "subsystems")
          ];
          for (i = 0; i < requiredDirs.length; i++) {
            if (!fs.existsSync(requiredDirs[i])) {
              return {
                valid: false,
                meta,
                namespace,
                error: "\u7F3A\u5C11\u5FC5\u8981\u76EE\u5F55: " + requiredDirs[i]
              };
            }
          }
          log2.info("openContentPack: \u5185\u5BB9\u5305\u9A8C\u8BC1\u901A\u8FC7", { path: packPath, namespace });
          return { valid: true, meta, namespace, error: null };
        } catch (e) {
          log2.error("openContentPack: \u6253\u5F00\u5931\u8D25 " + packPath, e);
          return { valid: false, meta: null, namespace: "", error: e.message };
        }
      }
      function readAllDefs(packDir, namespace, type) {
        var typeDir, files, result, i, raw;
        if (_isZipPath(packDir)) {
          return _readZipDefs(packDir, namespace, type);
        }
        typeDir = path.join(packDir, namespace, type);
        if (!fs.existsSync(typeDir)) {
          log2.debug("readAllDefs: \u76EE\u5F55\u4E0D\u5B58\u5728 " + typeDir);
          return {};
        }
        files = walkDefFiles(typeDir, ".json");
        result = {};
        for (i = 0; i < files.length; i++) {
          try {
            raw = fs.readFileSync(files[i].filePath, "utf-8");
            result[files[i].id] = JSON.parse(raw);
            log2.debug("readAllDefs: \u5DF2\u8BFB\u53D6 " + files[i].filePath);
          } catch (e) {
            log2.warn("readAllDefs: JSON \u89E3\u6790\u5931\u8D25\uFF0C\u8DF3\u8FC7 " + files[i].filePath, e);
          }
        }
        log2.info("readAllDefs: \u5B8C\u6210", { type, count: Object.keys(result).length });
        return result;
      }
      function writeDef(packDir, namespace, type, defId, data) {
        var loc = extractResourceLocation(defId, namespace);
        var defDir = path.join(packDir, namespace, type);
        var filename = loc.path + ".json";
        writeJSONFile(defDir, filename, data);
        log2.debug("writeDef: \u5DF2\u5199\u5165 " + path.join(defDir, filename));
      }
      function deleteDef(packDir, namespace, type, defId) {
        var loc = extractResourceLocation(defId, namespace);
        var filePath = path.join(packDir, namespace, type, loc.path + ".json");
        deleteFile(filePath);
        log2.debug("deleteDef: " + filePath);
      }
      function listDefIds(packDir, namespace, type) {
        var typeDir = path.join(packDir, namespace, type);
        var files, ids, i;
        if (!fs.existsSync(typeDir)) {
          log2.debug("listDefIds: \u76EE\u5F55\u4E0D\u5B58\u5728 " + typeDir);
          return [];
        }
        files = walkDefFiles(typeDir, ".json");
        ids = [];
        for (i = 0; i < files.length; i++) {
          ids.push(files[i].id);
        }
        log2.debug("listDefIds: " + type + " \u5171\u6709 " + ids.length + " \u4E2A\u5B9A\u4E49");
        return ids;
      }
      function defExists(packDir, namespace, type, defId) {
        var filePath = path.join(packDir, namespace, type, defId + ".json");
        return fileExists(filePath);
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          resolveNamespace,
          readPackMeta,
          writePackMeta,
          createContentPack,
          openContentPack,
          readAllDefs,
          writeDef,
          deleteDef,
          listDefIds,
          defExists
        };
      }
    }
  });

  // src/mode/validation.js
  var require_validation = __commonJS({
    "src/mode/validation.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { createLogger: createLogger2 } = require_logger();
      var { getMarkersForVariant, detectOwnerSubPart } = require_element_markers();
      var log2 = createLogger2("Validation");
      function checkOrphanedMarkers(config, partId, vName, errors) {
        var markers = getMarkersForVariant(config, partId, vName);
        for (var uuid in markers) {
          var marker = markers[uuid];
          if (marker.type === "hit_box") {
            var group = typeof Group !== "undefined" ? Group.all.find(function(g) {
              return g.uuid === uuid;
            }) : null;
            if (group) {
              var owner = detectOwnerSubPart(config, partId, vName, group);
              if (!owner) {
                errors.push('\u96F6\u4EF6 "' + partId + '"/' + vName + ' \u4E2D\u78B0\u649E\u7BB1 "' + group.name + '" \u4E3A\u6E38\u79BB\u72B6\u6001\uFF08\u65E0\u5F52\u5C5E\u5B50\u96F6\u4EF6\uFF0C\u4E0D\u4F1A\u88AB\u9632\u62A4\u8BA1\u7B97\u5904\u7406\uFF09');
              }
            }
          } else if (marker.type === "connector") {
            var loc = typeof Locator !== "undefined" ? Locator.all.find(function(l) {
              return l.uuid === uuid;
            }) : null;
            if (loc) {
              var owner = detectOwnerSubPart(config, partId, vName, loc);
              if (!owner) {
                errors.push('\u96F6\u4EF6 "' + partId + '"/' + vName + ' \u4E2D\u8FDE\u63A5\u70B9 "' + loc.name + '" \u4E3A\u6E38\u79BB\u72B6\u6001\uFF08\u65E0\u5F52\u5C5E\u5B50\u96F6\u4EF6\uFF0C\u5C06\u4E0D\u4F1A\u8BA1\u5165\u5BFC\u51FA\uFF09');
              }
            }
          }
        }
      }
      function runValidation(config) {
        const errors = [];
        const parts = config.parts || {};
        if (Object.keys(parts).length === 0) {
          errors.push("\u672A\u5B9A\u4E49\u4EFB\u4F55\u96F6\u4EF6");
          return errors;
        }
        for (const [partId, part] of Object.entries(parts)) {
          const variants = part.variants || {};
          if (Object.keys(variants).length === 0) {
            errors.push(`\u96F6\u4EF6 "${partId}"\uFF1A\u6CA1\u6709\u5B9A\u4E49\u53D8\u4F53`);
            continue;
          }
          for (const [vName, variant] of Object.entries(variants)) {
            if (!variant.model) {
              errors.push(`\u96F6\u4EF6 "${partId}" \u53D8\u4F53 "${vName}"\uFF1A\u672A\u8BBE\u7F6E\u6A21\u578B\u5F15\u7528`);
            }
            const subParts = variant.sub_parts || {};
            if (Object.keys(subParts).length === 0) {
              errors.push(`\u96F6\u4EF6 "${partId}" \u53D8\u4F53 "${vName}"\uFF1A\u672A\u5B9A\u4E49\u5B50\u96F6\u4EF6`);
            }
            for (const [spName, sp] of Object.entries(subParts)) {
              if (Object.keys(sp.hit_boxes || {}).length === 0) {
                errors.push(`\u96F6\u4EF6 "${partId}"/${vName} \u5B50\u96F6\u4EF6 "${spName}"\uFF1A\u78B0\u649E\u7BB1\u4E3A\u7A7A`);
              }
              if ((sp.mass || 0) <= 0) {
                errors.push(`\u96F6\u4EF6 "${partId}"/${vName} \u5B50\u96F6\u4EF6 "${spName}"\uFF1A\u8D28\u91CF\u5FC5\u987B\u5927\u4E8E 0`);
              }
            }
            checkOrphanedMarkers(config, partId, vName, errors);
          }
        }
        return errors;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = { runValidation };
      }
    }
  });

  // src/ui/dialogs/pack_setup_dialog.js
  var require_pack_setup_dialog = __commonJS({
    "src/ui/dialogs/pack_setup_dialog.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var fs = __require("fs");
      var path = __require("path");
      var content_pack = require_content_pack();
      var persistence = require_persistence();
      var { showToast: showToast2 } = require_notify();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("PackSetup");
      var DEP_TYPE_LABELS = {
        hard: "\u786C\u4F9D\u8D56 (\u5FC5\u9700)",
        soft: "\u8F6F\u4F9D\u8D56 (\u53EF\u9009)",
        override: "\u8986\u76D6 (\u66FF\u6362)",
        conflict: "\u51B2\u7A81 (\u4E0D\u517C\u5BB9)"
      };
      function _isConfigValid(config) {
        return config && typeof config === "object";
      }
      function _sanitizeFolderName(name) {
        if (!name) return "";
        return String(name).replace(/[<>:"/\\|?*\s]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").substring(0, 64);
      }
      function _findPackInSiblings(parentDir, packId) {
        if (!packId || !parentDir || !fs.existsSync(parentDir)) return null;
        var entries, i, fullPath, stat, meta;
        try {
          entries = fs.readdirSync(parentDir);
        } catch (e) {
          return null;
        }
        for (i = 0; i < entries.length; i++) {
          fullPath = path.join(parentDir, entries[i]);
          try {
            stat = fs.statSync(fullPath);
          } catch (e) {
            continue;
          }
          if (stat.isDirectory()) {
            meta = content_pack.readPackMeta(fullPath);
            if (meta && meta.id === packId) {
              return fullPath;
            }
          }
          if (stat.isFile() && fullPath.toLowerCase().endsWith(".zip")) {
            meta = content_pack.readPackMeta(fullPath);
            if (meta && meta.id === packId) {
              return fullPath;
            }
          }
        }
        return null;
      }
      function _resolveChainDependencies(directDeps, parentDir) {
        var indirect = [];
        var processed = {};
        var i, j, dep, depMeta, depDeps, depDep, depId, found;
        for (i = 0; i < directDeps.length; i++) {
          if (directDeps[i].path) {
            processed[directDeps[i].path] = true;
          }
        }
        for (i = 0; i < directDeps.length; i++) {
          dep = directDeps[i];
          if (!dep.path) continue;
          depMeta = content_pack.readPackMeta(dep.path);
          if (!depMeta || !depMeta.dependencies || !depMeta.dependencies.length) continue;
          depDeps = depMeta.dependencies;
          for (j = 0; j < depDeps.length; j++) {
            depDep = depDeps[j];
            depId = depDep.id || depDep;
            found = _findPackInSiblings(parentDir, depId);
            if (found && !processed[found]) {
              processed[found] = true;
              indirect.push({
                path: found,
                type: depDep.type || "hard",
                isIndirect: true
              });
              log2.info('\u94FE\u5F0F\u89E3\u6790: \u53D1\u73B0\u95F4\u63A5\u4F9D\u8D56 "' + depId + '" \u2192 ' + found);
            }
          }
        }
        return {
          direct: directDeps,
          indirect
        };
      }
      function _showDependencyPathEditor(existingDeps, contextParentDir, options, onComplete) {
        if (typeof options === "function") {
          onComplete = options;
          options = {};
        }
        var opts = options || {};
        var defaultKeepAdding = opts.defaultKeepAdding !== false;
        var selected = existingDeps ? existingDeps.slice() : [];
        var stepNum = selected.length + 1;
        function _buildDepListHtml() {
          if (selected.length === 0) return "\uFF08\u6682\u65E0\u4F9D\u8D56\uFF09";
          var html = "";
          for (var i = 0; i < selected.length; i++) {
            var d = selected[i];
            html += '<div style="margin:2px 0;padding:4px 8px;background:#333;border-radius:3px;font-size:12px">' + (d.isIndirect ? "\u21B3 \u95F4\u63A5 " : "") + "<code>" + d.path + "</code> \u2014 " + DEP_TYPE_LABELS[d.type] + "</div>";
          }
          return html;
        }
        function _buildRemoveOptions() {
          var opts2 = { _none_: "\uFF08\u4E0D\u79FB\u9664\uFF09" };
          for (var i = 0; i < selected.length; i++) {
            if (selected[i].isIndirect) continue;
            var label = i + 1 + ": " + (selected[i].path || "?") + " [" + selected[i].type + "]";
            if (label.length > 60) label = label.substring(0, 57) + "...";
            opts2["del_" + i] = label;
          }
          return opts2;
        }
        function _showOneStep() {
          try {
            var formFields = {
              currentList: {
                type: "info",
                text: "<b>\u5DF2\u9009\u62E9\u7684\u4F9D\u8D56\u5305\uFF1A</b><br>" + _buildDepListHtml()
              }
            };
            var directCount = 0;
            for (var di = 0; di < selected.length; di++) {
              if (!selected[di].isIndirect) directCount++;
            }
            if (directCount > 0) {
              formFields.removeDep = {
                type: "select",
                label: "\u79FB\u9664\u4F9D\u8D56",
                options: _buildRemoveOptions(),
                value: "_none_"
              };
            }
            formFields.depDir = {
              type: "folder",
              label: "\u9009\u62E9\u5185\u5BB9\u5305\u76EE\u5F55",
              value: "",
              description: "\u9009\u62E9\u4E00\u4E2A\u5DF2\u5B58\u5728\u7684 MachineMax \u5185\u5BB9\u5305\u76EE\u5F55\u6216 .zip \u6587\u4EF6\u3002\u53EA\u79FB\u9664\u800C\u4E0D\u6DFB\u52A0\u65F6\u7559\u7A7A\u3002"
            };
            formFields.depType = {
              type: "select",
              label: "\u4F9D\u8D56\u7C7B\u578B",
              options: {
                hard: DEP_TYPE_LABELS.hard,
                soft: DEP_TYPE_LABELS.soft,
                override: DEP_TYPE_LABELS.override,
                conflict: DEP_TYPE_LABELS.conflict
              },
              value: "hard"
            };
            formFields.keepAdding = {
              type: "checkbox",
              label: "\u7EE7\u7EED\u6DFB\u52A0\u66F4\u591A\u4F9D\u8D56",
              value: defaultKeepAdding
            };
            new Dialog({
              id: "mm_dep_editor_step_" + stepNum,
              title: "\u914D\u7F6E\u672C\u5730\u4F9D\u8D56\u8DEF\u5F84 (" + stepNum + ")",
              width: 620,
              form: formFields,
              onConfirm: function(formData) {
                if (formData.removeDep && formData.removeDep !== "_none_") {
                  var idxStr = formData.removeDep.replace("del_", "");
                  var rmIdx = parseInt(idxStr, 10);
                  if (!isNaN(rmIdx) && rmIdx >= 0 && rmIdx < selected.length) {
                    var removedPath = selected[rmIdx].path;
                    selected.splice(rmIdx, 1);
                    log2.info("\u4F9D\u8D56\u8DEF\u5F84\u7F16\u8F91\u5668: \u5DF2\u79FB\u9664 " + removedPath);
                  }
                  stepNum++;
                  this.hide();
                  _showOneStep();
                  return;
                }
                if (formData.depDir && formData.depDir.trim()) {
                  var depPath = formData.depDir.trim();
                  var r = content_pack.openContentPack(depPath);
                  if (!r.valid) {
                    showToast2("\u6240\u9009\u76EE\u5F55\u4E0D\u662F\u6709\u6548\u5185\u5BB9\u5305: " + (r.error || "\u7F3A\u5C11 meta.json"), "warning");
                    stepNum++;
                    this.hide();
                    _showOneStep();
                    return;
                  }
                  var dup = false;
                  for (var k = 0; k < selected.length; k++) {
                    if (selected[k].path === depPath) {
                      dup = true;
                      break;
                    }
                  }
                  if (dup) {
                    showToast2("\u8BE5\u5185\u5BB9\u5305\u5DF2\u5728\u4F9D\u8D56\u5217\u8868\u4E2D", "info");
                    stepNum++;
                    this.hide();
                    _showOneStep();
                    return;
                  }
                  selected.push({ path: depPath, type: formData.depType || "hard", isIndirect: false });
                }
                if (formData.keepAdding) {
                  stepNum++;
                  this.hide();
                  _showOneStep();
                  return;
                }
                this.hide();
                var resolved = { direct: selected, indirect: [] };
                if (selected.length > 0 && contextParentDir) {
                  resolved = _resolveChainDependencies(selected, contextParentDir);
                  for (var j = 0; j < resolved.indirect.length; j++) {
                    selected.push(resolved.indirect[j]);
                  }
                }
                if (typeof onComplete === "function") onComplete(resolved);
              },
              onCancel: function() {
                this.hide();
                var resolved = { direct: selected, indirect: [] };
                if (selected.length > 0 && contextParentDir) {
                  resolved = _resolveChainDependencies(selected, contextParentDir);
                }
                if (typeof onComplete === "function") onComplete(resolved);
              }
            }).show();
          } catch (e) {
            log2.error("_showDependencyPathEditor \u6B65\u9AA4\u5931\u8D25", e);
            if (typeof onComplete === "function") onComplete({ direct: [], indirect: [] });
          }
        }
        _showOneStep();
      }
      function showCreatePackDialog(config, onSave) {
        if (!_isConfigValid(config)) {
          showToast2("\u914D\u7F6E\u4E0D\u53EF\u7528\uFF0C\u8BF7\u5148\u6253\u5F00\u9879\u76EE", "warning");
          return;
        }
        var ns = config.namespace || "machine_max";
        var defaultPackId = ns + ":" + (Project && Project.name ? Project.name : "content_pack");
        try {
          new Dialog({
            id: "mm_create_pack",
            title: "\u521B\u5EFA\u65B0\u5185\u5BB9\u5305",
            width: 520,
            form: {
              packId: {
                type: "text",
                label: "\u5185\u5BB9\u5305 ID",
                value: defaultPackId,
                description: "\u683C\u5F0F: namespace:name\uFF0C\u5982 machine_max:my_pack\u3002\u4EC5\u9650\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u3001_ - . / :"
              },
              packVersion: {
                type: "text",
                label: "\u7248\u672C\u53F7",
                value: "1.0",
                description: "\u9075\u5FAA SemVer \u683C\u5F0F\uFF0C\u5982 1.0.0"
              },
              packName: {
                type: "text",
                label: "\u663E\u793A\u540D\u79F0",
                value: "",
                description: "\u5185\u5BB9\u5305\u7684\u663E\u793A\u540D\u79F0\uFF08\u652F\u6301 Minecraft \u6587\u672C\u7EC4\u4EF6\u683C\u5F0F\uFF09"
              },
              packAuthor: {
                type: "text",
                label: "\u4F5C\u8005",
                value: "",
                description: "\u5185\u5BB9\u5305\u4F5C\u8005\u540D"
              },
              packDescription: {
                type: "textarea",
                label: "\u63CF\u8FF0",
                value: "",
                height: 70,
                description: "\u5185\u5BB9\u5305\u63CF\u8FF0\u4FE1\u606F"
              },
              packDir: {
                type: "folder",
                label: "\u521B\u5EFA\u76EE\u5F55\uFF08\u7236\u76EE\u5F55\uFF09",
                value: "",
                description: "\u9009\u62E9\u4E00\u4E2A\u7236\u76EE\u5F55\uFF0C\u5C06\u5728\u5176\u4E2D\u4EE5\u663E\u793A\u540D\u79F0\u521B\u5EFA\u5185\u5BB9\u5305\u5B50\u6587\u4EF6\u5939"
              },
              depNote: {
                type: "info",
                text: '<span style="color:#888;font-size:11px">\u63D0\u793A\uFF1A\u521B\u5EFA\u5B8C\u6210\u540E\u5C06\u7ACB\u5373\u8FDB\u5165\u4F9D\u8D56\u7BA1\u7406\u754C\u9762\u3002\u5EFA\u8BAE\u9009\u62E9\u5B98\u65B9\u5185\u5BB9\u5305\u4F5C\u4E3A\u4F9D\u8D56\u4EE5\u83B7\u53D6\u6750\u6599\u3001\u8FDE\u63A5\u70B9\u3001\u5B50\u7CFB\u7EDF\u5B9A\u4E49\u3002</span>'
              }
            },
            onConfirm: function(formData) {
              if (!formData.packId || !formData.packId.trim()) {
                showToast2("\u8BF7\u8F93\u5165\u5185\u5BB9\u5305 ID", "error");
                return false;
              }
              if (!formData.packDir || !formData.packDir.trim()) {
                showToast2("\u8BF7\u9009\u62E9\u521B\u5EFA\u76EE\u5F55", "error");
                return false;
              }
              var packId = formData.packId.trim();
              var parentDir = formData.packDir.trim();
              var folderName = _sanitizeFolderName(formData.packName || packId.split(":").pop() || "content_pack");
              var packDirPath = path.join(parentDir, folderName);
              var meta = {
                id: packId,
                version: formData.packVersion || "1.0",
                name: formData.packName || "",
                author: formData.packAuthor || "",
                description: formData.packDescription || ""
              };
              var result = content_pack.createContentPack(packDirPath, meta);
              if (!result.success) {
                showToast2("\u521B\u5EFA\u5931\u8D25: " + (result.error || "\u672A\u77E5\u9519\u8BEF"), "error");
                return false;
              }
              persistence.setPackPath(config, packDirPath);
              config.namespace = result.namespace || "";
              config.packMeta = meta;
              persistence.saveConfig();
              var namespace = result.namespace || "";
              var displayName = meta.name || packId;
              log2.info("\u5185\u5BB9\u5305\u521B\u5EFA\u6210\u529F", { path: packDirPath, namespace, id: packId, name: displayName });
              this.hide();
              _showDependencyPathEditor([], parentDir, { defaultKeepAdding: false }, function(resolved) {
                var directDeps = resolved.direct || [];
                var indirectDeps = resolved.indirect || [];
                for (var d = 0; d < directDeps.length; d++) {
                  persistence.addDependencyPath(config, directDeps[d].path);
                }
                for (var k = 0; k < indirectDeps.length; k++) {
                  persistence.addDependencyPath(config, indirectDeps[k].path);
                }
                persistence.saveConfig();
                var msg = "\u5185\u5BB9\u5305 " + displayName + " \u521B\u5EFA\u6210\u529F";
                if (directDeps.length > 0) {
                  msg += "\uFF0C\u5DF2\u6DFB\u52A0 " + directDeps.length + " \u4E2A\u76F4\u63A5\u4F9D\u8D56";
                }
                if (indirectDeps.length > 0) {
                  msg += "\uFF0C\u89E3\u6790 " + indirectDeps.length + " \u4E2A\u95F4\u63A5\u4F9D\u8D56";
                }
                showToast2(msg, "positive", 5e3);
                if (typeof onSave === "function") onSave(config);
              });
            }
          }).show();
        } catch (e) {
          log2.error("showCreatePackDialog \u5931\u8D25", e);
          showToast2("\u65E0\u6CD5\u6253\u5F00\u521B\u5EFA\u5BF9\u8BDD\u6846: " + (e.message || e), "error");
        }
      }
      function showOpenPackDialog(config, onSave) {
        if (!_isConfigValid(config)) {
          showToast2("\u914D\u7F6E\u4E0D\u53EF\u7528\uFF0C\u8BF7\u5148\u6253\u5F00\u9879\u76EE", "warning");
          return;
        }
        try {
          new Dialog({
            id: "mm_open_pack",
            title: "\u6253\u5F00\u5DF2\u6709\u5185\u5BB9\u5305",
            width: 520,
            form: {
              packDir: {
                type: "folder",
                label: "\u5185\u5BB9\u5305\u76EE\u5F55",
                value: "",
                description: "\u9009\u62E9\u5305\u542B meta.json \u7684\u5185\u5BB9\u5305\u6839\u76EE\u5F55\u6216 .zip \u6587\u4EF6"
              },
              depNote: {
                type: "info",
                text: '<span style="color:#888;font-size:11px">\u63D0\u793A\uFF1A\u6253\u5F00\u5185\u5BB9\u5305\u540E\uFF0C\u53EF\u5728 MachineMax \u83DC\u5355 \u2192 "\u7F16\u8F91\u5185\u5BB9\u5305\u4FE1\u606F"\u4E2D\u4FEE\u6539\u5143\u6570\u636E\uFF0C\u6216\u901A\u8FC7\u83DC\u5355\u9879\u7BA1\u7406\u672C\u5730\u4F9D\u8D56\u8DEF\u5F84\u3002</span>'
              }
            },
            onConfirm: function(formData) {
              if (!formData.packDir || !formData.packDir.trim()) {
                showToast2("\u8BF7\u9009\u62E9\u5185\u5BB9\u5305\u76EE\u5F55", "error");
                return false;
              }
              var dirPath = formData.packDir.trim();
              var result = content_pack.openContentPack(dirPath);
              if (!result.valid) {
                showToast2("\u5185\u5BB9\u5305\u65E0\u6548: " + (result.error || "\u76EE\u5F55\u4E2D\u7F3A\u5C11 meta.json \u6216\u5FC5\u8981\u5B50\u76EE\u5F55"), "error");
                return false;
              }
              var meta = result.meta || {};
              persistence.setPackPath(config, dirPath);
              config.namespace = result.namespace || "";
              config.packMeta = meta;
              persistence.saveConfig();
              var displayName = meta.name || result.namespace || "";
              showToast2("\u5185\u5BB9\u5305 " + displayName + " \u5DF2\u52A0\u8F7D", "positive", 5e3);
              log2.info("\u5185\u5BB9\u5305\u5DF2\u6253\u5F00", { path: dirPath, namespace: result.namespace, id: meta.id });
              if (typeof onSave === "function") onSave(config);
              this.hide();
            }
          }).show();
        } catch (e) {
          log2.error("showOpenPackDialog \u5931\u8D25", e);
          showToast2("\u65E0\u6CD5\u6253\u5F00\u5BF9\u8BDD\u6846: " + (e.message || e), "error");
        }
      }
      function showManageDependenciesDialog(config, onSave) {
        if (!_isConfigValid(config)) {
          showToast2("\u914D\u7F6E\u4E0D\u53EF\u7528\uFF0C\u8BF7\u5148\u6253\u5F00\u9879\u76EE", "warning");
          return;
        }
        var deps = config.dependencyPaths || [];
        var depsHtml = "";
        var i;
        if (deps.length === 0) {
          depsHtml = "\uFF08\u6682\u65E0\u4F9D\u8D56\u5305\uFF09";
        } else {
          depsHtml = '<ol style="margin:4px 0;padding-left:20px">';
          for (i = 0; i < deps.length; i++) {
            depsHtml += "<li><code>" + deps[i] + "</code></li>";
          }
          depsHtml += "</ol>";
        }
        try {
          new Dialog({
            id: "mm_manage_deps",
            title: "\u7BA1\u7406\u4F9D\u8D56\u5305",
            width: 560,
            form: {
              currentDepsInfo: {
                type: "info",
                text: "<b>\u5F53\u524D\u5DF2\u6DFB\u52A0\u7684\u4F9D\u8D56\u5305\u76EE\u5F55\uFF1A</b>" + depsHtml + '<br><span style="color:#888;font-size:11px">\u63D0\u793A\uFF1A\u4F9D\u8D56\u5305\u662F\u5F53\u524D\u5185\u5BB9\u5305\u5F15\u7528\u7684\u5176\u4ED6\u5185\u5BB9\u5305\uFF0C\u7528\u4E8E\u5171\u4EAB\u96F6\u4EF6\u3001\u5B50\u7CFB\u7EDF\u7B49\u5B9A\u4E49\u3002</span>'
              },
              depPathToRemove: {
                type: "text",
                label: "\u79FB\u9664\u4F9D\u8D56\u5305\u8DEF\u5F84",
                value: "",
                description: "\u8F93\u5165\u8981\u79FB\u9664\u7684\u4F9D\u8D56\u5305\u5B8C\u6574\u76EE\u5F55\u8DEF\u5F84\uFF0C\u7559\u7A7A\u8868\u793A\u4E0D\u79FB\u9664"
              },
              newDepPath: {
                type: "folder",
                label: "\u6DFB\u52A0\u65B0\u4F9D\u8D56\u5305\u76EE\u5F55",
                value: "",
                description: "\u9009\u62E9\u5305\u542B meta.json \u7684\u5185\u5BB9\u5305\u76EE\u5F55\u6216 .zip \u6587\u4EF6\u4F5C\u4E3A\u4F9D\u8D56"
              }
            },
            onConfirm: function(formData) {
              var changed = false;
              var removePath, addPath, oldLen;
              if (formData.depPathToRemove && formData.depPathToRemove.trim()) {
                removePath = formData.depPathToRemove.trim();
                oldLen = (config.dependencyPaths || []).length;
                persistence.removeDependencyPath(config, removePath);
                if ((config.dependencyPaths || []).length < oldLen) {
                  changed = true;
                  log2.info("\u5DF2\u79FB\u9664\u4F9D\u8D56\u5305: " + removePath);
                } else {
                  showToast2("\u672A\u627E\u5230\u5339\u914D\u7684\u4F9D\u8D56\u8DEF\u5F84: " + removePath, "warning");
                  return false;
                }
              }
              if (formData.newDepPath && formData.newDepPath.trim()) {
                addPath = formData.newDepPath.trim();
                oldLen = (config.dependencyPaths || []).length;
                persistence.addDependencyPath(config, addPath);
                if ((config.dependencyPaths || []).length > oldLen) {
                  changed = true;
                  log2.info("\u5DF2\u6DFB\u52A0\u4F9D\u8D56\u5305: " + addPath);
                } else {
                  showToast2("\u4F9D\u8D56\u8DEF\u5F84\u5DF2\u5B58\u5728: " + addPath, "info");
                }
              }
              if (changed) {
                persistence.saveConfig();
                showToast2("\u4F9D\u8D56\u5305\u5DF2\u66F4\u65B0", "positive");
                if (typeof onSave === "function") onSave(config);
              } else if (!formData.depPathToRemove || !formData.depPathToRemove.trim()) {
                showToast2("\u672A\u505A\u4EFB\u4F55\u66F4\u6539", "info");
              }
              this.hide();
            }
          }).show();
        } catch (e) {
          log2.error("showManageDependenciesDialog \u5931\u8D25", e);
          showToast2("\u65E0\u6CD5\u6253\u5F00\u4F9D\u8D56\u7BA1\u7406\u5BF9\u8BDD\u6846: " + (e.message || e), "error");
        }
      }
      var _packSetupShowing = false;
      function showPackSetupDialog(config, onSave) {
        if (_packSetupShowing) {
          log2.debug("showPackSetupDialog: \u5DF2\u6709\u5411\u5BFC\u7A97\u53E3\u6253\u5F00\u4E2D\uFF0C\u8DF3\u8FC7\u91CD\u590D\u8C03\u7528");
          return;
        }
        if (!_isConfigValid(config)) {
          showToast2("\u914D\u7F6E\u4E0D\u53EF\u7528\uFF0C\u8BF7\u5148\u6253\u5F00\u9879\u76EE", "warning");
          return;
        }
        _packSetupShowing = true;
        try {
          new Dialog({
            id: "mm_pack_setup",
            title: "MachineMax \u5185\u5BB9\u5305\u8BBE\u7F6E\u5411\u5BFC",
            width: 500,
            form: {
              infoText: {
                type: "info",
                text: "<b>\u5185\u5BB9\u5305\u8BBE\u7F6E\u5411\u5BFC</b><br><br>\u5185\u5BB9\u5305\u662F MachineMax \u5B9A\u4E49\u7684\u7EC4\u7EC7\u5355\u4F4D\uFF0C\u5305\u542B\u96F6\u4EF6\u3001\u5B50\u7CFB\u7EDF\u3001\u8FDE\u63A5\u70B9\u7B49\u914D\u7F6E\u3002\u9996\u6B21\u4F7F\u7528\u8BF7\u5148\u521B\u5EFA\u6216\u6253\u5F00\u4E00\u4E2A\u5185\u5BB9\u5305\u3002"
              },
              currentPack: {
                type: "info",
                text: config.contentPackPath ? "\u5F53\u524D\u5185\u5BB9\u5305\u76EE\u5F55\uFF1A<br><code>" + config.contentPackPath + "</code>" : "\u5F53\u524D\u672A\u8BBE\u7F6E\u5185\u5BB9\u5305\u3002"
              },
              action: {
                type: "select",
                label: "\u9009\u62E9\u64CD\u4F5C",
                options: {
                  create: "\u521B\u5EFA\u65B0\u5185\u5BB9\u5305",
                  open: "\u6253\u5F00\u5DF2\u6709\u5185\u5BB9\u5305",
                  deps: "\u7BA1\u7406\u4F9D\u8D56\u5305"
                },
                value: config.contentPackPath ? "open" : "create"
              }
            },
            onConfirm: function(formData) {
              _packSetupShowing = false;
              this.hide();
              try {
                if (formData.action === "create") {
                  showCreatePackDialog(config, onSave);
                } else if (formData.action === "open") {
                  showOpenPackDialog(config, onSave);
                } else if (formData.action === "deps") {
                  showManageDependenciesDialog(config, onSave);
                }
              } catch (e) {
                log2.error("\u8DF3\u8F6C\u5B50\u5BF9\u8BDD\u6846\u5931\u8D25", e);
                showToast2("\u64CD\u4F5C\u5931\u8D25: " + (e.message || e), "error");
              }
            },
            onCancel: function() {
              _packSetupShowing = false;
              this.hide();
            }
          }).show();
        } catch (e) {
          _packSetupShowing = false;
          log2.error("showPackSetupDialog \u5931\u8D25", e);
          showToast2("\u65E0\u6CD5\u6253\u5F00\u8BBE\u7F6E\u5411\u5BFC: " + (e.message || e), "error");
        }
      }
      function showDependencyPathEditor(existingDeps, parentDir, options, onComplete) {
        _showDependencyPathEditor(existingDeps, parentDir, options, onComplete);
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          showPackSetupDialog,
          showCreatePackDialog,
          showOpenPackDialog,
          showManageDependenciesDialog,
          showDependencyPathEditor
        };
      }
    }
  });

  // src/core/builtin_pack.js
  var require_builtin_pack = __commonJS({
    "src/core/builtin_pack.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("BuiltinPack");
      function stripJsonComments(content) {
        var lines, result, li, line, inString, i, ch, commentStart, stripped;
        if (typeof content !== "string") return content;
        lines = content.split("\n");
        result = [];
        for (li = 0; li < lines.length; li++) {
          line = lines[li];
          inString = false;
          commentStart = -1;
          for (i = 0; i < line.length; i++) {
            ch = line[i];
            if (ch === '"' && (i === 0 || line[i - 1] !== "\\")) {
              inString = !inString;
            } else if (ch === "/" && line[i + 1] === "/" && !inString) {
              commentStart = i;
              break;
            }
          }
          if (commentStart >= 0) {
            stripped = line.substring(0, commentStart);
            if (stripped.trim().length > 0) {
              result.push(stripped);
            }
          } else {
            result.push(line);
          }
        }
        return result.join("\n");
      }
      function normalizeDefs(rawDefs) {
        var result, keys, i, key, value, defId, lastSlash, stripped;
        if (!rawDefs || typeof rawDefs !== "object") return {};
        result = {};
        keys = Object.keys(rawDefs);
        for (i = 0; i < keys.length; i++) {
          key = keys[i];
          value = rawDefs[key];
          defId = key;
          if (typeof defId === "string" && defId.endsWith(".json")) {
            defId = defId.slice(0, -5);
          }
          lastSlash = defId.lastIndexOf("/");
          if (lastSlash >= 0) {
            defId = defId.substring(lastSlash + 1);
          }
          if (typeof value === "string") {
            try {
              stripped = stripJsonComments(value);
              value = JSON.parse(stripped);
            } catch (e) {
              log2.warn("normalizeDefs: JSON \u89E3\u6790\u5931\u8D25\uFF0C\u4FDD\u7559\u539F\u503C key=" + key, e);
            }
          }
          result[defId] = value;
        }
        return result;
      }
      function readDefine(injectedValue, fallback) {
        if (typeof injectedValue === "undefined") {
          return fallback;
        }
        return injectedValue;
      }
      var builtinMeta = readDefine(
        typeof define_BUILTIN_PACK_META_default !== "undefined" ? define_BUILTIN_PACK_META_default : void 0,
        { id: "", version: "0.0" }
      );
      var builtinMaterials = normalizeDefs(
        readDefine(
          typeof define_BUILTIN_MATERIALS_default !== "undefined" ? define_BUILTIN_MATERIALS_default : void 0,
          {}
        )
      );
      var builtinConnectors = normalizeDefs(
        readDefine(
          typeof define_BUILTIN_CONNECTORS_default !== "undefined" ? define_BUILTIN_CONNECTORS_default : void 0,
          {}
        )
      );
      var builtinSubsystems = normalizeDefs(
        readDefine(
          typeof define_BUILTIN_SUBSYSTEMS_default !== "undefined" ? define_BUILTIN_SUBSYSTEMS_default : void 0,
          {}
        )
      );
      function extractNamespace(id) {
        if (!id || typeof id !== "string") return "machine_max";
        var colonIdx = id.indexOf(":");
        return colonIdx >= 0 ? id.substring(0, colonIdx) : id;
      }
      function getBuiltinPack() {
        var namespace = extractNamespace(builtinMeta.id);
        var matCount, connCount, subCount;
        var result = {
          meta: builtinMeta,
          namespace,
          materials: builtinMaterials,
          connectors: builtinConnectors,
          subsystems: builtinSubsystems
        };
        Object.freeze(result);
        matCount = Object.keys(builtinMaterials).length;
        connCount = Object.keys(builtinConnectors).length;
        subCount = Object.keys(builtinSubsystems).length;
        log2.info(
          "getBuiltinPack: \u5185\u7F6E\u5305\u52A0\u8F7D\u5B8C\u6210 \u2014 materials=" + matCount + " connectors=" + connCount + " subsystems=" + subCount + " namespace=" + namespace
        );
        return result;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          getBuiltinPack
        };
      }
    }
  });

  // src/core/content_pack_manager.js
  var require_content_pack_manager = __commonJS({
    "src/core/content_pack_manager.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var content_pack = require_content_pack();
      var builtin_pack = require_builtin_pack();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("ContentPackManager");
      var hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty);
      var _cache = {
        materials: null,
        connectors: null,
        subsystems: null
      };
      function loadMergedDefs(config, type) {
        var emptyResult;
        var defs;
        var sources;
        var builtin;
        var builtinDefs;
        var bKey;
        var depPaths;
        var i;
        var depPath;
        var openResult;
        var depDefs;
        var depKey;
        var currentPath;
        var curOpenResult;
        var curDefs;
        var curKey;
        var result;
        var defCount;
        if (_cache[type]) {
          log2.debug("loadMergedDefs: \u7F13\u5B58\u547D\u4E2D " + type);
          return _cache[type];
        }
        if (!config) {
          log2.warn("loadMergedDefs: config \u4E3A\u7A7A\uFF0C\u8FD4\u56DE\u7A7A\u7ED3\u679C");
          emptyResult = { defs: {}, sources: {} };
          _cache[type] = emptyResult;
          return emptyResult;
        }
        defs = {};
        sources = {};
        try {
          builtin = builtin_pack.getBuiltinPack();
          builtinDefs = builtin[type] || {};
          for (bKey in builtinDefs) {
            if (hasOwn(builtinDefs, bKey)) {
              var namespacedKey = builtin.namespace + ":" + bKey;
              defs[namespacedKey] = builtinDefs[bKey];
              sources[namespacedKey] = "builtin";
            }
          }
          log2.info("loadMergedDefs: \u5185\u7F6E\u5305 " + type + " \u52A0\u8F7D\u5B8C\u6210\uFF0C\u5171 " + Object.keys(builtinDefs).length + " \u4E2A\u5B9A\u4E49");
        } catch (e) {
          log2.warn("loadMergedDefs: \u5185\u7F6E\u5305\u8BFB\u53D6\u5931\u8D25\uFF0C\u4F5C\u4E3A\u7A7A\u5305\u5904\u7406", e);
        }
        depPaths = config.dependencyPaths;
        if (depPaths && Array.isArray(depPaths) && depPaths.length > 0) {
          for (i = 0; i < depPaths.length; i++) {
            depPath = depPaths[i];
            if (!depPath || typeof depPath !== "string" || depPath.trim() === "") {
              log2.warn("loadMergedDefs: \u4F9D\u8D56\u5305\u8DEF\u5F84\u4E3A\u7A7A\uFF0C\u8DF3\u8FC7 index=" + i);
              continue;
            }
            try {
              openResult = content_pack.openContentPack(depPath);
              if (!openResult.valid) {
                log2.warn("loadMergedDefs: \u4F9D\u8D56\u5305\u65E0\u6548\uFF0C\u8DF3\u8FC7: " + depPath, openResult.error);
                continue;
              }
              depDefs = content_pack.readAllDefs(depPath, openResult.namespace, type);
              for (depKey in depDefs) {
                if (hasOwn(depDefs, depKey)) {
                  var namespacedDepKey = openResult.namespace + ":" + depKey;
                  defs[namespacedDepKey] = depDefs[depKey];
                  sources[namespacedDepKey] = "dependency:" + i;
                }
              }
              log2.debug("loadMergedDefs: \u4F9D\u8D56\u5305 " + depPath + " " + type + " \u52A0\u8F7D\u5B8C\u6210\uFF0C\u5171 " + Object.keys(depDefs).length + " \u4E2A\u5B9A\u4E49");
            } catch (e) {
              log2.warn("loadMergedDefs: \u4F9D\u8D56\u5305\u52A0\u8F7D\u5931\u8D25\uFF0C\u8DF3\u8FC7: " + depPath, e);
            }
          }
        }
        currentPath = config.contentPackPath;
        if (currentPath && typeof currentPath === "string" && currentPath.trim() !== "") {
          try {
            curOpenResult = content_pack.openContentPack(currentPath);
            if (!curOpenResult.valid) {
              log2.error("loadMergedDefs: \u5F53\u524D\u5185\u5BB9\u5305\u65E0\u6548: " + currentPath, curOpenResult.error);
            } else {
              curDefs = content_pack.readAllDefs(currentPath, curOpenResult.namespace, type);
              for (curKey in curDefs) {
                if (hasOwn(curDefs, curKey)) {
                  var namespacedCurKey = curOpenResult.namespace + ":" + curKey;
                  defs[namespacedCurKey] = curDefs[curKey];
                  sources[namespacedCurKey] = "current";
                }
              }
              log2.debug("loadMergedDefs: \u5F53\u524D\u5305 " + currentPath + " " + type + " \u52A0\u8F7D\u5B8C\u6210\uFF0C\u5171 " + Object.keys(curDefs).length + " \u4E2A\u5B9A\u4E49");
            }
          } catch (e) {
            log2.error("loadMergedDefs: \u5F53\u524D\u5185\u5BB9\u5305\u52A0\u8F7D\u5931\u8D25: " + currentPath, e);
          }
        }
        result = { defs, sources };
        _cache[type] = result;
        defCount = Object.keys(defs).length;
        log2.info("loadMergedDefs: " + type + " \u5408\u5E76\u5B8C\u6210\uFF0C\u5171 " + defCount + " \u4E2A\u5B9A\u4E49");
        return result;
      }
      function resolveDefSource(config, type, defId) {
        var merged = loadMergedDefs(config, type);
        var source = merged.sources[defId];
        if (source === void 0) {
          log2.debug("resolveDefSource: \u672A\u627E\u5230\u5B9A\u4E49 " + type + ":" + defId);
          return null;
        }
        return source;
      }
      function isDefEditable(config, type, defId) {
        var source = resolveDefSource(config, type, defId);
        return source === "current";
      }
      function getAvailableDefsForType(config, type) {
        var merged = loadMergedDefs(config, type);
        return merged.defs;
      }
      function getFirstDefId(config, type) {
        var defs = getAvailableDefsForType(config, type);
        var keys = Object.keys(defs);
        if (keys.length === 0) {
          log2.debug("getFirstDefId: " + type + " \u65E0\u53EF\u7528\u5B9A\u4E49");
          return null;
        }
        return keys[0];
      }
      function invalidateCache() {
        _cache.materials = null;
        _cache.connectors = null;
        _cache.subsystems = null;
        log2.debug("invalidateCache: \u7F13\u5B58\u5DF2\u6E05\u9664");
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          loadMergedDefs,
          resolveDefSource,
          isDefEditable,
          getAvailableDefsForType,
          getFirstDefId,
          invalidateCache
        };
      }
    }
  });

  // src/managers/material_manager.js
  var require_material_manager = __commonJS({
    "src/managers/material_manager.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var content_pack = require_content_pack();
      var content_pack_manager = require_content_pack_manager();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("MaterialManager");
      function listMaterials(config) {
        var merged, ids, result, i, id;
        merged = content_pack_manager.loadMergedDefs(config, "materials");
        ids = Object.keys(merged.defs);
        result = [];
        for (i = 0; i < ids.length; i++) {
          id = ids[i];
          result.push({
            id,
            data: merged.defs[id],
            source: merged.sources[id],
            editable: content_pack_manager.isDefEditable(config, "materials", id)
          });
        }
        log2.debug("listMaterials: \u5171 " + result.length + " \u4E2A\u6750\u6599");
        return result;
      }
      function createMaterial(config, id, data) {
        if (!config || !config.contentPackPath) {
          throw new Error("\u5F53\u524D\u6CA1\u6709\u5173\u8054\u7684\u5185\u5BB9\u5305\uFF0C\u65E0\u6CD5\u521B\u5EFA\u6750\u6599");
        }
        var meta = content_pack.readPackMeta(config.contentPackPath);
        if (!meta) {
          throw new Error("\u65E0\u6CD5\u8BFB\u53D6\u5185\u5BB9\u5305 meta.json: " + config.contentPackPath);
        }
        var ns = content_pack.resolveNamespace(meta.id);
        if (!ns) {
          throw new Error("\u65E0\u6CD5\u4ECE meta.id \u89E3\u6790 namespace: " + meta.id);
        }
        var lookupId = id.indexOf(":") >= 0 ? id : ns + ":" + id;
        var source = content_pack_manager.resolveDefSource(config, "materials", lookupId);
        if (source === "current") {
          throw new Error('\u6750\u6599 "' + lookupId + '" \u5DF2\u5B58\u5728\uFF0C\u8BF7\u4F7F\u7528\u66F4\u65B0\u64CD\u4F5C');
        }
        if (source && source.indexOf("dependency:") === 0) {
          throw new Error('\u4E0D\u80FD\u8986\u76D6\u4F9D\u8D56\u5305\u4E2D\u7684\u6750\u6599 "' + lookupId + '"');
        }
        content_pack.writeDef(config.contentPackPath, ns, "materials", id, data);
        content_pack_manager.invalidateCache();
        log2.info('createMaterial: \u5DF2\u521B\u5EFA\u6750\u6599 "' + lookupId + '"');
      }
      function updateMaterial(config, id, data) {
        if (!content_pack_manager.isDefEditable(config, "materials", id)) {
          throw new Error('\u4E0D\u80FD\u4FEE\u6539\u5185\u7F6E\u6216\u4F9D\u8D56\u5305\u7684\u6750\u6599 "' + id + '"');
        }
        var meta = content_pack.readPackMeta(config.contentPackPath);
        if (!meta) {
          throw new Error("\u65E0\u6CD5\u8BFB\u53D6\u5185\u5BB9\u5305 meta.json: " + config.contentPackPath);
        }
        var ns = content_pack.resolveNamespace(meta.id);
        if (!ns) {
          throw new Error("\u65E0\u6CD5\u4ECE meta.id \u89E3\u6790 namespace: " + meta.id);
        }
        content_pack.writeDef(config.contentPackPath, ns, "materials", id, data);
        content_pack_manager.invalidateCache();
        log2.info('updateMaterial: \u5DF2\u66F4\u65B0\u6750\u6599 "' + id + '"');
      }
      function deleteMaterial(config, id) {
        if (!content_pack_manager.isDefEditable(config, "materials", id)) {
          throw new Error('\u4E0D\u80FD\u5220\u9664\u5185\u7F6E\u6216\u4F9D\u8D56\u5305\u7684\u6750\u6599 "' + id + '"');
        }
        var meta = content_pack.readPackMeta(config.contentPackPath);
        if (!meta) {
          throw new Error("\u65E0\u6CD5\u8BFB\u53D6\u5185\u5BB9\u5305 meta.json: " + config.contentPackPath);
        }
        var ns = content_pack.resolveNamespace(meta.id);
        if (!ns) {
          throw new Error("\u65E0\u6CD5\u4ECE meta.id \u89E3\u6790 namespace: " + meta.id);
        }
        content_pack.deleteDef(config.contentPackPath, ns, "materials", id);
        content_pack_manager.invalidateCache();
        log2.info('deleteMaterial: \u5DF2\u5220\u9664\u6750\u6599 "' + id + '"');
      }
      function getDefaultMaterialId(config) {
        return content_pack_manager.getFirstDefId(config, "materials");
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          listMaterials,
          createMaterial,
          updateMaterial,
          deleteMaterial,
          getDefaultMaterialId
        };
      }
    }
  });

  // src/ui/dialogs/material_dialog.js
  var require_material_dialog = __commonJS({
    "src/ui/dialogs/material_dialog.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { createLogger: createLogger2 } = require_logger();
      var { showToast: showToast2 } = require_notify();
      var material_manager = require_material_manager();
      var log2 = createLogger2("MaterialDialog");
      function _sourceLabel(source) {
        if (source === "builtin") return "\u5185\u7F6E";
        if (source && source.indexOf("dependency:") === 0) return "\u4F9D\u8D56";
        if (source === "current") return "\u5F53\u524D";
        return "\u672A\u77E5";
      }
      function _sourceColor(source) {
        if (source === "builtin") return "#888";
        if (source && source.indexOf("dependency:") === 0) return "#2196F3";
        if (source === "current") return "#4CAF50";
        return "#888";
      }
      function _buildMaterialListHtml(materials) {
        var i, m, sourceLabel, sourceColor, editable, editBtn, deleteBtn, rowColor;
        var rows = "";
        if (!materials || materials.length === 0) {
          return '<span style="color:#888;font-style:italic">\uFF08\u6682\u65E0\u6750\u6599\u5B9A\u4E49\uFF09</span>';
        }
        for (i = 0; i < materials.length; i++) {
          m = materials[i];
          sourceLabel = _sourceLabel(m.source);
          sourceColor = _sourceColor(m.source);
          editable = m.editable;
          editBtn = editable ? '<button class="mm_mat_edit" data-id="' + m.id + '" style="padding:2px 8px;margin:0 2px;cursor:pointer;border:1px solid #4CAF50;border-radius:3px;background:transparent;color:#4CAF50;font-size:12px">\u7F16\u8F91</button>' : '<span style="color:#888;font-size:12px;margin:0 4px">\uFF08\u53EA\u8BFB\uFF09</span>';
          deleteBtn = editable ? '<button class="mm_mat_delete" data-id="' + m.id + '" style="padding:2px 8px;margin:0 2px;cursor:pointer;border:1px solid #F44336;border-radius:3px;background:transparent;color:#F44336;font-size:12px">\u5220\u9664</button>' : "";
          rowColor = editable ? "#fff" : "#999";
          rows += '<tr style="border-bottom:1px solid #333"><td style="padding:6px 8px;color:' + rowColor + ';font-family:monospace;font-size:13px">' + _escapeHtml(m.id) + '</td><td style="padding:6px 8px"><span style="display:inline-block;padding:1px 6px;border-radius:3px;font-size:11px;color:' + sourceColor + ";border:1px solid " + sourceColor + '">' + sourceLabel + '</span></td><td style="padding:6px 8px;text-align:right;white-space:nowrap">' + editBtn + deleteBtn + "</td></tr>";
        }
        return '<table style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:2px solid #555"><th style="padding:6px 8px;text-align:left;font-size:12px;color:#aaa;font-weight:normal">\u6750\u6599 ID</th><th style="padding:6px 8px;text-align:left;font-size:12px;color:#aaa;font-weight:normal">\u6765\u6E90</th><th style="padding:6px 8px;text-align:right;font-size:12px;color:#aaa;font-weight:normal">\u64CD\u4F5C</th></tr></thead><tbody>' + rows + "</tbody></table>";
      }
      function _escapeHtml(str) {
        if (typeof str !== "string") return String(str || "");
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
      }
      function _getField(data, field, fallback) {
        if (data && typeof data[field] !== "undefined" && data[field] !== null) {
          return data[field];
        }
        return fallback;
      }
      function _validateFriction(fx, fy, fz) {
        return !Number.isNaN(fx) && Number.isFinite(fx) && fx >= 0 && !Number.isNaN(fy) && Number.isFinite(fy) && fy >= 0 && !Number.isNaN(fz) && Number.isFinite(fz) && fz >= 0;
      }
      function _showEditDialog(config, materialId, materialData, isNew) {
        var friction = _getField(materialData, "friction", [0.5, 0.5, 0.5]);
        var formFields = {};
        if (isNew) {
          formFields.newMaterialId = {
            type: "text",
            label: "\u6750\u6599 ID",
            value: "",
            description: "\u6750\u6599\u6807\u8BC6\u7B26\uFF0C\u5982 machine_max:steel"
          };
        } else {
          formFields.materialIdDisplay = {
            type: "info",
            text: "<b>\u6750\u6599 ID\uFF1A</b><code>" + _escapeHtml(materialId) + "</code>"
          };
        }
        formFields.frictionInfo = {
          type: "info",
          text: '<span style="color:#aaa;font-size:11px">\u6469\u64E6\u7CFB\u6570\u5411\u91CF [x, y, z]\uFF0C\u5404\u5206\u91CF \u2265 0</span>'
        };
        formFields.friction_x = {
          type: "number",
          label: "\u6469\u64E6\u7CFB\u6570 X",
          value: friction[0] !== void 0 ? friction[0] : 0.5,
          hint: "\u4FA7\u5411\u6469\u64E6\u7CFB\u6570"
        };
        formFields.friction_y = {
          type: "number",
          label: "\u6469\u64E6\u7CFB\u6570 Y",
          value: friction[1] !== void 0 ? friction[1] : 0.5,
          hint: "\u524D\u5411\u6469\u64E6\u7CFB\u6570"
        };
        formFields.friction_z = {
          type: "number",
          label: "\u6469\u64E6\u7CFB\u6570 Z",
          value: friction[2] !== void 0 ? friction[2] : 0.5,
          hint: "\u5782\u76F4\u6469\u64E6\u7CFB\u6570"
        };
        formFields.restitution = {
          type: "number",
          label: "\u6062\u590D\u7CFB\u6570",
          value: _getField(materialData, "restitution", 0.1),
          hint: "0.0\uFF08\u5B8C\u5168\u975E\u5F39\u6027\uFF09~ 1.0\uFF08\u5B8C\u5168\u5F39\u6027\uFF09"
        };
        formFields.density = {
          type: "number",
          label: "\u5BC6\u5EA6",
          value: _getField(materialData, "density", 1),
          hint: "\u6750\u6599\u5BC6\u5EA6\u503C"
        };
        formFields.armor_thickness = {
          type: "number",
          label: "\u88C5\u7532\u539A\u5EA6",
          value: _getField(materialData, "armor_thickness", 1),
          hint: "\u7B49\u6548\u88C5\u7532\u539A\u5EA6\u7CFB\u6570"
        };
        new Dialog({
          id: isNew ? "mm_material_create" : "mm_material_edit",
          title: isNew ? "\u65B0\u5EFA\u6750\u6599" : "\u7F16\u8F91\u6750\u6599 \u2014 " + materialId,
          width: 480,
          form: formFields,
          onConfirm: function(formData) {
            var id = isNew ? (formData.newMaterialId || "").trim() : materialId;
            if (isNew && !id) {
              showToast2("\u8BF7\u8F93\u5165\u6750\u6599 ID", "error");
              return false;
            }
            var fx = parseFloat(formData.friction_x);
            var fy = parseFloat(formData.friction_y);
            var fz = parseFloat(formData.friction_z);
            if (!_validateFriction(fx, fy, fz)) {
              showToast2("\u6469\u64E6\u7CFB\u6570\u5404\u5206\u91CF\u5FC5\u987B\u4E3A \u2265 0 \u7684\u6709\u6548\u6570\u5B57", "error");
              return false;
            }
            var restitution = parseFloat(formData.restitution);
            if (Number.isNaN(restitution) || restitution < 0 || restitution > 1) {
              showToast2("\u6062\u590D\u7CFB\u6570\u5FC5\u987B\u5728 0.0 ~ 1.0 \u4E4B\u95F4", "error");
              return false;
            }
            var density = parseFloat(formData.density);
            if (Number.isNaN(density) || density < 0) {
              showToast2("\u5BC6\u5EA6\u5FC5\u987B\u4E3A \u2265 0 \u7684\u6709\u6548\u6570\u5B57", "error");
              return false;
            }
            var armorThickness = parseFloat(formData.armor_thickness);
            if (Number.isNaN(armorThickness) || armorThickness < 0) {
              showToast2("\u88C5\u7532\u539A\u5EA6\u5FC5\u987B\u4E3A \u2265 0 \u7684\u6709\u6548\u6570\u5B57", "error");
              return false;
            }
            var data = {
              friction: [fx, fy, fz],
              restitution,
              density,
              armor_thickness: armorThickness
            };
            try {
              if (isNew) {
                material_manager.createMaterial(config, id, data);
                showToast2('\u6750\u6599 "' + id + '" \u5DF2\u521B\u5EFA', "positive");
                log2.info("\u6750\u6599\u5DF2\u521B\u5EFA", { id, data });
              } else {
                material_manager.updateMaterial(config, id, data);
                showToast2('\u6750\u6599 "' + id + '" \u5DF2\u66F4\u65B0', "positive");
                log2.info("\u6750\u6599\u5DF2\u66F4\u65B0", { id, data });
              }
              this.hide();
              showMaterialManagerDialog(config);
            } catch (e) {
              showToast2("\u64CD\u4F5C\u5931\u8D25: " + (e.message || e), "error");
              log2.error("\u6750\u6599\u4FDD\u5B58\u5931\u8D25", e);
              return false;
            }
          }
        }).show();
      }
      function _deleteWithConfirm(config, materialId) {
        new Dialog({
          id: "mm_material_delete_confirm",
          title: "\u786E\u8BA4\u5220\u9664",
          form: {
            confirmInfo: {
              type: "info",
              text: '\u786E\u8BA4\u5220\u9664\u6750\u6599 "<b>' + _escapeHtml(materialId) + '</b>" \u5417\uFF1F<br><br>\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF01'
            }
          },
          onConfirm: function() {
            try {
              material_manager.deleteMaterial(config, materialId);
              showToast2('\u6750\u6599 "' + materialId + '" \u5DF2\u5220\u9664', "warning");
              log2.info("\u6750\u6599\u5DF2\u5220\u9664", { id: materialId });
              this.hide();
              showMaterialManagerDialog(config);
            } catch (e) {
              showToast2("\u5220\u9664\u5931\u8D25: " + (e.message || e), "error");
              log2.error("\u6750\u6599\u5220\u9664\u5931\u8D25", e);
              return false;
            }
          }
        }).show();
      }
      function showMaterialManagerDialog(config) {
        var materials, listHtml, builtinCount, depCount, currentCount, i, infoText;
        var materialOptions = {};
        if (!config || typeof config !== "object") {
          showToast2("\u914D\u7F6E\u4E0D\u53EF\u7528\uFF0C\u8BF7\u5148\u6253\u5F00\u9879\u76EE", "warning");
          return;
        }
        try {
          materials = material_manager.listMaterials(config);
          listHtml = _buildMaterialListHtml(materials);
          builtinCount = 0;
          depCount = 0;
          currentCount = 0;
          for (i = 0; i < materials.length; i++) {
            if (materials[i].source === "builtin") builtinCount++;
            else if (materials[i].source && materials[i].source.indexOf("dependency:") === 0) depCount++;
            else if (materials[i].source === "current") currentCount++;
          }
          for (i = 0; i < materials.length; i++) {
            materialOptions[materials[i].id] = materials[i].id + " (" + _sourceLabel(materials[i].source) + ")";
          }
          infoText = '<div style="font-size:11px;color:#888;margin-bottom:4px"><span style="display:inline-block;margin-right:12px"><span style="color:#888">\u25CF</span> \u5185\u7F6E: ' + builtinCount + '</span><span style="display:inline-block;margin-right:12px"><span style="color:#2196F3">\u25CF</span> \u4F9D\u8D56: ' + depCount + '</span><span style="display:inline-block;margin-right:12px"><span style="color:#4CAF50">\u25CF</span> \u5F53\u524D: ' + currentCount + "</span></div>";
          new Dialog({
            id: "mm_material_manager",
            title: "\u6750\u6599\u7BA1\u7406\u5668",
            width: 640,
            form: {
              stats: {
                type: "info",
                text: infoText
              },
              materialList: {
                type: "info",
                text: listHtml
              },
              readOnlyNote: {
                type: "info",
                text: '<span style="color:#888;font-size:11px">\u5185\u7F6E\u548C\u4F9D\u8D56\u5305\u4E2D\u7684\u6750\u6599\u4E3A\u53EA\u8BFB\uFF0C\u4E0D\u53EF\u7F16\u8F91\u6216\u5220\u9664\u3002\u4EC5\u6709\u5F53\u524D\u5305\uFF08\u6765\u6E90\u6807\u8BB0\u4E3A"\u5F53\u524D"\uFF09\u7684\u6750\u6599\u53EF\u7F16\u8F91\u3002</span>'
              },
              action: {
                type: "select",
                label: "\u64CD\u4F5C",
                options: {
                  add: "\u65B0\u5EFA\u6750\u6599",
                  edit: "\u7F16\u8F91\u5DF2\u6709\u6750\u6599",
                  delete: "\u5220\u9664\u6750\u6599"
                },
                value: "add"
              },
              materialSelect: {
                type: "select",
                label: "\u9009\u62E9\u6750\u6599",
                options: materialOptions,
                value: "",
                description: "\u9009\u62E9\u8981\u7F16\u8F91\u6216\u5220\u9664\u7684\u6750\u6599\uFF08\u65B0\u5EFA\u64CD\u4F5C\u4E0D\u9700\u8981\u9009\u62E9\uFF09"
              }
            },
            onConfirm: function(formData) {
              var action = formData.action;
              var selectedId = formData.materialSelect;
              var selectedMat, mi;
              if (action === "add") {
                _showEditDialog(config, null, null, true);
                this.hide();
                return;
              }
              if (!selectedId) {
                showToast2("\u8BF7\u9009\u62E9\u4E00\u4E2A\u6750\u6599", "error");
                return false;
              }
              selectedMat = null;
              for (mi = 0; mi < materials.length; mi++) {
                if (materials[mi].id === selectedId) {
                  selectedMat = materials[mi];
                  break;
                }
              }
              if (!selectedMat) {
                showToast2('\u6750\u6599 "' + selectedId + '" \u672A\u627E\u5230', "error");
                return false;
              }
              if (action === "edit") {
                if (!selectedMat.editable) {
                  showToast2("\u4E0D\u80FD\u7F16\u8F91\u5185\u7F6E\u6216\u4F9D\u8D56\u5305\u4E2D\u7684\u6750\u6599", "warning");
                  return false;
                }
                _showEditDialog(config, selectedId, selectedMat.data, false);
                this.hide();
              } else if (action === "delete") {
                if (!selectedMat.editable) {
                  showToast2("\u4E0D\u80FD\u5220\u9664\u5185\u7F6E\u6216\u4F9D\u8D56\u5305\u4E2D\u7684\u6750\u6599", "warning");
                  return false;
                }
                _deleteWithConfirm(config, selectedId);
                this.hide();
              }
            }
          }).show();
        } catch (e) {
          log2.error("showMaterialManagerDialog \u5931\u8D25", e);
          showToast2("\u65E0\u6CD5\u6253\u5F00\u6750\u6599\u7BA1\u7406\u5668: " + (e.message || e), "error");
        }
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          showMaterialManagerDialog
        };
      }
    }
  });

  // src/core/subsystem_types.js
  var require_subsystem_types = __commonJS({
    "src/core/subsystem_types.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var SUBSYSTEM_TYPES = [
        // ===== power 分类 =====
        {
          id: "machine_max:engine",
          displayName: "\u53D1\u52A8\u673A",
          category: "power",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" },
            { field: "power_output", label: "\u529F\u7387\u8F93\u51FA\u76EE\u6807", editor: "power_target", required: true, defaultValue: "" },
            { field: "speed_outputs", label: "\u8F6C\u901F\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { engine_speed: ["subpart", "vehicle"] } }
          ]
        },
        {
          id: "machine_max:motor",
          displayName: "\u7535\u52A8\u673A",
          category: "power",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" },
            { field: "power_output", label: "\u529F\u7387\u8F93\u51FA\u76EE\u6807", editor: "power_target", required: true, defaultValue: "" },
            { field: "speed_outputs", label: "\u8F6C\u901F\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { motor_speed: ["subpart", "vehicle"] } }
          ]
        },
        {
          id: "machine_max:battery",
          displayName: "\u7535\u6C60",
          category: "power",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" }
          ]
        },
        {
          id: "machine_max:gearbox",
          displayName: "\u53D8\u901F\u7BB1",
          category: "power",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" },
            { field: "power_output", label: "\u529F\u7387\u8F93\u51FA\u76EE\u6807", editor: "power_target", required: true, defaultValue: "" },
            { field: "gear_outputs", label: "\u6321\u4F4D\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { gear: ["subpart", "vehicle"] } }
          ]
        },
        {
          id: "machine_max:transmission",
          displayName: "\u5206\u52A8\u7BB1",
          category: "power",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" },
            { field: "power_outputs", label: "\u529F\u7387\u8F93\u51FA\u5206\u914D", editor: "power_outputs_map", required: true, defaultValue: {} }
          ]
        },
        {
          id: "machine_max:motor_controller",
          displayName: "\u7535\u673A\u63A7\u5236\u5668",
          category: "power",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" },
            { field: "power_output", label: "\u529F\u7387\u8F93\u51FA\u76EE\u6807", editor: "power_target", required: true, defaultValue: "" },
            { field: "speed_outputs", label: "\u8F6C\u901F\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { motor_speed: ["subpart", "vehicle"] } }
          ]
        },
        // ===== control 分类 =====
        {
          id: "machine_max:car_controller",
          displayName: "\u8F66\u8F86\u63A7\u5236\u5668",
          category: "control",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" },
            { field: "control_outputs", label: "\u63A7\u5236\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: true, defaultValue: { car_control: [] } },
            { field: "speed_outputs", label: "\u901F\u5EA6\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { vehicle_speed: ["subpart", "vehicle"] } },
            { field: "throttle_outputs", label: "\u6CB9\u95E8\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { throttle: ["subpart", "vehicle"] } },
            { field: "steering_outputs", label: "\u8F6C\u5411\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { steering: ["subpart", "vehicle"] } },
            { field: "brake_outputs", label: "\u5239\u8F66\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { brake: ["subpart", "vehicle"] } },
            { field: "handbrake_outputs", label: "\u624B\u5239\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { handbrake: ["subpart", "vehicle"] } }
          ]
        },
        {
          id: "machine_max:motorbike_controller",
          displayName: "\u6469\u6258\u8F66\u63A7\u5236\u5668",
          category: "control",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" },
            { field: "control_outputs", label: "\u63A7\u5236\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: true, defaultValue: { car_control: [] } },
            { field: "speed_outputs", label: "\u901F\u5EA6\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { vehicle_speed: ["subpart", "vehicle"] } },
            { field: "throttle_outputs", label: "\u6CB9\u95E8\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { throttle: ["subpart", "vehicle"] } },
            { field: "steering_outputs", label: "\u8F6C\u5411\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { steering: ["subpart", "vehicle"] } },
            { field: "brake_outputs", label: "\u5239\u8F66\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { brake: ["subpart", "vehicle"] } },
            { field: "handbrake_outputs", label: "\u624B\u5239\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { handbrake: ["subpart", "vehicle"] } }
          ]
        },
        {
          id: "machine_max:signal_convert",
          displayName: "\u4FE1\u53F7\u8F6C\u6362\u5668",
          category: "control",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" }
          ]
        },
        // ===== utility 分类 =====
        {
          id: "machine_max:wheel_driver",
          displayName: "\u8F6E\u80CE\u9A71\u52A8\u5668",
          category: "utility",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" },
            { field: "connector", label: "\u5173\u8054\u8FDE\u63A5\u70B9", editor: "connector_selector", required: true, defaultValue: "" },
            { field: "roll_speed_outputs", label: "\u6EDA\u52A8\u901F\u5EA6\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: {} },
            { field: "steering_angle_outputs", label: "\u8F6C\u5411\u89D2\u5EA6\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: {} }
          ]
        },
        {
          id: "machine_max:seat",
          displayName: "\u5EA7\u4F4D",
          category: "utility",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" },
            { field: "locator", label: "\u5173\u8054\u5B9A\u4F4D\u5668", editor: "locator_selector", required: true, defaultValue: "" },
            { field: "move_outputs", label: "\u79FB\u52A8\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { move_control: [] } },
            { field: "aim_outputs", label: "\u7784\u51C6\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { aim: [] } },
            { field: "regular_outputs", label: "\u5E38\u89C4\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { regular_control: [] } },
            { field: "passenger_num_outputs", label: "\u4E58\u5BA2\u6570\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { passenger_num: ["subpart", "vehicle"] } }
          ]
        },
        {
          id: "machine_max:lighting",
          displayName: "\u706F\u5149",
          category: "utility",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" },
            { field: "locator", label: "\u5149\u6E90\u5B9A\u4F4D\u5668", editor: "locator_selector", required: false, defaultValue: "" }
          ]
        },
        {
          id: "machine_max:item_storage",
          displayName: "\u7269\u54C1\u5B58\u50A8",
          category: "utility",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" }
          ]
        },
        {
          id: "machine_max:basic",
          displayName: "\u57FA\u7840\uFF08\u65E0\u989D\u5916\u9762\u677F\uFF09",
          category: "utility",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" }
          ]
        },
        {
          id: "machine_max:joint",
          displayName: "\u5173\u8282",
          category: "utility",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" },
            { field: "locator", label: "\u5173\u8054\u5B9A\u4F4D\u5668", editor: "locator_selector", required: true, defaultValue: "" },
            {
              field: "rotation_order",
              label: "\u65CB\u8F6C\u987A\u5E8F",
              editor: "enum_selector",
              required: true,
              defaultValue: "XYZ",
              options: ["XYZ", "XZY", "YXZ", "ZYX", "ZXY", "YZX"]
            },
            { field: "axes", label: "\u5173\u8282\u8F74\u53C2\u6570", editor: "json_textarea", required: true, defaultValue: {} }
          ]
        },
        // ===== experimental 分类 =====
        {
          id: "machine_max:camera",
          displayName: "\u6444\u50CF\u5934",
          category: "experimental",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" }
          ]
        },
        {
          id: "machine_max:javascript",
          displayName: "JavaScript \u811A\u672C",
          category: "experimental",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" },
            { field: "script", label: "\u811A\u672C\u5185\u5BB9", editor: "text_input", required: false, defaultValue: "" }
          ]
        },
        {
          id: "machine_max:turret",
          displayName: "\u70AE\u5854",
          category: "experimental",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" },
            { field: "connector", label: "\u5173\u8054\u8FDE\u63A5\u70B9", editor: "connector_selector", required: true, defaultValue: "" },
            { field: "rotation_outputs", label: "\u89D2\u5EA6\u53CD\u9988\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: {} }
          ]
        },
        {
          id: "machine_max:fire_controller",
          displayName: "\u706B\u63A7\u7CFB\u7EDF",
          category: "experimental",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" },
            { field: "control_outputs", label: "\u63A7\u5236\u4FE1\u53F7\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: { fire_control: [] } }
          ]
        },
        {
          id: "machine_max:launcher",
          displayName: "\u53D1\u5C04\u5668",
          category: "experimental",
          dynamicFields: [
            { field: "definition", label: "\u578B\u53F7\u5B9A\u4E49", editor: "definition_selector", required: true, defaultValue: "" },
            { field: "locator", label: "\u53D1\u5C04\u70B9\u5B9A\u4F4D\u5668", editor: "locator_selector", required: true, defaultValue: "" },
            { field: "ammo_outputs", label: "\u5F39\u836F\u53CD\u9988\u8F93\u51FA", editor: "signal_targets", required: false, defaultValue: {} }
          ]
        }
      ];
      var TYPE_MAP = {};
      (function() {
        for (var i = 0; i < SUBSYSTEM_TYPES.length; i++) {
          TYPE_MAP[SUBSYSTEM_TYPES[i].id] = SUBSYSTEM_TYPES[i];
        }
      })();
      function getTypeMeta(typeId) {
        return TYPE_MAP[typeId] || null;
      }
      function getAllTypes() {
        return SUBSYSTEM_TYPES.slice();
      }
      function getTypesByCategory(category) {
        return SUBSYSTEM_TYPES.filter(function(t) {
          return t.category === category;
        });
      }
      function getTypesGroupedByCategory() {
        var result = { power: [], control: [], utility: [], experimental: [] };
        for (var i = 0; i < SUBSYSTEM_TYPES.length; i++) {
          var t = SUBSYSTEM_TYPES[i];
          if (result[t.category]) {
            result[t.category].push(t);
          }
        }
        return result;
      }
      function getDynamicFields(typeId) {
        var meta = TYPE_MAP[typeId];
        return meta ? meta.dynamicFields.slice() : [];
      }
      function getDynamicFieldNames(typeId) {
        var fields = getDynamicFields(typeId);
        var names = [];
        for (var i = 0; i < fields.length; i++) {
          names.push(fields[i].field);
        }
        return names;
      }
      function getTypeDefaults(typeId) {
        var fields = getDynamicFields(typeId);
        var result = {};
        for (var i = 0; i < fields.length; i++) {
          var f = fields[i];
          if (f.field === "definition") continue;
          result[f.field] = JSON.parse(JSON.stringify(f.defaultValue));
        }
        return result;
      }
      function getTypeSpecificFields(typeId) {
        return getDynamicFieldNames(typeId);
      }
      function needsLocator(typeId) {
        var fields = getDynamicFields(typeId);
        for (var i = 0; i < fields.length; i++) {
          if (fields[i].editor === "locator_selector") return true;
        }
        return false;
      }
      function needsConnector(typeId) {
        var fields = getDynamicFields(typeId);
        for (var i = 0; i < fields.length; i++) {
          if (fields[i].editor === "connector_selector") return true;
        }
        return false;
      }
      function getSignalOutputFieldNames(typeId) {
        var fields = getDynamicFields(typeId);
        var result = [];
        for (var i = 0; i < fields.length; i++) {
          var f = fields[i];
          if (f.editor === "signal_targets" || f.editor === "power_target" || f.editor === "power_outputs_map") {
            result.push(f.field);
          }
        }
        return result;
      }
      var EDITOR_LABELS = {
        definition_selector: "\u578B\u53F7\u5B9A\u4E49\u9009\u62E9\u5668",
        locator_selector: "\u5B9A\u4F4D\u5668\u9009\u62E9\u5668",
        connector_selector: "\u8FDE\u63A5\u70B9\u9009\u62E9\u5668",
        power_target: "\u529F\u7387\u76EE\u6807\u9009\u62E9\u5668",
        signal_targets: "\u4FE1\u53F7\u9891\u9053\u7F16\u8F91\u5668",
        power_outputs_map: "\u529F\u7387\u8F93\u51FA\u6620\u5C04\u7F16\u8F91\u5668",
        enum_selector: "\u679A\u4E3E\u4E0B\u62C9\u83DC\u5355",
        text_input: "\u6587\u672C\u8F93\u5165\u6846",
        json_textarea: "JSON \u7F16\u8F91\u6846"
      };
      function getEditorLabel(editorType) {
        return EDITOR_LABELS[editorType] || editorType;
      }
      var CATEGORY_COLORS = {
        power: "#e67e22",
        control: "#3498db",
        utility: "#2ecc71",
        experimental: "#9b59b6"
      };
      function getTypeColor(typeId) {
        var meta = TYPE_MAP[typeId];
        if (!meta) return "#888";
        return CATEGORY_COLORS[meta.category] || "#888";
      }
      var CATEGORY_LABELS = {
        power: "\u52A8\u529B",
        control: "\u63A7\u5236",
        utility: "\u529F\u80FD",
        experimental: "\u5B9E\u9A8C"
      };
      function getCategoryLabel(category) {
        return CATEGORY_LABELS[category] || category;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          SUBSYSTEM_TYPES,
          getTypeMeta,
          getAllTypes,
          getTypesByCategory,
          getTypesGroupedByCategory,
          getDynamicFields,
          getDynamicFieldNames,
          getTypeDefaults,
          getTypeSpecificFields,
          needsLocator,
          needsConnector,
          getSignalOutputFieldNames,
          getEditorLabel,
          getTypeColor,
          getCategoryLabel
        };
      }
    }
  });

  // src/generators/subsystem_generator.js
  var require_subsystem_generator = __commonJS({
    "src/generators/subsystem_generator.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { createLogger: createLogger2 } = require_logger();
      var fileWriter = require_file_writer();
      var { getTypeSpecificFields } = require_subsystem_types();
      var path = __require("path");
      var fs = __require("fs");
      var log2 = createLogger2("GenSubsystem");
      function copySubsystemDefs(packDir, ns, targetDir, flat) {
        var count = 0;
        var srcDir = path.join(packDir, ns, "subsystems");
        if (!fs.existsSync(srcDir)) {
          log2.warn("copySubsystemDefs: \u6E90\u76EE\u5F55\u4E0D\u5B58\u5728 " + srcDir);
          return 0;
        }
        var files = fs.readdirSync(srcDir);
        function resolveTarget(baseDir, id2, isFlat) {
          if (isFlat) return baseDir;
          var seg = id2.split("_")[0];
          return seg && seg.length > 0 ? path.join(baseDir, seg) : baseDir;
        }
        for (var i = 0; i < files.length; i++) {
          var fileName = files[i];
          if (!fileName.endsWith(".json")) continue;
          var srcFile = path.join(srcDir, fileName);
          try {
            var content = JSON.parse(fs.readFileSync(srcFile, "utf8"));
            var id = fileName.slice(0, -5);
            var loc = fileWriter.extractResourceLocation(id, ns);
            var tDir = resolveTarget(targetDir, loc.path, flat);
            fileWriter.writeJSONFile(tDir, loc.path + ".json", content);
            count++;
          } catch (e) {
            log2.warn("\u590D\u5236\u5B50\u7CFB\u7EDF\u6587\u4EF6\u5931\u8D25: " + srcFile, e);
          }
        }
        log2.info("copySubsystemDefs: \u5DF2\u590D\u5236 " + count + " \u4E2A\u5B50\u7CFB\u7EDF\u5B9A\u4E49");
        return count;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = { copySubsystemDefs, getTypeSpecificFields };
      }
    }
  });

  // src/managers/subsystem_manager.js
  var require_subsystem_manager = __commonJS({
    "src/managers/subsystem_manager.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var content_pack = require_content_pack();
      var content_pack_manager = require_content_pack_manager();
      var { getTypeSpecificFields } = require_subsystem_generator();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("SubsystemManager");
      var hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty);
      var DEF_TYPE = "subsystems";
      function getCurrentPackInfo(config) {
        var packDir, openResult;
        if (!config || !config.contentPackPath || typeof config.contentPackPath !== "string" || config.contentPackPath.trim() === "") {
          return { packDir: "", namespace: "", error: "\u672A\u8BBE\u7F6E\u5F53\u524D\u5185\u5BB9\u5305\u8DEF\u5F84" };
        }
        packDir = config.contentPackPath;
        openResult = content_pack.openContentPack(packDir);
        if (!openResult.valid) {
          return { packDir, namespace: "", error: "\u5F53\u524D\u5185\u5BB9\u5305\u65E0\u6548: " + openResult.error };
        }
        return { packDir, namespace: openResult.namespace, error: null };
      }
      function listSubsystems(config) {
        var merged, defs, sources, result, id;
        merged = content_pack_manager.loadMergedDefs(config, DEF_TYPE);
        defs = merged.defs;
        sources = merged.sources;
        result = [];
        for (id in defs) {
          if (hasOwn(defs, id)) {
            result.push({
              id,
              data: defs[id],
              source: sources[id] || "unknown",
              editable: sources[id] === "current"
            });
          }
        }
        log2.debug("listSubsystems: \u5171 " + result.length + " \u4E2A\u5B50\u7CFB\u7EDF\u5B9A\u4E49");
        return result;
      }
      function createSubsystem(config, id, data) {
        var packInfo, ns, lookupId, q;
        if (!id || typeof id !== "string") {
          return { success: false, error: "\u5B50\u7CFB\u7EDF ID \u65E0\u6548" };
        }
        packInfo = getCurrentPackInfo(config);
        if (packInfo.error) {
          return { success: false, error: packInfo.error };
        }
        ns = packInfo.namespace;
        lookupId = id.indexOf(":") >= 0 ? id : ns + ":" + id;
        try {
          q = content_pack_manager.resolveDefSource(config, DEF_TYPE, lookupId);
          if (q === "current") {
            return { success: false, error: '\u5B50\u7CFB\u7EDF\u5B9A\u4E49 "' + lookupId + '" \u5DF2\u5B58\u5728\uFF0C\u8BF7\u4F7F\u7528\u66F4\u65B0\u64CD\u4F5C' };
          }
          if (q && q.indexOf("dependency:") === 0) {
            return { success: false, error: '\u4E0D\u80FD\u8986\u76D6\u4F9D\u8D56\u5305\u4E2D\u7684\u5B50\u7CFB\u7EDF\u5B9A\u4E49 "' + lookupId + '"' };
          }
        } catch (e) {
          log2.warn("createSubsystem: resolveDefSource \u5F02\u5E38\uFF0C\u8DF3\u8FC7\u51B2\u7A81\u68C0\u6D4B", e);
        }
        try {
          content_pack.writeDef(packInfo.packDir, packInfo.namespace, DEF_TYPE, id, data);
          content_pack_manager.invalidateCache();
          log2.info("createSubsystem: \u5DF2\u521B\u5EFA\u5B50\u7CFB\u7EDF\u5B9A\u4E49 " + lookupId);
          return { success: true, error: null };
        } catch (e) {
          log2.error("createSubsystem: \u5199\u5165\u5931\u8D25", e);
          return { success: false, error: e.message };
        }
      }
      function updateSubsystem(config, id, data) {
        var packInfo;
        if (!id || typeof id !== "string") {
          return { success: false, error: "\u5B50\u7CFB\u7EDF ID \u65E0\u6548" };
        }
        if (!content_pack_manager.isDefEditable(config, DEF_TYPE, id)) {
          log2.warn("updateSubsystem: \u5B50\u7CFB\u7EDF " + id + " \u4E0D\u53EF\u7F16\u8F91");
          return { success: false, error: "\u5B50\u7CFB\u7EDF\u5B9A\u4E49 " + id + " \u4E0D\u53EF\u7F16\u8F91\uFF08\u6765\u81EA\u5185\u7F6E\u5305\u6216\u4F9D\u8D56\u5305\uFF09" };
        }
        packInfo = getCurrentPackInfo(config);
        if (packInfo.error) {
          return { success: false, error: packInfo.error };
        }
        try {
          content_pack.writeDef(packInfo.packDir, packInfo.namespace, DEF_TYPE, id, data);
          content_pack_manager.invalidateCache();
          log2.info("updateSubsystem: \u5DF2\u66F4\u65B0\u5B50\u7CFB\u7EDF\u5B9A\u4E49 " + id);
          return { success: true, error: null };
        } catch (e) {
          log2.error("updateSubsystem: \u5199\u5165\u5931\u8D25", e);
          return { success: false, error: e.message };
        }
      }
      function deleteSubsystem(config, id) {
        var packInfo;
        if (!id || typeof id !== "string") {
          return { success: false, error: "\u5B50\u7CFB\u7EDF ID \u65E0\u6548" };
        }
        if (!content_pack_manager.isDefEditable(config, DEF_TYPE, id)) {
          log2.warn("deleteSubsystem: \u5B50\u7CFB\u7EDF " + id + " \u4E0D\u53EF\u5220\u9664");
          return { success: false, error: "\u5B50\u7CFB\u7EDF\u5B9A\u4E49 " + id + " \u4E0D\u53EF\u5220\u9664\uFF08\u6765\u81EA\u5185\u7F6E\u5305\u6216\u4F9D\u8D56\u5305\uFF09" };
        }
        packInfo = getCurrentPackInfo(config);
        if (packInfo.error) {
          return { success: false, error: packInfo.error };
        }
        try {
          content_pack.deleteDef(packInfo.packDir, packInfo.namespace, DEF_TYPE, id);
          content_pack_manager.invalidateCache();
          log2.info("deleteSubsystem: \u5DF2\u5220\u9664\u5B50\u7CFB\u7EDF\u5B9A\u4E49 " + id);
          return { success: true, error: null };
        } catch (e) {
          log2.error("deleteSubsystem: \u5220\u9664\u5931\u8D25", e);
          return { success: false, error: e.message };
        }
      }
      function getSubsystemTypes() {
        var types = [
          "machine_max:engine",
          "machine_max:motor",
          "machine_max:gearbox",
          "machine_max:wheel_driver",
          "machine_max:seat",
          "machine_max:car_controller",
          "machine_max:motorbike_controller",
          "machine_max:transmission",
          "machine_max:lighting",
          "machine_max:item_storage",
          "machine_max:motor_controller",
          "machine_max:basic",
          "machine_max:battery",
          "machine_max:joint",
          "machine_max:signal_convert",
          "machine_max:camera",
          "machine_max:javascript",
          "machine_max:turret",
          "machine_max:fire_controller",
          "machine_max:launcher"
        ];
        log2.debug("getSubsystemTypes: \u5171 " + types.length + " \u79CD\u7C7B\u578B");
        return types.slice();
      }
      function getTypeFields(type) {
        var fields = getTypeSpecificFields(type);
        log2.debug("getTypeFields: \u7C7B\u578B " + type + " \u6709 " + fields.length + " \u4E2A\u7279\u6709\u5B57\u6BB5");
        return fields;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          listSubsystems,
          createSubsystem,
          updateSubsystem,
          deleteSubsystem,
          getSubsystemTypes,
          getTypeFields
        };
      }
    }
  });

  // src/ui/dialogs/subsystem_dialog.js
  var require_subsystem_dialog = __commonJS({
    "src/ui/dialogs/subsystem_dialog.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var subsystem_manager = require_subsystem_manager();
      var { showToast: showToast2 } = require_notify();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("SubsystemDialog");
      function _isConfigValid(config) {
        return config && typeof config === "object";
      }
      function _getTypeDisplayName(typeId) {
        var map = {
          "machine_max:engine": "\u5F15\u64CE (Engine)",
          "machine_max:motor": "\u7535\u673A (Motor)",
          "machine_max:gearbox": "\u53D8\u901F\u7BB1 (Gearbox)",
          "machine_max:wheel_driver": "\u8F6E\u6BC2\u7535\u673A (Wheel Driver)",
          "machine_max:seat": "\u5EA7\u6905 (Seat)",
          "machine_max:car_controller": "\u8F7F\u8F66\u63A7\u5236\u5668 (Car Controller)",
          "machine_max:motorbike_controller": "\u6469\u6258\u63A7\u5236\u5668 (Motorbike Controller)",
          "machine_max:transmission": "\u5206\u52A8\u5668 (Transmission)",
          "machine_max:lighting": "\u8F66\u706F (Lighting)",
          "machine_max:item_storage": "\u8D27\u7BB1 (Item Storage)",
          "machine_max:motor_controller": "\u7535\u673A\u63A7\u5236\u5668 (Motor Controller)",
          "machine_max:basic": "\u57FA\u7840 (Basic)",
          "machine_max:battery": "\u7535\u6C60 (Battery)",
          "machine_max:joint": "\u5173\u8282 (Joint)",
          "machine_max:signal_convert": "\u4FE1\u53F7\u8F6C\u6362\u5668 (Signal Convert)",
          "machine_max:camera": "\u6444\u50CF\u5934 (Camera)",
          "machine_max:javascript": "\u811A\u672C (JavaScript)",
          "machine_max:turret": "\u70AE\u5854 (Turret)",
          "machine_max:fire_controller": "\u5C04\u51FB\u63A7\u5236\u5668 (Fire Controller)",
          "machine_max:launcher": "\u53D1\u5C04\u5668 (Launcher)"
        };
        return map[typeId] || typeId;
      }
      function _getSourceLabel(source) {
        if (source === "current") return "\u5F53\u524D\u5305";
        if (source === "builtin") return "\u5185\u7F6E";
        if (source && source.indexOf("dependency:") === 0) return "\u4F9D\u8D56\u5305";
        return source || "\u672A\u77E5";
      }
      function _escapeHtml(str) {
        return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
      }
      function _buildSubsystemListHtml(subsystems) {
        if (!subsystems || subsystems.length === 0) {
          return '<p style="color:#888;font-style:italic">\u6682\u65E0\u5B50\u7CFB\u7EDF\u5B9A\u4E49\u3002\u70B9\u51FB"\u521B\u5EFA\u65B0\u5B50\u7CFB\u7EDF\u578B\u53F7"\u6DFB\u52A0\u7B2C\u4E00\u4E2A\u3002</p>';
        }
        var html = '<div style="max-height:200px;overflow-y:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#eaeaea"><th style="padding:3px 6px;text-align:left;border-bottom:1px solid #ccc">ID</th><th style="padding:3px 6px;text-align:left;border-bottom:1px solid #ccc">\u7C7B\u578B</th><th style="padding:3px 6px;text-align:left;border-bottom:1px solid #ccc">\u6765\u6E90</th></tr></thead><tbody>';
        var i, sub, typeLabel, sourceLabel, lockIcon;
        for (i = 0; i < subsystems.length; i++) {
          sub = subsystems[i];
          typeLabel = _getTypeDisplayName(sub.data && sub.data.type);
          sourceLabel = _getSourceLabel(sub.source);
          lockIcon = sub.editable ? "" : " \u{1F512}";
          html += '<tr><td style="padding:3px 6px;border-bottom:1px solid #eee;word-break:break-all">' + _escapeHtml(sub.id) + lockIcon + '</td><td style="padding:3px 6px;border-bottom:1px solid #eee">' + typeLabel + '</td><td style="padding:3px 6px;border-bottom:1px solid #eee">' + sourceLabel + "</td></tr>";
        }
        html += "</tbody></table></div>";
        return html;
      }
      function _buildTypeOptions() {
        var types = subsystem_manager.getSubsystemTypes();
        var options = {};
        var i;
        for (i = 0; i < types.length; i++) {
          options[types[i]] = _getTypeDisplayName(types[i]);
        }
        return options;
      }
      function _buildEditableOptions(subsystems) {
        var options = {};
        var i, sub;
        for (i = 0; i < subsystems.length; i++) {
          sub = subsystems[i];
          if (sub.editable) {
            options[sub.id] = sub.id + " (" + _getTypeDisplayName(sub.data && sub.data.type) + ")";
          }
        }
        return options;
      }
      var _typeOptions = null;
      function _getTypeOptions() {
        if (!_typeOptions) {
          _typeOptions = _buildTypeOptions();
        }
        return _typeOptions;
      }
      function _showCreateDialog(config) {
        try {
          new Dialog({
            id: "mm_subsystem_create",
            title: "\u521B\u5EFA\u65B0\u5B50\u7CFB\u7EDF\u578B\u53F7",
            width: 480,
            form: {
              subsystemId: {
                type: "text",
                label: "\u5B50\u7CFB\u7EDF ID",
                value: "",
                description: "\u5EFA\u8BAE\u683C\u5F0F: namespace:name\uFF0C\u4EC5\u9650\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u3001_ - . / :"
              },
              type: {
                type: "select",
                label: "\u5B50\u7CFB\u7EDF\u7C7B\u578B",
                options: _getTypeOptions(),
                value: "machine_max:basic",
                description: "\u9009\u62E9\u5B50\u7CFB\u7EDF\u529F\u80FD\u7C7B\u578B"
              },
              basic_durability: {
                type: "number",
                label: "\u57FA\u7840\u8010\u4E45\u5EA6",
                value: 20,
                description: "\u5B50\u7CFB\u7EDF\u57FA\u7840\u8010\u4E45\u5EA6\uFF0C\u964D\u81F3 0 \u65F6\u762B\u75EA\uFF08\u9ED8\u8BA4 20.0\uFF09"
              },
              pass_damage: {
                type: "checkbox",
                label: "\u4F20\u9012\u4F24\u5BB3",
                value: true,
                description: "\u82E5\u542F\u7528\uFF0C\u5B50\u7CFB\u7EDF\u53D7\u5230\u7684\u4F24\u5BB3\u4F1A\u4F20\u9012\u7ED9\u96F6\u4EF6"
              },
              limit_damage: {
                type: "checkbox",
                label: "\u9650\u5236\u4F24\u5BB3\u4F20\u9012",
                value: false,
                description: "\u82E5\u542F\u7528\uFF0C\u4F24\u5BB3\u4F20\u9012\u503C\u4E0D\u8D85\u8FC7\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6"
              },
              hidden: {
                type: "checkbox",
                label: "\u9690\u85CF\u663E\u793A",
                value: false,
                description: "\u82E5\u542F\u7528\uFF0C\u8BE5\u5B50\u7CFB\u7EDF\u4E0D\u4F1A\u5728 HUD \u7B49\u5904\u663E\u793A"
              }
            },
            onConfirm: function(formData) {
              var id = formData.subsystemId ? formData.subsystemId.trim() : "";
              if (!id) {
                showToast2("\u8BF7\u8F93\u5165\u5B50\u7CFB\u7EDF ID", "error");
                return false;
              }
              var data = {
                type: formData.type,
                basic_durability: parseFloat(formData.basic_durability) || 20,
                pass_damage: !!formData.pass_damage,
                limit_damage: !!formData.limit_damage,
                hidden: !!formData.hidden
              };
              var result = subsystem_manager.createSubsystem(config, id, data);
              if (!result.success) {
                showToast2("\u521B\u5EFA\u5931\u8D25: " + (result.error || "\u672A\u77E5\u9519\u8BEF"), "error");
                return false;
              }
              showToast2("\u5B50\u7CFB\u7EDF\u578B\u53F7 " + id + " \u521B\u5EFA\u6210\u529F", "positive");
              log2.info("\u5B50\u7CFB\u7EDF\u578B\u53F7\u521B\u5EFA\u6210\u529F", { id, type: data.type });
              this.hide();
            }
          }).show();
        } catch (e) {
          log2.error("_showCreateDialog \u5931\u8D25", e);
          showToast2("\u65E0\u6CD5\u6253\u5F00\u521B\u5EFA\u5BF9\u8BDD\u6846: " + (e.message || e), "error");
        }
      }
      function _showEditPickDialog(config) {
        var subsystems = subsystem_manager.listSubsystems(config);
        var editable = [];
        var i;
        for (i = 0; i < subsystems.length; i++) {
          if (subsystems[i].editable) {
            editable.push(subsystems[i]);
          }
        }
        if (editable.length === 0) {
          showToast2("\u6CA1\u6709\u53EF\u7F16\u8F91\u7684\u5B50\u7CFB\u7EDF\u5B9A\u4E49", "warning");
          return;
        }
        try {
          new Dialog({
            id: "mm_subsystem_edit_pick",
            title: "\u9009\u62E9\u8981\u7F16\u8F91\u7684\u5B50\u7CFB\u7EDF",
            width: 480,
            form: {
              subsystemId: {
                type: "select",
                label: "\u5B50\u7CFB\u7EDF",
                options: _buildEditableOptions(subsystems),
                value: editable[0].id,
                description: "\u9009\u62E9\u8981\u7F16\u8F91\u7684\u5B50\u7CFB\u7EDF\u578B\u53F7"
              }
            },
            onConfirm: function(formData) {
              this.hide();
              _showEditFormDialog(config, formData.subsystemId);
            }
          }).show();
        } catch (e) {
          log2.error("_showEditPickDialog \u5931\u8D25", e);
          showToast2("\u65E0\u6CD5\u6253\u5F00\u9009\u62E9\u5BF9\u8BDD\u6846: " + (e.message || e), "error");
        }
      }
      function _showEditFormDialog(config, subsystemId) {
        var subsystems = subsystem_manager.listSubsystems(config);
        var target = null;
        var i;
        for (i = 0; i < subsystems.length; i++) {
          if (subsystems[i].id === subsystemId) {
            target = subsystems[i];
            break;
          }
        }
        if (!target) {
          showToast2("\u672A\u627E\u5230\u5B50\u7CFB\u7EDF " + subsystemId, "error");
          return;
        }
        if (!target.editable) {
          showToast2("\u5B50\u7CFB\u7EDF " + subsystemId + " \u4E0D\u53EF\u7F16\u8F91\uFF08\u6765\u81EA\u5185\u7F6E\u5305\u6216\u4F9D\u8D56\u5305\uFF09", "error");
          return;
        }
        var data = target.data || {};
        var currentType = data.type || "machine_max:basic";
        try {
          new Dialog({
            id: "mm_subsystem_edit_form",
            title: "\u7F16\u8F91\u5B50\u7CFB\u7EDF: " + subsystemId,
            width: 480,
            form: {
              type: {
                type: "select",
                label: "\u5B50\u7CFB\u7EDF\u7C7B\u578B",
                options: _getTypeOptions(),
                value: currentType,
                description: "\u66F4\u6539\u7C7B\u578B\u4F1A\u5F71\u54CD\u7C7B\u578B\u7279\u6709\u5B57\u6BB5"
              },
              basic_durability: {
                type: "number",
                label: "\u57FA\u7840\u8010\u4E45\u5EA6",
                value: data.basic_durability !== void 0 ? data.basic_durability : 20,
                description: "\u5B50\u7CFB\u7EDF\u57FA\u7840\u8010\u4E45\u5EA6\uFF0C\u964D\u81F3 0 \u65F6\u762B\u75EA\uFF08\u9ED8\u8BA4 20.0\uFF09"
              },
              pass_damage: {
                type: "checkbox",
                label: "\u4F20\u9012\u4F24\u5BB3",
                value: data.pass_damage !== false,
                description: "\u82E5\u542F\u7528\uFF0C\u5B50\u7CFB\u7EDF\u53D7\u5230\u7684\u4F24\u5BB3\u4F1A\u4F20\u9012\u7ED9\u96F6\u4EF6"
              },
              limit_damage: {
                type: "checkbox",
                label: "\u9650\u5236\u4F24\u5BB3\u4F20\u9012",
                value: !!data.limit_damage,
                description: "\u82E5\u542F\u7528\uFF0C\u4F24\u5BB3\u4F20\u9012\u503C\u4E0D\u8D85\u8FC7\u5B50\u7CFB\u7EDF\u5269\u4F59\u8010\u4E45\u5EA6"
              },
              hidden: {
                type: "checkbox",
                label: "\u9690\u85CF\u663E\u793A",
                value: !!data.hidden,
                description: "\u82E5\u542F\u7528\uFF0C\u8BE5\u5B50\u7CFB\u7EDF\u4E0D\u4F1A\u5728 HUD \u7B49\u5904\u663E\u793A"
              }
            },
            onConfirm: function(formData) {
              var updatedData = {
                type: formData.type,
                basic_durability: parseFloat(formData.basic_durability) || 20,
                pass_damage: !!formData.pass_damage,
                limit_damage: !!formData.limit_damage,
                hidden: !!formData.hidden
              };
              var result = subsystem_manager.updateSubsystem(config, subsystemId, updatedData);
              if (!result.success) {
                showToast2("\u66F4\u65B0\u5931\u8D25: " + (result.error || "\u672A\u77E5\u9519\u8BEF"), "error");
                return false;
              }
              showToast2("\u5B50\u7CFB\u7EDF\u578B\u53F7 " + subsystemId + " \u5DF2\u66F4\u65B0", "positive");
              log2.info("\u5B50\u7CFB\u7EDF\u578B\u53F7\u5DF2\u66F4\u65B0", { id: subsystemId, type: updatedData.type });
              this.hide();
            }
          }).show();
        } catch (e) {
          log2.error("_showEditFormDialog \u5931\u8D25", e);
          showToast2("\u65E0\u6CD5\u6253\u5F00\u7F16\u8F91\u5BF9\u8BDD\u6846: " + (e.message || e), "error");
        }
      }
      function _showDeletePickDialog(config) {
        var subsystems = subsystem_manager.listSubsystems(config);
        var editable = [];
        var i;
        for (i = 0; i < subsystems.length; i++) {
          if (subsystems[i].editable) {
            editable.push(subsystems[i]);
          }
        }
        if (editable.length === 0) {
          showToast2("\u6CA1\u6709\u53EF\u5220\u9664\u7684\u5B50\u7CFB\u7EDF\u5B9A\u4E49", "warning");
          return;
        }
        try {
          new Dialog({
            id: "mm_subsystem_delete_pick",
            title: "\u9009\u62E9\u8981\u5220\u9664\u7684\u5B50\u7CFB\u7EDF",
            width: 480,
            form: {
              subsystemId: {
                type: "select",
                label: "\u5B50\u7CFB\u7EDF",
                options: _buildEditableOptions(subsystems),
                value: editable[0].id,
                description: "\u9009\u62E9\u8981\u5220\u9664\u7684\u5B50\u7CFB\u7EDF\u578B\u53F7\u3002\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF01"
              }
            },
            onConfirm: function(formData) {
              this.hide();
              _showDeleteConfirmDialog(config, formData.subsystemId);
            }
          }).show();
        } catch (e) {
          log2.error("_showDeletePickDialog \u5931\u8D25", e);
          showToast2("\u65E0\u6CD5\u6253\u5F00\u9009\u62E9\u5BF9\u8BDD\u6846: " + (e.message || e), "error");
        }
      }
      function _showDeleteConfirmDialog(config, subsystemId) {
        try {
          new Dialog({
            id: "mm_subsystem_delete_confirm",
            title: "\u786E\u8BA4\u5220\u9664",
            width: 420,
            form: {
              confirmText: {
                type: "info",
                text: "\u786E\u5B9A\u8981\u5220\u9664\u5B50\u7CFB\u7EDF\u578B\u53F7 <b>" + _escapeHtml(subsystemId) + '</b> \u5417\uFF1F<br><br><span style="color:#c00">\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF01</span>'
              }
            },
            onConfirm: function() {
              var result = subsystem_manager.deleteSubsystem(config, subsystemId);
              if (!result.success) {
                showToast2("\u5220\u9664\u5931\u8D25: " + (result.error || "\u672A\u77E5\u9519\u8BEF"), "error");
                return false;
              }
              showToast2("\u5B50\u7CFB\u7EDF\u578B\u53F7 " + subsystemId + " \u5DF2\u5220\u9664", "positive");
              log2.info("\u5B50\u7CFB\u7EDF\u578B\u53F7\u5DF2\u5220\u9664", { id: subsystemId });
              this.hide();
            }
          }).show();
        } catch (e) {
          log2.error("_showDeleteConfirmDialog \u5931\u8D25", e);
          showToast2("\u65E0\u6CD5\u6253\u5F00\u786E\u8BA4\u5BF9\u8BDD\u6846: " + (e.message || e), "error");
        }
      }
      function showSubsystemManagerDialog(config, onSave) {
        if (!_isConfigValid(config)) {
          showToast2("\u914D\u7F6E\u4E0D\u53EF\u7528\uFF0C\u8BF7\u5148\u6253\u5F00\u9879\u76EE", "warning");
          return;
        }
        var subsystems = subsystem_manager.listSubsystems(config);
        var listHtml = _buildSubsystemListHtml(subsystems);
        try {
          new Dialog({
            id: "mm_subsystem_manager",
            title: "\u7BA1\u7406\u5B50\u7CFB\u7EDF\u578B\u53F7",
            width: 560,
            form: {
              listInfo: {
                type: "info",
                text: "<b>\u5F53\u524D\u5B50\u7CFB\u7EDF\u578B\u53F7\u5217\u8868</b><br><br>" + listHtml + '<br><span style="color:#888;font-size:11px">\u{1F512} \u8868\u793A\u6765\u81EA\u5185\u7F6E\u5305\u6216\u4F9D\u8D56\u5305\uFF0C\u4E0D\u53EF\u7F16\u8F91\u6216\u5220\u9664\u3002</span>'
              },
              action: {
                type: "select",
                label: "\u9009\u62E9\u64CD\u4F5C",
                options: {
                  create: "\u521B\u5EFA\u65B0\u5B50\u7CFB\u7EDF\u578B\u53F7",
                  edit: "\u7F16\u8F91\u5DF2\u6709\u5B50\u7CFB\u7EDF\u578B\u53F7",
                  delete: "\u5220\u9664\u5B50\u7CFB\u7EDF\u578B\u53F7"
                },
                value: "create"
              }
            },
            onConfirm: function(formData) {
              this.hide();
              try {
                if (formData.action === "create") {
                  _showCreateDialog(config);
                } else if (formData.action === "edit") {
                  _showEditPickDialog(config);
                } else if (formData.action === "delete") {
                  _showDeletePickDialog(config);
                }
              } catch (e) {
                log2.error("\u6267\u884C\u64CD\u4F5C\u5931\u8D25", e);
                showToast2("\u64CD\u4F5C\u5931\u8D25: " + (e.message || e), "error");
              }
              if (typeof onSave === "function") {
                onSave(config);
              }
            }
          }).show();
        } catch (e) {
          log2.error("showSubsystemManagerDialog \u5931\u8D25", e);
          showToast2("\u65E0\u6CD5\u6253\u5F00\u7BA1\u7406\u5BF9\u8BDD\u6846: " + (e.message || e), "error");
        }
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          showSubsystemManagerDialog
        };
      }
    }
  });

  // src/managers/connector_manager.js
  var require_connector_manager = __commonJS({
    "src/managers/connector_manager.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var content_pack = require_content_pack();
      var content_pack_manager = require_content_pack_manager();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("ConnectorManager");
      function listConnectors(config) {
        var merged, ids, result, i, id;
        merged = content_pack_manager.loadMergedDefs(config, "connectors");
        ids = Object.keys(merged.defs);
        result = [];
        for (i = 0; i < ids.length; i++) {
          id = ids[i];
          result.push({
            id,
            data: merged.defs[id],
            source: merged.sources[id],
            editable: content_pack_manager.isDefEditable(config, "connectors", id)
          });
        }
        log2.debug("listConnectors: \u5171 " + result.length + " \u4E2A\u8FDE\u63A5\u5668");
        return result;
      }
      function createConnector(config, id, data) {
        var source, meta, ns, lookupId;
        if (!config || !config.contentPackPath) {
          throw new Error("\u5F53\u524D\u6CA1\u6709\u5173\u8054\u7684\u5185\u5BB9\u5305\uFF0C\u65E0\u6CD5\u521B\u5EFA\u8FDE\u63A5\u5668");
        }
        meta = content_pack.readPackMeta(config.contentPackPath);
        if (!meta) {
          throw new Error("\u65E0\u6CD5\u8BFB\u53D6\u5185\u5BB9\u5305 meta.json: " + config.contentPackPath);
        }
        ns = content_pack.resolveNamespace(meta.id);
        if (!ns) {
          throw new Error("\u65E0\u6CD5\u4ECE meta.id \u89E3\u6790 namespace: " + meta.id);
        }
        lookupId = id.indexOf(":") >= 0 ? id : ns + ":" + id;
        source = content_pack_manager.resolveDefSource(config, "connectors", lookupId);
        if (source === "current") {
          throw new Error('\u8FDE\u63A5\u5668 "' + lookupId + '" \u5DF2\u5B58\u5728\uFF0C\u8BF7\u4F7F\u7528\u66F4\u65B0\u64CD\u4F5C');
        }
        if (source && source.indexOf("dependency:") === 0) {
          throw new Error('\u4E0D\u80FD\u8986\u76D6\u4F9D\u8D56\u5305\u4E2D\u7684\u8FDE\u63A5\u5668 "' + lookupId + '"');
        }
        content_pack.writeDef(config.contentPackPath, ns, "connectors", id, data);
        content_pack_manager.invalidateCache();
        log2.info('createConnector: \u5DF2\u521B\u5EFA\u8FDE\u63A5\u5668 "' + lookupId + '"');
      }
      function updateConnector(config, id, data) {
        var meta, ns;
        if (!content_pack_manager.isDefEditable(config, "connectors", id)) {
          throw new Error('\u4E0D\u80FD\u4FEE\u6539\u5185\u7F6E\u6216\u4F9D\u8D56\u5305\u7684\u8FDE\u63A5\u5668 "' + id + '"');
        }
        meta = content_pack.readPackMeta(config.contentPackPath);
        if (!meta) {
          throw new Error("\u65E0\u6CD5\u8BFB\u53D6\u5185\u5BB9\u5305 meta.json: " + config.contentPackPath);
        }
        ns = content_pack.resolveNamespace(meta.id);
        if (!ns) {
          throw new Error("\u65E0\u6CD5\u4ECE meta.id \u89E3\u6790 namespace: " + meta.id);
        }
        content_pack.writeDef(config.contentPackPath, ns, "connectors", id, data);
        content_pack_manager.invalidateCache();
        log2.info('updateConnector: \u5DF2\u66F4\u65B0\u8FDE\u63A5\u5668 "' + id + '"');
      }
      function deleteConnector(config, id) {
        var meta, ns;
        if (!content_pack_manager.isDefEditable(config, "connectors", id)) {
          throw new Error('\u4E0D\u80FD\u5220\u9664\u5185\u7F6E\u6216\u4F9D\u8D56\u5305\u7684\u8FDE\u63A5\u5668 "' + id + '"');
        }
        meta = content_pack.readPackMeta(config.contentPackPath);
        if (!meta) {
          throw new Error("\u65E0\u6CD5\u8BFB\u53D6\u5185\u5BB9\u5305 meta.json: " + config.contentPackPath);
        }
        ns = content_pack.resolveNamespace(meta.id);
        if (!ns) {
          throw new Error("\u65E0\u6CD5\u4ECE meta.id \u89E3\u6790 namespace: " + meta.id);
        }
        content_pack.deleteDef(config.contentPackPath, ns, "connectors", id);
        content_pack_manager.invalidateCache();
        log2.info('deleteConnector: \u5DF2\u5220\u9664\u8FDE\u63A5\u5668 "' + id + '"');
      }
      function getConnectorTypes() {
        return ["Simple", "Advanced"];
      }
      function getConnectorDirections() {
        return ["xp", "yp", "zp", "xn", "yn", "zn"];
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          listConnectors,
          createConnector,
          updateConnector,
          deleteConnector,
          getConnectorTypes,
          getConnectorDirections
        };
      }
    }
  });

  // src/ui/dialogs/connector_dialog.js
  var require_connector_dialog = __commonJS({
    "src/ui/dialogs/connector_dialog.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var connector_manager = require_connector_manager();
      var { showToast: showToast2 } = require_notify();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("ConnectorDialog");
      var DIRECTION_LABELS = {
        xp: "X+ (\u4E1C)",
        yp: "Y+ (\u4E0A)",
        zp: "Z+ (\u5357)",
        xn: "X- (\u897F)",
        yn: "Y- (\u4E0B)",
        zn: "Z- (\u5317)"
      };
      var SOURCE_LABELS = {
        current: "\u5F53\u524D\u5305",
        builtin: "\u5185\u7F6E"
      };
      function _isConfigValid(config) {
        return config && typeof config === "object";
      }
      function _hasContentPack(config) {
        return config && config.contentPackPath;
      }
      function _getConnectorTypeLabel(type) {
        return type === "Advanced" ? "Advanced\uFF08\u9AD8\u7EA7\uFF09" : "Simple\uFF08\u7B80\u5355\uFF09";
      }
      function _getDirectionLabel(dir) {
        return DIRECTION_LABELS[dir] || dir;
      }
      function _getSourceLabel(source) {
        if (SOURCE_LABELS[source]) return SOURCE_LABELS[source];
        if (source && source.indexOf("dependency:") === 0) {
          return "\u4F9D\u8D56\u5305";
        }
        return source || "\u672A\u77E5";
      }
      function _isReadOnly(item) {
        return !item || !item.editable;
      }
      function _buildConnectorListHtml(items) {
        if (!items || items.length === 0) {
          return '<p style="color:#888;text-align:center;padding:12px 0">\uFF08\u6682\u65E0\u8FDE\u63A5\u70B9\u5B9A\u4E49\uFF09</p>';
        }
        var rows = "";
        var i, item, data, typeLabel, dirLabel, sourceLabel, readonlyBadge;
        for (i = 0; i < items.length; i++) {
          item = items[i];
          data = item.data || {};
          typeLabel = _getConnectorTypeLabel(data.type);
          dirLabel = _getDirectionLabel(data.direction);
          sourceLabel = _getSourceLabel(item.source);
          readonlyBadge = _isReadOnly(item) ? ' <span style="color:#999;font-size:10px">[\u53EA\u8BFB]</span>' : "";
          rows += '<tr><td style="padding:4px 8px;border-bottom:1px solid #333;font-family:monospace;font-size:12px">' + item.id + readonlyBadge + '</td><td style="padding:4px 8px;border-bottom:1px solid #333;font-size:12px">' + typeLabel + '</td><td style="padding:4px 8px;border-bottom:1px solid #333;font-size:12px">' + dirLabel + '</td><td style="padding:4px 8px;border-bottom:1px solid #333;font-size:11px;color:#888">' + sourceLabel + "</td></tr>";
        }
        return '<table style="width:100%;border-collapse:collapse"><thead><tr><th style="padding:4px 8px;border-bottom:2px solid #555;text-align:left;font-size:11px;color:#aaa">ID</th><th style="padding:4px 8px;border-bottom:2px solid #555;text-align:left;font-size:11px;color:#aaa">\u7C7B\u578B</th><th style="padding:4px 8px;border-bottom:2px solid #555;text-align:left;font-size:11px;color:#aaa">\u65B9\u5411</th><th style="padding:4px 8px;border-bottom:2px solid #555;text-align:left;font-size:11px;color:#aaa">\u6765\u6E90</th></tr></thead><tbody>' + rows + "</tbody></table>";
      }
      function _getDefaultConnectorData() {
        return {
          type: "Simple",
          direction: "xp",
          integrity: 1,
          damage_reduction: 0,
          damage_multiplier: 1,
          damage_absorption: 0
        };
      }
      function _extractConnectorData(formData) {
        return {
          type: formData.connType || "Simple",
          direction: formData.connDirection || "xp",
          integrity: parseFloat(formData.connIntegrity) || 0,
          damage_reduction: parseFloat(formData.connDamageReduction) || 0,
          damage_multiplier: parseFloat(formData.connDamageMultiplier) || 0,
          damage_absorption: parseFloat(formData.connDamageAbsorption) || 0
        };
      }
      function _showConnectorEditDialog(config, existingId, existingData, onSaved) {
        var isEdit = !!existingId;
        var defaultData = existingData || _getDefaultConnectorData();
        try {
          new Dialog({
            id: isEdit ? "mm_connector_edit" : "mm_connector_create",
            title: isEdit ? "\u7F16\u8F91\u8FDE\u63A5\u70B9\u5B9A\u4E49" : "\u521B\u5EFA\u65B0\u8FDE\u63A5\u70B9\u5B9A\u4E49",
            width: 460,
            form: {
              connId: {
                type: "text",
                label: "\u8FDE\u63A5\u70B9 ID",
                value: existingId || "",
                description: "\u683C\u5F0F\uFF1Anamespace:name\u3002\u65B0\u5EFA\u65F6\u8BF7\u4F7F\u7528\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u3001_ - . / :"
              },
              connType: {
                type: "select",
                label: "\u8FDE\u63A5\u7C7B\u578B",
                options: {
                  Simple: "Simple\uFF08\u7B80\u5355\uFF09",
                  Advanced: "Advanced\uFF08\u9AD8\u7EA7\uFF09"
                },
                value: defaultData.type || "Simple",
                description: "Simple=\u521A\u6027\u65E0\u5173\u8282\uFF0CAdvanced=\u652F\u6301\u7269\u7406\u5173\u8282\u53C2\u6570"
              },
              connDirection: {
                type: "select",
                label: "\u8FDE\u63A5\u65B9\u5411",
                options: {
                  xp: "X+\uFF08\u4E1C\uFF09",
                  yp: "Y+\uFF08\u4E0A\uFF09",
                  zp: "Z+\uFF08\u5357\uFF09",
                  xn: "X-\uFF08\u897F\uFF09",
                  yn: "Y-\uFF08\u4E0B\uFF09",
                  zn: "Z-\uFF08\u5317\uFF09"
                },
                value: defaultData.direction || "xp",
                description: "\u8FDE\u63A5\u70B9\u7684\u671D\u5411\uFF0C\u4E0E\u96F6\u4EF6\u78B0\u649E\u7BB1\u76F8\u5BF9\u4F4D\u7F6E\u6709\u5173"
              },
              connIntegrity: {
                type: "number",
                label: "\u7ED3\u6784\u5B8C\u6574\u6027\uFF08integrity\uFF09",
                value: defaultData.integrity !== void 0 ? defaultData.integrity : 1,
                description: "\u8FDE\u63A5\u7684\u7ED3\u6784\u5F3A\u5EA6\uFF0C0=\u6781\u5F31\uFF0C1=\u6807\u51C6"
              },
              connDamageReduction: {
                type: "number",
                label: "\u4F24\u5BB3\u51CF\u514D\uFF08damage_reduction\uFF09",
                value: defaultData.damage_reduction !== void 0 ? defaultData.damage_reduction : 0,
                description: "\u901A\u8FC7\u6B64\u8FDE\u63A5\u4F20\u8F93\u7684\u4F24\u5BB3\u51CF\u514D\u6BD4\u4F8B\uFF0C0.0=\u65E0\u51CF\u514D"
              },
              connDamageMultiplier: {
                type: "number",
                label: "\u4F24\u5BB3\u500D\u7387\uFF08damage_multiplier\uFF09",
                value: defaultData.damage_multiplier !== void 0 ? defaultData.damage_multiplier : 1,
                description: "\u901A\u8FC7\u6B64\u8FDE\u63A5\u4F20\u8F93\u7684\u4F24\u5BB3\u500D\u7387\uFF0C1.0=\u6807\u51C6\u500D\u7387"
              },
              connDamageAbsorption: {
                type: "number",
                label: "\u4F24\u5BB3\u5438\u6536\uFF08damage_absorption\uFF09",
                value: defaultData.damage_absorption !== void 0 ? defaultData.damage_absorption : 0,
                description: "\u8FDE\u63A5\u672C\u8EAB\u80FD\u5438\u6536\u7684\u4F24\u5BB3\u91CF\uFF0C\u8D85\u8FC7\u540E\u8FDE\u63A5\u65AD\u88C2"
              },
              infoAdvanced: {
                type: "info",
                text: '<span style="color:#888;font-size:11px">\u63D0\u793A\uFF1A\u8FDE\u63A5\u5173\u8282\uFF08joints\uFF09\u548C\u6807\u7B7E\uFF08tags\uFF09\u7B49\u9AD8\u7EA7\u5B57\u6BB5\u5C06\u5728\u540E\u7EED\u7248\u672C\u4E2D\u63D0\u4F9B\u3002</span>'
              }
            },
            onConfirm: function(formData) {
              var id = formData.connId ? formData.connId.trim() : "";
              if (!id) {
                showToast2("\u8BF7\u8F93\u5165\u8FDE\u63A5\u70B9 ID", "error");
                return false;
              }
              var data = _extractConnectorData(formData);
              try {
                if (isEdit) {
                  connector_manager.updateConnector(config, id, data);
                  showToast2('\u8FDE\u63A5\u70B9 "' + id + '" \u5DF2\u66F4\u65B0', "positive");
                  log2.info('connector_dialog: \u5DF2\u66F4\u65B0\u8FDE\u63A5\u70B9 "' + id + '"');
                } else {
                  connector_manager.createConnector(config, id, data);
                  showToast2('\u8FDE\u63A5\u70B9 "' + id + '" \u5DF2\u521B\u5EFA', "positive");
                  log2.info('connector_dialog: \u5DF2\u521B\u5EFA\u8FDE\u63A5\u70B9 "' + id + '"');
                }
                if (typeof onSaved === "function") onSaved(config);
                this.hide();
              } catch (e) {
                showToast2("\u64CD\u4F5C\u5931\u8D25: " + (e.message || e), "error");
                log2.error("connector_dialog: \u4FDD\u5B58\u8FDE\u63A5\u70B9\u5931\u8D25", e);
                return false;
              }
            }
          }).show();
        } catch (e) {
          log2.error("connector_dialog: " + (isEdit ? "\u7F16\u8F91" : "\u521B\u5EFA") + "\u5BF9\u8BDD\u6846\u6253\u5F00\u5931\u8D25", e);
          showToast2("\u65E0\u6CD5\u6253\u5F00\u8FDE\u63A5\u70B9\u7F16\u8F91\u5BF9\u8BDD\u6846: " + (e.message || e), "error");
        }
      }
      function _showConnectorDeleteConfirm(config, id, onSaved) {
        try {
          new Dialog({
            id: "mm_connector_delete",
            title: "\u5220\u9664\u8FDE\u63A5\u70B9\u5B9A\u4E49",
            width: 400,
            form: {
              confirmInfo: {
                type: "info",
                text: '<span style="color:#e74c3c">\u786E\u5B9A\u8981\u5220\u9664\u8FDE\u63A5\u70B9 "<code>' + id + '</code>" \u5417\uFF1F</span><br><br>\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002'
              },
              confirm: {
                type: "checkbox",
                label: "\u6211\u786E\u8BA4\u8981\u5220\u9664\u6B64\u8FDE\u63A5\u70B9",
                value: false
              }
            },
            onConfirm: function(formData) {
              if (!formData.confirm) {
                showToast2("\u8BF7\u5148\u52FE\u9009\u786E\u8BA4\u6846", "warning");
                return false;
              }
              try {
                connector_manager.deleteConnector(config, id);
                showToast2('\u8FDE\u63A5\u70B9 "' + id + '" \u5DF2\u5220\u9664', "positive");
                log2.info('connector_dialog: \u5DF2\u5220\u9664\u8FDE\u63A5\u70B9 "' + id + '"');
                if (typeof onSaved === "function") onSaved(config);
                this.hide();
              } catch (e) {
                showToast2("\u5220\u9664\u5931\u8D25: " + (e.message || e), "error");
                log2.error("connector_dialog: \u5220\u9664\u8FDE\u63A5\u70B9\u5931\u8D25", e);
                return false;
              }
            }
          }).show();
        } catch (e) {
          log2.error("connector_dialog: \u5220\u9664\u5BF9\u8BDD\u6846\u6253\u5F00\u5931\u8D25", e);
          showToast2("\u65E0\u6CD5\u6253\u5F00\u5220\u9664\u5BF9\u8BDD\u6846: " + (e.message || e), "error");
        }
      }
      function showConnectorManagerDialog(config) {
        if (!_isConfigValid(config)) {
          showToast2("\u914D\u7F6E\u4E0D\u53EF\u7528\uFF0C\u8BF7\u5148\u6253\u5F00\u9879\u76EE", "warning");
          return;
        }
        var connectors = connector_manager.listConnectors(config);
        var listHtml = _buildConnectorListHtml(connectors);
        var hasContentPack = _hasContentPack(config);
        try {
          new Dialog({
            id: "mm_connector_manager",
            title: "\u8FDE\u63A5\u70B9\u5B9A\u4E49\u7BA1\u7406",
            width: 640,
            form: {
              connectorList: {
                type: "info",
                text: "<b>\u5DF2\u5B9A\u4E49\u7684\u8FDE\u63A5\u70B9\uFF1A</b><br><br>" + listHtml + '<br><span style="color:#888;font-size:11px">\u63D0\u793A\uFF1A\u8FDE\u63A5\u70B9\u5B9A\u4E49\u96F6\u4EF6\u4E4B\u95F4\u7684\u8FDE\u63A5\u89C4\u5219\u3002\u8FDE\u63A5\u65B9\u5411\u51B3\u5B9A\u96F6\u4EF6\u5728\u54EA\u4E2A\u9762\u53EF\u4EE5\u4E0E\u5176\u4ED6\u96F6\u4EF6\u5BF9\u63A5\u3002</span>'
              },
              action: {
                type: "select",
                label: "\u9009\u62E9\u64CD\u4F5C",
                options: {
                  create: "\u521B\u5EFA\u65B0\u8FDE\u63A5\u70B9",
                  edit: "\u7F16\u8F91\u5DF2\u6709\u8FDE\u63A5\u70B9",
                  delete: "\u5220\u9664\u8FDE\u63A5\u70B9"
                },
                value: "create"
              },
              connectorId: {
                type: "text",
                label: "\u8FDE\u63A5\u70B9 ID\uFF08\u7F16\u8F91/\u5220\u9664\u65F6\u586B\u5199\uFF09",
                value: "",
                description: "\u9009\u62E9\u7F16\u8F91\u6216\u5220\u9664\u64CD\u4F5C\u65F6\uFF0C\u5728\u6B64\u8F93\u5165\u76EE\u6807\u8FDE\u63A5\u70B9\u7684\u5B8C\u6574 ID"
              }
            },
            onConfirm: function(formData) {
              var action = formData.action;
              var connId = formData.connectorId ? formData.connectorId.trim() : "";
              var editItem, delItem, i;
              this.hide();
              try {
                if (action === "create") {
                  if (!hasContentPack) {
                    showToast2("\u8BF7\u5148\u5173\u8054\u5185\u5BB9\u5305\uFF0C\u518D\u521B\u5EFA\u8FDE\u63A5\u70B9", "warning");
                    return;
                  }
                  _showConnectorEditDialog(config, null, null, function() {
                    showConnectorManagerDialog(config);
                  });
                } else if (action === "edit") {
                  if (!connId) {
                    showToast2("\u8BF7\u586B\u5199\u8981\u7F16\u8F91\u7684\u8FDE\u63A5\u70B9 ID", "warning");
                    return;
                  }
                  if (!hasContentPack) {
                    showToast2("\u6CA1\u6709\u5173\u8054\u5185\u5BB9\u5305\uFF0C\u65E0\u6CD5\u7F16\u8F91", "warning");
                    return;
                  }
                  editItem = null;
                  for (i = 0; i < connectors.length; i++) {
                    if (connectors[i].id === connId) {
                      editItem = connectors[i];
                      break;
                    }
                  }
                  if (!editItem) {
                    showToast2('\u672A\u627E\u5230\u8FDE\u63A5\u70B9 "' + connId + '"', "error");
                    return;
                  }
                  if (_isReadOnly(editItem)) {
                    showToast2("\u4E0D\u80FD\u7F16\u8F91\u5185\u7F6E\u6216\u4F9D\u8D56\u5305\u4E2D\u7684\u8FDE\u63A5\u70B9", "warning");
                    return;
                  }
                  _showConnectorEditDialog(config, connId, editItem.data, function() {
                    showConnectorManagerDialog(config);
                  });
                } else if (action === "delete") {
                  if (!connId) {
                    showToast2("\u8BF7\u586B\u5199\u8981\u5220\u9664\u7684\u8FDE\u63A5\u70B9 ID", "warning");
                    return;
                  }
                  if (!hasContentPack) {
                    showToast2("\u6CA1\u6709\u5173\u8054\u5185\u5BB9\u5305\uFF0C\u65E0\u6CD5\u5220\u9664", "warning");
                    return;
                  }
                  delItem = null;
                  for (i = 0; i < connectors.length; i++) {
                    if (connectors[i].id === connId) {
                      delItem = connectors[i];
                      break;
                    }
                  }
                  if (!delItem) {
                    showToast2('\u672A\u627E\u5230\u8FDE\u63A5\u70B9 "' + connId + '"', "error");
                    return;
                  }
                  if (_isReadOnly(delItem)) {
                    showToast2("\u4E0D\u80FD\u5220\u9664\u5185\u7F6E\u6216\u4F9D\u8D56\u5305\u4E2D\u7684\u8FDE\u63A5\u70B9", "warning");
                    return;
                  }
                  _showConnectorDeleteConfirm(config, connId, function() {
                    showConnectorManagerDialog(config);
                  });
                }
              } catch (e) {
                log2.error("connector_dialog: \u64CD\u4F5C\u5931\u8D25", e);
                showToast2("\u64CD\u4F5C\u5931\u8D25: " + (e.message || e), "error");
              }
            }
          }).show();
        } catch (e) {
          log2.error("connector_dialog: \u4E3B\u5BF9\u8BDD\u6846\u6253\u5F00\u5931\u8D25", e);
          showToast2("\u65E0\u6CD5\u6253\u5F00\u8FDE\u63A5\u70B9\u7BA1\u7406\u5668: " + (e.message || e), "error");
        }
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          showConnectorManagerDialog
        };
      }
    }
  });

  // src/generators/meta_generator.js
  var require_meta_generator = __commonJS({
    "src/generators/meta_generator.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("GenMeta");
      function generateMeta(projectConfig) {
        var pm = projectConfig.packMeta || {};
        var packId = pm.id || (Project ? Project.name || "content_pack" : "content_pack");
        packId = packId.toLowerCase().replace(/[^a-z0-9_\-.:/]/g, "_");
        var result = {
          id: packId,
          version: pm.version || "1.0",
          name: { text: pm.name || packId.split(":")[1] || packId },
          author: { text: pm.author || "Anonymous" },
          description: { text: pm.description || "" }
        };
        var deps = pm.dependencies || [];
        if (deps.length > 0) {
          result.dependencies = deps.map(function(dep) {
            var depId = dep.id || dep;
            var depType = dep.type || "hard";
            return { id: depId, type: depType };
          });
        }
        if (typeof pm.enable_auto_pack === "boolean") {
          result.enable_auto_pack = pm.enable_auto_pack;
        }
        var parts = projectConfig.parts || {};
        var partIds = Object.keys(parts);
        log2.info("generateMeta: \u5305ID=" + result.id + ", \u96F6\u4EF6\u6570=" + partIds.length);
        return result;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = { generateMeta };
      }
    }
  });

  // src/generators/lang_generator.js
  var require_lang_generator = __commonJS({
    "src/generators/lang_generator.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("GenLang");
      function generateLangEntries(projectConfig, locale) {
        const lang = {};
        const ns = projectConfig.namespace || "machine_max";
        const parts = projectConfig.parts || {};
        for (const partId of Object.keys(parts)) {
          const key = `item.${ns}.${partId}`;
          const displayName = partId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          lang[key] = displayName;
        }
        return lang;
      }
      function generateAllLangs(projectConfig) {
        const result = {};
        result["zh_cn"] = generateLangEntries(projectConfig, "zh_cn");
        result["en_us"] = generateLangEntries(projectConfig, "en_us");
        const ns = projectConfig.namespace || "machine_max";
        const parts = projectConfig.parts || {};
        for (const partId of Object.keys(parts)) {
          const displayName = partId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          result["en_us"][`item.${ns}.${partId}`] = displayName;
        }
        log2.info("generateAllLangs: \u5DF2\u751F\u6210\u672C\u5730\u5316\uFF0C\u96F6\u4EF6\u6570=" + Object.keys(parts).length);
        return result;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = { generateLangEntries, generateAllLangs };
      }
    }
  });

  // src/generators/part_generator.js
  var require_part_generator = __commonJS({
    "src/generators/part_generator.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { createLogger: createLogger2 } = require_logger();
      var subsystemTypes = require_subsystem_types();
      var log2 = createLogger2("GenPart");
      function generatePartJSON(partId, partConfig, namespace) {
        const ns = namespace || "machine_max";
        const output = {};
        const topFields = [
          "icon",
          "vehicle_durability_rate",
          "vehicle_damage_rate",
          "vehicle_damage_rate_destroyed",
          "functional_threshold",
          "share_durability",
          "max_stack_size"
        ];
        for (const field of topFields) {
          if (partConfig[field] !== void 0 && partConfig[field] !== null) {
            output[field] = partConfig[field];
          }
        }
        const variants = partConfig.variants || {};
        const variantKeys = Object.keys(variants);
        if (variantKeys.length === 1 && variantKeys[0] === "default") {
          output.variants = buildVariantOutput(variants["default"], ns);
        } else if (variantKeys.length > 0) {
          output.variants = {};
          for (const [vName, variant] of Object.entries(variants)) {
            output.variants[vName] = buildVariantOutput(variant, ns);
          }
        }
        log2.debug("generatePartJSON: \u96F6\u4EF6 " + partId + " \u751F\u6210\u5B8C\u6210");
        return output;
      }
      function buildVariantOutput(variant, ns) {
        const out = {};
        if (variant.model) out.model = variant.model;
        if (variant.textures) out.textures = variant.textures;
        if (variant.animations) out.animations = variant.animations;
        if (variant.tags && variant.tags.length > 0) out.tags = variant.tags;
        const subParts = variant.sub_parts || {};
        const spKeys = Object.keys(subParts);
        if (spKeys.length === 1 && spKeys[0] === "sub_part.machine_max.main") {
          out.sub_parts = buildSubPartOutput(subParts["sub_part.machine_max.main"]);
        } else if (spKeys.length > 0) {
          out.sub_parts = {};
          for (const [spName, sp] of Object.entries(subParts)) {
            out.sub_parts[spName] = buildSubPartOutput(sp);
          }
        }
        return out;
      }
      function buildSubPartOutput(sp) {
        const out = {};
        if (sp.start_bone) out.start_bone = sp.start_bone;
        if (sp.end_bones && sp.end_bones.length > 0) out.end_bones = sp.end_bones;
        if (sp.durability !== 20) out.durability = sp.durability;
        if (sp.mass !== 25) out.mass = sp.mass;
        if (sp.mass_center && sp.mass_center !== "mass_center") out.mass_center = sp.mass_center;
        if (sp.projected_area && !sp.projected_area.every((v) => v === 0)) out.projected_area = sp.projected_area;
        if (sp.block_collision && sp.block_collision !== "true") out.block_collision = sp.block_collision;
        if (sp.collision_height !== -1) out.collision_height = sp.collision_height;
        if (sp.climb_assist) out.climb_assist = true;
        if (sp.hydro_priority !== 0) out.hydro_priority = sp.hydro_priority;
        if (sp.hit_boxes && Object.keys(sp.hit_boxes).length > 0) out.hit_boxes = _resolveUUIDKeys(sp.hit_boxes);
        if (sp.interact_boxes && Object.keys(sp.interact_boxes).length > 0) {
          out.interact_boxes = _resolveUUIDKeys(sp.interact_boxes);
          for (var ibKey in out.interact_boxes) {
            delete out.interact_boxes[ibKey]._uuid;
          }
        }
        if (sp.connectors && Object.keys(sp.connectors).length > 0) out.connectors = _cleanConnectors(sp.connectors);
        if (sp.subsystems && Object.keys(sp.subsystems).length > 0) out.subsystems = _cleanSubsystems(sp.subsystems);
        if (sp.hydrodynamics) out.hydrodynamics = sp.hydrodynamics;
        return out;
      }
      function _cleanSubsystems(subsystems) {
        var result = {};
        for (var key in subsystems) {
          var ss = subsystems[key];
          var typeId = ss.type;
          var allowedFields = subsystemTypes.getDynamicFieldNames(typeId);
          if (allowedFields.length > 0) {
            allowedFields.unshift("type");
          }
          if (allowedFields.length <= 1) {
            log2.warn('_cleanSubsystems: \u672A\u77E5\u5B50\u7CFB\u7EDF\u7C7B\u578B "' + typeId + '"\uFF0C\u4F7F\u7528\u56DE\u9000\u8FC7\u6EE4\u7B56\u7565');
            allowedFields = _inferDynamicFields(ss);
          }
          var cleaned = {};
          for (var fi = 0; fi < allowedFields.length; fi++) {
            var field = allowedFields[fi];
            var val = ss[field];
            if (val === void 0 || val === null) continue;
            if (typeof val === "object" && !Array.isArray(val) && Object.keys(val).length === 0) continue;
            if (typeof val === "string" && val === "") continue;
            cleaned[field] = val;
          }
          result[key] = cleaned;
        }
        return result;
      }
      function _inferDynamicFields(ss) {
        var fields = ["type", "definition"];
        for (var sf in ss) {
          if (sf === "type" || sf === "definition") continue;
          if (sf.endsWith("_outputs") || sf.endsWith("_inputs") || sf === "power_output") {
            fields.push(sf);
          }
        }
        return fields;
      }
      function _cleanConnectors(connectors) {
        var result = {};
        for (var key in connectors) {
          var conn = connectors[key];
          var cleaned = {};
          if (conn.locator) cleaned.locator = conn.locator;
          if (conn.definition) cleaned.definition = conn.definition;
          if (conn.signal_targets && Object.keys(conn.signal_targets).length > 0) {
            cleaned.signal_targets = conn.signal_targets;
          }
          if (conn.signal_translations && Object.keys(conn.signal_translations).length > 0) {
            cleaned.signal_translations = conn.signal_translations;
          }
          if (conn.power_target) {
            cleaned.power_target = conn.power_target;
          }
          if (conn.internal) {
            cleaned.internal = true;
          }
          if (conn.overwrite && Object.keys(conn.overwrite).length > 0) {
            cleaned.overwrite = conn.overwrite;
          }
          result[key] = cleaned;
        }
        return result;
      }
      function _resolveUUIDKeys(obj) {
        var resolved = {};
        for (var key in obj) {
          var boneName = key;
          if (typeof Group !== "undefined" && Group.all) {
            var group = Group.all.find(function(g) {
              return g.uuid === key;
            });
            if (group) boneName = group.name;
          }
          resolved[boneName] = obj[key];
        }
        return resolved;
      }
      function generateAllParts(projectConfig) {
        const ns = projectConfig.namespace || "machine_max";
        const parts = projectConfig.parts || {};
        const result = {};
        for (const [partId, partConfig] of Object.entries(parts)) {
          result[partId] = generatePartJSON(partId, partConfig, ns);
        }
        log2.info("generateAllParts: \u5DF2\u751F\u6210 " + Object.keys(result).length + " \u4E2A\u96F6\u4EF6");
        return result;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = { generatePartJSON, generateAllParts };
      }
    }
  });

  // src/generators/connector_generator.js
  var require_connector_generator = __commonJS({
    "src/generators/connector_generator.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { createLogger: createLogger2 } = require_logger();
      var fileWriter = require_file_writer();
      var path = __require("path");
      var fs = __require("fs");
      var log2 = createLogger2("GenConnector");
      function copyConnectorDefs(packDir, ns, targetDir, flat) {
        var count = 0;
        var srcDir = path.join(packDir, ns, "connectors");
        if (!fs.existsSync(srcDir)) {
          log2.warn("copyConnectorDefs: \u6E90\u76EE\u5F55\u4E0D\u5B58\u5728 " + srcDir);
          return 0;
        }
        var files = fs.readdirSync(srcDir);
        function resolveTarget(baseDir, id2, isFlat) {
          if (isFlat) return baseDir;
          var seg = id2.split("_")[0];
          return seg && seg.length > 0 ? path.join(baseDir, seg) : baseDir;
        }
        for (var i = 0; i < files.length; i++) {
          var fileName = files[i];
          if (!fileName.endsWith(".json")) continue;
          var srcFile = path.join(srcDir, fileName);
          try {
            var content = JSON.parse(fs.readFileSync(srcFile, "utf8"));
            var id = fileName.slice(0, -5);
            var loc = fileWriter.extractResourceLocation(id, ns);
            var tDir = resolveTarget(targetDir, loc.path, flat);
            fileWriter.writeJSONFile(tDir, loc.path + ".json", content);
            count++;
          } catch (e) {
            log2.warn("\u590D\u5236\u8FDE\u63A5\u70B9\u6587\u4EF6\u5931\u8D25: " + srcFile, e);
          }
        }
        log2.info("copyConnectorDefs: \u5DF2\u590D\u5236 " + count + " \u4E2A\u8FDE\u63A5\u70B9\u5B9A\u4E49");
        return count;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = { copyConnectorDefs };
      }
    }
  });

  // src/generators/material_generator.js
  var require_material_generator = __commonJS({
    "src/generators/material_generator.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { createLogger: createLogger2 } = require_logger();
      var fileWriter = require_file_writer();
      var path = __require("path");
      var fs = __require("fs");
      var log2 = createLogger2("GenMaterial");
      function copyMaterialDefs(packDir, ns, targetDir) {
        var count = 0;
        var srcDir = path.join(packDir, ns, "materials");
        if (!fs.existsSync(srcDir)) {
          log2.warn("copyMaterialDefs: \u6E90\u76EE\u5F55\u4E0D\u5B58\u5728 " + srcDir);
          return 0;
        }
        var files = fs.readdirSync(srcDir);
        for (var i = 0; i < files.length; i++) {
          var fileName = files[i];
          if (!fileName.endsWith(".json")) continue;
          var srcFile = path.join(srcDir, fileName);
          try {
            var content = JSON.parse(fs.readFileSync(srcFile, "utf8"));
            var id = fileName.slice(0, -5);
            var loc = fileWriter.extractResourceLocation(id, ns);
            fileWriter.writeJSONFile(targetDir, loc.path + ".json", content);
            count++;
          } catch (e) {
            log2.warn("\u590D\u5236\u6750\u6599\u6587\u4EF6\u5931\u8D25: " + srcFile, e);
          }
        }
        log2.info("copyMaterialDefs: \u5DF2\u590D\u5236 " + count + " \u4E2A\u6750\u6599\u5B9A\u4E49");
        return count;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = { copyMaterialDefs };
      }
    }
  });

  // src/ui/menu.js
  var require_menu = __commonJS({
    "src/ui/menu.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { createLogger: createLogger2 } = require_logger();
      var { getConfig, saveConfig, addDependencyPath } = require_persistence();
      var { showToast: showToast2 } = require_notify();
      var { runValidation } = require_mode();
      var content_pack = require_content_pack();
      var fileWriter = require_file_writer();
      var log2 = createLogger2("Menu");
      var _machineMaxMenu = null;
      function registerMachineMaxMenu2() {
        if (_machineMaxMenu) {
          log2.debug("registerMachineMaxMenu: \u83DC\u5355\u5DF2\u5B58\u5728\uFF0C\u8DF3\u8FC7");
          return _machineMaxMenu;
        }
        if (MenuBar && MenuBar.menus && MenuBar.menus["machine_max"]) {
          _machineMaxMenu = MenuBar.menus["machine_max"];
          log2.debug("registerMachineMaxMenu: \u4ECE MenuBar.menus \u6062\u590D\u5F15\u7528\uFF08\u70ED\u91CD\u8F7D\uFF09");
          return _machineMaxMenu;
        }
        _machineMaxMenu = new BarMenu("machine_max", [
          {
            name: "\u5BFC\u51FA\u5185\u5BB9\u5305",
            icon: "fa-file-export",
            id: "mm_menu_export",
            click: function() {
              log2.info("MachineMax \u83DC\u5355: \u70B9\u51FB\u5BFC\u51FA\u5185\u5BB9\u5305");
              var config = getConfig();
              if (!config) {
                showToast2("\u8BF7\u5148\u6253\u5F00\u9879\u76EE", "warning");
                return;
              }
              _ensurePackValid(config, function(valid) {
                if (valid) {
                  _showExportDialog();
                } else {
                  showToast2("\u8BF7\u5148\u8BBE\u7F6E\u6709\u6548\u7684\u5185\u5BB9\u5305", "warning");
                }
              });
            }
          },
          "_",
          {
            name: "\u65B0\u5EFA\u5E76\u5207\u6362\u81F3\u5185\u5BB9\u5305",
            icon: "fa-plus-circle",
            id: "mm_menu_new_pack",
            click: function() {
              log2.info("MachineMax \u83DC\u5355: \u70B9\u51FB\u65B0\u5EFA\u5E76\u5207\u6362\u81F3\u5185\u5BB9\u5305");
              var config = getConfig();
              if (!config) {
                showToast2("\u8BF7\u5148\u6253\u5F00\u9879\u76EE", "warning");
                return;
              }
              var pd = require_pack_setup_dialog();
              pd.showCreatePackDialog(config, function(updatedConfig) {
              });
            }
          },
          {
            name: "\u5207\u6362\u81F3\u5DF2\u6709\u5185\u5BB9\u5305",
            icon: "fa-folder-open",
            id: "mm_menu_open_pack",
            click: function() {
              log2.info("MachineMax \u83DC\u5355: \u70B9\u51FB\u5207\u6362\u81F3\u5DF2\u6709\u5185\u5BB9\u5305");
              var config = getConfig();
              if (!config) {
                showToast2("\u8BF7\u5148\u6253\u5F00\u9879\u76EE", "warning");
                return;
              }
              var pd = require_pack_setup_dialog();
              pd.showOpenPackDialog(config, function(updatedConfig) {
                saveConfig();
                showToast2("\u5DF2\u5207\u6362\u81F3\u5185\u5BB9\u5305", "positive");
              });
            }
          },
          {
            name: "\u7F16\u8F91\u5185\u5BB9\u5305\u4FE1\u606F",
            icon: "fa-edit",
            id: "mm_menu_edit_meta",
            click: function() {
              log2.info("MachineMax \u83DC\u5355: \u70B9\u51FB\u7F16\u8F91\u5185\u5BB9\u5305\u4FE1\u606F");
              var config = getConfig();
              if (!config) {
                showToast2("\u8BF7\u5148\u6253\u5F00\u9879\u76EE", "warning");
                return;
              }
              _ensurePackValid(config, function() {
                _showPackSettingsDialog();
              });
            }
          },
          "_",
          {
            name: "\u521B\u5EFA/\u7BA1\u7406\u6750\u6599\u7C7B\u578B",
            icon: "Texture",
            id: "mm_menu_materials",
            click: function() {
              var config = getConfig();
              if (!config) {
                showToast2("\u8BF7\u5148\u6253\u5F00\u9879\u76EE", "warning");
                return;
              }
              require_material_dialog().showMaterialManagerDialog(config);
            }
          },
          {
            name: "\u7BA1\u7406\u5B50\u7CFB\u7EDF\u578B\u53F7",
            icon: "precision_manufacturing",
            id: "mm_menu_subsystems",
            click: function() {
              var config = getConfig();
              if (!config) {
                showToast2("\u8BF7\u5148\u6253\u5F00\u9879\u76EE", "warning");
                return;
              }
              require_subsystem_dialog().showSubsystemManagerDialog(config);
            }
          },
          {
            name: "\u7BA1\u7406\u8FDE\u63A5\u70B9\u5B9A\u4E49",
            icon: "link",
            id: "mm_menu_connectors",
            click: function() {
              var config = getConfig();
              if (!config) {
                showToast2("\u8BF7\u5148\u6253\u5F00\u9879\u76EE", "warning");
                return;
              }
              require_connector_dialog().showConnectorManagerDialog(config);
            }
          }
        ], {
          name: "MachineMax",
          icon: "precision_manufacturing"
        });
        MenuBar.addMenu(_machineMaxMenu, "tools");
        log2.info("MachineMax \u5E38\u9A7B\u83DC\u5355\u5DF2\u6CE8\u518C\uFF08\u4F4D\u4E8E Tools \u4E4B\u540E\uFF0C\u6A21\u5F0F\u65E0\u5173\uFF09");
        return _machineMaxMenu;
      }
      function unregisterMachineMaxMenu2() {
        if (_machineMaxMenu) {
          try {
            _machineMaxMenu.delete();
            log2.info("MachineMax \u83DC\u5355\u5DF2\u6CE8\u9500");
          } catch (e) {
            log2.error("\u6CE8\u9500 MachineMax \u83DC\u5355\u5931\u8D25", e);
          }
          _machineMaxMenu = null;
        }
      }
      function _ensurePackValid(config, onResult) {
        if (!config) {
          if (typeof onResult === "function") onResult(false, config);
          return;
        }
        if (config.contentPackPath) {
          var result = content_pack.openContentPack(config.contentPackPath);
          if (result.valid) {
            if (typeof onResult === "function") onResult(true, config);
            return;
          }
          log2.warn("\u5185\u5BB9\u5305\u8DEF\u5F84\u65E0\u6548\uFF0C\u5C06\u5F39\u51FA\u5411\u5BFC", { path: config.contentPackPath, error: result.error });
        }
        var pd = require_pack_setup_dialog();
        pd.showPackSetupDialog(config, function(updatedConfig) {
          saveConfig();
          if (updatedConfig.contentPackPath) {
            var checkResult = content_pack.openContentPack(updatedConfig.contentPackPath);
            if (typeof onResult === "function") onResult(checkResult.valid, updatedConfig);
          } else {
            if (typeof onResult === "function") onResult(false, updatedConfig);
          }
        });
      }
      function _getDefaultExportDir(pm) {
        var path = __require("path");
        var cached = pm && pm.exportDir;
        if (cached) return cached;
        var config = getConfig();
        if (config && config.contentPackPath) {
          return path.dirname(config.contentPackPath);
        }
        var bbmodelPath = Project && Project.file_path ? Project.file_path : "";
        if (bbmodelPath) {
          return path.join(path.dirname(bbmodelPath), "machine_max_content_pack");
        }
        return "";
      }
      function _showPackSettingsDialog() {
        var config = getConfig();
        if (!config) {
          showToast2("\u8BF7\u5148\u6253\u5F00\u9879\u76EE", "warning");
          return;
        }
        var pm = config.packMeta || {};
        var ns = config.namespace || "machine_max";
        var defaultPackId = pm.id || ns + ":" + (Project ? Project.name || "content_pack" : "content_pack");
        var defaultExportDir = pm.exportDir || _getDefaultExportDir(pm);
        try {
          new Dialog({
            title: "MachineMax \u5185\u5BB9\u5305\u8BBE\u7F6E",
            width: 520,
            form: {
              packId: {
                type: "text",
                label: "\u5305 ID\uFF08ResourceLocation\uFF09",
                value: defaultPackId,
                description: "\u683C\u5F0F\u4E3A namespace:pack_name\uFF0C\u5982 machine_max:wine_fox_parts\u3002\u4EC5\u9650\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u3001_ - . / :"
              },
              packVersion: {
                type: "text",
                label: "\u7248\u672C\u53F7",
                value: pm.version || "1.0",
                description: "\u9075\u5FAA SemVer \u683C\u5F0F\uFF0C\u5982 1.0.0"
              },
              packName: {
                type: "text",
                label: "\u663E\u793A\u540D\u79F0",
                value: pm.name || "",
                description: "\u5185\u5BB9\u5305\u7684\u663E\u793A\u540D\u79F0\uFF08\u652F\u6301 Minecraft \u6587\u672C\u7EC4\u4EF6\u683C\u5F0F\uFF09"
              },
              packAuthor: {
                type: "text",
                label: "\u4F5C\u8005",
                value: pm.author || "",
                description: "\u5185\u5BB9\u5305\u4F5C\u8005\u540D"
              },
              packDescription: {
                type: "textarea",
                label: "\u63CF\u8FF0",
                value: pm.description || "",
                height: 90,
                description: "\u5185\u5BB9\u5305\u63CF\u8FF0\u4FE1\u606F"
              },
              exportDir: {
                type: "folder",
                label: "\u9ED8\u8BA4\u5BFC\u51FA\u76EE\u5F55",
                value: defaultExportDir,
                description: "\u70B9\u51FB\u53F3\u4FA7\u6D4F\u89C8\u6309\u94AE\u9009\u62E9\u5185\u5BB9\u5305\u9ED8\u8BA4\u5BFC\u51FA\u76EE\u5F55"
              },
              enableAutoPack: {
                type: "checkbox",
                label: "\u542F\u7528\u81EA\u52A8\u6253\u5305",
                value: pm.enable_auto_pack !== false,
                description: "\u4EC5 Mod \u5F00\u53D1\u9700\u8981\u8003\u8651\u6B64\u9009\u9879\u3002\u82E5\u542F\u7528\uFF0CSpark-Core \u5C06\u5728\u542F\u52A8\u65F6\u81EA\u52A8\u4ECE Mod \u8D44\u6E90\u4E2D\u6253\u5305 .zip\u3002\u4E00\u822C\u5185\u5BB9\u5305\u4F5C\u8005\u4FDD\u6301\u5173\u95ED\u5373\u53EF\u3002"
              },
              flatExport: {
                type: "checkbox",
                label: "\u6241\u5E73\u5316\u5BFC\u51FA",
                value: pm.flat_export !== false,
                description: "\u82E5\u542F\u7528\uFF0C\u96F6\u4EF6/\u5B50\u7CFB\u7EDF/\u8FDE\u63A5\u70B9\u5C06\u6241\u5E73\u5B58\u653E\uFF1B\u5173\u95ED\u5219\u6309\u6A21\u578B\u540D\u5206\u5165\u5B50\u6587\u4EF6\u5939"
              },
              manageDeps: {
                type: "checkbox",
                label: "\u4FDD\u5B58\u540E\u7BA1\u7406\u4F9D\u8D56\u5305",
                value: false,
                description: "\u4FDD\u5B58\u5143\u6570\u636E\u540E\u7ACB\u5373\u8FDB\u5165\u4F9D\u8D56\u7BA1\u7406\u754C\u9762\uFF0C\u53EF\u6DFB\u52A0/\u79FB\u9664\u672C\u5730\u8DEF\u5F84\u4F9D\u8D56\u53CA\u94FE\u5F0F\u89E3\u6790\u3002"
              }
            },
            onConfirm: function(formData) {
              if (!config.packMeta) config.packMeta = {};
              var packMeta = config.packMeta;
              packMeta.id = formData.packId || defaultPackId;
              packMeta.version = formData.packVersion || "1.0";
              packMeta.name = formData.packName || "";
              packMeta.author = formData.packAuthor || "";
              packMeta.description = formData.packDescription || "";
              packMeta.exportDir = formData.exportDir || defaultExportDir;
              packMeta.enable_auto_pack = !!formData.enableAutoPack;
              packMeta.flat_export = !!formData.flatExport;
              saveConfig();
              this.hide();
              if (formData.manageDeps) {
                var existing = (config.dependencyPaths || []).map(function(p) {
                  return { path: p, type: "hard" };
                });
                var pdir = config.contentPackPath ? __require("path").dirname(config.contentPackPath) : "";
                var pd = require_pack_setup_dialog();
                pd.showDependencyPathEditor(existing, pdir, function(resolved) {
                  config.dependencyPaths = [];
                  var directDeps = resolved.direct || [];
                  var indirectDeps = resolved.indirect || [];
                  for (var d = 0; d < directDeps.length; d++) {
                    addDependencyPath(config, directDeps[d].path);
                  }
                  for (var k = 0; k < indirectDeps.length; k++) {
                    addDependencyPath(config, indirectDeps[k].path);
                  }
                  saveConfig();
                  showToast2("\u5185\u5BB9\u5305\u8BBE\u7F6E\u5DF2\u4FDD\u5B58\uFF0C\u4F9D\u8D56\u5DF2\u66F4\u65B0", "positive");
                });
              } else {
                showToast2("\u5185\u5BB9\u5305\u8BBE\u7F6E\u5DF2\u4FDD\u5B58", "positive");
              }
              log2.info("\u5185\u5BB9\u5305\u8BBE\u7F6E\u5DF2\u66F4\u65B0", {
                packId: packMeta.id,
                version: packMeta.version,
                name: packMeta.name,
                exportDir: packMeta.exportDir
              });
            }
          }).show();
        } catch (e) {
          log2.error("\u5185\u5BB9\u5305\u8BBE\u7F6E Dialog \u5931\u8D25", e);
          showToast2("\u65E0\u6CD5\u6253\u5F00\u8BBE\u7F6E\u5BF9\u8BDD\u6846: " + (e.message || e), "error");
        }
      }
      function _showExportDialog() {
        var config = getConfig();
        if (!config) {
          showToast2("\u6CA1\u6709\u53EF\u5BFC\u51FA\u7684\u914D\u7F6E\uFF0C\u8BF7\u5148\u6253\u5F00\u9879\u76EE", "warning");
          return;
        }
        var parts = config.parts || {};
        var partCount = Object.keys(parts).length;
        if (partCount === 0) {
          showToast2("\u6CA1\u6709\u5B9A\u4E49\u4EFB\u4F55\u96F6\u4EF6\uFF0C\u8BF7\u5148\u65B0\u5EFA\u96F6\u4EF6", "warning");
          return;
        }
        var pm = config.packMeta || {};
        var ns = config.namespace || "machine_max";
        var defaultPackId = pm.id || ns + ":" + (Project ? Project.name || "content_pack" : "content_pack");
        var defaultExportDir = pm.exportDir || _getDefaultExportDir(pm);
        var errors = runValidation(config);
        var errorText = "";
        if (errors.length > 0) {
          errorText = "<br>\u6821\u9A8C\u53D1\u73B0 " + errors.length + " \u4E2A\u95EE\u9898:<br>" + errors.map(function(e) {
            return "&nbsp;&nbsp;\u2022 " + e;
          }).join("<br>");
        }
        var statLines = [
          "\u6A21\u578B: " + (Project ? Project.name : "\u672A\u547D\u540D"),
          "\u5185\u5BB9\u5305\u8DEF\u5F84: " + (config.contentPackPath || "\u672A\u8BBE\u7F6E"),
          "\u96F6\u4EF6: " + partCount
        ];
        try {
          new Dialog({
            title: "\u5BFC\u51FA MachineMax \u5185\u5BB9\u5305",
            width: 580,
            form: {
              validationInfo: {
                type: "info",
                text: (errorText || "\u6821\u9A8C\u901A\u8FC7\uFF0C\u672A\u53D1\u73B0\u95EE\u9898\u3002") + "<br><br>" + statLines.join("<br>")
              },
              exportDir: {
                type: "folder",
                label: "\u5BFC\u51FA\u76EE\u5F55",
                value: defaultExportDir,
                description: "\u70B9\u51FB\u53F3\u4FA7\u6D4F\u89C8\u6309\u94AE\u9009\u62E9\u5185\u5BB9\u5305\u5BFC\u51FA\u76EE\u5F55"
              },
              packId: {
                type: "text",
                label: "\u5305 ID",
                value: defaultPackId,
                description: "\u683C\u5F0F namespace:pack_name\uFF0C\u5BFC\u51FA\u4E3A meta.json \u7684 id \u5B57\u6BB5"
              },
              packVersion: {
                type: "text",
                label: "\u7248\u672C\u53F7",
                value: pm.version || "1.0"
              },
              packName: {
                type: "text",
                label: "\u663E\u793A\u540D\u79F0",
                value: pm.name || ""
              },
              packAuthor: {
                type: "text",
                label: "\u4F5C\u8005",
                value: pm.author || ""
              },
              packDescription: {
                type: "textarea",
                label: "\u63CF\u8FF0",
                value: pm.description || "",
                height: 90
              },
              flatExport: {
                type: "checkbox",
                label: "\u6241\u5E73\u5316\u5BFC\u51FA",
                value: pm.flat_export !== false,
                description: "\u82E5\u542F\u7528\uFF0C\u96F6\u4EF6/\u5B50\u7CFB\u7EDF/\u8FDE\u63A5\u70B9\u5C06\u6241\u5E73\u5B58\u653E\uFF1B\u5173\u95ED\u5219\u6309\u6A21\u578B\u540D\u5206\u5165\u5B50\u6587\u4EF6\u5939"
              },
              dependencies: {
                type: "textarea",
                label: "\u4F9D\u8D56\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF09",
                value: (function() {
                  var deps = pm.dependencies || [];
                  var lines = deps.map(function(d) {
                    return typeof d === "string" ? d : d.id + " " + (d.type || "hard");
                  });
                  var hasOfficial = false;
                  for (var di = 0; di < deps.length; di++) {
                    var did = typeof deps[di] === "string" ? deps[di] : deps[di].id;
                    if (did === "machine_max:official") {
                      hasOfficial = true;
                      break;
                    }
                  }
                  if (!hasOfficial && pm.id !== "machine_max:official") {
                    lines.unshift("machine_max:official hard");
                  }
                  return lines.join("\n");
                })(),
                height: 100,
                description: '\u683C\u5F0F\uFF1A\u6BCF\u884C "\u4F9D\u8D56ID \u7C7B\u578B"\u3002\u7C7B\u578B: hard(\u5FC5\u9700), soft(\u53EF\u9009), override(\u8986\u76D6), conflict(\u51B2\u7A81)\n\u793A\u4F8B: machine_max:core hard'
              }
            },
            onConfirm: function(formData) {
              var exportDir = formData.exportDir || defaultExportDir;
              if (!exportDir) {
                showToast2("\u8BF7\u5148\u9009\u62E9\u5BFC\u51FA\u76EE\u5F55", "warning");
                return;
              }
              var packFolderName = _sanitizeFolderName(formData.packName) || _sanitizeFolderName(pm.name) || (Project ? Project.name : "content_pack");
              var overriddenMeta = {
                id: formData.packId || defaultPackId,
                version: formData.packVersion || "1.0",
                name: formData.packName || pm.name || "",
                author: formData.packAuthor || pm.author || "",
                description: formData.packDescription || pm.description || "",
                enable_auto_pack: pm.enable_auto_pack !== false,
                exportDir,
                dependencies: _parseDependencyText(formData.dependencies || ""),
                flat_export: !!formData.flatExport
              };
              if (!config.packMeta) config.packMeta = {};
              Object.assign(config.packMeta, overriddenMeta);
              try {
                var stats = _executeExport(config, overriddenMeta, exportDir, packFolderName);
                saveConfig();
                showToast2(
                  "\u5BFC\u51FA\u6210\u529F\uFF01\n\u96F6\u4EF6: " + stats.parts + ", \u8FDE\u63A5\u70B9: " + stats.connectors + ", \u5B50\u7CFB\u7EDF: " + stats.subsystems + ", \u6750\u6599: " + stats.materials + ", \u8BED\u8A00: " + stats.langs,
                  "positive",
                  6e3
                );
                log2.info("MachineMax \u83DC\u5355: \u5BFC\u51FA\u5B8C\u6210", stats);
              } catch (e) {
                log2.error("\u5BFC\u51FA\u5931\u8D25", e);
                showToast2("\u5BFC\u51FA\u5931\u8D25: " + (e.message || e), "error", 5e3);
              }
              this.hide();
            }
          }).show();
        } catch (e) {
          log2.error("\u5BFC\u51FA Dialog \u521B\u5EFA\u5931\u8D25", e);
          showToast2("\u65E0\u6CD5\u521B\u5EFA\u5BFC\u51FA\u5BF9\u8BDD\u6846: " + (e.message || e), "error");
        }
      }
      function _sanitizeFolderName(name) {
        if (!name) return "";
        return name.replace(/[<>:"/\\|?*\s]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").substring(0, 64);
      }
      function _parseDependencyText(text) {
        if (!text || !text.trim()) return [];
        var validTypes = ["hard", "soft", "override", "conflict"];
        return text.split("\n").map(function(line) {
          return line.trim();
        }).filter(function(line) {
          return line.length > 0;
        }).map(function(line) {
          var parts = line.split(/\s+/);
          var depId = parts[0];
          var depType = parts[1] || "hard";
          if (!validTypes.includes(depType)) depType = "hard";
          return { id: depId, type: depType };
        });
      }
      function _executeExport(config, packMeta, exportDir, packFolderName) {
        var fs = __require("fs");
        var path = __require("path");
        if (!fs.existsSync(exportDir)) {
          fs.mkdirSync(exportDir, { recursive: true });
        }
        var packRoot = path.join(exportDir, packFolderName);
        if (!fs.existsSync(packRoot)) {
          fs.mkdirSync(packRoot, { recursive: true });
        }
        var ns = config.namespace || "machine_max";
        var stats = { parts: 0, connectors: 0, subsystems: 0, materials: 0, langs: 0 };
        var isFlat = packMeta.flat_export !== false;
        function _resolveTargetDir(baseDir, id, flat) {
          if (flat) return baseDir;
          var seg = id.split("_")[0];
          return seg && seg.length > 0 ? path.join(baseDir, seg) : baseDir;
        }
        function _writeSchemasFromConstant(destBaseDir) {
          var schemasRaw = typeof define_SCHEMAS_default !== "undefined" ? define_SCHEMAS_default : null;
          if (!schemasRaw) {
            log2.warn("_writeSchemasFromConstant: __SCHEMAS__ \u672A\u6CE8\u5165\u6216\u4E3A\u7A7A\uFF0CSchema \u6587\u4EF6\u5C06\u4E0D\u4F1A\u5199\u5165");
            return;
          }
          var schemas = typeof schemasRaw === "string" ? JSON.parse(schemasRaw) : schemasRaw;
          var keys = Object.keys(schemas);
          var locales = ["zh_cn", "en_us"];
          for (var l = 0; l < locales.length; l++) {
            var localeDir = path.join(destBaseDir, locales[l], "schemas");
            for (var i = 0; i < keys.length; i++) {
              var relPath = keys[i];
              var destPath = path.join(localeDir, relPath);
              fileWriter.ensureDir(path.dirname(destPath));
              fs.writeFileSync(destPath, schemas[relPath], "utf-8");
            }
          }
          log2.info("_writeSchemasFromConstant: \u5DF2\u5199\u5165 " + locales.length + " \u5957 (" + keys.length + " \u4E2A\u6587\u4EF6/\u5957) schema \u6587\u4EF6");
        }
        function _getSchemaLocale() {
          var lang = "";
          if (typeof navigator !== "undefined" && navigator.language) {
            lang = navigator.language;
          } else if (typeof Blockbench !== "undefined" && Blockbench.locale) {
            lang = Blockbench.locale;
          }
          return lang.indexOf("zh") === 0 ? "zh_cn" : "en_us";
        }
        function _injectSchemaReferences(nsDir) {
          var schemaLocale = _getSchemaLocale();
          var schemaMap = {
            parts: "docs/" + schemaLocale + "/schemas/part_definition_schema.json",
            connectors: "docs/" + schemaLocale + "/schemas/part/subpart/connector/connector_attr.schema.json",
            subsystems: "docs/" + schemaLocale + "/schemas/subsystem/subsystem_static_attr.schema.json",
            materials: "docs/" + schemaLocale + "/schemas/base/material_attr.schema.json"
          };
          var recipeSchemaMap = {
            "machine_max:research": "docs/" + schemaLocale + "/schemas/recipe/research_recipe.schema.json",
            "machine_max:fabricating": "docs/" + schemaLocale + "/schemas/recipe/fabricating_recipe.schema.json",
            "machine_max:blueprint_research": "docs/" + schemaLocale + "/schemas/recipe/blueprint_research_recipe.schema.json"
          };
          var dirs = ["parts", "connectors", "subsystems", "materials", "recipe"];
          for (var d = 0; d < dirs.length; d++) {
            var typeDir = path.join(nsDir, dirs[d]);
            if (!fs.existsSync(typeDir)) continue;
            _walkAndInject(typeDir, nsDir, dirs[d], schemaMap, recipeSchemaMap);
          }
        }
        function _walkAndInject(currentDir, nsDir, typeName, schemaMap, recipeSchemaMap) {
          var entries = fs.readdirSync(currentDir);
          for (var e = 0; e < entries.length; e++) {
            var fullPath = path.join(currentDir, entries[e]);
            var stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              _walkAndInject(fullPath, nsDir, typeName, schemaMap, recipeSchemaMap);
            } else if (entries[e].endsWith(".json")) {
              try {
                var content = JSON.parse(fs.readFileSync(fullPath, "utf8"));
                var schemaRel;
                if (typeName === "recipe") {
                  schemaRel = recipeSchemaMap[content.type] || "docs/schemas/recipe/research_recipe.schema.json";
                } else {
                  schemaRel = schemaMap[typeName];
                }
                if (!schemaRel) continue;
                var relDir = path.relative(path.dirname(fullPath), nsDir);
                var schemaPath = path.join(relDir, schemaRel).replace(/\\/g, "/");
                content["$schema"] = schemaPath;
                fs.writeFileSync(fullPath, JSON.stringify(content, null, 2), "utf8");
              } catch (_err) {
                log2.warn("\u6CE8\u5165 $schema \u5931\u8D25: " + fullPath, _err);
              }
            }
          }
        }
        var genMeta = require_meta_generator();
        var savedPackMeta = config.packMeta;
        config.packMeta = packMeta;
        var meta = genMeta.generateMeta(config);
        config.packMeta = savedPackMeta;
        fileWriter.writeJSONFile(packRoot, "meta.json", meta);
        var _emptyDirs = [
          "textures/hud",
          "textures/icon",
          "textures/part",
          "models/hud",
          "huds",
          "animations/hud",
          "animations/part",
          "assemblies",
          "font",
          "tooltips",
          "templates",
          "docs"
        ];
        var _nsDir = path.join(packRoot, ns);
        for (var _ei = 0; _ei < _emptyDirs.length; _ei++) {
          fileWriter.ensureDir(path.join(_nsDir, _emptyDirs[_ei]));
        }
        _writeSchemasFromConstant(path.join(_nsDir, "docs"));
        try {
          if (typeof Codecs !== "undefined" && Codecs.bedrock && Project) {
            var modelDir = path.join(packRoot, ns, "models", "part");
            var modelName = Project.geometry_name || Project.name || "model";
            var geoContent = Codecs.bedrock.compile();
            fileWriter.writeTextFile(modelDir, modelName + ".geo.json", geoContent);
            log2.info("\u5DF2\u5BFC\u51FA Bedrock \u51E0\u4F55\u4F53\u6A21\u578B: " + modelName + ".geo.json");
          }
        } catch (e) {
          log2.warn("\u65E0\u6CD5\u5BFC\u51FA Bedrock \u51E0\u4F55\u4F53\u6A21\u578B\uFF08\u53EF\u80FD\u975E Bedrock \u683C\u5F0F\uFF09", e);
        }
        var genLang = require_lang_generator();
        var allLangs = genLang.generateAllLangs(config);
        if (allLangs) {
          var langDir = path.join(packRoot, ns, "lang");
          for (var locale in allLangs) {
            if (allLangs.hasOwnProperty(locale)) {
              fileWriter.writeJSONFile(langDir, locale + ".json", allLangs[locale]);
              stats.langs++;
            }
          }
        }
        var genParts = require_part_generator();
        var allParts = genParts.generateAllParts(config);
        var partsBaseDir = path.join(packRoot, ns, "parts");
        for (var partId in allParts) {
          if (allParts.hasOwnProperty(partId)) {
            var partsTargetDir = _resolveTargetDir(partsBaseDir, partId, isFlat);
            fileWriter.writeJSONFile(partsTargetDir, partId + ".json", allParts[partId]);
            stats.parts++;
          }
        }
        if (config.recipes && Object.keys(config.recipes).length > 0) {
          var recipeDir = path.join(packRoot, ns, "recipe");
          for (var recipeId in config.recipes) {
            if (config.recipes.hasOwnProperty(recipeId)) {
              fileWriter.writeJSONFile(recipeDir, recipeId + ".json", config.recipes[recipeId]);
            }
          }
        }
        var packDir = config.contentPackPath;
        if (packDir && fs.existsSync(packDir)) {
          var genConn = require_connector_generator();
          var genSub = require_subsystem_generator();
          var genMat = require_material_generator();
          stats.connectors = genConn.copyConnectorDefs(packDir, ns, path.join(packRoot, ns, "connectors"), isFlat);
          stats.subsystems = genSub.copySubsystemDefs(packDir, ns, path.join(packRoot, ns, "subsystems"), isFlat);
          stats.materials = genMat.copyMaterialDefs(packDir, ns, path.join(packRoot, ns, "materials"));
          var depSrcDir = path.join(packDir, "dependency");
          if (fs.existsSync(depSrcDir)) {
            var depTargetDir = path.join(packRoot, "dependency");
            fileWriter.ensureDir(depTargetDir);
            var depFiles = fs.readdirSync(depSrcDir);
            var j, depFile, depSrcFile, depContent;
            for (j = 0; j < depFiles.length; j++) {
              depFile = depFiles[j];
              if (depFile.indexOf(".json") !== depFile.length - 5) continue;
              depSrcFile = path.join(depSrcDir, depFile);
              try {
                depContent = fs.readFileSync(depSrcFile, "utf8");
                fs.writeFileSync(path.join(depTargetDir, depFile), depContent, "utf8");
              } catch (e) {
                log2.warn("\u590D\u5236\u4F9D\u8D56\u5305\u5B9A\u4E49\u5931\u8D25: " + depSrcFile, e);
              }
            }
          }
        } else {
          log2.warn("\u5185\u5BB9\u5305\u76EE\u5F55\u672A\u8BBE\u7F6E\u6216\u4E0D\u5B58\u5728\uFF0C\u8DF3\u8FC7\u8FDE\u63A5\u70B9/\u5B50\u7CFB\u7EDF/\u6750\u6599\u590D\u5236: " + packDir);
        }
        _injectSchemaReferences(_nsDir);
        log2.info("\u5BFC\u51FA\u5B8C\u6210, \u96F6\u4EF6=" + stats.parts + ", \u8FDE\u63A5\u70B9=" + stats.connectors + ", \u5B50\u7CFB\u7EDF=" + stats.subsystems + ", \u6750\u6599=" + stats.materials + ", \u8BED\u8A00=" + stats.langs);
        return stats;
      }
      function showExportDialog() {
        _showExportDialog();
      }
      function ensurePackValid(config, onResult) {
        _ensurePackValid(config, onResult);
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          registerMachineMaxMenu: registerMachineMaxMenu2,
          unregisterMachineMaxMenu: unregisterMachineMaxMenu2,
          showExportDialog,
          ensurePackValid
        };
      }
    }
  });

  // src/mode/toolbar.js
  var require_toolbar = __commonJS({
    "src/mode/toolbar.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { getConfig, saveConfig } = require_persistence();
      var { showToast: showToast2 } = require_notify();
      var { createLogger: createLogger2 } = require_logger();
      var { runValidation } = require_validation();
      var log2 = createLogger2("Mode");
      var _mmActionIds = ["mm_validate", "mm_export", "mm_new_part", "mm_project_settings"];
      var _mmActionInstances = [];
      function registerToolbarActions() {
        if (BarItems && BarItems["mm_validate"]) {
          log2.debug("registerToolbarActions: Actions \u5DF2\u6CE8\u518C\uFF08BarItems\uFF09\uFF0C\u8DF3\u8FC7");
          for (const id of _mmActionIds) {
            if (BarItems[id] && !_mmActionInstances.includes(BarItems[id])) {
              _mmActionInstances.push(BarItems[id]);
            }
          }
          return;
        }
        log2.debug("registerToolbarActions: \u6CE8\u518C\u5DE5\u5177\u680F Action...");
        _mmActionInstances.push(new Action("mm_validate", {
          text: "\u6821\u9A8C\u914D\u7F6E",
          icon: "fa-check-circle",
          condition: { modes: ["machine_max_part"] },
          click: function() {
            log2.debug('\u5DE5\u5177\u680F: \u70B9\u51FB"\u6821\u9A8C\u914D\u7F6E"');
            const config = getConfig();
            if (!config) {
              showToast2("\u6CA1\u6709\u53EF\u6821\u9A8C\u7684\u914D\u7F6E", "warning");
              return;
            }
            const errors = runValidation(config);
            if (errors.length === 0) {
              log2.info("\u6821\u9A8C\u901A\u8FC7\uFF0C\u65E0\u9519\u8BEF");
              showToast2("\u6821\u9A8C\u901A\u8FC7", "positive");
            } else {
              log2.warn("\u6821\u9A8C\u53D1\u73B0\u95EE\u9898", { count: errors.length, details: errors });
              showToast2("\u6821\u9A8C\u53D1\u73B0 " + errors.length + " \u4E2A\u95EE\u9898", "warning");
              new Dialog({
                title: "\u6821\u9A8C\u7ED3\u679C",
                lines: ["\u53D1\u73B0 " + errors.length + " \u4E2A\u95EE\u9898\uFF1A", ...errors],
                form: { close: "close" },
                onConfirm: function() {
                  this.hide();
                }
              }).show();
            }
          }
        }));
        _mmActionInstances.push(new Action("mm_export", {
          text: "\u5BFC\u51FA\u5185\u5BB9\u5305",
          icon: "fa-save",
          condition: { modes: ["machine_max_part"] },
          click: function() {
            log2.debug('\u5DE5\u5177\u680F: \u70B9\u51FB"\u5BFC\u51FA\u5185\u5BB9\u5305"');
            var config = getConfig();
            if (!config) {
              showToast2("\u6CA1\u6709\u53EF\u5BFC\u51FA\u7684\u914D\u7F6E", "warning");
              return;
            }
            var menu = require_menu();
            menu.ensurePackValid(config, function(valid) {
              if (valid) {
                menu.showExportDialog();
              } else {
                showToast2("\u8BF7\u5148\u8BBE\u7F6E\u6709\u6548\u7684\u5185\u5BB9\u5305", "warning");
              }
            });
          }
        }));
        _mmActionInstances.push(new Action("mm_new_part", {
          text: "\u65B0\u5EFA\u96F6\u4EF6",
          icon: "fa-plus",
          condition: { modes: ["machine_max_part"] },
          click: function() {
            log2.debug('\u5DE5\u5177\u680F: \u70B9\u51FB"\u65B0\u5EFA\u96F6\u4EF6"');
            var cfg = getConfig();
            if (!cfg) {
              log2.warn("\u5DE5\u5177\u680F\u65B0\u5EFA\u96F6\u4EF6: config \u4E3A\u7A7A");
              return;
            }
            log2.debug("\u5DE5\u5177\u680F\u65B0\u5EFA\u96F6\u4EF6: \u5F53\u524D\u96F6\u4EF6\u5217\u8868", { parts: Object.keys(cfg.parts || {}) });
            try {
              new Dialog({
                title: "\u65B0\u5EFA\u96F6\u4EF6",
                form: {
                  partId: { type: "text", label: "\u96F6\u4EF6 ID", hint: "\u5982 wine_fox_hull" },
                  variantName: { type: "text", label: "\u521D\u59CB\u53D8\u4F53\u540D", value: "default" },
                  model: { type: "text", label: "\u6A21\u578B\u5F15\u7528", value: "machine_max:" }
                },
                onConfirm: function(formData) {
                  var partId = formData.partId;
                  var variantName = formData.variantName;
                  var model = formData.model;
                  if (!partId) {
                    showToast2("\u96F6\u4EF6 ID \u4E0D\u80FD\u4E3A\u7A7A", "error");
                    return false;
                  }
                  if (cfg.parts[partId]) {
                    showToast2('\u96F6\u4EF6 "' + partId + '" \u5DF2\u5B58\u5728', "error");
                    return false;
                  }
                  var cfgMod = require_config();
                  cfg.parts[partId] = cfgMod.createPartConfig(partId, variantName);
                  if (model) cfg.parts[partId].variants[variantName].model = model;
                  cfg._uiState.activePartId = partId;
                  cfg._uiState.activeVariantName = variantName;
                  log2.info("\u5DE5\u5177\u680F\u65B0\u5EFA\u96F6\u4EF6\u6210\u529F", { partId, variant: variantName });
                  refreshOutlinerIcons();
                  Blockbench.dispatchEvent("update_selection");
                  showToast2('\u96F6\u4EF6 "' + partId + '" \u5DF2\u521B\u5EFA', "positive");
                  this.hide();
                }
              }).show();
              log2.debug("\u5DE5\u5177\u680F\u65B0\u5EFA\u96F6\u4EF6: Dialog \u5DF2\u521B\u5EFA");
            } catch (e) {
              log2.error("\u5DE5\u5177\u680F\u65B0\u5EFA\u96F6\u4EF6 Dialog \u5F02\u5E38", e);
            }
          }
        }));
        _mmActionInstances.push(new Action("mm_project_settings", {
          text: "\u9879\u76EE\u7BA1\u7406",
          icon: "fa-cog",
          condition: { modes: ["machine_max_part"] },
          click: function() {
            log2.debug('\u5DE5\u5177\u680F: \u70B9\u51FB"\u9879\u76EE\u7BA1\u7406"');
            const config = getConfig();
            if (!config) {
              log2.warn("\u9879\u76EE\u7BA1\u7406: config \u4E3A\u7A7A");
              return;
            }
            const partCount = Object.keys(config.parts).length;
            const partList = Object.entries(config.parts).map(function(entry) {
              var id = entry[0];
              var part = entry[1];
              var vCount = Object.keys(part.variants || {}).length;
              var markerCount = part.element_markers ? Object.values(part.element_markers).reduce(function(sum, m) {
                return sum + Object.keys(m).length;
              }, 0) : 0;
              return "  " + id + "  |  \u53D8\u4F53: " + vCount + "  |  \u6807\u8BB0: " + markerCount;
            }).join("\n");
            log2.debug("\u9879\u76EE\u7BA1\u7406: \u5F53\u524D\u7EDF\u8BA1", {
              parts: partCount
            });
            new Dialog({
              title: "MachineMax \u9879\u76EE\u7BA1\u7406",
              form: {
                contentPackPath: { type: "text", label: "\u5185\u5BB9\u5305\u8DEF\u5F84", value: config.contentPackPath || "", description: "MachineMax \u5185\u5BB9\u5305\u7684\u6839\u76EE\u5F55\u8DEF\u5F84" },
                info: { type: "display", label: "\u7EDF\u8BA1", lines: [
                  "\u6A21\u578B: " + (Project && Project.name || "\u672A\u547D\u540D"),
                  "\u5185\u5BB9\u5305\u8DEF\u5F84: " + (config.contentPackPath || "\u672A\u8BBE\u7F6E"),
                  "\u96F6\u4EF6\u6570: " + partCount,
                  partCount > 0 ? "\n\u96F6\u4EF6\u5217\u8868:\n" + partList : "\uFF08\u6682\u65E0\u96F6\u4EF6\uFF09"
                ] }
              },
              onConfirm: function(formData) {
                config.contentPackPath = formData.contentPackPath || "";
                log2.info("\u9879\u76EE\u7BA1\u7406: \u5185\u5BB9\u5305\u8DEF\u5F84\u5DF2\u66F4\u65B0", { contentPackPath: formData.contentPackPath });
                saveConfig();
                this.hide();
              }
            }).show();
          }
        }));
        log2.info("registerToolbarActions: \u5B8C\u6210\uFF0C\u6CE8\u518C\u4E86 " + _mmActionInstances.length + " \u4E2A Action");
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          registerToolbarActions,
          _mmActionInstances,
          _mmActionIds
        };
      }
    }
  });

  // src/core/naming.js
  var require_naming = __commonJS({
    "src/core/naming.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("Naming");
      function toSnakeCase(str) {
        if (!str) return "";
        return str.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
      }
      function generateDefaultName(entityType, context) {
        var ns = context.namespace || "machine_max";
        switch (entityType) {
          case "sub_part":
            return "sub_part.machine_max.main";
          case "connector":
            var locName = context.boneName || "connector";
            return "connector." + ns + "." + toSnakeCase(locName);
          case "interact_box":
            var boneName = context.boneName || "interact";
            return "interact." + ns + "." + toSnakeCase(boneName);
          case "subsystem":
            var shortName = context.typeShortName || "subsystem";
            var idx = context.index || 1;
            return "subsystem." + ns + "." + shortName + "_" + idx;
          default:
            return "";
        }
      }
      function validateNameUniqueness(variant, scope, subPartKey, name, excludeKey) {
        if (!variant || !name) return { valid: false, message: "\u540D\u79F0\u4E3A\u7A7A" };
        var existingKeys = [];
        switch (scope) {
          case "sub_part":
            existingKeys = Object.keys(variant.sub_parts || {});
            break;
          case "connector":
            var spConns = variant.sub_parts && variant.sub_parts[subPartKey] && variant.sub_parts[subPartKey].connectors || {};
            existingKeys = Object.keys(spConns);
            break;
          case "interact_box":
            var spIbs = variant.sub_parts && variant.sub_parts[subPartKey] && variant.sub_parts[subPartKey].interact_boxes || {};
            existingKeys = Object.keys(spIbs);
            break;
          case "subsystem":
            var spSubs = variant.sub_parts && variant.sub_parts[subPartKey] && variant.sub_parts[subPartKey].subsystems || {};
            existingKeys = Object.keys(spSubs);
            break;
          default:
            return { valid: false, message: "\u672A\u77E5\u4F5C\u7528\u57DF" };
        }
        for (var i = 0; i < existingKeys.length; i++) {
          if (existingKeys[i] === name && name !== excludeKey) {
            return { valid: false, message: '"' + name + '" \u5DF2\u5B58\u5728\uFF0C\u8BF7\u6362\u4E00\u4E2A\u540D\u79F0' };
          }
        }
        return { valid: true, message: "" };
      }
      function ensureUniqueName(scope, variant, subPartKey, baseName) {
        var result = validateNameUniqueness(variant, scope, subPartKey, baseName);
        if (result.valid) return baseName;
        var suffix = 2;
        while (!result.valid && suffix <= 999) {
          var candidate = baseName + "." + suffix;
          result = validateNameUniqueness(variant, scope, subPartKey, candidate);
          if (result.valid) return candidate;
          suffix++;
        }
        return baseName + "." + Date.now();
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          toSnakeCase,
          generateDefaultName,
          validateNameUniqueness,
          ensureUniqueName
        };
      }
    }
  });

  // src/ui/add_subsystem_dialog.js
  var require_add_subsystem_dialog = __commonJS({
    "src/ui/add_subsystem_dialog.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      function showAddSubsystemDialog(options) {
        var config = options.config;
        var variant = options.variant;
        var spKey = options.spKey;
        var preSelectedType = options.preSelectedType || "";
        var onCreated = options.onCreated || function() {
        };
        var beforeSet = options.beforeSet || function(sp2, instanceName, ssConfig) {
          var subs = sp2.subsystems || {};
          subs[instanceName] = ssConfig;
          sp2.subsystems = Object.assign({}, subs);
        };
        if (!variant || !variant.sub_parts || !variant.sub_parts[spKey]) return;
        var sp = variant.sub_parts[spKey];
        if (!sp.subsystems) sp.subsystems = {};
        var ssTypes = require_subsystem_types();
        var groupedTypes = ssTypes.getTypesGroupedByCategory();
        var { showToast: showToast2 } = require_notify();
        var { saveConfig } = require_persistence();
        var allTypeOpts = {};
        var catOrder = ["power", "control", "utility", "experimental"];
        for (var ci = 0; ci < catOrder.length; ci++) {
          var cat = catOrder[ci];
          var types = groupedTypes[cat];
          if (!types || types.length === 0) continue;
          var catLabel = ssTypes.getCategoryLabel(cat);
          for (var ti = 0; ti < types.length; ti++) {
            var t = types[ti];
            allTypeOpts[t.id] = "[" + catLabel + "] " + t.displayName;
          }
        }
        new Dialog({
          title: "\u6DFB\u52A0\u5B50\u7CFB\u7EDF",
          form: {
            subsystemType: { type: "select", label: "\u5B50\u7CFB\u7EDF\u7C7B\u578B", options: allTypeOpts, value: preSelectedType || "machine_max:engine" },
            instanceName: { type: "text", label: "\u5B50\u7CFB\u7EDF\u540D\u79F0", value: "", description: "\u7559\u7A7A\u81EA\u52A8\u751F\u6210" }
          },
          onConfirm: function(formData) {
            var typeId = formData.subsystemType;
            var instanceName = formData.instanceName;
            var meta = ssTypes.getTypeMeta(typeId);
            if (!meta) {
              showToast2("\u65E0\u6548\u7684\u5B50\u7CFB\u7EDF\u7C7B\u578B", "error");
              return false;
            }
            if (!instanceName || instanceName.trim() === "") {
              var { generateDefaultName, ensureUniqueName } = require_naming();
              var ns = config && config.namespace || "machine_max";
              var baseName = generateDefaultName("subsystem", { namespace: ns, typeName: typeId.split(":").pop() || "ss" });
              instanceName = ensureUniqueName("subsystem", variant, spKey, baseName);
            } else {
              instanceName = instanceName.trim();
              if (sp.subsystems[instanceName]) {
                showToast2('\u5B50\u7CFB\u7EDF "' + instanceName + '" \u5DF2\u5B58\u5728', "error");
                return false;
              }
            }
            var cfgMod = require_config();
            var ssConfig = cfgMod.createSubsystemConfig();
            ssConfig.type = typeId;
            var typeDefaults = ssTypes.getTypeDefaults(typeId);
            for (var f in typeDefaults) {
              if (typeDefaults.hasOwnProperty(f)) {
                ssConfig[f] = JSON.parse(JSON.stringify(typeDefaults[f]));
              }
            }
            beforeSet(sp, instanceName, ssConfig);
            onCreated(spKey, instanceName);
            saveConfig();
            showToast2('\u5B50\u7CFB\u7EDF "' + instanceName + '" \u5DF2\u521B\u5EFA', "positive");
            this.hide();
            Blockbench.dispatchEvent("update_selection");
          }
        }).show();
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = { showAddSubsystemDialog };
      }
    }
  });

  // src/mode/patches.js
  var require_patches = __commonJS({
    "src/mode/patches.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { getMarkersForVariant, setMarker, clearMarker, getMarker, detectOwnerSubPart, recalcAutoEndBones } = require_element_markers();
      var { getConfig, saveConfig } = require_persistence();
      var { showToast: showToast2 } = require_notify();
      var { createLogger: createLogger2 } = require_logger();
      var { generateDefaultName, ensureUniqueName } = require_naming();
      var ssTypes = require_subsystem_types();
      var log2 = createLogger2("Mode");
      var _originalShowContextMenus = {};
      var _PATCH_TARGETS = ["OutlinerNode", "Group", "OutlinerElement"];
      var _originalOutlinerElementSelect = null;
      function buildMMMenuItems(el) {
        log2.debug("buildMMMenuItems \u88AB\u8C03\u7528", {
          name: el && el.name,
          type: el && el.constructor && el.constructor.name,
          isGroup: el instanceof Group,
          isLocator: el instanceof Locator
        });
        var config = getConfig();
        if (!config) {
          log2.warn("buildMMMenuItems: getConfig() \u8FD4\u56DE\u7A7A");
          return [];
        }
        log2.debug("buildMMMenuItems: \u5F53\u524D UI \u72B6\u6001", {
          _uiState: config._uiState,
          parts: Object.keys(config.parts || {})
        });
        var activePartId = config._uiState?.activePartId;
        var activeVariantName = config._uiState?.activeVariantName;
        if ((!activePartId || !activeVariantName) && config.parts && Object.keys(config.parts).length > 0) {
          var autoId = Object.keys(config.parts)[0];
          var variants = Object.keys(config.parts[autoId].variants || {});
          var autoVariant = variants.length > 0 ? variants[0] : "default";
          config._uiState.activePartId = autoId;
          config._uiState.activeVariantName = autoVariant;
          activePartId = autoId;
          activeVariantName = autoVariant;
          log2.debug("buildMMMenuItems: \u81EA\u52A8\u9009\u62E9\u7B2C\u4E00\u4E2A\u96F6\u4EF6", { partId: autoId, variant: autoVariant });
        }
        if (!activePartId || !activeVariantName) {
          log2.debug("buildMMMenuItems: \u65E0\u6D3B\u8DC3\u96F6\u4EF6/\u53D8\u4F53\uFF0C\u663E\u793A\u63D0\u793A\u83DC\u5355");
          var hintItems = [];
          hintItems.push(new MenuSeparator("mm_separator", "MachineMax"));
          hintItems.push({ name: "\u8BF7\u5148\u65B0\u5EFA\u96F6\u4EF6", icon: "add", click: function() {
            log2.debug('\u53F3\u952E\u83DC\u5355: \u70B9\u51FB\u4E86"\u65B0\u5EFA\u96F6\u4EF6"');
            var cfg = getConfig();
            if (!cfg) {
              log2.warn("\u53F3\u952E\u83DC\u5355\u65B0\u5EFA\u96F6\u4EF6: getConfig() \u8FD4\u56DE null");
              return;
            }
            try {
              new Dialog({
                title: "\u65B0\u5EFA\u96F6\u4EF6",
                form: {
                  partId: { type: "text", label: "\u96F6\u4EF6 ID", hint: "\u5982 wine_fox_hull" },
                  variantName: { type: "text", label: "\u521D\u59CB\u53D8\u4F53\u540D", value: "default" },
                  model: { type: "text", label: "\u6A21\u578B\u5F15\u7528", value: "machine_max:" }
                },
                onConfirm: function(formData) {
                  var partId = formData.partId;
                  var variantName = formData.variantName;
                  var model = formData.model;
                  if (!partId) {
                    showToast2("\u96F6\u4EF6 ID \u4E0D\u80FD\u4E3A\u7A7A", "error");
                    return false;
                  }
                  if (cfg.parts[partId]) {
                    showToast2('\u96F6\u4EF6 "' + partId + '" \u5DF2\u5B58\u5728', "error");
                    return false;
                  }
                  var cfgMod = require_config();
                  cfg.parts[partId] = cfgMod.createPartConfig(partId, variantName);
                  if (model) cfg.parts[partId].variants[variantName].model = model;
                  cfg._uiState.activePartId = partId;
                  cfg._uiState.activeVariantName = variantName;
                  log2.info("\u53F3\u952E\u83DC\u5355\u65B0\u5EFA\u96F6\u4EF6\u6210\u529F", { partId, variant: variantName });
                  var { refreshOutlinerIcons: refreshOutlinerIcons2 } = require_mode();
                  refreshOutlinerIcons2();
                  Blockbench.dispatchEvent("update_selection");
                  showToast2('\u96F6\u4EF6 "' + partId + '" \u5DF2\u521B\u5EFA', "positive");
                  this.hide();
                }
              }).show();
              log2.debug("\u53F3\u952E\u83DC\u5355\u65B0\u5EFA\u96F6\u4EF6: Dialog \u5DF2\u663E\u793A");
            } catch (e) {
              log2.error("\u53F3\u952E\u83DC\u5355\u65B0\u5EFA\u96F6\u4EF6 Dialog \u5F02\u5E38", e);
            }
          } });
          hintItems.push({ name: "\u9879\u76EE\u7BA1\u7406", icon: "settings", click: function() {
            log2.debug('\u53F3\u952E\u83DC\u5355: \u70B9\u51FB\u4E86"\u9879\u76EE\u7BA1\u7406"');
            var cfg = getConfig();
            if (!cfg) return;
            var partCount = Object.keys(cfg.parts || {}).length;
            try {
              new Dialog({
                title: "MachineMax \u9879\u76EE\u7BA1\u7406",
                form: {
                  contentPackPath: { type: "text", label: "\u5185\u5BB9\u5305\u8DEF\u5F84", value: cfg.contentPackPath || "", description: "MachineMax \u5185\u5BB9\u5305\u7684\u6839\u76EE\u5F55\u8DEF\u5F84" },
                  info: { type: "display", label: "\u7EDF\u8BA1", lines: [
                    "\u6A21\u578B: " + (Project && Project.name || "\u672A\u547D\u540D"),
                    "\u5185\u5BB9\u5305\u8DEF\u5F84: " + (cfg.contentPackPath || "\u672A\u8BBE\u7F6E"),
                    "\u96F6\u4EF6\u6570: " + partCount
                  ] }
                },
                onConfirm: function(formData) {
                  cfg.contentPackPath = formData.contentPackPath || "";
                  log2.info("\u9879\u76EE\u7BA1\u7406: \u5185\u5BB9\u5305\u8DEF\u5F84\u5DF2\u66F4\u65B0", { contentPackPath: formData.contentPackPath });
                  saveConfig();
                  this.hide();
                }
              }).show();
              log2.debug("\u53F3\u952E\u83DC\u5355\u9879\u76EE\u7BA1\u7406: Dialog \u5DF2\u663E\u793A");
            } catch (e) {
              log2.error("\u53F3\u952E\u83DC\u5355\u9879\u76EE\u7BA1\u7406 Dialog \u5F02\u5E38", e);
            }
          } });
          return hintItems;
        }
        const marker = getMarker(config, activePartId, activeVariantName, el.uuid);
        log2.debug("buildMMMenuItems: \u5F53\u524D\u5143\u7D20\u6807\u8BB0", {
          uuid: el.uuid,
          marker: marker ? marker.type : "\u65E0"
        });
        var items = [];
        items.push(new MenuSeparator("mm_separator", "MachineMax \u6807\u8BB0"));
        if (el instanceof Group) {
          if (!marker || marker.type !== "sub_part") {
            items.push({ name: "\u6807\u8BB0\u4E3A\u5B50\u96F6\u4EF6", icon: "inventory_2", click: function() {
              log2.debug("\u53F3\u952E\u83DC\u5355: \u6807\u8BB0\u4E3A\u5B50\u96F6\u4EF6", { uuid: el.uuid, name: el.name });
              var variant = config.parts[activePartId].variants[activeVariantName];
              var ns = config.namespace || "machine_max";
              var baseName = generateDefaultName("sub_part", { namespace: ns });
              var spName = ensureUniqueName("sub_part", variant, null, baseName);
              setMarker(config, activePartId, activeVariantName, el.uuid, "sub_part", spName);
              var { refreshOutlinerIcons: refreshOutlinerIcons2 } = require_mode();
              refreshOutlinerIcons2();
              Blockbench.dispatchEvent("update_selection");
            } });
          }
          if (!marker || marker.type !== "hit_box") {
            items.push({ name: "\u6807\u8BB0\u4E3A\u78B0\u649E\u7BB1", icon: "select_all", click: function() {
              log2.debug("\u53F3\u952E\u83DC\u5355: \u6807\u8BB0\u4E3A\u78B0\u649E\u7BB1", { uuid: el.uuid, name: el.name });
              var searchEl = marker && marker.type === "sub_part" ? el.parent || null : el;
              var owner = detectOwnerSubPart(config, activePartId, activeVariantName, searchEl);
              var spKey = owner ? owner.spKey : null;
              if (spKey) {
                var variant = config.parts[activePartId].variants[activeVariantName];
                if (!variant.sub_parts) variant.sub_parts = {};
                if (!variant.sub_parts[spKey]) {
                  var cfgMod = require_config();
                  variant.sub_parts[spKey] = cfgMod.createSubPartConfig();
                }
                if (!variant.sub_parts[spKey].hit_boxes) {
                  variant.sub_parts[spKey].hit_boxes = {};
                }
                var hbUuid = el.uuid;
                if (!variant.sub_parts[spKey].hit_boxes[hbUuid]) {
                  var cfgMod2 = require_config();
                  variant.sub_parts[spKey].hit_boxes[hbUuid] = cfgMod2.createHitBoxConfig();
                  log2.debug("\u53F3\u952E\u83DC\u5355: \u6807\u8BB0\u4E3A\u78B0\u649E\u7BB1 \u2014 \u5728 sub_parts \u4E2D\u521B\u5EFA\u6761\u76EE", {
                    spKey,
                    hbUuid,
                    elementName: el.name
                  });
                }
              }
              setMarker(config, activePartId, activeVariantName, el.uuid, "hit_box", spKey);
              var { refreshOutlinerIcons: refreshOutlinerIcons2 } = require_mode();
              refreshOutlinerIcons2();
              Blockbench.dispatchEvent("update_selection");
              if (!spKey) {
                showToast2('\u78B0\u649E\u7BB1 "' + el.name + '" \u65E0\u5F52\u5C5E\u5B50\u96F6\u4EF6\uFF08\u4E0D\u53D7\u9632\u62A4\u8BA1\u7B97\u5F71\u54CD\uFF09', "warning");
              }
            } });
          }
          if (!marker || marker.type !== "interact_box") {
            items.push({ name: "\u6807\u8BB0\u4E3A\u4EA4\u4E92\u533A", icon: "pan_tool", click: function() {
              log2.debug("\u53F3\u952E\u83DC\u5355: \u6807\u8BB0\u4E3A\u4EA4\u4E92\u533A", { uuid: el.uuid, name: el.name });
              var searchEl = marker && marker.type === "sub_part" ? el.parent || null : el;
              var owner = detectOwnerSubPart(config, activePartId, activeVariantName, searchEl);
              var spKey = owner ? owner.spKey : null;
              if (spKey) {
                var variant = config.parts[activePartId].variants[activeVariantName];
                if (!variant.sub_parts) variant.sub_parts = {};
                if (!variant.sub_parts[spKey]) {
                  var cfgMod = require_config();
                  variant.sub_parts[spKey] = cfgMod.createSubPartConfig();
                }
                if (!variant.sub_parts[spKey].interact_boxes) {
                  variant.sub_parts[spKey].interact_boxes = {};
                }
                var ns = config.namespace || "machine_max";
                var baseName = generateDefaultName("interact_box", { namespace: ns, boneName: el.name });
                var ibName = ensureUniqueName("interact_box", variant, spKey, baseName);
                if (!variant.sub_parts[spKey].interact_boxes[ibName]) {
                  var cfgMod2 = require_config();
                  variant.sub_parts[spKey].interact_boxes[ibName] = cfgMod2.createInteractBoxConfig();
                  variant.sub_parts[spKey].interact_boxes[ibName].bone = el.name;
                  variant.sub_parts[spKey].interact_boxes[ibName]._uuid = el.uuid;
                  log2.debug("\u53F3\u952E\u83DC\u5355: \u6807\u8BB0\u4E3A\u4EA4\u4E92\u533A \u2014 \u5728 sub_parts \u4E2D\u521B\u5EFA\u6761\u76EE", {
                    spKey,
                    ibName,
                    boneName: el.name
                  });
                }
              }
              setMarker(config, activePartId, activeVariantName, el.uuid, "interact_box", spKey);
              var { refreshOutlinerIcons: refreshOutlinerIcons2 } = require_mode();
              refreshOutlinerIcons2();
              Blockbench.dispatchEvent("update_selection");
              if (!spKey) {
                showToast2('\u4EA4\u4E92\u533A "' + el.name + '" \u65E0\u5F52\u5C5E\u5B50\u96F6\u4EF6', "warning");
              }
            } });
          }
          if (marker && marker.type === "sub_part") {
            var buildSubsystemSubmenu = function(spKey) {
              var logSubSys = function(typeId, displayName) {
                log2.debug("\u53F3\u952E\u83DC\u5355: \u6DFB\u52A0 " + typeId + " \u5B50\u7CFB\u7EDF", { spKey });
              };
              var catOrder = ["power", "control", "utility", "experimental"];
              var catItems = [];
              for (var ci = 0; ci < catOrder.length; ci++) {
                var cat = catOrder[ci];
                var types = ssTypes.getTypesByCategory(cat);
                if (!types || types.length === 0) continue;
                var catLabel = ssTypes.getCategoryLabel(cat);
                var typeItems = [];
                for (var ti = 0; ti < types.length; ti++) {
                  var t2 = types[ti];
                  (function(capturedTypeId, capturedDisplayName) {
                    typeItems.push({
                      name: capturedDisplayName,
                      click: function() {
                        logSubSys(capturedTypeId, capturedDisplayName);
                        var variant = config.parts[activePartId].variants[activeVariantName];
                        if (!variant.sub_parts) variant.sub_parts = {};
                        if (!variant.sub_parts[spKey]) {
                          var cfgMod = require_config();
                          variant.sub_parts[spKey] = cfgMod.createSubPartConfig();
                        }
                        var { showAddSubsystemDialog } = require_add_subsystem_dialog();
                        showAddSubsystemDialog({
                          config,
                          variant,
                          spKey,
                          preSelectedType: capturedTypeId
                        });
                      }
                    });
                  })(t2.id, t2.displayName);
                }
                catItems.push({ name: "[" + catLabel + "]", children: typeItems });
              }
              return catItems;
            };
            items.push({
              name: "\u6DFB\u52A0\u5B50\u7CFB\u7EDF",
              icon: "add",
              children: buildSubsystemSubmenu(marker.config_ref || el.name)
            });
          }
        } else if (el instanceof Locator) {
          var locatorTypes = ["connector"];
          var labels = {
            connector: "\u6807\u8BB0\u4E3A\u8FDE\u63A5\u70B9"
          };
          var icons = {
            connector: "link"
          };
          for (var t = 0; t < locatorTypes.length; t++) {
            var type = locatorTypes[t];
            if (!marker || marker.type !== type) {
              items.push({ name: labels[type], icon: icons[type], click: /* @__PURE__ */ (function(capturedType) {
                return function() {
                  log2.debug("\u53F3\u952E\u83DC\u5355: \u6807\u8BB0\u4E3A" + capturedType, { uuid: el.uuid, name: el.name });
                  if (capturedType === "connector") {
                    var owner = detectOwnerSubPart(config, activePartId, activeVariantName, el);
                    var spKey = owner ? owner.spKey : null;
                    if (spKey) {
                      var variant = config.parts[activePartId].variants[activeVariantName];
                      if (!variant.sub_parts) variant.sub_parts = {};
                      if (!variant.sub_parts[spKey]) {
                        var cfgMod2 = require_config();
                        variant.sub_parts[spKey] = cfgMod2.createSubPartConfig();
                      }
                      if (!variant.sub_parts[spKey].connectors) {
                        variant.sub_parts[spKey].connectors = {};
                      }
                      var locName = el.name;
                      var ns = config.namespace || "machine_max";
                      var baseName = generateDefaultName("connector", { namespace: ns, boneName: locName });
                      var connName = ensureUniqueName("connector", variant, spKey, baseName);
                      if (!variant.sub_parts[spKey].connectors[connName]) {
                        var connDefaults = require_config_defaults().CONNECTOR_INSTANCE_DEFAULTS;
                        variant.sub_parts[spKey].connectors[connName] = Object.assign({}, connDefaults, {
                          locator: locName
                        });
                        log2.debug("\u53F3\u952E\u83DC\u5355: \u6807\u8BB0\u4E3A\u8FDE\u63A5\u70B9 \u2014 \u5728 sub_parts \u4E2D\u521B\u5EFA\u6761\u76EE", {
                          spKey,
                          connKey: connName,
                          locatorName: locName
                        });
                      }
                    }
                  }
                  setMarker(config, activePartId, activeVariantName, el.uuid, capturedType, null);
                  var { refreshOutlinerIcons: refreshOutlinerIcons2 } = require_mode();
                  refreshOutlinerIcons2();
                  Blockbench.dispatchEvent("update_selection");
                };
              })(type) });
            }
          }
        }
        if (marker) {
          items.push({ name: "\u6E05\u9664 MachineMax \u6807\u8BB0", icon: "delete", click: function() {
            log2.debug("\u53F3\u952E\u83DC\u5355: \u6E05\u9664\u6807\u8BB0 \u2014 \u5F00\u59CB", {
              type: marker.type,
              uuid: el.uuid,
              name: el.name,
              configRef: marker.config_ref,
              activePartId,
              variantName: activeVariantName
            });
            var oldVariant = config.parts[activePartId] && config.parts[activePartId].variants[activeVariantName];
            var oldSubPartsSnapshot = {};
            if (oldVariant && oldVariant.sub_parts) {
              for (var spk in oldVariant.sub_parts) {
                oldSubPartsSnapshot[spk] = {
                  hitBoxKeys: oldVariant.sub_parts[spk].hit_boxes ? Object.keys(oldVariant.sub_parts[spk].hit_boxes) : [],
                  interactBoxKeys: oldVariant.sub_parts[spk].interact_boxes ? Object.keys(oldVariant.sub_parts[spk].interact_boxes) : [],
                  connectorKeys: oldVariant.sub_parts[spk].connectors ? Object.keys(oldVariant.sub_parts[spk].connectors) : []
                };
              }
            }
            log2.debug("\u53F3\u952E\u83DC\u5355: \u6E05\u9664\u6807\u8BB0 \u2014 \u6E05\u9664\u524D sub_parts \u5FEB\u7167", { subParts: oldSubPartsSnapshot });
            clearMarker(config, activePartId, activeVariantName, el.uuid);
            var newVariant = config.parts[activePartId] && config.parts[activePartId].variants[activeVariantName];
            var newSubPartsSnapshot = {};
            if (newVariant && newVariant.sub_parts) {
              for (var spk2 in newVariant.sub_parts) {
                newSubPartsSnapshot[spk2] = {
                  hitBoxKeys: newVariant.sub_parts[spk2].hit_boxes ? Object.keys(newVariant.sub_parts[spk2].hit_boxes) : [],
                  interactBoxKeys: newVariant.sub_parts[spk2].interact_boxes ? Object.keys(newVariant.sub_parts[spk2].interact_boxes) : [],
                  connectorKeys: newVariant.sub_parts[spk2].connectors ? Object.keys(newVariant.sub_parts[spk2].connectors) : []
                };
              }
            }
            log2.debug("\u53F3\u952E\u83DC\u5355: \u6E05\u9664\u6807\u8BB0 \u2014 \u6E05\u9664\u540E sub_parts \u5FEB\u7167", { subParts: newSubPartsSnapshot });
            var { refreshOutlinerIcons: refreshOutlinerIcons2 } = require_mode();
            refreshOutlinerIcons2();
            Blockbench.dispatchEvent("update_selection");
            log2.debug("\u53F3\u952E\u83DC\u5355: \u6E05\u9664\u6807\u8BB0 \u2014 \u5B8C\u6210\uFF08\u5DF2\u89E6\u53D1 update_selection\uFF09");
          } });
        }
        log2.debug("buildMMMenuItems: \u6784\u5EFA\u4E86 " + items.length + " \u4E2A\u83DC\u5355\u6761\u76EE");
        return items;
      }
      function injectMMItemsToStructure(el, menu) {
        if (!menu || !menu.structure) {
          log2.debug("injectMMItemsToStructure: menu.structure \u4E0D\u53EF\u7528", {
            menuExists: !!menu,
            menuType: menu ? typeof menu : "null",
            menuKeys: menu ? Object.keys(menu) : []
          });
          return 0;
        }
        if (!(menu.structure instanceof Array)) {
          log2.debug("injectMMItemsToStructure: menu.structure \u4E0D\u662F\u6570\u7EC4", {
            type: typeof menu.structure,
            preview: JSON.stringify(String(menu.structure)).substring(0, 80)
          });
          return 0;
        }
        log2.debug("injectMMItemsToStructure: \u6CE8\u5165\u524D structure \u957F\u5EA6=" + menu.structure.length);
        var items = buildMMMenuItems(el);
        if (items.length === 0) {
          log2.debug("injectMMItemsToStructure: \u65E0\u6761\u76EE\u53EF\u6CE8\u5165");
          return 0;
        }
        for (var i = 0; i < items.length; i++) {
          menu.structure.push(items[i]);
        }
        log2.debug("injectMMItemsToStructure: \u5DF2\u6CE8\u5165 " + items.length + " \u6761, \u5F53\u524D\u957F\u5EA6=" + menu.structure.length);
        return items.length;
      }
      function ejectMMItemsFromStructure(menu, count) {
        if (!menu || !menu.structure || count <= 0) return;
        for (var i = 0; i < count; i++) {
          menu.structure.pop();
        }
        log2.debug("ejectMMItemsFromStructure: \u5DF2\u5F39\u51FA " + count + " \u6761, \u5F53\u524D\u957F\u5EA6=" + menu.structure.length);
      }
      function getProtoByName(name) {
        try {
          var globalRef = (typeof window !== "undefined" ? window : globalThis)[name];
          return globalRef ? globalRef.prototype : null;
        } catch (e) {
          return null;
        }
      }
      function patchShowContextMenu() {
        if (_originalShowContextMenus["Group"]) {
          log2.debug("patchShowContextMenu: \u5DF2\u6709\u52AB\u6301\uFF0C\u8DF3\u8FC7");
          return;
        }
        var patchedCount = 0;
        var skippedCount = 0;
        for (var i = 0; i < _PATCH_TARGETS.length; i++) {
          var key = _PATCH_TARGETS[i];
          var proto = getProtoByName(key);
          if (!proto || typeof proto.showContextMenu !== "function") {
            skippedCount++;
            log2.debug("patchShowContextMenu: " + key + ".prototype \u4E0D\u53EF\u7528");
            continue;
          }
          log2.debug("patchShowContextMenu: \u52AB\u6301 " + key + ".prototype.showContextMenu");
          _originalShowContextMenus[key] = proto.showContextMenu;
          patchedCount++;
          (function(capturedKey, capturedProto) {
            capturedProto.showContextMenu = function(event) {
              log2.debug("showContextMenu \u88AB\u8C03\u7528", {
                type: capturedKey,
                name: this && this.name,
                modeId: Modes ? Modes.id : "?Modes?",
                menuExists: !!(this && this.menu),
                structureType: this && this.menu && this.menu.structure instanceof Array ? "Array[" + this.menu.structure.length + "]" : typeof (this && this.menu && this.menu.structure)
              });
              var injectedCount = 0;
              if (Modes && Modes.id === "machine_max_part") {
                if (this && this.menu && this.menu.structure instanceof Array) {
                  log2.debug("\u2192 \u6CE8\u5165 MM \u6761\u76EE\u5230 menu.structure");
                  injectedCount = injectMMItemsToStructure(this, this.menu);
                } else {
                  log2.debug("\u2192 this.menu.structure \u4E0D\u53EF\u7528", {
                    menu: this && this.menu ? {
                      type: typeof this.menu,
                      keys: Object.keys(this.menu).slice(0, 8),
                      itemsType: typeof this.menu.items,
                      structureType: typeof this.menu.structure
                    } : null,
                    constructor: this ? this.constructor.name : "null"
                  });
                }
              } else {
                log2.debug("\u2192 \u975E MachineMax \u6A21\u5F0F, \u8DF3\u8FC7");
              }
              var originalFn = _originalShowContextMenus[capturedKey];
              if (originalFn) {
                originalFn.call(this, event);
              }
              if (injectedCount > 0 && this && this.menu) {
                ejectMMItemsFromStructure(this.menu, injectedCount);
              }
            };
          })(key, proto);
        }
        log2.info("patchShowContextMenu: \u5B8C\u6210, \u6210\u529F=" + patchedCount + " \u8DF3\u8FC7=" + skippedCount);
      }
      function restoreShowContextMenu() {
        for (var i = 0; i < _PATCH_TARGETS.length; i++) {
          var key = _PATCH_TARGETS[i];
          if (_originalShowContextMenus[key]) {
            var proto = getProtoByName(key);
            if (proto) {
              proto.showContextMenu = _originalShowContextMenus[key];
              log2.debug("restoreShowContextMenu: \u6062\u590D " + key);
            }
          }
        }
        for (var k in _originalShowContextMenus) {
          delete _originalShowContextMenus[k];
        }
        log2.debug("restoreShowContextMenu: \u5B8C\u6210");
      }
      function patchElementSelect() {
        if (_originalOutlinerElementSelect) {
          log2.debug("patchElementSelect: \u5DF2\u6709\u52AB\u6301\uFF0C\u8DF3\u8FC7");
          return;
        }
        var proto = getProtoByName("OutlinerElement");
        if (!proto || typeof proto.select !== "function") {
          log2.warn("patchElementSelect: OutlinerElement.prototype.select \u4E0D\u53EF\u7528\uFF0C\u8DF3\u8FC7");
          return;
        }
        _originalOutlinerElementSelect = proto.select;
        proto.select = function(event, is_outliner_click) {
          if (Mode.selected && Mode.selected.id === "machine_max_part" && this.parent instanceof Group && !(this instanceof Locator)) {
            return this.parent.select(event, is_outliner_click);
          }
          return _originalOutlinerElementSelect.call(this, event, is_outliner_click);
        };
        log2.info("patchElementSelect: \u5DF2\u52AB\u6301 OutlinerElement.prototype.select \u2014 \u70B9Cube/Mesh\u5C06\u81EA\u52A8\u9009\u7EC4\uFF0CLocator\u4FDD\u6301\u72EC\u7ACB\u9009\u4E2D");
      }
      function restoreElementSelect() {
        if (!_originalOutlinerElementSelect) {
          log2.debug("restoreElementSelect: \u65E0\u52AB\u6301\uFF0C\u8DF3\u8FC7");
          return;
        }
        var proto = getProtoByName("OutlinerElement");
        if (proto) {
          proto.select = _originalOutlinerElementSelect;
          log2.info("restoreElementSelect: \u5DF2\u6062\u590D OutlinerElement.prototype.select");
        }
        _originalOutlinerElementSelect = null;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          patchShowContextMenu,
          restoreShowContextMenu,
          patchElementSelect,
          restoreElementSelect,
          buildMMMenuItems
        };
      }
    }
  });

  // src/mode/icons.js
  var require_icons = __commonJS({
    "src/mode/icons.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { getMarkerInfo, getMarkersForVariant } = require_element_markers();
      var { getConfig } = require_persistence();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("Mode");
      function getIconClassForType(type) {
        const info = getMarkerInfo(type);
        return info ? info.icon : "";
      }
      function refreshOutlinerIcons2() {
        if (!Project || Project === 0) {
          log2.debug("refreshOutlinerIcons: \u9879\u76EE\u672A\u6253\u5F00\uFF0C\u8DF3\u8FC7");
          return;
        }
        const config = getConfig();
        if (!config) {
          log2.debug("refreshOutlinerIcons: config \u4E3A\u7A7A\uFF0C\u8DF3\u8FC7");
          return;
        }
        const activePartId = config._uiState?.activePartId;
        const activeVariantName = config._uiState?.activeVariantName;
        if (!activePartId || !activeVariantName) {
          log2.debug("refreshOutlinerIcons: \u65E0\u6D3B\u8DC3\u96F6\u4EF6/\u53D8\u4F53\uFF0C\u8DF3\u8FC7");
          return;
        }
        log2.debug("refreshOutlinerIcons: \u5237\u65B0\u56FE\u6807", { partId: activePartId, variant: activeVariantName });
        const markers = getMarkersForVariant(config, activePartId, activeVariantName);
        const allElements = [...Group.all, ...Locator.all];
        for (const el of allElements) {
          const marker = markers[el.uuid];
          if (marker) {
            const iconClass = getIconClassForType(marker.type);
            if (iconClass) {
              el.icon = iconClass;
            }
          } else {
            delete el.icon;
          }
          if (typeof el.updateElement === "function") {
            el.updateElement();
          }
        }
      }
      function resetOutlinerIcons() {
        if (!Project || Project === 0) return;
        const allElements = [...Group.all, ...Locator.all];
        for (const el of allElements) {
          delete el.icon;
          if (typeof el.updateElement === "function") {
            el.updateElement();
          }
        }
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          getIconClassForType,
          refreshOutlinerIcons: refreshOutlinerIcons2,
          resetOutlinerIcons
        };
      }
    }
  });

  // src/ui/tag_dialog_helper.js
  var require_tag_dialog_helper = __commonJS({
    "src/ui/tag_dialog_helper.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { showToast: showToast2 } = require_notify();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("TagDialog");
      var TAG_PALETTE = [
        "#3a6a9a",
        "#6a4a9a",
        "#9a4a6a",
        "#4a9a6a",
        "#9a8a3a",
        "#3a9a8a",
        "#8a4a3a",
        "#4a6a9a"
      ];
      function _hashTagColor(tag) {
        var hash = 0;
        for (var i = 0; i < tag.length; i++) {
          hash = tag.charCodeAt(i) + ((hash << 5) - hash);
        }
        return TAG_PALETTE[Math.abs(hash) % TAG_PALETTE.length];
      }
      function showAddTagDialog(vm, variant) {
        if (!variant) return;
        var existingTags = (variant.tags || []).slice();
        var DEFAULT_TAG_GROUPS = {
          direction: {
            label: "\u65B9\u5411",
            tags: ["left", "right", "front", "back", "top", "bottom"]
          },
          function: {
            label: "\u529F\u80FD",
            tags: ["structural", "decoration", "mobility", "weapon", "misc"]
          },
          type: {
            label: "\u7C7B\u578B",
            tags: ["land", "marine", "aerial", "mecha"]
          }
        };
        var TAG_LABELS = {
          left: "\u5DE6 (left)",
          right: "\u53F3 (right)",
          front: "\u524D (front)",
          back: "\u540E (back)",
          top: "\u4E0A (top)",
          bottom: "\u4E0B (bottom)",
          structural: "\u7ED3\u6784 (structural)",
          decoration: "\u88C5\u9970 (decoration)",
          mobility: "\u79FB\u52A8 (mobility)",
          weapon: "\u6B66\u5668 (weapon)",
          misc: "\u6742\u9879 (misc)",
          land: "\u5730\u9762 (land)",
          marine: "\u6C34\u4E2D (marine)",
          aerial: "\u7A7A\u4E2D (aerial)",
          mecha: "\u673A\u7532 (mecha)"
        };
        function tagToDefaultPath(fullTag) {
          var parts = fullTag.split(":");
          if (parts.length !== 2) return null;
          for (var gk2 in DEFAULT_TAG_GROUPS) {
            var group2 = DEFAULT_TAG_GROUPS[gk2];
            if (group2.tags.indexOf(parts[1]) !== -1) {
              return parts[1];
            }
          }
          return null;
        }
        var formFields = {};
        for (var gk in DEFAULT_TAG_GROUPS) {
          var group = DEFAULT_TAG_GROUPS[gk];
          formFields[gk + "_hdr"] = {
            type: "info",
            text: "<b>" + group.label + "</b>"
          };
          for (var ti = 0; ti < group.tags.length; ti++) {
            var tagPath = group.tags[ti];
            var fieldKey = "_t_" + tagPath;
            formFields[fieldKey] = {
              type: "checkbox",
              label: TAG_LABELS[tagPath] || tagPath,
              value: false
            };
          }
        }
        for (var ei = 0; ei < existingTags.length; ei++) {
          var p = tagToDefaultPath(existingTags[ei]);
          if (p) {
            var fk = "_t_" + p;
            if (formFields[fk]) {
              formFields[fk].value = true;
            }
          }
        }
        formFields.customSection = {
          type: "info",
          text: "<b>\u81EA\u5B9A\u4E49\u6807\u7B7E</b>\uFF08\u8D85\u51FA\u9ED8\u8BA4\u8303\u56F4\u7684\u53EF\u5728\u6B64\u6DFB\u52A0\uFF09"
        };
        formFields.customNs = {
          type: "text",
          label: "\u81EA\u5B9A\u4E49\u547D\u540D\u7A7A\u95F4",
          value: "machine_max"
        };
        formFields.customPath = {
          type: "text",
          label: "\u81EA\u5B9A\u4E49\u6807\u7B7E\u8DEF\u5F84",
          value: "",
          description: "\u5982 my_custom_tag\u3002\u4EC5\u9650\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u3001_ - . /"
        };
        var customTags = existingTags.filter(function(t) {
          return !tagToDefaultPath(t);
        });
        formFields.currentCustom = {
          type: "info",
          text: customTags.length > 0 ? "\u5DF2\u6709\u81EA\u5B9A\u4E49\u6807\u7B7E\uFF1A" + customTags.map(function(t) {
            var color = _hashTagColor(t);
            return '<span style="display:inline-block;background:' + color + ';color:#fff;padding:0 6px;margin:1px;border-radius:3px;font-size:11px">' + t + "</span>";
          }).join("") : "\uFF08\u6682\u65E0\u81EA\u5B9A\u4E49\u6807\u7B7E\uFF09"
        };
        new Dialog({
          title: '\u6DFB\u52A0\u53D8\u4F53\u6807\u7B7E \u2014 "' + vm.activeVariantName + '"',
          width: 520,
          form: formFields,
          onConfirm: function(formData) {
            var newTagList = [];
            for (var fieldName in formData) {
              if (fieldName.indexOf("_t_") === 0 && formData[fieldName]) {
                var tagPath2 = fieldName.substring(3);
                newTagList.push("machine_max:" + tagPath2);
              }
            }
            for (var ci = 0; ci < customTags.length; ci++) {
              if (newTagList.indexOf(customTags[ci]) === -1) {
                newTagList.push(customTags[ci]);
              }
            }
            var customNs = (formData.customNs || "").trim().toLowerCase();
            var customPath = (formData.customPath || "").trim().toLowerCase();
            if (customNs && customPath) {
              var nsRegex = /^[a-z0-9_\-./]+$/;
              var pathRegex = /^[a-z0-9_\-./]+$/;
              if (!nsRegex.test(customNs)) {
                showToast2("\u81EA\u5B9A\u4E49\u547D\u540D\u7A7A\u95F4\u683C\u5F0F\u65E0\u6548", "error");
                return false;
              }
              if (!pathRegex.test(customPath)) {
                showToast2("\u81EA\u5B9A\u4E49\u6807\u7B7E\u8DEF\u5F84\u683C\u5F0F\u65E0\u6548", "error");
                return false;
              }
              var fullCustom = customNs + ":" + customPath;
              var dupDefault = tagToDefaultPath(fullCustom);
              if (dupDefault) {
                showToast2('"' + fullCustom + '" \u4E0E\u9ED8\u8BA4\u6807\u7B7E machine_max:' + dupDefault + " \u91CD\u590D\uFF0C\u8BF7\u76F4\u63A5\u5728\u5206\u7C7B\u4E2D\u9009\u62E9", "error");
                return false;
              }
              if (newTagList.indexOf(fullCustom) !== -1) {
                showToast2('\u6807\u7B7E "' + fullCustom + '" \u5DF2\u5B58\u5728', "error");
                return false;
              }
              newTagList.push(fullCustom);
            }
            newTagList = newTagList.filter(function(t, idx) {
              return newTagList.indexOf(t) === idx;
            });
            if (newTagList.length === 0) {
              showToast2("\u8BF7\u81F3\u5C11\u9009\u62E9\u4E00\u4E2A\u6807\u7B7E", "error");
              return false;
            }
            vm.$set(variant, "tags", newTagList);
            log2.info("\u6807\u7B7E\u6DFB\u52A0: \u5DF2\u66F4\u65B0", { tags: newTagList });
            this.hide();
          }
        }).show();
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = { showAddTagDialog, _hashTagColor };
      }
    }
  });

  // src/ui/SubPartPanel.vue.js
  var require_SubPartPanel_vue = __commonJS({
    "src/ui/SubPartPanel.vue.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      Vue.component("mm-sub-part-panel", {
        template: true ? `<div class="mm-section">
    <div class="mm-sticky-title">
        <h3 class="mm-section-title" style="margin:0;border:none;padding:0;display:flex;align-items:center;gap:6px;">
            <span class="mm-marker-badge" :style="{ background: badgeColor }">{{ badgeLabel }}</span>
            <input type="text" class="mm-input" style="flex:1;font-size:12px;padding:2px 6px;height:auto;min-width:0;border:1px solid transparent;background:transparent;"
                v-model="editingName"
                @focus="$event.target.style.border='1px solid #555';$event.target.style.background='#2a2a2a'"
                @blur="onNameBlur($event)"
                @change="onNameChange($event.target.value)"
                placeholder="sub_part.machine_max.main"
                title="\u5B50\u96F6\u4EF6\u540D\u79F0\uFF08\u5B57\u5178 key\uFF09\uFF0C\u4FEE\u6539\u540E\u81EA\u52A8\u8FC1\u79FB\u5B57\u5178" />
        </h3>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u9AA8\u9ABC\u8303\u56F4</h4>
        <div class="mm-field">
            <label title="\u5B50\u90E8\u4EF6\u7684\u8D77\u59CB\u9AA8\u9ABC\u540D\u79F0\uFF0C\u8F93\u5165\u5173\u952E\u5B57\u641C\u7D22\u5E76\u9009\u62E9">\u7ED1\u5B9A\u9AA8\u9ABC</label>
            <input type="text" class="mm-input"
                v-model="editingStartBone"
                @input="onStartBoneInput($event.target.value)"
                :list="boneListId"
                placeholder="\u641C\u7D22\u5E76\u9009\u62E9\u9AA8\u9ABC\u2026" />
            <datalist :id="boneListId">
                <option v-for="(name, idx) in allBoneNames" :key="idx" :value="name" />
            </datalist>
        </div>
        <div class="mm-field">
            <label title="\u5B50\u7EA7\u5B50\u96F6\u4EF6\u81EA\u52A8\u751F\u6210\u7684\u6392\u9664\u9AA8\u9ABC\uFF08\u4E0D\u53EF\u66F4\u6539\uFF09">\u81EA\u52A8\u6392\u9664</label>
            <div class="mm-tags" v-if="autoEndBones.length > 0">
                <span v-for="(bone, i) in autoEndBones" :key="'a'+i" class="mm-tag" style="background:#4a4a6a;cursor:default" title="\u5B50\u7EA7\u5B50\u96F6\u4EF6\u81EA\u52A8\u6392\u9664">
                    {{ bone }}
                </span>
            </div>
            <p v-else class="mm-element-info" style="color:#888;font-size:11px">\uFF08\u65E0\u5B50\u7EA7\u5B50\u96F6\u4EF6\uFF09</p>
        </div>
        <div class="mm-field">
            <label title="\u624B\u52A8\u6DFB\u52A0\u7684\u6392\u9664\u9AA8\u9ABC\uFF08\u53EF\u589E\u5220\uFF09">\u624B\u52A8\u6392\u9664</label>
            <div class="mm-tags">
                <span v-for="(bone, i) in config.end_bones" :key="'m'+i" class="mm-tag" style="background:#6a4a9a">
                    {{ bone }}
                    <span class="mm-tag-remove" @click="$emit('remove-end-bone', i)">\xD7</span>
                </span>
                <div style="display:flex;gap:4px;align-items:center">
                    <input type="text" class="mm-input" style="width:80px;font-size:11px"
                        v-model="newEndBone" @keyup.enter="onAddEndBone"
                        :list="boneListId"
                        placeholder="\u641C\u7D22\u9AA8\u9ABC\u2026" />
                    <button class="mm-btn mm-btn-sm" @click="onAddEndBone" title="\u6DFB\u52A0\u6392\u9664\u9AA8\u9ABC" style="font-size:16px">+</button>
                </div>
            </div>
        </div>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u7269\u7406\u5C5E\u6027</h4>
        <div class="mm-field">
            <label title="\u5B50\u90E8\u4EF6\u57FA\u7840\u751F\u547D\u503C\uFF0C\u964D\u81F30\u65F6\u8BE5\u5B50\u90E8\u4EF6\u7684\u6240\u6709\u5B50\u7CFB\u7EDF\u4F1A\u762B\u75EA">\u8010\u4E45\u5EA6</label>
            <input type="number" class="mm-input" v-model.number="config.durability" @input="onFieldChange('durability', config.durability || 0)" step="1" min="0" />
        </div>
        <div class="mm-field">
            <label title="\u5B50\u90E8\u4EF6\u8D28\u91CF(kg)\uFF0C\u5FC5\u987B\u5927\u4E8E0\uFF0C\u7528\u4E8E\u7269\u7406\u8BA1\u7B97">\u8D28\u91CF (kg)</label>
            <input type="number" class="mm-input" v-model.number="config.mass" @input="onFieldChange('mass', config.mass || 0)" step="0.5" min="0" />
        </div>
        <div class="mm-field">
            <label title="\u8D28\u5FC3\u5B9A\u4F4D\u5668\u540D\u79F0\uFF0C\u8F93\u5165\u5173\u952E\u5B57\u641C\u7D22\u5E76\u9009\u62E9">\u8D28\u5FC3</label>
            <input type="text" class="mm-input"
                v-model="editingMassCenter"
                @input="onFieldChange('mass_center', $event.target.value)"
                :list="locatorListId"
                placeholder="mass_center" />
            <datalist :id="locatorListId">
                <option v-for="(name, idx) in allLocatorNames" :key="idx" :value="name" />
            </datalist>
            <p v-if="allLocatorNames.length === 0" class="mm-element-info" style="color:#888;font-size:10px">
                \u8BE5\u5B50\u96F6\u4EF6\u7684\u9AA8\u9ABC\u5B50\u6811\u4E0B\u6CA1\u6709\u5B9A\u4F4D\u5668
            </p>
        </div>
        <div class="mm-field">
            <label title="\u5B50\u90E8\u4EF6\u5728\u4E09\u4E2A\u8F74\u5411\u4E0A\u7684\u6295\u5F71\u9762\u79EF(m\xB2)\uFF0C\u7528\u4E8E\u8BA1\u7B97\u7A7A\u6C14\u963B\u529B">\u6295\u5F71\u9762\u79EF (m\xB2)</label>
            <div style="display:flex;gap:6px">
                <div style="flex:1">
                    <span style="font-size:10px;color:#888">X</span>
                    <input type="number" class="mm-input" style="width:100%" v-model.number="config.projected_area[0]" @input="onProjectedAreaChange(0, config.projected_area[0] || 0)" step="0.1" min="0" />
                </div>
                <div style="flex:1">
                    <span style="font-size:10px;color:#888">Y</span>
                    <input type="number" class="mm-input" style="width:100%" v-model.number="config.projected_area[1]" @input="onProjectedAreaChange(1, config.projected_area[1] || 0)" step="0.1" min="0" />
                </div>
                <div style="flex:1">
                    <span style="font-size:10px;color:#888">Z</span>
                    <input type="number" class="mm-input" style="width:100%" v-model.number="config.projected_area[2]" @input="onProjectedAreaChange(2, config.projected_area[2] || 0)" step="0.1" min="0" />
                </div>
            </div>
        </div>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u5730\u5F62\u78B0\u649E</h4>
        <div class="mm-field">
            <label title="\u5730\u5F62\u78B0\u649E\u6A21\u5F0F\uFF1Atrue=\u4E0E\u6240\u6709\u65B9\u5757\u78B0\u649E\uFF0Cground=\u4EC5\u4E0E\u5730\u9762\u78B0\u649E\uFF0Cfalse=\u4E0D\u4E0E\u4EFB\u4F55\u65B9\u5757\u78B0\u649E">\u78B0\u649E\u6A21\u5F0F</label>
            <select class="mm-select" :value="config.block_collision" @change="onFieldChange('block_collision', $event.target.value)">
                <option value="true">true\uFF08\u6240\u6709\u65B9\u5757\uFF09</option>
                <option value="ground">ground\uFF08\u4EC5\u5730\u9762\uFF09</option>
                <option value="false">false\uFF08\u65E0\u78B0\u649E\uFF09</option>
            </select>
        </div>
        <div class="mm-field">
            <label title="\u78B0\u649E\u68C0\u6D4B\u9AD8\u5EA6(m)\uFF0C\u969C\u788D\u5C0F\u4E8E\u6B64\u9AD8\u5EA6\u65F6\u4E0D\u53D1\u751F\u78B0\u649E\uFF08\u4EC5ground\u6A21\u5F0F\u6709\u6548\uFF09\u3002\u9ED8\u8BA4-1.0\u8868\u793A\u6240\u6709\u969C\u788D\u5747\u78B0\u649E">\u78B0\u649E\u9AD8\u5EA6 (m)</label>
            <input type="number" class="mm-input" v-model.number="config.collision_height" @input="onFieldChange('collision_height', config.collision_height || -1)" step="0.5" />
        </div>
        <div class="mm-field mm-field-row">
            <label title="\u662F\u5426\u542F\u7528\u6500\u722C\u8F85\u52A9\u529F\u80FD">\u6500\u722C\u8F85\u52A9</label>
            <input type="checkbox" :checked="config.climb_assist" @change="onFieldChange('climb_assist', $event.target.checked)" />
        </div>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u6D41\u4F53\u52A8\u529B\u4F18\u5148\u7EA7</h4>
        <div class="mm-field">
            <label title="\u7A7A\u6C14\u963B\u529B\u8BA1\u7B97\u4F18\u5148\u7EA7\uFF0C\u503C\u8D8A\u5927\u4F18\u5148\u7EA7\u8D8A\u9AD8\u3002\u4F18\u5148\u7EA7\u9AD8\u6216\u76F8\u7B49\u7684\u90E8\u4EF6\u4F1A\u906E\u6321\u4F18\u5148\u7EA7\u4F4E\u6216\u76F8\u7B49\u7684\u90E8\u4EF6">hydro_priority</label>
            <input type="number" class="mm-input" v-model.number="config.hydro_priority" @input="onFieldChange('hydro_priority', config.hydro_priority || 0)" step="1" min="0" />
        </div>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u78B0\u649E\u7BB1 ({{ hitBoxCount }})</h4>
        <div v-if="hitBoxCount === 0" class="mm-element-info" style="color:#888">
            \u6682\u65E0\u78B0\u649E\u7BB1 \u2014 \u5728 Outliner \u4E2D\u53F3\u952E\u9AA8\u9ABC\u5E76\u9009\u62E9"\u6807\u8BB0\u4E3A\u78B0\u649E\u7BB1"
        </div>
        <div v-for="(hb, hbKey) in hitBoxes" :key="hbKey" class="mm-sub-item-row mm-clickable" :title="'\u70B9\u51FB\u8DF3\u8F6C\u5230\u78B0\u649E\u7BB1 ' + resolveHitBoxName(hbKey)" @click="navigateToHitBox(hbKey)">
            <span class="mm-sub-item-name">
                <span class="mm-marker-badge" style="background:#D94A4A;font-size:10px;padding:0 4px">HB</span>
                {{ resolveHitBoxName(hbKey) }}
            </span>
            <span class="mm-sub-item-meta">{{ hb.type }} | {{ hb.material }} | {{ hb.thickness }}mm</span>
        </div>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u4EA4\u4E92\u533A ({{ interactBoxCount }})</h4>
        <div v-if="interactBoxCount === 0" class="mm-element-info" style="color:#888">
            \u6682\u65E0\u4EA4\u4E92\u533A \u2014 \u5728 Outliner \u4E2D\u53F3\u952E\u9AA8\u9ABC\u5E76\u9009\u62E9"\u6807\u8BB0\u4E3A\u4EA4\u4E92\u533A"
        </div>
        <div v-for="(ib, ibKey) in interactBoxes" :key="ibKey" class="mm-sub-item-row mm-clickable" :title="'\u70B9\u51FB\u8DF3\u8F6C\u5230\u4EA4\u4E92\u533A ' + resolveInteractBoxName(ibKey)" @click="navigateToInteractBox(ibKey)">
            <span class="mm-sub-item-name">
                <span class="mm-marker-badge" style="background:#D9A441;font-size:10px;padding:0 4px">IB</span>
                {{ resolveInteractBoxName(ibKey) }}
            </span>
            <span class="mm-sub-item-meta">{{ ib.interact_mode || 'fast' }} | {{ ib.bone || '\uFF08\u672A\u6307\u5B9A\u9AA8\u9ABC\uFF09' }}</span>
        </div>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u8FDE\u63A5\u70B9 ({{ connectorCount }})</h4>
        <div v-if="connectorCount === 0" class="mm-element-info" style="color:#888">
            \u6682\u65E0\u8FDE\u63A5\u70B9 \u2014 \u5728 Outliner \u4E2D\u53F3\u952E Locator \u5E76\u9009\u62E9"\u6807\u8BB0\u4E3A\u8FDE\u63A5\u70B9"
        </div>
        <div v-for="(conn, connKey) in config.connectors" :key="connKey" class="mm-sub-item-row mm-clickable" :title="'\u70B9\u51FB\u8DF3\u8F6C\u5230\u8FDE\u63A5\u70B9 ' + connKey" @click="navigateToConnector(connKey)">
            <span class="mm-sub-item-name">
                <span class="mm-marker-badge" style="background:#3AA83A;font-size:10px;padding:0 4px">CN</span>
                {{ resolveConnectorName(connKey) }}
            </span>
            <span class="mm-sub-item-meta">{{ conn.definition || '\uFF08\u672A\u6307\u5B9A\u5B9A\u4E49\uFF09' }}</span>
        </div>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title" style="display:flex;align-items:center;justify-content:space-between">
            <span>\u5B50\u7CFB\u7EDF ({{ subsystemCount }})</span>
            <button class="mm-btn mm-btn-sm" @click="addSubsystem" title="\u6DFB\u52A0\u5B50\u7CFB\u7EDF" style="font-size:18px;font-weight:bold">+</button>
        </h4>
        <div v-if="subsystemCount === 0" class="mm-element-info" style="color:#888">
            \u6682\u65E0\u5B50\u7CFB\u7EDF \u2014 \u70B9\u51FB [+ ] \u6DFB\u52A0
        </div>
        <div v-for="ssKey in subsystemKeys" :key="ssKey" class="mm-sub-item-row mm-clickable" :title="'\u70B9\u51FB\u67E5\u770B\u5B50\u7CFB\u7EDF ' + ssKey" @click="navigateToSubsystem(ssKey)">
            <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
                <span class="mm-sub-item-name">
                    <span class="mm-marker-badge" :style="{ background: resolveSubsystemTypeColor(ssKey) }" style="font-size:10px;padding:0 4px">SS</span>
                    <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="ssKey">{{ ssKey }}</span>
                </span>
                <button class="mm-btn mm-btn-sm" @click.stop="deleteSubsystem(ssKey)" title="\u5220\u9664\u5B50\u7CFB\u7EDF" style="color:#ff6b6b;font-size:14px;width:24px;height:24px;min-width:24px;min-height:24px">\xD7</button>
            </div>
            <span class="mm-sub-item-meta">{{ resolveSubsystemTypeName(ssKey) }}</span>
        </div>
    </div>
</div>` : "<p>\u5B50\u96F6\u4EF6\u9762\u677F\u52A0\u8F7D\u4E2D...</p>",
        props: {
          config: { type: Object, required: true },
          elementName: { type: String, default: "" },
          spName: { type: String, default: "" },
          badgeColor: { type: String, default: "#4A90D9" },
          badgeLabel: { type: String, default: "\u5B50\u96F6\u4EF6" },
          hitBoxes: { type: Object, default: function() {
            return {};
          } },
          interactBoxes: { type: Object, default: function() {
            return {};
          } },
          allBoneNames: { type: Array, default: function() {
            return [];
          } },
          allLocatorNames: { type: Array, default: function() {
            return [];
          } },
          refreshKey: { type: Number, default: 0 }
        },
        data: function() {
          return {
            newEndBone: "",
            editingName: this.spName || "",
            editingStartBone: this.config.start_bone,
            editingMassCenter: this.config.mass_center
          };
        },
        watch: {
          spName: function(val) {
            if (val !== this.editingName) {
              this.editingName = val;
            }
          },
          "config.start_bone": function(val) {
            if (val !== this.editingStartBone) {
              this.editingStartBone = val;
            }
          },
          "config.mass_center": function(val) {
            if (val !== this.editingMassCenter) {
              this.editingMassCenter = val;
            }
          }
        },
        computed: {
          boneListId: function() {
            return "mm-bone-list-" + this._uid;
          },
          locatorListId: function() {
            return "mm-locator-list-" + this._uid;
          },
          autoEndBones: function() {
            return this.config.auto_end_bones || [];
          },
          hitBoxCount: function() {
            void this.refreshKey;
            return this.hitBoxes ? Object.keys(this.hitBoxes).length : 0;
          },
          interactBoxCount: function() {
            void this.refreshKey;
            return this.interactBoxes ? Object.keys(this.interactBoxes).length : 0;
          },
          connectorCount: function() {
            void this.refreshKey;
            return this.config.connectors ? Object.keys(this.config.connectors).length : 0;
          },
          subsystemCount: function() {
            void this.refreshKey;
            return this.config.subsystems ? Object.keys(this.config.subsystems).length : 0;
          },
          subsystemKeys: function() {
            void this.refreshKey;
            return this.config.subsystems ? Object.keys(this.config.subsystems) : [];
          }
        },
        methods: {
          onFieldChange: function(field, value) {
            this.$emit("field-change", field, value);
          },
          onNameChange: function(value) {
            if (value !== this.spName) {
              this.$emit("name-change", this.spName, value);
            }
          },
          onNameBlur: function(event) {
            event.target.style.border = "1px solid transparent";
            event.target.style.background = "transparent";
          },
          onStartBoneInput: function(value) {
            this.$emit("field-change", "start_bone", value);
          },
          onProjectedAreaChange: function(axis, value) {
            this.$emit("projected-area-change", axis, value);
          },
          onAddEndBone: function() {
            if (this.newEndBone && this.newEndBone.trim()) {
              this.$emit("add-end-bone", this.newEndBone.trim());
              this.newEndBone = "";
            }
          },
          resolveHitBoxName: function(hbKey) {
            var el = Group.all.find(function(g) {
              return g.name === hbKey || g.uuid === hbKey;
            });
            return el ? el.name : hbKey;
          },
          resolveInteractBoxName: function(ibKey) {
            return ibKey;
          },
          resolveConnectorName: function(connKey) {
            return connKey;
          },
          /**
           * 解析子系统类型的中文显示名
           */
          resolveSubsystemTypeName: function(ssKey) {
            var ss = this.config.subsystems && this.config.subsystems[ssKey];
            if (!ss || !ss.type) return "\u672A\u6307\u5B9A\u7C7B\u578B";
            var ssTypes = require_subsystem_types();
            var meta = ssTypes.getTypeMeta(ss.type);
            return meta ? meta.displayName : ss.type;
          },
          /**
           * 获取子系统类型的颜色
           */
          resolveSubsystemTypeColor: function(ssKey) {
            var ss = this.config.subsystems && this.config.subsystems[ssKey];
            if (!ss || !ss.type) return "#888";
            var ssTypes = require_subsystem_types();
            return ssTypes.getTypeColor(ss.type);
          },
          /**
           * 导航到子系统：点击子系统条目时切换到子系统属性面板（虚拟选择）
           */
          navigateToSubsystem: function(ssKey) {
            this.$emit("navigate-to-subsystem", ssKey);
          },
          /**
           * 添加子系统：弹出类型选择对话框
           */
          addSubsystem: function() {
            this.$emit("add-subsystem");
          },
          /**
           * 删除子系统：确认后删除
           */
          deleteSubsystem: function(ssKey) {
            this.$emit("delete-subsystem", { spKey: this.spName, ssKey });
          },
          /**
           * 导航到碰撞箱：点击碰撞箱条目时选中对应的 Group 骨骼，切换到碰撞箱属性面板
           */
          navigateToHitBox: function(hbKey) {
            this.$emit("navigate-to-hit-box", hbKey);
          },
          /**
           * 导航到交互区：点击交互区条目时选中对应的 Group 骨骼，切换到交互区属性面板
           */
          navigateToInteractBox: function(ibKey) {
            var ib = this.interactBoxes && this.interactBoxes[ibKey];
            var boneName = ib ? ib.bone : "";
            if (boneName) {
              this.$emit("navigate-to-hit-box", boneName);
            }
          },
          /**
           * 导航到连接点：点击连接点条目时选中对应的 Locator，切换到连接点属性面板
           */
          navigateToConnector: function(connKey) {
            this.$emit("navigate-to-connector", connKey);
          }
        }
      });
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {};
      }
    }
  });

  // src/ui/HitBoxPanel.vue.js
  var require_HitBoxPanel_vue = __commonJS({
    "src/ui/HitBoxPanel.vue.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      Vue.component("mm-hit-box-panel", {
        template: true ? `<div class="mm-section">
    <div class="mm-sticky-title">
        <h3 class="mm-section-title" style="margin:0;border:none;padding:0;">
            <span class="mm-marker-badge" :style="{ background: badgeColor }">{{ badgeLabel }}</span>
            {{ elementName }}
        </h3>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u5F52\u5C5E</h4>
        <div v-if="parentSubPartKey" class="mm-sub-item-row mm-clickable" :title="'\u70B9\u51FB\u8DF3\u8F6C\u5230\u5B50\u96F6\u4EF6 ' + parentSubPartKey" @click="navigateToSubPart">
            <span class="mm-sub-item-name">
                <span class="mm-marker-badge" style="background:#4A90D9;font-size:10px;padding:0 4px">SP</span>
                {{ parentSubPartKey }}
            </span>
        </div>
        <div v-else class="mm-sub-item-row" title="\u7531\u9AA8\u9ABC\u5C42\u7EA7\u81EA\u52A8\u68C0\u6D4B" style="cursor:default">
            <span class="mm-sub-item-name">
                <span class="mm-marker-badge" style="background:#4A90D9;font-size:10px;padding:0 4px">SP</span>
                \uFF08\u6E38\u79BB \u2014 \u65E0\u5F52\u5C5E\uFF09
            </span>
        </div>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u78B0\u649E\u4F53\u5C5E\u6027</h4>
        <div class="mm-field">
            <label title="\u78B0\u649E\u5F62\u72B6ID\uFF0C\u540CID\u7684\u78B0\u649E\u4F53\u79EF\u4E0D\u4F1A\u88AB\u540C\u4E00\u6B21\u653B\u51FB\u91CD\u590D\u547D\u4E2D">\u78B0\u649E\u5F62\u72B6ID</label>
            <input type="text" class="mm-input" :value="config.id" @input="onFieldChange('id', $event.target.value)" placeholder="part" />
        </div>
        <div class="mm-field">
            <label title="\u78B0\u649E\u5F62\u72B6\u7C7B\u578B">\u7C7B\u578B</label>
            <select class="mm-select" :value="config.type" @change="onFieldChange('type', $event.target.value)">
                <option value="box">box\uFF08\u957F\u65B9\u4F53\uFF09</option>
                <option value="sphere">sphere\uFF08\u7403\u4F53\uFF09</option>
                <option value="cylinder">cylinder\uFF08\u5706\u67F1\u4F53\uFF09</option>
                <option value="capsule">capsule\uFF08\u80F6\u56CA\u4F53\uFF09</option>
                <option value="wheel">wheel\uFF08\u8F6E\u80CE\uFF09</option>
            </select>
        </div>
        <div class="mm-field">
            <label title="\u6750\u6599\u6CE8\u518CID\uFF0C\u63A7\u5236\u6469\u64E6\u3001\u51CF\u4F24\u3001\u97F3\u6548\u7B49">\u6750\u8D28</label>
            <select class="mm-select" :value="config.material" @change="onFieldChange('material', $event.target.value)">
                <option v-for="(mat, matKey) in materialDefs" :key="matKey" :value="matKey">
                    {{ matKey }}
                </option>
            </select>
        </div>
        <div class="mm-field">
            <label title="\u62A4\u7532\u539A\u5EA6(mm)\uFF0C\u51CF\u514D\u4F24\u5BB3\u5E76\u63A7\u5236\u78B0\u649E\u65F6\u7684\u80FD\u91CF\u5206\u914D">\u539A\u5EA6 (mm)</label>
            <input type="number" class="mm-input" :value="config.thickness" @input="onFieldChange('thickness', parseFloat($event.target.value) || 1)" step="1" min="0" />
        </div>
        <div class="mm-field">
            <label title="\u5173\u8054\u5B50\u7CFB\u7EDF\u540D\u79F0\uFF0C\u78B0\u649E\u7BB1\u53D7\u4F24\u65F6\u8BE5\u5B50\u7CFB\u7EDF\u540C\u6B65\u53D7\u4F24">\u5173\u8054\u5B50\u7CFB\u7EDF</label>
            <select class="mm-select" :value="config.subsystem || ''" @change="onFieldChange('subsystem', $event.target.value || '')">
                <option v-for="(label, key) in subsystemOptions" :key="key" :value="key">{{ label }}</option>
            </select>
        </div>
        <div class="mm-field">
            <label title="Molang\u6761\u4EF6\u8868\u8FBE\u5F0F\uFF0C\u4E3A\u7A7A\u5219\u59CB\u7EC8\u751F\u6548">\u6761\u4EF6\u8868\u8FBE\u5F0F</label>
            <input type="text" class="mm-input" :value="config.condition" @input="onFieldChange('condition', $event.target.value)" placeholder="true" />
        </div>
    </div>

    <div class="mm-section">
        <div class="mm-foldable-header" @click="overwriteExpanded = !overwriteExpanded">
            <h4 class="mm-section-title">\u6750\u8D28\u8986\u5199\uFF08\u53EF\u9009\uFF09</h4>
            <span class="mm-fold-icon">{{ overwriteExpanded ? '\u25BC' : '\u25B6' }}</span>
        </div>
        <div v-if="overwriteExpanded" class="mm-foldable-body">
            <div class="mm-field">
                <label title="RHA\u7B49\u6548\u6297\u7A7F\u7CFB\u6570\u8986\u5199">RHA\u7CFB\u6570</label>
                <input type="number" class="mm-input" :value="overwriteVal('rha')" @input="onOverwriteChange('rha', parseFloat($event.target.value) || 1)" step="0.1" min="0" />
            </div>
            <div class="mm-field">
                <label title="\u65B9\u5757\u4F24\u5BB3\u7CFB\u6570\u8986\u5199">\u65B9\u5757\u4F24\u5BB3\u7CFB\u6570</label>
                <input type="number" class="mm-input" :value="overwriteVal('block_damage_factor')" @input="onOverwriteChange('block_damage_factor', parseFloat($event.target.value) || 1)" step="0.1" min="0" />
            </div>
            <div class="mm-field mm-field-row">
                <label title="\u7B49\u6548\u62A4\u7532\u539A\u5EA6\u662F\u5426\u53D7\u5165\u5C04\u89D2\u5EA6\u5F71\u54CD\u8986\u5199">\u89D2\u5EA6\u6548\u5E94</label>
                <input type="checkbox" :checked="overwriteVal('angle_effect')" @change="onOverwriteChange('angle_effect', $event.target.checked)" />
            </div>
            <div class="mm-field">
                <label title="\u672A\u51FB\u7A7F\u4F24\u5BB3\u7CFB\u6570\u8986\u5199">\u672A\u51FB\u7A7F\u7CFB\u6570</label>
                <input type="number" class="mm-input" :value="overwriteVal('un_penetrate_damage_factor')" @input="onOverwriteChange('un_penetrate_damage_factor', parseFloat($event.target.value) || 0)" step="0.1" min="0" />
            </div>
        </div>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u9AA8\u9ABC\u4FE1\u606F\uFF08\u53EA\u8BFB\uFF09</h4>
        <p class="mm-element-info">\u5305\u542B\u65B9\u5757\u6570: {{ cubeCount }}</p>
        <p class="mm-element-info" v-if="cubeDimensions">\u5C3A\u5BF8: {{ cubeDimensions }}</p>
        <p class="mm-element-info" v-if="cubePosition">\u4F4D\u7F6E: {{ cubePosition }}</p>
    </div>
</div>` : "<p>\u78B0\u649E\u7BB1\u9762\u677F\u52A0\u8F7D\u4E2D...</p>",
        props: {
          config: { type: Object, required: true },
          elementName: { type: String, default: "" },
          parentSubPartKey: { type: String, default: "" },
          materialDefs: { type: Object, default: function() {
            return {};
          } },
          parentSubsystems: { type: Object, default: function() {
            return {};
          } }
        },
        data: function() {
          return {
            overwriteExpanded: false
          };
        },
        computed: {
          badgeColor: function() {
            return "#D94A4A";
          },
          badgeLabel: function() {
            return "\u78B0\u649E\u7BB1";
          },
          /**
           * 所属子零件内的子系统列表，用于关联子系统下拉选择
           * 格式: { subsystemKey: subsystemKey }，供 v-for 遍历
           */
          subsystemOptions: function() {
            var options = { "": "\uFF08\u65E0\uFF09" };
            for (var key in this.parentSubsystems) {
              if (this.parentSubsystems.hasOwnProperty(key)) {
                options[key] = key;
              }
            }
            return options;
          },
          cubeCount: function() {
            if (!this._parentGroup || !this._parentGroup.children) return 0;
            return this._parentGroup.children.filter(function(c) {
              return c instanceof Cube;
            }).length;
          },
          cubeDimensions: function() {
            var group = this._parentGroup;
            if (!group || !group.children) return null;
            var cubes = group.children.filter(function(c2) {
              return c2 instanceof Cube;
            });
            if (cubes.length === 0) return null;
            var min = [Infinity, Infinity, Infinity];
            var max = [-Infinity, -Infinity, -Infinity];
            for (var i = 0; i < cubes.length; i++) {
              var c = cubes[i];
              for (var a = 0; a < 3; a++) {
                if (c.from[a] < min[a]) min[a] = c.from[a];
                if (c.to[a] > max[a]) max[a] = c.to[a];
              }
            }
            var size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
            return size[0].toFixed(2) + " \xD7 " + size[1].toFixed(2) + " \xD7 " + size[2].toFixed(2);
          },
          cubePosition: function() {
            var group = this._parentGroup;
            if (!group) return null;
            var pos = group.origin || [0, 0, 0];
            return "(" + pos[0].toFixed(2) + ", " + pos[1].toFixed(2) + ", " + pos[2].toFixed(2) + ")";
          },
          _parentGroup: function() {
            var el = this.$parent && this.$parent.selectedElement;
            if (!el) return null;
            if (el instanceof Group) return el;
            return el.parent instanceof Group ? el.parent : null;
          }
        },
        methods: {
          onFieldChange: function(field, value) {
            this.$emit("field-change", field, value);
          },
          onOverwriteChange: function(field, value) {
            this.$emit("overwrite-change", field, value);
          },
          overwriteVal: function(field) {
            return this.config.overwrite ? this.config.overwrite[field] : void 0;
          },
          /**
           * 导航到归属子零件：点击归属标签时选中对应的子零件 Group，切换回子零件属性面板
           */
          navigateToSubPart: function() {
            this.$emit("navigate-to-sub-part", this.parentSubPartKey);
          }
        }
      });
      module.exports = {};
    }
  });

  // src/ui/InteractBoxPanel.vue.js
  var require_InteractBoxPanel_vue = __commonJS({
    "src/ui/InteractBoxPanel.vue.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      Vue.component("mm-interact-box-panel", {
        template: true ? `<div class="mm-section">
    <div class="mm-sticky-title">
        <h3 class="mm-section-title" style="margin:0;border:none;padding:0;display:flex;align-items:center;gap:6px;">
            <span class="mm-marker-badge" :style="{ background: badgeColor }">{{ badgeLabel }}</span>
            <input type="text" class="mm-input" style="flex:1;font-size:12px;padding:2px 6px;height:auto;min-width:0;border:1px solid transparent;background:transparent;"
                v-model="editingName"
                @focus="$event.target.style.border='1px solid #555';$event.target.style.background='#2a2a2a'"
                @blur="onNameBlur($event)"
                @change="onNameChange($event.target.value)"
                placeholder="interact.machine_max.xxx"
                title="\u4EA4\u4E92\u533A\u540D\u79F0\uFF08\u5B57\u5178 key\uFF09\uFF0C\u4FEE\u6539\u540E\u81EA\u52A8\u8FC1\u79FB\u5B57\u5178" />
        </h3>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u5F52\u5C5E</h4>
        <div v-if="parentSubPartKey" class="mm-sub-item-row mm-clickable" :title="'\u70B9\u51FB\u8DF3\u8F6C\u5230\u5B50\u96F6\u4EF6 ' + parentSubPartKey" @click="navigateToSubPart">
            <span class="mm-sub-item-name">
                <span class="mm-marker-badge" style="background:#4A90D9;font-size:10px;padding:0 4px">SP</span>
                {{ parentSubPartKey }}
            </span>
        </div>
        <div v-else class="mm-sub-item-row" title="\u7531\u9AA8\u9ABC\u5C42\u7EA7\u81EA\u52A8\u68C0\u6D4B" style="cursor:default">
            <span class="mm-sub-item-name">
                <span class="mm-marker-badge" style="background:#4A90D9;font-size:10px;padding:0 4px">SP</span>
                \uFF08\u6E38\u79BB \u2014 \u65E0\u5F52\u5C5E\uFF09
            </span>
        </div>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u7ED1\u5B9A\u9AA8\u9ABC</h4>
        <div class="mm-field">
            <label title="\u8BE5\u4EA4\u4E92\u533A\u7ED1\u5B9A\u7684\u9AA8\u9ABC\u540D\u79F0\uFF0C\u51B3\u5B9A\u4EA4\u4E92\u533A\u5728 3D \u7A7A\u95F4\u4E2D\u7684\u4F4D\u7F6E\u548C\u59FF\u6001">\u9AA8\u9ABC</label>
            <input type="text" class="mm-input"
                v-model="editingBone"
                @change="onBoneChange($event.target.value)"
                :list="boneListId"
                placeholder="\u641C\u7D22\u5E76\u9009\u62E9\u9AA8\u9ABC\u2026" />
            <datalist :id="boneListId">
                <option v-for="(name, idx) in allBoneNames" :key="idx" :value="name" />
            </datalist>
            <p v-if="allBoneNames.length === 0" class="mm-element-info" style="color:#888;font-size:10px">
                \u5F53\u524D\u6A21\u578B\u4E2D\u6CA1\u6709\u4EFB\u4F55\u9AA8\u9ABC\uFF08Group\uFF09
            </p>
        </div>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u4EA4\u4E92\u533A\u5C5E\u6027</h4>
        <div class="mm-field">
            <label title="\u4EA4\u4E92\u6A21\u5F0F\u3002fast\uFF1A\u73A9\u5BB6\u78B0\u649E\u7BB1\u4E0E\u4EA4\u4E92\u533A\u78B0\u649E\u65F6\u6309\u4E0B\u4EA4\u4E92\u952E\u89E6\u53D1\uFF1Baccurate\uFF1A\u9700\u8981\u73A9\u5BB6\u7784\u51C6\u4EA4\u4E92\u533A">\u4EA4\u4E92\u6A21\u5F0F</label>
            <select class="mm-select" :value="config.interact_mode" @change="onFieldChange('interact_mode', $event.target.value)">
                <option value="fast">fast\uFF08\u5FEB\u901F\uFF09</option>
                <option value="accurate">accurate\uFF08\u7CBE\u786E\uFF09</option>
            </select>
        </div>
        <div class="mm-field">
            <label title="\u4EA4\u4E92\u533A\u542F\u7528\u6761\u4EF6\u903B\u8F91\u3002AND\uFF1A\u6240\u6709\u8F93\u5165\u4FE1\u53F7\u90FD\u4E0D\u4E3A0\u65F6\u542F\u7528\uFF1BNOR\uFF1A\u4EFB\u610F\u4E00\u4E2A\u8F93\u5165\u4FE1\u53F7\u4E3A0\u65F6\u542F\u7528\uFF08\u9ED8\u8BA4\uFF09">\u6761\u4EF6\u903B\u8F91</label>
            <select class="mm-select" :value="config.condition" @change="onFieldChange('condition', $event.target.value)">
                <option value="AND">AND\uFF08\u5168\u771F\u5219\u771F\uFF09</option>
                <option value="OR">OR\uFF08\u6709\u771F\u5219\u771F\uFF09</option>
                <option value="NAND">NAND\uFF08\u5168\u771F\u5219\u5047\uFF09</option>
                <option value="NOR">NOR\uFF08\u6709\u771F\u5219\u5047\uFF09</option>
                <option value="XOR">XOR\uFF08\u5947\u771F\u5219\u771F\uFF09</option>
                <option value="XNOR">XNOR\uFF08\u5076\u771F\u5219\u771F\uFF09</option>
            </select>
        </div>
    </div>

    <!-- === \u4FE1\u53F7\u76EE\u6807 (signal_targets) === -->
    <div class="mm-section">
        <h4 class="mm-section-title" style="display:flex;align-items:center;justify-content:space-between">
            <span>\u4FE1\u53F7\u76EE\u6807</span>
            <button class="mm-btn mm-btn-sm" @click="addSignalTargetChannel" title="\u6DFB\u52A0\u4FE1\u53F7\u9891\u9053" style="font-size:18px;font-weight:bold">+</button>
        </h4>
        <div v-if="signalTargetChannelCount === 0" class="mm-element-info" style="color:#888;font-size:11px">
            \u65E0\u4FE1\u53F7\u76EE\u6807 \u2014 \u70B9\u51FB [+ ] \u6DFB\u52A0\u9891\u9053
        </div>
        <div v-for="(targets, channel, ci) in signalTargetEntries" :key="ci" class="mm-signal-card">
            <div class="mm-signal-header">
                <input type="text" class="mm-input" style="flex:1;font-size:11px" :value="channel"
                    @change="onSignalTargetChannelChange(channel, $event.target.value)"
                    :list="'ib-sig-chan-'+_uid" placeholder="\u9891\u9053\u540D" />
                <button class="mm-btn mm-btn-sm mm-btn-danger-light" @click="removeSignalTargetChannel(channel)" title="\u5220\u9664\u9891\u9053">\xD7</button>
            </div>
            <div v-for="(t, ti) in targets" :key="ti" style="display:flex;gap:4px;align-items:center;margin-left:16px;margin-top:2px">
                <input type="text" class="mm-input" style="flex:1;font-size:11px" :value="t"
                    @change="updateSignalTargetItem(channel, ti, $event.target.value)"
                    :list="'ib-sig-tgt-'+_uid" placeholder="\u76EE\u6807\uFF08\u5B50\u7CFB\u7EDF\u540D / subpart / vehicle / \u8FDE\u63A5\u70B9\u540D\uFF09" />
                <button class="mm-btn mm-btn-sm mm-btn-danger-light" @click="removeSignalTargetItem(channel, ti)" title="\u5220\u9664\u76EE\u6807">\xD7</button>
            </div>
            <button class="mm-btn" style="margin-left:16px;margin-top:2px;font-size:11px" @click="addSignalTargetItem(channel)">+ \u6DFB\u52A0\u76EE\u6807</button>
        </div>
        <datalist :id="'ib-sig-chan-'+_uid">
            <option v-for="h in channelHints" :key="h" :value="h" />
        </datalist>
        <datalist :id="'ib-sig-tgt-'+_uid">
            <option v-for="h in signalTargetHints" :key="h" :value="h" />
        </datalist>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u9AA8\u9ABC\u4FE1\u606F\uFF08\u53EA\u8BFB\uFF09</h4>
        <p class="mm-element-info">\u5F53\u524D\u9009\u4E2D\u9AA8\u9ABC: {{ elementName }}</p>
        <p class="mm-element-info" v-if="config.bone">\u7ED1\u5B9A\u9AA8\u9ABC: {{ config.bone }}</p>
    </div>
</div>` : "<p>\u4EA4\u4E92\u533A\u9762\u677F\u52A0\u8F7D\u4E2D...</p>",
        props: {
          config: { type: Object, required: true },
          elementName: { type: String, default: "" },
          interactBoxName: { type: String, default: "" },
          parentSubPartKey: { type: String, default: "" },
          /** 当前子零件内的子系统映射，用于信号目标下拉选择 */
          parentSubsystems: { type: Object, default: function() {
            return {};
          } },
          /** 信号目标补全列表（子系统名 + 连接点名 + 'subpart' + 'vehicle'） */
          signalTargetHints: { type: Array, default: function() {
            return [];
          } },
          /** 模型中所有骨骼名称列表（用于骨骼选择器） */
          allBoneNames: { type: Array, default: function() {
            return [];
          } }
        },
        data: function() {
          return {
            overwriteExpanded: false,
            editingName: this.interactBoxName || "",
            editingBone: this.config.bone || this.elementName || ""
          };
        },
        watch: {
          interactBoxName: function(val) {
            if (val !== this.editingName) {
              this.editingName = val;
            }
          },
          "config.bone": function(val) {
            if (val !== this.editingBone) {
              this.editingBone = val;
            }
          }
        },
        computed: {
          boneListId: function() {
            return "mm-ib-bone-list-" + this._uid;
          },
          badgeColor: function() {
            return "#D9A441";
          },
          badgeLabel: function() {
            return "\u4EA4\u4E92\u533A";
          },
          /**
           * 信号目标条目映射
           */
          signalTargetEntries: function() {
            return this.config && this.config.signal_targets || {};
          },
          signalTargetChannelCount: function() {
            return Object.keys(this.signalTargetEntries).length;
          },
          /**
           * 常用频道名补全列表
           */
          channelHints: function() {
            return [
              "interact",
              "interact_left_front_door",
              "interact_right_front_door",
              "interact_left_back_door",
              "interact_right_back_door",
              "interact_hood",
              "interact_trunk",
              "interact_seat",
              "trunk_interact",
              "lever_pull",
              "button_press",
              "door_interact",
              "switch_toggle",
              "interact_custom"
            ];
          }
        },
        methods: {
          onFieldChange: function(field, value) {
            this.$emit("field-change", field, value);
          },
          onNameChange: function(value) {
            if (value !== this.interactBoxName) {
              this.$emit("name-change", this.interactBoxName, value);
            }
          },
          onNameBlur: function(event) {
            event.target.style.border = "1px solid transparent";
            event.target.style.background = "transparent";
          },
          onBoneChange: function(value) {
            if (value !== (this.config.bone || this.elementName)) {
              this.$emit("bone-change", "bone", value);
            }
          },
          /**
           * 导航到归属子零件：点击归属标签时选中对应的子零件 Group，切换回子零件属性面板
           */
          navigateToSubPart: function() {
            this.$emit("navigate-to-sub-part", this.parentSubPartKey);
          },
          // ===== 信号目标编辑 =====
          /**
           * 添加新的信号频道
           */
          addSignalTargetChannel: function() {
            var entries = this.signalTargetEntries;
            var newChan = "interact";
            var idx = 1;
            while (entries[newChan]) {
              newChan = "interact_" + idx;
              idx++;
            }
            this.$set(entries, newChan, []);
            this.emitSignalTargets(entries);
          },
          /**
           * 删除信号频道
           */
          removeSignalTargetChannel: function(channel) {
            var entries = this.signalTargetEntries;
            this.$delete(entries, channel);
            this.emitSignalTargets(entries);
          },
          /**
           * 重命名信号频道
           */
          onSignalTargetChannelChange: function(oldChannel, newChannel) {
            if (!newChannel || oldChannel === newChannel) return;
            var entries = this.signalTargetEntries;
            var targets = entries[oldChannel];
            if (targets === void 0) return;
            this.$delete(entries, oldChannel);
            this.$set(entries, newChannel, targets);
            this.emitSignalTargets(entries);
          },
          /**
           * 为指定频道添加信号目标项
           */
          addSignalTargetItem: function(channel) {
            var entries = this.signalTargetEntries;
            if (!entries[channel]) {
              this.$set(entries, channel, []);
            }
            entries[channel].push("");
            this.emitSignalTargets(entries);
          },
          /**
           * 删除信号频道的指定目标项
           */
          removeSignalTargetItem: function(channel, index) {
            var entries = this.signalTargetEntries;
            if (entries[channel]) {
              entries[channel].splice(index, 1);
              this.emitSignalTargets(entries);
            }
          },
          /**
           * 更新信号频道的指定目标值
           */
          updateSignalTargetItem: function(channel, index, value) {
            var entries = this.signalTargetEntries;
            if (entries[channel]) {
              this.$set(entries[channel], index, value);
              this.emitSignalTargets(entries);
            }
          },
          /**
           * 触发 signal_targets 字段变更事件
           */
          emitSignalTargets: function(entries) {
            this.$emit("field-change", "signal_targets", JSON.parse(JSON.stringify(entries)));
          }
        }
      });
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {};
      }
    }
  });

  // src/ui/ConnectorPanel.vue.js
  var require_ConnectorPanel_vue = __commonJS({
    "src/ui/ConnectorPanel.vue.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      Vue.component("mm-connector-panel", {
        template: true ? `<div class="mm-section">
    <div class="mm-sticky-title">
        <h3 class="mm-section-title" style="margin:0;border:none;padding:0;display:flex;align-items:center;gap:6px;">
            <span class="mm-marker-badge" style="background:#3AA83A">\u8FDE\u63A5\u70B9</span>
            <input type="text" class="mm-input" style="flex:1;font-size:12px;padding:2px 6px;height:auto;min-width:0;border:1px solid transparent;background:transparent;"
                v-model="editingName"
                @focus="$event.target.style.border='1px solid #555';$event.target.style.background='#2a2a2a'"
                @blur="onNameBlur($event)"
                @change="onNameChange($event.target.value)"
                placeholder="connector.machine_max.xxx"
                title="\u8FDE\u63A5\u70B9\u540D\u79F0\uFF08\u5B57\u5178 key\uFF09\uFF0C\u4FEE\u6539\u540E\u81EA\u52A8\u8FC1\u79FB\u5B57\u5178" />
        </h3>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u5F52\u5C5E</h4>
        <div v-if="parentSubPartKey" class="mm-sub-item-row mm-clickable" :title="'\u70B9\u51FB\u8DF3\u8F6C\u5230\u5B50\u96F6\u4EF6 ' + parentSubPartKey" @click="navigateToSubPart">
            <span class="mm-sub-item-name">
                <span class="mm-marker-badge" style="background:#4A90D9;font-size:10px;padding:0 4px">SP</span>
                {{ parentSubPartKey }}
            </span>
        </div>
        <div v-else class="mm-sub-item-row" title="\u7531\u9AA8\u9ABC\u5C42\u7EA7\u81EA\u52A8\u68C0\u6D4B" style="cursor:default">
            <span class="mm-sub-item-name">
                <span class="mm-marker-badge" style="background:#4A90D9;font-size:10px;padding:0 4px">SP</span>
                \uFF08\u6E38\u79BB \u2014 \u65E0\u5F52\u5C5E\uFF09
            </span>
        </div>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u5B9A\u4F4D\u5668</h4>
        <div class="mm-field">
            <label title="\u8BE5\u8FDE\u63A5\u70B9\u7ED1\u5B9A\u7684\u5B9A\u4F4D\u5668\u540D\u79F0\uFF0C\u51B3\u5B9A\u8FDE\u63A5\u70B9\u5728 3D \u7A7A\u95F4\u4E2D\u7684\u4F4D\u7F6E\u548C\u671D\u5411">\u7ED1\u5B9A\u5B9A\u4F4D\u5668</label>
            <input type="text" class="mm-input"
                v-model="editingLocator"
                @change="onLocatorChange($event.target.value)"
                :list="locatorListId"
                placeholder="\u641C\u7D22\u5E76\u9009\u62E9\u5B9A\u4F4D\u5668\u2026" />
            <datalist :id="locatorListId">
                <option v-for="(name, idx) in allLocatorNames" :key="idx" :value="name" />
            </datalist>
            <p v-if="allLocatorNames.length === 0" class="mm-element-info" style="color:#888;font-size:10px">
                \u5F53\u524D\u6A21\u578B\u4E2D\u6CA1\u6709\u4EFB\u4F55\u5B9A\u4F4D\u5668\uFF08Locator\uFF09
            </p>
        </div>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u8FDE\u63A5\u70B9\u5B9A\u4E49</h4>
        <div class="mm-field">
            <label title="\u8FDE\u63A5\u70B9\u5B9A\u4E49ID\uFF0C\u51B3\u5B9A\u8FDE\u63A5\u70B9\u7684\u7C7B\u578B\u548C\u7269\u7406\u5C5E\u6027">\u5B9A\u4E49</label>
            <select class="mm-select" :value="config.definition" @change="onDefinitionChange($event.target.value)">
                <option value="" disabled>\u2014 \u8BF7\u9009\u62E9\u8FDE\u63A5\u70B9\u5B9A\u4E49 \u2014</option>
                <option v-for="(def, defKey) in connectorDefs" :key="defKey" :value="defKey">
                    {{ defKey }}
                </option>
            </select>
            <p v-if="!config.definition" class="mm-element-info" style="color:#e74c3c;font-size:11px;margin-top:2px">
                \u26A0 \u8BF7\u9009\u62E9\u4E00\u4E2A\u8FDE\u63A5\u70B9\u5B9A\u4E49
            </p>
        </div>
    </div>

    <!-- === \u4FE1\u53F7\u76EE\u6807 (signal_targets) === -->
    <div class="mm-section">
        <h4 class="mm-section-title" style="display:flex;align-items:center;justify-content:space-between">
            <span>\u4FE1\u53F7\u76EE\u6807</span>
            <button class="mm-btn mm-btn-sm" @click="addSignalTargetChannel" title="\u6DFB\u52A0\u4FE1\u53F7\u9891\u9053" style="font-size:18px;font-weight:bold">+</button>
        </h4>
        <div v-if="signalTargetChannelCount === 0" class="mm-element-info" style="color:#888;font-size:11px">
            \u65E0\u4FE1\u53F7\u76EE\u6807 \u2014 \u70B9\u51FB [+ ] \u6DFB\u52A0\u9891\u9053
        </div>
        <div v-for="(targets, channel, ci) in signalTargetEntries" :key="ci" class="mm-signal-card">
            <div class="mm-signal-header">
                <input type="text" class="mm-input" style="flex:1;font-size:11px" :value="channel"
                    @change="onSignalTargetChannelChange(channel, $event.target.value)"
                    :list="'cn-sig-chan-'+_uid" placeholder="\u9891\u9053\u540D" />
                <button class="mm-btn mm-btn-sm mm-btn-danger-light" @click="removeSignalTargetChannel(channel)" title="\u5220\u9664\u9891\u9053">\xD7</button>
            </div>
            <div v-for="(t, ti) in targets" :key="ti" style="display:flex;gap:4px;align-items:center;margin-left:16px;margin-top:2px">
                <input type="text" class="mm-input" style="flex:1;font-size:11px" :value="t"
                    @change="updateSignalTargetItem(channel, ti, $event.target.value)"
                    :list="'cn-sig-tgt-'+_uid" placeholder="\u76EE\u6807\uFF08\u5B50\u7CFB\u7EDF\u540D / subpart / vehicle / \u8FDE\u63A5\u70B9\u540D\uFF09" />
                <button class="mm-btn mm-btn-sm mm-btn-danger-light" @click="removeSignalTargetItem(channel, ti)" title="\u5220\u9664\u76EE\u6807">\xD7</button>
            </div>
            <button class="mm-btn" style="margin-left:16px;margin-top:2px;font-size:11px" @click="addSignalTargetItem(channel)">+ \u6DFB\u52A0\u76EE\u6807</button>
        </div>
        <datalist :id="'cn-sig-chan-'+_uid">
            <option v-for="h in channelHints" :key="h" :value="h" />
        </datalist>
        <datalist :id="'cn-sig-tgt-'+_uid">
            <option v-for="h in signalTargetHints" :key="h" :value="h" />
        </datalist>
    </div>

    <!-- === \u4FE1\u53F7\u8F6C\u8BD1 (signal_translations) === -->
    <div class="mm-section">
        <h4 class="mm-section-title" style="display:flex;align-items:center;justify-content:space-between">
            <span>\u4FE1\u53F7\u8F6C\u8BD1</span>
            <button class="mm-btn mm-btn-sm" @click="addTranslation" title="\u6DFB\u52A0\u8F6C\u8BD1\u89C4\u5219" style="font-size:18px;font-weight:bold">+</button>
        </h4>
        <div v-if="translationCount === 0" class="mm-element-info" style="color:#888;font-size:11px">
            \u65E0\u4FE1\u53F7\u8F6C\u8BD1\u89C4\u5219 \u2014 \u70B9\u51FB [+ ] \u6DFB\u52A0
        </div>
        <div v-for="(targetChan, sourceChan, ti) in translationEntries" :key="ti" style="display:flex;gap:4px;align-items:center;margin-bottom:4px">
            <input type="text" class="mm-input" style="flex:1;font-size:11px" :value="sourceChan"
                @change="onTranslationSourceChange(sourceChan, $event.target.value)"
                :list="'cn-trans-src-'+_uid" placeholder="\u6E90\u9891\u9053" />
            <span style="color:#888;font-size:14px">\u2192</span>
            <input type="text" class="mm-input" style="flex:1;font-size:11px" :value="targetChan"
                @change="onTranslationTargetChange(sourceChan, $event.target.value)"
                :list="'cn-trans-tgt-'+_uid" placeholder="\u76EE\u6807\u9891\u9053" />
            <button class="mm-btn mm-btn-sm mm-btn-danger-light" @click="removeTranslation(sourceChan)" title="\u5220\u9664\u8F6C\u8BD1\u89C4\u5219">\xD7</button>
        </div>
        <datalist :id="'cn-trans-src-'+_uid">
            <option v-for="h in channelHints" :key="h" :value="h" />
        </datalist>
        <datalist :id="'cn-trans-tgt-'+_uid">
            <option v-for="h in channelHints" :key="h" :value="h" />
        </datalist>
    </div>

    <!-- === \u673A\u68B0\u80FD\u4E0E\u5185\u90E8 === -->
    <div class="mm-section">
        <h4 class="mm-section-title">\u673A\u68B0\u80FD\u4E0E\u5185\u90E8</h4>
        <div class="mm-field">
            <label title="\u673A\u68B0\u80FD\u8F93\u51FA\u76EE\u6807\uFF1A\u9009\u62E9\u672C\u5B50\u96F6\u4EF6\u5185\u7684\u5B50\u7CFB\u7EDF\uFF0C\u6216\u7559\u7A7A\u8868\u793A\u65E0\u8F93\u51FA">\u673A\u68B0\u80FD\u8F93\u51FA\u76EE\u6807</label>
            <select class="mm-select" :value="config.power_target" @change="onFieldChange('power_target', $event.target.value)">
                <option value="">\uFF08\u65E0\uFF09</option>
                <option v-for="(ss, ssKey) in subsystemKeys" :key="ssKey" :value="ssKey">{{ ssKey }}</option>
            </select>
        </div>
        <div class="mm-field mm-field-row" style="margin-top:4px">
            <label title="\u5185\u90E8\u8FDE\u63A5\u70B9\uFF1A\u52FE\u9009\u540E\u8BE5\u8FDE\u63A5\u70B9\u4EC5\u7528\u4E8E\u5185\u90E8\u4FE1\u53F7\u8DEF\u7531\uFF0C\u4E0D\u53C2\u4E0E\u5916\u90E8\u8FDE\u63A5">\u5185\u90E8\u8FDE\u63A5\u70B9</label>
            <input type="checkbox" :checked="config.internal" @change="onFieldChange('internal', $event.target.checked)" />
        </div>
    </div>

    <!-- === \u5C5E\u6027\u8986\u5199 (overwrite) === -->
    <div class="mm-section">
        <h4 class="mm-section-title" style="display:flex;align-items:center;justify-content:space-between">
            <span>\u5C5E\u6027\u8986\u5199</span>
            <button class="mm-btn mm-btn-sm" @click="addOverwriteField" title="\u6DFB\u52A0\u8986\u5199\u5B57\u6BB5" style="font-size:18px;font-weight:bold">+</button>
        </h4>
        <div v-if="overwriteCount === 0" class="mm-element-info" style="color:#888;font-size:11px">
            \u65E0\u5C5E\u6027\u8986\u5199 \u2014 \u70B9\u51FB [+ ] \u6DFB\u52A0
        </div>
        <div v-for="(val, field, oi) in overwriteEntries" :key="oi" style="display:flex;gap:4px;align-items:center;margin-bottom:4px">
            <input type="text" class="mm-input" style="flex:0.4;font-size:11px" :value="field"
                @change="onOverwriteFieldChange(field, $event.target.value, val)" placeholder="\u5B57\u6BB5\u540D" />
            <input type="text" class="mm-input" style="flex:0.6;font-size:11px" :value="val"
                @change="onOverwriteValueChange(field, $event.target.value)" placeholder="\u8986\u5199\u503C" />
            <button class="mm-btn mm-btn-sm mm-btn-danger-light" @click="removeOverwriteField(field)" title="\u5220\u9664\u8986\u5199">\xD7</button>
        </div>
    </div>
</div>` : "<p>\u8FDE\u63A5\u70B9\u9762\u677F\u52A0\u8F7D\u4E2D...</p>",
        props: {
          config: { type: Object, required: true },
          elementName: { type: String, default: "" },
          connectorName: { type: String, default: "" },
          parentSubPartKey: { type: String, default: "" },
          connectorDefs: { type: Object, default: function() {
            return {};
          } },
          allLocatorNames: { type: Array, default: function() {
            return [];
          } },
          /** 当前子零件内的子系统映射，用于 power_target 下拉选择 */
          subsystemKeys: { type: Object, default: function() {
            return {};
          } },
          /** 信号目标补全列表（子系统名 + 连接点名 + 'subpart' + 'vehicle'） */
          signalTargetHints: { type: Array, default: function() {
            return [];
          } }
        },
        data: function() {
          return {
            editingName: this.connectorName || "",
            editingLocator: this.config.locator || this.elementName || ""
          };
        },
        watch: {
          connectorName: function(val) {
            if (val !== this.editingName) {
              this.editingName = val;
            }
          },
          "config.locator": function(val) {
            if (val !== this.editingLocator) {
              this.editingLocator = val;
            }
          }
        },
        computed: {
          locatorListId: function() {
            return "mm-connector-loc-list-" + this._uid;
          },
          hasDefinition: function() {
            return !!(this.config && this.config.definition);
          },
          /**
           * 信号目标条目映射
           */
          signalTargetEntries: function() {
            return this.config && this.config.signal_targets || {};
          },
          signalTargetChannelCount: function() {
            return Object.keys(this.signalTargetEntries).length;
          },
          /**
           * 信号转译条目映射
           */
          translationEntries: function() {
            return this.config && this.config.signal_translations || {};
          },
          translationCount: function() {
            return Object.keys(this.translationEntries).length;
          },
          /**
           * 属性覆写条目映射
           */
          overwriteEntries: function() {
            return this.config && this.config.overwrite || {};
          },
          overwriteCount: function() {
            return Object.keys(this.overwriteEntries).length;
          },
          /**
           * 常用频道名补全列表
           */
          channelHints: function() {
            return [
              "move_control",
              "regular_control",
              "engine_control",
              "wheel_control",
              "steering",
              "throttle",
              "brake",
              "handbrake",
              "engine_speed",
              "wheel_speed",
              "vehicle_speed",
              "gear",
              "clutch",
              "parking_brake",
              "power",
              "interact_left_front_door",
              "interact_right_front_door",
              "interact_left_back_door",
              "interact_right_back_door",
              "interact_hood",
              "interact_trunk",
              "interact_left_front",
              "interact_right_front",
              "interact_left_back",
              "interact_right_back"
            ];
          }
        },
        methods: {
          onNameChange: function(value) {
            if (value !== this.connectorName) {
              this.$emit("name-change", this.connectorName, value);
            }
          },
          onNameBlur: function(event) {
            event.target.style.border = "1px solid transparent";
            event.target.style.background = "transparent";
          },
          onLocatorChange: function(value) {
            if (value !== (this.config.locator || this.elementName)) {
              this.$emit("locator-change", this.elementName, value);
            }
          },
          /**
           * 通用字段变更处理
           */
          onFieldChange: function(field, value) {
            this.$emit("field-change", field, value);
          },
          onDefinitionChange: function(value) {
            this.$emit("field-change", "definition", value);
          },
          /**
           * 导航到归属子零件：点击归属标签时选中对应的子零件 Group，切换回子零件属性面板
           */
          navigateToSubPart: function() {
            this.$emit("navigate-to-sub-part", this.parentSubPartKey);
          },
          // ===== 信号目标编辑 =====
          /**
           * 添加新的信号频道
           */
          addSignalTargetChannel: function() {
            var entries = this.signalTargetEntries;
            var newChan = "new_channel";
            var idx = 1;
            while (entries[newChan]) {
              newChan = "new_channel_" + idx;
              idx++;
            }
            this.$set(entries, newChan, []);
            this.emitSignalTargets(entries);
          },
          /**
           * 删除信号频道
           */
          removeSignalTargetChannel: function(channel) {
            var entries = this.signalTargetEntries;
            this.$delete(entries, channel);
            this.emitSignalTargets(entries);
          },
          /**
           * 重命名信号频道
           */
          onSignalTargetChannelChange: function(oldChannel, newChannel) {
            if (!newChannel || oldChannel === newChannel) return;
            var entries = this.signalTargetEntries;
            var targets = entries[oldChannel];
            if (targets === void 0) return;
            this.$delete(entries, oldChannel);
            this.$set(entries, newChannel, targets);
            this.emitSignalTargets(entries);
          },
          /**
           * 为指定频道添加信号目标项
           */
          addSignalTargetItem: function(channel) {
            var entries = this.signalTargetEntries;
            if (!entries[channel]) {
              this.$set(entries, channel, []);
            }
            entries[channel].push("");
            this.emitSignalTargets(entries);
          },
          /**
           * 删除信号频道的指定目标项
           */
          removeSignalTargetItem: function(channel, index) {
            var entries = this.signalTargetEntries;
            if (entries[channel]) {
              entries[channel].splice(index, 1);
              this.emitSignalTargets(entries);
            }
          },
          /**
           * 更新信号频道的指定目标值
           */
          updateSignalTargetItem: function(channel, index, value) {
            var entries = this.signalTargetEntries;
            if (entries[channel]) {
              this.$set(entries[channel], index, value);
              this.emitSignalTargets(entries);
            }
          },
          /**
           * 触发 signal_targets 字段变更事件
           */
          emitSignalTargets: function(entries) {
            this.$emit("field-change", "signal_targets", JSON.parse(JSON.stringify(entries)));
          },
          // ===== 信号转译编辑 =====
          /**
           * 添加新的转译规则
           */
          addTranslation: function() {
            var entries = this.translationEntries;
            var newSrc = "new_source";
            var idx = 1;
            while (entries[newSrc]) {
              newSrc = "new_source_" + idx;
              idx++;
            }
            this.$set(entries, newSrc, "new_target");
            this.emitTranslations(entries);
          },
          /**
           * 删除转译规则
           */
          removeTranslation: function(sourceChan) {
            var entries = this.translationEntries;
            this.$delete(entries, sourceChan);
            this.emitTranslations(entries);
          },
          /**
           * 修改转译规则的源频道名（重命名 key）
           */
          onTranslationSourceChange: function(oldSource, newSource) {
            if (!newSource || oldSource === newSource) return;
            var entries = this.translationEntries;
            var target = entries[oldSource];
            if (target === void 0) return;
            this.$delete(entries, oldSource);
            this.$set(entries, newSource, target);
            this.emitTranslations(entries);
          },
          /**
           * 修改转译规则的目标频道值
           */
          onTranslationTargetChange: function(sourceChan, newTarget) {
            var entries = this.translationEntries;
            if (entries[sourceChan] !== void 0) {
              this.$set(entries, sourceChan, newTarget);
              this.emitTranslations(entries);
            }
          },
          /**
           * 触发 signal_translations 字段变更事件
           */
          emitTranslations: function(entries) {
            this.$emit("field-change", "signal_translations", JSON.parse(JSON.stringify(entries)));
          },
          // ===== 属性覆写编辑 =====
          /**
           * 添加新的覆写字段
           */
          addOverwriteField: function() {
            var entries = this.overwriteEntries;
            var newField = "new_field";
            var idx = 1;
            while (entries[newField] !== void 0) {
              newField = "new_field_" + idx;
              idx++;
            }
            this.$set(entries, newField, "");
            this.emitOverwrite(entries);
          },
          /**
           * 删除覆写字段
           */
          removeOverwriteField: function(field) {
            var entries = this.overwriteEntries;
            this.$delete(entries, field);
            this.emitOverwrite(entries);
          },
          /**
           * 修改覆写字段名（重命名 key）
           */
          onOverwriteFieldChange: function(oldField, newField, currentVal) {
            if (!newField || oldField === newField) return;
            var entries = this.overwriteEntries;
            var val = entries[oldField];
            if (val === void 0) return;
            this.$delete(entries, oldField);
            this.$set(entries, newField, val);
            this.emitOverwrite(entries);
          },
          /**
           * 修改覆写字段的值
           */
          onOverwriteValueChange: function(field, value) {
            var entries = this.overwriteEntries;
            if (entries[field] !== void 0) {
              this.$set(entries, field, value);
              this.emitOverwrite(entries);
            }
          },
          /**
           * 触发 overwrite 字段变更事件
           */
          emitOverwrite: function(entries) {
            this.$emit("field-change", "overwrite", JSON.parse(JSON.stringify(entries)));
          }
        }
      });
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {};
      }
    }
  });

  // src/ui/SubsystemPanel.vue.js
  var require_SubsystemPanel_vue = __commonJS({
    "src/ui/SubsystemPanel.vue.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var ssTypes = require_subsystem_types();
      Vue.component("mm-subsystem-panel", {
        template: true ? `<div class="mm-section">
    <div class="mm-sticky-title">
        <h3 class="mm-section-title" style="margin:0;border:none;padding:0;display:flex;align-items:center;gap:6px;">
            <span class="mm-marker-badge" :style="{ background: typeColor }">SS</span>
            <input type="text" class="mm-input" style="flex:1;font-size:12px;padding:2px 6px;height:auto;min-width:0;border:1px solid transparent;background:transparent;"
                v-model="editingName"
                @focus="$event.target.style.border='1px solid #555';$event.target.style.background='#2a2a2a'"
                @blur="onNameBlur($event)"
                @change="onNameChange($event.target.value)"
                :placeholder="subsystemKey"
                title="\u5B50\u7CFB\u7EDF\u540D\u79F0\uFF08\u5B57\u5178 key\uFF09\uFF0C\u4FEE\u6539\u540E\u81EA\u52A8\u8FC1\u79FB\u5B57\u5178" />
        </h3>
    </div>

    <div class="mm-section">
        <h4 class="mm-section-title">\u5F52\u5C5E</h4>
        <div v-if="parentSubPartKey" class="mm-sub-item-row mm-clickable" :title="'\u70B9\u51FB\u8DF3\u8F6C\u5230\u5B50\u96F6\u4EF6 ' + parentSubPartKey" @click="navigateToSubPart">
            <span class="mm-sub-item-name">
                <span class="mm-marker-badge" style="background:#4A90D9;font-size:10px;padding:0 4px">SP</span>
                {{ parentSubPartKey }}
            </span>
        </div>
        <div v-else class="mm-sub-item-row" title="\u7531\u521B\u5EFA\u65F6\u6240\u5C5E\u5B50\u96F6\u4EF6\u51B3\u5B9A" style="cursor:default">
            <span class="mm-sub-item-name">
                <span class="mm-marker-badge" style="background:#4A90D9;font-size:10px;padding:0 4px">SP</span>
                \uFF08\u6E38\u79BB \u2014 \u65E0\u5F52\u5C5E\uFF09
            </span>
        </div>
        <div class="mm-field">
            <label>\u7C7B\u578B</label>
            <div style="display:flex;align-items:center;gap:6px">
                <span class="mm-marker-badge" :style="{ background: typeColor }" style="font-size:10px">{{ typeShortLabel }}</span>
                <span style="font-size:12px;color:#ccc">{{ typeDisplayName }} ({{ typeId }})</span>
            </div>
        </div>
        <div class="mm-field">
            <label title="\u4ECE subsystem_defs \u4E2D\u9009\u62E9\u578B\u53F7\u5B9A\u4E49">\u578B\u53F7\u5B9A\u4E49</label>
            <select class="mm-select" :value="config.definition" @change="onFieldChange('definition', $event.target.value)">
                <option value="">\uFF08\u65E0\uFF09</option>
                <option v-for="(def, defId) in filteredSubsystemDefs" :key="defId" :value="defId">{{ defId }}</option>
            </select>
            <span class="mm-element-info" v-if="filteredSubsystemDefsCount === 0" style="font-size:10px;color:#ff6b6b">\u65E0\u5339\u914D\u7684<span style="color:#888">{{ typeDisplayName }}</span>\u578B\u53F7\u5B9A\u4E49</span>
        </div>
    </div>

    <!-- \u52A8\u6001\u5C5E\u6027\u5B57\u6BB5\uFF1A\u7531 subsystem_types.js \u7684 dynamicFields \u6CE8\u518C\u8868\u9A71\u52A8 -->
    <div class="mm-section" v-if="nonDefFields.length > 0">
        <h4 class="mm-section-title">{{ dynamicAttrsTitle }}</h4>
        <div v-for="field in nonDefFields" :key="field.field" class="mm-field">
            <label :title="field.field">{{ field.label }}</label>

            <!-- \u5B9A\u4F4D\u5668\u9009\u62E9\u5668 -->
            <select v-if="field.editor === 'locator_selector'" class="mm-select"
                :value="config[field.field]"
                @change="onFieldChange(field.field, $event.target.value)">
                <option value="">\uFF08\u65E0\uFF09</option>
                <option v-for="(l, i) in allLocatorNames" :key="i" :value="l">{{ l }}</option>
            </select>

            <!-- \u8FDE\u63A5\u70B9\u9009\u62E9\u5668 -->
            <select v-else-if="field.editor === 'connector_selector'" class="mm-select"
                :value="config[field.field]"
                @change="onFieldChange(field.field, $event.target.value)">
                <option value="">\uFF08\u65E0\uFF09</option>
                <option v-for="(conn, connKey) in connectorKeys" :key="connKey" :value="connKey">{{ connKey }}</option>
            </select>

            <!-- \u679A\u4E3E\u4E0B\u62C9\u83DC\u5355 -->
            <select v-else-if="field.editor === 'enum_selector'" class="mm-select"
                :value="config[field.field]"
                @change="onFieldChange(field.field, $event.target.value)">
                <option value="">\uFF08\u65E0\uFF09</option>
                <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <!-- \u5355\u76EE\u6807\u529F\u7387\u8F93\u51FA\u9009\u62E9\u5668\uFF08\u5982 power_output\uFF09 -->
            <select v-else-if="field.editor === 'power_target'" class="mm-select"
                :value="config[field.field]"
                @change="onFieldChange(field.field, $event.target.value)">
                <option value="">\uFF08\u65E0\uFF09</option>
                <option v-for="(target, si) in signalTargetOptions" :key="si" :value="target">{{ target }}</option>
            </select>

            <!-- \u529F\u7387\u8F93\u51FA\u6620\u5C04\u7F16\u8F91\u5668\uFF08power_outputs_map\uFF0C\u503C\u7C7B\u578B\u4E3A <string, number>\uFF09
                 \u76EE\u6807\u540D\u4ECE signalTargetOptions \u4E0B\u62C9\u9009\u62E9\uFF0C\u540C power_target \u7684\u9009\u9879\u6765\u6E90 -->
            <div v-else-if="field.editor === 'power_outputs_map'" class="mm-power-outputs-editor">
                <div v-for="(ratio, targetName, pi) in getPowerOutputEntries(field.field)" :key="pi" style="display:flex;gap:4px;align-items:center;margin-bottom:4px">
                    <select class="mm-select" style="flex:1;min-width:80px"
                        :value="targetName"
                        @change="onPowerOutputTargetChange(field.field, targetName, $event.target.value)">
                        <option value="">\uFF08\u65E0\uFF09</option>
                        <option v-for="(target, si) in signalTargetOptions" :key="si" :value="target">{{ target }}</option>
                    </select>
                    <input type="number" class="mm-input" style="width:80px;font-size:11px;text-align:right"
                        step="0.01" min="-999" max="999"
                        :value="ratio"
                        @change="onPowerOutputRatioChange(field.field, targetName, parseFloat($event.target.value) || 0)"
                        placeholder="\u51CF\u901F\u6BD4" />
                    <button class="mm-btn mm-btn-sm mm-btn-danger-light" @click="removePowerOutput(field.field, targetName)" title="\u5220\u9664">\xD7</button>
                </div>
                <button class="mm-btn" style="font-size:11px" @click="addPowerOutput(field.field)">+ \u6DFB\u52A0\u8F93\u51FA\u76EE\u6807</button>
            </div>

            <!-- \u4FE1\u53F7\u9891\u9053\u7F16\u8F91\u5668\uFF08signal_targets\uFF0C\u503C\u7C7B\u578B\u4E3A <string, string[]>\uFF09 -->
            <div v-else-if="field.editor === 'signal_targets'" class="mm-signal-editor">
                <div v-for="(targets, channel, ci) in getSignalEntries(field.field)" :key="ci" class="mm-signal-card">
                    <div class="mm-signal-header">
                        <input type="text" class="mm-input" style="flex:1;font-size:11px" :value="channel"
                            @change="onSignalChannelChange(field.field, channel, $event.target.value)"
                            :list="'sig-channel-hints-'+_uid" placeholder="\u9891\u9053\u540D" />
                        <button class="mm-btn mm-btn-sm mm-btn-danger-light" @click="removeSignalChannel(field.field, channel)" title="\u5220\u9664\u9891\u9053">\xD7</button>
                    </div>
                    <div v-for="(t, ti) in targets" :key="ti" style="display:flex;gap:4px;align-items:center;margin-left:16px;margin-top:2px">
                        <input type="text" class="mm-input" style="flex:1;font-size:11px" :value="t"
                            @change="updateSignalTarget(field.field, channel, ti, $event.target.value)"
                            :list="'sig-target-hints-'+_uid" placeholder="\u76EE\u6807" />
                        <button class="mm-btn mm-btn-sm mm-btn-danger-light" @click="removeSignalTarget(field.field, channel, ti)" title="\u5220\u9664\u76EE\u6807">\xD7</button>
                    </div>
                    <button class="mm-btn" style="margin-left:16px;margin-top:2px;font-size:11px" @click="addSignalTarget(field.field, channel)">+ \u6DFB\u52A0\u76EE\u6807</button>
                </div>
                <button class="mm-btn" style="font-size:11px" @click="addSignalChannel(field.field)">+ \u6DFB\u52A0\u9891\u9053</button>
                <datalist :id="'sig-channel-hints-'+_uid">
                    <option v-for="h in channelHints" :key="h" :value="h" />
                </datalist>
                <datalist :id="'sig-target-hints-'+_uid">
                    <option v-for="h in signalTargetOptions" :key="h" :value="h" />
                </datalist>
            </div>

            <!-- \u6587\u672C\u8F93\u5165 -->
            <input v-else-if="field.editor === 'text_input'" type="text" class="mm-input"
                :value="config[field.field]"
                @change="onFieldChange(field.field, $event.target.value)"
                :placeholder="'(\u9ED8\u8BA4)'" />

            <!-- JSON \u7F16\u8F91\u6846 -->
            <textarea v-else-if="field.editor === 'json_textarea'" class="mm-input mm-textarea"
                :value="formatJsonValue(field.field)"
                @change="onJsonChange(field.field, $event.target.value)"
                rows="4" placeholder="\u8BF7\u8F93\u5165 JSON"></textarea>

            <!-- \u672A\u77E5\u7F16\u8F91\u5668\u7C7B\u578B\uFF08\u56DE\u9000\uFF09 -->
            <input v-else type="text" class="mm-input"
                :value="config[field.field]"
                @change="onFieldChange(field.field, $event.target.value)"
                :placeholder="'(' + field.editor + ')'" />
        </div>
    </div>

    <div class="mm-section" style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border-color,#333)">
        <button class="mm-btn mm-btn-danger" @click="onDelete" :disabled="!subsystemKey" title="\u5220\u9664\u6B64\u5B50\u7CFB\u7EDF">
            \u2715 \u5220\u9664\u6B64\u5B50\u7CFB\u7EDF
        </button>
    </div>
</div>` : "<p>\u5B50\u7CFB\u7EDF\u9762\u677F\u52A0\u8F7D\u4E2D...</p>",
        props: {
          config: { type: Object, required: true },
          subsystemKey: { type: String, default: "" },
          parentSubPartKey: { type: String, default: "" },
          subsystemDefs: { type: Object, default: function() {
            return {};
          } },
          allLocatorNames: { type: Array, default: function() {
            return [];
          } },
          connectorKeys: { type: Object, default: function() {
            return {};
          } },
          signalTargetOptions: { type: Array, default: function() {
            return [];
          } }
        },
        data: function() {
          return {
            editingName: this.subsystemKey || ""
          };
        },
        watch: {
          subsystemKey: function(val) {
            if (val !== this.editingName) {
              this.editingName = val;
            }
          }
        },
        computed: {
          typeId: function() {
            return this.config.type || "";
          },
          typeMeta: function() {
            if (!this.typeId) return null;
            return ssTypes.getTypeMeta(this.typeId);
          },
          typeDisplayName: function() {
            var meta = this.typeMeta;
            return meta ? meta.displayName : "\u672A\u77E5";
          },
          typeColor: function() {
            return ssTypes.getTypeColor(this.typeId);
          },
          typeShortLabel: function() {
            var meta = this.typeMeta;
            if (!meta) return "?";
            var parts = meta.id.split(":");
            return (parts.length > 1 ? parts[1] : parts[0]).substring(0, 6);
          },
          /** 按当前子系统类型筛选可用的型号定义 */
          filteredSubsystemDefs: function() {
            if (!this.typeId || !this.subsystemDefs) return {};
            var result = {};
            for (var defId in this.subsystemDefs) {
              if (this.subsystemDefs.hasOwnProperty(defId)) {
                var def = this.subsystemDefs[defId];
                if (def && def.type === this.typeId) {
                  result[defId] = def;
                }
              }
            }
            return result;
          },
          filteredSubsystemDefsCount: function() {
            return Object.keys(this.filteredSubsystemDefs).length;
          },
          /** 排除 definition 后的动态属性字段列表，用于面板循环渲染 */
          nonDefFields: function() {
            var meta = this.typeMeta;
            if (!meta || !meta.dynamicFields) return [];
            return meta.dynamicFields.filter(function(f) {
              return f.field !== "definition";
            });
          },
          /** 动态属性区块的标题，包含字段数量提示 */
          dynamicAttrsTitle: function() {
            var count = this.nonDefFields.length;
            return "\u52A8\u6001\u5C5E\u6027 (" + count + " \u9879)";
          },
          channelHints: function() {
            return [
              "move_control",
              "regular_control",
              "engine_control",
              "wheel_control",
              "steering",
              "throttle",
              "brake",
              "handbrake",
              "engine_speed",
              "wheel_speed",
              "vehicle_speed",
              "gear",
              "clutch",
              "parking_brake",
              "interact_left_front_door",
              "interact_right_front_door",
              "interact_left_back_door",
              "interact_right_back_door",
              "interact_hood",
              "interact_trunk",
              "interact_left_front",
              "interact_right_front",
              "interact_left_back",
              "interact_right_back"
            ];
          }
        },
        methods: {
          onFieldChange: function(field, value) {
            this.$emit("field-change", this.subsystemKey, field, value);
          },
          onNameChange: function(value) {
            if (value !== this.subsystemKey) {
              this.$emit("name-change", this.subsystemKey, value);
            }
          },
          onNameBlur: function(event) {
            event.target.style.border = "1px solid transparent";
            event.target.style.background = "transparent";
          },
          onDelete: function() {
            this.$emit("delete-subsystem", this.subsystemKey);
          },
          navigateToSubPart: function() {
            this.$emit("navigate-to-sub-part", this.parentSubPartKey);
          },
          // ─── 信号频道编辑器（signal_targets） ─────────────────────────────
          getSignalEntries: function(sigField) {
            var val = this.config[sigField];
            if (val && typeof val === "object" && !Array.isArray(val)) {
              return val;
            }
            return {};
          },
          addSignalChannel: function(sigField) {
            var entries = this.getSignalEntries(sigField);
            var newChan = "new_channel";
            var idx = 1;
            while (entries[newChan]) {
              newChan = "new_channel_" + idx;
              idx++;
            }
            entries[newChan] = [];
            this.$set(this.config, sigField, JSON.parse(JSON.stringify(entries)));
          },
          removeSignalChannel: function(sigField, channel) {
            var entries = this.getSignalEntries(sigField);
            this.$delete(entries, channel);
            this.$set(this.config, sigField, JSON.parse(JSON.stringify(entries)));
          },
          onSignalChannelChange: function(sigField, oldChannel, newChannel) {
            if (!newChannel || oldChannel === newChannel) return;
            var entries = this.getSignalEntries(sigField);
            var targets = entries[oldChannel];
            if (targets === void 0) return;
            this.$delete(entries, oldChannel);
            this.$set(entries, newChannel, targets);
            this.$set(this.config, sigField, JSON.parse(JSON.stringify(entries)));
          },
          addSignalTarget: function(sigField, channel) {
            var entries = this.getSignalEntries(sigField);
            if (!entries[channel]) {
              this.$set(entries, channel, []);
            }
            entries[channel].push("");
            this.$set(this.config, sigField, JSON.parse(JSON.stringify(entries)));
          },
          removeSignalTarget: function(sigField, channel, index) {
            var entries = this.getSignalEntries(sigField);
            if (entries[channel]) {
              entries[channel].splice(index, 1);
              this.$set(this.config, sigField, JSON.parse(JSON.stringify(entries)));
            }
          },
          updateSignalTarget: function(sigField, channel, index, value) {
            var entries = this.getSignalEntries(sigField);
            if (entries[channel]) {
              this.$set(entries[channel], index, value);
              this.$set(this.config, sigField, JSON.parse(JSON.stringify(entries)));
            }
          },
          // ─── 功率输出映射编辑器（power_outputs_map，Map<string, number>） ──
          getPowerOutputEntries: function(field) {
            var val = this.config[field];
            if (val && typeof val === "object") return val;
            return {};
          },
          addPowerOutput: function(field) {
            var entries = this.getPowerOutputEntries(field);
            var newName = "new_target";
            var idx = 1;
            while (entries[newName] !== void 0) {
              newName = "new_target_" + idx;
              idx++;
            }
            entries[newName] = 1;
            this.$set(this.config, field, JSON.parse(JSON.stringify(entries)));
          },
          removePowerOutput: function(field, targetName) {
            var entries = this.getPowerOutputEntries(field);
            this.$delete(entries, targetName);
            this.$set(this.config, field, JSON.parse(JSON.stringify(entries)));
          },
          onPowerOutputTargetChange: function(field, oldName, newName) {
            if (!newName || oldName === newName) return;
            var entries = this.getPowerOutputEntries(field);
            var ratio = entries[oldName];
            if (ratio === void 0) return;
            this.$delete(entries, oldName);
            this.$set(entries, newName, ratio);
            this.$set(this.config, field, JSON.parse(JSON.stringify(entries)));
          },
          onPowerOutputRatioChange: function(field, targetName, ratio) {
            var entries = this.getPowerOutputEntries(field);
            if (entries[targetName] !== void 0) {
              this.$set(entries, targetName, ratio);
              this.$set(this.config, field, JSON.parse(JSON.stringify(entries)));
            }
          },
          // ─── JSON 编辑框（json_textarea） ────────────────────────────────
          formatJsonValue: function(field) {
            var val = this.config[field];
            if (val === void 0 || val === null) return "";
            if (typeof val === "string") return val;
            try {
              return JSON.stringify(val, null, 2);
            } catch (_e) {
              return String(val);
            }
          },
          onJsonChange: function(field, text) {
            if (!text || text.trim() === "") {
              this.onFieldChange(field, {});
              return;
            }
            try {
              var parsed = JSON.parse(text);
              this.onFieldChange(field, parsed);
            } catch (_e) {
            }
          }
        }
      });
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {};
      }
    }
  });

  // src/ui/App.vue.js
  var require_App_vue = __commonJS({
    "src/ui/App.vue.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { getConfig, loadConfig, saveConfig } = require_persistence();
      var { getMarkerInfo, clearAllMarkers, detectOwnerSubPart } = require_element_markers();
      var { createVariantConfig, createPartConfig, createSubPartConfig } = require_config();
      var { createLogger: createLogger2 } = require_logger();
      var { refreshOutlinerIcons: refreshOutlinerIcons2 } = require_icons();
      var { showToast: showToast2 } = require_notify();
      var content_pack_manager = require_content_pack_manager();
      var { showAddTagDialog, _hashTagColor } = require_tag_dialog_helper();
      var log2 = createLogger2("UI");
      require_SubPartPanel_vue();
      require_HitBoxPanel_vue();
      require_InteractBoxPanel_vue();
      require_ConnectorPanel_vue();
      require_SubsystemPanel_vue();
      var MMMainPanel = Vue.component("mm-main-panel", {
        template: `<div class="mm-panel" v-if="config">
    <div class="mm-panel-header">
        <div class="mm-nav-row">
            <label class="mm-label">\u96F6\u4EF6</label>
            <select v-model="activePartId" @change="onPartChange" class="mm-select">
                <option v-for="(part, id) in config.parts" :key="id" :value="id">{{ id }}</option>
            </select>
            <button class="mm-btn mm-btn-sm" @click="showNewPartDialog" title="\u65B0\u5EFA\u96F6\u4EF6">+</button>
            <button class="mm-btn mm-btn-sm mm-btn-danger" @click="showDeletePartDialog" title="\u5220\u9664\u96F6\u4EF6" :disabled="!activePartId">\u2715</button>
        </div>
        <div class="mm-nav-row" v-if="currentPart">
            <label class="mm-label">\u53D8\u4F53</label>
            <select v-model="activeVariantName" @change="onVariantChange" class="mm-select">
                <option v-for="(variant, name) in currentPart.variants" :key="name" :value="name">{{ name }}</option>
            </select>
            <button class="mm-btn mm-btn-sm" @click="showNewVariantDialog" title="\u65B0\u5EFA\u53D8\u4F53">+</button>
            <button class="mm-btn mm-btn-sm mm-btn-danger" @click="showDeleteVariantDialog" title="\u5220\u9664\u53D8\u4F53" :disabled="variantCount <= 1">\u2715</button>
        </div>
    </div>

    <!-- \u5B50\u7CFB\u7EDF\u5C5E\u6027\u9762\u677F\uFF08\u865A\u62DF\u9009\u62E9\u4F18\u5148\uFF0C\u5F53\u4ECE\u5B50\u96F6\u4EF6\u9762\u677F\u70B9\u51FB\u5B50\u7CFB\u7EDF\u6761\u76EE\u65F6\u663E\u793A\uFF09 -->
    <div v-if="isSubsystemSelected" class="mm-panel-body">
        <mm-subsystem-panel
            v-if="selectedSubsystemConfig"
            :config="selectedSubsystemConfig"
            :subsystem-key="selectedSubsystemKey"
            :parent-sub-part-key="selectedSubsystemParentSpKey"
            :subsystem-defs="availableSubsystemDefs"
            :all-locator-names="allLocatorNames"
            :connector-keys="currentConnectorKeys"
            :signal-target-options="currentSignalTargetOptions"
            @field-change="updateSubsystemField"
            @name-change="renameSubsystem"
            @delete-subsystem="deleteSubsystem"
            @navigate-to-sub-part="navigateToSubPart" />
    </div>

    <div v-else-if="!selectedElement" class="mm-panel-body">
        <div class="mm-section" v-if="currentPart">
            <h3 class="mm-section-title">
                <span class="mm-marker-badge" style="background:#D97E4A">\u96F6\u4EF6</span>
                {{ activePartId }}
            </h3>
            <div class="mm-field">
                <label title="\u96F6\u4EF6\u5728\u7269\u54C1\u680F\u548C UI \u4E2D\u663E\u793A\u7684\u56FE\u6807\uFF0C\u683C\u5F0F\u4E3A namespace:path">\u56FE\u6807</label>
                <input type="text" v-model="currentPart.icon" class="mm-input" placeholder="machine_max:textures/icon/..." title="\u96F6\u4EF6\u5728\u7269\u54C1\u680F\u548C UI \u4E2D\u663E\u793A\u7684\u56FE\u6807\u8DEF\u5F84\uFF0C\u5982 machine_max:textures/icon/my_part.png" />
            </div>
            <div class="mm-field">
                <label title="\u96F6\u4EF6\u8010\u4E45\u5EA6\u6309\u6B64\u6BD4\u4F8B\u7D2F\u52A0\u5230\u8F7D\u5177\u603B\u8010\u4E45\u5EA6\u3002\u8BBE\u4E3A 1.0 \u8868\u793A\u5168\u90E8\u8D21\u732E\u7ED9\u8F7D\u5177">\u8010\u4E45\u8D21\u732E</label>
                <input type="number" v-model.number="currentPart.vehicle_durability_rate" class="mm-input" step="0.1" min="0" max="1" title="\u96F6\u4EF6\u8010\u4E45\u5EA6\u6309\u6B64\u6BD4\u4F8B\u7D2F\u52A0\u5230\u8F7D\u5177\u603B\u8010\u4E45\u5EA6\u30021.0 = \u5168\u90E8\u8D21\u732E" />
            </div>
            <div class="mm-field">
                <label title="\u96F6\u4EF6\u53D7\u5230\u4F24\u5BB3\u65F6\u6309\u6B64\u6BD4\u4F8B\u4F20\u5BFC\u7ED9\u8F7D\u5177\u672C\u4F53\u30020.5 \u8868\u793A\u4EC5\u4F20\u9012 50% \u7684\u4F24\u5BB3">\u4F24\u5BB3\u4F20\u5BFC</label>
                <input type="number" v-model.number="currentPart.vehicle_damage_rate" class="mm-input" step="0.1" min="0" title="\u96F6\u4EF6\u53D7\u5230\u4F24\u5BB3\u65F6\u6309\u6B64\u6BD4\u4F8B\u4F20\u5BFC\u7ED9\u8F7D\u5177\u672C\u4F53\u30020.5 = \u4F20\u5BFC 50%" />
            </div>
            <div class="mm-field">
                <label title="\u96F6\u4EF6\u88AB\u6467\u6BC1\u540E\u7684\u4F24\u5BB3\u4F20\u5BFC\u7CFB\u6570\u3002\u901A\u5E38\u8BBE\u4E3A\u8F83\u4F4E\u503C\uFF0C\u907F\u514D\u6467\u6BC1\u540E\u7EE7\u7EED\u627F\u53D7\u9AD8\u989D\u4F24\u5BB3">\u6467\u6BC1\u4F24\u5BB3</label>
                <input type="number" v-model.number="currentPart.vehicle_damage_rate_destroyed" class="mm-input" step="0.1" min="0" title="\u96F6\u4EF6\u88AB\u6467\u6BC1\u540E\u5411\u8F7D\u5177\u4F20\u5BFC\u4F24\u5BB3\u7684\u6BD4\u4F8B\uFF0C\u901A\u5E38\u8BBE\u4F4E\u503C\u907F\u514D\u6467\u6BC1\u540E\u7EE7\u7EED\u53D7\u9AD8\u989D\u4F24\u5BB3" />
            </div>
            <div class="mm-field">
                <label title="\u529F\u80FD\u9608\u503C\uFF080~1\uFF09\u3002\u96F6\u4EF6\u7EC4\u88C5\u8FDB\u5EA6\u8FBE\u5230\u8BE5\u503C\u540E\u5B50\u7CFB\u7EDF\u53EF\u6B63\u5E38\u5DE5\u4F5C">\u529F\u80FD\u9608\u503C</label>
                <input type="number" v-model.number="currentPart.functional_threshold" class="mm-input" step="0.1" min="0" max="1" title="\u529F\u80FD\u9608\u503C\uFF080~1\uFF09\u3002\u7EC4\u88C5\u8FDB\u5EA6\u8FBE\u5230\u6B64\u503C\u540E\u5B50\u7CFB\u7EDF\u5373\u53EF\u6B63\u5E38\u5DE5\u4F5C" />
            </div>
            <div class="mm-field mm-field-row">
                <label title="\u662F\u5426\u5171\u4EAB\u8010\u4E45\u5EA6\u3002true \u65F6\u6240\u6709\u5B50\u96F6\u4EF6\u5171\u4EAB\u540C\u4E00\u8010\u4E45\u5EA6\u6C60\uFF1Bfalse \u65F6\u6BCF\u4E2A\u5B50\u96F6\u4EF6\u6709\u72EC\u7ACB\u8010\u4E45\u5EA6">\u5171\u4EAB\u8010\u4E45</label>
                <input type="checkbox" v-model="currentPart.share_durability" title="\u542F\u7528\u540E\u6240\u6709\u5B50\u96F6\u4EF6\u5171\u4EAB\u540C\u4E00\u8010\u4E45\u5EA6\u6C60\uFF0C\u7981\u7528\u5219\u5404\u81EA\u72EC\u7ACB" />
            </div>
            <div class="mm-field">
                <label title="\u96F6\u4EF6\u7269\u54C1\u7684\u6700\u5927\u5806\u53E0\u6570\u91CF\uFF081~64\uFF09\u3002\u8C03\u5927\u6B64\u503C\u53EF\u4F7F\u96F6\u4EF6\u5728\u7269\u54C1\u680F\u4E2D\u53EF\u5806\u53E0">\u6700\u5927\u5806\u53E0</label>
                <input type="number" v-model.number="currentPart.max_stack_size" class="mm-input" min="1" max="64" title="\u96F6\u4EF6\u5728\u7269\u54C1\u680F\u4E2D\u7684\u6700\u5927\u5806\u53E0\u6570\uFF081~64\uFF09" />
            </div>
        </div>

        <div class="mm-section" v-if="currentVariant">
            <h3 class="mm-section-title">
                <span class="mm-marker-badge" style="background:#6A9A9A">\u53D8\u4F53</span>
                {{ activeVariantName }}
            </h3>
            <div class="mm-field">
                <label title="\u57FA\u5CA9\u7248\u51E0\u4F55\u6A21\u578B\u8DEF\u5F84\uFF0C\u683C\u5F0F\u4E3A namespace:name.geo\u3002\u5982 machine_max:my_part.geo">\u6A21\u578B</label>
                <input type="text" v-model="currentVariant.model" class="mm-input" placeholder="machine_max:..." title="\u51E0\u4F55\u6A21\u578B\u8DEF\u5F84\uFF0C\u683C\u5F0F namespace:name.geo\uFF0C\u5982 machine_max:wine_fox.geo" />
            </div>
            <div class="mm-field">
                <label title="\u52A8\u753B\u8DEF\u5F84\u3002\u5982 machine_max:my_anim\u3002\u7559\u7A7A\u5219\u4E0D\u64AD\u653E\u52A8\u753B">\u52A8\u753B</label>
                <input type="text" v-model="currentVariant.animations" class="mm-input" placeholder="machine_max:..." title="\u52A8\u753B\u8DEF\u5F84\uFF0C\u5982 machine_max:wine_fox_anim\u3002\u7559\u7A7A\u5219\u4E0D\u64AD\u52A8\u753B" />
            </div>
            <div class="mm-field">
                <label title="\u8D34\u56FE\u8DEF\u5F84\u3002\u5355\u4E00\u8D34\u56FE\u7528\u5B57\u7B26\u4E32\uFF0C\u591A\u8D34\u56FE\u7528\u952E\u503C\u5BF9\u5BF9\u8C61\uFF0C\u5982 {&quot;default&quot;: &quot;...&quot;}">\u8D34\u56FE</label>
                <input type="text" v-model="currentVariant.textures" class="mm-input" placeholder="default: ..." title="\u8D34\u56FE\u8DEF\u5F84\u3002\u5355\u4E00\u8D34\u56FE\u76F4\u63A5\u586B\u8DEF\u5F84\uFF1B\u591A\u8D34\u56FE\u7528 JSON \u952E\u503C\u5BF9" />
            </div>
            <div class="mm-field">
                <label title="\u96F6\u4EF6\u6807\u7B7E\uFF0C\u683C\u5F0F namespace:tag_name\u3002\u7528\u4E8E\u8FDE\u63A5\u70B9\u5339\u914D\u548C\u529F\u80FD\u5206\u7C7B">\u6807\u7B7E</label>
                <div class="mm-tags">
                    <span v-for="(tag, i) in currentVariant.tags" :key="i" class="mm-tag"
                          :style="{ background: getTagColor(tag) }">
                        {{ tag }}
                        <span class="mm-tag-remove" @click="removeTag(i)">\xD7</span>
                    </span>
                    <button class="mm-btn mm-btn-sm" @click="showAddTagDialog" title="\u6DFB\u52A0\u6807\u7B7E">\u22EF</button>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="mm-panel-body">
        <!-- \u5B50\u96F6\u4EF6\u5C5E\u6027\u9762\u677F -->
        <mm-sub-part-panel v-if="isSubPartSelected"
            :config="selectedSubPartConfig"
            :element-name="selectedElementName"
            :sp-name="selectedMarker ? selectedMarker.config_ref : ''"
            :hit-boxes="selectedSubPartConfig ? selectedSubPartConfig.hit_boxes || {} : {}"
            :interact-boxes="selectedSubPartConfig ? selectedSubPartConfig.interact_boxes || {} : {}"
            :all-bone-names="allBoneNames"
            :all-locator-names="ownedLocatorNames"
            :refresh-key="_markerVersion"
            @field-change="updateSubPartField"
            @projected-area-change="updateProjectedArea"
            @add-end-bone="addEndBone"
            @remove-end-bone="removeEndBone"
            @name-change="renameSubPart"
            @navigate-to-hit-box="navigateToHitBox"
            @navigate-to-connector="navigateToConnector"
            @navigate-to-subsystem="selectSubsystem({ subsystemKey: $event, spKey: selectedMarker.config_ref })"
            @add-subsystem="addSubsystem(selectedMarker.config_ref)"
            @delete-subsystem="deleteSubsystem($event.spKey || selectedMarker.config_ref, $event.ssKey)" />

        <!-- \u78B0\u649E\u7BB1\u5C5E\u6027\u9762\u677F -->
        <mm-hit-box-panel v-else-if="isHitBoxSelected"
            :config="selectedHitBoxConfig"
            :element-name="selectedElementName"
            :parent-sub-part-key="hitBoxParentSubPartKey"
            :material-defs="availableMaterials"
            :parent-subsystems="hitBoxParentSubsystems"
            @field-change="updateHitBoxField"
            @overwrite-change="updateHitBoxOverwrite"
            @navigate-to-sub-part="navigateToSubPart" />

        <!-- \u4EA4\u4E92\u533A\u5C5E\u6027\u9762\u677F -->
        <mm-interact-box-panel v-else-if="isInteractBoxSelected"
            :config="selectedInteractBoxConfig"
            :element-name="selectedElementName"
            :interact-box-name="interactBoxName"
            :parent-sub-part-key="interactBoxParentSubPartKey"
            :parent-subsystems="interactBoxParentSubsystems"
            :signal-target-hints="interactBoxParentSignalTargetHints"
            :all-bone-names="allBoneNames"
            @field-change="updateInteractBoxField"
            @name-change="renameInteractBox"
            @bone-change="migrateInteractBoxBone"
            @navigate-to-sub-part="navigateToSubPart" />

        <!-- \u8FDE\u63A5\u70B9\u5C5E\u6027\u9762\u677F -->
        <mm-connector-panel v-else-if="isConnectorSelected"
            :config="selectedConnectorConfig"
            :element-name="selectedElementName"
            :connector-name="connectorKeyName"
            :parent-sub-part-key="connectorParentSubPartKey"
            :connector-defs="availableConnectorDefs"
            :all-locator-names="allLocatorNames"
            :subsystem-keys="connectorParentSubsystems"
            :signal-target-hints="connectorParentSignalTargetHints"
            @field-change="updateConnectorField"
            @locator-change="migrateConnectorLocator"
            @name-change="renameConnector"
            @navigate-to-sub-part="navigateToSubPart" />

        <!-- \u672A\u6807\u8BB0\u6216\u672A\u77E5\u7C7B\u578B -->
        <div v-else class="mm-section">
            <div class="mm-sticky-title">
                <h3 class="mm-section-title" style="margin:0;border:none;padding:0;">
                    <span class="mm-marker-badge" v-if="selectedMarker"
                          :style="{ background: getMarkerColor(selectedMarker.type) }">
                        {{ getMarkerLabel(selectedMarker.type) }}
                    </span>
                    {{ selectedElementName || '\u672A\u547D\u540D' }}
                </h3>
            </div>
            <p class="mm-element-info">\u7C7B\u578B: {{ selectedElement ? getElementType(selectedElement) : '\u672A\u77E5' }}</p>
            <p class="mm-element-info">UUID: {{ selectedElement ? selectedElement.uuid : '\u2014' }}</p>
            <p class="mm-panel-hint" v-if="!selectedMarker">\u8BE5\u5143\u7D20\u5C1A\u672A\u6807\u8BB0\u3002\u8BF7\u5728 Outliner \u4E2D\u53F3\u952E\u8FDB\u884C\u6807\u8BB0\u3002</p>
        </div>
    </div>
</div>
<div v-else class="mm-panel mm-panel-empty">
    <p>\u521D\u59CB\u5316 MachineMax \u914D\u7F6E\u4E2D...</p>
    <p class="mm-element-info">\u8BF7\u786E\u4FDD\u5DF2\u6253\u5F00\u6216\u521B\u5EFA\u4E00\u4E2A .bbmodel \u6A21\u578B\u6587\u4EF6</p>
</div>`,
        data: function() {
          return {
            config: null,
            activePartId: "",
            activeVariantName: "",
            selectedElement: null,
            _markerVersion: 0,
            // 标记更新版本号，右键菜单 delete 操作后递增，强制计算属性重新求值
            subsystemSelection: { spKey: "", subsystemKey: "" }
            // 虚拟选择的子系统
          };
        },
        computed: {
          currentPart: function() {
            if (!this.config || !this.activePartId) return null;
            return this.config.parts[this.activePartId] || null;
          },
          currentVariant: function() {
            if (!this.currentPart || !this.activeVariantName) return null;
            return this.currentPart.variants[this.activeVariantName] || null;
          },
          variantCount: function() {
            if (!this.currentPart || !this.currentPart.variants) return 0;
            return Object.keys(this.currentPart.variants).length;
          },
          /**
           * 模型中所有骨骼名称列表（用于起始骨骼选择器）
           */
          allBoneNames: function() {
            if (typeof Group === "undefined" || !Group.all) return [];
            return Group.all.map(function(g) {
              return g.name;
            });
          },
          /**
           * 模型中所有定位器名称列表（总表，用于全局参考）
           */
          allLocatorNames: function() {
            if (typeof Locator === "undefined" || !Locator.all) return [];
            return Locator.all.map(function(l) {
              return l.name;
            });
          },
          /**
           * 仅在当前选中子零件骨骼子树下的定位器名称列表（用于质心/连接点等选择器）。
           * 对每个 Locator 沿 parent 链查找第一个 sub_part 标记，若匹配当前子零件则纳入。
           */
          ownedLocatorNames: function() {
            var variant = this.currentVariant;
            var part = this.currentPart;
            var variantName = this.activeVariantName;
            if (!variant || !part || !this.selectedElement) return [];
            var marker = this.selectedMarker;
            if (!marker || marker.type !== "sub_part") return [];
            var spKey = marker.config_ref || this.selectedElementName;
            if (!spKey) return [];
            if (typeof Locator === "undefined" || !Locator.all) return [];
            var config = this.config;
            var self = this;
            return Locator.all.filter(function(loc) {
              var owner = detectOwnerSubPart(config, self.activePartId, variantName, loc);
              return owner && owner.spKey === spKey;
            }).map(function(l) {
              return l.name;
            });
          },
          /**
           * 所有可用材料定义（通过内容包管理器合并加载）
           */
          availableMaterials: function() {
            if (!this.config) return {};
            return content_pack_manager.loadMergedDefs(this.config, "materials").defs;
          },
          /**
           * 所有可用连接点定义（通过内容包管理器合并加载）
           */
          availableConnectorDefs: function() {
            if (!this.config) return {};
            return content_pack_manager.loadMergedDefs(this.config, "connectors").defs;
          },
          selectedMarker: function() {
            if (!this.selectedElement) return null;
            void this._markerVersion;
            const part = this.currentPart;
            if (!part || !part.element_markers) return null;
            const vMarkers = part.element_markers[this.activeVariantName];
            if (!vMarkers) return null;
            var result = vMarkers[this.selectedElement.uuid] || null;
            log2.debug("selectedMarker \u8BA1\u7B97\u5C5E\u6027", {
              uuid: this.selectedElement.uuid,
              markerVersion: this._markerVersion,
              hasElementMarkers: !!part.element_markers,
              variantMarkersKeys: Object.keys(vMarkers),
              result: result ? result.type + " / " + result.config_ref : "null"
            });
            return result;
          },
          /**
           * 当前选中元素的显示名称
           */
          selectedElementName: function() {
            return this.selectedElement && this.selectedElement.name || "\u672A\u547D\u540D";
          },
          /**
           * 从 selectedMarker.config_ref 获取当前选中的子零件配置对象
           */
          selectedSubPartConfig: function() {
            if (!this.selectedMarker || this.selectedMarker.type !== "sub_part") return null;
            const variant = this.currentVariant;
            if (!variant) return null;
            if (!variant.sub_parts) {
              this.$set(variant, "sub_parts", {});
            }
            const spKey = this.selectedMarker.config_ref;
            if (!spKey) return null;
            if (!variant.sub_parts[spKey]) {
              var groupEl = this.selectedElement;
              const spConfig = createSubPartConfig();
              spConfig.start_bone = groupEl ? groupEl.name : spKey;
              this.$set(variant.sub_parts, spKey, spConfig);
              log2.debug("selectedSubPartConfig: \u81EA\u52A8\u521B\u5EFA\u914D\u7F6E", { spKey, start_bone: spConfig.start_bone });
            }
            if (!variant.sub_parts[spKey].auto_end_bones) {
              this.$set(variant.sub_parts[spKey], "auto_end_bones", []);
            }
            return variant.sub_parts[spKey] || null;
          },
          /**
           * 当前选中是否为已绑定配置的子零件标记
           */
          isSubPartSelected: function() {
            return this.selectedMarker && this.selectedMarker.type === "sub_part" && !!this.selectedSubPartConfig;
          },
          /**
           * 当前选中是否为碰撞箱标记
           */
          isHitBoxSelected: function() {
            return this.selectedMarker && this.selectedMarker.type === "hit_box";
          },
          /**
           * 当前选中是否为交互区标记
           */
          isInteractBoxSelected: function() {
            return this.selectedMarker && this.selectedMarker.type === "interact_box";
          },
          /**
           * 当前选中是否为连接点标记
           */
          isConnectorSelected: function() {
            return this.selectedMarker && this.selectedMarker.type === "connector";
          },
          /**
           * 子系统虚拟选择状态
           */
          isSubsystemSelected: function() {
            return !!(this.subsystemSelection && this.subsystemSelection.subsystemKey);
          },
          /**
           * 当前虚拟选中的子系统 key
           */
          selectedSubsystemKey: function() {
            return this.subsystemSelection.subsystemKey || "";
          },
          /**
           * 当前虚拟选中的子零件 key
           */
          selectedSubsystemParentSpKey: function() {
            return this.subsystemSelection.spKey || "";
          },
          /**
           * 当前虚拟选中的子系统配置对象
           */
          selectedSubsystemConfig: function() {
            if (!this.isSubsystemSelected) return null;
            var variant = this.currentVariant;
            if (!variant || !variant.sub_parts) return null;
            var sp = variant.sub_parts[this.subsystemSelection.spKey];
            if (!sp || !sp.subsystems) return null;
            return sp.subsystems[this.subsystemSelection.subsystemKey] || null;
          },
          /**
           * 当前子零件内所有子系统对应的子系统定义（用于型号下拉选择）
           */
          availableSubsystemDefs: function() {
            if (!this.config) return {};
            var cp = require_content_pack_manager();
            return cp.loadMergedDefs(this.config, "subsystems").defs;
          },
          /**
           * 当前子零件内所有连接点名称列表（用于 connector 下拉选择）
           */
          currentConnectorKeys: function() {
            if (!this.isSubsystemSelected || !this.currentVariant) return {};
            var sp = this.currentVariant.sub_parts[this.subsystemSelection.spKey];
            if (!sp || !sp.connectors) return {};
            return sp.connectors;
          },
          /**
           * 当前子零件内所有子系统 key 列表 + 特殊目标（用于信号目标下拉选择）
           */
          currentSignalTargetOptions: function() {
            if (!this.isSubsystemSelected || !this.currentVariant) return [];
            var sp = this.currentVariant.sub_parts[this.subsystemSelection.spKey];
            if (!sp) return ["subpart", "vehicle"];
            var targets = ["subpart", "vehicle"];
            if (sp.connectors) {
              targets = targets.concat(Object.keys(sp.connectors));
            }
            if (sp.subsystems) {
              targets = targets.concat(Object.keys(sp.subsystems));
            }
            return targets;
          },
          /**
           * 动态检测碰撞箱所属子零件（沿父链向上遍历）
           */
          hitBoxOwner: function() {
            if (!this.selectedElement || !this.isHitBoxSelected) return null;
            var config = this.config;
            if (!config) return null;
            return detectOwnerSubPart(config, this.activePartId, this.activeVariantName, this.selectedElement);
          },
          /**
           * 动态检测连接点所属子零件（沿父链向上遍历）
           */
          connectorOwner: function() {
            if (!this.selectedElement || !this.isConnectorSelected) return null;
            if (!this.config) return null;
            return detectOwnerSubPart(this.config, this.activePartId, this.activeVariantName, this.selectedElement);
          },
          /**
           * 连接点所属子零件的 key
           */
          connectorParentSubPartKey: function() {
            var owner = this.connectorOwner;
            return owner ? owner.spKey : "";
          },
          /**
           * 当前连接点在 connectors 字典中的 key（即翻译键格式的名称）
           * 用于属性面板显示和编辑
           */
          connectorKeyName: function() {
            if (!this.isConnectorSelected) return "";
            var sp = this.connectorOwner ? this.currentVariant.sub_parts[this.connectorOwner.spKey] : null;
            if (!sp || !sp.connectors) return "";
            var locatorName = this.selectedElementName;
            var found = Object.keys(sp.connectors).find(function(k) {
              return sp.connectors[k].locator === locatorName;
            });
            return found || "";
          },
          /**
           * 连接点所属子零件内的子系统映射（用于 power_target 下拉选择）
           */
          connectorParentSubsystems: function() {
            var spKey = this.connectorParentSubPartKey;
            if (!spKey || !this.currentVariant || !this.currentVariant.sub_parts) return {};
            var sp = this.currentVariant.sub_parts[spKey];
            return sp && sp.subsystems || {};
          },
          /**
           * 连接点所属子零件内的信号目标补全列表（子系统名 + 连接点名 + 'subpart' + 'vehicle'）
           */
          connectorParentSignalTargetHints: function() {
            var spKey = this.connectorParentSubPartKey;
            if (!spKey || !this.currentVariant || !this.currentVariant.sub_parts) return ["subpart", "vehicle"];
            var sp = this.currentVariant.sub_parts[spKey];
            if (!sp) return ["subpart", "vehicle"];
            var hints = ["subpart", "vehicle"];
            if (sp.connectors) {
              hints = hints.concat(Object.keys(sp.connectors));
            }
            if (sp.subsystems) {
              hints = hints.concat(Object.keys(sp.subsystems));
            }
            return hints;
          },
          /**
           * 当前选中碰撞箱的配置对象（从所属子零件的 hit_boxes 中获取）
           * 无归属时返回游离配置以确保面板正常渲染
           */
          selectedHitBoxConfig: function() {
            if (!this.isHitBoxSelected) {
              return null;
            }
            var variant = this.currentVariant;
            if (!variant || !variant.sub_parts) {
              return { _orphan: true, id: "part", type: "box", material: "", thickness: 1, condition: "true" };
            }
            var owner = this.hitBoxOwner;
            var spKey = owner ? owner.spKey : null;
            if (!spKey || !variant.sub_parts[spKey]) {
              return { _orphan: true, id: "part", type: "box", material: "", thickness: 1, condition: "true" };
            }
            var sp = variant.sub_parts[spKey];
            if (!sp.hit_boxes) this.$set(sp, "hit_boxes", {});
            var hbKey = this.selectedElement.uuid;
            return sp.hit_boxes[hbKey] || { _orphan: true, id: "part", type: "box", material: "", thickness: 1, condition: "true" };
          },
          /**
           * 碰撞箱所属子零件的 key
           */
          hitBoxParentSubPartKey: function() {
            var owner = this.hitBoxOwner;
            return owner ? owner.spKey : "";
          },
          /**
           * 碰撞箱所属子零件内的子系统映射（用于关联子系统下拉选择）
           */
          hitBoxParentSubsystems: function() {
            var spKey = this.hitBoxParentSubPartKey;
            if (!spKey || !this.currentVariant || !this.currentVariant.sub_parts) return {};
            var sp = this.currentVariant.sub_parts[spKey];
            return sp && sp.subsystems || {};
          },
          /**
           * 动态检测交互区所属子零件（沿父链向上遍历）
           */
          interactBoxOwner: function() {
            if (!this.selectedElement || !this.isInteractBoxSelected) return null;
            var config = this.config;
            if (!config) return null;
            return detectOwnerSubPart(config, this.activePartId, this.activeVariantName, this.selectedElement);
          },
          /**
           * 交互区所属子零件的 key
           */
          interactBoxParentSubPartKey: function() {
            var owner = this.interactBoxOwner;
            return owner ? owner.spKey : "";
          },
          /**
           * 交互区所属子零件内的子系统映射（用于信号目标下拉选择）
           */
          interactBoxParentSubsystems: function() {
            var spKey = this.interactBoxParentSubPartKey;
            if (!spKey || !this.currentVariant || !this.currentVariant.sub_parts) return {};
            var sp = this.currentVariant.sub_parts[spKey];
            return sp && sp.subsystems || {};
          },
          /**
           * 交互区所属子零件内的信号目标补全列表（子系统名 + 连接点名 + 'subpart' + 'vehicle'）
           */
          interactBoxParentSignalTargetHints: function() {
            var spKey = this.interactBoxParentSubPartKey;
            if (!spKey || !this.currentVariant || !this.currentVariant.sub_parts) return ["subpart", "vehicle"];
            var sp = this.currentVariant.sub_parts[spKey];
            if (!sp) return ["subpart", "vehicle"];
            var hints = ["subpart", "vehicle"];
            if (sp.connectors) {
              hints = hints.concat(Object.keys(sp.connectors));
            }
            if (sp.subsystems) {
              hints = hints.concat(Object.keys(sp.subsystems));
            }
            return hints;
          },
          /**
           * 当前选中交互区的配置对象（从所属子零件的 interact_boxes 中获取）
           * 按 _uuid 匹配（稳定，bone 变更后仍然有效）
           */
          selectedInteractBoxConfig: function() {
            if (!this.isInteractBoxSelected) {
              return null;
            }
            var variant = this.currentVariant;
            if (!variant || !variant.sub_parts) {
              return { _orphan: true, bone: "", interact_mode: "fast", condition: "NOR", signal_targets: {} };
            }
            var owner = this.interactBoxOwner;
            var spKey = owner ? owner.spKey : null;
            if (!spKey || !variant.sub_parts[spKey]) {
              return { _orphan: true, bone: "", interact_mode: "fast", condition: "NOR", signal_targets: {} };
            }
            var sp = variant.sub_parts[spKey];
            if (!sp.interact_boxes) this.$set(sp, "interact_boxes", {});
            var selectedUuid = this.selectedElement.uuid;
            for (var ibKey in sp.interact_boxes) {
              if (sp.interact_boxes[ibKey]._uuid === selectedUuid) {
                return sp.interact_boxes[ibKey];
              }
            }
            return { _orphan: true, bone: "", interact_mode: "fast", condition: "NOR", signal_targets: {} };
          },
          /**
           * 交互区在 interact_boxes 字典中的 key（即翻译键格式的名称）
           * 用于属性面板显示和编辑
           */
          interactBoxName: function() {
            if (!this.isInteractBoxSelected) return "";
            var spKey = this.interactBoxParentSubPartKey;
            if (!spKey || !this.currentVariant || !this.currentVariant.sub_parts) return "";
            var sp = this.currentVariant.sub_parts[spKey];
            if (!sp || !sp.interact_boxes) return "";
            var selectedUuid = this.selectedElement.uuid;
            for (var ibKey in sp.interact_boxes) {
              if (sp.interact_boxes[ibKey]._uuid === selectedUuid) {
                return ibKey;
              }
            }
            return "";
          },
          /**
           * 当前选中连接点的配置对象（从所属子零件的 connectors 中获取）
           * 自动创建缺失条目以保持数据一致。无归属时返回游离配置。
           */
          selectedConnectorConfig: function() {
            if (!this.isConnectorSelected) {
              return null;
            }
            var marker = this.selectedMarker;
            if (!marker) {
              return null;
            }
            var variant = this.currentVariant;
            if (!variant) return { _orphan: true, definition: marker.config_ref || "" };
            if (!variant.sub_parts) {
              this.$set(variant, "sub_parts", {});
            }
            var owner = this.connectorOwner;
            var spKey = owner ? owner.spKey : null;
            if (!spKey) {
              return { _orphan: true, definition: marker.config_ref || "" };
            }
            if (!variant.sub_parts[spKey]) {
              var spConfig = createSubPartConfig();
              spConfig.start_bone = spKey;
              this.$set(variant.sub_parts, spKey, spConfig);
            }
            var sp = variant.sub_parts[spKey];
            if (!sp.connectors) {
              this.$set(sp, "connectors", {});
            }
            var locatorName = this.selectedElementName;
            var connKey = Object.keys(sp.connectors).find(function(k) {
              return sp.connectors[k].locator === locatorName;
            });
            if (!connKey) {
              return { _orphan: true, locator: locatorName, definition: marker.config_ref || "" };
            }
            return sp.connectors[connKey] || null;
          }
        },
        methods: {
          getElementType: function(el) {
            if (el instanceof Group) return "\u9AA8\u9ABC (Group)";
            if (el instanceof Locator) return "\u5B9A\u4F4D\u5668 (Locator)";
            if (el instanceof Cube) return "\u65B9\u5757 (Cube)";
            return "\u672A\u77E5";
          },
          getMarkerLabel: function(type) {
            const info = getMarkerInfo(type);
            return info ? info.label : type;
          },
          getMarkerColor: function(type) {
            const info = getMarkerInfo(type);
            return info ? info.color : "#888";
          },
          /**
           * 根据字符串哈希生成一致的彩色背景色，用于标签徽标
           */
          getTagColor: function(tag) {
            return _hashTagColor(tag);
          },
          onPartChange: function() {
            log2.debug("onPartChange: \u5207\u6362\u96F6\u4EF6", { partId: this.activePartId });
            const config = getConfig();
            if (!config || !this.activePartId) {
              log2.warn("onPartChange: config \u4E3A\u7A7A\u6216\u65E0 activePartId");
              return;
            }
            config._uiState.activePartId = this.activePartId;
            const part = config.parts[this.activePartId];
            if (part) {
              const variants = Object.keys(part.variants);
              this.activeVariantName = variants.length > 0 ? variants[0] : "default";
              config._uiState.activeVariantName = this.activeVariantName;
              log2.debug("onPartChange: \u53D8\u4F53\u5DF2\u5207\u6362\u4E3A", { variant: this.activeVariantName });
            }
            refreshOutlinerIcons2();
            this.selectedElement = null;
            Blockbench.dispatchEvent("update_selection");
          },
          onVariantChange: function() {
            log2.debug("onVariantChange: \u5207\u6362\u53D8\u4F53", { variant: this.activeVariantName });
            const config = getConfig();
            if (!config || !this.activeVariantName) {
              log2.warn("onVariantChange: config \u4E3A\u7A7A\u6216\u65E0 activeVariantName");
              return;
            }
            config._uiState.activeVariantName = this.activeVariantName;
            refreshOutlinerIcons2();
            this.selectedElement = null;
            Blockbench.dispatchEvent("update_selection");
          },
          removeTag: function(index) {
            if (this.currentVariant && this.currentVariant.tags) {
              var removed = this.currentVariant.tags[index];
              this.currentVariant.tags.splice(index, 1);
              log2.debug("removeTag: \u5DF2\u5220\u9664\u6807\u7B7E", { index, tag: removed });
            }
          },
          showAddTagDialog: function() {
            var variant = this.currentVariant;
            if (!variant) return;
            showAddTagDialog(this, variant);
          },
          /**
           * 弹出确认对话框后删除当前零件
           * 删除前统计该零件下的变体数和元素标记数，在对话框中展示
           */
          showDeletePartDialog: function() {
            var config = getConfig();
            if (!config || !this.activePartId) {
              log2.warn("showDeletePartDialog: config \u6216 activePartId \u4E3A\u7A7A");
              return;
            }
            var partId = this.activePartId;
            var part = config.parts[partId];
            if (!part) {
              log2.warn("showDeletePartDialog: \u96F6\u4EF6\u4E0D\u5B58\u5728", { partId });
              return;
            }
            var variantCount = Object.keys(part.variants || {}).length;
            var markerCount = 0;
            if (part.element_markers) {
              var em = part.element_markers;
              for (var vn in em) {
                if (em.hasOwnProperty(vn)) {
                  markerCount += Object.keys(em[vn]).length;
                }
              }
            }
            var self = this;
            new Dialog({
              title: "\u786E\u8BA4\u5220\u9664\u96F6\u4EF6",
              form: {
                info: {
                  type: "info",
                  text: '\u786E\u8BA4\u5220\u9664\u96F6\u4EF6 "' + partId + '" \uFF1F<br><br>\u6B64\u64CD\u4F5C\u5C06\u6C38\u4E45\u5220\u9664\uFF1A<br>\u2022 \u96F6\u4EF6 ' + partId + " \u7684\u5168\u90E8\u914D\u7F6E<br>\u2022 \u8BE5\u96F6\u4EF6\u4E0B\u7684 " + variantCount + " \u4E2A\u53D8\u4F53<br>\u2022 \u6240\u6709\u53D8\u4F53\u5173\u8054\u7684 " + markerCount + " \u4E2A\u5143\u7D20\u6807\u8BB0<br><br>\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF01"
                }
              },
              onConfirm: function() {
                log2.info("showDeletePartDialog: \u7528\u6237\u786E\u8BA4\u5220\u9664\u96F6\u4EF6", { partId });
                self.$delete(config.parts, partId);
                var remaining = Object.keys(config.parts);
                if (remaining.length > 0) {
                  config._uiState.activePartId = remaining[0];
                  var firstPart = config.parts[remaining[0]];
                  var firstVariants = Object.keys(firstPart.variants || {});
                  config._uiState.activeVariantName = firstVariants.length > 0 ? firstVariants[0] : "default";
                } else {
                  config._uiState.activePartId = "";
                  config._uiState.activeVariantName = "";
                }
                refreshOutlinerIcons2();
                self.selectedElement = null;
                self.loadConfigData();
                Blockbench.dispatchEvent("update_selection");
                showToast2('\u96F6\u4EF6 "' + partId + '" \u5DF2\u5220\u9664', "warning");
                log2.debug("showDeletePartDialog: \u5220\u9664\u5B8C\u6210, \u5269\u4F59\u96F6\u4EF6", { remaining });
                this.hide();
              }
            }).show();
          },
          /**
           * 弹出确认对话框后删除当前变体
           * 删除前清理该变体关联的所有 element_markers，避免残留孤儿数据
           */
          showDeleteVariantDialog: function() {
            var config = getConfig();
            var part = this.currentPart;
            var variantName = this.activeVariantName;
            if (!config || !part || !variantName) {
              log2.warn("showDeleteVariantDialog: config/part/variantName \u4E3A\u7A7A");
              return;
            }
            var markerCount = 0;
            if (part.element_markers && part.element_markers[variantName]) {
              markerCount = Object.keys(part.element_markers[variantName]).length;
            }
            var self = this;
            new Dialog({
              title: "\u786E\u8BA4\u5220\u9664\u53D8\u4F53",
              form: {
                info: {
                  type: "info",
                  text: '\u786E\u8BA4\u5220\u9664\u53D8\u4F53 "' + variantName + '" \uFF1F<br><br>\u6B64\u64CD\u4F5C\u5C06\u6C38\u4E45\u5220\u9664\uFF1A<br>\u2022 \u53D8\u4F53 "' + variantName + '" \u7684\u5168\u90E8\u914D\u7F6E\uFF08\u6A21\u578B\u3001\u8D34\u56FE\u3001\u6807\u7B7E\u7B49\uFF09<br>\u2022 \u8BE5\u53D8\u4F53\u5173\u8054\u7684 ' + markerCount + " \u4E2A\u5143\u7D20\u6807\u8BB0<br><br>\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF01"
                }
              },
              onConfirm: function() {
                log2.info("showDeleteVariantDialog: \u7528\u6237\u786E\u8BA4\u5220\u9664\u53D8\u4F53", { variant: variantName });
                clearAllMarkers(config, self.activePartId, variantName);
                self.$delete(part.variants, variantName);
                var remaining = Object.keys(part.variants);
                self.activeVariantName = remaining.length > 0 ? remaining[0] : "";
                config._uiState.activeVariantName = self.activeVariantName;
                log2.debug("showDeleteVariantDialog: \u5269\u4F59\u53D8\u4F53", { remaining });
                self.onVariantChange();
                showToast2('\u53D8\u4F53 "' + variantName + '" \u5DF2\u5220\u9664', "warning");
                this.hide();
              }
            }).show();
          },
          showNewPartDialog: function() {
            log2.debug('showNewPartDialog: \u70B9\u51FB"\u65B0\u5EFA\u96F6\u4EF6"\u6309\u94AE');
            var config = getConfig();
            if (!config) {
              log2.error("showNewPartDialog: getConfig() \u8FD4\u56DE null");
              return;
            }
            var self = this;
            try {
              new Dialog({
                title: "\u65B0\u5EFA\u96F6\u4EF6",
                form: {
                  partId: { type: "text", label: "\u96F6\u4EF6 ID", hint: "\u5982 wine_fox_hull" },
                  variantName: { type: "text", label: "\u521D\u59CB\u53D8\u4F53\u540D", value: "default" },
                  model: { type: "text", label: "\u6A21\u578B\u5F15\u7528", value: "machine_max:" }
                },
                onConfirm: function(formData) {
                  var partId = formData.partId;
                  var variantName = formData.variantName;
                  var model = formData.model;
                  if (!partId) {
                    showToast2("\u96F6\u4EF6 ID \u4E0D\u80FD\u4E3A\u7A7A", "error");
                    return false;
                  }
                  if (config.parts[partId]) {
                    showToast2('\u96F6\u4EF6 "' + partId + '" \u5DF2\u5B58\u5728', "error");
                    return false;
                  }
                  var cfg = require_config();
                  self.$set(config.parts, partId, cfg.createPartConfig(partId, variantName));
                  if (model) {
                    config.parts[partId].variants[variantName].model = model;
                  }
                  config._uiState.activePartId = partId;
                  config._uiState.activeVariantName = variantName;
                  log2.info("UI\u65B0\u5EFA\u96F6\u4EF6\u6210\u529F", { partId, variant: variantName });
                  require_icons().refreshOutlinerIcons();
                  Blockbench.dispatchEvent("update_selection");
                  showToast2('\u96F6\u4EF6 "' + partId + '" \u5DF2\u521B\u5EFA', "positive");
                  self.loadConfigData();
                  this.hide();
                }
              }).show();
              log2.debug("showNewPartDialog: Dialog \u5DF2\u663E\u793A");
            } catch (e) {
              log2.error("showNewPartDialog: \u521B\u5EFA Dialog \u5F02\u5E38", e);
            }
          },
          showNewVariantDialog: function() {
            log2.debug('showNewVariantDialog: \u70B9\u51FB"\u65B0\u5EFA\u53D8\u4F53"\u6309\u94AE');
            const self = this;
            new Dialog({
              title: "\u65B0\u5EFA\u53D8\u4F53",
              form: {
                variantName: { type: "text", label: "\u53D8\u4F53\u540D" },
                model: { type: "text", label: "\u6A21\u578B\u5F15\u7528", value: "machine_max:" }
              },
              onConfirm: function(formData) {
                var variantName = formData.variantName;
                var model = formData.model;
                if (!variantName) {
                  showToast2("\u53D8\u4F53\u540D\u4E0D\u80FD\u4E3A\u7A7A", "error");
                  return false;
                }
                const part = self.currentPart;
                if (!part) {
                  log2.warn("showNewVariantDialog: currentPart \u4E3A\u7A7A");
                  return false;
                }
                if (part.variants[variantName]) {
                  showToast2('\u53D8\u4F53 "' + variantName + '" \u5DF2\u5B58\u5728', "error");
                  return false;
                }
                self.$set(part.variants, variantName, createVariantConfig());
                if (model) part.variants[variantName].model = model;
                self.activeVariantName = variantName;
                log2.info("UI\u65B0\u5EFA\u53D8\u4F53\u6210\u529F", { variant: variantName, partId: self.activePartId });
                self.onVariantChange();
                this.hide();
              }
            }).show();
            log2.debug("showNewVariantDialog: Dialog \u5DF2\u663E\u793A");
          },
          onSelectionChange: function() {
            var sel = Outliner && Outliner.selected;
            var pendingNav = this.config && this.config._uiState && this.config._uiState._pendingSubsystemNav;
            if (pendingNav && pendingNav.subsystemKey) {
              this.subsystemSelection = { spKey: pendingNav.spKey, subsystemKey: pendingNav.subsystemKey };
              this.config._uiState._pendingSubsystemNav = null;
              this.selectedElement = null;
              this._markerVersion++;
              log2.debug("onSelectionChange: \u4FE1\u53F7\u6D41\u56FE\u89E6\u53D1\u5B50\u7CFB\u7EDF\u5BFC\u822A", {
                spKey: pendingNav.spKey,
                subsystemKey: pendingNav.subsystemKey
              });
              return;
            }
            if (!sel || sel.length === 0) {
              this.selectedElement = null;
              this._markerVersion++;
              log2.debug("onSelectionChange: \u53D6\u6D88\u9009\u4E2D", {
                markerVersion: this._markerVersion,
                markerVersionAfter: this._markerVersion
              });
              return;
            }
            this.subsystemSelection = { spKey: "", subsystemKey: "" };
            var best = typeof Group !== "undefined" && Group.first_selected || sel[0];
            var sameElement = this.selectedElement && this.selectedElement.uuid === best.uuid;
            this.selectedElement = best;
            this._markerVersion++;
            log2.debug("onSelectionChange: \u9009\u4E2D\u5143\u7D20", {
              name: best.name,
              uuid: best.uuid,
              type: best.constructor ? best.constructor.name : typeof best,
              groupSelected: !!(typeof Group !== "undefined" && Group.first_selected),
              sameElementAsBefore: sameElement,
              markerVersion: this._markerVersion
            });
          },
          loadConfigData: function() {
            let config = getConfig();
            if (!config) {
              config = loadConfig();
              log2.debug("loadConfigData: \u91CD\u65B0\u52A0\u8F7D\u914D\u7F6E");
            } else {
              log2.debug("loadConfigData: \u4ECE\u7F13\u5B58\u83B7\u53D6\u914D\u7F6E");
            }
            this.config = config;
            if (config) {
              this.activePartId = config._uiState?.activePartId || "";
              this.activeVariantName = config._uiState?.activeVariantName || "";
              log2.debug("loadConfigData: \u5B8C\u6210", {
                activePartId: this.activePartId,
                activeVariantName: this.activeVariantName
              });
            } else {
              log2.warn("loadConfigData: \u914D\u7F6E\u4ECD\u4E3A\u7A7A");
            }
          },
          /**
           * 导航到碰撞箱：选中碰撞箱对应的 Group 骨骼，切换到碰撞箱属性面板
           */
          navigateToHitBox: function(hbKey) {
            if (!hbKey) return;
            var el = Group.all.find(function(g) {
              return g.name === hbKey || g.uuid === hbKey;
            });
            if (el) {
              el.select();
              el.showInOutliner();
              Blockbench.dispatchEvent("update_selection");
            }
          },
          /**
           * 导航到连接点：选中连接点对应的 Locator，切换到连接点属性面板
           */
          navigateToConnector: function(connKey) {
            if (!connKey) return;
            var spConfig = this.selectedSubPartConfig;
            if (!spConfig || !spConfig.connectors || !spConfig.connectors[connKey]) return;
            var locatorName = spConfig.connectors[connKey].locator;
            if (!locatorName) return;
            var loc = typeof Locator !== "undefined" ? Locator.all.find(function(l) {
              return l.name === locatorName;
            }) : null;
            if (loc) {
              loc.select();
              loc.showInOutliner();
              Blockbench.dispatchEvent("update_selection");
            }
          },
          /**
           * 导航到子零件：根据 subPartKey 找到对应的子零件标记 Group 并选中，切换回子零件属性面板
           */
          navigateToSubPart: function(spKey) {
            if (!spKey) return;
            var part = this.currentPart;
            var variantName = this.activeVariantName;
            if (!part || !part.element_markers || !part.element_markers[variantName]) return;
            var markers = part.element_markers[variantName];
            for (var uuid in markers) {
              if (markers[uuid].type === "sub_part" && markers[uuid].config_ref === spKey) {
                var group = Group.all.find(function(g) {
                  return g.uuid === uuid;
                });
                if (group) {
                  group.select();
                  group.showInOutliner();
                  Blockbench.dispatchEvent("update_selection");
                }
                return;
              }
            }
          },
          /**
           * 更新子零件配置中的单个字段。
           * start_bone 变动时需连带迁移子零件标记。
           */
          updateSubPartField: function(field, value) {
            const config = this.selectedSubPartConfig;
            if (!config) {
              log2.warn("updateSubPartField: selectedSubPartConfig \u4E3A\u7A7A");
              return;
            }
            if (field === "start_bone" && config.start_bone !== value) {
              this.migrateSubPartStartBone(config.start_bone, value);
            }
            this.$set(config, field, value);
            log2.debug("updateSubPartField: \u5DF2\u66F4\u65B0", { field, value });
          },
          /**
           * 重命名子零件：修改 sub_parts 字典的 key
           * 同时更新 element_markers 中的 config_ref
           */
          renameSubPart: function(oldKey, newKey) {
            if (!oldKey || !newKey || oldKey === newKey) return;
            var variant = this.currentVariant;
            var part = this.currentPart;
            var variantName = this.activeVariantName;
            if (!variant || !variant.sub_parts || !part) return;
            var spConfig = variant.sub_parts[oldKey];
            if (!spConfig) {
              log2.warn("renameSubPart: \u672A\u627E\u5230\u5B50\u96F6\u4EF6", { oldKey });
              return;
            }
            var ns = this.config && this.config.namespace || "machine_max";
            var { validateNameUniqueness } = require_naming();
            var check = validateNameUniqueness(variant, "sub_part", null, newKey, oldKey);
            if (!check.valid) {
              showToast2(check.message, "error");
              return;
            }
            log2.info("renameSubPart: \u91CD\u547D\u540D", { from: oldKey, to: newKey });
            this.$set(variant.sub_parts, newKey, spConfig);
            this.$delete(variant.sub_parts, oldKey);
            var markers = part.element_markers && part.element_markers[variantName];
            if (markers) {
              for (var uuid in markers) {
                if (markers[uuid].type === "sub_part" && markers[uuid].config_ref === oldKey) {
                  this.$set(markers, uuid, { type: "sub_part", config_ref: newKey });
                }
              }
            }
            var em = require_element_markers();
            var cfg = getConfig();
            if (cfg) {
              em.recalcAutoEndBones(cfg, this.activePartId, variantName);
            }
            refreshOutlinerIcons2();
            Blockbench.dispatchEvent("update_selection");
            showToast2('\u5B50\u96F6\u4EF6\u5DF2\u91CD\u547D\u540D\u4E3A "' + newKey + '"', "positive");
            log2.info("renameSubPart: \u5B8C\u6210");
          },
          /**
           * 迁移子零件标记：start_bone 从旧骨骼名变更为新骨骼名时，
           * 将 element_marker 和 sub_parts 中的 key 一并迁移到新骨骼。
           * @param {string} oldBoneName - 旧的起始骨骼名称
           * @param {string} newBoneName - 新的起始骨骼名称
           */
          migrateSubPartStartBone: function(oldBoneName, newBoneName) {
            var variant = this.currentVariant;
            var part = this.currentPart;
            var variantName = this.activeVariantName;
            if (!variant || !variant.sub_parts || !part) return;
            var spKey = this.selectedMarker ? this.selectedMarker.config_ref : null;
            if (!spKey || !variant.sub_parts[spKey]) return;
            log2.info("migrateSubPartStartBone: start_bone \u53D8\u66F4", { from: oldBoneName, to: newBoneName, spKey });
            var markers = part.element_markers && part.element_markers[variantName];
            var oldGroup = Group.all.find(function(g) {
              return g.name === oldBoneName;
            });
            var newGroup = Group.all.find(function(g) {
              return g.name === newBoneName;
            });
            if (markers && oldGroup && newGroup && oldGroup !== newGroup) {
              var markerData = markers[oldGroup.uuid];
              if (markerData && markerData.type === "sub_part") {
                markerData.config_ref = spKey;
                this.$set(markers, newGroup.uuid, markerData);
                this.$delete(markers, oldGroup.uuid);
                log2.debug("migrateSubPartStartBone: \u6807\u8BB0\u5DF2\u8FC1\u79FB", { from: oldGroup.uuid, to: newGroup.uuid });
              }
            }
            refreshOutlinerIcons2();
            var em = require_element_markers();
            var cfg = getConfig();
            if (cfg) {
              em.recalcAutoEndBones(cfg, this.activePartId, variantName);
            }
            Blockbench.dispatchEvent("update_selection");
            log2.info("migrateSubPartStartBone: \u5B8C\u6210");
          },
          /**
           * 迁移连接点定位器：locator 从旧名称变更为新名称时，
           * 将 element_marker 和 connectors 中的 key 一并迁移。
           * @param {string} oldLocName - 旧的定位器名称
           * @param {string} newLocName - 新的定位器名称
           */
          migrateConnectorLocator: function(oldLocName, newLocName) {
            if (!oldLocName || !newLocName || oldLocName === newLocName) return;
            var part = this.currentPart;
            var variant = this.currentVariant;
            var variantName = this.activeVariantName;
            if (!variant || !variant.sub_parts || !part) return;
            var owner = this.selectedElement ? detectOwnerSubPart(this.config, this.activePartId, variantName, this.selectedElement) : null;
            var spKey = owner ? owner.spKey : null;
            if (!spKey || !variant.sub_parts[spKey]) return;
            var sp = variant.sub_parts[spKey];
            if (!sp.connectors) return;
            var connKey = Object.keys(sp.connectors).find(function(k) {
              return sp.connectors[k].locator === oldLocName;
            });
            if (!connKey) {
              log2.warn("migrateConnectorLocator: \u672A\u627E\u5230\u8FDE\u63A5\u70B9\u6761\u76EE", { locator: oldLocName, spKey });
              return;
            }
            log2.info("migrateConnectorLocator: \u53D8\u66F4\u5B9A\u4F4D\u5668\u7ED1\u5B9A", { from: oldLocName, to: newLocName, connKey, spKey });
            sp.connectors[connKey].locator = newLocName;
            var markers = part.element_markers && part.element_markers[variantName];
            var oldLoc = typeof Locator !== "undefined" ? Locator.all.find(function(l) {
              return l.name === oldLocName;
            }) : null;
            var newLoc = typeof Locator !== "undefined" ? Locator.all.find(function(l) {
              return l.name === newLocName;
            }) : null;
            if (markers && oldLoc && newLoc && oldLoc !== newLoc) {
              var markerData = markers[oldLoc.uuid];
              if (markerData && markerData.type === "connector") {
                this.$set(markers, newLoc.uuid, markerData);
                this.$delete(markers, oldLoc.uuid);
                log2.debug("migrateConnectorLocator: \u6807\u8BB0\u5DF2\u8FC1\u79FB", { from: oldLoc.uuid, to: newLoc.uuid });
              }
            }
            refreshOutlinerIcons2();
            Blockbench.dispatchEvent("update_selection");
            log2.info("migrateConnectorLocator: \u5B8C\u6210");
          },
          /**
           * 更新子零件投影面积的单个轴向分量
           */
          updateProjectedArea: function(axis, value) {
            const config = this.selectedSubPartConfig;
            if (!config) {
              log2.warn("updateProjectedArea: selectedSubPartConfig \u4E3A\u7A7A");
              return;
            }
            if (!config.projected_area) {
              this.$set(config, "projected_area", [0, 0, 0]);
            }
            this.$set(config.projected_area, axis, value);
            log2.debug("updateProjectedArea: \u5DF2\u66F4\u65B0", { axis, value });
          },
          /**
           * 添加排除骨骼到 end_bones 列表
           */
          addEndBone: function(boneName) {
            const config = this.selectedSubPartConfig;
            if (!config) {
              log2.warn("addEndBone: selectedSubPartConfig \u4E3A\u7A7A");
              return;
            }
            if (!config.end_bones) {
              this.$set(config, "end_bones", []);
            }
            if (config.end_bones.indexOf(boneName) === -1) {
              config.end_bones.push(boneName);
              log2.debug("addEndBone: \u5DF2\u6DFB\u52A0", { bone: boneName });
            }
          },
          /**
           * 移除排除骨骼
           */
          removeEndBone: function(index) {
            const config = this.selectedSubPartConfig;
            if (!config || !config.end_bones) {
              log2.warn("removeEndBone: selectedSubPartConfig \u4E3A\u7A7A\u6216\u65E0 end_bones");
              return;
            }
            config.end_bones.splice(index, 1);
            log2.debug("removeEndBone: \u5DF2\u79FB\u9664", { index });
          },
          /**
           * 更新碰撞箱配置中的单个字段
           * 游离碰撞箱（无归属）可编辑但不会持久化
           */
          updateHitBoxField: function(field, value) {
            const config = this.selectedHitBoxConfig;
            if (!config) {
              log2.warn("updateHitBoxField: selectedHitBoxConfig \u4E3A\u7A7A");
              return;
            }
            if (config._orphan) {
              log2.warn("updateHitBoxField: \u6E38\u79BB\u78B0\u649E\u7BB1\u4E0D\u53EF\u6301\u4E45\u5316", { field, value });
              return;
            }
            this.$set(config, field, value);
            log2.debug("updateHitBoxField: \u5DF2\u66F4\u65B0", { field, value });
          },
          /**
           * 更新碰撞箱材质覆写字段
           */
          updateHitBoxOverwrite: function(field, value) {
            const config = this.selectedHitBoxConfig;
            if (!config) {
              log2.warn("updateHitBoxOverwrite: selectedHitBoxConfig \u4E3A\u7A7A");
              return;
            }
            if (config._orphan) {
              log2.warn("updateHitBoxOverwrite: \u6E38\u79BB\u78B0\u649E\u7BB1\u4E0D\u53EF\u6301\u4E45\u5316", { field, value });
              return;
            }
            if (!config.overwrite) {
              this.$set(config, "overwrite", {});
            }
            this.$set(config.overwrite, field, value);
            log2.debug("updateHitBoxOverwrite: \u5DF2\u66F4\u65B0", { field, value });
          },
          /**
           * 更新交互区配置中的单个字段
           * 游离交互区（无归属）可编辑但不会持久化
           * bone 变更后增量 _markerVersion 强制所有计算属性重新求值
           */
          updateInteractBoxField: function(field, value) {
            const config = this.selectedInteractBoxConfig;
            if (!config) {
              log2.warn("updateInteractBoxField: selectedInteractBoxConfig \u4E3A\u7A7A");
              return;
            }
            if (config._orphan) {
              log2.warn("updateInteractBoxField: \u6E38\u79BB\u4EA4\u4E92\u533A\u4E0D\u53EF\u6301\u4E45\u5316", { field, value });
              return;
            }
            this.$set(config, field, value);
            if (field === "bone") {
              this._markerVersion++;
            }
            log2.debug("updateInteractBoxField: \u5DF2\u66F4\u65B0", { field, value });
          },
          /**
           * 更新连接点配置字段，同时同步到标记的 config_ref
           */
          updateConnectorField: function(field, value) {
            var config = this.selectedConnectorConfig;
            if (!config) {
              log2.warn("updateConnectorField: selectedConnectorConfig \u4E3A\u7A7A");
              return;
            }
            if (config._orphan) {
              log2.warn("updateConnectorField: \u6E38\u79BB\u8FDE\u63A5\u70B9\u4E0D\u53EF\u6301\u4E45\u5316", { field, value });
              return;
            }
            this.$set(config, field, value);
            if (field === "definition") {
              var marker = this.selectedMarker;
              var part = this.currentPart;
              if (marker && part && part.element_markers && this.activeVariantName) {
                var vMarkers = part.element_markers[this.activeVariantName];
                if (vMarkers && vMarkers[this.selectedElement.uuid]) {
                  vMarkers[this.selectedElement.uuid].config_ref = value;
                }
              }
            }
            log2.debug("updateConnectorField: \u5DF2\u66F4\u65B0", { field, value });
          },
          /**
           * 添加子系统：弹出类型选择对话框，用户选择类型并输入名称后在指定子零件下创建子系统实例
           * @param {string} spKey - 子零件 key
           * @param {string} [preSelectedType] - 预选的子系统类型 ID（右键菜单直接跳转时使用）
           */
          addSubsystem: function(spKey, preSelectedType) {
            if (!spKey) {
              spKey = this.subsystemSelection.spKey;
            }
            if (!spKey) {
              var marker = this.selectedMarker;
              if (!marker || marker.type !== "sub_part") return;
              spKey = marker.config_ref;
            }
            var variant = this.currentVariant;
            if (!variant || !variant.sub_parts || !variant.sub_parts[spKey]) return;
            var self = this;
            var { showAddSubsystemDialog } = require_add_subsystem_dialog();
            showAddSubsystemDialog({
              config: this.config,
              variant,
              spKey,
              preSelectedType,
              beforeSet: function(sp, instanceName, ssConfig) {
                if (!sp.subsystems) {
                  self.$set(sp, "subsystems", {});
                }
                self.$set(sp.subsystems, instanceName, ssConfig);
              },
              onCreated: function(createdSpKey, instanceName) {
                self.subsystemSelection = { spKey: createdSpKey, subsystemKey: instanceName };
                self._markerVersion++;
                log2.info("addSubsystem: \u5DF2\u521B\u5EFA\u5B50\u7CFB\u7EDF", { spKey: createdSpKey, instanceName });
              }
            });
          },
          /**
           * 删除子系统：确认后从 sub_parts 中移除
           */
          deleteSubsystem: function(spKey, ssKey) {
            if (!spKey || !ssKey) return;
            var variant = this.currentVariant;
            if (!variant || !variant.sub_parts) return;
            var sp = variant.sub_parts[spKey];
            if (!sp || !sp.subsystems || !sp.subsystems[ssKey]) return;
            var self = this;
            new Dialog({
              title: "\u786E\u8BA4\u5220\u9664\u5B50\u7CFB\u7EDF",
              form: {
                info: {
                  type: "info",
                  text: '\u786E\u8BA4\u5220\u9664\u5B50\u7CFB\u7EDF "' + ssKey + '" \uFF1F<br><br>\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF01'
                }
              },
              onConfirm: function() {
                self.$delete(sp.subsystems, ssKey);
                self.subsystemSelection = { spKey: "", subsystemKey: "" };
                self._markerVersion++;
                log2.info("deleteSubsystem: \u5DF2\u5220\u9664\u5B50\u7CFB\u7EDF", { spKey, subsystemKey: ssKey });
                showToast2('\u5B50\u7CFB\u7EDF "' + ssKey + '" \u5DF2\u5220\u9664', "warning");
                this.hide();
              }
            }).show();
          },
          /**
           * 选择子系统：设置虚拟选择状态，切换到子系统属性面板
           */
          selectSubsystem: function(params) {
            var spKey = params.spKey || this.subsystemSelection.spKey;
            var ssKey = params.subsystemKey;
            if (!spKey || !ssKey) return;
            this.subsystemSelection = { spKey, subsystemKey: ssKey };
            this.selectedElement = null;
            log2.debug("selectSubsystem: \u9009\u4E2D\u5B50\u7CFB\u7EDF", { spKey, subsystemKey: ssKey });
          },
          /**
           * 重命名子系统：修改 subsystems 字典的 key
           */
          renameSubsystem: function(oldKey, newKey) {
            if (!oldKey || !newKey || oldKey === newKey) return;
            var spKey = this.subsystemSelection.spKey;
            if (!spKey) return;
            var variant = this.currentVariant;
            if (!variant || !variant.sub_parts) return;
            var sp = variant.sub_parts[spKey];
            if (!sp || !sp.subsystems) return;
            if (!sp.subsystems[oldKey]) {
              log2.warn("renameSubsystem: \u672A\u627E\u5230\u5B50\u7CFB\u7EDF", { oldKey });
              return;
            }
            if (sp.subsystems[newKey]) {
              showToast2('\u5B50\u7CFB\u7EDF "' + newKey + '" \u5DF2\u5B58\u5728', "error");
              return;
            }
            log2.info("renameSubsystem: \u91CD\u547D\u540D", { from: oldKey, to: newKey });
            this.$set(sp.subsystems, newKey, sp.subsystems[oldKey]);
            this.$delete(sp.subsystems, oldKey);
            this.subsystemSelection.subsystemKey = newKey;
            showToast2('\u5B50\u7CFB\u7EDF\u5DF2\u91CD\u547D\u540D\u4E3A "' + newKey + '"', "positive");
          },
          /**
           * 更新子系统配置中的单个字段
           */
          updateSubsystemField: function(ssKey, field, value) {
            if (!ssKey || !field) return;
            var spKey = this.subsystemSelection.spKey;
            if (!spKey) return;
            var variant = this.currentVariant;
            if (!variant || !variant.sub_parts) return;
            var sp = variant.sub_parts[spKey];
            if (!sp || !sp.subsystems || !sp.subsystems[ssKey]) return;
            this.$set(sp.subsystems[ssKey], field, value);
            log2.debug("updateSubsystemField: \u5DF2\u66F4\u65B0", { ssKey, field, value });
          },
          /**
           * 重命名连接点：修改 connectors 字典的 key
           * 需要先找到当前连接点（通过 locator 字段），然后迁移 key
           */
          renameConnector: function(oldKey, newKey) {
            if (!oldKey || !newKey || oldKey === newKey) return;
            var variant = this.currentVariant;
            if (!variant) return;
            var owner = this.connectorOwner;
            var spKey = owner ? owner.spKey : null;
            if (!spKey || !variant.sub_parts[spKey]) return;
            var sp = variant.sub_parts[spKey];
            if (!sp.connectors || !sp.connectors[oldKey]) {
              log2.warn("renameConnector: \u672A\u627E\u5230\u8FDE\u63A5\u70B9", { oldKey });
              return;
            }
            var { validateNameUniqueness } = require_naming();
            var check = validateNameUniqueness(variant, "connector", spKey, newKey, oldKey);
            if (!check.valid) {
              showToast2(check.message, "error");
              return;
            }
            log2.info("renameConnector: \u91CD\u547D\u540D", { from: oldKey, to: newKey });
            this.$set(sp.connectors, newKey, sp.connectors[oldKey]);
            this.$delete(sp.connectors, oldKey);
            refreshOutlinerIcons2();
            Blockbench.dispatchEvent("update_selection");
            showToast2('\u8FDE\u63A5\u70B9\u5DF2\u91CD\u547D\u540D\u4E3A "' + newKey + '"', "positive");
            log2.info("renameConnector: \u5B8C\u6210");
          },
          /**
           * 重命名交互区：修改 interact_boxes 字典的 key
           */
          renameInteractBox: function(oldKey, newKey) {
            if (!oldKey || !newKey || oldKey === newKey) return;
            var variant = this.currentVariant;
            if (!variant) return;
            var spKey = this.interactBoxParentSubPartKey;
            if (!spKey || !variant.sub_parts) return;
            var sp = variant.sub_parts[spKey];
            if (!sp || !sp.interact_boxes || !sp.interact_boxes[oldKey]) {
              log2.warn("renameInteractBox: \u672A\u627E\u5230\u4EA4\u4E92\u533A", { oldKey });
              return;
            }
            var { validateNameUniqueness } = require_naming();
            var check = validateNameUniqueness(variant, "interact_box", spKey, newKey, oldKey);
            if (!check.valid) {
              showToast2(check.message, "error");
              return;
            }
            log2.info("renameInteractBox: \u91CD\u547D\u540D", { from: oldKey, to: newKey });
            this.$set(sp.interact_boxes, newKey, sp.interact_boxes[oldKey]);
            this.$delete(sp.interact_boxes, oldKey);
            refreshOutlinerIcons2();
            Blockbench.dispatchEvent("update_selection");
            showToast2('\u4EA4\u4E92\u533A\u5DF2\u91CD\u547D\u540D\u4E3A "' + newKey + '"', "positive");
            log2.info("renameInteractBox: \u5B8C\u6210");
          },
          /**
           * 迁移交互区骨骼绑定：bone 从旧骨骼变更为新骨骼时，
           * 同步迁移 element_marker 到新骨骼的 UUID，并选中新骨骼。
           */
          migrateInteractBoxBone: function(field, newBoneName) {
            var config = this.selectedInteractBoxConfig;
            if (!config || config._orphan) {
              log2.warn("migrateInteractBoxBone: \u4EA4\u4E92\u533A\u4E0D\u53EF\u8FC1\u79FB");
              return;
            }
            var oldBoneName = config.bone || "";
            if (oldBoneName === newBoneName) return;
            var part = this.currentPart;
            var variant = this.currentVariant;
            var variantName = this.activeVariantName;
            if (!part || !variant) return;
            this.$set(config, "bone", newBoneName);
            var oldGroup = typeof Group !== "undefined" ? Group.all.find(function(g) {
              return g.name === oldBoneName;
            }) : null;
            var newGroup = typeof Group !== "undefined" ? Group.all.find(function(g) {
              return g.name === newBoneName;
            }) : null;
            if (oldGroup && newGroup && oldGroup !== newGroup) {
              config._uuid = newGroup.uuid;
              var markers = part.element_markers && part.element_markers[variantName];
              if (markers) {
                var markerData = markers[oldGroup.uuid];
                if (markerData && markerData.type === "interact_box") {
                  this.$set(markers, newGroup.uuid, markerData);
                  this.$delete(markers, oldGroup.uuid);
                  log2.debug("migrateInteractBoxBone: \u6807\u8BB0\u5DF2\u8FC1\u79FB", {
                    from: oldGroup.uuid,
                    to: newGroup.uuid
                  });
                }
              }
              newGroup.select();
              newGroup.showInOutliner();
            }
            this._markerVersion++;
            refreshOutlinerIcons2();
            Blockbench.dispatchEvent("update_selection");
            log2.info("migrateInteractBoxBone: \u9AA8\u9ABC\u8FC1\u79FB\u5B8C\u6210", { from: oldBoneName, to: newBoneName });
          }
        },
        mounted: function() {
          var self = this;
          log2.debug("Vue \u7EC4\u4EF6 mounted");
          function initFromProject() {
            if (!Project || Project === 0) {
              log2.debug("initFromProject: \u9879\u76EE\u5C1A\u672A\u6253\u5F00");
              return false;
            }
            self.loadConfigData();
            self.onSelectionChange();
            log2.debug("initFromProject: \u9879\u76EE\u521D\u59CB\u5316\u5B8C\u6210");
            return true;
          }
          if (!initFromProject()) {
            this.$nextTick(function() {
              log2.debug("$nextTick: \u91CD\u8BD5\u9879\u76EE\u521D\u59CB\u5316");
              initFromProject();
            });
          }
          this._projectHandler = Blockbench.on("select_project", function() {
            log2.debug("\u4E8B\u4EF6: select_project");
            self.loadConfigData();
            self.onSelectionChange();
          });
          this._selectionHandler = Blockbench.on("update_selection", function() {
            self.onSelectionChange();
          });
          this._modeHandler = Blockbench.on("select_mode", function(event) {
            var modeId = event && event.mode && event.mode.id || "";
            log2.debug("\u4E8B\u4EF6: select_mode", { modeId, raw: event });
            if (modeId === "machine_max_part") {
              self.loadConfigData();
              self.onSelectionChange();
              var cfg = getConfig();
              if (cfg && (!cfg.contentPackPath || cfg.contentPackPath === "")) {
                log2.info("select_mode: \u5185\u5BB9\u5305\u8DEF\u5F84\u672A\u8BBE\u7F6E\uFF0C\u89E6\u53D1\u8BBE\u7F6E\u5411\u5BFC");
                var dialog = require_pack_setup_dialog();
                dialog.showPackSetupDialog(cfg, function(updatedConfig) {
                  self.loadConfigData();
                });
              }
            }
          });
          this._saveHandler = Blockbench.on("save", function() {
            log2.debug("\u4E8B\u4EF6: save \u2014 \u4FDD\u5B58\u914D\u7F6E");
            saveConfig();
          });
          log2.debug("Vue \u7EC4\u4EF6\u6302\u8F7D\u5B8C\u6210\uFF0C\u5DF2\u6CE8\u518C\u4E8B\u4EF6\u76D1\u542C");
        },
        beforeDestroy: function() {
          log2.debug("Vue \u7EC4\u4EF6 beforeDestroy \u2014 \u6E05\u7406\u4E8B\u4EF6\u76D1\u542C");
          if (this._projectHandler) {
            this._projectHandler();
            log2.debug("\u5DF2\u79FB\u9664 select_project \u76D1\u542C");
          }
          if (this._selectionHandler) {
            this._selectionHandler();
            log2.debug("\u5DF2\u79FB\u9664 update_selection \u76D1\u542C");
          }
          if (this._modeHandler) {
            this._modeHandler();
            log2.debug("\u5DF2\u79FB\u9664 select_mode \u76D1\u542C");
          }
          if (this._saveHandler) {
            this._saveHandler();
            log2.debug("\u5DF2\u79FB\u9664 save \u76D1\u542C");
          }
        }
      });
      if (typeof module !== "undefined" && module.exports) {
        module.exports = MMMainPanel;
      }
    }
  });

  // src/lib/signal_graph.js
  var require_signal_graph = __commonJS({
    "src/lib/signal_graph.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var subsystemTypes = require_subsystem_types();
      function extractSignalGraph(variant) {
        var nodes = [];
        var edges = [];
        var nodeMap = {};
        if (!variant || !variant.sub_parts) return { nodes: [], edges: [] };
        for (var spKey in variant.sub_parts) {
          var sp = variant.sub_parts[spKey];
          if (!sp) continue;
          if (sp.connectors) {
            for (var connKey in sp.connectors) {
              var conn = sp.connectors[connKey];
              if (!conn) continue;
              if (!nodeMap[connKey]) {
                nodeMap[connKey] = true;
                nodes.push({
                  id: connKey,
                  type: "connector",
                  subPart: spKey,
                  label: _shortName(connKey),
                  locator: conn.locator || ""
                });
              }
            }
          }
          if (sp.subsystems) {
            for (var ssKey in sp.subsystems) {
              var ss = sp.subsystems[ssKey];
              if (!ss) continue;
              if (!nodeMap[ssKey]) {
                nodeMap[ssKey] = true;
                nodes.push({
                  id: ssKey,
                  type: "subsystem",
                  subPart: spKey,
                  label: _shortName(ssKey),
                  subType: ss.type || ""
                });
              }
            }
          }
          if (sp.interact_boxes) {
            for (var ibKey in sp.interact_boxes) {
              var ib = sp.interact_boxes[ibKey];
              if (!ib) continue;
              if (!nodeMap[ibKey]) {
                nodeMap[ibKey] = true;
                nodes.push({
                  id: ibKey,
                  type: "interact_box",
                  subPart: spKey,
                  label: _shortName(ibKey)
                });
              }
            }
          }
        }
        var seenSpecialTargets = {};
        for (var spKey in variant.sub_parts) {
          var sp = variant.sub_parts[spKey];
          if (!sp) continue;
          if (sp.connectors) {
            for (var connKey in sp.connectors) {
              var conn = sp.connectors[connKey];
              if (!conn) continue;
              if (conn.signal_targets) {
                for (var channel in conn.signal_targets) {
                  var targets = conn.signal_targets[channel];
                  if (!targets || !Array.isArray(targets)) continue;
                  for (var ti = 0; ti < targets.length; ti++) {
                    var tgt = targets[ti];
                    if (!tgt) continue;
                    _ensureTargetNode(tgt, nodeMap, nodes, seenSpecialTargets, spKey);
                    edges.push({ from: connKey, to: tgt, channel, type: "signal" });
                  }
                }
              }
              if (conn.power_target) {
                var pt = conn.power_target;
                _ensureTargetNode(pt, nodeMap, nodes, seenSpecialTargets, spKey);
                edges.push({ from: connKey, to: pt, channel: "power", type: "power" });
              }
            }
          }
          if (sp.interact_boxes) {
            for (var ibKey in sp.interact_boxes) {
              var ib = sp.interact_boxes[ibKey];
              if (!ib) continue;
              if (ib.signal_targets) {
                for (var ibChannel in ib.signal_targets) {
                  var ibTargets = ib.signal_targets[ibChannel];
                  if (!ibTargets || !Array.isArray(ibTargets)) continue;
                  for (var iti = 0; iti < ibTargets.length; iti++) {
                    var ibTgt = ibTargets[iti];
                    if (!ibTgt) continue;
                    _ensureTargetNode(ibTgt, nodeMap, nodes, seenSpecialTargets, spKey);
                    edges.push({ from: ibKey, to: ibTgt, channel: ibChannel, type: "signal" });
                  }
                }
              }
            }
          }
          if (sp.subsystems) {
            for (var ssKey in sp.subsystems) {
              var ss = sp.subsystems[ssKey];
              if (!ss) continue;
              var outputFields = _getSignalOutputFields(ss);
              for (var fi = 0; fi < outputFields.length; fi++) {
                var field = outputFields[fi];
                var val = ss[field];
                if (!val) continue;
                if (typeof val === "string") {
                  if (val) {
                    _ensureTargetNode(val, nodeMap, nodes, seenSpecialTargets, spKey);
                    edges.push({ from: ssKey, to: val, channel: field, type: _edgeTypeForField(field) });
                  }
                } else if (typeof val === "object" && !Array.isArray(val)) {
                  for (var ch in val) {
                    var tgts = val[ch];
                    if (tgts === void 0 || tgts === null) continue;
                    if (Array.isArray(tgts)) {
                      for (var tji = 0; tji < tgts.length; tji++) {
                        var t = tgts[tji];
                        if (!t) continue;
                        _ensureTargetNode(t, nodeMap, nodes, seenSpecialTargets, spKey);
                        edges.push({ from: ssKey, to: t, channel: ch, type: _edgeTypeForField(field) });
                      }
                    } else if (typeof tgts === "string") {
                      _ensureTargetNode(tgts, nodeMap, nodes, seenSpecialTargets, spKey);
                      edges.push({ from: ssKey, to: tgts, channel: ch, type: _edgeTypeForField(field) });
                    } else if (typeof tgts === "number") {
                      _ensureTargetNode(ch, nodeMap, nodes, seenSpecialTargets, spKey);
                      edges.push({ from: ssKey, to: ch, channel: field, type: _edgeTypeForField(field) });
                    }
                  }
                }
              }
            }
          }
        }
        return { nodes, edges };
      }
      function _ensureTargetNode(target, nodeMap, nodes, seenSpecialTargets, currentSpKey) {
        if (!target) return;
        if (nodeMap[target]) return;
        if (target === "subpart" || target === "vehicle") {
          if (!seenSpecialTargets[target]) {
            seenSpecialTargets[target] = true;
            nodeMap[target] = true;
            nodes.push({
              id: target,
              type: "special",
              subPart: currentSpKey,
              label: target
            });
          }
          return;
        }
        nodeMap[target] = true;
        nodes.push({
          id: target,
          type: "unresolved",
          subPart: currentSpKey,
          label: _shortName(target)
        });
      }
      function _getSignalOutputFields(ss) {
        var typeId = ss.type;
        if (typeId) {
          var fields = subsystemTypes.getDynamicFields(typeId);
          if (fields && fields.length > 0) {
            var result = [];
            for (var i = 0; i < fields.length; i++) {
              var f = fields[i];
              if (f.editor === "signal_targets" || f.editor === "power_target" || f.editor === "power_outputs_map") {
                if (ss[f.field] !== void 0 && ss[f.field] !== null) {
                  result.push(f.field);
                }
              }
            }
            return result;
          }
        }
        var knownOutputs = [
          "power_output",
          "power_outputs",
          "control_outputs",
          "speed_outputs",
          "throttle_outputs",
          "brake_outputs",
          "steering_outputs",
          "handbrake_outputs",
          "gear_outputs",
          "move_outputs",
          "regular_outputs",
          "aim_outputs",
          "passenger_num_outputs"
        ];
        var result = [];
        for (var i = 0; i < knownOutputs.length; i++) {
          if (ss[knownOutputs[i]] !== void 0 && ss[knownOutputs[i]] !== null) {
            result.push(knownOutputs[i]);
          }
        }
        return result;
      }
      function _edgeTypeForField(field) {
        if (field === "power_output" || field === "power_outputs") return "power";
        if (field === "speed_outputs" || field === "speed_output") return "speed";
        return "control";
      }
      function _shortName(fullKey) {
        if (!fullKey) return "";
        var parts = fullKey.split(".");
        if (parts.length <= 1) {
          return fullKey.length > 16 ? fullKey.substring(0, 14) + "\u2026" : fullKey;
        }
        var last = parts[parts.length - 1];
        if (last.length > 18) return last.substring(0, 16) + "\u2026";
        return last;
      }
      function forceLayout(nodes, edges, options) {
        if (!nodes || nodes.length === 0) return nodes || [];
        var opts = options || {};
        var width = opts.width || 800;
        var height = opts.height || 400;
        var repulsion = opts.repulsion || 7e3;
        var attraction = opts.attraction || 4e-3;
        var idealLength = opts.idealLength || 280;
        var iterations = opts.iterations || 100;
        var damping = opts.damping || 0.82;
        var NODE_MIN_DIST = 50;
        for (var i = 0; i < nodes.length; i++) {
          var n = nodes[i];
          if (n.x === void 0 || n.y === void 0) {
            var angle = i / nodes.length * Math.PI * 2;
            var radius = Math.min(width, height) * 0.35;
            n.x = width / 2 + Math.cos(angle) * radius * (0.5 + Math.random() * 0.5);
            n.y = height / 2 + Math.sin(angle) * radius * (0.5 + Math.random() * 0.5);
          }
          n.vx = 0;
          n.vy = 0;
        }
        var nodeCount = nodes.length;
        var edgeMap = {};
        for (var ei = 0; ei < edges.length; ei++) {
          var e = edges[ei];
          if (!edgeMap[e.from]) edgeMap[e.from] = {};
          if (!edgeMap[e.to]) edgeMap[e.to] = {};
          edgeMap[e.from][e.to] = true;
          edgeMap[e.to][e.from] = true;
        }
        for (var iter = 0; iter < iterations; iter++) {
          for (var ai = 0; ai < nodeCount; ai++) {
            for (var aj = ai + 1; aj < nodeCount; aj++) {
              var na = nodes[ai];
              var nb = nodes[aj];
              var dx = nb.x - na.x;
              var dy = nb.y - na.y;
              var dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < NODE_MIN_DIST) dist = NODE_MIN_DIST;
              var force = repulsion / (dist * dist);
              var fx = force * (dx / dist);
              var fy = force * (dy / dist);
              na.vx -= fx;
              na.vy -= fy;
              nb.vx += fx;
              nb.vy += fy;
            }
          }
          for (var eji = 0; eji < edges.length; eji++) {
            var edge = edges[eji];
            var src = _findNode(nodes, edge.from);
            var tgt = _findNode(nodes, edge.to);
            if (!src || !tgt) continue;
            var ex = tgt.x - src.x;
            var ey = tgt.y - src.y;
            var ed = Math.sqrt(ex * ex + ey * ey);
            if (ed < 1) ed = 1;
            var springForce = attraction * (ed - idealLength);
            var sfx = springForce * (ex / ed);
            var sfy = springForce * (ey / ed);
            src.vx += sfx;
            src.vy += sfy;
            tgt.vx -= sfx;
            tgt.vy -= sfy;
          }
          var cx = width / 2;
          var cy = height / 2;
          for (var ci = 0; ci < nodeCount; ci++) {
            var nc = nodes[ci];
            nc.vx += (cx - nc.x) * 2e-3;
            nc.vy += (cy - nc.y) * 2e-3;
          }
          var margin = 30;
          for (var ui = 0; ui < nodeCount; ui++) {
            var nu = nodes[ui];
            nu.vx *= damping;
            nu.vy *= damping;
            nu.x += nu.vx;
            nu.y += nu.vy;
            nu.x = Math.max(margin, Math.min(width - margin, nu.x));
            nu.y = Math.max(margin, Math.min(height - margin, nu.y));
          }
        }
        for (var cli = 0; cli < nodeCount; cli++) {
          delete nodes[cli].vx;
          delete nodes[cli].vy;
        }
        return nodes;
      }
      function _findNode(nodes, id) {
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].id === id) return nodes[i];
        }
        return null;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          extractSignalGraph,
          forceLayout,
          _shortName
        };
      }
    }
  });

  // src/ui/SignalFlowPanel.vue.js
  var require_SignalFlowPanel_vue = __commonJS({
    "src/ui/SignalFlowPanel.vue.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { getConfig, loadConfig } = require_persistence();
      var { extractSignalGraph, forceLayout } = require_signal_graph();
      var { getTypeColor } = require_subsystem_types();
      var ssTypes = require_subsystem_types();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("SignalFlow");
      Vue.component("mm-signal-flow-panel", {
        template: true ? `<div class="mm-signal-flow" v-if="config">
    <div class="mm-signal-flow-header">
        <div class="mm-signal-flow-title">
            <span class="mm-flow-icon">\u2B21</span>
            \u4FE1\u53F7\u6D41\u56FE
        </div>
        <div class="mm-signal-flow-meta" v-if="hasActiveSelection">
            <span class="mm-flow-meta-item">{{ activePartId }}</span>
            <span class="mm-flow-meta-sep">/</span>
            <span class="mm-flow-meta-item">{{ activeVariantName }}</span>
            <span class="mm-flow-meta-sep">|</span>
            <span class="mm-flow-meta-item" title="\u8282\u70B9\u6570">{{ numNodes }} \u8282\u70B9</span>
            <span class="mm-flow-meta-sep">\xB7</span>
            <span class="mm-flow-meta-item" title="\u8FB9\u6570">{{ numEdges }} \u8FB9</span>
        </div>
        <div class="mm-signal-flow-actions" v-if="hasGraph">
            <button class="mm-btn mm-btn-sm" @click="onRelayout" title="\u91CD\u65B0\u5E03\u5C40">\u27F3 \u91CD\u6392</button>
        </div>
    </div>

    <div class="mm-signal-flow-body">
        <!-- SVG \u62D3\u6251\u56FE -->
        <div class="mm-flow-canvas" v-if="hasGraph"
            @mousedown="onPanStart"
            @mousemove="onPanMove"
            @mouseup="onPanEnd"
            @mouseleave="onPanEnd">
            <svg :width="svgWidth" :height="svgHeight"
                @wheel.prevent="onWheel"
                style="display:block;cursor:grab;background:#1a1a2e;border-radius:6px">
                <defs>
                    <!-- \u8282\u70B9\u6295\u5F71\u9634\u5F71 -->
                    <filter id="mm-flow-shadow" x="-10%" y="-10%" width="130%" height="130%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.4" />
                    </filter>
                    <!-- \u60AC\u505C\u53D1\u5149\u9634\u5F71 -->
                    <filter id="mm-flow-shadow-hover" x="-20%" y="-20%" width="150%" height="150%">
                        <feDropShadow dx="0" dy="2" stdDeviation="5" flood-color="#fff" flood-opacity="0.25" />
                    </filter>
                    <!-- \u666E\u901A\u7BAD\u5934 -->
                    <marker id="mm-flow-arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
                        <polygon points="0 0, 10 4, 0 8" fill="#888" />
                    </marker>
                    <!-- \u52A8\u529B\u7BAD\u5934\uFF08\u6A59\u8272\uFF09 -->
                    <marker id="mm-flow-arrow-power" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
                        <polygon points="0 0, 10 4, 0 8" fill="#e67e22" />
                    </marker>
                    <!-- \u8F6C\u901F\u7BAD\u5934\uFF08\u84DD\u8272\uFF09 -->
                    <marker id="mm-flow-arrow-speed" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
                        <polygon points="0 0, 10 4, 0 8" fill="#3498db" />
                    </marker>
                    <!-- \u63A7\u5236\u7BAD\u5934\uFF08\u7EFF\u8272\uFF09 -->
                    <marker id="mm-flow-arrow-control" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
                        <polygon points="0 0, 10 4, 0 8" fill="#2ecc71" />
                    </marker>
                </defs>
                <g :transform="'translate('+panX+','+panY+') scale('+zoom+')'">
                    <!-- \u8FDE\u7EBF\u5C42 -->
                    <g class="mm-flow-edges">
                        <g v-for="(edge, ei) in layoutEdges" :key="'e'+ei">
                            <path :d="computeEdgePath(edge)"
                                :stroke="edgeColor(edge)"
                                :stroke-width="hoveredEdge === edge ? 3 : 1.5"
                                :marker-end="'url(#mm-flow-arrow-' + edge.type + ')'"
                                fill="none" stroke-opacity="0.7"
                                :class="{ 'mm-flow-edge-hovered': hoveredEdge === edge }"
                                @mouseenter="hoveredEdge = edge"
                                @mouseleave="hoveredEdge = null"
                                style="cursor:pointer" />
                            <!-- \u9891\u9053\u540D\u6807\u7B7E -->
                            <text :x="edgeLabelPos(edge).x" :y="edgeLabelPos(edge).y"
                                :fill="edgeColor(edge)"
                                :font-size="hoveredEdge === edge ? 11 : 9"
                                text-anchor="middle"
                                :font-weight="hoveredEdge === edge ? 'bold' : 'normal'"
                                style="pointer-events:none;user-select:none">
                                {{ edge.channel }}
                            </text>
                        </g>
                    </g>
                    <!-- \u8282\u70B9\u5C42 -->
                    <g class="mm-flow-nodes">
                        <g v-for="(node, ni) in layoutNodes" :key="'n'+ni"
                            :transform="'translate(' + node.x + ',' + node.y + ')'"
                            @click="onNodeClick(node)"
                            @mouseenter="hoveredNode = node"
                            @mouseleave="hoveredNode = null"
                            style="cursor:pointer">
                            <!-- \u7279\u7279\u6B8A\u76EE\u6807\u7528\u7EBF\u6846 -->
                            <rect v-if="node.type === 'special'"
                                width="140" height="32" rx="6"
                                :fill="nodeColor(node)" fill-opacity="0.15"
                                :stroke="nodeColor(node)" stroke-width="1.5"
                                stroke-dasharray="4,3"
                                :class="{ 'mm-flow-node-hovered': hoveredNode === node }" />
                            <!-- \u672A\u89E3\u6790\u76EE\u6807\u7528\u865A\u7EBF -->
                            <rect v-else-if="node.type === 'unresolved'"
                                width="140" height="32" rx="6"
                                :fill="nodeColor(node)" fill-opacity="0.2"
                                :stroke="nodeColor(node)" stroke-width="1"
                                stroke-dasharray="3,2"
                                :class="{ 'mm-flow-node-hovered': hoveredNode === node }" />
                            <!-- \u666E\u901A\u8282\u70B9 -->
                            <rect v-else
                                width="140" height="32" rx="6"
                                :fill="nodeColor(node)" fill-opacity="0.85"
                                stroke="#fff" stroke-width="0.5"
                                filter="url(#mm-flow-shadow)"
                                :class="{ 'mm-flow-node-hovered': hoveredNode === node }" />
                            <!-- \u60AC\u505C\u9AD8\u4EAE\u5149\u6655\uFF08\u53E0\u52A0\u5C42\uFF09 -->
                            <rect v-if="hoveredNode === node"
                                width="144" height="36" rx="8" x="-2" y="-2"
                                fill="none" stroke="#fff" stroke-width="1.5" stroke-opacity="0.4"
                                filter="url(#mm-flow-shadow-hover)" />
                            <!-- \u7AEF\u53E3\u5C0F\u5706\u5708\uFF08\u8F93\u51FA=\u6A59\u8272\uFF0C\u8F93\u5165=\u7EFF\u8272\uFF09 -->
                            <g v-if="node._ports">
                                <circle v-for="(p, pi) in node._ports" :key="'p'+pi"
                                    :cx="portX(p.port)" :cy="portY(p.port)" r="4"
                                    :fill="p.isOutput ? '#e67e22' : '#2ecc71'"
                                    stroke="#1a1a2e" stroke-width="1" />
                            </g>
                            <!-- \u8282\u70B9\u6807\u7B7E -->
                            <text x="70" y="20"
                                fill="#fff" font-size="11"
                                text-anchor="middle" style="pointer-events:none;user-select:none"
                                :font-weight="hoveredNode === node ? 'bold' : 'normal'">
                                {{ node.label }}
                            </text>
                            <!-- \u60AC\u505C Tooltip -->
                            <title>{{ nodeTooltip(node) }}</title>
                        </g>
                    </g>
                </g>
            </svg>
        </div>

        <!-- \u7A7A\u56FE\u72B6\u6001\uFF1A\u6709\u914D\u7F6E\u4F46\u65E0\u4FE1\u53F7\u62D3\u6251 -->
        <div class="mm-signal-flow-empty" v-else-if="hasEmptyGraph">
            <div class="mm-flow-placeholder-text">\u5F53\u524D\u96F6\u4EF6\u53D8\u4F53\u4E2D\u6CA1\u6709\u4FE1\u53F7\u8DEF\u7531\u914D\u7F6E</div>
            <p class="mm-flow-placeholder-hint">\u5728\u8FDE\u63A5\u70B9\u9762\u677F\u4E2D\u914D\u7F6E signal_targets\uFF0C\u6216\u5728\u5B50\u7CFB\u7EDF\u4E2D\u914D\u7F6E\u4FE1\u53F7\u8F93\u51FA\u540E\uFF0C\u6B64\u5904\u5C06\u663E\u793A\u4FE1\u53F7\u6D41\u5411\u56FE</p>
        </div>

        <!-- \u672A\u9009\u4E2D\u96F6\u4EF6\u65F6 -->
        <div class="mm-signal-flow-empty" v-else>
            <p>\u8BF7\u9009\u62E9\u6216\u65B0\u5EFA\u4E00\u4E2A\u96F6\u4EF6</p>
        </div>
    </div>

    <!-- \u56FE\u4F8B -->
    <div class="mm-signal-flow-legend" v-if="hasGraph">
        <span class="mm-flow-legend-item" title="\u8FDE\u63A5\u70B9"><span class="mm-flow-legend-dot" style="background:#3AA83A"></span>\u8FDE\u63A5\u70B9</span>
        <span class="mm-flow-legend-item" title="\u4EA4\u4E92\u533A\uFF08\u73A9\u5BB6\u53EF\u4EA4\u4E92\u533A\u57DF\uFF09"><span class="mm-flow-legend-dot" style="background:#D9A441"></span>\u4EA4\u4E92\u533A</span>
        <span class="mm-flow-legend-item" title="\u5B50\u7CFB\u7EDF\uFF08\u6309\u7C7B\u578B\u7740\u8272\uFF09"><span class="mm-flow-legend-dot" style="background:#4A90D9"></span>\u5B50\u7CFB\u7EDF</span>
        <span class="mm-flow-legend-item" title="\u7279\u6B8A\u76EE\u6807\uFF08subpart/vehicle\uFF09"><span class="mm-flow-legend-dot" style="background:#666;opacity:0.5"></span>\u7279\u6B8A\u76EE\u6807</span>
        <span class="mm-flow-legend-item" title="\u4FE1\u53F7/\u63A7\u5236\u4FE1\u53F7"><span class="mm-flow-legend-line" style="background:#7f8c8d"></span>\u4FE1\u53F7</span>
        <span class="mm-flow-legend-item" title="\u52A8\u529B\u4F20\u8F93"><span class="mm-flow-legend-line" style="background:#e67e22"></span>\u52A8\u529B</span>
        <span class="mm-flow-legend-item" title="\u8F6C\u901F\u4FE1\u53F7"><span class="mm-flow-legend-line" style="background:#3498db"></span>\u8F6C\u901F</span>
        <span class="mm-flow-legend-item" title="\u63A7\u5236\u4FE1\u53F7"><span class="mm-flow-legend-line" style="background:#2ecc71"></span>\u63A7\u5236</span>
    </div>
</div>
<div class="mm-signal-flow mm-signal-flow-empty" v-else>
    <p>\u6B63\u5728\u52A0\u8F7D\u914D\u7F6E...</p>
</div>` : '<div class="mm-signal-flow"><p>\u4FE1\u53F7\u6D41\u56FE\u52A0\u8F7D\u4E2D...</p></div>',
        data: function() {
          return {
            config: null,
            activePartId: "",
            activeVariantName: "",
            // 拓扑图状态
            nodes: [],
            edges: [],
            hoveredNode: null,
            hoveredEdge: null,
            // 画布变换
            panX: 0,
            panY: 0,
            zoom: 1,
            isPanning: false,
            panStartX: 0,
            panStartY: 0,
            panStartPanX: 0,
            panStartPanY: 0
          };
        },
        computed: {
          hasActiveSelection: function() {
            return !!(this.activePartId && this.activeVariantName);
          },
          currentPart: function() {
            if (!this.config || !this.activePartId) return null;
            return this.config.parts[this.activePartId] || null;
          },
          currentVariant: function() {
            if (!this.currentPart || !this.activeVariantName) return null;
            return this.currentPart.variants[this.activeVariantName] || null;
          },
          numNodes: function() {
            return this.nodes.length;
          },
          numEdges: function() {
            return this.edges.length;
          },
          svgWidth: function() {
            return 800;
          },
          svgHeight: function() {
            return 420;
          },
          hasEmptyGraph: function() {
            return this.hasActiveSelection && this.nodes.length === 0 && this.edges.length === 0;
          },
          hasGraph: function() {
            return this.nodes.length > 0;
          },
          layoutNodes: function() {
            return this.nodes;
          },
          layoutEdges: function() {
            return this.edges;
          }
        },
        methods: {
          loadConfigData: function() {
            var cfg = getConfig();
            if (!cfg) cfg = loadConfig();
            this.config = cfg;
            if (cfg) {
              this.activePartId = cfg._uiState?.activePartId || "";
              this.activeVariantName = cfg._uiState?.activeVariantName || "";
              log2.info("loadConfigData: \u914D\u7F6E\u5DF2\u52A0\u8F7D", {
                partId: this.activePartId,
                variant: this.activeVariantName,
                hasParts: !!cfg.parts,
                partCount: cfg.parts ? Object.keys(cfg.parts).length : 0
              });
            } else {
              log2.warn("loadConfigData: \u65E0\u6709\u6548\u914D\u7F6E");
            }
            this.rebuildGraph();
          },
          onSelectionChange: function() {
          },
          /**
           * 根据当前变体重建信号拓扑图（数据提取 → 力导向布局）
           */
          rebuildGraph: function() {
            var variant = this.currentVariant;
            if (!variant) {
              log2.info("rebuildGraph: \u65E0\u6709\u6548\u53D8\u4F53\uFF0C\u6E05\u7A7A\u56FE\u8868");
              this.nodes = [];
              this.edges = [];
              return;
            }
            var graph = extractSignalGraph(variant);
            log2.info("rebuildGraph: \u4FE1\u53F7\u62D3\u6251\u63D0\u53D6\u5B8C\u6210", {
              nodes: graph.nodes.length,
              edges: graph.edges.length
            });
            forceLayout(graph.nodes, graph.edges, {
              width: this.svgWidth,
              height: this.svgHeight,
              iterations: 80
            });
            _assignPortRoles(graph.nodes, graph.edges);
            this.nodes = graph.nodes;
            this.edges = graph.edges;
          },
          /**
           * 获取节点的 SVG 填充颜色
           */
          nodeColor: function(node) {
            if (!node) return "#555";
            switch (node.type) {
              case "connector":
                return "#3AA83A";
              case "interact_box":
                return "#D9A441";
              case "subsystem":
                if (node.subType) return getTypeColor(node.subType) || "#4A90D9";
                return "#4A90D9";
              case "special":
                return "#666";
              case "unresolved":
                return "#555";
              default:
                return "#555";
            }
          },
          /**
           * 获取节点类型的中文名
           */
          nodeTypeLabel: function(node) {
            if (!node) return "";
            switch (node.type) {
              case "connector":
                return "\u8FDE\u63A5\u70B9";
              case "interact_box":
                return "\u4EA4\u4E92\u533A";
              case "subsystem":
                if (node.subType) {
                  var meta = ssTypes.getTypeMeta(node.subType);
                  return meta ? meta.displayName : node.subType;
                }
                return "\u5B50\u7CFB\u7EDF";
              case "special":
                return "\u7279\u6B8A\u76EE\u6807";
              case "unresolved":
                return "\u672A\u89E3\u6790\u76EE\u6807";
              default:
                return "\u8282\u70B9";
            }
          },
          /**
           * 获取边的颜色
           */
          edgeColor: function(edge) {
            if (!edge) return "#555";
            switch (edge.type) {
              case "power":
                return "#e67e22";
              case "speed":
                return "#3498db";
              case "signal":
                return "#7f8c8d";
              case "control":
                return "#2ecc71";
              default:
                return "#7f8c8d";
            }
          },
          /**
           * 获取边的类型中文名
           */
          edgeTypeLabel: function(edge) {
            if (!edge) return "";
            switch (edge.type) {
              case "power":
                return "\u52A8\u529B";
              case "speed":
                return "\u8F6C\u901F";
              case "signal":
                return "\u4FE1\u53F7";
              case "control":
                return "\u63A7\u5236";
              default:
                return "\u8FDE\u63A5";
            }
          },
          /**
           * 获取端口相对节点的偏移坐标（8端口模型）
           * 垂直边(左/右)的端口平行偏移方向为垂直；水平边(上/下)的端口平行偏移方向为水平
           * @param {string} port - 'right-out'|'right-in'|'bottom-out'|'bottom-in'|'left-out'|'left-in'|'top-out'|'top-in'
           * @param {number} index - 该端口上第几条边（0-based），用于平行偏移
           * @returns {{x: number, y: number}}
           */
          _portOffset: function(port, index) {
            var NODE_W = 140;
            var NODE_H = 32;
            var isOutput = port && port.indexOf("-out") >= 0;
            var offset = (isOutput ? 0 : index || 0) * 6;
            switch (port) {
              case "right-out":
                return { x: NODE_W, y: 10 };
              case "right-in":
                return { x: NODE_W, y: 21 + offset };
              case "left-in":
                return { x: 0, y: 10 + offset };
              case "left-out":
                return { x: 0, y: 21 };
              case "bottom-in":
                return { x: 46 + offset, y: NODE_H };
              case "bottom-out":
                return { x: 93, y: NODE_H };
              case "top-out":
                return { x: 46, y: 0 };
              case "top-in":
                return { x: 93 + offset, y: 0 };
              default:
                return { x: NODE_W, y: 10 };
            }
          },
          /**
           * 端口小圆圈的 X 坐标（相对节点左上角，模板用 v-for 调用）
           * 8端口模型：左/右侧端口在边两端(0/140)，上/下端口中输出偏左(46)输入偏右(93)
           */
          portX: function(port) {
            switch (port) {
              case "right-out":
              case "right-in":
                return 140;
              case "left-in":
              case "left-out":
                return 0;
              case "top-out":
              case "bottom-in":
                return 46;
              case "top-in":
              case "bottom-out":
                return 93;
              default:
                return 0;
            }
          },
          /**
           * 端口小圆圈的 Y 坐标（相对节点左上角）
           * 8端口模型：左/右侧端口输出偏上(10)输入偏下(21)，上/下端口在边两端(0/32)
           */
          portY: function(port) {
            switch (port) {
              case "right-out":
              case "left-in":
                return 10;
              case "right-in":
              case "left-out":
                return 21;
              case "top-out":
              case "top-in":
                return 0;
              case "bottom-in":
              case "bottom-out":
                return 32;
              default:
                return 0;
            }
          },
          /**
           * 获取端口法线方向（控制点延伸方向）：法线总是朝节点外
           * 支持8端口：right-out/right-in 朝右，bottom-out/bottom-in 朝下，
           *           left-out/left-in 朝左，top-out/top-in 朝上
           */
          _portNormal: function(port) {
            switch (port) {
              case "right-out":
              case "right-in":
                return { x: 1, y: 0 };
              case "bottom-out":
              case "bottom-in":
                return { x: 0, y: 1 };
              case "left-out":
              case "left-in":
                return { x: -1, y: 0 };
              case "top-out":
              case "top-in":
                return { x: 0, y: -1 };
              default:
                return { x: 1, y: 0 };
            }
          },
          /**
           * 计算两个节点之间的连线路径（贝塞尔曲线，按端口分派）
           * 控制点沿端口法线方向延伸，支持8方向端口
           */
          computeEdgePath: function(edge) {
            var src = this._findNode(edge.from);
            var tgt = this._findNode(edge.to);
            if (!src || !tgt) return "";
            var sp = this._portOffset(edge._srcPort || "right-out", edge._srcIdx || 0);
            var tp = this._portOffset(edge._tgtPort || "left-in", edge._tgtIdx || 0);
            var x1 = src.x + sp.x;
            var y1 = src.y + sp.y;
            var x2 = tgt.x + tp.x;
            var y2 = tgt.y + tp.y;
            var dx = x2 - x1;
            var dy = y2 - y1;
            var cpLen = Math.max(40, Math.abs(dx) * 0.4, Math.abs(dy) * 0.4);
            var sn = this._portNormal(edge._srcPort || "right-out");
            var tn = this._portNormal(edge._tgtPort || "left-in");
            var cpx1 = x1 + sn.x * cpLen;
            var cpy1 = y1 + sn.y * cpLen;
            var cpx2 = x2 + tn.x * cpLen;
            var cpy2 = y2 + tn.y * cpLen;
            return "M" + x1.toFixed(1) + "," + y1.toFixed(1) + " C" + cpx1.toFixed(1) + "," + cpy1.toFixed(1) + " " + cpx2.toFixed(1) + "," + cpy2.toFixed(1) + " " + x2.toFixed(1) + "," + y2.toFixed(1);
          },
          /**
           * 计算连线标签位置（贝塞尔曲线中点，使用三次贝塞尔 t=0.5 精确公式）
           */
          edgeLabelPos: function(edge) {
            var src = this._findNode(edge.from);
            var tgt = this._findNode(edge.to);
            if (!src || !tgt) return { x: 0, y: 0 };
            var sp = this._portOffset(edge._srcPort || "right-out", edge._srcIdx || 0);
            var tp = this._portOffset(edge._tgtPort || "left-in", edge._tgtIdx || 0);
            var x1 = src.x + sp.x;
            var y1 = src.y + sp.y;
            var x2 = tgt.x + tp.x;
            var y2 = tgt.y + tp.y;
            var dx = x2 - x1;
            var dy = y2 - y1;
            var cpLen = Math.max(40, Math.abs(dx) * 0.4, Math.abs(dy) * 0.4);
            var sn = this._portNormal(edge._srcPort || "right-out");
            var tn = this._portNormal(edge._tgtPort || "left-in");
            var cpx1 = x1 + sn.x * cpLen;
            var cpy1 = y1 + sn.y * cpLen;
            var cpx2 = x2 + tn.x * cpLen;
            var cpy2 = y2 + tn.y * cpLen;
            var mx = (x1 + 3 * cpx1 + 3 * cpx2 + x2) / 8;
            var my = (y1 + 3 * cpy1 + 3 * cpy2 + y2) / 8;
            return { x: mx, y: my - 12 };
          },
          /**
           * 在数组中按 id 查找节点
           */
          _findNode: function(id) {
            var nodes = this.nodes;
            for (var i = 0; i < nodes.length; i++) {
              if (nodes[i].id === id) return nodes[i];
            }
            return null;
          },
          /**
           * 显示节点完整信息（悬停 tooltip 用）
           */
          nodeTooltip: function(node) {
            if (!node) return "";
            var lines = [node.id];
            lines.push("\u7C7B\u578B: " + this.nodeTypeLabel(node));
            lines.push("\u6240\u5C5E: " + node.subPart);
            if (node.locator) lines.push("locator: " + node.locator);
            if (node.subType) lines.push("subType: " + node.subType);
            return lines.join("\n");
          },
          /**
           * 点击节点 → 导航到对应属性面板
           * 子系统 → 设置 subsystemSelection 触发子系统面板
           * 连接点 → 选中对应的 Locator
           * 交互区 → 选中对应的 Group（Outliner 中高亮）
           */
          onNodeClick: function(node) {
            if (!node) return;
            if (node.type === "subsystem") {
              var cfg = getConfig();
              if (cfg && cfg._uiState) {
                cfg._uiState._pendingSubsystemNav = { spKey: node.subPart, subsystemKey: node.id };
              }
              Blockbench.dispatchEvent("update_selection");
            } else if (node.type === "connector") {
              var locName = node.locator;
              if (locName && typeof Locator !== "undefined") {
                var loc = Locator.all.find(function(l) {
                  return l.name === locName;
                });
                if (loc) {
                  loc.select();
                  loc.showInOutliner();
                  Blockbench.dispatchEvent("update_selection");
                }
              }
            } else if (node.type === "interact_box") {
              var variant = this.currentVariant;
              if (variant && variant.sub_parts && variant.sub_parts[node.subPart]) {
                var sp = variant.sub_parts[node.subPart];
                if (sp.interact_boxes && sp.interact_boxes[node.id]) {
                  var ibCfg = sp.interact_boxes[node.id];
                  var ibUuid = ibCfg._uuid;
                  if (ibUuid && typeof Group !== "undefined") {
                    var groups = Group.all;
                    for (var gi = 0; gi < groups.length; gi++) {
                      if (groups[gi].uuid === ibUuid) {
                        groups[gi].select();
                        groups[gi].showInOutliner();
                        Blockbench.dispatchEvent("update_selection");
                        break;
                      }
                    }
                  }
                }
              }
            }
          },
          /**
           * 画布缩放（滚轮）
           */
          onWheel: function(event) {
            event.preventDefault();
            var delta = event.deltaY > 0 ? 0.9 : 1.1;
            var newZoom = Math.max(0.3, Math.min(3, this.zoom * delta));
            this.zoom = newZoom;
          },
          /**
           * 画布平移（鼠标拖拽）
           */
          onPanStart: function(event) {
            this.isPanning = true;
            this.panStartX = event.clientX;
            this.panStartY = event.clientY;
            this.panStartPanX = this.panX;
            this.panStartPanY = this.panY;
          },
          onPanMove: function(event) {
            if (!this.isPanning) return;
            var dx = event.clientX - this.panStartX;
            var dy = event.clientY - this.panStartY;
            this.panX = this.panStartPanX + dx;
            this.panY = this.panStartPanY + dy;
          },
          onPanEnd: function() {
            this.isPanning = false;
          },
          /**
           * 重新布局（重跑力导向算法）
           */
          onRelayout: function() {
            var variant = this.currentVariant;
            if (!variant) return;
            var graph = extractSignalGraph(variant);
            forceLayout(graph.nodes, graph.edges, {
              width: this.svgWidth,
              height: this.svgHeight,
              iterations: 80
            });
            _assignPortRoles(graph.nodes, graph.edges);
            this.nodes = graph.nodes;
            this.edges = graph.edges;
          }
        },
        mounted: function() {
          var self = this;
          log2.info("\u4FE1\u53F7\u6D41\u56FE\u9762\u677F\u5DF2\u6302\u8F7D");
          self.loadConfigData();
          this._projectHandler = Blockbench.on("select_project", function() {
            log2.info("\u4FE1\u53F7\u6D41\u56FE: select_project \u4E8B\u4EF6");
            self.loadConfigData();
          });
          this._selectionHandler = Blockbench.on("update_selection", function() {
            log2.info("\u4FE1\u53F7\u6D41\u56FE: update_selection \u4E8B\u4EF6");
            self.loadConfigData();
          });
          this._modeHandler = Blockbench.on("select_mode", function() {
            log2.info("\u4FE1\u53F7\u6D41\u56FE: select_mode \u4E8B\u4EF6");
            self.loadConfigData();
          });
          this._saveHandler = Blockbench.on("save", function() {
            log2.info("\u4FE1\u53F7\u6D41\u56FE: save \u4E8B\u4EF6");
            var variant = self.currentVariant;
            if (variant) {
              self.rebuildGraph();
            }
          });
        },
        beforeDestroy: function() {
          if (this._projectHandler) this._projectHandler();
          if (this._selectionHandler) this._selectionHandler();
          if (this._modeHandler) this._modeHandler();
          if (this._saveHandler) this._saveHandler();
        }
      });
      function _findNodeById(nodes, id) {
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].id === id) return nodes[i];
        }
        return null;
      }
      function _assignPortRoles(nodes, edges) {
        var srcIdxMap = {};
        var tgtIdxMap = {};
        for (var ei = 0; ei < edges.length; ei++) {
          var e = edges[ei];
          var src = _findNodeById(nodes, e.from);
          var tgt = _findNodeById(nodes, e.to);
          var srcPort = "right-out";
          var tgtPort = "left-in";
          if (src && tgt) {
            var dx = tgt.x - src.x;
            var dy = tgt.y - src.y;
            if (Math.abs(dx) >= Math.abs(dy)) {
              srcPort = dx >= 0 ? "right-out" : "left-out";
            } else {
              srcPort = dy >= 0 ? "bottom-out" : "top-out";
            }
            var sx = src.x - tgt.x;
            var sy = src.y - tgt.y;
            if (Math.abs(sx) >= Math.abs(sy)) {
              tgtPort = sx >= 0 ? "right-in" : "left-in";
            } else {
              tgtPort = sy >= 0 ? "bottom-in" : "top-in";
            }
          }
          var srcKey = e.from + "::" + srcPort;
          if (!srcIdxMap[srcKey]) srcIdxMap[srcKey] = 0;
          e._srcPort = srcPort;
          e._srcIdx = srcIdxMap[srcKey]++;
          var tgtKey = e.to + "::" + tgtPort;
          if (!tgtIdxMap[tgtKey]) tgtIdxMap[tgtKey] = 0;
          e._tgtPort = tgtPort;
          e._tgtIdx = tgtIdxMap[tgtKey]++;
          _markNodePort(nodes, e.from, srcPort, true);
          _markNodePort(nodes, e.to, tgtPort, false);
        }
      }
      function _markNodePort(nodes, nodeId, port, isOutput) {
        for (var ni = 0; ni < nodes.length; ni++) {
          if (nodes[ni].id === nodeId) {
            if (!nodes[ni]._ports) nodes[ni]._ports = [];
            var exists = false;
            for (var pi = 0; pi < nodes[ni]._ports.length; pi++) {
              if (nodes[ni]._ports[pi].port === port) {
                exists = true;
                break;
              }
            }
            if (!exists) {
              nodes[ni]._ports.push({ port, isOutput });
            }
            break;
          }
        }
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = Vue.component("mm-signal-flow-panel");
      }
    }
  });

  // src/mode.js
  var require_mode = __commonJS({
    "src/mode.js"(exports, module) {
      init_define_BUILTIN_CONNECTORS();
      init_define_BUILTIN_MATERIALS();
      init_define_BUILTIN_PACK_META();
      init_define_BUILTIN_SUBSYSTEMS();
      init_define_SCHEMAS();
      var { getMarkersForVariant, setMarker, clearMarker, getMarker, MARKER_TYPES, getMarkerInfo, detectOwnerSubPart, recalcAutoEndBones } = require_element_markers();
      var { loadConfig, saveConfig, getConfig } = require_persistence();
      var { showToast: showToast2 } = require_notify();
      var { createLogger: createLogger2 } = require_logger();
      var content_pack = require_content_pack();
      var { registerToolbarActions, _mmActionInstances } = require_toolbar();
      var { runValidation } = require_validation();
      var { buildMMMenuItems, patchShowContextMenu, restoreShowContextMenu, patchElementSelect, restoreElementSelect } = require_patches();
      var { getIconClassForType, refreshOutlinerIcons: refreshOutlinerIcons2, resetOutlinerIcons } = require_icons();
      var _mmVueComponent = null;
      var _mmSignalFlowComponent = null;
      var _mmCssInserted = false;
      var log2 = createLogger2("Mode");
      function registerMode2() {
        if (Mode.modes && Mode.modes["machine_max_part"]) {
          log2.debug('registerMode: \u6A21\u5F0F "\u96F6\u4EF6\u5B9A\u4E49" \u5DF2\u5B58\u5728\uFF0C\u8DF3\u8FC7\u6CE8\u518C');
          return Mode.modes["machine_max_part"];
        }
        if (!_mmVueComponent) {
          try {
            _mmVueComponent = require_App_vue();
            log2.debug("registerMode: Vue \u7EC4\u4EF6\u5DF2\u52A0\u8F7D");
          } catch (e) {
            log2.error("registerMode: Vue \u7EC4\u4EF6\u52A0\u8F7D\u5931\u8D25", e);
            _mmVueComponent = null;
          }
        }
        if (!_mmSignalFlowComponent) {
          try {
            _mmSignalFlowComponent = require_SignalFlowPanel_vue();
            log2.debug("registerMode: \u4FE1\u53F7\u6D41\u56FE\u7EC4\u4EF6\u5DF2\u52A0\u8F7D");
          } catch (e) {
            log2.error("registerMode: \u4FE1\u53F7\u6D41\u56FE\u7EC4\u4EF6\u52A0\u8F7D\u5931\u8D25", e);
            _mmSignalFlowComponent = null;
          }
        }
        if (Panels && Panels["mm_properties"]) {
          try {
            if (Panels["mm_properties"].moveTo) {
              Panels["mm_properties"].moveTo("left_bar");
              log2.info("registerMode: \u5DF2\u6709 Panel \u5DF2\u79FB\u81F3\u5DE6\u4FA7\u680F");
            }
          } catch (e) {
            log2.error("registerMode: Panel moveTo \u5931\u8D25", e);
          }
        } else {
          try {
            var PanelClass = typeof Panel !== "undefined" ? Panel : typeof Blockbench !== "undefined" ? Blockbench.Panel : null;
            if (!PanelClass) {
              log2.warn("registerMode: Panel \u7C7B\u4E0D\u53EF\u7528\uFF0C\u8DF3\u8FC7\u9762\u677F\u6CE8\u518C");
            } else {
              new PanelClass("mm_properties", {
                name: "\u96F6\u4EF6\u5C5E\u6027",
                icon: "fa-cube",
                condition: { modes: ["machine_max_part"] },
                default_position: {
                  slot: "left_bar",
                  height: 300
                },
                insert_after: "outliner",
                growable: true,
                resizable: true,
                component: _mmVueComponent || (function() {
                  return { template: '<div class="mm-panel"><p>\u52A0\u8F7D\u9762\u677F\u4E2D...</p></div>' };
                })
              });
              log2.info('registerMode: Panel "\u96F6\u4EF6\u5C5E\u6027" \u5DF2\u6CE8\u518C\u5230\u5DE6\u4FA7\u680F');
            }
          } catch (e) {
            log2.error("registerMode: Panel \u6CE8\u518C\u5931\u8D25", e);
          }
        }
        console.warn("[MM][Mode] \u5C1D\u8BD5\u6CE8\u518C\u4FE1\u53F7\u6D41\u56FE Panel, exists=" + !!(Panels && Panels["mm_signal_flow"]));
        if (!(Panels && Panels["mm_signal_flow"])) {
          try {
            var PanelClass = typeof Panel !== "undefined" ? Panel : typeof Blockbench !== "undefined" ? Blockbench.Panel : null;
            if (!PanelClass) {
              log2.warn("registerMode: Panel \u7C7B\u4E0D\u53EF\u7528\uFF0C\u8DF3\u8FC7\u4FE1\u53F7\u6D41\u56FE\u9762\u677F\u6CE8\u518C");
              console.warn("[MM][Mode] Panel \u7C7B\u4E0D\u53EF\u7528");
            } else {
              console.warn("[MM][Mode] \u6CE8\u518C\u4FE1\u53F7\u6D41\u56FE Panel, component=" + typeof _mmSignalFlowComponent);
              new PanelClass("mm_signal_flow", {
                name: "\u4FE1\u53F7\u6D41\u56FE",
                icon: "fa-bezier-curve",
                condition: { modes: ["machine_max_part"] },
                default_position: {
                  slot: "bottom",
                  height: 200
                },
                growable: true,
                resizable: true,
                component: _mmSignalFlowComponent || (function() {
                  return { template: '<div class="mm-signal-flow"><p>\u4FE1\u53F7\u6D41\u56FE\u52A0\u8F7D\u4E2D...</p></div>' };
                })
              });
              log2.info('registerMode: Panel "\u4FE1\u53F7\u6D41\u56FE" \u5DF2\u6CE8\u518C\u5230\u5E95\u90E8\u680F');
              if (typeof Interface !== "undefined") {
                try {
                  Interface.bottom_panel_height = 200;
                  log2.debug("registerMode: \u5DF2\u5C55\u5F00\u5E95\u90E8\u9762\u677F\u533A\u57DF");
                } catch (e) {
                  log2.debug("registerMode: \u5C55\u5F00\u5E95\u90E8\u9762\u677F\u5931\u8D25", e);
                }
              }
              if (Panels && Panels["mm_signal_flow"]) {
                try {
                  Panels["mm_signal_flow"].show();
                } catch (e) {
                  log2.debug("show() \u4E0D\u53EF\u7528");
                }
                log2.debug("registerMode: mm_signal_flow \u72B6\u6001", {
                  exists: true,
                  slot: Panels["mm_signal_flow"].slot,
                  visible: Panels["mm_signal_flow"].visible
                });
              }
            }
          } catch (e) {
            log2.error("registerMode: \u4FE1\u53F7\u6D41\u56FE Panel \u6CE8\u518C\u5931\u8D25", e);
          }
        }
        if (!_mmCssInserted) {
          try {
            const mmCss = ".mm-panel {\n    padding: 12px;\n    height: 100%;\n    font-size: 13px;\n    color: var(--text-color, #ddd);\n    display: flex;\n    flex-direction: column;\n    overflow: hidden;\n}\n\n.mm-panel-empty {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    color: #888;\n}\n\n.mm-panel-header {\n    margin-bottom: 12px;\n    padding-bottom: 8px;\n    border-bottom: 1px solid var(--border-color, #333);\n}\n\n.mm-nav-row {\n    display: flex;\n    align-items: center;\n    gap: 6px;\n    margin-bottom: 6px;\n}\n\n.mm-label {\n    font-size: 12px;\n    color: #aaa;\n    min-width: 32px;\n    flex-shrink: 0;\n}\n\n.mm-select {\n    flex: 1;\n    background: var(--input-bg, #2a2a2a);\n    border: 1px solid var(--border-color, #444);\n    color: var(--text-color, #ddd);\n    padding: 4px 8px;\n    border-radius: 3px;\n    font-size: 12px;\n    cursor: pointer;\n}\n\n.mm-input {\n    width: 100%;\n    background: var(--input-bg, #2a2a2a);\n    border: 1px solid var(--border-color, #444);\n    color: var(--text-color, #ddd);\n    padding: 4px 8px;\n    border-radius: 3px;\n    font-size: 12px;\n    box-sizing: border-box;\n}\n\n.mm-input:focus {\n    border-color: #4A90D9;\n    outline: none;\n}\n\n.mm-btn {\n    background: var(--btn-bg, #3a3a3a);\n    border: 1px solid var(--border-color, #555);\n    color: var(--text-color, #ddd);\n    border-radius: 3px;\n    cursor: pointer;\n    font-size: 12px;\n    white-space: nowrap;\n}\n\n.mm-btn:hover {\n    background: var(--btn-hover-bg, #4a4a4a);\n}\n\n.mm-btn-sm {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    padding: 0;\n    font-size: 14px;\n    line-height: 1;\n    width: 30px;\n    height: 30px;\n    min-width: 30px;\n    min-height: 30px;\n    box-sizing: border-box;\n}\n\n.mm-btn-danger {\n    background: var(--btn-danger-bg, #5a2a2a);\n    border-color: var(--btn-danger-border, #8a3a3a);\n    color: #ff6b6b;\n}\n\n.mm-btn-danger:hover:not(:disabled) {\n    background: var(--btn-danger-hover-bg, #7a3a3a);\n    color: #ff9999;\n}\n\n.mm-btn-danger:disabled {\n    opacity: 0.35;\n    cursor: not-allowed;\n}\n\n.mm-section {\n    margin-bottom: 16px;\n}\n\n.mm-section-title {\n    font-size: 13px;\n    font-weight: 600;\n    margin: 0 0 8px 0;\n    padding-bottom: 4px;\n    border-bottom: 1px solid var(--border-color, #333);\n    color: var(--heading-color, #eee);\n}\n\n.mm-field {\n    margin-bottom: 8px;\n    display: flex;\n    flex-direction: column;\n    gap: 2px;\n}\n\n.mm-field label {\n    font-size: 11px;\n    color: #999;\n    margin-bottom: 1px;\n}\n\n.mm-field-row {\n    flex-direction: row;\n    align-items: center;\n    gap: 8px;\n}\n\n.mm-field-row label {\n    margin-bottom: 0;\n}\n\n.mm-tags {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 4px;\n    align-items: center;\n}\n\n.mm-tag {\n    background: var(--tag-bg, #3a6a9a);\n    color: white;\n    padding: 2px 8px;\n    border-radius: 3px;\n    font-size: 11px;\n    display: flex;\n    align-items: center;\n    gap: 4px;\n}\n\n.mm-tag-remove {\n    cursor: pointer;\n    font-weight: bold;\n    font-size: 14px;\n    line-height: 1;\n}\n\n.mm-tag-remove:hover {\n    color: #ff6b6b;\n}\n\n.mm-variant-list {\n    list-style: none;\n    padding: 0;\n    margin: 0;\n}\n\n.mm-variant-list li {\n    padding: 4px 8px;\n    cursor: pointer;\n    font-size: 12px;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    border-radius: 3px;\n}\n\n.mm-variant-list li:hover {\n    background: var(--hover-bg, #333);\n}\n\n.mm-variant-list li.active {\n    background: var(--active-bg, #2a4a6a);\n    color: white;\n}\n\n.mm-variant-remove {\n    cursor: pointer;\n    color: #ff6b6b;\n    font-weight: bold;\n}\n\n.mm-element-info {\n    font-size: 11px;\n    color: #888;\n    margin: 2px 0;\n}\n\n.mm-marker-badge {\n    display: inline-block;\n    padding: 1px 6px;\n    border-radius: 3px;\n    font-size: 10px;\n    color: white;\n    margin-left: 6px;\n    vertical-align: middle;\n}\n\n.mm-panel-hint {\n    color: #666;\n    font-size: 12px;\n    text-align: center;\n    padding: 20px;\n}\n\n.mm-panel-body {\n    flex: 1;\n    overflow-y: auto;\n}\n\n/* \u56FA\u5B9A\u5728\u9762\u677F\u9876\u90E8\u7684\u6807\u9898\u680F\uFF0C\u6EDA\u52A8\u65F6\u59CB\u7EC8\u53EF\u89C1 */\n.mm-sticky-title {\n    position: sticky;\n    top: 0;\n    z-index: 1;\n    background: var(--panel-bg, #1e1e1e);\n    padding: 8px 0 4px 0;\n    margin-bottom: 8px;\n    border-bottom: 1px solid var(--border-color, #333);\n}\n\n/* \u5B50\u96F6\u4EF6\u9762\u677F\u4E2D\u7684\u78B0\u649E\u7BB1/\u8FDE\u63A5\u70B9\u6761\u76EE\u884C */\n.mm-sub-item-row {\n    display: flex;\n    flex-direction: column;\n    padding: 4px 8px;\n    border-radius: 3px;\n    margin-bottom: 2px;\n}\n.mm-sub-item-row.mm-clickable {\n    cursor: pointer;\n}\n.mm-sub-item-row.mm-clickable:hover {\n    background: var(--hover-bg, #333);\n}\n\n/* \u5B50\u96F6\u4EF6\u6761\u76EE\u540D\u79F0\u884C */\n.mm-sub-item-name {\n    display: flex;\n    align-items: center;\n    gap: 6px;\n    font-size: 12px;\n}\n\n/* \u5B50\u96F6\u4EF6\u6761\u76EE\u5143\u4FE1\u606F\u884C */\n.mm-sub-item-meta {\n    font-size: 10px;\n    color: #888;\n    margin-left: 4px;\n}\n\n/* \u53EF\u70B9\u51FB\u7684\u5F52\u5C5E\u6807\u7B7E */\n.mm-clickable-tag:hover {\n    filter: brightness(1.3);\n}\n\n/* \u5B50\u7CFB\u7EDF\u9762\u677F\u4E2D\u7684\u4FE1\u53F7\u9891\u9053\u5361\u7247 */\n.mm-signal-card {\n    margin-bottom: 4px;\n    padding: 4px;\n    background: #252525;\n    border-radius: 3px;\n}\n\n/* \u5B50\u7CFB\u7EDF\u9762\u677F\u4E2D\u7684\u4FE1\u53F7\u9891\u9053\u5934\u90E8 */\n.mm-signal-header {\n    display: flex;\n    gap: 4px;\n    align-items: center;\n    margin-bottom: 2px;\n}\n\n/* \u5B50\u7CFB\u7EDF\u9762\u677F\u4E2D\u7684\u5220\u9664\u6309\u94AE */\n.mm-btn-sm.mm-btn-danger-light {\n    color: #ff6b6b;\n}\n\n.mm-btn-sm.mm-btn-danger-light:hover {\n    color: #ff9999;\n}\n\n/* ===== \u4FE1\u53F7\u6D41\u56FE\u9762\u677F ===== */\n.mm-signal-flow {\n    padding: 8px 12px;\n    height: 100%;\n    display: flex;\n    flex-direction: column;\n    overflow: hidden;\n    font-size: 13px;\n    color: var(--text-color, #ddd);\n}\n\n.mm-signal-flow-empty {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    color: #888;\n    font-size: 12px;\n}\n\n.mm-signal-flow-header {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    padding-bottom: 8px;\n    margin-bottom: 8px;\n    border-bottom: 1px solid var(--border-color, #333);\n    flex-shrink: 0;\n}\n\n.mm-signal-flow-title {\n    display: flex;\n    align-items: center;\n    gap: 6px;\n    font-size: 14px;\n    font-weight: 600;\n    color: var(--heading-color, #eee);\n}\n\n.mm-flow-icon {\n    font-size: 16px;\n    color: #4A90D9;\n}\n\n.mm-signal-flow-meta {\n    display: flex;\n    align-items: center;\n    gap: 4px;\n    font-size: 11px;\n    color: #888;\n}\n\n.mm-flow-meta-item {\n    background: #2a2a2a;\n    padding: 1px 6px;\n    border-radius: 3px;\n    color: #aaa;\n}\n\n.mm-flow-meta-sep {\n    color: #555;\n}\n\n.mm-signal-flow-body {\n    flex: 1;\n    display: flex;\n    overflow: auto;\n}\n\n.mm-signal-flow-placeholder {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: center;\n    width: 100%;\n    gap: 12px;\n}\n\n.mm-flow-placeholder-icon {\n    font-size: 36px;\n    color: #4a4a4a;\n    opacity: 0.5;\n}\n\n.mm-flow-placeholder-text {\n    font-size: 13px;\n    color: #666;\n}\n\n.mm-flow-placeholder-hint {\n    font-size: 11px;\n    color: #555;\n    text-align: center;\n}\n\n.mm-flow-stats {\n    display: flex;\n    gap: 24px;\n    margin: 8px 0;\n}\n\n.mm-flow-stat {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    gap: 2px;\n}\n\n.mm-flow-stat-value {\n    font-size: 18px;\n    font-weight: 600;\n    color: #4A90D9;\n}\n\n.mm-flow-stat-label {\n    font-size: 10px;\n    color: #888;\n    text-transform: uppercase;\n}\n\n/* \u4FE1\u53F7\u6D41\u56FE\u753B\u5E03 */\n.mm-flow-canvas {\n    flex: 1;\n    overflow: hidden;\n    background: #1a1a1a;\n    border-radius: 4px;\n    border: 1px solid var(--border-color, #333);\n    min-height: 200px;\n}\n\n.mm-flow-canvas svg {\n    display: block;\n}\n\n/* \u8FDE\u7EBF\u60AC\u505C\u9AD8\u4EAE */\n.mm-flow-edge-hovered {\n    stroke-opacity: 1 !important;\n}\n\n/* \u8282\u70B9\u60AC\u505C\u9AD8\u4EAE */\n.mm-flow-node-hovered {\n    stroke: #fff !important;\n    stroke-width: 1.5 !important;\n    filter: brightness(1.2);\n}\n\n/* \u4FE1\u53F7\u6D41\u56FE\u64CD\u4F5C\u6309\u94AE */\n.mm-signal-flow-actions {\n    margin-left: auto;\n    display: flex;\n    gap: 4px;\n    align-items: center;\n}\n\n/* \u56FE\u4F8B */\n.mm-signal-flow-legend {\n    display: flex;\n    gap: 12px;\n    padding-top: 6px;\n    margin-top: 4px;\n    border-top: 1px solid var(--border-color, #333);\n    flex-shrink: 0;\n    flex-wrap: wrap;\n}\n\n.mm-flow-legend-item {\n    display: flex;\n    align-items: center;\n    gap: 4px;\n    font-size: 10px;\n    color: #999;\n    cursor: default;\n}\n\n.mm-flow-legend-item:hover {\n    color: #ccc;\n}\n\n.mm-flow-legend-dot {\n    width: 8px;\n    height: 8px;\n    border-radius: 2px;\n    flex-shrink: 0;\n}\n\n.mm-flow-legend-line {\n    width: 14px;\n    height: 3px;\n    border-radius: 1px;\n    flex-shrink: 0;\n}";
            if (mmCss) {
              const style = document.createElement("style");
              style.setAttribute("data-mm-plugin", "true");
              style.textContent = mmCss;
              document.head.appendChild(style);
              _mmCssInserted = true;
              log2.debug("registerMode: \u6837\u5F0F\u5DF2\u6CE8\u5165 <head>");
            }
          } catch (e) {
            log2.error("registerMode: \u6837\u5F0F\u52A0\u8F7D\u5931\u8D25", e);
          }
        }
        const mmMode = new Mode("machine_max_part", {
          name: "\u96F6\u4EF6\u5B9A\u4E49",
          icon: "fa-cube",
          hidden_node_types: ["cube", "mesh", "texture_mesh", "null_object"],
          onSelect: function() {
            log2.info("\u8FDB\u5165\u96F6\u4EF6\u5B9A\u4E49\u6A21\u5F0F");
            var oldScreen = document.getElementById("mode_screen_machine_max_part");
            if (oldScreen) {
              oldScreen.remove();
              log2.debug("onSelect: \u6E05\u7406\u65E7\u7248 mode_screen \u6B8B\u7559");
            }
            if (Panels && Panels.outliner) {
              var cond = Panels.outliner.condition;
              if (cond && cond.modes && !cond.modes.includes("machine_max_part")) {
                cond.modes.push("machine_max_part");
                log2.debug("onSelect: \u5DF2\u5C06 machine_max_part \u6DFB\u52A0\u5230 Outliner \u663E\u793A\u6761\u4EF6");
              }
              try {
                Panels.outliner.fold(false);
              } catch (e) {
                log2.debug("onSelect: Outliner.fold \u5F02\u5E38", e);
              }
              try {
                Panels.outliner.update();
              } catch (e) {
                log2.debug("onSelect: Outliner.update \u5F02\u5E38", e);
              }
            }
            const config = loadConfig();
            log2.debug("onSelect: \u914D\u7F6E\u5DF2\u52A0\u8F7D", {
              parts: Object.keys(config.parts || {}),
              _uiState: config._uiState
            });
            if (!config.contentPackPath) {
              log2.info("onSelect: \u672A\u8BBE\u7F6E\u5185\u5BB9\u5305\u8DEF\u5F84\uFF0C\u5F39\u51FA\u8BBE\u7F6E\u5411\u5BFC");
              var pd = require_pack_setup_dialog();
              pd.showPackSetupDialog(config, function() {
                saveConfig();
              });
            } else {
              var checkResult = content_pack.openContentPack(config.contentPackPath);
              if (!checkResult.valid) {
                log2.warn("onSelect: \u5185\u5BB9\u5305\u8DEF\u5F84\u65E0\u6548\uFF0C\u5F39\u51FA\u8BBE\u7F6E\u5411\u5BFC", { path: config.contentPackPath, error: checkResult.error });
                showToast2("\u5F53\u524D\u5185\u5BB9\u5305\u65E0\u6548: " + (checkResult.error || "\u8DEF\u5F84\u4E0D\u5B58\u5728"), "warning");
                var pd = require_pack_setup_dialog();
                pd.showPackSetupDialog(config, function() {
                  saveConfig();
                });
              }
            }
            if (config._uiState?.activePartId && !config.parts[config._uiState.activePartId]) {
              log2.debug("onSelect: activePartId " + config._uiState.activePartId + " \u5DF2\u5931\u6548\uFF0C\u6E05\u7A7A");
              config._uiState.activePartId = "";
              config._uiState.activeVariantName = "";
            }
            const partIds = Object.keys(config.parts);
            if (!config._uiState?.activePartId && partIds.length > 0) {
              config._uiState.activePartId = partIds[0];
              const variants = Object.keys(config.parts[partIds[0]].variants || {});
              config._uiState.activeVariantName = variants.length > 0 ? variants[0] : "default";
              log2.debug("onSelect: \u81EA\u52A8\u9009\u62E9\u96F6\u4EF6", {
                partId: partIds[0],
                variant: config._uiState.activeVariantName
              });
            }
            refreshOutlinerIcons2();
            log2.debug("onSelect: \u8C03\u7528 patchShowContextMenu...");
            patchShowContextMenu();
            log2.debug("onSelect: \u8C03\u7528 patchElementSelect...");
            patchElementSelect();
            Blockbench.dispatchEvent("update_selection");
            var activePId = config._uiState?.activePartId;
            var activeVName = config._uiState?.activeVariantName;
            if (activePId && activeVName) {
              recalcAutoEndBones(config, activePId, activeVName);
              log2.debug("onSelect: auto_end_bones \u91CD\u7B97\u5B8C\u6210");
            }
          },
          onUnselect: function() {
            log2.info("\u9000\u51FA\u96F6\u4EF6\u5B9A\u4E49\u6A21\u5F0F");
            restoreShowContextMenu();
            restoreElementSelect();
            resetOutlinerIcons();
            if (Panels && Panels.outliner) {
              var cond = Panels.outliner.condition;
              if (cond && cond.modes) {
                var idx = cond.modes.indexOf("machine_max_part");
                if (idx !== -1) {
                  cond.modes.splice(idx, 1);
                  log2.debug("onUnselect: \u5DF2\u4ECE Outliner \u663E\u793A\u6761\u4EF6\u79FB\u9664 machine_max_part");
                }
              }
            }
            saveConfig();
            log2.debug("onUnselect: \u914D\u7F6E\u5DF2\u4FDD\u5B58");
          }
        });
        registerToolbarActions();
        moveModeToFront("machine_max_part");
        log2.info('registerMode: \u6A21\u5F0F "\u96F6\u4EF6\u5B9A\u4E49" \u5DF2\u6CE8\u518C');
        return mmMode;
      }
      function moveModeToFront(modeId) {
        if (typeof Modes === "undefined" || !Modes.options || !Modes.options[modeId]) {
          log2.warn("moveModeToFront: \u6A21\u5F0F\u4E0D\u53EF\u7528", { modeId });
          return;
        }
        var keys = Object.keys(Modes.options);
        if (keys.length <= 1 || keys[0] === modeId) {
          log2.debug("moveModeToFront: \u65E0\u9700\u8C03\u6574\u987A\u5E8F");
          return;
        }
        log2.debug("moveModeToFront: \u5F00\u59CB\u91CD\u6392\u6A21\u5F0F\u987A\u5E8F", { modeId, before: keys });
        var ordered = {};
        ordered[modeId] = Modes.options[modeId];
        for (var i = 0; i < keys.length; i++) {
          if (keys[i] !== modeId) {
            ordered[keys[i]] = Modes.options[keys[i]];
          }
        }
        Modes.options = ordered;
        if (Modes.vue) {
          if (typeof Vue !== "undefined" && Vue.set) {
            Vue.set(Modes.vue, "options", ordered);
          } else {
            Modes.vue.options = ordered;
          }
          log2.info('moveModeToFront: \u6A21\u5F0F "' + modeId + '" \u5DF2\u79FB\u81F3\u6700\u524D', { newOrder: Object.keys(ordered) });
        } else {
          log2.warn("moveModeToFront: Modes.vue \u4E0D\u53EF\u7528\uFF0CUI \u53EF\u80FD\u4E0D\u4F1A\u7ACB\u5373\u66F4\u65B0");
        }
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          registerMode: registerMode2,
          refreshOutlinerIcons: refreshOutlinerIcons2,
          resetOutlinerIcons,
          runValidation,
          /** 卸载插件时，通过 Action.delete() 正确清理所有注册的 Action（而非仅删除 BarItems 条目） */
          unregisterActions: function() {
            if (!_mmActionInstances.length) {
              log2.debug("unregisterActions: \u65E0 Action \u9700\u6E05\u7406");
              return;
            }
            var count = 0;
            for (let i = _mmActionInstances.length - 1; i >= 0; i--) {
              const action = _mmActionInstances[i];
              if (action && typeof action.delete === "function") {
                try {
                  action.delete();
                  log2.debug("unregisterActions: \u5DF2\u6E05\u7406 Action: " + action.id);
                  count++;
                } catch (e) {
                  log2.error("unregisterActions: \u6E05\u7406 Action \u5931\u8D25: " + action.id, e);
                }
              }
            }
            _mmActionInstances.length = 0;
            log2.info("unregisterActions: \u5B8C\u6210\uFF0C\u5171\u6E05\u7406 " + count + " \u4E2A Action");
          }
        };
      }
    }
  });

  // src/plugin.js
  init_define_BUILTIN_CONNECTORS();
  init_define_BUILTIN_MATERIALS();
  init_define_BUILTIN_PACK_META();
  init_define_BUILTIN_SUBSYSTEMS();
  init_define_SCHEMAS();
  var { createLogger } = require_logger();
  var { registerProperty } = require_persistence();
  var { registerMode, unregisterActions } = require_mode();
  var { registerMachineMaxMenu, unregisterMachineMaxMenu } = require_menu();
  var { showToast } = require_notify();
  var PLUGIN_VERSION = "0.1.0";
  var log = createLogger("Plugin");
  Plugin.register("machine_max_bb_plugin", {
    title: "MachineMax \u96F6\u4EF6\u5B9A\u4E49",
    icon: "fa-cube",
    author: "MachineMax Team",
    description: "\u5728 Blockbench \u4E2D\u4EE5\u53EF\u89C6\u5316\u65B9\u5F0F\u5236\u4F5C MachineMax \u5185\u5BB9\u5305\uFF0C\u65E0\u9700\u624B\u5199 JSON",
    version: PLUGIN_VERSION,
    variant: "desktop",
    onload() {
      log.info("\u52A0\u8F7D MachineMax Blockbench \u63D2\u4EF6 v" + PLUGIN_VERSION);
      log.debug("Blockbench \u7248\u672C\u73AF\u5883\u68C0\u6D4B", {
        Blockbench: typeof Blockbench !== "undefined" ? Blockbench.version || "?" : "undefined",
        Project: typeof Project !== "undefined" ? Project ? "loaded" : "empty" : "undefined",
        Mode: typeof Mode !== "undefined" ? Mode.modes ? Object.keys(Mode.modes) : "no modes" : "undefined"
      });
      registerProperty();
      registerMode();
      registerMachineMaxMenu();
      showToast('MachineMax \u63D2\u4EF6\u5DF2\u52A0\u8F7D\uFF0C\u5728\u6A21\u5F0F\u680F\u4E2D\u9009\u62E9 "\u96F6\u4EF6\u5B9A\u4E49" \u5F00\u59CB\u4F7F\u7528', "positive");
      log.info("\u63D2\u4EF6\u521D\u59CB\u5316\u5B8C\u6210");
    },
    onunload() {
      log.info("\u5378\u8F7D MachineMax Blockbench \u63D2\u4EF6");
      unregisterActions();
      unregisterMachineMaxMenu();
      log.debug("\u63D2\u4EF6\u6E05\u7406\u5B8C\u6210");
    }
  });
})();
