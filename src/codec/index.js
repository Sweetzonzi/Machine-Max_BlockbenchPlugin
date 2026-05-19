/**
 * src/codec/index.js — Codec 模块统一导出入口
 *
 * 本模块提供序列化/反序列化（Codec）体系的统一导出接口。
 * 子模块将在后续 task 中逐步填充。
 *
 * 所属模块: Codec
 */

'use strict';

const { Codec } = require('./Codec.js');

module.exports = {
    Codec,
    // codecs 将在后续 task 中添加
};
