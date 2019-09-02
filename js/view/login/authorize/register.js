/**
 * Created by zhg on 2019/6/20.
 */
var channelCode = "0011"; //第三方传递值
var type = 'app' //记录当前是登录操作
var pageType = 'Login';
var token = ''; //证通传递的加密串
var flagUser=false;
var flagPhone = false;
var flagImg = false;
var flagCode = false;
var codeValue = ""


$(function(){
	$('#backTo').click(function(){
		if($('.regUserInfo').hasClass('hide')){
			console.log('1')
			window.location.reload();
		}else{
			console.log("2")
			window.history.go(-1);
		}
		
	})
	$('.username_img').hide();
	
	$('#mobilePhone').bind('input', function(){
//		var regUsername = /^[a-zA-Z]{1}[A-Z|a-z|0-9]{5,29}/;
		var regUsername =  /(?!^\d+$)(?!^[a-zA-Z]+$)^[a-zA-Z][0-9a-zA-Z]{3,19}$/
		if(regUsername.test(this.value) && this.value.length >0){
			$('.username_img').removeClass('hide');
			$('.username_img').show();
			$('#err').hide();
			flagUser = true
		}else{
			$('.username_img').hide()
			$('#err').removeClass('hide');
			$('#err').show();
			flagUser =false;
		}
		showBtn();
	})
	$('#phone').bind('input', function(){
		var regPhone =  /^1[3456789]\d{9}$/;
		if(regPhone.test(this.value) && this.value.length >0){
			$('.phone_img').removeClass('hide');
			$('.phone_img').show();
			$('#err').hide();
			flagPhone = true;
		}else{
			$('.phone_img').hide()
			$('#err').removeClass('hide');
			$('#err').show();
			flagPhone = false
		}
		showBtn()
	})
	
	
})
$('#showPws').click(function(){
	if($(this).text() == "显示"){
		$(this).text("隐藏")
		$('#password').attr("type", "text");
	}else{
		$(this).text('显示');
		$('#password').attr("type", "password");
	}
})

//登录方式
function loginType(obj){
	console.log($(obj).html())
	if($(obj).html() == "用短信验证码登录"){
		$(obj).html("密码登录");
		$('.pwsLogin').hide();
		$('.login_code').removeClass('hide');
	}else{
		$(obj).html("用短信验证码登录");
		$('.pwsLogin').show();
		$('.login_code').addClass('hide');
	}
}
//获取验证码
//function getCode(obj){
//	var count = 60;
//	var time = setInterval(function(){
//		count--;
//		$(obj).html(count);
//		if(count <=0){
//			clearInterval(time)
//		}
//	}, 1000)
//}


function showBtn(){
	if(flagUser && flagPhone && flagImg){
		$('.step_first_btn').attr('disabled',false);
	}else{
		$('.step_first_btn').attr('disabled',true);
	}
}
//点击阅读
function readTreaty(obj){
	var src = $(obj).attr("src");
	if(src == "../../../img/authorize/uncheck.png"){
		$('#treaty').attr("src","../../../img/authorize/check.png");
		flagImg = true;
	}else{
		$('#treaty').attr("src","../../../img/authorize/uncheck.png");
		flagImg = false;
	}
	showBtn()
}
//注册下一步，验证码 --- 先校验手机号是否已经注册
function stepFirstBtn(obj){
	var mobile = $('#phone').val();
//	if($.isNullOrBlank(mobile)){
//		console.log('11')
//		$(input).val('');
//		$('#treaty').attr("src","../../../img/authorize/uncheck.png");
//		return false;
//	}else{
		console.log('22')
		$('.regUserInfo').hide();
		$('.regGetCode').removeClass('hide');
		$('.step_first').hide();
		$('.step_two').removeClass('hide');
		
		
		
//	}
}
function stepSendBtn(obj){
	$('.setPassword').hide();
	$('.setPassword').removeClass('.hide').show();
	codeValue = $(".codeValue").val();
	console.log(codeValue)
}

var urlCheckMobile = '/api/check/checkMobile.do';

//获取验证码
function getCode(obj){
	var urlGetCheckCodePhone = '/api/smsCode/getValidateCode.do';
        var phoneNum = $('#phone').val();
        var param = {}; //请求参数包含手机号
        param.mobile = phoneNum;
        param.channelCode="WEB";

        /** ① 校验手机号是否已经注册 */
        $.ajax({
            type:"post",
            url:urlCheckMobile,
            data:param,
            dataType:"json",
            async:false,
            success:function(data){
                if(data.code=="0000"){
                    /** ② 如果手机号校验通过,则获取短信验证码 */
                    getCheckCodePhone(param,urlGetCheckCodePhone);

                }else{
//                  mobileCodeBtn.removeAttr("disabled");
                    /** ③ 手机号已经存在等提示信息则在页面上展示相应的提示信息 */
                    $.alert(data.message);
                }
            },
            error:function(){
                console.log("系统错误");
            }
        });
}

 function getCheckCodePhone(param,urlGetCheckCodePhone){
        $.ajax({
            type:'post',
            url:urlGetCheckCodePhone,
            data:param,
            dataType:'json',
            async:false,
            success: function (results) {
                if(results.code == "0000"){
                    interval()
               }else{
//             		 $('.step_two_btn').removeAttr("disabled");
                    /** 解析失败信息,并采取相应操作 */
                    $.alert(results.message);
                }
            },
            error: function () {
                console.log("系统错误");
            }
        });
    }

function interval(){
	var second = 120;
    $('#codeBtn').html('120s');
    var codeInterval = setInterval(function(){
    	second--;
        $('#codeBtn').html(second +"s");
        if(second<0){//结束
            clearInterval(codeInterval);
             $('#codeBtn').html("重新获取");
        }
    },1000);
}

$('.codeValue').bind('input', function(){
	if($(this).val().length > 0){
		$('.step_two_btn').attr("disabled", false)
	}else{
		$('.step_two_btn').attr("disabled", true)
	}
})
