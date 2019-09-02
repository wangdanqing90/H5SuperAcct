/*超级用户测试和生产地址*/
	// 天金相关的测试
	//var superUrl = "https://tjsappuat.tjfae.com/"; 
	// 生产
	//var superUrl = "https://tjslc.tjfae.com/";
	

(function ($) {		
    $.fn.indexView = function (list) {
        //console.log("list=="+JSON.stringify(list));
        var $this = $(this);
        //清空表格
        $this.find("tr:gt(0)").remove();
        var ths = $this.find("th");
        $.each(list, function (index, bean) {
                            var alldata = JSON.stringify(bean);
                            console.info("alldata:"+alldata);


            var tr = $("<tr></tr>");
            if (index % 2 == 0) {
                tr.addClass("tbbg");
            }
            $.each(ths, function (idx, th) {
                //本来打算抽象成统一代码，但是个性化处理实在太多，直接写死了
                var td = $("<td></td>");
                var tdInner = "";
                if (idx == 0) {//名称列
                    if( $.isFinished(bean.status)){
                        tdInner = '<span class="item"><a href="javascript:void(0);" title="'+ bean.title+'">' + $.limitDis(bean.title) + '</a>';
                    }else{
                        tdInner = '<span class="item"><a href="javascript:void(0);" title="'+ bean.title+'" onclick="$.viewProduct(\''+bean.id+'\',\''+bean.loanRequest.productKey+'\',\''+bean.loanRequest.ticket_status+'\',null,\''+bean.title+'\')">' + $.limitDis(bean.title) + '</a>';
                    }

                    if(bean.loanRequest.ticket_status=='1'){
                         tdInner+='<img src="/../img/coupon/quan.png"  style="margin-left:10px;width:18px;margin-top: -2px">';
                    }
                    tdInner+='</span>';        
                } else if (idx == 1) {//配置建议
                    td.addClass("hidden-xs hidden-sm");
                    var productRiskLevel = eval("(" + bean.loanRequest.clientPriv + ")").productRiskLevel;
                    tdInner = '<i class="icon_sm_ta' + $.riskLevelConvert(productRiskLevel) + '"></i>';
                }
                //else if (idx == 2) {//本息分配方式
                //    td.addClass("hidden-xs");
                //    tdInner = '<span class="item">一次性还本付息</span>';
                //}
                else if (idx == 2) {//约定年化利率
                    tdInner = '<span class="rate">' + bean.rate / 100 + '%</span>';
                } else if (idx == 3) {//总金额 变更为 剩余可投金额
                    td.addClass("hidden-xs hidden-sm");
                    //var amount = bean.amount;
                    var amount = bean.balance;
                    var unit = "元";
                    if (amount / 10000 > 1) {
                        amount = amount / 10000;
                        unit = "万元";
                    }
                    tdInner = '<span class="money">¥<span class="how">' + amount + '</span>' + unit + '</span>';
                } else if (idx == 4) {//期限
                    td.addClass("hidden-xs");
                    var duration = bean.loanRequest.duration;
                    var term = 0;
                    var unit = "天";
                    if (duration.totalDays) {
                        term = duration.totalDays;
                    }
                    //else if (duration.totalMonths) {
                    //    term = duration.totalMonths;
                    //    unit = "个月";
                    //}
                    tdInner = '<span class="date"><span class="how">' + term + '</span>' + unit + '</span>';
                } else if (idx == 5) {//进度
                    td.addClass("hidden-xs");
                    var percent = Math.floor((bean.amount - bean.balance) / bean.amount * 100);
                    //console.log("bean.amount=="+bean.amount+";bean.balance=="+bean.balance+";percent=="+percent);
                    tdInner = '<div class="easy-pie-chart percentage" data-size="42" data-percent="' + percent + '" data-color="#00A0E8">' +
                        '<span class="percent">' + percent + '</span>%' +
                        '</div>';
                } else if (idx == 6) {//操作
                    if( $.isFinished(bean.status)){
                        tdInner = '<a class="button button-pill button-buy" href="javascript:void(0);">' + $.operation[bean.status] + '</a>';
                    }else{
                        if(bean.productKey=="YGJPY"){
                            tdInner = '<a class="button button-caution button-pill button-buy" href="javascript:void(0);"  onclick="$.viewProduct(\''+bean.id+'\',\''+bean.loanRequest.productKey+'\',\''+bean.loanRequest.ticket_status+'\',null,\''+bean.title+'\')">' + $.operation[bean.status] + '</a>';
                        }else{
                            tdInner = '<a class="button button-caution button-pill button-buy" href="javascript:void(0);"  onclick="$.viewProduct(\''+bean.id+'\',\''+bean.loanRequest.productKey+'\',\''+bean.loanRequest.ticket_status+'\',null)">' + $.operation[bean.status] + '</a>';
                        }
                    }

                }
                td.append(tdInner);
                //此处应该有列样式处理
                tr.append(td);
                //此处应该有行样式处理

            });
            $this.append(tr);
        });
        //百分比样式显示
        $.percent();
    }

    /**
     * 方法名称：filterDataByCondition
     * 方法描述：对产品list中指定状态的产品进行处理
     * 进度显示为100%，剩余可投金额为0元
     * @parameter statusArray:状态数组
     * parameter list:产品列表
     */
    $.filterDataByCondition = function(statusArray,list){
        var productBean = null;

        for(var j = 0; j < list.length; j++){
            productBean = list[j];
            if(statusArray.indexOf(productBean.status) != -1){
                /** 如果包含该状态则进行数据处理,剩余可投金额=0，进度设置为100%；否：不进行处理 */
                productBean.balance = 0;
            }
        }
    }
    $.viewProduct = function(pId,type,ticket_status,association,current){
        var param = pId?"pId="+pId:"";
        param +=type?"&type="+type:"";
        param +=ticket_status!='0'?"&ticket_status="+ticket_status:"&ticket_status=0";
        if($.checkProduct(type,pId)){
            var secondKey=$.getSecondKey(pId);
            //if(!$.isNullOrBlank(secondKey) && secondKey=="wenJin"){
            //    if(window.location.href.indexOf("wenzhouFinance")>0){
            //        location.href = "/exchange/product/wenJin_product.html?"+param+"&tgt="+window.localStorage.getItem("tgt");
            //    }else{
            //        $.confirm("您是否授权安金普惠网站，登录温金中心进行理财产品购买?",null,function(v){
            //            if(v=="ok") {
            //                location.href = "/exchange/product/wenJin_product.html?"+param+"&tgt="+window.localStorage.getItem("tgt");
            //            }
            //        },null,"授权");
            //    }
            //
            //}else if(!$.isNullOrBlank(secondKey) && secondKey=="anJin"){
            //    if(window.location.href.indexOf("anfaeFinance")>0){
            //        location.href = "/anfae/product/anfae_product.html?"+param+"&tgt="+window.localStorage.getItem("tgt");
            //    }else{
            //        $.confirm("您是否授权安金普惠网站，登录安金所进行理财产品购买?",null,function(v){
            //            if(v=="ok") {
            //                location.href = "/anfae/product/anfae_product.html?"+param+"&tgt="+window.localStorage.getItem("tgt");
            //            }
            //        },null,"授权");
            //    }
            //
            //}else
            if(!current){
                if(association=="true"){
                    location.href = "/view/product/association.html?"+param;
                    console.log("if")
                }else{
                    location.href = "/view/product/product.html?"+param;
                    console.log("else")
                }
            }else if(type=="YGJPY"){
                    var matherProduct = current.indexOf('母亲节')
                    var fatherProduct = current.indexOf('父亲节')
                    var gender = $.isMale(user.idNumber);
                    if(matherProduct>=0 && (gender==true)){
                        $.alert("很抱歉，本次母亲节专享产品仅限女性用户们购买哦~6月为您准备的父亲节专享产品已经在路上啦~（此次活动性别判断依据为各位在安金普惠的绑卡信息认证）");
                    }else if(fatherProduct>=0 && (gender==false)){
                        $.alert('很抱歉，本次父亲节专享产品仅限男性用户们购买，让“超级英雄们”好好享受他们的节日吧！请您购买安金普惠更多其他产品哦~（此次活动性别判断依据为各位在安金普惠的绑卡信息认证）')
                    }else{
                        if(association=="true"){
                            location.href = "/view/product/association.html?"+param;
                            console.log("if")
                        }else{
                            location.href = "/view/product/product.html?"+param;
                            console.log("else")
                        }
                    }
                }else{
                    if(association=="true"){
                        location.href = "/view/product/association.html?"+param;
                        console.log("if")
                    }else{
                        location.href = "/view/product/product.html?"+param;
                        console.log("else")
                    }
            }

        }
        console.log()
    }

    $.getSecondKey=function(loanId){
       var result="";
        $.ajax({
            url: '/api/v2/loan/getExchangeType/'+loanId,
            type:"get",
            async:false,
            data:{},
            dataType:"json",
            success: function (data) {
                if(data.data!=null&&data.success==true){
                    result= data.data.code;
                }
            },
            error: function(r){
                console.log('error：'+r);
            }
        });
        return result;
    }
    $.formatNum=function(str){
    	// console.log("str:"+str);
        str = str.toString();
        str=str.split('').reverse().join('').replace(/(\d{3})/g,'$1,').replace(/\,$/,'').split('').reverse().join('');
        // console.log("str:"+str);
        return str;
    }
    //不四舍五入 只保留两位小数 decimal为控制保留几位小数
    $.formatNumNoRound=function(str,decimal){
    	decimal = decimal==null ? 2 :decimal; //默认为两位有效数字
    	str = str.toString();
    	var dian = str.indexOf('.');  
        var result = "";  
        if(dian == -1){  
            result =  parseFloat(str).toFixed(2);  
        }else{  
            var cc = str.substring(dian+1,str.length);  
            if(cc.length >2){  
                //result =  (Number(num.toFixed(2))+0.01)*100000000000/100000000000;//js小数计算小数点后显示多位小数  
            	if(Number(decimal)==0){
            		result = str.substring(0,dian); 
            	}else{
            		result = str.substring(0,dian+Number(decimal)+1); 
            	}
            }else{  
                result =  parseFloat(str).toFixed(Number(decimal));  
            }  
        }  
        return result;
    }
    
    $.checkProduct = function(type,pId){
        if(type!="BANK"){//非银行类产品需要登陆并且有客户经理
            if($.isLogin()){
                var user = $.getUser();
                //if($.getInviter(user.salesNo)){
                //    //if(type=="FUDAI"){//福袋产品需要查询是否能够购买----统一在产品详情页控制
                //    //    if($.isGreenhand(user.id)){
                //            return true;
                //        //}else{
                //        //    $.alert("新手专享产品只能购买一次");
                //        //}
                //    //}else{
                //    //    return true;
                //    //}
                //}else{
                //    if(type!="YGJPY"){
                //    $.confirm("是否绑定客户经理？",null,function(v){
                //        if(v=="ok") {
                //            $.goBond();
                //        }
                //    });
                //    }else{
                //        return true;
                //    }
                //}
                return true;
            }else{
                $.confirm("您还未登录或登录超时，请登录后操作",null,function(v){
                    if(v=="ok"){
                        $.goLogin();
                    }
                });
            }
        }else{
            return true;
        }
        return false;
    }
    $.getProductInfo = function(id){
        var product = null;
        $.ajax({
            url: '/api/v2/loan/'+id,
            type:"get",
            async:false,
            data:{},
            dataType:"json",
            success: function (data) {
                product = data;
            },
            error: function(r){
                console.log('error：'+r);
            }
        });
        return product;
    }
    $.getVirtualProductInfo = function(id){
        var product = null;
        $.ajax({
            type:'post',
            url:'/api/v2/loan/getVituralLoan',
            data:{
                couponsCategoryType:id,
            },
            dataType:'json',
            async:false,
            success: function (data) {
                product = data;
            },
            error: function(r){
                console.log('error：'+r);
            }
        });
        return product;
    }
    //转让:获取转让利率
    $.getAssignRate = function(param,type){
    	var G=param.G/1.0;//投资本金
    	var B=param.B/1.0;//投资本金
		var C=param.C/1.0;//年化收益率  //统一以小数点处理不要弄2400 统一处理成 传进来就是0.24
		var D=(param.D<0 ? 0 :param.D)/1.0;//持有D天 
		var N=param.N/1.0;//一年为N天
		var H=param.H/1.0;//H为投资期限 
//		console.log("B="+B);
//		console.log("G="+G);
//		console.log("D="+D);
//		console.log("N="+N);
//		console.log("H="+H);
//		console.log("C="+C);
		var defaultAssinRate
		if(type==""||type==null||typeof(type)=="undefined"||type=="myAssign"){//我的转让页面里使用的这个公式算转让利率
			//以前的算法
//			console.log("((G-B)/B*N/D*10000 )/100 保留之前的值为="+((G-B)/B*N/D*10000 )/100);
//			defaultAssinRate=$.formatNumNoRound(    ((G-B)/B*N/D*10000 )/100    );
			
			//现在的算法
//			console.log("(G-B)/B*N/D 保留之前的值为="+(G-B)/B*N/D);
			var defaultAssinRate =(G*10000-B*10000)/10000/B*N/D;
			var tempRate = D<0 ? 0 :  (  (G*10000-B*10000)/10000/B*N/D  );
			if(tempRate!=0&&Number( $.formatNumNoRound(B+B*C*D/N) )==G){
				defaultAssinRate = $.formatNumNoRound(C*100,0);
			}else{
				defaultAssinRate = $.formatNumNoRound(tempRate*100,2);
			}
//			console.log("defaultAssinRate="+defaultAssinRate);
		}else if(type=="assignment"){//转让专区
			//以前的算法
			//defaultAssinRate =  (H-D)==0? 0: $.formatNumNoRound( ( (B+B*C*H/N-G)/G*N/(H-D) )*100  );
			
			//现在的算法 转让专区的利率始终要用公式来算
			var defaultValue = $.formatNumNoRound(B+B*C*D/N);
			var tempRate = (H-D)==0 ? 0 :(   (B*10000+B*C*H/N*10000-G*10000 )/10000    )/G*N/(H-D);
//			console.log("(B+B*C*H/N-G)="+(B+B*C*H/N-G));
//			console.log("(B*10000+B*C*H/N*10000-G*10000)/10000="+((B*10000+B*C*H/N*10000-G*10000)/10000));
			defaultAssinRate = $.formatNumNoRound(tempRate*100,2);
			//console.log(defaultAssinRate);
		}
        return defaultAssinRate
    }
    
    //转让:获取持有天数
    /**
     * timeSettled 结算日期
     * totalDays  投资期限
     * nowDateStr 正常传参的为 转让申请日期 若不传值 则默认当前时间
     */
    $.getHoldTime=function(timeSettled,totalDays,nowDateStr){//入参为结算天数 结算当天就起息
    	var nowStr=moment().format("YYYY-MM-DD")+" 00:00:00";
    	if(nowDateStr){
    		nowStr=moment(nowDateStr).format("YYYY-MM-DD")+" 00:00:00";
    	}
    	var timeSettledStr = moment(timeSettled).format("YYYY-MM-DD")+" 00:00:00";
    	var holdTime = (moment(nowStr)-moment(timeSettledStr))/1000/60/60/24;
    	holdTime = holdTime+1;
    	if(totalDays&&holdTime>Number(totalDays)){
    		holdTime=totalDays
    	}
    	return holdTime;
    }
    
    //转让:获取平台收益
    $.getPlatFormFee=function(param){
    	//手续费更新 G*p
    	var G = param.G/1.0;
    	var p = param.p/1.0;
    	var platFormFee = G*(parseFloat(p));
    	return platFormFee.toFixed(2);//四舍五入
    }
    //转让:转让后本息收益
    $.getAfterAssignAmount=function(param){
    	var G = param.G/1.0;
    	var p = param.p/1.0;
    	var relAmount = G*(1-p);
    	return $.formatNumNoRound(relAmount);
    }
    
    $.fn.searchView = function (list) {
        var $this = $(this);
        //清空表格
        $this.find("li").remove();
        $.each(list, function (index, bean) {
            var li = $('<li class="col-xs-12"></li>');
            var rowDiv = $('<div class="row"></div>');
            var img = "";
            if(bean.loanRequest.ticket_status==1){
                img =  '<img src="/../img/coupon/quan.png" style="margin-left:10px;width:18px;margin-top: -2px">';
            }
            if (index == 0) {//第一行为热门推荐
                var hotDiv;
                if( $.isFinished(bean.status)){
                    hotDiv = '<div class="row product-hot">' +
                        '<div class="col-xs-12 col-sm-10 ">' +
                        '<h2 class="bg"><i class="icon-angle"></i><div class="title-hot"><a href="javascript:void(0);" title="'+bean.title+'">' + $.limitDis(bean.title) + '</a>'+img+'</div></h2>' +
                        '</div>' +
                        '</div>';
                }else{
                    hotDiv = '<div class="row product-hot">' +
                        '<div class="col-xs-12 col-sm-10 ">' +
                        '<h2 class="bg"><i class="icon-angle"></i><div class="title-hot"><a href="javascript:void(0);" title="'+bean.title+'" onclick="$.viewProduct(\''+bean.id+'\',\''+bean.loanRequest.productKey+'\',\''+bean.loanRequest.ticket_status+'\',null,\''+bean.title+'\')">' + $.limitDis(bean.title) + '</a>'+img+'</div></h2>' +
                        '</div>' +
                        '</div>';
                }

                li.append(hotDiv);
                rowDiv.addClass("product-hot");
            } else {
                var h;
                if( $.isFinished(bean.status)){
                    h = '<h2><a href="javascript:void(0);">' + $.limitDis(bean.title) + '</a>'+img+'</h2>';
                }else{
                    h = '<h2><a href="javascript:void(0);"  onclick="$.viewProduct(\''+bean.id+'\',\''+bean.loanRequest.productKey+'\',\''+bean.loanRequest.ticket_status+'\',null,\''+bean.title+'\')">' + $.limitDis(bean.title) + '</a>'+img+'</h2>';
                }

                li.append(h);
            }
            var rateDiv = '<div class="col-xs-6 col-sm-2 text-center">' +
                '<div>' +
                '<h4>历史参考年化收益率</h4>' +
                '<h3 class="red">' + bean.rate / 100 + '%</h3>' +
                '</div>' +
                '</div>';
            var duration = bean.loanRequest.duration;
            var duration_term = 0;
            var duration_unit = "天";
            if (duration.totalDays) {
                duration_term = duration.totalDays;
            }
            //else if (duration.totalMonths) {
            //    duration_term = duration.totalMonths;
            //    duration_unit = "个月";
            //}
            var duration_str = duration_term + duration_unit;
            var durationDiv = '<div class="col-xs-6 col-sm-2 text-center">' +
                '<div class="l-dashed r-dashed">' +
                '<h4>投资期限</h4>' +
                '<h3>' + duration_str + '</h3>' +
                '</div>' +
                '</div>';
            //var amount = bean.amount;
            var amount = bean.loanRequest.investRule.minAmount;
            //console.log('起投金额====' + amount);
            var amount_unit = "元";
            if (amount / 10000 > 1) {
                amount = amount / 10000;
                amount_unit = "万元";
            }
            var amount_str = amount + amount_unit;
            var amountDiv = '<div class="col-xs-6 col-sm-2 text-center">' +
                '<div>' +
                '<h4>起投金额</h4>' +
                '<h3>' + amount_str + '</h3>' +
                '</div>' +
                '</div>';
            var productRiskLevel = eval("(" + bean.loanRequest.clientPriv + ")").productRiskLevel;
            var riskDiv = '<div class="col-xs-6 col-sm-2 text-center hidden-xs">' +
                '<div class="l-dashed r-dashed">' +
                '<h4>&nbsp;</h4>' +
                '<div class="ta"><i class="icon_sm_ta' + $.riskLevelConvert(productRiskLevel) + '" title="'+ $.riskLevelMap[productRiskLevel]+'"></i></div>' +
                '</div>' +
                '</div>';
            var percent = Math.floor((bean.amount - bean.balance) / bean.amount * 100);
            var percentDiv = '<div class="col-xs-6 col-sm-2 text-center">' +
                '<div>' +
                '<h4>项目进度</h4>' +
                '<div class="easy-pie-chart percentage" data-size="42" data-percent="' + percent + '" data-color="#00A0E8">' +
                '<span class="percent">' + percent + '</span>%' +
                '</div>' +
                '</div>' +
                '</div>';
            var optionDiv;
            if( $.isFinished(bean.status)){
                optionDiv= '<div class="col-xs-12 col-sm-2 text-center bg-white" >' +
                    '<a class="button button-pill button-buy-md" href="javascript:void(0);" >' + $.operation[bean.status] + '</a>' +
                    '</div>';
            }else{
                optionDiv= '<div class="col-xs-12 col-sm-2 text-center bg-white" >' +
                    '<a class="button button-caution button-pill button-buy-md" href="javascript:void(0);"  onclick="$.viewProduct(\''+bean.id+'\',\''+bean.loanRequest.productKey+'\',\''+bean.loanRequest.ticket_status+'\',null,\''+bean.title+'\')">' + $.operation[bean.status] + '</a>' +
                    '</div>';
            }


            rowDiv.append(rateDiv).append(durationDiv).append(amountDiv).append(riskDiv).append(percentDiv).append(optionDiv);
            li.append(rowDiv);
            $this.append(li);
        });
        //百分比样式显示
        $.percent();
    }
    /**
     * 对象方法名称:constructPageInfo
     * 对象方法描述:公共分页功能方法
     * 规则:1 显示第一页和最后一页;
     *     2 当前页依据给定的选中状态css样式显示,其余状态为未选中css样式;
     *     3 当前页与第一页相差 > 4 :当前页前显示与其向前相邻的3个页码,第一页显示,第一页后加...页;
     *                       <= 4 :则第一页到当前页都显示
     *     4 当前页与尾页相差  >  3 :显示当前显示与其向后相邻的2个页码,最后页显示,最后页前加...页;
     *                       <= 3 :则当前页到最后一页都显示
     * @author:zhaoxinbo
     * @param currentPage:当前页
     *        maxPage:最大页数即最后一页
     *        classSelected:选中时的css样式名称
     *        classOther:未选中时的样式名称
     * @returns void
     * @date 2015-09-10 16:25
     */
    $.fn.page = function (option) {
        var default_option = {
            pageSize: 10,
            total: 0
        };
        option = $.extend(default_option, option);
        var $this = $(this);
        if (option.total / option.pageSize > 1) {//只有多余1页才显示分页div
            //清空已存在的ul
            $this.children("ul").remove();
            var page = Math.ceil(option.total / option.pageSize);
            var ul = $('<ul class="pagination singlePagination">' +
                $.createBtn("首页") +
                $.createBtn(1, "", true) +
                $.createBtn(2) +
                    //'<li><a href="#">末页</a></li>'+
                '</ul>');

            var lastBtn = '';
            if (page > 6) {
                for (var i = 3; i < 6; i++) {
                    ul.append($.createBtn(i));
                }
                lastBtn = $.createBtn(page, "p");
            } else {
                for (var i = 3; i < page + 1; i++) {
                    ul.append($.createBtn(i));
                }
            }
            ul.append(lastBtn);
            ul.append($.createBtn("末页"));
            $this.append(ul);

            //数字按钮事件添加
            $this.delegate("a", "click", function (event) {

                var $this = $(this);
                var value = $this.text().replace("...", "");
                if (!isNaN(Number(value))) {//数字按钮事件
                    //阻止事件冒泡
                    //event.stopPropagation();
                    //需要的变量有
                    ul.pageSelect(Number(value));
                } else {
                    return;
                }
            });
            //首页，末页事件添加
            ul.children(":first").children().click(function () {
                ul.children(":eq(1)").children().click();
            });
            ul.children(":last").children().click(function () {
                ul.children(":last").prev().children().click();
            });
        }

    }
    $.fn.pageSelect = function (pageNum) {
        var $this = $(this);

        //清除...
        function cleanDot(element) {
            if (element.length == 0) {
                return;
            } else if (element.length == 1) {
                element = $(element);
            }
            element.html(element.text().replace("...", ""));
        }

        //参数准备
        var value = Number(pageNum);
        var lis = $this.find("li");
        var firsta = $(lis[1]).children();
        var lasta = $(lis[lis.length - 2]).children();
        var page = lasta.text().replace("...", "");
        var $a = "";
        $this.find("a").each(function (index, a) {
            var tempA = $(a);
            if (tempA.text().replace("...", "") == value) {
                $a = tempA;
            }
        });
        var $thisLi = "";
        if (!$a) {
            $thisLi = $($.createBtn(value, "", true));
            lasta.parent().before($thisLi);
            $a = $thisLi.children();
        } else {
            $thisLi = $a.parent();
        }
        //var ul = $thisLi.parent();


        //样式改变
        $thisLi.addClass("active");
        $thisLi.siblings().removeClass("active");
        //要去除按钮的...
        cleanDot($a);

        //现在要改变下思路，直接重写ul里面的li

        //清空除头尾外的所有元素

        //console.log("lis.length=="+lis.length);

        for (var i = 2; i < lis.length - 2; i++) {
            if (Number($(lis[i]).children().text()) != value) {
                //console.log(i+"removed");
                $(lis[i]).remove();
            }
        }

        //直接获取数组对象为js原生对象s
        //console.log(lis[1].outerHTML);

        //前后显示多少个
        var displayNum = 4;
        //前边按钮
        var preNum = value - displayNum;
        if (preNum < 3) {//所点击按钮前半部分会延续到1
            preNum = Math.abs(preNum);
            for (var i = 2; i < value; i++) {
                $thisLi.before($.createBtn(i));
            }
            //1按钮要去掉...
            cleanDot(firsta);
        } else {
            for (var i = preNum; i < value; i++) {
                //console.log("pre i=="+i);
                $thisLi.before($.createBtn(i));
            }
            //此时1要加...
            if (firsta.text().indexOf("...") < 0) {
                firsta.append("...");
            }

        }
        //后边按钮
        var nextNum = page - value - displayNum;
        if (nextNum < 2) {//后面的全部显示,没有...
            //console.log("nextNum<1");
            nextNum = Math.abs(nextNum);
            for (var i = page - value - 1; i > 0; i--) {
                $thisLi.after($.createBtn(i + value));
            }
            //最后按钮要去掉...
            cleanDot(lasta);
        } else {
            for (var i = value + displayNum; i > value; i--) {
                //console.log("next i=="+i);
                $thisLi.after($.createBtn(i));
            }
            //此时1要加...
            if (lasta.text().indexOf("...") < 0) {
                lasta.prepend("...");
            }
        }

    }
    //创建按钮方法
    $.createBtn = function (num, top, active) {
        var hrefStr = "javascript:void(0);";
        hrefStr = "#";
        var classStr = "";
        if (active == true) {
            classStr = "active";
        }
        if (top) {
            if (top == "p") {
                return '<li class="' + classStr + '"><a href="' + hrefStr + '">...' + num + '</a></li>';
            } else if (top == "t") {
                return '<li class="' + classStr + '"><a href="' + hrefStr + '">' + num + '...</a></li>';
            }
        } else {
            return '<li class="' + classStr + '"><a href="' + hrefStr + '">' + num + '</a></li>';
        }
    }
    /**
     * 对象方法名称:constructPageInfo
     * 对象方法描述:公共分页功能方法
     * 规则:1 显示第一页和最后一页;
     *     2 当前页依据给定的选中状态css样式显示,其余状态为未选中css样式;
     *     3 当前页与第一页相差 > 4 :当前页前显示与其向前相邻的3个页码,第一页显示,第一页后加...页;
     *                       <= 4 :则第一页到当前页都显示
     *     4 当前页与尾页相差  >  3 :显示当前显示与其向后相邻的2个页码,最后页显示,最后页前加...页;
     *                       <= 3 :则当前页到最后一页都显示
     * @author:zhaoxinbo
     * @param currentPage:当前页
     *        maxPage:最大页数即最后一页
     *        classSelected:选中时的css样式名称
     *        classOther:未选中时的样式名称
     * @returns void
     * @date 2015-09-10 16:25
     */
    $.fn.constructPageInfo = function (option) {
        var default_option = {
            currentPage: 1,
            maxPage: 1,
            classSelected: "active",
            classOther: ""
        };
        option = $.extend(default_option, option);
        var $this = $(this);
        /** 校验总页数是否为1页,如果是1页则分页模块隐藏 */
        if (option.maxPage <= 1) {
            $this.attr('display', 'none');
            return;
        }

        /** 删除ul下所有子标签 */
        $this.children('li').remove();

        /** 添加首页btn 尾页btn 第一页page 最大页page*/
        var headBtn = "<li><a data-value='1' href='javascript:void(0);'>首页</a></li>";
        var tailBtn = "<li><a data-value='" + option.maxPage + "' href='javascript:void(0);'>尾页</a></li>";
        var firstPage = "<li><a data-value='1' href='javascript:void(0);'>1</a></li>";
        var maxPage = "<li><a data-value='" + option.maxPage + "' href='javascript:void(0);'>" + option.maxPage + "</a></li>";
        $this.append(headBtn);
        //$this.append(firstPage);
        /** 定义 ... 页 当前页*/
        var pointPage = "<li><a >...</a></li>";
        var currentPage = $("<li><a data-value='" + option.currentPage + "' href='javascript:void(0);'> " + option.currentPage + "</a></li>");

        /** 校验当前页是否是第一页或最后一页 */
        var currIsMax = false;
        if (option.currentPage == 1) {//当前页是首页
            firstPage = currentPage;
        } else if (option.currentPage == option.maxPage) {
            //当前页是最大页
            currIsMax = true;
            maxPage = currentPage;
            $this.append(firstPage);
        } else { //当前页在首页和尾页中间
            $this.append(firstPage);
        }
        /** 变量声明 */
        var frontPage = '';
        var afterPage = '';
        var pageNumber = 0;
        /** 一 将所有页码都生成加上,并且给当前页添加选中状态 */
        /** 1 当前页与第一页相比较 > 4 */
        if (option.currentPage - 1 > 4) {
            $this.append(pointPage);
            for (var start = Number(option.currentPage) - 4 + 1; start < Number(option.currentPage); start++) {
                frontPage = "<li><a data-value='" + start + "' href='javascript:void(0);'>" + start + "</a></li>";
                $this.append(frontPage);
            }
            /** 添加当前页到尾页之间的元素 */
            currentPage.addClass(option.classSelected);
            $this.append(currentPage);
            /** 最大页与当前页比较 > 3*/
            if (option.maxPage - option.currentPage > 3) {
                for (var start = 1; start < 3; start++) {
                    pageNumber = Number(start) + Number(option.currentPage);
                    afterPage = "<li><a data-value='" + pageNumber + "' href='javascript:void(0);'>" + pageNumber + "</a></li>";
                    $this.append(afterPage);
                }
                /** 添加 ... 页 */
                $this.append(pointPage);

            } else {
                /**最大页与当前页比较 <= 3 */
                for (var start = Number(option.currentPage) + 1; start < Number(option.maxPage); start++) {
                    afterPage = "<li><a data-value='" + start + "' href='javascript:void(0);'>" + start + "</a></li>";
                    $this.append(afterPage);
                }
            }
            /** 添加最大页和尾页 */
            if (!currIsMax)$this.append(maxPage);
            $this.append(tailBtn);
        } else {
            /** 2 当前页与第一页相比较 <= 4 */
            for (var start = 2; start < Number(option.currentPage); start++) {
                frontPage = "<li><a data-value='" + start + "' href='javascript:void(0);'>" + start + "</a></li>";
                $this.append(frontPage);
            }
            /** 添加当前页到尾页之间的元素 */
            currentPage.addClass(option.classSelected);
            $this.append(currentPage);
            /** 最大页与当前页比较 */
            if (option.maxPage - option.currentPage > 3) {
                for (var start = 1; start < 3; start++) {
                    pageNumber = Number(start) + Number(option.currentPage);
                    afterPage = "<li><a data-value='" + pageNumber + "' href='javascript:void(0);'>" + pageNumber + "</a></li>";
                    $this.append(afterPage);
                }
                /** 添加 ... 页 */
                $this.append(pointPage);
            } else {
                for (var start = Number(option.currentPage) + 1; start < Number(option.maxPage); start++) {
                    afterPage = "<li><a data-value='" + start + "' href='javascript:void(0);'>" + start + "</a></li>";
                    $this.append(afterPage);
                }
            }
            /** 添加最大页和尾页 */
            if (!currIsMax)$this.append(maxPage);
            $this.append(tailBtn);
            console.log($this.get(0).outerHTML);
        }
     /** 二 给各个li控件添加事件 */
     }
    /**
     * 方法名称:bindThisToOtherClick
     * 方法说明:当对象本身监听到enter等事件时触发目标对象的click等相应事件
     * @author:zhaoxinbo 2015-09-16 14:04
     * @param $targetObj
     */
    $.fn.enterPress = function ($targetObj) {
        var $this = $(this);
        $this.keypress(function (event) {
            //console.log("event.keyCode=="+event.keyCode);
            if (event.keyCode == 13) {
                //console.log("click");
                $targetObj.click();
            }
        });
    }
    //$.stateConvert = function(state){
    //    if(state=="OPENED"){
    //        return "购买";
    //    }else if(state=="SCHEDULED"){
    //        return "即将开始";
    //    }else if(state=="FINISHED"){
    //        return "已售罄";
    //    }else if(state=="CLEARED"){
    //        return "已兑付";
    //    }else if(state=="SETTLED"){
    //        return "已起息";
    //    }else if(state=="APPROVED"){
    //        return "已起息";
    //    }
    //}
    $.riskLevelConvert = function (level) {
        if (level == "LOW") {
            return "5";
        } else if (level == "LOW_MEDIUM") {
            return "4";
        } else if (level == "MEDIUM") {
            return "3";
        } else if (level == "MEDIUM_HIGH") {
            return "2";
        } else if (level == "HIGH") {
            return "1";
        }
    }
    /**
     * @Aboruo 2016-10-18 15:14
     * 风险级别文字说明变更:
     * 安逸型——>保守型
     保守型——>稳健型
     稳健型——>平衡型
     进取型——>成长型
     激进型——>进取型
     */
    $.riskLevelMap = {
        LOW: '保守型',
        LOW_MEDIUM: '稳健型',
        MEDIUM: '平衡型',
        MEDIUM_HIGH: '成长型',
        HIGH: '进取型'
    }
    $.getUrlParam = function () {
        var param = {};
        var href = location.href;
        var paramStr = href.substr(href.indexOf("?") + 1);
        if (paramStr) {
            var paramArray = paramStr.split("&");
            $(paramArray).each(function (index, keyValueStr) {
                var field = keyValueStr.split("=");
                param[field[0]] = field[1];
            });
            return param;
        } else {
            return null;
        }
    }
    /**
     * 方法描述：获取指定url中的参数
     * @author Aboruo
     * @param url
     * @returns {*}
     * @date 2015-11-27 17:16
     */
    $.getUrlParamFromUrl = function (url) {
        var param = {};
        var href = url;
        var paramStr = href.substr(href.indexOf("?") + 1);
        if (paramStr) {
            var paramArray = paramStr.split("&");
            $(paramArray).each(function (index, keyValueStr) {
                var field = keyValueStr.split("=");
                param[field[0]] = field[1];
            });
            return param;
        } else {
            return null;
        }
    }
    
    //千分位小数点补零 decimals = 0
    $.toThousandsWithPointZeros=function(number, decimals, dec_point, thousands_sep){
        /*
         * 参数说明：
         * number：要格式化的数字
         * decimals：保留几位小数
         * dec_point：小数点符号
         * thousands_sep：千分位符号
         * */
        decimals=decimals?decimals:0;
        dec_point=".";
        thousands_sep=",";

        number = (number + '').replace(/[^0-9+-Ee.]/g, '');
        var n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
            sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
            dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
            s = '',
            toFixedFix = function (n, prec) {
                var k = Math.pow(10, prec);
                return '' + Math.ceil(n * k) / k;
            };

        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
        var re = /(-?\d+)(\d{3})/;
        while (re.test(s[0])) {
            s[0] = s[0].replace(re, "$1" + sep + "$2");
        }

        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    }
    /**
     * 方法描述:获取后台验证码
     * @returns {string}
     * 返回验证码数据流
     * @author:zhaoxinbo
     * @date 2015-09-14 14:54
     */
    $.getCheckCode = function () {
        var param = {};
        var retValue = {};
        param.v = (new Date).valueOf();
        $.ajax({
            type: 'get',
            url: '/api/v2/register/captcha',
            data: param,
            dataType: 'json',
            async: false,
            success: function (results) {
                /** 获取图片验证码图片数据流数据 */
                retValue = results;
            },
            error: function (error) {
                console.log('request is error!....');
            }
        });
        return retValue;
    }

    /**
     * 方法描述:获取后台验证码新接口
     * @returns {string}
     * 返回验证码数据流
     * @author:zuxuefeng
     * @date 2015-09-14 14:54
     */
    $.getCheckCodeNewVersion = function () {
        var param = {};
        var retValue = {};
        param.v = (new Date).valueOf();
        $.ajax({
            type: 'get',
            url: '/api/v2/users/getCode',
            dataType: 'text',
            async: false,
            success: function (results) {
                /** 获取图片验证码图片数据流数据 */
                retValue = results;
            },
            error: function (error) {
                console.log('request is error!....');
            }
        });
        return retValue;
    }
    //手机号中间四位显示****
    $.mobileDis = function (mobile) {
        var mobileStr = mobile + "";
        if(mobileStr=="13800138000"){//若没有手机号后台会默认写死这个手机号
        	return ;
        }
        if (!isNaN(mobile) && mobileStr.length == 11) {
            var preMobile = mobileStr.substr(0, 3)
            var tailMobile = mobileStr.substr(mobile.length - 4);
            mobileStr = preMobile + "****" + tailMobile;
            return mobileStr;
        } else {
            return;
        }
    }
    //获取用户信息
    //$.getUserInfo = function () {
    //    $.ajax({
    //        type: "get",
    //        url: "",
    //
    //    });
    //}
    //获取html页面内容文本
    $.getHtml = function (path) {
        var html = "";
        $.ajax({
            url: path,
            async: false,
            dataType:'html',
            success: function (data) {
                html = data;
            }
        });
        //$.get(path).success(function(data){
        //    html=data;
        //});
        return html;
    }
    $.cookieExpires = function () {
        var date = new Date();
        date.setTime(date.getTime() + (10 * 60 * 1000));
        return date;
    }
    //系统退出方法
    $.exitSys = function () {
        $.cookie("user", "", {path: "/", expires: -1});
        $.cookie("ccat", "", {path: "/", expires: -1});
        location.href = "/view/account/login.html";
        //location.href = "/cas/logout?service="+window.location.protocol+"%2F%2F"+window.location.host;
    }
    //判断是否登陆
    $.isLogin = function () {
        var loginToken =$.cookie("user"); 
        
       /*  if ((loginToken) && (loginToken != 'undefined') && (JSON.parse(loginToken).mobile != 'undefined') && (JSON.parse(loginToken).token != 'undefined') && (JSON.parse(loginToken).userId != 'undefined')){
            return true;
        } else {
            return false;
        }*/
        
        
        if (  !$.isNullOrBlank(loginToken) && !$.isNullOrBlank(JSON.parse(loginToken))  ){
           var data = JSON.parse(loginToken);
           if(data.hasOwnProperty("mobile") && data.hasOwnProperty("token") && data.hasOwnProperty("userId")){
           	 return true;
           }else{
           	 return false;
           }
          
        } else {
            return false;
        }
    }
    //初始化用户信息
    $.initCookie = function (data) {
    	//先清空下
    	$.cookie("user", "", {path: "/", expires: -1});
        $.cookie("ccat", "", {path: "/", expires: -1});
    	$.cookie("userId", "", {path: "/", expires: -1});
    	
        var date = $.cookieExpires();
        $.cookie("ccat", data.access_token, {path: "/", expires: date});
        $.cookie("user",data, {path: "/", expires: date});
        $.cookie("userId",data.userId, {path: "/", expires: date});
        //保存tgt用于自动登录
        //window.localStorage.setItem("tgt",  JSON.parse($.cookie('user')).ticketGrantTicket);
    }
    //刷新cookie
    $.refreshCookie = function () {
        if ($.cookie("ccat") && $.cookie("ccat") != 'undefined') {
            var date = $.cookieExpires();
            $.cookie("user", $.cookie("user"), {
                path: "/"
                , expires: date
            });
            $.cookie("ccat", $.cookie("ccat"), {
                path: "/"
                , expires: date
            });
        }
    }
    
    $.mobileFilter=function () {
    	/*var user = $.cookie("user");
    	alert(user);
    	if(user!=null&&user.mobile!=null&&user.mobile=="13800138000"&&!(location.href.indexOf('changePhoneCard')>-1){
    		//location.href="/view/account/account.html?currentPage=changePhoneCard&noMobile=true";
    	}
    	
    	var user = $.getUser();
    	if(user.mobile=="13800138000" && !(location.href.indexOf('changePhoneCard')>-1) ){
    		location.href="/view/account/account.html?currentPage=changePhoneCard&noMobile=true";
    	}*/
    }
    //身份证打***** 证件号码
    $.disIdNo = function (idNo) {
        //var subIdNo = idNo.substr(3, idNo.length - 6);
        var preIdNo = idNo.substr(0, 3);
        var tailIdNo = idNo.substr(idNo.length - 3);
        //return idNo.replace(subIdNo, "*****");
        return preIdNo + "*****" + tailIdNo;
    }
    /** 用户名字，首字母打* */
    $.disFirstNameChar = function(userName){
        userName = userName.substr(1);
        return '*' + userName;
    }
    //银行卡打*****
    $.disCard = function (card) {
        var preCard = card.substr(0, 4);
        var tailCard = card.substr(card.length - 4);
        return preCard + "****" + tailCard;
    }
    /**
     * 方法名称:date.prototype.format
     * 方法描述:由long型日期转化为制定格式的日期
     * @author:zhaoxinbo
     * @date 2015-09-20 17:00
     */
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时
            "H+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        var week = {
            "0": "\u65e5",
            "1": "\u4e00",
            "2": "\u4e8c",
            "3": "\u4e09",
            "4": "\u56db",
            "5": "\u4e94",
            "6": "\u516d"
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[this.getDay() + ""]);
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }
    $.getRecommendData = function(size,subType){
    	var user=$.cookie("user");
        if(user){
        	user = eval('(' + user + ')'); //从cookie获取
    	}else{
    		user = $.getUser();//从后台取
    	}
        var retData;
        var isNewUser = false;
        if($.isGreenhand(user.id)){//福袋产品查询 新用户专享
        	isNewUser = false;
        }
        var param = {
            currentPage: 1,
            pageSize: size,
            status: 'SCHEDULED',
            minDuration: 0,
            maxDuration: 100,
            minAmount: 1,
            maxAmount: 100000000,
            minRate: 0,
            maxRate: 100,
            orderBy: 'timeOpen',
            productRiskLevel: "LOW",
            productRiskLevel: "LOW_MEDIUM",
            productRiskLevel: "MEDIUM",
            productRiskLevel: "MEDIUM_HIGH",
            productRiskLevel: "HIGH",
            secondProduct:subType
        };
        //没有登陆或者登陆后没有客户经理的只能看到银行类理财产品---不再是此逻辑
        //if(!$.isLogin()||($.isLogin()&& !$.getInviter($.getUser().id))){
        //    param.product = "BANK";
        //}

        $.ajax({
            type: "get",
            url: "/api/v2/loans/getLoanWithPage",
            data: param,
            dataType: "json",
            async:false,
            success: function (data) {
                retData = data.results;
            },
            error: function () {
                console.log("获取推荐产品信息失败！！");
            }
        });
        return retData;
    }
    $.fn.getRecommend = function (subType) {
        $this = $(this);

        var results = $.getRecommendData(3,subType);
        //console.log("results=="+JSON.stringify(results));
        if (results.length > 0) {
            var listContainer = $this;
            listContainer.children().remove();
            var rowDiv = $("<div class='row'></div>");
            //清空内容
            $.each(results, function (index, bean) {
                var duration = bean.loanRequest.duration;
                var term = 0;
                var unit = "天";
                if (duration.totalDays) {
                    term = duration.totalDays;
                }
                //else if (duration.totalMonths) {
                //    term = duration.totalMonths;
                //    unit = "个月";
                //}
                var percent = Math.floor((bean.amount - bean.balance) / bean.amount * 100);
                var minAmount = bean.loanRequest.investRule.minAmount;
                var minAmountUnit = "元";
                if (minAmount / 10000 > 1) {
                    minAmount = Math.round(minAmount / 10000, 2);
                    minAmountUnit = "万元";
                }
                //console.log("bean.title=="+bean.title+";percent=="+percent);
                tdInner = '<span class="date"><span class="how">' + term + '</span>' + unit + '</span>';
                var content = '<div class="col-xs-12 col-sm-12 col-md-6 col-lg-4">' +
                    '<div class="item align-left">' +
                    '<div class="item-title text-center">' +
                    '<h4><a style="color:#ffffff" href="javascript:void(0);" title="'+bean.title+'" onclick="$.viewProduct(\''+bean.id+'\',\''+bean.loanRequest.productKey+'\',null,null,\''+bean.title+'\')">' + $.limitDis(bean.title) + '</a></h4>' +
                    '<h1>' + bean.rate / 100 + '%</h1>' +
                    '<h6>历史参考年化收益率</h6>' +
                    '</div>' +
                    '<div class="item-body">' +
                    '<div class="text-center col-xs-6">' +
                    '<h5>起投金额</h5>' +
                    '<h3>' + minAmount + '<span>' + minAmountUnit + '</span></h3>' +
                    '</div>' +
                    '<div class="text-left col-xs-6">' +
                    '<h5>投资期限</h5>' +
                    '<h3>' + term + '<span>' + unit + '</span></h3>' +
                    '</div>' +
                    '</div>' +
                    '<div class="item-foot text-center">' +
                    '<div class="item-progress">' +
                    '<h5>项目进度</h5>' +
                    '<div class="progress">' +
                    '<div class="progress-bar" role="progressbar" aria-valuenow="' + percent + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + percent + '%;"></div>' +
                    '</div>' +
                    '<div class="progress-num">' + percent + '%' +
                    '</div>' +
                    '</div>' +
                    '<a href="javascript:void(0);"  onclick="$.viewProduct(\''+bean.id+'\',\''+bean.loanRequest.productKey+'\',null,null,\''+bean.title+'\')" class="btn-buy">' + $.operation[bean.status] + '</a>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                rowDiv.append(content);
            });
            listContainer.append(rowDiv);
        }

    }
    /*var ErrorMsg = {
     PASSWORD_NULL: '请填写密码,不能为空字符',
     PASSWORD_LENGTH: '请填写至少 6 位密码，不能包含空字符',
     PASSWORD_AGAIN_NULL: '请填写密码确认',
     PASSWORD_AGAIN_INVALID: '两次输入的密码不一致',
     REPASSWORD_NULL: '请填写密码确认',
     REPASSWORD_INVALID: '两次输入的密码不一致',
     MOBILE_USED: '手机号码已被使用',
     MOBILE_CAPTCHA_NULL: '请填写手机短信验证码',
     MOBILE_CAPTCHA_INVALID: '验证码无效或已过期，请尝试重新发送',
     MOBILE_CAPTCHA_EXPIRED: '验证码过期，请尝试重新发送',
     AGREEMENT_NULL: '注册需先同意服务条款',
     CAPTCHA_NULL: '请填写验证码',
     CAPTCHA_INVALID: '验证码不正确',
     MOBILE_NULL: '请填写手机号码',
     MOBILE_INVALID: '请输入正确的手机号',
     LOGINNAME_EXISTS: '用户名已存在',
     LOGINNAME_STRICT: '2至15位中英文字符、数字或下划线',
     LOGINNAME_NULL: '请填写用户名',
     LOGINNAME_INVALID: '2至15位中英文字符、数字或下划线',
     LOGINNAME_SIZE: '2至15位中英文字符、数字或下划线',
     LOGINNAME_NOT_MOBILE: '用户名不能是手机号（注册后可以用手机号登录）',
     NAME_NULL: '请填写真实姓名',
     NAME_INVALID: '真实姓名错误，应为2-15位中文汉字',
     EMAIL_NULL: '请填写电子邮箱',
     EMAIL_INVALID: '请输入正确的邮箱',
     IDNUMBER_INVALID: '请正确填写 18 位身份证号码',
     LOGIN_INVALID: '用户名或密码错误',
     INVALID_CAPTCHA: '验证码错误',
     LOGINNAME_NOT_MATCH: '手机号码与登录名不匹配',
     INVITATION_INVALID: 'H码无效',
     INVITATION_NULL: 'H码为空',
     PAYMENT_ACCOUNT_CREATE_ERROR: '国政通实名认证校验未通过',
     SMSCAPTCHA_INVALID: '验证码为6位',
     SMSCAPTCHA_NULL: '验证码不能为空'
     };*/
    $.ErrorMsg = {
        MOBILE_USED: '手机号码已被使用',
        LOGINNAME_EXISTS: '用户名已经存在',
        INVALID_CAPTCHA: '图片验证码输入错误,请重新填写图片验证码',
        MOBILE_SMS_CAPTCHA_ALREADY_SEND: '短信验证码已经发送至您的手机',
        LOGINNAME_INVALID: '2至30位中英文字符、数字或下划线',
        USERCENTER_CONNECT_ERROR: '用户中心连接异常',
        MOBILE_CAPTCHA_INVALID:'手机动态码无效'
    };

    $.percent = function () {
        $('.easy-pie-chart.percentage').each(function () {
            var barColor = $(this).data('color') || (!$box.hasClass('infobox-dark') ? $box.css('color') : 'rgba(255,255,255,0.95)');
            var trackColor = barColor == 'rgba(255,255,255,0.95)' ? 'rgba(255,255,255,0.25)' : '#E2E2E2';
            var size = parseInt($(this).data('size')) || 40;
            $(this).easyPieChart({
                barColor: barColor,
                trackColor: trackColor,
                scaleColor: false,
                lineCap: 'butt',
                lineWidth: parseInt(size / 10),
                animate: /msie\s*(8|7|6)/.test(navigator.userAgent.toLowerCase()) ? false : 1000,
                size: size
            });
        });
    }
    //获取最新公告数据
    $.getNotice = function (size,page) {
        var noticeData = {};
        var url;
        if(size!=undefined){
            url=encodeURI("/api/v2/cms/category/PUBLICATION/name/新闻公告/紧急公告?pageSize="+size+"");
        }else{
            url=encodeURI("/api/v2/cms/category/PUBLICATION/name/新闻公告/紧急公告");
        }
        $.ajax({
            type: "get",
            url:url ,
            async: false,
            data: {"page":page},
            dataType: "json",
            success: function (data) {
                noticeData = data;
                //console.log("最新公告data=="+JSON.stringify(data));
            },
            error:function(){
                console.log("请求最新公告数据失败");
            }
        });
        return noticeData;
    }

    //获取最新公告数据首页使用
    $.getNoticeForIndex = function (size) {
        var noticeData = {};
        var url;
        if(size!=undefined){
            url=encodeURI("/api/v2/cms/category/PUBLICATION/name/新闻公告/紧急公告?pageSize="+size+"");
        }else{
            url=encodeURI("/api/v2/cms/category/PUBLICATION/name/新闻公告/紧急公告");
        }
        $.ajax({
            type: "get",
            url:url ,
            data: {},
            dataType: "json",
            success: function (data) {
                noticeData = data.results;
                if(!$.isEmptyObject(noticeData)){
                    $.each(noticeData,function(index,bean){
                        var temp = bean.title;
                        if (temp.length > 21)
                        {
                            temp = (temp.substr(0,20))+"...";
                        }
                        var li='';
                        if(index>0){
                            li = '<li><span class="margin-right-10">'+bean.channeName+'</span><a href="/view/about/details.html?type=notice&id='+bean.id+'">'+temp+'</a><span class="date">'+moment(bean.pubDate).format("YYYY-MM-DD")+'</span></li>';
                        }else{
                            li = '<li><span class="margin-right-10 font-red"">'+bean.channeName+'</span><a href="/view/about/details.html?type=notice&id='+bean.id+'">'+temp+'</a><span class="date">'+moment(bean.pubDate).format("YYYY-MM-DD")+'</span></li>';
                        }

                        var newsContainer = $("#publication");
                        newsContainer.append(li);
                    });
                }
            },
            error:function(){
                console.log("请求最新公告数据失败");
            }
        });
    }
    //获取紧急通告数据
    $.getUrgentNotice = function (size) {
        var urgentNoticeData = {};
        var url;
        if(size!=undefined){
            url=encodeURI("/api/v2/cms/category/PUBLICATION/name/紧急公告?pageSize="+size+"");
        }else{
            url=encodeURI("/api/v2/cms/category/PUBLICATION/name/紧急公告");
        }
        $.ajax({
            type: "get",
            url: url,
            async: false,
            data: {},
            dataType: "json",
            success: function (data) {
                urgentNoticeData = data;
                //console.log("最新公告data=="+JSON.stringify(data));
            },
            error:function(){
                console.log("请求紧急公告数据失败");
            }
        });
        return urgentNoticeData;
    }
    //获取紧急通告数据首页
    $.getUrgentNoticeForIndex = function (size) {
        var urgentNoticeData = {};
        var url;
        if(size!=undefined){
            url=encodeURI("/api/v2/cms/category/PUBLICATION/name/紧急公告?pageSize="+size+"");
        }else{
            url=encodeURI("/api/v2/cms/category/PUBLICATION/name/紧急公告");
        }
        $.ajax({
            type: "get",
            url: url,
            data: {},
            dataType: "json",
            success: function (data) {
                urgentNoticeData = data.results;
                //console.log("最新公告data=="+JSON.stringify(data));
                if(!$.isEmptyObject(urgentNoticeData)&&urgentNoticeData.length>0){
                    $("#h-notice").html('<a href="/view/about/details.html?type=urgentNotice&id='+urgentNoticeData[0].id+'">'+urgentNoticeData[0].title+'</a>');
                }
            },
            error:function(){
                console.log("请求紧急公告数据失败");
            }
        });
    }
    //获取研究报告数据
    $.getRes = function (size,page) {
        var reportData = {};
        var url;
        if(size!=undefined){
            url=encodeURI("/api/v2/cms/category/PUBLICATION/name/研究报告?pageSize="+size+"");
        }else{
            url=encodeURI("/api/v2/cms/category/PUBLICATION/name/研究报告");
        }
        $.ajax({
            type: "get",
            url: url,
            async: false,
            data: {"page":page},
            dataType: "json",
            success: function (data) {
                reportData = data;
                /*console.log("媒体报道data=="+JSON.stringify(data));*/
            },
            error:function(){
                console.log("请求研究报告数据失败");
            }
        });
        return reportData;
    }
    //获取媒体报道数据
    $.getReport = function (size,page) {
        var reportData = {};
        var url;
        if(size!=undefined){
            url=encodeURI("/api/v2/cms/category/COVERAGE/name/媒体报道?pageSize="+size+"");
        }else{
            url=encodeURI("/api/v2/cms/category/COVERAGE/name/媒体报道");
        }
        $.ajax({
            type: "get",
            url: url,
            async: false,
            data: {"page":page},
            dataType: "json",
            success: function (data) {
                reportData = data;
                /*console.log("媒体报道data=="+JSON.stringify(data));*/
            },
            error:function(){
                console.log("请求媒体报道数据失败");
            }
        });
        return reportData;
    }
    //获取媒体报道数据首页
    $.getReportForIndex = function (size) {
        var reportData = {};
        var url;
        if(size!=undefined){
            url=encodeURI("/api/v2/cms/category/COVERAGE/name/媒体报道?pageSize="+size+"");
        }else{
            url=encodeURI("/api/v2/cms/category/COVERAGE/name/媒体报道");
        }
        $.ajax({
            type: "get",
            url: url,
            data: {},
            dataType: "json",
            success: function (data) {
                reportData = data.results;
                /*console.log("媒体报道data=="+JSON.stringify(data));*/
                if(!$.isEmptyObject(reportData)&&reportData.length>0){
                    $.each(reportData,function(index,bean){
                        var temp = bean.title;
                        if (temp.length > 21)
                        {
                            temp = (temp.substr(0,20))+"...";
                        }
                        var li='';
                        if(index>0){
                            li = '<li><span class="margin-right-10">媒体报道</span><a href="/view/about/details.html?type=report&id='+bean.id+'">'+temp+'</a><span class="date">'+moment(bean.pubDate).format("YYYY-MM-DD")+'</span></li>';
                        }else{
                            li = '<li><span class="margin-right-10 font-red">媒体报道</span><a href="/view/about/details.html?type=report&id='+bean.id+'">'+temp+'</a><span class="date">'+moment(bean.pubDate).format("YYYY-MM-DD")+'</span></li>';
                        }

                        var reportContainer = $("#coverage");
                        reportContainer.append(li);
                    });
                }
            },
            error:function(){
                console.log("请求媒体报道数据失败");
            }
        });
        return reportData;
    }
    //获取用户资产
    $.getUserFund = function () {
        var fundData = {};
        var user=$.cookie("user");
        if(user){
        	user = eval('(' + user + ')'); //从cookie获取
    	}else{
    		user = $.getUser();//从后台取
    	}
        $.ajax({
            type: "get",
            url: "/api/v2/user/" + user.id + "/userfund?access_token=" + $.cookie("ccat"),
            async: false,
            data: {},
            dataType: "json",
            success: function (data) {
                fundData = data;
            },
            error: function () {
                console.log("获取个人资产信息失败！！");
            }
        });
        return fundData;
    }
    //输入为数字
    $.isNumber = function (number) {
        return /^[0-9]*$/.test(number);
    }
    //手机号格式判断
    $.isMobile = function (mobile) {
        return $.isChinaMobile(mobile)|| $.isChinaTelecom(mobile)|| $.isChinaUnicome(mobile);
    }
    //移动手机号判断
    $.isChinaMobile = function(mobile){
        return /^\+?(\(?0{0,2}(86)?\)?)1((((3[5-9])|(47)|(5[0-2])|(5[7-9])|(78)|(8[2-4])|(8[7-8]))\d{8})|((34[0-8]|70[356])\d{7}))$/.test(mobile);
    }
    //电信手机号判断
    $.isChinaTelecom = function(mobile){
        return /^\+?(\(?0{0,2}(86)?\)?)1((33[0-9])|(349)|(53[0-9])|(77[0-9])|(700)|(80[0-9])|(89[0-9])|(81[0-9]))\d{7}$/.test(mobile);
    }
    //联通手机号判断
    $.isChinaUnicome = function(mobile){
        return /^\+?(\(?0{0,2}(86)?\)?)1((((3[0-2])|(5[5-6])|(76)|(8[5-6])|(45))\d{8})|(70[789]\d{7}))$/.test(mobile);
    }
    //密码格式判断
    $.isPassword = function (password) {
        //return /[a-zA-Z]+(?=[0-9]+)|[0-9]+(?=[a-zA-Z]+)/g.test(mobile);
        //return /[a-zA-Z]+(?=[0-9]+)|[0-9]+(?=[a-zA-Z]+)/g.test(mobile);
        //return /^[a-zA-Z]+\d+[a-zA-Z0-9]*$|^\d+[a-zA-Z]+[a-zA-Z0-9]*$/g.test(password);
        return /(?:^[a-zA-Z]+\d+|^\d+[a-zA-Z]+)[a-zA-Z0-9]*$/g.test(password);
    }
    //判断邮箱格式是否正确
    $.isEmail = function (email) {
        return /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email);
    }
    //注册用户名格式判断
    $.isUserName = function (userName) {
        /** 用户名须为4-20个字符（数字、字母、下划线），首字母必须为字母*/
        return /^[a-zA-Z][a-zA-Z0-9_]*$/g.test(userName);
    }
    $.checkInviter = function(managerId){
        var result = {};
        $.ajax({
            url:'/api/v2/users/check/empReferral',
            type:'post',
            async:false,
            data:{empReferral:managerId},
            success:function(data){
                result = data;
            },
            error:function(){
                console.log("检查客户经理号出错");
            }
        });
        return result;
    }
    /**
     * 方法名称:getAllCertificateInfo
     * 方法描述:获取所有认证信息
     * @author zhaoxinbo
     * @date 2015-09-25 20:47
     */
    $.getAllCertificateInfo = function () {
        var retValue = null;
        var userInfo = JSON.parse($.cookie('user'));
        var url = '/api/v2/users/getVerificationInfo/' + userInfo.id;

        $.ajax({
            type: 'get',
            url: url,
            async: false,
            dataType: 'json',
            success: function (results) {
                if (results.success) {
                    retValue = results.data;
                } else {
                    /** 失败提示返回信息 */
                    if (results.error.length > 0) {
                        var errorInfo = results.error[0];
                        if (errorInfo.message) $.alert(errorInfo.message);
                    }
                }
            },
            error: function (error) {
                console.log('获取邮箱微信等认证信息出现错误');
            }
        });
        return retValue;
    }
    $.bank = {
        BOC: {name: '中国银行', classNo: 2},
        CCB: {name: '中国建设银行', classNo: 3},
        BOCOM: {name: '交通银行', classNo: 9},
        ABC: {name: '中国农业银行', classNo: 1},
        CMB: {name: '招商银行', classNo: 7},
        PSBC: {name: '邮政储蓄银行', classNo: 14},
        CMBC: {name: '中国民生银行', classNo: 8},
        SPDB: {name: '浦东发展银行', classNo: 16},
        BOS: {name: '上海银行', classNo: 17},
        CIB: {name: '兴业银行', classNo: 5},
        GDB: {name: '广发银行', classNo: 10},
        CITIC: {name: '中信银行', classNo: 6},
        CEB: {name: '中国光大银行', classNo: 4},
        HXB: {name: '华夏银行', classNo: 11},
        PINGAN: {name: '平安银行', classNo: 15},
        ICBC: {name: '中国工商银行', classNo: 12}
    }
    $.operation = {
        OPENED: "购买",
        SCHEDULED: "即将开始",
        FINISHED: "已售罄",//已售罄
        CLEARED: "已兑付",
        SETTLED: "已起息",//已起息
        FAILED:"已流标"
    }
    $.alert = function () {
        var message = arguments[0] || '提示信息';
        var title = arguments[1] || '中民超级会员';
        var method = arguments[2] || function () {
            };
        var modal = '<div class="modal fade bs-example-modal-lg" tabindex="-1" id="myBootstrapModalAlert" role="dialog" aria-labelledby="myModalLabel">' +
            '<div class="modal-dialog modal-lg" style="width:90%;margin:100px auto;" >' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close" ><span aria-hidden="true">&times;</span></button>' +
            '<h4 class="modal-title" id="myModalLabel">' + title + '</h4>' +
            '</div>' +
            '<div class="modal-body" style="overflow-y:auto;font-family: Helvetica Neue,Helvetica,Arial,sans-serif;font-size: 14px;color:#4b4b4b">' + message +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-primary button-caution" data-dismiss="modal" id="modal-ok">确定</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        if ($("#myBootstrapModalAlert").length > 0) {
            $("#myBootstrapModalAlert").remove();
        }
        $('body').append(modal);
        //按钮事件回调
        $('#myBootstrapModalAlert').on('hidden.bs.modal', function () {
            method();
            $("#myBootstrapModalAlert").remove();
            $("body").css("padding-right","0px");
        });
        $("#myBootstrapModalAlert").modal({backdrop: false, keyboard: false});
        //$.jBox.alert(message,title,{closed:method});
    }

    /**
     * 方法名称:phoneAlert
     * 方法描述:移动端跳转时提示信息浮层方法
     * @author zhaoxinbo
     */
    $.phoneAlert = function () {
        var message = arguments[0] || '提示信息';
        var title = arguments[1] || '安金普惠';
        var method = arguments[2] || function () {
            };
        var modal = '<div class="modal fade bs-example-modal-lg" tabindex="-1" id="myBootstrapModalAlert" role="dialog" aria-labelledby="myModalLabel">' +
            '<div class="modal-dialog modal-lg" style="width:90%;margin:100px auto;" >' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close" ><span aria-hidden="true">&times;</span></button>' +
            '<h4 class="modal-title" id="myModalLabel">' + title + '</h4>' +
            '</div>' +
            '<div class="modal-body" style="overflow-y:auto;font-family: Helvetica Neue,Helvetica,Arial,sans-serif;font-size: 14px;color:#4b4b4b">' + message +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-primary button-caution" data-dismiss="modal" >确定</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        if ($("#myBootstrapModalAlert").length > 0) {
            $("#myBootstrapModalAlert").remove();
        }
        $('body').append(modal);
        //按钮事件回调
        $('#myBootstrapModalAlert').on('hidden.bs.modal', function () {
            method();
            $("#myBootstrapModalAlert").remove();
        });
        $("#myBootstrapModalAlert").modal({backdrop: false, keyboard: false});
        //$.jBox.alert(message,title,{closed:method});
    }
    /**
     * 方法名称:jumpInfo
     * 方法描述:跳转时提示信息浮层方法
     * @author zhaoxinbo
     * @param paramTrans{
     *  message:'10秒后页面将跳转至[我的账户]',
        ur:'/view/account/account.html',
        second:10,
        urlName:'我的账户'
     * }
     */
    $.jumpInfo = function (paramTrans) {
        /** 参数处理 */
        var paramDefault = {
            title: '注册成功',
            message: '秒后页面将跳转至[我的账户]',
            url: '/view/account/account.html',
            second: 10,
            urlName: '我的账户'
        }
        var param = $.extend(paramDefault, paramTrans);

        /** 定义提示信息浮层并进行展示 */
        var modal = '<div class="modal fade bs-example-modal-lg" tabindex="-1" id="myBootstrapModalJumpInfo" role="dialog" aria-labelledby="myModalLabel">' +
            '<div class="modal-dialog modal-lg" style="width:90%;height:20%;margin:200px auto;" >' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<h4 class="modal-title" style="text-align: center;color: dodgerblue;" id="myModalLabel">' + param.title + '</h4>' +
            '</div>' +
            '<div class="modal-body" style="height: 100px;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;font-size: 16px;vertical-align:middle;text-align:center;color: dodgerblue;padding-top: 33px;">' +
            '<div>' +
            '<span id="modal-content-Div" style="color: rgb(244,83,39)">{{' + second + '}}</span>' +
            '<span>' + param.message + '&nbsp;&nbsp;&nbsp;&nbsp;' + '</span>' + '<a style="color:#FF0000;text-decoration:underline;" href="' + param.url + '">直接跳转</a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        /** 查看modal是否存在若存在则删除 */
        if ($('#myBootstrapModalJumpInfo').length > 0) $('#myBootstrapModalJumpInfo').remove();
        $('body').append(modal);

        /** 设置倒计时页面跳转 */
        var $modal_content_Div = $('#modal-content-Div');
        var second = param.second;
        //var second = 10;
        $modal_content_Div.html(second);
        var ractive = new Ractive({
            el:'#modal-content-Div',
            template:$('#modal-content-Div').html(),
            data:{
                second:param.second
            }
        });
        var codeInterval = setInterval(function () {
            second = second - 1;
            $modal_content_Div.html(second);
            ractive.set({second: second});
            if (second < 0) {//结束
                clearInterval(codeInterval);
                ractive.set({second: param.second});
                location.href = param.url;
                $('#myBootstrapModalJumpInfo').remove();
            }
        }, 1000);

        $("#myBootstrapModalJumpInfo").modal({backdrop: false, keyboard: false});
    }
    $.loading = function () {
        //var message = arguments[0]||'正在加载...';
        //$.jBox.tip(message,'loading');
        var modal = '<div class="modal fade bs-example-modal-lg"  tabindex="-1" id="myBootstrapModalLoading" role="dialog" aria-labelledby="myModalLabel">' +
            '<div style="margin:240px auto;width:50px;height:50px;background: url(/img/timg.gif);-webkit-background-size: 100% 100%;background-size: 100% 100%;"></div>' +
            '</div>';
        if (!$("#myBootstrapModalLoading").length) {
            $('body').append(modal);
        }
        $("#myBootstrapModalLoading").modal({backdrop: false, keyboard: false});
    }
    $.unloading = function () {
        //$.jBox.closeTip();
        $("#myBootstrapModalLoading").modal("hide");
    }
    $.confirm = function () {
        var settings = {message:"确定执行此操作吗？",
            title:"安金普惠",
            method: function (v) {},
            okname:"确定",
            cancelname:"取消"};
        var argLength = arguments.length;
        if(argLength==1&& $.isPlainObject(arguments[0])){//1个参数并且是纯粹对象
            settings = $.extend(settings,arguments[0]);
        }else{
            if(arguments[0]){
                settings.message= arguments[0];
            }
            if(arguments[1]){
                settings.title= arguments[1];
            }
            if(arguments[2]){
                settings.method= arguments[2];
            }
            if(arguments[3]){
                settings.cancelname= arguments[3];
            }
            if(arguments[4]){
                settings.okname= arguments[4];
            }
        }
        var modal = '<div class="modal fade bs-example-modal-lg" tabindex="-1" id="myBootstrapModalConfirm" role="dialog" aria-labelledby="myModalLabel">' +
            '<div class="modal-dialog modal-lg" style="width:90%;margin:100px auto;" >' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close" id="btn-close"><span aria-hidden="true">&times;</span></button>' +
            '<h4 class="modal-title" id="myModalLabel">' + settings.title + '</h4>' +
            '</div>' +
            '<div class="modal-body" style="overflow-y:auto;font-family: Helvetica Neue,Helvetica,Arial,sans-serif;font-size: 14px;">' + settings.message +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-default" data-dismiss="modal" id="btn-cancel" name="btn-cancel">'+settings.cancelname+'</button>' +
            '<button type="button" class="btn btn-primary button-caution" data-dismiss="modal" id="btn-agree" >'+settings.okname+'</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        if ($("#myBootstrapModalConfirm").length > 0) {
            $("#myBootstrapModalConfirm").remove();
        }
        $('body').append(modal);
        //按钮事件回调

        $('#myBootstrapModalConfirm').click(function (event) {
            var ok = $(this).find("#btn-agree");
            var cancel = $(this).find("#btn-cancel");
            var close = $(this).find("#btn-close");
            var target = $(event.target);
            if (target.is(ok)) {
                settings.method("ok");
            } else if (target.is(cancel)) {
                settings.method("cancel");
            } else if (target.is(close)) {
                settings.method("close");
            }
            //console.log(event.target);
        });
        $("#myBootstrapModalConfirm").modal({backdrop: false, keyboard: false});
        $('#myBootstrapModalConfirm').on("hidden.bs.modal", function () {
            $("#myBootstrapModalConfirm").remove();
        });
        //$.jBox.confirm(message,title,method);
    }
    $.validateId = function (code) {
        //function IdentityCodeValid(code) {
        var city = {
            11: "北京",
            12: "天津",
            13: "河北",
            14: "山西",
            15: "内蒙古",
            21: "辽宁",
            22: "吉林",
            23: "黑龙江 ",
            31: "上海",
            32: "江苏",
            33: "浙江",
            34: "安徽",
            35: "福建",
            36: "江西",
            37: "山东",
            41: "河南",
            42: "湖北 ",
            43: "湖南",
            44: "广东",
            45: "广西",
            46: "海南",
            50: "重庆",
            51: "四川",
            52: "贵州",
            53: "云南",
            54: "西藏 ",
            61: "陕西",
            62: "甘肃",
            63: "青海",
            64: "宁夏",
            65: "新疆",
            71: "台湾",
            81: "香港",
            82: "澳门",
            91: "国外 "
        };
        var tip = "";
        var pass = true;

        //if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
        if (!code || !/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/i.test(code)){
            tip = "身份证号格式错误";
            pass = false;
        }

        else if (!city[code.substr(0, 2)]) {
            tip = "地址编码错误";
            pass = false;
        }
        else {
            //18位身份证需要验证最后一位校验位
            if (code.length == 18) {
                code = code.split('');
                //∑(ai×Wi)(mod 11)
                //加权因子
                var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
                //校验位
                var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
                var sum = 0;
                var ai = 0;
                var wi = 0;
                for (var i = 0; i < 17; i++) {
                    ai = code[i];
                    wi = factor[i];
                    sum += ai * wi;
                }
                var last = parity[sum % 11];
                if (parity[sum % 11] != code[17]) {
                    tip = "校验位错误";
                    pass = false;
                }
            }
        }
        //if(!pass) alert(tip);
        return pass;
        //}
        //var c = '130981199312253466';
        //var res= IdentityCodeValid(c);
    }
    $.isTaibaozheng = function(taibaozheng){
        return /(\d{10}\(B\))|(\d{8})/.test(taibaozheng);
    }
    $.isHRP = function(HRP){
        return /[M,H]\d{10}/.test(HRP);
    }
    $.getUser = function () {
        if ($.isLogin()) {
            var user = $.cookie('user');
            user = JSON.parse(user);
            access_token = user.token;
            userId=user.userId;
            //http://120.132.84.189/api/v2/user/MYSELF/userinfo
                $.ajax({
                    url: '/api/user/accountInfo/basicInfo.do',
                    data: {
                        userId:userId,
                        access_token:access_token
                    },
                    dataType: 'json',
                    async:false,
                    type: 'post',
                    success: function (data) {
                        userInfo = data.data;
                        //更新cookie里的信息
                        if ($.cookie("ccat") && $.cookie("ccat") != 'undefined') {
                            var date = $.cookieExpires();
                            $.cookie("user", JSON.stringify(data.data), {
                                path: "/"
                                , expires: date
                            });
                            $.cookie("ccat", $.cookie("ccat"), {
                                path: "/"
                                , expires: date
                            });
                        }
                    },
                    error:function(error){
                    	console.log(JSON.stringify(error));
                    	if(error.status==401){//清一下
                    		$.cookie("user", "", {path: "/", expires: -1});
                            $.cookie("ccat", "", {path: "/", expires: -1});
                    	}
                    }
                });
            return userInfo||null;
        } else {
            //$.alert("登陆已失效请重新登陆", null, function () {
            $.goLogin();
                //location.href = "/view/login/login.html";
            //});
        }
    }
    //$.initSmsBtn = function(){
    //    var btnsmg = $(".btn-smg");
    //    var menu = btnsmg.next("ul");
    //    //短信验证码按钮浮动下拉效果
    //    btnsmg.parent().mouseover(function(){
    //        if(!menu.is(":visible")){
    //            btnsmg.click();
    //        }
    //    }).mouseout(function(){
    //        if(menu.is(":visible")){
    //            btnsmg.click();
    //        }
    //    });
    //}
    //获取客户经理信息

    $.getInviter = function (salesNo){
        var inviter = null;
        if(salesNo==null){
            return inviter;
        }
      
        $.ajax({
            url: '/api/check/checkSales.do',
            data: {salesNo:salesNo},
            type: 'post',
            dataType:'json',
            async:false,
            success: function (data) {
                if(data.code === "0000"){
                    inviter = data.data;
                }
            }
        });
        return inviter;
    }
    //需登陆后才能访问的页面
    $.privatePage = [
        "/view/account/account.html",
        "/view/confirm/confirm.html",
        "/view/mail/index.html"
    ]
    //url登陆检查
    $.checkLogin = function(){
        var path = location.pathname;
        for(var i=0;i< $.privatePage.length;i++){
            if(path==$.privatePage[i]){
                if(!$.isLogin()){
                    $.goLogin();
                }
            }
        }
    }
   
    //去用户中心校验是否登录
    $.goToUserCenter=function(){
    	//各个版本的首页 若本地未登录 得去用户中心校验一下是否登录
        $.platePage = [
            "/",//首页  \js\view\index\index.js 
            "/index.html",//首页  \js\view\index\index.js 
            "/view/finance/indexPrepare.html",//理财首页-----\js\view\finance\index.js
            "/view/insurance/index.html",//保险首页---\js\view\insurance\index.js
            "/view/assignment/index.html",//转让首页--\js\view\assignment\index.js
            "/view/store/store.html",//门店首页-------\js\view\store\store.js
            "/view/about/research.html",//研究报告----\js\view\about\research.js
            "/view/about/index.html"//关于我们--------\js\view\about\about.js
        ]
        var path = location.pathname;
		var search= location.search;
		var pathSearch = path+search;
		
        if($.isLogin()){//如果本地登录了 
        	//不做处理
        	pathSearch = pathSearch.replace('indexPrepare','index');
        	var forwardStr="";
        	if(pathSearch=="/"||pathSearch=="/indexReal.html"){//首页
        		forwardStr="/indexReal.html";
        	}
        	location.href=forwardStr;
    		return false;
    	}else{//如果本地未登录  去用户中心查是否登录
    		
    		for(var i=0;i< $.platePage.length;i++){
                if(pathSearch==$.platePage[i]){//未登录 且是各板块的首页
                	//未去用户中心判断 现在去用户中心做判断 
                	// '/'代表 %2F   '?'代表 %3F '='代表%3D
                	pathSearch = pathSearch.replace('indexPrepare','index');
                	pathSearch = pathSearch+"?userCenterLogin=unLogin";
                	pathSearch = pathSearch.replace(/\//g,'%2F');
                	pathSearch = pathSearch.replace('?','%3F');
                	pathSearch = pathSearch.replace(/=/g,'%3D');
                	var failUrl=null; 
                	if(path=="/"){
                		failUrl = window.location.protocol+"%2F%2F"+window.location.host+"%3FuserCenterLogin%3DunLogin";
                	}else{
                		failUrl = window.location.protocol+"%2F%2F"+window.location.host+pathSearch;
                	}
                	console.log("failUrl="+failUrl);
                	//cas重定向
                	$.inToUserCenterCheck(failUrl);//进入用户中心去检查
                	return true;
                }
            }
    		return false;
    	}//end if($.isLogin()){//如果本地登录了 
        
    }
    $.goLogin = function(){
//        var bakUrl64 = $.base64.btoa(location.href);
//        location.href = "/view/login/login.html?bakUrl=" + bakUrl64;

  	  //返回页面放置于Cookie中
//  	  var bakUrl64 = $.base64.btoa(location.href);
//  	  var date = $.cookieExpires();
//  	  $.cookie("bakUrl", bakUrl64, {path: "/", expires: date});
  	  //从定向到cas服务器
      //location.href="/cas/cmlogin?failUrl="+window.location.protocol+"%2F%2F"+window.location.host+"%2Fview%2Flogin%2Flogin.html&successUrl="+window.location.protocol+"%2F%2F"+window.location.host+"%2Fsso.html"+"&service="+"http:%2F%2F192.168.33.138:4100%2Fapi%2Fv2%2Flogoutpost";

      //var bakUrl64 = $.base64.btoa(location.href);
      //location.href = "/view/login/login.html?bakUrl=" + bakUrl64;
  	  /*var failUrl=window.location.protocol+"%2F%2F"+window.location.host+"%2Fview%2Flogin%2Flogin.html";*/

  	 var param = $.getUrlParam();
     var type = param.type;
     if(!$.isNullOrBlank(type)){
     	 var failUrl=window.location.protocol+"%2F%2F"+window.location.host+"%2Fview%2Faccount%2Flogin.html?type="+type;
     }
     else{
     	 var failUrl=window.location.protocol+"%2F%2F"+window.location.host+"%2Fview%2Faccount%2Flogin.html";
     }

     window.location="/view/account/login.html";
      //$.inToUserCenterCheck(failUrl);
    }

    $.goRegister = function(){
        var failUrl=window.location.protocol+"%2F%2F"+window.location.host+"%2Fview%2Fenroll%2Fenroll.html";
        $.inToUserCenterCheck(failUrl);
    }
    $.goStore = function(){ //查询门店
        queryStore();
        $("#bond-step1").addClass("hidden");
        $("#bond-step2").removeClass("hidden");
        $("#bondModal").removeClass("hidden");
        $("html").css("overflow-y","hidden");
        /*var backUrl64 = $.base64.btoa(location.href);
        location.href = "/view/store/store.html?backUrl=" + backUrl64;*/
    }
    $.goBond=function(){ //绑定客户经理
        //queryStore();
        $("#bond-step2").addClass("hidden");
        $("#bond-step1").removeClass("hidden");
        $("#bondModal").removeClass("hidden");
        $("html").css("overflow-y","hidden");
    }
    
    //cas服务器重定向
    $.inToUserCenterCheck = function(failUrl){
    	var bakUrl64 = $.base64.btoa(location.pathname);
    	var date = $.cookieExpires();
    	$.cookie("bakUrl", bakUrl64, {path: "/", expires: date});
    	//从定向到cas服务器
    	var hostName = location.host;
    	var service = null;
    	if(hostName=="www.cmiinv.com"){//线上
    		service = window.location.protocol+"%2F%2F"+window.location.host+"%2Fapi%2Fv2%2Flogoutpost";
    	}else{//测试
    		//先去cookei里取 若没有 则从后台取
    		service = $.cookie("logoutUrl");
    		if(service==null||service==""||typeof(service)=="undefined"){
    			$.ajax({
    	            type:"get",
    	            url:"/api/v2/users/userCenterConfig",
    	            async:false,
    	            data:{},
    	            dataType:"json",
    	            success:function(data){
    	                if(data.success){
    	                	service = data.data;
    	                	$.cookie("logoutUrl",service,{path: "/",expires: date});
    	                }
    	            },
    	            error:function(){
    	                console.log("获取退出网址报错！");
    	            }
    	        });
    		}
    	}
    	location.href="/cas/cmlogin?failUrl="+failUrl+"&successUrl="+window.location.protocol+"%2F%2F"+window.location.host+"%2Fsso.html"+"&service="+service;
    }
    
    $.goStore = function(){
        var backUrl64 = $.base64.btoa(location.href);
        location.href = "/view/store/store.html?backUrl=" + backUrl64;
    }
    $.limitDis = function(str,cutNum){
        var retStr = str;
        var disNum = 15;

        if(cutNum){
            disNum = cutNum;
        }
        if(str.length>disNum){
            retStr = str.substr(0,disNum-1)+"...";
        }
        return retStr;
    }
    $.getBankInfo = function(userId){
        var bank;
        $.ajax({
            type:"get",
            url:"/api/v2/user/"+ userId + "/fundaccounts",
            async:false,
            data:{access_token:$.cookie("ccat")},
            dataType:"json",
            success:function(data){
                //console.log("data=="+JSON.stringify(data));
                //目前只有一张银行卡
                if(data[0]){
                    bank = data[0].account;

                    //这里缓存下银行卡信息
                    //$.session.account = account;
                    //console.log("account=="+JSON.stringify(account));
                    //accountRactive.set({
                    //    bank:account.bank,
                    //    cardNo:account.account
                    //});
                    //accountRactive.set("bank",account);
                }
            },
            error:function(){
                console.log("获取银行卡信息失败！！");
            }
        });
        return bank;
    }
    $.getAreaData = function(){
        var areaData = null;
        $.ajax({
            url:"/api/v2/chinapay/cities",
            type:"get",
            async:false,
            data:{},
            dataType:"json",
            success:function(data){
                areaData = data;
            }
        });
        return areaData;
    }
    $.bindInviter = function(userId,empId){
        var result = null;
        $.checkServerAuthorizeStatus("V5");
        var authorizeCode=$.cookie("v5token");
        $.ajax({
            url: '/api/v2/users/wealthManagerBind/'+userId,
            contentType: "application/x-www-form-urlencoded",
            async:false,
            data: {
                EmpId:empId
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                result = data;
            },error:function(data){
                alert(data);
            }

        });
        return result;
    }
    $.isGreenhand = function(userId){
        var result = false;
        var url="/api/v2/user/new/"+userId;
        $.ajax({
            url:url,
            type:"get",
            async:false,
            dataType:"json",
            success:function(data){
                //console.log("data=="+JSON.stringify(data));
                if(data){//是新手
                    result = true;
                }
            }
        });
        return result;
    }
    /**
     * map描述：本息分配方式对照Map
     * @author zhaoxinbo
     * @type {{MonthlyInterest: string, EqualInstallment: string, EqualPrincipal: string, BulletRepayment: string, EqualInterest: string}}
     * @date 2015-12-04 14:45
     */
    $.repayMethod = {
        MonthlyInterest:'按月付息到期还本',
        EqualInstallment:'按月等额本息',
        EqualPrincipal:'按月等额本金',
        BulletRepayment:'一次性还本付息',
        EqualInterest:'月平息'
    };
    $.isMale = function(idNo){
        if($.validateId(idNo)){
            var num = idNo.substr(-2,1);
            if(num%2==0){
                return false;
            }else{
                return true;
            }
        }else{
            return null;
        }
    }
    /**
     * 方法名称：getInchannelByCondition
     * @author Aboruo
     * 方法描述：依据条件参数解析得到渠道号和活动id
     * @param param 条件参数,包含：活动id信息和渠道信息
     * @returns {{"activityId":activityId,"inchannel":qdt}}
     * @date 2016-01-07 14:32
     */
    $.getInchannelByCondition = function(param){
        var retValue = {};

        /** 活动id */
        var activityId = param.activityId ? param.activityId : null;
        if (!activityId && activityId!=0){
            activityId="00";
        } else {
            activityId="01";
        }

        /** inchannel 00:web,01:android,02:ios,03:wap,04:wsc,05:scwf */
        var qdt = param.channel ? param.channel : null;
        if (!qdt && qdt!=0){
            qdt="00";
        } else {
            switch(qdt){
                case "scwf":
                    qdt = "05";
                    break;
                case "wsc":
                    qdt = "04";
                    break;
                case "wap":
                    qdt = "03";
                    break;
                case "ios":
                    qdt = "02";
                    break;
                case "android":
                    qdt = "01";
                    break;
                default:
                    qdt="00";
            }
        }
        retValue.inchannel = qdt;
        retValue.activityId = activityId;
        return retValue;
    }
    /**
     * 方法名称：checkFirstBindCard
     * 方法简介：查看用户是否是第一次绑卡
     * @param param json参数，包含userId
     */
    $.checkFirstBindCard = function (userInfo){
        var result= {};
        result.flag = !(userInfo.hasOwnProperty('idNumber') && user.idNumber && user.idNumber.length > 0);
        return result;
    }

    /**
     * 方法名称：queryProAndCity
     * 方法简介：查询省市接口
     * @param param json参数，包含userId
     */
    $.queryProAndCity = function (){
        var url = "/api/v5/st_queryProAndCity.action";
        var result=null;
        $.ajax({
            url: url,
            dataType: 'json',
            async:false,
            data:{},
            type: 'POST',
            success: function (data) {
                result = data;
            }
        });
        return result;
    }

    /**
     * 方法名称：queryBanks
     * 方法简介：查询银行接口
     * @param param json参数，
     */
    $.queryBanks = function (){
        var url = "/api/v2/chinapay/banks?from=core";
        var result=null;
        $.ajax({
            url: url,
            dataType: 'json',
            async:false,
            type: 'get',
            success: function (data) {
                console.log(JSON.stringify(data));
                result = data;
            }
        });
        return result;
    }

    /**
     * 方法名称：queryBanks
     * 方法简介：查询银行接口
     * @param param json参数，
     */
    $.checkInvestAmount = function (param,userId){
            var url = "/api/v2/invest/calInvestAmount/"+userId;
            var result=null;
            $.ajax({
                url: url,
                async:false,
                data: param,
                dataType: 'json',
                type: 'POST',
                success: function (data) {
                    result=data;
                }
            });
            return result;
        }

    /**
     * 方法名称：isYGJPY
     * 方法简介：判断产品是否为粤股交产品
     * @param productKey tags
     */
    $.isYGJPY = function (productKey,tags){
        if(productKey === 'YGJPY'){return true}; //产品类型为粤股交
        if(tags.length>0){
            for(var i=0;i<tags.length;i++){
                if(tags[i].name.indexOf("粤股交")>=0){//产品标签含有粤股交
                    return true;
                }
            }
        }
        return false;
    }

    /**
     2  ** 乘法函数，用来得到精确的乘法结果
     3  ** 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
     4  ** 调用：accMul(arg1,arg2)
     5  ** 返回值：arg1乘以 arg2的精确结果
     6  **/
    $.accMul =function accMul(arg1, arg2) {
             var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
             try {
                    m += s1.split(".")[1].length;
                }
             catch (e) {
                 }
            try {
                    m += s2.split(".")[1].length;
                 }
            catch (e) {
                 }
           return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
        }

    /**
     * 方法名称：getBankInfoMessage
     * @author Xuefeng
     * 方法描述：依据银行code返回提示信息
     * @param param code 银行code
     * @returns info
     * @date 2016-01-07 14:32
     */
    $.getBankInfoMessage = function(code){
        //默认银行返回信息
        //var info = "＊请确认填写信息与银行预留信息一致，如信息一致但绑卡后提示“银行卡验证信息及身份信息或手机号输入不正确”，请先开通银联在线支付，开通教程： <a href='http://help.cmiinv.com/list/1/76.html' target='_blank'>http://help.cmiinv.com/list/1/76.html</a>";
        var info = "";
            switch(code){
                case "0005"://建设银行
                    info = "*请确认已开通并激活建行高级版网银业务。";
                    break;
                case "0008"://光大银行
                    info = "*请确认已开通光大银行电子支付业务。";
                    break;
            }
        return info;
    }
    /**
     * 方法名称：getSelectedOption
     * @author zhaoxinbo
     * 方法描述：获得对应value值的option
     * @param optionValue 要查找的value值
     * @returns option
     * @date 2016-10-17 10:26
     */
    $.fn.getSelectedOption = function(optionValue){
        var options = this.find('option');
        var option = null;
        for(var i = 0;i < options.length;i++){
            if(options[i].value == optionValue){
                option = options[i];
                break;
            }
        }
        return option;
    }
    /**
     * 方法名称：getSelectedOption
     * @author zhaoxinbo
     * 方法描述：获得对应value值的option
     * @param optionValue 要查找的value值
     * @returns option
     * @date 2016-11-01 17:10
     */
    $.fn.getSelectedOptionFromText = function(optionText){
        var options = this.find('option');
        var option = null;
        for(var i = 0;i < options.length;i++){
            if(options[i].text === optionText){
                option = options[i];
                option.select = true;
                this.val(option.value);
                break;
            }
        }
        return option;
    }
     // 给Number类型增加一个mul方法，调用起来更加方便。
    Number.prototype.mul = function (arg) {
             return accMul(arg, this);
         };
    /**
     * 方法名称：contains
     * @author zhaoxinbo
     * 方法描述：查询数组中是否含有某个元素
     * @param obj 要查找的value值
     * @returns boolean
     * @date 2016-10-17 17:56
     */
    Array.prototype.contains = function (obj) {
        var i = this.length;
        while (i--) {
            if (this[i] == obj) {
                return true;
            }
        }
        return false;
    }

    $.saveBackUrl = function(){
        var bakUrl64 = $.base64.btoa(location.href);
        /*var bakUrl64 = $.base64.btoa(location.pathname);*/
        var date = $.cookieExpires();
        $.cookie("bakUrl", bakUrl64, {path: "/", expires: date});
    }
    $.isNullOrBlank = function(strJudge){
        return strJudge == null || strJudge == undefined || strJudge == '';
    }
    /**
     * 方法名称：notesUserVisit
     * @author zhaoxinbo
     * 方法描述：采用异步方式：记录用户访问记录信息
     * @param visitInfo 用户访问记录信息
     * @returns void
     * @date 2017-01-03 15:23
     */
    $.notesUserVisit = function(visitInfo){
        /** 1 定义默认访问参数 */
        var default_visitInfo = {
            page_name:'未指定页面',
            function_name:'未指定功能',
            user_action:'未指定触发动作',
            action_result_status:1,
            action_result:'动作结果未知',
        };
        visitInfo = $.extend(default_visitInfo, visitInfo);
        /** 2 参数添加用户信息，access_token等公有信息 */
        $.userVisitBaseInfo(visitInfo);
        console.log(visitInfo);
        /** 3 访问后台接口记录用户访问记录,异步访问 */
        $.ajax({
            contentType:'application/x-www-form-urlencoded',
            type:'post',
            url:'/api/v5/User_UserRecord',
            data:visitInfo,
            dataType:'json',
            success:function(result){
                console.log(result);
            },
            error:function(error){
                console.log(visitInfo.page_name + " 页面记录用户访问操作出现错误：" + JSON.stringify(error));
            }
        });
        return;
    }
    /**
     * 方法名称：userVisitBaseInfo
     * @author zhaoxinbo
     * 方法描述：用户访问记录信息中公有信息填写
     * @param visitInfo 用户访问记录信息
     * @returns void
     * @date 2017-01-03 15:23
     */
    $.userVisitBaseInfo = function(visitInfo){
        var access_token = $.isNullOrBlank($.cookie('ccat')) ? 'zmitTemplateToken' + new Date().format('yyyyMMdd HH:mm:ss'):$.cookie('ccat');
        var page_url = window.location.href;
        var userId = $.isNullOrBlank($.cookie('user')) ? (visitInfo.hasOwnProperty('username') ? visitInfo.username : access_token) : JSON.parse($.cookie("user")).id;
        visitInfo.access_token = access_token;
        visitInfo.page_url = page_url;
        visitInfo.userId = userId;
        visitInfo.user_device = 'PC';
        return;
    }

    /**
     * 方法名称：setTitle
     * @author xuefeng
     * 方法描述：设置页面title
     * @param str title内容
     * @returns void
     * @date 2017-02-07 15:23
     */
    $.setTitle = function(str){
        document.title=str;
    }

    /**
     * 方法名称：setDescription
     * @author xuefeng
     * 方法描述：设置页面description
     * @param str description内容
     * @returns void
     * @date 2017-02-07 15:23
     */
    $.setDescription = function(str){
        var metas= document.getElementsByTagName("meta");
        $(metas).each(function (index, meta) {
            if(meta.getAttribute('name')=="description"){
                meta['content'] =str;
            }
        });
    }

    /**
     * 方法名称：checkServerAuthorizeStatus
     * @author xuefeng
     * 方法描述：检测server授权码是否过期，如过期重新获取
     * @param str server (V7,V5)
     * @returns void
     * @date 2017-04-12 15:23
     */
    $.checkServerAuthorizeStatus = function(server){
        switch(server){
            case "V7":
                var url = "/api/v7/clientInfoController/getServerInfo.do";
                var authorizeCode=$.cookie("v7token");
                $.ajax({
                    url: url,
                    async:false,
                    data: {authorizeCode:authorizeCode},
                    dataType: 'json',
                    type: 'POST',
                    success: function (data) {
                        if(data.status=="0"||data.status=="-1"){//过期重新获取
                            $.refreshServerAuthorizeStatus("V7");
                        }
                    }
                });
                break;
            case "V5":
                var url = "/api/v5/serverInfo_getV5ServerInfo";
                var authorizeCode=$.cookie("v5token");
                //$.ajax({
                //    url: url,
                //    async:false,
                //    data: {authorizeCode:authorizeCode},
                //    dataType: 'json',
                //    type: 'POST',
                //    success: function (data) {
                //        if(data.status=="0"||data.status=="-1"){//过期重新获取
                //            $.refreshServerAuthorizeStatus("V5");
                //        }
                //    }
                //});
                break;

            }
    }

    /**
     * 方法名称：refreshServerAuthorizeStatus
     * @author xuefeng
     * 方法描述：刷新server授权码
     * @param str server (V7,V5)
     * @returns void
     * @date 2017-04-12 15:23
     */
    $.refreshServerAuthorizeStatus = function(server){
        var user=$.cookie("user");
        user = eval('(' + user + ')');
        var access_token= $.cookie('ccat');
        var url = '/api/v2/users/authorizeCode/'+user.id+'/1?access_token='+access_token;
        $.ajax({
            url: url,
            async:false,
            data: {interfaceType:server},
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                if(data.success==true){
                    var date = $.cookieExpires();
                    if(server=="V7"){
                        $.cookie("v7token", data.data, {path: "/", expires: date});
                    }else if(server=="V5"){
                        $.cookie("v5token", data.data, {path: "/", expires: date});
                    }
                }
            }
        });
    }


    /**
     * 方法名称：addAddress
     * @author xuefeng
     * 方法描述：新建收货地址
     * @param object param (V2) name,mobile,address,provinceCode,cityCode,areaCode
     * @returns void
     * @date 2017-09-15 9:23
     */
    $.addAddress = function(param){
        var user=$.cookie("user");
        user = eval('(' + user + ')');
        var access_token= $.cookie('ccat');
        var url = '/api/v2/goods/shippingAddressSave/'+user.id+'/PC/0000?access_token='+access_token;
        var result=false;
        $.ajax({
            url: url,
            data: param,
            async:false,
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                if(data.success==true){
                    result= true;
                }
            }
        });
        return result;
    }

    /**
     * 方法名称：getProvince
     * @author xuefeng
     * 方法描述：获取省
     * @param
     * @returns void
     * @date 2017-09-15 9:23
     */
    $.getProvince = function(){
        var url = '/api/v2/goods/getProvince/PC/0000';
        var provinces=null;
        $.ajax({
            url: url,
            async:false,
            data: {},
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                if(data.success==true){
                    provinces=data.data;
                }
            }
        });
        return provinces;
    }

    /**
     * 方法名称：getCitiesByProvinceCode
     * @author xuefeng
     * 方法描述：获取市
     * @param
     * @returns void
     * @date 2017-09-15 9:23
     */
    $.getCitiesByProvinceCode = function(provinceCode){
        var url = '/api/v2/goods/getCitiesByProvinceCode/'+provinceCode+'/PC/0000';
        var cities=null;
        $.ajax({
            url: url,
            async:false,
            data: {},
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                if(data.success==true){
                    cities=data.data;
                }
            }
        });
        return cities;
    }

    /**
     * 方法名称：getAreaByCityCode
     * @author xuefeng
     * 方法描述：获取区
     * @param
     * @returns void
     * @date 2017-09-15 9:23
     */
    $.getAreaByCityCode = function(cityCode){
        var url = '/api/v2/goods/getAreaByCityCode/'+cityCode+'/PC/0000';
        var areas=null;
        $.ajax({
            url: url,
            async:false,
            data: {},
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                if(data.success==true){
                    areas=data.data;
                }
            }
        });
        return areas;
    }



    /**
     * 方法名称：autoLogin
     * @author xuefeng
     * 方法描述：获取区
     * @param
     * @returns void
     * @date 2017-09-15 9:23
     */
    $.autoLogin = function(){
        var tgt= $.getUrlParam().tgt;
        if(tgt=="null"|| $.isNullOrBlank(tgt)){
            return;
        }
        //保存tgt用于自动登录
        window.localStorage.setItem("tgt",  tgt);
        var param = { username: 'username',
            password:'123456',
            grant_type:'password',
            client_id:'f327bc3d-67fe-428c-b4f1-90eb518defba',
            client_secret:'48f1d99df9ff3511b077d37fee3af17153f16b29ebe8c5f424a0a52572438b4f',
            source:'WEB',
            tgt:tgt};
        var url = '/api/v2/token';
        $.ajax({type:'post',
            url:url,
            async:false,
            data:param,
            dataType:'json',
            success:function(data){
                var date = $.cookieExpires();
                $.cookie("ccat", data.access_token, {path: "/", expires: date});
                $.cookie("user", JSON.stringify(data.user), {path: "/", expires: date});
            },error:function(data){
                window.console.log("自动登录失败");
                $.goLogin();
            }});
    }


    //判断是否开通酷宝宝
    $.isOpenFundAccount = function(userId){
        var result = false;
        var url="/api/v2/isOpenFundAccount";
        $.ajax({
            url:url,
            type:"post",
            async:false,
            dataType:"json",
            data:{userId:userId},
            success:function(data){
                if(data){
                    result = true;
                }
            }
        });
        return result;
    }

    //判断产品是否可以购买
    $.isFinished = function(status){
        if(status=="FINISHED"||status=="SETTLED"){
            return true;
        }else{
            return false;
        }

    }
    

})(jQuery);