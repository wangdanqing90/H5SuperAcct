$(function(){
	var typeMap = {
    LOW: '保守型',
    LOW_MEDIUM: '稳健型',
    MEDIUM: '平衡型',
    MEDIUM_HIGH: '成长型',
    HIGH: '进取型',
};
    $.ajax({
        url:'/api/v2/loans/getLoanWithPage',
        type:'get',
        async:false,
        data:{
        	pageSize: 4,
			minDuration: 0,
			maxDuration: 100,
			minAmount: 0,
			maxAmount: 100000000,
			status: 'SCHEDULED',
			currentPage: 1,
			product: 'YGJPY',
			channelCode: ''
        },
        dataType:'json',
        success:function(data){
        	if(data&&data.results.length>0){
        		$.each(data.results, function(index,bean) { 
        			
        			/*var id =bean.id;  产品id和类型
        			var productKey = bean.productKey;*/
        			var ticket_status=null;
        			
        			var title = bean.title; //名称显示
	        		var count = bean.amount; //剩余可投
	        		var type = bean.loanRequest.clientPriv;
	        	    type = $.parseJSON(type).productRiskLevel;         	   
	        		type = typeMap[type];      //产品的风险的等级
	        		var rate = bean.rate/100 + "%";  // 历史参考年化收益率
	        		var minAmount = bean.loanRequest.investRule.minAmount // 起投金额
	        		var orderDay =bean.duration.totalDays;
	        		var addHtml = '<dl>'+
	        		'<dt><em></em><a href="javaScript:void(0)" onClick="$.viewProduct(\''+bean.id+'\',\''+bean.productKey+'\',\''+ticket_status+'\')" >'+title+'</a><span >'+type+'</span></dt>'+
	            	'<dd><ul>'+
	                    '<li><p>预期年化收益率</p><b class="red">'+ rate+'</b></li>' +
	                    '<li><p>产品期限</p><b>'+orderDay +'</b></li>'+
	                    '<li><p>起投金额</p><b>'+minAmount+'</b></li></ul>'+
	                '<div class="buy"><input name=""onClick="$.viewProduct(\''+bean.id+'\',\''+bean.productKey+'\',\''+ticket_status+'\')"  type="button" value="立即抢购"/></div></dd></dl>';
	        		$('.new-product').append(addHtml);	
        		});
        		
        		
        	}
            
        },
        error:function(error){}
    });			
})
/*function viewProduct(id,productKey,tickey){
	location.href = '/view/product/product.html?pId='+id +'&type=' + productKey +'&ticket_status=null';
}
*/
