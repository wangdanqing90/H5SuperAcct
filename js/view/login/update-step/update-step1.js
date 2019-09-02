$(function(){	
	/** 添加手机号验证 */
    $.validator.addMethod("correctMobile",function(value,element){
        return $.isNumber(value);
    });

    /** 添加密码规则验证 */
    $.validator.addMethod('regexPassword', function (value,element) {
        return $.isPassword(value);
    });

	var validator = $('#validation-reg').validate({
        errorElement: 'div',
        errorClass: 'help-block',
        focusInvalid: false,
        rules: {        
            password: {  required: true, maxlength: 20,  minlength: 8,regexPassword:true},        
            mobile: { required:true,rangelength:[11,11],correctMobile:true},          
        },
        messages: {       
            password: { required: "密码为8-20个字符，字母+数字组合，区分大小写." ,maxlength:"密码须为最短8位字母+数字组合.", minlength:"密码为8-20个字符，字母+数字组合，区分大小写.",regexPassword:"密码为8-20个字符，字母+数字组合，区分大小写."},
            mobile: { required: "请输入手机号码",rangelength:"手机号码必须为11位",correctMobile:"手机号码必须为数字"},
          
        },
        highlight: function (e) {
            $(e).closest('.form-box').removeClass('has-info').addClass('has-error');
        },
        success: function (e) {
            $(e).closest('.form-box').removeClass('has-error');
            $(e).remove();
        },
        errorPlacement: function (error, element) {
            //这个地方当输入框失去焦点时，正确情况也走，纳闷了，但是传进来的error是空div判断下，如果是空则不清除提示信息
            if(error.text()){
                element.closest('.form-box').find(".placeInfo").remove();
            }
            error.insertAfter(element.parent().parent());
        }
    });

	if(user&&user.mobile){
        // $("[name=mobile]").val(user.mobile);
        $("[name=mobile]").val();
    } 
    $('input').on("focus",function(){
		$(this).parents(".row").addClass("focus");
		
	})
	$('input').on("blur",function(){
		$(this).parents(".row").removeClass("focus");
		
	})
	var $_mobile = $("#mobile");
	var $_password = $("#password");
	var $_btn = $("#next");
	$_btn.css("background-color",'#dadada').attr("disabled","disabled");
	 $_mobile.on("keyup",function(){
		if($_password.val()!= ""&& $(this).val()!=""){
			$_btn.css("background-color",'#2b8fea').removeAttr("disabled");
		}else{
			$_btn.css("background-color",'#dadada').attr("disabled","disabled");
		}		
	})
	$_password.on("keyup",function(){
		if($_mobile.val()!= ""&& $(this).val()!=""){
			$_btn.css("background-color",'#2b8fea').removeAttr("disabled","disabled");
		}else{
			$_btn.css("background-color",'#dadada').attr("disabled","disabled");
		}		
	})
	$('#next').click(function(){
		$(this).css("background-color",'#1e74c2');
		var result= validator.form();
		if(result){ changeMobileStep();
		}else{
			$(this).css("background-color",'#2b8fea');	
		}
//		if(user.mobile == $("#mobile").val()){
//			result= validator.form();
//			if(result) changeMobileStep();			
//		}else{
//			validator.showErrors({'mobile':'请输入正确手机号'});
//		}		
	})
	
})


 //第一步验证手机号和密码的接口
 function changeMobileStep(){ 
 		$("#next").css("background-color",'#2b8fea');
 		var user = JSON.parse($.cookie('user'));
 		var access_token = user.token; 				
 		var userId = user.userId;
 	    mobile = $("#mobile").val();
 	    password = $("#password").val();
 	    if(user.mobile != mobile){
				layer.open({
				            content: "原手机号不正确",
				            skin: 'sure',
				            time: 2
	       		});
	       		
	       		return false;
		}
        var params={
        	 	password:  password,
             	phone: mobile,
             	userId:userId,
             	access_token:access_token,
        };
            $.ajax({
                url:'/api/user/verifyPwd.do',
                dataType: 'json',
                type: 'post',
                data: params,
                async: false,
                dataType:'json',
                success: function (data) {
                  var code  = data.code;
                  var msg = data.message;                                  
       			 	if(code=="0000"){
       			 	updateRactive.set("wizardClass",2);      			 	
       			  }else{
       			  	layer.open({
			            content: msg,			           
			            skin: 'sure',
			            time: 2
       			 	});
       			  }
       			 
                },
                error: function (e) {
                    console.log("error:" + e);                    
                }
            });
        
    };