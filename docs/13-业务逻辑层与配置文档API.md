# 业务逻辑层与配置文档 API（v3）

> 状态：**设计稿（待实现）** · 日期：2026-10-20 · v3 依据：第二轮审阅（P1 前三个阻塞项 + 设计缺口）逐条核对代码后收口
> 范围：`src/doc/`（新增）+ `src/ops/`（由 `src/core/operations.js` 拆出）+ `src/services/`（新增）+ `src/ui/`、`src/mode/`（改薄）
> 目标版本：v0.5.0（当前 0.4.0） · 前置：[docs/11](./11-接入Blockbench原生撤销.md) · 下游：[docs/12](./12-MCP工具接入.md)
> 参照：[docs/08](./08-序列化反序列化-Codec体系重构.md) / [docs/10](./10-校验与错误提示重构实现计划.md)

---

## 0. v3 相对 v2 的收口

| # | v2 的问题（第二轮审阅） | v3 的处理 |
|---|---|---|
| 1 | key 策略同时承诺「格式必须匹配」「存量原样保留」「中文可写回」，三者互斥 | **严格规范 key**（D16）：字符集为 **ASCII**（D17，中文 key 也拒绝），子零件还强制 `sub_part.<ns>.<name>` 形态；`loadConfig` 一次性迁移子零件 key；见 §5.1、§15 |
| 2 | `projection` 只写了 `in`，且缺骨骼名↔UUID、`_uuid`、`_marker_uuid`、简写、part_id 等变换 | 给出 `in` / `out` 两个**有序**算法与 round-trip 保证（§5.3）；`read(as='definition')` 走 `out('read')` |
| 3 | 引用矩阵漏 `hit_box` marker 与 `subsystems[*].power_output`，target 写成「名」 | 扩为 **12 行**，target 一律写「完整配置 key」；哨兵只保留 `local`/`global`，`part`/`subpart`/`vehicle` 彻底移除（§5.4，D19） |
| 4 | 路径语法「固定段名优先 / 最长 key 前缀 / ambiguous_path / `..`」自相矛盾 | 改为**按位置解析**（map 层下一段必为 key），删除相对语法与 `ambiguous_path`，新增 `allowMissingLeaf`（§5.1） |
| 5 | 19 / 22 / 24 三种类型数混用 | schema **19** 为真值；5 个 WIP 类型**删除**（Codec 22→17）；D13 补 `track_*` 后回到 19（§3.2、§5.2，D18） |
| 6 | `field_specs` 表达不了 `oneOf` / object / tuple / nullable | 扩展字段规格类型模型，并列出 9 个关键字段的生成结果（§5.2） |
| 7 | §4.1「引用必须可解析」与 §5.3「未解析不阻塞」相反 | 拆成 `unresolved_config_ref`（error，拒绝）与 `unresolved_bone`（warning，放行）（§4.5） |
| 8 | `OpResult` 缺 docs/12 已使用的 `path`，也缺 `dropped_fields` | 补齐字段与错误码（§12） |
| 9 | `services` 依赖顺序写成 `core → doc → ops → services`，但 `collectIssues` 仍在 `mode/` | 明确过渡期允许 `services → mode`，P4 再下沉（§8） |
| 10 | 多处数字/行号口径不准 | 全部重算，并把「读点」改为「写点」（§2） |

### 0.1 本轮实测校正（与审阅结论不一致之处）

| 审阅说法 | 实测 | 依据 |
|---|---|---|
| `PartCodec` 的 `id` 是必填，`importPart` 要注入 `part_id` | **`PartCodec` 没有 `id` 字段**；零件 ID 只由 `parts` 的 map key / 文件名承载，注入步骤取消 | [part_codec.js:37](../src/codec/codecs/part_codec.js) |
| `hit_box.overwrite` 有 18+ 字段 | **16** 个字段 | `hit_box_attr.schema.json` 的 `properties.overwrite` |
| 哨兵是 `part` / `subpart` / `vehicle` | 模组只解析 **`local` / `global`**；这三个值不存在（D19：不保留、不告警、不迁移） | [ISignalSender.java:207](../../Machine-Max/src/main/java/io/github/sweetzonzi/machine_max/common/mech/signal/ISignalSender.java)（兄弟仓库） |
| `interact_box.signal_targets` 无额外约束 | schema **required**，Codec 默认 `{}`，属已知漂移 | `interact_box_attr.schema.json:33` |

> 另：schema 的 `examples` 大量使用短 key（`sub_parts` 写 `"ae86_chassis_all_terrain"`、`power_output` 写 `"transmission"`、`signal_targets` 写 `["car_controller","engine"]`），与插件实际写的完整翻译键不一致。**examples 不是契约**，v3 只以 `properties/required/enum/$ref` 为准，并在 §5.4 说明完整 key 的依据。

---

## 1. 背景与目标

docs/11 落地了「改配置必须走业务函数、撤销边界在业务函数内部」，但只覆盖结构性动作（`src/core/operations.js` 的 16 个函数）。字段编辑仍散在 UI：`App.vue.js` 23 个方法靠 `wrapMethodMap` 人工包装、`SubsystemPanel` 18 处 / `ConnectorPanel` 6 处直接 `$set`、5 个计算属性里有 9 处写入（含一处渲染时 `delete`）。

这套结构对「人点面板」够用，对下面三件事不够：MCP 需要可序列化的操作描述（AI 没有 `this`、选中元素、`_uiState`）；维护上同一模式重复数十次、副作用散落；测试上仓库有 `bunfig.toml` 但无 `test/`。

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
| 子系统面板直写 | `SubsystemPanel.vue.js` | **18 处 `$set` + 4 处 `$delete`** |
| 连接点面板直写 | `ConnectorPanel.vue.js` | **6 处 `$set` + 4 处 `$delete`** |
| 计算属性内写入 | `App.vue.js` | **5 个属性 / 9 处**：`selectedSubPartConfig` 287/298/302、`selectedHitBoxConfig` 486、`selectedInteractBoxConfig` 559、`selectedConnectorConfig` 601/611/615 的 `$set` + `subPartEntries` 202 的 `delete` |

两个面板合计 **24 处 `$set` + 8 处 `$delete`**；`ui/panels/*.html` 模板内没有 `$set`/`$delete`（v2 的「模板侧 18+4」是重复计数）。

### 2.3 副作用（口径：`src/**/*.js`，排除函数定义、注释、import 解构）

| 副作用 | 调用点 | 文件 | 备注 |
|---|---|---|---|
| `saveConfig()` | 19 | 12 | 含 `persistence.loadConfig` 内部 1 处 |
| `refreshOutlinerIcons()` | 17 | 7 | 排除 `undo.js` 后 16/6 |
| `dispatchEvent('update_selection')` | 22 | 7 | 排除 `undo.js` 后 20/6 |
| `showToast(...)` | 112 | 21 | 排除 `undo.js` 后 111/20 |
| `require('fs'/'path')` | — | **13** | `content_pack`、`zip_reader`、3 个 generator、`drag_import`、`dependency_editor`、4 个对话框、`export_pipeline`、`file_writer`、`persistence` |
| `fs.writeFileSync` | **8** | **4** | `persistence` 1、`file_writer` 3、`export_pipeline` 3、`content_pack` 1 |

> 这些数字由 P1 交付的 `scripts/audit-stats.js` 生成，避免再次漂移。

### 2.4 校验现状

`mode/validation.js → collectIssues(config)` 是唯一实现（`validation_check.js` 调的也是它）：**14 个 error 产生点 / 3 个 warning 产生点**（P2 增加 `DANGLING_SIGNAL_TARGET` 后为 15 条 error 规则），但 warning **只有 1 个 code**：`ORPHAN_ELEMENT`（分布在 `hit_box` / `connector` / `interact_box` 三个分支）。

重复的只有名称唯一性两套：`naming.validateNameUniqueness`（UI rename 调用）与 `validation._collectNameConflicts`；外加 `operations.js` 内的存在性检查。

### 2.5 已确认的其它债务

