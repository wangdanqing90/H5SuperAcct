var user,
 userId,
 mobile,
 access_token, 
 pageSize=6,
 currentPage = 1,
 status = $.getUrlParam().status;

var flag = false;
var state = true;
var ztId;
$(function(){
	$.setTitle('投资记录');
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
	getZtId();
	ajaxComplete = true;   
    $.unloading();
	switch(status){
		case "1":
		title = '天金所投资记录';	
		break;
		case"2":
		title = '安金所交易记录';		
		break;
		case "3":
		title = 'i投交易记录';		
		break;
		case"4":
		title = '券商资产交易记录';		
		break;
	}	
    $("#headName").text(title);   
	 	
})
var mescroll = new MeScroll("mescroll", { //第一个参数"mescroll"对应上面布局结构div的id
       		//如果您的下拉刷新是重置列表数据,那么down完全可以不用配置,具体用法参考第一个基础案例
       		//解析: down.callback默认调用mescroll.resetUpScroll(),而resetUpScroll会将page.num=1,再触发up.callback
			down: {
				callback: downCallback //下拉刷新的回调,别写成downCallback(),多了括号就自动执行方法了
			},
			up: {				
				callback: upCallback , //上拉加载的回调
				isBounce: false //如果您的项目是在iOS的微信,QQ,Safari等浏览器访问的,建议配置此项.解析(必读)
			},			
	});

function findData(ev){
	switch(status){
		case "1":
			if(ev!=undefined){
				getRecords(ev);
			}else{
				getRecords();
			}
		break;
		case "3":
			if(ev !=undefined){
				getRecordsiTou(ev);
			}else{
				getRecordsiTou();
			}
		break;
		case"2":
			if(ev!=undefined){
				getRecordsanJin(ev);
			}else{
				getRecordsanJin();
			}
		break;
		case"4":
			if(ev!=undefined){
				getRecordsZTZG(ev);
			}else{
				getRecordsZTZG();
			}
		break;
		
		
	}	
}
	
//联网失败的回调,隐藏下拉刷新和上拉加载的状态
//	mescroll.endErr();
function downCallback() {
			currentPage = 1,
			flag = false;
			state = true;
			$('#invest').empty();
			findData()
			mescroll.endErr();
		}
		
