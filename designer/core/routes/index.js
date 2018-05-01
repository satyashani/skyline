/* * ************************************************************ 
 * Date: 1 May, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file index.js
 * *************************************************************** */


var designer = require("../designer");

var design = function(req,res){
    var inputs = {
        "type" : req.body.type || "offgrid",
        "dailyunits" : req.body.dailyunits || 12,
        "backupkw" : req.body.backupkw || 500,
        "backuphrs" : req.body.backuphrs || 6,
        "loadmax" : req.body.loadmax || 3000
    };
    var summary = designer.design(inputs);
    res.json(summary);
};


exports.addRoutes = function(app){
    app.post("/design",design);
};