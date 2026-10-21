// 文件: src/services/icon_generator.js
// 用途: 零件 / 装配体图标离屏渲染、PNG 写盘（P1）
// 所属模块: MachineMax Blockbench 插件
//
// 服务层边界：
//   - 可 require fs/path、可依赖 Blockbench 全局；
//   - 不进撤销栈、不 toast、不刷新、不写 _uiState；
//   - part.icon 的批量写入由 UI 在写盘成功后调用 ops.setPartIcons。
//
// 渲染流程固定为：保存场景状态 → 按零件显隐 → 量 AABB → 正交取景 → 离屏渲染
// → 128×128 缩放 → 恢复场景。整个过程同步执行，P1 不允许在循环里 await/yield。

'use strict';

var fs = require('fs');
var path = require('path');
var iconPaths = require('./icon_paths.js');
var iconVisibility = require('./icon_visibility.js');
var iconFit = require('./icon_fit.js');
var { createLogger } = require('../utils/logger.js');

var log = createLogger('IconGenerator');

var PREVIEW_ID = 'mm_icon_render';
var RENDER_SIZE = 512;
var OUTPUT_SIZE = 128;
var DEFAULT_FILL = 0.9;

var _preview = null;

// =============================================================================
// Blockbench 全局适配
// =============================================================================

function groupList() {
    try {
        return (typeof Group !== 'undefined' && Group && Array.isArray(Group.all)) ? Group.all.slice() : [];
    } catch (e) {
        return [];
    }
}

function cubeList() {
    try {
        return (typeof Cube !== 'undefined' && Cube && Array.isArray(Cube.all)) ? Cube.all.slice() : [];
    } catch (e) {
        return [];
    }
}

/** 所有带 mesh 的几何元素（Cube / Mesh / TextureMesh ...），不含 Group / Locator。 */
function meshElements() {
    var list = [];
    try {
        if (typeof Outliner !== 'undefined' && Outliner && Array.isArray(Outliner.elements)) {
            list = Outliner.elements.slice();
        }
    } catch (e) { /* ignore */ }
    if (list.length === 0) list = cubeList();
    return list.filter(function (el) {
        return el && el.mesh && el.type !== 'group' && el.type !== 'locator';
    });
}

function locatorList() {
    try {
        return (typeof Locator !== 'undefined' && Locator && Array.isArray(Locator.all)) ? Locator.all.slice() : [];
    } catch (e) {
        return [];
    }
}

function previewModelList() {
    try {
        if (typeof PreviewModel !== 'undefined' && PreviewModel
            && typeof PreviewModel.getActiveModels === 'function') {
            return PreviewModel.getActiveModels().slice();
        }
    } catch (e) { /* ignore */ }
    return [];
}

function getProjectName() {
    try {
        if (typeof Project === 'undefined' || !Project) return 'assembly';
        return Project.geometry_name || Project.name || 'assembly';
    } catch (e) {
        return 'assembly';
    }
}

function getNamespace(config) {
    return iconPaths.normalizeNamespace(config && config.namespace);
}

function variantsOf(part) {
    var variants = part && part.variants;
    if (!variants || typeof variants !== 'object' || Array.isArray(variants)) return {};
    // PartCodec 单变体简写：{ model, textures, sub_parts, ... }
    if (typeof variants.model === 'string' || variants.sub_parts || variants.textures || variants.animations) {
        return { default: variants };
    }
    return variants;
}

function subPartsOf(variant) {
    var subParts = variant && variant.sub_parts;
    if (!subParts) return [];
    if (Array.isArray(subParts)) return subParts.slice();
    if (typeof subParts === 'object'
        && (Object.prototype.hasOwnProperty.call(subParts, 'start_bone')
            || Object.prototype.hasOwnProperty.call(subParts, 'end_bones')
            || Object.prototype.hasOwnProperty.call(subParts, 'auto_end_bones'))) {
        return [subParts];
    }
    return Object.keys(subParts).map(function (key) { return subParts[key]; }).filter(Boolean);
}

function chooseVariant(part, preferred) {
    var variants = variantsOf(part);
    var names = Object.keys(variants);
    if (names.length === 0) return { name: '', variant: null };
    if (preferred && variants[preferred]) return { name: preferred, variant: variants[preferred] };
    var active = preferred;
    if (!active) {
        try {
            active = (typeof configUiState === 'function') ? configUiState().activeVariantName : '';
        } catch (e) { active = ''; }
    }
    if (active && variants[active]) return { name: active, variant: variants[active] };
    return { name: names[0], variant: variants[names[0]] };
}

function configUiState() {
    // 由 generate 在调用期间挂到模块变量，避免 chooseVariant 依赖 Blockbench 全局配置。
    return _currentUiState || {};
}

var _currentUiState = {};

