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
            <p>加载 MachineMax 配置中...</p>
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
            const info = require('../core/element_markers.js').getMarkerInfo(type);
            return info ? info.label : type;
        },
        getMarkerColor: function (type) {
            const info = require('../core/element_markers.js').getMarkerInfo(type);
            return info ? info.color : '#888';
        },
        onPartChange: function () {
            const config = require('../utils/persistence.js').getConfig();
            if (!config || !this.activePartId) return;
            config._uiState.activePartId = this.activePartId;

            const part = config.parts[this.activePartId];
            if (part) {
                const variants = Object.keys(part.variants);
                this.activeVariantName = variants.length > 0 ? variants[0] : 'default';
                config._uiState.activeVariantName = this.activeVariantName;
            }

            const { refreshOutlinerIcons } = require('../mode.js');
            refreshOutlinerIcons();
            this.selectedElement = null;
            Blockbench.dispatchEvent('update_selection');
        },
        onVariantChange: function () {
            const config = require('../utils/persistence.js').getConfig();
            if (!config || !this.activeVariantName) return;
            config._uiState.activeVariantName = this.activeVariantName;

            const { refreshOutlinerIcons } = require('../mode.js');
            refreshOutlinerIcons();
            this.selectedElement = null;
            Blockbench.dispatchEvent('update_selection');
        },
        switchVariant: function (name) {
            this.activeVariantName = name;
            this.onVariantChange();
        },
        addTag: function () {
            if (!this.newTag.trim() || !this.currentVariant) return;
            if (!this.currentVariant.tags) this.currentVariant.tags = [];
            this.currentVariant.tags.push(this.newTag.trim());
            this.newTag = '';
        },
        removeTag: function (index) {
            if (this.currentVariant && this.currentVariant.tags) {
                this.currentVariant.tags.splice(index, 1);
            }
        },
        removeVariant: function (name) {
            const config = require('../utils/persistence.js').getConfig();
            if (!config || !this.currentPart) return;
            delete this.currentPart.variants[name];
            const remaining = Object.keys(this.currentPart.variants);
            this.activeVariantName = remaining.length > 0 ? remaining[0] : '';
            this.onVariantChange();
        },
        showNewPartDialog: function () {
            const action = Action.actions.mm_new_part;
            if (action) action.click();
        },
        showNewVariantDialog: function () {
            const self = this;
            new Dialog({
                title: '新建变体',
                form: {
                    variantName: { type: 'text', label: '变体名' },
                    model: { type: 'text', label: '模型引用', value: 'machine_max:' },
                },
                onConfirm: function (formData) {
                    const { variantName, model } = formData;
                    if (!variantName) {
                        Blockbench.showToast('变体名不能为空', 'error');
                        return false;
                    }
                    const part = self.currentPart;
                    if (!part) return false;
                    if (part.variants[variantName]) {
                        Blockbench.showToast(`变体 "${variantName}" 已存在`, 'error');
                        return false;
                    }

                    const { createVariantConfig } = require('../core/config.js');
                    part.variants[variantName] = createVariantConfig();
                    if (model) part.variants[variantName].model = model;
                    self.activeVariantName = variantName;
                    self.onVariantChange();
                    this.hide();
                }
            });
        },
        onSelectionChange: function () {
            const sel = Outliner?.selected;
            if (sel && sel.length > 0) {
                this.selectedElement = sel[0];
            } else {
                this.selectedElement = null;
            }
        },
        loadConfigData: function () {
            const { getConfig } = require('../utils/persistence.js');
            const config = getConfig();
            this.config = config;
            if (config) {
                this.activePartId = config._uiState?.activePartId || '';
                this.activeVariantName = config._uiState?.activeVariantName || '';
            }
        },
    },
    mounted: function () {
        this.loadConfigData();
        this.onSelectionChange();

        this._selectionHandler = Blockbench.on('update_selection', () => {
            this.onSelectionChange();
        });

        this._modeHandler = Blockbench.on('select_mode', (modeId) => {
            if (modeId === 'machine_max_part') {
                this.loadConfigData();
                this.onSelectionChange();
            }
        });

        this._saveHandler = Blockbench.on('save', () => {
            const { saveConfig } = require('../utils/persistence.js');
            saveConfig();
        });
    },
    beforeDestroy: function () {
        if (this._selectionHandler) this._selectionHandler();
        if (this._modeHandler) this._modeHandler();
        if (this._saveHandler) this._saveHandler();
    },
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MMMainPanel;
}
