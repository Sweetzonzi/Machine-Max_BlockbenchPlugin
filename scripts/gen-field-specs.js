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
// 内容真值以 source_sha256 为准。历次溯源：
//   52745d74 — fitting 顶层 `sounds` 块移除，履带命中音改由 material / overwrite.sounds
//              合并后取值（属 fitting 数据模型，不进 field_specs）；三处中英分歧收敛
//              （material_attr.rolling_friction 的无量纲 C_rr 与默认 0.02、view_attr.yaw_limit
//              英文默认 90、wheel_driver 中文侧补 additionalProperties:false）；
//              commander_sight_dual_stb.discovery_inputs 在 c3d61f3a 由 gunner_sight 改为
//              commander_sight，车长镜只由车长座握手可见。
//   8223ead4 — sub_part 新增 collide_in_assembly；连接点 collide_between_parts 移除。
//   8fd4b519 — sub_part.block_collision 扩为 true/false/ground/ground_hard。
//   fa593c2e — sub_part.block_collision 为 true/false/ground：台阶立面的抬升归 climb_assist
//              （ground + climb_assist 承担原 ground_hard 的行为），collision_height 只在
//              ground 下生效；field_specs 的该字段随之为三项，block_collision /
//              climb_assist / collision_height 的 description 一并重写。
//   b69ae014 — fitting 新增 tags（创造页类别/系列）与 link_bones（逐节骨骼名）；hit_box_attr
//              新增 lockable（真值默认 false）；projectile.external 的 thrust 元素新增
//              propellant_mass，mass 的口径写明"不含推进剂"。三处里只有 lockable 是实例
//              可编辑字段，field_specs 因此只多这一项（fitting 与 projectile 都不进 SPECS）。
//   2829863a — 装弹机拆分：regen_loader 退役，改为 regen_ammo_rack（再生弹药架，交付规格
//              belt_definition 取代 projectile_types / belt_label）、ammo_rack（物品弹药架）
//              与 ammo_loader（自动装弹机）；提交边由发射器发起发现，launcher 因此多出
//              ammo_discovery_targets，送弹频道 ammo_inputs 由型号侧的 single_round_loading
//              取代。hit_box.overwrite.sounds 改引用 material_sound_override（多出 fmod.bank）。
//              实例可编辑字段的增删即上面四项；sounds.fmod 只出现在型号静态属性里。
//   81cc0478 — 在 HEAD 基础上带了上游未提交的工作树改动：
//              1) 子系统类型 machine_max:lighting 改名 machine_max:light（schema 文件
//                 lighting_*_attr → light_*_attr，字段仍是 definition / locator）；
//              2) 装填人员握手字段去前缀：launcher / ammo_loader 的
//                 reload_operator_discovery_targets / reload_operator_time_multipliers
//                 改名为 loader_discovery_targets / loader_time_multipliers，
//                 seat 的 reload_operator_discovery_inputs 改名 loader_discovery_inputs；
//              3) seat 新增安装级 interact_inputs（追加的交互输入频道，与型号定义的
//                 interact_inputs 取并集）；4) control_groups 由 4 增至 7（民用/MTLB 控制组），
//                 builtin lang 补入新词条。field_specs 的可编辑字段因此少了 3 个旧名、
//                 多出 3 个新名 + seat.interact_inputs。
//   8e9a5263 — 上游把这几项一并提交，快照自此与 HEAD 逐文件一致（无工作树差异）：
//              1) interact_box.condition 由逻辑枚举（AND/OR/NAND/NOR/XOR/XNOR，默认 NOR）
//                 改成 MoLang 门控表达式（求值 > 0 表示可用，默认 true）——枚举从
//                 field_specs 里消失，该字段不再是 schema ↔ Codec 的约束差异；
//              2) 型号静态属性的 sounds 子块统一去掉 _sounds / _sound 后缀：
//                 ammo_loader / launcher 的 progress_sounds → progress、
//                 human_progress_sounds → human_progress，engine / motor 的
//                 working_sounds → working；launcher 另补 sounds.fire / cease_fire / shell
//                 与 barrel.durability_weight；
//              3) turret_driver 型号补 sounds.turn（OGG 兜底）与 sounds.fmod
//                 （horizontal / vertical 两条轴的持续事件），新增手摇型号
//                 basic_manual_azimuth_driver / basic_manual_elevation_driver；
//              4) fitting 顶层补 fmod（bank + roll / screech 两层履带音），
//                 projectile.sounds 的说明改为"占位、暂无消费方"。
//              field_specs 只认实例可编辑字段，这一批的净变化只有 condition 的枚举消失。
//   e48a275c — 内容包按 builtin → kit → 车包三层拆分后，座位 / 瞄具 / 爆反 / 控制组条目
//              收进 machine_max；快照另带两处上游未提交的工作树改动：
//              1) weapon_controller 新增 camera_discovery_targets（频道 → 目标名，只读
//                 视点发现，与 control_outputs 分开）——这是本轮唯一影响实例可编辑字段
//                 的改动：WeaponControllerCodec 加同名字段、面板多一个信号频道编辑器、
//                 keys.js 的 VALUE_MAPS 把它当频道表校验；
//              2) projectile.sounds 由占位改为 fmod 命中音（bank / hit_armour /
//                 hit_ground），属投射物定义，不进 field_specs。
//              另：builtin lang 补入 100 条子系统与控制组译名，docs/zh_cn/fmod.md 补
//              「弹种命中音运行时接线」一节。
//   4fcd56e6 — 快照追平后的一批上游改动（本轮适配的基线）：
//              1) 新增正式子系统 machine_max:joint_driver（动画关节执行器）：动态属性
//                 definition + connector（指向同子零件的高级连接点），静态属性
//                 rotation_order / axes（X/Y/Z/XR/YR/ZR 各带 max_force、max_speed）/
//                 sounds；上游 JointDriverSubsystemAttr.validate 复用
//                 requireAdvancedConnector，Simple 连接点会让整份零件定义解码失败——
//                 field_specs 因此多出这一整个类型；
//              2) variant 新增 controllers（控制器集，缺省取 model 同名目录），
//                 animations 的语义同步改成「动画集」；
//              3) gearbox 新增 clutch_outputs（离合踏板反馈，频道 → 目标名，默认不发）；
//              4) seat 静态属性 view 新增 third_person_pitch_bias，motorbike_controller
//                 的 control_inputs 默认值补 crew_driver_regular / crew_commander_regular
//                 ——两者都是型号定义侧，不进 field_specs；
//              5) 快照另带两处上游未提交的工作树改动：12 个轮式连接点补 xr 自由滚动轴
//                 （下限高于上限表示绕 X 轴自由滚动）、builtin lang 补入 16 条车轮 /
//                 车门 / 后备箱等交互与子系统译名。连接点与 lang 都不进 field_specs；
//              6) HUD 文档与 documents/ 模板、huds/aui_weapon_live.json 随上游更新，
//                 属随包内容。
const UPSTREAM_REVISION = '4fcd56e6';

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

