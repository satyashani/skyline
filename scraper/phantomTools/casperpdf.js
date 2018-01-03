/* * ************************************************************ 
 * Date: 31 Jan, 2017
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file casperpdf.js
 * *************************************************************** */

var casper=require('casper').create();
var bills = require("./downloadids.json");
var fs = require("fs");

var starturl = "http://www.mpez.co.in/portal/Jabalpur_home.portal?_nfpb=true&_pageLabel=custCentre_viewBill_jbl";

var folder = 'data/oct/pdf/';
        
casper.start(starturl, function() {
    console.log("Found ids ",bills.length);
    bills.forEach(function(bill){
        var f = folder+bill.accountid+".pdf";
        if(fs.exists(f)){
            console.log("File exists",f);
            return;
        }
        var dl = "http://www.mpez.co.in/onlineBillPayment?do=onlineBillPaymentPdf&consumerNo="+
                    bill.accountid+"&billId="+bill.billid+"&langOption=English";
        casper.download(dl, f, "GET");
    });
});

casper.run(); 