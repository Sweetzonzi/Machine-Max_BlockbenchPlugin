# 业务逻辑层与配置文档 API

> 状态：**设计稿（待实现）** · 日期：2026-10-20 · 范围：`src/doc/`（新增）+ `src/ops/`（由 `src/core/operations.js` 拆出）+ `src/services/`（新增）+ `src/ui/`、`src/mode/`（改薄）
> 目标版本：v0.5.0 · 前置：[docs/11-接入Blockbench原生撤销.md](./11-接入Blockbench原生撤销.md) · 下游：[docs/12-MCP工具接入.md](./12-MCP工具接入.md) · 参照：[docs/08-序列化反序列化-Codec体系重构.md](./08-序列化反序列化-Codec体系重构.md) / [docs/10-校验与错误提示重构实现计划.md](./10-校验与错误提示重构实现计划.md)

---

## 1. 背景与目标

docs/11 把"改配置必须走业务函数、撤销边界在业务函数内部"这条原则落地了，但只落到**结构性动作**：`src/core/operations.js` 的 16 个函数（新建/删除零件、变体、子系统、标签、四类标记、内容包路径与元数据）。

余下的写入仍然散在 UI：

- `App.vue.js` 里 23 个方法靠 `undo.wrapMethodMap` 逐个人工贴标签（字段 8、集合编辑 7、重命名/迁移 8）；
- `SubsystemPanel.vue.js` 12 个方法、`ConnectorPanel.vue.js` 9 个方法直接 `this.$set(this.config, …)`；
- `App.vue.js` 的 6 个计算属性在**渲染时**往配置里写（自动补建条目）；
- 一次字段编辑还要顺带 `saveConfig + refreshOutlinerIcons + dispatchEvent('update_selection')`。

这套结构对"人在面板上点"是够用的，对下面三件事都不够用：

1. **MCP**（[docs/12](./12-MCP工具接入.md)）：AI 只给得了字符串和 JSON，拿不到 `this`、选中元素、`_uiState`；它需要"路径 + 值"这种可序列化的操作描述。
2. **可维护性**：同一个"写字段"的模式重复 44 次，副作用散在 112 处 toast、20 处落盘、15 处刷新里，改一处字段语义要翻四个文件。
3. **可测试性**：仓库有 `bunfig.toml` 但没有 `test/` 目录，所有验证靠临时 Node 脚本与手工点。

目标：引入 **配置文档 API**（寻址 / 字段规格 / 投影 / 引用）与 **业务操作层**（每个操作一条撤销记录），让 UI 与将来的 MCP 客户端调用**同一批函数**；文件系统类用例抽到 `services/`，永不进入撤销栈、也永不暴露给 AI。

---

## 2. 现状测绘

### 2.1 体量

| 目录 | 文件 | 行数 | 性质 |
|---|---|---|---|
| `src/ui/` | 27 JS + 7 模板 | 6,774 + 1,118 | 展示 + **业务 + 副作用混入** |
| `src/mode/` | 6 | 1,479 | 生命周期、校验、菜单补丁、工具栏 |
| `src/core/` | 13 | 4,709 | 模型 + operations(714) + undo(620) |
| `src/codec/` | 9 | 1,279 | 纯声明式 ✅ |
| `src/managers/` | 5 | 330 | 只读定义服务 ✅ |
| `src/generators/` | 6 | 440 | 纯生成 + 3 处 fs 拷贝 |
| `src/import/` | 3 | 886 | 读 zip/json + 写配置 + 落盘，混合 |

### 2.2 写入入口（本次要收拢的对象）

| 类别 | 位置 | 数量 | 撤销 |
|---|---|---|---|
| 结构动作 | `core/operations.js` | 16 函数 | ✅ 自带 |
| 字段写入 | `App.vue.js` | 8 方法 | ⚠️ 人工包装 |
| 集合编辑 | `App.vue.js` | 7 方法 | ⚠️ |
| 重命名 / 迁移 | `App.vue.js` | 8 方法 | ⚠️ |
| 子系统面板直写 | `SubsystemPanel.vue.js` | 12 方法 / 22 处 `$set` | ⚠️ |
| 连接点面板直写 | `ConnectorPanel.vue.js` | 9 方法 / 10 处 `$set` | ⚠️ |
| **计算属性内写入** | `App.vue.js` 287/298/302/486/559/601/611/615 | 8 处 | ❌ 无 |
| 配置对话框 | part_dialogs / add_subsystem / tag_helper | 3 | ✅ 走 ops |
| 只读查看器 | `dialogs/` × 5 | 293 行 | — |
| 文件系统用例 | pack_create / pack_open / dependency_editor / export_dialog / export_pipeline / drag_import | 6 | 不涉及撤销 |

