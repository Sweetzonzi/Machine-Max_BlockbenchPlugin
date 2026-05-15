# 项目术语表

> 生成时间：2026-05-16
> 项目：MachineMax Blockbench 插件（machine-max-bb-plugin）

## 概念列表

---

### Plugin（插件入口）

- **职责**：在 Blockbench 中注册 MachineMax 自定义模式、菜单和持久化 Property，是插件的加载入口
- **描述**：遵循 Blockbench 插件 API 规范，在 `onload` 时完成模式注册、属性面板注册、菜单注册和配置持久化绑定；`onunload` 时清理所有注册的 Action、菜单和原型劫持
- **关键类**：
  - `src/plugin.js` — 插件入口文件，调用 `Plugin.register()` 注册 `machine_max_bb_plugin`

---

### MMProjectConfig（项目配置）

- **职责**：存储 MachineMax 内容包的全部可视化编辑数据，是插件的核心数据模型
- **描述**：一个嵌套的 JavaScript 对象，包含命名空间、零件列表、连接点定义、子系统定义、材料定义、发射物、包元数据及 UI 状态。通过 Blockbench 的 Property 机制嵌入 `.bbmodel` 文件的保存/加载循环，同时以独立 `.mm_project.json` 文件作为备份。支持版本迁移机制
- **关键类**：
  - `src/core/config.js` — 配置创建、默认值填充、版本迁移、活跃零件/变体查询
  - `src/core/config_defaults.js` — 所有子概念的默认值常量定义（`PART_DEFAULTS`, `VARIANT_DEFAULTS`, `SUB_PART_DEFAULTS` 等）
  - `src/utils/persistence.js` — 配置的加载、保存、Property 注册

---

### Part（零件）

- **职责**：MachineMax 载具的一个可组装组件（如车身、机翼、炮塔），是内容包中最顶层的定义单元
- **描述**：每个零件具有全局属性（耐久贡献、伤害传导、功能阈值、最大堆叠等），可包含多个变体。通过零件 ID 唯一标识，最终导出为 `{namespace}/models/{partId}.json`
- **关键类**：
  - `src/core/config_defaults.js` — `PART_DEFAULTS` 定义零件默认属性（`vehicle_durability_rate`, `vehicle_damage_rate`, `functional_threshold`, `share_durability`, `max_stack_size`, `variants` 等）
  - `src/core/config.js` — `createPartConfig()` 创建新的零件配置对象
  - `src/generators/part_generator.js` — `generatePartJSON()` 将内存中的零件配置导出为 MachineMax 格式 JSON

---

### Variant（变体）

- **职责**：同一零件因模型、贴图、动画或标签不同而产生的多个版本
- **描述**：每个变体可指定独立的模型引用（ResourceLocation）、贴图、动画和标签列表。变体内部包含子零件定义。零件必须至少有一个变体
- **关键类**：
  - `src/core/config_defaults.js` — `VARIANT_DEFAULTS`（`model`, `textures`, `animations`, `tags`, `sub_parts`）
  - `src/core/config.js` — `createVariantConfig()` 创建新的变体配置
  - `src/ui/App.vue.js` — Vue 组件中的变体导航下拉框与变体列表管理

---

### SubPart（子零件）

- **职责**：变体内通过 Blockbench 骨骼（Group）定义的一个物理子组件，包含质量、耐久、碰撞箱、连接点等属性
- **描述**：每个子零件映射到 Blockbench 模型中的一个 Group（骨骼），具有物理属性（质量、质心、投影面积、碰撞高度等）和功能子对象（碰撞箱、交互箱、连接点、子系统、流体动力学）。子零件通过元素标记系统中的 `sub_part` 类型与 Group 关联
- **关键类**：
  - `src/core/config_defaults.js` — `SUB_PART_DEFAULTS`（`start_bone`, `end_bones`, `durability`, `mass`, `mass_center`, `hit_boxes`, `connectors`, `subsystems`, `hydrodynamics` 等）
  - `src/core/config.js` — `createSubPartConfig()` 创建新的子零件配置
  - `src/generators/part_generator.js` — `buildSubPartOutput()` 将子零件序列化为导出 JSON

---

### Element Marker（元素标记）

- **职责**：将 Blockbench 中的模型元素（Group 骨骼 / Locator 定位器）关联到 MachineMax 语义类型
- **描述**：在零件定义模式下，用户右键点击 Outliner 中的 Group 或 Locator 元素来打标记。标记按零件+变体维度存储（`config.parts[id].element_markers[variant][uuid]`），不同变体可拥有完全独立的标记映射。标记同时驱动 Outliner 节点图标着色
- **关键类**：
  - `src/core/element_markers.js` — 标记类型枚举 `MARKER_TYPES`、标记的增删查操作（`setMarker`, `clearMarker`, `getMarker`, `getMarkersForVariant`）
  - `src/mode.js` — `buildMMMenuItems()` 构建右键标记菜单，`refreshOutlinerIcons()` 根据标记刷新 Outliner 图标

---

### HitBox（碰撞箱）

