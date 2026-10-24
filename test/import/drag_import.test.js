'use strict';

// drag_import 编排用例（docs/15 §7.2）
//
// 三条硬约束：
//   1. 模块顶层解构的依赖（showToast / getConfig / flushSave / showConflictDialog /
//      resolveBoneReferences）必须先 patch 再 require drag_import；
//   2. `undo.runConfigEdit` 是属性调用，必须**在 require 之后** patch（ops 模块在加载时
//      解构它，先 patch 会让 ops 永久绑定测试桩）；
//   3. bun test 同进程共享模块表：先清 drag_import 的缓存，afterAll 还原所有 patch 与缓存。

const path = require('path');
const { describe, test, expect, beforeEach, afterAll } = require('bun:test');

const R = (p) => path.join(__dirname, '../../', p);
const DRAG = R('src/import/drag_import.js');

const calls = { toasts: [], edits: 0, dialogs: [], flushed: 0, icons: 0, active: [], reads: 0 };

let cfg = null;
let getConfigImpl = () => cfg;
let dialogAction = 'overwrite';
let deferDialog = false;
let pendingResolve = null;
let readImpl = null;
let throwOnEdit = false;
let editInProgress = false;
let boneUnresolved = 0;

const notify = require(R('src/utils/notify.js'));
const persistence = require(R('src/utils/persistence.js'));
const bone = require(R('src/import/bone_resolver.js'));
const conflict = require(R('src/import/conflict_dialog.js'));
const undo = require(R('src/core/undo.js'));
const svc = require(R('src/services/import.js'));
const opsSession = require(R('src/ops/session.js'));
const icons = require(R('src/mode/icons.js'));

const ORIGINALS = {
    showToast: notify.showToast,
    getConfig: persistence.getConfig,
    flushSave: persistence.flushSave,
    resolveBoneReferences: bone.resolveBoneReferences,
    showConflictDialog: conflict.showConflictDialog,
    runConfigEdit: undo.runConfigEdit,
    isEditInProgress: undo.isEditInProgress,
    readTextFile: svc.readTextFile,
    setActive: opsSession.setActive,
    refreshOutlinerIcons: icons.refreshOutlinerIcons,
};

// ── 解构依赖：先 patch ───────────────────────────────────────────────────────
notify.showToast = (text, type) => { calls.toasts.push({ text, type }); };
persistence.getConfig = () => getConfigImpl();
persistence.flushSave = () => { calls.flushed++; };
bone.resolveBoneReferences = (config, partId) => {
    const part = config.parts[partId];
    if (part) part._unresolved_bones = new Array(boneUnresolved).fill('bone');
};
conflict.showConflictDialog = (options, cb) => {
    calls.dialogs.push(options);
    if (deferDialog) { pendingResolve = cb; return; }
    cb(dialogAction);
};
svc.readTextFile = (p) => {
    calls.reads++;
    if (readImpl) return readImpl(p);
    throw new Error('ENOENT: ' + p);
};
icons.refreshOutlinerIcons = () => { calls.icons++; };
opsSession.setActive = (config, options) => { calls.active.push(options); return { ok: true }; };

// ── 先加载 drag_import（顺带加载 ops 等内部依赖）────────────────────────────
delete require.cache[require.resolve(DRAG)];
const drag = require(DRAG);

// ── 属性调用：后 patch ──────────────────────────────────────────────────────
undo.runConfigEdit = (label, fn) => {
    calls.edits++;
    if (!throwOnEdit) return fn();
    // 模拟"抛出并回滚"：记录态下 runConfigEdit 会 cancelEdit(true)
    const snapshot = cfg.parts ? JSON.parse(JSON.stringify(cfg.parts)) : undefined;
    try {
        fn();
    } finally {
        cfg.parts = snapshot;
    }
    throw new Error('boom');
};
undo.isEditInProgress = () => editInProgress;

