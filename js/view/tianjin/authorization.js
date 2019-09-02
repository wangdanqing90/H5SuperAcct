/**
 * Created by Yilia on 2018/5/9.
 * 天金所-->确认授权
 */

var param = $.getUrlParam();

var address=param.address;

var user = $.getUser();
var userId = user.userBasic.userId;
var access_token = JSON.parse($.cookie('user')).token;
var mobileNo;
$(function(){
	
    console.log(user);
    $.setTitle('授权确认');
    $("#headName").text("确认授权");
    $("form img").click(function(){
    	if($(this).hasClass("active")){
    		$(this).removeClass("active").attr("src","/img/externalDocking/checked-1.png")
    	}else{
    		$(this).addClass("active").attr("src",'/img/externalDocking/checked-2.png')
    	}
    	
    });
    if(user.userSecurityBind == "" || user.userSecurityBind == undefined){
		mobileNo = JSON.parse($.cookie('user')).mobile;         
	}else{
		mobileNo = user.userSecurityBind.mobileNo;
	}
})
//同意
$("#authorization").on('click',function(){
    if($.isLogin()) {
        var msg = $("#msg").hasClass("active");
        var card = $("#card").hasClass("active");
        var server = $("#server").hasClass("active");
        console.log(msg,card,server);
        if(msg != true){
            alert("请允许获取公开信息");
            return false;
        }else if(card != true){
            alert("请允许使用身份信息");
            return false;
        } else if(server != true){
            alert("请勾选协议");
            return false;
        }else{
            //跳转页面的请求开始，加载动画层显示
            $("#load_box").addClass('ushow').removeClass('uhide');
            $.ajax({
                url:'/api/tjs/updateTJSAuthorised.do',
                data: {
                	 phone:mobileNo,
                    userId: userId,
                    access_token:access_token,
                },
                dataType: 'json',
                type: 'POST',
                success: function(data) {
                    if(data.code == "0000"){
                        console.log('授权成功！');
                        jump();
                    }else{
                        layer.open({
                        	content:data.message,
                        	skin:'sure',
                        	time:1
                        })
                    }
                },
                error:function(error){
                    //请求失败加载动画层隐藏
                    $("#load_box").addClass('uhide').removeClass('ushow');
                    console.log('系统处理出现错误...');
                }
            });
        }
    }else{
        $.saveBackUrl();
        window.location.href = '/view/account/login.html';
    }
    
    
})


//授权成功，获取跳转的产品详情/充值/提现url
function jump(){
    var authType = getUrlParamType('target');
    var product_code = '';
    var productCode = getUrlParamType('product_code');
    if(!productCode || productCode == ''){
        product_code = '';
    }else{
        product_code = productCode;
    }
    console.log(product_code);
    $.ajax({
        url:'/api/tjs/accreditUrl.do',
        data: {
        	userId: userId,
            access_token:access_token,
            mobile:mobileNo,
            target:authType,
            productCode:product_code,
        },
        dataType: 'json',
        type: 'POST',
        success: function(data) {
            //请求成功加载动画层隐藏
            $("#load_box").addClass('uhide').removeClass('ushow');
            if(data.code == "0000"){
                //跳转到天金所的页面进行操作
//              var str = "http://superaccount.cmiinv.com/view/tianjin/account/authorization.html";
                var str = location.href;
                var i=str.indexOf("tianjin");
                str=str.substring(0,i);
                if(address=="myAccount"){
                	str=str+"tianjin/account/myAccount.html";
                }else{
                	str=str+"tianjin/externalDocking/productList.html";
                }
                
//                测试：http://tjsappp.tjfae.com
//           window.location.href = 'http://tjsappp.tjfae.com/fxh5/index.html?'+data.url+str;
          window.location.href = data.data.url +"/"+ data.data.uri+"?"+data.data.params+str;
            }else{
                layer.open({
		            content: data.message,
		            skin: 'sure',
		            time: 2
	       		});
            }
        },
        error:function(error){
            //请求失败加载动画层隐藏
            $("#load_box").addClass('uhide').removeClass('ushow');
            console.log('系统处理出现错误...');
        }
    });
}


//截取url中的参数
function getUrlParamType(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
//查看协议详情
function intoAgreement(str){
    window.location.href = '/view/externalDocking/agreement.html?agreement='+str;
}

function backClick(){
    if($.isLogin()) {
    	if(address=="myAccount"){
    		 window.location.href = '/view/tianjin/account/myAccount.html';
    	}else{
    		 window.location.href = '/view/tianjin/externalDocking/productList.html';
    	}
       
    }else{
        $.saveBackUrl();
        window.location.href = '/view/account/login.html';
    }
}