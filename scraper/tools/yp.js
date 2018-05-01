/* * ************************************************************ 
 * Date: 19 Feb, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file yp.js
 * *************************************************************** */

var fs = require("fs");
var input = require("../data/yp.json");
var sample = require("../data/phonesample.json");
var output = [], out2 = [], xlevels = [];

var xid = function(x){
    return xlevels.map(function(o){ return o.x;}).indexOf(x);
};

for(var i=0;i<input.formImage.Pages.length;i++){
    output[i] = { texts : []}, out2[i] = [];
    for(var t = 0;t < input.formImage.Pages[i].Texts.length;t++){
        output[i].texts[t] = {
            t : input.formImage.Pages[i].Texts[t].R[0].T.replace(/%20/g," ").replace(/%22/g,"'").replace(/%26/g,'&'),
            s : input.formImage.Pages[i].Texts[t].R[0].TS[1],
            x : input.formImage.Pages[i].Texts[t].x,
            y : input.formImage.Pages[i].Texts[t].y,
            w : input.formImage.Pages[i].Texts[t].w
        };
        out2[i][t] = input.formImage.Pages[i].Texts[t].R[0].T.replace(/%20/g," ").replace(/%22/g,"'").replace(/%26/g,'&');
        var x = input.formImage.Pages[i].Texts[t].x, id = xid(x);
        if(id > -1){
            xlevels[id].count++;
        }else{
            xlevels.push({ x : x, count : 1});
        }
    }
};

fs.writeFileSync("../data/ypsmall.json",JSON.stringify(output,0,4));
fs.writeFileSync("../data/xlevels.json",JSON.stringify(xlevels.sort(function(a,b){
    return b.count - a.count;
}),0,4));

var process = function(output){
    var i = 0, main = [];
    var dashes = /^\-+$/, num = /\d+ ?\d+\-\d+/;
    while(i < output.length - 2){
        var current = output[i], 
        next = i < output.length - 1 ? output[i+1] : "",
        prev = i > 0 ? output[i-1] : "",
        prevprev = i > 1 ? output[i-2] : "";

        if(next === 'A'){
            main.push({title : current});
            i += 2;
        }
        else{
            if(next.toString().match(dashes)){
                if(prevprev.match(dashes)){
                    main.push({ title : prev , phone : current});
                }else{
                    if(prevprev && prevprev !== 'A'){
                        main.push({ title : prevprev, desc : prev , phone : current});
                    }else{
                        main.push({ title : prev , phone : current});
                    }
                }
                i+= 2;
            }else if(next.toString().match(num)){
                if(prev.match(dashes) || prev === 'A'){
                    main.push({ title : current , phone : next});
                }else{
                    main.push({ title : prev, desc : current, phone : next});
                }
                i+= 3;
            }else{
                i++;
            }
        }
    }
    return main;
};

var pages = [];
for(var i=0 ; i<output.length;i++){
    pages.push(process(out2[i]));
}


fs.writeFileSync("../data/ypparsed.json",JSON.stringify(pages,0,4));
fs.writeFileSync("../data/out2.json",JSON.stringify(out2,0,4));
//fs.writeFileSync("../data/sampleout.json",JSON.stringify(process(sample),0,4));