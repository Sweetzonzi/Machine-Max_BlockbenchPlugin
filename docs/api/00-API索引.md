# Blockbench 插件开发 API 文档索引

> 本文档基于 Blockbench v5.1.4 源码分析整理
>
> 源码路径: `D:\Files\Project_MinecraftMods\blockbench`

---

## 文档总览

| 文件 | 内容 | 核心类/模块 |
|------|------|-------------|
| [01-插件系统.md](01-插件系统.md) | 插件注册、生命周期、配置、权限管理 | `Plugin`, `Plugins`, `PluginOptions` |
| [02-核心API.md](02-核心API.md) | Blockbench 全局对象，环境检测、UI反馈、CSS注入、文件系统 | `Blockbench`, `isApp`, `Pressing` |
| [03-界面组件.md](03-界面组件.md) | 动作、工具、开关、快捷键、工具栏、菜单、对话框、表单、面板 | `Action`, `Tool`, `Menu`, `Dialog`, `Panel`, `Form` |
| [04-数据模型.md](04-数据模型.md) | 项目、大纲节点、立方体、网格、组、撤销系统 | `ModelProject`, `Group`, `Cube`, `Mesh`, `Undo` |
| [05-纹理系统.md](05-纹理系统.md) | 纹理、纹理图层、纹理组/材质、绘制器 | `Texture`, `TextureLayer`, `TextureGroup`, `Painter` |
| [06-动画系统.md](06-动画系统.md) | 动画、关键帧、动画控制器、时间轴 | `_Animation`, `_Keyframe`, `AnimationController`, `Timeline` |
| [07-I-O与格式.md](07-I-O与格式.md) | 模型格式、编解码器、文件导入导出 | `ModelFormat`, `Codec`, `FormatFeatures` |
| [08-事件系统.md](08-事件系统.md) | 事件机制、完整事件列表（90+事件） | `BlockbenchEventMap`, `EventSystem` |
| [09-工具与辅助.md](09-工具与辅助.md) | Math/Array扩展、条件、合并、验证器、工具函数 | `Condition`, `Merge`, `ValidatorCheck`, `Deletable` |
| [10-桌面端与原生API.md](10-桌面端与原生API.md) | 桌面端功能、原生模块访问、文件系统权限 | `requireNativeModule`, `ScopedFS`, `Clipbench` |
| [11-预览与截图.md](11-预览与截图.md) | 3D预览、预览场景、预览模型、截图与录制 | `Preview`, `PreviewScene`, `Canvas`, `Screencam` |
| [12-Molang与表达式.md](12-Molang与表达式.md) | Molang 表达式系统、自动补全 | `MolangParser`, `MolangAutocomplete` |

---

## 速查表

### 插件开发常用 API

| 用途 | API | 所在文档 |
|------|-----|----------|
| 注册插件 | `Plugin.register(id, options)` | 01-插件系统 |
| 显示消息 | `Blockbench.showQuickMessage(text, time?)` | 02-核心API |
| 显示对话框 | `new Dialog({...}).show()` | 03-界面组件 |
| 新建动作 | `new Action({id, name, click, ...})` | 03-界面组件 |
| 创建 UI 面板 | `new Panel(id, options)` | 03-界面组件 |
| 注入 CSS | `Blockbench.addCSS(css)` | 02-核心API |
| 监听事件 | `Blockbench.on(event, callback)` | 08-事件系统 |
| 注册格式 | `new ModelFormat(id, options)` | 07-I-O与格式 |
| 注册编解码器 | `new Codec(id, options)` | 07-I-O与格式 |
| 创建元素 | `new Cube({...}).init()` | 04-数据模型 |
| 编辑撤销 | `Undo.initEdit(aspects); ... Undo.finishEdit(msg)` | 04-数据模型 |
| 添加验证 | `new ValidatorCheck(id, {run, update_triggers})` | 09-工具与辅助 |

### 全局引用

| 变量 | 类型 | 说明 |
|------|------|------|
| `Project` | `ModelProject` | 当前模型项目 |
| `Format` | `ModelFormat` | 当前模型格式 |
| `Undo` | `UndoSystem` | 撤销系统 |
| `isApp` | `boolean` | 是否桌面应用 |
| `Pressing` | `{shift, ctrl, alt}` | 修饰键状态 |
| `Blockbench` | `BlockbenchAPI` | 全局 API 对象 |

### 常用类速查

| 类名 | 继承关系 | 角色 |
|------|----------|------|
| `Deletable` | 基类 | 可删除对象基类 |
| `OutlinerNode` | 基类 | 大纲树节点基类 |
| `OutlinerElement` | → OutlinerNode | 大纲元素基类 |
| `Group` | → OutlinerNode | 组/骨骼 |
| `Cube` | → OutlinerElement | 立方体 |
| `Mesh` | → OutlinerElement | 网格 |
| `SplineMesh` | → OutlinerElement | 样条网格 |
| `Texture` | - | 纹理 |
| `TextureLayer` | - | 纹理图层 |
| `_Animation` | → AnimationItem | 动画 |
| `_Keyframe` | - | 关键帧 |
| `BarItem` | → EventSystem | 工具栏项基类 |
| `Action` | → BarItem | 可触发动作 |
| `Tool` | → Action | 工具 |
| `Toggle` | → Action | 开关 |
| `Widget` | → BarItem | 控件基类 |
| `Menu` | → Deletable | 上下文菜单 |
| `Dialog` | - | 对话框 |
| `Panel` | → EventSystem | 面板 |
| `Preview` | → Deletable | 3D 视口 |
| `ModelFormat` | - | 模型格式 |
| `Codec` | → Deletable | 文件编解码器 |
| `Plugin` | - | 插件 |
| `ModelProject` | - | 模型项目 |
| `InputForm` | → EventSystem | 表单 |
| `Keybind` | - | 快捷键 |
| `ValidatorCheck` | → Deletable | 验证检查 |