- **默认值双源**：`config.js` 内联 `HIT_BOX_DEFAULTS`（`material: ''`）vs `HitBoxCodec`（`machine_max:default`）；`config_defaults.js` 已 `@deprecated` 且无人引用。
- **子系统类型数**：上游 builtin schema **19** 种（权威）；插件 Codec 22 种（缺 `track_controller`/`track_drive`，多 5 个 WIP）；D18 删除 5 个 WIP 后为 17，D13 补 `track_*` 后回到 19；Java 枚举 24 种（19 + 5 个 WIP，不作依据）。见 §3.2。
- **旧的信号默认值**：`subsystem_types.js` 的 `speed_outputs` / `gear_outputs` 默认值仍是 `['subpart','vehicle']`，而这两种目标已不存在（D19）；P2 必须改为 `['local','global']`，否则新建子系统即产生无效目标。
- **单子零件简写的落点错误**：`VariantCodec.sub_parts` 用 `Codec.either`，单对象会包成 `{ default: sp }`，而 schema 规定单子零件应落到 `sub_part.<ns>.main`；导出时 `default` 又满足 unwrap 条件，形成「内存 key 非法、文件形态却正确」的隐性错误（§5.3）。
- **默认名硬编码命名空间**：`generateDefaultName('sub_part', …)` 忽略 `context.namespace`，始终返回 `sub_part.machine_max.main`（[naming.js:39](../src/core/naming.js)）。P2 一并修。
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

### 3.2 快照状态与类型真值

**当前状态（P0 已完成）**：vendored 快照 153 个文件，与 `Machine-Max@9450a0f4` 逐文件 SHA256 一致，`node scripts/sync-schemas.js --check` 零漂移。

> 历史数字：同步**前**插件 67 个文件、上游 60 个（同 35 / 异 25 / 缺 7），已由全量替换解决；不要再把 60/67 当现状。

**类型集合以上游 builtin 为准**：

| 来源 | 数量 | 相对上游的差异 |
|---|---|---|
| **上游 builtin schema**（`docs/{zh_cn,en_us}/schemas/subsystem/`，权威） | **19** | —（dynamic 与 static 枚举一致） |
| 插件 `SubsystemDispatchCodec` | 22（**D18 后 17**） | 多 5 个上游未收录的 WIP（`battery`、`signal_convert`、`joint`、`javascript`、`ammo_loader`，将被删除）；缺 `track_controller`、`track_drive` |
| Java `SubsystemTypes` 枚举 | 24 | 上游 19 + 上述 5 个 WIP 占位；**不能作为类型清单依据** |

结论：

- 履带子系统在插件里无法创建/校验（`Unknown dispatch type`）：Codec 缺 `track_controller` / `track_drive`；
- 插件反而暴露了 5 个上游未发布的 WIP 类型，会产出上游读不懂的配置；
- **D18**：5 个 WIP 类型**删除**（`SubsystemDispatchCodec` 22→17、`subsystem_types.js`、面板与类型清单同步移除）；不保留 decode/read、不告警、不提供兼容层，遇到这些 type 一律 `unknown_type`；
- D13 立项范围：补 2 个正式类型（Codec + `subsystem_types.js` + 面板），补完后 Codec 与 schema 都是 19；5 个 WIP 已按 D18 删除，不再讨论去留。

顺带修掉的上游缺陷（`Machine-Max@9450a0f4`，已同步）：`motor_controller` 是 `motorbike_controller` 的错写——枚举中两种拼写并存，而 `if/then` 分支只用了错写那个且 `$ref` 指向 `motorbike_controller_*_attr.schema.json`，导致**正确的 `motorbike_controller` 匹配不到任何分支**（字段完全不校验）；此外 `subsystem_static_attr` 的枚举整体漏了 `motorbike_controller`。修复后 dynamic 与 static 枚举一致为 19 种。

> vendored 快照的溯源 commit 为 **`9450a0f4`**（在 `26ae8841` 基础上含上述修复）；`sync-schemas.js --check` 当前零漂移。

**key 不是 schema 约束**：`variant_attr.schema.json` 的 `sub_parts` 只写了 `additionalProperties`，没有 `patternProperties`；它自己的 examples 还用短 key（`"turret_base"`）。因此「`sub_part.<ns>.<name>`」是**插件侧约定**（翻译键 + 面板/导出/l10n 共用），不是上游要求。严格的理由是可逆性（read → import 无损），不是合规性；迁移只是把插件自己的历史写法收敛到这套约定（§15）。

### 3.3 已知 schema ↔ Codec 差异

| 字段 | schema | Codec | 处置 |
|---|---|---|---|
| `sub_part.hit_boxes` | `required` + `minProperties: 1` | 无约束 | 由校验器负责（已实现，§4） |
| `hit_box.id` | 有默认 `"part"`，非必填（`required` 只有 `type`） | `.field()` 必填 | 本期修 Codec（`.default('part')`，D12） |
| `hit_box.type` | `enum: [box,sphere,cylinder,capsule,wheel]` | `STRING` | allowlist（写入期由 `field_specs.enum` 拦；导出不拦） |
| `hit_box.overwrite` | 结构化 **16** 字段、`additionalProperties:false` | `Codec.ANY.nullable()` | allowlist（`field_specs` 用 object 规格描述，见 §5.2） |
| `interact_box.condition` | `enum: [AND,OR,NAND,NOR,XOR,XNOR]` | `STRING` 默认 `NOR` | 本期加枚举（D12） |
| `interact_box.signal_targets` | `required` | `.default({})` | allowlist；新建交互区不写目标属合法中间态 |
| `connector.definition` | `required` | `.default('')` | 由校验器负责（已判 error） |
| `subsystem.definition` | `required` | `.field()`（写 `null`） | 本期改为 `.nullable()` + 导出前清洗（§4.4） |
| `sub_part.hydrodynamics` | 默认 `{"":{}}` | 默认 `{}`（空 map 跳过） | allowlist（导出省略等价于默认） |
| 多数对象 | `additionalProperties: false` | 宽松保留 | allowlist，单独排期 |
| `sub_part.projected_area` | `$ref vector_3d` = `number[3]` | `FLOAT.list(3)` | **一致**（schema 自身 example 写成 `{x,y,z}`，是文档 bug） |

> 另注：`interact_box_attr` 的第二个 example 用了枚举外的 `"interact_mode": "toggle"`；`hit_box_attr` 的 example 从 `subpart.has_connector(...)` 改为 `local.has_connector(...)`；`gearbox` 等 schema 的 `power_output` example 仍是短名。**schema 的 examples 不能当契约**，只用 `properties/required/enum/$ref`。

---

## 4. 校验模型：一套规则，两种后果

### 4.1 原则

- **写入期只保证「可被解释」**：类型 / 枚举 / 数组长度 / key 格式 / 父节点存在 / **配置引用指向本变体内的真实节点**——违反即拒绝。
- **骨骼引用不阻塞**：导入时模型元素可能尚未建好，`start_bone`、`hit_boxes` key、`interact_box.bone`、`connector.locator` 解析不到时只记 warning，写进 `unresolved_bones`。
- **完整性只提示，不阻断编辑**：新建子零件没有碰撞箱、子系统没选型号，都是**合法中间态**。
- **导出期用同一份规则集，遇 error 阻断**。

因此**不设「可空字段清单」**：`collectIssues` 已经把「碰撞箱为空」「未指定型号」判为 error，编辑期它只出现在 Blockbench 原生清单与面板徽标里，用户可继续编辑；导出时同一批 issue 变成闸门。

### 4.2 分层职责

| 层 | 负责 | 执行者 | 违反时 |
|---|---|---|---|
| 写入合法性 | 类型 / 枚举 / 长度 / key 格式 / 父节点 | `doc.field_specs` + `doc.address` + Codec | `ok:false`（`type_mismatch` / `invalid_enum` / `invalid_format` / `not_found`） |
| 引用合法性 | 配置引用必须指向同变体内的子系统 / 连接点 / 交互区 | `doc.refs.resolveConfigRefs` | `ok:false`（`unresolved_config_ref`） |
| 骨骼可解析性 | 骨骼 / Locator 名能否命中 `Group` / `Locator` | `doc.refs.resolveBones` + `ports.bones` | warning（`unresolved_bone`），照常写入 |
| 完整性 | required / minProperties / 名称唯一 / 保留名 / 型号存在 | `collectIssues` | 编辑期：仅提示；导出期：**阻断** |
| 信号目标完整性 | `signal_targets[*][]` / `power_output` / `power_target` 指向同变体节点或 `local`/`global` | `collectIssues`（`DANGLING_SIGNAL_TARGET`，P2 新增一条规则） | 编辑期：提示；导出期：**阻断** |

