// 文件: src/doc/keys.js
// 用途: 配置 key 规范的唯一实现（docs/13 §5.1.3 / D16 / D17 / D25）
// 所属模块: MachineMax Blockbench 插件
//
// 本模块是纯函数层：不 require Blockbench / Vue，不读写全局状态。
// `isValidPartId` 只做字符集与长度；`isSafePartId` 额外做路径安全判据。
// 写入口只允许调用 `isSafePartId`（经 ops 接入），导出侧也要再断言一次。

'use strict';

// ── 正则（唯一真源）────────────────────────────────────────────
var PART_ID_RE = /^[a-z0-9_.-]{1,128}$/;
var VARIANT_NAME_RE = /^[A-Za-z0-9_.-]{1,128}$/;
var NAME_SEGMENT_RE = /^[A-Za-z0-9_.-]{1,128}$/;
var NAMESPACE_RE = /^[a-z0-9_-]+$/;
var RESOURCE_LOCATION_RE = /^[a-z0-9_.-]+:[a-z0-9_./-]+$/;

// Windows 保留设备名（大小写不敏感，取第一个点之前的段）
var WINDOWS_DEVICE_RE = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/;

// 翻译键前缀（interact_box 的 key 前缀是 interact，不是 interact_box）
var TRANSLATION_PREFIX = {
    interact_box: 'interact',
    connector: 'connector',
    subsystem: 'subsystem',
};

// map 层名 → 该层 key 的类别
var MAP_KEY_KIND = {
    parts: 'partId',
    variants: 'variantName',
    sub_parts: 'subPartKey',
    hit_boxes: 'hitBoxKey',
    interact_boxes: 'interactBoxKey',
    connectors: 'connectorKey',
    subsystems: 'subsystemKey',
    hydrodynamics: 'hydrodynamicKey',
    textures: 'textureKey',
    signal_targets: 'channelKey',
    signal_translations: 'channelKey',
    power_outputs: 'powerOutputKey',
    projectile_types: 'projectileTypeKey',
    overwrite: 'objectField',
};

function isString(v) {
    return typeof v === 'string';
}

function hasReservedWildcard(v) {
    return isString(v) && v.indexOf('*') >= 0;
}

/**
 * 名称段：非空、1–128、`[A-Za-z0-9_.-]`、不以 `.` 开头/结尾。
 * 子零件名称段、翻译键名称段、纹理/频道名共用。
 */
function isValidNameSegment(name) {
    if (!isString(name)) return false;
    if (name.length < 1 || name.length > 128) return false;
    if (!NAME_SEGMENT_RE.test(name)) return false;
    if (name.charAt(0) === '.' || name.charAt(name.length - 1) === '.') return false;
    return true;
}

function isValidNamespace(ns) {
    return isString(ns) && NAMESPACE_RE.test(ns);
}

/** partId 只做字符集 + 长度；路径安全见 isSafePartId。 */
function isValidPartId(partId) {
    return isString(partId) && PART_ID_RE.test(partId);
}

function isValidVariantName(name) {
    return isString(name) && VARIANT_NAME_RE.test(name);
}

/** 弹种资源地址：允许 `:` `/`，要求小写。 */
function isValidResourceLocation(value) {
    return isString(value) && RESOURCE_LOCATION_RE.test(value);
}

function isWindowsDeviceName(value) {
    if (!isString(value)) return false;
    var base = value.split('.')[0].toLowerCase();
    return WINDOWS_DEVICE_RE.test(base);
}

/**
 * 单个 partId 值（完整文件名或 split('_')[0] 目录段）的路径安全判据：
 * 拒绝 `.` / `..` / 首尾点 / Windows 设备名。
 */
function isSafePartIdSegment(value) {
    if (!isString(value) || value.length === 0) return false;
    if (value === '.' || value === '..') return false;
    if (value.charAt(0) === '.' || value.charAt(value.length - 1) === '.') return false;
    if (isWindowsDeviceName(value)) return false;
    return true;
}

