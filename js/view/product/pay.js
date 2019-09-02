var couponList = [];
var id = "",
	money = "";
var param = $.getUrlParam();
var loanId = param.loanId;
var money = param.money;
var couponsSize = 0;
var access_token = $.cookie('ccat');
var user;
var type_key;
var type_code;
var flag = "00";
var rewardsId="";
var couponsCode="";
var couponsDenomination="";
var parmFlag=false;
var couponsCategoryType="";
var typeMap = {
	LOW: '谨慎型',
	LOW_MEDIUM: '稳健型',
	MEDIUM: '平衡型',
	MEDIUM_HIGH: '进取型',
	HIGH: '激进型',
};

$(function() {
	$("#headName").text("支付");
	
	if($.checkProduct(param.type)){
        user = $.getUser();
		//加载页面数据
		load_pay(loanId, money);
    }  

	//勾选合同模板
	 $("#agreement").click(function(){
        if($(this).is('.cur')){
            $(this).removeClass('cur');
        }else{
            $(this).addClass('cur');
        }
    });
    
    //确认支付
    $("#pay").click(function(){
		if ($("#agreement").attr("class") != "cur") {
			layer.open({ content: "请阅读并勾选协议", skin: 'msg', time: 2 });
			return;
		}
		$('.cover_bg').show();
		//默认发送短信验证码
		getMessageCode();
    });

    //点击关闭短信验证
  	$('#close_short_message').click(function(){
  		$('#msgType').val('1');
  		$('#verifyCode').val("");//输入的验证码置空
  		$('.cover_bg').hide();
  		$('#alertMsg').hide();
  		$("#sendBut").attr("onclick", "getMessageCode();");//添加onclick事件
        window.clearInterval(interValObj);// 停止计时器
        $("#sendBut").val("获取验证码");
  	});

  	//短信验证
  	$('#shortVer').click(function(){
  		$('#msgType').val('1');//发送短信验证码时，1：短信
  		$('#verifyCode').val("");//输入的验证码置空
  		$("#sendBut").attr("onclick", "getMessageCode();");//添加onclick事件
        window.clearInterval(interValObj);// 停止计时器
        $("#sendBut").val("获取验证码");
        getMessageCode();
  	});

  	//语音验证
  	$('#voiceVer').click(function(){
  		$('#msgType').val('2');//发送短信验证码时，2：语音
  		$('#verifyCode').val("");//输入的验证码置空
  		$("#sendBut").attr("onclick", "getMessageCode();");//添加onclick事件
        window.clearInterval(interValObj);// 停止计时器
        $("#sendBut").val("获取验证码");
  		getMessageCode();
  	});
});

