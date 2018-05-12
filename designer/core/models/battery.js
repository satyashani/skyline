/* * ************************************************************ 
 * Date: 9 May, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file battery.js
 * *************************************************************** */


var model = require("./model");
var config = require("../../config").pg;

var types = model.types;
var table = config.pgschema+".batteries";
var props = {
    id            : types.string,
    name          : types.string,
    brand         : types.string,
    warranty      : types.integer,
    ah            : types.integer,
    v             : types.integer,
    price         : types.integer,
    tax           : types.integer,
    combotax      : types.integer,
    maxdiscount   : types.integer
};


class Battery extends model.Model{
    constructor(){
        super(table,props);
    }
}

module.exports = new Battery();