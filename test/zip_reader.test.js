/**
 * zip_reader.test.js — zip_reader.js 单元测试
 *
 * 测试 ZIP 文件读取器的所有公开函数：
 * openZip, readFileContent, listFiles, fileExists
 *
 * 使用 bun test 框架: describe / test / expect
 */

var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var zip_reader = require('../src/core/zip_reader.js');
var { createTempDir, cleanupTempDir } = require('./helpers.js');

// =============================================================================
// 测试辅助：创建 ZIP 文件
// =============================================================================

/**
 * 在指定路径创建一个有效的 ZIP 文件
 *
 * @param {string} zipPath - 输出 ZIP 文件路径
 * @param {Object<string, string|{content: string, deflate: boolean}>} files -
 *   ZIP 内部路径 → 内容字符串 或 {content, deflate} 对象
 *   例如: { 'meta.json': '{"id":"test:pack"}', 'test/materials/mat.json': '{"x":1}' }
 */
function createTestZip(zipPath, files) {
    var fd, fileNames, i, filePath, fileDef, content, nameBuf, method;
    var localHeader, entries, offset, cdOffset, cdSize, e, cdEntry, eocd;

    fd = fs.openSync(zipPath, 'w');
    fileNames = Object.keys(files).sort();
    entries = [];
    offset = 0;

    // ── 写入各文件的本地文件头 + 数据 ──
    for (i = 0; i < fileNames.length; i++) {
        filePath = fileNames[i];
        fileDef = files[filePath];

        // 支持简写: 'content' 或 {content: '...', deflate: true}
        if (typeof fileDef === 'string') {
            content = Buffer.from(fileDef, 'utf-8');
            method = 0; // stored
        } else {
            content = Buffer.from(fileDef.content, 'utf-8');
            method = fileDef.deflate ? 8 : 0;
        }

        nameBuf = Buffer.from(filePath, 'utf-8');
        var compressedData = content;
        if (method === 8) {
            compressedData = zlib.deflateRawSync(content);
        }

        // 本地文件头（30 字节 + 文件名）
        localHeader = Buffer.alloc(30 + nameBuf.length);
        localHeader.writeUInt32LE(0x04034b50, 0);  // 签名
        localHeader.writeUInt16LE(20, 4);           // 版本
        localHeader.writeUInt16LE(0, 6);            // 标志位
        localHeader.writeUInt16LE(method, 8);       // 压缩方法
        localHeader.writeUInt32LE(0, 10);           // 修改时间
        localHeader.writeUInt32LE(0, 14);           // CRC-32（简化：填 0）
        localHeader.writeUInt32LE(compressedData.length, 18);  // 压缩后大小
        localHeader.writeUInt32LE(content.length, 22);          // 未压缩大小
        localHeader.writeUInt16LE(nameBuf.length, 26);          // 文件名长度
        localHeader.writeUInt16LE(0, 28);                       // 扩展字段长度
        nameBuf.copy(localHeader, 30);

        fs.writeSync(fd, localHeader);
        fs.writeSync(fd, compressedData);

        entries.push({
            name: filePath,
            nameBuf: nameBuf,
            method: method,
            localOffset: offset,
            compressedSize: compressedData.length,
            uncompressedSize: content.length,
        });

        offset += localHeader.length + compressedData.length;
    }

    // ── 中央目录 ──
    cdOffset = offset;
    cdSize = 0;

    for (i = 0; i < entries.length; i++) {
        e = entries[i];
        cdEntry = Buffer.alloc(46 + e.nameBuf.length);
        cdEntry.writeUInt32LE(0x02014b50, 0);  // 签名
        cdEntry.writeUInt16LE(20, 4);           // 创建版本
        cdEntry.writeUInt16LE(20, 6);           // 所需版本
        cdEntry.writeUInt16LE(0, 8);            // 标志位
        cdEntry.writeUInt16LE(e.method, 10);    // 压缩方法
        cdEntry.writeUInt32LE(0, 12);           // 修改时间
        cdEntry.writeUInt32LE(0, 16);           // CRC-32
        cdEntry.writeUInt32LE(e.compressedSize, 20);
        cdEntry.writeUInt32LE(e.uncompressedSize, 24);
        cdEntry.writeUInt16LE(e.nameBuf.length, 28);
        cdEntry.writeUInt16LE(0, 30);           // 扩展字段长度
        cdEntry.writeUInt16LE(0, 32);           // 注释长度
        cdEntry.writeUInt16LE(0, 34);           // 磁盘号
        cdEntry.writeUInt16LE(0, 36);           // 内部属性
        cdEntry.writeUInt32LE(0, 38);           // 外部属性
        cdEntry.writeUInt32LE(e.localOffset, 42);
        e.nameBuf.copy(cdEntry, 46);

        fs.writeSync(fd, cdEntry);
        cdSize += cdEntry.length;
    }

    // ── EOCD ──
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

// =============================================================================
// 测试用例
// =============================================================================

describe('ZipReader', function () {

    // =========================================================================
    // openZip 测试
    // =========================================================================

    describe('openZip', function () {
        test('#1 成功打开有效 ZIP', function () {
            var tmpDir, zipPath, handle;
            tmpDir = createTempDir('mm-zip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                createTestZip(zipPath, {
                    'meta.json': '{"id":"test:pack","version":"1.0"}',
                    'test/materials/steel.json': '{"friction":[0.5,0.5,0.5]}',
                });

                handle = zip_reader.openZip(zipPath);
                expect(handle).not.toBe(null);
                expect(typeof handle.getContent).toBe('function');
                expect(typeof handle.listFiles).toBe('function');
                expect(handle.files).toBeDefined();
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#2 不存在的文件返回 null', function () {
            var handle = zip_reader.openZip('/nonexistent/path/file.zip');
            expect(handle).toBe(null);
        });

        test('#3 非 ZIP 文件返回 null', function () {
            var tmpDir, txtPath, handle;
            tmpDir = createTempDir('mm-zip-test-');
            try {
                txtPath = path.join(tmpDir, 'not_a_zip.txt');
                fs.writeFileSync(txtPath, 'hello world', 'utf-8');
                handle = zip_reader.openZip(txtPath);
                expect(handle).toBe(null);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });

    // =========================================================================
    // listFiles 测试
    // =========================================================================

    describe('listFiles', function () {
        test('#4 列出 ZIP 中所有文件', function () {
            var tmpDir, zipPath, files;
            tmpDir = createTempDir('mm-zip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                createTestZip(zipPath, {
                    'meta.json': '{}',
                    'test/materials/a.json': '{}',
                    'test/materials/b.json': '{}',
                    'test/connectors/c.json': '{}',
                });

                files = zip_reader.listFiles(zipPath);
                expect(files.length).toBe(4);
                expect(files).toContain('meta.json');
                expect(files).toContain('test/materials/a.json');
                expect(files).toContain('test/materials/b.json');
                expect(files).toContain('test/connectors/c.json');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#5 空 ZIP 返回空数组', function () {
            var tmpDir, zipPath, files;
            tmpDir = createTempDir('mm-zip-test-');
            try {
                zipPath = path.join(tmpDir, 'empty.zip');
                createTestZip(zipPath, {});
                files = zip_reader.listFiles(zipPath);
                expect(files).toEqual([]);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#6 不存在的 ZIP 返回空数组', function () {
            var files = zip_reader.listFiles('/nonexistent/file.zip');
            expect(files).toEqual([]);
        });
    });

    // =========================================================================
    // fileExists 测试
    // =========================================================================

    describe('fileExists', function () {
        test('#7 存在的文件返回 true', function () {
            var tmpDir, zipPath;
            tmpDir = createTempDir('mm-zip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                createTestZip(zipPath, {
                    'meta.json': '{}',
                    'test/materials/steel.json': '{}',
                });

                expect(zip_reader.fileExists(zipPath, 'meta.json')).toBe(true);
                expect(zip_reader.fileExists(zipPath, 'test/materials/steel.json')).toBe(true);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#8 不存在的文件返回 false', function () {
            var tmpDir, zipPath;
            tmpDir = createTempDir('mm-zip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                createTestZip(zipPath, { 'meta.json': '{}' });

                expect(zip_reader.fileExists(zipPath, 'nonexistent.json')).toBe(false);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#9 不存在的 ZIP 返回 false', function () {
            expect(zip_reader.fileExists('/nonexistent/file.zip', 'meta.json')).toBe(false);
        });
    });

    // =========================================================================
    // readFileContent 测试
    // =========================================================================

    describe('readFileContent', function () {
        test('#10 读取 stored 压缩的文件内容', function () {
            var tmpDir, zipPath, content;
            tmpDir = createTempDir('mm-zip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                createTestZip(zipPath, {
                    'meta.json': '{"id":"my:pack","version":"2.0"}',
                });

                content = zip_reader.readFileContent(zipPath, 'meta.json');
                expect(content).not.toBe(null);
                expect(content.toString('utf-8')).toBe('{"id":"my:pack","version":"2.0"}');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#11 读取 UTF-8 中文内容', function () {
            var tmpDir, zipPath, content;
            tmpDir = createTempDir('mm-zip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                createTestZip(zipPath, {
                    'test/materials/钢.json': '{"name":"结构钢","density":7850}',
                });

                content = zip_reader.readFileContent(zipPath, 'test/materials/钢.json');
                expect(content).not.toBe(null);
                var parsed = JSON.parse(content.toString('utf-8'));
                expect(parsed.name).toBe('结构钢');
                expect(parsed.density).toBe(7850);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#12 不存在的文件返回 null', function () {
            var tmpDir, zipPath, content;
            tmpDir = createTempDir('mm-zip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                createTestZip(zipPath, { 'meta.json': '{}' });

                content = zip_reader.readFileContent(zipPath, 'nonexistent.json');
                expect(content).toBe(null);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#13 读取 deflated 压缩的文件内容', function () {
            var tmpDir, zipPath, content;
            tmpDir = createTempDir('mm-zip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                createTestZip(zipPath, {
                    'meta.json': { content: '{"id":"deflated:pack","version":"1.0"}', deflate: true },
                });

                content = zip_reader.readFileContent(zipPath, 'meta.json');
                expect(content).not.toBe(null);
                var parsed = JSON.parse(content.toString('utf-8'));
                expect(parsed.id).toBe('deflated:pack');
                expect(parsed.version).toBe('1.0');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });

    // =========================================================================
    // openZip → getContent 往返测试
    // =========================================================================

    describe('openZip getContent', function () {
        test('#14 通过句柄多次读取不同文件', function () {
            var tmpDir, zipPath, handle, c1, c2;
            tmpDir = createTempDir('mm-zip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                createTestZip(zipPath, {
                    'meta.json': '{"id":"multi:pack"}',
                    'multi/materials/iron.json': '{"type":"metal"}',
                    'multi/subsystems/engine.json': '{"power":100}',
                });

                handle = zip_reader.openZip(zipPath);
                expect(handle).not.toBe(null);

                c1 = handle.getContent('meta.json');
                expect(JSON.parse(c1.toString('utf-8')).id).toBe('multi:pack');

                c2 = handle.getContent('multi/materials/iron.json');
                expect(JSON.parse(c2.toString('utf-8')).type).toBe('metal');
            } finally {
                cleanupTempDir(tmpDir);
            }
        });

        test('#15 句柄的 listFiles 与便捷函数一致', function () {
            var tmpDir, zipPath, handle, list1, list2;
            tmpDir = createTempDir('mm-zip-test-');
            try {
                zipPath = path.join(tmpDir, 'test.zip');
                createTestZip(zipPath, {
                    'a.json': '{}',
                    'b/c.json': '{}',
                });

                handle = zip_reader.openZip(zipPath);
                list1 = handle.listFiles();
                list2 = zip_reader.listFiles(zipPath);

                expect(list1).toEqual(list2);
                expect(list1.length).toBe(2);
            } finally {
                cleanupTempDir(tmpDir);
            }
        });
    });
});
