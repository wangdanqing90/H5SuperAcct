$(function(){
    //获取URL参数  债权id
    var zqId = GetQueryString("zqId");
    //状态 ZRZ：转让中
    var status = GetQueryString("status");
    //加载页面数据
    load_pay(zqId,status);

    $('#backTo').click(function(){
    	history.go(-1);
    });

    //确认支付
    $("#pay").click(function(){
    	//提交时判断是否风险评估
        transferRiskFlag(zqId);
    });
});

//加载支付页面
function load_pay(zqId,status){
    //支付信息
    $.ajax({
        url: APP_URL + "/pay/transferDetail.htm",
        type: 'Post',
        async: false,
        data:{"zqId":zqId},
        success:function(data){
            console.log("resStr:"+JSON.stringify(data));
            if(data.code == "000000"){
                var oProduct = data.data;
                var pay_header_html = "<h1>"+oProduct.goodName+"</h1><p><span>历史参考年化收益率</span><label>"+oProduct.income+"%</label></p><p><span>剩余期限</span>"
                    +"<label>"+oProduct.investTerm+"天</label></p><p><span>预计本息</span><label>"+oProduct.interest+"元</label></p><p><span>到期时间</span>"
                    +"<label>"+oProduct.expireDate+"</label></p><p><span>投资人</span><label>"+oProduct.investor+"</label></p><p><span>投资金额</span><label>"+oProduct.money+"元</label></p>";   
                    pay_header_html += "<input type=\"hidden\" id=\"zqzrsqId\" value=\""+oProduct.zqzrsqId+"\"/>";
                $(".pay_p").html(pay_header_html);
                /*if(oProduct.pdfUrl){
                    $('#contract').css('display','block');
                    $('#contract').html("<a href=\""+oProduct.pdfUrl+"\" target=\"_blank\"><img src=\"/images/file.png\">"+oProduct.htName+"</a>");
                }*/
                if (status == "ZRZ") {
                    //转让中的可购买 按钮色
                    $("#pay").attr({"style":"background:#fc6643","disabled":false});
                }
            } else if (data.code == "000035") {
            	//未绑卡
            	layer.open({
					content: "您还没有绑定银行卡，是否绑定",
					skin: 'sure',
					btn:['绑卡','暂不'],
					yes:function(){
						location.href = '/view/account/addbankcard/addBankCard.html';
					}
				});
            } else {
                layer.open({
                    content: data.description,
                    skin: 'msg',
                    time: 3
                });
                $("#pay").attr({"style":"background:grey","disabled":true});
            }
        },
        error:function(e) {
            console.log(e);
        }
    });
}

/**
 * [transferRiskFlag 提交时判断是否风险评估]
 * @param  {[type]} zqId [债券id]
 */
function transferRiskFlag(zqId){
	$.ajax({
        url: APP_URL + "/pay/transferRiskFlag.htm",
        type: 'get',
        async: false,  
        data:{"zqId":zqId},
        success:function(data){
            console.log("resStr:"+JSON.stringify(data));
            if(data.code == "000000"){
            	//转让提交
                payTransfer(zqId);
            } else if (data.code == "000069") {
            	//未风险评测
            	layer.open({
			        content: data.description
			        ,btn: ['开始评测', '再看看']
			        ,yes: function(index, layero){
			            //按钮【按钮一】的回调,跳转到风险评估
			            var date = $.cookieExpires();
		            	$.cookie('zqId',zqId,{path: "/", expires: date});
		            	$.cookie('status',status,{path: "/", expires: date});
			            window.location.href = "/view/account/myriskassessment/riskAssessmentStart.html";
			        }
			    });
            } else if (data.code == "000076") {
            	//评估结果不适合购买该产品
            	layer.open({
			        content: data.description
			        ,btn: ['重新评测', '再看看']
			        ,yes: function(index, layero){
			            //按钮【按钮一】的回调,跳转到风险评估
			            var date = $.cookieExpires();
		            	$.cookie('zqId',zqId,{path: "/", expires: date});
		            	$.cookie('status',status,{path: "/", expires: date});
			            window.location.href = "/view/account/myriskassessment/riskAssessmentStart.html";
			        }
			    });
            } else {
                layer.open({
                    content: data.description,
                    skin: 'msg',
                    time: 3
                });
            }
        },
        error:function(e){
            console.log("error:"+e);
        }
    });
}

/**
 * [payTransfer 转让提交]
 * @param  {[type]} zqId [债券id]
 */
function payTransfer(zqId){
	$.ajax({
        url: APP_URL + "/pay/payTransfer.htm",
        type: 'Post',
        async: false,  
        data:{"zqId":zqId,"zqzrId":$('#zqzrsqId').val()},//转让申请id
        success:function(data){
            console.log("resStr:"+JSON.stringify(data));
            if(data.code == "000000"){
                window.location.href = '/view/product/success.html?transferFlag=1';
            } else if (data.code == "000001") {
            	layer.open({
                    content: data.description,
                    skin: 'msg',
                    time: 3
                });
            } else {
                layer.open({
                    content: data.description,
                    skin: 'msg',
                    time: 3,
                    end: function(){
                        window.location.href = '/view/product/error.html';
                    }
                });
            }
        },
        error:function(e){
            console.log("error:"+e);
        }
    });
}
