# 08 — 序列化/反序列化 Codec 体系重构

> 最后更新：2026-05-19（评估反馈修订：新增 ProjectCodec 层、BaseSubsystemCodec、transient 字段自动剥离、Either wrapKey 参数化、dispatch type 剥离协议、迁移宽松模式、风险表扩充）
> 本文档为序列化/反序列化体系的全面重构设计，以 Java 端 RecordCodecBuilder 模式为蓝本，构建声明式、双向一致的 Codec 体系。

---

## 1. 动机

### 1.1 当前问题

| 问题 | 具体表现 |
|------|---------|
| **字段默认值双重定义** | `config_defaults.js` 定义一次默认值，`part_generator.js` 以字面量形式再重复一次 |
| **导出过滤硬编码** | `buildSubPartOutput()` 中 8 个 `!== 默认值` 判断与默认值定义源分离 |
| **导入填充简单粗暴** | `config.js` 仅做 `Object.assign` 浅合并，不递归、不考虑嵌套子对象默认值 |
| **子系统字段过滤独立维护** | `subsystem_types.js` 的 `getDynamicFieldNames()` 与子系统面板、创建对话框、导出器多处耦合 |
| **连接点字段过滤散落** | `_cleanConnectors()` 逐个 truthy 检查，无法复用 |
| **无法拖拽导入** | 没有统一的 decode 入口，拖入 part JSON 文件后无法自动回填到配置 |
| **不可测试** | 所有序列化逻辑依赖 Blockbench 全局对象，无法独立单元测试 |

### 1.2 目标

以 Java 端 `RecordCodecBuilder` 模式为蓝本，构建声明式 Codec 体系：

- **单数据源**：每个数据模型只需定义一次字段名、类型、默认值
- **双向一致**：序列化（encode）和反序列化（decode）由同一份定义驱动
- **默认值自动跳过**：`optionalFieldOf(name, defaultVal)` 语义 —— 等于默认值不输出，缺失时自动填充
- **嵌套 + 判别器 + 简写**：支持 `MAP_CODEC`、`dispatch`、`Either`
- **可测试**：纯函数，bun test 直接跑
- **服务拖拽导入**：统一的 decode 入口使拖入 part JSON 文件自动回填配置成为可能

---

## 2. Java 端 Codec 设计哲学提炼

分析 `PartType`、`SubPartAttr`、`VariantAttr`、`ConnectorAttr`、`AbstractSubsystemAttr` 及其 18 个子类型后，提炼 5 种核心模式：

### 2.1 记录 Codec

```java
// SubPartAttr.java:73-89
public static final Codec<SubPartAttr> CODEC = RecordCodecBuilder.create(instance -> instance.group(
    Codec.STRING.optionalFieldOf("start_bone", "").forGetter(SubPartAttr::getStartBone),
    Codec.FLOAT.optionalFieldOf("durability", 20f).forGetter(SubPartAttr::getDurability),
    // ...
).apply(instance, SubPartAttr::new));
```

→ JS 对应：`Codec.record({ start_bone: Codec.STRING.default(''), ... })`

### 2.2 可选字段 + 默认值

```java
Codec.FLOAT.optionalFieldOf("mass", 25f)
```

`optionalFieldOf` 的含义：
- **decode**：JSON 中缺失时填充默认值 `25f`
- **encode**：值等于默认值时**不输出**（由 Mojang JSON 序列化器自动处理）

### 2.3 映射 Codec

```java
public static final Codec<Map<String, SubPartAttr>> MAP_CODEC = Codec.unboundedMap(
    Codec.STRING, SubPartAttr.CODEC
);
```

→ JS 对应：`Codec.map(Codec.STRING, SubPartCodec)`

### 2.4 判别器 Codec（dispatch）

```java
// AbstractSubsystemAttr.java:37-41
public static final Codec<AbstractSubsystemAttr> CODEC = MMDataRegistries
    .getSUBSYSTEM_ATTR_CODEC().byNameCodec()
    .dispatch(AbstractSubsystemAttr::codec, Function.identity());
```

18 种子系统类型按 `type` 字段分派到不同子 Codec。每个子类型只定义自己的特有字段。

→ JS 对应：`Codec.dispatch('type', { 'machine_max:engine': EngineCodec, ... })`

### 2.5 二选一简写（Either）

```java
// PartType.java:33-48
public static final Codec<Map<String, VariantAttr>> VARIANT_MAP_CODEC = Codec.either(
    VariantAttr.CODEC,                          // 单个变体简写
    Codec.unboundedMap(Codec.STRING, VariantAttr.CODEC)  // 多个变体完整格式
).xmap(
    either -> either.map(v -> Map.of("default", v), map -> map),
    map -> map.size()==1 && map.containsKey("default") ? Either.left(...) : Either.right(...)
);
```

