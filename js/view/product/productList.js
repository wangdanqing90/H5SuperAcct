var productSize=4
var product={
		'pageSize':'10',		
		'minDuration': '0',
		'maxDuration': '100',
		'minAmount': '0',
		'maxAmount': '100000000',
		'status': 'SCHEDULED',
		'minRate': '0',
		'maxRate': '100',
		'orderBy': 'timeOpen',
		'currentPage': '1',
		'channelCode': ''
	}
var typeMap = {
    LOW: '保守型',
    LOW_MEDIUM: '稳健型',
    MEDIUM: '平衡型',
    MEDIUM_HIGH: '成长型',
    HIGH: '进取型',
},
operation = {
        OPENED: "立即购买",
        SCHEDULED: "即将开始",
        FINISHED: "已售罄",//已售罄
        CLEARED: "已兑付",
        SETTLED: "已起息",//已起息
        FAILED:"已流标"
};
var ticket_status=null
$(function(){	
	getProduct();	
	$('.sx_condition .produt_status a').click(function(){
		$(this).addClass("cur").siblings('a').removeClass('cur');		
	})
	$('.sx_condition .produt_deadline a').click(function(){
		$(this).addClass("cur").siblings('a').removeClass('cur');		
	})
	$('.sx_condition .product_startmoney a').click(function(){
		$(this).addClass("cur").siblings('a').removeClass('cur');		
	})
	$('.reset').click(function(){
	$('.sx_condition .product_startmoney a').eq(0).addClass('cur').siblings('a').removeClass('cur');
	$('.sx_condition .produt_deadline a').eq(0).addClass('cur').siblings('a').removeClass('cur');	
	})
	$('.sure').click(function(){
		var amountArray=$('.sx_condition .product_startmoney .cur').data("value").split(",");
		var durationArray=$('.sx_condition .produt_deadline .cur').data("value").split(",");
		product.minDuration=durationArray[0];
		product.maxDuration=durationArray[1];
		product.minAmount=amountArray[0];
		product.maxAmount=amountArray[1];
		getProduct();
		$('.screen').removeClass('on');
		$('body').removeClass('posi-fix');
		$('.sx_condition').hide();
	})
})
function getPages(val,ele){
	$(ele).addClass('active').siblings('li').removeClass('active')
	switch(val)
	{
		case 'first':
		if(product.currentPage>1){
			product.currentPage=1;
			productSize = 4;
			getProduct();
		}					
		break;
		case 'prev':
		product.currentPage>1?pageProduct('sub'):1;
		productSize = 4;				
		break;
		case 'next':
		productSize==0?product.currentPage:pageProduct('add');		
		break;				
	}
}

function pageProduct(type){
	if(type=="add"){
		product.currentPage++;
		getProduct();
	}else if(type=='sub'){
		product.currentPage--;
		getProduct();
	}
}

function getProduct(){
	$.ajax({
		type:"get",
		url:"/api/v2/loans/getLoanWithPageR",
		async:false,
		dataType:'json',
		data:{
			pageSize: product.pageSize,
			minDuration: product.minDuration,
			maxDuration: product.maxDuration,
			minAmount: product.minAmount,
			maxAmount: product.maxAmount,
			status: product.status,
			minRate: product.minRate,
			maxRate: product.maxRate,
			orderBy: product.orderBy,
			currentPage: product.currentPage,
			channelCode: product.channelCode
		},
		success:function(data){			
			if(data&&data.results.length>0){
				/*$('#exchange').empty();*/
				$.each(data.results, function(index,bean) {
					var title = bean.title.length>8?bean.title.substr(0,8)+'...':bean.title;					
					var minAmount = bean.loanRequest.investRule.minAmount; // 起投金额
					minAmount = minAmount>10000?minAmount / 10000 +"万元":minAmount+'元';							           					
					var type = bean.loanRequest.clientPriv;
	        	    type = $.parseJSON(type).productRiskLevel;         	   
	        		type = typeMap[type];      //产品的风险的等级
				    var rate = bean.rate/100 + "%";  // 历史参考年化收益率
				    var orderDay =bean.duration.totalDays;
				    var percent = Math.floor((bean.amount - bean.balance) / bean.amount * 100) +'%'; //投资进度
				    var btn = ''
				    if(bean.status =="FINISHED"||bean.status=="SETTLED"){				   	
				    	btn = '<button style="color:#b5b5b7;border:1px solid #b5b5b7">'+operation[bean.status]+'</button>';
				    }else{		    	
				    	btn = '<button  onClick="$.viewProduct(\''+bean.id+'\',\''+bean.productKey+'\',\''+ticket_status+'\')">'+operation[bean.status]+'</button>';
				    }
				    var addHtml='<li><div class="title"><strong>' + title +'</strong>'+
				    '<span>'+type+'</span>'+btn+'</div>'+
					'<div class="content">'+
					'<div class="left"><b class="red">'+ rate+'</b><p>预期年化收益率</p></div>'+
					'<div class="mid"><p><span>'+orderDay +'</span>天| <span>'+ minAmount+'</span>起投 </p>'+
					'<p class="line"><span style="width:'+percent+'"></span></p></div>'+
					'<div class="right">已售<span>'+percent+'</span></div>'+
					'</div></li>'
				    $('#exchange').append(addHtml);
					
				});
			}else if(data.results.length==0){
				$('#exchange').empty();
			}else if(data&&data.results.length>0&&data.results.length<product.pageSize){
				productSize = 0;
			}
			
		}
		
	});
}


function rank(val,ele){
	var ele = $(ele).parent('li');
	ele.hasClass('down')?ele.removeClass('down').addClass('up'):ele.addClass('down').removeClass('up');
	switch (val)
	{
	 case 'orderBy':
	 product.orderBy = ele.hasClass('down')?'duration':'timeOpen';
	 getProduct();
	 break;
	}	
}
function screen(val,ele){
	var ele = $(ele).parent('li');	
	ele.hasClass('on')?hide(ele):show(ele);	
	
}
function show(ele){
	ele.addClass("on");
	$('body').addClass('posi-fix');
	$('.sx_condition').show();
	
}
function hide(ele){
	ele.removeClass("on");
	$('body').removeClass('posi-fix');
	$('.sx_condition').hide();
	
}
