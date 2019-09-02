/**
 * Created by wangdanqing .
 */
var typeMap = {
    LOW: '谨慎型',
    LOW_MEDIUM: '稳健型',
    MEDIUM: '平衡型',
    MEDIUM_HIGH: '进取型',
    HIGH: '激进型',
};

var productMap = {
    LOW: '极低风险产品',
    LOW_MEDIUM: '低风险产品',
    MEDIUM: '中等风险产品',
    MEDIUM_HIGH: '较高风险产品',
    HIGH: '高风险产品'
};

var fitMap = {
    LOW:         ' LOW ',
    LOW_MEDIUM:  ' LOW LOW_MEDIUM ',
    MEDIUM:      ' LOW LOW_MEDIUM MEDIUM ',
    MEDIUM_HIGH: ' LOW LOW_MEDIUM MEDIUM MEDIUM_HIGH ',
    HIGH:        ' LOW LOW_MEDIUM MEDIUM MEDIUM_HIGH HIGH ',
};
/** 获取查询参数，初始化公用变量 */
var param = $.getUrlParam();
var product = $.getProductInfo(param.pId);
var access_token = $.cookie('ccat');
var user;
var userId;
var loanId = '';
var minAmount = 0;
var maxAmount = 0;
var productKey = '';
var productRisk = '';
var title = '';
var balance = 0;
var step = 0;
var ticket_status = 0;
var type_key;
var code = '';
var productData;
var risk;
var productKey;



$(function(){
	$('#backTo').click(function(){
		history.go(-1);
	});
	
	$.saveBackUrl();
	
	if(param && param.pId){
    //获取产品类型
    if(!param.type){
        param.type = $.getProductInfo(param.pId).loanRequest.productKey;
    }
    if($.checkProduct(param.type)){
        loanId = param.pId;
    }  
    if(param.ticket_status){
        if(param.ticket_status == '1'){
            ticket_status = param.ticket_status;
        }
    }
    }else{
    $.alert("无效的url请求",null,function(){
        location.href="/";
    });
    }
	
	

    load_product_detail();
    



    if($.isLogin()) {
    	var user = $.getUser();
        userId = user.id;
        
        
        //输入金额改变        
        $('#investAmount').keyup(function(){
        /** ①获取投资金额 年化收益率 投资期限 年化利率天数 */
        var $this = $(this);
        var investAmount = $this.val();
        var rateByYear = productData.rate/10000;
        var duration = productData.duration.totalDays;
        var daysOfYear = productData.loanRequest.repaymentRule.daysOfYear;
        /** ②计算到期收益,设置预期收益并显示出来 */
        var totalEarnings = investAmount * rateByYear * duration / daysOfYear;
        totalEarnings = Number(totalEarnings).toFixed(2);
        $('#TotalIncome').html(totalEarnings);
        if (investAmount>=productData.loanRequest.investRule.minAmount) {
                $('#investBtnDIV').removeClass("gray");
                $('#investBtnDIV').addClass("orange");
                $('#investBtn').attr("disabled", false);
            }
            else {
                $('#investBtnDIV').removeClass("orange");
                $('#investBtnDIV').addClass("gray");
                $('#investBtn').attr("disabled", true);
            }
    });
    }

    $('#investAmount').keyup();
})



//从福利券进入的虚拟产品
/*function load_product_detail_invented(xunimoney){
    $('#investAmount').attr("disabled",true);
    $('#investAmount').val(xunimoney);

    $("#ul_introduce li:eq(2)").css("display","none");
    $("#arrivalDate").css("display","none");
    $("#productTime").css("display","none");


    $("#button1").attr("disabled","disabled"); 
}*/


