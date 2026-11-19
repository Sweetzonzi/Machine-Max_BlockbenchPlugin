/**
 * validate.js — 唯一校验实现 collectIssues(config) → Problem[]
 *
 * P4 起从 mode/validation.js 下沉到 services/validate.js：保持 core 不依赖 doc，
 * 同时让 services/export.js 与 doc/ports.validation 共用同一实现。
 * 依赖 Blockbench 全局 Group / Locator / Project（仅运行时可用），属"只读、不修改全局"。
 */
var { createLogger } = require('../utils/logger.js');
var { getMarkersForVariant, detectOwnerSubPart } = require('../core/element_markers.js');
var ssTypes = require('../core/subsystem_types.js');
var cp = require('../core/content_pack_manager.js');
var { CODES, isMissingValue } = require('../core/validation_types.js');
var docRefs = require('../doc/refs.js');
var ports = require('../doc/ports.js');

var log = createLogger('Validation');

/** 标记类型 → 问题 scope */
function _scopeForMarkerType(type) {
    if (type === 'sub_part') return 'subpart';
    return type; // hit_box | connector | interact_box
}

/** 构造 Problem 对象（结构见 validation_types.js） */
function _makeProblem(severity, code, message, path) {
    return { severity: severity, code: code, message: message, path: path };
}

/**
 * 严格的对象判定（排除 null 与数组）。
 *
 * 加载链路会原样保留读不出来的节点（doc/load.js），校验遍历时不能假设
 * `parts[x]` / `variants[x]` / `sub_parts[x]` 一定是对象。
 */
function _isObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** 构造 path，仅填充有值的可选字段以免污染聚合 */
function _mkPath(scope, partId, variantName, subPartKey, itemKey, elementUuid, field) {
    var path = { scope: scope, partId: partId, variantName: variantName, field: field || '' };
    if (subPartKey) path.subPartKey = subPartKey;
    if (itemKey) path.itemKey = itemKey;
    if (elementUuid) path.elementUuid = elementUuid;
    return path;
}

/** 按子系统类型过滤可用型号定义（与 subsystem_panel.html 的 filteredSubsystemDefs 一致） */
function _filterDefsByType(defs, typeId) {
    var result = {};
    if (!defs || !typeId) return result;
    for (var id in defs) {
        if (defs.hasOwnProperty(id) && defs[id] && defs[id].type === typeId) {
            result[id] = defs[id];
        }
    }
    return result;
}

/**
 * 检测游离标记 + 幽灵标记（已补齐 interact_box 游离检测）
 * 结果直接 push 进 problems。
 *
 * 游离元素（无归属 subpart）无 subPartKey → 聚合时落 byPartVariant。
 * @param {Object} config
 * @param {string} partId
 * @param {string} vName
 * @param {Array} problems
 */
