/**
 * builtin_lang.js — 内置包 lang 词条的只读视图
 *
 * 构建时 `scripts/build.js` 把 `src/builtin/builtin/machine_max/lang/*.json`
 * 注入成 `__BUILTIN_LANG__`（`{ zh_cn: {...}, en_us: {...} }`）。测试与开发
 * 环境没有该常量时按空表处理，不影响其它逻辑。
 *
 * 用途只有一处：lang 生成器判断某条 `machine_max` 共享词条是否已由内置包提供。
 * 作者新建的连接点/子系统键默认落在 `machine_max` 命名空间，这些条目（如
 * `connector.machine_max.hull_left_road_wheel_01` 的「左第 1 路轮轮毂」）不该被
 * 插件用 `_toDisplayName` 生成的英文直译覆盖。
 */

'use strict';

var DATA = (typeof __BUILTIN_LANG__ !== 'undefined' && __BUILTIN_LANG__) || {};

/** 取某语言的词条表（拿不到返回空对象）。 */
function langOf(locale) {
    var map = DATA && DATA[locale];
    return (map && typeof map === 'object') ? map : {};
}

/** 内置包是否提供了该语言下的这条翻译键。 */
function hasKey(locale, key) {
    var map = langOf(locale);
    return Object.prototype.hasOwnProperty.call(map, key);
}

/** 内置包该语言的词条数（调试 / 统计用）。 */
function keyCount(locale) {
    return Object.keys(langOf(locale)).length;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        langOf: langOf,
        hasKey: hasKey,
        keyCount: keyCount,
        /** 原始数据（测试注入用，生产只读） */
        raw: DATA,
    };
}
