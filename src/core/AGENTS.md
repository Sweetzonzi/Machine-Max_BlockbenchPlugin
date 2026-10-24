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
| 修复缺失的标记配置 | `element_markers.js` → `repairMarkerConfigs()` | `loadConfig` 调用一次：补 sub_parts / hit_boxes / interact_boxes / connectors，幂等；渲染期不再补 |
| 添加新标记类型 | `element_markers.js` → `MARKER_TYPES` | 添加 `{ label, icon, color }` 条目；更新 `getMarkerTypesForElement()` |
| 重算自动排除骨骼 | `element_markers.js` → `recalcAutoEndBones()` | 子零件标记起始骨骼变更时调用 |
| 整件替换清 marker | `element_markers.js` → `clearMarkerScope(cleanup)` | `part` / `variant` 清字典，`sub_part` 按 `uuids` 或 `config_refs` 精确删；不做下游配置清理 |
| 迁移 connector marker | `element_markers.js` → `migrateConnectorMarkerRefs()` | `config_ref` 从 definition → 连接点 key（§15.2.1），幂等 |
| 读取内容包定义 | `content_pack.js` | `readAllDefs()`, `listDefIds()`, `defExists()` — 按类目分别处理 parts/subsystems/connectors/materials；定义文件由作者直接编辑 JSON（writeDef/deleteDef 已随只读化重构删除） |
| 管理内容包 meta.json | `content_pack.js` | `openContentPack()`, `createContentPack()`, `readPackMeta()`, `writePackMeta()` |
| 内容包合并视图 | `content_pack_manager.js` | 合并内置包 + 依赖包 + 当前包的定义列表，标注可编辑性；缓存按「当前包路径 + 依赖路径」指纹自动失效，同一路径下改写磁盘定义需显式 `invalidateCache()` |
| **新增一个业务动作（带撤销）** | `src/ops/` | 写 `createXxx/deleteXxx/markXxx`：校验前置 → `runConfigEdit(label, ...)` → 返回 `OpResult`；UI 只调用它 |
| 让字段编辑可撤销 | `src/ops/field.js` | 统一 `ops.setField`；`runConfigEdit` 默认 `coalesce:false`，UI 连续数值编辑显式开 |
| 排查撤销不生效 | `src/ops/` / `undo.js` | 确认动作走的是操作函数而不是裸 `$set`；确认 `registerUndoBridge()` 已调用、`Undo` 是 `Blockbench.Project?.undo` |

## 约定

- **深拷贝**: `JSON.parse(JSON.stringify(DEFAULTS))` — 用于 10+ 工厂函数。仅对 POJO 安全（无 Date、RegExp、Map、Set、undefined）
- **CONFIG_VERSION 唯一真源**: `src/core/constants.js`
- **默认值唯一真源**: 各自 Codec 的 `.default(...)`；工厂用 `Codec.decode` 填充
- **标记存储**: 按 `(partId, variantName)` 存储在 `part.element_markers[variantName][elementUuid]`
- **工厂签名**: `createXConfig(config, parentId)` 返回填充了默认值的新对象——绝不修改输入
- **ensureDefaults**: 通过 `Object.assign({}, blank, config)` 合并缺失字段——在每次读取配置前调用

## Vue 2 响应式说明

`element_markers.js` 中的函数对 config 对象使用直接属性赋值（`obj.prop = val`、`delete obj.prop`）。这些在 Vue 2 中理论上是非响应式的；`loadConfig.repairMarkerConfigs` 在面板挂载前执行，之后由 `runConfigEdit` 派发的 `mm_config_changed` 触发 `refreshOutlinerIcons()` + `markerVersion.v++`。本模块属于 core/ 层，不应依赖 Vue，因此保留直接赋值模式。

## 反模式

- **不要在 `src/core/constants.js` 之外定义 `CONFIG_VERSION`**
- **`instanceof` 检查**（`element instanceof Group`）依赖 Blockbench 的类继承——若 Blockbench 改动继承关系则脆弱
- **`migrateIfNeeded` 无错误处理** — 若迁移抛出异常，配置将处于部分迁移状态
