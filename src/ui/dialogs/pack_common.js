/**
 * pack_common.js — 内容包对话框公共工具（从 pack_setup_dialog.js 拆出）
 *
 * 打开/切换内容包的两条入口（"打开已有内容包"对话框、项目管理对话框）共用
 * `applyPackPath`：校验 meta.json → 按 meta.dependencies 在内容包父目录解析
 * 依赖 → 用一条撤销记录写入。
 */

var path = require('path');
var packService = require('../../services/pack.js');
var ops = require('../../ops/index.js');

/**
 * 依赖类型列表（Spark-Core DependencyType）
 */
var DEP_TYPES = ['hard', 'soft', 'override', 'conflict'];

/**
 * 依赖类型中文标签
 */
var DEP_TYPE_LABELS = {
    hard: '硬依赖 (必需)',
    soft: '软依赖 (可选)',
    override: '覆盖 (替换)',
    conflict: '冲突 (不兼容)',
};

/**
 * 检查 config 对象是否有效
 * @param {Object} config - MM 项目配置
 * @returns {boolean} 有效返回 true
 */
function isConfigValid(config) {
    return config && typeof config === 'object';
}

/**
 * 将字符串转为安全的文件夹名
 * 替换空格和非法字符为下划线，限制长度 64
 * @param {string} name - 原始名称
 * @returns {string} 安全文件夹名
 */
function sanitizeFolderName(name) {
    if (!name) return '';
    return String(name).replace(/[<>:"/\\|?*\s]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').substring(0, 64);
}

// =============================================================================
// 打开 / 切换内容包
// =============================================================================

/** 未解析依赖提示里最多列出的 id 数 */
var MAX_LISTED_UNRESOLVED = 5;

/**
 * 构造"依赖未全部解析"的提示文案
 *
 * @param {Array<{id: string}>} unresolved - 未解析的依赖
 * @param {string} searchedDir - 实际搜索的父目录
 * @returns {string}
 */
function buildUnresolvedMessage(unresolved, searchedDir) {
    var ids = [];
    var listed;
    var i;
    for (i = 0; i < unresolved.length && i < MAX_LISTED_UNRESOLVED; i++) {
        if (unresolved[i] && unresolved[i].id) ids.push(unresolved[i].id);
    }
    listed = ids.join('、');
    if (unresolved.length > ids.length) {
        listed += ' 等 ' + unresolved.length + ' 个';
    }
    return '有 ' + unresolved.length + ' 个依赖未能在 "' + searchedDir +
        '" 下找到：' + listed +
        '。请先放入同级目录，或在 MachineMax 菜单 → 内容包设置 → 管理依赖包 中手动选择。';
}

/**
 * 解析出的依赖该怎样写回 config.dependencyPaths
 *
 * - 包没声明任何（非内置）依赖 → 清空，避免残留上一个包的依赖路径
 * - 部分/全部解析到 → 用解析结果替换（即"这个包的依赖集合"）
 * - 声明了但一条都没解析到 → undefined（不动原依赖，交给 warning toast 让用户手动选）
 *
 * @param {{declaredCount: number, paths: string[]}} resolution
 * @returns {string[]|undefined}
 */
function dependencyPathsFor(resolution) {
    if (!resolution) return undefined;
    if (resolution.declaredCount === 0) return [];
    if (resolution.paths.length > 0) return resolution.paths;
    return undefined;
}

/**
 * 打开 / 切换内容包：校验 → 解析依赖 → 单条撤销记录写入
 *
 * 依赖解析范围是内容包父目录（同级目录 / ZIP）；`machine_max:builtin` 由插件
 * 内置提供，不解析成本地路径。路径与依赖写进同一条撤销记录，Ctrl+Z 一次回到
 * 打开前，不会出现「新包 + 旧依赖」的中间态。
 *
 * `strict: false` 时，路径无效也照旧写入（保留"先填路径、稍后再补 meta.json"
 * 的旧行为），但不改动依赖。
 *
 * @param {Object} config - MM 项目配置
 * @param {string} dirPath - 内容包根目录 / ZIP 路径
 * @param {Object} [options]
 * @param {boolean} [options.strict=false] - 路径无效时是否拒绝（不写入）
 * @param {string} [options.label] - 撤销记录标签
 * @returns {{ok: boolean, valid: boolean, error: string|null,
 *            meta: Object|null, namespace: string, parentDir: string,
 *            resolution: Object|null, dependencyPaths: string[]|undefined}}
 */
function applyPackPath(config, dirPath, options) {
    options = options || {};
    var label = options.label || '打开内容包';
    var targetPath = dirPath ? String(dirPath).trim() : '';
    var empty = {
        ok: true, valid: false, error: null, meta: null, namespace: '',
        parentDir: '', resolution: null, dependencyPaths: undefined,
    };

    // 清空路径：只清路径，不动其他字段（与旧行为一致）
    if (!targetPath) {
        ops.setContentPackPath(config, '');
        return empty;
    }

    var opened = packService.openPack(targetPath);
    if (!opened.valid) {
        if (options.strict) {
            empty.ok = false;
            empty.error = opened.error || null;
            return empty;
        }
        ops.setContentPackPath(config, targetPath);
        empty.error = opened.error || null;
        return empty;
    }

    var meta = opened.meta || {};
    var parentDir = path.dirname(path.resolve(targetPath));
    var resolution = packService.resolveDeclaredDependencies(
        meta.dependencies || [],
        parentDir,
        { selfId: meta.id, selfPath: targetPath }
    );
    var depPaths = dependencyPathsFor(resolution);

    var result = ops.setContentPack(config, {
        path: targetPath,
        namespace: opened.namespace || '',
        meta: meta,
        dependencyPaths: depPaths,
        label: label,
    });

    return {
        ok: !!(result && result.ok),
        valid: true,
        error: (result && result.error) || null,
        meta: meta,
        namespace: opened.namespace || '',
        parentDir: parentDir,
        resolution: resolution,
        dependencyPaths: depPaths,
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEP_TYPES,
        DEP_TYPE_LABELS,
        isConfigValid,
        sanitizeFolderName,
        MAX_LISTED_UNRESOLVED,
        buildUnresolvedMessage,
        dependencyPathsFor,
        applyPackPath,
    };
}
