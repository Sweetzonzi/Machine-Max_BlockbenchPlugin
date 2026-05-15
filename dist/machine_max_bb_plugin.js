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
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/utils/logger.js
  var require_logger = __commonJS({
    "src/utils/logger.js"(exports, module) {
      var DEBUG_ENABLED = true;
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
      var CONFIG_VERSION = 3;
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
      var CONNECTOR_DEF_DEFAULTS = {
        type: "Simple",
        direction: "yp",
        integrity: 20,
        damage_reduction: 2,
        damage_multiplier: 1.5,
        damage_absorption: 0.2,
        collide_between: false,
        required_tags: [],
        accepted_tags: [],
        rejected_tags: [],
        joints: []
      };
      var SUBSYSTEM_DEF_DEFAULTS = {
        type: "machine_max:basic",
        basic_durability: 20,
        pass_damage: true,
        limit_damage: false,
        hidden: false,
        destroy_sound_event: null,
        activate_sound_event: null,
        deactivate_sound_event: null
      };
      var MATERIAL_DEF_DEFAULTS = {
        friction: 0.5,
        restitution: 0.3,
        density: 1,
        armor_thickness: 1,
        armor_toughness: 0,
        hit_sound: null,
        break_sound: null,
        particle: null
      };
      var PROJECTILE_DEFAULTS = {
        type: "point",
        mass: 1,
        gravity_factor: 1,
        drag_factor: 0,
        radius: 0.05,
        base_velocity: 100,
        base_penetration: 10,
        base_damage: 10,
        base_accuracy_mil: 5,
        penetration_velocity_coefficient: 1,
        damage_velocity_coefficient: 1
      };
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          CONFIG_VERSION,
          PART_DEFAULTS,
          VARIANT_DEFAULTS,
          SUB_PART_DEFAULTS,
          CONNECTOR_DEF_DEFAULTS,
          SUBSYSTEM_DEF_DEFAULTS,
          MATERIAL_DEF_DEFAULTS,
          PROJECTILE_DEFAULTS
        };
      }
    }
  });

  // src/core/config.js
  var require_config = __commonJS({
    "src/core/config.js"(exports, module) {
      var {
        CONFIG_VERSION,
        PART_DEFAULTS,
        VARIANT_DEFAULTS,
        SUB_PART_DEFAULTS,
        CONNECTOR_DEF_DEFAULTS,
        SUBSYSTEM_DEF_DEFAULTS,
        MATERIAL_DEF_DEFAULTS,
        PROJECTILE_DEFAULTS
      } = require_config_defaults();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("Config");
      var MIGRATIONS = {
        2: function(v1config) {
          const v3 = v1config.project || v1config;
          v3.$schema_version = 3;
          v3.projectiles = v3.projectiles || {};
          v3.connector_defs = v3.connector_defs || {};
          v3.subsystem_defs = v3.subsystem_defs || {};
          v3.material_defs = v3.material_defs || {};
          log2.info("MIGRATIONS: \u914D\u7F6E\u4ECE v1\u2192v3 \u8FC1\u79FB\u5B8C\u6210");
          return v3;
        }
      };
      function createBlankConfig() {
        log2.debug("createBlankConfig: \u521B\u5EFA\u7A7A\u767D\u914D\u7F6E\uFF0C\u7248\u672C=" + CONFIG_VERSION);
        return {
          $schema_version: CONFIG_VERSION,
          namespace: "machine_max",
          modelFile: "",
          parts: {},
          projectiles: {},
          connector_defs: {},
          subsystem_defs: {},
          material_defs: {},
          // 包级元数据（用于导出 Spark-Core 兼容的 meta.json）
          packMeta: {
            id: "",
            version: "1.0",
            name: "",
            author: "",
            description: "",
            dependencies: [],
            enable_auto_pack: true
          },
          _uiState: {
            activeMode: "part",
            activePartId: "",
            activeVariantName: ""
          }
        };
      }
      function createPackMeta(config) {
        var pm = config.packMeta || {};
        var ns = config.namespace || "machine_max";
        var packId = pm.id || ns + ":" + (Project ? Project.name || "content_pack" : "content_pack");
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
        log2.debug("createPackMeta: \u5305\u5143\u6570\u636E", { packId: result.id, version: result.version });
        return result;
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
      function createConnectorDef(defId) {
        log2.debug("createConnectorDef: \u521B\u5EFA\u8FDE\u63A5\u70B9\u5B9A\u4E49", { defId });
        const def = JSON.parse(JSON.stringify(CONNECTOR_DEF_DEFAULTS));
        return def;
      }
      function createSubsystemDef(defId) {
        log2.debug("createSubsystemDef: \u521B\u5EFA\u5B50\u7CFB\u7EDF\u5B9A\u4E49", { defId });
        const def = JSON.parse(JSON.stringify(SUBSYSTEM_DEF_DEFAULTS));
        return def;
      }
      function createMaterialDef(defId) {
        log2.debug("createMaterialDef: \u521B\u5EFA\u6750\u6599\u5B9A\u4E49", { defId });
        return JSON.parse(JSON.stringify(MATERIAL_DEF_DEFAULTS));
      }
      function ensureDefaults(config) {
        if (!config || typeof config !== "object") {
          log2.warn("ensureDefaults: \u914D\u7F6E\u65E0\u6548\uFF0C\u8FD4\u56DE\u7A7A\u767D\u914D\u7F6E");
          return createBlankConfig();
        }
        const result = Object.assign({}, createBlankConfig(), config);
        if (!result.parts) result.parts = {};
        if (!result.projectiles) result.projectiles = {};
        if (!result.connector_defs) result.connector_defs = {};
        if (!result.subsystem_defs) result.subsystem_defs = {};
        if (!result.material_defs) result.material_defs = {};
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
          createPackMeta,
          createPartConfig,
          createVariantConfig,
          createSubPartConfig,
          createConnectorDef,
          createSubsystemDef,
          createMaterialDef,
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
      var PROPERTY_NAME = "machine_max_plugin";
      var CONFIG_VERSION = 3;
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
              $schema_version: CONFIG_VERSION,
              bbmodel: path.basename(bbmodelPath),
              timestamp: Date.now(),
              config
            }, null, 2),
            "utf-8"
          );
          log2.debug("saveConfig: \u72EC\u7ACB\u5907\u4EFD\u5DF2\u5199\u5165: " + standalonePath);
        } catch (e) {
          log2.error("saveConfig: \u5907\u9009\u914D\u7F6E\u5199\u5165\u5931\u8D25", e);
        }
        log2.info("\u914D\u7F6E\u5DF2\u4FDD\u5B58");
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
          getConfig
        };
      }
    }
  });

  // src/core/element_markers.js
  var require_element_markers = __commonJS({
    "src/core/element_markers.js"(exports, module) {
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("Markers");
      var MARKER_TYPES = {
        sub_part: { label: "\u5B50\u96F6\u4EF6", icon: "fa-cube", color: "#4A90D9" },
        hit_box: { label: "\u78B0\u649E\u7BB1", icon: "fa-shield", color: "#D94A4A" },
        connector: { label: "\u8FDE\u63A5\u70B9", icon: "fa-plug", color: "#4AD94A" },
        seat: { label: "\u5EA7\u4F4D", icon: "fa-chair", color: "#D9C94A" },
        lighting: { label: "\u706F\u5149", icon: "fa-lightbulb", color: "#D97E4A" },
        subsystem_locator: { label: "\u5B50\u7CFB\u7EDF", icon: "fa-cog", color: "#9B4AD9" }
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
          return ["connector", "seat", "lighting", "subsystem_locator"];
        } else if (element instanceof Group) {
          return ["sub_part", "hit_box"];
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
        part.element_markers[variantName][uuid] = {
          type,
          config_ref: configRef || null
        };
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
        delete part.element_markers[variantName][uuid];
        log2.debug("clearMarker: \u6807\u8BB0\u5DF2\u6E05\u9664", { partId, variant: variantName, uuid });
        if (Object.keys(part.element_markers[variantName]).length === 0) {
          delete part.element_markers[variantName];
        }
        return true;
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
          getMarkersForVariant
        };
      }
    }
  });

  // src/utils/notify.js
  var require_notify = __commonJS({
    "src/utils/notify.js"(exports, module) {
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

  // src/ui/App.vue.js
  var require_App_vue = __commonJS({
    "src/ui/App.vue.js"(exports, module) {
      var { getConfig, loadConfig, saveConfig } = require_persistence();
      var { getMarkerInfo } = require_element_markers();
      var { createVariantConfig, createPartConfig } = require_config();
      var { refreshOutlinerIcons } = require_mode();
      var { showToast: showToast2 } = require_notify();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("UI");
      var MMMainPanel = Vue.component("mm-main-panel", {
        template: `
        <div class="mm-panel" v-if="config">
            <!--- \u6A21\u5F0F\u5185\u5BFC\u822A\u680F --->
            <div class="mm-panel-header">
                <div class="mm-nav-row">
                    <label class="mm-label">\u96F6\u4EF6</label>
                    <select v-model="activePartId" @change="onPartChange" class="mm-select">
                        <option v-for="(part, id) in config.parts" :key="id" :value="id">{{ id }}</option>
                    </select>
                    <button class="mm-btn mm-btn-sm" @click="showNewPartDialog" title="\u65B0\u5EFA\u96F6\u4EF6">+</button>
                </div>
                <div class="mm-nav-row" v-if="currentPart">
                    <label class="mm-label">\u53D8\u4F53</label>
                    <select v-model="activeVariantName" @change="onVariantChange" class="mm-select">
                        <option v-for="(variant, name) in currentPart.variants" :key="name" :value="name">{{ name }}</option>
                    </select>
                    <button class="mm-btn mm-btn-sm" @click="showNewVariantDialog" title="\u65B0\u5EFA\u53D8\u4F53">+</button>
                </div>
            </div>

            <!--- \u7A7A\u95F2\u9875\uFF1A\u96F6\u4EF6\u5168\u5C40\u5C5E\u6027 --->
            <div v-if="!selectedElement" class="mm-panel-body">
                <div class="mm-section" v-if="currentPart">
                    <h3 class="mm-section-title">\u96F6\u4EF6\u5168\u5C40\u5C5E\u6027: {{ activePartId }}</h3>
                    <div class="mm-field">
                        <label>\u56FE\u6807</label>
                        <input type="text" v-model="currentPart.icon" class="mm-input" placeholder="machine_max:textures/icon/..." />
                    </div>
                    <div class="mm-field">
                        <label>\u8010\u4E45\u8D21\u732E</label>
                        <input type="number" v-model.number="currentPart.vehicle_durability_rate" class="mm-input" step="0.1" min="0" max="1" />
                    </div>
                    <div class="mm-field">
                        <label>\u4F24\u5BB3\u4F20\u5BFC</label>
                        <input type="number" v-model.number="currentPart.vehicle_damage_rate" class="mm-input" step="0.1" min="0" />
                    </div>
                    <div class="mm-field">
                        <label>\u6467\u6BC1\u4F24\u5BB3</label>
                        <input type="number" v-model.number="currentPart.vehicle_damage_rate_destroyed" class="mm-input" step="0.1" min="0" />
                    </div>
                    <div class="mm-field">
                        <label>\u529F\u80FD\u9608\u503C</label>
                        <input type="number" v-model.number="currentPart.functional_threshold" class="mm-input" step="0.1" min="0" max="1" />
                    </div>
                    <div class="mm-field mm-field-row">
                        <label>\u5171\u4EAB\u8010\u4E45</label>
                        <input type="checkbox" v-model="currentPart.share_durability" />
                    </div>
                    <div class="mm-field">
                        <label>\u6700\u5927\u5806\u53E0</label>
                        <input type="number" v-model.number="currentPart.max_stack_size" class="mm-input" min="1" max="64" />
                    </div>
                </div>

                <div class="mm-section" v-if="currentVariant">
                    <h3 class="mm-section-title">\u53D8\u4F53: {{ activeVariantName }}</h3>
                    <div class="mm-field">
                        <label>\u6A21\u578B</label>
                        <input type="text" v-model="currentVariant.model" class="mm-input" placeholder="machine_max:..." />
                    </div>
                    <div class="mm-field">
                        <label>\u52A8\u753B</label>
                        <input type="text" v-model="currentVariant.animations" class="mm-input" placeholder="machine_max:..." />
                    </div>
                    <div class="mm-field">
                        <label>\u8D34\u56FE</label>
                        <input type="text" v-model="currentVariant.textures" class="mm-input" placeholder="default: ..." />
                    </div>
                    <div class="mm-field">
                        <label>\u6807\u7B7E</label>
                        <div class="mm-tags">
                            <span v-for="(tag, i) in currentVariant.tags" :key="i" class="mm-tag">
                                {{ tag }}
                                <span class="mm-tag-remove" @click="removeTag(i)">\xD7</span>
                            </span>
                            <input type="text" v-model="newTag" @keydown.enter="addTag" class="mm-input-tag" placeholder="\u6DFB\u52A0\u6807\u7B7E..." />
                        </div>
                    </div>
                </div>

                <div class="mm-section" v-if="currentVariant">
                    <h3 class="mm-section-title">\u53D8\u4F53\u5217\u8868 ({{ variantCount }})</h3>
                    <ul class="mm-variant-list">
                        <li v-for="(v, name) in currentPart.variants" :key="name"
                            :class="{ active: name === activeVariantName }"
                            @click="switchVariant(name)">
                            {{ name }}
                            <span class="mm-variant-remove" @click="removeVariant(name)" v-if="variantCount > 1">\xD7</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!--- \u9009\u4E2D\u4E86\u4E00\u4E2A\u5143\u7D20\uFF1A\u663E\u793A\u5143\u7D20\u8BE6\u60C5 --->
            <div v-else class="mm-panel-body">
                <div class="mm-section">
                    <h3 class="mm-section-title">
                        {{ selectedElement.name || '\u672A\u547D\u540D' }}
                        <span class="mm-marker-badge" v-if="selectedMarker"
                              :style="{ background: getMarkerColor(selectedMarker.type) }">
                            {{ getMarkerLabel(selectedMarker.type) }}
                        </span>
                    </h3>
                    <p class="mm-element-info">\u7C7B\u578B: {{ getElementType(selectedElement) }}</p>
                    <p class="mm-element-info">UUID: {{ selectedElement.uuid }}</p>
                </div>
                <p class="mm-panel-hint" v-if="!selectedMarker">\u8BE5\u5143\u7D20\u5C1A\u672A\u6807\u8BB0\u3002\u8BF7\u5728 Outliner \u4E2D\u53F3\u952E\u8FDB\u884C\u6807\u8BB0\u3002</p>
            </div>
        </div>
        <div v-else class="mm-panel mm-panel-empty">
            <p>\u521D\u59CB\u5316 MachineMax \u914D\u7F6E\u4E2D...</p>
            <p class="mm-element-info">\u8BF7\u786E\u4FDD\u5DF2\u6253\u5F00\u6216\u521B\u5EFA\u4E00\u4E2A .bbmodel \u6A21\u578B\u6587\u4EF6</p>
        </div>
    `,
        data: function() {
          return {
            config: null,
            activePartId: "",
            activeVariantName: "",
            selectedElement: null,
            newTag: ""
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
          selectedMarker: function() {
            if (!this.selectedElement) return null;
            const part = this.currentPart;
            if (!part || !part.element_markers) return null;
            const vMarkers = part.element_markers[this.activeVariantName];
            if (!vMarkers) return null;
            return vMarkers[this.selectedElement.uuid] || null;
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
            refreshOutlinerIcons();
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
            refreshOutlinerIcons();
            this.selectedElement = null;
            Blockbench.dispatchEvent("update_selection");
          },
          switchVariant: function(name) {
            log2.debug("switchVariant: \u70B9\u51FB\u5207\u6362\u53D8\u4F53", { name });
            this.activeVariantName = name;
            this.onVariantChange();
          },
          addTag: function() {
            if (!this.newTag.trim() || !this.currentVariant) {
              log2.debug("addTag: \u6807\u7B7E\u4E3A\u7A7A\u6216\u65E0\u5F53\u524D\u53D8\u4F53\uFF0C\u8DF3\u8FC7");
              return;
            }
            if (!this.currentVariant.tags) this.currentVariant.tags = [];
            this.currentVariant.tags.push(this.newTag.trim());
            log2.debug("addTag: \u5DF2\u6DFB\u52A0\u6807\u7B7E", { tag: this.newTag.trim() });
            this.newTag = "";
          },
          removeTag: function(index) {
            if (this.currentVariant && this.currentVariant.tags) {
              var removed = this.currentVariant.tags[index];
              this.currentVariant.tags.splice(index, 1);
              log2.debug("removeTag: \u5DF2\u5220\u9664\u6807\u7B7E", { index, tag: removed });
            }
          },
          removeVariant: function(name) {
            log2.debug("removeVariant: \u5220\u9664\u53D8\u4F53", { name });
            const config = getConfig();
            if (!config || !this.currentPart) {
              log2.warn("removeVariant: config \u6216 currentPart \u4E3A\u7A7A");
              return;
            }
            delete this.currentPart.variants[name];
            const remaining = Object.keys(this.currentPart.variants);
            this.activeVariantName = remaining.length > 0 ? remaining[0] : "";
            log2.debug("removeVariant: \u5269\u4F59\u53D8\u4F53", { remaining });
            this.onVariantChange();
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
                  config.parts[partId] = cfg.createPartConfig(partId, variantName);
                  if (model) {
                    config.parts[partId].variants[variantName].model = model;
                  }
                  config._uiState.activePartId = partId;
                  config._uiState.activeVariantName = variantName;
                  log2.info("UI\u65B0\u5EFA\u96F6\u4EF6\u6210\u529F", { partId, variant: variantName });
                  require_mode().refreshOutlinerIcons();
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
                part.variants[variantName] = createVariantConfig();
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
            if (!sel || sel.length === 0) {
              this.selectedElement = null;
              log2.debug("onSelectionChange: \u53D6\u6D88\u9009\u4E2D");
              return;
            }
            var best = typeof Group !== "undefined" && Group.first_selected || sel[0];
            this.selectedElement = best;
            log2.debug("onSelectionChange: \u9009\u4E2D\u5143\u7D20", {
              name: best.name,
              uuid: best.uuid,
              type: best.constructor ? best.constructor.name : typeof best,
              groupSelected: !!(typeof Group !== "undefined" && Group.first_selected)
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

  // src/mode.js
  var require_mode = __commonJS({
    "src/mode.js"(exports, module) {
      var { getMarkersForVariant, setMarker, clearMarker, getMarker, MARKER_TYPES, getMarkerInfo } = require_element_markers();
      var { loadConfig, saveConfig, getConfig } = require_persistence();
      var { showToast: showToast2 } = require_notify();
      var { createLogger: createLogger2 } = require_logger();
      var _mmVueComponent = null;
      var _mmCssInserted = false;
      var log2 = createLogger2("Mode");
      var _originalShowContextMenus = {};
      var _PATCH_TARGETS = ["OutlinerNode", "Group", "OutlinerElement"];
      var _originalOutlinerElementSelect = null;
      var _mmActionIds = ["mm_validate", "mm_export", "mm_new_part", "mm_project_settings"];
      var _mmActionInstances = [];
      function getIconClassForType(type) {
        const info = getMarkerInfo(type);
        return info ? info.icon : "";
      }
      function refreshOutlinerIcons() {
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
            el.icon = "";
          }
        }
      }
      function resetOutlinerIcons() {
        if (!Project || Project === 0) return;
        const allElements = [...Group.all, ...Locator.all];
        for (const el of allElements) {
          el.icon = "";
        }
      }
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
          hintItems.push({ name: "\u26A0\uFE0F \u8BF7\u5148\u65B0\u5EFA\u96F6\u4EF6", icon: "add", click: function() {
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
                  refreshOutlinerIcons();
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
          hintItems.push({ name: "\u{1F4CB} \u9879\u76EE\u7BA1\u7406", icon: "settings", click: function() {
            log2.debug('\u53F3\u952E\u83DC\u5355: \u70B9\u51FB\u4E86"\u9879\u76EE\u7BA1\u7406"');
            var cfg = getConfig();
            if (!cfg) return;
            var partCount = Object.keys(cfg.parts || {}).length;
            try {
              new Dialog({
                title: "\u2699 MachineMax \u9879\u76EE\u7BA1\u7406",
                form: {
                  namespace: { type: "text", label: "\u547D\u540D\u7A7A\u95F4", value: cfg.namespace },
                  info: { type: "display", label: "\u7EDF\u8BA1", lines: [
                    "\u6A21\u578B: " + (Project.name || "\u672A\u547D\u540D"),
                    "\u96F6\u4EF6\u6570: " + partCount,
                    "\u8FDE\u63A5\u70B9\u5B9A\u4E49: " + Object.keys(cfg.connector_defs || {}).length,
                    "\u5B50\u7CFB\u7EDF\u578B\u53F7: " + Object.keys(cfg.subsystem_defs || {}).length,
                    "\u6750\u6599\u5B9A\u4E49: " + Object.keys(cfg.material_defs || {}).length
                  ] }
                },
                onConfirm: function(formData) {
                  cfg.namespace = formData.namespace;
                  log2.info("\u9879\u76EE\u7BA1\u7406: \u547D\u540D\u7A7A\u95F4\u5DF2\u66F4\u65B0", { namespace: formData.namespace });
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
            items.push({ name: "\u{1F4E6} \u6807\u8BB0\u4E3A\u5B50\u96F6\u4EF6", icon: "inventory_2", click: function() {
              log2.debug("\u53F3\u952E\u83DC\u5355: \u6807\u8BB0\u4E3A\u5B50\u96F6\u4EF6", { uuid: el.uuid, name: el.name });
              setMarker(config, activePartId, activeVariantName, el.uuid, "sub_part", null);
              refreshOutlinerIcons();
              Blockbench.dispatchEvent("update_selection");
            } });
          }
          if (!marker || marker.type !== "hit_box") {
            items.push({ name: "\u{1F535} \u6807\u8BB0\u4E3A\u78B0\u649E\u7BB1", icon: "select_all", click: function() {
              log2.debug("\u53F3\u952E\u83DC\u5355: \u6807\u8BB0\u4E3A\u78B0\u649E\u7BB1", { uuid: el.uuid, name: el.name });
              setMarker(config, activePartId, activeVariantName, el.uuid, "hit_box", null);
              refreshOutlinerIcons();
              Blockbench.dispatchEvent("update_selection");
            } });
          }
        } else if (el instanceof Locator) {
          var locatorTypes = ["connector", "seat", "lighting", "subsystem_locator"];
          var labels = {
            connector: "\u{1F4CC} \u6807\u8BB0\u4E3A\u8FDE\u63A5\u70B9",
            seat: "\u{1F7E1} \u6807\u8BB0\u4E3A\u5EA7\u4F4D\u5B9A\u4F4D\u70B9",
            lighting: "\u{1F7E0} \u6807\u8BB0\u4E3A\u706F\u5149\u5B9A\u4F4D\u70B9",
            subsystem_locator: "\u2699 \u6807\u8BB0\u4E3A\u5B50\u7CFB\u7EDF\u5B9A\u4F4D\u70B9"
          };
          var icons = {
            connector: "link",
            seat: "event_seat",
            lighting: "lightbulb",
            subsystem_locator: "precision_manufacturing"
          };
          for (var t = 0; t < locatorTypes.length; t++) {
            var type = locatorTypes[t];
            if (!marker || marker.type !== type) {
              items.push({ name: labels[type], icon: icons[type], click: /* @__PURE__ */ (function(capturedType) {
                return function() {
                  log2.debug("\u53F3\u952E\u83DC\u5355: \u6807\u8BB0\u4E3A" + capturedType, { uuid: el.uuid, name: el.name });
                  setMarker(config, activePartId, activeVariantName, el.uuid, capturedType, null);
                  refreshOutlinerIcons();
                  Blockbench.dispatchEvent("update_selection");
                };
              })(type) });
            }
          }
        }
        if (marker) {
          var info = MARKER_TYPES[marker.type];
          if (info) {
            items.push({ name: "\u{1F50D} \u5728\u5C5E\u6027\u9762\u677F\u4E2D\u67E5\u770B (" + info.label + ")", icon: "search", click: function() {
              log2.debug("\u53F3\u952E\u83DC\u5355: \u5728\u5C5E\u6027\u9762\u677F\u4E2D\u67E5\u770B", { type: marker.type, uuid: el.uuid });
              Blockbench.dispatchEvent("update_selection");
            } });
          }
          items.push({ name: "\u{1F5D1}\uFE0F \u6E05\u9664 MachineMax \u6807\u8BB0", icon: "delete", click: function() {
            log2.debug("\u53F3\u952E\u83DC\u5355: \u6E05\u9664\u6807\u8BB0", { type: marker.type, uuid: el.uuid });
            clearMarker(config, activePartId, activeVariantName, el.uuid);
            refreshOutlinerIcons();
            Blockbench.dispatchEvent("update_selection");
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
          if (Mode.selected && Mode.selected.id === "machine_max_part" && this.parent instanceof Group) {
            return this.parent.select(event, is_outliner_click);
          }
          return _originalOutlinerElementSelect.call(this, event, is_outliner_click);
        };
        log2.info("patchElementSelect: \u5DF2\u52AB\u6301 OutlinerElement.prototype.select \u2014 \u70B9cube\u5C06\u81EA\u52A8\u9009\u7EC4");
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
              showToast2("\u6821\u9A8C\u901A\u8FC7 \u2705", "positive");
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
            log2.debug('\u5DE5\u5177\u680F: \u70B9\u51FB"\u5BFC\u51FA\u5185\u5BB9\u5305"\uFF08\u5C1A\u672A\u5B9E\u73B0\uFF09');
            showToast2("\u5BFC\u51FA\u529F\u80FD\u5C06\u5728\u9636\u6BB5\u56DB\u5B9E\u73B0", "info");
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
            const connCount = Object.keys(config.connector_defs).length;
            const subCount = Object.keys(config.subsystem_defs).length;
            const matCount = Object.keys(config.material_defs).length;
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
              parts: partCount,
              connectors: connCount,
              subsystems: subCount,
              materials: matCount
            });
            new Dialog({
              title: "\u2699 MachineMax \u9879\u76EE\u7BA1\u7406",
              form: {
                namespace: { type: "text", label: "\u547D\u540D\u7A7A\u95F4", value: config.namespace },
                info: { type: "display", label: "\u7EDF\u8BA1", lines: [
                  "\u6A21\u578B: " + (Project.name || "\u672A\u547D\u540D"),
                  "\u96F6\u4EF6\u6570: " + partCount,
                  "\u8FDE\u63A5\u70B9\u5B9A\u4E49: " + connCount,
                  "\u5B50\u7CFB\u7EDF\u578B\u53F7: " + subCount,
                  "\u6750\u6599\u5B9A\u4E49: " + matCount,
                  partCount > 0 ? "\n\u96F6\u4EF6\u5217\u8868:\n" + partList : "\uFF08\u6682\u65E0\u96F6\u4EF6\uFF09"
                ] }
              },
              onConfirm: function(formData) {
                config.namespace = formData.namespace;
                log2.info("\u9879\u76EE\u7BA1\u7406: \u547D\u540D\u7A7A\u95F4\u5DF2\u66F4\u65B0", { namespace: formData.namespace });
                saveConfig();
                this.hide();
              }
            }).show();
          }
        }));
        log2.info("registerToolbarActions: \u5B8C\u6210\uFF0C\u6CE8\u518C\u4E86 " + _mmActionInstances.length + " \u4E2A Action");
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
          }
        }
        return errors;
      }
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
        if (!_mmCssInserted) {
          try {
            const mmCss = ".mm-panel {\n    padding: 12px;\n    height: 100%;\n    overflow-y: auto;\n    font-size: 13px;\n    color: var(--text-color, #ddd);\n}\n\n.mm-panel-empty {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    color: #888;\n}\n\n.mm-panel-header {\n    margin-bottom: 12px;\n    padding-bottom: 8px;\n    border-bottom: 1px solid var(--border-color, #333);\n}\n\n.mm-nav-row {\n    display: flex;\n    align-items: center;\n    gap: 6px;\n    margin-bottom: 6px;\n}\n\n.mm-label {\n    font-size: 12px;\n    color: #aaa;\n    min-width: 32px;\n    flex-shrink: 0;\n}\n\n.mm-select {\n    flex: 1;\n    background: var(--input-bg, #2a2a2a);\n    border: 1px solid var(--border-color, #444);\n    color: var(--text-color, #ddd);\n    padding: 4px 8px;\n    border-radius: 3px;\n    font-size: 12px;\n    cursor: pointer;\n}\n\n.mm-input {\n    width: 100%;\n    background: var(--input-bg, #2a2a2a);\n    border: 1px solid var(--border-color, #444);\n    color: var(--text-color, #ddd);\n    padding: 4px 8px;\n    border-radius: 3px;\n    font-size: 12px;\n    box-sizing: border-box;\n}\n\n.mm-input:focus {\n    border-color: #4A90D9;\n    outline: none;\n}\n\n.mm-btn {\n    background: var(--btn-bg, #3a3a3a);\n    border: 1px solid var(--border-color, #555);\n    color: var(--text-color, #ddd);\n    padding: 4px 10px;\n    border-radius: 3px;\n    cursor: pointer;\n    font-size: 12px;\n    white-space: nowrap;\n}\n\n.mm-btn:hover {\n    background: var(--btn-hover-bg, #4a4a4a);\n}\n\n.mm-btn-sm {\n    padding: 2px 8px;\n    font-size: 14px;\n    line-height: 1;\n}\n\n.mm-section {\n    margin-bottom: 16px;\n}\n\n.mm-section-title {\n    font-size: 13px;\n    font-weight: 600;\n    margin: 0 0 8px 0;\n    padding-bottom: 4px;\n    border-bottom: 1px solid var(--border-color, #333);\n    color: var(--heading-color, #eee);\n}\n\n.mm-field {\n    margin-bottom: 8px;\n    display: flex;\n    flex-direction: column;\n    gap: 2px;\n}\n\n.mm-field label {\n    font-size: 11px;\n    color: #999;\n    margin-bottom: 1px;\n}\n\n.mm-field-row {\n    flex-direction: row;\n    align-items: center;\n    gap: 8px;\n}\n\n.mm-field-row label {\n    margin-bottom: 0;\n}\n\n.mm-tags {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 4px;\n    align-items: center;\n}\n\n.mm-tag {\n    background: var(--tag-bg, #3a6a9a);\n    color: white;\n    padding: 2px 8px;\n    border-radius: 3px;\n    font-size: 11px;\n    display: flex;\n    align-items: center;\n    gap: 4px;\n}\n\n.mm-tag-remove {\n    cursor: pointer;\n    font-weight: bold;\n    font-size: 14px;\n    line-height: 1;\n}\n\n.mm-tag-remove:hover {\n    color: #ff6b6b;\n}\n\n.mm-input-tag {\n    background: transparent;\n    border: none;\n    border-bottom: 1px dashed var(--border-color, #555);\n    color: var(--text-color, #ddd);\n    padding: 2px 4px;\n    font-size: 11px;\n    min-width: 80px;\n    flex: 1;\n}\n\n.mm-input-tag:focus {\n    outline: none;\n    border-bottom-color: #4A90D9;\n}\n\n.mm-variant-list {\n    list-style: none;\n    padding: 0;\n    margin: 0;\n}\n\n.mm-variant-list li {\n    padding: 4px 8px;\n    cursor: pointer;\n    font-size: 12px;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    border-radius: 3px;\n}\n\n.mm-variant-list li:hover {\n    background: var(--hover-bg, #333);\n}\n\n.mm-variant-list li.active {\n    background: var(--active-bg, #2a4a6a);\n    color: white;\n}\n\n.mm-variant-remove {\n    cursor: pointer;\n    color: #ff6b6b;\n    font-weight: bold;\n}\n\n.mm-element-info {\n    font-size: 11px;\n    color: #888;\n    margin: 2px 0;\n}\n\n.mm-marker-badge {\n    display: inline-block;\n    padding: 1px 6px;\n    border-radius: 3px;\n    font-size: 10px;\n    color: white;\n    margin-left: 6px;\n    vertical-align: middle;\n}\n\n.mm-panel-hint {\n    color: #666;\n    font-size: 12px;\n    text-align: center;\n    padding: 20px;\n}\n\n.mm-panel-body {\n    height: calc(100% - 60px);\n    overflow-y: auto;\n}";
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
            refreshOutlinerIcons();
            log2.debug("onSelect: \u8C03\u7528 patchShowContextMenu...");
            patchShowContextMenu();
            log2.debug("onSelect: \u8C03\u7528 patchElementSelect...");
            patchElementSelect();
            Blockbench.dispatchEvent("update_selection");
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
        log2.info('registerMode: \u6A21\u5F0F "\u96F6\u4EF6\u5B9A\u4E49" \u5DF2\u6CE8\u518C');
        return mmMode;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          registerMode: registerMode2,
          refreshOutlinerIcons,
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

  // src/generators/meta_generator.js
  var require_meta_generator = __commonJS({
    "src/generators/meta_generator.js"(exports, module) {
      var { createPackMeta } = require_config();
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("GenMeta");
      function generateMeta(projectConfig) {
        var meta = createPackMeta(projectConfig);
        var parts = projectConfig.parts || {};
        var partIds = Object.keys(parts);
        log2.info("generateMeta: \u5305ID=" + meta.id + ", \u96F6\u4EF6\u6570=" + partIds.length);
        return meta;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = { generateMeta };
      }
    }
  });

  // src/generators/lang_generator.js
  var require_lang_generator = __commonJS({
    "src/generators/lang_generator.js"(exports, module) {
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
      var { createLogger: createLogger2 } = require_logger();
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
        if (sp.hit_boxes && Object.keys(sp.hit_boxes).length > 0) out.hit_boxes = sp.hit_boxes;
        if (sp.interact_boxes && Object.keys(sp.interact_boxes).length > 0) out.interact_boxes = sp.interact_boxes;
        if (sp.connectors && Object.keys(sp.connectors).length > 0) out.connectors = sp.connectors;
        if (sp.subsystems && Object.keys(sp.subsystems).length > 0) out.subsystems = sp.subsystems;
        if (sp.hydrodynamics) out.hydrodynamics = sp.hydrodynamics;
        return out;
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
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("GenConnector");
      function generateConnectorJSON(defId, def) {
        const output = {};
        if (def.type) output.type = def.type;
        if (def.direction) output.direction = def.direction;
        if (def.integrity !== 20) output.integrity = def.integrity;
        if (def.damage_reduction !== 2) output.damage_reduction = def.damage_reduction;
        if (def.damage_multiplier !== 1.5) output.damage_multiplier = def.damage_multiplier;
        if (def.damage_absorption !== 0.2) output.damage_absorption = def.damage_absorption;
        if (def.collide_between) output.collide_between = true;
        if (def.required_tags && def.required_tags.length > 0) output.required_tags = def.required_tags;
        if (def.accepted_tags && def.accepted_tags.length > 0) output.accepted_tags = def.accepted_tags;
        if (def.rejected_tags && def.rejected_tags.length > 0) output.rejected_tags = def.rejected_tags;
        if (def.joints && def.joints.length > 0) output.joints = def.joints;
        return output;
      }
      function generateAllConnectors(projectConfig) {
        const defs = projectConfig.connector_defs || {};
        const result = {};
        for (const [defId, def] of Object.entries(defs)) {
          result[defId] = generateConnectorJSON(defId, def);
        }
        log2.info("generateAllConnectors: \u5DF2\u751F\u6210 " + Object.keys(result).length + " \u4E2A\u8FDE\u63A5\u70B9\u5B9A\u4E49");
        return result;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = { generateConnectorJSON, generateAllConnectors };
      }
    }
  });

  // src/generators/subsystem_generator.js
  var require_subsystem_generator = __commonJS({
    "src/generators/subsystem_generator.js"(exports, module) {
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("GenSubsystem");
      function generateSubsystemJSON(defId, def) {
        const output = {};
        if (def.type) output.type = def.type;
        if (def.basic_durability !== 20) output.basic_durability = def.basic_durability;
        if (!def.pass_damage) output.pass_damage = false;
        if (def.limit_damage) output.limit_damage = true;
        if (def.hidden) output.hidden = true;
        if (def.destroy_sound_event) output.destroy_sound_event = def.destroy_sound_event;
        if (def.activate_sound_event) output.activate_sound_event = def.activate_sound_event;
        if (def.deactivate_sound_event) output.deactivate_sound_event = def.deactivate_sound_event;
        const typeSpecificFields = getTypeSpecificFields(def.type);
        for (const field of typeSpecificFields) {
          if (def[field] !== void 0 && def[field] !== null) {
            output[field] = def[field];
          }
        }
        return output;
      }
      function getTypeSpecificFields(type) {
        const fields = {
          "machine_max:engine": ["max_power", "max_torque", "idle_rpm", "idle_torque_ratio", "peak_torque_rpm", "red_line_rpm", "red_line_torque_ratio", "inertia", "four_stroke", "cylinder_count", "drag_coefficients", "control_channels", "sound_map"],
          "machine_max:motor": ["max_power", "max_torque", "red_line_rpm", "inertia"],
          "machine_max:gearbox": ["forward_gears", "reverse_gears", "shift_time", "shift_speed"],
          "machine_max:wheel_driver": ["friction", "suspension_stiffness", "suspension_damping", "suspension_travel", "wheel_radius", "wheel_width"],
          "machine_max:seat": ["mount_offset", "view_offset", "eye_offset", "player_scale"],
          "machine_max:car_controller": ["steer_speed", "steer_return_speed", "max_steer_angle"],
          "machine_max:motorbike_controller": ["lean_angle_max", "lean_speed"],
          "machine_max:transmission": ["efficiency", "front_split", "rear_split", "center_split"],
          "machine_max:lighting": ["radius", "color", "intensity", "falloff", "flicker", "shadow"],
          "machine_max:item_storage": ["rows", "columns", "filter"],
          "machine_max:motor_controller": ["power_distribution", "speed_control"],
          "machine_max:basic": [],
          "machine_max:battery": ["capacity", "voltage", "max_discharge", "max_charge"],
          "machine_max:joint": ["torque", "speed", "angle_limit", "axis"],
          "machine_max:signal_convert": ["mappings"],
          "machine_max:camera": ["fov", "clip_near", "clip_far", "follow"],
          "machine_max:javascript": ["script"],
          "machine_max:turret": ["yaw_speed", "pitch_speed", "yaw_limit", "pitch_limit"],
          "machine_max:fire_controller": ["fire_modes", "rate_of_fire", "ammo_types"],
          "machine_max:launcher": ["launch_speed", "ammo_type", "reload_time"]
        };
        return fields[type] || [];
      }
      function generateAllSubsystems(projectConfig) {
        const defs = projectConfig.subsystem_defs || {};
        const result = {};
        for (const [defId, def] of Object.entries(defs)) {
          result[defId] = generateSubsystemJSON(defId, def);
        }
        log2.info("generateAllSubsystems: \u5DF2\u751F\u6210 " + Object.keys(result).length + " \u4E2A\u5B50\u7CFB\u7EDF\u5B9A\u4E49");
        return result;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = { generateSubsystemJSON, generateAllSubsystems, getTypeSpecificFields };
      }
    }
  });

  // src/generators/material_generator.js
  var require_material_generator = __commonJS({
    "src/generators/material_generator.js"(exports, module) {
      var { createLogger: createLogger2 } = require_logger();
      var log2 = createLogger2("GenMaterial");
      function generateMaterialJSON(defId, def) {
        const output = {};
        if (def.friction !== 0.5) output.friction = def.friction;
        if (def.restitution !== 0.3) output.restitution = def.restitution;
        if (def.density !== 1) output.density = def.density;
        if (def.armor_thickness !== 1) output.armor_thickness = def.armor_thickness;
        if (def.armor_toughness !== 0) output.armor_toughness = def.armor_toughness;
        if (def.hit_sound) output.hit_sound = def.hit_sound;
        if (def.break_sound) output.break_sound = def.break_sound;
        if (def.particle) output.particle = def.particle;
        return output;
      }
      function generateAllMaterials(projectConfig) {
        const defs = projectConfig.material_defs || {};
        const result = {};
        for (const [defId, def] of Object.entries(defs)) {
          result[defId] = generateMaterialJSON(defId, def);
        }
        log2.info("generateAllMaterials: \u5DF2\u751F\u6210 " + Object.keys(result).length + " \u4E2A\u6750\u6599\u5B9A\u4E49");
        return result;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = { generateMaterialJSON, generateAllMaterials };
      }
    }
  });

  // src/ui/menu.js
  var require_menu = __commonJS({
    "src/ui/menu.js"(exports, module) {
      var { createLogger: createLogger2 } = require_logger();
      var { getConfig, saveConfig } = require_persistence();
      var { showToast: showToast2 } = require_notify();
      var { runValidation } = require_mode();
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
              _showExportDialog();
            }
          },
          "_",
          {
            name: "\u5185\u5BB9\u5305\u8BBE\u7F6E",
            icon: "settings",
            id: "mm_menu_pack_settings",
            click: function() {
              log2.info("MachineMax \u83DC\u5355: \u70B9\u51FB\u5185\u5BB9\u5305\u8BBE\u7F6E");
              _showPackSettingsDialog();
            }
          },
          "_",
          {
            name: "\u521B\u5EFA/\u7BA1\u7406\u6750\u6599\u7C7B\u578B",
            icon: "Texture",
            id: "mm_menu_materials",
            click: function() {
              _showPlaceholder(
                "\u6750\u6599\u7C7B\u578B\u7BA1\u7406",
                "\u5728\u6B64\u5904\u53EF\u4EE5\u521B\u5EFA\u81EA\u5B9A\u4E49\u6750\u6599\uFF08Material\uFF09\uFF0C\u4E3A\u96F6\u4EF6\u8D4B\u4E88\u4E0D\u540C\u7684\u7269\u7406\u5C5E\u6027\u3002\n\n\u6BCF\u4E2A\u6750\u6599\u5B9A\u4E49\u5305\u542B\uFF1A\n  \u2022 friction \u2014 \u6469\u64E6\u7CFB\u6570\n  \u2022 restitution \u2014 \u5F39\u6027\u6062\u590D\n  \u2022 density \u2014 \u5BC6\u5EA6\n  \u2022 armor_thickness / armor_toughness \u2014 \u88C5\u7532\u53C2\u6570\n\n\u6B64\u529F\u80FD\u5C06\u5728\u540E\u7EED\u7248\u672C\u4E2D\u63D0\u4F9B\u3002"
              );
            }
          },
          {
            name: "\u7BA1\u7406\u5B50\u7CFB\u7EDF\u578B\u53F7",
            icon: "precision_manufacturing",
            id: "mm_menu_subsystems",
            click: function() {
              _showPlaceholder(
                "\u5B50\u7CFB\u7EDF\u578B\u53F7\u7BA1\u7406",
                "\u5728\u6B64\u5904\u53EF\u4EE5\u521B\u5EFA\u5E76\u7BA1\u7406\u5B50\u7CFB\u7EDF\u578B\u53F7\uFF08Subsystem\uFF09\uFF0C\u5B9A\u4E49\u5F15\u64CE\u3001\u53D8\u901F\u7BB1\u3001\u5EA7\u6905\u7B49\n\u529F\u80FD\u6A21\u5757\u7684\u9759\u6001\u53C2\u6570\u3002\n\n\u652F\u6301\u7684\u5B50\u7CFB\u7EDF\u7C7B\u578B\u5305\u62EC\uFF1A\n  engine, motor, gearbox, seat, wheel_driver,\n  car_controller, lighting, item_storage \u7B49\n\n\u6B64\u529F\u80FD\u5C06\u5728\u540E\u7EED\u7248\u672C\u4E2D\u63D0\u4F9B\u3002"
              );
            }
          },
          {
            name: "\u7BA1\u7406\u8FDE\u63A5\u70B9\u5B9A\u4E49",
            icon: "link",
            id: "mm_menu_connectors",
            click: function() {
              _showPlaceholder(
                "\u8FDE\u63A5\u70B9\u5B9A\u4E49\u7BA1\u7406",
                "\u5728\u6B64\u5904\u53EF\u4EE5\u521B\u5EFA\u5E76\u7BA1\u7406\u8FDE\u63A5\u70B9\uFF08Connector\uFF09\u9759\u6001\u5B9A\u4E49\uFF0C\n\u51B3\u5B9A\u96F6\u4EF6\u4E4B\u95F4\u7684\u8FDE\u63A5\u89C4\u5219\u3002\n\n\u6BCF\u4E2A\u8FDE\u63A5\u70B9\u5B9A\u4E49\u5305\u542B\uFF1A\n  \u2022 type \u2014 \u8FDE\u63A5\u7C7B\u578B\uFF08Simple/Fixed/Rotational/\u2026\uFF09\n  \u2022 direction \u2014 \u8FDE\u63A5\u65B9\u5411\n  \u2022 required_tags / accepted_tags / rejected_tags \u2014 \u6807\u7B7E\u8FC7\u6EE4\n  \u2022 joints \u2014 \u5173\u8282\u914D\u7F6E\n\n\u6B64\u529F\u80FD\u5C06\u5728\u540E\u7EED\u7248\u672C\u4E2D\u63D0\u4F9B\u3002"
              );
            }
          }
        ], {
          name: "MachineMax",
          icon: "precision_manufacturing",
          condition: { modes: ["machine_max_part"] }
        });
        MenuBar.addMenu(_machineMaxMenu, "tools");
        log2.info("MachineMax \u83DC\u5355\u5DF2\u6CE8\u518C\uFF08\u4F4D\u4E8E Tools \u4E4B\u540E\uFF09");
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
      function _getDefaultExportDir(pm) {
        var path = __require("path");
        var cached = pm && pm.exportDir;
        if (cached) return cached;
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
            title: "\u2699 MachineMax \u5185\u5BB9\u5305\u8BBE\u7F6E",
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
                description: "\u82E5\u542F\u7528\uFF0CSpark-Core \u5C06\u5728\u542F\u52A8\u65F6\u81EA\u52A8\u4ECE Mod \u8D44\u6E90\u4E2D\u6253\u5305 .zip\uFF08\u4EC5 Mod \u5185\u5D4C\u5185\u5BB9\u5305\u573A\u666F\uFF09"
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
              saveConfig();
              showToast2("\u5185\u5BB9\u5305\u8BBE\u7F6E\u5DF2\u4FDD\u5B58", "positive");
              log2.info("\u5185\u5BB9\u5305\u8BBE\u7F6E\u5DF2\u66F4\u65B0", {
                packId: packMeta.id,
                version: packMeta.version,
                name: packMeta.name,
                exportDir: packMeta.exportDir
              });
              this.hide();
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
          errorText = "\n\u26A0 \u6821\u9A8C\u53D1\u73B0 " + errors.length + " \u4E2A\u95EE\u9898:\n" + errors.map(function(e) {
            return "  \u2022 " + e;
          }).join("\n");
        }
        var connCount = Object.keys(config.connector_defs || {}).length;
        var subCount = Object.keys(config.subsystem_defs || {}).length;
        var matCount = Object.keys(config.material_defs || {}).length;
        var statLines = [
          "\u6A21\u578B: " + (Project ? Project.name : "\u672A\u547D\u540D"),
          "\u547D\u540D\u7A7A\u95F4: " + ns,
          "\u96F6\u4EF6: " + partCount,
          "\u8FDE\u63A5\u70B9\u5B9A\u4E49: " + connCount,
          "\u5B50\u7CFB\u7EDF\u578B\u53F7: " + subCount,
          "\u6750\u6599\u5B9A\u4E49: " + matCount
        ];
        try {
          new Dialog({
            title: "\u{1F4E6} \u5BFC\u51FA MachineMax \u5185\u5BB9\u5305",
            width: 580,
            form: {
              validationInfo: {
                type: "info",
                text: (errorText || "\u2705 \u6821\u9A8C\u901A\u8FC7\uFF0C\u672A\u53D1\u73B0\u95EE\u9898\u3002") + "\n\n" + statLines.join("\n")
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
              dependencies: {
                type: "textarea",
                label: "\u4F9D\u8D56\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF09",
                value: (pm.dependencies || []).map(function(d) {
                  return typeof d === "string" ? d : d.id + " " + (d.type || "hard");
                }).join("\n"),
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
              var overriddenMeta = {
                id: formData.packId || defaultPackId,
                version: formData.packVersion || "1.0",
                name: formData.packName || pm.name || "",
                author: formData.packAuthor || pm.author || "",
                description: formData.packDescription || pm.description || "",
                enable_auto_pack: pm.enable_auto_pack !== false,
                exportDir,
                dependencies: _parseDependencyText(formData.dependencies || "")
              };
              if (!config.packMeta) config.packMeta = {};
              Object.assign(config.packMeta, overriddenMeta);
              try {
                var stats = _executeExport(config, overriddenMeta, exportDir);
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
      function _showPlaceholder(title, description) {
        try {
          new Dialog({
            title: "\u2699 " + title + "\uFF08\u5373\u5C06\u63A8\u51FA\uFF09",
            lines: description.split("\n"),
            onConfirm: function() {
              this.hide();
            }
          }).show();
        } catch (e) {
          log2.error("_showPlaceholder Dialog \u5931\u8D25", e);
          showToast2(title + "\uFF1A\u6B64\u529F\u80FD\u5C1A\u672A\u5B9E\u73B0", "info");
        }
      }
      function _executeExport(config, packMeta, exportDir) {
        var fs = __require("fs");
        var path = __require("path");
        if (!fs.existsSync(exportDir)) {
          fs.mkdirSync(exportDir, { recursive: true });
        }
        var ns = config.namespace || "machine_max";
        var stats = { parts: 0, connectors: 0, subsystems: 0, materials: 0, langs: 0 };
        var genMeta = require_meta_generator();
        var savedPackMeta = config.packMeta;
        config.packMeta = packMeta;
        var meta = genMeta.generateMeta(config);
        config.packMeta = savedPackMeta;
        _ensureWriteJSON(path.join(exportDir, "meta.json"), meta);
        var genLang = require_lang_generator();
        var allLangs = genLang.generateAllLangs(config);
        if (allLangs) {
          var langDir = path.join(exportDir, ns, "lang");
          for (var locale in allLangs) {
            if (allLangs.hasOwnProperty(locale)) {
              _ensureWriteJSON(path.join(langDir, locale + ".json"), allLangs[locale]);
              stats.langs++;
            }
          }
        }
        var genParts = require_part_generator();
        var allParts = genParts.generateAllParts(config);
        var modelsDir = path.join(exportDir, ns, "models");
        for (var partId in allParts) {
          if (allParts.hasOwnProperty(partId)) {
            _ensureWriteJSON(path.join(modelsDir, partId + ".json"), allParts[partId]);
            stats.parts++;
          }
        }
        if (config.recipes && Object.keys(config.recipes).length > 0) {
          var recipeDir = path.join(exportDir, ns, "recipe");
          for (var recipeId in config.recipes) {
            if (config.recipes.hasOwnProperty(recipeId)) {
              _ensureWriteJSON(path.join(recipeDir, recipeId + ".json"), config.recipes[recipeId]);
            }
          }
        }
        var genConnectors = require_connector_generator();
        var allConnectors = genConnectors.generateAllConnectors(config);
        if (allConnectors && Object.keys(allConnectors).length > 0) {
          var connDir = path.join(exportDir, ns, "connectors");
          for (var connId in allConnectors) {
            if (allConnectors.hasOwnProperty(connId)) {
              _ensureWriteJSON(path.join(connDir, connId + ".json"), allConnectors[connId]);
              stats.connectors++;
            }
          }
        }
        var genSubsystems = require_subsystem_generator();
        var allSubsystems = genSubsystems.generateAllSubsystems(config);
        if (allSubsystems && Object.keys(allSubsystems).length > 0) {
          var subDir = path.join(exportDir, ns, "subsystems");
          for (var subId in allSubsystems) {
            if (allSubsystems.hasOwnProperty(subId)) {
              _ensureWriteJSON(path.join(subDir, subId + ".json"), allSubsystems[subId]);
              stats.subsystems++;
            }
          }
        }
        var genMaterials = require_material_generator();
        var allMaterials = genMaterials.generateAllMaterials(config);
        if (allMaterials && Object.keys(allMaterials).length > 0) {
          var matDir = path.join(exportDir, ns, "materials");
          for (var matId in allMaterials) {
            if (allMaterials.hasOwnProperty(matId)) {
              _ensureWriteJSON(path.join(matDir, matId + ".json"), allMaterials[matId]);
              stats.materials++;
            }
          }
        }
        log2.info("\u5BFC\u51FA\u5B8C\u6210, \u96F6\u4EF6=" + stats.parts + ", \u8FDE\u63A5\u70B9=" + stats.connectors + ", \u5B50\u7CFB\u7EDF=" + stats.subsystems + ", \u6750\u6599=" + stats.materials + ", \u8BED\u8A00=" + stats.langs);
        return stats;
      }
      function _ensureWriteJSON(filePath, data) {
        var fs = __require("fs");
        var path = __require("path");
        var dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          registerMachineMaxMenu: registerMachineMaxMenu2,
          unregisterMachineMaxMenu: unregisterMachineMaxMenu2
        };
      }
    }
  });

  // src/plugin.js
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
