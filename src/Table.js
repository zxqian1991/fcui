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

    var tableTemplate = require('./Table.tpl');
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
     * 表格总的template
     * @type {String}
     */
    proto.tableTemplate =
            '<table id="${tId}" class="${tableClassName}">'
        +       '<thead id="${thId}" class="${thClassName}"></thead>'
        +       '<tbody id="${tbId}" class="${tbClassName}"></tbody>'
        +       '<tfoot id="${tfId}" class="${tfClassName}"></tfoot>'
        +   '</table>';

    /**
     * 表头吸顶等情况下，用来覆盖的表头。
     * @type {string}
     */
    proto.coverTableTemplate =
            '<table id=${tId} class="${tableClassName}">'
        +       '<colgroup id="${cgId}" class="${cgClassName}"></colgroup>'
        +       '<thead id="${thId}" class="${thClassName}"></thead>'
        +   '</table>';

    /**
     * 表头TH的tempate
     * @type {string}
     */
    proto.thTemplate = '<th class="${className}">${content}</th>';

    /**
     * 表头TH内容的template
     * @type {string}
     */
    proto.thContentTemplate =
        '<div class="${className}">${text}</div>${extra}';

    /**
     * 表头TH额外内容的HTML。
     * @type {string}
     */
    proto.thExtraTemplate = '<div class="${className}">${sort}${tip}</div>';

    /**
     * 表格体一行的HTML。
     * @type {string}
     */
    proto.rowHtmlTemplate = '<tr class="${className}">${cellsHtml}</tr>';

    /**
     * 表格体一个单元格的HTML。
     * @type {string}
     */
    proto.cellHtmlTemplate = '<td class="${className}">${content}</td>';

    /**
     * 表格体单元格基本内容的HTML。
     * @type {String}
     */
    proto.cellContentTemplate =
        '<div class="${className}">${text}</div>${extra}';

    /**
     * 单元格额外内容的HTML。
     * @type {string}
     */
    proto.cellExtraTemplate = '<div class="${className}">${content}</div>';

    /**
     * 表格无数据时候的HTML。
     * @type {String}
     */
    proto.noDataTemplate = '<div class="${className}">${html}</div>';

    /**
     * 多选框模版
     *
     * @type {string}
     */
    proto.multiSelectTemplate =
        '<input '
        + 'type="checkbox" '
        + 'id="${id}" '
        + 'class="${className}" '
        + 'data-index="${index}" '
        + '${disabled} ${checked} />';

    /**
     * 多选框全选模版
     *
     * @private
     */
    proto.multiSelectAllTemplate =
        '<input '
        +  'type="checkbox" '
        +  'id="${id}" '
        +  'class="${className}" '
        +  'data-index="${index}" '
        +  '${disabled}/>';

    /**
     * 单选框模版
     *
     * @private
     */
    proto.singleSelectTemplate =
        '<input '
        +  'type="radio" '
        +  'id="${id}" '
        +  'name="${name}" '
        +  'class="${className}" '
        +  'data-index="${index}" '
        +  '${disabled} '
        +  '${checked} />';

    /**
     * 表示一个表格field的对象。由this.initFields方法生成
     * @typedef {Object} FcTable~field
     * @property {FcTable~content} content
     * @property {FcTable~content} extraContent
     */

     /**
     * Callback，取得会标记在表头TH元素上的classes。
     * @callback FcTable~getHeadCellClasses
     * @this {FcTable}
     * @param {number} index 当前行的序号，0开始
     * @return {Array<string>} class名字的Array
     */

    /**
     * Callback，取得表头TH元素的内容。
     * @callback FcTable~getHeadCellContent
     * @this {FcTable}
     * @param {number} index 当前行的序号，0开始
     * @return {Array<string>} HTML片段的Array
     *         HTML片段会拼接在一起并在前后加上TH标记。
     */

    /**
     * Callback，取得会标记在本行TR元素上的class。
     * @callback FcTable~getRowClasses
     * @this {FcTable}
     * @param {Object} data 当前行的数据
     * @param {number} index 当前行的序号，0开始
     * @return {Array<string>} class名字的Array
     */

    /**
     * Callback，取得会标记在本行TR元素上的attributes。暂时没有用。
     * @callback FcTable~getRowAttributes
     * @param {Object} data 当前行的数据
     * @param {number} index 当前行的序号，0开始
     * @return {Object}
     *         attributes的Object，以attribute名字为key，值为value。
     */

    /**
     * Callback，取得本行的HTML。
     * @callback FcTable~getRowInnerHtml
     * @this {FcTable}
     * @param {Object} data 当前行的数据
     * @param {number} index 当前行的序号，0开始
     * @return {Array<string>} HTML片段的Array
     *         HTML片段会拼接在一起并在前后加上TR标记。
     */

    /**
     * Callback，在FcTable~field中定义，返回当前单元格应显示的HTML。
     * @callback FcTable~content
     * @this {FcTable}
     * @param {Object} data 本行要显示的数据
     * @param {number} rowIndex 本行序号，0起始
     * @param {number} columnIndex 本列序号，0起始
     * @return {string} 本行的HTML
     *         默认的getCellHtml实现会将HTML包裹在一个DIV中
     */

    /**
     * Callback，取得会标记在本单元格元素上的class。
     * @callback FcTable~getCellClasses
     * @this {FcTable}
     * @param {Object} data 当前行的数据
     * @param {number} rowIndex 当前行的序号，0开始
     * @param {number} columnIndex 当前列的序号，0开始
     * @param {number} fieldsLength 总列数
     * @param {FcTable~field} field 当前列的field对象
     * @return {Array<string>} class名字的Array
     */

    /**
     * Callback，取得本单元格的HTML。
     * @callback FcTable~getCellHtml
     * @this {FcTable}
     * @param {Object} data 当前行的数据
     * @param {number} rowIndex 当前行的序号，0开始
     * @param {number} columnIndex 当前列的序号，0开始
     * @param {FcTable~field} 本单元格的field对象
     * @return {string} HTML的string。不能包含最外围的TD标签。
     */

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
     * 获取表格相关ClassName
     *
     * @private
     * @param {Table} table 表格控件类
     * @param {string} name 控件零件名字
     * @return {string} 控件零件的class
     */
    function getClass(table, name) {
        return table.helper.getPartClasses(name).join(' ');
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
     * 获取列表头容器元素
     *
     * @public
     * @return {HTMLElement} 表头元素
     */
    proto.getHead = function () {
        return lib.g(getId(this, 'thead'));
    },

    /**
     * 获取列表头容器元素
     *
     * @public
     * @return {HTMLElement} 表头元素
     */
    proto.getCoverHead = function () {
        return lib.g(getId(this, 'cover-thead'));
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

        switch (this.select.toLowerCase()) {
            case 'multi':
                realFields.unshift(this.getMultiSelectField());
                break;
            case 'single':
                realFields.unshift(this.getSingleSelectField());
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
     * 获取第一列的多选框
     *
     * @protected
     * @return {string} 多选框fields对象
     */
    proto.getMultiSelectField = function () {
        return {
            select: true,
            title: function (item, index) {
                var data = {
                    id: getId(this, 'select-all'),
                    className: getClass(this, 'select-all'),
                    disabled: this.disabled ? 'disabled="disabled"' : '',
                    index: index
                };
                return lib.format(this.multiSelectAllTemplate, data);
            },

            content: function (item, index) {
                var data = {
                    id: getId(this, 'multi-select') + index,
                    className: getClass(this, 'multi-select'),
                    disabled: this.disabled ? 'disabled="disabled"' : '',
                    index: index,
                    checked: this.isRowSelected(this, index)
                        ? 'checked="checked"'
                        : ''
                };
                return lib.format(this.multiSelectTemplate, data);
            }
        };
    };

    /**
     * 第一列的单选框
     *
     * @protected
     * @return {string} 单选框fields对象
     */
    proto.getSingleSelectField = function () {
        return {
            title: '&nbsp;',
            select: true,
            content: function (item, index) {
                var id =  this.getId('single-select');
                var data = {
                    id: id + index,
                    name: id,
                    className: getClass(this, 'single-select'),
                    index: index,
                    disabled: this.disabled ? 'disabled="disabled"' : '',
                    checked: this.isRowSelected(this, index)
                        ? 'checked="checked"'
                        : ''
                };
                return lib.format(this.singleSelectTemplate, data);
            }
        };
    };

    /**
     * 绘制表格头。
     * @protected
     */
    proto.renderHead = function () {
        if (this.noHead) {
            return;
        }

        var fields = this.realFields;
        var html = '';
        var me = this;
        var headBuilder = this.getHeadBuilder();
        u.each(fields, function (field, index) {
            html += lib.format(me.thTemplate, {
                className: headBuilder.getHeadCellClasses.call(me, index)
                    .join(' '),
                content: headBuilder.getHeadCellContent.call(me, index)
            });
        });
        html = '<tr>' + html + '</tr>';
        this.getHead().innerHTML = html;
        if (this.isNeedCoverHead) {
            this.getCoverHead().innerHTML = html;
        }
    },

    /**
     * 返回表格头的builder。
     * @protected
     * @return {Object} headBuilder
     * @property {FcTable~getHeadCellClasses} getHeadCellClasses
     * @property {FcTable~getHeadCellContent} getHeadCellContent
     */
    proto.getHeadBuilder = function() {
        return this.getDefaultHeadBuilder();
    };

    /**
     * 返回默认的表格头的builder。
     * @protected
     * @return {Object} headBuilder
     * @property {FcTable~getHeadCellClasses} getHeadCellClasses
     *           this.defaultGetHeadCellClasses
     * @property {FcTable~getHeadCellContent} getHeadCellContent
     *           this.defaultGetHeadCellContent
     */
    proto.getDefaultHeadBuilder = function () {
        if (!this._defaultHeadBuilder) {
            this._defaultHeadBuilder = {
                getHeadCellClasses: this.defaultGetHeadCellClasses,
                getHeadCellContent: this.defaultGetHeadCellContent
            };
        }

        return this._defaultHeadBuilder;
    };

    /**
     * 默认的返回表头TH元素上的classes。
     * 默认获得-hcell。
     * 第一个获得-hcell-first。
     * 最后一个获得-hcell-last。
     * @protected
     * @see {FcTable~getHeadCellClasses}
     * @param  {number} index 当前列号，0起始
     * @return {Array<string>} class名字的Array
     */
    proto.defaultGetHeadCellClasses = function (index) {
        var classes = this.helper.getPartClasses('hcell');
        if (index === 0) {
            classes = classes.concat(
                this.helper.getPartClasses('hcell-first')
            );
        } else if (index === this.realFields.length - 1) {
            classes = classes.concat(
                this.helper.getPartClasses('hcell-last')
            );
        }

        return classes;
    };

    /**
     * 默认的获得一个表头TH元素内容的方法。
     * @protected
     * @see Table~getHeadCellContent
     * @param {number} index 当前行的序号，0开始
     * @return {Array<string>} HTML片段的Array
     *         HTML片段会拼接在一起并在前后加上TH标记。
     */
    proto.defaultGetHeadCellContent = function (index) {
        var field = this.realFields[index];
        // 获得content
        var title = field.title;
        var contentHtml;
        // 计算内容html
        if (typeof title === 'function') {
            contentHtml = title.call(this);
        }
        else {
            contentHtml = title;
        }
        if (isNullOrEmpty(contentHtml)) {
            contentHtml = '&nbsp;';
        }
        // 获得表头额外内容：排序和tip
        var extra = '';
        return lib.format(this.thContentTemplate, {
            extra: extra,
            text: contentHtml,
            className: getClass(this, 'hcell-text')
        });
    };

    /**
     * 绘制表格体
     * @protected
     */
    proto.renderBody = function () {
        this.getBody().innerHTML = this.getBodyHtml();

        this.fire('bodyChange');
    };

    /**
     * 获取表格主体的html
     *
     * @protected
     * @return {string}
     */
    proto.getBodyHtml = function () {
        var data = this.datasource || [];
        var dataLen = data.length;
        var html = [];

        if (!dataLen) {
            return lib.format(
                this.noDataTemplate,
                {
                    className: getClass(this, 'body-nodata'),
                    html: this.noDataHtml
                }
            );
        }

        for (var i = 0; i < dataLen; i++) {
            var item = data[i];
            html.push(this.getRowHtml(item, i, dataLen));
        }

        return html.join('');
    };

    /**
     * 返回默认的rowBuilder。
     * @protected
     * @return {Object}
     * @property {Function} getRowClasses
     *           返回defaultGetRowClasses
     * @property {Function} getRowInnerHtml
     *           返回defaultGetRowInnerHtml
     */
    proto.getDefaultRowBuilder = function () {
        if (!this._defaultRowBuilder) {
            this._defaultRowBuilder = {
                getRowClasses: this.defaultGetRowClasses,
                getRowInnerHtml: this.defaultGetRowInnerHtml
            };
        }

        return this._defaultRowBuilder;
    };

    /**
     * 根据当前行的data和index，返回一个rowBuilder对象。
     * 这个方法在每个行绘制前都会调用一次，若重写，不可以有重的运算。
     * 默认情况下会返回this.getDefaultRowBuilder。
     * @protected
     * @param  {Array} data 当前行要绘制的数据集
     * @param  {number} index 当前行序号，0为起始
     * @return {Object} rowBuilder
     * @property {FcTable~getRowClasses} rowBuilder.getRowClasses
     * @property {FcTable~getRowInnerHtml} rowBuilder.getRowInnerHtml
     */
    proto.getRowBuilder = function (data, index) {
        return this.getDefaultRowBuilder();
    };

    /**
     * 默认的row classes。
     * 基本行会附加 -row。
     * 奇数行附加 -row-odd。
     * 偶数行附加 -row-even。
     * 最后一行附加 -row-last。
     *
     * @protected
     * @see Table~getRowClasses
     * @this Table
     * @param {Object} data 当前行的数据
     * @param {number} index 当前行的序号，0开始
     * @param {number} length 目前表格的总行数
     * @return {Array<string>} class名字的Array
     */
    proto.defaultGetRowClasses = function (data, index, length) {
        var classes = this.helper.getPartClasses('row')
            .concat(
                index % 2 === 0
                    ? this.helper.getPartClasses('row-even')
                    : this.helper.getPartClasses('row-odd')
            );
        if (index === length - 1) {
            classes.push(
                this.helper.getPartClasses('row-last').join(' ')
            );
        }
        return classes;
    };

    /**
     * @see FcTable~getRowInnerHtml
     * @param {Object} data 当前行的数据
     * @param {number} index 当前行的序号，0开始
     * @return {Array<string>} HTML片段的Array
     */
    proto.defaultGetRowInnerHtml = function (data, index) {
        var html = [];
        var fields = this.realFields;
        var fieldsLength = fields.length;
        var me = this;
        u.each(fields, function (field, columnIndex) {
            var cellBuilder = me.getCellBuilder(
                data, index, columnIndex, field
            );
            var cellClasses = cellBuilder.getCellClasses.call(
                me, data, index, columnIndex, fieldsLength, field
            );
            var cellContent = cellBuilder.getCellHtml.call(
                me, data, index, columnIndex, field
            );
            html.push(
                lib.format(me.cellHtmlTemplate, {
                    className: cellClasses.join(' '),
                    content: cellContent
                })
            );
        });
        return html;
    };

    /**
     * 获取表格行的html
     *
     * @protected
     * @param {Object} data 当前行的数据
     * @param {number} index 当前行的序号
     * @param {number} length 总行数
     * @return {string}
     */
    proto.getRowHtml = function (data, index, length) {
        // 先取得当前行的builder
        var rowBuilder = this.getRowBuilder(data, index);
        // 当前行的classes
        var rowClasses = rowBuilder.getRowClasses.call(
            this, data, index, length);
        // 当前行的inner HTML
        var rowInnerHtml = rowBuilder.getRowInnerHtml.call(
            this, data, index);
        // 拼接整行的HTML
        return lib.format(this.rowHtmlTemplate, {
            className: rowClasses.join(' '),
            cellsHtml: rowInnerHtml.join('')
        });
    };

    /**
     * 取得cell的builder。默认返回this.getDefaultCellBuilder。
     * @param  {Object} data 当前行的数据
     * @param  {number} rowIndex 当前行的行号，0起始
     * @param  {number} columnIndex 当前行的列号，0起始
     * @param  {FcTable~field} field 当前列的field对象
     * @return {Object} cellBuilder
     * @property {FcTable~getCellClasses} cellBuilder.getCellClasses
     * @property {FcTable~getCellHtml} cellBuilder.getCellHtml
     */
    proto.getCellBuilder = function (data, rowIndex, columnIndex, field) {
        return this.getDefaultCellBuilder();
    };

    /**
     * 返回默认的cell builder。
     * @protected
     * @return {Object}
     * @property {Function} getCellClasses
     *          this.defaultGetCellClasses
     * @property {Function} getCellHtml
     *          this.defaultGetCellHtml
     */
    proto.getDefaultCellBuilder = function () {
        if (!this._defaultCellBuilder) {
            this._defaultCellBuilder = {
                getCellClasses: this.defaultGetCellClasses,
                getCellHtml: this.defaultGetCellHtml
            };
        }
        return this._defaultCellBuilder;
    };

    /**
     * 默认的获取单元格class的方法。
     * 每个单元格获得 -cell。
     * 第一个单元格获得-cell-first。
     * 最后一个单元格获得 -cell-last。
     *
     * @protected
     * @see Table~getCellClasses
     * @this FcTable
     * @param {Object} data 当前行的数据
     * @param {number} rowIndex 当前行的序号，0开始
     * @param {number} columnIndex 当前列的序号，0开始
     * @param {number} fieldsLength 总列数
     * @param {FcTable~field} field 当前列的field对象
     * @return {Array<string>} class名字的Array
     */
    proto.defaultGetCellClasses = function (
        data, rowIndex, columnIndex, fieldsLength, field
    ) {
        var classes = this.helper.getPartClasses('cell');
        if (columnIndex === 0) {
            classes.push(
                this.helper.getPartClasses('cell-first').join(' ')
            );
        }
        if (columnIndex === fieldsLength - 1) {
            classes.push(
                this.helper.getPartClasses('cell-last').join(' ')
            );
        }
        return classes;
    };

    /**
     * 默认的获取单元格内内容的方法。
     * 调用field.content，获得cell的文字内容，显示在
     * div.{-cell-text}内。
     * 如果没有field.content，会尝试画出data[content]。
     * 调用field.extraContent，获得额外的内容，显示在
     * div.{-cell-extra}内。如果没有额外的内容，div.{-cell-extra}
     * 不会画出来。
     *
     * @protected
     * @see Table~getCellHtml
     * @this Table
     * @param {Object} data 当前行的数据
     * @param {number} rowIndex 当前行的序号，0开始
     * @param {number} columnIndex 当前列的序号，0开始
     * @param {Table~field} field 本单元格的field对象
     * @return {string} HTML的string。不能包含最外围的TD标签。
     */
    proto.defaultGetCellHtml = function (
        data, rowIndex, columnIndex, field
    ) {
        // 先生成基本的content
        var content = field.content;
        var contentHtml = 'function' === typeof content
            ? content.call(this, data, rowIndex, columnIndex)
            : (this.encode
                ? lib.encodeHTML(data[content])
                : data[content]
            );
        // 再生成extra
        var extraContent = field.extraContent;
        var extraHtml = 'function' === typeof extraContent
            ? extraContent.call(this, data, rowIndex, columnIndex)
            : '';
        // content需要有一个默认值
        if (isNullOrEmpty(contentHtml)) {
            contentHtml = '&nbsp;';
        }
        // 若没有extra，不生成extra的DIV。
        if (!isNullOrEmpty(extraHtml)) {
            extraHtml = lib.format(this.cellExtraTemplate, {
                className: getClass(this, 'cell-extra'),
                content: extraHtml
            });
        }
        return lib.format(this.cellContentTemplate, {
            className: getClass(this, 'cell-text'),
            text: contentHtml,
            extra: extraHtml
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

        this.isNeedCoverHead = false;

        if (this.tableMaxHeight !== 0) {
            this.main.style.maxHeight = this.tableMaxHeight + 'px';
            lib.addClasses(this.main,
                this.helper.getStateClasses('has-max-height'));

            this.isNeedCoverHead = true;
        }

        if (this.isNeedCoverHead) {
            tableHtml += lib.format(this.coverTableTemplate, {
                tableClassName: getClass(this, 'cover-table'),
                thClassName: getClass(this, 'cover-thead'),
                tId: getId(this, 'cover-table'),
                thId: getId(this, 'cover-thead'),
                cgClassName: getClass(this, 'cover-colgroup'),
                cgId: getId(this, 'cover-colgroup')
            });
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
        var colsWidthChanged = false;
        var tBodyChanged = false;

        if (allProperities.fields
            || allProperities.select
            || allProperities.selectMode
            || allProperities.sortable
        ) {
            this.initFields();
            fieldsChanged = true;
        }

        if (fieldsChanged) {
            // TODO 处理宽度
            colsWidthChanged = true;
        }

        if (fieldsChanged
            || colsWidthChanged
            || allProperities.noHead
            || allProperities.order
            || allProperities.orderBy
            || allProperities.selectedIndex
        ) {
            this.renderHead();
        }

        if (fieldsChanged
            || colsWidthChanged
            || allProperities.encode
            || allProperities.noDataHtml
            || allProperities.datasource
            || allProperities.selectedIndex
        ) {
            this.renderBody();
            tBodyChanged = true;
        }

        if (fieldsChanged
            || colsWidthChanged
            || allProperities.foot
        ) {
            // TODO 处理foot
            tBodyChanged = true;
        }

        if (tBodyChanged) {
            if (this.isNeedCoverHead) {
                this.syncWidth();
            }
        }

        // this.extraRepaint = helper.createRepaint([
        // ]);
        // this.extraRepaint(changes, changesIndex);
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
