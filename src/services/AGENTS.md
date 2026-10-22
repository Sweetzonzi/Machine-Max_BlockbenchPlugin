# AGENTS.md — src/services/（服务层）

## 概览

文件系统 / 导出闸门等「不参与撤销、不暴露给 MCP」的用例。依赖顺序固定：
`core → doc → ops → services → ui/mcp`。

```
src/services/
├── export.js          # canExport / dedupeIssues / toProblem + executeExport 聚合出口
├── export_pipeline.js # executeExport（生成器 + 写盘 + schema 注入）
├── safe_part_ids.js   # assertSafePartIds
├── import.js          # readTextFile / parseJSONWithComments / readJsonFile
├── pack.js            # createPack / openPack / readPackMeta / 依赖链解析
├── icon_paths.js      # 纯 planner：part.icon 三态 / resource location
├── icon_visibility.js # 纯函数：start/end/auto_end → 可见 UUID 集
├── icon_fit.js        # 纯函数：AABB → 正交 zoom / target
├── icon_generator.js  # 离屏渲染 + 128 PNG 写盘
└── validate.js        # collectIssues（唯一校验实现）
```

## 查找指引

| 任务 | 文件 | 说明 |
|---|---|---|
| 导出前校验 | `export.js` → `canExport(config)` | `validate.js` 的 `collectIssues` + `doc.validate.validateTree(completeness:true)`，按 `path.field` 去重后返回 `{ok, errors, warnings, issues}` |
| 导出前 partId 断言 | `safe_part_ids.js` → `assertSafePartIds(config)` | 任何 `mkdir` / `writeFile` 前调用；不安全 partId 直接抛错，不产生半个包 |
| 执行导出 | `export.js` → `executeExport(...)` | 聚合自 `export_pipeline.js`；`export_dialog` 只从 `export.js` 进入。写盘范围：`parts` / `lang` / `meta` / `geo` 由生成器重写；`recipe` 只改 `$schema` 行（未知 `type` 跳过）；`connectors` / `subsystems` / `materials` 原地导出时原样不动；`docs/schemas` 仅给还没有 docs 的新包铺副本 |
| 段数组转 Problem | `export.js` → `toProblem(error, config)` | 固定层级 `parts/<id>/variants/<v>/sub_parts/<sp>/<container>/<item>/<field...>` |
| 问题合并 | `export.js` → `dedupeIssues(primary, schema)` | `collectIssues` 优先，`validateTree` 只补空缺；不同字段不合并 |
| 导入文件读取 | `import.js` → `readTextFile` / `parseJSONWithComments` | 去 BOM、剥 `//` 注释；冲突对话框与 ops 编排仍在 `import/drag_import.js` |
| 内容包 fs | `pack.js` | 创建/打开/读 meta 的薄包装；`findPackInSiblings` / `resolveChainDependencies` |
| 图标生成 | `icon_generator.js` | `generate(config, options)`：离屏渲染 + PNG 写盘；`icon_paths` / `icon_visibility` / `icon_fit` 为纯函数；`part.icon` 由 UI 调 `ops.setPartIcons` |
| 唯一校验 | `validate.js` → `collectIssues(config)` | P4 从 `mode/validation.js` 迁入；`mode/validation_check.js` 只做原生清单适配 |

## 约定

- `services/` 可以 `require('fs')` / `require('path')`、可以 async，但**不进撤销栈**、**不暴露给 MCP**。
- 导出闸门只做只读校验，不修改 `config`；提示文案由调用方（`export_dialog`）决定。
- P4 已完成：`executeExport`、`drag_import` IO、pack fs 与 `collectIssues` 均已迁入本层；不再保留 `services → mode`。
- `collectIssues` 落 `validate.js` 而不是 `core/validation.js`：它依赖 `doc/refs.js`，放 core 会反转 `core → doc` 分层（docs/13 D30）。
- `hit_boxes` key 不是骨骼 UUID 时 `collectIssues` 报 `hit_box_key_not_uuid`；没有模型元素时跳过（测试 / 未加载模型不误报）。
- 新增服务后同步 `docs/13` §8 与根 `AGENTS.md` 的导入图。
- 图标生成是独立写盘用例：`icon_generator` 不写 `_uiState`、不 toast、不刷新；字段更新由 UI 在写盘成功后调用 `ops.setPartIcons`。零件路径逐条用 `keys.isSafePartId`，不能复用整包 `assertSafePartIds`。

## 反模式

- 不要在 `services/` 里调 `showToast` / `refreshOutlinerIcons` / `ops.*`。
- 不要在 generator 里直接写盘绕过 `assertSafePartIds`；导出只有一个入口。
