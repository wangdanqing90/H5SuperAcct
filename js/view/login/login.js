/**
 * Created by kylezu on 2018/4/18.
 */
var channelCode = "";
// 预留第三方登录使用，先不传值；
var param = $.getUrlParam();
var type = param.type;
$(function(){
	$.setTitle('中民超级会员');
    /** 添加form验证 */
    
    $(".div-btn").css("background-color",'#dadada').attr("disabled","disabled");
    if(type == 'dongjin'){
    	layer.open({
    	//type:2,
    	skin:"msg",
    	content:"您即将访问东金中心",
    	time:2,
    	style:'font-size: 16px; position: absolute;top: 206px;width: 80%;left: 10%;max-height: 50px;padding-top:10px;'
    	
    	})
    }
    var validator = $('#validation-login').validate({
        errorElement: 'div',
        errorClass: 'help-block',
        focusInvalid: false,
        rules: {
            mobile: { required: true},
            password: { required: true},
        },
        messages: {
            mobile: { required: "请输入用户名"},
            password: { required: "请输入密码"},
        },
        highlight: function (e) {
            $(e).closest('.form-box').removeClass('has-info').addClass('has-error');
        },
        success: function (e) {
            $(e).closest('.form-box').removeClass('has-error');
            $(e).remove();
        },
        errorPlacement: function (error, element) {
            if(element.is($("#captcha"))){
                error.addClass("myself")
            }
            error.insertAfter(element.parent().parent());
        }
    });

    $(".btn-register").click(function(){
        window.location="/view/login/register.html";
    });
    var $_input = $('input');
	$_input.on("focus",function(){
		$(this).parents(".row").addClass("focus");
		
	})
	
	$_input.on("blur",function(){
		$(this).parents(".row").removeClass("focus");		
		console.log($_input);
				
	})
	var $_mobile = $("#mobile");
	var $_password = $("#password");
	var $_btn = $(".div-btn");
	$_mobile.val("");
	
	 $_mobile.on("input propertychange",function(){
		if($_password.val()!= ""&& $(this).val()!=""){
			$_btn.removeAttr("disabled");
			$_btn.css("background-color",'#2b8fea');
		}else{
			$_btn.attr("disabled","disabled");
			$_btn.css("background-color",'#dadada');
		}		
	})
	$_password.on("input propertychange",function(){
		if($_mobile.val()!= ""&& $(this).val()!=""){
			$_btn.removeAttr("disabled");
			$_btn.css("background-color",'#2b8fea');
		}else{
			$_btn.attr("disabled","disabled");
			$_btn.css("background-color",'#dadada');
		}		
	})
    $_btn.click(function(){
    	var $_this = $(this);
    	$_this.css("background-color",'#1e74c2');
        if(validator.form()){
            var userName=$("#mobile").val();
            var password=$("#password").val();
            var param = {
                loginName:userName,
                password:password,              
            };
            var url = '/api/login.do';

            $.ajax({
                type:'post',
                url:url,
                data:param,
                dataType:'json',
                success:function(data){
                    if(data.code!="0000"){
                        $.alert(data.message);
                        $_this.css("background-color",'#2b8fea');
                           
                        return;
                    }
                   	var mobile = data.data.mobile;
                   	var params = data.data
					data = JSON.stringify(data.data);
                    $.initCookie(data);
                    // 东京
					if(type == "dongjin"){
		        		console.log(data);
		        		getDongjin(mobile);
		        	// 海金
		        	}else if(type == "haijin"){
		        		getHaiJin(params);
		        	// 聚合
		        	}else if(type =="huihe"){
		        		skipHuiHe(params)
		        	}else if(type == "ztzg"){
		        		location.href = "/view/assetManagement/productList.html"
		        	}else{
		        		var bakUrl64=$.cookie("bakUrl");
	                    if($.isNullOrBlank(bakUrl64)){
	                        bakUrl=null;
	                    }else{
	                        bakUrl=$.base64.atob(bakUrl64);
	                        if(bakUrl=='/'){
	                            bakUrl="/index.html";
	                        }
	                    }
	                    $.cookie("bakUrl", "", {path: "/", expires: -1});
		        	}
		        	
                    //从cookie中获取bakUrl,并删除对应的cookie
                    
                    /** 登陆成功逻辑处理,如果bakUrl存在则跳转至bakUrl地址中,如果不存在则跳转至我的账户 */
                    window.location.href= bakUrl ? bakUrl : '/view/tianjin/externalDocking/productList.html';
                },
                error:function(error){
                	$_this.css("background-color",'#2b8fea');
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
                }
            });
        }
    });
});

function getDongjin(mobile){
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
        			window.location.href = data.message;
        		}else{
        			$.alert(data.message);
        			$(".div-btn").css("background-color",'#2b8fea').removeAttr("disabled");
        		}
        	},
        	error:function(error){
        		console.log(error);
        	}
		});	
}
// 海金
function getHaiJin(params){
    	var mobile = params.mobile;
		var userId = params.userId;
		var access_token = params.token;
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
        			if(data.data == true){		  													
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
					  		window.location.href = '/view/haijin/accreditHaiJin.html';
					}   			 
        		}
        	},
        	error:function(error){
        		console.log(error);
        	}
		});
}
//新疆汇合
function skipHuiHe(params){
	var mobile = params.mobile;
	var userId = params.userId;
	var access_token = params.token;
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