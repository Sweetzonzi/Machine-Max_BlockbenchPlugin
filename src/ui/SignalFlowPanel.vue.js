/**
 * 信号流图面板 — 信号拓扑预览 Phase 2 入口
 *
 * 显示当前零件变体内所有子系统、连接点之间的信号流向和动力传输关系。
 * 初期为空壳，后续逐步添加 SVG 拓扑图渲染、力导向布局、交互跳转等功能。
 *
 * 作为独立 Panel 注册在 bottom_bar 槽位，
 * 与 mm-main-panel（左侧栏）共享配置数据。
 */
var { getConfig, loadConfig } = require('../utils/persistence.js');
const { createLogger } = require('../utils/logger.js');

var log = createLogger('SignalFlow');

console.warn('[MM][SignalFlow] 模块加载，Vue=' + (typeof Vue) + ', TEMPLATE_SIGNAL_FLOW_PANEL=' + (typeof TEMPLATE_SIGNAL_FLOW_PANEL !== 'undefined' ? 'defined' : 'undefined'));

Vue.component('mm-signal-flow-panel', {
    template: typeof TEMPLATE_SIGNAL_FLOW_PANEL !== 'undefined' ? TEMPLATE_SIGNAL_FLOW_PANEL : '<div class="mm-signal-flow"><p>信号流图加载中...</p></div>',
    data: function () {
        return {
            config: null,
            activePartId: '',
            activeVariantName: '',
            selectedElement: null,
        };
    },
    computed: {
        hasActiveSelection: function () {
            return !!(this.activePartId && this.activeVariantName);
        },
        currentPart: function () {
            if (!this.config || !this.activePartId) return null;
            return this.config.parts[this.activePartId] || null;
        },
        currentVariant: function () {
            if (!this.currentPart || !this.activeVariantName) return null;
            return this.currentPart.variants[this.activeVariantName] || null;
        },
        /**
         * 当前变体内所有子零件的子系统/连接点统计（后续用于信号图数据模型）
         */
        topologyStats: function () {
            if (!this.currentVariant || !this.currentVariant.sub_parts) {
                return { subParts: 0, subsystems: 0, connectors: 0 };
            }
            var sps = this.currentVariant.sub_parts;
            var ssCount = 0;
            var connCount = 0;
            for (var spKey in sps) {
                var sp = sps[spKey];
                if (sp.subsystems) ssCount += Object.keys(sp.subsystems).length;
                if (sp.connectors) connCount += Object.keys(sp.connectors).length;
            }
            return {
                subParts: Object.keys(sps).length,
                subsystems: ssCount,
                connectors: connCount,
            };
        },
    },
    methods: {
        loadConfigData: function () {
            var cfg = getConfig();
            if (!cfg) cfg = loadConfig();
            this.config = cfg;
            if (cfg) {
                this.activePartId = cfg._uiState?.activePartId || '';
                this.activeVariantName = cfg._uiState?.activeVariantName || '';
            }
        },
        onSelectionChange: function () {
            var sel = Outliner && Outliner.selected;
            if (!sel || sel.length === 0) {
                this.selectedElement = null;
                return;
            }
            var best = (typeof Group !== 'undefined' && Group.first_selected) || sel[0];
            this.selectedElement = best;
        },
    },
    mounted: function () {
        var self = this;
        console.warn('[MM][SignalFlow] 组件已挂载 mounted()', {
            hasConfig: !!this.config,
            hasTemplate: typeof TEMPLATE_SIGNAL_FLOW_PANEL !== 'undefined',
        });
        log.debug('信号流图面板已挂载');
        self.loadConfigData();
        self.onSelectionChange();

        this._projectHandler = Blockbench.on('select_project', function () {
            self.loadConfigData();
            self.onSelectionChange();
        });
        this._selectionHandler = Blockbench.on('update_selection', function () {
            self.onSelectionChange();
        });
        this._modeHandler = Blockbench.on('select_mode', function () {
            self.loadConfigData();
        });
        this._saveHandler = Blockbench.on('save', function () {
            self.loadConfigData();
        });
    },
    beforeDestroy: function () {
        if (this._projectHandler) this._projectHandler();
        if (this._selectionHandler) this._selectionHandler();
        if (this._modeHandler) this._modeHandler();
        if (this._saveHandler) this._saveHandler();
    },
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Vue.component('mm-signal-flow-panel');
}
