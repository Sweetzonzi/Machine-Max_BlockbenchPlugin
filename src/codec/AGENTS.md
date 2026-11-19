# AGENTS.md — src/codec/（序列化/反序列化层）

## 概览

声明式序列化/反序列化框架，提供统一的 `config → JSON` 和 `JSON → config` 双向转换。基于 Java RecordCodecBuilder 模式，纯 JS 实现，零外部依赖。

## 结构

```
src/codec/
├── Codec.js                    # 核心组合子库：6 基元 + 3 字段规格 + 5 组合子（618行）
├── codecs/                     # 类型级 Codec 定义（8 个）
│   ├── part_codec.js           # Part 配置（9 字段，含 variants Either 简写）
│   ├── variant_codec.js        # Variant 配置
│   ├── sub_part_codec.js       # SubPart 配置（含物理属性、碰撞箱、交互箱）
│   ├── subsystem_codec.js      # 22 种子系统类型的独立 codec + 严格/加载两个 DispatchCodec（约 350 行）
│   ├── connector_codec.js      # 连接点配置
│   ├── hit_box_codec.js        # 碰撞箱配置
│   ├── interact_box_codec.js   # 交互箱配置
│   └── hydrodynamic_codec.js   # 流体力学配置
└── index.js                    # 统一导出入口
```

## 查找指引

| 任务 | 文件 | 说明 |
|------|------|------|
| 理解 Codec 体系 | `Codec.js` | 阅读文件头注释获得设计原则概览 |
| 添加新基元类型 | `Codec.js` → `createPrimitiveCodec()` | 注册到 `module.exports`，调用 `withFieldMethods()` |
| 添加新组合子 | `Codec.js` | 实现 create 函数 + 注册到 `withFieldMethods()` 链式接口 |
| 为现有类型添加新字段 | `codecs/<type>_codec.js` | 在 `Codec.record({...})` 中添加行，遵循字段规格 `.field()` / `.default()` / `.nullable()` |
| 添加新子系统类型 codec | `codecs/subsystem_codec.js` | 定义新 codec 并注册到 `SUBSYSTEM_CODECS` 映射表（严格/加载两个实例共用） |
| 退役子系统类型 | `codecs/subsystem_codec.js` + `core/subsystem_types.js` | 从两张表移除 codec / 类型，并把 id 加进 `RETIRED_TYPES` |
| 在导出流程中使用 Codec | `generators/*.js` | 调用 `XCodec.encode(config)` 输出 JSON |

## 设计架构

### 6 种基元类型

| 基元 | `encode` | `decode` | 用途 |
|------|----------|----------|------|
| `Codec.STRING` | 类型断言 `string`（非 string 抛错） | 类型断言 `string` | 标识符、路径 |
| `Codec.INT` | 类型断言整数 | 类型断言整数（不做截断） | 计数、等级 |
| `Codec.FLOAT` | 类型断言 `number` | 类型断言 `number` | 比率、坐标 |
| `Codec.BOOL` | 类型断言 `boolean` | 类型断言 `boolean` | 开关标记 |
| `Codec.ENUM(values)` | 值必须在枚举内 | 值必须在枚举内 | 有限取值 |
| `Codec.ANY` | 透传 | 透传 | 任意 JSON（`overwrite` 等） |

### 3 种字段规格

| 规格 | 序列化行为 | 反序列化行为 |
|------|-----------|-------------|
| `.field()` | 缺失时报错 | 缺失时报错 |
| `.default(val)` | 等于默认值时跳过 | 缺失时填充默认值 |
| `.nullable()` | null/undefined 时跳过 | 缺失时返回 `null` |

### 5 种组合子

