const { getMarkersForVariant, setMarker, clearMarker, getMarker, MARKER_TYPES, getMarkerInfo } = require('./core/element_markers.js');
const { loadConfig, saveConfig, getConfig } = require('./utils/persistence.js');
const { showToast } = require('./utils/notify.js');
const { createLogger } = require('./utils/logger.js');

let _mmVueComponent = null;
let _mmCssInserted = false;

/** 模块日志 */
var log = createLogger('Mode');

/**
 * 右键菜单劫持状态
 *
 * Group、OutlinerElement 各自重写了 showContextMenu（均不调用 super），
 * 仅劫持 OutlinerNode.prototype 对它们无效，必须逐个劫持。
 *
 * 原型引用在 patchShowContextMenu() 时延迟求值，避免 IIFE 加载时全局变量尚未就绪。
 */
const _originalShowContextMenus = {};
const _PATCH_TARGETS = ['OutlinerNode', 'Group', 'OutlinerElement'];

/** 被劫持的 OutlinerElement.prototype.select 原始实现（零件定义模式下点cube选组） */
var _originalOutlinerElementSelect = null;

/** 记录本插件创建的 Action 实例，用于 onunload 正确清理，避免残留导致重复 ID */
const _mmActionIds = ['mm_validate', 'mm_export', 'mm_new_part', 'mm_project_settings'];
const _mmActionInstances = [];

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
 * 遍历当前零件当前变体的 element_markers，修改对应节点的 icon 属性
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
            el.icon = '';
        }
    }
}

/**
 * 恢复所有 Outliner 节点图标为默认
 */
function resetOutlinerIcons() {
    if (!Project || Project === 0) return;
    const allElements = [...Group.all, ...Locator.all];
    for (const el of allElements) {
        el.icon = '';
    }
}

/**
 * 构建 MachineMax 专属右键菜单条目，返回待注入的 structure 数组
 *
 * 由于 Group.prototype.menu / Locator.prototype.menu 是预构建的 Menu 实例，
 * 没有 addItem 方法，必须在 menu.open() 调用前将条目推入 menu.structure，
 * 并在 open() 返回后弹出清理。
 *
 * @param {Object} el - Outliner 元素（Group 或 Locator）
 * @returns {Array}  待注入 menu.structure 的条目数组（含 MenuSeparator 分隔线）
 */
