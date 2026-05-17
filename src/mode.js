const { getMarkersForVariant, setMarker, clearMarker, getMarker, MARKER_TYPES, getMarkerInfo, detectOwnerSubPart, recalcAutoEndBones } = require('./core/element_markers.js');
const { loadConfig, saveConfig, getConfig } = require('./utils/persistence.js');
const { showToast } = require('./utils/notify.js');
const { createLogger } = require('./utils/logger.js');
const { registerToolbarActions, _mmActionInstances } = require('./mode/toolbar.js');
const { runValidation } = require('./mode/validation.js');
const { buildMMMenuItems, patchShowContextMenu, restoreShowContextMenu, patchElementSelect, restoreElementSelect } = require('./mode/patches.js');

let _mmVueComponent = null;
let _mmCssInserted = false;

/** 模块日志 */
var log = createLogger('Mode');

/**
 * 根据标记类型获取 Outliner 图标类名
 * 直接从 element_markers.MARKER_TYPES 读取，避免数据重复
 */
function getIconClassForType(type) {
    const info = getMarkerInfo(type);
    return info ? info.icon : '';
}

/**
 * 刷新 Outliner 节点图标
 * 遍历当前零件当前变体的 element_markers，修改对应节点的 icon 属性。
 * 无标记元素恢复为 Blockbench 默认图标（delete 让原型值生效），
 * 修改后调用 updateElement() 立即刷新 DOM。
 */
function refreshOutlinerIcons() {
    if (!Project || Project === 0) {
        log.debug('refreshOutlinerIcons: 项目未打开，跳过');
        return;
    }

    const config = getConfig();
    if (!config) {
        log.debug('refreshOutlinerIcons: config 为空，跳过');
        return;
    }

    const activePartId = config._uiState?.activePartId;
    const activeVariantName = config._uiState?.activeVariantName;
    if (!activePartId || !activeVariantName) {
        log.debug('refreshOutlinerIcons: 无活跃零件/变体，跳过');
        return;
    }

    log.debug('refreshOutlinerIcons: 刷新图标', { partId: activePartId, variant: activeVariantName });
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
        // 强制 Vue 重新渲染该节点（即时生效，不延迟）
        if (typeof el.updateElement === 'function') {
            el.updateElement();
        }
    }
}

/**
 * 恢复所有 Outliner 节点图标为 Blockbench 默认值
 * 使用 delete 删除实例属性，让原型上的默认值（Group:'folder', Locator:'fa-anchor'）自然生效
 */
function resetOutlinerIcons() {
    if (!Project || Project === 0) return;
    const allElements = [...Group.all, ...Locator.all];
    for (const el of allElements) {
        delete el.icon;
        if (typeof el.updateElement === 'function') {
            el.updateElement();
        }
    }
}

/**
 * 注册 MachineMax 自定义模式
 * 在 onSelect 中显式打开 Outliner 面板，确保切换到零件定义模式后大纲视图可见。
 */
