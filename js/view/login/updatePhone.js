/*
   maybe 2018-6-5
 * */
var user;
var userId;
var userMobile;
var step = 1;
var result =false;
var mobile;
var password;

var updateRactive = new Ractive({
    el:"#updateContent",
    template: $.getHtml("update-step/update-modal.html"),
    data:{step:1,
        wizardClass:{
            1:"active"
        }       
    },
    partials:{     
        1: $.getHtml("update-step/update-step1.html"),
        2: $.getHtml("update-step/update-step2.html"),
        3: $.getHtml("update-step/update-step3.html"),
       
    }
});
$(function(){	
	
//	$.getUserInfo()  函数里面有登录的判断
	if($.isLogin()){
		user = JSON.parse($.cookie('user'));   	
		userId = user.userId;
	 	userMobile=user.phone;	
	}else{
		$.saveBackUrl();
		window.location.href = '/view/account/login.html';
	}
	$('input').on("focus",function(){
		$(this).parents(".row").addClass("focus");
		
	})
	$('input').on("blur",function(){
		$(this).parents(".row").removeClass("focus");
		
	})
	$.setTitle('中民超级会员');
    $('#backTo').click(function(){
		history.go(-1);
	});
	updateRactive.set("wizardClass",1);
						   	
})
