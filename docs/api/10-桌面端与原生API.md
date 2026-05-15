# 10 — 桌面端与原生 API

> 最后更新：2026-05-16 | 说明：Blockbench 桌面端特有的功能函数、原生 Node.js 模块访问、作用域限定的文件系统 API 及剪贴板操作

---

## 目录

1. [桌面端功能函数](#1-桌面端功能函数)
2. [requireNativeModule 函数](#2-requirenativemodule-函数)
3. [ScopedFS 类型](#3-scopedfs-类型)
4. [支持的模块列表](#4-支持的模块列表)
5. [Clipboard 命名空间](#5-clipboard-命名空间)

---

## 1. 桌面端功能函数

仅在 Blockbench 桌面端（Electron）环境中可用的功能函数，处理项目文件管理、窗口操作等原生功能。

### 项目与文件管理

#### `updateRecentProjects(): void`

更新"最近项目"列表，从文件系统中读取最近打开的项目记录并刷新界面显示。

#### `addRecentProject(data): void`

将项目信息添加到最近项目列表中。

```javascript
addRecentProject({
    path: 'C:/projects/my_model.bbmodel',
    name: 'My Model'
});
```

#### `createBackup(init): void`

创建当前项目的备份文件。`init` 参数指定备份的初始化方式。

#### `openDefaultTexturePath(): void`

在系统文件管理器中打开默认纹理路径。

### 窗口操作

#### `closeBlockbenchWindow(): any`

关闭当前 Blockbench 窗口。在 Windows/Linux 上关闭整个窗口，在 macOS 上仅关闭当前标签页。

### 图片编辑器

#### `changeImageEditor(texture, from_settings): void`

切换用于编辑纹理的外部图片编辑器。`texture` 为要编辑的纹理对象，`from_settings` 指示是否从设置中读取编辑器路径。

```javascript
// 在外部图片编辑器中打开选中的纹理
changeImageEditor(Texture.selected, false);
```

---

## 2. requireNativeModule 函数

插件在桌面端访问原生 Node.js 模块的入口。此函数仅在 Blockbench 桌面端可用，Web 端调用会抛出错误。

### 基本用法

```javascript
var module = requireNativeModule(moduleName, options?);
```

### 文件系统（带作用域限制）

```javascript
var fs = requireNativeModule('fs', { scope: 'some_path' });
fs.readFileSync('file.txt', 'utf8');
```

`scope` 参数限定文件操作只能在指定路径范围内，越界访问会被拒绝，保障安全性。

### 路径模块

```javascript
var path = requireNativeModule('path');
path.join('folder', 'subfolder', 'file.txt');
// "folder/subfolder/file.txt"
```

### 加密模块

```javascript
var crypto = requireNativeModule('crypto');
var hash = crypto.createHash('sha256');
hash.update('data');
hash.digest('hex');
```

### Electron 模块

需要用户确认权限。

```javascript
var electron = requireNativeModule('electron');
var dialog = electron.remote.dialog;
```

### 子进程模块

需要用户确认权限，可通过 `message` 参数自定义权限提示信息。

```javascript
var child_process = requireNativeModule('child_process', {
    message: '需要子进程权限以执行外部工具'
});
child_process.exec('echo hello');
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `moduleName` | `string` | 是 | Node.js 模块名称 |
| `options.scope` | `string` | 否 | 文件系统作用域路径，仅对 `fs` 模块有效 |
| `options.message` | `string` | 否 | 权限确认提示信息，对需要确认的模块有效 |

---

## 3. ScopedFS 类型

作用域限定的文件系统 API，用于安全的插件文件操作。创建时指定一个根路径作为作用域，所有文件操作都被限制在该路径内，无法访问外部文件。

### 主要方法

所有方法签名与 Node.js `fs` 模块保持一致，但路径相对于作用域根路径。

| 方法 | 说明 |
| --- | --- |
| `access(path, mode)` | 检查文件访问权限 |
| `readFile(path, encoding)` | 读取文件内容 |
| `writeFile(path, data, encoding)` | 写入文件 |
| `mkdir(path, options)` | 创建目录 |
| `readdir(path, options)` | 读取目录内容 |
| `unlink(path)` | 删除文件 |
| `stat(path)` | 获取文件状态 |
| `rename(oldPath, newPath)` | 重命名文件或目录 |
| 以上方法的 `Sync` 版本 | 同步版本（如 `readFileSync`） |
| `promises` | Promise 版本（如 `promises.readFile`） |

```javascript
// 创建作用域限定的文件系统
var scopedFs = new ScopedFS('/path/to/plugin/data');

// 写入文件（实际路径为 /path/to/plugin/data/config.json）
scopedFs.writeFileSync('config.json', JSON.stringify({ key: 'value' }));

// 异步读取
scopedFs.promises.readFile('config.json', 'utf8').then(function(data) {
    console.log(JSON.parse(data));
});
```

### 安全特性

- 所有路径操作自动校验，拒绝路径穿越攻击（如 `../../outside`）
- 支持同步和异步两种调用方式
- 可通过 `promises` 属性使用 Promise 版本 API

---

## 4. 支持的模块列表

以下是 `requireNativeModule` 支持加载的 Node.js 原生模块分类。

### 可直接使用（无额外权限要求）

| 模块 | 说明 |
| --- | --- |
| `fs` | 文件系统，可配合 `scope` 参数限制作用域 |
| `path` | 路径处理 |
| `crypto` | 加密算法 |
| `events` | 事件触发器 |
| `zlib` | 压缩/解压缩 |
| `timers` | 定时器 |
| `url` | URL 解析 |
| `string_decoder` | 字符串解码 |
| `stream` | 流处理 |
| `perf_hooks` | 性能监控 |
| `querystring` | 查询字符串解析 |
| `util` | 工具函数 |
| `os` | 操作系统信息 |
| `v8` | V8 引擎信息 |

### 需要用户确认权限

| 模块 | 说明 |
| --- | --- |
| `child_process` | 子进程管理，需用户确认 |
| `electron` | Electron 桌面 API，需用户确认 |
| `https` | HTTPS 网络请求，需用户确认 |
| `net` | TCP 网络，需用户确认 |
| `tls` | TLS/SSL 安全传输，需用户确认 |

### 其他

| 模块 | 说明 |
| --- | --- |
| `clipboard` | 剪贴板操作 |
| `shell` | Shell 命令执行 |

---

## 5. Clipboard 命名空间

`Clipbench` 是 Blockbench 的剪贴板管理命名空间，负责元素的复制、粘贴、剪切等操作。

### 方法

#### `Clipbench.copy(event, cut): void`

执行复制操作。`event` 为触发复制的事件对象，`cut` 为布尔值指示是否为剪切模式。

```javascript
// 复制选中元素
Clipbench.copy(event, false);

// 剪切选中元素
Clipbench.copy(event, true);
```

#### `Clipbench.paste(event): Promise`

执行粘贴操作，返回 Promise 在粘贴完成后解析。

```javascript
Clipbench.paste(event).then(function() {
    console.log('粘贴完成');
});
```

#### `Clipbench.setElements(arr): void`

设置剪贴板中的元素列表。

```javascript
Clipbench.setElements(selectedElements);
```

#### `Clipbench.setText(text): void`

设置剪贴板中的文本内容。

```javascript
Clipbench.setText('copied content');
```

#### `Clipbench.setGroups(groups): void`

设置剪贴板中的组（骨骼）列表。

```javascript
Clipbench.setGroups(selectedGroups);
```
