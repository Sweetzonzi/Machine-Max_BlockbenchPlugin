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
const { refreshOutlinerIcons } = require('../mode.js');
const { showToast } = require('../utils/notify.js');
const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('UI');

/**
 * 标签颜色调色板 — 与 getTagColor 共享
 */
var TAG_PALETTE = [
    '#3a6a9a', '#6a4a9a', '#9a4a6a', '#4a9a6a',
    '#9a8a3a', '#3a9a8a', '#8a4a3a', '#4a6a9a',
];

/**
 * 根据标签文本哈希生成一致的彩色背景色
 * @param {string} tag - 完整标签文本 (namespace:path)
 * @returns {string} 十六进制颜色值
 */
function _hashTagColor(tag) {
    var hash = 0;
    for (var i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return TAG_PALETTE[Math.abs(hash) % TAG_PALETTE.length];
}

/**
 * 子零件属性面板子组件
 * 选中标记为 sub_part 的 Group 时在属性面板中显示
 */
Vue.component('mm-sub-part-panel', {
    template: typeof TEMPLATE_SUB_PART_PANEL !== 'undefined' ? TEMPLATE_SUB_PART_PANEL : '<p>子零件面板加载中...</p>',
    props: {
        config: { type: Object, required: true },
        elementName: { type: String, default: '' },
        badgeColor: { type: String, default: '#4A90D9' },
        badgeLabel: { type: String, default: '子零件' },
        hitBoxes: { type: Object, default: function() { return {}; } },
        allBoneNames: { type: Array, default: function() { return []; } },
        allLocatorNames: { type: Array, default: function() { return []; } },
    },
    data: function () {
        return {
            newEndBone: '',
            editingStartBone: this.config.start_bone,
            editingMassCenter: this.config.mass_center,
        };
    },
    watch: {
        'config.start_bone': function (val) {
            if (val !== this.editingStartBone) {
                this.editingStartBone = val;
            }
        },
        'config.mass_center': function (val) {
            if (val !== this.editingMassCenter) {
                this.editingMassCenter = val;
            }
        },
    },
    computed: {
        /**
         * 每个组件实例唯一的 datalist id，避免多实例下 id 冲突
         */
        boneListId: function () {
            return 'mm-bone-list-' + this._uid;
        },
        locatorListId: function () {
            return 'mm-locator-list-' + this._uid;
        },
        autoEndBones: function () {
            return this.config.auto_end_bones || [];
        },
        hitBoxCount: function () {
            return this.hitBoxes ? Object.keys(this.hitBoxes).length : 0;
        },
        connectorCount: function () {
            return this.config.connectors ? Object.keys(this.config.connectors).length : 0;
        },
        subsystemCount: function () {
            return this.config.subsystems ? Object.keys(this.config.subsystems).length : 0;
        },
    },
    methods: {
        onFieldChange: function (field, value) {
            this.$emit('field-change', field, value);
        },
        onStartBoneInput: function (value) {
            this.$emit('field-change', 'start_bone', value);
        },
        onProjectedAreaChange: function (axis, value) {
            this.$emit('projected-area-change', axis, value);
        },
        onAddEndBone: function () {
            if (this.newEndBone && this.newEndBone.trim()) {
                this.$emit('add-end-bone', this.newEndBone.trim());
                this.newEndBone = '';
            }
        },
        resolveHitBoxName: function (hbKey) {
            var el = Group.all.find(function (g) { return g.name === hbKey || g.uuid === hbKey; });
            return el ? el.name : hbKey;
        },
    },
});

/**
 * 碰撞箱属性面板子组件
 * 选中标记为 hit_box 的 Group 时在属性面板中显示
 */
Vue.component('mm-hit-box-panel', {
    template: typeof TEMPLATE_HIT_BOX_PANEL !== 'undefined' ? TEMPLATE_HIT_BOX_PANEL : '<p>碰撞箱面板加载中...</p>',
    props: {
        config: { type: Object, required: true },
        elementName: { type: String, default: '' },
        parentSubPartKey: { type: String, default: '' },
        materialDefs: { type: Object, default: function() { return {}; } },
    },
    data: function () {
        return {
            overwriteExpanded: false,
        };
    },
    computed: {
        badgeColor: function () { return '#D94A4A'; },
        badgeLabel: function () { return '碰撞箱'; },
        cubeCount: function () {
            if (!this._parentGroup || !this._parentGroup.children) return 0;
            return this._parentGroup.children.filter(function(c) { return c instanceof Cube; }).length;
        },
        cubeDimensions: function () {
            var group = this._parentGroup;
            if (!group || !group.children) return null;
            var cubes = group.children.filter(function(c) { return c instanceof Cube; });
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
            return size[0].toFixed(2) + ' × ' + size[1].toFixed(2) + ' × ' + size[2].toFixed(2);
        },
        cubePosition: function () {
            var group = this._parentGroup;
            if (!group) return null;
            var pos = group.origin || [0, 0, 0];
            return '(' + pos[0].toFixed(2) + ', ' + pos[1].toFixed(2) + ', ' + pos[2].toFixed(2) + ')';
        },
        _parentGroup: function () {
            var el = this.$parent && this.$parent.selectedElement;
            if (!el) return null;
            if (el instanceof Group) return el;
            return el.parent instanceof Group ? el.parent : null;
        },
    },
    methods: {
        onFieldChange: function (field, value) {
            this.$emit('field-change', field, value);
        },
        onOverwriteChange: function (field, value) {
            this.$emit('overwrite-change', field, value);
        },
        overwriteVal: function (field) {
            return this.config.overwrite ? this.config.overwrite[field] : undefined;
        },
    },
});

const MMMainPanel = Vue.component('mm-main-panel', {
    template: TEMPLATE_PART_PANEL,
    data: function () {
        return {
            config: null,
            activePartId: '',
            activeVariantName: '',
            selectedElement: null,
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
        selectedMarker: function () {
            if (!this.selectedElement) return null;
            const part = this.currentPart;
            if (!part || !part.element_markers) return null;
            const vMarkers = part.element_markers[this.activeVariantName];
            if (!vMarkers) return null;
            return vMarkers[this.selectedElement.uuid] || null;
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
            // 确保 sub_parts 容器存在（向后兼容旧配置）
            if (!variant.sub_parts) {
                this.$set(variant, 'sub_parts', {});
            }
            // 用骨骼名称（含 fallback）作为 sub_parts 中的 key
            const spKey = this.selectedMarker.config_ref || this.selectedElementName;
            if (!spKey) return null;
            // 自动创建缺失的配置（向后兼容已存在的旧标记）
            if (!variant.sub_parts[spKey]) {
                const spConfig = createSubPartConfig();
                spConfig.start_bone = spKey;
                this.$set(variant.sub_parts, spKey, spConfig);
                // 回填标记的 config_ref 以便后续快速索引
                if (!this.selectedMarker.config_ref) {
                    this.$set(this.selectedMarker, 'config_ref', spKey);
                }
            }
            // 向后兼容：确保 auto_end_bones 字段存在
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
         * 当前选中是否为连接点标记
         */
        isConnectorSelected: function () {
            return this.selectedMarker && this.selectedMarker.type === 'connector';
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
         * 当前选中碰撞箱的配置对象（从所属子零件的 hit_boxes 中获取）
         */
        selectedHitBoxConfig: function () {
            if (!this.isHitBoxSelected) return null;
            var variant = this.currentVariant;
            if (!variant || !variant.sub_parts) return null;
            var owner = this.hitBoxOwner;
            var spKey = owner ? owner.spKey : null;
            if (!spKey || !variant.sub_parts[spKey]) return null;
            var sp = variant.sub_parts[spKey];
            if (!sp.hit_boxes) this.$set(sp, 'hit_boxes', {});
            var hbKey = this.selectedElementName;
            if (!sp.hit_boxes[hbKey]) {
                this.$set(sp.hit_boxes, hbKey, {
                    id: 'part', type: 'box',
                    material: 'machine_max:default',
                    thickness: 1.0, condition: 'true',
                });
            }
            return sp.hit_boxes[hbKey] || null;
        },
        /**
         * 碰撞箱所属子零件的 key
         */
        hitBoxParentSubPartKey: function () {
            var owner = this.hitBoxOwner;
            return owner ? owner.spKey : '';
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
        /**
         * 打开添加标签对话框，包含默认标签分类选择和自定义标签输入
         * 默认标签使用 machine_max 命名空间，以彩色按钮形式展示已选状态
         */
        showAddTagDialog: function () {
            var variant = this.currentVariant;
            if (!variant) return;

            var existingTags = (variant.tags || []).slice();
            var self = this;

            /**
             * 默认标签分类定义，所有标签使用 machine_max 命名空间
             */
            var DEFAULT_TAG_GROUPS = {
                direction: {
                    label: '方向',
                    tags: ['left', 'right', 'front', 'back', 'top', 'bottom'],
                },
                function: {
                    label: '功能',
                    tags: ['structural', 'decoration', 'mobility', 'weapon', 'misc'],
                },
                type: {
                    label: '类型',
                    tags: ['land', 'marine', 'aerial', 'mecha'],
                },
            };

            /** 默认标签的中文显示名映射 */
            var TAG_LABELS = {
                left: '左 (left)', right: '右 (right)', front: '前 (front)',
                back: '后 (back)', top: '上 (top)', bottom: '下 (bottom)',
                structural: '结构 (structural)', decoration: '装饰 (decoration)',
                mobility: '移动 (mobility)', weapon: '武器 (weapon)', misc: '杂项 (misc)',
                land: '地面 (land)', marine: '水中 (marine)',
                aerial: '空中 (aerial)', mecha: '机甲 (mecha)',
            };

            /**
             * 将完整标签（含 namespace）转为默认标签分类中的 path，若不在分类中返回 null
             */
            function tagToDefaultPath(fullTag) {
                var parts = fullTag.split(':');
                if (parts.length !== 2) return null;
                for (var gk in DEFAULT_TAG_GROUPS) {
                    var group = DEFAULT_TAG_GROUPS[gk];
                    if (group.tags.indexOf(parts[1]) !== -1) {
                        return parts[1];
                    }
                }
                return null;
            }

            // 构建表单字段
            var formFields = {};

            // 每个分类：一个 info 头 + 一组 checkbox
            for (var gk in DEFAULT_TAG_GROUPS) {
                var group = DEFAULT_TAG_GROUPS[gk];
                formFields[gk + '_hdr'] = {
                    type: 'info',
                    text: '<b>' + group.label + '</b>',
                };
                for (var ti = 0; ti < group.tags.length; ti++) {
                    var tagPath = group.tags[ti];
                    var fieldKey = '_t_' + tagPath;
                    formFields[fieldKey] = {
                        type: 'checkbox',
                        label: TAG_LABELS[tagPath] || tagPath,
                        value: false,
                    };
                }
            }

            // 预填已选默认标签
            for (var ei = 0; ei < existingTags.length; ei++) {
                var p = tagToDefaultPath(existingTags[ei]);
                if (p) {
                    var fk = '_t_' + p;
                    if (formFields[fk]) {
                        formFields[fk].value = true;
                    }
                }
            }

            // 自定义标签输入
            formFields.customSection = {
                type: 'info',
                text: '<b>自定义标签</b>（超出默认范围的可在此添加）',
            };
            formFields.customNs = {
                type: 'text',
                label: '自定义命名空间',
                value: 'machine_max',
            };
            formFields.customPath = {
                type: 'text',
                label: '自定义标签路径',
                value: '',
                description: '如 my_custom_tag。仅限小写字母、数字、_ - . /',
            };

            // 当前自定义标签展示（只读展示，确认时自动保留）
            var customTags = existingTags.filter(function (t) { return !tagToDefaultPath(t); });
            formFields.currentCustom = {
                type: 'info',
                text: customTags.length > 0
                    ? '已有自定义标签：' + customTags.map(function (t) {
                        var color = _hashTagColor(t);
                        return '<span style="display:inline-block;background:' + color + ';color:#fff;padding:0 6px;margin:1px;border-radius:3px;font-size:11px">' + t + '</span>';
                    }).join('')
                    : '（暂无自定义标签）',
            };

            new Dialog({
                title: '添加变体标签 — "' + this.activeVariantName + '"',
                width: 520,
                form: formFields,
                onConfirm: function (formData) {
                    var newTagList = [];

                    // 1. 收集各分类中选中的默认标签（_t_ 开头的复选框字段）
                    for (var fieldName in formData) {
                        if (fieldName.indexOf('_t_') === 0 && formData[fieldName]) {
                            var tagPath = fieldName.substring(3);
                            newTagList.push('machine_max:' + tagPath);
                        }
                    }

                    // 2. 保留已有的自定义标签（不在默认分类中的标签）
                    for (var ci = 0; ci < customTags.length; ci++) {
                        if (newTagList.indexOf(customTags[ci]) === -1) {
                            newTagList.push(customTags[ci]);
                        }
                    }

                    // 3. 添加本次输入的新自定义标签
                    var customNs = (formData.customNs || '').trim().toLowerCase();
                    var customPath = (formData.customPath || '').trim().toLowerCase();
                    if (customNs && customPath) {
                        var nsRegex = /^[a-z0-9_\-./]+$/;
                        var pathRegex = /^[a-z0-9_\-./]+$/;
                        if (!nsRegex.test(customNs)) {
                            showToast('自定义命名空间格式无效', 'error');
                            return false;
                        }
                        if (!pathRegex.test(customPath)) {
                            showToast('自定义标签路径格式无效', 'error');
                            return false;
                        }
                        var fullCustom = customNs + ':' + customPath;
                        // 检查是否与默认标签重复
                        var dupDefault = tagToDefaultPath(fullCustom);
                        if (dupDefault) {
                            showToast('"' + fullCustom + '" 与默认标签 machine_max:' + dupDefault + ' 重复，请直接在分类中选择', 'error');
                            return false;
                        }
                        // 检查自定义标签自身重复
                        if (newTagList.indexOf(fullCustom) !== -1) {
                            showToast('标签 "' + fullCustom + '" 已存在', 'error');
                            return false;
                        }
                        newTagList.push(fullCustom);
                    }

                    // 去重
                    newTagList = newTagList.filter(function (t, idx) { return newTagList.indexOf(t) === idx; });

                    if (newTagList.length === 0) {
                        showToast('请至少选择一个标签', 'error');
                        return false;
                    }

                    // 更新到 variant.tags
                    self.$set(variant, 'tags', newTagList);
                    log.info('标签添加: 已更新', { tags: newTagList });
                    this.hide();
                },
            }).show();
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
                        require('../mode.js').refreshOutlinerIcons();
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
            if (!sel || sel.length === 0) {
                this.selectedElement = null;
                log.debug('onSelectionChange: 取消选中');
                return;
            }
            // Group 不在 Outliner.selected 中（Group 继承自 OutlinerNode 而非 OutlinerElement）
            // 优先用 Group.first_selected；其次取 Outliner.selected[0]（Cube/Locator 等）
            var best = (typeof Group !== 'undefined' && Group.first_selected) || sel[0];
            this.selectedElement = best;
            log.debug('onSelectionChange: 选中元素', {
                name: best.name,
                uuid: best.uuid,
                type: best.constructor ? best.constructor.name : typeof best,
                groupSelected: !!(typeof Group !== 'undefined' && Group.first_selected),
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
         * 更新子零件配置中的单个字段。
         * start_bone 变动时需连带迁移子零件标记和 sub_parts key。
         */
        updateSubPartField: function (field, value) {
            const config = this.selectedSubPartConfig;
            if (!config) {
                log.warn('updateSubPartField: selectedSubPartConfig 为空');
                return;
            }
            // 起始骨骼变化 → 标记也需迁移到新骨骼上
            if (field === 'start_bone' && config.start_bone !== value) {
                this.migrateSubPartStartBone(config.start_bone, value);
            }
            this.$set(config, field, value);
            log.debug('updateSubPartField: 已更新', { field: field, value: value });
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

            var spConfig = variant.sub_parts[oldBoneName];
            if (!spConfig) return;

            log.info('migrateSubPartStartBone: 迁移标记', { from: oldBoneName, to: newBoneName });

            // 1) 移动 sub_parts 条目
            this.$set(variant.sub_parts, newBoneName, spConfig);
            if (oldBoneName !== newBoneName) {
                this.$delete(variant.sub_parts, oldBoneName);
            }

            // 2) 更新 element_marker — 从旧 Group 迁移到新 Group
            var markers = part.element_markers && part.element_markers[variantName];
            var oldGroup = Group.all.find(function (g) { return g.name === oldBoneName; });
            var newGroup = Group.all.find(function (g) { return g.name === newBoneName; });

            if (markers && oldGroup && newGroup && oldGroup !== newGroup) {
                var markerData = markers[oldGroup.uuid];
                if (markerData && markerData.type === 'sub_part') {
                    markerData.config_ref = newBoneName;
                    this.$set(markers, newGroup.uuid, markerData);
                    this.$delete(markers, oldGroup.uuid);
                    log.debug('migrateSubPartStartBone: 标记已从 ' + oldGroup.uuid + ' 迁移到 ' + newGroup.uuid);
                }
            }

            // 3) 同步刷新大纲图标和 auto_end_bones
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
         * 更新子零件投影面积的单个轴向分量
         */
        updateProjectedArea: function (axis, value) {
            const config = this.selectedSubPartConfig;
            if (!config) {
                log.warn('updateProjectedArea: selectedSubPartConfig 为空');
                return;
            }
            if (!config.projected_area) {
                this.$set(config, 'projected_area', [0, 0, 0]);
            }
            this.$set(config.projected_area, axis, value);
            log.debug('updateProjectedArea: 已更新', { axis: axis, value: value });
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
         */
        updateHitBoxField: function (field, value) {
            const config = this.selectedHitBoxConfig;
            if (!config) {
                log.warn('updateHitBoxField: selectedHitBoxConfig 为空');
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
            if (!config.overwrite) {
                this.$set(config, 'overwrite', {});
            }
            this.$set(config.overwrite, field, value);
            log.debug('updateHitBoxOverwrite: 已更新', { field: field, value: value });
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
