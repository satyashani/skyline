/* * ************************************************************ 
 * Date: 9 May, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file panels.js
 * *************************************************************** */
   
    
var model = require("./model");
var config = require("../../config").pg;

var types = model.types;
var table = config.pgschema+".panels";
var props = {
    name            : types.string,
    brand           : types.string,
    power           : types.integer,
    voc             : types.float,
    vmax            : types.float,
    isc             : types.float,
    imax            : types.float,
    cells           : types.float,
    price           : types.integer,
    tax             : types.integer,
    maxdiscount     : types.integer,
    minorder        : types.integer,
    maxsysv         : types.integer
};


class Panels extends model.Model{
    constructor(){
        super(table,props);
    }
}

module.exports = new Panels();