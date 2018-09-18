$(function(){
    /**
     * method: dropdown onchange
     * desc: onchange of dropdowns fire the events
     * author: Satish
     */
    $(document).on('change','#seotype,#country,#city',function(){
        console.log('change is seo type')
        let seo_type = $('#seotype').val();
        let link = '';
        let country = $('#country option:selected').text();
        let city = $('#city option:selected').text();
        let hotel_name = $('#seo_hotel_name').val();
        let hotel_id = $('#hotel_id').val();

        if(seo_type == 1) {
            if(country == 'select') {
                alert('Please choose the country');
            } else {
               country =  country.replace(/\s+/g, '-').toLowerCase();
               link +=  'country-'+country;
            }
        } else if(seo_type == 2) {
            if(city == 'select') {
                alert('Please choose the city');
            } else {
               country =  country.replace(/\s+/g, '-').toLowerCase();
               city =  city.replace(/\s+/g, '-').toLowerCase();
               link +=  'city-'+city;
            }
        } else if(seo_type == 3) {
            if(hotel_id == "") {
                alert('please choose the valid hotel hotel id');
            } else {
                link += 'hotel-'+hotel_name.replace(/\s+/g, '-').toLowerCase();
            }
        }
        console.log(link)
        $("#seo_link").val(link);
    });
    /**
     * method: autocompleting the hotel name
     * desc: to load the hotel name while creating seo details
     * author: Satish
     */
    $( "#seo_hotel_name" ).autocomplete({
        source: function( request, response ) {
            let country = $('#country option:selected').val();
            let city = $('#city option:selected').val();
            let seo_type = $('#seotype').val();
            $('#hotel_error').html('');
            if(country == 'select') {
                $('#hotel_error').html('Please choose a country');
            } else if(city == 'all') {
                $('#hotel_error').html('Please choose a city');
            } else if(seo_type!=3) {
                $('#hotel_error').html('Please choose a type as Hotel');
            }else {
                $.ajax( {
                    url: "/hotel_manager/getHotelByName?hotel_name="+request.term+"&city_id="+city,
                    dataType: "json",
                    success: function( res ) {
                        response( res.data );
                    }
                });
            }
        },
        select: function( event, ui ) {
            event.preventDefault();
            $("#seo_hotel_name").val(ui.item.label);
            $("#hotel_id").val(ui.item.value);
            $('#seotype').trigger('change');
        },
        focus: function(event, ui) {
            event.preventDefault();
            $("#seo_hotel_name").val(ui.item.label);
            $("#hotel_id").val(ui.item.label);
        }
    });
    /** 
     * method: getHotelDetails
     * desc: on edit mode, load the hotel name from hotel id
     * author: Satish
     */
    let hotel_id = $('#hotel_id').val();
    if(hotel_id != "") {
        $.ajax({url:'/hotel_manager/getHotelDetails/'+hotel_id,dataType:'json',success:function(result) {
            if(result.success) {
                $('#seo_hotel_name').val(result.data[0]._nida_stay_name);
            }
        },error:function(err){
            $('#hotel_error').html('could not fetch the hotel name');
        }})
    }
})