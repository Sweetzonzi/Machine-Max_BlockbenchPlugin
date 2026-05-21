# AGENTS.md — src/codec/（序列化/反序列化层）

## 概览

声明式序列化/反序列化框架，提供统一的 `config → JSON` 和 `JSON → config` 双向转换。基于 Java RecordCodecBuilder 模式，纯 JS 实现，零外部依赖。

## 结构

```
src/codec/
├── Codec.js                    # 核心组合子库：5 基元 + 3 字段规格 + 6 组合子（567行）
├── codecs/                     # 类型级 Codec 定义（8 个）
│   ├── part_codec.js           # Part 配置（12 字段，含 variants Either 简写）
│   ├── variant_codec.js        # Variant 配置
│   ├── sub_part_codec.js       # SubPart 配置（含物理属性、碰撞箱、交互箱）
│   ├── subsystem_codec.js      # 20 种子系统类型的独立 codec + DispatchCodec（277行）
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
| 添加新子系统类型 codec | `codecs/subsystem_codec.js` | 定义新 codec 并注册到 `SUBSYSTEM_CODECS` 映射表 |
| 在导出流程中使用 Codec | `generators/*.js` | 调用 `XCodec.encode(config)` 输出 JSON |

## 设计架构

### 5 种基元类型

| 基元 | `encode` | `decode` | 用途 |
|------|----------|----------|------|
| `Codec.STRING` | 透传 | 类型断言 `string` | 标识符、路径 |
| `Codec.INT` | 透传 | `Math.floor()` 截断 | 计数、等级 |
| `Codec.FLOAT` | 透传 | `parseFloat()` | 比率、坐标 |
| `Codec.BOOL` | 透传 | `!!` 强制转换 | 开关标记 |
| `Codec.JSON` | 透传 | 透传 | 任意 JSON（不校验） |

### 3 种字段规格

| 规格 | 序列化行为 | 反序列化行为 |
|------|-----------|-------------|
| `.field()` | 缺失时报错 | 缺失时报错 |
| `.default(val)` | 等于默认值时跳过 | 缺失时填充默认值 |
| `.nullable()` | null/undefined 时跳过 | 缺失时返回 `null` |

### 6 种组合子

| 组合子 | 功能 | 典型用法 |
|--------|------|---------|
| `Codec.record(schema)` | 对象结构 | 所有类型级 codec 的基础 |
| `.list(len)` | 固定/可变长度数组 | `speed_outputs: Codec.STRING.list()` |
| `.map(keyC, valC)` | 键值对对象 | `sub_parts: Codec.map(Codec.STRING, SubPartCodec)` |
| `Codec.either(a, b)` | 单值/对象二选一 | Variant 简写：单变体 vs 多变体 |
| `Codec.dispatch(key, map)` | 按判别字段路由 | 20 种子系统类型按 `type` 字段分发 |
| `Codec.of(fn)` | 自定义转换 | 枚举 ↔ 字符串映射 |

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
