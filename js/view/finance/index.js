
var access_token = $.cookie('ccat');
var user = "";
var loginUserId = "";
var userId = "";
var channelCode="";
var fitMap = {
    LOW:         ' LOW ',
    LOW_MEDIUM:  ' LOW LOW_MEDIUM ',
    MEDIUM:      ' LOW LOW_MEDIUM MEDIUM ',
    MEDIUM_HIGH: ' LOW LOW_MEDIUM MEDIUM MEDIUM_HIGH ',
    HIGH:        ' LOW LOW_MEDIUM MEDIUM MEDIUM_HIGH HIGH ',
};
var typeMap = {
    LOW: '保守型',
    LOW_MEDIUM: '稳健型',
    MEDIUM: '平衡型',
    MEDIUM_HIGH: '成长型',
    HIGH: '进取型',
};
var productMap = {
    LOW: '极低风险产品',
    LOW_MEDIUM: '低风险产品',
    MEDIUM: '中等风险产品',
    MEDIUM_HIGH: '较高风险产品',
    HIGH: '高风险产品'
};
function allowBuy (userLevel, productLevel) {
    return fitMap[userLevel].indexOf(' '+productLevel+' ') > -1;
}
(function ($) {

    if($.isLogin()){
        user = $.getUser();
        loginUserId = user.id;
        //console.log("user:"+$.cookie("user"));
        channelCode=user.channelCode;
        //判断是否显示预留信息
        var information = user.information;
        if(information){
            $('.reservedInfo').removeClass('hidden');
            $('.reservedInfo').text(information);
        }else{
            $('.reservedInfo').addClass('hidden');
        }
    }
   // searchHot();
    getAD();
    $.fn.indexAssignMentView=function (list) {
        //console.log("list=="+JSON.stringify(list));
        var $this = $(this);
        //清空表格
        $this.find("tr:gt(0)").remove();
        var ths = $this.find("th");
        var loginUserId = null;
        if($.isLogin()){
            if(user&&user.id){
                loginUserId = user.id;
            }

        }
        $.each(list, function (index, bean) {
            var tr = $("<tr></tr>");
            if (index % 2 == 0) {
                tr.addClass("tbbg");
            }
            var assignRate = null;
            var B=bean.creditAmount;//投资本金B
            var C=bean.rate/10000; //产品年利率
            var H=bean.totalDays;//投资期限
            var N=bean.daysofyear;//一年有多少天
            var G=bean.creditDealAmount;//转让后的价格
            var settletimeStr = moment(bean.settletime).format("YYYY-MM-DD");
            var D = null;
            D = $.getHoldTime(settletimeStr,H,bean.timeOpen);
            D = D<0 ? 0 : D;
            var params = {"G":G,"B":B,"C":C,"D":D,"N":N,"H":H};
            assignRate =$.getAssignRate(params,"assignment");//转让后的收益率(B+B*C%*H/N-G)/G*N/(H-D)
            var obj = jQuery.parseJSON(bean.clientPriv);
            var productRisk = obj.productRiskLevel;
            if(bean.codeList!=null&&bean.codeList.code!=null){
                var code=bean.codeList.code;
            }
            $.each(ths, function (idx, th) {
                //assignRate =((G-B)/B*N/D*10000).toFixed(0);
                var remainTime = bean.totalDays-D;//剩余时间=投资期限-持有时间
                var td = $("<td></td>");
                var tdInner = "";
                if (idx == 0) {//名称列
                    //tdInner = '<span class="item"><a href="javascript:void(0);" title="'+ null+'" onclick="$.viewProduct(\''+bean.id+'\',\''+bean.loanRequest.productKey+'\')">' + $.limitDis(bean.title) + '</a></span>';
                    var param = "";
                    param+="pId="+bean.loanId;//产品ID
                    param+="&creditDealAmount="+bean.creditDealAmount;//将转让价格带过去
                    param+="&assignRate="+assignRate;//将转让历史参考年化收益率 带过去
                    param+="&remainTime="+remainTime;//将剩余期限带过去
                    var beanName=bean.title+"-"+bean.orderId;
                    if( $.isFinished(bean.status)){
                        tdInner = '<div class="div-full-oneline font-16"><a href="javascript:void(0);" title="'+ beanName+'" >' + beanName + '</a></div>';
                    }else{
                        tdInner = '<div class="div-full-oneline font-16"><a href="javascript:void(0);" title="'+ beanName+'" onclick="$.viewProductAssignment(\''+param+'\')">' + beanName + '</a></div>';
                    }

                } else if (idx == 1) {//配置建议
                    td.addClass("hidden-xs hidden-sm");
                    var productRiskLevel = eval("(" + bean.clientPriv + ")").productRiskLevel;
                    tdInner = '<i class="icon_sm_ta' + $.riskLevelConvert(productRiskLevel) + '"></i>';
                }
                //else if (idx == 2) {//本息分配方式
                //    td.addClass("hidden-xs");
                //    tdInner = '<span class="item">一次性还本付息</span>';
                //}
                else if (idx == 2) {//预计年化利率 转让后的收益率
                    tdInner = '<span class="rate">' + assignRate + '%</span>';
                } else if (idx == 3) {//投资期限 对应转让专区的剩余天数
                    td.addClass("hidden-xs");
                    //tdInner = '<span class="item">' +bean.totalDays+ '天</span>';
                    tdInner = '<span class="item">' +remainTime+ '天</span>';
                } else if (idx == 4) {//转让价格
                    tdInner = '<span class="money">￥<span class="how">' +bean.creditDealAmount+ '</span>元</span>';
                }else if (idx == 5) {//进度
                    td.addClass("hidden-xs");
                    var percent=0;
                    if(bean.status=="FINISHED"){
                        percent=100;
                    }
                    tdInner = '<div class="easy-pie-chart percentage" data-size="42" data-percent="' + percent + '" data-color="#00A0E8">' +
                        '<span class="percent">' + percent + '</span>%' +
                        '</div>';
                    //console.log("bean.amount=="+bean.amount+";bean.balance=="+bean.balance+";percent=="+percent);

                }   else if (idx == 6) {//操作
                    //tdInner = '<a class="button button-caution button-pill button-buy" href="javascript:void(0);" onclick="$.viewProduct(\''+bean.id+'\',\''+bean.loanRequest.productKey+'\')">投资</a>';
                    var arrivalTime=moment(bean.settletime).add(bean.totalDays, 'days');//到期时间 ：  timeSettled + duration.totalDay
                    arrivalTime=moment(arrivalTime).format('YYYY-MM-DD');
                    //到期后本息  creditAmount + creditAmount * rate/10000 * totalDays / dayofyear
                    var amount= bean.amountAddInterest;
                    if(bean.status=="OPEN"){
                        if(bean.userId==loginUserId){
                            tdInner = '<a class="button button-pill button-buy" href="javascript:void(0);" >我的转让</a>';
                        }else{
                            tdInner = '<a class="button button-caution button-pill button-buy" href="javascript:void(0);" onclick="buyMethodtansfer(\''+bean.id+'\',\''+bean.title+'-'+bean.orderId+'\',\''+assignRate+'\',\''+arrivalTime+'\',\''+bean.creditDealAmount+'\',\''+amount+'\',\''+remainTime+'\',this,\''+productRisk+'\',\''+code+'\')">投资</a>';
                        }
                    }else if(bean.status=="FINISHED"){
                        tdInner = '<a class="button button-pill button-buy" href="javascript:void(0);" >已转让</a>';
                    }


                    if(index==0){//插入热门产品
                        var item=bean;
                        var addHtml='<div class="item">';
                        addHtml+='<img class="img-tag" src="img/tag_transfer.png">';
                        addHtml+='<div class="item-p">' + assignRate + '<span class="font-size-18">%</span></div><div class="font-gray font-size-12  text-center">历史参考年化收益率</div>';
                        var param = "";
                        param+="pId="+bean.loanId;//产品ID
                        param+="&creditDealAmount="+bean.creditDealAmount;//将转让价格带过去
                        param+="&assignRate="+assignRate;//将转让历史参考年化收益率 带过去
                        param+="&remainTime="+remainTime;//将剩余期限带过去
                        var beanName=bean.title+"-"+bean.orderId;
                        if( $.isFinished(bean.status)){
                            if(item.TICKET_STATUS=='1'){
                                addHtml+='<div class="item-title"><img src="/../img/coupon/quan.png"  style="margin-right:10px;width:18px;margin-top: -5px"><a  href="javascript:void(0);" >'+beanName+'</a></div>';
                            }else{
                                addHtml+='<div class="item-title"><a  href="javascript:void(0);" >'+beanName+'</a></div>';
                            }
                        }else{
                            if(item.TICKET_STATUS=='1'){
                                addHtml+='<div class="item-title"><img src="/../img/coupon/quan.png"  style="margin-right:10px;width:18px;margin-top: -5px"><a  href="javascript:void(0);" onclick="$.viewProductAssignment(\''+param+'\')">'+beanName+'</a></div>';
                            }else{
                                addHtml+='<div class="item-title"><a  href="javascript:void(0);" onclick="$.viewProductAssignment(\''+param+'\')">'+beanName+'</a></div>';
                            }
                        }


                        addHtml+='<div class="item-body"><div class="font-size-18">投资期限<span>'+remainTime+'</span>天';
                        var productRiskLevel = eval("(" + item.clientPriv + ")").productRiskLevel;
                        addHtml+='<i class="item-ta icon_sm_ta'+$.riskLevelConvert(productRiskLevel)+'"></i></div>';
                        var percent=0;
                        if(bean.status=="FINISHED"){
                            percent=100;
                        }
                        addHtml+='<div class="item-progress margin-top-20"><div class="progress"><div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:'+percent+'%"><span class="sr-only">'+percent+'% Complete</span></div></div> </div>';
                        addHtml+='<div>转让价格：' + item.creditDealAmount + ' 元<span class="span-p">'+percent+'%</span></div></div>';
                        if(bean.status=="OPEN"){
                            if(bean.userId==loginUserId){
                                addHtml+='<div class="padding-top-20 padding-bottom-10"><a class="button button-pill button-buy width-full" href="javascript:void(0);" >我的转让</a></div></div>';
                            }else{
                                addHtml+='<div class="padding-top-20 padding-bottom-10"><a class="button button-caution button-pill button-buy width-full" href="javascript:void(0);" onclick="buyMethodtansfer(\''+bean.id+'\',\''+bean.title+'-'+bean.orderId+'\',\''+assignRate+'\',\''+arrivalTime+'\',\''+bean.creditDealAmount+'\',\''+amount+'\',\''+remainTime+'\',this,\''+productRisk+'\',\''+code+'\')">投资</a></div></div>';
                            }
                        }else if(bean.status=="FINISHED"){
                            addHtml+='<div class="padding-top-20 padding-bottom-10"><a class="button button-pill button-buy width-full" href="javascript:void(0);" >已转让</a></div></div>';
                        }


                        var newsContainer = $(".item-assign");
                        if($(".item-assign").children().length==0)
                        newsContainer.append(addHtml);
                    }
                }
                td.append(tdInner);
                //此处应该有列样式处理
                tr.append(td);
                //此处应该有行样式处理


            });
            $this.append(tr);

        });
    }

    $.viewProductAssignment = function(param,type){
        var array = param.split("&");
        var pidArray = array[0].split("=");//pid
        if(pidArray[1]){//pid
            //获取产品类型
            if(!param.type){
                param.type = $.getProductInfo(pidArray[1]).loanRequest.productKey;
            }
        }

        if($.checkProduct(param.type)){//里面存在confirm的判断
            location.href = "/view/product/productAssignment.html?"+param;
        }

    }
})(jQuery);

