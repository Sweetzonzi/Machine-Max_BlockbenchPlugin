const { createLogger } = require('../utils/logger.js');
const fileWriter = require('../utils/file_writer.js');
const { getTypeSpecificFields } = require('../core/subsystem_types.js');
const path = require('path');
const fs = require('fs');

var log = createLogger('GenSubsystem');

/**
 * 从内容包 subsystems/ 目录复制所有子系统定义到导出目标目录
 *
 * 支持扁平存储和按模型分组存储两种模式。
 *
 * @param {string} packDir - 内容包根目录
 * @param {string} ns - 包 namespace
 * @param {string} targetDir - 导出目标目录（如 {packRoot}/machine_max/subsystems）
 * @param {boolean} flat - 是否扁平化导出
 * @returns {number} 复制的文件数量
 */
function copySubsystemDefs(packDir, ns, targetDir, flat) {
    var count = 0;
    var srcDir = path.join(packDir, ns, 'subsystems');
    if (!fs.existsSync(srcDir)) {
        log.warn('copySubsystemDefs: 源目录不存在 ' + srcDir);
        return 0;
    }
    var files = fs.readdirSync(srcDir);

    function resolveTarget(baseDir, id, isFlat) {
        if (isFlat) return baseDir;
        var seg = id.split('_')[0];
        return (seg && seg.length > 0) ? path.join(baseDir, seg) : baseDir;
    }

    for (var i = 0; i < files.length; i++) {
        var fileName = files[i];
        if (!fileName.endsWith('.json')) continue;
        var srcFile = path.join(srcDir, fileName);
        try {
            var raw = fs.readFileSync(srcFile, 'utf8');
            var content = JSON.parse(fileWriter.stripJsonComments(raw));
            var id = fileName.slice(0, -5);
            var loc = fileWriter.extractResourceLocation(id, ns);
            var tDir = resolveTarget(targetDir, loc.path, flat);
            fileWriter.writeJSONFile(tDir, loc.path + '.json', content);
            count++;
        } catch (e) {
            log.warn('复制子系统文件失败: ' + srcFile, e);
        }
    }
    log.info('copySubsystemDefs: 已复制 ' + count + ' 个子系统定义');
    return count;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { copySubsystemDefs, getTypeSpecificFields };
}