function upCallback() {
	if(!flag){
		flag =true;
		$('#invest').empty();
		findData();
	}else{				
		findData(flag);			
	}		
}
function getRecords(flag){ 
		if(flag){
			currentPage++;
		}
        var phone = ""; //user.mobile;
        var url = '/api/tjs/getTJSAssetInfo.do';
        $.ajax({
            url: url,
            data: {
            	userId:userId,
            	access_token:access_token,
                mobile:mobile,
                pageSize: pageSize,
                pageIndex: currentPage
            },
            async:true,
            dataType: 'json',
            type: 'post',
            success: function (data) {             
                if (data.errorCode == 80000) {
                    $("#invest").html('<div class="no-data text-center margin-top-30">无资产信息数据</div>');
                } else {
                    if (data.data) {                    	
                        listLength = data.total_count;
                        console.log(listLength)                       
                        if (data.total_count != 0) {
                            listLength = data.total_count;
                            console.log(listLength);
                            if(data.data.length==0){
                            	if(flag){
                        		mescroll.showNoMore();	
                        		return
	                        	}else{
	                        		mescroll.endSuccess();
	                        	} 
                        	
                            }                           
                        }else{ 
                        	$("#invest").html('<div class="no-data text-center margin-top-30">无资产信息数据</div>');                       	
                        }                       
                        var html = '';
                        if(!flag){
                        	html += '<h3 class="title">投资记录</h3>'                       	
        					$('#invest').empty()       					
                        }  
                        if(data.total_count ==0){ mescroll.endErr(); return;}
                        $.each(data.data, function (index, item) {
							
                            html += '<div class="item">'
                            html += '<h4>' + item.product_name + '</h4>'
                            html += '<div class="item-content">'
                             html += '<div class="content">'
                            html += '<div class="principal">'
                            html += '<p>' + item.product_expected_income   + '</p>'
                            html += '<p>预计收益</p>'
                            html += '</div>'
                            html +='<div class="line"></div>'
                            html += '<div class="rofit">'
                            html += '<p>' + item.ta_balance+ '</p>'
                            html += '<p>投资本金（元）</p>'
                            html += '</div>'
                            html += '</div>'
                            html += '<div class="date">'
                            html += '<img src="/img/externalDocking/time@2x.png" alt="" />'
                            html += '<span>预期产品到期日: '+item.product_expiring_date+'</span>'                         
                            html += '</div>'
                            html += '</div>'
                            html += '</div>'

                        });
                        
                        $('#invest').append(html);
                    } else {
                        alert('网络忙，请稍后再试！')
                    }
                }
                mescroll.endErr();
            },
            error: function (error) {
                //console.log('系统处理出现错误...');
              mescroll.endErr();
                alert("网络忙，请稍后再试！");
            }
        });
        //console.log(listLength)
        //return listLength;
    
}
// 安金资产记录
function getRecordsanJin(flag){  
        if(flag){
        	currentPage++;
        }
        var url = '/api/user/accountInfo/anJinProducts.do';
        $.ajax({
            url: url,
            data: {
            	userId:userId,
            	access_token:access_token,
                phone:mobile,
                pageSize: pageSize,
                pageIndex: currentPage
            },
            async:true,
            dataType: 'json',
            type: 'post',
            success: function (data) {             	
            	if(data.code == "0000"){
            		if(data.totalAmount!=0){
            			listLength = data.data.totalAmount;           			
                        var html = '';
                        if(!flag){
                        	html += '<h3 class="title">投资记录</h3>'	
                        }  
                        if(data.data.length == 0){                       	       						
//     						state = false;
       						mescroll.showNoMore();                      	 	
       						return;
                        }
                        $.each(data.data, function (index, item){
                        	item.amount = $.toThousandsWithPointZeros(item.amount,0);                         	
                        	if((item.status == "FINISHED") || (item.status == "PROPOSED") || (item.status == "FROZEN")){
                        		item.status = "申请中";
                        	}else if((item.status == "SETTLED") || (item.status == "OVERDUE") || (item.status == "BREACH")){
								item.status = "持有中";
                        	}else if((item.status == "CLEARED")){
								item.status = "已兑付";
                        	}else if((item.status == "CANCELED_BY_USER")||(item.status == "CANCELED")){
								
								item.status = "已取消";
                        	}else if((item.status == "ASSIGNED")){
								
								item.status = "已转让";
                        	}else if((item.status == "FAILED")){
								// 已兑付
								item.status = "流标";
                        	}else if((item.status == "FROZEN_FAILED")){							
								item.status = "冻结失败";
                        	}else if((item.status == "TIMEOUT")){							
								item.status = "投标超时";
                        	}

                        	html += '<div class="item itou_list">'
                            html += '<h4>' + item.loanTitle + '</h4>'
                            html += '<div class="item-content">'
                             html += '<div class="content">'
                             
                            html += '<div class="principal">'
	                            html += '<p>' + item.rate/100+'%</p>'
	                            html += '<p>历史参考收益率</p>'
                            html += '</div>'
                            
                            html +='<div class="line"></div>'
                            
                            html += '<div class="rofit">'
	                            html += '<p>'+item.amount+ '</p>'	                           
	                            html += '<p>投资本金（元）</p>'
                            html += '</div>' 
                            
                            html +='<div class="line left-73"></div>'
                            html += '<div class="pro-status"><span>'+item.status+'</span></div>';
                           
                            html += '</div>'
                            html += '<div class="date">'
                            html += '<img src="/img/externalDocking/time@2x.png" alt="" />'
                            html += '<span>产品期限: '+item.duration.totalDays+'天</span>'                         
                            html += '</div>'
                            html += '</div>'
                            html += '</div>'
                                                       
                        });
                        if(!flag){
        					$('#invest').empty()
       					}
                        $('#invest').append(html);
            		}else{
            			if(!flag){
        					$('#invest').empty().append('<div class="no-data text-center margin-top-30">无资产信息数据</div>');
       					}
       					
            		}
            	}else{
            		layer.open({
            			content:data.message,
            			skin:'sure',
            			time:1
            		})
            	}
               mescroll.endErr(); 
            },
            error: function (error) {
               mescroll.endErr();
              
            }
        });
        //console.log(listLength)
        //return listLength;
    
}
//用户投资记录列表 -- itou
function getRecordsiTou(flag){ 
		if(flag){
        	currentPage++;
        }
        var phone = "";//user.mobile;
        var url = '/api/user/accountInfo/itouProducts.do';
        $.ajax({
            url: url,
            data: {
            	userId:userId,
            	access_token:access_token,
                phone:mobile,
                pageSize: pageSize,
                pageIndex: currentPage
            },
            async:true,
            dataType: 'json',
            type: 'post',
            success: function (data) {
                if(data.code == "0000"){                	
            		if(data.totalAmount!=0){
            			listLength = data.data.totalAmount;
                        var html = '';
                        if(!flag){
                        	html += '<h3 class="title">投资记录</h3>'	
                        }  
                        if(data.data.length == 0){                       	      						
//     						state = false;
       						mescroll.showNoMore();                      	 	
       						return;
                        }  
                       
                        $.each(data.data, function (index, item){
                        	item.amount = $.toThousandsWithPointZeros(item.amount,0);
                        	if((item.status == "FINISHED") || (item.status == "PROPOSED") || (item.status == "FROZEN")){
                        		//申请中
                        		item.status = "申请中";
                        	}else if((item.status == "SETTLED") || (item.status == "OVERDUE") || (item.status == "BREACH")){
								// 持有产品
								item.status = "持有中";
                        	}else if((item.status == "CLEARED")){
								// 已兑付
								item.status = "已兑付";
                        	}else if((item.status == "CANCELED_BY_USER")||(item.status == "CANCELED")){
								// 已取消
								item.status = "已取消";
                        	}else if((item.status == "ASSIGNED")){
								item.status = "已转让";
                        	}else if((item.status == "FAILED")){
								// 已兑付
								item.status = "流标";
                        	}else if((item.status == "FROZEN_FAILED")){							
								item.status = "冻结失败";
                        	}else if((item.status == "TIMEOUT")){							
								item.status = "投标超时";
                        	}
                        	
                        	html += '<div class="item itou_list">'
                            html += '<h4>' + item.loanTitle + ' </h4>'
                            html += '<div class="item-content">'
                             html += '<div class="content">'
                            html += '<div class="principal">'
                            html += '<p>' + item.rate/100+'%</p>'
                            html += '<p>历史参考收益率</p>'
                            html += '</div>'
                            html +='<div class="line"></div>'
                            html += '<div class="rofit">'
                            html += '<p>' + item.amount+ '</p>'
                            html += '<p>投资本金（元）</p>'
                            html += '</div>'
                            html +='<div class="line left-73"></div>'
                            html += '<div class="pro-status"><span>'+item.status+'</span></div>';
                            html += '</div>'
                            html += '<div class="date">'
                            html += '<img src="/img/externalDocking/time@2x.png" alt="" />'
                            html += '<span>产品期限: '+item.duration.totalDays+'天</span>'                         
                            html += '</div>'
                            html += '</div>'
                            html += '</div>'
                        });
                        if(!flag){
        					$('#invest').empty()
       					}
                        $('#invest').append(html);
            		}else{
            			if(!flag){
        					$('#invest').empty().append('<div class="no-data text-center margin-top-30">无资产信息数据</div>');
       					}            		
            		}
            	}else{
            		layer.open({
            			content:data.message,
            			skin:'sure',
            			time:1
            		})
            	}
            	mescroll.endErr();
            },
            error: function (error) {              
                alert("网络忙，请稍后再试！");
            }
        });
        //console.log(listLength)
        //return listLength;
    
}
// 证通资管

