/**
 * FCUI (Fengchao UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file DOM 辅助方法
 * @author Han Bing Feng (hanbingfeng@baidu.com)
 * @param {Function} require require
 * @return {Object} DOM辅助方法
 */
define(function (require) {
    var exports = {};

    /**
     * 从el起始，根据query查找元素。返回第一个match的。
     * 这个方法会直接依赖浏览器的querySelector方法。
     * 浏览器支持：IE8，FF3.5，Chrome1
     * @param {HTMLElement} el 查找的根元素
     * @param {string} query 符合CSS 2.1的查询串
     * @return {HTMLElement} 第一个match的元素
     */
    exports.find = function (el, query) {
        return el.querySelector(query);
    };

    /**
     * 从el起始，根据query查找元素。返回所有match的。
     * 这个方法会直接依赖浏览器的querySelectorAll方法。
     * 浏览器支持：IE8，FF3.5，Chrome1
     * @param {HTMLElement} el 查找的根元素
     * @param {string} query 符合CSS 2.1的查询串
     * @return {NodeList} 第一个match的元素
     */
    exports.findAll = function (el, query) {
        return el.querySelectorAll(query);
    };

    /**
     * 判断el是否match给定的query。
     * 这个方法会直接依赖浏览器的*matchSelector方法。
     * 浏览器支持：IE9，FF3.6，IE9
     * @param  {HTMLElement} el 查找的根元素
     * @param {string} query 符合CSS 2.1的查询串
     * @return {boolean} 是否match
     */
    exports.match = function (el, query) {
        var matches = // 兼容各个浏览器。额。。
            // w3c标准
            el.matches
            // Chrome, Opera 15+, Safari
            || el.webkitMatchesSelector
            // Mozilla
            || el.mozMatchesSelector
            // IE9+
            || el.msMatchesSelector
            // Opera
            || el.oMatchesSelector;

        return matches.call(el, query);
    };

    return exports;
});
