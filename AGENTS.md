# AGENTS.md — MachineMax Blockbench 插件

## 全局约定

### 技术栈
- **语言**: ES6+ JavaScript（无 TypeScript）
- **模块系统**: CommonJS（`require` / `module.exports`）
- **构建工具**: esbuild（`scripts/build.js`），打包为 IIFE
- **测试框架**: bun test（`test/` 目录）
- **UI 框架**: Vue 2（Blockbench 内嵌）

### 导入图（重构后）

```
plugin.js
  ├── mode.js (模式生命周期 + 注册)
  │     ├── mode/icons.js        (Outliner 图标刷新)
  │     ├── mode/patches.js      (原型猴子补丁)
  │     ├── mode/validation.js   (配置校验)
  │     ├── mode/toolbar.js      (工具栏 Action 注册)
  │     └── ui/App.vue.js        (Vue 属性面板 - 懒加载)
  │           ├── ui/SubPartPanel.vue.js
  │           ├── ui/HitBoxPanel.vue.js
  │           └── ui/tag_dialog_helper.js
  ├── ui/menu.js                 (菜单栏 + 导出对话框)
  │     └── utils/file_writer.js (文件写入封装)
  ├── utils/persistence.js       (配置保存/加载)
  │     └── core/config.js       (工厂 + 迁移)
  │           └── core/config_defaults.js (唯一数据源)
  ├── core/element_markers.js    (标记系统)
  └── utils/logger.js            (统一日志)
```

### 导出模式
```js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ... };
}
```

### 日志
- 使用 `createLogger('ModuleName')` 创建模块日志器
- `log.debug()` 在生产构建中被 `DEBUG_ENABLED=false` 守卫短路

### 测试
- 测试文件位于 `test/`，模式 `test/**/*.test.js`
- Mock 层在 `test/mocks/blockbench.js`，模拟 Blockbench 全局对象
- 夹具在 `test/helpers.js`

### 子模块文档
- [src/core/AGENTS.md](./src/core/AGENTS.md) — 数据模型层
- [src/ui/AGENTS.md](./src/ui/AGENTS.md) — 用户界面层
- [src/mode/AGENTS.md](./src/mode/AGENTS.md) — 模式层