> D19 之后 `part` / `subpart` / `vehicle` 没有特殊处理：它们和任意未知目标一样走「信号目标完整性」，不再有单独的告警或迁移。

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
- 现状是「仅提示不拦截」（[export_dialog.js:307](../src/ui/export/export_dialog.js)），本期改为阻断。
- 14 个 error 产生点逐条确认可定位（都带 `path`）；`ORPHAN_ELEMENT` 放行。

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
3. 导出闸门（§4.3）兜底，把「未指定型号」变成阻断项。

> 待复核：`definition: null` 进入 `PartCodec.decode` 时 `STRING.decode(null)` 会抛错；当前加载路径只有命中 `migrateIfNeeded` 才会 decode，故未必触发。P2 一并验证。

### 4.5 两类「未解析」必须分开

v2 在 §4.1 要求「引用能解析成节点，违反即拒绝」，又在 §5.3 说「未解析进 `unresolved_references`，不阻塞」，实现时必然二选一。v3 拆成两个结果字段：

| 字段 | 含义 | 处置 | 典型来源 |
|---|---|---|---|
| `unresolved_config_ref` | 字符串指向的**配置节点**不存在 | **error**：`import*` / `setField` 返回 `ok:false`，不写入 | `subsystems[*].power_output`、`hit_boxes[*].subsystem`、`connectors[*].power_target`、`signal_targets[*][]`、`subsystems[*].connector` |
| `unresolved_bone` | 字符串指向的**模型元素**不存在 | **warning**：照常写入，进入 `OpResult.warnings[]` 与面板提示 | `start_bone`、`end_bones[]`、`mass_center`、`hit_boxes` key、`interact_box.bone`、`connector.locator`、`subsystems[*].locator`、`dismount_locators[]` |

理由：配置引用写坏会让导出结果直接失效（模组侧找不到目标），而骨骼引用在建模早期必然悬空；把两者混成一个「不阻塞」会让前者的错误静默，混成「都拒绝」会让导入无法用于半成品模型。

---

## 5. 配置文档 API（`src/doc/`）

### 5.1 路径语法 v3

**主形式：段数组**（无歧义，MCP 的 JSON 参数天然支持）

```js
['parts', 'hull', 'variants', 'default', 'sub_parts', 'sub_part.machine_max.chassis', 'mass']
```

**字符串形式：JSON Pointer（RFC 6901）**

```js
'/parts/hull/variants/default/sub_parts/sub_part.machine_max.chassis/mass'
```

- 分隔符是 `/`，所以含 `.`、`:` 的 key，以及零件/变体的中文名，**天然是一段**（子零件名不允许中文，见 §5.1.3）；
- 转义：`~0` → `~`，`~1` → `/`；空段表示空字符串 key（`hydrodynamics` 允许 `""`）。

#### 5.1.1 解析规则：按位置，不按名字

两种形式都已经切好段，**不需要任何「猜切分」**。解析只看当前节点类型：

| 当前节点 | 下一段的含义 | 说明 |
|---|---|---|
| 配置根 / 零件 / 变体 / 子零件 / 碰撞箱 / 交互区 / 连接点 / 子系统（record） | **字段名** | 必须在 `field_specs` 或内部字段表里；否则 `unknown_field` |
| `parts` / `variants` / `sub_parts` / `hit_boxes` / `interact_boxes` / `connectors` / `subsystems` / `hydrodynamics` / `textures` / `signal_targets` / `signal_translations` / `overwrite` / `power_outputs` / `projectile_types`（map） | **key** | 即使这个 key 叫 `mass`、`variants`、`parts`，也仍然是 key；不参与关键字判断 |
| 数组（`end_bones` / `projected_area` / `dismount_locators` / 各种 `*_outputs` 的值） | **整数下标** | 非整数或越界 → `not_found` |

因此 v2 的「固定段名优先」「最长已存在 key 前缀」「多种切分 → `ambiguous_path`」全部删除：

- map 层的 key 由**位置**决定，不存在歧义；
- **没有相对语法**：`..` 不是合法段，返回 `invalid_format`；需要相对定位时由调用方传 `opts.base`（一般是 `['parts', activePartId, 'variants', activeVariantName]`），MCP 侧体现为省略前缀 + 工具内部补 base；
- `ambiguous_path` 从错误码表移除（§12）。

#### 5.1.2 通配符与保留字符

- `*` 是**整段 token**，至多一个；只允许出现在 **map 层**（数组层用 `*` 返回 `invalid_format`，因为数组没有 key 语义）；结果按该层 key 收起。
- **`*` 不能作为字面 key**：插件创建的 map key（partId / variant / 子零件 / 连接点 / 子系统 / 交互区 / 纹理名 / 频道名）在创建、重命名、导入时拒绝 `*`，存量数据迁移时报 `KEY_RESERVED`。`hit_boxes` / `hydrodynamics` 的 key 是模型元素名，只禁止 `*`，其余字符原样保留。这样「字面量 `*`」不需要转义规则，也不会与通配符冲突。
- `~` 与 `/` 只影响 JSON Pointer 形式：它们由 `~0` / `~1` 转义；段数组形式不需要转义。翻译键（子零件/连接点/子系统/交互区）额外禁止这两个字符，元素名不受限（Pointer 里照常转义即可）。

#### 5.1.3 key 规范（D16 / D17）

**子零件（强制）**：

```
^sub_part\.<namespace>\.[A-Za-z0-9_.-]+$        // 纯 ASCII
```

- `<namespace>` = `config.namespace`（缺省 `machine_max`），字符集 `[a-z0-9_-]+`（小写，进 resource location），**不含点**（点是分隔符）；
- 名称段只允许 ASCII 字母/数字、`_`、`-`、`.`；**中文与非 ASCII 一律拒绝**（`invalid_format`，`hint` 提示改用英文名）；
- 名称段禁止：非 ASCII、空白、`*`、`/`、`~`、`:` 与控制字符；不得为空，长度 ≤ 128；
- 名称段以 `.` 开头或结尾 → `invalid_format`；
- 名称就是翻译键，没有独立的显示名：需要中文展示时写 `lang` 文案，不要把中文放进 key（D17）。

**其它翻译键（前缀形态只告警，字符集同样强制 ASCII）**：

| kind | 规范形态 |
|---|---|
| `interact_box` | `interact.<ns>.<name>` |
| `connector` | `connector.<ns>.<name>` |
| `subsystem` | `subsystem.<ns>.<name>` |

`<name>` 与子零件同名规则：纯 ASCII、无空白与 `* / ~ :`；中文一律 `invalid_format`（D17）。前缀/namespace 不合规范只记 warning `non_canonical_key`，但字符集违规是硬错误。

`createPart` / `createVariant` 的 `partId` / `variantName` 不是翻译键，但同样只允许 ASCII：

| key | 字符集 | 原因 |
|---|---|---|
| `partId` | `[a-z0-9_.-]+` | 会进入 resource location（`machine_max:textures/part/<partId>/…`）与 `parts/<partId>.json` 文件名，必须小写 |
| `variantName` | `[A-Za-z0-9_.-]+` | JSON map key / lang key，不需要小写 |
| 纹理名、信号频道名 | `[A-Za-z0-9_.-]+` | 同上 |
| 模型元素名（`hit_boxes` / `hydrodynamics` 的 key） | 任意（除 `*`，**唯一例外**） | 来自 Blockbench 骨骼 / Locator 名，不能强迫改名 |

`config.namespace` 自身必须是 `[a-z0-9_-]+`（进 resource location），在内容包设置入口校验。

**为什么子零件连格式一起强制、其它只强制字符集**：`sub_parts` 有整件通道（`import_sub_part`）和 `read_node(as='definition')` 的 round-trip 验收，key 必须可逆；连接点/子系统/交互区的整件通道在 D9 里已排除，v3 只强制 ASCII 字符集，前缀形态暂只告警；它们的存量非 ASCII key 记 `KEY_RESERVED` error，但不在 `loadConfig` 里自动改名（改名要同步第 5~11 行引用，留到后续）。

**强制点**：`ops.createPart` / `ops.createVariant`（新 key）、`ops.rename*`（4 个）与 `ops.importSubPart` / `ops.importSubsystem` 的 key、`ops.mark*` 的自动命名、`loadConfig`（仅子零件迁移，§15）。字符集违规返回 `invalid_format`，`errors[]` 带 `expected` 与 `hint`（提示完整形态）。

