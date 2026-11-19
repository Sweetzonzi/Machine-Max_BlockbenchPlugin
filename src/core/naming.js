/**
 * 命名工具模块
 *
 * 提供默认名称生成、snake_case 转换、唯一性校验等函数。
 * 所有名称均使用翻译键格式（如 sub_part.machine_max.main），
 * 与内容包 JSON 的 key 一致。名称即字典 key，不引入独立 id 字段。
 */
var { createLogger } = require('../utils/logger.js');

var log = createLogger('Naming');

/** 新建实体的默认键命名空间：跨包共享词汇（译名由内置包的 lang 提供） */
var DEFAULT_NAMESPACE = 'machine_max';

/**
 * 将 PascalCase 或 camelCase 字符串转换为 snake_case
 * "LeftFrontWheel" → "left_front_wheel"
 */
function toSnakeCase(str) {
    if (!str) return '';
    return str
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_/, '');
}

/**
 * 根据实体类型和上下文生成默认名称（翻译键格式）
 *
 * 默认命名空间是共享词汇 `machine_max`：上游车辆包把跨包通用的结构名字
 * （挂点 / 轴 / 轮座 / 大多数子系统与交互区名）都放在这个命名空间下，译名由
 * 内置包的 lang 提供；只有本包专属的机构才用自己的导出命名空间。调用方
 * **省略** `context.namespace` 即可拿到这个默认值，不要传 `config.namespace`。
 *
 * @param {'sub_part'|'connector'|'interact_box'|'subsystem'} entityType - 实体类型
 * @param {Object} context - 生成上下文
 * @param {string} [context.namespace='machine_max'] - 命名空间（默认共享词汇）
 * @param {string} [context.boneName] - 骨骼/Locator 名称（用于 connector/interact_box）
 * @param {string} [context.typeShortName] - type 短名（用于 subsystem）
 * @returns {string} 默认名称
 */
function generateDefaultName(entityType, context) {
    var ns = (context && context.namespace) || DEFAULT_NAMESPACE;

    switch (entityType) {
        case 'sub_part':
            return 'sub_part.' + ns + '.main';

        case 'connector':
            var locName = context.boneName || 'connector';
            return 'connector.' + ns + '.' + toSnakeCase(locName);

        case 'interact_box':
            var boneName = context.boneName || 'interact';
            return 'interact.' + ns + '.' + toSnakeCase(boneName);

        case 'subsystem':
            var shortName = context.typeShortName || 'subsystem';
            return 'subsystem.' + ns + '.' + shortName;

        default:
            return '';
    }
}

/** 信号保留地址：不得用作连接点 / 子系统 / 交互区名（Part 级按名寻址） */
var RESERVED_SIGNAL_NAMES = ['local', 'global'];

/** 名字类别 → 子零件内的容器字段 */
var NAME_CONTAINERS = {
    connector: 'connectors',
    interact_box: 'interact_boxes',
    subsystem: 'subsystems',
};

