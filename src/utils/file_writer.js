const fs = require('fs');
const path = require('path');
const { createLogger } = require('./logger.js');

/** 模块日志 */
var log = createLogger('FileWriter');

/**
 * 文件写入器 — 封装 Node.js fs 操作，确保目录存在后写入文件
 */

// =============================================================================
// JSON 注释剥离
// =============================================================================

/**
 * 剥离 JSON 中的 // 单行注释（支持 inline 和独立行注释）。
 *
 * 通过跟踪双引号的奇偶性来判断 // 是否出现在字符串字面量内部，
 * 避免误删 URL（如 "http://example.com"）中的 //。
 *
 * @param {string} content - 包含 // 注释的类 JSON 文本
 * @returns {string} 剥离注释后的纯 JSON 文本
 */
function stripJsonComments(content) {
    var lines, result, i, line, inString, commentStart, j, ch, stripped;

    lines = content.split('\n');
    result = [];

    for (i = 0; i < lines.length; i++) {
        line = lines[i];
        inString = false;
        commentStart = -1;

        for (j = 0; j < line.length; j++) {
            ch = line[j];
            if (ch === '"' && (j === 0 || line[j - 1] !== '\\')) {
                inString = !inString;
            } else if (ch === '/' && line[j + 1] === '/' && !inString) {
                commentStart = j;
                break;
            }
        }

        if (commentStart >= 0) {
            stripped = line.substring(0, commentStart);
            if (stripped.trim().length > 0) {
                result.push(stripped);
            }
        } else {
            result.push(line);
        }
    }

    return result.join('\n');
}

// =============================================================================
// 核心 I/O 函数
// =============================================================================

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        log.debug('ensureDir: 已创建目录 ' + dirPath);
    }
}

function writeJSONFile(dir, filename, data) {
    try {
        ensureDir(dir);
        const filePath = path.join(dir, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        log.debug('writeJSONFile: 已写入 ' + filePath);
        return filePath;
    } catch (e) {
        log.error('writeJSONFile: 写入失败 ' + path.join(dir, filename), e);
        throw e;
    }
}

function writeTextFile(dir, filename, text) {
    try {
        ensureDir(dir);
        const filePath = path.join(dir, filename);
        fs.writeFileSync(filePath, text, 'utf-8');
        log.debug('writeTextFile: 已写入 ' + filePath);
        return filePath;
    } catch (e) {
        log.error('writeTextFile: 写入失败 ' + path.join(dir, filename), e);
        throw e;
    }
}

function readJSONFile(filePath) {
    if (!fs.existsSync(filePath)) {
        log.debug('readJSONFile: 文件不存在 ' + filePath);
        return null;
    }
    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(stripJsonComments(raw));
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

/**
 * Windows 下使用 .NET API 永久删除单个文件（不进回收站）
 *
 * PowerShell 的 Remove-Item 底层使用 Shell API，默认附带 FOF_ALLOWUNDO
 * 标志导致文件进入回收站。而 [System.IO.File]::Delete() 直接调用 Win32
 * DeleteFile API，不经过 Shell，等效于 Linux 的 unlink()。
 *
 * @param {string} filePath - 要删除的文件路径
 */
function _deletePermanent(filePath) {
    if (process.platform === 'win32') {
        try {
            var cp = require('child_process');
            var psCmd = 'try { [System.IO.File]::Delete("' + filePath.replace(/\\/g, '\\\\') + '") } catch {}';
            cp.spawnSync(
                'powershell.exe',
                [
                    '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
                    '-Command', psCmd
                ],
                { timeout: 10000 }
            );
            log.debug('_deletePermanent: File::Delete ' + filePath);
            return;
        } catch (_e) {
            log.debug('_deletePermanent: child_process 不可用，降级到 fs.unlinkSync: ' + _e.message);
        }
    } else {
        log.debug('_deletePermanent: 非 Windows 平台，使用 fs.unlinkSync');
    }
    fs.unlinkSync(filePath);
    log.debug('_deletePermanent: fs.unlinkSync 删除 ' + filePath);
}

function deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
        _deletePermanent(filePath);
        log.debug('deleteFile: 已删除 ' + filePath);
    } else {
        log.debug('deleteFile: 文件不存在，跳过 ' + filePath);
    }
}

/**
 * 将实体 ID 解析为 ResourceLocation（namespace:path）。
 * 若有冒号，取第一个冒号前后的部分；若无，使用 defaultNs 作为 namespace。
 *
 * @param {string} id - 实体 ID，如 'machine_max:steel' 或 'simple_id'
 * @param {string} defaultNs - 无冒号时的默认 namespace
 * @returns {{ ns: string, path: string }}
 */
function extractResourceLocation(id, defaultNs) {
    var str = id || '';
    var colonIdx = str.indexOf(':');
    if (colonIdx >= 0) {
        return {
            ns: str.substring(0, colonIdx),
            path: str.substring(colonIdx + 1),
        };
    }
    return { ns: defaultNs || '', path: str };
}

/**
 * 合并写入 JSON 文件 — 保留已有条目，仅添加缺失的键
 * 先读取现有文件（如果有），将 newData 中不存在于现有文件的键补入，
 * 最后整体写回。适用于 lang/*.json 等不希望覆盖手动添加条目的场景。
 *
 * @param {string} dir - 目录
 * @param {string} filename - 文件名
 * @param {Object} newData - 要合并的新数据（新条目优先但不会覆盖已有）
 * @returns {string} 文件路径
 */
function mergeJSONFile(dir, filename, newData) {
    ensureDir(dir);
    var filePath = path.join(dir, filename);
    var existing = readJSONFile(filePath) || {};
    for (var key in newData) {
        if (newData.hasOwnProperty(key) && !(key in existing)) {
            existing[key] = newData[key];
        }
    }
    try {
        fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8');
        log.debug('mergeJSONFile: 已合并写入 ' + filePath + '（新增 ' + (Object.keys(newData).length) + ' 条，已有 ' + (Object.keys(existing).length) + ' 条）');
        return filePath;
    } catch (e) {
        log.error('mergeJSONFile: 写入失败 ' + filePath, e);
        throw e;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ensureDir, writeJSONFile, writeTextFile, readJSONFile, fileExists, deleteFile, extractResourceLocation, mergeJSONFile, stripJsonComments };
}
