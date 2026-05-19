/**
 * 子系统类型注册表（统一数据源）
 *
 * 每个条目的 dynamicFields 定义了该子系统类型的动态属性字段列表，
 * 与 Java 端 common/mech/subsystem/attr/dynamic_attr/ 下各 *SubsystemAttr
 * 类的 RecordCodecBuilder 一一对应。
 *
 * 面板、导出过滤器、创建对话框均透过本模块提供的 API 读取字段定义，
 * 新增类型只需在本数组末尾追加一条，无需修改任何其他文件。
 */

/**
 * 子系统类型元数据条目结构：
 * {
 *   id: 'machine_max:engine',           // 类型 ID，与 Java SubsystemTypes 枚举 + 资源位置对应
 *   displayName: '发动机',               // 中文显示名
 *   category: 'power',                  // 分类：power | control | utility | experimental
 *   dynamicFields: [{                   // 动态属性字段描述符列表
 *       field: string,                  //   JSON 键名，与 Java RecordCodecBuilder.fieldOf() 一致
 *       label: string,                  //   面板中文标签
 *       editor: string,                 //   编辑器类型（见 EDITOR_LABELS）
 *       required: boolean,              //   Java 端 fieldOf（必填）或 optionalFieldOf（可选）
 *       defaultValue: any,              //   创建实例时的默认值
 *       options: string[],              //   (仅 editor === 'enum_selector') 可选值列表
 *   }],
 * }
 */