function buildNodes() {
    var groups = groupList();
    var groupSet = {};
    groups.forEach(function (g) { if (g && g.uuid) groupSet[g.uuid] = g; });
    return groups.map(function (g) {
        var parent = g.parent;
        var parentUuid = (parent && parent !== 'root' && parent.uuid && groupSet[parent.uuid])
            ? parent.uuid : null;
        return { uuid: g.uuid, name: g.name, parentUuid: parentUuid };
    });
}

function groupChildrenMap(groups) {
    var map = {};
    groups.forEach(function (g) {
        var parent = g.parent;
        var parentUuid = (parent && parent !== 'root' && parent.uuid) ? parent.uuid : null;
        if (!parentUuid) return;
        if (!map[parentUuid]) map[parentUuid] = [];
        map[parentUuid].push(g.uuid);
    });
    return map;
}

function collectGroupSubtree(uuid, children, out) {
    var stack = [uuid];
    var seen = {};
    while (stack.length) {
        var current = stack.pop();
        if (!current || seen[current]) continue;
        seen[current] = true;
        out[current] = true;
        (children[current] || []).forEach(function (child) { stack.push(child); });
    }
}

function elementByUuid() {
    var map = {};
    groupList().concat(meshElements(), locatorList()).forEach(function (el) {
        if (el && el.uuid) map[el.uuid] = el;
    });
    return map;
}

function collectMarkerHidden(config, enabled) {
    var hidden = {};
    if (enabled === false) return hidden;
    var elements = elementByUuid();
    var groups = groupList();
    var children = groupChildrenMap(groups);

    Object.keys((config && config.parts) || {}).forEach(function (partId) {
        var part = config.parts[partId];
        var markers = (part && part.element_markers) || {};
        Object.keys(markers).forEach(function (variantName) {
            var map = markers[variantName] || {};
            Object.keys(map).forEach(function (uuid) {
                var marker = map[uuid];
                if (!marker || (marker.type !== 'hit_box' && marker.type !== 'interact_box')) return;
                var el = elements[uuid];
                if (!el) return;
                if (el.type === 'cube' || typeof el.getGlobalVertexPositions === 'function') {
                    hidden[uuid] = true;
                } else if (el.children || el.type === 'group') {
                    collectGroupSubtree(uuid, children, hidden);
                } else {
                    hidden[uuid] = true;
                }
            });
        });
    });

    var nameRe = /hitbox|hit[_ ]?box|collision/i;
    groups.forEach(function (g) {
        if (g && nameRe.test(String(g.name || ''))) collectGroupSubtree(g.uuid, children, hidden);
    });
    cubeList().forEach(function (c) {
        if (c && nameRe.test(String(c.name || ''))) hidden[c.uuid] = true;
    });
    meshElements().forEach(function (m) {
        if (m && nameRe.test(String(m.name || ''))) hidden[m.uuid] = true;
    });
    return hidden;
}

function isElementVisible(el) {
    if (!el || !el.mesh || el.mesh.visible === false) return false;
    var parent = el.parent;
    var guard = 0;
    while (parent && parent !== 'root' && guard < 100000) {
        if (parent.mesh && parent.mesh.visible === false) return false;
        parent = parent.parent;
        guard++;
    }
    return true;
}

function applyAutoVisibility(visibleSet, hidden) {
    var visibleMap = {};
    if (Array.isArray(visibleSet)) {
        visibleSet.forEach(function (uuid) { visibleMap[uuid] = true; });
    } else if (visibleSet && typeof visibleSet === 'object') {
        visibleMap = visibleSet;
    }
    groupList().forEach(function (g) {
        if (!g.mesh) return;
        g.mesh.visible = !!visibleMap[g.uuid] && !hidden[g.uuid];
    });
    cubeList().forEach(function (c) {
        if (!c.mesh) return;
        c.mesh.visible = !hidden[c.uuid];
    });
    meshElements().forEach(function (m) {
        if (!m.mesh || m.type === 'cube') return;
        m.mesh.visible = !hidden[m.uuid];
    });
    locatorList().forEach(function (l) {
        if (l.mesh) l.mesh.visible = !hidden[l.uuid];
    });
}

function applyManualVisibility(hidden) {
    groupList().forEach(function (g) {
        if (g.mesh && hidden[g.uuid]) g.mesh.visible = false;
    });
    cubeList().forEach(function (c) {
        if (c.mesh && hidden[c.uuid]) c.mesh.visible = false;
    });
    meshElements().forEach(function (m) {
        if (m.mesh && m.type !== 'cube' && hidden[m.uuid]) m.mesh.visible = false;
    });
    locatorList().forEach(function (l) {
        if (l.mesh && hidden[l.uuid]) l.mesh.visible = false;
    });
}

