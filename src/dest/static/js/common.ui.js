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

	/* cookie값 확인 */
	function getCookie(name) {
		let Found = false;
		let start, end;
		let i = 0;
		// cookie 문자열 전체를 검색
		while(i <= document.cookie.length) {
			start = i;
			end = start + name.length;
			// name과 동일한 문자가 있다면
			if(document.cookie.substring(start, end) == name) {
				Found = true;
				break;
			}
			i++;
		}

		// name 문자열을 cookie에서 찾았다면
		if(Found == true) {
			start = end + 1;
			end = document.cookie.indexOf(";", start);
			// 마지막 부분이라는 것을 의미(마지막에는 ";"가 없다)
			if(end < start)
				end = document.cookie.length;
			// name에 해당하는 value값을 추출하여 리턴한다.
			return document.cookie.substring(start, end);
		}
		// 찾지 못했다면
		return "";
	}

	/* cookie 저장 */
	function setCookie(name, value, expiredays){
		let todayDate = new Date();	

		todayDate.setDate( todayDate.getDate() + expiredays );
		document.cookie = name + "=" + escape( value ) + "; path=/; expires=" + todayDate.toGMTString() + ";"
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
	function scrollMove (val, time, cd){
        $('html, body').animate(
			{scrollTop: val}, time || 300, function(){
				cd && cd();
			});
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
			let $parent = $(parent);
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
			
			//$('html').append($obj);
			$closeBtn.click(function(e){
				e.preventDefault();
				popup.close(this);
			});
			if(!$obj.hasClass('no-dim')) {//dim 없으면
				if (popup.targetArr.length == 1) {
					if(!$('html').hasClass('layer-open') ) {
						bodyScrollBlock(true);
					}
				}
				// layer-popup-fix 클래스를 추가하면 dim 클릭해도 닫히지 않음 
				$obj.on('click', function(e) {				
					if (!$(this).hasClass('layer-popup-fix') && e.target.classList.contains('popup-wrap')) {
						popup.close(this);
					}
				});
			}
		},
		popupCloseAllFn : function() {
			'use strict'
			$.each(popup.targetArr, function(i) {
				popup.close();
			});
		},
		close : function(target) {
			let $target = $(target),
			    $pop = $target.hasClass('layer-popup') ? $target : $target.parents('.layer-popup');
			
			$.each(popup.targetArr, function(i) {
				if (popup.targetArr[i].attr('data-pop') == $pop.attr('data-pop')) {
					popup.targetArr.splice(i,1);
				}
			});
			if (popup.targetArr.length == 0) {
				if( !$('html').hasClass('layer-open') && !$pop.hasClass('no-dim')) {
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
				_.close('.pop-confirm');				
				return false;
			});
			
			$('.pop-confirm .btn-cancel').off('click');
			$('.pop-confirm .btn-cancel').on('click', function(){
				obj.cancel && obj.cancel();
				_.close('.pop-confirm');
				return false;
			});			
			_.open('.pop-confirm');			
		}		
	};


	/* gnb */
	function gnbScr(){
		if($('header').hasClass('nav-open')) return;//전체메뉴
		if(Math.abs(lastScr - currentScr) <= 5) return;

		//page-menu
		if($('.page-menu-wrap').length > 0){			
			if($('.page-menu-wrap').offset().top <= $(window).scrollTop()){				
				if(!$('.page-menu-list').hasClass('fixed')){
					$('.page-menu-list').addClass('fixed');
				}
			}else {
				if($('.page-menu-list').hasClass('fixed')){
					$('.page-menu-list').removeClass('fixed');
				}
			}
		}
		if ( currentScr > lastScr ){//아래로				
			if(!$('html').hasClass('scr-down')){
				$('html').removeClass('scr-up');
				$('html').addClass('scr-down');
				$('.page-menu-list').removeClass('hidden');
				$('.header-workgroup').removeClass('on');
				$('.btn-work-place').removeClass('on');
			}	
		} else{//위로
			if(!$('html').hasClass('scr-up')){
				pageEnd = false;
				$('html').removeClass('scr-down');
				$('html').addClass('scr-up');
				if($('.page-menu-list').hasClass('fixed')) $('.page-menu-list').addClass('hidden');
			}				
		}
		// 스크롤 0일경우
		if (currentScr <= 0 ){
			$('html').removeClass('scr-down');
			$('html').addClass('scr-up');
			$('.page-menu-list').css('top', 0);
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
		
		_.fn = function(){
			_.$target.css('transform', 'translateY('+ elY +'%)');
		}
		
		if(fn) fn(_.delta, _.delta*_.increment);
		else _.fn();
		
		return _
	}

	/* css토글 */
	function cssToggle(obj, target, idx){
        let $btn = $(obj);
        let $target = $(target);
        let targetIdx = idx ? idx : 0;
		
        if(idx !== undefined && idx !== null){
            if(!$btn.eq(targetIdx).hasClass('on')){
                $btn.removeClass('on');
                $target.removeClass('on');
                $btn.eq(targetIdx).addClass('on');
                $target.eq(targetIdx).addClass('on');
            }    
        }else{
            if(!$btn.eq(targetIdx).hasClass('on')){
                $btn.removeClass('on');
                $target.removeClass('on');
                $btn.eq(targetIdx).addClass('on');
                $target.eq(targetIdx).addClass('on');
            }else{
                $btn.eq(targetIdx).removeClass('on');
                $target.eq(targetIdx).removeClass('on');
            } 
        }
		return false;
    }

	/* layer토글 - 화면 클릭하면 none*/
	function layerToggle(e, btn, target){
		let $btn = $(btn);
		let parent = target ? target : btn;
		if($btn.hasClass('on')){			
			closeFn(e);
		}else{			
			$(parent).addClass('on');
			$btn.addClass('on');
			$('#wrap').on('click', closeFn);			
		}			

		$(parent).find('.btn-close').off('click').on('click', function(){
			closeFn(e);
			return false;	
		});
			
		function closeFn(e){
			console.log($(e.target).parents(btn).length)
			if($(e.target).parents(parent).length == 0 || $(e.target).parents(btn).length > 0 || e.target == $(btn)[0] || $(e.target).hasClass('btn-close')){
				$(parent).removeClass('on');
				$btn.removeClass('on');
				$('#wrap').off('click', closeFn);
			}
			return false;
		}	
		return false;
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

	/* slideStart */
	function slideStart(obj, cnt, rolling){
		let $self = obj;
		let $list = $self.find('.slide-list');
		let $touch = $self.find('.slide-wrap');
		let $slideSection = $self.find('.slide'); 
		let $btnSlidePrev = $self.find('.btn-prev'); 
		let $btnSlideNext = $self.find('.btn-next');
		let $slideDots = '';
		let $slideDotsLi = '';
		let slideLength = $slideSection.length;
		let initPageIdx = 0, 
			curPageIdx = 0, 
			prevPageIdx, 
			nextPageIdx,
			autoPlayFlag = $self.attr('autoPlay'),
			setTo;
			
		let touchX = 0, touchY = 0, moveX = 0, moveY = 0;
		let clickable = false;

	
		let swipe = {
			handStart : function(e){
				let ev = window.isMobile ? e.touches[0] || e.changedTouches[0] : e;
				touchX = ev.pageX;
				touchY = ev.pageY;	

				if(!window.isMobile){
					e.preventDefault();
					e.stopPropagation();
				}			
				$list.removeClass('no-click');				
				if(!window.isMobile){
					$touch[0].onmousemove = null;
					$touch[0].onmousemove = swipe.handMove;
				}else{				
					$touch[0].addEventListener('touchmove', swipe.handMove);
				}
			},
			handMove : function(e){	
				let ev = window.isMobile ? e.touches[0] || e.changedTouches[0] : e;

				moveX = ev.pageX;
				moveY = ev.pageY;
				
				$list.addClass('no-click');	

				if(!window.isMobile) {//PC
					$touch[0].onmouseleave = null;
					$touch[0].onmouseleave = $swipe.handEnd;
				}				
			},
			handEnd : function(e){	
				if(!window.isMobile) {
					$touch[0].onmousemove = null;	
				}else{
					$touch[0].removeEventListener('touchmove',swipe.handMove);
				}		
				let ev = window.isMobile ? e.touches[0] || e.changedTouches[0] : e;

				moveX = ev.pageX;
				moveY = ev.pageY;
				
				let gapX = Math.abs(touchX - moveX);
				let gapY = Math.abs(touchY - moveY);

				clickable = gapX != 0 && gapY != 0? false : true;	
				
				if(!clickable){
					e.preventDefault();
					e.stopPropagation();
					e.cancelBubble = true;
					e.stopImmediatePropagation();				
				}else{
					$list.removeClass('no-click');
				}
				
				let pow = Math.pow(gapX, 2) + Math.pow(gapY, 2);
				if(Math.abs(gapX) > Math.abs(gapY)  && Math.sqrt(pow) > 30){	
					if(moveX > touchX){//prev
						prev();
					}else{//next
						next();
					}
				}
				
				
			},
		}
		let slideOnceFlag = $(window).width() < 768 ? false : true;
		function reset(){			
			let slideLimit = $(window).width() < 768 ? 2 : 3;

			if(slideLength >= slideLimit){
				$self.removeClass('default');
				$self.addClass('draggable');
			}else{
				$self.removeClass('draggable');	
				$self.addClass('default');
			}

			if($(window).width() < 768){	
				$slideDots.show();		
				$btnSlidePrev.hide();
				$btnSlideNext.hide();	
				if(slideLength >= slideLimit){
					$slideDots.show();		
				}else{
					$slideDots.hide();	
				}
			}else{
				$slideDots.hide();		
				if(slideLength >= slideLimit){
					$btnSlidePrev.show();
					$btnSlideNext.show();	
				}else{
					$btnSlidePrev.hide();
					$btnSlideNext.hide();
				}
			}
			return false;
		}
		function setting(){		
			let slidePaging = '';	
			let slideLimit = $(window).width() < 768 ? 2 : 3;

			for(var i = 0; i < slideLength; i++){
				let className = '';
				if(i == 0){
					className = 'active';
				}
				slidePaging = slidePaging + ('<li class="'+ className +'">'+ Number(i + 1) +'</li>');
			}

			if(slideLength >= slideLimit){
				$slideSection.first().addClass('active');
				$slideSection.first().next().addClass('next');
				$slideSection.last().addClass('prev');
				$self.addClass('draggable');				
				init();						
			}else {
				$self.addClass('default');
				$btnSlidePrev.hide();
				$btnSlideNext.hide();
			}		

			$self.append('<ul class="slide-dots">'+ slidePaging +'</ul>');			
			$slideDots = $self.find('.slide-dots');
			$slideDotsLi = $slideDots.find('li');
			$slideDotsLi.eq(0).addClass('on');
			
			reset();

			if(!window.isMobile){		
				$touch[0].onmouseup = null;
				$touch[0].onmousedown = null;
				$touch[0].onmousedown = swipe.handStart;	
				$touch[0].onmouseup = swipe.handEnd;		 	
				$touch[0].onclick = function(e){		 				
					if(!clickable){
						e.preventDefault();
						e.stopPropagation();	
					}
					$list.removeClass('no-click');
				}	
			}else{
				$touch[0].ontouchstart = null;
				$touch[0].touchend = null;
				$touch[0].addEventListener('touchstart', swipe.handStart, false);
				$touch[0].addEventListener('touchend', swipe.handEnd, false);				
			}
		} 
		
		function init(){
			if(autoPlayFlag && !rolling) autoPlay();
			if(autoPlayFlag && rolling) rollingAutoPlay();
			$btnSlidePrev.off('click');			
			$btnSlideNext.off('click');		
			$btnSlidePrev.on('click', prev);			
			$btnSlideNext.on('click', next);					
			// $slideSection.on('click', function(e){
			// 	clearTimeout(setTo); 
			// 	curPageIdx = $(this).index();
			// 	setElement();
			// 	return false;
			// });
		}
		function prev(){
			clearTimeout(setTo); 
			curPageIdx--;		
			setElement();
			return false;
		}
		function next(){  
			clearTimeout(setTo); 
			curPageIdx++;		
			setElement();
			return false;
		}	
		function setElement(){		
			if(curPageIdx < 0){
				curPageIdx = slideLength-1;
			}else if(curPageIdx > slideLength-1){
				curPageIdx = 0;
			}			
			prevPageIdx = (curPageIdx-1) < 0 ? slideLength-1 : curPageIdx-1;	
			nextPageIdx = (curPageIdx+1) < slideLength ? curPageIdx+1 : 0;
			
			$self.find('.slide.active').removeClass('active'); 				
			$self.find('.slide.next').removeClass('next'); 				
			$self.find('.slide.prev').removeClass('prev');
		
			$slideSection.eq(curPageIdx).addClass('active');
			$slideSection.eq(prevPageIdx).addClass('prev');	
			$slideSection.eq(nextPageIdx).addClass('next');
			
			$slideDotsLi.removeClass('on');
			$slideDotsLi.eq(curPageIdx).addClass('on');
			
			if(autoPlayFlag) {
				setTo = setTimeout(function(){      	
					autoPlay();
				}, 2000);
			}
		}			
		function autoPlay(){
			var autoSc=cnt? cnt : 5000;
			setTo = setTimeout(function(){
				clearTimeout(setTo);
				curPageIdx++;
				setElement();
			},autoSc);
		}
		function rollingAutoPlay(){
			$(window).on('scroll',function(){
				var height = $(window).scrollTop() + $(window).height();
				if (height < $self.offset().top || height >=$self.offset().top + 200 + $self.parents('.section').height()) {
					$self.removeClass('playing');
					clearTimeout(setTo);
				}
				else{
					if(!$self.hasClass('playing')){
						$self.addClass('playing')
						setTimeout(function(){
							$btnSlideNext.click();

						},autoSc);
					}
				}
			});
			var autoSc = cnt;
			setTo = setTimeout(function(){
				$btnSlideNext.click();
			}, autoSc);
		}
		setting();

		if(window.isMobile){//mo
			$(window).on('orientationchange', function(e){    
				$(window).one('resize', function() {
					reset();
				});
			});
		}else{//pc
			$(window).on('resize', function(e){  
				if($(window).width() < 768){
					if(!slideOnceFlag){           
						slideOnceFlag = true;
						reset();  
					}
				}else{
					if(slideOnceFlag){
						slideOnceFlag = false;
						reset();  
					}
				}
			});
		}

	}

	function aniRaf(cb) {
		var rAfTimeout = null;
	  
		return function () {
		  if (rAfTimeout) {
			window.cancelAnimationFrame(rAfTimeout);
		  }
		  rAfTimeout = window.requestAnimationFrame(function () {
			cb();
		  });
		}
	}
	 
	
	/* tab on */
	function tabMenuMove(target){
		var $target = $(target);
		var halfVW = $(window).width()/2;
		var $onTab = $(target).find('.on');
		var onMenuWidth = $onTab.outerWidth();
		var onMenuXPos = $onTab.position().left;		
		var moveWidth = (onMenuXPos + onMenuWidth/2) - halfVW;	
		$target.stop().animate({scrollLeft:moveWidth});		
	} 

	/* animate */ 
	//specialEasing 추가
	$.easing.circle = function (x, curTime, begin, end, distance){
		return 1- Math.sin(Math.acos(x));
	}
	
	/* main-spot */ 
	function mainSpot(){
		let $item = $('.spot-item'),
			$stopCv = $('.spot-change'),//바뀔때 큰 커버
			$playing = $item.eq(0),//현재 보이는 박스,
			$prev = $item.eq(0),//직전 박스
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
				let stopTime = 1500;
				let vdo;
				
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
					step: function(v, d){
						if(d.pos > 0.3) {
							$('.spot-time-break').removeClass('spot-time-break');	
						}
					},
					complete : function(){//커버 지나간 후		
						$playing.hasClass('spot-last') && $playing.addClass('on');	
						if($playing.find('video').length > 0){
							vdo = $(window).width() < 768 ? $playing.find('video.mo-part') : $playing.find('video.pc-part') ;
							//vdo[0].currentTime = 0;
							vdo[0].play();
						}			
						if($playing.find('video').length > 0 && vdo[0].duration){
							curDelay = vdo[0].duration;
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
					resizeObserver: false,
					pagination: {
						el: '.main-spot-swiper .swiper-pagination',
						clickable: true,
						renderBullet: function (index, className) {
							let idx = (index+1) > 9 ? index+1 : '0'+ (index+1);
							let str = '<div class="duration"><div class="bar spot-duration-bar"></div></div>'
									+ '<div class="bullet-number">'+ idx +'</div>'
									+ '<div class="bullet-title ell">'+ $('.spot-core').eq(index).text() +'</div>';
							return '<div class="' + className + ' swiper-pagination-bullet-'+ index +' mouse-effect" data-cursor="click" style="width:'+ 100/this.slides.length +'%;">'+ str +"</div>";
						},
					},
					effect: 'creative',
					creativeEffect: {//cover넣기위한 꼼수
						prev: {
							opacity: 1,
						},
						next: {
							opacity: 1,
						},
					},
					on : {
						afterInit : function(){
							$durBar = $('.spot-duration-bar');
							!window.isMobile && mouseCursor();//마우스 커서
							$item.eq(playingIdx).addClass('spot-time-break');//다음 화면 전에 보여줄 전화면
							spot.slideControl(); //처음 실행
						}
					}
				});
				mainSpotSwiper.on('beforeSlideChangeStart', function(){
					$item.eq(this.realIndex).addClass('spot-time-break');//다음 화면 전에 보여줄 전화면	
				})
				// mainSpotSwiper.on('beforeResize', function(){
				// });
				// mainSpotSwiper.on('resize', function(){
				// })
				mainSpotSwiper.on('slideChange', function(){	
					playingIdx = this.realIndex;
					spot.reset();
					spot.slideControl();
				});
			}		
		}

		if($('.spot-item').eq(0).find('video').length == 0){//첫 슬라이드에 video 없을 시
			spot.init();
		}else {//video 있을 시
			let vdo = $(window).width() < 768 ? $('.spot-item').eq(0).find('video.mo-part') : $('.spot-item').eq(0).find('video.pc-part') ;
			let loadCheck = setInterval(function(){//첫 영상 로드 다되기까지 체크			
				if(vdo[0].duration > 0){
					spot.init();					
					clearInterval(loadCheck);
				}    	   
			});
		}
	}

	exports.aniRaf = aniRaf;
	exports.scrollEv = scrollEv;
    exports.scrollMove = scrollMove;
	exports.getCookie = getCookie;
	exports.setCookie = setCookie;
    exports.bodyScrollBlock = bodyScrollBlock;
    exports.popup = popup;
	exports.tabMenuMove = tabMenuMove;
	exports.slideStart  = slideStart;
	exports.afterLoading = afterLoading;
	exports.cssToggle = cssToggle;
	exports.layerToggle = layerToggle;
	exports.ani = ani;
	exports.plx = plx;
	exports.byteCheck = byteCheck;


	/************************************************/
	/************************************************/
	/************************************************/
	/******** 스크롤 ********/
	let currentScr = 0, lastScr = 0;
	let pageEnd;
	
	function scrollEv(){
		//---현재 스크롤값
		currentScr = $(window).scrollTop();	

		//---헤더, 탑버튼
		let mH = isMain ? $('.main-spot').height() : $('header').height();
		if($(window).scrollTop() > mH){
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

			if(e.target.tagName =='SELECT') {
				$('.mouse-cursor').fadeOut();
				return;
			}
			if(!$('.mouse-cursor').is(':visible')) $('.mouse-cursor').fadeIn();
			
			$('.mouse-cursor').css({
				left: mouseX + 'px',
				top: mouseY + 'px'
			});				
			return false;
		});

		$(document).on('mouseleave', function(e){
			$('.mouse-cursor').fadeOut();
		});
		
		$('input[type="file"]').on('click', function(){
			$('.mouse-cursor').fadeOut();
		});
		
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
			$('html, body').animate({scrollTop: 0}, 300, 'linear');
		});  
		
	
		scrCSSEff();

		//---전체메뉴
		let headerH = $('header').height();
		$('.btn-all-gnb').on('click', function(e){			
			e.preventDefault();
			if($(this).hasClass('on')){				
				bodyScrollBlock(false);				
				$('header').removeClass('nav-open');
				$(this).removeClass('on');
				$('.btn-lang').removeClass('on');
			}else{
				bodyScrollBlock(true);
				$('header').addClass('nav-open');
				$(this).addClass('on');
			}
		});
		
		//---패밀리 사이트
		$('.btn-family-site').on('click', function(e){
			layerToggle(e, '.btn-family-site', '.footer-family-site');
			return false;
		});
		$('.about-site-tab > li').on('click', function(){
			cssToggle('.about-site-tab li', '.about-site-list', $(this).index());
		});
		$('.btn-work-place').on('click', function(e){
			layerToggle(e, '.btn-work-place', '.header-workgroup');
			return false;
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
			$('html').addClass('window-pc');				
				
			//마우스 커서
			!window.isMain && mouseCursor(); //메인 아닐때

			//pc에서 가로 스크롤 할 때
			$('.scr-x').on('scroll', function(){
				$('.mouse-cursor').hide();
			})	
		}else{//---mo 일때
			$('html').addClass('window-mo');
						
			//gnb
			//--3뎁스 없을 시
			$('.gnb-depth2-list > li').each(function(){
				if($(this).find('.gnb-depth3').length > 0) $(this).addClass('depth-3-y');
			});

			//--1뎁스 클릭
			$('.gnb-depth1-title').on('click', function(){
				if(!$(this).parent().hasClass('on')){
					$('.gnb-depth1-list > li').removeClass('on');
					$(this).parent().addClass('on');
				}else{
					$(this).parent().removeClass('on');
				}				
				return false;
			});

			//--3뎁스 있는 2뎁스 클릭
			$('.depth-3-y .gnb-depth2-title').on('click', function(){
				if(!$(this).parent().hasClass('on')){
					$('.gnb-depth2-list > li').removeClass('on');
					$(this).parent().addClass('on');
				}else{
					$(this).parent().removeClass('on');
				}				
				return false;
			});

			//언어
			$('.btn-lang').on('click', function(){
				$('.btn-lang').toggleClass('on');
				return false;
			});			

			if($('.page-menu-list').length > 0) {
				tabMenuMove('.page-menu-list');
			}
		}

		//---only main
		if(window.isMain){			
			//새로고침 - 스크롤 상단
			$('html, body').animate({ scrollTop: 0}, 'fast');

			//intro 시작
			$('#intro').addClass('active');

			// $('#intro').remove();
			// $('html').removeClass('main-intro');
			// $('html').addClass('main-intro-end');		
			// $('header').addClass('white');
			// mainSpot();						
			// $(window).on('scroll', scrollEv);

			//메인 인트로 제거 후
			document.querySelector('#intro').addEventListener('animationend', function(e){
				if(e.target == this) {
					$('#intro').remove();					
					$('.main-intro').addClass('main-intro-end');	
					$('header').addClass('white');	
				}
			});
			//clip-path모션 끝난 후
			document.querySelector('.main-spot').addEventListener('animationend', function(e){	
				if($('html').hasClass('main-intro')){	
					$('html').removeClass('main-intro');						
					mainSpot();						
					$(window).on('scroll', scrollEv);
				}		
			});

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
				if(currentScr + $(window).height() > $('.bg-socio').offset().top + $('.bg-socio').height()){
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
