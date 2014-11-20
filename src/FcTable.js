/**
 * FCUI (Fengchao UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 表格控件
 * @author Han Bing Feng (hanbingfeng@baidu.com)
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var u = require('underscore');
        var helper = require('esui/controlHelper');
        var Control = require('esui/Control');

        /**
         * 表格控件类
         *
         * @constructor
         * @param {Object} options 初始化参数
         */
        function FcTable(options) {
            var protectedProperties = {
                followHeightArr: [0, 0],
                followWidthArr: [],
                handlers: []
            };

            Control.call(this, u.extend({}, options, protectedProperties));
        }

        /**
         * 判断值是否为空
         *
         * @private
         * @return {bool}
         */
        function hasValue(obj) {
            return !(typeof obj === 'undefined' || obj === null);
        }


        /**
         * 判断值是否为空,包括空字符串
         *
         * @private
         * @return {bool}
         */
        function isNullOrEmpty(obj) {
            return !hasValue(obj) || !obj.toString().length;
        }

        /**
         * 设置元素属性 自动加上data-前缀
         *
         * @private
         */
        function setAttr(element, key, value){
            lib.setAttribute(element, 'data-' + key, value);
        }

        /**
         * 获取dom带有data-前缀的属性值
         *
         * @private
         * @return {string}
         */
        function getAttr(element, key){
            return lib.getAttribute(element, 'data-' + key);
        }

        /**
         * 获取dom的样式
         *
         * @private
         * @return {string}
         */
        function getStyleNum(dom, styleName) {
            var result = lib.getStyle(dom, styleName);
            return (result === '' ? 0 : (parseInt(result, 10) || 0));
        }

        /**
         * 获取dom子部件的css class
         *
         * @protected
         * @return {string}
         */
        function getClass(table, name) {
            return helper.getPartClasses(table, name).join(' ');
        }

        /**
         * 获取列表尾容器元素
         *
         * @public
         * @return {HTMLElement}
         */
        function getFoot(table) {
            return lib.g(table.getId('foot'));
        }

        /**
         * 获取表格内容行的dom元素
         *
         * @private
         * @param {number} index 行号
         * @return {HTMLElement}
         */
        function getRow(table, index) {
            return lib.g(table.getId('row') + index);
        }

        /**
         * 获取checkbox选择列表格头部的checkbox表单
         *
         * @private
         * @return {HTMLElement}
         */
        function getHeadCheckbox(table) {
            return lib.g(table.getId('select-all'));
        }

        /**
         * selectedIndex的setter，将自动设置selectedIndexMap
         *
         * @private
         * @param {object} table 表格控件本身
         * @param {number} index 行号
         */
        function setSelectedIndex(table, selectedIndex) {
            table.selectedIndex = selectedIndex;
            var selectedIndexMap = {};
            for (var i = selectedIndex.length - 1; i >= 0; i--) {
                selectedIndexMap[selectedIndex[i]] = 1;
            }
            table.selectedIndexMap = selectedIndexMap;
        }

        /**
         * 判断某行是否选中
         *
         * @private
         * @param {object} table 表格控件本身
         * @param {number} index 行号
         */
        function isRowSelected(table, index) {
            if (table.selectedIndexMap) {
                return !!table.selectedIndexMap[index];
            }
            return false;
        }

        /**
         * 获取表格所在区域宽度
         *
         * @private
         * @return {number}
         */
        function getWidth(table) {
            // 如果手工设置宽度，不动态计算
            if (table.width) {
                return table.width;
            }

            //根据表格父容器获取表格宽度
            var rulerDiv = document.createElement('div');
            var parent = table.main.parentNode;

            parent.appendChild(rulerDiv);
            var width = rulerDiv.offsetWidth;
            rulerDiv.parentNode.removeChild(rulerDiv);

            return width;
        }

        /**
         * 初始化表格的字段
         *
         * @private
         */
        function initFields(table) {
            if (!table.fields) {
                return;
            }

            // 避免刷新时重新注入
            var fields = table.fields;
            var realFields = fields.slice(0);
            var len = realFields.length;

            while (len--) {
                if (!realFields[len]) {
                    realFields.splice(len, 1);
                }
            }
            table.realFields = realFields;

            if (!table.select) {
                return;
            }

            switch (table.select.toLowerCase()) {
                case 'multi':
                    realFields.unshift(getMultiSelectField(table));
                    break;
                case 'single':
                    realFields.unshift(getSingleSelectField(table));
                    break;
            }
        }

        /**
         * dom表格起始的html模板
         *
         * @private
         */
        var tplTablePrefix = '<table '
                            + 'cellpadding="0" '
                            + 'cellspacing="0" '
                            + 'width="${width}" '
                            + 'data-control-table="${controlTableId}">';

        /**
         * 初始化FollowHead
         *
         * @private
         */
        function initFollowHead(table){
            if (table.followHead) {
                cachingFollowDoms(table);
                if (!table.noFollowHeadCache) {
                    resetFollowOffset(table);
                }
            }
        }

        /**
         *  刷新FollowHead设置
         *
         * @private
         */
        function resetFollowHead(table){
            if (table.followHead) {
                cachingFollowDoms(table);
                resetFollowOffset(table);
            }
        }

         /**
         * 缓存表头跟随的Dom元素
         *
         * @private
         */
        function cachingFollowDoms(table) {
            if (!table.followHead) {
                return;
            }

            var followDoms = table.followDoms = [];
            var walker = table.main.parentNode.firstChild;
            var tableId = table.id;
            // 缓存表格跟随的dom元素
            while (walker) {
                if (walker.nodeType === 1
                 && (getAttr(walker, 'follow-thead') === tableId)) {
                    followDoms.push(walker);
                }
                walker = walker.nextSibling;
            }

            resetFollowDomsWidth(table);
            resetFollowHeight(table);
        }

        /**
         * 重置FollowDoms的Heights
         *
         * @private
         */
        function resetFollowHeight(table) {
            var followDoms = table.followDoms;
            var followHeights = table.followHeightArr;

            // 读取height和width的值缓存
            followHeights[0] = 0;
            var i = 0;
            for (var len = followDoms.length; i < len; i++) {
                 var dom = followDoms[i];
                 followHeights[i + 1] = followHeights[i] + dom.offsetHeight;
            }
            followHeights[i + 1] = followHeights[i];
            followHeights.lenght = i + 2;
        }

        /**
         * 重置followDoms元素的宽度
         *
         * @private
         */
        function resetFollowDomsWidth(table){
            var followDoms = table.followDoms;
            var followWidths = table.followWidthArr;

            for (var i = 0, len = followDoms.length; i < len; i++) {
                var dom =  followDoms[i];
                var followWidth = getStyleNum(dom, 'padding-left')
                                + getStyleNum(dom, 'padding-right')
                                + getStyleNum(dom, 'border-left-width')
                                + getStyleNum(dom, 'border-right-width');
                followWidths[i] = followWidth;

                followDoms[i].style.width = table.realWidth
                                            - followWidth + 'px';
            }
        }

        /**
         * 重置FollowDoms的offset
         *
         * @private
         */
        function resetFollowOffset(table) {
            var followDoms = table.followDoms;

            // 读取跟随的高度，缓存
            var followOffest = lib.getOffset(followDoms[0] || table.main);
            table.followTop = followOffest.top;
            table.followLeft = followOffest.left;
        }

        /**
         * 初始最小列宽
         *
         * @private
         */
        function initMinColsWidth(table) {
            var fields = table.realFields;
            var result = [];
            var fontSize = table.fontSize;
            var extraWidth = table.colPadding * 2 + 5;

            if (!table.noHead) {

                for (var i = 0, len = fields.length; i < len; i++) {
                    var field = fields[i];
                    var width = field.minWidth;
                    if (!width && !field.breakLine) {
                        width = field.title.length * fontSize
                                + extraWidth
                                + (table.sortable && field.sortable
                                    ? table.sortWidth : 0)
                                + (field.tip ? table.tipWidth : 0);

                    }
                    result[i] = width;
                }
            } else {
                var minWidth = fontSize + extraWidth;
                for (var i = 0, len = fields.length; i < len; i++) {
                    result[i] = minWidth;
                }
            }

            table.minColsWidth = result;
        }

        /**
         * 初始化列宽
         *
         * @private
         */
        function initColsWidth(table) {
            var fields = table.realFields;
            var canExpand = [];

            table.colsWidth = [];

            // 减去边框的宽度
            var leftWidth = table.realWidth - 1;

            // 读取列宽并保存
            for (var i = 0, len = fields.length; i < len; i++) {
                var field = fields[i];
                var width = field.width;

                width = width ? parseInt(width, 10) : 0;
                table.colsWidth.push(width);
                leftWidth -= width;

                if (!field.stable) {
                    canExpand.push(i);
                }
            }

            // 根据当前容器的宽度，计算可拉伸的每列宽度
            var len = canExpand.length;
            var leaveAverage = Math.round(leftWidth / len);

            for (var i = 0; i < len; i++) {
                var index  = canExpand[i];
                var offset = Math.abs(leftWidth) < Math.abs(leaveAverage)
                            ? leftWidth : leaveAverage;

                leftWidth -= offset;
                table.colsWidth[index] += offset;

                //计算最小宽度
                var minWidth = table.minColsWidth[index];
                if (minWidth > table.colsWidth[index]) {
                    leftWidth += table.colsWidth[index] - minWidth;
                    table.colsWidth[index] = minWidth;
                }
            }

            // 如果空间不够分配，需要重新从富裕的列调配空间
            if (leftWidth < 0) {
                var i = 0;
                while (i < len && leftWidth !== 0) {
                    var index = canExpand[i];
                    var minWidth = table.minColsWidth[index];

                    if (minWidth < table.colsWidth[index]) {
                        var offset = table.colsWidth[canExpand[i]] - minWidth;
                        offset = offset > Math.abs(leftWidth)
                                ? leftWidth
                                : -offset;
                        leftWidth += Math.abs(offset);
                        table.colsWidth[index] += offset;
                    }
                    i++;
                }
            }
            else if (leftWidth > 0) {// 如果空间富裕，则分配给第一个可调整的列
                table.colsWidth[canExpand[0]] += leftWidth;
            }
        }

        /**
         * 绘制表格尾
         *
         * @private
         */
        function renderFoot(table) {
            var foot = getFoot(table);

            if (!(table.foot instanceof Array)) {
                foot && (foot.style.display = 'none');
            } else {
                if (!foot) {
                    foot = document.createElement('div');
                    foot.id = table.getId('foot');
                    foot.className = getClass(table, 'foot');
                    setAttr(foot, 'control-table', table.id);

                    table.main.appendChild(foot);
                }

                foot.style.display = '';
                 if (table.realWidth) {
                    foot.style.width = table.realWidth + 'px';
                }
                foot.innerHTML = getFootHtml(table);
            }
        }

        /**
         * 获取表格尾的html
         *
         * @private
         * @return {string}
         */
        function getFootHtml(table) {
            var html = [];
            var footArray = table.foot;
            var fieldIndex = 0;
            var colsWidth = table.colsWidth;
            var thCellClass = getClass(table, 'fcell');
            var thTextClass = getClass(table, 'fcell-text');
            var rowWidthOffset = table.rowWidthOffset;
            html.push(
                lib.format(
                    tplTablePrefix,
                    { width: '100%', controlTableId : table.id }
                ),
                '<tr>'
            );

            for (var i = 0, len = footArray.length; i < len; i++) {
                var footInfo = footArray[i];
                var colWidth = colsWidth[fieldIndex];
                var colspan = footInfo.colspan || 1;
                var thClass = [thCellClass];
                var contentHtml = footInfo.content;

                if ('function' == typeof contentHtml) {
                    contentHtml = contentHtml.call(table);
                }
                if (isNullOrEmpty(contentHtml)) {
                    contentHtml = '&nbsp;';
                }

                for (var j = 1; j < colspan; j++) {
                    colWidth += colsWidth[fieldIndex + j];
                }

                fieldIndex += colspan;
                if (footInfo.align) {
                    thClass.push(
                        getClass(table, 'cell-align-' + footInfo.align));
                }

                colWidth += rowWidthOffset;
                (colWidth < 0) && (colWidth = 0);
                html.push(
                    '<th id="' + getFootCellId(table, i) + '" '
                        + 'class="' + thClass.join(' ') + '"',
                    ' style="width:' + colWidth + 'px;',
                    (colWidth ? '' : 'display:none;') + '">',
                    '<div class="' + thTextClass + '">',
                    contentHtml,
                    '</div></th>'
                );
            }

            html.push('</tr></table>');
            return html.join('');
        }

         /**
         * 初始化表头子控件
         *
         * @private
         */
        function initHeadChildren(table, headPanel){
            //清理table之前的子控件,因为只有Head用到了子控件才能在这里调用该方法
            if (headPanel.children) {
                headPanel.disposeChildren();
            }

             //初始化Head子控件
            if (table.hasTip) {
                headPanel.initChildren();
            }
        }

        //表格排序区域模版
        var tplSortIcon = '<div class="${className}"></div>';

        //表格头提示信息模版
        var tplTitleTip = '<div id="${id}" '
                        + 'class="${className}" '
                        + 'data-ui="type:Tip;id:${id};content:${content}">'
                        + '</div>';

        /**
         * 获取表格头的html
         *
         * @private
         * @return {string}
         */
        function getHeadHtml(table) {
            var fields = table.realFields;
            var thCellClass = getClass(table, 'hcell');
            var thTextClass = getClass(table, 'hcell-text');
            var breakClass = getClass(table, 'cell-break');
            var sortClass = getClass(table, 'hsort');
            var selClass = getClass(table, 'hcell-sel');
            var canDragBegin = -1;
            var canDragEnd = -1;
            var rowWidthOffset = table.rowWidthOffset;

            if (!table.disabled) {
                // 计算最开始可拖拽的单元格
                for (var i = 0, len = fields.length; i < len; i++) {
                    if (!fields[i].stable) {
                        canDragBegin = i;
                        break;
                    }
                }
                // 计算最后可拖拽的单元格
                for (var i = len - 1; i >= 0; i--) {
                    if (!fields[ i ].stable) {
                        canDragEnd = i;
                        break;
                    }
                }
            }

            var html = [];
            // 拼装html
            html.push(
                lib.format(
                    tplTablePrefix,
                    { width: '100%' , controlTableId: table.id }
                ),
                '<tr>'
            );

            for (var i = 0, len = fields.length; i < len; i++) {
                var thClass = [thCellClass];
                var field = fields[i];
                var title = field.title;
                var sortable = table.sortable && field.sortable;
                var currentSort = sortable
                                && field.field
                                && field.field == table.orderBy;
                var realThTextClass = thTextClass;

                if (i === 0) {
                    realThTextClass += ' '
                                    + getClass(table, 'hcell-text-first');
                }
                if (i === len - 1) {
                    realThTextClass += ' '
                                    + getClass(table, 'hcell-text-last');
                }

                // 计算排序图标样式
                var sortIconHtml = '';
                if (sortable) {
                    thClass.push(getClass(table, 'hcell-sort'));
                    if (currentSort) {
                        thClass.push(getClass(table, 'hcell-' + table.order));
                    }
                    sortIconHtml = lib.format(
                        tplSortIcon,
                        { className: sortClass }
                    );
                }

                //计算表格对齐样式
                if (field.align) {
                    thClass.push(getClass(table, 'cell-align-' + field.align));
                }

                // 判断是否breakline模式
                if (table.breakLine|| field.breakLine) {
                    thClass.push(breakClass);
                }

                var titleTipHtml = '';
                var titleTipContent = '';
                var tip = field.tip;
                // 计算内容html
                if (typeof tip === 'function') {
                    titleTipContent = tip.call(table);
                }
                else {
                    titleTipContent = tip;
                }
                if (titleTipContent) {
                    titleTipHtml = lib.format(
                        tplTitleTip,
                        {
                            id: table.getId('htip' + i),
                            className: getClass(table,'htip'),
                            content: titleTipContent
                        }
                    );

                    table.hasTip = true;
                }

                var contentHtml;
                // 计算内容html
                if (typeof title == 'function') {
                    contentHtml = title.call(table);
                } else {
                    contentHtml = title;
                }
                if (isNullOrEmpty(contentHtml)) {
                    contentHtml = '&nbsp;';
                }


                html.push(
                    '<th id="' + getTitleCellId(table, i) + '"',
                    ' data-index="' + i + '"',
                    ' class="' + thClass.join(' ') + '"',
                    sortable ? ' data-sortable="1"' : '',
                    (i >= canDragBegin && i < canDragEnd
                        ? ' data-dragright="1"' : ''),
                    (i <= canDragEnd && i > canDragBegin
                        ? ' data-dragleft="1"' : ''),
                    ' style="',
                    'width:' + (table.colsWidth[i] + rowWidthOffset) + 'px;',
                    (table.colsWidth[i] ? '' : 'display:none') + '">',
                    '<div class="' + realThTextClass +
                    (field.select ? ' ' + selClass : '') + '">',
                    titleTipHtml,
                    contentHtml,
                    sortIconHtml,
                    '</div></th>'
                );
            }
            html.push('</tr></table>');

            return html.join('');
        }

        /**
         * 获取表格头单元格的id
         *
         * @private
         * @param {object} table table控件
         * @param {number} index 单元格的序号
         * @return {string}
         */
        function getTitleCellId(table, index) {
            return table.getId('title-cell') + index;
        }

        /**
         * 获取表格尾单元格的id
         *
         * @private
         * @param {object} table table控件
         * @param {number} index 单元格的序号
         * @return {string}
         */
        function getFootCellId(table, index) {
            return table.getId('foot-cell') + index;
        }

        /**
         * 表格头单元格鼠标移入的事件handler
         *
         * @private
         * @param {HTMLElement} element 移出的单元格
         */
        function titleOverHandler(element, e) {
           titleOver(this, element);
        }

        function titleOver(table, element) {
            if (table.isDraging || table.dragReady) {
                return;
            }

            helper.addPartClasses(table, 'hcell-hover', element);

            if (table.sortable) {
                table.sortReady = 1;
                var index = getAttr(element, 'index');
                var field = table.realFields[index];

                if (field && field.sortable) {
                    helper.addPartClasses(table, 'hcell-sort-hover', element);
                }
            }
        }

        /**
         * 表格头单元格鼠标移出的事件handler
         *
         * @private
         * @param {HTMLElement} cell 移出的单元格
         */
        function titleOutHandler(element, e) {
            titleOut(this, element);
        }

        function titleOut(table, element) {
            helper.removePartClasses(table, 'hcell-hover', element);

            if (table.sortable) {
                table.sortReady = 0;
                helper.removePartClasses(table, 'hcell-sort-hover', element);
            }
        }

        /**
         * 表格头单元格点击的事件handler
         *
         * @private
         * @param {HTMLElement} cell 点击的单元格
         */
        function titleClickHandler(element, e) {
            var table = this;
            if (table.sortable && table.sortReady) { // 避免拖拽触发排序行为
                var index = getAttr(element, 'index');
                var field = table.realFields[index];
                if (field.sortable) {
                    var orderBy = table.orderBy;
                    var order = table.order;

                    if (orderBy == field.field) {
                        order = (!order || order == 'asc') ? 'desc' : 'asc';
                    } else {
                        order = 'desc';
                    }

                    table.setProperties({
                        order: order,
                        orderBy: field.field
                    });

                    table.fire('sort', { field: field, order: order });
                }
            }
        }

        /**
         * 获取表格头鼠标移动的事件handler
         *
         * @private
         * @return {Function}
         */
        function headMoveHandler(table, e) {
            if(!table.columnResizable){
                return;
            }

            var dragClass = 'startdrag';
            var range = 8; // 可拖拽的单元格边界范围
            if (table.isDraging) {
                return;
            }

            var tar = e.target ;
            // 寻找th节点。如果查找不到，退出
            tar = findDragCell(table, tar);
            if (!tar) {
                return;
            }
            var el = this;
            var pageX = e.pageX || e.clientX + lib.page.getScrollLeft();

            // 获取位置与序号
            var pos = lib.getOffset(tar);
            var sortable = getAttr(tar, 'sortable');

            // 如果允许拖拽，设置鼠标手型样式与当前拖拽点
            if (getAttr(tar, 'dragleft')  && pageX - pos.left < range) {
                sortable && (titleOut(table, tar)); // 清除可排序列的over样式
                helper.addPartClasses(table, dragClass, el);
                table.dragPoint = 'left';
                table.dragReady = 1;
            }
            else if (getAttr(tar, 'dragright')
                && pos.left + tar.offsetWidth - pageX < range
            ) {
                sortable && (titleOut(table, tar)); // 清除可排序列的over样式
                helper.addPartClasses(table, dragClass, el);
                table.dragPoint = 'right';
                table.dragReady = 1;
            }
            else {
                helper.removePartClasses(table, dragClass, el);
                sortable && (titleOver(table, tar)); // 附加可排序列的over样式
                table.dragPoint = '';
                table.dragReady = 0;
            }
        }

        /**
         * 查询拖拽相关的表格头单元格
         *
         * @private
         * @param {HTMLElement} target 触发事件的元素
         * @return {HTMLTHElement}
         */
        function findDragCell(taable, target) {
            while (target.nodeType == 1) {
                if (target.nodeName == 'TH') {
                    return target;
                }
                target = target.parentNode;
            }
            return null;
        }

        /**
         * 获取表格头鼠标点击拖拽起始的事件handler
         *
         * @private
         * @return {Function}
         */
        function dragStartHandler(table, e) {
            if(!table.columnResizable){
                return;
            }

            // @DEPRECATED: 移除
            table.fire('startdrag');
            table.fire('dragstart');

            var dragClass = getClass(table, 'startdrag');
            var tar = e.target;

            // 寻找th节点，如果查找不到，退出
            tar = findDragCell(table, tar);
            if (!tar) {
                return;
            }

            if (lib.g(table.getId('head')).className.indexOf(dragClass) < 0) {
                return;
            }
            // 获取显示区域高度
            table.htmlHeight = document.documentElement.clientHeight;

            // 记忆起始拖拽的状态
            table.isDraging = true;
            table.dragIndex = getAttr(tar, 'index');
            table.dragStart = e.pageX || e.clientX + lib.page.getScrollLeft();

            initTableOffset(table);

            // 绑定拖拽事件
            var realDragingHandler = u.partial(dragingHandler, table);
            var realDragEndHandler = function(e) {
                var retrunResult = true;
                try { retrunResult = u.partial(dragEndHandler, table)(e); }
                catch (er) {}

                //清除拖拽向全局绑定的事件
                lib.un(document, 'mousemove', realDragingHandler);
                lib.un(document, 'mouseup', realDragEndHandler);

                return retrunResult;
            };

            lib.on(document, 'mousemove', realDragingHandler);
            lib.on(document, 'mouseup', realDragEndHandler);

            // 显示拖拽基准线
            showDragMark(table, table.dragStart);

            // 阻止默认行为
            lib.event.preventDefault(e);
            return false;
        }

         /**
         * 缓存Table的Offset数据
         *
         * @private
         */
        function initTableOffset(table){
            var tableOffset = lib.getOffset(table.main);
            table.top = tableOffset.top;
            table.left = tableOffset.left;
        }

        /**
         * 获取拖拽中的事件handler
         *
         * @private
         * @desc 移动拖拽基准线
         * @return {Function}
         */
        function dragingHandler(table, evt) {
            var e = evt || window.event;
            showDragMark(
                table,
                e.pageX || e.clientX + lib.page.getScrollLeft()
            );
            lib.event.preventDefault(e);
            return false;
        }

        /**
         * 显示基准线
         *
         * @private
         */
        function showDragMark(table, left) {
            var mark = getDragMark(table);

            var right = table.left + table.realWidth;
            //加减1是为了在表格边框以内
            var rangeLeft = table.left + 1;
            var rangeRight = right - 1;

            left = left < rangeLeft ? rangeLeft : left;
            left = left > rangeRight ? rangeRight : left;

            if (!mark) {
                mark = createDragMark(table);
            }

            mark.style.top = table.top + 'px';
            mark.style.left = left + 'px';
            mark.style.zIndex = table.zIndex || '';

            var height = table.htmlHeight
                        - table.top
                        + lib.page.getScrollTop();
            var mainHeight = table.main.offsetHeight;
            height = mainHeight > height ? height : mainHeight;
            mark.style.height = height + 'px';
        }

        /**
         * 隐藏基准线
         *
         * @private
         */
        function hideDragMark(table) {
            var mark = getDragMark(table);
            mark.style.left = '-10000px';
            mark.style.top = '-10000px';
        }

        /**
         * 创建拖拽基准线
         *
         * @private
         * @return {HTMLElement}
         */
        function createDragMark(table) {
            var mark = document.createElement('div');
            mark.id = table.getId('drag-mark');
            mark.className = getClass(table, 'mark ');
            mark.style.top = '-10000px';
            mark.style.left = '-10000px';
            document.body.appendChild(mark);
            return mark;
        }

        /**
         * 获取基准线的dom元素
         *
         * @private
         * @return {HTMLElement}
         */
        function getDragMark(table) {
            return lib.g(getId(table, 'drag-mark'));
        }

        /**
         * 获取拖拽结束的事件handler
         *
         * @private
         * @return {Function}
         */
        function dragEndHandler(table, evt) {
            var e = evt || window.event;
            var index = parseInt(table.dragIndex, 10);
            var pageX = e.pageX || e.clientX + lib.page.getScrollLeft();
            var fields = table.realFields;
            var fieldLen = fields.length;
            var alterSum = 0;
            var colsWidth = table.colsWidth;
            var revise = 0;

            // 校正拖拽元素
            // 如果是从左边缘拖动的话，拖拽元素应该上一列
            if (table.dragPoint == 'left') {
                index--;
            }

            // 校正拖拽列的宽度
            // 不允许小于最小宽度
            var minWidth = table.minColsWidth[index];
            var offsetX = pageX - table.dragStart;
            var currentWidth = colsWidth[index] + offsetX;
            if (currentWidth < minWidth) {
                offsetX += (minWidth - currentWidth);
                currentWidth = minWidth;
            }

            var alters = [];
            var alterWidths = [];
            //查找宽度允许改变的列
            for (var i = index + 1; i < fieldLen; i++) {
                if (!fields[ i ].stable && colsWidth[i] > 0) {
                    alters.push(i);
                    alterWidth = colsWidth[i];
                    alterWidths.push(alterWidth);
                    alterSum += alterWidth;
                }
            }

            // 计算允许改变的列每列的宽度
            var leave = offsetX;
            var alterLen = alters.length;
            for (var i = 0; i < alterLen; i++) {
                var alter = alters[i];
                var alterWidth = alterWidths[i];    //当前列宽
                var roughWidth = offsetX * alterWidth / alterSum; // 变更的列宽

                // 校正变更的列宽
                // roughWidth可能存在小数点
                var offsetWidth = leave > 0 ? Math.ceil(roughWidth) : Math.floor(roughWidth);
                offsetWidth = Math.abs(offsetWidth) < Math.abs(leave) ? offsetWidth : leave;

                // 校正变更后的列宽
                // 不允许小于最小宽度
                alterWidth -= offsetWidth;
                leave -= offsetWidth;
                minWidth = table.minColsWidth[alter];
                if (alterWidth < minWidth) {
                    revise += minWidth - alterWidth;
                    alterWidth = minWidth;
                }

                colsWidth[alter] = alterWidth;
            }

            // 校正拖拽列的宽度
            // 当影响的列如果宽度小于最小宽度，会自动设置成最小宽度
            // 相应地，拖拽列的宽度也会相应减小
            currentWidth -= revise;

            colsWidth[index] = currentWidth;

            // 重新绘制每一列
            resetColumns(table);

            table.isDraging = false;
            hideDragMark(table);

            // @DEPRECATED: 移除
            table.fire('enddrag');
            table.fire('dragend');

            lib.event.preventDefault(e);
            return false;
        }

         /**
         * 更新表格指定高度
         *
         * @private
         */
        function updateBodyMaxHeight(table) {
            var tBody = getBody(table);
            var style = tBody.style;
            var dataLen = table.datasource.length;
            var bodyMaxHeight = table.bodyMaxHeight;
            // 如果设置了表格体高度
            // 表格需要出现纵向滚动条
            if (bodyMaxHeight > 0 && dataLen > 0) {
                var totalHeight = bodyMaxHeight;
                var bodyContainer = lib.g(table.getId('body-panel'));

                if (bodyContainer) {
                    totalHeight = bodyContainer.offsetHeight;
                }
                if (totalHeight >= bodyMaxHeight) {
                    style.height = bodyMaxHeight + 'px';
                    return;
                }
            }
            style.height = 'auto';
        }

        var noDataHtmlTpl = '<div class="${className}">${html}</div>';

        /**
         * 获取表格体的单元格id
         *
         * @private
         * @param {number} rowIndex 当前行序号
         * @param {number} fieldIndex 当前字段序号
         * @return {string}
         */
        function getBodyCellId(table, rowIndex, fieldIndex) {
            return table.getId('cell') + rowIndex + '-' + fieldIndex;
        }

         var tplRowPrefix = '<div '
                          + 'id="${id}" '
                          + 'class="${className}" '
                          + 'data-index="${index}" ${attr}>';

         /**
         * 批量添加rowBuilder
         *
         * @private
         * @param {Object} table
         * @param {Array} builderList rowBuilder数组
         */
        function addRowBuilderList(table, builderList) {
            var rowBuilderList = table.rowBuilderList || [];
            for (var i = 0, l = builderList.length; i <l; i++) {
                var builder = builderList[i];
                if (!builder.getColHtml) {
                    continue;
                }

                if(builder.getSubrowHtml) {
                    table.hasSubrow = true;
                }

                if(!hasValue(builder.index)) {
                    builder.index = 1000;
                }

                rowBuilderList.push(builder);
            }

            rowBuilderList.sort(function(a, b) {
                return a.index - b.index;
            });

            table.rowBuilderList = rowBuilderList;
        }

        /**
         * 初始化基础Builder
         *
         * @private
         * @param {Object} table
         *
         */
        function initBaseBuilderList(table) {
            addRowBuilderList(
                table,
                [
                    {
                        index: 1,
                        getRowArgs: getRowBaseArgs,
                        getColHtml: getColBaseHtml
                    }
                ]
            );
        }

        /**
         * base行绘制每行基本参数
         *
         * @private
         */
        function getRowBaseArgs(table, rowIndex) {
            var datasource = table.datasource || [];
            var dataLen = datasource.length;
            return {
                tdCellClass : getClass(table, 'cell'),
                tdBreakClass : getClass(table, 'cell-break'),
                tdTextClass : getClass(table, 'cell-text'),
                fieldLen: table.realFields.length,
                rowClass: [
                    getClass(table, 'row'),
                    getClass(table, 'row-' + ((rowIndex % 2) ? 'odd' : 'even')),
                    isRowSelected(table, rowIndex)
                        ? getClass(table, 'row-selected')
                        : '',
                    dataLen - 1 == rowIndex
                        ? getClass(table, 'row-last')
                        : ''
                ].join(' ')
            };
        }

        var baseColTextTpl = '<span id="${colTextId}">${content}</span>';

        /**
         * base列
         *
         * @private
         */
        function getColBaseHtml(
            table, data, field, rowIndex, fieldIndex, extraArgs
        ) {
            var tdCellClass = extraArgs.tdCellClass;
            var tdBreakClass = extraArgs.tdBreakClass;
            var tdTextClass = extraArgs.tdTextClass;
            var tdClass = [tdCellClass];
            var textClass = [tdTextClass];
            var content = field.content;

            if (fieldIndex === 0) {
                textClass.push(getClass(table, 'cell-text-first'));
            }
            if (fieldIndex === extraArgs.fieldLen - 1) {
                textClass.push(getClass(table, 'cell-text-last'));
            }

            // 生成可换行列的样式
            if (table.breakLine || field.breakLine) {
                tdClass.push(tdBreakClass);
            }

            // 生成选择列的样式
            if (field.select) {
                textClass.push(getClass(table, 'cell-sel'));
            }

            // 计算表格对齐样式
            if (field.align) {
                tdClass.push(getClass(table, 'cell-align-' + field.align));
            }

             // 计算表格排序样式
            if (field.field && field.field == table.orderBy) {
                tdClass.push(getClass(table, 'cell-sorted'));
            }

            // 构造内容html
            var contentHtml = 'function' == typeof content
                ? content.call(table, data, rowIndex, fieldIndex)
                : (table.encode
                    ? lib.encodeHTML(data[content])
                    : data[content]
                );

            if (isNullOrEmpty(contentHtml)) {
                contentHtml = '&nbsp;';
            }

            return {
                colClass: tdClass.join(' '),
                textClass: textClass.join(' '),
                html: lib.format(
                    baseColTextTpl,
                    {
                        colTextId: table.getId(
                            'cell-textfield-' + rowIndex + '-'+ fieldIndex
                        ),
                        content: contentHtml
                    }
                )
            };
        }

        /**
         * 表格行鼠标移上的事件handler
         *
         * @private
         * @param {number} index 表格行序号
         */
        function rowOverHandler(element, e) {
            if (this.isDraging) {
                return;
            }
            helper.addPartClasses(this, 'row-hover',element);
        }

        /**
         * 表格行鼠标移出的事件handler
         *
         * @private
         * @param {number} index 表格行序号
         */
        function rowOutHandler(element, e) {
            helper.removePartClasses(this, 'row-hover', element);
        }

        /**
         * 表格行鼠标点击的事件handler
         *
         * @private
         * @param {number} index 表格行序号
         */
        function rowClickHandler(element, e) {
            var table = this;
            var rowClassName = helper.getPartClasses(table, 'cell-text')[0];

            if (table.selectMode == 'line'
                && lib.hasClass(e.target, rowClassName)) {
                if (table.dontSelectLine) {
                    table.dontSelectLine = false;
                    return;
                }
                var index = getAttr(element, 'index');
                switch (table.select) {
                    case 'multi':
                        var input = lib.g(table.getId('multi-select') + index);
                        selectMulti(table, index, !input.checked);
                        resetMutilSelectedStatus(table);
                        break;

                    case 'single':
                        selectSingle(table, index, true);
                        break;
                }
            }
        }

        /**
         * 初始化resize的event handler
         *
         * @private
         */
        function initResizeHandler(table) {
            table.viewWidth = lib.page.getViewWidth();
            table.viewHeight = lib.page.getViewHeight();

            var resizeHandler = function() {
                var viewWidth = lib.page.getViewWidth();
                var viewHeight = lib.page.getViewHeight();

                if (viewWidth == table.viewWidth
                    && viewHeight == table.viewHeight
                ) {
                    return;
                }

                table.viewWidth = viewWidth;
                table.viewHeight = viewHeight;

                handleResize(table);
            };

            helper.addDOMEvent(table, window, 'resize', resizeHandler);
        }

        /**
         * 浏览器resize的处理
         *
         * @private
         */
        function handleResize(table) {
            var head = getHead(table);
            var foot = getFoot(table);
            table.realWidth = getWidth(table);
            var widthStr = table.realWidth + 'px';

            // 设置主区域宽度
            if (table.realWidth) {
                table.main.style.width = widthStr;
                getBody(table).style.width = widthStr;
                head && (head.style.width = widthStr);
                foot && (foot.style.width = widthStr);
            }
            // 重新绘制每一列
            initColsWidth(table);
            resetColumns(table);

            if (table.followHead) {
                resetFollowDomsWidth(table);

                //宽度的改变是会影响高度的，所以高度信息放在后面
                resetFollowHeight(table);
            }

            // 重新获取Table位置
            initTableOffset(table);

            table.fire('resize');

            table.topReseter && table.topReseter();
        }

        /**
         * 设置元素位置
         *
         * @private
         */
        function setPos(dom, pos, top , left) {
            if (dom) {
                dom.style.top = top + 'px';
                dom.style.left = left + 'px';
                dom.style.position = pos;
            }
        }

        /**
         * 纵向锁定初始化
         *
         * @private
         */
         function initTopResetHandler(table) {
            //避免重复绑定
            if (!table.followHead || table.topReseter) {
                return;
            }

            var domHead = getHead(table);
            var placeHolderId = table.getId('top-placeholder');
            var domPlaceholder = document.createElement('div');
            // 占位元素
            // 否则元素浮动后原位置空了将导致页面高度减少，影响滚动条
            domPlaceholder.id = placeHolderId;
            domPlaceholder.style.width = '100%';
            domPlaceholder.style.display = 'none';

            lib.insertBefore(domPlaceholder, table.main);
            domPlaceholder = null;

            table.topReseter = function() {
                if (!table.followHead) {
                    return ;
                }
                var scrollTop = lib.page.getScrollTop();
                var posStyle = lib.ie && lib.ie < 7 ? 'absolute' : 'fixed';
                var mainHeight = table.main.offsetHeight;
                var absolutePosition = posStyle == 'absolute';
                var placeHolder = lib.g(placeHolderId);
                var followDoms = table.followDoms;

                //如果不启用缓存，则需要每次滚动都做判断并获取了
                if (table.noFollowHeadCache) {
                    var position = domHead.style.position;
                    if ((position !== 'fixed' && position !== 'absolute')) {
                        resetFollowOffset(table);
                    }
                }

                if (scrollTop > table.followTop
                    && (absolutePosition
                        || scrollTop - table.followTop < mainHeight)) {

                    var scrollLeft = lib.page.getScrollLeft();
                    var fhArr = table.followHeightArr;
                    var fhLen = fhArr.length;

                    initTableOffset(table);
                    var curLeft = absolutePosition
                                ? table.left
                                : table.left - scrollLeft;

                    placeHolder.style.height = fhArr[fhLen - 1]
                                                + domHead.offsetHeight + 'px';
                    placeHolder.style.display = '';

                    if (lib.ie && lib.ie < 8) {
                        domHead.style.zIndex = table.zIndex + 1;
                    }

                    if (absolutePosition) {
                        for (var i = 0, len = followDoms.length; i < len; i++) {
                            setPos(
                                followDoms[i],
                                posStyle,
                                fhArr[i] + scrollTop,
                                curLeft
                            );
                        }

                        setPos(
                            domHead,
                            posStyle,
                            fhArr[fhLen - 1] + scrollTop,
                            curLeft
                        );

                    } else {
                        for (var i = 0, len = followDoms.length; i < len; i++) {
                            setPos(followDoms[i], posStyle, fhArr[i] ,curLeft);
                        }
                        setPos(domHead, posStyle, fhArr[fhLen - 1] , curLeft);
                    }
                }
                else {
                    placeHolder.style.height  = 0;
                    placeHolder.style.display = 'none';
                    posStyle = '';

                    for (var i = 0, len = followDoms.length; i < len; i++) {
                        setPos(followDoms[i], posStyle, 0, 0);
                    }

                    setPos(domHead, posStyle, 0, 0);
                    domHead.style.zIndex = '';
                }

            };

            helper.addDOMEvent(table, window, 'scroll', table.topReseter);
        }

        /**
         * 重新设置表格每个单元格的宽度
         *
         * @private
         */
        function resetColumns(table) {
            var colsWidth = table.colsWidth;
            var foot = table.foot;
            var id = table.id;
            var len = foot instanceof Array && foot.length;
            var tds = getBody(table).getElementsByTagName('td');
            var tdsLen = tds.length;
            var rowWidthOffset = table.rowWidthOffset;

            // 重新设置表格尾的每列宽度
            if (len) {
                var colIndex = 0;
                for (var i = 0; i < len; i++) {
                    var item    = foot[i];
                    var width   = colsWidth[colIndex];
                    var colspan = item.colspan || 1;

                    for (var j = 1; j < colspan; j++) {
                        width += colsWidth[colIndex + j];
                    }
                    colIndex += colspan;

                    var td = lib.g(getFootCellId(table, i));
                    width = Math.max(width + rowWidthOffset, 0);

                    td.style.width = width + 'px';
                    td.style.display = width ? '' : 'none';
                }
            }

            // 重新设置表格头的每列宽度
            len = colsWidth.length;
            if (!table.noHead) {
                for (var i = 0; i < len; i++) {
                    var width =
                        Math.max(colsWidth[i] + rowWidthOffset, 0);
                    var td = lib.g(getTitleCellId(table, i));
                    td.style.width = width + 'px';
                    td.style.display = width ? '' : 'none';
                }
            }

            // 重新设置表格体的每列宽度
            var j = 0;
            for (var i = 0; i < tdsLen; i++) {
                var td = tds[i];
                if (getAttr(td, 'control-table') == id) {
                    var width = Math.max(
                        colsWidth[j % len] + rowWidthOffset,
                        0
                    );
                    td.style.width = width + 'px';
                    td.style.display = width ? '' : 'none';
                    j++;
                }
            }
        }

        /**
         * 多选框全选模版
         *
         * @private
         */
        var mutilSelectAllTpl = '<input '
                                +  'type="checkbox" '
                                +  'id="${id}" '
                                +  'class="${className}" '
                                +  'data-index="${index}" '
                                +  '${disabled}/>';

        /**
         * 多选框模版
         *
         * @private
         */
        var mutilSelectTpl = '<input '
                            +  'type="checkbox" '
                            +  'id="${id}" '
                            +  'class="${className}" '
                            +  'data-index="${index}" '
                            +  '${disabled} '
                            +  '${checked} />';
        /**
         * 获取第一列的多选框
         *
         * @private
         */
        function getMultiSelectField(table) {
            return {
                width: 30,
                stable: true,
                select: true,
                title: function (item, index) {
                    var data = {
                        id: table.getId('select-all'),
                        className: getClass(table, 'select-all'),
                        disabled: table.disabled ? 'disabled="disabled"' : '',
                        index: index
                    };
                    return lib.format(mutilSelectAllTpl, data);
                },

                content: function (item, index) {
                    var data = {
                        id: table.getId('multi-select') + index,
                        className: getClass(table, 'multi-select'),
                        disabled: table.disabled ? 'disabled="disabled"' : '',
                        index: index,
                        checked: isRowSelected(table, index)
                            ? 'checked="checked"'
                            : ''
                    };
                    return lib.format(mutilSelectTpl, data);
                }
            };
        }

        /**
         * 单选框模版
         *
         * @private
         */
        var singleSelectTpl = '<input '
                            +  'type="radio" '
                            +  'id="${id}" '
                            +  'name="${name}" '
                            +  'class="${className}" '
                            +  'data-index="${index}" '
                            +  '${disabled} '
                            +  '${checked} />';

        /**
         * 第一列的单选框
         *
         * @private
         */
         function getSingleSelectField(table) {
            return {
                width: 30,
                stable: true,
                title: '&nbsp;',
                select: true,
                content: function (item, index) {
                    var id =  table.getId('single-select');
                    var data = {
                        id: id + index,
                        name: id,
                        className: getClass(table, 'single-select'),
                        index: index,
                        disabled: table.disabled ? 'disabled="disabled"' : '',
                        checked: isRowSelected(table, index)
                            ? 'checked="checked"'
                            : ''
                    };
                    return lib.format(singleSelectTpl, data);
                }
            };
        }

        /**
         * 行的checkbox点击处理函数
         *
         * @private
         */
        function rowCheckboxClick(element, e) {
            var index = getAttr(element, 'index');
            selectMulti(this, index);
            resetMutilSelectedStatus(this);
        }

        /**
         * 根据checkbox是否全部选中，更新头部以及body的checkbox状态
         *
         * @private
         * @param {number} index 需要更新的body中checkbox行，不传则更新全部
         */
        function selectMulti(table, index, isSelected) {
            var selectedClass = 'row-selected';
            if (index >= 0) {
                var input = lib.g(table.getId('multi-select') + index);
                if (input) {
                    hasValue(isSelected) && (input.checked = isSelected);
                    var row = getRow(table, index);
                    if (input.checked) {
                        helper.addPartClasses(table, selectedClass, row);
                    } else {
                        helper.removePartClasses(table, selectedClass, row);
                    }
                }
            } else if(hasValue(isSelected)){
                var inputs = findSelectBox(table, 'checkbox');
                for (var i = 0, len = inputs.length; i < len; i++) {
                    var input = inputs[i];
                    input.checked = isSelected;
                    var inputIndex = getAttr(input, 'index');
                    var row = getRow(table, inputIndex);
                    if (isSelected) {
                        helper.addPartClasses(table, selectedClass, row);
                    } else {
                         helper.removePartClasses(table, selectedClass, row);
                    }
                }
            }
        }


        /**
         * 重置多选的选中状态，包括是否全选和selectedIndex
         *
         * @private
         */
        function resetMutilSelectedStatus(table) {
            var selectAll = getHeadCheckbox(table);
            var inputs = findSelectBox(table, 'checkbox');
            var allChecked = true;
            var selected = [];
            var cbIdPrefix = table.getId('multi-select');

            for (var i = 0, len = inputs.length; i < len; i++) {
                var input = inputs[i];
                if (input.id.indexOf(cbIdPrefix) >= 0) {
                    var inputIndex = getAttr(input, 'index');
                    if (!input.checked) {
                        allChecked = false;
                    }
                    else {
                        selected.push(inputIndex);
                    }
                }
            }

            setSelectedIndex(table, selected);
            table.fire('select', {selectedIndex: selected});

            selectAll.checked = allChecked;
        }

        /**
         * 全选/不选 所有的checkbox表单
         *
         * @private
         */
        function toggleSelectAll(arg) {
            selectAll(this, getHeadCheckbox(this).checked);
        }

        /**
         * 获取所有选择Box
         *
         * @private
         * @param {string} type box类型
         */
        function findSelectBox(table, type) {
            var inputs = getBody(table).getElementsByTagName('input');
            var result = [];
            for (var i = 0, len = inputs.length; i < len; i++) {
                var input = inputs[i];
                var inputId = input.id;
                if (input.getAttribute('type') == type && inputId) {
                    result.push(input);
                }
            }
            return result;
        }

        /**
         * 更新所有checkbox的选择状态
         *
         * @private
         * @param {boolean} checked 是否选中
         */
        function selectAll(table, checked) {
            selectMulti(table, -1, checked);
            resetMutilSelectedStatus(table);
        }

        function selectSingleHandler(element, e) {
            selectSingle(this, getAttr(element, 'index'));
        }

        /**
         * 单选选取
         *
         * @private
         * @param {number} index 选取的序号
         */
        function selectSingle(table, index, isSelected) {
            var selectedIndex = table.selectedIndex;
            var input = lib.g(table.getId('single-select') + index);
            if (input) {
                hasValue(isSelected) && (input.checked = isSelected);

                table.fire('select', {selectedIndex: index});

                if (selectedIndex && selectedIndex.length) {
                    helper.removePartClasses(
                        table, 'row-selected', getRow(table, selectedIndex[0]));
                }

                setSelectedIndex(table, [index]);
                helper.addPartClasses(table, 'row-selected', getRow(table, index));
            }
        }


        /**
         * 重置Table主元素的ZIndex
         *
         * @private
         */
        function resetMainZIndex(table){
            table.main.style.zIndex = table.zIndex || '';
        }

        /**
         * 设置元素的disable样式
         *
         * @private
         */
        function setDisabledStyle(table) {
            var inputs = findSelectBox(
                table, table.select == 'multi' ? 'checkbox' : 'radio');
            for (var i = inputs.length - 1; i >= 0; i--) {
                if (table.disabled) {
                    inputs[i].setAttribute('disabled', 'disabled');
                } else {
                    inputs[i].removeAttribute('disabled');
                }
            }

            if (table.select == 'multi') {
                var selectAll = getHeadCheckbox(table);
                if (selectAll) {
                    if (table.disabled) {
                        selectAll.setAttribute('disabled', 'disabled');
                    } else {
                        selectAll.removeAttribute('disabled');
                    }
                }
            }

            if (table.children && table.children.length) {
                var children = table.children;
                for (var i = children.length - 1; i >= 0; i--) {
                    children[i].setDisabled(table.disabled);
                }
            }
        }

        /**
         * 根据单个className的元素匹配函数
         *
         * @private
         */
        var rclass = /[\t\r\n]/g;
        function getClassMatch(className){
            var cssClass= ' ' + className + ' ';
            return function (element) {
                var elClassName = ' ' + element.className + ' ';
                return  elClassName.replace(rclass, ' ').indexOf(cssClass) >= 0;
            };
        }

        /**
         * 创建委托的Handler
         *
         * @private
         */
        function createHandlerItem(handler, matchFn){
            var fn = null;
            if (matchFn) {
                fn = 'function' == typeof matchFn
                     ? matchFn
                     : getClassMatch(matchFn);
            }

            return {
                handler : handler,
                matchFn : fn
            };
        }

        /**
         * 根据单个className的元素匹配函数
         *
         * @private
         */
        function getHandlers(table, el, eventType){
            var realId = el.id;
            var handlers = table.handlers[realId];

            if (!handlers) {
                handlers = (table.handlers[realId]  = {});
            }
            if (eventType) {
                handlers = table.handlers[eventType];
                if (!handlers) {
                    handlers = (table.handlers[eventType] = []);
                }
            }

            return handlers;
        }

        /**
         * 批量添加handlers
         *
         * @private
         *
         * @return {Array} 事件委托处理函数数组
         */
        function addHandlers(table, el, eventType, handlers){
            var handlerQueue = getHandlers(table, el, eventType);
            var addedHandlers = [];

            //若从未在该el元素上添加过该eventType的事件委托，
            //则初次则自动添加该委托
            if (!handlerQueue.length) {
                addDelegate(table, el, eventType);
            }

            for (var i = 0, l = handlers.length; i < l ; i++) {
                var item = handlers[i];
                var hanlderItem = createHandlerItem(item.handler, item.matchFn);
                handlerQueue.push(hanlderItem);
                addedHandlers.push(hanlderItem);
            }

            return addedHandlers;
        }

        /**
         * 批量删除handlers
         *
         * @private
         */
        function removeHandlers(table, el, eventType, handlers) {
            var handlerQueue = getHandlers(table, el, eventType);
            for (var i = 0, len = handlers.length; i < len ; i++) {
                var handler = handlers[i];

                for (var j = 0, l = handlerQueue.length; j < l ; j++) {
                    if (handlerQueue[j] == handler) {
                        handlerQueue.splice(j, 1);
                        j--;
                    }
                }
            }

            //若handlerQueue为空则移除该事件委托，
            //与addHandlers中添加事件委托的逻辑相呼应
            if (!handlerQueue.length) {
                removeDelegate(table, el, eventType);
            }
        }

        /**
        * 生成委托处理函数
        *
        * @private
        */
        function getDelegateHandler(element, handlerQueue, scrope) {
            return function(e) {
                var e = e || window.event;
                var cur = e.target;
                while (cur) {
                    if (cur.nodeType === 1) {
                        for (var i = handlerQueue.length - 1; i >= 0; i--) {
                            var handlerItem = handlerQueue[i];
                            if (!handlerItem.matchFn
                                || handlerItem.matchFn(cur)
                            ) {
                                handlerItem.handler.call(scrope, cur, e);
                            }
                        }
                    }
                    if (cur == element) {
                        break;
                    }
                    cur = cur.parentNode ;
                }
            };
        }

        /**
        * 添加事件委托
        */
        function addDelegate(control, element, eventType) {
            var handlerQueue = getHandlers(control, element, eventType);
            helper.addDOMEvent(
                control,
                element,
                eventType,
                getDelegateHandler(element, handlerQueue, control)
            );
        }

        /**
        * 移除事件委托
        */
        function removeDelegate(control, element, eventType) {
            helper.removeDOMEvent(control, element, eventType);
        }

        /**
        * 初始化main元素事件处理函数
        */
        function initMainEventHandler(table) {
            var getPartClasses = helper.getPartClasses;
            var rowClass = getPartClasses(table, 'row')[0];
            var titleClass = getPartClasses(table, 'hcell')[0];
            var selectAllClass = getPartClasses(table, 'select-all')[0];
            var multiSelectClass = getPartClasses(table, 'multi-select')[0];
            var singleSelectClass = getPartClasses(table, 'single-select')[0];

            addHandlers(
                table,
                table.main,
                'mouseover',
                [
                    {
                        handler: rowOverHandler,
                        matchFn: rowClass
                    },
                    {
                        handler: titleOverHandler,
                        matchFn: titleClass
                    }
                ]
            );

            addHandlers(
                table,
                table.main,
                'mouseout',
                [
                    {
                        handler: rowOutHandler,
                        matchFn: rowClass
                    },
                    {
                        handler: titleOutHandler,
                        matchFn: titleClass
                    }
                ]
            );

            addHandlers(
                table,
                table.main,
                'click',
                [
                    {
                        handler: rowClickHandler,
                        matchFn: rowClass
                    },
                    {
                        handler: titleClickHandler,
                        matchFn: titleClass
                    },
                    {
                        handler: toggleSelectAll,
                        matchFn: selectAllClass
                    },
                    {
                        handler: rowCheckboxClick,
                        matchFn: multiSelectClass
                    },
                    {
                        handler: selectSingleHandler,
                        matchFn: singleSelectClass
                    }
                ]
            );
        }

        FcTable.prototype = {
            constructor: FcTable,
            // /////////////////////////////
            // 表格属性区
            // /////////////////////////////
            /**
             * 默认属性值
             *
             * @type {Object}
             * @protected
             */
            defaultProperties: {
                /**
                 * 整个表格的最大高度，px为单位，设置为非0值会设置表格区
                 * 的max-height css属性。当表格超高时，会出现竖向滚动条。
                 * @property {number} [tableMaxHeight]
                 * @default 0
                 */
                tableMaxHeight: 0,
                noDataHtml: '没有数据',
                noFollowHeadCache: false,
                followHead: false,
                sortable: false,
                encode: false,
                columnResizable: false,
                rowWidthOffset: -1,
                select: '',
                selectMode: 'box',
                subrowMutex: 1,
                subEntryOpenTip: '点击展开',
                subEntryCloseTip: '点击收起',
                subEntryWidth: 18,
                breakLine: false,
                hasTip: false,
                hasSubrow: false,
                tipWidth: 18,
                sortWidth: 9,
                fontSize: 13,
                colPadding: 8,
                zIndex: 0
            },            
            /**
             * 控件类型
             *
             * @type {string}
             */
            type: 'FcTable',            
            // /////////////////////////////
            // template区
            // /////////////////////////////
            /**
             * 表格总的template
             * @type {String}
             */
            tableTemplate:
                    '<table class="${tableClassName}">'
                +       '<thead id="${thId}" class="${thClassName}"></thead>'
                +       '<tbody id="${tbId}" class="${tbClassName}"></tbody>'
                +       '<tfoot id="${tfId}" class="${tfClassName}"></tfoot>'
                +   '</table>',
            /**
             * 表头TH的tempate
             * @type {string}
             */
            thTemplate: '<th class="${className}">${content}</th>',

            /**
             * 表头TH内容的template
             * @type {string}
             */
            thContentTemplate:
                '<div class="${className}">${text}</div>${extra}',

            /**
             * 表头TH额外内容的HTML。
             * @type {string}
             */
            thExtraTemplate: 
                '<div class="${className}">${sort}${tip}</div>',

            /**
             * 表格体一行的HTML。
             * @type {string}
             */
            rowHtmlTemplate:
                '<tr class="${className}">${cellsHtml}</tr>',

            /**
             * 表格体一个单元格的HTML。
             * @type {string}
             */
            cellHtmlTemplate:
                '<td class="${className}">${content}</td>',

            /**
             * 表格体单元格基本内容的HTML。
             * @type {String}
             */
            cellContentTemplate:
                '<div class="${className}">${text}</div>${extra}',

            /**
             * 单元格额外内容的HTML。
             * @type {string}
             */
            cellExtraTemplate: 
                '<div class="${className}">${content}</div>',

            // /////////////////////////////
            // typedef区
            // /////////////////////////////

            /**
             * 表示一个表格field的对象。由this.initFields方法生成
             * @typedef {Object} FcTable~field
             * @property {FcTable~content} content
             * @property {FcTable~content} extraContent
             */
            
             /**
             * Callback，取得会标记在表头TH元素上的classes。
             * @callback FcTable~getHeadCellClasses
             * @this {FcTable}
             * @param {number} index 当前行的序号，0开始
             * @return {Array<string>} class名字的Array
             */

            /**
             * Callback，取得表头TH元素的内容。
             * @callback FcTable~getHeadCellContent
             * @this {FcTable}
             * @param {number} index 当前行的序号，0开始
             * @return {Array<string>} HTML片段的Array
             *         HTML片段会拼接在一起并在前后加上TH标记。
             */
            
            /**
             * Callback，取得会标记在本行TR元素上的class。
             * @callback FcTable~getRowClasses
             * @this {FcTable}
             * @param {Object} data 当前行的数据
             * @param {number} index 当前行的序号，0开始
             * @return {Array<string>} class名字的Array
             */

            /**
             * Callback，取得会标记在本行TR元素上的attributes。暂时没有用。
             * @callback FcTable~getRowAttributes
             * @param {Object} data 当前行的数据
             * @param {number} index 当前行的序号，0开始
             * @return {Object}
             *         attributes的Object，以attribute名字为key，值为value。
             */

            /**
             * Callback，取得本行的HTML。
             * @callback FcTable~getRowInnerHtml
             * @this {FcTable}
             * @param {Object} data 当前行的数据
             * @param {number} index 当前行的序号，0开始
             * @return {Array<string>} HTML片段的Array
             *         HTML片段会拼接在一起并在前后加上TR标记。
             */

            /**
             * Callback，在FcTable~field中定义，返回当前单元格应显示的HTML。
             * @callback FcTable~content
             * @this {FcTable}
             * @param {Object} data 本行要显示的数据
             * @param {number} rowIndex 本行序号，0起始
             * @param {number} columnIndex 本列序号，0起始
             * @return {string} 本行的HTML
             *         默认的getCellHtml实现会将HTML包裹在一个DIV中
             */
            
            /**
             * Callback，取得会标记在本单元格元素上的class。
             * @callback FcTable~getCellClasses
             * @this {FcTable}
             * @param {Object} data 当前行的数据
             * @param {number} rowIndex 当前行的序号，0开始
             * @param {number} columnIndex 当前列的序号，0开始
             * @param {number} fieldsLength 总列数
             * @param {FcTable~field} field 当前列的field对象
             * @return {Array<string>} class名字的Array
             */

            /**
             * Callback，取得本单元格的HTML。
             * @callback FcTable~getCellHtml
             * @this {FcTable}
             * @param {Object} data 当前行的数据
             * @param {number} rowIndex 当前行的序号，0开始
             * @param {number} columnIndex 当前列的序号，0开始
             * @param {FcTable~field} 本单元格的field对象
             * @return {string} HTML的string。不能包含最外围的TD标签。
             */                 

            // /////////////////////////////
            // private/protected 函数区
            // /////////////////////////////
            /**
             * 获取表格相关ID
             *
             * @public
             * @param {number} id
             * @return {string}
             */
            getId: function (name) {
                return helper.getId(this, name);
            },

            /**
             * 获取列表头容器元素
             *
             * @public
             * @return {HTMLElement}
             */
            getHead: function () {
                return lib.g(this.getId('thead'));
            },

            /**
             * 绘制表格头
             * @protected
             */
            renderHead: function () {
                if (this.noHead) {
                    return;
                }

                var fields = this.realFields;
                var html = '';
                var me = this;
                var headBuilder = this.getHeadBuilder();
                u.each(fields, function (field, index) {
                    html += lib.format(me.thTemplate, {
                        className:
                            headBuilder.getHeadCellClasses
                                .call(me, index).join(' '),
                        content:
                            headBuilder.getHeadCellContent
                                .call(me, index)
                    })
                });
                html = '<tr>' + html + '</tr>';
                this.getHead().innerHTML = html;
            },

            /**
             * 返回表格头的builder。
             * @return {Object} headBuilder
             * @property {FcTable~getHeadCellClasses} getHeadCellClasses
             * @property {FcTable~getHeadCellContent} getHeadCellContent
             */
            getHeadBuilder: function() {
                return this.getDefaultHeadBuilder();
            },

            getDefaultHeadBuilder: function () {
                if (!this._defaultHeadBuilder) {
                    this._defaultHeadBuilder = {
                        getHeadCellClasses: this.defaultGetHeadCellClasses,
                        getHeadCellContent: this.defaultGetHeadCellContent
                    };
                }

                return this._defaultHeadBuilder;
            },

            /**
             * 默认的返回表头TH元素上的classes。
             * 默认获得-hcell。
             * 第一个获得-hcell-first。
             * 最后一个获得-hcell-last。
             * @see {FcTable~getHeadCellClasses}
             * @param  {number} index 当前列号，0起始
             * @return {Array<string>} class名字的Array
             */
            defaultGetHeadCellClasses: function (index) {
                var classes = helper.getPartClasses(this, 'hcell');
                if (index === 0) {
                    classes = classes.concat(
                        helper.getPartClasses(this, 'hcell-first')
                    );
                } else if (index === this.realFields.length - 1) {
                    classes = classes.concat(
                        helper.getPartClasses(this, 'hcell-last')
                    );                    
                }

                return classes;
            },

            /**
             * 默认的获得一个表头TH元素内容的方法。
             * @see FcTable~getHeadCellContent
             * @this {FcTable}
             * @param {number} index 当前行的序号，0开始
             * @return {Array<string>} HTML片段的Array
             *         HTML片段会拼接在一起并在前后加上TH标记。
             */
            defaultGetHeadCellContent: function (index) {
                var field = this.realFields[index];
                // 获得content
                var title = field.title;
                var contentHtml;
                // 计算内容html
                if (typeof title == 'function') {
                    contentHtml = title.call(this);
                } else {
                    contentHtml = title;
                }
                if (isNullOrEmpty(contentHtml)) {
                    contentHtml = '&nbsp;';
                }
                // 获得表头额外内容：排序和tip
                var extra = '';
                return lib.format(this.thContentTemplate, {
                    extra: extra,
                    text: contentHtml,
                    className: this.getClass('hcell-text')
                });
            },

            /**
             * 绘制表格体
             * @protected
             */
            renderBody: function () {
                this.getBody().innerHTML = this.getBodyHtml();

                this.fire('bodyChange');
            },

            /**
             * 获取表格主体的html
             *
             * @protected
             * @return {string}
             */
            getBodyHtml: function () {
                var data = this.datasource || [];
                var dataLen = data.length;
                var html = [];

                if (!dataLen) {
                    return lib.format(
                        noDataHtmlTpl,
                        {
                            className: getClass(this, 'body-nodata'),
                            html: this.noDataHtml
                        }
                    );
                }

                for (var i = 0; i < dataLen; i++) {
                    var item = data[i];
                    html.push(this.getRowHtml(item, i, dataLen));
                }

                return html.join('');
            },

            /**
             * 返回默认的rowBuilder。
             * @return {Object}
             * @property {Function} getRowClasses
             *           返回defaultGetRowClasses
             * @property {Function} getRowInnerHtml
             *           返回defaultGetRowInnerHtml
             */
            getDefaultRowBuilder: function () {
                if (!this._defaultRowBuilder) {
                    this._defaultRowBuilder = {
                        getRowClasses: this.defaultGetRowClasses,
                        getRowInnerHtml: this.defaultGetRowInnerHtml
                    };
                }

                return this._defaultRowBuilder;
            },

            /**
             * 根据当前行的data和index，返回一个rowBuilder对象。
             * 这个方法在每个行绘制前都会调用一次，若重写，不可以有重的运算。
             * 默认情况下会返回this.getDefaultRowBuilder。
             * @param  {Array} data 当前行要绘制的数据集
             * @param  {number} index 当前行序号，0为起始
             * @return {Object} rowBuilder
             * @property {FcTable~getRowClasses} rowBuilder.getRowClasses
             * @property {FcTable~getRowInnerHtml} rowBuilder.getRowInnerHtml
             */
            getRowBuilder: function (data, index) {
                return this.getDefaultRowBuilder();
            },
            
            /**
             * 默认的row classes。
             * 基本行会附加 -row。
             * 奇数行附加 -row-odd。
             * 偶数行附加 -row-even。
             * 最后一行附加 -row-last。
             * 
             * @see FcTable~getRowClasses
             * @this {FcTable}
             * @param {Object} data 当前行的数据
             * @param {number} index 当前行的序号，0开始
             * @param {number} length 目前表格的总行数
             * @return {Array<string>} class名字的Array
             */
            defaultGetRowClasses: function (data, index, length) {
                var classes = helper.getPartClasses(this, 'row')
                    .concat(
                        index % 2 == 0
                            ? helper.getPartClasses(this, 'row-even')
                            : helper.getPartClasses(this, 'row-odd')
                    );
                if (index === length - 1) {
                    classes.push(
                        helper.getPartClasses(this, 'row-last').join(' ')
                    );
                }
                return classes;
            },

            /**
             * @see FcTable~getRowInnerHtml
             * @param {Object} data 当前行的数据
             * @param {number} index 当前行的序号，0开始
             * @return {Array<string>} HTML片段的Array
             */
            defaultGetRowInnerHtml: function (data, index) {
                var html = [];
                var fields = this.realFields;
                var fieldsLength = fields.length;
                var me = this;
                u.each(fields, function (field, columnIndex) {
                    var cellBuilder = me.getCellBuilder(
                        data, index, columnIndex, field
                    );
                    var cellClasses = cellBuilder.getCellClasses.call(
                        me, data, index, columnIndex, fieldsLength, field
                    );
                    var cellContent = cellBuilder.getCellHtml.call(
                        me, data, index, columnIndex, field
                    );
                    html.push(
                        lib.format(me.cellHtmlTemplate, {
                            className: cellClasses.join(' '),
                            content: cellContent
                        })
                    );
                });
                return html;
            },

            /**
             * 获取表格行的html
             *
             * @protected
             * @param {Object} data 当前行的数据
             * @param {number} index 当前行的序号
             * @param {number} length 总行数
             * @return {string}
             */
            getRowHtml: function (data, index, length) {
                // 先取得当前行的builder
                var rowBuilder = this.getRowBuilder(data, index);
                // 当前行的classes
                var rowClasses = rowBuilder.getRowClasses.call(
                    this, data, index, length);
                // 当前行的inner HTML
                var rowInnerHtml = rowBuilder.getRowInnerHtml.call(
                    this, data, index);
                // 拼接整行的HTML
                return lib.format(this.rowHtmlTemplate, {
                    className: rowClasses.join(' '),
                    cellsHtml: rowInnerHtml.join('')
                });
            },

            /**
             * 取得cell的builder。默认返回this.getDefaultCellBuilder。
             * @param  {Object} data 当前行的数据
             * @param  {number} rowIndex 当前行的行号，0起始
             * @param  {number} columnIndex 当前行的列号，0起始
             * @param  {FcTable~field} field 当前列的field对象
             * @return {Object} cellBuilder
             * @property {FcTable~getCellClasses} cellBuilder.getCellClasses
             * @property {FcTable~getCellHtml} cellBuilder.getCellHtml
             */
            getCellBuilder: function (data, rowIndex, columnIndex, field) {
                return this.getDefaultCellBuilder();
            },

            /**
             * @return {Object}
             * @property {Function} getCellClasses
             *           返回defaultGetCellClasses
             * @property {Function} getCellHtml
             *           返回defaultGetCellHtml
             */
            getDefaultCellBuilder: function () {
                if (!this._defaultCellBuilder) {
                    this._defaultCellBuilder = {
                        getCellClasses: this.defaultGetCellClasses,
                        getCellHtml: this.defaultGetCellHtml
                    };
                }
                return this._defaultCellBuilder;
            },

            /**
             * 默认的获取单元格class的方法。
             * 每个单元格获得 -cell。
             * 第一个单元格获得-cell-first。
             * 最后一个单元格获得 -cell-last。
             * 
             * @see FcTable~getCellClasses
             * @this {FcTable}
             * @param {Object} data 当前行的数据
             * @param {number} rowIndex 当前行的序号，0开始
             * @param {number} columnIndex 当前列的序号，0开始
             * @param {number} fieldsLength 总列数
             * @param {FcTable~field} field 当前列的field对象
             * @return {Array<string>} class名字的Array
             */            
            defaultGetCellClasses: function (
                data, rowIndex, columnIndex, fieldsLength, field
            ) {
                var classes = helper.getPartClasses(this, 'cell');
                if (columnIndex === 0) {
                    classes.push(
                        helper.getPartClasses(this, 'cell-first').join(' ')
                    );                    
                }
                if (columnIndex === fieldsLength - 1) {
                    classes.push(
                        helper.getPartClasses(this, 'cell-last').join(' ')
                    );
                }
                return classes;
            },

            /**
             * 默认的获取单元格内内容的方法。
             * 调用field.content，获得cell的文字内容，显示在
             * div.{-cell-text}内。
             * 如果没有field.content，会尝试画出data[content]。
             * 调用field.extraContent，获得额外的内容，显示在
             * div.{-cell-extra}内。如果没有额外的内容，div.{-cell-extra}
             * 不会画出来。
             * 
             * @see FcTable~getCellHtml
             * @this {FcTable}
             * @param {Object} data 当前行的数据
             * @param {number} rowIndex 当前行的序号，0开始
             * @param {number} columnIndex 当前列的序号，0开始
             * @param {FcTable~field} 本单元格的field对象
             * @return {string} HTML的string。不能包含最外围的TD标签。
             */
            defaultGetCellHtml: function (
                data, rowIndex, columnIndex, field
            ) {
                // 先生成基本的content
                var content = field.content;
                var contentHtml = 'function' == typeof content
                    ? content.call(this, data, rowIndex, columnIndex)
                    : (this.encode
                        ? lib.encodeHTML(data[content])
                        : data[content]
                    );
                // 再生成extra
                var extraContent = field.extraContent;
                var extraHtml = 'function' == typeof extraContent
                    ? extraContent.call(this, data, rowIndex, columnIndex)
                    : '';
                // content需要有一个默认值
                if (isNullOrEmpty(contentHtml)) {
                    contentHtml = '&nbsp;';
                }
                // 若没有extra，不生成extra的DIV。
                if (!isNullOrEmpty(extraHtml)) {
                    extraHtml = lib.format(this.cellExtraTemplate, {
                        className: this.getClass('cell-extra'),
                        content: extraHtml
                    });
                }
                return lib.format(this.cellContentTemplate, {
                    className: this.getClass('cell-text'),
                    text: contentHtml,
                    extra: extraHtml
                });
            },
            // /////////////////////////////
            // public 函数区
            // /////////////////////////////
            /**
             * 初始化参数
             *
             * @param {Object} options 构造函数传入的参数
             * @override
             * @protected
             */
            initOptions: function (options) {
                /**
                 * 默认Table选项配置
                 *
                 * @const
                 * @inner
                 * @type {Object}
                 */
                var properties = {};

                u.extend(properties, this.defaultProperties, options);

                this.setProperties(properties);
            },
            /**
             * 初始化DOM结构
             *
             * @override
             * @protected
             */
            initStructure: function() {
                var tableHtml = lib.format(this.tableTemplate, {
                    tableClassName: this.getClass('table'),
                    thClassName: this.getClass('thead'),
                    tbClassName: this.getClass('tbody'),
                    tfClassName: this.getClass('tfoot'),
                    thId: this.getId('thead'),
                    tbId: this.getId('tbody'),
                    tfId: this.getId('tfoot')
                });

                this.main.innerHTML = tableHtml;

                this.realWidth = getWidth(this);
                if (this.realWidth) {
                   // this.main.style.width = this.realWidth + 'px';
                }

                if (this.maxTableHeight !== 0) {
                    this.main.style.maxHeight = this.maxTableHeight;
                    lib.addClasses(this.main,
                        helper.getStateClasses(this, 'has-max-height'));
                }

                resetMainZIndex(this);

                initBaseBuilderList(this);
                initResizeHandler(this);
                initMainEventHandler(this);
            },
            /**
             * 渲染控件
             *
             * @override
             */
            repaint: function (changes, changesIndex) {
                Control.prototype.repaint.apply(this, arguments);
                 // 初始化控件主元素上的行为
                var table = this;
                if (!table.realWidth) {
                    table.realWidth = getWidth(table);
                    if (table.realWidth) {
                        table.main.style.width = table.realWidth + 'px';
                    }
                }
                var defaultProperties = this.defaultProperties;
                var allProperities = {};

                if (!changes) {
                    for (var property in defaultProperties) {
                        if (defaultProperties.hasOwnProperty(property)) {
                            allProperities[property] = true;
                        }
                    }
                }
                // 局部渲染
                else {
                    for (var i = 0; i < changes.length; i++) {
                        var record = changes[i];
                        allProperities[record.name] = true;
                    }
                }

                var fieldsChanged = false;
                var colsWidthChanged = false;
                var tbodyChange = false;

                if (allProperities.fields
                    || allProperities.select
                    || allProperities.selectMode
                    || allProperities.sortable
                ) {
                    initFields(table);
                    fieldsChanged = true;
                }
                 if (fieldsChanged
                    || allProperities.breakLine
                    || allProperities.colPadding
                    || allProperities.fontSize
                ) {
                    initMinColsWidth(table);
                    initColsWidth(table);
                    colsWidthChanged = true;
                }
                if (fieldsChanged
                    || colsWidthChanged
                    || allProperities.noHead
                    || allProperities.order
                    || allProperities.orderBy
                    || allProperities.selectedIndex
                ) {
                    this.renderHead();
                }
                if (allProperities.followHead
                    || allProperities.noFollowHeadCache) {
                    initFollowHead(table);
                }
                if (fieldsChanged
                    || colsWidthChanged
                    || allProperities.encode
                    || allProperities.noDataHtml
                    || allProperities.datasource
                    || allProperities.selectedIndex
                ) {
                    this.renderBody();
                    tbodyChange = true;
                }
                if (tbodyChange
                    || allProperities.bodyMaxHeight) {
                    // updateBodyMaxHeight(table);
                }
                if (fieldsChanged
                    || colsWidthChanged
                    || allProperities.foot
                ) {
                    // renderFoot(table);
                }

                this.extraRepaint = helper.createRepaint([
                    {
                        name: 'disabled',
                        paint: setDisabledStyle
                    },
                    {

                        name: 'width',
                        paint: handleResize
                    },
                    {
                        name: 'zIndex',
                        paint: resetMainZIndex
                    }
                ]);
                // this.extraRepaint(changes, changesIndex);

                // 如果未绘制过，初始化resize处理
                if (tbodyChange
                    && helper.isInStage(this, 'RENDERED')) {
                    // 重绘时触发onselect事件
                    switch (this.select) {
                        case 'multi':
                            setSelectedIndex(this, []);
                            this.fire(
                                'select',
                                { selectedIndex: this.selectedIndex }
                            );
                            break;
                    }
                }
            },

            /**
             * 获取列表体容器素
             *
             * @public
             * @return {HTMLElement}
             */
            getBody: function () {
                return lib.g(this.getId('tbody'));
            },

            /**
             * 获取表格相关ClassName
             *
             * @protected
             * @param {string} name
             * @return {string}
             */
            getClass: function(name) {
                return helper.getPartClasses(this, name).join(' ');
            },

            /**
             * 初始化表格体子控件
             *
             * @protected
             * @param {number} index
             * @param {Object} options
             */
            getRow: function(index) {
                return getRow(this, index);
            },

            /**
             * 添加表格插件
             *
             * @protected
             * @param {Array} builders
             */
            addRowBuilders: function(builders) {
                addRowBuilderList(this, builders);
            },

            /**
             * 添加table主元素上事件委托
             *
             * @public
             * @param {string} eventType 事件类型
             * @param {Array} handlers 处理函数数组或单个函数
             *
             * @return {Array} 事件委托处理函数数组
             */
            addHandlers: function(eventType, handlers) {
                if (!handlers.length) {
                    handlers = [handlers];
                }

                return addHandlers(this, this.main, eventType, handlers);
            },

            /**
             * 删除table主元素上事件委托
             *
             * @public
             * @param {string} eventType 事件类型
             * @param {Array} handlers 处理函数数组或单个函数
             */
            removeHandlers: function(eventType, handlers) {
                if (!handlers.length) {
                    handlers = [handlers];
                }

                removeHandlers(this, this.main, eventType, handlers);
            },

             /**
             * 自适应表格宽度
             *
             * @public
             */
            adjustWidth: function(){
                handleResize(this);
            },

            /**
             * 设置Table的datasource，并强制更新
             *
             * @public
             */
            setDatasource: function(datasource){
                this.datasource = datasource;
                setSelectedIndex(this, []);
                var record = { name: 'datasource' };
                var record2 = { name: 'selectedIndex' };

                this.repaint([record, record2],
                    {
                        datasource: record,
                        selectedIndex: record2
                    }
                );
            },

             /**
             * 获取Table的选中数据项
             *
             * @public
             */
            getSelectedItems: function() {
                var selectedIndex = this.selectedIndex;
                var result = [];
                if(selectedIndex) {
                    var datasource = this.datasource;
                    if (datasource) {
                        for (var i = 0; i < selectedIndex.length; i++) {
                            result.push(datasource[selectedIndex[i]]);
                        }
                    }
                }
                return result;
            },

            /**
             * 设置行选中
             *
             * @param {Number}/{Array} index
             * @param {Boolean} isSelected
             * @public
             */
            setRowSelected: function(index, isSelected) {
                var table = this;
                var isMutil = table.select === 'multi';
                var selectedHandler = isMutil ? selectMulti : selectSingle;

                if (u.isArray(index)) {
                    if (isMutil) {
                        u.each(index, function(value){
                            selectedHandler(table, value, isSelected);
                        });
                    } else {
                        selectedHandler(table, index[0], isSelected);
                    }
                } else {
                    selectedHandler(table, index, isSelected);
                }

                if (isMutil) {
                    resetMutilSelectedStatus(table);
                }
            },

            /**
             * 设置所有行选中
             *
             * @param {Boolean} isSelected
             * @public
             */
            setAllRowSelected: function(isSelected) {
                this.setRowSelected(-1, isSelected);
            },

            /**
             * 重置表头跟随设置
             *
             * @public
             */
            resetFollowHead: function(){
                resetFollowHead(this);
            },

            /**
             * 销毁释放控件
             *
             * @override
             */
            dispose: function () {
                if (helper.isInStage(this, 'DISPOSED')) {
                   return;
                }

                helper.beforeDispose(this);
                var main = this.main;
                if (main) {
                    // 释放表头跟随的元素引用
                    this.followDoms = null;
                }

                helper.dispose(this);
                helper.afterDispose(this);
            }
        };

        lib.inherits(FcTable, Control);
        require('esui/main').register(FcTable);

        return FcTable;
    }
);
