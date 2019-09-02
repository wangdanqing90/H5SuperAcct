/**
 * 问卷调查页面相关数据
 * Created by Yilia on 2018/4/19.
 */
$(function(){
    //解绑财富小i弹出层的高为当前窗口的高度
    console.log($(document).height())
    $(".noLogin2").css("height",$(document).height()-44);

    //客户经理信息获取
    $.ajax({
        type:"get",
        url:"",
        data:{},
        dataType:"json",
        success:function(data){
            if(data&&data.length>0){
            }else{

            }
        }
    });

    //点击解除绑定弹出确认框
    $("#unbind").on("click", function(){
        $("#fdc").css("display",'block');
    });
})

//点击关闭弹出层
function closeTip(){
    $("#fdc").css("display",'none');
}

//manager.html-->弹出层-->解绑客服经理
function confirmUnbing(){
    window.location.href = '/view/account/propertyManager.html?'+'fromManager';
    //$.ajax({
    //    type:"post",
    //    url:"",
    //    data:{},
    //    dataType:"json",
    //    success:function(data){
    //        if(data&&data.length>0){
    //            //解绑客服经理成功之后跳转到未绑定客户经理页面
    //            window.location.href = '/view/account/manager.html?'+'fromManager';
    //        }else{
    //            $.alert("msg")
    //        }
    //    }
    //});
}