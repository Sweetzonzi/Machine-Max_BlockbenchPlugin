/**
 * 命名工具模块
 *
 * 提供默认名称生成、snake_case 转换、唯一性校验等函数。
 * 所有名称均使用翻译键格式（如 sub_part.machine_max.main），
 * 与内容包 JSON 的 key 一致。名称即字典 key，不引入独立 id 字段。
 */
var { createLogger } = require('../utils/logger.js');

var log = createLogger('Naming');

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
 * @param {'sub_part'|'connector'|'interact_box'|'subsystem'} entityType - 实体类型
 * @param {Object} context - 生成上下文
 * @param {string} [context.namespace='machine_max'] - 命名空间
 * @param {string} [context.boneName] - 骨骼/Locator 名称（用于 connector/interact_box）
 * @param {string} [context.typeShortName] - type 短名（用于 subsystem）
 * @returns {string} 默认名称
 */
function generateDefaultName(entityType, context) {
    var ns = context.namespace || 'machine_max';

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
            // 唯一性作用域提升到单变体：遍历所有子零件收集同名条目
            var field = scope === 'connector' ? 'connectors'
                : scope === 'interact_box' ? 'interact_boxes'
                    : 'subsystems';
            var subParts = variant.sub_parts || {};
            Object.keys(subParts).forEach(function (key) {
                var map = (subParts[key] && subParts[key][field]) || {};
                Object.keys(map).forEach(function (k) {
                    // 编辑当前子零件的当前项时排除自身
                    if (key === subPartKey && k === excludeKey) return;
                    existingKeys.push(k);
                });
            });
            break;
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
        toSnakeCase,
        generateDefaultName,
        validateNameUniqueness,
        ensureUniqueName,
    };
}
