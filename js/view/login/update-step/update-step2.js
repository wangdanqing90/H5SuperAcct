var mobileCodeBtn = $("#mobileCodeBtn");
var access_token = JSON.parse($.cookie('user')).token;
$(function(){
	/** 添加手机号验证 */
    $.validator.addMethod("correctMobile",function(value,element){
        return $.isNumber(value);
    });
    

	var validator2 = $('#validation-reg2').validate({
        errorElement: 'div',
        errorClass: 'help-block',
        focusInvalid: false,
        rules: {        
            yzm:  {  required: true, rangelength:[6,6]},        
            newmobile: { required:true,rangelength:[11,11],correctMobile:true},          
        },
        messages: {       
            yzm: { required: "验证码不能为空" , rangelength:"验证码必须为6位"},
            newmobile: { required: "请输入手机号码",rangelength:"手机号码必须为11位",correctMobile:"手机号码必须为数字"},
          
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
	var $_mobile = $("#newmobile");
	var $_password = $("#yzm");
	var $_btn = $(".next");
	$_btn.css("background-color",'#dadada').attr("disabled","disabled");
	 $_mobile.on("keyup",function(){
		if($_password.val()!= ""&& $(this).val()!=""){
			$_btn.css("background-color",'#2b8fea').removeAttr("disabled");
		}else{
			$_btn.css("background-color",'#dadada').attr("disabled","disabled");
		}		
	})
	$_password.on("input propertychange",function(){
		if($_mobile.val()!= ""&& $(this).val()!=""){
			$_btn.css("background-color",'#2b8fea').removeAttr("disabled");
		}else{
			$_btn.css("background-color",'#dadada').attr("disabled","disabled");
		}		
	})
	$('.next').click(function(){		
		var result= validator2.form();
		if(result) changeMobile();       	    
	})
	mobileCodeBtn.click(function(){
		var $_val = $("#newmobile").val();
		if($_val==""){
            validator2.showErrors({'newmobile':'请输入手机号'});
            return;
      	} 
      	if($_val.length!=11){
            validator2.showErrors({'newmobile':"手机号码必须为11位"});
            return;
        }
      	if(!$.isNumber($_val)){
      		validator2.showErrors({'newmobile':"手机号码必须为数字"});
            return;
      	}
      	mobileCodeBtn.attr("disabled",true);
        sendCode(); 
        
    });
    
})


//计时器
var btnContent = mobileCodeBtn.val();
function interval(){
        $("#newmobile").attr("readonly",true);	   
        var second = 120;
        mobileCodeBtn.val(second+"秒");
        var codeInterval = setInterval(function(){
            mobileCodeBtn.val((--second)+"秒");
            if(second<0){//结束
                $("#newmobile").attr("readonly",false);	  
                clearInterval(codeInterval);
                mobileCodeBtn.val(btnContent);
                mobileCodeBtn.removeAttr("disabled");
            }
        },1000);
}

function sendCode(){  
			var newmobile = $("#newmobile").val(); 			
            var url = "/api/smsCode/getSMSCode.do";
            var data = {
            	access_token:access_token,
                phone:newmobile,
                userId:userId,
            };
              
        //获取动态码
        $.ajax({
            type:"post",
            url: url,
            data:data,
            dataType:"json",
            async:false,
            success:function(data){
                if(data.code =="0000"){
                    //定时事件
                    mobileCodeBtn.attr("disabled","disabled");
                    interval();
                }else{
                    mobileCodeBtn.removeAttr("disabled");   
                    layer.open({
				            content: data.message,
				            skin: 'sure',
				            time: 2
	       			    });
                    
                }
            },
            error:function(){
                console.log("系统错误");
            }
        });
    }

function changeMobile(){
	 $.ajax({
            url:"/api/user/updatePhone.do ",
            dataType: 'json',
            type: 'post',
            data:{ 
            	access_token:access_token,
             	userId: userId,
                code:$('#yzm').val(),
                phone:$("#newmobile").val()                
            },
            async:false,
            success: function(data) {
                if(data.code=='0000'){
                    updateRactive.set("wizardClass",3);	
                }else{
                        var msg = data.message;                 
	                    layer.open({
				            content: msg,
				            skin: 'sure',
				            time: 2
	       			    });                
                }
            },
            error: function(e){
                console.log("error:"+e);                
            }
        });
}

