/* * ************************************************************ 
 * Date: 12 May, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file page.js
 * *************************************************************** */

// Filter form
var updateUrl = function(){
    // Update filter url on input change
    var url = document.location.pathname, search = "";
    if($("#pricelow").val()){
        search += "pricelow="+$("#pricelow").val();
    }
    if($("#pricehigh").val()){
        search += "&pricehigh="+$("#pricehigh").val();
    }
    var brands = [];
    $("#brands input[type='checkbox']").each(function(){
        if($(this).is(":checked")){
            brands.push($(this).attr("id"));
        }
    });
    if(brands.length)
        search += "&brands="+brands.join(",");
    $("#apply").attr({ href : url +( search ? "?"+search : "" )});
};

$(document).ready(function(){
    $("#removeBrandsFilter").click(function(){
        $("#brands input[type='checkbox']").prop("checked", false);
        updateUrl();
    });
    
    $("#removePriceFilter").click(function(){
        $("#pricelow").val("");
        $("#pricehigh").val("");
        updateUrl();
    });
    
    $("form#filter input").change(updateUrl);

});