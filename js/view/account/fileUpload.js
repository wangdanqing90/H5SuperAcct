/**
 * Created by kylezu on 2018/9/28.
 */
var access_token;
var userId;
var files_num;

if(!$.isLogin()){
    $.goLogin();
}else{
    var user = JSON.parse($.cookie('user'));
    userId = user.userId;
    access_token = user.token;
    files_num=0;
//获取资料
$.ajax({
    type:"post",
    url:"/api/file/fileList.do",
    dataType:"json",
    data:{
        access_token:access_token,
        userId:userId,
    },
    success: function(data) {
        if(data.code == '0000'){
            //  window.open(downloadUrl+code);
            if(!$.isNullOrBlank(data.data)&&data.data.length>0){
                files_num=data.data.length;
                $.each(data.data, function (index, item) {
                    if(item.fileType=="png"||item.fileType=="PNG"||item.fileType=="JPEG"||item.fileType=="jpeg"||item.fileType=="JPG"||item.fileType=="jpg"||item.fileType=="GIF"||item.fileType=="gif"){
                        $("#table-files tbody").append(' <tr><td><img class="img-type" src="'+item.filePath+'"></td><td><div class="div-name">'+item.fileName+'</div></td><td><img aid="'+item.fileId+'" class="img-del" src="/img/close1.png"/></td></tr>');
                    }else{
                        $("#table-files tbody").append(' <tr><td><img class="img-type" src="/img/file.png"></td><td>'+item.fileName+'</td><td><img aid="'+item.fileId+'" class="img-del" src="/img/close1.png"/></td></tr>');
                    }
                });
            }
        }else{
            alert(data.data);
        }

    },error:function(data){
        alert("系统异常，请稍后再试");
    }
});
}
$('#backTo').click(function(){
    window.location.href = "/view/account/myAccount.html";
});

$("#btn-upload").click(function(){
    $("#input-select-file").click();
});

$("#input-select-file").change(function(){
	if($(this)[0].files.length == 0){
		 return;
	}
    if($(this)[0].files.length>10||$(this)[0].files.length+files_num>10 ){
        $(".div-error").html("上传文件数量不能大于10个文件！");
        return;
    }else{
        $(".div-error").empty();
    }

    try{
        var uploadData= new FormData();
        $.each($("#input-select-file")[0].files, function(index, file) {
            uploadData.append("file", file);
            uploadData.append("name", file.name);
            if(file.size>2*1024*1024*10){ //20M限制
                $(".div-error").html("上传文件大小不能大于20M！");
                throw "上传文件大小不能大于20M！";
                return;
            }else{
                $(".div-error").empty();
            }

            var AllImgExt=".jpg|.jpeg|.gif|.bmp|.png|.pdf";
            if(AllImgExt.indexOf(file.type.split("/")[1])==-1||$.isNullOrBlank(file.type)){ //20M限制
                $(".div-error").html("该文件类型不允许上传。请上传 "+AllImgExt+" 类型的文件。");
                throw "该文件类型不允许上传";
                return;
            }else{
                $(".div-error").empty();
            }
        });
    }catch(e){
        return;
    }

    uploadData.append("access_token", access_token);
    uploadData.append("userId", userId);


    $.ajax({
        url: '/api/file/fileUpload.do',
        data: uploadData,
        processData: false,
        contentType: false,
        type: 'POST',
        dataType:"json",
        success: function(data) {
            if(data.code=="0000"){
                if(!$.isNullOrBlank(data.data)){
                    files_num++;
                    item=data.data;
                    if(item.fileType=="png"||item.fileType=="PNG"||item.fileType=="JPEG"||item.fileType=="jpeg"||item.fileType=="JPG"||item.fileType=="jpg"||item.fileType=="GIF"||item.fileType=="gif"){
                        $("#table-files tbody").append(' <tr><td><img class="img-type" src="'+item.filePath+'"></td><td><div class="div-name">'+item.fileName+'</div></td><td><img aid="'+item.fileId+'" class="img-del" src="/img/close1.png"/></td></tr>');
                    }else{
                        $("#table-files tbody").append(' <tr><td><img class="img-type" src="/img/file.png"></td><td>'+item.fileName+'</td><td><img aid="'+item.fileId+'" class="img-del" src="/img/close1.png"/></td></tr>');
                    }
                }
            }else{
                alert(data.message);
            }

        },error:function(data){
            alert("上传失败，请重试！最多只能上传10个文件。");
        }
    });
    //$("#input-select-file").ajaxSubmit({
    //    success: function (data) {
    //        alert(data.data);
    //        $.each($("#input-select-file")[0].files, function (index, item) {
    //            console.log(item.name);
    //            if(item.type.indexOf("image")>-1){
    //                $("#table-files tbody").append(' <tr><td><img class="img-type" src="/img/icon-img.png"></td><td>'+item.name+'</td><td><img class="img-del" src="/img/del.png"/></td></tr>');
    //            }else{
    //                $("#table-files tbody").append(' <tr><td><img class="img-type" src="/img/icon-pdf.png"></td><td>'+item.name+'</td><td><img class="img-del" src="/img/del.png"/></td></tr>');
    //            }
    //        });
    //    },
    //    error: function (error) { alert(error); },
    //    url: '/api/v2/user/uploadAssertCertificate/'+user.id+'/?access_token='+token,
    //    type: "post",
    //    dataType: "json"
    //});





});


$(".table").on("click"," .img-del",function(){
    var aid=$(this).attr("aid");
    var img=$(this);
    $.confirm("确定删除此文件吗?","提示",function(v){
        if(v=="ok") {
            $.ajax({
                url: '/api/file/fileDelete.do',
                type: 'POST',
                dataType:'json',
                data:{
                    access_token:access_token,
                    userId:userId,
                    fileId:aid
                },
                success: function(data) {
                    if(data.code == "0000"){
                        img.parent().parent().remove();
                        files_num--;
                    }else{
                        alert(data.message);
                    }

                },error:function(data){
                    alert("系统异常，请稍后再试");
                }
            });
        }
    },"取消删除","确定删除");
});