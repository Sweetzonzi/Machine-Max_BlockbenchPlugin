# 业务逻辑层与配置文档 API（v2）

> 状态：**设计稿（待实现）** · 日期：2026-10-20 · v2 依据：外部审阅（P0-1~8 / P1 九项）+ 兄弟仓库 schema 比对
> 范围：`src/doc/`（新增）+ `src/ops/`（由 `src/core/operations.js` 拆出）+ `src/services/`（新增）+ `src/ui/`、`src/mode/`（改薄）
> 目标版本：v0.5.0（当前 0.4.0） · 前置：[docs/11](./11-接入Blockbench原生撤销.md) · 下游：[docs/12](./12-MCP工具接入.md)
> 参照：[docs/08](./08-序列化反序列化-Codec体系重构.md) / [docs/10](./10-校验与错误提示重构实现计划.md)

---

## 0. v2 相对 v1 的改动

| # | v1 的问题 | v2 的处理 |
|---|---|---|
| 1 | 点分路径无法寻址含点的 key（`sub_part.machine_max.main`） | 主形式改 `string[]`，字符串形式用 JSON Pointer（§5.1） |
| 2 | 字段规格"从 Codec 派生"会泄漏 `element_markers`/`id`，且拿不到 required/enum/integer | 改为从 **builtin schema codegen**，Codec 只做内部编解码（§3、§5.2） |
| 3 | `projection.in` 只挡 `sub_parts`，正则还会拒绝 UI 合法 key | 显式 `Codec.map` 容器解码，不喂 `either`；存量 key 靠迁移（§5.3） |
| 4 | 引用面只列 4 类且误列 `signal_translations` | 改为 8 行引用矩阵 + 3 个哨兵值（§5.4） |
| 5 | `add_instance` 两步不在一笔撤销里 | 新增 `ops.addInstance`（§6.1） |
| 6 | `doc` 声称纯函数，但副作用需要 `Group/Locator` | `doc` 只产出写入计划，`ops` 注入端口执行（§7） |
| 7 | 两份文档信封不一致 | 统一 `OpResult` 契约（§12） |
| 8 | coalesce 会跨目标合并 | 默认关闭，显式 `mergeKey`（§6.4） |
| 9 | 校验被拆成多层 + 可空清单 | **同一规则集，编辑不拦、导出阻断**（§4） |
| 10 | 数字/表述多处不准 | 全部重算并给口径（§2） |

---

## 1. 背景与目标

docs/11 落地了"改配置必须走业务函数、撤销边界在业务函数内部"，但只覆盖结构性动作（`src/core/operations.js` 的 16 个函数）。字段编辑仍散在 UI：`App.vue.js` 23 个方法靠 `wrapMethodMap` 人工包装、`SubsystemPanel` 12 个 / `ConnectorPanel` 9 个直接 `$set`、5 个计算属性里有 9 处写入（含一处渲染时 `delete`）。

这套结构对"人点面板"够用，对下面三件事不够：MCP 需要可序列化的操作描述（AI 没有 `this`、选中元素、`_uiState`）；维护上同一模式重复 44 次、副作用散落；测试上仓库有 `bunfig.toml` 但无 `test/`。

目标：**配置文档 API**（寻址 / 规格 / 投影 / 引用）+ **业务操作层**（每操作一条撤销记录）+ **单一校验规则集**（编辑提示、导出阻断），让 UI 与 MCP 调同一批函数；文件系统用例抽到 `services/`，不进撤销、不暴露给 AI。

---

## 2. 现状测绘

### 2.1 体量

| 目录 | 文件 | 行数 |
|---|---|---|
| `src/ui/` | 27 JS + 7 模板 | 6,774 + 1,118 |
| `src/mode/` | 6 | 1,479 |
| `src/core/` | 13 | 4,709 |
| `src/codec/` | 10 JS（11 含 AGENTS.md） | 1,279 |
| `src/managers/` · `src/generators/` · `src/import/` | 5 · 6 · 3 | 330 · 440 · 886 |

### 2.2 写入入口

| 类别 | 位置 | 数量 |
|---|---|---|
| 结构动作 | `core/operations.js` | 16 函数 |
| 字段/集合/重命名方法 | `App.vue.js` | 8 + 7 + 8 = **23**（`MM_UNDO_LABELS`） |
| 子系统面板直写 | `SubsystemPanel.vue.js` | 12 方法 / 22 处 `$set` |
| 连接点面板直写 | `ConnectorPanel.vue.js` | 9 方法 / 10 处 `$set` |
| **计算属性内写入** | `App.vue.js` | **5 个属性 / 9 处**：282(×3)、472(×1)、545(×1)、590(×3) 的 `$set` + **170 的 `delete`**（`subPartEntries` 渲染时删孤儿子零件） |

面板模板侧：`$set` 18 处 + `$delete` 4 处，事件绑定 98 处。

### 2.3 副作用（口径：`src/**/*.js`，排除函数定义、注释、import 解构）

| 副作用 | 调用点 | 文件 | 备注 |
|---|---|---|---|
| `saveConfig()` | 19 | 12 | 含 `persistence.loadConfig` 内部 1 处 |
| `refreshOutlinerIcons()` | 17 | 7 | 排除 `undo.js` 后 16/6 |
| `dispatchEvent('update_selection')` | 22 | 7 | 排除 `undo.js` 后 20/6 |
| `showToast(...)` | 112 | 21 | 排除 `undo.js` 后 111/20 |
| `require('fs'/'path')` | 13 文件 | — | 写盘 6 处 |

