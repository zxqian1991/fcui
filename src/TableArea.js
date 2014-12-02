/**
 * FCUI (Fengchao UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 表格区控件。集合了顶按钮区，中表格区和底翻页区的控件
 * @author Han Bing Feng (hanbingfeng@baidu.com)
 * @param {Function} require require
 * @return {Table} 表格区控件
 */
define(function (require) {
    var u = require('underscore');
    var oo = require('fc-core/oo');
    var etpl = require('etpl');
    var Control = require('./Control');
    var lib = require('./lib');

    require('./Button');
    require('./Pager');
    require('./Table');

    /**
     * @class TableArea
     * 表格区控件。集合了顶按钮区，中表格区和底翻页区的控件
     * @extends Control
     */
    var proto = {};

    /**
     * FCUI 表格区空间
     * @param  {Object} options 构建参数
     * @property {etpl/Engine} options.templateEngine
     *         自定义的ETPL engine。如不提供将使用默认的模板引擎。
     * @constructor
     */
    proto.constructor = function (options) {
        this.$super(arguments);

        var engine;
        if (options.templateEngine) {
            engine = options.templateEngine;
        }
        else {
            engine = new etpl.Engine();
            var template = ''
            +   '<!-- target: tableArea -->'
            +   '<!-- if: !${noButtons}-->'
            +   '<div class=${buttons | class}>'
            +       '<div class="${important-buttons | class}">${impBtns | raw}</div>'
            +       '<div class="${common-buttons | class}">${comBtns | raw}</div>'
            +       '<div class="${uncommon-buttons | class}">${uncomBtns | raw}'
            +           '<!-- if: ${userDefineCols} -->'
            +           '<!-- /if -->'
            +       '</div>'
            +   '</div>'
            +   '<!-- /if -->'
            +   '<div data-ui-type="Table" '
            +       'data-ui-id="${tableId}"></div>'
            +   '<!-- if: ${pager}-->'
            +   '<div data-ui-type="Pager" '
            +       'data-ui-id="${pagerId}"></div>'
            +   '</div>'
            +   '<!-- /if -->';
            engine.compile(template);
        }

        this.helper.setTemplateEngine(engine);
    };

    /**
     * 控件类型
     *
     * @type {string}
     */
    proto.type = 'TableArea';

    /**
     * 取得表格的控件id
     * @return {string} id
     */
    proto.getTableId = function () {
        return this.id + '-table';
    };

    /**
     * 取得翻页的控件id
     * @return {string} id
     */
    proto.getPagerId = function () {
        return this.id + '-pager';
    };

    /**
     * 取得自定义列的控件id
     * @return {string} id
     */
    proto.getUserDefineColumnsId = function () {
        return this.id + '-user-define-columns';
    };

    /**
     * 默认属性值
     *
     * @type {Object}
     * @protected
     */
    proto.defaultProperties = {
        /**
         * 表格的属性集合
         * @type {Object}
         * @default {}
         */
        table: {},
        /**
         * 翻页区的属性集合，设为null则没有pager
         * @type {Object}
         * @default {}
         */
        pager: {
            layout: 'distributed'
        },
        /**
         * 用户自定义列控件的属性集合，设为null则没有用户自定义列控件
         * @type {Object}
         * @default {}
         */
        userDefineColumns: {},
        /**
         * 不显示顶buttons区
         * @type {Boolean}
         * @default false
         */
        noButtons: false,
        /**
         * 重要按钮区的按钮的HTML片段
         * @type {string}
         * @default ''
         */
        importantButtonsHtml: '',
        /**
         * 普通按钮区的按钮的HTML片段
         * @type {string}
         * @default ''
         */
        commonButtonsHtml: '',
        /**
         * 非重要按钮区的按钮的HTML片段
         * @type {string}
         * @default ''
         */
        uncommonButtonsHtml: ''
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

        var tableId = this.table.id ? this.table.id : this.getTableId();
        var pagerId = this.pager ? (
            this.pager.id ? this.pager.id : this.getPagerId()
        ) : '';

        var html = this.helper.renderTemplate('tableArea', {
            impBtns: this.importantButtonsHtml,
            comBtns: this.commonButtonsHtml,
            uncomBtns: this.uncommonButtonsHtml,
            userDefineCols: !!this.userDefineColumns,
            noButtons: this.noButtons,
            tableId: tableId,
            pager: !!this.pager,
            pagerId: pagerId
        });

        this.setClasses();

        this.main.innerHTML = html;

        var props = {};

        props[tableId] = this.table;
        if (pagerId) {
            props[pagerId] = this.pager;
        }

        this.helper.initChildren(this.main, {
            properties: props
        });
    };

    /**
     * 给main附上各个状态class
     */
    proto.setClasses = function () {
        var classes = [];
        var helper = this.helper;

        if (this.noButtons) {
            classes = classes.concat(helper.getStateClasses('no-buttons'));
        }

        if (this.pager == null) {
            classes = classes.concat(helper.getStateClasses('no-pager'));
        }

        lib.addClasses(this.main, classes);
    };

    var TableArea = oo.derive(Control, proto);
    require('./main').register(TableArea);

    return TableArea;
});