function _collectMarkerIssues(config, partId, vName, problems) {
    // 构建当前模型中所有有效元素的 UUID 集合
    var validUUIDs = {};
    var allGroups = (typeof Group !== 'undefined' && Group.all) ? Group.all : [];
    var allLocators = (typeof Locator !== 'undefined' && Locator.all) ? Locator.all : [];
    for (var gi = 0; gi < allGroups.length; gi++) validUUIDs[allGroups[gi].uuid] = true;
    for (var li = 0; li < allLocators.length; li++) validUUIDs[allLocators[li].uuid] = true;

    var markers = getMarkersForVariant(config, partId, vName);
    for (var uuid in markers) {
        var marker = markers[uuid];

        // 幽灵标记：UUID 对应的元素已不存在于模型中
        if (!validUUIDs[uuid]) {
            var typeLabel = (marker.type === 'sub_part') ? '子零件' :
                            (marker.type === 'hit_box') ? '碰撞箱' :
                            (marker.type === 'connector') ? '连接点' :
                            (marker.type === 'interact_box') ? '交互区' : marker.type;
            problems.push(_makeProblem(
                'error', CODES.GHOST_MARKER,
                '零件 "' + partId + '"/' + vName + ' 中存在幽灵' + typeLabel + '标记（UUID: ' + uuid +
                '），对应的模型元素已被删除。建议保存后重新打开项目以自动清理。',
                _mkPath(_scopeForMarkerType(marker.type), partId, vName, null, null, uuid)
            ));
            continue; // 元素不存在，跳过后续的游离检测
        }

        if (marker.type === 'hit_box') {
            var group = allGroups.find(function (g) { return g.uuid === uuid; });
            if (group) {
                var owner = detectOwnerSubPart(config, partId, vName, group);
                if (!owner) {
                    problems.push(_makeProblem(
                        'warning', CODES.ORPHAN_ELEMENT,
                        '零件 "' + partId + '"/' + vName + ' 中碰撞箱 "' + group.name + '" 为游离状态（无归属子零件，不会被防护计算处理）',
                        _mkPath('hit_box', partId, vName, null, null, uuid)
                    ));
                }
            }
        } else if (marker.type === 'connector') {
            var loc = allLocators.find(function (l) { return l.uuid === uuid; });
            if (loc) {
                var owner = detectOwnerSubPart(config, partId, vName, loc);
                if (!owner) {
                    problems.push(_makeProblem(
                        'warning', CODES.ORPHAN_ELEMENT,
                        '零件 "' + partId + '"/' + vName + ' 中连接点 "' + loc.name + '" 为游离状态（无归属子零件，将不会计入导出）',
                        _mkPath('connector', partId, vName, null, null, uuid)
                    ));
                }
            }
        } else if (marker.type === 'interact_box') {
            var ibGroup = allGroups.find(function (g) { return g.uuid === uuid; });
            if (ibGroup) {
                var owner = detectOwnerSubPart(config, partId, vName, ibGroup);
                if (!owner) {
                    problems.push(_makeProblem(
                        'warning', CODES.ORPHAN_ELEMENT,
                        '零件 "' + partId + '"/' + vName + ' 中交互区 "' + ibGroup.name + '" 为游离状态（无归属子零件，不会被交互处理）',
                        _mkPath('interact_box', partId, vName, null, null, uuid)
                    ));
                }
            }
        }
    }
}

/** 信号保留地址：不得用作连接点 / 子系统 / 交互区名 */
var RESERVED_SIGNAL_NAMES = ['local', 'global'];

/**
 * 单变体内「连接点 / 子系统 / 交互区」名称唯一性 + 信号保留地址校验。
 * 与模组侧 VariantAttr.validateUniqueNames 保持一致：作用域为单个变体（跨子零件），
 * 因为 Molang `local.*` 在 Part 内按名寻址，重名会产生歧义。
 *
 * @param {string} partId
 * @param {string} vName
 * @param {Object} subParts
 * @param {Array} problems
 */
function _collectNameConflicts(partId, vName, subParts, problems) {
    var seen = {}; // name -> { subPartKey, scope }
    var scopes = [
        { field: 'connectors', scope: 'connector' },
        { field: 'subsystems', scope: 'subsystem' },
        { field: 'interact_boxes', scope: 'interact_box' },
    ];
    Object.keys(subParts || {}).forEach(function (spKey) {
        var sp = subParts[spKey] || {};
        scopes.forEach(function (s) {
            var map = sp[s.field] || {};
            Object.keys(map).forEach(function (name) {
                if (RESERVED_SIGNAL_NAMES.indexOf(name) >= 0) {
                    problems.push(_makeProblem(
                        'error', CODES.RESERVED_NAME,
                        s.scope + ' "' + name + '" 在零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"：为信号保留地址（local/global），不得用作连接点/子系统/交互区名',
                        _mkPath(s.scope, partId, vName, spKey, name)
                    ));
                }
                var prev = seen[name];
                if (prev) {
                    problems.push(_makeProblem(
                        'error', CODES.DUPLICATE_NAME,
                        '名称 "' + name + '" 在零件 "' + partId + '"/' + vName + ' 内重复：'
                        + prev.scope + '（子零件 "' + prev.subPartKey + '"）与 '
                        + s.scope + '（子零件 "' + spKey + '"）冲突',
                        _mkPath(s.scope, partId, vName, spKey, name)
                    ));
                } else {
                    seen[name] = { subPartKey: spKey, scope: s.scope };
                }
            });
        });
    });
}

