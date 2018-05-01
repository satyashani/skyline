/* * ************************************************************ 
 * Date: 4 Jan, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file app.js
 * *************************************************************** */

var app = angular.module('skyline',[ 'ui.router', 'infinite-scroll']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider.state('home', {
            url : '/',
            controller : 'designer',
            templateUrl : "html/designer.html"
        });
    }
]);