var couponAmount = 0;
//加载支付页面
function load_pay(id, money) {
	var data = $.getProductInfo(loanId);
	var obj = eval('(' + data.loanRequest.clientPriv + ')');
	var risk = obj.productRiskLevel;
	var riskLevel = typeMap[obj.productRiskLevel];
	if(data.loanRequest.exchangeType != null && data.loanRequest.exchangeType.codeName != null) {
		type_key = data.loanRequest.exchangeType.codeName;
		type_code = data.loanRequest.exchangeType.code;
	}
	var da1 = data.loanRequest;
	var da2 = data.loanRequest.clientPriv;
	var da3 = data.loanRequest.clientPriv.productRiskLevel;
	var pay_header_html = "<h1>" + data.title + "</h1><p><span>预期年化收益率</span><label>" + data.rate / 100 + "%</label></p><p><span>投资期限</span>" +
		"<label>" + data.duration.totalDays + "天</label></p><p><span>配置建议</span><label>" + riskLevel + "</label></p><p><span>收益分配方式</span>" +
		"<label>" + "一次性付本还息" + "</label></p><p><span>投资人</span><label>" + user.name + "</label></p><p><span>投资金额</span><label>" + money + "元</label></p>";
	$(".pay_p").html(pay_header_html);

	search(null, null);

	var yhq_html = "<p id=\"selectCoupon\" onclick=\"goCoupon();\"><span>优惠券</span><em><img src=\"/img/tr.png\"></em>";
	yhq_html += "<label id=\"couponAvailable\">有" + couponsSize + "张可用</label></p>";
	yhq_html += "<p><b>实付金额</b><label><i id=\"paidAmount\">" + money + "</i>元</label></p>";
	yhq_html += "<input type=\"hidden\" id=\"couponId\" value=\"\" />";
	$("#coupon").html(yhq_html);

	/*var couponId = GetQueryString('couponId');//优惠券id
	var couponMoney = GetQueryString('couponMoney');//优惠券金额
	var couponName = decodeURI(GetQueryString('couponName'));//优惠券名称
	if (checkNull(couponId)) {
		$('#couponAvailable').text(couponName);
		$('#paidAmount').text(money - couponMoney);
		$('#couponId').val(couponId);
	}
	//如果是从“我的优惠券”点击使用过来的产品支付，则为不可修改状态
	if (checkNull(GetQueryString('couponFlg'))) {
	    $('#paidAmount').text("0.00");
	    $('#couponAvailable').text(decodeURI(GetQueryString('couponFlg')));
	    $('#selectCoupon').removeAttr('onclick');
	}*/
	var fundData = $.getUserFund();
	var yhq_pay_html = "<p><b>余额支付</b><a href=\"/view/account/partials/recharge.html?productId=" + id + "&money=" + money + "\">充值</a>";
	yhq_pay_html += "<label>可用余额<i id=\"available_balance\">" + fundData.availableAmount + "</i>元</label></p>";
	$("#payWay").html(yhq_pay_html);

	//协议展示
	if(type_key && type_key.indexOf("温金中心") > -1) {
		$("#contract").css("display", "block");
		$("#contract").html("<a href='http://zmit-sh-2.oss-cn-shanghai.aliyuncs.com/wjs_Subscription_agreement.pdf' target='_blank'><img src='/img/file.png'><span>《产品协议书》</span><em><img src='/img/tr.png'></em></a>");
		$("#account-div").css("display", "block");
		$("#account-div").html("<a href='http://zmit-sh-2.oss-cn-shanghai.aliyuncs.com/wjs_service_agreement.pdf' target='_blank'><img src='/img/file.png'><span>《温金中心个人会员服务协议》</span><em><img src='/img/tr.png'></em></a>");
	} else if(type_key && type_key.indexOf("苏交所") > -1) {
		$("#contract").css("display", "block");
		$("#contract").html("<a href='https://zmit-sh-2.oss-cn-shanghai.aliyuncs.com/sjs_blank.pdf' target='_blank'><img src='/img/file.png'><span>《产品协议书》</span><em><img src='/img/tr.png'></em></a>");
	} else if(type_key && type_key.indexOf("安金所") > -1) {
		if(data.loanRequest.dingRong == 1) {
			$("#contract").css("display", "block");
			$("#contract").html("<a href='http://zmit-sh-2.oss-cn-shanghai.aliyuncs.com/ajsdr_Subscription_agreement.pdf' target='_blank'><img src='/img/file.png'><span>《产品协议书》</span><em><img src='/img/tr.png'></em></a>");
			$("#account-div").css("display", "block");
			$("#account-div").html("<a href='http://zmit-sh-2.oss-cn-shanghai.aliyuncs.com/ajs_service_agreement.pdf' target='_blank'><img src='/img/file.png'><span>《个人会员服务协议》</span><em><img src='/img/tr.png'></em></a>");
		} else {
			$("#contract").css("display", "block");
			$("#contract").html("<a href='http://zmit-sh-2.oss-cn-shanghai.aliyuncs.com/ajs_Subscription_agreement.pdf' target='_blank'><img src='/img/file.png'><span>《产品协议书》</span><em><img src='/img/tr.png'></em></a>");
			$("#account-div").css("display", "block");
			$("#account-div").html("<a href='http://zmit-sh-2.oss-cn-shanghai.aliyuncs.com/ajs_service_agreement.pdf' target='_blank'><img src='/img/file.png'><span>《个人会员服务协议》</span><em><img src='/img/tr.png'></em></a>");
		}
	} else if(title && title.indexOf("粤股交") > -1) {
		$("#contract").css("display", "block");
		$("#contract").html("<a href='http://cmiinv.oss-cn-hangzhou.aliyuncs.com/%28new%29%E5%A7%94%E6%89%98%E8%B4%B7%E6%AC%BE%E8%B5%84%E4%BA%A7%E8%BD%AC%E8%AE%A9%E5%8D%8F%E8%AE%AE-%E5%AF%8C%E6%BB%A1%E6%BA%A2-%E7%A9%BA%E7%99%BD%E5%8D%8F%E8%AE%AE.pdf' target='_blank'><img src='/img/file.png'><span>《产品协议书》</span><em><img src='/img/tr.png'></em></a>");
		$("#account-div").css("display", "block");
		$("#account-div").html("<a href='https://cm-file.b0.upaiyun.com/2016051202.pdf' target='_blank'><img src='/img/file.png'><span>《开户协议》</span><em><img src='/img/tr.png'></em></a>");

	} else if(title && title.indexOf("保得利") > -1) {
		$("#contract").css("display", "block");
		$("#contract").html("<a href='https://cmiinv.b0.upaiyun.com/%EF%BC%88%E4%BF%9D%E5%BE%97%E5%88%A9%E5%88%9B%E7%BD%AE%EF%BC%89%E5%AE%9A%E5%90%91%E5%A7%94%E6%89%98%E6%8A%95%E8%B5%84%E7%AE%A1%E7%90%86%E5%8D%8F%E8%AE%AE.pdf' target='_blank'><img src='/img/file.png'><span>《产品协议书》</span><em><img src='/img/tr.png'></em></a>");
	} else if(productKey == "BANK") {
		$("#contract").css("display", "block");
		$("#contract").html("<a href='http://cmiinv.oss-cn-hangzhou.aliyuncs.com/bank.pdf' target='_blank'><img src='/img/file.png'><span>《产品协议书》</span><em><img src='/img/tr.png'></em></a>");
	} else {
		$("#contract").css("display", "block");
		$("#contract").html("<a href='http://cmiinv.oss-cn-hangzhou.aliyuncs.com/%28new%29%E5%A7%94%E6%89%98%E8%B4%B7%E6%AC%BE%E8%B5%84%E4%BA%A7%E8%BD%AC%E8%AE%A9%E5%8D%8F%E8%AE%AE-%E5%AF%8C%E6%BB%A1%E6%BA%A2-%E7%A9%BA%E7%99%BD%E5%8D%8F%E8%AE%AE.pdf' target='_blank'><img src='/img/file.png'><span>《产品协议书》</span><em><img src='/img/tr.png'></em></a>");
	}
	
		
	//可购买 按钮可点	
	 if ($('#available_balance').text() - $('#paidAmount').text() > 0) {               	
        $("#pay").attr({"style":"background:#fc6643","disabled":false});
    }
}