> 这些数字由 P1 交付的 `scripts/audit-stats.js` 生成，避免再次漂移。

### 2.4 校验现状

`mode/validation.js → collectIssues(config)` 是唯一实现（`validation_check.js` 调的也是它）：**14 条 error / 3 条 warning**（warning 仅 `ORPHAN_ELEMENT`）。

重复的只有名称唯一性两套：`naming.validateNameUniqueness`（UI rename 调用）与 `validation._collectNameConflicts`；外加 `operations.js` 内的存在性检查。

### 2.5 已确认的其它债务

- **默认值双源**：`config.js` 内联 `HIT_BOX_DEFAULTS`（`material: ''`）vs `HitBoxCodec`（`machine_max:default`）；`config_defaults.js` 已 `@deprecated` 且无人引用。
- **子系统类型数**：Codec 22 种；兄弟仓库 schema **24 种**（见 §3.2）。
- **版本**：`package.json` / `bbplugin.json` 仍 0.4.0。
- **AGENTS.md** 多处行数过期（`config_defaults.js` 410→88、`pack_setup_dialog.js` 805→125、`connector_dialog.js` 506→61、`Codec.js` 567→606 等）。

---

## 3. 上游契约：schema 的三个源

### 3.1 关系

```
兄弟仓库 Machine-Max（上游真值）
  src/main/resources/spark_modules/machine_max.builtin/machine_max/docs/{zh_cn,en_us}/schemas/**
        │  scripts/sync-schemas.js            # 手工/CI 触发，记录来源 commit + 日期
        ▼
插件 src/builtin/builtin/machine_max/docs/{zh_cn,en_us}/schemas/**   （vendored 快照）
        │  scripts/gen-field-specs.js
        ▼
src/doc/field_specs.generated.js（含 provenance）
        │  test：manifest ↔ schema 同步；dispatch map ⊇ schema 类型集合
        ▼
插件 src/codec/**（内部编解码，允许窄于 schema，差异进 allowlist）
```

规则：

- **schema 管对外契约**（required / enum / 范围 / 结构），**Codec 管内部编解码**。
- 两者差异必须**显式登记**（`src/doc/schema_codec_allowlist.js`），否则测试失败。
- 构建不从兄弟仓库实时读取（不可复现）；只读 vendored 快照，`--check` 模式在 CI 报告漂移。

### 3.2 已测得的漂移（2026-10-20）

`machine_max.builtin` vs 插件 `src/builtin/.../schemas`（zh_cn）：**60 vs 67 个文件，同 35 / 异 25 / 插件缺 7**。

只在兄弟仓库的 7 个：

```
subsystem/dynamic/{track_controller,track_drive,launcher,regen_loader}_dynamic_attr.schema.json
subsystem/static/{track_controller,track_drive}_static_attr.schema.json
recipe/part_fabricating_recipe.schema.json
```

**类型集合以上游 builtin 为准**（2026-10-20 实测，`--check` 零漂移）：

| 来源 | 数量 | 相对上游的差异 |
|---|---|---|
| **上游 builtin schema**（`machine_max.builtin/docs/{zh_cn,en_us}/schemas/subsystem/`，权威） | **19** | —（dynamic 与 static 枚举已一致） |
| 插件 `SubsystemDispatchCodec` | 22 | 多 5 个上游未收录：`battery`、`signal_convert`、`joint`、`javascript`、`ammo_loader`；缺 `track_controller`、`track_drive` |
| Java `SubsystemTypes` 枚举 | 24 | 上游 19 + 上述 5 个 WIP 占位 |

结论：

- **履带子系统在插件里无法创建/校验**（`Unknown dispatch type`）：Codec 缺 `track_controller` / `track_drive`；
- 插件反而暴露了 5 个上游未发布的 WIP 类型，会产出上游读不懂的配置；
- Java 枚举里有 WIP 占位（`joint` 这类虽有代码但未完成），**不能作为类型清单依据**；D11 的字段元数据与类型清单都以上游 schema 为准；
- D13 立项范围相应扩大为"补 2 个正式类型 + 移除或标记 5 个 WIP 类型"。

顺带修掉的上游缺陷（已改并重新同步）：`motor_controller` 是 `motorbike_controller` 的错写 —— 枚举中两种拼写并存，而 `if/then` 分支只用了错写那个且 `$ref` 指向 `motorbike_controller_*_attr.schema.json`，导致**正确的 `motorbike_controller` 匹配不到任何分支**（字段完全不校验）；此外 `subsystem_static_attr` 的枚举整体漏了 `motorbike_controller`（分支与 schema 文件都在）。修复后 dynamic 与 static 枚举一致为 19 种。

已知 schema ↔ Codec 差异（进 allowlist 或修复）：

| 字段 | schema | Codec | 处置 |
|---|---|---|---|
| `sub_part.hit_boxes` | `required` + `minProperties: 1` | 无约束 | 由校验器负责（已实现，§4） |
| `hit_box.id` | 有默认 `"part"`，非必填 | `.field()` 必填 | 本期修 Codec（改成 `.default('part')`） |
| `hit_box.overwrite` | 结构化 18+ 字段、`additionalProperties:false` | `Codec.ANY.nullable()` | allowlist（面板字段未覆盖，逐步补） |
| `interact_box.condition` | `enum: [AND,OR,NAND,NOR,XOR,XNOR]` | `STRING` | 本期加枚举 |
| `connector.definition` | `required` | `.default('')` | 由校验器负责（已判 error） |
| `subsystem.definition` | `required` | `.field()`（写 `null`） | 本期改为 `.nullable()` + 导出前清洗（§4.3） |
| 多数对象 | `additionalProperties: false` | 宽松保留 | allowlist，单独排期 |
| `sub_part.projected_area` | `$ref vector_3d` = `number[3]` | `FLOAT.list(3)` | **一致**（schema 自身 example 写成 `{x,y,z}`，是文档 bug） |

