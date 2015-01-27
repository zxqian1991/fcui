/**
 * FCUI (Fengchao UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 
 * @author Cory(kuanghongrui@baidu.com)
 */
define(function (require) {
    var _ = require('underscore');
    var fc = require('fc-core');
    var fcui = require('./main');
    var helper = require('./controlHelper');
    var lib = require('./lib');
    var Select = require('esui/Select');
    var Layer = require('./Layer');

    /**
     * select的浮层类型。现已把select当成dropdown来使用了。
     * 这种方式很不好，但是esui的layer架构改变不了呀。需要从长计议。
     * @type {Object}
     */
    var LAYER_TYPE = {
        DEFAULT: 'default', // 默认的layer类型，则为正常的select交互。
        CUSTOM: 'custom' // 用户自定义layer类型，则可以自定义layer里面的内容。
    };

    /**
     * `Select`控件使用的自定义层类
     *
     * @extends Layer
     * @ignore
     * @constructor
     */
    function CustomLayer() {
        Layer.apply(this, arguments);
    }
    lib.inherits(CustomLayer, Layer);

    /**
     * 自定义浮层原始html片段。
     * @type {string}
     */
    var customLayerHTML = '';

    /**
     * 自定义的layer渲染方法。
     * @override
     */
    CustomLayer.prototype.render = function (element) {
        if (customLayerHTML) {
            element.innerHTML = customLayerHTML;
            var controls = fcui.init(element, {
                viewContext: this.control.viewContext
            });
            if (controls && controls.length > 0) {
                controls[0].on('submit', _.bind(function (e) {
                    this.control.fire('layersubmit', fc.util.customData(e.data));
                }, this));
            }
        }
    };

    /**
     * 同步控件状态到层。
     * @override
     */
    CustomLayer.prototype.syncState = function (element) {
        
    };

    CustomLayer.prototype.dock = {
        strictWidth: true
    };

    /**
     * select的浮层类型.
     * 若该类型为空，则为默认的select交互浮层效果。
     * @type {string}
     */
    Select.prototype.layerType = LAYER_TYPE.DEFAULT;

    /**
     * 显示label及选中值的模板
     *
     * @type {string}
     */
    Select.prototype.labelTemplate = '<span class="${labelClass}">${label}</span>';

    /**
     * 原始初始化方法。
     * @inner
     * @type {function}
     */
    var initStructure = Select.prototype.initStructure;

    /**
     * 初始化DOM结构
     *
     * @protected
     * @override
     */
    Select.prototype.initStructure = function () {
        if (this.layerType === LAYER_TYPE.CUSTOM) {
            this.layer = new CustomLayer(this);
            var layerContent = this.main.querySelector('.custom-layer-content').innerHTML.replace(/(^\s+)|(\s+$)/g, '');
            if (layerContent) {
                customLayerHTML = '<div data-ui-type="' + layerContent + '"></div>';
            }
        }
        initStructure.apply(this, arguments);
    };

    /**
     * 原始初始化事件交互方法。
     * @inner
     * @type {function}
     */
    var initEvents = Select.prototype.initEvents;

    /**
     * 初始化事件交互
     *
     * @protected
     * @override
     */
    Select.prototype.initEvents = function () {
        if (this.layerType === LAYER_TYPE.CUSTOM) {
            this.on('layersubmit', _.bind(this.layerSubmit, this));
        }
        initEvents.apply(this, arguments);
    };

    /**
     * Select的原始值。
     * @type {Object}
     */
    var rawValue;

    /**
     * 弹出层提交。
     *
     * @param {Event} e
     */
    Select.prototype.layerSubmit = function (e) {
        rawValue = e.data;
        this.set('rawValue', rawValue);
        this.fire('change');
    };

    /**
     * 原始获取原始值方法。
     * @inner
     * @type {function}
     */
    var getRawValue = Select.prototype.getRawValue;

    /**
     * 获取原始值
     * @override
     * @return {Object}
     */
    Select.prototype.getRawValue = function () {
        if (this.layerType === LAYER_TYPE.DEFAULT) {
            return getRawValue.apply(this, arguments);
        }
        return rawValue;
    };

    /**
     * 获取显示的label+option名字的html字符串。
     * @override
     * @return {string}
     */
    Select.prototype.getDisplayHTML = function (item) {
        var label = _.escape(this.label);
        var labelWrapData = {
            label: label,
            labelClass: helper.getPartClasses(this, 'label').join(' ')
        };
        var labelHtml = label ? lib.format(this.labelTemplate, labelWrapData) : '';
        if (!item) {
            return labelHtml + _.escape(this.emptyText || '');
        }

        var data = {
            text: _.escape(item.name || item.text),
            value: _.escape(item.value)
        };
        return labelHtml + lib.format(this.displayTemplate, data);
    };

    return Select;
});
