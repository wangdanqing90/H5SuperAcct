var ztId,
	mobileNo;
var user = $.getUser();
var userId = user.userBasic.userId;
var access_token = JSON.parse($.cookie('user')).token;
var pageIndex = 1; 
var pageSize=10;
var index=0;
$(function(){
	if(user.userSecurityBind == "" || user.userSecurityBind == undefined){
		mobileNo = JSON.parse($.cookie('user')).mobile;         
	}else{
		mobileNo = user.userSecurityBind.mobileNo;
	};
	if($.isLogin()) {
		getZtId()
	}else{
		$.saveBackUrl();
		window.location.href = '/view/account/login.html';
	}
	
	$('.nav_asset li').on('click',function(){
		var index = $(this).index();
		$(this).addClass('tabActive').siblings('li').removeClass('tabActive');
		jiazai(index)
	})
})

function backClick(){
    if($.isLogin()) {
        window.location.href = '/view/account/myAccount.html';
    }else{
        $.saveBackUrl();
        window.location.href = '/view/account/login.html';
    }
}


function jiazai(index){
	if(index == 0){
		$('.asset').show();
		$('.appointment').addClass('assetInfo');
	}else{
		$('.appointment').removeClass('assetInfo');
		$('.asset').hide();
	}
}


function getZtId(){	
	var parma = {
		userId:userId,
		phoneNo:mobileNo,
		access_token:access_token	
	}
	$.ajax({
		type:"post",
		url:"/api/ztb/seleteZTId.do",
		async:true,
		data:parma,
		dataType:'json',
		success:function(data){
			if(data.code == "0000"){
				ztId = data.ztId;
				asset()
				appointment()
			}
		},
		error:function(error){
			 console.log(JSON.stringify(error));      
		}
	});	
}

function asset(){
	 $.ajax({
        url:'/api/ztb/queryAssetsTotal.do',
        data: {
            ztId:ztId,
        },
        dataType: 'json',
        type: 'POST',
        async:true,
        success: function(data) {
            console.log(data)
            if(data.code === '0000'){
            	var html = '';
            	 
            	if(((data.resultCode == '1') && (!(JSON.stringify(data.content) === '{}')))){
            		if(data.content.list.length == 0){return false;}
        			$.each(data.content.list, function(i,obj) {
        				var endDate = obj.endDate.substr(0,4) + '-' + obj.endDate.substr(4,2) + '-' + obj.endDate.substr(-2,2);
        				var startDate = obj.startDate.substr(0,4) + '-' + obj.startDate.substr(4,2) + '-' + obj.startDate.substr(-2,2);
	            		html +=`<div class="item" onclick="details('`+ ztId + `','`+obj.fundCode+`','` +obj.isDuanqiLicai+`',this)">
		    		<div class="title">
		    			<span>`+ obj.fundName+`</span>
		    			<span>待回收</span>
		    		</div>
		    		<ul class="item_list">
		    			<li class="redcolor">`+ obj.assetsFund +`</li>
		    			<li class="textRight">到期日：<span>`+ endDate +`</span></li>
		    			<li>持有金额(元)</li>
		    			<li class="textRight">投资日：<span>`+ startDate +`</span></li>
		    		</ul>
		    		</div>`
	            	});
	            	$('.asset').append(html);
            	}else{
            		var html = `<div class="noInfo">暂无资产信息</div>`
            		$('.asset').html(html);
            		
            	}
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

function appointment(){
	$.ajax({
        url:'/api/ztb/queryList.do',
        data: {
            ztId:ztId,
            pageNo:pageIndex,
            pageSize:pageSize
        },
        async:true,
        dataType: 'json',
        type: 'POST',
        success: function(data) {
            if(data.code === '0000'){
            	if((data.resultCode == "1") && (!(data.content.list.length == 0))){
            		var html = "";
            		var appointmentStatus = '';
            		var classStatus = 'success';
	            	$.each(data.content.list, function(i,item) {
	            		if(item.status == '1'){
	            			appointmentStatus = '预约成功';
	            			classStatus = 'success';
	            		}else if(item.status == '2'){
	            			appointmentStatus = '预约取消';
	            			classStatus = 'fail';
	            		}else{
	            			appointmentStatus = '预约失败';
	            			classStatus = 'fail';
	            		}
	            		html += `<div class="item" onclick="detailsAppointment('`+ ztId +`','`+item.projectCode +`',this)">
				    		<div class="time">时间：<span>`+ item.addDate +`</span>
				    		</div>
				    		<ul class="appointment_list">
				    			<li>`+ item.porjectName+`</li>
				    			<li>`+ (item.money).toFixed(2)+`</li>
				    			<li class="`+classStatus+`">`+ appointmentStatus +`</li>
				    		</ul>
				    	</div>`
	            	});
	            	$('.appointment').append(html)
            	}else{
            		var html = `<div class="noInfo">暂无数据</div>`
            		$('.appointment').html(html);
            	}
            	
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
function details(ztId,fundCode,isDuanqiLicai,e){
	$(e).css("background-color","#F2F2F2");
	if(!$.isLogin()) {  
		$.saveBackUrl();
	    window.location.href = '/view/account/login.html'+'?type=ztzg';
	}else{
		isDuanqiLicai = isDuanqiLicai == "0"?"1":"0";
		$.ajax({
			type:"post",
			url:'/api/ztb/assetsDetails.do',
			async:true,
			data:{
				ztId:ztId,
				fundCode:fundCode,
				isDuanqiLicai:isDuanqiLicai
			},
			dataType:'json',
	  		success:function(data){
	  			console.log(data)
	  			if(data.code === '0000'){
	  				window.location.href = data.url
	  			}else{
	  				var msg = data.errMsg;
					layer.open({
					            content: msg,
					            skin: 'sure',
					            time: 2
		       		}); 
	  			}
	  			
	  		},
	  		error:function(error){
	    		console.log(error);
	  		}
		});		
	}
}
function detailsAppointment(ztId,projectCode,e){
	$(e).css("background-color","#F2F2F2");
	if(!$.isLogin()) {  
		$.saveBackUrl();
	    window.location.href = '/view/account/login.html'+'?type=ztzg';
	}else{
		$.ajax({
			type:"post",
			url:'/api/ztb/investDetails.do',
			async:true,
			data:{
				ztId:ztId,
				projectCode:projectCode
			},
			dataType:'json',
	  		success:function(data){
	  			console.log(data)
	  			if(data.code === '0000'){
	  				window.location.href = data.url
	  			}else{
	  				var msg = data.errMsg;
					layer.open({
					            content: msg,
					            skin: 'sure',
					            time: 2
		       		}); 
	  			}
	  			
	  		},
	  		error:function(error){
	    		console.log(error);
	  		}
		});	
	}
}

