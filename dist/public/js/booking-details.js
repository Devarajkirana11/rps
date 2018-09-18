	jQuery(document).ready(function () {

		$(".no-show").click(function () {
			var action = $(this).attr('id');
			var hotel_id = $("#hotel_id").val();
			var bookingUuid = $(this).attr("data-bookingUuid");
			let user_uuid = $("#logged_in_id").val();
			$.ajax({
				url: "/inventory/booking/no-show?hotel_uuid=" + hotel_id,
				type: "PUT",
				data: { booking_uuid: bookingUuid, user_uuid: user_uuid },
				success: function (response) {
					window.location.reload();
				},
				error: function (xhr) { }
			});
		});

		$(".booking-action").click(function () {
			var action = $(this).attr('id');
			var hotel_id = $("#hotel_id").val();
			var bookingUuid = $(this).attr("data-bookingUuid");
			var booking_source = $("#booking_source").val();
			if (action == 'OUT') {
				var bookinguuid = $("#bookinguuid").val();
				var depositamount = $("#depositamount").val();
				var lossdamagefee = $("#lossdamagefee").val();
				var lossdamagefeecollected = $("#lossdamagefeecollected").val();
				var depositrefund = $("#depositrefund").val();
				var first_name = $("#guest_first_name").val();
				var last_name = $("#guest_last_name").val();
				var guest_name = first_name + ' ' + last_name;
				var guest_email = $("#guest_email_address").val();
				var booking_referenceId = $("#booking_referenceId").val();
				$.ajax({
					url: "/search/ajax",
					type: "POST",
					data: { ajaxid: 13, booking_source:booking_source,hotel_id: hotel_id, booking_referenceId: booking_referenceId,guest_name: guest_name, guest_email: guest_email, bookinguuid: bookinguuid, depositamount: Number(depositamount), lossdamagefee: Number(lossdamagefee), lossdamagefeecollected: Number(lossdamagefeecollected), depositrefund: Number(depositrefund) },
					success: function (response) {
						$.ajax({
							url: "/inventory/booking/vacancy?hotel_uuid=" + hotel_id,
							type: "PUT",
							data: { booking_uuid: bookingUuid, status: action },
							success: function (response) {
								window.location.reload();
							},
							error: function (xhr) { }
						});
					},
					error: function (xhr) { }
				});
			} else {
				if($(".deposit").length > 0){
					if ($(".deposit").is(':checked')) {
						var first_name = $("#guest_first_name").val();
						var last_name = $("#guest_last_name").val();
						var guest_name = first_name + ' ' + last_name;
						var guest_email = $("#guest_email_address").val();
						var depositamount = $("#depositamount").val();
						var payment_type = $("#payment_type").val();
						var transaction_referrence_id = $("#transaction_referrence_id").val();
						var dca = 0;
						if ($("#deposit-yes").is(':checked')) { 
							dca = depositamount; 
							if(!payment_type){
								alert("Please select the payment type");
								return false;
							}
						} else { 
							dca = 0; 
						}
						var bookinguuid = $("#bookinguuid").val();
						var booking_referenceId = $("#booking_referenceId").val();
						$.ajax({
							url: "/search/ajax",
							type: "POST",
							data: { ajaxid: 15, booking_source:booking_source,hoteluuid:hotel_id,booking_referenceId:booking_referenceId,transaction_referrence_id:transaction_referrence_id,payment_type:payment_type,guest_name: guest_name, guest_email: guest_email, bookinguuid: bookinguuid, depositCollected: dca },
							success: function (response) {
								$.ajax({
									url: "/inventory/booking/vacancy?hotel_uuid=" + hotel_id,
									type: "PUT",
									data: { booking_uuid: bookingUuid, status: action },
									success: function (response) {
										window.location.reload();
									},
									error: function (xhr) { }
								});

							},
							error: function (xhr) { }
						});
					} else {
						alert("Please select the deposit is collected or not");
						return false;
					}
				} else {
					var bookinguuid = $("#bookinguuid").val();
					$.ajax({
						url: "/search/ajax",
						type: "POST",
						data: { ajaxid: 22, bookinguuid: bookinguuid },
						success: function (response) {
							$.ajax({
								url: "/inventory/booking/vacancy?hotel_uuid=" + hotel_id,
								type: "PUT",
								data: { booking_uuid: bookingUuid, status: action },
								success: function (response) {
									window.location.reload();
								},
								error: function (xhr) { }
							});

						},
						error: function (xhr) { }
					});
				}
			}
		});

		$(".loss-damage-fee-block").hide();

		$(document).on('click', '.lossanddamage', function () {
			var vals = $(this).val();
			if (vals == 'Yes') {
				$(".loss-damage-fee-block").show();
			} else {
				$("#lossdamagefeecollected").val("0");
				$("#lossdamagefee").val("0");
				var depositamount = $("#depositamount").val();
				$("#depositrefund").val(depositamount);
				$(".loss-damage-fee-block").hide();
			}
		});

		$("#lossdamagefee").blur(function () {
			var vals = $(this).val();
			var depositamount = Number($("#depositamount").val()) ? $("#depositamount").val() : 0;
			var lossdamagefee = Number($(this).val()) ? $(this).val() : 0;
			var deposit_refund = parseFloat(depositamount) - parseFloat(lossdamagefee);
			if (deposit_refund > 0) {
				$("#lossdamagefeecollected").val("0");
				$("#depositrefund").val(deposit_refund);
			} else {
				var deposit_refund = - deposit_refund;
				$("#lossdamagefeecollected").val(deposit_refund);
				$("#depositrefund").val("0");
			}
		});

		$(".booking-cancel").click(function () {
			var booking_uuid = $(this).attr("id");
			if (booking_uuid) {
				var r = confirm("Are you sure want to cancel this booking?");
				if (r == true) {
					$.ajax({
						url: "/inventory/booking/cancellation",
						type: "PUT",
						data: { booking_uuid: booking_uuid },
						success: function (response) {
							window.location.reload();
						},
						error: function (xhr) { }
					});
				} else {

				}
			}
		});

		var type_array = [""];

		$.ajax({
			url: "/search/ajax",
			type: "POST",
			data: { ajaxid: 12 },
			success: function (response) {
				$.each(response.data, function (key, item) {
					type_array[item.value] = item.text;
				});
			},
			error: function (xhr) {
				type_array = ["", "Single room", "Double Room", "Twin", "Twin/Double", "Triple Room", "Quadruple", "Family", "Suite", "Studio", "Apartment", "Dorm Room", "Bed in Dorm Room", "Bungalow", "Chalet", "Villa", "Vacation Home", "Mobile Home", "Tent", "Super Single", "Standard Twin", "Signature Queen", "Signature King", "Deluxe Family"];
			}
		});

		$(".room-type-value").each(function (index, element) {
			var hotel_id = $("#hotel_id").val();
			var check_in = $("#check_in").val();
			var check_out = $("#check_out").val();
			var room_type = $(this).val();
			var room_value = $(this).attr("data-room-number");
			$.ajax({
				url: "/hotels-manager/manager/rates/sell/walk-in?hotel_uuid=" + hotel_id,
				type: "POST",
				data: { check_in: check_in, check_out: check_out },
				success: function (response) {
					var options = '<option value="">Select</option>';
					$.each(response.data.rooms, function (key, value) {
						if (room_type == value.type) {
							options += '<option value="' + value.type + '" selected="selected">' + type_array[value.type] + '</option>';
						} else {
							options += '<option value="' + value.type + '">' + type_array[value.type] + '</option>';
						}
					});
					var text = '';
					text += '<div class="row row-xl room-details-items"><div class="col-md-6"><div class="form-group"><label class="" for="type">Type</label><div class="select-wrapper"><select id="room_type" data-count="' + index + '" name="room_type" class="room_types form-control">' + options + '</select></div></div></div><div class="col-md-6"><div class="form-group"><label class="" for="roomnumber">Room No</label><div class="select-wrapper"><select id="new_room_number' + index + '" name="new_room_number" class="new_room_number form-control"></select></div></div></div></div>';
					$("#room_details" + index).html(text);
					$.ajax({
						url: "/inventory/booking/availability/room-numbers?hotel_uuid=" + hotel_id + "&room_type=" + room_type + "&check_in=" + check_in + "&check_out=" + check_out,
						type: "GET",
						success: function (response) {
							if (response.success) {
								var option = '<option value="">Select</option>';
								option += '<option value="' + room_value + '" selected="selected">' + room_value + '</option>';
								$.each(response.data.availableRooms, function (key, value) {
									var room_number_value = value;
									/*if (room_value == room_number_value) {
										option += '<option value="' + room_number_value + '" selected="selected">' + room_number_value + '</option>';
									} else {*/
										option += '<option value="' + room_number_value + '">' + room_number_value + '</option>';
									//}
								});

								$("#new_room_number" + index).html(option);
							}
						},
						error: function (xhr) { }
					});
				},
				error: function (xhr) { }
			});

		});

		$(document).on("change", ".room_types", function () {
			var room_type = $(this).val();
			var count = $(this).attr("data-count");
			var hotel_id = $("#hotel_id").val();
			var check_in = $("#check_in").val();
			var check_out = $("#check_out").val();
			if (room_type > 0) {
				$.ajax({
					url: "/inventory/booking/availability/room-numbers?hotel_uuid=" + hotel_id + "&room_type=" + room_type + "&check_in=" + check_in + "&check_out=" + check_out,
					type: "GET",
					data: {},
					success: function (response) {
						var options = '<option value="">Select</option>';
						if (response.success) {
							$.each(response.data.availableRooms, function (key, value) {
								var room_number_value = value;
								options += '<option value="' + room_number_value + '">' + room_number_value + '</option>';
							});
						}
						$("#new_room_number" + count).html(options);
					},
					error: function (xhr) { }
				});
			}
		});
		$('#send-email-form').on('submit', function (e) {
			e.preventDefault();
			$.ajax({
				url: $(this).attr('action'),
				type: "POST",
				data: $(this).serialize(),
				error: function () {
					alert("ERROR : CANNOT CONNECT TO SERVER");
				},
				success: function (data) {
					alert("Email Sent");
					window.location.reload();
				}
			});
			return false;
		});

		$(".transaction_referrence_id").hide();

		$(".payment_type").click(function(){
			if($("#payment-pos").is(":checked")){
				$(".transaction_referrence_id").show();
			} else if($("#bank-transfer").is(":checked")){
				$(".transaction_referrence_id").show();
			} else {
				$(".transaction_referrence_id").hide();
			}
		});

		$("#cash-collect-form #cash-collect-button-submit").click(function(e){
			var deposit_type = $("input[name='deposit']:checked").val();
			if(deposit_type){
			} else {
				e.preventDefault(); 
				alert("Please select whether deposit collected or not");
				return false;
			}
			var amount_to_be_collected = $("#amount_to_be_collected").val();
			if(amount_to_be_collected > 0){
				var payment_type = $("input[name='payment_type']:checked").val();
				if(payment_type){
				} else {
					e.preventDefault(); 
					alert("Please select the payment type");
					return false;
				}
			} else {

			}
			if($("#payment-pos").is(":checked")){
				var transaction_referrence_id = $("#transaction_referrence_id").val();
				if(transaction_referrence_id){ 
					 return true; 
				} else { 
					e.preventDefault(); alert("Please enter the transaction id"); return false;
				}
			} else {
				return true;
			}

		});

	$(".transaction_referrence_id").hide();
	$("#payment_type").change(function(){
		var text = $(this).val();
		 if(text == 'POS'){ $(".transaction_referrence_id").show(); } else { $(".transaction_referrence_id").hide(); }
	});

	function payment_collection(){
		var total = $("#total_amount").val() ? $("#total_amount").val() : 0;
		var tourismtax = $("#tourismTax").val() ? $("#tourismTax").val() : 0;
		var deposit = $("#pay-deposit-amount").val() ? $("#pay-deposit-amount").val() : 0;

		if($("#deposit-yes").is(':checked')){
			if($("#paid-in-ota").is(':checked')){
				var amount_paid = parseFloat(total) - parseFloat(tourismtax);
				var amount_to_be_collected = parseFloat(tourismtax) + parseFloat(deposit);
				var main_toal_amount = parseFloat(total) + parseFloat(deposit);
			} else {
				var amount_paid = 0;
				var amount_to_be_collected = parseFloat(total) + parseFloat(deposit);
				var main_toal_amount = parseFloat(total) + parseFloat(deposit);
			}

		} else if($("#deposit-no").is(':checked')) {
			if($("#paid-in-ota").is(':checked')){
				var amount_paid = parseFloat(total) - parseFloat(tourismtax);
				var amount_to_be_collected = parseFloat(tourismtax);
				var main_toal_amount = parseFloat(total);
			} else {
				var amount_paid = 0;
				var amount_to_be_collected = parseFloat(total);
				var main_toal_amount = parseFloat(total);
			}			

		} else {
			if($("#paid-in-ota").is(':checked')){
				var amount_paid = parseFloat(total) - parseFloat(tourismtax);
				var amount_to_be_collected = parseFloat(tourismtax);
				var main_toal_amount = parseFloat(total);
			} else {
				var amount_paid = 0;
				var amount_to_be_collected = parseFloat(total);
				var main_toal_amount = parseFloat(total);
			}				
		}

		$("#amount_paid").val(amount_paid);
		$("#amount_to_be_collected").val(parseFloat(amount_to_be_collected).toFixed(2));
		$("#net_total_amount").val(parseFloat(main_toal_amount).toFixed(2));

	}	

	$("#paid-in-ota").click(function(){

		payment_collection();

	});

	$('#cash-collect-form .deposit').click(function(){

		payment_collection();

	});

	$(".check-in-now-button").hide();

	$(document).change(function(){
		var amount_to_be_collected = $("#amount_to_be_collected").val();
		if(amount_to_be_collected > 0){
			$(".check-in-now-button").hide();
			$(".collect-now-button").show();
		} else {
			$(".check-in-now-button").show();
			$(".collect-now-button").hide();
		}
	});

	$("#check-in-button").click(function(){
		var booking_uuid = $(this).attr("data-booking-uuid");
		var hoteluuid = $("#hoteluuid").val();
		var check_in = $("#check_in").val();
		$.ajax({
			url: "/search/ajax",
			type: "POST",
			data: { ajaxid: 21, check_in:check_in,booking_uuid: booking_uuid, hoteluuid:hoteluuid },
			success: function (response) {	
				window.location.reload();
			},
			error: function (xhr) {

			}
		});
	});

	var tourismtax_to_be_collected = $("#tourismtax_to_be_collected").val() ? Number($("#tourismtax_to_be_collected").val()) : 0;
	if(tourismtax_to_be_collected > 0){
		$("#amount_to_be_collected").val(tourismtax_to_be_collected);
	}

	$("#confirm-action-form .deposit").click(function(){
		var depositSelected = $(this).val();
		if(depositSelected == 'YES'){
			var depositAmount = $("#pay-deposit-amount").val();
		} else {
			var depositAmount = 0;
		}
		var amount_to_be_collected = Number(depositAmount) + Number(tourismtax_to_be_collected);
		$("#amount_to_be_collected").val(amount_to_be_collected);
	});

	$("#confirm-action-form #submit").click(function(e){
		var amount_to_be_collected = $("#amount_to_be_collected").val();
		if(amount_to_be_collected > 0){
			var payment_type = $("#payment_type").val();
			if(payment_type){
			} else {
				e.preventDefault(); 
				alert("Please select the payment type");
				return false;
			}
		} else {

		}
	});

	//$(".company-information-block").hide();

	if($("#add-company-details").is(':checked')){
		$(".company-information-block").show();
	} else {
		$(".company-information-block").hide();
	}
	
	$("#add-company-details").click(function(){
		if($(this).is(':checked')){
			$(".company-information-block").show();
		} else {
			$(".company-information-block").hide();
		}
	});

	});