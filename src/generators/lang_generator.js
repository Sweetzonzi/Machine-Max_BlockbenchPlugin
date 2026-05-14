/**
 * lang/*.json 生成器 — 自动生成本地化条目
 * 为每个零件生成 item.machine_max.{partId} 格式的本地化键
 */

function generateLangEntries(projectConfig, locale) {
    const lang = {};
    const ns = projectConfig.namespace || 'machine_max';
    const parts = projectConfig.parts || {};

    for (const partId of Object.keys(parts)) {
        const key = `item.${ns}.${partId}`;
        const displayName = partId
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
        lang[key] = displayName;
    }

    return lang;
}

function generateAllLangs(projectConfig) {
    const result = {};
    result['zh_cn'] = generateLangEntries(projectConfig, 'zh_cn');
    result['en_us'] = generateLangEntries(projectConfig, 'en_us');

    const ns = projectConfig.namespace || 'machine_max';
    const parts = projectConfig.parts || {};
    for (const partId of Object.keys(parts)) {
        const displayName = partId
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
        result['en_us'][`item.${ns}.${partId}`] = displayName;
    }

    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateLangEntries, generateAllLangs };
}
