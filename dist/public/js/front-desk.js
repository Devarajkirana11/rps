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

    var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep","Oct", "Nov", "Dec");

    var hotel_id = $("#hotel_id").val();
    var d = new Date();
    var startDate = (d.getMonth()+1) + "/" + d.getDate()  + "/" + d.getFullYear();
    var startDates = d.getDate() + "-" + (d.getMonth()+1) + "-" + d.getFullYear();
    var start = new Date(startDate);
    var start_date = new Date(startDate);

    var date = new Date();
    date.setDate(date.getDate() + 7);
    var endDate = (date.getMonth()+1)+'/'+ date.getDate()  +'/'+date.getFullYear();
    var end = new Date(endDate);

    while(start < end){
        var day_number = start.getDate();
        var month = start.getMonth();
        var year =start.getFullYear();
        var insert = '<div class="front-desk-day-header"><p class="m-n fs-xl fw-semi-thk text-black">'+day_number+'</p><small class="text-uppercase">'+m_names[month].substring(0, 3)+' '+year+' </small></div>';
        $(".front-desk--day-header-container").append(insert);
        var newDate = start.setDate(start.getDate() + 1);
        start = new Date(newDate);
    }

    $.ajax({
    url: "/inventory/front-desk?hotel_uuid="+hotel_id+"&start_date="+startDates,
    type: "GET", 
    dataType: 'json',
    data: { },
    success: function(response) { 
        var room_type_data = '';
        var room_price_data = '';
        $.each( response.data, function( key, value ) {
            var accord = key;
            var room_details = value.rooms;
            var total_rooms = room_details.length;
            room_type_data += '	<li><a href="javascript:void(0)" class="accordion--parent" data-accordion-toggle="accordion-'+key+'-child">  '+type_array[value.roomType]+' ('+total_rooms+')</a>';
            room_price_data += '<div class="front-desk--count-container accordion--parent accordion-3-total"><div class="front-desk--day-count">'+value.availability[0]+'</div><div class="front-desk--day-count">'+value.availability[1]+'</div><div class="front-desk--day-count">'+value.availability[2]+'</div><div class="front-desk--day-count">'+value.availability[3]+'</div><div class="front-desk--day-count">'+value.availability[4]+'</div><div class="front-desk--day-count">'+value.availability[5]+'</div><div class="front-desk--day-count">'+value.availability[6]+'</div></div>';
            var room_details_data = '<ul class="front-desk--child">';
            $.each( room_details, function( key, value ) {
                room_details_data += '';
                room_details_data += '<li><a href="javascript:void(0)">'+value.number+'</a></li>';
                room_price_data += '<div class="front-desk--count-container accordion-'+accord+'-child">';
                var start = start_date;
                var i = 0;
                var m = 0;
                var room_price_data_array = [];
                for (i = 0; i < 7; i++) {
                    var d = new Date();
                    var test = (d.getMonth()+1) + "/" + d.getDate()  + "/" + d.getFullYear();
                    test = new Date(test);
                    var newDates = test.setDate(test.getDate() + i);
                    starter = new Date(newDates);
                    var reservations_array = value.reservations;

                    var per_day = 1000 * 60 * 60 * 24;
                    
                    $.each( reservations_array, function( key, value ) {   
                        var check_in = value.checkIn;
                        var check_out = value.checkOut;
                        if(check_in != 'undefined' && check_out != 'undefined'){
                            var parts = check_in.split('-');
                            var dmyDate = parts[1] + '/' + parts[0] + '/' + parts[2];
                            var new_check_in = new Date(dmyDate);
                            var parts = check_out.split('-');
                            var dmyDate = parts[1] + '/' + parts[0] + '/' + parts[2];
                            var new_check_out = new Date(dmyDate);
                            var class_name = value.status;

                            if(starter.toDateString() === new_check_in.toDateString()){
                                var previousBooking = reservations_array.find(e => e.checkOut === check_in);

                                console.log(previousBooking);

                                if(previousBooking !== undefined && previousBooking !== null) {
                                    var start_class = 'start adjacent-booking'; 
                                } else {
                                    var start_class = 'start'; 
                                }
                            } else {  
                                var start_class = ''; 
                            }

                            if(starter.toDateString() === new_check_out.toDateString()) {
                                var previousBooking = reservations_array.find(e => e.checkIn === check_out); 
                                
                                if(previousBooking !== undefined && previousBooking !== null) {
                                    var end_class = 'end adjacent-booking';
                                } else {
                                    var end_class = 'end';
                                }
                            } else {  
                                var end_class = ''; 
                            }

                            if(starter >= new_check_in && starter <= new_check_out){
                                if((new_check_out - new_check_in) / per_day === 1) {
                                    room_price_data_array[i] = '<a href="/pms/booking-details?hotel_id='+value.hotelUuid+'&booking_uuid='+value.bookingUuid+'"><div class="front-desk--day-count one-day-booking '+class_name+' '+start_class+' '+end_class+'"></div></a>';
                                } else {
                                    room_price_data_array[i] = '<a href="/pms/booking-details?hotel_id='+value.hotelUuid+'&booking_uuid='+value.bookingUuid+'"><div class="front-desk--day-count '+class_name+' '+start_class+' '+end_class+'"></div></a>';
                                }

                                m++;
                            } else {
                                if(m > 0){  } else { 
                                    if((new_check_out - new_check_in) / per_day === 1) {
                                        room_price_data_array[i] = '<div class="front-desk--day-count one-day-booking"></div>'; 
                                    } else {
                                        room_price_data_array[i] = '<div class="front-desk--day-count"></div>'; 
                                    }
                                }
                            } 
                        } 
                    });
                }
                
                $.each(room_price_data_array,function(key, value){
                    if(value){
                        room_price_data += value;
                        
                    } else {
                        room_price_data +=  '<div class="front-desk--day-count"></div>'; 
                    } 
                    
                });

                if(m > 0){ m = 0; }

                room_price_data += '</div>';
            });
            room_details_data += '</ul>';
            room_type_data += room_details_data+'</li>';
        });

        $(".front-desk--menu").html(room_type_data);
        $(".front-desk--day-content-container").html(room_price_data);

    },
    error: function(xhr) { }
    });	

    $(".next-button").click(function(){
        var hotel_id = $("#hotel_id").val();
        var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep","Oct", "Nov", "Dec");
        $(".front-desk--day-header-container").html("");
        var current_val = parseInt($(".next-button").attr("id"),10);
        var end_val =parseInt(current_val) + parseInt(6);

        var d = new Date();
        d.setDate(d.getDate() + current_val);
        var startDate = (d.getMonth()+1) + "/" + d.getDate()  + "/" + d.getFullYear();
        var startDates = d.getDate() + "-" + (d.getMonth()+1) + "-" + d.getFullYear();
        var start = new Date(startDate);
        var start_date = new Date(startDate);

        var date = new Date();
        date.setDate(date.getDate() + end_val);
        var endDate = (date.getMonth()+1)+'/'+ date.getDate() +'/'+date.getFullYear();
        var end = new Date(endDate);

        var i = 0;
        while(start <= end){
            var day_number = start.getDate();
            var month = start.getMonth();
            var year =start.getFullYear();
            var insert = '<div class="front-desk-day-header"><p class="m-n fs-xl fw-semi-thk text-black">'+day_number+'</p><small class="text-uppercase">'+m_names[month]+' '+year+' </small></div>';
            if(i < 7){
                $(".front-desk--day-header-container").append(insert);
            }
            var newDate = start.setDate(start.getDate() + 1);
            start = new Date(newDate);
            i++;
        }

        $.ajax({
        url: "/inventory/front-desk?hotel_uuid="+hotel_id+"&start_date="+startDates,
        type: "GET", 
        dataType: 'json',
        data: { },
        success: function(response) { 
            var room_type_data = '';
            var room_price_data = '';
            $.each( response.data, function( key, value ) {
                var accord = key;
                var room_details = value.rooms;
                var total_rooms = room_details.length;
                room_type_data += '	<li><a href="javascript:void(0)" class="accordion--parent" data-accordion-toggle="accordion-'+key+'-child">  '+type_array[value.roomType]+' ('+total_rooms+')</a>';
                room_price_data += '<div class="front-desk--count-container accordion--parent accordion-3-total"><div class="front-desk--day-count">'+value.availability[0]+'</div><div class="front-desk--day-count">'+value.availability[1]+'</div><div class="front-desk--day-count">'+value.availability[2]+'</div><div class="front-desk--day-count">'+value.availability[3]+'</div><div class="front-desk--day-count">'+value.availability[4]+'</div><div class="front-desk--day-count">'+value.availability[5]+'</div><div class="front-desk--day-count">'+value.availability[6]+'</div></div>';
                var room_details_data = '<ul class="front-desk--child">';
            $.each( room_details, function( key, value ) {
                room_details_data += '';
                room_details_data += '<li><a href="javascript:void(0)">'+value.number+'</a></li>';
                room_price_data += '<div class="front-desk--count-container accordion-'+accord+'-child">';
                var start = start_date;
                var i = 0;
                var m = 0;
                var room_price_data_array = [];
                for (i = 0; i < 7; i++) {
                    var d = new Date();
                    d.setDate(d.getDate() + current_val);
                    var test = (d.getMonth()+1) + "/" + d.getDate()  + "/" + d.getFullYear();
                    test = new Date(test);
                    var newDates = test.setDate(test.getDate() + i);
                    starter = new Date(newDates);
                    var reservations_array = value.reservations;

                    var per_day = 1000 * 60 * 60 * 24;
                    
                    $.each( reservations_array, function( key, value ) {    
                        var check_in = value.checkIn;
                        var check_out = value.checkOut;
                        
                        if(check_in != 'undefined' && check_out != 'undefined'){
                            var parts = check_in.split('-');
                            var dmyDate = parts[1] + '/' + parts[0] + '/' + parts[2];
                            var new_check_in = new Date(dmyDate);
                            var parts = check_out.split('-');
                            var dmyDate = parts[1] + '/' + parts[0] + '/' + parts[2];
                            var new_check_out = new Date(dmyDate);
                            var class_name = value.status;

                            if(starter.toDateString() === new_check_in.toDateString()){
                                var previousBooking = reservations_array.find(e => e.checkOut === check_in);

                                if(previousBooking !== undefined && previousBooking !== null) {
                                    var start_class = 'start adjacent-booking'; 
                                } else {
                                    var start_class = 'start'; 
                                }
                            } else {  
                                var start_class = ''; 
                            }

                            if(starter.toDateString() === new_check_out.toDateString()) {
                                var previousBooking = reservations_array.find(e => e.checkIn === check_out); 
                                
                                if(previousBooking !== undefined && previousBooking !== null) {
                                    var end_class = 'end adjacent-booking';
                                } else {
                                    var end_class = 'end';
                                }
                            } else {  
                                var end_class = ''; 
                            }

                            if(starter >= new_check_in && starter <= new_check_out){
                                if((new_check_out - new_check_in) / per_day === 1) {
                                    room_price_data_array[i] = '<a data-target="'+starter+'" href="/pms/booking-details?hotel_id='+value.hotelUuid+'&booking_uuid='+value.bookingUuid+'"><div class="front-desk--day-count one-day-booking '+class_name+' '+start_class+' '+end_class+'"></div></a>';
                                } else {
                                    room_price_data_array[i] = '<a data-target="'+starter+'" href="/pms/booking-details?hotel_id='+value.hotelUuid+'&booking_uuid='+value.bookingUuid+'"><div class="front-desk--day-count '+class_name+' '+start_class+' '+end_class+'"></div></a>';
                                }
                             m++;
                            } else {
                                if(m > 0){  } else { 
                                    if((new_check_out - new_check_in) / per_day === 1) {
                                        room_price_data_array[i] = '<div data-target="'+starter+'" class="front-desk--day-count one-day-booking"></div>'; 
                                    } else {
                                        room_price_data_array[i] = '<div data-target="'+starter+'" class="front-desk--day-count"></div>'; 
                                    }
                                }
                            } 
                        } 
                    });
                }
                $.each(room_price_data_array,function(key, value){
                    if(value){
                        room_price_data += value;
                    } else {
                        room_price_data +=  '<div class="front-desk--day-count"></div>'; 
                    } 
               });
                if(m > 0){ m = 0; }
                room_price_data += '</div>';
            });
                room_details_data += '</ul>';
                room_type_data += room_details_data+'</li>';
            });

            $(".front-desk--menu").html(room_type_data);
            $(".front-desk--day-content-container").html(room_price_data);
        var new_val = parseInt(current_val) + parseInt(1);
        var new_vals = parseInt(current_val) - parseInt(1);
        $(".next-button").attr("id",new_val);
        $(".previous-button").attr("id",new_vals);
        },
        error: function(xhr) { }
        });	
    });

    $(document).on("click",".previous-button",function(){
        var hotel_id = $("#hotel_id").val();
        var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep","Oct", "Nov", "Dec");
        $(".front-desk--day-header-container").html("");
        var current_val = parseInt($(".previous-button").attr("id"),10);
        var end_val =parseInt(current_val) + parseInt(6);

        var d = new Date();
        d.setDate(d.getDate() + current_val);
        var startDate = (d.getMonth()+1) + "/" + d.getDate()  + "/" + d.getFullYear();
        var startDates = d.getDate() + "-" + (d.getMonth()+1) + "-" + d.getFullYear();
        var start = new Date(startDate);
        var start_date = new Date(startDate);
        
        var date = new Date();
        date.setDate(date.getDate() + end_val);
        var endDate = (date.getMonth()+1)+'/'+ date.getDate() +'/'+date.getFullYear();
        var end = new Date(endDate);


        var i = 0;
        while(start <= end){
            var day_number = start.getDate();
            var month = start.getMonth();
            var year =start.getFullYear();
            var insert = '<div class="front-desk-day-header"><p class="m-n fs-xl fw-semi-thk text-black">'+day_number+'</p><small class="text-uppercase">'+m_names[month]+' '+year+' </small></div>';
            if(i < 7){
                $(".front-desk--day-header-container").append(insert);
            }
            var newDate = start.setDate(start.getDate() + 1);
            start = new Date(newDate);
            i++;
        }

        $.ajax({
        url: "/inventory/front-desk?hotel_uuid="+hotel_id+"&start_date="+startDates,
        type: "GET", 
        dataType: 'json',
        data: { },
        success: function(response) { 
            var room_type_data = '';
            var room_price_data = '';
            $.each( response.data, function( key, value ) {
                var accord = key;
                var room_details = value.rooms;
                var total_rooms = room_details.length;
                room_type_data += '	<li><a href="javascript:void(0)" class="accordion--parent" data-accordion-toggle="accordion-'+key+'-child">  '+type_array[value.roomType]+' ('+total_rooms+')</a>';
                room_price_data += '<div class="front-desk--count-container accordion--parent accordion-3-total"><div class="front-desk--day-count">'+value.availability[0]+'</div><div class="front-desk--day-count">'+value.availability[1]+'</div><div class="front-desk--day-count">'+value.availability[2]+'</div><div class="front-desk--day-count">'+value.availability[3]+'</div><div class="front-desk--day-count">'+value.availability[4]+'</div><div class="front-desk--day-count">'+value.availability[5]+'</div><div class="front-desk--day-count">'+value.availability[6]+'</div></div>';
                var room_details_data = '<ul class="front-desk--child">';
                $.each( room_details, function( key, value ) {
                    room_details_data += '';
                    room_details_data += '<li><a href="javascript:void(0)">'+value.number+'</a></li>';
                    room_price_data += '<div class="front-desk--count-container accordion-'+accord+'-child">';
                    var start = start_date;
                var i = 0;
                var m = 0;
                for (i = 0; i < 7; i++) {
                    var d = new Date();
                    d.setDate(d.getDate() + current_val);
                    var test = (d.getMonth()+1) + "/" + d.getDate()  + "/" + d.getFullYear();
                    test = new Date(test);
                    var newDates = test.setDate(test.getDate() + i);
                    starter = new Date(newDates);
                    var reservations_array = value.reservations;
                    $.each( reservations_array, function( key, value ) {    
                        var check_in = value.checkIn;
                        var check_out = value.checkOut;
                        if(check_in != 'undefined' && check_out != 'undefined'){
                            var parts = check_in.split('-');
                            var dmyDate = parts[1] + '/' + parts[0] + '/' + parts[2];
                            var new_check_in = new Date(dmyDate);
                            var parts = check_out.split('-');
                            var dmyDate = parts[1] + '/' + parts[0] + '/' + parts[2];
                            var new_check_out = new Date(dmyDate);
                            var class_name = value.status;

                            var per_day = 1000 * 60 * 60 * 24;

                            if(starter.toDateString() === new_check_in.toDateString()){
                                var previousBooking = reservations_array.find(e => e.checkOut === check_in);

                                console.log(previousBooking);

                                if(previousBooking !== undefined && previousBooking !== null) {
                                    var start_class = 'start adjacent-booking'; 
                                } else {
                                    var start_class = 'start'; 
                                }
                            } else {  
                                var start_class = ''; 
                            }

                            if(starter.toDateString() === new_check_out.toDateString()) {
                                var previousBooking = reservations_array.find(e => e.checkIn === check_out); 
                                
                                if(previousBooking !== undefined && previousBooking !== null) {
                                    var end_class = 'end adjacent-booking';
                                } else {
                                    var end_class = 'end';
                                }
                            } else {  
                                var end_class = ''; 
                            }


                            if(starter >= new_check_in && starter <= new_check_out){
                                if((new_check_out - new_check_in) / per_day === 1) {
                                    room_price_data += '<a data-target="'+i+'" href="/pms/booking-details?hotel_id='+value.hotelUuid+'&booking_uuid='+value.bookingUuid+'"><div class="front-desk--day-count one-day-booking '+class_name+' '+start_class+' '+end_class+'"></div></a>';
                                } else {
                                    room_price_data += '<a data-target="'+i+'" href="/pms/booking-details?hotel_id='+value.hotelUuid+'&booking_uuid='+value.bookingUuid+'"><div class="front-desk--day-count '+class_name+' '+start_class+' '+end_class+'"></div></a>';
                                }

                                m++;
                            } 
                        } 
                    });

                    if(m > 0){ m = 0; } else { 
                        room_price_data += '<div class="front-desk--day-count"></div>'; 
                    }
                }
                    room_price_data += '</div>';
                });
                room_details_data += '</ul>';
                room_type_data += room_details_data+'</li>';
            });

            $(".front-desk--menu").html(room_type_data);
            $(".front-desk--day-content-container").html(room_price_data);
        var new_val = parseInt(current_val) - parseInt(1);
        var new_vals = parseInt(current_val) + parseInt(1);
        $(".next-button").attr("id",new_vals);
        $(".previous-button").attr("id",new_val);
        },
        error: function(xhr) { }
        });	
    });
    $(document).on('click','.accordion--parent', function() {
    $('.' + $(this).data('accordion-toggle')).slideToggle();
    $(this).next('ul').slideToggle();
    });

});