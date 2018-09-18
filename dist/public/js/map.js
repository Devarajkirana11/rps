
var map;
var infoWindow;

var markersData = '';

$.ajax({
      url: "/orders-manager/get-orders-list",
      type: "GET", 
      dataType: 'json',
      data: { },
      success: function(response) { 
            markersData = response.data;
            console.log(markersData);
      },
      error: function(xhr) { }
});

function initialize() {
   var mapOptions = {
     // center: new google.maps.LatLng(12.960878,77.643951),
      zoom: 5,
      mapTypeId: 'roadmap',
   };

   map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
   infoWindow = new google.maps.InfoWindow();
   google.maps.event.addListener(map, 'click', function() {
      infoWindow.close();
   });
   
   displayMarkers();

   map.setCenter(new google.maps.LatLng(12.960878,77.643951));
}
google.maps.event.addDomListener(window, 'load', initialize);

function displayMarkers(){
   var bounds = new google.maps.LatLngBounds();
   
   for (var i = 0; i < markersData.length; i++){

      var latlng = new google.maps.LatLng(markersData[i].latitude, markersData[i].longitude);
      var name = markersData[i].customer_name;
      var order_id = markersData[i].order_id;
      var order_total = markersData[i].order_total;
      var address1 = markersData[i].address_1;
      var address2 = markersData[i].address_2;
      var postalCode = markersData[i].pin_code;
      var weight = markersData[i].weight;
      var color_code = markersData[i].color_code;
      var van_details = markersData[i].van_name;
      
      createMarker(latlng, name, order_id, weight, color_code, order_total, address1, address2, postalCode,van_details);
      bounds.extend(latlng);  
   }
      
   map.fitBounds(bounds);
}

function createMarker(latlng, name, order_id, weight, color_code, order_total, address1, address2, postalCode,van_details){
      
      if(weight > 0){ weight = weight; } else { weight = ''; }
      if(color_code){ color_code = color_code; } else { color_code = 'CCCCCC'; }

      var marker = new google.maps.Marker({
            map: map,
            position: latlng,
            title: name,
            draggable: true,
            order_id: order_id,
            weight : weight,
            address : address1,
            van_details : van_details,
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld='+weight+'|'+color_code,
      });

   google.maps.event.addListener(marker, 'click', function() {

      var van_uuid = $("#vans").val();
      var weight = this.weight;
      var order_id = this.order_id;
      var address = this.address;
      var van_details = this.van_details;
      
      var i = 0;
      var options = '';
      for(i = 0; i <=50; i++ ){
            if(weight == i){
                  options += '<option selected="selected" value="'+i+'">'+i+'</option>';
            } else {
                  options += '<option value="'+i+'">'+i+'</option>';
            }
      }

      var color_code = $("#vans option:selected").data("color");
      var marker_url = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld='+weight+'|'+color_code;
      var place_html = '<div class="row py-2" id="'+order_id+'"><div class="col-md-7"><b> ID : </b>'+order_id+'<br/><b>Address : </b>'+address+'</div><input type="hidden" name="order_id[]" value="'+order_id+'"><div class="col-md-3"><select class="form-control" data-orderid="'+order_id+'" id="sort_number" name="sort[]">'+options+'</select></div><div class="col-md-2"><span class="remove-order" data-orderid="'+order_id+'"><b>   X</b></span></div></div>';

      if($("#"+order_id).length) {
            
      } else {
            $(".orders-values").append(place_html);
      }

      marker.setIcon(marker_url); 


      var iwContent = '<div id="iw_container">' +
            '<div class="iw_title"> Order #' + order_id + '</div>' +
         '<div class="iw_content"><b>Customer Name : </b><br/>'+ name +'<br/><br/><b>Customer Address : </b><br/>' + address1 + '<br />' +
         postalCode + '<br/><br/><b>Order Value : </b><br/>'+order_total+'</div><div class="van-details" style="float:right;font-weight:bold;">'+van_details+'</div></div>';
      
      infoWindow.setContent(iwContent);
      infoWindow.open(map, marker);

   });
}           

