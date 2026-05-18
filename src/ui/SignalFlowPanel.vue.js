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
            // 端口分派（几何匹配，基于力导向布局后的节点坐标）
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
         * 获取端口相对节点的偏移坐标（8端口模型）
         * 垂直边(左/右)的端口平行偏移方向为垂直；水平边(上/下)的端口平行偏移方向为水平
         * @param {string} port - 'right-out'|'right-in'|'bottom-out'|'bottom-in'|'left-out'|'left-in'|'top-out'|'top-in'
         * @param {number} index - 该端口上第几条边（0-based），用于平行偏移
         * @returns {{x: number, y: number}}
         */
        _portOffset: function (port, index) {
            var NODE_W = 140;
            var NODE_H = 32;
            // 输出端口（-out）共用同一起点，不偏移；输入端口（-in）叠加偏移避免重叠
            var isOutput = port && port.indexOf('-out') >= 0;
            var offset = (isOutput ? 0 : (index || 0)) * 6;
            switch (port) {
                case 'right-out': return { x: NODE_W, y: 10 };
                case 'right-in':  return { x: NODE_W, y: 21 + offset };
                case 'left-in':   return { x: 0, y: 10 + offset };
                case 'left-out':  return { x: 0, y: 21 };
                case 'bottom-in': return { x: 46 + offset, y: NODE_H };
                case 'bottom-out':return { x: 93, y: NODE_H };
                case 'top-out':   return { x: 46, y: 0 };
                case 'top-in':    return { x: 93 + offset, y: 0 };
                default:          return { x: NODE_W, y: 10 };
            }
        },

        /**
         * 端口小圆圈的 X 坐标（相对节点左上角，模板用 v-for 调用）
         * 8端口模型：左/右侧端口在边两端(0/140)，上/下端口中输出偏左(46)输入偏右(93)
         */
        portX: function (port) {
            switch (port) {
                case 'right-out': case 'right-in': return 140;
                case 'left-in': case 'left-out':   return 0;
                case 'top-out': case 'bottom-in':  return 46;
                case 'top-in': case 'bottom-out':  return 93;
                default: return 0;
            }
        },

        /**
         * 端口小圆圈的 Y 坐标（相对节点左上角）
         * 8端口模型：左/右侧端口输出偏上(10)输入偏下(21)，上/下端口在边两端(0/32)
         */
        portY: function (port) {
            switch (port) {
                case 'right-out': case 'left-in':   return 10;
                case 'right-in': case 'left-out':   return 21;
                case 'top-out': case 'top-in':      return 0;
                case 'bottom-in': case 'bottom-out': return 32;
                default: return 0;
            }
        },

        /**
         * 获取端口法线方向（控制点延伸方向）：法线总是朝节点外
         * 支持8端口：right-out/right-in 朝右，bottom-out/bottom-in 朝下，
         *           left-out/left-in 朝左，top-out/top-in 朝上
         */
        _portNormal: function (port) {
            switch (port) {
                case 'right-out': case 'right-in': return { x: 1, y: 0 };
                case 'bottom-out': case 'bottom-in': return { x: 0, y: 1 };
                case 'left-out': case 'left-in': return { x: -1, y: 0 };
                case 'top-out': case 'top-in': return { x: 0, y: -1 };
                default: return { x: 1, y: 0 };
            }
        },

        /**
         * 计算两个节点之间的连线路径（贝塞尔曲线，按端口分派）
         * 控制点沿端口法线方向延伸，支持8方向端口
         */
        computeEdgePath: function (edge) {
            var src = this._findNode(edge.from);
            var tgt = this._findNode(edge.to);
            if (!src || !tgt) return '';

            var sp = this._portOffset(edge._srcPort || 'right-out', edge._srcIdx || 0);
            var tp = this._portOffset(edge._tgtPort || 'left-in', edge._tgtIdx || 0);

            var x1 = src.x + sp.x;
            var y1 = src.y + sp.y;
            var x2 = tgt.x + tp.x;
            var y2 = tgt.y + tp.y;

            // 控制点从端口法线方向延伸
            var dx = x2 - x1;
            var dy = y2 - y1;
            var cpLen = Math.max(40, Math.abs(dx) * 0.4, Math.abs(dy) * 0.4);

            var sn = this._portNormal(edge._srcPort || 'right-out');
            var tn = this._portNormal(edge._tgtPort || 'left-in');

            var cpx1 = x1 + sn.x * cpLen;
            var cpy1 = y1 + sn.y * cpLen;
            var cpx2 = x2 + tn.x * cpLen;
            var cpy2 = y2 + tn.y * cpLen;

            return 'M' + x1.toFixed(1) + ',' + y1.toFixed(1)
                + ' C' + cpx1.toFixed(1) + ',' + cpy1.toFixed(1)
                + ' ' + cpx2.toFixed(1) + ',' + cpy2.toFixed(1)
                + ' ' + x2.toFixed(1) + ',' + y2.toFixed(1);
        },
        /**
         * 计算连线标签位置（贝塞尔曲线中点，使用三次贝塞尔 t=0.5 精确公式）
         */
        edgeLabelPos: function (edge) {
            var src = this._findNode(edge.from);
            var tgt = this._findNode(edge.to);
            if (!src || !tgt) return { x: 0, y: 0 };

            var sp = this._portOffset(edge._srcPort || 'right-out', edge._srcIdx || 0);
            var tp = this._portOffset(edge._tgtPort || 'left-in', edge._tgtIdx || 0);

            var x1 = src.x + sp.x;
            var y1 = src.y + sp.y;
            var x2 = tgt.x + tp.x;
            var y2 = tgt.y + tp.y;

            var dx = x2 - x1;
            var dy = y2 - y1;
            var cpLen = Math.max(40, Math.abs(dx) * 0.4, Math.abs(dy) * 0.4);

            var sn = this._portNormal(edge._srcPort || 'right-out');
            var tn = this._portNormal(edge._tgtPort || 'left-in');

            var cpx1 = x1 + sn.x * cpLen;
            var cpy1 = y1 + sn.y * cpLen;
            var cpx2 = x2 + tn.x * cpLen;
            var cpy2 = y2 + tn.y * cpLen;

            // 三次贝塞尔 t=0.5 精确中点: P = (P0 + 3*P1 + 3*P2 + P3) / 8
            var mx = (x1 + 3 * cpx1 + 3 * cpx2 + x2) / 8;
            var my = (y1 + 3 * cpy1 + 3 * cpy2 + y2) / 8;

            return { x: mx, y: my - 12 };
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
 * 在数组中按 id 查找节点（独立函数，非 Vue 方法）
 */
function _findNodeById(nodes, id) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) return nodes[i];
    }
    return null;
}