function measureAabb() {
    var min = [Infinity, Infinity, Infinity];
    var max = [-Infinity, -Infinity, -Infinity];
    var has = false;
    var failed = 0;

    meshElements().forEach(function (element) {
        if (!isElementVisible(element)) return;
        var vertices = null;

        if (typeof element.getGlobalVertexPositions === 'function') {
            try {
                vertices = element.getGlobalVertexPositions();
            } catch (e) {
                failed++;
                return;
            }
        } else if (element.mesh && element.mesh.geometry) {
            try {
                element.mesh.updateMatrixWorld(true);
                var geometry = element.mesh.geometry;
                if (!geometry.boundingBox && typeof geometry.computeBoundingBox === 'function') {
                    geometry.computeBoundingBox();
                }
                var box = geometry.boundingBox;
                if (box) {
                    var scenePos = (typeof Canvas !== 'undefined' && Canvas && Canvas.scene)
                        ? Canvas.scene.position : { x: 0, y: 0, z: 0 };
                    for (var c = 0; c < 8; c++) {
                        var v = new THREE.Vector3(
                            (c & 1) ? box.max.x : box.min.x,
                            (c & 2) ? box.max.y : box.min.y,
                            (c & 4) ? box.max.z : box.min.z
                        );
                        v.applyMatrix4(element.mesh.matrixWorld);
                        v.sub(scenePos);
                        if (!vertices) vertices = [];
                        vertices.push(v.toArray());
                    }
                }
            } catch (e2) {
                failed++;
                return;
            }
        }

        if (!Array.isArray(vertices)) return;
        vertices.forEach(function (v) {
            if (!Array.isArray(v) || v.length < 3) return;
            has = true;
            for (var i = 0; i < 3; i++) {
                var value = Number(v[i]);
                if (!isFinite(value)) continue;
                if (value < min[i]) min[i] = value;
                if (value > max[i]) max[i] = value;
            }
        });
    });

    if (!has) return { aabb: null, failed: failed };
    return { aabb: { min: min, max: max }, failed: failed };
}

// =============================================================================
// 场景状态保存 / 恢复
// =============================================================================

function snapshotScene() {
    var state = {
        groups: [],
        meshes: [],
        locators: [],
        background: null,
        fog: null,
        shading: null,
        brightness: null,
        toneMapping: null,
        lightColor: null,
        lightSide: null,
        viewMode: null,
        previewModels: [],
    };
    groupList().forEach(function (g) {
        state.groups.push({ el: g, visible: g.mesh ? g.mesh.visible : null, visibility: g.visibility });
    });
    meshElements().forEach(function (m) {
        state.meshes.push({ el: m, visible: m.mesh ? m.mesh.visible : null, visibility: m.visibility });
    });
    locatorList().forEach(function (l) {
        state.locators.push({ el: l, visible: l.mesh ? l.mesh.visible : null, visibility: l.visibility });
    });
    if (typeof Canvas !== 'undefined' && Canvas) {
        if (Canvas.scene) {
            state.background = Canvas.scene.background;
            state.fog = Canvas.scene.fog;
        }
        state.lightColor = Canvas.global_light_color ? Canvas.global_light_color.clone() : null;
        state.lightSide = Canvas.global_light_side;
    }
    if (typeof settings !== 'undefined' && settings) {
        if (settings.shading) state.shading = settings.shading.value;
        if (settings.brightness) state.brightness = settings.brightness.value;
        if (settings.tone_mapping) state.toneMapping = settings.tone_mapping.value;
    }
    if (typeof Project !== 'undefined' && Project) state.viewMode = Project.view_mode;
    previewModelList().forEach(function (model) {
        state.previewModels.push({ model: model, enabled: model.enabled });
    });
    return state;
}

function restoreScene(state) {
    if (!state) return;
    state.groups.forEach(function (item) {
        if (item.el.mesh && item.visible !== null) item.el.mesh.visible = item.visible;
        if (item.visibility !== undefined) item.el.visibility = item.visibility;
    });
    state.meshes.forEach(function (item) {
        if (item.el.mesh && item.visible !== null) item.el.mesh.visible = item.visible;
        if (item.visibility !== undefined) item.el.visibility = item.visibility;
    });
    state.locators.forEach(function (item) {
        if (item.el.mesh && item.visible !== null) item.el.mesh.visible = item.visible;
        if (item.visibility !== undefined) item.el.visibility = item.visibility;
    });

    if (typeof settings !== 'undefined' && settings) {
        if (settings.shading && state.shading !== null) settings.shading.value = state.shading;
        if (settings.brightness && state.brightness !== null) settings.brightness.value = state.brightness;
        if (settings.tone_mapping && state.toneMapping !== null) settings.tone_mapping.value = state.toneMapping;
    }
    if (typeof Canvas !== 'undefined' && Canvas) {
        if (Canvas.scene) {
            Canvas.scene.background = state.background;
            Canvas.scene.fog = state.fog;
        }
        if (Canvas.global_light_color && state.lightColor) Canvas.global_light_color.copy(state.lightColor);
        if (state.lightSide !== null) Canvas.global_light_side = state.lightSide;
        try {
            if (typeof Project !== 'undefined' && Project && state.viewMode !== null
                && Project.view_mode !== state.viewMode) {
                Project.view_mode = state.viewMode;
                if (typeof Canvas.updateViewMode === 'function') Canvas.updateViewMode();
            } else if (typeof Canvas.updateShading === 'function') {
                Canvas.updateShading();
            }
        } catch (e) {
            log.warn('restoreScene: 恢复视口模式失败', e && e.message);
        }
    }
    state.previewModels.forEach(function (item) {
        try {
            if (item.enabled) item.model.enable();
            else item.model.disable();
        } catch (e) { /* ignore */ }
    });
    if (typeof Preview !== 'undefined' && Preview && Array.isArray(Preview.all)) {
        Preview.all.forEach(function (p) {
            try { if (typeof p.updateToneMapping === 'function') p.updateToneMapping(); } catch (e) { /* ignore */ }
        });
    }
}

