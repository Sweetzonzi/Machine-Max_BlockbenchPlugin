// 文件: src/codec/Codec.js
// 用途: Codec 核心组合子库 - 声明式序列化/反序列化框架
// 所属模块: MachineMax Blockbench 插件
//
// 基于 Java RecordCodecBuilder 模式，提供统一的 encode/decode 双向入口。
// 支持 5 种基元类型 + 3 种字段规格 + 5 种组合子。
//
// 设计原则:
//   - encode: 序列化 JS 对象 → JSON 兼容格式（跳过默认值，剥离瞬态字段）
//   - decode: 反序列化 JSON 兼容格式 → 完整 JS 对象（填充默认值，保留未知字段）
//   - 纯 JS 实现，零外部依赖，CommonJS 模块格式
//
// 参考: docs/08-序列化反序列化-Codec体系重构.md

'use strict';

// ==================== 内部辅助函数 ====================

/**
 * 为 codec 对象添加链式方法（field/default/nullable/list/map）
 * 所有 codec（基元或组合）都通过此函数获得统一的链式调用接口
 *
 * @param {object} codec - 基础或组合 codec 对象（已有 encode/decode 方法）
 * @returns {object} 增强后的 codec 对象，含 .field() / .default() / .nullable() / .list() / .map()
 */
function withFieldMethods(codec) {
    codec.field = function () {
        return createFieldDescriptor(codec, { required: true });
    };
    codec.default = function (val) {
        return createFieldDescriptor(codec, { defaultValue: val });
    };
    codec.nullable = function () {
        return createFieldDescriptor(codec, { nullable: true });
    };
    codec.list = function (len) {
        return createListCodec(codec, len);
    };
    codec.map = function (keyC, valC) {
        return createMapCodec(keyC, valC);
    };
    return codec;
}

/**
 * 创建字段描述符（供 record 的 schema 使用）
 *
 * 字段描述符不是 codec — 它只有 encodeField / decodeField 方法，
 * 由 record 的 encode/decode 遍历 schema 时调用。
 *
 * @param {object} codec - 字段对应的基础/组合 codec（含 encode/decode）
 * @param {object} opts - 字段选项
 * @param {boolean} [opts.required] - 必填字段，decode 缺失时报错
 * @param {*} [opts.defaultValue] - 默认值，encode 时相等即跳过，decode 缺失时填充
 * @param {boolean} [opts.nullable] - 可选字段，默认 null，encode 时 null 跳过
 * @returns {object} 字段描述符 { encodeField, decodeField, required?, defaultValue?, nullable? }
 */
function createFieldDescriptor(codec, opts) {
    if (opts.required) {
        return {
            required: true,
            encodeField: function (value) {
                if (value === undefined) {
                    throw new Error('Missing required field');
                }
                return codec.encode(value);
            },
            decodeField: function (value, key, path) {
                if (value === undefined) {
                    throw new Error('Missing required field: ' + path + key);
                }
                return codec.decode(value);
            },
        };
    }
    if (opts.nullable) {
        return {
            nullable: true,
            defaultValue: null,
            encodeField: function (value) {
                if (value === null || value === undefined) return undefined;
                return codec.encode(value);
            },
            decodeField: function (value, key, path) {
                if (value === undefined) return null;
                return codec.decode(value);
            },
        };
    }
    // .default(val) — 可选字段，有显式默认值
    var defaultVal = opts.defaultValue;
    return {
        defaultValue: defaultVal,
        encodeField: function (value) {
            if (value === undefined || value === defaultVal) return undefined;
            return codec.encode(value);
        },
        decodeField: function (value, key, path) {
            if (value === undefined) return defaultVal;
            return codec.decode(value);
        },
    };
}

/**
 * 创建列表 codec（数组）
 *
 * 对数组的每个元素递归执行元素 codec 的 encode/decode。
 * 可选固定长度校验：传入 len 参数时 encode/decode 都验证数组长度。
 *
 * @param {object} itemCodec - 元素 codec
 * @param {number} [len] - 可选的固定长度，传入后 encode/decode 会校验
 * @returns {object} 列表 codec 对象
 */
function createListCodec(itemCodec, len) {
    var codec = {
        type: 'list',
        encode: function (arr) {
            var result, i;
            if (!Array.isArray(arr)) {
                throw new Error('Expected array, got ' + typeof arr);
            }
            if (len !== undefined && arr.length !== len) {
                throw new Error('Expected array of length ' + len + ', got ' + arr.length);
            }
            result = [];
            for (i = 0; i < arr.length; i++) {
                result.push(itemCodec.encode(arr[i]));
            }
            return result;
        },
        decode: function (arr) {
            var result, i;
            if (!Array.isArray(arr)) {
                throw new Error('Expected array, got ' + typeof arr);
            }
            if (len !== undefined && arr.length !== len) {
                throw new Error('Expected array of length ' + len + ', got ' + arr.length);
            }
            result = [];
            for (i = 0; i < arr.length; i++) {
                result.push(itemCodec.decode(arr[i]));
            }
            return result;
        },
    };
    return withFieldMethods(codec);
}

