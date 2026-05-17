# AGENTS.md — src/ui/（用户界面层）

## 概览

Vue 2 属性面板 + BarMenu + 导出管线。重构前 `App.vue.js` 为 1035 行单体文件，现已拆分为 3 个独立模块。

## 结构

```
src/ui/
├── App.vue.js              # 主 Vue 2 面板（691行，mm-main-panel）
├── SubPartPanel.vue.js     # 子零件属性子组件（86行）
├── HitBoxPanel.vue.js      # 碰撞箱属性子组件（68行）
├── tag_dialog_helper.js    # 标签对话框辅助模块（222行）
├── menu.js                 # BarMenu + 导出对话框 + 包设置（556行）
└── panels/                 # HTML 模板（编译时常量）
    ├── part_definition_panel.html  # 主面板模板 → TEMPLATE_PART_PANEL
    ├── sub_part_panel.html         # 子零件模板 → TEMPLATE_SUB_PART_PANEL
    └── hit_box_panel.html          # 碰撞箱模板 → TEMPLATE_HIT_BOX_PANEL
```

## 查找指引

| 任务 | 文件 | 说明 |
|------|------|------|
| 修改属性面板布局 | `App.vue.js` + `panels/*.html` | Vue 2 组件树: mm-main-panel → mm-sub-part-panel, mm-hit-box-panel |
| 修改子零件面板 | `SubPartPanel.vue.js` + `sub_part_panel.html` | 骨骼范围、物理属性、碰撞箱列表 |
| 修改碰撞箱面板 | `HitBoxPanel.vue.js` + `hit_box_panel.html` | 碰撞箱尺寸、材质覆写 |
| 修改标签对话框 | `tag_dialog_helper.js` | `showAddTagDialog(vm, variant)` — 标签 CRUD + 颜色哈希 |
| 添加新工具栏动作 | `menu.js` → `registerMachineMaxMenu()` | 菜单是纯对象 `{name, icon, click}` — Blockbench 中无 MenuItem 类 |
| 接线导出 | `menu.js` → `_executeExport()` | 串联 6 个生成器；通过 `file_writer.js` 写入 |
| 添加设置字段 | `menu.js` → `_showPackSettingsDialog()` | 8 字段 Dialog；在 `onConfirm` 前添加表单字段 |
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
