/* * ************************************************************ 
 * Date: 9 May, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file importer.js
 * *************************************************************** */

var models = require("../core/models/");
var invt = require("../data/inverters.json");
var btr = require("../data/batteries.json");
var pnl = require("../data/panels.json");
var async = require("async");

async.each(invt,function(i,cb){
    i.pvvlow = i.pvv[0];
    i.pvvhigh = i.pvv[1];
    models.inverters.insert(i,cb);
},function(err){
    if(err)
        console.log("invt ",err.message);
});

async.each(btr,function(i,cb){
    models.batteries.insert(i,cb);
});

async.each(pnl,function(i,cb){
    models.panels.insert(i,cb);
});