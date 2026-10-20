/**
 * patches.js — 原型猴子补丁 + MachineMax 右键菜单
 *
 * 菜单只负责“列出可做的动作、把动作转交给领域操作层（core/operations.js）”，
 * 撤销边界在操作函数内部，不在这里。这样同一个动作从工具栏/面板/菜单触发
 * 都自带撤销记录，UI 层也无需各自记得包 runConfigEdit。
 */
var { getMarker } = require('../core/element_markers.js');
var { getConfig } = require('../utils/persistence.js');
var { showToast } = require('../utils/notify.js');
var { createLogger } = require('../utils/logger.js');
var ssTypes = require('../core/subsystem_types.js');
var ops = require('../core/operations.js');

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

// =============================================================================
// 菜单动作辅助
// =============================================================================

/** 刷新 Outliner 图标（模式层懒加载，避免循环依赖） */
function _refreshIcons() {
    try {
        require('../mode.js').refreshOutlinerIcons();
    } catch (e) {
        log.debug('_refreshIcons: 不可用', e && e.message);
    }
}

/**
 * 统一处理领域操作结果：失败提示错误、成功刷新图标并提示
 * @param {{ok: boolean, error?: string, warning?: string}} result
 * @param {string} [successMessage]
 * @returns {boolean} 是否成功
 */
function _applyResult(result, successMessage) {
    if (!result || !result.ok) {
        showToast((result && result.error) || '操作失败', 'error');
        return false;
    }
    _refreshIcons();
    if (typeof Blockbench !== 'undefined' && typeof Blockbench.dispatchEvent === 'function') {
        Blockbench.dispatchEvent('update_selection');
    }
    if (result.warning) {
        showToast(result.warning, 'warning');
    } else if (successMessage) {
        showToast(successMessage, 'positive');
    }
    return true;
}

// =============================================================================
// 菜单构建
// =============================================================================

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

    var activePartId = config._uiState?.activePartId;
    var activeVariantName = config._uiState?.activeVariantName;

    // 若无活跃零件但有已定义零件，自动选择第一个（只改 _uiState，不产生撤销记录）
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
        return _buildEmptyStateItems(config);
    }

    var marker = getMarker(config, activePartId, activeVariantName, el.uuid);
    log.debug('buildMMMenuItems: 当前元素标记', {
        uuid: el.uuid,
        marker: marker ? marker.type : '无',
    });

    var items = [];
    items.push(new MenuSeparator('mm_separator', 'MachineMax 标记'));

    if (el instanceof Group) {
        if (!marker || marker.type !== 'sub_part') {
            items.push({
                name: '标记为子零件',
                icon: 'inventory_2',
                click: function () {
                    var result = ops.markSubPart(config, {
                        partId: activePartId,
                        variantName: activeVariantName,
                        element: el,
                    });
                    _applyResult(result, result.ok ? ('已标记为子零件 "' + result.spKey + '"') : null);
                },
            });
        }
        if (!marker || marker.type !== 'hit_box') {
            items.push({
                name: '标记为碰撞箱',
                icon: 'select_all',
                click: function () {
                    var result = ops.markHitBox(config, {
                        partId: activePartId,
                        variantName: activeVariantName,
                        element: el,
                    });
                    _applyResult(result);
                },
            });
        }
        if (!marker || marker.type !== 'interact_box') {
            items.push({
                name: '标记为交互区',
                icon: 'pan_tool',
                click: function () {
                    var result = ops.markInteractBox(config, {
                        partId: activePartId,
                        variantName: activeVariantName,
                        element: el,
                    });
                    _applyResult(result);
                },
            });
        }
        // 已标记为子零件的 Group 显示"添加子系统"二级菜单
        if (marker && marker.type === 'sub_part') {
            items.push({
                name: '添加子系统',
                icon: 'add',
                children: _buildSubsystemSubmenu(config, activePartId, activeVariantName, marker.config_ref || el.name),
            });
        }
    } else if (el instanceof Locator) {
        if (!marker || marker.type !== 'connector') {
            items.push({
                name: '标记为连接点',
                icon: 'link',
                click: function () {
                    var result = ops.markConnector(config, {
                        partId: activePartId,
                        variantName: activeVariantName,
                        element: el,
                    });
                    _applyResult(result);
                },
            });
        }
    }

    if (marker) {
        items.push({
            name: '清除 MachineMax 标记',
            icon: 'delete',
            click: function () {
                log.debug('右键菜单: 清除标记', { type: marker.type, uuid: el.uuid });
                var result = ops.clearElementMarker(config, {
                    partId: activePartId,
                    variantName: activeVariantName,
                    uuid: el.uuid,
                });
                _applyResult(result, '已清除 MachineMax 标记');
            },
        });
    }

    log.debug('buildMMMenuItems: 构建了 ' + items.length + ' 个菜单条目');
    return items;
}

/**
 * 无活跃零件时的提示菜单：新建零件 + 项目管理
 * @param {Object} config
 * @returns {Array}
 */
function _buildEmptyStateItems(config) {
    log.debug('buildMMMenuItems: 无活跃零件/变体，显示提示菜单');
    var items = [];
    items.push(new MenuSeparator('mm_separator', 'MachineMax'));
    items.push({
        name: '新建零件',
        icon: 'add',
        click: function () {
            require('../ui/dialogs/part_dialogs.js').showNewPartDialog(config);
        },
    });
    items.push({
        name: '项目管理',
        icon: 'settings',
        click: function () {
            require('../ui/dialogs/part_dialogs.js').showProjectSettingsDialog(config);
        },
    });
    return items;
}

/**
 * "添加子系统"二级菜单（按分类分组）
 * @param {Object} config
 * @param {string} partId
 * @param {string} variantName
 * @param {string} spKey
 * @returns {Array}
 */
function _buildSubsystemSubmenu(config, partId, variantName, spKey) {
    var catOrder = ['power', 'control', 'utility', 'experimental'];
    var catItems = [];
    var variant = config.parts[partId] && config.parts[partId].variants
        ? config.parts[partId].variants[variantName]
        : null;
    if (!variant) return catItems;

    for (var ci = 0; ci < catOrder.length; ci++) {
        var cat = catOrder[ci];
        var types = ssTypes.getTypesByCategory(cat);
        if (!types || types.length === 0) continue;
        var catLabel = ssTypes.getCategoryLabel(cat);
        var typeItems = [];
        for (var ti = 0; ti < types.length; ti++) {
            (function (capturedTypeId, capturedDisplayName) {
                typeItems.push({
                    name: capturedDisplayName,
                    click: function () {
                        var { showAddSubsystemDialog } = require('../ui/add_subsystem_dialog.js');
                        showAddSubsystemDialog({
                            config: config,
                            variant: variant,
                            partId: partId,
                            variantName: variantName,
                            spKey: spKey,
                            preSelectedType: capturedTypeId,
                        });
                    },
                });
            })(types[ti].id, types[ti].displayName);
        }
        catItems.push({ name: '[' + catLabel + ']', children: typeItems });
    }
    return catItems;
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
