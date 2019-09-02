var param = $.getUrlParam();
var loanId = param.loanId;

$(function(){
	$("#headName").text("产品介绍");	
	
	
	if(param && loanId){		
    }else{
    $.alert("无效的url请求",null,function(){
        location.href="/";
    });
    }
	
	
    load_product_details(loanId);
	
	$('#backTo').click(function(){
		history.go(-1);
	});
	
});

function load_product_details(loanId){	
	var loanDetailUrl = '/api/v2/loan/getDetailInfo';
    $.ajax({
        url:loanDetailUrl,
        type:'post',
        async:false,
        data:{loanId:loanId},
        dataType:'json',
        success:function(data){         
            var info = data.end_date+'</br>'+data.finish_date+'</br>'+data.interest_date+'</br>'+data.product_duration;           
            $('#deal_tips').html(info);//交易提示
			$('#deal_part').html(info);//交易相关方         
        },
        error:function(error){}
    });
    
    
   /*var url = '/api/v2/loan/' +loanId+ '/documents';
    $.ajax({
        url: url,
        type: 'GET',
        success: function(data) {
        	if(data.data){      	       
            var doc = data.data.DOCUMENT[0];
            if(doc&&doc.uri){
                var uri = doc.uri;
                if (uri.indexOf('//') > 5) {
                    uri = 'http:' + uri.substring(uri.indexOf('//'), uri.length);
                }
                $('#product_manual').html("<a href=\"" + PIC_URL + uri+ "\" target=\"_blank\">《" + title + "产品说明书》</a>");
            }
           }
        }
    });*/
}


function showTip(index){
	if(index == 1){
		if($("#deal_tips_div").css("display") == "none")
        {
            $("#deal_tips_div").css("display","block")
        }
        else
        {
            $("#deal_tips_div").css("display","none")
        }		
	}
	else if(index == 2){
		if($("#deal_part_div").css("display") == "none")
        {
            $("#deal_part_div").css("display","block")
        }
        else
        {
            $("#deal_part_div").css("display","none")
        }		
	}
	else if(index == 3){
		if($("#product_manual_div").css("display") == "none")
        {
            $("#product_manual_div").css("display","block")
        }
        else
        {
            $("#product_manual_div").css("display","none")
        }		
	}	
}


