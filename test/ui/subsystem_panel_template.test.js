'use strict';

// 子系统面板的模板由 subsystem_types.js 的 dynamicFields 驱动渲染。
// 这里把「注册表里的编辑器类型」「模板里的分支」「模板调用的方法」三处钉在一起：
// 新增字段忘了加分支、或模板调用了不存在的方法，都会在单测里暴露，
// 而不是等作者在 Blockbench 里点到那一栏才发现是空输入框。

const fs = require('fs');
const path = require('path');
const { describe, test, expect } = require('bun:test');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATE_PATH = path.join(REPO_ROOT, 'src', 'ui', 'panels', 'subsystem_panel.html');
const PANEL_PATH = path.join(REPO_ROOT, 'src', 'ui', 'SubsystemPanel.vue.js');

const ssTypes = require('../../src/core/subsystem_types.js');

/** 型号定义由模板里的独立 select 渲染，不进 dynamicFields 循环 */
const HANDLED_OUTSIDE_LOOP = ['definition_selector'];

// 通用编辑器：属于面板的编辑器词汇（SUBSUMPTION 常量里登记过），
// 当前没有字段用到也不算残留，作者随时可能把某个字段改成它们。
const GENERIC_EDITORS = ['enum_selector', 'json_textarea'];

const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
const panel = fs.readFileSync(PANEL_PATH, 'utf8');

/** 注册表用到的全部编辑器类型 */
function registryEditors() {
    const editors = new Set();
    for (const type of ssTypes.getAllTypes()) {
        for (const field of type.dynamicFields || []) {
            editors.add(field.editor);
        }
    }
    return editors;
}

/** 模板里的 v-if / v-else-if 分支声明的编辑器类型 */
function templateEditors() {
    const editors = new Set();
    const re = /field\.editor\s*===\s*'([^']+)'/g;
    let match;
    while ((match = re.exec(template))) editors.add(match[1]);
    return editors;
}

describe('subsystem_panel.html', () => {
    test('注册表里的每个编辑器都有模板分支', () => {
        const inTemplate = templateEditors();
        const missing = [...registryEditors()].filter((editor) =>
            HANDLED_OUTSIDE_LOOP.indexOf(editor) < 0 && !inTemplate.has(editor));
        expect(missing).toEqual([]);
    });

    test('模板分支不残留注册表里已无人使用的编辑器', () => {
        const declared = registryEditors();
        const stale = [...templateEditors()].filter((editor) =>
            !declared.has(editor) && GENERIC_EDITORS.indexOf(editor) < 0);
        expect(stale).toEqual([]);
    });

    test('模板调用的方法都在面板里定义', () => {
        const called = new Set();
        const re = /@(?:click|change)="([A-Za-z_$][\w$]*)\(/g;
        let match;
        while ((match = re.exec(template))) called.add(match[1]);
        expect(called.size).toBeGreaterThan(0);

        const missing = [...called].filter((name) =>
            panel.indexOf(name + ': function') < 0
            && panel.indexOf(name + ' = function') < 0);
        expect(missing).toEqual([]);
    });

    test('交付规格编辑器与 schema 的必填子块一致', () => {
        // 面板必须覆盖 pattern / length 两个必填子块，以及可选的 recharge 开关
        for (const marker of [
            'onBeltLengthChange', 'addBeltPatternEntry',
            'onBeltPatternAmmoChange', 'onBeltPatternCountChange', 'switchBeltRecharge',
        ]) {
            expect(panel).toContain(marker + ': function');
            expect(template).toContain(marker + '(');
        }
    });
});
