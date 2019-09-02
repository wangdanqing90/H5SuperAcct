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
var ZtId = "";
var mobileNo = "";
$(function(){	 
    $.setTitle('中民超级会员安全中心');    
    if($.isLogin()){   	
        access_token = JSON.parse($.cookie('user')).token;
    	user = $.getUser();
    	userId = user.userBasic.userId;
        mobileNo = JSON.parse($.cookie('user')).mobile;    
		var mobile=  $.mobileDis(mobileNo);   
	    getZtId();
		$('.sp').text(mobile);
        if(user.userBasic.traderPwdFlag !="false"){
            $("#btn-resetPayPass").addClass("hidden");
        }else{
            $("#btn-setPayPassword").addClass("hidden");
        }   	
    }else{
    	$.saveBackUrl();
    	window.location.href = '/view/account/login.html';
    }	
        $('#myTab a:last').tab('show'); //初始化显示哪个tab  
        $('#myTab a').click(function(e) {  
            e.preventDefault(); //阻止a链接的跳转行为  
            $(this).tab('show'); //显示当前选中的链接及关联的content  
        });  
})


//风险评估等级
function showRisk(){
	var parma = {
		userId:userId,
		phone:mobileNo,
		access_token:access_token	
	}
	$.ajax({
		type:"post",
		url:"/api/ztb/getUserInfo.do",
		async:true,
		data:parma,
		dataType:'json',
		success:function(data){
			if(data.code == "0000"){
			
				if($.isNullOrBlank(data.data.riskGrade)){
		            $("#risktxt").html("评估");
	           }else{	            	
	            	if(data.data.riskGrade == 1){
	            		$("#riskname").html("保守型");
	            	}else if(data.data.riskGrade == 2){
	            		$("#riskname").html("稳健型");
	            	}else if(data.data.riskGrade == 3){
	            		$("#riskname").html("平衡型");
	            	}else if(data.data.riskGrade == 4){
	            		$("#riskname").html("成长型");
	            	}else{
	            		$("#riskname").html("进取型 ");
	            	}
	            	$("#risktxt").html("重新评估");
	            }
					
			}
		},
		error:function(error){
			 console.log(JSON.stringify(error));      
		}
	});	
	
	
	
}

//证通宝风险评估
function queryUserBalance(){
	var param={
		ztId : ztId,
		userId : userId,
		access_token: access_token,
	}
	$.ajax({
		type:"post",
		url:"/api/ztb/risksimply.do",
		async:true,
		data:param,
		dataType:'json',
		success:function(data){
			if((data.code == "0000")&& (data.message == "Success")){
				location.href = data.url;
			}else{
				$.alert(data.message);
			}
		},
		error:function(error){
			$.alert("网络忙,请稍后再试!");
			console.log(error)
		}
	});
}

//合格投资者认证
function queryUserCertification(){
	var param={
		ztId : ztId,
		userId : userId,
		access_token: access_token,
	}
	$.ajax({
		type:"post",
		url:"/api/ztb/simplyInvestor.do",
		async:true,
		data:param,
		dataType:'json',
		success:function(data){
			if((data.code == "0000")&& (data.message == "Success")){
				location.href = data.url;
			}else{
				$.alert(data.message);
			}
		},
		error:function(error){
			$.alert("网络忙,请稍后再试!");
			console.log(error)
		}
	});
}


function getZtId(){	
	var parma = {
		userId:userId,
		phoneNo:mobileNo,
		access_token:access_token	
	}
	$.ajax({
		type:"post",
		url:"/api/ztb/seleteZTId.do",
		async:true,
		data:parma,
		dataType:'json',
		success:function(data){
			if(data.code == "0000"){
				ztId = data.ztId;	
			    $("#risk-ZT").removeClass("hide");
			    showRisk();
			}
		},
		error:function(error){
			 console.log(JSON.stringify(error));      
		}
	});	
}






function backClick(){
    if($.isLogin()) {
        window.location.href = '/view/account/myAccount.html';
    }else{
        $.saveBackUrl();
        window.location.href = '/view/account/login.html';
    }
}



