/**
 * validation_check.js — 接入 Blockbench 原生 ValidatorCheck
 *
 * 与插件自身校验共享同一 collectIssues 实现（单一真源，非共享可变缓存）。
 * run() 现场调用 collectIssues(getConfig()) 并 warn/fail；
 * 暴露 registerValidation() / unregisterValidation() 供 mode.js 接线。
 */
var { createLogger } = require('../utils/logger.js');
var { getConfig } = require('../utils/persistence.js');
var { collectIssues } = require('../services/validate.js');

var log = createLogger('ValidationCheck');

var CHECK_ID = 'mm_validation';
var _checkInstance = null;

/** 获取全局导航单例（由 App.vue.js 挂载时注册） */
function _getNavigator() {
    return (typeof window !== 'undefined' && window.__mmNavigator) || null;
}

/**
 * 将插件 Problem 转换为 Blockbench 原生 { message, buttons }（WarningOrError）
 * buttons 统一提供"定位"按钮，经全局导航单例跳转到对应条目。
 * @param {Object} p - Problem
 * @returns {{message: string, buttons: Array}}
 */
function toWarningOrError(p) {
    var buttons = [{
        name: '定位',
        icon: 'fa-crosshairs',
        click: function () {
            if (typeof Validator !== 'undefined' && Validator.dialog) {
                Validator.dialog.hide();
            }
            var nav = _getNavigator();
            if (nav && typeof nav.selectByIssue === 'function') {
                nav.selectByIssue(p);
            }
        },
    }];
    return { message: p.message, buttons: buttons };
}

/**
 * 注册原生校验 check（幂等，防热重载重复）
 * @returns {ValidatorCheck|null}
 */
function registerValidation() {
    if (typeof ValidatorCheck === 'undefined' || typeof Validator === 'undefined') {
        log.warn('registerValidation: ValidatorCheck/Validator 不可用，跳过');
        return null;
    }

    // 防重复注册：热重载时已有同名 check
    if (Validator.checks && Validator.checks.some(function (c) { return c.id === CHECK_ID; })) {
        log.debug('registerValidation: check "' + CHECK_ID + '" 已注册，跳过');
        return null;
    }

    _checkInstance = new ValidatorCheck(CHECK_ID, {
        update_triggers: ['update_selection', 'save'],
        run: function () {
            var config = getConfig();
            if (!config) {
                this.warnings.empty();
                this.errors.empty();
                return;
            }
            var problems = collectIssues(config);
            var warnings = [];
            var errors = [];
            for (var i = 0; i < problems.length; i++) {
                var p = problems[i];
                if (p.severity === 'error') {
                    errors.push(toWarningOrError(p));
                } else {
                    warnings.push(toWarningOrError(p));
                }
            }
            this.warn.apply(this, warnings);
            this.fail.apply(this, errors);
        },
    });

    log.info('registerValidation: 已注册原生校验 check "' + CHECK_ID + '"');
    return _checkInstance;
}

/** 卸载原生校验 check（onunload 调用） */
function unregisterValidation() {
    if (_checkInstance && typeof _checkInstance.delete === 'function') {
        _checkInstance.delete();
        _checkInstance = null;
        log.info('unregisterValidation: 已卸载 "' + CHECK_ID + '"');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerValidation: registerValidation,
        unregisterValidation: unregisterValidation,
        toWarningOrError: toWarningOrError,
        _getNavigator: _getNavigator,
    };
}
