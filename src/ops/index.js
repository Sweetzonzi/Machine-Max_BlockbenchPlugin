// 文件: src/ops/index.js
// 用途: 业务操作层统一入口（docs/13 §6.1）
// 所属模块: MachineMax Blockbench 插件
//
// 依赖顺序：core → doc → ops → services → ui/mcp。
// 所有 ops 返回 OpResult，失败不抛异常；撤销边界在各自函数内部。

'use strict';

var part = require('./part.js');
var variant = require('./variant.js');
var subPart = require('./sub_part.js');
var subsystem = require('./subsystem.js');
var element = require('./element.js');
var field = require('./field.js');
var pack = require('./pack.js');
var session = require('./session.js');

module.exports = {
    // part.js
    createPart: part.createPart,
    deletePart: part.deletePart,
    importPart: part.importPart,

    // variant.js
    createVariant: variant.createVariant,
    deleteVariant: variant.deleteVariant,
    importVariant: variant.importVariant,
    setVariantTags: variant.setVariantTags,

    // sub_part.js
    markSubPart: subPart.markSubPart,
    importSubPart: subPart.importSubPart,
    renameSubPart: subPart.renameSubPart,

    // subsystem.js
    createSubsystem: subsystem.createSubsystem,
    deleteSubsystem: subsystem.deleteSubsystem,
    importSubsystem: subsystem.importSubsystem,
    renameSubsystem: subsystem.renameSubsystem,

    // element.js
    markHitBox: element.markHitBox,
    markInteractBox: element.markInteractBox,
    markConnector: element.markConnector,
    renameConnector: element.renameConnector,
    renameInteractBox: element.renameInteractBox,
    clearElementMarker: element.clearElementMarker,
    bindMarker: element.bindMarker,
    removeNode: element.removeNode,
    addInstance: element.addInstance,

    // field.js
    setField: field.setField,

    // pack.js
    setContentPack: pack.setContentPack,
    setContentPackPath: pack.setContentPackPath,
    updatePackMeta: pack.updatePackMeta,
    updateDependencyPaths: pack.updateDependencyPaths,

    // session.js
    setActive: session.setActive,
};
