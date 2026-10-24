'use strict';

// services/import_plan 纯策略用例（docs/15 §7.1）
//
// 只覆盖"解析 → 计划 → 决议"的纯逻辑：不读盘、不碰 Blockbench 全局。

const { describe, test, expect } = require('bun:test');
const keys = require('../../src/doc/keys.js');
const plan = require('../../src/services/import_plan.js');

/** 合法零件 JSON（单变体简写：variants 的值直接是 VariantConfig）。 */
function partJson(overrides) {
    return JSON.stringify({
        variants: {
            model: 'machine_max:model/hull',
            textures: { default: 'machine_max:block/hull' },
            tags: [],
        },
        ...(overrides || {}),
    });
}

/** 造一个输入条目。 */
function input(fileName, content) {
    return { name: fileName, content: content === undefined ? partJson() : content, path: '/tmp/' + fileName };
}

function inputsOf(fileNames, content) {
    return fileNames.map((n) => input(n, content));
}

/**
 * docs/15 §4.0 的 8 条后置条件，每条用例末尾调用。
 * @param {{entries: Array, cancelled: boolean}} resolved
 * @param {ReturnType<typeof plan.planImports>} p
 */
function expectPlanInvariants(resolved, p) {
    const entries = resolved.entries;
    const written = entries.filter((e) => ['create', 'overwrite', 'rename'].includes(e.action));

    // 1. action 取值合法
    for (const e of entries) {
        expect(['create', 'overwrite', 'rename', 'skip', 'cancel']).toContain(e.action);
    }

    // 2. 写入的 finalId 两两不同
    const ids = written.map((e) => e.finalId);
    expect(new Set(ids).size).toBe(ids.length);

    // 3. 每个 finalId 都安全
    for (const e of written) {
        expect(keys.isSafePartId(e.finalId)).toBe(true);
    }

    // 4. overwrite 只覆盖自己；其余不得落在任何既有 key 上
    for (const e of written) {
        if (e.action === 'overwrite') {
            expect(e.finalId).toBe(e.partId);
        } else {
            expect(p.takenIds.includes(e.finalId)).toBe(false);
        }
    }

    // 5. new 条目的 finalId 就是 partId（cancel 决议没有写入，finalId 为空）
    if (!resolved.cancelled) {
        for (const e of entries) {
            if (e.state === 'new') expect(e.finalId).toBe(e.partId);
        }
    }

    // 6. cancel 时不写任何东西
    if (resolved.cancelled) expect(written.length).toBe(0);

    // 7. 写入条目 finalId 非空
    for (const e of written) expect(typeof e.finalId === 'string' && e.finalId.length > 0).toBe(true);

    // 8. duplicate 与 leader 不共享 partConfig 对象
    for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        if (e.state !== 'duplicate') continue;
        expect(e.leaderIndex).not.toBeNull();
        expect(entries[e.leaderIndex].partConfig).not.toBe(e.partConfig);
    }
}

/** planImports + resolvePlan + 后置条件，返回 resolved。 */
function run(inputs, parts, action) {
    const p = plan.planImports(inputs, parts || {});
    const resolved = plan.resolvePlan(p, action || 'overwrite');
    expectPlanInvariants(resolved, p);
    return { p, resolved };
}

function idsOf(resolved) {
    return resolved.entries
        .filter((e) => ['create', 'overwrite', 'rename'].includes(e.action))
        .map((e) => e.finalId);
}

