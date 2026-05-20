/**
 * 添加子系统对话框（通用模块，App.vue.js 和 patches.js 共用）
 *
 * 弹出类型选择对话框，用户选择类型并输入名称后，
 * 在指定子零件的 subsystems 中创建子系统实例。
 * 创建成功后自动显示 Toast 并通知 UI 刷新。
 *
 * @param {Object} options
 * @param {Object} options.config - 完整项目配置（MMProjectConfig）
 * @param {Object} options.variant - 当前变体配置
 * @param {string} options.spKey - 目标子零件 key
 * @param {string} [options.preSelectedType] - 预选的子系统类型 ID
 * @param {Function} [options.onCreated] - 创建成功回调 (spKey, instanceName)，用于 caller 特定逻辑
 * @param {Function} [options.beforeSet] - 设置前回调 (sp, instanceName, ssConfig)，用于 Vue 2 $set
 */
function showAddSubsystemDialog(options) {
    var config = options.config;
    var variant = options.variant;
    var spKey = options.spKey;
    var preSelectedType = options.preSelectedType || '';
    var onCreated = options.onCreated || function () {};
    var beforeSet = options.beforeSet || function (sp, instanceName, ssConfig) {
        // 通过新建对象重新赋值 subsystems，触发 Vue 2 响应式更新
        // 直接 sp.subsystems[instanceName] = ssConfig 在 Vue 2 中无法检测
        var subs = sp.subsystems || {};
        subs[instanceName] = ssConfig;
        sp.subsystems = Object.assign({}, subs);
    };

    if (!variant || !variant.sub_parts || !variant.sub_parts[spKey]) return;
    var sp = variant.sub_parts[spKey];
    if (!sp.subsystems) sp.subsystems = {};

    var ssTypes = require('../core/subsystem_types.js');
    var groupedTypes = ssTypes.getTypesGroupedByCategory();
    var { showToast } = require('../utils/notify.js');
    var { saveConfig } = require('../utils/persistence.js');

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
            subsystemType: { type: 'select', label: '子系统类型', options: allTypeOpts, value: preSelectedType || 'machine_max:engine' },
            instanceName: { type: 'text', label: '子系统名称', value: '', description: '留空自动生成' },
        },
        onConfirm: function (formData) {
            var typeId = formData.subsystemType;
            var instanceName = formData.instanceName;
            var meta = ssTypes.getTypeMeta(typeId);
            if (!meta) {
                showToast('无效的子系统类型', 'error');
                return false;
            }
            // 自动生成名称
            if (!instanceName || instanceName.trim() === '') {
                var { generateDefaultName, ensureUniqueName } = require('../core/naming.js');
                var ns = (config && config.namespace) || 'machine_max';
                var baseName = generateDefaultName('subsystem', { namespace: ns, typeShortName: typeId.split(':').pop() || 'ss' });
                instanceName = ensureUniqueName('subsystem', variant, spKey, baseName);
            } else {
                instanceName = instanceName.trim();
                // 检查唯一性
                if (sp.subsystems[instanceName]) {
                    showToast('子系统 "' + instanceName + '" 已存在', 'error');
                    return false;
                }
            }
            // 创建子系统实例（从 subsystem_types.js 读取动态字段默认值手动构造）
            // 注意：不使用 SubsystemDispatchCodec.decode()，因为 codec 中所有 .field() 字段在
            // 导出时承担必填校验职责，不应为创建实例而降低校验严格度。
            var defaultFields = ssTypes.getTypeDefaults(typeId);
            var ssConfig = { type: typeId, definition: '' };
            for (var key in defaultFields) {
                if (defaultFields.hasOwnProperty(key)) {
                    ssConfig[key] = defaultFields[key];
                }
            }
            beforeSet(sp, instanceName, ssConfig);
            onCreated(spKey, instanceName);
            // 持久化并触发 UI 刷新
            saveConfig();
            showToast('子系统 "' + instanceName + '" 已创建', 'positive');
            this.hide();
            Blockbench.dispatchEvent('update_selection');
        }
    }).show();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { showAddSubsystemDialog };
}