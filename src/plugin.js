const { registerProperty } = require('./utils/persistence.js');
const { registerMode } = require('./mode.js');

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
    version: '0.1.0',
    variant: 'desktop',
    onload() {
        console.log('[MM Plugin]  加载 MachineMax Blockbench 插件 v0.1.0');

        registerProperty();

        registerMode();

        Blockbench.showToast('MachineMax 插件已加载，在模式栏中选择 "零件定义" 开始使用', 'positive');
    },
    onunload() {
        console.log('[MM Plugin]  卸载 MachineMax Blockbench 插件');
    },
});