function getRecordsZTZG(flag){	
	 if(flag){
        	currentPage++;
        }
        var url = '/api/ztb/tradeApply.do';
        $.ajax({
            url: url,
            data: {
            	ztId:ztId,            	
                pageSize:'8',
                pageNo: currentPage
            },
            async:true,
            dataType: 'json',
            type: 'post',
            success: function (data) {             	
            	if(data.code == "0000"){
            		if((data.content.totalRecord!=undefined) && (data.content.totalRecord!=0)){
            			listLength = data.content.totalRecord;           			
                        var html = '';                       
                        if(data.content.list.length == 0){                       	     						
//     						state = false;
       						mescroll.showNoMore();                      	 	
       						return;
                        }
                        $.each(data.content.list, function (index, item){  
                        	var imgStr = "";
                        	var statusText = "";
                        	var colorClass = ""
                        	if(item.confirmFlag == "0"){
                        				statusText = "确认失败";
                        				colorClass = "red";
                        		}else if(item.confirmFlag == "1"){
                        				statusText = "确认成功";
                        		}else if(item.confirmFalg == "2"){
                        				statusText = "部分确认";
                        		}else if(item.confirmFlag == "4"){
                        				statusText = "已撤单";
                        		}else if(item.confirmFlag == "5"){
                        				statusText = "认购确认";
                        		}else if(item.confirmFlag == "9"){
                        				statusText = "待确认";
                        		}
                        		
                        	var applicationAmount;
                        	if((item.businessCode == "020")|| (item.businessCode == "120")||(item.businessCode == "022") || (item.businessCode == "122") ||(item.businessCode == "130")){
                        		imgStr = '<img src="/img/account/icon-buy.png" alt="" />';
                        		//if(item.payFlag    item.confirmFlag)
                        		if(item.payFlag == "0"){
                        			statusText = "交易处理中";                        			
                        		}else if(item.payFlag == "1"){
                        			statusText = "扣款失败";
                        			colorClass = "red";
                        		}else if(item.payFlag == "3"){
                        			statusText = "交易处理中";
                        		}
                        		applicationAmount = item.applicationAmount;
                        		applicationAmount =  $.toThousandsWithPointZeros(applicationAmount,2) + "&nbsp;元";
                        	}else{
                        		imgStr = '<img src="/img/account/icon-redeem.png" alt="" />'; 
                        		applicationAmount = item.applicationVol;
                        		applicationAmount =  $.toThousandsWithPointZeros(applicationAmount,2) + "&nbsp;份";
                        	}
                        	    item.transactiontime = moment(item.transactiontime).format('YYYY-MM-DD  h:mm:ss '); 
                        	 	
                        	html += '<div class="item ztzg-record"  onclick="getRecordDetails(\''+item.appSheetSerialNo+'\',\''+item.businessCode+'\')">';
								html +=	'<div class="ztzg">';
									html += '<div>';
										html +=imgStr;
									html += '</div>';
									html += '<div>';
										html += '<p>';
											html += '<span class="ztzg-title">';
										html += item.fundName;
										html += '</span>';
										html += '<span class="pull-right ztzg-title">'+applicationAmount+'</span>';
										html += '</p>';											
										html += '<p>';
										html += '<span class="ztzg-time">';
										html += item.transactiontime;
										html += '</span>';
										html += '<span class="pull-right black   '+colorClass+' ">'+statusText+'</span>';
										html += '</p>';
									html += '</div>';
								html += '</div>';
							html += '</div>';
                        	
                        	
                                                       
                        });
                        if(!flag){
        					$('#invest').empty()
       					}
                        	$('#invest').append(html);
            		}else{
            			if(!flag){
        					$('#invest').empty().append('<div class="no-data text-center margin-top-30">无资产信息数据</div>');
       					}
       					
            		}
            	}else{
            		layer.open({
            			content:data.message,
            			skin:'sure',
            			time:1
            		})
            	}
               mescroll.endErr(); 
            },
            error: function (error) {
               mescroll.endErr();
              
            }
        });
}
function getZtId(){	
	var parma = {
		userId:userId,
		phoneNo:mobile,
		access_token:access_token		
	}
	$.ajax({
		type:"post",
		url:"/api/ztb/seleteZTId.do",
		async:false,
		data:parma,
		dataType:'json',
		success:function(data){
			if(data.code == "0000"){
				ztId = data.ztId;
			}
		},
		error:function(error){
			 console.log(JSON.stringify(error));      
		}
	});	
}

function getRecordDetails(SerialNo,businessCode){
	var parma = {
		ztId:ztId,
		userId:userId,
		access_token:access_token,
		appSheetSerialNo:SerialNo,
		businessCode:businessCode
	}
	$.ajax({
		type:"post",
		url:"/api/ztb/recordDetails.do",
		async:false,
		data:parma,
		dataType:'json',
		success:function(data){
			if(data.code == "0000"){
				location.href= data.url;
			}else{
				$.alert(data.message);
			}
		},
		error:function(error){
			 $.alert("网络忙，请稍后再试!")    
		}
	});	
}


function backClick(){
	var blackUrl = status == 4?window.location.href ="/view/account/myAsset.html":window.history.go(-1);	
}
