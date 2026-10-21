// 文件: src/ui/dialogs/icon_generator_dialog.js
// 用途: “生成图标…” 设置 Dialog + 预览 Dialog
// 所属模块: MachineMax Blockbench 插件
//
// 设置 → 预览 → 写入。预览只渲染不写盘；写入时才写 PNG，并通过
// ops.setPartIcons 一次写回所有 part.icon（一条撤销记录）。

'use strict';

var iconGenerator = require('../../services/icon_generator.js');
var ops = require('../../ops/index.js');
var { showToast } = require('../../utils/notify.js');
var { scheduleSave } = require('../../utils/persistence.js');
var { createLogger } = require('../../utils/logger.js');

var log = createLogger('IconDialog');

var STATUS_LABEL = {
    created: '新建',
    linked: '关联',
    overwritten: '覆盖',
    skipped: '跳过',
    unrewritten: '未改写',
    failed: '失败',
};

function variantOptionsOf(config) {
    var activeId = config && config._uiState && config._uiState.activePartId;
    var part = activeId && config.parts ? config.parts[activeId] : null;
    var options = { '': '自动（逐零件解析）' };
    if (part && part.variants && typeof part.variants === 'object') {
        Object.keys(part.variants).forEach(function (name) { options[name] = name; });
    }
    return options;
}

function cameraDefaults(config) {
    var stored = config && config._uiState && config._uiState.iconCamera;
    return {
        camera: stored && Array.isArray(stored.direction) ? 'project' : 'project',
        framing: stored && stored.framing === 'fit' ? 'fit' : 'uniform',
        fill: stored && isFinite(Number(stored.fill)) ? Number(stored.fill) : 0.9,
    };
}

function persistCamera(config, result) {
    if (!config || !result || !result.cameraUsed) return;
    if (!config._uiState || typeof config._uiState !== 'object') config._uiState = {};
    var old = config._uiState.iconCamera || {};
    var next = {
        direction: old.direction || null,
        assemblyDirection: old.assemblyDirection || null,
        fill: result.cameraUsed.fill,
        framing: result.cameraUsed.framing === 'current' ? (old.framing || 'uniform') : result.cameraUsed.framing,
        conventionVersion: 2,
    };
    if (Array.isArray(result.cameraUsed.direction) && result.cameraUsed.direction.length >= 3) {
        next.direction = result.cameraUsed.direction.slice();
    }
    if (Array.isArray(result.cameraUsed.assemblyDirection) && result.cameraUsed.assemblyDirection.length >= 3) {
        next.assemblyDirection = result.cameraUsed.assemblyDirection.slice();
    }
    config._uiState.iconCamera = next;
    scheduleSave();
}

function buildPreviewElement(result) {
    var root = document.createElement('div');
    root.style.maxHeight = '60vh';
    root.style.overflow = 'auto';
    root.style.minWidth = '640px';

    var summary = result.summary || {};
    var line = document.createElement('div');
    line.style.marginBottom = '8px';
    line.style.fontWeight = 'bold';
    line.textContent = '新建/关联 ' + ((summary.created || 0) + (summary.linked || 0))
        + ' / 覆盖 ' + (summary.overwritten || 0)
        + ' / 跳过 ' + (summary.skipped || 0)
        + ' / 未改写 ' + (summary.unrewritten || 0)
        + ' / 失败 ' + (summary.failed || 0);
    root.appendChild(line);

    var grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(4, minmax(130px, 1fr))';
    grid.style.gap = '8px';
    root.appendChild(grid);

    (result.items || []).forEach(function (item) {
        var card = document.createElement('div');
        card.style.border = '1px solid rgba(255,255,255,.16)';
        card.style.borderRadius = '4px';
        card.style.padding = '6px';
        card.style.background = 'rgba(0,0,0,.14)';
        card.style.minWidth = '0';

        var box = document.createElement('div');
        box.style.width = '128px';
        box.style.height = '128px';
        box.style.margin = '0 auto 4px';
        box.style.background = 'repeating-conic-gradient(#444 0% 25%, #333 0% 50%) 50% / 16px 16px';
        box.style.display = 'flex';
        box.style.alignItems = 'center';
        box.style.justifyContent = 'center';
        if (item.dataUrl) {
            var img = document.createElement('img');
            img.src = item.dataUrl;
            img.width = 128;
            img.height = 128;
            img.alt = item.partId || 'assembly';
            img.style.imageRendering = 'auto';
            box.appendChild(img);
        } else {
            box.textContent = '无预览';
            box.style.color = '#aaa';
        }
        card.appendChild(box);

        var title = document.createElement('div');
        title.style.fontSize = '12px';
        title.style.fontWeight = 'bold';
        title.style.overflow = 'hidden';
        title.style.textOverflow = 'ellipsis';
        title.style.whiteSpace = 'nowrap';
        title.title = item.path || '';
        title.textContent = (item.kind === 'assembly' ? '装配体' : (item.partId || '?'))
            + (item.usedVariant ? ' / ' + item.usedVariant : '');
        card.appendChild(title);

        var status = document.createElement('div');
        status.style.fontSize = '11px';
        status.style.color = item.status === 'failed' ? '#ff7b7b'
            : (item.status === 'skipped' ? '#d6a84b' : '#8fd18f');
        status.textContent = (STATUS_LABEL[item.status] || item.status)
            + (item.fieldChanged ? ' + 字段' : '');
        card.appendChild(status);

        if (item.path) {
            var p = document.createElement('div');
            p.style.fontSize = '10px';
            p.style.color = '#aaa';
            p.style.wordBreak = 'break-all';
            p.textContent = item.path;
            card.appendChild(p);
        }
        if (item.error) {
            var err = document.createElement('div');
            err.style.fontSize = '10px';
            err.style.color = '#ff7b7b';
            err.style.wordBreak = 'break-all';
            err.textContent = item.error;
            card.appendChild(err);
        }
        grid.appendChild(card);
    });

    if (result.warnings && result.warnings.length > 0) {
        var warn = document.createElement('div');
        warn.style.marginTop = '8px';
        warn.style.fontSize = '11px';
        warn.style.color = '#d6a84b';
        warn.textContent = '提示：' + result.warnings.map(function (w) { return w.message || w.code; }).join('；');
        root.appendChild(warn);
    }
    return root;
}

