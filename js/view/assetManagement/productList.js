var pageIndex = 1; //页索引 
var pageSize = 20;
var listLength; //记录请求到数据的总页数
var user = $.getUser();
var userId = user.userBasic.userId;
var access_token = JSON.parse($.cookie('user')).token;
var mobileNo;
var ztId;
$(function() {
	$.setTitle('券商资管');
	$("#headName").text("券商资管");
	$('#backTo').click(function() {
		window.location.href = "/view/externalDocking/home.html";
	});
	if(user.userSecurityBind == "" || user.userSecurityBind == undefined) {
		mobileNo = JSON.parse($.cookie('user')).mobile;
	} else {
		mobileNo = user.userSecurityBind.mobileNo;
	};
	getZtId();
	if($.isLogin()) {
		findData();
	} else {
		$.saveBackUrl();
		window.location.href = '/view/account/login.html?type=ztzg';
	}
	$("#first").click(function() {
		pageIndex = 1;
		findData();
	});

	$("#previous").click(function() {
		if(pageIndex != 1) {
			pageIndex--;
			findData();
		} else {
			alert("已经是第一页！")
		}
	});

	$("#next").click(function() {
		if(pageIndex * pageSize < listLength) {
			pageIndex++;
			findData();
		} else {
			alert("已经是最后一页！")
		}
	});

})

function findData() {
	var listlength = 1;
	var param = {
		ztId: '',
	};
	var url = '/api/ztb/getCanBuyList.do';
	$.ajax({
		type: 'post',
		url: url,
		async: true,
		data: param,
		dataType: 'json',
		success: function(data) {
			$("#productList").empty();
			if(data.code = "0000") {
				var json = data.content;
				$.each(json, function(i, item) {
					if(!$.isNullOrBlank(item.naturestutas)) {
						var sale_amount = item.minsunb + "起购";
						var str = '<img src="/img/assetManagement/icon_yrz.png" />';
						$("#productList").append(" <div  class='productContainer' onclick='jumpOurProduct(\"" + item.url + "\")'><div class='productTitle'>" + item.securitysname + "</div><div ><div class='nianhua'><div class='txt1'>" +
							item.yieldRate + "</div><div class='txt2'>" + item.yieldRateDescribe + "</div></div><div class='qixian'><div class='txt2'>锁定期限 &nbsp;<span>" +
							item.lockupPeriod + "</span></div><div class='txt2'>起投金额 &nbsp;<span>" + item.minsunb + "</span></div></div><div class='qitou'>" +
							str + "</div><div class='clear'></div></div>"
						);
					} else {
						var product_code = item.secinnercode;
						var product_name = item.securitysname;
						var product_rate;
						var product_text;
						var deadline;
						if(item.isDuanqilicai == "1") {
							// 短期理财
							product_rate = item.benchmark_duanqilicai;
							product_text = "业绩比较基准";
						} else {
							if(item.naturecode == "201") {
								product_rate = (item.yield7day).toFixed(2) + "%";
								product_text = "七日年化收益";
							} else {
								if(item.yieldsf != undefined) {
									product_rate = (item.yieldsf).toFixed(2) + "%";
								} else {
									product_rate = "";
								}
								product_text = "成立以来回报";
							}
						}

						if(item.duration_duanqilicai == "" || item.duration_duanqilicai == undefined) {
							deadline = "灵活存取";
						} else {
							deadline = item.duration_duanqilicai + item.unit_duanqilicai;
						}

						var product_status = item.canbuy;
						var sale_amount = item.minsun + "万元起购";
						var str = '';
						//是否可购买（1.即将开抢 2.可申购 3.已售罄 4.不可申购 5.可认购 6.可预约）
						if(product_status == "1") {
							str = '<img src="/img/assetManagement/icon_jjks.png" />';
						} else if(product_status == "3") {
							str = '<img src="/img/assetManagement/icon_ysq.png"/>';
						} else if(product_status == "4") {
							str = '<img src="/img/assetManagement/icon_bksg.png"/>';
						} else if(product_status == "6") {
							str = '<img src="/img/assetManagement/icon_kyy.png"/>';
						} else {
							str = "";
						}
						
						if(product_name == '申万致胜六号'){
							$("#productList").append(" <div  class='productContainer' onclick='jumpProduct(\"" + product_code + "\",this)'><div class='productTitle'>" + product_name + "</div><div ><div class='nianhua'><div class='txt1'>" +
							product_rate + "</div><div class='txt2'>" + product_text + "</div></div><div class='qixian'><div class='txt2'>投资期限 &nbsp;<span>" +
							deadline + "</span></div><div class='txt2'>起投金额 &nbsp;<span>" + sale_amount + "</span></div></div><div class='qitou'>" +
							str + "</div><div class='clear'></div></div>"
						    );
						}else{
							$("#productList").append(" <div  class='productContainer' onclick='jumpProduct(\"" + product_code + "\",this)'><div class='productTitle'>" + product_name + "</div><div ><div class='nianhua'><div class='txt1'>" +
							product_rate + "</div><div class='txt2'>" + product_text + "</div></div><div class='qixian'><div class='txt2'>锁定期限 &nbsp;<span>" +
							deadline + "</span></div><div class='txt2'>起投金额 &nbsp;<span>" + sale_amount + "</span></div></div><div class='qitou'>" +
							str + "</div><div class='clear'></div></div>"
						);
						}

						
					}
				});
			} else {
				alert("网络忙，请稍后再试！");
			}
		},
		error: function(error) {
			console.log(JSON.stringify(error));
			var errorMsg = "网络忙，请稍后再试！";
			alert(errorMsg);
		}
	});
}

