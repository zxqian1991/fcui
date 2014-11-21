/**
 * FCUI (Fengchao UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file FCUI 控件基类，由ESUI 3.1.0-beta.3派生。
 * @author Han Bing Feng (hanbingfeng@baidu.com)
 */
define(function (require) {
    var eControl = require('esui/Control');
    var eoo = require('eoo');

    /**
     * @class Control
     *
     * Control类。
     *
     * @extends esui/Control
     * @constructor
     */
    var exports = {};

    var fControl = require('eoo').create(eControl, exports);

    return fControl;
});
