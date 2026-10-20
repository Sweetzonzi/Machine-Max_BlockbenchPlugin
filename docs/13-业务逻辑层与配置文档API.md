# 业务逻辑层与配置文档 API（v3.2）

> 状态：**设计稿（待实现）** · 日期：2026-10-21 · v3.2 依据：第四轮审阅（replace 旧 marker、connector 迁移算法、partId 路径安全、闸门去重）逐条核对代码后收口
> v3 的第二轮收口见 §0；第三轮收口见 §0.2；本轮新增/修正见 §0.3
> 范围：`src/doc/`（新增）+ `src/ops/`（由 `src/core/operations.js` 拆出）+ `src/services/`（新增）+ `src/ui/`、`src/mode/`（改薄）
> 目标版本：v0.5.0（当前 0.4.0） · 前置：[docs/11](./11-接入Blockbench原生撤销.md) · 下游：[docs/12](./12-MCP工具接入.md)
> 参照：[docs/08](./08-序列化反序列化-Codec体系重构.md) / [docs/10](./10-校验与错误提示重构实现计划.md)

---

## 0. v3 相对 v2 的收口

| # | v2 的问题（第二轮审阅） | v3 的处理 |
|---|---|---|
| 1 | key 策略同时承诺「格式必须匹配」「存量原样保留」「中文可写回」，三者互斥 | **严格规范 key**（D16）：字符集为 **ASCII**（D17，中文 key 也拒绝），子零件还强制 `sub_part.<ns>.<name>` 形态；`loadConfig` 一次性迁移子零件 key；见 §5.1、§15 |
| 2 | `projection` 只写了 `in`，且缺骨骼名↔UUID、`_uuid`、`_marker_uuid`、简写、part_id 等变换 | 给出 `in` / `out` 两个**有序**算法与 round-trip 保证（§5.3）；`read(as='definition')` 走 `out('read')` |
| 3 | 引用矩阵漏 `hit_box` marker 与 `subsystems[*].power_output`，target 写成「名」 | 扩为 **13 行**（v3.1 补 `power_outputs` 的 key），target 一律写「完整配置 key」；哨兵只保留 `local`/`global`，`part`/`subpart`/`vehicle` 彻底移除（§5.4，D19） |
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
| `hit_box.overwrite` 有 18+ 字段 | **3 组**：`physics` 7 / `armor` 12 / `sounds` 2（共 21 个叶子） | `hit_box_attr.schema.json` 的 `properties.overwrite` |
| 哨兵是 `part` / `subpart` / `vehicle` | 模组只解析 **`local` / `global`**；这三个值不存在（D19：不保留、不告警、不迁移） | [ISignalSender.java:207](../../Machine-Max/src/main/java/io/github/sweetzonzi/machine_max/common/mech/signal/ISignalSender.java)（兄弟仓库） |
| `interact_box.signal_targets` 无额外约束 | schema **required**，Codec 默认 `{}`，属已知漂移 | `interact_box_attr.schema.json:33` |

> 另：schema 的 `examples` 大量使用短 key（`sub_parts` 写 `"ae86_chassis_all_terrain"`、`power_output` 写 `"transmission"`、`signal_targets` 写 `["car_controller","engine"]`），与插件实际写的完整翻译键不一致。**examples 不是契约**，v3 只以 `properties/required/enum/$ref` 为准，并在 §5.4 说明完整 key 的依据。

### 0.2 v3.1 第三轮收口

| # | 第三轮问题 | 实测 | v3.1 处理 |
|---|---|---|---|
| 1 | required 字段的 `null` 未统一：`createSubsystem` 写 `definition: null`，`getTypeDefaults()` 还写 `power_output` / `connector` / `locator: null`，`SubsystemDispatchCodec.decode` 直接抛 `Expected string, got object` | **确认**。`operations.js:305` 写 `definition: null`；`subsystem_types.js` 有 9 个字段 `defaultValue: null`（engine/motor/gearbox 的 `power_output`、wheel_driver/turret_driver 的 `connector`、seat/joint/launcher/camera 的 `locator`）；`.field()` 只挡 `undefined`，不挡 `null` | **不采用 blanket nullable**（见 §3.4 的上游复核）：required 字段上游都是 `fieldOf`，保持 `.field()`；把内部未配置占位从 `null` 改成 `''`（字符串）/ `{}`（map），`createSubsystem` 与 `getTypeDefaults()` 同步改；`loadConfig` / `projection.in` 把存量 `null` / `"null"` 归一化为 `''`/`{}`。只有上游 `optionalFieldOf` **无默认值**（`Optional` → Java `null`）的 `overwrite` 保留 `.nullable()` |
| 2 | required + 空 map 被 Codec 省略：`InteractBoxCodec.encode({signal_targets:{}})` → `{bone}`；`TransmissionCodec.encode({power_outputs:{}})` → `{definition}`；`isMissingValue({})` 为 false，闸门也不拦 | **确认**（实测输出正是 `{"bone":"x"}` / `{"definition":"x"}`）。schema：`interact_box.signal_targets` required；`transmission.power_outputs` required；`car_controller` / `motorbike_controller.control_outputs` required；`regen_loader.projectile_types` required + `minProperties:1` | required map 统一 `Codec.map(..., {emitEmpty:true})`：`encode({})` 输出 `{}`、decode 缺失仍补 `{}`；`projectile_types` 的空 map 另由 `minProperties` 完整性规则判 error。顺带修 `regen_loader.projectile_types` 默认值写成 `[]` 的类型错误（见 #13） |
| 3 | `import_*` 与 `canExport` 都没有执行 schema 的值校验；`hit_box.type` / `interact_box.condition` 在 Codec 里仍是 `STRING`，`"banana"` 可写入并原样导出 | **确认**。`projection.in` 第 4 步只 `decodeStrict`；`canExport` 只跑 `collectIssues`（不含 enum/结构校验） | 新增 `doc.validate.validateValues(node, opts)` 与 `validateTree(config, opts)`：`projection.in` 在 decode 后执行（覆盖全部 `import_*`）；`canExport` 执行 `completeness:true` 的树扫描。**不改 Codec 枚举**——避免存量非法值在 `loadConfig` decode 阶段就让工程打不开；枚举错误统一由 `field_specs` 报 `invalid_enum` 并带 path（§4.3、§5.2.5、§5.3.1） |
| 4 | `canonicalSubPartKey` 会产出非法 key：`default` → `sub_part.<ns>.default`；`.main` / `main.` 首尾点；`chassis!`；超长名 | **确认**。§15.1 的算法只查「非 ASCII / 空白 / `* / ~ :` / 控制字符」，没复用 §5.1.3 的完整校验 | 算法改为**先复用** `isValidSubPartKey`：规范 key 原样返回；裸 `default` → `main`；其余名称段不合法 → `legacy_<n>`；碰撞后缀保持 ≤128 且不产生首尾点。迁移测试覆盖 `default` / `.main` / `main.` / `chassis!` / 中文 / 超长 / 跨 namespace（§15.1） |
| 5 | `variants` 的合法 map key `model` 被简写判定吞掉 | **确认**。§5.3.1 第 1 步写「对象自身含 `model` 字段」；变体名 `model` 合法（D17） | 判据改为 `typeof variants.model === 'string'`（单变体的 `model` 是字符串，map 的 `model` 值是对象）；补「变体名恰好是 `model`」的 round-trip 向量。`sub_parts` 的简写判定同步改为**看 `hit_boxes` 的值形状**，避免 subpart 名恰好叫 `mass` / `hit_boxes` 时被吞 |
| 6 | `hydrodynamics[""]` 是 schema 默认值，却被「元素名只拒绝空串」误判 | **确认**。`sub_part_attr.schema.json` 的 default 是 `{"":{}}`；§5.1 也写明空段表示空字符串 key | `hit_boxes` 拒绝 `""` 与 `*`；`hydrodynamics` **允许 `""`**、只拒绝 `*`。路径层允许空段仅限 `hydrodynamics`；补读取/写入向量（§5.1.5 #14、#15） |
| 7 | `validateKeys` 只查 `sub_parts` 和三个翻译键 map，漏了 `textures` / `signal_targets` / `signal_translations` / `power_outputs` / `projectile_types` | **确认**。这些 map 的 key 同样是 D17 配置 key；`setField` 的 `allowMissingLeaf` 可新建非法 key | `validateKeys` 改为按节点 kind 递归，覆盖全部 map 层；`projectile_types` 是**资源地址 key**，允许 `:` `/` 且要求小写（§5.1.3 表）。`setField` 新建 key 与 `import_*` 共用同一函数 |
| 8 | D17 强制入口矩阵不闭合：`importPart` / `importVariant` 只做「非空 + 保留字符」；`createSubsystem.instanceName`、`setField` 新建的 `textures.*` / `signal_targets.*` 不在强制点列表 | **确认**。§6.1 与 docs/12 的 `[a-z0-9_.-]+` / `[A-Za-z0-9_.-]+` 两套说法冲突 | 新增 §5.1.3.1「强制入口矩阵」：列出全部 key 类别 × 全部入口（create/rename/import/mark/setField/loadConfig），每行给正则、失败码、是否自动迁移；§6.1 改为引用该表 |
| 9 | `_uiState` 测试路径写成 `['parts','hull','_uiState','activePartId']`，实际 `_uiState` 在配置根 | **确认**。`_setUiState(config, …)` 写 `config._uiState`；part 下没有该字段 | 向量 #7 改为 `['_uiState','activePartId']`；另补 `['parts','hull','element_markers']` 的不可寻址向量（element_markers 在 part 级，也是内部字段） |
| 10 | `loadConfig` 的迁移顺序不清：§15 说「迁移在解码之后」，§15.2 又要求「decode 前从 raw 剔除 WIP 类型」 | **确认**。若 WIP 剔除放在 decode 后，`SubsystemDispatchCodec` 会先抛 `Unknown dispatch type` | §15 开头改成明确的三段式：**raw 预处理（WIP 剔除 + `"null"` 清洗）→ decode → key/marker 迁移**；raw 预处理必须发生在任何 `PartCodec.decode` 之前 |
| 11 | `schema_codec_allowlist` 职责范围不清：只登记 `track_*` 两个类型缺口，但 §3.3 还有多处字段差异 | **确认**。类型集合与字段差异是两种测试，不能共用一个「条目」概念 | allowlist 拆成 `missing_types`（类型集合）、`missing_fields` / `extra_fields`（字段集合）、`constraint_diffs`（同字段约束差异）、`decode_tolerance`（decode 宽容但 encode 受闸门保护）四段，外加全局 `unknown_fields` 例外；每段对应一条测试规则，见 §5.2.2 |
| 12 | §14 的 `App.vue.js` 行数写成 1,884，实际 1,883 | **确认**（`Get-Content` 计数 1,883） | 改为 1,883 |
| 13 | （本轮新增实测）字段缺失/默认值类型错误 | **确认**：`LauncherCodec` 缺 `fire_animation`（schema 可选，默认 `"fire"`）；`RegenLoaderCodec` 缺 `belt_label`（可选，默认 `""`）；`subsystem_types.js` 的 `regen_loader.projectile_types` 默认值是 `[]`，与 schema/Codec 的 object 冲突，新建即无法 encode/decode | D12 扩为「结构性修复 3 项 + 字段补齐 2 项 + 默认值 1 项」；`subsystem_types.js` 同步补 `fire_animation` / `belt_label` 的编辑器字段（`text_input`），`projectile_types` 默认改 `{}` |
| 14 | （本轮新增实测）§16 仍留着「WIP 类型只读」的旧风险行，与 D18 删除矛盾 | **确认** | 删除该行；WIP 风险只保留「raw 剔除 + 备份」一条 |

**上游 optionality 复核（2026-10-21，`Machine-Max` 兄弟仓库）**：

- **required（`fieldOf`）**：所有 dynamic attr 的 `definition`（`ResourceLocation.CODEC`）；engine/motor/gearbox 的 `power_output`；wheel_driver/turret_driver 的 `connector`；launcher/joint 的 `locator`；car_controller/motorbike_controller 的 `control_outputs`；transmission 的 `power_outputs`；regen_loader 的 `projectile_types`。
- **optional（`optionalFieldOf` + 默认值）**：seat/camera/lighting/sight 的 `locator`；各 `*_outputs` 映射；`fire_animation`、`belt_label`、`script`、`dismount_locators`、`control_group_preset`。
- **optional（`optionalFieldOf` 无默认值 → `Optional` → Java `null`）**：`hit_box.overwrite`、`connector.overwrite`。

`optionalFieldOf` 的语义是「**键可以缺失**」：缺失时用默认值（或 `Optional.empty`），**不是**「JSON 值可以是 `null`」。显式 `null` 仍会交给底层 `Codec.STRING` / `ResourceLocation.CODEC` / map codec，通常直接报错。因此插件内部不能把 `null` 当作 required 字段的通用占位；`null` 只适合 `Optional` 型字段（`overwrite`）。

### 0.3 v3.2 第四轮收口

