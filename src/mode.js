const { getMarkersForVariant, setMarker, clearMarker, getMarker, MARKER_TYPES } = require('./core/element_markers.js');
const { loadConfig, saveConfig, getConfig } = require('./utils/persistence.js');

let originalShowContextMenu = null;

let _mmVueComponent = null;
let _mmCssInserted = false;

/**
 * Outliner 节点图标映射表
 */
const OUTLINER_ICON_MAP = {
    sub_part: 'fa-cube',
    hit_box: 'fa-shield',
    connector: 'fa-plug',
    seat: 'fa-chair',
    lighting: 'fa-lightbulb',
    subsystem_locator: 'fa-cog',
};

/**
 * 根据标记类型获取 Outliner 图标类名
 */
function getIconClassForType(type) {
    return OUTLINER_ICON_MAP[type] || '';
}

/**
 * 刷新 Outliner 节点图标
 * 遍历当前零件当前变体的 element_markers，修改对应节点的 icon 属性
 */
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
            el.icon = '';
        }
    }
}

/**
 * 恢复所有 Outliner 节点图标为默认
 */
function resetOutlinerIcons() {
    if (!Project || !Project.loaded) return;
    const allElements = [...Group.all, ...Locator.all];
    for (const el of allElements) {
        el.icon = '';
    }
}

/**
 * 获取当前选中的 Outliner 元素
 */
function getSelectedElement() {
    if (Outliner && Outliner.selected && Outliner.selected.length > 0) {
        return Outliner.selected[0];
    }
    return null;
}

/**
 * 创建 MachineMax 的右键菜单项（由 patched showContextMenu 调用）
 */
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
        if (!marker || marker.type !== 'sub_part') {
            menu.addItem(new MenuItem('📦 标记为子零件', {
                onClick: () => {
                    setMarker(config, activePartId, activeVariantName, el.uuid, 'sub_part', null);
                    refreshOutlinerIcons();
                    Blockbench.dispatchEvent('update_selection');
                }
            }));
        }
        if (!marker || marker.type !== 'hit_box') {
            menu.addItem(new MenuItem('🔵 标记为碰撞箱', {
                onClick: () => {
                    setMarker(config, activePartId, activeVariantName, el.uuid, 'hit_box', null);
                    refreshOutlinerIcons();
                    Blockbench.dispatchEvent('update_selection');
                }
            }));
        }
    } else if (el instanceof Locator) {
        const locatorTypes = ['connector', 'seat', 'lighting', 'subsystem_locator'];
        const labels = {
            connector: '📌 标记为连接点',
            seat: '🟡 标记为座位定位点',
            lighting: '🟠 标记为灯光定位点',
            subsystem_locator: '⚙ 标记为子系统定位点',
        };
        for (const type of locatorTypes) {
            if (!marker || marker.type !== type) {
                menu.addItem(new MenuItem(labels[type], {
                    onClick: () => {
                        setMarker(config, activePartId, activeVariantName, el.uuid, type, null);
                        refreshOutlinerIcons();
                        Blockbench.dispatchEvent('update_selection');
                    }
                }));
            }
        }
    }

    if (marker) {
        const info = MARKER_TYPES[marker.type];
        if (info) {
            menu.addItem(new MenuItem(`🔍 在属性面板中查看 (${info.label})`, {
                onClick: () => {
                    Blockbench.dispatchEvent('update_selection');
                }
            }));
        }
        menu.addItem(new MenuItem('🗑️ 清除 MachineMax 标记', {
            onClick: () => {
                clearMarker(config, activePartId, activeVariantName, el.uuid);
                refreshOutlinerIcons();
                Blockbench.dispatchEvent('update_selection');
            }
        }));
    }

    if (menu.items.length > 0) {
        menu.show(event);
    }
}

/**
 * 拦截并扩展右键菜单（方案C）
 * 在原始菜单弹出后追加 MachineMax 专属项
 */
