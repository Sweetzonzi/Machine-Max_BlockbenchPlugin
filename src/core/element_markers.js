const MARKER_TYPES = {
    sub_part: { label: '子零件', icon: 'fa-cube', color: '#4A90D9' },
    hit_box: { label: '碰撞箱', icon: 'fa-shield', color: '#D94A4A' },
    connector: { label: '连接点', icon: 'fa-plug', color: '#4AD94A' },
    seat: { label: '座位', icon: 'fa-chair', color: '#D9C94A' },
    lighting: { label: '灯光', icon: 'fa-lightbulb', color: '#D97E4A' },
    subsystem_locator: { label: '子系统', icon: 'fa-cog', color: '#9B4AD9' },
};

const MARKER_TYPE_LIST = Object.keys(MARKER_TYPES);

function getMarkerInfo(type) {
    return MARKER_TYPES[type] || null;
}

function getIconClass(type) {
    const info = getMarkerInfo(type);
    return info ? info.icon : '';
}

function getColor(type) {
    const info = getMarkerInfo(type);
    return info ? info.color : '#888888';
}

function getMarkerTypesForElement(element) {
    if (element instanceof Locator) {
        return ['connector', 'seat', 'lighting', 'subsystem_locator'];
    } else if (element instanceof Group) {
        return ['sub_part', 'hit_box'];
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
        type: type,
        config_ref: configRef || null,
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

if (typeof module !== 'undefined' && module.exports) {
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
        getMarkersForVariant,
    };
}