| # | 第四轮问题 | 实测 | v3.2 处理 |
|---|---|---|---|
| 1 | `import_*` 的 `replace` 只产出 `markerPlan`（新增），没有旧 marker 清理；旧 `start_bone` / `hit_boxes` / `interact_boxes` / `connectors` 的 marker 会在配置被替换后残留，`cleanGhostMarkers` 只清元素已不存在的标记，清不到「元素还在、配置已换」的旧标记 | **确认**。`projection.in` 第 9 步只生成新增计划；`clearAllMarkers` 只有 part / variant 两级，没有 sub_part 级；`cleanGhostMarkers` 的判据是 UUID 是否存在，不读 `config_ref` | 返回 `markerCleanup`（part / variant / sub_part 三级 scope）；`ops.import*` 在**同一笔撤销**里按「清理旧 marker → 替换节点 → 落 `markerPlan`」执行；sub_part 级用旧条目的 `config_refs` 精确清理；补「replace 后旧 marker 不残留、同形替换不重复、Ctrl+Z 恢复」测试（§5.3.1、§6.3、§11 #18） |
| 2 | connector marker 的 `config_ref` 从 `definition` 迁移到连接点 key 没有可执行算法：同一 `definition` 可被多个 connector 共用；同名 Locator 可跨子零件；匹配不到时保留 / 置空 / 报错未定 | **确认**。§15.2 只有一句「统一为连接点 key」；`connectors[*]._marker_uuid` 已存在，可作为首选精确匹配；marker 的 UUID 就是 Locator 的 UUID | 定序匹配：**已迁移 key → `_marker_uuid` → Locator 名（唯一）→ 所属子零件内 Locator 名唯一**；`definition` **不参与匹配**。匹配不到时保留旧值到 `legacy_config_ref`、`config_ref` 置 `null`、记 `unresolved_config_ref` warning，不猜测、不删 marker；补「同 definition 多 connector」测试（§15.2.1、§11 #19） |
| 3 | `partId` 允许 `.` / `..`，会进入 `parts/<partId>.json`、纹理资源路径和 `path.join`；`import_part` 可传任意 `part_id`，存在路径穿越 | **确认**。设计规则只校验 `^[a-z0-9_.-]+$`，当前 `createPart` 仅查非空（`importPart` 尚未实现）；`export_pipeline._resolveTargetDir` 在 `flat_export:false` 时把 `partId.split('_')[0]` 直接 `path.join`；`import_part` 是规划中的 MCP 入口 | `partId` 增加路径安全判据：拒绝 `.` / `..` / 首尾点 / Windows 设备名，且**完整值与 `split('_')[0]` 目录段都查**；`createPart`、`importPart`、拖拽导入统一 `invalid_format`；导出管线在 `path.join` 前**再次**断言，绕过闸门直接调 generator 也失败；存量非法 `partId` 不自动改名，记 `key_reserved` 导出 error（§5.1.3、§15.2） |
| 4 | `canExport` 的 `path + code` 去重不成立：`collectIssues` 报 `definition_required` / `subsystem_required_field`，`validateTree` 报 `missing_required`，同一路径两条不同 code，去重不生效 | **确认**。两层错误码本就不同；`collectIssues` 的 `Problem.path` 还缺字段名，无法与 `validateTree` 的段数组对齐 | 统一 `Problem.path` 为对象并补 `field`；`canExport` 把 `validateTree` 的段数组规范化为同一对象；去重键改为 **`scope|partId|variantName|subPartKey|itemKey|field`**，`collectIssues` 优先，`validateTree` 只补空缺；同一字段只留一条，不同字段各自保留（§4.3、§5.2.5、§12） |
| 5 | `reset_fields` 只算顶层字段，docs/12 却把它描述成「整件语义唯一的安全网」；`import_part` 省略 `variant.tags` / `sub_part.hit_boxes` 时不会列出嵌套路径 | **确认**。§5.3.1 第 4 步明确写「顶层字段」；docs/12 的措辞过度承诺 | 保留**顶层字段**语义（递归 diff 成本高且无法区分「省略」与「默认值」）；docs/12 明说只保证顶层容器，嵌套字段整体丢弃、不逐项列出；补「省略嵌套字段不产生 reset_fields 条目」测试（§5.3.1、docs/12 §5.3） |
| 6 | `schema_codec_allowlist.missing_fields` 为空，但 D12 尚未补 `launcher.fire_animation` / `regen_loader.belt_label`；P1 的字段集合测试会先红 | **确认；最新快照还新增了 `hit_box.module` 与 `weapon_controller` 的 3 个 HUD layout 字段**（`physics` / `armor` / `sounds` 已收进 `overwrite`，见 §5.2.2） | 6 条都以 `owner: 'D12'` 放进 `missing_fields`，P1 按 owner 放行；D12 修完后条目必须删除，否则按过期条目失败（§5.2.2） |
| 7 | `hit_box.block_collision` 是笔误，实际字段在 `sub_part.block_collision`（`hit_box` 没有这个字段） | **确认**。`sub_part_codec.js` 的 `block_collision`；`hit_box_codec.js` 无此字段 | 修正 §5.2.5 的枚举示例；测试按 `sub_part.block_collision` 构造（§5.2.5、§11 #15） |
| 8 | `KEY_RESERVED` 大小写/级别不统一：§15 / §12 用大写，§5.1.3 的错误码与 `_lastMigration.key_reserved` 用小写 | **确认**。仓库没有 `KEY_RESERVED` 常量；稳定 code 应统一小写 snake_case | 全部改为 `key_reserved`；顺带把同类的 `ORPHAN_ELEMENT` 改为 `orphan_element`。大写只保留为规则名 / `CODES` 常量名，不再作为 `Problem.code`（§12） |

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

> 这些数字由 P0 交付的 `scripts/audit-stats.js` 生成（`npm run audit:stats`，47 项基线），避免再次漂移。

### 2.4 校验现状

`mode/validation.js → collectIssues(config)` 是唯一实现（`validation_check.js` 调的也是它）：**14 个 error 产生点 / 3 个 warning 产生点**（P2 增加 `DANGLING_SIGNAL_TARGET` 后为 15 条 error 规则），但 warning **只有 1 个 code**：`orphan_element`（分布在 `hit_box` / `connector` / `interact_box` 三个分支）。

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

**当前状态（P0 已完成）**：vendored 快照 153 个文件，与 `Machine-Max@a1460ce1` 逐文件 SHA256 一致，`node scripts/sync-schemas.js --check` 零漂移。

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

> vendored 快照的溯源为 **`a1460ce1`**（`67638bbf` 移除 connector overwrite 的无效 `power_target` + `a1460ce1` 修正内容包 schema）；内容真值以 `source_sha256` 为准；`sync-schemas.js --check` 当前零漂移。

**key 不是 schema 约束**：`variant_attr.schema.json` 的 `sub_parts` 只写了 `additionalProperties`，没有 `patternProperties`；它自己的 examples 还用短 key（`"turret_base"`）。因此「`sub_part.<ns>.<name>`」是**插件侧约定**（翻译键 + 面板/导出/l10n 共用），不是上游要求。严格的理由是可逆性（read → import 无损），不是合规性；迁移只是把插件自己的历史写法收敛到这套约定（§15）。

### 3.3 已知 schema ↔ Codec 差异

| 字段 | schema | Codec | 处置 |
|---|---|---|---|
| `sub_part.hit_boxes` | `required` + `minProperties: 1` | 无约束 | 由 `collectIssues` 负责（已实现，§4） |
| `hit_box.id` | 有默认 `""`，非必填（`required` 只有 `type`） | `.field()` 必填 | 修 Codec：`.default('')`（D12） |
| `hit_box.type` | `enum: [box,sphere,cylinder,capsule,wheel]` | `STRING` | **constraint_diff**；写入、导入、导出三侧都由 `field_specs.enum` 报 `invalid_enum`（§4.3、§5.3.1） |
| `hit_box.overwrite` | 结构化 **3 组**（`physics` / `armor` / `sounds`）、`additionalProperties:false` | `Codec.ANY.nullable()`（上游 `optionalFieldOf` 无默认 → Java `null`） | **constraint_diff**；`field_specs.nullable:true`（可选对象），`validateValues` 允许 `null`，导出省略；结构由 object 规格校验（§5.2） |
| `interact_box.condition` | `enum: [AND,OR,NAND,NOR,XOR,XNOR]` | `STRING` 默认 `NOR` | **constraint_diff**；同上，由 `field_specs.enum` 拦，不改成 `Codec.ENUM`（避免存量非法值在 load 阶段失败） |
| `interact_box.signal_targets` | `required` | `.default({})`，空 map 被省略 | 修 Codec：required map + `emitEmpty`，`{}` 也输出；decode 缺失仍补 `{}`（§3.4） |
| `connector.definition` | `required` + `resource_location` pattern | `.default('')` | 由 `collectIssues` / `field_specs.references='resource'` 负责（空串已判 error） |
| `subsystem.definition` | `required`（`ResourceLocation.fieldOf`） | `.field()`（`createSubsystem` 写 `null`） | **不改 Codec**：`createSubsystem` 改写 `''`；`loadConfig` / `projection.in` 把 `null`/`"null"` 归一化为 `''`；导出闸门阻断空串 |
| `subsystem.power_output` / `.connector` / `.locator` | required（engine/motor/gearbox、wheel_driver/turret_driver、launcher/joint）或 optional（seat/camera/lighting/sight） | required 为 `.field()`；optional 为 `.default('')`（seat 当前 `.field()`、camera 当前 `.default()`）；`subsystem_types.js` 的 `defaultValue` 是 `null` | **不改 Codec 为 nullable**：required 保持 `.field()`，registry 默认值 `null → ''`；optional 统一 `.default('')`；`locator` 缺失/`null` 归一化为缺省或 `''`（§3.4） |
| `sub_part.hydrodynamics` | 默认 `{"":{}}`；允许空字符串 key | 默认 `{}`（空 map 跳过） | **constraint_diff / decode_tolerance**；导出省略 `{}` 依赖模组默认值；若内部有 `""` 条目则原样输出（§5.1.3） |
| `car_controller` / `motorbike_controller.control_outputs` | `required` | `.default({})`，空 map 被省略 | 修 Codec：required map + `emitEmpty` |
| `transmission.power_outputs` | `required` | `.default({})`，空 map 被省略 | 修 Codec：required map + `emitEmpty` |
| `regen_loader.projectile_types` | `required` + `minProperties: 1`，key 是资源地址 | `.default({})`；`subsystem_types.js` 默认值写成 `[]` | 修 Codec：required map + `emitEmpty`；registry 默认改 `{}`；空 map 由完整性规则判 error（§4.3） |
| `launcher.fire_animation` | 可选，默认 `"fire"` | **缺字段** | 修 Codec + `subsystem_types.js`（`text_input`） |
| `regen_loader.belt_label` | 可选，默认 `""` | **缺字段** | 修 Codec + `subsystem_types.js`（`text_input`） |
| `seat.locator` / `camera.locator` | 可选，默认 `""` | seat `.field()`；camera `.default()`（`undefined`） | 改为 `.default('')`，与上游 `optionalFieldOf("locator", "")` 一致；registry `null → ''`；不 nullable |
| 多数对象 | `additionalProperties: false` | 宽松保留 | **unknown_fields 例外**：`unknown_fields: 'preserve'`；导出时由 Codec 剥离 schema 外字段 |
| `sub_part.projected_area` | `$ref vector_3d` = `number[3]` | `FLOAT.list(3)` | **一致**（schema 自身 example 写成 `{x,y,z}`，是文档 bug） |

> 另注：`interact_box_attr` 的第二个 example 用了枚举外的 `"interact_mode": "toggle"`；`hit_box_attr` 的 example 从 `subpart.has_connector(...)` 改为 `local.has_connector(...)`；`gearbox` 等 schema 的 `power_output` example 仍是短名。**schema 的 examples 不能当契约**，只用 `properties/required/enum/$ref`。
>
> `constraint_diffs` 的完整清单与测试规则见 §5.2.2。**required 字段不使用 nullable**：上游是 `fieldOf`，内部未配置用 `''`/`{}`；只有 `optionalFieldOf` 无默认值的 `overwrite` 在内部是 `null`。

### 3.4 Codec 与上游 optionality 对齐（required 不使用 nullable）

第三轮审阅后我补查了兄弟仓库的 dynamic attr codec。结论：**required 字段全部是 `fieldOf`，不能 nullable；`optionalFieldOf` 是「键可缺失 → 默认值」，不是「值可为 `null`」；只有 `optionalFieldOf` 无默认值的 `Optional` 字段（`overwrite`）在 Java 里会是 `null`。**

| 上游类别 | 字段 | Codec | 内部「未配置」 | 导出 |
|---|---|---|---|---|
| required 字符串（`fieldOf`） | `definition`（全部）；`engine/motor/gearbox.power_output`；`wheel_driver/turret_driver.connector`；`launcher/joint.locator` | `.field()` | `''`（空串占位） | 键存在、值为 `""`；`collectIssues` 判 required 缺失，闸门阻断 |
| required map（`fieldOf`） | `interact_box.signal_targets`；`car_controller/motorbike_controller.control_outputs`；`transmission.power_outputs`；`regen_loader.projectile_types` | `.default({})` + `emitEmpty`（decode 缺失→`{}`、encode 恒输出） | `{}` | 键存在、值为 `{}`；`projectile_types` 再由 `minProperties:1` 阻断 |
| optional + 默认值（`optionalFieldOf(name, default)`） | `seat/camera/lighting/sight.locator`；`speed_outputs` / `gear_outputs` / …；`fire_animation`；`belt_label`；`script`；`dismount_locators` | `.default(默认值)` | 缺失（decode 补默认） | 等于默认值时省略；`locator:''` 与上游默认一致 |
| optional 无默认值（`optionalFieldOf(name)` → `Optional` → Java `null`） | `hit_box.overwrite`；`connector.overwrite` | `.nullable()` | `null` | 省略；schema 可选 |

**关键区别**：

- `default({})` 只用于 required map 的**解码宽容**（旧文件缺键 → `{}`），不是 nullable；输出时 `emitEmpty` 保证键一直在。
- `null` 只用于 `Optional` 型字段（`overwrite`）。required 字符串不再使用 `null`；`createSubsystem` 写 `definition: ''`，`getTypeDefaults()` 的 `null` 默认值全部改成 `''`（seat/camera optional locator 也是 `''`）。
- `projection.in` / `loadConfig` 在 decode 前做一次**占位归一化**：required 字符串 `null`/`"null"` → `''`；required map `null` → `{}`；optional 字段 `null` → 删除（让 `default` 生效）。这样旧工程/旧 MCP 输入仍可打开，Codec 不需要 nullable。
- `definition: ''` 不是合法 ResourceLocation，`power_output/connector/locator: ''` 也不是有效目标；它们**只存在于内部树**，导出时由 §4.3 闸门阻断。若绕过闸门直接 encode，JSON 里会是 `""`（required 键仍在），但模组侧不会接受——这是有意的「脏值可定位」而不是「静默缺键」。

**P2 字段清单**：

- 改 `subsystem_types.js`：`power_output` / `connector` / `locator` 的 `defaultValue: null` → `''`；`regen_loader.projectile_types` 的 `[]` → `{}`；补 `launcher.fire_animation`（默认 `'fire'`）与 `regen_loader.belt_label`（默认 `''`）。
- 改 `createSubsystem`：`var ssConfig = { type: typeId, definition: '' };`，其余 `defaults` 原样合并。
- 改 Codec：`seat.locator` `.field()` → `.default('')`；`camera.locator` `.default()` → `.default('')`；required map 增加 `emitEmpty`；`launcher.fire_animation` / `regen_loader.belt_label` 补字段；`STRING.encode` 严格化。**不给 `definition` / `power_output` / `connector` / `launcher|joint.locator` 加 `.nullable()`。**
- 迁移：`loadConfig` raw 阶段把 `definition/power_output/connector/locator: null|"null"` → `''`（缺失也可补 `''`，保证旧工程能 decode）；`projection.in` 只归一化显式 `null`/`"null"`，required 字符串缺失仍报 `missing_required`。`projectile_types: []` → `{}`；`signal_targets`/`power_outputs`/`control_outputs` 的 `null` → `{}`；optional 字段 `null` → 删除。

> 为什么不用 `null` 作为 required 占位：`Codec.STRING.field()` / `ResourceLocation.CODEC.fieldOf` 只接受字符串；`null` 会在 decode 阶段直接抛错，且 `Codec.STRING.encode(null)` 会产出字符串 `"null"`。`''` 至少能通过 JSON 类型层，并把「未配置」留给校验器/闸门处理。

---

## 4. 校验模型：一套规则，两种后果

### 4.1 原则

- **写入期只保证「可被解释」**：类型 / 枚举 / 数组长度 / key 格式 / 父节点存在 / **配置引用指向本变体内的真实节点**——违反即拒绝。
- **骨骼引用不阻塞**：导入时模型元素可能尚未建好，`start_bone`、`hit_boxes` key、`interact_box.bone`、`connector.locator` 解析不到时只记 warning，写进 `unresolved_bones`。
- **完整性只提示，不阻断编辑**：新建子零件没有碰撞箱、子系统没选型号，都是**合法中间态**。
- **导出期用同一份规则集，遇 error 阻断**。

因此**不设「用户可选的空字段清单」**，但内部树有两类**固定占位**（§3.4）：required 字符串用 `''`、required map 用 `{}`；optional 字段用 `default` 或（仅 `Optional` 型）`null`。这些占位都允许在编辑期存在；`collectIssues` 与 `validateTree(completeness:true)` 在导出时把它们变成闸门。

### 4.2 分层职责

