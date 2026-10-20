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
 * 固定包含 'local' 与 'global' 两个内置哨兵，
 * 其后追加子零件内的连接点、子系统与交互区目标。
 *
 * @param {Object|null} subPart - 子零件对象（含 connectors / subsystems / interact_boxes 映射）
 * @param {string} namespace - 命名空间（默认 machine_max）
 * @returns {Array<{value: string, label: string}>} 信号目标选项列表
 */
function buildSignalTargetOptions(subPart, namespace) {
    var ns = namespace || 'machine_max';
    var result = [{ value: 'local', label: 'local' }, { value: 'global', label: 'global' }];
    var seen = { local: true, global: true };

    if (!subPart) return result;

    function push(key) {
        if (seen[key]) return;
        seen[key] = true;
        result.push({ value: key, label: nameUtils.displayLabel(key, 'zh', ns) });
    }

    if (subPart.connectors) {
        Object.keys(subPart.connectors).forEach(push);
    }
    if (subPart.subsystems) {
        Object.keys(subPart.subsystems).forEach(push);
    }
    if (subPart.interact_boxes) {
        Object.keys(subPart.interact_boxes).forEach(push);
    }
    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        buildSignalTargetOptions,
    };
}