function registerMode() {
    if (Mode.modes && Mode.modes['machine_max_part']) {
        log.debug('registerMode: 模式 "零件定义" 已存在，跳过注册');
        return Mode.modes['machine_max_part'];
    }

    if (!_mmVueComponent) {
        try {
            _mmVueComponent = require('./ui/App.vue.js');
            log.debug('registerMode: Vue 组件已加载');
        } catch (e) {
            log.error('registerMode: Vue 组件加载失败', e);
            _mmVueComponent = null;
        }
    }

    // 注册侧边栏 Panel（替代 Mode.component）
    // Mode.component 挂载到 #center 会占满工作区且跨模式残留
    // Panel 有独立的生命周期和 condition，自动随模式切换显示/隐藏
    if (Panels && Panels['mm_properties']) {
        // Panel 已存在（热重载场景）→ 强制移到左侧栏
        try {
            if (Panels['mm_properties'].moveTo) {
                Panels['mm_properties'].moveTo('left_bar');
                log.info('registerMode: 已有 Panel 已移至左侧栏');
            }
        } catch (e) {
            log.error('registerMode: Panel moveTo 失败', e);
        }
    } else {
        try {
            var PanelClass = typeof Panel !== 'undefined' ? Panel : (typeof Blockbench !== 'undefined' ? Blockbench.Panel : null);
            if (!PanelClass) {
                log.warn('registerMode: Panel 类不可用，跳过面板注册');
            } else {
                new PanelClass('mm_properties', {
                    name: '零件属性',
                    icon: 'fa-cube',
                    condition: { modes: ['machine_max_part'] },
                    default_position: {
                        slot: 'left_bar',
                        height: 300,
                    },
                    insert_after: 'outliner',
                    growable: true,
                    resizable: true,
                    component: _mmVueComponent || (function () { return { template: '<div class="mm-panel"><p>加载面板中...</p></div>' }; }),
                });
                log.info('registerMode: Panel "零件属性" 已注册到左侧栏');
            }
        } catch (e) {
            log.error('registerMode: Panel 注册失败', e);
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
                log.debug('registerMode: 样式已注入 <head>');
            }
        } catch (e) {
            log.error('registerMode: 样式加载失败', e);
        }
    }

    const mmMode = new Mode('machine_max_part', {
        name: '零件定义',
        icon: 'fa-cube',
        hidden_node_types: ['cube', 'mesh', 'texture_mesh', 'null_object'],
        onSelect: function () {
            log.info('进入零件定义模式');

            // 清理旧版本 Mode.component 残留的 mode_screen div（现已被 Panel 替代）
            var oldScreen = document.getElementById('mode_screen_machine_max_part');
            if (oldScreen) {
                oldScreen.remove();
                log.debug('onSelect: 清理旧版 mode_screen 残留');
            }

            if (Panels && Panels.outliner) {
                var cond = Panels.outliner.condition;
                if (cond && cond.modes && !cond.modes.includes('machine_max_part')) {
                    cond.modes.push('machine_max_part');
                    log.debug('onSelect: 已将 machine_max_part 添加到 Outliner 显示条件');
                }
                try { Panels.outliner.fold(false); } catch (e) { log.debug('onSelect: Outliner.fold 异常', e); }
                try { Panels.outliner.update(); } catch (e) { log.debug('onSelect: Outliner.update 异常', e); }
            }

            const config = loadConfig();

            log.debug('onSelect: 配置已加载', {
                parts: Object.keys(config.parts || {}),
                _uiState: config._uiState,
            });

            if (config._uiState?.activePartId && !config.parts[config._uiState.activePartId]) {
                log.debug('onSelect: activePartId ' + config._uiState.activePartId + ' 已失效，清空');
                config._uiState.activePartId = '';
                config._uiState.activeVariantName = '';
            }

            const partIds = Object.keys(config.parts);
            if (!config._uiState?.activePartId && partIds.length > 0) {
                config._uiState.activePartId = partIds[0];
                const variants = Object.keys(config.parts[partIds[0]].variants || {});
                config._uiState.activeVariantName = variants.length > 0 ? variants[0] : 'default';
                log.debug('onSelect: 自动选择零件', {
                    partId: partIds[0],
                    variant: config._uiState.activeVariantName,
                });
            }

            refreshOutlinerIcons();
            log.debug('onSelect: 调用 patchShowContextMenu...');
            patchShowContextMenu();
            log.debug('onSelect: 调用 patchElementSelect...');
            patchElementSelect();
            Blockbench.dispatchEvent('update_selection');

            // 进入模式时重算所有子零件的 auto_end_bones（处理之前保存的旧配置）
            var activePId = config._uiState?.activePartId;
            var activeVName = config._uiState?.activeVariantName;
            if (activePId && activeVName) {
                recalcAutoEndBones(config, activePId, activeVName);
                log.debug('onSelect: auto_end_bones 重算完成');
            }
        },
        onUnselect: function () {
            log.info('退出零件定义模式');
            restoreShowContextMenu();
            restoreElementSelect();
            resetOutlinerIcons();

            if (Panels && Panels.outliner) {
                var cond = Panels.outliner.condition;
                if (cond && cond.modes) {
                    var idx = cond.modes.indexOf('machine_max_part');
                    if (idx !== -1) {
                        cond.modes.splice(idx, 1);
                        log.debug('onUnselect: 已从 Outliner 显示条件移除 machine_max_part');
                    }
                }
            }

            saveConfig();
            log.debug('onUnselect: 配置已保存');
        },
    });

    registerToolbarActions();

    log.info('registerMode: 模式 "零件定义" 已注册');
    return mmMode;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerMode,
        refreshOutlinerIcons,
        resetOutlinerIcons,
        runValidation,
        /** 卸载插件时，通过 Action.delete() 正确清理所有注册的 Action（而非仅删除 BarItems 条目） */
        unregisterActions: function () {
            if (!_mmActionInstances.length) {
                log.debug('unregisterActions: 无 Action 需清理');
                return;
            }
            var count = 0;
            for (let i = _mmActionInstances.length - 1; i >= 0; i--) {
                const action = _mmActionInstances[i];
                if (action && typeof action.delete === 'function') {
                    try {
                        action.delete();
                        log.debug('unregisterActions: 已清理 Action: ' + action.id);
                        count++;
                    } catch (e) {
                        log.error('unregisterActions: 清理 Action 失败: ' + action.id, e);
                    }
                }
            }
            _mmActionInstances.length = 0;
            log.info('unregisterActions: 完成，共清理 ' + count + ' 个 Action');
        },
    };
}
