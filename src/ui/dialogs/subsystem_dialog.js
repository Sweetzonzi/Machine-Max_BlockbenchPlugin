/**
 * subsystem_dialog.js — 子系统型号管理对话框
 *
 * 提供创建、编辑、删除子系统型号（Subsystem Definition）的对话框。
 * 使用 Blockbench 原生 Dialog API，不依赖 Vue。
 *
 * 导出函数:
 *   showSubsystemManagerDialog(config) — 子系统管理主入口
 */

const subsystem_manager = require('../../managers/subsystem_manager.js');
const { showToast } = require('../../utils/notify.js');
const { createLogger } = require('../../utils/logger.js');

/** 模块日志 */
var log = createLogger('SubsystemDialog');

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
 * 获取子系统类型的中文显示名称（含英文标识）
 * @param {string} typeId - 子系统类型 ID，如 "machine_max:engine"
 * @returns {string} 可读的类型显示名
 */
function _getTypeDisplayName(typeId) {
    var map = {
        'machine_max:engine': '引擎 (Engine)',
        'machine_max:motor': '电机 (Motor)',
        'machine_max:gearbox': '变速箱 (Gearbox)',
        'machine_max:wheel_driver': '轮毂电机 (Wheel Driver)',
        'machine_max:seat': '座椅 (Seat)',
        'machine_max:car_controller': '轿车控制器 (Car Controller)',
        'machine_max:motorbike_controller': '摩托控制器 (Motorbike Controller)',
        'machine_max:transmission': '分动器 (Transmission)',
        'machine_max:lighting': '车灯 (Lighting)',
        'machine_max:item_storage': '货箱 (Item Storage)',
        'machine_max:motor_controller': '电机控制器 (Motor Controller)',
        'machine_max:basic': '基础 (Basic)',
        'machine_max:battery': '电池 (Battery)',
        'machine_max:joint': '关节 (Joint)',
        'machine_max:signal_convert': '信号转换器 (Signal Convert)',
        'machine_max:camera': '摄像头 (Camera)',
        'machine_max:javascript': '脚本 (JavaScript)',
        'machine_max:turret': '炮塔 (Turret)',
        'machine_max:fire_controller': '射击控制器 (Fire Controller)',
        'machine_max:launcher': '发射器 (Launcher)',
    };
    return map[typeId] || typeId;
}

/**
 * 获取来源的中文显示名
 * @param {string} source - 来源标识（current / builtin / dependency:N）
 * @returns {string} 可读的来源显示名
 */
function _getSourceLabel(source) {
    if (source === 'current') return '当前包';
    if (source === 'builtin') return '内置';
    if (source && source.indexOf('dependency:') === 0) return '依赖包';
    return source || '未知';
}

/**
 * HTML 字符串转义，防止 XSS
 * @param {*} str - 任意输入
 * @returns {string} 转义后的 HTML 安全字符串
 */
function _escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * 构建子系统列表的 HTML 表格（用于 info 字段显示）
 *
 * 包含 ID、类型、来源三列。非可编辑项显示 🔒 标记。
 *
 * @param {Array<{id: string, data: Object, source: string, editable: boolean}>} subsystems
 * @returns {string} HTML 表格字符串
 */
function _buildSubsystemListHtml(subsystems) {
    if (!subsystems || subsystems.length === 0) {
        return '<p style="color:#888;font-style:italic">暂无子系统定义。点击"创建新子系统型号"添加第一个。</p>';
    }

    var html = '<div style="max-height:200px;overflow-y:auto">' +
        '<table style="width:100%;border-collapse:collapse;font-size:12px">' +
        '<thead><tr style="background:#eaeaea">' +
        '<th style="padding:3px 6px;text-align:left;border-bottom:1px solid #ccc">ID</th>' +
        '<th style="padding:3px 6px;text-align:left;border-bottom:1px solid #ccc">类型</th>' +
        '<th style="padding:3px 6px;text-align:left;border-bottom:1px solid #ccc">来源</th>' +
        '</tr></thead><tbody>';

    var i, sub, typeLabel, sourceLabel, lockIcon;

    for (i = 0; i < subsystems.length; i++) {
        sub = subsystems[i];
        typeLabel = _getTypeDisplayName(sub.data && sub.data.type);
        sourceLabel = _getSourceLabel(sub.source);
        lockIcon = sub.editable ? '' : ' 🔒';

        html += '<tr>' +
            '<td style="padding:3px 6px;border-bottom:1px solid #eee;word-break:break-all">' +
            _escapeHtml(sub.id) + lockIcon + '</td>' +
            '<td style="padding:3px 6px;border-bottom:1px solid #eee">' + typeLabel + '</td>' +
            '<td style="padding:3px 6px;border-bottom:1px solid #eee">' + sourceLabel + '</td>' +
            '</tr>';
    }

    html += '</tbody></table></div>';
    return html;
}