> 另注：`interact_box_attr` 的第二个 example 用了枚举外的 `"interact_mode": "toggle"`；`hit_box_attr` 的 example 从 `subpart.has_connector(...)` 改为 `local.has_connector(...)`。**schema 的 examples 不能当契约**，只用 `properties/required/enum/$ref`。

---

## 4. 校验模型：一套规则，两种后果

### 4.1 原则

- **写入期只保证"可被解释"**：类型/枚举/数组长度/父节点存在/引用能解析成节点——违反即拒绝（否则会存下任何阶段都无法解释的数据）。
- **完整性只提示，不阻断编辑**：新建子零件没有碰撞箱、子系统没选型号，都是**合法中间态**。
- **导出期用同一份规则集，遇 error 阻断**。

因此**不设"可空字段清单"**：`collectIssues` 已经把"碰撞箱为空""未指定型号"判为 error，编辑期它只出现在 Blockbench 原生清单与面板徽标里，用户可继续编辑；导出时同一批 issue 变成闸门。

### 4.2 分层职责

| 层 | 负责 | 执行者 | 违反时 |
|---|---|---|---|
| 写入合法性 | 类型 / 枚举 / 长度 / 父节点 / key 格式 | `doc.field_specs` + `doc.address` + Codec | `ok:false`（`type_mismatch` / `invalid_enum` / `not_found` / `invalid_format`） |
| 完整性 | required / minProperties / 引用存在 / 名称唯一 / 保留名 | `collectIssues` | 编辑期：仅提示；导出期：**阻断** |
| 一致性 | 内容包定义、材质、依赖存在性 | `collectIssues`（`DEFINITION_REF_MISSING` 等） | 同上 |

### 4.3 导出闸门

```js
// services/export.js
function canExport(config) {
    var issues = collectIssues(config);
    var errors = issues.filter(function (p) { return p.severity === 'error'; });
    return { ok: errors.length === 0, errors: errors, warnings: issues.filter(isWarning) };
}
```

- `export_dialog.onConfirm`：`canExport` 失败 → `showToast` + 列出问题（复用现有 `buildValidationInfo` 的按 path 分组渲染，每条挂 `__mmNavigator.selectByIssue` 定位按钮），`return false` 不关对话框。
- 现状是"仅提示不拦截"（[export_dialog.js:307](../src/ui/export/export_dialog.js)），本期改为阻断。
- 14 条 error 规则逐条确认可定位（都带 `path`）；warning（`ORPHAN_ELEMENT`）放行。

### 4.4 占位符不得变成脏数据（前置修复）

`createSubsystem` 写 `definition: null` 是**正确的占位**，但它会一路写到内容包：

```
createSubsystem: definition = null                      operations.js:305
SubsystemDispatchCodec → EngineCodec.definition = .field()   // 只挡 undefined，不挡 null
Codec.STRING.encode(null) = String(null) = "null"       Codec.js:74-77 / 254-256
→ 内容包出现 "definition": "null"
```

修法（三项一起）：

1. `definition` 在 schema 层面是 required 但插件允许占位 → Codec 里改为 `.nullable()`（`null → undefined`，不输出该键）；
2. `Codec.STRING.encode` 对非 string 抛错，去掉 `String(v)` 隐式强制；
3. 导出闸门（§4.3）兜底，把"未指定型号"变成阻断项。

> 待复核：`definition: null` 进入 `PartCodec.decode` 时 `STRING.decode(null)` 会抛错；当前加载路径只有命中 `migrateIfNeeded` 才会 decode，故未必触发。P2 一并验证。

---

## 5. 配置文档 API（`src/doc/`）

### 5.1 路径语法 v2

**主形式：段数组**（无歧义，MCP 的 JSON 参数天然支持）

```js
['parts', 'hull', 'variants', 'default', 'sub_parts', 'sub_part.machine_max.chassis', 'mass']
```

**字符串形式：JSON Pointer（RFC 6901）**

```js
'/parts/hull/variants/default/sub_parts/sub_part.machine_max.chassis/mass'
```

- 分隔符是 `/`，所以含 `.`、`:`、中文的 key **天然是一段**；
- 转义：`~0` → `~`，`~1` → `/`；
- 相对形式：首段不是 `parts` 时，按 `parts.<activePartId>.variants.<activeVariantName>` 补前缀。

**通配符 `*`**：作为**整段 token**，至多一个，可出现在任意层级；结果按该层 key 收起。

```js
['parts', 'hull', 'variants', 'default', 'sub_parts', '*', 'mass']   // → { <spKey>: number }
['parts', 'hull', 'variants', 'default', 'sub_parts', 'x', 'projected_area', '*']
```

（v1 的"`*` 只能在最后一段"是点分拼串的产物，随语法一起废弃。）

**解析顺序**（消歧）：

1. 固定段名优先：`parts` / `variants` / `sub_parts` / `hit_boxes` / `interact_boxes` / `connectors` / `subsystems` / `hydrodynamics` / 各 kind 的字段名；
2. 需要 key 的层（map）→ 取剩余段中**最长的已存在 key 前缀**匹配（因为 key 里可含点）；
3. 无匹配 → `not_found`；存在多种切分且都能匹配 → `ambiguous_path`（**报错，不猜**）；
4. 数组层：纯数字段为下标，越界 → `not_found`。

