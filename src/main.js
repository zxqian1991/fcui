/**
 * FCUI (Fengchao UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file
 * @author Han Bing Feng (hanbingfeng@baidu.com)
 * @param {Function} require require
 * @return {Object} main
 */
define(function (require) {
    var main = require('esui/main');

    main.esuiVersion = main.version;

    main.version = '0.0.1-alpha.3';

    return main;
});
