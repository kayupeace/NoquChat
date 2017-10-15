'use strict';

//var UserTable = require(__base + 'models/user.js');
// This is services file to manage user.js data

var resetPassword = function(user, newPassword, next){
    console.log("Reset Password to: " + newPassword);
    user.password = newPassword;
    user.save(function(err){
        if (err) {
            return next(err.message);
        }else {
            return next(null);
        }
    });
};

module.exports = {
    resetPassword: resetPassword
};