$(function(){

    /** 定义产品展示顺序及每种理睬产品产品条数 */
//"OPENED","SCHEDULED","FINISHED","SETTLED" ==> "SCHEDULED"(包含"OPENED"),"FINISHED","SETTLED"
    var proTypeShowOrder = ["SCHEDULED","FINISHED","SETTLED"];
    var proTypeFilter = ["SETTLED","CLEARED"];
    var productNum = 5;


    //银行理财与非银行理财分类，有客户经理的才展示非银行理财产品---又要修改为可见，但不能进详情页
    //福袋产品改为新手专享--每个用户只能买一次

//福袋产品查询
   // showTableViewForIndex($(".fudai"),"FUDAI",1);
    //findProductForHot(1,"FUDAI",null,null,1);

    //粤股交查询(30天以内)
    //findProductForHot(2,"DEFAULT",0,100);
//粤股交查询(热门推荐1，2)
    //findProductForHot(3,"YGJPY",0,100,2);
    //安金普惠产品查询
    //showTableViewForIndex($(".itou"),"DEFAULT");
    //银行产品查询
    //showTableViewForIndex($(".bank"),"BANK");
    //粤股交查询
    showTableViewForIndex($(".ygj"),"YGJPY");
    if($.isLogin()){
        //var user = $.getUser();

    	var user=$.cookie("user");
    	user = eval('(' + user + ')');
        //财富经理号为8开头的显示业主专区
        if(user.salesNo){
            var firstNum =user.salesNo.substr(0,1)
            if(firstNum=='8'){
                //i业主专区
                showTableViewForIndex($(".estate"),"WUYE");
            }
        }
        //特权产品查询
        var container = $(".vip");
        var params = {pageSize:5,
            minDuration:0,
            maxDuration:100,
            minAmount:0,
            maxAmount:100000000,
            status:"SCHEDULED",
            currentPage:1,
            channelCode:channelCode};
            $.ajax({
                type:"get",
                url:"/api/v2/loans/getTagProduct/"+user.id,
                data:params,
                dataType:"json",
                success:function(data){
                    if(!$.isNullOrBlank(data)&&(!$.isNullOrBlank(data.results))){
                    var list = data.results;
                    //vip专区
                    if((!$.isEmptyObject(list))&&(list.length>0)) {
                        container.show();
                        var table = container.find("table");
                        //清空表格
                        table.find("tr:gt(0)").remove();
                        var tbody = table.find("tbody");
                        $.each(list, function (index, bean) {
                            var amount = bean.amount - bean.bidAmount;
                            var unit = "元";
                            if (amount / 10000 > 1) {
                                amount = amount / 10000;
                                unit = "万元";
                            }
                            var term = 0;
                            var termUnit = "天";

                            /** @modify by zhaoxinbo 2016-03-11 16:35重新计算投资期限 */
                            var days = 0, months = 0, years = 0;
                            days = (bean.duration.hasOwnProperty("days") && bean.duration.days != null && !isNaN(bean.duration.days)) ? bean.duration.days : 0;
                            months = (bean.duration.hasOwnProperty("months") && bean.duration.months != null && !isNaN(bean.duration.months)) ? bean.duration.months : 0;
                            years = (bean.duration.hasOwnProperty("years") && bean.duration.years != null && !isNaN(bean.duration.years)) ? bean.duration.years : 0;
                            term = days + months * 30 + years * 360;

                            var percent = (bean.bidAmount / bean.amount * 100);
                            percent = parseInt(percent);
                            var row;
                            if (bean.loanRequest.ticket_status == '1') {
                                if (index % 2 == 0) {
                                    row = '<tr class="tbbg">'
                                }else{
                                    row = '<tr>'
                                }
                                     row += '<td><span class="item"><a href="javascript:void(0);" title="' + bean.title + '" onclick="$.viewProduct(\'' + bean.id + '\',\'' + bean.productKey + '\')">' + $.limitDis(bean.title) + '</a></span><img src="/../img/coupon/quan.png"  style="margin-left:10px;width:18px;margin-top: -2px"></td>' +
                                        //'<td class="hidden-xs hidden-sm"><i class="icon_sm_ta2"></i></td>'+
                                    //'<td class="hidden-xs"><span class="item">一次性还本付息</span></td>' +
                                    '<td><span class="rate">' + bean.rate / 100 + '%</span></td>' +
                                    '<td class="hidden-xs hidden-sm"><span class="money">¥<span class="how">' + amount + '</span>' + unit + '</span></td>' +
                                    '<td class="hidden-xs"><span class="date"><span class="how">' + term + '</span>' + termUnit + '</span></td>' +
                                    '<td class="hidden-xs">' +
                                    '<div class="easy-pie-chart percentage" data-size="42" data-percent="' + percent + '" data-color="#00A0E8">' +
                                    '<span class="percent">' + percent + '</span>%' +
                                    '</div>' +
                                    '</td>' +
                                    '<td><a class="button button-caution button-pill button-buy" href="javascript:void(0);" onclick="$.viewProduct(\'' + bean.id + '\',\'' + bean.productKey + '\',\'' + bean.loanRequest.ticket_status + '\',\'' + bean.loanRequest.association + '\')"> ' + $.operation[bean.status] + '</a></td>' +
                                    '</tr>';
                            } else {
                                if (index % 2 == 0) {
                                    row = '<tr class="tbbg">'
                                }else{
                                    row = '<tr>'
                                }
                                if( $.isFinished(bean.status)){
                                    row += '<td><span class="item"><a href="javascript:void(0);" title="' + bean.title + '">' + $.limitDis(bean.title) + '</a></span></td>';
                                }else{
                                    row += '<td><span class="item"><a href="javascript:void(0);" title="' + bean.title + '" onclick="$.viewProduct(\'' + bean.id + '\',\'' + bean.productKey + '\')">' + $.limitDis(bean.title) + '</a></span></td>';
                                }

                                        //'<td class="hidden-xs hidden-sm"><i class="icon_sm_ta2"></i></td>'+
                                    //'<td class="hidden-xs"><span class="item">一次性还本付息</span></td>' +
                                row +='<td><span class="rate">' + bean.rate / 100 + '%</span></td>' +
                                    '<td class="hidden-xs hidden-sm"><span class="money">¥<span class="how">' + amount + '</span>' + unit + '</span></td>' +
                                    '<td class="hidden-xs"><span class="date"><span class="how">' + term + '</span>' + termUnit + '</span></td>' +
                                    '<td class="hidden-xs">' +
                                    '<div class="easy-pie-chart percentage" data-size="42" data-percent="' + percent + '" data-color="#00A0E8">' +
                                    '<span class="percent">' + percent + '</span>%' +
                                    '</div>' +
                                    '</td>';
                                if( $.isFinished(bean.status)){
                                    row +='<td><a class="button button-pill button-buy" href="javascript:void(0);" > ' + $.operation[bean.status] + '</a></td>' +
                                    '</tr>';
                                }else{
                                    row +='<td><a class="button button-caution button-pill button-buy" href="javascript:void(0);" onclick="$.viewProduct(\'' + bean.id + '\',\'' + bean.productKey + '\',\'' + bean.loanRequest.ticket_status + '\',\'' + bean.loanRequest.association + '\')"> ' + $.operation[bean.status] + '</a></td>' +
                                        '</tr>';
                                }
                            }
                            tbody.append(row);
                        });
                        $.percent();
                            ProcessingStyles()
                    }
                    }
                }
            });
    }
    //转让产品查询
    queryProduct($(".assign"),"DEFAULT",false,1);
    /**
     *
     * @param 1-容器；2-产品类型；3-同步异步
     */
    function queryProduct(){
        var container = arguments[0]||$();
        var product = arguments[1]||"DEFAULT";
        var async = arguments[2]||false;
        var currentPage = arguments[3]||1;
        var pageSize = 5
        $.ajax({
            type:"get",
            url:"/api/v2/assign/list?page="+currentPage+"&pageSize="+pageSize,
            async:async,
            data:{"status":"OPEN"},
            dataType:"json",
            success:function(data){
                var list = data.results;
                //container.show();
                //若不足5条用已转让的产品补足5条,已转让的产品操作按钮为：已转让，不可点击
                if(list.length<5&&currentPage==1){
                    list = addAlreadyAssignment(list);
                }
                container.find("table").indexAssignMentView(list);
            }
        });
    }
    /**
     * 方法名称：showTableViewForIndex
     * @author zuxuefeng
     * 方法描述：异步展示产品表数据
     * @param 1-容器；2-产品类型；
     * @date 2015-12-28 14:21
     */
    function showTableViewForIndex(){
        /** 1 参数接收初始化 */
        var container = arguments[0]||$();
        var product = arguments[1]||"DEFAULT";
        var pageSize=arguments[2]||productNum;
        /** 2 调用接口查询数据 */
        var params = {pageSize:pageSize,
            minDuration:0,
            maxDuration:100,
            minAmount:0,
            maxAmount:100000000,
            status:"SCHEDULED",
            currentPage:1,
            product:product,
            channelCode:channelCode};

        /** 3 调用接口查询数据,按状态顺序查询产品，如果不够定义的产品数量则继续查询下一产品类型，够则跳出 */

        var list = new Array();

        $.ajax({
            type:"get",
            url:"/api/v2/loans/getLoanWithPage",
            data:params,
            dataType:"json",
            success:function(data){
                list = data.results;
                /** 4 数据过滤处理：进度显示为100%，剩余可投金额为0元 */
                    $.filterDataByCondition(proTypeFilter,list);
                if(pageSize>2){//用于热门产品查询判断
                    /** 5 判断list是否有值，有值展现，无：table隐藏 */
                    if($.isEmptyObject(list)){
                        container.hide();
                    }else{
                        container.show();
                        container.find("table").indexView(list);
                            ProcessingStyles()
                    }
                }
                //else{//热门产品
                //    addHot(list);
                //}
            }
        });

    }

    /**
     * 方法名称：findProductForHot
     * @author zuxuefeng
     * 方法描述：热门产品专用查询
     * @param 1-容器；2-产品类型;3最低期限，4最高期限；
     * @date 2015-12-28 14:21
     */
    function findProductForHot(){
        /** 1 参数接收初始化 */
        var container = arguments[0]||$();
        var product = arguments[1]||"DEFAULT";
        var minDuration = arguments[2]||0;
        var maxDuration = arguments[3]||100;
        var pageSize= arguments[4]||1;
        /** 2 调用接口查询数据 */
        var params = {pageSize:pageSize,
            minDuration:minDuration,
            maxDuration:maxDuration,
            minAmount:0,
            maxAmount:100000000,
            status:"SCHEDULED",
            currentPage:1,
            product:product,
            channelCode:channelCode};

        /** 3 调用接口查询数据,按状态顺序查询产品，如果不够定义的产品数量则继续查询下一产品类型，够则跳出 */

        var list = new Array();

        $.ajax({
            type:"get",
            url:"/api/v2/loans/getLoanWithPage",
            data:params,
            dataType:"json",
            success:function(data){
                list = data.results;
                if(!$.isNullOrBlank(list)){
                    if(list.length>1){
                        addHot(list[0],false,2);
                        addHot(list[1],false,3);
                    }else{
                        addHot(list[0],false,container);
                    }
                }

            }
        });

    }

    //新闻内容查询
    //提取公共方法
    //最新公告
	var i = 0;
	var j = 0;
    var newsContainer = $("#publication");
    newsContainer.children().remove();
    $.getNoticeForIndex(5);
    $.getUrgentNoticeForIndex(1);



    //COVERAGE/name/媒体报道
    var reportContainer = $("#coverage");
    reportContainer.children().remove();
    $.getReportForIndex(5);


    //导航active
    $("#a-head-finance").addClass("active");


    show('light');



})

