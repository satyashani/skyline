/* * ************************************************************ 
 * Date: 2 Jan, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file custfinder.js
 * *************************************************************** */

/* * ************************************************************ 
 * Date: 6 Feb, 2017
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file seriesfinder.js
 * *************************************************************** */


var pg = require("webpage");
var jq = "../lib/jquery-1.10.1.min.js";
var fs = require("fs");
var system = require('system');
var args = system.args;

var series = require("../data/series.json");

var todo = args[1] || series[0];

var pre = [10000,99999];
var ids = [];

for(var i = pre[0]; i < pre[1];i++){
    ids.push(i*100000+todo);
}

var found = [];

var starturl = "http://www.mpez.co.in/portal/Jabalpur_home.portal?_nfpb=true&_pageLabel=custCentre_viewBill_jbl";

var type = args[1] || 'lt';

var progress = 0, seriesComplete = 0;

var scrape = function(){
    var page = pg.create();
    
    page.open(starturl,function(stat){
        console.log("page load : ",stat);
        
        var writeFile = function(){
            fs.write('customers-'+todo+'.json',JSON.stringify(found,0,4),'w');
        };
        
        page.injectJs(jq);
        
        page.onConsoleMessage = function(msg){
            console.log(msg);
        };
        
        page.onCallback = function(data){
            if(data.response){
                found.push(data);
            }
            progress++;
            console.log("Completed ",progress);
            if(progress >= ids.length){
                writeFile();
                phantom.exit();
            }
        };
        
        var checkId = function(id){            
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

                var success = function(response){
                    if(response.toString().indexOf("\r\n") > -1)
                        response = response.replace("\r\n",'');
                    if(response.toString().indexOf("'")>-1)
                        response = response.replace(/'/g,'"');
                    try{
                        var resjson = JSON.parse(response);
                        if(resjson.hasOwnProperty('results'))
                            window.callPhantom({id : id , response : resjson.results[0]});
                        else
                            window.callPhantom({id : id, response : false});
                    }catch(e){
                        if(response.indexOf("CM_ADDRESS2")>-1){
                            window.callPhantom({id : id , response : response});
                        }else window.callPhantom({id : id, response : false});
                    }
                };
                

                $.ajax({
                    type: 'POST',
                    url: url,
                    data: postdata,
                    success: success
                });

            },id,type);
        };
        
        for(var i=0;i<ids.length;i++){
            checkId(ids[i]);
        }
    });
};

scrape();