→ JS 对应：`Codec.either(SingleCodec, MapCodec)`，自动检测单 `default` key 做简写/展开

---

## 3. 新增模块：`src/codec/`

```
src/codec/
├── Codec.js              # 核心类型定义 + 组合子库
├── codecs/               # 各数据模型的 Codec 定义
│   ├── project_codec.js      # 项目级配置（$schema_version / modelFile / contentPackPath / dependencyPaths / _uiState / parts）
│   ├── part_codec.js         # PartType 级别（顶级字段 + variants）
│   ├── variant_codec.js      # VariantAttr 级别（model/textures/animations/tags + sub_parts）
│   ├── sub_part_codec.js     # SubPartAttr 级别（物理、碰撞、连接点、子系统、流体动力）
│   ├── connector_codec.js    # ConnectorAttr 级别（locator/definition/signal/power/overwrite）
│   ├── subsystem_codec.js    # AbstractSubsystemAttr 级别（dispatch × 18 种 + BaseSubsystemCodec）
│   ├── hit_box_codec.js      # HitBoxAttr 级别（shape/material/thickness/condition/overwrite）
│   ├── interact_box_codec.js # InteractBoxAttr 级别（bone/mode/condition/signal_targets）
│   └── hydrodynamic_codec.js # HydrodynamicAttr 级别
└── codec.test.js         # 单元测试（bun test）
```

---

## 4. 核心 Codec 系统设计

### 4.1 基础类型原语

```javascript
Codec.STRING                // 字符串
Codec.INT                   // 整数（小数输入 → 拒绝或四舍五入，按严格模式决定）
Codec.FLOAT                 // 浮点数
Codec.BOOL                  // 布尔值
Codec.ENUM(values)          // 枚举，如 Codec.ENUM(['true', 'false', 'ground'])
```

每个基础 codec 实现 `encode(value) → any` 和 `decode(raw) → any` 两个函数。

### 4.2 组合子

| 组合子 | 签名 | Java 对应 | 说明 |
|--------|------|-----------|------|
| `list()` | `codec.list(len?)` | `Codec.STRING.listOf()` | 数组，可选固定长度校验 |
| `map()` | `codec.map(keyCodec, valCodec)` | `Codec.unboundedMap(K, V)` | 键值映射 |
| `record()` | `Codec.record(schema)` | `RecordCodecBuilder` | 对象/记录 |
| `either()` | `Codec.either(a, b)` | `Codec.either(A, B).xmap(...)` | 二选一 |
| `dispatch()` | `Codec.dispatch(key, map)` | `byNameCodec().dispatch(...)` | 判别器 |

### 4.3 字段规格（record 内部用）

```javascript
// 必填字段 —— 对应 Java fieldOf
Codec.STRING.field()
Codec.FLOAT.field()

// 可选字段 + 默认值 —— 对应 Java optionalFieldOf
Codec.STRING.default('')
Codec.FLOAT.default(25.0)
Codec.BOOL.default(false)
Codec.STRING.list().default([])
Codec.map(Codec.STRING, SomeCodec).default({})

// 可选字段 + null 默认值 —— 对应 Java optionalFieldOf + Optional
Codec.STRING.nullable()
```

### 4.4 encode/decode 行为规范

**encode**（序列化）：
1. 递归遍历 schema 定义
2. 必填字段（`.field()`）始终输出
3. 可选字段（`.default(val)`）：当前值 `===` 默认值时跳过（不输出到 JSON 中）
4. 可选字段（`.nullable()`）：值为 `null` 时跳过
5. **schema 未定义的字段**：默认不输出到 JSON（自动剥离 `_uuid`、`auto_end_bones` 等运行时瞬态字段，无需手写 `delete` 逻辑）
6. 嵌套 `map()`：递归对每个 value 执行 encode
7. `dispatch()`：**负责剥离 discriminator key**（如 `type`）后再委托子 codec 的 encode，确保子 codec 不会因多余字段报错；encode 输出中先写入 discriminator key 再合并子 codec 的输出
8. `either()`：检测只有一个 `wrapKey` 对应的 key 时输出简写形式，否则输出完整 map
9. 结果为空对象 `{}` 时返回 `undefined`（由父级决定是否跳过）

