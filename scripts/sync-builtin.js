#!/usr/bin/env node
/**
 * sync-builtin.js — 把兄弟仓库的内置内容包整包同步进插件的 vendored 快照
 *
 * 上游真值：../Machine-Max/src/main/resources/spark_modules/Machine-Max_Builtin/machine_max
 * 本地快照：src/builtin/builtin/machine_max
 *
 * 用法:
 *   node scripts/sync-builtin.js               # --check（默认）：只报告漂移，退出码 1 表示有漂移
 *   node scripts/sync-builtin.js --apply       # 复制缺失/不同步的文件（不删除本地独有文件）
 *   node scripts/sync-builtin.js --source D:\path\to\machine_max
 *
 * 设计约束:
 *   - 只用 fs/path，无第三方依赖（与仓库其它脚本一致）
 *   - 构建不读兄弟仓库（不可复现）；本脚本只在人工/CI 显式调用时运行
 *   - 覆盖 connectors / materials / subsystems / control_groups / parts / docs 全部内容：
 *     前四类被 scripts/build.js 注入 __BUILTIN_*__ 常量，后两类供编辑器浏览与 schema 补全
 *   - 不删除本地独有文件：上游删掉的文件只报告，避免误删
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO_ROOT = path.resolve(__dirname, '..');
const LOCAL_PACK = path.join(REPO_ROOT, 'src', 'builtin', 'builtin', 'machine_max');
const DEFAULT_SOURCE = path.resolve(
    REPO_ROOT, '..', 'Machine-Max',
    'src', 'main', 'resources', 'spark_modules', 'Machine-Max_Builtin', 'machine_max'
);

function parseArgs(argv) {
    const opts = { apply: false, source: DEFAULT_SOURCE, quiet: false };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--apply') opts.apply = true;
        else if (a === '--check') opts.apply = false;
        else if (a === '--source') { opts.source = path.resolve(argv[++i]); }
        else if (a === '--quiet') opts.quiet = true;
        else if (a === '-h' || a === '--help') {
            console.log('用法: node scripts/sync-builtin.js [--check|--apply] [--source <machine_max 目录>]');
            process.exit(0);
        } else {
            console.error('未知参数: ' + a);
            process.exit(2);
        }
    }
    return opts;
}

function walk(root, base) {
    base = base || root;
    const out = [];
    if (!fs.existsSync(root)) return out;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        const full = path.join(root, entry.name);
        if (entry.isDirectory()) out.push(...walk(full, base));
        else if (entry.isFile()) out.push(path.relative(base, full).split(path.sep).join('/'));
    }
    return out.sort();
}

function sha256(file) {
    return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function collect(root) {
    const files = walk(root);
    const map = new Map();
    for (const rel of files) map.set(rel, sha256(path.join(root, rel)));
    return map;
}

function printList(prefix, items, cap) {
    const limit = cap || 20;
    items.slice(0, limit).forEach((rel) => console.log(prefix + rel));
    if (items.length > limit) console.log(prefix + '… 还有 ' + (items.length - limit) + ' 个');
}

function main() {
    const opts = parseArgs(process.argv);

    if (!fs.existsSync(opts.source)) {
        console.error('上游目录不存在: ' + opts.source);
        process.exit(2);
    }

    const source = collect(opts.source);
    const local = collect(LOCAL_PACK);

    const missing = [];
    const differ = [];
    const extra = [];
    for (const [rel, hash] of source) {
        if (!local.has(rel)) missing.push(rel);
        else if (local.get(rel) !== hash) differ.push(rel);
    }
    for (const rel of local.keys()) {
        if (!source.has(rel)) extra.push(rel);
    }

    console.log('上游: ' + opts.source);
    console.log('本地: ' + path.relative(REPO_ROOT, LOCAL_PACK));
    console.log('上游文件 ' + source.size + '，本地 ' + local.size +
        '，缺失 ' + missing.length + '，不一致 ' + differ.length + '，本地独有 ' + extra.length);

    if (!opts.quiet && !opts.apply) {
        printList('  缺失  ', missing);
        printList('  不一致 ', differ);
        printList('  本地独有 ', extra);
    }

    if (opts.apply) {
        for (const rel of missing.concat(differ)) {
            const dst = path.join(LOCAL_PACK, rel);
            fs.mkdirSync(path.dirname(dst), { recursive: true });
            fs.copyFileSync(path.join(opts.source, rel), dst);
        }
        console.log('已复制 ' + (missing.length + differ.length) + ' 个文件');
        printList('  本地独有（未删除） ', extra);
        return;
    }

    const drift = missing.length + differ.length;
    if (drift > 0) {
        console.error('内置包快照与上游不一致，运行 node scripts/sync-builtin.js --apply 同步。');
        process.exit(1);
    }
    console.log('内置包快照与上游一致。');
}

main();
