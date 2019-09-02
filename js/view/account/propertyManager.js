/**
 * Created by Yilia on 2018/4/25.
 * 我的客户经理
 */

var access_token = $.cookie('ccat');
var user = $.getUser();
var userId = user.id;

$(function(){

    //console.log(access_token,user,userId);
    $("#headName").text("我的客户经理");

    //getUrl.split("?")[1]存在并且 == 'fromManager'时成功解除客户经理的绑定，显示重新绑定界面
    var getUrl = window.location.search;
    if(getUrl.split("?")[1] || getUrl.split("?")[1] == 'fromManager'){
        console.log(getUrl.split("?")[1]);
        $("#unbindShow").removeClass('uhide').addClass('ushow');
        $("#bindShow").removeClass('ushow').addClass('uhide');
    }else{
        //根据接口给的状态判断是否已绑定显示相应的内容
    }

    //隐藏弹窗
    $('#closeTip').on('click', function () {
        $("#fdc").css('display','none');
    });
    //显示弹窗
    $("#chooseXiaoi").on('click',function (){
        $("#fdc").css('display','block');
    })
})

//确认绑定财富小i
function confirmUnbind(){
    //成功后到绑定的客户经理的详情页
    window.location.href = '/view/account/manager.html';
}
//点击输入客户经理号到输入绑定页面
function inputManagerNumber(){
    $.alert('接口待调')
    //$.ajax({
    //    type:"get",
    //    url:"",
    //    data:{},
    //    dataType:"json",
    //    success:function(data){
    //        if(data&&data.length>0){
    //
                window.location.href = '/view/account/managerBind.html';
    //        }else{
    //            $.alert('msg')
    //        }
    //    }
    //});

}

function backClick(){
    window.history.back(-1);
}
