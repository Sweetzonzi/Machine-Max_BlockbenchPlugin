#!/usr/bin/env node
/**
 * audit-stats.js — 重新计算 docs/13 §2 的现状数字，并与文档基线比较
 *
 * 用法:
 *   node scripts/audit-stats.js            # 人类可读报告；有漂移退出码 1
 *   node scripts/audit-stats.js --json     # 机器可读
 *
 * 口径与 docs/13 §2 一致:
 *   - 只统计 src/**\/*.js（不含 AGENTS.md、模板、dist）
 *   - 调用点按“实际调用”计，排除函数定义与注释
 *   - src/mode 包含 src/mode.js；src/ui 的模板单独计 .html
 *   - Vue 直写按 $set/$delete 出现次数计；计算属性内的写入单独归组
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SRC = path.join(REPO_ROOT, 'src');

// docs/13 §2（2026-10-21）。这些是审计基线，不是运行时数据。
const BASELINE = {
    '2.1.ui.js_files': 27,
    '2.1.ui.template_files': 7,
    '2.1.ui.js_lines': 6434,
    '2.1.ui.template_lines': 1147,
    '2.1.mode.files': 5,
    '2.1.mode.lines': 1155,
    '2.1.core.files': 12,
    '2.1.core.lines': 4427,
    '2.1.codec.files': 10,
    '2.1.codec.lines': 1271,
    '2.1.managers.files': 5,
    '2.1.managers.lines': 330,
    '2.1.generators.files': 6,
    '2.1.generators.lines': 440,
    '2.1.import.files': 3,
    '2.1.import.lines': 859,
    '2.2.operations.functions': 29,
    '2.2.app.undo_labels': 2,
    '2.2.app.undo_labels.field': 0,
    '2.2.app.undo_labels.collection': 1,
    '2.2.app.undo_labels.lifecycle': 1,
    '2.2.subsystem_panel.set': 0,
    '2.2.subsystem_panel.delete': 0,
    '2.2.connector_panel.set': 0,
    '2.2.connector_panel.delete': 0,
    '2.2.app.computed.properties': 0,
    '2.2.app.computed.sites': 0,
    '2.3.save_config.calls': 11,
    '2.3.save_config.files': 4,
    '2.3.refresh_outliner.calls': 18,
    '2.3.refresh_outliner.files': 7,
    '2.3.refresh_outliner.no_undo.calls': 17,
    '2.3.refresh_outliner.no_undo.files': 6,
    '2.3.update_selection.calls': 16,
    '2.3.update_selection.files': 7,
    '2.3.update_selection.no_undo.calls': 14,
    '2.3.update_selection.no_undo.files': 6,
    '2.3.show_toast.calls': 127,
    '2.3.show_toast.files': 21,
    '2.3.show_toast.no_undo.calls': 126,
    '2.3.show_toast.no_undo.files': 20,
    '2.3.fs_path_require.files': 14,
    '2.3.write_file_sync.calls': 8,
    '2.3.write_file_sync.files': 4,
    '2.4.validation.error_points': 17,
    '2.4.validation.warning_points': 3,
    '2.4.validation.warning_codes': 1,
};

function listFiles(root, extension) {
    const out = [];
    if (!fs.existsSync(root)) return out;
    (function walk(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
        for (const entry of entries) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (entry.isFile() && entry.name.endsWith(extension)) out.push(full);
        }
    })(root);
    return out;
}

function read(file) {
    return fs.readFileSync(file, 'utf8');
}

function rel(file) {
    return path.relative(REPO_ROOT, file).split(path.sep).join('/');
}

function countLines(content) {
    const lines = content.replace(/\r\n/g, '\n').split('\n');
    if (lines.length && lines[lines.length - 1] === '') lines.pop();
    return lines.length;
}

/** 去掉 // 与 块注释，保留字符串内容与换行；用于调用点统计。 */
function stripComments(source) {
    let out = '';
    let state = 'code';
    let quote = '';
    for (let i = 0; i < source.length; i++) {
        const ch = source[i];
        const next = source[i + 1];
        if (state === 'code') {
            if (ch === '/' && next === '/') { state = 'line'; i++; continue; }
            if (ch === '/' && next === '*') { state = 'block'; i++; continue; }
            if (ch === "'" || ch === '"' || ch === '`') { state = 'string'; quote = ch; }
            out += ch;
        } else if (state === 'line') {
            if (ch === '\n') { state = 'code'; out += ch; }
        } else if (state === 'block') {
            if (ch === '*' && next === '/') { state = 'code'; i++; }
            else if (ch === '\n') out += ch;
        } else if (state === 'string') {
            out += ch;
            if (ch === '\\') { out += source[++i] || ''; continue; }
            if (ch === quote) state = 'code';
        }
    }
    return out;
}

