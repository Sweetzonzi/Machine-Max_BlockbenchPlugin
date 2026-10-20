#!/usr/bin/env node
/**
 * gen-field-specs.js — 从 vendored builtin schema 生成 src/doc/field_specs.generated.js
 *
 * 用法:
 *   node scripts/gen-field-specs.js             # 生成
 *   node scripts/gen-field-specs.js --check     # 只检查生成物是否过期，退出码 1 表示过期
 *   node scripts/gen-field-specs.js --stdout    # 输出到 stdout，不写文件
 *   node scripts/gen-field-specs.js --source <schemas 目录>
 *
 * 设计约束:
 *   - 只读 vendored 快照，不读兄弟仓库；构建可复现
 *   - 只用 fs/path/crypto，无第三方依赖
 *   - Codec 不参与生成；差异由 schema_codec_allowlist.js 单独登记
 *   - 输出不含时间戳，重复运行逐字节一致
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO_ROOT = path.resolve(__dirname, '..');
const SCHEMA_REL = path.join('src', 'builtin', 'builtin', 'machine_max', 'docs', 'en_us', 'schemas');
const OUTPUT_REL = path.join('src', 'doc', 'field_specs.generated.js');
const DEFAULT_SOURCE = path.join(REPO_ROOT, SCHEMA_REL);
const OUTPUT = path.join(REPO_ROOT, OUTPUT_REL);

// vendored 快照的溯源 commit；同步 schema 时与 docs/13 §3.2 一起更新。
const UPSTREAM_REVISION = 'd8d1df8b';

// 递归 $ref 允许展开的层数；condition 的 and/or/not 是自引用，超过后按 any 处理。
const MAX_REF_DEPTH = 8;

// 容器字段由 doc/address 处理，不生成字段规格。
const CONTAINERS = {
    part: ['variants'],
    variant: ['sub_parts'],
    sub_part: ['hit_boxes', 'interact_boxes', 'connectors', 'subsystems'],
};

// docs/13 §5.2.3：唯一手写的副作用表（8 个字段 / 6 条规则）。
const SIDE_EFFECTS = {
    'sub_part.start_bone': 'migrate_sub_part_marker',
    'interact_box.bone': 'rebind_interact_marker',
    'connector.definition': 'sync_marker_config_ref',
    'connector.locator': 'migrate_connector_marker',
    'hit_box.overwrite': 'ensure_object',
    'connector.overwrite': 'ensure_object',
    'variant.textures': 'ensure_object',
    'subsystem.type': 'rebuild_type_fields',
};

const RESOURCE_FIELDS = new Set([
    'icon', 'model', 'animations', 'definition', 'material', 'control_group_preset',
]);
const SIGNAL_FIELDS = new Set(['power_output', 'power_target']);
const CONNECTOR_FIELDS = new Set(['connector']);
const SUBSYSTEM_FIELDS = new Set(['subsystem']);
const BONE_FIELDS = new Set(['start_bone', 'end_bones', 'bone']);
const LOCATOR_FIELDS = new Set(['mass_center', 'locator', 'dismount_locators']);

function parseArgs(argv) {
    const opts = { check: false, stdout: false, source: DEFAULT_SOURCE };
    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--check') opts.check = true;
        else if (arg === '--stdout') opts.stdout = true;
        else if (arg === '--source') {
            const value = argv[++i];
            if (!value) throw new Error('--source 缺少目录参数');
            opts.source = path.resolve(value);
        } else if (arg === '-h' || arg === '--help') {
            console.log('用法: node scripts/gen-field-specs.js [--check] [--stdout] [--source <schemas 目录>]');
            process.exit(0);
        } else {
            throw new Error('未知参数: ' + arg);
        }
    }
    return opts;
}

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sha256(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

function listJsonFiles(root) {
    const out = [];
    (function walk(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
        for (const entry of entries) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
                out.push(path.relative(root, full).split(path.sep).join('/'));
            }
        }
    })(root);
    return out.sort();
}

class SchemaStore {
    constructor(root) {
        this.root = root;
        this.cache = new Map();
    }

    /** 读取绝对路径对应的 JSON，缓存解析结果 */
    load(file) {
        const abs = path.resolve(file);
        if (!this.cache.has(abs)) {
            if (!fs.existsSync(abs)) throw new Error('schema 文件不存在: ' + abs);
            this.cache.set(abs, readJson(abs));
        }
        return this.cache.get(abs);
    }

    /** 解析相对当前文件的 $ref（含 #/definitions/... 片段） */
    resolve(ref, fromFile) {
        const hashAt = ref.indexOf('#');
        const filePart = hashAt >= 0 ? ref.slice(0, hashAt) : ref;
        const pointer = hashAt >= 0 ? ref.slice(hashAt + 1) : '';
        const abs = filePart ? path.resolve(path.dirname(fromFile), filePart) : path.resolve(fromFile);
        let node = this.load(abs);
        if (pointer) {
            const segments = pointer.split('/').slice(1);
            for (const raw of segments) {
                const key = raw.replace(/~1/g, '/').replace(/~0/g, '~');
                node = node ? node[key] : undefined;
                if (node === undefined) {
                    throw new Error('无法解析 $ref 片段: ' + ref + '（来自 ' + fromFile + '）');
                }
            }
        }
        return { node, file: abs, key: abs + '#' + pointer };
    }
}

