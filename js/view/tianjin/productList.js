var pageIndex = 1; //页索引 
var pageSize=20;
var listLength;//记录请求到数据的总页数
var user = $.getUser();
var userId = user.userBasic.userId;
var access_token = JSON.parse($.cookie('user')).token;
var mobileNo;
$(function(){
	$.setTitle('投资列表');
    $('#backTo').click(function(){
        window.location.href = "/view/externalDocking/home.html";
	});
	if(user.userSecurityBind == "" || user.userSecurityBind == undefined){
		mobileNo = JSON.parse($.cookie('user')).mobile;         
	}else{
		mobileNo = user.userSecurityBind.mobileNo;
	}
    $("#headName").text("投资列表");  
    if($.isLogin()) {    
	    findData();
	}
    else{
    	$.saveBackUrl();
    	window.location.href = '/view/account/login.html';
    }
	$("#first").click(function(){
		pageIndex=1;
		findData();
	});
	
	$("#previous").click(function(){
		if(pageIndex!=1){
			pageIndex--;
			findData();
		}else{
			alert("已经是第一页！")
		}
	});
	
	$("#next").click(function(){
		if(pageIndex*pageSize < listLength){
			pageIndex++;
			findData();
		}else{
			alert("已经是最后一页！")
		}
	});
	
})


function findData(){
    var listlength=1;
    var param = { 
    	userId:userId,
    	access_token:access_token,
    	mobile:mobileNo,
        /*pageIndex:pageIndex,
        pageSize:pageSize*/
    };
    var url = '/api/tjs/getTJSProductList.do';
    $.ajax({
        type:'post',
        url:url,
        async:true,
        data:param,
        dataType:'json',
        success:function(data){
     	$("#productList").empty();
        	if(data.data){
        		var json=data.data;        		
				listLength = data.total_count;
  	    	    $.each(json,function(i,item){
  	    	    	var product_code = item.product_code;
  	    	    	var product_name= item.product_name;
  	    	    	var product_rate= item.product_rate;
  	    	    	var product_status = item.product_status;
  	    	    	product_rate = (product_rate*100).toFixed(2)+"%";
  	    	    	var deadline= item.deadline+"天";
  	    	    	var sale_amount= item.sale_amount/100;
					var str = '';
					switch (product_status){
						case "sellout":
							str='<img src="/img/externalDocking/sellout.png"/>';
						break;
						case "offshelf":
							str='<img src="/img/externalDocking/offshelf.png"/>';
						break;
						default:
							str = '';
						break;
					}										
					
  	             $("#productList").append(" <div  class='productContainer' onclick='jumpProduct(\""+product_code+"\",this)'><div class='productTitle'>" + product_name+"</div><div ><div class='nianhua'><div class='txt1'>"
  	             +product_rate+"</div><div class='txt2'>期待年化</div></div><div class='qixian'><div class='txt2'>锁定期限 &nbsp;<span>"
  	             +deadline+"</span></div><div class='txt2'>起投金额 &nbsp;<span>"+sale_amount+"</span></div></div><div class='qitou'>"
  	             +str+"</div><div class='clear'></div></div>"
  	    		);
        	  });      
  	          }else{
  	    	     alert("网络忙，请稍后再试！");
  	          }
        },
        error:function(error){
            console.log(JSON.stringify(error));
            var errorMsg ="网络忙，请稍后再试！";                
            alert(errorMsg);          
        }
    }); 
     //return listlength;
  } 


function jumpProduct(pId,e){
	$(e).css("background-color","#F2F2F2")
	if(!$.isLogin()) {  
		$.saveBackUrl();
	    window.location.href = '/view/account/login.html'+'?type=tianJin';
	}
    else{    	   		
	var param = { 
        userId:user.userBasic.userId,
        access_token:access_token,
    };
	var url = '/api/tjs/checkTJSAuthorised.do';
    $.ajax({
        type:'post',
        url:url,
        async:true,
        data:param,
        dataType:'json',
        success:function(data){
        	if(data.code == "0000"){      		
        		if(data.data == "1" ){//未授权，跳转授权页
		             jumpAuthorization(pId);
	            }
        		else{//已授权，跳转合作的产品页
        			/*if(type == "tianJin"){*/
			             jumpTianJin(pId);
		            /*}*/	
        		}      		
        	}else{
        		var msg = data.message;
				layer.open({
				            content: msg,
				            skin: 'sure',
				            time: 2
	       		}); 
        	}
        },
        error:function(error){
            console.log(JSON.stringify(error));        
        }	
	})  
	}
}

//跳转到授权页面
function jumpAuthorization(pId){
    window.location.href = '/view/tianjin/account/authorization.html'+'?target=product_detail&product_code='+pId;
}

function jumpMyAccount(){
	window.location.href = '/view/tianjin/account/myAccount.html';
}

//跳转到天金所  授权登录接口
function jumpTianJin(pId){
	if(!$.isLogin()) {  
		$.saveBackUrl();
	    window.location.href = '/view/account/login.html'+'?type=tianJin';
	}
	var param = { 
		userId:user.userBasic.userId,       
		access_token:access_token,
        mobile:mobileNo,
        target:"product_detail",
        productCode:pId
    };
	var url = '/api/tjs/accreditUrl.do';
    $.ajax({
        type:'post',
        url:url,
        async:false,
        data:param,
        dataType:'json',
        success:function(data){
        	if(data.code == "0000"){
        	 var str = location.href;
      		 var i=str.indexOf("productList");
              str=str.substring(0,i);
              str=str+"productList.html";
//            window.location.href ='http://tjsappp.tjfae.com/fxh5/index.html?'+data.url+str;
    		  //  window.location.href =superUrl + 'fxh5/index.html?'+data.data+str;
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
            console.log(JSON.stringify(error));        
        }	
	})
}

//弹窗
function show(tag){
	 $("#fade").css("display","block");
	 $(tag).css("display", "block");	 	 
}

function hide(tag){
     $("#"+tag).css("display","none");
     $("#fade").css("display","none");
}	

