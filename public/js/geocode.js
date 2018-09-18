var geocoder = new google.maps.Geocoder();
var marker = null;
var map = null;

function initialize() {
      var $latitude = document.getElementById('latitude');
      var $longitude = document.getElementById('longitude');
      var latitude = $("#latitude").val() ? $("#latitude").val() : 12.9718915;
      var longitude = $("#longitude").val() ? $("#longitude").val() : 77.64115449999997;
      var zoom = 16;

      var LatLng = new google.maps.LatLng(latitude, longitude);

      var mapOptions = {
        zoom: zoom,
        center: LatLng,
        panControl: false,
        zoomControl: false,
        scaleControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      map = new google.maps.Map(document.getElementById('map'), mapOptions);
      if (marker && marker.getMap) marker.setMap(map);
      marker = new google.maps.Marker({
        position: LatLng,
        map: map,
        title: 'Drag Me!',
        draggable: true
      });

      google.maps.event.addListener(marker, 'dragend', function(marker) {
        var latLng = marker.latLng;
        $latitude.value = latLng.lat();
        $longitude.value = latLng.lng();
      });


    }

    initialize();

    $('#findbutton').click(function (e) {
        var address = $("#Postcode").val();
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                marker.setPosition(results[0].geometry.location);
                $(latitude).val(marker.getPosition().lat());
                $(longitude).val(marker.getPosition().lng());
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
        e.preventDefault();
    });