#### 5.1.4 读写差异与 `allowMissingLeaf`

| 场景 | 行为 |
|---|---|
| 读：中间段不存在 | `not_found` |
| 读：最后一段不存在 | `not_found` |
| 写：最后一段是 map 的新 key（如 `textures.newKey`、`signal_targets.new_channel`） | `allowMissingLeaf: true`（写操作默认）时创建；`false` 时 `not_found` |
| 写：最后一段是 record 的未知字段 | 一律 `unknown_field`（字段白名单不可绕过） |
| 写：中间段不存在 | `not_found`（不自动建父级；`opts.createParents` 仅限 `textures`/`overwrite` 这类对象容器，由 `sideEffect: ensure_object` 触发） |

#### 5.1.5 测试向量（P1 必过）

| # | 输入 | 期望 |
|---|---|---|
| 1 | `['parts','hull','variants','default','sub_parts','sub_part.machine_max.main','mass']` | 命中 |
| 2 | `'/parts/hull/variants/default/sub_parts/sub_part.machine_max.main/mass'` | 命中 |
| 3 | `['parts','hull','variants','default','sub_parts','sub_part.machine_max.chassis','hit_boxes','底盘骨骼','id']`（模型元素名可为中文，其余 key 必须 ASCII） | 命中 |
| 4 | `['parts','a.b.c','variants','default','sub_parts','sub_part.machine_max.x','mass']`（零件 id 含点） | 命中（段数组） |
| 5 | `['parts','hull','variants','default','sub_parts','*','mass']` | `{ <spKey>: number }` |
| 6 | `['parts','hull','variants','default','sub_parts','chassis']`（非规范 key） | `not_found`（迁移后不可能存在；写入侧 `invalid_format`） |
| 7 | `['parts','hull','_uiState','activePartId']` | `unknown_field` |
| 8 | `['parts','hull','variants','default','sub_parts','sub_part.machine_max.x','connectors','connector.machine_max.c','signal_targets','door']`（写，末段新 key） | 命中（`allowMissingLeaf`） |
| 9 | 同 8 但父级 `connectors` 不存在 | `not_found` |
| 10 | `['parts','hull','variants','default','sub_parts','*','projected_area','*']`（数组层通配） | `invalid_format` |
| 11 | 写入 key `sub_part.machine_max.底盘` / `sub_part.machine_max.前 底盘` | `invalid_format`（非 ASCII / 空白） |
| 12 | `createPart` 的 `partId` 为 `底盘` 或 `Hull` | `invalid_format`（非 ASCII / 非小写） |

**`hit_boxes` 双形 key**：对外是骨骼名、内存是 UUID；解析时先按 UUID 命中 `ports.bones.findByUuid`，再按骨骼名查 `Group.all`。两者都不中时，**只有读取允许**按原字符串命中（未解析的存量条目），写入需先建元素或显式给 UUID。

### 5.2 字段规格（`field_specs.generated.js`）

**来源**：`scripts/gen-field-specs.js` 读取 builtin schema，输出紧凑 manifest。Codec **不参与**生成（避免 §0 第 2 条的泄漏）。

#### 5.2.1 规格类型模型

v2 只有 `type: 'number'` + `items/minItems/maxItems`，表达不了 `textures`、`overwrite`、`projected_area`、`end_bones` 等。v3 扩为：

```js
{
  kind: 'sub_part', key: 'mass',
  type: 'number',            // number | integer | string | boolean | array | object | tuple | any
  integer: false,
  nullable: false,           // 允许 null（仅 .nullable() 字段，如 subsystem.definition）
  minimum: 0, maximum: null,
  enum: null,                // string 枚举
  oneOf: null,               // [{type,...}, ...]，如 textures: string | object
  properties: null,          // object 的字段表（overwrite）
  additionalProperties: null,// object 的值规格；false 表示封闭
  items: null,               // array 的元素规格
  minItems: null, maxItems: null,
  tuple: null,               // tuple 的逐位规格，如 projected_area: [number, number, number]
  references: null,          // 'bone' | 'locator' | 'subsystem' | 'connector' | 'signal' | 'resource'
  required: false,           // 仅用于展示与校验提示，不在写入时阻断
  sideEffect: null,          // 见下表
}
```

关键字段的生成结果：

| 字段 | 规格 |
|---|---|
| `variant.textures` | `oneOf: [{type:'string', references:'resource'}, {type:'object', additionalProperties:{type:'string', references:'resource'}}]` |
| `variant.model` / `animations` | `type:'string', references:'resource'`（schema 的 `$ref` 是 `resource_location` = 纯 string；它自己的 example 写成 map，属 examples bug，Codec 也只接受 string） |
| `hit_box.overwrite` | `type:'object', properties: {16 个}, additionalProperties: false` |
| `connector.overwrite` | `type:'object', properties: {12 个}, additionalProperties: false` |
| `sub_part.projected_area` | `type:'tuple', tuple:[number,number,number], minItems:3, maxItems:3` |
| `sub_part.end_bones` | `type:'array', items:{type:'string', references:'bone'}` |
| `subsystem.seat.dismount_locators` | `type:'array', items:{type:'string', references:'locator'}` |
| `subsystem.*.signal_targets` | `type:'object', additionalProperties:{type:'array', items:{type:'string', references:'signal'}}` |
| `subsystem.*.power_output` | `type:'string', references:'signal'` |
| `hit_boxes` / `interact_boxes` / `connectors` / `subsystems` | 容器由 `address` 处理，不生成字段规格 |

`setField` 的值校验顺序：`nullable` 短路 → `oneOf` 逐个尝试 → `type` 基础校验 → `enum` / `minimum` / `maximum` → `tuple` 长度 → `items` 递归 → `properties` / `additionalProperties` 递归。任一失败返回 `errors[]`（可多条），不写入。

#### 5.2.2 类型清单

- 普通 kind 的规格来自对应 schema；
- `subsystem` 按 `typeId` 分组，**只生成上游 19 种**（由 `subsystem_dynamic_attr.schema.json` 的 `if/then` + 各类型 schema 展开）；
- **D18**：5 个 WIP 类型从 `SubsystemDispatchCodec` 与 `subsystem_types.js` 删除（22→17）；不保留 decode/read、不告警、不提供兼容层，遇到这些 type 一律 `unknown_type`；
- `schema_codec_allowlist.js` 只登记 `track_controller` / `track_drive` 两个缺口；D13 补齐后 Codec 与 schema 都是 19，allowlist 归零。

#### 5.2.3 副作用表（唯一手写部分：8 个字段 / 6 条规则）

| kind.field | 副作用 id | 行为 |
|---|---|---|
| `sub_part.start_bone` | `migrate_sub_part_marker` | 标记迁到新骨骼 UUID，成功后重算 `auto_end_bones` |
| `interact_box.bone` | `rebind_interact_marker` | 重新解析 marker（**新增行为**，现状只 `markerVersion++`） |
| `connector.definition` | `sync_marker_config_ref` | 同步 marker 的 `config_ref`（统一为 key 后可能不再需要，见 §5.4） |
| `connector.locator` | `migrate_connector_marker` | 标记迁到新 Locator |
| `hit_box.overwrite` / `connector.overwrite` / `variant.textures` | `ensure_object` | 惰性建对象；`textures` 单键按简写处理 |
| `subsystem.type` | `rebuild_type_fields` | 重建类型专属字段，返回 `dropped_fields`（**新增行为**，现状无类型切换路径） |

> 修正 v1 两处错误：`end_bones` **不触发** `recalcAutoEndBones`（`auto_end_bones` 由标记推导）；`interact_box.bone` 的重绑是新增行为。

#### 5.2.4 写入期归一化

`setField` 默认 **strict**（`"12.5"` 报 `type_mismatch`，不做隐式转换）。UI 输入框在调用前自行 `parseFloat`（现有面板已如此），MCP 不 coerce。

### 5.3 投影（`doc/projection.js`）

内部树与对外定义不是同一形状：