function applyFixedScene() {
    if (typeof Canvas !== 'undefined' && Canvas) {
        if (Canvas.scene) {
            Canvas.scene.background = null;
            Canvas.scene.fog = null;
        }
        if (Canvas.global_light_color) Canvas.global_light_color.set(0xffffff);
        Canvas.global_light_side = 0;
    }
    if (typeof settings !== 'undefined' && settings) {
        if (settings.shading) settings.shading.value = true;
        if (settings.brightness) settings.brightness.value = 50;
        if (settings.tone_mapping) settings.tone_mapping.value = 'none';
    }
    if (typeof Project !== 'undefined' && Project) {
        if (Project.view_mode !== 'textured') {
            Project.view_mode = 'textured';
            if (typeof Canvas !== 'undefined' && Canvas && typeof Canvas.updateViewMode === 'function') {
                Canvas.updateViewMode();
            }
        }
    }
    if (typeof Canvas !== 'undefined' && Canvas && typeof Canvas.updateShading === 'function') {
        Canvas.updateShading();
    }
    previewModelList().forEach(function (model) {
        try { model.disable(); } catch (e) { /* ignore */ }
    });
    if (_preview && typeof _preview.updateToneMapping === 'function') {
        try { _preview.updateToneMapping(); } catch (e) { /* ignore */ }
    }
}

// =============================================================================
// 路径 / 预览 / 渲染
// =============================================================================

function packDirOf(config) {
    var dir = config && config.contentPackPath;
    if (!dir || typeof dir !== 'string') return { ok: false, error: '未设置内容包路径' };
    try {
        var stat = fs.statSync(dir);
        if (!stat.isDirectory()) return { ok: false, error: '内容包路径不是目录（zip 内容包暂不支持写图标）' };
    } catch (e) {
        return { ok: false, error: '内容包路径不存在: ' + dir };
    }
    return { ok: true, dir: dir };
}

function fileTargetOf(config, target) {
    var parsed = iconPaths.parseResourceLocation(target);
    if (!parsed) return { ok: false, error: '不是合法的 resource location: ' + target };
    var ns = getNamespace(config);
    if (parsed.namespace !== ns) return { ok: false, error: '目标 namespace 不是本包: ' + parsed.namespace };
    if (parsed.path.indexOf(iconPaths.ICON_ROOT) !== 0 || !iconPaths.isSafeResourcePath(parsed.path)) {
        return { ok: false, error: '目标不在本包 textures/icon/ 下: ' + target };
    }
    if (!/\.png$/i.test(parsed.path)) return { ok: false, error: '图标目标必须是 .png: ' + target };
    var pack = packDirOf(config);
    if (!pack.ok) return pack;
    var root = path.resolve(pack.dir, ns, 'textures', 'icon');
    var file = path.resolve(pack.dir, ns, parsed.path);
    if (file === root || file.indexOf(root + path.sep) !== 0) {
        return { ok: false, error: '图标路径逃逸出 icon 目录: ' + target };
    }
    return { ok: true, file: file, path: parsed.path };
}

function assemblyJsonExists(config, name) {
    var pack = packDirOf(config);
    if (!pack.ok) return false;
    var safe = iconPaths.sanitizeSegment(name || 'assembly');
    if (!safe) return false;
    try {
        return fs.existsSync(path.join(pack.dir, 'assemblies', safe + '.json'));
    } catch (e) {
        return false;
    }
}

function ensurePreview() {
    if (typeof Preview === 'undefined' || !Preview) throw new Error('Blockbench Preview API 不可用');
    if (_preview && _preview.canvas && _preview.canvas.parentElement) return _preview;
    if (typeof Preview.all !== 'undefined' && Array.isArray(Preview.all)) {
        var old = Preview.all.find(function (p) { return p.id === PREVIEW_ID; });
        if (old) {
            try { old.delete(); } catch (e) { /* ignore */ }
        }
    }
    _preview = new Preview({ id: PREVIEW_ID, offscreen: true, antialias: true });
    _preview.setProjectionMode(true);
    _preview.resize(RENDER_SIZE, RENDER_SIZE);
    _preview.controls.minDistance = 1;
    _preview.controls.maxDistance = 100000;
    _preview.controls.enableDamping = false;
    return _preview;
}

