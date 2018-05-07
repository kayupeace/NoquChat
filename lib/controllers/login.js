'use strict';
const express = require('express'),
    router = express.Router(),
    localToken = require(__base + 'lib/services/auth/token.js'),
    authUser = require(__base + 'lib/services/auth/user.js');

router.get('/', function(req, res) {
    console.log('GET: Login page');
    let myError = req.session.error;  //save error message in new variable
    delete req.session.error;  //remove passed with error message to login page
    return res.render("login", {
        error: myError   // print error message to login page
    });
});

router.post('/', function(req, res) {
    if(!req.session){
        req.session.error = "You already login";
        return redirect("/login");
        //return res.render('login.pug', {title:'logout first'});
    }else{
        authUser.getUser(req, function(error, user){
           if(error){
               return res.redirect('/login');
           }else if(!user){
               req.session.error = "Can not find User";
               return res.redirect('/login');
           }else{
               localToken.encodeToken(user,function (err, token) {
                   if(err){
                       req.session.error = "Unexpected error at login, verification fault";
                       return res.redirect("/login");
                   }else{
                       req.session.access_token = token;
                       return res.redirect('/user/profile');
                   }
               });
           }
        });
    }
});

module.exports = router;