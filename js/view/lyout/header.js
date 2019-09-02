//懒加载
$(window).ajaxStart(function(){
    ajaxComplete = false;
    setTimeout(function(){
        if(ajaxComplete!=true){
            $.loading();
        }
    },500);
});
$(window).ajaxStop(function(){
    ajaxComplete = true;   
    $.unloading();
});

(function($){
    //首先备份下jquery的ajax方法
    var _ajax=$.ajax;
     
    //重写jquery的ajax方法
    $.ajax=function(opt){
        //备份opt中error和success方法
        var fn = {
            error:function(XMLHttpRequest, textStatus, errorThrown){},
            success:function(data, textStatus){}
        }
        if(opt.error){
            fn.error=opt.error;
        }
        if(opt.success){
            fn.success=opt.success;
        }
         
        //扩展增强处理
        var _opt = $.extend(opt,{          
            beforeSend:function(XMLHttpRequest){              
                XMLHttpRequest.setRequestHeader("Authorization", "Basic MDAwNDo2c1lVTmxqVUR5TjVPakZX");
            },
           
        });
       return _ajax(_opt);
    };
})(jQuery);