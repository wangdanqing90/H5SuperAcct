/**
 * Created by Yilia on 2018/5/10.
 * 天金所-->查看协议
 */

//var access_token = $.cookie('ccat');
//var user = $.getUser();
//var userId = user.id;

$(function(){
	$.setTitle('中民超级会员');
    $("#headName").text("查看协议");

    if(getUrlParam('agreement') == 'risk'){
        $("#risk").addClass('ushow');
        $("#membership").addClass('uhide');
    }else{
        $("#risk").addClass('uhide');
        $("#membership").addClass('ushow');
    }

})

//截取url中的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
function backClick(){
    window.history.back(-1);
}