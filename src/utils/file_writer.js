const fs = require('fs');
const path = require('path');
const { createLogger } = require('./logger.js');

/** 模块日志 */
var log = createLogger('FileWriter');

/**
 * 文件写入器 — 封装 Node.js fs 操作，确保目录存在后写入文件
 */

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        log.debug('ensureDir: 已创建目录 ' + dirPath);
    }
}

function writeJSONFile(dir, filename, data) {
    ensureDir(dir);
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    log.debug('writeJSONFile: 已写入 ' + filePath);
    return filePath;
}

function writeTextFile(dir, filename, text) {
    ensureDir(dir);
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, text, 'utf-8');
    log.debug('writeTextFile: 已写入 ' + filePath);
    return filePath;
}

function readJSONFile(filePath) {
    if (!fs.existsSync(filePath)) {
        log.debug('readJSONFile: 文件不存在 ' + filePath);
        return null;
    }
    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        log.debug('readJSONFile: 已读取 ' + filePath);
        return data;
    } catch (e) {
        log.error('readJSONFile: 读取失败 ' + filePath, e);
        return null;
    }
}

function fileExists(filePath) {
    var exists = fs.existsSync(filePath);
    log.debug('fileExists: ' + filePath + ' → ' + exists);
    return exists;
}

function deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        log.debug('deleteFile: 已删除 ' + filePath);
    } else {
        log.debug('deleteFile: 文件不存在，跳过 ' + filePath);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ensureDir, writeJSONFile, writeTextFile, readJSONFile, fileExists, deleteFile };
}
