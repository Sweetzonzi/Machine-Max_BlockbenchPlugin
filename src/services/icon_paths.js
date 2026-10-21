// 文件: src/services/icon_paths.js
// 用途: 图标路径 / resource location / part.icon 三态的纯函数 planner
// 所属模块: MachineMax Blockbench 插件
//
// 本模块只处理字符串与布尔入参（targetExists），不 require fs，也不读 Blockbench 全局。
// 文件是否存在、写盘、zip 检测都由 src/services/icon_generator.js 负责。

'use strict';

var keys = require('../doc/keys.js');

var DEFAULT_NAMESPACE = 'machine_max';
var ICON_ROOT = 'textures/icon/';
var WINDOWS_DEVICE_RE = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/;

function normalizeNamespace(ns) {
    var value = String(ns || '').trim();
    return keys.isValidNamespace(value) ? value : DEFAULT_NAMESPACE;
}

/** 资源路径段 sanitize：小写、非法字符替换、拒绝空段/点段/Windows 设备名。 */
function sanitizeSegment(value) {
    var s = String(value == null ? '' : value).trim().toLowerCase();
    if (!s) return '';
    s = s.replace(/[^a-z0-9_.-]+/g, '_').replace(/_+/g, '_');
    s = s.replace(/^[._-]+|[._-]+$/g, '');
    if (!s || s === '.' || s === '..') return '';
    if (WINDOWS_DEVICE_RE.test(s.split('.')[0])) return '';
    return s.slice(0, 64);
}

/** 文件名 sanitize：确保带 .png，后缀本身不重复。 */
function sanitizeFileName(value) {
    var s = sanitizeSegment(value);
    if (!s) return '';
    if (!/\.png$/i.test(s)) s += '.png';
    return s;
}

/** resource path 安全性（不是磁盘 path.resolve；磁盘 containment 在 generator）。 */
function isSafeResourcePath(resourcePath) {
    var p = String(resourcePath || '');
    if (!p || p.charAt(0) === '/') return false;
    if (p.indexOf('\\') >= 0 || p.indexOf('..') >= 0 || p.indexOf(':') >= 0) return false;
    return true;
}

function parseResourceLocation(value) {
    var text = String(value == null ? '' : value).trim();
    if (!text || !keys.isValidResourceLocation(text)) return null;
    var index = text.indexOf(':');
    if (index <= 0) return null;
    return { namespace: text.slice(0, index), path: text.slice(index + 1) };
}

function isInIconRoot(value, namespace) {
    var parsed = parseResourceLocation(value);
    var ns = normalizeNamespace(namespace);
    return !!parsed && parsed.namespace === ns
        && parsed.path.indexOf(ICON_ROOT) === 0
        && isSafeResourcePath(parsed.path);
}

function classifyIcon(icon, namespace) {
    var text = String(icon == null ? '' : icon).trim();
    if (!text) return 'empty';
    var parsed = parseResourceLocation(text);
    if (!parsed) return 'external';
    var ns = normalizeNamespace(namespace);
    if (parsed.namespace !== ns) return 'external';
    if (parsed.path.indexOf(ICON_ROOT) !== 0) return 'external';
    return isSafeResourcePath(parsed.path) ? 'in_pack' : 'invalid';
}

function defaultPartTarget(options) {
    options = options || {};
    var ns = normalizeNamespace(options.namespace);
    var partId = sanitizeSegment(options.partId);
    if (!partId) return null;
    var folder = sanitizeSegment(options.folder) || sanitizeSegment(partId.split('_')[0]);
    if (!folder) return null;
    return ns + ':' + ICON_ROOT + folder + '/' + partId + '.png';
}

function defaultAssemblyTarget(options) {
    options = options || {};
    var ns = normalizeNamespace(options.namespace);
    var name = sanitizeSegment(options.name || 'assembly');
    if (!name) return null;
    var folder = sanitizeSegment(options.folder) || sanitizeSegment(name.split('_')[0]);
    if (!folder) return null;
    return ns + ':' + ICON_ROOT + folder + '/' + name + '.png';
}

function assemblyTargetWithCollision(options) {
    var base = defaultAssemblyTarget(options);
    if (!base) return null;
    var reserved = Array.isArray(options.reservedPaths) ? options.reservedPaths : [];
    if (reserved.indexOf(base) < 0) return base;
    var name = sanitizeSegment(options.name || 'assembly');
    var folder = sanitizeSegment(options.folder) || sanitizeSegment(name.split('_')[0]);
    var candidate;
    for (var i = 0; i < 20; i++) {
        var suffix = i === 0 ? '_assembly' : '_assembly_' + (i + 1);
        candidate = normalizeNamespace(options.namespace) + ':' + ICON_ROOT
            + folder + '/' + name + suffix + '.png';
        if (reserved.indexOf(candidate) < 0) return candidate;
    }
    return base;
}

/**
 * 解析目标路径。优先沿用已有本包 icon；空/外部/非法则走默认路径。
 * assembly 会检测与 reservedPaths 的碰撞并改名。
 *
 * @returns {{ok:boolean,target?:string,iconState?:string,collision?:boolean,folder?:string,fileName?:string,error?:string}}
 */
