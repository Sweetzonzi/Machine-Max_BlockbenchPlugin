# MCP 工具接入（Blockbench MCP Tools）

> 状态：**设计稿（待实现）** · 日期：2026-10-20 · 范围：`src/mcp/`（新增）+ `src/plugin.js`（两行接入）
> 目标版本：v0.5.0 · 前置依赖：[docs/13-业务逻辑层与配置文档API.md](./13-业务逻辑层与配置文档API.md) **v3**（P1–P4 必须先落地）
> 参照：[docs/11-接入Blockbench原生撤销.md](./11-接入Blockbench原生撤销.md) / [docs/08-序列化反序列化-Codec体系重构.md](./08-序列化反序列化-Codec体系重构.md) / [docs/10-校验与错误提示重构实现计划.md](./10-校验与错误提示重构实现计划.md)

---

## 1. 背景与目标

插件当前对外的操作入口只有 UI：4 个工具栏 Action（校验 / 导出 / 新建零件 / 项目管理）加右键菜单、面板、对话框，全部依赖人点。AI 客户端无法触达内容包制作流程。

目标：通过 **Blockbench MCP 插件**的 `MCP_QUEUE` 扩展点，把「读配置、改配置、校验」暴露为 MCP 工具，让 AI 客户端在编辑器内直接编辑零件定义——与人在面板上操作等价，同样进原生撤销栈（见 [docs/11](./11-接入Blockbench原生撤销.md)），同样由人在确认后保存。

**本文件只负责「协议适配」这一层**：参数形状、工具的注册与生命周期、返回信封、安全边界。所有业务语义（寻址、字段规格、投影、引用解析、撤销边界）由 [docs/13](./13-业务逻辑层与配置文档API.md) 交付的 `src/doc/` 与 `src/ops/` 提供。工具层**不自己实现**撤销包装、路径解析或字段校验——docs/13 的 P1–P4 未落地前，本文件任一工具都无法实现。

范围边界：

| 做 | 不做 |
|---|---|
| 读配置树、读上下文、读校验结果 | 写磁盘、建内容包、删文件 |
| 改配置字段、导入整件定义、增删实例、绑定标记（可撤销） | 导出、按路径导入文件、批量生成内容包 |
| 校验并返回结构化问题 | 调用 `risky_eval`、执行任意脚本 |

写盘类操作留给制作者在 UI 上完成：工具改完内存态后，`Project.saved` 变脏，人按 `Ctrl+S` 落盘、按「导出内容包」写内容包。这既是安全边界，也让 AI 的每次编辑都可被人眼复核后再落地。

---

## 2. 外部依赖与协议

