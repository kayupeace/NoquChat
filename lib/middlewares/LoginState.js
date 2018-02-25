'use strict';

const localToken = require(__base + 'lib/services/auth/token.js');

module.exports = {
    // login validator middleware, required login
    isRequire: function requiresLogin(req, res, next) {
        // req.cookies.access_token
        // var header = req.headers.authorization.split(' ');
        // var token = header[1];
        let token = req.session.access_token;
        if(!token){  //check other possible storage location
            token = req.body.token || req.query.token || req.headers['x-access-token'];
        }

        if (!token) {  //if token is not exist
            let errorInfo = "You must be logged in to view this page.";
            let err = new Error(errorInfo);
            err.status = 401;
            req.session.error = errorInfo;
            return res.redirect("/login");
        } else {
            localToken.decodeToken(token, function(err, decoded){
                if(err){
                    let errorInfo = "You login state is expired";
                    let err = new Error(errorInfo);
                    err.status = 401;
                    req.session.error = errorInfo;
                    return res.redirect("/login");
                }else{
                    res.locals.session = true; //avoid session user id not verified (toke may exist but expired)
                    req.session.userId = decoded.sub; // for web application
                    // req.cookies.access_token
                    // req.headers  // as show above for cross platform auth
                    return next(null, decoded);
                }
            });
        }
    }
};


