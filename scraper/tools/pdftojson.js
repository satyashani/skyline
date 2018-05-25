/* * ************************************************************ 
 * Date: 31 Jan, 2017
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file pdftojson.js
 * *************************************************************** */

var fs = require('fs');
var p2j = require("pdf2json");
var async = require("async");

var start = parseInt(process.argv[2]) || 0;

var extract = function(input){
    var out = {}, source = input.map(function(m){
        return m.value;
    });
    out.ivrs = source[1];
    out.tariffclass = source[5];
    out.mobile = source[source.indexOf("Phone%20Number")+2];
    out.phase = source[source.indexOf("Phase%20given")+1];
    out.loadsanction = source[source.indexOf("Load%20Sanctioned")+1];
    out.contractdemand = source[source.indexOf("Contract%20Demand")+1];
    out.maxdemand = source[source.indexOf("Maximum%20Demand")+1];
    out.prevbills = [];
    var startidx = source.indexOf("Reading%20Month")+4;
    for(var i=0;i<6;i++){
        out.prevbills.push({
            month : source[startidx+i*4],
            amt : source[startidx+2+i*4],
            unit : source[startidx+3+i*4]
        });
    }
    out.prevbills.push({
        month : source[7],
        amt : source[11],
        unit : source[9]
    });
//    
//    if(out.tariffclass === 'LV4.1A'){
//        out.mobile = source[source.indexOf("Phone%20Number")+2];
//        out.phase = source[source.indexOf("Phase%20given")+1];
//        out.loadsanction = source[source.indexOf("Load%20Sanctioned")+1];
//        out.contractdemand = source[source.indexOf("Contract%20Demand")+1];
//        out.maxdemand = source[source.indexOf("Maximum%20Demand")+1];
//        out.prevbills = [];
//        var startidx = source.indexOf("Reading%20Month")+4;
//        for(var i=0;i<6;i++){
//            out.prevbills.push({
//                month : source[startidx+i*4],
//                amt : source[startidx+2+i*4],
//                unit : source[startidx+3+i*4]
//            });
//        }
//        out.prevbills.push({
//            month : source[7],
//            amt : source[11],
//            unit : source[9]
//        });
//    }
//    else if(out.tariffclass === 'LV3.1.C'){
//        out.mobile = source[source.indexOf("Phone%20Number")+2];
//        out.phase = source[source.indexOf("Phase%20given")+1];
//        out.loadsanction = source[source.indexOf("Load%20Sanctioned")+1];
//        out.contractdemand = source[source.indexOf("Contract%20Demand")+1];
//        out.maxdemand = source[source.indexOf("Maximum%20Demand")+1];
//        out.prevbills = [];
//        var startidx = source.indexOf("Reading%20Month")+4;
//        for(var i=0;i<6;i++){
//            out.prevbills.push({
//                month : source[startidx+i*4],
//                amt : source[startidx+2+i*4],
//                unit : source[startidx+3+i*4]
//            });
//        }
//        out.prevbills.push({
//            month : source[7],
//            amt : source[11],
//            unit : source[9]
//        });
//    }
//    else if(out.tariffclass === 'LV2.2.0'){
//        out.mobile = source[source.indexOf("Phone%20Number")+2];
//        out.phase = source[source.indexOf("Phase%20given")+1];
//        out.loadsanction = source[source.indexOf("Load%20Sanctioned")+1];
//        out.contractdemand = source[source.indexOf("Contract%20Demand")+1];
//        out.maxdemand = source[source.indexOf("Maximum%20Demand")+1];
//        out.prevbills = [];
//        var startidx = source.indexOf("Reading%20Month")+4;
//        for(var i=0;i<6;i++){
//            out.prevbills.push({
//                month : source[startidx+i*4],
//                amt : source[startidx+2+i*4],
//                unit : source[startidx+3+i*4]
//            });
//        }
//        out.prevbills.push({
//            month : source[7],
//            amt : source[11],
//            unit : source[9]
//        });
//    }else if(out.tariffclass === 'LV1.2'){
//        
//    }
    return out;
};

var convert = function(id,cb){
    if(!fs.existsSync("../data/"+id+".pdf"))
        return cb();
    var pdfParser = new p2j();

    pdfParser.on("pdfParser_dataError", function(err) { 
        console.error(id,err.parserError,err);
        cb();
    });
    pdfParser.on("pdfParser_dataReady", function(data) {
        
//        fs.writeFileSync("./json/"+id+".json", JSON.stringify(out,0,4));
        fs.writeFileSync("../data/"+id+".json", JSON.stringify(data,0,4));
        cb();
    });

    pdfParser.loadPDF("../data/"+id+".pdf");
    
};

//var small = bills.slice(start,start+5000);
//async.eachSeries(small,function(bill,cb){
//    convert(bill.accountid,cb);
//},function(){
//    console.log("Completed");
//});

convert('yp',function(){
    console.log("done");
});