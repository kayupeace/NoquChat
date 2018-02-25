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
        {expiresIn: 60*60*24 }
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

module.exports = {
    encodeToken,
    decodeToken
};