**decode**（反序列化）：
1. 递归从 schema 定义读取
2. 必填字段缺失 → 报错（严格模式）或填充类型零值（宽松模式）
3. 可选字段缺失 → 自动填充默认值
4. 类型不匹配 → 报错或尝试转换
5. 未知多余字段 → 宽松模式保留，严格模式报错
   - **注意**：encode 时跳过 schema 未定义字段，但 decode 不反其道 —— decode 的宽松模式保留多余字段可容错旧版/手写 JSON
6. `dispatch()`：**读取 discriminator key 值**路由到对应子 codec，子 codec decode 时 discriminator key 仍存在于数据中（子 codec 的宽松模式下不会报错）；decode 后 discriminator key 会被 dispatch codec 保留在输出对象中
7. `either()`：检测是单对象还是 map，自动展开/包装

### 4.5 使用示例：SubPart Codec

对应 Java `SubPartAttr.CODEC`：

```javascript
const SubPartCodec = Codec.record({
    // 骨骼范围
    start_bone:         Codec.STRING.default(''),
    end_bones:          Codec.STRING.list().default([]),
    // 物理属性
    durability:         Codec.FLOAT.default(20.0),
    mass:               Codec.FLOAT.default(25.0),
    mass_center:        Codec.STRING.default('mass_center'),
    projected_area:     Codec.FLOAT.list(3).default([0, 0, 0]),
    block_collision:    Codec.ENUM(['true', 'false', 'ground']).default('true'),
    collision_height:   Codec.FLOAT.default(-1.0),
    climb_assist:       Codec.BOOL.default(false),
    hydro_priority:     Codec.INT.default(0),
    // 子对象映射
    hit_boxes:          Codec.map(Codec.STRING, HitBoxCodec).default({}),
    interact_boxes:     Codec.map(Codec.STRING, InteractBoxCodec).default({}),
    connectors:         Codec.map(Codec.STRING, ConnectorCodec).default({}),
    subsystems:         Codec.map(Codec.STRING, SubsystemDispatchCodec).default({}),
    // hydrodynamics：内存中使用 null 表示"未配置"，对应 Java optionalFieldOf(..., Map.of("", DEFAULT))
    // encode 时 null → 跳过不输出；decode 时缺失 → 填充 null
    hydrodynamics:      Codec.map(Codec.STRING, HydroCodec).nullable(),
});

// 注意：以下字段不在 schema 中，encode 时自动跳过：
//   auto_end_bones  — 编辑器运行时计算字段，用于自动末端骨骼检测，不输出到 JSON
//   _uuid           — InteractBox 等子对象的内部运行时字段，不输出到 JSON
```

**encode 行为示例**：

```javascript
// 输入（全默认值的 SubPart）
SubPartCodec.encode({
    start_bone: '',
    durability: 20.0,
    mass: 25.0,
    hit_boxes: {},
    hydrodynamics: null,
    auto_end_bones: ['wheel_rl', 'wheel_rr'],  // 瞬态字段 → 自动跳过
    // ... 全是默认值
});
// → undefined（完全由默认值组成，不输出任何内容）

// 输入（有非默认值）
SubPartCodec.encode({
    start_bone: 'chassis',
    durability: 20.0,     // 默认值 → 跳过
    mass: 120.0,
    auto_end_bones: ['wheel_rl'],  // 瞬态字段 → 自动跳过
    hit_boxes: { main: { ... } },
    // ...
});
// → { start_bone: 'chassis', mass: 120.0, hit_boxes: { main: { ... } } }
// durability、auto_end_bones 被跳过！
```

### 4.6 判别器示例：子系统 Dispatch

```javascript
const SubsystemDispatchCodec = Codec.dispatch('type', {
    'machine_max:engine':             EngineCodec,
    'machine_max:motor':              MotorCodec,
    'machine_max:gearbox':            GearboxCodec,
    'machine_max:transmission':       TransmissionCodec,
    'machine_max:battery':            BatteryCodec,
    'machine_max:motor_controller':   MotorControllerCodec,
    'machine_max:car_controller':     CarControllerCodec,
    'machine_max:motorbike_controller': MotorbikeCodec,
    'machine_max:signal_convert':     SignalConvertCodec,
    'machine_max:wheel_driver':       WheelDriverCodec,
    'machine_max:seat':               SeatCodec,
    'machine_max:lighting':           LightingCodec,
    'machine_max:item_storage':       ItemStorageCodec,
    'machine_max:basic':              BasicCodec,
    'machine_max:joint':              JointDriverCodec,
    'machine_max:camera':             CameraCodec,
    'machine_max:javascript':         JavascriptCodec,
    'machine_max:turret':             TurretDriverCodec,
    'machine_max:fire_controller':    FireControlCodec,
    'machine_max:launcher':           LauncherCodec,
});
```