function patchShowContextMenu() {
    if (originalShowContextMenu) return;

    originalShowContextMenu = OutlinerNode.prototype.showContextMenu;
    const self = this;

    OutlinerNode.prototype.showContextMenu = function (event) {
        originalShowContextMenu.call(this, event);

        const config = getConfig();
        if (!config) return;

        const currentMode = BarItems?.Mode?.getSelectedId?.();
        if (currentMode !== 'machine_max_part') return;

        addMMMenuItems(event);
    };
}

/**
 * 恢复原始右键菜单
 */
function restoreShowContextMenu() {
    if (originalShowContextMenu) {
        OutlinerNode.prototype.showContextMenu = originalShowContextMenu;
        originalShowContextMenu = null;
    }
}

/**
 * 为模式添加专属工具栏按钮
 */
function registerToolbarActions() {
    new Action('mm_validate', {
        text: '校验配置',
        icon: 'fa-check-circle',
        condition: { modes: ['machine_max_part'] },
        click: function () {
            const config = getConfig();
            if (!config) {
                Blockbench.showToast('没有可校验的配置', 'warning');
                return;
            }

            const errors = runValidation(config);
            if (errors.length === 0) {
                Blockbench.showToast('校验通过 ✅', 'positive');
            } else {
                const summary = errors.map(e => `• ${e}`).join('\n');
                Blockbench.showToast(`校验发现 ${errors.length} 个问题`, 'warning');
                new Dialog({
                    title: '校验结果',
                    lines: [`发现 ${errors.length} 个问题：`, ...errors],
                    form: { close: 'close' },
                    onConfirm: function () { this.hide(); },
                });
            }
        }
    });

    new Action('mm_export', {
        text: '导出内容包',
        icon: 'fa-save',
        condition: { modes: ['machine_max_part'] },
        click: function () {
            Blockbench.showToast('导出功能将在阶段四实现', 'info');
        }
    });

    new Action('mm_new_part', {
        text: '新建零件',
        icon: 'fa-plus',
        condition: { modes: ['machine_max_part'] },
        click: function () {
            const config = getConfig();
            if (!config) return;

            new Dialog({
                title: '新建零件',
                form: {
                    partId: { type: 'text', label: '零件 ID', hint: '如 wine_fox_hull' },
                    variantName: { type: 'text', label: '初始变体名', value: 'default' },
                    model: { type: 'text', label: '模型引用', value: 'machine_max:' },
                },
                onConfirm: function (formData) {
                    const { partId, variantName, model } = formData;
                    if (!partId) {
                        Blockbench.showToast('零件 ID 不能为空', 'error');
                        return false;
                    }
                    if (config.parts[partId]) {
                        Blockbench.showToast(`零件 "${partId}" 已存在`, 'error');
                        return false;
                    }

                    const { createPartConfig } = require('./core/config.js');
                    config.parts[partId] = createPartConfig(partId, variantName);
                    if (model) {
                        config.parts[partId].variants[variantName].model = model;
                    }
                    config._uiState.activePartId = partId;
                    config._uiState.activeVariantName = variantName;
                    refreshOutlinerIcons();
                    Blockbench.dispatchEvent('update_selection');
                    Blockbench.showToast(`零件 "${partId}" 已创建`, 'positive');
                    this.hide();
                }
            });
        }
    });

    new Action('mm_project_settings', {
        text: '项目管理',
        icon: 'fa-cog',
        condition: { modes: ['machine_max_part'] },
        click: function () {
            const config = getConfig();
            if (!config) return;

            const partCount = Object.keys(config.parts).length;
            const connCount = Object.keys(config.connector_defs).length;
            const subCount = Object.keys(config.subsystem_defs).length;
            const matCount = Object.keys(config.material_defs).length;

            const partList = Object.entries(config.parts).map(([id, part]) => {
                const vCount = Object.keys(part.variants || {}).length;
                const markerCount = part.element_markers ? Object.values(part.element_markers).reduce((sum, m) => sum + Object.keys(m).length, 0) : 0;
                return `  ${id}  |  变体: ${vCount}  |  标记: ${markerCount}`;
            }).join('\n');

            new Dialog({
                title: '⚙ MachineMax 项目管理',
                form: {
                    namespace: { type: 'text', label: '命名空间', value: config.namespace },
                    info: { type: 'display', label: '统计', lines: [
                        `模型: ${Project.name || '未命名'}`,
                        `零件数: ${partCount}`,
                        `连接点定义: ${connCount}`,
                        `子系统型号: ${subCount}`,
                        `材料定义: ${matCount}`,
                        partCount > 0 ? `\n零件列表:\n${partList}` : '（暂无零件）',
                    ]},
                },
                onConfirm: function (formData) {
                    config.namespace = formData.namespace;
                    saveConfig();
                    this.hide();
                }
            });
        }
    });
}