| 组合子 | 功能 | 典型用法 |
|--------|------|---------|
| `Codec.record(schema)` | 对象结构 | 所有类型级 codec 的基础 |
| `.list(len)` | 固定/可变长度数组 | `speed_outputs: Codec.STRING.list()` |
| `.map(keyC, valC, {emitEmpty})` | 键值对对象；`emitEmpty` 时空对象输出 `{}`（required map） | `sub_parts: Codec.map(Codec.STRING, SubPartCodec)` |
| `Codec.either(a, b)` | 单值/对象二选一 | Variant 简写：单变体 vs 多变体 |
| `Codec.dispatch(key, map, {onUnknown})` | 按判别字段路由；`onUnknown: 'keep'` 时未知判别值原样保留（读盘专用） | 子系统按 `type` 字段分发 |

## 严格链路与加载链路

同一张类型表带两个 dispatch 实例（见 `codecs/subsystem_codec.js`）：

| 实例 | 用途 | 未知 `type` 的行为 |
|------|------|------------------|
| `SubsystemDispatchCodec` / `PartCodec` / `VariantCodec` / `SubPartCodec` | 导入 part JSON、导出编码 | 抛 `Unknown dispatch type`，写入前拒绝 |
| `SubsystemLoadCodec` / `PartLoadCodec` / `VariantLoadCodec` / `SubPartLoadCodec` | 工程加载（`core/config.js` 的 `ensureDefaults`） | 原样保留整条条目，工程照常打开 |

- **加载链路只放宽 decode**：`encode` 不受 `onUnknown` 影响，写出未知类型永远抛错。
- **为什么要有加载链路**：上游会退役类型（`machine_max:regen_loader` 在 0.6.0 拆成弹药架与自动装弹机），工程文件里留着的旧条目若在 decode 抛错，`loadConfig()` 会让整个工程打不开、`零件定义` 模式也进不去。保留条目后由 `services/validate.js` 报 `subsystem_type_unknown`（已退役类型附替代类型），导出闸门照样拦。
- **新增子系统类型**只改 `SUBSYSTEM_CODECS` 一张表，两个实例自动同步；`codec_contract.test.js` 有「加载实例对已登记类型与严格实例等价」的用例守着。
- **退役类型要登记**：从 `core/subsystem_types.js` 的 `SUBSYSTEM_TYPES` 删除后，把 id、旧名、说明与替代类型加进同文件的 `RETIRED_TYPES`，否则面板与校验只能把它当「未知类型」提示。

## 约定

- **声明式注册**: 每个 codec 定义 `encode` / `decode` 方法，以 `{ encode, decode }` 对象形式导出
- **宽松解码**: `decode` 保留未知字段（`Object.assign`），不会因未知 key 报错
- **严格编码**: `encode` 跳过默认值的字段，输出最简 JSON
- **链式接口**: 所有基元和组合子通过 `withFieldMethods()` 获得 `.field()` / `.default()` / `.nullable()` / `.list()` / `.map()` 方法
- **纯函数**: Codec 无副作用，无 I/O，无 Blockbench/Node 依赖
- **双向对称**: `decode(encode(obj))` 应回环到等价对象（虽不保证逐字节相等）

## 反模式

- **不要绕过 Codec 直接序列化**: 直接 `JSON.stringify(config)` 会输出运行时字段（`_uiState` 等）和默认值
- **不要在 codec 内部引入循环依赖**: codecs/ 之间只能通过 `require` 引用，不能形成循环
- **不要在 `SubsystemDispatchCodec` 中使用 `.field()` 的 `type` 字段**: type 已是判别器 key，由 dispatch 自动处理
- **不要修改 Codec 原型**: 所有 codec 是普通对象，不是类实例
- **required map 不要用裸 `.map()`**: schema required 的 map 必须加 `{emitEmpty:true}`，否则 `{}` 会被省略成缺键
- **不要依赖 `STRING.encode` 做隐式转换**: 非 string 直接抛错，输入侧先归一化

## 数据流向

```
config（JS 对象，含运行时字段）
  → XCodec.encode(config)
    → JSON（纯数据，最简形式）
      → 写入磁盘 / file_writer.js

磁盘 JSON
  → XCodec.decode(json)
    → config（JS 对象，填充默认值，无运行时字段）
      → createXConfig() 补全运行时字段
        → Vue store / 渲染
```
