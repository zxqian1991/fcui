/**
 * @file DropLayerButton的基础层
 * @author Shiying Wang （wangshiying@baidu.com）
 */
define(function (require) {
    var lib = require('esui/lib');
    var InputControl = require('esui/InputControl');
    var Layer = require('esui/Layer');
    var underscore = require('underscore');
    var etpl = require('etpl');
    require('etpl/tpl!./template.tpl');

    /**
     * 像素单位
     *
     * @const
     * @type {string}
     */
    var PX = 'px';

    /**
     * 获得hidden样式
     *
     * @param {Object} layer DropLayer组件本身
     */
    function getHiddenClasses(layer) {
        var classes = layer.control.helper.getPartClasses('layer-hidden');
        classes.unshift('ui-layer-hidden');
        return classes;
    }

    /**
     * 获得样式拼接
     *
     * @param {Object} 样式配置
     * @return {string} 样式配置字符串
     */
    function getCssText(options) {
        var result = '';
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                result += key + ':' + options[key] + ';';
            }
        }
        return result;
    }

    /**
     * DropLayer控件使用的层类
     *
     * @extends Layer
     * @constructor
     */
    function DropLayer() {
        Layer.apply(this, arguments);
    }

    /**
     * 继承Layer
     */
    lib.inherits(DropLayer, Layer);

    /**
     * 获取浮层DOM元素，将element插入document，
     * 将其插入control.main的父元素,解决滚动框时，layer与主元素分离的问题
     *
     * @param {boolean} [isAutoCreate=true] 不存在时是否创建
     * @return {HTMLElement}
     * @override
     */
    DropLayer.prototype.getElement = function (isAutoCreate) {
        var me = this;
        var control = me.control
        var element = control.helper.getPart('layer');

        if (element || isAutoCreate === false ) {
            return element;
        }

        element = me.create();
        me.render(element);
        lib.addClasses(element, getHiddenClasses(me));
        // 如果设置自动关闭为true
        if (control.autoClose) {
            // 点击document关掉layer
            control.helper.addDOMEvent(
                document, 'mousedown', underscore.bind(me.hide, this)
            );
            // 点击layer自己不关掉，阻止冒泡到`document`
            control.helper.addDOMEvent(
                element,
                'mousedown',
                function (e) {
                    e.stopPropagation();
                }
            );
            // 点击contrl.main自己不关掉，阻止冒泡到`document`
            control.helper.addDOMEvent(
                control.main,
                'mousedown',
                function (e) {
                    e.stopPropagation();
                }
            );
        }
        me.syncState(element);
        if (!element.parentElement) {
            // 放入select的父元素，取代原来的放入document.body
            // 解决layer不跟随主control滑动的问题
            var parent = control.main.parentNode;
            if (parent) {
                parent.appendChild(element);
            } else {
                document.body.appendChild(element);
            }
        }
        me.initBehavior(element);
        control.fire('afterrender');
    };

    /**
     * 渲染layer的内容
     *
     * @param {Object} element layer的主元素
     * @override
     */
    DropLayer.prototype.render = function (element) {
        var control = this.control;
        var helper = control.helper;
        var customTemplate = control.template;

        // 传入template，表示完全用自己的模板
        if (customTemplate) {
            element.innerHTML = customTemplate;
            // 初始化html中的esui控件
            helper.initChildren(element);
            return;
        }
        var titleClass = helper.getPartClasses('title')[0];
        var footerClass = helper.getPartClasses('footer')[0];
        // 要隐藏title
        if (control.hideTitle) {
            titleClass += ' hide';
        }

        // 要隐藏footer
        if (control.hideFooter) {
            footerClass += ' hide';
        }
        if (control.layerWidth) {
            element.style.width = control.layerWidth + PX;
        }
        element.innerHTML = etpl.render(
            'library-framwork-ui-dropLayerButton',
            {
                titleClass: titleClass,
                title: control.title || '',
                closeId: helper.getId('close'),
                closeIconClass: helper.getPartClasses('close-icon')[0],
                contentId: helper.getId('content'),
                contentClass: helper.getPartClasses('content')[0],
                content: control.layercontent || '',
                footerClass: footerClass
            }
        );
        helper.initChildren(element);
    };

    /**
     * 为layer内元素绑定事件
     *
     * @override
     */
    DropLayer.prototype.initBehavior = function () {
        this.bindCloseEvent();
        this.bindConfirmEvent();
        this.bindCancelEvent();
    };

    /**
     * 绑定关闭事件
     *
     */
    DropLayer.prototype.bindCloseEvent = function () {
        var control = this.control;
        var helper = control.helper;
        var closeElem = helper.getPart('close');
        if (closeElem) {
            helper.addDOMEvent(
                closeElem,
                'click',
                underscore.bind(this.hide, this)
            );
        }
    };

    /**
     * 绑定确认事件
     *
     */
    DropLayer.prototype.bindConfirmEvent = function () {
        var me = this;
        var control = me.control;
        var okBtn = control.getChild('confirmBtn');

        // 点击浮层的确定按钮，触发layerOk事件，并隐藏浮出层
        if (okBtn) {
            okBtn.on(
                'click',
                function () {
                    control.fire('confirm');
                    me.hide();
                }
            );
        }
    };

    /**
     * 绑定取消事件
     *
     */
    DropLayer.prototype.bindCancelEvent = function () {
        var me = this;
        var control = me.control;
        var cancelBtn = control.getChild('cancelBtn');
        if (cancelBtn) {
            // 点击浮层的取消按钮，触发layerCancle事件，并隐藏浮出层
            cancelBtn.on('click', function () {
                control.fire('cancel');
                me.hide();
            });
        }
    };

    /**
     * 隐藏层
     */
    DropLayer.prototype.hide = function () {
        var control = this.control;
        var helper = control.helper;
        var classes = getHiddenClasses(this);
        var element = this.getElement();
        lib.addClasses(element, classes);
        control.removeState('active');
        control.fire('hide');
    };

    /**
     * 显示层
     */
    DropLayer.prototype.show = function () {
        var element = this.getElement();
        var control = this.control;
        var helper = control.helper;
        element.style.zIndex = this.getZIndex();
        this.position();
        var classes = getHiddenClasses(this);
        lib.removeClasses(element, classes);
        control.addState('active');
        control.fire('show');
    };

    /**
     * layer打开时做的一些处理
     *
     * @override
     */
    DropLayer.prototype.syncState = function (element) {
        this.control.fire('statesync', {ele: element});
    };

    /**
     * 设置layer的位置
     *
     * @override
     */
    DropLayer.prototype.position = function () {
        var element = this.getElement();
        var main = this.control.main;
        // 先计算需要的尺寸，浮层必须显示出来才能真正计算里面的内容
        element.style.cssText = getCssText({
            'display': 'block',
            'visibility': 'hidden'
        });
        var mainPosition = lib.getOffset(main);
        var layPosition = lib.getOffset(element);
        var left = '';
        var top = '';
        var minWidth = mainPosition.width + PX;
        element.style.display = '';
        // left-bottom: 在主控件下方，对其主控件的左边
        // right-bottom: 在主控件下方，对其主控件的右边
        // left-top: 在主控件上方，对其主控件的左边
        // right-top: 在主控件上方，对其主控件的右边
        switch (this.control.alignPosition || 'left-bottom') {
            case 'right-bottom':
                left = main.scrollLeft - layPosition.width
                    + mainPosition.width;
                top = main.scrollTop + mainPosition.height;
                break;
            case 'left-bottom':
                left = main.scrollLeft;
                top = main.scrollTop + mainPosition.height;
                break;
            case 'right-top':
                left = main.scrollLeft - layPosition.width
                    + mainPosition.width;
                top = main.scrollTop - layPosition.height;
                break;
            case 'left-top':
                left = main.scrollLeft;
                top = main.scrollTop - layPosition.height;
                break;
        }
        element.style.cssText = getCssText({
            'left': left + PX,
            'top': top + PX,
            'min-width': minWidth
        });
    };

    return DropLayer;
});
