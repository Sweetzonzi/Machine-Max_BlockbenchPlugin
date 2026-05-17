/**
 * connector_dialog.js — 连接点定义管理对话框
 *
 * 提供连接点（Connector）定义的管理对话框，基于 Blockbench Dialog API 实现。
 * 支持创建、编辑、删除连接点定义，内置权限控制（内置/依赖包只读）。
 *
 * 导出函数:
 *   showConnectorManagerDialog(config) — 连接点管理器主入口
 */

var connector_manager = require('../../managers/connector_manager.js');
var { showToast } = require('../../utils/notify.js');
var { createLogger } = require('../../utils/logger.js');

/** 模块日志 */
var log = createLogger('ConnectorDialog');

// =============================================================================
// 常量
// =============================================================================

/** 方向中文映射 */
var DIRECTION_LABELS = {
    xp: 'X+ (东)',
    yp: 'Y+ (上)',
    zp: 'Z+ (南)',
    xn: 'X- (西)',
    yn: 'Y- (下)',
    zn: 'Z- (北)',
};

/** 来源中文映射 */
var SOURCE_LABELS = {
    current: '当前包',
    builtin: '内置',
};

// =============================================================================
// 内部工具
// =============================================================================

/**
 * 检查 config 对象是否有效
 * @param {Object} config - MM 项目配置
 * @returns {boolean} 有效返回 true
 */
function _isConfigValid(config) {
    return config && typeof config === 'object';
}

/**
 * 检查是否有可编辑的内容包
 * @param {Object} config - MM 项目配置
 * @returns {boolean} 有 contentPackPath 返回 true
 */
function _hasContentPack(config) {
    return config && config.contentPackPath;
}

/**
 * 获取连接器面向用户的类型标签
 * @param {string} type - 内部类型名
 * @returns {string} 显示用标签
 */
function _getConnectorTypeLabel(type) {
    return type === 'Advanced' ? 'Advanced（高级）' : 'Simple（简单）';
}

/**
 * 获取连接器面向用户的方向标签
 * @param {string} dir - 方向标识
 * @returns {string} 显示用标签
 */
function _getDirectionLabel(dir) {
    return DIRECTION_LABELS[dir] || dir;
}

/**
 * 获取来源的中文描述
 * @param {string} source - 来源标识
 * @returns {string} 可读的来源描述
 */
function _getSourceLabel(source) {
    if (SOURCE_LABELS[source]) return SOURCE_LABELS[source];
    if (source && source.indexOf('dependency:') === 0) {
        return '依赖包';
    }
    return source || '未知';
}

/**
 * 判断连接点是否只读（不可编辑/不可删除）
 * @param {{editable: boolean}} item - 连接点列表项
 * @returns {boolean} 只读返回 true
 */
function _isReadOnly(item) {
    return !item || !item.editable;
}

/**
 * 构建连接点列表的 HTML 表格
 * @param {Array<{id: string, data: Object, source: string, editable: boolean}>} items - 连接点列表
 * @returns {string} HTML 表格字符串
 */
function _buildConnectorListHtml(items) {
    if (!items || items.length === 0) {
        return '<p style="color:#888;text-align:center;padding:12px 0">（暂无连接点定义）</p>';
    }

    var rows = '';
    var i, item, data, typeLabel, dirLabel, sourceLabel, readonlyBadge;

    for (i = 0; i < items.length; i++) {
        item = items[i];
        data = item.data || {};
        typeLabel = _getConnectorTypeLabel(data.type);
        dirLabel = _getDirectionLabel(data.direction);
        sourceLabel = _getSourceLabel(item.source);
        readonlyBadge = _isReadOnly(item)
            ? ' <span style="color:#999;font-size:10px">[只读]</span>'
            : '';

        rows += '<tr>' +
            '<td style="padding:4px 8px;border-bottom:1px solid #333;font-family:monospace;font-size:12px">' +
            item.id + readonlyBadge + '</td>' +
            '<td style="padding:4px 8px;border-bottom:1px solid #333;font-size:12px">' + typeLabel + '</td>' +
            '<td style="padding:4px 8px;border-bottom:1px solid #333;font-size:12px">' + dirLabel + '</td>' +
            '<td style="padding:4px 8px;border-bottom:1px solid #333;font-size:11px;color:#888">' + sourceLabel + '</td>' +
            '</tr>';
    }

    return '<table style="width:100%;border-collapse:collapse">' +
        '<thead><tr>' +
        '<th style="padding:4px 8px;border-bottom:2px solid #555;text-align:left;font-size:11px;color:#aaa">ID</th>' +
        '<th style="padding:4px 8px;border-bottom:2px solid #555;text-align:left;font-size:11px;color:#aaa">类型</th>' +
        '<th style="padding:4px 8px;border-bottom:2px solid #555;text-align:left;font-size:11px;color:#aaa">方向</th>' +
        '<th style="padding:4px 8px;border-bottom:2px solid #555;text-align:left;font-size:11px;color:#aaa">来源</th>' +
        '</tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
        '</table>';
}