function load_product_detail(){
    //产品详情
    var data = $.getProductInfo(loanId);
    var dataArray = [];
    dataArray.push(data);
    $.filterDataByCondition(["SETTLED","CLEARED"],dataArray);
    data = dataArray.pop();
    productData = data;
    productKey = data.loanRequest.productKey;
    var obj= eval('('+ data.loanRequest.clientPriv +')');   
    risk = obj.productRiskLevel;
    var riskLevel = typeMap[obj.productRiskLevel];  
    $("#productType").html(riskLevel);     
    $("#rateOfReturn").text(data.rate/100+"%");//年化利率
    $("#termOfInvestment").text(data.duration.totalDays);//投资期限
    $("#productTerm").text(data.duration.totalDays+"天");//产品期限
    minAmount = data.loanRequest.investRule.minAmount;
    maxAmount = data.loanRequest.investRule.maxAmount;
    balance = data.amount-data.bidAmount;
    step = data.loanRequest.investRule.stepAmount;
    if(minAmount>=10000){
        $("#investmentAmount").text(minAmount/10000+"万元");
    }else{
        $("#investmentAmount").text(formatNum(minAmount)+"元");
    }
    $("#scroll_begin").text($.limitDis(data.title));
    $("#scroll_begin").attr("title",data.title);
    $("#remainAmount").text(data.status=="SETTLED"?0:formatNum(data.amount-data.bidAmount));
 
    var timeLeft = moment(data.timeOpen).add(Number(data.timeout/24+data.duration.totalDays+1),'days');
    timeLeft = new Date(timeLeft).format('yyyy年MM月dd日');
 
    if(minAmount == maxAmount){
        $("#increasAmount").text(0);
    }else{
        $("#increasAmount").text(step);
    }
    
     //非DEFAULT标注不可以转让
    if(productKey!="DEFAULT"){
         $("#nontransferable").css("display","block");
    }
    
    showProgress();
    initBtn(data);

  
    
    /*$.ajax({
        url: APP_URL + "/platinfo/bdxq.htm",
        type: 'Get',
        async: false,
        dataType:'jsonp',
        data:{"product":product},
        success:function(data){
            if(data.code == "000000"){
                if(checkNull(data.data)){
					var proTitle;
                    productData = data.data;
                    $("#termOfInvestment").html(productData.jkDay);//投资期限                   
                    $("#productType").html(productData.riskValue);//风险类型              
                    if(productData.releaseTime){
                        $("#outline_time_begin").css("display","block");
                        $("#outline_time_begin").html(time_format(productData.releaseTime));//认购开始
                    }
                    if(productData.jsTime) {
                        $("#outline_time_finish").css("display", "block");
                        $("#outline_time_finish").html(time_format(productData.jsTime));//认购结束日
                    }

                    $("#outline_time_establish").css("display","block");
                    if(checkNull(productData.fullScaleDate)) {
                        $("#outline_time_establish").html(time_format(productData.fullScaleDate));//产品成立日
                    }
                    else{
                        $("#outline_time_establish").html(time_format(productData.jsTime));//产品成立日
                    }

                    $("#outline_time_expire").css("display","block");
                    if(productData.jkCycle != 0){
                        $("#outline_time_expire").html(time_format(productData.cpdqTime1));//产品到期日
                    }
                    if(productData.jkDay != 0){
                        $("#outline_time_expire").html(time_format(productData.cpdqTime2));//产品到期日
                    }

                    if(productData.buyNum == 0){
                        $("#investmentNum").css("display","none");
                    }else{
                        $("#investmentNum").html(productData.buyNum);//用户购买次数
                    }

                    if(productData.ljtzje){//累计最大投资额
                        $("#maxMoneyLabel").html(productData.ljtzje.toFixed(2));
                        $("#maxMoney").css("display","block");
                    }

                    showProgress();
                    initBtn(productData.goodStatus);
                    createRule();
                }
            }else{
                $.checkValidTime(data);
            }
        },
        error:function(e){
            console.log("error:"+e);
        }
    });*/
}

function backClick(){
    var couponFlg = GetQueryString("couponFlg");
    if(checkNull(couponFlg)) {
        window.location.href ='../account/coupon/coupon.html';
    }
    else{
        window.location.href = '../confirm/productList.html';
    }
}


//跳转到交易介绍
function jumpIntroduct(){
    window.location.href = 'productDetails.html' + "?loanId=" + loanId;
}

//跳转到购买记录
function jumpRecord(){
    window.location.href='investRecord.html'+"?loanId="+loanId;
}

//初始化产品说明书
/*function createRule(){
	var url = '/api/v2/loan/' +loanId+ '/documents';
    $.ajax({
        url: url,
        type: 'GET',
        success: function(data) {
            var doc = data.data.DOCUMENT[0];
            if(doc&&doc.uri){
                var uri = doc.uri;
                url =PIC_URL + url;
                var tempA = '<a href="'+ url + '" target="_blank"';
                var newLi = '<li >' +tempA+ '>产品说明书</a> </li>';
                 $("#ul_introduce").append(newLi);
            }
        }
    });
}*/

//进度条初始化
function showProgress(){
    var cycleFlag= productData.cycleFlag;
    if(cycleFlag == 0){
    }
    else if(cycleFlag == 1){
        $(".outline").find(".second").addClass("active");
    }
    else if(cycleFlag == 2){
        $(".outline").find(".second").addClass("active");
        $(".outline").find(".third").addClass("active");
    }
    else if(cycleFlag == 3){
        $(".outline").find(".second").addClass("active");
        $(".outline").find(".third").addClass("active");
        $(".outline").find(".last").addClass("active");
    }
}

