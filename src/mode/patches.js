var { getMarkersForVariant, setMarker, clearMarker, getMarker, MARKER_TYPES, getMarkerInfo, detectOwnerSubPart, recalcAutoEndBones } = require('../core/element_markers.js');
var { getConfig, saveConfig } = require('../utils/persistence.js');
var { showToast } = require('../utils/notify.js');
var { createLogger } = require('../utils/logger.js');

var log = createLogger('Mode');

/**
 * 右键菜单劫持状态
 *
 * Group、OutlinerElement 各自重写了 showContextMenu（均不调用 super），
 * 仅劫持 OutlinerNode.prototype 对它们无效，必须逐个劫持。
 *
 * 原型引用在 patchShowContextMenu() 时延迟求值，避免 IIFE 加载时全局变量尚未就绪。
 */
var _originalShowContextMenus = {};
var _PATCH_TARGETS = ['OutlinerNode', 'Group', 'OutlinerElement'];

/** 被劫持的 OutlinerElement.prototype.select 原始实现（零件定义模式下点cube选组） */
var _originalOutlinerElementSelect = null;

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
        hintItems.push({ name: '请先新建零件', icon: 'add', click: function () {
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
                        var cfgMod = require('../core/config.js');
                        cfg.parts[partId] = cfgMod.createPartConfig(partId, variantName);
                        if (model) cfg.parts[partId].variants[variantName].model = model;
                        cfg._uiState.activePartId = partId;
                        cfg._uiState.activeVariantName = variantName;
                        log.info('右键菜单新建零件成功', { partId: partId, variant: variantName });
                        var { refreshOutlinerIcons } = require('../mode.js');
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
        hintItems.push({ name: '项目管理', icon: 'settings', click: function () {
            log.debug('右键菜单: 点击了"项目管理"');
            var cfg = getConfig();
            if (!cfg) return;
            var partCount = Object.keys(cfg.parts || {}).length;
            try {
                new Dialog({
                    title: 'MachineMax 项目管理',
                    form: {
                        contentPackPath: { type: 'text', label: '内容包路径', value: cfg.contentPackPath || '', description: 'MachineMax 内容包的根目录路径' },
                        info: { type: 'display', label: '统计', lines: [
                            '模型: ' + (Project && Project.name || '未命名'),
                            '内容包路径: ' + (cfg.contentPackPath || '未设置'),
                            '零件数: ' + partCount,
                        ]},
                    },
                    onConfirm: function (formData) {
                        cfg.contentPackPath = formData.contentPackPath || '';
                        log.info('项目管理: 内容包路径已更新', { contentPackPath: formData.contentPackPath });
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
            items.push({ name: '标记为子零件', icon: 'inventory_2', click: function () {
                log.debug('右键菜单: 标记为子零件', { uuid: el.uuid, name: el.name });
                setMarker(config, activePartId, activeVariantName, el.uuid, 'sub_part', el.name);
                var { refreshOutlinerIcons } = require('../mode.js');
                refreshOutlinerIcons();
                Blockbench.dispatchEvent('update_selection');
            }});
        }
        if (!marker || marker.type !== 'hit_box') {
            items.push({ name: '标记为碰撞箱', icon: 'select_all', click: function () {
                log.debug('右键菜单: 标记为碰撞箱', { uuid: el.uuid, name: el.name });
                var owner = detectOwnerSubPart(config, activePartId, activeVariantName, el);
                var spKey = owner ? owner.spKey : null;
                if (spKey) {
                    var variant = config.parts[activePartId].variants[activeVariantName];
                    if (!variant.sub_parts) variant.sub_parts = {};
                    if (!variant.sub_parts[spKey]) {
                        var cfgMod = require('../core/config.js');
                        variant.sub_parts[spKey] = cfgMod.createSubPartConfig();
                    }
                    if (!variant.sub_parts[spKey].hit_boxes) {
                        variant.sub_parts[spKey].hit_boxes = {};
                    }
                    var hbName = el.name;
                    if (!variant.sub_parts[spKey].hit_boxes[hbName]) {
                        var cfgMod2 = require('../core/config.js');
                        variant.sub_parts[spKey].hit_boxes[hbName] = cfgMod2.createHitBoxConfig();
                    }
                    // 标记完成后在主编辑器通知
                }
                setMarker(config, activePartId, activeVariantName, el.uuid, 'hit_box', spKey);
                var { refreshOutlinerIcons } = require('../mode.js');
                refreshOutlinerIcons();
                Blockbench.dispatchEvent('update_selection');
                if (!spKey) {
                    showToast('碰撞箱 "' + el.name + '" 无归属子零件（不受防护计算影响）', 'warning');
                }
            }});
        }
    } else if (el instanceof Locator) {
        var locatorTypes = ['connector', 'seat', 'lighting', 'subsystem_locator'];
        var labels = {
            connector: '标记为连接点',
            seat: '标记为座位定位点',
            lighting: '标记为灯光定位点',
            subsystem_locator: '标记为子系统定位点',
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
                        var { refreshOutlinerIcons } = require('../mode.js');
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
            items.push({ name: '在属性面板中查看 (' + info.label + ')', icon: 'search', click: function () {
                log.debug('右键菜单: 在属性面板中查看', { type: marker.type, uuid: el.uuid });
                Blockbench.dispatchEvent('update_selection');
            }});
        }
        items.push({ name: '清除 MachineMax 标记', icon: 'delete', click: function () {
            log.debug('右键菜单: 清除标记', { type: marker.type, uuid: el.uuid });
            clearMarker(config, activePartId, activeVariantName, el.uuid);
            var { refreshOutlinerIcons } = require('../mode.js');
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
        // 仅 Cube/Mesh 等基础元素选父组，Locator 保持独立选中
        if (Mode.selected && Mode.selected.id === 'machine_max_part'
            && this.parent instanceof Group
            && !(this instanceof Locator)) {
            return this.parent.select(event, is_outliner_click);
        }
        return _originalOutlinerElementSelect.call(this, event, is_outliner_click);
    };

    log.info('patchElementSelect: 已劫持 OutlinerElement.prototype.select — 点Cube/Mesh将自动选组，Locator保持独立选中');
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        patchShowContextMenu,
        restoreShowContextMenu,
        patchElementSelect,
        restoreElementSelect,
        buildMMMenuItems,
    };
}