/** 从 needle 后的第一个 { 开始做括号配对；用于截取对象/方法块。 */
function findBlock(source, needle) {
    const at = source.indexOf(needle);
    if (at < 0) return '';
    let i = source.indexOf('{', at);
    if (i < 0) return '';
    let depth = 0;
    let quote = '';
    for (; i < source.length; i++) {
        const ch = source[i];
        if (quote) {
            if (ch === '\\') { i++; continue; }
            if (ch === quote) quote = '';
            continue;
        }
        if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
        if (ch === '{') depth++;
        else if (ch === '}') {
            depth--;
            if (depth === 0) return source.slice(at, i + 1);
        }
    }
    return '';
}

function sitesMatching(files, regex) {
    const sites = [];
    for (const file of files) {
        const source = stripComments(read(file));
        const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
        let match;
        while ((match = re.exec(source)) !== null) {
            const line = source.slice(0, match.index).split('\n').length;
            sites.push({ file: rel(file), line });
            if (match.index === re.lastIndex) re.lastIndex++;
        }
    }
    return sites;
}

function statsFor(sites) {
    return {
        calls: sites.length,
        files: new Set(sites.map((site) => site.file)).size,
    };
}

function countPattern(source, pattern) {
    const matches = source.match(pattern);
    return matches ? matches.length : 0;
}

