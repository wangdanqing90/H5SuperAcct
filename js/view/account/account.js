/**
 * 个人中心首页
 * Created by Yilia on 2018/4/19.
 */
    //个人基本资金账户信息
var fundData = $.getUserFund();
fundData.totalFund =fundData.availableAmount+fundData.frozenAmount+fundData.outstandingPrincipal;

var access_token = $.cookie('ccat');
var user = $.getUser();
var userId = user.id;

$(function(){
    console.log(fundData);
    $("#amount").html(fundData.totalFund);
    $("#balance").html(fundData.availableAmount);
    $("#freezingAmount").html(fundData.frozenAmount);
    $("#outstandingPrincipal").html(fundData.outstandingPrincipal);
    $("#outstandingInterest").html(fundData.outstandingInterest);

    var getUserSurvy = getUserSurvyInfo();
    $("#rankStr").html(getUserSurvy.rankStr);


})


/*已绑定银行卡到bankCard.html页面，没绑定到addBankCard.html页面绑定银行卡*/
$('.operate-addBankCard').click(function(){
    var url = '/api/v2/user/'+userId+'/fundaccounts?access_token='+access_token;
    $.ajax({
        url: url,
        contentType: "application/x-www-form-urlencoded",
        dataType: 'json',
        type: 'GET',
        async:false,
        success: function(data) {
            var resStr = JSON.stringify(data)
            console.log("resStr:"+data);
            if(data.length === 0){
                window.location.href = "/view/account/addBankCard.html";
            }else{
                window.location.href = "/view/account/bankCard.html";
            }
        },
        error: function(e){
            console.log("error:"+e);
        }
    });
});

$(".header-pic").click(function(){
    window.location.href = "/view/myAccount/personalSet/index.html";
});

/**
 * 方法名称:getUserSurvyInfo
 * 方法描述:获取用户问卷调查信息数据
 */
function getUserSurvyInfo(){
    /** ①获得用户信息和token,拼接校验答卷状态请求url */
    var userInfo = JSON.parse($.cookie('user'));
    var access_token = $.cookie('ccat');
    var evaluatePaperCheckUrl = '/api/v2/user/' + userInfo.id + '/surveyFilling?access_token=' + access_token;
    var evalatePaperJsonLast = null;

    /** ② 想后台送查询请求,请求当前用户答卷状态 */
    $.ajax({
        type:'get',
        url:evaluatePaperCheckUrl,
        dataType:'json',
        async:false,
        success: function (results) {
            if(results.length > 0){
                console.log(results)
                evalatePaperJsonLast = results[0];
                //accountRactive.set("risk.evalatePaperJsonLast", evalatePaperJsonLast);
                //$.session.evalatePaperJsonLast = evalatePaperJsonLast;
            }
        },
        error:function(error){
            console.log('系统处理出现错误...');
        }
    });
    return evalatePaperJsonLast;
}

function link(type,ele){
    switch (type)
    {
        case 'withdraw':
            location.href='/view/account/withdraw.html';
            break;
        case 'recharge':
            location.href='/view/account/recharge.html';
            break;
        case 'finance':
            location.href='/view/account/finance.html';
            break;
        case 'transfer':
            location.href='/view/account/transfer.html';
            break;
        case 'privilegedProducts':
            location.href='/view/account/privilegedProducts.html';
            break;
        case 'financeDetail':
            location.href = "/view/account/financeDetail.html";
            break;
        case 'manager':
            location.href='/view/account/propertyManager.html';
            break;
        case 'informateBind':
            location.href='/view/account/informateBind.html';
            break;
        case 'scraperCard':
            location.href = "/view/account/scraperCard.html";
            break;
        case 'result':
            location.href = "/view/account/result.html";
            break;
        case 'help':
            location.href='/view/externalDocking/authorization.html';
            break;
        case 'about':
            location.href = "/view/account/about.html";
            break;
    }
}



//隐藏浮动层
function closeTip(){
    $("#fdc").css("display",'none');
}