/**
 * partId 的完整判据：字符集 + 路径安全。
 * 文件名为完整值；flat_export:false 时目录段是 split('_')[0]，两者都查。
 */
function isSafePartId(partId) {
    if (!isValidPartId(partId)) return false;
    if (!isSafePartIdSegment(partId)) return false;
    if (!isSafePartIdSegment(partId.split('_')[0])) return false;
    return true;
}

/** 子零件规范 key：`sub_part.<namespace>.<name>`。 */
function isValidSubPartKey(key, namespace) {
    if (!isString(key) || !isValidNamespace(namespace)) return false;
    var prefix = 'sub_part.' + namespace + '.';
    if (key.indexOf(prefix) !== 0) return false;
    return isValidNameSegment(key.slice(prefix.length));
}

/** 解析子零件 key；格式不符返回 null。 */
function parseSubPartKey(key) {
    if (!isString(key) || key.indexOf('sub_part.') !== 0) return null;
    var rest = key.slice('sub_part.'.length);
    var dot = rest.indexOf('.');
    if (dot < 0) return { namespace: '', name: rest };
    return { namespace: rest.slice(0, dot), name: rest.slice(dot + 1) };
}

/** 翻译键的规范前缀形态（只告警，不阻断）。 */
function isCanonicalTranslationKey(kind, key, namespace) {
    var prefix = TRANSLATION_PREFIX[kind];
    if (!prefix || !isString(key) || !isValidNamespace(namespace)) return false;
    var head = prefix + '.' + namespace + '.';
    if (key.indexOf(head) !== 0) return false;
    return isValidNameSegment(key.slice(head.length));
}

/** 取最后一个点之后的名称段（翻译键 / 普通 map key 共用）。 */
function nameSegmentOf(key) {
    if (!isString(key)) return '';
    var dot = key.lastIndexOf('.');
    return dot < 0 ? key : key.slice(dot + 1);
}

function fail(code, expected, got, hint) {
    return { ok: false, code: code, expected: expected, got: got, hint: hint || '' };
}

function ok(warning, expected, hint) {
    var result = { ok: true };
    if (warning) result.warning = warning;
    if (expected) result.expected = expected;
    if (hint) result.hint = hint;
    return result;
}

/**
 * 校验单个 map key。
 *
 * @param {string} map - map 层名（parts / variants / sub_parts / ...）
 * @param {string} key
 * @param {object} [ctx] - { namespace }
 * @returns {{ok:boolean, code?:string, expected?:string, got?:*, hint?:string, warning?:string}}
 */
