/**
 * ESUI (Enterprise Simple UI library)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 模板相关辅助方法，派生自ESUI 3.1.0-beta.3
 * @see esui/helper/template
 * @author Han Bing Feng (hanbingfeng@baidu.com)
 * @param {Function} require require
 * @return {Object} UI基础库适配层
 */
define(function (require) {
    var u = require('underscore');

    var FILTERS = {
        /**
         * 用作etpl中的filter，返回应配给控件部件的DOM ID。
         * @param  {string} part 控件部件名字
         * @this Control
         * @return {string} 控件部件DOM ID
         */
        'id': function (part) {
            return this.helper.getId(part);
        },
        /**
         * 用作etpl中的filter，返回应配给控件部件的class name。
         * @param  {string} part 控件部件名字
         * @this Control
         * @return {string} 控件部件class name
         */
        'class': function (part) {
            return this.helper.getPartClassName(part);
        },
        /**
         * 用作etpl中的filter，返回应配给控件部件的html标签。
         * @param  {string} part 控件部件名字
         * @param  {string} nodeName 控件部件的HTML标签名字
         * @this Control
         * @return {string} 控件部件HTML片段
         */
        'part': function (part, nodeName) {
            return this.helper.getPartHTML(part, nodeName);
        }
    };

    /**
     * @override Helper
     */
    var helper = {};

    /**
     * 设置模板引擎实例
     *
     * @param {etpl.Engine} engine 模板引擎实例
     */
    helper.setTemplateEngine = function (engine) {
        this.templateEngine = engine;

        if (!engine.esui) {
            this.initializeTemplateEngineExtension();
        }
    };

    /**
     * 初始化模板引擎的扩展，添加对应的过滤器
     *
     * @protected
     */
    helper.initializeTemplateEngineExtension = function () {
        var control = this.control;
        u.each(
            FILTERS,
            function (filter, name) {
                this.addFilter(name, u.bind(filter, control));
            },
            this.templateEngine
        );
    };

    /**
     * 通过模板引擎渲染得到字符串
     *
     * @param {string} target 模板名
     * @param {Object} data 用于模板渲染的数据
     * @return {string}
     */
    helper.renderTemplate = function (target, data) {
        var helper = this;
        data = data || {};

        if (!this.templateEngine) {
            throw new Error('No template engine attached to this control');
        }

        return this.templateEngine.render(target, data);
    };

    return helper;
});