function dispose() {
    if (_preview) {
        try { _preview.delete(); } catch (e) { /* ignore */ }
        _preview = null;
    }
}

function defaultDirection(kind) {
    var presetId = kind === 'assembly' ? 'isometric_left' : 'isometric_right';
    try {
        if (typeof DefaultCameraPresets !== 'undefined' && Array.isArray(DefaultCameraPresets)) {
            var preset = DefaultCameraPresets.find(function (p) { return p.id === presetId; })
                || DefaultCameraPresets.find(function (p) { return p.id === 'isometric_left'; })
                || DefaultCameraPresets[0];
            if (preset && Array.isArray(preset.position) && Array.isArray(preset.target)) {
                return iconFit.normalize([
                    preset.position[0] - preset.target[0],
                    preset.position[1] - preset.target[1],
                    preset.position[2] - preset.target[2],
                ]);
            }
        }
    } catch (e) { /* ignore */ }
    return iconFit.normalize(kind === 'assembly' ? [1, 1, -1] : [-1, 1, -1]);
}

function directionFor(config, options, kind) {
    if (options.camera === 'iso') return defaultDirection(kind);
    var stored = config && config._uiState && config._uiState.iconCamera;
    if (options.camera === 'project' && stored && stored.conventionVersion === 2) {
        var key = kind === 'assembly' ? 'assemblyDirection' : 'direction';
        if (Array.isArray(stored[key]) && stored[key].length >= 3) {
            return iconFit.normalizeDirection(stored[key]);
        }
    }
    return defaultDirection(kind);
}

function renderToDataUrl(preview) {
    if (typeof Canvas === 'undefined' || !Canvas) throw new Error('Canvas API 不可用');
    var oldBg = Canvas.scene.background;
    var oldFog = Canvas.scene.fog;
    Canvas.scene.background = null;
    Canvas.scene.fog = null;
    try {
        Canvas.withoutGizmos(function () { preview.render(); });
        if (typeof CanvasFrame !== 'undefined') {
            var frame = new CanvasFrame(preview.canvas);
            if (frame.isEmpty()) throw new Error('渲染结果为空（没有可见几何）');
        }
        var source = preview.canvas.toDataURL('image/png');
        if (!source || source.indexOf('data:image/png') !== 0) throw new Error('无法编码 PNG');
        var canvas = document.createElement('canvas');
        canvas.width = OUTPUT_SIZE;
        canvas.height = OUTPUT_SIZE;
        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(preview.canvas, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
        return canvas.toDataURL('image/png');
    } finally {
        Canvas.scene.background = oldBg;
        Canvas.scene.fog = oldFog;
    }
}

function renderSpec(preview, spec, cameraInfo) {
    if (cameraInfo.current) {
        if (typeof Preview === 'undefined' || !Preview.selected) {
            throw new Error('没有可用的主视口，无法使用当前视角');
        }
        preview.copyView(Preview.selected);
        preview.resize(RENDER_SIZE, RENDER_SIZE);
    } else {
        var fit = iconFit.computeFit(spec.aabb, {
            direction: cameraInfo.direction,
            width: RENDER_SIZE,
            height: RENDER_SIZE,
            fill: cameraInfo.fill,
        });
        var center = fit.center;
        var zoom = fit.zoom;
        if (cameraInfo.framing === 'uniform' && cameraInfo.uniformZoom) {
            zoom = cameraInfo.uniformZoom;
            if (spec.kind === 'assembly' && cameraInfo.uniformCenter) center = cameraInfo.uniformCenter;
        }
        var basis = iconFit.cameraBasis(cameraInfo.direction);
        var distance = 1200;
        preview.setProjectionMode(true);
        preview.resize(RENDER_SIZE, RENDER_SIZE);
        preview.camOrtho.position.set(
            center[0] + cameraInfo.direction[0] * distance,
            center[1] + cameraInfo.direction[1] * distance,
            center[2] + cameraInfo.direction[2] * distance
        );
        preview.controls.target.set(center[0], center[1], center[2]);
        preview.camOrtho.up.set(basis.up[0], basis.up[1], basis.up[2]);
        preview.camOrtho.lookAt(center[0], center[1], center[2]);
        preview.camOrtho.zoom = zoom;
        preview.camOrtho.updateProjectionMatrix();
        preview.controls.update();
    }
    return renderToDataUrl(preview);
}

function dataUrlToBuffer(dataUrl) {
    var comma = dataUrl.indexOf(',');
    if (comma < 0) throw new Error('PNG data URL 格式错误');
    return Buffer.from(dataUrl.slice(comma + 1), 'base64');
}

function writePng(filePath, dataUrl) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, dataUrlToBuffer(dataUrl));
}

// =============================================================================
// 可见集 / 规格构建
// =============================================================================

function mergeWarnings(target, list, partId) {
    (list || []).forEach(function (item) {
        target.push({
            partId: partId || '',
            code: item.code || 'warning',
            message: item.message || String(item),
            bone: item.bone,
        });
    });
}

