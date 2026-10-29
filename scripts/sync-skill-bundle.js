#!/usr/bin/env node
/**
 * sync-skill-bundle.js — 把插件 dist 同步到上游 Machine-Max 的技能包快照
 *
 * 技能包 skills/blockbench-content-pack 随包分发插件的单文件构建产物，
 * bundle-manifest.json 的 plugin 块与 SKILL.md 的版本/快照数量必须和本仓库发布版一致。
 * schema 快照（references/schemas/）不归本脚本管：它由上游 ./gradlew syncSchemas 生成。
 *
 * 用法:
 *   node scripts/sync-skill-bundle.js                 # --check（默认）：只报告漂移，退出码 1 表示有漂移
 *   node scripts/sync-skill-bundle.js --apply         # 写盘：资产 + manifest plugin 块 + SKILL.md 版本/数量
 *   node scripts/sync-skill-bundle.js --source <dir>  # 指定技能包目录（默认 <repo>/../Machine-Max/skills/blockbench-content-pack）
 *   node scripts/sync-skill-bundle.js --apply --source <dir>
 *
 * 设计约束:
 *   - 只用 fs/path/crypto，无第三方依赖、不 spawn 子进程（与仓库其它脚本一致）
 *   - 每次运行可复现：manifest 用 JSON.stringify(…, null, 2) + 换行，与现有排版逐字节一致
 *   - 只在人工显式调用时运行；构建不读兄弟仓库
 *   - 上游 schema 快照数量取自 manifest.schemas.file_count，本脚本只校验与 SKILL.md 文案一致
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_SOURCE = path.resolve(
    REPO_ROOT, '..', 'Machine-Max', 'skills', 'blockbench-content-pack'
);
const DIST = path.join(REPO_ROOT, 'dist', 'machine_max_bb_plugin.js');
const PACKAGE_JSON = path.join(REPO_ROOT, 'package.json');

const ASSET_REL = 'assets/plugins/machine_max_bb_plugin.js';
const MANIFEST_REL = 'bundle-manifest.json';
const SKILL_REL = 'SKILL.md';

const PLUGIN_REPO = 'https://github.com/Sweetzonzi/Machine-Max_BlockbenchPlugin';
const ARTIFACT_KIND = 'rebuilt with scripts/build.js from the working tree at this revision';
const DEFAULT_COMMIT_MESSAGE = 'chore(skill): 随包 Blockbench 插件更新至 ';

const VERSION_IN_ASSET_LINE = /(\[assets\/plugins\/machine_max_bb_plugin\.js\][^\n]*?版本 `)[^`]+(`)/;
const SCHEMA_COUNT_IN_SKILL = /全部 (\d+) 个 JSON/;

function parseArgs(argv) {
    const opts = { apply: false, source: DEFAULT_SOURCE };
    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--apply') opts.apply = true;
        else if (arg === '--check') opts.apply = false;
        else if (arg === '--source') {
            const value = argv[++i];
            if (!value) throw new Error('--source 缺少目录参数');
            opts.source = path.resolve(value);
        } else if (arg === '-h' || arg === '--help') {
            console.log('用法: node scripts/sync-skill-bundle.js [--check|--apply] [--source <技能包目录>]');
            process.exit(0);
        } else {
            throw new Error('未知参数: ' + arg);
        }
    }
    return opts;
}

function sha256(bytes) {
    return crypto.createHash('sha256').update(bytes).digest('hex');
}

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** 读本仓库 HEAD（不 spawn 子进程）：支持 loose ref 与 packed-refs，detached 时直接返回 HEAD */
function readGitHead(dir) {
    let current = dir;
    for (let i = 0; i < 8; i++) {
        const gitDir = path.join(current, '.git');
        if (fs.existsSync(gitDir)) {
            try {
                const head = fs.readFileSync(path.join(gitDir, 'HEAD'), 'utf8').trim();
                if (!head.startsWith('ref: ')) return head;
                const refName = head.slice(5).trim();
                const loose = path.join(gitDir, refName);
                if (fs.existsSync(loose)) return fs.readFileSync(loose, 'utf8').trim();
                const packed = path.join(gitDir, 'packed-refs');
                if (fs.existsSync(packed)) {
                    for (const line of fs.readFileSync(packed, 'utf8').split('\n')) {
                        if (!line || line[0] === '#' || line[0] === '^') continue;
                        const parts = line.trim().split(' ');
                        if (parts.length >= 2 && parts[1] === refName) return parts[0];
                    }
                }
            } catch (_e) { /* 回退到未找到 */ }
            return null;
        }
        const parent = path.dirname(current);
        if (parent === current) break;
        current = parent;
    }
    return null;
}

