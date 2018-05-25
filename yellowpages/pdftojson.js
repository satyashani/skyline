/* * ************************************************************ 
 * Date: 31 Jan, 2017
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file pdftojson.js
 * *************************************************************** */

var fs = require('fs');
var p2j = require("pdf2json");
var async = require("async");
var yp = require("./yp");

var id = process.argv[2] || null;

var convert = function(id,cb){
    if(!fs.existsSync("./source/"+id+".pdf"))
        return cb();
    var pdfParser = new p2j();

    pdfParser.on("pdfParser_dataError", function(err) { 
        console.error(id,err.parserError,err);
        cb();
    });
    pdfParser.on("pdfParser_dataReady", function(data) {
        fs.writeFileSync("./data/"+id+".json", JSON.stringify(data,0,4));
        yp(id);
        cb();
    });

    pdfParser.loadPDF("./source/"+id+".pdf");
    
};

if(id){
    convert(id,function(){
        console.log("done");
    });
}else{
    console.log("usage  : node pdftojson.js <fileId> \nfileId : name of pdf file under source folder without extension");
}