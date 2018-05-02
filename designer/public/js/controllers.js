/* * ************************************************************ 
 * Date: 4 Jan, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file controllers.js
 * *************************************************************** */

var formatDate = function(d){
    var d1 = new Date(d), y = d1.getFullYear(), m = d1.getMonth()+1, d = d1.getDate();
    return y+"-"+(m < 10 ? "0" : "")+m+"-"+(d<10 ? "0" : "")+d;
};

var formatTime = function(d){
    var s = (new Date().getTime() - new Date(d).getTime())/1000;
    var h = parseInt(s/3600), m = parseInt(s%3600/60), sec = parseInt(s%60);
    var r = (h ? h+"h " : "")+(m ? m+"m " : "");
    if(!r && sec) r = "Few moments";
    r += " ago";
    return r;
};

app.controller("messageCtrl",["$scope",'msgService',function($scope,msgService){
    $scope.message = "";
    
    $scope.hide = function(){
        msgService.unset();
    };
    $scope.$watch(function(){
        return msgService.get();
    },function(m){
        $scope.message = m;
    });
}]);

app.controller("error",["$scope",'$rootScope',function($scope,$rootScope){
    $scope.info = {};
    $scope.close = function(){
        $scope.info = {};
        $('#errorModal').modal('hide') ;
    };
    $rootScope.error = function(title,message){
        $('#errorModal').modal('show') ;
        $scope.info = {
            title : title, message : message
        };
    };
}]);

app.controller("sidebar",['$scope', 'sidebar',function($scope, sidebar){
    $scope.$watch(function(){
        return sidebar.get();
    }, function(val){
        $scope.items = val;
    }); 
}]);

app.controller("loader",['$scope', 'loader',function($scope, loader){
    $scope.show = false;
    
    $scope.$watch(function(){
        return loader.get();
    }, function(val){
        $scope.show = val;
    }); 
}]);

app.controller("designer",['$scope', 'view','$http',function($scope, view,$http){
    $scope.types = {
        offgrid : "Off-Grid", ongrid : "On-Grid", hybrid : "Hybrid"
    };
    $scope.sortkeys = {
        cost : 'Price', valueformoney : "Value for Money"
    };
    $scope.sortkey = 'valueformoney';
    $scope.inputs = {
        "type" : "offgrid",
        "dailyunits" : 12,
        "backupkw" : 500,
        "backuphrs" : 6,
        "loadmax" : 3000,
        "filter" : true
    };
    
    $scope.results = [];
    
    $scope.design = function(){
        $http(api.design($scope.inputs)).then(function(res){
            $scope.results = res.data;
            $scope.sort();
        });
    };
    
    $scope.sort = function(){
        console.log("sorting by",$scope.sortkey);
        $scope.results.sort(function(a,b){
            return a.ranks[$scope.sortkey] - b.ranks[$scope.sortkey];
        });
    };
}]);


var initCheck = function($state){
    $state.go('home');
};
app.controller('init',['$state','$http','view',initCheck]);
app.run(['$state','$http','view',initCheck]);