**公共基础字段**：经过验证，Java 端所有 18 种子系统 Attr 的 CODEC 都以 `ResourceLocation.CODEC.fieldOf("definition")` 开头。因此提取一个公共 `BaseSubsystemCodec` 来避免重复：

```javascript
// 所有 18 种子系统共有的 definition 字段
const BaseSubsystemCodec = Codec.record({
    definition: Codec.STRING.field(),
});
```

每种子系统 Codec 可以在 BaseSubsystemCodec 基础上追加自己的特有字段。前端可以直接使用 `BaseSubsystemCodec` 的 schema 来获取公共字段列表，与 `subsystem_types.js` 中的 `dynamicFields` 互补。

**dispatch 的 type 剥离协议**（与 Java `dispatch` 行为一致）：

- **encode** 时：dispatch codec 从数据中取出 `type` 值做路由匹配，**将 `type` 字段从传给子 codec 的数据中剥离**后调用子 codec.encode()。输出时，先写 `{ type: 'machine_max:engine' }`，再浅合并子 codec 的输出。这样 EngineCodec 的 record schema 不需要定义 `type` 字段。
- **decode** 时：dispatch codec 从原始数据中读取 `type`，路由到对应子 codec 进行 decode。`type` 字段保留在传给子 codec 的数据中（子 codec 的宽松模式会忽略多余的 `type`）。decode 输出的对象中包含 `type` 字段。

**每种子系统 Codec 只定义自己的特有字段**（不包含 `definition` 和 `type`，它们由 BaseSubsystemCodec 和 dispatch 处理）：

```javascript
// EngineCodec（与 Java EngineSubsystemAttr.CODEC 对应）
const EngineCodec = Codec.record({
    power_output:   Codec.STRING.field(),
    speed_outputs:  Codec.STRING.list().map().default({ engine_speed: ['subpart', 'vehicle'] }),
});

// WheelDriverCodec
const WheelDriverCodec = Codec.record({
    connector:             Codec.STRING.field(),
    roll_speed_outputs:    Codec.STRING.list().map().default({}),
    steering_angle_outputs: Codec.STRING.list().map().default({}),
});
```

### 4.7 Either 简写

```javascript
// VariantCodec 内部：变体 map 的简写
// encode: 只有一个 "default" key → 输出单个 VariantAttr 对象
// decode: 收到单个 VariantAttr 对象 → 包装为 { default: decodedVariant }
const VariantMapCodec = Codec.either(
    VariantCodec,                                    // 简写形式（单个变体）
    Codec.map(Codec.STRING, VariantCodec),           // 完整形式（多个变体）
    { wrapKey: 'default' }                           // 简写时默认的包装 key
);

// VariantCodec 内部：子零件 map 的简写
// encode: 只有一个 "sub_part.machine_max.main" key → 输出单个 SubPartAttr 对象
// decode: 收到单个 SubPartAttr 对象 → 包装为 { "sub_part.machine_max.main": ... }
const SubPartMapCodec = Codec.either(
    SubPartCodec,
    Codec.map(Codec.STRING, SubPartCodec),
    { wrapKey: 'sub_part.machine_max.main' }         // 与 variants 的 'default' 不同！
);
```

**Either 的参数化说明**：

| 参数 | 说明 |
|------|------|
| `a` (第 1 参数) | 简写形式 codec（当 map 中只有一个 key 时使用） |
| `b` (第 2 参数) | 完整形式 codec（当 map 中有多个 key 时使用） |
| `wrapKey` (第 3 参数) | encode 时用于判断是否简写的 key 名；decode 时用于包装单个对象的 key 名 |

**行为**：
- **encode**：检查 map 是否只有 `wrapKey` 这一个 key，且其值能被 `a` 的 encode 正常处理 → 输出简写；否则输出完整 map
- **decode**：检测是对象（有 `wrapKey` 作为 key → 完整 map）还是对象（不含 `wrapKey` → 简写，自动包装为 `{ [wrapKey]: decoded }`）

这保证了同一套逻辑可以安全地用于 `variants`（wrapKey='default'）和 `sub_parts`（wrapKey='sub_part.machine_max.main'）等多种场景。

---

## 5. 拖拽 JSON 导入

### 5.1 需求

用户从文件管理器拖入 `parts/*.json` 文件到 Blockbench 窗口，插件自动：

1. 解析 JSON 内容
2. 识别是哪个层级的定义（Part → Variant → SubPart → Connector/Subsystem）
3. 调用对应 codec 的 `decode()` 填充默认值、规范化格式
4. 将解码后的数据合并到当前编辑的配置中
5. 刷新 UI 面板显示