function validateMapKey(map, key, ctx) {
    ctx = ctx || {};
    if (!isString(key)) {
        return fail('invalid_format', 'string', key, '配置 key 必须是字符串');
    }
    if (hasReservedWildcard(key)) {
        return fail('key_reserved', '不含 * 的 key', key,
            '`*` 是路径通配符，不能作为字面 key；创建/重命名时请换一个名字');
    }

    var kind = MAP_KEY_KIND[map];
    if (!kind) {
        return fail('unknown_field', '已知 map 层', map, '未知的 map 层');
    }

    var ns = isValidNamespace(ctx.namespace) ? ctx.namespace : 'machine_max';
    var result;

    switch (kind) {
        case 'partId':
            if (!isValidPartId(key)) {
                return fail('invalid_format', '^[a-z0-9_.-]{1,128}$', key,
                    'partId 只允许小写 ASCII 字母、数字、`_`、`.`、`-`，长度 1–128');
            }
            if (!isSafePartId(key)) {
                return fail('invalid_format', 'path-safe partId', key,
                    'partId 不能是 `.` / `..`、不能以点开头或结尾、不能是 Windows 设备名（con/prn/aux/nul/com1-9/lpt1-9）；目录段 split("_")[0] 也要满足');
            }
            return ok();

        case 'variantName':
            if (!isValidVariantName(key)) {
                return fail('invalid_format', '^[A-Za-z0-9_.-]{1,128}$', key,
                    '变体名只允许 ASCII 字母、数字、`_`、`.`、`-`，长度 1–128');
            }
            return ok();

        case 'subPartKey':
            if (!isValidSubPartKey(key, ns)) {
                return fail('invalid_format', 'sub_part.' + ns + '.<name>', key,
                    '子零件 key 必须是 `sub_part.' + ns + '.<name>`，name 为 1–128 位 ASCII 字母/数字/`_`/`.`/`-`，且不以点开头或结尾');
            }
            return ok();

        case 'interactBoxKey':
        case 'connectorKey':
        case 'subsystemKey':
            result = validateTranslationKey(map === 'interact_boxes' ? 'interact_box'
                : (map === 'connectors' ? 'connector' : 'subsystem'), key, ns);
            return result;

        case 'textureKey':
        case 'channelKey':
        case 'powerOutputKey':
            if (!isValidNameSegment(key)) {
                return fail('invalid_format', '^[A-Za-z0-9_.-]{1,128}$', key,
                    '名称段只允许 ASCII 字母、数字、`_`、`.`、`-`，长度 1–128，且不以点开头或结尾');
            }
            return ok();

        case 'projectileTypeKey':
            if (!isValidResourceLocation(key)) {
                return fail('invalid_format', '^[a-z0-9_.-]+:[a-z0-9_./-]+$', key,
                    '弹种 key 是资源地址（如 machine_max:30mm_ap），要求小写，可含 `:` 与 `/`');
            }
            return ok();

        case 'hitBoxKey':
            if (key.length === 0) {
                return fail('invalid_format', '非空骨骼名', key,
                    'hit_boxes 的 key 是模型元素名，不能为空字符串');
            }
            return ok();

        case 'hydrodynamicKey':
            // 空字符串表示质心，是合法 key
            return ok();

        case 'objectField':
            if (key.length === 0) {
                return fail('invalid_format', '非空对象字段名', key, '对象字段名不能为空');
            }
            return ok();

        default:
            return fail('unknown_field', '已知 key 类别', map, '未知的 key 类别');
    }
}

/**
 * 翻译键的字符集强制 ASCII；前缀形态不合规范只返回 warning `non_canonical_key`。
 */
function validateTranslationKey(kind, key, namespace) {
    var prefix = TRANSLATION_PREFIX[kind];
    if (!prefix) {
        return fail('unknown_field', '已知翻译键类别', kind, '未知的翻译键类别');
    }
    var expected = prefix + '.<namespace>.<name>';

    // 完整 key 必须是 ASCII、无空白、无 `* / ~ :`；允许点作为分隔符。
    if (key.length === 0) {
        return fail('invalid_format', expected, key, '翻译键不能为空');
    }
    if (!NAME_SEGMENT_RE.test(key)) {
        return fail('invalid_format', expected, key,
            '翻译键只允许 ASCII 字母、数字、`_`、`.`、`-`；中文、空白、`*`、`/`、`~`、`:` 一律拒绝');
    }
    if (key.charAt(0) === '.' || key.charAt(key.length - 1) === '.') {
        return fail('invalid_format', expected, key, '翻译键不能以点开头或结尾');
    }
    var name = nameSegmentOf(key);
    if (!isValidNameSegment(name)) {
        return fail('invalid_format', expected, key,
            '翻译键的名称段必须是 1–128 位 ASCII 字母/数字/`_`/`.`/`-`，且不以点开头或结尾');
    }
    if (!isCanonicalTranslationKey(kind, key, namespace)) {
        return ok('non_canonical_key', expected,
            '翻译键前缀不是 `' + expected + '`；仅告警，不阻断');
    }
    return ok();
}

/** 判断 map key 是否合法（只返回布尔）。 */
function isValidMapKey(map, key, ctx) {
    return validateMapKey(map, key, ctx).ok;
}

// ── 子零件 key 迁移（docs/13 §15.1）────────────────────────────

/**
 * 提取子零件名称段：
 *   sub_part.old.chassis → chassis
 *   sub_part.chassis     → chassis
 *   chassis / default    → 原样
 */
