'use strict';

var registrationRouter = require('./controllers/register');
var loginRouter = require('./controllers/login');
var facebookLogin = require('./controllers/Auth_facebook');

module.exports = function(app) {
    app.use('/auth/facebook', facebookLogin);
    app.use('/registration', registrationRouter);
    app.use('/user', loginRouter);
};