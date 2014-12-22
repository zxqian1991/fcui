/**
 * @file FCUI Region extension - Region的扩展，支持半选
 * @author Guangyao Tang(tangguangyao@baidu.com)
 * @author Han Bing Feng
 */

define(function (require) {
    var u = require('underscore');
    var aop = require('fc-core/aop');
    var Extension = require('../Extension');
    var lib = require('../lib');
    var ui = require('../main');

    /**
     * 凤巢Region控件的扩展
     *
     * @constructor
     * @extends {Extension}
     */
    function IndeterminateRegion() {
        Extension.apply(this, arguments);
    }

    lib.inherits(IndeterminateRegion, Extension);

    /**
     * 指定扩展类型，始终为`"IndeterminateRegion"`
     *
     * @type {string}
     */
    IndeterminateRegion.prototype.type = 'IndeterminateRegion';

    /**
     * 设置半选属性
     * @param {Object} dom 每个省份的b元素，默认皮肤下，表示本省份下已选的市的个数
     */
    function setIndeterminate (dom) {
        var parent = lib.parent(dom, '.ui-region-province-item');
        var input = lib.find(parent, 'input[data-level="3"]');

        if (lib.find(parent, 'input:checked')) {
            // 有选中的input
            if (lib.find(parent, 'input:not(:checked)')) {
                // 也有没选中的input，画半选
                // 下属有任何input被check，则画上indeterminate
                input.indeterminate = true;
            }
            // else, 全选中，没有没选中的input，省上面现在是选定的状态，不要动了。
        }
        else {
            input.indeterminate = false;
        }
    }

    /**
     * 设置子地域的半选状态
     * @param {Object} dom 区域所在的dom
     */
    function setChildRegion (dom) {
        var els = lib.findAll(dom, 'b');
        u.each(els, function (el) {
            setIndeterminate(el);
        });
    }

    /**
     * 激活扩展
     *
     * @override
                    || changesIndex.hasOwnProperty('disabled')
     */
    IndeterminateRegion.prototype.activate = function () {
        var region = this.target;
        // 此IndeterminateRegion是全局加载的，这里判断一次，仅对Region的多选做扩展
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

        aop.after(region, 'repaint', function (changes, changesIndex) {
            if (changesIndex == null || changesIndex.hasOwnProperty('rawValue')) {
                // repaint 之后，凭b标签画半选状态，此时show出来的b标签全是有半选的。
                // 全选或不选都不会有b标签出现
                var els = lib.findAll(region.main, 'b:not(.state-hidden)');
                u.each(els, function (el) {
                    var parent = lib.parent(el, '.ui-region-province-item');
                    var input = lib.find(parent, 'input[data-level="3"]');
                    input.indeterminate = true;
                });
            }
        });
    };

    ui.registerExtension(IndeterminateRegion);

    return IndeterminateRegion;
});


