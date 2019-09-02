$(function(){
	$('#check_verifyCode').click(function(){
		var verifyCode=$('#verifyCode').val();
		if(verifyCode==''){
			layer.open({
				content: "请输入短信验证码",
				skin: 'msg',
				time: 2
			});
		return;
		}
		$.ajax({
			url:APP_URL + "/platinfo/checkVerifyCode.htm",
			type: 'GET',
			data:{"verifyCode":$("#verifyCode").val(),"moudle":"3"},
			cache: false,
            dateType: "json",
			success:function(data){
			   if (data.code == 000000) {
                //验证码正确
                layer.open({
				    content: data.description,
				    skin: 'msg',
				    time: 2
				});				
                return;
            } else {
                //验证码错误
                layer.open({
				    content:data.description,
				    skin: 'msg',
				    time: 2
				});
                return;
            }
        },
			error:function(e){
			    console.log("error:" + e);
			}
		})
	});
});
function getVerificationCode(){
	$.ajax({
        type: "Get",
        url: APP_URL + "/platinfo/sendMsg.htm",
        data: {
           "phone":"15678945612",
            "type": "1",
            "moudle": "3"
        },
        cache: false,
        dateType: "json",
        success: function (data) {
            if (data.code == 000000) {
                //验证码发送正确
                layer.open({
				    content: data.description,
				    skin: 'msg',
				    time: 2
				});
				curCount = count;
                $("#get_verifyCode").removeAttr("onclick");//移除onclick事件
                // 设置button效果，开始计时
                $("#get_verifyCode").addClass("gary");// 将button按钮禁用
                interValObj = window.setInterval(setTime, 1000); // 启动计时器，1秒执行一次
                return;
            } else {
                //验证码发送失败
                layer.open({
				    content:data.description,
				    skin: 'msg',
				    time: 2
				});
				curCount = count;
                $("#get_verifyCode").removeAttr("onclick");//移除onclick事件
                // 设置button效果，开始计时
                $("#get_verifyCode").addClass("gary");// 将button按钮禁用
                interValObj = window.setInterval(setTime, 1000); // 启动计时器，1秒执行一次
                return;
            }
        },
        error: function () {
            console.log("error:" + e);
        }
	});
}

var interValObj; // timer变量，控制时间
var count = 120; // 间隔函数，1秒执行
var curCount;// 当前剩余秒数
function setTime() {
    if (curCount == 0) {
        $("#get_verifyCode").attr("onclick", "getVerificationCode();");//添加onclick事件
        window.clearInterval(interValObj);// 停止计时器
        $("#get_verifyCode").removeClass("gary");// 启用按钮
        $("#get_verifyCode").val("获取验证码");
    } else {
        curCount--;
        $("#get_verifyCode").val(curCount + "秒后可重发");
    }
}
function getVoiceCode(){
	$.ajax({
        type: "Get",
        url: APP_URL + "/platinfo/sendMsg.htm",
        data: {
           "phone":"15678945612",
            "type": "2",
            "moudle": "3"
        },
        cache: false,
        dateType: "json",
        success: function (data) {
            if (data.code == 000000) {
                //验证码发送正确
                layer.open({
				    content: data.description,
				    skin: 'msg',
				    time: 2
				});
                return;
            } else {
                //验证码发送失败
                layer.open({
				    content:data.description,
				    skin: 'msg',
				    time: 2
				});
                return;
            }
        },
        error: function () {
            console.log("error:" + e);
        }
	});
}