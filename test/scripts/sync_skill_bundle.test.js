'use strict';

// sync-skill-bundle.js：上游技能包资产 / manifest plugin 块 / SKILL.md 文案的漂移检测与写盘。
// 用临时技能包目录验证，不触碰真实兄弟仓库。

const { describe, test, expect, afterEach } = require('bun:test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const bundle = require('../../scripts/sync-skill-bundle.js');

const DIST = path.join(__dirname, '..', '..', 'dist', 'machine_max_bb_plugin.js');
const PKG_VERSION = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8')).version;

const tempDirs = [];

afterEach(() => {
    while (tempDirs.length) {
        const dir = tempDirs.pop();
        try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_e) { /* ignore */ }
    }
});

/** 构造一个最小技能包：2 个 schema 快照、旧资产、旧 manifest、旧文案 */
function makeSkillDir() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mm-skill-bundle-'));
    tempDirs.push(dir);

    fs.mkdirSync(path.join(dir, 'references', 'schemas'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'references', 'schemas', 'a.schema.json'), '{}\n', 'utf8');
    fs.writeFileSync(path.join(dir, 'references', 'schemas', 'b.schema.json'), '{}\n', 'utf8');

    fs.mkdirSync(path.join(dir, 'assets', 'plugins'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'assets', 'plugins', 'machine_max_bb_plugin.js'),
        '// stale bundle\n', 'utf8');

    fs.writeFileSync(path.join(dir, 'bundle-manifest.json'), JSON.stringify({
        format_version: 1,
        bundled_on: '2000-01-01',
        schemas: { file_count: 2, files: [] },
        plugin: {
            repository: 'https://example.invalid/plugin',
            revision: 'deadbeef',
            source_path: 'dist/machine_max_bb_plugin.js',
            artifact_kind: 'rebuilt with scripts/build.js from the working tree at this revision',
            version: '0.0.1',
            path: 'assets/plugins/machine_max_bb_plugin.js',
            bytes: 1,
            sha256: '0'.repeat(64),
        },
    }, null, 2) + '\n', 'utf8');

    fs.writeFileSync(path.join(dir, 'SKILL.md'), [
        '## 随包资源与路径',
        '',
        '- [references/schemas/part_definition_schema.json](references/schemas/part_definition_schema.json)：`references/schemas/` 是 builtin 中文目录中全部 1 个 JSON 的快照。',
        '- [assets/plugins/machine_max_bb_plugin.js](assets/plugins/machine_max_bb_plugin.js)：可加载到 Blockbench 的 MachineMax 单文件编译产物，版本 `0.0.1`，含零件与装配体图标自动生成。',
        '',
    ].join('\n'), 'utf8');

    return dir;
}

describe('scripts/sync-skill-bundle.js', () => {
    test('旧资产 / 旧 manifest / 旧文案会被报为漂移', () => {
        const dir = makeSkillDir();
        const result = bundle.evaluate(dir);
        expect(result.problems.length).toBeGreaterThan(0);
        expect(result.problems.join('\n')).toContain('技能包资产字节数不一致');
        expect(result.problems.join('\n')).toContain('manifest.plugin.version');
        expect(result.problems.join('\n')).toContain('SKILL.md schema 快照数量文案');
        // revision 只是 provenance：dist 字节一致时落后于 HEAD 只提示、不判漂移
        expect(result.warnings.join('\n')).toContain('manifest.plugin.revision');
    });

    test('--apply 写入资产、manifest plugin 块与 SKILL.md 文案，之后零漂移且幂等', () => {
        const dir = makeSkillDir();
        bundle.apply(dir);

        const distBytes = fs.readFileSync(DIST);
        const assetBytes = fs.readFileSync(
            path.join(dir, 'assets', 'plugins', 'machine_max_bb_plugin.js'));
        expect(assetBytes.equals(distBytes)).toBe(true);

        const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'bundle-manifest.json'), 'utf8'));
        expect(manifest.plugin.version).toBe(PKG_VERSION);
        expect(manifest.plugin.bytes).toBe(distBytes.length);
        expect(manifest.plugin.sha256)
            .toBe(crypto.createHash('sha256').update(distBytes).digest('hex'));
        expect(manifest.plugin.source_path).toBe('dist/machine_max_bb_plugin.js');
        expect(manifest.plugin.path).toBe('assets/plugins/machine_max_bb_plugin.js');
        // 上游仓库 URL / artifact_kind 是既有字段，写盘时保留
        expect(manifest.plugin.repository).toBe('https://example.invalid/plugin');
        expect(manifest.plugin.artifact_kind).toContain('scripts/build.js');
        // schema 快照块由上游 syncSchemas 维护，写盘不重建它
        expect(manifest.schemas.file_count).toBe(2);

        const skill = fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf8');
        expect(skill).toContain('版本 `' + PKG_VERSION + '`');
        expect(skill).toContain('全部 2 个 JSON');

        expect(bundle.evaluate(dir).problems).toEqual([]);
        expect(bundle.evaluate(dir).warnings).toEqual([]);

        const manifestBefore = fs.readFileSync(path.join(dir, 'bundle-manifest.json'), 'utf8');
        bundle.apply(dir);
        expect(fs.readFileSync(path.join(dir, 'bundle-manifest.json'), 'utf8'))
            .toBe(manifestBefore);
    });

    test('技能包目录缺失时拒绝写盘', () => {
        const missing = path.join(os.tmpdir(), 'mm-skill-bundle-missing-' + Date.now());
        expect(() => bundle.apply(missing)).toThrow();
    });
});