| 层 | 负责 | 执行者 | 违反时 |
|---|---|---|---|
| 写入合法性 | 类型 / 枚举 / 长度 / 格式 / key / 父节点 | `doc.field_specs` + `doc.address` + Codec | `ok:false`（`type_mismatch` / `invalid_enum` / `invalid_format` / `not_found`） |
| 引用合法性 | 配置引用必须指向同变体内的子系统 / 连接点 / 交互区 | `doc.refs.resolveConfigRefs` | `ok:false`（`unresolved_config_ref`） |
| 骨骼可解析性 | 骨骼 / Locator 名能否命中 `Group` / `Locator` | `doc.refs.resolveBones` + `ports.bones` | warning（`unresolved_bone`），照常写入 |
| 完整性 | required / minProperties / 名称唯一 / 保留名 / 型号存在 | `collectIssues`（业务规则）+ `validateTree(completeness:true)`（schema required/minProperties） | 编辑期：仅提示；导出期：**阻断** |
| 导出值扫描 | 枚举 / 数值范围 / 对象结构 / key 格式 / required | `doc.validate.validateTree(config, {completeness:true})` | 编辑期：不跑；导出期：**阻断** |
| 信号目标完整性 | `signal_targets[*][]` / `power_output` / `power_target` / `power_outputs` 的 key 指向同变体节点或 `local`/`global` | `collectIssues`（`DANGLING_SIGNAL_TARGET`，P2 新增一条规则） | 编辑期：提示；导出期：**阻断** |

> D19 之后 `part` / `subpart` / `vehicle` 没有特殊处理：它们和任意未知目标一样走「信号目标完整性」，不再有单独的告警或迁移。

### 4.3 导出闸门

```js
// services/export.js
function canExport(config) {
    var primary = collectIssues(config);                  // 业务规则，path 已是 Problem 对象
    var schema = validateTree(config, { completeness: true })
        .map(function (e) { return toProblem(e, config); }); // 段数组 → 同一 path 口径 + severity
    var issues = dedupeIssues(primary, schema);           // 同一字段只留一条
    var errors = issues.filter(function (p) { return p.severity === 'error'; });
    return { ok: errors.length === 0, errors: errors, warnings: issues.filter(isWarning) };
}
```

- `export_dialog.onConfirm`：`canExport` 失败 → `showToast` + 列出问题（复用现有 `buildValidationInfo` 的按 path 分组渲染，改为接收 `canExport` 返回的合并数组，每条挂 `__mmNavigator.selectByIssue` 定位按钮），`return false` 不关对话框。
- 现状是「仅提示不拦截」（[export_dialog.js:307](../src/ui/export/export_dialog.js)），本期改为阻断。
- `collectIssues` 的 14 个 error 产生点逐条确认可定位（都带 `path`）；`orphan_element` 放行；`validateTree` 的每条错误也带同样的 `path` 口径。
- **两条闸门缺一不可**：`collectIssues` 负责业务完整性（型号是否存在、名称冲突、信号目标断裂），`validateTree` 负责 schema 值与 key。第三轮审阅的 `"banana"` / `condition:"WHATEVER"` 属于后者；`projectile_types:{}` 的 `minProperties` 也由后者报。
- **去重按字段，不按 code**：同一路径可能同时被两层报（例如 `definition:''`：`collectIssues` 报 `definition_required`，`validateTree` 报 `missing_required`）。输出前统一 `Problem.path` 为对象并补 `field`，去重键为 `scope|partId|variantName|subPartKey|itemKey|field`；`collectIssues` 优先，`validateTree` 只补空缺。同一字段只留一条；不同字段（如 `definition` 与 `locator`）各自保留，不能因为路径相同就合并。
- `Problem.path.field` 是本次新增的可选字段；不带字段的条目（名称冲突、孤立元素等）用空串作 key，仍参与去重。`collectIssues` 的字段级问题必须补上 `field`（`definition` / `locator` / `hit_boxes` / `mass` 等），entry 级问题留空；`validateTree` 的段数组在 `toProblem` 里按 `parts / variants / sub_parts / subsystems|connectors|interact_boxes|hit_boxes` 固定层级转成同一对象，不靠猜 key。

### 4.4 占位符不得变成脏数据（前置修复）

`createSubsystem` 写 `definition: null` **不是合法占位**：上游 `definition` 是 `ResourceLocation.CODEC.fieldOf`，required 字符串。它会一路走到内容包：

```
createSubsystem: definition = null                      operations.js:305
SubsystemDispatchCodec → EngineCodec.definition = .field()   // 只挡 undefined，不挡 null
Codec.STRING.encode(null) = String(null) = "null"       Codec.js:74-77 / 254-256
→ decode 抛 Expected string, got object；若绕过 decode 直接 encode，则出现 "definition": "null"
```

同一类问题不止 `definition`：

| 现有占位 | 现有代码 | 失败方式 |
|---|---|---|
| `definition: null` | `operations.js:305` 对**所有类型**写 | `BasicCodec.definition` `.field()` → decode `Expected string, got object` |
| `power_output: null` | `subsystem_types.js` engine/motor/gearbox | `EngineCodec.power_output` `.field()` → 同上 |
| `connector: null` | wheel_driver / turret_driver | 同上 |
| `locator: null` | seat / launcher / camera / joint | 同上（seat 是 `.field()`，camera 是 `.default()` 但 decode `null` 仍抛） |
| `projectile_types: []` | `subsystem_types.js` regen_loader | `Codec.map` 拒绝数组 |
| `signal_targets: {}` / `power_outputs: {}` | 新建交互区 / 分动箱 | map encode 空对象返回 `undefined`，required 键被省略 |

修法（五项一起，**不引入 required nullable**）：

1. **required 字符串占位改为 `''`**：`createSubsystem` 写 `definition: ''`；`subsystem_types.js` 的 `power_output` / `connector` / `locator` 默认值 `null → ''`；Codec 保持 `.field()`（`STRING` 接受空串）。`loadConfig` / `projection.in` 在 decode 前把 `null`/`"null"` 归一化为 `''`。
2. **required map**：`signal_targets` / `control_outputs` / `power_outputs` / `projectile_types` 用 `Codec.map(..., {emitEmpty:true})`，`{}` 也输出；decode 缺失仍补 `{}`（解码宽容，不是 nullable）。
3. `Codec.STRING.encode` 对非 string 抛错，去掉 `String(v)` 隐式强制；`STRING.decode` 已有类型断言。
4. `projectile_types` 的 registry 默认值 `[]` → `{}`；补 `fire_animation` / `belt_label` 两个缺失字段（§3.3 #13）。
5. 导出闸门（§4.3）兜底：`collectIssues` 把 `definition` / required 字段的 `''` 判 error，`validateTree(completeness:true)` 把空 `projectile_types` 判 error。

> **为什么不用 nullable**：上游 required 字段是 `fieldOf`，`null` 不是合法值；`.nullable()` 虽然能让插件 round-trip，却会让“未配置”在导出时变成**缺键**，与 required 契约相反。`''`/`{}` 至少保持键存在，同时让校验器能定位“值为空”。只有 `overwrite` 这种上游 `Optional` 字段才使用 `null`。
>
> **P2 顺序**：当前 `loadConfig → ensureDefaults` 只 decode `PartCodec`（先临时移走 `variants`），子系统子树并未 decode，所以存量 `null` 今天不会在加载时抛错。P2 改为完整 `PartCodec.decode` 前，必须先在 raw 阶段把 required `null` 归一化为 `''`/`{}`；否则工程打不开。这也是 §15「raw 预处理 → decode → key 迁移」顺序的原因之一。

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
- **`*` 不能作为字面 key**：插件创建的 map key（partId / variant / 子零件 / 连接点 / 子系统 / 交互区 / 纹理名 / 频道名 / 弹种资源地址）在创建、重命名、导入时拒绝 `*`，存量数据迁移时报 `key_reserved`。`hit_boxes` / `hydrodynamics` 的 key 是模型元素名，只禁止 `*`，其余字符原样保留；`hydrodynamics` 额外允许空字符串（`""` 表示质心），`hit_boxes` 不允许空串。这样「字面量 `*`」不需要转义规则，也不会与通配符冲突。
- `~` 与 `/` 只影响 JSON Pointer 形式：它们由 `~0` / `~1` 转义；段数组形式不需要转义。翻译键（子零件/连接点/子系统/交互区）额外禁止这两个字符，元素名不受限（Pointer 里照常转义即可）。`projectile_types` 的 key 是资源地址，允许 `/`，但在 Pointer 里仍按 `~1` 转义。

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

`createPart` / `createVariant` 的 `partId` / `variantName` 不是翻译键，但同样只允许 ASCII。完整的 key 分类如下（**每个 map 层只属于其中一类**）：

| key 类别 | 出现位置 | 字符集 / 形态 | 小写 | 失败码 |
|---|---|---|---|---|
| `partId` | `parts` 的 key；`importPart` 的 `part_id` | `^[a-z0-9_.-]{1,128}$` + **路径安全判据**（见下），非空 | 是 | `invalid_format` |
| `variantName` | `variants` 的 key | `^[A-Za-z0-9_.-]+$`，非空，长度 ≤ 128 | 否 | `invalid_format` |
| 子零件 key | `sub_parts` 的 key | `^sub_part\.<ns>\.[A-Za-z0-9_.-]+$`；名称段 1–128、不以 `.` 开头/结尾 | 否 | `invalid_format` |
| 翻译键（连接点/交互区/子系统） | `connectors` / `interact_boxes` / `subsystems` 的 key | 名称段 `^[A-Za-z0-9_.-]+$`、1–128、不以 `.` 开头/结尾；**前缀形态只告警** `non_canonical_key` | 否 | `invalid_format`（字符集）/ warning（前缀） |
| 纹理名 / 信号频道名 | `textures` / `signal_targets` / `signal_translations` 的 key | `^[A-Za-z0-9_.-]+$`，1–128，不以 `.` 开头/结尾 | 否 | `invalid_format` |
| 功率输出目标名 | `power_outputs` 的 key | 目标完整 key，`^[A-Za-z0-9_.-]+$`，1–128 | 否 | `invalid_format` |
| 弹种资源地址 | `projectile_types` 的 key | `^[a-z0-9_.-]+:[a-z0-9_./-]+$`（允许 `:` `/`，禁止大写、空白、`*`） | 是 | `invalid_format` |
| 模型元素名 | `hit_boxes` 的 key | 任意字符串，**非空**，不含 `*`（允许中文、`:`、`/`、`~`） | 否 | `key_reserved`（仅 `*`）/ `invalid_format`（空串） |
| 模型元素名（可空） | `hydrodynamics` 的 key | 任意字符串，**允许 `""`**，不含 `*` | 否 | 同上 |
| namespace | `config.namespace`；子零件 key 的 `<ns>` 段 | `^[a-z0-9_-]+$`，无点 | 是 | `invalid_format` |

**`projectile_types` 是唯一允许 `:` `/` 的配置 key**：它的 key 本身就是资源地址（如 `machine_max:7_62mm_ap`），不是翻译键；值才是整数。`textures` 的 **value** 也是资源地址（`machine_max:textures/...`），但 key 是纹理名，仍用上一行的规则。

`config.namespace` 自身必须是 `[a-z0-9_-]+`（进 resource location），在内容包设置入口校验；`loadConfig` 发现非法 namespace 时不改 key，记 `key_reserved`，导出闸门阻断。

**`partId` 的路径安全（不能只用字符集）**：`partId` 直接进入 `parts/<partId>.json`、`machine_max:textures/part/<partId>/...`，并在 `flat_export:false` 时进入 `path.join(partsBaseDir, partId.split('_')[0])`。字符集允许 `.`，因此以下值必须在写入前拒绝，不能靠“用户不会这么填”：

- 精确的 `.` / `..`；
- 以 `.` 开头或结尾（`.hull` / `hull.`）；
- Windows 设备名（大小写不敏感，取**第一个点之前**的段）：`con` / `prn` / `aux` / `nul` / `com1`–`com9` / `lpt1`–`lpt9`；`con.1` 也算，因为 `con.1.json` 仍是设备名；
- **两个值都要跑同一判据**：完整 `partId`（文件名）与 `partId.split('_')[0]`（`flat_export:false` 的目录段）。`.._hull` 的目录段是 `..`、`a._b` 的目录段是 `a.`，都必须拒绝；
- 不禁止内部点：`a.b.c` 仍是合法 `partId`（§5.1.5 #4 继续通过）；`a..b` 也可，文件系统不会把它解释为父目录。

`doc/keys` 暴露 `isValidPartId`（字符集 + 长度）与 `isSafePartId`（前者 + 路径安全）；写入口只调 `isSafePartId`，`createPart` / `importPart` / `drag_import` 共用；违规返回 `invalid_format`，`hint` 说明是路径安全而非字符集问题。**导出侧必须再断言一次**：`services/export.js` 在 `path.join` 前对每个 `partId` 调用同一函数，失败直接 `io_error` 终止，不写任何文件。这样即使测试或未来入口绕过 `canExport` 直接调 generator，也不会把文件写到 `parts/..`。

存量工程里已有不安全 `partId` 时，`loadConfig` **不自动改名**（会牵动文件名、resource location 与存档），记 `key_reserved`（导出期 error），由用户重建；与 §15.2 的“非 ASCII / 非小写 `partId` 不迁移”同一处理。

**为什么子零件连格式一起强制、其它只强制字符集**：`sub_parts` 有整件通道（`import_sub_part`）和 `read_node(as='definition')` 的 round-trip 验收，key 必须可逆；连接点/子系统/交互区的整件通道在 D9 里已排除，v3 只强制 ASCII 字符集，前缀形态暂只告警；它们的存量非 ASCII key 记 `key_reserved` error，但不在 `loadConfig` 里自动改名（改名要同步第 5~13 行引用，留到后续）。

#### 5.1.3.1 强制入口矩阵（D17 闭合）

| 入口 | 受控 key | 规则 | 失败 / 处置 |
|---|---|---|---|
| `ops.createPart` / `ops.importPart` / `drag_import` | `partId` / `part_id` | 上表第 1 行 + `isSafePartId`（`.` / `..` / 首尾点 / Windows 设备名） | `invalid_format`；不做自动改写 |
| `ops.createVariant` / `ops.importVariant` / `ops.renameVariant` | `variantName` / `variant` | 上表第 2 行 | `invalid_format` |
| `ops.importSubPart` / `ops.renameSubPart` / `ops.markSubPart` | 子零件 key | 上表第 3 行；`markSubPart` 的默认名由 `generateDefaultName('sub_part', {namespace})` 生成后再校验 | `invalid_format`；`mark*` 的自动名不合法时降级为 `sub_part.<ns>.legacy_<n>` |
| `ops.createSubsystem` / `ops.importSubsystem` / `ops.renameSubsystem` | 子系统实例 key | 上表第 4 行（允许完整 `subsystem.<ns>.<name>` 形态；前缀不规范仅 warning） | `invalid_format` |
| `ops.markConnector` / `ops.renameConnector` | 连接点 key | 上表第 4 行；自动名由 Locator 名 `toSnakeCase` 后校验 | `invalid_format`；自动名非法时 `legacy_<n>` |
| `ops.markInteractBox` / `ops.renameInteractBox` | 交互区 key | 同上（骨骼名来源） | 同上 |
| `ops.setField`（`allowMissingLeaf` 新建） | `textures.*` / `signal_targets.*` / `signal_translations.*` / `power_outputs.*` / `projectile_types.*` | 按路径所在 map 层查上表 | `invalid_format`；不写入 |
| `ops.setField` / `ops.import*` | `hit_boxes.*` / `hydrodynamics.*` | 元素名规则（`hydrodynamics` 允许 `""`） | `key_reserved` / `invalid_format` |
| `ops.setContentPack` / `setContentPackPath` | `namespace` | 上表最后一行 | `invalid_format`；不落盘 |
| `ops.importPart` / `importVariant` / `importSubPart` / `importSubsystem` 的嵌套 map | 上述全部 | `projection.in` 的 `validateKeys` 递归执行 | 一次返回全部违规 key，不写半截 |
| `loadConfig` | 既有全部 key | 只自动迁移**子零件 key**；其余非 ASCII / 非法 key（含 `.`/`..`/设备名等不安全 `partId`）记 `key_reserved`，不改写 | 导出期 error；`_lastMigration.key_reserved` 列表 |

