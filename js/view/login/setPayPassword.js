/**
 * Created by kylezu on 2018/4/24.
 */
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
    var validator = $('#userInfoForm').validate({
        errorElement: 'div',
        errorClass: 'help-block',
        focusInvalid: false,
        rules: {
            password:{required: true,maxlength: 20, minlength:8,regexPassword:true},
        },
        messages: {
            password: { required: "密码不能为空",maxlength:"最多20个字符" , minlength:"密码至少为8位",regexPassword:"最短8位,字母+数字组合."},
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

	 //  密码眼睛点击事件
	$('.eye-off').on('click',function(){
		$(this).addClass("hide").next().removeClass("hide");
		$(this).parent().prev("div").find("input").attr("type","text");
	})
	$('.eye-open').on('click',function(){
		$(this).addClass("hide").prev().removeClass("hide");
		$(this).parent().prev("div").find("input").attr("type","password");
	})
	var $_btn = $(".div-btn");
	$('input').on('keyup',function(){
		var valiResult = validator.form();
		if(valiResult){
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
            var password=$("#password").val();
            $.ajax({
                url:'/api/user/traderPwdSet.do',
                data: {
                	access_token:access_token,
                    userId:userId,
                    passWord:password,
                },
                dataType: 'json',
                type: 'POST',
                success:function(data){
                    if(data.code=="0000"){
                    	layer.open({
				            content: "设置交易密码成功",
				            skin: 'sure',
				            time: 2,
				            end:function(){
				            	window.location="/view/account/myAccount.html";
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
});
