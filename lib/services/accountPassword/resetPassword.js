'use strict';

/*
    Rest password for user table
 */

var bcrypt = require('bcrypt');
var async = require("async");
var User = require(__base + 'models/user.js');


var checkPassword = function(password1, password2, next){
    console.log("Check Password if it's same");
    bcrypt.compareSync(password1, password2, function (result, error) {
        return error ? next(error.message) : next(null, result);
    });
};

var updatePassword = function(user, newPassword, next){
    console.log("Reset Password to: " + newPassword);
    user.password = newPassword;
    user.save(function(err){
        return err ? next(err.message) : next(null);
    });
};


var resetPasswordByUserId = function(userId, newPassword, next){
    if(!userId || !newPassword){
        var err = new Error("User Identification, new password or old password does not exist");
        return next(err);
    }
    async.waterfall(
        [
            function findUser(callback) {
                User.findById(userId)   //check existing login user
                    .exec(function (error, user) {
                        if (error) {
                            console.log("User database error at watefall step 1");
                            return callback(error);   // error, navigate to error page.
                        } else {
                            console.log("User database running at watefall step 1");
                            return callback(null, user);
                        }
                    });
            },
            function CheckUserExist(user,callback) {
                if (user === null) {
                    console.log("User not found at watefall step 2");
                    let err = new Error('You are required to login');
                    //err.status = 400;
                    return callback(err);   // error, naviage to error page.
                }else {
                    console.log("User found at database at watefall step 2");
                    return callback(null, user);
                }
            }
        ],
        function RestPassword(err, user) {
            if(err){
                return next(err);
            }
            updatePassword(user, newPassword, function(err){
                if (err){
                    console.log("Rest Password error at watefall step 3");
                    return next(err);
                }else {
                    console.log("Rest Password success at watefall step 3");
                    return next(null, user);
                }
            });
        }
    );
};

var resetPasswordByEmail = function(user, EmailAddress, newPassword, next){
    // TODO: reset password via email, required new database table
    //       PasswordToke:
    //                      passwordToke id (send to user via email) uuid
    //                      expired date
    //                      user_id
    //
    // call reset password by user id after found password token table, make sure check the expired date

};

var resetPasswordByOldPassword = function(user, oldPassword, newPassword, next){
    // TODO: check existing user id with check password function, reset password to new password if ok to do



};


module.exports = {
    checkPassword: checkPassword,
    updatePassword: updatePassword,
    resetPasswordByUserId: resetPasswordByUserId
};