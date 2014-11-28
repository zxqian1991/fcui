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
    var Event = require('mini-event');

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
    };

    /**
     * 代理一个child的所有事件
     * @param {Control|string} child child control本身，或者childName
     */
    helper.delegateEventsFromChild = function (child) {
        if (typeof child === 'string') {
            child = this.control.getChild(child);
        }
        child.on('*', function (e) {
            var event = Event.fromEvent(
                e,
                {preserveData: true, syncState: true}
            );
            // 增加标记是子Action过来的
            event.triggerSource = 'child';
            this.control.fire(event);
        }, this);
    };

    return helper;
});