/** 数组合并 allOf 的 properties/required；其它键由后者覆盖 */
function mergeAllOf(base, extra) {
    const out = Object.assign({}, base, extra);
    if (base.properties || extra.properties) {
        out.properties = Object.assign({}, base.properties || {}, extra.properties || {});
    }
    return out;
}

/** 把 vector_3d 的 array 表示成 tuple，便于 validateValues 做逐位校验 */
function isVector3d(file) {
    return path.basename(file) === 'vector_3d.schema.json';
}

/**
 * 把 JSON Schema 节点转成 field_specs 规格。
 * ctx: { store, fromFile, depth, stack:Set }
 */
function convert(schema, ctx) {
    if (!schema || typeof schema !== 'object') return { type: 'any' };

    if (schema.$ref) {
        if (ctx.depth >= MAX_REF_DEPTH) return { type: 'any', recursive: true };
        const ref = ctx.store.resolve(schema.$ref, ctx.fromFile);
        if (ctx.stack.has(ref.key)) return { type: 'any', recursive: true };
        const next = {
            store: ctx.store,
            fromFile: ref.file,
            depth: ctx.depth + 1,
            stack: new Set(ctx.stack).add(ref.key),
        };
        const spec = convert(ref.node, next);
        if (isVector3d(ref.file)) {
            return {
                type: 'tuple',
                tuple: [{ type: 'number' }, { type: 'number' }, { type: 'number' }],
                minItems: 3,
                maxItems: 3,
            };
        }
        if (path.basename(ref.file) === 'resource_location.schema.json') {
            spec.references = 'resource';
        }
        return spec;
    }

    if (schema.allOf) {
        let merged = {};
        for (const part of schema.allOf) {
            merged = mergeAllOf(merged, convert(part, {
                ...ctx,
                depth: ctx.depth + 1,
            }));
        }
        const own = convert(Object.assign({}, schema, { allOf: undefined }), {
            ...ctx,
            depth: ctx.depth + 1,
        });
        return mergeAllOf(merged, own);
    }

    if (schema.oneOf) {
        return {
            oneOf: schema.oneOf.map((part) => convert(part, {
                ...ctx,
                depth: ctx.depth + 1,
            })),
        };
    }

    if (schema.const !== undefined) {
        return {
            type: typeof schema.const,
            enum: [schema.const],
        };
    }

    const type = schema.type || (schema.properties || schema.additionalProperties !== undefined ? 'object' : null);
    if (type === 'object') {
        const out = { type: 'object' };
        if (schema.properties) {
            out.properties = {};
            const required = new Set(schema.required || []);
            for (const [field, child] of Object.entries(schema.properties)) {
                if (field === '$schema') continue;
                const spec = convert(child, { ...ctx, depth: ctx.depth + 1 });
                if (required.has(field)) spec.required = true;
                out.properties[field] = spec;
            }
        }
        if (schema.additionalProperties === false) out.additionalProperties = false;
        else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
            out.additionalProperties = convert(schema.additionalProperties, { ...ctx, depth: ctx.depth + 1 });
        }
        if (schema.minProperties !== undefined) out.minProperties = schema.minProperties;
        if (schema.maxProperties !== undefined) out.maxProperties = schema.maxProperties;
        if (!out.properties && out.additionalProperties === undefined) out.additionalProperties = true;
        return out;
    }

    if (type === 'array') {
        const out = { type: 'array' };
        if (schema.items && typeof schema.items === 'object') {
            out.items = convert(schema.items, { ...ctx, depth: ctx.depth + 1 });
        }
        if (schema.minItems !== undefined) out.minItems = schema.minItems;
        if (schema.maxItems !== undefined) out.maxItems = schema.maxItems;
        // 固定三位数字数组按 tuple 表达（projected_area / friction 等）。
        if (out.items && out.items.type === 'number' && out.minItems === 3 && out.maxItems === 3) {
            return {
                type: 'tuple',
                tuple: [{ type: 'number' }, { type: 'number' }, { type: 'number' }],
                minItems: 3,
                maxItems: 3,
            };
        }
        return out;
    }

    if (type === 'string') {
        const out = { type: 'string' };
        if (schema.enum) out.enum = schema.enum.slice();
        return out;
    }

    if (type === 'integer') {
        const out = { type: 'integer', integer: true };
        if (schema.minimum !== undefined) out.minimum = schema.minimum;
        if (schema.maximum !== undefined) out.maximum = schema.maximum;
        return out;
    }

    if (type === 'number') {
        const out = { type: 'number', integer: false };
        if (schema.minimum !== undefined) out.minimum = schema.minimum;
        if (schema.maximum !== undefined) out.maximum = schema.maximum;
        return out;
    }

    if (type === 'boolean') return { type: 'boolean' };

    return { type: 'any' };
}

