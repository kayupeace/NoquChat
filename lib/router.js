'use strict';

var registrationRouter = require('./controllers/register');
var loginRouter = require('./controllers/login');
var userAccount = require("./controllers/user");
var facebookLogin = require('./controllers/Auth_facebook');
var isLogin = require('./middlewares/LoginState').isRequire;
var API = require('./api/apiRouter');

module.exports = function(app) {
    // need to place at then end of every router to check login state, especially login/logout function
    app.use(function(req, res, next){
        //console.log("my session is: " + req.session);
        res.locals.session = !!(req.session && req.session.userId);
        next();
    });

    app.use('/auth/facebook', facebookLogin);
    // required to fixed up if user does not had email
    // Complete with spare(check out user.js in models) : ture index which allowed multiple document without the filed
    // specified so it can stored as not contain that filed, (null will end up with error)
    app.use('/registration', registrationRouter);
    app.use('/login', loginRouter);
    app.use('/user', isLogin, userAccount);  // need fix with style

    app.use('/api', API);

    // below are code need to remove in the future
    if (process.env.NODE_ENV === 'production'){
        // do nothing
    }else {
        let sy = require('./controllers/test');
        app.use('/asd', sy);
        app.get('/test', function(req, res, next) {
            res.format({
                html: function () {
                    res.render('test', {
                        title: 'test'
                    });
                }
            });
        });
    }

};

/**
 *
 *  TODO:
 *  1. Email verification to ensure the security
 *      1.1 User change their email address (verify)
 *      1.2 User registration with their email address
 *
 *  2. Login in with account
 *      account name: unique, required, string that only contain a-z and A-Z with Number
 *
 *  3. User Profile
 *      3.1 User Image Display
 *          table:
 *              User Profile
 *                  - Image Path
 *                  - Date and Birth
 *                  - Gender
 *                  - About
 *                  - Location 
 *      3.2 User Profile Page need to modify (currently is just template)
 *
 *  4.
 *
 */