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
            // 计算平行边索引 + 端口分派
            _assignParallelIndices(graph.edges);
            _assignPortRoles(graph.nodes, graph.edges);
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
         * 获取端口相对节点的偏移坐标
         * @param {string} port - 'right' | 'bottom' | 'left' | 'top'
         * @param {number} index - 该端口上第几条边（0-based），用于平行偏移
         * @returns {{x: number, y: number}}
         */
        _portOffset: function (port, index) {
            var NODE_W = 140;
            var NODE_H = 32;
            var parallelStep = 6;
            var offset = (index || 0) * parallelStep;
            switch (port) {
                case 'right':  return { x: NODE_W, y: 16 + offset - 6 };
                case 'bottom': return { x: 70 + offset - 6, y: NODE_H };
                case 'left':   return { x: 0,   y: 16 + offset - 6 };
                case 'top':    return { x: 70 + offset - 6, y: 0 };
                default:       return { x: NODE_W, y: 16 };
            }
        },

        /**
         * 端口小圆圈的 X 坐标（相对节点左上角，模板用 v-for 调用）
         */
        portX: function (port) {
            switch (port) {
                case 'right':  return 140;
                case 'left':   return 0;
                case 'bottom': return 70;
                case 'top':    return 70;
                default:       return 0;
            }
        },

        /**
         * 端口小圆圈的 Y 坐标（相对节点左上角）
         */
        portY: function (port) {
            switch (port) {
                case 'right':  return 16;
                case 'left':   return 16;
                case 'bottom': return 32;
                case 'top':    return 0;
                default:       return 0;
            }
        },

        /**
         * 计算两个节点之间的连线路径（贝塞尔曲线，按端口分派）
         * 输出端口：右侧（主）或底部（次）
         * 输入端口：左侧（主）或顶部（次）
         */
        computeEdgePath: function (edge) {
            var src = this._findNode(edge.from);
            var tgt = this._findNode(edge.to);
            if (!src || !tgt) return '';

            var sp = this._portOffset(edge._outPort || 'right', edge._outIdx || 0);
            var tp = this._portOffset(edge._inPort || 'left', edge._inIdx || 0);

            var x1 = src.x + sp.x;
            var y1 = src.y + sp.y;
            var x2 = tgt.x + tp.x;
            var y2 = tgt.y + tp.y;

            // 贝塞尔控制点：从端口法线方向延伸
            // 右侧/左侧端口 → 水平控制点；底部/顶部端口 → 垂直控制点
            var dx = x2 - x1;
            var dy = y2 - y1;
            var cpLen = Math.max(40, Math.abs(dx) * 0.4, Math.abs(dy) * 0.4);

            var cpx1, cpy1, cpx2, cpy2;
            if (edge._outPort === 'bottom' || edge._inPort === 'top') {
                // 垂直走向端口：主要用垂直控制点
                cpx1 = x1;
                cpy1 = y1 + cpLen;
                cpx2 = x2;
                cpy2 = y2 - cpLen;
            } else {
                // 水平走向端口（默认）：主要用水平控制点
                cpx1 = x1 + cpLen;
                cpy1 = y1;
                cpx2 = x2 - cpLen;
                cpy2 = y2;
            }

            return 'M' + x1.toFixed(1) + ',' + y1.toFixed(1)
                + ' C' + cpx1.toFixed(1) + ',' + cpy1.toFixed(1)
                + ' ' + cpx2.toFixed(1) + ',' + cpy2.toFixed(1)
                + ' ' + x2.toFixed(1) + ',' + y2.toFixed(1);
        },
        /**
         * 计算连线标签位置（贝塞尔曲线中点偏上）
         */
        edgeLabelPos: function (edge) {
            var src = this._findNode(edge.from);
            var tgt = this._findNode(edge.to);
            if (!src || !tgt) return { x: 0, y: 0 };
            var sp = this._portOffset(edge._outPort || 'right', edge._outIdx || 0);
            var tp = this._portOffset(edge._inPort || 'left', edge._inIdx || 0);
            var x1 = src.x + sp.x;
            var y1 = src.y + sp.y;
            var x2 = tgt.x + tp.x;
            var y2 = tgt.y + tp.y;
            // 贝塞尔曲线中点近似
            var cpLen = Math.max(40, Math.abs(x2 - x1) * 0.4, Math.abs(y2 - y1) * 0.4);
            var cpx, cpy;
            if (edge._outPort === 'bottom' || edge._inPort === 'top') {
                cpx = (x1 + x2) / 2;
                cpy = (y1 + y2) / 2 + cpLen * 0.3;
            } else {
                cpx = (x1 + x2) / 2;
                cpy = (y1 + y2) / 2 - cpLen * 0.15;
            }
            return { x: cpx, y: cpy - 10 };
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
            _assignPortRoles(graph.nodes, graph.edges);
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
        var key = e.from < e.to ? e.from + '::' + e.to : e.to + '::' + e.from;
        if (!groups[key]) groups[key] = [];
        groups[key].push(e);
    }
    for (var k in groups) {
        var group = groups[k];
        if (group.length > 1) {
            var mid = (group.length - 1) / 2;
            for (var gi = 0; gi < group.length; gi++) {
                group[gi]._parallelIndex = gi - mid;
            }
        }
    }
}