> 入口不按「谁调用」区分：UI、右键菜单、MCP、文件导入都走同一批 `ops`，所以校验只实现一次。`validateKeys` 是 `doc` 层的纯函数，`setField` 与 `projection.in` 共用；`ops` 只在 key 不进入 `projection` 时（如 `part_id`）单独调用 `doc.keys`。

**字符集违规统一返回** `invalid_format`，`errors[]` 带 `path`、`expected`（正则）、`got`、`hint`（提示完整形态）；`*` 单独返回 `key_reserved`（hint 说明它是通配符，不是合法 key）。

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
| 7 | `['_uiState','activePartId']`（`_uiState` 在**配置根**，不在 part 下） | `unknown_field` |
| 8 | `['parts','hull','variants','default','sub_parts','sub_part.machine_max.x','connectors','connector.machine_max.c','signal_targets','door']`（写，末段新 key） | 命中（`allowMissingLeaf`） |
| 9 | 同 8 但父级 `connectors` 不存在 | `not_found` |
| 10 | `['parts','hull','variants','default','sub_parts','*','projected_area','*']`（数组层通配） | `invalid_format` |
| 11 | 写入 key `sub_part.machine_max.底盘` / `sub_part.machine_max.前 底盘` | `invalid_format`（非 ASCII / 空白） |
| 12 | `createPart` 的 `partId` 为 `底盘` 或 `Hull` | `invalid_format`（非 ASCII / 非小写） |
| 13 | `['parts','hull','element_markers']`（part 级内部字段，不可寻址） | `unknown_field` |
| 14 | `['parts','hull','variants','default','sub_parts','sub_part.machine_max.main','hydrodynamics','']`（空字符串 key 表示质心） | 命中；写入同路径也允许 |
| 15 | `[... 'hit_boxes','']`（空字符串不是合法骨骼名） | `invalid_format` |
| 16 | `['parts','hull','variants','default','sub_parts','sub_part.machine_max.main','subsystems','subsystem.machine_max.regen_loader','projectile_types','machine_max:30mm_ap']`（资源地址 key 含 `:`） | 命中；`projectile_types` 只在该子系统类型下存在 |
| 17 | `['parts','hull','variants','model','model']`（变体名恰好是 `model`） | 命中（不得被单变体简写判定吞掉） |

**`_uiState` / `element_markers` 的位置**：`_uiState` 是配置根字段（`config._uiState`），`element_markers` 是 part 字段（`part.element_markers`）。两者都只属于内部树，`projection.in/out` 都会剥离；路径解析必须在 record 字段白名单阶段返回 `unknown_field`，不能因为「名字像字段」而放行。

**空段规则**：只有当前节点是 `hydrodynamics` map 时，空字符串段才是合法 key；其它 map / record 层的空段一律 `invalid_format`。JSON Pointer 的尾部 `/` 表示空段（RFC 6901），与段数组的 `''` 等价。

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
  nullable: false,           // 是否允许 null（仅 schema nullable 或 upstream Optional 字段，如 overwrite；required 字段禁止）
  minimum: 0, maximum: null,
  enum: null,                // string 枚举
  oneOf: null,               // [{type,...}, ...]，如 textures: string | object
  properties: null,          // object 的字段表（overwrite）
  additionalProperties: null,// object 的值规格；false 表示封闭
  items: null,               // array 的元素规格
  minItems: null, maxItems: null,
  minProperties: null,       // required map 的最小条目数（如 regen_loader.projectile_types = 1）
  tuple: null,               // tuple 的逐位规格，如 projected_area: [number, number, number]
  references: null,          // 'bone' | 'locator' | 'subsystem' | 'connector' | 'signal' | 'resource'
  required: false,           // 完整性用；写入/导入不阻断，导出闸门阻断
  sideEffect: null,          // 见下表
}
```

关键字段的生成结果：

| 字段 | 规格 |
|---|---|
| `variant.textures` | `oneOf: [{type:'string', references:'resource'}, {type:'object', minProperties:1, additionalProperties:{type:'string', references:'resource'}}]` |
| `variant.model` / `animations` | `type:'string', references:'resource'`（schema 的 `$ref` 是 `resource_location` = 纯 string；它自己的 example 写成 map，属 examples bug，Codec 也只接受 string） |
| `hit_box.overwrite` | `type:'object', properties: {physics 7 / armor 12 / sounds 2}, additionalProperties: false` |
| `connector.overwrite` | `type:'object', properties: {12 个}, additionalProperties: false` |
| `sub_part.projected_area` | `type:'tuple', tuple:[number,number,number], minItems:3, maxItems:3` |
| `sub_part.end_bones` | `type:'array', items:{type:'string', references:'bone'}` |
| `subsystem.seat.dismount_locators` | `type:'array', items:{type:'string', references:'locator'}` |
| `subsystem.*.signal_targets` | `type:'object', additionalProperties:{type:'array', items:{type:'string', references:'signal'}}` |
| `subsystem.*.power_output` | `type:'string', references:'signal'` |
| `hit_boxes` / `interact_boxes` / `connectors` / `subsystems` | 容器由 `address` 处理，不生成字段规格 |

> 最新上游把多处 `$ref` 改成 `allOf: [ { "$ref": ... } ]`（material / direction / variant / projected_area / 各 signal 输出等）。生成器必须先展开 `allOf` 分支，再合并 `default` / `description` 等兄弟键；否则兄弟键会被转成 `type:'any'`，把 `projected_area` 的 tuple、`material` 的 `references:'resource'` 覆盖掉。P1 已修 `mergeAllOf`：当 `extra.type === 'any'` 且 base 有具体类型时保留 base 类型。

`setField` 的值校验顺序：`nullable` 短路 → `oneOf` 逐个尝试 → `type` 基础校验 → `enum` / `minimum` / `maximum` → `tuple` 长度 → `items` 递归 → `properties` / `additionalProperties` 递归。任一失败返回 `errors[]`（可多条），不写入。

> **本轮上游把 `connector.overwrite` 从 11 项补到 12 项**：新增 `impact_absorption_destroyed`，并给 `impact_absorption` 加 `maximum: 1`；`power_target` 仍只在 connector 顶层，不在 overwrite 规格里。P1 按 schema 的 12 项校验；Java `OverwriteAttr` 的 `power_target` 是已知 schema 外字段，不在 `field_specs` 里放宽。

#### 5.2.1.1 生成物接口（P0 已落地）

`src/doc/field_specs.generated.js` 由 `node scripts/gen-field-specs.js` 生成，`require` 后得到四个导出：

```js
const { PROVENANCE, SPECS, CONTAINERS, SIDE_EFFECTS } = require('./field_specs.generated.js');

PROVENANCE = {
  generator, generator_version, source_locale, source_root,
  source_revision: 'a1460ce1',
  source_files: 67, source_sha256, generated_from,
};

SPECS = {
  part:        { fields: { icon: {...}, ... }, required: [] },
  variant:     { fields: { tags: {...}, model: {...}, ... }, required: ['model'] },
  sub_part:    { fields: {...}, required: [] },
  hit_box:     { fields: {...}, required: ['type'] },
  interact_box:{ fields: {...}, required: ['bone', 'signal_targets'] },
  connector:   { fields: {...}, required: ['locator', 'definition'] },
  subsystem: {
    'machine_max:basic': { fields: {...}, required: ['type', 'definition'], schema: '...' },
    // …共 19 种
  },
};

CONTAINERS = { part: ['variants'], variant: ['sub_parts'], sub_part: ['hit_boxes', ...] };
SIDE_EFFECTS = { 'sub_part.start_bone': 'migrate_sub_part_marker', ... };
```

约定：

- `SPECS.<kind>.fields` 只含标量 / map / 数组字段；`CONTAINERS` 里的容器不生成规格，由 `doc/address` 处理。
- 每个字段的 `required: true` 与 `SPECS.<kind>.required` 同时存在；后者只保留真实字段（容器字段由 `CONTAINERS` 表示）。上游本轮已把 `variant.required` 的 `models` 修正为 `model`，生成器不再需要别名归一化。
- `SPECS.subsystem` 的 key 是完整 type id（`machine_max:engine`），不是短名；生成器从 `subsystem_dynamic_attr.schema.json` 的 `type.enum` + `if/then` 展开，并显式补齐无分支的 `machine_max:basic`。
- `PROVENANCE.source_sha256` 是 67 个 en_us schema JSON 的路径 + 内容 hash；`--check` 同时比较生成文本，重复运行逐字节一致（不含时间戳）。
- 改 schema 或生成器后运行 `node scripts/gen-field-specs.js`；CI 用 `node scripts/gen-field-specs.js --check`。

#### 5.2.2 类型清单与 `schema_codec_allowlist` 的职责

- 普通 kind 的规格来自对应 schema；
- `subsystem` 按 `typeId` 分组，**只生成上游 19 种**（由 `subsystem_dynamic_attr.schema.json` 的 `if/then` + 各类型 schema 展开）；
- **D18**：5 个 WIP 类型从 `SubsystemDispatchCodec` 与 `subsystem_types.js` 删除（22→17）；不保留 decode/read、不告警、不提供兼容层，遇到这些 type 一律 `unknown_type`；
- **required 字段没有 nullable override**；只有 `hit_box.overwrite` / `connector.overwrite` 因为是上游 `Optional` 字段，在 `field_specs` 里标 `nullable: true`。`subsystem` 的 required 字段（`definition` / `power_output` / `connector` / 必填 `locator`）使用 `''` 占位，optional `locator` 使用 `.default('')`，都不标 nullable。

`schema_codec_allowlist.js` **不是一个笼统的「允许清单」**，它按测试类型分成五段：

```js
module.exports = {
  // 1) 类型集合缺口：Codec 缺、schema 有
  missing_types: [
    { type: 'machine_max:track_controller', owner: 'D13' },
    { type: 'machine_max:track_drive',      owner: 'D13' },
  ],

  // 2) 类型集合多余：Codec 有、schema 没有（D18 删除 5 个 WIP 类型）
  extra_types: [
    { type: 'machine_max:battery',        owner: 'D18' },
    { type: 'machine_max:signal_convert', owner: 'D18' },
    { type: 'machine_max:joint',          owner: 'D18' },
    { type: 'machine_max:javascript',     owner: 'D18' },
    { type: 'machine_max:ammo_loader',    owner: 'D18' },
  ],

  // 3) 字段集合缺口：Codec 缺字段（D12 修完后都应为空）
  // P1 先按 owner 放行真实缺口；D12 补齐后必须删条目，否则按过期条目失败
  missing_fields: [
    // 最新快照给 hit_box 增加 module；physics / armor / sounds 已收进 overwrite
    { kind: 'hit_box', field: 'module', owner: 'D12' },
    { kind: 'subsystem', type: 'machine_max:launcher',     field: 'fire_animation', owner: 'D12' },
    { kind: 'subsystem', type: 'machine_max:regen_loader', field: 'belt_label',     owner: 'D12' },
    { kind: 'subsystem', type: 'machine_max:weapon_controller', field: 'first_hud_layout', owner: 'D12' },
    { kind: 'subsystem', type: 'machine_max:weapon_controller', field: 'third_hud_layout', owner: 'D12' },
    { kind: 'subsystem', type: 'machine_max:weapon_controller', field: 'scope_hud_layout', owner: 'D12' },
  ],
  extra_fields:   [],   // 例：Codec 有、schema 没有的运行时字段（目前无）

  // 4) 同一字段的约束差异：字段存在，但类型/required/enum/结构不同
  constraint_diffs: [
    { kind: 'hit_box', field: 'type', schema: 'enum', codec: 'string', enforcedBy: 'field_specs.enum' },
    { kind: 'hit_box', field: 'id', schema: "default('')", codec: 'field()', enforcedBy: 'D12' },
    { kind: 'hit_box', field: 'overwrite', schema: 'object(physics/armor/sounds)', codec: 'any.nullable', enforcedBy: 'field_specs.object' },
    { kind: 'connector', field: 'overwrite', schema: 'object(12)', codec: 'any.nullable', enforcedBy: 'field_specs.object' },
    { kind: 'interact_box', field: 'condition', schema: 'enum', codec: 'string', enforcedBy: 'field_specs.enum' },
    { kind: 'interact_box', field: 'signal_targets', schema: 'required', codec: 'default({}) + emitEmpty', enforcedBy: 'codec.emitEmpty' },
    { kind: 'connector', field: 'definition', schema: 'required', codec: "default('')", enforcedBy: 'collectIssues' },
    { kind: 'sub_part', field: 'hit_boxes', schema: 'required+minProperties', codec: 'map', enforcedBy: 'collectIssues' },
    { kind: 'sub_part', field: 'hydrodynamics', schema: 'default {""}', codec: 'default {}', enforcedBy: 'decode_tolerance' },
    { kind: 'subsystem', field: 'projectile_types', types: ['machine_max:regen_loader'], schema: 'required+minProperties', codec: 'default({}) + emitEmpty', enforcedBy: 'codec.emitEmpty+minProperties' },
  ],

  // 5) decode 比 schema 宽松、但 encode 不会产出非法 JSON 的字段
  decode_tolerance: [
    { kind: 'interact_box', field: 'signal_targets', why: 'missing → {}，encode 始终输出' },
    { kind: 'sub_part', field: 'hydrodynamics', why: 'missing → {}，导出省略等价默认值' },
  ],

  // 6) 全局例外：schema 的 additionalProperties:false 不由 Codec 执行
  unknown_fields: 'preserve',
};
```

测试规则：

1. **类型集合**：`SubsystemDispatchCodec` 的 key 集合 ∪ `missing_types` = schema 19 种 ∪ `extra_types`；`missing_types` 在 D13 完成后必须为空，`extra_types` 在 D18 完成后必须为空。
2. **字段集合**：对 D18 删除后的 17 种类型逐类型比较 schema `properties`（去掉 `type`）与 Codec record 字段；差异只能来自 `missing_fields` / `extra_fields`（缺失的 `track_*` 两种由 `missing_types` 解释，不参与字段比较）。`constraint_diffs` **不能**用来掩盖字段缺失——字段不存在时，配置它只会得到 `unknown_field`。
3. **约束条目有效性**：每条 `constraint_diffs` / `decode_tolerance` 必须同时指向真实存在的 schema 字段与 Codec 字段；`missing_fields` 必须带 `owner`。P1 放行 6 条真实缺口（`hit_box.module`、2 个 subsystem 字段、`weapon_controller` 的 3 个 HUD layout 字段），D12 修完后仍留在 `missing_fields` 的条目视为**过期条目**，测试失败；D13 补齐后仍留在 `missing_types` 的条目、D18 删除后仍留在 `extra_types` 的条目同样失败。
4. **encode 合规**：对 `decode_tolerance` 的字段，构造「缺失输入」，断言 `encode(decode(x))` 要么满足 schema，要么被 `canExport` 阻断；不能出现「既不满足 schema、闸门又放行」。
5. **`unknown_fields`** 是唯一允许的全局例外，不按字段登记；导出时由 Codec 剥离未知字段，`field_specs` 不把未知字段当错误。

> P1 实测补充：最新快照把 `hit_box` 的 `angle_effect` / `impact_modifiers` / `penetration_modifiers` / `damage_modifiers` / `unpen_power` 收进 `overwrite` 的 `physics` / `armor` / `sounds` 分组，顶层新增 `module`、保留 `condition`；`weapon_controller` 又新增 `first_hud_layout` / `third_hud_layout` / `scope_hud_layout`。因此 allowlist 的字段缺口为 `hit_box.module` + 3 个 HUD layout + 2 个旧 subsystem 字段，共 6 条。`hit_box.overwrite` 的约束差异从 `object(16)` 改为 `object(physics/armor/sounds)`。

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

#### 5.2.5 值校验：`validateValues` / `validateTree`

第三轮审阅指出：`field_specs` 只在 `setField` 里用，`import_*` 走 Codec 严格解码，`canExport` 只跑 `collectIssues`，于是枚举与结构值可以绕过。v3.1 把值校验抽成 `doc/validate.js` 的两个纯函数：

```js
// 单节点：给 setField / projection.in 用
validateValues(node, {
  kind,                 // 'part' | 'variant' | 'sub_part' | 'hit_box' | 'interact_box' | 'connector' | 'subsystem'
  typeId,               // subsystem 必填，用于选 field_specs
  path,                 // string[]，用于 errors[].path
  completeness: false,  // false：只查类型/枚举/范围/结构/key；true：额外查 required/minProperties
}) → { ok, errors: [{ path, code, expected, got, hint }] }