function addAlreadyAssignment(list){
    if(list.length<5){
        var pageSize = 5-list.length;
        $.ajax({
            type:"get",
            url:"/api/v2/assign/list?page=1&pageSize="+pageSize,
            async:false,
            //data:{"page":1,"pageSize":pageSize,"status":"FINISHED"},
            data:{"status":"FINISHED"},
            dataType:"json",
            success:function(data){
                var alreadyAssignmentList = data.results;
                console.log("alreadyAssignmentList="+JSON.stringify(alreadyAssignmentList));
                if($.isEmptyObject(alreadyAssignmentList)){

                }else{
                    $.each(alreadyAssignmentList, function (index, bean) {
                        if(bean.status=="FINISHED"){//返回的有OPEN的状态没办法再次过滤将来还得找他们让他们调
                            list.push(bean);
                        }
                    });
                }
            }
        });
    }
    return list;
}

//转让增加验证码，同理财专区
function buyMethodtansfer(creditAssignId,title,rate,arriveTime,creditDealAmount,amount,remainTime,field,productRisk,code,amountAddInterest){
    if($.isLogin()){
        user = $.getUser();
        userId = user.id;
        if(!$.getInviter(user.salesNo)){
            $.confirm("是否绑定客户经理？",null,function(v){
                if(v=="ok") {
                    $.goBond();
                }
            });
        } else if ((code=="wenJin"||code=="suJiao") && productRisk ){
            $.get('/api/v2/user/'+userId+'/surveyFilling?access_token='+access_token, function (o) {
                var filling = o[0];
                if (!filling ||
                    !filling.rank ||
                    !fitMap[filling.rank] ||
                    !allowBuy(filling.rank, productRisk)) {
                    if(!filling||!filling.rank){
                        var info='您还没有进行风险等级评估！不能购买股交所产品，是否现在进行评估？';
                        $.confirm(info,null,function(v){
                            if(v=="ok"){
                                location.href="/view/account/account.html?currentPage=risk";
                            }
                        });
                    }else{
                        $.alert('您的风险等级为(' + typeMap[filling.rank] + ')，不适合购买此产品(' + productMap[productRisk]+')，适合购买(' + productMap[filling.rank] +'),或者<a href="/view/account/account.html?currentPage=risk">重新进行评估！</a>');
                    }
                    return;
                }else{
                    window.location.href = "/view/confirm/transfer-confirm.html?title="+title+"&rate="+rate+"&arriveTime="+arriveTime+"&creditDealAmount="+creditDealAmount+"&amount="+amount+"&remainTime="+remainTime+"&creditAssignId="+creditAssignId+"&amountAddInterest="+amountAddInterest;
                }
            });
        }else{
            window.location.href = "/view/confirm/transfer-confirm.html?title="+title+"&rate="+rate+"&arriveTime="+arriveTime+"&creditDealAmount="+creditDealAmount+"&amount="+amount+"&remainTime="+remainTime+"&creditAssignId="+creditAssignId+"&amountAddInterest="+amountAddInterest;
        }
    }else{//未登录

        $.confirm("您还未登录或登录超时，请登录后操作",'安金普惠',function(v){
            if(v=='ok'){
                $.goLogin();
            }
        },null,null);
    }
}

