/**
 * Created by Yilia on 2018/4/27.
 * 信息绑定，选择物业
 */


var access_token = $.cookie('ccat');
var user = $.getUser();
var userId = user.id;
var currentPage = 1;
var size = '';

$(function(){
    $("#headName").text("选择物业");
})


function backClick(){
    window.history.back(-1);
}