function writeResult(config, settings, previewResult) {
    var result = iconGenerator.generate(config, Object.assign({}, settings, { write: true }));
    var hasUsable = result.items && result.items.some(function (item) {
        return item.status !== 'failed';
    });
    if (!hasUsable) {
        showToast('图标写入失败：' + ((result.errors && result.errors[0] && result.errors[0].message) || '没有可写入的图标'), 'error');
        return false;
    }

    if (result.fieldUpdates && Object.keys(result.fieldUpdates).length > 0) {
        var op = ops.setPartIcons(config, { icons: result.fieldUpdates });
        if (!op.ok) {
            showToast('PNG 已写入，但 part.icon 更新失败：' + op.error, 'error', 6000);
            log.error('setPartIcons 失败', op);
            return false;
        }
    }
    persistCamera(config, result);

    var s = result.summary || {};
    showToast('图标已生成：新建/关联 ' + ((s.created || 0) + (s.linked || 0))
        + '，覆盖 ' + (s.overwritten || 0)
        + '，跳过 ' + (s.skipped || 0)
        + '，失败 ' + (s.failed || 0), s.failed ? 'warning' : 'positive', 6000);
    return true;
}

function showPreviewDialog(config, settings, result) {
    var root = buildPreviewElement(result);
    var dialog = new Dialog({
        id: 'mm_icon_preview',
        title: '图标预览',
        width: 760,
        lines: [root],
        buttons: ['写入', '取消'],
        onButton: function (button) {
            if (button !== 0) {
                this.hide();
                return false;
            }
            var ok = false;
            try {
                ok = writeResult(config, settings, result);
            } catch (e) {
                log.error('写入图标异常', e);
                showToast('写入图标异常: ' + (e && e.message ? e.message : String(e)), 'error', 6000);
            }
            if (ok) {
                this.hide();
                return false;
            }
            return false;
        },
    });
    dialog.show();
}