function show(tag){
     $.ajax({
          type:"get",
          url:"/api/v2/cms/getSiteNotice",
          data:{},
          dataType:"json",
         success:function(data){
                  var list = data.content;
                if(list != ''&& list!= null ) {
                     $(".con").html(data.content);
                     $("#fade").css("display", "block");
                 }
             }
       });
}

function hide(tag){
 /*      $("#"+tag).css("display","none");*/
       $("#fade").css("display","none");
}


function ProcessingStyles(){
    $('.itou').removeClass('evenStyle oddStyle')
    $('.estate').removeClass('evenStyle oddStyle')
    $('.ygj').removeClass('evenStyle oddStyle')
    $('.assign').removeClass('evenStyle oddStyle')
    $('.vip').removeClass('evenStyle oddStyle')
    var visible = $('.controlStyle:visible');
    for(var i=0;i<visible.length;i++){
        if(i%2==0){
            $(visible[i]).addClass('oddStyle');
        }else{
            $(visible[i]).addClass('evenStyle');
        }
    }
}

function searchHot(){
    var parm={userId:loginUserId,
        conditionA:"FUDAI-0-0",
        conditionB:"YGJPY-25-50",
        conditionC:"YGJPY-0-24",
        conditionC2:"YGJPY-51-0",
        channelCode:channelCode
    };
    $.ajax({
        type:"post",
        url:"/api/v2/exhibition/getExhibitionInfo",
        data:parm,
        dataType:"json",
        success:function(data){
            if(data.success==true){
                addHot(data.data.A[0]);
                addHot(data.data.B[0]);
                if(data.data.C[0].productKey=="YGJPY"){
                    addHot(data.data.C[0],null,3);
                }else{
                    addVipHot(data.data.C[0]);
                }
                //处理D  type:0产品 1图片
                if(data.data.D[0].type=="0"){
                    $(".item-assign").empty();
                    addHot(data.data.D[0].productUrl,true);
                }else if(data.data.D[0].type=="1"){
                    $(".item-assign").empty();
                    if(!$.isNullOrBlank(data.data.D[0].skipUrl)){
                        $(".item-assign").append('<a href="'+data.data.D[0].skipUrl+'"><img src="'+data.data.D[0].productUrl+'" class="width-full"></a>');
                    }else{
                        $(".item-assign").append('<img src="'+data.data.D[0].productUrl+'" class="width-full">');
                    }

                }
            }

        },error:function(data){
            data
        }
    });
}

