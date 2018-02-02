var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var path = require('path');
var session = require('express-session');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var cookieParser = require('cookie-parser');
var config = require('./lib/config/config.js').get(process.env.NODE_ENV);
var expressValidator = require('express-validator');
var engines = require('consolidate');
var ejs_local = require('ejs-locals');

//var databaseEnvironment = process.env.MONGODB_URI;
//var db = mongoose.connect(process.env.MONGODB_URI);
// below is the database connection for local environment, plz keep this

// For Promise:
// https://stackoverflow.com/questions/38138445/node3341-deprecationwarning-mongoose-mpromise
// http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;

var db = mongoose.connect(config.database, {
    useMongoClient: true,
    /* other options */
});


console.log("Current Environment is : " + process.env.NODE_ENV);

// view engine setup
app.set('views', path.join(__dirname, 'public/views'));
app.set('controllers', path.join(__dirname, 'lib/controllers'));
app.engine('html', ejs_local);
app.set('view engine', 'pug');

// serve static file   eg: /assets/css/example
app.use(express.static(path.join(__dirname, '/public')));
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
var server = app.listen((process.env.PORT || 5000));
app.use(expressValidator()); // Add this after the bodyParser middlewares! for validation

app.use(cookieParser());
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


// to avoid relative paths in calls
global.__base = __dirname + '/';
// var Article = require(__base + 'app/models/article');
/**
 *
 *
 *
   global.rootRequire = function(name) {
    return require(__dirname + '/' + name);
   }
   var Article = rootRequire('app/models/article');
   var Article = require.main.require('app/models/article');
 *
 *
 *
 */

// access control
var accessContro = require('./lib/config/AccessControl');
app.use(function(req, res, next){
    accessContro.setHeader(process.env.NODE_ENV,req,res,next);
});

// Serve static files on /public
app.use('/assets', express.static('./public/assets'));

var chatServer = require('./lib/services/chat.js');
chatServer.chatServer(server);

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
var router = require('./lib/router');
router(app);

require('./app/router')(app);


/** 404 **/
app.use(function(req, res, next){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('error-pages/404', { url: req.url });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});


/***  for mocha to stop server running  ***/
function stop() {
    server.close();
}
module.exports = server;
module.exports.stop = stop;
