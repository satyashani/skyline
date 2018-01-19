/* * ************************************************************ 
 * Date: 10 Jan, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file rawDataInsert.js
 * *************************************************************** */


var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var pg = require("./postgres")();
var http = require("http");

var app = express();

app.use(bodyParser.json());

app.get("/test",function(req,res){
    pg.insert("insert into skyline.test (id) values($1)",[req.query.id],function(err,result){
        if(err) console.log(err.message);
        res.json({ok : true , count: result, id : parseInt(req.query.id)});
    });
});

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


var port = 3001;
http.createServer(app).listen(port, function(){
    console.log('Express server listening on port ' + port);
});