/**
 * 构建连接点字段的默认数据
 * @returns {Object} 默认数据对象
 */
function _getDefaultConnectorData() {
    return {
        type: 'Simple',
        direction: 'xp',
        integrity: 1.0,
        damage_reduction: 0.0,
        damage_multiplier: 1.0,
        damage_absorption: 0.0,
    };
}

/**
 * 从 formData 提取连接点定义数据（不含 id）
 * @param {Object} formData - 对话框表单数据
 * @returns {Object} 连接点数据对象
 */
function _extractConnectorData(formData) {
    return {
        type: formData.connType || 'Simple',
        direction: formData.connDirection || 'xp',
        integrity: parseFloat(formData.connIntegrity) || 0,
        damage_reduction: parseFloat(formData.connDamageReduction) || 0,
        damage_multiplier: parseFloat(formData.connDamageMultiplier) || 0,
        damage_absorption: parseFloat(formData.connDamageAbsorption) || 0,
    };
}

// =============================================================================
// 创建/编辑对话框
// =============================================================================

/**
 * 显示创建或编辑连接点的子对话框
 *
 * 当 existingId 为 null/undefined 时进入创建模式；
 * 当 existingId 有值时进入编辑模式（预填现有数据）。
 *
 * @param {Object} config - MM 项目配置
 * @param {string|null} existingId - 要编辑的连接点 ID，null 表示新建
 * @param {Object|null} existingData - 现有连接点定义数据
 * @param {Function} onSaved - 保存成功回调
 */