// 整棵树：给 canExport 用；path 仍是规范化段数组，由 canExport 的 toProblem 统一成 Problem
validateTree(config, { completeness: true }) → [{ path, code, expected, got, hint }]
```

**分工**：

| 调用方 | `completeness` | 目的 |
|---|---|---|
| `ops.setField` | `false` | 拒绝写入非法枚举/类型，但允许「先建后填」的 required 缺失 |
| `projection.in`（全部 `import_*`） | `false` | 同上；整件导入可省略 required 字段，由 `reset_fields` + 闸门提示 |
| `services/export.canExport` | `true` | 导出前把 required / `minProperties` / key 格式 / 枚举 / 范围一起扫一遍 |

**检查内容**（按顺序，任一项失败都进 `errors[]`，不短路）：

1. `nullable`：`null` 只对 schema nullable 或上游 `Optional` 字段（`overwrite`）放行；required 字符串收到 `null` 报 `type_mismatch`。`projection.in` 在 decode 前先把旧数据的 `null`/`"null"` 归一化为 `''`/`{}`，所以正常导入不会走到这条错误；
2. `oneOf`：逐个尝试，全失败报 `type_mismatch`，`expected` 列出分支；
3. `type` 基础校验：`string` / `number` / `integer` / `boolean` / `array` / `object` / `tuple` / `any`；
4. `enum`：`hit_box.type`、`interact_box.condition`、`sub_part.block_collision` 等；报 `invalid_enum`，`expected` 给完整枚举；
5. `minimum` / `maximum`：`thickness`、`mass`、`projectile_types` 的值等；报 `out_of_range`；
6. `tuple` / `items` / `minItems` / `maxItems`：`projected_area`、`end_bones`、`dismount_locators`；
7. `properties` / `additionalProperties`：`overwrite`（`hit_box` 的 physics/armor/sounds 分组、`connector` 12 字段、`additionalProperties:false`）；
8. `completeness:true` 时：`required` 缺失（`isMissingValue`）报 `missing_required`；`minProperties` 不足报 `missing_required`；
9. 递归子节点：`hit_boxes` / `interact_boxes` / `connectors` / `subsystems` 按各自 kind 继续走 1–8。

`validateTree` 在遍历前先按 §5.3.1 第 2 步的 `stripInternal` 同一张表跳过内部字段（`element_markers`、`_uuid`、`_marker_uuid`、`_unresolved_bones`、`auto_end_bones`）以及 `projectile_types` 里 `__new_p_*` 前缀的临时弹种 key；否则 UI 的占位 key 会被资源地址规则误判为 `invalid_format`，导致合法工程无法导出。`__new_p_*` 的清理只发生在 `projection.out`，`validateTree` 必须与它同口径。

**key 校验与值校验分开**：`validateKeys` 只负责 §5.1.3 的 key 字符集/形态，返回 `invalid_format` / `key_reserved`；`validateValues` 不重复查 key。`projection.in` 先 `validateKeys`（第 3 步）再 `decode`（第 4 步）再 `validateValues`（第 5 步），顺序不能反：key 非法时应在 decode 之前就拒绝，避免把非法 key 带进错误信息或 Vue 响应式对象。

**为什么不让 Codec 直接做枚举**：Codec 的 `decode` 也用于 `loadConfig`。若把 `hit_box.type` / `interact_box.condition` 改成 `Codec.ENUM`，存量工程里一个历史非法值就会让整个工程在加载阶段抛错，用户连修复界面都进不去。v3.1 的选择是：**Codec 只保证结构可解，值合法性由 `validateValues` 在写入/导入/导出三处报告**；`loadConfig` 仍用宽松 Codec 打开工程，打开后用 `collectIssues` + 面板提示引导修复。

**错误码**：新增 `out_of_range`（数值越界）；沿用 `type_mismatch` / `invalid_enum` / `invalid_format` / `missing_required` / `key_reserved`。`errors[]` 的 `path` 一律是规范化段数组；`canExport` 产出的 `Problem` 用 `path: { scope, partId, variantName, subPartKey, itemKey, field? }` 供面板定位与去重（`field` 见 §4.3）。

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

`ctx = { kind, mode, oldKey?, namespace, partId, variantName, parentPath, existing }`；返回 `{ node, reset_fields, unresolved, markerPlan, markerCleanup }`，**不写全局对象**。`oldKey` 只在 `mode:'rename'` 出现，分别是旧 `partId` / 旧 `variantName` / 旧子零件 key。

1. **形状归一化**（`normalizeShorthand`）
   - `variant.textures`: `string` → `{ default: string }`；
   - `variants`: **仅当 `typeof variants.model === 'string'`** 时才视为单变体，包成 `{ default: v }`。不能只判「对象自身含 `model` 字段」——变体名 `model` 是合法的，此时 `variants.model` 的值是对象（一个 `VariantConfig`），必须保持 map；
   - `sub_parts`: 单子零件简写**没有 key**，判定不能只看「含 `hit_boxes` / `mass` / `start_bone` 字段」——subpart 名恰好叫 `mass` / `hit_boxes` 时也是合法 map key。判据改为**看值形状**：`hit_boxes` 是对象且其条目形如 `{type: ...}`（不是嵌套的 `{hit_boxes: ...}`），或 `mass` 是 number、`start_bone` 是 string；满足则包成 `{ 'sub_part.' + ns + '.main': sp }`，**不是 `default`**；
   - `hit_boxes` / `interact_boxes` / `connectors` / `subsystems` **不做简写归一化**（key 就是身份）。
1.5. **归一化未配置占位**（`normalizeUnset`，必须早于 decode）
   - required 字符串（`definition`、`power_output`、`connector`、`launcher|joint.locator`）：显式 `null` / `"null"` → `''`；**缺失不补**，留给 `.field()` 报 `missing_required`（`read_node` 总会带字段，所以 round-trip 不受影响）；
   - required map（`interact_box.signal_targets`、`control_outputs`、`power_outputs`、`projectile_types`）：显式 `null` → `{}`；缺失由 `.default({})` 补（解码宽容）；
   - optional 字段（`seat/camera/lighting/sight.locator` 等带默认值的）：`null` → 删除，让 `.default(...)` 生效；
   - `projectile_types: []` → `{}`（旧版 registry 的脏默认值）；
   - 归一化只发生在 `projection.in`，不写回调用方对象；`reset_fields` 按“归一化后实际提供的字段”计算，显式 `null` 视为提供。
2. **剥内部字段**（`stripInternal`）
   - part: `element_markers`、`_unresolved_bones`；
   - sub_part: `auto_end_bones`；
   - interact_box: `_uuid`；
   - connector: `_marker_uuid`；
   - subsystem(regen_loader): `projectile_types` 里 `__new_p_*` 前缀项；
   - 所有层级：`_uiState`（不属于任何导出节点）。
3. **校验 key**（`validateKeys`，递归，覆盖全部 map 层）
   - `parts` / `variants` / `sub_parts`：按 §5.1.3 的 partId / variant / 子零件规则；`sub_parts` 还要求 namespace 等于 `ctx.namespace`；
   - 翻译键 map（`interact_boxes` / `connectors` / `subsystems`）：名称段 ASCII；字符集违规 → `invalid_format`；前缀不合规范只记 warning `non_canonical_key`；
   - `textures` / `signal_targets` / `signal_translations` / `power_outputs`：`^[A-Za-z0-9_.-]+$`、1–128、不以 `.` 开头/结尾；
   - `projectile_types`：**资源地址 key** `^[a-z0-9_.-]+:[a-z0-9_./-]+$`（允许 `:` `/`，要求小写）；
   - `hit_boxes`：非空、不含 `*`，其余字符（中文 / `:` / `/` / `~`）原样允许；
   - `hydrodynamics`：**允许 `""`**、不含 `*`，其余同上；
   - 一次返回全部违规 key（`errors[]`），不写半截。
4. **严格解码**（`decodeStrict`）
   - 用 `doc/shapes.js` 的 `PartShape` / `VariantShape` 显式 `Codec.map` 组合（`VariantShape.sub_parts = Codec.map(Codec.STRING, SubPartCodec)`）；
   - **不使用 `either`**：`either.decode` 用「key 里有没有 `.` 或 `:`」猜简写（[Codec.js:561-586](../src/codec/Codec.js)），`{chassis:{…}}` 会被 `SubPartCodec` 全默认解码吞成 `{default:{…,chassis:{…}}}`；`Codec.either` 仅保留给导出/旧加载路径；
   - Codec 抛出的类型错误在此捕获，映射为 `errors[]` 的 `type_mismatch` / `not_found`，带回当前 `path`；
   - `reset_fields`：`existing` 中存在、但本次输入（归一化后）没有的**顶层字段**；结构动作的 `reset_fields` 为空。它**不是递归 diff**：`import_part` 省略 `variants.default.tags`、`import_sub_part` 省略 `hit_boxes` 时，不会列出嵌套路径（见 docs/12 §5.3）。
5. **校验值**（`validateValues`，§5.2.5）
   - `completeness:false`：只查枚举 / 范围 / 结构 / 数组长度；`''` / `{}` 是合法占位（required 缺失由导出闸门负责）；`null` 只对 `overwrite` 这类 upstream `Optional` 字段放行；
   - 发生在 decode 之后，因此看到的是补齐默认值后的节点；失败返回 `invalid_enum` / `type_mismatch` / `out_of_range`，带 `path` 与 `expected/got`；
   - 覆盖 `import_part` / `import_variant` / `import_sub_part` / `import_subsystem` 的全部路径：`hit_box.type:"banana"`、`interact_box.condition:"WHATEVER"` 在这里被拒。
6. **解析 `hit_boxes` key**（`resolveHitBoxKeys`）
   - key 已是 UUID 且命中 → 保留；
   - key 是骨骼名 → 命中则换成 UUID，未命中则保留骨骼名并记 `unresolved_bone`（`field: 'hit_box_key'`）。
7. **解析元素引用**（`resolveElementRefs`）
   - `interact_boxes[*].bone` 命中 Group → 写 `_uuid`；未命中 → 不写 `_uuid`，记 `unresolved_bone`；
   - `connectors[*].locator` 命中 Locator → 写 `_marker_uuid`；未命中 → 记 `unresolved_bone`。
8. **校验配置引用**（`resolveConfigRefs`，§4.5）
   - `power_output`、`power_outputs` 的 key、`hit_boxes[*].subsystem`、`connectors[*].power_target`、`subsystems[*].connector`、`signal_targets[*][]` 必须指向**同一子零件内**的 subsystems / connectors / interact_boxes 条目，或哨兵 `local`/`global`；
   - `null` / `''`（未配置占位）**跳过**，不当作「指向空目标」；否则新建子系统会被自己的 placeholder 判成断裂引用；
   - 未命中 → `unresolved_config_ref`（error，整体拒绝）；只有 `local`/`global` 是例外，`part`/`subpart`/`vehicle` 按普通未知目标处理（不存在、不告警、不迁移）。
9. **生成标记计划与清理计划**（`markerPlan` / `markerCleanup`，都不执行）
   - `markerPlan` 每项：`{ partId, variantName, type, uuid, config_ref }`
     - `sub_part`：`start_bone` 命中 → `{type:'sub_part', uuid, config_ref: key}`；
     - `hit_box`：每个命中骨骼 → `{type:'hit_box', uuid, config_ref: 所属子零件 key}`；
     - `interact_box` / `connector` 同理（`config_ref` 为条目 key）；
     - 按 `(variantName, uuid)` 去重；同一 UUID 落在多个类型是数据异常，按 `sub_part > interact_box > connector > hit_box` 保留一条并记 warning `marker_conflict`，不静默覆盖。
   - `markerCleanup` 只在目标已存在时生成（`mode:'create'` 无旧状态）：
     - `importPart` → `{ scope:'part', partId: oldKey || partId }`（清该零件所有变体）；
     - `importVariant` → `{ scope:'variant', partId, variantName: oldKey || variantName }`；
     - `importSubPart` → `{ scope:'sub_part', partId, variantName, subPartKey: oldKey || 目标 key, config_refs:[oldKey || 目标 key, ...旧 interact_boxes key, ...旧 connectors key], uuids:[...旧 hit_boxes 的 UUID key, ...旧 interact_boxes[*]._uuid, ...旧 connectors[*]._marker_uuid] }`；`config_refs` / `uuids` 都从 `ctx.existing` 计算。`config_refs` 覆盖子零件 / 碰撞箱（两者的 `config_ref` 都是 `subPartKey`）与旧交互区 / 连接点；`uuids` 兜住旧 marker 的 `config_ref` 还是 `definition`（迁移未完成）或为 `null` 的情况。
     - `importSubsystem` → `null`（子系统没有 marker）。
   - `markerCleanup` 是**策略**，不是已删除的 UUID 列表；`ops` 用 `ports.markers.clearScope` 落地：`part` / `variant` 清整个标记字典，`sub_part` 按 `uuid ∈ uuids` **或** `config_ref ∈ config_refs` 删除。`clearScope` 只删 marker 条目，**不**调用 `clearMarker` 的下游配置清理——旧子树马上由整件写入替换，提前删配置只会制造中间态。
   - `mode:'rename'` 时，`markerCleanup` 的定位键用 `ctx.oldKey`（旧 partId / 旧 variantName / 旧子零件 key），`markerPlan` 用新 key；`ops` 在调用 `projection.in` 前填好 `oldKey`，不能让 projection 从新 key 反推旧位置。
10. **返回** `{ node, reset_fields, unresolved: { config_refs: [], bones: [] }, markerPlan, markerCleanup }`。

**整件写入的执行顺序（`ops.import*`，同一笔 `runConfigEdit`）**：

```
1. clearScope(markerCleanup)      // 旧 marker 先消失，避免与计划新增的并存
2. 替换 / 改名目标节点            // 配置树写入
3. set(markerPlan)                // 新增 marker；元素已不在时跳过并记 warning
4. recalc auto_end_bones          // 只在涉及 sub_part 时
```

顺序不能反：先写节点再清理时，`config_refs` 已随旧子树消失，无法判断哪些 marker 属于旧条目；先 set 再 clear 会把刚生成的 marker 一起删掉。`markerPlan` 里的 UUID 必须仍能命中元素，否则 `set` 跳过该条，不阻塞整件写入。


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

含 `hit_boxes`（UUID↔骨骼名）、单变体/单子零件、未解析骨骼、`definition:''`、`power_output:''`、`connector:''`、`locator:''`、`signal_targets:{}`、`power_outputs:{}`、`projectile_types:{}` 的节点都必须成立。`out('read')` 保留 `''` 与空 map 的形状；`in` 的 `validateValues(completeness:false)` 允许这些占位，因此 `reset_fields` 为空；导出时 `out('export')` 对 required 字段输出 `""` / `{}`（键仍在），再由 `canExport` 阻断。

#### 5.3.3 单子零件简写的落点（v3 修正）

`Codec.either` 的 wrap key 固定是 `default`（[Codec.js:530](../src/codec/Codec.js)）。对 `variants` 这是对的；对 `sub_parts` 不对——schema 规定单子零件用 `sub_part.machine_max.main`。因此：

- `in` 显式把单对象写成 `{ 'sub_part.<ns>.main': sp }`；
- 旧数据若因 `either` 解出 `{ default: sp }`，`loadConfig` 迁移为 `sub_part.<ns>.main`（§15）；
- `out` 不输出单对象简写，避免「文件形态正确、内存 key 丢失」的来回漂移。

#### 5.3.4 存量数据（`loadConfig` 一次性修复，见 §15）

- 非规范 `sub_parts` key → **改写为规范 key**（唯一性冲突加后缀），同步更新 `element_markers` 的 `sub_part` / `hit_box` `config_ref`；
- 单变体 / 单子零件简写、缺失 `hit_boxes` 容器 → 归一化为 map；
- `definition: null` / `power_output: null` / `connector: null` / `locator: null` → **归一化为 `''`**（required 字段）；`seat/camera` 等 optional `locator: null` → 删除，让默认值生效；
- `definition: "null"`（字符串）→ `''`；`projectile_types: []` → `{}`；`interact_box.signal_targets` 缺失 → 补 `{}`；
- `connector` marker 的 `config_ref` 存着 definition → 按 §15.2.1 的定序匹配统一为连接点 key；无法唯一匹配时保留 `legacy_config_ref`、`config_ref:null` 并记 warning；
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
| 13 | `subsystems[*].power_outputs` 的 **key**（值只是减速比） | 子系统 / 连接点完整 key | 移除该项 | 改写 key（保留数值） |

**第 13 行是第三轮补漏**：`transmission.power_outputs` 是 `{ 目标 key: 减速比 }`，目标写在 **key** 上。现有引用清理只处理 `power_output`（字符串），会留下指向已删除节点的 key。`refs.cleanDangling` / `renameRefs` 必须把 `power_outputs` 的 key 当作引用；`collectIssues` 的 `DANGLING_SIGNAL_TARGET` 也要覆盖它。`projectile_types` 的 key 是资源地址，不是节点引用，不在此列。

**第 2 行是现成 bug**：`markHitBox` 写入的 `config_ref` 是**所属子零件 key**（[operations.js:433](../src/core/operations.js)、[bone_resolver.js:125](../src/import/bone_resolver.js)），但 `renameSubPart` 只改 `type === 'sub_part'` 的 marker（[App.vue.js:1257](../src/ui/App.vue.js)）。子零件重命名后，其下所有 `hit_box` marker 仍指向旧 key，`cleanGhostMarkers` 会把它们当孤儿清掉。P2 的 `refs.renameRefs` 必须同时处理两类 marker；测试要覆盖「子零件改名 → 碰撞箱标记仍归属正确」。

**第 9 行是现成缺失**：`power_output` 是 `subsystem_types.js` 的动态字段、`required: true`、编辑器 `power_target`，Codec 里是 `Codec.STRING.field()`（[subsystem_codec.js:20](../src/codec/codecs/subsystem_codec.js)），v3.1 保持 `.field()`，内部未配置改为 `''`。删除/重命名目标子系统时必须清理/改写，否则模组侧解析失败。

**第 4 行语义统一**：`connector` marker 的 `config_ref` 现在写的是 `definition` 值（[App.vue.js:1475](../src/ui/App.vue.js)），而 `sub_part`/`interact_box`/`hit_box` 写的是 key。统一为「marker → 被标记配置条目的 key」，`definition` 单独存于配置条目；迁移见 §15。

**哨兵值（只有两个）**：

| 值 | 含义 | 处置 |
|---|---|---|
| `local` | 当前 Part（`Part.getSignalAddress()`） | 保留，永不删除 |
| `global` | 装配体总线（`SubsystemController.getSignalAddress()`） | 保留，永不删除 |

`part` / `subpart` / `vehicle` **不是哨兵**（D19）：它们按普通未知目标处理，写入/导入返回 `unresolved_config_ref`，不告警、不迁移。数据里若还留着这三个值，就当作错误目标，由用户改成 `local` / `global` 或真实节点 key。

> 依据：模组只解析 `local` / `global`（`ISignalSender.getReceiversFromNames`），`subpart` / `vehicle` 只出现在 `VariantAttr.RESERVED_SIGNAL_NAMES` 里作为**禁用名**。但 `subsystem_types.js` 的 `speed_outputs` / `gear_outputs` 默认值仍是 `['subpart','vehicle']`，`buildSignalTargetOptions` 也仍输出这两个值（[signal_target_options.js:24](../src/utils/signal_target_options.js)）——**P2 必须同步改为 `local`/`global`**，否则新建子系统即产生无效目标。另：该函数只列连接点与子系统，未列交互区；第 5~7 行按模组能力描述，P2 补齐选项。`validation.js` 与 `naming.js` 的 `RESERVED_SIGNAL_NAMES` 也仍把 `subpart`/`vehicle` 当保留名，P2 一并收为 `['local','global']`（D19：旧值不是保留名，只是未知目标）。

**不计入引用**：`signal_translations` 是「频道名 → 频道名」映射，与配置节点无关（v1 误列）；`definition` 是资源位置（内容包定义 id），由 `collectIssues` 的 `DEFINITION_REF_MISSING` 管，不做删除清理。

`refs` 的 API 分成两组，避免「骨骼未解析」与「配置引用」混在一起：

```js
refs.resolveBones(kind, node, ports)     // → { resolved: [...], unresolved: [{bone, field, subPartKey, key}] }
refs.resolveConfigRefs(config, scope)    // → { resolved: [...], dangling: [{path, target, kind}] }
refs.cleanDangling(config, removed)      // 删除/替换后清理，返回 cleaned_references
refs.renameRefs(config, { kind, oldKey, newKey })  // 含 4 类 marker + 第 5~13 行全部引用
```

### 5.5 原语

```js
doc.read(config, path, opts)             // → {ok, kind, value}
doc.write(config, path, value, opts)     // 标量/数组/对象；返回写入计划，不执行副作用
doc.insert(config, path, key, node)      // map 层新增条目
doc.remove(config, path, opts)           // → {ok, removed, cleaned_references}
doc.apply(config, path, definition, opts)// 整件替换；返回 {node, reset_fields, unresolved, markerPlan, markerCleanup}
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

