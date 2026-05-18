/**
 * 信号流图数据模型 — 从配置中提取信号拓扑图 + 力导向布局
 *
 * 纯函数模块，不依赖 Vue / Blockbench。
 * 输入当前变体配置，输出 { nodes, edges } 供 SVG 渲染。
 *
 * 节点创建使用两遍扫描策略：
 *   第1遍：创建所有子系统和连接点节点
 *   第2遍：处理信号边，仅在目标是真正的"特殊目标"（subpart/vehicle）
 *          或完全无法匹配时才创建特殊/未解析节点
 * 避免因迭代顺序导致的"子系统被抢注为未解析节点"问题。
 */
var subsystemTypes = require('../core/subsystem_types.js');

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
    var nodeMap = {}; // id → true，去重（仅追踪 type=subsystem/connector 的节点）

    if (!variant || !variant.sub_parts) return { nodes: [], edges: [] };

    // ====================================================================
    // 第1遍：创建所有已知节点（子系统 + 连接点），不受顺序影响
    // ====================================================================
    for (var spKey in variant.sub_parts) {
        var sp = variant.sub_parts[spKey];
        if (!sp) continue;

        // 连接点
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
            }
        }

        // 子系统
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
            }
        }
    }

    // ====================================================================
    // 第2遍：处理信号边（此时所有已知节点已就位）
    // ====================================================================
    var seenSpecialTargets = {}; // 'subpart' / 'vehicle' 去重

    for (var spKey in variant.sub_parts) {
        var sp = variant.sub_parts[spKey];
        if (!sp) continue;

        // === 连接点的边 ===
        if (sp.connectors) {
            for (var connKey in sp.connectors) {
                var conn = sp.connectors[connKey];
                if (!conn) continue;

                // signal_targets: { channel → [targets] }
                if (conn.signal_targets) {
                    for (var channel in conn.signal_targets) {
                        var targets = conn.signal_targets[channel];
                        if (!targets || !Array.isArray(targets)) continue;
                        for (var ti = 0; ti < targets.length; ti++) {
                            var tgt = targets[ti];
                            if (!tgt) continue;
                            _ensureTargetNode(tgt, nodeMap, nodes, seenSpecialTargets, spKey);
                            edges.push({ from: connKey, to: tgt, channel: channel, type: 'signal' });
                        }
                    }
                }
                // power_target
                if (conn.power_target) {
                    var pt = conn.power_target;
                    _ensureTargetNode(pt, nodeMap, nodes, seenSpecialTargets, spKey);
                    edges.push({ from: connKey, to: pt, channel: 'power', type: 'power' });
                }
            }
        }

        // === 子系统的边 ===
        if (sp.subsystems) {
            for (var ssKey in sp.subsystems) {
                var ss = sp.subsystems[ssKey];
                if (!ss) continue;

                // 从 subsystem_types.js 注册表获取该类型的所有信号输出字段
                var outputFields = _getSignalOutputFields(ss);
                for (var fi = 0; fi < outputFields.length; fi++) {
                    var field = outputFields[fi];
                    var val = ss[field];
                    if (!val) continue;

                    if (typeof val === 'string') {
                        // 单值目标：power_output
                        if (val) {
                            _ensureTargetNode(val, nodeMap, nodes, seenSpecialTargets, spKey);
                            edges.push({ from: ssKey, to: val, channel: field, type: _edgeTypeForField(field) });
                        }
                    } else if (typeof val === 'object' && !Array.isArray(val)) {
                        // 键值对：
                        //   { channel: [targets] }  — signal_targets 系列
                        //   { target: ratio }       — transmission.power_outputs
                        for (var ch in val) {
                            var tgts = val[ch];
                            if (tgts === undefined || tgts === null) continue;

                            if (Array.isArray(tgts)) {
                                // signal_targets: { channel: [target1, target2, ...] }
                                for (var tji = 0; tji < tgts.length; tji++) {
                                    var t = tgts[tji];
                                    if (!t) continue;
                                    _ensureTargetNode(t, nodeMap, nodes, seenSpecialTargets, spKey);
                                    edges.push({ from: ssKey, to: t, channel: ch, type: _edgeTypeForField(field) });
                                }
                            } else if (typeof tgts === 'string') {
                                // 单个字符串目标
                                _ensureTargetNode(tgts, nodeMap, nodes, seenSpecialTargets, spKey);
                                edges.push({ from: ssKey, to: tgts, channel: ch, type: _edgeTypeForField(field) });
                            } else if (typeof tgts === 'number') {
                                // power_outputs 的值为减速比 (Map<string, Float>)
                                // ch 本身就是目标名（如 "subsystem.machine_max.left_front_wheel_driver"）
                                _ensureTargetNode(ch, nodeMap, nodes, seenSpecialTargets, spKey);
                                edges.push({ from: ssKey, to: ch, channel: field, type: _edgeTypeForField(field) });
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
 * 确保目标节点存在。
 *
 * 第2遍处理边时：
 * - 第1遍已创建的 subsystem/connector 节点 → nodeMap 命中，跳过
 * - 'subpart' / 'vehicle' → 创建特殊节点
 * - 其他未识别的目标 → 创建未解析节点（灰色）
 */
function _ensureTargetNode(target, nodeMap, nodes, seenSpecialTargets, currentSpKey) {
    if (!target) return;
    // 第1遍已创建的子系统/连接点 → 无需操作
    if (nodeMap[target]) return;
    // 内置特殊目标
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
    // 不在已知节点列表中 → 创建未解析节点
    nodeMap[target] = true;
    nodes.push({
        id: target,
        type: 'unresolved',
        subPart: currentSpKey,
        label: _shortName(target),
    });
}

/**
 * 获取子系统的信号输出字段列表
 *
 * 优先从 subsystem_types.js 注册表读取该类型的动态属性字段，
 * 只返回 editor 为 signal_targets / power_target / power_outputs_map 的字段。
 * 若类型未知或未注册，回退到硬编码的通用字段推断。
 */
function _getSignalOutputFields(ss) {
    var typeId = ss.type;
    if (typeId) {
        var fields = subsystemTypes.getDynamicFields(typeId);
        if (fields && fields.length > 0) {
            var result = [];
            for (var i = 0; i < fields.length; i++) {
                var f = fields[i];
                // 只有信号路由/功率输出类的字段才生成边
                if (f.editor === 'signal_targets' || f.editor === 'power_target' || f.editor === 'power_outputs_map') {
                    if (ss[f.field] !== undefined && ss[f.field] !== null) {
                        result.push(f.field);
                    }
                }
            }
            return result;
        }
    }
    // 回退：未知类型，按通用规则扫描 *_outputs / power_output
    var knownOutputs = [
        'power_output', 'power_outputs',
        'control_outputs', 'speed_outputs',
        'throttle_outputs', 'brake_outputs',
        'steering_outputs', 'handbrake_outputs',
        'gear_outputs', 'move_outputs',
        'regular_outputs', 'aim_outputs',
        'passenger_num_outputs',
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
        return fullKey.length > 16 ? fullKey.substring(0, 14) + '…' : fullKey;
    }
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
 * @param {number} [options.width=800] - 画布宽度
 * @param {number} [options.height=400] - 画布高度
 * @param {number} [options.repulsion=7000] - 电荷斥力强度
 * @param {number} [options.attraction=0.004] - 弹簧引力系数
 * @param {number} [options.idealLength=280] - 期望边长(px)
 * @param {number} [options.iterations=100] - 迭代次数
 * @param {number} [options.damping=0.82] - 阻尼系数
 * @returns {Object[]} 布局后的 nodes（含 x/y 坐标）
 */
function forceLayout(nodes, edges, options) {
    if (!nodes || nodes.length === 0) return nodes || [];
    var opts = options || {};
    var width = opts.width || 800;
    var height = opts.height || 400;
    var repulsion = opts.repulsion || 7000;
    var attraction = opts.attraction || 0.004;
    var idealLength = opts.idealLength || 280;
    var iterations = opts.iterations || 100;
    var damping = opts.damping || 0.82;
    var NODE_MIN_DIST = 50; // 节点间最小间距（斥力饱和阈值）

    // 初始化随机位置（用简单种子分散，避免全部叠在中心）
    for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n.x === undefined || n.y === undefined) {
            var angle = (i / nodes.length) * Math.PI * 2;
            var radius = Math.min(width, height) * 0.35;
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
                if (dist < NODE_MIN_DIST) dist = NODE_MIN_DIST;
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
