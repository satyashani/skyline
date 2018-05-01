/* * ************************************************************ 
 * Date: 4 Jan, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file api.js
 * *************************************************************** */

var api = {
    design : function(data){
        return {
            url : "/design", method : "POST", data : data
        };
    }
};