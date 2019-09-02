function backClick(){
    if($.isLogin()) {
        window.location.href = '/view/account/myAccount.html';
    }else{
        $.saveBackUrl();
        window.location.href = '/view/account/login.html';
    }
}
function subIdNo(idNo){
	var preIdNo = idNo.substr(0,4);
	var tailIdNo = idNo.substr(idNo.length - 4);
	return preIdNo + "****" + tailIdNo;
}
var arr_bank = {
        BOC: {name: '中国银行', className: 'bg_red', src:'../../img/mybank/logo_bank/zhongguo.png', url:'../../img/mybank/bg_bank/zhongguo.png'},
        CCB: {name: '中国建设银行', className: 'bg_blue', src:'../../img/mybank/logo_bank/jianshe.png', url:'../../img/mybank/bg_bank/jianshe.png'},
        BOCOM: {name: '交通银行', className: 'bg_blue', src:'../../img/mybank/logo_bank/jiaotong.png', url:'../../img/mybank/bg_bank/jiaotong.png'},
        ABC: {name: '中国农业银行', className: 'bg_green', src:'../../img/mybank/logo_bank/nongye.png', url:'../../img/mybank/bg_bank/nongye.png'},
        CMB: {name: '招商银行', className: 'bg_red', src:'../../img/mybank/logo_bank/zhaoshang.png', url:'../../img/mybank/bg_bank/zhaoshang.png'},
        PSBC: {name: '邮政储蓄银行', className: 'bg_green', src:'../../img/mybank/logo_bank/youzheng.png', url:'../../img/mybank/bg_bank/youzheng.png'},
        CMBC: {name: '中国民生银行', className: 'bg_green', src:"/img/mybank/logo_bank/minsheng.png", url:'../../img/mybank/bg_bank/mingsheng.png'},
        SPDB: {name: '浦东发展银行', className: 'bg_blue', src:'../../img/mybank/logo_bank/pufa.png', url:'../../img/mybank/bg_bank/pufa.png'},
        CIB: {name: '兴业银行', className: 'bg_blue', src:'../../img/mybank/logo_bank/xingye.png', url:'../../img/mybank/bg_bank/xingye.png'},
        GDB: {name: '广发银行', className: 'bg_red', src:'../../img/mybank/logo_bank/guangfa.png', url:'../../img/mybank/bg_bank/guangfa.png'},
        CITIC: {name: '中信银行', className: 'bg_red', src:'../../img/mybank/logo_bank/zhongxin.png', url:'../../img/mybank/bg_bank/zhongxin.png'},
        CEB: {name: '中国光大银行', className: 'bg_orange', src:'../../img/mybank/logo_bank/guangda.png', url:'../../img/mybank/bg_bank/guangda.png'},
        HXB: {name: '华夏银行', className: 'bg_blue', src:'../../img/mybank/logo_bank/.png', url:'../../img/mybank/bg_bank/jianshe.png'},
        PINGAN: {name: '平安银行', className: 'bg_orange', src:'../../img/mybank/logo_bank/pingan.png', url:'../../img/mybank/bg_bank/pingan.png'},
        ICBC: {name: '中国工商银行', className: 'bg_red', src:'../../img/mybank/logo_bank/gongshang.png', url:'../../img/mybank/bg_bank/gongshang.png'},
        BOS: {name: '上海银行', className: 'bg_blue', src:'../../img/mybank/logo_bank/shanghai.png', url:'../../img/mybank/bg_bank/shanghai.png'}
    };

var userId,
user,
mobile,
access_token;
if($.isLogin()){
	user = $.cookie('user');
	user  = JSON.parse(user);
	userId  = user.userId;
	mobile = user.mobile;
	access_token = user.token;
}else{
	$.saveBackUrl();
	window.location.href = '/view/account/login.html';
}

ready()
function ready(){
	$.ajax({
        url:'/api/ztb/selectUserInfo.do',
        data: {
            userId:userId
        },
        dataType: 'json',
        type: 'POST',
        success: function(data) {
            var cardHtml = '';
            // data.cardDef.capitalCardBank
            if(data.code == '0000'){
            		var capitalCardNo = $.disCard(data.cardDef.capitalCardNo)
            		var idNo = subIdNo(data.cardDef.idNo)
            		$.each(arr_bank,function(i,item) {
	            		console.log(item.name)
	            		if(item.name === data.cardDef.capitalCardBank){
	            			cardHtml +=`<div class="cardItem `+ item.className +`">
								<div class="bg_color" style="background: url(`+item.url+`) no-repeat right;">						
									<div class="logo_bank">
										<img src=`+ item.src +` />
										<span class="card_name">
											`+ item.name+`  
										</span>
									</div>
									<div class="card_num">`+capitalCardNo+`</div>
									<ul class="card_user">
										<li>`+ data.cardDef.userName+`</li>
										<li>`+ idNo+`</li>
									</ul>
								</div>
							</div>`
							$('.cardList').append(cardHtml);
	            		}
	            	});
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
            console.log('系统处理出现错误...');
        }
    });
}
