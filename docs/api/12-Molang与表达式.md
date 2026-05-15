# 12 — Molang 与表达式 API

> 最后更新：2026-05-16 | 说明：Blockbench 中的 Molang 表达式解析、表达式查询、自动补全系统及预定义的补全上下文

---

## 目录

1. [MolangParser](#1-molangparser)
2. [MolangExpression 接口](#2-molangexpression-接口)
3. [全局函数](#3-全局函数)
4. [MolangAutocomplete 命名空间](#4-molangautocomplete-命名空间)
5. [预定义上下文](#5-预定义上下文)

---

## 1. MolangParser

全局变量，来自 `molangjs` 库。提供 Molang 表达式的解析与求值能力。

```javascript
// 解析 Molang 表达式
var ast = MolangParser.parse('query.health * 2');

// 求值
var result = MolangParser.evaluate('math.sin(query.anim_time * 180)');
```

`MolangParser` 是 Blockbench 中所有 Molang 相关功能的底层引擎，用于：

- 解析表达式字符串为抽象语法树（AST）
- 在动画时间轴上求值
- 为自动补全提供语法分析支持

---

## 2. MolangExpression 接口

表示一个 Molang 表达式的接口，关联到具体的动画、动画器和通道信息。

### 属性

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `animation` | `_Animation` | 所属动画对象 |
| `animator` | `BoneAnimator` | 骨骼动画器实例 |
| `channel` | `string` | 动画通道名称（如 `'rotation'`、`'position'`、`'scale'`） |
| `type` | `string` | 表达式类型标识 |
| `value` | `string` | 表达式字符串内容 |

```javascript
// 遍历表达式并分析
var expressions = getAllMolangExpressions();
expressions.forEach(function(expr) {
    console.log(
        '动画:', expr.animation.name,
        '通道:', expr.channel,
        '表达式:', expr.value
    );
});
```

---

## 3. 全局函数

### `getAllMolangExpressions(): MolangExpression[]`

获取当前项目中所有已定义的 Molang 表达式。返回所有动画、所有通道中使用的表达式列表。

```javascript
var allExprs = getAllMolangExpressions();

// 查找使用了特定 query 的表达式
var healthExprs = allExprs.filter(function(expr) {
    return expr.value.indexOf('query.health') !== -1;
});
```

---

## 4. MolangAutocomplete 命名空间

Molang 表达式自动补全系统。为 Molang 编辑提供智能提示，包含命名空间、查询函数、关键词的自动补全。

### Namespace 类

命名空间，代表一组相关的补全项（如所有 `query.xxx` 函数、所有 `math.xxx` 函数）。

#### 构造函数

```javascript
new MolangAutocomplete.Namespace({
    id: 'my_namespace',
    shorthand: 'my',    // 可选，简写前缀
    priority: 10        // 可选，补全优先级
});
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 命名空间唯一标识 |
| `shorthand` | `string` | 可选，简写前缀，如 `'q'` 可代表 `'query'` |
| `priority` | `number` | 可选，补全优先级，越高越优先显示 |

#### 方法

##### `namespace.addQuery(query): Namespace`

添加一个查询项到命名空间。返回自身以支持链式调用。

```javascript
var ns = new MolangAutocomplete.Namespace({ id: 'custom' });

ns.addQuery({
    id: 'custom_value',
    description: '自定义值',
    return_type: 'float'
});
```

##### `namespace.hasQuery(queryID): boolean`

检查命名空间中是否存在指定 ID 的查询项。

```javascript
if (ns.hasQuery('custom_value')) {
    // 已存在
}
```

##### `namespace.removeQuery(queryID): boolean`

从命名空间中移除指定 ID 的查询项。

```javascript
ns.removeQuery('custom_value');
```

##### `namespace.addQueryGetter(id, getter): Namespace`

添加动态查询获取器，在需要时动态生成补全项列表。

```javascript
ns.addQueryGetter('dynamic_items', function() {
    return Project.elements.map(function(el) {
        return {
            id: 'element_' + el.uuid,
            description: el.name
        };
    });
});
```

##### `namespace.createUnion(other, options?): Namespace`

合并当前命名空间与另一个命名空间，返回新的联合命名空间。

```javascript
var union = ns1.createUnion(ns2, {
    id: 'combined',
    priority: 5
});
```

### Context 类

上下文，代表一个完整的自动补全环境，包含多个命名空间和根令牌。

#### 构造函数

```javascript
new MolangAutocomplete.Context({
    id: 'my_context',
    rootTokens: ['$'],           // 可选，根令牌
    inheritedContext: baseCtx     // 可选，继承的上下文
});
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 上下文唯一标识 |
| `rootTokens` | `string[]` | 可选，根令牌列表（如 `['$']`） |
| `inheritedContext` | `Context` | 可选，继承自另一个上下文 |

#### 方法

##### `context.addRootToken(token): Context`

添加根令牌。返回自身以支持链式调用。

```javascript
context.addRootToken('$');
```

##### `context.getRootToken(tokenID): RootToken`

获取指定 ID 的根令牌。

```javascript
var token = context.getRootToken('$');
```

##### `context.removeRootToken(tokenID): boolean`

移除指定 ID 的根令牌。

```javascript
context.removeRootToken('$');
```

##### `context.addNamespace(namespace, createUnion?): Context`

添加命名空间到上下文。如果 `createUnion` 为 `true` 且同 ID 命名空间已存在，则合并两者。

```javascript
context.addNamespace(myNamespace, false);
```

##### `context.getNamespace(namespaceID, recursive?): Namespace`

获取指定 ID 的命名空间。如果 `recursive` 为 `true`，会递归搜索继承的上下文。

```javascript
var queryNs = context.getNamespace('query', true);
```

##### `context.autocomplete(text, position): MolangAutocompleteResult[]`

执行自动补全，返回当前位置的补全建议列表。

```javascript
var results = context.autocomplete('query.h', 7);
results.forEach(function(r) {
    console.log(r.text, r.description);
});
```

##### `context.delete(): void`

删除上下文，清理资源并从 `Context.all` 中移除。

```javascript
tempContext.delete();
```

#### 静态属性

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `Context.all` | `Context[]` | 所有已注册的上下文列表 |

### MolangAutocompleteResult 类型

自动补全结果项的结构：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `text` | `string` | 补全文本 |
| `description` | `string` | 描述信息 |
| `type` | `string` | 返回值类型 |
| `namespace` | `string` | 所属命名空间 |

---

## 5. 预定义上下文

Blockbench 内置了多个预定义的自动补全上下文，覆盖不同的编辑场景。

### `MolangAutocomplete.DefaultContext`

默认上下文。包含基础的 Molang 关键词、运算符和常用函数补全。适用于大多数 Molang 编辑场景。

```javascript
// 使用默认上下文进行补全
var results = MolangAutocomplete.DefaultContext.autocomplete('math.', 5);
```

### `MolangAutocomplete.KeyframeContext`

关键帧上下文。在关键帧表达式编辑时使用，包含关键帧特有的函数和变量补全。

额外提供：
- `query.keyframe_*` 系列查询
- 关键帧插值相关函数

### `MolangAutocomplete.AnimationControllerContext`

动画控制器上下文。在动画控制器编辑时使用，包含控制器相关的状态、条件和变量补全。

额外提供：
- 控制器状态相关查询
- `query.anim_time`
- `query.life_time`
- 过渡条件相关函数

### `MolangAutocomplete.AnimationContext`

动画上下文。在动画时间轴编辑时使用，包含动画相关的变量和函数补全。

额外提供：
- `query.anim_time`
- `query.frame_alpha`
- 骨骼变换相关查询

### `MolangAutocomplete.VariablePlaceholdersContext`

变量占位符上下文。用于需要引用变量的场景，提供变量占位符补全。

额外提供：
- `variable.xxx` 占位符
- 临时变量相关

### `MolangAutocomplete.BedrockBindingContext`

基岩版绑定上下文。在基岩版格式的绑定表达式编辑时使用。

额外提供：
- `query.bind_*` 系列绑定查询
- 基岩版特有 Molang 函数
- 渲染控制器相关查询

```javascript
// 在特定上下文中执行自动补全
var ctx = MolangAutocomplete.AnimationContext;
var suggestions = ctx.autocomplete('q', 1);

suggestions.forEach(function(s) {
    // s.text: "query.anim_time"
    // s.description: "获取动画已播放时间"
    // s.type: "float"
});
```
