'use strict';

// 内置内容包同步回归：上游 7629416b 的 53 个子系统定义 / 新履带类型 / 已删 WIP 示例。
// 只检查 vendored 快照，不依赖构建注入的 __BUILTIN_*__ 常量。

const { describe, test, expect } = require('bun:test');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..', 'src', 'builtin', 'builtin', 'machine_max');
const SUB = path.join(ROOT, 'subsystems');

function walk(dir) {
    let out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out = out.concat(walk(full));
        else if (entry.name.endsWith('.json')) out.push(full);
    }
    return out;
}

describe('builtin 内容包同步', () => {
    test('53 个子系统定义，含 track_controller / track_drive', () => {
        const files = walk(SUB);
        expect(files).toHaveLength(53);
        expect(fs.existsSync(path.join(SUB, 'track_controller', 'track_controller_standard.json')))
            .toBe(true);
        expect(fs.existsSync(path.join(SUB, 'track_drive', 'track_drive_heavy.json')))
            .toBe(true);
    });

    test('WIP battery / loader 示例已删除，新材质与瞄准镜已同步', () => {
        expect(fs.existsSync(path.join(SUB, 'battery'))).toBe(false);
        expect(fs.existsSync(path.join(SUB, 'loader'))).toBe(false);
        expect(fs.existsSync(path.join(ROOT, 'materials', 'internal_machinery.json'))).toBe(true);
        expect(fs.existsSync(path.join(SUB, 'sight', 'gunner_sight_dual_stb.json'))).toBe(true);
    });
});
