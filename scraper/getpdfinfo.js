/* * ************************************************************ 
 * Date: 31 Jan, 2017
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file getpdfinfo.js
 * *************************************************************** */



var pg = require("./postgres")();
var http = require("http");
var fs = require('fs');
var url = require('url');

var from = 1000, to = 10000000;

var select = function(from, to, callback){
    var sql = "SELECT * FROM skyline.bills WHERE amttobepaid > $1 AND amttobepaid < $2";
    pg.selectAll(sql,[from,to],callback);
};

var getPdf = function(){
    select(from,to,function(err,data){
        fs.writeFileSync("downloadids.json",JSON.stringify(data),{encoding : "utf8"});
        process.exit();
    });
};

getPdf();