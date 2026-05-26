/**
 * control_group_dialog.js — 控制组预设只读查看对话框
 *
 * 使用 Blockbench Dialog API 显示所有可用控制组预设的列表，
 * 选中后可查看详情（名称、control_mode、各 targets 映射、bindings 列表）。
 * 仅提供查看功能，不提供 CRUD 操作。
 *
 * 依赖:
 *   - control_group_manager.js（只读数据源）
 */

const control_group_manager = require('../../managers/control_group_manager.js');
const { createLogger } = require('../../utils/logger.js');

/** 模块日志 */
var log = createLogger('ControlGroupDialog');

/**
 * 转义 HTML 特殊字符，防止 XSS
 * @param {string} text
 * @returns {string}
 */
function _escapeHtml(text) {
    if (typeof text !== 'string') return String(text || '');
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * 渲染目标映射为 HTML 表格行
 * @param {Object} targets - 目标映射对象
 * @returns {string} HTML 片段
 */
function _renderTargets(targets) {
    if (!targets || Object.keys(targets).length === 0) {
        return '<span style="color:#666">（空）</span>';
    }
    var html = '<table style="width:100%;border-collapse:collapse;font-size:11px">';
    var keys = Object.keys(targets);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var vals = targets[key];
        html += '<tr><td style="padding:2px 6px;border:1px solid #444;font-weight:bold;width:140px">'
            + _escapeHtml(key) + '</td><td style="padding:2px 6px;border:1px solid #444">'
            + _escapeHtml(Array.isArray(vals) ? vals.join(', ') : String(vals)) + '</td></tr>';
    }
    html += '</table>';
    return html;
}

/**
 * 渲染绑定列表为 HTML
 * @param {Array} bindings - 绑定列表
 * @returns {string} HTML 片段
 */
function _renderBindings(bindings) {
    if (!bindings || bindings.length === 0) {
        return '<span style="color:#666">（无绑定）</span>';
    }
    var html = '<table style="width:100%;border-collapse:collapse;font-size:11px">'
        + '<tr><th style="padding:2px 6px;border:1px solid #444;text-align:left">触发键</th>'
        + '<th style="padding:2px 6px;border:1px solid #444;text-align:left">动作</th>'
        + '<th style="padding:2px 6px;border:1px solid #444;text-align:left">频道</th>'
        + '<th style="padding:2px 6px;border:1px solid #444;text-align:left">目标</th></tr>';
    for (var i = 0; i < bindings.length; i++) {
        var b = bindings[i];
        html += '<tr><td style="padding:2px 6px;border:1px solid #444">' + _escapeHtml(b.trigger || '')
            + '</td><td style="padding:2px 6px;border:1px solid #444">' + _escapeHtml(b.action || '')
            + '</td><td style="padding:2px 6px;border:1px solid #444">' + _escapeHtml(b.channel || '')
            + '</td><td style="padding:2px 6px;border:1px solid #444">'
            + _escapeHtml(Array.isArray(b.targets) ? b.targets.join(', ') : String(b.targets || ''))
            + '</td></tr>';
    }
    html += '</table>';
    return html;
}

/**
 * 渲染 guiActions 列表为 HTML
 * @param {Array} guiActions - GUI 交互元素列表
 * @returns {string} HTML 片段
 */
function _renderGuiActions(guiActions) {
    if (!guiActions || guiActions.length === 0) {
        return '<span style="color:#666">（无 GUI 交互元素）</span>';
    }
    var html = '<table style="width:100%;border-collapse:collapse;font-size:11px">'
        + '<tr><th style="padding:2px 6px;border:1px solid #444;text-align:left">标签</th>'
        + '<th style="padding:2px 6px;border:1px solid #444;text-align:left">类型</th>'
        + '<th style="padding:2px 6px;border:1px solid #444;text-align:left">频道</th>'
        + '<th style="padding:2px 6px;border:1px solid #444;text-align:left">目标</th></tr>';
    for (var i = 0; i < guiActions.length; i++) {
        var g = guiActions[i];
        var typeName = '未知';
        if (g.type === 'TOGGLE') typeName = '勾选框';
        else if (g.type === 'PULSE') typeName = '脉冲按钮';
        else if (g.type === 'SLIDER') typeName = '滑动条';
        html += '<tr><td style="padding:2px 6px;border:1px solid #444">' + _escapeHtml(g.label || '')
            + '</td><td style="padding:2px 6px;border:1px solid #444">' + typeName
            + '</td><td style="padding:2px 6px;border:1px solid #444">' + _escapeHtml(g.channel || '')
            + '</td><td style="padding:2px 6px;border:1px solid #444">'
            + _escapeHtml(Array.isArray(g.targets) ? g.targets.join(', ') : String(g.targets || ''))
            + '</td></tr>';
    }
    html += '</table>';
    return html;
}

