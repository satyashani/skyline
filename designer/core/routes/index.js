/* * ************************************************************ 
 * Date: 1 May, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file index.js
 * *************************************************************** */


var models = require("../models/");
var designer = require("../designer");
var page = require("../page");

var products = function(req,res){
    var q = {}, brandq = {}, brandSelected = [];
    if(req.query.q){
        q.name = { like : '%'+req.query.q+'%' };
        brandq.name = { like : '%'+req.query.q+'%' };
    }
    if(req.query.pricelow || req.query.pricehigh){
        q.price = {};
        if(req.query.pricelow){
            q.price.gte = req.query.pricelow;
        }
        if(req.query.pricehigh){
            q.price.lte = req.query.pricehigh;
        }
    }
    if(req.query.brands){
        brandSelected = req.query.brands.split(",");
        q.brand = { similar : "%("+brandSelected.join("|")+")%"};
    }
    if(req.params.type){
        q.type = { eq : req.params.type };
        brandq.type = { eq : req.params.type };
    }
    
    brandq.order =  { "brand" : "asc"};
    models.products.find(q,function(err,list){
        var pricelow = 100000000, pricehigh = 0;
        list = list || [];
        models.products.getBrands(brandq,function(err,brands){
            brands = brands || [];
            list.forEach(function(p){
                pricelow = Math.min(p.price,pricelow);
                pricehigh = Math.max(pricehigh , p.price);
            });
            if(req.is("json")){
                res.json({ok : !err, data : list, error : err ? err.message : null});
            }else{
                var view = page.getView();
                view.content(page.render(page.templates.products,{
                    pricelow : pricelow, pricehigh : pricehigh,
                    brands : brands || [] , 
                    products : list || [] ,
                    url : req.url,
                    brandSelected : brandSelected
                }));
                res.send( view.index() );
            }
        });
    });
};

var product = function(req,res){
    var cond = {
        id : { eq : req.params.productid }
    };
    models.products.getProduct(cond,function(err,product){
        var tpl = product.type;
        if(req.is("json")){
            res.json({ok : !err, data : product , error : err ? err.message : null});
        }else{
            var view = page.getView();
            if(!product){
                view.content(page.render(page.templates.notfound));
            }else{
                // Separate template for each product type
                view.content(page.render(page.templates[tpl],{
                    product : product ,
                    img : "/img/product/"+product.id+".jpg"
                }));
            }
            res.send( view.index() );
        }
    });
};

var design = function(req,res){
    var inputs = {
        "type" : req.body.type || "offgrid",
        "dailyunits" : req.body.dailyunits || 12,
        "backupkw" : req.body.backupkw || 500,
        "backuphrs" : req.body.backuphrs || 6,
        "loadmax" : req.body.loadmax || 3000,
        "filter" : req.body.filter
    };
    var summary = [];
    if(inputs.type === 'offgrid'){
        summary = designer.offgrid(inputs);
    }else if(inputs.type === 'hybrid'){
        summary = designer.hybrid(inputs);
    }else{
        summary = designer.ongrid(inputs);
    }
    res.json(summary);
};

var home = function(req,res){
    var html = page.render(page.templates.jumbo,{});
    html += page.render(page.templates.achievements,{});
    html += page.render(page.templates.gallery,{});
    var view = page.getView();
    res.send( view.content(html).index() );
};

var designerPage = function(req,res){
    var html = page.render(page.templates.app,{});
    var view = page.getView();
    res.send( view.content(html).index() );
};

exports.addRoutes = function(app){
    app.post("/design",design);
    app.get("/product/:productid",product);
    app.get("/products",products);
    app.get("/products/:type",products);
    app.get("/design-solar-system",designerPage);
    app.get("/",home);
};