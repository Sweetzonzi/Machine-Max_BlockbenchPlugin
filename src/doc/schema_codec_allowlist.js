// 文件: src/doc/schema_codec_allowlist.js
// 用途: schema ↔ Codec 差异的显式登记（docs/13 §5.2.2）
// 所属模块: MachineMax Blockbench 插件
//
// 五段分开：类型缺口 / 字段缺口 / 多余字段 / 约束差异 / 解码宽容。
// 测试会校验每条引用的字段真实存在，过期条目失败。
//
// P1 仅登记真实缺口；D12（P2）补齐后必须删除 missing_fields，D13 补齐后
// 删除 missing_types，D18（P2）删除 WIP 类型后删除 extra_types。

'use strict';

module.exports = {
    // 1) 类型集合缺口：Codec 缺、schema 有
    missing_types: [
        { type: 'machine_max:track_controller', owner: 'D13' },
        { type: 'machine_max:track_drive', owner: 'D13' },
    ],

    // 2) 类型集合多余：Codec 有、schema 没有（D18 删除 5 个 WIP 类型）
    extra_types: [
        { type: 'machine_max:battery', owner: 'D18' },
        { type: 'machine_max:signal_convert', owner: 'D18' },
        { type: 'machine_max:joint', owner: 'D18' },
        { type: 'machine_max:javascript', owner: 'D18' },
        { type: 'machine_max:ammo_loader', owner: 'D18' },
    ],

    // 3) 字段集合缺口：Codec 缺字段（D12 修完后都应为空）
    //    D12 已补 hit_box.module、launcher.fire_animation、regen_loader.belt_label
    //    与 weapon_controller 的 3 个 HUD layout 字段；字段集合差异应为 0。
    missing_fields: [],

    // 4) 字段集合多余：Codec 有、schema 没有的运行时字段（容器除外）
    extra_fields: [],

    // 5) 同一字段的约束差异：字段存在，但类型/required/enum/结构不同
    constraint_diffs: [
        { kind: 'hit_box', field: 'type', schema: 'enum', codec: 'string', enforcedBy: 'field_specs.enum' },
        { kind: 'hit_box', field: 'id', schema: "default('')", codec: 'field()', enforcedBy: 'D12' },
        { kind: 'hit_box', field: 'overwrite', schema: 'object(physics/armor/sounds)', codec: 'any.nullable', enforcedBy: 'field_specs.object' },
        { kind: 'connector', field: 'overwrite', schema: 'object(12)', codec: 'any.nullable', enforcedBy: 'field_specs.object' },
        { kind: 'interact_box', field: 'condition', schema: 'enum', codec: 'string', enforcedBy: 'field_specs.enum' },
        { kind: 'interact_box', field: 'signal_targets', schema: 'required', codec: 'default({}) + emitEmpty', enforcedBy: 'codec.emitEmpty' },
        { kind: 'connector', field: 'definition', schema: 'required', codec: "default('')", enforcedBy: 'collectIssues' },
        { kind: 'sub_part', field: 'hit_boxes', schema: 'required+minProperties', codec: 'map', enforcedBy: 'collectIssues' },
        { kind: 'sub_part', field: 'hydrodynamics', schema: 'default {""}', codec: 'default {}', enforcedBy: 'decode_tolerance' },
        { kind: 'subsystem', field: 'projectile_types', types: ['machine_max:regen_loader'], schema: 'required+minProperties', codec: 'default({}) + emitEmpty', enforcedBy: 'codec.emitEmpty+minProperties' },
    ],

    // 6) decode 比 schema 宽松、但 encode 不会产出非法 JSON 的字段
    decode_tolerance: [
        { kind: 'interact_box', field: 'signal_targets', why: 'missing → {}，encode 始终输出' },
        { kind: 'sub_part', field: 'hydrodynamics', why: 'missing → {}，导出省略等价默认值' },
    ],

    // 7) 全局例外：schema 的 additionalProperties:false 不由 Codec 执行
    unknown_fields: 'preserve',
};
