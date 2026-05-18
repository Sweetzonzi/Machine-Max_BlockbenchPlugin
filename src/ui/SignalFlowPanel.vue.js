/**
 * 信号流图面板 — 信号拓扑预览 Phase 2
 *
 * 显示当前零件变体内所有子系统、连接点之间的信号流向和动力传输关系。
 *
 * 数据流程：variant config → extractSignalGraph() → forceLayout() → SVG render
 */
var { getConfig, loadConfig } = require('../utils/persistence.js');
var { extractSignalGraph, forceLayout } = require('../lib/signal_graph.js');
var { getTypeColor } = require('../core/subsystem_types.js');
var ssTypes = require('../core/subsystem_types.js');
var { createLogger } = require('../utils/logger.js');

var log = createLogger('SignalFlow');

Vue.component('mm-signal-flow-panel', {
    template: typeof TEMPLATE_SIGNAL_FLOW_PANEL !== 'undefined' ? TEMPLATE_SIGNAL_FLOW_PANEL : '<div class="mm-signal-flow"><p>信号流图加载中...</p></div>',
    data: function () {
        return {
            config: null,
            activePartId: '',
            activeVariantName: '',
            // 拓扑图状态
            nodes: [],
            edges: [],
            hoveredNode: null,
            hoveredEdge: null,
            // 画布变换
            panX: 0,
            panY: 0,
            zoom: 1.0,
            isPanning: false,
            panStartX: 0,
            panStartY: 0,
            panStartPanX: 0,
            panStartPanY: 0,
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
        numNodes: function () {
            return this.nodes.length;
        },
        numEdges: function () {
            return this.edges.length;
        },
        svgWidth: function () {
            return 800;
        },
        svgHeight: function () {
            return 350;
        },
        hasEmptyGraph: function () {
            return this.hasActiveSelection && this.nodes.length === 0 && this.edges.length === 0;
        },
        hasGraph: function () {
            return this.nodes.length > 0;
        },
        layoutNodes: function () {
            return this.nodes;
        },
        layoutEdges: function () {
            return this.edges;
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
            this.rebuildGraph();
        },
        onSelectionChange: function () {
            // 信号流图只关心零件/变体选择，不关心具体 Outliner 元素选中
        },
        /**
         * 根据当前变体重建信号拓扑图（数据提取 → 力导向布局）
         */
        rebuildGraph: function () {
            var variant = this.currentVariant;
            if (!variant) {
                this.nodes = [];
                this.edges = [];
                return;
            }
            var graph = extractSignalGraph(variant);
            log.debug('rebuildGraph: 信号拓扑提取完成', {
                nodes: graph.nodes.length,
                edges: graph.edges.length,
            });
            forceLayout(graph.nodes, graph.edges, {
                width: this.svgWidth,
                height: this.svgHeight,
                iterations: 60,
            });
            this.nodes = graph.nodes;
            this.edges = graph.edges;
        },
        /**
         * 获取节点的 SVG 填充颜色
         */
        nodeColor: function (node) {
            if (!node) return '#555';
            switch (node.type) {
                case 'connector': return '#3AA83A';
                case 'subsystem':
                    if (node.subType) return getTypeColor(node.subType) || '#4A90D9';
                    return '#4A90D9';
                case 'special': return '#666';
                case 'unresolved': return '#555';
                default: return '#555';
            }
        },
        /**
         * 获取节点类型的中文名
         */
        nodeTypeLabel: function (node) {
            if (!node) return '';
            switch (node.type) {
                case 'connector': return '连接点';
                case 'subsystem':
                    if (node.subType) {
                        var meta = ssTypes.getTypeMeta(node.subType);
                        return meta ? meta.displayName : node.subType;
                    }
                    return '子系统';
                case 'special': return '特殊目标';
                case 'unresolved': return '未解析目标';
                default: return '节点';
            }
        },
        /**
         * 获取边的颜色
         */
        edgeColor: function (edge) {
            if (!edge) return '#555';
            switch (edge.type) {
                case 'power': return '#e67e22';
                case 'speed': return '#3498db';
                case 'signal': return '#7f8c8d';
                case 'control': return '#2ecc71';
                default: return '#7f8c8d';
            }
        },
        /**
         * 获取边的类型中文名
         */
        edgeTypeLabel: function (edge) {
            if (!edge) return '';
            switch (edge.type) {
                case 'power': return '动力';
                case 'speed': return '转速';
                case 'signal': return '信号';
                case 'control': return '控制';
                default: return '连接';
            }
        },
        /**
         * 计算两个节点之间的连线路径（直线）
         * 节点宽度 ~130px, 高度 ~32px
         */
        computeEdgePath: function (edge) {
            var NODE_W = 130;
            var NODE_H = 32;
            var src = this._findNode(edge.from);
            var tgt = this._findNode(edge.to);
            if (!src || !tgt) return '';
            // 起点：源节点右侧中心
            var x1 = src.x + NODE_W;
            var y1 = src.y + NODE_H / 2;
            // 终点：目标节点左侧中心
            var x2 = tgt.x;
            var y2 = tgt.y + NODE_H / 2;
            // 如果目标在源左侧，使用源左侧 / 目标右侧
            if (tgt.x + NODE_W < src.x) {
                x1 = src.x;
                y1 = src.y + NODE_H / 2;
                x2 = tgt.x + NODE_W;
                y2 = tgt.y + NODE_H / 2;
            }
            // 简单直线
            return 'M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' L' + x2.toFixed(1) + ',' + y2.toFixed(1);
        },
        /**
         * 计算连线标签位置（中点偏上）
         */
        edgeLabelPos: function (edge) {
            var NODE_W = 130;
            var NODE_H = 32;
            var src = this._findNode(edge.from);
            var tgt = this._findNode(edge.to);
            if (!src || !tgt) return { x: 0, y: 0 };
            var x1 = src.x + NODE_W;
            var y1 = src.y + NODE_H / 2;
            var x2 = tgt.x;
            var y2 = tgt.y + NODE_H / 2;
            if (tgt.x + NODE_W < src.x) {
                x1 = src.x;
                y1 = src.y + NODE_H / 2;
                x2 = tgt.x + NODE_W;
                y2 = tgt.y + NODE_H / 2;
            }
            return {
                x: (x1 + x2) / 2,
                y: (y1 + y2) / 2 - 8,
            };
        },
        /**
         * 在数组中按 id 查找节点
         */
        _findNode: function (id) {
            var nodes = this.nodes;
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].id === id) return nodes[i];
            }
            return null;
        },
        /**
         * 显示节点完整信息（悬停 tooltip 用）
         */
        nodeTooltip: function (node) {
            if (!node) return '';
            var lines = [node.id];
            lines.push('类型: ' + this.nodeTypeLabel(node));
            lines.push('所属: ' + node.subPart);
            if (node.locator) lines.push('locator: ' + node.locator);
            if (node.subType) lines.push('subType: ' + node.subType);
            return lines.join('\n');
        },
        /**
         * 点击节点 → 导航到对应属性面板
         * 子系统 → 设置 subsystemSelection 触发子系统面板
         * 连接点 → 选中对应的 Locator
         */
        onNodeClick: function (node) {
            if (!node) return;
            if (node.type === 'subsystem') {
                // 触发子系统虚拟选择
                this.$root.subsystemSelection = { spKey: node.subPart, subsystemKey: node.id };
                // 通知左侧面板更新
                Blockbench.dispatchEvent('update_selection');
            } else if (node.type === 'connector') {
                // 选中对应的 Locator
                var locName = node.locator;
                if (locName && typeof Locator !== 'undefined') {
                    var loc = Locator.all.find(function (l) { return l.name === locName; });
                    if (loc) {
                        loc.select();
                        loc.showInOutliner();
                        Blockbench.dispatchEvent('update_selection');
                    }
                }
            }
        },
        /**
         * 画布缩放（滚轮）
         */
        onWheel: function (event) {
            event.preventDefault();
            var delta = event.deltaY > 0 ? 0.9 : 1.1;
            var newZoom = Math.max(0.3, Math.min(3.0, this.zoom * delta));
            this.zoom = newZoom;
        },
        /**
         * 画布平移（鼠标拖拽）
         */
        onPanStart: function (event) {
            this.isPanning = true;
            this.panStartX = event.clientX;
            this.panStartY = event.clientY;
            this.panStartPanX = this.panX;
            this.panStartPanY = this.panY;
        },
        onPanMove: function (event) {
            if (!this.isPanning) return;
            var dx = event.clientX - this.panStartX;
            var dy = event.clientY - this.panStartY;
            this.panX = this.panStartPanX + dx;
            this.panY = this.panStartPanY + dy;
        },
        onPanEnd: function () {
            this.isPanning = false;
        },
        /**
         * 重新布局（重跑力导向算法）
         */
        onRelayout: function () {
            var variant = this.currentVariant;
            if (!variant) return;
            var graph = extractSignalGraph(variant);
            forceLayout(graph.nodes, graph.edges, {
                width: this.svgWidth,
                height: this.svgHeight,
                iterations: 60,
            });
            this.nodes = graph.nodes;
            this.edges = graph.edges;
        },
    },
    mounted: function () {
        var self = this;
        log.debug('信号流图面板已挂载');
        self.loadConfigData();

        this._projectHandler = Blockbench.on('select_project', function () {
            self.loadConfigData();
        });
        this._selectionHandler = Blockbench.on('update_selection', function () {
            self.loadConfigData();
        });
        this._modeHandler = Blockbench.on('select_mode', function () {
            self.loadConfigData();
        });
        this._saveHandler = Blockbench.on('save', function () {
            // 保存后重建（配置可能已变更）
            var variant = self.currentVariant;
            if (variant) {
                self.rebuildGraph();
            }
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
