/**
 * content_pack_zip.test.js — content_pack.js ZIP 支持测试
 *
 * 测试 content_pack.js 对 ZIP 格式内容包的读取支持：
 * readPackMeta, openContentPack, readAllDefs
 *
 * 使用 bun test 框架: describe / test / expect
 */

var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var cp = require('../src/core/content_pack.js');
var { createTempDir, cleanupTempDir } = require('./helpers.js');

// =============================================================================
// 测试辅助：创建 ZIP 文件
// =============================================================================

/**
 * 创建测试 ZIP 文件
 * @param {string} zipPath - 输出路径
 * @param {Object<string, string>} files - ZIP 内部路径 → 内容字符串
 */
function createTestZip(zipPath, files) {
    var fd, fileNames, i, filePath, content, nameBuf, localHeader;
    var entries, offset, cdOffset, cdSize, e, cdEntry, eocd;

    fd = fs.openSync(zipPath, 'w');
    fileNames = Object.keys(files).sort();
    entries = [];
    offset = 0;

    for (i = 0; i < fileNames.length; i++) {
        filePath = fileNames[i];
        content = Buffer.from(files[filePath], 'utf-8');
        nameBuf = Buffer.from(filePath, 'utf-8');

        localHeader = Buffer.alloc(30 + nameBuf.length);
        localHeader.writeUInt32LE(0x04034b50, 0);  // 签名
        localHeader.writeUInt16LE(20, 4);
        localHeader.writeUInt16LE(0, 6);            // 标志位
        localHeader.writeUInt16LE(0, 8);            // stored
        localHeader.writeUInt32LE(0, 10);
        localHeader.writeUInt32LE(0, 14);
        localHeader.writeUInt32LE(content.length, 18);
        localHeader.writeUInt32LE(content.length, 22);
        localHeader.writeUInt16LE(nameBuf.length, 26);
        localHeader.writeUInt16LE(0, 28);
        nameBuf.copy(localHeader, 30);

        fs.writeSync(fd, localHeader);
        fs.writeSync(fd, content);

        entries.push({
            name: filePath,
            nameBuf: nameBuf,
            localOffset: offset,
            compressedSize: content.length,
            uncompressedSize: content.length,
        });

        offset += localHeader.length + content.length;
    }

    // 中央目录
    cdOffset = offset;
    cdSize = 0;
    for (i = 0; i < entries.length; i++) {
        e = entries[i];
        cdEntry = Buffer.alloc(46 + e.nameBuf.length);
        cdEntry.writeUInt32LE(0x02014b50, 0);
        cdEntry.writeUInt16LE(20, 4);
        cdEntry.writeUInt16LE(20, 6);
        cdEntry.writeUInt16LE(0, 8);
        cdEntry.writeUInt16LE(0, 10);  // stored
        cdEntry.writeUInt32LE(0, 12);
        cdEntry.writeUInt32LE(0, 16);
        cdEntry.writeUInt32LE(e.compressedSize, 20);
        cdEntry.writeUInt32LE(e.uncompressedSize, 24);
        cdEntry.writeUInt16LE(e.nameBuf.length, 28);
        cdEntry.writeUInt16LE(0, 30);
        cdEntry.writeUInt16LE(0, 32);
        cdEntry.writeUInt16LE(0, 34);
        cdEntry.writeUInt16LE(0, 36);
        cdEntry.writeUInt32LE(0, 38);
        cdEntry.writeUInt32LE(e.localOffset, 42);
        e.nameBuf.copy(cdEntry, 46);

        fs.writeSync(fd, cdEntry);
        cdSize += cdEntry.length;
    }

    // EOCD
    eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(0, 4);
    eocd.writeUInt16LE(0, 6);
    eocd.writeUInt16LE(entries.length, 8);
    eocd.writeUInt16LE(entries.length, 10);
    eocd.writeUInt32LE(cdSize, 12);
    eocd.writeUInt32LE(cdOffset, 16);
    eocd.writeUInt16LE(0, 20);

    fs.writeSync(fd, eocd);
    fs.closeSync(fd);
}

/**
 * 创建内容包结构的 ZIP 文件
 *
 * @param {string} zipPath - 输出路径
 * @param {string} namespace - 命名空间（如 'machine_max'）
 * @param {Object} [defs] - 各类定义 { materials: {}, connectors: {}, subsystems: {} }
 */
