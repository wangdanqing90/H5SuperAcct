/**
 * Created by Yilia on 2018/5/10.
 * 天金所-->个人中心
 */

var user;
var userId;
//var currentPage = 1; //页索引
//var pageSize=4;
//var listLength=1;//记录请求到数据的总页数
var access_token;

var tjsAuthorised = '';
var mobileNo;

$(function(){	 
    $.setTitle('我的账户');
    if($.isLogin()){
    	user = $.getUser();
    	userId = user.userBasic.userId;
        var mobile;
        if(user.userSecurityBind == ""||user.userSecurityBind==undefined){
            mobile = JSON.parse($.cookie('user')).mobile;
        }else{         
            mobile = user.userSecurityBind.mobileNo;
        }
        mobileNo = mobile;
        mobile= mobile.substr(0, 3) + '****' + mobile.substr(7); 
		$('.sp').text(mobile);
        if(user.userBasic.traderPwdFlag=="false"){
            $("#btn-resetPayPass").addClass("hidden");
        }else{
            $("#btn-setPayPassword").addClass("hidden");
        }
        
        $("#recharge").bind("click", recharge);
             $("#forward").bind("click", forward);
        

//  	getRecords();
		
    }else{
    	$.saveBackUrl();
    	 window.location.href = '/view/account/login.html';
    }
	
	$("#recharge").addClass("recharge").removeClass('recharge2');
    $("#forward").addClass("forward").removeClass('forward2');
//  $("#first").click(function(){
//      currentPage=1;
//      getRecords();
//  });
//
//  $("#previous").click(function(){
//      if(currentPage!=1){
//          currentPage--;
//          getRecords();
//      }else{
//          alert("已经是第一页！")
//      }
//  });
	$("#forward").on("touchstart",function(){
		$(this).css("background-color","#F2F2F2");
		
		
		$("#forward").on("touchend",function(){
		$(this).css("background-color","#fff")
		})
	})
	$("#recharge").on("touchstart",function(){
		$(this).css("background-color","#Ff5829");				
		$("#recharge").on("touchend",function(){
		$(this).css("background-color","FF653A")
		})
	})
	$('#unlock').click(function(){
		if($.isLogin()) {	       
	        isAuthorization();
	        if(tjsAuthorised == true){
	            jump('unlock');
	        }else{
	            window.location.href = '/view/tianjin/account/authorization.html?target=unlock&address=myAccount';
	        }
	    }else{
	        $.saveBackUrl();
	        window.location.href = '/view/account/login.html';
	    }
	})
//  $("#next").click(function(){
//      if(currentPage*pageSize < listLength){
//          currentPage++;
//          getRecords();
//      }else{
//          alert("已经是最后一页！")
//      }
//  });
	$('#tianJing').click(function(){
		location.href= "/view/externalDocking/home.html"
		
	})
    $("#btn-savePayPassword").click(function(){
        var passWord=$("#input-payPassword").val();
        if($.isNullOrBlank(passWord)){
            $(".div-error").html("请输入交易密码");
            $(".div-error").removeClass("hidden");
            return;
        }else{
            $(".div-error").html("");
            $(".div-error").addClass("hidden");
        }
        $.ajax({
            url:'/api/user/traderPwdSet.do',
            data: {
                userId:userId,
                passWord:passWord,
            },
            dataType: 'json',
            type: 'POST',
            success: function(data) {
                if(data.code == "0000"){
                    $('#newModal').modal('hide');
                   $.alert("设置成功");
                }else{
                    $(".div-error").html(data.message);
                    $(".div-error").removeClass("hidden");
                }
            },
            error:function(error){
                console.log('系统处理出现错误...');
            }
        });
    });

    
})



