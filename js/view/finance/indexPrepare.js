$(function(){
	//理财首面过滤器
  	var urlParam = $.getUrlParam();
  	//if($.isLogin()){//如果本地登录了
        if(true){
  		location.href="/index.html";
  		
  	}else{//如果本地未登录 去用户中心走一遍
                var path = "/index.html";
                var search= location.search;
                var pathSearch = path+search;
                //pathSearch = pathSearch+"?userCenterLogin=unLogin";
  	    	pathSearch = pathSearch.replace(/\//g,'%2F');
  	    	pathSearch = pathSearch.replace('?','%3F');
  	    	pathSearch = pathSearch.replace(/=/g,'%3D');
  	    	var failUrl=null; 
                failUrl = window.location.protocol+"%2F%2F"+window.location.host+pathSearch;
  	    	$.inToUserCenterCheck(failUrl);//进入用户中心去检查
  	}
})