/**
 * 配置引用完整性（docs/13 §5.4 / §4.3）：signal_targets / power_output /
 * power_target / power_outputs 的 key / hit_box.subsystem / connector 等
 * 必须指向真实条目（信号目标是整个 Part 域，其余同子零件）或 local/global。
 *
 * @param {Object} config
 * @param {string} partId
 * @param {string} vName
 * @param {string} spKey
 * @param {Array} problems
 */
function _collectDanglingRefs(config, partId, vName, spKey, problems) {
    var result = docRefs.resolveConfigRefs(config, {
        partId: partId,
        variantName: vName,
        subPartKey: spKey,
    });
    (result.dangling || []).forEach(function (ref) {
        problems.push(_makeProblem(
            'error', CODES.DANGLING_SIGNAL_TARGET,
            _whereRef(partId, vName, spKey, ref) + ' "' + ref.target + '" '
            + (ref.kind === 'signal_target'
                // 具名目标的解析域是整个 Part（上游 setTargetFromNames 遍历全部 subParts）
                ? '在本零件（同变体的全部子零件）内找不到同名的子系统或连接点，也不是 local/global'
                : '在同子零件内找不到同名条目（该引用只在所属子零件内解析）'),
            _pathOfRef(ref, partId, vName, spKey)
        ));
    });
    (result.invalid || []).forEach(function (ref) {
        problems.push(_makeProblem(
            'warning', CODES.INTERACT_BOX_AS_SIGNAL_TARGET,
            _whereRef(partId, vName, spKey, ref) + ' "' + ref.target + '" '
            + '是交互区：交互区只发不收（门、舱盖这类点击入口），信号不会送达它；'
            + '请改指向真正收信号的子系统或连接点',
            _pathOfRef(ref, partId, vName, spKey)
        ));
    });
}

/** 引用所在子零件的描述前缀（零件 / 变体 / 子零件 + 引用类别） */
function _whereRef(partId, vName, spKey, ref) {
    return '零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"：'
        + _refWhat(ref.kind);
}

/** 引用类别 → 中文名 */
function _refWhat(kind) {
    if (kind === 'power_output_key') return '功率输出目标（power_outputs 的 key）';
    if (kind === 'hit_box_subsystem') return '碰撞箱子系统';
    if (kind === 'power_target') return '连接点功率目标';
    if (kind === 'power_output') return '子系统功率输出';
    if (kind === 'connector') return '子系统关联连接点';
    return '信号目标';
}

/** 引用路径 → Problem.path */
function _pathOfRef(ref, partId, vName, spKey) {
    var p = ref.path || [];
    var baseLen = 6; // parts/<id>/variants/<v>/sub_parts/<sp>
    var container = p[baseLen];
    var itemKey = p[baseLen + 1];
    var field = p[baseLen + 2] || '';
    var scope = 'subpart';
    if (container === 'subsystems') scope = 'subsystem';
    else if (container === 'connectors') scope = 'connector';
    else if (container === 'interact_boxes') scope = 'interact_box';
    else if (container === 'hit_boxes') scope = 'hit_box';
    return _mkPath(scope, partId, vName, spKey, itemKey, null, field);
}

/**
 * 碰撞箱的模块名（`hit_box.module`）：只在关联到模块化子系统时有意义。
 *
 * 两条都是 warning：模组侧遇到对不上号的模块名会记一条日志、退回按模块最大耐久比例分摊，
 * 命中不会丢失，但作者多半是打错了名字，导出前值得先看一眼。未知的子系统类型不判定——
 * 拿不到它的模块清单，猜出来的提示只会误导。
 *
 * @param {string} partId
 * @param {string} vName
 * @param {string} spKey
 * @param {string} hbKey - 碰撞箱 key（骨骼 UUID）
 * @param {object} hb - 碰撞箱配置
 * @param {object} subsystems - 同一子零件的子系统实例表
 * @param {Array} problems
 */