### 5.2 技术路径

Codec 体系使得拖拽导入的实现变得简单：

```
拖入 JSON 文件
    │
    ▼
1. 文件类型检测（路径含 '/parts/' / '/connectors/' / '/subsystems/'）
    │
    ▼
2. JSON.parse(rawContent)
    │
    ├── 是 Part JSON  → PartCodec.decode(json)
    │      └── 合并到 config.parts[partId]
    │
    ├── 是 Connector JSON → ConnectorCodec.decode(json)
    │      └── 合并到 part.variants[v].sub_parts[sp].connectors[connId]
    │
    └── 是 Subsystem JSON → SubsystemDispatchCodec.decode(json)
           └── 合并到 part.variants[v].sub_parts[sp].subsystems[subId]
    │
    ▼
3. saveConfig() → Blockbench Property + .mm_project.json
4. Vue 面板通过响应式自动刷新
```

**拖入时需要 codec 的关键行为**：

| 场景 | codec 行为 |
|------|-----------|
| 导入的 JSON 缺少可选字段 | `decode()` 自动填充默认值，确保合并后结构完整 |
| 导入的 JSON 有多余字段 | 宽松模式保留（可提示用户含未知字段） |
| 导入子系统时 `type` 未知 | dispatch codec 报错："Unknown subsystem type: xxx" |
| 导入的是旧版本 JSON | 版本迁移在 decode 前完成 |

### 5.3 Blockbench 拖拽事件接入点

Blockbench 有全局 `dragAndDrop` 事件系统。拖入文件后可通过 `Blockbench.on('read_image', ...)` 或类似钩子拦截。拖入 `.json` 文件的具体拦截方式待验证（参见 `06-技术实现笔记 V7`）。

---

## 6. 对现有文件的改动映射

### 6.1 新增文件

| 文件 | 说明 |
|------|------|
| `src/codec/Codec.js` | 核心组合子库（~180 行） |
| `src/codec/codecs/project_codec.js` | **项目级 Codec**：$schema_version / modelFile / contentPackPath / dependencyPaths / _uiState / packMeta / namespace / parts（parts 内部使用 PartCodec） |
| `src/codec/codecs/part_codec.js` | Part 顶级字段 + VariantMap(Either) |
| `src/codec/codecs/variant_codec.js` | Variant 字段 + SubPartMap(Either) |
| `src/codec/codecs/sub_part_codec.js` | SubPart 全字段（物理/碰撞/连接点/子系统/流体），不包含 `auto_end_bones`（瞬态字段） |
| `src/codec/codecs/connector_codec.js` | ConnectorAttr + Overwrite |
| `src/codec/codecs/subsystem_codec.js` | BaseSubsystemCodec + Dispatch × 18 种子系统 Codec |
| `src/codec/codecs/hit_box_codec.js` | HitBoxAttr + Overwrite |
| `src/codec/codecs/interact_box_codec.js` | InteractBoxAttr，schema 不含 `_uuid`（瞬态字段，encode 自动剥离） |
| `src/codec/codecs/hydrodynamic_codec.js` | HydrodynamicAttr |
| `test/codec.test.js` | 单元测试 |

### 6.2 修改文件

| 文件 | 变化 | 程度 |
|------|------|:----:|
| `src/generators/part_generator.js` | **大幅简化**：删除 `buildSubPartOutput()`、`_cleanConnectors()`、`_cleanSubsystems()`、`_buildVariantOutput()` 等 ~130 行手写过滤 → 改为 `PartCodec.encode(partConfig)`；`_resolveUUIDKeys()` 独立保留（Blueprint 运行时解析，非 Codec 职责） | 重写 |
| `src/core/config.js` | **简化**：`createBlankConfig()` → `ProjectCodec.decode({})`；`create*Config()` 系列改为各 codec.decode({})；`ensureDefaults()` → `ProjectCodec.decode(config, { mode: 'relaxed' })`（递归填充所有层级的默认值，包括 parts 内的嵌套子对象） | 简化 |
| `src/utils/persistence.js` | **轻度修改**：`loadConfig()` 中 `migrateIfNeeded()` 返回后调用 `ProjectCodec.decode(config, { mode: 'relaxed' })` 填充默认值；`saveConfig()` 的独立备份字段列表对齐 ProjectCodec 的输出结构 | 轻度 |
| `src/core/subsystem_types.js` | **删减**：删除 `getDynamicFieldNames()` 等导出过滤辅助函数；`getTypeDefaults()` 改为调用子系统 codec 的 `decode({})`；保留 UI 渲染所需的 `label`/`editor` 元数据 | 删减 |
| `src/ui/dialogs/add_subsystem_dialog.js` | 创建新子系统实例时调用 `SubsystemDispatchCodec.decode({ type: '...' })` | 轻度 |

