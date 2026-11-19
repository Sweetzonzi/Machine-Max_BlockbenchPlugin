# AGENTS.md — src/core/（数据模型层）

## 概览

配置工厂、版本迁移、元素标记类型系统和内容包 I/O。所有目录都依赖此层——它是数据模型基础。

## 结构

```
src/core/
├── config.js              # 工厂函数 + 迁移引擎 + 旧占位归一化（433行）
├── config_defaults.js     # @deprecated 默认值快照（88行，无引用）
├── content_pack.js        # 内容包目录 I/O：meta.json + 定义文件读取（548行）
├── content_pack_manager.js # 内置包 + 依赖包 + 当前包的合并视图（只读）
├── builtin_lang.js        # 内置包 lang 词条只读视图（构建注入 __BUILTIN_LANG__）
├── element_markers.js     # 标记类型系统 + clearMarkerScope + 迁移 + 缺失配置修复（约990行）
└── undo.js                # 撤销桥 + runConfigEdit + mm_config_changed（约640行）
```

## 查找指引

| 任务 | 文件 | 说明 |
|------|------|------|
| 创建新配置对象 | `config.js` | `createPartConfig()`, `createVariantConfig()`, `createSubPartConfig()` 等；`createHitBoxConfig()` 用 `HitBoxCodec.decode` 作为默认值唯一真源 |
| 定义新字段默认值 | `src/codec/codecs/*` | 默认值以 Codec 为准；`config_defaults.js` 仅作历史快照，**不要**再新增默认值 |
| 处理配置版本迁移 | `config.js` → `MIGRATIONS` 对象 | 按版本号键值存储；`migrateIfNeeded()` 循环补齐间隙 |
| 归一化旧工程占位 | `config.js` → `normalizeLegacyPlaceholders()` | required 字符串 `null`/`"null"` → `''`，map `null`/`[]` → `{}`；`migrateIfNeeded()` 在 decode 前调用 |
| 归一化单个零件（导入用） | `config.js` → `normalizePartConfig(part)` | 与项目加载同一套归一化；退役枚举 `block_collision: "ground_hard"` 折成 `ground` + `climb_assist: true`。`services/import_plan.js` 在 `PartCodec.decode` 前调用 |
| 修复缺失的标记配置 | `element_markers.js` → `repairMarkerConfigs()` | `loadConfig` 调用一次：补 sub_parts / hit_boxes / interact_boxes / connectors，幂等；渲染期不再补 |
| 添加新标记类型 | `element_markers.js` → `MARKER_TYPES` | 添加 `{ label, icon, color }` 条目；更新 `getMarkerTypesForElement()` |
| 重算自动排除骨骼 | `element_markers.js` → `recalcAutoEndBones()` | 子零件标记起始骨骼变更时调用 |
| 整件替换清 marker | `element_markers.js` → `clearMarkerScope(cleanup)` | `part` / `variant` 清字典，`sub_part` 按 `uuids` 或 `config_refs` 精确删；不做下游配置清理 |
| 迁移 connector marker | `element_markers.js` → `migrateConnectorMarkerRefs()` | `config_ref` 从 definition → 连接点 key（§15.2.1），幂等 |
| 读取内容包定义 | `content_pack.js` | `readAllDefs()`, `listDefIds()`, `defExists()` — 按类目分别处理 parts/subsystems/connectors/materials；定义文件由作者直接编辑 JSON（writeDef/deleteDef 已随只读化重构删除） |
| 解析内容包命名空间 | `content_pack.js` | `listNamespaces(packPath)` 列出一级内容目录；`openContentPack()` 返回 `{ namespace（主命名空间）, namespaces[] }`。命名空间由包内目录决定，与 `meta.id` 无关（`machine_max:m1a2_sep` + `m1a2_sep/` 合法） |
| 管理内容包 meta.json | `content_pack.js` | `openContentPack()`, `createContentPack(dirPath, meta, { namespace })`（命名空间在 mkdir 前校验，省略时取 id 后缀）, `readPackMeta()`, `writePackMeta()`, `pickExportNamespace(packPath, configured)`（导出目录用）, `defaultExportNamespace(id)` |
| 内容包合并视图 | `content_pack_manager.js` | 合并内置包 + 依赖包 + 当前包的定义列表，标注可编辑性；每层用 `readAllDefsByNamespace()` 读取该包的全部命名空间（键带 `{ns}:` 前缀）；缓存按「当前包路径 + 依赖路径」指纹自动失效，同一路径下改写磁盘定义需显式 `invalidateCache()` |
| **新增一个业务动作（带撤销）** | `src/ops/` | 写 `createXxx/deleteXxx/markXxx`：校验前置 → `runConfigEdit(label, ...)` → 返回 `OpResult`；UI 只调用它 |
| 让字段编辑可撤销 | `src/ops/field.js` | 统一 `ops.setField`；`runConfigEdit` 默认 `coalesce:false`，UI 连续数值编辑显式开 |
| 排查撤销不生效 | `src/ops/` / `undo.js` | 确认动作走的是操作函数而不是裸 `$set`；确认 `registerUndoBridge()` 已调用、`Undo` 是 `Blockbench.Project?.undo` |

