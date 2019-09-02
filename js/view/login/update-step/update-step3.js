
$(function(){
	timer();
})
function timer(){	
		var el  = $('#time') 
        var time = 10;
        el.text(time+"秒");
        var codeInterval = setInterval(function(){
            el.text((--time)+"秒");
            if(time<0||time==0){//结束
                clearInterval(codeInterval);               
                $.exitSys();
				window.location="/view/account/login.html";
            }
        },1000);
}