'use strict';
var express = require('express'),
    router = express.Router(),
    authUser = require(__base + 'lib/services/auth/user.js');


router.get('/', function(req, res) {
    console.log('GET: Login page');
    var myError = req.session.error;  //save error message in new variable
    delete req.session.error;  //remove passed with error message to login page

    res.render("login", {
        error: " "   // print error message to login page
    });
    return;
    /**
    return res.format({
        html: function () {
            res.render('login', {
                title: 'Login'
            });
        }
    });
     **/
});

router.post('/', function(req, res) {
    if(!req.session){
        req.sessions.error = "You already login";
        return redirect("/login");
        //return res.render('login.pug', {title:'logout first'});
    }else{
        authUser.getUser(req, function(error, user){
           if(error){
               let errorInfo = req.session.error;
               delete req.session.error;
               return res.render("login", { error: errorInfo});
           }else if(!user){
               return res.render("login", {error: "User Can Not Found"});
           }else{
               return res.redirect('/user/profile');
           }
        });
    }
});

module.exports = router;