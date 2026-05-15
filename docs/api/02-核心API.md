# 02 — Blockbench 核心 API

> 最后更新：2026-05-16 | 说明：Blockbench 全局对象 API，涵盖环境检测、UI 反馈、CSS 注入、文件系统操作等核心功能

---

## 目录

1. [Blockbench 全局对象](#1-blockbench-全局对象)
2. [环境检测](#2-环境检测)
3. [UI 反馈方法](#3-ui-反馈方法)
4. [CSS 与样式](#4-css-与样式)
5. [文件系统操作](#5-文件系统操作)
6. [事件系统](#6-事件系统)
7. [全局引用变量](#7-全局引用变量)
8. [工具函数](#8-工具函数)

---

## 1. Blockbench 全局对象

`Blockbench` 是 Blockbench 的全局核心 API 命名空间，提供环境检测、UI 反馈、事件管理、文件操作等核心功能。所有插件均可直接通过全局变量 `Blockbench` 访问这些 API。

```javascript
Blockbench.showQuickMessage('插件已加载');
```

---

## 2. 环境检测

### 平台环境

| 属性 | 类型 | 说明 |
|------|------|------|
| `Blockbench.isWeb` | `boolean` | 是否为网页版（浏览器/PWA） |
| `Blockbench.isMobile` | `boolean` | 是否为移动端 |
| `Blockbench.isLandscape` | `boolean` | 是否为横屏模式 |
| `Blockbench.isTouch` | `boolean` | 是否为触屏设备 |
| `Blockbench.isPWA` | `boolean` | 是否为 PWA 模式 |
| `Blockbench.platform` | `string` | 平台标识，如 `'web'`、`'desktop'` |
| `Blockbench.operating_system` | `string` | 操作系统名称 |
| `Blockbench.version` | `string` | Blockbench 版本号字符串 |

```javascript
// 检测运行环境
if (Blockbench.isWeb) {
    console.log('运行在浏览器中');
} else {
    console.log('运行在桌面端');
}

// 版本检测
if (Blockbench.isNewerThan('4.9.0')) {
    // 使用 4.9.0+ 特性
}
```

### 版本比较

```javascript
/**
 * 检查当前版本是否大于等于指定版本
 * @param {string} version - 对比的版本号
 * @returns {boolean}
 */
Blockbench.isNewerThan('4.9.0');

/**
 * 检查当前版本是否小于等于指定版本
 * @param {string} version - 对比的版本号
 * @returns {boolean}
 */
Blockbench.isOlderThan('5.0.0');
```

### 版本更新回调

```javascript
/**
 * 当用户更新到指定版本或更高版本时执行回调
 * @param {string} version - 目标版本号
 * @param {Function} callback - 回调函数，接收上一个版本号作为参数
 */
Blockbench.onUpdateTo('4.9.0', function(previous_version) {
    console.log('从 ' + previous_version + ' 更新到了 4.9.0+');
});
```

### 标志（Flag）系统

```javascript
/**
 * 添加一个全局标志
 * @param {string} flag - 标志名称
 */
Blockbench.addFlag('custom_feature');

/**
 * 移除一个全局标志
 * @param {string} flag - 标志名称
 */
Blockbench.removeFlag('custom_feature');

/**
 * 检查标志是否存在
 * @param {string} flag - 标志名称
 * @returns {boolean|undefined}
 */
if (Blockbench.hasFlag('custom_feature')) {
    // 该标志已启用
}
```

---

## 3. UI 反馈方法

### 快速消息

```javascript
/**
 * 在屏幕中央显示短暂的消息提示
 * @param {string} message - 消息文本
 * @param {number} [time] - 显示时间（毫秒），默认约 2000ms
 */
Blockbench.showQuickMessage('操作成功');
Blockbench.showQuickMessage('操作完成', 3000);
```

### Toast 通知

```javascript
/**
 * 显示 Toast 风格的弹窗通知
 * @param {object} options - 通知选项
 * @param {string} options.title - 标题
 * @param {string} options.text - 内容文本
 * @param {string} [options.icon] - 图标
 * @param {string} [options.color] - 颜色
 * @param {number} [options.timeout] - 自动关闭时间（毫秒）
 * @returns {Deletable} - 可手动关闭通知的删除器
 */
var notification = Blockbench.showToastNotification({
    title: '导出完成',
    text: '文件已保存到桌面',
    icon: 'fa-check',
    timeout: 5000
});
```

### 光标提示

```javascript
/**
 * 设置鼠标光标旁的工具提示文本
 * @param {string} [text] - 提示文本，不传则清除
 */
Blockbench.setCursorTooltip('点击选择元素');
```

### 进度条

```javascript
/**
 * 设置进度条的进度
 * @param {number} progress - 进度值（0~1）
 * @param {number} [time] - 时间参数
 * @param {string} [bar] - 进度条标识
 */
Blockbench.setProgress(0.5, 1000, 'export');
```

### 状态栏消息

```javascript
/**
 * 在状态栏显示消息
 * @param {string} message - 消息文本
 * @param {number} [time] - 显示时间（毫秒）
 */
Blockbench.showStatusMessage('就绪', 3000);

/**
 * 设置状态栏文本（持久显示）
 * @param {string} [text] - 文本内容，不传则清除
 */
Blockbench.setStatusBarText('加载中...');
```

### 消息框

```javascript
/**
 * 显示模态消息框
 * @param {object} options - 配置选项
 * @param {string} options.title - 标题
 * @param {string} options.message - 消息内容
 * @param {string} [options.icon] - 图标
 * @param {string[]} options.buttons - 按钮文本数组
 * @param {Function} [cb] - 回调函数，接收 (buttonIndex, result, event)
 * @returns {MessageBox}
 */
Blockbench.showMessageBox({
    title: '提示',
    message: '操作成功完成！',
    icon: 'fa-check-circle',
    buttons: ['确定']
}, function(button, result) {
    console.log('用户点击了:', button);
});
```

### 文本输入提示

```javascript
/**
 * 弹出文本输入对话框
 * @param {string} title - 对话框标题
 * @param {string} value - 初始值
 * @param {Function} callback - 确认回调，接收输入文本
 * @param {object} [options] - 可选配置
 * @param {string} [options.placeholder] - 占位文本
 * @param {string} [options.description] - 描述文本
 * @param {string} [options.info] - 额外信息
 * @returns {Promise<string>}
 */
var name = await Blockbench.textPrompt('输入名称', '默认值', function(text) {
    console.log('用户输入:', text);
}, { placeholder: '请输入名称' });
```

### 打开链接

```javascript
/**
 * 在浏览器中打开链接（桌面端或网页版）
 * @param {string} link - URL 链接
 */
Blockbench.openLink('https://example.com');
```

---

## 4. CSS 与样式

```javascript
/**
 * 向页面注入自定义 CSS 样式
 * @param {string} css - CSS 样式文本
 * @param {string} [layer] - 层级标识
 * @returns {Deletable} - 可移除注入样式的删除器
 */
var css = Blockbench.addCSS(`
    .my-panel { background: #f0f0f0; }
    .my-button { color: #ff0000; }
`);

// 移除注入的 CSS
css.delete();
```

---

## 5. 文件系统操作

Blockbench 提供跨平台的文件读写和导入导出功能，桌面端和网页版均可使用。

### 导入文件（弹出文件打开对话框）

```javascript
/**
 * 打开系统原生文件选择对话框，用户选择文件后读取内容
 * @param {object} options - 配置选项
 * @param {string[]} options.extensions - 允许的文件扩展名列表
 * @param {string} [options.type] - 文件类型描述
 * @param {string} [options.resource_id] - 资源标识符，用于记忆路径
 * @param {boolean} [options.multiple] - 是否允许多选
 * @param {Function} [callback] - 回调，接收文件数组
 * @returns {Promise<object>}
 */
var file = await Blockbench.importFile({
    extensions: ['json', 'txt'],
    type: 'text'
});

// 别名
var file = await Blockbench.import({
    extensions: ['json']
});
```

### 导出文件（弹出文件保存对话框）

```javascript
/**
 * 打开系统原生文件保存对话框，用户选择路径后写入内容
 * 桌面端（Electron）：弹出操作系统保存对话框（Windows 文件选择器 / macOS Finder 面板）
 * 网页版：触发浏览器文件下载
 *
 * @param {object} options - 导出选项
 * @param {string} options.name - 建议的文件名（必填）
 * @param {string|ArrayBuffer|Blob} options.content - 要写入的文件内容（必填）
 * @param {string[]} options.extensions - 允许的扩展名列表，如 ['json']（必填）
 * @param {string} [options.type] - 文件类型描述，显示在对话框的过滤器下拉框中
 * @param {string} [options.startpath] - 对话框打开时的默认路径
 * @param {string} [options.resource_id] - 资源标识符，用于记住上次选择的路径
 * @param {string} [options.savetype] - 保存类型：'text'(默认) | 'image' | 'binary' | 'buffer' | 'zip'
 * @param {Function} [options.custom_writer] - 自定义写入函数 (content, path, callback?) => void
 * @param {Function} [callback] - 用户确认后的回调，参数为用户选择的完整文件路径
 */
Blockbench.exportFile({
    name: 'model.geo.json',
    content: jsonString,
    extensions: ['json'],
    type: 'Model File',
    startpath: Project.export_path,
    resource_id: 'model',
    savetype: 'text'
}, function(filePath) {
    // filePath 为用户在对话框中选中的完整路径（含文件名）
    // 取消保存时回调不会执行
    if (!filePath) return;

    // 获取目录前缀，可用于继续保存其他附属文件
    var dirPath = filePath.slice(0, -pathToName(filePath, true).length);
    console.log('文件保存到:', filePath);
});

// 别名（推荐使用更简洁的形式）
Blockbench.export({
    name: 'texture.png',
    content: pngData,
    extensions: ['png'],
    type: 'PNG Image',
    savetype: 'image'
}, function(path) {
    // 同样接收用户选中的文件路径
});
```

**options 参数详解：**

| 选项 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `string` | **是** | 建议的文件名，对话框打开时默认显示此名称 |
| `content` | `string \| ArrayBuffer \| Blob` | **是** | 要写入的文件内容 |
| `extensions` | `string[]` | **是** | 允许的文件扩展名列表，如 `['json', 'bbmodel']` |
| `type` | `string` | 否 | 文件类型名称，显示在对话框的类型筛选下拉框中 |
| `startpath` | `string` | 否 | 对话框打开时的默认路径，常用 `Project.export_path` |
| `resource_id` | `string` | 否 | 资源标识符，Blockbench 会记住该 ID 上次选择的路径 |
| `savetype` | `string` | 否 | 保存类型：`'text'`（默认，文本文件）、`'image'`（图片/二进制）、`'binary'`、`'buffer'`、`'zip'` |
| `custom_writer` | `function` | 否 | 自定义写入函数 `(content, path, callback?) => void`，桌面端专用 |

**重要说明：**
- 在**桌面端**（Electron），底层调用 `electron.dialog.showSaveDialogSync()`，弹出操作系统原生文件保存对话框
- 如果用户**取消**保存对话框，`callback` **不会被执行**（浏览器端则始终触发下载）
- 可以在回调中获取 `filePath` 并通过字符串处理得到目录前缀，用于继续保存其他附属文件
- 如果不希望弹出对话框、直接写入已知路径，使用 `Blockbench.writeFile()`

### 读取文件

```javascript
/**
 * 读取已打开的文件的完整内容
 * @param {object} options - 配置选项
 * @returns {Promise<object>}
 */
var content = await Blockbench.readFile({
    path: 'path/to/file.txt',
    type: 'text'
});
```

### 写入文件（无对话框，直接写入）

```javascript
/**
 * 将内容直接写入指定路径（桌面端专用，不弹出对话框）
 * @param {string} file_path - 目标文件完整路径
 * @param {object} options - 写入选项
 * @param {string} options.content - 文件内容
 * @param {string} [options.savetype] - 保存类型
 * @param {Function} [callback] - 完成回调
 */
Blockbench.writeFile('path/to/output.json', {
    content: '{"key": "value"}',
    savetype: 'text'
}, function(path) {
    console.log('写入完成:', path);
});
```

### 选择目录

```javascript
/**
 * 打开目录选择对话框
 * @returns {Promise<string>} 选中的目录路径
 */
var dir = await Blockbench.pickDirectory();
```

### 拖放处理

```javascript
/**
 * 添加文件拖放处理器
 * @param {Function} handler - 处理函数 (files, event) => void
 */
Blockbench.addDragHandler(function(files, event) {
    files.forEach(function(file) {
        console.log('拖放了文件:', file.name);
    });
});

/**
 * 移除文件拖放处理器
 * @param {Function} handler - 之前添加的处理函数
 */
Blockbench.removeDragHandler(handler);
```

---

## 6. 事件系统

`Blockbench` 对象自身就是一个事件派发器，用于监听程序生命周期中的各种事件。

```javascript
/**
 * 注册事件监听器
 * @param {string} event_name - 事件名称
 * @param {Function} callback - 回调函数 (data) => void
 * @returns {Deletable} 调用 delete() 可移除监听
 */
var listener = Blockbench.on('new_project', function(data) {
    console.log('新项目创建:', data.project.name);
});

// 移除监听
listener.delete();

/**
 * 一次性事件监听
 */
Blockbench.once('load_project', function(data) {
    console.log('项目首次加载完成');
});

/**
 * 派发事件（插件自定义事件）
 * @returns {any[]} 所有回调返回值的数组
 */
var results = Blockbench.dispatchEvent('my_custom_event', { key: 'value' });
```

详细事件列表见 [08-事件系统.md](08-事件系统.md)。

---

## 7. 全局引用变量

Blockbench 提供以下全局变量供插件直接访问：

| 变量 | 类型 | 说明 |
|------|------|------|
| `Project` | `ModelProject` | 当前激活的模型项目实例 |
| `Format` | `ModelFormat` | 当前激活的模型格式实例 |
| `Undo` | `UndoHistory` | 撤销/重做系统 |
| `isApp` | `boolean` | 是否为桌面端应用（与 `!Blockbench.isWeb` 等价） |
| `Pressing` | `{ shift: boolean, ctrl: boolean, alt: boolean }` | 当前按下的修饰键状态 |
| `Animator` | `object` | 全局动画器命名空间 |
| `Timeline` | `object` | 全局时间轴控制对象 |
| `Canvas` | `object` | Three.js 3D 场景管理 |
| `MenuBar` | `object` | 顶部菜单栏 |
| `Toolbox` | `Toolbar` | 工具箱工具栏 |
| `Formats` | `Record<string, ModelFormat>` | 所有已注册格式的索引 |
| `Codecs` | `Record<string, Codec>` | 所有已注册编解码器的索引 |
| `Panels` | `Record<string, Panel>` | 所有已注册面板的索引 |
| `Dialogs` | `Record<string, Dialog>` | 所有已创建对话框的索引 |

### Pressing 修饰键

```javascript
// 实时检测修饰键状态
if (Pressing.shift) {
    // Shift 键正在按下
}
if (Pressing.ctrl) {
    // Ctrl 键正在按下
}
if (Pressing.alt) {
    // Alt 键正在按下
}
```

---

## 8. 工具函数

### 图标节点

```javascript
/**
 * 获取图标的 DOM 节点
 * @param {string|boolean|HTMLElement} icon - 图标标识
 * @param {string} [color] - 可选颜色
 * @returns {HTMLElement}
 */
var iconNode = Blockbench.getIconNode('fa-cube', '#ff0000');
```

### 全局标志

```javascript
Blockbench.addFlag('debug_mode');
Blockbench.removeFlag('debug_mode');
if (Blockbench.hasFlag('debug_mode')) {
    // 调试模式启用
}
```

---

## 完整示例

```javascript
// 插件入口
Plugin.register('demo_plugin', {
    title: '演示插件',
    author: '开发者',
    icon: 'fa-star',
    variant: 'both',
    onload() {
        // 1. 环境检测
        if (Blockbench.isWeb) {
            Blockbench.showQuickMessage('运行在网页版');
        }

        // 2. 注入自定义样式
        Blockbench.addCSS('.demo-highlight { outline: 2px solid red; }');

        // 3. 监听事件
        Blockbench.on('new_project', function(data) {
            Blockbench.showStatusMessage('新项目已创建');
        });

        // 4. 检查版本
        if (Blockbench.isNewerThan('4.9.0')) {
            console.log('支持 4.9.0+ 特性');
        }
    },
    onunload() {
        // 清理操作
    }
});
```