function _own(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * 在变体内按名找条目（三类名字的唯一性判据：作用域是整个 Part，跨全部子零件）。
 *
 * 三类名字共用一套命名空间：上游 `VariantAttr#validateUniqueNames` 用一张表判重，
 * 覆盖 `subsystem.*` / `connector.*` / `interact.*` 三种前缀，所以这里也跨种类查
 * （正常名字自带类型前缀、不会互相撞；写错前缀的名字则会撞上）。
 *
 * @param {Object} variant - 当前变体配置
 * @param {string} name - 完整键
 * @param {{subPartKey?:string, excludeKey?:string}} [options]
 *   排除「正在编辑的自身」：同一子零件里的同名条目不算冲突
 * @returns {{subPartKey:string, kind:string, key:string}|null} 命中的条目；没有冲突时 null
 */
function findNamedEntry(variant, name, options) {
    if (!variant || !variant.sub_parts || !name) return null;
    var opts = options || {};
    var spKeys = Object.keys(variant.sub_parts);
    var kinds = Object.keys(NAME_CONTAINERS);
    for (var i = 0; i < spKeys.length; i++) {
        var spKey = spKeys[i];
        var sp = variant.sub_parts[spKey];
        if (!sp) continue;
        for (var k = 0; k < kinds.length; k++) {
            var kind = kinds[k];
            var map = sp[NAME_CONTAINERS[kind]];
            if (!map || !_own(map, name)) continue;
            if (opts.subPartKey === spKey && opts.excludeKey === name) continue;
            return { subPartKey: spKey, kind: kind, key: name };
        }
    }
    return null;
}

/**
 * 校验名称在当前作用域下是否唯一
 *
 * 注意：connector / interact_box / subsystem 的唯一性作用域已提升到**单个变体**
 * （跨所有子零件），因为模组侧 Molang 的 `local.*` 按名在 Part 内寻址，重名会产生歧义。
 *
 * @param {Object} variant - 当前变体配置
 * @param {'sub_part'|'connector'|'interact_box'|'subsystem'} scope - 校验作用域
 * @param {string} subPartKey - 当前子零件 key（用于编辑时排除自身）
 * @param {string} name - 要校验的名称
 * @param {string} [excludeKey] - 排除的 key（用于编辑已有项时，不与自己冲突）
 * @returns {{ valid: boolean, message: string }}
 */
function validateNameUniqueness(variant, scope, subPartKey, name, excludeKey) {
    if (!variant || !name) return { valid: false, message: '名称为空' };

    // 信号保留地址不得作为连接点 / 子系统 / 交互区名（子零件名不在信号命名空间内）
    if (scope !== 'sub_part' && RESERVED_SIGNAL_NAMES.indexOf(name) >= 0) {
        return { valid: false, message: '"' + name + '" 为信号保留地址（local/global），请换一个名称' };
    }

    var existingKeys = [];

    switch (scope) {
        case 'sub_part':
            existingKeys = Object.keys(variant.sub_parts || {});
            break;
        case 'connector':
        case 'interact_box':
        case 'subsystem':
            // 唯一性作用域提升到单变体（Part 级）：跨全部子零件、跨三类名字查同名键
            if (findNamedEntry(variant, name, {
                subPartKey: subPartKey,
                excludeKey: excludeKey,
            })) {
                return { valid: false, message: '"' + name + '" 已存在，请换一个名称' };
            }
            return { valid: true, message: '' };
        default:
            return { valid: false, message: '未知作用域' };
    }

    for (var i = 0; i < existingKeys.length; i++) {
        if (existingKeys[i] === name) {
            return { valid: false, message: '"' + name + '" 已存在，请换一个名称' };
        }
    }

    return { valid: true, message: '' };
}

/**
 * 在给定作用域内生成一个唯一名称
 * 如果基础名称已存在，自动附加自增后缀
 *
 * @param {'sub_part'|'connector'|'subsystem'} scope
 * @param {Object} variant - 变体配置
 * @param {string} subPartKey - 子零件 key（connector/subsystem 需要）
 * @param {string} baseName - 基础名称
 * @returns {string} 唯一名称
 */
function ensureUniqueName(scope, variant, subPartKey, baseName) {
    var result = validateNameUniqueness(variant, scope, subPartKey, baseName);
    if (result.valid) return baseName;

    // 尝试加后缀 _2, _3, ... 直到唯一
    var suffix = 2;
    while (!result.valid && suffix <= 999) {
        var candidate = baseName + '_' + suffix;
        result = validateNameUniqueness(variant, scope, subPartKey, candidate);
        if (result.valid) return candidate;
        suffix++;
    }

    // 兜底：加时间戳
    return baseName + '_' + Date.now();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEFAULT_NAMESPACE: DEFAULT_NAMESPACE,
        RESERVED_SIGNAL_NAMES: RESERVED_SIGNAL_NAMES,
        toSnakeCase,
        generateDefaultName,
        findNamedEntry,
        validateNameUniqueness,
        ensureUniqueName,
    };
}
