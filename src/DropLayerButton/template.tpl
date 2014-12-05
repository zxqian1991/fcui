<!-- target: library-framwork-ui-dropLayerButton -->
<div class="ui-droplayerbutton-container">
    <div class="${titleClass}" >
        ${title|raw}
        <div id="${closeId}" class="${closeIconClass}">
            <i></i>
        </div>
    </div>
    <div class="${contentClass}" id="${contentId}" >
        ${content|raw}
    </div>
    <div class="${footerClass}">
        <div data-ui-type="Button" data-ui-child-name="confirmBtn" class="skin-ui-fc-important-button ui-droplayerbutton-confirm" >确定</div>
        <div data-ui-type="Button" data-ui-child-name="cancelBtn">取消</div>
    </div>
</div>
