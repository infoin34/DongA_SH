'use strict';

((exports, $)=>{
	window.isMobile = 'ontouchstart' in window || window.DocumentTouch  && document instanceof DocumentTouch;
	window.isMain = window.isMain || undefined;

    /* 로딩 후 콜백 */  
	function afterLoading(cb){
		window.addEventListener('load', completed, false);
		function completed(){
	 	   cb();
	       window.removeEventListener('load', completed, false);      
	    }
	}

    /* 전체스크롤 막기/풀기 */
	let scrollHeight = 0;
	function bodyScrollBlock(flag){
		if(flag) {
			scrollHeight = ($(window).scrollTop());
			$('html, body').addClass('no-scr');
			$('#wrap').css({
				'margin-top': -(scrollHeight)+'px',
			})
		}else {
			$('html, body').removeAttr('style');
			$('html, body').removeClass('no-scr');
			$('#wrap').css({
				'margin-top': 0
			})
			$('html, body').scrollTop(scrollHeight);
		}
	}
   
    /* 특정 위치로 스크롤 */
	function scrollMove (val, time){
        $('html, body').animate({scrollTop: val}, time || 300);
    }   

	/* animate - 타겟, {바뀔 속성}, 걸리는 시간, 지연 시간, 속도, fn(콜백)  */ 
	function ani(target, aniObj, duration, delay, timing, cd){
        let $target = $(target),
            _delay = delay ? delay : 0,
            _timing = timing ? timing : 'swing',
            _duration = duration ? duration : '300';

        $target.delay(delay).animate(
            aniObj, _duration, _timing, function(){
				if(cd) cd();
			}
        )
    }
	
	/* 팝업 */
    const popup = {
		guideZindex : 1020,
		targetArr : [],
		freezeTop : 0,
		popupObj : {},
		popupSetTimer : null,
		oldHeight : 0,
		open : function(obj) {
			'use strict'
			let $obj = (typeof obj === 'string') ? $(obj) : obj ;

			popup.layerPopupInit($obj);
		},
		layerPopupInit: function(obj) {
			'use strict'
			let $obj = obj,
				$wrapper = $obj.find('.popup-wrap'),
				$closeBtn = $obj.find('.close, .btn-close');

			$.each(popup.targetArr, function(i) {
				if (popup.targetArr[i].attr('data-pop') == $obj.attr('data-pop')) popup.targetArr.splice(i,1);
			})
			popup.targetArr.push($obj);

			popup.guideZindex++;
			$obj.attr('data-pop', popup.guideZindex);
			$obj.css({
				'display': 'block',
				'z-index': popup.guideZindex
			});

			if (popup.targetArr.length == 1) {
				if(!$('html').hasClass('layer-open') ) {
					bodyScrollBlock(true);
				}
			}
			$('html').append($obj);

			$closeBtn.click(function (e) {
				e.preventDefault();
				popup.closePopup(this);
			});

			// layer-popup-fix 클래스를 추가하면 dim 클릭해도 닫히지 않음 
			$obj.on('click', function(e) {				
				if (!$(this).hasClass('layer-popup-fix') && e.target.classList.contains('popup-wrap')) {
					popup.closePopup(this);
				}
			});
		},
		popupCloseAllFn : function() {
			'use strict'
			$.each(popup.targetArr, function(i) {
				popup.closePopup();
			});
		},
		closePopup : function(target) {
			let $target = $(target),
			    $pop = $target.hasClass('layer-popup') ? $target : $target.parents('.layer-popup');
			
			$.each(popup.targetArr, function(i) {
				if (popup.targetArr[i].attr('data-pop') == $pop.attr('data-pop')) {
					popup.targetArr.splice(i,1);
				}
			});
			if (popup.targetArr.length == 0) {
				if( !$('html').hasClass('layer-open') ) {
					bodyScrollBlock(false);
				}
			}			
			$pop.css({ 'display': 'none', 'z-index': 0 });
		},
		confirm : function(obj){
			let btns = '';
			let _ = this;

			if(typeof(obj) == 'string'){
				$('.pop-confirm .confirm-text').html(obj);
			}else{
				$('.pop-confirm .confirm-text').html(obj.text);
			}

			if(obj.cancel) btns += '<a href="#" class="btn-type-c btn-cancel">취소</a>';
			btns += '<a href="#" class="btn-type-b btn-check">확인</a>';

			$('.pop-confirm .btn-wrap').html(btns);

			$('.pop-confirm .btn-check').off('click');
			$('.pop-confirm .btn-check').on('click', function(){
				obj.check && obj.check();
				_.closePopup('.pop-confirm');				
				return false;
			});
			
			$('.pop-confirm .btn-cancel').off('click');
			$('.pop-confirm .btn-cancel').on('click', function(){
				obj.cancel && obj.cancel();
				_.closePopup('.pop-confirm');
				return false;
			});			
			_.open('.pop-confirm');			
		}		
	};


	/* gnb */
	function gnbScr(){
		if($('header').hasClass('nav-open')) return;//전체메뉴
		if(Math.abs(lastScr - currentScr) <= 5) return;

		// 스크롤 최하단으로 갔을때
		if(currentScr + $(window).height() >= $('footer').offset().top + ($('footer').height()*0.8)){
			if(!pageEnd) {
				pageEnd = true;
			}
			if(!$('html').hasClass('scr-bottom')){
				$('html').removeClass('scr-up');
				$('html').removeClass('scr-down');
				$('html').addClass('scr-bottom');
			}			
		}else {						
			$('html').removeClass('scr-bottom');
			if ( currentScr > lastScr ){//아래로				
				if(!$('html').hasClass('scr-down')){
					$('html').removeClass('scr-up');
					$('html').addClass('scr-down');
				}	
			} else{//위로
				if(!$('html').hasClass('scr-up')){
					pageEnd = false;
					$('html').removeClass('scr-down');
					$('html').addClass('scr-up');
				}				
			}
			// 스크롤 0일경우
			if (currentScr <= 0 ){
				$('html').removeClass('scr-down');
				$('html').addClass('scr-up');
			}
		}
	}

	/* 스크롤 css모션 */
	function scrCSSEff(){
		let setScrT = parseInt(currentScr + ($(window).height()*0.75));		
		$('.scr-eff').each(function(i){	
			if(setScrT > $(this).offset().top){											
				if(!$(this).hasClass('scr-eff-active')){
					$(this).addClass('scr-eff-active');					
				}			
			}else{
				if($(this).hasClass('scr-eff-active')) {
					$(this).removeClass('scr-eff-active');
				}
			}
		});
	}

	 /* 바이트 개수 체크 */
	 function byteCheck(target, limit, show){
        let $target = $(target);
        let maxByte = limit ? limit : 1300;
        let txt = $target.val();
        let sz = 0;
        let rleng = 0;

        for(let i = 0; i < txt.length; i++){
            sz = escape(txt.charAt[i]).length > 4 ? sz + 2 : sz++; 
            if(sz <= maxByte) rleng = i+1;     
        }
        if(sz > maxByte){
            $target.val(txt.substr(0, rleng));
            $(show).text(maxByte);
            return;
        }else{
            $(show).text(sz);
        }
        return false;
    }

	/* scroll-motion */
	function plx(obj){
		return new plxActive(obj.target, obj.parent, obj.increment, obj.fn);
	}
	function plxActive(target, parent, increment, fn){
		let _ = this;
		_.$target = $(target);
		_.$parent = parent ? $(parent) : $(target);
		_.increment = increment ? increment : -0.5; // 역방향
		_.delta =  (currentScr - _.$parent.offset().top)/_.$parent.outerHeight();
		let elY = (_.delta*100*_.increment);//퍼센트
		
		//console.log(currentScr, _.$parent.offset().top)
		_.fn = function(){
			_.$target.css('transform', 'translateY('+ elY +'%)');
		}
		
		if(fn) fn(_.delta, _.delta*_.increment);
		else _.fn();
		
		return _
	}

	/* Swiper */
	function swiperSlide(target){
		var swiper = new Swiper(target + ' .swiper-container', {
			slidesPerView: 'auto',
			spaceBetween: 0,
			navigation: {
				nextEl: target + ' .slider-navigation .swiper-button-next',
				prevEl: target + ' .slider-navigation .swiper-button-prev',
			}
		});
		return swiper;
	}

	/* main-spot */ 
	function mainSpot(){
		let $item = $('.spot-item'),
			$stopCv = $('.spot-change'),//바뀔때 큰 커버
			$playing = $item.eq(0),//현재 보이는 박스,
			$durBar,//재생 바,
			initFlag, //처음 재생
			mainSpotSwiper,
		    playingIdx = 0, //현재 보이는 박스 idx,
			visualLength = $item.length,//박스 총갯수
			curDelay = 6,//재생시간
			setToAutoPlayArr = [],//setTimeout - autoplay
			setToBar,//setInterval - bar
			setToStop,//setTimeout - cover
			setToTxt;//setTimeout - spot-text

		let spot = {
			prev : function(target){
				playingIdx--;
				if(playingIdx < 0) playingIdx = visualLength-1;	
				this.active();					
			},
			next : function(target){
				playingIdx++;
				if(playingIdx > visualLength-1) playingIdx = 0;	
				this.active();		
			},
			active: function(){		
				let _ = this;			
				$('.swiper-pagination-bullet-'+ playingIdx).click();
			},
			slideControl: function(did){
				let _ = this;
				let stopTime = 1300;
				$item.removeClass('playing');
				$playing.addClass('playing');	
				$stopCv.attr('class', 'spot-change');
				$stopCv.addClass('color-'+ (playingIdx+1));
				$playing.hasClass('spot-last') && $playing.removeClass('on');	
				
				if(!initFlag){						
					initFlag = true;		
					stopTime = 0;
				}
				
				clearTimeout(setToStop);
				clearTimeout(setToTxt);		
				$stopCv.css('left', -$stopCv.width() +'px');
				$stopCv.stop().animate({
					left: 150 +'vw'
				},
				{	
					duration: stopTime,
					specialEasing: {
					  left: 'linear'
					},
					complete : function(){//커버 지나간 후						
						$playing.hasClass('spot-last') && $playing.addClass('on');	
						if($playing.find('video').length > 0){
							$playing.find('video')[0].play();
						}			
						if($playing.find('video').length > 0 && $playing.find('video')[0].duration){
							curDelay = $playing.find('video')[0].duration;
						}else{
							curDelay = 5;
						}				
						let start = new Date;//시작 시간

						setToBar = setInterval(function(){
							let timePassed = new Date - start,
							progress = timePassed / (curDelay*1000); // 지나간시간/이벤트 진행할시간 = 비율
							$durBar.eq(playingIdx).css('width', progress*100 + '%');
							if(progress > 1) progress = 1;
							if(progress == 1) clearInterval(setToBar);
						}, 50);		

						if($item.length == 1) return;		
						for(let i=0; i < setToAutoPlayArr.length; i++){
							clearTimeout(setToAutoPlayArr[i]);
						}					
						setToAutoPlayArr = [];			
						_.autoplay();   

						setToTxt = setTimeout(function(){
							$playing.find('.spot-text').addClass('on');
						}, 200);
					}
				});
			},
			autoplay: function(init){
				let _ = this;	
				let setT = setTimeout(function(){    	
					_.next();					    				 
				}, curDelay * 1000);
				setToAutoPlayArr.push(setT);
			},
			reset: function(){
				$playing = $item.eq(playingIdx);
				if($playing.find('video').length > 0){
					$playing.find('video')[0].pause();
					$playing.find('video')[0].currentTime = 0;						
				}
				clearInterval(setToBar);		
				$durBar.css('width', 0);
				$('.spot-text').removeClass('on');
				for(let i = 0; i < setToAutoPlayArr.length; i++){
					clearTimeout(setToAutoPlayArr[i]);
				}	
			},
			init :function(){
				$item.eq($item.length-1).addClass('spot-last');
				
				mainSpotSwiper = new Swiper('.main-spot-swiper .swiper-container', {
					slidesPerView: 1,
					loop: true,
					pagination: {
						el: '.main-spot-swiper .swiper-pagination',
						clickable: true,
						renderBullet: function (index, className) {
							let idx = (index+1) > 9 ? index+1 : '0'+ (index+1);
							let str = '<div class="duration"><div class="bar spot-duration-bar"></div></div>'
									+ '<div class="bullet-number">'+ idx +'</div>'
									+ '<div class="bullet-title">'+ $('.spot-core').eq(index).text() +'</div>';
							return '<div class="' + className + ' swiper-pagination-bullet-'+ index +' mouse-effect" data-cursor="click" style="width:'+ 100/this.slides.length +'%;">'+ str +"</div>";
						}
					},
					effect: 'fade',
					on : {
						afterInit : function(){
							$durBar = $('.spot-duration-bar');
							!window.isMobile && mouseCursor();//마우스 커서
							spot.slideControl(); //처음 실행
						}
					}
				});
				
				mainSpotSwiper.on('slideChangeTransitionEnd', function(e){
					$('.spot-item.swiper-slide-active').focus();
				});
			
				mainSpotSwiper.on('slideChange', function(){
					playingIdx = this.realIndex;
					spot.reset();
					spot.slideControl();
				});
			}		
		}

		if($('.spot-item video').length == 0){//video 없을 시
			spot.init();
		}else {//video 있을 시
			let loadCheck = setInterval(function(){//첫 영상 로드 다되기까지 체크
				if($('.spot-item video')[0].duration > 0){
					spot.init();					
					clearInterval(loadCheck);
				}    	   
			});
		}
	}

    exports.scrollMove = scrollMove;
    exports.bodyScrollBlock = bodyScrollBlock;
    exports.popup = popup;
	exports.afterLoading = afterLoading;
	exports.ani = ani;
	exports.plx = plx;
	exports.byteCheck = byteCheck;


	/************************************************/
	/************************************************/
	/************************************************/
	/******** 스크롤 ********/
	let currentScr, lastScr = 0;
	let pageEnd;
	
	function scrollEv(){
		//---현재 스크롤값
		currentScr = $(window).scrollTop();	

		//---헤더, 탑버튼
		if($(window).scrollTop() + $('header').height() > $('.main-spot').height()){
			if(window.isMain) $('header').removeClass('white');
			$('.btn-top').addClass('on');
		}else{
			if(window.isMain) $('header').addClass('white');
			$('.btn-top').removeClass('on');
		}

		//---스크롤 영역 모션
		scrCSSEff();

		//---gnb
		gnbScr();

		//---현재 스크롤값은 저장
		lastScr = currentScr;
	}

	function mouseCursor(){
		$(document).on('mousemove', function(e){
			let mouseX = e.clientX-($('.mouse-cursor').width()/2);
			let mouseY = e.clientY-($('.mouse-cursor').height()/2);

			if(!$('.mouse-cursor').is(':visible')) $('.mouse-cursor').fadeIn();
			
			$('.mouse-cursor').css({
				left: mouseX + 'px',
				top: mouseY + 'px'
			});				
		});

		$(document).on('mouseleave', function(e){
			$('.mouse-cursor').fadeOut();
		});
		
		$('input[type="file"], select').on('click', function(){
			$('.mouse-cursor').fadeOut();
		})
		
		$('a[href]').on('mouseenter', function(){
			$('.mouse-cursor').addClass('click');
		});

		$('a[href]').on('mouseleave', function(){
			$('.mouse-cursor').removeClass('click');
		});

		$('.mouse-effect').on('mouseenter', function(){
			$('.mouse-cursor').addClass($(this).attr('data-cursor'));
		});

		$('.mouse-effect').on('mouseleave', function(){
			$('.mouse-cursor').removeClass($(this).attr('data-cursor'));
		});
	}

	/******** 공통 ********/
	$(function(){
		//---탑버튼 클릭
		$('.btn-top').on('click', function(){
			$('html, body').animate({scrollTop: 0}, 'linear');
			return false;
		});  

		//---전체메뉴
		let headerH = $('header').height();
		$('.btn-all-gnb').on('click', function(){			
			if($(this).hasClass('on')){				
				bodyScrollBlock(false);				
				$('header').removeClass('nav-open');
				$(this).removeClass('on');
			}else{
				bodyScrollBlock(true);
				$('header').addClass('nav-open');
				$(this).addClass('on');
			}
			return false;
		});
		
		//---패밀리 사이트
		$('.btn-family-site').on('click', function(){
			$('.family-site-list').stop().slideToggle();
		});


		//---input[type="text"] 초기화
		$('input[type="text"]').on('keydown', function(){
			if($(this).val().length > 0) $(this).siblings('.btn-input-reset').show();
			else $(this).siblings('.btn-input-reset').hide();
		});
		$('.input-wrap .btn-input-reset').on('click', function(){
			$('#'+ $(this).data('reset')).val('');
			$(this).hide();
			return false;
		});
		$('.btn-filter-reset').on('click', function(){
			$('.search-box .filter-item input').prop('checked', false);
			return false;			
		});


		//---pc일때
		if(!window.isMobile){			
			//마우스 커서
			!window.isMain && mouseCursor(); //메인 아닐때
		}	

		//---only main
		if(window.isMain){
			//새로고침 - 스크롤 상단
			//$("html, body").animate({ scrollTop: 0}, 'fast');

			//intro 시작
			$('#intro').addClass('active');

			$('#intro').remove();
			$('html').removeClass('main-intro');
			$('html').addClass('main-intro-end');		
			$('header').addClass('white');
			mainSpot();						
			$(window).on('scroll', scrollEv);

			// //메인 인트로 제거 후
			// document.querySelector('#intro').addEventListener('animationend', function(e){
			// 	if(e.target == this) {
			// 		$('#intro').remove();					
			// 		$('.main-intro').addClass('main-intro-end');	
			// 		$('header').addClass('white');	
			// 	}
			// });
			// //clip-path모션 끝난 후
			// document.querySelector('.main-spot').addEventListener('animationend', function(e){	
			// 	if($('html').hasClass('main-intro')){	
			// 		$('html').removeClass('main-intro');						
			// 		mainSpot();						
			// 		$(window).on('scroll', scrollEv);
			// 	}		
			// });

			//동아쏘시오 그룹 소개 - 퍼즐
			let philosophyFlag, socioSetTArr = [];
			$(window).on('scroll', function(){
				//---스크롤 모션
				// plx({
				// 	target:'.ba-a',
				// 	parent: '.main-value',
				// 	increment: '0.4',
				// 	fn : function(delta, d){
				// 		if(delta >= 0 && delta <= 1) $('.ba-a').css('bottom', -(100*dl))
				// 	}
				// });			


				if($('.philosophy-list').hasClass('scr-eff-active')){ 
					if(philosophyFlag){
						$('.philosophy-list').addClass('no-click');
						philosophyFlag = false;
						$('.philosophy-list').stop().animate({opacity:1, paddingLeft: 0}, 500,
						function(){
							$('.philosophy-list').removeClass('no-click');
						});
					}
				}else{
					if(!philosophyFlag){
						philosophyFlag = true;
						$('.philosophy-list').stop().animate({opacity:0, paddingLeft: '70%'}, 500);
					}
				}
				
					
				//bg-socio
				if(pageEnd) {
					if(!$('.bg-socio').hasClass('on')){
						$('.bg-socio').addClass('on');
						$('.bg-socio > div').each(function(idx){
							var _ = $(this);
							socioSetTArr[idx] = setTimeout(function(){
								_.addClass('on');
							}, idx * 110);
						});
					}					
				}else{
					if($('.bg-socio').hasClass('on')){
						socioSetTArr.map((item)=>{
							clearTimeout(item);
						});
						$('.bg-socio').removeClass('on');
						$('.bg-socio > div').removeClass('on'); 
					}	
				}

			});
		
		}else{
			$(window).on('scroll', scrollEv);
		}
	});
})(window, jQuery);