function jumpOurProduct(url) {
	url = "http://" + url;
	window.location.href = url;
}

function jumpProduct(pId, e) {
	if($.isNullOrBlank(ztId)) {
		skipZTB();
		return;
	}

	$(e).css("background-color", "#F2F2F2")
	if(!$.isLogin()) {
		$.saveBackUrl();
		window.location.href = '/view/account/login.html' + '?type=ztzg';
	} else {
		var param = {
			ztId: ztId,
			secinnercode: pId,
		};
		var url = '/api/ztb/getCanBuyDetails.do';
		$.ajax({
			type: 'post',
			url: url,
			async: true,
			data: param,
			dataType: 'json',
			success: function(data) {
				if(data.code == "0000") {
					location.href = data.url;
				} else {
					var msg = data.message;
					layer.open({
						content: msg,
						skin: 'sure',
						time: 2
					});
				}
			},
			error: function(error) {
				console.log(JSON.stringify(error));
			}
		})
	}
}

//弹窗
function show(tag) {
	$("#fade").css("display", "block");
	$(tag).css("display", "block");
}

function hide(tag) {
	$("#" + tag).css("display", "none");
	$("#fade").css("display", "none");
}

function getZtId() {
	var parma = {
		userId: userId,
		phoneNo: mobileNo,
		access_token: access_token
	}
	$.ajax({
		type: "post",
		url: "/api/ztb/seleteZTId.do",
		async: true,
		data: parma,
		dataType: 'json',
		success: function(data) {
			if(data.code == "0000") {
				ztId = data.ztId;
			}
		},
		error: function(error) {
			console.log(JSON.stringify(error));
		}
	});
}

function skipZTB() {
	var param = {
		phone: mobileNo,
		userId: userId,
		access_token: access_token
	}
	$.ajax({
		type: "post",
		url: "/api/ztb/getZtbMainUrl.do",
		async: true,
		data: param,
		dataType: 'json',
		success: function(data) {
			$.unloading();
			if(data.code == "0000") {
				window.location.href = data.data;
			} else {
				$.alert(data.message);
			}
		},
		error: function(error) {
			console.log(error);
		}
	});
}