function localDate() {
    const now = new Date();
    const pad = (n) => (n < 10 ? '0' + n : String(n));
    return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
}

function collectJson(root, base, out) {
    base = base || root;
    out = out || [];
    if (!fs.existsSync(root)) return out;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        const full = path.join(root, entry.name);
        if (entry.isDirectory()) collectJson(full, base, out);
        else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
            out.push(path.relative(base, full).split(path.sep).join('/'));
        }
    }
    return out.sort();
}

function formatBytes(n) {
    return n + ' bytes';
}

/**
 * 计算期望值并逐项比较，返回 { problems, expected, actual }
 * problems 为空表示零漂移。
 */
function evaluate(sourceDir) {
    const problems = [];
    const warnings = [];
    const version = readJson(PACKAGE_JSON).version;
    const head = readGitHead(REPO_ROOT);
    const distBytes = fs.existsSync(DIST) ? fs.readFileSync(DIST) : null;
    const expected = {
        repository: PLUGIN_REPO,
        revision: head,
        source_path: 'dist/machine_max_bb_plugin.js',
        artifact_kind: ARTIFACT_KIND,
        version: version,
        path: ASSET_REL,
        bytes: distBytes ? distBytes.length : null,
        sha256: distBytes ? sha256(distBytes) : null,
    };

    if (!distBytes) problems.push('dist 不存在：请先运行 node scripts/build.js（' + DIST + '）');
    if (!head) problems.push('无法读取本仓库 git HEAD（manifest.plugin.revision 需要它）');

    const manifestPath = path.join(sourceDir, MANIFEST_REL);
    if (!fs.existsSync(manifestPath)) {
        problems.push('技能包 manifest 不存在：' + manifestPath);
        return { problems, warnings, expected, actual: null };
    }
    let manifest;
    try {
        manifest = readJson(manifestPath);
    } catch (e) {
        problems.push('技能包 manifest 无法解析：' + (e.message || e));
        return { problems, warnings, expected, actual: null };
    }

    const actual = { plugin: manifest.plugin || {}, skillText: '' };
    const plugin = actual.plugin;
    for (const field of ['version', 'bytes', 'sha256']) {
        if (expected[field] !== null && plugin[field] !== expected[field]) {
            problems.push('manifest.plugin.' + field + ' 不一致：期望 ' + expected[field] +
                '，实际 ' + plugin[field]);
        }
    }
    // revision 是 provenance：发布时间戳。插件仓库在发布后还会有纯工具链提交，
    // 此时 HEAD 前移但 dist 未变，不构成交付漂移；真正的一致性由 bytes/sha256 保证。
    if (expected.revision && plugin.revision !== expected.revision) {
        warnings.push('manifest.plugin.revision 为 ' + plugin.revision +
            '，本仓库 HEAD 为 ' + expected.revision +
            '（dist 未变时不影响；若是发布提交请重跑 --apply）');
    }
    for (const field of ['source_path', 'path']) {
        if (plugin[field] !== expected[field]) {
            problems.push('manifest.plugin.' + field + ' 不一致：期望 ' + expected[field] +
                '，实际 ' + plugin[field]);
        }
    }
    if (!plugin.repository) problems.push('manifest.plugin.repository 缺失');

    const assetPath = path.join(sourceDir, ASSET_REL);
    if (!fs.existsSync(assetPath)) {
        problems.push('技能包资产不存在：' + assetPath);
    } else if (distBytes) {
        const assetBytes = fs.readFileSync(assetPath);
        if (assetBytes.length !== distBytes.length) {
            problems.push('技能包资产字节数不一致：期望 ' + formatBytes(distBytes.length) +
                '，实际 ' + formatBytes(assetBytes.length));
        }
        if (sha256(assetBytes) !== sha256(distBytes)) {
            problems.push('技能包资产 sha256 不一致：期望 ' + sha256(distBytes) +
                '，实际 ' + sha256(assetBytes));
        }
    }

    // schema 快照数量：manifest 是唯一真值，SKILL.md 文案必须与它一致
    const schemaFileCount = manifest.schemas && manifest.schemas.file_count;
    if (typeof schemaFileCount !== 'number') {
        problems.push('manifest.schemas.file_count 缺失');
    } else {
        const actualSchemaFiles = collectJson(path.join(sourceDir, 'references', 'schemas')).length;
        if (actualSchemaFiles !== schemaFileCount) {
            problems.push('schema 快照文件数不一致：manifest 记录 ' + schemaFileCount +
                '，目录实际 ' + actualSchemaFiles + '（应由上游 ./gradlew syncSchemas 生成）');
        }
    }

    const skillPath = path.join(sourceDir, SKILL_REL);
    if (!fs.existsSync(skillPath)) {
        problems.push('技能包 SKILL.md 不存在：' + skillPath);
    } else {
        const text = fs.readFileSync(skillPath, 'utf8');
        actual.skillText = text;

        const versionMatch = text.match(VERSION_IN_ASSET_LINE);
        if (!versionMatch) {
            problems.push('SKILL.md 未找到插件资产行的版本说明（应形如“版本 `x.y.z`”）');
        } else if (versionMatch[0].indexOf('版本 `' + version + '`') < 0) {
            problems.push('SKILL.md 插件版本文案不是 ' + version + '：' + versionMatch[0]);
        }

        const countMatch = text.match(SCHEMA_COUNT_IN_SKILL);
        if (!countMatch) {
            problems.push('SKILL.md 未找到“全部 N 个 JSON”的 schema 快照数量文案');
        } else if (typeof schemaFileCount === 'number'
            && Number(countMatch[1]) !== schemaFileCount) {
            problems.push('SKILL.md schema 快照数量文案是 ' + countMatch[1] +
                '，manifest 记录 ' + schemaFileCount);
        }
    }

    return { problems, warnings, expected, actual, manifest, version };
}