//优惠券
function search(status, type) {
	$.checkServerAuthorizeStatus("V7");
	var authorizeCode = $.cookie("v7token");
	$.ajax({
		type: 'get',
		url: '/api/v7/rewardsforuser/getUserRewardsByCondition.do',
		data: {
			platformId: 1,
			userId: user.id,
			phone: user.mobile,
			status: status,
			couponsCategoryType: type,
			authorizeCode: authorizeCode
		},
		dataType: 'json',
		async: false,
		success: function(data) {
			/* accountRactive.set("coupons.couponsObj",[]);*/
			var statusCount = data.data.statusCount;

			couponsSize = statusCount.length;
			/*            $.each(statusCount,function(key,value){
			                    switch(value.status){
			                        case 2:
			                            couponsSize = value.couponsSize;
			                            break;                      
			                    }
			            });   */
		},
		error: function(error) {
			console.log('系统出现错误: ' + JSON.stringify(error));
		}
	});
}

//去选择优惠券页面
function goCoupon() {
	if(couponAmount > 0) {
		window.location.href = '/view/account/coupon/selectCoupon.html?productId=' + id + "&money=" + money;
	}
}

/**
 * [getMessageCode 发送短信/语音验证码]
 * @param  {[String]} type [1：短信，2：语音]
 */
