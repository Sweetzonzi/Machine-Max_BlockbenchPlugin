// 文件: src/services/import.js
// 用途: 导入文件读取与 JSON 解析（docs/13 §8 P4）
// 所属模块: MachineMax Blockbench 插件
//
// services 层可以 require fs；不参与撤销、不暴露给 MCP。
// 文本解析（去 BOM / 剥 // 注释）已下沉到 src/lib/json_text.js（纯函数），此处再导出，
// 让纯策略层（services/import_plan.js）不必依赖 fs。
// 冲突对话框 / 标记 / 写配置仍留在 import/drag_import.js（UI 与 ops 编排）。

'use strict';

var fs = require('fs');
var jsonText = require('../lib/json_text.js');

/** 以 UTF-8 读取文本文件。 */
function readTextFile(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}

/** 读取并解析带注释的 JSON 文件。 */
function readJsonFile(filePath) {
    return jsonText.parseJSONWithComments(readTextFile(filePath));
}

module.exports = {
    stripComments: jsonText.stripComments,
    parseJSONWithComments: jsonText.parseJSONWithComments,
    readTextFile: readTextFile,
    readJsonFile: readJsonFile,
};
