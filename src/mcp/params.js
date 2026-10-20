// 文件: src/mcp/params.js
// 用途: MCP 工具参数形状（docs/12 §6 第 1 层）
// 所属模块: MachineMax Blockbench 插件
//
// zod 实例由 MCP 插件注入（MCP.z），所以这里导出 build(z) 而不是常量。
// MCP 1.10.1 的 registerTool 读取 `parameters`（zod schema），不是 `params`。

'use strict';

function pathSchema(z) {
    return z.union([
        z.array(z.union([z.string(), z.number()])),
        z.string(),
    ]);
}

var MODE = ['create', 'replace', 'rename', 'reject'];
var SMALL_KIND = ['hit_box', 'interact_box', 'connector'];
var MARKER_TYPE = ['sub_part', 'hit_box', 'interact_box', 'connector'];

function build(z) {
    return {
        get_context: z.object({}),

        read_node: z.object({
            path: pathSchema(z),
            as: z.enum(['raw', 'definition']).optional(),
        }),

        validate: z.object({
            only_introduced: z.boolean().optional(),
        }),

        set_node: z.object({
            path: pathSchema(z),
            value: z.any(),
        }),

        remove_node: z.object({
            path: pathSchema(z),
            cascade: z.boolean().optional(),
        }),

        bind_marker: z.object({
            uuid: z.string(),
            type: z.enum(MARKER_TYPE),
            config_ref: z.string().optional(),
        }),

        set_active: z.object({
            part: z.string(),
            variant: z.string().optional(),
        }),

        import_part: z.object({
            part_id: z.string(),
            definition: z.any().optional(),
            mode: z.enum(MODE).optional(),
            old_key: z.string().optional(),
        }),

        import_variant: z.object({
            variant: z.string(),
            definition: z.any(),
            parent_part: z.string().optional(),
            mode: z.enum(MODE).optional(),
            old_key: z.string().optional(),
        }),

        import_sub_part: z.object({
            key: z.string(),
            definition: z.any().optional(),
            parent_variant: z.string().optional(),
            mode: z.enum(MODE).optional(),
            old_key: z.string().optional(),
        }),

        import_subsystem: z.object({
            key: z.string(),
            definition: z.any(),
            parent_sub_part: z.string(),
            mode: z.enum(MODE).optional(),
            old_key: z.string().optional(),
        }),

        add_instance: z.object({
            parent_path: pathSchema(z),
            kind: z.enum(SMALL_KIND),
            key: z.string().optional(),
            definition: z.any().optional(),
        }),
    };
}

module.exports = {
    build: build,
    MODE: MODE,
    SMALL_KIND: SMALL_KIND,
    MARKER_TYPE: MARKER_TYPE,
};
