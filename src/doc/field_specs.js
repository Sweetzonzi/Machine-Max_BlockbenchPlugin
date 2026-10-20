// 文件: src/doc/field_specs.js
// 用途: field_specs.generated.js 的门面 + 内部字段/容器表（docs/13 §5.2 / §5.3）
// 所属模块: MachineMax Blockbench 插件
//
// 生成物只描述 schema 字段；本模块补上「不进 schema 的内部树字段」与
// 「容器由 address 处理」的边界，供 address / validate / projection 共用。
// 纯函数，不 require Blockbench / Vue。

'use strict';

var generated = require('./field_specs.generated.js');

var PROVENANCE = generated.PROVENANCE;
var SPECS = generated.SPECS;
var CONTAINERS = generated.CONTAINERS;
var SIDE_EFFECTS = generated.SIDE_EFFECTS;

var KINDS = ['part', 'variant', 'sub_part', 'hit_box', 'interact_box', 'connector', 'subsystem'];

// 配置根字段（只读白名单）。`_uiState` / `_lastMigration` 是内部字段，
// 路径解析必须在字段白名单阶段返回 unknown_field。
var ROOT_FIELDS = {
    '$schema_version': { type: 'number' },
    namespace: { type: 'string' },
    modelFile: { type: 'string' },
    contentPackPath: { type: 'string' },
    dependencyPaths: { type: 'array' },
    packMeta: { type: 'object' },
    parts: { type: 'object', container: 'map', map: 'parts' },
};

var ROOT_INTERNAL_FIELDS = ['_uiState', '_lastMigration'];

// 各 kind 的内部字段：只在内部树存在，projection 剥离，地址不可寻址。
var INTERNAL_FIELDS = {
    part: ['element_markers', '_unresolved_bones'],
    variant: [],
    sub_part: ['auto_end_bones'],
    hit_box: [],
    interact_box: ['_uuid'],
    connector: ['_marker_uuid', 'legacy_config_ref'],
    subsystem: [],
};

// 容器字段 → 子节点 kind（由 address 处理，不生成字段规格）
var CONTAINER_CHILD_KIND = {
    parts: 'part',
    variants: 'variant',
    sub_parts: 'sub_part',
    hit_boxes: 'hit_box',
    interact_boxes: 'interact_box',
    connectors: 'connector',
    subsystems: 'subsystem',
};

// map 字段 → 值类型（这些字段在 SPECS 里是 object / oneOf，但地址按 key 处理）
var VALUE_MAP_FIELDS = {
    textures: 'resource',
    signal_targets: 'array',
    signal_translations: 'string',
    power_outputs: 'number',
    projectile_types: 'integer',
    hydrodynamics: 'object',
    overwrite: 'object',
};