/**
 * 构建控制组预设列表 HTML
 * @param {Array} presets - listControlGroups 返回的预设数组
 * @returns {string} HTML
 */
function _buildPresetListHtml(presets) {
    if (!presets || presets.length === 0) {
        return '<p style="color:#666;text-align:center;padding:20px">当前无可用控制组预设</p>';
    }

    var html = '<div style="max-height:400px;overflow-y:auto">';
    html += '<table style="width:100%;border-collapse:collapse;font-size:12px">';
    html += '<tr>'
        + '<th style="padding:6px;border:1px solid #444;text-align:left;width:30px"></th>'
        + '<th style="padding:6px;border:1px solid #444;text-align:left">预设 ID</th>'
        + '<th style="padding:6px;border:1px solid #444;text-align:left">控制模式</th>'
        + '<th style="padding:6px;border:1px solid #444;text-align:left">来源</th>'
        + '<th style="padding:6px;border:1px solid #444;text-align:center">绑定数</th>'
        + '</tr>';

    for (var i = 0; i < presets.length; i++) {
        var p = presets[i];
        var baseGroup = p.data && p.data.base_group;
        var mode = baseGroup ? baseGroup.control_mode : '?';
        var bindCount = baseGroup && baseGroup.bindings ? baseGroup.bindings.length : 0;
        var sourceLabel = p.source;
        if (sourceLabel === 'builtin') sourceLabel = '内置';
        else if (sourceLabel === 'current') sourceLabel = '当前包';
        else if (sourceLabel && sourceLabel.indexOf('dependency:') === 0) sourceLabel = '依赖包';
        html += '<tr data-mm-cg-row style="cursor:pointer">'
            + '<td style="padding:4px 6px;border:1px solid #444;text-align:center">'
            + '<input type="radio" name="mm_cg_select" value="' + i + '" data-index="' + i + '"></td>'
            + '<td style="padding:4px 6px;border:1px solid #444">' + _escapeHtml(p.id) + '</td>'
            + '<td style="padding:4px 6px;border:1px solid #444">' + _escapeHtml(mode) + '</td>'
            + '<td style="padding:4px 6px;border:1px solid #444">' + _escapeHtml(sourceLabel) + '</td>'
            + '<td style="padding:4px 6px;border:1px solid #444;text-align:center">' + bindCount + '</td>'
            + '</tr>';
    }

    html += '</table></div>';
    return html;
}

/**
 * 构建选中预设的详情 HTML
 * @param {Object} preset - 单个预设对象
 * @returns {string} HTML
 */
