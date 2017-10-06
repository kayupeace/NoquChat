'use strict';

module.exports = {
    // login validator middleware, required login
    isRequire: function requiresLogin(req, res, next) {
        //console.log("check login state");
        if (req.session && req.session.userId) {
            return next();
        } else {
            //console.log("You haven't login yet!!!");
            var err = new Error('You must be logged in to view this page.');
            err.status = 401;
            return res.format({
                html: function () {
                    res.render('login', {
                        title: 'U need login'
                    });
                }
            });
            //return next(err);
        }
    }
};


