# MCP 工具接入（Blockbench MCP Tools）

> 状态：**设计稿（待实现）** · 日期：2026-10-20 · 范围：`src/mcp/`（新增）+ `src/plugin.js`（两行接入）
> 目标版本：v0.5.0 · 参照：[docs/11-接入Blockbench原生撤销.md](./11-接入Blockbench原生撤销.md) / [docs/08-序列化反序列化-Codec体系重构.md](./08-序列化反序列化-Codec体系重构.md) / [docs/10-校验与错误提示重构实现计划.md](./10-校验与错误提示重构实现计划.md)

---

## 1. 背景与目标

插件当前对外的操作入口只有 UI：4 个工具栏 Action（校验 / 导出 / 新建零件 / 项目管理）加右键菜单、面板、对话框，全部依赖人点。AI 客户端无法触达内容包制作流程。

目标：通过 **Blockbench MCP 插件**的 `MCP_QUEUE` 扩展点，把"读配置、改配置、校验"暴露为 MCP 工具，让 AI 客户端在编辑器内直接编辑零件定义——与人在面板上操作等价，同样进原生撤销栈（见 [docs/11](./11-接入Blockbench原生撤销.md)），同样由人在确认后保存。

范围边界：

| 做 | 不做 |
|---|---|
| 读配置树、读上下文、读校验结果 | 写磁盘、建内容包、删文件 |
| 改配置字段、增删实例、绑定标记（可撤销） | 导出、导入、批量生成内容包 |
| 校验并返回结构化问题 | 调用 `risky_eval`、执行任意脚本 |

写盘类操作留给制作者在 UI 上完成：工具改完内存态后，`Project.saved` 变脏，人按 `Ctrl+S` 落盘、按"导出内容包"写内容包。这既是安全边界，也让 AI 的每次编辑都可被人眼复核后再落地。

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

---

## 3. 架构与文件布局

```
src/core/
└── undo.js           # 已实现：撤销桥 + runConfigEdit / withUndoEdit / wrapMethodMap（见 docs/11）

src/mcp/
├── index.js          # 注册入口：registerMcpTools()，从 MCP_QUEUE 挂载
├── paths.js          # 路径解析/读写：点分路径、`*` 通配、相对 active 上下文
├── schema.js         # kind → Codec 映射、字段白名单、值校验与归一化
├── diff.js           # collectIssues 前后对比，算出"本次编辑引入的问题"
└── tools.js          # 8 个工具的注册实现
```

> 撤销桥已随 docs/11 落地在 `src/core/undo.js`，不再需要 `src/mcp/undo_bridge.js` /
> `src/mcp/run.js`：工具直接 `require('../core/undo.js').runConfigEdit(label, mutate, { strict: true })`
> ——`strict` 让"编辑器有未完成编辑""快照超限"这类情况抛错给 AI 客户端，而不是静默降级。

`src/plugin.js` 的 `onload` 追加一行，位置在 `registerMode()` 之后、`showToast(...)` 之前：

```js
require('./mcp/index.js').registerMcpTools();
```

撤销桥的 `registerUndoBridge()` / `unregisterUndoBridge()` 已由 `plugin.js` 直接调用（docs/11），
MCP 侧不再重复注册。`onunload` 里只需调 `unregisterMcpTools()`（注销本插件注册的全部工具）。

---

## 4. 数据模型与路径寻址

### 4.1 配置树

`Project.machine_max_plugin` 的形态由 Codec 定义（[src/codec/codecs/](../src/codec/codecs/)）：