合计：**16 个已抽象 + 44 个人工包装方法 + 8 处无撤销写入**。

### 2.3 副作用分布

| 副作用 | 调用点 | 文件 |
|---|---|---|
| `saveConfig()` | 20 | 11 |
| `refreshOutlinerIcons()` | 15 | 7 |
| `Blockbench.dispatchEvent('update_selection')` | 22 | 6 |
| `showToast(...)` | 112 | 20 |
| `require('fs'/'path')` | 13 | 13（写盘 6 处） |

### 2.4 其它已确认的债务

- **校验三套**：`core/naming.js → validateNameUniqueness`（UI 的 rename 调用）、`mode/validation.js → _collectNameConflicts`（原生清单另写一份）、`operations.js` 内联（只判 key 存在）。
- **默认值三处真源**：`HitBoxCodec`（`material: 'machine_max:default'`）、`config.js` 内联 `HIT_BOX_DEFAULTS`（`material: ''`，注释自认"与 codec 不兼容"）、`config_defaults.js`（已标 `@deprecated` 但 `config.js` 是复制而非引用）。
- **子系统类型数**：`SubsystemDispatchCodec` 实际 22 种，`subsystem_codec.js` 文件头与 `codec/AGENTS.md` 都写 20 种。
- **AGENTS.md 行数多处过期**（App.vue.js 写 1465 实为 1883；`subsystem_dialog.js` 写 600 实为 78；`ui/managers/` 已移至 `src/managers/`）。

---

## 3. 七个阻塞（接 MCP 前必须解决）

| # | 阻塞 | 证据 |
|---|---|---|
| 1 | 无路径/kind 寻址层，`set_node(path)` 无从下手 | 全库无路径解析 |
| 2 | 字段无白名单，`updateXField(field, value)` 接受任意 key 直接 `$set` | `App.vue.js:1209` |
| 3 | 字段副作用藏在方法体里（`start_bone` 迁移标记、`bone`→`markerVersion++`、`definition`→同步 `config_ref`、`overwrite`/`textures` 惰性建对象、`_orphan` 拒写） | 6 个 update 方法 |
| 4 | 校验三套、ops 覆盖不全 | §2.4 |
| 5 | 副作用与业务耦合，AI 无法"只改内存不落盘" | §2.3 |
| 6 | 错误信封是 `{ok, error: string}`，MCP 需要结构化 `errors[]` | `operations.js:76` |
| 7 | 同步事务 vs 异步 I/O 混用（`runConfigEdit` 同步，导出/导入 async + fs） | — |

隐性第 8 条：**计算属性内写配置**——渲染即变更，撤销与持久化均不可控；AI 的 `get_context` 若复用这些 computed，读操作会产生写副作用。

---

## 4. 目标分层

```
src/ui/  src/mode/          展示层：渲染、收集事件、toast、导航
    │                       不再 require config / persistence 做写入
    ▼
src/ops/                    业务操作层：一个操作 = 一个业务意图 = 一条撤销记录
    │
    ▼
src/doc/                    配置文档 API：寻址 / 字段规格 / 投影 / 引用 / 读写原语
    │
    ▼
src/codec/  src/core/       模型层：Codec、工厂、标记系统、命名、内容包 I/O（保持纯）
    │
src/services/               文件系统用例：export / import / pack / validate（async，不进撤销）
src/mcp/                    工具注册（P5 才引入，见 docs/12）
```

依赖方向单向：`doc` 可以依赖 `codec/core`，`ops` 依赖 `doc`，`ui` 依赖 `ops`。**`core/` 与 `codec/` 永不依赖 `doc/ops/ui`**。

`src/core/operations.js` 在 P2 被 `src/ops/` 取代并删除（9 处 `require` 同步改写）。

---

## 5. 配置文档 API（`src/doc/`）

### 5.1 寻址（`doc/address.js`）

配置树（由 Codec 定义）：

```
config
├─ contentPackPath, dependencyPaths[], packMeta, modelFile, $schema_version
├─ _uiState { activePartId, activeVariantName }        ← 不可写（只读 + setActive）
└─ parts { <partId> → Part
     ├─ icon, vehicle_durability_rate, …, max_stack_size
     ├─ element_markers { <variant> → { <uuid> → { type, config_ref } } }   ← 编辑器内部，不可寻址
     └─ variants { <variant> → Variant
          ├─ model, textures, animations, tags[]
          └─ sub_parts { <spKey> → SubPart
               ├─ start_bone, end_bones[], mass, mass_center, projected_area[3], …
               ├─ hit_boxes { <uuid> → HitBox }
               ├─ interact_boxes { <name> → InteractBox }
               ├─ connectors { <name> → Connector }
               └─ subsystems { <name> → Subsystem }
```

