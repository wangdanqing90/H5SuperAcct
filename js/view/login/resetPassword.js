/**
 * Created by kylezu on 2018/4/24.
 */
$.session = {};
var userId; 
var access_token;
$(function(){
	$.setTitle('中民超级会员');
    $(".img-goBack").click(function(){
        window.history.back(-1);
    });
    //其他页面跳转过来带手机号时要自动显示
    
	if(!$.isLogin()){   	        
    	$.saveBackUrl();
    	window.location.href = '/view/account/login.html';
    }else{
    	var user = JSON.parse($.cookie('user'));
    	userId = user.userId;
    	access_token = user.token;
    }
    
   
    
    //密码格式验证
    $.validator.addMethod('regexPassword', function (value,element) {
        return $.isPassword(value);
    });
    $.validator.addMethod("correctMobile",function(value,element){
        return $.isNumber(value);
    });
    var mobileNo= JSON.parse($.cookie('user')).mobile;
    $.validator.addMethod('checkMobile', function (value,element) {   	
        return mobileNo == value?true:false;
    });
    $.validator.addMethod('checkNewPassword', function (value,element) {  
    	console.log(value == $('#oldPassword').val())
        return value == $('#oldPassword').val() ?false:true;
    });
   	 $.validator.addMethod('checkConfirmPassword', function (value,element) {   	
        return value != $('#newPassword').val() ? false:true;
    }); 
    var validator = $('#userInfoForm').validate({
        errorElement: 'div',
        errorClass: 'help-block',
        focusInvalid: false,
        rules: {
        	mobile: { required:true,correctMobile:true,rangelength:[11,11],checkMobile:true},   
            oldPassword:{required: true,maxlength: 20, minlength:8,regexPassword:true},
            newPassword:{required: true,maxlength: 20, minlength:8,regexPassword:true,checkNewPassword:true},
            confirmPassword:{required: true,maxlength: 20, minlength:8,regexPassword:true,checkConfirmPassword:true},
        },
        messages: {
        	mobile: { required: "请输入手机号码",correctMobile:"手机号码必须为数字",rangelength:"手机号码必须为11位",checkMobile:'请输入原手机号码'},    
            oldPassword: { required: "原始密码不能为空",maxlength:"密码为8-20个字符，字母+数字组合，区分大小写." , minlength:"密码为8-20个字符，字母+数字组合，区分大小写.",regexPassword:"密码为8-20个字符，字母+数字组合，区分大小写."},
            newPassword: { required: "新登录密码不能为空",maxlength:"密码为8-20个字符，字母+数字组合，区分大小写." , minlength:"密码为8-20个字符，字母+数字组合，区分大小写.",regexPassword:"密码为8-20个字符，字母+数字组合，区分大小写.",checkNewPassword:"新密码和原密码相同"},
       		confirmPassword: { required: "确认登录密码不能为空",maxlength:"密码为8-20个字符，字母+数字组合，区分大小写." , minlength:"密码为8-20个字符，字母+数字组合，区分大小写.",regexPassword:"密码为8-20个字符，字母+数字组合，区分大小写.",checkConfirmPassword:'确认密码和新密码不一致.'},
        },
        highlight: function (e) {
            $(e).closest('.form-box').removeClass('has-info').addClass('has-error');
        },
        success: function (e) {
            $(e).closest('.form-box').removeClass('has-error');
            $(e).remove();
        },
        errorPlacement: function (error, element) {
            if(element.is($("#captcha"))){
                var formBox = $(element).closest('.form-box');
                error.addClass("myself");
                formBox.removeClass('has-error');
                formBox.find(".help-block").remove();
            }
            error.insertAfter(element.parent().parent());
        }
    });
	$('input').on("focus",function(){
		$(this).parents(".row").addClass("focus");
		
	})
	$('input').on("blur",function(){
		$(this).parents(".row").removeClass("focus");
		
	})
	var $_mobile = $('#mobile');
	var $_oldPassword = $("#oldPassword");
	var $_newPassword = $("#newPassword");
	var $_confirmPassword = $('#confirmPassword'); 
	var $_btn = $(".div-btn");
	$_btn.css("background-color",'#dadada').attr("disabled","disabled");
	
	// 输入框的填写 触发btn统一处理
	$('input').on('keyup',function(){
		if(($_mobile.val()!= "") && ($_oldPassword.val()!= "") && ($_newPassword.val()!= "") && ($_confirmPassword.val()!= "")){
			$_btn.css("background-color",'#2b8fea').removeAttr("disabled");
		}else{
			$_btn.css("background-color",'#dadada').attr("disabled","disabled");
		}
	})
	
    /** 按钮[下一步] 处理@Aboruo 2016-01-28 10:49，重构了验证码，手机号校验逻辑 */
    $_btn.click(function(){
        var valiResult = validator.form();
        //统一验证
        if(valiResult) {//validator.form()
            var passWordOriginal=$("#oldPassword").val();
            var passWordNew=$("#newPassword").val();
            if(passWordOriginal == passWordNew){
            	layer.open({
				            content: "新密码与原密码相同",
				            skin: 'sure',
				            time: 2				           
	       		});
	       		return;
            }
            $.ajax({
                type:"post",
                url:"/api/saUserPw/loginPwdUpdate.do",
                dataType:"json",
                data:{
                	access_token:access_token,
                    userId:userId,
                    passWordOriginal:passWordOriginal,
                    passWordNew:passWordNew,
                },
                success:function(data){
                    if(data.code=="0000"){
//                      $.session.mobile = mobile;
						layer.open({
				            content: "修改密码成功",
				            skin: 'sure',
				            time: 2,
				            end:function(){
				            	$.exitSys();
				            	window.location="/view/account/login.html";
				            }
	       				});                       
                    }else{
                        //自己定义吧                    
                        layer.open({
				            content: data.message,
				            skin: 'sure',
				            time: 2
	       				});
                    }
                },
                error:function(data){
                    $.alert("系统错误，请稍后重试！");
                }
            });

        }
    });

    /**获取短信动态码*/
    var btnSmg = $('#btn-smg');
    var sendCount = 0;
    $('#btn-smg').click(function() {
        if($(this).attr("disabled")=="disabled"){
            return;
        }
        sendCount++;
        var flag = sendCount%2?"00":"01";
        getMobielCode(flag);
    });
    $('#gainVoiceCodeBtn').click(function() {
        getMobielCode("03");
    });
    function getMobielCode(flag) {
        var imgCaptcha=$("#captcha").val();
        var mobile=$('#mobile').val();

        if(mobile==""){
            validator.showErrors({'mobile':"请输入手机号码"});
            return;
        }
        if(mobile.length!=11){
            validator.showErrors({'mobile':"手机号码必须为11位"});
            return;
        }

        btnSmg.attr("disabled","disabled");

        var url = '/api/smsCode/getValidateCode.do';
        $.ajax({
            url:url,
            data: {
                mobile:mobile,
            },
            dataType: 'json',
            type: 'POST',
            success: function(data) {
                if(data.code=="0000"){
                    $.session.mobile = mobile;
                    interval();
                }else{
                    //自己定义吧
                    btnSmg.removeAttr("disabled");
                    $.alert(data.message);
                }
            }
        });
    }
    var btnSmgContent = btnSmg.html();
    function interval(){
        var second = 120;
        $("#mobile").attr("readonly","readonly");
        btnSmg.html(second+"秒");
        var codeInterval = setInterval(function(){
            btnSmg.html((--second)+"秒");
            if(second<0){//结束
                btnSmg.removeAttr("disabled");
                btnSmg.html(btnSmgContent);
                $("#mobile").removeAttr("readonly");
                clearInterval(codeInterval);

            }
        },1000);
    }
	//  密码眼睛点击事件
	$('.eye-off').on('click',function(){
		$(this).addClass("hide").next().removeClass("hide");
		$(this).parent().prev("div").find("input").attr("type","text");
	})
	$('.eye-open').on('click',function(){
		$(this).addClass("hide").prev().removeClass("hide");
		$(this).parent().prev("div").find("input").attr("type","password");
	})
});

//初始化验证码
