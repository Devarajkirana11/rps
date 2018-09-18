$(function() {	
	var ng_init = $('#page-content').attr('ng-init')
	if (typeof ng_init === typeof undefined) { // only to the static pages such as contact us, faq and abouts us etc...
		$('body').addClass('loaded');
	}
	var $window = $(window);
	// $window.resize(function() {
	if ($window.width() < 768) {
		$('.hotel-list-container .room-type-slider').addClass('room-type-list-slider');
	}
	// })
	setTimeout(function () {
		$('.room-type-list-slider').slick({
			dots: false,
			infinite: true,
			speed: 300,
			slidesToShow: 1,
			slidesToScroll: 1
		});
	}, 3000);

	owl = $('#owl-carousel');
	owl.owlCarousel({
		loop: true,
		margin: 10,
		nav: false,
		items: 1
	});

	// TOGGLE SEARCH OPTIONS
	$('.toggle-search-options').on('click', function() {
		$('#fixed-search-bar').toggleClass('search-form-visible');
	})

	// REVIEW SLIDER
	$('.review-container').slick({
		dots: false,
		infinite: true,
		speed: 300,
		slidesToShow: 1,
		slidesToScroll: 1
	});
	$window.scroll(function () {
		var sticky = $('body'),
			scroll = $(window).scrollTop();

		if (scroll >= 10) sticky.addClass('header-fixed');
		else sticky.removeClass('header-fixed');
	});
	$('body').delegate('.room-amenities .view-amenities', 'click', function () {
		$(this).closest('.room-amenities').find('.amenities-container').toggleClass('amenities-hidden');

		if ($(this).text() == 'View all amenities') {
			$(this).text('Hide all amenities');
		} else {
			$(this).text('View all amenities');
		}
	});
	$('body').delegate('.toggle-room-amenities', 'click', function () {
		console.log('works');
		$(this).next().toggleClass('active');
	})


	$('[data-toggle-class]').on('click', function (e) {
		var __this = $(this);              // store the current element
		e.preventDefault();                // Prevent the default behaviour

		var x = [];

		// Store the classes & target elements in array
		var classes = __this.data('toggle-class').split(','),
			targets = (__this.data('target') && __this.data('target').split(',')) || x(__this),
			key = 0;


		$.each(classes, function (index, value) {
			var target = targets[(targets.length && key)];  // Store all the classes inside target variable
			// ( value.indexOf( '*' ) !== -1 );
			$(target).toggleClass(value);
			key++;
		});

	});
	$('.directions-toggle-button').on('click', function () {
		$('.directions-container').toggleClass('content-expanded')
	})
	$('#check-out-date').blur();
	$('.booknow-container button').on('click', function () {
		if ($(this).text() == 'Proceed') {
			$('.hotel-list-summary').toggleClass('summary-hidden');
		}
	});
	$('body').delegate('.summary-close-button', 'click', function () {
		$('.hotel-list-summary').toggleClass('summary-hidden');
		console.log('asdasdasd');
	})
	$('#guests-input, #res-search-submit').on('click', function () {
		$('.guests-selection-container').toggleClass('active');
	})
})