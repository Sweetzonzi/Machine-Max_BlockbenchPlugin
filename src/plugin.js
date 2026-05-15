const { createLogger } = require('./utils/logger.js');
const { registerProperty } = require('./utils/persistence.js');
const { registerMode, unregisterActions } = require('./mode.js');
const { registerMachineMaxMenu, unregisterMachineMaxMenu } = require('./ui/menu.js');
const { showToast } = require('./utils/notify.js');

/** 插件版本号 */
const PLUGIN_VERSION = '0.1.0';

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
        log.info('加载 MachineMax Blockbench 插件 v' + PLUGIN_VERSION);
        log.debug('Blockbench 版本环境检测', {
            Blockbench: typeof Blockbench !== 'undefined' ? Blockbench.version || '?' : 'undefined',
            Project: typeof Project !== 'undefined' ? (Project ? 'loaded' : 'empty') : 'undefined',
            Mode: typeof Mode !== 'undefined' ? (Mode.modes ? Object.keys(Mode.modes) : 'no modes') : 'undefined',
        });

        registerProperty();

        registerMode();

        registerMachineMaxMenu();

        showToast('MachineMax 插件已加载，在模式栏中选择 "零件定义" 开始使用', 'positive');
        log.info('插件初始化完成');
    },
    onunload() {
        log.info('卸载 MachineMax Blockbench 插件');
        unregisterActions();
        unregisterMachineMaxMenu();
        log.debug('插件清理完成');
    },
});
