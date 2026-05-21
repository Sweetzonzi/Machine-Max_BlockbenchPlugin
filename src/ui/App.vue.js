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
const { getConfig, loadConfig, saveConfig } = require('../utils/persistence.js');
const { getMarkerInfo, clearAllMarkers, detectOwnerSubPart } = require('../core/element_markers.js');
const { createVariantConfig, createPartConfig, createSubPartConfig } = require('../core/config.js');
const { createLogger } = require('../utils/logger.js');
const { refreshOutlinerIcons } = require('../mode/icons.js');
const { showToast } = require('../utils/notify.js');
const content_pack_manager = require('../core/content_pack_manager.js');
const nameUtils = require('../utils/name_utils.js');
var { showAddTagDialog, _hashTagColor } = require('./tag_dialog_helper.js');

/** 模块日志 */
var log = createLogger('UI');

require('./SubPartPanel.vue.js');

require('./HitBoxPanel.vue.js');

require('./InteractBoxPanel.vue.js');

require('./ConnectorPanel.vue.js');

require('./SubsystemPanel.vue.js');

require('./components/KeyValueEditor.vue.js');

const MMMainPanel = Vue.component('mm-main-panel', {
    template: TEMPLATE_PART_PANEL,
    data: function () {
        return {
            config: null,
            activePartId: '',
            activeVariantName: '',
            selectedElement: null,
            _markerVersion: 0, // 标记更新版本号，右键菜单 delete 操作后递增，强制计算属性重新求值
            subsystemSelection: { spKey: '', subsystemKey: '' }, // 虚拟选择的子系统
        };
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
         * 仅在当前选中子零件骨骼子树下的定位器名称列表（用于质心/连接点等选择器）。
         * 对每个 Locator 沿 parent 链查找第一个 sub_part 标记，若匹配当前子零件则纳入。
         */
        ownedLocatorNames: function () {
            var variant = this.currentVariant;
            var part = this.currentPart;
            var variantName = this.activeVariantName;
            if (!variant || !part || !this.selectedElement) return [];
            var marker = this.selectedMarker;
            if (!marker || marker.type !== 'sub_part') return [];
            var spKey = marker.config_ref || this.selectedElementName;
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
         * 当前变体下的所有子零件条目（含短名、起始骨骼、子系统数）
         * 用于零件/变体属性面板中的子零件列表
         */
        subPartEntries: function () {
            var variant = this.currentVariant;
            if (!variant || !variant.sub_parts) return [];
            var ns = (this.config && this.config.namespace) || 'machine_max';
            var keys = Object.keys(variant.sub_parts);
            var self = this;
            return keys.map(function (spKey) {
                var sp = variant.sub_parts[spKey];
                return {
                    key: spKey,
                    shortName: nameUtils.extractShortName(spKey, ns),
                    startBone: sp ? sp.start_bone : '',
                    subsystemCount: sp && sp.subsystems ? Object.keys(sp.subsystems).length : 0,
                    hitBoxCount: sp && sp.hit_boxes ? Object.keys(sp.hit_boxes).length : 0,
                    interactBoxCount: sp && sp.interact_boxes ? Object.keys(sp.interact_boxes).length : 0,
                    connectorCount: sp && sp.connectors ? Object.keys(sp.connectors).length : 0,
                };
            });
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
            return content_pack_manager.loadMergedDefs(this.config, 'connectors').defs;
        },
        selectedMarker: function () {
            if (!this.selectedElement) return null;
            // 读取版本号作为虚拟依赖：右键菜单通过 delete 修改 element_markers 时
            // Vue 2 无法检测，通过自增 _markerVersion 强制该计算属性重新求值
            void this._markerVersion;
            const part = this.currentPart;
            if (!part || !part.element_markers) return null;
            const vMarkers = part.element_markers[this.activeVariantName];
            if (!vMarkers) return null;
            var result = vMarkers[this.selectedElement.uuid] || null;
            log.debug('selectedMarker 计算属性', {
                uuid: this.selectedElement.uuid,
                markerVersion: this._markerVersion,
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
            if (!variant) return null;
            if (!variant.sub_parts) {
                this.$set(variant, 'sub_parts', {});
            }
            // config_ref 存储翻译键格式的名称（如 sub_part.machine_max.main），同时也是 sub_parts 的 key
            const spKey = this.selectedMarker.config_ref;
            if (!spKey) return null;
            // 自动创建缺失的配置（存量标记可能没有对应的配置条目）
            if (!variant.sub_parts[spKey]) {
                // 从标记的 Group 获取实际骨骼名
                var groupEl = this.selectedElement;
                const spConfig = createSubPartConfig();
                spConfig.start_bone = groupEl ? groupEl.name : spKey;
                this.$set(variant.sub_parts, spKey, spConfig);
                log.debug('selectedSubPartConfig: 自动创建配置', { spKey: spKey, start_bone: spConfig.start_bone });
            }
            if (!variant.sub_parts[spKey].auto_end_bones) {
                this.$set(variant.sub_parts[spKey], 'auto_end_bones', []);
            }
            return variant.sub_parts[spKey] || null;
        },
        /**
         * 当前选中是否为已绑定配置的子零件标记
         */
        isSubPartSelected: function () {
            return this.selectedMarker && this.selectedMarker.type === 'sub_part' && !!this.selectedSubPartConfig;
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
            if (!this.config) return {};
            var cp = require('../core/content_pack_manager.js');
            return cp.loadMergedDefs(this.config, 'subsystems').defs;
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
            var sp = this.currentVariant.sub_parts[this.subsystemSelection.spKey];
            if (!sp) return [{value: 'subpart', label: 'subpart'}, {value: 'vehicle', label: 'vehicle'}];
            var ns = (this.config && this.config.namespace) || 'machine_max';
            var result = [{value: 'subpart', label: 'subpart'}, {value: 'vehicle', label: 'vehicle'}];
            if (sp.connectors) {
                var connKeys = Object.keys(sp.connectors);
                for (var i = 0; i < connKeys.length; i++) {
                    result.push({value: connKeys[i], label: nameUtils.displayLabel(connKeys[i], 'zh', ns)});
                }
            }
            if (sp.subsystems) {
                var ssKeys = Object.keys(sp.subsystems);
                for (var j = 0; j < ssKeys.length; j++) {
                    result.push({value: ssKeys[j], label: nameUtils.displayLabel(ssKeys[j], 'zh', ns)});
                }
            }
            return result;
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
            var spKey = this.connectorParentSubPartKey;
            if (!spKey || !this.currentVariant || !this.currentVariant.sub_parts) return [{value:'subpart',label:'subpart'},{value:'vehicle',label:'vehicle'}];
            var sp = this.currentVariant.sub_parts[spKey];
            if (!sp) return [{value:'subpart',label:'subpart'},{value:'vehicle',label:'vehicle'}];
            var ns = (this.config && this.config.namespace) || 'machine_max';
            var result = [{value:'subpart',label:'subpart'},{value:'vehicle',label:'vehicle'}];
            if (sp.connectors) {
                var connKeys = Object.keys(sp.connectors);
                for (var i = 0; i < connKeys.length; i++) {
                    result.push({value: connKeys[i], label: nameUtils.displayLabel(connKeys[i], 'zh', ns)});
                }
            }
            if (sp.subsystems) {
                var ssKeys = Object.keys(sp.subsystems);
                for (var j = 0; j < ssKeys.length; j++) {
                    result.push({value: ssKeys[j], label: nameUtils.displayLabel(ssKeys[j], 'zh', ns)});
                }
            }
            return result;
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
                return { _orphan: true, id: 'part', type: 'box', material: '', thickness: 1.0, condition: 'true' };
            }
            var owner = this.hitBoxOwner;
            var spKey = owner ? owner.spKey : null;
            if (!spKey || !variant.sub_parts[spKey]) {
                return { _orphan: true, id: 'part', type: 'box', material: '', thickness: 1.0, condition: 'true' };
            }
            var sp = variant.sub_parts[spKey];
            if (!sp.hit_boxes) this.$set(sp, 'hit_boxes', {});
            var hbKey = this.selectedElement.uuid;
            // 注意：此处不自动重建条目。若 sp.hit_boxes[hbKey] 不存在，
            // 说明标记配置不同步（通常由清除 marker 后 Vue 重算导致）。
            // 返回游离配置允许面板正常渲染，但不修改 config。
            return sp.hit_boxes[hbKey] || { _orphan: true, id: 'part', type: 'box', material: '', thickness: 1.0, condition: 'true' };
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
            var spKey = this.interactBoxParentSubPartKey;
            if (!spKey || !this.currentVariant || !this.currentVariant.sub_parts) return [{value:'subpart',label:'subpart'},{value:'vehicle',label:'vehicle'}];
            var sp = this.currentVariant.sub_parts[spKey];
            if (!sp) return [{value:'subpart',label:'subpart'},{value:'vehicle',label:'vehicle'}];
            var ns = (this.config && this.config.namespace) || 'machine_max';
            var result = [{value:'subpart',label:'subpart'},{value:'vehicle',label:'vehicle'}];
            if (sp.connectors) {
                var connKeys = Object.keys(sp.connectors);
                for (var i = 0; i < connKeys.length; i++) {
                    result.push({value: connKeys[i], label: nameUtils.displayLabel(connKeys[i], 'zh', ns)});
                }
            }
            if (sp.subsystems) {
                var ssKeys = Object.keys(sp.subsystems);
                for (var j = 0; j < ssKeys.length; j++) {
                    result.push({value: ssKeys[j], label: nameUtils.displayLabel(ssKeys[j], 'zh', ns)});
                }
            }
            return result;
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
            if (!sp.interact_boxes) this.$set(sp, 'interact_boxes', {});
            var selectedUuid = this.selectedElement.uuid;
            for (var ibKey in sp.interact_boxes) {
                if (sp.interact_boxes[ibKey]._uuid === selectedUuid) {
                    return sp.interact_boxes[ibKey];
                }
            }
            return { _orphan: true, bone: '', interact_mode: 'fast', condition: 'NOR', signal_targets: {} };
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
            if (!variant) return { _orphan: true, definition: marker.config_ref || '' };
            if (!variant.sub_parts) {
                this.$set(variant, 'sub_parts', {});
            }
            var owner = this.connectorOwner;
            var spKey = owner ? owner.spKey : null;
            if (!spKey) {
                return { _orphan: true, definition: marker.config_ref || '' };
            }
            if (!variant.sub_parts[spKey]) {
                var spConfig = createSubPartConfig();
                spConfig.start_bone = spKey;
                this.$set(variant.sub_parts, spKey, spConfig);
            }
            var sp = variant.sub_parts[spKey];
            if (!sp.connectors) {
                this.$set(sp, 'connectors', {});
            }
            var locatorName = this.selectedElementName;
            // 通过 locator 字段查找已有的连接点条目（key 现在是翻译键格式）
            var connKey = Object.keys(sp.connectors).find(function(k) {
                return sp.connectors[k].locator === locatorName;
            });
            // 注意：此处不自动重建条目。若未找到匹配的连接点条目，
            // 说明标记配置不同步（通常由清除 marker 后 Vue 重算导致）。
            // 返回游离配置允许面板正常渲染，但不修改 config。
            if (!connKey) {
                return { _orphan: true, locator: locatorName, definition: marker.config_ref || '' };
            }
            return sp.connectors[connKey] || null;
        },
    },
    methods: {
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
                              '此操作不可撤销！',
                    },
                },
                onConfirm: function () {
                    log.info('showDeletePartDialog: 用户确认删除零件', { partId: partId });

                    self.$delete(config.parts, partId);

                    var remaining = Object.keys(config.parts);
                    if (remaining.length > 0) {
                        config._uiState.activePartId = remaining[0];
                        var firstPart = config.parts[remaining[0]];
                        var firstVariants = Object.keys(firstPart.variants || {});
                        config._uiState.activeVariantName = firstVariants.length > 0 ? firstVariants[0] : 'default';
                    } else {
                        config._uiState.activePartId = '';
                        config._uiState.activeVariantName = '';
                    }

                    refreshOutlinerIcons();
                    self.selectedElement = null;
                    self.loadConfigData();
                    Blockbench.dispatchEvent('update_selection');
                    showToast('零件 "' + partId + '" 已删除', 'warning');
                    log.debug('showDeletePartDialog: 删除完成, 剩余零件', { remaining: remaining });
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
                              '此操作不可撤销！',
                    },
                },
                onConfirm: function () {
                    log.info('showDeleteVariantDialog: 用户确认删除变体', { variant: variantName });

                    clearAllMarkers(config, self.activePartId, variantName);
                    self.$delete(part.variants, variantName);

                    var remaining = Object.keys(part.variants);
                    self.activeVariantName = remaining.length > 0 ? remaining[0] : '';
                    config._uiState.activeVariantName = self.activeVariantName;

                    log.debug('showDeleteVariantDialog: 剩余变体', { remaining: remaining });
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
            try {
                new Dialog({
                    title: '新建零件',
                    form: {
                        partId: { type: 'text', label: '零件 ID', hint: '如 wine_fox_hull' },
                        variantName: { type: 'text', label: '初始变体名', value: 'default' },
                        model: { type: 'text', label: '模型引用', value: 'machine_max:' },
                    },
                    onConfirm: function (formData) {
                        var partId = formData.partId;
                        var variantName = formData.variantName;
                        var model = formData.model;
                        if (!partId) {
                            showToast('零件 ID 不能为空', 'error');
                            return false;
                        }
                        if (config.parts[partId]) {
                            showToast('零件 "' + partId + '" 已存在', 'error');
                            return false;
                        }
                        var cfg = require('../core/config.js');
                        self.$set(config.parts, partId, cfg.createPartConfig(partId, variantName));
                        if (model) {
                            config.parts[partId].variants[variantName].model = model;
                        }
                        config._uiState.activePartId = partId;
                        config._uiState.activeVariantName = variantName;
                        log.info('UI新建零件成功', { partId: partId, variant: variantName });
                        require('../mode/icons.js').refreshOutlinerIcons();
                        Blockbench.dispatchEvent('update_selection');
                        showToast('零件 "' + partId + '" 已创建', 'positive');
                        self.loadConfigData();
                        this.hide();
                    }
                }).show();
                log.debug('showNewPartDialog: Dialog 已显示');
            } catch (e) {
                log.error('showNewPartDialog: 创建 Dialog 异常', e);
            }
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
                    var variantName = formData.variantName;
                    var model = formData.model;
                    if (!variantName) {
                        showToast('变体名不能为空', 'error');
                        return false;
                    }
                    const part = self.currentPart;
                    if (!part) {
                        log.warn('showNewVariantDialog: currentPart 为空');
                        return false;
                    }
                    if (part.variants[variantName]) {
                        showToast('变体 "' + variantName + '" 已存在', 'error');
                        return false;
                    }

                    self.$set(part.variants, variantName, createVariantConfig());
                    if (model) part.variants[variantName].model = model;
                    // 初始化贴图为键值对对象，默认填充 default 涂装
                    var defaultTexPath = 'machine_max:textures/part/' + self.activePartId + '/' + self.activePartId + '.png';
                    part.variants[variantName].textures = { 'default': defaultTexPath };
                    self.activeVariantName = variantName;
                    log.info('UI新建变体成功', { variant: variantName, partId: self.activePartId });
                    self.onVariantChange();
                    this.hide();
                }
            }).show();
            log.debug('showNewVariantDialog: Dialog 已显示');
        },
        onSelectionChange: function () {
            var sel = Outliner && Outliner.selected;

            // 检查 SignalFlowPanel 发起的子系统导航请求（通过 config 共享）
            var pendingNav = this.config && this.config._uiState && this.config._uiState._pendingSubsystemNav;
            if (pendingNav && pendingNav.subsystemKey) {
                this.subsystemSelection = { spKey: pendingNav.spKey, subsystemKey: pendingNav.subsystemKey };
                this.config._uiState._pendingSubsystemNav = null;
                this.selectedElement = null; // 清空 Outliner 选中，让子系统面板优先显示
                this._markerVersion++;
                log.debug('onSelectionChange: 信号流图触发子系统导航', {
                    spKey: pendingNav.spKey,
                    subsystemKey: pendingNav.subsystemKey,
                });
                return;
            }

            if (!sel || sel.length === 0) {
                this.selectedElement = null;
                this._markerVersion++;
                log.debug('onSelectionChange: 取消选中', {
                    markerVersion: this._markerVersion,
                    markerVersionAfter: this._markerVersion,
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
            this._markerVersion++;
            log.debug('onSelectionChange: 选中元素', {
                name: best.name,
                uuid: best.uuid,
                type: best.constructor ? best.constructor.name : typeof best,
                groupSelected: !!(typeof Group !== 'undefined' && Group.first_selected),
                sameElementAsBefore: sameElement,
                markerVersion: this._markerVersion,
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
         * 更新子零件配置中的单个字段。
         * start_bone 变动时需连带迁移子零件标记。
         */
        updateSubPartField: function (field, value) {
            const config = this.selectedSubPartConfig;
            if (!config) {
                log.warn('updateSubPartField: selectedSubPartConfig 为空');
                return;
            }
            if (field === 'start_bone' && config.start_bone !== value) {
                this.migrateSubPartStartBone(config.start_bone, value);
            }
            this.$set(config, field, value);
            log.debug('updateSubPartField: 已更新', { field: field, value: value });
        },
        /**
         * 重命名子零件：修改 sub_parts 字典的 key
         * 同时更新 element_markers 中的 config_ref
         */
        renameSubPart: function (oldKey, newKey) {
            if (!oldKey || !newKey || oldKey === newKey) return;
            var variant = this.currentVariant;
            var part = this.currentPart;
            var variantName = this.activeVariantName;
            if (!variant || !variant.sub_parts || !part) return;

            var spConfig = variant.sub_parts[oldKey];
            if (!spConfig) {
                log.warn('renameSubPart: 未找到子零件', { oldKey: oldKey });
                return;
            }

            // 校验唯一性
            var ns = (this.config && this.config.namespace) || 'machine_max';
            var { validateNameUniqueness } = require('../core/naming.js');
            var check = validateNameUniqueness(variant, 'sub_part', null, newKey, oldKey);
            if (!check.valid) {
                showToast(check.message, 'error');
                return;
            }

            log.info('renameSubPart: 重命名', { from: oldKey, to: newKey });

            // 迁移字典 key
            this.$set(variant.sub_parts, newKey, spConfig);
            this.$delete(variant.sub_parts, oldKey);

            // 更新 element_markers 中的 config_ref
            var markers = part.element_markers && part.element_markers[variantName];
            if (markers) {
                for (var uuid in markers) {
                    if (markers[uuid].type === 'sub_part' && markers[uuid].config_ref === oldKey) {
                        this.$set(markers, uuid, { type: 'sub_part', config_ref: newKey });
                    }
                }
            }

            // 重算 auto_end_bones（子零件 key 变了）
            var em = require('../core/element_markers.js');
            var cfg = getConfig();
            if (cfg) {
                em.recalcAutoEndBones(cfg, this.activePartId, variantName);
            }

            refreshOutlinerIcons();
            Blockbench.dispatchEvent('update_selection');
            showToast('子零件已重命名为 "' + newKey + '"', 'positive');
            log.info('renameSubPart: 完成');
        },
        /**
         * 迁移子零件标记：start_bone 从旧骨骼名变更为新骨骼名时，
         * 将 element_marker 和 sub_parts 中的 key 一并迁移到新骨骼。
         * @param {string} oldBoneName - 旧的起始骨骼名称
         * @param {string} newBoneName - 新的起始骨骼名称
         */
        migrateSubPartStartBone: function (oldBoneName, newBoneName) {
            var variant = this.currentVariant;
            var part = this.currentPart;
            var variantName = this.activeVariantName;
            if (!variant || !variant.sub_parts || !part) return;

            var spKey = this.selectedMarker ? this.selectedMarker.config_ref : null;
            if (!spKey || !variant.sub_parts[spKey]) return;

            log.info('migrateSubPartStartBone: start_bone 变更', { from: oldBoneName, to: newBoneName, spKey: spKey });

            // 子零件 key 是翻译键（不与 start_bone 绑定），仅迁移 element_marker 到新骨骼
            var markers = part.element_markers && part.element_markers[variantName];
            var oldGroup = Group.all.find(function (g) { return g.name === oldBoneName; });
            var newGroup = Group.all.find(function (g) { return g.name === newBoneName; });

            if (markers && oldGroup && newGroup && oldGroup !== newGroup) {
                var markerData = markers[oldGroup.uuid];
                if (markerData && markerData.type === 'sub_part') {
                    markerData.config_ref = spKey;
                    this.$set(markers, newGroup.uuid, markerData);
                    this.$delete(markers, oldGroup.uuid);
                    log.debug('migrateSubPartStartBone: 标记已迁移', { from: oldGroup.uuid, to: newGroup.uuid });
                }
            }

            refreshOutlinerIcons();
            var em = require('../core/element_markers.js');
            var cfg = getConfig();
            if (cfg) {
                em.recalcAutoEndBones(cfg, this.activePartId, variantName);
            }
            Blockbench.dispatchEvent('update_selection');
            log.info('migrateSubPartStartBone: 完成');
        },
        /**
         * 迁移连接点定位器：locator 从旧名称变更为新名称时，
         * 将 element_marker 和 connectors 中的 key 一并迁移。
         * @param {string} oldLocName - 旧的定位器名称
         * @param {string} newLocName - 新的定位器名称
         */
        migrateConnectorLocator: function (oldLocName, newLocName) {
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

            // 查找当前连接点条目（通过旧 locator 名匹配）
            var connKey = Object.keys(sp.connectors).find(function(k) {
                return sp.connectors[k].locator === oldLocName;
            });
            if (!connKey) {
                log.warn('migrateConnectorLocator: 未找到连接点条目', { locator: oldLocName, spKey: spKey });
                return;
            }

            log.info('migrateConnectorLocator: 变更定位器绑定', { from: oldLocName, to: newLocName, connKey: connKey, spKey: spKey });

            // 更新 locator 字段（key 不变，key 是翻译键名称）
            sp.connectors[connKey].locator = newLocName;

            // 迁移 element_marker — 从旧 Locator 到新 Locator
            var markers = part.element_markers && part.element_markers[variantName];
            var oldLoc = typeof Locator !== 'undefined' ? Locator.all.find(function (l) { return l.name === oldLocName; }) : null;
            var newLoc = typeof Locator !== 'undefined' ? Locator.all.find(function (l) { return l.name === newLocName; }) : null;

            if (markers && oldLoc && newLoc && oldLoc !== newLoc) {
                var markerData = markers[oldLoc.uuid];
                if (markerData && markerData.type === 'connector') {
                    this.$set(markers, newLoc.uuid, markerData);
                    this.$delete(markers, oldLoc.uuid);
                    log.debug('migrateConnectorLocator: 标记已迁移', { from: oldLoc.uuid, to: newLoc.uuid });
                }
            }

            refreshOutlinerIcons();
            Blockbench.dispatchEvent('update_selection');
            log.info('migrateConnectorLocator: 完成');
        },
        /**
         * 添加排除骨骼到 end_bones 列表
         */
        addEndBone: function (boneName) {
            const config = this.selectedSubPartConfig;
            if (!config) {
                log.warn('addEndBone: selectedSubPartConfig 为空');
                return;
            }
            if (!config.end_bones) {
                this.$set(config, 'end_bones', []);
            }
            if (config.end_bones.indexOf(boneName) === -1) {
                config.end_bones.push(boneName);
                log.debug('addEndBone: 已添加', { bone: boneName });
            }
        },
        /**
         * 移除排除骨骼
         */
        removeEndBone: function (index) {
            const config = this.selectedSubPartConfig;
            if (!config || !config.end_bones) {
                log.warn('removeEndBone: selectedSubPartConfig 为空或无 end_bones');
                return;
            }
            config.end_bones.splice(index, 1);
            log.debug('removeEndBone: 已移除', { index: index });
        },
        /**
         * 更新碰撞箱配置中的单个字段
         * 游离碰撞箱（无归属）可编辑但不会持久化
         */
        updateHitBoxField: function (field, value) {
            const config = this.selectedHitBoxConfig;
            if (!config) {
                log.warn('updateHitBoxField: selectedHitBoxConfig 为空');
                return;
            }
            if (config._orphan) {
                log.warn('updateHitBoxField: 游离碰撞箱不可持久化', { field: field, value: value });
                return;
            }
            this.$set(config, field, value);
            log.debug('updateHitBoxField: 已更新', { field: field, value: value });
        },
        /**
         * 更新碰撞箱材质覆写字段
         */
        updateHitBoxOverwrite: function (field, value) {
            const config = this.selectedHitBoxConfig;
            if (!config) {
                log.warn('updateHitBoxOverwrite: selectedHitBoxConfig 为空');
                return;
            }
            if (config._orphan) {
                log.warn('updateHitBoxOverwrite: 游离碰撞箱不可持久化', { field: field, value: value });
                return;
            }
            if (!config.overwrite) {
                this.$set(config, 'overwrite', {});
            }
            this.$set(config.overwrite, field, value);
            log.debug('updateHitBoxOverwrite: 已更新', { field: field, value: value });
        },
        /**
         * 更新交互区配置中的单个字段
         * 游离交互区（无归属）可编辑但不会持久化
         * bone 变更后增量 _markerVersion 强制所有计算属性重新求值
         */
        updateInteractBoxField: function (field, value) {
            const config = this.selectedInteractBoxConfig;
            if (!config) {
                log.warn('updateInteractBoxField: selectedInteractBoxConfig 为空');
                return;
            }
            if (config._orphan) {
                log.warn('updateInteractBoxField: 游离交互区不可持久化', { field: field, value: value });
                return;
            }
            this.$set(config, field, value);
            // bone 变更后强制刷新，触发子零件面板列表和归属重新计算
            if (field === 'bone') {
                this._markerVersion++;
            }
            log.debug('updateInteractBoxField: 已更新', { field: field, value: value });
        },
        /**
         * 更新连接点配置字段，同时同步到标记的 config_ref
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
            this.$set(config, field, value);
            if (field === 'definition') {
                var marker = this.selectedMarker;
                var part = this.currentPart;
                if (marker && part && part.element_markers && this.activeVariantName) {
                    var vMarkers = part.element_markers[this.activeVariantName];
                    if (vMarkers && vMarkers[this.selectedElement.uuid]) {
                        vMarkers[this.selectedElement.uuid].config_ref = value;
                    }
                }
            }
            log.debug('updateConnectorField: 已更新', { field: field, value: value });
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
            if (!variant || !variant.sub_parts || !variant.sub_parts[spKey]) return;
            var self = this;
            var { showAddSubsystemDialog } = require('./add_subsystem_dialog.js');
            showAddSubsystemDialog({
                config: this.config,
                variant: variant,
                spKey: spKey,
                preSelectedType: preSelectedType,
                beforeSet: function (sp, instanceName, ssConfig) {
                    if (!sp.subsystems) {
                        self.$set(sp, 'subsystems', {});
                    }
                    self.$set(sp.subsystems, instanceName, ssConfig);
                },
                onCreated: function (createdSpKey, instanceName) {
                    self.subsystemSelection = { spKey: createdSpKey, subsystemKey: instanceName };
                    self._markerVersion++;
                    log.info('addSubsystem: 已创建子系统', { spKey: createdSpKey, instanceName: instanceName });
                },
            });
        },
        /**
         * 删除子系统：确认后从 sub_parts 中移除
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
                        text: '确认删除子系统 "' + ssKey + '" ？<br><br>此操作不可撤销！',
                    },
                },
                onConfirm: function () {
                    self.$delete(sp.subsystems, ssKey);
                    self.subsystemSelection = { spKey: '', subsystemKey: '' };
                    self._markerVersion++;
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
            var variant = this.currentVariant;
            if (!variant || !variant.sub_parts) return;
            var sp = variant.sub_parts[spKey];
            if (!sp || !sp.subsystems) return;
            if (!sp.subsystems[oldKey]) {
                log.warn('renameSubsystem: 未找到子系统', { oldKey: oldKey });
                return;
            }
            if (sp.subsystems[newKey]) {
                showToast('子系统 "' + newKey + '" 已存在', 'error');
                return;
            }
            log.info('renameSubsystem: 重命名', { from: oldKey, to: newKey });
            this.$set(sp.subsystems, newKey, sp.subsystems[oldKey]);
            this.$delete(sp.subsystems, oldKey);
            this.subsystemSelection.subsystemKey = newKey;
            showToast('子系统已重命名为 "' + newKey + '"', 'positive');
        },
        /**
         * 更新子系统配置中的单个字段
         */
        updateSubsystemField: function (ssKey, field, value) {
            if (!ssKey || !field) return;
            var spKey = this.subsystemSelection.spKey;
            if (!spKey) return;
            var variant = this.currentVariant;
            if (!variant || !variant.sub_parts) return;
            var sp = variant.sub_parts[spKey];
            if (!sp || !sp.subsystems || !sp.subsystems[ssKey]) return;
            this.$set(sp.subsystems[ssKey], field, value);
            log.debug('updateSubsystemField: 已更新', { ssKey: ssKey, field: field, value: value });
        },
        /**
         * 重命名连接点：修改 connectors 字典的 key
         * 需要先找到当前连接点（通过 locator 字段），然后迁移 key
         */
        renameConnector: function (oldKey, newKey) {
            if (!oldKey || !newKey || oldKey === newKey) return;
            var variant = this.currentVariant;
            if (!variant) return;

            var owner = this.connectorOwner;
            var spKey = owner ? owner.spKey : null;
            if (!spKey || !variant.sub_parts[spKey]) return;
            var sp = variant.sub_parts[spKey];
            if (!sp.connectors || !sp.connectors[oldKey]) {
                log.warn('renameConnector: 未找到连接点', { oldKey: oldKey });
                return;
            }

            // 校验唯一性
            var { validateNameUniqueness } = require('../core/naming.js');
            var check = validateNameUniqueness(variant, 'connector', spKey, newKey, oldKey);
            if (!check.valid) {
                showToast(check.message, 'error');
                return;
            }

            log.info('renameConnector: 重命名', { from: oldKey, to: newKey });

            // 迁移字典 key
            this.$set(sp.connectors, newKey, sp.connectors[oldKey]);
            this.$delete(sp.connectors, oldKey);

            refreshOutlinerIcons();
            Blockbench.dispatchEvent('update_selection');
            showToast('连接点已重命名为 "' + newKey + '"', 'positive');
            log.info('renameConnector: 完成');
        },
        /**
         * 重命名交互区：修改 interact_boxes 字典的 key
         */
        renameInteractBox: function (oldKey, newKey) {
            if (!oldKey || !newKey || oldKey === newKey) return;
            var variant = this.currentVariant;
            if (!variant) return;

            var spKey = this.interactBoxParentSubPartKey;
            if (!spKey || !variant.sub_parts) return;
            var sp = variant.sub_parts[spKey];
            if (!sp || !sp.interact_boxes || !sp.interact_boxes[oldKey]) {
                log.warn('renameInteractBox: 未找到交互区', { oldKey: oldKey });
                return;
            }

            // 校验唯一性
            var { validateNameUniqueness } = require('../core/naming.js');
            var check = validateNameUniqueness(variant, 'interact_box', spKey, newKey, oldKey);
            if (!check.valid) {
                showToast(check.message, 'error');
                return;
            }

            log.info('renameInteractBox: 重命名', { from: oldKey, to: newKey });

            // 迁移字典 key
            this.$set(sp.interact_boxes, newKey, sp.interact_boxes[oldKey]);
            this.$delete(sp.interact_boxes, oldKey);

            refreshOutlinerIcons();
            Blockbench.dispatchEvent('update_selection');
            showToast('交互区已重命名为 "' + newKey + '"', 'positive');
            log.info('renameInteractBox: 完成');
        },
        /**
         * 迁移交互区骨骼绑定：bone 从旧骨骼变更为新骨骼时，
         * 同步迁移 element_marker 到新骨骼的 UUID，并选中新骨骼。
         */
        migrateInteractBoxBone: function (field, newBoneName) {
            var config = this.selectedInteractBoxConfig;
            if (!config || config._orphan) {
                log.warn('migrateInteractBoxBone: 交互区不可迁移');
                return;
            }
            var oldBoneName = config.bone || '';
            if (oldBoneName === newBoneName) return;

            var part = this.currentPart;
            var variant = this.currentVariant;
            var variantName = this.activeVariantName;
            if (!part || !variant) return;

            // 更新 bone 字段
            this.$set(config, 'bone', newBoneName);

            // 找到新旧骨骼 Group
            var oldGroup = typeof Group !== 'undefined' ? Group.all.find(function(g) { return g.name === oldBoneName; }) : null;
            var newGroup = typeof Group !== 'undefined' ? Group.all.find(function(g) { return g.name === newBoneName; }) : null;

            if (oldGroup && newGroup && oldGroup !== newGroup) {
                // 更新 _uuid 指向新骨骼
                config._uuid = newGroup.uuid;

                // 迁移 element_marker 到新骨骼的 UUID
                var markers = part.element_markers && part.element_markers[variantName];
                if (markers) {
                    var markerData = markers[oldGroup.uuid];
                    if (markerData && markerData.type === 'interact_box') {
                        this.$set(markers, newGroup.uuid, markerData);
                        this.$delete(markers, oldGroup.uuid);
                        log.debug('migrateInteractBoxBone: 标记已迁移', {
                            from: oldGroup.uuid, to: newGroup.uuid,
                        });
                    }
                }

                // 自动选中新骨骼
                newGroup.select();
                newGroup.showInOutliner();
            }

            this._markerVersion++;
            refreshOutlinerIcons();
            Blockbench.dispatchEvent('update_selection');
            log.info('migrateInteractBoxBone: 骨骼迁移完成', { from: oldBoneName, to: newBoneName });
        },

        /* —————— 贴图键值对编辑器事件处理 —————— */
        handleTexturesKvAdd: function (payload) {
            var v = this.currentVariant;
            if (!v) return;
            if (typeof v.textures !== 'object' || Array.isArray(v.textures)) {
                this.$set(v, 'textures', {});
            }
            this.$set(v.textures, payload.key, payload.value);
        },
        handleTexturesKvRemove: function (payload) {
            var v = this.currentVariant;
            if (!v || !v.textures || typeof v.textures !== 'object') return;
            this.$delete(v.textures, payload.key);
        },
        handleTexturesKvUpdateKey: function (payload) {
            var v = this.currentVariant;
            if (!v || !v.textures || typeof v.textures !== 'object') return;
            var val = v.textures[payload.oldKey];
            this.$delete(v.textures, payload.oldKey);
            if (val !== undefined) {
                this.$set(v.textures, payload.newKey, val);
            }
        },
        handleTexturesKvUpdateValue: function (payload) {
            var v = this.currentVariant;
            if (!v || !v.textures || typeof v.textures !== 'object') return;
            this.$set(v.textures, payload.key, payload.newValue);
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

        log.debug('Vue 组件挂载完成，已注册事件监听');
    },
    beforeDestroy: function () {
        log.debug('Vue 组件 beforeDestroy — 清理事件监听');
        if (this._projectHandler) { this._projectHandler(); log.debug('已移除 select_project 监听'); }
        if (this._selectionHandler) { this._selectionHandler(); log.debug('已移除 update_selection 监听'); }
        if (this._modeHandler) { this._modeHandler(); log.debug('已移除 select_mode 监听'); }
        if (this._saveHandler) { this._saveHandler(); log.debug('已移除 save 监听'); }
    },
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MMMainPanel;
}