**不可寻址**：`_uiState`（写 → `unknown_field`；切上下文用 `setActive`）、`element_markers`（编辑器内部）。

**`hit_boxes` 双形 key**：对外是骨骼名、内存是 UUID；解析时先按 UUID 命中，再按骨骼名查 `Group.all`。

**测试向量**（P1 必过）：

| 输入 | 期望 |
|---|---|
| `['parts','hull','variants','default','sub_parts','sub_part.machine_max.main','mass']` | 命中 |
| `'/parts/hull/variants/default/sub_parts/sub_part.machine_max.main/mass'` | 命中 |
| `['parts','中文零件','variants','默认','sub_parts','sub_part.machine_max.底盘','mass']` | 命中 |
| `['parts','a.b.c','variants','default','sub_parts','x','mass']`（零件 id 含点） | 命中（段数组） |
| `['..','sub_parts','*','mass']` | 相对路径 + 通配 |
| `['parts','hull','variants','default','sub_parts','chassis']`（key 无点） | `not_found`（不静默吞） |
| `['parts','hull','_uiState','activePartId']` | `unknown_field` |

### 5.2 字段规格（`field_specs.generated.js`）

**来源**：`scripts/gen-field-specs.js` 读取 builtin schema，输出紧凑 manifest。Codec **不参与**生成（避免 §0 第 2 条的泄漏）。

每字段：

```js
{
  kind: 'sub_part', key: 'mass',
  type: 'number', integer: false,
  minimum: 0,
  enum: null,
  required: false,            // 仅用于展示与校验提示，不在写入时阻断
  resourceLocation: false,    // $ref base/resource_location
  boneRef: false,             // start_bone / mass_center / interact_box.bone / connector.locator
  items: null, minItems: null, maxItems: null,
  sideEffect: null,           // 见下表
}
```

`subsystem` 的规格按 typeId 分组（22/24 种），由 `subsystem_dynamic_attr.schema.json` 的 `if/then` + 各类型 schema 展开。

**副作用表（唯一手写部分，9 条）**

| kind.field | 副作用 id | 行为 |
|---|---|---|
| `sub_part.start_bone` | `migrate_sub_part_marker` | 标记迁到新骨骼 UUID，成功后重算 `auto_end_bones` |
| `interact_box.bone` | `rebind_interact_marker` | 重新解析 marker（**新增行为**，现状只 `markerVersion++`） |
| `connector.definition` | `sync_marker_config_ref` | 同步 marker 的 `config_ref` |
| `connector.locator` | `migrate_connector_marker` | 标记迁到新 Locator |
| `hit_box.overwrite` / `connector.overwrite` / `variant.textures` | `ensure_object` | 惰性建对象；`textures` 单键按简写处理 |
| `subsystem.type` | `rebuild_type_fields` | 重建类型专属字段，返回 `dropped_fields`（**新增行为**，现状无类型切换路径） |

> 修正 v1 两处错误：`end_bones` **不触发** `recalcAutoEndBones`（`auto_end_bones` 由标记推导）；`interact_box.bone` 的重绑是新增行为。

**写入期归一化**：`setField` 默认 **strict**（`"12.5"` 报 `type_mismatch`，不做隐式转换）。UI 输入框在调用前自行 `parseFloat`（现有面板已如此），MCP 不 coerce。

### 5.3 投影（`doc/projection.js`）

内部树与对外定义不是同一形状：

| 差异 | 对外定义 | 内部树 |
|---|---|---|
| `hit_boxes` key | 骨骼名 | UUID（找不到 Group 时**保留 UUID**，见 `part_generator._resolveUUIDKeys`） |
| `interact_boxes[*]._uuid` / `connectors[*]._marker_uuid` | 无 | 有 |
| `variants` / `sub_parts` | **仅当唯一 key 恰为 `default` 时**才简写 | map |
| 默认值字段 | 省略 | 全量 |
| `auto_end_bones` / `_unresolved_bones` / `element_markers` / `__new_p_*` | 无 | 有 |

**`projection.in` 的顺序（不可乱）**：

1. **剥内部字段**：`element_markers` / `_uuid` / `_marker_uuid` / `_unresolved_bones` / `auto_end_bones` / `__new_p_*`；
2. **校验 key 格式**（仅 `sub_parts`）：必须匹配 `^sub_part\.[\w-]+\.[\w.-]+$`（namespace 允许含点）；不符 → `invalid_format`；
3. **严格 map 解码**：**不使用 `either`**，改用 `Codec.map(Codec.STRING, SubPartCodec)` / `Codec.map(Codec.STRING, VariantCodec)`（`Codec.map` 已导出，子 codec 也已导出）；
4. 解析骨骼/信号引用（`doc/refs`），未解析项进 `unresolved_references`（**不阻塞**）；
5. 建 marker（`ops` 通过端口执行）。

为什么必须绕开 `either`：`either.decode` 用"key 里有没有 `.` 或 `:`"猜简写（[Codec.js:561-586](../src/codec/Codec.js)）；`{ sub_parts: { chassis: {...} } }` 会被当成单实体、`SubPartCodec` 全默认**解码成功**，整张 map 被吞成 `{ default: { …, chassis: {...} } }`。

**存量数据**（`loadConfig` 一次性修复，见 §15）：

