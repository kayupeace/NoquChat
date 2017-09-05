'use strict';

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    User = require('../models/user.js');

var bcrypt = require('bcrypt');

/**
 * // Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
 router.use(bodyParser.urlencoded({ extended: true }));
 router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}));
 **/


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


router.post('/profile', requiresLogin, function(req, res, next){
    console.log('Post: Edit User Profile');

    //var email = req.body.email;
    var username = req.body.username;
    //var password = req.body.password;

    if (!username){
        console.error("Error: UserName is required");
        return res.redirect('/');
    }

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
                    console.log("update now");
                    User.findOneAndUpdate(
                        {_id:user._id},
                        {$set: {
                            username: username
                        }},function (err) {
                            if (err) {
                                throw err;
                            } else {
                                console.log("Updated");
                            }
                        }
                    );
                    res.redirect('/user/profile');
                    return;
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
                    res.redirect("/user/profile");
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

function isEmptyOrSpaces(str){
    var format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

    return str === null || str.match(/^ *$/) !== null || format.test(str) === true;
}

function isStringOrNumber(str){
    return str === null || str.match(/^[0-9]+$/) !== null;
}

// Reset Password for user account
router.post('/resetPassword', function(req, res, next){
    var password = req.body.password;

    console.error("---------   Create User   ---------" );

    if (isEmptyOrSpaces(password)){
        console.error("Error: password can only be string or number");
        //return res.redirect('/user/profile');
        return res.render('profile', {
            title: 'Error: password can only be string or number',
            userName: 'Your password setting is not correct',
            email: 'Your password setting is not correct'
        });
    } else {
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
                        console.log("reset now");
                        user.resetPassword(user, password);
                        return res.render('profile', {
                            title: 'we reset your password',
                            userName: 'Your password setting is changed',
                            email: 'Your password setting is changed'
                        });
                    }
                }
            });
    }
});


router.post('/sendEmail', function(req, res, next){
    /*
    var mailMessager = req.body.mailMessager;
    var mailSubject = "My Email Title";
    if(!mailMessager){
        mailMessager = "Default content";
    }

    var api_key = 'key-6c67b8f43774604b1bfd646d113b8d04';
    var domain = 'sandbox3b285d7e9944419a8d4a2db96cf51e48.mailgun.org';
    var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

    var data = {
        from: 'kayu6150@uni.sydney.edu.au',
        to: 'kayupeace@gmail.com',
        subject: mailSubject,
        text: mailMessager
    };

    mailgun.messages().send(data, function (error, body) {
        console.log(body);
    });
    */
});

module.exports = router;