/**
 * 信号流图数据模型 — 从配置中提取信号拓扑图 + 力导向布局
 *
 * 纯函数模块，不依赖 Vue / Blockbench。
 * 输入当前变体配置，输出 { nodes, edges } 供 SVG 渲染。
 */

/**
 * 从变体配置中提取信号拓扑图的节点集和边集
 *
 * @param {Object} variant - 当前变体配置对象
 * @returns {{ nodes: Object[], edges: Object[] }}
 *   nodes: [{ id, type, subPart, label, subType?, locator? }]
 *   edges: [{ from, to, channel, type }]
 */
function extractSignalGraph(variant) {
    var nodes = [];
    var edges = [];
    var nodeMap = {}; // id → true，去重
    var seenSpecialTargets = {}; // 特殊目标去重

    if (!variant || !variant.sub_parts) return { nodes: [], edges: [] };

    for (var spKey in variant.sub_parts) {
        var sp = variant.sub_parts[spKey];
        if (!sp) continue;

        // === 连接点 → 节点 + 边 ===
        if (sp.connectors) {
            for (var connKey in sp.connectors) {
                var conn = sp.connectors[connKey];
                if (!conn) continue;
                if (!nodeMap[connKey]) {
                    nodeMap[connKey] = true;
                    nodes.push({
                        id: connKey,
                        type: 'connector',
                        subPart: spKey,
                        label: _shortName(connKey),
                        locator: conn.locator || '',
                    });
                }
                // signal_targets: { channel → [targets] }
                if (conn.signal_targets) {
                    for (var channel in conn.signal_targets) {
                        var targets = conn.signal_targets[channel];
                        if (!targets || !Array.isArray(targets)) continue;
                        for (var ti = 0; ti < targets.length; ti++) {
                            var tgt = targets[ti];
                            if (!tgt) continue;
                            _ensureNodeForTarget(tgt, sp, nodeMap, nodes, seenSpecialTargets, spKey);
                            edges.push({ from: connKey, to: tgt, channel: channel, type: 'signal' });
                        }
                    }
                }
                // power_target
                if (conn.power_target) {
                    var pt = conn.power_target;
                    _ensureNodeForTarget(pt, sp, nodeMap, nodes, seenSpecialTargets, spKey);
                    edges.push({ from: connKey, to: pt, channel: 'power', type: 'power' });
                }
            }
        }

        // === 子系统 → 节点 + 边 ===
        if (sp.subsystems) {
            for (var ssKey in sp.subsystems) {
                var ss = sp.subsystems[ssKey];
                if (!ss) continue;
                if (!nodeMap[ssKey]) {
                    nodeMap[ssKey] = true;
                    nodes.push({
                        id: ssKey,
                        type: 'subsystem',
                        subPart: spKey,
                        label: _shortName(ssKey),
                        subType: ss.type || '',
                    });
                }
                // 遍历子系统所有 *_outputs 字段
                var outputFields = _getSignalOutputFields(ss);
                for (var fi = 0; fi < outputFields.length; fi++) {
                    var field = outputFields[fi];
                    var val = ss[field];
                    if (!val) continue;
                    if (typeof val === 'string') {
                        // 单值目标：power_output, 部分场景
                        if (val) {
                            _ensureNodeForTarget(val, sp, nodeMap, nodes, seenSpecialTargets, spKey);
                            edges.push({ from: ssKey, to: val, channel: field, type: _edgeTypeForField(field) });
                        }
                    } else if (typeof val === 'object' && !Array.isArray(val)) {
                        // 键值对：{ channel → [targets] }
                        for (var ch in val) {
                            var tgts = val[ch];
                            if (!tgts) continue;
                            if (Array.isArray(tgts)) {
                                for (var tji = 0; tji < tgts.length; tji++) {
                                    var t = tgts[tji];
                                    if (!t) continue;
                                    _ensureNodeForTarget(t, sp, nodeMap, nodes, seenSpecialTargets, spKey);
                                    edges.push({ from: ssKey, to: t, channel: ch, type: _edgeTypeForField(field) });
                                }
                            } else if (typeof tgts === 'string') {
                                // power_outputs: { target: ratio }
                                _ensureNodeForTarget(tgts, sp, nodeMap, nodes, seenSpecialTargets, spKey);
                                edges.push({ from: ssKey, to: tgts, channel: ch, type: _edgeTypeForField(field) });
                            }
                        }
                    }
                }
            }
        }
    }

    return { nodes: nodes, edges: edges };
}

