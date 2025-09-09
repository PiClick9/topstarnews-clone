$(document).ready(function(){
	var $wrapBody = $("#user-wrap") 
		, $fontsOption = $wrapBody.find(".fonts-option")
		, $fontsBtn = $fontsOption.find(".fonts-btn")
		, $fontsPanel = $fontsOption.find(".fonts-option-panel");
	
	
	// 폰트크기
	$fontsBtn.on({
		click: function(){
			if($fontsPanel.css("display") == "block") {
				$fontsPanel.hide();
				$fontsBtn.removeClass("active");
			} else {
				$fontsPanel.show();
				$fontsBtn.addClass("active");
			}
		}
	});
	
	// 기사본문 폰트사이즈 이벤트 new 
	$('#article-view').on('click', '.fontsise-btn', function(e){
		var changeType  = $(this).val();
		var newFontSize = nowFontSize = get_article_fontsize();
		if(changeType == "up") 			newFontSize = parseInt(nowFontSize) + 1;
		else if(changeType == "down") 	newFontSize = parseInt(nowFontSize) - 1;
		if(newFontSize < 15 || newFontSize > 20) newFontSize = nowFontSize; 
		setCookie("article-view-page-fontsize", newFontSize, 30);
		change_article_fontsize(newFontSize);
	});
	
	// 기사본문 폰트사이즈 이벤트 old 호환
	$('.article-view-header, #article-header-title').on('click', '.fontsize-radio', function(e){
		var newFontSize = $(this).val();
		setCookie("article-view-page-fontsize", newFontSize, 30);
		change_article_fontsize(newFontSize);
	});
	
	
	// 폰트클래스 변경
	function change_article_fontsize(fontsize) {
		$('.view-page').removeClass('font-size15 font-size16 font-size17 font-size18 font-size19 font-size20').addClass('font-size'+fontsize);
	}
	
	// 쿠키가져오기 
	function get_article_fontsize() {
		var cookieFontsize = getCookie("article-view-page-fontsize");
		if(cookieFontsize == "") cookieFontsize = "20";
		return cookieFontsize;
	}
	
	function init_article_fontsize() {
		change_article_fontsize(get_article_fontsize());
	}
	
	/* 초기 실행 */ 
	init_article_fontsize();
});

/***
after, append, before 등 HTML 삽입시 script 링크는 자체적으로 ajax 호출을 시도함
이때 ajax options cache=false가 되어 캐시가 안되니 옵션을 바꾸어 줌(banner로 한정하여 다른곳에 영향을 줄임)
https://api.jquery.com/jQuery.ajaxPrefilter/
***/
$.ajaxPrefilter(function(options, originalOptions, jqXHR){
	var o=options, oo=originalOptions;
	if(o.url.indexOf("/bannerpop/uploads/")>0 && oo.async===false && oo.dataType=="script" && o.dataType==oo.dataType) options.cache=true;
});