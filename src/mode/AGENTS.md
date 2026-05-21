# AGENTS.md — src/mode/（模式层）

## 概览

MachineMax 自定义模式"零件定义"的全部逻辑。负责模式生命周期、Vue 面板懒加载、Outliner 图标、原型猴子补丁、配置校验和工具栏动作注册。

重构前 `mode.js` 为 935 行单体文件，现已拆分为 4 个专注模块 + 懒加载 Vue 面板。

## 结构

```
src/mode/
├── mode.js           # 模式注册 + 生命周期（341行，含 Vue 面板懒加载）
├── icons.js          # Outliner 图标刷新（82行）
├── patches.js        # 原型猴子补丁 + 右键菜单（623行）
├── validation.js     # 配置校验（48行）
└── toolbar.js        # 工具栏 Action 注册（185行）
```

## 查找指引

| 任务 | 文件 | 说明 |
|------|------|------|
| 修改模式生命周期 | `mode.js:registerMode()` | onSelect/onUnselect、Panel 注册、CSS 注入 |
| 修改 Outliner 图标 | `icons.js` | `refreshOutlinerIcons()`, `resetOutlinerIcons()` |
| 修改右键菜单 | `patches.js` | `buildMMMenuItems()`, `patchShowContextMenu()` |
| 修改校验逻辑 | `validation.js` | `runValidation()` — 纯函数，返回错误列表 |
| 修改工具栏按钮 | `toolbar.js` | `registerToolbarActions()` — 注册 4 个 Action |
| 添加工具栏按钮 | `toolbar.js` | 在 `_mmActionIds` 中添加 ID，push 新的 `Action()` |

## 依赖关系

```
mode.js
  ├── icons.js        → element_markers, persistence (getConfig)
  ├── patches.js      → element_markers, persistence, notify, LOGGER
  │                     (内部懒加载 mode.js 获取 refreshOutlinerIcons)
  ├── validation.js   → LOGGER
  └── toolbar.js      → persistence, notify, LOGGER, validation
                        (内部懒加载 mode.js 获取 refreshOutlinerIcons)
mode.js ──→ App.vue.js（懒加载，运行时安全）
App.vue.js ──→ icons.js（无循环依赖）
App.vue.js ──→ SignalFlowPanel.vue.js ──→ lib/signal_graph.js
```

## 约定

- **热重载安全**: 所有注册前检查重复（`Mode.modes`、`BarItems`、`Panels`）
- **懒加载**: `require('../mode.js')` 出现在函数体内而非模块顶层，避免加载时循环依赖
- **Action 清理**: `_mmActionInstances` 跟踪所有注册的 Action，`unregisterActions()` 在插件卸载时通过 `action.delete()` 清理
- **右键菜单注入**: 注入条目在 `menu.open()` 前推入 `menu.structure`，在 `open()` 返回后弹出
