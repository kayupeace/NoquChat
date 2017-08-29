'use strict';

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    User = require('../models/user.js');

var bcrypt = require('bcrypt');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}));


router.post('/', function(req, res){
    console.log("POST: create new user");
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;

    console.error("---------   Create User   ---------" );

    if (!email || !username || !password){
        console.error("Error: Email, UserName, password are required");
        return res.redirect('/');
    } else {
        console.log( "   email: " + email + "\n" + "   username: " + username + "\n   password: "+password);
        var userData = {
            email: email,
            username: username,
            password: password
        };

        User.create(userData, function(err, user){
            if (err){
                //return next(err)
                return res.status(500).send("Unable to Create User Table");
            }else{
                //res.status(200).send(user);
                console.log("successful create user\n");
                //req.session.cookie.expires = false;
                req.session.userId = user._id; //store user session ID
                return res.redirect('/');
            }
        })

    }
});

// GET /Login
function requiresLogin(req, res, next) {
    console.log("check login state");
    if (req.session && req.session.userId) {
        return next();
    } else {
        var err = new Error('You must be logged in to view this page.');
        err.status = 401;
        res.format({
            html: function(){
                res.render('user', {
                    title: 'U need login'
                });
            }
        })
        //return next(err);
    }
}

router.get('/profile', requiresLogin ,function(req, res, next) {
    console.log('Get: get User Profile');

    User.findById(req.session.userId)   //check existing login user
        .exec(function (error, user) {
            if (error) {
                return next(error);   // error, navigate to error page.
            } else {
                if (user === null) {
                    var err = new Error('You are required to login');
                    err.status = 400;
                    return next(err);   // error, naviage to error page.
                } else {
                    res.format({
                        html: function(){
                            res.render('profile', {
                                title: 'User Profile',
                                userName: user.username,
                                email: user.email
                            });
                        }
                    })
                }
            }
        });
});

router.post('/login', function(req, res) {
    var email = req.body.email;
    //var username = req.body.username;
    var password = req.body.password;

    if (!email || !password){
        console.error("Error: Email, UserName, password are required");
        res.render("user.pug", {title: "Error: Email, UserName, password are required"});
        return;
        //return res.redirect('/');
    }

    if(!req.session){
       res.render('user.pug', {title:'logout first'});
       return;
   }else{
       // User.authenticate(email,password,function(req,res,err){
       //     return;
       // })
       User.findOne({ email: email})
           .exec(function (err, user) {
               if (err) {
                   console.log("database might disconnect")
                   res.render("user", { title: err});
                   return;
                   //return callback(err)
               } else if (!user) {
                   var err = new Error('User with email ' + email + ' is not found.');
                   //err.status = 401;
                   res.render("user", { title: "user can't not found"});
                   return;
                   //return callback(err);
               }
               if (!user.verifyPassword(user, password)){
               //if (!bcrypt.compareSync(password, user.password)){
                   console.log("Invalid Password\n\n\n\n");
                   res.render("user", { title: "password does not match"});
                    return;
                   //return done(null, false);
               }else {
                   console.log("success login\n\n\n\n");
                   //req.session.cookie.expires = true;
                   //req.session.cookie.maxAge = 30000;
                   req.session.userId = user._id; //store user session ID
                   //res.render("profile", { title: "login success"});
                   res.redirect("/registration/profile");
                   return;
               }
           });
   }
    //res.render('user.jade', {title:'login'});
});

function errorPage(req, res, err, next) {
    if(err) {
        console.log(err);
        res.render("user.pug", {title: err});
    }else {
        res.render("user.pug", { title: "user can't not found"});
    }
}

// GET /logout
router.get('/logout', function(req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function(err) {
            if(err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

router.get('/login', function(req, res, next) {
    console.log('Get: get login page');
    res.format({
        html: function () {
            res.render('user', {
                title: 'login'
            });
        }
    })
});

router.get('/', function (req, res) {
    console.log('Get: get registration page');
    res.format({
        html: function(){
            res.render('registration', {
                title: 'Create User Page'
            });
        }
    })
});

module.exports = router;