/* * ************************************************************ 
 * Date: 8 May, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file inverters.js
 * *************************************************************** */

var model = require("./model");
var config = require("../../config").pg;

var types = model.types;
var table = config.pgschema+".inverters";
var props = {
    name    :   types.string,
    brand   :   types.string,
    power   :   types.integer,
    phase   :   types.integer,
    systemtype  :   types.string,
    pvkwmax :   types.integer,
    pvkwmin :   types.integer,
    pvvlow     :   types.integer,
    pvvhigh    :   types.integer,
    pvvmax  :   types.integer,
    chargertype :   types.string,
    batteryv    :   types.integer,
    loadkwmax   :   types.integer,
    surgekwmax  :   types.integer,
    warranty    :   types.integer,
    maxchargecurrent    :   types.integer,
    solarefficiency     :   types.integer,
    inverterefficieicy  :   types.integer,
    pvseries    :   types.integer,
    price       :   types.integer,
    maxdiscount :   types.integer,
    tax         :   types.integer,
    combotax    :   types.integer,
    isstring    :   types.boolean
};


class Inverter extends model.Model{
    constructor(){
        super(table,props);
    }
}

module.exports = new Inverter();