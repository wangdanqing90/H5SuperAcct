/**
 * Created by kylezu on 2018/5/2.
 */
var user;
user=$.cookie("user");
user = eval('(' + user + ')');
var userId = user.id;
var userMobile=user.mobile;
var access_token = $.cookie('ccat');
var currentStep=1;
$.session = {};


var mobileCodeBtn = $("#mobileCodeBtn");
var mobileCodeBtnTwo = $("#mobileCodeBtnTwo");
var sendCount = 0;

$("#mobileCodeBtn").click(function(){
    if($("#mobile").val()==""){
        validator.showErrors({'mobile':'请输入手机号'});
        return;
    }
    if($("#mobile").val()!=userMobile){
        validator.showErrors({'mobile':'原手机号不正确'});
        return;
    }
    sendCount++;
    var flag = sendCount%2?"00":"01";
    sendCode(flag);
});

$("#mobileCodeBtnTwo").click(function(){
    if($("#newmobile").val()==""){
        validatorTwo.showErrors({'newmobile':'请输入手机号'});
        return;
    }
    if($("#newmobile").val().length!=11){
        validatorTwo.showErrors({'newmobile':'手机号码必须为11位'});
        return;
    }
    if($("#captcha").val()==""){
        validatorTwo.showErrors({'captcha':'图形验证码不能为空'});
        return;
    }
    sendCount++;
    var flag = sendCount%2?"00":"01";
    sendCode(flag);
});

//第一步验证原手机号
$("#nextStep").click(function(){
    if(currentStep == 1){
        var verifyCode = $("#yzm").val();
        var checkSmsPara = "smsCaptcha="+verifyCode+"&smsType=CONFIRM_CREDITMARKET_CHANGEMOBILE";
        if(validator.form()){
            $.ajax({
                url: '/api/v2/checkSMSCaptcha/'+userId+'?access_token='+access_token,
                contentType: "application/x-www-form-urlencoded",
                data: checkSmsPara,
                dataType: 'json',
                type: 'POST'
            }).done(function (data) {
                var resStr = JSON.stringify(data);
                if (!data.success) {
                    $.alert('验证码无效或已经过期！');
                    return false;
                }else{
                    if(validator.form()){
                        //初始化第二步样式
                        $(".step1-body").addClass("hidden");
                        $(".step2-body").removeClass("hidden");
                        $(".step3-body").addClass("hidden");
                        $(".div-step").removeClass("active");
                        $(".step-2").addClass("active");
                        currentStep++;
                        //初始化图形验证码
                        setCheckCode();
                    }
                }
            });
        }
    }else if(currentStep==2){
        if(!validatorTwo.form()){
            return false;
        }

        if(validatorTwo.form()){
            var newMobile = $("#newmobile").val();
            var imgYzm = $("#captcha").val();
            var oldMobile  = user.mobile;
            var newYzm = $("#newyzm").val()
            //调修改手机号接口
            $.ajax({
                url:"/api/v2/users/changeMobile/" + userId,
                dataType: 'json',
                type: 'post',
                data:{
                    userId: userId,
                    newMobile:newMobile,
                    oldMobile:oldMobile,
                    smsCaptcha:newYzm,
                    captcha_token:$.session.token
                },
                async:false,
                success: function(data) {
                    if(data.success){
                        window.location.href = "/view/myAccount/personalSet/index.html";
                    }else{
                        $.alert(data.error[0].message);
                        setCheckCode();
                    }

                },
                error: function(e){
                    console.log("error:"+e);
                    setCheckCode();
                }
            });

        }
    }
});


//页面元素校验规则第一步
var validator = $("#rechargeFormOne").validate({
    errorElement: 'div',
    errorClass: 'help-block',
    focusInvalid: false,
    rules: {
        mobile: { required: true,rangelength:[11,11]},
        yzm: {  required: true, rangelength:[6,6]}
    },
    messages: {
        mobile: { required: "请输入手机号",rangelength:"手机号码必须为11位"},
        yzm: { required: "验证码不能为空" , rangelength:"验证码必须为6位"}
    },
    highlight: function (e) {
        $(e).closest('.form-box').removeClass('has-info').addClass('has-error');
    },
    success: function (e) {
        $(e).closest('.form-box').removeClass('has-error');
        $(e).remove();
    },
    errorPlacement: function (error, element) {
        if(element.is($("#mobile")) || element.is($("#yzm"))){
            var formBox = $(element).closest('.form-box');
            //formBox.removeClass('has-error');
            formBox.find(".help-block").remove();
        }
        error.insertAfter(element.parent());
    }
});

