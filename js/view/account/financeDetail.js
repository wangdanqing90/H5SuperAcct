/**
 * Created by Yilia on 2018/4/24.
 * 我的资金明细
 */

var access_token = $.cookie('ccat');
var user = $.getUser();
var userId = user.id;

$(function(){

    //console.log(access_token,user,userId);
    $("#headName").text("我的资金明细");


})

//点击头部账单到账单页面
function intoBill(){
    window.location.href = '/view/account/bill.html';
}

function switchPage(type){
    currentPage = 1;
    if ("Profit" === type) {
        //收益
        //status = "status=SETTLED&status=OVERDUE&status=BREACH";
        $(".Profit").addClass('active');
        $(".Recharge").removeClass('active');
        $(".Forward").removeClass('active');
        $(".profit-list").removeClass('uhide').addClass('ushow');
        $(".recharge-list").removeClass('ushow').addClass('uhide');
        $(".forward-list").removeClass('ushow').addClass('uhide');
    } else if ("Recharge" === type) {
        //充值
        //status = "status=FINISHED&status=PROPOSED&status=FROZEN";
        $(".Profit").removeClass('active');
        $(".Recharge").addClass('active');
        $(".Forward").removeClass('active');
        $(".profit-list").removeClass('ushow').addClass('uhide');
        $(".recharge-list").removeClass('uhide').addClass('ushow');
        $(".forward-list").removeClass('ushow').addClass('uhide');
    } else if ("Forward" === type) {
        //提现
        //status = "status=CLEARED";
        $(".Profit").removeClass("active");
        $(".Recharge").removeClass("active");
        $(".Forward").addClass("active");
        $(".profit-list").removeClass('ushow').addClass('uhide');
        $(".recharge-list").removeClass('ushow').addClass('uhide');
        $(".forward-list").removeClass('uhide').addClass('ushow');
    }
    //filp(type);
}

function backClick(){
    window.history.back(-1);
}