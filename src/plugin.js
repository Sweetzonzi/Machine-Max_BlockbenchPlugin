const { createLogger } = require('./utils/logger.js');
const { registerProperty } = require('./utils/persistence.js');
const { registerMode, unregisterActions, unregisterValidation } = require('./mode.js');
const { registerMachineMaxMenu, unregisterMachineMaxMenu } = require('./ui/menu.js');
const { registerDragImport, unregisterDragImport } = require('./import/drag_import.js');
const { registerUndoBridge, unregisterUndoBridge } = require('./core/undo.js');
const { showToast } = require('./utils/notify.js');
const docPorts = require('./doc/ports.js');

/** 插件版本号（构建时由 esbuild 从 package.json 注入） */
const PLUGIN_VERSION = __PLUGIN_VERSION__;

/** 模块日志 */
var log = createLogger('Plugin');

/**
 * MachineMax Blockbench 插件 — 插件入口
 *
 * 功能：在 Blockbench 中注册"零件定义"自定义模式，
 * 使 UGC 作者能以可视化方式定义 MachineMax 内容包中的载具零件。
 *
 * 本插件遵循 Blockbench 插件 API 规范，
 * 注册为 ModelProject Property 实现配置持久化。
 */
Plugin.register('machine_max_bb_plugin', {
    title: 'MachineMax 零件定义',
    icon: 'fa-cube',
    author: 'MachineMax Team',
    description: '在 Blockbench 中以可视化方式制作 MachineMax 内容包，无需手写 JSON',
    version: PLUGIN_VERSION,
    variant: 'desktop',
    onload() {
        console.log('[MM][Plugin] onload 开始');

        log.info('加载 MachineMax Blockbench 插件 v' + PLUGIN_VERSION);
        log.debug('Blockbench 版本环境检测', {
            Blockbench: typeof Blockbench !== 'undefined' ? Blockbench.version || '?' : 'undefined',
            Project: typeof Project !== 'undefined' ? (Project ? 'loaded' : 'empty') : 'undefined',
            Mode: typeof Mode !== 'undefined' ? (Mode.modes ? Object.keys(Mode.modes) : 'no modes') : 'undefined',
        });

        console.log('[MM][Plugin] 阶段1: registerProperty');
        registerProperty();

        console.log('[MM][Plugin] 阶段1a: installDocPorts');
        // doc/ops 的外部能力端口必须在面板/工具栏之前就绪（docs/13 §7.1）
        docPorts.install({
            markers: {
                set: function (config, partId, variantName, uuid, type, configRef) {
                    return require('./core/element_markers.js')
                        .setMarker(config, partId, variantName, uuid, type, configRef);
                },
                clear: function (config, partId, variantName, uuid) {
                    return require('./core/element_markers.js')
                        .clearMarker(config, partId, variantName, uuid);
                },
                clearScope: function (config, cleanup) {
                    return require('./core/element_markers.js')
                        .clearMarkerScope(config, cleanup);
                },
                recalc: function (config, partId, variantName) {
                    return require('./core/element_markers.js')
                        .recalcAutoEndBones(config, partId, variantName);
                },
            },
            validation: {
                collectIssues: function (config) {
                    return require('./services/validate.js').collectIssues(config);
                },
            },
        });

        console.log('[MM][Plugin] 阶段1b: registerUndoBridge');
        // 接入 Blockbench 原生撤销：让配置变更进入 Undo.history（docs/11）
        registerUndoBridge();

        console.log('[MM][Plugin] 阶段2: registerMode');
        registerMode();

        console.log('[MM][Plugin] 阶段3: registerDragImport (调用前)');
        // 注册拖拽导入：仅在「零件定义」模式下拦截 .json 文件拖入
        // 注意：必须在 registerMachineMaxMenu 之前注册，因为后者在较新 BB 版本中可能抛异常
        registerDragImport();
        console.log('[MM][Plugin] 阶段3: registerDragImport (调用后)');

        console.log('[MM][Plugin] 阶段4: registerMachineMaxMenu');
        // 菜单注册曾经在 BB 5.0.7 上抛 TypeError（MenuBar.addMenu 已移除），
        // 中断 onload 会让阶段 4a 的 MCP 工具注册永远不执行。这里隔离菜单故障。
        try {
            registerMachineMaxMenu();
        } catch (e) {
            log.warn('菜单注册失败（不影响其它功能）', e && e.message);
            console.error('[MM][Plugin] 菜单注册失败', e);
        }

        console.log('[MM][Plugin] 阶段4a: registerMcpTools');
        // MCP 工具通过 globalThis.MCP_QUEUE 挂载（docs/12）；MCP 插件未装时为空操作
        try {
            require('./mcp/index.js').registerMcpTools();
        } catch (e) {
            log.warn('MCP 工具注册失败（不影响插件其它功能）', e && e.message);
        }

        console.log('[MM][Plugin] 阶段5: showToast');
        showToast('MachineMax 插件已加载，在模式栏中选择 "零件定义" 开始使用', 'positive');
        log.info('插件初始化完成');
        console.log('[MM][Plugin] onload 结束');
    },
    onunload() {
        log.info('卸载 MachineMax Blockbench 插件');
        try {
            require('./mcp/index.js').unregisterMcpTools();
        } catch (e) {
            log.warn('MCP 工具注销失败（忽略）', e && e.message);
        }
        unregisterUndoBridge();
        unregisterActions();
        unregisterValidation();
        unregisterDragImport();
        unregisterMachineMaxMenu();
        log.debug('插件清理完成');
    },
});
