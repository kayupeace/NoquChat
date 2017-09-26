'use strict';

var express = require('express'),
    router = express.Router();

var Facebook_account = require(__base + 'models/facebook.js');
var User = require(__base+ 'models/user.js');

var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;
var config = require('../config/config.js').get(process.env.NODE_ENV);


var facebook_data = config.facebook;
passport.use(new FacebookStrategy({
        clientID: facebook_data.clientID,
        clientSecret: facebook_data.clientSecret,
        callbackURL: facebook_data.callbackURL,
        profileFields: ['id', 'emails', 'photos','displayName']
    },
    function(accessToken, refreshToken, profile, done) {
        console.log("\n\n" + profile.id);
        console.log(profile.displayName);
        console.log(profile.emails);
        var name = profile.displayName;
        var emails = profile.emails[0].value;
        if(!name){
            name = 'Anonymous';
        }
        if(!emails){
            emails = 'Anonymous@email.com';
        }

        var userData = {
            email: emails,
            username: name,
            password: ' '
        };

        Facebook_account.findOne({
            facebook_id: profile.id
        },function(err, facebook_account){
            //console.log("1");
            if(err){ return done(err); }
            if (!facebook_account){
                //console.log("2");
                User.create(userData, function(err, user){
                    if(err){
                        //console.log("3");
                        return done(err, user);
                    }else {
                        //console.log("4");
                        var facebook_data = {
                            patron_id: user._id,
                            facebook_id: profile.id
                        };
                        Facebook_account.create(facebook_data,function(err){
                            if(err){return done(err);}
                            return done(null, user);
                        });
                    }
                });
            }else{
                //console.log("5");
                User.findOne({ _id : facebook_account.patron_id},
                    function(err, findmyUser){
                        if(err){ return done(err); }
                        return done(null, findmyUser);
                    });
            }
        });
        //return(done, profile);
    }
));


router.get('', passport.authenticate('facebook', {
    scope: ['email','user_friends']}));
router.get('/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    function(req, res) {
        // Successful authentication, redirect home.
        req.session.userId = req.user._id;
        console.log("success with facebook login");
        res.redirect('/user/profile');
    });

module.exports = router;