### 6.3 保留不变的文件

| 文件 | 原因 |
|------|------|
| `src/core/config_defaults.js` | 逐步废弃（默认值迁移到 codec 定义后删除） |
| `src/core/content_pack.js` | 读取外部内容包定义文件，与内部配置格式无关 |
| `src/utils/persistence.js` | 加载/保存入口不变，只改内部调用的迁移逻辑 |
| `src/ui/menu.js` | 导出入口不变，`_executeExport` 内部调用 codec |
| `src/generators/meta_generator.js` | 不受影响（独立生成 meta.json） |
| `src/generators/lang_generator.js` | 不受影响（独立生成本地化文件） |
| `src/generators/material_generator.js` | 不受影响（逐字复制材料定义文件） |
| `src/generators/subsystem_generator.js` | 不受影响（逐字复制子系统定义文件） |
| `src/generators/connector_generator.js` | 不受影响（逐字复制连接点定义文件） |
| `src/ui/*.vue.js` | Vue 面板组件不受影响（操作的数据对象结构兼容） |

### 6.4 数据流对比

**旧流程**：
```
config_defaults.js          part_generator.js
  SUB_PART_DEFAULTS ──X──→  durability !== 20.0  （重复定义）
  CONNECTOR_DEFAULTS ──X──→  if (conn.internal)    （重复定义）
  PART_DEFAULTS       ──X──→  if (field !== null)  （重复定义）

config.js                    config_defaults.js
  Object.assign() ────────→  *_DEFAULTS            （浅合并，不递归）
```

**新流程**：
```
两层 Codec：
  ProjectCodec（项目级：$schema_version / modelFile / contentPackPath / dependencyPaths / _uiState / parts）
    └── parts: Codec.map(Codec.STRING, PartCodec)  ← 递归嵌套

单一数据源：各 codec 定义文件
    ├── export:   part_generator.js → PartCodec.encode(partConfig)
    ├── ensure:   config.js         → ProjectCodec.decode(config, { mode: 'relaxed' })
    ├── create:   config.js         → ProjectCodec.decode({})
    ├── load:     persistence.js    → migrateIfNeeded() → ProjectCodec.decode(config, { mode: 'relaxed' })
    └── drag:     drag_import.js    → *Codec.decode(json) → merge
```

---

## 7. 实施路线图

### 阶段 1：Codec 核心库 + 基础模型

**目标**：实现 Codec 组合子库和 8 个数据模型 Codec，编写测试确保 encode/decode 往返一致。

**任务**：

| # | 任务 | 预估 |
|---|------|------|
| 1.1 | 实现 `src/codec/Codec.js`：`STRING/INT/FLOAT/BOOL/ENUM` + `record` + `map` + `list` + `default` + `field` + `nullable` | 核心 |
| 1.2 | 实现 `either()` 组合子 | 核心 |
| 1.3 | 实现 `dispatch()` 组合子 | 核心 |
| 1.4 | 实现 `HitBoxCodec` + `InteractBoxCodec` + `HydroCodec`（叶子 codec） | 基础 |
| 1.5 | 实现 `ConnectorCodec` | 基础 |
| 1.6 | 实现 18 种子系统 Codec + `SubsystemDispatchCodec` | 中 |
| 1.7 | 实现 `SubPartCodec` | 中 |
| 1.8 | 实现 `VariantCodec`（含 Either 简写） | 中 |
| 1.9 | 实现 `PartCodec`（含 Either 简写） | 中 |
| 1.10 | 编写 `test/codec.test.js`：往返测试 + 边界测试 | 基础 |

**验收标准**：
- 每个 codec 的 `decode(encode(x))` 等价于 `x`（内部字段如 `_uuid` 除外）
- 每个 codec 的 `encode({})` 返回包含所有非默认字段的输出
- 每个 codec 的 `decode({})` 返回全部默认值填充的对象
- 子系统 dispatch codec 能正确路由 18 种类型
- Either codec 能正确处理单 key 简写和多 key 完整格式

### 阶段 2：替换导出管线

**目标**：用 codec 替换 `part_generator.js` 中的手写过滤逻辑。

**任务**：

