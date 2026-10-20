// 文件: src/doc/validate.js
// 用途: 值校验（validateValues）与整树校验（validateTree）
// 所属模块: MachineMax Blockbench 插件
//
// 分工（docs/13 §5.2.5）：
//   - setField / projection.in：completeness:false，只查类型/枚举/范围/结构，允许 required 空占位
//   - canExport：completeness:true，额外查 required / minProperties
//   - key 校验由 doc/keys.validateKeys 负责，本模块只查值
// 纯函数，不 require Blockbench / Vue。

'use strict';

var fieldSpecs = require('./field_specs.js');
var keys = require('./keys.js');

function isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function makeError(path, code, expected, got, hint) {
    return {
        path: Array.isArray(path) ? path.slice() : [],
        code: code,
        expected: expected,
        got: got,
        hint: hint || '',
    };
}

function typeName(v) {
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    return typeof v;
}

function describeBranch(spec) {
    if (!spec) return 'any';
    if (spec.type) return spec.type;
    if (spec.oneOf) return 'oneOf';
    return 'any';
}

function validateEnum(spec, value, path) {
    if (!spec.enum || spec.enum.indexOf(value) >= 0) return [];
    return [makeError(path, 'invalid_enum', spec.enum.slice(), value,
        '允许值：' + spec.enum.join(', '))];
}

function validateRange(spec, value, path) {
    var errors = [];
    if (typeof value !== 'number') return errors;
    if (typeof spec.minimum === 'number' && value < spec.minimum) {
        errors.push(makeError(path, 'out_of_range', '>= ' + spec.minimum, value));
    }
    if (typeof spec.maximum === 'number' && value > spec.maximum) {
        errors.push(makeError(path, 'out_of_range', '<= ' + spec.maximum, value));
    }
    return errors;
}

function checkType(spec, value, path) {
    var t = spec.type;
    if (!t || t === 'any') return [];
    switch (t) {
        case 'string':
            return typeof value === 'string' ? []
                : [makeError(path, 'type_mismatch', 'string', typeName(value))];
        case 'number':
            return (typeof value === 'number' && isFinite(value)) ? []
                : [makeError(path, 'type_mismatch', 'number', typeName(value))];
        case 'integer':
            return (typeof value === 'number' && Number.isInteger(value)) ? []
                : [makeError(path, 'type_mismatch', 'integer', typeName(value))];
        case 'boolean':
            return typeof value === 'boolean' ? []
                : [makeError(path, 'type_mismatch', 'boolean', typeName(value))];
        case 'array':
        case 'tuple':
            return Array.isArray(value) ? []
                : [makeError(path, 'type_mismatch', 'array', typeName(value))];
        case 'object':
            return isPlainObject(value) ? []
                : [makeError(path, 'type_mismatch', 'object', typeName(value))];
        default:
            return [];
    }
}

/**
 * 校验单个值。
 *
 * @param {object} spec - field_specs 规格
 * @param {*} value
 * @param {string[]} path
 * @param {object} [opts] - { field, skipKeys }
 * @returns {Array} errors
 */
function validateValue(spec, value, path, opts) {
    opts = opts || {};
    if (!spec) return [];

    // 1. nullable 短路
    if (value === null) {
        if (spec.nullable) return [];
        return [makeError(path, 'type_mismatch', describeBranch(spec) + '（不允许 null）', 'null')];
    }

    // 2. oneOf 逐个尝试
    if (Array.isArray(spec.oneOf)) {
        for (var i = 0; i < spec.oneOf.length; i++) {
            var branchErrors = validateValue(spec.oneOf[i], value, path, opts);
            if (branchErrors.length === 0) return [];
        }
        return [makeError(path, 'type_mismatch',
            spec.oneOf.map(describeBranch).join(' | '), typeName(value),
            '值不匹配任何一个允许的分支')];
    }

    var errors = [];

    // 3. 基础类型
    errors = errors.concat(checkType(spec, value, path));
    if (errors.length > 0) return errors;

    // 4. enum
    errors = errors.concat(validateEnum(spec, value, path));

    // 5. 数值范围
    errors = errors.concat(validateRange(spec, value, path));

    // 6. tuple / 数组
    if (Array.isArray(value)) {
        if (typeof spec.minItems === 'number' && value.length < spec.minItems) {
            errors.push(makeError(path, 'type_mismatch', 'array length >= ' + spec.minItems,
                value.length, '数组长度不足'));
        }
        if (typeof spec.maxItems === 'number' && value.length > spec.maxItems) {
            errors.push(makeError(path, 'type_mismatch', 'array length <= ' + spec.maxItems,
                value.length, '数组长度超出'));
        }
        if (spec.type === 'tuple' && Array.isArray(spec.tuple)) {
            var tupleLen = Math.min(value.length, spec.tuple.length);
            for (var ti = 0; ti < tupleLen; ti++) {
                errors = errors.concat(validateValue(spec.tuple[ti], value[ti],
                    path.concat([ti]), opts));
            }
        } else if (spec.items) {
            for (var ai = 0; ai < value.length; ai++) {
                errors = errors.concat(validateValue(spec.items, value[ai],
                    path.concat([ai]), opts));
            }
        }
        return errors;
    }

    // 7. 对象属性
    if (isPlainObject(value)) {
        var objectKeys = Object.keys(value);
        if (opts.completeness && typeof spec.minProperties === 'number'
            && objectKeys.length < spec.minProperties) {
            errors.push(makeError(path, 'missing_required',
                'object with >= ' + spec.minProperties + ' properties',
                objectKeys.length,
                '至少需要 ' + spec.minProperties + ' 个条目'));
        }

        var known = spec.properties || null;
        for (var oi = 0; oi < objectKeys.length; oi++) {
            var key = objectKeys[oi];
            if (opts.field === 'projectile_types' && key.indexOf('__new_p_') === 0) continue;
            if (known && Object.prototype.hasOwnProperty.call(known, key)) {
                errors = errors.concat(validateValue(known[key], value[key],
                    path.concat([key]), { field: key, completeness: opts.completeness }));
            } else if (spec.additionalProperties === false) {
                errors.push(makeError(path.concat([key]), 'unknown_field',
                    'schema 未定义的字段', key, '该对象不允许额外字段'));
            } else if (spec.additionalProperties && typeof spec.additionalProperties === 'object') {
                errors = errors.concat(validateValue(spec.additionalProperties, value[key],
                    path.concat([key]), { field: key, completeness: opts.completeness }));
            }
        }
    }

    return errors;
}

