/**
 * @file 点击按钮出浮出层组件
 * 请在其外层套个relitive的div
 * eg：
 * <div style="position: relative">
 *     <div data-ui="type:DropLayerButton;id:xxx;"></div>
 * </div>
 * option：
 * {
 *     displayText: 按钮上的文本
 *     width: 按钮宽，
 *     autoClose：是否自动关闭，
 *     alignPosition: layer的位置
 *         left-bottom: 在主控件下方，对其主控件的左边,为默认值
 *         right-bottom: 在主控件下方，对其主控件的右边
 *         left-top: 在主控件上方，对其主控件的左边
 *         right-top: 在主控件上方，对其主控件的右边
 *     title: layer的title，
 *     template：layer完全用template的内容,无需单独配置title、content等
 *     hideTitle: true时，隐藏title，
 *     hideFooter: true时，隐藏footer，
 *     layerWidth：layer的宽，
 *     layercontent:  layer的内容，
 *     selfClass：button自定义样式
 * }
 * 事件
 * afterrender: layer渲染完毕后抛出的事件
 * layerok: 点击确定按钮
 * layercancle: 点击取消按钮
 *
 * @author Shiying Wang （wangshiying@baidu.com）
 */
define(function (require) {
    var underscore = require('underscore');
    var ui = require('esui');
    var lib = require('esui/lib');
    var CommandMenu = require('esui/CommandMenu');
    var InputControl = require('esui/InputControl');
    var DropLayer = require('./DropLayer');

    /**
     * 点击按钮出浮层控件
     *
     * 类似HTML的`<select>`元素
     *
     * @extends InputControl
     * @constructor
     */
    function DropLayerButton(options) {
        InputControl.apply(this, arguments);
        // 一些特殊的layer，可以自己继承DropLayer，做特殊处理
        if (options && options.Layer) {
            this.layer = new options.Layer(this);
        } else {
            this.layer = new DropLayer(this);
        }
    }

    /**
     * 继承CommandMenu
     */
    lib.inherits(DropLayerButton, CommandMenu);

    /**
     * 初始化DOM结构
     *
     * @protected
     * @override
     */
    DropLayerButton.prototype.initStructure = function () {
        // 如果传入特殊样式，增加样式
        if (this.selfClass) {
            lib.addClass(this.main, this.selfClass);
        }
    };

    /**
     * 初始化事件交互
     *
     * @protected
     * @override
     */
    DropLayerButton.prototype.initEvents = function () {
        CommandMenu.prototype.initEvents.apply(this, arguments);
        this.helper.removeDOMEvent(this.main, 'click');
        this.helper.addDOMEvent(
            this.main,
            'click',
            underscore.bind(this.layer.toggle, this.layer)
        );
    };

    /**
     * 控件类型
     * @type {string}
     * @readonly
     * @override
     */
    DropLayerButton.prototype.type = 'DropLayerButton';

    /**
     * 设置layer的内容
     *
     * @param {string} content 组件下拉层的内容
     */
    DropLayerButton.prototype.setLayerContent = function (content) {
        this.viewContext.clean();
        lib.g(this.helper.getId('content')).innerHTML = content;
        ui.init(lib.g(this.helper.getId('content')));
    };

    require('esui').register(DropLayerButton);
    return DropLayerButton;
});
