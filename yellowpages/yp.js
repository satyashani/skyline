/* * ************************************************************ 
 * Date: 19 Feb, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file yp.js
 * *************************************************************** */

var fs = require("fs");
var output = [], out2 = [], xlevels = [];


var xid = function(x){
    return xlevels.map(function(o){ return o.x;}).indexOf(x);
};

var makeTree = function(output){
    var main = { children : [] } , levels = {"1" : 0, "2" : 0, "3" : 0, "4" : 0, current : 1};
    var dashes = /^\-+$/, num = /\d+ ?\d+\-\d+/, single = /^.$/;
    
    var getCurrent = function(){
        var c = main;
        for(var i=1;i<levels.current;i++){
            c = c.children[levels[""+i]];
        }
        return c;
    };
    try{
        output.forEach(function(o){
            o.x = o.x > 11.5 ? o.x - 11.5 : o.x;
            var c = getCurrent();
            if(o.x < 1.5 | o.y < 3 || o.t.match(dashes) || o.t.match(single)){
                return;
            }else if(o.t.match(num)){
                c.phone = o.t;
                levels.current--;
            }else{
                if(o.y === c.y){
                    c.address = o.t;
                }else if(o.y !== c.y){
                    if(levels.current > 1 && o.x > c.x){
                        if(!c.children){
                            c.children = [];
                        }
                        levels[""+levels.current] = c.children.length;
                        c.children.push({ text : o.t,x : o.x, y : o.y});
                        levels.current++;
                    }else{
                        while(o.x <= c.x && levels.current > 1){
                            levels.current --;
                            c = getCurrent();
                        }
                        levels[""+levels.current] = c.children.length;
                        c.children.push({ text : o.t,x : o.x, y : o.y});
                        levels.current++;
                    }
                }
            }
        });
    }catch(e){
        fs.writeFileSync("./data/main.json",JSON.stringify(main,0,4));
        return e;
    }
    return main;
};


var getChildren = function(c){
    var t = {
        name : c.text
    };
    if(c.phone){
        t.phone = c.phone;
    }
    if(c.address){
        t.address = c.address;
    }
    if(c.children && c.children.length){
        t.sub = [];
        for(var k=0;k< c.children.length;k++){
            t.sub.push(getChildren(c.children[k]));
        }
    }
    return t;
};

var process = function(fileid){
    var infile = "./data/"+fileid+".json";
    if(!fs.existsSync(infile)){
        return new Error("Source file not found - "+infile);
    }
    var input = JSON.parse(fs.readFileSync(infile,{encoding: 'utf8'}));
    var outfile = "./data/"+fileid+"_out.json"; 
    
    // Get X levels and first output
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
    
    // get pages
    var pages = [];
    for(var i=0 ; i<output.length;i++){
        pages.push(makeTree(output[i].texts));
    }

    // merge pages
    var single = [];

    for(var i =0 ;i< pages.length;i++){
        pages[i].children.forEach(function(c){
            single.push(getChildren(c));
        });
    }

    fs.writeFileSync(outfile,JSON.stringify(single,0,4));
};


module.exports = process;