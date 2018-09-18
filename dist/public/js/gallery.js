$(function(){
    if($('img#'+currentid).length > 0){
        var currenslideIndex = $('img#'+currentid).parent('li').index();
    }else{
        var currenslideIndex = 0;
    }
    $('.bxslider').bxSlider({
        startSlide: currenslideIndex,
        adaptiveHeight:true,
        onSliderLoad: function(){
            // do funky JS stuff here
            let fids = new Array(currentid);
            getTags(fids);
        },
        onSlideAfter: function($slideElement){
            // do mind-blowing JS stuff here
            let currentfid = $slideElement.find('img').attr('id');
            let fids = new Array(currentfid);
            $('#message').html('');
            $('#photoTagInput').tagsinput('removeAll');
            $('input[name="photo_id"]').val(currentfid);
            getTags(fids) 

        }
    });

    amazonmenu.init({
        menuid: 'Tags'
    })

    $('#addTags').click(function(){
        $('#Tags').toggle();
    })

    $('#photoTagInput').tagsinput({
            itemValue: 'value',
            itemText: 'text',
            allowDuplicates: false
    });
    $('li[id^="tag#"]').click(function(){
        var tag = $(this).attr('id').split('#');
        $('#photoTagInput').tagsinput('add', { value: tag[1], text: tag[2] });
        //$('#photoTagInput').show();
    })

    /*********** ajax photo edit submit ************/

    $('.photoedit').click(function(e){
        e.preventDefault();
        var formaction = $( '#photoeditform' ).attr( 'action' );
        var photo_id = $('input[name="photo_id"]').val();
        var photo_tags = ($('#photoTagInput').tagsinput('items')==""?[]:$('#photoTagInput').tagsinput('items'))
        var data = {params:{photo_id:photo_id,photo_tags:photo_tags}};
        $.ajax({url:formaction,type:'post',data:data,dataType:'json',success:function(res){
            if(res.success){
               $('#message').html('<span class="alert alert-success">'+res.message+'</span>');
            }else{
                $('#message').html('<span class="alert alert-danger">'+res.message+'</span>');
            }
        },error:function(msg){
            $('#message').html('<span class="alert alert-danger">'+data+'</span>');
        }})
    })

    function getTags(fids) {
        $.ajax({url:'/file/get',data:{params:{files:fids}},type:"post",dataType:'json',success:function(data){
                if(data.success){
                    $.each(data.photo_tags,function(tags){
                        $.each(data.photo_tags[tags],function(key){
                            $('#photoTagInput').tagsinput('add', { value: data.photo_tags[tags][key].value, text: data.photo_tags[tags][key].text });
                        })
                    })
                }else{
                     $('#message').html('<span class="alert alert-danger">'+data.message+'</span>');
                }

            },error(data){
                 $('#message').html('<span class="alert alert-danger">'+data+'</span>');
        }})
    }
})