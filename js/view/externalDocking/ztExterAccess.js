
var channelCode,
	token,
	pageType;
	
	
	
$(function(){
	$.loading();
	var param = $.getUrlParam();
	channelCode = param.channelCode;	
	pageType = param.transCode;
	token = param.token;
	
// 证通宝			
$.ajax({
		type:"post",
		url:"/api/ztb/paramsTokenCheck.do",		
		async:true,
		dataType:'json',
		data:{		
			channelCode: channelCode,
			pageType:pageType,
			type:  type,
			token: token
		},
		success:function(data){		
			console.log(data)
			if(data.code==0000){
				var telephone = data.telephone;
				var userId = data.userId;
				var token = data.token;
				skipZTB(telephone,userId,token);								
			}else{
				$.unloading();
				$('.error').removeClass("hide");
				interval();			
			}
		},
		error:function(error){	 
			console.log(error)
			 $.unloading();
			 $.alert("系统异常，请稍候再试！");
			 $('.error').removeClass("hide");
			 interval()
		}
});	
					
	
// 获取参数失败			
//$.unloading();
//$('.error').removeClass("hide");
//interval();							

	
	
	
})

 
 
 
 
var time_dom = $('.time');
function interval(){
	var time = 10;
	var timeInterval = setInterval(function(){
		time_dom.text((--time) + "秒");
		if(time < 1){
			clearInterval(timeInterval);
			location.href = "/view/account/authorize/login.html";
		}
		
	},1000)
}