var SUBSYSTEM_TYPES = [
    // ===== power 分类 =====
    {
        id: 'machine_max:engine',
        displayName: '发动机',
        category: 'power',
        dynamicFields: [
            { field: 'definition',    label: '型号定义',      editor: 'definition_selector', required: true,  defaultValue: '' },
            { field: 'power_output',  label: '功率输出目标',  editor: 'power_target',        required: true,  defaultValue: '' },
            { field: 'speed_outputs', label: '转速信号输出',  editor: 'signal_targets',       required: false, defaultValue: { engine_speed: ['subpart', 'vehicle'] } },
        ],
    },
    {
        id: 'machine_max:motor',
        displayName: '电动机',
        category: 'power',
        dynamicFields: [
            { field: 'definition',    label: '型号定义',      editor: 'definition_selector', required: true,  defaultValue: '' },
            { field: 'power_output',  label: '功率输出目标',  editor: 'power_target',        required: true,  defaultValue: '' },
            { field: 'speed_outputs', label: '转速信号输出',  editor: 'signal_targets',       required: false, defaultValue: { motor_speed: ['subpart', 'vehicle'] } },
        ],
    },
    {
        id: 'machine_max:battery',
        displayName: '电池',
        category: 'power',
        dynamicFields: [
            { field: 'definition',    label: '型号定义', editor: 'definition_selector', required: true,  defaultValue: '' },
        ],
    },
    {
        id: 'machine_max:gearbox',
        displayName: '变速箱',
        category: 'power',
        dynamicFields: [
            { field: 'definition',    label: '型号定义',     editor: 'definition_selector', required: true,  defaultValue: '' },
            { field: 'power_output',  label: '功率输出目标', editor: 'power_target',        required: true,  defaultValue: '' },
            { field: 'gear_outputs',  label: '挡位信号输出', editor: 'signal_targets',       required: false, defaultValue: { gear: ['subpart', 'vehicle'] } },
        ],
    },
    {
        id: 'machine_max:transmission',
        displayName: '分动箱',
        category: 'power',
        dynamicFields: [
            { field: 'definition',    label: '型号定义',     editor: 'definition_selector', required: true,  defaultValue: '' },
            { field: 'power_outputs', label: '功率输出分配', editor: 'power_outputs_map',    required: true,  defaultValue: {} },
        ],
    },
    {
        id: 'machine_max:motor_controller',
        displayName: '电机控制器',
        category: 'power',
        dynamicFields: [
            { field: 'definition',    label: '型号定义',    editor: 'definition_selector', required: true,  defaultValue: '' },
            { field: 'power_output',  label: '功率输出目标',editor: 'power_target',        required: true,  defaultValue: '' },
            { field: 'speed_outputs', label: '转速信号输出',editor: 'signal_targets',       required: false, defaultValue: { motor_speed: ['subpart', 'vehicle'] } },
        ],
    },
    // ===== control 分类 =====
    {
        id: 'machine_max:car_controller',
        displayName: '车辆控制器',
        category: 'control',
        dynamicFields: [
            { field: 'definition',       label: '型号定义',      editor: 'definition_selector', required: true,  defaultValue: '' },
            { field: 'control_outputs',  label: '控制信号输出',  editor: 'signal_targets',      required: true,  defaultValue: { car_control: [] } },
            { field: 'speed_outputs',    label: '速度信号输出',  editor: 'signal_targets',      required: false, defaultValue: { vehicle_speed: ['subpart', 'vehicle'] } },
            { field: 'throttle_outputs', label: '油门信号输出',  editor: 'signal_targets',      required: false, defaultValue: { throttle: ['subpart', 'vehicle'] } },
            { field: 'steering_outputs', label: '转向信号输出',  editor: 'signal_targets',      required: false, defaultValue: { steering: ['subpart', 'vehicle'] } },
            { field: 'brake_outputs',    label: '刹车信号输出',  editor: 'signal_targets',      required: false, defaultValue: { brake: ['subpart', 'vehicle'] } },
            { field: 'handbrake_outputs',label: '手刹信号输出',  editor: 'signal_targets',      required: false, defaultValue: { handbrake: ['subpart', 'vehicle'] } },
        ],
    },
    {
        id: 'machine_max:motorbike_controller',
        displayName: '摩托车控制器',
        category: 'control',
        dynamicFields: [
            { field: 'definition',       label: '型号定义',      editor: 'definition_selector', required: true,  defaultValue: '' },
            { field: 'control_outputs',  label: '控制信号输出',  editor: 'signal_targets',      required: true,  defaultValue: { car_control: [] } },
            { field: 'speed_outputs',    label: '速度信号输出',  editor: 'signal_targets',      required: false, defaultValue: { vehicle_speed: ['subpart', 'vehicle'] } },
            { field: 'throttle_outputs', label: '油门信号输出',  editor: 'signal_targets',      required: false, defaultValue: { throttle: ['subpart', 'vehicle'] } },
            { field: 'steering_outputs', label: '转向信号输出',  editor: 'signal_targets',      required: false, defaultValue: { steering: ['subpart', 'vehicle'] } },
            { field: 'brake_outputs',    label: '刹车信号输出',  editor: 'signal_targets',      required: false, defaultValue: { brake: ['subpart', 'vehicle'] } },
            { field: 'handbrake_outputs',label: '手刹信号输出',  editor: 'signal_targets',      required: false, defaultValue: { handbrake: ['subpart', 'vehicle'] } },
        ],
    },
    {
        id: 'machine_max:signal_convert',
        displayName: '信号转换器',
        category: 'control',
        dynamicFields: [
            { field: 'definition', label: '型号定义', editor: 'definition_selector', required: true,  defaultValue: '' },
        ],
    },
    // ===== utility 分类 =====
    {
        id: 'machine_max:wheel_driver',
        displayName: '轮胎驱动器',
        category: 'utility',
        dynamicFields: [
            { field: 'definition',             label: '型号定义',        editor: 'definition_selector', required: true,  defaultValue: '' },
            { field: 'connector',              label: '关联连接点',      editor: 'connector_selector',  required: true,  defaultValue: '' },
            { field: 'roll_speed_outputs',     label: '滚动速度信号输出',editor: 'signal_targets',      required: false, defaultValue: {} },
            { field: 'steering_angle_outputs', label: '转向角度信号输出',editor: 'signal_targets',      required: false, defaultValue: {} },
        ],
    },
    {
        id: 'machine_max:seat',
        displayName: '座位',
        category: 'utility',
        dynamicFields: [
            { field: 'definition',           label: '型号定义',    editor: 'definition_selector', required: true,  defaultValue: '' },
            { field: 'locator',              label: '关联定位器',  editor: 'locator_selector',    required: true,  defaultValue: '' },
            { field: 'move_outputs',         label: '移动信号输出',editor: 'signal_targets',      required: false, defaultValue: { move_control: [] } },
            { field: 'aim_outputs',          label: '瞄准信号输出',editor: 'signal_targets',      required: false, defaultValue: { aim: [] } },
            { field: 'regular_outputs',      label: '常规信号输出',editor: 'signal_targets',      required: false, defaultValue: { regular_control: [] } },
            { field: 'passenger_num_outputs',label: '乘客数信号输出',editor: 'signal_targets',     required: false, defaultValue: { passenger_num: ['subpart', 'vehicle'] } },
        ],
    },
    {
        id: 'machine_max:lighting',
        displayName: '灯光',
        category: 'utility',
        dynamicFields: [
            { field: 'definition', label: '型号定义',   editor: 'definition_selector', required: true,  defaultValue: '' },
            { field: 'locator',    label: '光源定位器', editor: 'locator_selector',    required: false, defaultValue: '' },
        ],
    },
    {
        id: 'machine_max:item_storage',
        displayName: '物品存储',
        category: 'utility',
        dynamicFields: [
            { field: 'definition', label: '型号定义', editor: 'definition_selector', required: true,  defaultValue: '' },
        ],
    },
    {
        id: 'machine_max:basic',
        displayName: '基础（无额外面板）',
        category: 'utility',
        dynamicFields: [
            { field: 'definition', label: '型号定义', editor: 'definition_selector', required: true,  defaultValue: '' },
        ],
    },
    {
        id: 'machine_max:joint',
        displayName: '关节',
        category: 'utility',
        dynamicFields: [
            { field: 'definition',      label: '型号定义',   editor: 'definition_selector', required: true,  defaultValue: '' },
            { field: 'locator',         label: '关联定位器', editor: 'locator_selector',    required: true,  defaultValue: '' },
            { field: 'rotation_order',  label: '旋转顺序',   editor: 'enum_selector',       required: true,  defaultValue: 'XYZ',
              options: ['XYZ', 'XZY', 'YXZ', 'ZYX', 'ZXY', 'YZX'] },
            { field: 'axes',            label: '关节轴参数', editor: 'json_textarea',        required: true,  defaultValue: {} },
        ],
    },
    // ===== experimental 分类 =====
    {
        id: 'machine_max:camera',
        displayName: '摄像头',
        category: 'experimental',
        dynamicFields: [
            { field: 'definition', label: '型号定义', editor: 'definition_selector', required: true,  defaultValue: '' },
        ],
    },
    {
        id: 'machine_max:javascript',
        displayName: 'JavaScript 脚本',
        category: 'experimental',
        dynamicFields: [
            { field: 'definition', label: '型号定义', editor: 'definition_selector', required: true,  defaultValue: '' },
            { field: 'script',     label: '脚本内容', editor: 'text_input',           required: false, defaultValue: '' },
        ],
    },
    {
        id: 'machine_max:turret',
        displayName: '炮塔',
        category: 'experimental',
        dynamicFields: [
            { field: 'definition',       label: '型号定义',    editor: 'definition_selector', required: true,  defaultValue: '' },
            { field: 'connector',        label: '关联连接点',  editor: 'connector_selector',  required: true,  defaultValue: '' },
            { field: 'rotation_outputs', label: '角度反馈输出',editor: 'signal_targets',       required: false, defaultValue: {} },
        ],
    },
    {
        id: 'machine_max:fire_controller',
        displayName: '火控系统',
        category: 'experimental',
        dynamicFields: [
            { field: 'definition',      label: '型号定义',     editor: 'definition_selector', required: true,  defaultValue: '' },
            { field: 'control_outputs', label: '控制信号输出', editor: 'signal_targets',       required: false, defaultValue: { fire_control: [] } },
        ],
    },
    {
        id: 'machine_max:launcher',
        displayName: '发射器',
        category: 'experimental',
        dynamicFields: [
            { field: 'definition',    label: '型号定义',   editor: 'definition_selector', required: true,  defaultValue: '' },
            { field: 'locator',       label: '发射点定位器',editor: 'locator_selector',    required: true,  defaultValue: '' },
            { field: 'ammo_outputs',  label: '弹药反馈输出',editor: 'signal_targets',       required: false, defaultValue: {} },
        ],
    },
];

