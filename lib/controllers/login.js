'use strict';

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    multer = require('multer'),
    fs = require('fs'),
    AWS = require('aws-sdk'),
    User = require('../../models/user.js');

var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;

var bcrypt = require('bcrypt');
var upload = multer({
    dest: 'tmp/'
});

var s3 = new AWS.S3({
    accessKeyId: "AKIAJKN74ETDBZXD2XKA",
    secretAccessKey: "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"
});


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

router.get('/profile', function(req, res, next) {
    console.log('GET: User Profile Page');

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
                    });
                }
            }
        });
});


router.post('/profile', function(req, res, next){
    console.log('POST: Edit User Profile');

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
                    return res.redirect('/user/profile');
                }
            }
        });
});


router.post('/login', function(req, res) {
    console.log("POST: Login to system");
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
        return res.render('user.pug', {title:'logout first'});
    }else{
        // User.authenticate(email,password,function(req,res,err){
        //     return;
        // })
        User.findOne({ email: email})
            .exec(function (err, user) {
                if (err) {
                    console.log("database might disconnect");
                    return res.render("user", { title: err});
                    //return;
                    //return callback(err)
                } else if (!user) {
                    var error = new Error('User with email ' + email + ' is not found.');
                    //err.status = 401;
                    return res.render("user", { title: "user can't not found"});
                    //return;
                    //return callback(err);
                }
                if (!user.verifyPassword(user, password)){
                    //if (!bcrypt.compareSync(password, user.password)){
                    console.log("Invalid Password\n\n\n\n");
                    return res.render("user", { title: "password does not match"});
                    //return;
                    //return done(null, false);
                }else {
                    console.log("success login\n\n\n\n");
                    //req.session.cookie.expires = true;
                    //req.session.cookie.maxAge = 30000;
                    req.session.userId = user._id; //store user session ID
                    return res.render("profile", { title: "login success"});
                    //res.redirect("/user/profile");
                    //return;
                }
            });
        //console.log("end of task 1");  run first
    }
    //console.log("end of task 2"); run second  -> go to function call back

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
    console.log("GET: Logout");
    if (req.session) {
        // delete session object
        console.log("session is exist");
        req.session.destroy(function(err) {
            if(err) {
                console.log("error to destory session");
                return next(err);
            } else {
                console.log("clean session state");
                req.logout();
                return res.redirect('/');
            }
        });
        //console.log("end of task 1");  without return, this will run first
    }
    //console.log("end of task 2");  //this run second then goes to function call back "clean session state"

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
    console.log("POST: Reset password");
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
    console.log("POST: Send email");
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

// The regular expression for allowed file types, matches
// against either file type or file name:
//acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,

router.post('/files/upload', upload.single('file'), function(req, res){
    console.log("POST: Uploading file");
    var fileInfo = req.file;
    var txt = req.body.mytxt;
    console.log(txt);
    console.log(fileInfo);
    console.log(fileInfo.path);


    var mimeType = fileInfo.mimetype;
    var fileName = fileInfo.path +'.' + mimeType.substring(mimeType.indexOf("/") + 1);
    var awsName = fileName.substring(fileName.indexOf("/")+1);
    console.log(awsName);
    // this is mainly for user friendliness. this field can be freely tampered by attacker.

    if (!/^image\/(jpe?g|png|gif)$/i.test(fileInfo.mimetype)) {
        return res.status(403).send('expect image file').end();
    }

    var fileStream = fs.readFileSync(fileInfo.path);
    var options = {
        Bucket: 'noqubot',
        Key: awsName,
        Body: fileStream
    };

    //console.log("remove template file");
    //fs.closeSync(fileStream);  if open by file descriptor
    //fs.unlinkSync(filename); //does not return anything, might not be best solution
    //fs.removeFileSync("tmp/" + fileInfo.path); //// ideally use the async version

/**
    s3.upload(options, function(err){
        // Remove Template File
        fs.unlink(fileInfo.path, function (err) {
            if (err) {
                console.log(err);
            }
            console.log('File deleted!');
        });

        if (err){
            console.log(err);
            return res.status(500).end("Upload to s3 failed");
        }
        return res.status(200).end("File uploaded");
    });
**/

    fs.unlink(fileInfo.path, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('File deleted!');
    });
    return res.status(200).end("File uploaded");  //should be comment this out after
});

// should be post anyway
// Route for the download  just template that only download aa.jpg
router.get("/files/download/:name", function (req, res) {
    console.log("Get: Downloading file");
    var fileName = req.params.name;
    if (!fileName) {
        return res.status(400).end("missing file name");
    }
    var options = {
        Bucket: 'noqubot',
        Key: 'aa.jpg'
    };
    res.attachment(fileName);
    //s3.getObject(options).createReadStream().pipe(res);


    s3.getObject(options, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            return res.status(400).end("file is not exist");
        } else {
            console.log(data);           // successful response
            data.createReadStream().pipe(res);
            return;
        }
    });

});


// should be post anyway
router.get("/files/remove/:name", function(req, res){
    console.log("Get: Remove File");
    var fileName = req.params.name;
    if(!fileName){
        return res.status(400).end("missing file name");
    }

    var options = {
        Bucket: 'noqubot',
        Key: 'aa.jpg'
    };

    s3.deleteObject(options, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            return res.status(400).end("file is not exist");
        } else {
            console.log(data);           // successful response
            return res.end("successful delete");
        }
    });

});

module.exports = router;