function _collectModuleIssue(partId, vName, spKey, hbKey, hb, subsystems, problems) {
    var moduleName = hb.module;
    if (isMissingValue(moduleName)) return;
    var where = '零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '" 碰撞箱 "' + hbKey + '"';
    var owner = hb.subsystem ? subsystems[hb.subsystem] : null;
    if (!owner) {
        problems.push(_makeProblem(
            'warning', CODES.HIT_BOX_MODULE_WITHOUT_SUBSYSTEM,
            where + '：填了模块名 "' + moduleName + '" 但没有关联子系统；模块名只在关联模块化子系统时生效',
            _mkPath('hit_box', partId, vName, spKey, hbKey, hbKey, 'module')
        ));
        return;
    }
    var typeMeta = ssTypes.getTypeMeta(owner.type);
    if (!typeMeta) return;
    var available = ssTypes.getModuleNames(owner.type);
    if (available.length === 0) {
        problems.push(_makeProblem(
            'warning', CODES.HIT_BOX_MODULE_UNKNOWN,
            where + '：子系统 "' + hb.subsystem + '"（' + typeMeta.displayName + '）没有模块划分，模块名 "'
            + moduleName + '" 会被忽略',
            _mkPath('hit_box', partId, vName, spKey, hbKey, hbKey, 'module')
        ));
        return;
    }
    if (available.indexOf(moduleName) === -1) {
        problems.push(_makeProblem(
            'warning', CODES.HIT_BOX_MODULE_UNKNOWN,
            where + '：子系统 "' + hb.subsystem + '"（' + typeMeta.displayName + '）没有模块 "'
            + moduleName + '"；可用 ' + available.join(' / ')
            + '，模组侧会按模块最大耐久比例分摊这次命中',
            _mkPath('hit_box', partId, vName, spKey, hbKey, hbKey, 'module')
        ));
    }
}

/** 交互区 condition 的历史枚举字面量（上游已改为 MoLang 表达式） */
var LEGACY_CONDITION_TOKENS = ['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'];

/**
 * 交互区的门控表达式（`interact_box.condition`）：上游 8e9a5263 把逻辑枚举
 * （AND / OR / NAND / NOR / XOR / XNOR，默认 NOR）改成 MoLang 表达式
 * （求值 > 0 表示可用，默认 true）。旧值仍是合法字符串，Codec 照样解出来，
 * 但模组侧会把它当表达式求值失败——该交互区恒不可用且只留一条错误日志，
 * 手感上表现为"点了没反应"。所以认得出旧枚举值时按 warning 提示改写。
 *
 * 只认六个旧枚举字面量：其余字符串可能是作者写的表达式，插件不执行 MoLang，
 * 判断不了对错，也不该猜。
 *
 * @param {string} partId
 * @param {string} vName
 * @param {string} spKey
 * @param {string} ibKey - 交互区 key
 * @param {object} ib - 交互区配置
 * @param {Array} problems
 */
function _collectLegacyConditionIssue(partId, vName, spKey, ibKey, ib, problems) {
    var condition = ib.condition;
    if (typeof condition !== 'string') return;
    if (LEGACY_CONDITION_TOKENS.indexOf(condition) === -1) return;
    problems.push(_makeProblem(
        'warning', CODES.INTERACT_BOX_CONDITION_LEGACY_ENUM,
        '零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '" 交互区 "' + ibKey + '"：门控写的是旧逻辑枚举 "'
        + condition + '"；上游已把它改成 MoLang 表达式（求值 > 0 表示可用，默认 true），'
        + '这个值会被当成写错的表达式、使该交互区恒不可用。改成 true 或换成表达式'
        + "（如 local.subsystem_active('subsystem.machine_max.engine') == 0）",
        _mkPath('interact_box', partId, vName, spKey, ibKey, ibKey, 'condition')
    ));
}

/**
 * 视点发现表（`camera_discovery_targets`，座位与武器控制器）的取值域与频道。
 *
 * 这张表决定座位 / 火控能发现哪些视点，上游 `AbstractSubsystem#resolveViewpoints`
 * 只按名字查终端、按接收侧 `discovery_inputs` 筛频道。三种写法会静默失效——
 * 都只表现为"少一个视角"，没有日志，所以在这里按 warning 提示：
 *
 * 1. 频道写成 `camera_sight`：那是视点未声明接受频道时的默认值，等于把全车所有
 *    视点都算进来（上游 `content-check.gradle` 第 16 节同样禁止）；
 * 2. 具名目标指向的不是 camera / sight：按名解析不报错，但发现结果只留视点，
 *    这条线路等于不通；
 * 3. 走 `local` / `global` 广播的频道没有任何一台 camera / sight 声明：接收侧按
 *    自己的接受频道筛选，这条线路永远命中不了。
 *
 * 具名目标"不存在"由 `_collectDanglingRefs` 报 error，这里不重复。
 *
 * @param {string} partId
 * @param {string} vName
 * @param {Object} subParts - 同变体全部子零件（作用域是整个 Part）
 * @param {Object} subsystemDefs - 合并后的子系统定义
 * @param {Array} problems
 */
