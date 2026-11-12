// 文件: src/services/export.js
// 用途: 导出闸门 canExport + partId 出口断言（docs/13 §4.3 / §8）
// 所属模块: MachineMax Blockbench 插件
//
// 问题清单的实现已下沉到 services/issues.js（面板 / 原生校验 / 导出闸门共用），
// 这里只负责「闸门」这一件事：合并问题 + 编码试跑 + partId 安全断言。
//
// P4：collectIssues 已下沉到 services/validate.js（保持 core 不依赖 doc）。
// services 层可以 require fs、async、不参与撤销、不暴露给 MCP。

'use strict';

var issuesLib = require('./issues.js');
var { assertSafePartIds } = require('./safe_part_ids.js');

/**
 * 导出闸门：业务完整性 + schema 值/key + 编码试跑。
 *
 * 三者缺一不可：前两项决定「数据合不合规」，第三项决定「编码器认不认」；
 * 只做前两项的话，schema 看不出的形状问题会让写出过程在中途抛错，
 * 留下半个内容包。
 *
 * @param {Object} config
 * @returns {{ok:boolean, errors:Array, warnings:Array, issues:Array}}
 */
function canExport(config) {
    if (!config || typeof config !== 'object') {
        return {
            ok: false,
            errors: [{
                severity: 'error', code: 'config_unavailable',
                message: '配置不可用', path: { scope: 'config', partId: '', variantName: '', field: '' },
            }],
            warnings: [],
            issues: [],
        };
    }

    var issues = issuesLib.collectAllIssues(config);
    issues = issues.concat(issuesLib.probeEncodable(config, issues));

    var errors = issues.filter(function (p) { return p.severity === 'error'; });
    var warnings = issues.filter(function (p) { return p.severity !== 'error'; });
    return { ok: errors.length === 0, errors: errors, warnings: warnings, issues: issues };
}

/**
 * executeExport 由 export_pipeline.js 实现（P4 从 ui/export/ 迁入）；
 * 这里只做聚合导出，调用方统一从 services/export.js 进入。
 */
var pipeline = require('./export_pipeline.js');

module.exports = {
    canExport: canExport,
    assertSafePartIds: assertSafePartIds,
    executeExport: pipeline.executeExport,
    // 问题清单原语：留在本文件导出，保持既有调用方与测试的入口不变
    collectAllIssues: issuesLib.collectAllIssues,
    dedupeIssues: issuesLib.dedupeIssues,
    toProblem: issuesLib.toProblem,
    _issueKey: issuesLib.issueKey,
};