**语法**：

| 形式 | 示例 | 说明 |
|---|---|---|
| 绝对 | `parts.hull.variants.default.sub_parts.sub_part.machine_max.chassis.mass` | 从 `parts` 起 |
| 相对 | `sub_parts.sub_part.machine_max.chassis.mass` | 省略 `parts.<p>.variants.<v>`，用 `_uiState` 当前上下文 |
| 下标 | `…sub_parts.<sp>.projected_area.1` | 纯数字段即数组下标 |
| 通配 | `sub_parts.*.mass` | **只允许出现在最后一段**，返回 `{key: value}` |

**解析结果**：

```js
resolve(config, path, ctx) → {
  kind:     'sub_part',              // part|variant|sub_part|hit_box|interact_box|connector|subsystem|collection
  field:    'mass',                  // 叶子字段名（落到集合本身时为 null）
  target:   { partId, variantName, spKey, ssKey, key },
  parentPath: 'parts.hull.variants.default.sub_parts.sub_part.machine_max.chassis',
}
```

**kind 推断规则**（由路径段名决定，不靠值猜）：

| 路径片段 | kind |
|---|---|
| `parts` / `parts.*` | collection(part) |
| `parts.<id>` | part |
| `.variants.<v>` | variant |
| `.sub_parts.<sp>` | sub_part |
| `.hit_boxes.<k>` | hit_box |
| `.interact_boxes.<k>` | interact_box |
| `.connectors.<k>` | connector |
| `.subsystems.<k>` | subsystem |

**约束**：

- `*` 只在末尾（中间层通配无法给出单条可撤销记录，且组合语义不可控）。
- `_uiState` 与 `element_markers` **不可寻址写**；切上下文用 `setActive` 操作。
- `hit_boxes` 的 key 在对外格式里是**骨骼名**、内存里是 **UUID**（见 §5.3），路径解析需同时接受两种形式并归一化为 UUID。

### 5.2 字段规格表（`doc/field_specs.js`）

目的：把 44 个方法里重复的"判空 → 取目标 → 校验 → 写值 → 连带副作用"压成**一张表 + 一个函数**。

**键集与默认值由 Codec 派生**（不手抄）：

```js
// 每 kind 提供一个最小可解码样例，decode 后取键集与默认值
var SKELETON = {
    part:      { id: 'x' },                                   // PartCodec 全字段 .default()
    variant:   { model: '' },                                 // model 是 .field() 必填 → 样例必须给
    sub_part:  {},
    hit_box:   { id: 'part', type: 'box' },                   // id/type 必填
    interact_box: { bone: '' },
    connector: { locator: '' },
    subsystem: { type: 'machine_max:engine', definition: '', power_output: '' },
};
```

`type` 由默认值的 `typeof` 派生（`number|string|boolean|array|object`），`enum` 与"资源位置"标记手写（Codec 的 `ENUM` 闭包不外露取值）。

**表结构**：

```js
{
  kind: 'sub_part',
  key: 'mass',
  type: 'number',            // typeof 派生
  default: 25,
  enum: null,                // block_collision → ['true','false','ground']
  resourceLocation: false,   // model / animations / definition → true
  boneRef: false,            // start_bone / bone / locator / mass_center → true
  sideEffect: null,          // 见下表
  uniqueScope: null,         // 'part' | 'variant' | 'sub_part'
  requiredOnCreate: false,   // 来自 Codec .field()
}
```

**副作用表**（唯一需要手写的部分，共 9 条）：

| kind.field | 副作用 id | 行为 |
|---|---|---|
| `sub_part.start_bone` | `migrate_sub_part_marker` | 把 sub_part 标记从旧骨骼 UUID 迁到新骨骼（迁移后重算 auto_end_bones） |
| `sub_part.end_bones` | `recalc_auto_end_bones` | 重算排除骨骼 |
| `sub_part.mass_center` | — | 仅校验骨骼存在（warning，不阻塞） |
| `interact_box.bone` | `rebind_interact_marker` | 重新解析 marker + `markerVersion++` |
| `connector.definition` | `sync_marker_config_ref` | 同步 marker 的 `config_ref` |
| `connector.locator` | `migrate_connector_marker` | 标记迁到新 Locator |
| `hit_box.overwrite` | `ensure_object` | 惰性建 `overwrite` |
| `variant.textures` | `ensure_object` | 惰性建 `textures`；单键时按 either 简写处理 |
| `subsystem.type` | `rebuild_type_fields` | 重建类型专属字段（丢弃旧类型字段，返回 `dropped_fields`） |

