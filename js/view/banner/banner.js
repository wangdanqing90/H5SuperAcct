$(function(){		
	var userInfo = $.cookie('user');
	if(userInfo !=null || userInfo !=undefined){	
		var name =JSON.parse(userInfo).name;
		$('.ban-login a').attr('href','/view/account/index.html').text(name);
	}
	//查询banner 图
	$.ajax({
    type:"get",
    url:"/api/v2/cms/getWapBanners",
    data:{},
    dataType:"json",
    success:function(data){
        if(data&&data.length>0){
            //先来个排序
            //var count=0;
            for(var i=1;i<data.length;i++){
                var tempData = data[i];
                var tempNo = getNumber(data[i]);
                var j;
                for(j = i-1;j>-1;j--){
                    //count++;
                    var bannerNo = getNumber(data[j]);
                    if(isNaN(bannerNo)){
                        break;
                    }else{
                        if(bannerNo>tempNo){
                            data[j+1] = data[j];
                        }else{
                            break;
                        }
                    }
                }
                data[j+1] = tempData;
            }
            var imgContainer = $("#owl-demo");
            $.each(data,function(index,item){
                if(item.img!=null){
                    var imgDiv;
                    if(item.link!=null&&item.link!=undefined){
                        //imgDiv = $('<div class="item" ><a href="'+item.link+'" target="_blank"><img  src="'+item.img+'" data-src-1200="'+item.img+'"/></a></div>');
                        imgDiv = $('<div class="item" style="background:url('+item.img+') no-repeat center;background-size:cover;"><a style="display:block;height: 206px;" href="'+item.link+'" target="_blank"></a></div>');
                    }else{
                        //imgDiv = $('<div class="item" ><img  src="'+item.img+'" data-src-1200="'+item.img+'"/></div>');
                        imgDiv = $('<div class="item" style="background:url('+item.img+') no-repeat center;background-size:cover;"><a style="display:block;height: 206px;" href="javascript:void(0);" ></a></div>');
                    }

                    imgContainer.append(imgDiv);
                }
            });
            imgContainer.removeClass("hidden");
            $("#load_banner").hide();
            //幻灯片
            if($("#owl-demo").length > 0 ) {
                $("#owl-demo").owlCarousel({
                    singleItem : true,
                    autoPlay:5000,
                    stopOnHover:true,
                    pagination:true,
                    transitionStyle : "fade"
                });
            }
        }else{       	
            var imgContainer = $("#owl-demo");
        	var imgDiv;
        	var link="www.baidu.com";
        	imgDiv = $('<div class="item" style="background:url(../../img/banner1.png) no-repeat center;background-size:cover;"><a style="display:block;height: 206px;" href="'+link+'" target="_blank"></a></div>');
        	imgContainer.append(imgDiv);
        	 $("#owl-demo").owlCarousel({
                    singleItem : true,
                    autoPlay:5000,
                    stopOnHover:true,
                    pagination:true,
                    transitionStyle : "fade"
                });
        	
        }                          
       
    }
	});
	
	
})