jQuery(document).ready(function(){

      $("#delivery_date").datepicker({ dateFormat: 'yy-mm-dd' });

      /* Start of search filter click action */

      $(".search-filter").click(function(e){
        e.preventDefault();
        var store_name = $("#store_name option:selected").text();
        var delivery_date = $("#delivery_date").val();
        var slot = $("#slot").val();

        if(store_name == "undefined" || store_name == '' || store_name == null){
          alert("Please select the Delivery Center");
          return false;
        } else if (delivery_date == undefined || delivery_date == '' || delivery_date == null){
          alert("Please select the delivery date");
          return false;
        } else if(slot == undefined || slot == '' || slot == null){
          alert("Please select the slot");
          return false;
        }

        $.ajax({
        url: "/orders-manager/get-orders-list",
        type: "POST", 
        dataType: 'json',
        data: { dc_name : store_name, slot : slot, delivery_date : delivery_date },
        success: function(response) {
          markersData = response.data;
          initialize();
        },
        error: function(xhr) { }
        });

        $.ajax({
            url: "/vans-manager/get-vans-list",
            type: "POST", 
            dataType: 'json',
            data: { dc_name : store_name },
            success: function(response) {
                  var options = '<option value="">Select</option>';
                  if(response.data){
                        response.data.forEach(async function (value, index) {
                              options += '<option data-color="'+value.color_code+'" value="'+value.uuid+'">'+value.make+' '+value.reg_no+'</option>';
                        });
                  }
                  $("#vans").html(options);
            },
            error: function(xhr) { }
            });
            disable_fields();
      });

      /* End of search filter click action */

      /* Start of form saving action on assignment */

      $(document).on("click",".order-save",function(e){
            e.preventDefault();

            var sort_arr = $('select[name="sort[]"]').map(function () {
                  return this.value; 
            }).get();

            var order_arr = $('input[name="order_id[]"]').map(function () {
                  return this.value; 
            }).get();

            var van_uuid = $("#vans").val();
            var van_number = $("#vans option:selected").text();
            var cde_uuid = $("#cde").val();
            var color_code = $("#vans option:selected").data("color");
            var store_uuid = $("#store_name").val();
            var delivery_date = $("#delivery_date").val();
            var slot = $("#slot").val();
            var slot_number = $("#slot option:selected").text();

            if(van_uuid && cde_uuid){
                  $.ajax({
                        url: "/orders-manager/assigning-orders",
                        type: "POST", 
                        dataType: 'json',
                        data: { store_uuid : store_uuid, delivery_date : delivery_date, slot : slot, cde_uuid:cde_uuid ,color_code : color_code, sort_arr : sort_arr, order_arr : order_arr, van_uuid : van_uuid },
                        success: function(response) {
                              alert("Route Planning for Vehicle "+van_number+" for "+slot_number+" saved successfully");
                              window.location.reload();
                        },
                        error: function(xhr) { }
                  });
            } else {
                  alert("Please make sure you have selected van & cde ?");
                  return false;
            }
            
      });

      /* End of form saving action on assignment */

      /* Start of update the order while changing the number */

      $(document).on("change","#sort_number",function(){
            var sort_no = $(this).val();
            var order_id = $(this).data("orderid");
            var van_uuid = $("#vans").val();
            var color_code = $("#vans option:selected").data("color");
            var delivery_date = $("#delivery_date").val();
            var store_name = $("#store_name option:selected").text();
            var slot = $("#slot").val();
            if(van_uuid){
                  $.ajax({
                        url: "/orders-manager/single-order-update",
                        type: "POST", 
                        dataType: 'json',
                        data: { color_code : color_code, sort_no : sort_no, order_id : order_id, van_uuid : van_uuid },
                        success: function(response) {
                              refresh_map(store_name, slot, delivery_date);
                              get_orders_by_vans(van_uuid, store_name, delivery_date, slot);
                        },
                        error: function(xhr) { }
                  });
                  
            } else {
                  alert("Please select the van");
                  return false;
            }
      });

      /* End of update the order while changing the number */

      /* Action for changing vans start */

      $(document).on("change","#vans",function(){
            var van_uuid = $(this).val();
            var store_name = $("#store_name option:selected").text();
            var delivery_date = $("#delivery_date").val();
            var slot = $("#slot").val();
            get_orders_by_vans(van_uuid, store_name, delivery_date, slot);
            disable_fields();
      });

      /* Action for changing vans end */

      /* Start of delete action */

      $(document).on("click",".remove-order",function(){
            var order_id = $(this).data("orderid");
            if (confirm('Do you want to remove the order from the Vehicle?')) {
                  $.ajax({
                        url: "/orders-manager/remove-order-assign",
                        type: "POST", 
                        dataType: 'json',
                        data: { order_id : order_id },
                        success: function(response) {
                              $("#"+order_id).remove();
                        },
                        error: function(xhr) { }
                  });
            } else {
      
            }
      });

      /* End of delete action */

      disable_fields();

});

function disable_fields(){
      var store_name = $("#store_name").val();
      if(store_name){
            $("#vans").removeAttr("disabled");
      } else {
            $("#vans").attr("disabled","disabled");
      }
      var van_name = $("#vans").val();
      if(van_name){
            $("#cde").removeAttr("disabled");
      } else {
            $("#cde").attr("disabled","disabled");
      }
}

function get_orders_by_vans(van_uuid, store_name, delivery_date, slot){
      $.ajax({
            url: "/orders-manager/get-orders-list",
            type: "POST", 
            dataType: 'json',
            data: { van_uuid : van_uuid, store : store_name, delivery_date : delivery_date, slot : slot  },
            success: function(response) {
                  if(response.data){
                        var place_html = '';
                        response.data.forEach(async function (value, index) {
                              var i = 0;
                              var options = '';
                              var weight = value.weight;
                              var order_id = value.order_id;
                              var address = value.address_1;
                              for(i = 0; i <=50; i++ ){
                                    if(weight == i){
                                          options += '<option selected="selected" value="'+i+'">'+i+'</option>';
                                    } else {
                                          options += '<option value="'+i+'">'+i+'</option>';
                                    }
                              }
                              place_html += '<div class="row py-2" id="'+order_id+'"><div class="col-md-7"><b> ID : </b>'+order_id+'<br/><b>Address : </b>'+address+'</div><input type="hidden" name="order_id[]" value="'+order_id+'"><div class="col-md-3"><select class="form-control" data-orderid="'+order_id+'" id="sort_number" name="sort[]">'+options+'</select></div><span class="remove-order" data-orderid="'+order_id+'"><b>  X</b></span></div></div>';
                        });
                        $(".orders-values").html(place_html);
                  } else {
                        $(".orders-values").html("");
                  }
            },
            error: function(xhr) { }
      });
}

function refresh_map(store_name, slot, delivery_date){
      
      $.ajax({
      url: "/orders-manager/get-orders-list",
      type: "POST", 
      dataType: 'json',
      data: { store : store_name, slot : slot, delivery_date : delivery_date },
      success: function(response) {
        markersData = response.data;
        initialize();
      },
      error: function(xhr) { }
      });

}
      