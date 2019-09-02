/**
 * Created by kylezu on 2018/5/2.
 */
var user;
if($.isLogin()){
    user=$.cookie("user");//获取cookie保存信息
    user = eval('(' + user + ')');
    $(".h3-mobile").html($.mobileDis(user.mobile));
}else{
    $.goLogin();
}