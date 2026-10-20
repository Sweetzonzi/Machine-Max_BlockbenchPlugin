/**
 * export_dialog.js — 导出 / 内容包设置对话框（从 menu.js 拆出）
 *
 * 原 menu.js 的 _showExportDialog / _showPackSettingsDialog / _getDefaultExportDir /
 * _sanitizeFolderName / _parseDependencyText。
 *
 * 导出函数:
 *   showExportDialog() — 打开导出对话框
 *   showPackSettingsDialog() — 打开内容包设置对话框
 */

const { createLogger } = require('../../utils/logger.js');
const { getConfig, saveConfig } = require('../../utils/persistence.js');
const { showToast } = require('../../utils/notify.js');
const { collectIssues } = require('../../mode/validation.js');
const { executeExport } = require('./export_pipeline.js');
const ops = require('../../ops/index.js');
const path = require('path');

/** 模块日志 */
var log = createLogger('ExportDialog');

/**
 * 获取默认导出目录（优先 packMeta 缓存 → .bbmodel 同级）
 * @param {Object} pm - config.packMeta
 * @returns {string}
 */
function _getDefaultExportDir(pm) {
    var path = require('path');
    var cached = pm && pm.exportDir;
    if (cached) return cached;
    // 优先使用内容包目录的上级目录作为默认导出位置
    var config = getConfig();
    if (config && config.contentPackPath) {
        return path.dirname(config.contentPackPath);
    }
    var bbmodelPath = Project && Project.file_path ? Project.file_path : '';
    if (bbmodelPath) {
        return path.join(path.dirname(bbmodelPath), 'machine_max_content_pack');
    }
    return '';
}

/**
 * 显示内容包设置对话框（编辑 meta.json 元数据和导出目录）
 * 填写的内容保存到 config.packMeta。
 *
 * 对话框中提供"默认导出目录"字段，附带浏览按钮，
 * 点击浏览按钮才弹出系统原生文件夹选择器。
 */
