/**
 * projectile_dialog.js — 投射物定义只读查看对话框
 *
 * 使用 Blockbench Dialog API 显示所有可用投射物定义的列表，
 * 选中后可查看其原始 JSON 数据。仅提供查看功能，不提供 CRUD 操作。
 *
 * 依赖:
 *   - projectile_manager.js（只读数据源）
 */

const projectile_manager = require('../../managers/projectile_manager.js');
const { createLogger } = require('../../utils/logger.js');

/** 模块日志 */
var log = createLogger('ProjectileDialog');

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
 * 构建投射物定义列表 HTML
 * @param {Array} projectiles - projectile_manager.listProjectiles 返回的数组
 * @returns {string} HTML
 */
function _buildProjectileListHtml(projectiles) {
    if (!projectiles || projectiles.length === 0) {
        return '<p style="color:#666;text-align:center;padding:20px">当前无可用投射物定义</p>';
    }

    var html = '<div style="max-height:300px;overflow-y:auto">';
    html += '<table style="width:100%;border-collapse:collapse;font-size:12px">';
    html += '<tr>'
        + '<th style="padding:6px;border:1px solid #444;text-align:left;width:30px"></th>'
        + '<th style="padding:6px;border:1px solid #444;text-align:left">投射物 ID</th>'
        + '<th style="padding:6px;border:1px solid #444;text-align:left">来源</th>'
        + '</tr>';

    for (var i = 0; i < projectiles.length; i++) {
        var p = projectiles[i];
        var sourceLabel = p.source;
        if (sourceLabel === 'builtin') sourceLabel = '内置';
        else if (sourceLabel === 'current') sourceLabel = '当前包';
        else if (sourceLabel && sourceLabel.indexOf('dependency:') === 0) sourceLabel = '依赖包';
        html += '<tr data-mm-proj-row style="cursor:pointer">'
            + '<td style="padding:4px 6px;border:1px solid #444;text-align:center">'
            + '<input type="radio" name="mm_proj_select" value="' + i + '" data-index="' + i + '"></td>'
            + '<td style="padding:4px 6px;border:1px solid #444">' + _escapeHtml(p.id) + '</td>'
            + '<td style="padding:4px 6px;border:1px solid #444">' + _escapeHtml(sourceLabel) + '</td>'
            + '</tr>';
    }

    html += '</table></div>';
    return html;
}

/**
 * 构建选中投射物的详情 HTML
 * @param {Object} projectile - 单个投射物对象 { id, data, source }
 * @returns {string} HTML
 */
function _buildDetailHtml(projectile) {
    if (!projectile || !projectile.data) {
        return '<p style="color:#666">请选择一个投射物查看详情</p>';
    }

    var html = '<div style="max-height:400px;overflow-y:auto;padding:8px">';
    html += '<h4 style="margin:0 0 8px 0;color:#ffa726">投射物: ' + _escapeHtml(projectile.id) + '</h4>';
    html += '<pre style="background:#1e1e1e;padding:8px;border-radius:3px;font-size:11px;overflow:auto">'
        + _escapeHtml(JSON.stringify(projectile.data, null, 2))
        + '</pre>';
    html += '</div>';
    return html;
}

/**
 * 显示投射物定义查看器对话框（只读）
 *
 * 列表中显示所有可用的投射物定义，选中后可在详情区查看完整 JSON 数据。
 *
 * @param {Object} config - 项目配置对象
 */
function showProjectileManagerDialog(config) {
    var projectiles = projectile_manager.listProjectiles(config);

    log.info('showProjectileManagerDialog: 共 ' + projectiles.length + ' 个投射物');

    try {
        new Dialog({
            title: 'MachineMax 投射物定义查看器',
            width: 700,
            height: 600,
            lines: [
                '<p style="margin:0 0 8px 0;color:#aaa;font-size:12px">'
                + '共 ' + projectiles.length + ' 个投射物定义 · 选中一项后在下方面板查看详情'
                + '</p>',
                _buildProjectileListHtml(projectiles),
                '<hr style="border-color:#444;margin:8px 0">',
                '<div id="mm_proj_detail" style="min-height:100px">'
                + '<p style="color:#666;text-align:center">请在上方列表中选择一个投射物查看详情</p>'
                + '</div>',
            ],
            onConfirm: function () {
                this.hide();
            },
        }).show();

        setTimeout(function () {
            var radios = document.querySelectorAll('[name="mm_proj_select"]');
            var detailDiv = document.getElementById('mm_proj_detail');
            if (!radios || !detailDiv) return;

            function onSelect(index) {
                var projectile = projectiles[index];
                if (projectile) {
                    detailDiv.innerHTML = _buildDetailHtml(projectile);
                }
            }

            for (var i = 0; i < radios.length; i++) {
                radios[i].addEventListener('change', function () {
                    var idx = parseInt(this.getAttribute('data-index'), 10);
                    onSelect(idx);
                });
            }

            var rows = document.querySelectorAll('[data-mm-proj-row]');
            for (var j = 0; j < rows.length; j++) {
                (function (rowIdx) {
                    rows[j].addEventListener('click', function () {
                        var radio = this.querySelector('[name="mm_proj_select"]');
                        if (radio) {
                            radio.checked = true;
                            radio.dispatchEvent(new Event('change'));
                        }
                    });
                })(j);
            }
        }, 100);
    } catch (e) {
        log.error('showProjectileManagerDialog: 创建失败', e);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showProjectileManagerDialog,
    };
}
