$(function() {
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
			key ++;
		});

	});

	$('[data-toggle="nav-submenu"]').on('click', function (e) {
		e.stopPropagation();                // Prevent the default behaviour
		var $link = $(this);           // Get the current <a> tag
		var $parentLi = $link.parent('li'); // Get the parent of the <a> tag

		if ($parentLi.hasClass('open')) {   // Check if 'open' is already added to the <li>
			$parentLi.removeClass('open');  // Remove the class if added (close the accordion menu)
		} else {                            // .. else if submenu is closed, close all other (same level) submenus first before open it
			$link.closest('ul')             // Find the closes ul > li and remove the class
				.find('> li')
				.removeClass('open');

			$parentLi.addClass('open');     // Add the class 'open' to the <li>
		}
	});


	$('.scrollbar-padder').mCustomScrollbar({
		autoHideScrollbar: true,
		alwaysShowScrollBar: 0,
		scrollInertia: 60
	});


	// Substring function to match the strings
	var substringMatcher = function(strs) {
		return function findMatches(q, cb) {
			var matches, substrRegex;

			// an array that will be populated with substring matches
			matches = [];

			// regex used to determine if a string contains the substring `q`
			substrRegex = new RegExp(q, 'i');

			// iterate through the pool of strings and for any string that
			// contains the substring `q`, add it to the `matches` array
			$.each(strs, function(i, str) {
				if (substrRegex.test(str)) {
					matches.push(str);
				}
			});

			cb(matches);
		};
	};

	var hotel_id = $("#hotel_name").html();

	$.ajax({
	url: "/search/ajax",
	type: "POST", 
	data: { ajaxid: 10, hotel_uuid:hotel_id},
	success: function(response) { 
		var bookingDocuments = [];
		if(response.success){

			var bookings = response.data;

			$.each( bookings, function( key, value ) {
				bookingDocuments.push({
					uuid: value.uuid,
					firstName: value.guest.firstName,
					lastName: value.guest.lastName,
					status: value.status,
					referenceId: value.referenceId,
					hotel_uuid: hotel_id
				});
			});

	
			var engine = new Bloodhound({
				datumTokenizer: Bloodhound.tokenizers.obj.whitespace(['referenceId', 'firstName']),
				queryTokenizer: Bloodhound.tokenizers.whitespace,
				local: bookingDocuments
			});



			// Basic Typeahead
			$('.header-search-input').typeahead({
				hint: true,
				highlight: true,
				minLength: 1
			},
			{
				// name: 'booking-documents',
				display: 'referenceId',
				source: engine.ttAdapter(),
				templates: {
					empty: '<p class="m-n p-lg">No results found</p>',
					suggestion: function(d) {
						return '<div><a style="height: auto; line-height: 100%;" href="/pms/booking-details?booking_uuid=' + d.uuid + '&hotel_id=' + d.hotel_uuid + '" class="p-n text-default"><p class="m-n m-sm-b"><span clas="pull-left">' + d.referenceId + '</span><span class="pull-right text-capitalize"><small class="fs-xs ' + d.status + '">' + d.status +'</small></span></p><p class="m-n text-capitalize">' + d.firstName.toLowerCase() + ' ' + d.lastName.toLowerCase() + '</p></a></div>';
					}
				}
			});

			$('.header-search-input').on('typeahead:selected', function(e, s) {
				window.location.href = '/pms/booking-details?booking_uuid=' + s.uuid;
			})
		}
	},
	error: function(xhr) {   }
	});

	$('.close-grandparent-div').on('click', function() {
        $(this).parent().parent().remove();
    })


	// var listItems = $('.sidebar-navigation').find('li');
	// var pathname = window.location.pathname;
	
	// listItems.each(function(i, e) {
	// 	// var li = $(e);
	// 	var href = $(this).find('a').attr('href').split('?')[0];

	// 	// console.log(href);
		
	// 	if('/' + href == pathname) {
	// 		$(this).addClass('active');

	// 		$(this).parents('li').addClass('open');
	// 	}
	// })
})
