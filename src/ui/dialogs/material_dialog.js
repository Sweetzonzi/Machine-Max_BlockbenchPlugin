/**
 * material_dialog.js — 材料管理对话框
 *
 * 提供材料定义的列表浏览、编辑、新建和删除功能。
 * 使用 Blockbench 原生 Dialog API，不依赖 Vue。
 * 内置包和依赖包中的材料为只读，仅当前包材料可编辑/删除。
 *
 * 导出函数:
 *   showMaterialManagerDialog(config) — 打开材料管理器主对话框
 */

const { createLogger } = require('../../utils/logger.js');
const { showToast } = require('../../utils/notify.js');
const material_manager = require('../../managers/material_manager.js');

/** 模块日志 */
var log = createLogger('MaterialDialog');

// =============================================================================
// 内部工具
// =============================================================================

/**
 * 将材料来源标识映射为中文显示标签
 * @param {string} source - 来源标识（'builtin' | 'current' | 'dependency:*'）
 * @returns {string} 中文标签
 */
function _sourceLabel(source) {
    if (source === 'builtin') return '内置';
    if (source && source.indexOf('dependency:') === 0) return '依赖';
    if (source === 'current') return '当前';
    return '未知';
}

/**
 * 获取来源对应的 CSS 颜色
 * @param {string} source - 来源标识
 * @returns {string} CSS 颜色值
 */
function _sourceColor(source) {
    if (source === 'builtin') return '#888';
    if (source && source.indexOf('dependency:') === 0) return '#2196F3';
    if (source === 'current') return '#4CAF50';
    return '#888';
}

/**
 * 构建材料列表的 HTML 表格
 * 为可编辑材料添加编辑/删除按钮，只读材料显示为灰色文本
 *
 * @param {Array<{id: string, data: Object, source: string, editable: boolean}>} materials - 材料列表
 * @returns {string} HTML 字符串
 */
function _buildMaterialListHtml(materials) {
    var i, m, sourceLabel, sourceColor, editable, editBtn, deleteBtn, rowColor;
    var rows = '';

    if (!materials || materials.length === 0) {
        return '<span style="color:#888;font-style:italic">（暂无材料定义）</span>';
    }

    for (i = 0; i < materials.length; i++) {
        m = materials[i];
        sourceLabel = _sourceLabel(m.source);
        sourceColor = _sourceColor(m.source);
        editable = m.editable;

        editBtn = editable
            ? '<button class="mm_mat_edit" data-id="' + m.id + '" style="padding:2px 8px;margin:0 2px;cursor:pointer;border:1px solid #4CAF50;border-radius:3px;background:transparent;color:#4CAF50;font-size:12px">编辑</button>'
            : '<span style="color:#888;font-size:12px;margin:0 4px">（只读）</span>';

        deleteBtn = editable
            ? '<button class="mm_mat_delete" data-id="' + m.id + '" style="padding:2px 8px;margin:0 2px;cursor:pointer;border:1px solid #F44336;border-radius:3px;background:transparent;color:#F44336;font-size:12px">删除</button>'
            : '';

        rowColor = editable ? '#fff' : '#999';

        rows += '<tr style="border-bottom:1px solid #333">'
            + '<td style="padding:6px 8px;color:' + rowColor + ';font-family:monospace;font-size:13px">' + _escapeHtml(m.id) + '</td>'
            + '<td style="padding:6px 8px"><span style="display:inline-block;padding:1px 6px;border-radius:3px;font-size:11px;color:' + sourceColor + ';border:1px solid ' + sourceColor + '">' + sourceLabel + '</span></td>'
            + '<td style="padding:6px 8px;text-align:right;white-space:nowrap">' + editBtn + deleteBtn + '</td>'
            + '</tr>';
    }

    return '<table style="width:100%;border-collapse:collapse">'
        + '<thead><tr style="border-bottom:2px solid #555">'
        + '<th style="padding:6px 8px;text-align:left;font-size:12px;color:#aaa;font-weight:normal">材料 ID</th>'
        + '<th style="padding:6px 8px;text-align:left;font-size:12px;color:#aaa;font-weight:normal">来源</th>'
        + '<th style="padding:6px 8px;text-align:right;font-size:12px;color:#aaa;font-weight:normal">操作</th>'
        + '</tr></thead>'
        + '<tbody>' + rows + '</tbody>'
        + '</table>';
}

