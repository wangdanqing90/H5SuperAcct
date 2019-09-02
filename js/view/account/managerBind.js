/**
 * Created by Yilia on 2018/4/26.
 * 已有客户经理输入绑定
 */

var access_token = $.cookie('ccat');
var user = $.getUser();
var userId = user.id;

$(function(){

    //console.log(access_token,user,userId);

    //获取输入的客户经理号的长度--根据长度改变确定按钮样式及清空图标的显示与隐藏
    $('#inputNumber').bind('input propertychange', function() {
        console.log($(this).val().length)
        if($(this).val().length >0){
            $('#clear').addClass('clear-btn');
            $("#confirm").removeClass('grey').addClass('white');
            $("#confirm").bind("click",confirmBtn);
            //$("#confirm").attr("disabled",false);
            //$("#confirm").attr('onclick','confirmBtn()')
        }else{
            $('#clear').removeClass('clear-btn');
            $("#confirm").removeClass('white').addClass('grey');
            $("#confirm").unbind("click");
            //$("#confirm").attr("disabled",true);
            //$("#confirm").removeAttr("onClick");
        }
    });

    //点击图标清除输入的内容
    $("#clear").on("click", function(){
        $('#inputNumber').val('');
        $('#clear').removeClass('clear-btn');
        $("#confirm").removeClass('white').addClass('grey');
        $("#confirm").unbind("click");
        //$("#confirm").attr("disabled",true);
        //$("#confirm").removeAttr("onClick");
    });

})

//点击头部
function confirmBtn(){
    window.location.href = '/view/account/manager.html';
    //$.alert('确定');
}