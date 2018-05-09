/* * ************************************************************ 
 * Date: 1 May, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file index.js
 * *************************************************************** */


var models = require("../models/");
var designer = require("../designer");

var products = function(req,res){
    var q = {
        name : { like : req.query.q }
    };
    if(req.params.type){
        q.type = { eq : req.params.type };
    }
    models.products.find(q,function(err,p){
        res.json({ok : !err, data : p, error : err ? err.message : null});
    });
};

var design = function(req,res){
    var inputs = {
        "type" : req.body.type || "offgrid",
        "dailyunits" : req.body.dailyunits || 12,
        "backupkw" : req.body.backupkw || 500,
        "backuphrs" : req.body.backuphrs || 6,
        "loadmax" : req.body.loadmax || 3000,
        "filter" : req.body.filter
    };
    var summary = [];
    if(inputs.type === 'offgrid'){
        summary = designer.offgrid(inputs);
    }else if(inputs.type === 'hybrid'){
        summary = designer.hybrid(inputs);
    }else{
        summary = designer.ongrid(inputs);
    }
    res.json(summary);
};


exports.addRoutes = function(app){
    app.post("/design",design);
    app.get("/products",products);
    app.get("/products/:type",products);
};