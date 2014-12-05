/**
 * @file 筛选下拉控件外部框架和逻辑
 *
 * @author Guangyao Tang （tangguangyao@baidu.com）
 */
define(function (require) {
    var ui = require('esui');
    var lib = require('esui/lib');
    var Control = require('esui/Control');
    var paint = require('esui/painters');
    var underscore = require('underscore');
    var etpl = require('etpl');
    var DropLayerButton = require('../DropLayerButton/DropLayerButton');
    var DropDownLayer = require('./DropDownLayer');

    /**
     * 点击按钮出浮层控件
     *
     * 类似HTML的`<select>`元素
     *
     * @extends DropLayerButton
     * @constructor
     */
    function DropDownButton(options) {
        options.Layer = DropDownLayer;
        DropLayerButton.call(this, options);
    }

    /**
     * 继承DropLayerButton
     */
    lib.inherits(DropDownButton, DropLayerButton);

    /**
     * 重新渲染-改写repaint的实现（添加displayHtml）
     *
     * @method
     * @protected
     * @override
     */
    DropDownButton.prototype.repaint = paint.createRepaint(
        DropLayerButton.prototype.repaint,
        paint.html('displayHtml')
    );

    /**
     * 控件类型
     * @type {string}
     * @readonly
     * @override
     */
    DropDownButton.prototype.type = 'DropDownButton';

    /**
     * 做一个custom的event，将参数包裹在data域中。
     */
    function makeEvent(params) {
        return { data: params };
    }

    /**
     * 初始化参数
     *
     * @param {Object} 构造函数传入的参数
     * @override
     */
    DropDownButton.prototype.initOptions = function (options) {
        /**
         * 默认选项配置
         */
        var properties = {
            label: '',
            placeholder: '请选择',
            autoClose: true
        };
        underscore.extend(properties, options);
        this.setProperties(properties);
        this.displayHtml = this.label + '<span title=' + this.placeholder + '>'
            + this.placeholder + '</span>';
    };

    /**
     * 初始化DOM结构
     *
     * @protected
     * @override
     */
    DropDownButton.prototype.initStructure = function () {
        DropLayerButton.prototype.initStructure.apply(this, arguments);
        if (this.layout) {
            this.setLayout(this.layout);
        }
        this.on('confirm', this.submit, this);
        this.on('cancel', this.cancel, this);
    };

    /**
     * 设置layer layout
     * @param {Object} layout 实例
     */
    DropDownButton.prototype.setLayout = function (layout) {
        this.layout = layout;
        if (this.layer.main) {
            this.setLayerContent(this.getTemplateHtml());
        } else {
            this.layercontent = this.getTemplateHtml();
        }
        this.layer.layout = layout;
    };

    /**
     * 获取layout的hmtl
     * @return {string} html内容
     */
    DropDownButton.prototype.getTemplateHtml = function () {
        var target = this.layout.getTemplateTarget();
        return etpl.render(target);
    };

    /**
     * 提交选择内容
     */
    DropDownButton.prototype.submit = function () {
        var data = this.layout.validate() ? this.layout.getValue() : null;
        this.fire('submit', makeEvent(data));
        var dispalyText = this.layout.getDispalyText();
        this.set(
            'displayHtml',
            this.label + '<span>' + dispalyText + '</span>'
        );
    };

    /**
     * 取消提交内容
     */
    DropDownButton.prototype.cancel = function () {
        this.fire('cancelValue');
    };

    /**
     * 设置layout
     * @param {string} text 提示语
     */
    DropDownButton.prototype.setButtonHtml = function (text) {
        this.set(
            'displayHtml',
            this.label + '<span title=' + text + '>' + text + '</span>'
        );
    };

    require('esui').register(DropDownButton);

    return DropDownButton;
});