/**
 * 运行基础校验
 */
function runValidation(config) {
    const errors = [];
    const parts = config.parts || {};

    if (Object.keys(parts).length === 0) {
        errors.push('未定义任何零件');
        return errors;
    }

    for (const [partId, part] of Object.entries(parts)) {
        const variants = part.variants || {};
        if (Object.keys(variants).length === 0) {
            errors.push(`零件 "${partId}"：没有定义变体`);
            continue;
        }

        for (const [vName, variant] of Object.entries(variants)) {
            if (!variant.model) {
                errors.push(`零件 "${partId}" 变体 "${vName}"：未设置模型引用`);
            }
            const subParts = variant.sub_parts || {};
            if (Object.keys(subParts).length === 0) {
                errors.push(`零件 "${partId}" 变体 "${vName}"：未定义子零件`);
            }
            for (const [spName, sp] of Object.entries(subParts)) {
                if (Object.keys(sp.hit_boxes || {}).length === 0) {
                    errors.push(`零件 "${partId}"/${vName} 子零件 "${spName}"：碰撞箱为空`);
                }
                if ((sp.mass || 0) <= 0) {
                    errors.push(`零件 "${partId}"/${vName} 子零件 "${spName}"：质量必须大于 0`);
                }
            }
        }
    }

    return errors;
}

/**
 * 注册 MachineMax 自定义模式
 */
function registerMode() {
    if (!_mmVueComponent) {
        try {
            _mmVueComponent = require('./ui/App.vue.js');
        } catch (e) {
            console.warn('[MM Mode]  Vue 组件加载失败:', e.message);
            _mmVueComponent = null;
        }
    }

    if (!_mmCssInserted) {
        try {
            const mmCss = CSS_MM_MODE;
            if (mmCss) {
                const style = document.createElement('style');
                style.setAttribute('data-mm-plugin', 'true');
                style.textContent = mmCss;
                document.head.appendChild(style);
                _mmCssInserted = true;
            }
        } catch (e) {
            console.warn('[MM Mode]  样式加载失败:', e.message);
        }
    }

    const mmMode = new Mode('machine_max_part', {
        name: '零件定义',
        icon: 'fa-cube',
        component: _mmVueComponent || (function () { return { template: '<div class="mm-panel"><p>加载面板中...</p></div>' }; }),
        hidden_node_types: [],
        onSelect: function () {
            console.log('[MM Mode]  进入零件定义模式');

            const config = loadConfig();

            if (config._uiState?.activePartId && !config.parts[config._uiState.activePartId]) {
                config._uiState.activePartId = '';
                config._uiState.activeVariantName = '';
            }

            const partIds = Object.keys(config.parts);
            if (!config._uiState?.activePartId && partIds.length > 0) {
                config._uiState.activePartId = partIds[0];
                const variants = Object.keys(config.parts[partIds[0]].variants || {});
                config._uiState.activeVariantName = variants.length > 0 ? variants[0] : 'default';
            }

            refreshOutlinerIcons();
            patchShowContextMenu();
            Blockbench.dispatchEvent('update_selection');
        },
        onUnselect: function () {
            console.log('[MM Mode]  退出零件定义模式');
            restoreShowContextMenu();
            resetOutlinerIcons();
            saveConfig();
        },
    });

    registerToolbarActions();

    console.log('[MM Mode]  模式 "零件定义" 已注册');
    return mmMode;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerMode,
        refreshOutlinerIcons,
        resetOutlinerIcons,
        runValidation,
    };
}
