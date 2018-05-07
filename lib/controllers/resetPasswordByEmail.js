'use strict';

var express = require('express'),
    router = express.Router();
const uuidv4 = require('uuid/v4');
const User = require(__base + 'models/user.js');
const ResetPasswordToken = require(__base + 'lib/services/accountPassword/resetPasswordToken.js');
const AccountPassword = require(__base + 'lib/services/accountPassword/resetPassword.js');
const EmailServer = require(__base + 'lib/services/mail/mailService.js');

let async = require("async");

router.route('/')
    .get(function (req, res) {
        let errorMessage = req.session.resetPasswordError;
        delete req.session.resetPasswordError;

        res.format({
            html: function(){
                res.render('resetPassword', {
                    error: errorMessage
                });
            }
        });
    })

    .post(function (req, res){
        req.sanitize('email').escape();
        req.sanitize('email').trim();
        const email = req.body.email;

        req.checkBody('email', "Enter a valid email address").isEmail();
        let errors = req.validationErrors();
        if(errors){
            req.session.resetPasswordError = errors[0].msg;
        }else {
            async.waterfall([
                    function findUserByEmail(callback) {
                    User.findOne({ email: email})
                        .exec(function(err, user){
                            if(err){
                                callback(err);
                            }else if(!user){
                                let errorInfo = "User Not Exist";
                                let customerError = new Error(errorInfo);
                                callback(customerError);
                            }else {
                                callback(null, user);
                            }
                        });
                    },
                    function findToken(user,callback) {
                        ResetPasswordToken.getTokenByUserId(user._id, function(err, token){
                            if(err){
                                callback(err);
                            }else{
                                callback(null, user, token);
                            }
                        });
                    },
                    function newToken(user, token, callback){
                        if(!token){
                            const my_uuid = uuidv4();
                            ResetPasswordToken.newToken(user, my_uuid,function(err, token){
                                if(err){
                                    return callback(err);
                                }else{
                                    return callback(null, token);
                                }
                            });
                        }else{
                            ResetPasswordToken.editTokenConfirm(user,function (err, token) {
                                if(err){
                                    return callback(err);
                                }else{
                                    return callback(null, token);
                                }
                            })
                        }
                    }
                ],
                function (err, token) {
                    if(err){
                        req.session.resetPasswordError = err.message;
                        res.redirect("/service/resetpassword");
                    }else{
                        // send email
                        let email = token.owner.email;
                        let token_url = token.token;
                        let username = token.owner.username;
                        console.log(token);
                        console.log(email);
                        console.log(token_url);

                         EmailServer.sendResetPassword(email, email, username,token_url, function(err){
                            if(err){
                                req.session.resetPasswordError = err.message;
                                res.redirect("/service/resetpassword");
                            }else{
                                res.redirect("/service/resetpassword");
                            }
                         });
                         
                    }
                }
            );
        }
    });

router.route('/receivePasswordToken/:token_id')
    .get(
        function(req, res, next){
            let token_id = req.params.token_id;
            ResetPasswordToken.getTokenByTokenId(token_id, function(err, token){
                if(err || !token){
                    res.render('error-pages/404', { url: req.url });
                }else if(token.done){
                    res.render('error-pages/404', { url: "token is being used" });
                }else{
                    res.render('service/confirmResetPassword', { token_id: token.token});
                }
            });
        }
    )
    .post(
        function(req,res,next){
            let token_id = req.params.token_id;
            req.sanitize('password').escape();
            req.sanitize('password').trim();
            let newPassword = req.body.password;

            async.waterfall(
                [
                    function findToken(callback) {
                        ResetPasswordToken.getTokenByTokenId(token_id, function(err, token) {
                            if (err || !token) {
                                let err = new Error('Token Does not exist');
                                return callback(err);
                            }else if(token.done){
                                let err = new Error('This Verification link being used');
                                return callback(err);
                            }
                            else {
                                return callback(null, token);
                            }
                        })
                    },
                    function ResetPassword(token,callback) {
                        let user_id = token.owner;
                        AccountPassword.resetPasswordByUserId(user_id, newPassword, function (err,user) {
                            if (err){
                                return callback(err);
                            }else {
                                return callback(null, user, token);
                            }
                        });

                    }
                ],
                function RestPassword(err, user, token) {
                    if(err){
                        // unexpected error
                        res.render('error-pages/404', { url: req.url });
                    }else{
                        token.done = 1;
                        token.save(function(err){
                            if(err){
                                req.session.error = "Unexpected system error";
                                res.redirect("/login");
                            }else{
                                req.session.error = "You have being reset your password";
                                res.redirect("/login");
                            }
                        })
                    }
                }
            );

        }
    );

module.exports = router;