/**
 * 为每条边分派输入/输出端口（端口渲染位置），让信号流图更直观。
 *
 * 输出端口（信号从此离开）：
 *   - 前一半 → 右侧（水平方向主输出）
 *   - 后一半 → 底部（垂直方向次输出）
 * 输入端口（信号从此到达）：
 *   - 前一半 → 左侧（水平方向主输入）
 *   - 后一半 → 顶部（垂直方向次输入）
 *
 * 每条边获得 _outPort/_outIdx（源节点的端口+序号）和 _inPort/_inIdx（目标节点的端口+序号）。
 *
 * @param {Object[]} nodes - 节点数组
 * @param {Object[]} edges - 边数组
 */
function _assignPortRoles(nodes, edges) {
    // 统计每个节点作为源/目标的边
    var outEdges = {}; // nodeId → [edge, ...]
    var inEdges = {};  // nodeId → [edge, ...]
    for (var i = 0; i < edges.length; i++) {
        var e = edges[i];
        if (!outEdges[e.from]) outEdges[e.from] = [];
        outEdges[e.from].push(e);
        if (!inEdges[e.to]) inEdges[e.to] = [];
        inEdges[e.to].push(e);
    }

    // 分配输出端口
    for (var srcId in outEdges) {
        var list = outEdges[srcId];
        var half = Math.ceil(list.length / 2);
        for (var oi = 0; oi < list.length; oi++) {
            var oe = list[oi];
            oe._outPort = oi < half ? 'right' : 'bottom';
            oe._outIdx = oi < half ? oi : oi - half;
            // 在节点上标记端口活跃数
            _markNodePort(nodes, srcId, oe._outPort, true);
        }
    }

    // 分配输入端口
    for (var tgtId in inEdges) {
        var list = inEdges[tgtId];
        var half = Math.ceil(list.length / 2);
        for (var ii = 0; ii < list.length; ii++) {
            var ie = list[ii];
            ie._inPort = ii < half ? 'left' : 'top';
            ie._inIdx = ii < half ? ii : ii - half;
            _markNodePort(nodes, tgtId, ie._inPort, false);
        }
    }
}

/**
 * 在节点上标记端口的活跃状态，供模板渲染端口小圆圈
 * @param {Object[]} nodes
 * @param {string} nodeId
 * @param {string} port - 'right'|'bottom'|'left'|'top'
 * @param {boolean} isOutput
 */
function _markNodePort(nodes, nodeId, port, isOutput) {
    for (var ni = 0; ni < nodes.length; ni++) {
        if (nodes[ni].id === nodeId) {
            if (!nodes[ni]._ports) nodes[ni]._ports = [];
            // 去重
            var exists = false;
            for (var pi = 0; pi < nodes[ni]._ports.length; pi++) {
                if (nodes[ni]._ports[pi].port === port) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                nodes[ni]._ports.push({ port: port, isOutput: isOutput });
            }
            break;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Vue.component('mm-signal-flow-panel');
}
