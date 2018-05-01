/* * ************************************************************ 
 * Date: 27 Apr, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file designer.js
 * *************************************************************** */

var fs =  require("fs");

var inverters = require("../data/inverters"),
    batteries = require("../data/batteries"),
    panels = require("../data/panels");
    
var diffcat = function(diff,val){
    if(diff / val < 0.15){
        return 1;
    }else if(diff / val < 0.25){
        return 2;
    }else if(diff / val < 0.35){
        return 3;
    }else return 4;
};

var inputs = {
    "type" : "offgrid",
    "dailyunits" : 12,
    "backupkw" : 500,
    "backuphrs" : 6,
    "loadmax" : 3000
};

exports.design = function(inputs){
    
    var unitperkw = 5;
    var pvkwreq = inputs.dailyunits * 1000 / unitperkw;
    var bahreq = inputs.backupkw * inputs.backuphrs * 1.5 / 12;

    //inverter selection 
    //max load must be < inverter max kw
    //pvkw must be < inverter pvkwmax
    var selectedinvt = [], final = [],summary = [];
    inverters.forEach(function(i){
        if(i.systemtype === inputs.type && i.pvkwmax >= pvkwreq && i.loadkwmax >= inputs.loadmax){
            selectedinvt.push(i);
        }
    });

    selectedinvt.forEach(function(i){
        i.panels = [];
        i.batteries = [];
        i.solutions = [];
        //panel selection

        panels.forEach(function(p){
            var s = {series : 1, parallel : 1, panel : p};
            s.totalkw = p.power * s.series * s.parallel;
            s.totalcurrent = p.imax * s.parallel;
            s.voc = p.vmax * s.series;

            //panel voc must be below or in between inverter pv dc range
            //panel imax must be below inverter max charging current
            //create as many series as in inverter

            if(p.vmax < i.pvv[1] && p.imax < i.maxchargecurrent){
                //if series voc is less than inverter voc, add more panels to series until series voc reaches in the range. this is minimum panels in series
                //for each panel combination, check if -
                //	total kw is less than inverter max kw
                //	total system voc is less than panel's max system V
                //add more panels as long as voc is not out of range
                while(s.voc < i.pvv[1] && s.totalkw <= i.pvkwmax && s.totalkw <= pvkwreq ){
                    if((s.series+1)*p.vmax > i.pvv[1] || (s.series+1) * p.power > i.pvkwmax){
                        break;
                    }
                    s.series ++;
                    s.totalkw = p.power * s.series * s.parallel;
                    s.voc = s.series * p.vmax;
                }
                if(s.voc < i.pvv[0]){
                    return;
                }
                //multiply series untill total kw is just above required kw, save values just below required and just above required kw
                var p1 = Math.floor( pvkwreq / s.totalkw ), p2 = Math.ceil( pvkwreq / s.totalkw );
                var p1kwdiff = pvkwreq - p1 * s.totalkw, p2kwdiff = p2 * s.totalkw - pvkwreq;
                s.parallel = p1kwdiff > p2kwdiff ? p2 : p1;
                s.totalkw = p.power * s.series * s.parallel;
                s.totalcurrent = p.imax * s.parallel;
                s.diff = Math.abs(pvkwreq - s.totalkw);
                //	total current is less than inverter charging current
                if(s.totalcurrent > i.maxchargecurrent){
                    return;
                }
                i.panels.push(s);
            }
        });
        //order by difference from required kw
        i.panels.sort(function(a,b){
            var wa = a.diff * a.series * a.parallel * a.panel.price, wb = b.diff * b.series * b.parallel * b.panel.price;
            return wa - wb;
        });



        batteries.forEach(function(b){
            var series = i.batteryv / b.v, parallel = 1;
            if(series > Math.floor(series)){
                return;
            }
            var totalah = b.ah*series;
            var p1 = Math.floor(bahreq / totalah), p2 = Math.ceil(bahreq/totalah);
            var p1diff = bahreq - p1 * totalah, p2diff = p2 * totalah - bahreq;
            parallel = p2diff > p1diff ? p1 : p2;
            var s = {
                series : series, parallel : parallel, battery : b, 
                diff : Math.abs(bahreq - totalah * parallel), totalah : totalah * parallel
            };
            if(s.diff > 0.5 * bahreq){
                return;
            }
            i.batteries.push(s);
        });
        i.batteries.sort(function(a,b){
            var wa = a.diff * a.series * a.parallel, wb = b.diff * b.series * b.parallel;
            return wa - wb;
        });

        i.panels.forEach(function(p){
            i.batteries.forEach(function(b){
                var s = {
                    inverter : i.name, maxload : i.loadkwmax, maxpv : i.pvkwmax,
                    panel : { 
                        name : p.panel.name , series : p.series, parallel : p.parallel, 
                        totalkw : p.totalkw, diff : Math.abs(p.totalkw - pvkwreq) ,
                        diffcat : diffcat( Math.abs(p.totalkw - pvkwreq),pvkwreq)
                    },
                    battery : { 
                        name : b.battery.name, series : b.series, parallel : b.parallel, 
                        totalah : b.totalah, diff : Math.abs(b.totalah - bahreq) ,
                        diffcat : diffcat(Math.abs(b.totalah - bahreq),bahreq)
                    },
                    cost : i.mrp * (1+i.tax/100) + 
                           p.totalkw * p.panel.price * (1+p.panel.tax/100) + 
                           b.series * b.parallel * b.battery.price * (1+b.battery.tax/100)
                };
                i.solutions.push(s);
                summary.push(s);
            });
        });

        i.solutions.sort(function(a,b){
            return a.cost - b.cost;
        });

        if(i.solutions.length){
            final.push(i);
        }
    });

    summary.sort(function(a,b){
        var wa = a.cost * a.panel.diffcat * a.battery.diffcat * a.panel.series * a.panel.parallel * a.battery.series * a.battery.parallel,
            wb = b.cost * b.panel.diffcat * b.battery.diffcat * b.panel.series * b.panel.parallel * b.battery.series * b.battery.parallel;
        return wa - wb;
    });

    fs.writeFileSync("results/solutions.json",JSON.stringify(final,1,4));
    fs.writeFileSync("results/summary.json",JSON.stringify(summary,1,4)); 
    
    return summary;
};