| # | 任务 |
|---|------|
| 2.1 | 重写 `generatePartJSON()` 为 `PartCodec.encode(partConfig)` |
| 2.2 | 删除 `buildSubPartOutput()` / `buildVariantOutput()` 函数 |
| 2.3 | 删除 `_cleanConnectors()` / `_cleanSubsystems()` / `_inferDynamicFields()` 函数 |
| 2.4 | 处理 `_resolveUUIDKeys()` —— 此为 Blueprint 运行时解析，非 Codec 职责，独立保留 |
| 2.5 | 运行完整导出，与重构前 diff JSON 输出，确保一致 |

**验收标准**：重构前后导出的 `parts/*.json` 完全一致（字段顺序可能变化，键值对内容不变）。

### 阶段 3：替换导入/创建管线

**目标**：用 codec 替换 `config.js` 中的手工配置创建方法。

**任务**：

| # | 任务 |
|---|------|
| 3.1 | 实现 `ProjectCodec`（项目级 codec：`$schema_version` / `modelFile` / `contentPackPath` / `dependencyPaths` / `_uiState` / `packMeta` / `namespace` / `parts`）。其中 `parts` 使用 `Codec.map(Codec.STRING, PartCodec)` 实现递归嵌套 |
| 3.2 | 修改 `createBlankConfig()` → `ProjectCodec.decode({})` |
| 3.3 | 合并 `createPartConfig()` / `createVariantConfig()` / `createSubPartConfig()` 等为各 codec 的 `decode({})` 调用 |
| 3.4 | `ensureDefaults()` 改为 `ProjectCodec.decode(config, { mode: 'relaxed' })` 递归填充所有层级的默认值 |
| 3.5 | **版本迁移与 Codec 交互**：`migrateIfNeeded()` 保留版本迁移循环（结构性修改），迁移完成后调用 `ProjectCodec.decode(migrated, { mode: 'relaxed' })` 填充默认值。使用**宽松模式**的原因：版本迁移可能删除旧字段（如 v3→v4 删除 `connector_defs`、`projectiles` 等），迁移后的中间格式若含 codec schema 未定义的字段（如旧版残留或手写 JSON 中的未知字段），宽松模式会保留它们而非报错，确保向前兼容 |
| 3.6 | 更新 `add_subsystem_dialog.js` 中的子系统创建逻辑 |

**验收标准**：新建项目 → 新建零件 → 编辑 → 保存 → 重新打开 → 数据完好无损。

### 阶段 4：清理与拖拽导入

**目标**：清理废弃代码，实现拖拽 JSON 导入。

**任务**：

| # | 任务 |
|---|------|
| 4.1 | 废弃 `config_defaults.js`（默认值全部迁入 codec 定义） |
| 4.2 | 删除 `subsystem_types.js` 中的导出过滤辅助函数 |
| 4.3 | 实现拖拽拦截：监听文件拖入 → 识别 JSON 类型 → 调用 codec.decode → 合并到配置 |
| 4.4 | 运行 lint/test，确保无回归 |
| 4.5 | 更新子模块 AGENTS.md 反映新的模块结构 |

**验收标准**：拖入 `parts/some_part.json` 到 Blockbench → 零件配置自动回填 → UI 面板刷新。

---

## 8. 与 `subsystem_types.js` 的关系

`subsystem_types.js` 当前身兼两职：

| 职责 | 当前提供服务 | 重构后 |
|------|------------|--------|
| 导出过滤（字段白名单） | `getDynamicFieldNames(typeId)` | **移交**给 dispatch codec 的 encode |
| UI 面板渲染（label/editor/defaultValue） | `getDynamicFields(typeId)` | **保留**，阶段性作为 UI 元数据源 |
| 创建默认值 | `getTypeDefaults(typeId)` | **移交**给 codec.decode |

中期目标（阶段 5，不在本计划内）：子系统 codec 定义也产出 `label`/`editor` 元数据，使 `subsystem_types.js` 完全可由 codec 定义动态生成，彻底消除重复。

---

## 9. 与 Java Codec 的对照总表

| 层级 | Java 类 | JS Codec 文件 | 字段数 |
|------|---------|--------------|:-----:|
| Part 顶级 | `PartType` | `part_codec.js` | 7 必/可选 + 1 嵌套 |
| Variant | `VariantAttr` | `variant_codec.js` | 4 必/可选 + 1 嵌套 |
| SubPart | `SubPartAttr` | `sub_part_codec.js` | 14 字段 |
| Connector | `ConnectorAttr` | `connector_codec.js` | 7 字段 |
| HitBox | `HitBoxAttr` | `hit_box_codec.js` | 7 字段 |
| InteractBox | `InteractBoxAttr` | `interact_box_codec.js` | 4 字段 |
| Hydrodynamic | `HydrodynamicAttr` | `hydrodynamic_codec.js` | 若干字段 |
| 子系统 × 18 | `*SubsystemAttr` | `subsystem_codec.js` | 各 2-7 字段 |

