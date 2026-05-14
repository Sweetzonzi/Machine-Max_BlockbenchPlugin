/**
 * meta.json 生成器 — 生成内容包元数据文件
 */

function generateMeta(projectConfig) {
    const ns = projectConfig.namespace || 'machine_max';
    const parts = projectConfig.parts || {};
    const partIds = Object.keys(parts);

    const meta = {
        namespace: ns,
        formats: ['machine_max:part'],
    };

    if (partIds.length > 0) {
        meta.parts = partIds;
    }

    return meta;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateMeta };
}
