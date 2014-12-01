/**
 * FCUI (Fengchao UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file
 * @author Han Bing Feng (hanbingfeng@baidu.com)
 * @param {Function} require require
 * @return {Object} main
 */
define(function (require) {
    var u = require('underscore');
    var main = require('esui/main');

    var skin = require('./extension/FcUiSkin');

    main.esuiVersion = main.version;

    /**
     * 绑定全局扩展
     *
     * 通过此方法绑定的扩展，会对所有的控件实例生效
     *
     * 每一次全局扩展生成实例时，均会复制`options`对象，而不会直接使用引用
     *
     * 派生自ESUI 3.1.0-beta.3
     * @param {string} type 扩展类型
     * @param {Object} options 扩展初始化参数
     */
    main.attachExtension = function (type, option) {
        var options;
        if (typeof this.globalExtensionOptions === 'undefined') {
            options = this.globalExtensionOptions = {};
        }
        options[type] = option || {};
    };

    /**
     * 创建全局扩展对象
     * ESUI里的实现有误，修正过来
     *
     * @return {Extension[]}
     */
    main.createGlobalExtensions = function () {
        var options = this.globalExtensionOptions;
        var extensions = [];
        u.each(options, function (option, type) {
            var extension = this.createExtension(type, option);
            extension && extensions.push(extension);
        }, this);

        return extensions;
    };

    main.registerExtension(skin);    

    main.attachExtension('FcUiSkin', {});

    main.version = '0.0.2-alpha.1';

    return main;
});
