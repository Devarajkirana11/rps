$(function(){
// Add a new repeating section
/*var attrs = ['for','name'];
function resetAttributeNames(section,indexcount,mode) { 
    var tags = section.find('input, label, select');
    tags.each(function(index,value) {
      var $this = $(this);
      $.each(attrs, function(i, attr) {
        var attr_val = $this.attr(attr);
        if (attr_val) {
            $($this).attr(attr, attr_val.replace(/_\d+$/, '_'+(indexcount + 1)))
            //$($this).attr(attr, attr_val+'_'+idx)
        }
      })
      console.log($this.prop('nodeName'))
      if($this.prop('nodeName') == "INPUT" && mode == 'add')
          $($this).val('')
      else if($this.prop('nodeName') == "SELECT" && mode == 'add')
          $($this).val('select')
    })
    DisplayErrors(errors)

}
$(document).on('click','#addnewLanguage',function(e){
        e.preventDefault();
        var currentclick = $(this).attr('id');
        var dataClass;
        var countclass;
        switch(currentclick){
            case 'addnewLanguage' : dataClass = 'language_wrapper'; countclass = 'ownercount';
            break;
        }
        var lastRepeatingGroup = $('.'+dataClass).last();
        var indexcount = $('.'+dataClass).length;
        var FDDcloned = lastRepeatingGroup.clone(true)  
        FDDcloned.insertAfter(lastRepeatingGroup);
        $("input[name="+countclass+"]").val(parseInt(indexcount)+1);

        resetAttributeNames(FDDcloned,indexcount,'add')
}); 
// Delete a repeating section
$('#deleteLanguage').click(function(e){
        e.preventDefault();
        var currentclick = $(this).attr('id');
        var dataClass;
        var countclass;
        switch(currentclick){
            case 'deleteLanguage' : dataClass = 'language_wrapper'; countclass = 'ownercount';
            break;
        }
        var other_rows = $('.'+dataClass).siblings('.'+dataClass);
        if (other_rows.length === 0) {
            alert("You should atleast have one row");
            return;
        }
        $(this).closest('.'+dataClass).slideUp('slow', function() {
            $(this).remove();
            var other_rows = $('.'+dataClass);
            $("input[name='"+countclass+"']").val(other_rows.length)
            // reset fight indexes
            $('.'+dataClass).each(function(index,value) {
               resetAttributeNames($(this),index,'delete'); 
            })  

        })
            
});*/
 
})