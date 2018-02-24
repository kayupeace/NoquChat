'use strict';

var express = require('express'),
    router = express.Router(),
    User = require(__base + 'models/user.js');

router.post('/', function(req, res){
    console.log("POST: Create New User");
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;

    var checkEmail = isvalidEmail(email);
    var checkusername = isvalidString(username);
    var checkpassword = isvalidString(password);

    console.error("---------   Create User   ---------" );

    if (!checkEmail || !checkusername || !checkpassword){  //if one of them are not valid which return true
        var errorMessage = "";
        if(!checkEmail){
            errorMessage += "Email ,";
        }
        if(!checkusername){
            errorMessage += "user name ,";
        }
        if(!checkpassword){
            errorMessage += 'password ,';
        }
        console.error("Error: " + errorMessage + " are not in correct format");
        req.session.error = ("Error: " + errorMessage + " are not in correct format");
        return res.redirect('registration');
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
                req.session.error= ("Error: Unable to Create Account, either username or email or both are exist");
                return res.redirect('registration');
                //return res.status(500).send("Unable to Create User Table, either username, email are exist");

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
    var myError = req.session.error;
    delete req.session.error;
    res.format({
        html: function(){
            res.render('registration', {
                error: myError
            });
        }
    });
});

module.exports = router;