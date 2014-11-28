/**
 * @file esui3 extension - TipLayer - closable - 凤巢定制版
 * 
 * @author Cory(kuanghongrui@baidu.com)
 */

define(function (require) {

    var util = require('er/util');
    var esui = require('esui');
    var Extension = require('esui/Extension');
    var aop = require('library/base/aop');
    var us = require('underscore');
    var localStorage = require('library/framework/storage/localStorage');
    
    /**
     * 凤巢定制版TipLayer控件的关闭扩展功能。
     * 
     * @param {Object}
     * {
     *     targetKey: '', // bubble所对应的唯一key值。
     *     closeTimes: 1 // 关闭次数
     * }
     * 
     * @constructor
     * @extends Extension
     */
    function FcBubbleLayerClosable(options) {
        options = options || {};
        options.closeTimes = +options.closeTimes || 0;
        Extension.apply(this, arguments);
    }
    
    util.inherits(FcBubbleLayerClosable, Extension);
    
    /**
     * 指定扩展类型，始终为`"FcBubbleLayerClosable"`
     *
     * @type {string}
     */
    FcBubbleLayerClosable.prototype.type = 'FcBubbleLayerClosable';

    /**
     * 气泡的宽度。
     * 
     * @const
     * @type {number}
     */
    var BUBBLE_LAYER_WIDTH = 260;
    
    /**
     * 渲染关闭按钮。
     * 
     * @protected
     */
    FcBubbleLayerClosable.prototype.renderCloseButton = function () {
        var me = this;
        var tipLayer = me.target;
        
        var closeButton = $( ''
            + '<a href="javascript:;" class="' 
            + tipLayer.helper.getPartClasses('close-button').join(' ')
            + '">'
            +     '<i class="font-icon font-icon-times"></i>'
            +'</a>'
        );
        closeButton.prependTo(tipLayer.main);
        
        tipLayer.helper.addDOMEvent(
            closeButton[0],
            'click',
            function () {
                tipLayer.fire('close');
                tipLayer.hide();
            }
        );
        
        tipLayer.helper.addPartClasses('body-panel-extra', tipLayer.getBody().main);
    };
    
    /**
     * 激活扩展
     *
     * @override
     */
    FcBubbleLayerClosable.prototype.activate = function () {
        var me = this;
        var tipLayer = me.target;
        $(tipLayer.main).width(BUBBLE_LAYER_WIDTH);
        
        if (tipLayer.helper.isInStage('RENDERED')) {
            me.renderCloseButton();
        } else {
            tipLayer.on('afterrender', me.renderCloseButton, me);
        }
        
        Extension.prototype.activate.apply(this, arguments);
        
        tipLayer.on('close', me.recordCloseTimes, me);
        
        aop.after(tipLayer, 'attachTo', function (options) {
            me.extraShow();
        });
        tipLayer.on('show', me.extraShow, me);
    };
    
    /**
     * 显示时，需要执行的额外的方法。
     * 
     * @protected
     */
    FcBubbleLayerClosable.prototype.extraShow = function () {
        var me = this;
        me.cancelClickBodyEvent();
        me.computeCloseTimes();
    };
    
    /**
     * 取消tip layer的点击任意地方消失事件。
     * 
     * @protected
     */
    FcBubbleLayerClosable.prototype.cancelClickBodyEvent = function () {
        var me = this;
        var tipLayer = me.target;
        var delayTime = tipLayer.delayTime;
        if (!+delayTime) {
            delayTime = 0;
        }
        // 由于TipLayer中，添加body点击事件是通过setTimeout，并等待delayTime再注册，
        // 所以这里，移除注册就要在delayTime + 1之后。
        setTimeout(function () {
            // 移除鼠标点击别处事件。
            tipLayer.helper.removeDOMEvent($('body')[0], 'click');
        }, delayTime + 1);
    };
    
    /**
     * 记录关闭次数。
     * 
     * @protected
     */
    FcBubbleLayerClosable.prototype.recordCloseTimes = function () {
        var me = this;
        if (me.closeTimes) {
            var targetKey = this.targetKey;
            var bubbleRecord = me.getBubbleRecord();
            var closedTimes = bubbleRecord[targetKey];
            if (closedTimes < me.closeTimes) {
                ++bubbleRecord[targetKey];
                localStorage.updateItem('bubbleRecord', bubbleRecord);
            }
        }
    };
    
    /**
     * 当bubble关闭的次数超过了指定的关闭次数，就将其隐藏。
     * 
     * @protected
     */
    FcBubbleLayerClosable.prototype.computeCloseTimes = function () {
        var me = this;
        var tipLayer = me.target;
        var targetKey = this.targetKey;
        var bubbleRecord = me.getBubbleRecord();
        var closedTimes = bubbleRecord[targetKey];
        if (me.closeTimes) {
            if (closedTimes >= me.closeTimes) {
                tipLayer.hide();
            }
        }
    };
    
    /**
     * 从storage中获取bubble record对象
     * 
     * @return {Object}
     */
    FcBubbleLayerClosable.prototype.getBubbleRecord = function () {
        var bubbleRecord = localStorage.getItem('bubbleRecord');
        if (!bubbleRecord) {
            localStorage.setItem('bubbleRecord', {});
            bubbleRecord = {};
        }
        var targetKey = this.targetKey;
        if (!bubbleRecord[targetKey]) {
            bubbleRecord[targetKey] = 0;
        }
        return bubbleRecord;
    };
    
    /**
     * 取消扩展的激活状态
     *
     * @override
     */
    FcBubbleLayerClosable.prototype.inactivate = function () {
        var me = this;
        var tipLayer = me.target;
        
        tipLayer.un('afterrender', me.renderCloseButton, me);
        tipLayer.un('close', me.recordCloseTimes, me);
        tipLayer.un('show', me.extraShow, me);
        
        Extension.prototype.activate.apply(me, arguments);
    };
    
    esui.registerExtension(FcBubbleLayerClosable);

    return FcBubbleLayerClosable;
});