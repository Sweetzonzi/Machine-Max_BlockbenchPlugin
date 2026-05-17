const { createLogger } = require('../utils/logger.js');
const fileWriter = require('../utils/file_writer.js');
const path = require('path');
const fs = require('fs');

var log = createLogger('GenMaterial');

/**
 * 从内容包 materials/ 目录复制所有材料定义到导出目标目录
 *
 * @param {string} packDir - 内容包根目录
 * @param {string} ns - 包 namespace
 * @param {string} targetDir - 导出目标目录（如 {packRoot}/machine_max/materials）
 * @returns {number} 复制的文件数量
 */
function copyMaterialDefs(packDir, ns, targetDir) {
    var count = 0;
    var srcDir = path.join(packDir, ns, 'materials');
    if (!fs.existsSync(srcDir)) {
        log.warn('copyMaterialDefs: 源目录不存在 ' + srcDir);
        return 0;
    }
    var files = fs.readdirSync(srcDir);
    for (var i = 0; i < files.length; i++) {
        var fileName = files[i];
        if (!fileName.endsWith('.json')) continue;
        var srcFile = path.join(srcDir, fileName);
        try {
            var content = JSON.parse(fs.readFileSync(srcFile, 'utf8'));
            var id = fileName.slice(0, -5);
            var loc = fileWriter.extractResourceLocation(id, ns);
            fileWriter.writeJSONFile(targetDir, loc.path + '.json', content);
            count++;
        } catch (e) {
            log.warn('复制材料文件失败: ' + srcFile, e);
        }
    }
    log.info('copyMaterialDefs: 已复制 ' + count + ' 个材料定义');
    return count;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { copyMaterialDefs };
}