////用户投资记录列表 -- 天金所
//function getRecords(){  
//      var phone = "";//user.mobile;
//      var url = '/api/tjs/getTJSAssetInfo.do';
//      $.ajax({
//          url: url,
//          data: {
//          	userId:userId,
//          	access_token:access_token,
//              mobile:mobileNo,
//              pageSize: pageSize,
//              pageIndex: currentPage
//          },
//          async:true,
//          dataType: 'json',
//          type: 'post',
//          success: function (data) {
//              $("#recharge").bind("click", recharge);
//              $("#forward").bind("click", forward);
//              
//
//              if (data.errorCode == 80000) {
//                  $("#investmentRecords").html('<div class="no-data">无资产信息数据</div>');
//              } else {
//                  if (data.data) {
//                      listLength = data.total_count;
//                      console.log(listLength)
//                      if (data.data.length != 0) {
//                          listLength = data.total_count;
//                          console.log(listLength)
//                      }
//                      $('#investmentRecords').empty();
//                      var html = '';
////                      html += '<h3 class="title ">投资记录</h3>'
//                      $.each(data.data, function (index, item) {
//
//                          html += '<div class="item">'
//                          html += '<h4>' + item.product_name + '</h4>'
//                          html += '<div class="item-content">'
//                           html += '<div class="content">'
//                          html += '<div class="principal">'
//                          html += '<p>' + item.product_expected_income   + '</p>'
//                          html += '<p>预计收益</p>'
//                          html += '</div>'
//                          html +='<div class="line"></div>'
//                          html += '<div class="rofit">'
//                          html += '<p>' + item.ta_balance+ '</p>'
//                          html += '<p>投资本金（元）</p>'
//                          html += '</div>'
//                          html += '</div>'
//                          html += '<div class="date">'
//                          html += '<img src="/img/externalDocking/time@2x.png" alt="" />'
//                          html += '<span>预期产品到期日: '+item.product_expiring_date+'</span>'                         
//                          html += '</div>'
//                          html += '</div>'
//                          html += '</div>'
//
//                      });
//                      $('#investmentRecords').append(html);
//                  } else {
//                      alert('网络忙，请稍后再试！')
//                  }
//              }
//          },
//          error: function (error) {
//              //console.log('系统处理出现错误...');
//              $("#recharge").bind("click", recharge);
//              $("#forward").bind("click", forward);
//              $("#recharge").addClass("recharge").removeClass('recharge2');
//              $("#forward").addClass("forward").removeClass('forward2');
//              alert("网络忙，请稍后再试！");
//          }
//      });
//      //console.log(listLength)
//      //return listLength;
//  
//}


//授权成功，获取跳转的充值/提现url
function jump(authType){
    $.ajax({
        url:'/api/tjs/accreditUrl.do',
        data: {
        	userId:userId,
		    access_token:access_token,
            mobile:mobileNo,
            target:authType,
            productCode:'',
        },
        dataType: 'json',
        type: 'POST',
        success: function(data) {
            console.log(data)
            if(data.code == "0000"){
                //跳转到天金所的页面进行操作
//                测试：http://tjsappp.tjfae.com
//               window.location.href = 'http://tjsappp.tjfae.com/fxh5/index.html?'+data.url+location.href;
                 window.location.href = data.data.url +"/"+ data.data.uri+"?"+data.data.params+location.href;

            }else{
                layer.open({
                	content:data.message,
                	skin:'sure',
                	time:2
                })
            }
        },
        error:function(error){
            console.log('系统处理出现错误...');
        }
    });
}
//查询用户是否已经授权


function isAuthorization(){
    if($.isLogin()) {
        $.ajax({
            url:'/api/tjs/checkTJSAuthorised.do',
            data: {
                userId:userId,
                access_token:access_token,
            },
            async:false,
            dataType: 'json',
            type: 'POST',
            success: function(data) {
                console.log(data)
                if(data.code == "0000" && data.data=="0"){
                    tjsAuthorised = true;
                }else{                    
                    	layer.open({
				            content: data.message,
				            skin: 'sure',
				            time: 2
	       				});
                    	
                }
            },
            error:function(error){
                console.log('系统处理出现错误...');
            }
        });
    }else{
        $.saveBackUrl();
        window.location.href = '/view/account/login.html';
    }
}



//点击充值判断是否已经授权
function recharge(){
	$('.recharge').css("background-color",'#ff5829')
    console.log('12')
    if($.isLogin()) {
        console.log('recharge');
        isAuthorization();
        console.log(tjsAuthorised);
        if (tjsAuthorised == true) {
            jump('fund_in');
        } else {
            window.location.href = '/view/tianjin/account/authorization.html?target=fund_in&address=myAccount';
        }
    }else{
        $.saveBackUrl();
        window.location.href = '/view/account/login.html';
    }
}
//点击提现判断是否已经授权
function forward(){
	$('.forward').css("background-color",'#f2f2f2')
    console.log('12')
    if($.isLogin()) {
        console.log('forward');
        isAuthorization();
        if(tjsAuthorised == true){
            jump('fund_out');
        }else{
            window.location.href = '/view/tianjin/account/authorization.html?target=fund_out&address=myAccount';
        }
    }else{
        $.saveBackUrl();
        window.location.href = '/view/account/login.html';
    }
}

//查看协议详情
function intoAgreement(str){
    window.location.href = '/view/account/agreement.html?agreement='+str;
}

function formatPhone(str){
    var reg = /^(\d{3})\d+(\d{4})$/;
    str = str.replace(reg, "$1****$2");
    //console.log("str:"+str);
    return str;
}

function backClick(){
    if($.isLogin()) {
        window.location.href = '/view/tianjin/externalDocking/productList.html';
    }else{
        $.saveBackUrl();
        window.location.href = '/view/account/login.html';
    }
}

function logout(){
    $.exitSys();
}