function _showConnectorEditDialog(config, existingId, existingData, onSaved) {
    var isEdit = !!existingId;
    var defaultData = existingData || _getDefaultConnectorData();

    try {
        new Dialog({
            id: isEdit ? 'mm_connector_edit' : 'mm_connector_create',
            title: isEdit ? '编辑连接点定义' : '创建新连接点定义',
            width: 460,
            form: {
                connId: {
                    type: 'text',
                    label: '连接点 ID',
                    value: existingId || '',
                    description: '格式：namespace:name。新建时请使用小写字母、数字、_ - . / :',
                },
                connType: {
                    type: 'select',
                    label: '连接类型',
                    options: {
                        Simple: 'Simple（简单）',
                        Advanced: 'Advanced（高级）',
                    },
                    value: defaultData.type || 'Simple',
                    description: 'Simple=刚性无关节，Advanced=支持物理关节参数',
                },
                connDirection: {
                    type: 'select',
                    label: '连接方向',
                    options: {
                        xp: 'X+（东）',
                        yp: 'Y+（上）',
                        zp: 'Z+（南）',
                        xn: 'X-（西）',
                        yn: 'Y-（下）',
                        zn: 'Z-（北）',
                    },
                    value: defaultData.direction || 'xp',
                    description: '连接点的朝向，与零件碰撞箱相对位置有关',
                },
                connIntegrity: {
                    type: 'number',
                    label: '结构完整性（integrity）',
                    value: defaultData.integrity !== undefined ? defaultData.integrity : 1.0,
                    description: '连接的结构强度，0=极弱，1=标准',
                },
                connDamageReduction: {
                    type: 'number',
                    label: '伤害减免（damage_reduction）',
                    value: defaultData.damage_reduction !== undefined ? defaultData.damage_reduction : 0.0,
                    description: '通过此连接传输的伤害减免比例，0.0=无减免',
                },
                connDamageMultiplier: {
                    type: 'number',
                    label: '伤害倍率（damage_multiplier）',
                    value: defaultData.damage_multiplier !== undefined ? defaultData.damage_multiplier : 1.0,
                    description: '通过此连接传输的伤害倍率，1.0=标准倍率',
                },
                connDamageAbsorption: {
                    type: 'number',
                    label: '伤害吸收（damage_absorption）',
                    value: defaultData.damage_absorption !== undefined ? defaultData.damage_absorption : 0.0,
                    description: '连接本身能吸收的伤害量，超过后连接断裂',
                },
                infoAdvanced: {
                    type: 'info',
                    text: '<span style="color:#888;font-size:11px">' +
                        '提示：连接关节（joints）和标签（tags）等高级字段将在后续版本中提供。' +
                        '</span>',
                },
            },
            onConfirm: function (formData) {
                // ---- 校验 ----
                var id = formData.connId ? formData.connId.trim() : '';
                if (!id) {
                    showToast('请输入连接点 ID', 'error');
                    return false;
                }

                var data = _extractConnectorData(formData);

                try {
                    if (isEdit) {
                        connector_manager.updateConnector(config, id, data);
                        showToast('连接点 "' + id + '" 已更新', 'positive');
                        log.info('connector_dialog: 已更新连接点 "' + id + '"');
                    } else {
                        connector_manager.createConnector(config, id, data);
                        showToast('连接点 "' + id + '" 已创建', 'positive');
                        log.info('connector_dialog: 已创建连接点 "' + id + '"');
                    }

                    if (typeof onSaved === 'function') onSaved(config);
                    this.hide();
                } catch (e) {
                    showToast('操作失败: ' + (e.message || e), 'error');
                    log.error('connector_dialog: 保存连接点失败', e);
                    return false;
                }
            },
        }).show();
    } catch (e) {
        log.error('connector_dialog: ' + (isEdit ? '编辑' : '创建') + '对话框打开失败', e);
        showToast('无法打开连接点编辑对话框: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// 确认删除对话框
// =============================================================================

/**
 * 显示删除确认对话框
 *
 * @param {Object} config - MM 项目配置
 * @param {string} id - 要删除的连接点 ID
 * @param {Function} onSaved - 删除成功回调
 */
function _showConnectorDeleteConfirm(config, id, onSaved) {
    try {
        new Dialog({
            id: 'mm_connector_delete',
            title: '删除连接点定义',
            width: 400,
            form: {
                confirmInfo: {
                    type: 'info',
                    text: '<span style="color:#e74c3c">确定要删除连接点 "<code>' + id + '</code>" 吗？</span>' +
                        '<br><br>此操作不可撤销。',
                },
                confirm: {
                    type: 'checkbox',
                    label: '我确认要删除此连接点',
                    value: false,
                },
            },
            onConfirm: function (formData) {
                if (!formData.confirm) {
                    showToast('请先勾选确认框', 'warning');
                    return false;
                }

                try {
                    connector_manager.deleteConnector(config, id);
                    showToast('连接点 "' + id + '" 已删除', 'positive');
                    log.info('connector_dialog: 已删除连接点 "' + id + '"');

                    if (typeof onSaved === 'function') onSaved(config);
                    this.hide();
                } catch (e) {
                    showToast('删除失败: ' + (e.message || e), 'error');
                    log.error('connector_dialog: 删除连接点失败', e);
                    return false;
                }
            },
        }).show();
    } catch (e) {
        log.error('connector_dialog: 删除对话框打开失败', e);
        showToast('无法打开删除对话框: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// 连接点管理器主对话框
// =============================================================================

/**
 * 显示连接点管理器主对话框
 *
 * 以列表形式展示所有已定义连接点，支持创建、编辑、删除操作。
 * 内置/依赖包的连接点显示为只读，不可编辑或删除。
 *
 * @param {Object} config - MM 项目配置
 */
function showConnectorManagerDialog(config) {
    if (!_isConfigValid(config)) {
        showToast('配置不可用，请先打开项目', 'warning');
        return;
    }

    var connectors = connector_manager.listConnectors(config);
    var listHtml = _buildConnectorListHtml(connectors);
    var hasContentPack = _hasContentPack(config);

    try {
        new Dialog({
            id: 'mm_connector_manager',
            title: '连接点定义管理',
            width: 640,
            form: {
                connectorList: {
                    type: 'info',
                    text: '<b>已定义的连接点：</b><br><br>' + listHtml +
                        '<br><span style="color:#888;font-size:11px">' +
                        '提示：连接点定义零件之间的连接规则。连接方向决定零件在哪个面可以与其他零件对接。' +
                        '</span>',
                },
                action: {
                    type: 'select',
                    label: '选择操作',
                    options: {
                        create: '创建新连接点',
                        edit: '编辑已有连接点',
                        delete: '删除连接点',
                    },
                    value: 'create',
                },
                connectorId: {
                    type: 'text',
                    label: '连接点 ID（编辑/删除时填写）',
                    value: '',
                    description: '选择编辑或删除操作时，在此输入目标连接点的完整 ID',
                },
            },
            onConfirm: function (formData) {
                var action = formData.action;
                var connId = formData.connectorId ? formData.connectorId.trim() : '';
                var editItem, delItem, i;

                this.hide();

                try {
                    if (action === 'create') {
                        if (!hasContentPack) {
                            showToast('请先关联内容包，再创建连接点', 'warning');
                            return;
                        }
                        _showConnectorEditDialog(config, null, null, function () {
                            showConnectorManagerDialog(config);
                        });

                    } else if (action === 'edit') {
                        if (!connId) {
                            showToast('请填写要编辑的连接点 ID', 'warning');
                            return;
                        }
                        if (!hasContentPack) {
                            showToast('没有关联内容包，无法编辑', 'warning');
                            return;
                        }

                        // 查找连接点定义
                        editItem = null;
                        for (i = 0; i < connectors.length; i++) {
                            if (connectors[i].id === connId) {
                                editItem = connectors[i];
                                break;
                            }
                        }

                        if (!editItem) {
                            showToast('未找到连接点 "' + connId + '"', 'error');
                            return;
                        }

                        if (_isReadOnly(editItem)) {
                            showToast('不能编辑内置或依赖包中的连接点', 'warning');
                            return;
                        }

                        _showConnectorEditDialog(config, connId, editItem.data, function () {
                            showConnectorManagerDialog(config);
                        });

                    } else if (action === 'delete') {
                        if (!connId) {
                            showToast('请填写要删除的连接点 ID', 'warning');
                            return;
                        }
                        if (!hasContentPack) {
                            showToast('没有关联内容包，无法删除', 'warning');
                            return;
                        }

                        // 检查连接点是否存在且可编辑
                        delItem = null;
                        for (i = 0; i < connectors.length; i++) {
                            if (connectors[i].id === connId) {
                                delItem = connectors[i];
                                break;
                            }
                        }

                        if (!delItem) {
                            showToast('未找到连接点 "' + connId + '"', 'error');
                            return;
                        }

                        if (_isReadOnly(delItem)) {
                            showToast('不能删除内置或依赖包中的连接点', 'warning');
                            return;
                        }

                        _showConnectorDeleteConfirm(config, connId, function () {
                            showConnectorManagerDialog(config);
                        });
                    }
                } catch (e) {
                    log.error('connector_dialog: 操作失败', e);
                    showToast('操作失败: ' + (e.message || e), 'error');
                }
            },
        }).show();
    } catch (e) {
        log.error('connector_dialog: 主对话框打开失败', e);
        showToast('无法打开连接点管理器: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showConnectorManagerDialog,
    };
}