//底部按钮状态初始化
function initBtn(data){
   /* if(goodStatus=="YFB"){
        $("#graybtn").html("即将开始");
    }
    else if(goodStatus=="DFK"){
        $("#graybtn").html("已售罄");
    }
    else if(goodStatus=="HKZ"){
        $("#graybtn").html("已起息");
    }
    else if(goodStatus=="YJQ"){
        $("#graybtn").html("已兑付");
    }
    else if(goodStatus=="YDF"){
        $("#graybtn").html("已兑付");
    }
    else if(goodStatus=="YZR"){
        $("#graybtn").html("已转让");
    }
    else if(goodStatus=="TBZ"){
        $("#graybtn").css("display","none");
        $("#InvestmentBtn").css("display","block");

        if(!checkNull(GetQueryString("money"))) { //普通产品
            $("#resetTime").css("display","block");
            interval = setInterval("dateDif(new Date(productData.jsTime.replace(/-/g,'/')))",1000);//剩余时间
        }
    }*/
    var timeOpen = data.timeOpen;
    var ts = timeOpen - (new Date());//计算剩余的毫秒数
   if(data.status!="OPENED"){//不可购买
        $("#graybtn").text($.operation[data.status]);     
    }else{//可以购买
        $("#graybtn").css("display","none");
        $("#InvestmentBtn").css("display","block");


        $("#resetTime").css("display","block");
        interval = setInterval("dateDif(new Date(productData.jsTime.replace(/-/g,'/')))",1000);//剩余时间
     
    }
}



function time_format(date){
    var myDate = new Date(date.replace(/-/g,'/'));
    var year = myDate.getFullYear();    //获取完整的年份(4位)
    var month = (myDate.getMonth()+1) < 10 ? "0"+(myDate.getMonth()+1) : (myDate.getMonth()+1);       //获取正确月份
    var day = myDate.getDate() < 10 ? "0"+ myDate.getDate() : myDate.getDate();        //获取当前日(1-31)
    var hours = myDate.getHours() < 10 ? "0"+ myDate.getHours() : myDate.getHours();        //获取当前小时数(0-23)
    var minutes = myDate.getMinutes() < 10 ? "0"+ myDate.getMinutes() : myDate.getMinutes();      //获取当前分钟数(0-59)
    return year + "." + month + "." + day ;
}


function dateDif(enddate){
    var date = enddate -new Date().getTime();
    var days    = date / 1000 / 60 / 60 / 24;
    var daysRound   = Math.floor(days);
    var hours    = date/ 1000 / 60 / 60 - (24 * daysRound);
    var hoursRound   = Math.floor(hours);
    var minutes   = date / 1000 /60 - (24 * 60 * daysRound) - (60 * hoursRound);
    var minutesRound  = Math.floor(minutes);
    var seconds   = date/ 1000 - (24 * 60 * 60 * daysRound) - (60 * 60 * hoursRound) - (60 * minutesRound);
    var secondsRound  = Math.floor(seconds);
    $("#day").html(daysRound);
    $("#hour").html(hoursRound);
    $("#minute").html(minutesRound);
    $("#second").html(secondsRound);

    if(daysRound == 0 && hoursRound == 0 && minutesRound == 0 && secondsRound == 0 ){
        clearInterval(interval);
    }
}



//立即投资按钮
function investClick(){
    if(!$.isLogin()){
        $.goLogin();
        return;
    }
     if(productKey === 'FUDAI'){
         if(!$.isGreenhand(userId)){
             $.alert("本项目只适用于从未在本平台投资的新用户，您已有过投资记录，无法参与。");
             return false;
         }
     }
    if ((productKey === 'BANK'||code=="wenJin"||code=="suJiao"||code=="anJin"||$.isYGJPY(productKey,productData.tags)) && risk ){
        $.get('/api/v2/user/'+userId+'/surveyFilling?access_token='+access_token, function (o) {
            var filling = o[0];
            if (!filling ||
                !filling.rank ||
                !fitMap[filling.rank] ||
                !allowBuy(filling.rank, risk)) {
                if(!filling||!filling.rank){
                    if(productKey === 'BANK'){
                        var info='您还没有进行风险等级评估！不能购买银行理财类产品，是否现在进行评估？';
                    }else{
                        var info='您还没做过问卷，请先做风险评估！';
                    }
                    $.confirm(info,null,function(v){
                        if(v=="ok"){
                            location.href="/view/account/account.html?currentPage=risk";
                        }
                    });
                }else{
                    $.alert('您的风险等级为(' + typeMap[filling.rank] + ')，不适合购买此产品(' + productMap[risk]+')，适合购买(' + productMap[filling.rank] +'),或者<a href="/view/account/account.html?currentPage=risk">重新进行评估！</a>');
                }
                return;
            }
            checkAmount();
         });
    }else{
        checkAmount();
    }
 }