```
config
├─ $schema_version, modelFile, contentPackPath, dependencyPaths[], packMeta
├─ _uiState { activeMode, activePartId, activeVariantName }
└─ parts { <partId> → PartConfig
     ├─ icon, vehicle_durability_rate, vehicle_damage_rate,
     │  vehicle_damage_rate_destroyed, functional_threshold,
     │  share_durability, max_stack_size
     ├─ element_markers { <variant> → { <uuid> → { type, config_ref } } }
     └─ variants { <variant> → VariantConfig
          ├─ model, textures, animations, tags[]
          └─ sub_parts { <sp> → SubPartConfig
               ├─ start_bone, end_bones[], durability, mass, mass_center,
               │  projected_area[3], block_collision('true'|'false'|'ground'),
               │  collision_height, climb_assist, hydro_priority
               ├─ hit_boxes { <name> → HitBoxConfig }
               ├─ interact_boxes { <name> → InteractBoxConfig }
               ├─ connectors { <name> → ConnectorConfig }
               ├─ subsystems { <name> → SubsystemConfig }
               └─ hydrodynamics { <name> → HydroCodec }
```

### 4.2 路径语法

| 形式 | 示例 | 说明 |
|---|---|---|
| 绝对路径 | `parts.hull.variants.default.sub_parts.chassis.subsystems.engine` | 从 `parts` 起 |
| 相对路径 | `subsystems.engine.mass` | 省略前缀时相对 **active variant**，即 `parts.<activePart>.variants.<activeVariant>` |
| 数组下标 | `sub_parts.chassis.projected_area.0` | 纯数字段即下标 |
| 尾部通配 | `sub_parts.*.durability`、`subsystems.*` | `*` 只允许出现在最后一段，返回 `{ <key>: value }` |

相对路径是默认形态：AI 与人在同一上下文里工作，改的永远是面板上正在编辑的那个变体，不需要每次背完整路径。

### 4.3 kind 与 Codec 对应

| kind | Codec | 工厂 |
|---|---|---|
| `part` | `PartCodec` | `createPartConfig` |
| `variant` | `VariantCodec` | `createVariantConfig` |
| `sub_part` | `SubPartCodec` | `createSubPartConfig` |
| `hit_box` | `HitBoxCodec` | `createHitBoxConfig` |
| `interact_box` | `InteractBoxCodec` | `createInteractBoxConfig` |
| `connector` | `ConnectorCodec` | `createConnectorInstanceConfig` |
| `subsystem` | `SubsystemDispatchCodec` | `createSubsystemConfig` + `getTypeDefaults(type)` |

---

## 5. 工具清单

全部 8 个工具共用同一个可用性条件：

```js
condition: { project: true, modes: ['machine_max_part'] }
```

工具名统一以插件 id 前缀开头，避开 94 个内置工具的名字空间（重名会在注册时抛错）。

### 5.1 只读（3）

| 工具 | 参数 | 返回 | 说明 |
|---|---|---|---|
| `machine_max_bb_plugin_get_context` | — | `{ project, active: { part, variant }, parts: [...], variants: [...], selection: [{ uuid, name, marker }] }` | 我"现在在哪"。`selection` 取自 Blockbench 当前选中元素并附上 marker 归属（`detectOwnerSubPart`） |
| `machine_max_bb_plugin_read_node` | `path` | `{ ok, path, value }` | 按 §4.2 读子树；`*` 通配返回映射 |
| `machine_max_bb_plugin_validate` | `only_introduced?: bool` | `{ ok, count, issues: [{ severity, code, message, path }] }` | 复用 `collectIssues(config)`（[src/mode/validation.js:180](../src/mode/validation.js)），与原生问题清单同源 |

### 5.2 编辑（5，全部进撤销栈）

| 工具 | 参数 | 行为 |
|---|---|---|
| `machine_max_bb_plugin_set_node` | `path`, `value` | 写标量/数组/对象。写前用对应 Codec 归一化与校验，写后返回 `before`/`after` 与本次引入的问题 |
| `machine_max_bb_plugin_add_instance` | `parent_path?`, `kind`, `name?`, `type?`, `definition?` | 用工厂造默认值（`subsystem` 额外合并 `getTypeDefaults(type)`），名字走 `ensureUniqueName` 去重；返回最终名字 |
| `machine_max_bb_plugin_remove_node` | `path`, `cascade?: bool` | 删节点，并清理指向它的引用：`element_markers[*][uuid].config_ref`、`connectors[*].signal_targets`、`subsystems[*].signal_targets`、`connectors[*].signal_translations` |
| `machine_max_bb_plugin_bind_marker` | `uuid`, `type`, `config_ref` | 把元素绑成 `sub_part` / `connector` / `hit_box` / `interact_box`，内部走 `setMarker` 并 `recalcAutoEndBones` |
| `machine_max_bb_plugin_set_active` | `part`, `variant?` | 切 active 上下文（等价于 UI 里点一下）。**不进撤销栈**：这是视图状态，不是工程内容 |

