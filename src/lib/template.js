/**
 * FCUI (Fengchao UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 模板辅助方法
 * @author Han Bing Feng (hanbingfeng@baidu.com)
 * @param {Function} require require
 * @return {Object} 模板辅助方法
 */
define(function (require) {
    var exports = {};

    /**
     * 将模板string中的某个target替换为content。
     * 提供的content仍需要有target的开始标签。
     * @param  {string} template 原始的模板string
     * @param  {string} target 想要替换的target
     * @param  {string} content 想要替换的模板内容
     * @return {string} 替换完成的模板string
     */
    exports.replaceTarget = function (template, target, content) {
        var regex = new RegExp(
            '<!--\s+target:\s+' + target +
            + '\s+-->([.\s\S]*?)(<!--\s+(target:.*|/target)\s+-->)',
            'gm'
        );
        return template.replace(regex, content + ' $3');
    };

    return exports;
});
