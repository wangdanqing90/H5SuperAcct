/**
 * Created by Yilia on 2018/4/23.
 * 我的理财首页finance.html
 */

var access_token = $.cookie('ccat');
var user = $.getUser();
var userId = user.id;
var currentPage = 1;
var size = 10;
var status = "status=SETTLED&status=OVERDUE&status=BREACH";
var statusMap = {
    Hold:"SETTLED,OVERDUE,BREACH",
    Application:"FINISHED,PROPOSED,FROZEN",
    Settled:"CLEARED",
    Canceled:'CANCELED_BY_USER'
}

$(function(){

    //console.log(access_token,user,userId);
    $("#headName").text("我的产品明细");
    var param = $.getUrlParam();
    var type =  param.type;
    if(param.type){
        type =  param.type;
        switchPage(type);
    }else{
        type="Hold";//默认为持有产品
    }
    filp(type);
})

function filp(type) {
    $("#finance").html("");//清空
    //changeThead(type);
    $.ajax({
        url: '/api/v2/user/' + userId + '/invest/list/' + (currentPage-1) + '/' + size + '?' + status + '&access_token=' + access_token,
        async: false,
        success: function (data) {
            resStr = JSON.stringify(data);
            if(data.results === null){
                // alert(data.results);
                return false;
            }
            if (data.results.length > 0) {
                var html = "";
                for (var i = 0; i < data.results.length; i++) {
                    var myProduct = data.results[i];
                    var id = myProduct.id;
                    var productName=myProduct.loanTitle+"-"+myProduct.orderId;

                    html += '<div class="finance-item">'
                    html += '<div class="item-title clearfloat">'
                    html += '<h3>'+ productName+'</h3>'
                    if (type == 'Canceled') { //申请中tab已取消
                        html += '<p class="uhide"><span>投资金额:</span><span>' + $.formatNum(myProduct.investAmount)+ '</span><span>(元)</span></p>'
                    }else{
                        html += '<p class=""><span>投资金额:</span><span>' + $.formatNum(myProduct.investAmount)+ '</span><span>(元)</span></p>'
                    }
                    if (type == 'Application'){ //申请中tab有“取消申请”按钮
                        html += '<a onclick="Cancel(\''+myProduct.id+'\',this)" href="javascript:void(0);">取消申请</a>'
                    }
                    if(myProduct.productKey!="VIRTUAL"){
                        if(myProduct.status === "SETTLED" || myProduct.status === "CLEARED" || myProduct.status === "OVERDUE"){
                            if(myProduct.repayments[0]!=null
                                &&(myProduct.repayments[0].invest.creditAssignId!=null
                                &&myProduct.repayments[0].invest.creditAssignId!="")){//债权产品
                                html += '<a href="javascript:void(0);" target="_blank" onclick="downProtocol(\''+myProduct.id+'\',this,\''+myProduct.repayments[0].invest.creditAssignId+'\',\''+myProduct.loanId+'\',\''+myProduct.loanTitle+'\')">查看合同</a>';
                            }else{//正常产品
                                html += '<a href="javascript:void(0);" target="_blank" onclick="downProtocol(\''+myProduct.id+'\',this,false,\''+myProduct.loanId+'\',\''+myProduct.loanTitle+'\')">查看合同</a>';
                            }
                        }
                    }

                    var status = '';
                    if(myProduct.status === "SETTLED"){
                        if(myProduct.productKey=="VIRTUAL"){
                            status = "持有中";
                        }else{
                            status = "已起息";
                        }
                    }else if(myProduct.status === "OVERDUE"){
                        if(myProduct.productKey=="VIRTUAL"){
                            status = "已到期，待兑付";
                        }else{
                            status = "兑付中"; //逾期
                        }
                    }else if(myProduct.status === "OPENED" || myProduct.status === "FINISHED"){
                        status = "清算中";
                    }else if(myProduct.status === "CLEARED"){
                        status = "已兑付";
                    }else if(myProduct.status === "FROZEN"){
                        if(myProduct.productKey=="VIRTUAL"){
                            status = "申请中";
                        }else{
                            status = "账户资金冻结";
                        }
                    }else if(myProduct.status === "BREACH"){
                        status = "兑付中";
                    }

                    var repayed = 0; //已回款
                    var unrepay = 0; //待回款
                    var  repayments = myProduct.repayments;
                    for(var k = 0 ; k < repayments.length ; k++){
                        var repayment = repayments[k];
                        var _total;
                        if(myProduct.productKey=="VIRTUAL"){
                            _total = repayment.repayment.amountInterest+repayment.repayInterest;
                        }else{
                            _total= repayment.repayment.amount+repayment.repayInterest;
                        }

                        if(repayment.status === "REPAYED"){
                            repayed += _total;
                        }else{
                            unrepay += _total;
                        }
                    }

                    //产品到期日 start
                    var productEndDate;
                    if("Hold"==type||"Settled"==type){//持有产品  已兑付
                        productEndDate = repayments[0]!=null ? repayments[0].repayment.dueDate:"";
                    }else if("Application"==type){//申请中
                        //没有 产品到期日这个字段 而使用的是购买日期这个字段
                        productEndDate = moment(myProduct.submitTime).format("YYYY-MM-DD");
                    }else if('Canceled'==type){
                        productEndDate = moment(myProduct.updateTime).format("YYYY-MM-DD");
                    }
                    //产品到期日 end

                    html += '</div>'
                    html += '<div class="catipal-type clearfloat">'
                    html += '<div class="item-balance">'
                    if (type == 'Hold' || type == 'Settled') { //申请中tab持有中  //申请中tab已兑付
                        if(type == 'Hold'){
                            //申请中“已收本息”没有，目前写的是待收本息
                            html += '<p class="item-grey">' + $.formatNumNoRound(unrepay) + '</p>'
                        }else{
                            html += '<p class="item-grey">' + $.formatNumNoRound(repayed) + '</p>'
                        }
                        html += '<p class="item-yellow">已收本息(元)</p>'
                        html += '</div>'
                        html += '<div class="item-amount">'
                        //没有产品到期日这个字段 而使用的是购买日期这个字段
                        html += '<p class="item-grey">'+productEndDate+'</p>'
                        html += '<p class="item-yellow">到期日</p>'
                        html += '</div>'
                    }
                    if (type == 'Application') { //申请中tab申请中
                        html += '<p class="item-grey">'+productEndDate+'</p>'
                        html += '<p class="item-yellow">购买日期</p>'
                        html += '</div>'
                        html += '<div class="item-amount">'
                        html += '<p class="item-grey">'+status+'</p>'
                        html += '<p class="item-yellow">状态</p>'
                        html += '</div>'
                    }
                    if (type == 'Canceled') { //申请中tab已取消
                        html += '<p class="item-grey">' + $.formatNum(myProduct.investAmount)+ '</p>'
                        html += '<p class="item-yellow">金额(元)</p>'
                        html += '</div>'
                        html += '<div class="item-amount">'
                        html += '<p class="item-grey profit">5%</p>'
                        html += '<p class="item-yellow">历史年化收益率</p>'
                        html += '</div>'
                    }

                    html += '<div class="item-catipal">'
                    if (type == 'Canceled') { //申请中tab已取消
                        html += '<p class="item-grey">'+moment(myProduct.updateTime).format("YYYY-MM-DD");+'</p>'
                        html += '<p class="item-yellow">取消日期</p>'
                    }else if(myProduct.productKey=="VIRTUAL"){
                        html += '<a href="javascript:void(0);" class="contract">体验产品无合同</a>'
                    }else{
                        if(statusMap.Hold.indexOf(myProduct.status)>-1 || statusMap.Application.indexOf(myProduct.status)>-1 || statusMap.Settled.indexOf(myProduct.status)>-1) {
                            html += '<a class="icon-pdf" href="javascript:void(0);" onclick="downPdf(\'' + myProduct.id + '\',this,false,\'' + myProduct.loanId + '\',\'' + myProduct.loanTitle + '\');"><img src="/img/account/pdf.png" alt=""/></a>';
                            html += '<a class="item-yellow" href="javascript:void(0);">PDF凭证</a>'
                            //if (statusMap.Application.indexOf(myProduct.status)>-1&&myProduct.code=='wenJin'||statusMap.Application.indexOf(myProduct.status)>-1&&myProduct.code=='anJin') {
                            //    html +='<a href="javascript:void(0);" onclick="Cancel(\''+myProduct.id+'\',this)" class="btn">取消</a>';
                            //}
                        }
                    }
                    html += '</div>'
                    html += '</div>'
                    html += '</div>'
                }
                $("#finance").append(html);
            }
        },
        error: function (r) {
            console.log('error：' + r);
        }
    })
}