| 差异 | 对外定义 | 内部树 |
|---|---|---|
| `hit_boxes` key | 骨骼名 | UUID（找不到 Group 时**保留原字符串**，见 `part_generator._resolveUUIDKeys`） |
| `interact_boxes[*]._uuid` / `connectors[*]._marker_uuid` | 无 | 有 |
| `variants` | 仅当唯一 key 恰为 `default` 时才是单对象简写 | map |
| `sub_parts` | 单对象简写**没有 key**（schema 规定落到 `sub_part.machine_max.main`） | map，key 必须是规范 key |
| 默认值字段 | 可省略 | 全量（decode 补齐） |
| `auto_end_bones` / `_unresolved_bones` / `element_markers` / `_uuid` / `_marker_uuid` / `__new_p_*` | 无 | 有 |
| `textures` | `string` 或 map | map（`{default: string}`） |

#### 5.3.1 `projection.in(definition, ctx)` — 顺序不可乱

`ctx = { kind, namespace, partId, variantName, parentPath, existing }`；返回 `{ node, reset_fields, unresolved, markerPlan }`，**不写全局对象**。

1. **形状归一化**（`normalizeShorthand`）
   - `variant.textures`: `string` → `{ default: string }`；
   - `variants`: 若对象自身含 `model` 字段 → 视为单变体，包成 `{ default: v }`；
   - `sub_parts`: 若对象自身含任一子零件字段（`hit_boxes` / `start_bone` / `mass` / …）→ 包成 `{ 'sub_part.' + ns + '.main': sp }`，**不是 `default`**；
   - `hit_boxes` / `interact_boxes` / `connectors` / `subsystems` **不做简写归一化**（key 就是身份）。
2. **剥内部字段**（`stripInternal`）
   - part: `element_markers`、`_unresolved_bones`；
   - sub_part: `auto_end_bones`；
   - interact_box: `_uuid`；
   - connector: `_marker_uuid`；
   - subsystem(regen_loader): `projectile_types` 里 `__new_p_*` 前缀项；
   - 所有层级：`_uiState`（不属于任何导出节点）。
3. **校验 key**（`validateKeys`）
   - `sub_parts` 逐 key 匹配 §5.1.3 正则且 namespace 等于 `ctx.namespace`；违规 → `invalid_format`（一次返回全部违规 key，不写半截）；
   - 其它**翻译键** map（`interact_boxes` / `connectors` / `subsystems`）：非空、纯 ASCII、无 `*` `/` `~` `:` 与控制字符；字符集违规 → `invalid_format`；前缀不合规范只记 warning `non_canonical_key`；
   - `hit_boxes` / `hydrodynamics` 的 key 是模型元素名：只拒绝空串与 `*`。
4. **严格解码**（`decodeStrict`）
   - 用 `doc/shapes.js` 的 `PartShape` / `VariantShape` 显式 `Codec.map` 组合（`VariantShape.sub_parts = Codec.map(Codec.STRING, SubPartCodec)`）；
   - **不使用 `either`**：`either.decode` 用「key 里有没有 `.` 或 `:`」猜简写（[Codec.js:561-586](../src/codec/Codec.js)），`{chassis:{…}}` 会被 `SubPartCodec` 全默认解码吞成 `{default:{…,chassis:{…}}}`；`Codec.either` 仅保留给导出/旧加载路径；
   - `reset_fields`：`existing` 中存在、但本次输入（归一化后）没有的**顶层字段**；结构动作的 `reset_fields` 为空。
5. **解析 `hit_boxes` key**（`resolveHitBoxKeys`）
   - key 已是 UUID 且命中 → 保留；
   - key 是骨骼名 → 命中则换成 UUID，未命中则保留骨骼名并记 `unresolved_bone`（`field: 'hit_box_key'`）。
6. **解析元素引用**（`resolveElementRefs`）
   - `interact_boxes[*].bone` 命中 Group → 写 `_uuid`；未命中 → 不写 `_uuid`，记 `unresolved_bone`；
   - `connectors[*].locator` 命中 Locator → 写 `_marker_uuid`；未命中 → 记 `unresolved_bone`。
7. **校验配置引用**（`resolveConfigRefs`，§4.5）
   - `power_output`、`hit_boxes[*].subsystem`、`connectors[*].power_target`、`subsystems[*].connector`、`signal_targets[*][]` 必须指向**同一子零件内**的 subsystems / connectors / interact_boxes 条目，或哨兵 `local`/`global`；
   - 未命中 → `unresolved_config_ref`（error，整体拒绝）；只有 `local`/`global` 是例外，`part`/`subpart`/`vehicle` 按普通未知目标处理（不存在、不告警、不迁移）。
8. **生成标记计划**（`markerPlan`，不执行）
   - `sub_part`：`start_bone` 命中 → `{type:'sub_part', uuid, config_ref: key}`；
   - `hit_box`：每个命中骨骼 → `{type:'hit_box', uuid, config_ref: 所属子零件 key}`；
   - `interact_box` / `connector` 同理（`config_ref` 为条目 key）；
   - `ops` 在**同一笔撤销**里通过 `ports.markers` 落地（§7.1）。
9. **返回** `{ node, reset_fields, unresolved: { config_refs: [], bones: [] }, markerPlan }`。

**关于 `part_id`**：`PartCodec` 没有 `id` 字段（[part_codec.js:37](../src/codec/codecs/part_codec.js)），`importPart` 的 `part_id` 只作为 `parts` 的 map key / 文件名，**不注入到节点里**。审阅中「注入 part_id」的步骤取消；若输入带了 `id`，按未知字段原样保留（宽松 decode），导出时由 schema 剥离。

#### 5.3.2 `projection.out(node, ctx, opts)` — 两种模式

`opts.for = 'read' | 'export'`（默认 `read`）。

1. **深拷贝**，不修改内部树；
2. **剥内部字段**：与 `in` 第 2 步同一张表；`__new_p_*` 一并清理；
3. **`hit_boxes` key 反转**：key 命中元素 UUID → `ports.bones.findNameByUuid` 换成骨骼名；key 本身是骨骼名或未命中 → 原样保留（未命中记 `unresolved_bone`）；
4. **去内部键**：`interact_boxes[*]._uuid`、`connectors[*]._marker_uuid`；
5. **简写策略**：`variants` 在 `read` 模式下**保持 map**（保证 round-trip 的 key 不丢）；`export` 模式交给 `Codec.either.encode`（唯一 key 为 `default` 时才折叠）。`sub_parts` **永不折叠**（schema 的简写没有 key，折叠会丢 `sub_part.<ns>.*` 身份；单条目 map 同样合法）；
6. **默认值**：`read` 模式保留全量字段（decode 已补齐），使 `in(out(x))` 的 `reset_fields` 为空；`export` 模式走 `Codec.encode`（省略默认值、剥离 schema 外字段）；
7. 返回 `{ definition, unresolved }`。

**round-trip 保证**（对应 §11 测试）：

```
in(out(node, 'read'), { existing: node }) ≡ node   （结构等价，reset_fields 为空）
```

含 `hit_boxes`（UUID↔骨骼名）、单变体/单子零件、未解析骨骼、`definition: null` 的节点都必须成立。

#### 5.3.3 单子零件简写的落点（v3 修正）

`Codec.either` 的 wrap key 固定是 `default`（[Codec.js:530](../src/codec/Codec.js)）。对 `variants` 这是对的；对 `sub_parts` 不对——schema 规定单子零件用 `sub_part.machine_max.main`。因此：

- `in` 显式把单对象写成 `{ 'sub_part.<ns>.main': sp }`；
- 旧数据若因 `either` 解出 `{ default: sp }`，`loadConfig` 迁移为 `sub_part.<ns>.main`（§15）；
- `out` 不输出单对象简写，避免「文件形态正确、内存 key 丢失」的来回漂移。

#### 5.3.4 存量数据（`loadConfig` 一次性修复，见 §15）

- 非规范 `sub_parts` key → **改写为规范 key**（唯一性冲突加后缀），同步更新 `element_markers` 的 `sub_part` / `hit_box` `config_ref`；
- 单变体 / 单子零件简写、缺失 `hit_boxes` 容器 → 归一化为 map；
- `definition: null` 或 `"null"` → `null`（占位），导出闸门拦截；
- `connector` marker 的 `config_ref` 存着 definition → 统一为连接点 key；
- `_uuid` / `_marker_uuid` 缺失或指向不存在元素 → 按骨骼名 / Locator 名重建；
- 悬空 marker → `cleanGhostMarkers`（已有）；
- 孤儿子零件（无标记）→ 不再在渲染期删除；`loadConfig` 报告 + 面板「创建配置」按钮。

### 5.4 引用矩阵