//第二步验证新手机号
var validatorTwo = $("#rechargeFormTwo").validate({
    errorElement: 'div',
    errorClass: 'help-block',
    focusInvalid: false,
    rules: {
        newmobile: { required: true,rangelength:[11,11]},
        captcha: { required: true, rangelength:[5,5]},
        newyzm: {  required: true, rangelength:[6,6]}
    },
    messages: {
        newmobile: { required: "请输入手机号",rangelength:"手机号码必须为11位"},
        captcha: { required: "图形验证码不能为空" , rangelength:"图形验证码必须为5位"},
        newyzm: { required: "验证码不能为空" , rangelength:"验证码必须为6位"}
    },
    highlight: function (e) {
        $(e).closest('.form-box').removeClass('has-info').addClass('has-error');
    },
    success: function (e) {
        $(e).closest('.form-box').removeClass('has-error');
        $(e).remove();
    },
    errorPlacement: function (error, element) {
        if(element.is($("#newmobile")) || element.is($("#newyzm")) || element.is($("#captcha"))){
            var formBox = $(element).closest('.form-box');
            formBox.find(".help-block").remove();
        }
        error.insertAfter(element.parent());
    }
});


function sendCode(flag){
    var mobile = '';
    var url = '';
    var data = {};

    /* $("#novaild").addClass("hidden");*/

    if (currentStep == 1) {
        mobileCodeBtn.attr("disabled","disabled");
        url = "/api/v2/smsCaptchaWithFlag/" + userId;
        data = {
            smsType:"CONFIRM_CREDITMARKET_CHANGEMOBILE",
            smsFlag:flag
        };
    }else if(currentStep == 2){

        var imgYzm = $("#captcha").val();
        mobileCodeBtnTwo.attr("disabled","disabled");
        mobile = $(".newmobile").val();
        url =  '/api/v2/smsCaptchaByToken?captcha_token='+ $.session.token + '&captcha_answer=' + imgYzm;;
        data = {
            mobile:mobile,
            smsFlag:flag,
            smsType:"CONFIRM_CREDITMARKET_CHANGEMOBILE",
        };
    }

    //获取动态码
    $.ajax({
        type:"post",
        url: url,
        data:data,
        dataType:"json",
        success:function(data){
            if(data.success){
                //定时事件
                interval();
            }else{
                mobileCodeBtn.removeAttr("disabled");
                mobileCodeBtnTwo.removeAttr("disabled");
                var errorInfo = data.error[0];
                $.alert($.ErrorMsg[errorInfo.message] ? $.ErrorMsg[errorInfo.message] : '手机动态码发送失败',null,function(){
                    setCheckCode();
                });
            }
        },
        error:function(){
            setCheckCode();
            console.log("系统错误");
        }
    });
}

var btnContent = mobileCodeBtn.html();
var btnContentTwo = mobileCodeBtnTwo.html();
function interval(){
    if(currentStep==1){
        var second = 120;
        mobileCodeBtn.html(second+"秒");
        var codeInterval = setInterval(function(){
            mobileCodeBtn.html((--second)+"秒");
            if(second<=0){//结束
                clearInterval(codeInterval);
                mobileCodeBtn.removeAttr("disabled");
                mobileCodeBtn.html(btnContent);
            }
        },1000);
    }else if(currentStep == 2){
        var second = 120;
        mobileCodeBtnTwo.html(second+"秒");
        var codeInterval = setInterval(function(){
            mobileCodeBtnTwo.html((--second)+"秒");
            if(second <= 0){//结束
                clearInterval(codeInterval);
                mobileCodeBtnTwo.removeAttr("disabled");
                mobileCodeBtnTwo.html(btnContentTwo);
            }
        },1000);
    }
}

/** 1 设置图片验证码 */
var results = {};
function setCheckCode(){
    results = $.getCheckCode(); //获得回调返回值
    $.session.token = results.token;
    if(results.captcha){
        var $captcha = results.captcha;
        $('#checkCode_pic img').attr('src',$captcha);
    }

}

/** 2点击图片自动更换验证码 */
$('#checkCode_pic img').click(function () {
    setCheckCode();
});
