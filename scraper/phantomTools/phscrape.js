/* * ************************************************************ 
 * Date: 28 Jan, 2017
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file phscrape.js
 * *************************************************************** */

var pg = require("webpage");
var jq = "jquery-1.10.1.min.js";
var fs = require("fs");
var system = require('system');
var args = system.args;
var ids = require("./billtodl.json");

//var idrange = [83000,9999983000];
//var ids = [];
//for(var i = idrange[0];i< idrange[1];i+=100000){
//    var l = "";
//    if(i < 1000000) l = "0000";
//    else if(i < 10000000) l = "000";
//    else if(i < 100000000) l = "00";
//    else if(i < 1000000000) l = "0";
//    ids.push(l+i);
//}

var starturl = "http://www.mpez.co.in/portal/Jabalpur_home.portal?_nfpb=true&_pageLabel=custCentre_viewBill_jbl";

var type = args[1] || 'lt';

var scrape = function(){
    var page = pg.create();
    page.open(starturl,function(stat){
        var done = 0,success = 0,res = [];
        console.log("page load : ",stat);
        page.injectJs(jq);
        page.onCallback = function(result){
            done++;
            if(result.response){
                console.log("Got",result.response.accountId);
                res.push(result);
                success++;
            }
            if(done >= ids.length){
                console.log("successfully completed",success);
                fs.write('output.json',JSON.stringify(res),'w');
                phantom.exit();
            }
        };
        page.onConsoleMessage = function(msg){
            console.log(msg);
        };
        ids.forEach(function(id){
            page.evaluate(function(id,t){
                
                var lturl = 'http://www.mpez.co.in/onlineBillPayment?do=onlineBillPaymentUnregValidate';
                var hturl = 'http://www.mpez.co.in/HTBillPayment?do=UNREG';
                
                var url = t === 'lt' ? lturl : hturl;
                
                var postdata = t === 'lt' ? {
                    "chooseIdentifier" : "Account ID/IVRS",
                    "accntId"  : id,
                    "mblNum":"",
                    "emailId":"",
                    "gridValues":""
                } : {
                    "Host": "www.mpez.co.in",
                    "chooseIdentifier": "Account ID",
                    "accountId":id,
                    "chooseGateway":"- Choose Gateway -"
                };
                
                $.post(url,postdata,function(response){
                    if(response.toString().indexOf("\r\n") > -1)
                        response = response.replace("\r\n",'');
                    if(response.toString().indexOf("'")>-1)
                        response = response.replace(/'/g,'"');
                    try{
                        var resjson = JSON.parse(response);
                        if(resjson.hasOwnProperty('results'))
                            window.callPhantom({id : id , response : resjson.results[0]});
                        else
                            window.callPhantom({id : id , response : false});
                    }catch(e){
                        
                        if(response.indexOf("CM_ADDRESS2")>-1){
                            try{
                                var resnew = response.replace(/ CM_ADDRESS2 = /,' "CM_ADDRESS2" : "').replace(/\\"/g,'"');
                                var resjson = JSON.parse(resnew);
                                if(resjson.hasOwnProperty('results'))
                                    window.callPhantom({id : id , response : resjson.results[0]});
                                else
                                    window.callPhantom({id : id , response : false});
                            }catch(e){
                                window.callPhantom({id : id , response : response});
                            }
                        }else
                            window.callPhantom({id : id , response : response});
                    }
                });
            },id,type);
        });
    });
};

scrape();