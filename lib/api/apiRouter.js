'use strict';

var userAccount = require("./internal/user");
var isLogin = require('../middlewares/LoginState').isRequire;
var express = require('express'),
    router = express.Router();

    //app.use('/auth/facebook', facebookLogin);
    // required to fixed up if user does not had email
    // Complete with spare(check out user.js in models) : ture index which allowed multiple document without the filed
    // specified so it can stored as not contain that filed, (null will end up with error)
    //app.use('/registration', registrationRouter);
    //app.use('/login', loginRouter);
    //app.use('/user', isLogin, userAccount);  // need fix with style
    //router.use('/login', loginRouter); // need fix with login state
    //router.use('/user', userAccount);

    router.get('/heroes', function(req, res, next){
        console.log("Api connected");
        const heroes = [
            { id: 11, name: '卧槽你，大傻逼' },
            { id: 12, name: 'Narco' },
            { id: 13, name: 'Bombasto' },
            { id: 14, name: 'Celeritas' },
            { id: 15, name: 'Magneta' },
            { id: 16, name: 'RubberMan' },
            { id: 17, name: 'Dynama' },
            { id: 18, name: 'Dr IQ' },
            { id: 19, name: 'Magma' },
            { id: 20, name: 'Tornado' }
        ];
        res.send(JSON.stringify(heroes));
    });

module.exports = router;