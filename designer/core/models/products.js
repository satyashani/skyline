/* * ************************************************************ 
 * Date: 8 May, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file products.js
 * *************************************************************** */


var model = require("./model");
var config = require("../../config").pg;

var types = model.types;
var table = config.pgschema+".products";

var props = {
    id      : types.string,
    type    :   types.string,
    name    :   types.string,
    brand   :   types.string,
    price       :   types.integer,
    maxdiscount :   types.integer,
    tax         :   types.integer,
    props       : types.json
};


class Product extends model.Model{
    constructor(){
        super(table,props);
    }
    
    insert (){
        // nothing to do
    }
    
    update (){
        // nothing to do
    }
    
    getBrands (cond,callback){
        this.findFields(["distinct brand"],cond, function(err,list){
            console.log(err);
            if(!list) callback(err,[]);
            else{
                callback(err,list.map(function(l){ return l.brand;} ));
            }
        });
    }
}

module.exports = new Product();