/**
 * 创建映射 codec（对象键值对）
 *
 * 对对象的每个 value 递归执行 value codec 的 encode/decode。
 * encode 时空对象返回 undefined（由父级 record 决定跳过）。
 * decode 时缺失/非对象输入返回空对象 {}。
 *
 * @param {object} keyCodec - 键 codec（通常为 Codec.STRING）
 * @param {object} valCodec - 值 codec
 * @returns {object} 映射 codec 对象
 */
function createMapCodec(keyCodec, valCodec) {
    var codec = {
        type: 'map',
        encode: function (obj) {
            var result, keys, i, k;
            if (obj === null || obj === undefined) return undefined;
            if (typeof obj !== 'object' || Array.isArray(obj)) {
                throw new Error('Expected object for map, got ' + typeof obj);
            }
            result = {};
            keys = Object.keys(obj);
            for (i = 0; i < keys.length; i++) {
                k = keys[i];
                result[keyCodec.encode(k)] = valCodec.encode(obj[k]);
            }
            // 空对象返回 undefined，由父级 record 决定跳过
            if (Object.keys(result).length === 0) return undefined;
            return result;
        },
        decode: function (obj) {
            var result, keys, i, k;
            if (obj === null || obj === undefined) return {};
            if (typeof obj !== 'object' || Array.isArray(obj)) {
                throw new Error('Expected object for map, got ' + typeof obj);
            }
            result = {};
            keys = Object.keys(obj);
            for (i = 0; i < keys.length; i++) {
                k = keys[i];
                result[keyCodec.decode(k)] = valCodec.decode(obj[k]);
            }
            return result;
        },
    };
    return withFieldMethods(codec);
}

// ==================== 基元 Codec 工厂 ====================

/**
 * 创建基元 codec（内部工厂函数）
 *
 * @param {function(*): *} encodeFn - 序列化函数
 * @param {function(*): *} decodeFn - 反序列化函数（含类型检查）
 * @returns {object} 基元 codec 对象
 */
function createPrimitiveCodec(encodeFn, decodeFn) {
    var codec = {
        type: 'primitive',
        encode: encodeFn,
        decode: decodeFn,
    };
    return withFieldMethods(codec);
}

// ==================== 5 种基元类型 ====================

/**
 * @type {object} STRING codec
 * encode: 任意值 → String(v)
 * decode: 必须是 string 类型，否则报错
 */
var STRING = createPrimitiveCodec(
    function (v) { return String(v); },
    function (v) {
        if (typeof v !== 'string') {
            throw new Error('Expected string, got ' + typeof v);
        }
        return v;
    }
);

/**
 * @type {object} INT codec（严格模式）
 * encode: 非整数 → 报错
 * decode: 非整数（包括浮点数如 3.5）→ 报错
 * 不接受四舍五入，严格执行 typeof === 'number' && Number.isInteger(v)
 */
var INT = createPrimitiveCodec(
    function (v) {
        if (typeof v !== 'number' || !Number.isInteger(v)) {
            throw new Error('Expected integer, got ' + v);
        }
        return v;
    },
    function (v) {
        if (typeof v !== 'number' || !Number.isInteger(v)) {
            throw new Error('Expected integer, got ' + v);
        }
        return v;
    }
);

/**
 * @type {object} FLOAT codec
 * encode: 非 number → 报错
 * decode: 非 number → 报错
 */
var FLOAT = createPrimitiveCodec(
    function (v) {
        if (typeof v !== 'number') {
            throw new Error('Expected number, got ' + typeof v);
        }
        return v;
    },
    function (v) {
        if (typeof v !== 'number') {
            throw new Error('Expected number, got ' + typeof v);
        }
        return v;
    }
);

/**
 * @type {object} BOOL codec
 * encode: 非 boolean → 报错
 * decode: 非 boolean → 报错
 */
var BOOL = createPrimitiveCodec(
    function (v) {
        if (typeof v !== 'boolean') {
            throw new Error('Expected boolean, got ' + typeof v);
        }
        return v;
    },
    function (v) {
        if (typeof v !== 'boolean') {
            throw new Error('Expected boolean, got ' + typeof v);
        }
        return v;
    }
);

/**
 * 枚举 codec 工厂函数
 * encode/decode 均校验值是否在允许列表中，不在则报错
 *
 * @param {string[]} values - 允许的枚举值列表
 * @returns {object} 枚举 codec 对象
 */
