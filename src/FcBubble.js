/**
 * @file esui3 extension - Tip - 凤巢定制版
 * @author Leo Wang(wangkemiao@baidu.com)
 */

define(function (require) {

    var util = require('er/util');
    var esui = require('esui');
    var Extension = require('esui/Extension');
    var Deferred = require('er/Deferred');

    var ICON_TYPE_CLASS = {
        '?': 'question',
        'i': 'info', 
        '!': 'warn'
    };
    
    /**
     * 布尔类型的映射
     * 
     * @const
     * @type {Object}
     */
    var BOOLEAN_MAP = {
        "true": true,
        "false": false
    };

    /**
     * 凤巢定制版Tip控件的扩展
     *
     * 通过data-ui-extension-fcBubble-iconType="?|i" 指定图标类型
     * data-ui-extension-fcBubble-closable="true|false" 指定该bubble是否拥有关闭按钮
     */
    function FcBubble(options) {
        options = options || {};
        // 指定默认行为
        options.showMode = options.showMode || 'click';
        options.iconType = options.iconType || '?';
        if (options.delayTime === undefined) {
            options.delayTime = 200;
        }
        if (options.delayHideTime === undefined) {
            options.delayHideTime = 150;
        }
        options.closable = BOOLEAN_MAP[options.closable];
        Extension.apply(this, arguments);
    }

    /**
     * 指定扩展类型，始终为`"FcBubble"`
     *
     * @type {string}
     */
    FcBubble.prototype.type = 'FcBubble';

    /**
     * 激活扩展
     *
     * @override
     */
    FcBubble.prototype.activate = function () {
        var me = this;

        // 修正默认展现触发
        me.target.showMode = me.showMode;

        // 覆盖Tip自己的showDelay
        me.target.delayTime = me.delayTime;
        me.target.delayHideTime = me.delayHideTime;

        // 根据type增加样式
        var typeClass = ICON_TYPE_CLASS[me.iconType];
        if (typeClass) {
            me.target.on('afterrender', function () {
                me.target.helper.addPartClasses(typeClass, me.target.main);

                var tipLayer = me.target.getChild('layer');
                
                if (me.closable) {
                    var fcBubbleLayerClosable = esui.createExtension(
                        'FcBubbleLayerClosable', {}
                    );
                    fcBubbleLayerClosable.attachTo(tipLayer);
                }

                var tipLayerBody = tipLayer.getBody();
                tipLayer.on('show', function () {
                    if (tipLayer.isShow) {
                        return;
                    }

                    if (!me.target.content) {
                        var method = me.target.getContent
                            || FcBubble.getContent;
                        var state = method.call(
                            me.target,
                            me.target.title
                        );
                        if (Deferred.isPromise(state)) {
                            tipLayerBody.setContent(
                                '<span class="view-loading"></span>'
                            );
                            state.done(function (content) {
                                tipLayerBody.setContent(content);
                            });
                        } else {
                            tipLayerBody.setContent(state);
                        }
                    }
                });
            });
        }
        Extension.prototype.activate.apply(me, arguments);
    };

    /**
     * 取消扩展的激活状态
     *
     * @override
     */
    FcBubble.prototype.inactivate = function () {
        Extension.prototype.inactivate.apply(this, arguments);
    };

    /**
     * 默认的content获取方法
     * @return {Deferred}
     */
    FcBubble.getContent = function () {
        return this.content;
    };

    util.inherits(FcBubble, Extension);
    require('esui').registerExtension(FcBubble);

    return FcBubble;
});