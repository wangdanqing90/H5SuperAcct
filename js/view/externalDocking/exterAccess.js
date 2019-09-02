
var channelCode,
	transCode,
	token,
	loginName,
	userName,
	company,
	employeeNumber,	
	positionLevel,	
	email;
	
$(function(){
	$.loading();
	var param = $.getUrlParam();
	channelCode = param.channelCode;	
	transCode = param.transCode;
	token = param.token;
	if(transCode == 'ZTB' && channelCode=="0006"){
			loginName = param.loginName;
			userName = param.userName;
			employeeNumber = param.employeeNumber;
			positionLevel=param.positionLevel;
			email = param.email;
		if(channelCode!=undefined&&transCode!=undefined&&token!=undefined&&loginName!=undefined&&userName!=undefined&&employeeNumber!=undefined&&positionLevel!=undefined&&email!=undefined){		
			
		// 证通宝			
			$.ajax({
					type:"post",
					url:"/api/ifuli/loginZtb.do",		
					async:true,
					dataType:'json',
					data:{			
						channelCode:channelCode,
						transCode:transCode,
						token:token, 
						employeeNumber:employeeNumber,						
						loginName:loginName,
						userName:userName,							
						email:email,
						positionLevel:positionLevel,							
					},
					success:function(data){			
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
						 $.unloading();
						 $.alert("系统异常，请稍候再试！");
						 $('.error').removeClass("hide");
					     interval();
					}
			});				
		}else{
				// 获取参数失败			
				$.unloading();
				$('.error').removeClass("hide");
				interval();							
		}
	}else if(transCode == 'COOL' && channelCode=="0006"){
		userName = decodeURIComponent(param.userName);
		company  = param.company;
		if(channelCode!=undefined&&transCode!=undefined&&token!=undefined&&userName!=undefined&&company!=undefined){
			// COOL		
			$.ajax({
					type:"post",
					url:"/api/ifuli/loginCool.do",		
					async:true,
					dataType:'json',
					data:{			
						channelCode:channelCode,
						transCode:transCode,
						token:token, 
						company:company,												
						userName:userName,																			
					},
					success:function(data){			
						if(data.code==0000){
							var telephone = data.telephone;
							var userId = data.userId;
							var token = data.token;
							var idCard = data.idCard;
							/*var userName = data.userName;
							var company = data.company;*/
							skipCOOL(telephone,userId,token,idCard);								
						}else{
							$.unloading();
							$('.error').removeClass("hide");
							interval();			
						}
					},
					error:function(error){	 
						 $.unloading();
						 $.alert("系统异常，请稍候再试！");
						 $('.error').removeClass("hide");
					     interval();
					}
			});		
		}
		/*skipCOOL(userName,company);*/
	}
	
	
	
})
function skipZTB(telephone,userId,token){				
		var param = {
			 phone:telephone,
			 userId:userId,
			 access_token:token
		}
		$.ajax({
				type:"post",
				url:"/api/ztb/getZtbMainUrl.do",
				async:true,
				data:param,
				dataType:'json',
	      		success:function(data){
	      			$.unloading();
	        		if(data.code == "0000"){
	        			window.location.href = data.data;
	        		}else{
						$('.error').removeClass("hide");
						interval();
	        		}
	      		},
	      		error:function(error){
	        		console.log(error);
	      		}
		});	
}


function skipCOOL(telephone,userId,token,idCard){
	var param = {			
			 userName:userName,
			 access_token:token,
			 userId:userId,
			 company:company,
			 phone:telephone,			 
			 userName:userName,
			 idCardNumber:idCard,						 
		};
		$.ajax({
			type:"post",
			url:"/api/cool/getCoolMainUrl.do",
			async:false,
			data:param,
			dataType:'json',
      		success:function(data){
      			$.unloading();
        		if(data.code == "0000"){
        			window.location.href = data.data;
        		}else{
					$('.error').removeClass("hide");
					interval();
        		}
      		},
      		error:function(error){
      			$.unloading();
      			$.alert("网络忙，请稍后再试！");
        		console.log(error);
      		}
		});	
}
 
 
 
 
var time_dom = $('.time');
function interval(){
	var time = 10;
	var timeInterval = setInterval(function(){
		time_dom.text((--time) + "秒");
		if(time < 1){
			clearInterval(timeInterval);
			location.href = "/view/account/login.html";
		}
		
		
	},1000)
}
