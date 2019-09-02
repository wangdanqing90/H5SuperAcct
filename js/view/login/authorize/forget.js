$(function(){
		var phone = $.getUrlParam().phone
		$('#mobile').val(phone);
		if((phone != '') && (phone != undefined)){
			$('.img_box').removeClass('hide')
			$('.img_box').show();
			$('.div-btn').removeAttr("disabled");
		}
		$('#mobile').bind('input', function(){
			var regPhone =  /^1[3456789]\d{9}$/;
			if(regPhone.test(this.value) && this.value.length > 0){
				$('.img_box').removeClass('hide')
				$('.img_box').show();
				$('.div-btn').removeAttr("disabled");
			}else{
				$('.img_box').hide();
				$('.div-btn').attr("disabled", "disabled");
			}
		})
		$('.div-btn').click(function(){
			var phone = $('#mobile').val();
			window.location.href = "forgetsub.html?phone="+ phone
		})
})