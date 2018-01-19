/* * ************************************************************ 
 * Date: 17 Jan, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file perftest.js
 * *************************************************************** */


var http = require("http");
var async = require("async");
var util = require("util");

var host = process.argv.length > 2 ? process.argv[2] : "localhost",
    port = process.argv.length > 3 ? process.argv[3] : '3000';
  
var Con = function(){
    var self = this;
    this.headers = {
        value: {},
        add : function(header,value){
            self.headers.value[header] = value; return self;
        },
        remove: function(header){
            if(self.headers.value.hasOwnProperty(header))
                delete self.headers.value[header];
            return self;
        },
        clear: function(){
            self.headers.value = {}; return self;
        },
        get: function(header){
            return self.headers.value[header];
        }
    };    
};

Con.prototype.request = function(route,method,data,callback){
    var self = this;
    var opts = {
        host: host, port: port, method: method === 'get' ? "GET" : "POST" ,path: route, headers: {}
    };
    if(method === 'post' && data)
        opts.headers['Content-Type'] = 'application/json';
    if(Object.keys(self.headers.value).length){
        for(var k in self.headers.value)
            opts.headers[k] = self.headers.value[k];
    }
    var req = http.request(opts,function(res){
        var data = "";
        res.on('data',function(d){
            data += d;
        }).on("end",function(){
            try{
                var json = JSON.parse(data);
                callback(null,res.statusCode,res.headers,json);
            }catch(e){
                console.log("Data not parsed as json");
                callback(null,res.statusCode,res.headers,data);
            }
        });
    }).on("error",function(err){
        callback(err);
    });
    if(method === 'post' && data)
        req.write(JSON.stringify(data));
    req.end();
};

Con.prototype.constructor = Con;

var Client = function(){
    this.io = new Con();
};

Client.prototype.test = function(){
    var self = this;
    var count = 1000, list = [];
    for(var i=0;i<count;i++){
        list.push(i+1);
    }
    var test = function(l,cb){
        var t = new Date().getTime();
        self.io.request("/test?id="+l,"get",{},function(err,code,header,data){
            var t1 = new Date().getTime();
            console.log("Got req id",data.id,' in time ',(t1-t)+"ms");
            cb(null,data);
        });
    };
    var t = new Date().getTime();
    async.each(list,function(l,cbs){
        test(l,cbs);
    },function(err){
        if(err){
            return console.log("error " ,err);
        }
        var t2 = new Date().getTime();
        var timetaken = (t2 - t), avgtime = timetaken / count, avgpersec = count/timetaken*1000;
        console.log("Time :",timetaken,"Avg time:",avgtime,"Avg per sec:",avgpersec);
    });
};

module.exports = Client;

var u = new Client();
u.test();