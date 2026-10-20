// 文件: src/ops/session.js
// 用途: 视图上下文切换（docs/13 §6.1 / docs/12 set_active）
// 所属模块: MachineMax Blockbench 插件
//
// setActive 只改 _uiState，不进撤销栈：这是视图状态，不是工程内容。

'use strict';

var ports = require('../doc/ports.js');
var shared = require('./shared.js');

function setActive(config, options) {
    options = options || {};
    config = shared.configOrNull(config);
    if (!config) return shared.fail('配置不可用，请先打开项目');

    var patch = {};
    if (options.partId !== undefined) patch.activePartId = options.partId;
    if (options.variantName !== undefined) patch.activeVariantName = options.variantName;
    if (options.mode !== undefined) patch.activeMode = options.mode;

    // 校验目标存在，避免把上下文切到不存在的节点
    if (patch.activePartId && !shared.partOf(config, patch.activePartId)) {
        return shared.fail('零件 "' + patch.activePartId + '" 不存在');
    }
    if (patch.activePartId && patch.activeVariantName) {
        var variant = shared.variantOf(config, patch.activePartId, patch.activeVariantName);
        if (!variant) return shared.fail('变体 "' + patch.activeVariantName + '" 不存在');
    }

    // 等价于 UI 里点选零件：只给 part 时落到该零件的第一个变体
    if (patch.activePartId && !patch.activeVariantName) {
        var part = shared.partOf(config, patch.activePartId);
        var variants = Object.keys((part && part.variants) || {});
        patch.activeVariantName = variants.length > 0 ? variants[0] : '';
    }

    shared.setUiState(config, patch);

    // 视图状态不进撤销栈，但要让面板同步 activity（不落盘）
    try {
        ports.get().events.emit('mm_config_changed', {
            source: options.source || 'ui',
            label: '切换活动上下文',
            kinds: [],
            paths: [],
            persist: false,
            uiState: config._uiState,
        });
    } catch (e) {
        // 事件端口在 Node 测试下可能为空，忽略
    }

    return shared.ok({ changed: true, data: { _uiState: config._uiState } });
}

module.exports = { setActive: setActive };