function isMissingValue(spec, value) {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string' && value.length === 0) return true;
    if (isPlainObject(value) && spec && spec.minProperties > 0
        && Object.keys(value).length < spec.minProperties) {
        return true;
    }
    return false;
}

/**
 * 校验一个节点（含其下容器）。path 为规范化段数组。
 *
 * @param {object} node
 * @param {object} opts - { kind, typeId, path, completeness }
 * @returns {{ok:boolean, errors:Array}}
 */
function validateValues(node, opts) {
    opts = opts || {};
    var kind = opts.kind;
    var path = Array.isArray(opts.path) ? opts.path.slice() : [];
    var completeness = !!opts.completeness;
    var errors = [];

    if (!node || typeof node !== 'object' || Array.isArray(node)) {
        return {
            ok: false,
            errors: [makeError(path, 'type_mismatch', kind || 'object', typeName(node))],
        };
    }

    var typeId = fieldSpecs.getTypeId(kind, opts.typeId || node);
    var spec = fieldSpecs.getSpec(kind, typeId || node);
    if (kind === 'subsystem' && !spec) {
        return {
            ok: false,
            errors: [makeError(path, 'unknown_type', '已知 subsystem 类型',
                typeId || node.type, '未知的子系统类型')],
        };
    }
    if (!spec) {
        return { ok: true, errors: [] };
    }

    var fields = spec.fields || {};

    // 字段值
    Object.keys(fields).forEach(function (field) {
        var fieldSpec = fields[field];
        var present = Object.prototype.hasOwnProperty.call(node, field);
        if (!present) {
            if (completeness && fieldSpec.required) {
                errors.push(makeError(path.concat([field]), 'missing_required',
                    fieldSpec.type || 'any', undefined,
                    '必填字段缺失'));
            }
            return;
        }
        var value = node[field];
        if (completeness && fieldSpec.required && isMissingValue(fieldSpec, value)) {
            errors.push(makeError(path.concat([field]), 'missing_required',
                fieldSpec.type || 'any', value, '必填字段不能为空'));
        }
        errors = errors.concat(validateValue(fieldSpec, value, path.concat([field]),
            { field: field, completeness: completeness }));
    });

    // 容器递归
    fieldSpecs.getContainers(kind).forEach(function (container) {
        var childKind = fieldSpecs.getContainerChildKind(container);
        var entries = node[container];
        if (!entries || typeof entries !== 'object' || Array.isArray(entries)) return;
        Object.keys(entries).forEach(function (key) {
            var child = entries[key];
            var childErrors = validateValues(child, {
                kind: childKind,
                typeId: childKind === 'subsystem' ? child && child.type : undefined,
                path: path.concat([container, key]),
                completeness: completeness,
            }).errors;
            errors = errors.concat(childErrors);
        });
    });

    return { ok: errors.length === 0, errors: errors };
}

/**
 * 整棵树校验：先 key，再值。
 *
 * @param {object} config
 * @param {object} [opts] - { completeness }
 * @returns {Array} errors
 */
function validateTree(config, opts) {
    opts = opts || {};
    var completeness = opts.completeness !== false;
    var errors = [];

    if (!config || typeof config !== 'object' || Array.isArray(config)) {
        return [makeError([], 'type_mismatch', 'object', typeName(config))];
    }

    var keyResult = keys.validateKeys('config', config, {
        namespace: config.namespace,
        path: [],
    });
    errors = errors.concat(keyResult.errors);

    var parts = config.parts;
    if (parts && typeof parts === 'object' && !Array.isArray(parts)) {
        Object.keys(parts).forEach(function (partId) {
            var partErrors = validateValues(parts[partId], {
                kind: 'part',
                path: ['parts', partId],
                completeness: completeness,
            }).errors;
            errors = errors.concat(partErrors);
        });
    }

    return errors;
}

module.exports = {
    validateValue: validateValue,
    validateValues: validateValues,
    validateTree: validateTree,
    isMissingValue: isMissingValue,
};