describe('import_plan.planImports', () => {
    test('3 个合法零件 → 3 条 new，无失败与冲突', () => {
        const p = plan.planImports(inputsOf(['a.json', 'b.json', 'c.json']), {});
        expect(p.failures).toEqual([]);
        expect(p.entries.map((e) => e.state)).toEqual(['new', 'new', 'new']);
        expect(p.existingIds).toEqual([]);
        expect(p.duplicateIds).toEqual([]);
        expect(p.takenIds).toEqual([]);
        expect(p.entries.map((e) => e.partId)).toEqual(['a', 'b', 'c']);
    });

    test('混入坏 JSON：只失败该文件，其余照常进 entries', () => {
        const p = plan.planImports([
            input('a.json'),
            input('bad.json', '{ oops'),
            input('c.json'),
        ], {});
        expect(p.entries.map((e) => e.fileName)).toEqual(['a.json', 'c.json']);
        expect(p.failures).toEqual([
            { fileName: 'bad.json', reason: 'bad_json', detail: expect.any(String) },
        ]);
        expect(p.entries.length + p.failures.length).toBe(3);
    });

    test('connector JSON（无 variants）判 bad_part，不产生空零件', () => {
        const connector = JSON.stringify({
            locator: 'machine_max:hull',
            definition: { position: [0, 0, 0] },
            signal_targets: [],
        });
        const p = plan.planImports([input('connector.json', connector)], {});
        expect(p.entries).toEqual([]);
        expect(p.failures[0].reason).toBe('bad_part');
        expect(p.failures[0].fileName).toBe('connector.json');
    });

    test('单变体简写（variants 内层）被接受', () => {
        const p = plan.planImports([input('hull.json')], {});
        expect(p.entries.length).toBe(1);
        expect(Object.keys(p.entries[0].partConfig.variants)).toEqual(['default']);
    });

    test('顶层 {model} 的错误形态判 bad_part', () => {
        const wrong = JSON.stringify({ model: 'machine_max:model/hull', textures: { default: 'x' } });
        const p = plan.planImports([input('bad.json', wrong)], {});
        expect(p.entries).toEqual([]);
        expect(p.failures[0].reason).toBe('bad_part');
    });

    test('variants 为空对象 / 空数组一律 bad_part', () => {
        for (const content of ['{"variants":{}}', '{"variants":[]}', '{}', 'null']) {
            const p = plan.planImports([input('x.json', content)], {});
            expect(p.entries).toEqual([]);
            expect(p.failures[0].reason).toBe('bad_part');
        }
    });

    test('非法 partId 判 bad_part_id', () => {
        const cases = [
            ['...json', '..'],
            ['A.json', 'A'],
            ['con.json', 'con'],
            ['con_hull.json', 'con_hull'],
        ];
        for (const [fileName, partId] of cases) {
            const p = plan.planImports([input(fileName)], {});
            expect(p.entries).toEqual([]);
            expect(p.failures[0]).toMatchObject({ reason: 'bad_part_id', detail: partId });
        }
    });

    test('constructor.json 不因原型链被判成 existing', () => {
        const p = plan.planImports([input('constructor.json')], {});
        expect(p.entries.length).toBe(1);
        expect(p.entries[0].state).toBe('new');
        expect(p.existingIds).toEqual([]);
        expect(p.takenIds).toEqual([]);
    });

    test('与现有 parts 冲突 → existing 并进 existingIds', () => {
        const p = plan.planImports(inputsOf(['a.json', 'b.json']), { a: {}, b: {} });
        expect(p.entries.map((e) => e.state)).toEqual(['existing', 'existing']);
        expect(p.existingIds).toEqual(['a', 'b']);
        expect(p.duplicateIds).toEqual([]);
        expect(p.takenIds.sort()).toEqual(['a', 'b']);
    });

    test('批内同名 → 第二条 duplicate，leaderIndex 指 entries[0]', () => {
        const p = plan.planImports([
            { name: 'a.json', content: partJson(), path: '/x/a.json' },
            { name: 'a.json', content: partJson(), path: '/y/a.json' },
        ], {});
        expect(p.entries.map((e) => e.state)).toEqual(['new', 'duplicate']);
        expect(p.entries[1].leaderIndex).toBe(0);
        expect(p.duplicateIds).toEqual(['a']);
        expect(p.existingIds).toEqual([]);
    });

    test('3 份同名 → 后两条都指向 entries[0]（链式）', () => {
        const p = plan.planImports(inputsOf(['a.json', 'a.json', 'a.json']), {});
        expect(p.entries.map((e) => e.state)).toEqual(['new', 'duplicate', 'duplicate']);
        expect(p.entries[1].leaderIndex).toBe(0);
        expect(p.entries[2].leaderIndex).toBe(0);
        expect(p.duplicateIds).toEqual(['a']);
    });

    test('同名但一个 existing 一个 new → 先出现的 existing 是 leader', () => {
        const p = plan.planImports(inputsOf(['a.json', 'a.json']), { a: {} });
        expect(p.entries.map((e) => e.state)).toEqual(['existing', 'duplicate']);
        expect(p.entries[1].leaderIndex).toBe(0);
        expect(p.existingIds).toEqual(['a']);
    });

    test('失败文件不占 entries 下标（leaderIndex 基准是 entries）', () => {
        const p = plan.planImports([
            input('bad.json', '{'),
            input('a.json'),
            input('a.json'),
        ], {});
        expect(p.entries.length).toBe(2);
        expect(p.entries[1].leaderIndex).toBe(0);
    });

    test('空内容 / 非字符串内容 / 缺文件名 → 失败但守恒', () => {
        const p = plan.planImports([
            { name: 'empty.json', content: '   ' },
            { name: 'buf.json', content: { type: 'Buffer', data: [] } },
            { path: '', content: partJson() },
        ], {});
        expect(p.entries).toEqual([]);
        expect(p.failures.map((f) => f.reason)).toEqual(['empty_content', 'read_failed', 'read_failed']);
    });

    test('缺 name 时用 path 的 basename 兜底', () => {
        const p = plan.planImports([{ path: 'C:\\\\x\\\\y\\\\hull.json', content: partJson() }], {});
        expect(p.entries.length).toBe(1);
        expect(p.entries[0].fileName).toBe('hull.json');
        expect(p.entries[0].partId).toBe('hull');
    });

    test('不修改 existingParts；takenIds 覆盖全部既有 key', () => {
        const parts = { a: { x: 1 }, 'a_1': { x: 2 } };
        const before = JSON.parse(JSON.stringify(parts));
        const p = plan.planImports(inputsOf(['a.json']), parts);
        expect(parts).toEqual(before);
        expect(p.takenIds.sort()).toEqual(['a', 'a_1']);
    });

    test('每条 entry 的 partConfig 都是独立对象', () => {
        const p = plan.planImports(inputsOf(['a.json', 'a.json', 'b.json']), {});
        expect(p.entries[0].partConfig).not.toBe(p.entries[1].partConfig);
        p.entries[0].partConfig.icon = 'changed';
        expect(p.entries[1].partConfig.icon).toBe('');
    });
});