**对外函数**：

```js
fieldSpecs.get(kind, field, typeId)      // typeId 仅 subsystem 需要
fieldSpecs.keys(kind, typeId)            // 该 kind 全部可写字段
fieldSpecs.normalize(kind, field, value) // 归一化（数字字符串→number 等）
fieldSpecs.validate(kind, field, value)  // → null | {code, expected, got}
```

### 5.3 投影（`doc/projection.js`）

内部树与对外定义**不是同一个形状**，必须成对转换：

| 差异 | 对外定义（AI 看/写、导出） | 内部树 |
|---|---|---|
| `hit_boxes` key | 骨骼名 | UUID |
| `interact_boxes[*]._uuid` | 无 | 有 |
| `connectors[*]._marker_uuid` | 无 | 有 |
| 单元素 `variants` / `sub_parts` | 简写（直接给对象） | map `{name: {...}}` |
| 默认值字段 | 省略（`Codec.encode` 剥离） | 全量存在 |
| `auto_end_bones` / `_unresolved_bones` / `element_markers` | 无 | 有 |

```js
projection.out(kind, node)        // UUID→骨骼名、单元素 map→简写、剥瞬态字段、Codec.encode
projection.in(kind, definition)   // 骨骼名→UUID、强制 key 格式、剥内部字段、Codec.decode
```

**三个必须解决的坑**：

1. **`either` 启发式的静默损坏**。`sub_parts` / `variants` 用 `Codec.either`，判定依据是"key 里有没有 `.` 或 `:`"（`Codec.js:561-586`）。若给 `{ sub_parts: { chassis: {...} } }`（key 无点号），会先按单实体解码 —— `SubPartCodec` 全字段有默认值，**解码成功**，整张 map 被吞成 `{ default: { …, chassis: {...} } }`。
   → `projection.in` 必须先校验 `sub_parts` 的每个 key 匹配 `^sub_part\.[\w-]+\.[\w-]+$`，不匹配直接返回 `invalid_format`，不进 decode。
2. **宽松 decode 让内部字段可注入**。`record.decode` 保留未知字段（`Codec.js:413-420`），而 `element_markers` **就在 `PartCodec` 的 schema 里**（`Codec.record({}).default({})`）：decode 时 passthrough（能进来）、encode 时恒为 `undefined`（被剥掉）——"只进不出"。AI 塞进来的假 marker 会永久留在内存并随 `.bbmodel` 保存，导出时消失，成为幽灵标记。
   → `projection.in` 走白名单，丢弃 `element_markers` / `_uuid` / `_marker_uuid` / `_unresolved_bones` / `auto_end_bones`。
3. **块状删除会留下悬空引用**。删除/替换一个节点时，指向它的 `markers[].config_ref`、`subsystems[*].signal_targets`、`connectors[*].signal_translations` 必须同步清理（见 §5.4）。

### 5.4 引用（`doc/refs.js`）

`bone_resolver.js` 升级而来，职责从"导入时反查骨骼"扩展为"名字 ↔ 引用"的双向解析与清理：

```js
refs.resolve(kind, node, ctx)   // → { resolved: [...], unresolved: [{bone, field, subPartKey, key}] }
refs.cleanDangling(config, { partId, variantName, removed })  // 清理指向被删/被替换节点的引用
refs.renameRefs(config, { partId, variantName, kind, oldKey, newKey })
```

引用面（共 4 类）：

| 引用 | 位置 | 指向 |
|---|---|---|
| `config_ref` | `part.element_markers[<v>][<uuid>]` | 子零件 key / 交互区名 / 连接点名 |
| `signal_targets` | `subsystems[*]` / `interact_boxes[*]` / `connectors[*]` | 信号目标（`<type>.<name>` 形式） |
| `signal_translations` | `connectors[*]` | 频道名 |
| 骨骼 / 定位器 | `start_bone`、`end_bones`、`mass_center`、`interact_box.bone`、`connector.locator`、`hit_boxes` key | `Group` / `Locator` |

### 5.5 原语与信封（`doc/index.js`）

```js
doc.read(config, path, opts)              // → {ok, kind, value}
doc.write(config, path, value, opts)      // 标量/数组/对象，走 fieldSpecs + 副作用
doc.insert(config, path, key, node)       // 集合插入
doc.remove(config, path, opts)            // 删除 + refs.cleanDangling
doc.apply(config, path, definition, opts) // 整件替换（走 projection.in）
```

