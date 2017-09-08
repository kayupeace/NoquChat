var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var path = require('path');
var session = require('express-session');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var cookieParser = require('cookie-parser');
var config = require('./lib/config/config.js').get(process.env.NODE_ENV);

//var databaseEnvironment = process.env.MONGODB_URI;
//var db = mongoose.connect(process.env.MONGODB_URI);
// below is the database connection for local environment, plz keep this
var db = mongoose.connect(config.database);

var app = express();

console.log("Current Environment is : " + process.env.NODE_ENV);

// view engine setup
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'pug');

//use sessions for tracking logins

const MongoStore = require('connect-mongo')(session);
app.use(session({
    secret: 'work hard',
    store: new MongoStore({ url:config.database}),
    //store: new MongoStore({ url: process.env.MONGODB_URI }),
    resave: true,
    saveUninitialized: false
}));


passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

app.use(cookieParser());
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


// Serve static files on /public
app.use('/assets', express.static('./public/assets'));

//      expires: new Date(Date.now() + 60 * 10000),
//      maxAge: 60*10000

//app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
/**
app.use(function(req, res, next) {
    var sess = req.session;

    if (sess.views) {
        sess.views++
        res.setHeader('Content-Type', 'text/html')
        res.write('<p>views: ' + sess.views + '</p>')
        res.write('<p>expires in: ' + (sess.cookie.expires / 1000) + 's</p>')
        res.end()
    } else {
        sess.views = 1
        res.end('welcome to the session demo. refresh!')
    }
})

/**
app.use(function(req, res, next) {
    if (Date.now() >= req.session.cookie.expires){
        req.session.destroy(function(err) {
            //do something here
        })
    }else {

    }

});
**/

// Router
require('./app/router')(app);

