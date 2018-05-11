/* * ************************************************************ 
 * Date: 1 May, 2018
 * programmer: Shani Mahadeva <satyashani@gmail.com>
 * Javascript file app.js
 * *************************************************************** */


var modulename = 'Main';

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var async = require("async");

// ******* Node Lib     ************ //
var http = require('http');
var app = express();

// ******* Xray Routes  ************ //
var router = require("./core/routes/");

// all environments
app.set('port', 3000);
app.set('views', './public/ejs');
app.enable('strict routing');
app.use(express.static(path.join(__dirname, 'public'),{ maxAge: 31557600000 }));
app.use(bodyParser.json());

router.addRoutes(app);

app.listen(app.get('port'), function(){});