所有原语**不自己开撤销记录**，由 ops 层用 `runConfigEdit` 包住（沿用 docs/11 的边界原则）。原语可被多个 ops 组合进同一条记录。

**返回信封**：

```js
// 成功
{ ok: true, data: {…}, changed: true }

// 失败
{ ok: false,
  error: 'mass 期望 number，收到 string',        // 人话，兼容现有 30+ 调用点
  errors: [{ path: 'sub_parts.<sp>.mass',
             code: 'type_mismatch',
             expected: 'number',
             got: '"12.5"',
             hint: '去掉引号' }] }
```

错误码：`no_project` / `not_found` / `missing_required` / `type_mismatch` / `invalid_enum` / `invalid_format` / `duplicate_name` / `unknown_field` / `unknown_type` / `unresolved_reference` / `edit_in_progress` / `snapshot_too_large` / `io_error`。

---

## 6. 业务操作层（`src/ops/`）

### 6.1 目录与操作清单

```
src/ops/
├── index.js          # 聚合导出（保持 ops.xxx 形态）
├── part.js           # createPart / deletePart / importPart
├── variant.js        # createVariant / deleteVariant / importVariant / setVariantTags
├── sub_part.js       # importSubPart / renameSubPart / markSubPart
├── subsystem.js      # createSubsystem / deleteSubsystem / importSubsystem / renameSubsystem
├── element.js        # markHitBox / markInteractBox / markConnector / renameConnector /
│                     # renameInteractBox / clearElementMarker / bindMarker / removeNode
├── field.js          # setField
├── pack.js           # setContentPack / setContentPackPath / updatePackMeta / updateDependencyPaths
└── session.js        # setActive（写 _uiState，不进撤销）
```

共 **28 个操作**（现有 16 + 新增 12：四个 `import*`、四个 `rename*`、`bindMarker`、`removeNode`、`setField`、`setActive`）。

### 6.2 签名与撤销边界

```js
function createPart(config, options)   // 现有签名保持不变
function setField(config, options)     // 新增
function importPart(config, options)   // 新增
```

统一约定：

- 第一个参数永远是**完整配置对象**（`getConfig()` 的结果），不接收 Vue 实例。
- 返回 `{ok, …}`；失败**不抛异常**（`strict` 模式除外，MCP 用）。
- 内部统一 `runConfigEdit(label, fn, {strict})`，标签用函数形式：
  `'修改子零件字段 ' + field`、`'导入子零件 ' + spKey`、`'重命名子系统 ' + oldKey + ' → ' + newKey`。
- **不落盘、不 toast、不刷新**——只发事件（§7）。
- 写响应式对象走注入的 setter（§7.2），不直接嗅探全局 `Vue`。

### 6.3 三级写入通道

| 粒度 | 操作 | 语义 | 撤销 |
|---|---|---|---|
| 单字段 | `setField` | 只改一个字段，其余保持不变 | 一条（同标签 800ms 内合并） |
| 单实例 | `createXxx` / `markXxx` / `removeNode` / `renameXxx` / `bindMarker` | 增删实例、改 key、绑标记 | 一条 |
| 整件 | `importPart` / `importVariant` / `importSubPart` / `importSubsystem` | **整体替换该节点子树**，省略字段 = 重置为默认值 | 一条 |

**整件语义必须显式告知调用方**：`import*` 返回 `reset_fields`（替换前存在、本次未提供、被重置为默认值的字段列表），AI 与用户都能看出"漏了什么"。

`createXxx` 与 `importXxx` 的关系：前者是后者"空定义 + 自动命名"的特例（`part` / `sub_part` / `subsystem` 具备；`variant` 因 `model` 必填不能空定义）。

`hit_box` / `interact_box` / `connector` **本期不提供整件通道**（字段少、key 与 UUID 纠缠、替换收益低于风险），只保留 `markXxx`（绑定已有元素，内部同时建配置条目）+ `setField`；MCP 侧把这两步组合暴露为一个 `add_instance` 工具（嵌套编辑并入同一条撤销记录）。注册表留位，后续可加。

---

## 7. 副作用总线

### 7.1 事件

```js
// ops 内部统一发这一个事件
Blockbench.dispatchEvent('mm_config_changed', {
    source: 'ui' | 'mcp' | 'import',
    label:  '修改子零件字段 mass',
    kinds:  ['sub_part'],
    paths:  ['parts.hull.variants.default.sub_parts.<sp>.mass'],
    persist: true,     // 是否允许订阅方落盘
});
```

