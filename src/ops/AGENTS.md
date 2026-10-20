# AGENTS.md — src/ops/（业务操作层）

## 概览

`src/ops/` 是配置写入的唯一业务入口（docs/13 §6）。每个函数对应一个业务动作，
内部负责「校验前置 → `runConfigEdit` → 返回 `OpResult`」；不落盘、不 toast、不刷新。

依赖顺序：`core → doc → ops → services → ui/mcp`。

## 结构

```
src/ops/
├── index.js      # 29 个动作的聚合导出
├── field.js      # setField + 字段级副作用（start_bone / bone / locator / subsystem.type）
├── part.js       # createPart / deletePart / importPart
├── variant.js    # createVariant / deleteVariant / importVariant / setVariantTags
├── sub_part.js   # markSubPart / importSubPart / renameSubPart
├── subsystem.js  # createSubsystem / deleteSubsystem / importSubsystem / renameSubsystem
├── element.js    # mark*/rename*/bindMarker/removeNode/addInstance/clearElementMarker
├── pack.js       # setContentPack / setContentPackPath / updatePackMeta / updateDependencyPaths
└── session.js    # setActive（只改 _uiState，不进撤销栈）
```

## 契约

- 第一参数永远是完整配置对象（`getConfig()` 结果），不收 Vue 实例。
- 返回 `OpResult`（docs/13 §12）：`{ok, path, data, changed, before, after, reset_fields,
  cleaned_references, unresolved_bones, warnings}`；失败 `{ok:false,error,errors[]}`，不抛异常。
- 结构性动作一律 `coalesce:false`；`setField` 默认也不合并，只有 UI 连续数值编辑显式传
  `{coalesce:true, mergeKey}`。
- 整件通道（`importPart` / `importVariant` / `importSubPart`）固定顺序：
  `clearScope(markerCleanup)` → 替换节点 → `set(markerPlan)` → `recalc auto_end_bones`。
- marker 能力通过 `doc/ports` 注入；测试可换 fake，生产在 `plugin.js onload` 安装。

## 新增动作

1. 在对应域文件写 `function xxx(config, options)`；
2. 前置校验（key / 存在性 / 引用）在 `runConfigEdit` 之前完成；
3. 写配置用 `doc` 原语或 `shared.setProp` / `shared.delProp`；
4. 在 `index.js` 聚合导出；
5. 补 `test/ops/*.test.js`。

## 反模式

- 不要在 UI 对话框 / 面板里再包 `runConfigEdit`（撤销边界只在这里）。
- 不要绕过 `doc/keys` 自己写 key 正则。
- 不要在 ops 里 `showToast` / `saveConfig` / `refreshOutlinerIcons`。
