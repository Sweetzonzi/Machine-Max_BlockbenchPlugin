/**
 * 标签对话框辅助函数 — 从 App.vue.js 提取
 *
 * 提供 add tag dialog 的构建逻辑，包括：
 *   - 默认标签分类选择（方向/功能/类型）
 *   - 自定义标签输入与校验
 *   - 标签哈希颜色生成
 */

var { showToast } = require('../utils/notify.js');
var { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('TagDialog');

/**
 * 标签颜色调色板
 */
var TAG_PALETTE = [
    '#3a6a9a', '#6a4a9a', '#9a4a6a', '#4a9a6a',
    '#9a8a3a', '#3a9a8a', '#8a4a3a', '#4a6a9a',
];

/**
 * 根据标签文本哈希生成一致的彩色背景色
 * @param {string} tag - 完整标签文本 (namespace:path)
 * @returns {string} 十六进制颜色值
 */
function _hashTagColor(tag) {
    var hash = 0;
    for (var i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return TAG_PALETTE[Math.abs(hash) % TAG_PALETTE.length];
}

/**
 * 打开添加标签对话框，包含默认标签分类选择和自定义标签输入
 * 默认标签使用 machine_max 命名空间，以彩色按钮形式展示已选状态
 *
 * @param {Object} vm - Vue component instance (this)
 * @param {Object} variant - the variant object
 */
function showAddTagDialog(vm, variant) {
    if (!variant) return;

    var existingTags = (variant.tags || []).slice();

    /**
     * 默认标签分类定义，所有标签使用 machine_max 命名空间
     */
    var DEFAULT_TAG_GROUPS = {
        direction: {
            label: '方向',
            tags: ['left', 'right', 'front', 'back', 'top', 'bottom'],
        },
        function: {
            label: '功能',
            tags: ['structural', 'decoration', 'mobility', 'weapon', 'misc'],
        },
        type: {
            label: '类型',
            tags: ['land', 'marine', 'aerial', 'mecha'],
        },
    };

    /** 默认标签的中文显示名映射 */
    var TAG_LABELS = {
        left: '左 (left)', right: '右 (right)', front: '前 (front)',
        back: '后 (back)', top: '上 (top)', bottom: '下 (bottom)',
        structural: '结构 (structural)', decoration: '装饰 (decoration)',
        mobility: '移动 (mobility)', weapon: '武器 (weapon)', misc: '杂项 (misc)',
        land: '地面 (land)', marine: '水中 (marine)',
        aerial: '空中 (aerial)', mecha: '机甲 (mecha)',
    };

    /**
     * 将完整标签（含 namespace）转为默认标签分类中的 path，若不在分类中返回 null
     */
    function tagToDefaultPath(fullTag) {
        var parts = fullTag.split(':');
        if (parts.length !== 2) return null;
        for (var gk in DEFAULT_TAG_GROUPS) {
            var group = DEFAULT_TAG_GROUPS[gk];
            if (group.tags.indexOf(parts[1]) !== -1) {
                return parts[1];
            }
        }
        return null;
    }

    // 构建表单字段
    var formFields = {};

    // 每个分类：一个 info 头 + 一组 checkbox
    for (var gk in DEFAULT_TAG_GROUPS) {
        var group = DEFAULT_TAG_GROUPS[gk];
        formFields[gk + '_hdr'] = {
            type: 'info',
            text: '<b>' + group.label + '</b>',
        };
        for (var ti = 0; ti < group.tags.length; ti++) {
            var tagPath = group.tags[ti];
            var fieldKey = '_t_' + tagPath;
            formFields[fieldKey] = {
                type: 'checkbox',
                label: TAG_LABELS[tagPath] || tagPath,
                value: false,
            };
        }
    }

    // 预填已选默认标签
    for (var ei = 0; ei < existingTags.length; ei++) {
        var p = tagToDefaultPath(existingTags[ei]);
        if (p) {
            var fk = '_t_' + p;
            if (formFields[fk]) {
                formFields[fk].value = true;
            }
        }
    }

    // 自定义标签输入
    formFields.customSection = {
        type: 'info',
        text: '<b>自定义标签</b>（超出默认范围的可在此添加）',
    };
    formFields.customNs = {
        type: 'text',
        label: '自定义命名空间',
        value: 'machine_max',
    };
    formFields.customPath = {
        type: 'text',
        label: '自定义标签路径',
        value: '',
        description: '如 my_custom_tag。仅限小写字母、数字、_ - . /',
    };

    // 当前自定义标签展示（只读展示，确认时自动保留）
    var customTags = existingTags.filter(function (t) { return !tagToDefaultPath(t); });
    formFields.currentCustom = {
        type: 'info',
        text: customTags.length > 0
            ? '已有自定义标签：' + customTags.map(function (t) {
                var color = _hashTagColor(t);
                return '<span style="display:inline-block;background:' + color + ';color:#fff;padding:0 6px;margin:1px;border-radius:3px;font-size:11px">' + t + '</span>';
            }).join('')
            : '（暂无自定义标签）',
    };

    new Dialog({
        title: '添加变体标签 — "' + vm.activeVariantName + '"',
        width: 520,
        form: formFields,
        onConfirm: function (formData) {
            var newTagList = [];

            // 1. 收集各分类中选中的默认标签（_t_ 开头的复选框字段）
            for (var fieldName in formData) {
                if (fieldName.indexOf('_t_') === 0 && formData[fieldName]) {
                    var tagPath = fieldName.substring(3);
                    newTagList.push('machine_max:' + tagPath);
                }
            }

            // 2. 保留已有的自定义标签（不在默认分类中的标签）
            for (var ci = 0; ci < customTags.length; ci++) {
                if (newTagList.indexOf(customTags[ci]) === -1) {
                    newTagList.push(customTags[ci]);
                }
            }

            // 3. 添加本次输入的新自定义标签
            var customNs = (formData.customNs || '').trim().toLowerCase();
            var customPath = (formData.customPath || '').trim().toLowerCase();
            if (customNs && customPath) {
                var nsRegex = /^[a-z0-9_\-./]+$/;
                var pathRegex = /^[a-z0-9_\-./]+$/;
                if (!nsRegex.test(customNs)) {
                    showToast('自定义命名空间格式无效', 'error');
                    return false;
                }
                if (!pathRegex.test(customPath)) {
                    showToast('自定义标签路径格式无效', 'error');
                    return false;
                }
                var fullCustom = customNs + ':' + customPath;
                // 检查是否与默认标签重复
                var dupDefault = tagToDefaultPath(fullCustom);
                if (dupDefault) {
                    showToast('"' + fullCustom + '" 与默认标签 machine_max:' + dupDefault + ' 重复，请直接在分类中选择', 'error');
                    return false;
                }
                // 检查自定义标签自身重复
                if (newTagList.indexOf(fullCustom) !== -1) {
                    showToast('标签 "' + fullCustom + '" 已存在', 'error');
                    return false;
                }
                newTagList.push(fullCustom);
            }

            // 去重
            newTagList = newTagList.filter(function (t, idx) { return newTagList.indexOf(t) === idx; });

            if (newTagList.length === 0) {
                showToast('请至少选择一个标签', 'error');
                return false;
            }

            // 更新到 variant.tags
            vm.$set(variant, 'tags', newTagList);
            log.info('标签添加: 已更新', { tags: newTagList });
            this.hide();
        },
    }).show();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { showAddTagDialog, _hashTagColor };
}