**UI 适配器**（`App.vue.js` mounted 订阅一次）：

```js
Blockbench.on('mm_config_changed', function (e) {
    refreshOutlinerIcons();
    self.markerVersion.v++;                       // 强制重算幽灵/归属相关 computed
    Blockbench.dispatchEvent('update_selection'); // 原生问题清单重新校验
    if (e.persist) persistence.scheduleSave();    // 300ms 防抖
});
```

**MCP 侧**不订阅或订阅后忽略写盘：`persist: false`。这样"AI 改内存、人按 Ctrl+S 落盘"的安全边界由**结构**保证，而不是靠调用方自觉。

### 7.2 响应式注入

`doc/` 不 `require('Vue')`，改为启动时注入：

```js
// src/doc/reactivity.js
var adapter = {
    set: function (obj, key, val) { obj[key] = val; },
    del: function (obj, key) { delete obj[key]; },
};
function install(next) { adapter = next; }     // UI 适配器在 mode.js onSelect 时注入 Vue.set/Vue.delete
```

`App.vue.js` 启动时：

```js
doc.reactivity.install({
    set: function (o, k, v) { return self.$set(o, k, v); },
    del: function (o, k) { return self.$delete(o, k); },
});
```

未注入时退化为普通赋值——Node 测试与 MCP 环境天然可用。

### 7.3 不集中化的部分

- **toast**：112 处保持原位。文案与上下文强相关（"零件已被删除" vs "型号不存在"），集中化需要消息目录（i18n），超出本次范围。约定：**ops 不 toast，调用方按 `result.error` 决定弹什么**。
- **`saveConfig` 的显式调用**：`Blockbench.on('save')` 与 `loadConfig()` 内部的幽灵标记清理保持直接调用，其余 18 处收敛为事件订阅。

---

## 8. `services/` 层

```
src/services/
├── export.js     # executeExport（从 ui/export/export_pipeline.js 迁入）
├── import.js     # 文件读取 + 批量编排（从 import/drag_import.js 拆出 IO 部分）
├── pack.js       # 创建/打开/校验内容包、依赖链解析（从三个 pack 对话框抽 fs 部分）
└── validate.js   # collectIssues 包装 + diff（本次编辑引入的问题）
```

约定：`services/` 可以 `require('fs')`、可以 async、**不参与撤销**、**不暴露给 MCP**。

---

## 9. 迁移映射（旧 → 新）

| 旧位置 | 旧做法 | 新位置 |
|---|---|---|
| `App.updatePartField/Variant/SubPart/HitBox/HitBoxOverwrite/InteractBox/Connector/SubsystemField` | 8 个方法各自 `$set` | `ops.setField` |
| `App.addEndBone/removeEndBone/removeTag/handleTexturesKv*` | 7 个集合编辑方法 | `ops.setField`（整数组/整对象提交，面板侧已用 `:value`+`@change`） |
| `App.renameSubPart/renameConnector/renameInteractBox/renameSubsystem` | key 迁移 + marker 改写 + 唯一性校验 | `ops.renameXxx` + `doc.refs` |
| `App.migrateSubPartStartBone/migrateConnectorLocator/migrateInteractBoxBone` | 3 个迁移方法 | 由 `setField` 的 `sideEffect` 取代 |
| `App.handleCleanGhostEntry` | 手写 delete + 落盘 + toast | `ops.removeNode` |
| `SubsystemPanel` 12 个方法 / `ConnectorPanel` 9 个方法 | 直接 `$set(this.config, …)` | `ops.setField` |
| `App.selectedSubPartConfig` 等 6 处计算属性写入 | 渲染时自动补建条目 | 删除；缺失条目由 `mark*` 建（已有）或 `setField` 的 `ensure` 选项惰性建 |
| `drag_import.importSingleFile/_applyImport` | fs + 冲突对话框 + 落盘 | `services/import.js`（IO）+ `ops.importPart`（业务） |
| `bone_resolver.resolveBoneReferences` | 仅导入时用 | `doc/refs.js`（导入/删除/重命名共用） |
| 20 处 `saveConfig()` | 各调用点自行落盘 | 事件订阅（§7.1），保留 2 处直接调用 |
| 15 处 `refreshOutlinerIcons()` / 22 处 `update_selection` | 各调用点自行刷新 | 事件订阅（§7.1） |

---

## 10. 分期与验收

### P1 — 文档层地基（纯新增，零调用方）