afterAll(() => {
    notify.showToast = ORIGINALS.showToast;
    persistence.getConfig = ORIGINALS.getConfig;
    persistence.flushSave = ORIGINALS.flushSave;
    bone.resolveBoneReferences = ORIGINALS.resolveBoneReferences;
    conflict.showConflictDialog = ORIGINALS.showConflictDialog;
    undo.runConfigEdit = ORIGINALS.runConfigEdit;
    undo.isEditInProgress = ORIGINALS.isEditInProgress;
    svc.readTextFile = ORIGINALS.readTextFile;
    opsSession.setActive = ORIGINALS.setActive;
    icons.refreshOutlinerIcons = ORIGINALS.refreshOutlinerIcons;
    delete require.cache[require.resolve(DRAG)];
});

// ── 夹具 ───────────────────────────────────────────────────────────────────
function partJson() {
    return JSON.stringify({
        variants: {
            model: 'machine_max:model/hull',
            textures: { default: 'machine_max:block/hull' },
            tags: [],
        },
    });
}

function file(name, content) {
    return { name, path: '/src/' + name, content: content === undefined ? partJson() : content };
}

function setCfg(parts) {
    cfg = { parts: parts || {}, _uiState: {} };
    return cfg;
}

function lastToast() {
    return calls.toasts[calls.toasts.length - 1];
}

function keysOf(parts) {
    return Object.keys(parts || {}).sort();
}

beforeEach(() => {
    calls.toasts = [];
    calls.edits = 0;
    calls.dialogs = [];
    calls.flushed = 0;
    calls.icons = 0;
    calls.active = [];
    calls.reads = 0;
    cfg = null;
    getConfigImpl = () => cfg;
    dialogAction = 'overwrite';
    deferDialog = false;
    pendingResolve = null;
    readImpl = null;
    throwOnEdit = false;
    editInProgress = false;
    boneUnresolved = 0;
});

