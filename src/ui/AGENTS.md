# AGENTS.md — src/ui/（用户界面层）

## 概览

Vue 2 属性面板 + BarMenu + 导出管线。重构前 `App.vue.js` 为 1035 行单体文件，现已拆分为多个独立模块。

## 结构

```
src/ui/
├── App.vue.js              # 主 Vue 2 面板（1465行，mm-main-panel）
├── SubPartPanel.vue.js     # 子零件属性子组件（86行）
├── HitBoxPanel.vue.js      # 碰撞箱属性子组件（68行）
├── SignalFlowPanel.vue.js  # 信号流图可视化面板（579行）
├── tag_dialog_helper.js    # 标签对话框辅助模块（222行）
├── menu.js                 # BarMenu 注册与菜单入口（319行）
├── components/             # 共享 Vue 组件
│   ├── definition_viewer.js        # 通用只读定义查看器（5 个"查看定义"入口共用）
│   ├── SignalTargetEditor.vue.js   # 信号目标编辑器（三面板复用）
│   ├── LocatorPicker.vue.js        # 定位器选择（输入框 + datalist + 自由文本）
│   └── KeyValueEditor.vue.js       # 键值对编辑器
├── export/                 # 导出管线（从 menu.js 拆出）
│   ├── export_pipeline.js  # executeExport — 目录结构 + schema 注入
│   └── export_dialog.js    # showExportDialog / showPackSettingsDialog
├── dialogs/                # 对话框子组件（由 menu.js 调用）
│   ├── pack_setup_dialog.js    # 内容包设置向导主入口（转发拆分模块）
│   ├── pack_create_dialog.js   # 创建新内容包
│   ├── pack_open_dialog.js     # 打开已有内容包
│   ├── dependency_editor.js    # 依赖路径编辑 + 链式解析 + 管理对话框
│   ├── pack_common.js          # 内容包对话框公共工具
│   ├── subsystem_dialog.js     # 子系统型号查看对话框（只读）
│   ├── connector_dialog.js     # 连接点定义查看对话框（只读）
│   ├── material_dialog.js      # 材质定义查看对话框（只读）
│   ├── projectile_dialog.js    # 投射物定义查看对话框（只读）
│   └── control_group_dialog.js # 控制组预设查看对话框（只读）
└── panels/                 # HTML 模板（编译时常量）
    ├── part_definition_panel.html  # 主面板模板 → TEMPLATE_PART_PANEL
    ├── sub_part_panel.html         # 子零件模板 → TEMPLATE_SUB_PART_PANEL
    ├── hit_box_panel.html          # 碰撞箱模板 → TEMPLATE_HIT_BOX_PANEL
    ├── subsystem_panel.html        # 子系统面板 → TEMPLATE_SUBSYSTEM_PANEL
    ├── connector_panel.html        # 连接点面板 → TEMPLATE_CONNECTOR_PANEL
    └── interact_box_panel.html     # 交互区面板 → TEMPLATE_INTERACT_BOX_PANEL
```

## 查找指引

| 任务 | 文件 | 说明 |
|------|------|------|
| 修改属性面板布局 | `App.vue.js` + `panels/*.html` | Vue 2 组件树: mm-main-panel → mm-sub-part-panel, mm-hit-box-panel, mm-signal-flow-panel |
| 修改子零件面板 | `SubPartPanel.vue.js` + `sub_part_panel.html` | 骨骼范围、物理属性、碰撞箱列表 |
| 修改碰撞箱面板 | `HitBoxPanel.vue.js` + `hit_box_panel.html` | 碰撞箱尺寸、材质覆写 |
| 修改信号流图面板 | `SignalFlowPanel.vue.js` | SVG 力导向图，数据来自 `lib/signal_graph.js` |
| 修改标签对话框 | `tag_dialog_helper.js` | `showAddTagDialog(vm, variant)` — 标签 CRUD + 颜色哈希 |
| 添加新工具栏动作 | `menu.js` → `registerMachineMaxMenu()` | 菜单是纯对象 `{name, icon, click}` — Blockbench 中无 MenuItem 类 |
| 接线导出 | `export/export_pipeline.js` → `executeExport()` | 串联 6 个生成器 + codec 编码 → 通过 `file_writer.js` 写入 |
| 添加设置字段 | `export/export_dialog.js` → `showPackSettingsDialog()` | 8 字段 Dialog；在 `onConfirm` 前添加表单字段 |
| 内容包对话框 | `dialogs/pack_setup_dialog.js` | 向导主入口，转发 create/open/dependency 三个拆分模块 |
| 定义查看对话框 | `components/definition_viewer.js` | `showDefinitionViewer()` — 5 个"查看定义"入口共用；列表 + 来源徽标 + 只读标记 + 统计条 |
| 信号目标编辑器 | `components/SignalTargetEditor.vue.js` | SubsystemPanel / ConnectorPanel / InteractBoxPanel 复用；频道增删改、目标过滤去重 |
| 定位器选择 | `components/LocatorPicker.vue.js` | 输入框 + datalist 提示 + 自由文本；不存在的值标红/黄但不拦截输入 |
| 修改面板样式 | `../styles/mm_mode.css` | 所有类以 `mm-` 为前缀；CSS 自定义属性用于主题 |
| 修复 Vue 响应式错误 | `App.vue.js` | 使用 `this.$set(obj, key, val)` 处理嵌套变更 |

## 约定

- **Vue 2 $set 必用**: 始终使用 `this.$set()` / `this.$delete()` 处理嵌套对象/数组变更。直接 `array.push()` / `obj.prop = val` 在 Vue 2 中静默失效。
- **事件生命周期**: `Blockbench.on()` 返回清理函数——保存返回值并在 `beforeDestroy()` 中调用。
- **模板常量**: `TEMPLATE_PART_PANEL`、`TEMPLATE_SUB_PART_PANEL`、`TEMPLATE_HIT_BOX_PANEL` 是 esbuild `define` 全局变量——永远不要 `require()` 它们。修改后需 `npm run build`。
- **对话框模式**: 所有交互使用 `new Dialog({id, title, form, onConfirm}).show()` — 需要 `.show()` 链式调用。
- **标签调色板**: `_hashTagColor()` 通过哈希将标签映射到 8 种 CSS 颜色之一——可能存在碰撞。
- **配置访问**: 始终通过 `getConfig()` 从 `utils/persistence.js` 获取，不要直接读取 `Project.machine_max_plugin`。

## 反模式

- **直接数组变更** 而不使用 `$set`: `array.push()`, `array.splice()`, `array.length = 0`
- **保存无错误边界**: `App.vue.js` 中 `saveConfig()` 调用无 try/catch——可能崩溃 Blockbench 的保存循环
- **回退模板掩盖错误**: `typeof TEMPLATE_XXX !== 'undefined' ? TEMPLATE_XXX : '<p>...</p>'` — 若运行时模板缺失，会静默显示损坏的 UI 而非抛出错误
