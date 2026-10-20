# 插件全面接入 Blockbench 原生撤销（Native Undo Integration）

> 状态：**已实现（阶段 1 + 阶段 2 完成，阶段 3 部分完成）** · 设计日期：2026-10-20 · 实现日期：2026-10-20 · 范围：`src/` 前端插件（不含主模组 MachineMax）
> 目标版本：v0.5.0 · 参照：[docs/06-技术实现笔记.md](./06-技术实现笔记.md) / [docs/10-校验与错误提示重构实现计划.md](./10-校验与错误提示重构实现计划.md) / [docs/12-MCP工具接入.md](./12-MCP工具接入.md)
>
> 实现落点：`src/core/undo.js`（撤销桥 + 统一编辑入口），`src/plugin.js` 注册/注销，
> 各变更入口见 §4。与设计稿的差异见 §10。
>
> **P2 更新（2026-10-21）**：领域操作层已从 `src/core/operations.js` 拆到 `src/ops/*`
> （29 个动作，`ops/index.js` 聚合）；字段编辑统一走 `ops.setField`，面板只 emit
> `field-change`。本文 §4/§10 中的 `core/operations.js` 路径为历史记录，当前实现以
> [docs/13](./13-业务逻辑层与配置文档API.md) 与 [src/ops/AGENTS.md](../src/ops/AGENTS.md) 为准。

---

## 1. 背景与目标

### 1.1 事实（实现前的状态）

> 下面记录的是接入前的事实，用于说明问题严重性；实现后 `grep -rn "Undo\." src/`
> 已命中 `src/core/undo.js` 及各入口的包装调用。

插件对 `Project.machine_max_plugin` 的每一次变更都不进入 Blockbench 的撤销栈：

- 全仓 `grep -rn "Undo\." src/` 无命中，插件不调用 `Undo.initEdit` / `Undo.finishEdit` / `Undo.cancelEdit` 中的任何一个。
- 配置变更的落点只有 `saveConfig()`（16 处调用，见 §4），它把 `Project.machine_max_plugin` 写进 `.bbmodel` 与侧载的 `.mm_project.json`，不触碰撤销栈。

后果：在面板和右键菜单里删掉一个 sub_part、一个连接点或一批子系统实例，无法 `Ctrl+Z` 退回；导入零件、批量绑定标记同理。用户唯一的退路是关闭不保存，或从备份文件恢复。

### 1.2 目标

1. **`Project.machine_max_plugin` 的每一次结构性变更都成为一条 Blockbench 原生撤销记录**，与元素、组、贴图编辑共用同一个 `Undo.history`。
2. 撤销/重做的入口完全是原生的：`Ctrl+Z`、`Ctrl+Y`、编辑菜单、Blockbench 的撤销历史 UI；插件不提供自绘的回退控件。
3. 撤销后面板、Outliner 图标、原生问题清单三处显示同步刷新。
4. 导出的 JSON、`.bbmodel` 内的配置结构、与主模组 `PartType.CODEC` 的契约**保持不变**。

### 1.3 非目标

- 不做跨会话撤销（Blockbench 的 `Undo.history` 是内存态，重启即清空）。
- 不做"事务日志"文件，不往内容包里写任何历史数据。
- 不接管 Blockbench 自身的元素/贴图/动画撤销语义。

---

## 2. Blockbench 撤销模型（源码依据）

本地参考源码：`D:\Files\Project_MinecraftMods\blockbench`（v5.1.4）；运行中的桌面端是 5.0.7，两版在本文涉及的字段与事件上一致——§3 的接入点在运行中的 5.0.7 上已用 MCP 插件的 `risky_eval` 反查验证（`Undo.initEdit` / `Undo.finishEdit` 的函数体、`MCP.runUndoableEdit` 的包装、`Undo` 实例的属性表）。

