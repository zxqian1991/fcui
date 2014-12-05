/**
 * @file DropLayerButton的基础层改写
 * @author Guangyao Tang (tangguangyao@baidu.com）
 */

define(function (require) {
    var lib = require('esui/lib');
    var DropLayer = require('../DropLayerButton/DropLayer');

    function DropDownLayer() {
        DropLayer.apply(this, arguments);
    }

    /**
     * 继承DropLayer
     */
    lib.inherits(DropDownLayer, DropLayer);

    DropDownLayer.prototype.initBehavior = function () {
        var me = this;
        DropLayer.prototype.initBehavior.apply(this, arguments);

        this.control.on('afterrender', function () {
            me.layout.startup(lib.g(me.control.helper.getId('content')));
        });
    };

    /**
     * 绑定确认事件
     * @override
     */
    DropDownLayer.prototype.bindConfirmEvent = function () {
        var me = this;
        var control = me.control;
        var okBtn = control.getChild('confirmBtn');

        // 点击浮层的确定按钮，触发layerOk事件，并隐藏浮出层
        if (okBtn) {
            okBtn.on(
                'click',
                function () {
                    // 如果验证出错，则不关闭弹窗
                    if (me.layout.validate()) {
                        control.fire('confirm');
                        me.hide();
                    }
                }
            );
        }
    };

    return DropDownLayer;

});