**key 入口**：全部入口统一走 §5.1.3.1 的矩阵，不再按工具分别描述。`renameSubPart` / `importSubPart` 要求规范子零件 key；`importPart` 的 `part_id` 必须通过 `isSafePartId`（小写字符集 + 路径安全，见 §5.1.3）、`importVariant` 的 `variant` 必须 `[A-Za-z0-9_.-]+`；`createSubsystem` / `importSubsystem` / `renameSubsystem` 的实例 key 必须 `[A-Za-z0-9_.-]+`；其余 `rename*` 接受完整 key，非规范**前缀**只记 warning `non_canonical_key`，字符集违规仍是 `invalid_format`。`validateKeys` 与 `doc.keys` 是唯一实现，`ops` 不得自行写正则。

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

**整件通道的 marker 顺序**：`importPart` / `importVariant` / `importSubPart` 在同一个 `runConfigEdit` 内固定执行 `clearScope(markerCleanup)` → 替换节点 → `set(markerPlan)` → `recalc auto_end_bones`（§5.3.1）。三个 `import*` 都必须带 cleanup；`importSubsystem` 没有 marker，传 `null`。缺任一步的测试按 docs/12 §11.3 #33 判失败。

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
    markers:    { set: null, clear: null, clearScope: null, recalc: null }, // element_markers
    validation: { collectIssues: null },                  // mode/validation
    events:     { emit: null },                            // Blockbench.dispatchEvent
    reactivity: { set: null, del: null },                  // Vue.set / Vue.delete
};
function install(p) { /* 逐项覆盖 */ }
```

接线位置：**`plugin.js onload`（最早）**，而不是面板 mounted——工具栏/右键菜单可能早于面板。默认实现：`reactivity` 若全局 `Vue` 存在则用 `Vue.set`，否则普通赋值；`events` 若 `Blockbench` 存在则派发，否则空实现（Node 测试可用）。

`doc/address` 解析 `hit_boxes` 骨骼名路径、`doc/refs` 反查 UUID，都走 `ports.bones`。

`ports.markers.clearScope(cleanup)` 只服务 §5.3.1 的整件替换：`part` / `variant` 两级直接删标记字典，`sub_part` 级按 `cleanup.uuids` 或 `cleanup.config_refs` 删除匹配条目；**不做** `clearMarker` 的下游配置清理，也不重算 `auto_end_bones`（由 `ops` 在写入后统一调用 `recalc`）。

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
└── validate.js   # collectIssues + validateTree 包装 + diff（本次引入的问题）
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

### P0 — 上游对齐（已完成）

- ✅ `scripts/sync-schemas.js`（`--check` / `--apply` / `--source`，不 spawn 子进程，尽力读上游 commit 作溯源）
- ✅ vendored 快照全量替换：`src/builtin/builtin/machine_max/docs` 由 139 → 153 文件，与 `Machine-Max@a1460ce1` 逐文件 SHA256 一致；`--check` 零漂移
- ✅ 本轮 schema 更新：`variant.required` 的 `models` → `model`、`connector.overwrite` 补 `impact_absorption_destroyed`（11→12）、`variant.textures` 对象分支补 `minProperties:1`、`part_definition_schema` 的 examples 同步
- ✅ 7 个缺失 schema 到位（`track_controller` / `track_drive` 的 static+dynamic、`launcher` / `regen_loader` dynamic、`part_fabricating_recipe`）
- ✅ `scripts/gen-field-specs.js`（codegen；按 §5.2 的类型模型生成 19 种，含 provenance；`--check` 可做漂移检查）
- ✅ `scripts/audit-stats.js`（数字审计；47 项基线，输出与 §2 一致）
- ✅ `test/schema/field_specs.test.js`（生成物逐字节同步、19 种类型、关键字段、required map、容器/内部字段、副作用表、provenance 共 8 个测试）

验收命令：

```bash
node scripts/gen-field-specs.js --check   # 生成物 ↔ schema
node scripts/audit-stats.js               # §2 的 47 项基线
bun test test/schema/field_specs.test.js
```

当前结果：`--check` 通过；`audit-stats` 47/47 一致；`bun test` 8 pass。生成物为 `src/doc/field_specs.generated.js`（`PROVENANCE` / `SPECS` / `CONTAINERS` / `SIDE_EFFECTS`，接口见 §5.2.1.1）。

### P1 — 文档层（已完成）

`doc/{address,field_specs.generated,field_specs,shapes,projection,refs,ports,validate,keys,index}.js` + `doc/schema_codec_allowlist.js`；`test/doc/*.test.js` 与 `test/{helpers,mocks/blockbench}.js`。`keys.js` 是 §5.1.3 的唯一正则实现，`validate.js` 是 §5.2.5 的值校验。

验收结果：

- ✅ §5.1.5 全部 17 个路径向量通过（含 JSON Pointer、`*` 中间 map 层、数组层 `*`、中文骨骼名、含点 `partId`、`hydrodynamics[""]`、资源地址 key、变体名 `model`）。
- ✅ §5.3.1 / §5.3.2 的 in/out 顺序与 round-trip 通过：`hit_boxes` UUID↔骨骼名、单变体/单子零件、未解析骨骼、`definition:''`、`power_output:''`、`connector:''`、`locator:''`、`signal_targets:{}`、`power_outputs:{}`、`projectile_types:{}`。
- ✅ §5.4 全部 13 行引用矩阵（含 `power_outputs` 的 key、4 类 marker）通过；`signal_translations` 不被清理。
- ✅ `keys.js` 的 `isSafePartId` 覆盖 §11 #20（`.` / `..` / 首尾点 / `con` / `con.1` / `lpt9` / `.._hull` / `a._b`；`a.b.c` 合法）。
- ✅ `schema_codec_allowlist` 的类型/字段集合测试：`missing_types` 2 条（D13）、`extra_types` 5 条（D18）、`missing_fields` 6 条（D12：`hit_box.module` + `launcher.fire_animation` + `regen_loader.belt_label` + `weapon_controller` 的 3 个 HUD layout）。
- ✅ `require` 全部 `doc` 模块；P1 无调用方，未重建 `dist`。
- ✅ 零运行时行为变更：`Codec.record` / `Codec.dispatch` 只新增只读元数据 `schema` / `codecs`，不参与 encode/decode。

验收命令：`bun test`（84 pass / 322 expect，含 P0 的 8 个 schema 测试）。

### P2 — 操作层（1.5–2 会话）

`src/ops/*`（9 文件）；删除 `core/operations.js`（9 处 require 改写）；UI 44 个方法改薄；§4.4 **五项修复**（required 字符串 `''` / required map `emitEmpty`、`STRING.encode` 严格化、`projectile_types` 默认值与缺失字段、闸门兜底）；`subsystem_types.js` 的 `defaultValue: null → ''`；§5.2.5 的 `doc/validate.js`；§6.4 合并开关；§5.3.1 的 `markerCleanup` + `ports.markers.clearScope`（三个 `import*`）；§15.2.1 的 connector marker 迁移；`isSafePartId` 接入 `createPart` / `importPart` / `drag_import`；`renameSubPart` 的 ASCII key 校验 + `hit_box` marker 修复；`generateDefaultName('sub_part')` 用 `context.namespace`；**删除 5 个 WIP 类型**（Codec 22→17、`subsystem_types.js`、面板）；`signal_target_options.js` 改 `local`/`global` 并补交互区；`subsystem_types.js` 默认值改 `['local','global']`；`validation.js` / `naming.js` 的 `RESERVED_SIGNAL_NAMES` 收为 `['local','global']`；`collectIssues` 增加 `DANGLING_SIGNAL_TARGET`；`subsystem_types.js` 补 `fire_animation` / `belt_label`、`projectile_types` 默认改 `{}`，补 `hit_box.module` 与 `weapon_controller` 的 3 个 HUD layout 字段，并删除 `schema_codec_allowlist.missing_fields` 的 6 条 D12 占位与 `extra_types` 的 5 条 D18 占位。

验收：每字段改一次 = 一条撤销记录；四个 `import*` 可用且返回 `reset_fields`；拖拽导入回归；`coalesce:false` 下三次 `set_node` = 三条；子零件改名后碰撞箱标记归属正确；非规范 key 的 import 返回 `invalid_format`；**整件替换后旧 marker 不残留、同形替换不重复、Ctrl+Z 同时恢复配置与 marker**（§11 #18）；connector marker 迁移按 §11 #19 通过；`partId` 路径安全按 §11 #20 通过；`reset_fields` 顶层语义按 §11 #22 通过；**新建 basic / transmission / interact_box / regen_loader 的 round-trip 通过**（`definition:''`、`power_outputs:{}`、`signal_targets:{}`、`projectile_types:{}`）；`import_sub_part` 传 `hit_box.type:"banana"` 返回 `invalid_enum`；D12 修完后 `missing_fields` 为空、字段集合测试转绿。

### P3 — 事件总线 + 导出闸门（1 会话）

端口接线（`plugin.js`）、17 处落盘收敛、9 处计算属性写入删除、`collectIssues` 的 `Problem.path` 补 `field`、`canExport` 阻断（`collectIssues` + `validateTree(completeness:true)` + `dedupeIssues`）、`services/export.js` 的 `isSafePartId` 出口断言、默认值双源清理。

验收：`Ctrl+S` 内容不变；未选中元素时渲染不改配置；空碰撞箱的子零件**可正常编辑**但**导出被拦**；新建碰撞箱 `material` 与导入默认一致；**存量 `hit_box.type:"banana"` / `interact_box.condition:"WHATEVER"` 不阻断打开，但导出被 `invalid_enum` 拦截**；`projectile_types:{}` 的 `minProperties` 被拦；`definition:''` 只出一条 required 错误（§11 #21）；不安全 `partId` 在导出管线 `path.join` 前被拦，不写任何文件（§11 #20）。

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
├── doc/{address,field_specs,projection,refs,keys,validate,schema_codec,index}.test.js
├── ops/*.test.js
├── schema/{field_specs,sync,drift}.test.js
└── services/{export,validate}.test.js
```

必测清单（对应 §0 的十条改动、§0.2 的十四条收口、§0.3 的八条收口与 §5 的约束；#18–#22 是 v3.2 新增）：

1. 含点/中文/namespace 带点的路径；`*` 在中间 map 层；数组层 `*` 报 `invalid_format`；
2. `sub_parts` 单 key 反例（`{chassis:{…}}`）必须 `invalid_format`，不得被吞成 `{default:…}`；
3. `read_node` → `import_*` **round-trip**：ASCII 规范 key、含 `hit_boxes`、单变体、未解析骨骼、`definition:''`、`power_output:''`、`connector:''`、`locator:''`、`signal_targets:{}`、`power_outputs:{}`、`projectile_types:{}` 均 `reset_fields` 为空；
4. `field_specs` 不暴露 `id` / `element_markers`；`textures` / `overwrite` / `projected_area` 的类型校验生效；
5. `power_output` / `hit_box.subsystem` / `signal_targets` / `power_outputs` 的清理与重命名；`signal_translations` 不被清理；
6. `coalesce:false`：不同目标不合并、结构动作不合并；
7. 投影剥离内部字段（注入 `element_markers` / `_uuid` / `_marker_uuid` 后不可见）；
8. `"null"` 清洗（`definition:null` / `"null"` 归一化为 `''`，不出现字符串 `"null"`；required 字符串导出时允许 `""` 但被闸门拦）；
9. 导出闸门：空 `hit_boxes` 拦截、`orphan_element` 放行、`invalid_enum` 拦截、`projectile_types:{}` 的 `minProperties` 拦截；
10. `schema` 漂移：manifest ↔ schema、dispatch map ⊇ schema 类型集合（D18 删除后到 D13 前，因缺 `track_*` 该项为已知红灯）；`missing_types` / `missing_fields` / `extra_fields` / `constraint_diffs` / `decode_tolerance` 各自校验，过期条目失败；
11. 严格 key：非规范 `import_sub_part` 返回 `invalid_format`；中文/空白 key、中文或大写 `partId` 同样 `invalid_format`；`loadConfig` 迁移后**子零件**旧 key 全部规范化（`default` → `main`；`.main` / `main.` / `chassis!` / 中文 / 超长 → `legacy_<n>`），marker 同步；
12. 哨兵：只有 `local`/`global` 放行；`part`/`subpart`/`vehicle` 一律 `unresolved_config_ref`（不告警、不迁移）；
13. **required 占位**：新建 basic / engine / wheel_driver / seat / transmission 后立即 `read_node → import_*`；`definition` / `power_output` / `connector` / `locator` 为 `''`，required map 为 `{}`，`reset_fields` 为空；旧数据传 `null` / `"null"` 在 `normalizeUnset` 后同样成功；
14. **required 空 map**：`interact_box.signal_targets`、`transmission.power_outputs`、`car_controller.control_outputs`、`regen_loader.projectile_types` 的 `encode` 必须保留 `{}` 键；decode 缺失 → `{}`；`decode(encode(x))` 回环；
15. **值校验**：`import_*` 传 `hit_box.type:"banana"` / `interact_box.condition:"WHATEVER"` 返回 `invalid_enum`；`projectile_types` 的值 `0` 返回 `out_of_range`；已有非法值的工程 `canExport` 返回 `ok:false`，但 `loadConfig` 能打开；
16. **key 矩阵**：`import_part` 的 `part_id:"Hull"` / `import_variant` 的 `variant:"门"` / `createSubsystem` 的 `instanceName:"引擎"` / `setField` 新建 `textures.纹理` 全部 `invalid_format`；`projectile_types` 的 `machine_max:30mm_ap` 合法，`Machine_Max:30mm_ap` 非法（大写）；
17. **投影边界**：`variants` 的 key 恰好是 `model` 时不得被简写吞掉；`hydrodynamics[""]` 可读可写、`hit_boxes[""]` 报 `invalid_format`；`_uiState` 在根、`element_markers` 在 part，均返回 `unknown_field`；`projectile_types` 里残留 `__new_p_*` 时 `validateTree` 不报错（内部占位键）。
18. **replace 的 marker 清理**：`import_part` / `import_variant` / `import_sub_part` 替换成更少的 `sub_parts` / `hit_boxes` / `interact_boxes` / `connectors` 后，旧 marker 不残留、`config_ref` 不指向旧 key；同形替换后每个元素仍只有一个 marker；旧 connector marker 的 `config_ref` 仍是 `definition`（迁移未完成）时，也要靠 `uuids` 被清掉；`Ctrl+Z` 同时恢复配置与 marker。测试至少覆盖一个“骨骼还在、配置条目被删”的场景，证明 `cleanGhostMarkers` 单独拦不住。
19. **connector marker 迁移**：两个 connector 共用同一 `definition` 但 Locator 不同，各自 marker 迁到自己的 key；同名 Locator 跨子零件时用祖先子零件唯一化；`_marker_uuid` 缺失且无法唯一化时走 `legacy_config_ref` + `unresolved_config_ref` warning，不猜、不删 marker；重复加载幂等。
20. **`partId` 路径安全**：`createPart` / `import_part` / 拖拽导入对 `.`、`..`、`.hull`、`hull.`、`con`、`con.1`、`lpt9`、`.._hull`、`a._b` 返回 `invalid_format`；`a.b.c` 仍合法；绕过 `canExport` 直接调导出管线也在 `path.join` 前失败且不写文件；存量非法 `partId` 由 `loadConfig` 记 `key_reserved`，不自动改名。
21. **闸门去重**：`subsystems.<key>.definition:''` 只产生一条 required 错误（`collectIssues` 优先），`definition` 与 `locator` 同时为空时仍是两条（不同 `path.field`）；`validateTree` 的段数组与 `collectIssues` 的对象路径能对齐到同一 `scope/partId/variantName/subPartKey/itemKey`。
22. **`reset_fields` 顶层语义**：`import_part` 省略 `variants.default.tags` / `sub_part.hit_boxes` 时，`reset_fields` 不包含嵌套路径；`read_node` 显示默认值，AI 必须靠“先读全量再改”而不是靠 `reset_fields` 发现嵌套丢失。

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
  reset_fields: string[],       // import*：被重置的**顶层**字段（不是递归 diff）
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

**`path` 用规范化后的段数组**回传，工具层直接透传，不再从 `data` 里猜。`collectIssues` / `canExport` 的 `Problem.path` 是对象（`{scope, partId, variantName, subPartKey?, itemKey?, field?}`），与 `OpResult.path` 的段数组是两种口径：前者供面板定位和去重，后者供工具调用方使用，不要混用。

**产生者**：`before/after` ← `doc` 原语；`reset_fields` ← `projection.in`；`dropped_fields` ← `setField` 的 `sideEffect`；`cleaned_references` ← `refs`；`introduced_issues` ← `ops` 通过 `ports.validation.collectIssues` 在**同一撤销记录内**做前后 diff（不 `require` `mode/validation`，保持分层）。

错误码：`no_project` / `not_found` / `missing_required` / `type_mismatch` / `invalid_enum` / `invalid_format` / `out_of_range` / `duplicate_name` / `unknown_field` / `unknown_type` / `unresolved_config_ref` / `key_reserved` / `edit_in_progress` / `snapshot_too_large` / `io_error`。warning code：`non_canonical_key`（前缀不规范，不阻断）、`unresolved_bone`、`orphan_element`、`key_reserved`（存量非法 key，导出期转 error）。

> **大小写与级别约定**：`Problem.code` / `OpResult.errors[].code` 一律小写 snake_case；`DEFINITION_REF_MISSING` / `DANGLING_SIGNAL_TARGET` 这类大写标识只是规则名或 `CODES` 常量名，不是线上 code。v3.2 把 `KEY_RESERVED` / `ORPHAN_ELEMENT` 统一为 `key_reserved` / `orphan_element`。`key_reserved` 的 `code` 不变，加载期是 warning（`_lastMigration.key_reserved`），导出期由 `canExport` 提升为 error；不要用大小写区分级别。

> v2 的 `ambiguous_path` 已删除（§5.1.1）；新增 `unresolved_config_ref`（配置引用断裂）、`key_reserved`（key 含 `*` 等保留字符）与 `out_of_range`（v3.1 数值越界）；WIP 类型删除后不再有 `unsupported_type`，未知类型统一 `unknown_type`。

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
| D12 | schema↔Codec 漂移 | 以 schema/上游为准：结构性修复（`hit_box.id` 默认值改为 `''`、`STRING.encode` 严格化、required 字段保持 `.field()` + `''` 占位、optional locator 改 `.default('')`）+ 字段补齐 6 项（`launcher.fire_animation`、`regen_loader.belt_label`、`hit_box.module`、`weapon_controller.first_hud_layout` / `third_hud_layout` / `scope_hud_layout`）+ 默认值 1 项（`projectile_types: []` → `{}`）；`hit_box.overwrite` 的 `physics` / `armor` / `sounds` 分组由 `field_specs.object` 校验；枚举/结构差异由 `field_specs` 在写入/导入/导出三侧拦，其余进 allowlist | 推荐（v3.1 扩，P1 校） |
| D13 | `track_*` 两种类型 | **单独立项**（不阻塞 P1，但 `missing_types` 留 2 条，测试为已知红灯；补齐后 allowlist 必须清空） | 用户 |
| D14 | 可空字段清单 | **撤销「用户可选清单」**；固定内部占位：required 字符串 `''`、required map `{}`；`null` 只用于 upstream `Optional` 字段（`overwrite`）；编辑不拦、导出阻断 | 用户（§4） |
| D15 | 导出闸门 | `severity==='error'` 阻断导出 | 用户 |
| D16 | key 策略 | **严格规范 key**：ASCII 字符集对所有翻译键强制；子零件 `sub_part.<ns>.<name>` 形态强制并迁移；其它 kind 前缀形态只告警 | **用户**（第二轮） |
| D17 | key 字符集 | **所有配置 key 纯 ASCII**（模型元素名除外）；`partId` 与 namespace 小写 `[a-z0-9_.-]+` / `[a-z0-9_-]+`（进 resource location），`partId` 还须通过 `isSafePartId`（D25）；其余 `[A-Za-z0-9_.-]+`；中文/空白拒绝 | **用户**（第二轮） |
| D18 | 5 个 WIP 子系统类型 | **删除**（Codec 22→17、registry、面板、类型清单）；不保留 decode/read，不提供兼容层 | **用户**（第二轮） |
| D19 | 信号哨兵 | 只有 `local`/`global`；`part`/`subpart`/`vehicle` **不存在**：不保留、不告警、不迁移，按普通未知目标报错 | **用户**（第二轮） |
| D20 | required 占位与空容器 | required 字符串保持 `.field()`，内部未配置用 `''`（不用 `null`/nullable）；required map 用 `Codec.map(..., {emitEmpty:true})`，`{}` 也输出；optional 字段用 `.default(...)`；`null` 只用于 upstream `Optional` 字段（`overwrite`）。导出闸门阻断空 required / 空 `minProperties` | **第三轮审阅** + 上游复核（§3.4、§4.4） |
| D21 | 值校验边界 | Codec 只保证结构可解；枚举/范围/结构/key 由 `doc.field_specs` + `doc.validate` 在 `setField` / `projection.in` / `canExport` 三处执行；**不把枚举塞进 Codec**，避免存量脏值让工程无法打开 | **第三轮审阅**（§5.2.5） |
| D22 | required / optional 判定 | 以上游 `fieldOf` / `optionalFieldOf` 为准：`optionalFieldOf` 是「键可缺失 → 默认值」，不是「值可为 null」；required 字段不 nullable；只有 `optionalFieldOf` 无默认（`Optional` → Java null）的 `overwrite` 用 nullable | **用户追问**（2026-10-21） |
| D23 | 整件替换的旧 marker | `projection.in` 返回 `markerCleanup`（part / variant / sub_part 三级）；`ops.import*` 在同一撤销内按「清旧 marker → 替换节点 → set 新 marker」执行，`sub_part` 级用旧条目 `config_refs` / `uuids` 精确清理 | **第四轮审阅**（§5.3.1） |
| D24 | connector marker 迁移 | 定序匹配 `config_ref` 已是 key → `_marker_uuid` → Locator 名全局唯一 → 祖先子零件内唯一；`definition` 不参与匹配；失败保留 `legacy_config_ref`、`config_ref:null`、warning，不猜 | **第四轮审阅**（§15.2.1） |
| D25 | `partId` 路径安全 | 字符集之外拒绝 `.` / `..` / 首尾点 / Windows 设备名，完整值与 `split('_')[0]` 目录段都查；写入口 `invalid_format`，导出管线二次断言，存量记 `key_reserved` | **第四轮审阅**（§5.1.3） |
| D26 | 闸门问题去重 | 统一 `Problem.path.field`，按 `scope/partId/variantName/subPartKey/itemKey/field` 去重；`collectIssues` 优先，`validateTree` 补空缺；不同字段不合并 | **第四轮审阅**（§4.3） |
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
| 编辑期因校验 error 阻断操作 | 与「渐进填写」模型冲突（§4） |
| 收紧 `additionalProperties` | 会牵连现有导入逻辑，单独排期 |
| `track_controller` / `track_drive` 支持 | 独立立项（D13） |
| 内容包定义 JSON 的编辑通道 | Q1 |

---

## 15. 存量迁移（`loadConfig` 一次性修复）

`loadConfig` 分**三段**，顺序固定，不能合并：

```
A. raw 预处理（必须早于任何 PartCodec.decode）
   1) 备份原始 JSON（services/pack：<project>.mm_project.json.bak）
   2) 剔除 5 个 WIP 子系统条目（D18），记入 _lastMigration.removed
   3) required 字符串 null/"null"/缺失 → ''；required map null/缺失 → {}；optional 字段 null → 删除（让默认值生效）；projectile_types: [] → {}
   4) 单变体 / 单子零件简写归一化（按 §5.3.1 第 1 步的判据；必须在 decode 前完成，避免 either 的启发式把 `variants.model` 当成单变体）
B. decode（用 `doc/shapes` 的 `PartShape` 显式 map；若暂时仍用 `PartCodec`，必须已由 A 段归一化，不能让 `either` 猜）
C. key / marker 迁移（子零件 key 规范化、marker.config_ref 改写、容器补全、幽灵清理）
```

结果写入 `config._lastMigration`（瞬态，不进导出），UI 在加载完成后 toast 汇总。除 `removed` / `key_reserved` 外，connector marker 的迁移结果单独放 `marker_refs`（成功也记 `{uuid, from, to}`，失败记 `legacy_config_ref` + `reason`）；它是 warning，不是 error，不阻塞加载。

> **第三轮审阅指出的顺序错误**：原文写「迁移在解码之后」，但 WIP 剔除必须在 decode 之前——`SubsystemDispatchCodec` 遇到已删除类型会先抛 `Unknown dispatch type`，根本走不到迁移。A 段因此是独立的 raw 层；B 段之后才允许做任何依赖解码结构的迁移。

### 15.1 子零件 key 规范化（D16）

```
// 第一遍：把已经是规范形态的 key 放进 usedKeys / usedNames，保证结果与遍历顺序无关
for each part, variant:
  usedKeys  = { k | isValidSubPartKey(k, ns) }
  usedNames = { nameOf(k) | isValidSubPartKey(k, ns) }
  for each oldKey of variant.sub_parts (原始顺序):
     newKey = canonicalSubPartKey(oldKey, ns, usedKeys, usedNames)
     if newKey === oldKey: continue
     move entry oldKey → newKey
     usedKeys.add(newKey); usedNames.add(nameOf(newKey))
     rewrite markers: element_markers[variant][uuid].config_ref
        - type === 'sub_part' 且 config_ref === oldKey → newKey
        - type === 'hit_box'  且 config_ref === oldKey → newKey
     record { from: oldKey, to: newKey, reason }
```

`canonicalSubPartKey(key, ns, usedKeys, usedNames)` **不重新实现一套校验**，直接复用 §5.1.3 的 `isValidSubPartKey` / `isValidNameSegment`：

```js
function canonicalSubPartKey(key, ns, usedKeys, usedNames) {
    if (isValidSubPartKey(key, ns)) return key;          // 已规范，原样保留
    var name = extractName(key);                          // 去掉 sub_part.<其它ns>. 前缀
    if (name === 'default') name = 'main';                // 裸 default = 旧 either 简写
    if (!isValidNameSegment(name)) name = nextLegacyName(usedNames);
    return uniqueSubPartKey('sub_part.' + ns + '.' + name, usedKeys);
}
```

`reason` 取值：`key_format`（不合 §5.1.3 的名称段）、`default_shorthand`（裸 `default` → `main`）、`collision`（`_2` 后缀）、`namespace_fallback`（`config.namespace` 非法）。

`extractName(key)`：

1. 若 key 以 `sub_part.` 开头：取 `sub_part.` 之后的部分；若其中还有 `.`，取**第一个点之后**的整段作为名称段（例如 `sub_part.old.chassis` → `chassis`；`sub_part.chassis` → `chassis`）；没有点则整段作为名称段；
2. 否则整串作为名称段（例如 `chassis`、`default`）。

`isValidNameSegment(name)` 与 §5.1.3 完全一致：非空、长度 1–128、`^[A-Za-z0-9_.-]+$`、不以 `.` 开头/结尾。因此以下全部走 `legacy_<n>`：

| 输入 key | 结果 | 原因 |
|---|---|---|
| `default` | `sub_part.<ns>.main` | 旧 `either` 简写，不是合法子零件名 |
| `main` | `sub_part.<ns>.main` | 裸名称补前缀 |
| `.main` | `sub_part.<ns>.legacy_1` | 名称段以 `.` 开头 |
| `main.` | `sub_part.<ns>.legacy_2` | 名称段以 `.` 结尾 |
| `chassis!` | `sub_part.<ns>.legacy_3` | `!` 不在 `[A-Za-z0-9_.-]` |
| `底盘` | `sub_part.<ns>.legacy_4` | 非 ASCII（D17） |
| 129 个 ASCII 字符 | `sub_part.<ns>.legacy_5` | 长度 > 128 |
| `sub_part.old.chassis` | `sub_part.<ns>.chassis` | 跨 namespace，名称段保留 |
| `sub_part.<ns>.chassis` | 原样 | 已规范 |
| `sub_part.<ns>.default` | 原样 | 已经是规范形态；`default` 只在**裸 key** 时视为简写 |
| `main` 与 `sub_part.<ns>.main` 同时存在 | 后者保留，前者 → `sub_part.<ns>.main_2` | 第一遍已把规范 key 放进 `usedKeys` |

`nextLegacyName(usedNames)`：从 `legacy_1` 开始递增，跳过 `usedNames` 中已有的名称；`uniqueSubPartKey(candidate, usedKeys)` 对碰撞追加 `_2`、`_3`…，若追加后超过 128 字符则**截短名称段到 128 − 前缀长度 − 后缀长度**，再去除末尾 `.`；仍为空则改用下一个 `legacy_<n>`。`usedKeys` / `usedNames` 在每次迁移后同步追加，保证同一变体内不产生重复。

**namespace**：`ns = isValidNamespace(config.namespace) ? config.namespace : 'machine_max'`；发生回退时记录 `reason: 'namespace_fallback'`，`config.namespace` 本身不改（导出闸门按 `key_reserved` 拦截）。

> 改写会改变翻译键与模组侧可见名称。中文名（如 `底盘`）迁移后变成 `legacy_1`，用户需要按迁移报告手动改成英文名（D17：key 不允许中文）。`_lastMigration` 逐条列出 old→new，P2 在加载后弹出一次确认列表；迁移前备份。风险见 §16。

### 15.2 其它归一化

| 问题 | 处理 |
|---|---|
| 单变体 / 单子零件简写 | raw 或 decode 阶段归一化为 map；单子零件落到 `sub_part.<ns>.main`（不是 `default`） |
| `sub_parts` 里因 `either` 产生的裸 `default` key | 同上改写为 `sub_part.<ns>.main` |
| 缺失 `hit_boxes` / `connectors` 等容器 | 补空 map（不改语义） |
| `subsystems[*].definition === null` / `power_output: null` / `connector: null` / `locator: null` | **归一到 `''`**（required 字段；`definition` 对所有类型，`power_output/connector` 仅 required 类型）；optional `locator` 直接删除，让 `.default('')` 生效 |
| `subsystems[*].definition === "null"`（字符串） | raw 阶段转 `''`，避免被当成合法资源地址 |
| `subsystems[*].regen_loader.projectile_types === []` | raw 阶段转 `{}`；空 map 由 `minProperties` 闸门拦截 |
| `connector` marker 的 `config_ref` 存着 definition | 统一为连接点 key；按 §15.2.1 的定序匹配，匹配不到保留 `legacy_config_ref` + `config_ref:null` 并记 warning，不猜测 |
| `_uuid` / `_marker_uuid` 缺失或失效 | 按骨骼名 / Locator 名重建 |
| 悬空 marker | `cleanGhostMarkers`（已有） |
| 孤儿子零件（无标记） | **不再在渲染期删除**；改为 `loadConfig` 报告 + 面板「创建配置」按钮 |
| 5 个 WIP 子系统实例（`battery`/`signal_convert`/`joint`/`javascript`/`ammo_loader`） | **raw 阶段**从 JSON 剔除对应条目，记入 `_lastMigration.removed`，备份保留；不提供兼容层。必须在 decode 前完成 |
| 连接点/子系统/交互区的非 ASCII key | 不改名，记 `key_reserved`（导出期 error），由用户手动重建/重命名；子零件之外不做自动迁移 |
| 零件 / 变体 / 纹理 / 频道名 / `projectile_types` 的非 ASCII key，或非小写 `partId` | **不自动改名**（`partId` 会牵动文件名、resource location 与存档），记 `key_reserved`（导出期 error），由用户手动重建 |
| `partId` 为 `.` / `..` / 首尾点 / Windows 设备名 | **不自动改名**；记 `key_reserved`（导出期 error），提示用户重建；导出管线另有 `isSafePartId` 断言（§5.1.3） |
| key 含 `*`（任意 map），或翻译键含 `/` `~` | 记 `key_reserved`，导出期 error；不自动改写；`hit_boxes` / `hydrodynamics` 的元素名不受 `/` `~` 限制 |
| `config.namespace` 非法 | 不自动改；子零件 key 迁移用 `machine_max` 兜底并记录 `namespace_fallback`；导出期 error |

#### 15.2.1 connector marker 的 `config_ref` 迁移

目标：把 `marker.config_ref` 从 `definition`（资源地址）改成连接点 key；幂等，重复加载不改变已迁移结果。

输入：`part.element_markers[variant]` 与 `variant.sub_parts[*].connectors[*]`。按以下顺序匹配，**任一环节唯一命中即停止**：

1. **已经是 key**：`config_ref` 是字符串，且等于某个 `sub_parts[*].connectors` 的 key（在同变体内唯一）→ 保留，不改。
2. **`_marker_uuid` 精确匹配**：`connector._marker_uuid === markerUuid` 的条目恰好一个 → 取该条目的 key。`_marker_uuid` 是 `markConnector` / `bone_resolver` 写入的 Locator UUID，优先级最高。
3. **Locator 名全局唯一**：用 `ports.bones.findNameByUuid(markerUuid)` 取 marker 元素的 Locator 名；`connector.locator === 该名` 的条目恰好一个（跨全部子零件）→ 取该 key。
4. **所属子零件内唯一**：第 3 步命中多个时，用 `detectOwnerSubPart(config, partId, variantName, locatorElement)` 找最近的祖先 `sub_part` marker，得到 `spKey`；再按 `connector.locator === 名 && 所属 spKey` 过滤。恰好一个 → 取该 key。
5. **仍未唯一**：不猜。把旧值保存到 `marker.legacy_config_ref`，`marker.config_ref = null`，在 `_lastMigration.marker_refs` 记
   `{ partId, variantName, uuid, reason: 'connector_not_found' | 'ambiguous_connector', legacy_config_ref }`，
   并产生 warning `unresolved_config_ref`。marker 保留，不删除；`cleanGhostMarkers` 只按元素 UUID 判断幽灵，不会因为 `config_ref:null` 删它。
6. **成功写回**：`marker.config_ref = connKey`；若该 connector 的 `_marker_uuid` 缺失，补成 `markerUuid`。一个 connector 最多对应一个 marker，反向也最多一个 key。

**`definition` 不参与匹配**：同一个 definition 可以被多个 connector 共用（不同 Locator），按 definition 找条目必然多解；它只作为第 5 步的 `legacy_config_ref` 保留。也**不允许**“取第一个匹配”或“按数组顺序猜”。

测试：两个 connector 共用同一 `definition`、分别挂在两个 Locator 上，各自 marker 必须迁到自己的 key；删掉其中一个 Locator 后加载，另一个仍正确，缺失的那个走 `legacy_config_ref` + warning；同名 Locator 跨两个子零件且 `_marker_uuid` 缺失时，用祖先子零件唯一化，祖先也缺失则 warning（§11 #19）。

---

## 16. 风险与回滚

| 风险 | 对策 |
|---|---|
| 子零件 key 迁移改变模组侧可见名称（存档/引用可能按名匹配） | 仅迁移非规范 key；中文名改 `legacy_<n>` 并在迁移报告中保留原名；`_lastMigration` 明细 + 加载后确认；迁移前自动生成一份 `.mm_project.json.bak`（`services/pack` 提供） |
| 删除 WIP 类型后，含这些类型的存量工程在 decode 时失败 | §15 的 **A 段 raw 剔除** + 备份；若必须保留这些数据，只能停留在旧插件版本（D18 明确不做兼容层） |
| 旧哨兵 `part`/`subpart`/`vehicle` 变成未知目标错误 | D19 的明确选择：不告警、不迁移；导出闸门拦住，用户改成 `local`/`global` 或真实节点 key |
| 严格配置引用会拒绝手工写的悬空目标 | `errors[]` 带完整 path 与候选值；`mode:'replace'` 可先修引用再导入；MCP 返回 `unresolved_config_ref` 提示 |
| 删除计算属性写入后，存量「标记有、配置无」不再自动补建 | §15 的 load-time repair + 面板显式按钮 + `setField` 的 `ensure` |
| 整件替换丢字段 | `reset_fields` / `dropped_fields` 回传 + 工具描述明示 |
| 导出闸门改变现有行为（从「总是成功」到「被拦」） | P3 单独 commit；先跑一次全量校验看现有工程有多少 error |
| 批量导入撤销粒度回退 | 冲突决策提前到开记录前（修 `drag_import` 既有缺陷） |
| 端口未注入（早于 `plugin.js onload`） | 端口默认空实现 + `assertPorts()` 在 ops 入口做一次软检查 |
| required 空串/空 map 在导出时仍是 `''`/`{}`，若绕过 `canExport` 直接调 generator，会产出空 required 值（`definition:''` 不是合法 ResourceLocation） | 导出只有一个入口 `services/export.js`；generator 不在 `ui/menu` 直接调用；P3 验收里加「直接调用 generator 的测试必须失败」 |
| required map `emitEmpty` 让输出从「省略」变成 `{}`，可能与旧内容包逐字节不同 | 语义等价（schema required）；P3 用「旧工程导出 → 再导入 → 再导出」做 round-trip 对比，不要求与旧版本逐字节一致 |
| `power_outputs` 的 key 清理/改名新增引用面 | 先补测试（删除/重命名 transmission 的目标），再改 `refs`；第 13 行单独 review |
| 整件替换先清 marker，后续写入异常导致 marker 丢失 | 所有校验 / 引用解析在 `runConfigEdit` 之前完成；`clearScope` + 节点写入 + `set(plan)` 同步执行，异常由 `runConfigEdit` 的快照回滚一起恢复 |
| connector marker 迁移多解产生大量 warning | `_lastMigration.marker_refs` 按 `(partId, variantName, uuid)` 去重，加载后汇总一次 toast；warning 不阻塞加载 |
| 存量不安全 `partId` 被 `key_reserved` 阻断导出 | 不静默改名；导出前给出明确 path 与 hint，用户重建零件；`isSafePartId` 在导出管线二次断言，避免绕过闸门写文件 |
| 子零件 key 迁移在 128 字符边界截短，可能产生新的碰撞 | `uniqueSubPartKey` 截短后再查 `used`；迁移报告记录 `reason:'collision'`，加载后一次性确认 |
| 第三轮新增的 `validateTree` 与 `collectIssues` 重复报同一问题 | 统一 `Problem.path.field` 后按 **scope / partId / variantName / subPartKey / itemKey / field** 去重（§4.3），不再按 `path + code`；P3 测试断言 `definition:''` 只出一条 |
| P2/P3 交叉改动同一批文件 | P2 只碰「写配置」，P3 只碰「副作用」 |

---

## 17. 参考资料

- 撤销：[docs/11](./11-接入Blockbench原生撤销.md) · MCP：[docs/12](./12-MCP工具接入.md)
- Codec：[docs/08](./08-序列化反序列化-Codec体系重构.md) / [src/codec/AGENTS.md](../src/codec/AGENTS.md)
- 校验：[docs/10](./10-校验与错误提示重构实现计划.md) / [src/mode/validation.js](../src/mode/validation.js)
- 上游 schema：`../../Machine-Max/src/main/resources/spark_modules/machine_max.builtin/machine_max/docs/zh_cn/schemas/`
- 现有整件通道：[src/import/drag_import.js](../src/import/drag_import.js) + [src/import/bone_resolver.js](../src/import/bone_resolver.js)
- 模组侧信号解析：[ISignalSender.java](../../Machine-Max/src/main/java/io/github/sweetzonzi/machine_max/common/mech/signal/ISignalSender.java)（`local` / `global` 的唯一依据）
