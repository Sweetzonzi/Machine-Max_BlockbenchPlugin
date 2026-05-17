/**
 * 共享测试夹具
 *
 * 提供创建测试用配置对象的工厂函数，避免每个测试文件重复样板代码。
 */

/**
 * 创建最小有效的 MM 项目配置（v3）
 */
function createMinimalConfig() {
    return {
        $schema_version: 3,
        namespace: 'test_namespace',
        modelFile: 'test_model.bbmodel',
        parts: {},
        projectiles: {},
        connector_defs: {},
        subsystem_defs: {},
        material_defs: {},
        packMeta: {
            id: 'test_namespace:test_pack',
            version: '1.0',
            name: 'Test Pack',
            author: 'Tester',
            description: 'A test content pack',
            dependencies: [],
            enable_auto_pack: false,
        },
        _uiState: {
            activeMode: 'part',
            activePartId: '',
            activeVariantName: '',
        },
    };
}

/**
 * 创建一个示例零件条目，包含一个默认变体
 */
function createSamplePart() {
    return {
        icon: 'minecraft:iron_ingot',
        vehicle_durability_rate: 0.8,
        vehicle_damage_rate: 1.0,
        vehicle_damage_rate_destroyed: 0.1,
        functional_threshold: 0.3,
        share_durability: true,
        max_stack_size: 1,
        variants: {
            default: {
                model: 'test_model.geo.json',
                textures: 'test_textures.png',
                animations: null,
                tags: [],
                sub_parts: {},
            },
        },
        element_markers: {},
    };
}

/**
 * 创建一个 v1 格式的配置（无 $schema_version），用于迁移测试
 */
function createV1Config() {
    return {
        namespace: 'legacy_namespace',
        modelFile: 'legacy_model.bbmodel',
        parts: {},
        projectiles: {},
        connector_defs: {},
        subsystem_defs: {},
        material_defs: {},
        packMeta: {
            id: 'legacy:pack',
            version: '0.1',
            name: 'Legacy Pack',
            author: 'Legacy Author',
            description: '',
            dependencies: [],
            enable_auto_pack: false,
        },
        _uiState: {
            activeMode: 'part',
            activePartId: '',
            activeVariantName: '',
        },
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createMinimalConfig,
        createSamplePart,
        createV1Config,
    };
}
