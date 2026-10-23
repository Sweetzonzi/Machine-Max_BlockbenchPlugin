#!/usr/bin/env node
/**
 * sync-schemas.js — 把兄弟仓库的 JSON Schema 同步进插件的 vendored 快照
 *
 * 上游真值：../Machine-Max/src/main/resources/spark_modules/Machine-Max_Builtin/machine_max/docs
 * 本地快照：src/builtin/builtin/machine_max/docs
 *
 * 用法:
 *   node scripts/sync-schemas.js               # --check（默认）：只报告漂移，退出码 1 表示有漂移
 *   node scripts/sync-schemas.js --apply       # 复制缺失/不同步的文件（不删除本地独有文件）
 *   node scripts/sync-schemas.js --source D:\path\to\docs
 *
 * 设计约束:
 *   - 只用 fs/path，无第三方依赖（与仓库其它脚本一致）
 *   - 构建不读兄弟仓库（不可复现）；本脚本只在人工/CI 显式调用时运行
 *   - 不删除本地独有文件：上游删掉的文件只报告，避免误删
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO_ROOT = path.resolve(__dirname, '..');
const LOCAL_DOCS = path.join(REPO_ROOT, 'src', 'builtin', 'builtin', 'machine_max', 'docs');
const DEFAULT_SOURCE = path.resolve(
    REPO_ROOT, '..', 'Machine-Max',
    'src', 'main', 'resources', 'spark_modules', 'Machine-Max_Builtin', 'machine_max', 'docs'
);
const LOCALES = ['zh_cn', 'en_us'];
const SCHEMA_DIR = 'schemas';

function parseArgs(argv) {
    const opts = { apply: false, source: DEFAULT_SOURCE, quiet: false };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--apply') opts.apply = true;
        else if (a === '--check') opts.apply = false;
        else if (a === '--source') { opts.source = path.resolve(argv[++i]); }
        else if (a === '--quiet') opts.quiet = true;
        else if (a === '-h' || a === '--help') {
            console.log('用法: node scripts/sync-schemas.js [--check|--apply] [--source <docs 目录>]');
            process.exit(0);
        } else {
            console.error('未知参数: ' + a);
            process.exit(2);
        }
    }
    return opts;
}

/** 列出目录下所有 .json（递归），返回相对路径数组（已排序，正斜杠） */
function listJsonFiles(root) {
    const out = [];
    if (!fs.existsSync(root)) return out;
    (function walk(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1));
        for (const ent of entries) {
            const full = path.join(dir, ent.name);
            if (ent.isDirectory()) walk(full);
            else if (ent.isFile() && ent.name.toLowerCase().endsWith('.json')) {
                out.push(path.relative(root, full).split(path.sep).join('/'));
            }
        }
    })(root);
    return out.sort();
}

function hashFile(file) {
    return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

/** 尽力读取上游仓库当前 commit（不 spawn 子进程，避免沙箱管道限制） */
function readSourceRevision(sourceDocs) {
    let dir = sourceDocs;
    for (let i = 0; i < 12; i++) {
        const gitDir = path.join(dir, '.git');
        if (fs.existsSync(gitDir)) {
            try {
                const head = fs.readFileSync(path.join(gitDir, 'HEAD'), 'utf8').trim();
                if (head.startsWith('ref: ')) {
                    const refPath = path.join(gitDir, head.slice(5).trim());
                    if (fs.existsSync(refPath)) return fs.readFileSync(refPath, 'utf8').trim();
                } else {
                    return head;
                }
            } catch (e) { /* 忽略，回退到 mtime */ }
            return null;
        }
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    return null;
}

function syncLocale(locale, opts) {
    const srcRoot = path.join(opts.source, locale, SCHEMA_DIR);
    const dstRoot = path.join(LOCAL_DOCS, locale, SCHEMA_DIR);
    if (!fs.existsSync(srcRoot)) {
        return { locale, error: '上游目录不存在: ' + srcRoot, same: 0, differ: [], onlyLocal: [], onlySource: [], copied: 0 };
    }
    const srcFiles = listJsonFiles(srcRoot);
    const dstFiles = listJsonFiles(dstRoot);
    const srcSet = new Set(srcFiles);
    const dstSet = new Set(dstFiles);

    const differ = [];
    let same = 0;
    for (const rel of srcFiles) {
        if (!dstSet.has(rel)) continue;
        if (hashFile(path.join(srcRoot, rel)) === hashFile(path.join(dstRoot, rel))) same++;
        else differ.push(rel);
    }
    const onlySource = srcFiles.filter((r) => !dstSet.has(r));
    const onlyLocal = dstFiles.filter((r) => !srcSet.has(r));

    let copied = 0;
    if (opts.apply) {
        for (const rel of onlySource.concat(differ)) {
            const to = path.join(dstRoot, rel.split('/').join(path.sep));
            fs.mkdirSync(path.dirname(to), { recursive: true });
            fs.copyFileSync(path.join(srcRoot, rel.split('/').join(path.sep)), to);
            copied++;
        }
    }
    return { locale, same, differ, onlyLocal, onlySource, copied, srcRoot, dstRoot };
}

function main() {
    const opts = parseArgs(process.argv);
    const rev = readSourceRevision(opts.source);
    console.log('上游: ' + opts.source + (rev ? '\n上游 commit: ' + rev.slice(0, 12) : '\n上游 commit: (未找到 .git)'));
    console.log('本地: ' + LOCAL_DOCS);
    console.log('模式: ' + (opts.apply ? 'apply' : 'check'));

    let totalDrift = 0;
    let totalCopied = 0;
    for (const locale of LOCALES) {
        const r = syncLocale(locale, opts);
        if (r.error) { console.error('[' + locale + '] ' + r.error); totalDrift++; continue; }
        console.log('\n[' + locale + '] same=' + r.same + ' differ=' + r.differ.length +
            ' only-in-source=' + r.onlySource.length + ' only-in-local=' + r.onlyLocal.length +
            (opts.apply ? ' copied=' + r.copied : ''));
        if (r.differ.length && !opts.quiet) {
            console.log('  内容不同:');
            for (const f of r.differ.slice(0, 40)) console.log('    ~ ' + f);
            if (r.differ.length > 40) console.log('    … 共 ' + r.differ.length + ' 个');
        }
        if (r.onlySource.length && !opts.quiet) {
            console.log('  仅上游有:');
            for (const f of r.onlySource) console.log('    + ' + f);
        }
        if (r.onlyLocal.length && !opts.quiet) {
            console.log('  仅本地有（不会自动删除）:');
            for (const f of r.onlyLocal) console.log('    - ' + f);
        }
        totalDrift += r.differ.length + r.onlySource.length + r.onlyLocal.length;
        totalCopied += r.copied;
    }

    console.log('\n---');
    if (opts.apply) {
        console.log('已复制 ' + totalCopied + ' 个文件。');
        const after = LOCALES.map((l) => syncLocale(l, { apply: false, source: opts.source }));
        const remain = after.reduce((n, r) => n + r.differ.length + r.onlySource.length + r.onlyLocal.length, 0);
        console.log('同步后剩余漂移: ' + remain);
        process.exit(remain === 0 ? 0 : 1);
    }
    console.log(totalDrift === 0 ? '无漂移。' : '检测到 ' + totalDrift + ' 处漂移（运行 --apply 同步）。');
    process.exit(totalDrift === 0 ? 0 : 1);
}

main();