function backClick(){
    window.history.back(-1);
}

//点击购买取消
function Cancel(investId,current){
    var current = $(current);
    $.confirm("是否确认取消申购？",null,function(v){
        if(v=='ok'){
            $.ajax({
                url: '/api/v2/invest/cancelInvest/'+investId,
                async: false,
                type:'get',
                dataType: "json",
                success: function (data) {
                    if(!data.success){
                        $.alert(data.error[0].message);
                    }else{
                        $.alert('取消成功');
                        current.parent().parent().remove();
                    }
                }
            })
        }
    })
}

function switchPage(type){
    currentPage = 1;
    if ("Hold" === type) {
        //持有中
        status = "status=SETTLED&status=OVERDUE&status=BREACH";
        $(".Hold").addClass('active');
        $(".Application").removeClass('active');
        $(".Settled").removeClass('active');
        $(".Canceled").removeClass("active");
    } else if ("Application" === type) {
        //申请中
        status = "status=FINISHED&status=PROPOSED&status=FROZEN";
        $(".Hold").removeClass('active');
        $(".Application").addClass('active');
        $(".Settled").removeClass('active');
        $(".Canceled").removeClass("active");
    } else if ("Settled" === type) {
        //已结清
        status = "status=CLEARED";
        $(".Hold").removeClass("active");
        $(".Application").removeClass("active");
        $(".Settled").addClass("active");
        $(".Canceled").removeClass("active");
    }
    else if ("Canceled" === type) {
        //已取消
        status = "status=CANCELED_BY_USER";
        $(".Hold").removeClass("active");
        $(".Application").removeClass("active");
        $(".Settled").removeClass("active");
        $(".Canceled").addClass("active");
    }
    filp(type);
}
function downProtocol(investId,self,creditAssignId,loanId,title){
    var $this = $(self);
    $this.attr("disabled","disabled");
    var isUrl='/api/v2/user/'+loanId+'/isOrNotYGJPY';
    $.ajax({
        url:isUrl,
        type:"get",
        data:{
        },
        //dataType:"json",
        success:function(data){
            if(data==true && title.indexOf("粤股交") >= 0){//json
                clearInterval(downInterval);
                var tempA = $('<a href="/api/v2/contract/allContracts/'+investId+'" target="_blank"></a>');
                $("body").append(tempA);
                tempA.get(0).click();
                tempA.remove();
                $this.removeAttr("disabled");
            }else{
                $.checkServerAuthorizeStatus("V5");
                var authorizeCode=$.cookie("v5token");
                var urlStr = '/api/v5/idata_getProductPDF?investId='+investId;
                if(creditAssignId){
                    urlStr ='/api/v2/assign/'+creditAssignId+'/contract' ;
                }
                $.ajax({
                    url:urlStr,
                    type:"get",
                    data:{
                        authorizeCode:authorizeCode
                    },
                    //dataType:"json",
                    success:function(data){
                        //console.log("data=="+JSON.stringify(data));
                        //首先判断字符串格式
                        if(data.match("^\{(.+:.+,*){1,}\}$")){//json
                            //console.log("json data=="+data);
                            //data = eval("("+data+")");
                            $this.removeAttr("disabled");
                            data = eval("("+data+")");
                            if(data.code!=undefined&&(data.code=="0002"||data.code=="9997")){
                                $this.removeAttr("disabled");
                                $.alert(data.msg);
                                return;
                            }
                        }else{//pdf数据
                            var tempA = null;
                            if(creditAssignId){
                                tempA = $('<a href="/api/v2/assign/'+creditAssignId+'/contract" target="_blank"></a>');
                            }else{
                                tempA = $('<a href="/api/v5/idata_getProductPDF?investId='+investId+'&authorizeCode=' + encodeURIComponent(authorizeCode)+'" target="_blank"></a>');
                            }
                            $("body").append(tempA);
                            tempA.get(0).click();
                            tempA.remove();
                            $this.removeAttr("disabled");
                        }
                    },
                    error:function(e){
                        $this.removeAttr("disabled");
                        $.alert("查看合同出错");
                    }
                })

            }
        },
        error:function(){
            console.log("判断是否盖章出错");
        }
    });




}
function downPdf(ivid,self,onlyDown,loanId,title){
    var $this = $(self);
    $this.attr("disabled","disabled");

    var isUrl='/api/v2/user/'+loanId+'/isOrNotYGJPY';
    $.ajax({
        url:isUrl,
        type:"get",
        data:{
        },
        //dataType:"json",
        success:function(data){
            if(data==true && title.indexOf("粤股交") >= 0){
                $.checkServerAuthorizeStatus("V5");
                var authorizeCode=$.cookie("v5token");
                $.ajax({
                    url:'/api/v5/idata_getNewProductPDF?investId='+ivid,
                    type:"get",
                    data:{
                        authorizeCode:authorizeCode
                    },
                    //dataType:"json",
                    success:function(data){
                        //首先判断字符串格式
                        if(data.match("^\{(.+:.+,*){1,}\}$")){//json
                            data = eval("("+data+")");
                            if(data.code=="9998"){//数据未存在，生成
                                //console.log("code==0002");
                                if(!onlyDown){//生成文件之后的下载请求不再生成文件
                                    uploadPdf(ivid,self,loanId);
                                }
                            }else{
                                $this.removeAttr("disabled");
                                $.alert("下载PDF失败！");
                            }
                        }else{//pdf数据
                            //console.log("file exist直接下载！！！！");
                            clearInterval(downInterval);
                            var tempA = $('<a href="/api/v5/idata_getNewProductPDF?investId='+ivid+'&authorizeCode=' + encodeURIComponent(authorizeCode)+'" target="_blank"></a>');
                            $("body").append(tempA);
                            tempA.get(0).click();
                            tempA.remove();
                            $this.removeAttr("disabled");
                        }
                    },
                    error:function(){
                        $this.removeAttr("disabled");
                        console.log("下载PDF出错");
                    }
                });
            }else{
                $.checkServerAuthorizeStatus("V5");
                var authorizeCode=$.cookie("v5token");
                $.ajax({
                    url:'/api/v5/idata_Downloads?ivid='+ivid,
                    type:"get",
                    data:{
                        authorizeCode:authorizeCode
                    },
                    //dataType:"json",
                    success:function(data){
                        //首先判断字符串格式
                        if(data.match("^\{(.+:.+,*){1,}\}$")){//json
                            data = eval("("+data+")");
                            if(data.code=="9997"){
                                $.alert(data.msg);
                                return;
                            }
                            if(data.code=="0002"){//数据未存在，生成
                                //console.log("code==0002");
                                if(!onlyDown){//生成文件之后的下载请求不再生成文件
                                    uploadPdf(ivid,self);
                                }
                            }else{
                                $this.removeAttr("disabled");
                                $.alert("下载PDF失败！");
                            }
                        }else{//pdf数据
                            //console.log("file exist直接下载！！！！");
                            clearInterval(downInterval);
                            var tempA = $('<a href="/api/v5/idata_Downloads?ivid='+ivid+'&authorizeCode=' + encodeURIComponent(authorizeCode)+'" target="_blank"></a>');
                            $("body").append(tempA);
                            tempA.get(0).click();
                            tempA.remove();
                            $this.removeAttr("disabled");
                        }
                    },
                    error:function(){
                        $this.removeAttr("disabled");
                        console.log("下载PDF出错");
                    }
                })
            }
        },
        error:function(){
            console.log("判断是否盖章出错");
        }
    });
}
var downInterval;
var downNum = 0;
function uploadPdf(ivid,self,loanId){
    var $this = $(self);
    //console.log("in produce method");
    $.checkServerAuthorizeStatus("V5");
    var authorizeCode=$.cookie("v5token");
    $.ajax({
        url:"/api/v5/idata_getPDFurl",
        type:"post",
        data:{
            ivid:ivid,
            authorizeCode:authorizeCode
        },
        dataType:"json",
        success:function(data){
            //console.log("data==="+JSON.stringify(data));
            if(data.code=="0000"){//成功
                //console.log("生成pdf成功");
                //data.data.filename;
                downInterval = setInterval(function(){
                    //此处下载4次之后就直接提示错误吧，时间太长了
                    if(++downNum>4){
                        $.alert("下载PDF失败！");
                        clearInterval(downInterval);
                        downNum = 0;
                        $this.removeAttr("disabled");
                    }else{
                        downPdf(ivid,self,true,loanId);
                    }
                },2500);
            }else{
                $.alert("生成pdf失败");
                $this.removeAttr("disabled");
                //console.log("data==="+JSON.stringify(data));
            }
            //console.log("data==="+JSON.stringify(data));
        },
        error:function(){
            $this.removeAttr("disabled");
            console.log("生成pdf出错");
        }

    });
}