function extractSubPartName(key) {
    if (!isString(key)) return '';
    if (key.indexOf('sub_part.') !== 0) return key;
    var rest = key.slice('sub_part.'.length);
    var dot = rest.indexOf('.');
    return dot < 0 ? rest : rest.slice(dot + 1);
}

function nextLegacyName(usedNames) {
    var n = 1;
    while (usedNames && usedNames.indexOf('legacy_' + n) >= 0) n++;
    return 'legacy_' + n;
}

function subPartKeyOf(namespace, name) {
    return 'sub_part.' + namespace + '.' + name;
}

function truncateNameForSuffix(name, suffix) {
    var max = 128 - suffix.length;
    if (max < 1) return '';
    var out = name.slice(0, max);
    while (out.length > 0 && out.charAt(out.length - 1) === '.') out = out.slice(0, -1);
    return out;
}

/**
 * 对候选 key 做唯一化：冲突时追加 `_2`、`_3`…；超长则截短名称段。
 * `usedKeys` / `usedNames` 由调用方在成功后追加。
 */
function uniqueSubPartKey(candidate, usedKeys, usedNames) {
    usedKeys = usedKeys || [];
    usedNames = usedNames || [];
    if (usedKeys.indexOf(candidate) < 0) return candidate;

    var parsed = parseSubPartKey(candidate);
    var ns = parsed && parsed.namespace ? parsed.namespace : 'machine_max';
    var name = parsed ? parsed.name : candidate;
    var n = 2;
    while (n < 10000) {
        var suffix = '_' + n;
        var base = truncateNameForSuffix(name, suffix);
        if (base.length === 0) {
            base = nextLegacyName(usedNames);
        }
        var next = subPartKeyOf(ns, base + suffix);
        if (usedKeys.indexOf(next) < 0) return next;
        n++;
    }
    return subPartKeyOf(ns, nextLegacyName(usedNames));
}

/**
 * 把任意子零件 key 归一化为规范 key（不修改入参，不写配置）。
 * 已规范 → 原样；裸 default → main；非法名称段 → legacy_<n>；冲突 → _2。
 */
function canonicalSubPartKey(key, namespace, usedKeys, usedNames) {
    var ns = isValidNamespace(namespace) ? namespace : 'machine_max';
    usedKeys = usedKeys || [];
    usedNames = usedNames || [];

    if (isValidSubPartKey(key, ns)) return key;

    var name = extractSubPartName(key);
    if (name === 'default') name = 'main';
    if (!isValidNameSegment(name)) name = nextLegacyName(usedNames);

    return uniqueSubPartKey(subPartKeyOf(ns, name), usedKeys, usedNames);
}

// ── 递归 key 校验（projection.in / setField / validateTree 共用）──

var CONTAINER_MAPS = {
    config: ['parts'],
    part: ['variants'],
    variant: ['sub_parts'],
    sub_part: ['hit_boxes', 'interact_boxes', 'connectors', 'subsystems'],
};

// 值 map：字段本身不是容器，但 key 仍受 §5.1.3 约束。
var VALUE_MAPS = {
    variant: ['textures'],
    sub_part: ['hydrodynamics'],
    interact_box: ['signal_targets'],
    connector: ['signal_targets', 'signal_translations'],
    subsystem: ['signal_targets', 'signal_translations', 'power_outputs', 'projectile_types'],
};

function childKindForMap(map) {
    switch (map) {
        case 'parts': return 'part';
        case 'variants': return 'variant';
        case 'sub_parts': return 'sub_part';
        case 'hit_boxes': return 'hit_box';
        case 'interact_boxes': return 'interact_box';
        case 'connectors': return 'connector';
        case 'subsystems': return 'subsystem';
        default: return null;
    }
}

/**
 * 递归校验一个节点下所有 map key。
 *
 * @param {string} kind - part | variant | sub_part | hit_box | interact_box | connector | subsystem
 * @param {object} node
 * @param {object} [ctx] - { namespace, path }
 * @returns {{ok:boolean, errors:Array, warnings:Array}}
 */