- 非规范 `sub_parts` key（无点/中文/任意串）→ 保留但记录 warning，导出时由校验器提示；
- 单变体简写、缺失 `hit_boxes` 容器 → 归一化为 map；
- 悬空 marker → `cleanGhostMarkers`（已有）；
- `_uuid` / `_marker_uuid` 缺失或指向不存在元素 → 按骨骼名重建。

### 5.4 引用矩阵

| # | 位置 | 目标 | 删除时 | 重命名时 |
|---|---|---|---|---|
| 1 | `marker.config_ref`（`sub_part`） | 子零件 key | 删标记 | 改写 |
| 2 | `marker.config_ref`（`interact_box`） | 交互区 key | 删标记 | 改写 |
| 3 | `marker.config_ref`（`connector`） | **现状是 definition 值**（`updateConnectorField` 写入） | 删标记 | 需先统一语义（见下） |
| 4 | `subsystems[*].signal_targets[*][]` | 子系统名 / 连接点名 | 移除该项 | 改写 |
| 5 | `connectors[*].signal_targets[*][]` | 同上 | 移除该项 | 改写 |
| 6 | `interact_boxes[*].signal_targets[*][]` | 同上 | 移除该项 | 改写 |
| 7 | `connectors[*].power_target` | 子系统名 / 连接点名 | 置空 | 改写 |
| 8 | `hit_boxes[*].subsystem` | 子系统名 | 置空 | 改写 |
| 9 | `subsystems[*].connector` / `.dismount_locators[]` / `.locator` | 连接点名 / Locator 名 | 置空 / 移除 | 改写 |
| 10 | `start_bone` / `end_bones[]` / `mass_center` / `interact_box.bone` / `connector.locator` / `hit_boxes` key | 骨骼 / Locator 名 | 置空 / 移除（骨骼消失时由 `cleanGhostMarkers` 兜底） | 改写 |

**哨兵值**（`signal_targets` 内的字符串，不是节点引用，**永不删除**）：`part`、`vehicle`、`subpart`（schema 描述为 option 值；第三条待与兄弟仓库确认，`local/global` 化后可能已废弃）。

**不计入引用**：`signal_translations` 是「频道名 → 频道名」映射，与配置节点无关（v1 误列）。

**`config_ref` 语义统一**（第 3 行）：`connector` marker 的 `config_ref` 现在写的是 `definition` 值，而 `sub_part`/`interact_box` 写的是 key。二者混用会让重命名与清理必然出错。统一为「marker → 被标记配置条目的 key」，`definition` 单独存于配置条目；迁移见 §15。

`refs` 的 API 分成两组，避免"骨骼未解析"与"信号引用"混在一起：

```js
refs.resolveBones(kind, node, ports)   // → { resolved: [...], unresolved: [{bone, field, subPartKey, key}] }
refs.resolveSignals(config, scope)     // → { dangling: [{path, target, kind}] }
refs.cleanDangling(config, removed)    // 删除/替换后清理，返回 cleaned_references
refs.renameRefs(config, { kind, oldKey, newKey })
```

### 5.5 原语

```js
doc.read(config, path, opts)             // → {ok, kind, value}
doc.write(config, path, value, opts)     // 标量/数组/对象；返回写入计划，不执行副作用
doc.insert(config, path, key, node)
doc.remove(config, path, opts)
doc.apply(config, path, definition, opts)  // 整件替换
```

原语**不开撤销记录、不发事件、不碰全局对象**；由 `ops` 用 `runConfigEdit` 包住并执行 §7 的副作用。

---

## 6. 业务操作层（`src/ops/`）

### 6.1 目录与清单（29 个）

```
src/ops/
├── index.js      # 聚合导出，保持 ops.xxx 形态
├── part.js       # createPart / deletePart / importPart
├── variant.js    # createVariant / deleteVariant / importVariant / setVariantTags
├── sub_part.js   # importSubPart / renameSubPart / markSubPart
├── subsystem.js  # createSubsystem / deleteSubsystem / importSubsystem / renameSubsystem
├── element.js    # markHitBox / markInteractBox / markConnector / renameConnector /
│                 # renameInteractBox / clearElementMarker / bindMarker / removeNode / addInstance
├── field.js      # setField
├── pack.js       # setContentPack / setContentPackPath / updatePackMeta / updateDependencyPaths
└── session.js    # setActive
```

新增 13：四个 `import*`、四个 `rename*`、`bindMarker`、`removeNode`、`addInstance`、`setField`、`setActive`。

**`createXxx` 与 `importXxx` 不是特例关系**：`createPart` 必须给 `partId`、`createSubsystem` 必须给 `instanceName`；自动命名（`ensureUniqueName`）只发生在 `markSubPart` / `markInteractBox` / `markConnector`。

### 6.2 契约

- 第一参数永远是完整配置对象（`getConfig()` 结果），不收 Vue 实例；
- 返回 `OpResult`（§12），失败不抛异常（`strict` 模式除外，MCP 用）；
- 内部统一 `runConfigEdit(label, fn, opts)`，标签函数形式且**带路径/参数**；
- 不落盘、不 toast、不刷新——只发事件（§7.2）；
- 写响应式对象走注入端口（§7.1）。

### 6.3 三级写入通道

| 粒度 | 操作 | 语义 | 撤销 |
|---|---|---|---|
| 单字段 | `setField` | 只改该字段 | 一条（`mergeKey` 相同才合并） |
| 单实例 | `createXxx` / `markXxx` / `renameXxx` / `bindMarker` / `removeNode` / `addInstance` | 增删实例、改 key、绑标记 | 一条 |
| 整件 | `importPart` / `importVariant` / `importSubPart` / `importSubsystem` | 整体替换子树；省略字段 = 重置默认 | 一条 |

