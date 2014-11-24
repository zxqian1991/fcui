/**
 * FCUI (Fengchao UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 表格控件
 * @author Han Bing Feng (hanbingfeng@baidu.com)
 * @param {Function} require require
 * @return {Table} 表格控件类
 */
define(function (require) {
    var u = require('underscore');
    var eoo = require('eoo');
    var etpl = require('etpl');
    var lib = require('./lib');
    var Control = require('./Control');

    var engine = new etpl.Engine();

    var tableTemplate = require('./text!./Table.tpl.html');
    engine.compile(tableTemplate);

    /**
     * @class Table
     *
     * 表格控件。派生自ESUI 3.1.0-beta.3。
     *
     * @extends Control
     */
    var proto = {};

    /**
     * FCUI 表格控件构造函数。
     * @param  {Object} options 构建参数
     * @property {etpl/Engine} options.templateEngine
     *         自定义的ETPL engine。如不提供将使用默认的模板引擎。
     * @constructor
     */
    proto.constructor = function (options) {
        this.$super(arguments);

        this.helper.setTemplateEngine(options.templateEngine || engine);
    };

    /**
     * 默认属性值
     *
     * @type {Object}
     * @protected
     */
    proto.defaultProperties = {
        /**
         * 整个表格的最大高度，px为单位，设置为非0值会设置表格区
         * 的max-height css属性。当表格超高时，会出现竖向滚动条。
         * 控件初始化后，这个值不可以修改。
         * @property {number}
         * @default 0
         */
        tableMaxHeight: 0,
        /**
         * Table主体的z-index
         * @type {Number}
         * @default 0
         */
        zIndex: 0,
        /**
         * 表格外容器的宽度，可以设置为绝对宽度，也可以设置为百分比宽度
         * @type number
         * @default 100%
         */
        width: '100%',
        noDataHtml: '没有数据',
        noFollowHeadCache: false,
        followHead: false,
        sortable: false,
        encode: false,
        columnResizable: false,
        rowWidthOffset: -1,
        select: '',
        selectMode: 'box',
        subrowMutex: 1,
        subEntryOpenTip: '点击展开',
        subEntryCloseTip: '点击收起',
        subEntryWidth: 18,
        breakLine: false,
        hasTip: false,
        hasSubrow: false,
        tipWidth: 18,
        sortWidth: 9,
        fontSize: 13,
        colPadding: 8
    };

    /**
     * 控件类型
     *
     * @type {string}
     */
    proto.type = 'Table';

    /**
     * 获取表格相关ID
     *
     * @private
     * @param {Table} table 表格控件
     * @param {string} name 控件零件名字
     * @return {string} 控件零件的DOM id
     */
    function getId(table, name) {
        return table.helper.getId(name);
    }

    /**
     * 判断值是否为空
     *
     * @private
     * @param {Object} obj 某值
     * @return {bool}
     */
    function hasValue(obj) {
        return !(typeof obj === 'undefined' || obj === null);
    }

    /**
     * 判断值是否为空,包括空字符串
     *
     * @private
     * @param {Object} obj 待检测的字符串
     * @return {bool}
     */
    function isNullOrEmpty(obj) {
        return !hasValue(obj) || !obj.toString().length;
    }

    /**
     * 获取整个表格体
     *
     * @public
     * @return {HTMLElement} 表格元素
     */
    proto.getTable = function () {
        return lib.g(getId(this, 'table'));
    },

    /**
     * 获取Cover用整个表格体
     *
     * @public
     * @return {HTMLElement} 表格元素
     */
    proto.getCoverTable = function () {
        return lib.g(getId(this, 'cover-table'));
    },

    /**
     * 获取列表头容器元素
     *
     * @public
     * @return {HTMLElement} 表头元素
     */
    proto.getHead = function () {
        return lib.g(getId(this, 'thead'));
    },

    /**
     * 获取Cover用列表头容器元素
     *
     * @public
     * @return {HTMLElement} 表头元素
     */
    proto.getCoverHead = function () {
        return lib.g(getId(this, 'cover-thead'));
    },

    /**
     * 获取列表头colgroup元素
     *
     * @public
     * @return {HTMLElement} colgroup元素
     */
    proto.getColGroup = function () {
        return lib.g(getId(this, 'colgroup'));
    },

    /**
     * 获取Cover用列表colgroup元素
     *
     * @public
     * @return {HTMLElement} 表头元素
     */
    proto.getCoverColGroup = function () {
        return lib.g(getId(this, 'cover-colgroup'));
    },


    /**
     * 获取列表体容器素
     *
     * @public
     * @return {HTMLElement} 表格体元素
     */
    proto.getBody = function () {
        return lib.g(getId(this, 'tbody'));
    };

    /**
     * Callback，在Table~field中定义，返回当前单元格应显示的文本内容的HTML。
     * @callback Table~content
     * @this {Table}
     * @param {Object} data 本行要显示的数据
     * @param {number} rowIndex 本行序号，0起始
     * @param {number} columnIndex 本列序号，0起始
     * @return {string} 本行的HTML
     *         默认的getCellHtml实现会将HTML包裹在一个DIV中
     */

    /**
     * Callback，在Table~field中定义，返回当前单元格额外显示的HTML。
     * 默认布局将显示在文本内容的下一行。
     * @callback Table~extraContent
     * @this {Table}
     * @param {Object} data 本行要显示的数据
     * @param {number} rowIndex 本行序号，0起始
     * @param {number} columnIndex 本列序号，0起始
     * @return {string} 本行的HTML
     *         默认的getCellHtml实现会将HTML包裹在一个DIV中
     */

    /**
     * 表示一个表格field的对象。
     * 关于列宽：与ESUI Table相比，这个Table布局实现采用
     * 'table-layout: auto' 。
     * 具体的：
     * 1. 属性width将作为列的建议宽度，即，对于一个声明了width的列，
     * 表格将先满足width指定的宽度，若表格有剩余宽度，将可能会分配
     * 到这一列上。若表格容器宽度不够，将可能从这一列上减去宽度。
     * 2. 属性maxWidth声明列的最大宽度，对于这样的列，首先将会在列上每一个
     * 单元格中包裹一个div以限制表格内容的最大宽度。这个div的默认样式是
     * overflow hidden。可以选择配合ellipse属性隐藏超长的文本。
     * 3. 列不可以显式的设置最小宽度。当表格容器宽度不够时，浏览器自动减小列宽
     * 到内容允许的最小宽度，即，连续的西文字母及数字不折行。中文字及单词会
     * 折行。当空间仍不够时，表格容器出现横向滚动条。
     *
     * @typedef {Object} Table~field
     * @property {Table~content} content
     * @property {Table~content} extraContent
     * @property {boolean} select 是否是一个选择用field
     * @property {number} width
     *           当前field的建议宽度。当table有空余空间时，将会加到这个field
     *           上。当table没有空余空间时，将从这个field上减少宽度直至可能的
     *           最小。
     * @property {number} maxWidth 当前field的最大允许宽度
     *           当maxWidth存在时，width被忽略。
     */

    /**
     * 初始化表格的字段
     *
     * @private
     */
    proto.initFields = function () {
        if (!this.fields) {
            return;
        }

        // 避免刷新时重新注入
        var fields = this.fields;
        var realFields = fields.slice(0);
        var len = realFields.length;

        while (len--) {
            if (!realFields[len]) {
                realFields.splice(len, 1);
            }
        }

        this.realFields = realFields;

        if (!this.select) {
            return;
        }

        var me = this;
        switch (this.select.toLowerCase()) {
            case 'multi':
                realFields.unshift({
                    select: true,
                    maxWidth: 30,
                    title: function (item, index) {
                        return me.helper.renderTemplate('table-select-all', {
                            index: index,
                            disabled: me.disabled ? 'disabled="disabled"' : ''
                        });
                    },
                    content: function (item, index) {
                        return me.helper.renderTemplate('table-select-multi', {
                            index: index,
                            disabled: me.disabled ? 'disabled="disabled"' : ''
                        });
                    }
                });
                break;
            case 'single':
                realFields.unshift({
                    title: '&nbsp;',
                    select: true,
                    maxWidth: 30,
                    content: function (item, index) {
                        return me.helper.renderTemplate('table-select-single', {
                            index: index,
                            disabled: me.disabled ? 'disabled="disabled"' : ''
                        });
                    }
                });
                break;
        }
    };

    /**
     * 同步表格列的宽度到cover table上。
     */
    proto.syncWidth = function () {
        var thead = lib.g(getId(this, 'thead'));
        var thTrs = lib.getChildren(thead);
        var coverThead = lib.g(getId(this, 'cover-thead'));
        var coverThTrs = lib.getChildren(coverThead);
        if (thTrs.length && coverThTrs.length) {
            var ths = lib.getChildren(thTrs[0]);
            var coverThs = lib.getChildren(coverThTrs[0]);
            u.each(ths, function (th, index) {
                var width = lib.getComputedStyle(th, 'width');
                var coverTh = coverThs[index];
                coverTh.style.width = width;
            });
        }
    };

    /**
     * IE9下，用于replace整个colgroup区的regex。
     * @type {RegExp}
     */
    var REGEX_REPLACE_COLGROUP = /(<colgroup.+?>).*?(<\/colgroup>)/;

    /**
     * IE9下，用于replace整个thead区的regex。
     * @type {RegExp}
     */
    var REGEX_REPLACE_THEAD = /(<thead.+?>).*?(<\/thead>)/;

    /**
     * IE9下，用于replace整个tbody区的regex。
     * @type {RegExp}
     */
    var REGEX_REPLACE_TBODY = /(<tbody.+?>).*?(<\/tbody>)/;

    /**
     * IE9下，用于replace整个tfoot区的regex。
     * @type {RegExp}
     */
    // var REGEX_REPLACE_TFOOT = /(<tfoot.+?>).*?(<\/tfoot>)/;

    /**
     * IE9下，设置colgroup html
     * @param {string} html 新的html
     * @param {boolean} isCover true则为cover table设置colgroup
     */
    proto.ieSetColGroup = function (html, isCover) {
        var tableEl = isCover ? this.getCoverTable() : this.getTable();
        tableEl.outerHTML = tableEl.outerHTML.replace(REGEX_REPLACE_COLGROUP,
            '$1' + html + '$2');
    };

    /**
     * IE9下，设置thead html
     * @param {string} html 新的html
     * @param {boolean} isCover true则为cover table设置thead
     */
    proto.ieSetTHead = function (html, isCover) {
        // IE 9 不能set thead innerHTML，换个方法
        // set 整个table区的outerHTML。
        var tableEl = isCover ? this.getCoverTable() : this.getTable();

        tableEl.outerHTML = tableEl.outerHTML.replace(REGEX_REPLACE_THEAD,
                '$1' + html + '$2');
    };

    /**
     * IE9下，设置tbody html
     * @param {string} html 新的html
     */
    proto.ieSetTBody = function (html) {
        var tableEl = this.getTable();
        tableEl.outerHTML = tableEl.outerHTML.replace(REGEX_REPLACE_TBODY,
            '$1' + html + '$2');
    };

    /**
     * IE9下，设置tfoot html
     */
    proto.ieSetTFoot = function () {};

    /**
     * 绘制表格头。
     * @protected
     */
    proto.renderHead = function () {
        if (this.noHead) {
            return;
        }

        var html = this.helper.renderTemplate('table-head', {
            realFields: this.realFields,
            fieldsLength: this.realFields.length
        });

        if (lib.ie && lib.ie <= 9) {
            this.ieSetTHead(html, false);
            if (this.isNeedCoverHead) {
                this.ieSetTHead(html, true);
            }
        }
        else {
            this.getHead().innerHTML = html;
            if (this.isNeedCoverHead) {
                this.getCoverHead().innerHTML = html;
            }
        }
    };

    /**
     * 根据容器宽度和field中的列宽string计算列宽。支持百分比。
     * @param  {string | number} width 列宽值
     * @param  {number} totalWidth 容器列宽
     * @return {number} 列宽值
     */
    function computeColumnWidth(width, totalWidth) {
        if (width.indexOf && width.indexOf('%') > 0) {
            // 是百分比
            var num = parseFloat(width);
            if (!isNaN(num)) {
                return num / 100 * totalWidth;
            }

            return null;
        }
        return width;
    }

    /**
     * 绘制表格colgroup。
     */
    proto.renderColGroup = function () {
        var cols = lib.getChildren(this.getColGroup());
        var fields = this.realFields;
        if (cols.length === fields.length) {
            // cols 够用了，不用重画了
            return;
        }

        var html = this.helper.renderTemplate('table-colgroup', {
            fields: fields,
            fieldsLength: fields.length
        });

        if (lib.ie && lib.ie <= 9) {
            this.ieSetColGroup(html, false);
            if (this.isNeedCoverHead) {
                this.ieSetColGroup(html, true);
            }
        }
        else {
            this.getColGroup().innerHTML = html;
            if (this.isNeedCoverHead) {
                this.getCoverColGroup.innerHTML = html;
            }
        }
    };

    /**
     * 初设表格列宽。
     * 直接将列宽信息写到table-colgroup中。待第一轮render
     * 完成后，还会针对列的最大列宽进行第二轮调整。
     * 此次绘制同时还会第一次设置this.columnsWidth
     */
    proto.setColumnsWidth = function () {
        var columnsWidth = this.columnsWidth = [];
        var totalMaxWidth = 0;
        var maxWidthColumns = this.maxWidthColumns = {};
        var width = this.getWidth();
        u.each(this.realFields, function (field, columnIndex) {
            var w = null;

            if (typeof field.maxWidth !== 'undefined') {
                w = computeColumnWidth(field.maxWidth, width);
                totalMaxWidth += w;
                maxWidthColumns[columnIndex] = w;
            }

            // 如果没有max-width，才考虑width
            if (w == null && typeof field.width !== 'undefined') {
                w = computeColumnWidth(field.width, width);
            }

            // 无论是maxWidth还是width，都当做width style画上去
            columnsWidth.push(w);
        });

        this.totalMaxWidth = totalMaxWidth;

        var cols = lib.getChildren(this.getColGroup());
        u.each(cols, function (col, columnIndex) {
            var w = columnsWidth[columnIndex];
            if (w != null) {
                col.style.width = w + 'px';
            }
        });
    };

    /**
     * 获取表格所在区域宽度
     *
     * @protected
     * @return {number}
     */
    proto.getWidth = function () {
        if (typeof this.width !== 'undefined') {
            if (!this.width.indexOf) {
                // this.width 不是一个string，是一个绝对数
                return this.width;
            }
        }
        var rulerDiv = document.createElement('div');
        this.main.appendChild(rulerDiv);
        var width = rulerDiv.offsetWidth;
        rulerDiv.parentNode.removeChild(rulerDiv);

        return width;
    };

    /**
     * 设置具有最大列宽的列的单元格中的限宽div的宽度。
     */
    proto.setCellMaxWidth = function () {
        if (this.totalMaxWidth > 0) {
            var me = this;
            var tbody = this.getBody();
            var trs = lib.getChildren(tbody);
            // 设置每一行的columnIndex列的max-width
            u.each(trs, function (tr, rowIndex) {
                var tds = lib.getChildren(tr);
                u.each(me.maxWidthColumns, function (maxWidth, columnIndex) {
                    var td = tds[columnIndex];
                    var div = lib.dom.first(td);
                    div.style.maxWidth = maxWidth + 'px';
                });
            });
        }
    };

    /**
     * 调整最大列宽。
     * 当表格有富裕的空间时，加大其余没有声明max-width的列的width，
     * 迫使max-width的列变小到恰好等于max-width
     */
    proto.adjustMaxColumnWidth = function () {
        var containerWidth = this.getWidth();
        var tableWidth = this.getTable().offsetWidth;
        var me = this;
        if (this.totalMaxWidth > 0) {
            if (tableWidth <= containerWidth) {
                var availWidth = containerWidth - this.totalMaxWidth;
                // 要将availWidth分配到没设置maxWidth的列上
                // 先看看其他列都设置了多少的width
                u.each(this.columnsWidth, function (width, index) {
                    if (me.maxWidthColumns[index] == null) {
                        if (width != null) {
                            availWidth -= width;
                        }
                    }
                });
                
                if (availWidth > 0) {
                    // 声明的列宽有剩余，平均分配到除声明了最大列宽的列之外的
                    // 列上
                    var fieldsLength = this.realFields.length;
                    var avgWidth = availWidth /
                        (fieldsLength
                            - Object.keys(this.maxWidthColumns).length);

                    u.each(this.columnsWidth, function (width, index) {
                        if (me.maxWidthColumns[index] == null) {
                            me.columnsWidth[index] == null ?
                                me.columnsWidth[index] = avgWidth
                                : me.columnsWidth[index] += avgWidth;
                        }
                    });
                }
            }
            // else，表格自己的宽度已经超过了容器的宽度，有横滚动条了，
            // 没什么能做的了
        }

        // 设置更新的columnsWidth到colgroup上
        var cols = lib.getChildren(this.getColGroup());
        u.each(cols, function (col, index) {
            if (me.columnsWidth[index] != null) {
                col.style.width = me.columnsWidth[index] + 'px';
            }
        });
    };

    /**
     * 默认的获得一个表头TH元素文本内容的方法。会作为filter从模板中调用。
     * @protected
     * @param {Table~field} field 当前单元格对应的field对象
     * @param {number} index field所对应的列index
     * @return {string} HTML片段
     */
    proto.renderHeadTextContent = function (field, index) {
        var title = field.title;
        var contentHtml;
        // 计算内容html
        if (typeof title === 'function') {
            contentHtml = title.apply(this, arguments);
        }
        else {
            contentHtml = title;
        }
        if (isNullOrEmpty(contentHtml)) {
            contentHtml = '&nbsp;';
        }
        return contentHtml;
    };

    /**
     * 绘制表格体
     * @protected
     */
    proto.renderBody = function () {
        var html = this.helper.renderTemplate('table-body', {
            datasource: this.datasource || [],
            dataLength: this.datasource.length,
            realFields: this.realFields,
            fieldsLength: this.realFields.length
        });

        if (lib.ie && lib.ie <= 9) {
            // IE 9不能set tbody的innerHTML，用outerHTML
            this.ieSetTBody(html);
        }
        else {
            this.getBody().innerHTML = html;
        }

        this.fire('bodyChange');
    };

    /**
     * 默认的获取单元格内文本内容的方法。经由表格模板回调。
     * 调用field.content，获得cell的文字内容。
     * 如果没有field.content，会尝试画出data[content]。
     *
     * @protected
     * @this Table
     * @param {Object} data 当前行的数据
     * @param {Table~field} field 本单元格的field对象
     * @param {number} rowIndex 当前行的序号，0开始
     * @param {number} columnIndex 当前列的序号，0开始
     * @return {string} HTML的string。
     */
    proto.renderCellTextContent = function (
        data, field, rowIndex, columnIndex
    ) {
        // 先生成基本的content
        var content = field.content;
        var contentHtml = 'function' === typeof content
            ? content.call(this, data, rowIndex, columnIndex)
            : (this.encode
                ? lib.encodeHTML(data[content])
                : data[content]
            );
        // content需要有一个默认值
        if (isNullOrEmpty(contentHtml)) {
            contentHtml = '&nbsp;';
        }
        return contentHtml;
    };

    /*
     * 调用field.extraContent，获得额外的内容，显示在
     * div.{-cell-extra}内。如果没有额外的内容，div.{-cell-extra}
     * 不会画出来。
     * @protected
     * @this Table
     * @param {Object} data 当前行的数据
     * @param {Table~field} field 本单元格的field对象
     * @param {number} rowIndex 当前行的序号，0开始
     * @param {number} columnIndex 当前列的序号，0开始
     * @return {string} HTML的string。
     */
    proto.renderCellExtraContent = function (
        data, field, rowIndex, columnIndex
    ) {
        var extraContent = field.extraContent;
        var extraHtml = 'function' === typeof extraContent
            ? extraContent.call(this, data, rowIndex, columnIndex)
            : '';
        // 若没有extra，不生成任何东西
        if (isNullOrEmpty(extraHtml)) {
            return '';
        }

        return this.helper.renderTemplate('table-cell-extra', {
            content: extraHtml
        });
    };

    /**
     * 初始化参数
     *
     * @param {Object} options 构造函数传入的参数
     * @override
     * @protected
     */
    proto.initOptions = function (options) {
        var properties = {};

        u.extend(properties, this.defaultProperties, options);

        this.setProperties(properties);
    };

    /**
     * 初始化DOM结构
     *
     * @override
     * @protected
     */
    proto.initStructure = function() {
        this.$super(arguments);

        var tableHtml = this.helper.renderTemplate('table');

        if (typeof this.width !== 'undefined') {
            if (this.width.indexOf && this.width.indexOf('%') > -1) {
                // 设置了'%'形式的宽度
                this.main.style.width = this.width;
            }
            else {
                this.main.style.width = this.width + 'px';
            }
        }
        else {
            this.main.style.width = '100%';
        }

        this.isNeedCoverHead = false;

        if (this.tableMaxHeight !== 0) {
            this.main.style.maxHeight = this.tableMaxHeight + 'px';
            lib.addClasses(this.main,
                this.helper.getStateClasses('has-max-height'));

            this.isNeedCoverHead = true;
        }

        if (this.isNeedCoverHead) {
            tableHtml += this.helper.renderTemplate('cover-table');
        }

        this.main.innerHTML = tableHtml;

        this.setZIndex();
    };

    /**
     * 设置table主体的z-index。
     * @protected
     */
    proto.setZIndex = function () {
        this.main.style.zIndex = this.zIndex || '';
        if (this.isNeedCoverHead) {
            lib.g(getId(this, 'cover-table')).style.zIndex =
                this.getCoverZIndex;
        }
    };

    /**
     * 取得cover table的z-index。默认为table主z-index加1。
     * @return {number} z-index
     */
    proto.getCoverZIndex = function () {
        return this.zIndex + 1;
    };

    /**
     * 渲染控件
     *
     * @override
     * @fire headchanged
     */
    proto.repaint = function (changes, changesIndex) {
        this.$super(arguments);
         // 初始化控件主元素上的行为
        var defaultProperties = this.defaultProperties;
        var allProperities = {};

        if (!changes) {
            for (var property in defaultProperties) {
                if (defaultProperties.hasOwnProperty(property)) {
                    allProperities[property] = true;
                }
            }
        }
        else {
            // 局部渲染
            for (var i = 0; i < changes.length; i++) {
                var record = changes[i];
                allProperities[record.name] = true;
            }
        }

        var fieldsChanged = false;
        var tHeadChanged = false;
        var tBodyChanged = false;

        // 列的定义发生变化，重算fields
        if (allProperities.fields
            || allProperities.select
            || allProperities.selectMode
            || allProperities.sortable
        ) {
            this.initFields();
            fieldsChanged = true;
        }

        // fields 发生变化，重画colgroup
        if (fieldsChanged) {
            this.renderColGroup();
            this.setColumnsWidth();
        }

        // fields发生变化，或者表头定义发生变化，重画表头
        if (fieldsChanged
            || allProperities.noHead
            || allProperities.order
            || allProperities.orderBy
            || allProperities.selectedIndex
        ) {
            this.renderHead();
            tHeadChanged = true;
        }

        // fields 发生变化，或者表体内容发生变化，重画表体
        if (fieldsChanged
            || allProperities.encode
            || allProperities.noDataHtml
            || allProperities.datasource
            || allProperities.selectedIndex
        ) {
            this.renderBody();
            tBodyChanged = true;
        }

        // fields 发生变化，或者tfoot内容发生变化，重画tfoot
        if (fieldsChanged
            || allProperities.foot
        ) {
            // TODO 处理foot
            tBodyChanged = true;
        }

        // 表格体发生了变化，重调最大列宽
        if (tBodyChanged) {
            this.setCellMaxWidth();
            this.adjustMaxColumnWidth();
        }

        if (tHeadChanged) {
            this.fire('headchanged');
        }
    };

    /**
     * 设置Table的datasource，并强制更新
     *
     * @param {Array} datasource 数据源
     * @public
     */
    proto.setDatasource = function(datasource) {
        this.datasource = datasource;
        this.setSelectedIndex(this, []);
        var record = {name: 'datasource'};
        var record2 = {name: 'selectedIndex'};

        this.repaint([record, record2],
            {
                datasource: record,
                selectedIndex: record2
            }
        );
    };

     /**
     * 获取Table的选中数据项
     *
     * @public
     * @return {Array} 选中的项
     */
    proto.getSelectedItems = function() {
        var selectedIndex = this.selectedIndex;
        var result = [];
        if (selectedIndex) {
            var datasource = this.datasource;
            if (datasource) {
                for (var i = 0; i < selectedIndex.length; i++) {
                    result.push(datasource[selectedIndex[i]]);
                }
            }
        }
        return result;
    };

    /**
     * 判断某行是否选中
     *
     * @private
     * @param {number} index 行号
     * @return {boolean} 行被选中
     */
    proto.isRowSelected = function (index) {
        if (this.selectedIndexMap) {
            return !!this.selectedIndexMap[index];
        }
        return false;
    };

    /**
     * 销毁释放控件
     *
     * @override
     */
    proto.dispose = function () {
        if (this.helper.isInStage('DISPOSED')) {
            return;
        }

        this.helper.beforeDispose();
        this.helper.dispose();
        this.helper.afterDispose();
    };

    var Table = eoo.create(Control, proto);
    require('./main').register(Table);

    return Table;
});