### 5.3 返回信封

统一结构，便于客户端判别：

```json
{ "ok": true,  "path": "subsystems.engine.mass", "before": 25, "after": 40,
  "introduced_issues": [] }
```

```json
{ "ok": false, "errors": [
    { "path": "subsystems.engine.definition", "expected": "non-empty resource location",
      "got": "", "hint": "先 list_defs(type='subsystems') 选一个 definition" } ] }
```

失败一律 `ok: false` 且**不抛异常**（工具层捕获后转成结构化错误），避免 MCP 客户端把一次参数错误渲染成协议失败。

---

## 6. 参数校验

三层，顺序固定：

1. **形状**：`mcp.z.object({...})` 声明参数类型与必填项，MCP 插件在调用 `execute` 前完成解析（含默认值）。
2. **路径**：`paths.resolve()` 校验每一段存在（`set_node` 允许最后一段不存在，表示新增字段）、`*` 只在末尾、数组下标不越界。
3. **值**：`schema.js` 用目标 Codec 做一次 `decode` 归一化，再做白名单与类型比对。

白名单来源：`Object.keys(TheCodec.decode({}))`——Codec 的 decode 契约是"空对象返回全默认值"，因此返回键集合就是 schema 键集合，不需要给 `Codec.record` 新增访问器。嵌套的 map 字段（`subsystems` 等）按 value 的 Codec 递归校验。

枚举值直接取自 Codec 定义，例如 `block_collision ∈ {'true','false','ground'}`（[src/codec/codecs/sub_part_codec.js:67](../src/codec/codecs/sub_part_codec.js)）。未知字段按 Codec 的宽松语义保留并原样回传，避免把手工写的扩展字段吃掉。

---

## 7. 编辑语义

### 7.1 撤销

每个编辑工具的执行体形如：

```js
async execute({ path, value }) {
    const resolved = paths.resolve(path);
    const normalized = schema.normalize(resolved.kind, value);   // 可能抛参数错误
    let before, after;
    // 同步入口 + strict：占用 / 快照超限时抛错，交给 MCP 客户端处理
    runConfigEdit('MM: 设置 ' + path, function () {
        const config = getConfig();
        before = paths.read(config, resolved);
        paths.write(config, resolved, normalized);
        after = paths.read(config, resolved);
    }, { strict: true });
    return MCP.createJsonResult({
        ok: true, path, before, after,
        introduced_issues: diff.introduced(beforeIssues, diff.collectIssues()),
    });
}
```

`runConfigEdit` 来自 [src/core/undo.js](../src/core/undo.js)（设计见 [docs/11](./11-接入Blockbench原生撤销.md)）：
`Undo.current_save` 占用检查、失败回滚、快照上限、嵌套合并；`{ strict: true }` 时上述失败直接抛错。
撤销栈是 Blockbench 原生的，人按 `Ctrl+Z` 就能退回 AI 的每一次修改。
注意入口是**同步**的：`execute` 可以是 async，但不要把 `runConfigEdit` 包进 Promise 队列，
否则 `onConfirm` / UI 调用链里的同步语义会丢。

### 7.2 编辑后自检

每次编辑在**同一个撤销记录内**完成后，立即跑两件事：

1. 用 `collectIssues(config)` 重新收集问题；
2. 与编辑前的问题集合 diff，只回本次**新引入**的问题（按键 `severity|code|path|message` 判等）。

这样"改完发现引用悬空""sub_part 没有起始骨骼"能在工具返回里直接看到，而不必等导出才暴露。`mm_validate({only_introduced: true})` 是同一实现的独立入口。

