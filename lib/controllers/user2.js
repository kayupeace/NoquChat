'use strict';

var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var User = require(__base + 'models/user.js');
var UserProfile = require(__base + 'models/userProfile.js');
var async = require("async");
var editProfile = require(__base + 'lib/services/userProfile2.js');

var AccountPassword = require(__base + 'lib/services/AccountPassword.js');
var awsUploadImage = require(__base + 'lib/services/imageAwsS3.js');
var config = require('../config/config.js').get(process.env.NODE_ENV);

const uuidv4 = require('uuid/v4');


var upload = multer({
    dest: 'tmp/'
});

router.get('/profile', function(req, res) {
    var userId = req.session.userId;
    async.parallel([
            function findUserAccount (callback) {
                User.findById(userId)   //check existing login user
                    .exec(function (error, user) {
                        if (error) {
                            return callback(error);   // error, navigate to error page.
                        } else {
                            if (user === null) {
                                var err = new Error('You are required to login');
                                err.status = 400;
                                return callback(err);   // error, naviage to error page.
                            }else {
                                var userAccount = {
                                    userName : user.username,
                                    email : user.email
                                };
                                return callback(null, userAccount);
                            }
                        }
                    });
            },
            function findUserProfile(callback) {
                UserProfile.findOne({ patron_id: userId })
                    .exec(function (err, profile) {
                        if (err) {
                            return callback(err);   // error, navigate to error page.
                        } else {
                            if(profile) {
                                var userProfile = {
                                    gender: profile.gender,
                                    DOB: profile.DOB,
                                    imagePath: profile.imagePath
                                };
                            }else {
                                var userProfile = {
                                    gender : "Please Update Your Gender",
                                    DOB : new Date(Date.now()),
                                    imagePath : "Please Update Your Profile Image"
                                };
                            }
                            return callback(null, userProfile);

                        }
                    });
            }
        ],
        function (err, result) {
            //var data = JSON.stringify(result);
            if(err){
                //return next(err);
                res.format({
                    html: function(){
                        res.render('html/profile.html', {
                            title: 'Error',
                        });
                    }
                });
            }else {
                let date_stirng = result[1].DOB.toISOString().split('T')[0]
                let data = {
                    userName: result[0].userName,
                    email: result[0].email,
                    gender: result[1].gender,
                    DOB: date_stirng,
                    imagePath: result[1].imagePath
                };

                res.format({
                    html: function(){
                        res.render('html/profile.html', {
                            title: 'Success',
                            UserData:data
                        });
                        //res.render('html/profile.html', {
                        //    title: 'Success',
                        //    UserData:data
                        //});
                    }
                });
            }

        });

});

/**
    res.format({
        html: function(){
            res.render('profile', {
                title: 'User Profile',
                userName: user.username,
                email: user.email,
            });
        }
    });
 */


// also required for email validation to change email address
router.post('/profile', function(req, res, next){
    //var email = req.body.email;
    let username = req.body.username;
    //var password = req.body.password;

    if (!username){
        return res.redirect('/user/profile');
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


function errorPage(req, res, err, next) {
    if(err) {
        res.render("user.pug", {title: err});
    }else {
        res.render("user.pug", { title: "user can't not found"});
    }
}


// # Logout
router.get('/logout', function(req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function(err) {
            if(err) {
                return next(err);
            } else {
                req.logout();
                return res.redirect('/');
            }
        });
    }
});

// Edit User Profile
router.post('/editProfile', upload.single('file'), function(req, res){

    let DOB = new Date(req.body.dateOfBirth);
    let gender = req.body.gender;
    let patron_id = req.session.userId;

    var userData = {
        DOB: DOB,
        gender: gender,
        patron_id: patron_id
    };
    let fileInfo = req.file;

    //const my_uuid = uuidv4();
    //console.log(my_uuid);

    editProfile.editUserProfile(fileInfo, userData, function (err) {
        if(err){
            return res.status(500).end("Fail to update profile at userProfile2, plz contact site administration");
        }else {
            return res.redirect('profile');
        }
    });
});


function isEmptyOrSpaces(str){
    const format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (str === null || str.match(/^ *$/) !== null || format.test(str) === true){
        return true;
    }else {
        return false;
    }
}

function isStringOrNumber(str){
    return str === null || str.match(/^[0-9]+$/) !== null;
}

/* Reset Password for user account */
router.post('/resetPassword', function(req, res, next){
    let password = req.body.password;

    if (isEmptyOrSpaces(password)){
        return res.redirect('profile');
    }

    AccountPassword.resetPasswordByUserId(req.session.userId, password, function (err) {
        if (err){
            // ERROR PAGE
            return next('error');
        }else {
            return res.redirect('profile');
        }
    });

});


// need re-factory all function below
router.post('/sendEmail', function(req, res, next){
    console.log("POST: Send email");
    /**
    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'kaibin.kyu@gmail.com',
            pass: 'bujslvcdwkqthryu'
        }
    });

    var mailOptions = {
        from: 'kaibin.kyu@gmail.com',
        to: '1261726417@qq.com',
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
     **/

});

// The regular expression for allowed file types, matches
// against either file type or file name:
//acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i

router.post('/files/upload', upload.single('file'), function(req, res){
    console.log("POST: Uploading file");
    let fileInfo = req.file;
    let txt = req.body.mytxt;
    console.log(txt);
    console.log(fileInfo);
    //console.log(fileInfo.path);

    if (!/^image\/(jpe?g|png|gif)$/i.test(fileInfo.mimetype)) {
        return res.status(403).send('expect image file').end();
    }

    var dataFile = {
        fileName: fileInfo.filename,
        dataPath: "profile/"
    };

    awsUploadImage.uploadToS3(fileInfo, dataFile, function(err){
        // Remove Template File even if error occur during aws upload
        fs.unlink(fileInfo.path, function (err) {
            if (err) {
                console.log(err);
            }
            console.log('File deleted!');
        });

        if(err){
           return res.status(500).end("Upload to s3 failed");
        }else {
           return res.status(200).end("File uploaded");
        }
    });

});

// should be post anyway
// Route for the download  just template that only download aa.jpg
router.get("/files/download/:name", function (req, res) {
    console.log("Get: Downloading file");
    var fileName = req.params.name;
    if (!fileName) {
        return res.status(400).end("missing file name");
    }
    res.attachment(fileName);

    awsUploadImage.downloadFromS3(fileName, function (err, data) {
        if (err) {
            //console.log(err, err.stack); // an error occurred
            console.log(err.message);
            return res.status(400).end("file is not exist");
        } else {
            data.pipe(res);
            return;
        }
    });

});

// should be post anyway
router.get("/files/remove/:name", function(req, res){
    console.log("Get: Remove File");
    let fileFullName = req.params.name;
    editProfile.removeProfileImage(fileFullName, function (err) {
        if(err){ //file if not exist in S3 WILL NOT RETURN ERROR!!
            console.log(err, err.stack); // an error occurred
            return res.status(400).end("file is not exist");
        }else {
            return res.end("successful delete");
        }
    });
});

module.exports = router;