/**
 * 对 HTML 进行转义，防止 XSS
 * @param {string} str - 原始字符串
 * @returns {string} 转义后的字符串
 */
function _escapeHtml(str) {
    if (typeof str !== 'string') return String(str || '');
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/**
 * 从材料数据中安全获取数值
 * @param {Object} data - 材料定义数据
 * @param {string} field - 字段名
 * @param {*} fallback - 默认值
 * @returns {*} 数值或默认值
 */
function _getField(data, field, fallback) {
    if (data && typeof data[field] !== 'undefined' && data[field] !== null) {
        return data[field];
    }
    return fallback;
}

/**
 * 验证表单中 friction 三个分量是否有效
 * @param {number} fx - X 分量
 * @param {number} fy - Y 分量
 * @param {number} fz - Z 分量
 * @returns {boolean} 全部有效返回 true
 */
function _validateFriction(fx, fy, fz) {
    return !Number.isNaN(fx) && Number.isFinite(fx) && fx >= 0
        && !Number.isNaN(fy) && Number.isFinite(fy) && fy >= 0
        && !Number.isNaN(fz) && Number.isFinite(fz) && fz >= 0;
}

// =============================================================================
// 编辑 / 新建对话框
// =============================================================================

/**
 * 显示材料编辑对话框（新建或编辑已有材料）
 *
 * 新建模式显示 ID 输入框，编辑模式 ID 以只读方式展示。
 * 表单包含 friction（3 分量）、restitution、density、armor_thickness 字段。
 *
 * @param {Object} config - 项目配置对象
 * @param {string|null} materialId - 材料 ID（null 表示新建）
 * @param {Object|null} materialData - 已有材料数据（新建时为 null）
 * @param {boolean} isNew - 是否为新建模式
 */
function _showEditDialog(config, materialId, materialData, isNew) {
    var friction = _getField(materialData, 'friction', [0.5, 0.5, 0.5]);

    var formFields = {};

    // 材料 ID
    if (isNew) {
        formFields.newMaterialId = {
            type: 'text',
            label: '材料 ID',
            value: '',
            description: '材料标识符，如 machine_max:steel',
        };
    } else {
        formFields.materialIdDisplay = {
            type: 'info',
            text: '<b>材料 ID：</b><code>' + _escapeHtml(materialId) + '</code>',
        };
    }

    formFields.frictionInfo = {
        type: 'info',
        text: '<span style="color:#aaa;font-size:11px">摩擦系数向量 [x, y, z]，各分量 ≥ 0</span>',
    };

    // 摩擦系数三个分量
    formFields.friction_x = {
        type: 'number',
        label: '摩擦系数 X',
        value: friction[0] !== undefined ? friction[0] : 0.5,
        hint: '侧向摩擦系数',
    };
    formFields.friction_y = {
        type: 'number',
        label: '摩擦系数 Y',
        value: friction[1] !== undefined ? friction[1] : 0.5,
        hint: '前向摩擦系数',
    };
    formFields.friction_z = {
        type: 'number',
        label: '摩擦系数 Z',
        value: friction[2] !== undefined ? friction[2] : 0.5,
        hint: '垂直摩擦系数',
    };

    formFields.restitution = {
        type: 'number',
        label: '恢复系数',
        value: _getField(materialData, 'restitution', 0.1),
        hint: '0.0（完全非弹性）~ 1.0（完全弹性）',
    };

    formFields.density = {
        type: 'number',
        label: '密度',
        value: _getField(materialData, 'density', 1.0),
        hint: '材料密度值',
    };

    formFields.armor_thickness = {
        type: 'number',
        label: '装甲厚度',
        value: _getField(materialData, 'armor_thickness', 1.0),
        hint: '等效装甲厚度系数',
    };

    new Dialog({
        id: isNew ? 'mm_material_create' : 'mm_material_edit',
        title: isNew ? '新建材料' : '编辑材料 — ' + materialId,
        width: 480,
        form: formFields,
        onConfirm: function (formData) {
            var id = isNew ? (formData.newMaterialId || '').trim() : materialId;

            if (isNew && !id) {
                showToast('请输入材料 ID', 'error');
                return false;
            }

            // 解析 friction 三个分量
            var fx = parseFloat(formData.friction_x);
            var fy = parseFloat(formData.friction_y);
            var fz = parseFloat(formData.friction_z);

            if (!_validateFriction(fx, fy, fz)) {
                showToast('摩擦系数各分量必须为 ≥ 0 的有效数字', 'error');
                return false;
            }

            var restitution = parseFloat(formData.restitution);
            if (Number.isNaN(restitution) || restitution < 0 || restitution > 1) {
                showToast('恢复系数必须在 0.0 ~ 1.0 之间', 'error');
                return false;
            }

            var density = parseFloat(formData.density);
            if (Number.isNaN(density) || density < 0) {
                showToast('密度必须为 ≥ 0 的有效数字', 'error');
                return false;
            }

            var armorThickness = parseFloat(formData.armor_thickness);
            if (Number.isNaN(armorThickness) || armorThickness < 0) {
                showToast('装甲厚度必须为 ≥ 0 的有效数字', 'error');
                return false;
            }

            var data = {
                friction: [fx, fy, fz],
                restitution: restitution,
                density: density,
                armor_thickness: armorThickness,
            };

            try {
                if (isNew) {
                    material_manager.createMaterial(config, id, data);
                    showToast('材料 "' + id + '" 已创建', 'positive');
                    log.info('材料已创建', { id: id, data: data });
                } else {
                    material_manager.updateMaterial(config, id, data);
                    showToast('材料 "' + id + '" 已更新', 'positive');
                    log.info('材料已更新', { id: id, data: data });
                }
                this.hide();
                // 关闭编辑对话框后重新打开列表对话框以刷新
                showMaterialManagerDialog(config);
            } catch (e) {
                showToast('操作失败: ' + (e.message || e), 'error');
                log.error('材料保存失败', e);
                return false;
            }
        },
    }).show();
}

// =============================================================================
// 删除确认对话框
// =============================================================================

/**
 * 显示删除确认对话框并执行删除
 *
 * @param {Object} config - 项目配置对象
 * @param {string} materialId - 要删除的材料 ID
 */
function _deleteWithConfirm(config, materialId) {
    new Dialog({
        id: 'mm_material_delete_confirm',
        title: '确认删除',
        form: {
            confirmInfo: {
                type: 'info',
                text: '确认删除材料 "<b>' + _escapeHtml(materialId) + '</b>" 吗？<br><br>'
                    + '此操作不可撤销！',
            },
        },
        onConfirm: function () {
            try {
                material_manager.deleteMaterial(config, materialId);
                showToast('材料 "' + materialId + '" 已删除', 'warning');
                log.info('材料已删除', { id: materialId });
                this.hide();
                // 重新打开列表对话框以刷新
                showMaterialManagerDialog(config);
            } catch (e) {
                showToast('删除失败: ' + (e.message || e), 'error');
                log.error('材料删除失败', e);
                return false;
            }
        },
    }).show();
}

// =============================================================================
// 材料管理器主对话框（列表模式）
// =============================================================================

/**
 * 显示材料管理器主对话框
 *
 * 以表格形式展示所有材料定义（含来源标签），并为当前包中的可编辑材料
 * 提供编辑和删除按钮。
 * - 内置材料：只读，显示为灰色，无操作按钮
 * - 依赖材料：只读，显示为蓝色标签，无操作按钮
 * - 当前包材料：可编辑，显示为绿色标签，有编辑/删除按钮
 *
 * @param {Object} config - 项目配置对象
 */
function showMaterialManagerDialog(config) {
    var materials, listHtml, builtinCount, depCount, currentCount, i, infoText;
    var materialOptions = {};

    if (!config || typeof config !== 'object') {
        showToast('配置不可用，请先打开项目', 'warning');
        return;
    }

    try {
        materials = material_manager.listMaterials(config);
        listHtml = _buildMaterialListHtml(materials);

        // 统计各来源材料数量
        builtinCount = 0;
        depCount = 0;
        currentCount = 0;
        for (i = 0; i < materials.length; i++) {
            if (materials[i].source === 'builtin') builtinCount++;
            else if (materials[i].source && materials[i].source.indexOf('dependency:') === 0) depCount++;
            else if (materials[i].source === 'current') currentCount++;
        }

        // 构建材料选择选项
        for (i = 0; i < materials.length; i++) {
            materialOptions[materials[i].id] = materials[i].id + ' (' + _sourceLabel(materials[i].source) + ')';
        }

        infoText = '<div style="font-size:11px;color:#888;margin-bottom:4px">'
            + '<span style="display:inline-block;margin-right:12px"><span style="color:#888">●</span> 内置: ' + builtinCount + '</span>'
            + '<span style="display:inline-block;margin-right:12px"><span style="color:#2196F3">●</span> 依赖: ' + depCount + '</span>'
            + '<span style="display:inline-block;margin-right:12px"><span style="color:#4CAF50">●</span> 当前: ' + currentCount + '</span>'
            + '</div>';

        new Dialog({
            id: 'mm_material_manager',
            title: '材料管理器',
            width: 640,
            form: {
                stats: {
                    type: 'info',
                    text: infoText,
                },
                materialList: {
                    type: 'info',
                    text: listHtml,
                },
                readOnlyNote: {
                    type: 'info',
                    text: '<span style="color:#888;font-size:11px">'
                        + '内置和依赖包中的材料为只读，不可编辑或删除。'
                        + '仅有当前包（来源标记为"当前"）的材料可编辑。'
                        + '</span>',
                },
                action: {
                    type: 'select',
                    label: '操作',
                    options: {
                        add: '新建材料',
                        edit: '编辑已有材料',
                        delete: '删除材料',
                    },
                    value: 'add',
                },
                materialSelect: {
                    type: 'select',
                    label: '选择材料',
                    options: materialOptions,
                    value: '',
                    description: '选择要编辑或删除的材料（新建操作不需要选择）',
                },
            },
            onConfirm: function (formData) {
                var action = formData.action;
                var selectedId = formData.materialSelect;
                var selectedMat, mi;

                if (action === 'add') {
                    _showEditDialog(config, null, null, true);
                    this.hide();
                    return;
                }

                if (!selectedId) {
                    showToast('请选择一个材料', 'error');
                    return false;
                }

                // 查找选中材料的 editable 状态和数据
                selectedMat = null;
                for (mi = 0; mi < materials.length; mi++) {
                    if (materials[mi].id === selectedId) {
                        selectedMat = materials[mi];
                        break;
                    }
                }

                if (!selectedMat) {
                    showToast('材料 "' + selectedId + '" 未找到', 'error');
                    return false;
                }

                if (action === 'edit') {
                    if (!selectedMat.editable) {
                        showToast('不能编辑内置或依赖包中的材料', 'warning');
                        return false;
                    }
                    _showEditDialog(config, selectedId, selectedMat.data, false);
                    this.hide();
                } else if (action === 'delete') {
                    if (!selectedMat.editable) {
                        showToast('不能删除内置或依赖包中的材料', 'warning');
                        return false;
                    }
                    _deleteWithConfirm(config, selectedId);
                    this.hide();
                }
            },
        }).show();
    } catch (e) {
        log.error('showMaterialManagerDialog 失败', e);
        showToast('无法打开材料管理器: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showMaterialManagerDialog,
    };
}
