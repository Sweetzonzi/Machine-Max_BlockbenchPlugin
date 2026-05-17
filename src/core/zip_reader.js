/**
 * zip_reader.js — 最小化 ZIP 文件读取器
 *
 * 仅使用 Node.js 内置模块（fs, zlib, path），无需第三方依赖。
 * 支持 stored（方法 0）和 deflated（方法 8）两种压缩方式。
 *
 * ZIP 格式参考: PKWARE APPNOTE.TXT 6.3.10
 *
 * API:
 *   openZip(zipPath)             → { files, getContent, listFiles }  打开 ZIP 并构建索引
 *   readFileContent(zipPath, internalPath) → Buffer|null              单次读取文件内容
 *   listFiles(zipPath)           → string[]                           列出所有文件路径
 *   fileExists(zipPath, internalPath) → boolean                       检查文件是否存在
 */

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('ZipReader');

// =============================================================================
// ZIP 格式常量
// =============================================================================

/** 本地文件头签名 "PK\x03\x04" */
var SIG_LOCAL_FILE = 0x04034b50;
/** 中央目录条目签名 "PK\x01\x02" */
var SIG_CENTRAL_DIR = 0x02014b50;
/** EOCD 签名 "PK\x05\x06" */
var SIG_EOCD = 0x06054b50;

/** 本地文件头最小长度（不含文件名和扩展字段） */
var LOCAL_HEADER_MIN = 30;
/** 中央目录条目最小长度（不含文件名、扩展字段、注释） */
var CENTRAL_DIR_MIN = 46;
/** EOCD 最小长度（不含注释） */
var EOCD_MIN = 22;
/** EOCD 最大搜索范围（注释最长 65535 字节 + EOCD 自身 22 字节） */
var EOCD_MAX_SEARCH = 65557;

/** 压缩方法: 存储（无压缩） */
var METHOD_STORED = 0;
/** 压缩方法: deflated */
var METHOD_DEFLATED = 8;

// =============================================================================
// 内部工具函数
// =============================================================================

/**
 * 从 Buffer 中读取 32 位小端无符号整数
 * @param {Buffer} buf - 源 Buffer
 * @param {number} offset - 起始偏移
 * @returns {number}
 */
function readUInt32LE(buf, offset) {
    return buf.readUInt32LE(offset);
}

/**
 * 从 Buffer 中读取 16 位小端无符号整数
 * @param {Buffer} buf - 源 Buffer
 * @param {number} offset - 起始偏移
 * @returns {number}
 */
function readUInt16LE(buf, offset) {
    return buf.readUInt16LE(offset);
}

/**
 * 在 Buffer 中从末尾向前搜索指定签名的位置
 * @param {Buffer} buf - 要搜索的 Buffer
 * @param {number} signature - 32 位签名值
 * @returns {number} 签名偏移位置，未找到返回 -1
 */
function findSignatureFromEnd(buf, signature) {
    var i;
    for (i = buf.length - 4; i >= 0; i--) {
        if (readUInt32LE(buf, i) === signature) {
            return i;
        }
    }
    return -1;
}

/**
 * 将 ZIP 内部路径（使用 '/' 分隔）中的反斜杠统一为正斜杠
 * @param {string} p - 路径字符串
 * @returns {string}
 */
function normalizeZipPath(p) {
    if (!p) return '';
    return p.replace(/\\/g, '/');
}

// =============================================================================
// EOCD 解析
// =============================================================================

/**
 * 搜索并解析 ZIP 文件的 End of Central Directory Record
 *
 * 从文件末尾向前搜索 EOCD 签名 (0x06054b50)，最大搜索 65557 字节。
 * 找到后解析中央目录的偏移量、大小和条目数量。
 *
 * @param {number} fd - 文件描述符（整数）
 * @param {number} fileSize - 文件总大小
 * @returns {{cdOffset: number, cdSize: number, cdCount: number}|null} 解析结果或 null
 */
function _parseEOCD(fd, fileSize) {
    var searchSize, searchBuf, eocdOffset, cdCount, cdSize, cdOffset;

    if (fileSize < EOCD_MIN) {
        log.warn('_parseEOCD: 文件太小，不是有效 ZIP');
        return null;
    }

    // 读取文件末尾的搜索区域
    searchSize = Math.min(EOCD_MAX_SEARCH, fileSize);
    searchBuf = Buffer.alloc(searchSize);
    fs.readSync(fd, searchBuf, 0, searchSize, fileSize - searchSize);

    // 从后向前搜索 EOCD 签名
    eocdOffset = findSignatureFromEnd(searchBuf, SIG_EOCD);
    if (eocdOffset < 0) {
        log.warn('_parseEOCD: 未找到 EOCD 签名');
        return null;
    }

    // 确保 EOCD 数据完整
    if (eocdOffset + EOCD_MIN > searchBuf.length) {
        log.warn('_parseEOCD: EOCD 数据不完整');
        return null;
    }

    // 解析 EOCD 字段
    cdCount = readUInt16LE(searchBuf, eocdOffset + 10);
    cdSize = readUInt32LE(searchBuf, eocdOffset + 12);
    cdOffset = readUInt32LE(searchBuf, eocdOffset + 16);

    log.debug('_parseEOCD: 中央目录偏移=' + cdOffset + ' 大小=' + cdSize + ' 条目=' + cdCount);

    return { cdOffset: cdOffset, cdSize: cdSize, cdCount: cdCount };
}

