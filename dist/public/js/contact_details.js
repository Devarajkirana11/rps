jQuery(document).ready(function(){

    function DisplayErrors(errors) {
        for(var index in errors) {
            // console.log($('[name="'+index+'"]').attr('name'))
                $('[name="'+index+'"]').next('.text-danger').html(errors[index])
            
        }
    }

    if(counts) {
        for(var index in counts) {
            if (counts.hasOwnProperty(index)) {
                var clickclass;
            // console.log(index)
                switch(index) {
                    case 'ownercount': clickclass = "addanotherOwnercontactdetails";
                    break;
                    case 'managercount': clickclass = "addanotherHotelManagerdetails";
                    break;
                    case 'frondeskcount': clickclass = "addanotherFrontDeskdetails";
                    break;
                    case 'financecount': clickclass = "addanotherFinanceContactdetails";
                    break;
                }
                //console.log(clickclass)
                if(counts[index] >1) {
                    var reps = parseInt(Number(counts[index]))-1;
                    for( var j=0;j< Number(reps);j++ ){
                        $('a.'+clickclass).trigger('click');
                    }
                }
            }
        }
        
    }

    /************************** display errors on submit **************************/
    if(errors) {
        DisplayErrors(errors);
    }

    /************ load all request Body data in edit view******************** */
    
        if(reqBody) {
            intervals = {};
            for(var field in reqBody) {
                if(field.indexOf('state') >= 0 || field.indexOf('city') >= 0) {
                    $('select[name="'+field+'"]').html('');
                    $('select[name="'+field+'"]').append('<option value="'+reqBody[field]+'" selected="selected">Loading...</option>');
                }else {
                    $('[name="'+field+'"]').val(reqBody[field])
                }
            }
        }
    


    $('input[name="fdfnsame"]').click(function(){
        $this = $(this)
        if($this[0].checked === true) {
            $('input[name^="fdcdfirstname"],input[name^="fncdfirstname"]').val($('input[name^="hmcdfirstname"]').val());
            $('input[name^="fdcdlastname"],input[name^="fncdlastname"]').val($('input[name^="hmcdlastname"]').val());
            $('select[name^="fdcdlandlinenumber_stdcode"],select[name^="fncdlandlinenumber_stdcode"]').val($('select[name^="hmcdlandlinenumber_stdcode"]').val());
            $('input[name^="fdcdlandlinenumber"],input[name^="fncdlandlinenumber"]').val($('input[name^="hmcdlandlinenumber"]').val());
            $('select[name^="fdcdmobilenumber_stdcode"],select[name^="fncdmobilenumber_stdcode"]').val($('select[name^="hmcdmobilenumber_stdcode"]').val());
            $('input[name^="fdcdmobilenumber"],input[name^="fncdmobilenumber"]').val($('input[name^="hmcdmobilenumber"]').val());
            $('input[name^="fdcdemail"],input[name^="fncdemail"]').val($('input[name^="hmcdemail"]').val());
        }else{
            $('input[name^="fdcdfirstname"],input[name^="fncdfirstname"]').val('');
            $('input[name^="fdcdlastname"],input[name^="fncdlastname"]').val('');
            $('select[name^="fdcdlandlinenumber_stdcode"],select[name^="fncdlandlinenumber_stdcode"]').val('select');
            $('input[name^="fdcdlandlinenumber"],input[name^="fncdlandlinenumber"]').val('');
            $('select[name^="fdcdmobilenumber_stdcode"],select[name^="fncdmobilenumber_stdcode"]').val('select');
            $('input[name^="fdcdmobilenumber"],input[name^="fncdmobilenumber"]').val('');
            $('input[name^="fdcdemail"],input[name^="fncdemail"]').val('');
        }
    })



    function GetHotelAddress() {
        var hotel_id = $('input[name="hotel_id"]').val();
        $.ajax({url:'/hotel_manager/getHotelAddress?hotel_id='+hotel_id,type:'get',datatype:'json',success:function(result){
                let data = result.data;
                if(result.data.length==0){
                    alert('yet to integrate with hotel information')
                }else{
                    $('select[name*="stdcode"],select[name*="countrycode"]').val(result.stdcode)
                }

            },
            error:function(){
                alert('Oops! unable to get response from server.')
            }})
    }

    if($('input[name="hotel_id"]').length){
        GetHotelAddress();
    }

});