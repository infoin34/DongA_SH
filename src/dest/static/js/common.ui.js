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
		let setScrT = parseInt(currentScr + ($(window).height()*0.9));		
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



	/************************************************/
	/******** 스크롤 ********/
	let currentScr, lastScr = 0;
	// 스크롤 감지 메뉴 hidden
	function scrollEv(){
		//현재 스크롤값
		currentScr = $(window).scrollTop();	
		
		//스크롤 영역 모션
		scrCSSEff();

		//gnb
		gnbScr();

		// 현재 스크롤값은 저장
		lastScr = currentScr;
	}
	
	$(window).on('scroll', function(){
		/* 탑버튼 제어 */
		if($(window).scrollTop() + $('header').height() > $('.main-spot').height()){
			$('header').removeClass('white');
			$('.btn-top').addClass('on');
		}else{
			$('header').addClass('white');
			$('.btn-top').removeClass('on');
		}
		scrollEv();

	});

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
				$('header').removeClass('nav-open');
				$(this).removeClass('on');
				bodyScrollBlock(false);				
			}else{
				$('header').addClass('nav-open');
				$(this).addClass('on');
				bodyScrollBlock(true);
			}
			return false;
		});
		

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
