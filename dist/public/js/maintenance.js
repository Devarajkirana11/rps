$(function(){
    $('input[name="from_date"]').datetimepicker({
        format: 'Y-m-d H:i:s',
        onChangeDateTime:function(dp,$input){
            $('input[name="to_date"]').datetimepicker({minDate:$input.val()})
        }
    })
    $('input[name="to_date"]').datetimepicker({
        format: 'Y-m-d H:i:s',
        onChangeDateTime:function(dp,$input){
            $('input[name="from_date"]').datetimepicker({maxDate:$input.val()})
        }
    })
        
    $('#room_number').tagsinput({
        itemValue: 'value',
        itemText: 'text',
        allowDuplicates: false,
    });
    if(mode == 'edit') {
        $('#room_number').attr('disabled','disabled');
    }

    $( "#rooms" ).autocomplete({
        source: function( request, response ) {
            $.ajax( {
            url: "/room_manager/getByRoomNo?room_number="+request.term+"&hotel_id="+hotel_id,
            dataType: "json",
            success: function( res ) {
                response( res.data );
            }
            });
        },
        minLength: 1,
        select: function( event, ui ) {
            $('#room_number').tagsinput('add', { value: ui.item.value, text: ui.item.label,room_id: ui.item.room_id,floorNumber:ui.item.floorNumber,room_name:ui.item.room_name });
            let room_details = $("#room_number").tagsinput('items');
            $('#room_details').val(JSON.stringify(room_details))
        }
    });
    $(document).on('change','#reason',function(){
        if($(this).text().indexOf('Other') > -1) {
            $('input[name="other_reasons"]').show();
        }else{
            $('input[name="other_reasons"]').hide();
        }
    })
    $('#room_number').on('itemRemoved',function(){
        let room_details = $("#room_number").tagsinput('items');
        $('#room_details').val(JSON.stringify(room_details))
    })
    /********** edit page or error page *******/
    let room_details = $('input[name="room_details"]').val();
    if(room_details!="" && room_details !==undefined && room_details !==null){
        let roomJSON = JSON.parse(room_details);
        $.each(roomJSON,function(index,room){
                $('#room_number').tagsinput('add', { 
                value: room.value, 
                text: room.text,
                room_id: room.room_id,
                floorNumber:room.floorNumber,
                room_name:room.room_name });
        })
    }
})