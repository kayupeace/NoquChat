'use strict';

var express = require('express'),
    router = express.Router(),
    User = require(__base + 'models/user.js');

var RoomTable = require(__base + 'models/room.js');
var RoomConfigRuleTable = require(__base + 'models/roomConfigRule.js');
var roomService = require(__base + 'lib/services/room');
var RoomConfigRuleService = require(__base + 'lib/services/roomConfigRule');
var async = require("async");

/**
 router.get('/test', function (req, res) {
    setTimeout(function(){
        console.log("cookie is 2 " + req.cookies.name);
    }, 250);

    RoomConfigRuleTable.find({owner: req.session.userId}, '_id title')
        .exec(function (err, configs) {
            return res.send(configs);
        });
});
 **/


router.route('/')
    .get(function (req, res) {

        let errorMessage = req.cookies.resetPasswordError;
        res.clearCookie('resetPasswordError');

        res.format({
            html: function(){
                res.render('ChatRoom/RoomAndConfigList', {
                    error: errorMessage,
                });
            }
        });

    })
    .post(function (req, res){
        // check if token exist already
        // if token not expired, increate number of confirm and refresh token
        // if reach max number of confirm, do not send and fresh token again

        // create resetPassword token if email is exist
        // push notification to user email

        /**
        req.sanitize('title').escape();
        req.sanitize('title').trim();
        req.sanitize('description').escape();
        req.sanitize('room_type').escape();
        req.sanitize('room_type').trim();

        let newRoom = RoomTable({
            room_uuid: ShortId.generate(),
            title: req.body.title,
            description: req.body.description,
            room_type: req.body.room_type,
            room_owner: req.session.userId
        });
        let errors = req.validationErrors();
        if(errors){
            console.log(errors);
            // re render all above data and ask user to correct incorrect filed
        }else {
            console.log(newRoom);
            RoomTable.create(newRoom, function(err, user){
                if (err || user == null){
                    //return next(err)
                    return res.status(500).send("Unable to Create User Table, either username, email are exist");
                    //return res.status(500).send(err);
                }else{
                    //res.status(200).send(user);
                    console.log("successful create room\n");
                    return res.redirect('/user/room');
                }
            });
        }
         **/

    });

// need re-factory all function below
router.post('/sendEmail', function(req, res, next){
    let EmailServer = require(__base + 'lib/services/mail/mailService.js');
    EmailServer.sendResetPassword('kayupeace@gmail.com','username','kai','token', function(err){
        if(err){
            console.log("Fail to send email");
        }else{
            console.log("Success to send email");
        }
    });
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

module.exports = router;