### 7.3 不写盘

工具不调用 `saveConfig()`、不碰 `fs`、不调 `executeExport`。理由：

- 磁盘写入是**不可撤销**的动作，与"编辑可撤销"的设计目标冲突；
- `.mm_project.json` 侧载文件由 `saveConfig()` 在保存时自动维护，工具插手会造成两份状态；
- 人按 `Ctrl+S` 保存前可以先目视检查，AI 的改动始终处于"可复核"状态。

`Project.saved` 由 `Undo.finishEdit` 置为 `false`，标题栏出现未保存标记，这是给制作者的信号。

---

## 8. 明确不做

| 不做 | 原因 | 替代 |
|---|---|---|
| `export_pack` / `export_model` 类写盘工具 | 不可撤销、会覆盖内容包 | 人在"导出内容包"对话框操作 |
| `import_part`（按路径导入） | 读任意路径 + 批量写结构 | 人拖拽导入；或先 `add_instance` 手工建 |
| `save_config` | 落盘归人 | `Ctrl+S` |
| `risky_eval` 代理 | 等价于把任意 JS 交给客户端 | 不提供 |
| 建/删内容包目录 | 文件系统副作用 | 人在 UI 操作 |
| 改 `_uiState` 之外的视图状态（相机、模式） | 与工程内容无关 | 用内置的 `set_mode` / `set_camera_angle` |

`export_preview`（只读：返回"如果现在导出会写出什么 JSON"，不落盘）留作后续扩展，见 §12。

---

## 9. 安全模型

对上工具的调用方是整个本机：

- **监听范围**：MCP 插件默认只绑定 `127.0.0.1` 与 `::1`，非 loopback 的 `Origin` / `Host` 请求返回 403（含 DNS rebinding 防护）。把监听地址设为 `0.0.0.0` 会放开 `Host` 检查，属明确的风险操作，不建议。
- **无鉴权**：任何能连上端口的本机进程都能调用全部工具，包括内置的 `risky_eval`。工具侧不能假设调用方可信，因此所有参数都在服务端（Blockbench 进程内）重新校验，路径与值的白名单不依赖客户端。
- **`risky_eval`**：MCP 插件默认把它暴露给客户端。若不需要，在 Settings → General 清除 Enable risky_eval，客户端会看不到该工具。本插件的工具不依赖它。
- **范围限制**：`condition` 限定在 `machine_max_part` 模式且必须有打开的项目，模式外调用不会被路由到执行体。

---

## 10. 注册时序与生命周期

1. Blockbench 加载 `dist/machine_max_bb_plugin.js` → `onload`。
2. `registerProperty()` → `registerUndoBridge()`（挂两个 undo 事件，docs/11 已实现）→ `registerMode()` → `registerMcpTools()`。
3. `registerMcpTools()` 把 `{ plugin: 'machine_max_bb_plugin', setup(mcp) {...} }` 推进 `globalThis.MCP_QUEUE`，并记下每个工具的 disposer。
4. MCP 插件（无论先加载还是后加载）会 drain `MCP_QUEUE` 并调 `setup(mcp)`；之后已连接的客户端收到 `tools/list_changed`，新工具即刻可用，不需要重启 Blockbench。
5. 插件卸载 → `onunload` 调 disposer 注销工具；撤销桥监听由 `unregisterUndoBridge()` 单独清理。

