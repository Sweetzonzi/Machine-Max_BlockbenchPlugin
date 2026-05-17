/**
 * content_pack.test.js — content_pack.js 单元测试
 *
 * 测试内容包 I/O 模块的所有 10 个公开函数：
 * resolveNamespace, readPackMeta, writePackMeta, createContentPack,
 * openContentPack, readAllDefs, writeDef, deleteDef, listDefIds, defExists
 *
 * 使用 bun test 框架: describe / test / expect
 * 遵循 TDD 原则：仅基于 content_pack.js 的公开 API 编写测试
 */

var fs = require('fs');
var path = require('path');
var cp = require('../src/core/content_pack.js');
var { createTempDir, cleanupTempDir } = require('./helpers.js');

describe('ContentPack', function () {

    // =========================================================================
    // resolveNamespace 测试（无需临时目录）
    // =========================================================================

    describe('resolveNamespace', function () {
        test('#1 splits at colon', function () {
            expect(cp.resolveNamespace('my_pack:vehicles')).toBe('my_pack');
        });

        test('#2 returns full string when no colon', function () {
            expect(cp.resolveNamespace('simple_name')).toBe('simple_name');
        });

        test('#3 returns empty string for empty input', function () {
            expect(cp.resolveNamespace('')).toBe('');
        });

        test('#4 returns empty string for null/undefined', function () {
            expect(cp.resolveNamespace(null)).toBe('');
            expect(cp.resolveNamespace(undefined)).toBe('');
        });

        test('#5 returns first namespace when multiple colons', function () {
            expect(cp.resolveNamespace('a:b:c')).toBe('a');
        });
    });

    // =========================================================================
    // createContentPack 测试（需要临时目录）
    // =========================================================================

    describe('createContentPack', function () {
        test('#6 creates directory structure', function () {
            var tmpDir, meta, result;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                meta = {
                    id: 'test:pack',
                    version: '1.0',
                    name: 'Test',
                    author: 'Tester',
                    description: '',
                };
                result = cp.createContentPack(tmpDir, meta);
                expect(result.success).toBe(true);
                expect(result.namespace).toBe('test');
                expect(result.error).toBe(null);

                // meta.json 已写入
                expect(fs.existsSync(path.join(tmpDir, 'meta.json'))).toBe(true);

                // namespace 子目录已创建
                expect(fs.existsSync(path.join(tmpDir, 'test', 'materials'))).toBe(true);
                expect(fs.existsSync(path.join(tmpDir, 'test', 'connectors'))).toBe(true);
                expect(fs.existsSync(path.join(tmpDir, 'test', 'subsystems'))).toBe(true);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#7 rejects existing pack', function () {
            var tmpDir, meta, r1, r2;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                meta = { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' };

                // 第一次应成功
                r1 = cp.createContentPack(tmpDir, meta);
                expect(r1.success).toBe(true);

                // 第二次应失败（meta.json 已存在）
                r2 = cp.createContentPack(tmpDir, meta);
                expect(r2.success).toBe(false);
                expect(r2.namespace).toBe('');
                expect(r2.error).toBeTruthy();
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#8 rejects empty meta.id', function () {
            var tmpDir, meta, result;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                meta = { id: '', version: '1.0', name: 'T', author: 'A', description: '' };
                result = cp.createContentPack(tmpDir, meta);
                expect(result.success).toBe(false);
                expect(result.namespace).toBe('');
                expect(result.error).toBeTruthy();
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#9 rejects missing meta.id', function () {
            var tmpDir, meta, result;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                meta = { version: '1.0', name: 'T', author: 'A', description: '' };
                result = cp.createContentPack(tmpDir, meta);
                expect(result.success).toBe(false);
                expect(result.namespace).toBe('');
                expect(result.error).toBeTruthy();
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });

    // =========================================================================
    // openContentPack 测试
    // =========================================================================

    describe('openContentPack', function () {
        test('#10 validates valid pack', function () {
            var tmpDir, meta, result;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                meta = {
                    id: 'test:pack',
                    version: '1.0',
                    name: 'Test',
                    author: 'Tester',
                    description: '',
                };
                cp.createContentPack(tmpDir, meta);
                result = cp.openContentPack(tmpDir);
                expect(result.valid).toBe(true);
                expect(result.meta.id).toBe('test:pack');
                expect(result.namespace).toBe('test');
                expect(result.error).toBe(null);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#11 rejects missing meta.json', function () {
            var tmpDir, result;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                // 空临时目录，无 meta.json
                result = cp.openContentPack(tmpDir);
                expect(result.valid).toBe(false);
                expect(result.meta).toBe(null);
                expect(result.error).toBeTruthy();
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#12 rejects missing subdirectories', function () {
            var tmpDir, result;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                // 只有 meta.json，没有 namespace 子目录
                cp.writePackMeta(tmpDir, { id: 'test:bad', version: '1.0' });
                result = cp.openContentPack(tmpDir);
                expect(result.valid).toBe(false);
                expect(result.error).toBeTruthy();
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });

    // =========================================================================
    // readAllDefs 测试
    // =========================================================================

    describe('readAllDefs', function () {
        test('#13 returns empty object for empty directory', function () {
            var tmpDir, defs;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });
                defs = cp.readAllDefs(tmpDir, 'test', 'materials');
                expect(defs).toEqual({});
                expect(Object.keys(defs).length).toBe(0);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#14 returns empty object for non-existent directory', function () {
            var tmpDir, defs;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                defs = cp.readAllDefs(tmpDir, 'nonexistent', 'materials');
                expect(defs).toEqual({});
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#15 reads flat files', function () {
            var tmpDir, matDir, defs;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });

                // 手动写入一个材料文件
                matDir = path.join(tmpDir, 'test', 'materials');
                fs.writeFileSync(
                    path.join(matDir, 'structural_steel.json'),
                    JSON.stringify({ friction: [0.5, 0.5, 0.5] }, null, 2)
                );

                defs = cp.readAllDefs(tmpDir, 'test', 'materials');
                expect(defs.structural_steel).toBeDefined();
                expect(defs.structural_steel.friction[0]).toBe(0.5);
                expect(defs.structural_steel.friction[1]).toBe(0.5);
                expect(defs.structural_steel.friction[2]).toBe(0.5);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#16 recursively scans subdirectories', function () {
            var tmpDir, subDir, defs;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });

                subDir = path.join(tmpDir, 'test', 'materials', 'subdir');
                fs.mkdirSync(subDir, { recursive: true });
                fs.writeFileSync(
                    path.join(subDir, 'my_mat.json'),
                    JSON.stringify({ density: 1000 }, null, 2)
                );

                defs = cp.readAllDefs(tmpDir, 'test', 'materials');
                expect(defs.my_mat).toBeDefined();
                expect(defs.my_mat.density).toBe(1000);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#17 skips invalid JSON gracefully', function () {
            var tmpDir, matDir, defs;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });

                matDir = path.join(tmpDir, 'test', 'materials');
                // 有效 JSON 文件
                fs.writeFileSync(
                    path.join(matDir, 'valid_mat.json'),
                    JSON.stringify({ friction: 0.5 }, null, 2)
                );
                // 无效 JSON 文件
                fs.writeFileSync(
                    path.join(matDir, 'invalid_mat.json'),
                    '{ this is not valid json }'
                );

                defs = cp.readAllDefs(tmpDir, 'test', 'materials');
                // 只应包含有效的定义
                expect(defs.valid_mat).toBeDefined();
                expect(defs.valid_mat.friction).toBe(0.5);
                expect(defs.invalid_mat).toBeUndefined();
                // 不应崩溃
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });

    // =========================================================================
    // writeDef + readAllDefs 往返测试
    // =========================================================================

    describe('writeDef', function () {
        test('#18 roundtrip with readAllDefs', function () {
            var tmpDir, defs;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });

                cp.writeDef(tmpDir, 'test', 'materials', 'my_steel', {
                    friction: [0.5, 0.5, 0.5],
                    restitution: 0.3,
                });

                defs = cp.readAllDefs(tmpDir, 'test', 'materials');
                expect(defs.my_steel).toBeDefined();
                expect(defs.my_steel.friction[0]).toBe(0.5);
                expect(defs.my_steel.restitution).toBe(0.3);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#19 creates directory if not exists', function () {
            var tmpDir, defs;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                // 不通过 createContentPack，直接 writeDef
                // writeDef 内部调用 writeJSONFile，后者会 ensureDir
                cp.writeDef(tmpDir, 'myns', 'materials', 'test_def', { value: 42 });

                defs = cp.readAllDefs(tmpDir, 'myns', 'materials');
                expect(defs.test_def).toBeDefined();
                expect(defs.test_def.value).toBe(42);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });

    // =========================================================================
    // deleteDef 测试
    // =========================================================================

    describe('deleteDef', function () {
        test('#20 removes file', function () {
            var tmpDir, filePath;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });
                cp.writeDef(tmpDir, 'test', 'materials', 'to_delete', { data: 1 });

                // 确认文件存在
                filePath = path.join(tmpDir, 'test', 'materials', 'to_delete.json');
                expect(fs.existsSync(filePath)).toBe(true);

                // 删除
                cp.deleteDef(tmpDir, 'test', 'materials', 'to_delete');

                // 确认已删除
                expect(fs.existsSync(filePath)).toBe(false);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#21 silently skips non-existent file', function () {
            var tmpDir;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });

                // 不应抛出异常
                cp.deleteDef(tmpDir, 'test', 'materials', 'nonexistent_def');
                // 若到达此处则证明未抛异常
                expect(true).toBe(true);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });

    // =========================================================================
    // listDefIds 测试
    // =========================================================================

    describe('listDefIds', function () {
        test('#22 returns correct IDs', function () {
            var tmpDir, ids;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });
                cp.writeDef(tmpDir, 'test', 'materials', 'mat_a', { data: 1 });
                cp.writeDef(tmpDir, 'test', 'materials', 'mat_b', { data: 2 });

                ids = cp.listDefIds(tmpDir, 'test', 'materials');
                expect(ids.length).toBe(2);
                expect(ids).toContain('mat_a');
                expect(ids).toContain('mat_b');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#23 returns empty array for non-existent directory', function () {
            var tmpDir, ids;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                ids = cp.listDefIds(tmpDir, 'nonexistent', 'materials');
                expect(ids).toEqual([]);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#24 includes files in subdirectories', function () {
            var tmpDir, subDir, ids;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });

                subDir = path.join(tmpDir, 'test', 'materials', 'subdir');
                fs.mkdirSync(subDir, { recursive: true });
                fs.writeFileSync(
                    path.join(subDir, 'nested_mat.json'),
                    JSON.stringify({ value: 99 }, null, 2)
                );

                ids = cp.listDefIds(tmpDir, 'test', 'materials');
                expect(ids).toContain('nested_mat');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });

    // =========================================================================
    // defExists 测试
    // =========================================================================

    describe('defExists', function () {
        test('#25 returns true for existing def', function () {
            var tmpDir;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });
                cp.writeDef(tmpDir, 'test', 'materials', 'real_def', { x: 1 });

                expect(cp.defExists(tmpDir, 'test', 'materials', 'real_def')).toBe(true);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#26 returns false for missing def', function () {
            var tmpDir;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });

                expect(cp.defExists(tmpDir, 'test', 'materials', 'imaginary_def')).toBe(false);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#27 returns false after delete', function () {
            var tmpDir;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });
                cp.writeDef(tmpDir, 'test', 'materials', 'temp_def', { y: 2 });

                expect(cp.defExists(tmpDir, 'test', 'materials', 'temp_def')).toBe(true);
                cp.deleteDef(tmpDir, 'test', 'materials', 'temp_def');
                expect(cp.defExists(tmpDir, 'test', 'materials', 'temp_def')).toBe(false);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });

    // =========================================================================
    // readPackMeta / writePackMeta 测试
    // =========================================================================

    describe('readPackMeta and writePackMeta', function () {
        test('#28 reads written meta.json', function () {
            var tmpDir, meta, read;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                meta = {
                    id: 'test:pack',
                    version: '2.0',
                    name: 'Meta Test',
                    author: 'M',
                    description: 'desc',
                };
                cp.writePackMeta(tmpDir, meta);
                read = cp.readPackMeta(tmpDir);
                expect(read).toBeDefined();
                expect(read.id).toBe('test:pack');
                expect(read.version).toBe('2.0');
                expect(read.name).toBe('Meta Test');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#29 returns null for missing meta.json', function () {
            var tmpDir, read;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                read = cp.readPackMeta(tmpDir);
                expect(read).toBe(null);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#30 roundtrip with nested data', function () {
            var tmpDir, meta, read;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                meta = {
                    id: 'ns:p',
                    version: '1.0',
                    name: 'P',
                    author: 'A',
                    description: '',
                    dependencies: ['dep1', 'dep2'],
                    enable_auto_pack: false,
                };
                cp.writePackMeta(tmpDir, meta);
                read = cp.readPackMeta(tmpDir);
                expect(read.dependencies).toEqual(['dep1', 'dep2']);
                expect(read.enable_auto_pack).toBe(false);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });

    // =========================================================================
    // 跨类型 CRUD 一致性测试
    // =========================================================================

    describe('cross-type CRUD consistency', function () {
        test('#31 connectors type works consistently', function () {
            var tmpDir, defs;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });

                cp.writeDef(tmpDir, 'test', 'connectors', 'wheel_hub', {
                    type: 'vehicle_wheel_hub',
                    max_load: 500,
                });

                expect(cp.defExists(tmpDir, 'test', 'connectors', 'wheel_hub')).toBe(true);

                defs = cp.readAllDefs(tmpDir, 'test', 'connectors');
                expect(defs.wheel_hub).toBeDefined();
                expect(defs.wheel_hub.type).toBe('vehicle_wheel_hub');

                cp.deleteDef(tmpDir, 'test', 'connectors', 'wheel_hub');
                expect(cp.defExists(tmpDir, 'test', 'connectors', 'wheel_hub')).toBe(false);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#32 subsystems type works consistently', function () {
            var tmpDir, ids;
            tmpDir = createTempDir('mm-cp-test-');
            try {
                cp.createContentPack(tmpDir, { id: 'test:pack', version: '1.0', name: 'T', author: 'A', description: '' });

                cp.writeDef(tmpDir, 'test', 'subsystems', 'turret', {
                    rotation_speed: 2.5,
                    yaw_range: 360,
                });

                expect(cp.defExists(tmpDir, 'test', 'subsystems', 'turret')).toBe(true);

                ids = cp.listDefIds(tmpDir, 'test', 'subsystems');
                expect(ids).toContain('turret');

                cp.deleteDef(tmpDir, 'test', 'subsystems', 'turret');
                expect(cp.listDefIds(tmpDir, 'test', 'subsystems').length).toBe(0);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });
});
