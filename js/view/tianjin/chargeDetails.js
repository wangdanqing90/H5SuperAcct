
var currentPage = 1; //页索引
var pageSize=4;
var listLength=1;//记录请求到数据的总页数


$(function(){
	$.setTitle('我的账户');
    $("#headName").text("充提记录");
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
        var url = '/api/tjs/getTJSInvestList.do';
        $.ajax({
            url: url,
            data: {
            	userId:userId,
            	access_token:access_token,
                mobile:mobileNo,
                pageSize: pageSize,
                pageIndex: currentPage,
                create_time_begin: '',
                create_time_end: ''
            },
            async:true,
            dataType: 'json',
            type: 'post',
            success: function (data) {

                if (data.errorCode == 80000) {
                    $("#investmentRecords").html('<div class="no-data">无充提信息数据</div>');
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
                        html += '<div class="assetInfo">';
                       
                        $.each(data.data, function (index, item) {
                        	var code = '';
	                        var status = '';
	                        var trans_code = item.trans_code // 交易类型：充值（101）提现（102）,冻结（03），解冻（04），其他（99）
	                        var trans_status = item.trans_status // 交易状态 submitted  已提交   submitFailed 提交失败   toPay待支付     payFailed 支付失败 done 支付成功  abandoned  作废
							
							if(trans_code == '101'){
								code = '充值';
							}else if(trans_code == '102'){
								code = '提现';
							}else if(trans_code == '03'){
								code = '冻结'
							}else{
								code = '其他';
							}
							if(trans_status == 'submitted'){
								status = '已提交';
							}else if(trans_status == 'submitFailed'){
								status = '提交失败';
							}else if(trans_status == 'toPay'){
								status = '待支付 '
							}else if(trans_status == 'payFailed'){
								if(trans_code == '102'){
									status = '提现失败 '
								}else{
									status = '支付失败 '
								}
								
							}else if(trans_status == 'done'){
								if(trans_code == '102'){
									status = '提现成功'
								}else{
									status = '支付成功 '
								}
							}else if(trans_status == 'abandoned'){
								status = '作废 '
							}else{
								status = '其他';
							}
                            html += '<div class="item"><ul class="list">'
                            html += '<li>' + code + '</li>'
                            html += '<li class="textRight">'+ parseFloat(item.trans_amount/100).toFixed(2) +'元</li>'
                             html += '<li>' + item.create_time +'</li>'
                            html += '<li class="textRight">'+status+'</li></ul></div>'
                        });
                        html += '</div>'
                        $('#investmentRecords').append(html);
                    } else {
                        alert('网络忙，请稍后再试！')
                    }
                }
            },
            error: function (error) {
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