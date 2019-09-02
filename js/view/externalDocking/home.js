/**
 * Created by wdq on 2018/5/9.
 */

$(function(){

// 查询海金是否授权
	/*checkHaiJin();*/
	$('.main').on('click touchstart', '.tj', function() { 
		jumpTianJin();
	});
	$('.main').on('click touchstart', '.dj', function() { 
		skip();
	});
	$('.main').on('click touchstart', '.zg', function() { 
		skipZiGuan();
	});
})




var user_haijin


function jumpTianJin(){
	if(!$.isLogin()){
        location.href = '/view/account/login.html';
    }
	else{
		location.href = '/view/tianjin/externalDocking/productList.html';
	}  
}
function skipZiGuan(){
	if(!$.isLogin()){
        location.href = '/view/account/login.html?type=ztzg';
    }
	else{
		location.href = '/view/assetManagement/productList.html';
	}  
}

function skip(){
	if(!$.isLogin()){
        location.href = '/view/account/login.html'+'?type=dongjin';
   } else{		
		var mobile = JSON.parse($.cookie("user")).mobile;
		$.ajax({
			type:"POST",
			url:"/api/djzx/getDjzxMainUrl.do",
			async:false,
			data:{
				'phone':mobile, 
			},
			dataType:'json',
        	success:function(data){
        		if(data.code == "0000"){
        			location.href = data.message;
        		}else{
        			$.alert(data.message);
        		}
        	},
        	error:function(error){
        		console.log(error);
        	}
		});
	}
}
function checkHaiJin(){	
	user_haijin = false;
	if(!$.isLogin()){	 
       return false;
    }else{
    	var mobile = JSON.parse($.cookie("user")).mobile;
		var userId = JSON.parse($.cookie("user")).userId;
		var access_token = JSON.parse($.cookie("user")).token;
    	$.ajax({
			type:"POST",
			url:"/api/haijin/getAuthStatus.do",
			async:true,
			data:{
				'userId':userId,
				'channelCode':'0008', 
				'access_token':access_token,
			},
			dataType:'json',
        	success:function(data){
        		if(data.code == "0000"){       			
        			user_haijin = data.data;       			 
        		}
        	},
        	error:function(error){
        		console.log(error);
        	}
		});
    }
}


function skipHaiJin(){
	if(!$.isLogin()){
        location.href = '/view/account/login.html'+'?type=haijin';
    }else{		
		  if(user_haijin){
		  		var mobile = JSON.parse($.cookie("user")).mobile;
				var userId = JSON.parse($.cookie("user")).userId;
				var access_token = JSON.parse($.cookie("user")).token;
				$.ajax({
						type:"POST",
						url:"/api/haijin/paramEncrypt.do",
						async:true,
						data:{
							'access_token':access_token,
							'userId':userId, 
							'phone':mobile
						},
						dataType:'json',
			        	success:function(data){
			        		if(data.code == "0000"){
			        			var params = data.data;
			        			location.href="https://wap.haijin.hnafae.com/new_index.jsp?channel=0001&token="+params;
			        		}else{
			        			$.alert(data.message);
			        		}
			        	},
			        	error:function(error){
			        		console.log(error);
			        	}
				});
		  }else{
		  		location.href = '/view/haijin/accreditHaiJin.html';
		  }
    }
}


// 汇合
function skipHuiHe(){
	if(!$.isLogin()){
        location.href = '/view/account/login.html'+'?type=huihe';
        return false;
    }
	var mobile = JSON.parse($.cookie("user")).mobile;
	var userId = JSON.parse($.cookie("user")).userId;
	var access_token = JSON.parse($.cookie("user")).token;	
	$.ajax({
			type:"POST",
			url:"/api/huiheRel/getHuiHeUrl.do",
			async:true,
			data:{
				'access_token':access_token,
				'userId':userId, 
				'mobile':mobile
			},
			dataType:'json',
        	success:function(data){
        		if(data.code == "0000"){
        			var params = data.data;
        			location.href=params;
        		}else{
        			$.alert(data.message);
        		}
        	},
        	error:function(error){
        		console.log(error);
        	}
	});
}
