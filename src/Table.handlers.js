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
    var u = require('underscore');
    var lib = require('./lib');

    return {
        /**
         * 表格行的mouse-over和mouse-out
         */
        'row-hover': {
            eventType: 'mouseover',
            query: '.ui-table-row',
            handler: function (e, el) {
                lib.addClasses(el, this.helper.getPartClasses('row-hover'));
            }
        },
        'row-out': {
            eventType: 'mouseout',
            query: '.ui-table-row',
            handler: function (e, el) {
                lib.removeClasses(el, this.helper.getPartClasses('row-hover'));
            }
        },
        /**
         * 表格尾行的mouse-over和mouse-out
         */
        'foot-row-hover': {
            eventType: 'mouseover',
            query: '.ui-table-foot-row',
            handler: function (e, el) {
                lib.addClasses(el,
                    this.helper.getPartClasses('foot-row-hover'));
            }
        },
        'foot-row-out': {
            eventType: 'mouseout',
            query: '.ui-table-foot-row',
            handler: function (e, el) {
                lib.removeClasses(el,
                    this.helper.getPartClasses('foot-row-hover'));
            }
        },
        /**
         * 表格体单元格的mouse-over和mouse-out
         */
        'cell-hover': {
            eventType: 'mouseover',
            query: '.ui-table-cell',
            handler: function (e, el) {
                lib.addClasses(el, this.helper.getPartClasses('cell-hover'));
            }
        },
        'cell-out': {
            eventType: 'mouseout',
            query: '.ui-table-cell',
            handler: function (e, el) {
                lib.removeClasses(el, this.helper.getPartClasses('cell-hover'));
            }
        },
        /**
         * 表格尾单元格的mouse-over和mouse-out
         */
        'fcell-hover': {
            eventType: 'mouseover',
            query: '.ui-table-fcell',
            handler: function (e, el) {
                lib.addClasses(el, this.helper.getPartClasses('fcell-hover'));
            }
        },
        'fcell-out': {
            eventType: 'mouseout',
            query: '.ui-table-fcell',
            handler: function (e, el) {
                lib.removeClasses(el,
                    this.helper.getPartClasses('fcell-hover'));
            }
        },
        /**
         * 表头单元格的mouse-over和mouse-out
         */
        'hcell-hover': {
            eventType: 'mouseover',
            query: '.ui-table-hcell',
            handler: function (e, el) {
                lib.addClasses(el, this.helper.getPartClasses('hcell-hover'));
            }
        },
        'hcell-out': {
            eventType: 'mouseout',
            query: '.ui-table-hcell',
            handler: function (e, el) {
                lib.removeClasses(el,
                    this.helper.getPartClasses('hcell-hover'));
            }
        },
        /**
         * 表头排序图标的mouse-over和mouse-out
         */
        'hsort-hover': {
            eventType: 'mouseover',
            query: '.ui-table-hcell-hsort',
            handler: function (e, el) {
                lib.addClasses(el,
                    this.helper.getPartClasses('hcell-hsort-hover'));
            }
        },
        'hsort-out': {
            eventType: 'mouseout',
            query: '.ui-table-hcell-hsort',
            handler: function (e, el) {
                lib.removeClasses(el,
                    this.helper.getPartClasses('hcell-hsort-hover'));
            }
        },
        /**
         * 表格行单选，多选，全选事件
         */
        'mselect': {
            eventType: 'click',
            query: '.ui-table-multi-select',
            handler: function (e, el) {
                var index = +lib.getAttribute(el, 'data-index');
                if (el.checked) {
                    this.selectRow(index);
                }
                else {
                    this.unselectRow(index);
                }
            }
        },
        'sselect': {
            eventType: 'click',
            query: '.ui-table-single-select',
            handler: function (e, el) {
                var index = +lib.getAttribute(el, 'data-index');
                this.set('selectedRowIndex', index);
            }
        },
        'allselect': {
            eventType: 'click',
            query: '.ui-table-select-all',
            handler: function (e, el) {
                this.set('selectedRowIndex',
                    el.checked ? -1 : []);
            }
        },
        /**
         * 改变大小的事件
         */
        'window-resized': {
            eventType: 'resize',
            el: window,
            enable: function () {
                return false;
            },
            handler: function () {
            }
        },
        /**
         * 锁表头的事件：在window上锁定表头和在表格wrapper内锁定表头
         */
        'main-scroll': {
            eventType: 'scroll',
            enable: function () {
                return this.tableMaxHeight > 0;
            },
            handler: function (e, el) {
                var scrollTop = el.scrollTop;
                var cover = this.getCoverTable();
                cover.style.top = scrollTop + 'px';
            }
        },
        'window-scroll': {
            eventType: 'scroll',
            el: window,
            enable: function () {
                return this.tableMaxHeight > 0;
            },
            handler: function () {
            }
        }
    };
});
