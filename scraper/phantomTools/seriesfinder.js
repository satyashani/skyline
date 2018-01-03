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


var pre = [20000,20200];
var post = [10,99];
var postrange = [];
for(var i = post[0];i< post[1];i++){
    postrange.push(i*1000);
}

var found = [];

var starturl = "http://www.mpez.co.in/portal/Jabalpur_home.portal?_nfpb=true&_pageLabel=custCentre_viewBill_jbl";

var type = args[1] || 'lt';

var progress = {}, seriesComplete = 0;

var scrape = function(){
    var page = pg.create();
    var idlist = {}, serieslist = [];
    
    page.open(starturl,function(stat){
        console.log("page load : ",stat);
        
        var writeFile = function(){
            fs.write('series.json',JSON.stringify(found,0,4),'w');
            fs.write('progress.json',JSON.stringify(progress,0,4),'w');
        };
        
        page.injectJs(jq);
        
        page.onConsoleMessage = function(msg){
            console.log(msg);
        };
        
        page.onCallback = function(data){
            var wasFound = progress[data.series].found;
            if(data.response){
                found.push(data);
                progress[data.series].found = true;
            }
            var series = parseInt(data.series);
            progress[series].done++;
            if(progress[series].found || progress[series].done >= idlist[series].length){
                var idxs = serieslist.indexOf(series);
                if(!wasFound){
                    seriesComplete++;
                    console.log("Series Completed : ",series,"Found Data : ",progress[series].found ? "Yes" : "No",
                                "Done : ", progress[series].done
                                ,'total',seriesComplete,idxs+"/"+serieslist.length);
                }else if(progress[series].done >= idlist[series].length){
                    console.log("Series Requests Completed : ",series,"Found Data : ",progress[series].found ? "Yes" : "No",
                                'total',seriesComplete,idxs+"/"+serieslist.length);
                }
               
                if(idxs >= serieslist.length-1){
                    writeFile();
                    phantom.exit();
                }else if(progress[series].done >= idlist[series].length){
                    checkNextSeries(series);
                }
            }
        };
        
        var checkNextSeries = function(series){
            var idxs = series ? serieslist.indexOf(series) : -1;
            var next = serieslist[idxs+1];
            for(var i=0;i< idlist[next].length;i++){
                checkId(next,idlist[next][i]);
            }
        };
        
        var checkId = function(series,id){            
            page.evaluate(function(id,t,series){
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

                var res = null;

                var success = function(response){
                    if(response.toString().indexOf("\r\n") > -1)
                        response = response.replace("\r\n",'');
                    if(response.toString().indexOf("'")>-1)
                        response = response.replace(/'/g,'"');
                    try{
                        var resjson = JSON.parse(response);
                        if(resjson.hasOwnProperty('results'))
                            window.callPhantom({id : id , response : resjson.results[0], series : series});
                        else
                            window.callPhantom({id : id, response : false, series : series});
                    }catch(e){
                        if(response.indexOf("CM_ADDRESS2")>-1){
                            window.callPhantom({id : id , response : response, series : series});
                        }else window.callPhantom({id : id, response : false, series : series});
                    }
                };
                

                $.ajax({
                    type: 'POST',
                    url: url,
                    data: postdata,
                    success: success
                });

            },id,type,series);
        };
        
        for(var i=0;i<postrange.length;i++){
            var series = postrange[i];
            idlist[series] = [];
            serieslist.push(series);
            progress[series] = { found : false, done : 0};
            for(var j = pre[0];j<pre[1];j++){
                var id = j*100000+series;
                idlist[series].push(id);
            }
        }
        checkNextSeries(0);
    });
};

scrape();