function showPackSettingsDialog() {
    var config = getConfig();
    if (!config) {
        showToast('请先打开项目', 'warning');
        return;
    }

    var pm = config.packMeta || {};
    var ns = config.namespace || 'machine_max';

    log.debug('showPackSettingsDialog: 打开设置对话框', {
        packMetaExists: !!config.packMeta,
        pmType: typeof pm,
        pmKeys: Object.keys(pm),
        nameType: typeof pm.name,
        name: pm.name,
        authorType: typeof pm.author,
        author: pm.author,
        descType: typeof pm.description,
        description: pm.description,
        contentPackPath: config.contentPackPath,
        fallbackName: config.contentPackPath ? path.basename(config.contentPackPath) : '(无路径)',
    });
    var defaultPackId = pm.id || ns + ':' + (Project ? (Project.name || 'content_pack') : 'content_pack');
    var defaultExportDir = pm.exportDir || _getDefaultExportDir(pm);

    try {
        new Dialog({
            title: 'MachineMax 内容包设置',
            width: 520,
            form: {
                packId: {
                    type: 'text',
                    label: '包 ID（ResourceLocation）',
                    value: defaultPackId,
                    description: '格式为 namespace:pack_name，如 machine_max:wine_fox_parts。仅限小写字母、数字、_ - . / :',
                },
                packVersion: {
                    type: 'text',
                    label: '版本号',
                    value: pm.version || '1.0',
                    description: '遵循 SemVer 格式，如 1.0.0',
                },
                packName: {
                    type: 'text',
                    label: '显示名称',
                    value: pm.name || (config.contentPackPath ? path.basename(config.contentPackPath) : ''),
                    description: '内容包的显示名称（存储在配置中，不会写入 meta.json）',
                },
                packAuthor: {
                    type: 'text',
                    label: '作者',
                    value: pm.author || '',
                    description: '内容包作者名',
                },
                packDescription: {
                    type: 'textarea',
                    label: '描述',
                    value: pm.description || '',
                    height: 90,
                    description: '内容包描述信息',
                },
                exportDir: {
                    type: 'folder',
                    label: '默认导出目录',
                    value: defaultExportDir,
                    description: '点击右侧浏览按钮选择内容包默认导出目录',
                },
                enableAutoPack: {
                    type: 'checkbox',
                    label: '启用自动打包',
                    value: pm.enable_auto_pack !== false,
                    description: '仅 Mod 开发需要考虑此选项。若启用，Spark-Core 将在启动时自动从 Mod 资源中打包 .zip。一般内容包作者保持关闭即可。',
                },
                flatExport: {
                    type: 'checkbox',
                    label: '扁平化导出',
                    value: pm.flat_export !== false,
                    description: '若启用，零件/子系统/连接点将扁平存放；关闭则按模型名分入子文件夹',
                },
                manageDeps: {
                    type: 'checkbox',
                    label: '保存后管理依赖包',
                    value: false,
                    description: '保存元数据后立即进入依赖管理界面，可添加/移除本地路径依赖及链式解析。',
                },
            },
            onConfirm: function (formData) {
                var metaPatch = {
                    id: formData.packId || defaultPackId,
                    version: formData.packVersion || '1.0',
                    name: formData.packName || '',
                    author: formData.packAuthor || '',
                    description: formData.packDescription || '',
                    exportDir: formData.exportDir || defaultExportDir,
                    enable_auto_pack: !!formData.enableAutoPack,
                    flat_export: !!formData.flatExport,
                };
                // 撤销边界在 ops.updatePackMeta 内部
                var opResult = ops.updatePackMeta(config, metaPatch);
                if (!opResult.ok) {
                    showToast(opResult.error, 'error');
                    return false;
                }
                var packMeta = config.packMeta;

                saveConfig();
                this.hide();

                if (formData.manageDeps) {
                    // 从已有 dependencyPaths 构建依赖列表，以路径为标识
                    var existing = (config.dependencyPaths || []).map(function (p) {
                        return { path: p, type: 'hard' };
                    });
                    var pdir = config.contentPackPath ? require('path').dirname(config.contentPackPath) : '';
                    var pd = require('../dialogs/pack_setup_dialog.js');
                    pd.showDependencyPathEditor(existing, pdir, function (resolved) {
                        var directDeps = resolved.direct || [];
                        var indirectDeps = resolved.indirect || [];
                        var allPaths = [];
                        for (var d = 0; d < directDeps.length; d++) allPaths.push(directDeps[d].path);
                        for (var k = 0; k < indirectDeps.length; k++) allPaths.push(indirectDeps[k].path);
                        ops.updateDependencyPaths(config, { replace: allPaths });
                        saveConfig();
                        showToast('内容包设置已保存，依赖已更新', 'positive');
                    });
                } else {
                    showToast('内容包设置已保存', 'positive');
                }

                log.info('内容包设置已更新', {
                    packId: packMeta.id,
                    version: packMeta.version,
                    name: packMeta.name,
                    exportDir: packMeta.exportDir,
                });
            },
        }).show();
    } catch (e) {
        log.error('内容包设置 Dialog 失败', e);
        showToast('无法打开设置对话框: ' + (e.message || e), 'error');
    }
}

/**
 * 将字符串转换为安全的文件夹名
 * 替换空格和非法字符为下划线，限制长度 64
 * @param {string} name
 * @returns {string}
 */
