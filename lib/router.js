'use strict';

var registrationRouter = require('./controllers/register');
var loginRouter = require('./controllers/login');
//var userAccount = require("./controllers/user");
var facebookLogin = require('./controllers/Auth_facebook');
var isLogin = require('./middlewares/LoginState').isRequire;
var UserRouter = require('./router/user');
let Service = require('./router/service');
let TokenService = require("./router/token");

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
    app.use('/user', UserRouter);
    app.use('/service', Service);
    app.use('/api/token', TokenService);

    // below are code need to remove in the future
    if (process.env.NODE_ENV === 'production'){
        // do nothing
    }else {
        app.get('/test', function(req, res, next) {

            res.format({
                text: function(){
                    res.send('hey text');
                },

                html: function () {
                    res.render('test/test', {
                        title: 'test'
                    });
                },
                json: function(){
                    res.send({message: 'hey json' });
                }
            });


        });

        app.post('/test', function(req, res, next){
            console.log("post test");
            if(req.get('Content-Type') === 'application/json'){
                res.send({
                    message: 'post with json return result'
                })
            }else {
                console.log('redirect to test page');
                res.redirect('/test');
            }
            })

    }
    // end of it

};