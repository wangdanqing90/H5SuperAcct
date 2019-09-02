/**
 * Created by Yilia on 2018/5/10.
 * 天金所-->个人中心
 */

var user;
var userId;
var currentPage = 1; //页索引
var pageSize=4;
var listLength=1;//记录请求到数据的总页数
var status = "tianjin";
var access_token;
var tjsAuthorised = '';
var mobileNo;
$(function(){	 
    $.setTitle('我的账户');
    $("#headName").text("个人中心");   
    if($.isLogin()){   	
        access_token = JSON.parse($.cookie('user')).token;
    	user = $.getUser();
    	userId = user.userBasic.userId;
        mobileNo= JSON.parse($.cookie('user')).mobile;         
		var mobile=  $.mobileDis(mobileNo); 				
		$('.sp').text(mobile);
		getHqbMonely();// 获取活期宝余额
        if(user.userBasic.traderPwdFlag=="false"){
            $("#btn-resetPayPass").addClass("hidden");
        }else{
            $("#btn-setPayPassword").addClass("hidden");
        }   	
    }else{
    	$.saveBackUrl();
    	window.location.href = '/view/account/login.html';
    }
	
      
  /*  $('#myTab a:last').tab('show'); //初始化显示哪个tab  
    $('#myTab a').click(function(e) {  
        e.preventDefault(); //阻止a链接的跳转行为  
        $(this).tab('show'); //显示当前选中的链接及关联的content  
    });       */
	/*$('#tianJing').click(function(){
		location.href= "/view/externalDocking/home.html"
		
	})*/
   
})




function formatPhone(str){
    var reg = /^(\d{3})\d+(\d{4})$/;
    str = str.replace(reg, "$1****$2");
    //console.log("str:"+str);
    return str;
}

function backClick(){
    if($.isLogin()) {
        window.location.href = '/view/externalDocking/home.html';
    }else{
        $.saveBackUrl();
        window.location.href = '/view/account/login.html';
    }
}

function logout(e){
	$(e).css("background-color",'#beddf9');
    $.exitSys();
}

function skipZTB(){				
		var param = {
			 phone:mobileNo,
			 userId:userId,
			 access_token:access_token
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
	        			$.alert(data.message);
	        		}
	      		},
	      		error:function(error){
	        		console.log(error);
	      		}
		});	
}

// 查询活期宝余额
function getHqbMonely(){	
	var param = {
			 phone:mobileNo,
			 userId:userId,
			 access_token:access_token
		}
		$.ajax({
				type:"post",
				url:"/api/ztb/queryUserBalance.do",
				async:true,
				data:param,
				dataType:'json',
	      		success:function(data){
	      			$.unloading();
	        		if(data.code == "0000"){
	        			$('.hqb-monely').text(data.message + "元");
	        		}
	      		},
	      		error:function(error){
	        		console.log(error);
	      		}
		});	
	
}


