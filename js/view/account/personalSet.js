/**
 * Created by kylezu on 2018/4/24.
 */
var user;
if($.isLogin()){
    user=$.cookie("user");//��ȡcookie������Ϣ
    user = eval('(' + user + ')');
    $(".h3-name").html(user.name);
    $(".h5-phone").html(user.mobile);
    $("#span_mobile").html($.mobileDis(user.mobile));
    $("#span_mail").html(user.email);
}
$(function(){
    if($.isLogin()){//��ȡ���������û���Ϣ
        user = $.getUser();
        $(".h3-name").html(user.name);
        $(".h5-phone").html(user.mobile);
        $("#span_mobile").html($.mobileDis(user.mobile));
        $("#span_mail").html(user.email);
    }else{
        $.goLogin();
    }

    $("#span-changePassword").click(function(){
        window.location="/view/login/forget.html";
    });

    $("#span_mobile").click(function(){
        window.location="/view/myAccount/personalSet/mobile.html";
    });
});