`addInstance(parentPath, kind, key?, definition?)`：内部**一次** `runConfigEdit` 完成「建条目 + 解析引用 + 写 definition」，对应 MCP 的 `add_instance`（只服务 `hit_box` / `interact_box` / `connector`，其余走 `import*`）。

### 6.4 撤销粒度与合并

`_coalesceWithPrevious` 现在的条件是「同标签 + 800ms + 快照相接」，不看目标，会导致：不同子零件的 `mass` 合并、连续两次 `createPart` 合并、MCP 连续三次 `set_node` 合并（与 docs/12 矩阵 #17 期望的三条冲突）。

新规则：

- `runConfigEdit(label, fn, { coalesce: false })` 成**默认**；只有 UI 的连续数值编辑显式打开；
- 打开时要求 `mergeKey`（通常是完整路径）相同；
- 结构性动作（`create*` / `delete*` / `rename*` / `import*` / `removeNode` / `addInstance` / `bindMarker`）一律 `coalesce:false`；
- MCP 调用一律 `coalesce:false`（`source === 'mcp'` 时强制）。

---

## 7. 副作用端口（解决 doc 的纯度矛盾）

### 7.1 端口

`doc` 不 `require` Blockbench 全局，也不 `require` Vue；所有外部能力通过端口注入：

```js
// src/doc/ports.js
var ports = {
    bones:      { findByName: null, listAll: null },      // Group.all / Locator.all
    markers:    { set: null, clear: null, recalc: null }, // element_markers
    validation: { collectIssues: null },                  // mode/validation
    events:     { emit: null },                            // Blockbench.dispatchEvent
    reactivity: { set: null, del: null },                  // Vue.set / Vue.delete
};
function install(p) { /* 逐项覆盖 */ }
```

接线位置：**`plugin.js onload`（最早）**，而不是面板 mounted——工具栏/右键菜单可能早于面板。默认实现：`reactivity` 若全局 `Vue` 存在则用 `Vue.set`，否则普通赋值；`events` 若 `Blockbench` 存在则派发，否则空实现（Node 测试可用）。

`doc/address` 解析 `hit_boxes` 骨骼名路径、`doc/refs` 反查 UUID，都走 `ports.bones`。

### 7.2 变更事件

```js
// ops 内部（经 ports.events）
emit('mm_config_changed', {
    source: 'ui' | 'mcp' | 'import',
    label:  '修改 sub_parts.<sp>.mass',
    kinds:  ['sub_part'],
    paths:  [...],
    persist: true,      // 是否允许订阅方落盘
});
```

UI 适配器（`App.vue.js` mounted 订阅一次）：

```js
Blockbench.on('mm_config_changed', function (e) {
    refreshOutlinerIcons();
    self.markerVersion.v++;
    // update_selection 由 runConfigEdit 统一派发（见下），这里不重复派发
    if (e.persist) persistence.scheduleSave();   // 300ms 防抖（新增）
});
```

**避免双发**：`runConfigEdit` 现在会在 `finishEdit` 后 `dispatchEvent('update_selection')`（[undo.js:537](../src/core/undo.js)）。统一为：`runConfigEdit(label, fn, { dispatch: false })` 时由事件总线负责；默认保持现状（`dispatch: true`），P3 切换为单一出口后再改默认。

### 7.3 不集中化的部分

- **toast**：112 处保持原位（文案与上下文强相关，集中化需要 i18n）。约定：ops 不 toast，调用方按 `OpResult` 决定。
- **`saveConfig`**：`Blockbench.on('save')` 与 `loadConfig` 内部的幽灵清理保持直接调用，其余 17 处收敛为 `scheduleSave()`。

---

## 8. `services/` 与导出闸门

```
src/services/
├── export.js     # executeExport（从 ui/export/export_pipeline.js 迁入）+ canExport 闸门
├── import.js     # 文件读取 + 批量编排（drag_import 的 IO 部分）
├── pack.js       # 创建/打开/校验内容包、依赖链解析（三个 pack 对话框的 fs 部分）
└── validate.js   # collectIssues 包装 + diff（本次引入的问题）
```

依赖顺序固定：`core → doc → ops → services → ui/mcp`。

`collectIssues` 仍留在 `mode/validation.js`（它有 `Blockbench` 无直接依赖，但语义属于模型层）；P4 时下沉为 `core/validation.js`，`mode/validation_check.js` 只做"Problems → 原生清单"的适配。

`services/` 可以 `require('fs')`、可以 async、**不参与撤销、不暴露给 MCP**。

---

## 9. 迁移映射（旧 → 新）

| 旧位置 | 旧做法 | 新位置 |
|---|---|---|
| `App.update*Field`（8 个） | 各自 `$set` | `ops.setField` |
| `App.addEndBone/removeEndBone/removeTag/handleTexturesKv*`（7 个） | 集合编辑 | `ops.setField`（整数组/整对象提交） |
| `App.rename{SubPart,Connector,InteractBox,Subsystem}` | key 迁移 + marker 改写 + 唯一性 | `ops.rename*` + `doc.refs` |
| `App.migrate*`（3 个） | 3 个迁移方法 | `setField` 的 `sideEffect` |
| `App.handleCleanGhostEntry` | 手写 delete + 落盘 | `ops.removeNode` |
| `SubsystemPanel` 12 / `ConnectorPanel` 9 | 直接 `$set(this.config, …)` | `ops.setField` |
| 计算属性 9 处写入（含 `subPartEntries` 的 `delete`） | 渲染期改配置 | 删除；缺条目由 `mark*` 建，面板显示「创建配置」按钮，`loadConfig` 一次性 repair |
| `drag_import` | fs + 对话框 + 落盘 | `services/import.js` + `ops.importPart` |
| `bone_resolver` | 仅导入时用 | `doc/refs.js`（导入/删除/重命名共用） |
| 19 处 `saveConfig` / 17 处 refresh / 22 处 update_selection | 就地调用 | 事件订阅 + `scheduleSave` |
| `export_dialog` 忽略校验结果 | 仅提示 | `services/export.canExport` 阻断 |