function checkAmount(){
    var investAmount = $("#investAmount");

    /** @zhaoxinbo 2016-01-21 11:08 重写产品购买投资金额，起投金额，递增金额业务逻辑判断 */
    if(investAmount.val() > balance){
        /** 1 如果投资金额大于剩余可投金额，则给出提示信息 */
        $.alert('投标金额不可超过剩余额度 !');
        return false;
    }else if(investAmount.val() > maxAmount){
        $.alert('该产品的最大投资金额不能超过 ' + maxAmount + '元');
        return false;
    }else{
        /** 2 如果投资金额小于等于剩余可投金额，则分情况处理 */
        if(balance <= minAmount){
            /** ① 剩余可投 < 起投金额：投资金额必等于剩余可投金额 */
            if(investAmount.val() != balance){
                $.alert('请一次性购买剩余可投金额' + balance + '元 ');
                return false;
            }
        }else if(balance > minAmount){
            /** ② 剩余可投 > 起投金额 */
            /** 判断 投资金额 是否 >= 起投金额 */
            if(investAmount.val() < minAmount) {
                $.alert('单次投标金额不可少于' + minAmount + '元 !');
                return false;
            }
            if(balance <= step && investAmount.val() != minAmount){
                $.alert('请按起投金额' + minAmount + '元进行购买');
                return false;
            }
            /** ③ 前提：剩余金额 >= 递增金额， 投资金额 = 起投金额 + n * 递增金额,此处判断投资金额是否满足该公式 */
            if(balance > step && ((investAmount.val() - minAmount) % step) != 0){
                $.alert('投资金额需为递增金额的整数倍!');
                return false;
            }
        }
    }
    var param_investAmount={loanId:loanId,amount:investAmount.val()}
    var investAmountResult = $.checkInvestAmount(param_investAmount,userId);
    //判断购买金额是否大于累计购买金额
    if(product.loanRequest.investTotalAmount!=-1){
        if(investAmount.val() > product.loanRequest.investTotalAmount){
            $.alert('本产品客户累计可购买限额为' + product.loanRequest.investTotalAmount + '元 ，最多还可购买'+product.loanRequest.investTotalAmount+'元。');
            return;
        }
        if(investAmountResult.success==false){
            var remaining=investAmountResult.error[0].value;
            if(remaining>0){
                if(remaining<minAmount){
                    $.alert('本产品您的累积可购买余额已小于起购金额，无法继续购买，请您查看其它产品吧 !');
                    return;
                }
            var bought=product.loanRequest.investTotalAmount-remaining;
            var investAmount_confirm="本产品您的累积购买金额已达"+bought+"元，最多还可购买"+remaining+"元，是否需要购买"+remaining+"元产品？";
            $.confirm(investAmount_confirm,null,function(v){
                if(v=="ok"){
                    investAmount.val(remaining);
                    if(remaining<minAmount){
                        $.alert('单次投标金额不可少于' + minAmount + '元 !');
                        return;
                    }
                    goBuyProduct();
                }
            }, "我再看看","立即购买");
            }else{
                $.alert("本产品您已达到累积购买上限，无法继续购买，请您查看其它产品吧。");
                return;
            }
        }else{
            goBuyProduct();
        }
    }else{
        //VIP限额
        if(investAmountResult.success == false){
            $.alert(investAmountResult.error[0].message);
            return;
        }else{
            goBuyProduct();
        }
    }
}

function goBuyProduct(){
    var investAmount = $("#investAmount");
    /** 3 判断账户余额是否足够，不够则跳转至充值页面 */
    if (investAmount.val() > $.getUserFund().availableAmount) {
        var con;
        con= $.confirm("您的余额不足，是否需要跳转充值页面吗？",null,function(v){
            if(v=="ok"){
                location.href="/view/account/account.html?currentPage=recharge";
            }
        }); //在页面上弹出对话框
        return false;
    }

    window.location.href='pay.html'+"?loanId="+loanId+"&money="+investAmount.val()+"&ticket_status="+ticket_status;
}

//普通弹窗
function showMessage(txt){
    layer.open({
        content: txt,
        skin: 'msg',
        time: 2,
        end: function () {
            $("#investBtn").attr("disabled",false);
        }
    });
}


function formatNum(str){
    str = str.toString();
    strs=str.split('.');
    strs[0]=strs[0].split('').reverse().join('').replace(/(\d{3})/g,'$1,').replace(/\,$/,'').split('').reverse().join('');
    if(strs[1]!=undefined){
        return strs[0]+"."+strs[1];
    }else{
        return strs[0];
    }

}

function allowBuy (userLevel, productLevel) {
    return fitMap[userLevel].indexOf(' '+productLevel+' ') > -1;
}






