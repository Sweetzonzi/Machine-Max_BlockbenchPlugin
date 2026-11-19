const { createLogger } = require('../utils/logger.js');
var nameUtils = require('../utils/name_utils.js');
var builtinLang = require('../core/builtin_lang.js');

var log = createLogger('GenLang');

/** 共享词汇命名空间：译名优先由内置包（或依赖包）提供 */
var SHARED_NAMESPACE = 'machine_max';

/**
 * 将下划线分隔的标识符转为首字母大写的英文显示名
 * "engine" → "Engine"
 * "ae86_chassis" → "Ae86 Chassis"
 */
function _toDisplayName(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}

/**
 * lang/*.json 生成器
 *
 * 遍历 config.parts 树，为以下 5 类用户指定的标识名生成翻译键。
 * 零件定义 JSON 中的 map key 已经是完整键格式
 * （如 "sub_part.machine_max.main"、"interact.machine_max.seat"），
 * 因此直接用作翻译键，不再拼接前缀。key 的命名空间由创作者决定，
 * 可能与 config.namespace 不同，这里一律按完整键原样输出。
 *
 * 1. 零件 ID:         {ns}.{partId}（零件 ID 不属于翻译键，用本包命名空间）
 * 2. 子零件名:        map key（跳过任何命名空间下的 "main"）
 * 3. 交互区名:        map key
 * 4. 连接点名:        map key
 * 5. 子系统名:        map key
 *
 * **跳过共享词条**：新建实体默认落在 `machine_max` 命名空间（见
 * `core/naming.js` 的 DEFAULT_NAMESPACE）。这是跨包共享词汇，译名由内置包
 * 的 lang 提供（如 `connector.machine_max.hull_left_road_wheel_01` → 「左第 1
 * 负重轮轮毂」）。这些键不该再写进本包 lang —— 写了会按 HashMap 迭代顺序随机
 * 盖掉内置译名。判断依据是构建注入的 `__BUILTIN_LANG__`（`core/builtin_lang.js`）；
 * 内置包没有的词条（作者自造的 mm 名字）仍然写进本包 lang，否则那条实体没有译名。
 *
 * @param {Object} projectConfig - 完整配置
 * @param {Object} [options]
 * @param {Object} [options.builtinLang] - {zh_cn: {key: text}, en_us: {...}}；默认取构建注入的内置包 lang
 * @returns {{zh_cn: Object, en_us: Object}}
 */
function generateAllLangs(projectConfig, options) {
    var result = {};
    var zhLang = {};
    var enLang = {};
    var ns = projectConfig.namespace || 'machine_max';
    var parts = projectConfig.parts || {};
    var provided = (options && options.builtinLang) || null;

    /** 该语言下这条键是否已由内置包提供（有提供者就不写，避免覆盖） */
    function providedByBuiltin(locale, key) {
        if (provided) {
            var map = provided[locale];
            return !!map && Object.prototype.hasOwnProperty.call(map, key);
        }
        return builtinLang.hasKey(locale, key);
    }

    /**
     * 写一条实体翻译键；共享词条已有译名时跳过。
     * @param {string} key - 完整键（`connector.machine_max.foo` 等）
     * @param {string} shortName - 名称段，用于生成显示名
     */
    function emit(key, shortName) {
        var parsed = nameUtils.parseKey(key);
        var shared = !!(parsed && parsed.namespace === SHARED_NAMESPACE);
        if (shared && providedByBuiltin('zh_cn', key) && providedByBuiltin('en_us', key)) {
            return;
        }
        enLang[key] = _toDisplayName(shortName);
        zhLang[key] = _toDisplayName(shortName);
    }

    for (var partId in parts) {
        if (!parts.hasOwnProperty(partId)) continue;
        var partConfig = parts[partId];

        /* 1. 零件 ID 翻译键: {ns}.{partId} */
        var partKey = ns + '.' + partId;
        enLang[partKey] = _toDisplayName(partId);
        zhLang[partKey] = _toDisplayName(partId);

        var variants = partConfig.variants || {};
        var variantMap;
        if (typeof variants.model === 'string') {
            variantMap = { _default: variants };
        } else {
            variantMap = variants;
        }

        for (var variantName in variantMap) {
            if (!variantMap.hasOwnProperty(variantName)) continue;
            var variant = variantMap[variantName];

            var subParts = variant.sub_parts || {};
            var subPartMap;
            if (typeof subParts.durability === 'number') {
                subPartMap = { _single: subParts };
            } else {
                subPartMap = subParts;
            }

            for (var subPartKey in subPartMap) {
                if (!subPartMap.hasOwnProperty(subPartKey)) continue;
                var subPart = subPartMap[subPartKey];
                if (!subPart || typeof subPart !== 'object') continue;

                /* 2. 子零件名: map key 已是完整键，直接使用（跳过 "main"） */
                var spParsed = nameUtils.parseKey(subPartKey);
                var isDefaultMain = !!(spParsed && spParsed.name === 'main');
                if (subPartKey !== '_single' && !isDefaultMain) {
                    var spShortName = nameUtils.extractShortName(subPartKey, ns);
                    emit(subPartKey, spShortName);
                }

                /* 3. 交互区名: map key 已是完整键 */
                var interactBoxes = subPart.interact_boxes || {};
                for (var interactKey in interactBoxes) {
                    if (!interactBoxes.hasOwnProperty(interactKey)) continue;
                    emit(interactKey, nameUtils.extractShortName(interactKey, ns));
                }

                /* 4. 连接点名: map key 已是完整键 */
                var connectors = subPart.connectors || {};
                for (var connectorKey in connectors) {
                    if (!connectors.hasOwnProperty(connectorKey)) continue;
                    emit(connectorKey, nameUtils.extractShortName(connectorKey, ns));
                }

                /* 5. 子系统名: map key 已是完整键 */
                var subsystems = subPart.subsystems || {};
                for (var subsystemKey in subsystems) {
                    if (!subsystems.hasOwnProperty(subsystemKey)) continue;
                    emit(subsystemKey, nameUtils.extractShortName(subsystemKey, ns));
                }
            }
        }
    }

    result['zh_cn'] = zhLang;
    result['en_us'] = enLang;

    log.info('generateAllLangs: 已生成本地化，键数=' + Object.keys(zhLang).length);
    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateAllLangs, SHARED_NAMESPACE };
}
