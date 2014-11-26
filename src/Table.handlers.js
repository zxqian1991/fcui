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
    var lib = require('./lib');

    return {
        /**
         * 表格行的mouse-over和mouse-out
         */
        'row-hover': {
            eventType: 'mouseover',
            cssMatch: 'ui-table-row',
            handler: function (e, el) {
                lib.addClasses(el, this.helper.getPartClasses('row-hover'));
            }
        },
        'row-out': {
            eventType: 'mouseout',
            cssMatch: 'ui-table-row',
            handler: function (e, el) {
                lib.removeClasses(el, this.helper.getPartClasses('row-hover'));
            }
        },
        /**
         * 表格尾行的mouse-over和mouse-out
         */
        'foot-row-hover': {
            eventType: 'mouseover',
            cssMatch: 'ui-table-foot-row',
            handler: function (e, el) {
                lib.addClasses(el,
                    this.helper.getPartClasses('foot-row-hover'));
            }
        },
        'foot-row-out': {
            eventType: 'mouseout',
            cssMatch: 'ui-table-foot-row',
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
            cssMatch: 'ui-table-cell',
            handler: function (e, el) {
                lib.addClasses(el, this.helper.getPartClasses('cell-hover'));
            }
        },
        'cell-out': {
            eventType: 'mouseout',
            cssMatch: 'ui-table-cell',
            handler: function (e, el) {
                lib.removeClasses(el, this.helper.getPartClasses('cell-hover'));
            }
        },
        /**
         * 表格尾单元格的mouse-over和mouse-out
         */
        'fcell-hover': {
            eventType: 'mouseover',
            cssMatch: 'ui-table-fcell',
            handler: function (e, el) {
                lib.addClasses(el, this.helper.getPartClasses('fcell-hover'));
            }
        },
        'fcell-out': {
            eventType: 'mouseout',
            cssMatch: 'ui-table-fcell',
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
            cssMatch: 'ui-table-hcell',
            handler: function (e, el) {
                lib.addClasses(el, this.helper.getPartClasses('hcell-hover'));
            }
        },
        'hcell-out': {
            eventType: 'mouseout',
            cssMatch: 'ui-table-hcell',
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
            cssMatch: 'ui-table-hcell-hsort',
            handler: function (e, el) {
                lib.addClasses(el,
                    this.helper.getPartClasses('hcell-hsort-hover'));
            }
        },
        'hsort-out': {
            eventType: 'mouseout',
            cssMatch: 'ui-table-hcell-hsort',
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
            cssMatch: 'ui-table-multi-select',
            handler: function (e, el) {
                var index = +lib.getAttribute(el, 'data-index');
                if (el.checked) {
                    this.selectRow(index);
                }
                else {
                    this.unselectedRow(index);
                }
            }
        },
        'sselect': {
            eventType: 'click',
            cssMatch: 'ui-table-single-select',
            handler: function (e, el) {
                var index = +lib.getAttribute(el, 'data-index');
                this.set('selectedRowIndex', index);
            }
        },
        'allselect': {
            eventType: 'click',
            cssMatch: 'ui-table-select-all',
            handler: function (e, el) {
                this.set('selectedRowIndex',
                    el.checked ? -1 : []);
            }
        },
        'window-resized': {
            eventType: 'resize',
            el: window,
            handler: function () {
            }
        },
        'main-scroll': {
            eventType: 'scroll',
            handler: function () {
            }
        }
    };
});
