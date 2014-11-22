/**
 * FCUI (Fengchao UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 
 * @author Han Bing Feng (hanbingfeng@baidu.com)
 */
define(function (require) {
    var u = require('underscore');

    var lib = {};

    u.extend(
        lib,
        require('esui/lib'),
        require('./lib/template')
    );

    return lib;
});