function addHot(list,idEnd,position){
    //$.each(list,function(index,item){
    var totalDays=list.duration.totalDays;
    var addHtml='<div class="item">';
    switch(list.productKey){
        case "FUDAI":
            addHtml+='<img class="img-tag" src="img/tag_newT.png">';
            break;
        case "DEFAULT":
            addHtml+='<img class="img-tag" src="img/tag_hot.png">';
            break;
        case "YGJPY":
            addHtml+='<img class="img-tag" src="img/tag_hot.png">';
            break;
    }
    addHtml+='<div class="item-p">' + list.rate / 100 + '<span class="font-size-18">%</span></div><div class="font-gray font-size-12  text-center">历史参考年化收益率</div>';

    if( $.isFinished(list.status)){
        if(list.loanRequest.ticket_status=='1'){
            addHtml+='<div class="item-title"><img src="/../img/coupon/quan.png"  style="margin-right:10px;width:18px;margin-top: -5px"><a  href="javascript:void(0);" >'+list.title+'</a></div>';
        }
        else{
            addHtml+='<div class="item-title"><a  href="javascript:void(0);"  >'+list.title+'</a></div>';
        }
    }else{
        if(list.loanRequest.ticket_status=='1'){
            addHtml+='<div class="item-title"><img src="/../img/coupon/quan.png"  style="margin-right:10px;width:18px;margin-top: -5px"><a  href="javascript:void(0);"  onclick="$.viewProduct(\''+list.id+'\',\''+list.loanRequest.productKey+'\',\''+list.loanRequest.ticket_status+'\')">'+list.title+'</a></div>';
        }
        else{
            addHtml+='<div class="item-title"><a  href="javascript:void(0);"  onclick="$.viewProduct(\''+list.id+'\',\''+list.productKey+'\',\''+list.loanRequest.ticket_status+'\')">'+list.title+'</a></div>';
        }
    }

    var duration = list.loanRequest.duration;
    var term = 0;
    if (duration.totalDays) {
        term = duration.totalDays;
    }
    addHtml+='<div class="item-body"><div class="font-size-18">投资期限<span>'+term+'</span>天';
    var productRiskLevel = eval("(" + list.loanRequest.clientPriv + ")").productRiskLevel;
    addHtml+='<i class="item-ta icon_sm_ta'+$.riskLevelConvert(productRiskLevel)+'"></i></div>';
    var percent = Math.floor((list.amount - list.balance) / list.amount * 100);
    addHtml+='<div class="item-progress margin-top-20"><div class="progress"><div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:'+percent+'%"><span class="sr-only">'+percent+'% Complete</span></div></div> </div>';
    var amount = list.balance;
    var unit = "元";
    if (amount / 10000 > 1) {
        amount = amount / 10000;
        unit = "万元";
    }
    addHtml+='<div>剩余金额：' + amount + ' ' + unit + '<span class="span-p">'+percent+'%</span></div></div>';

    if( $.isFinished(list.status)){
        addHtml+='<div class="padding-top-20 padding-bottom-10"><a class="button button-pill button-buy width-full" href="javascript:void(0);">' + $.operation[list.status] + '</a></div></div>';
    }else{
        addHtml+='<div class="padding-top-20 padding-bottom-10"><a class="button button-caution button-pill button-buy width-full" href="javascript:void(0);" onclick="$.viewProduct(\''+list.id+'\',\''+list.productKey+'\',\''+list.loanRequest.ticket_status+'\',null,\''+list.title+'\')">' + $.operation[list.status] + '</a></div></div>';
    }




    var newsContainer;
    if(idEnd==true){
        newsContainer = $(".item-assign");
    }else{
        if(position==3){
            newsContainer = $(".item-vip");
        }else{
            if(list.productKey=="FUDAI"){
                newsContainer = $(".item-new1");
            }
            if(list.productKey=="YGJPY"){
                newsContainer = $(".item-new2");
            }
        }
    }
    newsContainer.append(addHtml);
};