---

## 10. 分期与验收

### P0 — 上游对齐（部分已落地）

- ✅ `scripts/sync-schemas.js`（`--check` / `--apply` / `--source`，不 spawn 子进程，尽力读上游 commit 作溯源）
- ✅ vendored 快照全量替换：`src/builtin/builtin/machine_max/docs` 由 139 → 153 文件，与 `Machine-Max@26ae8841` 逐文件 SHA256 一致；`--check` 零漂移
- ✅ 7 个缺失 schema 到位（`track_controller` / `track_drive` 的 static+dynamic、`launcher` / `regen_loader` dynamic、`part_fabricating_recipe`）
- ⏳ `scripts/gen-field-specs.js`（codegen，待做）
- ⏳ `scripts/audit-stats.js`（数字审计，待做）

剩余验收：`gen-field-specs` 能生成 `src/doc/field_specs.generated.js`；`audit-stats` 输出与 §2 一致；manifest ↔ schema 同步测试。

### P1 — 文档层（1 会话）

`doc/{address,field_specs.generated,projection,refs,ports,index}.js` + `test/` 骨架。

验收：`bun test` 覆盖 §5.1 全部测试向量 + 投影 3 个坑 + 引用矩阵 10 行；`require` 全部 `doc` 模块的测试通过（P1 无调用方，dist 不增量，故不以体积为验收）；零行为变更。

### P2 — 操作层（1.5–2 会话）

`src/ops/*`（9 文件）；删除 `core/operations.js`（9 处 require 改写）；UI 44 个方法改薄；§4.4 三项修复；§6.4 合并开关。

验收：每字段改一次 = 一条撤销记录；四个 `import*` 可用且返回 `reset_fields`；拖拽导入回归；`coalesce:false` 下三次 `set_node` = 三条。

### P3 — 事件总线 + 导出闸门（1 会话）

端口接线（`plugin.js`）、18 处落盘收敛、9 处计算属性写入删除、`canExport` 阻断、默认值双源清理。

验收：`Ctrl+S` 内容不变；未选中元素时渲染不改配置；空碰撞箱的子零件**可正常编辑**但**导出被拦**；新建碰撞箱 `material` 与导入默认一致。

### P4 — `services/` 抽离（1 会话）

`export_pipeline` → `services/export.js`；`drag_import` IO → `services/import.js`；pack 三件套 fs → `services/pack.js`。纯搬移。

验收：同一工程导出产物逐字节一致。

### P5 — MCP（见 docs/12，1 会话）

---

## 11. 测试策略

```
test/
├── mocks/blockbench.js     # Undo / Group / Locator / Vue 桩 + 端口 fake
├── helpers.js              # 造配置树、快照对比
├── doc/{address,field_specs,projection,refs}.test.js
├── ops/*.test.js
├── schema/{sync,drift}.test.js
└── services/{export,validate}.test.js
```

必测清单（对应 §0 的十条改动）：

1. 含点/中文/namespace 带点的路径；`*` 在中间层；
2. `sub_parts` 单 key 反例（`{chassis:{…}}`）必须 `not_found`/`invalid_format`，不得被吞成 `{default:…}`；
3. `read_node` → `import_*` **round-trip**（UI rename 成中文后仍能写回）；
4. `field_specs` 不暴露 `id` / `element_markers`；
5. `power_target` / `hit_box.subsystem` / `signal_targets` 的清理与重命名；
6. `coalesce:false`：不同目标不合并、结构动作不合并；
7. 投影剥离内部字段（注入 `element_markers` 后不可见）；
8. `"null"` 清洗（`definition: null` 不出现在导出结果里）；
9. 导出闸门：空 `hit_boxes` 拦截、`ORPHAN_ELEMENT` 放行；
10. `schema` 漂移：manifest ↔ schema、dispatch map ⊇ schema 类型集合。

---

## 12. `OpResult` 契约

所有 `ops.*` 与工具层统一返回：

```js
{
  ok: true,
  data: { … },                  // 操作特有结果（partId / instanceName / …）
  changed: true,                // 是否真的写了（false 时无撤销记录）
  before: any, after: any,      // 字段级操作
  reset_fields: string[],       // import*：被重置为默认值的字段
  cleaned_references: [...],    // remove*/import*：被清理的引用
  unresolved_references: [...], // refs 未解析（不阻塞）
  introduced_issues: [...],     // 本次引入的问题（同一快照内计算，见下）
  warnings: [...],
}
// 失败
{ ok: false, error: '…', errors: [{ path, code, expected, got, hint }] }
```

**产生者**：`before/after` ← `doc` 原语；`reset_fields` ← `projection`；`cleaned_references` / `unresolved_references` ← `refs`；`introduced_issues` ← `ops` 通过 `ports.validation.collectIssues` 在**同一撤销记录内**做前后 diff（不 `require` `mode/validation`，保持分层）。

