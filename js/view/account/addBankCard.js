var validator;
$.session = {};
var user = $.getUser();
var access_token = $.cookie('ccat');
var userId = user.id;
var firstBindQuery;
$(function () {	
	setCheckCode();
	
	//获取银行卡列表
    var banks= $.queryBanks();
    $("#bankValue").append('<option data-icon="img/china_bank.jpg" value="-1">请选择银行</option>');
    for(var bank in banks){
        $("#bankValue").append('<option data-icon="img/china_bank.jpg" value="'+bank+'">'+banks[bank]+'</option>');
    }
	

    firstBindQuery = $.checkFirstBindCard(user);
    /**  查看用户之前是否有过绑卡记录,如果有则设置各个元素的值 */
    if(firstBindQuery && !firstBindQuery.flag){
        var certType = user.certType;
        var idNumber = user.idNumber; //证件号码
        var userRealName = user.name ? user.name : '';
        var certOptions = $('#select_cert');
        var certOption = certOptions.getSelectedOption(certType);
        certOption.select = true;

        /** 设置各元素信息 */
        $("#username").val($.disFirstNameChar(userRealName)); //用户名
        certOptions.val(certType); // 证件类型
        $('#certType').val(certOption.text); //证件名称
        $('#select_cert').css("background-color","#eee");
        $('#idNo').val($.disIdNo(idNumber));

        /** 设置对应属性不可编辑 */
        $("#username").attr('disabled',true);
        $('#idNo').attr('disabled',true);
        certOptions.attr('disabled',true);
        $('#certType').attr('disabled',true);
    }
    /**如果用户第二次绑卡则把用户的姓名，身份证信息等自动填写到相应信息框中 end */


   //初始化省市
    fundCity();
    
    /**获取短信动态码*/
    var btnSmg = $('.btn-smg');
    var sendCount = 0;
    $('#mobileCodeBtn').click(function() {
        sendCount++;
        var flag = sendCount%2?"00":"01";
        getMobielCode(flag);
    });
    $('#gainVoiceCodeBtn').click(function() {
        getMobielCode("03");
    });
    
    
    function getMobielCode(flag) {
        if(!validator.element($("#mobile"))){
            return false;
        }
        if(!validator.element($("#captcha"))){
            return false;
        }
        btnSmg.attr("disabled","disabled");
        var url = '/api/v2/smsCaptchaByMobile';

        var mobile=$('#mobile').val();
        var captcha = $('#captcha').val();

        var url = '/api/v2/smsCaptchaByToken?captcha_token='+ results.token + '&captcha_answer=' + captcha;
        $.ajax({
            url:url,
            contentType: "application/x-www-form-urlencoded",
            data: {
                mobile:mobile,
                smsFlag:flag,
                smsType:"NOTIFICATION_CREDITMARKET_BINDCARD"
            },
            dataType: 'json',
            type: 'POST',
            success: function(data) {
                if(data.success){
                    interval();
                }else{
                    //自己定义吧
                    var errorInfo = data.error[0];
                    var errorMessage = $.ErrorMsg[errorInfo.message];
                    btnSmg.removeAttr("disabled");
                    $.alert(errorMessage?errorMessage:errorInfo.message);

                }

            }
        });
    }
    
    var btnSmgContent = btnSmg.html();
    function interval(){
        var second = 120;
        $("#mobile").attr("readonly","readonly");
        btnSmg.html(second+"秒后重新发送");
        var codeInterval = setInterval(function(){
            btnSmg.html((--second)+"秒后重新发送");
            if(second<0){//结束
                btnSmg.removeAttr("disabled");
                btnSmg.html(btnSmgContent);
                $("#mobile").removeAttr("readonly");
                clearInterval(codeInterval);

            }
        },1000);
    }

    $('#backTo').click(function(){
        window.location.href = "/view/account/index.html";
    });
 	
  	$.validator.addMethod("correctMobile",function(value,element){
        return $.isNumber(value);
    });

    $.validator.addMethod("correctId",function(value,element){
        var idType = $("#certificateTypeValue").val();
        if(idType=="01"){
            return $.validateId(value);
        }
        else{//其余无需校验
            return true;
        }
    });

    $.validator.addMethod("checkBankType",function(value,element){
        return(value && value != "开户银行");
    });

    $.validator.addMethod("checkCertType",function(value,element){
        return(value && value != "证件类型");
    });

    validator = $('#creator').validate({
        errorElement: 'div',
        errorClass: 'help-block',
        focusInvalid: false,
        rules: {
            username: { required: true},
            certType:{required: true,checkCertType:true},
            idcard:{required: true, correctId:true},
            bankname: { required: true,checkBankType:true},
            cardNumber: { required: true,correctMobile:true},
            mobile: { required: true,rangelength:[11,11],correctMobile:true},
            verifyCode: { required: true, rangelength:[6,6]},
            captcha: { required: true, rangelength:[5,5]}
        },
        messages: {
            username: { required: "请填写真实姓名"},
            certType: { required: "请选择证件类型",checkBankType:"请选择证件类型"},
            idcard:{required: "请填写证件号",correctId:"请输入正确的证件号"},
            bankname: { required: "请选择开户银行",checkBankType:"请选择开户银行"},
            cardNumber: { required: "请填写银行卡号",correctMobile:"银行卡号必须为数字"},
            mobile: { required: "请填写银行预留手机号",rangelength:"手机号码必须为11位",correctMobile:"手机号码必须为数字"},
            verifyCode: { required: "请填写短信验证码",rangelength:"短信验证码必须为6位"},
            captcha: { required: "请填写图形验证码",rangelength:"图形验证码必须为5位"}
        },
        highlight: function (e) {
            $(e).closest('.form-box').removeClass('has-info').addClass('has-error');
        },
        success: function (e) {
            $(e).closest('.form-box').removeClass('has-error');
            $(e).remove();
        },
        errorPlacement: function (error, element) {
            error.insertAfter(element.parent());
        }
    });

});



