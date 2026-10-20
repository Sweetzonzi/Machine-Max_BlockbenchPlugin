// 文件: src/services/safe_part_ids.js
// 用途: 导出管线写盘前的 partId 路径安全断言（docs/13 §4.3 / §11 #20）
// 所属模块: MachineMax Blockbench 插件

'use strict';

var keys = require('../doc/keys.js');
var { createLogger } = require('../utils/logger.js');

var log = createLogger('SafePartIds');

/**
 * 在任何 mkdir / writeFile 之前调用。
 * 有不安全 partId 时抛错，保证不产生半个内容包。
 *
 * @param {Object} config
 * @returns {boolean} true
 */
function assertSafePartIds(config) {
    var bad = Object.keys((config && config.parts) || {}).filter(function (partId) {
        return !keys.isSafePartId(partId);
    });
    if (bad.length > 0) {
        var err = new Error('存在不安全的零件 ID，已阻止导出: ' + bad.join(', '));
        err.code = 'unsafe_part_id';
        err.partIds = bad;
        log.error(err.message);
        throw err;
    }
    return true;
}

module.exports = { assertSafePartIds: assertSafePartIds };
