var access_token = $.cookie('ccat');
var userId = null;
var flag = "00";
var bank={
	BOC: {name: '中国银行',src:"bank_4.png"},
        CCB: {name: '中国建设银行',src:"bank_5.png"},
        BOCOM: {name: '交通银行',src:"bank_6.png"},
        ABC: {name: '中国农业银行',src:"bank_3.png"},
        CMB: {name: '招商银行',src:"bank_12.png"},
        PSBC: {name: '邮政储蓄银行',src:"bank_1.png"},
        CMBC: {name: '中国民生银行',src:"bank_9.png"},
        SPDB: {name: '浦东发展银行',src:"bank_15.png"},
        BOS: {name: '上海银行',  src:"bank_17.png"},
        CIB: {name: '兴业银行', src:"bank_13.png"},
        GDB: {name: '广发银行', src:"bank_10.png"},
        CITIC: {name: '中信银行', src:"bank_7.png"},
        CEB: {name: '中国光大银行', src:"bank_8.png"},
        HXB: {name: '华夏银行', src:"bank_14.png"},
        PINGAN: {name: '平安银行', classNo: 15},
        ICBC: {name: '中国工商银行', src:"bank_2.png"}
}
$(function(){	
	$("#headName").text('提现');
	if($.isLogin()){			
	    var user = $.getUser();                
		userId = user.id;
		var Bank =$.getBankInfo(userId);
		var bankNum="尾号" + Bank.account.substr(15,19);
		var bankType=Bank.bank;			
		var bankName = bank[bankType].name;
		$("#bankName").text(bankName);
		$("#bankNum").text(bankNum);
		$('#bankImg').attr("src","/img/bankicon/"+bank[bankType].src);
		//用户当前余额
		var acount=$.getUserFund().availableAmount;
		$('#account').text(acount);				
		console.log(bankName);
		var bankcoreBamkCode = Bank.coreBankCode;								               
	
	}else{
        $.confirm("您还未登录或登录超时，请登录后操作",null,function(v){
            if(v=="ok"){
                $.goLogin();
            }
        });
    }
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
	
})

function backClick(){
	location.href="/view/account/index.html"	
}
var interValObj; // timer变量，控制时间
var count = 120; // 间隔函数，1秒执行
var curCount; // 当前剩余秒数
function setTime(){
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
            url: '/api/v2/smsCaptchaWithFlag/'+userId,
            data:{
                smsType:"CONFIRM_CREDITMARKET_WITHDRAW",
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
    }
function submit(){	 	
		var amount = $('.recharge-amount input').val();
		if(amount!=null && amount!=""){
			$('.cover_bg').show();
			//默认发送短信验证码
			getMessageCode();
		}else{
			layer.open({ content: "请输入金额", skin: 'msg', time: 2 });
			return;
		}
}
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
        var checkSmsPara = "smsCaptcha="+smscaptcha+"&smsType=CONFIRM_CREDITMARKET_WITHDRAW";
        $.ajax({
            url: '/api/v2/checkSMSCaptcha/'+userId+'?access_token='+access_token,
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
                  var withDrawUrl = '/api/v2/chinapay/withdraw/MYSELF';
		        var withDrawParam = {};
		        withDrawParam.amount =$(".recharge-amount input").val();
		        withDrawParam.smsCaptcha = smscaptcha;     
		        $.ajax({
		            type:'post',
		            url:withDrawUrl,
		            data:withDrawParam,
		            dataType:'json',
		            async:false,
		            success: function (results) {
		                if(results.success){
		                	$('.cover_bg').hide();
		                    /** 提现成功后要重新刷新账户余额和提现金额框金额 */
		                    $.alert("申请成功，预计将在1-2个工作日到账",null,function(){
		                        //var availableAmount = $.getUserFund().availableAmount;
		                        //accountRactive.set('withDraw.inputAmount',Number(availableAmount) > Number(withDrawParam.amount) ? Number(withDrawParam.amount) : Number(availableAmount));
		                        //accountRactive.set("withDraw.availableAmount",availableAmount);
		                        //initView();
		                        location.reload();
		                    });
		                    /** @zhaoxinbo 添加了用户操作记录 2017-01-04 15:02 */
		                    $.notesUserVisit({page_name:'提现页面',function_name:'用户提现',user_action:'提现',action_result_status:1,action_result:"提现成功"});
		                }else{
		                    $.alert('提现出现出现错误....');
		                    /** @zhaoxinbo 添加了用户操作记录 2017-01-04 15:02 */
		                    $.notesUserVisit({page_name:'提现页面',function_name:'用户提现',user_action:'提现',action_result_status:0,action_result:"提现失败"});
		                }
		            }
		        }); 
            }
        });
}