/** 按 id 索引的类型字典（构建时生成） */
var TYPE_MAP = {};
(function () {
    for (var i = 0; i < SUBSYSTEM_TYPES.length; i++) {
        TYPE_MAP[SUBSYSTEM_TYPES[i].id] = SUBSYSTEM_TYPES[i];
    }
})();

// =============================================================================
// 公共工具函数
// =============================================================================

/**
 * 获取指定子系统类型的完整元数据
 * @param {string} typeId - 类型 ID，如 'machine_max:engine'
 * @returns {Object|null} 元数据对象，未知类型返回 null
 */
function getTypeMeta(typeId) {
    return TYPE_MAP[typeId] || null;
}

/**
 * 获取所有子系统类型列表
 * @returns {Object[]} 全部类型条目数组（浅拷贝）
 */
function getAllTypes() {
    return SUBSYSTEM_TYPES.slice();
}

/**
 * 按分类筛选子系统类型
 * @param {string} category - 分类名
 * @returns {Object[]} 筛选后的类型条目数组
 */
function getTypesByCategory(category) {
    return SUBSYSTEM_TYPES.filter(function (t) { return t.category === category; });
}

/**
 * 获取所有类型按分类组织
 * @returns {Object} { power: [...], control: [...], utility: [...], experimental: [...] }
 */
function getTypesGroupedByCategory() {
    var result = { power: [], control: [], utility: [], experimental: [] };
    for (var i = 0; i < SUBSYSTEM_TYPES.length; i++) {
        var t = SUBSYSTEM_TYPES[i];
        if (result[t.category]) {
            result[t.category].push(t);
        }
    }
    return result;
}

/**
 * 获取指定子系统类型的动态属性字段描述符列表
 * @param {string} typeId - 类型 ID
 * @returns {Object[]} 字段描述符数组，未知类型返回空数组
 */
