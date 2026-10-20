/**
 * 主 Vue 组件 — 零件定义模式右侧属性面板
 *
 * 使用 Blockbench 内置的 Vue 2 运行。
 * 根据当前选中的元素类型动态切换显示内容：
 *   - 无选中/空闲 → 零件全局属性 + 变体列表
 *   - 选中子零件 Group → 子零件属性页
 *   - 选中碰撞箱 Group → 碰撞箱属性页
 *   - 选中连接点 Locator → 连接点属性页
 *   - 选中子系统 Locator → 子系统属性页
 */
const { getConfig, loadConfig, saveConfig, scheduleSave } = require('../utils/persistence.js');
const { getMarkerInfo, detectOwnerSubPart } = require('../core/element_markers.js');
const ops = require('../ops/index.js');
const { createLogger } = require('../utils/logger.js');
const { refreshOutlinerIcons } = require('../mode/icons.js');
const { showToast } = require('../utils/notify.js');
const content_pack_manager = require('../core/content_pack_manager.js');
const nameUtils = require('../utils/name_utils.js');
const { buildSignalTargetOptions } = require('../utils/signal_target_options.js');
const { collectIssues } = require('../services/validate.js');
const { aggregate, resolveIssueLevel, filterFieldIssues } = require('../core/validation_types.js');
const fieldIssueHelpers = require('./components/field_issues.js');
var { showAddTagDialog, _hashTagColor } = require('./tag_dialog_helper.js');
var undo = require('../core/undo.js');

/** 模块日志 */
var log = createLogger('UI');

require('./SubPartPanel.vue.js');

require('./HitBoxPanel.vue.js');

require('./InteractBoxPanel.vue.js');

require('./ConnectorPanel.vue.js');

require('./SubsystemPanel.vue.js');

require('./components/KeyValueEditor.vue.js');

require('./components/SignalTargetEditor.vue.js');

require('./components/LocatorPicker.vue.js');

/**
 * 主面板组件选项。
 *
 * 注意：这里先声明成普通对象，等 methods 全部定义完之后用
 * `undo.wrapMethodMap()` 把会修改配置的方法统一包成撤销记录，最后才
 * `Vue.component()` 注册——Vue.extend 会复制方法表，注册后再包就不生效了。
 */
