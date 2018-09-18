$(function(){
    var loadMap = function(e, locality = {lat: parseFloat(3.1412), lng: parseFloat(101.68653) }) 
    {
    	var view = 'cedit';
        var myOptions = {
         center: new google.maps.LatLng(0,0),
          zoom: 4,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),
            myOptions);

		if($('#latitude').length && $('#longitude').length) {
			var lat = $("#latitude").val();
			var lng = $('#longitude').val();
			locality = formatLatLng(lat,lng);
		} else if(Dlat!== undefined && Dlng !== undefined) {
			locality = formatLatLng(Dlat,Dlng);
			view = 'detail';
		}

		codeAddress(map,locality,view);
    };

    function formatLatLng(lat,lng) {
    	var locality = {}
    	locality["lat"] =  parseFloat(3.1412);
    	locality["lng"] =  parseFloat(101.68653); // default kaula lampur
    	if(lat != "" && lng != ""){
			lat.trim();lng.trim();
			locality["lat"] =  parseFloat(Number(lat));
    		locality["lng"] =  parseFloat(Number(lng));
		}
		console.log(locality)
		return { 'location' : locality };
    }
	geocoder = new google.maps.Geocoder();

	function codeAddress(map,locality,view) {
		//In this case it gets the address from an element on the page, but obviously you  could just pass it to the method instead
		var draging = false;
		if(view == 'cedit'){
			draging = true;
		}

		geocoder.geocode(locality, function( results, status ) {
			if( status == google.maps.GeocoderStatus.OK ) {

				//In this case it creates a marker, but you can get the lat and lng from the location.LatLng
				map.setCenter( results[0].geometry.location );
				map.setZoom(16)
				var marker = new google.maps.Marker( {
					map     : map,
					position: results[0].geometry.location,
					draggable: draging,
				} );
				marker.addListener('drag', handleEvent);
   				marker.addListener('dragend', handleEvent);
   				if($('#latitude').length && $('#longitude').length) {
	                //document.getElementById('latitude').value = results[0].geometry.location.lat();
	                //document.getElementById('longitude').value = results[0].geometry.location.lng();
            	}
			} else {
				//alert( 'Geocode was not successful for the following reason: ' + status );
			}
		} );
	}
	function handleEvent(event) {
		document.getElementById('latitude').value = event.latLng.lat();
		document.getElementById('longitude').value = event.latLng.lng();
	}
	$('#locality').on('change',function(){

        if(Elocality !== undefined) {
        	if(Elocality!= $(this).val()){
        		var map = onChangeMapIntitialization();
        		codeAddress(map,{ address: $(this).find('option:selected').text() },'cedit');
        	}
        } else{
        	var map = onChangeMapIntitialization();
        	codeAddress(map,{ address: $(this).find('option:selected').text() },'cedit');
        }
	});

	function onChangeMapIntitialization() {
		var myOptions = {
          zoom: 4,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        return  new google.maps.Map(document.getElementById("map"),myOptions);
	}
    window.onload= loadMap;
})