/**
 * add_subsystem_dialog.js — 添加子系统对话框（通用模块，App.vue.js 和 patches.js 共用）
 *
 * 只负责“选类型 + 起名”，落库与撤销边界都在
 * `core/operations.js` 的 `createSubsystem()` 里——同一动作换入口也自带撤销记录。
 *
 * @param {Object} options
 * @param {Object} options.config - 完整项目配置（MMProjectConfig）
 * @param {Object} options.variant - 当前变体配置（用于名称去重）
 * @param {string} [options.partId] - 零件 ID；缺省取 config._uiState.activePartId
 * @param {string} [options.variantName] - 变体名；缺省取 config._uiState.activeVariantName
 * @param {string} options.spKey - 目标子零件 key
 * @param {string} [options.preSelectedType] - 预选的子系统类型 ID
 * @param {Function} [options.onCreated] - 创建成功回调 (spKey, instanceName)，用于 caller 特定逻辑
 */

/** 模块级缓存：上次选择的子系统类型 ID，本次会话内跨对话框保持 */
var _lastSelectedType = 'machine_max:engine';

function showAddSubsystemDialog(options) {
    options = options || {};
    var config = options.config;
    var variant = options.variant;
    var spKey = options.spKey;
    var preSelectedType = options.preSelectedType || '';
    var onCreated = options.onCreated || function () {};
    var partId = options.partId || (config && config._uiState ? config._uiState.activePartId : '');
    var variantName = options.variantName || (config && config._uiState ? config._uiState.activeVariantName : '');

    if (!config || !variant || !spKey) return;

    var ssTypes = require('../core/subsystem_types.js');
    var groupedTypes = ssTypes.getTypesGroupedByCategory();
    var { showToast } = require('../utils/notify.js');
    var { saveConfig } = require('../utils/persistence.js');
    var ops = require('../core/operations.js');

    // 构建平铺所有子系统类型的下拉选项（分类前缀标注）
    var allTypeOpts = {};
    var catOrder = ['power', 'control', 'utility', 'experimental'];
    for (var ci = 0; ci < catOrder.length; ci++) {
        var cat = catOrder[ci];
        var types = groupedTypes[cat];
        if (!types || types.length === 0) continue;
        var catLabel = ssTypes.getCategoryLabel(cat);
        for (var ti = 0; ti < types.length; ti++) {
            var t = types[ti];
            allTypeOpts[t.id] = '[' + catLabel + '] ' + t.displayName;
        }
    }

    new Dialog({
        title: '添加子系统',
        form: {
            subsystemType: { type: 'select', label: '子系统类型', options: allTypeOpts, value: preSelectedType || _lastSelectedType },
            instanceName: { type: 'text', label: '子系统名称', value: '', description: '留空自动生成' },
        },
        onConfirm: function (formData) {
            var typeId = formData.subsystemType;
            var instanceName = formData.instanceName;
            if (!ssTypes.getTypeMeta(typeId)) {
                showToast('无效的子系统类型', 'error');
                return false;
            }
            // 记忆本次选择的类型，下次对话框默认选中
            _lastSelectedType = typeId;

            // 自动生成名称（生成规则属于 UI 便利功能，去重仍需在这里做）
            if (!instanceName || instanceName.trim() === '') {
                var { generateDefaultName, ensureUniqueName } = require('../core/naming.js');
                var ns = (config && config.namespace) || 'machine_max';
                var baseName = generateDefaultName('subsystem', { namespace: ns, typeShortName: typeId.split(':').pop() || 'ss' });
                instanceName = ensureUniqueName('subsystem', variant, spKey, baseName);
            } else {
                instanceName = instanceName.trim();
            }

            // 落库 + 撤销：由领域操作统一负责（内部会补建缺失的 sub_parts 条目、合并类型默认值）
            var result = ops.createSubsystem(config, {
                partId: partId,
                variantName: variantName,
                spKey: spKey,
                typeId: typeId,
                instanceName: instanceName,
            });
            if (!result.ok) {
                showToast(result.error, 'error');
                return false;
            }

            onCreated(spKey, result.instanceName);
            saveConfig();
            showToast('子系统 "' + result.instanceName + '" 已创建', 'positive');
            this.hide();
            Blockbench.dispatchEvent('update_selection');
        },
    }).show();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { showAddSubsystemDialog };
}
