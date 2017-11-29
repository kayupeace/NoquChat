'use strict';
var express = require('express'),
    router = express.Router(),
    User = require(__base + 'models/user.js');

router.get('/', function(req, res) {
    console.log('GET: Login page');
    var myError = req.session.error;  //save error message in new variable
    delete req.session.error;  //remove passed with error message to login page

    res.render("login", {
        title: "noQu",
        error: myError   // print error message to login page
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
    //var username = req.body.username;
    var password = req.body.password;

    if (!email || !password){
        console.error("Error: Email, UserName, password are required");
        res.render("login.pug", {title: "Error: Email, UserName, password are required"});
        return;
        //return res.redirect('/');
    }

    if(!req.session){
        return res.render('login.pug', {title:'logout first'});
    }else{
        // User.authenticate(email,password,function(req,res,err){
        //     return;
        // })
        User.findOne({ email: email})
            .exec(function (err, user) {
                if (err) {
                    console.log("database might disconnect");
                    return res.render("login", { title: err});
                    //return;
                    //return callback(err)
                } else if (!user) {
                    var error = new Error('User with email ' + email + ' is not found.');
                    //err.status = 401;
                    return res.render("login", { title: "user can't not found"});
                    //return;
                    //return callback(err);
                }
                if (!user.verifyPassword(user, password)){
                    //if (!bcrypt.compareSync(password, user.password)){
                    console.log("Invalid Password\n\n\n\n");
                    return res.render("login", { title: "password does not match"});
                    //return;
                    //return done(null, false);
                }else {
                    console.log("success login\n\n\n\n");
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
        //console.log("end of task 1");  run first
    }
    //console.log("end of task 2"); run second  -> go to function call back

    //res.render('user.jade', {title:'login'});
});

module.exports = router;