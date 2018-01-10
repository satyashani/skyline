/* * ************************************************************ 
 * Date: 10 Jan, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file rawDataInsert.js
 * *************************************************************** */


var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var async = require("async");
var pg = require("./postgres")();

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/:id",function(req,res){
    pg.insert("INSERT INTO skyline.rawcust VALUES($1,$2)",[req.params.id,JSON.stringify(req.body)],function(err){
        if(err){
            console.log(err);
        }else{
            console.log("Added Id",req.params.id);
        }
        res.json({ok : err ? err.message : true});
    });
});

var http = require("http");

var port = 3000;
http.createServer(app).listen(port, function(){
    console.log('Express server listening on port ' + port);
});
