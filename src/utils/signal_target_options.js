/**
 * signal_target_options.js — 信号 / 功率目标的候选构建（纯函数）
 *
 * 收敛 App.vue.js 中三个重复计算属性（currentSignalTargetOptions /
 * connectorParentSignalTargetHints / interactBoxParentSignalTargetHints）的
 * 共用逻辑。
 *
 * 两档作用域，与 `doc/refs.js` 的解析口径一致（docs/13 §5.4、D34）：
 *   - 信号目标（`signal_targets` / `control_outputs` / `speed_outputs` …）→ **整个 Part**
 *     （同变体全部子零件）：上游 `ISignalSender#setTargetFromNames` 建首跳表时遍历全部
 *     `subParts`，跨子零件的子系统 / 连接点因此可达。
 *   - 功率目标（`power_output` / `power_outputs` 的 key）→ **同子零件**：上游用
 *     `findOwnSubsystem` 按 `(子零件, 名字)` 定位。
 *
 * 交互区不进任何候选：它只发不收（`InteractBox implements ISignalSender`），
 * 写成信号目标上游会记 ERROR 并丢弃这一跳。
 */

var nameUtils = require('./name_utils.js');

/** 固定候选：两个信号保留地址 */
function sentinels() {
    return [{ value: 'local', label: 'local' }, { value: 'global', label: 'global' }];
}

/**
 * 把一个子零件的连接点与子系统推进候选表（先连接点、再子系统，按完整键去重）。
 *
 * @param {Array} result - 输出数组
 * @param {Object} seen - 已收录的完整键
 * @param {Object} sp - 子零件对象
 * @param {string} spKey - 子零件 key
 * @param {string} ns - 命名空间
 * @param {string} currentSubPartKey - 当前编辑的子零件（跨子零件的候选追加子零件短名）
 */
function pushSubPartEntries(result, seen, sp, spKey, ns, currentSubPartKey) {
    if (!sp || typeof sp !== 'object') return;

    function pushFrom(map) {
        if (!map || typeof map !== 'object') return;
        Object.keys(map).forEach(function (key) {
            if (seen[key]) return;
            seen[key] = true;
            var label = nameUtils.displayLabel(key, 'zh', ns);
            if (currentSubPartKey && spKey !== currentSubPartKey) {
                label += ' · ' + nameUtils.extractShortName(spKey);
            }
            result.push({ value: key, label: label });
        });
    }

    pushFrom(sp.connectors);
    pushFrom(sp.subsystems);
}

/**
 * 信号目标候选：整个 Part（同变体全部子零件）。
 *
 * @param {Object|null} subParts - { spKey: 子零件对象 }
 * @param {string} namespace - 命名空间（默认 machine_max）
 * @param {string} [currentSubPartKey] - 当前编辑的子零件
 * @returns {Array<{value: string, label: string}>}
 */
function buildSignalTargetOptions(subParts, namespace, currentSubPartKey) {
    var ns = namespace || 'machine_max';
    var result = sentinels();
    var seen = { local: true, global: true };
    if (!subParts || typeof subParts !== 'object') return result;
    Object.keys(subParts).forEach(function (spKey) {
        pushSubPartEntries(result, seen, subParts[spKey], spKey, ns, currentSubPartKey);
    });
    return result;
}

/**
 * 功率目标候选：只看当前子零件（上游按 `findOwnSubsystem` 定位）。
 *
 * @param {Object|null} subParts - { spKey: 子零件对象 }
 * @param {string} namespace - 命名空间（默认 machine_max）
 * @param {string} currentSubPartKey - 当前编辑的子零件
 * @returns {Array<{value: string, label: string}>}
 */
function buildPowerTargetOptions(subParts, namespace, currentSubPartKey) {
    var ns = namespace || 'machine_max';
    var result = [];
    var seen = {};
    if (!subParts || typeof subParts !== 'object') return result;
    var sp = currentSubPartKey ? subParts[currentSubPartKey] : null;
    pushSubPartEntries(result, seen, sp, currentSubPartKey || '', ns, '');
    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        buildSignalTargetOptions,
        buildPowerTargetOptions,
    };
}
