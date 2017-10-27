'use strict';

var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var User = require(__base + 'models/user.js');
var async = require("async");
var editProfile = require(__base + 'lib/services/userProfile.js');

var AccountPassword = require(__base + 'lib/services/AccountPassword.js');
var awsUploadImage = require(__base + 'lib/services/imageAwsS3.js');

const uuidv4 = require('uuid/v4');


var upload = multer({
    dest: 'tmp/'
});

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

// also required for email validation to change email address
router.post('/profile', function(req, res, next){
    console.log('POST: Edit User Profile');

    //var email = req.body.email;
    let username = req.body.username;
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


function errorPage(req, res, err, next) {
    if(err) {
        console.log(err);
        res.render("user.pug", {title: err});
    }else {
        res.render("user.pug", { title: "user can't not found"});
    }
}


// # Logout
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
    }
});

// Edit User Profile
router.post('/editProfile', upload.single('file'), function(req, res){

    let DOB = new Date(req.body.dateOfBirth);
    let gender = req.body.gender;
    let patron_id = req.session.id;

    console.log(DOB + "   " + gender);


    console.log("POST: Uploading file");
    let fileInfo = req.file;
    let txt = req.body.mytxt;
    console.log(fileInfo);

    const my_uuid = uuidv4();
    console.log(my_uuid);

    async.waterfall(
        [
            function uploadProfileImage(next) {
                let fileName = null;
                if(fileInfo) {
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
                            return next(err);
                        }else {
                            let mimeType = fileInfo.mimetype;
                            fileName = dataFile.fileName +'.'+ mimeType.substring(mimeType.indexOf("/") + 1);
                            return next(null,fileName);
                        }
                    });
                }else {
                    return next(null, fileName);
                }
            },
            function getUserInfo(fileName,callback) {
                var data ={
                    DOB: DOB,
                    gender: gender,
                    imageURL: null,
                    user_id: req.session.id
                };
                if (fileName !== null) {
                    data.imageURL = fileName;
                    //let err = new Error('You are required to login');
                    //err.status = 400;
                    //return callback(err);   // error, naviage to error page.
                }
                return callback(null, data);
            }
        ],
        function editUserProfile(err, data) {
            if(err){
                return next(err);
            }
            editProfile.updateProfile(data,function(err){
                if(err){
                    return res.status(500).end("Fail to update profile, plz contact site administration");
                }else {
                    return res.redirect('profile');
                }
            });
        }
    );

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
    console.log("POST: Reset password");
    let password = req.body.password;

    if (isEmptyOrSpaces(password)){
        console.error("Error: password can only be string or number");
        return res.render('profile', {
            title: 'Error: password can only be string or number',
            userName: 'Your password setting is not correct',
            email: 'Your password setting is not correct'
        });
    }

    console.log("---------   Try To Reset Password   ---------" );

    AccountPassword.resetPasswordByUserId(req.session.userId, password, function (err) {
        if (err){
            // ERROR PAGE
            console.log(err.message);
            return next('error');
        }else {
            return res.redirect('profile');
        }
    });

});


// need re-factory all function below
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
    let fileName = req.params.name;
    if(!fileName){
        return res.status(400).end("missing file name");
    }

    awsUploadImage.deleteFromS3(fileName, function(err, data){
        if(err){ //file if not exist in S3 WILL NOT RETURN ERROR!!
            console.log(err, err.stack); // an error occurred
            return res.status(400).end("file is not exist");
        }else {
            console.log(data);
            return res.end("successful delete");
        }
    });
});

module.exports = router;