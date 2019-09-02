/**
 * 问卷调查结果
 * Created by Yilia on 2018/4/20.
 */

var access_token = $.cookie('ccat');
var user = $.getUser();
var userId = user.id;

$(function(){
    //解绑财富小i弹出层的高为当前窗口的高度
    console.log($(document).height())
    $(".noLogin2").css("height",$(document).height()-44);

    var getUserSurvy = getUserSurvyInfo();
    if(getUserSurvy){//有测试数据显示测试结果
        console.log(getUserSurvy);
        var timeOut = getUserSurvy.timeOut; //两次评估间隔时间默认365
        /** ① 获得上次预估时间 */
        var lastEvaLong = getUserSurvy.timeLastUpdated;
        var lastEvaDate = new Date(lastEvaLong);
        lastEvaDate = lastEvaDate.format('yyyy年MM月dd日 HH:mm');

        /** ② 获得下次预估时间*/
        var nextEvaLong = moment(lastEvaLong).add(Number(timeOut),'days');
        var nextEvaDate = new Date(nextEvaLong);
        nextEvaDate = nextEvaDate.format('yyyy年MM月dd日 HH:mm');

        /*评估类型的结果*/
        var rank = computeRankStr(getUserSurvy.rank)

        $("#hadSurvey").css('display','block');
        $("#noSurvey").css('display','none');
        $("#rankStr").html(rank);
        $("#lastEvaDate").html(lastEvaDate);
        $("#nextEvaDate").html(nextEvaDate);
    }else{//无测试数据
        console.log("2");
        $("#hadSurvey").css('display','none');
        $("#noSurvey").css('display','block');

    }
    //重新开始测试
    $("#resetBtn").on('click',function(){
        window.location.href = '/view/account/survey.html';
    })
    //没有测试，开始测试
    $("#startSurvey").on('click',function(){
        window.location.href = '/view/account/survey.html';
    })

})

/**
 * 方法名称:computerankStr
 * 方法描述:依据得分确定用户风险级别
 * @param type 类型编码
 * @returns {string} 用户风险级别
 */
function computeRankStr(type){
    var rankStr = '';
    if(type =='LOW'){
        rankStr="保守型";
    }else if( type =='LOW_MEDIUM'){
        rankStr="稳健型";
    }else if(type == 'MEDIUM'){
        rankStr="平衡型";
    }else if(type == 'MEDIUM_HIGH'){
        rankStr="成长型";
    }else if(type == 'HIGH'){
        rankStr="进取型";
    }
    return rankStr;
}


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

//
//function getQuestionnaireInfo(url){
//    var retValue = null;
//    $.ajax({
//        type:'get',
//        url:url,
//        dataType:'json',
//        async:false,
//        success: function (results) {
//            retValue = results;
//        },
//        error: function (error) {
//            console.log('获取问卷调查出现错误...');
//        }
//    });
//    return retValue;
//}