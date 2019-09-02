/**
 * Created by kylezu on 2018/5/2.
 */
var user;
if(!$.isLogin()){
   $.goLogin();
}
user=$.cookie("user");
user = eval('(' + user + ')');
var userId = user.id;
var userMobile=user.mobile;
var access_token = $.cookie('ccat');
var currentStep=1;
$.session = {};
var twourl = '';
var dataobj = '';

//绑定卡
var cardobjs = {
    oldMobile: $(".cardnummobile").val(),
    password: $(".cardpassword").val(),
    certNo: $(".cardidcard").val(),
    certType:  $(".cardselect_cert").val()
};
var idcardUrl = '/api/v2/users/changeMobileByCard/'+userId;

//没有绑卡
var nocardobj = {
    password:  $(".nocardpass").val(),
    oldMobile: $(".nocardmobile").val()
};
var nocardUrl = '/api/v2/users/checkOriginalMobile/'+userId;

var judge = "";

function selectCertType(bank){
    $("#certType").val(bank);
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

//判断用户是否绑卡
function VerBindCard(){
    var cardurl = "/api/v2/users/checkBindCard/"+userId;
    $.ajax({
        type:"get",
        url: cardurl,
        dataType:"json",
        success:function(data){
            if(data.data == "非绑卡用户"){
                judge = "非绑卡用户";
                $(".nocard").removeClass("hidden");
                $(".havecard").addClass("hidden");
            }else{
                judge = "绑卡用户";
                $(".havecard").removeClass("hidden");
                $(".nocard").addClass("hidden");
            }
        },
        error:function(){
            console.log("系统错误");
        }
    });
};
VerBindCard();

//页面元素校验规则第一步（客户未绑卡）
var validator = $("#rechargeFormOne").validate({
    errorElement: 'div',
    errorClass: 'help-block',
    focusInvalid: false,
    rules: {
        mobile: { required: true,rangelength:[11,11]},
        oldpassword: {  required: true}
    },
    messages: {
        mobile: { required: "请输入手机号",rangelength:"手机号码必须为11位"},
        oldpassword: { required: "请输入登录密码"}
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


//页面元素校验规则第一步(当有身份证号码)
//验证身份证号码
$.validator.addMethod("correctIdcard",function(value,element){
    return $.validateId(value);
});
$.validator.addMethod("correctId",function(value,element){
    return $.validateId(value);
});

var validatorMobile = $("#rechargeFormOneIdcard").validate({
    errorElement: 'div',
    errorClass: 'help-block',
    focusInvalid: false,
    rules: {
        nummobile: { required: true,rangelength:[11,11]},
        name: {  required: true},
        idcard: {required: true},
        certType: { required: true},
        password: {required: true}
    },
    messages: {
        nummobile: { required: "请输入手机号",rangelength:"手机号码必须为11位"},
        name: { required: "请填写真实姓名"},
        idcard:{required: "请填写证件号"},
        certType: { required: "请选择证件类型"},
        password:{ required: "请输入登录密码"}
    },
    highlight: function (e) {
        $(e).closest('.form-box').removeClass('has-info').addClass('has-error');
    },
    success: function (e) {
        $(e).closest('.form-box').removeClass('has-error');
        $(e).remove();
    },
    errorPlacement: function (error, element) {
        if(element.is($("#nummobile")) || element.is($("#name")) || element.is($("#idcard")) || element.is($("#certType")) || element.is($("#password"))){
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

var mobileCodeBtn = $("#mobileCodeBtn");
var mobileCodeBtnTwo = $("#mobileCodeBtnTwo");
var sendCount = 0;

$("#gainSmsCodeBtn").click(function(){
    sendCount++;
    var flag = sendCount%2?"00":"01";
    sendCode(flag);
});

$("#mobileCodeBtnTwo").click(function(){
    if($("#newmobile").val()==""){
        validatorTwo.showErrors({'newmobile':'请输入手机号'});
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


function sendCode(flag){
    var mobile = '';
    var url = '';
    var data = {};

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
        url = "/api/v2/users/sendCaptchaWithImg?captcha_token="+ results.token + '&captcha_answer=' + imgYzm;
        data = {
            mobile:mobile,
            smsFlag:flag
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
            if(second <=0 ){//结束
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

//第一步验证是否绑卡走两个接口
function changeMobileStep(){
    var number='';
    if(validatorMobile.form()) {
        $.ajax({
            url: twourl,
            dataType: 'json',
            type: 'post',
            data: dataobj,
            async: false,
            success: function (data) {
                var num = parseInt(data.data);
                if (data.success === true) {
                    if(num >= 5){
                        $.alert('今天输错五次，今日不能修改。' );
                        $('#nextStep').attr('disabled',"true").css("background-color","#ccc");
                        return false;
                    }

                    if (validator.form() || validatorMobile.form()) {
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
                }else if(data.success === false){
                    switch(num){
                        case 1:
                            $.alert(data.error[0].message+',您今日还有4次修改机会。');
                            break;
                        case 2:
                            $.alert(data.error[0].message+',您今日还有3次修改机会。');
                            break;
                        case 3:
                            $.alert(data.error[0].message+',您今日还有2次修改机会。' );
                            break;
                        case 4:
                            $.alert(data.error[0].message+',您今日还有1次修改机会。' );
                            break;
                        default:
                            $.alert(data.error[0].message+',今天输错五次，今日不能修改。' );
                            $('#nextStep').attr('disabled',"true").css("background-color","#ccc");

                    }
                }
            },
            error: function (e) {
                console.log("error:" + e);
                setCheckCode();
            }
        });
    }
};

$("#nextStep").click(function(){
    if(judge == "绑卡用户"){
        cardobjs = {
            oldMobile: $(".cardnummobile").val(),
            password: $(".cardpassword").val(),
            certNo: $(".cardidcard").val(),
            certType:  $(".cardselect_cert").val(),
            name: $("#name").val(),
            captcha_token:$.session.token
        };
        twourl = idcardUrl;
        dataobj = cardobjs;
    }else if(judge == "非绑卡用户"){
        nocardobj = {
            password:  $(".nocardpass").val(),
            oldMobile: $(".nocardmobile").val(),
        };
        twourl = nocardUrl;
        dataobj = nocardobj;
    }

    if(currentStep == 1){
        if(validator.form()){
            changeMobileStep();
        }

    }else if(currentStep==2){
        setCheckCode();
        if(!validatorTwo.form()){
            return false;
        }

        if(validatorTwo.form()){
            var newMobile = $(".newmobile").val();
            var imgYzm = $("#captcha").val();
            var oldMobile  = user.mobile;
            var newYzm = $(".newyzm").val();
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

//第三步跳转
function changeThree(){
    var second = 10;
    var newsetMobile = $("#newmobile").val();
    $(".span-phone").html(newsetMobile);
    var codeThreeInterval = setInterval(function(){
        $("#tensecond").html(--second);
        if(second == 0){
            clearInterval(codeThreeInterval);
            window.location.href = "/view/account/account.html?currentPage=home";
        }
    },1000);

    $("#immediately").click(function(){
        window.location.href = "/view/account/account.html?currentPage=home";
    });
};