幂等：MCP 插件重载会重跑队列；工具注册以名字为键，重复 `setup` 前先 `unregisterTool` 同名工具，避免"duplicate name"抛错。

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
| 3 | `read_node` 读 `subsystems` 全量 | 返回完整映射，键为实例名 |
| 4 | `set_node` 把 `mass` 设为 `"abc"` | `ok:false`，`expected: number`，配置未变 |
| 5 | `set_node` 把 `block_collision` 设为 `ground` | `ok:true`，`before/after` 正确，`Ctrl+Z` 可退 |
| 6 | `add_instance` 建 subsystem，`definition` 留空 | `ok:true` 且 `introduced_issues` 含"未选型号"一类问题 |
| 7 | `remove_node` 删一个被 marker 引用的 sub_part | `ok:true`，`cleaned_references` 列出被清掉的引用 |
| 8 | `bind_marker` 绑一个不存在的 `config_ref` | `ok:false`，不写配置 |
| 9 | 连续 3 次编辑 → `Ctrl+Z` ×3 | 逐条回退，面板同步 |
| 10 | AI 编辑后不保存 → 关闭工程 | 弹出未保存提示（`Project.saved === false`） |
| 11 | 拖拽元素过程中调用编辑工具 | `ok:false`，提示"有未完成的编辑" |
| 12 | 重载插件两次 | 工具仍只有 8 个，无重复注册报错 |

---

## 12. 使用示例（prompt → 工具序列）

**例 1：把选中的 3 个 cube 标成底盘起点**

```
machine_max_bb_plugin_get_context                   → selection: [cube_12, cube_13, cube_14], active: {hull, default}
machine_max_bb_plugin_add_instance                  → kind: sub_part, name: chassis
machine_max_bb_plugin_bind_marker  ×3               → uuid: cube_1x, type: sub_part, config_ref: chassis
machine_max_bb_plugin_validate                      → introduced_issues: []
```

**例 2：给底盘加一个电机子系统并引用既有定义**

```
machine_max_bb_plugin_add_instance  { parent_path: "sub_parts.chassis", kind: "subsystem",
                                      type: "motor", definition: "machine_max:medium_motor" }
machine_max_bb_plugin_validate
```

**例 3：批量把三个子零件的质量砍半**

```
machine_max_bb_plugin_read_node  { path: "sub_parts.*.mass" }
machine_max_bb_plugin_set_node   { path: "sub_parts.chassis.mass", value: 12.5 }   ×3
machine_max_bb_plugin_validate   { only_introduced: true }
```

三个 `set_node` 落在三条撤销记录上，人按三次 `Ctrl+Z` 可以逐条退；要一次退干净，就先读完、再合并成一次 `add_instance` 式的复合编辑（后续扩展项）。

---

## 13. 后续扩展

| 项 | 价值 | 前提 |
|---|---|---|
| `export_preview` | 只读返回"现在导出会写出什么"，与 `spark_modules` 里的定义做 diff | 复用 `generateAllParts`（[src/generators/part_generator.js:88](../src/generators/part_generator.js)） |
| `signal_graph` | 导出信号拓扑（nodes/edges），审查 SignalChannel 路由 | 复用 `extractSignalGraph`（[src/lib/signal_graph.js:23](../src/lib/signal_graph.js)） |
| `list_defs` | 列出可用的 subsystems/connectors/materials/control_groups/projectiles 及其来源（builtin/dependency/current） | 复用 `getAvailableDefsForType` / `resolveDefSource`（[src/core/content_pack_manager.js:56](../src/core/content_pack_manager.js)） |
| 复合编辑 | 一次撤销回退"批量改多个字段" | `runConfigEdit` 的 `mutate` 内做多处变更 |
| 修改前快照对比 | 编辑前后整树 diff，供 AI 自查 | 复用 `diff.js` |

---

## 14. 参考资料

- MCP 插件仓库：[jasonjgardner/blockbench-mcp-plugin](https://github.com/jasonjgardner/blockbench-mcp-plugin)（含 `docs/plugin.md` 与 `blockbench-mcp-api.d.ts`）
- 插件发布地址：`https://jasonjgardner.github.io/blockbench-mcp-plugin/mcp.js`（Blockbench 里 File → Plugins → Load Plugin from URL）
- 撤销接入：[docs/11-接入Blockbench原生撤销.md](./11-接入Blockbench原生撤销.md)
- 校验实现：[src/mode/validation.js](../src/mode/validation.js)（`collectIssues`）与 [docs/10-校验与错误提示重构实现计划.md](./10-校验与错误提示重构实现计划.md)
- Codec 体系：[docs/08-序列化反序列化-Codec体系重构.md](./08-序列化反序列化-Codec体系重构.md)