function getDynamicFields(typeId) {
    var meta = TYPE_MAP[typeId];
    return meta ? meta.dynamicFields.slice() : [];
}

/**
 * 获取指定子系统类型的字段默认值对象（兼容旧接口 getTypeDefaults）
 * @param {string} typeId - 类型 ID
 * @returns {Object} 默认值对象（深拷贝，不包含 definition 和 type）
 */
function getTypeDefaults(typeId) {
    var fields = getDynamicFields(typeId);
    var result = {};
    for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        if (f.field === 'definition') continue;
        result[f.field] = JSON.parse(JSON.stringify(f.defaultValue));
    }
    return result;
}

/**
 * 获取指定子系统类型的特有字段列表（兼容旧接口 getTypeSpecificFields）
 * @param {string} typeId - 类型 ID
 * @returns {string[]} 字段键名数组
 */
function getTypeSpecificFields(typeId) {
    var fields = getDynamicFields(typeId);
    var names = [];
    for (var i = 0; i < fields.length; i++) {
        names.push(fields[i].field);
    }
    return names;
}

/**
 * 判断子系统类型是否需要选择定位器（locator）
 * @param {string} typeId
 * @returns {boolean}
 */
function needsLocator(typeId) {
    var fields = getDynamicFields(typeId);
    for (var i = 0; i < fields.length; i++) {
        if (fields[i].editor === 'locator_selector') return true;
    }
    return false;
}

/**
 * 判断子系统类型是否需要选择连接点（connector）
 * @param {string} typeId
 * @returns {boolean}
 */
function needsConnector(typeId) {
    var fields = getDynamicFields(typeId);
    for (var i = 0; i < fields.length; i++) {
        if (fields[i].editor === 'connector_selector') return true;
    }
    return false;
}

/**
 * 获取子系统类型需要显示信号编辑器字段名列表（兼容旧接口 signalOutputs）
 *
 * 返回 editor 为 signal_targets 或 power_target 或 power_outputs_map 的字段名，
 * 这些字段需要信号频道编辑器或目标选择器 UI。
 *
 * @param {string} typeId
 * @returns {string[]}
 */
function getSignalOutputFieldNames(typeId) {
    var fields = getDynamicFields(typeId);
    var result = [];
    for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        // 只有非 definition/非引用选择器的字段需要信号编辑器
        if (f.editor === 'signal_targets' || f.editor === 'power_target' || f.editor === 'power_outputs_map') {
            result.push(f.field);
        }
    }
    return result;
}

/**
 * 编辑器类型的中文标签
 */
var EDITOR_LABELS = {
    definition_selector: '型号定义选择器',
    locator_selector: '定位器选择器',
    connector_selector: '连接点选择器',
    power_target: '功率目标选择器',
    signal_targets: '信号频道编辑器',
    power_outputs_map: '功率输出映射编辑器',
    enum_selector: '枚举下拉菜单',
    text_input: '文本输入框',
    json_textarea: 'JSON 编辑框',
};

/**
 * 获取编辑器类型的中文标签
 * @param {string} editorType - 编辑器类型标识
 * @returns {string}
 */
function getEditorLabel(editorType) {
    return EDITOR_LABELS[editorType] || editorType;
}

/** 分类颜色映射 */
var CATEGORY_COLORS = {
    power: '#e67e22',
    control: '#3498db',
    utility: '#2ecc71',
    experimental: '#9b59b6',
};

/**
 * 获取类型在面板上的显示颜色
 * @param {string} typeId
 * @returns {string} CSS 色值
 */
function getTypeColor(typeId) {
    var meta = TYPE_MAP[typeId];
    if (!meta) return '#888';
    return CATEGORY_COLORS[meta.category] || '#888';
}

/** 分类中文标签 */
var CATEGORY_LABELS = {
    power: '动力',
    control: '控制',
    utility: '功能',
    experimental: '实验',
};

/**
 * 获取类型分类的中文标签
 * @param {string} category
 * @returns {string}
 */
function getCategoryLabel(category) {
    return CATEGORY_LABELS[category] || category;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUBSYSTEM_TYPES: SUBSYSTEM_TYPES,
        getTypeMeta: getTypeMeta,
        getAllTypes: getAllTypes,
        getTypesByCategory: getTypesByCategory,
        getTypesGroupedByCategory: getTypesGroupedByCategory,
        getDynamicFields: getDynamicFields,
        getTypeDefaults: getTypeDefaults,
        getTypeSpecificFields: getTypeSpecificFields,
        needsLocator: needsLocator,
        needsConnector: needsConnector,
        getSignalOutputFieldNames: getSignalOutputFieldNames,
        getEditorLabel: getEditorLabel,
        getTypeColor: getTypeColor,
        getCategoryLabel: getCategoryLabel,
    };
}
