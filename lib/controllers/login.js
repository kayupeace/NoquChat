'use strict';
var express = require('express'),
    router = express.Router(),
    User = require(__base + 'models/user.js');

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
    console.log("POST: Login to system");
    var email = req.body.email;
    var password = req.body.password;

    if (!email || !password){
        console.error("Error: Email, UserName, password are required");
        res.render("login.pug", {error: "Error: Email, password are required"});
        return;
    }

    if(!req.session){
        return res.render('login.pug', {title:'logout first'});
    }else{
        User.findOne({ email: email})
            .exec(function (err, user) {
                if (err) {
                    console.log("System Error: Error at { login.js } file");
                    return res.render("login", { error: "System Error, Contact System Administration"});
                } else if (!user) {
                    return res.render("login", { error: "Email Error"});
                }
                if (!user.verifyPassword(user, password)){
                    return res.render("login", { error: "Password error"});
                }else {
                    //req.session.cookie.expires = true;
                    //req.session.cookie.maxAge = 30000;
                    req.session.userId = user._id; //store user session ID
                    res.locals.session = true;
                    return res.redirect('/user/profile');
                    //return res.render("profile", { title: "login success"});
                    //res.redirect("/user/profile");
                    //return;
                }
            });
    }
});

module.exports = router;