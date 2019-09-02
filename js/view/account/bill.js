/**
 * Created by Yilia on 2018/4/24.
 * 账单
 */

var access_token = $.cookie('ccat');
var user = $.getUser();
var userId = user.id;

var currentPage = 1;
var size = '';
var type = "ALL";
var state = true;

var FundRecordType = {
    "INVEST": "投标",
    "WITHDRAW": "提现",
    "DEPOSIT": "充值",
    "LOAN": "放款",
    "LOAN_REPAY": "贷款还款",
    "INVEST_REPAY": "投资还款",
    "CREDIT_ASSIGN": "债权转让",
    "TRANSFER": "转账扣款",
    "REWARD_REGISTER": "注册奖励",
    "REWARD_INVEST": "投标奖励",
    "REWARD_DEPOSIT": "充值奖励",
    "FEE_WITHDRAW": "提现手续费",
    "FEE_LOAN_OVERDUE": "逾期管理费",
    "FEE_LOAN_PENALTY": "逾期罚息(给商户)",
    "FEE_LOAN_PENALTY_INVEST": "逾期罚息(给投资人)",
    "FEE_DEPOSIT": "充值手续费",
    "FEE_ADVANCE_REPAY": "提前还款违约金(给商户)",
    "FEE_ADVANCE_REPAY_INVEST": "提前还款违约金(给投资人)",
    "FEE_CREDIT_ASSIGN": "转让手续费",
    "COUPON_INTEREST_INCOME": "福利券奖励",
    "DISNEY": "迪士尼购票",
    "INVEST_INTEREST": "投资还款",
    "PERSONAL_INPUT": "资金补录",
    "CANCEL_INVEST": "撤销",
};

var statusMap = {
    'PROCESSING': '处理中',
    'COREPAY_PROCESSING': '处理中', //核心对接新增字段
    'CUT_PENDING': '处理中',//金运通处理中字段
    'LLPROCESSING': '处理中',//连连处理中
    'SUCCESSFUL': '成功',
    'CANCELED': '已取消',
    'FAILED': '失败',
    'REJECTED': '拒绝',
    'INITIALIZED': '初始状态',
    'AUDITING': '审核中',
    'FIRST_AUDITING':'初审通过'
};

var FundRecordOperation = {
    "FREEZE": "冻结",
    "RELEASE": "解冻",
    "IN": "资金转入",
    "OUT": "资金转出"
};

var today = new Date();
var endDate = Date.parse(today);
today.setDate(1);
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);
var startDate = Date.parse(today);


$(function(){

    //console.log(access_token,user,userId);
    $("#headName").text("账单");


    var startDate2 = getUrlParam('startDate');
    var endDate2 = getUrlParam('endDate');
    if(startDate2 && endDate2){
        $("#search").removeClass('uhide').addClass('ushow');
        filp(startDate2, endDate2);
        //搜索完清空搜索日期
        startDate2 = '';
        endDate2 = ''
        console.log(startDate2, endDate2)
    }else{

        filp(startDate, endDate);
    }

    $("#closeSearch").on('click',function(){
        $("#search").removeClass('ushow').addClass('uhide');
        var today = new Date();
        var endDate2 = Date.parse(today);
        today.setDate(1);
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        var startDate2 = Date.parse(today);

        filp(startDate2, endDate2);
    })


})

