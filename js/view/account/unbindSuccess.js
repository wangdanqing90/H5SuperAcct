/**
 * Created by Yilia on 2018/4/23.
 */

var access_token = $.cookie('ccat');
var user = $.getUser();
var userId = user.id;

$(function(){

    //console.log(access_token,user,userId);
    $("#headName").text("解绑结果");

    //url带的参数是1解绑成功，参数是2解绑失败
    var r = window.location.search;
    var status = r.split("?")[1]
    console.log(status);
    if(status == 1){
        $("#successShow").css('display','block');
    }else{
        $("#failShow").css('display','block');
    }

})


//解除绑定银行卡
function againUnbind(){
    console.log('解除绑定')
    var userFund =  $.getUserFund();
    if((!userFund.availableAmount == 0) || (!userFund.frozenAmount == 0) || (!userFund.outstandingPrincipal == 0) ){
        $.alert("总资金必须为0才能解绑，如有疑问请联系客服！");
        return false;
    }

    var account = $("#account").val();
    var url = '/api/v2/user/'+userId+'/cancelDefaultAccount/'+account+'?access_token='+access_token;

    $.ajax({
        url: url,
        contentType: "application/x-www-form-urlencoded",
        type: 'GET',
        success:function(data){
            $("#fdc").css('display','none');
            if(data){
                //$.alert("解绑成功！");
                $("#successShow").css('display','block');
                $("#failShow").css('display','none');
            }else{
                //$.alert("解绑失败！");
                $("#successShow").css('display','none');
                $("#failShow").css('display','block');
            }
        },
        error:function(e){
            console.log("error:"+e);
        }
    });
}

/**点击解除绑定按钮--显示弹窗*/
$('.end-btn').on('click', function () {
    //window.location.href = '/view/account/unbindSuccess.html';
    $.alert("连接到个人中心！");

});
/**点击解除绑定按钮--显示弹窗*/
$('#unbindBankCardBtn').on('click', function () {
    $("#fdc").css('display','block');

});
//暂不解除绑定--隐藏弹窗
$('#closeTip').on('click', function () {
    $("#fdc").css('display','none');
    window.location.href = '/view/account/unbindSuccess.html?'+1;

});

function backClick(){
    window.history.back(-1);
}