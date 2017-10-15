'use strict';

var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var AWS = require('aws-sdk');
var User = require(__base + 'models/user.js');

var asyncf = require('asyncawait/async');

var editProfile = require(__base + 'lib/services/userProfile.js');

var upload = multer({
    dest: 'tmp/'
});
var s3 = new AWS.S3({
    accessKeyId: "AKIAJKN74ETDBZXD2XKA",
    secretAccessKey: "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"
});

var UserServices = require(__base + 'lib/services/UserServices.js');


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

// should be change to chang user email instead !!! with user email validation
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

// Edit User Profile
router.post('/editProfile', function(req, res){
    var DOB = new Date(req.body.dateOfBirth);
    var gender = req.body.gender;
    var patron_id = req.session.id;

    console.log(DOB + "   " + gender);

   editProfile.updateProfile(req,res,function(err){
       if(err){
           console.log("lllERROR!!! to update user profile");
           return res.status(500).end("Fail to update profile, plz contact site administration");
       }else {
           console.log("asdasdasdasd\n");
           return res.redirect('profile');
           /**
           return res.render('profile', {
               title: 'profile information updated',
               userName: 'we updated your profile information',
               email: 'blablablabla'
           },function(err, html){
               res.send(html);
           });
            **/
       }
   });
});

function isEmptyOrSpaces(str){
    var format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (str === null || str.match(/^ *$/) !== null || format.test(str) === true){
        return true;
    }else {
        return false;
    }
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
                    }else {
                        UserServices.resetPassword(user,password, function(err){
                            if (err){
                                return err;
                            }else {
                                return res.redirect('profile');
                            }
                        });
                    }
                }
            });
    }
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
    console.log(fileInfo.path);


    let mimeType = fileInfo.mimetype;
    let fileName = fileInfo.path + '.' + mimeType.substring(mimeType.indexOf("/") + 1);
    let awsName = fileName.substring(fileName.indexOf("/") + 1);
    console.log(awsName);
    // this is mainly for user friendliness. this field can be freely tampered by attacker.

    if (!/^image\/(jpe?g|png|gif)$/i.test(fileInfo.mimetype)) {
        return res.status(403).send('expect image file').end();
    }

    let fileStream = fs.readFileSync(fileInfo.path);
    let options;
    options = {
        Bucket: 'noqubot',
        Key: awsName,
        Body: fileStream,
        ACL: 'public-read',
        ContentType: mimeType
    };

    //console.log("remove template file");
    //fs.closeSync(fileStream);  if open by file descriptor
    //fs.unlinkSync(filename); //does not return anything, might not be best solution
    //fs.removeFileSync("tmp/" + fileInfo.path); //// ideally use the async version

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

/**
    fs.unlink(fileInfo.path, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('File deleted!');
    });
 **/
   // return res.status(200).end("File uploaded");  //should be comment this out after
});

// should be post anyway
// Route for the download  just template that only download aa.jpg
router.get("/files/download/:name", function (req, res) {
    console.log("Get: Downloading file");
    var fileName = req.params.name;
    if (!fileName) {
        return res.status(400).end("missing file name");
    }
    let options = {
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
    let fileName = req.params.name;
    if(!fileName){
        return res.status(400).end("missing file name");
    }

    let options = {
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