function getMessageCode() {
     if(!$.isLogin()) {
     	layer.open({
			content: '未登录或会话超时,请重新登录',
			skin: 'msg',
			time: 3,
			end: function() {
				setFailLocationUrl();
				window.location.href = '/view/login/login.html';
			}
		});
		return;
     }
 
	 $("#sendBut").attr("disabled","disabled");
        $.ajax({
            type:"post",
            url: '/api/v2/smsCaptchaWithFlag/'+user.id,
            data:{
                smsType:"CONFIRM_CREDITMARKET_TENDER",
                smsFlag:flag
            },
            dataType:"json",
            async:false,
            success:function(data){
                if(data.success){
                	curCount = count;
				    $("#sendBut").removeAttr("onclick"); //移除onclick事件
				    $("#sendBut").removeClass("orange"); //按钮置灰
                    interValObj = window.setInterval(setTime, 1000); 
                }else{
                    $("#sendBut").removeAttr("disabled");
                    $.alert("获取动态码失败");
                }
            },
            error:function(){
                console.log("系统错误");
            }
        });
	/*$.ajax({
		type: "Get",
		url: APP_URL + "/platinfo/sendMsg.htm",
		data: {
			"phone": userInfo.phoneNumber,
			"type": $('#msgType').val(),
			"moudle": "3", //购买产品
			"param": GetQueryString("productId")
		},
		cache: false,
		dateType: "json",
		success: function(data) {
			if(data.code == 000000) {
				//验证码发送成功
				layer.open({
					content: data.description,
					skin: 'msg',
					time: 2
				});
				$('#alertMsg').show();
				$('#tailNumber').text(userInfo.phoneNumber.substr(7));
				curCount = count;
				$("#sendBut").removeAttr("onclick"); //移除onclick事件
				$("#sendBut").removeClass("orange"); //按钮置灰
				// 设置button效果，开始计时
				interValObj = window.setInterval(setTime, 1000); // 启动计时器，1秒执行一次
				return;
			} else {
				//验证码发送失败
				$('.error_tk').show();
				setTimeout(function() {
					$('.error_tk').hide();
				}, 3000);
				curCount = count;
				$("#sendBut").removeAttr("onclick"); //移除onclick事件
				$("#sendBut").removeClass("orange"); //按钮置灰
				// 设置button效果，开始计时
				interValObj = window.setInterval(setTime, 1000); // 启动计时器，1秒执行一次
				return;
			}
		},
		error: function(e) {
			console.log("error:" + e);
		}
	});*/
}




var interValObj; // timer变量，控制时间
var count = 120; // 间隔函数，1秒执行
var curCount; // 当前剩余秒数
function setTime() {
	if(curCount == 0) {
		$("#sendBut").attr("onclick", "getMessageCode();"); //添加onclick事件
		window.clearInterval(interValObj); // 停止计时器
		$("#sendBut").val("获取验证码");
		$("#sendBut").addClass("orange");
	} else {
		curCount--;
		$("#sendBut").val(curCount + "秒后可重发");
	}
}

/**
 * [checkVerifyCode 验证短信验证码]
 * 验证成功后，调用confirmPay方法
 */