- **职责**：定义子零件的物理碰撞体积，用于伤害计算和碰撞检测
- **描述**：通过将 Blockbench 中的 Group 标记为 `hit_box` 类型来定义。每个碰撞箱可附带伤害修正器（Damage Modifier），在不同条件下改变承受的伤害倍率。导出为子零件 JSON 中的 `hit_boxes` 字段
- **关键类**：
  - `src/core/element_markers.js` — `MARKER_TYPES.hit_box`（label: '碰撞箱', icon: 'fa-shield', color: '#D94A4A'）
  - `schemas/part/subpart/hit_box/` — 碰撞箱的 JSON Schema 定义（属性、伤害修正器、条件类型）

---

### Connector（连接点）

- **职责**：定义零件之间如何相互连接的接口，是 MachineMax 零件装配的核心机制
- **描述**：两种形式存在——(1) 通过 Locator 标记的实例连接点，定义在子零件上；(2) 全局连接点静态定义（`connector_defs`），规定连接的类型、方向、完整性、伤害属性及标签过滤规则。连接点使用标签系统（required / accepted / rejected tags）控制兼容性
- **关键类**：
  - `src/core/element_markers.js` — `MARKER_TYPES.connector`（label: '连接点', icon: 'fa-plug', color: '#4AD94A'）
  - `src/core/config_defaults.js` — `CONNECTOR_DEF_DEFAULTS`（`type`, `direction`, `integrity`, `damage_reduction`, `required_tags`, `accepted_tags`, `joints` 等）
  - `src/core/config.js` — `createConnectorDef()` 创建连接点静态定义
  - `src/generators/connector_generator.js` — `generateConnectorJSON()` 导出自定义连接点定义

---

### Subsystem（子系统）

- **职责**：零件内部的功能模块，提供动力、控制、存储、照明等能力
- **描述**：通过 Locator 标记为 `subsystem_locator` 类型来定位，在子零件配置中引用全局子系统静态定义（`subsystem_defs`）。支持 19 种类型：`basic`, `engine`, `motor`, `gearbox`, `wheel_driver`, `seat`, `car_controller`, `motorbike_controller`, `transmission`, `lighting`, `item_storage`, `motor_controller`, `battery`, `joint`, `signal_convert`, `camera`, `javascript`, `turret`, `launcher`。每种类型有其专属字段
- **关键类**：
  - `src/core/element_markers.js` — `MARKER_TYPES.subsystem_locator`（label: '子系统', icon: 'fa-cog', color: '#9B4AD9'）
  - `src/core/config_defaults.js` — `SUBSYSTEM_DEF_DEFAULTS`（`type`, `basic_durability`, `pass_damage`, `limit_damage`, `hidden`, 声音事件等）
  - `src/core/config.js` — `createSubsystemDef()` 创建子系统静态定义
  - `src/generators/subsystem_generator.js` — `generateSubsystemJSON()` 与 `getTypeSpecificFields()` 处理 19 种子系统类型的专属字段序列化

---

### MaterialDef（材料定义）

- **职责**：定义零件的物理材料属性，影响碰撞响应和装甲计算
- **描述**：全局定义，通过 `material_defs` 存储。包含摩擦系数、弹性恢复、密度、装甲厚度/韧性及命中/破坏音效和粒子效果。可供多个零件复用
- **关键类**：
  - `src/core/config_defaults.js` — `MATERIAL_DEF_DEFAULTS`（`friction`, `restitution`, `density`, `armor_thickness`, `armor_toughness`, `hit_sound`, `break_sound`, `particle`）
  - `src/core/config.js` — `createMaterialDef()` 创建新的材料定义
  - `src/generators/material_generator.js` — `generateMaterialJSON()` 导出材料定义

---

### PackMeta（包元数据）

- **职责**：描述 MachineMax 内容包的标识信息和依赖关系，对应 Spark-Core 的 `meta.json`
- **描述**：包含包 ID（ResourceLocation 格式）、版本号（SemVer）、显示名称、作者、描述、依赖列表及自动打包开关。在导出时写入内容包根目录的 `meta.json`。名称/作者/描述输出为 Minecraft Component 格式
- **关键类**：
  - `src/core/config.js` — `createPackMeta()` 从配置生成 Spark-Core 兼容的包元数据对象
  - `src/ui/menu.js` — `_showPackSettingsDialog()` 提供内容包设置的 GUI 对话框
  - `src/generators/meta_generator.js` — `generateMeta()` 调用 `createPackMeta()` 生成导出用的 meta 数据

---

### Content Pack Export（内容包导出）

- **职责**：将 Blockbench 中可视化编辑的所有 MachineMax 定义导出为 Spark-Core pack 系统规范的目录结构
- **描述**：导出流程由菜单中的"导出内容包"触发，执行前运行校验（检查零件、变体、子零件、碰撞箱、质量的完整性），然后依次写入 `meta.json`、`{namespace}/lang/{locale}.json`、`{namespace}/models/{partId}.json`、连接点/子系统/材料定义及配方文件。支持通过对话框覆盖包元数据
- **关键类**：
  - `src/ui/menu.js` — `_showExportDialog()` 显示导出对话框，`_executeExport()` 执行实际导出流程
  - `src/mode.js` — `runValidation()` 导出前的基础校验逻辑
  - `src/generators/` — 各生成器模块（`meta_generator.js`, `part_generator.js`, `lang_generator.js`, `connector_generator.js`, `subsystem_generator.js`, `material_generator.js`）