/** 给字段附加 references / nullable / sideEffect，并处理数组元素引用 */
function applyFieldMeta(kind, field, spec) {
    if (RESOURCE_FIELDS.has(field)) spec.references = 'resource';
    if (SIGNAL_FIELDS.has(field)) spec.references = 'signal';
    if (CONNECTOR_FIELDS.has(field) && kind === 'subsystem') spec.references = 'connector';
    if (SUBSYSTEM_FIELDS.has(field) && kind === 'hit_box') spec.references = 'subsystem';
    if (BONE_FIELDS.has(field)) {
        if (spec.type === 'array' && spec.items) spec.items.references = 'bone';
        else spec.references = 'bone';
    }
    if (LOCATOR_FIELDS.has(field)) {
        if (spec.type === 'array' && spec.items) spec.items.references = 'locator';
        else spec.references = 'locator';
    }

    if (field === 'textures') {
        if (Array.isArray(spec.oneOf)) {
            if (spec.oneOf[0]) spec.oneOf[0].references = 'resource';
            if (spec.oneOf[1] && spec.oneOf[1].additionalProperties) {
                spec.oneOf[1].additionalProperties.references = 'resource';
            }
        }
    }
    if (field === 'signal_targets') {
        if (spec.type === 'object' && spec.additionalProperties) {
            if (spec.additionalProperties.items) spec.additionalProperties.items.references = 'signal';
        }
    }

    const sideEffect = SIDE_EFFECTS[kind + '.' + field];
    if (sideEffect) spec.sideEffect = sideEffect;

    // 上游 optionalFieldOf 无默认值 → Java Optional → null；required 字段禁止 nullable。
    if ((kind === 'hit_box' || kind === 'connector') && field === 'overwrite') {
        if (!spec.required) spec.nullable = true;
    }

    return spec;
}

