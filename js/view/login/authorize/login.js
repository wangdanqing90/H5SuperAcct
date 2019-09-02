/**
 * Created by zhg on 2019/6/20.
 */
//var channelCode = "0011"; //第三方传递值
//var type = 'app' //记录当前是登录操作
//var pageType = 'Login';
var token = ''; //证通传递的加密串
var flagName = false;
var flagPsw = false
var flagCode = false;

$(function(){
	$('.mobile_img').hide();
	$('#mobilePhone').bind('input', function(){
		var regUsername = /(?!^\d+$)(?!^[a-zA-Z]+$)^[a-zA-Z][0-9a-zA-Z]{3,19}$/;
		var regPhone =  /^1[3456789]\d{9}$/;
		if((regUsername.test(this.value) && this.value.length >0) || regPhone.test(this.value) && this.value.length > 0){
			$('.mobile_img').show();
			$('#err').hide();
			flagName = true;
		}else{
			$('.mobile_img').hide()
			$('#err').removeClass('hide');
			$('#err').show();
			flagName = false;
		}
		showBtn()
	})
	$('#password').bind('input', function(){
		if($(this).val() != ""){
			flagPsw = true;
		}else{
			flagPsw = false;
		}
		showBtn()
	})
	$('#codeInput').bind('input', function(){
		if($(this).val() != ""){
			flagCode = true;
		}else{
			flagCode = false;
		}
		showBtn()
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
	
function showBtn(){
	if((flagName && flagPsw) ||(flagName && flagCode) ){
		$('.div-btn').attr('disabled',false);
	}else{
		$('.div-btn').attr('disabled',true);
	}
}
	
//表单提交
	var $_btn = $(".div-btn");
	$_btn.click(function(){
		//判断执行的是密码登录or验证码登录
		if($('.codeLogin a').html() == '密码登录'){
			smsLogin()
		}else{
			passwordLogin()
		}
       
    });
})
//密码登录
function passwordLogin(){
	var userName=$("#mobilePhone").val();
    var password=$("#password").val();
    var param = {
        loginName:userName,
        password: password
    };
    var url = '/api/ztb/login.do'; 
    $.ajax({
            type:'post',
            url:url,
            data:param,
            dataType:'json',
            success:function(data){
            	console.log(data)
                if(data.code == "0000"){
                    token = data.data
                    var value = {
                    	token: data.data,
                    	type:'app'
                    }
                    var jsonStr = JSON.stringify(value);
                    callInterface(jsonStr);
                }else if(data.code == "0019"){
                	$.alert(data.message);
                }else{
                	$.alert(data.message)
                }
            },
            error:function(error){
            	alert(error)
            }
        });
}

//验证码登录
function smsLogin(){
	var userName=$("#mobilePhone").val();
    var validateCode=$("#codeInput").val();
    var param = {
        mobile:userName,
        validateCode: validateCode
    };
    var url = '/api/ztb/smsLogin.do'; 
    $.ajax({
            type:'post',
            url:url,
            data:param,
            dataType:'json',
            success:function(data){
            	console.log(data)
                if(data.code == "0000"){
                    var value = {
                    	token: data.data,
                    	type:'app'
                    }
                    var jsonStr = JSON.stringify(value);
                    callInterface(jsonStr);
                }else{
                	$.alert(data.message)
                }
            },
            error:function(error){
            	$.alert(error)
            }
        });
}


//登录方式
function loginType(obj){
	console.log($(obj).html())
	if($(obj).html() == "用短信验证码登录"){
		$(obj).html("密码登录");
		$('.loginLogo').html("短信验证码")
		$('.pwsLogin').hide();
		$('.login_code').removeClass('hide');
		$('#password').val('');
		$('#showPws').text('显示');
		$('#password').attr("type","password")
	}else{
		$(obj).html("用短信验证码登录");
		$('.loginLogo').html("密码登录")
		$('.pwsLogin').show();
		$('.login_code').addClass('hide');
		$('#password').val('')
	}
}
//获取验证码
var $getCodeBtn = $('.getCode');
$getCodeBtn.click(function(){
	var userName =  $.trim($('#mobilePhone').val());
	$.ajax({
		type:"post",
		url:"/api/smsCode/getValidateCode.do",
		async:false,
		data:{
			mobile:userName,
		},
		dataType:'json',
		success:function(data){			
			if(data.code=="0000"){
				interval();
			
			}else{
				var msg = data.message;
				layer.open({
		            content: msg,
		            skin: 'sure',
		            time: 2
	       		}); 
			}
		},
		error:function(error){
			layer.open({
	            content: "网络忙，请稍后再试",
	            skin: 'sure',
	            time: 2
       		}); 
		}
	});
})

function interval(){
	$getCodeBtn.attr("disabled", "disabled")
	var count = 60;
	$getCodeBtn.html(count +"s")
	var time = setInterval(function(){
		count--;
		$getCodeBtn.html(count + "s");
		if(count <=0){
			clearInterval(time);
			$getCodeBtn.html("重新获取");
			$getCodeBtn.removeAttr("disabled")
		}
	}, 1000)
}

function showBtn(){
	var userName = $('#mobilePhone').val();
	var userPassword = $('#password').val();
	if(userName != '' && userPassword != ''){
		console.log()
		$('.div-btn').attr('disabled',false)
	}else{
		$('.div-btn').attr('disabled',true)
	}
}
//回调APP方法
function callInterface(value){
    JSCallBackInterface.callback(value);
}