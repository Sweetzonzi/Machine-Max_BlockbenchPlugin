// 文件: src/services/import.js
// 用途: 导入文件读取与 JSON 解析（docs/13 §8 P4）
// 所属模块: MachineMax Blockbench 插件
//
// services 层可以 require fs；不参与撤销、不暴露给 MCP。
// 冲突对话框 / 标记 / 写配置仍留在 import/drag_import.js（UI 与 ops 编排）。

'use strict';

var fs = require('fs');

/**
 * 剥离 JSON 中的 // 单行注释并解析。
 * @param {string} content - 原始文件内容
 * @returns {Object} 解析后的 JSON 对象
 * @throws {Error} JSON 格式错误时抛出
 */
function parseJSONWithComments(content) {
    // 去除 UTF-8 BOM
    if (content && content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }

    var lines = content.split('\n');
    var result = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var inString = false;
        var commentStart = -1;
        for (var j = 0; j < line.length; j++) {
            var ch = line[j];
            if (ch === '"' && (j === 0 || line[j - 1] !== '\\')) {
                inString = !inString;
            }
            if (!inString && ch === '/' && j + 1 < line.length && line[j + 1] === '/') {
                commentStart = j;
                break;
            }
        }
        if (commentStart >= 0) {
            line = line.substring(0, commentStart);
        }
        result.push(line);
    }
    return JSON.parse(result.join('\n'));
}

/** 以 UTF-8 读取文本文件。 */
function readTextFile(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}

/** 读取并解析带注释的 JSON 文件。 */
function readJsonFile(filePath) {
    return parseJSONWithComments(readTextFile(filePath));
}

module.exports = {
    parseJSONWithComments: parseJSONWithComments,
    readTextFile: readTextFile,
    readJsonFile: readJsonFile,
};