//热门产品VIP
function addVipHot(item){
        var amount = item.amount-item.bidAmount;
        var unit = "元";
        if(amount/10000>1){
            amount = amount/10000;
            unit = "万元";
        }
        var term = 0;

        /** @modify by zhaoxinbo 2016-03-11 16:35重新计算投资期限 */
        var days = 0,months = 0,years = 0;
        days = (item.hasOwnProperty("days") && item.days != null && !isNaN(item.days)) ? item.days : 0;
        months = (item.hasOwnProperty("months") && item.months != null && !isNaN(item.months)) ? item.months : 0;
        years = (item.hasOwnProperty("years") && item.years != null && !isNaN(item.years)) ? item.years : 0;
        term = days + months * 30 + years * 360;

        var percent = (item.bidAmount/item.amount*100);
        percent = parseInt(percent);

        var addHtml='<div class="item">';
        addHtml+='<img class="img-tag" src="img/tag_vip.png">';
        addHtml+='<div class="item-p">' + item.rate / 100 + '<span class="font-size-18">%</span></div><div class="font-gray font-size-12  text-center">历史参考年化收益率</div>';
        if(item.ticket_status=='1'){
            addHtml+='<div class="item-title"><img src="/../img/coupon/quan.png"  style="margin-right:10px;width:18px;margin-top: -5px"><a href="javascript:void(0);" title="' + item.title + '" onclick="$.viewProduct(\'' + item.id + '\',\'' + item.productKey + '\')">' + $.limitDis(item.title) + '</a></div>';
        }else{
            addHtml+='<div class="item-title"><a href="javascript:void(0);" title="' + item.title + '" onclick="$.viewProduct(\'' + item.id + '\',\'' + item.productKey + '\')">' + $.limitDis(item.title) + '</a></div>';
        }
        addHtml+='<div class="item-body"><div class="font-size-18">投资期限<span>'+term+'</span>天';
        var productRiskLevel = eval("(" + item.clientPriv + ")").productRiskLevel;
        addHtml+='<i class="item-ta icon_sm_ta'+$.riskLevelConvert(productRiskLevel)+'"></i></div>';
        //addHtml+='<i class="item-ta icon_sm_ta5"></i></div>';
        addHtml+='<div class="item-progress margin-top-20"><div class="progress"><div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:'+percent+'%"><span class="sr-only">'+percent+'% Complete</span></div></div> </div>';
        addHtml+='<div>剩余金额：' + amount + ' ' + unit + '<span class="span-p">'+percent+'%</span></div></div>';
        addHtml+='<div class="padding-top-20 padding-bottom-10"><a class="button button-caution button-pill button-buy width-full" href="javascript:void(0);" onclick="$.viewProduct(\''+item.id+'\',\''+item.productKey+'\',\''+item.ticket_status+'\',\''+item.association+'\')">'+$.operation[item.status]+'</a></div></div>';


        var newsContainer = $(".item-vip");
        newsContainer.append(addHtml);
}

