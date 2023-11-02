'use strict';

((exports, $)=>{
	window.isMobile = 'ontouchstart' in window || window.DocumentTouch  && document instanceof DocumentTouch;
    
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
			scrollHeight = ($(window).scrollTop() );
			$('html, body').addClass('no-scr');
			$('html, body').css({
				'marin-top': -(scrollHeight)+'px',
			})
		}else {
			$('html, body').removeAttr('style');
			$('html, body').removeClass('no-scr');
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
		targetLayer : '',
		guideZindex : 1020,
		targetArr : [],
		freezeTop : 0,
		popupObj : {},
		popupSetTimer : null,
		oldHeight : 0,
		layerPopup : function(obj) {
			'use strict'
			var $obj = (typeof obj === 'string') ? $(obj) : obj ;

			popupBase.layerPopupInit($obj);
		},
		layerPopupInit: function($obj) {
			'use strict'
			var $obj = $obj,
				$wrapper = $obj.find('.wrapper'),
				$closeBtn = $obj.find('.close, .fn-close, .btn-close'),
				$popup = $obj.find('.popup'),
				$close = $obj.find('.btn.close');

			popupBase.targetLayer = $obj;
			$.each(popupBase.targetArr, function(i) {
				if (popupBase.targetArr[i].attr('id') == $obj.attr('id')) popupBase.targetArr.splice(i,1);
			})
			popupBase.targetArr.push($obj);

			$obj.css({
				'display': 'block',
				'z-index': popupBase.guideZindex + (popupBase.targetArr.length + 1)
			});

			$popup.css({
				'margin-top': '10px',
			});

			if (popupBase.targetArr.length == 1) {
				if( !$body.hasClass('layer-open') ) {
					bodyScrollBlock(true);
				}
			}
			$body.append($obj);

			$closeBtn.click(function (e) {
				e.preventDefault();
				popupBase.closePopup('#'+$obj.attr('id'));
			});

			// layer-popup-fix 클래스를 추가하면 dim 클릭해도 닫히지 않음  20-10-23
			$obj.on('click', function(e) {				
				if ( !$(this).hasClass('layer-popup-fix') && e.target.classList.contains('popup-wrapper') || e.target.classList.contains('layer-popup') ) {
					popupBase.closePopup('#'+$obj.attr('id'))
				} else {
					
				}
			});
		},
		popupCloseAllFn : function() {
			'use strict'

			$.each(popupBase.targetArr, function(i) {
				popupBase.closePopup();
			});
		},
		closePopup : function(id) {
			var $tg = id ? $(id) : popupBase.targetArr[popupBase.targetArr.length - 1] ;
			$tg.css({ 'display': 'none', 'z-index': 0 });
			$.each(popupBase.targetArr, function(i) {
				if (popupBase.targetArr[i].attr('id') == $tg.attr('id')) {
					popupBase.targetArr.splice(i,1);
					return false;
				}
			})
			popupBase.targetLayer = '';
			if (popupBase.targetArr.length == 0) {
				if( !$body.hasClass('layer-open') ) {
					bodyScrollBlock(false);
				}
			}
		}		
	};

	/* gnb */
	function gnbScr(){
		if($('header').hasClass('nav-open')) return;//전체메뉴
		if(Math.abs(lastScr - currentScr) <= 5) return;

		// 스크롤 최하단으로 갔을때
		if(currentScr + $(window).height() >= $('footer').offset().top + ($('footer').height()*0.8)){
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
					$('html').removeClass('scr-down');
					$('html').addClass('scr-up');
				}				
			}
			// 스크롤 0일경우
			if (currentScr == 0 ) {}
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

	let scrolJSEFF = [
		{
			target: '.bg-a', 
			parent: '.main-philosophy',
			h: '20%',
			obj: {
				top: '10',
				opacity: '1'
			}

		}
	]
	let text = 0+'n';
	function scrollJSEff(obj){		
		let $target = $(obj.target);
		let $parent = obj.parent ? $(obj.parent) : $target.parent();
		let fixT = obj.h.indexOf('%') !== -1? parseInt(obj.h)*0.01*$(window).height() : parseInt(obj.h)/$(window).height(); 
		let setScrT = parseInt(currentScr + $(window).height());		

		if(setScrT >= $parent.offset().top){

		}else{

		}
		//let delta = 
		//let delta = $(window).scrollTop()/($('.fake_bg').height()-$(window).height()) > 1 ? 1 :  $(this).scrollTop()/($('.fake_bg').height()-$(window).height());
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
			$playing = $item.eq(0),//현재 보이는 박스,
			$prev,//전 박스
			$next,//후 박스
			$bullet,
			mainSpotSwiper,
		    playingIdx = 0, //현재 보이는 박스 idx,
			visualLength = $item.length,//박스 총갯수
			curDelay = 6,//재생시간
			setTo, setTo2;//settimeout,

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
				mainSpotSwiper.slideTo(playingIdx, 300);				
			},
			slideControl: function(){
				let _ = this;
				if($playing.find('video').length > 0){
					$playing.find('video')[0].play();
				}				
				if($playing.find('video').length > 0 && $playing.find('video')[0].duration){
					curDelay = $playing.find('video')[0].duration;
				}else{
					curDelay = 5;
				}
				clearTimeout(setTo2);	
								
				setTo2 = setTimeout(function(){
					$playing.find('.spot-text').addClass('on');
				},800);

				if($item.length == 1) return;
				
				_.autoPlay();   
			},
			autoPlay: function(init){
				let _ = this;							
				clearTimeout(setTo);		
				
				setTo = setTimeout(function(){    		
					_.next();					    				 
				}, curDelay * 1000);
			},
			init :function(){
				mainSpotSwiper = new Swiper('.main-spot-swiper .swiper-container', {
					slidesPerView: 1,
					loop: true,
					pagination: {
						el: '.main-spot-swiper .swiper-pagination',
						clickable: true,
					}
				});
				spot.slideControl();//처음 실행

				mainSpotSwiper.on('slideChangeTransitionStart', function(){
					playingIdx = this.realIndex;
					$playing = $item.eq(playingIdx);
					if($playing.find('video').length > 0){
						$playing.find('video')[0].pause();
						$playing.find('video')[0].currentTime = 0;						
					}
					$('.spot-text').removeClass('on');
				});
				mainSpotSwiper.on('slideChangeTransitionEnd', function(){
					spot.slideControl();
				});
			}		
		}

		if($('.spot-item video').length == 0){
			spot.init();
		}else {//video duration 읽어진 후
			let loadCheck = setInterval(function(){
				if($('.spot-item video')[0].duration > 0){
					clearInterval(loadCheck);
					spot.init();					
				}    	   
			});//첫 영상 로드 다되기까지 체크
		}
	}

	
	// function scrollMotion(){		
	// 	//spot 효과
	// 	const spotDelta = $(this).scrollTop()/($('.fake_bg').height()-$(window).height()) >= 1 ? 1 : $(this).scrollTop()/($('.fake_bg').height()-$(window).height());
	// 	const spotT1 = $('.spot_txt_1').width()/2;
	// 	const spotT2 = $('.spot_txt_2').width()/2;
	// 	const spotT3 = $('.spot_txt_3').width()/2;
		
	// 	if(spotDelta < 1 && !$('html').hasClass('noScr')){		
	// 		const Bbg = Math.ceil(255*(1-spotDelta));
	// 		const Wbg = Math.ceil(100*spotDelta);		
	// 		$('#bgSun').css({width:circleDiam, height:circleDiam});
			
	// 		if($('#wrap').hasClass('de_1')) $('#wrap').removeClass('de_1');
	// 		$('#bgSun').css({width:circleDiam*(1-spotDelta), height:circleDiam*(1-spotDelta)})
	// 		//$('#wrap').css('background-color','rgb('+ Wbg +','+ Wbg +','+ Wbg +')');	
	// 		$('.spot_txt').css('color', 'rgb('+ Bbg +','+ Bbg +','+ Bbg +')');	
	// 		$('nav').css('color', 'rgb('+ Bbg +','+ Bbg +','+ Bbg +')');		
				
	// 	}

	// 	if(spotDelta < 1 && !$('html').hasClass('visual-mode')){
	// 		$('html').addClass('visual-mode');	
	// 		$('html').removeClass('contents-mode');
	// 	} 
	// 	if(spotDelta >= 1 && !$('#wrap').hasClass('de_1')){
	// 		$('html').removeClass('visual-mode');
	// 		$('html').addClass('contents-mode');
	// 		$('#wrap').addClass('de_1');
	// 		$('.spot_txt').css('color', 'rgb(0, 0, 0)');	
	// 		$('nav').css('color', 'rgb(0, 0, 0)');		
	// 		//$('#wrap').css('background-color','#fff');
	// 	}
		
	// 	$('.spot_txt_1').css('margin-left',-spotT1*spotDelta +'px');
	// 	$('.spot_txt_2').css('margin-right',-spotT2*spotDelta +'px');
	// 	$('.spot_txt_3').css('margin-left',-spotT3*spotDelta +'px');	
	// }
	
    exports.scrollMove = scrollMove;
    exports.bodyScrollBlock = bodyScrollBlock
    exports.popup = popup;
	exports.afterLoading = afterLoading;
	exports.ani = ani;



	/************************************************/
	/******** 스크롤 ********/
	let currentScr, lastScr = 0;
	// 스크롤 감지 메뉴 hidden
	function scrollEv(){
		//현재 스크롤값
		currentScr = $(window).scrollTop();	

		/* 탑버튼 제어 */
		if($(window).scrollTop() + $('header').height() > $('.main-spot').height()){
			$('header').removeClass('white');
			$('.btn-top').addClass('on');
		}else{
			$('header').addClass('white');
			$('.btn-top').removeClass('on');
		}
		
		//스크롤 영역 모션
		scrCSSEff();

		//gnb
		gnbScr();

		// 현재 스크롤값은 저장
		lastScr = currentScr;
	}
	

	/* 푸터 패밀리 사이트 */
	function toggleFamily(){
		var $footer = $(".footer");
		var $button = $footer.find($(".footer-familySelect"));
		var $list = $footer.find($(".footer-familyList"));
	}

	/******** 공통 ********/
	$(function(){
		/* 탑버튼 클릭 */
		$('.btn-top').on('click', function(){
			$('html, body').animate({scrollTop: 0}, 'linear');
			return false;
		});  

		/* 전체메뉴 */
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
		
		//패밀리 사이트
		$('.btn-family-site').on('click', function(){
			$('.family-site-list').stop().slideToggle();
		});

		//메인
		if(window.mainFlag){
			$("html, body").animate({ scrollTop: 0}, 'fast'); 

			/***** main *****/
			//intro 시작
			$('#intro').addClass('active');

			//main-value 썸네일 커버
			$('.main-value .thumb').append('<div class="img-cover"><span></span><span></span><span></span><span></span><span></span></div>');
            
			
			// //메인 인트로 끝날 때
			document.querySelector('#intro').addEventListener('animationend', function(e){
				if(e.target == this) {
					$('#intro').remove();					
					$('.main-intro').addClass('main-intro-end');	
				}
			});
			document.querySelector('.main-spot').addEventListener('animationstart', function(e){
				if($('.spot-item').eq(0).find('video').length > 0){
					$('.spot-item').eq(0).find('video')[0].pause();
					$('.spot-item').eq(0).find('video')[0].currentTime = 0;
				}	
				setTimeout(function(){
					$('header').addClass('white');	
				}, 400);				
			})
			document.querySelector('.main-spot').addEventListener('animationend', function(e){	
				if($('html').hasClass('main-intro')){	
					$('html').removeClass('main-intro');						
					mainSpot();						
					$(window).on('scroll', scrollEv);
				}		
			});

			//동아쏘시오 그룹 소개
			let onceFlag, buiSetTArr = [];
			$(window).on('scroll', function(){				
				if($('.business-list').hasClass('scr-eff-active')){
					if(!onceFlag){
						onceFlag = true;
						$('.business-item').each(function(idx){
							var _ = $(this);
							buiSetTArr[idx] = setTimeout(function(){
								_.addClass('on');
							}, (idx+1)*120);
						});
					}
				}else{			
					if(onceFlag){
						onceFlag = false;
						buiSetTArr.map((item)=>{
							setTimeout(buiSetTArr);
						}) 
						$('.business-item').removeClass('on');
					}
				}
			});
		
		}else{
			$(window).on('scroll', scrollEv);
		}

		
		if(!window.isMobile){
			// $('a[href]').on('mouseenter', function(){
			// 	//$('.mouse_cursor').addClass('click');
			// 	$(this).addClass('hover');
			// });
	
			// $('a[href]').on('mouseleave', function(){
			// 	//$('.mouse_cursor').removeClass('click');
			// 	$(this).removeClass('hover');		
			// });				
		}	
	});

	
})(window, jQuery);