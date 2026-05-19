/**
 * 元素标记系统单元测试
 *
 * 覆盖 src/core/element_markers.js 中所有导出函数。
 * 使用 Blockbench mock 层提供 Group/Locator 类以支持 instanceof 检查。
 */

require('../mocks/blockbench.js');
var markers = require('../../src/core/element_markers.js');
var helpers = require('../helpers.js');

describe('element_markers', function () {

    // ─── MARKER_TYPES ─────────────────────────────────────────────────────────

    describe('MARKER_TYPES', function () {
        it('包含全部 4 种标记类型', function () {
            var expectedTypes = ['sub_part', 'hit_box', 'connector', 'interact_box'];
            var actualTypes = Object.keys(markers.MARKER_TYPES);
            if (actualTypes.length !== 4) {
                throw new Error('Expected 4 marker types, got ' + actualTypes.length);
            }
            expectedTypes.forEach(function (t) {
                if (actualTypes.indexOf(t) === -1) {
                    throw new Error('Missing type in MARKER_TYPES: ' + t);
                }
            });
        });

        it('每种标记类型都有 label, icon, color', function () {
            Object.keys(markers.MARKER_TYPES).forEach(function (type) {
                var info = markers.MARKER_TYPES[type];
                if (typeof info.label !== 'string' || info.label === '') {
                    throw new Error('Marker type ' + type + ' missing label');
                }
                if (typeof info.icon !== 'string' || info.icon === '') {
                    throw new Error('Marker type ' + type + ' missing icon');
                }
                if (typeof info.color !== 'string' || info.color === '') {
                    throw new Error('Marker type ' + type + ' missing color');
                }
            });
        });

        it('sub_part 的 icon 为 fa-cube, color 为 #4A90D9', function () {
            var info = markers.MARKER_TYPES.sub_part;
            if (info.icon !== 'fa-cube') {
                throw new Error('Expected fa-cube, got ' + info.icon);
            }
            if (info.color !== '#4A90D9') {
                throw new Error('Expected #4A90D9, got ' + info.color);
            }
        });

        it('hit_box 的 icon 为 fa-shield, color 为 #D94A4A', function () {
            var info = markers.MARKER_TYPES.hit_box;
            if (info.icon !== 'fa-shield') throw new Error('hit_box icon mismatch');
            if (info.color !== '#D94A4A') throw new Error('hit_box color mismatch');
        });

        it('connector 的 icon 为 fa-plug, color 为 #3AA83A', function () {
            var info = markers.MARKER_TYPES.connector;
            if (info.icon !== 'fa-plug') throw new Error('connector icon mismatch');
            if (info.color !== '#3AA83A') throw new Error('connector color mismatch');
        });
    });

    // ─── getMarkerInfo ────────────────────────────────────────────────────────

    describe('getMarkerInfo', function () {
        it('返回已知类型的标记信息', function () {
            var info = markers.getMarkerInfo('sub_part');
            if (!info || info.label !== '子零件') {
                throw new Error('Expected sub_part info, got ' + JSON.stringify(info));
            }
        });

        it('对未知类型返回 null', function () {
            var result = markers.getMarkerInfo('nonexistent');
            if (result !== null) {
                throw new Error('Expected null for unknown type, got ' + JSON.stringify(result));
            }
        });
    });

    // ─── getIconClass ─────────────────────────────────────────────────────────

    describe('getIconClass', function () {
        it('返回已知类型的图标类名', function () {
            var icon = markers.getIconClass('connector');
            if (icon !== 'fa-plug') {
                throw new Error('Expected fa-plug, got ' + icon);
            }
        });

        it('对未知类型返回空字符串', function () {
            var icon = markers.getIconClass('bogus');
            if (icon !== '') {
                throw new Error('Expected empty string for unknown type, got ' + icon);
            }
        });
    });

    // ─── getColor ─────────────────────────────────────────────────────────────

    describe('getColor', function () {
        it('返回已知类型的颜色', function () {
            var color = markers.getColor('connector');
            if (color !== '#3AA83A') {
                throw new Error('Expected #3AA83A, got ' + color);
            }
        });

        it('对未知类型返回 #888888', function () {
            var color = markers.getColor('bogus');
            if (color !== '#888888') {
                throw new Error('Expected #888888 for unknown type, got ' + color);
            }
        });
    });

    // ─── getMarkerTypesForElement ─────────────────────────────────────────────

    describe('getMarkerTypesForElement', function () {
        it('Group 返回 [sub_part, hit_box, interact_box]', function () {
            var group = new globalThis.Group('testGroup');
            var types = markers.getMarkerTypesForElement(group);
            if (types.length !== 3) {
                throw new Error('Expected 3 types for Group, got ' + types.length);
            }
            if (types.indexOf('sub_part') === -1) throw new Error('Missing sub_part');
            if (types.indexOf('hit_box') === -1) throw new Error('Missing hit_box');
            if (types.indexOf('interact_box') === -1) throw new Error('Missing interact_box');
        });

        it('Locator 仅返回 [connector]', function () {
            var locator = new globalThis.Locator('testLocator');
            var types = markers.getMarkerTypesForElement(locator);
            if (types.length !== 1) {
                throw new Error('Expected 1 type for Locator, got ' + types.length);
            }
            if (types[0] !== 'connector') throw new Error('Missing connector');
        });

        it('普通对象返回空数组', function () {
            var plain = { constructor: { name: 'Object' } };
            var types = markers.getMarkerTypesForElement(plain);
            if (!Array.isArray(types) || types.length !== 0) {
                throw new Error('Expected empty array for plain object, got ' + JSON.stringify(types));
            }
        });
    });

    // ─── setMarker ────────────────────────────────────────────────────────────

    describe('setMarker', function () {
        it('在 config.parts[partId].element_markers[variantName][uuid] 设置标记', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();

            var result = markers.setMarker(config, 'test_part', 'default', 'uuid-1', 'connector', null);

            if (result !== true) throw new Error('Expected true, got ' + result);
            var stored = config.parts['test_part'].element_markers['default']['uuid-1'];
            if (!stored) throw new Error('Marker not stored');
            if (stored.type !== 'connector') throw new Error('Expected type connector, got ' + stored.type);
            if (stored.config_ref !== null) throw new Error('Expected config_ref null, got ' + stored.config_ref);
        });

        it('type 为 sub_part 且 configRef 提供时自动创建 sub_part 配置', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();

            var result = markers.setMarker(config, 'test_part', 'default', 'uuid-sp', 'sub_part', 'my_bone');

            if (result !== true) throw new Error('Expected true');
            var variant = config.parts['test_part'].variants['default'];
            if (!variant.sub_parts || !variant.sub_parts['my_bone']) {
                throw new Error('Expected sub_part config to be auto-created');
            }
            if (variant.sub_parts['my_bone'].start_bone !== 'my_bone') {
                throw new Error('Expected start_bone to be my_bone, got ' + variant.sub_parts['my_bone'].start_bone);
            }
        });

        it('对不存在的零件返回 false', function () {
            var config = helpers.createMinimalConfig();
            var result = markers.setMarker(config, 'nonexistent', 'default', 'uuid-x', 'connector', null);
            if (result !== false) throw new Error('Expected false for non-existent part, got ' + result);
        });

        it('多次设置标记会覆盖已有标记', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();

            markers.setMarker(config, 'test_part', 'default', 'uuid-1', 'hit_box', 'sp_1');
            markers.setMarker(config, 'test_part', 'default', 'uuid-1', 'connector', null);

            var stored = markers.getMarker(config, 'test_part', 'default', 'uuid-1');
            if (stored.type !== 'connector') throw new Error('Expected type connector after overwrite, got ' + stored.type);
            if (stored.config_ref !== null) throw new Error('Expected config_ref null, got ' + stored.config_ref);
        });
    });

    // ─── getMarker ────────────────────────────────────────────────────────────

    describe('getMarker', function () {
        it('返回已存储的标记', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();
            markers.setMarker(config, 'test_part', 'default', 'uuid-1', 'hit_box', 'sp_key');

            var marker = markers.getMarker(config, 'test_part', 'default', 'uuid-1');
            if (!marker) throw new Error('Expected marker, got null');
            if (marker.type !== 'hit_box') throw new Error('Expected hit_box, got ' + marker.type);
            if (marker.config_ref !== 'sp_key') throw new Error('Expected config_ref sp_key, got ' + marker.config_ref);
        });

        it('对不存在的零件返回 null', function () {
            var config = helpers.createMinimalConfig();
            var marker = markers.getMarker(config, 'nonexistent', 'default', 'uuid-1');
            if (marker !== null) throw new Error('Expected null for non-existent part');
        });

        it('对不存在的 uuid 返回 null', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();
            var marker = markers.getMarker(config, 'test_part', 'default', 'nonexistent-uuid');
            if (marker !== null) throw new Error('Expected null for non-existent uuid');
        });

        it('对不存在的 variant 返回 null', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();
            var marker = markers.getMarker(config, 'test_part', 'nonexistent_variant', 'uuid-1');
            if (marker !== null) throw new Error('Expected null for non-existent variant');
        });
    });

    // ─── clearMarker ──────────────────────────────────────────────────────────

    describe('clearMarker', function () {
        it('移除标记并返回 true', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();
            markers.setMarker(config, 'test_part', 'default', 'uuid-1', 'connector', null);

            var result = markers.clearMarker(config, 'test_part', 'default', 'uuid-1');
            if (result !== true) throw new Error('Expected true, got ' + result);

            var stored = markers.getMarker(config, 'test_part', 'default', 'uuid-1');
            if (stored !== null) throw new Error('Expected null after clear, got ' + JSON.stringify(stored));
        });

        it('清除 sub_part 标记时同时清理 sub_parts 配置条目', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();
            markers.setMarker(config, 'test_part', 'default', 'uuid-sp', 'sub_part', 'my_bone');

            // 验证 sub_parts 条目存在
            if (!config.parts['test_part'].variants['default'].sub_parts['my_bone']) {
                throw new Error('Expected sub_parts entry before clear');
            }

            markers.clearMarker(config, 'test_part', 'default', 'uuid-sp');

            // 验证 sub_parts 条目已被清理
            if (config.parts['test_part'].variants['default'].sub_parts['my_bone']) {
                throw new Error('Expected sub_parts entry to be cleaned up after clear');
            }
        });

        it('清除 hit_box 标记时同时清理 sub_part.hit_boxes 条目', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();

            // 先创建 sub_part 标记
            markers.setMarker(config, 'test_part', 'default', 'uuid-sp', 'sub_part', 'my_bone');

            // 手动添加 hit_boxes 条目（模拟调用方行为）
            var sp = config.parts['test_part'].variants['default'].sub_parts['my_bone'];
            sp.hit_boxes = {};
            sp.hit_boxes['uuid-hb'] = { name: 'test_hitbox' };

            // 设置 hit_box 标记
            markers.setMarker(config, 'test_part', 'default', 'uuid-hb', 'hit_box', 'my_bone');

            // 验证 hit_boxes 条目存在
            if (!sp.hit_boxes['uuid-hb']) {
                throw new Error('Expected hit_boxes entry before clear');
            }

            markers.clearMarker(config, 'test_part', 'default', 'uuid-hb');

            // 验证 hit_boxes 条目已被清理
            if (sp.hit_boxes && sp.hit_boxes['uuid-hb']) {
                throw new Error('Expected hit_boxes entry to be cleaned up after clear');
            }
        });

        it('对不存在的零件返回 false', function () {
            var config = helpers.createMinimalConfig();
            var result = markers.clearMarker(config, 'nonexistent', 'default', 'uuid-1');
            if (result !== false) throw new Error('Expected false for non-existent part');
        });

        it('对不存在的标记返回 false', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();
            var result = markers.clearMarker(config, 'test_part', 'default', 'nonexistent-uuid');
            if (result !== false) throw new Error('Expected false for non-existent marker');
        });
    });

    // ─── getMarkersForVariant ─────────────────────────────────────────────────

    describe('getMarkersForVariant', function () {
        it('返回变体的所有标记', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();
            markers.setMarker(config, 'test_part', 'default', 'uuid-1', 'connector', null);
            markers.setMarker(config, 'test_part', 'default', 'uuid-2', 'connector', null);

            var result = markers.getMarkersForVariant(config, 'test_part', 'default');
            var keys = Object.keys(result);
            if (keys.length !== 2) throw new Error('Expected 2 markers, got ' + keys.length);
            if (!result['uuid-1'] || !result['uuid-2']) {
                throw new Error('Missing expected markers');
            }
        });

        it('对无标记的变体返回空对象', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();
            var result = markers.getMarkersForVariant(config, 'test_part', 'default');
            if (Object.keys(result).length !== 0) {
                throw new Error('Expected empty object, got ' + JSON.stringify(result));
            }
        });

        it('对不存在的零件返回空对象', function () {
            var config = helpers.createMinimalConfig();
            var result = markers.getMarkersForVariant(config, 'nonexistent', 'default');
            if (Object.keys(result).length !== 0) {
                throw new Error('Expected empty object for non-existent part');
            }
        });
    });

    // ─── clearAllMarkers ──────────────────────────────────────────────────────

    describe('clearAllMarkers', function () {
        it('清除指定变体的所有标记', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();
            markers.setMarker(config, 'test_part', 'default', 'uuid-1', 'connector', null);
            markers.setMarker(config, 'test_part', 'default', 'uuid-2', 'connector', null);

            markers.clearAllMarkers(config, 'test_part', 'default');

            var result = markers.getMarkersForVariant(config, 'test_part', 'default');
            if (Object.keys(result).length !== 0) {
                throw new Error('Expected no markers after clearAllMarkers');
            }
        });

        it('不指定变体时清除零件所有变体的标记', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();
            // 添加第二个变体
            config.parts['test_part'].variants['alt'] = {
                model: 'alt.geo.json',
                textures: 'alt.png',
                animations: null,
                tags: [],
                sub_parts: {},
            };
            markers.setMarker(config, 'test_part', 'default', 'uuid-1', 'connector', null);
            markers.setMarker(config, 'test_part', 'alt', 'uuid-2', 'connector', null);

            markers.clearAllMarkers(config, 'test_part');

            var defaultMarkers = markers.getMarkersForVariant(config, 'test_part', 'default');
            var altMarkers = markers.getMarkersForVariant(config, 'test_part', 'alt');
            if (Object.keys(defaultMarkers).length !== 0 || Object.keys(altMarkers).length !== 0) {
                throw new Error('Expected all variant markers cleared');
            }
        });
    });

    // ─── Integration: setMarker → getMarker → clearMarker → getMarker ────────

    describe('integration lifecycle', function () {
        it('setMarker → getMarker → clearMarker → getMarker 完整生命周期', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();

            // 1. setMarker
            var setResult = markers.setMarker(config, 'test_part', 'default', 'uuid-lifecycle', 'connector', 'ref_connector');
            if (setResult !== true) throw new Error('setMarker failed');

            // 2. getMarker — 验证存储
            var marker = markers.getMarker(config, 'test_part', 'default', 'uuid-lifecycle');
            if (!marker) throw new Error('getMarker returned null after set');
            if (marker.type !== 'connector') throw new Error('Type mismatch after set');
            if (marker.config_ref !== 'ref_connector') throw new Error('config_ref mismatch after set');

            // 3. clearMarker
            var clearResult = markers.clearMarker(config, 'test_part', 'default', 'uuid-lifecycle');
            if (clearResult !== true) throw new Error('clearMarker failed');

            // 4. getMarker — 验证已清除
            var afterClear = markers.getMarker(config, 'test_part', 'default', 'uuid-lifecycle');
            if (afterClear !== null) throw new Error('getMarker should return null after clear');

            // 5. 再次 clearMarker — 验证返回 false
            var doubleClear = markers.clearMarker(config, 'test_part', 'default', 'uuid-lifecycle');
            if (doubleClear !== false) throw new Error('Expected false on double clear');
        });

        it('sub_part 标记的创建与清理完整生命周期', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();

            // 1. 设置 sub_part 标记 → 自动创建 sub_parts 配置
            markers.setMarker(config, 'test_part', 'default', 'uuid-sp-life', 'sub_part', 'bone_a');
            var sp = config.parts['test_part'].variants['default'].sub_parts['bone_a'];
            if (!sp) throw new Error('sub_parts entry not created');
            if (sp.start_bone !== 'bone_a') throw new Error('start_bone not set');

            // 2. 清除 sub_part 标记 → sub_parts 条目被清理
            markers.clearMarker(config, 'test_part', 'default', 'uuid-sp-life');
            if (config.parts['test_part'].variants['default'].sub_parts['bone_a']) {
                throw new Error('sub_parts entry not cleaned up');
            }
        });

        it('先标碰撞箱再标子零件再清除 —— 碰撞箱不残留', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();
            var variant = config.parts['test_part'].variants['default'];

            // 1. 先创建父子零件，以便碰撞箱有归属
            markers.setMarker(config, 'test_part', 'default', 'uuid-parent-sp', 'sub_part', 'parent_bone');
            var parentSp = variant.sub_parts['parent_bone'];
            parentSp.hit_boxes = {};

            // 2. 标记同一组为碰撞箱（归属 parent_bone）
            parentSp.hit_boxes['uuid-target'] = { name: 'hitbox_entry' };
            markers.setMarker(config, 'test_part', 'default', 'uuid-target', 'hit_box', 'parent_bone');

            // 3. 覆盖标记为子零件（这会触发旧 hit_box 副作用的清理）
            markers.setMarker(config, 'test_part', 'default', 'uuid-target', 'sub_part', 'target_bone');

            // 验证：旧的 hit_boxes 条目已被清理
            if (parentSp.hit_boxes && parentSp.hit_boxes['uuid-target']) {
                throw new Error('hit_box 残留: 覆盖标记后旧 hit_boxes 条目未被清理');
            }

            // 4. 清除标记
            markers.clearMarker(config, 'test_part', 'default', 'uuid-target');

            // 验证：sub_parts 条目被清理
            if (variant.sub_parts && variant.sub_parts['target_bone']) {
                throw new Error('sub_part 残留: 清除标记后 sub_parts 条目未被清理');
            }
            // 验证：旧的 hit_boxes 也没有残留
            if (parentSp.hit_boxes && parentSp.hit_boxes['uuid-target']) {
                throw new Error('hit_box 残留: 清除标记后旧 hit_boxes 条目仍存在');
            }
        });

        it('先标子零件再标碰撞箱再清除 —— 子零件不残留', function () {
            var config = helpers.createMinimalConfig();
            config.parts['test_part'] = helpers.createSamplePart();
            var variant = config.parts['test_part'].variants['default'];

            // 1. 先创建父子零件，以便碰撞箱有归属
            markers.setMarker(config, 'test_part', 'default', 'uuid-parent-sp', 'sub_part', 'parent_bone');
            var parentSp = variant.sub_parts['parent_bone'];
            parentSp.hit_boxes = {};

            // 2. 标记同一组为子零件 → 自动创建 sub_parts 条目
            markers.setMarker(config, 'test_part', 'default', 'uuid-target', 'sub_part', 'target_bone');
            if (!variant.sub_parts['target_bone']) {
                throw new Error('前置条件失败: sub_parts 条目未创建');
            }

            // 3. 覆盖标记为碰撞箱（这会触发旧 sub_part 副作用的清理）
            parentSp.hit_boxes['uuid-target'] = { name: 'new_hitbox' };
            markers.setMarker(config, 'test_part', 'default', 'uuid-target', 'hit_box', 'parent_bone');

            // 验证：旧的 sub_parts 条目已被清理
            if (variant.sub_parts && variant.sub_parts['target_bone']) {
                throw new Error('sub_part 残留: 覆盖标记后旧 sub_parts 条目未被清理');
            }

            // 4. 清除标记
            markers.clearMarker(config, 'test_part', 'default', 'uuid-target');

            // 验证：hit_boxes 条目被清理
            if (parentSp.hit_boxes && parentSp.hit_boxes['uuid-target']) {
                throw new Error('hit_box 残留: 清除标记后 hit_boxes 条目未被清理');
            }
            // 验证：旧的 sub_parts 也没有残留
            if (variant.sub_parts && variant.sub_parts['target_bone']) {
                throw new Error('sub_part 残留: 清除标记后旧 sub_parts 条目仍存在');
            }
        });
    });

    // ─── MARKER_TYPE_LIST ─────────────────────────────────────────────────────

    describe('MARKER_TYPE_LIST', function () {
        it('包含所有 4 种标记类型名称', function () {
            if (!Array.isArray(markers.MARKER_TYPE_LIST)) {
                throw new Error('MARKER_TYPE_LIST should be an array');
            }
            if (markers.MARKER_TYPE_LIST.length !== 4) {
                throw new Error('Expected 4 entries, got ' + markers.MARKER_TYPE_LIST.length);
            }
            var expected = ['sub_part', 'hit_box', 'connector', 'interact_box'];
            expected.forEach(function (t) {
                if (markers.MARKER_TYPE_LIST.indexOf(t) === -1) {
                    throw new Error('Missing type in MARKER_TYPE_LIST: ' + t);
                }
            });
        });
    });
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
