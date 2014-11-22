/**
 * FCUI (Fengchao UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file FCUI 控件基类，由ESUI 3.1.0-beta.3派生。
 * @author Han Bing Feng (hanbingfeng@baidu.com)
 * @param {Function} require require
 * @return {Control} FCUI 控件基类
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
    var proto = {

    };

    /**
     * 初始化事件handler。读取 this.eventHandlers 的配置，生成一组event
     * handlers。
     *
     * @protected
     */
    proto.initEvents = function () {

    };

    /**
     * 供子类填写的event handlers配置
     * @protected
     * @typedef {Object}
     * @property {string} id event handler的标识
     *
     */

    proto.eventHandlers = {};

    var fControl = eoo.create(eControl, proto);

    return fControl;
});
