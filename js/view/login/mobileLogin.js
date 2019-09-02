var validator2;
var userData;
var access_token;
$(function(){	
	$.setTitle('中民超级会员');
    $(".img-goBack").click(function(){
        window.history.back(-1);
    });
	
    /** 添加手机号验证 */
    $.validator.addMethod("correctMobile",function(value,element){
        return $.isNumber(value);
    });	
	var validator = $('#validation-reg').validate({
        errorElement: 'div',
        errorClass: 'help-block',
        focusInvalid: false,
        rules: {       
            mobile: { required:true,rangelength:[11,11],correctMobile:true},            
        	yzm:  {  required: true, rangelength:[6,6]},   
        },
        messages: {         
            mobile: { required: "请输入手机号码",rangelength:"手机号码必须为11位",correctMobile:"手机号码必须为数字"},           
        	yzm: { required: "验证码不能为空" , rangelength:"验证码必须为6位"},
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
    $('input').on("focus",function(){
		$(this).parents(".row").addClass("focus");
		
	})
	$('input').on("blur",function(){
		$(this).parents(".row").removeClass("focus");
		
	})
	var $_mobile = $("#mobile");
	var $_password = $("#yzm");
	var $registerBtn = $('#registerBtn');
	$registerBtn.attr("disabled","disabled");
	 $_mobile.on("input propertychange",function(){
		if($_password.val()!= ""&& $(this).val()!=""){
			$registerBtn.css("background-color",'#2b8fea');
		}else{
			$registerBtn.attr("disabled","disabled").removeAttr("disabled");
			$registerBtn.css("background-color",'#dadada').attr("disabled",'disabled');
		}		
	})
	$("#yzm").on("input propertychange",function(){
		if($_mobile.val()!= ""&& $(this).val()!=""){		
			$registerBtn.css("background-color",'#2b8fea').removeAttr("disabled");
		}else{
			
			$registerBtn.css("background-color",'#dadada').attr("disabled","disabled");;
		}					
	})
         
    $registerBtn.click(function (){ 
    	$registerBtn.css("background-color",'#1e74c2')
        if($(this).html()=="登录中"){
            return; //注册中不可点击
        }        
        /** 验证数据项合法性 */
       $("#yzm").rules("add","required");
        var valiResult = validator.form();
        if(valiResult){
        	$registerBtn.attr("value","登录中");
        	var $mobile = $.trim($('#mobile').val());
            var $yzm = $.trim($('#yzm').val());
            goLogin();
            $registerBtn.attr("value","立即登录");
        }else{
        	$registerBtn.css("background-color",'#2B8FEA')
        }
	})   
	$("#mobileCodeBtn").click(function (){
		$("#yzm").rules("remove","required");
		var valiResult = validator.form();		
		if(valiResult){
		 	getPhoneCode();
		}
	})
	
	
    $.validator.addMethod('regexPassword2', function(value,element) {
        return $.isPassword(value);
    });
    
		
})



function initBtn(){
	var mobileCodeBtn = $("#mobileCodeBtn");	
    mobileCodeBtn.removeAttr("disabled");
    mobileCodeBtn.html("获取验证码");	
}
 
function interval(){
	$("#mobile").attr("readonly",true);
	var mobileCodeBtn = $("#mobileCodeBtn");
	mobileCodeBtn.attr("disabled","disabled");
	var btnContent = mobileCodeBtn.val();
    var second = 120;     
    mobileCodeBtn.text(second+"秒");
    var codeInterval = setInterval(function(){
        mobileCodeBtn.val((--second)+"秒");
		if(second<0){//结束
			$("#mobile").attr("readonly",false);
            clearInterval(codeInterval);
            mobileCodeBtn.val(btnContent);
            mobileCodeBtn.removeAttr("disabled");
        }
    },1000);
}

function  getPhoneCode(){
	var $mobile = $.trim($('#mobile').val());
	$.ajax({
		type:"post",
		url:"/api/smsCode/getValidateCode.do",
		async:false,
		data:{
			mobile:$mobile,
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
}
function goLogin(){
	var $mobile = $.trim($('#mobile').val());
	var $yzm = $.trim($('#yzm').val());
	$.ajax({
		type:"post",
		url:"/api/smsLogin.do",
		async:false,
		data:{
			mobile:$mobile,
			validateCode:$yzm
		},
		dataType:'json',
		success:function(data){	
			$('#registerBtn').css("background-color",'#2B8FEA');
			if(data.code=="0000"){								
				userData= JSON.stringify(data.data);
				var userId = data.data.userId;
				access_token = data.data.token;
				var pwdStatus  = data.data.pwdStatus;				
				if(pwdStatus == "1"){
					layer.open({  
			    	id:1,       
			        title:'设置密码',        
			        shadeClose:false,
			        skin:'layui-layer-rim',                  
			        content: '<div>'+
			        '<form action="#"  class="form-horizontal" method="post" id="validation-password-reg" name="validation-password-reg" role="form" novalidate="novalidate" autocomplete="off">'+
			        '<div class="div-mobile-input"><div><input type="password" style="width:80%;text-indent:8px;" placeholder="请设置密码" name="setPassword" id="setPassword"></div> </div>   </form>'+
			        '</div>'
			        ,  
			        btn:['设置','取消'],  
			        yes: function (index,layero) {
			        	var valiResult = validator2.form();
			        	if(!valiResult)return;
			        	// 验证成功     设置密码	
			        	var password = $("#setPassword").val();
			        	setPassword(userId,password)
			        	
			        },  
			        btn2:function (index,layero) {  
			             layer.close(index);  
			        }  
  
    				}); 
    				validator2 = $('#validation-password-reg').validate({
				        errorElement: 'div',
				        errorClass: 'help-block',
				        focusInvalid: false,
				        rules: {       
				            setPassword: {  required: true, maxlength: 20,  minlength: 8,regexPassword2:true},                   	   
				        },
				        messages: {         
				            setPassword: { required: "密码须为最短8位字母+数字组合;区分大小写至少包含一个字母和数字." ,maxlength:"密码须为最短8位字母+数字组合;区分大小写至少包含一个字母和数字.", minlength:"密码须为最短8位字母+数字组合;区分大小写至少包含一个字母和数字.",regexPassword2:"密码须为最短8位字母+数字组合;区分大小写至少包含一个字母和数字."},
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
				}else{					
					$.initCookie(userData);					
					layer.open({
				            content: "登录成功",
				            skin: 'sure',
				            time: 2,
				            end:function(){
				            	location.href="/view/account/myAccount.html"
				            }
	       			    });
				}	       		
			}else{
				var msg=data.message;
				layer.open({
				            content: msg,
				            skin: 'sure',
				            time: 2
	       		}); 
			}
		},
		error:function(error){
			$('#registerBtn').css("background-color",'#2B8FEA')
			console.log(JSON.stringify(error));
                    var errorMsg ="用户名或密码错误";
                    if(error.status==504){
                        errorMsg="网关超时未收到后台请求";
                    }else{
                        var responseText  =error.responseText;
                        var jsonObj = eval('(' + responseText + ')');
                        if(jsonObj.error_description!=undefined||jsonObj.error_description!=null){
                            var loginResult =jsonObj.error_description.result ;
                            if(typeof(loginResult)=="undefined"){
                                errorMsg="系统升级中，请稍后再试！";//后台假死
                            }else{//后台正常直接取后台信息
                                errorMsg =jsonObj.error_description.message;//真正的错误的登录信息
                            }
                        }else{
                            errorMsg="系统升级中，请稍后再试！";//后台真死
                        }
                    }
			layer.open({
				            content: errorMsg,
				            skin: 'sure',
				            time: 2
	       		});
		}
	})
}
function setPassword(userId,password){
	$.ajax({
		type:"post",
		url:"/api/saUserPw/setLoginPwd.do",
		async:true,
		data:{
			access_token:access_token,
			userId:userId,
			password:password
		},
		dataType:"json",
		success:function(data){
			if(data.code == "0000"){
				$.initCookie(userData);
				layer.open({
		            content: "设置成功",
		            skin: 'sure',
		            time: 2,
		            end:function(){
				            	location.href="/view/account/myAccount.html"
				        }
	       		});				
			}else{
				layer.open({
		            content: data.message,
		            skin: 'sure',
		            time: 2
	       		});
			}			
		},
		error:function(error){			
		}
	});
}
