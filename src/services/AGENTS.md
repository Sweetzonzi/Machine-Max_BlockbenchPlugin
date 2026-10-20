# AGENTS.md — src/services/（服务层）

## 概览

文件系统 / 导出闸门等「不参与撤销、不暴露给 MCP」的用例。依赖顺序固定：
`core → doc → ops → services → ui/mcp`。

```
src/services/
└── export.js   # canExport / dedupeIssues / toProblem / assertSafePartIds（P3）
```

## 查找指引

| 任务 | 文件 | 说明 |
|---|---|---|
| 导出前校验 | `export.js` → `canExport(config)` | `collectIssues`（业务完整性）+ `validateTree(completeness:true)`（schema 值/required），按 `path.field` 去重后返回 `{ok, errors, warnings, issues}` |
| 导出前 partId 断言 | `export.js` → `assertSafePartIds(config)` | 任何 `mkdir` / `writeFile` 前调用；不安全 partId 直接抛错，不产生半个包 |
| 段数组转 Problem | `export.js` → `toProblem(error, config)` | 固定层级 `parts/<id>/variants/<v>/sub_parts/<sp>/<container>/<item>/<field...>` |
| 问题合并 | `export.js` → `dedupeIssues(primary, schema)` | `collectIssues` 优先，`validateTree` 只补空缺；不同字段不合并 |

## 约定

- `services/` 可以 `require('fs')` / `require('path')`、可以 async，但**不进撤销栈**、**不暴露给 MCP**。
- 导出闸门只做只读校验，不修改 `config`；提示文案由调用方（`export_dialog`）决定。
- P4 会把 `executeExport`、`drag_import` 的 IO、pack 三件套 fs 迁入本层；过渡期允许
  `services → mode`（`collectIssues` 仍在 `mode/validation.js`）。
- 新增服务后同步 `docs/13` §8 与根 `AGENTS.md` 的导入图。

## 反模式

- 不要在 `services/` 里调 `showToast` / `refreshOutlinerIcons` / `ops.*`。
- 不要在 generator 里直接写盘绕过 `assertSafePartIds`；导出只有一个入口。