---

## 10. 风险与缓解

| 风险 | 级别 | 缓解措施 |
|------|:----:|---------|
| encode 输出与 Java CODEC 期望不一致 | 中 | 阶段 2 用实际 JSON diff 验证，字段名/默认值与 Java `optionalFieldOf` 一一对照 |
| dispatch codec 的行为与 Java `byNameCodec().dispatch()` 有差异 | 中 | Java 的 dispatch 返回 `MapCodec`；JS 侧 dispatch 负责剥离/注入 discriminator key（见 §4.6 的 type 剥离协议），确保子 codec 不会因多余 `type` 字段报错 |
| Either xmap 逻辑不一致 | 低 | 逻辑简单、易测试，阶段 1 中覆盖；`wrapKey` 参数化保证不同场景下行为一致 |
| 瞬态字段泄漏到导出 JSON（`_uuid`、`auto_end_bones` 等） | 中 | **Codec encode 默认跳过 schema 未定义字段**，这是关键设计决策（见 §4.4 第 5 条）；InteractBoxCodec 的 schema 不含 `_uuid`，SubPartCodec 的 schema 不含 `auto_end_bones`，encode 时自动过滤 |
| `ensureDefaults` 的顶层项目字段无法用 PartCodec 覆盖 | 中 | **已解决**：引入 ProjectCodec 层（见 §6.1），`ensureDefaults()` 改为 `ProjectCodec.decode(config, { mode: 'relaxed' })`，递归覆盖包括 parts 在内的所有嵌套层级 |
| 子系统 dispatch 中 `definition` 字段 18 次重复定义 | 低 | **已解决**：提取 BaseSubsystemCodec（见 §4.6），所有子系统共用一份 `definition` schema |
| 现有 Vue 面板写入 `_uuid` 等瞬态字段到内存对象 | 低 | 面板操作内存中的 plain object，Codec encode 自动过滤；面板不会依赖 encode 输出中的 `_uuid` |
| `mm_project.json` 备份字段列表与 codec 输出不一致 | 低 | 阶段 3 中 `saveConfig()` 的备份字段列表对齐 ProjectCodec 的输出结构 |
| 现有 Vue 面板依赖 plain object 结构 | 低 | codec.decode 产出与现有 plain object 完全兼容 |
| 性能 | 极低 | encode/decode 仅在导出/加载/拖入时触发，非热路径 |
| Blockbench 升级 | 低 | Codec 系统零依赖 Blockbench 内部，纯 JS 实现 |

---

## 11. 附录：Codec API 参考（草案）

### 基础类型

| API | 说明 |
|-----|------|
| `Codec.STRING` | 字符串 codec |
| `Codec.INT` | 整数 codec |
| `Codec.FLOAT` | 浮点数 codec |
| `Codec.BOOL` | 布尔值 codec |
| `Codec.ENUM(values)` | 枚举 codec，values 为字符串数组 |

### 组合子

| API | 说明 |
|-----|------|
| `codec.list(len?)` | 数组 codec，可选固定长度 |
| `codec.map(keyC, valC)` | 键值映射 codec |
| `Codec.record(schema)` | 声明式记录 codec |
| `Codec.either(a, b)` | 二选一 codec |
| `Codec.dispatch(key, map)` | 按字段值分派 codec |

### 字段规格

| API | Java 对应 | 说明 |
|-----|-----------|------|
| `Codec.STRING.field()` | `fieldOf` | 必填字段 |
| `Codec.STRING.default(val)` | `optionalFieldOf` | 可选字段，有默认值 |
| `Codec.STRING.nullable()` | `optionalFieldOf` + `Optional` | 可选，默认 null |

### 实例方法

| 方法 | 说明 |
|------|------|
| `codec.encode(value)` | 序列化 → JSON 兼容对象（跳过默认值 + 跳过 schema 未定义的瞬态字段） |
| `codec.decode(raw, opts?)` | 反序列化 → 完整值对象（填充默认值）。`opts.mode: 'strict' | 'relaxed'` 控制未知字段处理 |

### encode 时字段过滤规则

| 字段类型 | encode 行为 |
|---------|------------|
| `.field()` | 始终输出 |
| `.default(val)` | 值 `===` 默认值时跳过 |
| `.nullable()` | 值为 `null` 时跳过 |
| 不在 schema 中的字段 | **跳过**（自动剥离 `_uuid`、`auto_end_bones` 等瞬态标记） |
