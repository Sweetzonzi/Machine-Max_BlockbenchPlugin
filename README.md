# MachineMax Blockbench 插件 — 项目计划

> 状态：计划阶段 | 最后更新：2026-05-14

## 项目目标

为 Blockbench 开发一个插件，使 UGC 作者能够以**可视化方式一站式制作 MachineMax 内容包**，无需手写 JSON 配置文件。

目标用户群体：缺乏编程/JSON 经验的 Minecraft 模组内容创作者。

## 文档索引

| 文档 | 内容 | 读者 |
|------|------|------|
| [01-总体设计](./docs/01-总体设计.md) | 项目目标、架构、技术选型 | 所有人 |
| [02-可行性分析](./docs/02-可行性分析.md) | Blockbench API 能力边界研究 | 开发者 |
| [03-交互设计](./docs/03-交互设计.md) | UI/UX 详细设计 | 前端/设计 |
| [04-数据模型](./docs/04-数据模型.md) | 配置数据的结构与持久化方案 | 开发者 |
| [05-开发计划](./docs/05-开发计划.md) | 分阶段任务分解 | 开发者/PM |
| [06-技术实现笔记](./docs/06-技术实现笔记.md) | 关键技术点的实现细节 | 开发者 |

## 快速导航

- **想了解整体**：从 [01-总体设计](./docs/01-总体设计.md) 开始
- **想评估可行性**：阅读 [02-可行性分析](./docs/02-可行性分析.md)
- **想开始开发**：阅读 [05-开发计划](./docs/05-开发计划.md)，从阶段一开始
- **想了解 UI 怎么做**：阅读 [03-交互设计](./docs/03-交互设计.md) 和 [06-技术实现笔记](./docs/06-技术实现笔记.md)

## 项目目录结构

```
Machine-Max_BlockbenchPlugin/
├── README.md                    # 本文件
├── docs/                        # 设计文档
│   ├── 01-总体设计.md
│   ├── 02-可行性分析.md
│   ├── 03-交互设计.md
│   ├── 04-数据模型.md
│   ├── 05-开发计划.md
│   └── 06-技术实现笔记.md
├── schemas/                     # MachineMax JSON Schema（从 MachineMax 项目复制，用于校验）
│   ├── part_definition_schema.json
│   ├── part/
│   ├── subsystem/
│   ├── recipe/
│   └── base/
├── src/                         # 插件源代码（开发阶段创建）
│   ├── plugin.js                # 插件入口
│   ├── mode.js                  # 自定义模式注册
│   ├── ui/                      # Vue UI 组件
│   ├── core/                    # 核心业务逻辑
│   └── utils/                   # 工具函数
```

## 参考资源

- Blockbench 源码：`d:\Files\Project_MinecraftMods\blockbench\`
- MachineMax 源码：`d:\Files\Project_MinecraftMods\Machine-Max\`
- MachineMax 内容包教程：`d:\Files\Project_MinecraftMods\Machine-Max\docs\wiki_html\5-内容包制作教程\`
- MachineMax 术语表：`d:\Files\Project_MinecraftMods\Machine-Max\docs\glossary.md`
