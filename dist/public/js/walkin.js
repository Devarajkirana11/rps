jQuery(document).ready(function(){
	
		var type_array = [""];
	
		$.ajax({
		url: "/search/ajax",
		type: "POST", 
		data: { ajaxid: 12 },
		success: function(response) {
			$.each( response.data, function( key, item ) {
				type_array[item.value] = item.text;
			});
		},
		error: function(xhr) { 
				type_array = ["","Single room", "Double Room", "Twin", "Twin/Double" , "Triple Room" , "Quadruple" , "Family" , "Suite" , "Studio" , "Apartment" , "Dorm Room" , "Bed in Dorm Room" , "Bungalow" , "Chalet" , "Villa" , "Vacation Home" , "Mobile Home" , "Tent" , "Super Single" , "Standard Twin" , "Signature Queen", "Signature King" , "Deluxe Family"];
		}
		});
	
		var searchMinDate = "m";
		var check_in = $("#check_in").val();
		var d = new Date();
		var startDate = $.datepicker.formatDate("dd-mm-yy", d);
		if(startDate >= check_in){ $(".check-in-booking").show(); } else { $(".check-in-booking").hide(); }
	
		var country_code = '';
		var hotel_id = $("#hotel_id").val();
		$.ajax({
		url: "/search/ajax",
		type: "POST", 
		async: false,
		data: { ajaxid: 19, hotel_uuid:hotel_id },
		success: function(response) {
			country_code = response.data._country_id;
			$("#hotel_country_code").val(country_code);
		},
		error: function(xhr) { alert('Sold Out'); }
		});
	
		var hotel_country_code = $("#hotel_country_code").val();
		$("#check_in").datepicker({
			dateFormat: "dd-mm-yy",
			minDate: -1,
			onClose: function (selectedDate) {
				$("#check_in").datepicker('setDate', selectedDate);
				var selectedDate = $(this).datepicker('getDate');
				var selectedDate = new Date(selectedDate);
				selectedDate.setDate(selectedDate.getDate() + 1);
				$("#check_out").datepicker( "option", "minDate", selectedDate );
			}
		});
	
		$("#check_out").datepicker({
			dateFormat: "dd-mm-yy",
			minDate: searchMinDate,
			onClose: function (selectedDate) {
				$("#check_out").datepicker('setDate', selectedDate);
			}
		});
	
		$(".transaction_referrence_id").hide();
		$(".booking-status").hide();
	
		$(document).on("change","#room_type",function(){
			var room_type = $(this).val();
			var hotel_id = $("#hotel_id").val();
			var check_in = $("#check_in").val();
			var check_out = $("#check_out").val();
			var ids = $(this).attr("data-id");
			var total_rooms = $("#noofrooms").val();
			var exists_rooms = [];
	
			$(".room_no").each(function() {
				var r_number = $(this).val();
				if(r_number > 0){ exists_rooms.push(r_number); }
			});
	
			if(room_type > 0){
				$.ajax({
				url: "/inventory/booking/availability/room-numbers?hotel_uuid="+hotel_id+"&room_type="+room_type+"&check_in="+check_in+"&check_out="+check_out,
				type: "GET", 
				data: {  },
				success: function(response) { 
					if(response.success){
	
						var options = '<option value="">Select</option>';
						$.each( response.data.availableRooms, function( key, value ) {
							var room_number_value = value;
							if( $.inArray(room_number_value, exists_rooms) == -1 ){
								options += '<option value="'+room_number_value+'">'+room_number_value+'</option>';
							}
						});
						$("#room_no"+ids).html(options);
					}
				},
				error: function(xhr) { alert('Sold Out'); }
				});
			}
		})
	
		$("#search-details").click(function(){
			var email = $("#email").val();
			
			$.ajax({
			url: "/search/ajax",
			type: "POST", 
			data: { ajaxid: 16, email:email },
			success: function(response) { 
				if(response.success){
					$("#first_name").val(response.data[0]._firstname);
					$("#last_name").val(response.data[0]._lastname);
					$("#mobile_code").val(response.data[0]._mobileno_stdcode);
					$("#mobile_number").val(response.data[0]._mobileno);
					$("#phone_code").val(response.data[0]._phoneno_stdcode);
					$("#phone_number").val(response.data[0]._phoneno);
					$("#ic_no").val("");
					$("#nationality").val(response.data[0]._nationality);
					$("#address").val(response.data[0]._address);
					$("#address2").val(response.data[0]._address2);
					$("#country").val(response.data[0]._country);
					if(response.data[0]._country){
						$.ajax({url:'/location/getStatesByCountry',type:'post',datatype:'json',data:{'inputval':response.data[0]._country},
						success:function(res){
							if(res.success){
								var template = '<option value=" ">Select</option>';
								if(res.data!== undefined) { Object.keys(res.data).forEach(key=>{ template += '<option value="'+key+'">'+res.data[key]['name']+'</option>'; 	}) }
								$("#state").html(template);
								$("#state").val(response.data[0]._state);
							}
						}});
						if(response.data[0]._state){
							$.ajax({url:'/location/getCitiesByState',type:'post',datatype:'json',data:{'inputval':response.data[0]._state},
							success:function(res){
								if(res.success){
									var template = '<option value=" ">Select</option>';
									if(res.data!== undefined) { Object.keys(res.data).forEach(key=>{ template += '<option value="'+key+'">'+res.data[key]['name']+'</option>'; 	}) 	}
									$("#city").html(template);
									$("#city").val(response.data[0]._city);
								}
							}});
						}
					}
					$("#postal_code").val(response.data[0]._postal_code);
					$("#ic_numbers").val(response.data[0]._ic_number);
					var gender = response.data[0]._gender;
					if(gender == 'Female'){ 
						$("#checkout-gender-female").attr("checked","checked");
					} else {
						$("#checkout-gender-male").attr("checked","checked");
					}
					var identification_type = response.data[0]._identification_type;
					if(identification_type == 'PASSPORT'){ 
						$("#passport").attr("checked","checked");
					} else {
						$("#ic_number").attr("checked","checked");
					}		
	
					var total = $("#total_room_price").val();
					calculatePrices(total);
	
				}
			},
			error: function(xhr) {   }
			});
		});
	
		var number = $("#adults").val();
		var noofrooms = $("#adults").attr("data-noofrooms");
		var option = '<option value="">Select</option>';
		var i = 1;
		if(number > 0){
			for(i = 1; i <= number; i++ ){
				if(i == noofrooms){
					option += '<option value="'+i+'" selected="selected">'+i+'</option>';
				} else {
					option += '<option value="'+i+'">'+i+'</option>';
				}
			}
			$("#noofrooms").html(option);
		}
	
		$("#adults").blur(function(){
			var number = $(this).val();
			var option = '<option value="">Select</option>';
			var i = 1;
			if(number > 0){
				for(i = 1; i <= number; i++ ){
					option += '<option value="'+i+'">'+i+'</option>';
				}
				$("#noofrooms").html(option);
			}
		});
	
		var hotel_id = $("#hotel_id").val();
		$.ajax({
		url: "/search/get-currency?hotel_id="+hotel_id,
		type: "GET", 
		data: {  },
		success: function(response) { 
			var currency = response.currency;
			$("#paymentCurrency").val(currency);
		},
		error: function(xhr) {   }
		});
	
		$(document).on("change","#noofrooms",function(){
			var hotel_id = $("#hotel_id").val();
			var check_in = $("#check_in").val();
			var check_out = $("#check_out").val();
			var nums = $(this).val();
			$.ajax({
			url: "/hotels-manager/manager/rates/sell/walk-in?hotel_uuid="+hotel_id,
			type: "POST", 
			data: { check_in:check_in, check_out:check_out },
			success: function(response) { 
				var options = '<option value="">Select</option>';
				$.each( response.data.rooms, function( key, value ) {
				options += '<option value="'+value.type+'">'+type_array[value.type]+'</option>';
				});
				if(nums > 0){
					var i = 0;
					var text = '';
					for (i = 0; i < nums; i++) { 
						text += '<div class="row row-xl room-details-items"><div class="col-md-4"><div class="form-group"><label class="" for="type">Type</label><div class="select-wrapper"><select data-id="'+i+'" id="room_type" name="room_type[]" class="room_types'+i+' form-control">'+options+'</select></div></div></div><div class="col-md-4"><div class="form-group"><label class="" for="roomno">Room No</label><div class="select-wrapper"><select id="room_no'+i+'" name="room_no[]" class="room_no form-control"></select></div></div></div><div class="col-md-4" style="display:none;"><input type="checkbox" name="breakfast_included[]" value="Yes">BreakFast Included</div><input type="hidden" id="room_price'+i+'" name="room_price[]" class="room_price form-control"></div>';
					}	
					$("#room_details").html(text);
				} else {
					alert("Please enter the no of rooms");
				}
			},
			error: function(xhr) {   }
			});
		});
	
		$(".ota-values").hide();
		$(".corporate-values").hide();
		$(".agent-values").hide();
	
		$(".paid-ota-button").hide();
		$(document).on('click','.booking-channel',function(){
			var vals = $(this).val();
			if(vals == 'OTA'){
				$(".ota-values").show();
				$(".corporate-values").hide();
				$(".agent-values").hide();
				$(".calculate-button").show();
				$("#total_room_price").removeAttr('readonly');
			} else if(vals == 'CORPORATE'){
				$(".corporate-values").show();
				$(".agent-values").hide();
				$(".ota-values").hide();
				$(".calculate-button").show();
				$("#total_room_price").removeAttr('readonly');
			} else if(vals == 'AGENT'){
				$(".agent-values").show();
				$(".ota-values").hide();
				$(".corporate-values").hide();
				$(".calculate-button").show();
				$("#total_room_price").removeAttr('readonly');
			} else {
				$(".ota-values").hide();
				$(".corporate-values").hide();
				//$(".calculate-button").hide();
				$(".paid-ota-button").hide();	
				$(".agent-values").hide();
				$("#service_fee").attr('readonly', 'true');
				$("#total_tax").attr('readonly', 'true');
				$("#final_total_amount").attr('readonly', 'true');
				$("#discountAmount").attr('readonly', 'true');
				$("#priceAfterDiscount").attr('readonly', 'true');
				$("#tourismtax").attr('readonly', 'true');
			}
		});	
	
		var test = '[{"type": "1","occupancy": "1","averageCost": 0,"totalCost": 150},{"type": "2","occupancy": "1","averageCost": 0,"totalCost": 75 }]';
	
		var array = JSON.parse(test);
	
		$("#check_out").change(function(){
			var hotel_id = $("#hotel_id").val();
			var check_in = $("#check_in").val();
			var check_out = $("#check_out").val();
			$.ajax({
			url: "/hotels-manager/manager/rates/sell/walk-in?hotel_uuid="+hotel_id,
			type: "POST", 
			data: { check_in: check_in, check_out:check_out },
			success: function(response) { 
				if(response.success){
					var array = response.data.rooms;
	
					$(document).on("change",".room_no",function(){
						var total = 0;
						var i = 0;
						$(".room-details-items").each(function(){
							var room_type = $(".room_types"+i).val();
							$.each( array, function( key, value ) {
								if(room_type == value.type){
									$("#room_price"+i).val(value.totalCost);
									total = total + parseFloat(value.totalCost);
								}
							});
						i++;
						});	
	
						calculatePrices(total);
	
					});
	
					$("#discount-percentage").change(function(){
	
						var total = $("#total_room_price").val();
						calculatePrices(total);
	
					});
	
					$("#nationality").change(function(){
						
						var total = $("#total_room_price").val();
						calculatePrices(total);
	
					});
	
				} else {
					var test = '[{"type": "1","occupancy": "1","averageCost": 0,"totalCost": 150},{"type": "2","occupancy": "1","averageCost": 0,"totalCost": 75 }]';
				}
			},
			error: function(xhr) {   }
			});
	
		});
	
		$("#walkin_reservation").on('submit', function(e) {
			$(this).attr('disabled', true);
			var amount_paid = $("#amount_paid").val();
			if (amount_paid > 0) {
			} else {
				e.preventDefault();
				alert("Please enter the amount paid");
				return false;
			}
		});
	
		$("#check_in").change(function(){
			var check_in = $(this).val();
			$(".check-in-value").html(check_in);
		});	
	
		$("#check_out").change(function(){
			var check_out = $(this).val();
			$(".check-out-value").html(check_out);
			var check_in = $("#check_in").val();
			var parts = check_in.split('-');
			var dmyDate = parts[1] + '/' + parts[0] + '/' + parts[2];
			var date2 = new Date(dmyDate);
			var check_out = $("#check_out").val();
			var parts = check_out.split('-');
			var dmyDate = parts[1] + '/' + parts[0] + '/' + parts[2];
			var date1 = new Date(dmyDate);
			var diff = date1 - date2;
			var difference = Math.ceil(diff / 1000 / 60 / 60 / 24);
			if(difference > 0){ $("#noofnights").val(difference); }
		});	
	
		$("#noofrooms").change(function(){
			var noofrooms = $(this).val();
			$(".no-of-rooms-value").html(noofrooms);
		});	
	
		$("#adults").change(function(){
			var adults = $(this).val();
			$(".adults-value").html(adults);
		});
	
		$("#kids").change(function(){
			var kids = $(this).val();
			$(".kids-value").html(kids);
		});
	
		$("#check_out").change(function(){
			var hotel_id = $("#hotel_id").val();
			var check_in = $("#check_in").val();
			var check_out = $("#check_out").val();
	
			$.ajax({
				url: "/hotels-manager/manager/rates/sell/walk-in?hotel_uuid="+hotel_id,
				type: "POST", 
				data: { check_in: check_in, check_out:check_out },
				success: function(response) { 
					if(response.success){
						var array = response.data.rooms;
							var total = 0;
							var i = 0;
							$(".room-details-items").each(function(){
								var room_type = $(".room_types"+i).val();
								$.each( array, function( key, value ) {
									if(room_type == value.type){
										total = total + parseFloat(value.totalCost).toFixed(2);
									}
								});
							i++;
							});	
							if(total > 0){
								calculatePrices(total);
							} 
					} else {
						var test = '[{"type": "1","occupancy": "1","averageCost": 0,"totalCost": 150},{"type": "2","occupancy": "1","averageCost": 0,"totalCost": 75 }]';
					}
				},
				error: function(xhr) {   }
			});
		
		});				
	
		var check_in = $("#check_in").val();
		$(".check-in-value").html(check_in);
		var check_out = $("#check_out").val();
		$(".check-out-value").html(check_out);
		var noofrooms = $("#noofrooms").val();
		$(".no-of-rooms-value").html(noofrooms);
		var adults = $("#adults").val();
		if(adults > 0 ){
			var k = $("#noofrooms_values").val();
			var options = '<option value="">Select</option>';
			for (var i = 0; i < adults; i++) {
				var j = i + 1;
				if(j == k){
					options += '<option value="'+j+'" selected="selected">'+j+'</option>';
				} else {
					options += '<option value="'+j+'">'+j+'</option>';
				}
			}
			$("#noofrooms").html(options);
		}
		$(".adults-value").html(adults);
		var kids = $("#kids").val();
		$(".kids-value").html(kids);
	
		$(".room-type-item").each(function(){
			var room_type = $(this).val();
			if(room_type > 0){
			var hotel_id = $("#hotel_id").val();
			var check_in = $("#check_in").val();
			var check_out = $("#check_out").val();
			var ids = $(this).attr("data-id");
			var total_rooms = $("#noofrooms").val();
			var data = $('#room_number_values').val();
			var arr = data.split(',');
	
			$.ajax({
			url: "/inventory/booking/availability/room-numbers?hotel_uuid="+hotel_id+"&room_type="+room_type+"&check_in="+check_in+"&check_out="+check_out,
			type: "GET", 
			data: {  },
			success: function(response) { 
				var options = '<option value="">Select</option>';
				$.each( response.data.availableRooms, function( key, value ) {
					var room_number_value = value;
					if(jQuery.inArray(room_number_value, arr) != -1) {
						options += '<option value="'+room_number_value+'" selected="selected">'+room_number_value+'</option>';
					} else {
						options += '<option value="'+room_number_value+'">'+room_number_value+'</option>';
					} 
				});
				$("#room_no"+ids).html(options);
			},
			error: function(xhr) { }
			});
			
			}
		});
	
		//$("#total_room_price").attr('readonly', 'true');
		$("#service_fee").attr('readonly', 'true');
		$("#total_tax").attr('readonly', 'true');
		$("#final_total_amount").attr('readonly', 'true');
		$("#discountAmount").attr('readonly', 'true');
		$("#priceAfterDiscount").attr('readonly', 'true');
		$("#tourismtax").attr('readonly', 'true');
		//$(".calculate-button").hide();
	
	
		$(".calculate-button").click(function(){
			var hotel_country_code = $("#hotel_country_code").val();
			if(hotel_country_code == "132"){
				var tax_percentage = 6;
			} else if(hotel_country_code == "217") {
				var tax_percentage = 7;
			} else {
				var tax_percentage = 6;
			}

			var total = $("#total_room_price").val();
			var service_fee = (parseFloat(total) * parseFloat(10)) / parseFloat(100);
			var total_before_tax = parseFloat(total) + parseFloat(service_fee);
			var tax = parseFloat(total_before_tax * tax_percentage) / parseFloat(100);
			//var tax = Math.round(tax).toFixed(2);

			var nationality = $("#nationality").val();
			var no_of_rooms = $("#noofrooms").val();
			var noofnights = $("#noofnights").val();

			if(nationality != 'Malaysia' && hotel_country_code == 132){
				if(no_of_rooms > 0 && noofnights > 0){
					var tourism_tax = (parseFloat(noofnights) * parseFloat(no_of_rooms)) * 10;
				} else {
					var tourism_tax = 0;	
				}
			} else {
				var tourism_tax = 0;
			}
			var total_after_tax = parseFloat(total_before_tax) + parseFloat(tax) + parseFloat(tourism_tax);

			$("#service_fee").val(parseFloat(service_fee).toFixed(2));
			$("#total_tax").val(parseFloat(tax).toFixed(2));
			$("#discountAmount").val('0');
			$("#priceAfterDiscount").val(total);
			$("#tourismtax").val(parseFloat(tourism_tax).toFixed(2));
			$("#final_total_amount").val(parseFloat(total_after_tax).toFixed(2));
			$("#net_total_amount").val(parseFloat(total_after_tax).toFixed(2));
			$("#amount_to_be_collected").val(parseFloat(total_after_tax).toFixed(2));
	
		});
	
		$(".additional-identification-block").hide();
	
		$("#additional_identification").click(function(){
			if($(this).is(':checked')){
				$(".additional-identification-block").show();
			} else {
				$(".additional-identification-block").hide();
			}
			var total = $("#total_room_price").val();
			calculatePrices(total);
		});
	
		function calculatePrices(totalroomPrice){
	
			var no_of_rooms = $("#noofrooms").val();
			var noofnights = $("#noofnights").val();
			var nationality = $("#nationality").val();
			var discount_vals = $("#discount-percentage").val();
			var hotel_country_code = $("#hotel_country_code").val();
	
			if(hotel_country_code == "132"){
				var tax_percentage = 6;
			} else if(hotel_country_code == "217") {
				var tax_percentage = 7;
			} else {
				var tax_percentage = 6;
			}
	
			var total = totalroomPrice;
	
			/* Start of tourism tax calculation */
	
			if($("#additional_identification").is(':checked')){
				var tourism_tax = 0;			
			} else {
				if(nationality != 'Malaysia' && hotel_country_code == 132){
					if(no_of_rooms > 0 && noofnights > 0){
						var tourism_tax = (parseFloat(noofnights) * parseFloat(no_of_rooms)) * 10;
					} else {
						var tourism_tax = 0;	
					}
				} else {
					var tourism_tax = 0;
				}
			}
	
			/* End of tourism tax calculation */
	
			/* Start of discount calculation */
	
			if(discount_vals > 0){
				var rate_discount = total*(discount_vals/100);
				var total = parseFloat(total) - parseFloat(rate_discount);
			}	
	
			/* End of discount calculation */
	
			/* Start of service Fee Calculation */
	
			/*if(hotel_country_code == 132){
				var service_fee = (parseFloat(total) * parseFloat(10)) / parseFloat(100);
			} else {*/
				//var service_fee = 0;
			//}	
	
			/* End of Service Fee calculation */
	

			var service_fee = (parseFloat(total) * parseFloat(10)) / parseFloat(100);
			
			var total_before_tax = parseFloat(total) + parseFloat(service_fee);
	
			var tax = (parseFloat(total_before_tax) * parseFloat(tax_percentage)) / parseFloat(100);
			
			//var tax = Math.round(tax).toFixed(2);
			
			var total_after_tax = parseFloat(total_before_tax) + parseFloat(tax) + parseFloat(tourism_tax);	
			
			$("#total_room_price").val(parseFloat(totalroomPrice).toFixed(1));
			if(rate_discount > 0 ){ $("#discountAmount").val(parseFloat(rate_discount).toFixed(1)); } else { $("#discountAmount").val("0"); }
			$("#priceAfterDiscount").val(parseFloat(total).toFixed(1));
			$("#service_fee").val(parseFloat(service_fee).toFixed(1));
			$("#total_tax").val(parseFloat(tax).toFixed(1));
			$("#net_total_amount").val(parseFloat(total_after_tax).toFixed(1));
			$("#tourismtax").val(parseFloat(tourism_tax).toFixed(2));
			$("#final_total_amount").val(parseFloat(total_after_tax).toFixed(1));
	
		}
	
			$("#walkin-reservation-form").submit(function(){
				if(!$("#check_in").val()){
					alert("Please select the check in date");
					return false;
				} else if(!$("#check_out").val()){
					alert("Please select the check out date");
					return false;
				} else if(!$("#adults").val()){
					alert("Please enter the no of adults");
					return false;
				} else if(!$("#noofrooms").val()){
					alert("Please select the no of rooms");
					return false;
				} else if(!$("#room_type").val()){
					alert("Please select the room type");
					return false;
				} else if(!$(".room_no").val()){
					alert("Please select the room number");
					return false;
				} else if($('input[name=booking_channel]:checked').length<=0) {
					alert("Please select the booking channel");
					return false;
				} else if(!$("#first_name").val()){
					alert("Please enter the first name");
					return false;
				} else if(!$("#last_name").val()){
					alert("Please enter the last name");
					return false;
				} else if(!$("#ic_numbers").val()){
					alert("Please enter the IC Number");
					return false;
				} else if(!$("#nationality").val()){
					alert("Please enter the nationality");
					return false;
				} else if(!$("#final_total_amount").val()){
					alert("Please select the check out date");
					return false;
				} else {
					return true;
				}
			});
	
			$(".company-information-block").hide();
			
			$("#add-company-details").click(function(){
				if($(this).is(':checked')){
					$(".company-information-block").show();
				} else {
					$(".company-information-block").hide();
				}
			});

	
	});	