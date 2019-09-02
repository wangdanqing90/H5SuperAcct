/**
 *问卷调查
 * Created by Yilia on 2018/4/20.
 */

var questionsLength=0;

//获取用户信息
var user = $.getUser();
var userId = user.id;
console.log(userId)

$(function(){
    //
    console.log($(document).height())
    $(".noLogin2").css("height",$(document).height()-44);

    $(".question .answer").find("li").on("click", function(){
        $(this).addClass("checked_item").siblings().removeClass("checked_item");
    });


    /** 获取问题列表,并填充问题信息 */
    var questions = null;

    //console.log(getQuestionnaireInfo('/api/v2/survey'));
    var questionsArr = getQuestionnaireInfo('/api/v2/survey');
    var questionnaireInfo = questionsArr[0];
    if(questionnaireInfo.questions)  questions = questionnaireInfo.questions;
    /** 向页面填充数据 */
    if(questions!=null&&questions!=undefined){
        questionsLength=questions.length;
        $(".question-select").empty();
        for(var i=0;i<questions.length;i++){
            var i_num=i+1;
            if(i==0){
                $(".question-select").append('<div id="div_question'+i_num+'" class="uhide ushow" order="'+i_num+'">'
                    +'<h3>'+questions[i].content+'</h3>'
                    +'<ul class="answer" id="ul_answer'+i_num+'"></ul></div>');
            }else{
                $(".question-select").append('<div id="div_question'+i_num+'" class="uhide"  order="'+i_num+'">'
                    +'<h3>'+questions[i].content+'</h3>'
                    +'<ul class="answer" id="ul_answer'+i_num+'"></ul></div>');
            }
            for(var j=0;j<questions[i].choices.length;j++){
                $('#ul_answer'+i_num+'').append('<li class="question-item" score='+questions[i].choices[j].score+' data-value='+questions[i].choices[j].value+'>'+questions[i].choices[j].content+'</li>');
            }
        }
        $(".question-select").append('<div class="go-assessment"><p class="question-pre p2" style="display:none" id="a_last" onclick="preQuestion()">上一题</p>' +
            '<p class="p1 bg-grey" id="a_next" onclick="nextQuestion()">下一题</p><p class="question-next p2" style="display:none" id="a_submit">提交评估</p></div>');
    }else{
        $.alert("获取问题列表失败！");
    }

    $(".question .answer").find("li").on("click", function(){
        $(this).addClass("checked_item").siblings().removeClass("checked_item");
        $("#a_next").addClass('bg-checked').removeClass('bg-grey bg-grey2');

    });


    /** 提交答题答案操作,因当前页面业务模型尚未整理清楚,该部分功能后续添加*/
    var $a_submit = $('#a_submit');
    $a_submit.click(function(){
        /** 后台参数 */
        var param = {};
        //答题答案,分数,评分级别,surveyId
        var answerInfo = submitQuestion();
        param.content = JSON.stringify(answerInfo.answerValues);
        console.log("获得所有选项: " + param.content);
        param.score = answerInfo.score;
        param.rank = computeScoreLevel(param.score);
        param.surveyId = questionnaireInfo.id;
        //请求url
        var submitUrl = '/api/v2/user/MYSELF/surveyFilling';
        $.ajax({
            type:'post',
            url:submitUrl,
            data:param,
            async:false,
            dataType:'json',
            success:function(results){
                if(results.success){
                    $.alert('问卷答题提交成功',null,function(){
                        console.log("成功")
                        //刷新用户session中用户答题信息
                        //getUserSurvyInfo();
                        window.location.href = '/view/account/result.html';
                        //loadHtml('','/view/account/result.html');
                    });
                }else{
                    $.alert('问卷答题提交失败');
                }
            },
            error:function(error){
                console.log('问卷答题提交处理出现错误...');
            }
        });
    });

})

/**
 * 方法名称:nextQuestion
 * 方法描述:展示下一个问题
 */