/**
 * 为每条边分派输入/输出端口（端口渲染位置），让信号流图更直观。
 *
 * 使用几何匹配策略：根据源节点→目标节点的实际方向，选择朝向目标的那一侧输出端口；
 * 同时目标节点选择朝向源的那一侧输入端口。
 * 多条边共用同一端口时，按 _srcIdx/_tgtIdx 做平行偏移。
 *
 * 输出端口选择：
 *   target 在右侧 → right-out | 在下方 → bottom-out | 在左侧 → left-out | 在上方 → top-out
 * 输入端口选择：
 *   source 在左侧 → left-in | 在上方 → top-in | 在右侧 → right-in | 在下方 → bottom-in
 *
 * 每条边获得 _srcPort/_srcIdx（源节点的端口+序号）和 _tgtPort/_tgtIdx（目标节点的端口+序号）。
 *
 * @param {Object[]} nodes - 节点数组（需含 x/y 坐标，由 forceLayout 设置）
 * @param {Object[]} edges - 边数组
 */
function _assignPortRoles(nodes, edges) {
    // 每个节点每个端口的计数器，用于平行偏移
    var srcIdxMap = {};
    var tgtIdxMap = {};

    for (var ei = 0; ei < edges.length; ei++) {
        var e = edges[ei];
        var src = _findNodeById(nodes, e.from);
        var tgt = _findNodeById(nodes, e.to);

        var srcPort = 'right-out';
        var tgtPort = 'left-in';

        if (src && tgt) {
            // 源→目标方向向量
            var dx = tgt.x - src.x;
            var dy = tgt.y - src.y;

            // 选择源节点输出端口：以绝对方向为准，哪边最朝向目标
            // 使用 45° 分界（|dx| >= |dy| 表示水平主导）
            if (Math.abs(dx) >= Math.abs(dy)) {
                srcPort = dx >= 0 ? 'right-out' : 'left-out';
            } else {
                srcPort = dy >= 0 ? 'bottom-out' : 'top-out';
            }

            // 选择目标节点输入端口：输入端口应朝向源节点的方向
            var sx = src.x - tgt.x;
            var sy = src.y - tgt.y;
            if (Math.abs(sx) >= Math.abs(sy)) {
                tgtPort = sx >= 0 ? 'right-in' : 'left-in';
            } else {
                tgtPort = sy >= 0 ? 'bottom-in' : 'top-in';
            }
        }

        // 分配端口 + 平行偏移索引
        var srcKey = e.from + '::' + srcPort;
        if (!srcIdxMap[srcKey]) srcIdxMap[srcKey] = 0;
        e._srcPort = srcPort;
        e._srcIdx = srcIdxMap[srcKey]++;

        var tgtKey = e.to + '::' + tgtPort;
        if (!tgtIdxMap[tgtKey]) tgtIdxMap[tgtKey] = 0;
        e._tgtPort = tgtPort;
        e._tgtIdx = tgtIdxMap[tgtKey]++;

        _markNodePort(nodes, e.from, srcPort, true);
        _markNodePort(nodes, e.to, tgtPort, false);
    }
}

/**
 * 在节点上标记端口的活跃状态，供模板渲染端口小圆圈
 * @param {Object[]} nodes
 * @param {string} nodeId
 * @param {string} port - 'right-out'|'right-in'|'bottom-out'|'bottom-in'|'left-out'|'left-in'|'top-out'|'top-in'
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