**target 一律是「完整配置 key」**（`subsystem.<ns>.<name>` / `connector.<ns>.<name>` / `interact.<ns>.<name>` / `sub_part.<ns>.<name>`），不是短名。依据：map key 由文件原样进入模组（`Codec.unboundedMap(Codec.STRING, …)`），而模组的信号解析是 `subSystems.containsKey(targetName)` 的**精确匹配**（[ISignalSender.java:220](../../Machine-Max/src/main/java/io/github/sweetzonzi/machine_max/common/mech/signal/ISignalSender.java)）。

| # | 位置 | 目标 | 删除时 | 重命名时 |
|---|---|---|---|---|
| 1 | `marker.config_ref`（`sub_part`） | 子零件 key | 删标记 | 改写 |
| 2 | `marker.config_ref`（`hit_box`） | 所属子零件 key | 删标记 | 改写（**现状缺失，见下**） |
| 3 | `marker.config_ref`（`interact_box`） | 交互区 key | 删标记 | 改写 |
| 4 | `marker.config_ref`（`connector`） | 连接点 key | 删标记 | 改写（先统一语义，见下） |
| 5 | `subsystems[*].signal_targets[*][]` | 子系统 / 连接点 / 交互区完整 key（或 `local`/`global`） | 移除该项 | 改写 |
| 6 | `connectors[*].signal_targets[*][]` | 同上 | 移除该项 | 改写 |
| 7 | `interact_boxes[*].signal_targets[*][]` | 同上 | 移除该项 | 改写 |
| 8 | `connectors[*].power_target` | 子系统 / 连接点完整 key | 置空 | 改写 |
| 9 | `subsystems[*].power_output` | 子系统 / 连接点完整 key | 置空 | 改写（**新增行**） |
| 10 | `hit_boxes[*].subsystem` | 子系统 key | 置空 | 改写 |
| 11 | `subsystems[*].connector` / `.dismount_locators[]` / `.locator` | 连接点 key / Locator 名 | 置空 / 移除 | 改写 |
| 12 | `start_bone` / `end_bones[]` / `mass_center` / `interact_box.bone` / `connector.locator` / `hit_boxes` key | 骨骼 / Locator 名 | 置空 / 移除（骨骼消失时由 `cleanGhostMarkers` 兜底） | 改写 |

**第 2 行是现成 bug**：`markHitBox` 写入的 `config_ref` 是**所属子零件 key**（[operations.js:433](../src/core/operations.js)、[bone_resolver.js:125](../src/import/bone_resolver.js)），但 `renameSubPart` 只改 `type === 'sub_part'` 的 marker（[App.vue.js:1257](../src/ui/App.vue.js)）。子零件重命名后，其下所有 `hit_box` marker 仍指向旧 key，`cleanGhostMarkers` 会把它们当孤儿清掉。P2 的 `refs.renameRefs` 必须同时处理两类 marker；测试要覆盖「子零件改名 → 碰撞箱标记仍归属正确」。

**第 9 行是现成缺失**：`power_output` 是 `subsystem_types.js` 的动态字段、`required: true`、编辑器 `power_target`，Codec 里也是 `Codec.STRING.field()`（[subsystem_codec.js:20](../src/codec/codecs/subsystem_codec.js)）。删除/重命名目标子系统时必须清理/改写，否则模组侧解析失败。

**第 4 行语义统一**：`connector` marker 的 `config_ref` 现在写的是 `definition` 值（[App.vue.js:1475](../src/ui/App.vue.js)），而 `sub_part`/`interact_box`/`hit_box` 写的是 key。统一为「marker → 被标记配置条目的 key」，`definition` 单独存于配置条目；迁移见 §15。

**哨兵值（只有两个）**：

| 值 | 含义 | 处置 |
|---|---|---|
| `local` | 当前 Part（`Part.getSignalAddress()`） | 保留，永不删除 |
| `global` | 装配体总线（`SubsystemController.getSignalAddress()`） | 保留，永不删除 |

`part` / `subpart` / `vehicle` **不是哨兵**（D19）：它们按普通未知目标处理，写入/导入返回 `unresolved_config_ref`，不告警、不迁移。数据里若还留着这三个值，就当作错误目标，由用户改成 `local` / `global` 或真实节点 key。

> 依据：模组只解析 `local` / `global`（`ISignalSender.getReceiversFromNames`），`subpart` / `vehicle` 只出现在 `VariantAttr.RESERVED_SIGNAL_NAMES` 里作为**禁用名**。但 `subsystem_types.js` 的 `speed_outputs` / `gear_outputs` 默认值仍是 `['subpart','vehicle']`，`buildSignalTargetOptions` 也仍输出这两个值（[signal_target_options.js:24](../src/utils/signal_target_options.js)）——**P2 必须同步改为 `local`/`global`**，否则新建子系统即产生无效目标。另：该函数只列连接点与子系统，未列交互区；第 5~7 行按模组能力描述，P2 补齐选项。

**不计入引用**：`signal_translations` 是「频道名 → 频道名」映射，与配置节点无关（v1 误列）；`definition` 是资源位置（内容包定义 id），由 `collectIssues` 的 `DEFINITION_REF_MISSING` 管，不做删除清理。

`refs` 的 API 分成两组，避免「骨骼未解析」与「配置引用」混在一起：

```js
refs.resolveBones(kind, node, ports)     // → { resolved: [...], unresolved: [{bone, field, subPartKey, key}] }
refs.resolveConfigRefs(config, scope)    // → { resolved: [...], dangling: [{path, target, kind}] }
refs.cleanDangling(config, removed)      // 删除/替换后清理，返回 cleaned_references
refs.renameRefs(config, { kind, oldKey, newKey })  // 含 4 类 marker + 第 5~11 行全部引用
```

### 5.5 原语

```js
doc.read(config, path, opts)             // → {ok, kind, value}
doc.write(config, path, value, opts)     // 标量/数组/对象；返回写入计划，不执行副作用
doc.insert(config, path, key, node)      // map 层新增条目
doc.remove(config, path, opts)           // → {ok, removed, cleaned_references}
doc.apply(config, path, definition, opts)// 整件替换；返回 {node, reset_fields, unresolved, markerPlan}
```

`opts` 公共项：`{ allowMissingLeaf, createParents, source, strict }`。原语**不开撤销记录、不发事件、不碰全局对象**；由 `ops` 用 `runConfigEdit` 包住并执行 §7 的副作用。

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

**key 入口**：`renameSubPart` 与 `importSubPart` 的 key 必须是 §5.1.3 的规范形态；`importPart` / `importVariant` 的 `part_id` / `variant` 只做非空与保留字符校验；其余 `rename*` 接受完整 key，非规范形态记 warning（§5.1.3）。

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
    bones:      { findByName: null, findNameByUuid: null, findByUuid: null, listAll: null }, // Group / Locator
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
- **`saveConfig`**：`Blockbench.on('save')` 与 `loadConfig` 内部的幽灵清理保持直接调用，其余 17 处收敛为 `scheduleSave()`（19 总数 − 保留 2）。

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

**过渡期例外**：`collectIssues` 仍在 `mode/validation.js`，而 `services/validate.js` 与 `doc/ports.validation` 都要用它。P4 之前允许 **`services → mode`** 与 **`ops → ports.validation`**（经端口而非直接 `require`），P4 再把实现下沉为 `core/validation.js`，`mode/validation_check.js` 只做「Problems → 原生清单」的适配。这样 P1–P3 不必等 P4。

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
| `SubsystemPanel` 18 / `ConnectorPanel` 6 | 直接 `$set(this.config, …)` | `ops.setField` |
| 计算属性 9 处写入（含 `subPartEntries` 的 `delete`） | 渲染期改配置 | 删除；缺条目由 `mark*` 建，面板显示「创建配置」按钮，`loadConfig` 一次性 repair |
| `drag_import` | fs + 对话框 + 落盘 | `services/import.js` + `ops.importPart` |
| `bone_resolver` | 仅导入时用 | `doc/refs.js`（导入/删除/重命名共用，§5.3） |
| 19 处 `saveConfig` / 17 处 refresh / 22 处 update_selection | 就地调用 | 事件订阅 + `scheduleSave` |
| `export_dialog` 忽略校验结果 | 仅提示 | `services/export.canExport` 阻断 |

---

## 10. 分期与验收

### P0 — 上游对齐（部分已落地）