//页面显示
function filp(start, end) {
    $("#funds").html("");//清空
    var url = '/api/v2/user/' + userId + '/funds?type=' + type + '&allStatus=' + state + '&allOperation=true&startDate=' + start + '&endDate=' + end + '&page=' + currentPage + '&pageSize=' + size + '&access_token=' + access_token;
    $.ajax({
        url: url,
        async: false,
        success: function (data) {
            var resStr = JSON.stringify(data);

            if (data.results === null) {
                return false;
            }
            if (data.results.length > 0) {
                //数据处理，把同一个月的item放到一个数组  start
                var data2 = {};
                var json2 = [];
                var keyMap = {};
                for (var m = 0; m < data.results.length; m++) {
                    var json1Elem = data.results[m];
                    var elemKey = getLocalTime(json1Elem.recordTime).substring(0, 7);
                    if (elemKey in keyMap) {
                        json2[keyMap[elemKey]].value.push(json1Elem);
                    } else {
                        json2.push({
                            "date": getLocalTime(json1Elem.recordTime).substring(0, 7),
                            "value": [json1Elem]
                        });
                        keyMap[elemKey] = json2.length - 1;
                    }
                }
                data2 = {
                    results:json2,
                    totalSize: 46,
                    nowdate: null,
                    totalAmount: null,
                    listMobile: null,
                    validNumber: 0
                }
                console.log(data2);
                //数据处理，把同一个月的item放到一个数组  end

                var html = "";
                for(var j = 0;  j < data2.results.length; j++){
                    //当月的显示本月，否则显示对应的月份
                    if(getYM() == data2.results[j].date){
                        html = '<h3 class="month">本月</h3>'
                    }else{
                        html = '<h3 class="month">'+data2.results[j].date+'</h3>'
                    }

                    for (var i = 0; i < data2.results[j].value.length; i++) {
                        var fund = data2.results[j].value[i];
                        //过滤一下fund.status=INITIALIZED(初始状态) 不显示
                        if (fund.status == "INITIALIZED") {
                            continue;
                        }
                        html += '<div class="data-item">'

                        html += '<p class="title clearfloat">'
                        //项目名称
                        //var hint = "";
                        //if (fund.type != 'WITHDRAW' && fund.type != 'DEPOSIT') {
                        //    if (fund.hint !== null && fund.hint !== undefined) {
                        //        var hint = fund.hint;
                        //    }
                        //}
                        html += '<span>' + fund.hint + '</span>'
                        //交易类型
                        var operationName = FundRecordOperation[fund.operation];
                        var type = FundRecordType[fund.type];
                        if (fund.type == "OFFLINE_DEPOSIT") {
                            if (fund.operation == "OUT") {
                                type = "提现";
                            }
                            if (fund.operation == "IN") {
                                type = "充值";
                            }
                        }
                        html += '<span>'+type+'('+operationName+')'+'</span>'
                        html += '</p>'
                        html += '<p class="date-status clearfloat">'
                        var time = getLocalTime(fund.recordTime);//时间
                        html += '<span>'+time+'</span>'

                        //交易状态
                        var status = statusMap[fund.status];
                        if (status === undefined) {
                            status = "";
                        }
                        if(status == '失败'){
                            html += '<span class="color-grey date-status-bg">失败</span>'
                        }else{
                            //金额
                            var amount = fund.amount;
                            if (fund.operation === "IN" || fund.operation === "FREEZE") {
                                amount = "+" + fund.amount;
                                html += '<span class="color-yellow">' + amount + '元</span>'
                            } else if (fund.operation == "OUT" || fund.operation === "RELEASE") {
                                amount = "-" + fund.amount;
                                html += '<span class="color-black">' + amount + '元</span>'
                            }
                        }
                        html += '</p>'
                        html += '</div>'
                    }
                }
                $("#funds").append(html);

            }
        },
        error: function (r) {
            console.log('error：' + r);
        }
    })
}

//截取url中的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

//获取当前年月
function getYM(){
    var mydate = new Date();
    var str = "" + mydate.getFullYear() + "-";
    if(mydate.getMonth()+1<10){
        str += '0'+(mydate.getMonth()+1);
    }else{
        str += (mydate.getMonth()+1);
    }
    return str;
}

//格式化时间
function getLocalTime(nS) {
    return new Date(nS).format("yyyy-MM-dd HH:mm:ss");
}

function setCurrentPage(page) {
    currentPage = page;
    filp(startDate, endDate);
}

function switchType(FundRecordType) {
    if (FundRecordType === "ALL") {
        $("#traType").text("全部");
    } else if (FundRecordType === "INVEST") {
        $("#traType").text("投标");
    } else if (FundRecordType === "WITHDRAW") {
        $("#traType").text("取现");
    } else if (FundRecordType === "DEPOSIT") {
        $("#traType").text("充值");
    } else if (FundRecordType === "LOAN") {
        $("#traType").text("放款");
    }
}
//点击头部日期筛选进入页面
function intoSearch(){
    window.location.href = '/view/account/search.html';
}

function backClick(){
    window.history.back(-1);
}