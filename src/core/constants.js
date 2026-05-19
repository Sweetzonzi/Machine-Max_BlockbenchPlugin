// src/core/constants.js
// 应用级常量
'use strict';

/** 当前配置版本号 */
const CONFIG_VERSION = 4;

// ...未来其他常量可追加...

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG_VERSION };
}
