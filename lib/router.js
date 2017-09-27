'use strict';

var registrationRouter = require('./controllers/register');
var loginRouter = require('./controllers/login');
var facebookLogin = require('./controllers/Auth_facebook');

var isLogin = require('./validator/LoginState').isRequire;

module.exports = function(app) {


    // need to move to new file basically
    app.get('/user/login', function(req, res, next) {
        console.log('GET: Login page');
        res.format({
            html: function () {
                res.render('user', {
                    title: 'login'
                });
            }
        });
    });

    app.use('/auth/facebook', facebookLogin);
    app.use('/registration', registrationRouter);
    app.use('/user', isLogin, loginRouter);  // need fix with style
};