## 约定

- **深拷贝**: `JSON.parse(JSON.stringify(DEFAULTS))` — 用于 10+ 工厂函数。仅对 POJO 安全（无 Date、RegExp、Map、Set、undefined）
- **CONFIG_VERSION 唯一真源**: `src/core/constants.js`
- **默认值唯一真源**: 各自 Codec 的 `.default(...)`；工厂用 `Codec.decode` 填充
- **标记存储**: 按 `(partId, variantName)` 存储在 `part.element_markers[variantName][elementUuid]`
- **工厂签名**: `createXConfig(config, parentId)` 返回填充了默认值的新对象——绝不修改输入
- **ensureDefaults**: 通过 `Object.assign({}, blank, config)` 合并缺失字段——在每次读取配置前调用；每个零件用 `opts.decodePart` 解码（默认 `PartLoadCodec`，`utils/persistence.js` 传 `doc/load.js` 的宽容解码）。解码仍抛错时保留原始零件，不让读盘失败。
- **命名空间以包内目录为准**: 内容包可以有一个或多个命名空间目录（`{ns}/{type}/...`），与 `meta.id` 无关；`openContentPack().namespace` 只是新建内容的主命名空间，`namespaces[]` 才是全集。`loadConfig` 的 `healNamespace` 在值与包内目录不符时按目录纠正一次，不改作者选的合法值。
- **三类名字的唯一性按 Part 判**: 子系统 / 连接点 / 交互区的 key 在**单变体内唯一**（跨全部子零件，且共用一套命名空间）。`naming.findNamedEntry(variant, name, {subPartKey, excludeKey})` 是唯一实现（返回 `{subPartKey, kind, key}`），`validateNameUniqueness` / `ensureUniqueName` 与 ops 的新增、导入、改名都走它。违反该约束时上游解码抛 `PackContentException`，整份零件定义在双端消失（docs/13 §5.4、D34）。
- **新建实体的键默认命名空间是 `machine_max`**: `naming.DEFAULT_NAMESPACE`（四类实体一致），与 `config.namespace`（导出命名空间，决定导出目录与图标地址）分开；作者的键名可改成导出命名空间或依赖包的命名空间，候选来自 `content_pack_manager.namespaceCandidates()`（docs/13 D32）。
- **子系统类型退役**: 上游退役类型（如 `regen_loader`）后，把 id 加进 `subsystem_types.js` 的 `RETIRED_TYPES`（旧名 / 原因 / 替代类型）。工程里遗留的条目由加载链路整条保留、由 `collectIssues` 报 `subsystem_type_unknown`；不登记就只能按「未知类型」提示（docs/13 §15.3）。
- **归一化只碰空占位**: `normalizeLegacyPlaceholders` 把 `null` / `"null"` / 空数组当「未配置」；有内容的坏形状原样留着，由校验报错。悄悄改成 `{}` 等于删作者的数据（docs/13 §15.4）。

## Vue 2 响应式说明

`element_markers.js` 中的函数对 config 对象使用直接属性赋值（`obj.prop = val`、`delete obj.prop`）。这些在 Vue 2 中理论上是非响应式的；`loadConfig.repairMarkerConfigs` 在面板挂载前执行，之后由 `runConfigEdit` 派发的 `mm_config_changed` 触发 `refreshOutlinerIcons()` + `markerVersion.v++`。本模块属于 core/ 层，不应依赖 Vue，因此保留直接赋值模式。

## 反模式

- **不要在 `src/core/constants.js` 之外定义 `CONFIG_VERSION`**
- **`instanceof` 检查**（`element instanceof Group`）依赖 Blockbench 的类继承——若 Blockbench 改动继承关系则脆弱
- **`migrateIfNeeded` 无错误处理** — 若迁移抛出异常，配置将处于部分迁移状态