新增 `doc/address.js`、`doc/field_specs.js`、`doc/projection.js`、`doc/reactivity.js`、`doc/index.js`（约 700 行）。

验收：

- `bun test` 覆盖 ≥ 40 条用例：路径解析（绝对/相对/下标/通配/非法）、kind 推断、字段类型与枚举、`projection.in` 的 key 格式拦截与内部字段剥离、`projection.out` 的单元素简写。
- `npm run build` 通过，`dist` 体积增量 < 20 KB。
- **零行为变更**（无调用方）。
- 回滚点：删除 `src/doc/` 即可。

### P2 — 操作层收拢

新增 `src/ops/*`（8 文件），`src/core/operations.js` 删除；`doc/refs.js` 由 `bone_resolver.js` 升级；UI 的 44 个方法改薄。

验收：

- 每个面板字段：改一次 → 一条撤销记录，标签可读；`Ctrl+Z`/`Ctrl+Y` 正常。
- `importPart/importVariant/importSubPart/importSubsystem` 四个整件通道可用；`reset_fields` 正确。
- 拖拽导入 / 菜单导入行为不变（回归 `docs/12 §11` 矩阵 1–12 中与导入相关的条目）。
- 净减约 300 行 UI 代码。
- 同步更新 `AGENTS.md`（根 / `src/core` / `src/ui` / `src/mode`）的导入图、查找指引与"撤销"约定：`core/operations.js` → `ops/`，新增 `doc/` 层说明；顺手校正已过期的行数。
- 回滚点：`ops/` 与 `doc/refs.js` 可独立回退（调用方已改 require 路径，需一并回退）。

### P3 — 副作用总线与默认值清理

事件总线接线；`saveConfig` 20 → 2；`refreshOutlinerIcons` 15 → 1；`update_selection` 22 → 1；删除 6 处计算属性写入；清理默认值三处真源（4 个旧工厂改 `Codec.decode`，删 `config.js` 内联块与 `config_defaults.js`，`element_markers` 移出 `PartCodec`）。

验收：

- `Ctrl+S` 落盘时机与内容不变（对比 `.mm_project.json` 前后）。
- 未选中元素时渲染不修改配置（用一个只读快照断言）。
- 新建碰撞箱的 `material` 与导入的默认值一致（`machine_max:default`）。
- 回滚点：事件订阅可关；默认值清理单独 commit。

### P4 — `services/` 抽离

`export_pipeline` → `services/export.js`；`drag_import` 的 IO → `services/import.js`；三个 pack 对话框的 fs → `services/pack.js`。纯搬移，行为不变。

验证：导出产物与搬家前逐字节一致（对同一工程连续导出比对 hash）。

### P5 — MCP 工具注册

见 [docs/12](./12-MCP工具接入.md)。本层不再改动。

---

## 11. 测试策略

`test/` 目录（新增，`bunfig.toml` 已存在）：

```
test/
├── mocks/blockbench.js     # 全局 Blockbench/Undo/Group/Locator/Vue 的桩
├── helpers.js              # 造配置树、读快照
├── doc/address.test.js
├── doc/field_specs.test.js
├── doc/projection.test.js
├── ops/*.test.js           # 每个操作：成功 / 校验失败 / 撤销记录数
└── services/export.test.js
```

`doc` 与 `ops` 是纯函数（配置对象进、结果出），不需要 Blockbench 运行时；`runConfigEdit` 用 `mocks/blockbench.js` 里的假 `Undo` 记录调用次数。

---

## 12. 与 docs/12 的接口契约

本层为 MCP 提供：

| 能力 | 提供者 | 说明 |
|---|---|---|
| 路径解析 | `doc/address` | `read_node` / `set_node` / `remove_node` 共用 |
| 字段规格与归一化 | `doc/field_specs` | `set_node` 的白名单与类型错误 |
| 投影 | `doc/projection` | `read_node(as='definition')` 与四个 `import_*` |
| 引用解析与清理 | `doc/refs` | `remove_node` / `bind_marker` 的连带动作 |
| 整件通道 | `ops.importPart/Variant/SubPart/Subsystem` | 四个具名工具 |
| 结构化错误 | 统一信封 | `docs/12 §5.3` |
| 变更事件 | `mm_config_changed` | MCP 侧 `persist: false` |

MCP 侧**不得**绕过这些函数直接改配置，也不再自己实现撤销包装（`docs/12` 旧的 `mcp/run.js` 设计已废弃）。

---

## 13. 决策记录

