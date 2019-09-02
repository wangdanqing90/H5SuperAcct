/**
 * Created by Yilia on 2018/4/23.
 * 我的银行卡
 *
 */
var access_token = $.cookie('ccat');
var user = $.getUser();
var userId = user.id;

$(function(){

    //console.log(access_token,user,userId);
    $("#headName").text("我的银行卡");

    $(".noLogin2").css("height",$(document).height()-44);

    fundAccount();
})

//查询绑卡记录
function fundAccount(){
    var url = '/api/v2/user/'+userId+'/fundaccounts?access_token='+access_token;
    //console.log("url:"+url);
    $.ajax({
        url: url,
        contentType: "application/x-www-form-urlencoded",
        dataType: 'json',
        type: 'GET',
        async:false,
        success: function(data) {
            var resStr = JSON.stringify(data)
            console.log("resStr:"+resStr);
            var account = data[0].account;

            $("#cardNo").text(formatCardNo(account.account));
            $("#account").text(formatName(account.name));
            $("#bankMobile").text(formatCardNo(account.bankMobile));

            var bankCode = account.bank;
            var bankImg = '<span class="card bank-'+ $.bank[bankCode].classNo+'"></span>';
            $("#funBank").append(bankImg)

            //$(".test").html(bankImg)
            //if(data.length === 0){
            //    console.log(data);
            //}else{
            //
            //}

        },
        error: function(e){
            console.log("error:"+e);
        }
    });
}

function formatName(str){
    if(str.length>2){
        var reg = /^(\d{1})\d+(\d{1})$/;
        str = str.replace(reg, "$1*$2");
        console.log("str1:"+str);
    }else{
        var reg = str.substring(str.length-1,str.length);
        str = '*'+reg;
        //console.log("str2:"+str);
    }
    return str;
}

function formatCardNo(str){
    var reg = /^(\d{3})\d+(\d{4})$/;
    str = str.replace(reg, "$1****$2");
    //console.log("str:"+str);
    return str;
}

/**点击解除绑定按钮--显示弹窗*/
$('#unbindBankCardBtn').on('click', function () {
    $("#fdc").css('display','block');

});
//暂不解除绑定--隐藏弹窗
$('#closeTip').on('click', function () {
    $("#fdc").css('display','none');
    //window.location.href = '/view/account/unbindSuccess.html?'+1;

});

//解除绑定银行卡
function unbindBankCard(){
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
                //$("#banding-card").css("display","block");
                window.location.href = '/view/account/unbindSuccess.html?'+1;
            }else{
                //$.alert("解绑失败！");
                window.location.href = '/view/account/unbindSuccess.html?'+2;
            }
        },
        error:function(e){
            console.log("error:"+e);
        }
    });
}

function backClick(){
    window.history.back(-1);
}