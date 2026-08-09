/**
 * signal_target_options.js — 信号目标选项构建（纯函数）
 *
 * 收敛 App.vue.js 中三个重复计算属性（currentSignalTargetOptions /
 * connectorParentSignalTargetHints / interactBoxParentSignalTargetHints）的
 * 共用逻辑：给定子零件对象，返回信号目标下拉可选项列表。
 */

var nameUtils = require('./name_utils.js');

/**
 * 构建子零件的信号目标选项列表
 *
 * 返回 {value, label}[]，value=完整键，label=[类型]短名。
 * 固定包含 'subpart' 与 'vehicle' 两个内置目标，
 * 其后追加子零件内的连接点与子系统目标。
 *
 * @param {Object|null} subPart - 子零件对象（含 connectors / subsystems 映射）
 * @param {string} namespace - 命名空间（默认 machine_max）
 * @returns {Array<{value: string, label: string}>} 信号目标选项列表
 */
function buildSignalTargetOptions(subPart, namespace) {
    var ns = namespace || 'machine_max';
    var result = [{ value: 'subpart', label: 'subpart' }, { value: 'vehicle', label: 'vehicle' }];

    if (!subPart) return result;

    if (subPart.connectors) {
        var connKeys = Object.keys(subPart.connectors);
        for (var i = 0; i < connKeys.length; i++) {
            result.push({ value: connKeys[i], label: nameUtils.displayLabel(connKeys[i], 'zh', ns) });
        }
    }
    if (subPart.subsystems) {
        var ssKeys = Object.keys(subPart.subsystems);
        for (var j = 0; j < ssKeys.length; j++) {
            result.push({ value: ssKeys[j], label: nameUtils.displayLabel(ssKeys[j], 'zh', ns) });
        }
    }
    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        buildSignalTargetOptions,
    };
}