| # | 决策 | 结论 | 依据 |
|---|---|---|---|
| D1 | 抽象粒度 | 字段规格表 + 通用 path API（非"一控件一 op"、非全量 command bus） | 避免 130 个镜像控件的函数；寻址是 MCP 唯一真需要的抽象 |
| D2 | 副作用归属 | ops 只发事件，UI 订阅做刷新/落盘 | 唯一能同时满足"UI 要落盘"与"AI 不落盘" |
| D3 | 错误信封 | 结构化 `errors[]`，保留 `error` 字符串兼容 | 30+ 调用点渐进改，MCP 必须结构化 |
| D4 | 文件系统用例 | 抽到 `services/`，不进撤销、不暴露 MCP | 写盘不可撤销，与安全边界冲突 |
| D5 | Vue 耦合 | `doc` 不 require Vue，改为注入 | core/doc 不依赖全局，Node 可测 |
| D6 | 测试基建 | P1 起补 `bun test` | doc/ops 纯函数，唯一能规模化自测的部分 |
| D7 | MCP 工具定义 | 手写（工具数 ≤ 15） | codegen 的收益在 15+ 工具时才对冲成本 |
| D8 | 整件通道形态 | **按 kind 拆成具名工具/函数**（`importPart` / `importVariant` / `importSubPart` / `importSubsystem`） | 每个 call site 的参数 schema 可精确到该 kind；AI 更易理解 |
| D9 | 小件整件通道 | **本期不做** `hit_box` / `interact_box` / `connector` 整件通道 | 字段少、key 与 UUID 纠缠、替换收益低于风险；注册表留位 |
| Q1 | 内容包定义 JSON | 保持只读，不纳入业务层 | 写盘 + 不可撤销 |
| Q2 | 交付形态 | 拆两串：先"配置文档层"，后"MCP 工具" | 第一串不引用任何 MCP 代码，可独立验收 |

---

## 14. 明确不做

| 不做 | 原因 |
|---|---|
| 为每个 UI 控件造一个 op | 只是把耦合从 UI 搬到 ops，还丢失寻址抽象 |
| 把导出/导入/建包塞进 ops | async + 写盘 + 不可撤销，混层会破坏"MCP 不落盘"的结构保证 |
| 完整 command bus + 从元数据 codegen zod schema | 工具数 ≤ 15 时收益不足（D7） |
| 一次性重写 `App.vue.js` | 1,883 行，回归面过大；按字段/集合/重命名分三批 |
| 集中化 112 处 toast | 需要消息目录（i18n），超出范围 |
| 立即删除 `wrapMethodMap` | 过渡期双保险，P2 全部落地后再删 |
| 内容包定义 JSON 的编辑通道 | Q1 |

---

## 15. 风险与回滚

| 风险 | 影响 | 对策 |
|---|---|---|
| Vue 观测不到注入前的直接赋值 | 面板不刷新 | P3 前保留 `refreshOutlinerIcons` 兜底；注入在 `mode.js onSelect` 完成 |
| 删除计算属性写入后，存量"标记有、配置无"的数据不再自动补建 | 子零件面板空白 | `setField` 提供 `ensure: true` 惰性建；`loadConfig` 时对存量数据做一次补建迁移 |
| 整件替换丢字段（`decode` 补默认） | 用户/AI 意外重置 | `reset_fields` 回传 + 工具描述明示；`mode:'replace'` 需显式传 |
| 批量导入的撤销粒度回退 | 一次拖入多文件退 N 次 | 冲突决策在**开记录前**解析完（修 `drag_import` 现存缺陷） |
| 投影深拷贝大件开销 | 大工程卡顿 | 投影只在 `import_*` / `read_node(as='definition')` / 导出时做，路径写入走引用不拷贝 |
| P2 与 P3 交叉冲突 | 重复改动同一批文件 | P2 只碰"写配置"，P3 只碰"副作用"，文件重叠但行区间不同 |

---

## 16. 参考资料

- 撤销接入：[docs/11-接入Blockbench原生撤销.md](./11-接入Blockbench原生撤销.md)
- MCP 工具：[docs/12-MCP工具接入.md](./12-MCP工具接入.md)
- Codec 体系：[docs/08-序列化反序列化-Codec体系重构.md](./08-序列化反序列化-Codec体系重构.md) / [src/codec/AGENTS.md](../src/codec/AGENTS.md)
- 校验：[docs/10-校验与错误提示重构实现计划.md](./10-校验与错误提示重构实现计划.md) / [src/mode/validation.js](../src/mode/validation.js)
- 现有整件通道：[src/import/drag_import.js](../src/import/drag_import.js) + [src/import/bone_resolver.js](../src/import/bone_resolver.js)