//选择银行卡回调
function selectBank(){
	
}


/**
 * [bindBankCaed 绑定]
 */
/*var userName, //真是姓名
	idType, //证件类型
	idNo, //证件号码
	bankId, //银行名称
	cityId, //开户省市
	banknumber, //银行卡号
	mobile; //预留手机号
function bindBankCard(){
	userName = $('#userName').val(); //真是姓名
	idType = $('#certificateTypeValue').val(); //证件类型
	idNo = $('#idNo').val(); //证件号码
	bankId = $('#bankValue').val(); //银行名称
	cityId = $('#cityId').val(); //开户省市
	banknumber = $('#banknumber').val(); //银行卡号
	mobile = $('#mobile').val(); //预留手机号
	if (!checkNull(userName)) {
		layer.open({
            content: '请输入姓名',
            skin: 'msg',
            time: 2
        });
        return;
	}
	if (!checkNull(idType)) {
		layer.open({
            content: '请选择证件类型',
            skin: 'msg',
            time: 2
        });
        return;
	}
	if (!checkNull(idNo)) {
		layer.open({
            content: '请输入证件号码',
            skin: 'msg',
            time: 2
        });
        return;
	}
	if (!checkNull(bankId)) {
		layer.open({
            content: '请选择银行名称',
            skin: 'msg',
            time: 2
        });
        return;
	}
	if (!checkNull(cityId)) {
		layer.open({
            content: '请选择开户省市',
            skin: 'msg',
            time: 2
        });
        return;
	}
	if (!checkNull(banknumber)) {
		layer.open({
            content: '请输入银行卡号',
            skin: 'msg',
            time: 2
        });
        return;
	}
	if (!checkNull(mobile)) {
		layer.open({
            content: '请输入预留手机号',
            skin: 'msg',
            time: 2
        });
        return;
	}
	if (!/^[1][0-9]{10}$/.test(mobile)) {
        layer.open({
		    content: "请输入正确的手机号码",
		    skin: 'msg',
		    time: 2
		});
        return;
    }

	//显示短信验证
	$('.cover_bg').show();
}*/


//选择证件类型回调
function selectCertType(certType){
/*    validator.element($("#certType"));*/
}


//查询省市
function fundCity(){
    var url = '/api/v2/chinapay/cities';
    $.ajax({
        url: url,
        contentType: "application/x-www-form-urlencoded",
        dataType: 'json',
        type: 'GET',
        success: function(data) {
            citys = data;
            if(data.length === 0 ){
                return false;
            }
            var select = document.getElementById("province");
            for(var i = 0 ; i < data.length ; i++){
                var valueItem=new Option(data[i].name,data[i].name);
                select.options.add(valueItem);
                if(i==0){
                    selectProvince(data[i].name);
                }
            }
        },
        error: function(e){
            console.log("error:"+e);
        }
    });
}