function _collectViewpointDiscoveryIssues(partId, vName, subParts, subsystemDefs, problems) {
    // 所有 camera / sight 型号声明过的接受频道（并集）
    var declaredChannels = {};
    var hasViewpointDefs = false;
    Object.keys(subsystemDefs || {}).forEach(function (defId) {
        var def = subsystemDefs[defId];
        if (!_isObject(def)) return;
        if (def.type !== 'machine_max:camera' && def.type !== 'machine_max:sight') return;
        hasViewpointDefs = true;
        var inputs = Array.isArray(def.discovery_inputs) ? def.discovery_inputs : [];
        for (var i = 0; i < inputs.length; i++) {
            if (typeof inputs[i] === 'string') declaredChannels[inputs[i]] = true;
        }
    });

    // 具名目标 → 子系统类型（整个 Part 域，与信号目标同作用域）
    var typeOfSubsystem = {};
    Object.keys(subParts || {}).forEach(function (spKey) {
        var sp = subParts[spKey];
        if (!_isObject(sp) || !_isObject(sp.subsystems)) return;
        Object.keys(sp.subsystems).forEach(function (name) {
            var ss = sp.subsystems[name];
            if (_isObject(ss)) typeOfSubsystem[name] = ss.type;
        });
    });

    Object.keys(subParts || {}).forEach(function (spKey) {
        var sp = subParts[spKey];
        if (!_isObject(sp) || !_isObject(sp.subsystems)) return;
        Object.keys(sp.subsystems).forEach(function (ssName) {
            var ss = sp.subsystems[ssName];
            if (!_isObject(ss) || !_isObject(ss.camera_discovery_targets)) return;
            var table = ss.camera_discovery_targets;
            Object.keys(table).forEach(function (channel) {
                var targets = table[channel];
                if (!Array.isArray(targets)) return;
                var where = '子系统 "' + ssName + '" 在零件 "' + partId + '"/' + vName
                    + ' 子零件 "' + spKey + '" 的视点发现频道 "' + channel + '"';
                var field = 'camera_discovery_targets';

                if (channel === 'camera_sight') {
                    problems.push(_makeProblem(
                        'warning', CODES.VIEWPOINT_DISCOVERY_DEFAULT_CHANNEL,
                        where + '：camera_sight 是视点未声明接受频道时的默认值，'
                        + '写它等于把全车所有视点都算进来。要表达"这台视点归谁"，'
                        + '频道名必须是内容自己的设备词（gunner_sight / commander_sight …）',
                        _mkPath('subsystem', partId, vName, spKey, ssName, null, field)
                    ));
                }

                var broadcast = false;
                for (var ti = 0; ti < targets.length; ti++) {
                    var target = targets[ti];
                    if (typeof target !== 'string') continue;
                    if (target === 'local' || target === 'global') {
                        broadcast = true;
                        continue;
                    }
                    if (target.indexOf('subsystem.') !== 0) continue;
                    var targetType = typeOfSubsystem[target];
                    if (targetType === undefined) continue; // 不存在由 dangling 报
                    if (targetType !== 'machine_max:camera' && targetType !== 'machine_max:sight') {
                        problems.push(_makeProblem(
                            'warning', CODES.VIEWPOINT_DISCOVERY_NOT_VIEWPOINT,
                            where + ' 的目标 "' + target + '" 类型是 ' + targetType
                            + '：按名解析不报错，但发现结果只留视点，这条线路等于不通',
                            _mkPath('subsystem', partId, vName, spKey, ssName, null, field)
                        ));
                    }
                }

                if (broadcast && hasViewpointDefs && !declaredChannels[channel]) {
                    problems.push(_makeProblem(
                        'warning', CODES.VIEWPOINT_DISCOVERY_CHANNEL_UNDECLARED,
                        where + ' 走 local / global 广播，但没有一台 camera / sight 在 '
                        + 'discovery_inputs 里声明它——接收侧按自己的接受频道筛选，'
                        + '这条线路永远命中不了',
                        _mkPath('subsystem', partId, vName, spKey, ssName, null, field)
                    ));
                }
            });
        });
    });
}

