var param = $.getUrlParam();
var loanId = param.loanId;

$(function(){
    $("#headName").text("购买记录");	
    load_invest_record();
	
	$("#go_back").click(function(){
		window.location.href = '/view/product/product.html?productId=' + productId + "&couponFlg=" + encodeURI(GetQueryString('couponFlg')) + "&money=" + GetQueryString('money');
	});
});

function load_invest_record(){	
	 $.ajax({
            url: "/api/v2/loan/"+loanId+"/invests",
            success: function (data) {
                if(data.length>0){                 
                    var invest_record_html = "<h1><span class=\"fl\">已有<i>"+0+"</i>人投资</span><span class=\"fr\">已投资总金额<i>"+0.00+"</i>元</span></h1>";
                    for(var i = 0; i < data.length; i++){
                        invest_record_html += "<dl><dt><p>"+data[i].userLoginName.substring(0,1)+"***"+"</p><span>"+timeStamp2String(data[i].submitTime)+"</span></dt><dd><i>"+data[i].investAmount+"</i>元</dd><div class=\"clearfix\"></div></dl>";
                    }
                    $(".purchase").html(invest_record_html);
                }
                else{
                	var invest_record_html = "<h1><span class=\"fl\">已有<i>0</i>人投资</span><span class=\"fr\">已投资总金额<i>0</i>元</span></h1>";
                    $(".purchase").html(invest_record_html);
                }
            },
            error: function(r){
                console.log('error：'+r);
            }
       })
}


function timeStamp2String(time){
    var datetime = new Date();
    datetime.setTime(time);
    var year = datetime.getFullYear();
    var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
    var date = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
    var hour = datetime.getHours()< 10 ? "0" + datetime.getHours() : datetime.getHours();
    var minute = datetime.getMinutes()< 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
    var second = datetime.getSeconds()< 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
    return year + "-" + month + "-" + date;
}