/** required 里只保留真实字段；容器字段交给 doc/address，不进入字段表 */
function normalizeRequired(required, fields) {
    const out = [];
    for (const field of required) {
        if (!fields[field]) continue;
        out.push(field);
    }
    return out;
}

/** 生成一个 kind 的字段表：{ fields, required } */
function buildKind(store, file, kind) {
    const abs = path.join(store.root, file);
    const schema = store.load(abs);
    const required = new Set(schema.required || []);
    const fields = {};
    for (const [field, child] of Object.entries(schema.properties || {})) {
        if (field === '$schema') continue;
        if ((CONTAINERS[kind] || []).indexOf(field) >= 0) continue;
        const ctx = { store, fromFile: abs, depth: 0, stack: new Set() };
        const spec = convert(child, ctx);
        if (required.has(field)) spec.required = true;
        fields[field] = applyFieldMeta(kind, field, spec);
    }
    const requiredFields = normalizeRequired(Array.from(required), fields);
    for (const field of requiredFields) fields[field].required = true;
    return { fields, required: requiredFields };
}

/** 从 subsystem_dynamic_attr 的 if/then 与 enum 展开 19 种类型 */
function buildSubsystems(store) {
    const dispatchFile = path.join(store.root, 'subsystem', 'subsystem_dynamic_attr.schema.json');
    const dispatch = store.load(dispatchFile);
    const typeEnum = dispatch.properties && dispatch.properties.type && dispatch.properties.type.enum;
    if (!Array.isArray(typeEnum)) throw new Error('subsystem_dynamic_attr 缺少 type enum');

    const byType = {};
    for (const typeId of typeEnum) {
        const branch = (dispatch.allOf || []).find((item) =>
            item.if && item.if.properties && item.if.properties.type &&
            item.if.properties.type.const === typeId);
        let ref = branch && branch.then && branch.then.$ref;
        if (!ref) {
            const short = typeId.split(':').pop();
            ref = 'dynamic/' + short + '_dynamic_attr.schema.json';
        }
        const resolved = store.resolve(ref, dispatchFile);
        const schema = resolved.node;
        const required = new Set(schema.required || []);
        const fields = {};
        for (const [field, child] of Object.entries(schema.properties || {})) {
            if (field === '$schema') continue;
            const ctx = { store, fromFile: resolved.file, depth: 0, stack: new Set() };
            const spec = convert(child, ctx);
            if (required.has(field)) spec.required = true;
            fields[field] = applyFieldMeta('subsystem', field, spec);
        }
        const requiredFields = normalizeRequired(Array.from(required), fields);
        for (const field of requiredFields) fields[field].required = true;
        byType[typeId] = {
            fields,
            required: requiredFields,
            schema: path.relative(store.root, resolved.file).split(path.sep).join('/'),
        };
    }

    const missing = typeEnum.filter((typeId) => !byType[typeId]);
    if (missing.length) throw new Error('以下 subsystem 类型未生成: ' + missing.join(', '));
    return byType;
}

function collectProvenance(store) {
    const files = listJsonFiles(store.root);
    const parts = files.map((rel) => {
        const raw = fs.readFileSync(path.join(store.root, rel.split('/').join(path.sep)), 'utf8');
        return rel + '\0' + sha256(raw.replace(/\r\n/g, '\n'));
    });
    return {
        generator: 'scripts/gen-field-specs.js',
        generator_version: 1,
        source_locale: 'en_us',
        source_root: SCHEMA_REL.split(path.sep).join('/'),
        source_revision: UPSTREAM_REVISION,
        source_files: files.length,
        source_sha256: sha256(parts.join('\n')),
        generated_from: 'machine_max builtin JSON Schema',
    };
}

