/**
 * @file 增强过的符合ES6模式的Promise
 * @author Leo Wang(wangkemiao@baidu.com)
 */

define(function (require) {
    'use strict';

    // 当前直接使用ecomfe/promise库
    var Promise = require('promise');

    // 但是进行一下特性的fix，因为例如cast在Chrome中又没了
    /**
     * 将 value 转化为 标准的 Promise 对象， 当 value 已经为 标准Promise 对象时，直接返回 value，
     * 其他情况等价于 Promise.resolve(object)
     *
     * @static
     * @member Promise
     * @param {*} value
     * @returns {Promise}
     */
    Promise.cast = Promise.cast || function (value) {
        if (value && typeof value === 'object' && value.constructor === this) {
            return value;
        }

        return new Promise(function (resolve) { resolve(value); });
    };

    return Promise;
});