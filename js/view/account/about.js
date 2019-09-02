/**
 * Created by Yilia on 2018/4/23.
 * 关于
 */


var access_token = $.cookie('ccat');
var user = $.getUser();
var userId = user.id;

$(function(){

    //console.log(access_token,user,userId);
    $("#headName").text("关于");

		
})


function backClick(){
    window.history.back(-1);
}