/**
 * FCUI (Fengchao UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 表格的事件处理部分
 * @author Han Bing Feng (hanbingfeng@baidu.com)
 * @param {Function} require require
 * @return {Object} 表格事件处理部分
 */
define(function (require) {
    return {
        'row-hover': {
            eventType: 'mouseover',
            cssMatch: 'ui-table-row',
            handler: function (e, el) {
            }
        },
        'select-changed': {
            eventType: 'click',
            cssMatch: 'ui-table-multi-select',
            handler: function (e, el) {
            }
        },
        'window-resized': {
            eventType: 'resize',
            el: window,
            handler: function () {
                console.log(arguments);
            }
        },
        'main-scroll': {
            eventType: 'scroll',
            handler: function () {
                console.log(arguments);
            }
        }
    };
});
