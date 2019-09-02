/**
 * Created by Yilia on 2018/4/25.
 * 我的转让
 */


var access_token = $.cookie('ccat');
var user = $.getUser();
var userId = user.id;
var currentPage = 1;
var size = '';
$(function(){
    $("#headName").text("我的转让");
})

//点击我要转让进入转让详情页面
function intoDetail(){
    window.location.href = '/view/account/transferDetail.html'
}

function switchPage(type){
    currentPage = 1;
    if ("Hold" === type) {
        //持有中
        status = "status=SETTLED&status=OVERDUE&status=BREACH";
        $(".Hold").addClass('active');
        $(".Transferring").removeClass('active');
        $(".Transferred").removeClass('active');
        $(".HaveBeenTransferred").removeClass("active");
    } else if ("Transferring" === type) {
        //申请中
        status = "status=FINISHED&status=PROPOSED&status=FROZEN";
        $(".Hold").removeClass('active');
        $(".Transferring").addClass('active');
        $(".Transferred").removeClass('active');
        $(".HaveBeenTransferred").removeClass("active");
    } else if ("Transferred" === type) {
        //已结清
        status = "status=CLEARED";
        $(".Hold").removeClass("active");
        $(".Transferring").removeClass("active");
        $(".Transferred").addClass("active");
        $(".HaveBeenTransferred").removeClass("active");
    }
    else if ("HaveBeenTransferred" === type) {
        //已取消
        status = "status=CANCELED_BY_USER";
        $(".Hold").removeClass("active");
        $(".Transferring").removeClass("active");
        $(".Transferred").removeClass("active");
        $(".HaveBeenTransferred").addClass("active");
    }
}
function backClick(){
    window.history.back(-1);
}