function apply(sourceDir) {
    const version = readJson(PACKAGE_JSON).version;
    const head = readGitHead(REPO_ROOT);
    if (!fs.existsSync(DIST)) {
        throw new Error('dist 不存在，请先运行 node scripts/build.js: ' + DIST);
    }
    if (!head) throw new Error('无法读取本仓库 git HEAD，无法写 manifest.plugin.revision');

    const manifestPath = path.join(sourceDir, MANIFEST_REL);
    const skillPath = path.join(sourceDir, SKILL_REL);
    if (!fs.existsSync(manifestPath)) throw new Error('技能包 manifest 不存在: ' + manifestPath);
    if (!fs.existsSync(skillPath)) throw new Error('技能包 SKILL.md 不存在: ' + skillPath);

    const distBytes = fs.readFileSync(DIST);
    const manifest = readJson(manifestPath);

    // 1) 资产 = 当前 dist 字节
    const assetPath = path.join(sourceDir, ASSET_REL);
    fs.mkdirSync(path.dirname(assetPath), { recursive: true });
    fs.writeFileSync(assetPath, distBytes);
    console.log('已写入技能包资产 ' + ASSET_REL + '（' + formatBytes(distBytes.length) +
        '，sha256 ' + sha256(distBytes).slice(0, 12) + '…）');

    // 2) manifest.plugin 块：固定键序，追加/覆盖后整体重写
    const previous = manifest.plugin || {};
    manifest.plugin = {
        repository: previous.repository || PLUGIN_REPO,
        revision: head,
        source_path: 'dist/machine_max_bb_plugin.js',
        artifact_kind: previous.artifact_kind || ARTIFACT_KIND,
        version: version,
        path: ASSET_REL,
        bytes: distBytes.length,
        sha256: sha256(distBytes),
    };
    const schemaCount = manifest.schemas && manifest.schemas.file_count;
    if (typeof schemaCount !== 'number') {
        throw new Error('manifest.schemas.file_count 缺失，拒绝重写 manifest（schema 快照应由上游 syncSchemas 生成）');
    }
    manifest.bundled_on = localDate();
    const manifestText = JSON.stringify(manifest, null, 2) + '\n';
    if (fs.readFileSync(manifestPath, 'utf8') !== manifestText) {
        fs.writeFileSync(manifestPath, manifestText, 'utf8');
        console.log('已更新 ' + MANIFEST_REL + ' 的 plugin 块（version ' + version +
            ' / revision ' + head.slice(0, 8) + '）');
    } else {
        console.log(MANIFEST_REL + ' 无变化');
    }

    // 3) SKILL.md：只改资产行的版本与 schema 快照数量文案
    let skillText = fs.readFileSync(skillPath, 'utf8');
    const nextSkillText = skillText
        .replace(VERSION_IN_ASSET_LINE, '$1' + version + '$2')
        .replace(SCHEMA_COUNT_IN_SKILL, '全部 ' + schemaCount + ' 个 JSON');
    if (nextSkillText !== skillText) {
        fs.writeFileSync(skillPath, nextSkillText, 'utf8');
        console.log('已更新 ' + SKILL_REL + '（版本 ' + version + ' / schema 快照 ' + schemaCount + ' 个）');
    } else {
        console.log(SKILL_REL + ' 无变化');
    }
}

