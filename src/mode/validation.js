var { createLogger } = require('../utils/logger.js');

var log = createLogger('Validation');

/**
 * 运行基础校验
 */
function runValidation(config) {
    const errors = [];
    const parts = config.parts || {};

    if (Object.keys(parts).length === 0) {
        errors.push('未定义任何零件');
        return errors;
    }

    for (const [partId, part] of Object.entries(parts)) {
        const variants = part.variants || {};
        if (Object.keys(variants).length === 0) {
            errors.push(`零件 "${partId}"：没有定义变体`);
            continue;
        }

        for (const [vName, variant] of Object.entries(variants)) {
            if (!variant.model) {
                errors.push(`零件 "${partId}" 变体 "${vName}"：未设置模型引用`);
            }
            const subParts = variant.sub_parts || {};
            if (Object.keys(subParts).length === 0) {
                errors.push(`零件 "${partId}" 变体 "${vName}"：未定义子零件`);
            }
            for (const [spName, sp] of Object.entries(subParts)) {
                if (Object.keys(sp.hit_boxes || {}).length === 0) {
                    errors.push(`零件 "${partId}"/${vName} 子零件 "${spName}"：碰撞箱为空`);
                }
                if ((sp.mass || 0) <= 0) {
                    errors.push(`零件 "${partId}"/${vName} 子零件 "${spName}"：质量必须大于 0`);
                }
            }
        }
    }

    return errors;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runValidation };
}
