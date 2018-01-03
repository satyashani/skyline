/* * ************************************************************ 
 * Date: 30 Jan, 2017
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file jsontodb.js
 * *************************************************************** */

var pg = require("./postgres")();
var fs = require("fs");
var async = require("async");

var downloadids = require("./output/downloadids");

var months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

var insertBill = function(row,callback){
    if(!row || !row.accountId || !row.billId)
        return callback(new Error("invalid bill data - "+row));
    var fields = [
        "accountId","amtToBePaid","billDueDate","billId","illIssueDate","billMon","billYear",
        "connectionNo","consAddr","consCity","currentBillAmt","customerName","lastBillAmt","outstandingAmt"
    ];
    var params = {};
    fields.forEach(function(f){
        if(row.hasOwnProperty(f)){
            if(row[f].toString().match(/^\-?\d+\.?\d*$/)){
                params[f] = parseInt(row[f]);
            }else if(row[f].toString().match(/^\d{2}-[A-Z]{3}-\d{4}$/)){
                params[f] = new Date(row[f]);
            }
            else{
                params[f] = row[f];
            }
        }
    });
    if(row.hasOwnProperty('billMonth')){
        var m = row.billMonth.toString().match(/([A-Z]{3})\-(\d+)/);
        if(m && months.indexOf(m[1]) > -1){
            params.billMon = months.indexOf(m[1])+1;
            params.billYear = m[2];
        }
    }
    if(!params.billMon) params.billMon = 0;
    if(!params.billYear) params.billYear = 2017;
    var f = [],p = [], s = [],i=0;
    for(var k in params){
        f.push(k);
        p.push(params[k]);
        s.push("$"+(++i));
    }
    var sql = "INSERT INTO skyline.bills ("+f.join(",")+") VALUES("+s.join(",")+")";
    pg.insert(sql,p,callback);
};

var processCurrent = function(){
    var done = 0;
    var f = "./output/output.json";
    if(fs.existsSync(f)){
        var j = fs.readFileSync(f,{encoding : 'utf8'});
        try{
            var output = JSON.parse(j);
            output.forEach(function(o){
                insertBill(o.response,function(err){
                    done++;
                    if(err)
                        console.log('error',err.message);
                    if(done >= output.length)
                        process.exit();
                });
            }); 
        }catch(e){
            console.log('invalid data in ',f);
        }
    }   
};

var getMonthYear = function(data){
    var m = data.toString().match(/([A-Z]{3})\-(\d+)/);
    if(m && months.indexOf(m[1]) > -1){
        return {
            month : months.indexOf(m[1])+1,
            year : m[2]
        };
    }else{
        return {};
    }
};

var insertOld = function(data,cb){
    var fields1 = ['accountid','tariffclass','mobile','phase','loadsanction','contractdemand','maxdemand'];
    var params1 = [data.ivrs,data.tariffclass,data.mobile,data.phase,data.loadsanction,data.contractdemand,data.maxdemand];
    var place1 = ["$1","$2","$3","$4","$5","$6",'$7'];
    var sql1 = "INSERT INTO skyline.connections ("+fields1.join(",")+") VALUES("+place1.join(',')+")";
    
    var fields2 = ['account','month','year','reading','unit'];
    var place2 = ["$1","$2","$3","$4","$5"];
    var sql2 = "INSERT INTO skyline.history ("+fields2.join(",")+") VALUES("+place2.join(',')+")";
    
    
    pg.insert(sql1,params1,function(err){
        if(err)
            console.log("insert1 error",err.message);
        if(!data.hasOwnProperty('prevbills')){
            console.log("missing prevbills in ",data.ivrs);
            return cb();
        }
        async.each(data.prevbills,function(b,cb2){
            var monyr = getMonthYear(b.month);
            if(!monyr.year){
                console.log(monyr,'bad month input');
                if(monyr.toString() === "[object Object]") return cb2();
                else
                    return cb2(new Error("bad month input "+monyr+" in account id "+data.ivrs));
            };
            var p = [data.ivrs,monyr.month,monyr.year,parseInt(b.amt),parseInt(b.unit)];
            pg.insert(sql2,p,function(err2){
                if(err2)
                    console.log("insert error2",err2.message);
                cb2();
            });
        },cb);
    });
};

var insertSeries = function(row,callback){
    if(!row || !row.id || !row.billid)
        return callback(new Error("invalid bill data - "+row));
    var fields = [
        "id","amt","billdate","billid","mon","year","addr","city","mob","curramt","name","pendingamt"
    ];
    var params = {};
    fields.forEach(function(f){
        if(row.hasOwnProperty(f)){
            if(row[f].toString().match(/^\-?\d+\.?\d*$/)){
                params[f] = parseInt(row[f]);
            }else if(row[f].toString().match(/^\d{2}-[A-Z]{3}-\d{4}$/)){
                params[f] = new Date(row[f]);
            }
            else{
                params[f] = row[f];
            }
        }
    });
    if(row.hasOwnProperty('mon')){
        var m = row.mon.toString().match(/([A-Z]{3})\-(\d+)/);
        if(m && months.indexOf(m[1]) > -1){
            params.mon = months.indexOf(m[1])+1;
            params.year = m[2];
        }
    }
    if(!params.mon) params.mon = 0;
    if(!params.year) params.year = 2017;
    var f = [],p = [], s = [],i=0;
    for(var k in params){
        f.push(k);
        p.push(params[k]);
        s.push("$"+(++i));
    }
    var sql = "INSERT INTO skyline.series ("+f.join(",")+") VALUES("+s.join(",")+")";
    pg.insert(sql,p,callback);
};

var processOld = function(){
    async.each(downloadids,function(dl,cb){
        var f = './json2/'+dl.accountid+".json";
        if(fs.existsSync(f)){
            var j = fs.readFileSync('./json2/'+dl.accountid+".json",{encoding : 'utf8'});
            try{
                var data = JSON.parse(j);
                insertOld(data,cb);
            }catch(e){
                console.log('invalid data in ',f);
                cb(e);
            }
        }else cb();
    },function(err){
        console.log(err,'done');
        process.exit();
    });
};

var processSeries = function(){
    var f = "./output/series_1.json";
    if(fs.existsSync(f)){
        var j = fs.readFileSync(f,{encoding : 'utf8'});
        try{
            var data = JSON.parse(j);
            console.log("Processing ",data.length,'rows');
            async.each(data,function(d,cbs){
                var row = {
                    "id" : d.response.accountId,
                    "amt" : d.response.amtToBePaid,
                    "billdate" : d.response.billDueDate,
                    "billid" : d.response.billId,
                    "mon" : d.response.billMonth,
                    "year" : 0,
                    "addr" : d.response.consAddr,
                    "city" : d.response.consCity,
                    "mob" : d.response.consumerMobileNumber,
                    "curramt" : d.response.currentBillAmt,
                    "name" : d.response.customerName,
                    "pendingamt" : d.response.outstandingAmt
                };
                insertSeries(row,function(err){
                    if(err) console.log(err.message, row.id);
                    cbs();
                });
            },function(){
                console.log("Processed");
                process.exit();
            });
        }catch(e){
            console.log('invalid data in ',f);
        }
    }else{
        console.log("File does not exist");
    }
};

var c = process.argv[2];

if(c === 'current'){
    processCurrent();
}else if(c === 'old'){
    processOld();
}else if(c === 'series'){
    processSeries();
}