# AGENTS.md — src/mcp/（MCP 工具层）

## 概览

把 `doc` + `ops` 的能力适配成 Blockbench MCP 工具（[docs/12](../../docs/12-MCP工具接入.md)）。
这一层只做协议适配：参数归一化、active 上下文补全、`OpResult → MCP` 信封、注册生命周期。
**不自己实现**寻址、字段校验、引用清理或撤销边界。

## 结构

```
src/mcp/
├── index.js   # registerMcpTools / unregisterMcpTools；MCP_QUEUE + 同名注销
├── tools.js   # 12 个工具：get_context / read_node / validate /
│              #   set_node / remove_node / bind_marker / set_active /
│              #   import_part / import_variant / import_sub_part /
│              #   import_subsystem / add_instance
├── params.js  # build(z)，用 MCP.z 构造参数形状
└── result.js  # OpResult → {ok,path,before,after,...}；MCP.createJsonResult 包装
```

## 契约

- 工具名统一 `machine_max_bb_plugin_` 前缀；`condition` 固定
  `{ project: true, modes: ['machine_max_part'] }`。
- 所有编辑工具调用 ops 时固定传 `source:'mcp'`、`persist:false`、`strict:true`。
  `persist:false` 让 UI 订阅者不 `scheduleSave()`；`strict:true` 让「编辑器忙 / 快照超限」
  变成 `edit_in_progress` / `snapshot_too_large`，而不是静默执行。
- 失败一律 `ok:false` 且不抛异常；`execute` 捕获异常并转结构化错误。
- `introduced_issues` 由 `tools.js` 在调用前后各跑一次 `collectIssues` 做 diff，不写进 ops。
- `read_node(as='definition')` 用 `doc.projection.out(..., {for:'read'})`；`sub_parts` / `variants`
  保持 map，不折叠。
- `validate` 复用 `services/export.canExport`（= `collectIssues` + `validateTree(completeness:true)` + 去重）。
- 工具不落盘、不导出、不建内容包、不碰 `fs`。

## 参数与路径

- `path` 接受段数组或 JSON Pointer；首段不是根字段（`parts` / `namespace` / `modelFile` /
  `contentPackPath` / `dependencyPaths` / `packMeta` / `$schema_version`）时，自动补
  `['parts', activePartId, 'variants', activeVariantName]`。
- `hit_boxes` 的 key 支持骨骼名与 UUID；响应里的 `path` 使用归一化后的段数组。
- `add_instance` 的 `key`：`hit_box` 是骨骼名；`interact_box` / `connector` 是配置键，
  元素名取自 `definition.bone` / `definition.locator`。
- `import_*` 的 `mode`：`create` 重名拒绝、`replace` 整体替换、`rename` 需 `old_key`、
  `reject` 与 `create` 同义；省略时按目标是否存在自动选择。

## 注册时序

1. `plugin.js onload` 调 `registerMcpTools()`，把 `{plugin, setup}` 推进 `globalThis.MCP_QUEUE`。
2. MCP 插件 drain 队列并调 `setup(mcp)`；`setup` 先按名字 `unregisterTool` 再 `registerTool`。
3. `plugin.js onunload` 调 `unregisterMcpTools()`；同时清理 disposer 与队列条目。

MCP 插件未安装时只创建一个空队列，插件其它功能不受影响。

## 反模式

- 不要在工具里 `runConfigEdit` / `saveConfig` / `showToast` / `executeExport`。
- 不要绕过 `ops` 直接 `doc.write`（撤销、副作用、引用清理都会丢）。
- 不要在 `params.js` 里 `require('zod')`；zod 实例必须来自 `MCP.z`。
- 不要把 `reset_fields` 当递归 diff；它只列顶层字段。
