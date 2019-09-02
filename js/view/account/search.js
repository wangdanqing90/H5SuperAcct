/**
 * Created by Yilia on 2018/4/24.
 * 日期筛选
 */

var access_token = $.cookie('ccat');
var user = $.getUser();
var userId = user.id;

$(function(){

})

/**按时间查询//选择日期后保存选择的日期，返回账单页面*/
$('#confirm').on('click', function () {
    if (!$("#startDate").val().length || !$("#endDate").val().length) {
        $.alert("起始时间或结束时间不能为空");
        return false;
    }
    startDate = Date.parse($("#startDate").val());

    endDate = new Date($("#endDate").val());

    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);

    endDate = Date.parse(endDate);

    if (startDate > endDate) {
        $.alert("结束时间不能早于开始时间！");
        return;
    }
    console.log(startDate, endDate)
    window.location.href = '/view/account/bill.html?startDate='+ startDate + '&endDate=' +endDate;

});


function backClick(){
    window.history.back(-1);
}