// =============================================================================
// 中央目录解析
// =============================================================================

/**
 * 解析 ZIP 中央目录，提取所有文件的元数据索引
 *
 * 遍历中央目录条目，提取每个文件的名称、压缩方法、压缩大小、
 * 未压缩大小、本地文件头偏移量等信息。
 *
 * @param {number} fd - 文件描述符
 * @param {number} cdOffset - 中央目录起始偏移
 * @param {number} cdSize - 中央目录大小
 * @returns {Object<string,{method:number,compressedSize:number,uncompressedSize:number,localOffset:number}>|null}
 */
function _parseCentralDirectory(fd, cdOffset, cdSize) {
    var cdBuf, pos, fileIndex, sig, method, compressedSize, uncompressedSize, localOffset;
    var fileNameLen, extraLen, commentLen, fileName;

    cdBuf = Buffer.alloc(cdSize);
    fs.readSync(fd, cdBuf, 0, cdSize, cdOffset);

    fileIndex = {};
    pos = 0;

    while (pos + CENTRAL_DIR_MIN <= cdBuf.length) {
        sig = readUInt32LE(cdBuf, pos);
        if (sig !== SIG_CENTRAL_DIR) {
            // 中央目录结束或遇到损坏条目
            break;
        }

        method = readUInt16LE(cdBuf, pos + 10);
        compressedSize = readUInt32LE(cdBuf, pos + 20);
        uncompressedSize = readUInt32LE(cdBuf, pos + 24);
        fileNameLen = readUInt16LE(cdBuf, pos + 28);
        extraLen = readUInt16LE(cdBuf, pos + 30);
        commentLen = readUInt16LE(cdBuf, pos + 32);
        localOffset = readUInt32LE(cdBuf, pos + 42);

        // 读取文件名
        if (pos + CENTRAL_DIR_MIN + fileNameLen > cdBuf.length) break;
        fileName = normalizeZipPath(cdBuf.toString('utf-8', pos + CENTRAL_DIR_MIN, pos + CENTRAL_DIR_MIN + fileNameLen));

        // 存入索引（跳过目录条目——以 '/' 结尾的为空目录标记）
        if (fileName.length > 0 && !fileName.endsWith('/')) {
            fileIndex[fileName] = {
                method: method,
                compressedSize: compressedSize,
                uncompressedSize: uncompressedSize,
                localOffset: localOffset,
            };
        }

        // 前进到下一个条目
        pos += CENTRAL_DIR_MIN + fileNameLen + extraLen + commentLen;
    }

    log.debug('_parseCentralDirectory: 已索引 ' + Object.keys(fileIndex).length + ' 个文件');
    return fileIndex;
}

// =============================================================================
// 本地文件头解析与数据读取
// =============================================================================

/**
 * 从 ZIP 文件中读取指定文件的原始数据
 *
 * 根据中央目录中的偏移量定位到本地文件头，跳过文件名的变长部分，
 * 然后读取压缩数据并解压（如需要）。
 *
 * @param {number} fd - 文件描述符
 * @param {{method:number,compressedSize:number,uncompressedSize:number,localOffset:number}} entry - 文件条目元数据
 * @returns {Buffer|null} 解压后的文件内容，失败返回 null
 */
function _readFileData(fd, entry) {
    var headerBuf, fileNameLen, extraLen, dataStart, compressedBuf, result;

    // 读取本地文件头（至少 30 字节）
    headerBuf = Buffer.alloc(LOCAL_HEADER_MIN);
    fs.readSync(fd, headerBuf, 0, LOCAL_HEADER_MIN, entry.localOffset);

    // 验证签名
    if (readUInt32LE(headerBuf, 0) !== SIG_LOCAL_FILE) {
        log.warn('_readFileData: 本地文件头签名无效，偏移=' + entry.localOffset);
        return null;
    }

    // 获取文件名长度和扩展字段长度，计算数据起始偏移
    fileNameLen = readUInt16LE(headerBuf, 26);
    extraLen = readUInt16LE(headerBuf, 28);
    dataStart = entry.localOffset + LOCAL_HEADER_MIN + fileNameLen + extraLen;

    // 读取压缩数据
    compressedBuf = Buffer.alloc(entry.compressedSize);
    fs.readSync(fd, compressedBuf, 0, entry.compressedSize, dataStart);

    // 根据压缩方法解压
    switch (entry.method) {
        case METHOD_STORED:
            // 未压缩，直接返回
            result = compressedBuf;
            break;

        case METHOD_DEFLATED:
            // Deflate 压缩，使用 zlib.inflateRawSync 解压
            try {
                result = zlib.inflateRawSync(compressedBuf);
            } catch (e) {
                log.warn('_readFileData: deflate 解压失败', e);
                return null;
            }
            break;

        default:
            log.warn('_readFileData: 不支持的压缩方法 ' + entry.method);
            return null;
    }

    return result;
}

