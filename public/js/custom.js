jQuery(document).ready(function(){
    
    $(document).on("click","#user-delete",function(){
        if (confirm('Are you sure? This action cannot be undone')) {
        var uuid = $(this).attr("data-uuid");
        $.ajax({
            url: "/admin-manager/user-delete",
            type: "POST", 
            dataType: 'json',
            data: { ajaxid: 4, uuid:uuid },
            success: function(response) { 
                if(response.success == true){
                    alert("Deletion completed successfully");
                    window.location.reload();
                } else {
                    alert("Failed");
                }
            },
            error: function(xhr) { }
            });
        }
    });

    $(document).on("click",".van-delete",function(){
        if (confirm('Are you sure? This action cannot be undone')) {
            var uuid = $(this).attr("data-uuid");
        $.ajax({
            url: "/vans-manager/van-delete",
            type: "POST", 
            dataType: 'json',
            data: { ajaxid: 4, uuid:uuid },
            success: function(response) { 
                if(response.success == true){
                    window.location.href = '/vans/list';
                } else {
                    //alert("Failed");
                }
            },
            error: function(xhr) { }
            });
        }
    });

    $(document).on("click",".dc-delete",function(){
        if (confirm('Are you sure? This action cannot be undone')) {
            var uuid = $(this).attr("data-uuid");
        $.ajax({
            url: "/dc-manager/dc-delete",
            type: "POST", 
            dataType: 'json',
            data: { ajaxid: 4, uuid:uuid },
            success: function(response) { 
                if(response.success == true){
                    window.location.href = '/dc/list';
                } else {
                    //alert("Failed");
                }
            },
            error: function(xhr) { }
            });
        }
    });

    $(document).on("change","#dc_uuid",function(){
        var dc_name = $( "#dc_uuid option:selected" ).text();
        $("#dc_name").val(dc_name);
    });

});