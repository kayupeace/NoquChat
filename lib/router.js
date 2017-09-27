'use strict';

var registrationRouter = require('./controllers/register');
var loginRouter = require('./controllers/login');
var userAccount = require("./controllers/user");
var facebookLogin = require('./controllers/Auth_facebook');
var isLogin = require('./validator/LoginState').isRequire;

module.exports = function(app) {
    app.use('/auth/facebook', facebookLogin);
    app.use('/registration', registrationRouter);
    app.use('/login', loginRouter);
    app.use('/user', isLogin, userAccount);  // need fix with style


    app.get('/test', function(req, res, next) {
        if (process.env.NODE_ENV === 'production'){
            return res.render('index');
        }else {
            console.log('GET: Login page');
            res.format({
                html: function () {
                    res.render('test', {
                        title: 'test'
                    });
                }
            });
        }
    });
};