function createContentPackZip(zipPath, namespace, defs) {
    var files, type, typeDefs, defId;
    defs = defs || {};
    files = {};

    // meta.json
    files['meta.json'] = JSON.stringify({
        id: namespace + ':test_pack',
        version: '1.0',
        name: 'Test ZIP Pack',
        author: 'Tester',
        description: 'ZIP content pack for testing',
    });

    // 各类定义文件
    var types = ['materials', 'connectors', 'subsystems'];
    for (var t = 0; t < types.length; t++) {
        type = types[t];
        typeDefs = defs[type] || {};

        // 即使没有定义，也创建一个占位目录条目
        if (Object.keys(typeDefs).length === 0) {
            // 在 ZIP 中创建至少一个文件以确保"目录"存在
            files[namespace + '/' + type + '/.gitkeep'] = '';
        }

        for (defId in typeDefs) {
            if (typeDefs.hasOwnProperty(defId)) {
                files[namespace + '/' + type + '/' + defId + '.json'] =
                    JSON.stringify(typeDefs[defId]);
            }
        }
    }

    createTestZip(zipPath, files);
}

// =============================================================================
// 测试用例
// =============================================================================

describe('ContentPack ZIP support', function () {

    // =========================================================================
    // readPackMeta ZIP 测试
    // =========================================================================

    describe('readPackMeta (ZIP)', function () {
        test('#Z1 从 ZIP 读取 meta.json', function () {
            var tmpDir, zipPath, meta;
            tmpDir = createTempDir('mm-cpzip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                createContentPackZip(zipPath, 'machine_max', {
                    materials: { steel: { friction: [0.5, 0.5, 0.5] } },
                    connectors: {},
                    subsystems: {},
                });

                meta = cp.readPackMeta(zipPath);
                expect(meta).not.toBe(null);
                expect(meta.id).toBe('machine_max:test_pack');
                expect(meta.version).toBe('1.0');
                expect(meta.name).toBe('Test ZIP Pack');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#Z2 ZIP 中无 meta.json 返回 null', function () {
            var tmpDir, zipPath, meta;
            tmpDir = createTempDir('mm-cpzip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                // 创建不含 meta.json 的 ZIP
                createTestZip(zipPath, {
                    'other_file.txt': 'not a meta file',
                });

                meta = cp.readPackMeta(zipPath);
                expect(meta).toBe(null);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });

    // =========================================================================
    // openContentPack ZIP 测试
    // =========================================================================

    describe('openContentPack (ZIP)', function () {
        test('#Z3 验证有效的 ZIP 内容包', function () {
            var tmpDir, zipPath, result;
            tmpDir = createTempDir('mm-cpzip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                createContentPackZip(zipPath, 'machine_max', {
                    materials: { steel: {} },
                    connectors: { wheel_hub: {} },
                    subsystems: { engine: {} },
                });

                result = cp.openContentPack(zipPath);
                expect(result.valid).toBe(true);
                expect(result.namespace).toBe('machine_max');
                expect(result.meta.id).toBe('machine_max:test_pack');
                expect(result.error).toBe(null);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#Z4 缺少 materials 目录的 ZIP 返回无效', function () {
            var tmpDir, zipPath, result;
            tmpDir = createTempDir('mm-cpzip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                // 只创建 meta.json 和 connectors，没有 materials
                createTestZip(zipPath, {
                    'meta.json': '{"id":"test:pack","version":"1.0"}',
                    'test/connectors/wheel.json': '{}',
                    'test/subsystems/engine.json': '{}',
                });

                result = cp.openContentPack(zipPath);
                expect(result.valid).toBe(false);
                expect(result.error).toBeTruthy();
                expect(result.error.indexOf('materials')).not.toBe(-1);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#Z5 meta.id 为空的 ZIP 返回无效', function () {
            var tmpDir, zipPath, result;
            tmpDir = createTempDir('mm-cpzip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                createTestZip(zipPath, {
                    'meta.json': '{"version":"1.0"}',
                    'materials/a.json': '{}',
                    'connectors/b.json': '{}',
                    'subsystems/c.json': '{}',
                });

                result = cp.openContentPack(zipPath);
                expect(result.valid).toBe(false);
                expect(result.error).toBeTruthy();
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });

    // =========================================================================
    // readAllDefs ZIP 测试
    // =========================================================================

    describe('readAllDefs (ZIP)', function () {
        test('#Z6 从 ZIP 读取材料定义', function () {
            var tmpDir, zipPath, defs;
            tmpDir = createTempDir('mm-cpzip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                createContentPackZip(zipPath, 'machine_max', {
                    materials: {
                        steel: { friction: [0.5, 0.5, 0.5], density: 7850 },
                        aluminum: { friction: [0.3, 0.3, 0.3], density: 2700 },
                    },
                    connectors: { wheel: {} },
                    subsystems: { engine: {} },
                });

                defs = cp.readAllDefs(zipPath, 'machine_max', 'materials');
                expect(Object.keys(defs).length).toBe(2);
                expect(defs.steel).toBeDefined();
                expect(defs.steel.density).toBe(7850);
                expect(defs.aluminum).toBeDefined();
                expect(defs.aluminum.density).toBe(2700);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#Z7 从 ZIP 读取连接点定义', function () {
            var tmpDir, zipPath, defs;
            tmpDir = createTempDir('mm-cpzip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                createContentPackZip(zipPath, 'machine_max', {
                    materials: { m: {} },
                    connectors: {
                        wheel_hub: { type: 'vehicle_wheel_hub', max_load: 500 },
                        turret_base: { type: 'turret_base', rotation_speed: 2.5 },
                    },
                    subsystems: { s: {} },
                });

                defs = cp.readAllDefs(zipPath, 'machine_max', 'connectors');
                expect(Object.keys(defs).length).toBe(2);
                expect(defs.wheel_hub.type).toBe('vehicle_wheel_hub');
                expect(defs.turret_base.rotation_speed).toBe(2.5);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#Z8 从 ZIP 读取子系统定义', function () {
            var tmpDir, zipPath, defs;
            tmpDir = createTempDir('mm-cpzip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                createContentPackZip(zipPath, 'machine_max', {
                    materials: { m: {} },
                    connectors: { c: {} },
                    subsystems: {
                        car_controller: { max_speed: 30, acceleration: 2.0 },
                    },
                });

                defs = cp.readAllDefs(zipPath, 'machine_max', 'subsystems');
                expect(Object.keys(defs).length).toBe(1);
                expect(defs.car_controller.max_speed).toBe(30);
                expect(defs.car_controller.acceleration).toBe(2.0);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#Z9 空定义的 ZIP 返回空对象', function () {
            var tmpDir, zipPath, defs;
            tmpDir = createTempDir('mm-cpzip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                createContentPackZip(zipPath, 'machine_max', {
                    materials: {},
                    connectors: {},
                    subsystems: {},
                });

                defs = cp.readAllDefs(zipPath, 'machine_max', 'materials');
                // .gitkeep 文件不是 .json，应被过滤掉
                expect(Object.keys(defs).length).toBe(0);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#Z10 非 ZIP 路径仍走目录逻辑', function () {
            var tmpDir, packDir, defs;
            tmpDir = createTempDir('mm-cpzip-test-');
            try {
                // 创建普通的目录形式内容包
                packDir = path.join(tmpDir, 'dir_pack');
                cp.createContentPack(packDir, {
                    id: 'test:dir_pack',
                    version: '1.0',
                    name: 'Dir',
                    author: 'A',
                    description: '',
                });
                cp.writeDef(packDir, 'test', 'materials', 'dir_steel', {
                    friction: [0.7, 0.7, 0.7],
                });

                // 目录路径（非 .zip 扩展名）应使用原有目录逻辑
                defs = cp.readAllDefs(packDir, 'test', 'materials');
                expect(defs.dir_steel).toBeDefined();
                expect(defs.dir_steel.friction[0]).toBe(0.7);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#Z11 readPackMeta 对目录路径仍正常工作', function () {
            var tmpDir, packDir, meta;
            tmpDir = createTempDir('mm-cpzip-test-');
            try {
                packDir = path.join(tmpDir, 'dir_pack');
                cp.createContentPack(packDir, {
                    id: 'test:dir_pack2',
                    version: '2.1',
                    name: 'Dir2',
                    author: 'B',
                    description: 'test',
                });

                meta = cp.readPackMeta(packDir);
                expect(meta).not.toBe(null);
                expect(meta.id).toBe('test:dir_pack2');
                expect(meta.version).toBe('2.1');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#Z12 openContentPack 对目录路径仍正常工作', function () {
            var tmpDir, packDir, result;
            tmpDir = createTempDir('mm-cpzip-test-');
            try {
                packDir = path.join(tmpDir, 'dir_pack');
                cp.createContentPack(packDir, {
                    id: 'test:dir_pack3',
                    version: '1.0',
                    name: 'Dir3',
                    author: 'C',
                    description: '',
                });

                result = cp.openContentPack(packDir);
                expect(result.valid).toBe(true);
                expect(result.namespace).toBe('test');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });
});
