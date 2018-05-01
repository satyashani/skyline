/* * ************************************************************ 
 * Date: 19 Jan, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file rawCustToTable.js
 * *************************************************************** */


var pg = require("./postgres")();
var async = require("async");

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
    params.type = "";
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
    var sql = "INSERT INTO skyline.billsjan18 ("+f.join(",")+") VALUES("+s.join(",")+")";
    pg.insert(sql,p,callback);
};

var process = function(){
    pg.selectAll("SELECT * FROM skyline.rawcust r where not exists (select 1 from skyline.billsjan18 b where b.accountid = r.id )",[],function(err,res){
        console.log("Received raw data",res ? res.length : (err ? err.message : 0));
        async.each(res,function(r,cb){
            if(r.data.amtToBePaid.toString().match(/E/))
                r.data.amtToBePaid = parseFloat(r.data.amtToBePaid.toString());
            insertBill(r.data,function(err){
                if(err && !err.message.match(/duplicate/)){
                    console.log("Error for id ",r.data.id,err.message);
                }
                cb();
            });
        },function(){
            console.log("Completed");
        });
    });
};

exports.process = process;

process();