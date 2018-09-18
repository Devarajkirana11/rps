$(function(){
    var crop_max_width = 1025;
    var crop_max_height = 1536;
    var jcrop_api;
    var canvas;
    var context;
    var image;
    var prefsize;
    var fids = new Array();
    var imageFiles = new Array();
    var sizeExceedFiles = new Array();
    var totalcount=0;
    var fileEle="";
    var croppingIndexKey;
    var OriginalFileName;
    var hotel_id=null;

    $(document).on('change','.saveFile',function(){
        /***************** incase of multiple file elements, we need to reset before every onchange  *************************/
        fids = new Array();
        imageFiles = new Array();
        sizeExceedFiles = new Array();
        totalcount = 0;
        fileEle = "";
        $this = fileEle = $(this)
        if ( ! window.FileReader ) {
			return alert( 'FileReader API is not supported by your browser.' );
		}
        if(!$('input[name="hotel_id"]').length){
            return alert('Invalid Hotel ID');
        }else{
            hotel_id = $('input[name="hotel_id"]').val();
        }
        var htmlwrapper = '<div class="form-group fileuploadwrapper" id="'+$this.attr('name')+'fileuploadwrapper"></div>';
       $(htmlwrapper).insertAfter($this);
		var	input = $this[0] // Getting the element from jQuery
		if ( input.files ) {         
            totalcount = input.files.length;
            $.each(input.files,function(key,fileobj) {
                file = fileobj; // The file
                if(file.type.indexOf('image') > -1 ){  // check if file is of image type
                   // if(file.size <= 5242880 && file.size >= 524288) { //removing file upload limit on 28-09-2017 based on dilip request.
                        imageFiles.push({index:key,fileobj:file});
                    //}else{
                        // sizeExceedFiles.push({index:key,fileobj:file});
                    //}
                } else { // if not image type upload directly to server.
                    uploadFileToServer($this,file,fids,totalcount,key,file.name);
                }
            });

            // Once after looping all files on changes. Get only the image files..
            if(imageFiles.length > 0 || sizeExceedFiles.length > 0){
                var template = "<ul>";
                var firstindex;
                $.each(imageFiles,function(key,image){
                    if(key == 0)
                        firstindex = image.index;
                    template += "<li><a href='#' id='imagetoCrop_"+image.index+"'>"+image.fileobj.name+"</a></li>";
                })
                template += "</ul>";
                $("#FileModal").find('#Cropfilelist').find('div').html(template);
                InvalidFileCollection();


                $('#FileModal').modal({
                    backdrop: 'static',
                    keyboard: false,
                    display:'show'
                })
                $('#FileModal').on('shown.bs.modal', function (e) {
                    if(firstindex!== undefined && imageFiles.length>0){
                        $('a[id="imagetoCrop_'+firstindex+'"]').trigger('click');
                        firstindex=undefined;
                    }else{
                        $('.cropactions').hide();
                    }
                })
                

            }
            

		} else {
			// Handle errors here
			alert( "File not selected or browser incompatible." )
		}
    })

    $('#myModal').on('hidden.bs.modal', function () {
        fids = new Array();
        imageFiles = new Array();
        sizeExceedFiles = new Array();
        canvas=null;
    })
    $(document).on('click','[id^="imagetoCrop_"]',function(e){
        e.preventDefault();
        var imageid = $(this).attr('id').split('imagetoCrop_')[1];
        $.each(imageFiles,function(key,image){
            if(imageid == image.index){
                croppingIndexKey = image.index;
                OriginalFileName = image.fileobj.name;
                loadImage(image.fileobj);
            }
        })
    })


    $("#cropbutton").click(function(e) {
        applyCrop();
    });
    $("#scalebutton").click(function(e) {
        var scale = prompt("Scale Factor:", "1");
        applyScale(scale);
    });
    $("#rotatebutton").click(function(e) {
        applyRotate();
    });
    $("#hflipbutton").click(function(e) {
        applyHflip();
    });
    $("#vflipbutton").click(function(e) {
        applyVflip();
    });
    $("#uploadImage").click(function(e) {
        e.preventDefault();
        $(this).html('<i class="fa fa-refresh fa-spin"></i> Please Wait...');
        $('#cropApply').html('Preparing to Save...')
        
        setTimeout(function(){
            applyCrop();
             $('#cropApply').html('')
            var blob = dataURLtoBlob(canvas.toDataURL('image/jpeg'));       
            uploadFileToServer(fileEle,blob,fids,totalcount,croppingIndexKey,OriginalFileName) 
        },20)

    });


        $(".saveFile").each(function(key,value){
            $this = $(this);
            var fids = $this.attr('value');
            var ajaxCallStatus = 0;
            if(fids!=""){
                if(fids.constructor === Array) {
                   var data = fids
                   ajaxCallStatus=1;
                } else {
                   if(JSON.parse(fids)) {
                      var data = JSON.parse(fids);
                       ajaxCallStatus=1;
                   } else {
                     var data = [];
                     ajaxCallStatus = 0;
                   }
                }
                if(ajaxCallStatus == 1) {
                    $.ajax({ async: false,url:'/file/get',type:'post',dataType:'json',data:{params:{files:data}},success:function(res){
                        if(res.success){
                            var htmlwrapper = '<div class="form-group" id="'+$this.attr('name')+'fileuploadwrapper">';
                            $.each(res.links,function(key,link){
                                if(res.mime_types[key].indexOf('image') > -1 ) {
                                    var previewLink = '<img src = "'+link+'" width="100px" height="100px"/>';
                                    var wrapperclass = "col-sm-2"
                                } else {
                                    var previewLink = '<a href="'+link+'" target="_blank">'+link+'</a>';
                                    var wrapperclass = "";
                                }
                                htmlwrapper += '<div class="'+wrapperclass+' '+$this.attr('name')+'filelink_'+key+'">'+previewLink+'&nbsp<a href="#" class="btn btn-xs btn-danger removeFile" id="'+$this.attr('name')+'#'+res.fids[key]+'">Remove</a></div>';
                            })
                                htmlwrapper += '</div>';
                            $(htmlwrapper).insertAfter($this);
                            $('<input type="file" name="'+$this.attr('name')+'addmoreFiles" multiple class="saveFile form-control"/>').insertAfter($this);
                            $this.replaceWith('<input type="hidden" name="'+$this.attr('name')+'"  value=\''+JSON.stringify(JSON.parse(fids))+'\'>');
                            
                            
                        }else{
                            var htmlwrapper = '<div class="form-group" id="'+$this.attr('name')+'fileuploadwrapper">'+res.message+'</div>';
                            $(htmlwrapper).insertAfter($this);
                        }

                    }});
                }
            }
        });

    $(document).on('click','.removeFile',function(e){
        e.preventDefault();
        $this = $(this)
        var idarr = $(this).attr('id').split('#');
        var removefid = idarr[1];
        if(idarr[0].indexOf('addmoreFiles') > -1){
            idarr[0] = idarr[0].replace('addmoreFiles',"").trim();
        }
        var fidsString = $("input[name='"+idarr[0]+"']").attr('value');
        var fidsArr = JSON.parse(fidsString);
        $.each(fidsArr,function(index,fid){
            if(fid == removefid){
                fidsArr.splice(index,1);
            }
        })
        $this.html('<i class="fa fa-refresh fa-spin"></i> Remove');
        $.ajax({url:'/file/upload?id='+removefid,type:'DELETE',dataType:'json',success:function(res){
            if(res.success) {
                if(fidsArr.length == 0){
                    $('.fileuploadwrapper').remove();
                    if($('input[name="'+idarr[0]+'addmoreFiles"]').length){
                        $("input[name='"+idarr[0]+"addmoreFiles']").remove();
                        $("div#"+idarr[0]+"fileuploadwrapper").remove();
                    }
                    $("input[name='"+idarr[0]+"']").replaceWith('<input type="file" multiple name="'+idarr[0]+'"  class="saveFile form-control">');                  
                }else{
                    $("input[name='"+idarr[0]+"']").attr('value',JSON.stringify(fidsArr))
                }
                $this.closest('div[class*="filelink_"]').remove();
            } else {
                 $("input[name='"+idarr[0]+"']").siblings('span.text-danger').html(res.message);
            }
        },error:function(err){
            $("input[name='"+idarr[0]+"']").siblings('span.text-danger').html(err);
        }})
        

    })

    function InvalidFileCollection() {
        template = "<ul>";
        $.each(sizeExceedFiles,function(key,image){
            template += "<li><span class='text-danger'>"+image.fileobj.name+"</span></li>";
        })
        template += "</ul>";
        $("#FileModal").find('#sizeExceedfilelist').find('div').html(template);
    }

    function uploadFileToServer(fileEle,file,fids,totalcount,key,OrgFileName) {
         var progresswrapper= '<div id="'+fileEle.attr('name')+'progress_'+key+'" class="progress">\
            <div id="'+fileEle.attr('name')+'file_'+key+'" class="progress-bar progress-bar-success myprogress" role="progressbar" style="width:0%">0%</div>\
            </div>';
        // Do stuff on onload, use fr.result for contents of file
        $( '#'+fileEle.attr('name')+'fileuploadwrapper' ).append(progresswrapper);

        //creating form data..
        var formData = new FormData();
        formData.append('myfile',file,OrgFileName);

        $.ajax({
            url: '/file/upload?id='+hotel_id,
            data: formData,
            processData: false,
            contentType: false,
            type: 'POST',
            // this part is progress bar
            xhr: function () {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total;
                        percentComplete = parseInt(percentComplete * 100);
                        $('#file_modal').show();
                        $('#'+fileEle.attr('name')+'file_'+key+',#file_modal').text((percentComplete<100? percentComplete+ '%':"Processing, Please wait!"));
                        $('#'+fileEle.attr('name')+'file_'+key+',#file_modal').css('width', percentComplete + '%');
                        $('.cropactions').hide();
                        
                    }
                }, false);
                return xhr;
            },
            success: function (data) {
                if(data.success === true) {
                    $('#file_modal').hide();
                    $('#'+fileEle.attr('name')+'fileuploadwrapper').find('#'+fileEle.attr('name')+'progress_'+key).remove();
                    //check if image or doc to display thumbnail
                    if(file.type.indexOf('image') > -1 ) {
                        var previewLink = '<img src = "'+data.file+'" width="100px" height="100px"/>';
                    } else {
                        var previewLink = '<a href="'+data.file+'" target="_blank">'+data.file+'</a>';
                    }
                    $('#'+fileEle.attr('name')+'fileuploadwrapper').append('<div class="'+fileEle.attr('name')+'filelink_'+key+'">'+previewLink+'&nbsp<a href="#" class="btn btn-xs btn-danger removeFile" id="'+fileEle.attr('name')+'#'+data.fid+'">Remove</a></div>')
                    Pushingfids(fileEle,fids,totalcount,key,data.fid);
                    if(!$('a[id="imagetoCrop_'+key+'"]').parents('li').next('li').length && !$('a[id="imagetoCrop_'+key+'"]').parents('li').prev('li').length){
                        if(imageFiles.length > 0) {
                            $('a[id^="imagetoCrop_'+key+'"]').parents('li').remove();
                            canvas = null;
                            $('#FileModal').modal('toggle');
                        }
                    }else{
                        triggerCorresponding(key)
                    }
                } else if(data.success === false) { 
                    $('#'+fileEle.attr('name')+'fileuploadwrapper').find('#progress_'+key).remove();
                    $('#'+fileEle.attr('name')+'fileuploadwrapper').append('<div class="fileErrorMsg_'+key+'"><span class="text-danger">Error: '+data.message+'<span></div>')

                }
            },
            error: function (data) {
                $('#'+fileEle.attr('name')+'fileuploadwrapper').find('#progress_'+key).remove();
                $('#'+fileEle.attr('name')+'fileuploadwrapper').append('<div class="fileErrorMsg_'+key+'"><span>Error: '+data.message+'<span></div>')      
            }
        });
    }
    function triggerCorresponding(key) {
        if($('a[id^="imagetoCrop_'+key+'"]').parents('li').next('li').length)
            $('a[id^="imagetoCrop_'+key+'"]').parents('li').next('li').find('a').trigger('click');
        if($('a[id^="imagetoCrop_'+key+'"]').parents('li').prev('li').length)
            $('a[id^="imagetoCrop_'+key+'"]').parents('li').prev('li').find('a').trigger('click');
        $('a[id^="imagetoCrop_'+key+'"]').parents('li').remove();
    }
    function Pushingfids(fileEle,fids,totalcount,currentindex,fid) {
        var index =  parseInt(currentindex)+1;
        fids.push(fid);
        if(totalcount == parseInt(fids.length+sizeExceedFiles.length)) {
            if(fileEle.attr('name').indexOf('addmoreFiles') > -1){
                let actualFieldNameArr = fileEle.attr('name').split('addmoreFiles');
                let actualField = $('input[name='+actualFieldNameArr[0]+']');
                if(actualField.length){
                    let existingFids = JSON.parse(actualField.val());
                    $.each(existingFids,function(i,value){
                        fids.push(value);
                    })
                    actualField.val(JSON.stringify(fids));
                }
                fileEle.val('');
            }else{
                fileEle.replaceWith('<input type="hidden" name="'+fileEle.attr('name')+'" value=\''+JSON.stringify(fids)+'\'><input type="file" name="'+fileEle.attr('name')+'addmoreFiles" multiple="" class="saveFile form-control">');
            }
        }
    }


    function loadImage(file) {

        var reader = new FileReader();
        canvas = null;
        reader.onload = function(e) {
            image = new Image();
            image.onload = validateImage;
            image.src = e.target.result;
        }
        reader.readAsDataURL(file);
        
    }
    function validateImage() {
        if (canvas != null) {
            image = new Image();
            image.onload = restartJcrop;
            image.src = canvas.toDataURL('image/png');
        } else {
            if(this.width < 2048 && this.height < 1536){
                sizeExceedFiles.push({index:croppingIndexKey,fileobj:this});
                InvalidFileCollection();
                triggerCorresponding(croppingIndexKey)
                $('.cropactions').hide();
            }else{
                $('#uploadImage').html('Crop & Upload');
                $('.cropactions').show();
                restartJcrop();
            }
        }
    }
    function restartJcrop() {
        if (jcrop_api != null) {
            jcrop_api.destroy();
        }
        $("#views").empty();
        $("#views").append("<canvas id=\"canvas\">");
        canvas = $("#canvas")[0];
        context = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
        $("#canvas").Jcrop({
            //aspectRatio: 1,
            setSelect:   [5, 5, 2048,1536],
            minSize: [ 2048, 1536 ],
            allowResize: true,
            allowSelect: true,
            onSelect: selectcanvas,
            onRelease: clearcanvas,
            boxWidth: crop_max_width,
            boxHeight: crop_max_height
        }, function() {
            jcrop_api = this;
        });
        clearcanvas();
    }
    function clearcanvas() {
        prefsize = {
            x: 0,
            y: 0,
            w: canvas.width,
            h: canvas.height,
        };
    }

    function selectcanvas(coords) {
        prefsize = {
            x: Math.round(coords.x),
            y: Math.round(coords.y),
            w: Math.round(coords.w),
            h: Math.round(coords.h)
        };
    }

    function applyCrop() {
        canvas.width = prefsize.w;
        canvas.height = prefsize.h;
        context.drawImage(image, prefsize.x, prefsize.y, prefsize.w, prefsize.h, 0, 0, canvas.width, canvas.height);
        validateImage();
    }
    
    function applyScale(scale) {
        if (scale == 1) return;
        canvas.width = canvas.width * scale;
        canvas.height = canvas.height * scale;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        validateImage();
    }

    function applyRotate() {
        canvas.width = image.height;
        canvas.height = image.width;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.translate(image.height / 2, image.width / 2);
        context.rotate(Math.PI / 2);
        context.drawImage(image, -image.width / 2, -image.height / 2);
        validateImage();
    }

    function applyHflip() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.translate(image.width, 0);
        context.scale(-1, 1);
        context.drawImage(image, 0, 0);
        validateImage();
    }

    function applyVflip() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.translate(0, image.height);
        context.scale(1, -1);
        context.drawImage(image, 0, 0);
        validateImage();
    }
    function dataURLtoBlob(dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = decodeURIComponent(parts[1]);

            return new Blob([raw], {
                type: contentType
            });
        }
        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;
        var uInt8Array = new Uint8Array(rawLength);
        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {
            type: contentType
        });
    }
})