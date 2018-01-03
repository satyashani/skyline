/* * ************************************************************ 
 * Date: 15 Jan, 2017
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file app.js
 * *************************************************************** */

var app = angular.module('skyline',[]);

app.controller("homeFeature",function($scope){
    $scope.data = [
        {
            bgimage : 'images/thumbs/featured/heater.jpg',
            smalltexts : ['Solar Water Heater,','20% Off,','MNRE Approved'],
            text : 'Redren Solar water heater in madhya pradesh',
            link : 'waterheater.html'
        },
        {
            bgimage : "images/thumbs/featured/roof-top-solar.jpg",
            smalltexts : ['Rooftop Solar,','Grid Tie Solar','Solar Home'],
            text : 'Rooftop solar system for Home',
            link : 'solarrooftop.html'
        },
        {
            bgimage : "images/thumbs/featured/covers-aldershot-commercial.jpg",
            smalltexts : ['Solar for factory','Solar Petrol pump'],
            text : 'Commercial solar system for saving electricity bill',
            link : 'solarrooftop.html'
        }
    ];
    setTimeout(function(){
        initiator.ssFlexSlider();
    },1000);
});