/**
 * ESUI (Enterprise Simple UI library)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file FCUI 子控件相关辅助方法
 * @author Han Bing Feng (hanbingfeng@baidu.com)
 * @param {Function} require require
 * @return {Object} UI基础库适配层
 */
define(function (require) {
    var u = require('underscore');

    /**
     * @override Helper
     */
    var helper = {};

    /**
     * 批量初始化子控件。并将这一批初始化的子控件作为一个group。
     *
     * @param {string} groupName 组名
     * @param {HTMLElement} wrap 容器DOM元素，默认为主元素
     * @param {Object} options init参数
     * @param {Object} options.properties 属性集合，通过id映射
     */
    helper.initChildrenAsGroup = function (groupName, wrap, options) {
        var previousChildren = this.control.children.slice();
        this.initChildren(wrap, options);
        var currentChildren = this.control.children;
        var groupChildren = u.filter(currentChildren, function (child) {
            // 返回currentChildren集合中，不在previousChildren集合中的控件
            return !u.indexOf(previousChildren, child);
        }, this);

        this.childrenGroup = this.childrenGroup || {};
        this.childrenGroup[groupName] = groupChildren;
    };

    /**
     * 销毁一个group内所有子控件
     * @param {string} groupName 组名
     */
    helper.disposeChildrenInGroup = function (groupName) {
        if (!this.childrenGroup) {
            return;
        }

        var children = this.childrenGroup[groupName];
        if (!children) {
            return;
        }
        
        u.each(
            children,
            function (child) {
                child.dispose();
            }
        );
        this.childrenGroup[groupName] = undefined;

        // 把group里dispose了的子控件扔掉
        this.control.children = u.reject(this.control.children,
            function (child) {
                return child.helper.isInStage('DISPOSED');
            }
        );
        // this.contro.childrenIndex没清，看ESUI源码这个集合里只有当提供了
        // childName时候才会有东西。
    };

    return helper;
});