function collectComputedWrites(source) {
    const block = findBlock(source, 'computed: {');
    if (!block) return { properties: 0, sites: 0, byProperty: {} };
    const lines = block.split('\n');
    const starts = [];
    for (let i = 0; i < lines.length; i++) {
        const match = /^\s{8}([A-Za-z_$][\w$]*)\s*:\s*function\b/.exec(lines[i]);
        if (match) starts.push({ name: match[1], index: i });
    }
    const byProperty = {};
    let sites = 0;
    for (let i = 0; i < starts.length; i++) {
        const start = starts[i].index;
        const end = i + 1 < starts.length ? starts[i + 1].index : lines.length;
        let count = 0;
        for (let line = start; line < end; line++) {
            count += countPattern(lines[line], /\$set\s*\(/g);
            count += countPattern(lines[line], /\bdelete\s+[A-Za-z_$]/g);
        }
        if (count > 0) byProperty[starts[i].name] = count;
        sites += count;
    }
    return { properties: Object.keys(byProperty).length, sites, byProperty };
}

function collectUndoLabels(source) {
    const block = findBlock(source, 'var MM_UNDO_LABELS = {');
    if (!block) return { total: 0, field: 0, collection: 0, lifecycle: 0, labels: [] };
    const labels = [];
    const re = /^\s{4}([A-Za-z_$][\w$]*)\s*:/gm;
    let match;
    while ((match = re.exec(block)) !== null) labels.push(match[1]);
    let field = 0;
    let collection = 0;
    let lifecycle = 0;
    for (const name of labels) {
        if (name.startsWith('update')) field++;
        else if (name.startsWith('rename') || name.startsWith('migrate') || name === 'handleCleanGhostEntry') lifecycle++;
        else collection++;
    }
    return { total: labels.length, field, collection, lifecycle, labels };
}

function collectValidationStats(file) {
    const source = stripComments(read(file));
    const errors = [];
    const warnings = [];
    const re = /_makeProblem\(\s*'(error|warning)'\s*,\s*CODES\.([A-Z0-9_]+)/g;
    let match;
    while ((match = re.exec(source)) !== null) {
        if (match[1] === 'error') errors.push(match[2]);
        else warnings.push(match[2]);
    }
    return {
        errorPoints: errors.length,
        warningPoints: warnings.length,
        warningCodes: new Set(warnings).size,
        errorCodes: Array.from(new Set(errors)).sort(),
    };
}

function directoryStats() {
    const uiJs = listFiles(path.join(SRC, 'ui'), '.js');
    const uiHtml = listFiles(path.join(SRC, 'ui'), '.html');
    const modeFiles = listFiles(path.join(SRC, 'mode'), '.js').concat([path.join(SRC, 'mode.js')]);
    const core = listFiles(path.join(SRC, 'core'), '.js');
    const codec = listFiles(path.join(SRC, 'codec'), '.js');
    const managers = listFiles(path.join(SRC, 'managers'), '.js');
    const generators = listFiles(path.join(SRC, 'generators'), '.js');
    const importer = listFiles(path.join(SRC, 'import'), '.js');

    const lineSum = (files) => files.reduce((sum, file) => sum + countLines(read(file)), 0);
    return {
        '2.1.ui.js_files': uiJs.length,
        '2.1.ui.template_files': uiHtml.length,
        '2.1.ui.js_lines': lineSum(uiJs),
        '2.1.ui.template_lines': lineSum(uiHtml),
        '2.1.mode.files': modeFiles.length,
        '2.1.mode.lines': lineSum(modeFiles),
        '2.1.core.files': core.length,
        '2.1.core.lines': lineSum(core),
        '2.1.codec.files': codec.length,
        '2.1.codec.lines': lineSum(codec),
        '2.1.managers.files': managers.length,
        '2.1.managers.lines': lineSum(managers),
        '2.1.generators.files': generators.length,
        '2.1.generators.lines': lineSum(generators),
        '2.1.import.files': importer.length,
        '2.1.import.lines': lineSum(importer),
    };
}

function collect() {
    const allJs = listFiles(SRC, '.js');
    const app = path.join(SRC, 'ui', 'App.vue.js');
    const appSource = stripComments(read(app));
    const operations = path.join(SRC, 'ops', 'index.js');
    const subsystemPanel = path.join(SRC, 'ui', 'SubsystemPanel.vue.js');
    const connectorPanel = path.join(SRC, 'ui', 'ConnectorPanel.vue.js');
    const undo = path.join(SRC, 'core', 'undo.js');

    const saveSites = sitesMatching(allJs, /(?<!function\s)\bsaveConfig\s*\(/g);
    const refreshSites = sitesMatching(allJs, /(?<!function\s)\brefreshOutlinerIcons\s*\(/g);
    const selectionSites = sitesMatching(allJs, /\bdispatchEvent\(\s*['"]update_selection['"]\s*\)/g);
    const toastSites = sitesMatching(allJs, /(?<!function\s)\bshowToast\s*\(/g);
    const noUndo = (sites) => sites.filter((site) => site.file !== rel(undo));

    const fsFiles = allJs.filter((file) => {
        return /require\(\s*['"](?:node:)?(?:fs|path)['"]\s*\)/.test(stripComments(read(file)));
    });
    const writeSites = sitesMatching(allJs, /\bfs\.writeFileSync\s*\(/g);

    const labels = collectUndoLabels(read(app));
    const computed = collectComputedWrites(appSource);
    const validation = collectValidationStats(path.join(SRC, 'services', 'validate.js'));

    const stats = Object.assign({}, directoryStats(), {
        '2.2.operations.functions': countPattern(stripComments(read(operations)),
            /^\s{4}[A-Za-z_$][\w$]*:\s/gm),
        '2.2.app.undo_labels': labels.total,
        '2.2.app.undo_labels.field': labels.field,
        '2.2.app.undo_labels.collection': labels.collection,
        '2.2.app.undo_labels.lifecycle': labels.lifecycle,
        '2.2.subsystem_panel.set': countPattern(stripComments(read(subsystemPanel)), /\$set\s*\(/g),
        '2.2.subsystem_panel.delete': countPattern(stripComments(read(subsystemPanel)), /\$delete\s*\(/g),
        '2.2.connector_panel.set': countPattern(stripComments(read(connectorPanel)), /\$set\s*\(/g),
        '2.2.connector_panel.delete': countPattern(stripComments(read(connectorPanel)), /\$delete\s*\(/g),
        '2.2.app.computed.properties': computed.properties,
        '2.2.app.computed.sites': computed.sites,
        '2.3.save_config.calls': statsFor(saveSites).calls,
        '2.3.save_config.files': statsFor(saveSites).files,
        '2.3.refresh_outliner.calls': statsFor(refreshSites).calls,
        '2.3.refresh_outliner.files': statsFor(refreshSites).files,
        '2.3.refresh_outliner.no_undo.calls': statsFor(noUndo(refreshSites)).calls,
        '2.3.refresh_outliner.no_undo.files': statsFor(noUndo(refreshSites)).files,
        '2.3.update_selection.calls': statsFor(selectionSites).calls,
        '2.3.update_selection.files': statsFor(selectionSites).files,
        '2.3.update_selection.no_undo.calls': statsFor(noUndo(selectionSites)).calls,
        '2.3.update_selection.no_undo.files': statsFor(noUndo(selectionSites)).files,
        '2.3.show_toast.calls': statsFor(toastSites).calls,
        '2.3.show_toast.files': statsFor(toastSites).files,
        '2.3.show_toast.no_undo.calls': statsFor(noUndo(toastSites)).calls,
        '2.3.show_toast.no_undo.files': statsFor(noUndo(toastSites)).files,
        '2.3.fs_path_require.files': fsFiles.length,
        '2.3.write_file_sync.calls': statsFor(writeSites).calls,
        '2.3.write_file_sync.files': statsFor(writeSites).files,
        '2.4.validation.error_points': validation.errorPoints,
        '2.4.validation.warning_points': validation.warningPoints,
        '2.4.validation.warning_codes': validation.warningCodes,
    });

    const details = {
        computed: computed.byProperty,
        undoLabels: labels.labels,
        validationErrorCodes: validation.errorCodes,
        files: {
            fs_path: fsFiles.map(rel),
            write_file_sync: Array.from(new Set(writeSites.map((site) => site.file))).sort(),
        },
        sites: {
            save_config: saveSites,
            refresh_outliner: refreshSites,
            update_selection: selectionSites,
            show_toast: toastSites,
            write_file_sync: writeSites,
        },
    };

    return { stats, details };
}

function diffStats(stats) {
    const drift = [];
    for (const key of Object.keys(BASELINE)) {
        if (stats[key] !== BASELINE[key]) {
            drift.push({ key, expected: BASELINE[key], actual: stats[key] });
        }
    }
    return drift;
}

function main() {
    const json = process.argv.indexOf('--json') >= 0;
    const { stats, details } = collect();
    const drift = diffStats(stats);

    if (json) {
        process.stdout.write(JSON.stringify({
            ok: drift.length === 0,
            baseline: BASELINE,
            stats,
            drift,
            details,
        }, null, 2) + '\n');
        process.exit(drift.length === 0 ? 0 : 1);
    }

    console.log('docs/13 §2 现状审计（口径：src/**/*.js）');
    console.log('');
    for (const key of Object.keys(BASELINE)) {
        const ok = stats[key] === BASELINE[key];
        const line = (ok ? '[PASS] ' : '[DRIFT] ') + key + ' = ' + stats[key] +
            (ok ? '' : '（文档 ' + BASELINE[key] + '）');
        console.log(line);
    }
    console.log('');
    if (drift.length === 0) {
        console.log('全部 ' + Object.keys(BASELINE).length + ' 项与 docs/13 §2 一致。');
        return;
    }
    console.log('发现 ' + drift.length + ' 项漂移：');
    for (const item of drift) {
        console.log('  - ' + item.key + ': 文档 ' + item.expected + '，实际 ' + item.actual);
    }
    process.exit(1);
}

try {
    main();
} catch (error) {
    console.error(error && error.stack ? error.stack : String(error));
    process.exit(2);
}
