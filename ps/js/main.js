/* * ************************************************************ 
 * Date: 18 Mar, 2017
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file main.js
 * *************************************************************** */

var app = angular.module('main',[]);

app.controller("ps",["$scope",function($scope){
        var toFloat = function(n,m){
            var x = m > 2 ? Math.pow(10,m) : 100;
            return parseInt(n*x)/x;
        };
        
        $scope.reset = function(){
            $scope.load = parseInt($scope.load);
            $scope.maxah = parseInt($scope.maxah);
            $scope.ah = $scope.maxah;
            $scope.bv = ahToBv();
            $scope.pvW = 0;
            $scope.pvPP = parseInt($scope.pvPP);
            $scope.duration = parseInt($scope.duration); //seconds
            $scope.ip = true;
            $scope.sec = 0; //seconds
            $scope.sod = 0;
            $scope.interval = parseFloat($scope.interval); //seconds
            $scope.i = null;
            $scope.cap = $scope.getCap();
            $scope.time = $scope.sodToTime();
            $scope.kwhPv = 0;
            $scope.kwhLoad = 0;
            $scope.days = 1;
            $scope.avgkwhPv = 0;
            $scope.avgkwhLoad = 0;
            $scope.eff = parseFloat($scope.eff);
        };
        
        
        $scope.start = function(){
            $scope.reset();
            $scope.i = setInterval(function(){
                $scope.sec = $scope.sec < $scope.duration ? ($scope.sec + $scope.interval) :  0;
                $scope.sod = secToSod();
                $scope.pvW = parseInt(sodToPvW());
                $scope.bv = toFloat(BV());
                $scope.cap = $scope.getCap();
                $scope.time = $scope.sodToTime();
                $scope.kwhPv += toFloat(kwhPv());
                $scope.kwhLoad += toFloat(kwhLoad());
                $scope.kwhgrid += toFloat(kwhGrid());
                if($scope.sec === 0){
                    $scope.avgkwhPv = toFloat($scope.kwhPv / $scope.days);
                    $scope.avgkwhLoad = toFloat($scope.kwhLoad / $scope.days);
                    $scope.avgkwhGrid = toFloat($scope.kwhGrid / $scope.days);
                    $scope.days++;
                }
                $scope.$apply();
            },$scope.interval*1000);
        };
        
        $scope.stop = function(){
            clearInterval($scope.i);
            $scope.reset();
        };
        
        var secToSod = function(){
            return $scope.sec * ( 24 * 60 * 60/ ($scope.duration));
        };
        
        var intvToH = function(){
            return 24*$scope.interval/$scope.duration;
        };
        
        var sodToPvW = function(){
            var st = $scope.sunStart * 3600, se = $scope.sunStop * 3600;
            var range = se - st, current = $scope.sod - st;
            if($scope.sod < st || $scope.sod > se) return 0;
            return $scope.pvPP * Math.sin(current/range*3.1415)*$scope.eff;
        };
        
        var bvToAH = function(){
            for(var i =0 ;i<BvMap.length;i++){
                var b = BvMap[i];
                if($scope.bv < b.max && $scope.bv > b.min){
                    return $scope.maxah * (b.minp + (b.maxp - b.minp)/(b.max - b.min)*($scope.bv-b.min))/100;
                    return;
                }
            }
        };
        
        var ahToBv = function(){
            if($scope.ah >= $scope.maxah) return 15.25;
            else if($scope.ah/$scope.maxah < 0.01) return 11.2;
            for(var i =0 ;i<BvMap.length;i++){
                var b = BvMap[i];
                var pc = $scope.ah / $scope.maxah * 100;
                if(pc < b.maxp && pc > b.minp){
                    return (b.min + (b.max - b.min)/(b.maxp - b.minp)*(pc-b.minp));
                }
            }
            return 10;
        };
        
        var BV = function(){
            var p = sodToPvW() + gridP() - $scope.load;
            if(p > 0){
                if($scope.ah <= $scope.maxah){
                    $scope.ah += toFloat(p*intvToH()/$scope.bv);
                    if($scope.ah > $scope.maxah) $scope.ah = $scope.maxah;
                }
            }else if(p < 0){
                $scope.ah += toFlaot(p*intvToH()/$scope.bv);
            }
            return ahToBv();
        };
        
        var kwhPv = function(){
            return $scope.pvW * intvToH();
        };
        
        var kwhLoad = function(){
            return $scope.load * intvToH();
        };
        
        var kwhGrid = function(){
            return gridP() * intvToH();
        };
        
        $scope.getCap = function(){
            return Math.ceil($scope.ah/$scope.maxah*100);
        };
        
        $scope.sodToTime = function(){
            var h = Math.floor($scope.sod/3600), m = Math.floor(($scope.sod-h*3600)/60);
            return h+":"+m;
        };
        
        var gridOn = function(){
            if($scope.pvW > 0) return false;
            if($scope.bv > 18){
                return false;
            }else{
                if($scope.cap > 50){
                    $scope.lv = false;
                    return false;
                }
                else {
                    if($scope.cap > 25){
                        if($scope.lv) return true;
                        else return false;
                    }else {
                        $scope.lv = true;
                        return true;
                    }
                }
            }
        };
        
        var gridP = function(){
            return gridOn() ? $scope.grid : 0;
        };
        
        $scope.load = 45;
        $scope.maxah = 150;
        $scope.ah = $scope.maxah;
        $scope.bv = ahToBv();
        $scope.grid = $scope.maxah * 1.2;
        $scope.pvW = 0;
        $scope.pvPP = 100;
        $scope.duration = 120; //seconds
        $scope.ip = true;
        $scope.sec = 0; //seconds
        $scope.sod = 0;
        $scope.interval = 0.25; //seconds
        $scope.i = null;
        $scope.cap = $scope.getCap();
        $scope.time = $scope.sodToTime();
        $scope.kwhPv = 0;
        $scope.kwhLoad = 0;
        $scope.kwhGrid = 0;
        $scope.days = 1;
        $scope.avgkwhPv = 0;
        $scope.avgkwhLoad = 0;
        $scope.avgkwhGrid = 0;
        $scope.eff = 0.7;
        $scope.lv = false;
        
        $scope.sunStart = 7; //hour
        $scope.sunStop = 17; //hour
        
        var BvMap = [
            {max : 15.25, min : 14, maxp : 100, minp : 90},
            {max : 14, min : 13.4, maxp : 90, minp : 70},
            {max : 13.4, min : 12.4, maxp : 70, minp : 10},
            {max : 12.4, min : 11.2, maxp : 10, minp : 0}
        ];
        
    }
]);