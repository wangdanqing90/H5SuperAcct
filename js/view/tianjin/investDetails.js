
var currentPage = 1; //页索引
var pageSize=4;
var listLength=1;//记录请求到数据的总页数
$(function(){
	$.setTitle('我的账户');
    $("#headName").text("投资记录");
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

    	getRecords();
		
    }else{
    	$.saveBackUrl();
    	 window.location.href = '/view/account/login.html';
    }
    
    $("#first").click(function(){
        currentPage=1;
        getRecords();
    });

    $("#previous").click(function(){
        if(currentPage!=1){
            currentPage--;
            getRecords();
        }else{
            alert("已经是第一页！")
        }
    });
	$("#forward").on("touchstart",function(){
		$(this).css("background-color","#F2F2F2");
		
		
		$("#forward").on("touchend",function(){
		$(this).css("background-color","#fff")
		})
	})
	$("#next").click(function(){
        if(currentPage*pageSize < listLength){
            currentPage++;
            getRecords();
        }else{
            alert("已经是最后一页！")
        }
    });
})


//用户投资记录列表 -- 天金所
function getRecords(){  
        var phone = "";//user.mobile;
        var url = '/api/tjs/getTJSAssetInfo.do';
        $.ajax({
            url: url,
            data: {
            	userId:userId,
            	access_token:access_token,
                mobile:mobileNo,
                pageSize: pageSize,
                pageIndex: currentPage
            },
            async:true,
            dataType: 'json',
            type: 'post',
            success: function (data) {
//              $("#recharge").bind("click", recharge);
//              $("#forward").bind("click", forward);
                

                if (data.errorCode == 80000) {
                    $("#investmentRecords").html('<div class="no-data">无资产信息数据</div>');
                } else {
                    if (data.data) {
                        listLength = data.total_count;
                        console.log(listLength)
                        if (data.data.length != 0) {
                            listLength = data.total_count;
                            console.log(listLength)
                        }
                        $('#investmentRecords').empty();
                        var html = '';
//                      html += '<h3 class="title ">投资记录</h3>'
                        $.each(data.data, function (index, item) {

                            html += '<div class="item">'
                            html += '<h4>' + item.product_name + '</h4>'
                            html += '<div class="item-content">'
                             html += '<div class="content">'
                            html += '<div class="principal">'
                            html += '<p>' + item.product_expected_income   + '</p>'
                            html += '<p>预计收益</p>'
                            html += '</div>'
                            html +='<div class="line"></div>'
                            html += '<div class="rofit">'
                            html += '<p>' + item.ta_balance+ '</p>'
                            html += '<p>投资本金（元）</p>'
                            html += '</div>'
                            html += '</div>'
                            html += '<div class="date">'
                            html += '<img src="/img/externalDocking/time@2x.png" alt="" />'
                            html += '<span>预期产品到期日: '+item.product_expiring_date+'</span>'                         
                            html += '</div>'
                            html += '</div>'
                            html += '</div>'

                        });
                        $('#investmentRecords').append(html);
                    } else {
                        alert('网络忙，请稍后再试！')
                    }
                }
            },
            error: function (error) {
                //console.log('系统处理出现错误...');
                $("#recharge").bind("click", recharge);
                $("#forward").bind("click", forward);
                $("#recharge").addClass("recharge").removeClass('recharge2');
                $("#forward").addClass("forward").removeClass('forward2');
                alert("网络忙，请稍后再试！");
            }
        });
        //console.log(listLength)
        //return listLength;
    
}

function backClick(){
    if($.isLogin()) {
        window.location.href = '/view/tianjin/account/myAccount.html';
    }else{
        $.saveBackUrl();
        window.location.href = '/view/account/login.html';
    }
}