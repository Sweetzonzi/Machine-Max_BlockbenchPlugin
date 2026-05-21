# AGENTS.md — src/core/（数据模型层）

## 概览

配置工厂、版本迁移、元素标记类型系统和内容包 I/O。所有目录都依赖此层——它是数据模型基础。

## 结构

```
src/core/
├── config.js              # 工厂函数 + 迁移引擎（273行）
├── config_defaults.js     # 所有默认值、CONFIG_VERSION、预设（410行，纯数据）
├── content_pack.js        # 内容包目录 I/O：meta.json + 定义文件 CRUD（548行）
└── element_markers.js     # 标记类型系统（sub_part, hit_box, connector 等）（301行）
```

## 查找指引

| 任务 | 文件 | 说明 |
|------|------|------|
| 创建新配置对象 | `config.js` | `createPartConfig()`, `createVariantConfig()`, `createSubPartConfig()` 等 |
| 定义新字段默认值 | `config_defaults.js` | `PART_DEFAULTS`, `VARIANT_DEFAULTS` 等 — 工厂中使用 `JSON.parse(JSON.stringify(...))` |
| 处理配置版本迁移 | `config.js` → `MIGRATIONS` 对象 | 按版本号键值存储；`migrateIfNeeded()` 循环补齐间隙 |
| 添加新标记类型 | `element_markers.js` → `MARKER_TYPES` | 添加 `{ label, icon, color }` 条目；更新 `getMarkerTypesForElement()` |
| 重算自动排除骨骼 | `element_markers.js` → `recalcAutoEndBones()` | 子零件标记起始骨骼变更时调用 |
| 读写内容包定义文件 | `content_pack.js` | `readDef()`, `writeDef()`, `deleteDef()` — 按类目分别处理 parts/subsystems/connectors/materials |
| 管理内容包 meta.json | `content_pack.js` | `openContentPack()`, `createContentPack()`, `readMeta()`, `writeMeta()` |
| 内容包合并视图 | `content_pack_manager.js` | 合并内置包 + 依赖包 + 当前包的定义列表，标注可编辑性 |

## 约定

- **深拷贝**: `JSON.parse(JSON.stringify(DEFAULTS))` — 用于 10+ 工厂函数。仅对 POJO 安全（无 Date、RegExp、Map、Set、undefined）
- **CONFIG_VERSION 唯一真源**: `config_defaults.js:1`
- **标记存储**: 按 `(partId, variantName)` 存储在 `part.element_markers[variantName][elementUuid]`
- **工厂签名**: `createXConfig(config, parentId)` 返回填充了默认值的新对象——绝不修改输入
- **ensureDefaults**: 通过 `Object.assign({}, blank, config)` 合并缺失字段——在每次读取配置前调用

## Vue 2 响应式说明

`element_markers.js` 中的函数对 config 对象使用直接属性赋值（`obj.prop = val`、`delete obj.prop`）。这些在 Vue 2 中理论上是非响应式的，但调用链（mode.js/App.vue.js）会在标记操作后立即调用 `saveConfig()` + `refreshOutlinerIcons()` 强制 UI 刷新。本模块属于 core/ 层，不应依赖 Vue，因此保留直接赋值模式。

## 反模式

- **不要在 `config_defaults.js` 之外定义 `CONFIG_VERSION`**
- **`instanceof` 检查**（`element instanceof Group`）依赖 Blockbench 的类继承——若 Blockbench 改动继承关系则脆弱
- **`migrateIfNeeded` 无错误处理** — 若迁移抛出异常，配置将处于部分迁移状态
