var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var db = mongoose.connect(process.env.MONGODB_URI);

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

// Serve static files on /public
app.use('/assets', express.static('./public/assets'));

// Routes
require('./app/routes')(app);