function getAD(){
    $.ajax({
        type: 'get',
        url: '/api/v2/cms/getBanners/PCMidBanner',
        dataType: 'json',
        success: function (data) {
            if (data!=null&&data.length>1) {
                var imgContainer = $("#owl-ad");
                $.each(data,function(index,item){
                    if(item.content!=null){
                        var imgDiv;
                        if(item.priv!=null&&item.priv!=undefined){
                            imgDiv = $('<div class="item" ><a href="/view/promotion/ad_detail.html?url='+item.priv+'" target="_blank"><img  src="'+item.content+'" data-src-1200="'+item.content+'"/></a></div>');
                        }else{
                            imgDiv = $('<div class="item" ><img  src="'+item.content+'" data-src-1200="'+item.content+'"/></div>');
                        }

                        imgContainer.append(imgDiv);
                    }
                });
                $(".owl-carousel").css("display","block");
                //幻灯片
                if($("#owl-ad").length > 0 ) {
                    $("#owl-ad").owlCarousel({
                        singleItem : true,
                        autoPlay:5000,
                        stopOnHover:true,
                        pagination:true,
                        transitionStyle : "fade"
                    });

                    $("#owl-ad .owl-controls").prepend('<div class="div-ad">广告</div>');
                    var ad_width=$("#owl-ad .owl-page").length*24+40;
                    $(".div-ad").css("width",ad_width+"px");
                }
            }else if(data!=null&&data.length==1){
                $(".owl-carousel").css("display","block");
                if(!$.isNullOrBlank(data[0].priv)){
                    $("#owl-ad").append('<a href="/view/promotion/ad_detail.html?url='+data[0].priv+'" target="_blank"><img class="width-full"  src="'+data[0].content+'" data-src-1200="'+data[0].content+'"/></a>');
                }else{
                    $("#owl-ad").append('<img class="width-full"  src="'+data[0].content+'" data-src-1200="'+data[0].content+'"/>');
                }
                $("#owl-ad").append('<div class="div-ad">广告</div>');
                $(".div-ad").css("margin-top","-20px");
            }else{
                $("#owl-ad").parent().parent().remove();
            }

        },
        error: function (error) {
            console.log("获取banner错误");
        }
    });
}