const MM_MAIN_PANEL_OPTIONS = {
    template: TEMPLATE_PART_PANEL,
    data: function () {
        return {
            config: null,
            activePartId: '',
            activeVariantName: '',
            selectedElement: null,
            markerVersion: { v: 0 }, // 标记更新版本号，右键菜单 delete 操作后递增 v，强制计算属性重新求值。使用对象避免 Vue 2 原始类型 NaN 问题
            subsystemSelection: { spKey: '', subsystemKey: '' }, // 虚拟选择的子系统
        };
    },
    watch: {
        /**
         * 游离元素（连接点/碰撞箱/交互区无归属 subpart）在 collectIssues 中标为
         * warning + code 'orphan_element'，且无 subPartKey → 不冒泡到面板行。
         * 在此消费点对 validationIssues 做节流 toast（§9：collectIssues 本身无副作用，不发 toast）。
         */
        validationIssues: function (problems) {
            this._maybeToastOrphans(problems);
        },
    },
    computed: {
        currentPart: function () {
            if (!this.config || !this.activePartId) return null;
            return this.config.parts[this.activePartId] || null;
        },
        currentVariant: function () {
            if (!this.currentPart || !this.activeVariantName) return null;
            return this.currentPart.variants[this.activeVariantName] || null;
        },
        /** textures 始终返回对象，兼容旧数据的字符串格式 */
        variantTextures: function () {
            var v = this.currentVariant;
            if (!v) return {};
            var t = v.textures;
            if (typeof t === 'string') return t ? { 'default': t } : {};
            if (!t || typeof t !== 'object' || Array.isArray(t)) return {};
            return t;
        },
        variantCount: function () {
            if (!this.currentPart || !this.currentPart.variants) return 0;
            return Object.keys(this.currentPart.variants).length;
        },
        /**
         * 模型中所有骨骼名称列表（用于起始骨骼选择器）
         */
        allBoneNames: function () {
            if (typeof Group === 'undefined' || !Group.all) return [];
            return Group.all.map(function (g) { return g.name; });
        },
        /**
         * 模型中所有定位器名称列表（总表，用于全局参考）
         */
        allLocatorNames: function () {
            if (typeof Locator === 'undefined' || !Locator.all) return [];
            return Locator.all.map(function (l) { return l.name; });
        },
        /**
         * 当前子零件骨骼子树下的定位器名称列表（用于子系统定位器选择、质心选择器等）。
         * 对每个 Locator 沿 parent 链查找第一个 sub_part 标记，若匹配目标子零件则纳入。
         * 目标子零件的确定优先级：
         *   1. 当前 3D 视图中选中的 sub_part 骨骼
         *   2. 虚拟选择的子系统所属的子零件（selectedSubsystemParentSpKey）
         */
        ownedLocatorNames: function () {
            var variant = this.currentVariant;
            var part = this.currentPart;
            var variantName = this.activeVariantName;
            if (!variant || !part) return [];

            var spKey;
            // 优先级1: 当前选中的 sub_part 骨骼
            if (this.selectedElement && this.selectedMarker && this.selectedMarker.type === 'sub_part') {
                spKey = this.selectedMarker.config_ref || this.selectedElementName;
            }
            // 优先级2: 虚拟选择（子系统面板编辑）时，使用所属子零件 key
            else if (this.isSubsystemSelected) {
                spKey = this.selectedSubsystemParentSpKey;
            }
            if (!spKey) return [];
            if (typeof Locator === 'undefined' || !Locator.all) return [];

            var config = this.config;
            var self = this;
            return Locator.all
                .filter(function (loc) {
                    var owner = detectOwnerSubPart(config, self.activePartId, variantName, loc);
                    return owner && owner.spKey === spKey;
                })
                .map(function (l) { return l.name; });
        },
        /**
         * 校验问题全集（单一校验源 collectIssues）
         * 依赖 config（字段编辑响应式）+ markerVersion.v（非响应式删除兜底）
         */
        validationIssues: function () {
            if (!this.config || !this.markerVersion) return [];
            void this.markerVersion.v;
            return collectIssues(this.config);
        },
        /**
         * 按当前零件/变体过滤后的聚合结果（bySubPart / byItem / byPartVariant）
         * 调用方先过滤到当前 part+variant，避免 bySubPart 键跨变体/零件碰撞。
         */
        subPartIssues: function () {
            var self = this;
            var all = this.validationIssues;
            var scoped = all.filter(function (p) {
                return p.path && p.path.partId === self.activePartId && p.path.variantName === self.activeVariantName;
            });
            return aggregate(scoped);
        },
        /** 零件/变体级问题（面板字段级标注用；游离元素 warning 也会在这里） */
        partVariantIssues: function () {
            return this.subPartIssues.byPartVariant;
        },
        /** 当前选中子零件「自身字段」的问题（不含后代条目问题） */
        selectedSubPartFieldIssues: function () {
            var spKey = this.selectedMarker ? this.selectedMarker.config_ref : '';
            if (!spKey) return [];
            var list = this.subPartIssues.bySubPart[spKey] || [];
            return list.filter(function (p) {
                return p.path && p.path.scope === 'subpart';
            });
        },
        /** 当前虚拟选中子系统的问题 */
        selectedSubsystemIssues: function () {
            var key = this.selectedSubsystemKey;
            if (!key) return [];
            return this.subPartIssues.byItem.subsystems[key] || [];
        },
        /** 当前选中碰撞箱的问题（byItem 以碰撞箱 UUID 为键） */
        selectedHitBoxIssues: function () {
            var el = this.selectedElement;
            if (!el || !el.uuid) return [];
            return this.subPartIssues.byItem.hitBoxes[el.uuid] || [];
        },
        /** 当前选中连接点的问题 */
        selectedConnectorIssues: function () {
            var key = this.connectorKeyName;
            if (!key) return [];
            return this.subPartIssues.byItem.connectors[key] || [];
        },
        /** 当前选中交互区的问题 */
        selectedInteractBoxIssues: function () {
            var key = this.interactBoxName;
            if (!key) return [];
            return this.subPartIssues.byItem.interactBoxes[key] || [];
        },
        /**
         * 当前变体下的所有子零件条目（含短名、起始骨骼、子系统数）
         * 用于零件/变体属性面板中的子零件列表
         */
        subPartEntries: function () {
            if (!this.markerVersion) return [];
            // 读取版本号作为虚拟依赖：右键菜单通过 delete 非响应式删除 sub_parts 条目后强制重新求值
            void this.markerVersion.v;
            var variant = this.currentVariant;
            if (!variant || !variant.sub_parts) {
                return [];
            }
            var ns = (this.config && this.config.namespace) || 'machine_max';
            var keys = Object.keys(variant.sub_parts);
            // 只告警，不在这里改配置：清理动作必须走 ops（docs/13 §9）
            if (this.currentPart && this.currentPart.element_markers && this.currentPart.element_markers[this.activeVariantName]) {
                var subPartMarkerKeys = {};
                var markers = this.currentPart.element_markers[this.activeVariantName];
                for (var mk in markers) {
                    if (markers[mk].type === 'sub_part') {
                        subPartMarkerKeys[markers[mk].config_ref] = true;
                    }
                }
                var orphaned = keys.filter(function(k) { return !subPartMarkerKeys[k]; });
                if (orphaned.length > 0) {
                    log.warn('subPartEntries: 发现无对应标记的子零件配置（遗留脏数据），等待用户清理', {
                        orphanedKeys: orphaned,
                    });
                }
            }
            log.debug('subPartEntries: 计算中', {
                subPartCount: keys.length,
                subPartKeys: keys,
                variantExists: !!variant,
                configExists: !!this.config,
                markerVersion: this.markerVersion.v,
            });
            var self = this;
            var bySubPart = self.subPartIssues.bySubPart;
            var result = keys.map(function (spKey) {
                var sp = variant.sub_parts[spKey];
                var scopedIssues = bySubPart[spKey] || [];
                return {
                    key: spKey,
                    shortName: nameUtils.extractShortName(spKey, ns),
                    startBone: sp ? sp.start_bone : '',
                    subsystemCount: sp && sp.subsystems ? Object.keys(sp.subsystems).length : 0,
                    hitBoxCount: sp && sp.hit_boxes ? Object.keys(sp.hit_boxes).length : 0,
                    interactBoxCount: sp && sp.interact_boxes ? Object.keys(sp.interact_boxes).length : 0,
                    connectorCount: sp && sp.connectors ? Object.keys(sp.connectors).length : 0,
                    issues: scopedIssues,
                    issueLevel: resolveIssueLevel(scopedIssues),
                };
            });
            log.debug('subPartEntries: 结果', {
                entryCount: result.length,
                entryKeys: result.map(function(e) { return e.key; }),
            });
            return result;
        },
        /**
         * 所有可用材料定义（通过内容包管理器合并加载）
         */
        availableMaterials: function () {
            if (!this.config) return {};
            return content_pack_manager.loadMergedDefs(this.config, 'materials').defs;
        },
        /**
         * 所有可用连接点定义（通过内容包管理器合并加载）
         */
        availableConnectorDefs: function () {
            if (!this.config) return {};
            var result = content_pack_manager.loadMergedDefs(this.config, 'connectors').defs;
            log.debug('availableConnectorDefs: 共 ' + Object.keys(result).length + ' 个连接点定义');
            return result;
        },
        selectedMarker: function () {
            if (!this.selectedElement) return null;
            if (!this.markerVersion) return null;
            // 读取版本号作为虚拟依赖：右键菜单通过 delete 修改 element_markers 时
            // Vue 2 无法检测，通过自增 markerVersion.v 强制该计算属性重新求值
            void this.markerVersion.v;
            const part = this.currentPart;
            if (!part || !part.element_markers) return null;
            const vMarkers = part.element_markers[this.activeVariantName];
            if (!vMarkers) return null;
            var result = vMarkers[this.selectedElement.uuid] || null;
            log.debug('selectedMarker 计算属性', {
                uuid: this.selectedElement.uuid,
                markerVersion: this.markerVersion.v,
                hasElementMarkers: !!part.element_markers,
                variantMarkersKeys: Object.keys(vMarkers),
                result: result ? (result.type + ' / ' + result.config_ref) : 'null',
            });
            return result;
        },
        /**
         * 当前选中元素的显示名称
         */
        selectedElementName: function () {
            return (this.selectedElement && this.selectedElement.name) || '未命名';
        },
        /**
         * 从 selectedMarker.config_ref 获取当前选中的子零件配置对象
         */
        selectedSubPartConfig: function () {
            if (!this.selectedMarker || this.selectedMarker.type !== 'sub_part') return null;
            const variant = this.currentVariant;
            if (!variant || !variant.sub_parts) return null;
            // config_ref 存储翻译键格式的名称（如 sub_part.machine_max.main），同时也是 sub_parts 的 key
            const spKey = this.selectedMarker.config_ref;
            if (!spKey) return null;
            // 不在渲染期补配置：缺失时由「创建配置」按钮走 ops.markSubPart（docs/13 §9）
            return variant.sub_parts[spKey] || null;
        },
        /**
         * 当前选中是否为已绑定配置的子零件标记
         */
        isSubPartSelected: function () {
            return this.selectedMarker && this.selectedMarker.type === 'sub_part';
        },
        /**
         * 当前选中是否为碰撞箱标记
         */
        isHitBoxSelected: function () {
            return this.selectedMarker && this.selectedMarker.type === 'hit_box';
        },
        /**
         * 当前选中是否为交互区标记
         */
        isInteractBoxSelected: function () {
            return this.selectedMarker && this.selectedMarker.type === 'interact_box';
        },
        /**
         * 当前选中是否为连接点标记
         */
        isConnectorSelected: function () {
            return this.selectedMarker && this.selectedMarker.type === 'connector';
        },
        /**
         * 子系统虚拟选择状态
         */
        isSubsystemSelected: function () {
            return !!(this.subsystemSelection && this.subsystemSelection.subsystemKey);
        },
        /**
         * 当前虚拟选中的子系统 key
         */
        selectedSubsystemKey: function () {
            return this.subsystemSelection.subsystemKey || '';
        },
        /**
         * 当前虚拟选中的子零件 key
         */
        selectedSubsystemParentSpKey: function () {
            return this.subsystemSelection.spKey || '';
        },
        /**
         * 当前虚拟选中的子系统配置对象
         */
        selectedSubsystemConfig: function () {
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
        availableSubsystemDefs: function () {
            if (!this.config) {
                log.warn('availableSubsystemDefs: config 为空');
                return {};
            }
            var cp = require('../core/content_pack_manager.js');
            var result = cp.loadMergedDefs(this.config, 'subsystems').defs;
            log.debug('availableSubsystemDefs: 共 ' + Object.keys(result).length + ' 个子系统定义');
            return result;
        },
        /**
         * 所有可用的控制组预设（用于控制组预设下拉选择）
         */
        availableControlGroupPresets: function () {
            if (!this.config) {
                log.warn('availableControlGroupPresets: config 为空');
                return {};
            }
            var cp = require('../core/content_pack_manager.js');
            var result = cp.loadMergedDefs(this.config, 'control_groups').defs;
            return result;
        },
        /**
         * 所有可用的投射物定义（用于再生装弹机弹链选择器）
         */
        availableProjectileTypes: function () {
            if (!this.config) {
                log.warn('availableProjectileTypes: config 为空');
                return {};
            }
            var projectile_manager = require('../managers/projectile_manager.js');
            var result = projectile_manager.getProjectileMap(this.config);
            log.debug('availableProjectileTypes: 共 ' + Object.keys(result).length + ' 个投射物');
            return result;
        },
        /**
         * 当前子零件内所有连接点名称列表（用于 connector 下拉选择）
         */
        currentConnectorKeys: function () {
            if (!this.isSubsystemSelected || !this.currentVariant) return {};
            var sp = this.currentVariant.sub_parts[this.subsystemSelection.spKey];
            if (!sp || !sp.connectors) return {};
            return sp.connectors;
        },
        /**
         * 当前子零件内所有目标 key（用于信号目标下拉选择）
         * 返回 {value, label}[]，value=完整键，label=[类型]短名
         */
        currentSignalTargetOptions: function () {
            if (!this.isSubsystemSelected || !this.currentVariant) return [];
            return this.signalTargetOptionsFor(this.subsystemSelection.spKey);
        },
        /**
         * 动态检测碰撞箱所属子零件（沿父链向上遍历）
         */
        hitBoxOwner: function () {
            if (!this.selectedElement || !this.isHitBoxSelected) return null;
            var config = this.config;
            if (!config) return null;
            return detectOwnerSubPart(config, this.activePartId, this.activeVariantName, this.selectedElement);
        },
        /**
         * 动态检测连接点所属子零件（沿父链向上遍历）
         */
        connectorOwner: function () {
            if (!this.selectedElement || !this.isConnectorSelected) return null;
            if (!this.config) return null;
            return detectOwnerSubPart(this.config, this.activePartId, this.activeVariantName, this.selectedElement);
        },
        /**
         * 连接点所属子零件的 key
         */
        connectorParentSubPartKey: function () {
            var owner = this.connectorOwner;
            return owner ? owner.spKey : '';
        },
        /**
         * 当前连接点在 connectors 字典中的 key（即翻译键格式的名称）
         * 用于属性面板显示和编辑
         */
        connectorKeyName: function () {
            if (!this.isConnectorSelected) return '';
            var sp = this.connectorOwner ? this.currentVariant.sub_parts[this.connectorOwner.spKey] : null;
            if (!sp || !sp.connectors) return '';
            var locatorName = this.selectedElementName;
            var found = Object.keys(sp.connectors).find(function(k) {
                return sp.connectors[k].locator === locatorName;
            });
            return found || '';
        },
        /**
         * 连接点所属子零件内的子系统映射（用于 power_target 下拉选择）
         */
        connectorParentSubsystems: function () {
            var spKey = this.connectorParentSubPartKey;
            if (!spKey || !this.currentVariant || !this.currentVariant.sub_parts) return {};
            var sp = this.currentVariant.sub_parts[spKey];
            return (sp && sp.subsystems) || {};
        },
        /**
         * 连接点所属子零件内的信号目标补全列表
         * 返回 {value, label}[]，value=完整键，label=[类型]短名
         */
        connectorParentSignalTargetHints: function () {
            return this.signalTargetOptionsFor(this.connectorParentSubPartKey);
        },
        /**
         * 当前选中碰撞箱的配置对象（从所属子零件的 hit_boxes 中获取）
         * 无归属时返回游离配置以确保面板正常渲染
         */
        selectedHitBoxConfig: function () {
            if (!this.isHitBoxSelected) {
                return null;
            }
            var variant = this.currentVariant;
            if (!variant || !variant.sub_parts) {
                return { _orphan: true, id: 'part', type: 'box', material: 'machine_max:default', thickness: 1.0, condition: 'true' };
            }
            var owner = this.hitBoxOwner;
            var spKey = owner ? owner.spKey : null;
            if (!spKey || !variant.sub_parts[spKey]) {
                return { _orphan: true, id: 'part', type: 'box', material: 'machine_max:default', thickness: 1.0, condition: 'true' };
            }
            var sp = variant.sub_parts[spKey];
            if (!sp.hit_boxes) return null;
            var hbKey = this.selectedElement.uuid;
            // 注意：此处不自动重建条目。若 sp.hit_boxes[hbKey] 不存在，
            // 说明标记配置不同步（通常由清除 marker 后 Vue 重算导致）。
            // 返回 null 由面板显示「创建配置」按钮，渲染期不改配置。
            return sp.hit_boxes[hbKey] || null;
        },
        /**
         * 碰撞箱所属子零件的 key
         */
        hitBoxParentSubPartKey: function () {
            var owner = this.hitBoxOwner;
            return owner ? owner.spKey : '';
        },
        /**
         * 碰撞箱所属子零件内的子系统映射（用于关联子系统下拉选择）
         */
        hitBoxParentSubsystems: function () {
            var spKey = this.hitBoxParentSubPartKey;
            if (!spKey || !this.currentVariant || !this.currentVariant.sub_parts) return {};
            var sp = this.currentVariant.sub_parts[spKey];
            return (sp && sp.subsystems) || {};
        },
        /**
         * 动态检测交互区所属子零件（沿父链向上遍历）
         */
        interactBoxOwner: function () {
            if (!this.selectedElement || !this.isInteractBoxSelected) return null;
            var config = this.config;
            if (!config) return null;
            return detectOwnerSubPart(config, this.activePartId, this.activeVariantName, this.selectedElement);
        },
        /**
         * 交互区所属子零件的 key
         */
        interactBoxParentSubPartKey: function () {
            var owner = this.interactBoxOwner;
            return owner ? owner.spKey : '';
        },
        /**
         * 交互区所属子零件内的子系统映射（用于信号目标下拉选择）
         */
        interactBoxParentSubsystems: function () {
            var spKey = this.interactBoxParentSubPartKey;
            if (!spKey || !this.currentVariant || !this.currentVariant.sub_parts) return {};
            var sp = this.currentVariant.sub_parts[spKey];
            return (sp && sp.subsystems) || {};
        },
        /**
         * 交互区所属子零件内的信号目标补全列表
         * 返回 {value, label}[]，value=完整键，label=[类型]短名
         */
        interactBoxParentSignalTargetHints: function () {
            return this.signalTargetOptionsFor(this.interactBoxParentSubPartKey);
        },
        /**
         * 当前选中交互区的配置对象（从所属子零件的 interact_boxes 中获取）
         * 按 _uuid 匹配（稳定，bone 变更后仍然有效）
         */
        selectedInteractBoxConfig: function () {
            if (!this.isInteractBoxSelected) {
                return null;
            }
            var variant = this.currentVariant;
            if (!variant || !variant.sub_parts) {
                return { _orphan: true, bone: '', interact_mode: 'fast', condition: 'NOR', signal_targets: {} };
            }
            var owner = this.interactBoxOwner;
            var spKey = owner ? owner.spKey : null;
            if (!spKey || !variant.sub_parts[spKey]) {
                return { _orphan: true, bone: '', interact_mode: 'fast', condition: 'NOR', signal_targets: {} };
            }
            var sp = variant.sub_parts[spKey];
            if (!sp.interact_boxes) return null;
            var selectedUuid = this.selectedElement.uuid;
            for (var ibKey in sp.interact_boxes) {
                if (sp.interact_boxes[ibKey]._uuid === selectedUuid) {
                    return sp.interact_boxes[ibKey];
                }
            }
            return null;
        },
        /**
         * 交互区在 interact_boxes 字典中的 key（即翻译键格式的名称）
         * 用于属性面板显示和编辑
         */
        interactBoxName: function () {
            if (!this.isInteractBoxSelected) return '';
            var spKey = this.interactBoxParentSubPartKey;
            if (!spKey || !this.currentVariant || !this.currentVariant.sub_parts) return '';
            var sp = this.currentVariant.sub_parts[spKey];
            if (!sp || !sp.interact_boxes) return '';
            var selectedUuid = this.selectedElement.uuid;
            for (var ibKey in sp.interact_boxes) {
                if (sp.interact_boxes[ibKey]._uuid === selectedUuid) {
                    return ibKey;
                }
            }
            return '';
        },
        /**
         * 当前选中连接点的配置对象（从所属子零件的 connectors 中获取）
         * 自动创建缺失条目以保持数据一致。无归属时返回游离配置。
         */
        selectedConnectorConfig: function () {
            if (!this.isConnectorSelected) {
                return null;
            }
            var marker = this.selectedMarker;
            if (!marker) {
                return null;
            }
            var variant = this.currentVariant;
            if (!variant || !variant.sub_parts) return null;
            var owner = this.connectorOwner;
            var spKey = owner ? owner.spKey : null;
            if (!spKey) {
                return { _orphan: true, definition: marker.config_ref || '' };
            }
            var sp = variant.sub_parts[spKey];
            if (!sp || !sp.connectors) return null;
            var locatorName = this.selectedElementName;
            // 通过 locator 字段查找已有的连接点条目（key 现在是翻译键格式）
            var connKey = Object.keys(sp.connectors).find(function(k) {
                return sp.connectors[k].locator === locatorName;
            });
            // 不在渲染期补条目；缺失时由面板「创建配置」按钮走 ops.markConnector。
            if (!connKey) return null;
            return sp.connectors[connKey] || null;
        },
    },
    methods: {
        /**
         * 获取指定子零件的信号目标选项列表（唯一实现）
         * 供 currentSignalTargetOptions / connectorParentSignalTargetHints /
         * interactBoxParentSignalTargetHints 三个计算属性复用。
         * 注意：必须放在 methods 而非 computed —— Vue 2 会把 computed 包装成
         * 响应式 getter 属性，带参调用会得到数组而非函数。
         * @param {string} spKey - 子零件 key
         * @returns {Array<{value: string, label: string}>} 信号目标选项列表
         */
        signalTargetOptionsFor: function (spKey) {
            void this.markerVersion.v;
            if (!spKey || !this.currentVariant || !this.currentVariant.sub_parts) {
                return [{ value: 'local', label: 'local' }, { value: 'global', label: 'global' }];
            }
            return buildSignalTargetOptions(
                this.currentVariant.sub_parts[spKey],
                (this.config && this.config.namespace) || 'machine_max'
            );
        },
        getElementType: function (el) {
            if (el instanceof Group) return '骨骼 (Group)';
            if (el instanceof Locator) return '定位器 (Locator)';
            if (el instanceof Cube) return '方块 (Cube)';
            return '未知';
        },
        getMarkerLabel: function (type) {
            const info = getMarkerInfo(type);
            return info ? info.label : type;
        },
        getMarkerColor: function (type) {
            const info = getMarkerInfo(type);
            return info ? info.color : '#888';
        },
        /**
         * 根据字符串哈希生成一致的彩色背景色，用于标签徽标
         */
        getTagColor: function (tag) {
            return _hashTagColor(tag);
        },
        onPartChange: function () {
            log.debug('onPartChange: 切换零件', { partId: this.activePartId });
            const config = getConfig();
            if (!config || !this.activePartId) {
                log.warn('onPartChange: config 为空或无 activePartId');
                return;
            }
            config._uiState.activePartId = this.activePartId;

            const part = config.parts[this.activePartId];
            if (part) {
                const variants = Object.keys(part.variants);
                this.activeVariantName = variants.length > 0 ? variants[0] : 'default';
                config._uiState.activeVariantName = this.activeVariantName;
                log.debug('onPartChange: 变体已切换为', { variant: this.activeVariantName });
            }

            refreshOutlinerIcons();
            this.selectedElement = null;
            Blockbench.dispatchEvent('update_selection');
        },
        onVariantChange: function () {
            log.debug('onVariantChange: 切换变体', { variant: this.activeVariantName });
            const config = getConfig();
            if (!config || !this.activeVariantName) {
                log.warn('onVariantChange: config 为空或无 activeVariantName');
                return;
            }
            config._uiState.activeVariantName = this.activeVariantName;

            refreshOutlinerIcons();
            this.selectedElement = null;
            Blockbench.dispatchEvent('update_selection');
        },
        removeTag: function (index) {
            if (this.currentVariant && this.currentVariant.tags) {
                var removed = this.currentVariant.tags[index];
                this.currentVariant.tags.splice(index, 1);
                log.debug('removeTag: 已删除标签', { index: index, tag: removed });
            }
        },
        showAddTagDialog: function () {
            var variant = this.currentVariant;
            if (!variant) return;
            showAddTagDialog(this, variant);
        },
        /**
         * 弹出确认对话框后删除当前零件
         * 删除前统计该零件下的变体数和元素标记数，在对话框中展示
         */
        showDeletePartDialog: function () {
            var config = getConfig();
            if (!config || !this.activePartId) {
                log.warn('showDeletePartDialog: config 或 activePartId 为空');
                return;
            }
            var partId = this.activePartId;
            var part = config.parts[partId];
            if (!part) {
                log.warn('showDeletePartDialog: 零件不存在', { partId: partId });
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
                title: '确认删除零件',
                form: {
                    info: {
                        type: 'info',
                        text: '确认删除零件 "' + partId + '" ？<br><br>' +
                              '此操作将永久删除：<br>' +
                              '• 零件 ' + partId + ' 的全部配置<br>' +
                              '• 该零件下的 ' + variantCount + ' 个变体<br>' +
                              '• 所有变体关联的 ' + markerCount + ' 个元素标记<br><br>' +
                              '可用 Ctrl+Z 撤销。',
                    },
                },
                onConfirm: function () {
                    log.info('showDeletePartDialog: 用户确认删除零件', { partId: partId });

                    var result = ops.deletePart(config, { partId: partId });
                    if (!result.ok) {
                        showToast(result.error, 'error');
                        return false;
                    }

                    refreshOutlinerIcons();
                    self.selectedElement = null;
                    self.loadConfigData();
                    showToast('零件 "' + partId + '" 已删除', 'warning');
                    log.debug('showDeletePartDialog: 删除完成, 剩余零件', { remaining: result.remaining });
                    this.hide();
                },
            }).show();
        },
        /**
         * 弹出确认对话框后删除当前变体
         * 删除前清理该变体关联的所有 element_markers，避免残留孤儿数据
         */
        showDeleteVariantDialog: function () {
            var config = getConfig();
            var part = this.currentPart;
            var variantName = this.activeVariantName;
            if (!config || !part || !variantName) {
                log.warn('showDeleteVariantDialog: config/part/variantName 为空');
                return;
            }

            var markerCount = 0;
            if (part.element_markers && part.element_markers[variantName]) {
                markerCount = Object.keys(part.element_markers[variantName]).length;
            }

            var self = this;
            new Dialog({
                title: '确认删除变体',
                form: {
                    info: {
                        type: 'info',
                        text: '确认删除变体 "' + variantName + '" ？<br><br>' +
                              '此操作将永久删除：<br>' +
                              '• 变体 "' + variantName + '" 的全部配置（模型、贴图、标签等）<br>' +
                              '• 该变体关联的 ' + markerCount + ' 个元素标记<br><br>' +
                              '可用 Ctrl+Z 撤销。',
                    },
                },
                onConfirm: function () {
                    log.info('showDeleteVariantDialog: 用户确认删除变体', { variant: variantName });

                    var result = ops.deleteVariant(config, {
                        partId: self.activePartId,
                        variantName: variantName,
                    });
                    if (!result.ok) {
                        showToast(result.error, 'error');
                        return false;
                    }

                    self.activeVariantName = result.activeVariantName;
                    log.debug('showDeleteVariantDialog: 剩余变体', { remaining: result.remaining });
                    self.onVariantChange();
                    showToast('变体 "' + variantName + '" 已删除', 'warning');
                    this.hide();
                },
            }).show();
        },
        showNewPartDialog: function () {
            log.debug('showNewPartDialog: 点击"新建零件"按钮');
            var config = getConfig();
            if (!config) {
                log.error('showNewPartDialog: getConfig() 返回 null');
                return;
            }
            var self = this;
            // 对话框与撤销边界都在共享实现里（ui/dialogs/part_dialogs.js → core/operations.js）
            require('./dialogs/part_dialogs.js').showNewPartDialog(config, function () {
                self.loadConfigData();
            });
        },
        showNewVariantDialog: function () {
            log.debug('showNewVariantDialog: 点击"新建变体"按钮');
            const self = this;
            new Dialog({
                title: '新建变体',
                form: {
                    variantName: { type: 'text', label: '变体名' },
                    model: { type: 'text', label: '模型引用', value: 'machine_max:' },
                },
                onConfirm: function (formData) {
                    var result = ops.createVariant(self.config, {
                        partId: self.activePartId,
                        variantName: formData.variantName,
                        model: formData.model,
                    });
                    if (!result.ok) {
                        showToast(result.error, 'error');
                        return false;
                    }
                    self.activeVariantName = result.variantName;
                    log.info('UI新建变体成功', { variant: result.variantName, partId: self.activePartId });
                    self.onVariantChange();
                    this.hide();
                },
            }).show();
            log.debug('showNewVariantDialog: Dialog 已显示');
        },
        onSelectionChange: function () {
            if (!this.markerVersion) return;
            var sel = Outliner && Outliner.selected;

            // 检查 SignalFlowPanel 发起的子系统导航请求（通过 config 共享）
            var pendingNav = this.config && this.config._uiState && this.config._uiState._pendingSubsystemNav;
            if (pendingNav && pendingNav.subsystemKey) {
                this.subsystemSelection = { spKey: pendingNav.spKey, subsystemKey: pendingNav.subsystemKey };
                this.config._uiState._pendingSubsystemNav = null;
                this.selectedElement = null; // 清空 Outliner 选中，让子系统面板优先显示
                this.markerVersion.v++;
                log.debug('onSelectionChange: 信号流图触发子系统导航', {
                    spKey: pendingNav.spKey,
                    subsystemKey: pendingNav.subsystemKey,
                });
                return;
            }

            if (!sel || sel.length === 0) {
                this.selectedElement = null;
                this.markerVersion.v++;
                // debug: 取消选中时记录当前 sub_parts 状态
                var v = this.currentVariant;
                var spKeys = v && v.sub_parts ? Object.keys(v.sub_parts) : [];
                log.debug('onSelectionChange: 取消选中', {
                    markerVersion: this.markerVersion.v,
                    subPartCount: spKeys.length,
                    subPartKeys: spKeys,
                    variantExists: !!v,
                    configExists: !!this.config,
                });
                return;
            }
            // 选中 Outliner 元素时清空子系统虚拟选择
            this.subsystemSelection = { spKey: '', subsystemKey: '' };
            // Group 不在 Outliner.selected 中（Group 继承自 OutlinerNode 而非 OutlinerElement）
            // 优先用 Group.first_selected；其次取 Outliner.selected[0]（Cube/Locator 等）
            var best = (typeof Group !== 'undefined' && Group.first_selected) || sel[0];
            var sameElement = this.selectedElement && this.selectedElement.uuid === best.uuid;
            this.selectedElement = best;
            this.markerVersion.v++;
            this.$forceUpdate(); // 后备保障：确保 Vue 模板强制重新渲染，弥补计算属性依赖追踪可能遗漏的场景
            var v2 = this.currentVariant;
            var spKeys2 = v2 && v2.sub_parts ? Object.keys(v2.sub_parts) : [];
            log.debug('onSelectionChange: 选中元素', {
                name: best.name,
                uuid: best.uuid,
                type: best.constructor ? best.constructor.name : typeof best,
                groupSelected: !!(typeof Group !== 'undefined' && Group.first_selected),
                sameElementAsBefore: sameElement,
                markerVersion: this.markerVersion.v,
                subPartCount: spKeys2.length,
                subPartKeys: spKeys2,
            });
        },
        loadConfigData: function () {
            let config = getConfig();
            if (!config) {
                config = loadConfig();
                log.debug('loadConfigData: 重新加载配置');
            } else {
                log.debug('loadConfigData: 从缓存获取配置');
            }
            this.config = config;
            if (config) {
                this.activePartId = config._uiState?.activePartId || '';
                this.activeVariantName = config._uiState?.activeVariantName || '';
                log.debug('loadConfigData: 完成', {
                    activePartId: this.activePartId,
                    activeVariantName: this.activeVariantName,
                });
            } else {
                log.warn('loadConfigData: 配置仍为空');
            }
        },
        /**
         * 导航到碰撞箱：选中碰撞箱对应的 Group 骨骼，切换到碰撞箱属性面板
         */
        navigateToHitBox: function (hbKey) {
            if (!hbKey) return;
            var el = Group.all.find(function (g) { return g.name === hbKey || g.uuid === hbKey; });
            if (el) {
                el.select();
                el.showInOutliner();
                Blockbench.dispatchEvent('update_selection');
            }
        },
        /**
         * 导航到连接点：选中连接点对应的 Locator，切换到连接点属性面板
         */
        navigateToConnector: function (connKey) {
            if (!connKey) return;
            var spConfig = this.selectedSubPartConfig;
            if (!spConfig || !spConfig.connectors || !spConfig.connectors[connKey]) return;
            var locatorName = spConfig.connectors[connKey].locator;
            if (!locatorName) return;
            var loc = typeof Locator !== 'undefined' ? Locator.all.find(function (l) { return l.name === locatorName; }) : null;
            if (loc) {
                loc.select();
                loc.showInOutliner();
                Blockbench.dispatchEvent('update_selection');
            }
        },
        /**
         * 处理幽灵条目清理：用户在面板中点击了一个条目，但其对应的模型元素已不存在。
         * 清理该条目的下游配置和 element_markers 标记。由 SubPartPanel 的 clean-ghost-entry 事件触发。
         *
         * @param {{ type: string, spKey: string, key: string }} payload
         *        type - 'hit_box' | 'interact_box' | 'connector'
         *        spKey - 所属子零件 key
         *        key - 条目在字典中的 key
         */
        handleCleanGhostEntry: function (payload) {
            if (!payload || !payload.type || !payload.spKey || !payload.key) {
                log.warn('handleCleanGhostEntry: 无效的清理载荷', payload);
                return;
            }

            var part = this.currentPart;
            var variantName = this.activeVariantName;
            if (!part || !part.variants || !part.variants[variantName]) {
                log.warn('handleCleanGhostEntry: 当前零件/变体不可用');
                return;
            }
            var variant = part.variants[variantName];
            if (!variant.sub_parts || !variant.sub_parts[payload.spKey]) {
                log.warn('handleCleanGhostEntry: 子零件不存在', { spKey: payload.spKey });
                return;
            }
            var sp = variant.sub_parts[payload.spKey];

            var cleaned = false;
            var typeLabel = '';

            if (payload.type === 'hit_box') {
                typeLabel = '碰撞箱';
                if (sp.hit_boxes && sp.hit_boxes[payload.key] !== undefined) {
                    // 清理下游配置
                    delete sp.hit_boxes[payload.key];
                    // 清理 element_markers（key 为 UUID）
                    if (part.element_markers && part.element_markers[variantName]) {
                        delete part.element_markers[variantName][payload.key];
                    }
                    cleaned = true;
                }
            } else if (payload.type === 'interact_box') {
                typeLabel = '交互区';
                if (sp.interact_boxes && sp.interact_boxes[payload.key] !== undefined) {
                    var ib = sp.interact_boxes[payload.key];
                    // 清理 element_markers（通过 _uuid）
                    if (ib && ib._uuid && part.element_markers && part.element_markers[variantName]) {
                        delete part.element_markers[variantName][ib._uuid];
                    }
                    // 清理下游配置
                    delete sp.interact_boxes[payload.key];
                    cleaned = true;
                }
            } else if (payload.type === 'connector') {
                typeLabel = '连接点';
                if (sp.connectors && sp.connectors[payload.key] !== undefined) {
                    var conn = sp.connectors[payload.key];
                    // 清理 element_markers（通过 _marker_uuid）
                    if (conn && conn._marker_uuid && part.element_markers && part.element_markers[variantName]) {
                        delete part.element_markers[variantName][conn._marker_uuid];
                    }
                    // 清理下游配置
                    delete sp.connectors[payload.key];
                    cleaned = true;
                }
            }

            if (cleaned) {
                log.info('handleCleanGhostEntry: 已清理幽灵' + typeLabel + '条目', {
                    partId: this.activePartId, variant: variantName,
                    type: payload.type, spKey: payload.spKey, key: payload.key,
                });
                scheduleSave();
                refreshOutlinerIcons();
                showToast('已自动清理幽灵' + typeLabel + ' "' + payload.key + '"（对应模型元素已不存在）', 'warning');
            } else {
                log.debug('handleCleanGhostEntry: 条目已不存在（可能已被清理）', payload);
            }
        },
        /**
         * 导航到子零件：根据 subPartKey 找到对应的子零件标记 Group 并选中，切换回子零件属性面板
         */
        navigateToSubPart: function (spKey) {
            if (!spKey) return;
            var part = this.currentPart;
            var variantName = this.activeVariantName;
            if (!part || !part.element_markers || !part.element_markers[variantName]) return;
            var markers = part.element_markers[variantName];
            for (var uuid in markers) {
                if (markers[uuid].type === 'sub_part' && markers[uuid].config_ref === spKey) {
                    var group = Group.all.find(function (g) { return g.uuid === uuid; });
                    if (group) {
                        group.select();
                        group.showInOutliner();
                        Blockbench.dispatchEvent('update_selection');
                    }
                    return;
                }
            }
        },
        /**
         * 游离元素节流 toast：统计 orphan_element 问题，5 秒内只提示一次（防每次编辑刷屏）
         */
        _maybeToastOrphans: function (problems) {
            if (!problems || !Array.isArray(problems)) return;
            var orphanCount = 0;
            for (var i = 0; i < problems.length; i++) {
                if (problems[i] && problems[i].code === 'orphan_element') orphanCount++;
            }
            if (orphanCount === 0) return;
            var now = Date.now();
            if (this._orphanToastAt && (now - this._orphanToastAt < 5000)) return;
            this._orphanToastAt = now;
            showToast('发现 ' + orphanCount + ' 个游离元素（连接点/碰撞箱/交互区无归属子零件），请检查', 'warning');
        },
        /**
         * 子零件列表行的悬浮提示：默认跳转提示，有问题时追加问题清单（\n 换行）
         */
        subPartTooltip: function (entry) {
            var base = '点击跳转到子零件 ' + entry.key;
            if (!entry.issues || entry.issues.length === 0) return base;
            var lines = [base, '—— 存在问题 ——'];
            for (var i = 0; i < entry.issues.length; i++) {
                var p = entry.issues[i];
                lines.push('[' + (p.severity === 'error' ? '错误' : '警告') + '] ' + p.message);
            }
            return lines.join('\n');
        },
        /** 零件/变体字段的问题列表（用于根面板字段级标注） */
        partVariantFieldIssues: function (field) {
            return filterFieldIssues(this.partVariantIssues, field);
        },
        /** 零件/变体字段的问题级别 */
        partVariantFieldLevel: function (field) {
            return resolveIssueLevel(this.partVariantFieldIssues(field));
        },
        /** 零件/变体字段包装 class：mm-field-error / mm-field-warning */
        partVariantFieldClass: function (field) {
            var level = this.partVariantFieldLevel(field);
            return level === 'none' ? '' : 'mm-field-' + level;
        },
        /** 零件/变体字段行内提示 */
        partVariantIssueMessage: function (field) {
            return fieldIssueHelpers.fieldIssueMessage(this.partVariantIssues, field);
        },
        /** 零件/变体字段悬浮提示 */
        partVariantIssueTitle: function (field, base) {
            return fieldIssueHelpers.fieldIssueTitle(this.partVariantIssues, field, base);
        },
        /**
         * 导航统一入口 selectByIssue(problem)：
         * 供原生清单"定位"按钮与面板红框共用。按 path.scope 分派到各导航动作。
         * 挂载时注册为全局单例 window.__mmNavigator。
         */
        selectByIssue: function (problem) {
            var pi = problem && problem.path;
            if (!pi) return;
            var partId = pi.partId;
            var vName = pi.variantName;

            // 1) 切到目标零件/变体（若与当前不同）
            var cfg = getConfig();
            if (cfg && partId && cfg.parts && cfg.parts[partId]) {
                if (cfg._uiState.activePartId !== partId) {
                    cfg._uiState.activePartId = partId;
                }
                if (vName && cfg._uiState.activeVariantName !== vName) {
                    cfg._uiState.activeVariantName = vName;
                }
                this.activePartId = cfg._uiState.activePartId;
                this.activeVariantName = cfg._uiState.activeVariantName;
                refreshOutlinerIcons();
            }

            // 2) 按 scope 定位到具体元素
            var uuid = pi.elementUuid;
            switch (pi.scope) {
                case 'subpart':
                    if (pi.subPartKey) this.navigateToSubPart(pi.subPartKey);
                    break;
                case 'subsystem':
                    if (pi.subPartKey && pi.itemKey) {
                        this.selectSubsystem({ spKey: pi.subPartKey, subsystemKey: pi.itemKey });
                    }
                    break;
                case 'connector':
                    this._selectConnector(pi, uuid);
                    break;
                case 'hit_box':
                case 'interact_box':
                    this._selectElementByUuid(uuid);
                    break;
                case 'part':
                case 'variant':
                default:
                    break; // 已在步骤 1) 切换零件/变体
            }
        },
        /** 按 UUID 选中 Group/Locator 并显示在 Outliner */
        _selectElementByUuid: function (uuid) {
            if (!uuid) return;
            if (typeof Group === 'undefined' || typeof Locator === 'undefined') return;
            var el = Group.all.find(function (g) { return g.uuid === uuid; }) ||
                     Locator.all.find(function (l) { return l.uuid === uuid; });
            if (el) {
                el.select();
                if (el.showInOutliner) el.showInOutliner();
                Blockbench.dispatchEvent('update_selection');
            }
        },
        /** 定位到连接点：优先按 elementUuid，其次按 connectors 条目的 locator 名 */
        _selectConnector: function (pi, uuid) {
            var loc = null;
            if (uuid && typeof Locator !== 'undefined') {
                loc = Locator.all.find(function (l) { return l.uuid === uuid; });
            }
            if (!loc && pi.subPartKey && pi.itemKey && this.currentVariant && this.currentVariant.sub_parts) {
                var sp = this.currentVariant.sub_parts[pi.subPartKey];
                var conn = sp && sp.connectors && sp.connectors[pi.itemKey];
                if (conn && conn.locator && typeof Locator !== 'undefined') {
                    loc = Locator.all.find(function (l) { return l.name === conn.locator; });
                }
            }
            if (loc) {
                loc.select();
                if (loc.showInOutliner) loc.showInOutliner();
                Blockbench.dispatchEvent('update_selection');
            }
        },
        /**
         * 为当前选中标记补建缺失的配置条目（docs/13 §9）。
         * 渲染期只读；这里显式调用 ops，撤销边界与命名规则都在操作层。
         */
        repairSelectedConfig: function () {
            var config = getConfig();
            var marker = this.selectedMarker;
            var element = this.selectedElement;
            if (!config || !marker || !element) {
                showToast('当前没有可修复的标记', 'warning');
                return;
            }
            var ctx = {
                partId: this.activePartId,
                variantName: this.activeVariantName,
                element: element,
            };
            var result;
            if (marker.type === 'sub_part') {
                ctx.spKey = marker.config_ref;
                result = ops.markSubPart(config, ctx);
            } else if (marker.type === 'hit_box') {
                result = ops.markHitBox(config, ctx);
            } else if (marker.type === 'interact_box') {
                result = ops.markInteractBox(config, ctx);
            } else if (marker.type === 'connector') {
                ctx.key = marker.config_ref;
                result = ops.markConnector(config, ctx);
            } else {
                showToast('未知的标记类型', 'warning');
                return;
            }
            if (!result || !result.ok) {
                showToast((result && result.error) || '创建配置失败', 'error');
                return;
            }
            this.markerVersion.v++;
            showToast('已创建缺失的配置条目', 'positive');
        },
        /**
         * 更新零件级字段（图标、耐久贡献、伤害传导等）
         * 模板改为 :value + @change 绑定，提交时才写入配置，从而每次提交产生一条撤销记录
         */
        updatePartField: function (field, value) {
            if (!this.currentPart) {
                log.warn('updatePartField: currentPart 为空', { field: field });
                return;
            }
            var result = ops.setField(this.config, {
                path: ['parts', this.activePartId, field],
                value: value,
                label: '修改零件字段 ' + field,
                source: 'ui',
            });
            if (!result.ok) showToast(result.error, 'error');
            log.debug('updatePartField: 已提交', { field: field, value: value, ok: result.ok });
        },
        /**
         * 更新变体级字段（模型、动画路径等）
         */
        updateVariantField: function (field, value) {
            if (!this.currentVariant) {
                log.warn('updateVariantField: currentVariant 为空', { field: field });
                return;
            }
            var result = ops.setField(this.config, {
                path: ['parts', this.activePartId, 'variants', this.activeVariantName, field],
                value: value,
                label: '修改变体字段 ' + field,
                source: 'ui',
            });
            if (!result.ok) showToast(result.error, 'error');
            log.debug('updateVariantField: 已提交', { field: field, value: value, ok: result.ok });
        },
        /**
         * 更新子零件配置中的单个字段。
         * start_bone 的标记迁移由 ops.setField 的 sideEffect 统一处理。
         */
        updateSubPartField: function (field, value) {
            var spKey = this.selectedMarker && this.selectedMarker.config_ref;
            if (!spKey || !this.selectedSubPartConfig) {
                log.warn('updateSubPartField: selectedSubPartConfig 为空');
                return;
            }
            var result = ops.setField(this.config, {
                path: ['parts', this.activePartId, 'variants', this.activeVariantName,
                    'sub_parts', spKey, field],
                value: value,
                label: '修改子零件字段 ' + field,
                source: 'ui',
            });
            if (!result.ok) showToast(result.error, 'error');
            log.debug('updateSubPartField: 已提交', { field: field, value: value, ok: result.ok });
        },
        /**
         * 重命名子零件：key 迁移 + 全部引用 / 4 类 marker 改写，由 ops.renameSubPart 统一完成。
         */
        renameSubPart: function (oldKey, newKey) {
            if (!oldKey || !newKey || oldKey === newKey) return;
            var result = ops.renameSubPart(this.config, {
                partId: this.activePartId,
                variantName: this.activeVariantName,
                oldKey: oldKey,
                newKey: newKey,
            });
            if (!result.ok) {
                showToast(result.error, 'error');
                return;
            }
            refreshOutlinerIcons();
            this.markerVersion.v++;
            showToast('子零件已重命名为 "' + newKey + '"', 'positive');
            log.info('renameSubPart: 完成', { from: oldKey, to: newKey });
        },
        /**
         * 迁移子零件标记：start_bone 从旧骨骼名变更为新骨骼名时，
         * 将 element_marker 和 sub_parts 中的 key 一并迁移到新骨骼。
         * @param {string} oldBoneName - 旧的起始骨骼名称
         * @param {string} newBoneName - 新的起始骨骼名称
         */
        migrateSubPartStartBone: function (oldBoneName, newBoneName) {
            var spKey = this.selectedMarker ? this.selectedMarker.config_ref : null;
            if (!spKey || !this.selectedSubPartConfig) return;
            var result = ops.setField(this.config, {
                path: ['parts', this.activePartId, 'variants', this.activeVariantName,
                    'sub_parts', spKey, 'start_bone'],
                value: newBoneName,
                label: '迁移子零件起始骨骼',
                source: 'ui',
            });
            if (!result.ok) showToast(result.error, 'error');
            refreshOutlinerIcons();
            this.markerVersion.v++;
            log.info('migrateSubPartStartBone: 完成', { from: oldBoneName, to: newBoneName });
        },
        /**
         * 迁移连接点定位器：locator 从旧名称变更为新名称时，
         * 将 element_marker 和 connectors 中的 key 一并迁移。
         * @param {string} oldLocName - 旧的定位器名称
         * @param {string} newLocName - 新的定位器名称
         */
        migrateConnectorLocator: function (oldLocName, newLocName) {
            if (!oldLocName || !newLocName || oldLocName === newLocName) return;
            var variant = this.currentVariant;
            var variantName = this.activeVariantName;
            if (!variant || !variant.sub_parts) return;

            var owner = this.selectedElement ? detectOwnerSubPart(this.config, this.activePartId, variantName, this.selectedElement) : null;
            var spKey = owner ? owner.spKey : null;
            if (!spKey || !variant.sub_parts[spKey]) return;
            var sp = variant.sub_parts[spKey];
            if (!sp.connectors) return;
            var connKey = Object.keys(sp.connectors).find(function (k) {
                return sp.connectors[k].locator === oldLocName;
            });
            if (!connKey) {
                log.warn('migrateConnectorLocator: 未找到连接点条目', { locator: oldLocName, spKey: spKey });
                return;
            }

            var result = ops.setField(this.config, {
                path: ['parts', this.activePartId, 'variants', variantName,
                    'sub_parts', spKey, 'connectors', connKey, 'locator'],
                value: newLocName,
                label: '迁移连接点定位器',
                source: 'ui',
            });
            if (!result.ok) showToast(result.error, 'error');
            refreshOutlinerIcons();
            this.markerVersion.v++;
            log.info('migrateConnectorLocator: 完成', { from: oldLocName, to: newLocName });
        },
        /**
         * 添加排除骨骼到 end_bones 列表
         */
        addEndBone: function (boneName) {
            var config = this.selectedSubPartConfig;
            var spKey = this.selectedMarker && this.selectedMarker.config_ref;
            if (!config || !spKey) {
                log.warn('addEndBone: selectedSubPartConfig 为空');
                return;
            }
            var list = (config.end_bones || []).slice();
            if (list.indexOf(boneName) < 0) list.push(boneName);
            this._setSubPartField(spKey, 'end_bones', list, '添加排除骨骼');
        },
        /**
         * 移除排除骨骼
         */
        removeEndBone: function (index) {
            var config = this.selectedSubPartConfig;
            var spKey = this.selectedMarker && this.selectedMarker.config_ref;
            if (!config || !spKey || !config.end_bones) {
                log.warn('removeEndBone: selectedSubPartConfig 为空或无 end_bones');
                return;
            }
            var list = config.end_bones.slice();
            list.splice(index, 1);
            this._setSubPartField(spKey, 'end_bones', list, '移除排除骨骼');
        },
        /** 统一的子零件字段提交（数组/对象整体提交，一条撤销记录） */
        _setSubPartField: function (spKey, field, value, label) {
            var result = ops.setField(this.config, {
                path: ['parts', this.activePartId, 'variants', this.activeVariantName,
                    'sub_parts', spKey, field],
                value: value,
                label: label || ('修改子零件字段 ' + field),
                source: 'ui',
            });
            if (!result.ok) showToast(result.error, 'error');
            return result;
        },
        _setItemField: function (container, key, field, value, label) {
            var spKey = container === 'subsystems'
                ? this.subsystemSelection.spKey
                : (container === 'hit_boxes' ? this.hitBoxParentSubPartKey
                    : (container === 'interact_boxes' ? this.interactBoxParentSubPartKey
                        : this.connectorParentSubPartKey));
            if (!spKey || !key) return { ok: false, error: '缺少上下文' };
            var suffix = Array.isArray(field) ? field : [field];
            var result = ops.setField(this.config, {
                path: ['parts', this.activePartId, 'variants', this.activeVariantName,
                    'sub_parts', spKey, container, key].concat(suffix),
                value: value,
                label: label || ('修改 ' + suffix.join('.')),
                source: 'ui',
            });
            if (!result.ok) showToast(result.error, 'error');
            return result;
        },
        /**
         * 更新碰撞箱配置中的单个字段
         * 游离碰撞箱（无归属）可编辑但不会持久化
         */
        updateHitBoxField: function (field, value) {
            var config = this.selectedHitBoxConfig;
            if (!config) {
                log.warn('updateHitBoxField: selectedHitBoxConfig 为空');
                return;
            }
            if (config._orphan) {
                log.warn('updateHitBoxField: 游离碰撞箱不可持久化', { field: field, value: value });
                return;
            }
            this._setItemField('hit_boxes', this.selectedElement.uuid, field, value,
                '修改碰撞箱字段 ' + field);
        },
        /**
         * 更新碰撞箱材质覆写字段
         */
        updateHitBoxOverwrite: function (field, value) {
            var config = this.selectedHitBoxConfig;
            if (!config) {
                log.warn('updateHitBoxOverwrite: selectedHitBoxConfig 为空');
                return;
            }
            if (config._orphan) {
                log.warn('updateHitBoxOverwrite: 游离碰撞箱不可持久化', { field: field, value: value });
                return;
            }
            this._setItemField('hit_boxes', this.selectedElement.uuid,
                ['overwrite'].concat(String(field).split('.')), value,
                '修改碰撞箱覆写 ' + field);
        },
        /**
         * 更新交互区配置中的单个字段
         * 游离交互区（无归属）可编辑但不会持久化
         */
        updateInteractBoxField: function (field, value) {
            var config = this.selectedInteractBoxConfig;
            if (!config) {
                log.warn('updateInteractBoxField: selectedInteractBoxConfig 为空');
                return;
            }
            if (config._orphan) {
                log.warn('updateInteractBoxField: 游离交互区不可持久化', { field: field, value: value });
                return;
            }
            this._setItemField('interact_boxes', this.interactBoxName, field, value,
                '修改交互区字段 ' + field);
            if (field === 'bone') this.markerVersion.v++;
        },
        /**
         * 更新连接点配置字段（marker.config_ref 始终指向连接点 key，不再随 definition 变化）
         */
        updateConnectorField: function (field, value) {
            var config = this.selectedConnectorConfig;
            if (!config) {
                log.warn('updateConnectorField: selectedConnectorConfig 为空');
                return;
            }
            if (config._orphan) {
                log.warn('updateConnectorField: 游离连接点不可持久化', { field: field, value: value });
                return;
            }
            this._setItemField('connectors', this.connectorKeyName, field, value,
                '修改连接点字段 ' + field);
        },
        /**
         * 添加子系统：弹出类型选择对话框，用户选择类型并输入名称后在指定子零件下创建子系统实例
         * @param {string} spKey - 子零件 key
         * @param {string} [preSelectedType] - 预选的子系统类型 ID（右键菜单直接跳转时使用）
         */
        addSubsystem: function (spKey, preSelectedType) {
            if (!spKey) {
                spKey = this.subsystemSelection.spKey;
            }
            if (!spKey) {
                var marker = this.selectedMarker;
                if (!marker || marker.type !== 'sub_part') return;
                spKey = marker.config_ref;
            }
            var variant = this.currentVariant;
            if (!variant) return;
            var self = this;
            var { showAddSubsystemDialog } = require('./add_subsystem_dialog.js');
            // 落库与撤销在 ops.createSubsystem 内部；这里只传上下文与创建后回调。
            // 子零件条目缺失时由操作在确认时补建，取消对话框不会留下空条目。
            showAddSubsystemDialog({
                config: this.config,
                variant: variant,
                partId: this.activePartId,
                variantName: this.activeVariantName,
                spKey: spKey,
                preSelectedType: preSelectedType,
                onCreated: function (createdSpKey, instanceName) {
                    self.subsystemSelection = { spKey: createdSpKey, subsystemKey: instanceName };
                    self.markerVersion.v++;
                    log.info('addSubsystem: 已创建子系统', { spKey: createdSpKey, instanceName: instanceName });
                },
            });
        },
        /**
         * 删除子系统：确认后从 sub_parts 中移除（撤销边界在 ops.deleteSubsystem 内部）
         */
        deleteSubsystem: function (spKey, ssKey) {
            if (!spKey || !ssKey) return;
            var variant = this.currentVariant;
            if (!variant || !variant.sub_parts) return;
            var sp = variant.sub_parts[spKey];
            if (!sp || !sp.subsystems || !sp.subsystems[ssKey]) return;
            var self = this;
            new Dialog({
                title: '确认删除子系统',
                form: {
                    info: {
                        type: 'info',
                        text: '确认删除子系统 "' + ssKey + '" ？（可用 Ctrl+Z 撤销）',
                    },
                },
                onConfirm: function () {
                    var result = ops.deleteSubsystem(self.config, {
                        partId: self.activePartId,
                        variantName: self.activeVariantName,
                        spKey: spKey,
                        ssKey: ssKey,
                    });
                    if (!result.ok) {
                        showToast(result.error, 'error');
                        return false;
                    }
                    self.subsystemSelection = { spKey: '', subsystemKey: '' };
                    self.markerVersion.v++;
                    log.info('deleteSubsystem: 已删除子系统', { spKey: spKey, subsystemKey: ssKey });
                    showToast('子系统 "' + ssKey + '" 已删除', 'warning');
                    this.hide();
                }
            }).show();
        },
        /**
         * 选择子系统：设置虚拟选择状态，切换到子系统属性面板
         */
        selectSubsystem: function (params) {
            var spKey = params.spKey || this.subsystemSelection.spKey;
            var ssKey = params.subsystemKey;
            if (!spKey || !ssKey) return;
            this.subsystemSelection = { spKey: spKey, subsystemKey: ssKey };
            // 清空 Outliner 选中，让子系统面板优先显示
            this.selectedElement = null;
            log.debug('selectSubsystem: 选中子系统', { spKey: spKey, subsystemKey: ssKey });
        },
        /**
         * 重命名子系统：修改 subsystems 字典的 key
         */
        renameSubsystem: function (oldKey, newKey) {
            if (!oldKey || !newKey || oldKey === newKey) return;
            var spKey = this.subsystemSelection.spKey;
            if (!spKey) return;
            var result = ops.renameSubsystem(this.config, {
                partId: this.activePartId,
                variantName: this.activeVariantName,
                spKey: spKey,
                oldKey: oldKey,
                newKey: newKey,
            });
            if (!result.ok) {
                showToast(result.error, 'error');
                return;
            }
            this.subsystemSelection.subsystemKey = newKey;
            showToast('子系统已重命名为 "' + newKey + '"', 'positive');
        },
        /**
         * 更新子系统配置中的单个字段
         */
        updateSubsystemField: function (ssKey, field, value) {
            if (!ssKey || !field) return;
            this._setItemField('subsystems', ssKey, field, value, '修改子系统字段 ' + field);
        },
        /**
         * 重命名连接点：修改 connectors 字典的 key
         * 需要先找到当前连接点（通过 locator 字段），然后迁移 key
         */
        renameConnector: function (oldKey, newKey) {
            if (!oldKey || !newKey || oldKey === newKey) return;
            var spKey = this.connectorParentSubPartKey;
            if (!spKey) return;
            var result = ops.renameConnector(this.config, {
                partId: this.activePartId,
                variantName: this.activeVariantName,
                spKey: spKey,
                oldKey: oldKey,
                newKey: newKey,
            });
            if (!result.ok) {
                showToast(result.error, 'error');
                return;
            }
            refreshOutlinerIcons();
            this.markerVersion.v++;
            showToast('连接点已重命名为 "' + newKey + '"', 'positive');
        },
        /**
         * 重命名交互区：修改 interact_boxes 字典的 key
         */
        renameInteractBox: function (oldKey, newKey) {
            if (!oldKey || !newKey || oldKey === newKey) return;
            var spKey = this.interactBoxParentSubPartKey;
            if (!spKey) return;
            var result = ops.renameInteractBox(this.config, {
                partId: this.activePartId,
                variantName: this.activeVariantName,
                spKey: spKey,
                oldKey: oldKey,
                newKey: newKey,
            });
            if (!result.ok) {
                showToast(result.error, 'error');
                return;
            }
            refreshOutlinerIcons();
            this.markerVersion.v++;
            showToast('交互区已重命名为 "' + newKey + '"', 'positive');
        },
        /**
         * 迁移交互区骨骼绑定：bone 从旧骨骼变更为新骨骼时，
         * 同步迁移 element_marker 到新骨骼的 UUID，并选中新骨骼。
         */
        migrateInteractBoxBone: function (field, newBoneName) {
            var config = this.selectedInteractBoxConfig;
            var ibKey = this.interactBoxName;
            if (!config || config._orphan || !ibKey) {
                log.warn('migrateInteractBoxBone: 交互区不可迁移');
                return;
            }
            var oldBoneName = config.bone || '';
            if (oldBoneName === newBoneName) return;

            var result = ops.setField(this.config, {
                path: ['parts', this.activePartId, 'variants', this.activeVariantName,
                    'sub_parts', this.interactBoxParentSubPartKey, 'interact_boxes', ibKey, 'bone'],
                value: newBoneName,
                label: '迁移交互区骨骼',
                source: 'ui',
            });
            if (!result.ok) {
                showToast(result.error, 'error');
                return;
            }

            var newGroup = typeof Group !== 'undefined'
                ? Group.all.find(function (g) { return g.name === newBoneName; }) : null;
            if (newGroup) {
                newGroup.select();
                newGroup.showInOutliner();
            }
            this.markerVersion.v++;
            refreshOutlinerIcons();
            log.info('migrateInteractBoxBone: 骨骼迁移完成', { from: oldBoneName, to: newBoneName });
        },

        /* —————— 贴图键值对编辑器事件处理 —————— */
        handleTexturesKvAdd: function (payload) {
            var v = this.currentVariant;
            if (!v) return;
            var next = Object.assign({}, (typeof v.textures === 'object' && !Array.isArray(v.textures)) ? v.textures : {});
            next[payload.key] = payload.value;
            this._setVariantTextures(next, '添加贴图涂装');
        },
        handleTexturesKvRemove: function (payload) {
            var v = this.currentVariant;
            if (!v || !v.textures || typeof v.textures !== 'object') return;
            var next = Object.assign({}, v.textures);
            delete next[payload.key];
            this._setVariantTextures(next, '删除贴图涂装');
        },
        handleTexturesKvUpdateKey: function (payload) {
            var v = this.currentVariant;
            if (!v || !v.textures || typeof v.textures !== 'object') return;
            var next = Object.assign({}, v.textures);
            var val = next[payload.oldKey];
            delete next[payload.oldKey];
            if (val !== undefined) next[payload.newKey] = val;
            this._setVariantTextures(next, '重命名贴图涂装');
        },
        handleTexturesKvUpdateValue: function (payload) {
            var v = this.currentVariant;
            if (!v || !v.textures || typeof v.textures !== 'object') return;
            var next = Object.assign({}, v.textures);
            next[payload.key] = payload.newValue;
            this._setVariantTextures(next, '修改贴图路径');
        },
        _setVariantTextures: function (textures, label) {
            var result = ops.setField(this.config, {
                path: ['parts', this.activePartId, 'variants', this.activeVariantName, 'textures'],
                value: textures,
                label: label,
                source: 'ui',
            });
            if (!result.ok) showToast(result.error, 'error');
            return result;
        },
    },
    mounted: function () {
        var self = this;
        log.debug('Vue 组件 mounted');

        function initFromProject() {
            if (!Project || Project === 0) {
                log.debug('initFromProject: 项目尚未打开');
                return false;
            }
            self.loadConfigData();
            self.onSelectionChange();
            log.debug('initFromProject: 项目初始化完成');
            return true;
        }

        if (!initFromProject()) {
            this.$nextTick(function () {
                log.debug('$nextTick: 重试项目初始化');
                initFromProject();
            });
        }

        this._projectHandler = Blockbench.on('select_project', function () {
            log.debug('事件: select_project');
            self.loadConfigData();
            self.onSelectionChange();
        });

        this._selectionHandler = Blockbench.on('update_selection', function () {
            self.onSelectionChange();
        });

        this._modeHandler = Blockbench.on('select_mode', function (event) {
            // Blockbench select_mode 事件分发的参数是 {mode: Mode} 对象，不是字符串
            var modeId = (event && event.mode && event.mode.id) || '';
            log.debug('事件: select_mode', { modeId: modeId, raw: event });
            if (modeId === 'machine_max_part') {
                self.loadConfigData();
                self.onSelectionChange();
                // 首次进入模式时检查内容包路径是否已设置
                var cfg = getConfig();
                if (cfg && (!cfg.contentPackPath || cfg.contentPackPath === '')) {
                    log.info('select_mode: 内容包路径未设置，触发设置向导');
                    var dialog = require('./dialogs/pack_setup_dialog.js');
                    dialog.showPackSetupDialog(cfg, function (updatedConfig) {
                        self.loadConfigData();
                    });
                }
            }
        });

        this._saveHandler = Blockbench.on('save', function () {
            log.debug('事件: save — 保存配置');
            saveConfig();
        });

        // 配置变更单一出口（docs/13 §7.2）：op 写入完成后统一刷新 + 防抖落盘
        this._configChangedHandler = Blockbench.on('mm_config_changed', function (event) {
            refreshOutlinerIcons();
            self.markerVersion.v++;
            if (!event || event.persist !== false) scheduleSave();
        });

        // 撤销 / 重做把配置整块换掉之后，面板必须重新读取配置对象引用
        // （_uiState 之外的字段是直接赋值，Vue 2 观测不到）
        this._restoredHandler = Blockbench.on(undo.RESTORED_EVENT, function () {
            log.debug('事件: ' + undo.RESTORED_EVENT + ' — 重新读取配置');
            self.loadConfigData();
            self.markerVersion.v++;
            self.onSelectionChange();
        });

        // 注册全局导航单例：供原生清单"定位"按钮与插件自身共用
        this._mmNavigatorObj = { selectByIssue: function (p) { self.selectByIssue(p); } };
        window.__mmNavigator = this._mmNavigatorObj;

        log.debug('Vue 组件挂载完成，已注册事件监听');
    },
    beforeDestroy: function () {
        log.debug('Vue 组件 beforeDestroy — 清理事件监听');
        if (this._projectHandler) { this._projectHandler(); log.debug('已移除 select_project 监听'); }
        if (this._selectionHandler) { this._selectionHandler(); log.debug('已移除 update_selection 监听'); }
        if (this._modeHandler) { this._modeHandler(); log.debug('已移除 select_mode 监听'); }
        if (this._saveHandler) { this._saveHandler(); log.debug('已移除 save 监听'); }
        if (this._configChangedHandler) { this._configChangedHandler(); log.debug('已移除 mm_config_changed 监听'); }
        if (this._restoredHandler) { this._restoredHandler(); log.debug('已移除配置恢复监听'); }
        if (window.__mmNavigator === this._mmNavigatorObj) {
            delete window.__mmNavigator;
            log.debug('已清理全局导航单例 __mmNavigator');
        }
    },
};

// =============================================================================
// 撤销接入：把"会改配置"的方法统一包成 Blockbench 原生撤销记录
// =============================================================================
//
// 只包真正写配置的方法。以下方法只改 _uiState / Vue 本地状态，不进撤销栈：
//   onPartChange / onVariantChange / selectSubsystem / selectByIssue /
//   navigateTo* / _select* / showNew*Dialog（写配置在对话框 onConfirm 里单独包）
//
// 标签用函数形式时按入参生成，撤销历史里能直接看出改了哪个字段。
var MM_UNDO_LABELS = {
    removeTag: '删除标签',
    handleCleanGhostEntry: '清理幽灵条目',
};

undo.wrapMethodMap(MM_MAIN_PANEL_OPTIONS.methods, MM_UNDO_LABELS);

const MMMainPanel = Vue.component('mm-main-panel', MM_MAIN_PANEL_OPTIONS);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MMMainPanel;
}