// =============================================================================
// 公开 API
// =============================================================================

/**
 * 打开 ZIP 文件并构建文件索引
 *
 * 读取中央目录，构建 {文件名 → 元数据} 的索引映射。
 * 返回的对象缓存了索引，可复用多次。
 *
 * @param {string} zipPath - ZIP 文件的绝对路径
 * @returns {{files: Object<string,Object>, getContent: Function, listFiles: Function}|null}
 *   成功返回句柄对象，失败返回 null
 */
function openZip(zipPath) {
    var stat, fd, eocd, fileIndex;

    try {
        // 检查文件存在且为普通文件
        stat = fs.statSync(zipPath);
        if (!stat.isFile()) {
            log.warn('openZip: 不是普通文件 ' + zipPath);
            return null;
        }
    } catch (e) {
        log.warn('openZip: 文件不存在或无法访问 ' + zipPath, e);
        return null;
    }

    try {
        fd = fs.openSync(zipPath, 'r');
    } catch (e) {
        log.warn('openZip: 无法打开文件 ' + zipPath, e);
        return null;
    }

    try {
        // 解析 EOCD
        eocd = _parseEOCD(fd, stat.size);
        if (!eocd) {
            log.warn('openZip: 无法解析 EOCD，可能不是有效 ZIP 文件');
            return null;
        }

        // 解析中央目录
        fileIndex = _parseCentralDirectory(fd, eocd.cdOffset, eocd.cdSize);
        if (!fileIndex) {
            log.warn('openZip: 无法解析中央目录');
            return null;
        }
    } finally {
        // 关闭文件描述符（中央目录已读入内存，后续按需重新打开）
        try {
            fs.closeSync(fd);
        } catch (e) {
            /* 忽略关闭错误 */
        }
    }

    /**
     * 从已打开的 ZIP 中获取文件内容
     * @param {string} internalPath - ZIP 内部文件路径（使用 '/' 分隔）
     * @returns {Buffer|null} 文件内容 Buffer
     */
    function getContent(internalPath) {
        var normalized, entry, fd2, data;

        normalized = normalizeZipPath(internalPath);
        entry = fileIndex[normalized];
        if (!entry) {
            log.debug('getContent: 文件不在 ZIP 中: ' + normalized);
            return null;
        }

        try {
            fd2 = fs.openSync(zipPath, 'r');
        } catch (e) {
            log.warn('getContent: 无法打开 ZIP 文件进行读取', e);
            return null;
        }

        try {
            data = _readFileData(fd2, entry);
            return data;
        } finally {
            try { fs.closeSync(fd2); } catch (e) { /* 忽略 */ }
        }
    }

    /**
     * 列出 ZIP 中所有文件的路径
     * @returns {string[]} 文件路径数组
     */
    function listFiles() {
        return Object.keys(fileIndex).sort();
    }

    log.info('openZip: 成功打开 ZIP，共 ' + Object.keys(fileIndex).length + ' 个文件');
    return {
        files: fileIndex,
        getContent: getContent,
        listFiles: listFiles,
    };
}

/**
 * 单次读取 ZIP 中指定文件的内容（便捷方法）
 *
 * 打开 ZIP、读取指定文件、关闭 ZIP 三步合一。
 * 适合只读一次的场景；需要多次读取时请使用 openZip() 获取句柄后复用。
 *
 * @param {string} zipPath - ZIP 文件的绝对路径
 * @param {string} internalPath - ZIP 内部文件路径（使用 '/' 分隔）
 * @returns {Buffer|null} 文件内容 Buffer，失败返回 null
 */
function readFileContent(zipPath, internalPath) {
    var handle, content;

    handle = openZip(zipPath);
    if (!handle) return null;

    content = handle.getContent(internalPath);
    return content;
}

/**
 * 列出 ZIP 中所有文件的路径（便捷方法）
 *
 * @param {string} zipPath - ZIP 文件的绝对路径
 * @returns {string[]} 文件路径数组，失败返回 []
 */
function listFiles(zipPath) {
    var handle;

    handle = openZip(zipPath);
    if (!handle) return [];

    return handle.listFiles();
}

/**
 * 检查 ZIP 中是否存在指定文件
 *
 * @param {string} zipPath - ZIP 文件的绝对路径
 * @param {string} internalPath - ZIP 内部文件路径
 * @returns {boolean}
 */
function fileExists(zipPath, internalPath) {
    var handle, normalized;

    handle = openZip(zipPath);
    if (!handle) return false;

    normalized = normalizeZipPath(internalPath);
    return handle.files.hasOwnProperty(normalized);
}

// =============================================================================
// CJS 导出
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openZip,
        readFileContent,
        listFiles,
        fileExists,
    };
}
