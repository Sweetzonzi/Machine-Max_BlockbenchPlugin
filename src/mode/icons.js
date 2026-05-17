var { getMarkerInfo, getMarkersForVariant } = require('../core/element_markers.js');
var { getConfig } = require('../utils/persistence.js');
var { createLogger } = require('../utils/logger.js');

var log = createLogger('Mode');

/**
 * 根据标记类型获取 Outliner 图标类名
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getIconClassForType,
        refreshOutlinerIcons,
        resetOutlinerIcons,
    };
}