- ✅ `scripts/sync-schemas.js`（`--check` / `--apply` / `--source`，不 spawn 子进程，尽力读上游 commit 作溯源）
- ✅ vendored 快照全量替换：`src/builtin/builtin/machine_max/docs` 由 139 → 153 文件，与 `Machine-Max@9450a0f4` 逐文件 SHA256 一致；`--check` 零漂移
- ✅ 7 个缺失 schema 到位（`track_controller` / `track_drive` 的 static+dynamic、`launcher` / `regen_loader` dynamic、`part_fabricating_recipe`）
- ⏳ `scripts/gen-field-specs.js`（codegen，待做；按 §5.2 的类型模型生成，只覆盖 19 种）
- ⏳ `scripts/audit-stats.js`（数字审计，待做）

剩余验收：`gen-field-specs` 能生成 `src/doc/field_specs.generated.js`；`audit-stats` 输出与 §2 一致；manifest ↔ schema 同步测试。

### P1 — 文档层（1 会话）

`doc/{address,field_specs.generated,shapes,projection,refs,ports,index}.js` + `test/` 骨架。

验收：`bun test` 覆盖 §5.1.5 全部测试向量 + §5.3.1/§5.3.2 的 in/out 顺序 + §5.4 全部 12 行；round-trip（含 `hit_boxes`、单变体/单子零件、未解析骨骼、`definition:null`）通过；`require` 全部 `doc` 模块的测试通过（P1 无调用方，dist 不增量，故不以体积为验收）；零行为变更。

### P2 — 操作层（1.5–2 会话）

`src/ops/*`（9 文件）；删除 `core/operations.js`（9 处 require 改写）；UI 44 个方法改薄；§4.4 三项修复；§6.4 合并开关；`renameSubPart` 的 ASCII key 校验 + `hit_box` marker 修复；`generateDefaultName('sub_part')` 用 `context.namespace`；**删除 5 个 WIP 类型**（Codec 22→17、`subsystem_types.js`、面板）；`signal_target_options.js` 改 `local`/`global` 并补交互区；`subsystem_types.js` 默认值改 `['local','global']`；`collectIssues` 增加 `DANGLING_SIGNAL_TARGET`。

验收：每字段改一次 = 一条撤销记录；四个 `import*` 可用且返回 `reset_fields`；拖拽导入回归；`coalesce:false` 下三次 `set_node` = 三条；子零件改名后碰撞箱标记归属正确；非规范 key 的 import 返回 `invalid_format`。

### P3 — 事件总线 + 导出闸门（1 会话）

端口接线（`plugin.js`）、17 处落盘收敛、9 处计算属性写入删除、`canExport` 阻断、默认值双源清理。

验收：`Ctrl+S` 内容不变；未选中元素时渲染不改配置；空碰撞箱的子零件**可正常编辑**但**导出被拦**；新建碰撞箱 `material` 与导入默认一致。

### P4 — `services/` 抽离（1 会话）

`export_pipeline` → `services/export.js`；`drag_import` IO → `services/import.js`；pack 三件套 fs → `services/pack.js`；`collectIssues` 下沉 `core/validation.js`。纯搬移。

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

必测清单（对应 §0 的十条改动与 §5 的约束；最后两项是 v3 新增）：

1. 含点/中文/namespace 带点的路径；`*` 在中间 map 层；数组层 `*` 报 `invalid_format`；
2. `sub_parts` 单 key 反例（`{chassis:{…}}`）必须 `invalid_format`，不得被吞成 `{default:…}`；
3. `read_node` → `import_*` **round-trip**：ASCII 规范 key、含 `hit_boxes`、单变体、未解析骨骼、`definition:null` 五种输入均 `reset_fields` 为空；
4. `field_specs` 不暴露 `id` / `element_markers`；`textures` / `overwrite` / `projected_area` 的类型校验生效；
5. `power_output` / `hit_box.subsystem` / `signal_targets` 的清理与重命名；`signal_translations` 不被清理；
6. `coalesce:false`：不同目标不合并、结构动作不合并；
7. 投影剥离内部字段（注入 `element_markers` / `_uuid` / `_marker_uuid` 后不可见）；
8. `"null"` 清洗（`definition: null` 不出现在导出结果里）；
9. 导出闸门：空 `hit_boxes` 拦截、`ORPHAN_ELEMENT` 放行；
10. `schema` 漂移：manifest ↔ schema、dispatch map ⊇ schema 类型集合（D18 删除后到 D13 前，因缺 `track_*` 该项为已知红灯）；
11. 严格 key：非规范 `import_sub_part` 返回 `invalid_format`；中文/空白 key、中文或大写 `partId` 同样 `invalid_format`；`loadConfig` 迁移后**子零件**旧 key 全部规范化（非 ASCII 名改为 `legacy_<n>`），marker 同步；
12. 哨兵：只有 `local`/`global` 放行；`part`/`subpart`/`vehicle` 一律 `unresolved_config_ref`（不告警、不迁移）。

---

## 12. `OpResult` 契约

所有 `ops.*` 与工具层统一返回：

```js
{
  ok: true,
  path: ['parts','hull','variants','default','sub_parts','sub_part.machine_max.x','mass'],
  data: { … },                  // 操作特有结果（partId / instanceName / key / action / …）
  changed: true,                // 是否真的写了（false 时无撤销记录）
  before: any, after: any,      // 字段级操作
  reset_fields: string[],       // import*：被重置为默认值的字段
  dropped_fields: string[],     // subsystem.type 切换：被丢弃的旧类型字段
  cleaned_references: [...],    // remove*/import*：被清理的引用
  unresolved_references: [...], // 兼容字段：= unresolved_bones + unresolved_config_refs 的合并视图
  unresolved_bones: [...],      // warning：骨骼 / Locator 未解析
  introduced_issues: [...],     // 本次引入的问题（同一快照内计算，见下）
  warnings: [...],
}
// 失败（配置引用断裂时明细在 errors[]，code: 'unresolved_config_ref'）
{ ok: false, error: '…', errors: [{ path, code, expected, got, hint }] }
```

**`path` 用规范化后的段数组**回传，工具层直接透传，不再从 `data` 里猜。

**产生者**：`before/after` ← `doc` 原语；`reset_fields` ← `projection.in`；`dropped_fields` ← `setField` 的 `sideEffect`；`cleaned_references` ← `refs`；`introduced_issues` ← `ops` 通过 `ports.validation.collectIssues` 在**同一撤销记录内**做前后 diff（不 `require` `mode/validation`，保持分层）。

错误码：`no_project` / `not_found` / `missing_required` / `type_mismatch` / `invalid_enum` / `invalid_format` / `duplicate_name` / `unknown_field` / `unknown_type` / `unresolved_config_ref` / `key_reserved` / `edit_in_progress` / `snapshot_too_large` / `io_error`。

> v2 的 `ambiguous_path` 已删除（§5.1.1）；新增 `unresolved_config_ref`（配置引用断裂）与 `key_reserved`（key 含 `*` 等保留字符）；WIP 类型删除后不再有 `unsupported_type`，未知类型统一 `unknown_type`。

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
| D10 | 路径语法 | `string[]` 主 + JSON Pointer 从；`*` 为整段 token；**按位置解析** | 推荐（v3 收口） |
| D11 | 字段规格来源 | 兄弟仓库 schema → vendored → codegen | 推荐（v2） |
| D12 | schema↔Codec 漂移 | 以 schema 为准，本期只修影响导出的 4 项，其余 allowlist | 推荐（v2） |
| D13 | `track_*` 两种类型 | **单独立项**（不阻塞 P1，但测试留红灯） | 用户 |
| D14 | 可空字段清单 | **撤销**——一套规则集，编辑不拦、导出阻断 | 用户（§4） |
| D15 | 导出闸门 | `severity==='error'` 阻断导出 | 用户 |
| D16 | key 策略 | **严格规范 key**：ASCII 字符集对所有翻译键强制；子零件 `sub_part.<ns>.<name>` 形态强制并迁移；其它 kind 前缀形态只告警 | **用户**（第二轮） |
| D17 | key 字符集 | **所有配置 key 纯 ASCII**（模型元素名除外）；`partId` 与 namespace 小写 `[a-z0-9_.-]+` / `[a-z0-9_-]+`（进 resource location），其余 `[A-Za-z0-9_.-]+`；中文/空白拒绝 | **用户**（第二轮） |
| D18 | 5 个 WIP 子系统类型 | **删除**（Codec 22→17、registry、面板、类型清单）；不保留 decode/read，不提供兼容层 | **用户**（第二轮） |
| D19 | 信号哨兵 | 只有 `local`/`global`；`part`/`subpart`/`vehicle` **不存在**：不保留、不告警、不迁移，按普通未知目标报错 | **用户**（第二轮） |
| Q1 | 内容包定义 JSON | 只读，不纳入业务层 | 用户 |
| Q2 | 交付形态 | 拆两串 commit | 用户 |

