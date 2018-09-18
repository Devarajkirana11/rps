$(function(){
    $('#legalSameAsHotelAddress,#accountSameAsHotelAddress').click(function(){
        $this = $(this)
        let prefix;
        let currentid = $this.attr('id');
        if(currentid == "accountSameAsHotelAddress")
             prefix = "ACC";
        else if(currentid == "legalSameAsHotelAddress")
             prefix = "L";
        if($this[0].checked === true) {
            GetHotelAddress(prefix)
        } else {
            $('input[name="'+prefix+'address_line1"]').val('');
            $('input[name="'+prefix+'address_line2"]').val('');
            $('select[name="'+prefix+'country"]').val('select');
            $('select[name="'+prefix+'state"]').val('select');
            $('select[name="'+prefix+'city"]').val('select');
            $('input[name="'+prefix+'zipcode"]').val('');
        }
    })

    function GetHotelAddress(prefix) {
        var hotel_id = $('input[name="hotel_id"]').val();
        $.ajax({url:'/hotel_manager/getHotelAddress?hotel_id='+hotel_id,type:'get',datatype:'json',success:function(result){
                let data = result.data;
                if(result.data.length==0)
                    alert('yet to integrate with hotel information')
                if(prefix ==""){
                    let stateval = $('select[name="state"]').val();
                    if(stateval=="select"){
                        $('select[name*="country"]').val(data[0]['_country_id']);
                        //$('select[name="country"]').trigger('change');
                    }
                }else{
                    $('input[name="'+prefix+'address_line1"]').val(data[0]['_address_line1']);
                    $('input[name="'+prefix+'address_line2"]').val(data[0]['_address_line2']);
                    $('select[name="'+prefix+'country"]').val(data[0]['_country_id']);
                    setTimeout(function(){ // waiting for all states and cities to populate using JS..
                        $('select[name="'+prefix+'state"]').val(data[0]['_state_id']).trigger('change');
                        setTimeout(function(){
                            $('select[name="'+prefix+'city"]').val(data[0]['_city_id']); 
                        },1000); 
                    },1000);
                    $('input[name="'+prefix+'zipcode"]').val(data[0]['_zipcode']);
                }
                
            },
            error:function(){
                alert('Oops! unable to get response from server.')
            }})
    }
    /********loading for bank country field **************/
    GetHotelAddress("");


})