上游对应文件：[js/undo.js](https://github.com/JannisX11/blockbench/blob/master/js/undo.js)。

### 2.1 一次编辑的生命周期

`Undo` 是 `UndoSystem` 的实例（[js/undo.js](https://github.com/JannisX11/blockbench/blob/master/js/undo.js)）：

```
Undo.initEdit(aspects)                 # current_save = new UndoSystem.save(aspects)；派发 init_edit
  ↓  （调用方就地修改模型 / 配置）
Undo.finishEdit(message, aspects)      # post = new UndoSystem.save(aspects)
                                       # entry = { before, post, action, type:'edit', time }
                                       # history.push(entry)；截断 redo 尾；index = history.length
                                       # Project.saved = false（除非 aspects.keep_saved）
                                       # 派发 finish_edit → finished_edit
Undo.undo() / Undo.redo()              # 取 entry.before / entry.post 调用 load()
                                       # load() 末尾派发 load_undo_save
```

要点：

- `initEdit` 会把**新的** `current_save` 直接赋给 `Undo.current_save`，覆盖上一个未完成编辑的快照。同一时刻只允许一个进行中的编辑。
- `finishEdit` 在 `aspects.keep_saved` 缺失时把 `Project.saved` 置 `false`，即撤销记录本身就表达了"工程已修改"，无需额外调用 `saveConfig()` 制造脏标记。
- 历史上限来自 `settings.undo_limit`，超出后 `history.shift()` 丢弃最老记录并把 `index` 归位。
- `cancelEdit()` 用 `current_save` 与当前状态做一次 `loadSave` 回滚，然后丢弃 `current_save`。

### 2.2 快照只认固定的 aspect 键

`UndoSystem.save.fromState(aspects)`（[undo.js](https://github.com/JannisX11/blockbench/blob/master/js/undo.js) 的 `UndoSystem.save`）只处理下列键，其余键被静默忽略：

| aspect 键 | 快照内容 |
|---|---|
| `elements` | 每个元素 `getUndoCopy()` |
| `outliner` | `Outliner.toJSON()` |
| `groups` / `group` | 组的无子节点副本 |
| `collections` | 集合 |
| `textures`（可带 `bitmap` 子标志） | 贴图 |
| `texture_groups` | 贴图组 |
| `layers`（可带 `bitmap`） | 图层 |
| `texture_order` / `selected_texture` | 贴图顺序与选中项 |
| `settings` | 设置快照 |
| `uv_mode` | `box_uv` + 贴图宽高 |
| `animations` / `keyframes` / `animation_controllers` / `animation_controller_state` | 动画相关 |
| `display_slots` | 展示槽位 |
| `exploded_view` | 爆炸视图开关 |

`selection` 不在 `save` 里，由 `initEdit` 单独建 `current_selection_save`，`finishEdit` 时按需附加到 entry。

**结论：没有任何一个 aspect 键覆盖 `Project.machine_max_plugin`。** 只调 `Undo.initEdit({})` 再改配置，撤销时 Blockbench 会恢复一堆不相关的东西而配置原样不动——这是一条静默失效的路径，必须在设计上绕开。

### 2.3 官方扩展点：`create_undo_save` / `load_undo_save`

| 事件 | 触发点 | 载荷 | 用途 |
|---|---|---|---|
| `create_undo_save` | `fromState()` 末尾 | `{ save, aspects }` | 往 `save` 对象上挂自定义数据 |
| `load_undo_save` | `load()` 末尾，内置 aspect 全部恢复之后 | `{ save, reference, mode }` | 把自定义数据写回运行态 |

`save` 是普通对象（`UndoSystem.save` 的实例），挂任意自有键都合法；entry 里的 `before` / `post` 都按同一套 `fromState` 生成，因此撤销和重做两侧的数据对称。这套事件是 Blockbench 给插件自定义可撤销数据的正规通道。

### 2.4 序列化约束

entry 需要能被 `EditSession` 的 `remoteEdit` 路径 JSON 化，因此挂在 `save` 上的自定义数据必须是**纯数据**（无函数、无循环引用、无 `undefined`）。配置树天然满足。

---

## 3. 设计

### 3.1 自定义 aspect 标志

插件统一使用一个自有标志位承载"这条记录要连配置一起快照"的语义：

```js
{ machine_max: true }
```

`fromState` 不认识这个键，直接跳过；它只作为我方可撤销操作的标记，也作为 `load_undo_save` 侧的判别依据。

### 3.2 快照键与内容

```js
const ASPECT_FLAG = 'machine_max';
const SNAPSHOT_KEY = 'machine_max_plugin_snapshot';
```

快照内容是最小必要集：

```js
{
  project_uuid: Project.uuid,          // 防跨项目误恢复
  config: structuredClone(configWithoutUiState(Project.machine_max_plugin))
}
```

- `_uiState`（`activeMode` / `activePartId` / `activeVariantName`）**不进快照**。它是"我正在看什么"，不是工程内容；撤销一次字段修改不应该把用户的选中项也改掉。
- `contentPackPath` / `dependencyPaths` / `packMeta` / `modelFile` 进快照：它们属于工程内容，改错同样需要能撤回。
- 深拷贝用 `structuredClone`，降级用 `JSON.parse(JSON.stringify(...))`（配置是纯数据，两条路径等价）。

### 3.3 快照策略：整块深拷贝，不做字段级 diff

| 方案 | 优点 | 缺点 | 取舍 |
|---|---|---|---|
| 整块快照 `parts` 整棵树 | 实现简单；删除父节点连带子节点天然正确；无"哪次改动属于哪条记录"的判断负担 | 单条记录体积与零件定义规模成正比 | **采用** |
| 字段级 diff（按 path 记录 before/after） | 记录小 | 每个写入口都要声明自己动了哪些路径，漏一处就产生不可撤销的操作；跨节点引用清理（marker、signal_targets）难以表达 | 不采用 |

体积量级：`parts` 树是纯 JSON 定义（示例工程 1521 个 cube 对应 213 个组，配置本体在数十 KB 级）。设 2 MB 上限保护，超出时工具直接拒绝并提示（见 §6）。

### 3.4 撤销桥（`src/core/undo.js` · `registerUndoBridge`）

> 实现位置说明：设计稿原打算放在 `src/mcp/`，但撤销与 MCP 无关，且 MCP（docs/12）尚未实现，
> 因此落在 `core/` 层；docs/12 的工具只需 `require('../core/undo.js')` 复用。

```js
const ASPECT_FLAG = 'machine_max';
const SNAPSHOT_KEY = 'machine_max_plugin_snapshot';
const RESTORED_EVENT = 'mm_config_restored';

function registerUndoBridge() {
    if (_listeners.length > 0) return;                     // 幂等（热重载）
    _listeners.push(Blockbench.on('create_undo_save', onCreateUndoSave));
    _listeners.push(Blockbench.on('load_undo_save', onLoadUndoSave));
}

function onCreateUndoSave(data) {
    if (!data.aspects || !data.aspects[ASPECT_FLAG]) return;
    const snapshot = createSnapshot();                     // { project_uuid, config }，剔除 _uiState
    if (snapshot) data.save[SNAPSHOT_KEY] = snapshot;
}

function onLoadUndoSave(data) {
    const snapshot = data.save && data.save[SNAPSHOT_KEY];
    if (!snapshot) return;                                 // 原生记录 / 旧记录：跳过
    if (snapshot.project_uuid && Project.uuid && snapshot.project_uuid !== Project.uuid) return;
    _restoring = true;                                     // 恢复期间禁止开新编辑
    try {
        const live = Project[PROPERTY_NAME];
        const next = deepClone(snapshot.config);
        next._uiState = reconcileUiState(next, deepClone(live && live._uiState));  // 保留"我在看什么"
        applySnapshot(live, next);                         // 就地覆盖，保留对象引用
        refreshAfterRestore();
    } finally {
        _restoring = false;
    }
}
```

恢复后的收尾：

```js
function refreshAfterRestore() {
    require('../mode/icons.js').refreshOutlinerIcons();        // Outliner 图标
    require('./content_pack_manager.js').invalidateCache();    // 内容包路径/依赖可能被撤销
    Blockbench.dispatchEvent(RESTORED_EVENT, {});              // Vue 面板重新 loadConfigData()
    Blockbench.dispatchEvent('update_selection');              // 原生问题清单（Validator 触发器）
}
```

四步分工：图标由 `mode/icons.js` 重算；内容包合并视图缓存按路径短路，必须主动失效；
Vue 面板监听 `mm_config_restored` 后重新 `loadConfigData()` + `markerVersion.v++`；
原生问题清单靠 `update_selection`（`Validator.triggers` 包含该事件，5.0.7 的
`dispatchEvent` 末尾会调 `Validator.validate(event_name)`）。

两个设计取舍（与设计稿不同，见 §10）：

- **就地覆盖而非整体替换**：面板与已打开的对话框都持有配置对象引用，整体替换会让它们继续
  指向旧对象；就地给顶层键赋值同样走 Vue 响应式 setter。
- **恢复期间 `_restoring = true`**：`load_undo_save` 中触发的任何代码路径都不会再 `initEdit`。

### 3.5 撤销边界放在哪一层（`undo.js` + `operations.js`）

**原则：撤销边界跟着"业务动作"走，不跟着"对话框/按钮"走。**

```
UI 层（对话框 onConfirm / 菜单 click / 工具栏 click）
   └─ 只收集输入、调用操作、提示结果
领域操作层 src/core/operations.js
   └─ createPart / deletePart / createVariant / deleteVariant / createSubsystem /
      deleteSubsystem / markSubPart / markHitBox / markInteractBox / markConnector /
      clearElementMarker / setVariantTags / setContentPack / setContentPackPath /
      updatePackMeta / updateDependencyPaths
         └─ 每个函数内部 runConfigEdit(label, ...)：一条动作 = 一条撤销记录
组件字段方法层（App.vue.js / SubsystemPanel / ConnectorPanel）
   └─ wrapMethodMap 包装 updateXxxField 等字段提交方法（字段编辑没有"对话框"这一层）
批量场景（批量导入）
   └─ 外层 runConfigEdit 开一次，内层操作作为嵌套编辑并入
```

操作函数的形状（`src/core/operations.js`）：

```js
function createPart(config, options) {
    // 1) 先校验：失败直接返回，不进入撤销，不会产生空记录
    if (!partId) return fail('零件 ID 不能为空');
    if (config.parts[partId]) return fail('零件 "' + partId + '" 已存在');

    // 2) 真正改配置的边界在这里
    runConfigEdit('新建零件', function () {
        vueSet(config.parts, partId, createPartConfig(partId, variantName));
        if (model) vueSet(config.parts[partId].variants[variantName], 'model', model);
        _setUiState(config, { activePartId: partId, activeVariantName: variantName });
    });

    // 3) 返回结果，UI 决定怎么刷新/提示
    return ok({ partId: partId, variantName: variantName });
}
```

UI 侧因此只剩一行调用：

```js
onConfirm: function (formData) {
    var result = ops.createPart(config, formData);
    if (!result.ok) { showToast(result.error, 'error'); return false; }
    refreshOutlinerIcons();
    this.hide();
}
```

`runConfigEdit` 本身的约束（实现版）：

```js
function runConfigEdit(label, mutate, options) {
    if (_depth > 0) {                        // 嵌套：并入外层那一条记录
        _depth++; try { return mutate(); } finally { _depth--; }
    }
    const undo = getUndo();                  // 每次现取：Undo 是 Blockbench.Project?.undo
    if (_restoring || !undo || !getProjectConfig()) return mutate();

    if (undo.current_save)                   // 原生编辑进行中
        return _runUnrecorded(options, label, mutate, '编辑器有未完成的编辑…');

    if (estimateSize(createSnapshot().config) > MAX_SNAPSHOT_BYTES)
        return _runUnrecorded(options, label, mutate, '配置快照超过 2 MB');

    const aspects = { [ASPECT_FLAG]: true };
    const wasSaved = Project.saved;
    undo.initEdit(aspects);
    try {
        const result = mutate();
        undo.finishEdit(label, aspects);
        if (_discardEmptyEntry(undo, wasSaved)) return result;   // before == post：弹掉空记录
        _coalesceWithPrevious(undo, label);                      // 同类连续编辑合并
        Blockbench.dispatchEvent('update_selection');
        return result;
    } catch (e) {
        undo.cancelEdit(true);               // 注意：默认 false 只丢弃不回滚
        throw e;
    }
}
```

设计约束（实现后的版本）：

1. **同步 + 嵌套合并**：操作函数内部可再调别的操作（如 `markHitBox` 补建子零件条目），
   天然并入同一条记录；需要"一次撤销改多处"时把变更写进同一个 `mutate` 回调。
2. **占用检查**：`Undo.current_save` 非空说明原生编辑（拖拽元素 / 画 UV / 输入提交）正在进行。
   UI 路径降级为"执行但不记录 + 提示"（默认），`{ strict: true }` 时抛错——供将来的 MCP 工具用。
3. **失败回滚**：`Undo.cancelEdit(true)`（设计稿漏了 `true`，默认参数是 `false`，只丢快照不回滚）。
4. **空记录丢弃**：重名 / 空 ID 等校验失败在操作入口就返回，不进 `runConfigEdit`；
   只改 `_uiState` 的路径即使进了也会被 `_discardEmptyEntry` 弹掉并还原 `Project.saved`。
5. **连续编辑合并**：同一标签、800 ms 内、且上一条 post 与本次 before 完全一致时合并，
   输入框逐字符提交不会把历史塞满。
6. **包装器分工**：
   - 领域操作 → 自己调 `runConfigEdit`（**不要**在对话框/按钮上再包）；
   - 组件字段方法 → `wrapMethodMap(methods, labels)` 在 `Vue.component()` **之前**批量包
     （`Vue.extend` 会复制方法表，注册后再包不生效）；
   - `withUndoEdit(label, fn)` 保留给"确实只有一次性回调、没有可提取操作函数"的场合（当前无使用者）。

### 3.6 与 MCP 插件的关系

MCP 插件暴露的 `MCP.runUndoableEdit(aspects, label, edit)` 是 `Undo.initEdit(aspects)` → `edit()` → `Undo.finishEdit(label)` 的薄包装，失败时尝试回滚，回滚再失败则抛 `AggregateError`。它与本设计**同栈同语义**，因此：

- 工具内部直接调 `require('../core/undo.js').runConfigEdit(label, mutate, { strict: true })`，
  不必再用 `MCP.runUndoableEdit` 套一层（两层 `initEdit` 会互相覆盖）。
- 如果选择用 `MCP.runUndoableEdit`，必须把 `{ machine_max: true }` 原样传进 aspect 才能触发本桥；
  但那样会绕过占用检查、空记录丢弃与合并，不推荐。

---

## 4. 覆盖面清单：已接入的变更入口

判定口径：凡是会改 `Project.machine_max_plugin` 的代码路径都要接入。
下表是**实现后**的实际接入点（`✅` = 已接入，`—` = 明确不接入）。

### 4.1 结构性变更（阶段 1，已完成）

撤销边界统一在 [src/core/operations.js](../src/core/operations.js)；对话框/菜单/工具栏只调用操作函数。

| 入口（UI） | 位置 | 调用的领域操作 |
|---|---|---|
| 右键菜单：新建零件 | [src/mode/patches.js](../src/mode/patches.js) | `ops.createPart` |
| 右键菜单：把组标为 sub_part | [src/mode/patches.js](../src/mode/patches.js) | `ops.markSubPart` |
| 右键菜单：标记为碰撞箱 | [src/mode/patches.js](../src/mode/patches.js) | `ops.markHitBox` |
| 右键菜单：标记为交互区 | [src/mode/patches.js](../src/mode/patches.js) | `ops.markInteractBox` |
| 右键菜单：标记为连接点 | [src/mode/patches.js](../src/mode/patches.js) | `ops.markConnector` |
| 右键菜单：添加子系统 | [src/mode/patches.js](../src/mode/patches.js) | `showAddSubsystemDialog` → `ops.createSubsystem` |
| 右键菜单：清除标记 | [src/mode/patches.js](../src/mode/patches.js) | `ops.clearElementMarker` |
| 右键菜单/工具栏：项目管理 | [src/mode/patches.js](../src/mode/patches.js)、[src/mode/toolbar.js](../src/mode/toolbar.js) | `ops.setContentPackPath` |
| 工具栏：新建零件 | [src/mode/toolbar.js](../src/mode/toolbar.js) | `ops.createPart` |
| 面板：新建零件 | [src/ui/App.vue.js](../src/ui/App.vue.js) | `ops.createPart` |
| 面板：新建变体 | [src/ui/App.vue.js](../src/ui/App.vue.js) | `ops.createVariant` |
| 面板：删除零件 / 删除变体 | [src/ui/App.vue.js](../src/ui/App.vue.js) | `ops.deletePart` / `ops.deleteVariant` |
| 面板：删除子系统 | [src/ui/App.vue.js](../src/ui/App.vue.js) | `ops.deleteSubsystem` |
| 面板：variant `tags` | [src/ui/tag_dialog_helper.js](../src/ui/tag_dialog_helper.js) | `ops.setVariantTags` |
| 对话框：新建子系统实例 | [src/ui/add_subsystem_dialog.js](../src/ui/add_subsystem_dialog.js) | `ops.createSubsystem` |
| 导入：零件导入（含骨骼/碰撞箱/交互区/连接点回填） | [src/import/drag_import.js](../src/import/drag_import.js) | `runConfigEdit('导入零件 <id>', ...)` 包住 `parts[id] = ...` + `resolveBoneReferences()`（导入本身即操作函数） |
| 导入：批量拖入 | [src/import/drag_import.js](../src/import/drag_import.js) | 外层 `runConfigEdit('批量导入零件', ...)`，内层导入作为嵌套编辑并入 |

> 面板新建 sub_part 没有独立入口：子零件由右键菜单"标记为子零件"创建；
> 计算属性里的"缺失配置自动补建"属于修复路径，不单独记录（会并入触发它的那次编辑）。
>
> "新建零件 / 项目管理"两个对话框此前在工具栏、面板、右键菜单各写了一份（业务逻辑也跟着复制了三次），
> 现已收敛到 [src/ui/dialogs/part_dialogs.js](../src/ui/dialogs/part_dialogs.js)，三处入口共用同一份 UI，
> 业务与撤销仍由 `ops.createPart` / `ops.setContentPackPath` 负责。

### 4.2 字段级变更（阶段 2，已完成）

面板字段编辑分两类接入：

1. **走方法的提交点**：在 `Vue.component()` 之前用 `undo.wrapMethodMap()` 批量包装。
   - [src/ui/App.vue.js](../src/ui/App.vue.js)：`updatePartField` / `updateVariantField` /
     `updateSubPartField` / `updateHitBoxField` / `updateHitBoxOverwrite` /
     `updateInteractBoxField` / `updateConnectorField` / `updateSubsystemField` /
     `addEndBone` / `removeEndBone` / `removeTag` / `handleTexturesKv*` /
     `renameSubPart` / `renameConnector` / `renameInteractBox` / `renameSubsystem` /
     `migrateSubPartStartBone` / `migrateConnectorLocator` / `migrateInteractBoxBone` /
     `handleCleanGhostEntry`
   - [src/ui/SubsystemPanel.vue.js](../src/ui/SubsystemPanel.vue.js)：定位器列表、信号目标、
     功率输出映射、弹链编辑器共 12 个方法
   - [src/ui/ConnectorPanel.vue.js](../src/ui/ConnectorPanel.vue.js)：信号目标、信号转译、
     属性覆写共 9 个方法（这些方法直接改 `config` 上的字典，必须在子组件层包）
2. **原生 `v-model` 提交点**：`v-model` 绕过 methods，快照会拿到改完之后的值，因此改为
   `:value` + `@change`（或 `:checked` + `@change`）提交：
   - [src/ui/panels/part_definition_panel.html](../src/ui/panels/part_definition_panel.html)：
     10 个零件/变体字段
   - [src/ui/panels/sub_part_panel.html](../src/ui/panels/sub_part_panel.html)：
     耐久/质量/质心/投影面积/碰撞高度/流体优先级，并新增 `onProjectedAreaChange`
   - [src/ui/panels/hit_box_panel.html](../src/ui/panels/hit_box_panel.html)：`@input` → `@change`

> 不包装只改 `_uiState` 或本地状态的方法：`onPartChange` / `onVariantChange` /
> `selectSubsystem` / `selectByIssue` / `navigateTo*` / `_select*`。它们不该产生撤销记录。
> `mm-signal-target-editor`、`key-value-editor`、`locator-picker` 等共享组件只 emit，
> 落库在父组件方法里，因此无需单独接入。

### 4.3 元数据与路径变更（阶段 3，已完成）

| 入口 | 位置 | 调用的领域操作 |
|---|---|---|
| 创建内容包 | [src/ui/dialogs/pack_create_dialog.js](../src/ui/dialogs/pack_create_dialog.js) | `ops.setContentPack`（label `创建并切换内容包`；目录创建是文件系统副作用，不进撤销栈） |
| 创建后的依赖路径 | 同上 | `ops.updateDependencyPaths({add})` |
| 打开内容包 | [src/ui/dialogs/pack_open_dialog.js](../src/ui/dialogs/pack_open_dialog.js) | `ops.setContentPack`（`contentPackPath` / `namespace` / `packMeta`） |
| 管理依赖包 | [src/ui/dialogs/dependency_editor.js](../src/ui/dialogs/dependency_editor.js) | `ops.updateDependencyPaths({add/remove})` |
| 内容包信息（菜单/导出前） | [src/ui/export/export_dialog.js](../src/ui/export/export_dialog.js) | `ops.updatePackMeta`（只改 `packMeta`，导出本身仍不记录） |

### 4.4 不接入的路径

- **导出**（`src/ui/export/export_pipeline.js`、`src/ui/menu.js`、导出对话框里的 `executeExport`）：
  只读配置并写盘，不产生撤销记录；导出前的 `packMeta` 变更单独记录。
- **校验**（`src/mode/validation.js`、`src/mode/validation_check.js`）：纯只读。
- **`saveConfig()` 自身**（`src/utils/persistence.js`）：写磁盘与侧载文件，不进撤销栈；
  `loadConfig()` 里的幽灵标记清理属于加载期修复。
- **进入模式时的自动选择 / `recalcAutoEndBones`**（`src/mode.js`）：只改 `_uiState` 或做
  派生修复；`_uiState` 本就不在快照里。
- **计算属性里的"缺失配置自动补建"**（`App.vue.js` 的 `selectedSubPartConfig` 等）：
  属于渲染期修复，不单独成记录。

---

## 5. UI 一致性

### 5.1 撤销后必须显式刷新

Vue 2 无法观测 `part.element_markers[variant][uuid] = ...` 这类直接赋值（[src/core/element_markers.js:87](../src/core/element_markers.js) 的注释记录了这一边界，靠调用方事后 `saveConfig()` + `refreshOutlinerIcons()` 兜底）。撤销恢复走的是同一条路：写回 `Project.machine_max_plugin` 后必须调 `refreshOutlinerIcons()` + `update_selection`，不能指望响应式自动生效。

### 5.2 `_uiState` 与恢复后的目标一致性

快照不含 `_uiState`，但恢复后的 `parts` 可能不含当前的 `activePartId` / `activeVariantName`（例如撤销了一次"新建零件"）。恢复后做一次兜底：目标不存在时退化到 `parts` 的第一个键，变体退化到该零件的第一个变体，空配置则清空 `_uiState`。

### 5.3 输入框焦点

面板改为 `@change` 提交（失焦 / 回车 / 下拉选择）后，一次编辑是同步的、瞬时的，
不存在"输入框已提交、撤销记录尚未结束"的长窗口；用户此刻按 `Ctrl+Z` 只会命中已完成的记录。
若确实撞上原生编辑（`Undo.current_save` 非空），`runConfigEdit` 会执行变更但不记录并提示，
不会顶掉原生快照，也不需要额外做焦点管理。

### 5.4 连续输入合并

文本输入框即使仍用 `@input`（如子零件"绑定骨骼"），`_coalesceWithPrevious` 会把
同标签、800 ms 内、且中间无其它变更的提交合并成一条记录，撤销历史不会被逐字符塞满。

---

## 6. 风险与边界

| 风险 | 影响 | 对策 |
|---|---|---|
| 快照体积过大 | 历史占内存，撤销变慢 | 2 MB 上限，超出拒绝并提示；`settings.undo_limit` 本身会限制条数 |
| `Undo.current_save` 被原生编辑占用 | 顶掉原生快照，产生错乱回滚 | 入口处检查并拒绝，返回可读错误 |
| 旧历史记录没有快照 | 撤销时恢复不了配置 | `load_undo_save` 见到无快照即跳过，不报错 |
| 跨项目恢复 | 把 A 工程的配置写进 B 工程 | 快照带 `project_uuid`，不匹配则跳过 |
| 与原生元素撤销混栈 | 顺序错乱 | 同一 `history`、同一 `index`，天然有序；两种记录互不覆盖对方的 aspect |
| `EditSession` 远程编辑 | 自定义数据无法序列化 | 快照仅含 JSON 可表达的值 |
| 撤销后立即保存 | 磁盘上是撤销前的中间态 | 这是原生语义（`Project.saved=false`），不需要额外处理 |
| 撤销栈溢出丢记录 | 最老记录不可撤销 | 与 Blockbench 其它编辑一致，属预期行为 |

---

## 7. 实施阶段（均已落地）

### 阶段 1：桥 + 统一入口 + 结构性变更 ✅

范围：`src/core/undo.js`（桥 + `runConfigEdit` + `withUndoEdit`）、`src/plugin.js` 注册/注销、§4.1 全部入口。

完成判据：

1. 右键菜单新建零件 → `Ctrl+Z` 完全回退，`Ctrl+Y` 完全重做。
2. 右键菜单把组标为 sub_part → 撤销后标记与 `sub_parts` 条目同时消失，Outliner 图标复原。
3. 新建碰撞箱/交互区/连接点 → 撤销后标记与对应定义条目一并消失，且连带新建的空 sub_part 一并消失。
4. 面板新建零件/变体/sub_part → 撤销后面板列表与 Outliner 图标同步。
5. 撤销后 `Project.saved` 为 `false`（标题栏有未保存标记），保存后 `.bbmodel` 内配置与撤销后的状态一致。

### 阶段 2：字段级变更 ✅

范围：§4.2。`v-model` 提交点改为 `:value`/`:checked` + `@change`，方法提交点用 `wrapMethodMap` 批量包装。

完成判据：

1. 面板改任一数值/枚举/字符串字段 → `Ctrl+Z` 回到旧值，面板显示同步。
2. 连续改同一字段 3 次（间隔 > 800 ms）→ 撤销栈里是 3 条独立记录；快速连续输入合并为 1 条。
3. 输入框连续输入（Composition 事件）不产生空记录。

### 阶段 3：元数据与导入 ✅

范围：§4.3 + 导入路径。

完成判据：

1. 改内容包路径/依赖/元数据 → 可撤销。
2. 导入一个零件 → 一次撤销回退整次导入（含批量标记）。
   无冲突的批量拖入合并为一条记录；有重名冲突时，用户在冲突对话框里逐个选择后各成一条。

### 未覆盖 / 后续

- MCP 工具（docs/12）尚未实现；实现时直接复用 `undo.runConfigEdit(label, mutate, { strict: true })`。
- 内容包**定义文件**（`{ns}/materials|connectors|subsystems|control_groups|projectiles/*.json`）由作者在编辑器外直接编辑，
  插件不写这些文件，因此不在撤销范围内；若将来在插件内提供定义编辑，可在同一桥上加"内容包文件快照"
  （`create_undo_save` 里多挂一个键、`load_undo_save` 里回写文件），不需要改现有入口。

---

## 8. 验收清单（手动）

| # | 操作 | 期望 |
|---|---|---|
| 1 | 新建零件 → `Ctrl+Z` | 零件消失，`activePartId` 落到兜底目标 |
| 2 | 新建零件 → `Ctrl+Z` → `Ctrl+Y` | 零件回来，字段为默认值 |
| 3 | 删 sub_part → `Ctrl+Z` | sub_part 与其 hit_boxes/connectors/subsystems 全部回来 |
| 4 | 连续 10 次结构编辑 → 连续 10 次 `Ctrl+Z` | 逐条回退，第 11 次无效果 |
| 5 | 移动一个 cube（原生元素编辑）→ 新建零件 → `Ctrl+Z` ×2 | 先撤销新零件，再撤销移动；两类记录互不干扰 |
| 6 | 撤销后 `Ctrl+S` → 关闭 → 重开 | 磁盘状态等于撤销后状态 |
| 7 | 撤销后重载插件 | 历史清空（Blockbench 内存态），工程配置仍是撤销后状态 |
| 8 | 拖拽元素过程中点击面板字段（原生编辑占用中） | 变更照常执行但不进撤销栈，Toast 提示"未能进入撤销栈" |
| 9 | 超过 `undo_limit` 次编辑 | 最老记录被丢弃，其余逐个可撤销 |
| 10 | 撤销后打开原生问题清单 | 列表内容与恢复后的配置一致 |
| 11 | 面板数值框连续改 3 次（间隔 < 800 ms） | 撤销栈里合并为 1 条；间隔 > 800 ms 则为 3 条 |
| 12 | 切换/撤销内容包路径 → 打开"查看材料定义" | 合并视图缓存已失效，列表来自新路径 |
| 13 | 表单校验失败（如新建零件时 ID 为空） | 撤销栈不新增记录，标题栏不出现未保存标记 |

---

## 9. 参考资料

- Blockbench 撤销实现：[js/undo.js](https://github.com/JannisX11/blockbench/blob/master/js/undo.js)（`UndoSystem`、`UndoSystem.save.fromState`、`create_undo_save`、`load_undo_save`）
- 本地源码副本：`D:\Files\Project_MinecraftMods\blockbench`（v5.1.4）
- 运行中的桌面端 `5.0.7`：从 `%LOCALAPPDATA%\Programs\blockbench\resources\app.asar` 抽取的 `undo.js`
  已核对——`cancelEdit(e = !1)`、`create_undo_save` / `load_undo_save` 的 dispatch 点、
  `Object.defineProperty(window, "Undo", { get: () => Blockbench.Project?.undo })` 全部一致。
- 插件内配置存储：[src/utils/persistence.js](../src/utils/persistence.js)（`PROPERTY_NAME = 'machine_max_plugin'`，`registerProperty` / `loadConfig` / `saveConfig`）
- 撤销桥与统一入口：[src/core/undo.js](../src/core/undo.js)
- 标记系统边界：[src/core/element_markers.js](../src/core/element_markers.js)
- MCP 侧调用约定：[docs/12-MCP工具接入.md](./12-MCP工具接入.md)

---

## 10. 实现说明（与设计稿的差异）

| # | 设计稿 | 实现 | 原因 |
|---|---|---|---|
| 1 | 代码放 `src/mcp/undo_bridge.js` + `src/mcp/run.js` | 合并进 `src/core/undo.js` | 撤销不属于 MCP；MCP 未实现，`src/mcp/` 尚无目录；docs/12 的工具可直接复用 |
| 2 | `Undo.cancelEdit()` 回滚 | `Undo.cancelEdit(true)` | Blockbench 默认参数是 `false`（只丢快照、不回滚），照抄会留下半截编辑 |
| 3 | 串行 Promise 队列 | 同步执行 + `_depth` 嵌套合并 | 现有 UI 全部同步调用；Promise 队列会把结果异步化，破坏 `onConfirm` 的 `return false` 语义 |
| 4 | 恢复 = 整体替换 `Project[PROPERTY_NAME]` | 就地覆盖顶层键（`applySnapshot`） | 面板与已打开对话框持有对象引用，整体替换会让它们指向旧副本 |
| 5 | 未提内容包缓存 | 恢复后 `content_pack_manager.invalidateCache()` | `contentPackPath` / `dependencyPaths` 可被撤销，合并视图缓存必须失效 |
| 6 | 未提空记录 | `_discardEmptyEntry` 弹掉 before==post 的记录并还原 `Project.saved` | 表单校验失败提前 return 会产生"Ctrl+Z 无变化"的空记录 |
| 7 | 未提连续输入 | `_coalesceWithPrevious` 合并 800 ms 内同类提交 | 避免输入框逐字符压栈 |
| 8 | 占用时一律抛错 | UI 路径默认降级为"执行但不记录 + 提示"，`{ strict: true }` 才抛错 | 人类点击不应因为原生编辑进行中就丢操作；MCP 需要严格拒绝 |
| 9 | `refreshAfterRestore` 直接调 `Validator.validate()` | 只派发 `update_selection`（`Validator.triggers` 内含该事件） | 5.0.7 / 5.1.4 的 `dispatchEvent` 末尾都会调 `Validator.validate(event_name)`，重复调用无意义 |
| 10 | 面板靠 `update_selection` 重算 | 新增 `mm_config_restored` 事件 | `update_selection` 不会让面板重新 `loadConfigData()`，配置对象被就地覆盖后需要显式重读 |
| 11 | §4 把撤销包在"对话框 onConfirm / 菜单 click"上 | 抽出 `src/core/operations.js` 领域操作层，撤销边界随业务动作走；对话框/菜单只调用操作 | 包在 UI 回调上意味着"同一个动作换个入口就得再包一次"（新建零件有三处入口、删除零件两处），漏包即不可撤销；且业务逻辑散在对话框里无法复用/测试 |

**验证方式**：仓库无自动化测试基建，本次用 Node 模拟 Blockbench 事件总线与 `UndoSystem`
（`create_undo_save` / `load_undo_save` / `initEdit` / `finishEdit` / `cancelEdit` / `undo` / `redo`）
覆盖四组：
1. 撤销桥本身：桥接、重做、嵌套、空记录、合并、占用降级、失败回滚、`_uiState` 兜底、非插件记录隔离、卸载；
2. 领域操作层：16 个操作各自的落库结果 + 撤销记录（含重名失败不产生记录、无变更依赖不产生记录）；
3. `App.vue.js` 注册前完成字段方法包装、包装后真实产生带快照的记录；
4. 两个子面板的 methods 包装顺序。
手动验收仍按 §8 在 Blockbench 桌面端执行。