---

### Persistence（持久化）

- **职责**：将 MMProjectConfig 保存到 .bbmodel 文件并支持独立备份文件
- **描述**：通过 Blockbench 的 Property API 在 `ModelProject` 上注册 `machine_max_plugin` 属性，使其自动参与 Ctrl+S 保存循环。同时写入独立的 `.mm_project.json` 备份文件以防数据丢失。加载时优先从 Property 读取，备选方案读取独立 `.mm_project.json` 文件
- **关键类**：
  - `src/utils/persistence.js` — `registerProperty()` 注册 Property，`loadConfig()` 加载/迁移配置，`saveConfig()` 保存配置，`getConfig()` 获取当前配置

---

### Part Definition Mode（零件定义模式）

- **职责**：Blockbench 中的自定义编辑模式，在此模式下用户以可视化方式定义 MachineMax 载具零件
- **描述**：通过 `Mode` API 注册为 `machine_max_part` 模式。进入时（`onSelect`）加载配置、确保 Outliner 面板可见、劫持 Group/OutlinerElement/OutlinerNode 的右键菜单以注入 MachineMax 标记功能、劫持 OutlinerElement.prototype.select 实现点击 Cube 自动选择父级 Group。退出时（`onUnselect`）恢复所有原型劫持并保存配置
- **关键类**：
  - `src/mode.js` — `registerMode()` 注册模式、`patchShowContextMenu()` 右键菜单劫持、`patchElementSelect()` 选择重定向劫持、`registerToolbarActions()` 工具栏按钮注册

---

### Build（构建系统）

- **职责**：使用 esbuild 将 `src/` 目录下分散的模块打包为单文件，供 Blockbench 插件系统加载
- **描述**：Blockbench 插件仅支持单文件或 URL 加载，因此需要打包。构建脚本将多个 CommonJS 模块打包为 IIFE（立即执行函数表达式），内部 `require('./xxx')` 由 esbuild 解析合并，Node.js 内置模块（`fs`, `path`）标记为 external 由 Blockbench 的 `scoped_require` 提供。CSS 样式在构建时读取并作为字符串字面量注入 JS。支持 `--watch` 监听模式
- **关键类**：
  - `scripts/build.js` — esbuild 构建脚本，`entryPoints: [src/plugin.js]`，`format: 'iife'`，`external: ['fs', 'path']`

---

### Schemas（JSON 模板/Schema）

- **职责**：定义 MachineMax 内容包各组件的数据结构规范，作为手写 JSON 的参考模板和校验标准
- **描述**：在 `schemas/` 目录下以 JSON Schema 格式定义了基础类型（向量、资源位置、材质属性、声音事件、操作）和业务组件（零件定义、子零件属性、碰撞箱、连接点、流体动力学、子系统静态/动态属性、配方）。是插件生成的数据结构和 Minecraft Mod 端格式之间的契约
- **关键类**：
  - `schemas/part_definition_schema.json` — 零件定义的顶层 Schema
  - `schemas/base/` — 基础类型 Schema（`axis`, `material_attr`, `operation`, `resource_location`, `sound_event`, `vector_3d`）
  - `schemas/part/subpart/` — 子零件相关 Schema（`sub_part_attr`, `connector_attr`, `hit_box_attr`, `interact_box_attr`, `hydrodynamic_attr`）
  - `schemas/subsystem/` — 子系统 Schema（`subsystem_static_attr`, `subsystem_dynamic_attr` 及各类型专属属性）
  - `schemas/recipe/` — 配方 Schema（`blueprint_research_recipe`, `fabricating_recipe`, `research_recipe`）

---

### Logger（日志系统）

- **职责**：为插件所有模块提供统一的 Debug / Info / Warn / Error 四级日志输出
- **描述**：日志格式为 `[MM][模块名][级别] 消息`。Debug 日志通过 `DEBUG_ENABLED` 开关控制，Error 日志自动输出调用栈。通过 `createLogger(moduleName)` 创建带固定模块名的日志代理，避免每次调用都传递模块名
- **关键类**：
  - `src/utils/logger.js` — `createLogger()` 创建模块日志代理，`debug()`, `info()`, `warn()`, `error()` 四级日志函数

---

### Notify（通知系统）

- **职责**：封装 Blockbench 的 Toast 通知 API，为插件提供简洁的通知接口
- **描述**：将 Blockbench 原生的 `showToastNotification(options)` 封装为 `showToast(text, type, expire)` 简化形式，支持 `positive`, `error`, `warning`, `info` 四种类型的着色通知
- **关键类**：
  - `src/utils/notify.js` — `showToast()` 显示 Toast 通知，`TOAST_COLORS` 类型到颜色映射