function buildPartVisibility(part, variant) {
    var nodes = buildNodes();
    var result = iconVisibility.buildVisibility(nodes, subPartsOf(variant));
    return result;
}

function buildAssemblyVisibility(parts) {
    var nodes = buildNodes();
    var visible = {};
    var warnings = [];
    var errors = [];
    var any = false;
    Object.keys(parts || {}).forEach(function (partId) {
        var variants = variantsOf(parts[partId]);
        Object.keys(variants).forEach(function (variantName) {
            var result = iconVisibility.buildVisibility(nodes, subPartsOf(variants[variantName]));
            mergeWarnings(warnings, result.warnings, partId);
            if (result.errors.length > 0) mergeWarnings(errors, result.errors, partId);
            result.visible.forEach(function (uuid) {
                visible[uuid] = true;
                any = true;
            });
        });
    });
    return {
        visible: Object.keys(visible),
        warnings: warnings,
        errors: errors,
        fallback: !any,
    };
}

function commonFolder(specs) {
    var folders = {};
    specs.forEach(function (spec) {
        if (spec.resolved && spec.resolved.folder) folders[spec.resolved.folder] = true;
    });
    var keys = Object.keys(folders);
    return keys.length === 1 ? keys[0] : '';
}

function buildPartSpecs(config, options) {
    var specs = [];
    var errors = [];
    var parts = config.parts || {};
    var partIds = Object.keys(parts);
    var preferred = (config._uiState && config._uiState.activeVariantName) || '';
    if (options.scope === 'current') {
        preferred = options.variantName || preferred;
    }
    var currentId = options.partId || (config._uiState && config._uiState.activePartId) || '';

    partIds.forEach(function (partId) {
        var part = parts[partId];
        if (!part) return;
        var picked = chooseVariant(part, preferred);
        if (!picked.variant) {
            errors.push({ kind: 'part', partId: partId, status: 'failed', error: '零件没有可用变体' });
            return;
        }
        var resolved = iconPaths.resolveTarget({
            namespace: getNamespace(config),
            kind: 'part',
            partId: partId,
            icon: part.icon,
            folder: options.folder,
        });
        if (!resolved.ok) {
            errors.push({ kind: 'part', partId: partId, status: 'failed', error: resolved.error });
            return;
        }
        var spec = {
            kind: 'part',
            partId: partId,
            variantName: picked.name,
            variant: picked.variant,
            resolved: resolved,
            selected: partId === currentId,
        };
        specs.push(spec);
    });
    return { specs: specs, errors: errors, currentId: currentId, partIds: partIds };
}

/**
 * 生成图标（同步）。
 *
 * @param {Object} config
 * @param {Object} options
 * @returns {{ok:boolean, items:Array, summary:Object, errors:Array, warnings:Array, cameraUsed:Object, fieldUpdates:Object}}
 */