错误码：`no_project` / `not_found` / `missing_required` / `type_mismatch` / `invalid_enum` / `invalid_format` / `duplicate_name` / `unknown_field` / `unknown_type` / `ambiguous_path` / `unresolved_reference` / `edit_in_progress` / `snapshot_too_large` / `io_error`。

---

## 13. 决策记录

| # | 决策 | 结论 | 来源 |
|---|---|---|---|
| D1 | 抽象粒度 | 字段规格表 + 通用 path API | 推荐 |
| D2 | 副作用归属 | ops 只发事件，UI 订阅刷新/落盘 | 推荐 |
| D3 | 错误信封 | 结构化 `errors[]` + 保留 `error` 字符串 | 推荐 |
| D4 | 文件系统用例 | 抽到 `services/`，不进撤销、不暴露 MCP | 推荐 |
| D5 | Vue 耦合 | `doc` 不 require Vue，走端口（§7.1） | v2 修正 v1 的注入时机 |
| D6 | 测试基建 | P1 起 `bun test` | 推荐 |
| D7 | MCP 工具定义 | 手写（工具数 ≤ 15） | 推荐 |
| D8 | 整件通道形态 | 按 kind 拆具名（`importPart` 等） | 用户 |
| D9 | 小件整件通道 | 本期不做 `hit_box`/`interact_box`/`connector` | 用户 |
| D10 | 路径语法 | `string[]` 主 + JSON Pointer 从；`*` 为整段 token | 推荐（v2） |
| D11 | 字段规格来源 | 兄弟仓库 schema → vendored → codegen | 推荐（v2） |
| D12 | schema↔Codec 漂移 | 以 schema 为准，本期只修影响导出的 4 项，其余 allowlist | 推荐（v2） |
| D13 | `track_*` 两种类型 | **单独立项**（不阻塞 P1，但测试留红灯） | 用户 |
| D14 | 可空字段清单 | **撤销**——一套规则集，编辑不拦、导出阻断 | 用户（§4） |
| D15 | 导出闸门 | `severity==='error'` 阻断导出 | 用户 |
| Q1 | 内容包定义 JSON | 只读，不纳入业务层 | 用户 |
| Q2 | 交付形态 | 拆两串 commit | 用户 |

---

## 14. 明确不做

| 不做 | 原因 |
|---|---|
| 为每个控件造一个 op | 只是把耦合搬到 ops，还丢失寻址抽象 |
| 把导出/导入/建包塞进 ops | async + 写盘 + 不可撤销 |
| command bus + 元数据 codegen zod schema | 工具数 ≤ 15 时收益不足 |
| 一次性重写 `App.vue.js` | 1,883 行，回归面过大；分三批 |
| 集中化 112 处 toast | 需要消息目录（i18n） |
| 编辑期因校验 error 阻断操作 | 与"渐进填写"模型冲突（§4） |
| 收紧 `additionalProperties` | 会牵连现有导入逻辑，单独排期 |
| `track_controller` / `track_drive` 支持 | 独立立项（D13） |
| 内容包定义 JSON 的编辑通道 | Q1 |

---

## 15. 存量迁移（`loadConfig` 一次性修复）

| 问题 | 处理 |
|---|---|
| `sub_parts` 的 key 不符合翻译键 | 保留原 key，记 warning；后续重命名走 `ops.renameSubPart` |
| 单变体/单子零件简写形态 | 归一化为 map |
| 缺失 `hit_boxes` / `connectors` 等容器 | 补空 map（不改语义） |
| `subsystems[*].definition === null` 或 `"null"` | 转 `null`（占位），导出闸门拦截 |
| `connector` marker 的 `config_ref` 存着 definition | 统一为连接点 key（§5.4） |
| `_uuid` / `_marker_uuid` 缺失或失效 | 按骨骼名/Locator 名重建 |
| 悬空 marker | `cleanGhostMarkers`（已有） |
| 孤儿子零件（无标记） | **不再在渲染期删除**；改为 `loadConfig` 报告 + 面板「创建配置」按钮 |

---

## 16. 风险与回滚

| 风险 | 对策 |
|---|---|
| 删除计算属性写入后，存量"标记有、配置无"不再自动补建 | §15 的 load-time repair + 面板显式按钮 + `setField` 的 `ensure` |
| 整件替换丢字段 | `reset_fields` 回传 + 工具描述明示 |
| 导出闸门改变现有行为（从"总是成功"到"被拦"） | P3 单独 commit；先跑一次全量校验看现有工程有多少 error |
| 批量导入撤销粒度回退 | 冲突决策提前到开记录前（修 `drag_import` 既有缺陷） |
| 端口未注入（早于 `plugin.js onload`） | 端口默认空实现 + `assertPorts()` 在 ops 入口做一次软检查 |
| P2/P3 交叉改动同一批文件 | P2 只碰"写配置"，P3 只碰"副作用" |

---

## 17. 参考资料

- 撤销：[docs/11](./11-接入Blockbench原生撤销.md) · MCP：[docs/12](./12-MCP工具接入.md)
- Codec：[docs/08](./08-序列化反序列化-Codec体系重构.md) / [src/codec/AGENTS.md](../src/codec/AGENTS.md)
- 校验：[docs/10](./10-校验与错误提示重构实现计划.md) / [src/mode/validation.js](../src/mode/validation.js)
- 上游 schema：`../Machine-Max/src/main/resources/spark_modules/machine_max.builtin/machine_max/docs/zh_cn/schemas/`
- 现有整件通道：[src/import/drag_import.js](../src/import/drag_import.js) + [src/import/bone_resolver.js](../src/import/bone_resolver.js)