function buildManifest(source) {
    const store = new SchemaStore(source);
    const specs = {
        part: buildKind(store, path.join('part_definition_schema.json'), 'part'),
        variant: buildKind(store, path.join('part', 'variant_attr.schema.json'), 'variant'),
        sub_part: buildKind(store, path.join('part', 'subpart', 'sub_part_attr.schema.json'), 'sub_part'),
        hit_box: buildKind(store, path.join('part', 'subpart', 'hit_box', 'hit_box_attr.schema.json'), 'hit_box'),
        interact_box: buildKind(store, path.join('part', 'subpart', 'interact_box_attr.schema.json'), 'interact_box'),
        connector: buildKind(store, path.join('part', 'subpart', 'connector', 'connector_attr.schema.json'), 'connector'),
        subsystem: buildSubsystems(store),
    };
    return {
        PROVENANCE: collectProvenance(store),
        SPECS: specs,
        CONTAINERS,
        SIDE_EFFECTS,
    };
}

function render(manifest) {
    const header = [
        "'use strict';",
        '',
        '/**',
        ' * 本文件由 scripts/gen-field-specs.js 自动生成，不要手工编辑。',
        ' * 数据源：' + SCHEMA_REL.split(path.sep).join('/'),
        ' * 上游快照：Machine-Max@' + UPSTREAM_REVISION,
        ' * 重新生成：node scripts/gen-field-specs.js',
        ' * 漂移检查：node scripts/gen-field-specs.js --check',
        ' */',
        '',
    ].join('\n');
    const body = [
        'const PROVENANCE = ' + JSON.stringify(manifest.PROVENANCE, null, 4) + ';',
        '',
        'const SPECS = ' + JSON.stringify(manifest.SPECS, null, 4) + ';',
        '',
        'const CONTAINERS = ' + JSON.stringify(manifest.CONTAINERS, null, 4) + ';',
        '',
        'const SIDE_EFFECTS = ' + JSON.stringify(manifest.SIDE_EFFECTS, null, 4) + ';',
        '',
        'module.exports = { PROVENANCE, SPECS, CONTAINERS, SIDE_EFFECTS };',
        '',
    ].join('\n');
    return header + body;
}

function main() {
    const opts = parseArgs(process.argv);
    if (!fs.existsSync(opts.source)) {
        console.error('schema 目录不存在: ' + opts.source);
        process.exit(2);
    }
    const rendered = render(buildManifest(opts.source));

    if (opts.stdout) {
        process.stdout.write(rendered);
        return;
    }
    if (opts.check) {
        const current = fs.existsSync(OUTPUT)
            ? fs.readFileSync(OUTPUT, 'utf8').replace(/\r\n/g, '\n')
            : '';
        if (current !== rendered) {
            console.error('field_specs.generated.js 已过期，请运行 node scripts/gen-field-specs.js');
            process.exit(1);
        }
        console.log('field_specs.generated.js 与 schema 一致。');
        return;
    }

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, rendered, 'utf8');
    const manifest = buildManifest(opts.source);
    const subsystemCount = Object.keys(manifest.SPECS.subsystem).length;
    console.log('已生成 ' + OUTPUT_REL);
    console.log('schema 文件: ' + manifest.PROVENANCE.source_files +
        ' · subsystem 类型: ' + subsystemCount +
        ' · sha256: ' + manifest.PROVENANCE.source_sha256.slice(0, 12));
}

try {
    if (require.main === module) main();
} catch (error) {
    console.error(error && error.stack ? error.stack : String(error));
    process.exit(2);
}

module.exports = {
    buildManifest,
    render,
    DEFAULT_SOURCE,
    OUTPUT,
    SCHEMA_REL,
    OUTPUT_REL,
    UPSTREAM_REVISION,
};
