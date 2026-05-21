# AGENTS.md — MachineMax Blockbench 插件

## 全局约定

### 技术栈
- **语言**: ES6+ JavaScript（无 TypeScript）
- **模块系统**: CommonJS（`require` / `module.exports`）
- **构建工具**: esbuild（`scripts/build.js`），打包为 IIFE
- **测试框架**: bun test（`test/` 目录）
- **UI 框架**: Vue 2（Blockbench 内嵌）

### 导入图

```
plugin.js                      # 插件入口（52行）
  ├── utils/logger.js           # 统一日志
  ├── utils/persistence.js      # 配置保存/加载（Project Property）
  │     ├── core/config.js      # 工厂函数 + 版本迁移引擎（273行）
  │     │     └── core/config_defaults.js  # 默认值 + 预设（410行，纯数据）
  │     └── core/content_pack.js  # 内容包目录 I/O（548行）
  │           └── utils/file_writer.js  # 文件写入封装
  ├── utils/notify.js            # 用户通知（Toast）
  ├── mode.js                    # 模式生命周期 + 注册（341行）
  │     ├── core/element_markers.js  # 标记类型系统（301行）
  │     ├── core/content_pack.js
  │     ├── utils/persistence.js
  │     ├── utils/notify.js
  │     ├── mode/icons.js        # Outliner 图标刷新（82行）
  │     ├── mode/patches.js      # 原型猴子补丁 + 右键菜单（623行）
  │     ├── mode/validation.js   # 配置校验（48行）
  │     ├── mode/toolbar.js      # 工具栏 Action 注册（185行）
  │     └── ui/App.vue.js        # Vue 属性面板（懒加载，1465行）
  │           ├── ui/SubPartPanel.vue.js
  │           ├── ui/HitBoxPanel.vue.js
  │           ├── ui/SignalFlowPanel.vue.js  # 信号流图面板（579行）
  │           │     └── lib/signal_graph.js  # 信号拓扑图数据模型（445行）
  │           ├── ui/tag_dialog_helper.js
  │           └── ui/dialogs/    # 对话框子组件
  │                 ├── pack_setup_dialog.js    (805行)
  │                 ├── subsystem_dialog.js     (600行)
  │                 └── connector_dialog.js     (506行)
  └── ui/menu.js                 # BarMenu + 导出管线（868行）
        ├── utils/persistence.js
        ├── utils/file_writer.js
        ├── core/content_pack.js
        ├── mode.js (runValidation)
        ├── generators/          # 导出格式生成器
        │     ├── part_generator.js (48行)
        │     ├── subsystem_generator.js (56行)
        │     ├── connector_generator.js (57行)
        │     ├── material_generator.js (44行)
        │     ├── lang_generator.js (47行)
        │     └── meta_generator.js (58行)
        ├── managers/            # 内容包 CRUD 管理器
        │     ├── subsystem_manager.js (287行)
        │     ├── connector_manager.js (202行)
        │     └── material_manager.js (183行)
        └── codec/               # 序列化/反序列化框架
              ├── Codec.js       # 核心组合子库（567行）
              ├── codecs/        # 类型级 Codec 定义（8个）
              └── index.js
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
- [src/codec/AGENTS.md](./src/codec/AGENTS.md) — 序列化/反序列化层
