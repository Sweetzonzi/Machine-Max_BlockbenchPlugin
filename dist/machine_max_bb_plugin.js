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
      var MIGRATIONS = {
        2: function(v1config) {
          const v3 = v1config.project || v1config;
          v3.$schema_version = 3;
          v3.projectiles = v3.projectiles || {};
          v3.connector_defs = v3.connector_defs || {};
          v3.subsystem_defs = v3.subsystem_defs || {};
          v3.material_defs = v3.material_defs || {};
          return v3;
        }
      };
      function createBlankConfig() {
        return {
          $schema_version: CONFIG_VERSION,
          namespace: "machine_max",
          modelFile: "",
          parts: {},
          projectiles: {},
          connector_defs: {},
          subsystem_defs: {},
          material_defs: {},
          _uiState: {
            activeMode: "part",
            activePartId: "",
            activeVariantName: ""
          }
        };
      }
      function createPartConfig(partId, initialVariantName) {
        const part = JSON.parse(JSON.stringify(PART_DEFAULTS));
        part.element_markers = {};
        if (initialVariantName) {
          part.variants[initialVariantName] = createVariantConfig();
        }
        return part;
      }
      function createVariantConfig() {
        return JSON.parse(JSON.stringify(VARIANT_DEFAULTS));
      }
      function createSubPartConfig() {
        return JSON.parse(JSON.stringify(SUB_PART_DEFAULTS));
      }
      function createConnectorDef(defId) {
        const def = JSON.parse(JSON.stringify(CONNECTOR_DEF_DEFAULTS));
        return def;
      }
      function createSubsystemDef(defId) {
        const def = JSON.parse(JSON.stringify(SUBSYSTEM_DEF_DEFAULTS));
        return def;
      }
      function createMaterialDef(defId) {
        return JSON.parse(JSON.stringify(MATERIAL_DEF_DEFAULTS));
      }
      function ensureDefaults(config) {
        if (!config || typeof config !== "object") {
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
        return result;
      }
      function migrateIfNeeded(config) {
        if (!config || !config.$schema_version) {
          return ensureDefaults(config);
        }
        const version = config.$schema_version;
        if (version === CONFIG_VERSION) {
          return ensureDefaults(config);
        }
        let migrated = JSON.parse(JSON.stringify(config));
        for (let v = version; v < CONFIG_VERSION; v++) {
          if (MIGRATIONS[v]) {
            migrated = MIGRATIONS[v](migrated);
          }
        }
        return ensureDefaults(migrated);
      }
      function getActivePart(config) {
        if (!config || !config.parts) return null;
        const partId = config._uiState?.activePartId;
        if (!partId) return null;
        return config.parts[partId] || null;
      }
      function getActiveVariant(config) {
        const part = getActivePart(config);
        if (!part) return null;
        const variantName = config._uiState?.activeVariantName;
        if (!variantName) return null;
        return part.variants[variantName] || null;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          CONFIG_VERSION,
          createBlankConfig,
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
      function registerProperty2() {
        if (ModelProject.properties[PROPERTY_NAME]) {
          console.log("[MM Plugin]  Property \u5DF2\u6CE8\u518C\uFF0C\u8DF3\u8FC7");
          return;
        }
        new Property(ModelProject, "object", PROPERTY_NAME, {
          default: {},
          exposed: false
        });
        console.log("[MM Plugin]  Property machine_max_plugin \u5DF2\u6CE8\u518C");
      }
      function getBBModelPath() {
        if (Project && Project.file_path) {
          return Project.file_path;
        }
        return null;
      }
      function loadConfig() {
        const propData = Project[PROPERTY_NAME];
        if (propData && propData.$schema_version) {
          console.log("[MM Plugin]  \u4ECE Property \u52A0\u8F7D\u914D\u7F6E\uFF0C\u7248\u672C:", propData.$schema_version);
          return migrateIfNeeded(propData);
        }
        const bbmodelPath = getBBModelPath();
        if (bbmodelPath) {
          const standalonePath = bbmodelPath.replace(/\.bbmodel$/i, ".mm_project.json");
          try {
            const fs = __require("fs");
            if (fs.existsSync(standalonePath)) {
              const raw = JSON.parse(fs.readFileSync(standalonePath, "utf-8"));
              const config = raw.config || raw;
              console.log("[MM Plugin]  \u4ECE\u72EC\u7ACB\u6587\u4EF6\u52A0\u8F7D\u914D\u7F6E");
              Project[PROPERTY_NAME] = migrateIfNeeded(config);
              return Project[PROPERTY_NAME];
            }
          } catch (e) {
            console.warn("[MM Plugin]  \u5907\u9009\u914D\u7F6E\u8BFB\u53D6\u5931\u8D25:", e.message);
          }
        }
        console.log("[MM Plugin]  \u521B\u5EFA\u7A7A\u767D\u914D\u7F6E");
        const blank = createBlankConfig();
        Project[PROPERTY_NAME] = blank;
        return blank;
      }
      function saveConfig() {
        const config = Project[PROPERTY_NAME];
        if (!config) return;
        const bbmodelPath = getBBModelPath();
        if (!bbmodelPath) {
          console.warn("[MM Plugin]  \u672A\u627E\u5230 .bbmodel \u8DEF\u5F84\uFF0C\u8DF3\u8FC7\u72EC\u7ACB\u5907\u4EFD");
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
        } catch (e) {
          console.warn("[MM Plugin]  \u5907\u9009\u914D\u7F6E\u5199\u5165\u5931\u8D25:", e.message);
        }
        console.log("[MM Plugin]  \u914D\u7F6E\u5DF2\u4FDD\u5B58");
      }
      function getConfig() {
        return Project[PROPERTY_NAME] || null;
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
          return null;
        }
        return projectConfig.parts[partId];
      }
      function setMarker(projectConfig, partId, variantName, uuid, type, configRef) {
        const part = getOrCreatePartConfig(projectConfig, partId);
        if (!part) return false;
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
        return true;
      }
      function clearMarker(projectConfig, partId, variantName, uuid) {
        const part = getOrCreatePartConfig(projectConfig, partId);
        if (!part || !part.element_markers) return false;
        if (!part.element_markers[variantName]) return false;
        delete part.element_markers[variantName][uuid];
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
        if (!part || !part.element_markers) return;
        if (variantName) {
          delete part.element_markers[variantName];
        } else {
          part.element_markers = {};
        }
      }
      function getMarkersForVariant(projectConfig, partId, variantName) {
        const part = getOrCreatePartConfig(projectConfig, partId);
        if (!part || !part.element_markers) return {};
        return part.element_markers[variantName] || {};
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

  // src/ui/App.vue.js
  var require_App_vue = __commonJS({
    "src/ui/App.vue.js"(exports, module) {
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
            <p>\u52A0\u8F7D MachineMax \u914D\u7F6E\u4E2D...</p>
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
            const info = require_element_markers().getMarkerInfo(type);
            return info ? info.label : type;
          },
          getMarkerColor: function(type) {
            const info = require_element_markers().getMarkerInfo(type);
            return info ? info.color : "#888";
          },
          onPartChange: function() {
            const config = require_persistence().getConfig();
            if (!config || !this.activePartId) return;
            config._uiState.activePartId = this.activePartId;
            const part = config.parts[this.activePartId];
            if (part) {
              const variants = Object.keys(part.variants);
              this.activeVariantName = variants.length > 0 ? variants[0] : "default";
              config._uiState.activeVariantName = this.activeVariantName;
            }
            const { refreshOutlinerIcons } = require_mode();
            refreshOutlinerIcons();
            this.selectedElement = null;
            Blockbench.dispatchEvent("update_selection");
          },
          onVariantChange: function() {
            const config = require_persistence().getConfig();
            if (!config || !this.activeVariantName) return;
            config._uiState.activeVariantName = this.activeVariantName;
            const { refreshOutlinerIcons } = require_mode();
            refreshOutlinerIcons();
            this.selectedElement = null;
            Blockbench.dispatchEvent("update_selection");
          },
          switchVariant: function(name) {
            this.activeVariantName = name;
            this.onVariantChange();
          },
          addTag: function() {
            if (!this.newTag.trim() || !this.currentVariant) return;
            if (!this.currentVariant.tags) this.currentVariant.tags = [];
            this.currentVariant.tags.push(this.newTag.trim());
            this.newTag = "";
          },
          removeTag: function(index) {
            if (this.currentVariant && this.currentVariant.tags) {
              this.currentVariant.tags.splice(index, 1);
            }
          },
          removeVariant: function(name) {
            const config = require_persistence().getConfig();
            if (!config || !this.currentPart) return;
            delete this.currentPart.variants[name];
            const remaining = Object.keys(this.currentPart.variants);
            this.activeVariantName = remaining.length > 0 ? remaining[0] : "";
            this.onVariantChange();
          },
          showNewPartDialog: function() {
            const action = Action.actions.mm_new_part;
            if (action) action.click();
          },
          showNewVariantDialog: function() {
            const self = this;
            new Dialog({
              title: "\u65B0\u5EFA\u53D8\u4F53",
              form: {
                variantName: { type: "text", label: "\u53D8\u4F53\u540D" },
                model: { type: "text", label: "\u6A21\u578B\u5F15\u7528", value: "machine_max:" }
              },
              onConfirm: function(formData) {
                const { variantName, model } = formData;
                if (!variantName) {
                  Blockbench.showToast("\u53D8\u4F53\u540D\u4E0D\u80FD\u4E3A\u7A7A", "error");
                  return false;
                }
                const part = self.currentPart;
                if (!part) return false;
                if (part.variants[variantName]) {
                  Blockbench.showToast(`\u53D8\u4F53 "${variantName}" \u5DF2\u5B58\u5728`, "error");
                  return false;
                }
                const { createVariantConfig } = require_config();
                part.variants[variantName] = createVariantConfig();
                if (model) part.variants[variantName].model = model;
                self.activeVariantName = variantName;
                self.onVariantChange();
                this.hide();
              }
            });
          },
          onSelectionChange: function() {
            const sel = Outliner?.selected;
            if (sel && sel.length > 0) {
              this.selectedElement = sel[0];
            } else {
              this.selectedElement = null;
            }
          },
          loadConfigData: function() {
            const { getConfig } = require_persistence();
            const config = getConfig();
            this.config = config;
            if (config) {
              this.activePartId = config._uiState?.activePartId || "";
              this.activeVariantName = config._uiState?.activeVariantName || "";
            }
          }
        },
        mounted: function() {
          this.loadConfigData();
          this.onSelectionChange();
          this._selectionHandler = Blockbench.on("update_selection", () => {
            this.onSelectionChange();
          });
          this._modeHandler = Blockbench.on("select_mode", (modeId) => {
            if (modeId === "machine_max_part") {
              this.loadConfigData();
              this.onSelectionChange();
            }
          });
          this._saveHandler = Blockbench.on("save", () => {
            const { saveConfig } = require_persistence();
            saveConfig();
          });
        },
        beforeDestroy: function() {
          if (this._selectionHandler) this._selectionHandler();
          if (this._modeHandler) this._modeHandler();
          if (this._saveHandler) this._saveHandler();
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
      var { getMarkersForVariant, setMarker, clearMarker, getMarker, MARKER_TYPES } = require_element_markers();
      var { loadConfig, saveConfig, getConfig } = require_persistence();
      var originalShowContextMenu = null;
      var _mmVueComponent = null;
      var _mmCssInserted = false;
      var OUTLINER_ICON_MAP = {
        sub_part: "fa-cube",
        hit_box: "fa-shield",
        connector: "fa-plug",
        seat: "fa-chair",
        lighting: "fa-lightbulb",
        subsystem_locator: "fa-cog"
      };
      function getIconClassForType(type) {
        return OUTLINER_ICON_MAP[type] || "";
      }
      function refreshOutlinerIcons() {
        if (!Project || !Project.loaded) return;
        const config = getConfig();
        if (!config) return;
        const activePartId = config._uiState?.activePartId;
        const activeVariantName = config._uiState?.activeVariantName;
        if (!activePartId || !activeVariantName) return;
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
        if (!Project || !Project.loaded) return;
        const allElements = [...Group.all, ...Locator.all];
        for (const el of allElements) {
          el.icon = "";
        }
      }
      function getSelectedElement() {
        if (Outliner && Outliner.selected && Outliner.selected.length > 0) {
          return Outliner.selected[0];
        }
        return null;
      }
      function addMMMenuItems(event) {
        const el = getSelectedElement();
        if (!el) return;
        const config = getConfig();
        if (!config) return;
        const activePartId = config._uiState?.activePartId;
        const activeVariantName = config._uiState?.activeVariantName;
        if (!activePartId || !activeVariantName) return;
        const marker = getMarker(config, activePartId, activeVariantName, el.uuid);
        const menu = new Menu();
        if (el instanceof Group) {
          if (!marker || marker.type !== "sub_part") {
            menu.addItem(new MenuItem("\u{1F4E6} \u6807\u8BB0\u4E3A\u5B50\u96F6\u4EF6", {
              onClick: () => {
                setMarker(config, activePartId, activeVariantName, el.uuid, "sub_part", null);
                refreshOutlinerIcons();
                Blockbench.dispatchEvent("update_selection");
              }
            }));
          }
          if (!marker || marker.type !== "hit_box") {
            menu.addItem(new MenuItem("\u{1F535} \u6807\u8BB0\u4E3A\u78B0\u649E\u7BB1", {
              onClick: () => {
                setMarker(config, activePartId, activeVariantName, el.uuid, "hit_box", null);
                refreshOutlinerIcons();
                Blockbench.dispatchEvent("update_selection");
              }
            }));
          }
        } else if (el instanceof Locator) {
          const locatorTypes = ["connector", "seat", "lighting", "subsystem_locator"];
          const labels = {
            connector: "\u{1F4CC} \u6807\u8BB0\u4E3A\u8FDE\u63A5\u70B9",
            seat: "\u{1F7E1} \u6807\u8BB0\u4E3A\u5EA7\u4F4D\u5B9A\u4F4D\u70B9",
            lighting: "\u{1F7E0} \u6807\u8BB0\u4E3A\u706F\u5149\u5B9A\u4F4D\u70B9",
            subsystem_locator: "\u2699 \u6807\u8BB0\u4E3A\u5B50\u7CFB\u7EDF\u5B9A\u4F4D\u70B9"
          };
          for (const type of locatorTypes) {
            if (!marker || marker.type !== type) {
              menu.addItem(new MenuItem(labels[type], {
                onClick: () => {
                  setMarker(config, activePartId, activeVariantName, el.uuid, type, null);
                  refreshOutlinerIcons();
                  Blockbench.dispatchEvent("update_selection");
                }
              }));
            }
          }
        }
        if (marker) {
          const info = MARKER_TYPES[marker.type];
          if (info) {
            menu.addItem(new MenuItem(`\u{1F50D} \u5728\u5C5E\u6027\u9762\u677F\u4E2D\u67E5\u770B (${info.label})`, {
              onClick: () => {
                Blockbench.dispatchEvent("update_selection");
              }
            }));
          }
          menu.addItem(new MenuItem("\u{1F5D1}\uFE0F \u6E05\u9664 MachineMax \u6807\u8BB0", {
            onClick: () => {
              clearMarker(config, activePartId, activeVariantName, el.uuid);
              refreshOutlinerIcons();
              Blockbench.dispatchEvent("update_selection");
            }
          }));
        }
        if (menu.items.length > 0) {
          menu.show(event);
        }
      }
      function patchShowContextMenu() {
        if (originalShowContextMenu) return;
        originalShowContextMenu = OutlinerNode.prototype.showContextMenu;
        const self = this;
        OutlinerNode.prototype.showContextMenu = function(event) {
          originalShowContextMenu.call(this, event);
          const config = getConfig();
          if (!config) return;
          const currentMode = BarItems?.Mode?.getSelectedId?.();
          if (currentMode !== "machine_max_part") return;
          addMMMenuItems(event);
        };
      }
      function restoreShowContextMenu() {
        if (originalShowContextMenu) {
          OutlinerNode.prototype.showContextMenu = originalShowContextMenu;
          originalShowContextMenu = null;
        }
      }
      function registerToolbarActions() {
        new Action("mm_validate", {
          text: "\u6821\u9A8C\u914D\u7F6E",
          icon: "fa-check-circle",
          condition: { modes: ["machine_max_part"] },
          click: function() {
            const config = getConfig();
            if (!config) {
              Blockbench.showToast("\u6CA1\u6709\u53EF\u6821\u9A8C\u7684\u914D\u7F6E", "warning");
              return;
            }
            const errors = runValidation(config);
            if (errors.length === 0) {
              Blockbench.showToast("\u6821\u9A8C\u901A\u8FC7 \u2705", "positive");
            } else {
              const summary = errors.map((e) => `\u2022 ${e}`).join("\n");
              Blockbench.showToast(`\u6821\u9A8C\u53D1\u73B0 ${errors.length} \u4E2A\u95EE\u9898`, "warning");
              new Dialog({
                title: "\u6821\u9A8C\u7ED3\u679C",
                lines: [`\u53D1\u73B0 ${errors.length} \u4E2A\u95EE\u9898\uFF1A`, ...errors],
                form: { close: "close" },
                onConfirm: function() {
                  this.hide();
                }
              });
            }
          }
        });
        new Action("mm_export", {
          text: "\u5BFC\u51FA\u5185\u5BB9\u5305",
          icon: "fa-save",
          condition: { modes: ["machine_max_part"] },
          click: function() {
            Blockbench.showToast("\u5BFC\u51FA\u529F\u80FD\u5C06\u5728\u9636\u6BB5\u56DB\u5B9E\u73B0", "info");
          }
        });
        new Action("mm_new_part", {
          text: "\u65B0\u5EFA\u96F6\u4EF6",
          icon: "fa-plus",
          condition: { modes: ["machine_max_part"] },
          click: function() {
            const config = getConfig();
            if (!config) return;
            new Dialog({
              title: "\u65B0\u5EFA\u96F6\u4EF6",
              form: {
                partId: { type: "text", label: "\u96F6\u4EF6 ID", hint: "\u5982 wine_fox_hull" },
                variantName: { type: "text", label: "\u521D\u59CB\u53D8\u4F53\u540D", value: "default" },
                model: { type: "text", label: "\u6A21\u578B\u5F15\u7528", value: "machine_max:" }
              },
              onConfirm: function(formData) {
                const { partId, variantName, model } = formData;
                if (!partId) {
                  Blockbench.showToast("\u96F6\u4EF6 ID \u4E0D\u80FD\u4E3A\u7A7A", "error");
                  return false;
                }
                if (config.parts[partId]) {
                  Blockbench.showToast(`\u96F6\u4EF6 "${partId}" \u5DF2\u5B58\u5728`, "error");
                  return false;
                }
                const { createPartConfig } = require_config();
                config.parts[partId] = createPartConfig(partId, variantName);
                if (model) {
                  config.parts[partId].variants[variantName].model = model;
                }
                config._uiState.activePartId = partId;
                config._uiState.activeVariantName = variantName;
                refreshOutlinerIcons();
                Blockbench.dispatchEvent("update_selection");
                Blockbench.showToast(`\u96F6\u4EF6 "${partId}" \u5DF2\u521B\u5EFA`, "positive");
                this.hide();
              }
            });
          }
        });
        new Action("mm_project_settings", {
          text: "\u9879\u76EE\u7BA1\u7406",
          icon: "fa-cog",
          condition: { modes: ["machine_max_part"] },
          click: function() {
            const config = getConfig();
            if (!config) return;
            const partCount = Object.keys(config.parts).length;
            const connCount = Object.keys(config.connector_defs).length;
            const subCount = Object.keys(config.subsystem_defs).length;
            const matCount = Object.keys(config.material_defs).length;
            const partList = Object.entries(config.parts).map(([id, part]) => {
              const vCount = Object.keys(part.variants || {}).length;
              const markerCount = part.element_markers ? Object.values(part.element_markers).reduce((sum, m) => sum + Object.keys(m).length, 0) : 0;
              return `  ${id}  |  \u53D8\u4F53: ${vCount}  |  \u6807\u8BB0: ${markerCount}`;
            }).join("\n");
            new Dialog({
              title: "\u2699 MachineMax \u9879\u76EE\u7BA1\u7406",
              form: {
                namespace: { type: "text", label: "\u547D\u540D\u7A7A\u95F4", value: config.namespace },
                info: { type: "display", label: "\u7EDF\u8BA1", lines: [
                  `\u6A21\u578B: ${Project.name || "\u672A\u547D\u540D"}`,
                  `\u96F6\u4EF6\u6570: ${partCount}`,
                  `\u8FDE\u63A5\u70B9\u5B9A\u4E49: ${connCount}`,
                  `\u5B50\u7CFB\u7EDF\u578B\u53F7: ${subCount}`,
                  `\u6750\u6599\u5B9A\u4E49: ${matCount}`,
                  partCount > 0 ? `
\u96F6\u4EF6\u5217\u8868:
${partList}` : "\uFF08\u6682\u65E0\u96F6\u4EF6\uFF09"
                ] }
              },
              onConfirm: function(formData) {
                config.namespace = formData.namespace;
                saveConfig();
                this.hide();
              }
            });
          }
        });
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
        if (!_mmVueComponent) {
          try {
            _mmVueComponent = require_App_vue();
          } catch (e) {
            console.warn("[MM Mode]  Vue \u7EC4\u4EF6\u52A0\u8F7D\u5931\u8D25:", e.message);
            _mmVueComponent = null;
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
            }
          } catch (e) {
            console.warn("[MM Mode]  \u6837\u5F0F\u52A0\u8F7D\u5931\u8D25:", e.message);
          }
        }
        const mmMode = new Mode("machine_max_part", {
          name: "\u96F6\u4EF6\u5B9A\u4E49",
          icon: "fa-cube",
          component: _mmVueComponent || (function() {
            return { template: '<div class="mm-panel"><p>\u52A0\u8F7D\u9762\u677F\u4E2D...</p></div>' };
          }),
          hidden_node_types: [],
          onSelect: function() {
            console.log("[MM Mode]  \u8FDB\u5165\u96F6\u4EF6\u5B9A\u4E49\u6A21\u5F0F");
            const config = loadConfig();
            if (config._uiState?.activePartId && !config.parts[config._uiState.activePartId]) {
              config._uiState.activePartId = "";
              config._uiState.activeVariantName = "";
            }
            const partIds = Object.keys(config.parts);
            if (!config._uiState?.activePartId && partIds.length > 0) {
              config._uiState.activePartId = partIds[0];
              const variants = Object.keys(config.parts[partIds[0]].variants || {});
              config._uiState.activeVariantName = variants.length > 0 ? variants[0] : "default";
            }
            refreshOutlinerIcons();
            patchShowContextMenu();
            Blockbench.dispatchEvent("update_selection");
          },
          onUnselect: function() {
            console.log("[MM Mode]  \u9000\u51FA\u96F6\u4EF6\u5B9A\u4E49\u6A21\u5F0F");
            restoreShowContextMenu();
            resetOutlinerIcons();
            saveConfig();
          }
        });
        registerToolbarActions();
        console.log('[MM Mode]  \u6A21\u5F0F "\u96F6\u4EF6\u5B9A\u4E49" \u5DF2\u6CE8\u518C');
        return mmMode;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = {
          registerMode: registerMode2,
          refreshOutlinerIcons,
          resetOutlinerIcons,
          runValidation
        };
      }
    }
  });

  // src/plugin.js
  var { registerProperty } = require_persistence();
  var { registerMode } = require_mode();
  Plugin.register("machine_max_bb_plugin", {
    title: "MachineMax \u96F6\u4EF6\u5B9A\u4E49",
    icon: "fa-cube",
    author: "MachineMax Team",
    description: "\u5728 Blockbench \u4E2D\u4EE5\u53EF\u89C6\u5316\u65B9\u5F0F\u5236\u4F5C MachineMax \u5185\u5BB9\u5305\uFF0C\u65E0\u9700\u624B\u5199 JSON",
    version: "0.1.0",
    variant: "desktop",
    onload() {
      console.log("[MM Plugin]  \u52A0\u8F7D MachineMax Blockbench \u63D2\u4EF6 v0.1.0");
      registerProperty();
      registerMode();
      Blockbench.showToast('MachineMax \u63D2\u4EF6\u5DF2\u52A0\u8F7D\uFF0C\u5728\u6A21\u5F0F\u680F\u4E2D\u9009\u62E9 "\u96F6\u4EF6\u5B9A\u4E49" \u5F00\u59CB\u4F7F\u7528', "positive");
    },
    onunload() {
      console.log("[MM Plugin]  \u5378\u8F7D MachineMax Blockbench \u63D2\u4EF6");
    }
  });
})();
