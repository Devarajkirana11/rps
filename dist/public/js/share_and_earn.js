$(function(){
	$.ajax({url: '/hotel_manager/getAllHotelsToFrontend', type:'GET', dataType:'JSON',
		success: function(result){
	        $('body').addClass('loaded');
	        let output = '';
            let outputArray = new Array();
	        let fids = new Array();
	        if (result.success) {
                result = result.data.reduce(function (r, a) {
                            r[a._country_id] = r[a._country_id] || [];
                            r[a._country_id].push(a);
                            return r;
                        }, Object.create(null));
                //console.log(result);
	            Object.keys(result).forEach(countrykey => {
                    //console.log(countrykey);
                    result[countrykey].forEach(hotel=>{
                        //console.log(hotel);
    	                let option = {}; let singleFid = null
    	                option['country'] = hotel._city_id+ ', ' + hotel._country_id;
    	                option['locality'] = hotel._nida_stay_name;
    	                option['hotel_id'] = hotel._hotel_id;
    	                option['countryID'] = hotel.countryID;
    	                hotel._image_fids.forEach(fid =>{
                            if(singleFid == null && fid !== null && fid !== undefined) {
                            	option['fid'] = singleFid = fid;
                                fids.push(fid);
                            }
                        })
                        outputArray.push(option);
                    });
	            });
                let Image_files = { params: { files: fids } }
                $.ajax({url:'/file/get',data:Image_files,datatype:'json',type:'post',success:function(imagedata) {
                    $(".ajax-loading").hide();
                    outputArray.forEach(hotel=>{
                        if(imagedata.success) {
                            imagedata.fids.forEach((fid,index)=>{
                                if(fid == hotel.fid) {
                                    hotel['link'] = imagedata.links[index];
                                }
                            })
                        }
                        //if(hotel.country.indexOf("Thailand") < 0) {
                            output +='<div class="clearfix col-sm-4 col-md-4">\
                                        <div class="earnings-shared-hotels col-md-12 m-sm">\
                                            <div class="hotel-img">';
                                                if(hotel.link!==undefined) {
                                                output += '<img src="'+hotel.link+'" alt="" height="250px" width="100%">';
                                                } else {
                                                    output += '<img src="https://s3-ap-southeast-1.amazonaws.com/hotelnida/nearby/changkat_bukit_bintang/Pavillion-Shopping-Centre.jpg" alt="" height="250px" width="100%">';
                                                }
                                output += '</div>\
                                            <div class="hotel-content p-md">\
                                                <h4 class="fw-semi-thk text-black">';
                                                output +=  hotel.locality;
                                    output += '</h4>';
                                    output += '<span>'+hotel.country+'</span>';
                                    output += '<div class="text-center"><a data-image="'+hotel.link+'" data-place="'+hotel.country+'" data-hotel_name="'+hotel.locality+'" data-target="#refer-and-earn-modal" data-hotel_id="'+hotel.hotel_id+'" data-countryID="'+hotel.countryID+'" class="btn btn-danger btn-rounded share_earn_modal"><i class="fa fa-share fa-fw"></i> Share and Earn $</a></div>';
                                output += '</div>';
                        output +=      '</div>';
                            output += '</div>';
                        //}
                    });
                    $('#share_earn_wrapper').html(output);
                    
                },error: function(err) {

                }})
	        } else {
	            console.log(result.data.message);
	        }
	    },error:function(err){
	        console.log(err);
	    }
    });

    $(document).on('click','.share_earn_modal',function(){
        let place = $(this).attr('data-hotel_id');
        let countryID = $(this).attr('data-countryID');
        let modalID = $(this).attr('data-target');
        let image = $(this).attr('data-image');
        let locality = $(this).attr('data-place');
        let hotel_name = $(this).attr('data-hotel_name');
        var current_url=window.location.href;
        var redirect_url = current_url.replace(window.location.host, "").replace("http://","").replace("https://","");
        var userid = $('#user_id').val();
        let randomh=Math.random();
        //let url = new URL(current_url);
        //let searchParams = new URLSearchParams(url.search);
        //let place = searchParams.get('place');
        //let countryID = searchParams.get('countryID');
        //var share_url=current_url+"&referred_by="+userid;
        var share_url = location.protocol+"//"+window.location.host+'/search/details?place='+place+'&countryID='+countryID+"&referred_by="+userid+"&v="+randomh;
        //var share_url = (share_url.indexOf('http') < 0? 'http:'+share_url : share_url);
        document.getElementById("share_url").value = share_url;
        document.getElementById("url").value = share_url;
        document.getElementById("redirect_url").value = redirect_url;
        $('.media-left').find('#share_earnings_image').attr('src',image);
        $('#share_earning_hotel').html(hotel_name);
        $('#share_earning_locality').html(locality);
        $('input[name="hotel_city"]').val(locality);
        $('input[name="hotel_id"]').val(place);
        $(modalID).modal();
    });

});

    function copy_link () {
        var copyText = document.getElementById("share_url");
        var share_type = "Copy Link";
        var user_id = document.getElementById("user_id").value;
        if (user_id == "") {
            window.location.href = "/users/login?info=refer";
            return;
        } else {
            copyText.select();
            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copying text command was ' + msg);
            } catch (err) {
                console.log('Oops, unable to copy');
            }
            var hotel_id = document.getElementById("hotel_id").value;
            var link_opens = 0;
            var data = { params: { share_url: copyText.value, share_type: share_type, user_id: user_id, hotel_id: hotel_id } };
            //console.log(data);
            $.ajax({
                url: "/booking/refer-earn/share-hotel/",
                type: "POST",
                data: data,
                success: function (response) {
                    if(response.success) {
                        alert('link copied successfully!');
                    }
                    /*if (response.redirect) {
                        window.location.href = response.redirect;
                    }*/
                }
            });
        }     

    }

    function send_email() {
        var hotel_id = $('#hotel_id').val();
        $.ajax({
            url: "/search/refer-earn/send-email?place="+hotel_id,
            type: 
            "POST", 
            data: $('#form_send_email').serialize() ,
            success: function(response) {
                if(response.redirect){
                   window.location.href = response.redirect;
                }
                else if(response.message=="success")
                {
                    alert("Email sent successfully!! ");
                }
                //alert(response.message);
                //console.log(response);
            },
            error: function(xhr) { 
                alert(xhr);
            }
        });
    }
    function share_fb(e)  {
        
        var share_url = document.getElementById("share_url").value;
        var share_type= "Facebook";
        var user_id=document.getElementById("user_id").value;
        if(user_id=="")
        {
            e.preventDefault();
            window.location.href = "/users/login?info=refer";
            return;
        } else {
            popupwindow('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(share_url), document.title,600,400);
            /*FB.ui(
                {
                    method: 'share_open_graph',
                    action_type: 'og.shares',
                    display: 'popup',
                    action_properties: JSON.stringify({
                    object: {
                        'og:url': 'http://hotelnida.com/search/details?place='+$scope.searchdata.hotel_id+'&countryID='+$scope.searchdata.countryID+"&referred_by="+userid,
                        'og:title': $scope.details.hotel_name+' | Redifining Budget Hotels in '+$scope.details.hotel_city+' and beyond.' ,
                        'og:description': 'Travelling soon? Refine your stay at Hotel NIDA with enhanced flexibility & convenience to suit the needs of a modren traveller.',
                        'og:image': $scope.default_hotel_image_link,
                    }
                    })
                },
                function (response) {
                console.log(response)
                if (response && !response.error_code) {
                    if (typeof response != 'undefined') {                   
                        //alert('success');*/
                        var hotel_id=document.getElementById("hotel_id").value;
                        var link_opens=0;
                        var data = {params: {share_url:share_url,share_type:share_type,user_id:user_id,hotel_id:hotel_id}};
                        //console.log(data);
                        $.ajax({
                            url: "/booking/refer-earn/share-hotel/",
                            type: "POST", 
                            data:  data,
                            success: function(response) {
                                if(response.message=="success")
                                {
                                    console.log("You have successfully shared the hotels!! ");
                                }
                                // alert(response.message);
                            },
                            error: function(xhr) { 
                                console.log(xhr);
                                    
                            }
                        });
                    /*}else {
                        //user closed dialog without sharing
                    }
                }
                }
            );*/
                
        }
        
    }
        
    function share_twitter(e) {
        var share_url = document.getElementById("share_url").value;
        var share_type = "Twitter";
        var user_id = document.getElementById("user_id").value;
        if (user_id == "") {
            e.preventDefault();
            window.location.href = "/users/login?info=refer";
            return;
        } else  {
            popupwindow('https://twitter.com/intent/tweet?url='+encodeURIComponent(share_url),document.title,600,400);
            var hotel_id = document.getElementById("hotel_id").value;
            var link_opens = 0;
            var data = { params: { share_url: share_url, share_type: share_type, user_id: user_id, hotel_id: hotel_id } };
            //console.log(data);
            $.ajax({
                url: "/booking/refer-earn/share-hotel/",
                type: "POST",
                data: data,
                success: function (response) {
                    if (response.message == "success") {
                        console.log("You have successfully shared the hotels!! ");
                    }
                    // alert(response.message);
                },
                error: function (xhr) {
                    console.log(xhr);

                }
            });
        }
        
    }

    function popupwindow (url, title, w, h) {
      var left = (screen.width/2)-(w/2);
      var top = (screen.height/2)-(h/2);
      return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
    } 