function showIconGeneratorDialog(config) {
    if (!config) {
        showToast('请先打开项目', 'warning');
        return;
    }
    if (!config.contentPackPath) {
        showToast('请先设置内容包路径', 'warning');
        return;
    }
    if (!config.parts || Object.keys(config.parts).length === 0) {
        showToast('没有定义任何零件', 'warning');
        return;
    }

    var defaults = cameraDefaults(config);
    var variants = variantOptionsOf(config);
    var activeVariant = (config._uiState && config._uiState.activeVariantName) || '';
    if (!variants[activeVariant]) activeVariant = '';

    try {
        new Dialog({
            id: 'mm_icon_generator',
            title: '生成零件 / 装配体图标',
            width: 560,
            form: {
                scope: {
                    type: 'select',
                    label: '范围',
                    value: 'all+assembly',
                    options: {
                        current: '当前零件',
                        all: '全部零件',
                        assembly: '仅装配体',
                        'all+assembly': '全部零件 + 装配体',
                    },
                },
                variant: {
                    type: 'select',
                    label: '变体',
                    value: activeVariant,
                    options: variants,
                    description: '仅“当前零件”生效；全部零件时按每个零件自己的 active/第一个变体解析',
                },
                visibility: {
                    type: 'select',
                    label: '显隐方式',
                    value: 'auto',
                    options: {
                        auto: '按零件定义自动显隐',
                        manual: '使用当前显隐',
                    },
                },
                camera: {
                    type: 'select',
                    label: '相机方向',
                    value: defaults.camera,
                    options: {
                        project: '项目相机（首次等轴测）',
                        iso: '等轴测',
                        current: '使用当前视角（仅当前零件）',
                    },
                    description: '零件默认左前、装配体默认右前（按 MachineMax 现有图标校准）；“使用当前视角”完整复制主视口相机，只允许当前零件',
                },
                framing: {
                    type: 'select',
                    label: '取景',
                    value: defaults.framing,
                    options: {
                        uniform: '统一比例（整机定一次 zoom）',
                        fit: '每件填满',
                    },
                },
                fill: {
                    type: 'number',
                    label: '填充率',
                    value: defaults.fill,
                    min: 0.5,
                    max: 1.0,
                    step: 0.01,
                    description: '2S38 首次复刻用 0.86；k17 / sdkfz234 约 0.95；默认 0.9',
                },
                folder: {
                    type: 'text',
                    label: '图标子目录',
                    value: '',
                    description: '留空自动：零件按 partId 前缀，装配体按 name 前缀；只影响新建路径',
                },
                overwrite: {
                    type: 'checkbox',
                    label: '覆盖已有文件',
                    value: false,
                    description: '关闭时跳过已存在文件；字段为空时仍可只关联已有文件',
                },
                rewriteExternalIcon: {
                    type: 'checkbox',
                    label: '改写外部/依赖图标引用',
                    value: false,
                    description: '默认保留外部 namespace / 非 textures/icon 的 part.icon',
                },
                hideMarkers: {
                    type: 'checkbox',
                    label: '隐藏碰撞箱/交互区/连接点',
                    value: true,
                },
                resolution: {
                    type: 'info',
                    text: '输出：128×128 RGBA 透明 PNG（P1 固定）',
                },
            },
            onConfirm: function (formData) {
                var settings = {
                    scope: formData.scope || 'all+assembly',
                    partId: config._uiState && config._uiState.activePartId,
                    variantName: formData.variant || '',
                    visibility: formData.visibility || 'auto',
                    camera: formData.camera || 'project',
                    framing: formData.framing || 'uniform',
                    fill: Number(formData.fill),
                    folder: String(formData.folder || '').trim() || undefined,
                    overwrite: !!formData.overwrite,
                    rewriteExternalIcon: !!formData.rewriteExternalIcon,
                    hideMarkers: formData.hideMarkers !== false,
                    write: false,
                };
                if (settings.scope === 'current' && !settings.partId) {
                    showToast('当前没有选中的零件', 'warning');
                    return false;
                }
                if (settings.camera === 'current' && settings.scope !== 'current') {
                    showToast('“使用当前视角”只允许当前零件', 'warning');
                    return false;
                }
                var result;
                try {
                    result = iconGenerator.generate(config, settings);
                } catch (e) {
                    log.error('图标预览异常', e);
                    showToast('图标预览失败: ' + (e && e.message ? e.message : String(e)), 'error', 6000);
                    return false;
                }
                if (!result.items || result.items.length === 0) {
                    showToast((result.errors && result.errors[0] && result.errors[0].message) || '没有可预览的图标', 'error');
                    return false;
                }
                var hasUsable = result.items.some(function (item) { return item.status !== 'failed'; });
                if (!hasUsable) {
                    showToast((result.errors && result.errors[0] && result.errors[0].message) || '图标生成失败', 'error', 6000);
                    return false;
                }
                if (!settings.hideMarkers) {
                    showToast('注意：未隐藏碰撞箱/交互区，图标可能包含辅助几何', 'warning', 4000);
                }
                showPreviewDialog(config, settings, result);
                this.hide();
            },
        }).show();
    } catch (e) {
        log.error('生成图标 Dialog 失败', e);
        showToast('无法打开生成图标对话框: ' + (e && e.message ? e.message : String(e)), 'error');
    }
}

module.exports = {
    showIconGeneratorDialog: showIconGeneratorDialog,
};