/**
 * 确保目标节点存在于 nodes 数组中
 * 特殊目标 'subpart' / 'vehicle' 自动创建
 * 其他目标尝试在当前子零件或全局查找对应节点
 */
function _ensureNodeForTarget(target, sp, nodeMap, nodes, seenSpecialTargets, currentSpKey) {
    if (!target) return;
    if (target === 'subpart' || target === 'vehicle') {
        if (!seenSpecialTargets[target]) {
            seenSpecialTargets[target] = true;
            nodeMap[target] = true;
            nodes.push({
                id: target,
                type: 'special',
                subPart: currentSpKey,
                label: target,
            });
        }
        return;
    }
    // 其他目标名：可能指向子系统或连接点，如果在节点映射中不存在，
    // 也作为未解析的灰色节点创建
    if (!nodeMap[target]) {
        nodeMap[target] = true;
        nodes.push({
            id: target,
            type: 'unresolved',
            subPart: currentSpKey,
            label: _shortName(target),
        });
    }
}

/**
 * 获取子系统的信号输出字段列表
 */
function _getSignalOutputFields(ss) {
    var knownOutputs = [
        'power_output', 'power_outputs',
        'control_outputs', 'speed_outputs',
        'throttle_outputs', 'brake_outputs',
        'steering_outputs', 'handbrake_outputs',
        'gear_outputs', 'move_outputs',
        'regular_outputs', 'aim_outputs',
        'passenger_num_outputs', 'fire_outputs',
    ];
    var result = [];
    for (var i = 0; i < knownOutputs.length; i++) {
        if (ss[knownOutputs[i]] !== undefined && ss[knownOutputs[i]] !== null) {
            result.push(knownOutputs[i]);
        }
    }
    return result;
}

/**
 * 根据信号输出字段名判断边的类型
 */
function _edgeTypeForField(field) {
    if (field === 'power_output' || field === 'power_outputs') return 'power';
    if (field === 'speed_outputs' || field === 'speed_output') return 'speed';
    return 'control';
}

/**
 * 从完整 key 名中提取短名用于节点显示
 * "subsystem.machine_max.engine" → "engine"
 * "connector.machine_max.left_front_wheel" → "...left_front_wheel"
 */
function _shortName(fullKey) {
    if (!fullKey) return '';
    var parts = fullKey.split('.');
    if (parts.length <= 1) {
        // 短名截取最后 16 字符
        return fullKey.length > 16 ? fullKey.substring(0, 14) + '…' : fullKey;
    }
    // 取最后一段（通常是名称）
    var last = parts[parts.length - 1];
    if (last.length > 18) return last.substring(0, 16) + '…';
    return last;
}

/**
 * 简易力导向布局算法
 * 不引入 d3-force 依赖，自实现弹簧-斥力模型
 *
 * @param {Object[]} nodes - 节点数组（原样扩展 x/y/vx/vy）
 * @param {Object[]} edges - 边数组
 * @param {Object} [options]
 * @param {number} [options.width=600] - 画布宽度
 * @param {number} [options.height=300] - 画布高度
 * @param {number} [options.repulsion=2000] - 电荷斥力强度
 * @param {number} [options.attraction=0.005] - 弹簧引力系数
 * @param {number} [options.idealLength=140] - 期望边长(px)
 * @param {number} [options.iterations=80] - 迭代次数
 * @param {number} [options.damping=0.85] - 阻尼系数
 * @returns {Object[]} 布局后的 nodes（含 x/y 坐标）
 */