| 项 | 值 |
|---|---|
| MCP 插件 | Blockbench MCP `v1.10.1`（作者 Jason J. Gardner，GPL-3.0） |
| 宿主 | Blockbench 桌面端 5.0.7（插件要求 desktop，web 端无 Node 能力） |
| 端点 | `http://127.0.0.1:3000/bb-mcp`（Streamable HTTP；端口与路径在 Settings → General 的 MCP Server Port / Endpoint） |
| 内置工具 | 94 个（方块/网格/贴图/材质/动画/粒子/截图/导出等），本插件工具与之共命名空间 |
| 扩展点 | 全局 `MCP_QUEUE` 数组 + `globalThis.MCP` API（[官方 docs/plugin.md](https://github.com/jasonjgardner/blockbench-mcp-plugin/blob/main/docs/plugin.md)） |

`globalThis.MCP` 的实际成员（在运行中的 5.0.7 上反查所得）：

```
version, z, registerTool, exposeAction, unregisterTool, listTools, runUndoableEdit, createJsonResult
```

| 成员 | 用途 |
|---|---|
| `MCP.z` | MCP 插件自带的 zod 实例，参数 schema 必须用它构造 |
| `MCP.registerTool(spec)` | 注册一个工具，返回 disposer |
| `MCP.exposeAction(actionId, opts)` | 把一个既有 Blockbench Action 直接发布成工具 |
| `MCP.unregisterTool(name)` | 注销工具 |
| `MCP.runUndoableEdit(aspects, label, edit)` | `Undo.initEdit` / `finishEdit` 的薄包装，失败时尝试回滚 |
| `MCP.createJsonResult(obj)` | 构造结构化返回（`structuredContent`） |

`execute` 的第二个参数是执行上下文（含 `reportProgress`），长任务可上报进度。协议细节以官方 `docs/plugin.md` 为准。

> 本插件**不使用** `MCP.runUndoableEdit`：撤销边界在 `ops` 层的 `runConfigEdit` 内部（docs/11），
> 由工具层再包一层会产生嵌套记录。

---

## 3. 架构与文件布局

```
src/doc/                 # docs/13 交付：寻址 / 字段规格 / 投影 / 引用 / 原语
src/ops/                 # docs/13 交付：29 个业务操作（含 4 个整件通道）
src/core/undo.js         # 已实现：撤销桥 + runConfigEdit / withUndoEdit / wrapMethodMap（docs/11）

src/mcp/
├── index.js             # registerMcpTools() / unregisterMcpTools()：从 MCP_QUEUE 挂载
├── tools.js             # 工具注册表：{name, description, params, condition, execute}
├── params.js            # zod 参数形状（每个工具一段），与 tools.js 一一对应
└── result.js            # 统一返回信封：ops 结果 → MCP.createJsonResult
```

工具层的一行实现（例如 `set_node`）大致是：

```js
function setNode(config, args) {
    var r = ops.setField(config, {
        path: args.path,
        value: args.value,
        source: 'mcp',
        persist: false,
    });
    return result.from(r, { path: args.path });
}
```

`src/plugin.js` 的 `onload` 追加一行，位置在 `registerMode()` 之后、`showToast(...)` 之前：

```js
require('./mcp/index.js').registerMcpTools();
```

撤销桥的 `registerUndoBridge()` / `unregisterUndoBridge()` 由 `plugin.js` 直接调用（docs/11），MCP 侧不重复注册。`onunload` 里追加 `unregisterMcpTools()`。

---

## 4. 数据模型与路径寻址

### 4.1 配置树

形态由 Codec 定义（[src/codec/codecs/](../src/codec/codecs/)）：

```
config
├─ $schema_version, modelFile, contentPackPath, dependencyPaths[], packMeta
├─ _uiState { activePartId, activeVariantName }        ← 不可寻址写（用 set_active）
└─ parts { <partId> → PartConfig
     ├─ icon, vehicle_durability_rate, …, max_stack_size
     ├─ element_markers { <variant> → { <uuid> → { type, config_ref } } }   ← 编辑器内部，不可寻址
     └─ variants { <variant> → VariantConfig
          ├─ model, textures, animations, tags[]
          └─ sub_parts { <spKey> → SubPartConfig
               ├─ start_bone, end_bones[], durability, mass, mass_center,
               │  projected_area[3], block_collision, collision_height,
               │  climb_assist, hydro_priority
               ├─ hit_boxes { <uuid|骨骼名> → HitBoxConfig }
               ├─ interact_boxes { <interact.<ns>.<name>> → InteractBoxConfig }
               ├─ connectors { <connector.<ns>.<name>> → ConnectorConfig }
               └─ subsystems { <subsystem.<ns>.<name>> → SubsystemConfig }
```

`sub_parts` 的 key **必须**是 `sub_part.<ns>.<name>`（docs/13 §5.1.3，D16）；`interact_boxes` / `connectors` / `subsystems` 规范写法见同一节，v3 只对子零件强制。

### 4.2 路径语法

完整规范见 docs/13 §5.1。协议层只暴露一种语法：**段数组**（含点的 key 天然是一段）；也接受 RFC 6901 JSON Pointer 字符串作为简写。

| 形式 | 示例 | 说明 |
|---|---|---|
| 段数组（主） | `["parts","hull","variants","default","sub_parts","sub_part.machine_max.chassis","mass"]` | 无歧义；MCP 的 `array` 参数直接传 |
| JSON Pointer | `"/parts/hull/variants/default/sub_parts/sub_part.machine_max.chassis/mass"` | 分隔符是 `/`，`~0`/`~1` 转义 |
| 相对（省前缀） | `["sub_parts","<sp>","mass"]` | 工具内部补 `parts.<activePart>.variants.<activeVariant>`；**没有** `..` 段 |
| 数组下标 | `[…,"projected_area",1]` | 纯数字段 |
| 通配 | `["sub_parts","*","durability"]` | `*` 是**整段 token**，至多一个，只能出现在 map 层；结果按该层 key 收起 |

`parts` 下合法示例（旧版的 `subsystems.engine.mass` 不合法，subsystem 没有 `mass` 字段）：

```jsonc
["sub_parts", "sub_part.machine_max.chassis", "mass"]                 // 25
["sub_parts", "sub_part.machine_max.chassis", "projected_area", 1]    // 0.8
["sub_parts", "sub_part.machine_max.chassis", "subsystems", "subsystem.machine_max.engine", "definition"]
```

**协议级约束**：

- `_uiState` 与 `element_markers` 不可寻址写 → 返回 `unknown_field`；切上下文用 `set_active`。
- `hit_boxes` 的 key 在对外格式里是**骨骼名**、内存里是 **UUID**：`read_node` / `set_node` 两种写法都接受，内部归一化为 UUID 并回写为骨骼名；解析不到元素时只记 `unresolved_bones` warning。
- 含点的 key（`sub_part.machine_max.main`）是**默认情况**，不是例外：任何字符串形式的拆分都不得按 `.` 切分。段数组与 JSON Pointer 都按 `/`/段位置解析，不存在「猜切分」。
- 所有翻译键（子零件/连接点/子系统/交互区）只允许 ASCII：中文、空白返回 `invalid_format`；前缀形态不合规范只告警（docs/13 §5.1.3，D17）。

---

### 4.3 kind 与工具映射

| kind | Codec | 读取 | 创建/整件写入 | 删除 |
|---|---|---|---|---|
| `part` | `PartCodec` | `read_node` | `import_part` | `remove_node` |
| `variant` | `VariantCodec` | `read_node` | `import_variant` | `remove_node` |
| `sub_part` | `SubPartCodec` | `read_node` | `import_sub_part` | `remove_node` |
| `subsystem` | `SubsystemDispatchCodec`（当前 22 种，`type` 形如 `machine_max:engine`；D18 删除 5 个 WIP 后 17，D13 补 `track_controller`/`track_drive` 后 19；上游 builtin 为 **19**，见 docs/13 §3.2） | `read_node` | `import_subsystem` / `add_instance` | `remove_node` |
| `hit_box` | `HitBoxCodec` | `read_node` | `add_instance` | `remove_node` |
| `interact_box` | `InteractBoxCodec` | `read_node` | `add_instance` | `remove_node` |
| `connector` | `ConnectorCodec` | `read_node` | `add_instance` | `remove_node` |

- 5 个 WIP 类型（`battery`/`signal_convert`/`joint`/`javascript`/`ammo_loader`）已按 D18 **删除**：不在 `SubsystemDispatchCodec` / `subsystem_types.js` / 面板中，`import_subsystem` 返回 `unknown_type`，`set_node` 同样拒绝；无兼容层。
- `read_node` 读 `subsystems` / `connectors` / `interact_boxes` 时，返回的映射**以完整翻译键为键**，不是短名。
- `hit_box` / `interact_box` / `connector` **没有整件通道**（决策 D9）：字段少（4–7 个）、key 与骨骼 UUID 纠缠，整件替换收益低于风险，用 `add_instance` + `set_node` 组合即可。

---

## 5. 工具清单

全部 12 个工具共用同一个可用性条件：

```js
condition: { project: true, modes: ['machine_max_part'] }
```

工具名统一以插件 id 前缀开头（`machine_max_bb_plugin_`），避开 94 个内置工具的名字空间（重名会在注册时抛错）。下表省略前缀。

### 5.1 只读（3）

| 工具 | 参数 | 返回 |
|---|---|---|
| `get_context` | — | `{ project, active: { part, variant }, parts: [...], variants: [...], selection: [{ uuid, name, marker }] }` |
| `read_node` | `path`, `as?: 'raw'\|'definition'` | `{ ok, path, kind, value }`；`as='definition'` 时走 `projection.out(..., {for:'read'})`：UUID→骨骼名、剥瞬态、保留默认值、**不折叠 `sub_parts`** |
| `validate` | `only_introduced?: bool` | `{ ok, count, issues: [{ severity, code, message, path }] }` |

`validate` 复用 `collectIssues(config)`（[src/mode/validation.js:180](../src/mode/validation.js)），与原生问题清单同源。`only_introduced` 与上一次工具调用的结果做 diff（§7.2）。

### 5.2 细粒度编辑（4，全部进撤销栈）

| 工具 | 参数 | 行为 |
|---|---|---|
| `set_node` | `path`, `value` | 写标量/数组/对象。走 `ops.setField`：字段白名单、**严格类型（不做隐式转换）**、副作用（如 `start_bone` 迁移标记）、一条撤销记录。返回 `before`/`after` 与本次引入的问题 |
| `remove_node` | `path`, `cascade?: bool` | 删除节点，清理指向它的引用：4 类 `element_markers[*][uuid].config_ref`、`signal_targets[*][]`（子系统/连接点/交互区三处，`local`/`global` 不动）、`connectors[*].power_target`、`subsystems[*].power_output`、`hit_boxes[*].subsystem`、`subsystems[*].connector / locator / dismount_locators[]`。**不清理** `signal_translations`（频道→频道，不是节点引用）与 `definition`（资源位置）。返回 `cleaned_references` |
| `bind_marker` | `uuid`, `type`, `config_ref?` | 把元素绑成 `sub_part` / `hit_box` / `interact_box` / `connector`，内部走 `ops.bindMarker`（`setMarker` + `recalcAutoEndBones`）。`hit_box`/`interact_box`/`connector` 的 `config_ref` 由上下文推导 |
| `set_active` | `part`, `variant?` | 切 active 上下文（等价于 UI 里点一下）。**不进撤销栈**：这是视图状态，不是工程内容 |

### 5.3 整件编辑（4，全部进撤销栈）

四个工具同构：一次调用替换一个节点子树，**省略的字段被重置为默认值**（对应 `Codec.decode` 的补默认行为）。

| 工具 | 参数 | 挂载点 |
|---|---|---|
| `import_part` | `part_id`, `definition?`, `mode` | `parts.<part_id>` |
| `import_variant` | `variant`, `definition`, `parent_part?`, `mode` | `<part>.variants.<variant>` |
| `import_sub_part` | `key`, `definition?`, `parent_variant?`, `mode` | `<variant>.sub_parts.<key>` |
| `import_subsystem` | `key`, `definition`, `parent_sub_part`, `mode` | `<sub_part>.subsystems.<key>` |

```jsonc
// key 规范（docs/13 §5.1.3）
"sub_part.machine_max.chassis"        // ✅
"chassis"                             // ❌ invalid_format（import_sub_part，docs/13 D16）
"sub_part.machine_max.底盘"            // ❌ invalid_format（非 ASCII，docs/13 D17）
```

`part_id` / `variant` 不是翻译键，只校验非空与保留字符；`key`（sub_part）必须是规范 key，`mode:'create'` 省略 `key` 时由 `ensureUniqueName` 生成规范默认名（`sub_part.<ns>.main`）。`import_subsystem` 的 `key` 建议写成 `subsystem.<ns>.<name>`：完整 key 是模组侧信号目标的匹配依据（docs/13 §5.4）。

`PartCodec` **没有 `id` 字段**：`import_part` 的 `part_id` 只作为 `parts` 的 map key，不会写进定义体。

`mode` 取值：

| mode | 已存在时 | 形态 |
|---|---|---|
| `create` | `ok:false, code:duplicate_name` | `key` 可省略 → 自动命名（`ensureUniqueName`） |
| `replace` | 整体替换，返回 `reset_fields` | 必须给 `key` |
| `rename` | 替换并改用 `key`（旧节点的引用同步改写） | 必须给 `key` 与已存在的旧 key |
| `reject` | 与 `create` 同义（默认值） | — |

`mode:'rename'` 额外需要 `old_key`（已存在的旧 key）；`key` 为新 key，旧 key 的全部引用由 `doc.refs.renameRefs` 同步改写。

`import_*` 返回：

```json
{ "ok": true, "kind": "sub_part", "key": "sub_part.machine_max.chassis", "action": "created",
  "reset_fields": [],
  "unresolved_bones": [{ "bone": "suspension_rear", "field": "start_bone" }],
  "introduced_issues": [] }
```

`reset_fields` 列出「替换前存在、本次未提供、被重置为默认值」的字段——这是整件语义唯一的安全网，AI 与人都能看出漏了什么。

### 5.4 剩余创建通道（1）

`add_instance` 只服务三个小件（决策 D9 的落地）：

| 参数 | 取值 |
|---|---|
| `parent_path` | 子零件路径：完整段数组（如 `["parts","hull","variants","default","sub_parts","sub_part.machine_max.chassis"]`）、等价 Pointer，或相对段 `["sub_parts","<sp>"]` |
| `kind` | `hit_box` \| `interact_box` \| `connector` |
| `key` | 可选：`hit_box` 为骨骼名（必填），`interact_box`/`connector` 省略则自动命名 |
| `definition` | 该 kind 的必填字段（`hit_box` 需 `type`，`interact_box` 需 `bone`，`connector` 需 `locator`） |

`part` / `variant` / `sub_part` / `subsystem` 的新建走各自的 `import_*` + `mode:'create'`，不再有 `add_instance` 分支。

`add_instance` 内部调用 `ops.addInstance(parentPath, kind, key?, definition?)`：**一次** `runConfigEdit` 内完成「建配置条目 + 建标记 + 解析引用 + 写 definition」，因此只有一条撤销记录（docs/13 §6.3）。它要求目标元素已存在于模型里（`hit_box` 用骨骼名定位，`interact_box` 用骨骼、`connector` 用 Locator）；若元素不存在，返回 `code:not_found`，`hint` 提示先建模型元素或改用 `bind_marker`。

### 5.5 返回信封

统一走 `OpResult`（完整契约见 **docs/13 §12**），工具层只做字段裁剪与 `MCP.createJsonResult` 包装：

```json
{ "ok": true,
  "path": ["sub_parts", "sub_part.machine_max.chassis", "mass"],
  "before": 25, "after": 40, "changed": true,
  "unresolved_bones": [], "introduced_issues": [] }
```

```json
{ "ok": false,
  "error": "mass 期望 number，收到 string",
  "errors": [{ "path": ["sub_parts", "sub_part.machine_max.chassis", "mass"], "code": "type_mismatch",
               "expected": "number", "got": "\"abc\"", "hint": "去掉引号" }] }
```

整件通道额外返回 `reset_fields`（被重置为默认值的字段）、`cleaned_references`（被清理的引用）；`subsystem.type` 切换额外返回 `dropped_fields`。

失败一律 `ok: false` 且**不抛异常**（工具层捕获后转成结构化错误），避免 MCP 客户端把一次参数错误渲染成协议失败。错误码全集见 docs/13 §12。

`introduced_issues` 只做**提示**：新建子零件没有碰撞箱、子系统尚未选型号都会出现在这里，属正常中间态（docs/13 §4）。AI 不应据此判定调用失败，也不应自动补全。

---

## 6. 参数校验

三层，顺序固定（全部下沉到 doc 层，工具层只做第一层）：

1. **形状**（工具层）：`MCP.z.object({...})` 声明参数类型与必填项，MCP 插件在调用 `execute` 前完成解析（含默认值）。
2. **路径**（`doc/address`）：按位置逐段校验（docs/13 §5.1.1）——map 层的下一段永远是 key，record 层的下一段必须是字段名；`*` 至多一个且只在 map 层；数组下标不越界；`_uiState`/`element_markers` 拒写。`set_node` 允许最后一段是 map 的新 key（`allowMissingLeaf`），但 record 的未知字段一律 `unknown_field`。
3. **值**（`doc/field_specs`）：白名单与类型来自 `src/doc/field_specs.generated.js`——由 builtin schema codegen 得到（docs/13 §5.2、§3），**不从 `Codec.decode` 派生**（宽松 decode 会带出 `element_markers` / `_uuid` 等内部字段）。枚举直接取 schema，例如 `block_collision ∈ {'true','false','ground'}`、`interact_box.condition ∈ {AND,OR,NAND,NOR,XOR,XNOR}`、`hit_box.type ∈ {box,sphere,cylinder,capsule,wheel}`。**默认 strict，不做隐式转换**：`mass: "12.5"` 返回 `type_mismatch`，不自动转数字（UI 输入框在调用前自行归一化）。

完整性（`required`、`hit_boxes` 非空、型号必选）**不在写入期校验**：新建子零件没有碰撞箱是合法中间态，由 `validate` 与导出闸门处理（docs/13 §4）。

未知字段按 Codec 的宽松语义保留并原样回传，避免把手工写的扩展字段吃掉；但**整件通道会先剥内部字段**（`element_markers` / `_uuid` / `_marker_uuid` / `_unresolved_bones` / `auto_end_bones`），这是 docs/13 §5.3 的落地点。

---

## 7. 编辑语义

### 7.1 撤销

每个编辑工具的执行体形如：

```js
async execute({ path, value }) {
    const r = ops.setField(getConfig(), {
        path: path,
        value: value,
        source: 'mcp',
        persist: false,     // 不落盘：由 UI 订阅者决定（docs/13 §7.1）
        strict: true,       // 占用 / 快照超限 → 抛错给客户端，而不是静默降级
    });
    return MCP.createJsonResult(result.from(r, { path: path }));
}
```

`runConfigEdit` 来自 [src/core/undo.js](../src/core/undo.js)（设计见 [docs/11](./11-接入Blockbench原生撤销.md)）：`Undo.current_save` 占用检查、失败回滚、快照上限、嵌套合并、空记录丢弃。撤销栈是 Blockbench 原生的，人按 `Ctrl+Z` 就能退回 AI 的每一次修改。

注意入口是**同步**的：`execute` 可以是 async，但不要把 `runConfigEdit` 包进 Promise 队列，否则 `onConfirm` / UI 调用链里的同步语义会丢。

### 7.2 编辑后自检

每次编辑在**同一个撤销记录内**完成后，立即跑两件事：

1. 用 `collectIssues(config)` 重新收集问题；
2. 与编辑前的问题集合 diff，只回本次**新引入**的问题（按键 `severity|code|path|message` 判等）。

这样「改完发现引用悬空」「sub_part 没有起始骨骼」能在工具返回里直接看到，而不必等导出才暴露。`validate({only_introduced: true})` 是同一实现的独立入口。

### 7.3 整件语义

`import_*` 是**整体替换**，不是「合并」：

- 省略的字段 → 重置为该 kind 的 Codec 默认值（`reset_fields` 会列出来）；
- 被替换节点的子树整体丢弃（例如替换一个 variant 会丢掉它下面所有 sub_parts）；
- 替换后重新解析引用：**配置引用**（`power_output` / `hit_box.subsystem` / `power_target` / `signal_targets`）指向不存在的节点 → `ok:false`、`code:unresolved_config_ref`；**骨骼引用**（`start_bone` 等）未解析 → `unresolved_bones` warning，照常写入；
- 一条撤销记录退掉整次替换。

AI 的正确用法是「`read_node(path, as='definition')` 拿全量 → 改 → 整件回传」，而不是「只给要改的部分」。工具描述里必须写清这条，否则它会用整件通道做局部修改，把字段重置成默认值。

**撤销粒度固定**：MCP 的每次调用都是独立记录，**不参与 800ms 同标签合并**（`source === 'mcp'` 时强制 `coalesce:false`，docs/13 §6.4）。所以连续三次 `set_node` 就是三条记录，与 §11.3 #17 一致。

### 7.4 不写盘

工具不调用 `saveConfig()`、不碰 `fs`、不调 `executeExport`。理由：

- 磁盘写入是**不可撤销**的动作，与「编辑可撤销」的设计目标冲突；
- `.mm_project.json` 侧载文件由 `saveConfig()` 在保存时自动维护，工具插手会造成两份状态；
- 人按 `Ctrl+S` 保存前可以先目视检查，AI 的改动始终处于「可复核」状态。

`Project.saved` 由 `Undo.finishEdit` 置为 `false`，标题栏出现未保存标记，这是给制作者的信号。技术上由 `ops` 的 `persist: false` 保证（docs/13 §7.1）——UI 的订阅者看到 `persist !== false` 才落盘。

---

## 8. 明确不做

| 不做 | 原因 | 替代 |
|---|---|---|
| `export_pack` / `export_model` 类写盘工具 | 不可撤销、会覆盖内容包 | 人在「导出内容包」对话框操作 |
| **按路径**导入（`import_part_from_path`） | 读任意路径 + 批量写结构，属于 fs 副作用 | 用 `import_part` 传内联定义；或人拖拽导入 |
| `save_config` | 落盘归人 | `Ctrl+S` |
| `risky_eval` 代理 | 等价于把任意 JS 交给客户端 | 不提供 |
| 建/删内容包目录 | 文件系统副作用 | 人在 UI 操作 |
| `hit_box`/`interact_box`/`connector` 的整件通道 | 字段少、key 与 UUID 纠缠（决策 D9） | `add_instance` + `set_node` |
| 改 `_uiState` 之外的视图状态（相机、模式） | 与工程内容无关 | 用内置的 `set_mode` / `set_camera_angle` |
| 内容包定义 JSON 的读写 | 定义文件由作者直接编辑；写盘不可撤销（决策 Q1） | 人在编辑器外改；工具只读合并视图 |
| 5 个 WIP 子系统类型 | D18 已删除（不在 Codec / registry / 面板），调用返回 `unknown_type` | 用 19 种正式类型；需要旧类型只能停留旧版本 |

> 与旧版差异：`import_part` 由「不做」改为「做」，但边界从「按文件路径」收紧为「内联 JSON」——不触达 fs，仍落在原来的安全模型内。

`export_preview`（只读：返回「如果现在导出会写出什么 JSON」，不落盘）留作后续扩展，见 §13。

---

## 9. 安全模型

对上工具的调用方是整个本机：

- **监听范围**：MCP 插件默认只绑定 `127.0.0.1` 与 `::1`，非 loopback 的 `Origin` / `Host` 请求返回 403（含 DNS rebinding 防护）。把监听地址设为 `0.0.0.0` 会放开 `Host` 检查，属明确的风险操作，不建议。
- **无鉴权**：任何能连上端口的本机进程都能调用全部工具，包括内置的 `risky_eval`。工具侧不能假设调用方可信，因此所有参数都在服务端（Blockbench 进程内）重新校验，路径与值的白名单不依赖客户端。
- **`risky_eval`**：MCP 插件默认把它暴露给客户端。若不需要，在 Settings → General 清除 Enable risky_eval，客户端会看不到该工具。本插件的工具不依赖它。
- **范围限制**：`condition` 限定在 `machine_max_part` 模式且必须有打开的项目，模式外调用不会被路由到执行体。
- **写盘边界**：工具层与 `ops` 层都不含 fs 调用；`services/` 的写盘能力不注册为工具（docs/13 §8）。

---

## 10. 注册时序与生命周期

1. Blockbench 加载 `dist/machine_max_bb_plugin.js` → `onload`。
2. `registerProperty()` → `registerUndoBridge()`（挂两个 undo 事件，docs/11 已实现）→ `registerMode()` → `registerMcpTools()`。
3. `registerMcpTools()` 把 `{ plugin: 'machine_max_bb_plugin', setup(mcp) {...} }` 推进 `globalThis.MCP_QUEUE`，并记下每个工具的 disposer。
4. MCP 插件（无论先加载还是后加载）会 drain `MCP_QUEUE` 并调 `setup(mcp)`；之后已连接的客户端收到 `tools/list_changed`，新工具即刻可用，不需要重启 Blockbench。
5. 插件卸载 → `onunload` 调 disposer 注销工具；撤销桥监听由 `unregisterUndoBridge()` 单独清理。

幂等：MCP 插件重载会重跑队列；工具注册以名字为键，重复 `setup` 前先 `unregisterTool` 同名工具，避免「duplicate name」抛错。

---

## 11. 构建与验证

### 11.1 构建

```bash
npm run build      # scripts/build.js → dist/machine_max_bb_plugin.js（esbuild，IIFE）
```

Blockbench 里 File → Plugins 重载本插件，MCP 端点不变。

### 11.2 探针

```powershell
# 列出全部工具，筛出本插件的
./bb-mcp.ps1 -ListTools | Select-String machine_max_bb_plugin

# 直接调用
./bb-mcp.ps1 -Tool machine_max_bb_plugin_get_context
./bb-mcp.ps1 -Tool machine_max_bb_plugin_validate
```

（`bb-mcp.ps1` 是一个 40 行的 Streamable HTTP 客户端脚本：`initialize` 取 `Mcp-Session-Id`，再发 `tools/list` / `tools/call`。）

### 11.3 验证矩阵

| # | 场景 | 期望 |
|---|---|---|
| 1 | 非 `machine_max_part` 模式下列工具 | 工具不可见（`tools/list` 不含） |
| 2 | 无打开项目时调用 | 工具不可见 |
| 3 | `read_node` 读 `subsystems` 全量 | 返回完整映射，**键为完整翻译键**（`subsystem.<ns>.<name>`） |
| 4 | `read_node` 读 `["sub_parts","<sp>","hit_boxes"]`（`as='definition'`） | 键为骨骼名，无 `_uuid`；未解析的保留原 key 并出现在 `unresolved_bones` |
| 5 | `set_node` 把 `mass` 设为 `"abc"` | `ok:false`，`errors[0].expected === 'number'`，配置未变 |
| 6 | `set_node` 把 `block_collision` 设为 `ground` | `ok:true`，`before/after` 正确，`Ctrl+Z` 可退 |
| 7 | `set_node` 改 `start_bone` | 返回 `ok:true`，sub_part 标记随之迁移，Outliner 图标更新 |
| 8 | `set_node` 写 `_uiState.activePartId` | `ok:false`，`code:unknown_field` |
| 9 | `import_part` 传一个完整定义 | `ok:true`，`reset_fields` 为空，一次 `Ctrl+Z` 退回整个零件 |
| 10 | `import_sub_part` 的 key 不含前缀（`"chassis"`） | `ok:false`，`code:invalid_format`（严格规范 key，不是 `either` 启发式） |
| 11 | `import_part` 的定义里塞入 `element_markers` | `ok:true` 且 marker 未被写入（投影剥离），`read_node` 看不到该字段 |
| 12 | `import_part` 省略若干已知字段 | `ok:true`，`reset_fields` 列出被重置的字段 |
| 13 | `import_subsystem` 的 `type` 写 `engine`（缺前缀） | `ok:false`，`code:unknown_type`，`hint` 提示 `machine_max:engine` |
| 14 | `add_instance` 建 subsystem | 工具不存在该 kind（只服务三个小件）→ 参数校验失败 |
| 15 | `remove_node` 删一个被 marker 引用的 sub_part | `ok:true`，`cleaned_references` 列出被清掉的 4 类 marker 与各处目标；`signal_translations` 不变 |
| 16 | `bind_marker` 绑一个不存在的 `config_ref` | `ok:false`，不写配置 |
| 17 | 连续 3 次 `set_node` 同一字段 → `Ctrl+Z` ×3 | **三条记录**逐条回退（MCP 强制 `coalesce:false`），面板同步 |
| 18 | AI 编辑后不保存 → 关闭工程 | 弹出未保存提示（`Project.saved === false`） |
| 19 | 拖拽元素过程中调用编辑工具 | `ok:false`，提示「有未完成的编辑」 |
| 20 | 重载插件两次 | 工具仍只有 12 个，无重复注册报错 |
| 21 | `read_node(as='definition')` 读出的定义整件回传给 `import_*` | 结构等价（round-trip 无损），`reset_fields` 为空；覆盖含 `hit_boxes`、单变体、未解析骨骼、`definition:null` 的输入 |
| 22 | `import_sub_part` 建一个没有 hit_boxes 的子零件 | `ok:true`（合法中间态），`introduced_issues` 含「碰撞箱为空」；此时**导出被拦** |
| 23 | 子系统未选型号就导出 | 导出被阻断，对话框列出该问题并可点击定位 |
| 24 | `import_subsystem` 用 `machine_max:battery`（已删除） | `ok:false`，`code:unknown_type`（D18） |
| 25 | `signal_targets` 写 `subpart` / `vehicle` | `ok:false`，`code:unresolved_config_ref`（D19：旧值不存在，不告警） |

---

## 12. 使用示例（prompt → 工具序列）

**例 1：把选中的 3 个 cube 标成底盘起点**

```
machine_max_bb_plugin_get_context                   → selection: [cube_12, cube_13, cube_14], active: {hull, default}
machine_max_bb_plugin_import_sub_part               → key: sub_part.machine_max.chassis, mode: create
machine_max_bb_plugin_bind_marker  ×3               → uuid: cube_1x, type: sub_part, config_ref: sub_part.machine_max.chassis
machine_max_bb_plugin_validate                      → introduced_issues: []
```

**例 2：重做整个底盘（三轴结构）**

```
machine_max_bb_plugin_read_node   { path: ["sub_parts"], as: "definition" }    → 拿到全量定义（map，key 为规范 key）
   …AI 改 JSON：新增两根挂载骨骼、调整投影面积…
machine_max_bb_plugin_import_sub_part { key: "sub_part.machine_max.chassis",
                                        definition: {…}, mode: "replace" }
   → { ok:true, reset_fields: [], unresolved_bones: [...] }
machine_max_bb_plugin_validate    { only_introduced: true }
```

**例 3：给底盘加一个电机子系统并引用既有定义**

```
machine_max_bb_plugin_import_subsystem { key: "subsystem.machine_max.motor_main",
                                         parent_sub_part: "sub_part.machine_max.chassis",
                                         definition: { type: "machine_max:motor",
                                                       definition: "machine_max:medium_motor",
                                                       power_output: "subsystem.machine_max.transmission_main" },
                                         mode: "create" }
machine_max_bb_plugin_validate
```

`power_output` 必须是同一子零件内的**完整 key**（这里是 `subsystem.machine_max.transmission_main` 或某个 `connector.<ns>.<name>`），否则返回 `unresolved_config_ref`。

**例 4：批量把三个子零件的质量砍半**

```
read_node  { path: ["sub_parts", "*", "mass"] }                  → { "…chassis": 25, "…track": 40 }
set_node   { path: ["sub_parts", "sub_part.machine_max.chassis", "mass"], value: 12.5 }   ×3
validate   { only_introduced: true }
```

三个 `set_node` 落在三条撤销记录上，人按三次 `Ctrl+Z` 可以逐条退；要一次退干净，用 `import_*` 做整件替换（后续可加 `apply_patch` 复合通道）。

---

## 13. 后续扩展

| 项 | 价值 | 前提 |
|---|---|---|
| `export_preview` | 只读返回「现在导出会写出什么」，与 `spark_modules` 里的定义做 diff | 复用 `generateAllParts`（[src/generators/part_generator.js:88](../src/generators/part_generator.js)） |
| `apply_patch` | 一次调用改多个节点、一条撤销记录（跨节点批量） | `docs/13` 的投影 + 事务嵌套；先有 §11.3 的稳定性 |
| `signal_graph` | 导出信号拓扑（nodes/edges），审查 SignalChannel 路由 | 复用 `extractSignalGraph`（[src/lib/signal_graph.js:23](../src/lib/signal_graph.js)） |
| `list_defs` | 列出可用的 subsystems/connectors/materials/control_groups/projectiles 及其来源（builtin/dependency/current） | 复用 `getAvailableDefsForType` / `resolveDefSource`（[src/core/content_pack_manager.js:56](../src/core/content_pack_manager.js)） |
| `hit_box`/`interact_box`/`connector` 整件通道 | 三小件也能整件替换 | 先解决 key↔UUID 投影的易用性（决策 D9 的回访点） |
| `track_controller` / `track_drive` 支持 | 与上游 builtin 对齐（19 种；现缺 2 种） | 独立立项（D13）：补 Codec、`subsystem_types.js` 与面板动态字段；D18 已删除 5 个 WIP 类型（Codec 22→17），补完 `track_*` 后回到 19 |
| 修改前快照对比 | 编辑前后整树 diff，供 AI 自查 | 复用 `doc/projection` + diff |

---

## 14. 参考资料

- 业务逻辑层与配置文档 API（**前置依赖**）：[docs/13-业务逻辑层与配置文档API.md](./13-业务逻辑层与配置文档API.md)
- MCP 插件仓库：[jasonjgardner/blockbench-mcp-plugin](https://github.com/jasonjgardner/blockbench-mcp-plugin)（含 `docs/plugin.md` 与 `blockbench-mcp-api.d.ts`）
- 插件发布地址：`https://jasonjgardner.github.io/blockbench-mcp-plugin/mcp.js`（Blockbench 里 File → Plugins → Load Plugin from URL）
- 撤销接入：[docs/11-接入Blockbench原生撤销.md](./11-接入Blockbench原生撤销.md)
- 校验实现：[src/mode/validation.js](../src/mode/validation.js)（`collectIssues`）与 [docs/10-校验与错误提示重构实现计划.md](./10-校验与错误提示重构实现计划.md)
- Codec 体系：[docs/08-序列化反序列化-Codec体系重构.md](./08-序列化反序列化-Codec体系重构.md)
- 现有整件通道：[src/import/drag_import.js](../src/import/drag_import.js) + [src/import/bone_resolver.js](../src/import/bone_resolver.js)