---

## 14. 明确不做

| 不做 | 原因 |
|---|---|
| 为每个控件造一个 op | 只是把耦合搬到 ops，还丢失寻址抽象 |
| 把导出/导入/建包塞进 ops | async + 写盘 + 不可撤销 |
| command bus + 元数据 codegen zod schema | 工具数 ≤ 15 时收益不足 |
| 一次性重写 `App.vue.js` | 1,884 行，回归面过大；分三批 |
| 集中化 112 处 toast | 需要消息目录（i18n） |
| 编辑期因校验 error 阻断操作 | 与「渐进填写」模型冲突（§4） |
| 收紧 `additionalProperties` | 会牵连现有导入逻辑，单独排期 |
| `track_controller` / `track_drive` 支持 | 独立立项（D13） |
| 内容包定义 JSON 的编辑通道 | Q1 |

---

## 15. 存量迁移（`loadConfig` 一次性修复）

迁移在 `persistence.loadConfig` 解码之后、返回配置之前执行；结果写入 `config._lastMigration`（瞬态，不进导出），UI 在加载完成后 toast 汇总。

### 15.1 子零件 key 规范化（D16）

```
for each part, variant:
  for each oldKey of variant.sub_parts:
     newKey = canonicalSubPartKey(oldKey, config.namespace)
     if newKey === oldKey: continue
     if variant.sub_parts[newKey] exists: newKey = uniqueSuffix(newKey)   // _2, _3 …
     move entry oldKey → newKey
     rewrite markers: element_markers[variant][uuid].config_ref
        - type === 'sub_part' 且 config_ref === oldKey → newKey
        - type === 'hit_box'  且 config_ref === oldKey → newKey
     record { from: oldKey, to: newKey, reason: 'key_format' | 'collision' }
```

`canonicalSubPartKey(key, ns)`：

1. 已匹配 `^sub_part\.<ns>\.[A-Za-z0-9_.-]+$` → 原样返回；
2. 含 `.<ns>.` → 取其后部分作为名称段；
3. 以 `sub_part.` 开头但 namespace 不同 → 去掉 `sub_part.<其它ns>.`；
4. 其余 → 整串作为名称段（例如 `chassis`）；
5. 名称段若含非 ASCII（含中文）或禁止字符（空白 / `*` / `/` / `~` / `:` / 控制字符）→ **无法无损保留**，改用 `legacy_<n>`（n 按变体内递增，跳过已占用名），原名记入迁移记录；纯 ASCII 名称原样保留；
6. 名称为空或仅剩 `.` → `main`；
7. 返回 `sub_part.<ns>.<名称段>`。

> 改写会改变翻译键与模组侧可见名称。中文名（如 `底盘`）迁移后变成 `legacy_1`，用户需要按迁移报告手动改成英文名（D17：key 不允许中文）。`_lastMigration` 逐条列出 old→new，P2 在加载后弹出一次确认列表；迁移前备份。风险见 §16。

### 15.2 其它归一化

| 问题 | 处理 |
|---|---|
| 单变体 / 单子零件简写 | 归一化为 map；单子零件落到 `sub_part.<ns>.main`（不是 `default`） |
| `sub_parts` 里因 `either` 产生的 `default` key | 同上改写为 `sub_part.<ns>.main` |
| 缺失 `hit_boxes` / `connectors` 等容器 | 补空 map（不改语义） |
| `subsystems[*].definition === null` 或 `"null"` | 转 `null`（占位），导出闸门拦截 |
| `connector` marker 的 `config_ref` 存着 definition | 统一为连接点 key（§5.4） |
| `_uuid` / `_marker_uuid` 缺失或失效 | 按骨骼名 / Locator 名重建 |
| 悬空 marker | `cleanGhostMarkers`（已有） |
| 孤儿子零件（无标记） | **不再在渲染期删除**；改为 `loadConfig` 报告 + 面板「创建配置」按钮 |
| 5 个 WIP 子系统实例（`battery`/`signal_convert`/`joint`/`javascript`/`ammo_loader`） | D18 删除类型：`loadConfig` 在 decode 前从 raw JSON 剔除对应条目，记入 `_lastMigration.removed`，备份保留；不提供兼容层 |
| 连接点/子系统/交互区的非 ASCII key | 不改名，记 `KEY_RESERVED`（导出期 error），由用户手动重建/重命名；子零件之外不做自动迁移 |
| 零件 / 变体 / 纹理 / 频道名的非 ASCII key，或非小写 `partId` | **不自动改名**（`partId` 会牵动文件名、resource location 与存档），记 `KEY_RESERVED`（导出期 error），由用户手动重建 |
| key 含 `*`（任意 map），或翻译键含 `/` `~` | 记 `KEY_RESERVED`，导出期 error；不自动改写；`hit_boxes` / `hydrodynamics` 的元素名不受 `/` `~` 限制 |

---

## 16. 风险与回滚

| 风险 | 对策 |
|---|---|
| 子零件 key 迁移改变模组侧可见名称（存档/引用可能按名匹配） | 仅迁移非规范 key；中文名改 `legacy_<n>` 并在迁移报告中保留原名；`_lastMigration` 明细 + 加载后确认；迁移前自动生成一份 `.mm_project.json.bak`（`services/pack` 提供） |
| 删除 WIP 类型后，含这些类型的存量工程在 decode 时失败 | §15.2 的 raw 层剔除 + 备份；若必须保留这些数据，只能停留在旧插件版本（D18 明确不做兼容层） |
| 旧哨兵 `part`/`subpart`/`vehicle` 变成未知目标错误 | D19 的明确选择：不告警、不迁移；导出闸门拦住，用户改成 `local`/`global` 或真实节点 key |
| 严格配置引用会拒绝手工写的悬空目标 | `errors[]` 带完整 path 与候选值；`mode:'replace'` 可先修引用再导入；MCP 返回 `unresolved_config_ref` 提示 |
| 删除计算属性写入后，存量「标记有、配置无」不再自动补建 | §15 的 load-time repair + 面板显式按钮 + `setField` 的 `ensure` |
| 整件替换丢字段 | `reset_fields` / `dropped_fields` 回传 + 工具描述明示 |
| 导出闸门改变现有行为（从「总是成功」到「被拦」） | P3 单独 commit；先跑一次全量校验看现有工程有多少 error |
| 批量导入撤销粒度回退 | 冲突决策提前到开记录前（修 `drag_import` 既有缺陷） |
| 端口未注入（早于 `plugin.js onload`） | 端口默认空实现 + `assertPorts()` 在 ops 入口做一次软检查 |
| WIP 类型只读后，已有工程的这些子系统无法再编辑 | 仍可 read/删除；面板显示「实验类型，只读」；D13 决定最终去留 |
| P2/P3 交叉改动同一批文件 | P2 只碰「写配置」，P3 只碰「副作用」 |

---

## 17. 参考资料

- 撤销：[docs/11](./11-接入Blockbench原生撤销.md) · MCP：[docs/12](./12-MCP工具接入.md)
- Codec：[docs/08](./08-序列化反序列化-Codec体系重构.md) / [src/codec/AGENTS.md](../src/codec/AGENTS.md)
- 校验：[docs/10](./10-校验与错误提示重构实现计划.md) / [src/mode/validation.js](../src/mode/validation.js)
- 上游 schema：`../../Machine-Max/src/main/resources/spark_modules/machine_max.builtin/machine_max/docs/zh_cn/schemas/`
- 现有整件通道：[src/import/drag_import.js](../src/import/drag_import.js) + [src/import/bone_resolver.js](../src/import/bone_resolver.js)
- 模组侧信号解析：[ISignalSender.java](../../Machine-Max/src/main/java/io/github/sweetzonzi/machine_max/common/mech/signal/ISignalSender.java)（`local` / `global` 的唯一依据）
