const { createPackMeta } = require('../core/config.js');
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
 */
function generateMeta(projectConfig) {
    var meta = createPackMeta(projectConfig);

    var parts = projectConfig.parts || {};
    var partIds = Object.keys(parts);

    log.info('generateMeta: 包ID=' + meta.id + ', 零件数=' + partIds.length);
    return meta;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateMeta };
}
