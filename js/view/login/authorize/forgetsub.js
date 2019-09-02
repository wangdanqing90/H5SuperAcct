

$(function(){
		var phone = $.getUrlParam().phone
		$('#backTo').click(function(){
			window.location.href = "forget.html?phone="+ phone;
		})
		$('#getCodeBtn').click(function(){
//			api/smsCode/getValidateCode.do
			var url = '/api/smsCode/getValidateCode.do';
	        $.ajax({
	        	type: 'POST',
	            url:url,
	            data: {
	                mobile:phone,
	            },
	            dataType: 'json',
	            success: function(data) {
	                if(data.code=="0000"){
	                    interval();
	                }else{
	                    $.alert(data.message);
	                }
	            }
	        });
		})
		$('#mobile').bind('input', function(){
			if($(this).val().length > 0){
				$('.div-btn').attr("disabled", false)
			}else{
				$('.div-btn').attr("disabled", true)
			}
		})
		
	})
function interval(){
	$('.getCode').attr("disabled", "disabled")
	var count = 60;
	$('.getCode').html(count +"s")
	var time = setInterval(function(){
		count--;
		$('.getCode').html(count + "s");
		if(count <=0){
			clearInterval(time);
			$('.getCode').html("重新获取");
			$('.getCode').removeAttr("disabled")
		}
	}, 1000)
}

//提交
$('.div-btn').click(function(){
	
	$.ajax({
        type:"post",
        url:"/api/user/findPwd.do",
        dataType:"json",
        data:{
            phone:phone,
            smsCode:$('#mobile').val(),
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
})