function _buildDetailHtml(preset) {
    if (!preset || !preset.data) {
        return '<p style="color:#666">请先选择一个预设</p>';
    }

    var bg = preset.data.base_group || {};
    var activeIndex = preset.data.active_index;
    var groups = preset.data.groups || [];
    var guiActions = preset.data.gui_actions || [];

    var html = '<div style="max-height:600px;overflow-y:auto;padding:8px">';

    // 标题
    html += '<h4 style="margin:0 0 8px 0;color:#ffa726">预设: ' + _escapeHtml(preset.id) + '</h4>';

    // 基本信息
    html += '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px">';
    html += '<tr><td style="padding:4px 8px;background:#2a2a2a;font-weight:bold;width:100px">名称</td>'
        + '<td style="padding:4px 8px">' + _escapeHtml(bg.name || 'base') + '</td></tr>';
    html += '<tr><td style="padding:4px 8px;background:#2a2a2a;font-weight:bold">控制模式</td>'
        + '<td style="padding:4px 8px">' + _escapeHtml(bg.control_mode || 'inherit') + '</td></tr>';
    html += '<tr><td style="padding:4px 8px;background:#2a2a2a;font-weight:bold">子组数</td>'
        + '<td style="padding:4px 8px">' + groups.length + '</td></tr>';
    html += '<tr><td style="padding:4px 8px;background:#2a2a2a;font-weight:bold">激活索引</td>'
        + '<td style="padding:4px 8px">' + (activeIndex !== undefined ? activeIndex : -1) + '</td></tr>';
    html += '</table>';

    // baseGroup targets
    html += '<h5 style="margin:8px 0 4px 0;color:#aaa">移动目标 (move_targets)</h5>';
    html += _renderTargets(bg.move_targets);

    html += '<h5 style="margin:8px 0 4px 0;color:#aaa">视角目标 (view_targets)</h5>';
    html += _renderTargets(bg.view_targets);

    html += '<h5 style="margin:8px 0 4px 0;color:#aaa">常规目标 (regular_targets)</h5>';
    html += _renderTargets(bg.regular_targets);

    // bindings
    html += '<h5 style="margin:8px 0 4px 0;color:#aaa">按键绑定 (bindings)</h5>';
    html += _renderBindings(bg.bindings);

    // guiActions
    html += '<h5 style="margin:8px 0 4px 0;color:#aaa">GUI 交互元素 (gui_actions)</h5>';
    html += _renderGuiActions(guiActions);

    // 子组列表（仅概要）
    if (groups.length > 0) {
        html += '<h5 style="margin:8px 0 4px 0;color:#aaa">子控制组 (' + groups.length + ' 个)</h5>';
        for (var gi = 0; gi < groups.length; gi++) {
            var sg = groups[gi];
            html += '<div style="margin:4px 0;padding:4px 8px;background:#2a2a2a;border-radius:3px;font-size:11px">'
                + '<b>#' + gi + '</b> ' + _escapeHtml(sg.name || 'unnamed')
                + ' &nbsp;|&nbsp; mode=' + _escapeHtml(sg.control_mode || 'inherit')
                + ' &nbsp;|&nbsp; 绑定=' + (sg.bindings ? sg.bindings.length : 0)
                + '</div>';
        }
    }

    html += '</div>';
    return html;
}

/**
 * 显示控制组预设管理器对话框（只读）
 *
 * 列表中显示所有可用的控制组预设，选中后可在详情区查看完整的
 * base_group（控制模式、目标映射、绑定列表）和子组概要。
 *
 * @param {Object} config - 项目配置对象
 */
function showControlGroupManagerDialog(config) {
    var presets = control_group_manager.listControlGroups(config);

    log.info('showControlGroupManagerDialog: 共 ' + presets.length + ' 个预设');

    try {
        new Dialog({
            title: 'MachineMax 控制组预设查看器',
            width: 800,
            height: 600,
            lines: [
                '<p style="margin:0 0 8px 0;color:#aaa;font-size:12px">'
                + '共 ' + presets.length + ' 个预设 · 选中一项后在下方面板查看详情'
                + '</p>',
                _buildPresetListHtml(presets),
                '<hr style="border-color:#444;margin:8px 0">',
                '<div id="mm_cg_detail" style="min-height:100px">'
                + '<p style="color:#666;text-align:center">请在上方列表中选择一个预设查看详情</p>'
                + '</div>',
            ],
            onConfirm: function () {
                this.hide();
            },
        }).show();

        // 为列表行绑定点击事件
        setTimeout(function () {
            var radios = document.querySelectorAll('[name="mm_cg_select"]');
            var detailDiv = document.getElementById('mm_cg_detail');
            if (!radios || !detailDiv) return;

            function onSelect(index) {
                var preset = presets[index];
                if (preset) {
                    detailDiv.innerHTML = _buildDetailHtml(preset);
                }
            }

            for (var i = 0; i < radios.length; i++) {
                radios[i].addEventListener('change', function () {
                    var idx = parseInt(this.getAttribute('data-index'), 10);
                    onSelect(idx);
                });
            }

            // 点击行也触发放射按钮选中
            var rows = document.querySelectorAll('[data-mm-cg-row]');
            for (var j = 0; j < rows.length; j++) {
                (function (rowIdx) {
                    rows[j].addEventListener('click', function () {
                        var radio = this.querySelector('[name="mm_cg_select"]');
                        if (radio) {
                            radio.checked = true;
                            radio.dispatchEvent(new Event('change'));
                        }
                    });
                })(j);
            }
        }, 100);
    } catch (e) {
        log.error('showControlGroupManagerDialog: 创建失败', e);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showControlGroupManagerDialog,
    };
}