function validateKeys(kind, node, ctx) {
    ctx = ctx || {};
    var namespace = isValidNamespace(ctx.namespace) ? ctx.namespace : 'machine_max';
    var basePath = Array.isArray(ctx.path) ? ctx.path.slice() : [];
    var errors = [];
    var warnings = [];

    function visit(currentKind, current, path) {
        if (!current || typeof current !== 'object' || Array.isArray(current)) return;

        var maps = CONTAINER_MAPS[currentKind] || [];
        for (var i = 0; i < maps.length; i++) {
            var map = maps[i];
            var entries = current[map];
            if (!entries || typeof entries !== 'object' || Array.isArray(entries)) continue;
            var keys = Object.keys(entries);
            for (var j = 0; j < keys.length; j++) {
                var key = keys[j];
                var result = validateMapKey(map, key, { namespace: namespace });
                if (!result.ok) {
                    errors.push({
                        path: path.concat([map, key]),
                        code: result.code,
                        expected: result.expected,
                        got: key,
                        hint: result.hint,
                    });
                    continue;
                }
                if (result.warning === 'non_canonical_key') {
                    warnings.push({
                        path: path.concat([map, key]),
                        code: 'non_canonical_key',
                        expected: result.expected,
                        got: key,
                        hint: result.hint,
                    });
                }
                var child = entries[key];
                var childKind = childKindForMap(map);
                if (childKind && child && typeof child === 'object') {
                    visit(childKind, child, path.concat([map, key]));
                }
            }
        }

        var valueMaps = VALUE_MAPS[currentKind] || [];
        for (var vi = 0; vi < valueMaps.length; vi++) {
            var valueMap = valueMaps[vi];
            var valueEntries = current[valueMap];
            if (!valueEntries || typeof valueEntries !== 'object' || Array.isArray(valueEntries)) continue;
            var valueKeys = Object.keys(valueEntries);
            for (var vj = 0; vj < valueKeys.length; vj++) {
                var vKey = valueKeys[vj];
                if (valueMap === 'projectile_types' && vKey.indexOf('__new_p_') === 0) continue;
                var valueResult = validateMapKey(valueMap, vKey, { namespace: namespace });
                if (!valueResult.ok) {
                    errors.push({
                        path: path.concat([valueMap, vKey]),
                        code: valueResult.code,
                        expected: valueResult.expected,
                        got: vKey,
                        hint: valueResult.hint,
                    });
                }
            }
        }
    }

    visit(kind, node, basePath);

    return { ok: errors.length === 0, errors: errors, warnings: warnings };
}

module.exports = {
    // 正则 / 基础判据
    PART_ID_RE: PART_ID_RE,
    VARIANT_NAME_RE: VARIANT_NAME_RE,
    NAME_SEGMENT_RE: NAME_SEGMENT_RE,
    NAMESPACE_RE: NAMESPACE_RE,
    RESOURCE_LOCATION_RE: RESOURCE_LOCATION_RE,
    TRANSLATION_PREFIX: TRANSLATION_PREFIX,
    MAP_KEY_KIND: MAP_KEY_KIND,

    isValidNameSegment: isValidNameSegment,
    isValidNamespace: isValidNamespace,
    isValidPartId: isValidPartId,
    isSafePartId: isSafePartId,
    isSafePartIdSegment: isSafePartIdSegment,
    isValidVariantName: isValidVariantName,
    isValidResourceLocation: isValidResourceLocation,
    isValidSubPartKey: isValidSubPartKey,
    parseSubPartKey: parseSubPartKey,
    isCanonicalTranslationKey: isCanonicalTranslationKey,
    validateMapKey: validateMapKey,
    validateTranslationKey: validateTranslationKey,
    isValidMapKey: isValidMapKey,

    // 迁移
    extractSubPartName: extractSubPartName,
    canonicalSubPartKey: canonicalSubPartKey,
    uniqueSubPartKey: uniqueSubPartKey,
    nextLegacyName: nextLegacyName,

    // 递归
    validateKeys: validateKeys,
};
