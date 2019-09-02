/**
 * Created by kylezu on 2018/4/19.
 */
var relSource="";
var activeId="";
var existName=false;
var existPhone=false;
var estate = [];
var validator = '';

$(function(){
    $.setTitle('中民超级会员');
    
   
    
    $(".img-goBack").click(function(){
        window.history.back(-1);
    });
    $.session = {};
    //渠道来源获取
    var Request = new Object();
    Request = GetRequest();
    if(Request.source!=undefined){
        relSource=Request.source;
    }
    if(Request.active!=undefined){
        activeId=Request.active;
    }

    var urlCheckMobile = '/api/check/checkMobile.do';


    var mobileCodeBtn = $("#mobileCodeBtn");
    mobileCodeBtn.click(function(){
        getPhoneOrSoundCode('00');
    });
    $('input').on("focus",function(){
		$(this).parents(".row").addClass("focus");

	})

    var $_input = $('input')
	$_input.on("blur",function(){
		$(this).parents(".row").removeClass("focus");
		console.log($_input);
	})
	$("#input-agree").click(function(){
		if($(this).hasClass("active")){
			 $("#registerBtn").attr("disabled","disabled").css('background-color','#dadada');
			$($(this)).removeClass("active").attr("src",'/img/externalDocking/checked-1.png');
		}else{
			$("#registerBtn").removeAttrs("disabled");
            $("#registerBtn").css('background-color','#2b8fea');
			$($(this)).addClass("active").attr("src",'/img/externalDocking/checked-2.png');
		}
	})
    function getPhoneOrSoundCode(flag){
        var result=validator.element('#mobile');
        if(!result){
            return;
        }
        mobileCodeBtn.attr("disabled","disabled");
        /** 组织公用查询参数 和 [获取手机验证码]和[语音验证码]的url */
        var urlGetCheckCodePhone = '/api/smsCode/getValidateCode.do';
        var phoneNum = $('#mobile').val();
        var param = {}; //请求参数包含手机号
        param.mobile = phoneNum;
        param.channelCode="WEB";

        /** ① 校验手机号是否已经注册 */
        $.ajax({
            type:"post",
            url:urlCheckMobile,
            data:param,
            dataType:"json",
            async:false,
            success:function(data){
                if(data.code=="0000"){
                    /** ② 如果手机号校验通过,则获取短信验证码 */
                    getCheckCodePhone(param,urlGetCheckCodePhone);

                }else{
                    mobileCodeBtn.removeAttr("disabled");
                    /** ③ 手机号已经存在等提示信息则在页面上展示相应的提示信息 */
                    $.alert(data.message);
                }
            },
            error:function(){
                console.log("系统错误");
            }
        });
    }
    /**
     * 方法名称: interval
     * 方法描述:[获取验证码]按钮设置定时
     * @author:zhaoxinbo
     * @date 2015-09-15 18:26
     */

    var btnContent = mobileCodeBtn.val();
    function interval(){
        $("#mobile").attr("readonly",true);
        var second = 120;
        mobileCodeBtn.val(second+"秒");
        var codeInterval = setInterval(function(){
            mobileCodeBtn.val((--second)+"秒");
            if(second<0){//结束
                $("#mobile").attr("readonly",false);
                clearInterval(codeInterval);
                mobileCodeBtn.val(btnContent);
                mobileCodeBtn.removeAttr("disabled");
            }
        },1000);
    }
    /**
     * 方法名称: getCheckCodePhone
     * 方法描述:[获取验证码]按钮设置定时
     * @author:zhaoxinbo
     * @date 2015-09-15 18:33
     * url:http://120.132.84.189/api/v2/register/smsCaptcha?mobile=15313085070
     */
    function getCheckCodePhone(param,urlGetCheckCodePhone){
        $.ajax({
            type:'post',
            url:urlGetCheckCodePhone,
            data:param,
            dataType:'json',
            async:false,
            success: function (results) {
                if(results.code=="0000"){
                    interval();
                }else{
                    $("#mobileCodeBtn").removeAttr("disabled");
                    /** 解析失败信息,并采取相应操作 */
                    $.alert(results.message);
                }
            },
            error: function () {
                console.log("系统错误");
            }
        });
    }


    /** 添加手机号验证 */
    $.validator.addMethod("correctMobile",function(value,element){
        return $.isNumber(value);
    });

    /** 添加密码规则验证 */
    $.validator.addMethod('regexPassword', function (value,element) {
        return $.isPassword(value);
    });


    /** @zhaoxinbo 2015-10-09 17:07 添加用户名规则验证 */
    $.validator.addMethod('regexUserName',function(value,element){
        return $.isUserName(value);
    });
    $.validator.addMethod('validManagerId',function(value,element){
        var element = $(element);
        if(value&&value!="推荐人(选填)"){//IE8兼容pceholderla
            if(value.length>=8){ //输入大于8位后校验有效性
                var result = $.getInviter(value);
                if(result != null){//显示客户经理
                    //去除历史信息
                    //$(element).closest('.form-box').find(".placeInfo").remove();
                    $(".placeInfo").remove()
                    //显示姓名
                    var name = $('<div class="help-block placeInfo" >'+result.salesName+'</div>');
                    name.insertAfter($(element).parent().parent());
                }else{
                	$(".placeInfo").remove()
                    return false;
                }
            }else{
                return false;
            }
        }
        return true;
    });

    validator = $('#validation-reg').validate({
        errorElement: 'div',
        errorClass: 'help-block',
        focusInvalid: false,
        rules: {
            username: { required: true,  maxlength: 20,  minlength: 4,regexUserName:true},
            password: {  required: true, maxlength: 20,  minlength: 8,regexPassword:true},
            email: { email: true},
            mobile: { required:true,rangelength:[11,11],correctMobile:true},
            manageid:{validManagerId:true}
        },
        messages: {
            username: { required: "用户名必须为4-20个字符(数字、字母、下划线),首位必须为字母！",maxlength:"用户名必须为4-20个字符(数字、字母、下划线),首位必须为字母！",minlength:"用户名必须为4-20个字符(数字、字母、下划线),首位必须为字母！",regexUserName:'用户名必须为4-20个字符(数字、字母、下划线),首位必须为字母！' },
            password: { required: "密码为8-20个字符，字母+数字组合，区分大小写." ,maxlength:"密码为8-20个字符，字母+数字组合，区分大小写.", minlength:"密码为8-20个字符，字母+数字组合，区分大小写.",regexPassword:"密码为8-20个字符，字母+数字组合，区分大小写."},
            mobile: { required: "请输入正确的手机号码",rangelength:"手机号码必须为11位",correctMobile:"手机号码必须为数字"},
            email: { email: "邮箱格式错误" },
            manageid:{validManagerId:"无效的推荐人"}
        },
        highlight: function (e) {
            $(e).closest('.form-box').removeClass('has-info').addClass('has-error');
        },
        success: function (e) {
            $(e).closest('.form-box').removeClass('has-error');
            $(e).remove();
        },
        errorPlacement: function (error, element) {
            //这个地方当输入框失去焦点时，正确情况也走，纳闷了，但是传进来的error是空div判断下，如果是空则不清除提示信息
            if(error.text()){
                element.closest('.form-box').find(".placeInfo").remove();
            }
            error.insertAfter(element.parent().parent());
        }
    });

    if(Request.salesNo!="undefined"&&Request.salesNo!="null"){
        $('#manageid').val(Request.salesNo);
        validator.element('#manageid');
    }

    /** 注册按钮业务处理 */
    var $registerBtn = $('#registerBtn');

    /** 2015-10-28 11:23 @zhaoxinbo 添加获取链接中的推荐人手机号参数 */
    var recomandInfo = $.getUrlParam();
    $registerBtn.click(function () {
        if(existPhone||existName){
            return;
        }
        /** 获得邮箱账号,依据邮箱账号是否有值来确定邮箱是否做validate
         * 添加原因:因对在ie8下注册时,jquery1.11对ie8邮箱校验出问题
         * @zhaoxinbo 2015-11-10 14:21modify
         */

        if($(this).html()=="注册中"){
            return; //注册中不可点击
        }

        var $email = $.trim($('#email').val());
        $email = $email != "邮箱" ? $email : '';
        if($email && $.trim($email).length > 0){
            validator.settings.rules.email = {email:true};
        }else{
            validator.settings.rules.email = {email:false};
        }

        /** 验证数据项合法性 */
        var valiResult = validator.form();


        if(valiResult) {//validator.form()
        	$registerBtn.css("background-color",'#1e74c2');
            /** 无论email校验是否有效都恢复为有效 与@zhaoxinbo 2015-11-10 14:21modify 相对应 */
            validator.settings.rules.email = {email:true};

            /** 1 获取用户名 密码 验证码 手机号 手机验证码 邮箱 客户经理号 渠道号 活动id */
            var $username = $.trim($('#username').val());
            var $password = $.trim($('#password').val());
            var $captcha = $.trim($('#captcha').val());
            var $mobile = $.trim($('#mobile').val());
            var $yzm = $.trim($('#yzm').val());
            var $manageid = $.trim($('#manageid').val());

            $manageid = $manageid !="推荐人" ? $manageid : ""; //判断此号是不是placeholder,针对IE9的不兼容问题

            /** 渠道新增 */
            var urlParam = $.getUrlParam();
            var inchannelJson = $.getInchannelByCondition(urlParam);

            /** 2 组织请求参数 */
            var param = {};
            param.loginName = $username;
            param.password = $password;
            param.mobile = $mobile;
            param.validateCode = $yzm;
            param.salesNo = $manageid;
            param.referrerType = "99";
            param.referrerCode = $manageid;
            param.channelCode = "channelCode";
            param.promotionSource = "promotionSource";
            param.userRegDevice="WEB";
            param.userType="0";
            param.channel="0000";

            /** 2015-10-28 11:28 @zhaoxinbo 添js/view/enroll/enroll.js:196加推荐人手机号参数 */
            var registerUrl = '/api/user/regist.do';

            /** 3 验证是否同意用户协议 */
            if(!$("#input-agree").hasClass("active")){
                $.alert('您尚未接受[中民超级会员平台服务协议]');
                return;
            }

            $registerBtn.attr("value","注册中");
            $registerBtn.css("background-color","#ccc");
            /** 4 向后台发送注册请求 */
            $.ajax({
                type: 'post',
                url: registerUrl,
                data: param,
                dataType: 'json',
                async: false,
                success: function (results) {
                	$registerBtn.css("background-color",'#2B8FEA');
                    var errormsg = "";
                    if (results.code=="0000") {
                        /** 跳转至相应页面 */
                        $.jumpInfo({
                            title:'注册成功',
                            message:'秒后页面将跳转至[登录页面]',
                            url:'/view/account/login.html',
                            second:10,
                            urlName:'登录页面'
                        });
                        //window.location.href = '/view/login/login.html';
                    } else {
                        /** 后台校验有错误信息时错误信息处理 */
                        $.alert(results.message);
                        //$.alert($.ErrorMsg[errorInfo.message]? $.ErrorMsg[errorInfo.message] : '用户注册失败');
                        $registerBtn.attr("value","立即注册");
                        $registerBtn.css("background-color","#00205b");

                    }
                },
                error: function (error) {
                	$registerBtn.css("background-color",'#2B8FEA');
                    $registerBtn.attr("value","立即注册");
                    $registerBtn.css("background-color","#00205b");
                    console.log("系统错误：" + JSON.stringify(error));
                }
            });
        }else{
        	$registerBtn.css("background-color",'#2e8fea')
        }
    });

    $("#btn-agree").click(function(){
        $("#input-agree")[0].checked=true;
    });

    //效验用户名是否存在
    $("#username").blur(function(){
        var result=validator.element('#username');
        if(!result){
            return;
        }

        var loginName=$(this).val();
        if($.isNullOrBlank(loginName)){
            return;
        }
        //获取动态码
        $.ajax({
            type:"post",
            url:"/api/check/checkLoginName.do",
            data:{
                loginName:loginName,channelCode:"WEB"
            },
            dataType:"json",
            success:function(data){
                if(data.code!="0000"){
                    validator.showErrors({'username':data.message});
                    existName=true;
                }else{
                    existName=false;
                    //validator.resetForm();
                }
            },
            error:function(){
                console.log("效验失败！");
            }
        });
    });

    //效验手机号是否存在
    $("#mobile").blur(function(){
        var mobile=$(this).val();
        if($.isNullOrBlank(mobile)){
            return;
        }
        //获取动态码
        $.ajax({
            type:"post",
            url:"/api/check/checkMobile.do",
            data:{
                mobile:mobile,
            },
            dataType:"json",
            success:function(data){

                if(data.code!="0000"){
                    var errorMessage = data.message;
                    validator.showErrors({'mobile':errorMessage});
                    existPhone=true;
                }else{
                    existPhone=false;
                    //validator.resetForm();
                }
            },
            error:function(){
                console.log("效验失败！");
            }
        });
    });

 var manageid = $.getUrlParam().manageid;
    if(!$.isNullOrBlank(manageid)){
    	$("#manageid").val(manageid);
    	$("#manageid").blur();
    }
})


/** 获取url参数 */
function GetRequest() {
        var url = location.search; //获取url中"?"符后的字串
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for(var i = 0; i < strs.length; i ++) {
                theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
            }
        }
        return theRequest;
}

window.addEventListener('pageshow', function(event) {
    //event.persisted属性为true时，表示当前文档是从往返缓存中获取
    if(event.persisted) location.reload();  
});