/**
 * 子系统类型既不在注册表里、也不是已退役类型 → 报一条说明它是什么、该怎么办的问题。
 * 这条条目能出现在工程里有两个来源：工程来自更新版本的插件，或者加载时原样保留了
 * 上游已退役的类型（见 codec/codecs/subsystem_codec.js 的 SubsystemLoadCodec）。
 * 两种情况都不能导出（模组侧加载不了这个类型），所以按 error 报。
 *
 * path.field 留空：与 doc/validate 的 unknown_type 问题同键，导出闸门去重后只留本条
 * （带退役说明的那条），不会一个条目报两遍。
 *
 * @param {string} partId
 * @param {string} vName
 * @param {string} spKey
 * @param {string} ssName - 子系统实例名
 * @param {*} ssType - 实例上的 type 值
 * @param {Object} problems
 */
function _collectUnknownSubsystemTypeIssue(partId, vName, spKey, ssName, ssType, problems) {
    var where = '子系统 "' + ssName + '" 在零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"';
    var retired = ssTypes.getRetiredTypeInfo(ssType);
    var message;
    if (retired) {
        message = where + '：类型 "' + ssType + '" 是' + retired.displayName + '。'
            + retired.detail + '。请删除该条目后按 '
            + retired.replacements.join(' / ') + ' 重新添加';
    } else {
        message = where + '：类型 "' + String(ssType) + '" 不是本插件支持的子系统类型'
            + '（可能是拼写错误，或该工程来自更新版本的插件）。请改选类型或删除该条目';
    }
    problems.push(_makeProblem(
        'error', CODES.SUBSYSTEM_TYPE_UNKNOWN, message,
        _mkPath('subsystem', partId, vName, spKey, ssName, null, '')
    ));
}

/**
 * 唯一校验实现：收集所有问题的结构化 Problem 数组
 * @param {Object} config - MM 项目配置
 * @returns {Array} Problem[]
 */
