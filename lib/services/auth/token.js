'use strict';

const moment = require('moment');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

function encodeToken(user, next) {
    const payload = {
        //exp: moment().add(1, 'day').unix(),
        iat: moment().unix(),
        sub: user._id
    };
    let token = jwt.sign(
        payload,
        'i am kevin, this is secret',
        {expiresIn: 60*60 }
    );
    return next(null, token);
}

function decodeToken(token, next) {
    let payload = jwt.verify(token, 'i am kevin, this is secret', function(err, decoded){
        if(err) {
            return next(err);
        }else{
            return next(null, decoded);
        }
    });

    //const now = moment().unix();
    // check if the token has expired
    //if (now > payload.exp) callback('Token has expired.');
    //else callback(null, payload);
}

// this token need to be decode token
function refreshToken(token, next){
    const payload = {
        iat: token.iat,
        sub: token.sub
    };
    let newToken = jwt.sign(
        payload,
        'i am kevin, this is secret',
        {expiresIn: 60*60 }
    );
    return next(null, newToken);
}

function getToken(req, next){
    let token = req.session.access_token;
    if(!token){  //check other possible storage location
        token = req.body.token || req.query.token || req.headers['x-access-token'];
    }

    if(!token){
        let errorInfo = "Token not exist";
        let err = new Error(errorInfo);
        err.status = 401;
        return next(err, null);
    }else{
        return next(null, token);
    }
}

module.exports = {
    encodeToken,
    decodeToken,
    refreshToken,
    getToken,
};