describe('drag_import.importParts — 一次撤销 / 一次落盘 / 一条提示', () => {
    test('3 个无冲突文件：runConfigEdit 1 次、flushSave 1 次、toast 1 次', () => {
        setCfg({});
        drag.importParts([file('a.json'), file('b.json'), file('c.json')]);

        expect(calls.dialogs.length).toBe(0);
        expect(calls.edits).toBe(1);
        expect(calls.flushed).toBe(1);
        expect(calls.icons).toBe(1);
        expect(calls.toasts.length).toBe(1);
        expect(calls.toasts[0]).toEqual({ text: '已导入 3 个零件', type: 'positive' });
        expect(keysOf(cfg.parts)).toEqual(['a', 'b', 'c']);
        expect(calls.active.length).toBe(1);
        expect(calls.active[0].partId).toBe('a');
    });

    test('有 2 个冲突（混合批）：对话框 1 次、isBatch=true、整批一次编辑', () => {
        setCfg({ a: {}, b: {} });
        drag.importParts([file('a.json'), file('b.json'), file('c.json')]);

        expect(calls.dialogs.length).toBe(1);
        expect(calls.dialogs[0].isBatch).toBe(true);
        expect(calls.dialogs[0].conflictIds.slice().sort()).toEqual(['a', 'b']);
        expect(calls.edits).toBe(1);
        expect(calls.flushed).toBe(1);
        expect(keysOf(cfg.parts)).toEqual(['a', 'b', 'c']);
    });

    test('本批全部冲突 + skip：0 编辑 / 0 落盘 / 0 刷新，toast 已跳过', () => {
        setCfg({ a: {}, b: {} });
        dialogAction = 'skip';
        drag.importParts([file('a.json'), file('b.json')]);

        expect(calls.edits).toBe(0);
        expect(calls.flushed).toBe(0);
        expect(calls.icons).toBe(0);
        expect(calls.active.length).toBe(0);
        expect(calls.toasts.length).toBe(1);
        expect(calls.toasts[0].text).toBe('已跳过 2 个零件');
    });

    test('部分冲突 + skip：未冲突文件照常导入', () => {
        setCfg({ a: {} });
        dialogAction = 'skip';
        drag.importParts([file('a.json'), file('b.json')]);

        expect(keysOf(cfg.parts)).toEqual(['a', 'b']);
        expect(calls.edits).toBe(1);
        expect(calls.toasts[0].text).toBe('已导入 1 个零件（跳过 1）');
    });

    test('全部冲突 + cancel：整批不写，配置对象不被改动', () => {
        const original = { a: { tag: 'keep' } };
        setCfg(original);
        dialogAction = 'cancel';
        drag.importParts([file('a.json'), file('n.json')]);

        expect(calls.edits).toBe(0);
        expect(calls.flushed).toBe(0);
        expect(calls.icons).toBe(0);
        expect(calls.active.length).toBe(0);
        expect(cfg.parts).toEqual({ a: { tag: 'keep' } });
        expect(calls.toasts.length).toBe(1);
        expect(calls.toasts[0].text).toBe('已取消导入');
    });

    test('混入 1 个坏文件：其余写入，toast 指出文件名', () => {
        setCfg({});
        drag.importParts([file('ok1.json'), file('bad.json', '{ nope'), file('ok2.json')]);

        expect(keysOf(cfg.parts)).toEqual(['ok1', 'ok2']);
        expect(calls.edits).toBe(1);
        expect(calls.toasts.length).toBe(1);
        expect(calls.toasts[0].text).toContain('bad.json');
        expect(calls.toasts[0].type).toBe('warning');
    });

    test('批内同名（无 existing）：写入 {a, a_1}，不弹框', () => {
        setCfg({});
        drag.importParts([
            file('a.json'),
            { name: 'a.json', path: '/other/a.json', content: partJson() },
        ]);

        expect(calls.dialogs.length).toBe(0);
        expect(keysOf(cfg.parts)).toEqual(['a', 'a_1']);
        expect(calls.toasts[0].text).toBe('已导入 2 个零件');
    });

    test('空输入 / 全非 JSON：不弹框、不 toast、0 次写入', () => {
        setCfg({});
        drag.importParts([]);
        drag.importParts([{ name: 'x.txt', content: 'whatever' }]);

        expect(calls.toasts.length).toBe(0);
        expect(calls.dialogs.length).toBe(0);
        expect(calls.edits).toBe(0);
        expect(cfg.parts).toEqual({});
    });

    test('read_failed：读盘恰好 1 次、0 编辑、error toast', () => {
        setCfg({});
        drag.importParts([{ name: 'x.json', path: '/nope/x.json' }]);

        expect(calls.reads).toBe(1);
        expect(calls.edits).toBe(0);
        expect(calls.toasts.length).toBe(1);
        expect(calls.toasts[0].type).toBe('error');
        expect(calls.toasts[0].text).toContain('无法导入');
    });

    test('empty_content：不读盘、0 编辑、error toast', () => {
        setCfg({});
        drag.importParts([file('x.json', '   ')]);

        expect(calls.reads).toBe(0);
        expect(calls.edits).toBe(0);
        expect(calls.toasts[0].type).toBe('error');
    });

    test('content 为 Buffer 等非字符串：走 path 回退成功', () => {
        setCfg({});
        readImpl = () => partJson();
        drag.importParts([{ name: 'c.json', path: '/x/c.json', content: { type: 'Buffer', data: [] } }]);

        expect(calls.reads).toBe(1);
        expect(keysOf(cfg.parts)).toEqual(['c']);
    });

    test('runConfigEdit 抛错：不落盘、不刷新、不 setActive、报错且 guard 释放', () => {
        setCfg({});
        throwOnEdit = true;
        drag.importParts([file('a.json')]);

        expect(calls.edits).toBe(1);
        expect(calls.flushed).toBe(0);
        expect(calls.icons).toBe(0);
        expect(calls.active.length).toBe(0);
        expect(cfg.parts).toEqual({});
        expect(calls.toasts[0].text).toContain('导入失败');

        // guard 已释放：下一次导入必须能正常进行
        throwOnEdit = false;
        drag.importParts([file('b.json')]);
        expect(keysOf(cfg.parts)).toEqual(['b']);
        expect(calls.edits).toBe(2);
    });

    test('编辑器有未完成操作：不进入 runConfigEdit', () => {
        setCfg({});
        editInProgress = true;
        drag.importParts([file('a.json')]);

        expect(calls.edits).toBe(0);
        expect(calls.toasts[0].text).toContain('未完成的操作');
    });

    test('已有活动零件时不切换 _uiState', () => {
        cfg = { parts: { a: {} }, _uiState: { activePartId: 'a', activeVariantName: 'default' } };
        drag.importParts([file('b.json')]);

        expect(calls.active.length).toBe(0);
    });

    test('未解析骨骼进汇总文案，toast 降级为 warning', () => {
        setCfg({});
        boneUnresolved = 2;
        drag.importParts([file('a.json'), file('b.json'), file('c.json')]);

        expect(calls.toasts[0].type).toBe('warning');
        expect(calls.toasts[0].text).toBe('已导入 3 个零件（6 个骨骼未在大纲树中找到）');
    });

    test('失败文件名超过 3 个时截断', () => {
        setCfg({});
        drag.importParts([
            file('ok.json'),
            file('b1.json', '{'), file('b2.json', '{'), file('b3.json', '{'), file('b4.json', '{'),
        ]);
        expect(calls.toasts[0].text).toContain('失败 4：');
        expect(calls.toasts[0].text).toContain('等 4 个');
    });
});