describe('import_plan.resolvePlan — 分配与覆盖', () => {
    test('无冲突 + overwrite（无 existing）→ create 写原 id', () => {
        const { resolved } = run(inputsOf(['a.json', 'b.json']), {}, 'overwrite');
        expect(idsOf(resolved)).toEqual(['a', 'b']);
        expect(resolved.cancelled).toBe(false);
    });

    test('批次外相邻 key 的 P0 回归：parts={a, a_1} + [a.json] rename → a_2', () => {
        const { resolved } = run(inputsOf(['a.json']), { a: {}, a_1: {} }, 'rename');
        expect(idsOf(resolved)).toEqual(['a_2']);
        expect(idsOf(resolved)).not.toContain('a_1');
    });

    test('混合批 existing b + new b_1 + duplicate b.json', () => {
        const inputs = inputsOf(['b.json', 'b_1.json', 'b.json']);
        const parts = { b: {} };

        const rename = run(inputs, parts, 'rename').resolved;
        expect(rename.entries.map((e) => e.action)).toEqual(['rename', 'create', 'rename']);
        expect(idsOf(rename)).toEqual(['b_2', 'b_1', 'b_3']);

        const overwrite = run(inputs, parts, 'overwrite').resolved;
        expect(overwrite.entries.map((e) => e.action)).toEqual(['overwrite', 'create', 'rename']);
        expect(idsOf(overwrite)).toEqual(['b', 'b_1', 'b_2']);

        const skip = run(inputs, parts, 'skip').resolved;
        expect(skip.entries.map((e) => e.action)).toEqual(['skip', 'create', 'skip']);
        expect(idsOf(skip)).toEqual(['b_1']);
    });

    test('两个 existing 同时 overwrite 各自覆盖一次（后置条件 3 的边界）', () => {
        const { resolved } = run(inputsOf(['a.json', 'b.json']), { a: {}, b: {} }, 'overwrite');
        expect(idsOf(resolved)).toEqual(['a', 'b']);
    });

    test('批内同名 + overwrite（无 existing）→ a / a_1', () => {
        const { resolved } = run(inputsOf(['a.json', 'a.json']), {}, 'overwrite');
        expect(resolved.entries.map((e) => e.action)).toEqual(['create', 'rename']);
        expect(idsOf(resolved)).toEqual(['a', 'a_1']);
    });

    test('批内同名 + skip（leader=existing）→ 全部跳过', () => {
        const { resolved } = run(inputsOf(['a.json', 'a.json']), { a: {} }, 'skip');
        expect(resolved.entries.map((e) => e.action)).toEqual(['skip', 'skip']);
        expect(idsOf(resolved)).toEqual([]);
    });

    test('new 条目不被 overwrite / rename / skip 牵连', () => {
        for (const action of ['overwrite', 'rename', 'skip']) {
            const { resolved } = run(inputsOf(['a.json', 'n.json']), { a: {} }, action);
            const n = resolved.entries.find((e) => e.partId === 'n');
            expect(n.action).toBe('create');
            expect(n.finalId).toBe('n');
        }
    });

    test('三份同名 rename → 三个互异 key', () => {
        const { resolved } = run(inputsOf(['a.json', 'a.json', 'a.json']), {}, 'rename');
        expect(idsOf(resolved)).toEqual(['a', 'a_1', 'a_2']);
    });

    test('cancel → 全部 cancel、cancelled=true、零写入', () => {
        const { resolved } = run(inputsOf(['a.json', 'new.json']), { a: {} }, 'cancel');
        expect(resolved.cancelled).toBe(true);
        expect(resolved.entries.every((e) => e.action === 'cancel')).toBe(true);
        expect(idsOf(resolved)).toEqual([]);
    });

    test('128 长度 + 重名 → 精确截短值，原 key 未被写', () => {
        const long = 'a'.repeat(128);
        const { resolved } = run([input(long + '.json')], { [long]: {} }, 'rename');
        expect(idsOf(resolved)).toEqual(['a'.repeat(126) + '_1']);
    });

    test('128 长度的 new 条目原样保留，副本截短', () => {
        const long = 'a'.repeat(128);
        const { resolved } = run(inputsOf([long + '.json', long + '.json']), {}, 'overwrite');
        expect(idsOf(resolved)).toEqual([long, 'a'.repeat(126) + '_1']);
    });

    test('未知 action 抛 TypeError', () => {
        const p = plan.planImports(inputsOf(['a.json']), {});
        for (const bad of ['overwrit', '', null, undefined]) {
            expect(() => plan.resolvePlan(p, bad)).toThrow(TypeError);
        }
    });
});

describe('import_plan.resolvePlan — 纯函数性', () => {
    test('不修改 plan，连调两次结果深相等', () => {
        const p = plan.planImports(inputsOf(['a.json', 'a.json', 'b.json']), { a: {} });
        const snapshot = JSON.parse(JSON.stringify(p.entries));
        const first = plan.resolvePlan(p, 'rename');
        const second = plan.resolvePlan(p, 'rename');
        expect(p.entries).toEqual(snapshot);
        expect(first).toEqual(second);
    });

    test('两次 resolve 传入的 partConfig 仍是 plan 里的同一引用（便于写配置）', () => {
        const p = plan.planImports(inputsOf(['a.json']), {});
        const resolved = plan.resolvePlan(p, 'overwrite');
        expect(resolved.entries[0].partConfig).toBe(p.entries[0].partConfig);
    });

    test('planImports 不修改 inputs', () => {
        const inputs = inputsOf(['a.json', 'b.json']);
        const snapshot = inputs.map((i) => ({ ...i }));
        plan.planImports(inputs, {});
        expect(inputs).toEqual(snapshot);
    });
});