function generate(config, options) {
    options = options || {};
    if (!config || typeof config !== 'object') {
        return { ok: false, error: '配置不可用', items: [], summary: emptySummary(), errors: [{ message: '配置不可用' }], warnings: [] };
    }
    var pack = packDirOf(config);
    if (!pack.ok) {
        return { ok: false, error: pack.error, items: [], summary: emptySummary(), errors: [{ message: pack.error }], warnings: [] };
    }

    _currentUiState = config._uiState || {};
    var scope = options.scope || 'all+assembly';
    var built = buildPartSpecs(config, options);
    var items = built.errors.slice();
    var warnings = [];
    var errors = [];

    var selectedParts = built.specs.filter(function (spec) {
        if (scope === 'current') return spec.selected;
        return scope === 'all' || scope === 'all+assembly';
    });
    if (scope === 'current' && selectedParts.length === 0) {
        errors.push({ message: '当前没有选中的零件' });
    }

    // 先构建/校验每个零件的可见集。
    built.specs.forEach(function (spec) {
        spec.visibility = options.visibility === 'manual' ? null : buildPartVisibility(null, spec.variant);
        if (spec.visibility) {
            mergeWarnings(warnings, spec.visibility.warnings, spec.partId);
            if (spec.visibility.errors.length > 0) mergeWarnings(warnings, spec.visibility.errors, spec.partId);
            if (spec.visibility.visible.length === 0) {
                spec.failed = true;
                spec.error = '可见集为空';
            }
        }
    });

    var assemblySpec = null;
    var wantsAssembly = scope === 'assembly' || scope === 'all+assembly';
    if (wantsAssembly) {
        var name = getProjectName();
        var folder = options.folder || commonFolder(built.specs);
        var reserved = built.specs.map(function (spec) { return spec.resolved.target; });
        var resolved = iconPaths.resolveTarget({
            namespace: getNamespace(config),
            kind: 'assembly',
            name: name,
            folder: folder,
            reservedPaths: reserved,
        });
        if (!resolved.ok) {
            items.push({ kind: 'assembly', status: 'failed', error: resolved.error });
        } else {
            assemblySpec = {
                kind: 'assembly',
                partId: '',
                variantName: '',
                resolved: resolved,
                visibility: options.visibility === 'manual' ? null : buildAssemblyVisibility(config.parts),
            };
            if (resolved.collision) {
                warnings.push({ code: 'assembly_path_collision', message: '装配体与零件路径冲突，已改用 ' + resolved.target });
            }
            if (assemblyJsonExists(config, name)) {
                warnings.push({
                    code: 'assembly_json_exists',
                    message: '已有 assemblies/' + iconPaths.sanitizeSegment(name) + '.json；P1 不读取/不写该 JSON，如 icon 指向旧冲突路径需手工修改',
                });
            }
            if (assemblySpec.visibility) {
                mergeWarnings(warnings, assemblySpec.visibility.warnings);
                if (assemblySpec.visibility.errors.length > 0) mergeWarnings(warnings, assemblySpec.visibility.errors);
                if (assemblySpec.visibility.visible.length === 0) {
                    assemblySpec.failed = true;
                    assemblySpec.error = '装配体可见集为空';
                }
            }
        }
    }

    var allSpecs = selectedParts.map(function (spec) { return spec; });
    if (wantsAssembly && assemblySpec) allSpecs.push(assemblySpec);

    // 解析文件路径 / 目标存在性 / 字段动作。
    allSpecs.forEach(function (spec) {
        var file = fileTargetOf(config, spec.resolved.target);
        if (!file.ok) {
            spec.failed = true;
            spec.error = file.error;
            return;
        }
        spec.file = file.file;
        spec.targetExists = fs.existsSync(file.file);
        spec.plan = iconPaths.planIcon({
            kind: spec.kind,
            namespace: getNamespace(config),
            icon: spec.kind === 'part' ? (config.parts[spec.partId] && config.parts[spec.partId].icon) : '',
            target: spec.resolved.target,
            iconState: spec.resolved.iconState,
            targetExists: spec.targetExists,
            overwrite: !!options.overwrite,
            rewriteExternalIcon: !!options.rewriteExternalIcon,
        });
        if (spec.plan.status === 'failed') {
            spec.failed = true;
            spec.error = spec.plan.reason;
        }
    });

    var state = snapshotScene();
    var preview;
    var camera = options.camera || 'project';
    var storedCamera = config._uiState && config._uiState.iconCamera;
    var storedFill = storedCamera ? Number(storedCamera.fill) : NaN;
    var fill = isFinite(Number(options.fill)) ? Number(options.fill)
        : (isFinite(storedFill) && storedFill > 0 ? storedFill : DEFAULT_FILL);
    var framing = options.framing === 'fit' ? 'fit'
        : (options.framing === 'uniform' ? 'uniform'
            : (storedCamera && storedCamera.framing === 'fit' ? 'fit' : 'uniform'));
    var partDirection = camera === 'current' ? null : directionFor(config, { camera: camera }, 'part');
    var assemblyDirection = camera === 'current' ? null : directionFor(config, { camera: camera }, 'assembly');
    var cameraInfo = {
        current: false,
        direction: partDirection,
        partDirection: partDirection,
        assemblyDirection: assemblyDirection,
        fill: fill,
        framing: framing,
    };
    var hideMarkers = options.hideMarkers !== false;

    try {
        preview = ensurePreview();
        applyFixedScene();

        // 第一轮：逐项应用显隐并量 AABB。
        if (options.visibility === 'manual') {
            applyManualVisibility(collectMarkerHidden(config, hideMarkers));
            // 手动模式不隔离零件，量的是当前场景。
            var manualMeasure = measureAabb();
            if (!manualMeasure.aabb) {
                errors.push({ message: '当前场景没有可见几何' });
            } else {
                allSpecs.forEach(function (spec) {
                    spec.aabb = manualMeasure.aabb;
                });
            }
        } else {
            allSpecs.forEach(function (spec) {
                if (spec.failed) return;
                var hidden = collectMarkerHidden(config, hideMarkers);
                if (spec.visibility) applyAutoVisibility(spec.visibility.visible, hidden);
                else applyManualVisibility(hidden);
                var measured = measureAabb();
                if (!measured.aabb) {
                    spec.failed = true;
                    spec.error = '没有可见几何';
                    return;
                }
                spec.aabb = measured.aabb;
            });
        }

        var partAabb = iconFit.unionAabb(allSpecs.filter(function (s) {
            return s.kind === 'part' && s.aabb;
        }).map(function (s) { return s.aabb; }));
        var assemblyAabb = (assemblySpec && assemblySpec.aabb) ? assemblySpec.aabb : null;
        if (!partAabb && !assemblyAabb && allSpecs.length > 0) {
            errors.push({ message: '没有任何可量测的可见几何' });
        }
        if (partAabb && partDirection) {
            var partFit = iconFit.computeFit(partAabb, {
                direction: partDirection,
                width: RENDER_SIZE,
                height: RENDER_SIZE,
                fill: fill,
            });
            cameraInfo.partUniformZoom = partFit.zoom;
            cameraInfo.partUniformCenter = partFit.center;
        }
        if (assemblyAabb && assemblyDirection) {
            var assemblyFit = iconFit.computeFit(assemblyAabb, {
                direction: assemblyDirection,
                width: RENDER_SIZE,
                height: RENDER_SIZE,
                fill: fill,
            });
            cameraInfo.assemblyUniformZoom = assemblyFit.zoom;
            cameraInfo.assemblyUniformCenter = assemblyFit.center;
        }

        // 第二轮：逐项渲染。
        allSpecs.forEach(function (spec) {
            if (spec.failed) return;
            var hidden = collectMarkerHidden(config, hideMarkers);
            if (spec.visibility) applyAutoVisibility(spec.visibility.visible, hidden);
            else applyManualVisibility(hidden);
            var measured = measureAabb();
            if (!measured.aabb) {
                spec.failed = true;
                spec.error = '没有可见几何';
                return;
            }
            spec.aabb = measured.aabb;
            var itemCamera;
            if (camera === 'current') {
                if (spec.kind !== 'part') {
                    spec.failed = true;
                    spec.error = '当前视角仅支持单个零件';
                    return;
                }
                itemCamera = { current: true, fill: fill, framing: 'current' };
            } else {
                var isAssembly = spec.kind === 'assembly';
                itemCamera = Object.assign({}, cameraInfo, {
                    direction: isAssembly ? assemblyDirection : partDirection,
                    uniformZoom: isAssembly ? cameraInfo.assemblyUniformZoom : cameraInfo.partUniformZoom,
                    uniformCenter: isAssembly ? cameraInfo.assemblyUniformCenter : cameraInfo.partUniformCenter,
                });
            }
            try {
                spec.dataUrl = renderSpec(preview, spec, itemCamera);
            } catch (e) {
                spec.failed = true;
                spec.error = (e && e.message) ? e.message : String(e);
            }
        });
    } finally {
        restoreScene(state);
    }

    // 写盘 + 汇总。
    var fieldUpdates = {};
    allSpecs.forEach(function (spec) {
        var writeOk = true;
        var writeError = '';
        if (options.write && !spec.failed && spec.plan && spec.plan.fileAction === 'write') {
            try {
                writePng(spec.file, spec.dataUrl);
            } catch (e) {
                writeOk = false;
                writeError = '写盘失败: ' + (e && e.message ? e.message : String(e));
            }
        }
        var item = {
            kind: spec.kind,
            partId: spec.partId || undefined,
            variantName: spec.variantName || undefined,
            path: spec.resolved ? spec.resolved.target : '',
            status: spec.failed ? 'failed' : (writeOk ? (spec.plan ? spec.plan.status : 'failed') : 'failed'),
            fileAction: spec.plan ? spec.plan.fileAction : 'none',
            fieldAction: spec.plan ? spec.plan.fieldAction : 'keep',
            fieldChanged: !!(spec.plan && spec.plan.fieldChanged),
            dataUrl: spec.dataUrl,
            usedVariant: spec.variantName || undefined,
            error: spec.failed ? spec.error : (writeError || spec.error),
            collision: spec.resolved ? spec.resolved.collision : false,
        };
        if (item.status === 'failed') {
            errors.push({ kind: spec.kind, partId: spec.partId, message: item.error || '生成失败' });
        } else if (item.fieldChanged && spec.kind === 'part') {
            fieldUpdates[spec.partId] = spec.resolved.target;
        }
        items.push(item);
    });

    var summary = emptySummary();
    items.forEach(function (item) {
        if (item.status === 'created') summary.created++;
        else if (item.status === 'linked') summary.linked++;
        else if (item.status === 'overwritten') summary.overwritten++;
        else if (item.status === 'skipped') summary.skipped++;
        else if (item.status === 'unrewritten') summary.unrewritten++;
        else summary.failed++;
    });

    return {
        ok: errors.length === 0 || items.some(function (item) { return item.status !== 'failed'; }),
        items: items,
        summary: summary,
        errors: errors,
        warnings: warnings,
        cameraUsed: {
            direction: camera === 'current' ? null : partDirection,
            assemblyDirection: camera === 'current' ? null : assemblyDirection,
            fill: fill,
            framing: camera === 'current' ? 'current' : framing,
        },
        fieldUpdates: fieldUpdates,
    };
}

function emptySummary() {
    return { created: 0, linked: 0, overwritten: 0, skipped: 0, unrewritten: 0, failed: 0 };
}

module.exports = {
    generate: generate,
    dispose: dispose,
    PREVIEW_ID: PREVIEW_ID,
    _internals: {
        variantsOf: variantsOf,
        subPartsOf: subPartsOf,
        buildNodes: buildNodes,
        fileTargetOf: fileTargetOf,
        measureAabb: measureAabb,
    },
};
