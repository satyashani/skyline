/* * ************************************************************ 
 * Date: 4 Jan, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file services.js
 * *************************************************************** */


app.service('sidebar',[function(user){
    var sidebar = null;
    
    
    var setSidebar = function(){
        var sidebars = {
            home : [
                { url : "/#/users", state : "users", text : "Users" },
                { url : "/#/admins", state : "admins", text : "Admins" },
                { url : "/#/clients", state : "clients", text : "Clients" },
                { url : "/#/createUser", state : "createUser", text : "Create new user" },
                { url : "/#/profileEdit", state : "profileEdit", text : "Edit profile" },
                { url : "/#/loggedIn", state : "loggedInUsers", text : "Logged-In Users" },
                { url : "/#/files/latest", state : "files.latest", text : "Latest bet file" },
                { url : "/#/logout", state : "logout", text : "Logout" }
            ]
        }; 
        
        sidebar = sidebars.home;
        
    };
    
    return {
        get : function(){ return sidebar;},
        set : setSidebar
    };
}]);

app.service("title",function(){
    var title = null;
    return {
        get : function(){ return title;},
        set : function(u){ title = u;}
    };
});

app.service("loader",function(){
    var show = null;
    return {
        show : function(){
            show = true;
        },
        hide : function(){
            show = false;
        },
        get : function(){
            return show;
        }
    };
});

app.service("msgService",function(){
    var m = "";
    return {
        get: function (){ return m; },
        set: function(ms){
            m = ms;
        },
        unset : function(){
            m = null;
        }
    };
});


app.service("paging",['$rootScope','$http','loader',function($root,$http,loader){
    var page = 0, count = 10, items = [],
        update = function(d){ return d;},
        api = function(){ return "/";},
        i = null, hasmore = false, hasless = false;
        
    var load = function(){
        loader.show();
        $http(api({ start : count * page, limit : count})).then(function(res){
            loader.hide();
            if(res.data.data && res.data.data.length){
                items = res.data.data;
                hasless = page > 0;
                hasmore = items.length === count;
                update(items,page,hasmore,hasless);
            }else{
                hasmore = false;
                if(page > 0){
                    page--;
                    load();
                }else{
                    update([],page,hasmore,hasless);
                }
            }
        },function(err){
            loader.hide();
            update(items,page,hasmore,hasless);
        });
    };

        
    $root.$on("$stateChangeStart",function(){
       if(i){
           clearInterval(i);
       } 
    });
        
    return {
        /**
         * 
         * @param {Function} apiProvider function({start : --, limit : --}}
         * @param {Function} onUpdate function(items,page,hasmore,hasless)
         * @param {integer} pagesize
         */
        init : function(apiProvider,onUpdate,pagesize){
            page = 0; items = [];
            count = parseInt(pagesize) || count;
            api = apiProvider;
            update = onUpdate;
            i = setInterval(function(){
                load();
            },5000);
            load();
        },
        next : function(){
            if(hasmore){
                page++;
                load();
            }
        },
        back : function(){
            if(hasless && page > 0){
                page--;
                load();
            }
        }
    };
}]);

app.service('view',["loader",'sidebar','title','msgService',function(loader,user,sidebar,title,m){
    var view = {
        loader : loader,
        user : user,
        sidebar : sidebar,
        title : title,
        message : m
    };
    
    return view;
}]);
