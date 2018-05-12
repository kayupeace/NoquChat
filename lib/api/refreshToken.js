'use strict';

var express = require('express'),
    router = express.Router();
const localToken = require(__base + 'lib/services/auth/token.js');


router.post('/:token', function (req, res) {
    if (req.get('Content-Type') === 'application/json') {
        let token = req.params.token;
        localToken.decodeToken(token, function(err, decoded) {
            if(err){
                return res.send({error: err.message})
            }else {
                localToken.refreshToken(decoded, function (err, newToken) {
                    return res.send({
                        token: newToken
                    })
                });
            }
        })
    } else {
        res.render('error-pages/404', { url: req.url });
    }
});

module.exports = router;