function ENUM(values) {
    var codec = {
        type: 'enum',
        encode: function (v) {
            if (values.indexOf(v) === -1) {
                throw new Error('Invalid enum value: ' + v);
            }
            return v;
        },
        decode: function (v) {
            if (values.indexOf(v) === -1) {
                throw new Error('Invalid enum value: ' + v);
            }
            return v;
        },
    };
    return withFieldMethods(codec);
}

// ==================== 5 种组合子 ====================

/**
 * 声明式 record codec
 *
 * 对应 Java 的 RecordCodecBuilder。
 * schema 的每个字段是一个字段描述符（由 .field() / .default() / .nullable() 产出）。
 *
 * encode 行为:
 *   1. .field() 必填字段 → 始终输出
 *   2. .default(val) → 当前值 === 默认值时跳过
 *   3. .nullable() → 值为 null 时跳过
 *   4. schema 未定义字段 → 自动剥离（不输出）
 *   5. 空结果对象 {} → 返回 undefined
 *
 * decode 行为:
 *   1. .field() 缺失 → 报错（含字段路径）
 *   2. .default(val) 缺失 → 填充默认值
 *   3. .nullable() 缺失 → 填充 null
 *   4. 未知多余字段 → 宽松模式保留到输出对象
 *
 * @param {object} schema - 字段描述符对象 { fieldName: fieldDescriptor }
 * @returns {object} record codec 对象
 */
function record(schema) {
    var codec = {
        type: 'record',
        encode: function (obj) {
            var result, schemaKeys, i, key, field, val, encoded;
            if (obj === null || obj === undefined) return undefined;
            result = {};
            schemaKeys = Object.keys(schema);
            for (i = 0; i < schemaKeys.length; i++) {
                key = schemaKeys[i];
                field = schema[key];
                val = obj[key];
                // 使用字段描述符的 encodeField（处理默认值跳过/nullable跳过等）
                encoded = field.encodeField ? field.encodeField(val) : val;
                if (encoded !== undefined) {
                    result[key] = encoded;
                }
            }
            // 空结果返回 undefined，由父级决定是否输出
            if (Object.keys(result).length === 0) return undefined;
            return result;
        },
        decode: function (raw, _path) {
            var path, result, schemaKeys, i, key, field, rawKeys, j, rawKey;
            if (raw === null || raw === undefined) return {};
            if (typeof raw !== 'object' || Array.isArray(raw)) {
                throw new Error('Expected object for record, got ' + typeof raw);
            }
            path = _path ? _path + '.' : '';
            result = {};
            schemaKeys = Object.keys(schema);
            // 1. 处理 schema 中定义的字段（填充默认值 / 校验必填）
            for (i = 0; i < schemaKeys.length; i++) {
                key = schemaKeys[i];
                field = schema[key];
                result[key] = field.decodeField ? field.decodeField(raw[key], key, path) : raw[key];
            }
            // 2. 保留未知字段（宽松模式）
            rawKeys = Object.keys(raw);
            for (j = 0; j < rawKeys.length; j++) {
                rawKey = rawKeys[j];
                if (!Object.prototype.hasOwnProperty.call(schema, rawKey)) {
                    result[rawKey] = raw[rawKey];
                }
            }
            return result;
        },
    };
    return withFieldMethods(codec);
}

/**
 * 判别器 codec（dispatch）
 *
 * 对应 Java 的 byNameCodec().dispatch() 模式。
 * 按指定的 discriminator key（如 'type'）路由到不同的子 codec。
 *
 * encode 行为:
 *   1. 读取 discriminator key 值
 *   2. 路由到对应子 codec
 *   3. 从数据中移除 discriminator key 后再委托子 codec encode
 *   4. 输出: { [key]: type, ...子 codec 输出 }
 *
 * decode 行为:
 *   1. 读取 discriminator key 值
 *   2. 路由到对应子 codec
 *   3. 子 codec decode 时 discriminator key 仍在数据中（宽松模式保留）
 *   4. discriminator key 保留在输出对象中
 *   5. 缺失 key → 报错
 *   6. 未知 type 值 → 报错
 *
 * @param {string} key - 判别器字段名（如 'type'）
 * @param {object} codecMap - 类型到子 codec 的映射 { typeValue: codec }
 * @returns {object} dispatch codec 对象
 */
