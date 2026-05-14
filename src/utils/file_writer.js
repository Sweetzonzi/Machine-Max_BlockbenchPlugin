const fs = require('fs');
const path = require('path');

/**
 * 文件写入器 — 封装 Node.js fs 操作，确保目录存在后写入文件
 */

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function writeJSONFile(dir, filename, data) {
    ensureDir(dir);
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return filePath;
}

function writeTextFile(dir, filename, text) {
    ensureDir(dir);
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, text, 'utf-8');
    return filePath;
}

function readJSONFile(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
}

function fileExists(filePath) {
    return fs.existsSync(filePath);
}

function deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ensureDir, writeJSONFile, writeTextFile, readJSONFile, fileExists, deleteFile };
}
