/**
 * @file FCUI Region extension - Region的扩展，支持半选
 * TODO(tangguangyao): 目前DOM的选择器处理使用jQuery
 * @author Guangyao Tang(tangguangyao@baidu.com)
 * @param {Function} require require
 * @return {Control} FCUI 控件基类
 */
define(function (require) {
    var aop = require('fc-core/aop');
    var Extension = require('../Extension');
    var lib = require('../lib');

    /**
     * 凤巢Region控件的扩展
     *
     * @constructor
     * @extends {Extension}
     */
    function FcRegion() {
        Extension.apply(this, arguments);
    }

    lib.inherits(FcRegion, Extension);

    /**
     * 指定扩展类型，始终为`"FcRegion"`
     *
     * @type {string}
     */
    FcRegion.prototype.type = 'FcRegion';

    /**
     * 设置半选属性
     * @param {Object} dom jQuery的dom对象
     */
    function setIndeterminate (dom) {
        var input = lib.find(
            lib.parent(dom, '.ui-region-province-item'),
            'input[data-level=3]'
        );
        if (lib.hasClass(dom, 'state-hidden')) {
            input[0].indeterminate = false;
        }
        else {
            input[0].indeterminate = true;
        }
    }

    /**
     * 设置子地域的半选状态
     * @param {Object} dom 区域所在的dom
     */
    function setChildRegion (dom) {
        for (var i = 0, l = dom.find('b').length; i < l; i++) {
            var status = lib.find(dom, 'b:eq(' + i + ')');
            setIndeterminate(status);
        }
    }

    /**
     * 激活扩展
     *
     * @override
     */
    FcRegion.prototype.activate = function () {
        var region = this.target;

        // 此FcRegion是全局加载的，这里判断一次，仅对Region的多选做扩展
        if (this.target.type !== 'Region' || region.mode !== 'multi') {
            return;
        }

        var helper = region.helper;

        // 初始化DOM结构后，绑定事件
        aop.after(region, 'initStructure', function () {
            helper.addDOMEvent(region.main, 'click', function (event) {
                var target = event.target;
                var level = lib.getAttribute(target, 'data-level');

                switch (level) {
                    case '1': // ‘data-level = 1’ 表示全国
                        setChildRegion(region.main);
                        break;
                    case '2': // ‘data-level = 2’ 表示区域
                        setChildRegion(target.parentNode.nextElementSibling);
                        break;
                    case '4': // ‘data-level = 4’ 表示二级地域
                        setIndeterminate(
                            lib.parent(
                                target, '.ui-region-city-box'
                            ).nextElementSibling
                        );
                        break;
                    default:
                        break;

                }
            });
        });

        // 通过setRawValue接口设置地域时
        aop.after(region, 'setRawValue', function (value) {
            setChildRegion(region.main);
        });
    };

    return FcRegion;
});
