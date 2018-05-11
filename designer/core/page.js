/* * ************************************************************ 
 * Date: 9 May, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file page.js
 * *************************************************************** */

var ejs = require("ejs");
var fs = require("fs");
var path = require("path");
var async = require("async");

var files = {};

var templates = {
    achievements : "achievements",
    contents : "contents",
    footer : "footer", 
    gallery : "gallery", 
    jumbo : "jumbo", 
    mainmenu : "mainmenu", 
    products : "products", 
    sidebar : "sidebar", 
    titlebar : "titlebar",
    index : "index"
};
exports.templates = templates;

var loadTemplate = function(t){
    files[t] = fs.readFileSync("./public/ejs/"+t+".html",{encoding : "utf8"});
};

async.each(Object.keys(templates),function(t,cb){
    loadTemplate(t);
    cb();
});

ejs.fileLoader = function(name){
    var p = path.resolve("./public/ejs/"+name+".html");
    return fs.readFileSync(p,{encoding : 'utf8'});
};

var render = function(tpl,data){
    loadTemplate(tpl);
    return ejs.render(files[tpl],data || {});
};
exports.render = render;

var defaultJs = [
    "/js/lib/jquery-1.10.1.min.js",
    "/js/lib/bootstrap.min.js",
    "/js/lib/carousel.js",
    "/js/lib/angular.min.js",
    "/js/lib/angular-ui-router.min.js",
    "/js/lib/infinite-scroll.js",
    "/js/api.js",
    "/js/app.js",
    "/js/controllers.js",
    "/js/services.js"
];

var defaultCss = [
    "/css/bootstrap.min.css" ,
    "/css/bootswatch.less" ,
    "/css/fontello.css" ,
    "/css/fontello-codes.css" ,
    "/css/fontello-embedded.css" ,
    "/css/carousel.css" ,
    "/css/page.css"
];

class View {
    constructor(){
        this.page = {
            js : defaultJs.concat([]),
            css : defaultCss.concat([]),
            titlebar : render(templates.titlebar),
            mainmenu : render(templates.mainmenu),
            content : render(templates.contents, {html : "Nothing to show"}),
            footer : render(templates.footer)
        };
    }
    
    js (v){
        this.page.js.push(v);
        return this;
    }
    
    css (v){
        this.page.css.push(v);
        return this;
    }
    
    titlebar (t){
        this.page.titlebar = t;
        return this;
    }
    
    mainmenu (t){
        this.page.mainmenu = t;
        return this;
    }
    
    content (c){
        this.page.content = render(templates.contents, {html : c});
        return this;
    }
    
    footer (f){
        this.page.footer = f;
        return this;
    }
    
    index (cb){
        return render(templates.index, {
            titlebar : this.page.titlebar,
            mainmenu : this.page.mainmenu,
            contents : this.page.content,
            footer : this.page.footer,
            js : this.page.js,
            css : this.page.css
        },cb);
    }
}

exports.getView = function(){
    return new View();
};