/**
 * 构建子系统类型选项对象（用于 select 字段）
 *
 * 以 subsystem_manager.getSubsystemTypes() 的返回值为唯一真源。
 *
 * @returns {Object} select 字段 options 格式
 */
function _buildTypeOptions() {
    var types = subsystem_manager.getSubsystemTypes();
    var options = {};
    var i;
    for (i = 0; i < types.length; i++) {
        options[types[i]] = _getTypeDisplayName(types[i]);
    }
    return options;
}

/**
 * 构建可编辑子系统的选择选项（用于 edit / delete 选择器）
 *
 * 仅包含 editable === true 的子系统定义。
 *
 * @param {Array} subsystems - listSubsystems() 返回的数组
 * @returns {Object} select 字段 options 格式
 */
function _buildEditableOptions(subsystems) {
    var options = {};
    var i, sub;
    for (i = 0; i < subsystems.length; i++) {
        sub = subsystems[i];
        if (sub.editable) {
            options[sub.id] = sub.id + ' (' + _getTypeDisplayName(sub.data && sub.data.type) + ')';
        }
    }
    return options;
}

// =============================================================================
// 子系统类型选项（懒加载缓存）
// =============================================================================

var _typeOptions = null;

/**
 * 获取缓存的子系统类型选项
 * @returns {Object} select 字段 options 格式
 */
function _getTypeOptions() {
    if (!_typeOptions) {
        _typeOptions = _buildTypeOptions();
    }
    return _typeOptions;
}

// =============================================================================
// 创建子系统对话框
// =============================================================================

/**
 * 显示"创建新子系统型号"对话框
 *
 * 表单字段包括：子系统 ID、类型下拉框（20 种）、基础耐久度、传递伤害、
 * 限制伤害传递、隐藏显示。
 *
 * @param {Object} config - MM 项目配置
 */
