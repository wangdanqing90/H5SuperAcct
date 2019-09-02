/**
 * Created by kylezu on 2018/4/24.
 */
$.session = {};
var userId;
$(function(){
	$.setTitle('中民超级会员');
    $(".img-goBack").click(function(){
        window.history.back(-1);
    });
    //其他页面跳转过来带手机号时要自动显示
    var user = $.cookie("user");
    user = eval('(' + user + ')');
    if(user&&user.mobile){
        $("#mobile").val(user.mobile);
    }

    //密码格式验证
    $.validator.addMethod('regexPassword', function (value,element) {
        return $.isPassword(value);
    });
    $.validator.addMethod("correctMobile",function(value,element){
        return $.isNumber(value);
    });
    $('input').on("focus",function(){
		$(this).parents(".row").css({"border":"1px solid #2b8fea"})
		
	})
	$('input').on("blur",function(){
		$(this).parents(".row").css({"border":"1px solid #ccc"})
		
	})
    var validator = $('#userInfoForm').validate({
        errorElement: 'div',
        errorClass: 'help-block',
        focusInvalid: false,
        rules: {
            mobile: { required:true,rangelength:[11,11],correctMobile:true},
            smsCaptcha: {  required: true, rangelength:[6,6]},
            password:{required: true,maxlength: 20, minlength:8,regexPassword:true},
        },
        messages: {
            mobile: { required: "请输入手机号码",rangelength:"手机号码必须为11位",correctMobile:"手机号码必须为数字"},
            smsCaptcha: { required: "短信验证码不能为空" , rangelength:"短信验证码必须为6位"},
            password: { required: "密码为8-20个字符，字母+数字组合，区分大小写.",maxlength:"密码为8-20个字符，字母+数字组合，区分大小写." , minlength:"密码为8-20个字符，字母+数字组合，区分大小写.",regexPassword:"密码为8-20个字符，字母+数字组合，区分大小写."},
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

    /** 按钮[下一步] 处理@Aboruo 2016-01-28 10:49，重构了验证码，手机号校验逻辑 */
   	var $_mobile = $("#mobile");
	var $_password = $("#password");
	var $_smsCaptcha=$("#captchaInput")
	var $_btn = $(".div-btn");
	 $_mobile.on("input propertychange",function(){
		if($_password.val()!= ""&& $(this).val()!="" && $_smsCaptcha.val()!=""){			
			$_btn.css("background-color",'#2b8fea').removeAttr("disabled");
		}else{			
			$_btn.css("background-color",'#dadada').attr("disabled","disabled");
		}		
	})
	$_password.on("input propertychange",function(){
		if($_mobile.val()!= ""&& $(this).val()!="" && $_smsCaptcha.val()!=""){			
			$_btn.css("background-color",'#2b8fea').removeAttr("disabled");
		}else{	
			$_btn.css("background-color",'#dadada').attr("disabled","disabled");
		}		
	})
   	$_smsCaptcha.on("input propertychange",function(){
		if($_mobile.val()!= ""&& $(this).val()!="" && $_password.val()!=""){			
			$_btn.css("background-color",'#2b8fea').removeAttr("disabled");
		}else{		
			$_btn.css("background-color",'#dadada').attr("disabled","disabled");
		}		
	})
   
    $(".div-btn").click(function(){
        var valiResult = validator.form();
        //统一验证
        if(valiResult) {//validator.form()

            var mobile=$("#mobile").val().trim();
            var smsCaptcha=$("#captchaInput").val();
            var password=$("#password").val();
            $.ajax({
                type:"post",
                url:"/api/user/findPwd.do",
                dataType:"json",
                data:{
                    phone:mobile,
                    smsCode:smsCaptcha,
                    password:password,
                },
                success:function(data){
                    if(data.code=="0000"){
                        $.session.mobile = mobile;
                        window.location="/view/account/login.html";
                    }else{
                        //自己定义吧
                        $.alert(data.message);
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
        $("#mobile").attr("readonly",true);
        var second = 120;      
        btnSmg.html(second+"秒");
        var codeInterval = setInterval(function(){
            btnSmg.html((--second)+"秒");
            if(second<0){//结束
                $("#mobile").attr("readonly",false);
                btnSmg.removeAttr("disabled");
                btnSmg.html(btnSmgContent);            
                clearInterval(codeInterval);

            }
        },1000);
    }


});

//初始化验证码
