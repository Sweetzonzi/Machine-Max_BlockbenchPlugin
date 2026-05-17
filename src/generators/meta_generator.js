const { createLogger } = require('../utils/logger.js');

/** 模块日志 */
var log = createLogger('GenMeta');

/**
 * meta.json 生成器 — 生成 Spark-Core 兼容的内容包元数据文件
 *
 * 格式来源：SparkPackMetaInfo（Spark-Core pack 系统）
 * 字段：id (ResourceLocation), version, name, author, description, dependencies, enable_auto_pack
 *
 * name/author/description 输出为 Minecraft Component 格式（{"text": "..."}）
 *
 * 支持两种输入方式：
 * 1. config.packMeta（旧版，兼容迁移中的配置）
 * 2. config.contentPackPath（新版，从包路径推导）
 *
 * @param {Object} projectConfig - 完整的 MMProjectConfig
 * @returns {Object} SparkPackMetaInfo JSON
 */
function generateMeta(projectConfig) {
    var pm = projectConfig.packMeta || {};
    var packId = pm.id || (Project ? (Project.name || 'content_pack') : 'content_pack');
    // ResourceLocation 不允许大写，namespace 和 path 都转小写
    packId = packId.toLowerCase().replace(/[^a-z0-9_\-.:/]/g, '_');

    var result = {
        id: packId,
        version: pm.version || '1.0',
        name: { text: pm.name || packId.split(':')[1] || packId },
        author: { text: pm.author || 'Anonymous' },
        description: { text: pm.description || '' },
    };

    // 处理依赖列表
    var deps = pm.dependencies || [];
    if (deps.length > 0) {
        result.dependencies = deps.map(function (dep) {
            var depId = dep.id || dep;
            var depType = dep.type || 'hard';
            return { id: depId, type: depType };
        });
    }

    if (typeof pm.enable_auto_pack === 'boolean') {
        result.enable_auto_pack = pm.enable_auto_pack;
    }

    var parts = projectConfig.parts || {};
    var partIds = Object.keys(parts);

    log.info('generateMeta: 包ID=' + result.id + ', 零件数=' + partIds.length);
    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateMeta };
}
