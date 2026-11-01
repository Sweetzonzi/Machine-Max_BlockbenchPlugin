'use strict';

// 面板里的地形碰撞模式下拉是手写的，必须与 schema / field_specs 的枚举保持一致。
// 新增模式时 schema、Codec ENUM、面板 select 三处容易漏改，这里把 select 钉在 field_specs 上。

const fs = require('fs');
const path = require('path');
const { describe, test, expect } = require('bun:test');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATE = path.join(REPO_ROOT, 'src', 'ui', 'panels', 'sub_part_panel.html');
const { SPECS } = require('../../src/doc/field_specs.generated.js');

function blockCollisionOptions(html) {
    const select = html.match(/<select[^>]*config\.block_collision[\s\S]*?<\/select>/);
    if (!select) return null;
    const values = [];
    const re = /<option\s+value="([^"]+)"/g;
    let match;
    while ((match = re.exec(select[0]))) values.push(match[1]);
    return values;
}

describe('sub_part_panel.html', () => {
    test('碰撞模式下拉与 field_specs 枚举一致', () => {
        const values = blockCollisionOptions(fs.readFileSync(TEMPLATE, 'utf8'));
        expect(values).not.toBeNull();
        expect(values.slice().sort()).toEqual(
            SPECS.sub_part.fields.block_collision.enum.slice().sort()
        );
    });
});
