'use strict';

var express = require('express'),
    router = express.Router(),
    User = require(__base + 'models/user.js');

router.post('/', function(req, res){
    console.log("POST: Create New User");
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;

    console.error("---------   Create User   ---------" );

    if (!email || !username || !password){
    //if (!username || !password){
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
                return res.status(500).send("Unable to Create User Table, either username, email are exist");
                //return res.status(500).send(err);
            }else{
                //res.status(200).send(user);
                console.log("successful create user\n");
                //req.session.cookie.expires = false;
                req.session.userId = user._id; //store user session ID
                return res.redirect('/');
            }
        });
    }
});

router.get('/', function (req, res) {
    console.log('Get: View Registration Page');
    res.format({
        html: function(){
            res.render('registration', {
                title: 'Registration'
            });
        }
    });
});

module.exports = router;