function isObject(v) {    return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function isKnownKind(kind) {
    return KINDS.indexOf(kind) >= 0;
}

/** subsystem 用完整 type id；其它 kind 返回 null。 */
function getTypeId(kind, nodeOrTypeId) {
    if (kind !== 'subsystem') return null;
    if (typeof nodeOrTypeId === 'string') return nodeOrTypeId;
    if (nodeOrTypeId && typeof nodeOrTypeId.type === 'string') return nodeOrTypeId.type;
    return null;
}

/** 返回 { fields, required, schema? }；未知 subsystem 类型返回 null。 */
function getSpec(kind, typeIdOrNode) {
    if (kind === 'subsystem') {
        var typeId = getTypeId('subsystem', typeIdOrNode);
        if (!typeId) return null;
        return SPECS.subsystem[typeId] || null;
    }
    return SPECS[kind] || null;
}

function getFields(kind, typeIdOrNode) {
    var spec = getSpec(kind, typeIdOrNode);
    return spec ? spec.fields : {};
}

function getFieldSpec(kind, field, typeIdOrNode) {
    var fields = getFields(kind, typeIdOrNode);
    return fields[field] || null;
}

function getRequiredFields(kind, typeIdOrNode) {
    var spec = getSpec(kind, typeIdOrNode);
    return spec && Array.isArray(spec.required) ? spec.required.slice() : [];
}

function isRequiredField(kind, field, typeIdOrNode) {
    return getRequiredFields(kind, typeIdOrNode).indexOf(field) >= 0;
}

function getContainers(kind) {
    return (CONTAINERS[kind] || []).slice();
}

function isContainer(kind, field) {
    return getContainers(kind).indexOf(field) >= 0;
}

function getContainerChildKind(field) {
    return CONTAINER_CHILD_KIND[field] || null;
}

function isValueMapField(field) {
    return Object.prototype.hasOwnProperty.call(VALUE_MAP_FIELDS, field);
}

function isMapField(kind, field) {
    return isContainer(kind, field) || isValueMapField(field);
}

function getValueMapValueType(field) {
    return VALUE_MAP_FIELDS[field] || null;
}

function isInternalField(kind, field) {
    if (field === '_uiState') return true;
    if (kind === 'config' && ROOT_INTERNAL_FIELDS.indexOf(field) >= 0) return true;
    var list = INTERNAL_FIELDS[kind] || [];
    return list.indexOf(field) >= 0;
}

function getInternalFields(kind) {
    return (INTERNAL_FIELDS[kind] || []).slice();
}

function getRootField(field) {
    return ROOT_FIELDS[field] || null;
}

function isRootField(field) {
    return Object.prototype.hasOwnProperty.call(ROOT_FIELDS, field);
}

function getSideEffect(kind, field) {
    return SIDE_EFFECTS[kind + '.' + field] || null;
}

function listSubsystemTypes() {
    return Object.keys(SPECS.subsystem);
}

function hasSubsystemType(typeId) {
    return Object.prototype.hasOwnProperty.call(SPECS.subsystem, typeId);
}

/** 生成物里的字段规格是否要求 nullable（只有 overwrite）。 */
function isNullable(kind, field, typeIdOrNode) {
    var spec = getFieldSpec(kind, field, typeIdOrNode);
    return !!(spec && spec.nullable);
}

/**
 * 值是否属于该 kind 的已知字段（不含容器 / 内部字段）。
 * subsystem 未知类型时只认 `type`，供 address 返回 unknown_type。
 */
function isKnownField(kind, field, typeIdOrNode) {
    if (isContainer(kind, field)) return true;
    if (kind === 'subsystem') {
        var typeId = getTypeId('subsystem', typeIdOrNode);
        if (!typeId || !hasSubsystemType(typeId)) return field === 'type';
    }
    return !!getFieldSpec(kind, field, typeIdOrNode);
}

module.exports = {
    PROVENANCE: PROVENANCE,
    SPECS: SPECS,
    CONTAINERS: CONTAINERS,
    SIDE_EFFECTS: SIDE_EFFECTS,

    KINDS: KINDS,
    ROOT_FIELDS: ROOT_FIELDS,
    ROOT_INTERNAL_FIELDS: ROOT_INTERNAL_FIELDS,
    INTERNAL_FIELDS: INTERNAL_FIELDS,
    CONTAINER_CHILD_KIND: CONTAINER_CHILD_KIND,
    VALUE_MAP_FIELDS: VALUE_MAP_FIELDS,

    isKnownKind: isKnownKind,
    getTypeId: getTypeId,
    getSpec: getSpec,
    getFields: getFields,
    getFieldSpec: getFieldSpec,
    getRequiredFields: getRequiredFields,
    isRequiredField: isRequiredField,
    getContainers: getContainers,
    isContainer: isContainer,
    getContainerChildKind: getContainerChildKind,
    isValueMapField: isValueMapField,
    isMapField: isMapField,
    getValueMapValueType: getValueMapValueType,
    isInternalField: isInternalField,
    getInternalFields: getInternalFields,
    getRootField: getRootField,
    isRootField: isRootField,
    getSideEffect: getSideEffect,
    listSubsystemTypes: listSubsystemTypes,
    hasSubsystemType: hasSubsystemType,
    isNullable: isNullable,
    isKnownField: isKnownField,
};