function buildMMMenuItems(el) {
    log.debug('buildMMMenuItems 被调用', {
        name: el && el.name,
        type: el && el.constructor && el.constructor.name,
        isGroup: el instanceof Group,
        isLocator: el instanceof Locator,
    });

    var config = getConfig();
    if (!config) {
        log.warn('buildMMMenuItems: getConfig() 返回空');
        return [];
    }

    log.debug('buildMMMenuItems: 当前 UI 状态', {
        _uiState: config._uiState,
        parts: Object.keys(config.parts || {}),
    });

    var activePartId = config._uiState?.activePartId;
    var activeVariantName = config._uiState?.activeVariantName;

    // 若无活跃零件但有已定义零件，自动选择第一个
    if ((!activePartId || !activeVariantName) && config.parts && Object.keys(config.parts).length > 0) {
        var autoId = Object.keys(config.parts)[0];
        var variants = Object.keys(config.parts[autoId].variants || {});
        var autoVariant = variants.length > 0 ? variants[0] : 'default';
        config._uiState.activePartId = autoId;
        config._uiState.activeVariantName = autoVariant;
        activePartId = autoId;
        activeVariantName = autoVariant;
        log.debug('buildMMMenuItems: 自动选择第一个零件', { partId: autoId, variant: autoVariant });
    }

    if (!activePartId || !activeVariantName) {
        log.debug('buildMMMenuItems: 无活跃零件/变体，显示提示菜单');
        var hintItems = [];
        hintItems.push(new MenuSeparator('mm_separator', 'MachineMax'));
        hintItems.push({ name: '⚠️ 请先新建零件', icon: 'add', click: function () {
            log.debug('右键菜单: 点击了"新建零件"');
            var cfg = getConfig();
            if (!cfg) { log.warn('右键菜单新建零件: getConfig() 返回 null'); return; }
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
                        if (cfg.parts[partId]) {
                            showToast('零件 "' + partId + '" 已存在', 'error');
                            return false;
                        }
                        var cfgMod = require('./core/config.js');
                        cfg.parts[partId] = cfgMod.createPartConfig(partId, variantName);
                        if (model) cfg.parts[partId].variants[variantName].model = model;
                        cfg._uiState.activePartId = partId;
                        cfg._uiState.activeVariantName = variantName;
                        log.info('右键菜单新建零件成功', { partId: partId, variant: variantName });
                        refreshOutlinerIcons();
                        Blockbench.dispatchEvent('update_selection');
                        showToast('零件 "' + partId + '" 已创建', 'positive');
                        this.hide();
                    }
                }).show();
                log.debug('右键菜单新建零件: Dialog 已显示');
            } catch (e) {
                log.error('右键菜单新建零件 Dialog 异常', e);
            }
        }});
        hintItems.push({ name: '📋 项目管理', icon: 'settings', click: function () {
            log.debug('右键菜单: 点击了"项目管理"');
            var cfg = getConfig();
            if (!cfg) return;
            var partCount = Object.keys(cfg.parts || {}).length;
            try {
                new Dialog({
                    title: '⚙ MachineMax 项目管理',
                    form: {
                        namespace: { type: 'text', label: '命名空间', value: cfg.namespace },
                        info: { type: 'display', label: '统计', lines: [
                            '模型: ' + (Project.name || '未命名'),
                            '零件数: ' + partCount,
                            '连接点定义: ' + Object.keys(cfg.connector_defs || {}).length,
                            '子系统型号: ' + Object.keys(cfg.subsystem_defs || {}).length,
                            '材料定义: ' + Object.keys(cfg.material_defs || {}).length,
                        ]},
                    },
                    onConfirm: function (formData) {
                        cfg.namespace = formData.namespace;
                        log.info('项目管理: 命名空间已更新', { namespace: formData.namespace });
                        saveConfig();
                        this.hide();
                    }
                }).show();
                log.debug('右键菜单项目管理: Dialog 已显示');
            } catch (e) {
                log.error('右键菜单项目管理 Dialog 异常', e);
            }
        }});
        return hintItems;
    }

    const marker = getMarker(config, activePartId, activeVariantName, el.uuid);
    log.debug('buildMMMenuItems: 当前元素标记', {
        uuid: el.uuid,
        marker: marker ? marker.type : '无',
    });

    var items = [];
    items.push(new MenuSeparator('mm_separator', 'MachineMax 标记'));

    if (el instanceof Group) {
        if (!marker || marker.type !== 'sub_part') {
            items.push({ name: '📦 标记为子零件', icon: 'inventory_2', click: function () {
                log.debug('右键菜单: 标记为子零件', { uuid: el.uuid, name: el.name });
                setMarker(config, activePartId, activeVariantName, el.uuid, 'sub_part', null);
                refreshOutlinerIcons();
                Blockbench.dispatchEvent('update_selection');
            }});
        }
        if (!marker || marker.type !== 'hit_box') {
            items.push({ name: '🔵 标记为碰撞箱', icon: 'select_all', click: function () {
                log.debug('右键菜单: 标记为碰撞箱', { uuid: el.uuid, name: el.name });
                setMarker(config, activePartId, activeVariantName, el.uuid, 'hit_box', null);
                refreshOutlinerIcons();
                Blockbench.dispatchEvent('update_selection');
            }});
        }
    } else if (el instanceof Locator) {
        var locatorTypes = ['connector', 'seat', 'lighting', 'subsystem_locator'];
        var labels = {
            connector: '📌 标记为连接点',
            seat: '🟡 标记为座位定位点',
            lighting: '🟠 标记为灯光定位点',
            subsystem_locator: '⚙ 标记为子系统定位点',
        };
        var icons = {
            connector: 'link',
            seat: 'event_seat',
            lighting: 'lightbulb',
            subsystem_locator: 'precision_manufacturing',
        };
        for (var t = 0; t < locatorTypes.length; t++) {
            var type = locatorTypes[t];
            if (!marker || marker.type !== type) {
                items.push({ name: labels[type], icon: icons[type], click: (function (capturedType) {
                    return function () {
                        log.debug('右键菜单: 标记为' + capturedType, { uuid: el.uuid, name: el.name });
                        setMarker(config, activePartId, activeVariantName, el.uuid, capturedType, null);
                        refreshOutlinerIcons();
                        Blockbench.dispatchEvent('update_selection');
                    };
                })(type) });
            }
        }
    }

    if (marker) {
        var info = MARKER_TYPES[marker.type];
        if (info) {
            items.push({ name: '🔍 在属性面板中查看 (' + info.label + ')', icon: 'search', click: function () {
                log.debug('右键菜单: 在属性面板中查看', { type: marker.type, uuid: el.uuid });
                Blockbench.dispatchEvent('update_selection');
            }});
        }
        items.push({ name: '🗑️ 清除 MachineMax 标记', icon: 'delete', click: function () {
            log.debug('右键菜单: 清除标记', { type: marker.type, uuid: el.uuid });
            clearMarker(config, activePartId, activeVariantName, el.uuid);
            refreshOutlinerIcons();
            Blockbench.dispatchEvent('update_selection');
        }});
    }

    log.debug('buildMMMenuItems: 构建了 ' + items.length + ' 个菜单条目');
    return items;
}