function main() {
    const opts = parseArgs(process.argv);

    if (!fs.existsSync(opts.source)) {
        console.error('技能包目录不存在: ' + opts.source);
        process.exit(2);
    }

    if (opts.apply) {
        try {
            apply(opts.source);
        } catch (e) {
            console.error(e && e.message ? e.message : String(e));
            process.exit(2);
        }
        const result = evaluate(opts.source);
        if (result.problems.length) {
            console.error('写盘后仍有漂移：');
            result.problems.forEach((p) => console.error('  - ' + p));
            process.exit(1);
        }
        (result.warnings || []).forEach((w) => console.log('提示: ' + w));
        console.log('技能包资产已与 dist 一致。请在上游仓库 ' +
            path.basename(path.dirname(path.dirname(opts.source))) +
            ' 提交 ' + ASSET_REL + ' / ' + MANIFEST_REL + ' / ' + SKILL_REL);
        console.log('提交信息: ' + DEFAULT_COMMIT_MESSAGE + result.version);
        return;
    }

    const result = evaluate(opts.source);
    console.log('插件 dist: ' + formatBytes(result.expected.bytes || 0) +
        '（version ' + result.expected.version +
        (result.expected.revision ? '，revision ' + result.expected.revision.slice(0, 8) : '') + '）');
    console.log('技能包: ' + opts.source);
    if (result.problems.length) {
        console.error('---- ' + result.problems.length + ' 处漂移 ----');
        result.problems.forEach((p) => console.error('  - ' + p));
        console.error('运行 node scripts/sync-skill-bundle.js --apply 同步。');
        process.exit(1);
    }
    (result.warnings || []).forEach((w) => console.log('提示: ' + w));
    if (result.manifest) {
        console.log('零漂移：manifest plugin 块、SKILL.md 文案与 dist 一致（schema 快照 ' +
            result.manifest.schemas.file_count + ' 个文件）。');
    }
}

try {
    if (require.main === module) main();
} catch (error) {
    console.error(error && error.stack ? error.stack : String(error));
    process.exit(2);
}

module.exports = {
    evaluate,
    apply,
    DEFAULT_SOURCE,
    DIST,
    ASSET_REL,
    MANIFEST_REL,
    SKILL_REL,
};
