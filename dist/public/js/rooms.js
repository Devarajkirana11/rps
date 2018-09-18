NoOfRooms = 0; //globalvariable
InitialNoOfRooms = 0;
$(function(){
    var default_no_rooms = $('.roomwrapper').length;
    NoOfRooms = $('input[name="no_of_rooms"]').val();
    NoOfRooms = (NoOfRooms == ""  || NoOfRooms === null ?1:NoOfRooms.trim());
    NoOfRooms = InitialNoOfRooms = parseInt(NoOfRooms);
    function getRoomsCountDifference(rooms,type) {
        $('#no_of_rooms_count').html(NoOfRooms);
        $('input[name="no_of_rooms"]').val(NoOfRooms);
        let hotel_id = $('input[name="hotel_id"]').val();
        $.ajax({url:'/room_manager/'+hotel_id+'/NoOfRoomsLeft',dataType:'json',success:function(data){
            if(data.success){
                if(parseInt(default_no_rooms) != 0 && mode == 'edit') {
                    if(parseInt(data.noOfrooms) >= parseInt(default_no_rooms)) {
                        data.noOfrooms = parseInt(data.noOfrooms) - parseInt(default_no_rooms);
                    }
                }
                if(parseInt(data.hotel_rooms) >= (parseInt(rooms) + parseInt(data.noOfrooms))){ 
                    $('#roomcount').html('Out of '+data.hotel_rooms+' room(s) at your property. Remaining('+parseInt(data.hotel_rooms - ((parseInt(rooms) + parseInt(data.noOfrooms))))+')');
                    let current_no_rooms = $('.roomwrapper').length;
                    if(type=='del'){ // delete operation
                        if(current_no_rooms > parseInt(rooms)){
                            if(rooms == 0 && default_no_rooms!=current_no_rooms){
                                $('.roomwrapper:lt('+parseInt(current_no_rooms -1)+')').remove();
                            }else{
                                //$('.roomwrapper:lt('+rooms+')').remove();
                                $('.roomwrapper').last().remove();
                            }
                            $('input[name="no_of_rooms"]').closest('form-group').next('text-danger').html('');
                        } else {
                            getRoomsCountDifference(rooms,'add');
                        }
                    }else if(type == "add") { // edit operation
                        if(parseInt(rooms) >  parseInt(current_no_rooms)){
                            rooms = (parseInt(rooms) - parseInt(current_no_rooms));
                            for(var i=0; i< rooms; i++){
                                if(type=='add')
                                    $('#addroom').trigger('click');                            
                            }
                        }else if(rooms !=0) {
                            rooms = (parseInt(current_no_rooms) - parseInt(rooms));
                            if(current_no_rooms > 1){
                                getRoomsCountDifference(rooms,'del');
                            } else if(current_no_rooms == 1 ){
                                $('input[name="no_of_rooms"]').closest('form-group').next('text-danger').html("Cannot Delete row. Aleast one row should be present.");
                            }
                        }
                    }       
                    
                        
                }else{
                    $('#roomcount').html('<span class="text-danger">No of Rooms Exceeded!</span>');
                }
            }else{
                $('input[name="no_of_rooms"]').closest('form-group').next('text-danger').html(data.message);
            }
        },error:function(e){
            $('input[name="no_of_rooms"]').closest('form-group').next('text-danger').html(e);
        }})
    }

    // $('input[name="no_of_rooms"]').keyup(function(event){
    //     var key = event.keyCode || event.charCode;
    //     let rooms = $(this).val()
    //     if(rooms == "") rooms=0;
    //     if($.isNumeric(rooms)){
    //         if( key == 8 || key == 46 )
    //             getRoomsCountDifference(rooms,'del');
    //         else
    //             getRoomsCountDifference(rooms,'add');
    //     }else{
    //         $('input[name="no_of_rooms"]').closest('form-group').next('text-danger').html('Not a valid Room No');
    //     }
    // });

    $('.no_of_roomsChange').on('click',function(){
        var type = $(this).attr('id');
        if(type == 'nor_inc') {
            console.log('before inc '+ NoOfRooms)
            NoOfRooms++;
            console.log('inc '+ NoOfRooms)
            getRoomsCountDifference(NoOfRooms,'add');
            $('#roomcount').html('&nbsp;');
        } else if(type == 'nor_dec') {
            if((NoOfRooms > InitialNoOfRooms && mode == 'edit') || (NoOfRooms > 1 && mode == 'create')) {
                --NoOfRooms;
                console.log('dec '+NoOfRooms)
                getRoomsCountDifference(NoOfRooms,'del');
                $('#roomcount').html('&nbsp;');
            } else {
                $('#roomcount').html('No of Rooms cannot be less than current No of Rooms');
            }
        }
        
    })
    
    /************on load property **************/
    let no_of_roomsELE = $('input[name="no_of_rooms"]').val();
    let onLoadRooms = (no_of_roomsELE===undefined || no_of_roomsELE===NaN || no_of_roomsELE== "" || no_of_roomsELE===null?1:no_of_roomsELE);
    if(errorExists===false ){
        getRoomsCountDifference(onLoadRooms,'onload');
    }else if(errorExists=== true ) {
        // just update the count reference on page load
        getRoomsCountDifference(onLoadRooms,'errorload');
    }
})