function nextQuestion(){
    var currentQuestion=$(".ushow").attr("order");
    if(currentQuestion<questionsLength){
        var nextQusetion= parseInt(currentQuestion) +1;
        if($("#ul_answer"+currentQuestion).find(".checked_item").length!=0){
            $("#a_last").css("display","block");
            $("#a_next").addClass("question-next");
            $(".uhide").removeClass("ushow");
            $("#div_question"+nextQusetion).addClass("ushow");
            $("#span_q_index").text(nextQusetion);
            if(nextQusetion==questionsLength){
                $("#a_submit").css("display","block");
                $("#a_next").css("display","none");
            }
        }else{
            $.alert("请选择答案！");
        }
    }else{
        if($("#ul_answer"+currentQuestion).find(".checked_item").length!=0){
            $("#a_submit").css("display","block");
            $("#a_next").css("display","none");
        }else{
            $.alert("请选择答案！");
        }
    }
}

/**
 * 方法名称:preQuestion
 * 方法描述:展示上一个问题
*/
function preQuestion(){
    var currentQuestion=$(".ushow").attr("order");

    var lastQusetion= parseInt(currentQuestion) -1;
    if(lastQusetion == 0)return;
    $("#a_next").css("display","block");
    $("#a_next").addClass("bg-checked");
    $("#a_submit").css("display","none");
    $(".uhide").removeClass("ushow");
    $("#div_question"+lastQusetion).addClass("ushow");
    $("#span_q_index").text(lastQusetion);
    if(lastQusetion==1){
        $("#a_last").css("display","none");
        $("#a_next").addClass("bg-grey").removeClass("question-next bg-checked");
    }
}
/**
 * 获取评估问题列表
 * */
function getQuestionnaireInfo(url){
    var retValue = null;
    $.ajax({
        type:'get',
        url:url,
        dataType:'json',
        async:false,
        success: function (results) {
            retValue = results;
        },
        error: function (error) {
            console.log('加载数据失败...');
        }
    });
    return retValue;
}

/**
 * 方法名称:submitQuestion
 * 方法描述:获取所答问题的答案信息
 */
function submitQuestion(){
    var currentQuestion=$(".ushow").attr("order");
    if($("#ul_answer"+currentQuestion).find(".checked_item").length!=0){
        var retValue = {};
        answerScores=new Array();
        answerValues=new Array();
        for(var i=1;i<=questionsLength;i++){
            answerScores.push($("#ul_answer"+i).find(".checked_item").attr("score"));
            answerValues.push($("#ul_answer"+i).find(".checked_item").data('value'));
        }

        retValue.score = computeScore(answerScores);
        retValue.answerValues = answerValues;
        console.log(retValue);
        return retValue;
    }else{
        $.alert("请选择答案！");
    }
}
/**
 * 方法名称:computeScore
 * 方法描述:计算得分
 * @author: zhaoxinbo
 * @param scoreArray 分数统计数组
 * @returns {number} 返回总分数
 * @date 2015-09-21 16:54
 */
function computeScore(scoreArray){
    var retValue = 0;
    for(var i = 0;i < scoreArray.length; i++)
        retValue += Number(scoreArray[i]);
    return retValue;
}
/**
 * 方法名称:computeScoreLevel
 * 方法描述:依据得分确定用户风险级别
 * @author:zhaoxinbo
 * @param score 得分
 * @returns {string} 用户风险级别
 * @date 2015-09-21 17:13
 */
function computeScoreLevel(score){
    var rank = '';
    if(Number(score)<=20){
        rank="LOW";
    }else if(Number(score)>=21 && Number(score)<=45){
        rank="LOW_MEDIUM";
    }else if(Number(score)>=46 && Number(score)<=70){
        rank="MEDIUM";
    }else if(Number(score)>=71 && Number(score)<=85){
        rank="MEDIUM_HIGH";
    }else if(Number(score)>=86){
        rank="HIGH";
    }
    return rank;
}