// 上游 optional 且无默认值的动态字段：语义是「不覆盖型号定义」，Codec 用
// .nullable() 表达三态（null = 省略）。field_specs 必须同步标 nullable，
// 否则 validateValues 会把三态里的 null 判成类型错误（docs/13 §5.2.5）。
// 顶层条目是 kind.field；子系统内部的子块写成 subsystem.<类型 ID>.字段.子字段。
const OPTIONAL_NULLABLE = new Set([
    'subsystem.allow_use_items',
    'subsystem.machine_max:regen_ammo_rack.belt_definition.container_id',
    'subsystem.machine_max:regen_ammo_rack.belt_definition.recharge',
]);

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
    // allOf 的兄弟键（default/description 等）会被 convert 成 {type:'any'}；
    // 不能用它覆盖 $ref 分支已经解析出的具体类型（projected_area 等）。
    if (extra.type === 'any' && base.type && base.type !== 'any') {
        out.type = base.type;
    }
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

    if (OPTIONAL_NULLABLE.has(kind + '.' + field)) spec.nullable = true;

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

/**
 * 把 OPTIONAL_NULLABLE 里的嵌套子块路径标到对应字段规格上。
 * 路径形如 subsystem.<类型>.<字段>.<子字段>…；顶层 kind.field 由 applyFieldMeta 处理。
 */
function applyNestedNullable(typeId, fields) {
    for (const entry of OPTIONAL_NULLABLE) {
        const segs = entry.split('.');
        if (segs.length < 4 || segs[0] !== 'subsystem' || segs[1] !== typeId) continue;
        let spec = { properties: fields };
        let found = true;
        for (const seg of segs.slice(2)) {
            if (!spec || !spec.properties || !spec.properties[seg]) {
                found = false;
                break;
            }
            spec = spec.properties[seg];
        }
        if (found) spec.nullable = true;
    }
}

/**
 * 取 type 的内置枚举。
 * 上游把 type 从顶层 enum 改成 anyOf: [enum 内置类型, pattern 扩展命名空间]，
 * 这里只认带 enum 的那一支；扩展类型没有固定字段清单，不展开。
 */
function builtinTypeEnum(typeSchema) {
    if (!typeSchema) return null;
    if (Array.isArray(typeSchema.enum)) return typeSchema.enum;
    for (const branch of typeSchema.anyOf || []) {
        if (Array.isArray(branch.enum)) return branch.enum;
    }
    return null;
}

/** 从 subsystem_dynamic_attr 的 if/then 与 type 枚举展开全部内置子系统类型 */
function buildSubsystems(store) {
    const dispatchFile = path.join(store.root, 'subsystem', 'subsystem_dynamic_attr.schema.json');
    const dispatch = store.load(dispatchFile);
    const typeEnum = builtinTypeEnum(dispatch.properties && dispatch.properties.type);
    if (!Array.isArray(typeEnum)) throw new Error('subsystem_dynamic_attr 缺少 type 内置类型枚举');

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
        applyNestedNullable(typeId, fields);
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
