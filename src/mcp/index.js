// 文件: src/mcp/index.js
// 用途: MCP 工具注册 / 注销（docs/12 §10）
// 所属模块: MachineMax Blockbench 插件
//
// 通过 globalThis.MCP_QUEUE 扩展点挂载。MCP 插件先加载或后加载都能收到
// setup(mcp)；插件重载时先按名字注销同名工具，避免 duplicate name 抛错。

'use strict';

var tools = require('./tools.js');
var params = require('./params.js');
var { createLogger } = require('../utils/logger.js');

var log = createLogger('MCP');

var PREFIX = 'machine_max_bb_plugin_';
var CONDITION = { project: true, modes: ['machine_max_part'] };

var queueEntry = null;
var disposers = [];
var activeMcp = null;

function toolName(name) {
    return PREFIX + name;
}

/**
 * 把一个 setup 条目推进 MCP_QUEUE。幂等：重复调用不会重复入队。
 * @returns {boolean}
 */
function registerMcpTools() {
    if (queueEntry) return true;
    if (typeof globalThis === 'undefined') {
        log.warn('registerMcpTools: 当前环境没有 globalThis');
        return false;
    }
    if (!Array.isArray(globalThis.MCP_QUEUE)) {
        globalThis.MCP_QUEUE = [];
    }

    queueEntry = {
        plugin: 'machine_max_bb_plugin',
        setup: function (mcp) {
            setupTools(mcp);
        },
    };
    globalThis.MCP_QUEUE.push(queueEntry);
    log.info('registerMcpTools: 已加入 MCP_QUEUE（' + tools.all().length + ' 个工具）');
    return true;
}

function setupTools(mcp) {
    if (!mcp || typeof mcp.registerTool !== 'function') {
        log.warn('setupTools: MCP.registerTool 不可用，跳过');
        return;
    }
    if (!mcp.z || typeof mcp.z.object !== 'function') {
        log.warn('setupTools: MCP.z 不可用，跳过');
        return;
    }

    activeMcp = mcp;
    disposers = [];

    var schemas = params.build(mcp.z);
    tools.all().forEach(function (tool) {
        var name = toolName(tool.name);

        // 重载 / 重复 setup：先移除同名工具
        if (typeof mcp.unregisterTool === 'function') {
            try {
                mcp.unregisterTool(name);
            } catch (e) {
                log.debug('setupTools: 注销旧工具失败（忽略）: ' + name);
            }
        }

        var dispose = mcp.registerTool({
            name: name,
            description: tool.description,
            params: schemas[tool.name],
            condition: CONDITION,
            execute: function (args) {
                return tools.execute(tool.name, args, mcp);
            },
        });
        if (typeof dispose === 'function') {
            disposers.push(dispose);
        } else if (dispose && typeof dispose.dispose === 'function') {
            disposers.push(function () { dispose.dispose(); });
        }
    });

    log.info('setupTools: 已注册 ' + tools.all().length + ' 个 MCP 工具');
}

function unregisterMcpTools() {
    if (activeMcp && typeof activeMcp.unregisterTool === 'function') {
        tools.all().forEach(function (tool) {
            try {
                activeMcp.unregisterTool(toolName(tool.name));
            } catch (e) {
                log.debug('unregisterMcpTools: 注销失败（忽略）: ' + toolName(tool.name));
            }
        });
    }

    disposers.forEach(function (dispose) {
        try {
            if (typeof dispose === 'function') dispose();
        } catch (e) {
            log.warn('unregisterMcpTools: disposer 失败: ' + (e && e.message));
        }
    });
    disposers = [];
    activeMcp = null;

    if (queueEntry && typeof globalThis !== 'undefined' && Array.isArray(globalThis.MCP_QUEUE)) {
        var index = globalThis.MCP_QUEUE.indexOf(queueEntry);
        if (index >= 0) globalThis.MCP_QUEUE.splice(index, 1);
    }
    queueEntry = null;
    tools.resetState();
    log.info('unregisterMcpTools: 已注销 MCP 工具');
}

module.exports = {
    registerMcpTools: registerMcpTools,
    unregisterMcpTools: unregisterMcpTools,
    PREFIX: PREFIX,
    CONDITION: CONDITION,
    _internals: { setupTools: setupTools },
};