function collectIssues(config) {
    var problems = [];
    var parts = (config && config.parts) || {};
    var partIds = Object.keys(parts);

    if (partIds.length === 0) {
        problems.push(_makeProblem(
            'error', CODES.MISSING_REQUIRED, '未定义任何零件，无法校验',
            _mkPath('part', '', '')
        ));
        return problems;
    }

    // 预加载合并后的定义（供 definition / material 引用存在性校验）
    var subsystemDefs = cp.loadMergedDefs(config, 'subsystems').defs || {};
    var connectorDefs = cp.loadMergedDefs(config, 'connectors').defs || {};
    var materialDefs = cp.loadMergedDefs(config, 'materials').defs || {};
    // 没有模型元素时（测试 / 未加载模型）不判断 hit_boxes key，避免误报。
    var boneCount = ports.get().bones.listAll().length;

    for (var i = 0; i < partIds.length; i++) {
        var partId = partIds[i];
        var part = parts[partId];
        // 加载时会把解不出来的节点原样保留，这里不能假设它们一定是对象
        if (!_isObject(part)) {
            problems.push(_makeProblem(
                'error', CODES.MISSING_REQUIRED, '零件 "' + partId + '"：数据不是对象，无法读取变体',
                _mkPath('part', partId, '', null, null, null, '')
            ));
            continue;
        }
        var variants = _isObject(part.variants) ? part.variants : {};
        var variantNames = Object.keys(variants);

        if (variantNames.length === 0) {
            problems.push(_makeProblem(
                'error', CODES.MISSING_REQUIRED, '零件 "' + partId + '"：没有定义变体',
                _mkPath('part', partId, '', null, null, null, 'variants')
            ));
            continue;
        }

        for (var vi = 0; vi < variantNames.length; vi++) {
            var vName = variantNames[vi];
            var variant = variants[vName];
            if (!_isObject(variant)) {
                problems.push(_makeProblem(
                    'error', CODES.MISSING_REQUIRED,
                    '零件 "' + partId + '" 变体 "' + vName + '"：数据不是对象，无法读取子零件',
                    _mkPath('variant', partId, vName, null, null, null, '')
                ));
                continue;
            }

            if (!variant.model) {
                problems.push(_makeProblem(
                    'error', CODES.MISSING_REQUIRED, '零件 "' + partId + '" 变体 "' + vName + '"：未设置模型引用',
                    _mkPath('variant', partId, vName, null, null, null, 'model')
                ));
            }

            var subParts = _isObject(variant.sub_parts) ? variant.sub_parts : {};
            var spKeys = Object.keys(subParts);
            if (spKeys.length === 0) {
                problems.push(_makeProblem(
                    'error', CODES.MISSING_REQUIRED, '零件 "' + partId + '" 变体 "' + vName + '"：未定义子零件',
                    _mkPath('variant', partId, vName, null, null, null, 'sub_parts')
                ));
            }

            for (var si = 0; si < spKeys.length; si++) {
                var spKey = spKeys[si];
                var sp = subParts[spKey];
                if (!_isObject(sp)) {
                    problems.push(_makeProblem(
                        'error', CODES.MISSING_REQUIRED,
                        '零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"：数据不是对象，无法读取碰撞箱与子系统',
                        _mkPath('subpart', partId, vName, spKey, null, null, '')
                    ));
                    continue;
                }

                // 碰撞箱：没写 / 写了空表才算「为空」。
                // 形状非法（数组、字符串…）不在这里报「为空」——那会盖掉 schema
                // 值校验给出的真实原因，且两者 path 相同，去重后只剩误导性的那条。
                var hitBoxes = _isObject(sp.hit_boxes) ? sp.hit_boxes : {};
                var hitBoxesEmpty = _isObject(sp.hit_boxes)
                    ? Object.keys(hitBoxes).length === 0
                    : isMissingValue(sp.hit_boxes);
                if (hitBoxesEmpty) {
                    problems.push(_makeProblem(
                        'error', CODES.MISSING_REQUIRED,
                        '零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"：碰撞箱为空',
                        _mkPath('subpart', partId, vName, spKey, null, null, 'hit_boxes')
                    ));
                }
                if ((sp.mass || 0) <= 0) {
                    problems.push(_makeProblem(
                        'error', CODES.MISSING_REQUIRED,
                        '零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"：质量必须大于 0',
                        _mkPath('subpart', partId, vName, spKey, null, null, 'mass')
                    ));
                }

                // 碰撞箱材质：空值必须拦；machine_max:default 是模组内置兜底，不查表
                var subsystems = _isObject(sp.subsystems) ? sp.subsystems : {};
                for (var hbKey in hitBoxes) {
                    var hb = hitBoxes[hbKey] || {};
                    if (boneCount > 0 && !ports.get().bones.findByUuid(hbKey)) {
                        problems.push(_makeProblem(
                            'error', CODES.HIT_BOX_KEY_NOT_UUID,
                            '零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '" 碰撞箱 key "'
                            + hbKey + '" 不是骨骼 UUID；内部树只认 UUID，读/导出时才投影成骨骼名',
                            _mkPath('hit_box', partId, vName, spKey, hbKey, hbKey, '')
                        ));
                    }
                    if (isMissingValue(hb.material)) {
                        problems.push(_makeProblem(
                            'error', CODES.MATERIAL_REQUIRED,
                            '零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '" 碰撞箱 "' + hbKey + '"：未选择材质',
                            _mkPath('hit_box', partId, vName, spKey, hbKey, hbKey, 'material')
                        ));
                    } else if (hb.material !== 'machine_max:default' && !materialDefs[hb.material]) {
                        problems.push(_makeProblem(
                            'error', CODES.MATERIAL_REF_MISSING,
                            '零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '" 碰撞箱 "' + hbKey + '"：材质 "' + hb.material + '" 不存在',
                            _mkPath('hit_box', partId, vName, spKey, hbKey, hbKey, 'material')
                        ));
                    }
                    _collectModuleIssue(partId, vName, spKey, hbKey, hb, subsystems, problems);
                }

                // 交互区门控表达式：旧逻辑枚举值提醒改写（上游改成 MoLang 表达式）
                var interactBoxes = _isObject(sp.interact_boxes) ? sp.interact_boxes : {};
                for (var ibKey in interactBoxes) {
                    var ib = interactBoxes[ibKey];
                    if (_isObject(ib)) _collectLegacyConditionIssue(partId, vName, spKey, ibKey, ib, problems);
                }

                // 信号 / 功率引用完整性（DANGLING_SIGNAL_TARGET）
                _collectDanglingRefs(config, partId, vName, spKey, problems);

                // 子系统实例必填字段 + definition 引用存在性
                for (var ssName in subsystems) {
                    var ss = subsystems[ssName];
                    var meta = ssTypes.getTypeMeta(ss.type);
                    if (!meta) {
                        _collectUnknownSubsystemTypeIssue(partId, vName, spKey, ssName, ss.type, problems);
                    }

                    // definition 校验（所有子系统类型均必含 definition）
                    if (isMissingValue(ss.definition)) {
                        problems.push(_makeProblem(
                            'error', CODES.DEFINITION_REQUIRED,
                            '子系统 "' + ssName + '" 在零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"：未指定型号定义，将导致该条目的类型在模组侧无法加载',
                            _mkPath('subsystem', partId, vName, spKey, ssName, null, 'definition')
                        ));
                    } else {
                        var availableDefs = meta ? _filterDefsByType(subsystemDefs, ss.type) : subsystemDefs;
                        if (!availableDefs[ss.definition]) {
                            problems.push(_makeProblem(
                                'error', CODES.DEFINITION_REF_MISSING,
                                '子系统 "' + ssName + '" 在零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"：型号定义 "' + ss.definition + '" 不存在（引用断裂），将导致该条目的类型在模组侧无法加载',
                                _mkPath('subsystem', partId, vName, spKey, ssName, null, 'definition')
                            ));
                        }
                    }

                    // 其余 required 字段（数据驱动，来自 subsystem_types.js）
                    if (meta && meta.dynamicFields) {
                        var fields = meta.dynamicFields;
                        for (var fi = 0; fi < fields.length; fi++) {
                            var f = fields[fi];
                            if (f.field === 'definition') continue;
                            if (f.required && isMissingValue(ss[f.field])) {
                                problems.push(_makeProblem(
                                    'error', CODES.SUBSYSTEM_REQUIRED_FIELD,
                                    '子系统 "' + ssName + '" 在零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"：' + f.label + '（' + f.field + '）为必填字段但未配置',
                                    _mkPath('subsystem', partId, vName, spKey, ssName, null, f.field)
                                ));
                            }
                        }
                    }
                }

                // 连接点实例 definition 校验
                var conns = _isObject(sp.connectors) ? sp.connectors : {};
                for (var connKey in conns) {
                    var conn = conns[connKey];
                    if (isMissingValue(conn.definition)) {
                        problems.push(_makeProblem(
                            'error', CODES.DEFINITION_REQUIRED,
                            '连接点 "' + connKey + '" 在零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"：未指定型号定义，将导致该连接点类型在模组侧无法加载',
                            _mkPath('connector', partId, vName, spKey, connKey, null, 'definition')
                        ));
                    } else if (!connectorDefs[conn.definition]) {
                        problems.push(_makeProblem(
                            'error', CODES.DEFINITION_REF_MISSING,
                            '连接点 "' + connKey + '" 在零件 "' + partId + '"/' + vName + ' 子零件 "' + spKey + '"：型号定义 "' + conn.definition + '" 不存在（引用断裂），将导致该连接点类型在模组侧无法加载',
                            _mkPath('connector', partId, vName, spKey, connKey, null, 'definition')
                        ));
                    }
                }
            }

            // 单变体内名称唯一性 + 信号保留地址（Part 级按名寻址）
            _collectNameConflicts(partId, vName, subParts, problems);

            // 视点发现表（camera_discovery_targets）的取值域与频道
            _collectViewpointDiscoveryIssues(partId, vName, subParts, subsystemDefs, problems);

            // 游离标记 / 幽灵标记
            _collectMarkerIssues(config, partId, vName, problems);
        }
    }

    return problems;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { collectIssues: collectIssues };
}
