/**
 * Created by Yilia on 2018/4/26.
 * 我的转让-->转让详情
 */


var access_token = $.cookie('ccat');
var user = $.getUser();
var userId = user.id;
var currentPage = 1;
var size = 10;
$(function(){
    $("#headName").text("我的转让");
})

function backClick(){
    window.history.back(-1);
}