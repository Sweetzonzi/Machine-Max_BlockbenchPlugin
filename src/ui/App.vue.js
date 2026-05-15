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
const { getMarkerInfo } = require('../core/element_markers.js');
const { createVariantConfig, createPartConfig } = require('../core/config.js');
const { refreshOutlinerIcons } = require('../mode.js');
const { showToast } = require('../utils/notify.js');
const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('UI');

const MMMainPanel = Vue.component('mm-main-panel', {
    template: `
        <div class="mm-panel" v-if="config">
            <!--- 模式内导航栏 --->
            <div class="mm-panel-header">
                <div class="mm-nav-row">
                    <label class="mm-label">零件</label>
                    <select v-model="activePartId" @change="onPartChange" class="mm-select">
                        <option v-for="(part, id) in config.parts" :key="id" :value="id">{{ id }}</option>
                    </select>
                    <button class="mm-btn mm-btn-sm" @click="showNewPartDialog" title="新建零件">+</button>
                </div>
                <div class="mm-nav-row" v-if="currentPart">
                    <label class="mm-label">变体</label>
                    <select v-model="activeVariantName" @change="onVariantChange" class="mm-select">
                        <option v-for="(variant, name) in currentPart.variants" :key="name" :value="name">{{ name }}</option>
                    </select>
                    <button class="mm-btn mm-btn-sm" @click="showNewVariantDialog" title="新建变体">+</button>
                </div>
            </div>

            <!--- 空闲页：零件全局属性 --->
            <div v-if="!selectedElement" class="mm-panel-body">
                <div class="mm-section" v-if="currentPart">
                    <h3 class="mm-section-title">零件全局属性: {{ activePartId }}</h3>
                    <div class="mm-field">
                        <label>图标</label>
                        <input type="text" v-model="currentPart.icon" class="mm-input" placeholder="machine_max:textures/icon/..." />
                    </div>
                    <div class="mm-field">
                        <label>耐久贡献</label>
                        <input type="number" v-model.number="currentPart.vehicle_durability_rate" class="mm-input" step="0.1" min="0" max="1" />
                    </div>
                    <div class="mm-field">
                        <label>伤害传导</label>
                        <input type="number" v-model.number="currentPart.vehicle_damage_rate" class="mm-input" step="0.1" min="0" />
                    </div>
                    <div class="mm-field">
                        <label>摧毁伤害</label>
                        <input type="number" v-model.number="currentPart.vehicle_damage_rate_destroyed" class="mm-input" step="0.1" min="0" />
                    </div>
                    <div class="mm-field">
                        <label>功能阈值</label>
                        <input type="number" v-model.number="currentPart.functional_threshold" class="mm-input" step="0.1" min="0" max="1" />
                    </div>
                    <div class="mm-field mm-field-row">
                        <label>共享耐久</label>
                        <input type="checkbox" v-model="currentPart.share_durability" />
                    </div>
                    <div class="mm-field">
                        <label>最大堆叠</label>
                        <input type="number" v-model.number="currentPart.max_stack_size" class="mm-input" min="1" max="64" />
                    </div>
                </div>

                <div class="mm-section" v-if="currentVariant">
                    <h3 class="mm-section-title">变体: {{ activeVariantName }}</h3>
                    <div class="mm-field">
                        <label>模型</label>
                        <input type="text" v-model="currentVariant.model" class="mm-input" placeholder="machine_max:..." />
                    </div>
                    <div class="mm-field">
                        <label>动画</label>
                        <input type="text" v-model="currentVariant.animations" class="mm-input" placeholder="machine_max:..." />
                    </div>
                    <div class="mm-field">
                        <label>贴图</label>
                        <input type="text" v-model="currentVariant.textures" class="mm-input" placeholder="default: ..." />
                    </div>
                    <div class="mm-field">
                        <label>标签</label>
                        <div class="mm-tags">
                            <span v-for="(tag, i) in currentVariant.tags" :key="i" class="mm-tag">
                                {{ tag }}
                                <span class="mm-tag-remove" @click="removeTag(i)">×</span>
                            </span>
                            <input type="text" v-model="newTag" @keydown.enter="addTag" class="mm-input-tag" placeholder="添加标签..." />
                        </div>
                    </div>
                </div>

                <div class="mm-section" v-if="currentVariant">
                    <h3 class="mm-section-title">变体列表 ({{ variantCount }})</h3>
                    <ul class="mm-variant-list">
                        <li v-for="(v, name) in currentPart.variants" :key="name"
                            :class="{ active: name === activeVariantName }"
                            @click="switchVariant(name)">
                            {{ name }}
                            <span class="mm-variant-remove" @click="removeVariant(name)" v-if="variantCount > 1">×</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!--- 选中了一个元素：显示元素详情 --->
            <div v-else class="mm-panel-body">
                <div class="mm-section">
                    <h3 class="mm-section-title">
                        {{ selectedElement.name || '未命名' }}
                        <span class="mm-marker-badge" v-if="selectedMarker"
                              :style="{ background: getMarkerColor(selectedMarker.type) }">
                            {{ getMarkerLabel(selectedMarker.type) }}
                        </span>
                    </h3>
                    <p class="mm-element-info">类型: {{ getElementType(selectedElement) }}</p>
                    <p class="mm-element-info">UUID: {{ selectedElement.uuid }}</p>
                </div>
                <p class="mm-panel-hint" v-if="!selectedMarker">该元素尚未标记。请在 Outliner 中右键进行标记。</p>
            </div>
        </div>
        <div v-else class="mm-panel mm-panel-empty">
            <p>初始化 MachineMax 配置中...</p>
            <p class="mm-element-info">请确保已打开或创建一个 .bbmodel 模型文件</p>
        </div>
    `,
    data: function () {
        return {
            config: null,
            activePartId: '',
            activeVariantName: '',
            selectedElement: null,
            newTag: '',
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
        selectedMarker: function () {
            if (!this.selectedElement) return null;
            const part = this.currentPart;
            if (!part || !part.element_markers) return null;
            const vMarkers = part.element_markers[this.activeVariantName];
            if (!vMarkers) return null;
            return vMarkers[this.selectedElement.uuid] || null;
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
        switchVariant: function (name) {
            log.debug('switchVariant: 点击切换变体', { name: name });
            this.activeVariantName = name;
            this.onVariantChange();
        },
        addTag: function () {
            if (!this.newTag.trim() || !this.currentVariant) {
                log.debug('addTag: 标签为空或无当前变体，跳过');
                return;
            }
            if (!this.currentVariant.tags) this.currentVariant.tags = [];
            this.currentVariant.tags.push(this.newTag.trim());
            log.debug('addTag: 已添加标签', { tag: this.newTag.trim() });
            this.newTag = '';
        },
        removeTag: function (index) {
            if (this.currentVariant && this.currentVariant.tags) {
                var removed = this.currentVariant.tags[index];
                this.currentVariant.tags.splice(index, 1);
                log.debug('removeTag: 已删除标签', { index: index, tag: removed });
            }
        },
        removeVariant: function (name) {
            log.debug('removeVariant: 删除变体', { name: name });
            const config = getConfig();
            if (!config || !this.currentPart) {
                log.warn('removeVariant: config 或 currentPart 为空');
                return;
            }
            delete this.currentPart.variants[name];
            const remaining = Object.keys(this.currentPart.variants);
            this.activeVariantName = remaining.length > 0 ? remaining[0] : '';
            log.debug('removeVariant: 剩余变体', { remaining: remaining });
            this.onVariantChange();
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
                        config.parts[partId] = cfg.createPartConfig(partId, variantName);
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

                    part.variants[variantName] = createVariantConfig();
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
