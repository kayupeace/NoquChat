'use strict';
let RestPasswordToken = require(__base + 'models/resetPasswordToken.js');
const uuidv4 = require('uuid/v4');
const oneDay = 1000 * 60 * 60 * 24 * 1;

let getAllRestPasswordToken = function(next){
    RestPasswordToken
        .find({})
        .sort({create_at: "desc"})
        .exec(function(err, tokens) {
            if (err) {
                console.log(err.message);
                return(err)
            }
            return next(null, tokens);
        })
};

let getTokenByUserId = function(user_id, next) {

    RestPasswordToken
        .findOne({owner: user_id})
        .exec(function(err, token) {
            if (err) {
                console.log(err.message);
                return(err)
            }
            return next(null, token);
        })
};

let getTokenByTokenId = function(token_id, next) {

    RestPasswordToken
        .findOne({token: token_id})
        .exec(function(err, token) {
            if (err) {
                console.log(err.message);
                return(err)
            }
            return next(null, token);
        })
};

let newToken = function(user_id,token, next){
     let newToken = RestPasswordToken({
                            token: token,
                            expired_at: new Date(),
                            done: 0,
                            owner: user_id
                        });

    RestPasswordToken.create(newToken, function(err, token) {
            if (err) {
                return next(err)
            }
            return next(null, token);
        });
};

// 0 is reset, 1 is increase confirm
let editTokenConfirm = function(user_id, next){
    RestPasswordToken
        .findOne({
        owner : user_id,
        })
        .populate('owner')
        .exec(function (err, token) {
            let isSameDay = (Date.now() - token.create_at) <= oneDay;
            if(err){
                return next(err);
            }else if(!token){
                let errorInfo = "Token Not Exist";
                let customerError = new Error(errorInfo);
                return next(customerError, null);
            }else {
                if(isSameDay && token.numberOfConfirm == 3){
                    let errorInfo = "Please notice that: For security reasons, this account have reach the maximum attemp (3)times, you'll have to wait one day (24h) before try again.";
                    let customerError = new Error(errorInfo);
                    //token.numberOfConfirm = 1;
                    //token.save();
                    return next(customerError);
                    //return next(null, token);
                }else {
                    if(!isSameDay){
                        //last confirm is greater than one day, reset confirm and create token day
                        token.numberOfConfirm = 1;
                        token.done = 0;
                        token.create_at = Date.now();
                    }else{
                        const my_uuid = uuidv4();
                        token.token = my_uuid;
                        token.numberOfConfirm = token.numberOfConfirm + 1;
                        token.done = 0;
                    }
                    token.save(function (err) {
                        if (err) {
                            return next(err);
                        }
                        else {
                            return next(null, token);
                        }
                    });
                }
            }
        })
};



module.exports = {
    getAllRestPasswordToken: getAllRestPasswordToken,
    getTokenByUserId: getTokenByUserId,
    getTokenByTokenId,
    newToken: newToken,
    editTokenConfirm,
};
