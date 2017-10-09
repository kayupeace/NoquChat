'use strict';

var registrationRouter = require('./controllers/register');
var loginRouter = require('./controllers/login');
var userAccount = require("./controllers/user");
var facebookLogin = require('./controllers/Auth_facebook');
var isLogin = require('./validator/LoginState').isRequire;

module.exports = function(app) {
    // need to place at then end of every router to check login state, especially login/logout function
    app.use(function(req, res, next){
        //console.log("my session is: " + req.session);
        res.locals.session = !!(req.session && req.session.userId);
        next();
    });

    app.use('/auth/facebook', facebookLogin);
    // required to fixed up if user does not had email
    // TODO: Complete with spare : ture index which allowed multiple document without the filed
    // TODO: specified so it can stored as not contain that filed, (null will end up with error)

    app.use('/registration', registrationRouter);
    app.use('/login', loginRouter);
    app.use('/user', isLogin, userAccount);  // need fix with style

    app.get('/test', function(req, res, next) {
        if (process.env.NODE_ENV === 'production'){
            return res.render('index');
        }else {
            res.format({
                html: function () {
                    res.render('test', {
                        title: 'test'
                    });
                }
            });
        }
    });

    //var sy = require('./controllers/test');
    //app.use('/asd', sy);
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