/**
 * 将 MM 菜单条目注入 menu.structure（在 open() 前调用）
 * @returns {number} 注入的条目数，用于后续清理
 */
function injectMMItemsToStructure(el, menu) {
    if (!menu || !menu.structure) {
        log.debug('injectMMItemsToStructure: menu.structure 不可用', {
            menuExists: !!menu,
            menuType: menu ? typeof menu : 'null',
            menuKeys: menu ? Object.keys(menu) : [],
        });
        return 0;
    }

    if (!(menu.structure instanceof Array)) {
        log.debug('injectMMItemsToStructure: menu.structure 不是数组', {
            type: typeof menu.structure,
            preview: JSON.stringify(String(menu.structure)).substring(0, 80),
        });
        return 0;
    }

    log.debug('injectMMItemsToStructure: 注入前 structure 长度=' + menu.structure.length);

    var items = buildMMMenuItems(el);
    if (items.length === 0) {
        log.debug('injectMMItemsToStructure: 无条目可注入');
        return 0;
    }

    for (var i = 0; i < items.length; i++) {
        menu.structure.push(items[i]);
    }
    log.debug('injectMMItemsToStructure: 已注入 ' + items.length + ' 条, 当前长度=' + menu.structure.length);
    return items.length;
}

/**
 * 从 menu.structure 末尾弹出指定数量的条目（在 open() 返回后调用）
 */
function ejectMMItemsFromStructure(menu, count) {
    if (!menu || !menu.structure || count <= 0) return;
    for (var i = 0; i < count; i++) {
        menu.structure.pop();
    }
    log.debug('ejectMMItemsFromStructure: 已弹出 ' + count + ' 条, 当前长度=' + menu.structure.length);
}

/**
 * 根据全局名称获取原型引用（延迟求值，每次调用时重新获取）
 */
function getProtoByName(name) {
    try {
        var globalRef = (typeof window !== 'undefined' ? window : globalThis)[name];
        return globalRef ? globalRef.prototype : null;
    } catch (e) {
        return null;
    }
}

/**
 * 劫持 Group、OutlinerElement、OutlinerNode 三个原型上的 showContextMenu
 *
 * 关键改进：
 * 1. 原型引用在函数内延迟求值，不依赖 IIFE 初始化时的全局变量状态
 * 2. 在调用原始 open() 之前，先将 MM 条目注入 this.menu，使其出现在同一个菜单中
 * 3. 完整调试日志可追踪整个调用链
 */
function patchShowContextMenu() {
    if (_originalShowContextMenus['Group']) {
        log.debug('patchShowContextMenu: 已有劫持，跳过');
        return;
    }

    var patchedCount = 0;
    var skippedCount = 0;

    for (var i = 0; i < _PATCH_TARGETS.length; i++) {
        var key = _PATCH_TARGETS[i];
        var proto = getProtoByName(key);

        if (!proto || typeof proto.showContextMenu !== 'function') {
            skippedCount++;
            log.debug('patchShowContextMenu: ' + key + '.prototype 不可用');
            continue;
        }

        log.debug('patchShowContextMenu: 劫持 ' + key + '.prototype.showContextMenu');
        _originalShowContextMenus[key] = proto.showContextMenu;
        patchedCount++;

        (function (capturedKey, capturedProto) {
            capturedProto.showContextMenu = function (event) {
                log.debug('showContextMenu 被调用', {
                    type: capturedKey,
                    name: this && this.name,
                    modeId: Modes ? Modes.id : '?Modes?',
                    menuExists: !!(this && this.menu),
                    structureType: this && this.menu && this.menu.structure instanceof Array ? 'Array[' + this.menu.structure.length + ']' : typeof (this && this.menu && this.menu.structure),
                });

                var injectedCount = 0;
                if (Modes && Modes.id === 'machine_max_part') {
                    if (this && this.menu && this.menu.structure instanceof Array) {
                        log.debug('→ 注入 MM 条目到 menu.structure');
                        injectedCount = injectMMItemsToStructure(this, this.menu);
                    } else {
                        log.debug('→ this.menu.structure 不可用', {
                            menu: this && this.menu ? {
                                type: typeof this.menu,
                                keys: Object.keys(this.menu).slice(0, 8),
                                itemsType: typeof this.menu.items,
                                structureType: typeof this.menu.structure,
                            } : null,
                            constructor: this ? this.constructor.name : 'null',
                        });
                    }
                } else {
                    log.debug('→ 非 MachineMax 模式, 跳过');
                }

                var originalFn = _originalShowContextMenus[capturedKey];
                if (originalFn) {
                    originalFn.call(this, event);
                }

                if (injectedCount > 0 && this && this.menu) {
                    ejectMMItemsFromStructure(this.menu, injectedCount);
                }
            };
        })(key, proto);
    }

    log.info('patchShowContextMenu: 完成, 成功=' + patchedCount + ' 跳过=' + skippedCount);
}