function _sanitizeFolderName(name) {
    if (!name) return '';
    return name.replace(/[<>:"/\\|?*\s]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').substring(0, 64);
}

/**
 * 解析依赖文本为 SparkPackDependency 数组
 * 输入格式：每行 "id type"，type 可选（默认 hard）
 * @param {string} text
 * @returns {Array<{id: string, type: string}>}
 */
function _parseDependencyText(text) {
    if (!text || !text.trim()) return [];
    var validTypes = ['hard', 'soft', 'override', 'conflict'];
    return text.split('\n')
        .map(function (line) { return line.trim(); })
        .filter(function (line) { return line.length > 0; })
        .map(function (line) {
            var parts = line.split(/\s+/);
            var depId = parts[0];
            var depType = parts[1] || 'hard';
            if (!validTypes.includes(depType)) depType = 'hard';
            return { id: depId, type: depType };
        });
}

/**
 * 将 collectIssues(config) 的结构化结果按 path 分组渲染为 HTML 摘要。
 * 分组层级：零件 → 变体；errors 用 ✗，warnings 用 ⚠。仅提示，不拦截导出。
 * @param {Object} config - MM 项目配置
 * @returns {string} HTML 字符串（无问题时为空串）
 */
function buildValidationInfo(config) {
    var problems = collectIssues(config);
    if (!problems || problems.length === 0) return '';

    // 按 partId → variantName 分组
    var tree = {};
    for (var i = 0; i < problems.length; i++) {
        var p = problems[i];
        var partId = p.path.partId || '（全局）';
        var v = p.path.variantName || '';
        if (!tree[partId]) tree[partId] = {};
        if (!tree[partId][v]) tree[partId][v] = [];
        tree[partId][v].push(p);
    }

    var lines = ['<span style="color:#ff6b6b">校验发现 ' + problems.length + ' 个问题</span>:'];
    var partIds = Object.keys(tree);
    for (var pi = 0; pi < partIds.length; pi++) {
        var partId = partIds[pi];
        var vs = tree[partId];
        var vNames = Object.keys(vs);
        for (var vi = 0; vi < vNames.length; vi++) {
            var v = vNames[vi];
            var list = vs[v];
            lines.push('<b>' + partId + (v ? '/' + v : '') + '</b>');
            for (var li = 0; li < list.length; li++) {
                var cur = list[li];
                var icon = cur.severity === 'error' ? '✗' : '⚠';
                lines.push('&nbsp;&nbsp;• ' + icon + ' ' + cur.message);
            }
        }
    }
    return '<br>' + lines.join('<br>');
}

/**
 * 显示导出对话框 — 含完整元数据字段和依赖管理
 *
 * 对话框中提供"导出目录"字段，附带浏览按钮，
 * 点击浏览按钮才弹出系统原生文件夹选择器。
 */
function showExportDialog() {
    var config = getConfig();
    if (!config) {
        showToast('没有可导出的配置，请先打开项目', 'warning');
        return;
    }

    var parts = config.parts || {};
    var partCount = Object.keys(parts).length;
    if (partCount === 0) {
        showToast('没有定义任何零件，请先新建零件', 'warning');
        return;
    }

    var pm = config.packMeta || {};
    var ns = config.namespace || 'machine_max';

    log.debug('showExportDialog: 打开导出对话框', {
        packMetaExists: !!config.packMeta,
        pmType: typeof pm,
        pmKeys: Object.keys(pm),
        nameType: typeof pm.name,
        name: pm.name,
        authorType: typeof pm.author,
        author: pm.author,
        descType: typeof pm.description,
        description: pm.description,
        contentPackPath: config.contentPackPath,
        fallbackName: config.contentPackPath ? path.basename(config.contentPackPath) : '(无路径)',
    });
    var defaultPackId = pm.id || ns + ':' + (Project ? (Project.name || 'content_pack') : 'content_pack');
    var defaultExportDir = pm.exportDir || _getDefaultExportDir(pm);

    // 校验配置（结构化结果，按 path 分组列出，仅提示不拦截）
    var errorText = buildValidationInfo(config);

    // 统计信息
    var statLines = [
        '模型: ' + (Project ? Project.name : '未命名'),
        '内容包路径: ' + (config.contentPackPath || '未设置'),
        '零件: ' + partCount,
    ];

    try {
        new Dialog({
            title: '导出 MachineMax 内容包',
            width: 580,
            form: {
                validationInfo: {
                    type: 'info',
                    text: (errorText || '校验通过，未发现问题。') + '<br><br>' + statLines.join('<br>'),
                },
                exportDir: {
                    type: 'folder',
                    label: '导出目录',
                    value: defaultExportDir,
                    description: '点击右侧浏览按钮选择内容包导出目录',
                },
                packId: {
                    type: 'text',
                    label: '包 ID',
                    value: defaultPackId,
                    description: '格式 namespace:pack_name，导出为 meta.json 的 id 字段',
                },
                packVersion: {
                    type: 'text',
                    label: '版本号',
                    value: pm.version || '1.0',
                },
                packName: {
                    type: 'text',
                    label: '显示名称',
                    value: pm.name || (config.contentPackPath ? path.basename(config.contentPackPath) : ''),
                },
                packAuthor: {
                    type: 'text',
                    label: '作者',
                    value: pm.author || '',
                },
                packDescription: {
                    type: 'textarea',
                    label: '描述',
                    value: pm.description || '',
                    height: 90,
                },
                flatExport: {
                    type: 'checkbox',
                    label: '扁平化导出',
                    value: pm.flat_export !== false,
                    description: '若启用，零件/子系统/连接点将扁平存放；关闭则按模型名分入子文件夹',
                },
                dependencies: {
                    type: 'textarea',
                    label: '依赖（每行一个）',
                    value: (function () {
                        var deps = pm.dependencies || [];
                        var lines = deps.map(function (d) {
                            return (typeof d === 'string' ? d : (d.id + ' ' + (d.type || 'hard')));
                        });
                        // 默认填充基础内置包为 hard 依赖（由 Mod 自动提供）
                        var hasBuiltin = false;
                        for (var di = 0; di < deps.length; di++) {
                            var did = typeof deps[di] === 'string' ? deps[di] : deps[di].id;
                            if (did === 'machine_max:builtin') { hasBuiltin = true; break; }
                        }
                        if (!hasBuiltin && pm.id !== 'machine_max:builtin') {
                            lines.unshift('machine_max:builtin hard');
                        }
                        return lines.join('\n');
                    })(),
                    height: 100,
                    description: '格式：每行 "依赖ID 类型"。类型: hard(必需), soft(可选), override(覆盖), conflict(冲突)\n示例: machine_max:builtin hard',
                },
            },
            onConfirm: function (formData) {
                var exportDir = formData.exportDir || defaultExportDir;
                if (!exportDir) {
                    showToast('请先选择导出目录', 'warning');
                    return;
                }

                var packFolderName = _sanitizeFolderName(formData.packName)
                    || _sanitizeFolderName(pm.name || (config.contentPackPath ? path.basename(config.contentPackPath) : ''))
                    || (Project ? Project.name : 'content_pack');

                var overriddenMeta = {
                    id: formData.packId || defaultPackId,
                    version: formData.packVersion || '1.0',
                    name: formData.packName || pm.name || (config.contentPackPath ? path.basename(config.contentPackPath) : ''),
                    author: formData.packAuthor || pm.author || '',
                    description: formData.packDescription || pm.description || '',
                    enable_auto_pack: pm.enable_auto_pack !== false,
                    exportDir: exportDir,
                    dependencies: _parseDependencyText(formData.dependencies || ''),
                    flat_export: !!formData.flatExport,
                };

                // 导出本身是写盘副作用（不进撤销栈），这里只让 packMeta 的变更可撤销
                ops.updatePackMeta(config, overriddenMeta);

                try {
                    var stats = executeExport(config, overriddenMeta, exportDir, packFolderName);
                    saveConfig();
                    showToast(
                        '导出成功！\n零件: ' + stats.parts +
                        ', 连接点: ' + stats.connectors +
                        ', 子系统: ' + stats.subsystems +
                        ', 材料: ' + stats.materials +
                        ', 语言: ' + stats.langs,
                        'positive', 6000
                    );
                    log.info('MachineMax 菜单: 导出完成', stats);
                } catch (e) {
                    log.error('导出失败', e);
                    showToast('导出失败: ' + (e.message || e), 'error', 5000);
                }

                this.hide();
            },
        }).show();
    } catch (e) {
        log.error('导出 Dialog 创建失败', e);
        showToast('无法创建导出对话框: ' + (e.message || e), 'error');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showExportDialog,
        showPackSettingsDialog,
    };
}
