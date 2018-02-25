'use strict';

const express = require('express'),
    router = express.Router(),
    localToken = require(__base + 'lib/services/auth/token.js'),
    authUser = require(__base + 'lib/services/auth/user.js');

router.post('/', function(req, res){
    if(!req.session){
        req.sessions.error = "You already login";
        return redirect("/login");
    }else{
        authUser.createUser(req, function(error, user){
            if(error){
                return res.redirect('/registration');
            }else if(!user){
                req.session.error = "Can not create User, if error still occur, contact web adminstration";
                return res.redirect('/registration');
            }else{

                localToken.encodeToken(user,function (err, token) {
                    if(err){
                        req.session.error = "Unexpected error at registration(Registration)";
                        return res.redirect("/registration");
                    }else{
                        req.session.access_token = token;
                        return res.redirect('/user/profile');
                    }
                });

            }
        });
    }
});

router.get('/', function (req, res) {
    let myError = req.session.error;
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