function dispatch(key, codecMap) {
    var codec = {
        type: 'dispatch',
        encode: function (obj) {
            var type, subCodec, rest, objKeys, i, k, encoded, result, encKeys, j;
            type = obj[key];
            if (type === undefined) {
                throw new Error('Missing dispatch key: ' + key);
            }
            subCodec = codecMap[type];
            if (!subCodec) {
                throw new Error('Unknown dispatch type: ' + type);
            }
            // 剥除 discriminator key 后委托子 codec encode
            rest = {};
            objKeys = Object.keys(obj);
            for (i = 0; i < objKeys.length; i++) {
                k = objKeys[i];
                if (k !== key) {
                    rest[k] = obj[k];
                }
            }
            encoded = subCodec.encode(rest);
            // 合并: discriminator key 在前，子 codec 输出在后
            result = {};
            result[key] = type;
            if (encoded && typeof encoded === 'object' && !Array.isArray(encoded)) {
                encKeys = Object.keys(encoded);
                for (j = 0; j < encKeys.length; j++) {
                    result[encKeys[j]] = encoded[encKeys[j]];
                }
            }
            return result;
        },
        decode: function (raw) {
            if (raw === null || raw === undefined || typeof raw !== 'object') {
                throw new Error('Expected object for dispatch, got ' + typeof raw);
            }
            var type = raw[key];
            if (type === undefined) {
                throw new Error('Missing dispatch key: ' + key);
            }
            var subCodec = codecMap[type];
            if (!subCodec) {
                throw new Error('Unknown dispatch type: ' + type);
            }
            // 子 codec decode 时 discriminator key 仍在数据中（宽松模式保留）
            var decoded = subCodec.decode(raw);
            return decoded;
        },
    };
    return withFieldMethods(codec);
}

/**
 * 二选一 codec（either）
 *
 * 对应 Java 的 Codec.either(A, B).xmap(...) 模式。
 * 支持单对象简写 vs map 展开的双向转换。
 *
 * 用于单变体/单零件场景:
 *   - 单个时: { model: '...', ... }        (简写)
 *   - 多个时: { 'variant1': { model: '...' }, ... }  (完整 map)
 *
 * encode 行为:
 *   1. 检测是否只有一个 key 且 key === 'default'（简写条件）
 *   2. 如果是简写 → singleCodec encode（输出单个对象）
 *   3. 否则 → mapCodec encode（输出完整 map）
 *
 * decode 行为:
 *   1. 检测输入是单个对象还是 map
 *   2. 单个对象（有字段名样式的 key）→ 包装为 { default: singleCodec.decode(obj) }
 *   3. map（key 为 ID 格式）→ mapCodec.decode(raw)
 *
 * @param {object} singleCodec - 单个对象 codec（简写形式）
 * @param {object} mapCodec - map codec（完整形式）
 * @returns {object} either codec 对象
 */
function either(singleCodec, mapCodec) {
    var WRAP_KEY = 'default';

    /**
     * 检测对象是否为单个实体（非 map 结构）
     * 判断依据：如果存在以字母/下划线开头且不以数字开头的 key，视为对象字段
     * 而非 map ID key（如 'sub_part.machine_max.main' 含 '.'）
     *
     * @param {object} obj - 待检测对象
     * @returns {boolean} true 表示是单个实体对象
     */
    function looksLikeSingleEntity(obj) {
        var keys, i, k;
        keys = Object.keys(obj);
        if (keys.length === 0) return false;
        for (i = 0; i < keys.length; i++) {
            k = keys[i];
            if (/^[a-z_]/.test(k) && !/^\d/.test(k)) {
                return true;
            }
        }
        return false;
    }

    var codec = {
        type: 'either',
        encode: function (obj) {
            if (obj === null || obj === undefined) return undefined;
            var keys = Object.keys(obj);
            // 只有一个 default key → 简写，unwrap 输出单个对象
            if (keys.length === 1 && keys[0] === WRAP_KEY) {
                return singleCodec.encode(obj[WRAP_KEY]);
            }
            // 否则使用完整 map 格式
            return mapCodec.encode(obj);
        },
        decode: function (raw) {
            var wrapped;
            if (raw === null || raw === undefined) return {};
            if (typeof raw !== 'object' || Array.isArray(raw)) {
                throw new Error('Expected object for either, got ' + typeof raw);
            }
            // 检测是单个实体对象还是 map
            if (looksLikeSingleEntity(raw)) {
                // 单个对象 → 包装为 { default: decodedObj }
                wrapped = {};
                wrapped[WRAP_KEY] = singleCodec.decode(raw);
                return wrapped;
            }
            // map → 保持原样 decode
            return mapCodec.decode(raw);
        },
    };
    return withFieldMethods(codec);
}

// ==================== 导出 ====================

var Codec = {
    STRING: STRING,
    INT: INT,
    FLOAT: FLOAT,
    BOOL: BOOL,
    ENUM: ENUM,
    record: record,
    either: either,
    dispatch: dispatch,
    map: createMapCodec,
};

module.exports = { Codec: Codec };