function resolveTarget(options) {
    options = options || {};
    var kind = options.kind === 'assembly' ? 'assembly' : 'part';
    var ns = normalizeNamespace(options.namespace);
    var icon = String(options.icon == null ? '' : options.icon).trim();
    var iconState = classifyIcon(icon, ns);

    if (iconState === 'invalid') {
        return { ok: false, error: 'part.icon 路径包含不安全的 .. 或反斜杠，已跳过', iconState: iconState };
    }

    var target;
    var collision = false;
    if (kind === 'assembly') {
        target = assemblyTargetWithCollision(options);
        collision = !!target && Array.isArray(options.reservedPaths)
            && options.reservedPaths.indexOf(defaultAssemblyTarget(options)) >= 0
            && target !== defaultAssemblyTarget(options);
    } else if (iconState === 'in_pack') {
        target = icon;
    } else {
        target = defaultPartTarget(options);
    }

    if (!target) {
        return { ok: false, error: '无法生成合法的图标路径', iconState: iconState };
    }
    var parsed = parseResourceLocation(target);
    if (!parsed || parsed.namespace !== ns || parsed.path.indexOf(ICON_ROOT) !== 0) {
        return { ok: false, error: '图标路径不在本包 textures/icon/ 下', iconState: iconState };
    }
    var fileName = parsed.path.slice(parsed.path.lastIndexOf('/') + 1);
    var folder = parsed.path.slice(ICON_ROOT.length, parsed.path.lastIndexOf('/'));
    return {
        ok: true,
        target: target,
        iconState: iconState,
        collision: collision,
        folder: folder,
        fileName: fileName,
    };
}

/**
 * 依据目标文件是否存在、是否覆盖、是否改写外部字段，给出文件/字段动作。
 *
 * @param {Object} options
 * @param {string} options.target - 已解析的 resource location
 * @param {string} [options.kind] - part / assembly
 * @param {string} [options.icon] - 原 part.icon
 * @param {string} [options.namespace]
 * @param {boolean} [options.targetExists]
 * @param {boolean} [options.overwrite]
 * @param {boolean} [options.rewriteExternalIcon]
 * @returns {{target,iconState,fileAction,fieldAction,fieldChanged,status,reason}}
 */
function planIcon(options) {
    options = options || {};
    var target = options.target || resolveTarget(options).target;
    var kind = options.kind === 'assembly' ? 'assembly' : 'part';
    var ns = normalizeNamespace(options.namespace);
    var iconState = options.iconState || classifyIcon(options.icon, ns);
    var targetExists = options.targetExists === true;
    var overwrite = options.overwrite === true;
    var rewrite = options.rewriteExternalIcon === true;

    if (!target) {
        return {
            target: '', iconState: iconState, fileAction: 'none', fieldAction: 'keep',
            fieldChanged: false, status: 'failed', reason: '没有合法目标路径',
        };
    }

    if (kind === 'assembly') {
        if (targetExists && !overwrite) {
            return { target: target, iconState: iconState, fileAction: 'skip', fieldAction: 'none', fieldChanged: false, status: 'skipped', reason: '目标文件已存在，未勾选覆盖' };
        }
        return {
            target: target, iconState: iconState, fileAction: 'write', fieldAction: 'none',
            fieldChanged: false, status: targetExists ? 'overwritten' : 'created',
            reason: targetExists ? '重写已有装配体图标' : '新建装配体图标',
        };
    }

    if (iconState === 'empty') {
        if (targetExists && !overwrite) {
            return { target: target, iconState: iconState, fileAction: 'none', fieldAction: 'set', fieldChanged: true, status: 'linked', reason: '字段为空，只关联已有文件' };
        }
        return { target: target, iconState: iconState, fileAction: 'write', fieldAction: 'set', fieldChanged: true, status: 'created', reason: '字段为空，写入并关联' };
    }

    if (iconState === 'in_pack') {
        if (targetExists && !overwrite) {
            return { target: target, iconState: iconState, fileAction: 'skip', fieldAction: 'keep', fieldChanged: false, status: 'skipped', reason: '沿用本包路径，目标文件已存在且未覆盖' };
        }
        return { target: target, iconState: iconState, fileAction: 'write', fieldAction: 'keep', fieldChanged: false, status: 'overwritten', reason: '沿用本包路径，重写文件但不改字段' };
    }

    // 外部 / 非 textures/icon/ 引用
    if (targetExists && !overwrite) {
        if (rewrite) {
            return { target: target, iconState: iconState, fileAction: 'none', fieldAction: 'set', fieldChanged: true, status: 'linked', reason: '外部字段改写为已有本包文件，不写盘' };
        }
        return { target: target, iconState: iconState, fileAction: 'skip', fieldAction: 'keep', fieldChanged: false, status: 'skipped', reason: '目标文件已存在且未覆盖' };
    }
    if (rewrite) {
        return { target: target, iconState: iconState, fileAction: 'write', fieldAction: 'set', fieldChanged: true, status: 'overwritten', reason: '外部字段改写为本包路径并写文件' };
    }
    return { target: target, iconState: iconState, fileAction: 'write', fieldAction: 'keep', fieldChanged: false, status: 'unrewritten', reason: '文件已生成/覆盖，外部字段未改写' };
}

module.exports = {
    DEFAULT_NAMESPACE: DEFAULT_NAMESPACE,
    ICON_ROOT: ICON_ROOT,
    normalizeNamespace: normalizeNamespace,
    sanitizeSegment: sanitizeSegment,
    sanitizeFileName: sanitizeFileName,
    isSafeResourcePath: isSafeResourcePath,
    parseResourceLocation: parseResourceLocation,
    isInIconRoot: isInIconRoot,
    classifyIcon: classifyIcon,
    defaultPartTarget: defaultPartTarget,
    defaultAssemblyTarget: defaultAssemblyTarget,
    resolveTarget: resolveTarget,
    planIcon: planIcon,
};
