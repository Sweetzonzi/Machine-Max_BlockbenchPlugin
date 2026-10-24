// 文件: src/lib/json_text.js
// 用途: 纯文本层面的 JSON 处理（去 BOM、剥 // 注释后解析）
// 所属模块: MachineMax Blockbench 插件
//
// 零依赖、零 I/O：不 require fs / path，纯策略层（services/import_plan.js）可以安全引用。
// 文件读取留在 services/import.js（readTextFile / readJsonFile）。
//
// 注意：只支持 `//` 行内注释，不支持 `/* */` 块注释（与导入历史行为一致）。

'use strict';

/**
 * 剥离 JSON 文本中的 `//` 行内注释并去掉 UTF-8 BOM。
 * 字符串字面量（`"..."`）内部的 `//` 保留；转义引号（`\"`）不结束字符串。
 * @param {string} content - 原始文件内容
 * @returns {string} 可直接交给 JSON.parse 的文本
 */
function stripComments(content) {
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
    return result.join('\n');
}

/**
 * 剥离 JSON 中的 // 单行注释并解析。
 * @param {string} content - 原始文件内容
 * @returns {Object} 解析后的 JSON 对象
 * @throws {Error} JSON 格式错误时抛出
 */
function parseJSONWithComments(content) {
    return JSON.parse(stripComments(content));
}

module.exports = {
    stripComments: stripComments,
    parseJSONWithComments: parseJSONWithComments,
};
