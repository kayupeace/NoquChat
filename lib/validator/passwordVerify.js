'use strick';
var bcrypt = require('bcrypt');

var verfyPassword = function(user, password, next){
    "use strict";
    if(bcrypt.compareSync(password, user,password)){
        var error = 'Password does not match';
        var err = new Error('Password Does Not Match');
        return next(err, err.message);
    }else {
        return next(null);
    }
};

module.exports = {
    verfyPassword: verfyPassword
};