function forceLayout(nodes, edges, options) {
    if (!nodes || nodes.length === 0) return nodes || [];
    var opts = options || {};
    var width = opts.width || 600;
    var height = opts.height || 300;
    var repulsion = opts.repulsion || 2000;
    var attraction = opts.attraction || 0.005;
    var idealLength = opts.idealLength || 140;
    var iterations = opts.iterations || 80;
    var damping = opts.damping || 0.85;

    // 初始化随机位置（用简单种子分散，避免全部叠在中心）
    for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n.x === undefined || n.y === undefined) {
            var angle = (i / nodes.length) * Math.PI * 2;
            var radius = Math.min(width, height) * 0.3;
            n.x = width / 2 + Math.cos(angle) * radius * (0.5 + Math.random() * 0.5);
            n.y = height / 2 + Math.sin(angle) * radius * (0.5 + Math.random() * 0.5);
        }
        n.vx = 0;
        n.vy = 0;
    }

    var nodeCount = nodes.length;
    // 建立 from→to 快速查找（用于弹簧引力）
    var edgeMap = {};
    for (var ei = 0; ei < edges.length; ei++) {
        var e = edges[ei];
        if (!edgeMap[e.from]) edgeMap[e.from] = {};
        if (!edgeMap[e.to]) edgeMap[e.to] = {};
        edgeMap[e.from][e.to] = true;
        edgeMap[e.to][e.from] = true;
    }

    for (var iter = 0; iter < iterations; iter++) {
        // 电荷斥力（所有节点对）
        for (var ai = 0; ai < nodeCount; ai++) {
            for (var aj = ai + 1; aj < nodeCount; aj++) {
                var na = nodes[ai];
                var nb = nodes[aj];
                var dx = nb.x - na.x;
                var dy = nb.y - na.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 1) dist = 1;
                var force = repulsion / (dist * dist);
                var fx = force * (dx / dist);
                var fy = force * (dy / dist);
                na.vx -= fx;
                na.vy -= fy;
                nb.vx += fx;
                nb.vy += fy;
            }
        }

        // 弹簧引力（有边连接的节点）
        for (var eji = 0; eji < edges.length; eji++) {
            var edge = edges[eji];
            var src = _findNode(nodes, edge.from);
            var tgt = _findNode(nodes, edge.to);
            if (!src || !tgt) continue;
            var ex = tgt.x - src.x;
            var ey = tgt.y - src.y;
            var ed = Math.sqrt(ex * ex + ey * ey);
            if (ed < 1) ed = 1;
            var springForce = attraction * (ed - idealLength);
            var sfx = springForce * (ex / ed);
            var sfy = springForce * (ey / ed);
            src.vx += sfx;
            src.vy += sfy;
            tgt.vx -= sfx;
            tgt.vy -= sfy;
        }

        // 中心引力（防止整体散开）
        var cx = width / 2;
        var cy = height / 2;
        for (var ci = 0; ci < nodeCount; ci++) {
            var nc = nodes[ci];
            nc.vx += (cx - nc.x) * 0.002;
            nc.vy += (cy - nc.y) * 0.002;
        }

        // 更新位置（阻尼）
        var margin = 30;
        for (var ui = 0; ui < nodeCount; ui++) {
            var nu = nodes[ui];
            nu.vx *= damping;
            nu.vy *= damping;
            nu.x += nu.vx;
            nu.y += nu.vy;
            nu.x = Math.max(margin, Math.min(width - margin, nu.x));
            nu.y = Math.max(margin, Math.min(height - margin, nu.y));
        }
    }

    // 清理临时速度属性
    for (var cli = 0; cli < nodeCount; cli++) {
        delete nodes[cli].vx;
        delete nodes[cli].vy;
    }

    return nodes;
}

function _findNode(nodes, id) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) return nodes[i];
    }
    return null;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extractSignalGraph: extractSignalGraph,
        forceLayout: forceLayout,
        _shortName: _shortName,
    };
}
