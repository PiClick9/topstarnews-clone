/**************************************************
	COMMENT SCRIPT FILE

	AUTHOR	: DOTI
	FILE	: /fine_home/comment/comment.js
	NOTE	: 댓글 사용을 위한 기본적인 스크립트 페이지

 **************************************************/

var $comment = {

	member_check		: ''											// 회원여부
	, service_code		: ''											// 현재 이용 서비스
	, bbs_table			: ''											// 게시판 이용시 게시판 테이블명
	, list_exc_idxno	: ''											// BEST 댓글 노출로 댓글에 제외할 idxno 번호 ( 콤마(,) 구분)
	, best_container	: $('#comment-list .best-content')				// BEST 댓글 리스트 표시 객체
	, list_container	: $('#comment-list .normal-content')			// 댓글 리스트 표시 객체
	, list_total_count	: $('#comment .comment-count')					// 댓글 총 갯수 표시 객체
	, btn_cmt_more		: $('#comment .btn-comment-more')				// 댓글 더보기 버튼 객체
	, btn_cmt_save		: $('#comment .btn-comment-save')				// 댓글 등록 버튼 객체
	, reveal_delete		: $('#comment-reveal-delete')					// 댓글 삭제 모달 창 객체
	, reveal_modify		: $('#comment-reveal-modify')					// 댓글 수정 모달 창 객체


	// 댓글 설정 불러오기
	, commentConfigSet:function(){
		$.ajax({
			url:'/comment/commentConfig.ajax.php',
			method:'GET',
			data:{service_code:$comment.service_code, bbs_table:$comment.bbs_table},
			dataType:'JSON',
			cache: true,
			success:function(data){
				// config set
				for (var key in data) $comment[key] = data[key];
				console.log('%cCOMMENT :: %c'+$comment.ver+'', 'background:black; color:yellow', 'background:black; color:white;');

				// Best Comment
				if($comment.best_comment[0]) $comment.bestComment($comment.best_comment[1], $comment.best_comment[2]);

				// List Comment
				setTimeout(function(){
					$comment.commentList('load', 1, $comment.default_order_by);
				}, ($comment.best_comment[0])?$comment.load_delay_time:0);	// 베스트 댓글 로딩이 필요한 경우 베스트 댓글 idxno 값을 얻기 위해 지연시킴
			}
			/*
			,error : function(request, status, error) {
				alert("code: "+request.status+"\n"+"message: "+request.responseText+"\n"+"error: "+error);
			}
			*/
		});

		return true;
	}


	// 댓글 갯수 표시
	, TotalCount:function(str){														// 표시 문자
		$comment.list_total_count.text(str);
	}


	// 베스트 댓글 불러오기
	, bestComment:function(num, limit){							// num:답글+추천 숫자 | limit: 1~3 표시
		$.ajax({
			url:'/comment/bestComment.ajax.php',
			method:'GET',
			data:{member_check:$comment.member_check, service_code:$comment.service_code, bbs_table:$comment.bbs_table, parent_idxno:$comment.parent_idxno, num:num, limit:limit},
			dataType:'HTML',
			cache:true,
			success:function(data){
				$comment.best_container.prepend(data);
				$comment.list_exc_idxno = $comment.best_container.find('#list-exc-idxno').val();
			}
		});
	}


	// 댓글 목록 불러오기
	, commentList:function(mode, comment_page, order_by){							// mode:load(갱신) or add(추가) | comment_page:페이징번호 | order_by:I(최신춘) or C(추천순) or R(답글순)
		$.ajax({
			url:'/comment/commentList.ajax.php',
			method:'GET',
			data:{member_check:$comment.member_check, service_code:$comment.service_code, bbs_table:$comment.bbs_table, parent_idxno:$comment.parent_idxno, comment_page:comment_page, order_by:order_by, list_exc_idxno:$comment.list_exc_idxno, mode:mode},
			dataType:'HTML',
			cache:true,
			success:function(data){
				if(mode == 'load') $comment.list_container.html(data);
				else if(mode == 'add') $comment.list_container.append(data);

				$('#comment .btn-comment-orderby').removeClass('secondary').addClass('nd-gray');
				$('#comment .btn-comment-orderby-'+order_by).toggleClass('secondary nd-gray');
			}
		});
	}


	// 답글 목록 불러오기
	, commentSubList:function(reply_parent_idxno, mode){			// reply_parent_idxno:부모댓글번호

		var sub_item = $('#comment #comment-item-'+reply_parent_idxno+'-sub'),
			sub_page = sub_item.find('.comment-sub-page').val(),
			order_by = sub_item.find('.comment-sub-orderby').val();

		if(mode == 'add') sub_page++;
		if(mode == 'input') order_by = 'D';

		$.ajax({
			url:'/comment/commentSubList.ajax.php',
			method:'GET',
			data:{member_check:$comment.member_check, service_code:$comment.service_code, bbs_table:$comment.bbs_table, parent_idxno:$comment.parent_idxno, reply_parent_idxno:reply_parent_idxno, sub_page:sub_page, order_by:order_by, mode:mode},
			dataType:'HTML',
			cache:true,
			success:function(data){
				
				if(mode == 'reload'){
					sub_item.find('.comment-item-sub-body').html(data);
					sub_item.find('.btn-sub-comment-orderby').removeClass('secondary');
					sub_item.find('.btn-sub-comment-orderby-'+order_by).addClass('secondary');
				}

				if(mode == 'input'){
					sub_item.find('.comment-item-sub-body').html(data);
					sub_item.find('.btn-sub-comment-orderby').removeClass('secondary');
					sub_item.find('.btn-sub-comment-orderby-D').addClass('secondary');
					sub_item.find('.comment-sub-orderby').val('D');
				}

				if(mode == 'load'){
					sub_item.find('.comment-item-sub-body').html(data);
					sub_item.find('.btn-sub-comment-orderby').removeClass('secondary');
					sub_item.find('.btn-sub-comment-orderby-A').addClass('secondary');

					if(sub_item.is(':visible') == false){
						if($comment.auto_sub_comment) sub_item.show();
						else sub_item.slideDown();
					} else {
						sub_item.find('.comment-item-sub-body').html('');
						sub_item.find('.comment-sub-page').val(1);
						sub_item.find('.comment-sub-orderby').val('A');
						sub_item.hide();
					}
				}

				if(mode == 'add'){
					sub_item.find('.comment-item-sub-body').append(data);
					sub_item.find('.comment-sub-page').val(sub_page);

					if($comment.auto_sub_comment) sub_item.show();
					else sub_item.slideDown();
				}
			}
		});
	}


	// 댓글 / 답글 더보기 버튼
	, btnMore:function(mode, moreBtn){						// mode:show(보이기) or hide(숨기기) | 더보기 버튼 객체
		if(!moreBtn) moreBtn = $comment.btn_cmt_more;

		if(mode == 'show') moreBtn.html('<div class="more-info"><span>더보기</span></div>').show();
		else if(mode == 'none') moreBtn.hide();
		else if(mode == 'hide') {
			if($comment.more_btn_slow_hide == true){		// 버튼이 서서히 사라지기를 원하는 경우
				moreBtn.html('<div class="more-info-text"><i class="icon-error-o"></i> 더이상 댓글이 존재하지 않습니다</div>');
				setTimeout(function(){
					moreBtn.fadeOut();
					moreBtn.hide();
				}, 2000);				// 디자인 수정 후 오픈
			} else {										// 버튼이 서서히 사라지기를 원하지 않는 경우
				moreBtn.hide();		// 디자인 수정 후 오픈
			}
		}
	}


	// 댓글 쓰기
	, commentWrite:function(f){														// f:폼 그룹

		var writeFormErr = false;

		//// 이름 및 댓글 작성 확인
		if( !f.find('input[name="user_id"]').val() && !f.find('input[name="password"]').val() ){
			f.find('input[name="password"]').focus()
			writeFormErr = '비밀번호를';
		}
		if( !f.find('input[name="name"]').val() ){
			f.find('input[name="name"]').focus()
			writeFormErr = '이름을';
		}
		if( !f.find('textarea[name="content"]').val() ){
			f.find('textarea[name="content"]').focus()
			writeFormErr = '본문을';
		}

		if(writeFormErr){
			$('.recaptcha-view').remove();
			alert('[Error.8] '+writeFormErr+' 바르게 입력하세요.');
			return false;

		}

		//// 캡챠 확인
		if( $comment.captcha_view == 'Y' && $comment.captcha_enable == true && !f.find('input[name="captcha"]').val() ){

			$('.recaptcha-view').remove();

			$.ajax({
				url:'/comment/recaptcha.ajax.php',
				dataType:'HTML',
				cache: false,
				success:function(data){
					f.find('.recaptcha-container').append('<div class="recaptcha-view">'+data+'</div>');
				}
			});

			return false;
		}

		//// 저장
		$.ajax({
			url:'/comment/commentWrite.ajax.php',
			method:'POST',
			data:f.serialize()+'&captcha_view='+$comment.captcha_view,
			dataType:'JSON',
			cache: false,
			success:function(data){
				
				if(data['result'] == true){
					$comment.commentWriteAdd(data['mode'], data['idxno'], data['reply_parent_idxno']);
					if($comment.member_check == 'GUEST') f.find('.name, .password, .comment-content, .nomember-captcha').val('');
					else f.find('.password, .comment-content, .nomember-captcha').val('');
					f.find('.comment-text-cur').text('0');
					$('.recaptcha-view').remove();

					if(data['mode'] == 'sub_input'){
						var cmt_sub_count = ($('#comment-item-'+data['reply_parent_idxno']+' .comment-sub-count').text() == "작성")? 1:Number($('#comment-item-'+data['reply_parent_idxno']+' .comment-sub-count').text()) + 1;
						$('#comment-item-'+data['reply_parent_idxno']+' .comment-sub-count').html('<small>'+cmt_sub_count+'</small>');
					}

				} else if(data['result'] == false) {
					alert(data['msg']);
					f.find('#nomember-captcha').val('');
					$('.recaptcha-view').remove();
				}
			}
		});
	}


	// 댓글 작성 후 추가
	, commentWriteAdd:function(mode, idxno, reply_parent_idxno){					// mode:reply or sub_reply | idxno:댓글번호 | reply_parent_idxno:부모댓글번호
		$.ajax({
			url:'/comment/commentWriteAdd.ajax.php',
			method:'GET',
			data:{member_check:$comment.member_check, service_code:$comment.service_code, bbs_table:$comment.bbs_table, parent_idxno:$comment.parent_idxno, mode:mode, idxno:idxno},
			dataType:'HTML',
			cache: true,
			success:function(data){
				// 댓글 추가
				if(mode == 'input'){
//					addElm = $comment.list_container;
//					addElm.prepend(data);				// 작성 댓글 추가
					$comment.commentList('load', $comment.comment_page, $comment.comment_orderby='I');	// 댓글 불러오기
					$comment.moveScroll($comment.list_container);		// 작성 댓글로 이동
				}

				// 답글 추가
				if(mode == 'sub_input'){
					$comment.commentSubList(reply_parent_idxno, 'input');
					$comment.moveScroll($('#comment #comment-item-'+reply_parent_idxno));		// 작성 댓글로 이동
				}
			}
		});
	}


	// 댓글 수정
	, commentModify:function(f){													// f:폼 그룹
		var result = '';
		$.ajax({
			url:'/comment/commentOption.ajax.php',
			method:'POST',
			data:f.serialize(),
			dataType:'JSON',
			cache: false,
			success:function(data){
				if(data['result'] == 'OK'){
					$('#comment-textbox-'+data['idxno']+' .comment-content-view').html(data['modify_content'].replace(/\n/g,'<br>'));
					$comment.reveal_modify.foundation('close');						// 수정 모달 닫기
					$('.user-delete').hide();
				} else {
					alert(data['msg']);
				}
			}
		});
	}


	// 댓글 삭제
	, commentDelete:function(f){													// f:폼 그룹
		$.ajax({
			url:'/comment/commentOption.ajax.php',
			method:'POST',
			data:f.serialize(),
			dataType:'JSON',
			cache: false,
			success:function(data){
				if(data['result'] == true){
					if(data['mode'] == 'delete') $('#comment-item-'+data['idxno']).slideUp('slow');
					else if(data['mode'] == 'sub-delete'){
						var cmt_sub_count = Number($('#comment-item-'+data['reply_parent_idxno']+' .comment-sub-count').text()) - 1;
						if(cmt_sub_count > 0) $('#comment-item-'+data['reply_parent_idxno']+' .comment-sub-count').html('<small>'+cmt_sub_count+'</small>');
						else $('#comment-item-'+data['reply_parent_idxno']+' .comment-sub-count').html('');
						$('#comment-item-'+data['idxno']).slideUp('slow');
					}

					if(data['total_count']) $comment.TotalCount(data['total_count']);		// 댓글 총 개수 변경

					$comment.reveal_delete.foundation('close');								// 삭제 모달 닫기
				} else {
					alert('비밀번호 확인 후 다시 시도하시기 바랍니다.');
				}
			}
		});
	}
	

	// 댓글 추천/반대
	, commentVote:function(elm, mode, idxno){												// elm:추천/반대 버튼 객체 | mode:vote_up(추천) or vote_down(반대) | idxno:댓글번호
		var commentVoteCheck = false;

		if($comment.comment_vote_check[0] == 'S'){												// 스토리지 방식
			var nowTimestamp	= nowTime = Math.floor(+ new Date() / 1000);
			var voteCheckName	= 'comment_'+$comment.service_code+'_'+idxno;
			var voteCheckTime	= nowTime + ($comment.comment_vote_check[2] * 3600);
//			var voteCheckTime	= nowTime + 10;			// test
			var setCheckData	= [mode,voteCheckTime];
			var getCheckData	= (localStorage[voteCheckName] !== undefined) ? JSON.parse(localStorage.getItem(voteCheckName)) : [];

			if(getCheckData[1]){																	// 스토리지에 값이 존재하면
				if(nowTimestamp < getCheckData[1]){														// 체크시간이 지나지 않았으면
					if($comment.comment_vote_check[1]){														// 추천 해제 활성 시
						if(getCheckData[0] != mode) commentVoteCheck = 'A';										// 추천 상태에서 반대를 할 경우 >> 재추천 경고 문구 표시
						else commentVoteCheck = 'U';															// 추천 상태에서 다시 추천을 할 경우 >> 추천 해제 처리
					} else commentVoteCheck = 'A';															// 추천 해제 비활성 시 >> 재추천 경고 문구 표시
				} else commentVoteCheck = 'Y';															// 체크시간이 지났으면 >> 재추천 실행
			} else commentVoteCheck = 'Y';															// 스토리지에 값이 존재하지 않으면 >> 추천 실행

			if(!$comment.nd_check && $comment.member_nd) commentVoteCheck = 'Y';					// ND 체크안함 설정상 && ND 이면 추천 체크 안함
			if(!$comment.admin_check && $comment.member_check == 'ADMIN') commentVoteCheck = 'Y';	// 관리자 체크안함 설정 상태 && 관리자 이면 추천 체크 안함

		} else if($comment.comment_vote_check[0] == 'C'){										// 쿠키방식
			commentVoteCheck = 'Y';																	// 추천 실행 (PHP에서 체크 처리)
		}

		if(commentVoteCheck != false){
			$.ajax({
				url:'/comment/commentOption.ajax.php',
				method:'POST',
				data:{member_check:$comment.member_check, service_code:$comment.service_code, bbs_table:$comment.bbs_table, list_per_page:$comment.list_per_page, parent_idxno:$comment.parent_idxno, mode:mode, idxno:idxno, vote_check_val:commentVoteCheck},
				dataType:'JSON',
				cache: false,
				success:function(data){
					if(data['result'] == 'OK'){
						if($comment.comment_vote_check[0] == 'S') localStorage.setItem(voteCheckName, JSON.stringify(setCheckData));	// 체크 데이터를 스토리지에 저장
						elm.closest('.user-vote').find('.'+mode+'-off').hide();
						elm.closest('.user-vote').find('.'+mode+'-on .text-vote').text(data['vote_num']);
						elm.closest('.user-vote').find('.'+mode+'-on').slideDown();

					} else if(data['result'] == 'UNSET'){
						if($comment.comment_vote_check[0] == 'S') localStorage.removeItem(voteCheckName);		// 스토리지 제거
	//					alert(data['msg']);
						elm.closest('.user-vote').find('.'+mode+'-on').hide();
						elm.closest('.user-vote').find('.'+mode+'-off .text-vote').text(data['vote_num']);
						elm.closest('.user-vote').find('.'+mode+'-off').slideDown();

					} else if(data['result'] == 'BLOCK') alert(data['msg']);
				}
			});
		}
	}
	

	// 글자수 체크
	, textLength:function(elm){														// elm:글자수 체크할 객체
		var content = elm.val();

		if (content.length > $comment.max_length){
			alert('최대 '+$comment.max_length+'자까지 입력 가능합니다.');
			elm.val(content.substring(0, $comment.max_length));
			elm.closest('form').find('.comment-text-cur').text($comment.max_length);
			elm.height(1).height( elm.prop('scrollHeight')+10 )

			return false;

		} else {
			elm.closest('form').find('.comment-text-cur').text(content.length);
			elm.height(1).height( elm.prop('scrollHeight')+10 )

			return true;
		}
	}


	// 스크롤 이동
	, moveScroll:function(elm, force, sp){								// elm:위치 이동 객체 | force:true(사용) or false(비사용) | sp:이동 속도
		if(!force) force = false;
		if(!sp) sp = 600;

		if($comment.auto_scroll || force){											// $comment.auto_scroll 환경 설정에서 미사용시에도 force가 true 이면 사용
			var topMargin = 0;
			if( $('#sticky-header .titles').is(':visible') == true ) topMargin = $('#sticky-header .titles').height();
			$('html, body').animate({scrollTop : elm.offset().top-topMargin}, sp);
		}
	}


	// 리스트 추천 ON 처리
	, voteViewCheck:function(idxno){
		var nowTimestamp	= nowTime = Math.floor(+ new Date() / 1000);
		var voteCheckTime	= nowTime + ($comment.comment_vote_check[2] * 3600);
		var voteCheckName	= 'comment_'+$comment.service_code+'_'+idxno;
		var getCheckData	= (localStorage[voteCheckName] !== undefined) ? JSON.parse(localStorage.getItem(voteCheckName)) : [];

		if(getCheckData[1] && nowTimestamp < getCheckData[1]){
			$('#comment-item-'+idxno).find('button.'+getCheckData[0]+'-off').hide();
			$('#comment-item-'+idxno).find('button.'+getCheckData[0]+'-on').show();
		}
	}


	// 유저 댓글 정보
	, userCommentInfo:function(user_id){
		$.ajax({
			url:'/comment/userCommentInfo.ajax.php',
			method:'GET',
			data:{user_id:user_id, service_code:$comment.service_code},
			dataType:'HTML',
			cache: true,
			success:function(data){
				$('body').append(data);
				$('#userCommentInfo').show();
			}
		});
	}

}