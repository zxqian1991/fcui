/**
 * FCUI (Fengchao UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 表格etpl模板
 *       为方便打包不出幺蛾子，template就写成一个JS文件
 * @author Han Bing Feng (hanbingfeng@baidu.com)
 * @return {string} 表格ETPL模板
 */
define(function () {
    return ''
        +   '<!-- target: table -->'
        +   '<table id="${table | id($instance)}"'
        +       'class="${table | class($instance)}">'
        +       '<thead id="${thead | id($instance)}"'
        +           'class="${thead | class($instance)}"></thead>'
        +       '<tbody id="${tbody | id($instance)}"'
        +           'class="${tbody | class($instance)}"></tbody>'
        +       '<tfoot id="${tfoot | id($instance)}"'
        +           'class="${tfoot | class($instance)}"></tbody>'
        +   '</table>';
});