/**
 * 恢复被劫持的三个 showContextMenu 原型方法
 */
function restoreShowContextMenu() {
    for (var i = 0; i < _PATCH_TARGETS.length; i++) {
        var key = _PATCH_TARGETS[i];
        if (_originalShowContextMenus[key]) {
            var proto = getProtoByName(key);
            if (proto) {
                proto.showContextMenu = _originalShowContextMenus[key];
                log.debug('restoreShowContextMenu: 恢复 ' + key);
            }
        }
    }
    for (var k in _originalShowContextMenus) {
        delete _originalShowContextMenus[k];
    }
    log.debug('restoreShowContextMenu: 完成');
}

/**
 * 劫持 OutlinerElement.prototype.select
 *
 * 在零件定义模式下，当用户从预览视图点击 cube / mesh / null_object 等底层元素时，
 * 自动将选择重定向到该元素的父级 Group，而非选中单个 cube。
 *
 * 原理与动画模式相同：动画模式在 preview.js click() 中通过
 * `Animator.open && !data.element.constructor.animator` 判断是否重定向；
 * 本插件无 Animator，因此通过劫持 select() 在更早阶段实现等效行为。
 *
 * 仅劫持 OutlinerElement.prototype.select —— Locator 等类型若覆写了 select()，
 * 其自身原型上的方法不受影响。
 */
function patchElementSelect() {
    if (_originalOutlinerElementSelect) {
        log.debug('patchElementSelect: 已有劫持，跳过');
        return;
    }

    var proto = getProtoByName('OutlinerElement');
    if (!proto || typeof proto.select !== 'function') {
        log.warn('patchElementSelect: OutlinerElement.prototype.select 不可用，跳过');
        return;
    }

    _originalOutlinerElementSelect = proto.select;

    proto.select = function (event, is_outliner_click) {
        if (Mode.selected && Mode.selected.id === 'machine_max_part' && this.parent instanceof Group) {
            return this.parent.select(event, is_outliner_click);
        }
        return _originalOutlinerElementSelect.call(this, event, is_outliner_click);
    };

    log.info('patchElementSelect: 已劫持 OutlinerElement.prototype.select — 点cube将自动选组');
}

/**
 * 恢复 OutlinerElement.prototype.select 为原始实现
 */
function restoreElementSelect() {
    if (!_originalOutlinerElementSelect) {
        log.debug('restoreElementSelect: 无劫持，跳过');
        return;
    }

    var proto = getProtoByName('OutlinerElement');
    if (proto) {
        proto.select = _originalOutlinerElementSelect;
        log.info('restoreElementSelect: 已恢复 OutlinerElement.prototype.select');
    }
    _originalOutlinerElementSelect = null;
}

/**
 * 为模式添加专属工具栏按钮
 * 使用 BarItems（Blockbench 官方的 BarItem 注册表）检查 Action 是否已存在，
 * 避免插件热重载时重复注册导致 duplicate ID 警告。
 * 创建的 Action 实例存入 _mmActionInstances，供 unregisterActions 正确清理。
 */