function _showCreateDialog(config) {
    try {
        new Dialog({
            id: 'mm_subsystem_create',
            title: '创建新子系统型号',
            width: 480,
            form: {
                subsystemId: {
                    type: 'text',
                    label: '子系统 ID',
                    value: '',
                    description: '建议格式: namespace:name，仅限小写字母、数字、_ - . / :',
                },
                type: {
                    type: 'select',
                    label: '子系统类型',
                    options: _getTypeOptions(),
                    value: 'machine_max:basic',
                    description: '选择子系统功能类型',
                },
                basic_durability: {
                    type: 'number',
                    label: '基础耐久度',
                    value: 20.0,
                    description: '子系统基础耐久度，降至 0 时瘫痪（默认 20.0）',
                },
                pass_damage: {
                    type: 'checkbox',
                    label: '传递伤害',
                    value: true,
                    description: '若启用，子系统受到的伤害会传递给零件',
                },
                limit_damage: {
                    type: 'checkbox',
                    label: '限制伤害传递',
                    value: false,
                    description: '若启用，伤害传递值不超过子系统剩余耐久度',
                },
                hidden: {
                    type: 'checkbox',
                    label: '隐藏显示',
                    value: false,
                    description: '若启用，该子系统不会在 HUD 等处显示',
                },
            },
            onConfirm: function (formData) {
                var id = formData.subsystemId ? formData.subsystemId.trim() : '';
                if (!id) {
                    showToast('请输入子系统 ID', 'error');
                    return false;
                }

                var data = {
                    type: formData.type,
                    basic_durability: parseFloat(formData.basic_durability) || 20.0,
                    pass_damage: !!formData.pass_damage,
                    limit_damage: !!formData.limit_damage,
                    hidden: !!formData.hidden,
                };

                var result = subsystem_manager.createSubsystem(config, id, data);
                if (!result.success) {
                    showToast('创建失败: ' + (result.error || '未知错误'), 'error');
                    return false;
                }

                showToast('子系统型号 ' + id + ' 创建成功', 'positive');
                log.info('子系统型号创建成功', { id: id, type: data.type });
                this.hide();
            },
        }).show();
    } catch (e) {
        log.error('_showCreateDialog 失败', e);
        showToast('无法打开创建对话框: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// 编辑子系统对话框
// =============================================================================

/**
 * 显示"选择要编辑的子系统"对话框
 *
 * 只列出当前内容包中可编辑的子系统定义供选择。
 * 选择后跳转到编辑表单对话框。
 *
 * @param {Object} config - MM 项目配置
 */
function _showEditPickDialog(config) {
    var subsystems = subsystem_manager.listSubsystems(config);
    var editable = [];

    var i;
    for (i = 0; i < subsystems.length; i++) {
        if (subsystems[i].editable) {
            editable.push(subsystems[i]);
        }
    }

    if (editable.length === 0) {
        showToast('没有可编辑的子系统定义', 'warning');
        return;
    }

    try {
        new Dialog({
            id: 'mm_subsystem_edit_pick',
            title: '选择要编辑的子系统',
            width: 480,
            form: {
                subsystemId: {
                    type: 'select',
                    label: '子系统',
                    options: _buildEditableOptions(subsystems),
                    value: editable[0].id,
                    description: '选择要编辑的子系统型号',
                },
            },
            onConfirm: function (formData) {
                this.hide();
                _showEditFormDialog(config, formData.subsystemId);
            },
        }).show();
    } catch (e) {
        log.error('_showEditPickDialog 失败', e);
        showToast('无法打开选择对话框: ' + (e.message || e), 'error');
    }
}

/**
 * 显示"编辑子系统"表单对话框
 *
 * 表单预填现有数据，包括类型下拉框、基础耐久度、传递伤害、
 * 限制伤害传递、隐藏显示。
 *
 * @param {Object} config - MM 项目配置
 * @param {string} subsystemId - 要编辑的子系统定义 ID
 */
function _showEditFormDialog(config, subsystemId) {
    var subsystems = subsystem_manager.listSubsystems(config);
    var target = null;
    var i;

    for (i = 0; i < subsystems.length; i++) {
        if (subsystems[i].id === subsystemId) {
            target = subsystems[i];
            break;
        }
    }

    if (!target) {
        showToast('未找到子系统 ' + subsystemId, 'error');
        return;
    }

    if (!target.editable) {
        showToast('子系统 ' + subsystemId + ' 不可编辑（来自内置包或依赖包）', 'error');
        return;
    }

    var data = target.data || {};
    var currentType = data.type || 'machine_max:basic';

    try {
        new Dialog({
            id: 'mm_subsystem_edit_form',
            title: '编辑子系统: ' + subsystemId,
            width: 480,
            form: {
                type: {
                    type: 'select',
                    label: '子系统类型',
                    options: _getTypeOptions(),
                    value: currentType,
                    description: '更改类型会影响类型特有字段',
                },
                basic_durability: {
                    type: 'number',
                    label: '基础耐久度',
                    value: data.basic_durability !== undefined ? data.basic_durability : 20.0,
                    description: '子系统基础耐久度，降至 0 时瘫痪（默认 20.0）',
                },
                pass_damage: {
                    type: 'checkbox',
                    label: '传递伤害',
                    value: data.pass_damage !== false,
                    description: '若启用，子系统受到的伤害会传递给零件',
                },
                limit_damage: {
                    type: 'checkbox',
                    label: '限制伤害传递',
                    value: !!data.limit_damage,
                    description: '若启用，伤害传递值不超过子系统剩余耐久度',
                },
                hidden: {
                    type: 'checkbox',
                    label: '隐藏显示',
                    value: !!data.hidden,
                    description: '若启用，该子系统不会在 HUD 等处显示',
                },
            },
            onConfirm: function (formData) {
                var updatedData = {
                    type: formData.type,
                    basic_durability: parseFloat(formData.basic_durability) || 20.0,
                    pass_damage: !!formData.pass_damage,
                    limit_damage: !!formData.limit_damage,
                    hidden: !!formData.hidden,
                };

                var result = subsystem_manager.updateSubsystem(config, subsystemId, updatedData);
                if (!result.success) {
                    showToast('更新失败: ' + (result.error || '未知错误'), 'error');
                    return false;
                }

                showToast('子系统型号 ' + subsystemId + ' 已更新', 'positive');
                log.info('子系统型号已更新', { id: subsystemId, type: updatedData.type });
                this.hide();
            },
        }).show();
    } catch (e) {
        log.error('_showEditFormDialog 失败', e);
        showToast('无法打开编辑对话框: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// 删除子系统对话框
// =============================================================================

/**
 * 显示"选择要删除的子系统"对话框
 *
 * 只列出当前内容包中可编辑的子系统定义供选择。
 * 选择后跳转到确认删除对话框。
 *
 * @param {Object} config - MM 项目配置
 */
function _showDeletePickDialog(config) {
    var subsystems = subsystem_manager.listSubsystems(config);
    var editable = [];

    var i;
    for (i = 0; i < subsystems.length; i++) {
        if (subsystems[i].editable) {
            editable.push(subsystems[i]);
        }
    }

    if (editable.length === 0) {
        showToast('没有可删除的子系统定义', 'warning');
        return;
    }

    try {
        new Dialog({
            id: 'mm_subsystem_delete_pick',
            title: '选择要删除的子系统',
            width: 480,
            form: {
                subsystemId: {
                    type: 'select',
                    label: '子系统',
                    options: _buildEditableOptions(subsystems),
                    value: editable[0].id,
                    description: '选择要删除的子系统型号。此操作不可撤销！',
                },
            },
            onConfirm: function (formData) {
                this.hide();
                _showDeleteConfirmDialog(config, formData.subsystemId);
            },
        }).show();
    } catch (e) {
        log.error('_showDeletePickDialog 失败', e);
        showToast('无法打开选择对话框: ' + (e.message || e), 'error');
    }
}

/**
 * 显示"确认删除"对话框
 *
 * 显示要删除的子系统 ID 并提供最终确认按钮。
 * 确认后调用 subsystem_manager.deleteSubsystem()。
 *
 * @param {Object} config - MM 项目配置
 * @param {string} subsystemId - 要删除的子系统定义 ID
 */
function _showDeleteConfirmDialog(config, subsystemId) {
    try {
        new Dialog({
            id: 'mm_subsystem_delete_confirm',
            title: '确认删除',
            width: 420,
            form: {
                confirmText: {
                    type: 'info',
                    text: '确定要删除子系统型号 <b>' + _escapeHtml(subsystemId) + '</b> 吗？<br><br>' +
                        '<span style="color:#c00">此操作不可撤销！</span>',
                },
            },
            onConfirm: function () {
                var result = subsystem_manager.deleteSubsystem(config, subsystemId);
                if (!result.success) {
                    showToast('删除失败: ' + (result.error || '未知错误'), 'error');
                    return false;
                }

                showToast('子系统型号 ' + subsystemId + ' 已删除', 'positive');
                log.info('子系统型号已删除', { id: subsystemId });
                this.hide();
            },
        }).show();
    } catch (e) {
        log.error('_showDeleteConfirmDialog 失败', e);
        showToast('无法打开确认对话框: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// 主入口
// =============================================================================

/**
 * 显示子系统管理对话框
 *
 * 主对话框展示所有子系统定义的紧凑列表（含 ID、类型、来源三列），
 * 并提供创建、编辑、删除三种操作选择。
 *
 * 权限控制（与 material_dialog 相同模式）：
 *   - 列表中使用 🔒 标记不可编辑项
 *   - 编辑/删除操作仅显示当前包中可编辑的子系统
 *   - 创建操作始终可用（新定义写入当前包）
 *
 * @param {Object} config - MM 项目配置
 * @param {Function} [onSave] - 操作完成后的回调（可选）
 */
function showSubsystemManagerDialog(config, onSave) {
    if (!_isConfigValid(config)) {
        showToast('配置不可用，请先打开项目', 'warning');
        return;
    }

    var subsystems = subsystem_manager.listSubsystems(config);
    var listHtml = _buildSubsystemListHtml(subsystems);

    try {
        new Dialog({
            id: 'mm_subsystem_manager',
            title: '管理子系统型号',
            width: 560,
            form: {
                listInfo: {
                    type: 'info',
                    text: '<b>当前子系统型号列表</b><br><br>' + listHtml +
                        '<br><span style="color:#888;font-size:11px">🔒 表示来自内置包或依赖包，不可编辑或删除。</span>',
                },
                action: {
                    type: 'select',
                    label: '选择操作',
                    options: {
                        create: '创建新子系统型号',
                        edit: '编辑已有子系统型号',
                        delete: '删除子系统型号',
                    },
                    value: 'create',
                },
            },
            onConfirm: function (formData) {
                this.hide();
                try {
                    if (formData.action === 'create') {
                        _showCreateDialog(config);
                    } else if (formData.action === 'edit') {
                        _showEditPickDialog(config);
                    } else if (formData.action === 'delete') {
                        _showDeletePickDialog(config);
                    }
                } catch (e) {
                    log.error('执行操作失败', e);
                    showToast('操作失败: ' + (e.message || e), 'error');
                }

                // 操作完成后触发回调（无论成功/失败，让调用方自行判断）
                if (typeof onSave === 'function') {
                    onSave(config);
                }
            },
        }).show();
    } catch (e) {
        log.error('showSubsystemManagerDialog 失败', e);
        showToast('无法打开管理对话框: ' + (e.message || e), 'error');
    }
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showSubsystemManagerDialog,
    };
}