function selectProvince(province){
    var select = document.getElementById("city");
    select.options.length=0;
    for(var i = 0 ; i < citys.length ; i++){
        if(citys[i].name == province){

            for(var j = 0 ; j < citys[i].citys.length ; j++){
                var city = citys[i].citys[j];
                var valueItem=new Option(city.name,city.name);
                select.options.add(valueItem);
            }
            return ;
        }
    }
}

/**
 * 方法描述:设置图片验证码
 */
var results = {};
function setCheckCode(){
    results = $.getCheckCode(); //获得回调返回值
    $.session.token = results.token;
    if(results.captcha){
        var $captcha = results.captcha;
        $('#checkCode_pic img').attr('src',$captcha);
    }
}
$('#checkCode_pic img').click(function () {
    setCheckCode();
});

/**
 * [confirmBindBankCard 确认绑定银行卡]
 */

/**确认绑卡*/
function confirmCardClick() {
    if(!validator.form()){
          return false;
    }
    
    var verifyCode = $.trim($("#verifyCode").val());//短信验证码
    var userName = $("#username").val();//姓名
    var certType = $('#select_cert option:selected').val();//证件类型
    var idCard = $("#idNo").val();//证件号码    
    var bankName = $('#bankValue option:selected').text();//银行名字
    /** @zhaoxinbo 2016-10-17 13:43 如果用户曾经有过绑卡记录则需要从用户信息对象中重填用户信息 */
        if(firstBindQuery && !firstBindQuery.flag){
            userName = user.name;
            certType = user.certType;
            idCard = user.idNumber;
        }
    var cardNumber = $("#banknumber").val();//银行卡号
    var mobile = $("#mobile").val();//手机号
    var province = $("#province").val();
    var city = $("#city").val();
        
        
	if ($.isNullOrBlank(userName)) {
		layer.open({
            content: '请输入姓名',
            skin: 'msg',
            time: 2
        });
        return;
	}
	if ($.isNullOrBlank(certType)) {
		layer.open({
            content: '请选择证件类型',
            skin: 'msg',
            time: 2
        });
        return;
	}
	if ($.isNullOrBlank(idCard)) {
		layer.open({
            content: '请输入证件号码',
            skin: 'msg',
            time: 2
        });
        return;
	}
	if ($.isNullOrBlank(bankName)) {
		layer.open({
            content: '请选择银行名称',
            skin: 'msg',
            time: 2
        });
        return;
	}

	if ($.isNullOrBlank(cardNumber)) {
		layer.open({
            content: '请输入银行卡号',
            skin: 'msg',
            time: 2
        });
        return;
	}
	if ($.isNullOrBlank(mobile)) {
		layer.open({
            content: '请输入预留手机号',
            skin: 'msg',
            time: 2
        });
        return;
	}
	if (!/^[1][0-9]{10}$/.test(mobile)) {
        layer.open({
		    content: "请输入正确的手机号码",
		    skin: 'msg',
		    time: 2
		});
        return;
    }
        
  
        /** 校验用户是否绑过卡 */      
        var strPara = "bankName="+bankName+"&cardNo="+cardNumber+"&certType="+certType+"&certNo="+idCard+"&userName="
            +userName+"&cardPhone="+mobile+"&province="+province+"&city="+city+"&smsCaptcha="+verifyCode+"&captcha_token="+$.session.token;
        var captcha = $('#captcha').val();//图形验证码
        var newurl='/api/v2/chinapay/backBindCardWithSmsCaptchaNew/'+userId+"/?captcha_token="+ results.token + '&captcha_answer=' + captcha;

        $.ajax({
            url: newurl,
            contentType: "application/x-www-form-urlencoded",
            data: strPara,
            type: 'POST',
            success: function(data) {
                resStr = JSON.stringify(data);
                if(data.success){
                    layer.open({
				    content: "绑定成功",
				    skin: 'msg',
				    time: 2,
				    end: function(){
				    	window.location.href = "/view/account/partials/rechargeSuccess.html?bind=true";
				    }
				});
                return;
 
                }else{
                	 var errorInfo = data.error[0];
                    var errorMessage = $.ErrorMsg[errorInfo.message];
                	 layer.open({
                        content: errorMessage?errorMessage:errorInfo.message,
                        skin: 'msg',
                        time: 2,
                        end: function(){
                            window.location.href = "/view/account/partials/rechargeFail.html?bind=true";
                        }
                   });
                   return;
                }
            }
            })

}



