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
         * 表格行单选，多选，全选事件
         */
        'mselect': {
            eventType: 'click',
            query: '.ui-table-multi-select',
            handler: function (e, el) {
                var index = +lib.getAttribute(el, 'data-index');
                if (el.checked) {
                    this.selectRow(index);
                    this.fire('rowselected', {rowIndex: index});
                }
                else {
                    this.unselectRow(index);
                    this.fire('rowunselected', {rowIndex: index});
                }
            }
        },
        'sselect': {
            eventType: 'click',
            query: '.ui-table-single-select',
            handler: function (e, el) {
                var index = +lib.getAttribute(el, 'data-index');
                this.set('selectedIndex', index);
                this.fire('rowselected', {rowIndex: index});
            }
        },
        'allselect': {
            eventType: 'click',
            query: '.ui-table-select-all',
            handler: function (e, el) {
                if (el.checked) {
                    this.set('selectedIndex', -1);
                    this.fire('rowallselected');
                } else {
                    this.set('selectedIndex', []);
                    this.fire('rowallunselected');
                }
            }
        },
        /**
         * 表内编辑事件
         */
        'edit': {
            eventType: 'click',
            query: '.ui-table-cell-edit-entry',
            handler: function (e, el) {
                var editType = lib.getAttribute(el, 'data-edit-type');
                editType = editType || 'text';
                var rowIndex = +lib.getAttribute(el, 'data-row');
                var columnIndex = +lib.getAttribute(el, 'data-column');
                this.fire('editstarted', {
                    rowIndex: rowIndex,
                    columnIndex: columnIndex,
                    item: this.datasource[rowIndex],
                    editType: editType
                });
                if (this.editHandlers[editType]) {
                    this.editHandlers[editType].call(
                        this, rowIndex, columnIndex, el
                    );
                }
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
            el: document,
            enable: function () {
                return this.fixHeadAtTop;
            },
            handler: function (e, el) {
                var pageScrollTop = lib.page.getScrollTop();
                var wrapper = this.getCoverTableWrapper();

                if (this.fixTop < pageScrollTop) {
                    if (!this._headFixing) {
                        this._headFixing = true;
                        lib.addClasses(
                            wrapper,
                            this.helper.getStateClasses('cover-table-fixing')
                        );
                        if (this.fixAtDom) {
                            this.fixAtDom.style.position = 'absolute';
                        }
                        wrapper.style.left =
                            lib.getOffset(this.getTable()).left + 'px';
                    }
                    if (this.fixAtDom) {
                        this.fixAtDom.style.top = pageScrollTop + 'px';
                        wrapper.style.top =
                            (pageScrollTop + this.fixHeight) + 'px';
                    }
                    else {
                        wrapper.style.top = pageScrollTop + 'px';
                    }
                }
                else {
                    if (this._headFixing) {
                        this._headFixing = false;
                        lib.removeClasses(
                            wrapper,
                            this.helper.getStateClasses('cover-table-fixing')
                        );
                        if (this.fixAtDom) {
                            this.fixAtDom.style.position = 'inherit';
                        }
                    }
                }
            }
        }
    };
});
