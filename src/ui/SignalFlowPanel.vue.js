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
            return 420;
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
                log.info('loadConfigData: 配置已加载', {
                    partId: this.activePartId,
                    variant: this.activeVariantName,
                    hasParts: !!cfg.parts,
                    partCount: cfg.parts ? Object.keys(cfg.parts).length : 0,
                });
            } else {
                log.warn('loadConfigData: 无有效配置');
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
                log.info('rebuildGraph: 无有效变体，清空图表');
                this.nodes = [];
                this.edges = [];
                return;
            }
            var graph = extractSignalGraph(variant);
            log.info('rebuildGraph: 信号拓扑提取完成', {
                nodes: graph.nodes.length,
                edges: graph.edges.length,
            });
            forceLayout(graph.nodes, graph.edges, {
                width: this.svgWidth,
                height: this.svgHeight,
                iterations: 80,
            });
            // 计算平行边索引（同一对节点之间的边在渲染时错开）
            _assignParallelIndices(graph.edges);
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
         * 计算两个节点之间的连线路径（三次贝塞尔曲线，带平行边偏移）
         * 节点宽度 ~140px, 高度 ~32px
         */
        computeEdgePath: function (edge) {
            var NODE_W = 140;
            var NODE_H = 32;
            var src = this._findNode(edge.from);
            var tgt = this._findNode(edge.to);
            if (!src || !tgt) return '';

            // 源节点右边缘中点，目标节点左边缘中点
            var x1 = src.x + NODE_W;
            var y1 = src.y + NODE_H / 2;
            var x2 = tgt.x;
            var y2 = tgt.y + NODE_H / 2;

            // 如果目标在源左侧，交换端点
            if (tgt.x + NODE_W < src.x) {
                x1 = src.x;
                y1 = src.y + NODE_H / 2;
                x2 = tgt.x + NODE_W;
                y2 = tgt.y + NODE_H / 2;
            }

            // 平行边偏移：同一对节点间若有多个边，在垂直方向上错开
            var parallelOffset = 0;
            if (edge._parallelIndex !== undefined) {
                parallelOffset = (edge._parallelIndex - 0) * 10;
            }

            // 贝塞尔曲线控制点偏移
            var dx = x2 - x1;
            var cpOffset = Math.max(30, Math.abs(dx) * 0.3);
            var cpx = (x1 + x2) / 2;
            var cpy = (y1 + y2) / 2 - cpOffset + parallelOffset;

            return 'M' + x1.toFixed(1) + ',' + (y1 + parallelOffset).toFixed(1)
                + ' Q' + cpx.toFixed(1) + ',' + cpy.toFixed(1)
                + ' ' + x2.toFixed(1) + ',' + (y2 + parallelOffset).toFixed(1);
        },
        /**
         * 计算连线标签位置（贝塞尔曲线中点偏上）
         */
        edgeLabelPos: function (edge) {
            var NODE_W = 140;
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
            var dx = x2 - x1;
            var cpOffset = Math.max(30, Math.abs(dx) * 0.3);
            var parallelOffset = 0;
            if (edge._parallelIndex !== undefined) {
                parallelOffset = (edge._parallelIndex - 0) * 10;
            }
            // 贝塞尔曲线 Q 的中点近似
            var cpx = (x1 + x2) / 2;
            var cpy = (y1 + y2) / 2 - cpOffset * 0.6 + parallelOffset;
            return {
                x: cpx,
                y: cpy - 10,
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
                // 通过共享的 config._uiState 通信（SignalFlowPanel 和 App.vue 是不同的 Vue root）
                var cfg = getConfig();
                if (cfg && cfg._uiState) {
                    cfg._uiState._pendingSubsystemNav = { spKey: node.subPart, subsystemKey: node.id };
                }
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
                iterations: 80,
            });
            _assignParallelIndices(graph.edges);
            this.nodes = graph.nodes;
            this.edges = graph.edges;
        },
    },
    mounted: function () {
        var self = this;
        log.info('信号流图面板已挂载');
        self.loadConfigData();

        this._projectHandler = Blockbench.on('select_project', function () {
            log.info('信号流图: select_project 事件');
            self.loadConfigData();
        });
        this._selectionHandler = Blockbench.on('update_selection', function () {
            log.info('信号流图: update_selection 事件');
            self.loadConfigData();
        });
        this._modeHandler = Blockbench.on('select_mode', function () {
            log.info('信号流图: select_mode 事件');
            self.loadConfigData();
        });
        this._saveHandler = Blockbench.on('save', function () {
            log.info('信号流图: save 事件');
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

/**
 * 为平行边（同一对节点间的多条边）分配索引，用于渲染时垂直错开
 * @param {Object[]} edges - 边数组，每条边有 {from, to}
 */
function _assignParallelIndices(edges) {
    var groups = {};
    for (var i = 0; i < edges.length; i++) {
        var e = edges[i];
        // 用有序 key 保证 (A→B) 和 (B→A) 归入同一组
        var key = e.from < e.to ? e.from + '::' + e.to : e.to + '::' + e.from;
        if (!groups[key]) groups[key] = [];
        groups[key].push(e);
    }
    for (var k in groups) {
        var group = groups[k];
        if (group.length > 1) {
            // 同一组内的边从 -n/2 到 +n/2 均匀偏移
            var mid = (group.length - 1) / 2;
            for (var gi = 0; gi < group.length; gi++) {
                group[gi]._parallelIndex = gi - mid;
            }
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Vue.component('mm-signal-flow-panel');
}