describe('drag_import.importParts — 异步对话框期间的工程变化', () => {
    test('对话框期间切换工程：整批放弃', () => {
        cfg = { parts: { a: {} }, _uiState: {} };
        deferDialog = true;
        drag.importParts([file('a.json')]);
        expect(calls.dialogs.length).toBe(1);

        cfg = { parts: {}, _uiState: {} };   // getConfig() 返回另一个对象
        pendingResolve('overwrite');

        expect(calls.edits).toBe(0);
        expect(calls.toasts[calls.toasts.length - 1].text).toBe('项目已切换，导入取消');
    });

    test('对话框期间项目关闭：整批放弃', () => {
        cfg = { parts: { a: {} }, _uiState: {} };
        deferDialog = true;
        drag.importParts([file('a.json')]);

        getConfigImpl = () => null;
        pendingResolve('overwrite');

        expect(calls.edits).toBe(0);
        expect(calls.toasts[calls.toasts.length - 1].text).toBe('项目已关闭，导入取消');
    });

    test('并发导入：第二次立即被拒绝', () => {
        cfg = { parts: { a: {} }, _uiState: {} };
        deferDialog = true;
        drag.importParts([file('a.json')]);
        drag.importParts([file('b.json')]);

        expect(calls.dialogs.length).toBe(1);
        expect(calls.toasts.length).toBe(1);
        expect(calls.toasts[0].text).toContain('已有导入流程');

        pendingResolve('overwrite');
        expect(calls.edits).toBe(1);
        expect(calls.toasts[calls.toasts.length - 1].text).toBe('已导入 1 个零件');
    });

    test('回调期间配置新增了冲突：按最新 parts 重新规划并覆盖', () => {
        cfg = { parts: { a: { tag: 'old' } }, _uiState: {} };
        deferDialog = true;
        drag.importParts([file('a.json'), file('b.json')]);

        // 对话框期间另一个入口写入了 b
        cfg.parts.b = { tag: 'user-added' };
        pendingResolve('overwrite');

        expect(calls.edits).toBe(1);
        expect(cfg.parts.a.variants).toBeDefined();
        expect(cfg.parts.b.variants).toBeDefined();
        expect(cfg.parts.b.tag).toBeUndefined();
    });
});