function registerToolbarActions() {
    if (BarItems && BarItems['mm_validate']) {
        log.debug('registerToolbarActions: Actions 已注册（BarItems），跳过');
        for (const id of _mmActionIds) {
            if (BarItems[id] && !_mmActionInstances.includes(BarItems[id])) {
                _mmActionInstances.push(BarItems[id]);
            }
        }
        return;
    }

    log.debug('registerToolbarActions: 注册工具栏 Action...');

    _mmActionInstances.push(new Action('mm_validate', {
        text: '校验配置',
        icon: 'fa-check-circle',
        condition: { modes: ['machine_max_part'] },
        click: function () {
            log.debug('工具栏: 点击"校验配置"');
            const config = getConfig();
            if (!config) {
                showToast('没有可校验的配置', 'warning');
                return;
            }

            const errors = runValidation(config);
            if (errors.length === 0) {
                log.info('校验通过，无错误');
                showToast('校验通过 ✅', 'positive');
            } else {
                log.warn('校验发现问题', { count: errors.length, details: errors });
                showToast('校验发现 ' + errors.length + ' 个问题', 'warning');
                new Dialog({
                    title: '校验结果',
                    lines: ['发现 ' + errors.length + ' 个问题：', ...errors],
                    form: { close: 'close' },
                    onConfirm: function () { this.hide(); },
                }).show();
            }
        }
    }));

    _mmActionInstances.push(new Action('mm_export', {
        text: '导出内容包',
        icon: 'fa-save',
        condition: { modes: ['machine_max_part'] },
        click: function () {
            log.debug('工具栏: 点击"导出内容包"（尚未实现）');
            showToast('导出功能将在阶段四实现', 'info');
        }
    }));

    _mmActionInstances.push(new Action('mm_new_part', {
        text: '新建零件',
        icon: 'fa-plus',
        condition: { modes: ['machine_max_part'] },
        click: function () {
            log.debug('工具栏: 点击"新建零件"');
            var cfg = getConfig();
            if (!cfg) {
                log.warn('工具栏新建零件: config 为空');
                return;
            }
            log.debug('工具栏新建零件: 当前零件列表', { parts: Object.keys(cfg.parts || {}) });
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
                        if (cfg.parts[partId]) {
                            showToast('零件 "' + partId + '" 已存在', 'error');
                            return false;
                        }
                        var cfgMod = require('./core/config.js');
                        cfg.parts[partId] = cfgMod.createPartConfig(partId, variantName);
                        if (model) cfg.parts[partId].variants[variantName].model = model;
                        cfg._uiState.activePartId = partId;
                        cfg._uiState.activeVariantName = variantName;
                        log.info('工具栏新建零件成功', { partId: partId, variant: variantName });
                        refreshOutlinerIcons();
                        Blockbench.dispatchEvent('update_selection');
                        showToast('零件 "' + partId + '" 已创建', 'positive');
                        this.hide();
                    }
                }).show();
                log.debug('工具栏新建零件: Dialog 已创建');
            } catch (e) {
                log.error('工具栏新建零件 Dialog 异常', e);
            }
        }
    }));

    _mmActionInstances.push(new Action('mm_project_settings', {
        text: '项目管理',
        icon: 'fa-cog',
        condition: { modes: ['machine_max_part'] },
        click: function () {
            log.debug('工具栏: 点击"项目管理"');
            const config = getConfig();
            if (!config) {
                log.warn('项目管理: config 为空');
                return;
            }

            const partCount = Object.keys(config.parts).length;
            const connCount = Object.keys(config.connector_defs).length;
            const subCount = Object.keys(config.subsystem_defs).length;
            const matCount = Object.keys(config.material_defs).length;

            const partList = Object.entries(config.parts).map(function (entry) {
                var id = entry[0];
                var part = entry[1];
                var vCount = Object.keys(part.variants || {}).length;
                var markerCount = part.element_markers ? Object.values(part.element_markers).reduce(function (sum, m) { return sum + Object.keys(m).length; }, 0) : 0;
                return '  ' + id + '  |  变体: ' + vCount + '  |  标记: ' + markerCount;
            }).join('\n');

            log.debug('项目管理: 当前统计', {
                parts: partCount,
                connectors: connCount,
                subsystems: subCount,
                materials: matCount,
            });

            new Dialog({
                title: '⚙ MachineMax 项目管理',
                form: {
                    namespace: { type: 'text', label: '命名空间', value: config.namespace },
                    info: { type: 'display', label: '统计', lines: [
                        '模型: ' + (Project.name || '未命名'),
                        '零件数: ' + partCount,
                        '连接点定义: ' + connCount,
                        '子系统型号: ' + subCount,
                        '材料定义: ' + matCount,
                        partCount > 0 ? '\n零件列表:\n' + partList : '（暂无零件）',
                    ]},
                },
                onConfirm: function (formData) {
                    config.namespace = formData.namespace;
                    log.info('项目管理: 命名空间已更新', { namespace: formData.namespace });
                    saveConfig();
                    this.hide();
                }
            }).show();
        }
    }));

    log.info('registerToolbarActions: 完成，注册了 ' + _mmActionInstances.length + ' 个 Action');
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