function checkVerifyCode() {
	 var smscaptcha = $.trim($('#verifyCode').val());
        if (!smscaptcha.length) {
            layer.open({
			content: '请填写短信验证码',
			skin: 'msg',
			time: 3,
			end: function() {
			}
		});
            return false;
        }

        //验证短信验证码
        var checkSmsPara = "smsCaptcha="+smscaptcha+"&smsType=CONFIRM_CREDITMARKET_TENDER";
        $.ajax({
            url: '/api/v2/checkSMSCaptcha/'+user.id+'?access_token='+access_token,
            contentType: "application/x-www-form-urlencoded",
            data: checkSmsPara,
            dataType: 'json',
            type: 'POST'
        }).done(function (data) {
            if (!data.success) {
                layer.open({
			    content: '验证码无效或已过期',
			    skin: 'msg',
			    time: 3,
			    end: function() {

			    }
	     	});
		     return;
            } else{
                if (param.productKey != 'BANK' || !param.productRisk) {
                    doInvest(smscaptcha);
                    return;
                }
                $.get('/api/v2/user/'+user.id+'/surveyFilling?access_token='+access_token, function (o) {
                    var filling = o[0];
                    if(filling&&filling.rank){
                        if(userRiskMap[filling.rank].indexOf(param.productRisk)<0){                        
                            $.alert('您的风险等级为(' + confirmRactive.get("riskLevelMap")[filling.rank] + ')，不适合购买此产品(' + productMap[param.productRisk]+')，适合购买(' + productMap[filling.rank] +'),或者重新进行评估！',null,function(){
                                 history.go(-1);
                            });
                            return;
                        }
                    }else{                     
                        $.confirm('您还没有进行风险等级评估！不能购买银行理财类产品，是否现在进行评估？',null,function(v){
                            if(v=="ok"){
                                location.href="/view/account/account.html?currentPage=risk";
                            }
                        });
                    }
                    doInvest(smscaptcha);
                });
            }
        });
	
	
	/*$.ajax({
		type: "Get",
		url: APP_URL + "/platinfo/checkVerifyCode.htm",
		data: {
			"verifyCode": $('#verifyCode').val(),
			"moudle": '3' //购买产品
		},
		dateType: "json",
		success: function(data) {
			if(data.code == 000000) {
				//验证短信验证码成功
				//确认提交充值
				confirmPay();
			} else {
				//验证短信验证码失败
				$('.error_tk').show();
				setTimeout(function() {
					$('.error_tk').hide();
				}, 2000);
				return;
			}
		},
		error: function(e) {
			console.log("error:" + e);
		}
	});*/
}

/**
 * [confirmPay 确认支付]
 */

 function doInvest(smscaptcha) {
        $("#confirm").attr("disabled","disabled");
        $("#confirm").html("申请中");
        $("#confirm").css("background-color","#ccc");
        var amount = $('#paidAmount').html();

        $.ajax({
            url: '/api/v2/invest/tender/'+user.id+'?access_token='+access_token,
            contentType: "application/x-www-form-urlencoded",
            data: {
                loanId : param.loanId,
                smsCaptcha : smscaptcha,
                amount :amount,
                rewardsId : rewardsId,
                couponsCode : couponsCode,
                couponsDenomination : couponsDenomination,
                source : "WEB",
                address:decodeURI(param.address),
                flag:parmFlag,
                couponsCategoryType:couponsCategoryType
            },
            dataType: 'json',
            type: 'POST'
        }).done(function (data) {
            $("#confirm").removeAttr("disabled");;
            $("#confirm").html("确认");
            $("#confirm").css("background-color","#C73E34");
            if (data.success) {
               window.location.href = '/view/product/success.html';
            } 
           
        });
    }


/*function confirmPay() {
	var id = GetQueryString("productId");
	var money = GetQueryString("money");
	$.ajax({
		url: APP_URL + "/pay/payInvest.htm",
		type: 'Post',
		async: false,
		data: {
			"id": id,
			"money": money,
			"hbRule": $('#couponId').val(),
			"source": "WAP"
		},
		success: function(data) {
			console.log("resStr:" + JSON.stringify(data));
			if(data.code == "000000") {
				window.location.href = '/view/product/success.html';
			} else {
				layer.open({
					content: data.description,
					skin: 'msg',
					time: 2,
					end: function() {
						window.location.href = '/view/product/error.html';
					}
				});
			}
		},
		error: function(e) {
			console.log("error:" + e);
		}
	});
}*/