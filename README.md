# MachineMax Blockbench 插件

为 [Blockbench](https://www.blockbench.net/) 开发的插件，使内容创作者能够以**可视化方式一站式制作 MachineMax 内容包**，无需手写 JSON 配置文件。

目标用户群体：缺乏编程/JSON 经验的 Minecraft 模组内容创作者。

## 功能

- **零件定义模式**：Blockbench 中的自定义编辑模式，用于创建和管理 MachineMax 零件定义
- **可视化标记**：在 Outliner 中通过右键菜单标记骨骼为子零件、碰撞箱、交互区、连接点
- **属性面板**：选中元素后右侧面板显示对应属性，支持：
  - 子零件物理属性（质量、耐久、质心、空气阻力等）
  - 碰撞箱定义与材质覆写
  - 交互区配置（骨骼绑定、信号频道）
  - 连接点配置（定义选择、信号目标）
  - 20 种子系统类型的动态字段表单
- **信号流图**：可视化展示子系统间的信号连接关系
- **内容包导出**：一键导出为完整的 MachineMax 内容包目录结构
- **内置官方包**：插件自带官方内容包定义（15 种材料、83 个连接器定义、84 个子系统型号），可直接引用
- **序列化/反序列化**：Codec 组合子库确保配置数据的正确读写

## 快速开始

1. 在 Blockbench 中打开或创建一个 `.bbmodel` 模型文件
2. 点击 **工具 → 插件**，加载 `dist/machine_max_bb_plugin.js`
3. 出现 MachineMax 工具栏后，点击 **零件定义** 按钮进入编辑模式
4. 首次使用会弹出内容包设置向导，配置内容包路径
5. 在 Outliner 中右键元素进行标记，右侧属性面板会自动响应
6. 完成后通过菜单导出内容包

## 构建

```bash
npm install
npm run build        # 构建到 dist/machine_max_bb_plugin.js
npm run watch        # 开发模式，监听文件变更自动构建
```

构建产物为单文件 IIFE，可直接拖入 Blockbench 加载。

## 项目结构

```
Machine-Max_BlockbenchPlugin/
├── README.md
├── AGENTS.md                     # AI 辅助开发指南
├── scripts/build.js              # esbuild 构建脚本
├── package.json
├── dist/
│   └── machine_max_bb_plugin.js  # 构建产物（单文件插件）
├── src/
│   ├── plugin.js                 # 插件入口
│   ├── mode.js                   # 自定义模式注册 + 生命周期
│   ├── core/                     # 核心业务逻辑
│   │   ├── config.js             # 配置工厂 + 版本迁移
│   │   ├── config_defaults.js    # 默认值 + 预设
│   │   ├── element_markers.js    # 标记类型系统
│   │   ├── content_pack.js       # 内容包目录 I/O
│   │   ├── content_pack_manager.js # 内容包定义管理
│   │   ├── naming.js             # 唯一性校验
│   │   ├── subsystem_types.js    # 子系统类型注册表
│   │   ├── constants.js          # 常量
│   │   ├── zip_reader.js         # ZIP 读取
│   │   └── builtin_pack.js       # 内置包加载
│   ├── mode/                     # 模式层
│   │   ├── icons.js              # Outliner 图标
│   │   ├── patches.js            # 原型补丁 + 右键菜单
│   │   ├── validation.js         # 配置校验
│   │   └── toolbar.js            # 工具栏 Action
│   ├── ui/                       # Vue 2 属性面板
│   │   ├── App.vue.js            # 主面板组件
│   │   ├── SubPartPanel.vue.js   # 子零件面板
│   │   ├── HitBoxPanel.vue.js    # 碰撞箱面板
│   │   ├── InteractBoxPanel.vue.js # 交互区面板
│   │   ├── ConnectorPanel.vue.js # 连接点面板
│   │   ├── SubsystemPanel.vue.js # 子系统面板
│   │   ├── SignalFlowPanel.vue.js # 信号流图
│   │   ├── menu.js               # BarMenu + 导出管线
│   │   ├── tag_dialog_helper.js  # 标签对话框
│   │   ├── dialogs/              # 编辑对话框
│   │   ├── panels/               # HTML 模板
│   │   └── components/           # 通用 Vue 组件
│   ├── codec/                    # 序列化/反序列化
│   │   ├── Codec.js              # 组合子库
│   │   └── codecs/               # 类型级 Codec 定义
│   ├── managers/                 # 内容包 CRUD 管理器
│   ├── generators/               # 导出格式生成器
│   ├── lib/                      # 信号拓扑图模型
│   ├── styles/                   # CSS 样式
│   ├── utils/                    # 工具函数
│   └── builtin/                  # 内置官方内容包
├── docs/                         # 设计文档
│   ├── 01-总体设计.md
│   ├── 02-可行性分析.md
│   ├── 03-交互设计.md
│   ├── 04-数据模型.md
│   ├── 05-开发计划.md
│   ├── 06-技术实现笔记.md
│   ├── 07-下一阶段-连接点子系统信号.md
│   ├── 08-序列化反序列化-Codec体系重构.md
│   └── glossary.md               # 术语表
└── schemas/                      # JSON Schema 定义
```

## 技术栈

| 层面 | 技术 |
|------|------|
| 语言 | ES6+ JavaScript |
| 模块 | CommonJS（`require` / `module.exports`） |
| 构建 | esbuild（IIFE 单文件打包） |
| UI | Vue 2（Blockbench 内嵌） |
| 测试 | bun test（`test/` 目录） |

## 相关项目

- [MachineMax](https://github.com/sweetzonzi/Machine-Max) — Minecraft NeoForge 载具模组
- [Blockbench](https://github.com/JannisX11/blockbench) — 开源 3D 模型编辑器
